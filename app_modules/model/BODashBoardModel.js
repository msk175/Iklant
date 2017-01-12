module.exports = boDashBoardModel;

var path = require('path');
var applicationHome = path.dirname(process.mainModule.filename);
var BODashBoardDataModel = require(path.join(applicationHome,"app_modules/data_model/BODashBoardDataModel"));
var customlog = require(path.join(applicationHome,"logger/loggerConfig.js"))('BODashBoardModel.js');

//Business Layer
function boDashBoardModel(constants) {
    customlog.debug("Inside boDashBoardModel business layer");
    this.dataModel = new BODashBoardDataModel(constants);
}

boDashBoardModel.prototype = {

    getGroupCountModel : function(toDate,callback){
        this.dataModel.getGroupCountDataModel(toDate,callback);
    },
    getGroupCountBranchWiseModel : function(regionalOfficeId,toDate,callback){
        this.dataModel.getGroupCountBranchWiseDataModel(regionalOfficeId,toDate,callback);
    },
    getGroupStatusCountForSelectedBranchModel : function(branchOfficeId,toDate,callback) {
        this.dataModel.getGroupStatusCountForSelectedBranchDataModel(branchOfficeId,toDate,callback);
    },
    getGroupListForSelectedStatusModel : function(branchOfficeId,reportStatus,groupStatus,toDate,callback) {
        this.dataModel.getGroupListForSelectedStatusModel(branchOfficeId,reportStatus,groupStatus,toDate,callback);
    },
    deoListForClientModel : function(clientId,callback){
        this.dataModel.deoListForClientDataModel(clientId,callback);
    },
    getRegionalWiseGroupCountSummaryModel : function(fromDate,toDate,callback){
        this.dataModel.getRegionalWiseGroupCountSummaryDataModel(fromDate,toDate,callback);
    },
    getDateWiseGroupCountModel : function(fromDate,toDate,callback){
        this.dataModel.getDateWiseGroupCountDataModel(fromDate,toDate,callback);
    },
    deoWiseListModel : function(fromDate,toDate ,callback){
        this.dataModel.deoWiseListDataModel(fromDate,toDate ,callback);
    }

};
