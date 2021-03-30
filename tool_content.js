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
	clickedElement: false,
	selectedElement: false,
	transpose: 0, // how far to travel up the line of ancestors
	selectedElems: [],
	apiArgs: {},
	// allMarks: [],
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
		if (!tool.clickedElement) return;
		
		if (tool.highlightedSelect && (tool.highlightedSelect != tool.clickedElement)) {
			tool.removeHighlightStyle(tool.highlightedSelect, tool.outlineSelect);
		}

		tool.highlightedSelect = tool.clickedElement;

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

		document.querySelector('#tool_selected_elm').innerHTML = tool.getPathHTML(tool.selectedElement, tool.transpose);
		document.querySelector('#tool_selected_elm').scrollTop = 9999;
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
		if (tool.isChildOftoolWindow(e.target)) return;
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

		if (!tool.clickedElement) return;
		
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
		if (!tool.clickedElement) return;
		return false;
	},
	
	selectElement: function(e) {
		if (tool.isChildOftoolWindow(e.target)) return;
		line = tool.getPathHTML(e.target);

		if (e.target) {
			tool.clickedElement = e.target;
			tool.selectedElement = e.target;

			let outline = 'rgba(22, 198, 12, 0.5) solid 5px';
			tool.addHighlightStyle(e.target, outline);

			// let elm = tool.selectedElement;
			// console.log(window.getComputedStyle(elm, null).outline == outline);
			// console.log(window.getComputedStyle(elm, null).outline);

			tool.selectedElems.push(line);
			var n = Object.keys(tool.apiArgs).length;
			tool.apiArgs['block' + n.toString()] = line;
			tool.updateCSS();
			tool.updateElementList();
			tool.triggerResize();
		}
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

			  display: none;
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
			}


			#tool_wnd .ct_logo {
			  font-size: 18px;
			  text-align: left;
			  background-color: #ccc;
			  position: absolute;
			  cursor: move;
			  width: 90%;
			  height: 31px;
			  padding: 9px 0 0 10px;
			}

			#tool_wnd .tool_wind_body {
			  margin: 50px 7px 7px 7px;
			}

			#tool_area_btn {
			  width: 90px;
			  height: 40px;
			  position: relative;
			}

			#tool_row_btn {
			  width: 45px;
			  height: 30px;
			  position: absolute;
			  margin: 5px 5px 5px -50px;
			}

			#tool_wnd>div.tool_wind_body>table {
			  border-collapse: separate;
			  border-spacing: 10px 1em;
			}

			.tool_column_elem,
			.tool_value_elem {
			  width: 50px;
			  height: 30px;
			  overflow: hidden;
			}

			/* plus btn */
			#tool_plus_btn {
			  border-radius: 40%;
			  border: none;
			  font-size: 150%;
			  color: #4F4F4F;
			  width: 40px;
			}

			#tool_flip_page_area {
			  width: 90px;
			  height: 40px;
			  font-size: 150%;
			  position: relative;
			}

			#tool_page_number_elem {
			  width: 30px;
			  height: 30px;
			  position: absolute;
			  margin: 5px 5px 5px -60px;
			}

			.tool_cleare_selected {
			  border: none;
			  background: transparent;
			  color: red;
			}

			#tool_Q_W>button.shorter,
			#tool_Q_W>button.longer {
			  margin: 5px;
			  color: black;
			  /* height: 25px; */
			}

			.send_selected,
			#tool_wnd {
			  display: inline-block;
			  vertical-align: middle;
			}

			#tool_wnd .ct_close {
			  position: absolute;
			  top: 0px;
			  right: 0px;
			}

			#tool_wnd .ct_close > button {
			  font-size: 21px;
			  width: 40px;
			  height: 40px;
			  border: 0;
			  background-color: #E67E22;
			  line-height: 10px;
			}

			.send_selected > button {
			  text-align: center;
			  font-size: 21px;
			  width: 100px;
			  height: 41px;
			  border: 0;
			  background-color: #3498DB;
			  margin: 15px;
			}

			#tool_current_elm,
			#tool_clicked_elm,
			#tool_selected_elm {
				width: 170px;
			  margin-top: 5px;
			  background: #f7f7f7;
			  border: solid 12px #f7f7f7;
			  border-width: 12px 0 12px 0;
			  max-height: 84px;
			  overflow: hidden;
			  color: black;
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
		document.querySelector('#tool_clicked_elm').innerHTML = tool.getPathHTML(tool.clickedElement);
		
		document.getElementById('tool_selected_elm').scrollTop = 9999;
		document.getElementById('tool_clicked_elm').scrollTop = 9999;

	},
	
	lockPage: function() {
		lockElements(document.getElementsByTagName("a"));
		lockElements(document.getElementsByTagName("input"));
		lockElements(document.getElementsByTagName("button"));

		function lockElements(el)
		{
		  for (var i=0; i<el.length; i++)
		  {
		    el[i].style.pointerEvents="none";
		  }
		};
	},

	helpWindowSpawn: function() {
		let div = document.createElement('div');
		div.setAttribute("id", "tool_wnd");
		document.body.appendChild(div);

		div.innerHTML = `
		  <div id="tool_wnd_header">
		    <div class="ct_logo"><span>Parsing tool</span></div>
		    <div class="ct_close"><button>✖️</button></div>
		  </div>

		  <div class="tool_wind_body">
		    <table>
		      <tr>
		        <td colspan="2">
		          <div>
		            <button id="tool_area_btn"></button>
		            <button id="tool_row_btn">row</button>
		          </div>
		        </td>
		        <td>
		          <button id="tool_clear_area_row" class="tool_cleare_selected">✖️</button>
		        </td>
		      </tr>
		      <tr>
		        <td><button class="tool_column_elem"></button></td>
		        <td><button class="tool_value_elem"></button></td>
		        <td><button class="tool_cleare_selected">✖️</button></td>
		      </tr>
		      <tr>
		        <td><button class="tool_column_elem"></button></td>
		        <td><button class="tool_value_elem"></button></td>
		        <td><button class="tool_cleare_selected">✖️</button></td>
		      </tr>
		      <tr>
		        <td colspan="3"><button id="tool_plus_btn">+</button></td>
		      </tr>
		      <tr>
		        <td colspan="2">
		          <div>
		            <button id="tool_flip_page_area">...........</button>
		            <button id="tool_page_number_elem"></button>
		          </div>
		        </td>
		        <td><button class="tool_cleare_selected">✖️</button></td>

		      </tr>
		      <tr>
		        <td colspan="3">
		          <div id="tool_Q_W">
		            <button class="shorter">&lt; Q</button>
		            <button class="longer">W &gt;</button>
		          </div>
		        </td>
		      </tr>
		    </table>

		    <div>
		      <div id="tool_current_elm"></div>
		      <div id="tool_clicked_elm"></div>
		      <div id="tool_selected_elm"></div>
		    </div>


		    <div class="send_selected"><button>✔️</button></div>

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
			// var element = encodeURIComponent(tool.getPathHTML(tool.clickedElement));
			// var block = encodeURIComponent(tool.getPathHTML(tool.selectedElement));
			// var url = encodeURIComponent(document.location.href);
			// var line = HOME_URL + url + "&element=" + element + "&block=" + block;
			// window.location = line;


			// var element = tool.getPathHTML(tool.clickedElement);
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
		if (tool.clickedElement) {
			tool.removeHighlightStyle(tool.clickedElement);
		}
		tool.clickedElement = false;

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
				if (tool.clickedElement) {
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
