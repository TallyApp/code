/**
 * @file Tally Chrome Extension
 * @name Tally
 *
 * Tally extension background code.
 *
 * @author Tally Team 
 */

var Tally = (function() {

'use strict';

var settings = {
  enabled: true
};

var noop = function noop() {};

var _init = function _init() {
  chrome.browserAction.onClicked.addListener(function(tab) {
    settings.enabled = !settings.enabled;

    // chrome.tabs.executeScript(null, { file: "tally_script.js" });

    _updateIcon();
    _saveOption('tallySettings', settings, noop);
  });

  _loadOption('tallySettings', function loadCallback(value) {
    if (value !== undefined) {
      settings = value;
      _updateIcon();
    }
  });

  _updateIcon();
};

var _updateIcon = function _setIcon() {
  var iconPaths = settings.enabled ?
    { '19': 'icons/browsericons/icon19.png',     '38': 'icons/browsericons/icon38.png' } :
    { '19': 'icons/browsericons/icon19-off.png', '38': 'icons/browsericons/icon38-off.png' };

  chrome.browserAction.setIcon({ path: iconPaths });
};

var _saveOption = function _saveOption(key, value, callback) {
  localStorage.setItem(key, value);

  var store = {};
  store[key] = value;
  chrome.storage.sync.set(store, callback);
};

var _loadOption = function _loadOption(key, callback) {
  chrome.storage.sync.get(key, function getCallback(items) {
    if (chrome.runtime.lastError) {
      console.warn(chrome.runtime.lastError.message);
      return callback(localStorage.getItem(key));
    }
    
    if (items[key] === undefined) {
      return callback(localStorage.getItem(key));
    }
    else {
      return callback(items[key]);
    }
  });
};

return {
  init: function init () {
    _init();
  }
};

})();

Tally.init();

// chrome.browserAction.onClicked.addListener(function(tab) {
//   chrome.tabs.executeScript(null, { file: "tally_script.js" });
// });

// chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab) {
//   console.log('updated');
//   console.log(tab.url);
// });

// chrome.tabs.onCreated.addListener(function(tabId, changeInfo, tab) {         
//   console.log('created');
//   console.log(tab.url);
// });

// chrome.tabs.onActivated.addListener(function(activeInfo) {         
//   console.log('activated');
//   chrome.tabs.get(activeInfo.tabId, function callback(tab) {
//     console.log(tab.url);
//   });
// });