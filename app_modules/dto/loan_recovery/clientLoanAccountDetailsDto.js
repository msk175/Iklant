module.exports = clientLoanAccountDetailsDto;

function clientLoanAccountDetailsDto() {	
  //this.clearAll();
}

var accountId = new Array();
var clientId = new Array();
var clientName = new Array();
var govermentId = new Array();
var loanPurpose = new Array();
var loanAmount = new Array();
var insured = new Array();
var individualTracked = new Array();
var businessActivity = new Array();
var businessActivityName = new Array();
var loanAccountId = new Array();
var loanGlobalAccountNum = new Array();
var parentLoanGlobalAccountNum = new Array();
var parentLoanAccountId = new Array();
var paidInstallment = new Array();
var dueInstallment = new Array();
var futureInstallment = new Array();
var runningBalance = new Array();

clientLoanAccountDetailsDto.prototype = {

	getAccountId: function(){
		return this.accountId;
	},
	
	setAccountId: function (t_accountId){
		this.accountId = t_accountId;
	},

	getClientId: function(){
		return this.clientId;
	},
	
	setClientId: function (t_clientId){
		this.clientId = t_clientId;
	},

	getClientName: function(){
		return this.clientName;
	},
	
	setClientName: function (t_clientName){
		this.clientName = t_clientName;
	},

	getGovermentId: function(){
		return this.govermentId;
	},
	
	setGovermentId: function (t_govermentId){
		this.govermentId = t_govermentId;
	},

	getLoanPurpose: function(){
		return this.loanPurpose;
	},
	
	setLoanPurpose: function (t_loanPurpose){
		this.loanPurpose = t_loanPurpose;
	},

	getLoanAmount: function(){
		return this.loanAmount;
	},
	
	setLoanAmount: function (t_loanAmount){
		this.loanAmount = t_loanAmount;
	},

	getInsured: function(){
		return this.insured;
	},
	
	setInsured: function (t_insured){
		this.insured = t_insured;
	},

	getIndividualTracked: function(){
		return this.individualTracked;
	},
	
	setIndividualTracked: function (t_individualTracked){
		this.individualTracked = t_individualTracked;
	},

	getBusinessActivity: function(){
		return this.businessActivity;
	},
	
	setBusinessActivity: function (t_businessActivity){
		this.businessActivity = t_businessActivity;
	},

	getBusinessActivityName: function(){
		return this.businessActivityName;
	},
	
	setBusinessActivityName: function (t_businessActivityName){
		this.businessActivityName = t_businessActivityName;
	},

	getLoanAccountId: function(){
		return this.loanAccountId;
	},
	
	setLoanAccountId: function (t_loanAccountId){
		this.loanAccountId = t_loanAccountId;
	},

	getLoanGlobalAccountNum: function(){
		return this.loanGlobalAccountNum;
	},
	
	setLoanGlobalAccountNum: function (t_loanGlobalAccountNum){
		this.loanGlobalAccountNum = t_loanGlobalAccountNum;
	},

	getParentLoanGlobalAccountNum: function(){
		return this.parentLoanGlobalAccountNum;
	},
	
	setParentLoanGlobalAccountNum: function (t_parentLoanGlobalAccountNum){
		this.parentLoanGlobalAccountNum = t_parentLoanGlobalAccountNum;
	},

	getParentLoanAccountId: function(){
		return this.parentLoanAccountId;
	},
	
	setParentLoanAccountId: function (t_parentLoanAccountId){
		this.parentLoanAccountId = t_parentLoanAccountId;
	},
	
	getPaidInstallment: function(){
		return this.paidInstallment;
	},
	
	setPaidInstallment: function (t_paidInstallment){
		this.paidInstallment = t_paidInstallment;
	},
	
	getDueInstallment: function(){
		return this.dueInstallment;
	},
	
	setDueInstallment: function (t_dueInstallment){
		this.dueInstallment = t_dueInstallment;
	},

	getFutureInstallment: function(){
		return this.futureInstallment;
	},
	
	setFutureInstallment: function (t_futureInstallment){
		this.futureInstallment = t_futureInstallment;
	},

	getRunningBalance: function(){
		return this.runningBalance;
	},
	
	setRunningBalance: function (t_runningBalance){
		this.runningBalance = t_runningBalance;
	},

	clearAll: function() {
		this.setAccountId(new Array());
		this.setClientId(new Array());
		this.setClientName(new Array());
		this.setGovermentId(new Array());
		this.setLoanPurpose(new Array());
		this.setLoanAmount(new Array());
		this.setInsured(new Array());
		this.setIndividualTracked(new Array());
		this.setBusinessActivity(new Array());
		this.setBusinessActivityName(new Array());
		this.setLoanAccountId(new Array());
		this.setLoanGlobalAccountNum(new Array());
		this.setParentLoanGlobalAccountNum(new Array());
		this.setParentLoanAccountId(new Array());
		this.setPaidInstallment(new Array());
		this.setDueInstallment(new Array());
		this.setFutureInstallment(new Array());
		this.setRunningBalance(new Array());
	}	
}