module.exports = NPALoanRecoveryGroupsStatus;

function NPALoanRecoveryGroupsStatus() {	
   //this.clearAll();
}
var accountId;
var groupName;
var isRecovered;
var reasonForNotPaid;
var capablilityPercentage;
var expectedPaymentDate;
var remarks;
var loansStatusDescription;

NPALoanRecoveryGroupsStatus.prototype = {

	getAccountId: function(){
		return this.accountId;
	},
	
	setAccountId: function (t_accountId){
		this.accountId = t_accountId;
	},

	getGroupName: function(){
		return this.groupName;
	},
	
	setGroupName: function (t_groupName){
		this.groupName = t_groupName;
	},

	getIsRecovered: function(){
		return this.isRecovered;
	},
	
	setIsRecovered: function (t_isRecovered){
		this.isRecovered = t_isRecovered;
	},

	getReasonForNotPaid: function(){
		return this.reasonForNotPaid;
	},
	
	setReasonForNotPaid: function (t_reasonForNotPaid){
		this.reasonForNotPaid = t_reasonForNotPaid;
	},

	getCapablilityPercentage: function(){
		return this.capablilityPercentage;
	},
	
	setCapablilityPercentage: function (t_capablilityPercentage){
		this.capablilityPercentage = t_capablilityPercentage;
	},

	getExpectedPaymentDate: function(){
		return this.expectedPaymentDate;
	},
	
	setExpectedPaymentDate: function (t_expectedPaymentDate){
		this.expectedPaymentDate = t_expectedPaymentDate;
	},

	getRemarks: function(){
		return this.remarks;
	},
	
	setRemarks: function (t_remarks){
		this.remarks = t_remarks;
	},
	
	getLoansStatusDescription: function(){
		return this.loansStatusDescription;
	},
	
	setLoansStatusDescription: function (t_loansStatusDescription){
		this.loansStatusDescription = t_loansStatusDescription;
	},

    clearAll:function(){
        this.setAccountId("");
        this.setGroupName("");
        this.setIsRecovered("");
        this.setReasonForNotPaid("");
        this.setCapablilityPercentage("");
        this.setExpectedPaymentDate("");
        this.setRemarks("");
        this.setLoansStatusDescription("");
    }

}