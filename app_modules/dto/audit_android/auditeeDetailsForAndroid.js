module.exports = auditeeDetailsForAndroid;
var tenant_id  = new Array();
var office_id   = new Array();
var user_id    = new Array();
var user_name   = new Array();
var audit_type_id  = new Array();
var office_name = new Array();


function auditeeDetailsForAndroid() {
    this.clearAll();
}

auditeeDetailsForAndroid.prototype = {

    setTenantId : function(t_tenant_id){
        this.tenant_id = t_tenant_id;
    },
    getTenantId : function(){
        return this.tenant_id;
    },

    setOfficeId : function(t_office_id){
        this.office_id = t_office_id;
    },
    getOfficeId : function(){
        return this.office_id;
    },

    setUserId : function(t_user_id){
        this.user_id = t_user_id;
    },
    getUserId : function(){
        return this.user_id;
    },

    setUserName : function(t_user_name){
        this.user_name = t_user_name;
    },
    getUserName : function(){
        return this.user_name;
    },

    setAuditTypeId : function(t_audit_type_id){
        this.audit_type_id = t_audit_type_id;
    },
    getAuditTypeId : function(){
        return this.audit_type_id;
    },

    setOfficeName : function(t_office_name){
        this.office_name = t_office_name;
    },
    getOfficeName : function(){
        return this.office_name;
    },



    clearAll: function() {
        this.setTenantId(new Array());
        this.setOfficeId(new Array());
		this.setUserId(new Array());
        this.setUserName(new Array());
        this.setAuditTypeId(new Array());
        this.setOfficeName(new Array());
	}
	
};