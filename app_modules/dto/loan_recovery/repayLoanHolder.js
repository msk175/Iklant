module.exports = repayLoanHolder;

var accountId;
var amount;
var dateOfPayment;
var paymentTypeId;
var waiverInterest = true;
var waiverInterestSelected;
var lastPaymentDate;
var transferPaymentTypeId;
var accountForTransfer;
var printReceipt;
var truePrintReceipt = false;
var officeId;
var paymentGLCode;
var financialYearEndDate;
var glcodeList;
var repayLoanDto;
var earlyRepaymentMoney;
var waivedRepaymentMoney;
var disbursementDate;
var receiptNumber;
var receiptDate;
var voucherNumberIfBank;
var voucherNumberIfCash;
var voucherNumber;
var waivedInterestAmount;

var clientGlobalAccountNumberList;
var clientNameList;
var checked;
function repayLoanHolder() {	
   // this.clearAll();
}

repayLoanHolder.prototype = {

    getWaivedInterestAmount : function() {
        return this.waivedInterestAmount;
    },
    setWaivedInterestAmount : function(t_waivedInterestAmount) {
        this.waivedInterestAmount = t_waivedInterestAmount;
    },

    getChecked : function() {
        return this.checked;
    },
    setChecked : function(t_checked) {
        this.checked = t_checked;
    },
    getClientGlobalAccountNumberList : function() {
        return this.clientGlobalAccountNumberList;
    },
    setClientGlobalAccountNumberList : function(t_clientGlobalAccountNumberList) {
        this.clientGlobalAccountNumberList = t_clientGlobalAccountNumberList;
    },
    getClientNameList : function() {
        return this.clientNameList;
    },
    setClientNameList : function(t_clientNameList) {
        this.clientNameList = t_clientNameList;
    },
	getAccountId : function() {
		return this.accountId;
	},
	setAccountId : function(t_accountId) {
		this.accountId = t_accountId;
	},
	getAmount : function() {
		return this.amount;
	},
	setAmount : function(t_amount) {
		this.amount = t_amount;
	},
	getDateOfPayment : function() {
		return this.dateOfPayment;
	},
	setDateOfPayment : function(t_dateOfPayment) {
		this.dateOfPayment = t_dateOfPayment;
	},
	getPaymentTypeId : function() {
		return this.paymentTypeId;
	},
	setPaymentTypeId : function(t_paymentTypeId) {
		this.paymentTypeId = t_paymentTypeId;
	},
	getWaiverInterest : function() {
		return this.waiverInterest;
	},
	setWaiverInterest : function(t_waiverInterest) {
		this.waiverInterest = t_waiverInterest;
	},
	getWaiverInterestSelected : function() {
		return this.waiverInterestSelected;
	},
	setWaiverInterestSelected : function(t_waiverInterestSelected) {
		this.waiverInterestSelected = t_waiverInterestSelected;
	},
	getLastPaymentDate : function() {
		return this.lastPaymentDate;
	},
	setLastPaymentDate : function(t_lastPaymentDate) {
		this.lastPaymentDate = t_lastPaymentDate;
	},
	getTransferPaymentTypeId : function() {
		return this.transferPaymentTypeId;
	},
	setTransferPaymentTypeId : function(t_transferPaymentTypeId) {
		this.transferPaymentTypeId = t_transferPaymentTypeId;
	},
	getAccountForTransfer : function() {
		return this.accountForTransfer;
	},
	setAccountForTransfer : function(t_accountForTransfer) {
		this.accountForTransfer = t_accountForTransfer;
	},
	getPrintReceipt : function() {
		return this.printReceipt;
	}, 
	setPrintReceipt : function(t_printReceipt) {                       
		this.printReceipt = t_printReceipt;                           
	},                                                                
	getTruePrintReceipt : function() {                                
		return this.truePrintReceipt;                                 
	},
	setTruePrintReceipt : function(t_truePrintReceipt) {                
		this.truePrintReceipt = t_truePrintReceipt;                      
	},
	getOfficeId : function() {                                 
		return this.officeId;                                  
	},
	setOfficeId : function(t_officeId) {
		this.officeId = t_officeId;
	},
	getPaymentGLCode : function() {                                 
		return this.paymentGLCode;                                  
	},
	setPaymentGLCode : function(t_paymentGLCode) {
		this.paymentGLCode = t_paymentGLCode;
	},
	getFinancialYearEndDate : function() {                                 
		return this.financialYearEndDate;                                  
	},
	setFinancialYearEndDate : function(t_financialYearEndDate) {
		this.financialYearEndDate = t_financialYearEndDate;
	},
	getGlcodeList : function() {                                 
		return this.glcodeList;                                  
	},
	setGlcodeList : function(t_glcodeList) {
		this.glcodeList = t_glcodeList;
	},
	getRepayLoanDto : function() {                                 
		return this.repayLoanDto;                                  
	},
	setRepayLoanDto : function(t_repayLoanDto) {
		this.repayLoanDto = t_repayLoanDto;
	},
	
	getEarlyRepaymentMoney : function() {
		return this.earlyRepaymentMoney;
	},
	setEarlyRepaymentMoney : function(t_earlyRepaymentMoney) {
		this.earlyRepaymentMoney = t_earlyRepaymentMoney;
	},
	getWaivedRepaymentMoney : function() {
		return this.waivedRepaymentMoney;
	},
	setWaivedRepaymentMoney : function(t_waivedRepaymentMoney) {
		this.waivedRepaymentMoney = t_waivedRepaymentMoney;
	},
	getDisbursementDate : function() {
		return this.disbursementDate;
	},
	setDisbursementDate : function(t_disbursementDate) {
		this.disbursementDate = t_disbursementDate;
	},
	getReceiptNumber : function() {
		return this.receiptNumber;
	},
	setReceiptNumber : function(t_receiptNumber) {
		this.receiptNumber = t_receiptNumber;
	},
	getReceiptDate : function() {
		return this.receiptDate;
	},
	setReceiptDate : function(t_receiptDate) {
		this.receiptDate = t_receiptDate;
	},
	getVoucherNumberIfBank: function(){
		return this.voucherNumberIfBank;
	},
	
	setVoucherNumberIfBank: function (t_voucherNumberIfBank){
		this.voucherNumberIfBank = t_voucherNumberIfBank;
	},
	
	getVoucherNumberIfCash: function(){
		return this.voucherNumberIfCash;
	},
	
	setVoucherNumberIfCash: function (t_voucherNumberIfCash){
		this.voucherNumberIfCash = t_voucherNumberIfCash;
	},
	
	getVoucherNumber : function(){
		return this.voucherNumber;
	},
	setVoucherNumber : function (t_voucherNumber){
		this.voucherNumber = t_voucherNumber;
	},
	clearAll : function(){
        this.setAccountId("");
        this.setAmount("");
        this.setDateOfPayment("");
        this.setPaymentTypeId("");
        this.setWaiverInterest(true);
        this.setWaiverInterestSelected("");
        this.setLastPaymentDate("");
        this.setTransferPaymentTypeId("");
        this.setAccountForTransfer("");
        this.setPrintReceipt("");
        this.setTruePrintReceipt(false);
        this.setOfficeId("");
        this.setPaymentGLCode("");
        this.setFinancialYearEndDate("");
        this.setGlcodeList("");
        this.setRepayLoanDto("");
        this.setEarlyRepaymentMoney("");
        this.setWaivedRepaymentMoney("");
        this.setDisbursementDate("");
        this.setReceiptNumber("");
        this.setReceiptDate("");
        this.setVoucherNumberIfBank("");
        this.setVoucherNumberIfCash("");
        this.setVoucherNumber("");
	}
};