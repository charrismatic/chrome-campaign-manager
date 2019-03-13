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
  chrome.storage.local.get('css', function(items) {
    if (items.css) {
      textarea.value = items.css;
      message('css loaded ');
    }
  });
}


function get_storage (key, callback) {
  console.log('getting storage', key.toString());
  chrome.storage.local.get(key, callback);
  return true;
}


function init_test_selector () {
  chrome.storage.local.get('accounts', function(data) {
    for (account of data.accounts) {
      append_html(account.id, {
        target: '#test-account',
        tagName: 'option',
        className: '',
        id: ''
      });
    }
  });
};



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

var parse_url = (url) => {
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
}


var flatten_array = (data) => {
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
}


// CLIPBOARD TOOLS
function get_active_account () {
  return document.querySelector('#test-account').value;
}

function get_message_text (el) {
  return el.parentElement.parentElement.querySelector('.message__content').innerText
}

function message_to_clip (ev) {
  var text = get_message_text(ev.target);
  var id = get_active_account();
  var id_string = ['@', id.toString()].join('');
  var message = text.replace(/{{@pageurl}}/g, id_string);
  return clip_message(message);
}

function clip_message (text) {
  // target.select();
  // document.execCommand("copy");
  navigator.clipboard.writeText(text).then(function() {
    /* clipboard successfully set */
    return true;
  }, function() {
    /* clipboard write failed */
    return false;
  });
}


function get_message_row (message) {
  return `
    <div class="message__actions">
      <button class="copy-message">${s.COPY_MESSAGE}</button>
    </div>
    <div class="message__content">${message}</div>
    <div class="message__controls">
      <button class="edit-message">${s.EDIT_MESSAGE}</button>
      <button class="delete-message">${s.DELETE_MESSAGE}</button>
    </div>`;
}

function get_account_row (item) {
  return `
    <td>${item.name}</td>
    <td>${item.id}</td>
    <td>${item.location}</td>
  `;
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
 function append_html(content, options) {
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
 }


function load_message_table(data) {
  for (item of data){
    append_html(
      get_message_row(item.content), {
      target: '#message_table',
      className: 'message flex',
      id: `message-row-${item.id}`,
    })
  }
}



function load_accounts_table(data) {
  for (item of data){
    append_html(
      get_account_row(item), {
      tagName: 'tr',
      target: '#accounts_table tbody',
      className: 'account',
      id: `account-row-${item.id}`,
    })
  }
}
