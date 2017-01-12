module.exports = auditTemplateForAndroid;
var audit_template_id = new Array();
var audit_question_id = new Array();
var weightage = new Array();
var audit_type = new Array();
var category_type = new Array();
var created_date = new Array();
var updated_date = new Array();


function auditTemplateForAndroid() {
    this.clearAll();
}

auditTemplateForAndroid.prototype = {


setAuditTemplateId : function(t_audit_template_id){
    this.audit_template_id = t_audit_template_id;
},
getAuditTemplateId : function(){
    return this.audit_template_id;
},

setAuditQuestionId : function(t_audit_question_id){
    this.audit_question_id = t_audit_question_id;
},
getAuditQuestionId : function(){
    return this.audit_question_id;
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

    clearAll: function() {
        this.setAuditTemplateId(new Array());
        this.setAuditQuestionId(new Array());
        this.setWeightage(new Array());
        this.setAuditType(new Array());
        this.setCategoryType(new Array());
        this.setCreatedDate(new Array());
        this.setUpdatedDate(new Array());

    }

};
