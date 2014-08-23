
/*
 * GET users listing.
 */
var express = require('express');
var router = express.Router();
var crypto=require("crypto");
var async=require("async");
var Page=require("../utils/page");

function getClientIp(req) {
    return req.connection.remoteAddress ||req.headers['x-forwarded-for'] || req.headers['x-real-ip'] ||
        req.socket.remoteAddress ||
        req.connection.socket.remoteAddress;
};

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
                var ip_=getClientIp(req);
                console.log(ip_);
                var params={id_:result[0].id_,lastlogintime:new Date(),lastloginip:ip_};//更新登录时间
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
    if(!user.desc||user.desc==""){
        user.desc="无说明，特优秀";
    }
    //加密，密码不加密
    User.where({username:user.username.trim()},function(err,result){
        if(err){
            next(err);
        }else{
            if(result && result.length>0){
                res.render('register', { message: '帐号不能重复，请更换用户名'});
            }else{
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
            }
        }
    });
});
/////////我的信息/////////
router.get("/info/:linkType",function(req,res,next){
    var User=DB.get("User");
    var userid=req.session.user.id_;
    var linkType=req.params.linkType;
    var Article=DB.get("Article");
    var page=new Page({page:(req.query.ipage||1),pageSize:15});
    var sql="";
    var params=[];

    if(linkType==="wdfs"){//我的粉丝
        sql="select * from t_ef_article t1 where t1.id_ in (select relid from t_ef_user_attention where userid=? and type=?) ";
        params=[userid,'1'];
    }else if(linkType==="wdsc"){//我的收藏
        sql="select * from t_ef_article t1 where t1.id_ in (select relid from t_ef_user_attention where userid=? and type=?) ";
        params=[userid,'2'];
    }else if(linkType==="wdwz"){//我的文章
        sql="select * from t_ef_article t1 where t1.userid =? ";
        params=[userid];
    }else if(linkType==="wdpl"){//我的评论
        sql="select * from t_ef_article t1 where t1.id_ in (select distinct artideid from t_ef_user_comment where userid=?) ";
        params=[userid];
    }else if(linkType==="grxx"){//个人信息
        //TODO
    }
    async.waterfall([
        function(cb){
            if(sql!=""){
                Article.queryPageBySql(sql,page,params,function(err){
                    if(err){
                        cb(err,null);
                    }else{
                        cb(err,{rows:page,linkType:linkType});
                    }
                });
            }else{
                cb(null,{rows:null,linkType:linkType});
            }
        },function(data,cb){
            User.get(userid,function(err,results){
                if(err){
                    cb(err,null);
                }else{
                    data.userInfo=results;
                    cb(err,data);
                }
            });
        }
    ],function(err,result){
        if(err){
            next(err);
        }
        res.render("userInfo",result);
    });
});
///////查看用户////////////
router.get("/view/:id/:linkType",function(req,res,next){
    var User=DB.get("User");
    var linkType=req.params.linkType;
    var Article=DB.get("Article");
    var page=new Page({page:(req.query.ipage||1),pageSize:15});
    var userid=req.params.id;
    var sql="";
    var params=[];

    if(linkType==="wdfs"){//我的粉丝
        sql="select * from t_ef_article t1 where t1.id_ in (select relid from t_ef_user_attention where userid=? and type=?) ";
        params=[userid,'1'];
    }else if(linkType==="wdwz"){//我的文章
        sql="select * from t_ef_article t1 where t1.userid =? ";
        params=[userid];
    }
    async.waterfall([
    function(cb){
        Article.queryPageBySql(sql,page,params,function(err){
            if(err){
                cb(err,null);
            }else{
                cb(err,{rows:page,linkType:linkType});
            }
        });
    },function(data,cb){
        User.get(userid,function(err,results){
            if(err){
                cb(err,null);
            }else{
                data.userInfo=results;
                cb(err,data);
            }
        });
    }
    ],function(err,result){
        if(err){
            next(err);
        }
        res.render("userlink",result);
    });

});


router.post("/udpate",function(req,res,next){
    var User=DB.get("User");
    var user = req.body;
    delete  user["account"];
    user.updated = new Date();
    if(!user.desc||user.desc==""){
        user.desc="无说明，特优秀";
    }

    User.update(user,function(err,result){
        if(err){
            next(err);
        }else{
            res.redirect("info/grxx");
        }
    });
});

module.exports = router;