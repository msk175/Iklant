module.exports = BankReconciliationHolder ;

function BankReconciliationHolder() {
    //this.clearAll();
}

var fromDate;
var toDate;
var glcodeValue;
var brsStatusList = new Array();

BankReconciliationHolder.prototype = {
    getFromDate: function(){
        return this.fromDate;
    },

    setFromDate: function (t_fromDate){
        this.fromDate = t_fromDate;
    },

    getToDate: function(){
        return this.toDate;
    },

    setToDate: function (t_toDate){
        this.toDate = t_toDate;
    },

    getGlcodeValue: function(){
        return this.glcodeValue;
    },

    setGlcodeValue: function (t_glcodeValue){
        this.glcodeValue = t_glcodeValue;
    },

    getBrsStatusList: function(){
        return this.brsStatusList;
    },

    setBrsStatusList: function (t_brsStatusList){
        this.brsStatusList = t_brsStatusList;
    },

    clearAll: function(){
        this.setFromDate("");
        this.setOfficeId("");
        this.setToDate("");
        this.setGlcodeValue("");
    }
}