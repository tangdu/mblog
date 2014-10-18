/**
 *MySQL Model
 **/
//var uuid = require('node-uuid'); uuid.v1() / uuid.v4()

var mq = require("mysql");
var logger = require('./logger');
var util=require("util");
var conf=require("../config.js");
var uuid=require("node-uuid");
var pool=null;
var db=null;

function Table(tablename,util,fields){
    this.tablename=tablename;
    this.pool=util.pool;
    this.fields=fields;
}
//检查表字段
Table.prototype.checkTable=function(values){
    if(values && this.fields){
        var flag=false;
        this.fields.forEach(function(r){
            for(var prop in values){
                if(r===prop|| r.name===prop){
                    flag=true;
                }
            }
            if(!flag){
                return false;
            }
        });
    }
    return true;
}
//clear表字段
Table.prototype.clearTable=function(values){
    if(values && this.fields){
        for(var prop in values){
            var flag=false;
            for(var i=0;i<this.fields.length;i++){
                var r=this.fields[i];
                if(r===prop||r.name===prop){
                    flag=true;
                    break;
                }
            }
            if(!flag && prop!=null){
                console.error("-not match property-"+prop);
                delete values[prop];
            }
        }
    }
    return true;
}
Table.prototype.getConnection = function(callback) {
    if(!callback){
        callback=function(){};
    }
    this.pool.getConnection(function(err, connection) {
        if (err) {
            throw err;
        }
        callback(connection);
    });
};

//save
Table.prototype.insert = function(values, callback) {
    if(!callback){
        callback=function(){};
    }
    var me=this;
    if (this.clearTable(values)) {
        if(typeof values["id_"]=='underfined'||values["id_"]==null || values["id_"]===""){
            values["id_"]=uuid.v1();
        }
        this.getConnection(function(connection) {
            var query = connection.query("insert into " + me.tablename + " set ?", values, function(err, result) {
                if (err) {
                    callback(err,null);
                }else{
                    callback(null,values["id_"]);//TODO　返回生成ＩＤ
                }
                connection.release(); //release
            });
            logger.debug(query.sql);
        })
    }
};

//get_返回空为错误
Table.prototype.get = function(ID, callback) {
    if(!callback){
        callback=function(){};
    }
    var me=this;
    if (ID != null && ID != "") {
        this.getConnection(function(connection) {
            var query = connection.query("select * from " + me.tablename + " where id_=?", ID, function(err, result) {
                if (err || result.length<1) {
                    callback(err,result);
                }else{
                    callback(null,result[0]);
                }
                connection.release(); //release
            });
            logger.debug(query.sql);
        });
    }
};

//update
Table.prototype.update = function(values, callback) {
    if(!callback){
        callback=function(){};
    }
    var me=this;
    if (this.clearTable(values)) {
        this.getConnection(function(connection) {
            var query = connection.query("update  " + me.tablename + " set ? where id_=" + connection.escape(values.id_), values, function(err, result) {
                if (err) {
                    callback(err,result);
                }else{
                    callback(null,result);
                }
                connection.release(); //release
            });
            logger.debug(query.sql);
        });
    }
};



//delete
Table.prototype.remove = function(ID, callback) {
    if(!callback){
        callback=function(){};
    }
    var me=this;
    if (ID != null && ID != "") {
        this.getConnection(function(connection) {
            var query = connection.query("delete  from  " + me.tablename + "  where id_=?", ID, function(err, result) {
                if (err) {
                    callback(err,result);
                }else{
                    callback(null,result);
                }
                connection.release(); //release
            });
            logger.debug(query.sql);
        });
    }
}

//exists
Table.prototype.exists = function(tablename, callback) {
    if(!callback){
        callback=function(){};
    }
    if (tablename) {
        this.getConnection(function(connection) {
            var sql = "select table_name from information_schema.tables where table_schema='" + config_.database + "' and table_name='" + tablename + "'";
            var query = connection.query(sql, function(err, result) {
                if (err) {
                    callback(err,result);
                }else{
                    callback(null,result);
                }
                connection.release(); //release
            });
            logger.debug(query.sql);
        });
    }
}

//clear
Table.prototype.clear = function(tablename, callback) {
    if(!callback){
        callback=function(){};
    }
    if (tablename) {
        this.getConnection(function(connection) {
            var sql = "TRUNCATE TABLE " + tablename;
            var query = connection.query(sql, function(err, result) {
                if (err) {
                    callback(err,result);
                }else{
                    callback(null,result);
                }
                connection.release(); //release
            });
            logger.debug(query.sql);
        });
    }
}

//count
Table.prototype.count = function(callback) {
    if(!callback){
        callback=function(){};
    }
    var me=this;
    this.getConnection(function(connection) {
        var query = connection.query("select count(*) as count from " + me.tablename, function(err, result) {
            if (err) {
                callback(err,result);
            }else{
                callback(null,result[0].count);
            }
            connection.release(); //release
        });
        logger.debug(query.sql);
    });
}
Table.prototype.countBySql = function(sql, p,callback) {
    if((typeof p == 'function') && p.constructor == Function){
        callback=p;
    }else{
        if (p) {
            for (var i=0;i<p.length;i++) {
                sql=sql.replace("?",this.pool.escape(p[i]));
            }
        }
    }
    if(!callback){
        callback=function(){};
    }
    this.getConnection(function(connection) {
        var query = connection.query("select count(*) as count from ( " + sql + " ) T", function(err, result) {
            if (err) {
                callback(err,result);
            }else{
                callback(null,result[0].count);
            }
            connection.release(); //release
        });
        logger.debug(query.sql);
    });
}

