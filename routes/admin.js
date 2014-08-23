/**
 * Created by tangdu on 2014-08-12.
 */

var express = require('express');
var router = express.Router();
var uuid = require('node-uuid');
var async=require("async");
var Page=require("../utils/page");
var fs=require("fs");

/*****************管理员文章列表*******************/
router.get("/articlemanager",function(req,res,next){
    var Article=DB.get("Article");
    var page=new Page({page:req.query.ipage||1,pageSize:12});
    var params=null;
    var sql="select * from t_ef_article order by created desc,updated desc";
    Article.queryPageBySql(sql,page,params,function(err){
        if(err){
            next(err);
        }
        res.render('admin/articleList',{articles:page});
    });
});


router.get("/remove_article/:id_",function(req,res,next){
    var Article=DB.get("Article");
    var id_=req.params.id_;
    if(id_!=null && id_!=""){
        Article.remove(id_,function(err){
            if(err){
                next(err);
            }else{
                res.redirect("/admin/articlemanager");
            }
        });
    }else{
        next(new Error("文章不存在"));
    }
});

/*******************用户管理列表*****************/

router.get("/usermanager",function(req,res,next){
    var User=DB.get("User");
    var page=new Page({page:req.query.ipage||1,pageSize:12});
    var params=null;
    var sql="select * from t_ef_user order by registertime desc";
    User.queryPageBySql(sql,page,params,function(err){
        if(err){
            next(err);
        }
        res.render('admin/userList',{users:page});
    });
});

router.get("/remove_user/:id_",function(req,res,next){
    var User=DB.get("User");
    var id_=req.params.id_;
    if(id_!=null && id_!=""){
        User.remove(id_,function(err){
            if(err){
                next(err);
            }else{
                res.redirect("/admin/usermanager");
            }
        });
    }else{
        next(new Error("用户不存在"));
    }
});

router.get("/article_top/:id_/:flag_",function(req,res,next){
    var Article=DB.get("Article");
    var article={istop:req.params.flag_,id_:req.params.id_};
    Article.update(article,function(err,result){
        if(err){
            next(err);
        }else{
            res.redirect("/admin/articlemanager");
        }
    });
});
module.exports = router;