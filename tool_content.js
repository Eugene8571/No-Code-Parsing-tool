var RMB_TARGET = null;
var	HOME_URL = "http://127.0.0.1:8000/";

document.addEventListener('contextmenu', function (event) {
  RMB_TARGET = event.target;
});

const tool = {
	hoveredElement: false,
	markedElement: false,
	highlightedHover: false,
	highlightedSelect: false,
	targetingMode: false,
	activeElement: false,
	selectedElement: false,
	transpose: 0, // how far to travel up the line of ancestors
	selectedElems: [],
	apiArgs: {},
	helpWindow: false,

	outlineHover: 'rgba(52, 152, 219, 0.5) solid 5px',
	outlineSelect: 'rgba(230, 126, 34, 0.5) solid 5px', 


	highlightHovered: function() {
		if (!tool.hoveredElement) return;

		if (tool.highlightedHover) {
			tool.removeHighlightStyle(tool.highlightedHover, tool.outlineHover);
		}

		tool.highlightedHover = tool.hoveredElement;

		if (window.getComputedStyle(tool.hoveredElement, null).outline !== tool.outlineSelect) {
			tool.addHighlightStyle(tool.highlightedHover, tool.outlineHover);
		};

		// display PathHTML
		document.querySelector('#tool_current_elm').innerHTML = tool.getPathHTML(tool.hoveredElement, tool.transpose);
		document.querySelector('#tool_current_elm').scrollTop = 9999;
	},

	highlightSelected: function() {
		if (!tool.selectedElement) return;
		tool.removeHighlightStyle(tool.selectedElement, tool.outlineSelect);

		tool.highlightedSelect = tool.activeElement;

		let i = 0;
		for (i = 0; i < tool.transpose; i++) {
			if (tool.highlightedSelect.parentNode != window.document) {
				tool.highlightedSelect = tool.highlightedSelect.parentNode;
			} else {
				break;
			}
		}
		
		tool.transpose = i;
		tool.selectedElement = tool.highlightedSelect
		tool.addHighlightStyle(tool.selectedElement, tool.outlineSelect);

		document.querySelector('#tool_selected_elm').innerHTML = tool.getPathHTML(
			tool.selectedElement, tool.transpose);
		document.querySelector('#tool_selected_elm').scrollTop = 9999;
	},
	
	selectElement: function(e) {
		if (tool.isChildOftoolWindow(e.target)) return;
		
		if (tool.selectedElems.includes(e.target)) { // toggle select
			tool.selectedElems.splice(tool.selectedElems.indexOf(e.target), 1);
			tool.removeHighlightStyle(e.target, tool.outlineSelect);
			return;
		};


		line = tool.getPathHTML(e.target);

		if (e.target) {
			tool.activeElement = e.target;
			tool.selectedElement = e.target;

			if (tool.highlightedHover) {
				tool.removeHighlightStyle(tool.highlightedHover, tool.outlineHover);
			};
			tool.addHighlightStyle(e.target, tool.outlineSelect);

			tool.selectedElems.push(e.target);
			var n = Object.keys(tool.apiArgs).length;
			tool.apiArgs['block' + n.toString()] = line;
			tool.updateCSS();
			tool.updateElementList();
			tool.triggerResize();
		}
	},


	addHighlightStyle: function (elm, outline) {
		if (window.getComputedStyle(elm, null).outline == tool.outlineHover) return;
		elm.style.outline = outline;
		elm.style.outlineOffset = '-5px';
	},

	removeHighlightStyle: function (elm, outline) {
		if (window.getComputedStyle(elm, null).outline !== outline) return;
		elm.style.outline = '';
		elm.style.outlineOffset = '';
	},

	mouseover: function(e) {
		if (tool.isChildOftoolWindow(e.target)) {
			tool.removeHighlightStyle(tool.highlightedHover, tool.outlineHover); 
			return;
		}
		if (tool.hoveredElement != e.target) {
			tool.transpose = 0;
			tool.hoveredElement = e.target;
			tool.highlightHovered();
		}
	},
	
	isChildOftoolWindow: function(elm) {
		for (var i = 0; i < 8; i++) {
			if (elm == tool.helpWindow) return true;
			elm = elm.parentNode;
			if (!elm) break;
		}

		return false;
	},
	
	keyDown: function(e) {

		if (!tool.activeElement) return;
		
		if (e.keyCode == 27) {
			tool.deactivate();
		}
		
		if (e.keyCode == 87) { // W
			if (tool.transpose > 0) tool.transpose--;
			tool.highlightSelected();
		} else if (e.keyCode == 81) { // Q
			tool.transpose++;
			tool.highlightSelected();
		}
		return false;
	},
	
	keyUp: function(e) {
		if (!tool.activeElement) return;
		return false;
	},
	
	triggerResize: function() {
		let evt = document.createEvent('UIEvents');
		evt.initUIEvent('resize', true, false,window,0);
		window.dispatchEvent(evt);
	},

	getPathHTML: function (element, transpose) {
		function getElmName (elm) {
			if (elm.id) {
				return "#" + elm.id;
			} else if (typeof elm.className == "string" && elm.className.trim().length) {
				return elm.tagName.toLowerCase() + "." + elm.className.trim().split(" ").join(".");
			} else {
				return elm.tagName.toLowerCase();
			}
		}

		let path = [];
		let currentElm = element;

		while (currentElm) {
			path.push(currentElm);
			currentElm = currentElm.parentElement;
		}

		path = path.reverse();

		let html = [];
		for (let i = 0; i < path.length; i++) {
			html.push(`${path.length - 1 - i == transpose ? "" : ""}${getElmName(path[i])}`);
		}

		return html.join(" > ");
	},
	
	updateCSS: function() {
		let cssLines = [
			`
			#tool_wnd {
			  position: fixed;
			  top: 15%;
			  right: 10px;
			  width: 180px;
			  box-sizing: content-box;
			  background: #fff;
			  box-shadow:
			    0 7px 14px rgba(0, 0, 0, 0.25),
			    0 5px 5px rgba(0, 0, 0, 0.22);
			  text-align: center;
			  z-index: 2147483647;
			  margin: 0;
			  padding: 0;
			  box-sizing: border-box;
			  font-family: sans-serif;
			  cursor: default;
			  user-select: none;
			}


			#tool_wnd .ct_logo {
			  font-size: 18px;
			  text-align: left;
			  background-color: #ccc;
			  position: absolute;
			  cursor: move;
			  width: 100%;
			  height: 40px;
			  padding: 9px;
			  box-sizing: border-box;
			}

			#tool_wnd .tool_wind_body {
			  margin: 50px 7px 7px 7px;
			}

			#tool_area_btn {
			  width: 90px;
			  height: 40px;
			  position: relative;
			  background-color: #F2F2F2;
			  margin: auto;
			}

			#tool_row_btn {
			  width: 45px;
			  height: 30px;
			  position: absolute;
			  margin: -36px 5px 5px 50px;
			  background-color: #F2F2F2;
			  border: 1px solid black;
			  line-height: 30px;

			}

			#tool_wnd>div.tool_wind_body>table {
			  border-collapse: separate;
			  border-spacing: 10px 1em;
			  border: 0;
			  padding: 0;
			  margin: 0;
			}

			#tool_wnd>div.tool_wind_body>table>tbody>tr,
			#tool_wnd>div.tool_wind_body>table>tbody>tr>td,
			#tool_wnd>div.tool_wind_body>table>tbody>tr>th {
			  padding: 0;
			  text-align: center;
			  border: 0;
			}

			.tool_column_elem,
			.tool_value_elem {
			  width: 50px;
			  height: 30px;
			  overflow: hidden;
			  background-color: #F2F2F2;
			  border: 1px solid black;
			  line-height: 30px;
			  box-sizing: border-box;
			}

			#tool_flip_page_area {
			  width: 90px;
			  height: 40px;
			  font-size: 21px;
			  position: relative;
			  background-color: #F2F2F2;
			  line-height: 50px;
			  box-sizing: border-box;
			  margin: auto;
			}

			#tool_page_number_elem {
			  display: inline-block;
			  background-color: #F2F2F2;
			  width: 30px;
			  height: 30px;
			  position: absolute;
			  margin: -36px 5px 5px -15px;
        border: 1px solid black;
			  box-sizing: border-box;
			  font-size: 21px;
			  line-height: 30px;
			}

			.tool_cleare_selected {
			  border: none;
			  background: transparent;
			  color: #E65A1A;
			  font-weight: 500;
			}

			#tool_Q_W>div.shorter,
			#tool_Q_W>div.longer {
			  margin: 5px;
			  color: black;
			  height: 30px;
			  width: 50px;
			  background-color: #F2F2F2;
			  border: 1px solid black;
			  line-height: 30px;
			  box-sizing: border-box;
			  display: inline-block;
			  /* margin: auto; */
			  margin-top: 10px;
			}

			.send_selected {
			  line-height: 40px;
			  width: 100px;
			  margin: auto;
			  margin-top: 15px;

			}


			#tool_wnd .ct_close {
			  position: absolute;
			  top: 0px;
			  right: 0px;
			}

			#tool_wnd .ct_close>div {
			  font-size: 21px;
			  width: 40px;
			  height: 40px;
			  border: 0;
			  background-color: #E67E22;
			  cursor: default;
			  line-height: 40px;
			  text-align: center;
			}

			.send_selected>div {
			  text-align: center;
			  font-size: 21px;
			  height: 40px;
			  border: 0;
			  background-color: #3498DB;


			}

			#tool_current_elm,
			#tool_clicked_elm,
			#tool_selected_elm {
			  width: 160px;
			  margin-top: 5px;
			  background: #f7f7f7;
			  border: solid 12px #f7f7f7;
			  border-width: 12px 0 12px 0;
			  max-height: 84px;
			  overflow: hidden;
			  color: black;
			  user-select: text;

			}

			`
		];

		let styleElm = document.querySelector('#tool_styles');
		if (!styleElm) {
			styleElm = document.createElement('style');
			styleElm.type = "text/css";
			styleElm.id = "tool_styles";
			document.head.appendChild(styleElm);
		}

		while (styleElm.firstChild) {
		    styleElm.removeChild(styleElm.firstChild);
		}
		styleElm.appendChild(document.createTextNode(cssLines.join('\n')));
	},

	updateElementList: function() {
		if (!tool.helpWindow) return;

		let elmList_selected = document.querySelector('#tool_selected_elm');

		let line = "";

		if (tool.selectedElems.length) {
			line = tool.getPathHTML(tool.selectedElement);
		}
		
		elmList_selected.innerHTML = line;
		document.querySelector('#tool_clicked_elm').innerHTML = tool.getPathHTML(tool.activeElement);
		
		document.getElementById('tool_selected_elm').scrollTop = 9999;
		document.getElementById('tool_clicked_elm').scrollTop = 9999;

	},
	
	lockPage: function() {
		lockElements(document.getElementsByTagName("a"));
		lockElements(document.getElementsByTagName("input"));
		lockElements(document.getElementsByTagName("button"));


		function lockElements(el) {
			for (let i = 0; i < el.length; i++) {
				el[i].onclick = "return false;";
				el[i].href = "#"+el[i].href; //d
				el[i].target = "";
			}
		}
	},

	helpWindowSpawn: function() {
		let div = document.createElement('div');
		div.setAttribute("id", "tool_wnd");
		document.body.appendChild(div);

		div.innerHTML = `
  <div id="tool_wnd_header">
    <div class="ct_logo">Parsing tool</div>
    <div class="ct_close">
      <div>✖️</div>
    </div>
  </div>

  <div class="tool_wind_body">
    <table>
      <tr>
        <td colspan="2">
          <div>
            <div id="tool_area_btn"></div>
            <div id="tool_row_btn">row</div>
          </div>
        </td>
        <td>
          <div id="tool_clear_area_row" class="tool_cleare_selected">X</div>
        </td>
      </tr>
      <tr>
        <td>
          <div class="tool_column_elem"></div>
        </td>
        <td>
          <div class="tool_value_elem"></div>
        </td>
        <td>
          <div class="tool_cleare_selected">X</div>
        </td>
      </tr>
      <tr>
        <td>
          <div class="tool_column_elem"></div>
        </td>
        <td>
          <div class="tool_value_elem"></div>
        </td>
        <td>
          <div class="tool_cleare_selected">X</div>
        </td>
      </tr>

      <tr>
        <td colspan="2">
          <div>
            <div id="tool_flip_page_area">. . . . . . .</div>
            <div id="tool_page_number_elem">2</div>
          </div>
        </td>
        <td>
          <div class="tool_cleare_selected">X</div>
        </td>

      </tr>
      <tr>
        <td colspan="3">
          <div id="tool_Q_W">
            <div class="shorter">&lt; Q</div>
            <div class="longer">W &gt;</div>
          </div>
        </td>
      </tr>
    </table>

    <div>
      <div id="tool_current_elm"></div>
      <div id="tool_clicked_elm"></div>
      <div id="tool_selected_elm"></div>
    </div>


    <div class="send_selected">
      <div>✔️</div>
    </div>

  </div>
		`;
	},

	makeDraggable: function(elmnt) {
		var pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;
		if (document.getElementById(elmnt.id + "_header")) {
		  	/* if present, the header is where you move the DIV from:*/
		    document.getElementById(elmnt.id + "_header").onmousedown = dragMouseDown;
		} else {
		    /* otherwise, move the DIV from anywhere inside the DIV:*/
		    elmnt.onmousedown = dragMouseDown;
		}

		function dragMouseDown(e) {
		    e = e || window.event;
		    e.preventDefault();
		    // get the mouse cursor position at startup:
		    pos3 = e.clientX;
		    pos4 = e.clientY;
		    document.onmouseup = closeDragElement;
		    // call a function whenever the cursor moves:
		    document.onmousemove = elementDrag;
		}

		function elementDrag(e) {
		    e = e || window.event;
		    e.preventDefault();
		    // calculate the new cursor position:
		    pos1 = pos3 - e.clientX;
		    pos2 = pos4 - e.clientY;
		    pos3 = e.clientX;
		    pos4 = e.clientY;
		    // set the element's new position:
		    elmnt.style.top = (elmnt.offsetTop - pos2) + "px";
		    elmnt.style.left = (elmnt.offsetLeft - pos1) + "px";
		}

		function closeDragElement() {
		    /* stop moving when mouse button is released:*/
		    document.onmouseup = null;
		    document.onmousemove = null;
		}
	},


	activate: function() {

		tool.lockPage();
		if (!tool.helpWindow) tool.updateCSS();
		tool.helpWindowSpawn()

		let div = document.getElementById("tool_wnd");
		tool.makeDraggable(div);

		// Events

		div.querySelector('.longer').addEventListener('click', function (e) {
			if (tool.transpose > 0) tool.transpose--;
			tool.highlightSelected();
		});
		div.querySelector('.shorter').addEventListener('click', function (e) {
			tool.transpose++;
			tool.highlightSelected();
		});

		div.querySelector('.send_selected').addEventListener('click', function (e) {
			// var element = encodeURIComponent(tool.getPathHTML(tool.activeElement));
			// var block = encodeURIComponent(tool.getPathHTML(tool.selectedElement));
			// var url = encodeURIComponent(document.location.href);
			// var line = HOME_URL + url + "&element=" + element + "&block=" + block;
			// window.location = line;


			// var element = tool.getPathHTML(tool.activeElement);
			// // var element = tool.getPathHTML(tool.hoveredElement);
			// var block = tool.getPathHTML(tool.selectedElement);
			var url = document.location.href;

			var line = HOME_URL + '?'+url

			for (key in tool.apiArgs) {
				line += '&'+key+'='+tool.apiArgs[key];
			}

			alert(line);
		});

		div.querySelector('.ct_close').addEventListener('click', function (e) {
			tool.deactivate();
		});

		for (let elm of div.querySelectorAll('.ct_more a')) {
			elm.addEventListener('click', function (e) {

				tool.deactivate();
			});
		}
		
		tool.helpWindow = div;
		tool.updateElementList();
		tool.addEventListeners()
		chrome.extension.sendMessage({action: 'status', active: true});
	},
	
	addEventListeners: function() {
		tool.targetingMode = true;
		document.addEventListener('mouseover', tool.mouseover, true);
		document.addEventListener('mousedown', tool.selectElement, true);
		document.addEventListener('mouseup', tool.preventEvent, true);
		document.addEventListener('click', tool.preventEvent, true);
	},

	removeEventListeners: function() {
		tool.targetingMode = false;
		document.removeEventListener('mouseover', tool.mouseover, true);
		document.removeEventListener('mousedown', tool.selectElement, true);
		document.removeEventListener('mouseup', tool.preventEvent, true);
		document.removeEventListener('click', tool.preventEvent, true);
	},

	deactivate: function() {

		tool.apiArgs = {};

		if (tool.markedElement) {
			tool.removeHighlightStyle(tool.markedElement);
		}
		tool.markedElement = false;

		if (tool.selectedElement) {
			tool.removeHighlightStyle(tool.selectedElement);
		}
		tool.selectedElement = false;
		if (tool.activeElement) {
			tool.removeHighlightStyle(tool.activeElement);
		}
		tool.activeElement = false;

		tool.helpWindow.parentNode.removeChild(tool.helpWindow);
		tool.helpWindow = false;

		tool.removeEventListeners()

		function unlockPage() {
		    unlockElements(document.getElementsByTagName("a"));
		    unlockElements(document.getElementsByTagName("input"));
		    unlockElements(document.getElementsByTagName("button"));
		};

		function unlockElements(el)
		{
		  for (var i=0; i<el.length; i++)
		  {
		    el[i].style.pointerEvents="auto";
		  }
		};

		unlockPage();
		chrome.extension.sendMessage({action: 'status', active: false});
	},
	
	toggle: function() {
		if (tool.targetingMode) tool.deactivate();
		else tool.activate();
	},
	
	init: function() {
		document.addEventListener('keydown', tool.keyDown);
		document.addEventListener('keyup', tool.keyUp);
		
		chrome.extension.onMessage.addListener(function(msg, sender, responseFun) {
			if (msg.action == "toggle") {
				tool.toggle();
				responseFun(2.0);
			}

			if (msg.action == "rmb_event") {
				if (tool.activeElement) {
					tool.deactivate();
					tool.activate(); 
				} else {
					tool.activate(); 
				}
				responseFun(2.0);
			}

		});
	}
}

tool.init();
