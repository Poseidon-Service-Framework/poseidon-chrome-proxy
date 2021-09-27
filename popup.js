//加载事件
window.addEventListener('load',myload,false);
document.getElementById('stratUpProxy').addEventListener('click',stratUpProxy);
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

//加载ide
function myload(){
    //加载缓存数据
    domain = getValue("domain");
    matchingRules = getValue("matchingRules");

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

        //域名
        setValue("domain",obj.domain);
        //配置信息
        setValue("matchingRules",obj.matchingRules);
        var url = [];
        var index = 0;
        if (obj.matchingRules.length<=0){
            layer.alert("启用失败,请配置mathingRules");
            return;
        }
        var detailedUrl = [];
        //获取完整路径目标路径
        for (var i = 0; i<obj.domain.length; i++){
            for (var j = 0 ; j<obj.matchingRules.length; j++){
                url[index] = obj.domain[i] + obj.matchingRules[j].route;
                detailedUrl[index] = obj.matchingRules[j].targetUrl;
                index++;
            }
        }
        setValue("proxyUrl",url);
        setValue("detailedUrl",detailedUrl);
        layer.alert("启用成功")
        document.getElementById("buttonStyle").innerHTML = '<button type="button" class="layui-btn layui-btn layui-btn-danger" style="margin-top: 10px" id="closedUpProxy">停用代理</button>';
        document.getElementById("closedUpProxy").addEventListener('click',closedUpProxy);
    }catch (error){
        layer.alert("启用失败,请检查json语法");
    }

}
function closedUpProxy(){
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
