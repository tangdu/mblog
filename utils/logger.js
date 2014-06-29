/**
*LOGGER File
**/
var fs = require('fs');
var conf=require("../config.js");
var errorLogfile = fs.createWriteStream(conf.logger_path, {flags: 'a+',encoding:'utf8'});
/*
记录日志
*/
exports.error=function(err){
	if(err){
		var meta = '[' + new Date() + '] ' +err.stack  + '\n'; 
		 errorLogfile.write(meta);
	}
}
exports.debug=function(obj){
	if(conf.logger_level==="debug" && obj!=null){
		console.log("DEBUG:"+obj);
	}
}
