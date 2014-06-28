/**
 * Created by tangdu on 14-3-8.
 */
//分页对象
var util=require("util");

function Page(config) {
    if(!config){
        config={};
    }

    this.page = config.page || 1;
    this.pageSize = config.pageSize ||10;

    if(this.page<=1){
        this.start=0;
    }else{
        this.start=(this.page-1)*this.pageSize;
    }
    this.end = this.pageSize*this.page;

    if(!config.data){
        this.data=[];
    }

    //util._extend(this,config);
    this.totalCount = 0;
    var totalPage = 0;
    this.getTotalPage=function(){
        return Math.ceil(this.totalPage/this.pageSize);
    }
    return this;
}
module.exports = Page;