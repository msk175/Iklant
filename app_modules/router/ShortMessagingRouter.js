module.exports = shortMessagingService;
var path = require('path');
var rootPath = path.dirname(process.mainModule.filename);
var props = require(path.join(rootPath,"properties.json"));
mifosServiceIP = props.mifosServiceIp;
mifosPort = props.mifosPort;
GPSPort = props.GPSPort;
iklantPort = props.iklantPort;
//var loanDisbursementDTOpath = path.join(rootPath,"app_modules/dto/loan_disbursement");
var commonDTO = path.join(rootPath,"app_modules/dto/common");
//var dateUtils = require(path.join(rootPath,'app_modules/utils/DateUtils'));
var stringUtils = require(path.join(rootPath,"/app_modules/utils/StringUtils"));
var SmsConstants = require(path.join(rootPath,"app_modules/dto/sms/SmsConstants"));
var rest = require("./rest.js");
var http = require('http');
var https = require('https');

var ShortMessagingServiceModel = require(path.join(rootPath,"app_modules/model/ShortMessagingModel"));

var customlog = require(path.join(rootPath,"logger/loggerConfig.js"))('ShortMessagingRouter.js');


function shortMessagingService(constants) {
    customlog.debug("Inside ShortMessagingRouter");
    var smsConstants = new SmsConstants();
    this.smsConstants = smsConstants;
    this.constants = constants;
    this.model = new ShortMessagingServiceModel(constants,smsConstants);
}

shortMessagingService.prototype = {
    //Ezra Johnson
    getAlertStatus: function(smsModuleId,callback) {
        this.model.getAlertStatusModel(smsModuleId,callback)
    },
    sendLoanDisbursementSMS: function(totalInstallments, totalAmountSanctioned, groupName, clientAmountArray, clientNamesArray
                                        ,mobileNumberArray,selectedClients){
        var self = this;
        var SmsBO = require(path.join(rootPath,"/app_modules/dto/sms/SmsBO"));
        var textMessageBO;
        customlog.debug("totalInstallments: ",totalInstallments);
        customlog.debug("totalAmountSanctioned: ",totalAmountSanctioned);
        customlog.debug("groupName: ",groupName);
        customlog.debug("clientAmountArray: ",clientAmountArray);
        customlog.debug("clientNamesArray: ",clientNamesArray);

        var disbConfirmationMessage = "Congratz {0} you have been disbursed Loan from " +
            "Apex Abishek finance Ltd in group {1} with Rs.{2} for {3} months. Your disbursed amount is {4}";
        var msg;
        var smsArray = [];
        customlog.debug("mobileNumberArray: ",mobileNumberArray);
        for(var i=0; i<clientNamesArray.length; i++){
            // Check whether it is a Mobile number
            if(mobileNumberArray[i].length > 9 && selectedClients[i] === 'true'){
                textMessageBO = new SmsBO();
                msg = stringUtils.format(disbConfirmationMessage,clientNamesArray[i],groupName,
                    totalAmountSanctioned,totalInstallments,clientAmountArray[i]);
                customlog.debug(msg);

                textMessageBO.setStateId(self.smsConstants.getQueuedStatus());
                textMessageBO.setSubject("Loan Disbursement");
                textMessageBO.setText(msg);
                textMessageBO.setMobileNumber(mobileNumberArray[i]);        //yet to get the mobile number!

                customlog.debug("textMessageBO",textMessageBO);
                smsArray.push(textMessageBO);
            }
        }
        self.logSms(smsArray);
    },
    logSms: function(smsArray) {
        this.model.logSmsModel(smsArray)
    },
    sendPaymentCollectionSMS: function(paymentCollectionsArray){
        var self = this;
        var SmsBO = require(path.join(rootPath,"/app_modules/dto/sms/SmsBO"));
        var textMessageBO;
        customlog.debug("totalInstallments: ",paymentCollectionsArray);

        var paymentReceivedMessage = "Dear {0}, Your EMI amount {1} has been collected by {2}, " +
            "field officer on {3} -	Apex Abishek"

        var msg;
        var smsArray = [];
        for(var i=0; i<paymentCollectionsArray.length; i++){
            // Check whether it is a Mobile number
            if(paymentCollectionsArray[i].getMobileNumber().length > 9){
                textMessageBO = new SmsBO();

                msg = stringUtils.format(paymentReceivedMessage,paymentCollectionsArray[i].getClientName(),
                        paymentCollectionsArray[i].getDueAmount(), paymentCollectionsArray[i].getFoName(),
                    paymentCollectionsArray[i].getReceivedDate());
                customlog.debug(msg);

                textMessageBO.setStateId(self.smsConstants.getQueuedStatus());
                textMessageBO.setSubject("Payment Collected");
                textMessageBO.setText(msg);
                textMessageBO.setMobileNumber(paymentCollectionsArray[i].getMobileNumber());

                customlog.debug("textMessageBO",textMessageBO);
                smsArray.push(textMessageBO);
            }
        }
        self.logSms(smsArray);
    }
}