// INIT
document.addEventListener('DOMContentLoaded', function () {
  load_message_table();
  load_accounts_table();

  var open_options_button = document.querySelector('#open_options_button');
  open_options_button.addEventListener('click', open_options_page);
  init_message_ui();
  init_tab_ui();

});
