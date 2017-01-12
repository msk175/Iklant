module.exports = commonModel;

var path = require('path');
var applicationHome = path.dirname(process.mainModule.filename);
var CommonDataModel = require(path.join(applicationHome,"app_modules/data_model/CommonDataModel"));
var customlog = require(path.join(applicationHome,"logger/loggerConfig.js"))('CommonModel.js');

//Business Layer
function commonModel(constants) {
    customlog.debug("Inside business layer");
    this.dataModel = new CommonDataModel(constants);
}

commonModel.prototype = {
    getBranchesModel: function(tenantId,userId,roleId,officeId,callback) {
        this.dataModel.getBranchesDataModel(tenantId,userId,roleId,officeId,callback);
    },
    listGroupsModel: function(tenantId,userId,officeId,roleId,requestedOperationId,callback) {
        this.dataModel.listGroups(tenantId,userId,officeId,roleId,requestedOperationId,callback);
    },
    createGroupModel: function(tenantId,officeId,userId,callback) {
        this.dataModel.createGroup(tenantId,officeId,userId,callback);
    },
    retrieveLoanTypelistModel : function(tenantId,callback){
        this.dataModel.retrieveLoanTypelistDataModel(tenantId,callback);
    },
    retriveOfficeModel : function(tenantId,userId,callback) {
        this.dataModel.retriveOfficeDatamodel(tenantId,userId,callback);
    },
    listClientsModel : function(tenantId,userId,officeId,roleId,callback){
        this.dataModel.listClientsDataModel(tenantId,userId,officeId,roleId,callback);
    },
    listClientsForRMAuthorizationModel : function(tenantId,userId,officeId,roleId,callback){
        this.dataModel.listClientsForRMAuthorizationDataModel(tenantId,userId,officeId,roleId,callback);
    },
    retrieveLookUpIdModel  : function(callback){
        this.dataModel.retrieveLookUpIdDataModel(callback);
    },
    insertActivityLogModel: function(activityDetails){
        this.dataModel.insertActivityLogDataModel(activityDetails);
    },
    getFONamesForAssigningFOModel:function(tenantId,officeId,callback) {
        this.dataModel.getFONamesForAssigningFODatamodel(tenantId,officeId,callback);
    },
    getUsersModel: function(tenantId,callback) {
        this.dataModel.getUsersDatamodel(tenantId,callback);
    },
    getRolesModel: function(tenantId,callback) {
        this.dataModel.getRolesDatamodel(tenantId,callback);
    },
    retrieveStateModel : function(callback) {
        this.dataModel.retriveStateDatamodel(callback);
    },
    manageRolesModel :function(callback) {
        this.dataModel.manageRoles(callback);
    },
    retriveFieldOfficersModel : function(officeId,callback) {
        this.dataModel.retriveFieldOfficersDataModel(officeId,callback);
    },
    // Added by Paramasivan for the Reports
    getPersonnelDetailsCallModel : function(office_id,userId,callBack){
        this.dataModel.getPersonnelDetailsDataModel(office_id,userId,callBack);
    },
    retrieveClientDetailsForGeneratePDFModel : function(mifosCustomerId,selectedMemberId,callback){
        this.dataModel.retrieveClientDetailsForGeneratePDFDataModel(mifosCustomerId,selectedMemberId,callback);
    },
    //added by Chitra
    updateLeaderAndSubLeaderDetailsModel : function(groupId,mifosCustomerId,callback){
        this.dataModel.updateLeaderAndSubLeaderDetailsDataModel(groupId,mifosCustomerId,callback);
    },
    updateLeaderAndSubLeaderDetailsInMifosModel : function(groupId,mifosCustomerId,callback){
        this.dataModel.updateLeaderAndSubLeaderDetailsInMifosDataModel(groupId,mifosCustomerId,callback);
    },
    updateLeaderAndSubLeaderDetailsForRejectedModel : function(subLeaderRejectedGlobalNumber,subLeaderRejectedClientId,callback){
        this.dataModel.updateLeaderAndSubLeaderDetailsForRejectedDataModel(subLeaderRejectedGlobalNumber,subLeaderRejectedClientId,callback);
    },
    KYCFileUploadForLoanSanctionModel : function(clientid,formType,mifosCustomerId,docLanguage,bcOfficeId,callback) {
        this.dataModel.KYCFileUploadForLoanSanctionDatamodel(clientid,formType,mifosCustomerId,docLanguage,bcOfficeId,callback);
    },
    generateLegalFormModel : function(mifosGlobalAccountNo,callback){
        this.dataModel.generateLegalFormForGroupDataModel(mifosGlobalAccountNo,callback);
    },
    generateMASLegalFormModel : function(mifosGlobalAccountNo,callback){
        this.dataModel.generateMASLegalFormForGroupDataModel(mifosGlobalAccountNo,callback);
    },
    groupAndClientsLoanScheduleModel : function(mifosCustomerId,globalAccountNum,clientid, callBack){
        this.dataModel.groupAndClientsLoanScheduleDataModel(mifosCustomerId,globalAccountNum,clientid, callBack);
    },
    getIklantGroupIdFromCustomerIdModel : function(mifosCustomerId,callback){
        this.dataModel.getIklantGroupIdFromCustomerIdDataModel(mifosCustomerId,callback);
    },
    insertFieldVerificationDetailsModel: function(fieldVerificationObj,prospectClientHouseDetailToUpdate,callback) {
        this.dataModel.insertFieldVerificationDetails(fieldVerificationObj,prospectClientHouseDetailToUpdate,callback);
    },
    getClientNamesAfterModel: function(groupId,callback) {
        this.dataModel.getClientNamesForFieldVerification(groupId,callback);
    },
    //Adarsh-retrieve DocType
    retrieveDocTypeListModel : function(tenantId,callback){
        this.dataModel.retrieveDocTypeListDataModel(tenantId,callback);
    },
    ccaModel1: function(tenantId,groupId,callback) {
        this.dataModel.cca1AfterCheck(tenantId,groupId,callback);
    },
    retrieveIdleClientsModel: function(tenantId, groupId, statusId, callback) {
        this.dataModel.retrieveIdleClientsDataModel(tenantId, groupId, statusId, callback);
    },
    rejectedClientDetailsModel : function(tenantId,clientId,callback){
        this.dataModel.rejectedClientDetailsDataModel(tenantId,clientId,callback);
    },
    needClarificationDetailsModel : function(clientId,remarks,callback) {
        this.dataModel.needClarificationDetails(clientId,remarks,callback);
    },
    groupAuthorizationClientCalculationModel : function(tenantId,groupId,callback) {
        this.dataModel.groupAuthorizationClientCalculationDataModel(tenantId,groupId,callback);
    },
    //Baskar
    getClientNamesModel: function(groupId,callback) {
        this.dataModel.getClientNamesForFieldVerification(groupId,callback);
    },
    getFieldVerificationDetailsModel: function(clientId,callback) {
        this.dataModel.getFieldVerificationDetails(clientId,callback);
    },
    groupDetailsAuthorizationModel: function(tenantId,branchId,groupId,clientId,callback) {
        this.dataModel.groupDetailsAuthorizationDatamodel(tenantId,branchId,groupId,clientId,callback);
    },
    listQuestionsCCACallModel: function(tenantId,clientId,clientLoanCount,callback) {
        this.dataModel.listQuestionsCCACallDataModel(tenantId,clientId,clientLoanCount,callback);
    },
    updateClientStatusModel : function(clientIdListArray,clientIds,overdues,callback){
        this.dataModel.updateClientStatusDataModel(clientIdListArray,clientIds,overdues,callback);
    },
    removableDocumentAvailabilityModel : function(isAvailableSize,isDelete,checkingType,callback){
     console.log("Model : removableDocumentAvailabilityModel entry");
     this.dataModel.removableDocumentAvailabilityDataModel(isAvailableSize,isDelete,checkingType,callback)
    },
    archeivedFlagUpdateClientDocModel : function(clientDocId,clientId,callback){
        console.log("Model : archeivedFlagUpdateClientDocModel entry");
        this.dataModel.archeivedFlagUpdateClientDoc(clientDocId,clientId,callback)
    }
}