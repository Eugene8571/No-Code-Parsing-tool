chrome.browserAction.onClicked.addListener(function() {
	chrome.tabs.getSelected(null, function(tab) {
		chrome.tabs.sendMessage(tab.id, { 'action': 'toggle' }, function(response) {
			if (chrome.runtime.lastError) {
				// lastError needs to be checked
			}

			if (!response) {
				chrome.tabs.executeScript(tab.id, {
					code: "location.reload();"
				});
				setTimeout(function () { 
					chrome.tabs.sendMessage(tab.id, { 'action': 'toggle' }, function(response) {
						if (chrome.runtime.lastError) {
							// lastError needs to be checked
						}
					});
				}, 1200);
			}
		});
	});
});

// chrome.extension.onRequest.addListener(function(request, sender, sendResponse) {
//     if(request.cmd == "read_file") {
//         $.ajax({
//             url: chrome.extension.getURL("tool.html"),
//             dataType: "html",
//             success: sendResponse
//         });
//     }
// })