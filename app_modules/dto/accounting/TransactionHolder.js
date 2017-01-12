module.exports = TransactionHolder ;

function TransactionHolder() {
    //this.clearAll();
}
var transactionMasterId;
var subAccountGlCode;
var mainAccountGlCode;
var subAccountName;
var mainAccountName;
var chequeNo;
var chequeDate;
var fromOfficeId;
var toOfficeId;
var fromOfficeName;
var toOfficeName;
var fromOfficeLevelId;
var toOfficeLevelId;
var trxnAmt;
var trxnDate;
var voucherNum;
var notes;

TransactionHolder.prototype = {

    getSubAccountGlCode: function(){
        return this.subAccountGlCode;
    },

    setSubAccountGlCode: function (t_subAccountGlCode){
        this.subAccountGlCode = t_subAccountGlCode;
    },

    getMainAccountGlCode: function(){
        return this.mainAccountGlCode;
    },

    setMainAccountGlCode: function (t_mainAccountGlCode){
        this.mainAccountGlCode = t_mainAccountGlCode;
    },

    getSubAccountName: function(){
        return this.subAccountName;
    },

    setSubAccountName: function (t_subAccountName){
        this.subAccountName = t_subAccountName;
    },

    getMainAccountName: function(){
        return this.mainAccountName;
    },

    setMainAccountName: function (t_mainAccountName){
        this.mainAccountName = t_mainAccountName;
    },

    getChequeNo: function(){
        return this.chequeNo;
    },

    setChequeNo: function (t_chequeNo){
        this.chequeNo = t_chequeNo;
    },

    getChequeDate: function(){
        return this.chequeDate;
    },

    setChequeDate: function (t_chequeDate){
        this.chequeDate = t_chequeDate;
    },

    getFromOfficeId: function(){
        return this.fromOfficeId;
    },

    setFromOfficeId: function (t_fromOfficeId){
        this.fromOfficeId = t_fromOfficeId;
    },

    getFromOfficeLevelId: function(){
        return this.fromOfficeLevelId;
    },

    setFromOfficeLevelId: function (t_fromOfficeLevelId){
        this.fromOfficeLevelId = t_fromOfficeLevelId;
    },

    getToOfficeId: function(){
        return this.toOfficeId;
    },

    setToOfficeId: function (t_toOfficeId){
        this.toOfficeId = t_toOfficeId;
    },

    getToOfficeLevelId: function(){
        return this.toOfficeLevelId;
    },

    setToOfficeLevelId: function (t_toOfficeLevelId){
        this.toOfficeLevelId = t_toOfficeLevelId;
    },

    getFromOfficeName: function(){
        return this.fromOfficeName;
    },

    setFromOfficeName: function (t_fromOfficeName){
        this.fromOfficeName = t_fromOfficeName;
    },

    getToOfficeName: function(){
        return this.toOfficeName;
    },

    setToOfficeName: function (t_toOfficeName){
        this.toOfficeName = t_toOfficeName;
    },

    getTrxnAmt: function(){
        return this.trxnAmt;
    },

    setTrxnAmt: function (t_trxnAmt){
        this.trxnAmt = t_trxnAmt;
    },

    getTrxnDate: function(){
        return this.trxnDate;
    },

    setTrxnDate: function (t_trxnDate){
        this.trxnDate = t_trxnDate;
    },

    getVoucherNum: function(){
        return this.voucherNum;
    },

    setVoucherNum: function (t_voucherNum){
        this.voucherNum = t_voucherNum;
    },

    getNotes: function(){
        return this.notes;
    },

    setNotes: function (t_notes){
        this.notes = t_notes;
    },

    getToDate: function(){
        return this.toDate;
    },

    setToDate: function (t_toDate){
        this.toDate = t_toDate;
    },

    getTransactionMasterId: function(){
        return this.transactionMasterId;
    },

    setTransactionMasterId: function (t_transactionMasterId){
        this.transactionMasterId = t_transactionMasterId;
    },

    clearAll: function(){
        this.setTransactionMasterId("");
        this.setMainAccountGlCode("");
        this.setMainAccountName("");
        this.setSubAccountGlCode("");
        this.setSubAccountName("");
        this.setChequeDate("");
        this.setChequeNo("");
        this.setFromOfficeId("");
        this.setFromOfficeName("");
        this.setToOfficeId("");
        this.setToOfficeName("");
        this.setTrxnAmt("");
        this.setTrxnDate("");
        this.setVoucherNum("");
        this.setNotes("");
    }
}
