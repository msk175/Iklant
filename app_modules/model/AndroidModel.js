
module.exports = androidModel;

var path = require('path');
var applicationHome = path.dirname(process.mainModule.filename);
var AndroidDataModel = require(path.join(applicationHome,"app_modules/data_model/AndroidDataModel"));
var customlog = require(path.join(applicationHome,"logger/loggerConfig.js"))('AndroidModel.js');

//Business Layer
function androidModel(constants,commonRouter) {
    customlog.debug("Inside business layer");
    this.dataModel = new AndroidDataModel(constants,commonRouter);
}

androidModel.prototype = {

    retriveOfficeNameModel : function(tenant_id,office_id,callback){
        this.dataModel.retriveOfficeNameDataModel(tenant_id,office_id,callback);
    },

    iklanToAndroidDetailsSyncModel: function(tenant_id,office_id,user_id,role_id,callback) {
        this.dataModel.iklanToAndroidDetailsSyncDatamodel(tenant_id,office_id,user_id,role_id,callback);
    },

    readOfficeCoordinatesModel: function(officeId,callback) {
        this.dataModel.readOfficeCoordinatesDataModel(officeId,callback);
    },

    authenticationModel: function(userName,password,callback) {
        this.dataModel.authentication(userName,password,callback);
    },

    authenticationModelLDCallTrack: function(userName,password,gcmRegId,callback) {
        this.dataModel.authenticationDataModelLDCallTrack(userName,password,gcmRegId,callback);
    },

    saveGroupAndroidModel: function(userId,officeId,jsonObjectGCDetails,jsonObjectUserDetails,callback) {
        this.dataModel.saveGroupAndroidDatamodel(userId,officeId,jsonObjectGCDetails,jsonObjectUserDetails,callback);
    },

    verifyGroupModel: function(userId,prosGroup,preVerification,callback) {
        this.dataModel.verifyGroup(userId,prosGroup,preVerification,callback);
    },

    retrieveGroupDetailModel : function(userId,tenantId,groupName,callback){
        this.dataModel.retrieveGroupDetailDataModel(userId,tenantId,groupName,callback);
    },
    retrieveKycAndroidGroupDetailModel : function(userId,tenantId,groupName,loanCount,callback){
        this.dataModel.retrieveKycAndroidGroupDetailDataModel(userId,tenantId,groupName,loanCount,callback);
    },
    checkClientDocAvailabilityModel:function(groupId,androidDocName,callback){
        this.dataModel.checkClientDocAvailabilityDataModel(groupId,androidDocName,callback);
    },

    loanSanctionAndroidModel:function(userId,tenantId,officeId,roleId,callback){
        this.dataModel.loanSanctionAndroidDataModel(userId,tenantId,officeId,roleId,callback);
    },

    // Dhinakaran
    doGcmRegistrationModel: function (userId, gcmRegId, callback) {
        this.dataModel.doGcmRegistrationDataModel(userId, gcmRegId, callback);
    },

    getDisplayNameModel: function(userId,callback) {
        this.dataModel.getDisplayNameDataModel(userId,callback);
    },

    getEmailIdOfBMmodel: function(officeId, callback) {
        this.dataModel.getEmailIdOfBMdataModel(officeId, callback);
    },

    LRGPSNotificationAndroidModel: function(userId,officeId,collectedDetails,callback) {
        this.dataModel.LRGPSNotificationAndroidDatamodel(userId,officeId,collectedDetails,callback);
    },

    insertNOCDocumentsModel: function(clientId, fileName,  callback){
        this.dataModel.insertNOCDocumentsDataModel(clientId, fileName, callback);
    },

    insertdocumentDetailsAndroidModel: function(userId,docEntityId,captured_image,client_id,doc_type_id,doc_name,
                                                groupId,groupName,clientName,clientLastName,newClientGlobalNumber,tempCount,totalClients,loanCount,androidDocName,callback) {
        this.dataModel.insertKycDocumentDetailsAndroidDataModel(userId,docEntityId,captured_image,client_id,doc_type_id,doc_name,
            groupId,groupName,clientName,clientLastName,newClientGlobalNumber,tempCount,totalClients,loanCount,androidDocName,callback);
    },

    //Dhinakaran
    insertKycNeedImgDocumentDetailsCallAndroidModel:function(userId,docEntityId,captured_image,client_id,doc_type_id,doc_name,
                                                             groupId,groupName,clientName,clientLastName,newClientGlobalNumber,tempCount,totalClients,loanCount,androidDocName,callback) {
        this.dataModel.insertKycNeedImgClarityDocumentDetailsAndroidDataModel(userId,docEntityId,captured_image,client_id,doc_type_id,doc_name,
            groupId,groupName,clientName,clientLastName,newClientGlobalNumber,tempCount,totalClients,loanCount,androidDocName,callback);
    },

    checkGroupClientAvailabilityCallAndroidModel:function(userId,docEntityId,captured_image,client_id,doc_type_id,doc_name,
                                                           groupId,groupName,clientName,clientLastName,newClientGlobalNumber,tempCount,totalClients,loanCount,androidDocName,callback) {
        this.dataModel.checkGroupClientAvailabilityCallAndroidDataModel(userId,docEntityId,captured_image,client_id,doc_type_id,doc_name,
            groupId,groupName,clientName,clientLastName,newClientGlobalNumber,tempCount,totalClients,loanCount,androidDocName,callback);
    },

    // Dhinakaran
    insertLoanSanctionDetailsCallAndroidModel:function(capturedImage,clientId,docTypeId,docName,groupId,groupName,callback){
        this.dataModel.insertLoanSanctionDetailsCallAndroidDataModel(capturedImage,clientId,docTypeId,docName,groupId,groupName,callback);
    },

    insertdocumentDetailsPmtCollModel: function(captured_image,client_id,doc_type_id,doc_name,group_id,callback) {
        this.dataModel.insertdocumentDetailsModelPmtCollLR(captured_image,client_id,doc_type_id,doc_name,group_id,callback);
    },

    getGroupDetailsForRecoveryModel : function(userId,accountId,callback) {
        this.dataModel.getGroupDetailsForDataModel(userId,accountId,callback);
    },

    getRecoveryReasons : function(callback){
        this.dataModel.getRecoveryReasonsDataModel(callback);
    }

}