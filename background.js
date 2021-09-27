chrome.proxy.settings.set({
	value: {
		mode: "pac_script",
		pacScript: {
			data: String(function FindProxyForURL(url, host) {
				if (host=="www.baidu.com"&&~url.indexOf("/test")){
					return 'PROXY '+"127.0.0.1:"+'; DIRECT'
				}
				return 'DIRECT'
			}),
			mandatory: true,
		}
	},
	scope: 'regular'
});

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

