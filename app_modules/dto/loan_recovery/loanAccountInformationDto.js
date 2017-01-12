module.exports = loanAccountInformationDto;

function loanAccountInformationDto() {	
  // this.clearAll();
}

var accountId ;
var globalAccountNum;
var accountStateId;
var accountStateName;
var customerName;
var globalCustNum;
var customerId;
var prdOfferingName;
var disbursementDate;
var accountTypeId;
var officeName;
var officeId;
var personnelId;
var nextMeetingDate;
var totalAmountDue;
var totalAmountInArrears;
var individualTracked;
var voucherNumberIfBank;
var voucherNumberIfCash;


loanAccountInformationDto.prototype = {

	getAccountId: function(){
		return this.accountId;
	},
	
	setAccountId: function (t_accountId){
		this.accountId = t_accountId;
	},

	getGlobalAccountNum: function(){
		return this.globalAccountNum;
	},
	
	setGlobalAccountNum: function (t_globalAccountNum){
		this.globalAccountNum = t_globalAccountNum;
	},

	getAccountStateId: function(){
		return this.accountStateId;
	},
	
	setAccountStateId: function (t_accountStateId){
		this.accountStateId = t_accountStateId;
	},

	getAccountStateName: function(){
		return this.accountStateName;
	},
	
	setAccountStateName: function (t_accountStateName){
		this.accountStateName = t_accountStateName;
	},

	getCustomerName: function(){
		return this.customerName;
	},
	
	setCustomerName: function (t_customerName){
		this.customerName = t_customerName;
	},

	getGlobalCustNum: function(){
		return this.globalCustNum;
	},
	
	setGlobalCustNum: function (t_globalCustNum){
		this.globalCustNum = t_globalCustNum;
	},

	getCustomerId: function(){
		return this.customerId;
	},
	
	setCustomerId: function (t_customerId){
		this.customerId = t_customerId;
	},

	getPrdOfferingName: function(){
		return this.prdOfferingName;
	},
	
	setPrdOfferingName: function (t_prdOfferingName){
		this.prdOfferingName = t_prdOfferingName;
	},

	getDisbursementDate: function(){
		return this.disbursementDate;
	},
	
	setDisbursementDate: function (t_disbursementDate){
		this.disbursementDate = t_disbursementDate;
	},

	getAccountTypeId: function(){
		return this.accountTypeId;
	},
	
	setAccountTypeId: function (t_accountTypeId){
		this.accountTypeId = t_accountTypeId;
	},
	
	getOfficeName: function(){
		return this.officeName;
	},
	
	setOfficeName: function (t_officeName){
		this.officeName = t_officeName;
	},
	
	getOfficeId: function(){
		return this.officeId;
	},
	
	setOfficeId: function (t_officeId){
		this.officeId = t_officeId;
	},

	getPersonnelId: function(){
		return this.personnelId;
	},
	
	setPersonnelId: function (t_personnelId){
		this.personnelId = t_personnelId;
	},

	getNextMeetingDate: function(){
		return this.nextMeetingDate;
	},
	
	setNextMeetingDate: function (t_nextMeetingDate){
		this.nextMeetingDate = t_nextMeetingDate;
	},

	getTotalAmountDue: function(){
		return this.totalAmountDue;
	},
	
	setTotalAmountDue: function (t_totalAmountDue){
		this.totalAmountDue = t_totalAmountDue;
	},

	getTotalAmountInArrears: function(){
		return this.totalAmountInArrears;
	},
	
	setTotalAmountInArrears: function (t_totalAmountInArrears){
		this.totalAmountInArrears = t_totalAmountInArrears;
	},
	
	getIndividualTracked: function(){
		return this.individualTracked;
	},
	
	setIndividualTracked: function (t_individualTracked){
		this.individualTracked = t_individualTracked;
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

	clearAll: function() {
		this.setAccountId("");
		this.setGlobalAccountNum("");
		this.setAccountStateId("");
		this.setAccountStateName("");
		this.setCustomerName("");
		this.setGlobalCustNum("");
		this.setCustomerId("");
		this.setPrdOfferingName("");
		this.setDisbursementDate("");
		this.setAccountTypeId("");
		this.setOfficeName("");
		this.setOfficeId("");
		this.setPersonnelId("");
		this.setNextMeetingDate("");
		this.setTotalAmountDue("");
		this.setTotalAmountInArrears("");
		this.setIndividualTracked("");
        this.setVoucherNumberIfBank("");
        this.setVoucherNumberIfCash("");
	}
}