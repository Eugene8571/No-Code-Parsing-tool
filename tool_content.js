var HOME_URL = "http://127.0.0.1:8000/bench";

const tool = {
    hoveredElement: false,
    activeOverlay: false,
    transpose: 0,
    helpWindow: false,
    overlayHover: false,
    tableLenth: 5, // число колонок в таблице выбранного + 1

    activeArg: false,
    selektEffect: "inset 0px 0px 13px 1px rgba(65,167,225, 0.5)",
    tilinkedEffect: "inset 0px 0px 13px 1px rgba(100,67,225, 0.5)",

    overlays: [],

    coverHovered: function(e) {
        if (!e.target) return;
        if (!tool.activeArg) return;

        if (!tool.overlayHover) {
            tool.overlayHover = tool.spawnOverlay(false, "tool_overlay", "tool_hover")
        }
        // display PathHTML
        document.querySelector('#tool_current_elm').innerHTML = tool.getPathHTML(e.target, tool.transpose);
        document.querySelector('#tool_current_elm').scrollTop = 9999;
        if (!tool.overlayHover) {
            alert("!tool.overlayHover")
        }
        tool.resizeOverlay(tool.overlayHover, e.target);

    },

    resizeActive: function(delta) {
        if (!tool.activeOverlay) return;

        let overlay = tool.activeOverlay;
        overlay.transpose += delta;
        if (overlay.transpose < 0) {
            overlay.transpose = 0;
            return;
        };

        let elem = tool.activeOverlay.clickedElement;
        // console.log(elem);
        for (i = 0; i < overlay.transpose; i++) {
            let i = 0;
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

    selectElement: function(e) {
        if (e.target.id == "tool_overlay") {
            e.target = e.target.relatedElement;
        }

        if (!tool.activeArg) return;

        if (tool.isChildOfToolWindow(e.target)) return; 

        if (!tool.activeOverlay || (tool.activeOverlay.arg !== tool.activeArg)) {
            var overlay = tool.spawnOverlay(e.target, '', 'tool_selected')
            tool.overlays.push(overlay)
            overlay.innerText = "tool.activeArg: " + tool.activeArg // --- show
            tool.activeOverlay = overlay;
            tool.activeOverlay.arg = tool.activeArg;
        }

        tool.activeOverlay.clickedElement = e.target

        tool.resizeOverlay(tool.activeOverlay, e.target);

        tool.activeArg = false;
        tool.overlayHover.remove();
        tool.overlayHover = false;

        line = tool.getPathHTML(e.target);

        if (e.target) {

            e.target.relatedOverlay = tool.activeOverlay;
            tool.activeElement = e.target;
            tool.updateDisplay();
        }


    },

    mouseover: function(e) {
        if (!tool.activeArg) return;
        if (tool.isChildOfToolWindow(e.target)) return;
        if (tool.hoveredElement != e.target) {
            tool.transpose = 0;
            tool.hoveredElement = e.target;
            tool.coverHovered(e);
        }
    },

    isChildOfToolWindow: function(elm) {
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

        // if (e.keyCode == 87) { // W
        //     if (tool.transpose > 0) tool.transpose--;
        //     tool.__();
        // } else if (e.keyCode == 81) { // Q
        //     tool.transpose++;
        //     tool.__();
        // }
        return false;
    },

    keyUp: function(e) {
        if (!tool.activeElement) return;
        return false;
    },

    getPathHTML: function(element, transpose) {
        function getElmName(elm) {
            if (elm.id) {
                return "#" + elm.id;
            } else if (typeof elm.className == "string" && elm.className.trim().length) {
                let a = elm.tagName.toLowerCase();
                let b = "." + elm.className.trim().split(" ").join(".");
                if (b !== ".") { a += b };
                return a;
            } else {
                return elm.tagName.toLowerCase();
            }
        }

        let path = [];
        let currentElm = element;

        if (currentElm.id == "tool_overlay") {
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


    updateDisplay: function() {
        if (!tool.helpWindow) return;

        let elmList_selected = document.querySelector('#tool_selected_elm');

        let line = "";
        line = tool.getPathHTML(tool.activeOverlay.relatedElement);

        elmList_selected.innerHTML = line;
        document.querySelector('#tool_clicked_elm').innerHTML = tool.getPathHTML(tool.activeElement);

        document.getElementById('tool_selected_elm').scrollTop = 9999;
        document.getElementById('tool_clicked_elm').scrollTop = 9999;

    },

    resizeOverlay: function(overlay, new_target) {
        let rect = new_target.getBoundingClientRect();
        overlay.style.position = "absolute";
        overlay.style.left = rect.left + window.scrollX + "px";
        overlay.style.top = rect.top + window.scrollY + "px";
        overlay.style.width = rect.width + "px";
        overlay.style.height = rect.height + "px";
        overlay.style.border = "1px solid rgba(65,167,225,1)"
        overlay.style.boxShadow = tool.selektEffect

        overlay.style.zIndex = tool.maxZIndex - 2;
        overlay.relatedElement = new_target;
    },

    spawnOverlay: function(target, id, _class) {
        if (!target) {
            target = document.getElementById("tool_wnd")
        }

        if (target.relatedOverlay) {
            target.relatedOverlay.remove();
            target.relatedOverlay = false;
        };

        let overlay = document.createElement('div');
        overlay.setAttribute("id", id);
        overlay.setAttribute("class", _class);
        overlay.style.pointerEvents = "none";

        let rect = target.getBoundingClientRect();

        overlay.style.position = "absolute";
        overlay.style.left = rect.left + window.scrollX + "px";
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


    makeDraggable: function(elmnt) {
        var pos1 = 0,
            pos2 = 0,
            pos3 = 0,
            pos4 = 0;
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

    addEventListeners: function() {
        let div = document.getElementById("tool_wnd");

        div.querySelector('.longer').addEventListener('click', function(e) {
            tool.resizeActive(-1);
        });
        div.querySelector('.shorter').addEventListener('click', function(e) {
            tool.resizeActive(1);
        });

        div.querySelector('.send_selected').addEventListener('click', function(e) {
            tool.sendSelected();
        });

        div.querySelector('.ct_close').addEventListener('click', function(e) {
            tool.deactivate();
        });

        tool.helpWindow = div;
        document.addEventListener('mouseover', tool.mouseover, true);
        document.addEventListener('mousedown', tool.selectElement, true);
        document.addEventListener('mouseup', tool.preventEvent, true);
        document.addEventListener('click', tool.preventEvent, true);

        let btns = div.querySelectorAll("table.table div")
        for (let i = 0; i < btns.length; i++) {
            btns[i].addEventListener('mousedown', tool.activateSelectMod, true)
            btns[i].addEventListener('mouseover', tool.tilinkSelectedOn, true) // TODO if active arg
            btns[i].addEventListener('mouseout', tool.tilinkSelectedOff, true) // TODO if active arg

        }

        div.querySelector('#tool_next').addEventListener(
            'mousedown', tool.activateSelectMod, true)

        div.querySelector('#tool_display').addEventListener(
            'mousedown', tool.toggleDisplay, true)
        div.querySelector('#tool_selected_elm_copy').addEventListener(
            'mousedown', tool.copySelectedElemPath, true)

    },

    tilinkSelectedOff: function(e) {
        // var overlays = document.getElementsByClassName("tool_selected")
        for (let i = 0; i < tool.overlays.length; i++) {
            if (tool.overlays[i].arg === e.target.id) {
                tool.overlays[i].style.boxShadow = tool.selektEffect
                console.log(e.target.id)
            }
        }
    },

    tilinkSelectedOn: function(e) {
        // var overlays = document.getElementsByClassName("tool_selected")
        for (let i = 0; i < tool.overlays.length; i++) {
            if (tool.overlays[i].arg === e.target.id) {
                tool.overlays[i].style.boxShadow = tool.tilinkedEffect
                console.log(e.target.id)
            }
        }
    },

    copySelectedElemPath: function(e) {
        path = document.querySelector('#tool_selected_elm').innerText
        if (window.clipboardData && window.clipboardData.setData) {
            // IE specific code path to prevent textarea being shown while dialog is visible.
            return clipboardData.setData("Text", path); 

        } else if (document.queryCommandSupported && document.queryCommandSupported("copy")) {
            var textarea = document.createElement("textarea");
            textarea.textContent = path;
            textarea.style.position = "fixed";  // Prevent scrolling to bottom of page in MS Edge.
            document.body.appendChild(textarea);
            textarea.select();
            try {
                return document.execCommand("copy");  // Security exception may be thrown by some browsers.
            } catch (ex) {
                console.warn("Copy to clipboard failed.", ex);
                return false;
            } finally {
                document.body.removeChild(textarea);
            }
        }
    },

    toggleDisplay: function() {
        display = document.querySelector("#tool_wnd table#path_show")
        if (display.hidden) {
            display.hidden = false
        } else {
            display.hidden = true
        }
    },

    sendSelected: function() {
        var url = document.location.href;
        var line = ""

        // line += encodeURIComponent(HOME_URL) + '?'+ url
        line += HOME_URL + '\n\n?' + url

        for (let i = 0, length1 = tool.overlays.length; i < length1; i++) {
            line += "\n\n" + "&" + tool.overlays[i].arg + "=" + tool.getPathHTML(tool.overlays[i].relatedElement)
        }

        // window.location = line;
        alert(line);

        var url = document.location.href;
        var line = ""

        // line += encodeURIComponent(HOME_URL) + '?'+ url
        line += HOME_URL + '/?url=' + encodeURIComponent(url)

        for (let i = 0, length1 = tool.overlays.length; i < length1; i++) {
            line += "&" + tool.overlays[i].arg + "=" + encodeURIComponent(tool.getPathHTML(tool.overlays[i].relatedElement))
        }

        window.location = line;
        // alert(line);

    },

    activateSelectMod: function (e) {
        tool.activeArg = e.target.id
        for (let i = 0; i < tool.overlays.length; i++) {
            if (tool.overlays[i].arg === tool.activeArg) {
                tool.activeOverlay = tool.overlays[i]
            }
        }
    },


    activate: function() {

        fetch(chrome.runtime.getURL('/tool_wnd/tool.html')).then(r => r.text()).then(html => {
            document.body.insertAdjacentHTML('afterend', html);
            // not using innerHTML as it would break js event listeners of the page
            let div = document.getElementById("tool_wnd");
            tool.makeDraggable(div);

            tool.addEventListeners()
        });
    },

    nextActiveArg: function(arg) {
        let btn = document.querySelector("#" + arg)
        btn.style.border = "0"

        let next_arg = false

        if (arg == "tool_area_btn") {
            next_arg = "tool_row_btn"
        } else if (arg == "tool_row_btn") {
            next_arg = "tool_col_1"
        }
        let i = arg.match(/\d+/);
        i = parseInt(i);
        if (!i) { next_arg = false }
        if (arg == ("tool_val_" + (tool.tableLenth - 1).toString())) {
            next_arg = false
        }

        if (arg.substr(5, 3) == "col") {
            next_arg = "tool_val_" + i.toString()
        } else {
            next_arg = "tool_col_" + (i + 1).toString()
        }

        let next_btn = document.querySelector("#" + next_arg)
        next_btn.style.border = "1px solid green"

        tool.activeArg = next_arg



    },

    preventEvent: function(e) {
        if (tool.isChildOfToolWindow(e.target)) return;
        e.preventDefault();
        e.stopPropagation();
        return false;
    },

    deactivate: function() {

        let div = document.getElementById("tool_wnd");

        div.querySelector('.longer').removeEventListener('click', function(e) {
            tool.resizeActive(-1);
        });
        div.querySelector('.shorter').removeEventListener('click', function(e) {
            tool.resizeActive(1);
        });

        div.querySelector('.send_selected').removeEventListener('click', function(e) {
            tool.sendSelected();
        });

        div.querySelector('.ct_close').removeEventListener('click', function(e) {
            tool.deactivate();
        });

        tool.helpWindow = div;
        document.removeEventListener('mouseover', tool.mouseover, true);
        document.removeEventListener('mousedown', tool.selectElement, true);
        document.removeEventListener('mouseup', tool.preventEvent, true);
        document.removeEventListener('click', tool.preventEvent, true);

        let btns = div.querySelectorAll("table.table div")
        for (let i = 0; i < btns.length; i++) {
            btns[i].removeEventListener('mousedown', tool.activateSelectMod, true)
            btns[i].removeEventListener('mouseover', tool.tilinkSelectedOn, true)
            btns[i].removeEventListener('mouseout', tool.tilinkSelectedOff, true)

        }

        div.querySelector('#tool_next').removeEventListener(
            'mousedown', tool.activateSelectMod, true)

        div.querySelector('#tool_display').removeEventListener(
            'mousedown', tool.toggleDisplay, true)
        div.querySelector('#tool_selected_elm_copy').removeEventListener(
            'mousedown', tool.copySelectedElemPath, true)

        tool.activeElement = false;
        tool.helpWindow.parentNode.removeChild(tool.helpWindow);
        tool.helpWindow = false;

        tool.hoveredElement = false
        tool.activeOverlay = false
        tool.transpose = 0
        tool.overlayHover = false
        tool.tableLenth = 5 // число колонок в таблице выбранного + 1

        tool.activeArg = false

        for (let i = 0; i < tool.overlays.length; i++) {
            tool.overlays[i].remove()
        }
        tool.overlays = []

    },

    toggle: function() {
        if (document.getElementById("tool_wnd")) tool.deactivate();
        else tool.activate();
    },

    init: function() {
        chrome.extension.onMessage.addListener(function(msg, sender, responseFun) {
            if (msg.action == "toggle") {
                tool.toggle();
                responseFun(2.0);
            }

        });
    }
}

tool.init();