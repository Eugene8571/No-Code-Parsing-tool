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
	transpose: 0,
	selectedElems: [],
	apiArgs: {},
	helpWindow: false,
	overlayHover: false,


	highlightHovered: function() {
		if (!tool.hoveredElement) return;

		// if (tool.highlightedHover.id == "tool_overlay") {
		// 	tool.highlightedHover = tool.highlightedHover.relatedElement;
		// }
		// tool.highlightedHover = tool.hoveredElement;

		// display PathHTML
		document.querySelector('#tool_current_elm').innerHTML = tool.getPathHTML(tool.hoveredElement, tool.transpose);
		document.querySelector('#tool_current_elm').scrollTop = 9999;

		tool.resizeOverlay(tool.overlayHover, tool.hoveredElement);

	},

	resizeActive: function(delta) {
		if (!tool.activeElement) return;
		let overlay = tool.activeElement.relatedOverlay;

		let elem = overlay.clickedElement;
		overlay.transpose += delta;
		if (overlay.transpose < 0) {
			overlay.transpose = 0;
		};
		// console.log(overlay);
		let i = 0;
		for (i = 0; i < overlay.transpose; i++) {
			if (elem.parentNode != window.document) {
				elem = elem.parentNode;
			} else {
				break;
			}
		};

		tool.activeElement = elem;
		tool.activeElement.relatedOverlay = overlay;
		// console.log(overlay.transpose)

		let new_target = tool.activeElement;
		tool.resizeOverlay(overlay, new_target);

		document.querySelector('#tool_selected_elm').innerHTML = tool.getPathHTML(
			tool.activeElement, overlay.transpose);
		document.querySelector('#tool_selected_elm').scrollTop = 9999;


	},

	highlightSelected: function() {
		if (!tool.selectedElement) return;
		let overlay = tool.selectedElement.relatedOverlay;

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
		tool.selectedElement = tool.highlightedSelect;

		let new_target = tool.selectedElement;
		tool.resizeOverlay(overlay, new_target);

		document.querySelector('#tool_selected_elm').innerHTML = tool.getPathHTML(
			tool.selectedElement, tool.transpose);
		document.querySelector('#tool_selected_elm').scrollTop = 9999;
	},


	selectElement: function(e) {
		if (e.target.id == "tool_overlay") {
			e.target = e.target.relatedElement;
		}

		if (tool.isChildOftoolWindow(e.target)) return;

		let overlay = tool.spawnOverlay(e.target, 'id1123', 'overlay_selected');
		
		if (tool.selectedElems.includes(e.target)) { // toggle select
			tool.selectedElems.splice(tool.selectedElems.indexOf(e.target), 1);
			return;
		};


		line = tool.getPathHTML(e.target);

		if (e.target) {
			tool.activeElement = e.target;
			tool.selectedElement = e.target;

			tool.selectedElems.push(e.target);
			var n = Object.keys(tool.apiArgs).length;
			tool.apiArgs['block' + n.toString()] = line;
			tool.updateElementList();
			tool.triggerResize();
		}
	},

	mouseover: function(e) {
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
				let a = elm.tagName.toLowerCase();
				let b = "." + elm.className.trim().split(" ").join(".");
				if (b !== ".") {a += b};
				return a;
			} else {
				return elm.tagName.toLowerCase();
			}
		}

		let path = [];
		let currentElm = element;

		if (currentElm.id == "tool_overlay") { // this is just a proxy for an iframe
			currentElm = currentElm.relatedElement;
		}


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
				el[i].href = "#"+el[i].href;
				el[i].target = "";
			}
		}
	},


	resizeOverlay: function(overlay, new_target) {
		let rect = new_target.getBoundingClientRect();
		overlay.style.position = "absolute";
		overlay.style.left = rect.left +  window.scrollX + "px";
		overlay.style.top = rect.top + window.scrollY + "px";
		overlay.style.width = rect.width + "px";
		overlay.style.height = rect.height + "px";
		overlay.style.border = "1px solid rgba(65,167,225,1)"
		overlay.style.boxShadow = "inset 0px 0px 13px 1px rgba(65,167,225, 0.5)"

		overlay.style.zIndex = tool.maxZIndex - 2;
		overlay.relatedElement = new_target;
	},

	spawnOverlay: function(target, id, _class) {

		if (target.relatedOverlay) {
			target.relatedOverlay.remove();
			target.relatedOverlay = false;
			return;
		};

		let overlay = document.createElement('div');
		overlay.setAttribute("id", id);
		overlay.setAttribute("class", _class);
		overlay.style.pointerEvents = "none";

		let rect = target.getBoundingClientRect();

		overlay.style.position = "absolute";
		overlay.style.left = rect.left +  window.scrollX + "px";
		overlay.style.top = rect.top + window.scrollY + "px";
		overlay.style.width = rect.width + "px";
		overlay.style.height = rect.height + "px";
		overlay.relatedElement = target;
		overlay.clickedElement = target;
		overlay.transpose = 0;
		target.relatedOverlay = overlay;
		document.body.appendChild(overlay);
		return overlay;
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
		tool.helpWindowSpawn()

		let div = document.getElementById("tool_wnd");
		tool.makeDraggable(div);

		// Events

		div.querySelector('.longer').addEventListener('click', function (e) {
			tool.resizeActive(-1);
			// if (tool.transpose > 0) tool.transpose--;
			// tool.highlightSelected();
		});
		div.querySelector('.shorter').addEventListener('click', function (e) {
			// console.log('.shorter click');
			// tool.transpose++;
			// tool.highlightSelected();
			tool.resizeActive(1);
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
		tool.targetingMode = true;
		document.addEventListener('mouseover', tool.mouseover, true);
		document.addEventListener('mousedown', tool.selectElement, true);
		document.addEventListener('mouseup', tool.preventEvent, true);
		document.addEventListener('click', tool.preventEvent, true);


		div.querySelector('#tool_row_btn').addEventListener('mouseover', function (e) {
			// tool.highlightReleted('#tool_row_btn');
		});
		div.querySelector('#tool_row_btn').addEventListener('mouseout', function (e) {
			//?
		});

		tool.overlayHover = tool.spawnOverlay(div, "tool_overlay", "tool_hover");

		chrome.extension.sendMessage({action: 'status', active: true});
	},

	preventEvent: function(e) {
		if (tool.isChildOftoolWindow(e.target)) return;

		e.preventDefault();
		e.stopPropagation();
		return false;
	},

	deactivate: function() {

		tool.apiArgs = {};

		if (tool.markedElement) {
			// tool.removeHighlightStyle(tool.markedElement);
		}
		tool.markedElement = false;

		if (tool.selectedElement) {
			// tool.removeHighlightStyle(tool.selectedElement);
		}
		tool.selectedElement = false;
		if (tool.activeElement) {
			// tool.removeHighlightStyle(tool.activeElement);
		}
		tool.activeElement = false;

		tool.helpWindow.parentNode.removeChild(tool.helpWindow);
		tool.helpWindow = false;

		tool.targetingMode = false;
		document.removeEventListener('mouseover', tool.mouseover, true);
		document.removeEventListener('mousedown', tool.selectElement, true);
		document.removeEventListener('mouseup', tool.preventEvent, true);
		document.removeEventListener('click', tool.preventEvent, true);

		function unlockPage() {
		    unlockElements(document.getElementsByTagName("a"));
		    unlockElements(document.getElementsByTagName("input"));
		    unlockElements(document.getElementsByTagName("button"));
		};

		function unlockElements(el) //?
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
