module.exports = accountingModel;

var path = require('path');
var applicationHome = path.dirname(process.mainModule.filename);
var AccountingDataModel = require(path.join(applicationHome,"app_modules/data_model/AccountingDataModel"));
var customlog = require(path.join(applicationHome,"logger/loggerConfig.js"))('AccountingModel.js');

//Business Layer
function accountingModel(constants) {
    customlog.debug("Inside business layer");
    this.dataModel = new AccountingDataModel(constants);
}

accountingModel.prototype = {
    getTransactionHistoryModel : function(fromDate,toDate,officeId,reportId, userId,callBack){
        this.dataModel.getTransactionHistoryCall(fromDate,toDate,officeId,reportId,userId,callBack);
    },
    // Added by chitra 003 [Accounting Bank Reconciliation]
    getLastDateOfMonthModel : function(monthIndex,minFinYear,maxFinYear,callback){
        this.dataModel.getLastDateOfMonthDataModel(monthIndex,minFinYear,maxFinYear,callback);
    },
    // Added by Chitra
    retrieveLedgerDetailsModel : function(tenantId,officeId,ledger_name,userId,callback) {
        this.dataModel.retrieveLedgerDetailsDataModel(tenantId,officeId,ledger_name,userId,callback);
    },
    getActiveFinYearModel: function(callback) {
        this.dataModel.getActiveFinYear(callback);
    },

    getTrailBalanceResultModel: function(finYear,fromDate,toDate,mfiOperation,accOperation,callBack){
        this.dataModel.getTrailBalanceResultDataModel(finYear,fromDate,toDate,mfiOperation,accOperation,callBack);
    },

    getLedgerTransactionResultModel: function(finYear,fromDate,toDate,mfiOperation,accOperation,glcode,userId,callBack){
        this.dataModel.getLedgerTransactionResultDataModel(finYear,fromDate,toDate,mfiOperation,accOperation,glcode,userId,callBack);
    }
}