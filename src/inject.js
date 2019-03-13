function get_id_from_pathname (path){
  // REMOVE ONLY FIRST '/' ALWAYS PRESENT IN THE PATH
  return path.replace(/\//,'').split('/')[0]
}

function get_name_from_title (title){
  return title.split(' - ')[0].trim();
}

function get_timestamp () {
  var timestamp = new Date;
  return timestamp.toISOString();
}

function get_info_from_meta () {
  var node = document.head.querySelector('script[type="application/ld+json"]');

  if (node) {
    return JSON.parse(node.innerText);
  } else {
    return Object.create(null);
  }
}

function get_page_id_meta () {
  var node = document.querySelector('meta[property="al:android:url"]');
  if (node) {
    return node;
  } else {
    return '';
  }
}

function get_url_meta () {
  var node = document.querySelector('link[hreflang="en"]');
  if (node) {
    return node.href;
  } else {
    return '';
  }
}

function init () {

  var empty = Object.create(null);

  var data = Object.assign(empty, data, {
    id: get_id_from_pathname(location.pathname),
    title: get_name_from_title(document.title),
    url: get_url_meta(),
    page_id: get_page_id_meta(),
    info: get_info_from_meta(),
    time: get_timestamp()
  });

  console.log(data);
}

init();
