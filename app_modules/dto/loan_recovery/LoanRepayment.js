module.exports = LoanRepayment;

function LoanRepayment() {	
  //this.clearAll();
}
var accountId;
var accountTypeId;
var globalAccountNum;
var retrieveType;
var isDisbursal;
var amount;
var transferPaymentTypeId;
var clientPaymentDetails = new Array();
var relaxMismatchValidationCheck;
var transactionDate;
var paymentDetails;
var lastPaymentDate;
var currentDate;
var disbursementDate;
var financialYearEndDate;
var glCodes = new Array();
var glCodeId;
var receiptNumber;
var receiptDate;
var receiptDateStr;
var accountForTransfer;
var paymentTypeId;
var receiptNum;
var installmentId;
var missedInstallmentIdArray = new Array();
var partialPaidAmount;
var transactionDateStr;
var voucherNumber;
var officeId;
LoanRepayment.prototype = {
	
	getOfficeId : function(){
		return this.officeId;
	},
	setOfficeId : function (t_officeId){
		this.officeId = t_officeId;
	},
	getReceiptDateStr : function(){
		return this.receiptDateStr;
	},
	setReceiptDateStr : function (t_receiptDateStr){
		this.receiptDateStr = t_receiptDateStr;
	},
	getTransactionDateStr : function(){
		return this.transactionDateStr;
	},
	
	setTransactionDateStr : function (t_transactionDateStr){
		this.transactionDateStr = t_transactionDateStr;
	},
	
	getPartialPaidAmount : function(){
		return this.partialPaidAmount;
	},
	
	setPartialPaidAmount : function (t_partialPaidAmount){
		this.partialPaidAmount = t_partialPaidAmount;
	},
	
	getAccountId: function(){
		return this.accountId;
	},
	
	setAccountId: function (t_accountId){
		this.accountId = t_accountId;
	},

	getAccountTypeId: function(){
		return this.accountTypeId;
	},
	
	setAccountTypeId: function (t_accountTypeId){
		this.accountTypeId = t_accountTypeId;
	},

	getGlobalAccountNum: function(){
		return this.globalAccountNum;
	},
	
	setGlobalAccountNum: function (t_globalAccountNum){
		this.globalAccountNum = t_globalAccountNum;
	},

	getRetrieveType: function(){
		return this.retrieveType;
	},
	
	setRetrieveType: function (t_retrieveType){
		this.retrieveType = t_retrieveType;
	},

	getIsDisbursal: function(){
		return this.isDisbursal;
	},
	
	setIsDisbursal: function (t_isDisbursal){
		this.isDisbursal = t_isDisbursal;
	},

	getAmount: function(){
		return this.amount;
	},
	
	setAmount: function (t_amount){
		this.amount = t_amount;
	},

	getTransferPaymentTypeId: function(){
		return this.transferPaymentTypeId;
	},
	
	setTransferPaymentTypeId: function (t_transferPaymentTypeId){
		this.transferPaymentTypeId = t_transferPaymentTypeId;
	},

	getClientPaymentDetails: function(){
		return this.clientPaymentDetails;
	},
	
	setClientPaymentDetails: function (t_clientPaymentDetails){
		this.clientPaymentDetails = t_clientPaymentDetails;
	},

	getRelaxMismatchValidationCheck: function(){
		return this.relaxMismatchValidationCheck;
	},
	
	setRelaxMismatchValidationCheck: function (t_relaxMismatchValidationCheck){
		this.relaxMismatchValidationCheck = t_relaxMismatchValidationCheck;
	},

	getTransactionDate: function(){
		return this.transactionDate;
	},
	
	setTransactionDate: function (t_transactionDate){
		this.transactionDate = t_transactionDate;
	},

	getPaymentDetails: function(){
		return this.paymentDetails;
	},
	
	setPaymentDetails: function (t_paymentDetails){
		this.paymentDetails = t_paymentDetails;
	},

	getLastPaymentDate: function(){
		return this.lastPaymentDate;
	},
	
	setLastPaymentDate: function (t_lastPaymentDate){
		this.lastPaymentDate = t_lastPaymentDate;
	},

	getCurrentDate: function(){
		return this.currentDate;
	},
	
	setCurrentDate: function (t_currentDate){
		this.currentDate = t_currentDate;
	},

	getDisbursementDate: function(){
		return this.disbursementDate;
	},
	
	setDisbursementDate: function (t_disbursementDate){
		this.disbursementDate = t_disbursementDate;
	},

	getFinancialYearEndDate: function(){
		return this.financialYearEndDate;
	},
	
	setFinancialYearEndDate: function (t_financialYearEndDate){
		this.financialYearEndDate = t_financialYearEndDate;
	},

	getGlCodes: function(){
		return this.glCodes;
	},
	
	setGlCodes: function (t_glCodes){
		this.glCodes = t_glCodes;
	},

	getGlCodeId: function(){
		return this.glCodeId;
	},
	
	setGlCodeId: function (t_glCodeId){
		this.glCodeId = t_glCodeId;
	},

	getReceiptId: function(){
		return this.receiptNumber;
	},
	
	setReceiptId: function (t_receiptId){
		this.receiptNumber = t_receiptId;
	},

	getReceiptDate: function(){
		return this.receiptDate;
	},
	
	setReceiptDate: function (t_receiptDate){
		this.receiptDate = t_receiptDate;
	},

	getAccountForTransfer: function(){
		return this.accountForTransfer;
	},
	
	setAccountForTransfer: function (t_accountForTransfer){
		this.accountForTransfer = t_accountForTransfer;
	},
	getPaymentTypeId: function(){
		return this.paymentTypeId;
	},
	setPaymentTypeId: function (t_paymentTypeId){
		this.paymentTypeId = t_paymentTypeId;
	},
	getReceiptNum : function(){
		return this.receiptNum;
	},
	setReceiptNum : function (t_receiptNum){
		this.receiptNum = t_receiptNum;
	},
	getInstallmentId : function(){
		return this.installmentId;
	},
	setInstallmentId: function (t_installmentId){
		this.installmentId = t_installmentId;
	},
	getMissedInstallmentIdArray : function(){
		return this.missedInstallmentIdArray;
	},
	setMissedInstallmentIdArray : function (t_missedInstallmentIdArray){
		this.missedInstallmentIdArray = t_missedInstallmentIdArray;
	},
	getVoucherNumber : function(){
		return this.voucherNumber;
	},
	setVoucherNumber : function (t_voucherNumber){
		this.voucherNumber = t_voucherNumber;
	},
	clearAll: function() {
		this.setAccountId("");
		this.setAccountTypeId("");
		this.setGlobalAccountNum("");
		this.setRetrieveType("");
		this.setIsDisbursal("");
		this.setAmount("");
		this.setTransferPaymentTypeId("");
		this.setClientPaymentDetails(new Array());
		this.setRelaxMismatchValidationCheck("");
		this.setTransactionDate("");
		this.setPaymentDetails("");
		this.setOfficeId("");
		this.setLastPaymentDate("");
		this.setCurrentDate("");
		this.setDisbursementDate("");
		this.setFinancialYearEndDate("");
		this.setGlCodes(new Array());
		this.setGlCodeId("");
		this.setReceiptNum("");
		this.setReceiptDate("");
        this.setReceiptDateStr("");
		this.setAccountForTransfer("");
        this.setPaymentTypeId("");
        this.setReceiptId("");
        this.setInstallmentId("");
        this.setMissedInstallmentIdArray(new Array());
        this.setPartialPaidAmount("");
        this.setTransactionDateStr("");
        this.setVoucherNumber("");
        this.setOfficeId("");
	}

}