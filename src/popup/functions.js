
// INJECT INDIVIDUAL FUNCTION
function load_content_function () {
  chrome.runtime.onMessage.addListener(
    function(message, callback) {
      if (message == 'changeColor'){
        chrome.tabs.executeScript({
          code: 'document.body.style.backgroundColor="orange"'
        });
      }
  });
}

// INJECT FILE
function load_content_script () {
  chrome.runtime.onMessage.addListener(
    function(message, callback) {
      if (message == 'runContentScript'){
        chrome.tabs.executeScript({
          file: 'inject.js'
        });
      }
   });
}
/// UTILITIES
// ========================
function log_to_user(string){
  chrome.devtools.inspectedWindow.eval(
    'console.log('+JSON.stringify(string)+')',
    function(result, isException) {
      if (isException) {
        console.log('%c [log_to_user] Exception', 'color: red');
        console.log(result, isException);
      } else {
        console.log('[log_to_user]', result);
      }
    }
  );
}
function log_status(status) {
  console.log('%c PROCESSING RESULTS', 'color:green');
  console.log(status);
}
function isValidPrefix(prefix) {
  var validator = /^[a-z][a-z0-9.\-_:]*$/i;
  return validator.test(prefix);
}
