var express = require('express');
var path = require('path');
var fs=require("fs");
var favicon = require('static-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var dbutil=require("./utils/dbutil.js");
var conf=require("./config.js");
var session=require("express-session");
global.moment = require('moment');//日期函数全局访问

//系统DB全局变量
global.DB=dbutil.Instance();
DB.define({key:'User',name:'t_ef_user',fields:['id_','username','password','sex','status','role','email','integral','desc','lastlogintime','registertime']});
DB.define({key:'Article',name:'t_ef_article',fields:['id_','title','type','created','updated','content','order','status','userid','username','commentsnum','allowcomment','readcount','keyword']});
DB.define({key:'UserAttention',name:'t_ef_user_attention',fields:['id_','userid','relid','type','operationtime']});
DB.define({key:'UserComment',name:'t_ef_user_comment',fields:['id_','userid','artideid','comment','commenttime','commendid']});
DB.define({key:'UserReviews',name:'t_ef_user_reviews',fields:['id_','userid','relid','type','flag','operationtime']});

var app = express();
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.set('routes',__dirname + '/routes/');
for(var prop in conf){
    app.set(prop,conf[prop]);
}
app.use(favicon());
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded());
app.use(cookieParser());
app.use(session({ secret: 'tangdu', cookie: { maxAge: 60000*30 }}));
app.use(express.static(path.join(__dirname, 'public')));

//Session拦截控制
app.all("*",function(req,res,next){
    console.log(new Date()+"----------"+req.url+"------"+req.sessionID);
    //对权限路径进行控制
    var _flag=false;
    Sys.permissionUrls.forEach(function(r){
        if(req.session.user==null &&  r==req.url){
            _flag=true;
            return;
        }
    });
    res.locals.user=req.session.user;
    res.locals.activeTab="";
    if(_flag){
        res.redirect("/login");
    }else{
        next();
    }
});

//构造控制器
var routes=app.get("routes");
var files = fs.readdirSync(routes);
files.forEach(function(fileName, i) {
    var filePath = routes + fileName;
    var rname=fileName.substr(0,fileName.lastIndexOf("."));
    if(!fs.lstatSync(filePath).isDirectory()) {
       if(rname==="index"){
           app.use("/",require(filePath));
       }else{
           app.use("/"+rname,require(filePath));
       }
    }
});

/// catch 404 and forwarding to error handler
app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

//
if (app.get('env') === 'development') {
    app.use(function(err, req, res, next) {
        console.log(err);
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: err
        });
    });
}

module.exports = app;
