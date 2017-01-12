module.exports = recoveryHolder;

var accountId;
var groupName;
var address;
var amountDemanded;
var amountPaid;
var amountOverdue;
var loanOfficer;
var customerId;
var answerIdArray;
var reasonsIdArray;
var statusFlag;
var remarks;
var otherReasons;
function recoveryHolder() {
    //this.clearAll();
}
recoveryHolder.prototype = {

	getAccountId : function() {
		return this.accountId;
	},
	setAccountId : function(t_accountId) {
		this.accountId = t_accountId;
	},
	getGroupName : function() {
		return this.groupName;
	},
	setGroupName : function(t_groupName) {
		this.groupName = t_groupName;
	},
	getAddress : function() {
		return this.address;
	},
	setAddress : function(t_address) {
		this.address = t_address;
	},
	getAmountDemanded : function() {
		return this.amountDemanded;
	},
	setAmountDemanded : function(t_amountDemanded) {
		this.amountDemanded = t_amountDemanded;
	},
	getAmountPaid : function() {
		return this.amountPaid;
	},
	setAmountPaid : function(t_amountPaid) {
		this.amountPaid = t_amountPaid;
	},
	getAmountOverdue : function() {
		return this.amountOverdue;
	},
	setAmountOverdue : function(t_amountOverdue) {
		this.amountOverdue = t_amountOverdue;
	},
	getLoanOfficer : function() {
		return this.loanOfficer;
	},
	setLoanOfficer : function(t_loanOfficer) {
		this.loanOfficer = t_loanOfficer;
	},
	getCustomerId : function() {
		return this.customerId;
	},
	setCustomerId : function(t_customerId) {
		this.customerId = t_customerId;
	},
	getAnswerIdArray : function() {
		return this.answerIdArray;
	},
	setAnswerIdArray : function(t_answerIdArray) {
		this.answerIdArray = t_answerIdArray;
	},
	getStatusFlag : function() {
		return this.statusFlag;
	},
	setStatusFlag : function(t_statusFlag) {
		this.statusFlag = t_statusFlag;
	},
	getReasonsIdArray : function() {
		return this.reasonsIdArray;
	},
	setReasonsIdArray : function(t_reasonsIdArray) {
		this.reasonsIdArray = t_reasonsIdArray;
	},
	getRemarks : function() {
		return this.remarks;
	},
	setRemarks : function(t_remarks) {
		this.remarks = t_remarks;
	},
	getOtherReasons : function() {
		return this.otherReasons;
	},
	setOtherReasons : function(t_otherReasons) {
		this.otherReasons = t_otherReasons;
	},

    clearAll: function(){
        this.setAccountId("");
        this.setGroupName("");
        this.setAddress("");
        this.setAmountDemanded("");
        this.setAmountPaid("");
        this.setAmountOverdue("");
        this.setLoanOfficer("");
        this.setCustomerId("");
        this.setAnswerIdArray("");
        this.setStatusFlag("");
        this.setReasonsIdArray("");
        this.setRemarks("");
        this.setOtherReasons("");
    }
};