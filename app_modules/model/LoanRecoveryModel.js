module.exports = loanRecoveryModel;

var path = require('path');
var applicationHome = path.dirname(process.mainModule.filename);
var LoanRecoveryDataModel = require(path.join(applicationHome,"app_modules/data_model/LoanRecoveryDataModel"));
var customlog = require(path.join(applicationHome,"logger/loggerConfig.js"))('LoanRecoveryModel.js');

//Business Layer
function loanRecoveryModel(constants) {
    customlog.debug("Inside business layer");
    this.dataModel = new LoanRecoveryDataModel(constants);
}

loanRecoveryModel.prototype = {
    //Added by Sathish Kumar M 008 For Loan Recovery Module
    getClientPaymentsDetailModel: function(paymentCollectionId,callback){
        this.dataModel.getClientPaymentsDetailDataModel(paymentCollectionId,callback);
    },
    getLRBranchCallModel: function(userId, callback){
        this.dataModel.getLRBranchCallModelDataModel(userId, callback);
    },
    getLRGroupDetailModel: function(officeValue,userId1, callback){
        this.dataModel.getLRGroupDetailDataModel(officeValue,userId1, callback);
    },
    getLRFoDetailCallModel: function (officeValue, callback){
        this.dataModel.getLRFoDetailDataModel(officeValue, callback);
    },
    assignGroupToFOModel: function(customerId,loanRecoveryOfficer,iklantGroupId,callback){
        this.dataModel.assignGroupToFODataModel(customerId,loanRecoveryOfficer,iklantGroupId,callback);
    },
    getCurrentPositionModel : function(userId,callback){
        this.dataModel.getCurrentPositionDataModel(userId,callback);
    }
};