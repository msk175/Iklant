module.exports = loanUtilCheckModel;

var path = require('path');
var applicationHome = path.dirname(process.mainModule.filename);
var LoanUtilCheckModelDataModel = require(path.join(applicationHome,"app_modules/data_model/LoanUtilCheckDataModel"));
var customlog = require(path.join(applicationHome,"logger/loggerConfig.js"))('LoanUtilCheckModelModel.js');

//Business Layer
function loanUtilCheckModel(constants) {
    customlog.debug("Inside business layer");
    this.dataModel = new LoanUtilCheckModelDataModel(constants);
}

loanUtilCheckModel.prototype = {
    getLUCGroupsModel: function(officeId, fieldOfficerId, callback){
        this.dataModel.getLUCGroupsDataModel(officeId, fieldOfficerId, callback);
    },

    retrieveLUCAccountsModel: function(groupId, callback){
        this.dataModel.retrieveLUCAccountsDataModel(groupId, callback);
    },

    retrieveLUCCustomerModel: function(accountId, callback){
        this.dataModel.retrieveLUCCustomerDataModel(accountId, callback);
    },

    retrieveClientDetailsForLUCModel: function(clientId, parentAccountId, callback){
        this.dataModel.retrieveClientDetailsForLUCDataModel(clientId, parentAccountId, callback);
    },

    saveLUCDetailsModel: function(lucForClient, callback){
        this.dataModel.saveLUCDetailsDataModel(lucForClient, callback);
    }
}