var express = require('express');
var router = express.Router();
var async=require("async");

/**
 * 用户关注
 */
router.post("/add_userattention",function(req,res,next){
    var UserAttention=DB.get("UserAttention");
    var attentionBean = req.body;
    attentionBean.operationtime=new Date();
    attentionBean.userid=req.session.user.id_;
    attentionBean.type="1";
    UserAttention.insert(attentionBean, function (err, result) {
        if (err) {
            next(err);
        } else {
            res.json({success:true});
        }
    });
});

/**
 * 文章收藏
 */
router.post("/add_artideattention",function(req,res,next){
    var UserAttention=DB.get("UserAttention");
    var attentionBean = req.body;
    attentionBean.operationtime=new Date();
    attentionBean.userid=req.session.user.id_;
    attentionBean.type="2";
    async.waterfall([function(cb){
        UserAttention.insert(attentionBean, function (err, result) {
            if (err) {
                next(err);
            } else {
                cb(null,{});
            }
        });
    },function(data,cb){
        UserAttention.countBySql("select id_ from t_ef_user_attention where type='2' and relid=?", [attentionBean.relid],function(err,result){
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



module.exports = router;