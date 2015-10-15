import urlLib from 'url';

chrome.storage.sync.get('startTime', data => {
  if (Object.keys(data).length === 0) {
    chrome.storage.sync.set({startTime: new Date().getTime()})
  }
});

setInterval(() => {
  chrome.windows.getCurrent(window => {
    if (window.focused) {
      chrome.tabs.query({active: true ,currentWindow: true}, tabs => {
        chrome.tabs.get(tabs[0].id, tab => {
          const url = urlLib.parse(tab.url).hostname;
          chrome.storage.local.get(url, data => {
            Object.keys(data).length === 0 ?
            chrome.storage.local.set({[url]: 1}) :
            chrome.storage.local.set({[url]: data[url] + 1})
          })
        });
      });
    }
  });
}, 1000);