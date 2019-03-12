// STORAGE

function save_css () {
  var cssCode = textarea.value;
  if (!cssCode) {
    message('Error: No CSS specified');
    return;
  }
  storage.set({
    'css': cssCode
  }, function(){
    message('css saved')
  });
}

function load_css () {
  storage.get('css', function(items) {
    if (items.css) {
      textarea.value = items.css;
      message('css loaded ');
    }
  });
}


function message (msg) {
  var message = document.querySelector('.message-notification');
  message.innerText = msg;
  setTimeout(function(){message.innerText = ''}, 3000);
}


function reset_css () {
  storage.remove('css', function(items) {
    message('Reset stored CSS');
  });
  textarea.value = '';
}

function save_macro () {
  chrome.storage.local.set({key: value}, function() {
    console.log('Value is set to ' + value);
  });
}


chrome.storage.local.get(['key'], function(result) {
  console.log('Value currently is ' + result.key);
});


var storage = chrome.storage.local;
var resetButton = document.querySelector('button.reset');
var submitButton = document.querySelector('button.submit');
var textarea = document.querySelector('textarea');

load_css();
resetButton.addEventListener('click', reset_css);
submitButton.addEventListener('click', save_css);
