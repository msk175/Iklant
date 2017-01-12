module.exports = loandisburse;

var customerId;
var productId;
var amount;
var individualTracked;
var clientGlobalId = new Array();
var clientAmount = new Array();
var clientSelectForGroup = new Array();

var approvalDate;
var approvalDateStr;
var disbursementDate; 
var disbursementDateStr;

var disbursalGLCode;
var repaymentRecursEvery;
var repaymentDayOfWeek;
var repaymentDayOfMonth;
var monthly;
var weekly;

var graceDuration;

var selectedFeeId = new Array();
var selectedFeeAmount = new Array();

var interestRate;
var minAllowedInterestRate;
var maxAllowedInterestRate;

var numberOfInstallments; 
var minNumberOfInstallments;
var maxNumberOfInstallments;

var minAllowedAmount;
var maxAllowedAmount;

var glimApplicable;
var clientInsured = new Array();
var clientLoanPurposeId = new Array();
var locale;
var monthlyDayOfMonthOptionSelected;
var repaymentScheduleIndependentOfCustomerMeeting;
var digitsBeforeDecimalForInterest;
var digitsAfterDecimalForInterest;
var digitsBeforeDecimalForMonetaryAmounts;
var digitsAfterDecimalForMonetaryAmounts;
var voucherNumber;
var meetingTime;

function loandisburse() {	
   //this.clearAll();
}

