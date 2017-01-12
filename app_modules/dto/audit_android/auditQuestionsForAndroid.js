module.exports = auditQuestionsForAndroid;
var tenant_id = new Array();
var question_Id  = new Array();
var question_Name  = new Array();
var display_name   = new Array();
var weightage   = new Array();
var audit_type   = new Array();
var category_type   = new Array();
var is_default   = new Array();
var created_by   = new Array();
var created_date   = new Array();
var deleted_date    = new Array();
var updated_by     = new Array();
var updated_date     = new Array();

function auditQuestionsForAndroid() {
    this.clearAll();
}

auditQuestionsForAndroid.prototype = {

setTenantId : function(t_tenant_id){
    this.tenant_id = t_tenant_id;
},
    getTenantId : function(){
    return this.tenant_id;
},

setQuestionId : function(t_question_Id){
    this.question_Id = t_question_Id;
},
getQuestionId : function(){
    return this.question_Id;
},

setQuestionName : function(t_question_Name){
    this.question_Name = t_question_Name;
},
getQuestionName : function(){
    return this.question_Name;
},

setDisplayName : function(t_display_name){
    this.display_name = t_display_name;
},
getDisplayName : function(){
    return this.display_name;
},

setWeightage : function(t_weightage){
    this.weightage = t_weightage;
},
getWeightage : function(){
    return this.weightage;
},

setAuditType : function(t_audit_type){
    this.audit_type = t_audit_type;
},
getAuditType : function(){
    return this.audit_type;
},

setCategoryType : function(t_category_type){
    this.category_type = t_category_type;
},
getCategoryType : function(){
    return this.category_type;
},

setIsDefault : function(t_is_default){
    this.is_default = t_is_default;
},
getIsDefault : function(){
    return this.is_default;
},

setCreatedBy : function(t_created_by){
    this.created_by = t_created_by;
},
getCreatedBy : function(){
    return this.created_by;
},

setCreatedDate : function(t_created_date){
    this.created_date = t_created_date;
},
getCreatedDate : function(){
    return this.created_date;
},

setDeletedDate : function(t_deleted_date){
    this.deleted_date = t_deleted_date;
},
getDeletedDate : function(){
    return this.deleted_date;
},

setUpdatedBy : function(t_updated_by){
    this.updated_by = t_updated_by;
},
getUpdatedBy : function(){
    return this.updated_by;
},

setUpdatedDate : function(t_updated_date){
    this.updated_date = t_updated_date;
},
getUpdatedDate : function(){
    return this.updated_date;
}    ,
    clearAll: function() {
        this.setTenantId(new Array());
        this.setQuestionId(new Array());
        this.setQuestionName(new Array());
        this.setDisplayName(new Array());
        this.setWeightage(new Array());
        this.setAuditType(new Array());

        this.setCategoryType(new Array());
        this.setIsDefault(new Array());
        this.setCreatedBy(new Array());

        this.setCreatedDate(new Array());

        this.setDeletedDate(new Array());
        this.setUpdatedBy(new Array());
        this.setUpdatedDate(new Array());


    }
}
