//常量
const bg = chrome.extension.getBackgroundPage();

//代理状态 0-停用 1-启用
var proxyState = 0;

//加载事件
window.addEventListener('load',myload,false);
//域名
var domain = [];
//配置
var matchingRules = [];


layui.use('code', function(){ //加载code模块
    layui.code({
        title:'代理规则配置',
        height:'600px'
    }); //引用code方法
});

//加载初始值
function myload(){
    //加载缓存数据
    domain = getValue("domain");
    matchingRules = getValue("matchingRules");
    //状态判断
    if (getValue("proxyState") == null){
        setValue("proxyState", proxyState);
        document.getElementById("buttonStyle").innerHTML = '<button type="button" class="layui-btn layui-btn-normal" style="margin-top: 10px" id="stratUpProxy">启用代理</button>';
        document.getElementById('stratUpProxy').addEventListener('click',stratUpProxy);
    }
    proxyState = getValue("proxyState");
    if (proxyState == 1){
        document.getElementById("buttonStyle").innerHTML = '<button type="button" class="layui-btn layui-btn layui-btn-danger" style="margin-top: 10px" id="closedUpProxy">停用代理</button>';
        document.getElementById('closedUpProxy').addEventListener('click',closedUpProxy);
    }else{
        document.getElementById("buttonStyle").innerHTML = '<button type="button" class="layui-btn layui-btn-normal" style="margin-top: 10px" id="stratUpProxy">启用代理</button>';
        document.getElementById('stratUpProxy').addEventListener('click',stratUpProxy);
    }

    document.getElementsByTagName('a')[0].innerHTML = '<span style="color: #0000FF" id="detailed">JSON代码说明</span>';
    document.getElementById("detailed").addEventListener('click',detailed);
    var codediv = document.getElementsByClassName("layui-code-ol");
    codediv[0].setAttribute("contenteditable","true");
}

//获得用户输入的json串
function getCodeJson(){
    var codediv = document.getElementsByClassName("layui-code-ol");
    var codelist = codediv[0].children;
    var json = "";
    for (var i = 0; i < codelist.length; i++){
        json += codelist[i].innerHTML;
    }
    return json;
}

//启动代理
function stratUpProxy(){
    var json = getCodeJson();
    try{
        var obj = JSON.parse(json);
        setValue("proxyList",obj);
        proxyState = 1;
        setValue("proxyState",proxyState);
        var data = `Function FindProxyForURL(url, host) {
                    if (/www.baidu.com/.test(host) && ~url.indexOf('xxx')){
                        return 'PROXY 127.0.0.1:8888; DIRECT'
                    }else {
                        return 'DIRECT'
                    }
        }`;
        bg.setProxy(data)
        layer.alert("启用成功")
        document.getElementById("buttonStyle").innerHTML = '<button type="button" class="layui-btn layui-btn layui-btn-danger" style="margin-top: 10px" id="closedUpProxy">停用代理</button>';
        document.getElementById("closedUpProxy").addEventListener('click',closedUpProxy);
    }catch (error){
        layer.alert("启用失败,请检查json语法");
        console.log(error)
    }

}
function closedUpProxy(){
    proxyState = 0;
    setValue("proxyState", proxyState);
    layer.alert("停用成功");
    document.getElementById("buttonStyle").innerHTML = '<button type="button" class="layui-btn layui-btn-normal" style="margin-top: 10px" id="stratUpProxy">启用代理</button>';
    document.getElementById('stratUpProxy').addEventListener('click',stratUpProxy);
}

//缓存操作
function setValue(key,value){
    localStorage.setItem(key,value)
}
function getValue(key){
    return localStorage.getItem(key);
}

//详细展示
function detailed(){
    //自定页

    layer.open({
        type: 1,
        skin: 'layui-layer-demo', //样式类名
        closeBtn: 0, //不显示关闭按钮
        anim: 2,
        title:'说明',
        shadeClose: true, //开启遮罩关闭
        content: '1.domain字段表示域名,可配置多个域名\r'+
                 '2.route表示匹配路径,即拦截时的url为 domain+route\r'+
                 '3.requestHeader表示请求头信息\r'+
                 '4.targetUrl表示目标路径'
    });
}
