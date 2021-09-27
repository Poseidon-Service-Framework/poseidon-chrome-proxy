function setProxy (data){
	alert(data)
	chrome.proxy.settings.set({
		value: {
			mode: "pac_script",
			pacScript: {
				data: data,
				mandatory: true,
			}
		},
		scope: 'regular'
	});
}

function setHeader(headerObj){
	chrome.webRequest.onBeforeSendHeaders.addListener(
		function(details) {
			var headers = details.requestHeaders;
			headers.push({
				name: 'x-tif-uid',
				value: '755150713268621312'
			});
			return {requestHeaders: details.requestHeaders};
		},
		{urls: ["http://ipcrio-dev-121.pdcts.com.cn/!*"]},
		["blocking", "requestHeaders"]
	);
}


