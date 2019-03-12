class DomInspector {
  constructor() {
    this.paused = false;
    this.hidden = false;
    this.selected = false;
    this.inspector_tool = false;
  }
  select (selected) {
    if ( this.paused !== false ){
      console.log("This paused");
      return false;
    }
    selected.classList.add('selected_item');
    this.selected=selected;
    this.update(selected);
    this.wait();
  };
  wait () {
    if ( this.paused !== false ){
      console.log("This paused");
      return false;
    }
    console.log("WAITING");
    this.paused = "PAUSED";
    setTimeout( this.resume(), 2000);
  }

  resume () {
    console.log("RESUME");
    this.paused = false;
  }

  hide () {
    this.hidden = true;
    this.style.display = 'none';
    return this;
  };

  show () {
    this.hidden = false;
    return this;s
  };

  check (selected) {
    if (selected ){
      // tagName=["DIV"];
      // parentNode=
      // console.dir(selected);
      // innerHTML !== "";
      // hidden === false
    }
  }
  update (selected) {
    var style = getComputedStyle(selected);
    console.log("UPDATING",selected.style.width);
    var bounds = selected.getBoundingClientRect();
    this.inspector_tool.style.width  = bounds.width + "px"
    this.inspector_tool.style.height = bounds.height + "px";
    this.inspector_tool.style.left   = bounds.offsetLeft;
    this.inspector_tool.style.top    = bounds.offsetTop;
  };

  RenderInspector () {
    var _inspector_tool = document.createElement("DIV");
    _inspector_tool.id = "inspector_target";
    _inspector_tool.classList.add('is_active');
    _inspector_tool.style="outline:2px solid red;width:150px;height:60px;display:block;position:absolute;background:#8a8a8a6b;top:30px;left:30px;";
    document.body.appendChild(_inspector_tool);
    document.body.classList.add('inspector_tool__is_active');
    this.inspector_tool = _inspector_tool
    return _inspector_tool;
  };
}
var inspect_node = new DomInspector();
inspect_node.RenderInspector();
console.log("inspect_node", inspect_node);
document.body.addEventListener("click",
  function(e){
    inspect_node.select(e.target);

    e.stopPropagation();
    console.log(e.target);
  }
);
var blocks = document.body.querySelectorAll('div');
for (var i = 0; i < blocks.length; i++) {
 blocks[i].addEventListener("mouseenter",
   function(e){
     console.log(e);
     e.target.style.border = "1px solid red";
     // e.currentTarget.style.outline = "2px dashed blue";
     e.stopPropagation();
   }
);
blocks[i].addEventListener("onmouseout",
   function(e){
     console.log("mouseout", e);
     e.target.style.border = "";
     // e.currentTarget.style.outline = "";
   e.stopPropagation();
 }
)
// document.body.addEventListener("mouseenter",
//   function(e){
//     e.target.style.outline = "2px solid red";
//     console.log(e.type, e.target)
//     // e.stopPropagation();
//   }
// );
// document.body.addEventListener("onmouseover",
//   function(e){
//     e.target.style.outline = "2px solid red";
//     console.log(e);
//     // e.stopPropagation();
//   }
// );
//
// document.body.addEventListener("onmouseout",
//   function(e){
//     e.target.style.outline = "";
//     console.log(e.target.style);
//     // e.stopPropagation();
//   }
// );
// document.body.addEventListener("onmouseleave",
//   function(e){
//     console.log(e);
//     // e.stopPropagation();
//   }
// );
}
