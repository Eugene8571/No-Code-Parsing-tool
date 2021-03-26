var RMB_TARGET = null;
var	HOME_URL = "http://127.0.0.1:8000/";

document.addEventListener('contextmenu', function (event) {
  RMB_TARGET = event.target;
});

const mge = {
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
		if (!mge.clickedElement) return;
		
		if (mge.markedElement && (mge.markedElement != mge.clickedElement)) {
			mge.removeHighlightStyle(mge.markedElement);
		}

		mge.markedElement = mge.clickedElement;
		// if (mge.markedElement.className == "mge_overlay") { // this is just a proxy for an iframe
		// 	mge.markedElement = mge.markedElement.relatedElement;
		// }
		let i = 0;
		for (i = 0; i < mge.transpose; i++) {
			if (mge.markedElement.parentNode != window.document) {
				mge.markedElement = mge.markedElement.parentNode;
			} else {
				break;
			}
		}
		
		mge.transpose = i;
		mge.selectedElement = mge.markedElement
		mge.addHighlightStyle(mge.selectedElement);

		document.querySelector('#mge_selected_elm').innerHTML = mge.getPathHTML(mge.markedElement, mge.transpose);
		document.querySelector('#mge_selected_elm').scrollTop = 9999;
	},


	addHighlightStyle: function (elm) {
		if (mge.selectedElement) {
			mge.selectedElement.style.outline = 'solid 5px rgba(230,126,34,0.5)';
			mge.selectedElement.style.outlineOffset = '-5px';			
			return;}
		mge.markedElement.style.outline = 'solid 5px rgba(230,126,34,0.5)';
		mge.markedElement.style.outlineOffset = '-5px';
	},

	removeHighlightStyle: function (elm) {
		elm.style.outline = '';
		elm.style.outlineOffset = '';
	},
	
	keyDown: function(e) {

		if (!mge.clickedElement) return;
		
		if (e.keyCode == 27) {
			mge.deactivate();
		}
		
		if (e.keyCode == 87) { // w
			if (mge.transpose > 0) mge.transpose--;
			mge.highlightSelected();
		} else if (e.keyCode == 81) { // q
			mge.transpose++;
			mge.highlightSelected();
		}
		return false;
	},
	
	keyUp: function(e) {
		if (!mge.clickedElement) return;
		return false;
	},
	
	select_Target: function(e) {
		if (RMB_TARGET) {
			mge.clickedElement = RMB_TARGET;
			mge.selectedElement = RMB_TARGET;

			// if (mge.markedElement.className == "mge_overlay") { // this is just a proxy for an iframe
			// 	mge.markedElement = mge.markedElement.relatedElement;
			// }

			mge.addHighlightStyle(mge.markedElement);

			mge.selectedElements.push({
				RMB_TARGET,
			});

			mge.updateCSS();
			mge.updateElementList();
			mge.triggerResize();
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

		// if (currentElm.className == "mge_overlay") { // this is just a proxy for an iframe
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
			#mge_wnd {
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
			#mge_wnd * {
				line-height: 1.3; font-size: inherit; color: inherit;
				font-weight: normal; font-style: normal; font-family: inherit;
				cursor: default;
			}


				display: inline-block; cursor: pointer;
				transform: rotate(45deg); transition: transform 0.5s;
			}
			#mge_wnd .key {
				display: inline-block;
				font-family: monospace;
				background: #f7f7f7; color: #999;
				padding: 0 2px; margin: 0 2px;
				border: solid 1px #d5d5d5; border-radius: 3px;
			}
			#mge_wnd .ct_logo { 
				font-size: 18px; 
			}
			#mge_wnd .ct_logo.small { display: none; }
			#mge_wnd .ct_logo svg {
				fill: #666; vertical-align: -15%;
				transform: rotate(-240deg); transition: transform 1s;
			}
			#mge_wnd .ct_logo.anim svg { transform: rotate(0deg); }

			#mge_current_elm {
				font-family: monospace; background: #f7f7f7; color: #d5d5d5; padding: 2px; margin: 10px 0;
				height: 84px; overflow: hidden;
			}
			#mge_current_elm .pathNode { color: #999; border-bottom: solid 2px rgba(0,0,0,0); }
			#mge_current_elm .pathNode.active { border-bottom: solid 2px #555; }

			#mge_clicked_elm,
			#mge_selected_elm { 
				margin-top: 5px; 
				background: #f7f7f7; 
				border: solid 12px #f7f7f7; 
				border-width: 12px 0 12px 0; 
				max-height: 84px; 
				overflow: hidden;
				color: black; 
			}

			#mge_wnd > div > button.shorter,
			#mge_wnd > div > button.longer {
				margin: 5px;
				color: black;
			}
			#mge_wnd.hasContent { display: inline-block; }

			#mge_wnd.minimized { width: 147px; height: 12px; }
			#mge_wnd.minimized > * { display: none; }
			#mge_wnd.minimized .ct_logo.small { display: block; margin: -4px 0 0 -10px; }


			#ct_btns {
				width: 100%;
				text-align: center;
				margin-top: 15px;
				margin-bottom: 12px;
			}





			.send_selected,
			.ct_btns_space,
			#mge_wnd .ct_close {
				display: inline-block;
				vertical-align: middle;
			}

			.ct_btns_space {
				width: 70px;
			}


			.send_selected > button,
			#mge_wnd .ct_close > button {
				text-align: center;
				font-size: 21px;
				width: 100px;
				height: 41px;
				border: 0;
			}




			.send_selected > button {
				background-color: #3498DB;

			}
			#mge_wnd .ct_close > button {
				background-color: #E67E22;
			}




			`
		];

		for (let i in mge.selectedElements) {
			let selector = mge.selectedElements[i].selector;
			if (selector == 'body' || selector == 'html') {
			} else {
			}
		}

		let styleElm = document.querySelector('#mge_styles');
		if (!styleElm) {
			styleElm = document.createElement('style');
			styleElm.type = "text/css";
			styleElm.id = "mge_styles";
			document.head.appendChild(styleElm);
		}

		while (styleElm.firstChild) {
		    styleElm.removeChild(styleElm.firstChild);
		}
		styleElm.appendChild(document.createTextNode(cssLines.join('\n')));
	},

	updateElementList: function() {
		if (!mge.helpWindow) return;

		let elmList_selected = document.querySelector('#mge_selected_elm');
		let wind = document.querySelector('#mge_wnd');

		let line = "";

		if (mge.selectedElements.length) {

			line = mge.getPathHTML(mge.selectedElement);


			elmList_selected.classList.add('hasContent');
			wind.classList.add('hasContent');

		} else {
			elmList_selected.classList.remove('hasContent');
			wind.classList.remove('hasContent');
		}
		
		elmList_selected.innerHTML = line;
		document.querySelector('#mge_clicked_elm').innerHTML = mge.getPathHTML(mge.clickedElement);
		
		document.getElementById('mge_selected_elm').scrollTop = 9999;
		document.getElementById('mge_clicked_elm').scrollTop = 9999;

		let i = -1;
		for (let tr of document.querySelectorAll('#mge_selected_elm table tr')) {
			if (i < 0) { // skip heading
				i++;
				continue;
			}

			tr.selector = mge.selectedElements[i].selector;

			i++;
		}
	},
	
	activate: function() {
		if (!mge.helpWindow) mge.updateCSS();

		let div = document.createElement('div');
		div.setAttribute("id", "mge_wnd");
		document.body.appendChild(div);

		div.innerHTML = `
			<span class="ct_logo">MANGA.garden tool.</span>
			<div id="mge_clicked_elm"></div>
			<div id="mge_selected_elm"></div>

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
			if (mge.transpose > 0) mge.transpose--;
			mge.highlightSelected();
		});
		div.querySelector('.shorter').addEventListener('click', function (e) {
			mge.transpose++;
			mge.highlightSelected();
		});

		div.querySelector('.send_selected').addEventListener('click', function (e) {
			var element = encodeURIComponent(mge.getPathHTML(mge.clickedElement));
			var block = encodeURIComponent(mge.getPathHTML(mge.selectedElement));
			var url = encodeURIComponent(document.location.href);
			var line = HOME_URL + url + "&element=" + element + "&block=" + block;
			window.location = line;
		});

		div.querySelector('.ct_close').addEventListener('click', function (e) {
			mge.deactivate();
		});

		for (let elm of div.querySelectorAll('.ct_more a')) {
			elm.addEventListener('click', function (e) {

				mge.deactivate();
			});
		}
		
		mge.helpWindow = div;

		mge.updateElementList();
		
		chrome.extension.sendMessage({action: 'status', active: true});
	},
	
	deactivate: function() {
		
		if (mge.markedElement) {
			mge.removeHighlightStyle(mge.markedElement);
		}
		mge.markedElement = false;

		if (mge.selectedElement) {
			mge.removeHighlightStyle(mge.selectedElement);
		}
		mge.selectedElement = false;
		if (mge.clickedElement) {
			mge.removeHighlightStyle(mge.clickedElement);
		}
		mge.clickedElement = false;

		mge.helpWindow.parentNode.removeChild(mge.helpWindow);
		
		chrome.extension.sendMessage({action: 'status', active: false});
	},
	
	toggle: function() {
		if (mge.clickedElement) mge.deactivate();
		else mge.activate();
	},
	
	init: function() {
		document.addEventListener('keydown', mge.keyDown);
		document.addEventListener('keyup', mge.keyUp);
		
		chrome.extension.onMessage.addListener(function(msg, sender, responseFun) {
			if (msg.action == "toggle") {
				mge.toggle();
				responseFun(2.0);
			}

			if (msg.action == "rmb_event") {
				if (mge.clickedElement) {
					mge.deactivate();
					mge.activate(); 
				} else {
					mge.activate(); 
				}
				responseFun(2.0);
				mge.select_Target(RMB_TARGET)
			}

		});
	}
}

mge.init();
