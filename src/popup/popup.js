// INIT LOCAL STORAGE
var storage = chrome.storage.local;
var message = document.querySelector('#message');

storage.get('css', function(items) {
  console.log(items);

  if (items.css) {
    chrome.tabs.insertCSS({code: items.css},
      function() {
        if (chrome.runtime.lastError) {
          message.innerText = 'Not allowed to inject CSS into special page.';
        } else {
          message.innerText = 'Injected style!';
        }
      });
  } else {
    var optionsUrl = chrome.extension.getURL('options.html');
    message.innerHTML = 'Set a style in the <a target="_blank" href="'
        + optionsUrl
        + '">options page</a> first.';
    }
});
