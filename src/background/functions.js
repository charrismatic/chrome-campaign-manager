
// chrome.tabs.getCurrent(function callback)

// INJECT INDIVIDUAL FUNCTION
function load_content_function () {
  chrome.runtime.onMessage.addListener(
    function(message, callback) {
      if (message == 'changeColor'){
        chrome.tabs.executeScript({
          code: 'document.body.style.backgroundColor="orange"'
        });
      }
  });
}

//
// // LOAD INSPECTOR SCRIPT
// function load_dom_inspector () {
//   chrome.tabs.executeScript({
//     file: 'inspector.js'
//   });
// }
//
// function disable_dom_inspector() {
//   chrome.tabs.executeScript({
//     file: 'inspector_disable.js'
//   });
// }


// INJECT FILE
function load_content_script () {
  chrome.tabs.executeScript({
    file: 'inject.js'
  });
}

chrome.runtime.onMessage.addListener(
function(message, callback) {
  console.log("MESSAGE", message);
  if (message == 'inspect_document_all'){
    chrome.tabs.executeScript({
      file: 'inject.js'
    });
  }
});


function set_output_header () {
  var script = get_document_meta();
  var callback = function(result, isException) {
    if (isException) {
      console.log('%c [set_output_header] exception', 'color:red');
      console.log(result, isException );
      return false;
    } else {
      console.log('%c [set_output_header] RESULT', 'color:green, font-size: 16px; background-color: #333;');
      var header=get_document_header_template(result);
      console.log(header);
      // set_snapshot_property('header', header);
      return header;
    }
  };

  return chrome.tabs.executeScript({
    code: script
  }, callback);
}


function get_selected_html_content () {
  // var html_result=[];document.querySelectorAll('.selected_item').forEach(function(node){html_result.push(node.innerHTML)});html_result.join('\n').normalize();
  // chrome.runtime.onMessage.addListener(
    // function(message, callback) {
  return chrome.tabs.executeScript({
      code: 'var html_result=[];document.querySelectorAll(".selected_item").forEach(function(node){html_result.push(node.innerHTML)});html_result.join("\n").normalize();'
  })

  // })
}


// GET HTML AND DISPLAY MARKDOWN
function set_html_content () {
  return chrome.tabs.executeScript({
    code: '($0).innerHTML',
  }, function (result, isException) {
      if (isException) {
        console.log('%c Exception', 'color: red');
        console.log(result, isException);
        return false;
      } else {
        console.log('%c GET_WINDOW_HTML_CONTENT', 'color:green');
        var html_content = result;
        // set_snapshot_property('html',html_content);
        console.log(html_content);
        // html_2_md(html_content);
        return html_content;
      }
    }
  )
}

// ========================
function get_window_html_content() {
  return  chrome.tabs.executeScript({
    code: '($0).innerHTML'
  }, function (result, isException) {
      if (isException) {
        console.log('%c Exception', 'color: red');
        console.log(result, isException);
        return false;
      } else {
        console.log('%c GET_WINDOW_HTML_CONTENT', 'color:green');
        console.log(result);
        // set_snapshot_property('html',result);
        return result;
      }
    }
  )
}


// GET DOCUMENT META INFO
function get_document_meta(){
  return '({url:location.href,title:document.title})';
}


// RETURN DOCUMENT MARKDOWN HEADER
function get_document_header_template(data) {
  var header = '\n\n';
  header += data.url + '\n\n';
  header += '# ' +  data.title + '\n\n';
  header += '---------------------------\n';
  return header;
}


// The onClicked callback function.
function onClickHandler(info, tab) {
  // TOGGLE RADIO SELECTORS
  if (info.menuItemId == "radio1" || info.menuItemId == "radio2") {
    console.log( "radio item "
      + info.menuItemId + " was clicked (previous checked state was "
      + info.wasChecked + ")"
    );
  }

  // TOGGLE CHECKBOX ITEMS
  else if (info.menuItemId == "checkbox1" || info.menuItemId == "checkbox2") {
    console.log(JSON.stringify(info));
    console.log(
      "checkbox item " + info.menuItemId +
      " was clicked, state is now: " + info.checked +
      " (previous state was " + info.wasChecked + ")"
    );
  }

  else if (info.menuItemId == "convert_selected") {
    get_selected_html_content();
  }

  // ---
  // TOGGLE DOM INSPECTOR TOOL
  // ---
  else if (info.menuItemId == "dominspector_enabled") {
    console.log(JSON.stringify(info));
    console.log(
      "checkbox item " + info.menuItemId +
      " was clicked, state is now: " + info.checked +
      " (previous state was " + info.wasChecked + ")"
    );
    if (info.checked) {
      // load_dom_inspector();
      // chrome.tabs.executeScript({
      //   file: 'inject.js'
      // }, function(data){
      //   console.log("callback", data[0]);
      // });
    } else {
      // disable_dom_inspector();
    }

  }

  // CONVERT HTML TO MD
  else {
    scriptdata = get_document_meta();
    var document_data ='({'
        +'hostname:location.hostname,'
        +'href:location.href,'
        +'path:location.pathname,'
        +'url_parameters:location.hash,'
        +'title:document.title,'
        +'scripts:JSON.stringify(document.scripts)'
    +'})';

    // var link_data = (function(){
    //   res=[];
    //   document.links.forEach(function(ln){
    //   res.push(
    //     [" - [",ln.href.toString().trim(),"](",ln.innerText.trim(),")"].join(""))
    //   })res.join("\n")
    // });

    console.log("info: ", info);
    console.log("tab: " , tab);
    console.log('RUNNING HTML2MD');

    chrome.tabs.executeScript({
      file: 'inject.js'
    }, function(data){
      console.log("callback", data[0]);
    });

    chrome.tabs.executeScript({
      code: scriptdata
    }, function(data){
      console.log("scriptdata", data[0]);
    });

    console.log(document_data);

    chrome.tabs.executeScript({
      code: document_data,
    }, function(data, second){
      console.log("document_data", data[0]);
    });
  }
};
