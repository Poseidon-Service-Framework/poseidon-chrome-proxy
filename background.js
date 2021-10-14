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


