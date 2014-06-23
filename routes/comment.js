var express = require('express');
var router = express.Router();
var Page=require("../utils/page");
var async=require("async");


/**
 * 添加评论
 */
router.post("/add_comment",function(req,res,next){
    var UserComment=DB.get("UserComment");
    var commentBean=req.body;
    commentBean.commenttime=new Date();
    commentBean.userid=req.session.user.id_;
    async.waterfall([function(cb){
        UserComment.insert(commentBean,function(err,result){
            if(err){
                next(err);
            }else{
                cb(null,{});
            }
        });
    },function(data,cb){
        var params=[commentBean.artideid];
        var page=new Page({end:10});
        UserComment.queryPageBySql("select * from t_ef_user_comment where commendid is null and artideid=? order by commenttime desc",page,params,function(err,result){
            if (err) {
                next(err);
            } else {
                data.comments=page.data;
                cb(null,data);
            }
        });
    }],function(err,data){
        if(err){
            next(err);
        }
        res.json({success:true,comments:data.comments});
    });
});

module.exports = router;