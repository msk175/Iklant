module.exports = loanAccountInformation;

var globalAccountNum = new Array();
var prdOfferingName =  new Array();
var accountStateId  =  new Array();
var accountStateName  =  new Array();
var outstandingBalance  =  new Array();
var totalAmountDue  =  new Array();
var accountId  =  new Array();

function loanAccountInformation() {	
    // this.clearAll();
}

loanAccountInformation.prototype = {
	getGlobalAccountNum: function(){
		return this.globalAccountNum;
	},
	
	setGlobalAccountNum: function (t_globalAccountNum){
		this.globalAccountNum = t_globalAccountNum;
	},
	getAccountId : function(){
		return this.accountId;
	},
	setAccountId : function (t_accountId){
		this.accountId = t_accountId;
	},
    getPrdOfferingName: function(){
		return this.prdOfferingName;
	},
	
	setPrdOfferingName: function (t_prdOfferingName){
		this.prdOfferingName = t_prdOfferingName;
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
	
    getOutstandingBalance: function(){
		return this.outstandingBalance;
	},
	
	setOutstandingBalance: function (t_outstandingBalance){
		this.outstandingBalance = t_outstandingBalance;
	},
    
	getTotalAmountDue: function(){
		return this.totalAmountDue;
	},
	
	setTotalAmountDue: function (t_totalAmountDue){
		this.totalAmountDue = t_totalAmountDue;
	},
	
	clearAll: function() {
		this.setGlobalAccountNum(new Array());
		this.setPrdOfferingName(new Array());
		this.setAccountStateId(new Array());
		this.setAccountStateName(new Array());
		this.setOutstandingBalance(new Array());
		this.setTotalAmountDue(new Array());
        this.setAccountId(new Array());
	}
     
}