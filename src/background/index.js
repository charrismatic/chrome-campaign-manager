chrome.runtime.onMessage.addListener(
  function(message, callback) {
    console.log("running content script");
    if (message == 'runContentScript'){
      // chrome.tabs.executeScript({
      //   file: 'inject.js'
      // });
      console.log('runContentScript');
    } else {
      console.log(message);
    }
 });

chrome.contextMenus.onClicked.addListener(onClickHandler);

// Set up context menu tree at install time.
chrome.runtime.onInstalled.addListener(function() {

  // Create one test item for each context type.
  var contexts = [
    "page",
    "selection",
    "link",
    "editable",
    // "image"
    // "video",
    // "audio"
  ];

  for (var i = 0; i < contexts.length; i++) {
    var context = contexts[i];
    var title = "Context: '" + context + "' item";

    var id = chrome.contextMenus.create({
      "title": title,
      "contexts": [context],
      "id": "context"+context
    });

    console.log("'"+context+"'", "'item': " + "'"+id+"'");
  }

  // Create a parent item and two children.
  chrome.contextMenus.create({
    "id": "parent",
    "title": "Presets",
  });
  chrome.contextMenus.create({
    "id": "child1",
    "title": "Get Document Body",
    "parentId": "parent",
  });
  chrome.contextMenus.create({
    "id": "child2",
    "title": "Get Article",
    "parentId": "parent",
  });
  chrome.contextMenus.create({
    "id": "convert_main",
    "title": "Get Document Main",
    "parentId": "parent",
  });
  chrome.contextMenus.create({
    "id": "convert_selected",
    "title": "Get Inspector Selected",
    "parentId": "parent",
  });

      // // Create some radio items.
      // chrome.contextMenus.create({
      //   "id": "radio1",
      //   "type": "radio",
      //   "title": "Radio 1",
      // });
      // chrome.contextMenus.create({
      //   "id": "radio2",
      //   "type": "radio",
      //   "title": "Radio 2",
      // });
      // console.log("radio1 radio2");

  // Create some checkbox items.
  chrome.contextMenus.create({
    "id": "dominspector_enabled",
    "type": "checkbox",
    "title": "Enable Inspector",
  });

      // chrome.contextMenus.create({
      //   "id": "checkbox2",
      //   "type": "checkbox",
      //   "title": "Checkbox2",
      // });
      // console.log("checkbox1 checkbox2");

});
