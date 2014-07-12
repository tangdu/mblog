var express = require('express');
var path = require('path');
var fs=require("fs");
var favicon = require('serve-favicon');
var morgan = require('morgan');//输出日志
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var multiparty=require("connect-multiparty");
var session=require("express-session");
global.logger=require("./utils/logger.js");
global.moment = require('moment');//日期函数全局访问
global.DB=require("./utils/dbutil.js").Instance();

///定义实体
DB.define({key:'User',name:'t_ef_user',fields:['id_','username','password','sex','status','role','email','integral','desc','lastlogintime','registertime','lastloginip']});
DB.define({key:'Article',name:'t_ef_article',fields:['id_','digest','title','type','created','updated','content','order','status','userid','username','commentsnum','allowcomment','readcount','keyword']});
DB.define({key:'UserAttention',name:'t_ef_user_attention',fields:['id_','userid','relid','type','operationtime']});
DB.define({key:'UserComment',name:'t_ef_user_comment',fields:['id_','userid','artideid','comment','commenttime','commendid']});
DB.define({key:'UserReviews',name:'t_ef_user_reviews',fields:['id_','userid','relid','type','flag','operationtime']});

//Express配置
var app = express();
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.set('routes',__dirname + '/routes/');
app.use(favicon(__dirname+'/public/static/img/favicon.ico'));
//app.use(morgan('dev'));
app.use(multiparty());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser());
app.use(session({ secret: 'tangdu', cookie: { maxAge: 60000*30 },saveUninitialized:true,resave:true}));
app.use(express.static(path.join(__dirname, 'public')));

//Session拦截控制
app.all("*",function(req,res,next){
    //console.log(new Date()+"----------"+req.url+"------"+req.sessionID+"-----------"+req.ip);
    //对权限路径进行控制
    var _flag=false;
    Sys.permissionUrls.forEach(function(r){
        if(req.session.user==null && r==req.url){
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

//控制层_根据routes文件名+方法_约定请求路径
var routes=app.get("routes");
fs.readdirSync(routes).forEach(function(fileName) {
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

///404
app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

///500
if (app.get('env') === 'development') {
    app.use(function(err, req, res, next) {
        logger.error(err);
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: err
        });
    });
}

//应用终止退出
process.on('exit',function(){
    console.log('Exit...........');
});
//应用未Catch异常
process.on('uncaughtException',function(err){
    if(err){
        console.log(err);
    }
});

//临时文件存放地
process.env.TMPDIR="F://";
module.exports = app;
