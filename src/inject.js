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

var empty = Object.create(null);

var data = Object.assign(empty, data, {
  id: get_id_from_pathname(location.pathname),
  title: get_name_from_title(document.title),
  url: document.querySelector('link[hreflang="en"]'),
  page_id: document.querySelector('meta[property="al:android:url"]').content,
  // info: JSON.parse(document.head.querySelector('script[type="application/ld+json"]').innerText),
  time: get_timestamp()
});

// console.log(data);
