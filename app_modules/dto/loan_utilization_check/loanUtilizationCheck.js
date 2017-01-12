module.exports = loanUtilizationCheck;

var groupId
var clientId;
var accountNumber;
var isLoanAmountUsedForIntendedPurpose;
var reasonForLoanAmountNotUsed;
var physicalVerification;
var reasonForNotVerifyingPhysically;
var isLUCSatisfied;
var reasonForLUC;
var isThereAnyGrievance;
var remarks;
var lucDoneBy;

function loanUtilizationCheck() {
    this.clearAll();
}

loanUtilizationCheck.prototype = {

    getGroupParentId: function(){
        return this.groupId;
    },

    setGroupParentId: function (t_groupId){
        this.groupId = t_groupId;
    },

    getClientId: function(){
        return this.clientId;
    },

    setClientId: function (t_clientId){
        this.clientId = t_clientId;
    },

    getAccountNumber: function(){
        return this.accountNumber;
    },

    setAccountNumber: function (t_accountNumber){
        this.accountNumber = t_accountNumber;
    },

    getIsLoanAmountUsedForIntendedPurpose: function(){
        return this.isLoanAmountUsedForIntendedPurpose;
    },

    setIsLoanAmountUsedForIntendedPurpose: function (t_isLoanAmountUsedForIntendedPurpose){
        this.isLoanAmountUsedForIntendedPurpose = t_isLoanAmountUsedForIntendedPurpose;
    },

    getReasonForLoanAmountNotUsed: function(){
        return this.reasonForLoanAmountNotUsed;
    },

    setReasonForLoanAmountNotUsed: function (t_reasonForLoanAmountNotUsed){
        this.reasonForLoanAmountNotUsed = t_reasonForLoanAmountNotUsed;
    },

    getPhysicalVerification: function(){
        return this.physicalVerification;
    },

    setPhysicalVerification: function (t_physicalVerification){
        this.physicalVerification = t_physicalVerification;
    },

    getReasonForNotVerifyingPhysically: function(){
        return this.reasonForNotVerifyingPhysically;
    },

    setReasonForNotVerifyingPhysically: function (t_reasonForNotVerifyingPhysically){
        this.reasonForNotVerifyingPhysically = t_reasonForNotVerifyingPhysically;
    },

    getIsLUCSatisfied: function(){
        return this.isLUCSatisfied;
    },

    setIsLUCSatisfied: function (t_isLUCSatisfied){
        this.isLUCSatisfied = t_isLUCSatisfied;
    },

    getReasonForLUC: function(){
        return this.reasonForLUC;
    },

    setReasonForLUC: function (t_reasonForLUC){
        this.reasonForLUC = t_reasonForLUC;
    },

    getIsThereAnyGrievance: function(){
        return this.isThereAnyGrievance;
    },

    setIsThereAnyGrievance: function (t_isThereAnyGrievance){
        this.isThereAnyGrievance = t_isThereAnyGrievance;
    },

    getRemarks: function(){
        return this.remarks;
    },

    setRemarks: function (t_remarks){
        this.remarks = t_remarks;
    },

    getLUCDoneBy: function(){
        return this.lucDoneBy;
    },

    setLUCDoneBy: function (t_lucDoneBy){
        this.lucDoneBy = t_lucDoneBy;
    },

    clearAll: function() {
        this.setGroupParentId("");
        this.setClientId("");
        this.setAccountNumber("");
        this.setIsLoanAmountUsedForIntendedPurpose("");
        this.setReasonForLoanAmountNotUsed("");
        this.setPhysicalVerification("");
        this.setReasonForNotVerifyingPhysically("");
        this.setIsLUCSatisfied("");
        this.setReasonForLUC("");
        this.setIsThereAnyGrievance("");
        this.setRemarks("");
        this.setLUCDoneBy("");
    }
};