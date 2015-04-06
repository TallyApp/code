/**
 * @file Tally Chrome Extension
 * @name Tally
 *
 * Tally extension background code.
 *
 * @author Tally Team 
 */
'use strict';

var Tally = (function() {

var settings = {
  enabled: true
};

var noop = function noop() {};

var _init = function _init() {
  chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    if (request.sender === 'tally-client' && request.action === 'settings-get') {
      sendResponse({ settings: settings });
    }
  });
  
  chrome.browserAction.onClicked.addListener(function(tab) {
    settings.enabled = !settings.enabled;

    _updateIcon();
    _saveOption('tallySettings', settings, noop);

    _toggleTabs();
  });

  _loadOption('tallySettings', function loadCallback(value) {
    if (value !== undefined) {
      settings = value;
      _updateIcon();
    }
  });

  _updateIcon();

  chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab) {
    if (changeInfo.status !== 'complete')
    console.log('updated');
    chrome.tabs.sendMessage(tabId, { action: 'tab_updated' }, function(response) { console.log(response); });
    console.log(tab.url);
  });

  chrome.tabs.onCreated.addListener(function(tabId, changeInfo, tab) {         
    console.log('created');
    chrome.tabs.sendMessage(tabId, { action: 'tab_created' }, function(response) { console.log(response); });
    console.log(tab.url ? tab.url : '');
  });

  chrome.tabs.onActivated.addListener(function(activeInfo) {         
    console.log('activated');
    chrome.tabs.get(activeInfo.tabId, function callback(tab) {
      chrome.tabs.sendMessage(tab.id, { action: 'tab_activated' }, function(response) { console.log(response); });
      console.log(tab.url);
    });
  });
};

var _toggleTabs = function _toggleTabs() {
  chrome.tabs.query({}, function(tabs) {
    var message = { sender: 'tally', action: 'settings-update', settings: settings };

    for (var i = 0; i < tabs.length; ++i) {
      chrome.tabs.sendMessage(tabs[i].id, message);
    }
  });
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