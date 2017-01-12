/**
 * Created with JetBrains WebStorm.
 * User: Desktop
 * Date: 3/3/15
 * Time: 7:10 PM
 * To change this template use File | Settings | File Templates.
 */
module.exports = auditAnswereForAndroid;
var auditing_answere_id  = new Array();
var auditing_question_id   = new Array();
var auditing_id    = new Array();
var answers_type_id   = new Array();
var answer_remarks  = new Array();
var created_date = new Array();
var update_date = new Array();
var audit_template_id = new Array();
var auditee_id = new Array();


function auditAnswereForAndroid() {
    this.clearAll();
}

auditAnswereForAndroid.prototype = {

    setAuditing_answere_id  : function(t_auditing_answere_id ){
        this.auditing_answere_id  = t_auditing_answere_id ;
    },
    getAuditing_answere_id  : function(){
        return this.auditing_answere_id ;
    },

    setAuditing_question_id  : function(t_auditing_question_id ){
        this.auditing_question_id  = t_auditing_question_id ;
    },
    getAuditing_question_id  : function(){
        return this.auditing_question_id ;
    },

    setAuditing_id : function(t_auditing_id){
        this.auditing_id = t_auditing_id;
    },
    getAuditing_id : function(){
        return this.auditing_id;
    },

    setAnswers_type_id : function(t_answers_type_id){
        this.answers_type_id = t_answers_type_id;
    },
    getAnswers_type_id : function(){
        return this.answers_type_id;
    },

    setAnswer_remarks  : function(t_answer_remarks ){
        this.answer_remarks  = t_answer_remarks ;
    },
    getAnswer_remarks  : function(){
        return this.answer_remarks ;
    },

    setCreated_date : function(t_created_date){
        this.created_date = t_created_date;
    },
    getCreated_date : function(){
        return this.created_date;
    },

    setUpdate_date : function(t_update_date){
        this.update_date = t_update_date;
    },
    getUpdate_date : function(){
        return this.update_date;
    },
    setAudit_template_id : function(t_audit_template_id){
    this. audit_template_id = t_audit_template_id;
    },
    getAudit_template_id : function(){
        return this. audit_template_id;
    },

    setAuditee_id : function(t_auditee_id){
        this. auditee_id = t_auditee_id;
    },
    getAuditee_id : function(){
        return this. auditee_id;
    },


clearAll: function() {
        this.setAuditing_answere_id(new Array());
        this.setAuditing_question_id(new Array());
        this.setAuditing_id(new Array());
        this.setAnswers_type_id(new Array());
        this.setAnswer_remarks(new Array());
        this.setCreated_date(new Array());
        this.setUpdate_date(new Array());
        this.setAudit_template_id(new Array());
        this.setAuditee_id(new Array());
    }
};