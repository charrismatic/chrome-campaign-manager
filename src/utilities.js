// GET CHROME LOCAL STORAGE KEY
const get_storage =  (key, callback) => {
  console.log('getting storage', key.toString());
  chrome.storage.local.get(key, callback);
  return true;
};


// SET CHROME LOCAL STORAGE KEY
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

  chrome.storage.local.set({
    key : data
  }, function(){
    console.log('key: ' + key.toString(), 'saved');
    message('key: ' + key.toString() + ' saved');
  });
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


// TOGGLES HTML ELEMENT EDITABLE ATTRIBUTE
const toggle_editable = (node) => {
  if (node.isContentEditable){
    window.form_is_editing = false;
    node.contentEditable = false;
  } else {
    window.form_is_editing = true;
    node.contentEditable = true;
  }
}



// STORAGE
const cancel_edit = (ev) => {
  ev.stopPropagation();
  var node = ev.target.parentElement.parentElement;
  var inputs = node.querySelectorAll('.input-field');
  for (input of inputs) {
    toggle_editable(input);
  }
  node.classList.remove('editable');

  node.querySelector('.account_id').innerText = account_manager.snapshot.id;
  node.querySelector('.account_name').innerText = account_manager.snapshot.name;
  node.querySelector('.account_location').innerText = account_manager.snapshot.location;
  account_manager.snapshot = Object.create(null);
}



// OPEN NEW TAB IN CHROME TO OPTIONS PAGE
const open_options_page = () => {
  chrome.tabs.create({'url': "/options/index.html" } )
}


// DISPLAYS UI NOTIFICATION MESSAGE
const message =  (msg) => {
  console.log('chrome-campaign-manager', msg);
  var message = document.querySelector('.message-notification');
  message.innerText = msg;
  setTimeout(function(){message.innerText = ''}, 3000);
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



const init_tab_ui = () => {
  for (tab of document.querySelectorAll('.nav-tabs .nav-item')){
    tab.addEventListener('click', function(){
      if (this.classList.contains('active')) {
        return false;
      } else {
        document.querySelector('.nav-tabs .nav-item.active').classList.remove('active')
        this.classList.add('active')
      }
    });
  }
}
