import urlLib from 'url';
import Q from 'q';

window.AttentionMonitor = (function createApp() {
  // PRIVATE
  function getFocusedTabId() {
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
        [domain]: (timeSpent[domain] || 0) + 1
      })
    })
  }

  function logBrowsingTime() {
    chrome.windows.getCurrent(window => {
      if (window.focused) {
        getFocusedTabId()
        .then(getTabUrl)
        .then(incrementTimeSpent)
      }
    });
  }

  function getOrderedList(length) {
    chrome.storage.local.get(e => {
      var sortedData = Object.keys(e).map(key => {
        return [
          key,
          e[key]
        ];
      }).sort((a, b) => {
        return b[1] - a[1];
      }).map((e, i) => {
        return {
          [e[0]]: e[1]
        };
      }).filter((e, i) => {
        if (i < length) {
          console.log(e);
          return true;
        }
      });

      // console.log(sortedData);
    });
  }

  (function init() {
    // Log extension install date to calculate start time of data collection
    chrome.storage.sync.get('startTime', startTime => {
      if (Object.keys(startTime).length === 0) {
        chrome.storage.sync.set({startTime: new Date().getTime()})
      }
    });

    // Kick off listening and logging seconds towards websites
    setInterval(logBrowsingTime, 1000);
  })()

  return {
    getOrderedList
  };
})();