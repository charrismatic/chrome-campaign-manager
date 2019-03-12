(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
  typeof define === 'function' && define.amd ? define(factory) :
  (global.panel = factory());
}(this, (function () { 'use strict';

  function to_user (msg, style='') {
    chrome.devtools.inspectedWindow.eval(
      'console.log(' + JSON.stringify(msg) + ')',
      function(result) {
        console.log('%c [log_to_user_console]' + msg, style);
        console.log('[log_to_user_console]', result);
      }
    );
    return;
  }



  function success (title='', msg) {
    console.log('%c ' + title.toUpperCase() + ' [SUCESS]', 'color:green');

    console.log(msg);
    return;
  }
  function info (title='', msg) {
    console.log('%c ' + title.toUpperCase() + ' [INFO]', 'color:teal');

    console.log(msg);
    return;
  }
  function failed (title='', msg) {
    console.log('%c ' + title.toUpperCase() + ' [FAILED]', 'color:red');

    console.log(msg);
    return;
  }

  var lastSnapshot = {
    header: '',
    markdown: '',
    html: ''
  };



  function get_data () {
    return lastSnapshot;
  }



  function get_property(prop) {
    return lastSnapshot[prop];
  }


  function is_property(prop) {
    if (lastSnapshot[prop]) {
      return true;
    } else {
      return false;
    }
  }



  function set_property (prop, data) {
    if (lastSnapshot[prop] && lastSnapshot[prop] === data) {
      info('Snapshot Property Already Set', prop);
      return false;
    } else {
      lastSnapshot[prop] = data;
      return true;
    }
  }


  function log_status () {
    var snapshot_status = get_data();
    if (snapshot_status) {
      success( 'SNAPSHOT STATUS', snapshot_status );
      return true;
    } else {
      failed( 'SNAPSHOT STATUS', snapshot_status );
      return false;
    }
  }

  var Snapshot = /*#__PURE__*/Object.freeze({
    lastSnapshot: lastSnapshot,
    get_data: get_data,
    get_property: get_property,
    is_property: is_property,
    set_property: set_property,
    log_status: log_status
  });

  var snapshot = Snapshot;



  function update_document_html_data () {

    var html_result = get_document_html_content();
    if (html_result) {

      return snapshot.set_property('html', html_result);
    } else {
      return false;
    }
  }



  function get_document_html_content () {
    return chrome.devtools.inspectedWindow.eval(
      '($0).innerHTML',
      function (result, isException) {
        if (isException) {
          failed('GET_HTML_CONTENT', isException);
          return false;
        } else {
          success('GET_HTML_CONTENT', result);
          return result;
        }
      }
    );
  }



  function the_document_header_template (data) {
    var header = '\n\n';
    header += data.url + '\n\n';
    header += '# ' +  data.title + '\n\n';
    header += '---------------------------\n';
    return header;
  }



  function document_headers_function_string (){
    return '({url:location.href,title:document.title})';
  }



  function update_document_headers_data () {
    var header = get_document_meta_headers();
    if (header){
      the_document_header_template(header);
      return snapshot.set_property('header', header);
    } else {
      return false;
    }
  }



  function get_document_meta_headers () {
    return chrome.devtools.inspectedWindow.eval(
      document_headers_function_string(),
      function(result, isException) {
        if (isException) {
          failed('[GET_DOCUMENT_META_HEADERS]',isException);
          return false;
        } else {
          success('[GET_DOCUMENT_META_HEADERS]', result);
          return result;
        }
      }
    );
  }

  var Context = /*#__PURE__*/Object.freeze({
    update_document_html_data: update_document_html_data,
    get_document_html_content: get_document_html_content,
    the_document_header_template: the_document_header_template,
    document_headers_function_string: document_headers_function_string,
    update_document_headers_data: update_document_headers_data,
    get_document_meta_headers: get_document_meta_headers
  });

  (function(expose) {
    var MarkdownHelpers = {};


    function mk_block_toSource() {
      return "Markdown.mk_block( " +
              uneval(this.toString()) +
              ", " +
              uneval(this.trailing) +
              ", " +
              uneval(this.lineNumber) +
              " )";
    }


    function mk_block_inspect() {
      var util = require("util");
      return "Markdown.mk_block( " +
              util.inspect(this.toString()) +
              ", " +
              util.inspect(this.trailing) +
              ", " +
              util.inspect(this.lineNumber) +
              " )";

    }

    MarkdownHelpers.mk_block = function(block, trail, line) {

      if ( arguments.length === 1 )
        trail = "\n\n";



      var s = new String(block);
      s.trailing = trail;

      s.inspect = mk_block_inspect;
      s.toSource = mk_block_toSource;

      if ( line !== undefined )
        s.lineNumber = line;

      return s;
    };


    var isArray = MarkdownHelpers.isArray = Array.isArray || function(obj) {
      return Object.prototype.toString.call(obj) === "[object Array]";
    };


    if ( Array.prototype.forEach ) {
      MarkdownHelpers.forEach = function forEach( arr, cb, thisp ) {
        return arr.forEach( cb, thisp );
      };
    }
    else {
      MarkdownHelpers.forEach = function forEach(arr, cb, thisp) {
        for (var i = 0; i < arr.length; i++)
          cb.call(thisp || arr, arr[i], i, arr);
      };
    }

    MarkdownHelpers.isEmpty = function isEmpty( obj ) {
      for ( var key in obj ) {
        if ( hasOwnProperty.call( obj, key ) )
          return false;
      }
      return true;
    };

    MarkdownHelpers.extract_attr = function extract_attr( jsonml ) {
      return isArray(jsonml)
          && jsonml.length > 1
          && typeof jsonml[ 1 ] === "object"
          && !( isArray(jsonml[ 1 ]) )
          ? jsonml[ 1 ]
          : undefined;
    };



    var Markdown = function(dialect) {
      switch (typeof dialect) {
      case "undefined":
        this.dialect = Markdown.dialects.Gruber;
        break;
      case "object":
        this.dialect = dialect;
        break;
      default:
        if ( dialect in Markdown.dialects )
          this.dialect = Markdown.dialects[dialect];
        else
          throw new Error("Unknown Markdown dialect '" + String(dialect) + "'");
        break;
      }
      this.em_state = [];
      this.strong_state = [];
      this.debug_indent = "";
    };



    Markdown.dialects = {};



    var mk_block = Markdown.mk_block = MarkdownHelpers.mk_block,
        isArray = MarkdownHelpers.isArray;



    Markdown.parse = function( source, dialect ) {

      var md = new Markdown( dialect );
      return md.toTree( source );
    };

    function count_lines( str ) {
      var n = 0,
          i = -1;
      while ( ( i = str.indexOf("\n", i + 1) ) !== -1 )
        n++;
      return n;
    }


    Markdown.prototype.split_blocks = function splitBlocks( input ) {
      input = input.replace(/(\r\n|\n|\r)/g, "\n");


      var re = /([\s\S]+?)($|\n#|\n(?:\s*\n|$)+)/g,
          blocks = [],
          m;

      var line_no = 1;

      if ( ( m = /^(\s*\n)/.exec(input) ) !== null ) {

        line_no += count_lines( m[0] );
        re.lastIndex = m[0].length;
      }

      while ( ( m = re.exec(input) ) !== null ) {
        if (m[2] === "\n#") {
          m[2] = "\n";
          re.lastIndex--;
        }
        blocks.push( mk_block( m[1], m[2], line_no ) );
        line_no += count_lines( m[0] );
      }

      return blocks;
    };



    Markdown.prototype.processBlock = function processBlock( block, next ) {
      var cbs = this.dialect.block,
          ord = cbs.__order__;

      if ( "__call__" in cbs )
        return cbs.__call__.call(this, block, next);

      for ( var i = 0; i < ord.length; i++ ) {

        var res = cbs[ ord[i] ].call( this, block, next );
        if ( res ) {

          if ( !isArray(res) || ( res.length > 0 && !( isArray(res[0]) ) ) )
            this.debug(ord[i], "didn't return a proper array");

          return res;
        }
      }


      return [];
    };

    Markdown.prototype.processInline = function processInline( block ) {
      return this.dialect.inline.__call__.call( this, String( block ) );
    };



    Markdown.prototype.toTree = function toTree( source, custom_root ) {
      var blocks = source instanceof Array ? source : this.split_blocks( source );


      var old_tree = this.tree;
      try {
        this.tree = custom_root || this.tree || [ "markdown" ];

        blocks_loop:
        while ( blocks.length ) {
          var b = this.processBlock( blocks.shift(), blocks );


          if ( !b.length )
            continue blocks_loop;

          this.tree.push.apply( this.tree, b );
        }
        return this.tree;
      }
      finally {
        if ( custom_root )
          this.tree = old_tree;
      }
    };


    Markdown.prototype.debug = function () {
      var args = Array.prototype.slice.call( arguments);
      args.unshift(this.debug_indent);
      if ( typeof print !== "undefined" )
        print.apply( print, args );
      if ( typeof console !== "undefined" && typeof console.log !== "undefined" )
        console.log.apply( null, args );
    };

    Markdown.prototype.loop_re_over_block = function( re, block, cb ) {

      var m,
          b = block.valueOf();

      while ( b.length && (m = re.exec(b) ) !== null ) {
        b = b.substr( m[0].length );
        cb.call(this, m);
      }
      return b;
    };


    Markdown.buildBlockOrder = function(d) {
      var ord = [];
      for ( var i in d ) {
        if ( i === "__order__" || i === "__call__" )
          continue;
        ord.push( i );
      }
      d.__order__ = ord;
    };


    Markdown.buildInlinePatterns = function(d) {
      var patterns = [];

      for ( var i in d ) {

        if ( i.match( /^__.*__$/) )
          continue;
        var l = i.replace( /([\\.*+?|()\[\]{}])/g, "\\$1" )
                 .replace( /\n/, "\\n" );
        patterns.push( i.length === 1 ? l : "(?:" + l + ")" );
      }

      patterns = patterns.join("|");
      d.__patterns__ = patterns;


      var fn = d.__call__;
      d.__call__ = function(text, pattern) {
        if ( pattern !== undefined )
          return fn.call(this, text, pattern);
        else
          return fn.call(this, text, patterns);
      };
    };



    var extract_attr = MarkdownHelpers.extract_attr;



    Markdown.renderJsonML = function( jsonml, options ) {
      options = options || {};

      options.root = options.root || false;

      var content = [];

      if ( options.root ) {
        content.push( render_tree( jsonml ) );
      }
      else {
        jsonml.shift();
        if ( jsonml.length && typeof jsonml[ 0 ] === "object" && !( jsonml[ 0 ] instanceof Array ) )
          jsonml.shift();

        while ( jsonml.length )
          content.push( render_tree( jsonml.shift() ) );
      }

      return content.join( "\n\n" );
    };



    Markdown.toHTMLTree = function toHTMLTree( input, dialect , options ) {


      if ( typeof input === "string" )
        input = this.parse( input, dialect );



      var attrs = extract_attr( input ),
          refs = {};

      if ( attrs && attrs.references )
        refs = attrs.references;

      var html = convert_tree_to_html( input, refs , options );
      merge_text_nodes( html );
      return html;
    };



    Markdown.toHTML = function toHTML( source , dialect , options ) {
      var input = this.toHTMLTree( source , dialect , options );

      return this.renderJsonML( input );
    };


    function escapeHTML( text ) {
      return text.replace( /&/g, "&amp;" )
                 .replace( /</g, "&lt;" )
                 .replace( />/g, "&gt;" )
                 .replace( /"/g, "&quot;" )
                 .replace( /'/g, "&#39;" );
    }

    function render_tree( jsonml ) {

      if ( typeof jsonml === "string" )
        return escapeHTML( jsonml );

      var tag = jsonml.shift(),
          attributes = {},
          content = [];

      if ( jsonml.length && typeof jsonml[ 0 ] === "object" && !( jsonml[ 0 ] instanceof Array ) )
        attributes = jsonml.shift();

      while ( jsonml.length )
        content.push( render_tree( jsonml.shift() ) );

      var tag_attrs = "";
      for ( var a in attributes )
        tag_attrs += " " + a + '="' + escapeHTML( attributes[ a ] ) + '"';


      if ( tag === "img" || tag === "br" || tag === "hr" )
        return "<"+ tag + tag_attrs + "/>";
      else
        return "<"+ tag + tag_attrs + ">" + content.join( "" ) + "</" + tag + ">";
    }

    function convert_tree_to_html( tree, references, options ) {
      var i;
      options = options || {};


      var jsonml = tree.slice( 0 );

      if ( typeof options.preprocessTreeNode === "function" )
        jsonml = options.preprocessTreeNode(jsonml, references);


      var attrs = extract_attr( jsonml );
      if ( attrs ) {
        jsonml[ 1 ] = {};
        for ( i in attrs ) {
          jsonml[ 1 ][ i ] = attrs[ i ];
        }
        attrs = jsonml[ 1 ];
      }


      if ( typeof jsonml === "string" )
        return jsonml;


      switch ( jsonml[ 0 ] ) {
      case "header":
        jsonml[ 0 ] = "h" + jsonml[ 1 ].level;
        delete jsonml[ 1 ].level;
        break;
      case "bulletlist":
        jsonml[ 0 ] = "ul";
        break;
      case "numberlist":
        jsonml[ 0 ] = "ol";
        break;
      case "listitem":
        jsonml[ 0 ] = "li";
        break;
      case "para":
        jsonml[ 0 ] = "p";
        break;
      case "markdown":
        jsonml[ 0 ] = "html";
        if ( attrs )
          delete attrs.references;
        break;
      case "code_block":
        jsonml[ 0 ] = "pre";
        i = attrs ? 2 : 1;
        var code = [ "code" ];
        code.push.apply( code, jsonml.splice( i, jsonml.length - i ) );
        jsonml[ i ] = code;
        break;
      case "inlinecode":
        jsonml[ 0 ] = "code";
        break;
      case "img":
        jsonml[ 1 ].src = jsonml[ 1 ].href;
        delete jsonml[ 1 ].href;
        break;
      case "linebreak":
        jsonml[ 0 ] = "br";
        break;
      case "link":
        jsonml[ 0 ] = "a";
        break;
      case "link_ref":
        jsonml[ 0 ] = "a";


        var ref = references[ attrs.ref ];


        if ( ref ) {
          delete attrs.ref;


          attrs.href = ref.href;
          if ( ref.title )
            attrs.title = ref.title;


          delete attrs.original;
        }

        else {
          return attrs.original;
        }
        break;
      case "img_ref":
        jsonml[ 0 ] = "img";


        var ref = references[ attrs.ref ];


        if ( ref ) {
          delete attrs.ref;


          attrs.src = ref.href;
          if ( ref.title )
            attrs.title = ref.title;


          delete attrs.original;
        }

        else {
          return attrs.original;
        }
        break;
      }


      i = 1;


      if ( attrs ) {

        for ( var key in jsonml[ 1 ] ) {
          i = 2;
          break;
        }

        if ( i === 1 )
          jsonml.splice( i, 1 );
      }

      for ( ; i < jsonml.length; ++i ) {
        jsonml[ i ] = convert_tree_to_html( jsonml[ i ], references, options );
      }

      return jsonml;
    }



    function merge_text_nodes( jsonml ) {

      var i = extract_attr( jsonml ) ? 2 : 1;

      while ( i < jsonml.length ) {

        if ( typeof jsonml[ i ] === "string" ) {
          if ( i + 1 < jsonml.length && typeof jsonml[ i + 1 ] === "string" ) {

            jsonml[ i ] += jsonml.splice( i + 1, 1 )[ 0 ];
          }
          else {
            ++i;
          }
        }

        else {
          merge_text_nodes( jsonml[ i ] );
          ++i;
        }
      }
    }


    var DialectHelpers = {};
    DialectHelpers.inline_until_char = function( text, want ) {
      var consumed = 0,
          nodes = [];

      while ( true ) {
        if ( text.charAt( consumed ) === want ) {

          consumed++;
          return [ consumed, nodes ];
        }

        if ( consumed >= text.length ) {

          return null;
        }

        var res = this.dialect.inline.__oneElement__.call(this, text.substr( consumed ) );
        consumed += res[ 0 ];

        nodes.push.apply( nodes, res.slice( 1 ) );
      }
    };


    DialectHelpers.subclassDialect = function( d ) {
      function Block() {}
      Block.prototype = d.block;
      function Inline() {}
      Inline.prototype = d.inline;

      return { block: new Block(), inline: new Inline() };
    };



    var forEach = MarkdownHelpers.forEach,
        extract_attr = MarkdownHelpers.extract_attr,
        mk_block = MarkdownHelpers.mk_block,
        isEmpty = MarkdownHelpers.isEmpty,
        inline_until_char = DialectHelpers.inline_until_char;



    var Gruber = {
      block: {
        atxHeader: function atxHeader( block, next ) {
          var m = block.match( /^(#{1,6})\s*(.*?)\s*#*\s*(?:\n|$)/ );

          if ( !m )
            return undefined;

          var header = [ "header", { level: m[ 1 ].length } ];
          Array.prototype.push.apply(header, this.processInline(m[ 2 ]));

          if ( m[0].length < block.length )
            next.unshift( mk_block( block.substr( m[0].length ), block.trailing, block.lineNumber + 2 ) );

          return [ header ];
        },

        setextHeader: function setextHeader( block, next ) {
          var m = block.match( /^(.*)\n([-=])\2\2+(?:\n|$)/ );

          if ( !m )
            return undefined;

          var level = ( m[ 2 ] === "=" ) ? 1 : 2,
              header = [ "header", { level : level }, m[ 1 ] ];

          if ( m[0].length < block.length )
            next.unshift( mk_block( block.substr( m[0].length ), block.trailing, block.lineNumber + 2 ) );

          return [ header ];
        },

        code: function code( block, next ) {



          var ret = [],
              re = /^(?: {0,3}\t| {4})(.*)\n?/;


          if ( !block.match( re ) )
            return undefined;

          block_search:
          do {

            var b = this.loop_re_over_block(
                      re, block.valueOf(), function( m ) { ret.push( m[1] ); } );

            if ( b.length ) {

              next.unshift( mk_block(b, block.trailing) );
              break block_search;
            }
            else if ( next.length ) {

              if ( !next[0].match( re ) )
                break block_search;


              ret.push ( block.trailing.replace(/[^\n]/g, "").substring(2) );

              block = next.shift();
            }
            else {
              break block_search;
            }
          } while ( true );

          return [ [ "code_block", ret.join("\n") ] ];
        },

        horizRule: function horizRule( block, next ) {

          var m = block.match( /^(?:([\s\S]*?)\n)?[ \t]*([-_*])(?:[ \t]*\2){2,}[ \t]*(?:\n([\s\S]*))?$/ );

          if ( !m )
            return undefined;

          var jsonml = [ [ "hr" ] ];


          if ( m[ 1 ] ) {
            var contained = mk_block( m[ 1 ], "", block.lineNumber );
            jsonml.unshift.apply( jsonml, this.toTree( contained, [] ) );
          }


          if ( m[ 3 ] )
            next.unshift( mk_block( m[ 3 ], block.trailing, block.lineNumber + 1 ) );

          return jsonml;
        },



        lists: (function( ) {

          var any_list = "[*+-]|\\d+\\.",
              bullet_list = /[*+-]/,

              is_list_re = new RegExp( "^( {0,3})(" + any_list + ")[ \t]+" ),
              indent_re = "(?: {0,3}\\t| {4})";



          function regex_for_depth( depth ) {

            return new RegExp(

              "(?:^(" + indent_re + "{0," + depth + "} {0,3})(" + any_list + ")\\s+)|" +

              "(^" + indent_re + "{0," + (depth-1) + "}[ ]{0,4})"
            );
          }
          function expand_tab( input ) {
            return input.replace( / {0,3}\t/g, "    " );
          }



          function add(li, loose, inline, nl) {
            if ( loose ) {
              li.push( [ "para" ].concat(inline) );
              return;
            }

            var add_to = li[li.length -1] instanceof Array && li[li.length - 1][0] === "para"
                       ? li[li.length -1]
                       : li;


            if ( nl && li.length > 1 )
              inline.unshift(nl);

            for ( var i = 0; i < inline.length; i++ ) {
              var what = inline[i],
                  is_str = typeof what === "string";
              if ( is_str && add_to.length > 1 && typeof add_to[add_to.length-1] === "string" )
                add_to[ add_to.length-1 ] += what;
              else
                add_to.push( what );
            }
          }



          function get_contained_blocks( depth, blocks ) {

            var re = new RegExp( "^(" + indent_re + "{" + depth + "}.*?\\n?)*$" ),
                replace = new RegExp("^" + indent_re + "{" + depth + "}", "gm"),
                ret = [];

            while ( blocks.length > 0 ) {
              if ( re.exec( blocks[0] ) ) {
                var b = blocks.shift(),

                    x = b.replace( replace, "");

                ret.push( mk_block( x, b.trailing, b.lineNumber ) );
              }
              else
                break;
            }
            return ret;
          }


          function paragraphify(s, i, stack) {
            var list = s.list;
            var last_li = list[list.length-1];

            if ( last_li[1] instanceof Array && last_li[1][0] === "para" )
              return;
            if ( i + 1 === stack.length ) {


              last_li.push( ["para"].concat( last_li.splice(1, last_li.length - 1) ) );
            }
            else {
              var sublist = last_li.pop();
              last_li.push( ["para"].concat( last_li.splice(1, last_li.length - 1) ), sublist );
            }
          }


          return function( block, next ) {
            var m = block.match( is_list_re );
            if ( !m )
              return undefined;

            function make_list( m ) {
              var list = bullet_list.exec( m[2] )
                       ? ["bulletlist"]
                       : ["numberlist"];

              stack.push( { list: list, indent: m[1] } );
              return list;
            }


            var stack = [],
                list = make_list( m ),
                last_li,
                loose = false,
                ret = [ stack[0].list ],
                i;


            loose_search:
            while ( true ) {

              var lines = block.split( /(?=\n)/ );



              var li_accumulate = "", nl = "";


              tight_search:
              for ( var line_no = 0; line_no < lines.length; line_no++ ) {
                nl = "";
                var l = lines[line_no].replace(/^\n/, function(n) { nl = n; return ""; });



                var line_re = regex_for_depth( stack.length );

                m = l.match( line_re );



                if ( m[1] !== undefined ) {

                  if ( li_accumulate.length ) {
                    add( last_li, loose, this.processInline( li_accumulate ), nl );

                    loose = false;
                    li_accumulate = "";
                  }

                  m[1] = expand_tab( m[1] );
                  var wanted_depth = Math.floor(m[1].length/4)+1;

                  if ( wanted_depth > stack.length ) {


                    list = make_list( m );
                    last_li.push( list );
                    last_li = list[1] = [ "listitem" ];
                  }
                  else {



                    var found = false;
                    for ( i = 0; i < stack.length; i++ ) {
                      if ( stack[ i ].indent !== m[1] )
                        continue;

                      list = stack[ i ].list;
                      stack.splice( i+1, stack.length - (i+1) );
                      found = true;
                      break;
                    }

                    if (!found) {

                      wanted_depth++;
                      if ( wanted_depth <= stack.length ) {
                        stack.splice(wanted_depth, stack.length - wanted_depth);

                        list = stack[wanted_depth-1].list;

                      }
                      else {

                        list = make_list(m);
                        last_li.push(list);
                      }
                    }


                    last_li = [ "listitem" ];
                    list.push(last_li);
                  }
                  nl = "";
                }


                if ( l.length > m[0].length )
                  li_accumulate += nl + l.substr( m[0].length );
              }

              if ( li_accumulate.length ) {
                add( last_li, loose, this.processInline( li_accumulate ), nl );

                loose = false;
                li_accumulate = "";
              }



              var contained = get_contained_blocks( stack.length, next );


              if ( contained.length > 0 ) {

                forEach( stack, paragraphify, this);

                last_li.push.apply( last_li, this.toTree( contained, [] ) );
              }

              var next_block = next[0] && next[0].valueOf() || "";

              if ( next_block.match(is_list_re) || next_block.match( /^ / ) ) {
                block = next.shift();


                var hr = this.dialect.block.horizRule( block, next );

                if ( hr ) {
                  ret.push.apply(ret, hr);
                  break;
                }


                forEach( stack, paragraphify, this);

                loose = true;
                continue loose_search;
              }
              break;
            }

            return ret;
          };
        })(),

        blockquote: function blockquote( block, next ) {
          if ( !block.match( /^>/m ) )
            return undefined;

          var jsonml = [];



          if ( block[ 0 ] !== ">" ) {
            var lines = block.split( /\n/ ),
                prev = [],
                line_no = block.lineNumber;


            while ( lines.length && lines[ 0 ][ 0 ] !== ">" ) {
              prev.push( lines.shift() );
              line_no++;
            }

            var abutting = mk_block( prev.join( "\n" ), "\n", block.lineNumber );
            jsonml.push.apply( jsonml, this.processBlock( abutting, [] ) );

            block = mk_block( lines.join( "\n" ), block.trailing, line_no );
          }



          while ( next.length && next[ 0 ][ 0 ] === ">" ) {
            var b = next.shift();
            block = mk_block( block + block.trailing + b, b.trailing, block.lineNumber );
          }


          var input = block.replace( /^> ?/gm, "" ),
              old_tree = this.tree,
              processedBlock = this.toTree( input, [ "blockquote" ] ),
              attr = extract_attr( processedBlock );


          if ( attr && attr.references ) {
            delete attr.references;

            if ( isEmpty( attr ) )
              processedBlock.splice( 1, 1 );
          }

          jsonml.push( processedBlock );
          return jsonml;
        },

        referenceDefn: function referenceDefn( block, next) {
          var re = /^\s*\[(.*?)\]:\s*(\S+)(?:\s+(?:(['"])(.*?)\3|\((.*?)\)))?\n?/;


          if ( !block.match(re) )
            return undefined;


          if ( !extract_attr( this.tree ) )
            this.tree.splice( 1, 0, {} );

          var attrs = extract_attr( this.tree );


          if ( attrs.references === undefined )
            attrs.references = {};

          var b = this.loop_re_over_block(re, block, function( m ) {

            if ( m[2] && m[2][0] === "<" && m[2][m[2].length-1] === ">" )
              m[2] = m[2].substring( 1, m[2].length - 1 );

            var ref = attrs.references[ m[1].toLowerCase() ] = {
              href: m[2]
            };

            if ( m[4] !== undefined )
              ref.title = m[4];
            else if ( m[5] !== undefined )
              ref.title = m[5];

          } );

          if ( b.length )
            next.unshift( mk_block( b, block.trailing ) );

          return [];
        },

        para: function para( block ) {

          return [ ["para"].concat( this.processInline( block ) ) ];
        }
      },

      inline: {

        __oneElement__: function oneElement( text, patterns_or_re, previous_nodes ) {
          var m,
              res;

          patterns_or_re = patterns_or_re || this.dialect.inline.__patterns__;
          var re = new RegExp( "([\\s\\S]*?)(" + (patterns_or_re.source || patterns_or_re) + ")" );

          m = re.exec( text );
          if (!m) {

            return [ text.length, text ];
          }
          else if ( m[1] ) {

            return [ m[1].length, m[1] ];
          }

          var res;
          if ( m[2] in this.dialect.inline ) {
            res = this.dialect.inline[ m[2] ].call(
                      this,
                      text.substr( m.index ), m, previous_nodes || [] );
          }

          res = res || [ m[2].length, m[2] ];
          return res;
        },

        __call__: function inline( text, patterns ) {

          var out = [],
              res;

          function add(x) {

            if ( typeof x === "string" && typeof out[out.length-1] === "string" )
              out[ out.length-1 ] += x;
            else
              out.push(x);
          }

          while ( text.length > 0 ) {
            res = this.dialect.inline.__oneElement__.call(this, text, patterns, out );
            text = text.substr( res.shift() );
            forEach(res, add );
          }

          return out;
        },



        "]": function () {},
        "}": function () {},

        __escape__ : /^\\[\\`\*_{}\[\]()#\+.!\-]/,

        "\\": function escaped( text ) {


          if ( this.dialect.inline.__escape__.exec( text ) )
            return [ 2, text.charAt( 1 ) ];
          else

            return [ 1, "\\" ];
        },

        "![": function image( text ) {



          var m = text.match( /^!\[(.*?)\][ \t]*\([ \t]*([^")]*?)(?:[ \t]+(["'])(.*?)\3)?[ \t]*\)/ );

          if ( m ) {
            if ( m[2] && m[2][0] === "<" && m[2][m[2].length-1] === ">" )
              m[2] = m[2].substring( 1, m[2].length - 1 );

            m[2] = this.dialect.inline.__call__.call( this, m[2], /\\/ )[0];

            var attrs = { alt: m[1], href: m[2] || "" };
            if ( m[4] !== undefined)
              attrs.title = m[4];

            return [ m[0].length, [ "img", attrs ] ];
          }


          m = text.match( /^!\[(.*?)\][ \t]*\[(.*?)\]/ );

          if ( m ) {


            return [ m[0].length, [ "img_ref", { alt: m[1], ref: m[2].toLowerCase(), original: m[0] } ] ];
          }


          return [ 2, "![" ];
        },

        "[": function link( text ) {

          var orig = String(text);

          var res = inline_until_char.call( this, text.substr(1), "]" );


          if ( !res )
            return [ 1, "[" ];

          var consumed = 1 + res[ 0 ],
              children = res[ 1 ],
              link,
              attrs;



          text = text.substr( consumed );



          var m = text.match( /^\s*\([ \t]*([^"']*)(?:[ \t]+(["'])(.*?)\2)?[ \t]*\)/ );
          if ( m ) {
            var url = m[1];
            consumed += m[0].length;

            if ( url && url[0] === "<" && url[url.length-1] === ">" )
              url = url.substring( 1, url.length - 1 );


            if ( !m[3] ) {
              var open_parens = 1;
              for ( var len = 0; len < url.length; len++ ) {
                switch ( url[len] ) {
                case "(":
                  open_parens++;
                  break;
                case ")":
                  if ( --open_parens === 0) {
                    consumed -= url.length - len;
                    url = url.substring(0, len);
                  }
                  break;
                }
              }
            }


            url = this.dialect.inline.__call__.call( this, url, /\\/ )[0];

            attrs = { href: url || "" };
            if ( m[3] !== undefined)
              attrs.title = m[3];

            link = [ "link", attrs ].concat( children );
            return [ consumed, link ];
          }



          m = text.match( /^\s*\[(.*?)\]/ );

          if ( m ) {

            consumed += m[ 0 ].length;


            attrs = { ref: ( m[ 1 ] || String(children) ).toLowerCase(),  original: orig.substr( 0, consumed ) };

            link = [ "link_ref", attrs ].concat( children );



            return [ consumed, link ];
          }



          if ( children.length === 1 && typeof children[0] === "string" ) {

            attrs = { ref: children[0].toLowerCase(),  original: orig.substr( 0, consumed ) };
            link = [ "link_ref", attrs, children[0] ];
            return [ consumed, link ];
          }


          return [ 1, "[" ];
        },


        "<": function autoLink( text ) {
          var m;

          if ( ( m = text.match( /^<(?:((https?|ftp|mailto):[^>]+)|(.*?@.*?\.[a-zA-Z]+))>/ ) ) !== null ) {
            if ( m[3] )
              return [ m[0].length, [ "link", { href: "mailto:" + m[3] }, m[3] ] ];
            else if ( m[2] === "mailto" )
              return [ m[0].length, [ "link", { href: m[1] }, m[1].substr("mailto:".length ) ] ];
            else
              return [ m[0].length, [ "link", { href: m[1] }, m[1] ] ];
          }

          return [ 1, "<" ];
        },

        "`": function inlineCode( text ) {


          var m = text.match( /(`+)(([\s\S]*?)\1)/ );

          if ( m && m[2] )
            return [ m[1].length + m[2].length, [ "inlinecode", m[3] ] ];
          else {

            return [ 1, "`" ];
          }
        },

        "  \n": function lineBreak() {
          return [ 3, [ "linebreak" ] ];
        }

      }
    };


    function strong_em( tag, md ) {

      var state_slot = tag + "_state",
          other_slot = tag === "strong" ? "em_state" : "strong_state";

      function CloseTag(len) {
        this.len_after = len;
        this.name = "close_" + md;
      }

      return function ( text ) {

        if ( this[state_slot][0] === md ) {


          this[state_slot].shift();


          return[ text.length, new CloseTag(text.length-md.length) ];
        }
        else {

          var other = this[other_slot].slice(),
              state = this[state_slot].slice();

          this[state_slot].unshift(md);



          var res = this.processInline( text.substr( md.length ) );


          var last = res[res.length - 1];



          var check = this[state_slot].shift();
          if ( last instanceof CloseTag ) {
            res.pop();

            var consumed = text.length - last.len_after;
            return [ consumed, [ tag ].concat(res) ];
          }
          else {

            this[other_slot] = other;
            this[state_slot] = state;


            return [ md.length, md ];
          }
        }
      };
    }

    Gruber.inline["**"] = strong_em("strong", "**");
    Gruber.inline["__"] = strong_em("strong", "__");
    Gruber.inline["*"]  = strong_em("em", "*");
    Gruber.inline["_"]  = strong_em("em", "_");

    Markdown.dialects.Gruber = Gruber;
    Markdown.buildBlockOrder ( Markdown.dialects.Gruber.block );
    Markdown.buildInlinePatterns( Markdown.dialects.Gruber.inline );



    var Maruku = DialectHelpers.subclassDialect( Gruber ),
        extract_attr = MarkdownHelpers.extract_attr,
        forEach = MarkdownHelpers.forEach;

    Maruku.processMetaHash = function processMetaHash( meta_string ) {
      var meta = split_meta_hash( meta_string ),
          attr = {};

      for ( var i = 0; i < meta.length; ++i ) {

        if ( /^#/.test( meta[ i ] ) )
          attr.id = meta[ i ].substring( 1 );

        else if ( /^\./.test( meta[ i ] ) ) {

          if ( attr["class"] )
            attr["class"] = attr["class"] + meta[ i ].replace( /./, " " );
          else
            attr["class"] = meta[ i ].substring( 1 );
        }

        else if ( /\=/.test( meta[ i ] ) ) {
          var s = meta[ i ].split( /\=/ );
          attr[ s[ 0 ] ] = s[ 1 ];
        }
      }

      return attr;
    };

    function split_meta_hash( meta_string ) {
      var meta = meta_string.split( "" ),
          parts = [ "" ],
          in_quotes = false;

      while ( meta.length ) {
        var letter = meta.shift();
        switch ( letter ) {
        case " " :

          if ( in_quotes )
            parts[ parts.length - 1 ] += letter;

          else
            parts.push( "" );
          break;
        case "'" :
        case '"' :

          in_quotes = !in_quotes;
          break;
        case "\\" :


          letter = meta.shift();

        default :
          parts[ parts.length - 1 ] += letter;
          break;
        }
      }

      return parts;
    }

    Maruku.block.document_meta = function document_meta( block ) {

      if ( block.lineNumber > 1 )
        return undefined;


      if ( ! block.match( /^(?:\w+:.*\n)*\w+:.*$/ ) )
        return undefined;


      if ( !extract_attr( this.tree ) )
        this.tree.splice( 1, 0, {} );

      var pairs = block.split( /\n/ );
      for ( var p in pairs ) {
        var m = pairs[ p ].match( /(\w+):\s*(.*)$/ ),
            key = m[ 1 ].toLowerCase(),
            value = m[ 2 ];

        this.tree[ 1 ][ key ] = value;
      }


      return [];
    };

    Maruku.block.block_meta = function block_meta( block ) {

      var m = block.match( /(^|\n) {0,3}\{:\s*((?:\\\}|[^\}])*)\s*\}$/ );
      if ( !m )
        return undefined;


      var attr = this.dialect.processMetaHash( m[ 2 ] ),
          hash;


      if ( m[ 1 ] === "" ) {
        var node = this.tree[ this.tree.length - 1 ];
        hash = extract_attr( node );


        if ( typeof node === "string" )
          return undefined;


        if ( !hash ) {
          hash = {};
          node.splice( 1, 0, hash );
        }


        for ( var a in attr )
          hash[ a ] = attr[ a ];


        return [];
      }


      var b = block.replace( /\n.*$/, "" ),
          result = this.processBlock( b, [] );


      hash = extract_attr( result[ 0 ] );
      if ( !hash ) {
        hash = {};
        result[ 0 ].splice( 1, 0, hash );
      }


      for ( var a in attr )
        hash[ a ] = attr[ a ];

      return result;
    };

    Maruku.block.definition_list = function definition_list( block, next ) {

      var tight = /^((?:[^\s:].*\n)+):\s+([\s\S]+)$/,
          list = [ "dl" ],
          i, m;


      if ( ( m = block.match( tight ) ) ) {

        var blocks = [ block ];
        while ( next.length && tight.exec( next[ 0 ] ) )
          blocks.push( next.shift() );

        for ( var b = 0; b < blocks.length; ++b ) {
          var m = blocks[ b ].match( tight ),
              terms = m[ 1 ].replace( /\n$/, "" ).split( /\n/ ),
              defns = m[ 2 ].split( /\n:\s+/ );



          for ( i = 0; i < terms.length; ++i )
            list.push( [ "dt", terms[ i ] ] );

          for ( i = 0; i < defns.length; ++i ) {

            list.push( [ "dd" ].concat( this.processInline( defns[ i ].replace( /(\n)\s+/, "$1" ) ) ) );
          }
        }
      }
      else {
        return undefined;
      }

      return [ list ];
    };



    Maruku.block.table = function table ( block ) {

      var _split_on_unescaped = function( s, ch ) {
        ch = ch || '\\s';
        if ( ch.match(/^[\\|\[\]{}?*.+^$]$/) )
          ch = '\\' + ch;
        var res = [ ],
            r = new RegExp('^((?:\\\\.|[^\\\\' + ch + '])*)' + ch + '(.*)'),
            m;
        while ( ( m = s.match( r ) ) ) {
          res.push( m[1] );
          s = m[2];
        }
        res.push(s);
        return res;
      };

      var leading_pipe = /^ {0,3}\|(.+)\n {0,3}\|\s*([\-:]+[\-| :]*)\n((?:\s*\|.*(?:\n|$))*)(?=\n|$)/,

          no_leading_pipe = /^ {0,3}(\S(?:\\.|[^\\|])*\|.*)\n {0,3}([\-:]+\s*\|[\-| :]*)\n((?:(?:\\.|[^\\|])*\|.*(?:\n|$))*)(?=\n|$)/,
          i,
          m;
      if ( ( m = block.match( leading_pipe ) ) ) {


        m[3] = m[3].replace(/^\s*\|/gm, '');
      } else if ( ! ( m = block.match( no_leading_pipe ) ) ) {
        return undefined;
      }

      var table = [ "table", [ "thead", [ "tr" ] ], [ "tbody" ] ];



      m[2] = m[2].replace(/\|\s*$/, '').split('|');


      var html_attrs = [ ];
      forEach (m[2], function (s) {
        if (s.match(/^\s*-+:\s*$/))
          html_attrs.push({align: "right"});
        else if (s.match(/^\s*:-+\s*$/))
          html_attrs.push({align: "left"});
        else if (s.match(/^\s*:-+:\s*$/))
          html_attrs.push({align: "center"});
        else
          html_attrs.push({});
      });


      m[1] = _split_on_unescaped(m[1].replace(/\|\s*$/, ''), '|');
      for (i = 0; i < m[1].length; i++) {
        table[1][1].push(['th', html_attrs[i] || {}].concat(
          this.processInline(m[1][i].trim())));
      }


      forEach (m[3].replace(/\|\s*$/mg, '').split('\n'), function (row) {
        var html_row = ['tr'];
        row = _split_on_unescaped(row, '|');
        for (i = 0; i < row.length; i++)
          html_row.push(['td', html_attrs[i] || {}].concat(this.processInline(row[i].trim())));
        table[2].push(html_row);
      }, this);

      return [table];
    };

    Maruku.inline[ "{:" ] = function inline_meta( text, matches, out ) {
      if ( !out.length )
        return [ 2, "{:" ];


      var before = out[ out.length - 1 ];

      if ( typeof before === "string" )
        return [ 2, "{:" ];


      var m = text.match( /^\{:\s*((?:\\\}|[^\}])*)\s*\}/ );


      if ( !m )
        return [ 2, "{:" ];


      var meta = this.dialect.processMetaHash( m[ 1 ] ),
          attr = extract_attr( before );

      if ( !attr ) {
        attr = {};
        before.splice( 1, 0, attr );
      }

      for ( var k in meta )
        attr[ k ] = meta[ k ];


      return [ m[ 0 ].length, "" ];
    };


    Markdown.dialects.Maruku = Maruku;
    Markdown.dialects.Maruku.inline.__escape__ = /^\\[\\`\*_{}\[\]()#\+.!\-|:]/;
    Markdown.buildBlockOrder ( Markdown.dialects.Maruku.block );
    Markdown.buildInlinePatterns( Markdown.dialects.Maruku.inline );



    expose.Markdown = Markdown;
    expose.parse = Markdown.parse;
    expose.toHTML = Markdown.toHTML;
    expose.toHTMLTree = Markdown.toHTMLTree;
    expose.renderJsonML = Markdown.renderJsonML;

  })(function() {
    window.markdown = {};
    return window.markdown;
  }());

  var markdown = /*#__PURE__*/Object.freeze({

  });

  var md = function () {
    return (markdown);
  };

  const MdTools = {
    mdparse: md.parse,
    md2html: md.toHTML,
    md2htmltree: md.toHTMLTree,
    md2json: md.renderJsonML
  };

  var md_to_html = /*#__PURE__*/Object.freeze({
    MdTools: MdTools
  });

  var TurndownService = (function () {

    function extend (destination) {
      for (var i = 1; i < arguments.length; i++) {
        var source = arguments[i];
        for (var key in source) {
          if (source.hasOwnProperty(key)) destination[key] = source[key];
        }
      }
      return destination;
    }

    function repeat (character, count) {
      return Array(count + 1).join(character);
    }

    var blockElements = [
      'address', 'article', 'aside', 'audio', 'blockquote', 'body', 'canvas',
      'center', 'dd', 'dir', 'div', 'dl', 'dt', 'fieldset', 'figcaption',
      'figure', 'footer', 'form', 'frameset', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
      'header', 'hgroup', 'hr', 'html', 'isindex', 'li', 'main', 'menu', 'nav',
      'noframes', 'noscript', 'ol', 'output', 'p', 'pre', 'section', 'table',
      'tbody', 'td', 'tfoot', 'th', 'thead', 'tr', 'ul'
    ];

    function isBlock (node) {
      return blockElements.indexOf(node.nodeName.toLowerCase()) !== -1;
    }

    var voidElements = [
      'area', 'base', 'br', 'col', 'command', 'embed', 'hr', 'img', 'input',
      'keygen', 'link', 'meta', 'param', 'source', 'track', 'wbr'
    ];

    function isVoid (node) {
      return voidElements.indexOf(node.nodeName.toLowerCase()) !== -1;
    }

    var voidSelector = voidElements.join();
    function hasVoid (node) {
      return node.querySelector && node.querySelector(voidSelector);
    }

    var rules = {};

    rules.paragraph = {
      filter: 'p',

      replacement: function (content) {
        return '\n\n' + content + '\n\n'
      }
    };

    rules.lineBreak = {
      filter: 'br',

      replacement: function (content, node, options) {
        return options.br + '\n'
      }
    };

    rules.heading = {
      filter: ['h1', 'h2', 'h3', 'h4', 'h5', 'h6'],

      replacement: function (content, node, options) {
        var hLevel = Number(node.nodeName.charAt(1));

        if (options.headingStyle === 'setext' && hLevel < 3) {
          var underline = repeat((hLevel === 1 ? '=' : '-'), content.length);
          return (
            '\n\n' + content + '\n' + underline + '\n\n'
          )
        } else {
          return '\n\n' + repeat('#', hLevel) + ' ' + content + '\n\n'
        }
      }
    };

    rules.blockquote = {
      filter: 'blockquote',

      replacement: function (content) {
        content = content.replace(/^\n+|\n+$/g, '');
        content = content.replace(/^/gm, '> ');
        return '\n\n' + content + '\n\n'
      }
    };

    rules.list = {
      filter: ['ul', 'ol'],

      replacement: function (content, node) {
        var parent = node.parentNode;
        if (parent.nodeName === 'LI' && parent.lastElementChild === node) {
          return '\n' + content
        } else {
          return '\n\n' + content + '\n\n'
        }
      }
    };

    rules.listItem = {
      filter: 'li',

      replacement: function (content, node, options) {
        content = content
          .replace(/^\n+/, '')
          .replace(/\n+$/, '\n')
          .replace(/\n/gm, '\n    ');
        var prefix = options.bulletListMarker + '   ';
        var parent = node.parentNode;
        if (parent.nodeName === 'OL') {
          var start = parent.getAttribute('start');
          var index = Array.prototype.indexOf.call(parent.children, node);
          prefix = (start ? Number(start) + index : index + 1) + '.  ';
        }
        return (
          prefix + content + (node.nextSibling && !/\n$/.test(content) ? '\n' : '')
        )
      }
    };

    rules.indentedCodeBlock = {
      filter: function (node, options) {
        return (
          options.codeBlockStyle === 'indented' &&
          node.nodeName === 'PRE' &&
          node.firstChild &&
          node.firstChild.nodeName === 'CODE'
        )
      },

      replacement: function (content, node, options) {
        return (
          '\n\n    ' +
          node.firstChild.textContent.replace(/\n/g, '\n    ') +
          '\n\n'
        )
      }
    };

    rules.fencedCodeBlock = {
      filter: function (node, options) {
        return (
          options.codeBlockStyle === 'fenced' &&
          node.nodeName === 'PRE' &&
          node.firstChild &&
          node.firstChild.nodeName === 'CODE'
        )
      },

      replacement: function (content, node, options) {
        var className = node.firstChild.className || '';
        var language = (className.match(/language-(\S+)/) || [null, ''])[1];

        return (
          '\n\n' + options.fence + language + '\n' +
          node.firstChild.textContent +
          '\n' + options.fence + '\n\n'
        )
      }
    };

    rules.horizontalRule = {
      filter: 'hr',

      replacement: function (content, node, options) {
        return '\n\n' + options.hr + '\n\n'
      }
    };

    rules.inlineLink = {
      filter: function (node, options) {
        return (
          options.linkStyle === 'inlined' &&
          node.nodeName === 'A' &&
          node.getAttribute('href')
        )
      },

      replacement: function (content, node) {
        var href = node.getAttribute('href');
        var title = node.title ? ' "' + node.title + '"' : '';
        return '[' + content + '](' + href + title + ')'
      }
    };

    rules.referenceLink = {
      filter: function (node, options) {
        return (
          options.linkStyle === 'referenced' &&
          node.nodeName === 'A' &&
          node.getAttribute('href')
        )
      },

      replacement: function (content, node, options) {
        var href = node.getAttribute('href');
        var title = node.title ? ' "' + node.title + '"' : '';
        var replacement;
        var reference;

        switch (options.linkReferenceStyle) {
        case 'collapsed':
          replacement = '[' + content + '][]';
          reference = '[' + content + ']: ' + href + title;
          break;
        case 'shortcut':
          replacement = '[' + content + ']';
          reference = '[' + content + ']: ' + href + title;
          break;
        default:
          var id = this.references.length + 1;
          replacement = '[' + content + '][' + id + ']';
          reference = '[' + id + ']: ' + href + title;
        }

        this.references.push(reference);
        return replacement
      },

      references: [],

      append: function (options) {
        var references = '';
        if (this.references.length) {
          references = '\n\n' + this.references.join('\n') + '\n\n';
          this.references = [];
        }
        return references
      }
    };

    rules.emphasis = {
      filter: ['em', 'i'],

      replacement: function (content, node, options) {
        if (!content.trim()) return ''
        return options.emDelimiter + content + options.emDelimiter
      }
    };

    rules.strong = {
      filter: ['strong', 'b'],

      replacement: function (content, node, options) {
        if (!content.trim()) return ''
        return options.strongDelimiter + content + options.strongDelimiter
      }
    };

    rules.code = {
      filter: function (node) {
        var hasSiblings = node.previousSibling || node.nextSibling;
        var isCodeBlock = node.parentNode.nodeName === 'PRE' && !hasSiblings;

        return node.nodeName === 'CODE' && !isCodeBlock
      },

      replacement: function (content) {
        if (!content.trim()) return ''

        var delimiter = '`';
        var leadingSpace = '';
        var trailingSpace = '';
        var matches = content.match(/`+/gm);
        if (matches) {
          if (/^`/.test(content)) leadingSpace = ' ';
          if (/`$/.test(content)) trailingSpace = ' ';
          while (matches.indexOf(delimiter) !== -1) delimiter = delimiter + '`';
        }

        return delimiter + leadingSpace + content + trailingSpace + delimiter
      }
    };

    rules.image = {
      filter: 'img',

      replacement: function (content, node) {
        var alt = node.alt || '';
        var src = node.getAttribute('src') || '';
        var title = node.title || '';
        var titlePart = title ? ' "' + title + '"' : '';
        return src ? '![' + alt + ']' + '(' + src + titlePart + ')' : ''
      }
    };



    function Rules (options) {
      this.options = options;
      this._keep = [];
      this._remove = [];

      this.blankRule = {
        replacement: options.blankReplacement
      };

      this.keepReplacement = options.keepReplacement;

      this.defaultRule = {
        replacement: options.defaultReplacement
      };

      this.array = [];
      for (var key in options.rules) this.array.push(options.rules[key]);
    }

    Rules.prototype = {
      add: function (key, rule) {
        this.array.unshift(rule);
      },

      keep: function (filter) {
        this._keep.unshift({
          filter: filter,
          replacement: this.keepReplacement
        });
      },

      remove: function (filter) {
        this._remove.unshift({
          filter: filter,
          replacement: function () {
            return ''
          }
        });
      },

      forNode: function (node) {
        if (node.isBlank) return this.blankRule;
        var rule;

        if ((rule = findRule(this.array, node, this.options))) return rule;
        if ((rule = findRule(this._keep, node, this.options))) return rule;
        if ((rule = findRule(this._remove, node, this.options))) return rule;

        return this.defaultRule;
      },

      forEach: function (fn) {
        for (var i = 0; i < this.array.length; i++) fn(this.array[i], i);
      }
    };

    function findRule (rules, node, options) {
      for (var i = 0; i < rules.length; i++) {
        var rule = rules[i];
        if (filterValue(rule, node, options)) return rule
      }
      return void 0
    }

    function filterValue (rule, node, options) {
      var filter = rule.filter;
      if (typeof filter === 'string') {
        if (filter === node.nodeName.toLowerCase()) return true
      } else if (Array.isArray(filter)) {
        if (filter.indexOf(node.nodeName.toLowerCase()) > -1) return true
      } else if (typeof filter === 'function') {
        if (filter.call(rule, node, options)) return true
      } else {
        throw new TypeError('`filter` needs to be a string, array, or function')
      }
    }



    function collapseWhitespace (options) {
      var element = options.element;
      var isBlock = options.isBlock;
      var isVoid = options.isVoid;
      var isPre = options.isPre || function (node) {
        return node.nodeName === 'PRE'
      };

      if (!element.firstChild || isPre(element)) return

      var prevText = null;
      var prevVoid = false;

      var prev = null;
      var node = next(prev, element, isPre);

      while (node !== element) {
        if (node.nodeType === 3 || node.nodeType === 4) {
          var text = node.data.replace(/[ \r\n\t]+/g, ' ');

          if ((!prevText || / $/.test(prevText.data)) &&
              !prevVoid && text[0] === ' ') {
            text = text.substr(1);
          }


          if (!text) {
            node = remove(node);
            continue
          }

          node.data = text;

          prevText = node;
        } else if (node.nodeType === 1) {
          if (isBlock(node) || node.nodeName === 'BR') {
            if (prevText) {
              prevText.data = prevText.data.replace(/ $/, '');
            }

            prevText = null;
            prevVoid = false;
          } else if (isVoid(node)) {

            prevText = null;
            prevVoid = true;
          }
        } else {
          node = remove(node);
          continue
        }

        var nextNode = next(prev, node, isPre);
        prev = node;
        node = nextNode;
      }

      if (prevText) {
        prevText.data = prevText.data.replace(/ $/, '');
        if (!prevText.data) {
          remove(prevText);
        }
      }
    }



    function remove (node) {
      var next = node.nextSibling || node.parentNode;

      node.parentNode.removeChild(node);

      return next
    }



    function next (prev, current, isPre) {
      if ((prev && prev.parentNode === current) || isPre(current)) {
        return current.nextSibling || current.parentNode
      }

      return current.firstChild || current.nextSibling || current.parentNode
    }



    var root = (typeof window !== 'undefined' ? window : {});



    function canParseHTMLNatively () {
      var Parser = root.DOMParser;
      var canParse = false;



      try {

        if (new Parser().parseFromString('', 'text/html')) {
          canParse = true;
        }
      } catch (e) {}

      return canParse
    }

    function createHTMLParser () {
      var Parser = function () {};

      {
        if (shouldUseActiveX()) {
          Parser.prototype.parseFromString = function (string) {
            var doc = new window.ActiveXObject('htmlfile');
            doc.designMode = 'on';
            doc.open();
            doc.write(string);
            doc.close();
            return doc
          };
        } else {
          Parser.prototype.parseFromString = function (string) {
            var doc = document.implementation.createHTMLDocument('');
            doc.open();
            doc.write(string);
            doc.close();
            return doc
          };
        }
      }
      return Parser
    }

    function shouldUseActiveX () {
      var useActiveX = false;
      try {
        document.implementation.createHTMLDocument('').open();
      } catch (e) {
        if (window.ActiveXObject) useActiveX = true;
      }
      return useActiveX;
    }

    var HTMLParser = canParseHTMLNatively() ? root.DOMParser : createHTMLParser();

    function RootNode (input) {
      var root;
      if (typeof input === 'string') {
        var doc = htmlParser().parseFromString(



          '<x-turndown id="turndown-root">' + input + '</x-turndown>',
          'text/html'
        );
        root = doc.getElementById('turndown-root');
      } else {
        root = input.cloneNode(true);
      }
      collapseWhitespace({
        element: root,
        isBlock: isBlock,
        isVoid: isVoid
      });

      return root;
    }

    var _htmlParser;
    function htmlParser () {
      _htmlParser = _htmlParser || new HTMLParser();
      return _htmlParser;
    }

    function Node (node) {
      node.isBlock = isBlock(node);
      node.isCode = node.nodeName.toLowerCase() === 'code' || node.parentNode.isCode;
      node.isBlank = isBlank(node);
      node.flankingWhitespace = flankingWhitespace(node);
      return node;
    }

    function isBlank (node) {
      return (
        ['A', 'TH', 'TD'].indexOf(node.nodeName) === -1 &&
        /^\s*$/i.test(node.textContent) &&
        !isVoid(node) &&
        !hasVoid(node)
      );
    }

    function flankingWhitespace (node) {
      var leading = '';
      var trailing = '';

      if (!node.isBlock) {
        var hasLeading = /^[ \r\n\t]/.test(node.textContent);
        var hasTrailing = /[ \r\n\t]$/.test(node.textContent);

        if (hasLeading && !isFlankedByWhitespace('left', node)) {
          leading = ' ';
        }
        if (hasTrailing && !isFlankedByWhitespace('right', node)) {
          trailing = ' ';
        }
      }

      return { leading: leading, trailing: trailing };
    }

    function isFlankedByWhitespace (side, node) {
      var sibling;
      var regExp;
      var isFlanked;

      if (side === 'left') {
        sibling = node.previousSibling;
        regExp = / $/;
      } else {
        sibling = node.nextSibling;
        regExp = /^ /;
      }

      if (sibling) {
        if (sibling.nodeType === 3) {
          isFlanked = regExp.test(sibling.nodeValue);
        } else if (sibling.nodeType === 1 && !isBlock(sibling)) {
          isFlanked = regExp.test(sibling.textContent);
        }
      }
      return isFlanked;
    }

    var reduce = Array.prototype.reduce;
    var leadingNewLinesRegExp = /^\n*/;
    var trailingNewLinesRegExp = /\n*$/;

    function TurndownService (options) {
      if (!(this instanceof TurndownService)) return new TurndownService(options);

      var defaults = {
        rules: rules,
        headingStyle: 'setext',
        hr: '* * *',
        bulletListMarker: '*',
        codeBlockStyle: 'indented',
        fence: '```',
        emDelimiter: '_',
        strongDelimiter: '**',
        linkStyle: 'inlined',
        linkReferenceStyle: 'full',
        br: '  ',
        blankReplacement: function (content, node) {
          return node.isBlock ? '\n\n' : '';
        },
        keepReplacement: function (content, node) {
          return node.isBlock ? '\n\n' + node.outerHTML + '\n\n' : node.outerHTML;
        },
        defaultReplacement: function (content, node) {
          return node.isBlock ? '\n\n' + content + '\n\n' : content;
        }
      };
      this.options = extend({}, defaults, options);
      this.rules = new Rules(this.options);
    }

    TurndownService.prototype = {
      turndown: function (input) {
        if (!canConvert(input)) {
          throw new TypeError(
            input + ' is not a string, or an element/document/fragment node.'
          );
        }
        if (input === '') return '';
        var output = process.call(this, new RootNode(input));
        return postProcess.call(this, output);
      },
      use: function (plugin) {
        if (Array.isArray(plugin)) {
          for (var i = 0; i < plugin.length; i++) this.use(plugin[i]);
        } else if (typeof plugin === 'function') {
          plugin(this);
        } else {
          throw new TypeError('plugin must be a Function or an Array of Functions');
        }
        return this;
      },
      addRule: function (key, rule) {
        this.rules.add(key, rule);
        return this;
      },
      keep: function (filter) {
        this.rules.keep(filter);
        return this;
      },
      remove: function (filter) {
        this.rules.remove(filter);
        return this;
      },
      escape: function (string) {
        return (
          string

            .replace(/\\(\S)/g, '\\\\$1')


            .replace(/^(#{1,6} )/gm, '\\$1')


            .replace(/^([-*_] *){3,}$/gm, function (match, character) {
              return match.split(character).join('\\' + character);
            })


            .replace(/^(\W* {0,3})(\d+)\. /gm, '$1$2\\. ')


            .replace(/^([^\\\w]*)[*+-] /gm, function (match) {
              return match.replace(/([*+-])/g, '\\$1');
            })


            .replace(/^(\W* {0,3})> /gm, '$1\\> ')


            .replace(/\*+(?![*\s\W]).+?\*+/g, function (match) {
              return match.replace(/\*/g, '\\*');
            })


            .replace(/_+(?![_\s\W]).+?_+/g, function (match) {
              return match.replace(/_/g, '\\_');
            })


            .replace(/`+(?![`\s\W]).+?`+/g, function (match) {
              return match.replace(/`/g, '\\`');
            })


            .replace(/[\[\]]/g, '\\$&')
        );
      }
    };



    function process (parentNode) {
      var self = this;
      return reduce.call(parentNode.childNodes, function (output, node) {
        node = new Node(node);

        var replacement = '';
        if (node.nodeType === 3) {
          replacement = node.isCode ? node.nodeValue : self.escape(node.nodeValue);
        } else if (node.nodeType === 1) {
          replacement = replacementForNode.call(self, node);
        }

        return join(output, replacement);
      }, '');
    }



    function postProcess (output) {
      var self = this;
      this.rules.forEach(function (rule) {
        if (typeof rule.append === 'function') {
          output = join(output, rule.append(self.options));
        }
      });

      return output.replace(/^[\t\r\n]+/, '').replace(/[\t\r\n\s]+$/, '');
    }



    function replacementForNode (node) {
      var rule = this.rules.forNode(node);
      var content = process.call(this, node);
      var whitespace = node.flankingWhitespace;
      if (whitespace.leading || whitespace.trailing) content = content.trim();
      return (
        whitespace.leading +
        rule.replacement(content, node, this.options) +
        whitespace.trailing
      );
    }



    function separatingNewlines (output, replacement) {
      var newlines = [
        output.match(trailingNewLinesRegExp)[0],
        replacement.match(leadingNewLinesRegExp)[0]
      ].sort();
      var maxNewlines = newlines[newlines.length - 1];
      return maxNewlines.length < 2 ? maxNewlines : '\n\n';
    }

    function join (string1, string2) {
      var separator = separatingNewlines(string1, string2);


      string1 = string1.replace(trailingNewLinesRegExp, '');
      string2 = string2.replace(leadingNewLinesRegExp, '');

      return string1 + separator + string2;
    }



    function canConvert (input) {
      return (
        input != null && (
          typeof input === 'string' ||
          (input.nodeType && (
            input.nodeType === 1 || input.nodeType === 9 || input.nodeType === 11
          ))
        )
      );
    }

    return TurndownService;

  }());

  var turndownPluginGfm = (function (exports) {

    var highlightRegExp = /highlight-(?:text|source)-([a-z0-9]+)/;

    function highlightedCodeBlock (turndownService) {
      turndownService.addRule('highlightedCodeBlock', {
        filter: function (node) {
          var firstChild = node.firstChild;
          return (
            node.nodeName === 'DIV' &&
            highlightRegExp.test(node.className) &&
            firstChild &&
            firstChild.nodeName === 'PRE'
          );
        },

        replacement: function (content, node, options) {
          var className = node.className || '';
          var language = (className.match(highlightRegExp) || [null, ''])[1];

          return (
            '\n\n' + options.fence + language + '\n' +
            node.firstChild.textContent +
            '\n' + options.fence + '\n\n'
          );
        }
      });
    }

    function strikethrough (turndownService) {
      turndownService.addRule('strikethrough', {
        filter: ['del', 's', 'strike'],
        replacement: function (content) {
          return '~' + content + '~';
        }
      });
    }

    var indexOf = Array.prototype.indexOf;
    var every = Array.prototype.every;
    var rules = {};

    rules.tableCell = {
      filter: ['th', 'td'],
      replacement: function (content, node) {
        return cell(content, node);
      }
    };

    rules.tableRow = {
      filter: 'tr',
      replacement: function (content, node) {
        var borderCells = '';
        var alignMap = { left: ':--', right: '--:', center: ':-:' };

        if (isHeadingRow(node)) {
          for (var i = 0; i < node.childNodes.length; i++) {
            var border = '---';
            var align = (
              node.childNodes[i].getAttribute('align') || ''
            ).toLowerCase();

            if (align) border = alignMap[align] || border;

            borderCells += cell(border, node.childNodes[i]);
          }
        }
        return '\n' + content + (borderCells ? '\n' + borderCells : '');
      }
    };

    rules.table = {
      filter: 'table',
      replacement: function (content) {

        content = content.replace('\n\n', '\n');
        return '\n\n' + content + '\n\n';
      }
    };

    rules.tableSection = {
      filter: ['thead', 'tbody', 'tfoot'],
      replacement: function (content) {
        return content;
      }
    };



    function isHeadingRow (tr) {
      var parentNode = tr.parentNode;
      return (
        parentNode.nodeName === 'THEAD' ||
        (
          parentNode.firstChild === tr &&
          (parentNode.nodeName === 'TABLE' || isFirstTbody(parentNode)) &&
          every.call(tr.childNodes, function (n) { return n.nodeName === 'TH'; })
        )
      );
    }

    function isFirstTbody (element) {
      var previousSibling = element.previousSibling;
      return (
        element.nodeName === 'TBODY' && (
          !previousSibling ||
          (
            previousSibling.nodeName === 'THEAD' &&
            /^\s*$/i.test(previousSibling.textContent)
          )
        )
      );
    }

    function cell (content, node) {
      var index = indexOf.call(node.parentNode.childNodes, node);
      var prefix = ' ';
      if (index === 0) prefix = '| ';
      return prefix + content + ' |';
    }

    function tables (turndownService) {
      for (var key in rules) turndownService.addRule(key, rules[key]);
    }

    function taskListItems (turndownService) {
      turndownService.addRule('taskListItems', {
        filter: function (node) {
          return node.type === 'checkbox' && node.parentNode.nodeName === 'LI';
        },
        replacement: function (content, node) {
          return (node.checked ? '[x]' : '[ ]') + ' ';
        }
      });
    }

    function gfm (turndownService) {
      turndownService.use([
        highlightedCodeBlock,
        strikethrough,
        tables,
        taskListItems
      ]);
    }

    exports.gfm = gfm;
    exports.highlightedCodeBlock = highlightedCodeBlock;
    exports.strikethrough = strikethrough;
    exports.tables = tables;
    exports.taskListItems = taskListItems;

    return exports;

  }({}));

  const pre_spacing = {
    filter: 'pre',
    replacement: function (content) {
      return '\n\n```\n' + content.replace(/\n/g , ' ') + ' \n```\n\n';
    }
  };



  const table_row_fix = {
    filter: 'tr',
    replacement: function (content) {
      content = content.replace(/^\+|\n\n$/g, '');
      var out = '';
      var cols = content.querySelectorAll('td');
      cols.forEach(function(col){
        out += '' + col.innerText + ' - ';
      } );


      return '\n| ' + out.replace(/\n/g , ' ') + ' \n';
    }
  };

  const turndown = {
    codeBlockStyle: 'fenced',
    linkStyle: 'inlined',
    linkReferenceStyle: 'full',
    headingStyle: 'atx',
    strongDelimiter: '**',
    emDelimiter: '_',
    fence: '```',
    bulletListMarker: '*',
    hr: '---'
  };

  function h2mSetup (options) {

    var service = new TurndownService(options);

    var gfm = turndownPluginGfm.gfm;

    service.use(gfm);
    service.addRule(pre_spacing);
    service.addRule(table_row_fix);

    if (options.rules) {

    }
    return service;
  }



  var Html2Md_Service = h2mSetup(turndown);



  var html2md = Html2Md_Service.turndown;

  var markdown_lib = md_to_html;

  const mdTools = {
    md2parse: markdown_lib.mdparse,
    md2html: markdown_lib.md2html,
    md2htmltree: markdown_lib.md2htmltree,
    md2json: markdown_lib.md2json,
    html2md: html2md,
  };

  const MarkdownEditor = function (options) {

    this.htmlID = 'html_content';
    this.mdID = 'md_content';
    this.content = false;
    this.preview = false;

    if(options) {
      if (options.htmlID) {
        this.htmlID = options.htmlID;
      }
      if (options.mdID) {
        this.mdID = options.mdID;
      }
    }

    var updatePreview = function (input) {
      return this.preview.innerHTML = input;
    };

    var updateContent = function (input) {
      return this.content.innerHTML = input;
    };

    var getHtmlContent = function () {
      return this.content.innerHTML;
    };

    var getMdContent = function () {
      return this.preview.innerText;
    };

    var updateEditors = function (content) {
      updateContent(content);
      updatePreview();
    };

    var InitializeEditor = function () {
      this.content = document.getElementById(this.mdID);
      this.preview = document.getElementById(this.htmlID);
      return this;
    };

    this.getMdContent = getMdContent;
    this.getHtmlContent = getHtmlContent;
    this.initializeEditor = InitializeEditor;
    this.updatePreview = updatePreview;
    this.updateContent = updateContent;
    this.updateEditors = updateEditors;

    var editor = this;

    return editor;
  };

  const MkDownEditor = MarkdownEditor;

  const mkDownEditor = new MkDownEditor({
    htmlID: 'html_content',
    mdID: 'md_content'
  });

  var html2md$1 = mdTools.html2md;
  var snapshot$1 = Snapshot;
  var context = Context;

  var MAX_ASYNC_REQUESTS = 5;
  var async_retry_count = 0;

  var headers_ready = false;
  var html_ready = false;
  var markdown_ready = false;
  var process_snapshot_in_progress;
  var update_complete = false;



  function new_snapshot () {
    var options = {
      title: '',
      description: '',
      save_to_json: false,
      headers: true,
      log_to_console: true,
    };

    if (options.headers ) {
      headers_ready = context.update_document_headers_data();
    }

    html_ready = context.update_document_html_data();

    if (html_ready) {
      notify_md_service();
    }

    snapshot$1.log_status();
    handle_async_tasks();
  }


  function notify_md_service () {
    var html_result = snapshot$1.get_property('html');
    html_ready = true;
    var markdown_result = html2md$1(html_result);
    if (markdown_result) {
      markdown_ready = true;
      update_complete = processSnapshot();
      return update_complete;
    } else {
      return false;
    }
  }



  function processSnapshot() {

    if(!markdown_ready) {
      markdown_ready = snapshot$1.is_property('markdown');
    }

    if(!headers_ready ) {
      headers_ready = snapshot$1.is_property('header');
    }
    var content = snapshot$1.get_data();

    if (!content) {
      failed('[PROCESS SNAPSHOT | SNAPSHOT GET DATA]');
      process_snapshot_in_progress = false;
      return process_snapshot_in_progress;
    }
    var document_content = '';
    process_snapshot_in_progress = 1;
    if (content['markdown']) {
      if ( content ['header'])  {
        document_content += content ['header'] + '\n\n';
      }
      document_content += content['markdown']+'\n\n';
      mkDownEditor.updateEditors(document_content);
    }


    to_user(document_content);
    process_snapshot_in_progress = false;
    async_retry_count = 100;
    return false;
  }


  function handle_async_tasks () {
    if (!snapshot$1.get_data()) {
      failed('SNAPSHOT DATA IS UNDEFINED');
      return false;
    }
    if (process_snapshot_in_progress) {
      return;
    }
    if (!headers_ready) {
      headers_ready = snapshot$1.is_property('header');
    }
    if (!markdown_ready) {
      markdown_ready = snapshot$1.is_property('markdown');
    }
    if(headers_ready && markdown_ready){
      process_snapshot_in_progress = 1;
      if (processSnapshot()) {
        success('SNAPSHOT COMPLETE');
        return false;
      }
    } else {
      async_retry_count = async_retry_count + 1;
      if (async_retry_count < MAX_ASYNC_REQUESTS ) {
        setTimeout(function(){
          handle_async_tasks();
        }, 1500);
      }
    }
    snapshot$1.log_status();
    handle_async_tasks();
  }

  var SnapManager = /*#__PURE__*/Object.freeze({
    get update_complete () { return update_complete; },
    new_snapshot: new_snapshot,
    notify_md_service: notify_md_service,
    processSnapshot: processSnapshot,
    handle_async_tasks: handle_async_tasks
  });

  var index = {
    snapshotManager: Snapshot,
    panelManager: SnapManager,
    dataManager: Context
  };

  return index;

})));
//# sourceMappingURL=panel.js.map
