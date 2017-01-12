module.exports = loanDisbursementModel;

var path = require('path');
var applicationHome = path.dirname(process.mainModule.filename);
var LoanDisbursementDataModel = require(path.join(applicationHome,"app_modules/data_model/LoanDisbursementDataModel"));
var customlog = require(path.join(applicationHome,"logger/loggerConfig.js"))('LoanDisbursementModel.js');

//Business Layer
function loanDisbursementModel(constants) {
    customlog.debug("Inside business layer");
    this.dataModel = new LoanDisbursementDataModel(constants);
}

loanDisbursementModel.prototype = {
    // Added by Chitra [Documents shouldn't generated for rejected clients]
    getActiveClientDetailsByIklantGroupIdModel:function(group_id,callBack){
        this.dataModel.getActiveClientDetailsByIklantGroupIdDataModel(group_id,callBack);
    },
    changeStatusIdModel : function(groupId,rejected_id_array,callback) {
        this.dataModel.changeStatusIdDataModel(groupId,rejected_id_array,callback);
    },
    fileUploadForLoanSanctionModel : function(clientid,groupCode,mifosGlobalAccNo,docLanguage,bcOfficeId,callback) {
        this.dataModel.fileUploadForLoanSanction(clientid,groupCode,mifosGlobalAccNo,docLanguage,bcOfficeId,callback);
    },
    getClientMobileNumberModel: function(clientGlobalArray,callback) {
        this.dataModel.getClientMobileNumberDataModel(clientGlobalArray,callback);
    },
    changeMifosGroupAddressModel: function(iklantGroupId,callback){
        this.dataModel.changeMifosGroupAddressDataModel(iklantGroupId,callback)
    }
}