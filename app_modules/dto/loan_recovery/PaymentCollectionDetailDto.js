module.exports = PaymentCollectionDetailDto;

var paymentCollectionId;
var	amount;
var	clientAmount;
var groupId;
var	groupName;
var	globalAccNum;
var	modeOfPayment;
var isMatch;
var clientName;
var officeId;
var glcodeId;
var chequeNumber;
var chequeDate;
var transactionDate;
var paymentId;
var fileLocation = new Array();
var isApplyPayment;
var receiptNum;
var chequeDateStr;
var docId = new Array();

function PaymentCollectionDetailDto() {	
   //this.clearAll();
}
PaymentCollectionDetailDto.prototype = {
	getChequeDateStr : function(){
		return this.chequeDateStr;
	},
	setChequeDateStr : function (t_chequeDateStr){
		this.chequeDateStr = t_chequeDateStr;
	},
	getReceiptId: function(){
		return this.receiptNum;
	},
	setReceiptId: function (t_receiptId){
		this.receiptNum = t_receiptId;
	},
	getPaymentCollectionId : function() {
		return this.paymentCollectionId;
	},
	setPaymentCollectionId : function(t_paymentCollectionId) {
		this.paymentCollectionId = t_paymentCollectionId;
	},
	getAmount : function() {
		return this.amount;
	},
	setAmount : function(t_amount) {
		this.amount = t_amount;
	},
	getClientAmount : function() {
		return this.clientAmount;
	},
	setClientAmount : function(t_amount) {
		this.clientAmount = t_amount;
	},
	getGroupId : function() {
		return this.groupId;
	},
	setGroupId : function(t_groupId) {
		this.groupId = t_groupId;
	},
	getGroupName : function() {
		return this.groupName;
	},
	setGroupName : function(t_groupName) {
		this.groupName = t_groupName;
	},
	getGlobalAccNum : function() {
		return this.globalAccNum;
	},
	setGlobalAccNum : function(t_globalAccNum) {
		this.globalAccNum = t_globalAccNum;
	},
	getModeOfPayment : function() {
		return this.modeOfPayment;
	},
	setModeOfPayment : function(t_modeOfPayment) {
		this.modeOfPayment = t_modeOfPayment;
	},
	getIsMatch : function() {
		return this.isMatch;
	},
	setIsMatch : function(t_isMatch) {
		this.isMatch = t_isMatch;
	},
	getOfficeId : function() {
		return this.officeId;
	},
	setOfficeId : function(t_officeId) {
		this.officeId = t_officeId;
	},
	getClientName : function() {
		return this.clientName;
	},
	setClientName : function(t_clientName) {
		this.clientName = t_clientName;
	},
	getGlcodeId : function() {
		return this.glcodeId;
	},
	setGlcodeId : function(t_glcodeId) {
		this.glcodeId = t_glcodeId;
	},
	
	getChequeNumber : function() {
		return this.chequeNumber;
	},
	setChequeNumber : function(t_chequeNumber) {
		this.chequeNumber = t_chequeNumber;
	},
	
	getChequeDate : function() {
		return this.chequeDate;
	},
	setChequeDate : function(t_chequeDate) {
		this.chequeDate = t_chequeDate;
	},
	
	getTransactionDate : function() {
		return this.transactionDate;
	},
	setTransactionDate : function(t_transactionDate) {
		this.transactionDate = t_transactionDate;
	},
	
	getPaymentId : function() {
		return this.paymentId;
	},
	setPaymentId : function(t_paymentId) {
		this.paymentId = t_paymentId;
	},
	
	getFileLocation : function() {
		return this.fileLocation;
	},
	setFileLocation : function(t_fileLocation) {
		this.fileLocation = t_fileLocation;
	},
    getDocId : function() {
        return this.docId;
    },
    setDocId : function(t_docId) {
        this.docId = t_docId;
    },
	
	getIsApplyPayment : function() {
		return this.isApplyPayment;
	},
	setIsApplyPayment : function(t_isApplyPayment) {
		this.isApplyPayment = t_isApplyPayment;
	},

    clearAll: function(){
        this.setChequeDateStr("");
        this.setReceiptId("");
        this.setPaymentCollectionId("");
        this.setAmount("");
        this.setClientAmount("");
        this.setGroupId("");
        this.setGroupName("");
        this.setGlobalAccNum("");
        this.setModeOfPayment("");
        this.setIsMatch("");
        this.setOfficeId("");
        this.setClientName("");
        this.setGlcodeId("");
        this.setChequeNumber("");
        this.setChequeDate("");
        this.setTransactionDate("");
        this.setPaymentId("");
        this.setFileLocation(new Array());
        this.setIsApplyPayment("");
        this.setDocId(new Array());
    }

};