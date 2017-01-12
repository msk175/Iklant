module.exports = reverseLoanHolder;

/*var earlyRepaymentMoney;
var waivedRepaymentMoney;
var waiverInterest;
var savingsAccountsForTransfer;
*/
var customerName;
var loanOfficerName;
var disbursalAmount;
var disbursalDate;
var noOfPayments;
var amountPaid;
var paymentDate = new Array();
var paymentAmount = new Array();
var notes;
var globalAccNumber;

function reverseLoanHolder() {	
     //this.clearAll();
}

reverseLoanHolder.prototype = {
	
	getCustomerName : function() {
		return this.customerName;
	},
	setCustomerName : function(t_customerName) {
		this.customerName = t_customerName;
	},	
	getLoanOfficerName : function() {
		return this.loanOfficerName;
	},
	setLoanOfficerName : function(t_loanOfficerName) {
		this.loanOfficerName = t_loanOfficerName;
	},
	getDisbursalAmount : function() {
		return this.disbursalAmount;
	},
	setDisbursalAmount : function(t_disbursalAmount) {
		this.disbursalAmount = t_disbursalAmount;
	},
	getDisbursalDate : function() {
		return this.disbursalDate;
	},
	setDisbursalDate : function(t_disbursalDate) {
		this.disbursalDate = t_disbursalDate;
	},
	getNoOfPayments : function() {
		return this.noOfPayments;
	},
	setNoOfPayments : function(t_noOfPayments) {
		this.noOfPayments = t_noOfPayments;
	},
	getAmountPaid : function() {
		return this.amountPaid;
	},
	setAmountPaid : function(t_amountPaid) {
		this.amountPaid = t_amountPaid;
	},
	getPaymentDate : function() {
		return this.paymentDate;
	},
	setPaymentDate : function(t_paymentDate) {
		this.paymentDate = t_paymentDate;
	},
	getPaymentAmount : function() {
		return this.paymentAmount;
	},
	setPaymentAmount : function(t_paymentAmount) {
		this.paymentAmount = t_paymentAmount;
	},
	getNotes : function() {
		return this.notes;
	},
	setNotes : function(t_notes) {
		this.notes = t_notes;
	},
	getGlobalAccNumber : function() {
		return this.globalAccNumber;
	},
	setGlobalAccNumber : function(t_globalAccNumber) {
		this.globalAccNumber = t_globalAccNumber;
	},
	
	
	/*getEarlyRepaymentMoney : function() {
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
	getWaiverInterest : function() {
		return this.waiverInterest;
	},
	setWaiverInterest : function(t_waiverInterest) {
		this.waiverInterest = t_waiverInterest;
	},
	getsavingsAccountsForTransfer : function() {
		return this.savingsAccountsForTransfer;
	},
	setsavingsAccountsForTransfer : function(t_savingsAccountsForTransfer) {
		this.savingsAccountsForTransfer = t_savingsAccountsForTransfer;
	},*/
	clearAll : function(){
        this.setCustomerName("");
        this.setLoanOfficerName("");
        this.setDisbursalAmount("");
        this.setDisbursalDate("");
        this.setNoOfPayments("");
        this.setAmountPaid("");
        this.setPaymentDate(new Array());
        this.setPaymentAmount(new Array());
        this.setNotes("");
        this.setGlobalAccNumber("");
	}


};