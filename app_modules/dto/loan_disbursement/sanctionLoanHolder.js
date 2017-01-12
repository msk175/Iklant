module.exports = sanctionLoanHolder;

var customerId;
var productId;
var individualTracked;
var clientSelectForGroup = new Array();
var clientAmount = new Array();
var noOfActiveLoans = new Array();
var outstandingAmount = new Array();
var overdueAmount = new Array();
var approvalDate;
var disbursementDate;
var repaymentRecursEvery;
var repaymentDayOfWeek;
var repaymentDayOfMonth;
var monthly;
var weekly;
var graceDuration;
var glcodeId = new Array();
var glcode = new Array();
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

/*var recurrenceType;

var repaymentRecursEvery;

var repaymentDayOfWeek;
var repaymentDayOfMonth;

var repaymentWeekOfMonth;
var monthly;
var monthlyDayOfMonthOptionSelected;
var monthlyWeekOfMonthOptionSelected;*/

var interestRate;
var minAllowedInterestRate;
var maxAllowedInterestRate;
var numberOfInstallments; 
var minNumberOfInstallments;
var maxNumberOfInstallments;
var customerDetailDTO;
var minAmount;
var maxAmount;
var minMaxAmount;
var clientNameForGroup = new Array();
var sourceOfPaymentId = new Array();
var sourceOfPaymentName = new Array();
var feesId = new Array();
var feesName = new Array();
var isAMountOrRatio = new Array();
var amountOrRatio = new Array();
var todaysDate;
var voucherNumberIfBank;
var voucherNumberIfCash;

function sanctionLoanHolder() {	
    //this.clearAll();
}

