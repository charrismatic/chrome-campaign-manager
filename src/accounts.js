

/*
 * ACCOUNT DATA FUNCTIONS
 */

// RETURNS DATA MODEL FOR ACCOUNT DATA

class AccountManager {
  constructor(accounts) {
      this.accounts = accounts;
      this.snapshot = Object.create(null);
      this.key = "accounts";
  }

  get_account_model() {
    return {
      id: '',
      name: '',
      location: '',
      url: '',
      website: '',
    }
  }

  get_accounts() {

  }
}


const format_account_id = (id) => {
  return id.replace(/-/g,'_').toLowerCase();
}



const load_accounts_table = () => {

  chrome.storage.local.get('accounts', function(data){

    // HANDLE EMPTY DATA AND RESET
    if (Object.keys(data).length < 1 ) {
      init_account_data();
    } else {
      var account_data = data.accounts;
      for (item of Object.keys(account_data)){
        append_html(
          get_account_row(account_data[item]), {
            tagName: 'div',
            target: '#account_table_content',
            className: 'account hover-controls flex',
            id: item
          }
        )
      }

      init_test_selector();
      init_account_table_ui();
      account_manager.accounts = account_data;
    }
  })
};


const save_account_storage = (data) => {
  if (!data) {
    message('Error: Data not specified');
    return;
  }

  chrome.storage.local.set({
    'accounts': data
  }, function(){
    message('accounts saved')
  });
};



const get_account_row =  (item) => {
  return `
    <div class="input-field account_id">${item.id}</div>
    <div class="input-field account_name">${item.name}</div>
    <div class="input-field account_location">${item.location}</div>
    <div class="controls">
      <button class="edit-button icon icon-edit">
        <span class="sra-text">${s.EDIT_MESSAGE}</span>
      </button>
      <button class="remove-button icon icon-close">
        <span class="sra-text">${s.DELETE_MESSAGE}</span>
      </button>
      <button class="cancel-edit icon icon-undo">
        <span class="sra-text">${s.CANCEL_MESSAGE}</span>
      </button>
      <button class="save-edit icon icon-save">
        <span class="sra-text">${s.SAVE_MESSAGE}</span>
      </button>
    </div>
  `;
};


const accounts_table_add_row = (data) => {
  append_html(
    get_account_row(data), {
      tagName: 'tr',
      target: '#accounts_table tbody',
      className: 'account',
      id: `account-row-${item.id}`,
  });
  return true;
};


const get_account_row_get_data = (node) => {
  var fields = node.querySelectorAll('.input-field');
  var data = {};
  for (field of fields) {
    if (field.classList.contains('account_id')){
      data.id = field.innerText;
    };
    if (field.classList.contains('account_location')){
      data.location = field.innerText;
    }
    if (field.classList.contains('account_name')){
      data.name = field.innerText;
    }
  }
  return data;
}


/**
 *  add_account
 *  Main function to add new records to account storage
 *  Handles basic type checking and validition
 */

const add_account = (ev) => {
  ev.stopPropagation();

  var form = document.forms['account_form'];

  // CHECK FORM VALIDATION
  if (! form.checkValidity()){
    message('form is not valid');
    return false;
  }

  var form_data = process_form(form);

  var form_account_data = {
    id:form_data.account_id,
    name: form_data.account_name,
    location: form_data.account_location
  };

  var success = accounts_table_add_row(form_account_data);

  if (success) {
    form.reset();
    chrome.storage.local.get('accounts', function(data){
      var new_id = format_account_id(form_account_data.id);
      data.accounts[new_id] = form_account_data;
      save_account_storage(data.accounts);

      document.querySelector('#account_table_content').innerHTML = "";
      load_accounts_table();
      return true;
    });
  }
  return false;
}


const edit_account = (ev) => {
  ev.stopPropagation();

  var node = ev.target.parentElement.parentElement;
  var account_snapshot = get_account_row_get_data(node);
  account_manager.snapshot = account_snapshot;

  var inputs = node.querySelectorAll('.input-field');

  // COMPLETE CURRENT EDIT EVENT
  if (window.form_is_editing) {
    var current_edit = document.querySelector('.account.editable');
    var edit_fields = current_edit.querySelectorAll('.input-field');
    for (input of edit_fields) {
      toggle_editable(input);
    }
    current_edit.classList.remove('editable');
  }

  node.classList.toggle('editable');
  for (input of inputs) {
    toggle_editable(input);
  }
  inputs[0].focus();

}



const update_edit_account_storage = (id) => {

  const MESSAGE_ID_PREFIX = 'account-row-';
  var account_id = parseInt(id.replace(MESSAGE_ID_PREFIX, ''));
  chrome.storage.local.get('accounts', function(data){

    delete data.accounts[account_id];

    var message_array = [];
    var index = 0;
    for (item of data.accounts) {
      if (item) {
        message_array.push({
          id: '',
          name: '',
          location: '',
        });

        index = index + 1;
      }
    }

    // save_message_storage(message_array);
    return true;
  });

}


const save_account_edit = (ev) => {
  ev.stopPropagation();

  var node = ev.target.parentElement.parentElement;

  var inputs = node.querySelectorAll('.input-field');

  // COMPLETE CURRENT EDIT EVENT
  if (window.form_is_editing) {
    var current_edit = document.querySelector('.account.editable');
    var edit_fields = current_edit.querySelectorAll('.input-field');
    for (input of edit_fields) {
      toggle_editable(input);
    }
    current_edit.classList.remove('editable');
  }

  var account_snapshot = get_account_row_get_data(node);
  account_manager.accounts[node.id] = account_snapshot;
  chrome.storage.local.set({'accounts': account_manager.accounts}, function(){
    document.querySelector('#account_table_content').innerHTML = "";
    load_accounts_table();
  });

}


const remove_account = (ev) => {
  ev.stopPropagation();

  var node = ev.target.parentElement.parentElement;

  if (! node.classList.contains('account')){
    console.log('There was an issue with the selected record');
    return false;
  }

  delete account_manager.accounts[node.id];
  chrome.storage.local.set({'accounts': account_manager.accounts}, function() {
    document.querySelector('#account_table_content').innerHTML = "";
    load_accounts_table();
  });
}


const init_account_data = () => {
  var account_starter_data = {
    azzippizzaevansville: {
      id: 'AzzipPizzaEvansville',
      location: 'evansville',
      url: 'facebook.com/AzzipPizzaEvansville',
      website: 'azzippizza.com',
      name: 'Azzip Pizza',
    },
    boonville_pizza_chef_299288533451805: {
      id: 'Boonville-Pizza-Chef-299288533451805',
      location: 'boonville',
      url: 'facebook.com/Boonville-Pizza-Chef-299288533451805',
      website: 'pizzachefboonville.com',
      name: 'Boonville Pizza Chef',
    }
  }

  chrome.storage.local.set({
    'accounts': account_starter_data
  }, function(){
    message('init account data');
    load_accounts_table();
  });

}


const init_account_table_ui = () => {

  var add_account_button = document.querySelector('#add-account-button');
  add_account_button.addEventListener('click', add_account);
  var buttons = document.querySelectorAll('#account_table_content .controls button');

  var button;
  for (button of buttons){
    if (button.classList.contains('edit-button')) {
      button.addEventListener('click', edit_account);
    }
    if (button.classList.contains('remove-button')) {
      button.addEventListener('click', remove_account);
    }
    if (button.classList.contains('cancel-edit')) {
      button.addEventListener('click', cancel_edit);
    }
    if (button.classList.contains('save-edit')) {
      button.addEventListener('click', save_account_edit);
    }
  }
}
