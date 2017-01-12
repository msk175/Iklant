module.exports = LoanStatusHolder;

function LoanStatusHolder() {	
    //this.clearAll();
}

var financialYearEndDate;
var lastPaymentDate;
var transactionDate;
var accountId;
var notes;
var newStatusId;
var allowBackDatedApprovals;
var accountTypeId;
var currentStatusId;
var globalAccountNum;
var accountName;
var input;


LoanStatusHolder.prototype = {
	
	getFinancialYearEndDate: function(){
		return this.financialYearEndDate;
	},
	
	setFinancialYearEndDate: function (t_financialYearEndDate){
		this.financialYearEndDate = t_financialYearEndDate;
	},

	getLastPaymentDate: function(){
		return this.lastPaymentDate;
	},
	
	setLastPaymentDate: function (t_lastPaymentDate){
		this.lastPaymentDate = t_lastPaymentDate;
	},

	getTransactionDate: function(){
		return this.transactionDate;
	},
	
	setTransactionDate: function (t_transactionDate){
		this.transactionDate = t_transactionDate;
	},

	getAccountId: function(){
		return this.accountId;
	},
	
	setAccountId: function (t_accountId){
		this.accountId = t_accountId;
	},

	getNotes: function(){
		return this.notes;
	},
	
	setNotes: function (t_notes){
		this.notes = t_notes;
	},

	getNewStatusId: function(){
		return this.newStatusId;
	},
	
	setNewStatusId: function (t_newStatusId){
		this.newStatusId = t_newStatusId;
	},

	getAllowBackDatedApprovals: function(){
		return this.allowBackDatedApprovals;
	},
	
	setAllowBackDatedApprovals: function (t_allowBackDatedApprovals){
		this.allowBackDatedApprovals = t_allowBackDatedApprovals;
	},

	getAccountTypeId: function(){
		return this.accountTypeId;
	},
	
	setAccountTypeId: function (t_accountTypeId){
		this.accountTypeId = t_accountTypeId;
	},

	getCurrentStatusId: function(){
		return this.currentStatusId;
	},
	
	setCurrentStatusId: function (t_currentStatusId){
		this.currentStatusId = t_currentStatusId;
	},

	getGlobalAccountNum: function(){
		return this.globalAccountNum;
	},
	
	setGlobalAccountNum: function (t_globalAccountNum){
		this.globalAccountNum = t_globalAccountNum;
	},

	getAccountName: function(){
		return this.accountName;
	},
	
	setAccountName: function (t_accountName){
		this.accountName = t_accountName;
	},

	getInput: function(){
		return this.input;
	},
	
	setInput: function (t_input){
		this.input = t_input;
	},
	clearAll: function() {
		this.setFinancialYearEndDate("");
		this.setLastPaymentDate("");
		this.setTransactionDate("");
		this.setAccountId("");
		this.setNotes("");
		this.setNewStatusId("");
		this.setAllowBackDatedApprovals("");
		this.setAccountTypeId("");
		this.setCurrentStatusId("");
		this.setGlobalAccountNum("");
		this.setAccountName("");
		this.setInput("");
	}


}