/**
 * Created by tangdu on 14-3-18.
 * App 配置信息
 */
/*var mutils = {
 isArray: function(obj) {
 return (typeof obj == 'object') && obj.constructor == Array;
 },
 isString: function(obj) {
 return (typeof obj == 'string') && obj.constructor == String;
 },
 isNumber: function(obj) {
 return (typeof obj == 'number') && obj.constructor == Number;
 },
 isDate: function(obj) {
 return (typeof obj == 'object') && obj.constructor == Date;
 },
 isFunction: function(obj) {
 return (typeof obj == 'function') && obj.constructor == Function;
 },
 isObject: function(obj) {
 return (typeof obj == 'object') && obj.constructor == Object;
 }
 }*/
var app = {
    appport: 3000,
    host: '127.0.0.1',
    port: '3306',
    user: 'elife',
    password: 'elife',
    database: 'elife',
    logger_path: "error.log",
    logger_level: 'debug' //debug | error
};

//系统设置全局变量
global.Sys = {
    cont: {
        artideType: [
            {key: '首页', value: 'index'},
            {key: '编辑语言',
                child:[
                    {key:'Java',value:'java'},{key:'Python',value:'phthon'},{key:'GoLang',value:'gplang'},
                    {key:'NodeJS',value:'nodejs'}]
            },
            {key: 'Web前端',
                child:[
                    {key:'JavaScript',value:'javascript'},{key:'Html+Css',value:'html+css'},{key:'Jquery',value:'jquery'},
                    {key:'ExtJS',value:'extjs'},{key:'SmartClient',value:'smartclient'}]
            },
            {key: '数据库',
                child:[
                    {key:'Oracle',value:'oracle'},{key:'MySQL',value:'mysql'},{key:'NoSQL',value:'nosql'}]
            },
            {key: '开发平台',
                child:[
                    {key:'Spring',value:'spring'},{key:'Hibernate',value:'hibernate'},{key:'MyBatis',value:'mybatis'},
                    {key:'Servlet',value:'servlet'},{key:'WebService',value:'webservice'},{key:'Linux',value:'linux'},
                    {key:'Weblogic',value:'weblogic'},{key:'Maven',value:'maven'},]
            },
            {key: '编程感慨', value: 'bcgw'}
        ],
        siteName: "IT人生"
    },
    permissionUrls: [
        "/push_article", "/save_article",
        "/add_userattention",
        "/add_artideattention","/add_comment",
        "/user_up_artide","/user/info"
    ],
    lib: {

    }
}

module.exports = app;