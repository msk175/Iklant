module.exports = groupManagementModel;

var path = require('path');
var applicationHome = path.dirname(process.mainModule.filename);
var GroupManagementDataModel = require(path.join(applicationHome,"app_modules/data_model/GroupManagementDataModel"));
var customLog = require(path.join(applicationHome,"logger/loggerConfig.js"))('GroupManagementModel.js');

//Business Layer
function groupManagementModel(constants) {
    customLog.debug("Inside business layer");
    this.dataModel = new GroupManagementDataModel(constants);
}

groupManagementModel.prototype = {

    getKYCUploadStatusModel: function(groupId, callback){
        this.dataModel.getKYCUploadStatusDataModel(groupId, callback);
    },

    moveForDataEntryModel: function(groupId, callback){
        this.dataModel.moveForDataEntryDataModel(groupId, callback);
    },

    getGroupRecognitionTestDetailsModel: function(groupId,callback) {
        this.dataModel.getGroupRecognitionTestDetailsDataModel(groupId,callback);
    },

    saveRatingForGRTModel: function(groupId,questionIdDetails,createdBy,checkedOrNotDetails,totalRating,remarks, callback) {
        this.dataModel.saveRatingForGRTDataModel(groupId,questionIdDetails,createdBy,checkedOrNotDetails,totalRating,remarks, callback);
    },

    listClientsForLoanSanctionModel : function(groupId,mifosCustomerId,callback) {
        this.dataModel.getClientNamesForLoanSanction(groupId,mifosCustomerId,callback);
    },

    getClientNamesModelForRejectedGroups: function(groupId,callback) {
        this.dataModel.getClientNamesForRejectedGroups(groupId,callback);
    },

    reintiateClientModel: function(tenantId,clientId,remarksForReintiate,groupStatusID,clientStatus, groupId, roleId, callback){
        this.dataModel.reintiateClientDataModel(tenantId,clientId,remarksForReintiate,groupStatusID,clientStatus, groupId, roleId, callback);
    },

    populateGroupsModel: function(tenantId,officeId,userId,statusid,callback){
        this.dataModel.populateGroupsDataModel(tenantId,officeId,userId,statusid,callback);
    },

    populateRejectedGroupsModel: function(tenantId,officeId,userId,statusid,callback){
        this.dataModel.populateRejectedGroupsDataModel(tenantId,officeId,userId,statusid,callback);
    },

    showDashBoardModel : function(tenantId,officeId,callback) {
        this.dataModel.showDashBoardDataModel(tenantId,officeId,callback);
    },

    saveGroupGroupModel: function(userId,officeId,areaCodeId,prosGroup,callback) {
        this.dataModel.saveGroup(userId,officeId,areaCodeId,prosGroup,callback);
    },

    showPreliminaryVerificationModel: function(groupId,callback) {
        this.dataModel.showPreliminaryVerification(groupId,callback);
    },

    showPreliminaryVerificationUploadModel: function(groupId,callback) {
        this.dataModel.showPreliminaryVerificationUpload(groupId,callback);
    },

    preVerificationDocumentUploadModel: function(groupId,fileName,docTypeId,callback) {
        this.dataModel.preVerificationDocumentUpload(groupId,fileName,docTypeId,callback);
    },

    KYC_UploadingModel: function(group_id,callback) {
        this.dataModel.KYC_Uploading(group_id,callback);
    },

    KYC_UploadingImageModel: function(client_id,doc_type_id,image,fileName,callback) {
        this.dataModel.KYC_UploadingImage(client_id,doc_type_id,image,fileName,callback);
    },

    storeCapturedImageModel: function(client_id,doc_type_id,image,fileName,callback) {
        this.dataModel.storeCapturedImage(client_id,doc_type_id,image,fileName,callback);
    },

    storePreliminaryVerificationCapturedImageModel: function(groupId,doc_type_id,image,fileName,callback) {
        this.dataModel.storePreliminaryVerificationCapturedImage(groupId,doc_type_id,image,fileName,callback);
    },

    groupDetailsModel: function(tenant_id,office_id,callback) {
        this.dataModel.groupDetails(tenant_id,office_id,callback);
    },

    memberDetailsModel: function(tenant_id,office_id,callback) {
        this.dataModel.memberDetails(tenant_id,office_id,callback);
    },

    documentDetailsModel: function(tenant_id,callback) {
        this.dataModel.documentDetails(tenant_id,callback);
    },

    availableDocumentDetailsModel: function(tenant_id,office_id,callback) {
        this.dataModel.availableDocumentDetailsDatamodel(tenant_id,office_id,callback);
    },

    saveKycUploadModel: function(groupId,callback) {
        this.dataModel.saveKycUpload(groupId,callback);
    },

    saveAssignFOModel: function(foName,assignGroupIds,callback) {
        this.dataModel.saveAssignFO(foName,assignGroupIds,callback);
    },

    cca1RejectClientsModel: function(rejectedClientName,remarksToReject, roleId, callback) {
        this.dataModel.cca1RejectClients(rejectedClientName,remarksToReject, roleId, callback);
    },

    cca1approvedGroupModel: function(rejectedClientName,approvedGroupName,callback) {
        this.dataModel.cca1approvedGroup(rejectedClientName,approvedGroupName,callback);
    },

    cca1rejectedGroupModel: function(approvedGroupName,callback) {
        this.dataModel.cca1rejectedGroup(approvedGroupName,callback);
    },

    //Ramya
    synchronizeModel: function(groupId,callback) {
        this.dataModel.toInsertGroup(groupId,callback);
    },

    rejectIdleClientsModel: function(clientId, callback) {
        this.dataModel.rejectIdleClientsDataModel(clientId, callback);
    },

    rejectIdleGroupModel: function(groupId, callback) {
        this.dataModel.rejectIdleGroupDataModel(groupId, callback);
    },
    approveIdleGroupModel: function(groupId, statusId, callback) {
        this.dataModel.approveIdleGroupDataModel(groupId, statusId, callback);
    },

    updateClientStatusModel : function(clientIdListArray,clientIds,overdues,callback){
        this.dataModel.updateClientStatusDataModel(clientIdListArray,clientIds,overdues,callback);
    },

    reinitiateGroupModel: function(groupId,remarks,callback) {
        this.dataModel.reinitiateGroupDatamodel(groupId,remarks,callback);
    },

    addQuestionsModel: function(tenantId,callback) {
        this.dataModel.addQuestionsDataModel(tenantId,callback);
    },

    questionsSelectModel: function(tenantId,selectedQuestionId,callback) {
        this.dataModel.questionsSelectDataModel(tenantId,selectedQuestionId,callback);
    },

    saveQuestionModel: function(tenantId,submitId,callback) {
        this.dataModel.saveQuestionDataModel(tenantId,submitId,callback);
    },

    calculateSecondaryAppraisalModel: function(tenantId,clientId,secondaryQuestionIdRouter,selectedAnswerArray,callback) {
        this.dataModel.calculateSecondaryAppraisalDataModel(tenantId,clientId,secondaryQuestionIdRouter,selectedAnswerArray,callback);
    },

    skipKycUploadModel: function(groupId,callback) {
        this.dataModel.skipKycUploadDatamodel(groupId,callback);
    },

    getActiveOrRejectedClientsModel: function(group_id,callBack){
        this.dataModel.getActiveOrRejectedClientsDataModel(group_id,callBack);
    },

    downloadRequstedImageModel  : function(tenantId,clientId,docId,callback){
        this.dataModel.downloadRequstedImageDataModel(tenantId,clientId,docId,callback);
    },

    approveOrRejectClientForNextLoanCallModel: function(iklantGroupId,userId,callback){
        this.dataModel.approveOrRejectClientForNextLoanDataModel(iklantGroupId,userId,callback);
    }
};