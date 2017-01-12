module.exports = LoanAdjustment;

function LoanAdjustment() {	
  //this.clearAll();
}

var globalAccountNum;
var clientPaymentDetails = new Array();
var adjustmentNote;
var revertReason;
var financialYearEndDate;
var paymentId;
var paymentDetails;
var officeId;
var glCodeId;
var previousPaymentDate;
var nextPaymentDate;
var paymentType;
var amount;
var transactionDate;
var transactionDateStr;
var glCodes = new Array();
var revertReasons = new Array();
var receiptId;
var receiptDate;
var adjustData;
var voucherNumber;
var paymentComments;
var isRevertPaymentNotApplicable;

LoanAdjustment.prototype = {
    getIsRevertPaymentNotApplicable : function(){
        return this.isRevertPaymentNotApplicable;
    },
    setIsRevertPaymentNotApplicable : function (t_isRevertPaymentNotApplicable){
        this.isRevertPaymentNotApplicable = t_isRevertPaymentNotApplicable;
    },


    getPaymentComments : function(){
        return this.paymentComments;
    },
    setPaymentComments : function (t_paymentComments){
        this.paymentComments = t_paymentComments;
    },
	getTransactionDateStr : function(){
		return this.transactionDateStr;
	},
	
	setTransactionDateStr : function (t_transactionDateStr){
		this.transactionDateStr = t_transactionDateStr;
	},
	getGlobalAccountNum: function(){
		return this.globalAccountNum;
	},
	
	setGlobalAccountNum: function (t_globalAccountNum){
		this.globalAccountNum = t_globalAccountNum;
	},

	getClientPaymentDetails: function(){
		return this.clientPaymentDetails;
	},
	
	setClientPaymentDetails: function (t_clientPaymentDetails){
		this.clientPaymentDetails = t_clientPaymentDetails;
	},

	getAdjustmentNote: function(){
		return this.adjustmentNote;
	},
	
	setAdjustmentNote: function (t_adjustmentNote){
		this.adjustmentNote = t_adjustmentNote;
	},

	getRevertReason: function(){
		return this.revertReason;
	},
	
	setRevertReason: function (t_revertReason){
		this.revertReason = t_revertReason;
	},

	getFinancialYearEndDate: function(){
		return this.financialYearEndDate;
	},
	
	setFinancialYearEndDate: function (t_financialYearEndDate){
		this.financialYearEndDate = t_financialYearEndDate;
	},

	getPaymentId: function(){
		return this.paymentId;
	},
	
	setPaymentId: function (t_paymentId){
		this.paymentId = t_paymentId;
	},

	getPaymentDetails: function(){
		return this.paymentDetails;
	},
	
	setPaymentDetails: function (t_paymentDetails){
		this.paymentDetails = t_paymentDetails;
	},

	getOfficeId: function(){
		return this.officeId;
	},
	
	setOfficeId: function (t_officeId){
		this.officeId = t_officeId;
	},

	getGlCodeId: function(){
		return this.glCodeId;
	},
	
	setGlCodeId: function (t_glCodeId){
		this.glCodeId = t_glCodeId;
	},

	getPreviousPaymentDate: function(){
		return this.previousPaymentDate;
	},
	
	setPreviousPaymentDate: function (t_previousPaymentDate){
		this.previousPaymentDate = t_previousPaymentDate;
	},

	getNextPaymentDate: function(){
		return this.nextPaymentDate;
	},
	
	setNextPaymentDate: function (t_nextPaymentDate){
		this.nextPaymentDate = t_nextPaymentDate;
	},

	getPaymentType: function(){
		return this.paymentType;
	},
	
	setPaymentType: function (t_paymentType){
		this.paymentType = t_paymentType;
	},

	getAmount: function(){
		return this.amount;
	},
	
	setAmount: function (t_amount){
		this.amount = t_amount;
	},

	getTransactionDate: function(){
		return this.transactionDate;
	},
	
	setTransactionDate: function (t_transactionDate){
		this.transactionDate = t_transactionDate;
	},

	getGlCodes: function(){
		return this.glCodes;
	},
	
	setGlCodes: function (t_glCodes){
		this.glCodes = t_glCodes;
	},
	
	getRevertReasons: function(){
		return this.revertReasons;
	},
	
	setRevertReasons: function (t_revertReasons){
		this.revertReasons = t_revertReasons;
	},
	getReceiptId: function(){
		return this.receiptId;
	},
	
	setReceiptId: function (t_receiptId){
		this.receiptId = t_receiptId;
	},

	getReceiptDate: function(){
		return this.receiptDate;
	},
	
	setReceiptDate: function (t_receiptDate){
		this.receiptDate = t_receiptDate;
	},
	getAdjustData: function(){
		return this.adjustData;
	},
	
	setAdjustData: function (t_adjustData){
		this.adjustData = t_adjustData;
	},
	
	getVoucherNumber: function(){
		return this.voucherNumber;
	},
	
	setVoucherNumber: function (t_voucherNumber){
		this.voucherNumber = t_voucherNumber;
	},
	
	clearAll: function() {
		this.setGlobalAccountNum("");
		this.setClientPaymentDetails(new Array());
		this.setAdjustmentNote("");
		this.setRevertReason("");
		this.setFinancialYearEndDate("");
		this.setPaymentId("");
		this.setPaymentDetails("");
		this.setOfficeId("");
		this.setGlCodeId("");
		this.setPreviousPaymentDate("");
		this.setNextPaymentDate("");
		this.setPaymentType("");
		this.setAmount("");
		this.setTransactionDate("");
		this.setGlCodes(new Array());
		this.setRevertReasons(new Array());
		this.setReceiptId("");
		this.setReceiptDate("");
		this.setAdjustData("");
		this.setVoucherNumber("");
	}
}