/**
 * Created by tangdu on 14-3-3.
 * uuid.v1() 时间戳UUID
 * uuid.v4() 随机数UUID
 */
var express = require('express');
var router = express.Router();
var uuid = require('node-uuid');
var async=require("async");
var Page=require("../utils/page");
var BAG_REG = /background-color:#.*?;/g;
var fs=require("fs");
var gm=require("gm");


router.get("/view/:id_", function (req, res,next) {
    var Article=DB.get("Article");
    var User=DB.get("User");
    var UserReviews=DB.get("UserReviews");//点赞、非赞
    var UserAttention=DB.get("UserAttention");//收藏、关注
    var UserComment=DB.get("UserComment");//文章回复
    var pid=req.params.id_;
    if (pid) {
        async.waterfall([
            function (cb){//1 文章内容
                var data={};
                Article.get(pid, function (err, result) {
                    if (!result) {
                        cb(err, null);
                    }else{
                        data.item = result;
                        data.title = result.title;
                        cb(err, data);
                    }
                });
            },
            function(data,cb){//2 用户信息
                User.get(data.item.userid,function(err,result){
                    data.userInfo=result;
                    cb(err,data);
                });
            },
            function(data,cb){//3 用户所发文章，按发文时间
                var params={userid:data.item.userid};
                var orders={"created":"desc"};
                Article.where(params,orders,function(err,result){
                    data.userArtide=result;
                    cb(err,data);
                });
            },
            function(data,cb){//4 文章热度，按阅读数排名
                var orders={"readcount":"desc"};
                Article.where(null,orders,function(err,result){
                    data.hotArtide=result;
                    cb(err,data);
                });
            },
            function(data,cb){//5 更新阅读次数
                Article.executeSql("update t_ef_article set readcount=readcount+1 where id_=?",[pid],function(err,result){
                    cb(err,data);
                });
            },function(data,cb){//6 文章被赞数
                UserReviews.countBySql("select id_ from t_ef_user_reviews where type='3' and flag='1' and relid=?",[pid],function(err,result){
                    data.userupCot=result;
                    cb(err,data);
                });
            },function(data,cb){//7 文章收藏数
                UserAttention.countBySql("select id_ from t_ef_user_attention where type='2' and relid=?",[pid],function(err,result){
                    data.shouCot=result;
                    cb(err,data);
                });
            },function(data,cb){//8 文章非赞数
                UserReviews.countBySql("select id_ from t_ef_user_reviews where type='3' and flag='0' and relid=?",[pid],function(err,result){
                    data.userdownCot=result;
                    cb(err,data);
                });
            },function(data,cb){//9 文章回复
                var params=[pid];
                var page=new Page({end:10});
                UserComment.queryPageBySql("select t1.*,t2.username from t_ef_user_comment t1 join t_ef_user t2 on t1.userid=t2.id_ where commendid is null and artideid=? order by commenttime asc",page,params,function(err,result){
                    data.comments=page.data;
                    cb(err,data);
                });
            }
        ],function(err,results){
            if(err){
                next(err);
            }
            res.render('articleView',results);
        });
    } else {
        var err=new Error("查询[id_]不能为空!");
        next(err);
    }
});

router.post("/save_article", function (req, res,next) {
    var Article=DB.get("Article");
    var User=DB.get("User");
    var articleBean = req.body;
    if(articleBean.flag=="edit"){//修改
        Article.get(articleBean.id_,function(err,result){
            if(err){
                next(err);
            }else {
                if (result.userid != req.session.user.id_) {//如果不是自己文章，error
                    next(new Error("文章不存在"));
                } else {

                    articleBean.updated = new Date();
                    articleBean.userid=req.session.user.id_;
                    articleBean.username=req.session.user.username;
                    articleBean.content = articleBean.content.replace(BAG_REG, '');
                    Article.update(articleBean, function (err, result) {
                        if (err) {
                            next(err);
                        } else {
                            res.redirect("/");
                        }
                    });
                }
            }
        });
    }else{//新增
        articleBean.id_ = uuid.v1();
        articleBean.created = new Date();
        articleBean.updated = new Date();
        articleBean.userid=req.session.user.id_;
        articleBean.username=req.session.user.username;
        articleBean.content = articleBean.content.replace(BAG_REG, '');
        async.waterfall([
            function(cb){
                Article.insert(articleBean, function (err, result) {
                    cb(err,{});
                });
            },function(data,cb){
                var sql="update t_ef_user t set t.integral=t.integral+1 where t.id_=?";
                User.executeSql(sql,[req.session.user.id_],function(err,result){
                    cb(err,{});
                });
            }
        ],function(err,result){
            if(err){
                next(err);
            }else{
                res.redirect("/");
            }
        });
    }
});


//文件上传
router.get("/upload",function(req,res){
    if(!req.files.upfile){
        res.json({'state':'FAILURE'});
        return;
    }
    var tmp_path = req.files.upfile.path;
    // 指定文件上传后的目录 - 示例为"images"目录。
    var target_path = 'public/static/upload/' + req.files.upfile.name;
    if(1*1024*1024<req.files.upfile.size){
        res.json({'state':'FAILURE'});
        return;
    }
    var file_name=req.files.upfile.name;
    // 移动文件
    fs.rename(tmp_path, target_path, function(err) {
        if (err) {
            logger.error(err);
            res.json({'state':'FAILURE'});
        }
       var imageMagick=gm.subClass({ imageMagick : true });
        imageMagick(target_path)
           .resize(80,80).autoOrient().write(target_path,function(err){
            if (err) {
                logger.error(err);
                res.json({'state':'FAILURE'});
            }else{
                res.json({'url':file_name,'title':file_name,'state':'SUCCESS'});
            }
        });//缩小80%
    });
});
module.exports = router;