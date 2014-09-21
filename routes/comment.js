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
                commentBean.id_=result;
                cb(null,{userComment:commentBean});
            }
        });
    },function(data,cb){
        var params=[commentBean.artideid];
        UserComment.countBySql("select * from t_ef_user_comment where commendid is null and artideid=?",params,function(err,result){
            if (err) {
                next(err);
            } else {
                data.userComment.commentsCot=result;
                cb(null,data);
            }
        });
    }],function(err,data){
        if(err){
            next(err);
        }
        data.success=true;
        data.userComment.commenttime=moment(data.userComment.commenttime).format('MM-DD HH:mm');
        data.userComment.username=req.session.user.username;
        res.json(data);
    });
});

//删除评论
router.post("/remove_comment/:comment_id",function(req,res,next){
    var UserComment=DB.get("UserComment");
    var commentid=req.params.comment_id;
    UserComment.remove(commentid,function(err,result){
        if(err){
            res.json({success:false});
        }
        res.json({success:true});
    });
});

module.exports = router;