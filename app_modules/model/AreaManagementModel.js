module.exports = areaManagementModel;

var path = require('path');
var applicationHome = path.dirname(process.mainModule.filename);
var AreaManagementDataModel = require(path.join(applicationHome,"app_modules/data_model/AreaManagementDataModel"));
var customlog = require(path.join(applicationHome,"logger/loggerConfig.js"))('AreaManagementModel.js');

//Business Layer
function areaManagementModel(constants) {
    customlog.debug("Inside business layer");
    this.dataModel = new AreaManagementDataModel(constants);
}

areaManagementModel.prototype = {
    // Added Paramasivan for Area Management
    retrieveAreaDetailsModel: function(officeId, roleId, isVerified, selectedOperationId, callback){
        this.dataModel.retrieveAreaDetailsDataModel(officeId, roleId, isVerified, selectedOperationId, callback);
    },

    retrieveAreaQuestionDetailsModel: function(officeId, callback){
        this.dataModel.retrieveAreaQuestionDetailsDataModel(officeId, callback);
    },

    saveAreaDetailsModel: function(officeId, areaManagement, questionsId, subQuestionsId, callback){
        this.dataModel.saveAreaDetailsDataModel(officeId, areaManagement, questionsId, subQuestionsId, callback);
    },

    updateAreaDetailsModel: function(officeId, areaManagement, questionsId, subQuestionsId, areaCode,callback){
        this.dataModel.updateAreaDetailsDataModel(officeId, areaManagement, questionsId, subQuestionsId, areaCode,callback);
    },

    retrieveAreaCodeDetailsModel: function(areaCodeId, officeId, callback){
        this.dataModel.retrieveAreaCodeDetailsDataModel(areaCodeId, officeId, callback);
    },

    approveOrRejectAreaModel: function(areaCodeId, officeId, approveFlag, remarks, questionId, callback){
        this.dataModel.approveOrRejectAreaDataModel(areaCodeId, officeId, approveFlag, remarks, questionId, callback);
    },

    assignOrReleaseAreaModel: function(areaCodes, fieldOfficerId, releaseFlag, roleId, existingFieldOfficerId, callback){
        this.dataModel.assignOrReleaseAreaDataModel(areaCodes, fieldOfficerId, releaseFlag, roleId, existingFieldOfficerId, callback);
    }
}