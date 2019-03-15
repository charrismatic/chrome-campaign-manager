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

// const load_css =  () => {
//   chrome.storage.local.get('css', function(items) {
//     if (items.css) {
//       textarea.value = items.css;
//       message('css loaded ');
//     }
//   });
// };


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
  chrome.storage.local.get('accounts', function(data) {
    for (account of data.accounts) {
      append_html(account.id, {
        target: '#test-account',
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


const parse_url = (url) => {
  if (url) {
    if (url.match(/^https?\:\/\//) ){
      var new_url = new URL(  "https://" + url.replace(/https?\:\/\//, "" ).replace(/www\./, "") );
      return { href: new_url.href, hostname: new_url.hostname, };
    } else {
      return { href: url, hostname: "" };
    }
  } else {
    return { href: url, hostname: "" };
  }
};


const flatten_array = (data) => {
  var flat = [];
  if ( data.length > 1) {
    data.forEach( function( node ){
      if ( node.length > 1) {
        flat = flat.concat( flatten_array(node));
      } else {
        flat = flat.concat( node );
      }
    });
  } else {
    flat = flat.concat( node );
  }
  return flat;
};


const get_active_account =  () => {
  return document.querySelector('#test-account').value;
};



// CLIPBOARD TOOLS
const message_to_clip =  (ev) => {
  var text = get_message_text(ev.target);
  var id = get_active_account();
  var id_string = ['@', id.toString()].join('');
  var message = text.replace(/{{@pageurl}}/g, id_string);
  return clip_message(message);
};


const clip_message =  (text) => {
  navigator.clipboard.writeText(text).then(function() {
    // CLIPBOARD WRITE SUCCESS
    return true;
  }, function() {
    // CLIPBOARD WRITE FAILED
    return false;
  });
}


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

/*
 * MESSAGE TEMPLATE FUNCTIONS
 */

const get_message_text =  (el) => {
  return el.parentElement.parentElement.querySelector('.message__content').innerText
};


const get_message_row =  (message) => {
  return `
    <div class="message__actions">
      <button class="copy-message">${s.COPY_MESSAGE}</button>
    </div>
    <div class="message__content">${message}</div>
    <div class="message__controls">
      <button class="edit-message">${s.EDIT_MESSAGE}</button>
      <button class="delete-message">${s.DELETE_MESSAGE}</button>
    </div>
    `;
};


const load_message_table = (data) => {
  for (item of data){
    append_html(
      get_message_row(item.content), {
      target: '#message_table',
      className: 'message flex',
      id: `message-row-${item.id}`,
    })
  }
};


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
    message('init account data')
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

    // HANDLE DATA CLEAR AND RESET
    if (Object.keys(data).length < 1 ) {
      init_account_data();
    } else {

      var account_data = data.accounts;
      console.log(account_data);
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

      console.log('get', data);

      data.accounts.push(form_account_data);
      console.log('result', data.accounts);
      save_account_storage(data.accounts);
      return true;
    });
  }
  return false;
}
