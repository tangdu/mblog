var express = require('express');
var router = express.Router();
var async=require("async");

/**
 * 用户文章点赞
 */
router.post("/user_up_artide",function(req,res,next){
    var UserReviews=DB.get("UserReviews");
    var reviewBean=req.body;
    reviewBean.operationtime=new Date();
    reviewBean.userid=req.session.user.id_;
    reviewBean.type="3";
    reviewBean.flag="1";
    async.waterfall([function(cb){
        UserReviews.insert(reviewBean,function(err,result){
            if (err) {
                next(err);
            } else {
                cb(null,{});
            }
        });
    },function(data,cb){
        UserReviews.countBySql("select id_ from t_ef_user_reviews where type='3' and flag='1' and relid=?",[reviewBean.relid],function(err,result){
            if (err) {
                next(err);
            } else {
                data.count=result;
                cb(null,data);
            }
        });
    }],function(err,data){
        if (err) {
            next(err);
        } else {
            res.json({success:true,count:data.count});
        }
    });
});

/**
 * 用户文章非赞
 */
router.post("/user_down_artide",function(req,res,next){
    var UserReviews=DB.get("UserReviews");
    var reviewBean=req.body;
    reviewBean.operationtime=new Date();
    reviewBean.userid=req.session.user.id_;
    reviewBean.type="3";
    reviewBean.flag="0";
    async.waterfall([function(cb){
        UserReviews.insert(reviewBean,function(err,result){
            if (err) {
                next(err);
            } else {
                cb(null,{});
            }
        });
    },function(data,cb){
        UserReviews.countBySql("select id_ from t_ef_user_reviews where type='3' and flag='0' and relid=?",[reviewBean.relid],function(err,result){
            if (err) {
                next(err);
            } else {
                data.count=result;
                cb(null,data);
            }
        });
    }],function(err,data){
        if (err) {
            next(err);
        } else {
            res.json({success:true,count:data.count});
        }
    });
});

/**
 * 用户评论点赞
 */
router.post("/user_up_comment",function(req,res,next){
    var UserReviews=DB.get("UserReviews");
    var reviewBean=req.body;
    reviewBean.operationtime=new Date();
    reviewBean.userid=req.session.user.id_;
    reviewBean.type="4";
    reviewBean.flag="1";
    UserReviews.insert(reviewBean,function(err,result){
        if (err) {
            next(err);
        } else {
            res.json({success:true,count:1});
        }
    });
});

/**
 * 用户评论非赞
 */
router.post("/user_down_comment",function(req,res,next){
    var UserReviews=DB.get("UserReviews");
    var reviewBean=req.body;
    reviewBean.operationtime=new Date();
    reviewBean.userid=req.session.user.id_;
    reviewBean.type="4";
    reviewBean.flag="0";
    async.waterfall([function(cb){
        UserReviews.insert(reviewBean,function(err,result){
            if (err) {
                next(err,cb);
            } else {
                cb(null,{});
            }
        });
    },function(data,cb){
        UserReviews.countBySql("select id_ from t_ef_user_reviews where type='4' and flag='0' and artideid=?",[reviewBean.artideid],function(err,result){
            if (err) {
                next(err);
            } else {
                data.userdownCot=result;
                cb(null,data);
            }
        });
    }],function(err,data){
        if(err){
            next(err);
        }
        res.json({success:true,count:data.userdownCot});
    })
});


module.exports = router;