sanctionLoanHolder.prototype = {

	getTodaysDate : function() {
		return this.todaysDate;
	},
	setTodaysDate : function(t_todaysDate) {
		this.todaysDate = t_todaysDate;
	},
	getCustomerId : function() {
		return this.customerId;
	},
	setCustomerId : function(t_customerId) {
		this.customerId = t_customerId;
	},
	isIndividualTracked : function() {
		return this.individualTracked;
	},
	setIndividualTracked : function(t_individualTracked) {
		this.individualTracked = t_individualTracked;
	},

	getClientSelectForGroup : function() {
		return this.clientSelectForGroup;
	},
	setClientSelectForGroup : function(t_clientSelectForGroup) {
		this.clientSelectForGroup = t_clientSelectForGroup;
	},
	getClientAmount : function() {
		return this.clientAmount;
	},
	setClientAmount : function(t_clientAmount) {
		this.clientAmount = t_clientAmount;
	},
	getNoOfActiveLoans : function() {
		return this.noOfActiveLoans;
	},
	setNoOfActiveLoans : function(t_noOfActiveLoans) {
		this.noOfActiveLoans = t_noOfActiveLoans;
	},
	getOutstandingAmount : function() {
		return this.outstandingAmount;
	},
	setOutstandingAmount : function(t_outstandingAmount) {
		this.outstandingAmount = t_outstandingAmount;
	},
	getOverdueAmount : function() {
		return this.overdueAmount;
	},
	setOverdueAmount : function(t_overdueAmount) {
		this.overdueAmount = t_overdueAmount;
	},	

	getFeesId : function() {
		return this.feesId;
	},
	setFeesId : function(t_feesId) {
		this.feesId = t_feesId;
	},
	getFeesName : function() {
		return this.feesName;
	},
	setFeesName : function(t_feesName) {
		this.feesName = t_feesName;
	},
	getIsAMountOrRatio : function() {
		return this.isAMountOrRatio;
	},
	setIsAMountOrRatio : function(t_isAMountOrRatio) {
		this.isAMountOrRatio = t_isAMountOrRatio;
	},
	getAmountOrRatio : function() {
		return this.amountOrRatio;
	},
	setAmountOrRatio : function(t_amount) {
		this.amountOrRatio = t_amount;
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
	getProductId : function() {
		return this.productId;
	},
	setProductId : function(t_productId) {
		this.productId = t_productId;
	},
	
	getMinMaxAmount : function() {
		return this.minMaxAmount;
	},
	setMinMaxAmount : function(t_minMaxAmount) {
		this.minMaxAmount = t_minMaxAmount;
	},
	getCustomerDetailDto : function() {
		return this.customerDetailDto;
	},
	setCustomerDetailDto : function(t_customerDetailDto) {
		this.customerDetailDto = t_customerDetailDto;
	},
	getApprovalDate : function() {
		return this.approvalDate;
	},
	setApprovalDate : function(t_approvalDate) {
		this.approvalDate = t_approvalDate;
	},
	getDisbursementDate : function() {
		return this.disbursementDate;
	},
	setDisbursementDate : function(t_disbursementDate) {
		this.disbursementDate = t_disbursementDate;
	},

	getPaymentTypeId : function() {
		return this.paymentTypeId;
	},
	setPaymentTypeId : function(t_paymentTypeId) {
		this.paymentTypeId = t_paymentTypeId;
	},
	getGraceDuration : function() {
		return this.graceDuration;
	},
	setGraceDuration : function(t_graceDuration) {
		this.graceDuration = t_graceDuration;
	},
	getClientNameForGroup : function() {
		return this.clientNameForGroup;
	},
	setClientNameForGroup : function(t_clientNameForGroup) {
		this.clientNameForGroup = t_clientNameForGroup;
	},
	
	getSourceOfPaymentId : function() {
		return this.sourceOfPaymentId;
	},
	setSourceOfPaymentId : function(t_sourceOfPaymentId) {
		this.sourceOfPaymentId = t_sourceOfPaymentId;
	},
	
	getSourceOfPaymentName : function() {
		return this.sourceOfPaymentName;
	},
	setSourceOfPaymentName : function(t_sourceOfPaymentName) {
		this.sourceOfPaymentName = t_sourceOfPaymentName;
	},
	
	getGlcodeId : function() {
		return this.glcodeId;
	},
	setGlcodeId : function(t_glcodeId) {
		this.glcodeId = t_glcodeId;
	},
	getGlcode : function() {
		return this.glcode;
	},
	setGlcode : function(t_glcode) {
		this.glcode = t_glcode;
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
	getMinAmount : function() {
		return this.minAmount;
	},
	setMinAmount : function(t_minAmount) {
		this.minAmount = t_minAmount;
	},
	getMaxAmount : function() {
		return this.maxAmount;
	},
	setMaxAmount : function(t_maxAmount) {
		this.maxAmount = t_maxAmount;
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
	
	clearAll : function(){
        this.setTodaysDate("");
        this.setCustomerId("");
        this.setIndividualTracked("");
        this.setClientSelectForGroup(new Array());
        this.setClientAmount(new Array());
        this.setNoOfActiveLoans(new Array());
        this.setOutstandingAmount(new Array());
        this.setOverdueAmount(new Array());
        this.setFeesId(new Array());
        this.setFeesName(new Array());
        this.setIsAMountOrRatio(new Array());
        this.setAmountOrRatio(new Array());
        this.setRepaymentRecursEvery("");
        this.setRepaymentDayOfWeek("");
        this.setRepaymentDayOfMonth("");
        this.setMonthly("");
        this.setWeekly("");
        this.setProductId("");
        this.setMinMaxAmount("");
        this.setCustomerDetailDto("");
        this.setApprovalDate("");
        this.setDisbursementDate("");
        this.setPaymentTypeId("");
        this.setGraceDuration("");
        this.setClientNameForGroup(new Array());
        this.setSourceOfPaymentId(new Array());
        this.setSourceOfPaymentName(new Array());
        this.setGlcodeId(new Array());
        this.setGlcode(new Array());
        this.setInterestRate("");
        this.setMinAllowedInterestRate("");
        this.setMaxAllowedInterestRate("");
        this.setNumberOfInstallments("");
        this.setMinNumberOfInstallments("");
        this.setMaxNumberOfInstallments("");
        this.setMinAmount("");
        this.setMaxAmount("");
        this.setGlimApplicable(new Array());
        this.setClientInsured(new Array());
        this.setClientLoanPurposeId(new Array());
        this.setLocale("");
        this.setMonthlyDayOfMonthOptionSelected("");
        this.setRepaymentScheduleIndependentOfCustomerMeeting("");
        this.setDigitsBeforeDecimalForInterest("");
        this.setDigitsAfterDecimalForInterest("");
        this.setDigitsBeforeDecimalForMonetaryAmounts("");
        this.setDigitsAfterDecimalForMonetaryAmounts("");
        this.setVoucherNumberIfBank("");
        this.setVoucherNumberIfCash("");
    }


};