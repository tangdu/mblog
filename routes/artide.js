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


router.get("/view/:id_", function (req, res,next) {
    var Artide=DB.get("Artide");
    var User=DB.get("User");
    var UserReviews=DB.get("UserReviews");//点赞、非赞
    var UserAttention=DB.get("UserAttention");//收藏、关注
    var UserComment=DB.get("UserComment");//文章回复
    var pid=req.params.id_;
    if (pid) {
        async.waterfall([
            function (cb){//1 文章内容
                var data={};
                Artide.get(pid, function (err, result) {
                    if (err) {
                        cb(err,null);
                    } else {
                        data.item=result[0];
                        data.title=result[0].title;
                        cb(null,data);
                    }
                });
            },
            function(data,cb){//2 用户信息
                User.get(data.item.userid,function(err,result){
                    if (err) {
                        cb(err,null);
                    } else {
                        data.userInfo=result[0];
                        cb(null,data);
                    }
                });
            },
            function(data,cb){//3 用户所发文章，按发文时间
                var params={userid:data.item.userid};
                var orders={"created":"desc"};
                Artide.where(params,orders,function(err,result){
                    if (err) {
                        cb(err,null);
                    } else {
                        data.userArtide=result;
                        cb(null,data);
                    }
                });
            },
            function(data,cb){//4 文章热度，按阅读数排名
                var orders={"readcount":"desc"};
                Artide.where(null,orders,function(err,result){
                    if (err) {
                        cb(err,null);
                    } else {
                        data.hotArtide=result;
                        cb(null,data);
                    }
                });
            },
            function(data,cb){//5 更新阅读次数
                Artide.executeSql("update t_ef_artide set readcount=readcount+1 where id_=?",[pid],function(err,result){
                    if (err) {
                        next(err);
                    } else {
                        cb(null,data);
                    }
                });
            },function(data,cb){//6 文章被赞数
                UserReviews.countBySql("select id_ from t_ef_user_reviews where type='3' and flag='1' and relid=?",[pid],function(err,result){
                    if (err) {
                        next(err);
                    } else {
                        data.userupCot=result;
                        cb(null,data);
                    }
                });
            },function(data,cb){//7 文章收藏数
                UserAttention.countBySql("select id_ from t_ef_user_attention where type='2' and relid=?",[pid],function(err,result){
                    if (err) {
                        next(err);
                    } else {
                        data.shouCot=result;
                        cb(null,data);
                    }
                });
            },function(data,cb){//8 文章非赞数
                UserReviews.countBySql("select id_ from t_ef_user_reviews where type='3' and flag='0' and relid=?",[pid],function(err,result){
                    if (err) {
                        next(err);
                    } else {
                        data.userdownCot=result;
                        cb(null,data);
                    }
                });
            },function(data,cb){//9 文章回复
                var params=[pid];
                var page=new Page({end:10});
                UserComment.queryPageBySql("select t1.*,t2.username from t_ef_user_comment t1 join t_ef_user t2 on t1.userid=t2.id_ where commendid is null and artideid=? order by commenttime desc",page,params,function(err,result){
                    if (err) {
                        next(err);
                    } else {
                        data.comments=page.data;
                        cb(null,data);
                    }
                });
            }
        ],function(err,results){
            if(err){
                next(err);
            }
            //console.log(results);
            res.render('artideView',results);
        });
    } else {
        var err=new Error("查询[id_]不能为空!");
        next(err);
    }
});

router.post("/add_article", function (req, res) {
    var Artide=DB.get("Artide");
    var artideBean = req.body;
    artideBean.id_ = uuid.v1();
    artideBean.created = new Date();
    artideBean.updated = new Date();
    artideBean.userid=req.session.user.id_;
    artideBean.username=req.session.user.username;
    artideBean.content = artideBean.content.replace(BAG_REG, '');
    Artide.insert(artideBean, function (err, result) {
        if (err) {
            res.status(500);
            res.render("500", {
                'error': err
            });
        } else {
            res.redirect("/");
        }
    });
});

router.post("/edit_article", function (req, res) {
    var Artide=DB.get("Artide");
    var artideBean = req.body;
    artideBean.updated = new Date();
    Artide.update(artideBean, function (err, result) {
        if (err) {
            res.status(500);
            res.render("500", {
                'error': err
            });
        } else {
            res.redirect("/");
        }
    });
});

module.exports = router;