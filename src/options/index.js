
var set_bookmarks = (data) => {
  marks = data;
  return true;
};


var get_topic_title = (id) => {
  return id_topics[id];
};


var add_id_topic = (id, title) => {
  id_topics[id] = title;
};


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


var parse_tree_node = (node) => {

  var bookmark_arr = [];
  var bookmark_url = parse_url(node.url);
  var bookmark_topic = get_topic_title(node.parentId);

  var bookmark_obj = {
    url: bookmark_url.href,
    hostname: bookmark_url.hostname,
    title: node.title,
    parent: node.parentId,
    topics: bookmark_topic,
    id: node.id,
  };

  if (node.children) {

    add_id_topic( node.id, node.title );

    for (child_node of node.children){
       bookmark_arr.push( parse_tree_node(child_node));
    }

  } else {
    return bookmark_obj;
  }

  return bookmark_arr;
};

function get_message_text (el) {
  return el.parentElement.parentElement.querySelector('.message__content').innerText
}

function message_to_clip (ev) {
  var text = get_message_text(ev.target);
  return clip_message(text);
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

const s = {
  DELETE_MESSAGE: 'x',
  EDIT_MESSAGE: 'edit',
  COPY_MESSAGE: 'copy',
};

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
  console.log(data);
  var table = $("#bookmark_table")
  // table.DataTable ({
  //   "data" : data,
  //   "columns" : [
  //     { "data": "id"        ,"name": "id"       , "orderable": false, "searchable": false, "width": "10%"},
  //     { "data": "location"  ,"name": "hostname" , "orderable": true , "searchable": true , "width": "19%"},
  //     { "data": "name"      ,"name": "title"    , "orderable": true,  "searchable": true , "width": "39%"},
  //     { "data": "url"       ,"name": "url"      , "orderable": false, "searchable": false, "width": "39%"},
  //     // { "data": "website"    ,"name": "topics"   , "orderable": false, "searchable": true , "width": "9%" }
  //   ],
  //   "paging": false,
  //   "searching": true,
  //   // "searchPane": {
  //   //   threshold: 0.8
  //   // },
  //   "autoWidth": true,
  //   "deferRender": false,
  //   buttons: [
  //     'copy',
  //     'excel',
  //     'pdf'
  //   ]
  // });
}

var flat = [];
var sorted = [];
var id_topics = {};
var marks;

document.addEventListener('DOMContentLoaded', function () {
  var account_model = {
    id: '',
    location: '',
    url: '',
    website: '',
    name: '',
  };

  var account_data = [];
  account_data.push({
    id: 'AzzipPizzaEvansville',
    location: 'evansville',
    url: 'facebook.com/AzzipPizzaEvansville',
    website: 'azzippizza.com',
    name: 'Azzip Pizza',
  });
  account_data.push({
    id: 'Boonville-Pizza-Chef-299288533451805',
    location: 'boonville',
    url: 'facebook.com/Boonville-Pizza-Chef-299288533451805',
    website: 'pizzachefboonville.com',
    name: 'Boonville Pizza Chef',
  });

  load_accounts_table(account_data);

  var test_messages = [
    {id: 1, content: 'Great - You walk in {{@pageurl}} - What are you ordering and who are you with?', tags: ''},
    {id: 2, content: 'Favorite thing to get at {{@pageurl}}?', tags: ''},
    {id: 3, content: 'Who are you taking with you to {{@pageurl}} if you win?', tags: ''}
  ];

  load_message_table(test_messages);

  for (btn of document.querySelectorAll('.copy-message')){
  	btn.addEventListener('click', message_to_clip);
  }
});
