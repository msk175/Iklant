module.exports = coordinatorVerificationModel;

var path = require('path');
var applicationHome = path.dirname(process.mainModule.filename);
var CoordinatorVerificationDataModel = require(path.join(applicationHome,"app_modules/data_model/CoordinatorVerificationDataModel"));
var customlog = require(path.join(applicationHome,"logger/loggerConfig.js"))('CoordinatorVerificationModel.js');

//Business Layer
function coordinatorVerificationModel(constants) {
    customlog.debug("Inside business layer");
    this.dataModel = new CoordinatorVerificationDataModel(constants);
}

coordinatorVerificationModel.prototype = {

    getGroupsForKYCVerificationModel: function(tenantId,userId,roleId,officeId,requestedTab,callback) {
        this.dataModel.getGroupsForKYCVerificationDataModel(tenantId,userId,roleId,officeId,requestedTab,callback);
    },
    getClientListForKYCVerifcationModel : function(groupId,callback){
        this.dataModel.getClientListForKYCVerifcationDataModel(groupId,callback);
    },
    getKYCDocumentsForClientModel : function(clientId,documentId,callback){
        this.dataModel.getKYCDocumentsClientDataModel(clientId,documentId,callback);
    },
    updateVerificationClientStatusModel : function(userId,clientId,rejectedDocs,rejectedDocsRemarks,groupId,callback){
        this.dataModel.updateVerificationClientStatusDataModel(userId,clientId,rejectedDocs,rejectedDocsRemarks,groupId,callback);
    },
    getResolvedKYCDocumentsModel :function(clientId,callback){
        this.dataModel.getResolvedKYCDocumentsDataModel(clientId,callback);
    },
    groupCountDashBoardModel : function(officeId,roleId,callback){

        this.dataModel.groupCountDashBoardDataModel(officeId,roleId,callback);
    }

};

