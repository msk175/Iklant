module.exports = trailBalance;

function trailBalance() {
   //this.clearAll();
}

var glCodeId;
var glCode;
var coaName;
var credit;
var debit;
var netCredit;
var netDebit;
var openingBal;
var closingBal;

trailBalance.prototype = {
    getGlCodeId : function(){
        return this.glCodeId;
    },
    setGlCodeId : function (t_glCodeId){
        this.glCodeId = t_glCodeId;
    },
    getGlCode : function(){
        return this.glCode;
    },
    setGlCode : function (t_glCode){
        this.glCode = t_glCode;
    },
    getCoaName : function(){
        return this.coaName;
    },
    setCoaName : function (t_coaName){
        this.coaName = t_coaName;
    },
    getNetCredit : function(){
        return this.netCredit;
    },
    setNetCredit : function (t_netCredit){
        this.netCredit = t_netCredit;
    },
    getNetDebit : function(){
        return this.netDebit;
    },
    setNetDebit : function (t_netDebit){
        this.netDebit = t_netDebit;
    },
    getCredit : function(){
        return this.credit;
    },
    setCredit : function (t_credit){
        this.credit = t_credit;
    },
    getDebit : function(){
        return this.debit;
    },
    setDebit : function (t_debit){
        this.debit = t_debit;
    },
    getOpeningBal:function(){
        return this.openingBal;
    },
    setOpeningBal:function(t_openingBal){
        this.openingBal = t_openingBal;
    },
    getClosingBal:function(){
        return this.closingBal;
    },
    setClosingBal:function(t_closingBal){
        this.closingBal = t_closingBal;
    },

    clearAll: function(){
        this.setGlCodeId("");
        this.setGlCode("");
        this.setCoaName("");
        this.setNetCredit("");
        this.setNetDebit("");
        this.setCredit("");
        this.setDebit("");
        this.setOpeningBal("");
        this.setClosingBal("");
    }
};
