const CHROME_VERSION = getChromeVersion();

function getChromeVersion() {
    let pieces = navigator.userAgent.match(
        /Chrom(?:e|ium)\/([0-9]+)\.([0-9]+)\.([0-9]+)\.([0-9]+)/
    );
    if (pieces == null || pieces.length !== 5) {
        return {};
    }
    pieces = pieces.map((piece) => parseInt(piece, 10));
    return {
        major: pieces[1],
        minor: pieces[2],
        build: pieces[3],
        patch: pieces[4],
    };
}

async function setHeaders() {
    chrome.webRequest.onBeforeSendHeaders.removeListener(
        modifyRequestHeaderHandler_
    );

    let requiresExtraRequestHeaders = false;
    if (CHROME_VERSION.major >= 72) {
        requiresExtraRequestHeaders = true;
    }
    chrome.webRequest.onBeforeSendHeaders.addListener(
        modifyRequestHeaderHandler_,
        {urls: ["<all_urls>"]},
        requiresExtraRequestHeaders
            ? ["requestHeaders", "blocking", "extraHeaders"]
            : ["requestHeaders", "blocking"]
    );

    const {proxyJson} = await getValue("proxyJson");
    const {proxyState} = await getValue("proxyState");
    var proxyObj = JSON.parse(proxyJson);
    if (proxyState == 1) {
        chrome.webRequest.onBeforeSendHeaders.addListener(
            function (details) {
                var headers = details.requestHeaders;
                var targetUrl = details.url;
                for (var i = 0; i < proxyObj.length; i++) {
                    var json = proxyObj[i]
                    if (targetUrl.indexOf(json.domain) != -1) {
                        for (var j = 0; j < json.requestHeader.length; j++) {
                            var arr = json.requestHeader[j].split(":");
                            removeHead(headers, arr[0]);
                            headers.push({name: arr[0], value: arr[1]});
                        }
                    }
                }
                return {
                    requestHeaders: details.requestHeaders,
                }
            },
            {urls: ["<all_urls>"]},
            ["requestHeaders", "blocking"]
        );
    } else {
        console.log("代理关闭，忽略请求头设置");
    }

}

function removeHead(head, name) {
    for (var i = 0; i < head.length; i++) {
        if (head[i].name == name) {
            head.splice(i, 1);
        }
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
    var proxyObj = JSON.parse(proxyJson);
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
    console.log("监听配置改变更新代理")
    setProxy();
    setHeaders();
});


async function modifyRequestHeaderHandler_(details) {
    const {proxyJson} = await getValue("proxyJson");
    const {proxyState} = await getValue("proxyState");
    var proxyObj = JSON.parse(proxyJson);
    if (proxyState != 1) {
        return {};
    }
    var targetHeaders = getTargetHeader(details.url, details.type, proxyObj)

    if (targetHeaders != null) {
        modifyHeader(
            details.url,
            proxyObj,
            targetHeaders,
            details.requestHeaders
        );
        details.requestHeaders = details.requestHeaders.filter(
            (entry) => !!entry.value
        );
    }
    return {
        requestHeaders: details.requestHeaders,
    };
}


function modifyHeader(url, currentProfile, source, dest) {
    if (!source.length) {
        return;
    }
    const indexMap = {};
    for (let index = 0; index < dest.length; index++) {
        const header = dest[index];
        indexMap[header.name.toLowerCase()] = index;
    }
    for (const header of source) {
        const normalizedHeaderName = header.name.toLowerCase();
        const index = indexMap[normalizedHeaderName];
        const headerValue = evaluateValue(
            header.value,
            url,
            index !== undefined ? dest[index].value : undefined
        );
        if (index !== undefined) {
            dest[index].value = headerValue;
        } else {
            dest.push({name: header.name, value: headerValue});
            indexMap[normalizedHeaderName] = dest.length - 1;
        }
    }
}

function evaluateValue(value, url, oldValue) {
    if (value && value.startsWith("function")) {
        try {
            const arg = JSON.stringify({url, oldValue});
            return (eval(`(${value})(${arg})`) || "").toString();
        } catch (err) {
            console.error(err);
        }
    }
    return value;
}


function getTargetHeader(url, type, proxyObj) {
    var headers = [];
    for (var i = 0; i < proxyObj.length; i++) {
        var json = proxyObj[i]

        if (url.indexOf(json.domain) != -1) {
            for (var j = 0; j < json.requestHeader.length; j++) {
                var arr = json.requestHeader[j].split(":");
                headers.push({name: arr[0], value: arr[1]});
            }
        }
    }
    return headers;
}