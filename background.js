var job = "";
// chrome.proxy.settings.set(setJob())

function setValue(key,value){
	localStorage.setItem(key,value)
}
function getValue(key){
	return localStorage.getItem(key);
}

function setJob(str){
	job = str;
	chrome.proxy.settings.set({
		value: {
			mode: "pac_script",
			pacScript: {
				data:str,
				mandatory: true,
			}
		},
		scope: 'regular'
	})
}

