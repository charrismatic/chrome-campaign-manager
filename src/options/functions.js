// STRING CONSTANTS
const s = {
  DELETE_MESSAGE: 'x',
  EDIT_MESSAGE: 'edit',
  COPY_MESSAGE: 'copy',
};


// STORAGE

const save_css =  () => {
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
};

const get_storage =  (key, callback) => {
  console.log('getting storage', key.toString());
  chrome.storage.local.get(key, callback);
  return true;
};


const set_storage = (key, data) => {
  if (! typeof key === 'string') {
    key = key.toString();
  }

  console.log('Getting storage key', key);

  if (!data) {
    console.log(data);
    message('Error: Data not specified');
    return;
  }

  storage.set({
    key : data
  }, function(){
    console.log('key: ' + key.toString(), 'saved');
    message('key: ' + key.toString() + ' saved');
  });
};



const init_test_selector =  () => {
  document.querySelector('#select-account').innerHTML = "";
  chrome.storage.local.get('accounts', function(data) {
    for (account of data.accounts) {
      append_html(account.id, {
        target: '#select-account',
        tagName: 'option',
        className: '',
        id: ''
      });
    }
  })
};


const message =  (msg) => {
  console.log('chrome-campaign-manager', msg);
  var message = document.querySelector('.message-notification');
  message.innerText = msg;
  setTimeout(function(){message.innerText = ''}, 3000);
};


const reset_css =  () => {
  storage.remove('css', function(items) {
    message('Reset stored CSS');
  });
  textarea.value = '';
};


const save_macro =  () => {
  chrome.storage.local.set({key: value}, function() {
    console.log('Value is set to ' + value);
  });
};


const get_active_account =  () => {
  return document.querySelector('#select-account').value;
};



/**
 *  process_form
 *  Handles basic text input fields
 *  TODO: ADD FUNCIONALITY FOR MULTI SELECT AND RADIO
 *  @param {object|string} form - HTML form object or querySelector string
 *  @returns {object} data - Keys and values
 *
 *  @example process_form(document.forms['formId'])
 */
const process_form = (form) => {
  var form_data = {};

  // CHECK INPUT IS A FORM OBJECT
  if (typeof form !== 'object') {
    // IS INPUT A SELECTOR FOR A FORM
    if (typeof form === 'string') {
      form = document.querySelector(form);
    } else {
      console.log('Function process_form() failed to process input');
      return false;
    }
  } else {
    for (item of form.elements) {
      console.log(item.name +" "+ item.value);
      form_data[item.name] = item.value;
    }
    return form_data;
  }
}

/**
 *  append_html
 *  @param target Query selector string we want to append to
 *  @param  Html Tag name that will contain html content
 *  @param html_content Html content to be inserted
 *  @param options Accepts object for optional id and classname of the parent
 *    container.
 *
 *  @example append_html("<p>Hello Content</p>", {target:'body',id:'',className:'',tagName:'div'})
 */
const append_html = (content, options) => {
   var base;
   var defaults = {
     target: 'body',
     tagName: 'div',
     className: '',
     id: ''
   };
   var data = Object.assign({}, defaults, options);

   var node = document.createElement(data.tagName);
   node.className += data.className;
   node.id = data.id;
   node.innerHTML = content;

   if (base = document.querySelector(`${data.target}`)) {
     base.appendChild(node);
     return true;
   } else {
     return false;
   }
};


/***************************************
 * MESSAGE TEMPLATE FUNCTIONS
 ***************************************/

const get_message_text =  (el) => {
  return el.parentElement.parentElement.querySelector('.message__content').innerText
};


const get_message_row =  (message) => {
  return `
    <div class="message__actions">
      <button class="copy-message">${s.COPY_MESSAGE}</button>
    </div>
    <div class="message__content">${message.content}</div>
    <div class="message__controls">
      <button class="edit-message">${s.EDIT_MESSAGE}</button>
      <button class="delete-message">${s.DELETE_MESSAGE}</button>
    </div>
    `;
};


const insert_message_quicktags = (ev) => {
  var tag = ev.target.innerText;

  var message_input = document.querySelector('#message_content_input');
  var message_text = message_input.value + " " + tag + " ";

  message_input.value = message_text;

};


const send_to_clipboard =  (text) => {

  navigator.clipboard.writeText(text).then(function() {
    // CLIPBOARD WRITE SUCCESS
    return true;
  }, function() {
    // CLIPBOARD WRITE FAILED
    return false;
  });

}


const copy_message =  (ev) => {

  var text = get_message_text(ev.target);
  var id = get_active_account();
  var id_string = ['@', id.toString()].join('');
  var message = text.replace(/{{@fbid}}/g, id_string);

  return send_to_clipboard(message);

};


const delete_message = (ev) => {

  var el = ev.target
  var message_id = el.parentElement.parentElement.id
  el.parentElement.parentElement.remove();
  console.log('message_id', message_id);
  update_delete_message_storage(message_id);

  // return update_message_storage();

};


const edit_message = (ev) => {

};


const set_new_message_input_id = (num) => {
  document.querySelector('#new_message_id').value = num;
  return;
};


const message_table_add_row = (data) => {
  append_html(
    get_message_row(data), {
      tagName: 'div',
      target: '#message_table',
      className: 'message flex',
      id: `message-${data.id}`,
  });
  return true;
};


