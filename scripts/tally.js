/**
 * @file Tally Chrome Extension
 * @name Tally
 *
 * Tally extension main code.
 *
 * @author Tally Team 
 */
'use strict';

var TallyClient = (function() {
  var settings = {
    enabled: true
  };

  var board = {
    id: undefined,
    user: undefined,
    enabled: true,
    total: 0
  };

  var cache = {};

  var tallyPinTemplate;

  var _init = function _init() {
    console.log('init client');

    tallyPinTemplate = _.template('<div class="tallyPin"><img src="<%= icon %>"><span class="price">$<%= price %></span></div>');

    board.id = _getBoardID();
    board.user = _getUser();

    chrome.runtime.sendMessage({ sender: 'tally-client', action: 'settings-get' }, function(response) {
      console.log('got response');
      settings = response.settings;

      chrome.extension.onMessage.addListener(function(msg, sender, sendResponse) {
        console.log('Message received', msg.action);
      });

      _updateBoardButton();

      if (settings.enabled && board.enabled) {
        _updateStats();
      }

      console.log('injected');
    });

    chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
      console.log('got message');
      if (request.sender !== 'tally') {
        return;
      }

      if (request.action === 'settings-update') {
        settings = request.settings;

        _updateBoardButton();

        if (settings.enabled && board.enabled) {
          _updateStats();
        }
      }
    });
  };

  var _toggleTally = function _toggleTally() {
    if (!settings.enabled) {
      return false;
    }

    board.enabled = !board.enabled;

    _updateBoardButton();
    _updateStats();

    return false;
  };

  var _updateStats = function _updateStats() {
    console.log('updating stats');

    board.total = 0;

    cache[board.user] = cache[board.user] ? cache[board.user] : {};
    cache[board.user][board.id] = cache[board.user][board.id] ? cache[board.user][board.id] : {};

    var pins = $('div.item').has('div.pinHolder');
    pins.each(function eachPin(index, pin) {
      _getPinPrice(pin);
    });
  };

  var _getUser = function _getUser() {
    if ($('.BoardPage').length) {
      return window.location.pathname.split('/')[1];
    }

    return '';
  };

  var _getBoardID = function _getBoardID() {
    if ($('.BoardPage').length) {
      return window.location.pathname.split('/')[2];
    }

    return '';
  };

  var _getPinID = function _getPinID(pin) {
    if ($('.pinHolder > a').length > 0) {
      return $('.pinHolder > a').attr('href').replace(/\//g, '').replace(/pin/, '');
    }

    return '';
  };

  var _getPinPrice = function _getPinPrice(pin) {
    pin.pinID = _getPinID(pin);

    if (cache[board.user][board.id][pin.pinID]) {
      console.log('cache hit');
      board.total = board.total + cache[board.user][board.id][pin.pinID];
      _updatePinDisplay(pin);
      _updateTotal();
      return;
    }

    console.log('cache miss');
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
            _updatePinPrice(pin, product.offer_summary.price);
            _updatePinDisplay(pin);
            _updateTotal();
          }
        }
      });
    }
    // Otherwise try to pull price out of the description
    else {
      var description = $('p.pinDescription', pin).html();
      if (description) {
        var priceMatch = description.match(/[\$\£\€](\d+(?:\.\d{1,2})?)/);
        if (priceMatch) {
          _updatePinPrice(pin, priceMatch[0]);
          _updatePinDisplay(pin);
          _updateTotal();
        }
      }
    }
  };

  var _updatePinPrice = function _updatePinPrice(pin, priceString) {
    var price = Number(priceString.substring(1));

    board.total = board.total + price;
    cache[board.user][board.id][pin.pinID] = price;
  };

  var _updatePinDisplay = function _updatePinDisplay(pin) {
    var price = cache[board.user][board.id][pin.pinID];

    if (!$('div.pinWrapper div.pinCredits .tallyPin', pin).length) {
      var pinTemplate = tallyPinTemplate({ icon: _getURL('icons/browsericons/icon19.png'),  price: price.toFixed(2) });
      $('div.pinWrapper div.pinCredits', pin).prepend(pinTemplate);
    }
    else {
      $('span.price', pin).html('$' + price.toFixed(2));
    }
  };

  var _updateTotal = function _updateTotal() {
    $('span.tallyBoardButton span.tallyTotal').html('$' + board.total.toFixed(2));
  };

  var _updateBoardButton = function _updateBoardButton() {
    var iconURL = '';
    var stateClass = '';

    if (!settings.enabled) {
      iconURL = _getURL('icons/browsericons/icon38-off.png');
      stateClass = 'tally-off';
    }
    else {
      iconURL = board.enabled ? _getURL('icons/browsericons/icon38.png') : _getURL('icons/browsericons/icon38-off.png');
      stateClass = board.enabled ? 'tally-on' : 'tally-off';
    }
    
    if ($('.tallyBoardButton').length === 0) {
      var template = _.template('<span class="tallyBoardButton"><a href="#"><img src="<%= icon %>"></a><span class="tallyTotal" /></span>');
      var compiled = template({ icon: iconURL });

      $('div.boardButtons').prepend(compiled);
      $('.tallyBoardButton a').click(_toggleTally);
    }
    else {
      $('.tallyBoardButton img').attr('src', iconURL);
    }

    $('body').removeClass('tally-on tally-off').addClass(stateClass);
  };

  var _getURL = function _getURL(file) {
    return chrome.extension.getURL(file);
  };

  return {
    init: function init () {
      _init();
    }
  };
})();

TallyClient.init();