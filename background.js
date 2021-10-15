var proxyObj;

async function setHeaders() {
    chrome.webRequest.onBeforeSendHeaders.removeListener(addheaders);
    const {proxyState} = await getValue("proxyState");
    if (proxyState == 1) {
        chrome.webRequest.onBeforeSendHeaders.addListener(
            addheaders,
            {urls: ["<all_urls>"]},
            ["requestHeaders", "blocking"]
        );
    } else {
        console.log("代理关闭，忽略请求头设置");
    }

}


function addheaders(details) {
    var headers = details.requestHeaders;
    var targetUrl = details.url;
    const indexMap = {};
    for (let index = 0; index < headers.length; index++) {
        const header = headers[index];
        indexMap[header.name.toLowerCase()] = index;
    }
    if (!proxyObj) {
        return;
    }
    for (var i = 0; i < proxyObj.length; i++) {
        var json = proxyObj[i]
        if (targetUrl.indexOf(json.domain) != -1) {
            for (var j = 0; j < json.requestHeader.length; j++) {
                var arr = json.requestHeader[j].split(":");
                const normalizedHeaderName = arr[0].toLowerCase();
                const index = indexMap[normalizedHeaderName];
                console.log(">>>>  " + JSON.stringify(arr));
                if (index !== undefined) {
                    headers[index].value = arr[1];
                } else {
                    headers.push({name: arr[0], value: arr[1]});
                    indexMap[normalizedHeaderName] = headers.length - 1;
                }
            }
        }
    }
    return {
        requestHeaders: details.requestHeaders,
    }
}

async function setValue(data) {
    return new Promise((resolve, reject) => {
        chrome.storage.local.set(data, () => {
            if (chrome.runtime.lastError) {
                reject(chrome.runtime.lastError);
            } else {
                resolve();
            }
        });
    });
}

async function getValue(key) {
    var data = new Promise((resolve, reject) => {
        chrome.storage.local.get(key, (item) => {
            if (chrome.runtime.lastError) {
                reject(chrome.runtime.lastError);
            } else {
                resolve(item);
            }
        });
    })
    return data;
}

async function setProxy() {
    var pacScr = `function FindProxyForURL(url, host) { `
    const {proxyJson} = await getValue("proxyJson");
    const {proxyState} = await getValue("proxyState");
    try {
        proxyObj = JSON.parse(proxyJson);
    } catch (error) {
        console.log(error)
        return
    }
    if (proxyState == 1) {
        for (var i = 0; i < proxyObj.length; i++) {
            var json = proxyObj[i]
            pacScr = pacScr.concat(`if('${json.domain}'==host){`);
            for (var j = 0; j < json.matchingRules.length; j++) {
                var matchingRule = json.matchingRules[j];
                pacScr = pacScr = pacScr.concat(`if(~url.indexOf('${matchingRule.route}')){`)
                pacScr = pacScr.concat(`return 'PROXY ${matchingRule.targetUrl}; DIRECT'`)
                pacScr = pacScr.concat(`}`)
            }
            pacScr = pacScr.concat(`else{return 'DIRECT';}`)
            pacScr = pacScr.concat(`}`)
        }
        pacScr = pacScr.concat(`else{return 'DIRECT';}`)
        pacScr = pacScr.concat(`}`);
    } else {
        pacScr = 'function FindProxyForURL(url, host) { return \'DIRECT\';}';
    }
    chrome.proxy.settings.set({
        value: {
            mode: "pac_script",
            pacScript: {
                data: pacScr,
                mandatory: true,
            }
        },
        scope: 'regular'
    }, function () {
    });
    console.log("设置代理：" + pacScr);
}

chrome.storage.onChanged.addListener(function (changes, namespace) {
    console.log("监听配置改变更新代理");
    setProxy();
    setHeaders();
});