//query
Table.prototype.where = function(params, callback) {
    if(!callback){
        callback=function(){};
    }
    var sql = "select * from " + this.tablename + " where 1=1";
    if (this.clearTable(params)) {
        for (var pro in params) {
            sql += " and " + pro + "=" + this.pool.escape(params[pro]);
        }
    }

    this.getConnection(function(connection) {
        var query = connection.query(sql, function(err, result) {
            if (err) {
                callback(err,result);
            }else{
                callback(null,result);
            }
            connection.release(); //release
        });
        logger.debug(query.sql);
    });
}
Table.prototype.where = function(params,orders, callback) {
    if(!callback){
        callback=function(){};
    }
    var sql = "select * from " + this.tablename + " where 1=1";
    if (this.clearTable(params)) {//参数
        for (var pro in params) {
            sql += " and " + pro + "=" + this.pool.escape(params[pro]);
        }
    }
    if(orders){//排序
        for (var pro in orders) {
            sql+=" order by "+pro+" " + orders[pro];
        }
    }

    if((typeof orders == 'function') && orders.constructor == Function){
        callback=orders;
    }

    this.getConnection(function(connection) {
        var query = connection.query(sql, function(err, result) {
            if (err) {
                callback(err,result);
            }else{
                callback(null,result);
            }
            connection.release(); //release
        });
        logger.debug(query.sql);
    });
}
Table.prototype.queryAll = function(callback) {
    if(!callback){
        callback=function(){};
    }
    var me=this;
    this.getConnection(function(connection) {
        var query = connection.query("select * from " + me.tablename, function(err, result) {
            if (err) {
                callback(err,result);
            }else{
                callback(null,result);
            }
            connection.release(); //release
        });
        logger.debug(query.sql);
    });
}
Table.prototype.queryPage = function(page, callback) {
    if(!callback){
        callback=function(){};
    }
    var me=this;
    this.count(function(err,result) {
        if(err){
            callback(err,result);
        }else{
            //计数
            page.totalCount = result;
            page.totalPage = Math.ceil(page.totalCount / page.pageSize);
            //分页
            me.getConnection(function(connection) {
                var query = connection.query("select * from " + me.tablename + " limit " + page.start + "," + page.end + "", function(err, result) {
                    if (err) {
                        callback(err,page);
                    }else{
                        page.data = result;
                        callback(null,page);
                    }
                    connection.release(); //release
                });
                logger.debug(query.sql);
            });
        }
    });
}

Table.prototype.queryPageBySql = function(sql, page,params, callback) {
    if(!callback){
        callback=function(){};
    }
    if(params && (typeof params == 'function') && params.constructor == Function){
        callback=params;
    }

    if ((params)) {
        for (var i=0;i<params.length;i++) {
            sql=sql.replace("?",this.pool.escape(params[i]));
        }
    }
    var me=this;
    this.countBySql(sql, function(err,result) {
        if(err){
            callback(err,result);
        }else{
            //计数
            page.totalCount = result;
            page.totalPage = Math.ceil(page.totalCount / page.pageSize);
            //分页
            me.getConnection(function(connection) {
                var query = connection.query(  sql + "  limit " + page.start + "," + page.end + "", function(err, result) {
                    if (err) {
                        callback(err,result);
                    }else{
                        page.data = result;
                        callback(null,page);
                    }
                    connection.release(); //release
                });
                logger.debug(query.sql);
            });
        }
    });
}

Table.prototype.queryPage = function(page,params, callback) {
    if(!callback){
        callback=function(){};
    }
    var sql = "select * from " + this.tablename + " where 1=1";
    if (this.clearTable(params)) {
        for (var pro in params) {
            sql += " and " + pro + "=" + this.pool.escape(params[pro]);
        }
    }
    this.queryPageBySql(sql,page,callback);
}

//executeSql
Table.prototype.executeSql = function(sql,params, callback) {
    if(!callback){
        callback=function(){};
    }
    if ((params)) {
        for (var i=0;i<params.length;i++) {
            sql=sql.replace("?",this.pool.escape(params[i])) ;
        }
    }
    this.getConnection(function(connection) {
        var query = connection.query(sql, function(err, result) {
            if (err) {
                callback(err,result);
            }else{
                callback(null,result);
            }
            connection.release(); //release
        });
        logger.debug(query.sql);
    });
}
//execute
/*Table.prototype.execute = function(sql,values, callback) {
    if(!callback){
        callback=function(){};
    }
    var me=this;
    if (this.clearTable(values)) {
        this.getConnection(function(connection) {
            var query = connection.query(sql, values, function(err, result) {
                if (err) {
                    callback(err,result);
                }else{
                    callback(null,result);
                }
                connection.release(); //release
            });
            logger.debug(query.sql);
        });
    }
};*/

var createPool = function() {
    if(pool==null){
        pool=mq.createPool(conf);
    }
    return pool;
}

//查询工具类
function DBUtil() {
  this.pool = createPool();
  this.tables = [];
};

DBUtil.prototype.define = function(table) {
    var me=this;
    if(util.isArray(table)){
        table.forEach(function(r){
            me.tables.push([r.key,new Table(r.name,me,r.fields)]);
        });
    }else{
        me.tables.push([table.key,new Table(table.name,me,table.fields)]);
    }
};
DBUtil.prototype.get=function(tablename){
    if(tablename){
        var _len=this.tables.length;
        for(i=0;i<_len;i++){
            if(this.tables[i][0]==tablename){
                return  this.tables[i][1];
            }
        }
    }
    return null;
};

exports.Instance = function() {
  if (db == null) {
    db = new DBUtil();
  }
  return db;
};

//test
/*var db = this.Instance();
var User = db.define('t_ef_user');
User.get('1', function(result) {
  console.log(result);
});*/