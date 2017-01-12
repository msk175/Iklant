module.exports = auditingModel;

var path = require('path');
var applicationHome = path.dirname(process.mainModule.filename);
var AuditingDataModel = require(path.join(applicationHome,"app_modules/data_model/AuditingDataModel"));
var customlog = require(path.join(applicationHome,"logger/loggerConfig.js"))('AuditingModel.js');

//Business Layer
function auditingModel(constants) {
    customlog.debug("Inside business layer");
    this.dataModel = new AuditingDataModel(constants);
}

auditingModel.prototype = {
    //Added by Sathish Kumar M 008 For Audit Module
    retrieveOperationDetailsForAudit: function(roleId,callback){
        this.dataModel.retrieveOperationDetailsForAuditDataModel(roleId,callback);
    },
    retriveAuditCall: function (callback){
        this.dataModel.retriveAuditDataModelCall(callback)
    },
    retrieveAuditQuestionsDetailsModel: function(auditTypeId, categoryTypeId, callback){
        this.dataModel.retrieveAuditQuestionsDetailsDataModel(auditTypeId, categoryTypeId, callback);
    },
    saveCategoryDetailsModel: function(categoryName,auditType, callback){
        this.dataModel.saveCategoryDetailsDataModel(categoryName,auditType, callback);
    },
    saveAuditDetailsModel: function(tenantId, questionName, questionShortName, weightage,auditType,categoryType,createdBy,weightageArray,oldQuestionId, callback){
        this.dataModel.saveAuditDetailsDataModel(tenantId, questionName, questionShortName, weightage,auditType,categoryType,createdBy,weightageArray,oldQuestionId, callback);
    },
    deleteAuditQuestionsDetailsModel:function(questionDeleteId, userId, callback){
        this.dataModel.deleteAuditQuestionsDetailsDataModel(questionDeleteId, userId, callback)
    },
    retriveAuditorCall:function(callback){
        this.dataModel.retriveAuditorDataModelCall(callback)
    },
    saveAssignAuditorDetailsModel: function(tenantId,auditees,officeId,fromDate,auditType,toDate,categoryTypeId,callback){
        this.dataModel.saveAssignAuditorDetailsDataModel(tenantId,auditees,officeId,fromDate,auditType,toDate,categoryTypeId,callback)
    },
    retrieveAuditorAssignmentDetailsModel: function (auditees,callback){
        this.dataModel.retrieveAuditorAssignmentDetailsDataModel(auditees,callback);
    } ,
    retreiveAndroidAuditingSyncDetailsModel: function (auditorId,callback){
        this.dataModel.retreiveAndroidAuditingSyncDetailsDatamodel(auditorId,callback);
    },
    doAuditorSaveAndroidModel:function(auditingAnswerId,auditingQuestionId,auditingId,answersTypeId,answerRemarks,auditTemplateId,auditeeId,auditStatus,callback){
        this.dataModel.doAuditorSaveAndroidDataModel(auditingAnswerId,auditingQuestionId,auditingId,answersTypeId,answerRemarks,auditTemplateId,auditeeId,auditStatus,callback);
    } ,
    doAuditingStatusUpdateModel:function(auditingId,auditStatus,callback){
        this.dataModel.doAuditingStatusUpdateDataModel(auditingId,auditStatus,callback);
    },
    getMailDetailsModel: function(auditTemplateId,auditingId,auditeeId,callback){
        this.dataModel.getMailDetailsDataModel(auditTemplateId,auditingId,auditeeId,callback);
    }
};