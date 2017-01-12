module.exports = dataEntryModel;

var path = require('path');
var applicationHome = path.dirname(process.mainModule.filename);
var DataEntryDataModel = require(path.join(applicationHome,"app_modules/data_model/DataEntryDataModel"));
var customlog = require(path.join(applicationHome,"logger/loggerConfig.js"))('DataEntryModel.js');

//Business Layer
function dataEntryModel(constants) {
    customlog.debug("Inside business layer");
    this.dataModel = new DataEntryDataModel(constants);
}

dataEntryModel.prototype = {
    KYC_DownloadModel : function(group_id,memberId,docType,access_type_id,localMachineIp,callback) {
        this.dataModel.KYC_Download(group_id,memberId,docType,access_type_id,localMachineIp,callback);
    },
    KYC_UpdatingModel : function(groupId,pageName,callback) {
        this.dataModel.KYC_Updating(groupId,pageName,callback);
    },
    KYC_UpdatingMemberModel :function(clientNameID,callback) {
        this.dataModel.KYC_UpdatingMember(clientNameID,callback);
    },
    KycDocumentsModel :function(clientNameID,callback) {
        this.dataModel.KycDocumentsDataModel(clientNameID,callback);
    },
    updateRMApprovalStatusModel : function(clientId,statusId,commentsByRM,groupId,callback){
        this.dataModel.updateRMApprovalStatusDataModel(clientId,statusId,commentsByRM,groupId,callback);
    },
    saveKYC_UpdatingModel:function(tenantId,deletedMembers,deletedMemberRelation,deletedMemberIncome,flagValue,prospectClientPersonal,prospectClientGuarantor,prospectClientFamilyDetail,prospectClient,prospectClientHouseDetail,prospectClientBankDetail,prospectClientOtherMfiDetail,prospectClientOtherDetail,userId,pageName,isSkip,group_id,isRejected,callback) {
        this.dataModel.saveKYC_Updating(tenantId,deletedMembers,deletedMemberRelation,deletedMemberIncome,flagValue,prospectClientPersonal,prospectClientGuarantor,prospectClientFamilyDetail,prospectClient,prospectClientHouseDetail,prospectClientBankDetail,prospectClientOtherMfiDetail,prospectClientOtherDetail,userId,pageName,isSkip,group_id,isRejected,callback);
    },
    KYC_UpdatingNeedImageClarityModel: function (tenantId, groupId, memberNameId, selectedDocTypes, remarks,reasonForHold, callback) {
        this.dataModel.KYC_UpdatingNeedImageClarityDataModel(tenantId, groupId, memberNameId, selectedDocTypes, remarks, reasonForHold,callback);
    },
    saveFOPerformanceTrackByClientModel: function (tenantId,userId,groupId,clientId,pageName,selectedDocTypes,remarks,reasonForHold,callback) {
        this.dataModel.saveFOPerformanceTrackByClientCallDataModel(tenantId,userId,groupId,clientId,pageName,selectedDocTypes,remarks,reasonForHold,callback);
    },
    listCreditReportClientsModel: function(groupid,callback) {
        this.dataModel.listCreditReportClientsDataModel(groupid,callback);
    },
    retrieveHoldClientsModel : function(customerId, customerLevel, clientId, callback){
        this.dataModel.retrieveHoldClientsDataModel(customerId, customerLevel, clientId,callback);
    },
    KYC_UpdatingModelForNMIClients : function(groupId,callback) {
        this.dataModel.KYC_UpdatingForNMIClients(groupId,callback);
    },
    KYC_UpdatingMemberModelForNMIClients :function(clientNameID,callback) {
        this.dataModel.KYC_UpdatingMemberForNMIClients(clientNameID,callback);
    },
    saveKYC_UpdatingModelForNMIClients:function(deletedMembers,deletedMemberRelation,deletedMemberIncome,flagValue,prospectClientPersonal,prospectClientGuarantor,prospectClientFamilyDetail,prospectClient,prospectClientHouseDetail,prospectClientBankDetail,prospectClientOtherMfiDetail,prospectClientOtherDetail,callback) {
        this.dataModel.saveKYC_UpdatingForNMIClients(deletedMembers,deletedMemberRelation,deletedMemberIncome,flagValue,prospectClientPersonal,prospectClientGuarantor,prospectClientFamilyDetail,prospectClient,prospectClientHouseDetail,prospectClientBankDetail,prospectClientOtherMfiDetail,prospectClientOtherDetail,callback);
    },
    listcreditBureauForClientsModel: function(clientId,callback) {
        this.dataModel.listcreditBureauForClientsDataModel(clientId,callback);
    },
    saveCreditBureauForClientsModel: function(clientId,repaymentTrackId,fileName,otherMFINames,otherMFIBalanceAmounts,otherMFIWrittenOffAmounts,userId,remarksForRejection,groupPreviousStatus,callback) {
        this.dataModel.saveCreditBureauForClientsDataModel(clientId, repaymentTrackId, fileName, otherMFINames, otherMFIBalanceAmounts, otherMFIWrittenOffAmounts, userId, remarksForRejection, groupPreviousStatus, callback);//[added fileName][modified by Adarsh]
    },
    callToLDCallTrackModel:function(tenantId,groupId,groupName,centerName,clientId,clientName,numberToCall,officeId,loanAccountId,callCenterExeId,callTrackingId,callback){
        this.dataModel.callToLDCallTrackDataModel(tenantId,groupId,groupName,centerName,clientId,clientName,numberToCall,officeId,loanAccountId,callCenterExeId,callTrackingId,callback) ;
    },
    callToLDCallTrackCallInitialAckModel :function(groupId,clientId,clientName,numberToCall,callCenterExeId,callStatus,fileLocation,callTrackingId,versionNo,callback){
        this.dataModel.callToLDCallTrackCallInitialAckDataModel(groupId,clientId,clientName,numberToCall,callCenterExeId,callStatus,fileLocation,callTrackingId,versionNo,callback) ;
    },
    getLDClientDetailsModel : function(groupId,accountId,callback){
        this.dataModel.getLDClientDetailsDataModel(groupId,accountId,callback);
    },

    getLDClientDetailByClientIdModel : function(groupId,accountId,clientId,callback){
        this.dataModel.getLDClientDetailByClientIdDataModel(groupId,accountId,clientId,callback);
    },
    getLDGroupCaseDetailModel : function(groupId,roleId,callback){
        this.dataModel.getLDGroupCaseDetailDataModel(groupId,roleId,callback);
    },

    leaderSubLeaderFormDownloadModel : function(group_id,loanCount,docType,access_type_id,localMachineIp,callback) {
        this.dataModel.leaderSubLeaderFormDownloadDataModel(group_id,loanCount,docType,access_type_id,localMachineIp,callback);
    },
    getClientDetailsForLeaderSubLeaderModel: function(groupId,callback){
        this.dataModel. getClientDetailsForLeaderSubLeaderDataModel(groupId,callback);
    },
    saveSubGroupDetailsCallModel: function(req, res,groupId,loanCount,callback){
        this.dataModel. saveSubGroupDetailsCallDataModel(req, res,groupId,loanCount,callback);
    },
    saveLeaderDetailsCallModel: function(req, res,groupId,loanCount,callback){
        this.dataModel. saveLeaderDetailsCallDataModel(req, res,groupId,loanCount,callback);
    },
    saveReUpdateDEClientDetailsCallModel:function(groupId,memberId,tenantId,userId,pageName,selectedDocTypes,remarks,reasonForHold,callback){
        this.dataModel.saveReUpdateDEClientDetailsCallDataModel(groupId,memberId,tenantId,userId,pageName,selectedDocTypes,remarks,reasonForHold,callback);
    },
    getClientDetailsForLeaderSubLeaderVerificationModel: function(groupId,roleId,callback){
        this.dataModel. getClientDetailsForLeaderSubLeaderVerificationDataModel(groupId,roleId,callback);
    },
    updateKYCRequestModel : function(userId,clientId, oldMobileNumber, oldLandLineNumber, newMobileNumber, newLandLineNumber, remarks, roleId, operationId, callback) {
        this.dataModel.updateKYCRequestDataModel(userId,clientId, oldMobileNumber, oldLandLineNumber, newMobileNumber, newLandLineNumber, remarks, roleId, operationId, callback);
    },
    updateKYCChangeClientDocAndroidModel:function (captured_image, clientID, doc_type_id, doc_name,loanCount, callback) {
      this.datamodel. updateKYCChangeClientDocAndroidDataModel(captured_image, clientID, doc_type_id, doc_name,loanCount, callback);
    },
    retrieveKYCReUpdateModel : function(groupId, roleId,callback) {
        this.dataModel.retrieveKYCReUpdateDataModel(groupId, roleId,callback);
    },
    retrieveKYCClientDetailsModel : function(groupId, clientId, callback) {
        this.dataModel.retrieveKYCClientDetailsDataModel(groupId, clientId, callback);
    },
    saveKYCUpdateDetailsModel : function(userId,clientId, mobileNumberMatched, landLineNumberMatched, addressMatched, newAddress, pinCode, remarks, updateKYCVerificationStatus, roleId, callback) {
        this.dataModel.saveKYCUpdateDetailsDataModel(userId,clientId, mobileNumberMatched, landLineNumberMatched, addressMatched, newAddress, pinCode, remarks, updateKYCVerificationStatus, roleId, callback);
    },
    checkDuplicateClientNameWithDOBAndGuarantorModel : function(clientName,dateOfBirth,gurantorName,clientId,callback){
        this.dataModel.checkDuplicateClientNameWithDOBAndGuarantorDataModel(clientName,dateOfBirth,gurantorName,clientId,callback);
    },
    checkingHoldHistoryModel : function(clientId,callback){
        this.dataModel.checkingHoldHistoryDataModel(clientId,callback)
    },
    retrieveClientCurrentStatusModel : function(groupId,callback){
        this.dataModel.retrieveClientCurrentStatusDataModel(groupId,callback)
    },

    cronJobBOGroupStatusModel : function(callback){
        console.log("Model : cronJobBOGroupStatusModel");
        this.dataModel.cronJobBOGroupStatusDataModel(callback)
    }
};