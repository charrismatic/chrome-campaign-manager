// TODO: HANDLE KEYBOARD INPUT ON ACCOUNT ENTRY
// - PRESS ENTER BUTTON TO SUBMIT ROW

// INIT
var account_manager = new AccountManager({});
document.addEventListener('DOMContentLoaded', function () {
  load_accounts_table();
  init_message_ui();
  init_tab_ui();
});
