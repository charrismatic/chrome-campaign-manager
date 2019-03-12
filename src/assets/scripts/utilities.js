(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
  typeof define === 'function' && define.amd ? define(['exports'], factory) :
  (factory((global.utilities = {})));
}(this, (function (exports) { 'use strict';

  const domready = ( function () {
    var fns = [];
    var listener;
    var doc = document;
    var hack = doc.documentElement.doScroll;
    var domContentLoaded = 'DOMContentLoaded';
    var loaded = (hack ? /^loaded|^c/ : /^loaded|^i|^c/).test(doc.readyState);


    if (!loaded) {
      doc.addEventListener(domContentLoaded, listener = function () {
        doc.removeEventListener(domContentLoaded, listener);
        loaded = 1;
        while (listener = fns.shift()) {
          listener();
        }
      });
      return function (fn) {
        loaded ? setTimeout(fn, 0) : fns.push(fn);
      };
    }
  })();

  var clean_function_statment = (statement) => {
    var clean_statement;
    if ( typeof(statement) === 'string') {
      clean_statement = statement.trim();
    } else {
      clean_statement = JSON.stringify(statement);
    }
    return clean_statement;
  };



  var tab_execute_script = (tabId, statement, callback, options) => {
    var log = true;
    var log_title = '[INSPECTED WINDOW RESULT]';
    var cancel = false;
    if (options){
      if (options.log_result === true) {
        if (options.log_title) {
          log_title = '[' + options.log_title + ']';
        }
      }
      else { log = false; }
      if (options.cancel_callback_on_fail){
        cancel = true;
      }
    }

    var clean_statement = clean_function_statment(statement);
    console.log("statment", statement);
    console.log("cleaned", clean_statement);
    return chrome.tabs.executeScript(
      tabId,
      { code: "document.querySelector('body').innerHTML"},
      function (result, isException) {

        if (isException) {

          if (log) {
            console.log('%c ' + log_title.toUpperCase() + ' ' + ' [FAILED]', 'color:red');
            console.log(isException);
          }

          if (!cancel && typeof callback === 'function') {
            callback(isException);
          }
          else { return false; }
        }

        else {
          if (log) {
            console.log('%c ' + log_title.toUpperCase() + ' ' + ' [SUCESS]', 'color:green');
            console.log(result);
          }

          if (typeof callback === 'function') {
            return callback(result);
          } else { return result; }
        }
      }
    );
  };



  var inspected_window_eval_script = (statement, callback, options ) => {

    var log = true;
    var log_title = '[INSPECTED WINDOW RESULT]';
    var cancel = false;

    if (options){
      if (options.log_result === true) {
        if (options.log_title) {
          log_title = '[' + options.log_title + ']';
        }
      }
      else { log = false; }

      if (options.cancel_callback_on_fail){
        cancel = true;
      }
    }

    var clean_statement = clean_function_statment(statement);

    return chrome.devtools.inspectedWindow.eval(
      clean_statement,
      function(result, isException) {

        if (isException) {
          if (log) {
            console.log('%c ' + log_title.toUpperCase() + ' ' + ' [FAILED]', 'color:red');
            console.log(isException);
          }
          if (!cancel && typeof callback === 'function') {
            return callback(isException);
          }
          else { return false; }
        }
        else {
          if (log) {
            console.log('%c ' + log_title.toUpperCase() + ' ' + ' [SUCESS]', 'color:green');
            console.log(result);
          }
          if (typeof callback === 'function') {
            return callback(result);
          }
          else { return result; }
        }
      }
    );
  };



  const Chrome = {
    window_eval_script: inspected_window_eval_script,
    tab_execute_script: tab_execute_script
  };

  const get_node = (selector) => {
    return document.querySelector(selector);
  };


  const get =(selector) => {
    return document.querySelector(selector);
  };


  const get_nodes = (selector) => {
    return document.querySelectorAll(selector);
  };


  const get_all = (selector) => {
    return document.querySelectorAll(selector);
  };


  const by_id = (id) => {
    return document.getElementById(id);
  };

  const get_from_node = (node, selector) => {
    return node.querySelectorAll(selector);
  };
  const get_all_from_node = (node, selector) => {
    return node.querySelectorAll(selector);
  };


  const is_node = (selector) =>  {
    var node;
    if (node = document.querySelector(selector)) {
      return node;
    } else {
      return false;
    }
  };


  const exists = (selector) => {
    if (document.querySelector(selector)) {
      return document.querySelector(selector);
    } else {
      return false;
    }
  };


  const Select = {
    by_id             : by_id,
    get               : get,
    get_node          : get_node,
    get_all           : get_all,
    get_nodes         : get_nodes,
    exists            : exists,
    is_node           : is_node,
    get_from_node     : get_from_node,
    get_all_from_node : get_all_from_node,
  };

  class Log {
    constructor ( options ) {
      var colors = {
        red:'red',
      };
      var styles = {
        warning: 'color:' + colors.red + '',
      };
      this.colors = colors;
      this.tyles = styles;
      this.options = options;
    }
    static pretty( msg, style ) {
      console.log('%c ' + msg, style);
    }
    static info( title='', msg ) {
      console.log('%c ' + title.toUpperCase() + ' [INFO]', 'color:teal');
      console.log(msg);
      return;
    }
    static success( title='', msg ) {
      console.log('%c ' + title.toUpperCase() + ' [SUCESS]', 'color:green');
      console.log(msg);
      return;
    }
    static failed( title='', msg ) {
      console.log('%c ' + title.toUpperCase() + ' [FAILED]', 'color:red');
      console.log(msg);
      return;
    }
  }

  const Utility = {
    Chrome: Chrome,
    Log: Log,
    Select: Select,
    Ready: domready
  };

  exports.Utility = Utility;

  Object.defineProperty(exports, '__esModule', { value: true });

})));
