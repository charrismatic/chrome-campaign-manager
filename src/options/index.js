// TODO: HANDLE KEYBOARD INPUT ON ACCOUNT ENTRY
// - PRESS ENTER BUTTON TO SUBMIT ROW


// INIT
document.addEventListener('DOMContentLoaded', function () {
  load_accounts_table();
  load_message_table();

  var textarea = document.querySelector('textarea');

  var add_account_button = document.querySelector('#add-account-button');
  add_account_button.addEventListener('click', add_account);

  var add_message_button = document.querySelector('#add-message-button');
  add_message_button.addEventListener('click', add_message);
});
