module.exports = LoanRecoveryGroups;

function LoanRecoveryGroups() {
   //this.clearAll();
}
var accountId;
var customerId;
var globalAccountNum;
var groupName;
var glAddress;
var iklantGroupId;
var statusName;
var iklantGroupName;


LoanRecoveryGroups.prototype = {
	
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
    getiklantGroupId: function(){
        return this.iklantGroupId;
    },

    setiklantGroupId: function (t_iklantGroupId){
        this.iklantGroupId = t_iklantGroupId;
    },
    getStatusName: function(){
        return this.statusName;
    },

    setStatusName: function (t_statusName){
        this.statusName = t_statusName;
    },
    getIklantGroupName: function(){
        return this.iklantGroupName;
    },

    setIklantGroupName: function (t_iklantGroupName){
        this.iklantGroupName = t_iklantGroupName;
    },

    clearAll: function(){
       this.setAccountId("");
       this.setCustomerId("");
       this.setGlobalAccountNum("");
       this.setGroupName("");
       this.setGlAddress("");
       this.setiklantGroupId("");
       this.setIklantGroupName("");
       this.setStatusName("");
    }

}