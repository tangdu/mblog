
/*
 * GET users listing.
 */
var express = require('express');
var router = express.Router();
var crypto=require("crypto");
var async=require("async");

router.post("/login",function(req,res){
    var User=DB.get("User");
    var params=req.body;
    var sha1 = crypto.createHash('sha1');
    sha1.update(params.password);
    params.password=sha1.digest('hex');
    User.where(params,function(err,result){
        if(err){
           next(err);
        }else{
            if(result && result.length>0){
                req.session.user=result[0];
                var params={id_:result[0].id_,lastlogintime:new Date()};//更新登录时间
                User.update(params);
                res.redirect("/");
            }else{
                res.render('signin',{message:'用户名或密码错误'});
            }
        }
    });
});
router.post("/register",function(req,res,next){
    var User=DB.get("User");
    var user = req.body;
    user.registertime = new Date();
    user.role="2";
    user.status="1";
    //加密，密码不加密
    var sha1 = crypto.createHash('sha1');
    sha1.update(user.password);
    user.password=sha1.digest('hex');
    User.insert(user,function(err,result){
        if(err){
            next(err);
        }else{
            res.redirect("/");
        }
    });
});
router.get("/info",function(req,res){
    var User=DB.get("User");
    User.get(req.session.user.id_,function(err,results){
        if(err){
            next(err);
        }else{
            res.render("userInfo",{userInfo:results});
        }
    });
});
router.get("/view/:id",function(req,res){
    var User=DB.get("User");
    User.get(req.params.id,function(err,results){
        if(err){
            next(err);
        }else{
            res.render("userlink",{userInfo:results});
        }
    });
});

module.exports = router;