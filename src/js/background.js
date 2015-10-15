import urlLib from 'url';
import Q from 'q';

function getActiveTabId() {
  const deferred = Q.defer();
  chrome.tabs.query({active: true, currentWindow: true}, tabs => {
    deferred.resolve(tabs[0].id);
  });
  return deferred.promise
};

function getTabUrl(tabId) {
  const deferred = Q.defer();
  chrome.tabs.get(tabId, tab => {
    deferred.resolve(urlLib.parse(tab.url).hostname);
  });
  return deferred.promise
}

function incrementTimeSpent(domain) {
  chrome.storage.local.get(domain, timeSpent => {
    chrome.storage.local.set({
      [url]: (timeSpent[url] || 0) + 1
    })
  })
}

function logBrowsingTime() {
  chrome.windows.getCurrent(window => {
    if (window.focused) {
      getActiveTabId()
      .then(getTabUrl)
      .then(incrementTimeSpent)
    }
  });
}

// Log extension install date to calculate start time of data collection
chrome.storage.sync.get('startTime', startTime => {
  if (Object.keys(startTime).length === 0) {
    chrome.storage.sync.set({startTime: new Date().getTime()})
  }
});

// Kick off listening and logging seconds towards websites
setInterval(logBrowsingTime, 1000);
