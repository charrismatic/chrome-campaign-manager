import * as Log from '../utilities/logger.js';

//   INSPECTOR
// ================

// INITIALIZE INSPECTOR TOOL TO THE USER WINDOW
export function init_dom_inspector (inspected_tab) {
  return chrome.tabs.executeScript(
    inspected_tab, {
      code: JSON.stringify([
        'var inspect_node=new DomInspector();'
        ,'inspect_node.RenderInspector();'
        ,'console.log("inspect_node", inspect_node);'
        ,'inspect_node.RenderInspector();'
        ,'document.body.addEventListener("mousemove",function(e){'
        ,'inspect_node.setElement(e.target);'
        ,  'e.stopPropagation();'
        ,'});'
      ].join('\n'))
    },
    function (result, isException) {
      if (isException) {
        Log.log_failed('INSPECTOR LOAD FAILED',isException);
        return false;
      } else {
        Log.log_sucess('LOAD_DOM_INSPECTOR', result);
        Log.log_to_user('LOAD_DOM_INSPECTOR', result);
        return (result);
      }
    }
  );
}


// LOAD THE INSPECTOR CLASS TO THE USER WINDOW
export function load_dom_inspector (inspected_tab) {
  return chrome.tabs.executeScript(
    inspected_tab, {
      file: '/inspector/inspector.js'
    },
    function (result, isException) {
      if (isException) {
        Log.log_failed('INSPECTOR LOAD FAILED',isException);
        return false;
      } else {
        Log.log_sucess('LOAD_DOM_INSPECTOR', result);
        Log.log_to_user('LOAD_DOM_INSPECTOR', result);
        return (result);
      }
    }
  );
}


// ACTIVATE INSPECTOR TOOL THE USER WINDOW
export function dom_inspector_inspect () {
  return chrome.devtools.inspectedWindow.eval(
    'inspect_node.Inspect();console.log("inspecting...")',
    function (result, isException) {
      if (isException) {
        Log.log_failed('ACTIVATE INSPECTOR',isException);
        return false;
      } else {
        Log.log_sucess('ACTIVATE INSPECTOR', result);
        Log.log_to_user( result );
        return (result);
      }
    }
  );
}
