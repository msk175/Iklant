module.exports = JournalVoucherHolder;

function JournalVoucherHolder() {	
   //this.clearAll();
}

var voucherDate;
var voucherDateStr;
var voucherId;
var trxnType;
var debitAccountHead;
var officeHierarchy;
var office;
var creditAccountHead;
var amount;
var voucherNotes;
var financialYearStartDate;
var financialYearEndDate;
var offices = new Array;
var debitAccount = new Array();
var creditAccount = new Array();
var allowedDecimals;

JournalVoucherHolder.prototype = {
	getVoucherDateStr: function(){
		return this.voucherDateStr;
	},
	
	setVoucherDateStr: function (t_voucherDateStr){
		this.voucherDateStr = t_voucherDateStr;
	},
	getVoucherDate: function(){
		return this.voucherDate;
	},
	
	setVoucherDate: function (t_voucherDate){
		this.voucherDate = t_voucherDate;
	},

	getVoucherId: function(){
		return this.voucherId;
	},
	
	setVoucherId: function (t_voucherId){
		this.voucherId = t_voucherId;
	},

	getTrxnType: function(){
		return this.trxnType;
	},
	
	setTrxnType: function (t_trxnType){
		this.trxnType = t_trxnType;
	},

	getDebitAccountHead: function(){
		return this.debitAccountHead;
	},
	
	setDebitAccountHead: function (t_debitAccountHead){
		this.debitAccountHead = t_debitAccountHead;
	},

	getOfficeHierarchy: function(){
		return this.officeHierarchy;
	},
	
	setOfficeHierarchy: function (t_officeHierarchy){
		this.officeHierarchy = t_officeHierarchy;
	},

	getOffice: function(){
		return this.office;
	},
	
	setOffice: function (t_office){
		this.office = t_office;
	},

	getCreditAccountHead: function(){
		return this.creditAccountHead;
	},
	
	setCreditAccountHead: function (t_creditAccountHead){
		this.creditAccountHead = t_creditAccountHead;
	},

	getAmount: function(){
		return this.amount;
	},
	
	setAmount: function (t_amount){
		this.amount = t_amount;
	},

	getVoucherNotes: function(){
		return this.voucherNotes;
	},
	
	setVoucherNotes: function (t_voucherNotes){
		this.voucherNotes = t_voucherNotes;
	},

	getFinancialYearStartDate: function(){
		return this.financialYearStartDate;
	},
	
	setFinancialYearStartDate: function (t_financialYearStartDate){
		this.financialYearStartDate = t_financialYearStartDate;
	},

	getFinancialYearEndDate: function(){
		return this.financialYearEndDate;
	},
	
	setFinancialYearEndDate: function (t_financialYearEndDate){
		this.financialYearEndDate = t_financialYearEndDate;
	},

	getOffices: function(){
		return this.offices;
	},
	
	setOffices: function (t_offices){
		this.offices = t_offices;
	},

	getDebitAccount: function(){
		return this.debitAccount;
	},
	
	setDebitAccount: function (t_debitAccount){
		this.debitAccount = t_debitAccount;
	},

	getCreditAccount: function(){
		return this.creditAccount;
	},
	
	setCreditAccount: function (t_creditAccount){
		this.creditAccount = t_creditAccount;
	},
	
	getValidateEndDate: function(){
		return this.validateEndDate;
	},
	
	setValidateEndDate: function (t_validateEndDate){
		this.validateEndDate = t_validateEndDate;
	},
	
	getAllowedDecimals: function(){
		return this.allowedDecimals;
	},
	
	setAllowedDecimals: function (t_allowedDecimals){
		this.allowedDecimals = t_allowedDecimals;
	},
	clearAll: function() {
		this.setVoucherDate("");
        this.setVoucherDateStr("");
		this.setVoucherId("");
		this.setTrxnType("");
		this.setDebitAccountHead("");
		this.setOfficeHierarchy("");
		this.setOffice("");
		this.setCreditAccountHead("");
		this.setAmount("");
		this.setVoucherNotes("");
		this.setFinancialYearStartDate("");
		this.setFinancialYearEndDate("");
		this.setOffices(new Array());
		this.setDebitAccount(new Array());
		this.setCreditAccount(new Array());
		this.setValidateEndDate("");
		this.setAllowedDecimals("");
	}

}