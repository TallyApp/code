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
    enabled: true,
    total: 0
  };

  var _init = function _init() {
    console.log('init client');

    chrome.runtime.sendMessage({ action: "settings" }, function(response) {
      settings = response.settings;

      if (!settings.enabled) {
        board.enabled = false;
      }

      chrome.extension.onMessage.addListener(function(msg, sender, sendResponse) {
        console.log('Message received', msg.action);
      });

      // Add the Tally button
      _updateBoardButton();

      console.log('injected');
    });
  };

  var _updateBoardButton = function _updateBoardButton() {
    var iconURL = board.enabled ? _getURL('icons/browsericons/icon38.png') : _getURL('icons/browsericons/icon38-off.png');
    
    if ($('.tallyBoardButton').length === 0) {
      var template = _.template('<span class="tallyBoardButton"><a href="#"><img src="<%= icon %>"></a><span class="tallyPrice" /></span>');
      var compiled = template({ icon: iconURL });

      $('div.boardButtons').prepend(compiled);
      $('.tallyBoardButton a').click(_toggleTally);
    }
    else {
      $('.tallyBoardButton img').attr('src', iconURL);
    }

    board.enabled ? $('.tallyBoardButton .tallyPrice').show() : $('.tallyBoardButton .tallyPrice').hide();
  };

  var _toggleTally = function _toggleTally() {
    if (!settings.enabled) {
      return;
    }

    board.enabled = !board.enabled;

    _updateBoardButton();

    return false;
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