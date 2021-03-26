var RMB_TARGET = null;
var	HOME_URL = "http://127.0.0.1:8000/";

document.addEventListener('contextmenu', function (event) {
  RMB_TARGET = event.target;
});

const ncpt = {
	markedElement: false,
	clickedElement: false,
	selectedElement: false,
	transpose: 0, // how far to travel up the line of ancestors
	selectedElements: [],
	
	helpWindow: false,
	
	triggerResize: function() {
		let evt = document.createEvent('UIEvents');
		evt.initUIEvent('resize', true, false,window,0);
		window.dispatchEvent(evt);
	},

	highlightSelected: function() {
		if (!ncpt.clickedElement) return;
		
		if (ncpt.markedElement && (ncpt.markedElement != ncpt.clickedElement)) {
			ncpt.removeHighlightStyle(ncpt.markedElement);
		}

		ncpt.markedElement = ncpt.clickedElement;
		// if (ncpt.markedElement.className == "ncpt_overlay") { // this is just a proxy for an iframe
		// 	ncpt.markedElement = ncpt.markedElement.relatedElement;
		// }
		let i = 0;
		for (i = 0; i < ncpt.transpose; i++) {
			if (ncpt.markedElement.parentNode != window.document) {
				ncpt.markedElement = ncpt.markedElement.parentNode;
			} else {
				break;
			}
		}
		
		ncpt.transpose = i;
		ncpt.selectedElement = ncpt.markedElement
		ncpt.addHighlightStyle(ncpt.selectedElement);

		document.querySelector('#ncpt_selected_elm').innerHTML = ncpt.getPathHTML(ncpt.markedElement, ncpt.transpose);
		document.querySelector('#ncpt_selected_elm').scrollTop = 9999;
	},


	addHighlightStyle: function (elm) {
		if (ncpt.selectedElement) {
			ncpt.selectedElement.style.outline = 'solid 5px rgba(230,126,34,0.5)';
			ncpt.selectedElement.style.outlineOffset = '-5px';			
			return;}
		ncpt.markedElement.style.outline = 'solid 5px rgba(230,126,34,0.5)';
		ncpt.markedElement.style.outlineOffset = '-5px';
	},

	removeHighlightStyle: function (elm) {
		elm.style.outline = '';
		elm.style.outlineOffset = '';
	},
	
	keyDown: function(e) {

		if (!ncpt.clickedElement) return;
		
		if (e.keyCode == 27) {
			ncpt.deactivate();
		}
		
		if (e.keyCode == 87) { // w
			if (ncpt.transpose > 0) ncpt.transpose--;
			ncpt.highlightSelected();
		} else if (e.keyCode == 81) { // q
			ncpt.transpose++;
			ncpt.highlightSelected();
		}
		return false;
	},
	
	keyUp: function(e) {
		if (!ncpt.clickedElement) return;
		return false;
	},
	
	select_Target: function(e) {
		if (RMB_TARGET) {
			ncpt.clickedElement = RMB_TARGET;
			ncpt.selectedElement = RMB_TARGET;

			// if (ncpt.markedElement.className == "ncpt_overlay") { // this is just a proxy for an iframe
			// 	ncpt.markedElement = ncpt.markedElement.relatedElement;
			// }

			ncpt.addHighlightStyle(ncpt.markedElement);

			ncpt.selectedElements.push({
				RMB_TARGET,
			});

			ncpt.updateCSS();
			ncpt.updateElementList();
			ncpt.triggerResize();
			return false;

		}
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

		// if (currentElm.className == "ncpt_overlay") { // this is just a proxy for an iframe
		// 	currentElm = currentElm.relatedElement;
		// }

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
			#ncpt_wnd {
				display: none;
				position: fixed;
				bottom: 35%;
				right: 10px;
				width: 460px;
				max-height: 350px; 
				padding: 10px 20px;
				box-sizing: content-box;
				background: #fff;
				margin: 15px;
				box-shadow: 
				0 7px 14px rgba(0,0,0,0.25), 
				0 5px 5px rgba(0,0,0,0.22);  
				padding: 10px;
				margin-top: 15px;
				text-align: center;
				z-index: 2147483647;

			}
			#ncpt_wnd * {
				line-height: 1.3; font-size: inherit; color: inherit;
				font-weight: normal; font-style: normal; font-family: inherit;
				cursor: default;
			}


				display: inline-block; cursor: pointer;
				transform: rotate(45deg); transition: transform 0.5s;
			}
			#ncpt_wnd .key {
				display: inline-block;
				font-family: monospace;
				background: #f7f7f7; color: #999;
				padding: 0 2px; margin: 0 2px;
				border: solid 1px #d5d5d5; border-radius: 3px;
			}
			#ncpt_wnd .ct_logo { 
				font-size: 18px; 
			}
			#ncpt_wnd .ct_logo.small { display: none; }
			#ncpt_wnd .ct_logo svg {
				fill: #666; vertical-align: -15%;
				transform: rotate(-240deg); transition: transform 1s;
			}
			#ncpt_wnd .ct_logo.anim svg { transform: rotate(0deg); }

			#ncpt_current_elm {
				font-family: monospace; background: #f7f7f7; color: #d5d5d5; padding: 2px; margin: 10px 0;
				height: 84px; overflow: hidden;
			}
			#ncpt_current_elm .pathNode { color: #999; border-bottom: solid 2px rgba(0,0,0,0); }
			#ncpt_current_elm .pathNode.active { border-bottom: solid 2px #555; }

			#ncpt_clicked_elm,
			#ncpt_selected_elm { 
				margin-top: 5px; 
				background: #f7f7f7; 
				border: solid 12px #f7f7f7; 
				border-width: 12px 0 12px 0; 
				max-height: 84px; 
				overflow: hidden;
				color: black; 
			}

			#ncpt_wnd > div > button.shorter,
			#ncpt_wnd > div > button.longer {
				margin: 5px;
				color: black;
			}
			#ncpt_wnd.hasContent { display: inline-block; }

			#ncpt_wnd.minimized { width: 147px; height: 12px; }
			#ncpt_wnd.minimized > * { display: none; }
			#ncpt_wnd.minimized .ct_logo.small { display: block; margin: -4px 0 0 -10px; }


			#ct_btns {
				width: 100%;
				text-align: center;
				margin-top: 15px;
				margin-bottom: 12px;
			}





			.send_selected,
			.ct_btns_space,
			#ncpt_wnd .ct_close {
				display: inline-block;
				vertical-align: middle;
			}

			.ct_btns_space {
				width: 70px;
			}


			.send_selected > button,
			#ncpt_wnd .ct_close > button {
				text-align: center;
				font-size: 21px;
				width: 100px;
				height: 41px;
				border: 0;
			}




			.send_selected > button {
				background-color: #3498DB;

			}
			#ncpt_wnd .ct_close > button {
				background-color: #E67E22;
			}




			`
		];

		for (let i in ncpt.selectedElements) {
			let selector = ncpt.selectedElements[i].selector;
			if (selector == 'body' || selector == 'html') {
			} else {
			}
		}

		let styleElm = document.querySelector('#ncpt_styles');
		if (!styleElm) {
			styleElm = document.createElement('style');
			styleElm.type = "text/css";
			styleElm.id = "ncpt_styles";
			document.head.appendChild(styleElm);
		}

		while (styleElm.firstChild) {
		    styleElm.removeChild(styleElm.firstChild);
		}
		styleElm.appendChild(document.createTextNode(cssLines.join('\n')));
	},

	updateElementList: function() {
		if (!ncpt.helpWindow) return;

		let elmList_selected = document.querySelector('#ncpt_selected_elm');
		let wind = document.querySelector('#ncpt_wnd');

		let line = "";

		if (ncpt.selectedElements.length) {

			line = ncpt.getPathHTML(ncpt.selectedElement);


			elmList_selected.classList.add('hasContent');
			wind.classList.add('hasContent');

		} else {
			elmList_selected.classList.remove('hasContent');
			wind.classList.remove('hasContent');
		}
		
		elmList_selected.innerHTML = line;
		document.querySelector('#ncpt_clicked_elm').innerHTML = ncpt.getPathHTML(ncpt.clickedElement);
		
		document.getElementById('ncpt_selected_elm').scrollTop = 9999;
		document.getElementById('ncpt_clicked_elm').scrollTop = 9999;

		let i = -1;
		for (let tr of document.querySelectorAll('#ncpt_selected_elm table tr')) {
			if (i < 0) { // skip heading
				i++;
				continue;
			}

			tr.selector = ncpt.selectedElements[i].selector;

			i++;
		}
	},
	
	activate: function() {
		if (!ncpt.helpWindow) ncpt.updateCSS();

		let div = document.createElement('div');
		div.setAttribute("id", "ncpt_wnd");
		document.body.appendChild(div);

		div.innerHTML = `
			<span class="ct_logo">No-Code Parsing tool</span>
			<div id="ncpt_clicked_elm"></div>
			<div id="ncpt_selected_elm"></div>

			<div>
				<button class="shorter">< Q</button>
				<button class="longer">W ></button>
			</div>

			<div id="ct_btns">
				<div class="send_selected"><button>✔️</button></div>
				<div class="ct_btns_space"></div>
				<div class="ct_close"><button>✖️</button></div>
			</div>

		`;

		div.querySelector('.longer').addEventListener('click', function (e) {
			if (ncpt.transpose > 0) ncpt.transpose--;
			ncpt.highlightSelected();
		});
		div.querySelector('.shorter').addEventListener('click', function (e) {
			ncpt.transpose++;
			ncpt.highlightSelected();
		});

		div.querySelector('.send_selected').addEventListener('click', function (e) {
			var element = encodeURIComponent(ncpt.getPathHTML(ncpt.clickedElement));
			var block = encodeURIComponent(ncpt.getPathHTML(ncpt.selectedElement));
			var url = encodeURIComponent(document.location.href);
			var line = HOME_URL + url + "&element=" + element + "&block=" + block;
			window.location = line;
		});

		div.querySelector('.ct_close').addEventListener('click', function (e) {
			ncpt.deactivate();
		});

		for (let elm of div.querySelectorAll('.ct_more a')) {
			elm.addEventListener('click', function (e) {

				ncpt.deactivate();
			});
		}
		
		ncpt.helpWindow = div;

		ncpt.updateElementList();
		
		chrome.extension.sendMessage({action: 'status', active: true});
	},
	
	deactivate: function() {
		
		if (ncpt.markedElement) {
			ncpt.removeHighlightStyle(ncpt.markedElement);
		}
		ncpt.markedElement = false;

		if (ncpt.selectedElement) {
			ncpt.removeHighlightStyle(ncpt.selectedElement);
		}
		ncpt.selectedElement = false;
		if (ncpt.clickedElement) {
			ncpt.removeHighlightStyle(ncpt.clickedElement);
		}
		ncpt.clickedElement = false;

		ncpt.helpWindow.parentNode.removeChild(ncpt.helpWindow);
		
		chrome.extension.sendMessage({action: 'status', active: false});
	},
	
	toggle: function() {
		if (ncpt.clickedElement) ncpt.deactivate();
		else ncpt.activate();
	},
	
	init: function() {
		document.addEventListener('keydown', ncpt.keyDown);
		document.addEventListener('keyup', ncpt.keyUp);
		
		chrome.extension.onMessage.addListener(function(msg, sender, responseFun) {
			if (msg.action == "toggle") {
				ncpt.toggle();
				responseFun(2.0);
			}

			if (msg.action == "rmb_event") {
				if (ncpt.clickedElement) {
					ncpt.deactivate();
					ncpt.activate(); 
				} else {
					ncpt.activate(); 
				}
				responseFun(2.0);
				ncpt.select_Target(RMB_TARGET)
			}

		});
	}
}

ncpt.init();
