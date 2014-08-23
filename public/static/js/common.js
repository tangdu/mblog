/**
 * Created by tangdu on 2014-04-30.
 */

var ipe={
    //'preview'
    cont:{
        kitems:['undo', 'redo', '|',  'justifyleft', 'justifycenter', 'justifyright',
            'justifyfull', 'insertorderedlist', 'insertunorderedlist', 'indent', 'outdent', 'clearhtml', 'quickformat', 'selectall', '|',
            'formatblock', 'fontname', 'fontsize', '|', 'forecolor', 'hilitecolor', 'bold',
            'italic', 'underline', 'strikethrough',  'removeformat']
    }
};
$(function(){
    $("#md-btn-login").bind('click',function(){
        var username=$("#md-form-login input[name=username]");
        var password=$("#md-form-login input[name=password]");
        $.post('/user/login',{username:username.val(),password:password.val()},function(data){
            console.log(data);
        },'json');
    });


    //静态定义
    function showMsg(msg,type){
        if(!msg){
            msg="";
        }
        var divWidth=300;
        var divLeft=(document.body.clientWidth - divWidth) / 2;
        var color="black";
        if("error"==type){
            color="red";
        }

        var panel=$('<div>'+
            '<strong>提示:'+msg+'</strong>'+
            '</div>')
            .css({"padding":"10px"})
            .css({width:divWidth+"px",height:"70px",position: "fixed",left:divLeft+"px","z-index":1200,"background-color":color,color:'#FFFFFF'})
            .css({"-webkit-box-shadow":"1px #FFFFFF inset","box-shadow":"1px #FFFFFF inset",opacity:0})
            .css({"border":"1px #FFFFFF solid"})
            .css({"-webkit-border-radius":"3px 3px 10px 10px","border-radius":"3px 3px 10px 10px"});
        panel.animate({
            top:+70,
            opacity: +.5
        },500);
        var hideFuc=function(){
            panel.animate({
                opacity:-1
            },{duration:800,
            complete:function(){
                if(panel){
                    panel.remove();
                }
            }});
        }
        panel.click(hideFuc);
        setInterval(hideFuc,2000);
        $("body").append(panel);
    }
    $.showMsg=function(msg){
        return showMsg(msg);
    };
    $.showErr=function(msg){
      return showMsg(msg,"error");
    };


    ipe.init=function(){
        var colors=['#D9534F','#5CB85C','#B37333','#567E95','#00ABA9','#FF6600','#B433FF','#4A4A4A'];
        ///颜色变换///
        $(".ylabel a").each(function(i,r){
            var _num=Math.floor(Math.random()*( colors.length + 1));
            $(r).css({"background-color":colors[_num]});
        });
    }

    ///////////////////init///////////////////////
    ipe.init();
});
