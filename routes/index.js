var express = require('express');
var router = express.Router();
var async=require("async");
var Page=require("../utils/page");
var util=require("util");

//首页
router.get("/",function(req,res){
    res.redirect("/index");
});
//首页
createView({value:'index'});

//创建首页相关的连接
Sys.cont.getArticleType().forEach(function(item){
    createView(item);
});
function createView(link){
    if(!link && !link.value){
        return;
    }
    router.get("/"+link.value,function(req,res,next){
        var Article=DB.get("Article");
        var ipage=req.query.ipage||1;
        async.waterfall([
            function (cb){
                var data={};
                var params=null;
                var page=new Page({page:ipage,pageSize:20});
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
                    "	t_ef_article t1 where  t1.status='1' ";
                if(link.value==="index"){
                    sql+=" order by istop desc,updated desc";
                }else{
                    sql+=" and type=?";
                    params=[req.url.substr(req.url.lastIndexOf("/")+1)];
                }
                Article.queryPageBySql(sql,page,params,function(err){
                    data.artidesLife=page;
                    cb(err,data);
                });
            },
            function(data,cb){
                var page2=new Page({end:10});
                var sql="select * from t_ef_article t3 join (\n" +
                    "select count(1) rt,t1.id_ as arid from t_ef_article t1 left join \n" +
                    "t_ef_user_comment t2 on t1.id_=t2.artideid\n" +
                    "and t2.commendid is null \n" +
                    "group by t1.id_ ) t4 on t3.id_=t4.arid order by t4.rt desc";
                Article.queryPageBySql(sql,page2,null,function(err,result){
                    data.topArtideList=page2.data;
                    cb(err,data);
                });
            }
        ],function(err,results){
            if(err){
                next(err);
            }
            results.activeTab="";
            results.title=link.key;
            if(link.value==="index"){
                res.render('index',results);
            }else{
                res.render('view',results);
            }
        });
    });
}


//发表文章
router.get("/push_article",function(req,res){
    res.render('pushArticle',{flag:'add'});
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
                if(result.userid!=req.session.user.id_){//如果不是自己文章，error
                    next(new Error("文章不存在"));
                }else{
                    res.render('pushArticle',{article:result,flag:'edit'});
                }
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

//更新记录
router.get("/update",function(req,res){
    res.render('update');
});




module.exports = router;

