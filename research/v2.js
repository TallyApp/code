// Builds the data for first 250 pins

// Build the data object
var data = {};
data.on = 1;
data.name = '';
data.id = '';
data.url = '';
data.exp = '';
data.t_pins = 0;
data.t_prods = 0;
data.pins = {};
data.total = 0;
data.budget = 0;
// id => {price(p), count(c)}

var main = function() {

    // First we need to callback self, to get the board_id
    var board_id = 0;
    $.ajax({
        type: 'GET',
        url:  document.URL,
        dataType: "json",
        success: function(resp) {

            data.id = resp.resource_data_cache[0].data.id;
            data.name = resp.resource_data_cache[0].data.name;
            data.url = resp.resource_data_cache[0].data.url;

            loadBoardData();
        }
    });
};

var loadBoardData = function() {
    // Go get the full board resource to the max 250 results
    $.ajax({
      type: 'GET',
      url: 'https://www.pinterest.com/resource/BoardFeedResource/get/?source_url='+ data.url +'&data={"options":{"board_id":"'+ data.id +'","page_size":250},"context":{}}&_=0',
      dataType: "json",
      success: function(resp) {
        data.t_pins = resp.resource_data_cache[0].data.length;

        $(resp.resource_data_cache[0].data).each(function(index, pin) {

            if (pin.price_value) {
                data.pins[pin.id] = {id: pin.id, t : pin.title, p: pin.price_value};
            }
            else if (pin.rich_summary && pin.rich_summary.type_name == "product") {
                data.pins[pin.id] = {id: pin.id,  t : (pin.title ? pin.title : pin.description)};
            }
        });

        // fugly done hack
        var doneHack = function(building) {
            if (Object.keys(building).length === 0) {
                // sum the data
                $.each(data.pins, function(id, pin) {
                    data.total = data.total + pin.p;
                });

                console.log(data);
            }
        };

        // Load price data if its needed
        var building = {};
        $.each(data.pins, function(id, pin) {

            data.t_prods += 1;

            if (!pin.p) {
                building[pin.id] = 1;
                $.ajax({
                    type: 'GET',
                    url:  'https://www.pinterest.com/pin/' + pin.id,
                    dataType: "json",
                    success: function(resp) {
                        var product = resp.resource_data_cache[0].data.rich_metadata.products[0];
                        var price = Number(product.offer_summary.price.substring(1));

                        data.pins[id].p = price;
                        delete building[pin.id];
                        doneHack(building);
                    },
                    failure: function(resp) {
                        delete building[pin.id];
                    }
                });
            }
        });
      }
    });
};

main();
