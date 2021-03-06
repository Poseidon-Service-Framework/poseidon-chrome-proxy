//加载事件
window.addEventListener('load', myload, false);
window.addEventListener('unload', save, false);
const bg = chrome.extension.getBackgroundPage();
//域名
var domain = [];
//配置
var matchingRules = [];


layui.use('code', function () { //加载code模块
    layui.code({
        title: '代理规则配置',
        height: '600px'
    }); //引用code方法
});

//加载初始值
async function myload() {
    //加载缓存数据
    //状态判断
    document.getElementById("layui-code").addEventListener("paste",textInit);
    const {proxyState} = await bg.getValue("proxyState");
    if (proxyState == 1) {
        document.getElementById("buttonStyle").innerHTML = '<button type="button" class="layui-btn layui-btn layui-btn-danger" style="margin-top: 10px" id="closedUpProxy">停用代理</button>';
        document.getElementById('closedUpProxy').addEventListener('click', closedUpProxy);
    } else {
        document.getElementById("buttonStyle").innerHTML = '<button type="button" class="layui-btn layui-btn-normal" style="margin-top: 10px" id="stratUpProxy">启用代理</button>';
        document.getElementById('stratUpProxy').addEventListener('click', stratUpProxy);
    }
    document.getElementsByTagName('a')[0].innerHTML = '<span style="color: #0000FF" id="detailed">JSON代码说明</span>';
    document.getElementById("detailed").addEventListener('click', detailed);
    var codediv = document.getElementsByClassName("layui-code-ol");
    codediv[0].setAttribute("contenteditable", "true");
    loadJson();
}

//获得用户输入的json串
function getCodeJson() {
    var codediv = document.getElementsByClassName("layui-code-ol");
    var codelist = codediv[0].children;
    var json = "";
    for (var i = 0; i < codelist.length; i++) {
        json += codelist[i].innerHTML;
    }
    json = json.replaceAll("<br>","");
    JSON.parse(json);
    return json;
}


async function loadJson() {
    var codediv = document.getElementsByClassName("layui-code-ol");
    var codelist = codediv[0].children;
    const {proxyJson} = await bg.getValue("proxyJson");
    if (proxyJson == null) {
        codelist[0].innerHTML = "[\n" +
            "  {\n" +
            "    \"domain\": \"www.baidu.com\",\n" +
            "    \"requestHeader\": [\"token:your_token\"],\n" +
            "    \"matchingRules\": [\n" +
            "      {\n" +
            "        \"route\": \"/message/msgApi\",\n" +
            "        \"targetUrl\": \"127.0.0.1:9020\"\n" +
            "      }\n" +
            "    ]\n" +
            "  }\n" +
            "]"
    } else {
        codelist[0].innerHTML = proxyJson;
    }
}

//更新代理
async function stratUpProxy() {
    try {
        await bg.setValue({"proxyJson": getCodeJson()});
        await bg.setValue({"proxyState": 1});
        layer.alert("启用成功")
        document.getElementById("buttonStyle").innerHTML = '<button type="button" class="layui-btn layui-btn layui-btn-danger" style="margin-top: 10px" id="closedUpProxy">停用代理</button>';
        document.getElementById('closedUpProxy').addEventListener('click', closedUpProxy);

    } catch (error) {
        layer.alert("启用失败,请检查json语法");
        console.log(error)
    }
}

function save() {
    var codeJson = getCodeJson();
    bg.setValue({"proxyJson": codeJson});
}

async function closedUpProxy() {
    await bg.setValue({"proxyState": 0});
    layer.alert("停用成功");
    document.getElementById("buttonStyle").innerHTML = '<button type="button" class="layui-btn layui-btn-normal" style="margin-top: 10px" id="stratUpProxy">启用代理</button>';
    document.getElementById('stratUpProxy').addEventListener('click', stratUpProxy);
}

//缓存操作


//详细展示
function detailed() {
    //自定页

    layer.open({
        type: 1,
        skin: 'layui-layer-demo', //样式类名
        closeBtn: 0, //不显示关闭按钮
        anim: 2,
        title: '说明',
        shadeClose: true, //开启遮罩关闭
        content: '1.domain: 需要代理的域名\r' +
            '2.requestHeader: 需要设置的请求头信息\r' +
            '3.route: 匹配路径,即拦截时的url为 http://domain+route\r' +
            '4.targetUrl: 目标路径,即实际代理的ip与端口'
    });
}

function textInit(e) {
    e.preventDefault();
    var text;
    var clp = (e.originalEvent || e).clipboardData;
    if (clp === undefined || clp === null) {
        text = window.clipboardData.getData("text") || "";
        if (text !== "") {
            if (window.getSelection) {
                var newNode = document.createElement("span");
                newNode.innerHTML = text;
                window.getSelection().getRangeAt(0).insertNode(newNode);
            } else {
                document.selection.createRange().pasteHTML(text);
            }
        }
    } else {
        text = clp.getData('text/plain') || "";
        if (text !== "") {
            document.execCommand('insertText', false, text);
        }
    }
}

