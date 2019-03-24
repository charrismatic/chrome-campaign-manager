
/***************************************
 * MESSAGE TEMPLATE FUNCTIONS
 ***************************************/

const get_active_account =  () => {  
  var select = document.querySelector('#select-account');
  var index = select.selectedIndex;
  return select.options[index].id;
};

const get_message_text =  (el) => {
  return el.parentElement.parentElement.querySelector('.message__content').innerText
};


const get_message_row =  (message) => {
  return `
    <div class="message__actions">
      <button class="copy-message icon icon-copy">
        <span class="sra-text">${s.COPY_MESSAGE}</span>
      </button>
    </div>
    <div class="message__content">${message.content}</div>
    <div class="message__controls ">
      <button class="edit-message icon icon-edit">
        <span class="sra-text">${s.EDIT_MESSAGE}</span>
      </button>
      <button class="delete-message icon icon-close">
        <span class="sra-text">${s.DELETE_MESSAGE}</span>
      </button>
      <button class="save-edit icon icon-edit">
        <span class="sra-text">${s.SAVE_MESSAGE}</span>
      </button>
      <button class="cancel-edit icon icon-edit">
        <span class="sra-text">${s.CANCEL_MESSAGE}</span>
      </button>
    </div>
    `;
};


const insert_message_quicktag = (ev) => {

  var tag = ev.target.innerText;
  var message_input = document.querySelector('#message_content_input');
  var message_text = message_input.value + " " + tag + " ";

  message_input.value = message_text;

};


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
  update_delete_message_storage(message_id);

};


const edit_message = (ev) => {

  // var el = ev.target.parentElement.parentElement;
  //
  // if (! el.classList.contains('account')){
  //   console.log('There was an issue with the selected record');
  //   return false;
  // }
  // console.log('edit');
  // console.log(el);

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
    delete data.messages[message_id];

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


const load_message_table = () => {

  chrome.storage.local.get('messages', function(data){

    // HANDLE EMPTY DATA AND RESET
    if (Object.keys(data).length < 1 ) {
      init_message_data();
    } else {

      var message_data = data.messages;
      for (item of message_data){
        append_html(
          get_message_row(item), {
            tagName: 'div',
            target: '#message_table',
            className: 'message hover-controls flex',
            id: `message-${item.id}`,
          }
        )

        // ADD BUTTON ON ACTIONS
        document.querySelector(`#message-${item.id} .copy-message`).addEventListener('click', copy_message);
        document.querySelector(`#message-${item.id} .delete-message`).addEventListener('click', delete_message);
        document.querySelector(`#message-${item.id} .edit-message`).addEventListener('click', edit_message);
      }

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

  var form_message_data = {
    id: form_data.message_id,
    content: form_data.message_content,
  };

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


const init_test_selector =  () => {
  document.querySelector('#select-account').innerHTML = "";
  chrome.storage.local.get('accounts', function(data) {
    var account_data = data.accounts;
    for (account of Object.keys(account_data)) {
      append_html(account_data[account].name, {
        target: '#select-account',
        tagName: 'option',
        className: '',
        id: account_data[account].id
      });

    }
  })
};


const init_message_ui = () => {

  load_message_table();

  var add_message_button = document.querySelector('#add-message-button');
  add_message_button.addEventListener('click', add_message);

  var fb_quicktag = document.querySelector('#fbid_tag');
  fb_quicktag.addEventListener('click', insert_message_quicktag);

};
