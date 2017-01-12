module.exports = ExpenseTrackingHolder;

function ExpenseTrackingHolder() {	
   //this.clearAll();
}
var trxnDate;
var trxnId;
var trxnType;
var mainAccount;
var officeHierarchy;
var office;
var accountHead;
var amount;
var notes;
var chequeNo;
var chequeDate;
var bankName;
var bankBranch;
var financialYearStartDate;
var financialYearEndDate;
var offices = new Array();
var mainAccCodes = new Array();
var accHeadCodes = new Array();
var isValidateEndDate;
var allowedDecimals;
var trxnDateStr;
ExpenseTrackingHolder.prototype = {

	getTrxnDateStr: function(){
		return this.trxnDateStr;
	},
	
	setTrxnDateStr: function (t_trxnDateStr){
		this.trxnDateStr = t_trxnDateStr;
	},
	
	getTrxnDate: function(){
		return this.trxnDate;
	},
	
	setTrxnDate: function (t_trxnDate){
		this.trxnDate = t_trxnDate;
	},

	getTrxnId: function(){
		return this.trxnId;
	},
	
	setTrxnId: function (t_trxnId){
		this.trxnId = t_trxnId;
	},

	getTrxnType: function(){
		return this.trxnType;
	},
	
	setTrxnType: function (t_trxnType){
		this.trxnType = t_trxnType;
	},

	getMainAccount: function(){
		return this.mainAccount;
	},
	
	setMainAccount: function (t_mainAccount){
		this.mainAccount = t_mainAccount;
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

	getAccountHead: function(){
		return this.accountHead;
	},
	
	setAccountHead: function (t_accountHead){
		this.accountHead = t_accountHead;
	},

	getAmount: function(){
		return this.amount;
	},
	
	setAmount: function (t_amount){
		this.amount = t_amount;
	},

	getNotes: function(){
		return this.notes;
	},
	
	setNotes: function (t_notes){
		this.notes = t_notes;
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

	getBankName: function(){
		return this.bankName;
	},
	
	setBankName: function (t_bankName){
		this.bankName = t_bankName;
	},

	getBankBranch: function(){
		return this.bankBranch;
	},
	
	setBankBranch: function (t_bankBranch){
		this.bankBranch = t_bankBranch;
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

	getMainAccCodes: function(){
		return this.mainAccCodes;
	},
	
	setMainAccCodes: function (t_mainAccCodes){
		this.mainAccCodes = t_mainAccCodes;
	},

	getAccHeadCodes: function(){
		return this.accHeadCodes;
	},
	
	setAccHeadCodes: function (t_accHeadCodes){
		this.accHeadCodes = t_accHeadCodes;
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
		this.setTrxnDate("");
		this.setTrxnId("");
		this.setTrxnType("");
		this.setMainAccount("");
		this.setOfficeHierarchy("");
		this.setOffice("");
		this.setAccountHead("");
		this.setAmount("");
		this.setNotes("");
		this.setChequeNo("");
		this.setChequeDate("");
		this.setBankName("");
		this.setBankBranch("");
		this.setFinancialYearStartDate("");
		this.setFinancialYearEndDate("");
		this.setOffices(new Array());
		this.setMainAccCodes(new Array());
		this.setAccHeadCodes(new Array());
		this.setValidateEndDate("");
		this.setAllowedDecimals("");
        this.setTrxnDateStr("");
	}
}