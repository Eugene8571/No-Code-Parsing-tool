
function setActive() {
	chrome.browserAction.setIcon( { path: 'images/ncpt_logo_16.png' } );
	chrome.browserAction.setTitle( { title: 'Click to select element' });
}

function setInactive() {
	chrome.browserAction.setIcon( { path: 'images/ncpt_logo_48.png' } );
	chrome.browserAction.setTitle( { title: 'Click to select element' });
}

function checkActive() {
	chrome.tabs.getSelected(null, function(tab) {
		if (!tab || tab.id < 0) return; // not really a tab, most likely a devtools window

		chrome.browserAction.enable(tab.id);

		
		chrome.tabs.sendMessage(tab.id, { action: 'getStatus' }, function(isActive) {
			if (chrome.runtime.lastError) return;

			if (isActive) {
				setActive();
			} else {
				setInactive();
			}
		});
	});
}


chrome.contextMenus.create({
  contexts: ['all'],
  title: 'Parsing tool',
  onclick: function(info, tab) {
	chrome.tabs.getSelected(null, function(tab) {
		chrome.tabs.sendMessage(tab.id, { 'action': 'rmb_event' }, function(response) {
			if (chrome.runtime.lastError) {
				// lastError needs to be checked, otherwise Chrome may throw an error
			}

			if (!response) {
				chrome.tabs.executeScript(tab.id, {
					// code: "if (confirm('This tab was loaded before Extension was installed. Would you like to reload it?\\nThis is necessary only the first time.')) location.reload();"
					code: "location.reload();"
				});
			}
		});
	});
  }
});


chrome.extension.onMessage.addListener(function(msg, sender, sendResponse) {
	if (msg.action == 'status' && msg.active == true) {
		setActive();
	} else if (msg.action == 'status' && msg.active == false) {
		setInactive();
	}

	if (msg.action == 'get_saved_elms') {
		sendResponse(localStorage['web:' + msg.website] || '[]');
	} else if (msg.action == 'set_saved_elms') {
		localStorage['web:' + msg.website] = msg.data;
	} else if (msg.action == 'get_settings') {
		sendResponse(localStorage['settings'] || '{}');
	} else if (msg.action == 'set_settings') {
		localStorage['settings'] = msg.data;
	}
});

chrome.tabs.onActivated.addListener(function(activeInfo) {
	checkActive();
});

chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab) {
	checkActive();
});

checkActive();


