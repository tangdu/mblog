/**
 * Created by tangdu on 14-3-8.
 */
//分页对象
var util=require("util");

function Page(config) {
    if(!config){
        config={};
    }
    if(typeof  config.start =='undefined' || config.start==null){
        this.start = config.start | 0;
    }

    if(typeof  config.end =='undefined' || config.end==null){
        this.end = 10;
    }
    if(typeof  config.page =='undefined' || config.page==null){
        this.page = config.page | 1;
    }
    if(typeof  config.pageSize =='undefined' || config.pageSize==null){
        this.pageSize = 10;
    }
    if(!config.data){
        this.data=[];
    }

    util._extend(this,config);
    this.totalCount = 0;
    this.totalPage = 0;
    return this;
}
module.exports = Page;