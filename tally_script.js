// Hack to detect if its already been run
if ($("span.tallyTitle").length) {
  $("span.tallyTitle").remove();
  $("li.tallyedPins").remove();
  $("div.tally").remove();
}

var pins = $('div.item').has('div.pinHolder');

var total = 0;

// tallyTitle
var tallyTitle = '<span class="tallyTitle" style="color:#156584; margin-right:4px; font-size:1.1em; position:relative; top:2px;"><img style="height: 22px; padding-bottom: 4px;" src="https://rawgit.com/TallyApp/code/master/icons/tally_icon_32x32.png"> <span class="tallyPrice" /></span>';
$('div.boardButtons').prepend(tallyTitle);

// tallyBar
var barTemplate = '<span class="value"></span><span class="label"></span>';
$('div.pinsAndFollowerCount').css('width', '300px');
$('div.pinsAndFollowerCount ul').append('<li class="tallyedPins">'+ barTemplate +'</li>');

$('li.tallyedPins span.label').html('Pins Tallied');
$('li.tallyedPins span.value').html(pins.length);

var tallyDiv = "<div class='tally' style='float: right; margin: 15px 5px 5px 5px; font-size: 13px; font-weight: normal;'><img style='padding-bottom: 3px;' src='https://rawgit.com/TallyApp/code/master/icons/tally_icon_16x16.png'> <span class='price'>";

pins.each(function( index, pin ) {
  // Rich pin lookup
  if ($('a.richPinMetaLink', pin).length) {

    var url = 'https://www.pinterest.com' + $('a.richPinMetaLink', pin).attr('href');

    $.ajax({
      type: 'GET',
      url: url,
      dataType: "json",
      success: function(data) {
        var product = data.resource_data_cache[0].data.rich_metadata.products[0];
        if (product) {
          var price = product.offer_summary.price;

          total = total + Number(price.substring(1));

          if (!$('div.pinWrapper div.pinCredits .tally', pin).length) {
            $('div.pinWrapper div.pinCredits', pin).prepend(tallyDiv + price + '</div></div>');
          }

          $('span.tallyTitle span.tallyPrice').html('$' + total.toFixed(2));
        }
      }
    });
  }
  // Otherwise try to pull price out of the description
  else {
    var description = $('p.pinDescription', pin).html();
    if (description){
      var priceMatch = description.match(/[\W\D]\d+(\.\d+)?/);
      if (priceMatch) {
        var price = priceMatch[0];
        total = total + Number(price.substring(1));

        if (!$('div.pinWrapper div.pinCredits .tally', pin).length) {
          $('div.pinWrapper div.pinCredits', pin).prepend(tallyDiv + price + '</div></div>');
        }

        $('span.tallyTitle span.tallyPrice').html('$' + total.toFixed(2));
      }
    }
  }
});
