module.exports = shortMessagingServiceDataModel;

var path = require('path');
var rootPath = path.dirname(process.mainModule.filename);
var dbTableName = require(path.join(rootPath,"properties.json"));

var connectionDataSource = require(path.join(rootPath,"app_modules/data_model/DataSource"));



var customlog = require(path.join(rootPath,"logger/loggerConfig.js"))('ShortMessagingDataModel.js');
//var excelUtility = require(path.join(rootPath,"app_modules/utils/ExcelReportUtility"));


function shortMessagingServiceDataModel(constants,smsConstants) {
    this.constants = constants;
    this.smsConstants = smsConstants;
    customlog.debug("Inside short messaging Data Access Layer of ShortMessagingDataModel");
}

shortMessagingServiceDataModel.prototype = {
    getAlertStatusDataModel: function(smsModuleId,callback) {
        var self = this;
        var status = false;
        var statusQuery = "SELECT sms_status FROM `"+dbTableName.smsManagement+"` WHERE `sms_management_id` = "+smsModuleId;
        connectionDataSource.getConnection(function (clientConnect) {
            clientConnect.query(statusQuery, function (err, result) {
                connectionDataSource.releaseConnectionPool(clientConnect);
                if(err) {
                    customlog.error("statusQuery: ",statusQuery);
                    customlog.error("Error occured in getLoanDisbursementAlertStatusDataModel: ",err);
                    callback("failure");
                }else{
                    if(result.length > 0){
                        if(result[0].sms_status === self.smsConstants.getEnabledStatus()){
                            status = true;
                        }else if(result[0].sms_status === self.smsConstants.getDisabledStatus()) {
                            status = false;
                        }
                    }
                    callback("success",status);
                }
            });
        });
    },
    logSmsDataModel: function(smsArray) {
        var self = this;
        var ExecutionProgress = require(path.join(rootPath,"app_modules/dto/common/ExecutionProgress"));
        var execn = new ExecutionProgress();
        connectionDataSource.getConnection(function (clientConnect) {
            self.smsLogging(execn,smsArray,clientConnect);
        });

    },
    smsLogging: function(execn,smsArray,clientConnect) {
        var self = this;
        customlog.debug("execn: ",execn);
        customlog.debug("smsArray: ",smsArray[execn.getCurrentStatus()]);
        if(execn.getCurrentStatus() < smsArray.length-1) {
            var msgInsertQuery = "INSERT INTO `"+dbTableName.smsLog+"` (`sms_state_id`,`sms_subject`,`sms_text`,`mobile_number`,`created_date`) " +
                "VALUES ("+smsArray[execn.getCurrentStatus()].stateId+",'"+smsArray[execn.getCurrentStatus()].subject+"'," +
                "'"+smsArray[execn.getCurrentStatus()].text+"',"+smsArray[execn.getCurrentStatus()].mobileNumber+"," +
                "NOW() + INTERVAL 5 HOUR + INTERVAL 30 MINUTE)";
            clientConnect.query(msgInsertQuery, function (err) {
                if(err) {
                    connectionDataSource.releaseConnectionPool(clientConnect);
                    customlog.error("msgInsertQuery: ",msgInsertQuery);
                    customlog.error("Error occured in smsLogging: ",err);
                }else{
                    execn.incrementProgress();
                    self.smsLogging(execn,smsArray,clientConnect);
                }
            });
        }else {
            connectionDataSource.releaseConnectionPool(clientConnect);
        }
    }
}