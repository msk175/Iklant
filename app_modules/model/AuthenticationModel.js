module.exports = authenticationModel;

var path = require('path');
var applicationHome = path.dirname(process.mainModule.filename);
var AuthenticationDataModel = require(path.join(applicationHome,"app_modules/data_model/AuthenticationDataModel"));
var customlog = require(path.join(applicationHome,"logger/loggerConfig.js"))('AuthenticationModel.js');

//Business Layer
function authenticationModel(constants) {
    customlog.debug("Inside business layer");
    this.dataModel = new AuthenticationDataModel(constants);
}

authenticationModel.prototype = {
    authLoginModel: function(userName,password,callback) {
        this.dataModel.authLoginAccess(userName,password,callback);
    }
}