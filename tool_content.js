var HOME_URL = "http://127.0.0.1:8000/";

const tool = {
    hoveredElement: false,
    markedElement: false,
    highlightedHover: false,
    highlightedSelect: false,
    activeElement: false,
    activeOverlay: false,
    selectedElement: false,
    transpose: 0,
    selectedElems: [],
    apiArgs: {},
    helpWindow: false,
    overlayHover: false,
    area: false,
    row: false,
    columns: [],
    flip_area: false,
    page_index: false,
    tableLenth: 5, // число колонок в таблице выбранного + 1

    activeArg: false,
    targetingMod: false,

    coverHovered: function() {
        if (!tool.hoveredElement) return;

        // display PathHTML
        document.querySelector('#tool_current_elm').innerHTML = tool.getPathHTML(tool.hoveredElement, tool.transpose);
        document.querySelector('#tool_current_elm').scrollTop = 9999;

        tool.resizeOverlay(tool.overlayHover, tool.hoveredElement);

    },

    resizeActive: function(delta) {
        if (!tool.activeElement) return;
        // if (!tool.activeElement.relatedOverlay) {
        //     tool.activeElement.relatedOverlay = tool.overlayHover;
        // };

        let overlay = tool.activeElement.relatedOverlay;
        overlay.transpose += delta;
        if (overlay.transpose < 0) {
            overlay.transpose = 0;
            return;
        };

        let elem = overlay.clickedElement;
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
        // if (!tool.targetingMod) return;
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

        if (!tool.activeArg) return;

        if (tool.isChildOfToolWindow(e.target)) return; 

        if (!tool.activeOverlay) {
            var overlay = tool.spawnOverlay(e.target, '', 'tool_selected');
            tool.activeOverlay = overlay;
        }

        tool.activeOverlay.arg = tool.activeArg;

        tool.resizeOverlay(overlay, e.target);


        // if (!tool.activeOverlay || tool.activeOverlay.assignedBtn) {
        //     var overlay = tool.spawnOverlay(e.target, '', 'tool_selected');
        //     tool.activeOverlay = overlay;
        // } else {
        //     var overlay = tool.activeOverlay;
        //     tool.resizeOverlay(overlay, e.target);
        // }
        tool.targetingMod = false;// ---

        if (tool.selectedElems.includes(e.target)) { // toggle select
            tool.selectedElems.splice(tool.selectedElems.indexOf(e.target), 1);
            return;
        };


        line = tool.getPathHTML(e.target);

        if (e.target) {

            e.target.relatedOverlay = overlay;
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
        if (!tool.targetingMod) return;
        if (tool.isChildOfToolWindow(e.target)) return;
        if (tool.hoveredElement != e.target) {
            tool.transpose = 0;
            tool.hoveredElement = e.target;
            tool.coverHovered();
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
        evt.initUIEvent('resize', true, false, window, 0);
        window.dispatchEvent(evt);
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

    resizeOverlay: function(overlay, new_target) {
        let rect = new_target.getBoundingClientRect();
        overlay.style.position = "absolute";
        overlay.style.left = rect.left + window.scrollX + "px";
        overlay.style.top = rect.top + window.scrollY + "px";
        overlay.style.width = rect.width + "px";
        overlay.style.height = rect.height + "px";
        overlay.style.border = "1px solid rgba(65,167,225,1)"
        overlay.style.boxShadow = "inset 0px 0px 13px 1px rgba(65,167,225, 0.5)"

        overlay.style.zIndex = tool.maxZIndex - 2;
        overlay.relatedElement = new_target;
        // new_target.relatedOverlay = overlay;

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
        overlay.style.left = rect.left + window.scrollX + "px";
        overlay.style.top = rect.top + window.scrollY + "px";
        overlay.style.width = rect.width + "px";
        overlay.style.height = rect.height + "px";
        overlay.relatedElement = target;
        overlay.clickedElement = target;
        overlay.transpose = 0;
        target.relatedOverlay = overlay;
        document.body.appendChild(overlay);
        // if (tool.activeArg) {
        //     overlay.innerText = tool.activeArg
        //     overlay.arg = tool.activeArg
        //     tool.activeArg = tool.nextActiveArg(tool.activeArg)
        // }
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
            var elements = document.getElementsByClassName("tool_selected");

            var url = document.location.href;

            var line = ""

            // line += encodeURIComponent(HOME_URL) + '?'+ url
            line += HOME_URL + '\n\n?' + url

            for (let i = 0, length1 = elements.length; i < length1; i++) {
                line += "\n\n" + "&" + elements[i].arg + "=" + tool.getPathHTML(elements[i])
            }

            // window.location = line;
            alert(line);
        });

        div.querySelector('.ct_close').addEventListener('click', function(e) {
            tool.deactivate();
        });

        tool.helpWindow = div;
        document.addEventListener('mouseover', tool.mouseover, true);
        document.addEventListener('mousedown', tool.selectElement, true); // ---
        document.addEventListener('mouseup', tool.preventEvent, true);
        document.addEventListener('click', tool.preventEvent, true);



        div.querySelector('#tool_area_btn').addEventListener('mousedown', function(e) {
            tool.activeArg = "area"
            tool.targetingMod = true // ---
            // if (tool.activeOverlay) {
            //     tool.activeOverlay.assignedBtn = e.target.id
            //     e.target.innerHTML = tool.activeOverlay.relatedElement.innerHTML
            //     tool.activeOverlay = false
            // }
        });

        div.querySelector('#tool_row_btn').addEventListener('mousedown', function(e) {
            if (tool.activeOverlay) {
                tool.activeOverlay.assignedBtn = e.target.id
                e.target.innerHTML = tool.activeOverlay.relatedElement.innerHTML
                tool.activeOverlay = false
            }
        });

        for (var i = 1; i < tool.tableLenth; i++) {
            var col = '#tool_col_' + i.toString()
            div.querySelector(col).addEventListener('mousedown', function(e) {
                if (tool.activeOverlay) {
                    tool.activeOverlay.assignedBtn = e.target.id
                    e.target.textContent = tool.activeOverlay.relatedElement.textContent
                    tool.activeOverlay = false
                    tool.nextActiveArg(e.target.id)
                }
            });
            var val = '#tool_val_' + i.toString()
            div.querySelector(val).addEventListener('mousedown', function(e) {
                if (tool.activeOverlay) {
                    tool.activeOverlay.assignedBtn = e.target.id
                    e.target.textContent = tool.activeOverlay.relatedElement.textContent
                    tool.activeOverlay = false
                    tool.nextActiveArg(e.target.id)

                }
            });
        }
    },

    activate: function() {

        fetch(chrome.runtime.getURL('/tool_wnd/tool.html')).then(r => r.text()).then(html => {
            document.body.insertAdjacentHTML('afterend', html);
            // not using innerHTML as it would break js event listeners of the page
            let div = document.getElementById("tool_wnd");
            tool.makeDraggable(div);
            tool.overlayHover = tool.spawnOverlay(div, "tool_overlay", "tool_hover");

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

    preventEvent: function(e) { //
        if (tool.isChildOfToolWindow(e.target)) return;
        e.preventDefault();
        e.stopPropagation();
        return false;
    },

    deactivate: function() { //

        tool.apiArgs = {};
        tool.markedElement = false;
        tool.selectedElement = false;
        tool.activeElement = false;
        tool.helpWindow.parentNode.removeChild(tool.helpWindow);
        tool.helpWindow = false;

        document.removeEventListener('mouseover', tool.mouseover, true);
        document.removeEventListener('mousedown', tool.selectElement, true);
        document.removeEventListener('mouseup', tool.preventEvent, true);
        document.removeEventListener('click', tool.preventEvent, true);

    },

    toggle: function() {
        if (document.getElementById("tool_wnd")) tool.deactivate(); //
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