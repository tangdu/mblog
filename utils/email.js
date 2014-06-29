/**
 * Created by tangdu on 2014-06-29.
 */

var conf=require("../config.js");
var nodemailer=require("nodemailer");


var smtpTransport = nodemailer.createTransport("SMTP",{
    host: "smtp.163.com",
    secureConnection: true,
    port: 465,
    auth: {
        user: "tdu_hn@163.com",
        pass: "tdu_hn123"
    }
});

var Email=function(){
    this.sendText=function(subject,text){
        subject=subject||"EMPTY";

        smtpTransport.sendMail({
            from:'tdu_hn@163.com',
            to:conf.email,
            subject:subject,
            text:text
        },function(err,res){
            if(!err){
                console.log("success...");
            }
        });
    }
    this.sendHtml=function(subject,html){
        subject=subject||"EMPTY";
        smtpTransport.sendMail({
            from:'tdu_hn@163.com',
            to:conf.email,
            subject:subject,
            html:html
        },function(err,res){
            if(!err){
                console.log("success...");
            }
        });
    }
}



module.exports = Email;