const update_delete_message_storage = (id) => {
  const MESSAGE_ID_PREFIX = 'message-';

  var message_id = parseInt(id.replace(MESSAGE_ID_PREFIX, ''));
  chrome.storage.local.get('messages', function(data){

    console.log('messages', data.messages[message_id]);
    delete data.messages[message_id];
    console.log(data.messages);

    var message_array = [];

    var index = 0;
    for (item of data.messages) {
      if (item) {
        message_array.push({
          id: index,
          content: item.content
        });

        index = index + 1;
      }
    }

    console.log('message_array', message_array);
    save_message_storage(message_array);
    return true;
  });

}


const save_message_storage = (data) => {
  if (!data) {
    message('Error: Data not specified');
    return;
  }

  chrome.storage.local.set({
    'messages': data
  }, function(){

    message('messages saved')

    // RESET TABLE HTML ON UPDATE
    document.querySelector('#message_table').innerHTML = "";
    load_message_table();
  });

};


const init_message_data = () => {

  var message_data = [
    {id: 0, content: 'Great - You walk in {{@fbid}} - What are you ordering and who are you with?'},
    {id: 1, content: 'Favorite thing to get at {{@fbid}}?'},
    {id: 2, content: 'Who are you taking with you to {{@fbid}} if you win?'}
  ];

  chrome.storage.local.set({
    'messages': message_data
  }, function(){
    message('init message data');
    load_message_table();
  });

}


const load_message_table = () => {

  chrome.storage.local.get('messages', function(data){

    // HANDLE EMPTY DATA AND RESET
    if (Object.keys(data).length < 1 ) {
      init_message_data();
    } else {

      var account_data = data.messages;
      for (item of account_data){
        append_html(
          get_message_row(item), {
            tagName: 'div',
            target: '#message_table',
            className: 'message flex',
            id: `message-${item.id}`,
          }
        )

        // ADD BUTTON ON ACTIONS
        document.querySelector(`#message-${item.id} .copy-message`).addEventListener('click', copy_message);
        document.querySelector(`#message-${item.id} .delete-message`).addEventListener('click', delete_message);
        document.querySelector(`#message-${item.id} .edit-message`).addEventListener('click', edit_message);
      }

      console.log(data.messages);
      var message_count = parseInt(data.messages.length);
      set_new_message_input_id(message_count);
    }
  })
};


/**
 *  add_message
 *  Main function to add new records to account storage
 *  Handles basic type checking and validition
 */

const add_message = (ev) => {
  ev.stopPropagation();

  var form = document.forms['message_form'];

  if (! form.checkValidity()){
    message('form is not valid');
    return false;
  }

  var form_data = process_form(form);

  console.log('form_data',form_data);
  var form_message_data = {
    id: form_data.message_id,
    content: form_data.message_content,
  };
  console.log('form_message_data',form_message_data);
  var success = message_table_add_row(form_message_data);

  if (success) {
    form.reset();
    chrome.storage.local.get('messages', function(data){
      data.messages.push(form_message_data);

      save_message_storage(data.messages);
      return true;
    });
  }
  return false;
}



/*
 * ACCOUNT DATA FUNCTIONS
 */

// RETURNS DATA MODEL FOR ACCOUNT DATA
const get_account_model = () => {
  return {
    id: '',
    location: '',
    url: '',
    website: '',
    name: '',
  }
};


// (ASYNC) SAVES ACCOUNT DATA

const init_account_data = () => {
  var account_starter_data = [
    {
      id: 'AzzipPizzaEvansville',
      location: 'evansville',
      url: 'facebook.com/AzzipPizzaEvansville',
      website: 'azzippizza.com',
      name: 'Azzip Pizza',
    }, {
      id: 'Boonville-Pizza-Chef-299288533451805',
      location: 'boonville',
      url: 'facebook.com/Boonville-Pizza-Chef-299288533451805',
      website: 'pizzachefboonville.com',
      name: 'Boonville Pizza Chef',
    }
  ];

  chrome.storage.local.set({
    'accounts': account_starter_data
  }, function(){
    message('init account data');
    load_accounts_table();
  });

}


const save_account_storage = (data) => {
  if (!data) {
    message('Error: Data not specified');
    return;
  }

  console.log('saving data', data);

  chrome.storage.local.set({
    'accounts': data
  }, function(){
    message('accounts saved')
  });
};


const get_account_row =  (item) => {
  return `
    <td>${item.id}</td>
    <td>${item.name}</td>
    <td>${item.location}</td>
  `;
};


const load_accounts_table = () => {

  chrome.storage.local.get('accounts', function(data){

    // HANDLE EMPTY DATA AND RESET
    if (Object.keys(data).length < 1 ) {
      init_account_data();
    } else {

      var account_data = data.accounts;
      for (item of account_data){
        append_html(
          get_account_row(item), {
            tagName: 'tr',
            target: '#accounts_table tbody',
            className: 'account',
            id: `account-row-${item.id}`,
          }
        )
      }

      init_test_selector();

    }
  })
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

  // TODO TEST INPUT ID IS UNIQUE;
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
      data.accounts.push(form_account_data);
      save_account_storage(data.accounts);
      return true;
    });
  }
  return false;
}
