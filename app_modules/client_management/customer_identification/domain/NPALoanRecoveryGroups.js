module.exports = NPALoanRecoveryGroups;

function NPALoanRecoveryGroups() {	
   //this.clearAll();
}
var accountId;
var customerId;
var globalAccountNum;
var groupName;
var glAddress;


NPALoanRecoveryGroups.prototype = {
	
	getAccountId: function(){
		return this.accountId;
	},
	
	setAccountId: function (t_accountId){
		this.accountId = t_accountId;
	},

	getCustomerId: function(){
		return this.customerId;
	},
	
	setCustomerId: function (t_customerId){
		this.customerId = t_customerId;
	},

	getGlobalAccountNum: function(){
		return this.globalAccountNum;
	},
	
	setGlobalAccountNum: function (t_globalAccountNum){
		this.globalAccountNum = t_globalAccountNum;
	},

	getGroupName: function(){
		return this.groupName;
	},
	
	setGroupName: function (t_groupName){
		this.groupName = t_groupName;
	},

	getGlAddress: function(){
		return this.glAddress;
	},
	
	setGlAddress: function (t_glAddress){
		this.glAddress = t_glAddress;
	},

    clearAll: function(){
       this.setAccountId("");
       this.setCustomerId("");
       this.setGlobalAccountNum("");
       this.setGroupName("");
       this.setGlAddress("");
    }

}