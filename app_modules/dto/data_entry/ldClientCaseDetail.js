module.exports = ldClientCaseDetails;

var clientId;
var groupId;
var callTrackingDetailIds = new Array();
var remarksIds = new Array();
var roleId;

function ldClientCaseDetails(){

}


ldClientCaseDetails.prototype = {
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

    setCallTrackingDetailIds : function(t_callTrackingDetailIds){
        this.callTrackingDetailIds = t_callTrackingDetailIds;
    },
    getCallTrackingDetailIds : function(){
        return this.callTrackingDetailIds;
    },

    setRemarksIds : function(t_remarksIds){
        this.remarksIds = t_remarksIds;
    },
    getRemarksIds : function(){
        return this.remarksIds;
    },
    setRoleId : function(t_roleId){
        this.roleId = t_roleId;
    },
    getRoleId : function(){
        return this.roleId;
    }

}

