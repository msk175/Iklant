module.exports = auditingForAndroid;
var auditing_id = new Array();
var audit_type_id = new Array();
var audit_category_id = new Array();
var audit_template_id = new Array();
var auditee_id = new Array();
var auditor_id = new Array();
var office_id = new Array();
var assign_to = new Array();
var audit_status = new Array();
var audit_due_from = new Array();
var audit_due_to = new Array();
var created_date = new Array();
var updated_date = new Array();
var completed_date = new Array();

function auditingForAndroid() {
    this.clearAll();
}

auditingForAndroid.prototype = {

    setAuditingId : function(t_auditing_id){
        this.auditing_id = t_auditing_id;
    },
    getAuditingId : function(){
        return this.auditing_id;
    },

    setAuditTypeId : function(t_audit_type_id){
        this.audit_type_id = t_audit_type_id;
    },
    getAuditTypeId : function(){
        return this.audit_type_id;
    },

    setAuditCategoryId : function(t_audit_category_id){
        this.audit_category_id = t_audit_category_id;
    },
    getAuditCategoryId : function(){
        return this.audit_category_id;
    },

    setAuditTemplateId : function(t_audit_template_id){
        this.audit_template_id = t_audit_template_id;
    },
    getAuditTemplateId : function(){
        return this.audit_template_id;
    },


    setAuditeeId : function(t_auditee_id){
        this.auditee_id = t_auditee_id;
    },
    getAuditeeId : function(){
        return this.auditee_id;
    },

    setAuditorId : function(t_auditor_id){
        this.auditor_id = t_auditor_id;
    },
    getAuditorId : function(){
        return this.auditor_id;
    },

    setOfficeId : function(t_office_id){
        this.office_id = t_office_id;
    },
    getOfficeId : function(){
        return this.office_id;
    },

    setAssignTo : function(t_assign_to){
        this.assign_to = t_assign_to;
    },
    getAssignTo : function(){
        return this.assign_to;
    },

    setAuditStatus : function(t_audit_status){
        this.audit_status = t_audit_status;
    },
    getAuditStatus : function(){
        return this.audit_status;
    },

    setAuditDueFrom : function(t_audit_due_from){
        this.audit_due_from = t_audit_due_from;
    },
    getAuditDueFrom : function(){
        return this.audit_due_from;
    },

    setAuditDueTo : function(t_audit_due_to){
        this.audit_due_to = t_audit_due_to;
    },
    getAuditDueTo : function(){
        return this.audit_due_to;
    },

    setCreatedDate : function(t_created_date){
        this.created_date = t_created_date;
    },
    getCreatedDate : function(){
        return this.created_date;
    },

    setUpdatedDate : function(t_updated_date){
        this.updated_date = t_updated_date;
    },
    getUpdatedDate : function(){
        return this.updated_date;
    },

    setCompletedDate : function(t_completed_date){
        this.completed_date = t_completed_date;
    },
    getCompletedDate : function(){
        return this.completed_date;
    },

    clearAll: function() {
            this.setAuditingId(new Array());
            this.setAuditTypeId(new Array());
            this.setAuditCategoryId(new Array());
            this.setAuditeeId(new Array());
            this.setAuditorId(new Array());
            this.setOfficeId(new Array());
            this.setAssignTo(new Array());
            this.setAuditStatus(new Array());
            this.setAuditDueFrom(new Array());
            this.setAuditDueTo(new Array());
            this.setCreatedDate(new Array());
            this.setUpdatedDate(new Array());
            this.setCompletedDate(new Array());
        }


	
};