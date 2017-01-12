var path = require('path');
var rootPath = path.dirname(process.mainModule.filename);
var connectionDataSource = require(path.join(rootPath,"/app_modules/data_model/DataSource"));
var fs = require('fs');
var customlog = require(path.join(rootPath,"logger/loggerConfig.js"))('reports: datamodelReports.js');

dataModelReports = function() {

}

dataModelReports.prototype = {

    loadReportsDataModel : function(category, roleId, callback){
        try{
            var reportsId = new Array();
            var reportsName = new Array();
            var storedProcedureName = new Array();
            var reportQuery = "SELECT report_id, report_name,procedure_name FROM iklant_reports WHERE report_category = " + category + " AND report_state = 1 AND (role_id IN(" + roleId + ") OR role_id LIKE '%"+roleId+"%')";
            connectionDataSource.getConnection(function (connectionObj){
                connectionObj.query(reportQuery,function(error, result){
                    connectionDataSource.releaseConnectionPool(connectionObj);
                    if(error){
                        customlog.error("Error while executing " + reportQuery + " in loadReportsDataModel "+error);
                        callback("failure");
                    }
                    else{
                        for(var i=0; i<result.length;i++){
                            reportsId[i] = result[i].report_id;
                            reportsName[i] = result[i].report_name;
                            storedProcedureName[i] = result[i].procedure_name;
                        }
                        callback("success", reportsId, reportsName,storedProcedureName);
                    }
                });
            });
        }
        catch(e){
            customlog.error("Exception in loadReportsDataModel "+e);
            callback('failure');
        }
    },

    loadReportByIdDataModel : function(reportId, callback){
        try{
            var reportFilterId = new Array();
            var reportFilterValue = new Array();
            var generationType = 0 ;
            var filterQuery = "SELECT report_filters,is_background FROM iklant_reports WHERE report_id = " + reportId;
            connectionDataSource.getConnection(function (connectionObj){
                connectionObj.query(filterQuery,function(error, result){
                    if(error){
                        connectionDataSource.releaseConnectionPool(connectionObj);
                        customlog.error("Error while executing " + filterQuery + " in loadReportByIdDataModel "+error);
                        callback("failure");
                    }
                    else{
                        generationType = result[0].is_background;
                        var reportFilter = result[0].report_filters.split(",");
                        var reportQuery = "SELECT lookup_id,lookup_value FROM iklant_lookup_value WHERE lookup_id IN (" + reportFilter + ") ORDER BY lookup_id";
                        connectionObj.query(reportQuery,function(err, results){
                            connectionDataSource.releaseConnectionPool(connectionObj);
                            if(err){
                                customlog.error("Error while executing " + reportQuery + " in loadReportByIdDataModel "+err);
                                callback("failure");
                            }
                            else{
                                for(var i=0; i<results.length;i++){
                                    reportFilterId[i] = results[i].lookup_id;
                                    reportFilterValue[i] = results[i].lookup_value;
                                }
                            }
                            callback("success", generationType,reportFilterId, reportFilterValue);
                        });
                    }
                });
            });
        }
        catch(e){
            customlog.error("Exception in loadReportByIdDataModel "+e);
            callback('failure');
        }
    }
}

exports.datamodelReports = dataModelReports;

