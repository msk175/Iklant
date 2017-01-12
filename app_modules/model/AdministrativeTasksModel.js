module.exports = administrativeTasksModel;

var path = require('path');
var applicationHome = path.dirname(process.mainModule.filename);
var AdministrativeTasksDataModel = require(path.join(applicationHome,"app_modules/data_model/AdministrativeTasksDataModel"));
var customLog = require(path.join(applicationHome,"logger/loggerConfig.js"))('AdministrativeTasksModel.js');

//Business Layer
function administrativeTasksModel(constants) {
    customLog.debug("Inside business layer");
    this.dataModel = new AdministrativeTasksDataModel(constants);
}

administrativeTasksModel.prototype = {

    getFundCodeModel: function(callback){
        this.dataModel.getFundCodeDataModel(callback);
    },

    getFundDetailsModel: function(callback){
        this.dataModel.getFundDetailsDataModel(callback);
    },

    getSelectedFundDetailsModel: function(selectedFundId,callback){
        this.dataModel.getSelectedFundDetailsDataModel(selectedFundId,callback);
    },

    saveFundCodeModel: function(fundCode,callback){
        this.dataModel.saveFundCodeDataModel(fundCode,callback);
    },

    //Added By Sathish Kumar M 008n For GL Creations
    retriveGeneralLedgerParentModel: function (callback){
        this.dataModel.retriveGeneralLedgerParentDataModel(callback);
    },
    retriveFirstchildGLParentModel: function (selectedGLParentCode,callback){
        this.dataModel.retriveFirstchildGLParentDataModel(selectedGLParentCode,callback);
    },
    retriveSecondchildGLParentModel: function (selectedGLFirtChildCode,callback){
        this.dataModel.retriveSecondchildGLParentDataModel(selectedGLFirtChildCode,callback);
    },
    getGLDetailsModel: function(callback){
        this.dataModel.getGLDetailsDataModel(callback);
    },
    updateGLModel: function(coaCodeId,coaCodeName,callback){
        this.dataModel.updateGLDataModel(coaCodeId,coaCodeName,callback)
    }
    //Ended By Sathish Kumar M 008 For GL Creations

};