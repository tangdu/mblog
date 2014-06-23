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
            {key: '', value: '0', name: '首页'},
            {key: 'Java', value: '1'},
            {key: 'NodeJS', value: '2'},
            {key: 'GoLang', value: '3'},
            {key: 'Python', value: '4'},
            {key: 'Oracle', value: '5'},
            {key: 'MySQL', value: '6'},
            {key: 'GanWu', value: '7',name:'感悟'}
        ],
        siteName: "IT人生"
    },
    permissionUrls: [
        "/push_artide", "/add_article",
        "/edit_article", "/add_userattention",
        "/add_artideattention","/add_comment",
        "/user_up_artide","/user/info"
    ],
    lib: {

    }
}

module.exports = app;