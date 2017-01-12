module.exports = ldClientDetails;

var clientId;
var groupId;
var accountId;
var clientAccountId;
var callTrackingId;
var userId;
var callTrackingCompleted;
var alternateNo;
var questionList = new Array();
var callStatusCount = new Array();

function ldClientDetails() {
    //this.clearAll();
}

ldClientDetails.prototype = {
    setClientId : function(t_clientId){
        this.clientId = t_clientId;
    },
    getClientId : function(){
        return this.clientId;
    },

    setGroupId : function(t_groupId){
        this.groupId = t_groupId;
    },
    getGroupId : function(){
        return this.groupId;
    },

    setAccountId : function(t_accountId){
        this.accountId = t_accountId;
    },
    getAccountId : function(){
        return this.accountId;
    },

    setClientAccountId : function(t_clientAccountId){
        this.clientAccountId = t_clientAccountId;
    },
    getClientAccountId : function(){
        return this.clientAccountId;
    },

    setCallTrackingId : function(t_callTrackingId){
        this.callTrackingId = t_callTrackingId;
    },
    getCallTrackingId : function(){
        return this.callTrackingId;
    },
    setUserId : function(t_userId){
        this.userId = t_userId;
    },
    getUserId : function(){
        return this.userId;
    },

    setCallTrackingCompleted : function(t_callTrackingCompleted){
        this.callTrackingCompleted = t_callTrackingCompleted;
    },
    getCallTrackingCompleted : function(){
        return this.callTrackingCompleted;
    },

    setQuestionList : function(t_questionList){
        this.questionList = t_questionList;
    },
    getQuestionList : function(){
        return this.questionList;
    },
    setCallStatusCount : function(t_callStatusCount){
        this.callStatusCount = t_callStatusCount;
    },
    getCallStatusCount : function(){
        return this.callStatusCount;
    },
    setAlternateNo : function(t_alternateNo){
        this.alternateNo = t_alternateNo;
    },
    getAlternateNo : function(){
        return this.alternateNo;
    }

}