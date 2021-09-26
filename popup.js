layui.use('code', function(){ //加载code模块
    layui.code({
        title:'代理规则配置'
    }); //引用code方法
});

//加载ide
function myload(){
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
    var obj = JSON.parse(json);
    alert(obj.domain)
}


//加载事件
window.addEventListener('load',myload,false);
document.getElementById('stratUpProxy').addEventListener('click',stratUpProxy);
