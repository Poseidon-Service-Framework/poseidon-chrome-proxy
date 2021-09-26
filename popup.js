const bg = chrome.extension.getBackgroundPage()
const head = chrome.webRequest

let addBtn = document.getElementById('add');
let listDev = document.getElementById('listItem');
let qqBtn = document.getElementById('qqBtn');
let ymBtn = document.getElementById('ym');
let siteInput = document.getElementById('site');

var proxyList = [];
addBtn.onclick = addItem;
qqBtn.onclick = save;
ymBtn.onclick = onOffEnvent;

window.onload = function() {
	var list = bg.getValue('RatelHttpProxy');
	var onOff = bg.getValue('RatelHttpProxy-onOff');
	var url = bg.getValue('RatelHttpProxy-url');
	ymBtn.checked = onOff == "true";
	siteInput.value = url;
	
	console.log(JSON.stringify(list))
	console.log(JSON.stringify(onOff))
	if (list == null || list.length == 0) {
		addItem();
		bg.setJob(String(function FindProxyForURL(url, host) {
			return 'DIRECT'
		}))
	} else {
		// bg.proxyList =  eval('(' + list + ')');
		bg.proxyList = JSON.parse(list)
		reload();
		bindDelEnvent();
		bg.setJob(convertJsonStr(bg.proxyList))
	}
}

function bindDelEnvent() {
	var listItem = document.getElementsByName('delBtn');
	for (var i = 0; i < listItem.length; i++) {
		listItem[i].onclick = removeItem;
	}
}

function addItem() {
	refushList()
	bg.proxyList.push({
		'source': '',
		'target': ''
	});
	reload();
	bindDelEnvent();
}


function removeItem(i) {
	refushList();
	bg.proxyList.splice(this.value, 1);
	reload();
	bindDelEnvent();
}

function reload() {
	var str = "";
	for (var i = 0; i < bg.proxyList.length; i++) {
		str +=
			`<input type="text" class='in1' name='item' value='${bg.proxyList[i].source}'/>
				<input type="text" class='in1' name='item' value='${bg.proxyList[i].target}'/>
				<button class='l1' id='del' name='delBtn' value='${i}'> - </button>`
	}
	listDev.innerHTML = str;
}

function save() {
	refushList();
	bg.setValue('RatelHttpProxy', JSON.stringify(bg.proxyList));
	bg.setValue('RatelHttpProxy-url', siteInput.value);
	bg.setJob(convertJsonStr(bg.proxyList));
}

function refushList() {
	var listItem = document.getElementsByName('item');
	var tempList = [];
	for (var i = 0; i < listItem.length; i += 2) {
		var item = {
			'source': '',
			'target': ''
		};
		item.source = listItem[i].value;
		item.target = listItem[i + 1].value;
		tempList.push(item);
	}
	bg.proxyList = tempList;
}

function convertJsonStr(obj) {
	var jsonStr = JSON.stringify(obj)
	var onOff = bg.getValue('RatelHttpProxy-onOff');
	var flag = siteInput.value != '';
	return `function FindProxyForURL(url, host) {
		if(${onOff}){
			var list = JSON.parse('${jsonStr}');
			if(${flag} && !~url.indexOf('${siteInput.value}')){
				return 'DIRECT'
			}
			for (var i = 0; i < list.length; i++) {
				if (~url.indexOf(list[i].source)) {
					return 'PROXY '+ list[i].target +'; DIRECT'
				}
			}
		}
		return 'DIRECT'
	}`
}


function onOffEnvent(){
	bg.setValue('RatelHttpProxy-onOff',this.checked);
	bg.setJob(convertJsonStr(bg.proxyList))
}
