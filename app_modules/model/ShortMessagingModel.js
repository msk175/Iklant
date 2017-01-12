module.exports = shortMessagingServiceModel;

var path = require('path');
var applicationHome = path.dirname(process.mainModule.filename);
var ShortMessagingDataModel = require(path.join(applicationHome,"app_modules/data_model/ShortMessagingDataModel"));
var customlog = require(path.join(applicationHome,"logger/loggerConfig.js"))('ShortMessagingModel.js');

//Business Layer
function shortMessagingServiceModel(constants,smsConstants) {
    customlog.debug("Inside short messaging model business layer");
    this.dataModel = new ShortMessagingDataModel(constants,smsConstants);
}

shortMessagingServiceModel.prototype = {
    getAlertStatusModel: function(smsModuleId,callback) {
        this.dataModel.getAlertStatusDataModel(smsModuleId,callback);
    },
    logSmsModel: function(smsArray) {
        this.dataModel.logSmsDataModel(smsArray);
    }
}