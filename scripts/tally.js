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
  var board = {
    id: undefined,
    enabled: true,
    total: 0
  };

  var _init = function _init() {
    console.log('init client');
    chrome.extension.onMessage.addListener(function(msg, sender, sendResponse) {
      console.log('Message received', msg.action);
    });

    // Add the Tally button
    var boardTemplate = $('<span class="tallyTitle" style="color:#156584; margin-right:4px; font-size:1.1em; position:relative; top:2px;"><a href="#"><img style="height: 22px; padding-bottom: 4px;" src="https://rawgit.com/TallyApp/code/master/icons/tally_icon_32x32.png"></a><span class="tallyPrice" /></span>');
    $('div.boardButtons').prepend(boardTemplate);
    console.log('injected');
  };

  return {
    init: function init () {
      _init();
    }
  };
})();

TallyClient.init();