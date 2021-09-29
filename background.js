function setProxy (){
    chrome.proxy.settings.set({
        value: {
            mode: "pac_script",
            pacScript: {
                data: String(function FindProxyForURL(url, host) {
                    if (localStorage.getItem(proxyState) == 1) {
                        return 'DIRECT';
                    }else {
                        if (/dev.100yx.net/.test(host)&&~url.indexOf('msgApi')){
                            return 'PROXY 127.0.0.1:9020; DIRECT'
                        }
                        // var obj = localStorage.getItem("proxyJson");
                        return 'DIRECT'
                    }
                }),
                mandatory: true,
            }
        },
        scope: 'regular'
    });
}

setProxy();

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

//缓存操作
function setValue(key,value){
    localStorage.setItem(key,value)
}
function getValue(key){
    return localStorage.getItem(key);
}