loandisburse.prototype = {
	getCustomerId : function() {
		return this.customerId;
	},
	setCustomerId : function(t_customerId) {
		this.customerId = t_customerId;
	},
	getProductId : function() {
		return this.productId;
	},
	setProductId : function(t_productId) {
		this.productId = t_productId;
	},
	getAmount : function() {
		return this.amount;
	},
	setAmount : function(t_amount) {
		this.amount = t_amount;
	},
	isIndividualTracked : function() {
		return this.individualTracked;
	},
	setIndividualTracked : function(t_individualTracked) {
		this.individualTracked = t_individualTracked;
	},

	getClientGlobalId : function() {
		return this.clientGlobalId;
	},
	setClientGlobalId : function(t_clientGlobalId) {
		this.clientGlobalId = t_clientGlobalId;
	},
	getClientAmount : function() {
		return this.clientAmount;
	},
	setClientAmount : function(t_clientAmount) {
		this.clientAmount = t_clientAmount;
	},
	getClientSelectForGroup : function() {
		return this.clientSelectForGroup;
	},
	setClientSelectForGroup : function(t_clientSelectForGroup) {
		this.clientSelectForGroup = t_clientSelectForGroup;
	},
	getApprovalDate : function() {
		return this.approvalDate;
	},
	setApprovalDate : function(t_approvalDate) {
		this.approvalDate = t_approvalDate;
	},
	getApprovalDateStr : function() {
		return this.approvalDateStr;
	},
	setApprovalDateStr : function(t_approvalDateStr) {
		this.approvalDateStr = t_approvalDateStr;
	},
	getDisbursementDate : function() {
		return this.disbursementDate;
	},
	setDisbursementDate : function(t_disbursementDate) {
		this.disbursementDate = t_disbursementDate;
	},
	getDisbursementDateStr : function() {
		return this.disbursementDateStr;
	},
	setDisbursementDateStr : function(t_disbursementDateStr) {
		this.disbursementDateStr = t_disbursementDateStr;
	},
	getDisbursalGLCode : function() {
		return this.disbursalGLCode;
	},
	setDisbursalGLCode : function(t_disbursalGLCode) {
		this.disbursalGLCode = t_disbursalGLCode;
	},
	
	getRepaymentRecursEvery : function() {
		return this.repaymentRecursEvery;
	},
	setRepaymentRecursEvery : function(t_repaymentRecursEvery) {
		this.repaymentRecursEvery = t_repaymentRecursEvery;
	},
	getRepaymentDayOfWeek : function() {
		return this.repaymentDayOfWeek;
	},
	setRepaymentDayOfWeek : function(t_repaymentDayOfWeek) {
		this.repaymentDayOfWeek = t_repaymentDayOfWeek;
	},
	getRepaymentDayOfMonth : function() {
		return this.repaymentDayOfMonth;
	},
	setRepaymentDayOfMonth : function(t_repaymentDayOfMonth) {
		this.repaymentDayOfMonth = t_repaymentDayOfMonth;
	},
	
	getMonthly : function() {
		return this.monthly;
	},
	setMonthly : function(t_monthly) {
		this.monthly = t_monthly;
	},
	
	getWeekly : function() {
		return this.weekly;
	},
	setWeekly : function(t_weekly) {
		this.weekly = t_weekly;
	},
	getGraceDuration : function() {
		return this.graceDuration;
	},
	setGraceDuration : function(t_graceDuration) {
		this.graceDuration = t_graceDuration;
	},

	getSelectedFeeId : function() {
		return this.selectedFeeId;
	},
	setSelectedFeeId : function(t_selectedFeeId) {
		this.selectedFeeId = t_selectedFeeId;
	},
	
	getSelectedFeeAmount : function() {
		return this.selectedFeeAmount;
	},
	setSelectedFeeAmount : function(t_selectedFeeAmount) {
		this.selectedFeeAmount = t_selectedFeeAmount;
	},
	
    getMinAllowedInterestRate : function() {
		return this.minAllowedInterestRate;
	},
	setMinAllowedInterestRate : function(t_minAllowedInterestRate) {
		this.minAllowedInterestRate = t_minAllowedInterestRate;
	},
	
	getMaxAllowedInterestRate : function() {
		return this.maxAllowedInterestRate;
	},
	setMaxAllowedInterestRate : function(t_maxAllowedInterestRate) {
		this.maxAllowedInterestRate = t_maxAllowedInterestRate;
	},
	
	getNumberOfInstallmentse : function() {
		return this.numberOfInstallments;
	},
	setNumberOfInstallments : function(t_numberOfInstallments) {
		this.numberOfInstallments = t_numberOfInstallments;
	},

	getMinNumberOfInstallments : function() {
		return this.minNumberOfInstallments;
	},
	setMinNumberOfInstallments : function(t_minNumberOfInstallments) {
		this.minNumberOfInstallments = t_minNumberOfInstallments;
	},
	
	getMaxNumberOfInstallments : function() {
		return this.maxNumberOfInstallments;
	},
	setMaxNumberOfInstallments : function(t_maxNumberOfInstallments) {
		this.maxNumberOfInstallments = t_maxNumberOfInstallments;
	},
	getInterestRate : function() {
		return this.interestRate;
	},
	setInterestRate : function(t_interestRate) {
		this.interestRate = t_interestRate;
	},
	getMinAllowedInterestRate : function() {
		return this.minAllowedInterestRate;
	},
	setMinAllowedInterestRate : function(t_minAllowedInterestRate) {
		this.minAllowedInterestRate = t_minAllowedInterestRate;
	},
	
	getMaxAllowedInterestRate : function() {
		return this.maxAllowedInterestRate;
	},
	setMaxAllowedInterestRate : function(t_maxAllowedInterestRate) {
		this.maxAllowedInterestRate = t_maxAllowedInterestRate;
	},
	
	getNumberOfInstallmentse : function() {
		return this.numberOfInstallments;
	},
	setNumberOfInstallments : function(t_numberOfInstallments) {
		this.numberOfInstallments = t_numberOfInstallments;
	},

	getMinNumberOfInstallments : function() {
		return this.minNumberOfInstallments;
	},
	setMinNumberOfInstallments : function(t_minNumberOfInstallments) {
		this.minNumberOfInstallments = t_minNumberOfInstallments;
	},
	
	getMaxNumberOfInstallments : function() {
		return this.maxNumberOfInstallments;
	},
	setMaxNumberOfInstallments : function(t_maxNumberOfInstallments) {
		this.maxNumberOfInstallments = t_maxNumberOfInstallments;
	},
	getMinAllowedAmount : function() {
		return this.minAllowedAmount;
	},
	setMinAllowedAmount : function(t_minAllowedAmount) {
		this.minAllowedAmount = t_minAllowedAmount;
	},
	getMaxAllowedAmount : function() {
		return this.maxAllowedAmount;
	},
	setMaxAllowedAmount : function(t_maxAllowedAmount) {
		this.maxAllowedAmount = t_maxAllowedAmount;
	},
	
	getGlimApplicable : function() {
		return this.glimApplicable;
	},
	setGlimApplicable : function(t_glimApplicable) {
		this.glimApplicable = t_glimApplicable;
	},
	getClientInsured : function() {
		return this.clientInsured;
	},
	setClientInsured : function(t_clientInsured) {
		this.clientInsured = t_clientInsured;
	},
	getClientLoanPurposeId : function() {
		return this.clientLoanPurposeId;
	},
	setClientLoanPurposeId : function(t_clientLoanPurposeId) {
		this.clientLoanPurposeId = t_clientLoanPurposeId;
	},
	getLocale : function() {
		return this.locale;
	},
	setLocale : function(t_locale) {
		this.locale = t_locale;
	},
	getMonthlyDayOfMonthOptionSelected : function() {
		return this.monthlyDayOfMonthOptionSelected;
	},
	setMonthlyDayOfMonthOptionSelected : function(t_monthlyDayOfMonthOptionSelected) {
		this.monthlyDayOfMonthOptionSelected = t_monthlyDayOfMonthOptionSelected;
	},
	geRrepaymentScheduleIndependentOfCustomerMeeting : function() {
		return this.repaymentScheduleIndependentOfCustomerMeeting;
	},
	setRepaymentScheduleIndependentOfCustomerMeeting : function(t_repaymentScheduleIndependentOfCustomerMeeting) {
		this.repaymentScheduleIndependentOfCustomerMeeting = t_repaymentScheduleIndependentOfCustomerMeeting;
	},
	getDigitsBeforeDecimalForInterest : function() {
		return this.digitsBeforeDecimalForInterest;
	},
	setDigitsBeforeDecimalForInterest : function(t_digitsBeforeDecimalForInterest) {
		this.digitsBeforeDecimalForInterest = t_digitsBeforeDecimalForInterest;
	},
	getDigitsAfterDecimalForInterest : function() {
		return this.digitsAfterDecimalForInterest;
	},
	setDigitsAfterDecimalForInterest : function(t_digitsAfterDecimalForInterest) {
		this.digitsAfterDecimalForInterest = t_digitsAfterDecimalForInterest;
	},
	getDigitsBeforeDecimalForMonetaryAmounts : function() {
		return this.digitsBeforeDecimalForMonetaryAmounts;
	},
	setDigitsBeforeDecimalForMonetaryAmounts : function(t_digitsBeforeDecimalForMonetaryAmounts) {
		this.digitsBeforeDecimalForMonetaryAmounts = t_digitsBeforeDecimalForMonetaryAmounts;
	},
	getDigitsAfterDecimalForMonetaryAmounts : function() {
		return this.digitsAfterDecimalForMonetaryAmounts;
	},
	setDigitsAfterDecimalForMonetaryAmounts : function(t_digitsAfterDecimalForMonetaryAmounts) {
		this.digitsAfterDecimalForMonetaryAmounts = t_digitsAfterDecimalForMonetaryAmounts;
	},
	getVoucherNumber : function(){
		return this.voucherNumber;
	},
	setVoucherNumber : function (t_voucherNumber){
		this.voucherNumber = t_voucherNumber;
	},
	getMeetingTime : function(){
		return this.meetingTime;
	},
	setMeetingTime : function (t_meetingTime){
		this.meetingTime = t_meetingTime;
	},
	clearAll : function(){
        this.setCustomerId("");
        this.setProductId("");
        this.setAmount("");
        this.setIndividualTracked("");
        this.setClientGlobalId(new Array());
        this.setClientAmount(new Array());
        this.setClientSelectForGroup(new Array());
        this.setApprovalDate("");
        this.setApprovalDateStr("");
        this.setDisbursementDate("");
        this.setDisbursementDateStr("");
        this.setDisbursalGLCode("");
        this.setRepaymentRecursEvery("");
        this.setRepaymentDayOfWeek("");
        this.setRepaymentDayOfMonth("");
        this.setMonthly("");
        this.setGraceDuration("");
        this.setSelectedFeeId(new Array());
        this.setSelectedFeeAmount(new Array());
        this.setMinAllowedInterestRate("");
        this.setMaxAllowedInterestRate("");
        this.setNumberOfInstallments("");
        this.setMinNumberOfInstallments("");
        this.setMaxNumberOfInstallments("");
        this.setMinAllowedAmount("");
        this.setMaxAllowedAmount("");
        this.setGlimApplicable("");
        this.setClientInsured(new Array());
        this.setClientLoanPurposeId(new Array());
        this.setLocale("");
        this.setMonthlyDayOfMonthOptionSelected("");
        this.setRepaymentScheduleIndependentOfCustomerMeeting("");
        this.setDigitsBeforeDecimalForInterest("");
        this.setDigitsAfterDecimalForInterest("");
        this.setDigitsBeforeDecimalForMonetaryAmounts("");
        this.setDigitsAfterDecimalForMonetaryAmounts("");
        this.setVoucherNumber("");
        this.setMeetingTime("");
	}
};