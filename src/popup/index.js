function open_options_page () {
  chrome.tabs.create({'url': "/options/index.html" } )
}

// INIT
document.addEventListener('DOMContentLoaded', function () {
  var open_options_button = document.querySelector('#open_options_button');
  console.log('popup loaded');
  console.log('open_options_button',open_options_button );
  open_options_button.addEventListener('click', open_options_page);
});
