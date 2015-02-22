// Hack to detect if its already been run
if (!$("span.tallyTitle").length) {

  var pins = $('div.item').has('a.richPinMetaLink');

  var total = 0;

  // tallyTitle
  $('h1.boardName').append(' <span class="tallyTitle" />');
  $('h2.smallBoardName').append(' <span class="tallyTitle" />');

  // tallyBar
  var barTemplate = '<span class="value"></span><span class="label"></span>';
  $('div.pinsAndFollowerCount').css('width', '400px');
  $('div.pinsAndFollowerCount ul').append('<li class="tallyedPins">'+ barTemplate +'</li>');

  $('li.tallyedPins span.label').html('Pins Tallied');
  $('li.tallyedPins span.value').html(pins.length);

  pins.each(function( index, pin ) {

      var url = 'https://www.pinterest.com' + $('a.richPinMetaLink', pin).attr('href');

      $.ajax({
        type: 'GET',
        url: url,
        dataType: "json",
        success: function(data) {
          var product = data.resource_data_cache[0].data.rich_metadata.products[0];
          var price = product.offer_summary.price;

          total = total + Number(price.substring(1));

          var tallyDiv = $( "<div class='tally' style='float: right; margin: 15px 5px 5px 5px;'/>" );
          tallyDiv.append("<span class='price'>Tally : "+ price + "</div>");

          $('div.pinWrapper div.pinCredits', pin).prepend(tallyDiv);

          $('span.tallyTitle').html('$' + total.toFixed(2));
        }
      });
  });

}
