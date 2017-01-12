module.exports = userManagementModel;

var path = require('path');
var applicationHome = path.dirname(process.mainModule.filename);
var UserManagementDataModel = require(path.join(applicationHome,"app_modules/data_model/UserManagementDataModel"));
var customlog = require(path.join(applicationHome,"logger/loggerConfig.js"))('UserManagementModel.js');

//Business Layer
function userManagementModel(constants) {
    customlog.debug("Inside business layer");
    this.dataModel = new UserManagementDataModel(constants);
}

userManagementModel.prototype = {
    saveNewOfficeModel: function(tenantId,userId,officeObj,callback) {
        this.dataModel.saveNewOfficeDatamodel(tenantId,userId,officeObj,callback);
    },
    manageUsersModel : function(manageUsersObject,callback) {
         this.dataModel.manageUsers(manageUsersObject,callback);
    },
    assignRolesModel : function(tenantID,callback) {
         this.dataModel.assignRoles(tenantID,callback);
    },
    saveAssignRolesModel : function(assignRolesObject,callback) {
         this.dataModel.saveAssignRoles(assignRolesObject,callback);
    },
    saveManageRolesModel :function(manageRolesObj,callback) {
         this.dataModel.saveManageRoles(manageRolesObj,callback);
    },
    saveUserModel: function (tenantId, officeId, userName, password, contactNumber, emailId, roleIdArray, userId, imeiNumberId, callback) {
         this.dataModel.saveUserDatamodel(tenantId, officeId, userName, password, contactNumber, emailId, roleIdArray, userId, imeiNumberId, callback);
    },
    //   Dhinakaran
    updateUserModel: function (tenantId, currentUserId, officeId, userName, password, contactNumber, emailId, roleId, userId, imeiNumberId, callback) {
         this.dataModel.updateUserDatamodel(tenantId, currentUserId, officeId, userName, password, contactNumber, emailId, roleId, userId, imeiNumberId, callback);
    },
    populateUserDetailsModel: function(tenantId,userId,callback) {
         this.dataModel.populateUserDetailsDatamodel(tenantId,userId,callback);
    },
    deleteUserModel  : function(userid,tenantId,callback){
         this.dataModel.deleteUserDataModel(userid,tenantId,callback);
    },
    //Manage Office
    saveOfficeModel: function(tenantId,officeName,officeShortName,officeAddress,userId,stateId,callback) {
         this.dataModel.saveOfficeDatamodel(tenantId,officeName,officeShortName,officeAddress,userId,stateId,callback);
    },

    updateOfficeModel: function(tenantId,officeId,officeName,officeShortName,officeAddress,userId,callback) {
         this.dataModel.updateOfficeDatamodel(tenantId,officeId,officeName,officeShortName,officeAddress,userId,callback);
    },
    populateOfficeDetailsModel: function(tenantId,officeId,callback) {
         this.dataModel.populateOfficeDetailsDatamodel(tenantId,officeId,callback);
    },
    deleteOfficeModel: function(officeid,tenantId,callback){
         this.dataModel.deleteOfficeDataModel(officeid,tenantId,callback);
    },
    populateRoleDetailsModel: function(tenantId,roleId,callback) {
         this.dataModel.populateRoleDetailsDatamodel(tenantId,roleId,callback);
    },

    updateRoleModel: function(tenantId,userId,roleId,roleName,roleDescription,insertFlag,deleteFlag,previouslySelectedOperationlist,selectedOperation,callback) {
         this.dataModel.updateRoleDatamodel(tenantId,userId,roleId,roleName,roleDescription,insertFlag,deleteFlag,previouslySelectedOperationlist,selectedOperation,callback);
    },

    deleteRoleModel: function(tenantId,roleId,callback) {
         this.dataModel.deleteRoleDatamodel(tenantId,roleId,callback);
    },

    checkForRoleIsAssignedModel: function(tenantId,roleId,callback) {
         this.dataModel.checkForRoleIsAssignedDatamodel(tenantId,roleId,callback);
    },
    retrieveUserDetailsModel: function (userName, emailId, callback){
        this.dataModel.retrieveUserDetailsDataModel(userName, emailId, callback);
    },
    updateUserDetailsModel: function (user_id, userName, oldPassword, newPassword, callback){
        this.dataModel.updateUserDetailsDataModel(user_id, userName, oldPassword, newPassword, callback);
    },
    validateOldPasswordModel : function (userId,encrptedOldPassword,callback){
        this.dataModel.validateoldPasswordDatamodel(userId,encrptedOldPassword,callback);
    },
    //Added by SathishKumar 008[Change Password]
    changePasswordCall : function(userId,userName,encyptedOldPassword,encyptedNewPassword, callback){
        this.dataModel.changePasswordDataModelCall(userId,userName,encyptedOldPassword,encyptedNewPassword,callback);
    },
    encryptUserDetailsModel : function (userName,callback){
        this.dataModel.encryptUserDetailsDataModel(userName,callback);
    },
    updateCustomUserDetailsModel: function (user_id, userName, newPassword, callback){
        this.dataModel.updateCustomUserDetailsDataModel(user_id, userName, newPassword, callback);
    },
    listExistingReportsModel: function(callback) {
        this.dataModel.listExistingReportsDataModel(callback);
    },

    showAddReportViewModel: function(callback) {
        this.dataModel.showAddReportViewDataModel(callback);
    },

    createDynamicReportModel: function(reportData,callback) {
        this.dataModel.createDynamicReportDataModel(reportData,callback);
    }
}