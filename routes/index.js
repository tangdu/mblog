var express = require('express');
var router = express.Router();
var async=require("async");
var Page=require("../utils/page");
var util=require("util");

//首页
router.get("/index",function(req,res){
    res.redirect("/");
});
router.get("/",function(req,res,next){
    var Article=DB.get("Article");
    async.waterfall([
        function (cb){
            var data={};
            var params=['1'];
            var page=new Page({end:12});
            var sql="SELECT\n" +
                "	t1.*, (\n" +
                "		SELECT\n" +
                "			count(1)\n" +
                "		FROM\n" +
                "			t_ef_user_comment t2\n" +
                "		WHERE\n" +
                "			t2.artideid = t1.id_\n" +
                "		AND t2.commendid IS NULL\n" +
                "	) commentCot,\n" +
                "	(\n" +
                "		SELECT\n" +
                "			count(1)\n" +
                "		FROM\n" +
                "			t_ef_user_attention t3\n" +
                "		WHERE\n" +
                "			t3.relid = t1.id_\n" +
                "		AND t3.type = '1'\n" +
                "	) shouCot\n" +
                "FROM\n" +
                "	t_ef_article t1 where  t1.status=? order by created desc ";
            Article.queryPageBySql(sql,page,params,function(err){
                data.artidesLife=page;
                cb(err,data);
            });
        },
        function(data,cb){
            var page=new Page({end:10});
            var sql="select * from t_ef_article t3 join (\n" +
                "select count(1),t1.id_ as arid from t_ef_article t1 left join \n" +
                "t_ef_user_comment t2 on t1.id_=t2.artideid\n" +
                "and t2.commendid is null \n" +
                "group by t1.id_ order by count(1) desc) t4 on t3.id_=t4.arid";
            Article.queryPageBySql(sql,page,null,function(err,result){
                data.topArtideList=page.data;
                cb(err,data);
            });
        }
    ],function(err,results){
        if(err){
            next(err);
        }
        results.activeTab="";
        res.render('index',results);
    });
});
//发表文章
router.get("/push_article",function(req,res){
    res.render('pushArticle',{article:{}});
});
//编辑文章
router.get("/edit_article/:articledID",function(req,res,next){
    var Article=DB.get("Article");
    var articledID=req.params.articledID;
    if(articledID){
        Article.get(articledID,function(err,result){
            if(err){
                next(err);
            }else{
                res.render('pushArticle',{article:result});
            }
        });
    }else{
        next(new Error("文章不存在"));
    }
});

//登录
router.get('/login', function(req, res) {
    res.render('signin', { message: false});
});
//注销
router.get("/logout",function(req,res){
    req.session.user=null;
    res.redirect("/");
});
//注册
router.get("/register",function(req,res){
    res.render('register', { message: false});
});
////////////////各子页面/////////////////
Sys.cont.artideType.forEach(function(r){
    if(r.key && r.key!=""){
        router.get("/"+ r.key,function(req,res){
            var type=req.path;
            var activeTab=false;
            if("/"+r.key===type){
                activeTab= r.key;
            }
            res.render('section/'+ r.key+"View",{title: r.key,activeTab:activeTab,activeIndexTab:false});
        });
    }
});

module.exports = router;

