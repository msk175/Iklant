module.exports = accounting;
var path = require('path');
var rootPath = path.dirname(process.mainModule.filename);
var props = require(path.join(rootPath,"properties.json"));
var AccountingModel = require(path.join(rootPath,"app_modules/model/AccountingModel"));

var customlog = require(path.join(rootPath,"logger/loggerConfig.js"))('AccountingRouter.js');
var dateUtils = require(path.join(rootPath,"app_modules/utils/DateUtils"));
var commonDTO = path.join(rootPath,"app_modules/dto/common");
var DayBookHolder = require(path.join(rootPath,"app_modules/dto/accounting/DayBookHolder"));
var PDFDocument = require('pdfkit');


mifosServiceIP = props.mifosServiceIp;
mifosPort = props.mifosPort;
GPSPort = props.GPSPort;
microFinanceGlcode = props.microFinanceGlcode;
iklantPort = props.iklantPort;
var officeHierarchyNameArray = new Array('Head Office','Regional Office','Divisional Office','Area Office','Branch Office');


function accounting(constants) {
    customlog.debug("Inside Router");
    this.model = new AccountingModel(constants);
    this.constants = constants;
}

accounting.prototype = {
    accountsMenu : function(req,res) {
        var self = this;
        if(typeof (req.session.tenantId) == 'undefined' || typeof (req.session.userId) == 'undefined') {
            res.redirect(props.contextPath+'/client/ci/login');
        }else{
            var constantsObj = this.constants;
            customlog.info("sessionId"+req.session.sessionId);
            res.render("accounting/AccountsMenu",{roleId:req.session.roleId,constantsObj:constantsObj,sessionId:req.session.sessionId, contextPath:props.contextPath});
        }
    },
    journalTransaction : function(req,res) {
        var self = this;
        var rest = require("./rest.js");
        var http = require('http');
        var https = require('https');
        customlog.info(req.session.mifosCookie);
        var postheaders = {
            'Content-Type' : 'application/json',
            'Cookie' : req.session.mifosCookie
        };
        var options = {
            host: mifosServiceIP,
            port: mifosPort,
            path: "/mfi/api/accounting/journal/load.json",
            method: 'GET',
            headers : postheaders
        };
        rest.getJSON(options,function(statuscode,result,headers){
            customlog.info("statuscode:"+statuscode);
            customlog.info("result:" + result.status);
            if(statuscode == 302){
                res.redirect(props.contextPath+'/client/ci/logout');
            }else if(result.status == "success"){
                //var activityDetails = new Array(iklantPort, req.session.tenantId, req.session.userId, req.session.userName, req.originalUrl, req.connection.remoteAddress, "routAccounting.js", "journalTransaction", "success", "journalTransaction", "journalTransaction");
                //self.commonRouter.insertActivityLogModel(activityDetails);
                var fromOfficeListId 	= new Array();
                var subOfficeListId 	= new Array();
                var fromOfficeListName 	= new Array();
                var subOfficeListName 	= new Array();
                var mainAccountListGlName 	= new Array();
                var mainAccountListGlCode 	= new Array();
                var mainAccountOfficeListGlCode 	= new Array();
                var subAccountListGlName 	= new Array();
                var subAccountListGlCode 	= new Array();
                var subAccountOfficeListGlCode 	= new Array();

                var headOfficeNameVar = new Array();
                var headOfficeId = new Array();

                var regionalOfficeNameVar = new Array();
                var regionalOfficeId = new Array();

                var divisionalOfficeNameVar = new Array();
                var divisionalOfficeId = new Array();

                var areaOfficeNameVar = new Array();
                var areaOfficeId = new Array();

                var branchOfficeNameVar = new Array();
                var branchOfficeId = new Array();

                var AccountingDetails = require(path.join(rootPath,"app_modules/dto/accounting/AccountingDetails"));
                var AccountingDetails = new AccountingDetails();
                this.AccountingDetails = AccountingDetails;
                var AccountingDetails = this.AccountingDetails;
                AccountingDetails.setTransactionType(result.transactionDetails.transactionType);
                if(result.transactionDetails.officeHierarchyByLevelDto.headOffices != null){
                    for(var i=0;i<result.transactionDetails.officeHierarchyByLevelDto.headOffices.length;i++){
                        headOfficeId[i] = result.transactionDetails.officeHierarchyByLevelDto.headOffices[i].globalNum;
                        headOfficeNameVar[i] = result.transactionDetails.officeHierarchyByLevelDto.headOffices[i].name;
                    }
                }
                AccountingDetails.setHeadOfficeId(headOfficeId);
                AccountingDetails.setHeadOfficeNameVar(headOfficeNameVar);
                if(result.transactionDetails.officeHierarchyByLevelDto.regionalOffices != null){
                    for(var i=0;i<result.transactionDetails.officeHierarchyByLevelDto.regionalOffices.length;i++){
                        regionalOfficeId[i] = result.transactionDetails.officeHierarchyByLevelDto.regionalOffices[i].globalNum;
                        regionalOfficeNameVar[i] = result.transactionDetails.officeHierarchyByLevelDto.regionalOffices[i].name;
                    }
                }
                AccountingDetails.setRegionalOfficeId(regionalOfficeId);
                AccountingDetails.setRegionalOfficeNameVar(regionalOfficeNameVar);
                if(result.transactionDetails.officeHierarchyByLevelDto.divisionalOffices != null){
                    for(var i=0;i<result.transactionDetails.officeHierarchyByLevelDto.divisionalOffices.length;i++){
                        divisionalOfficeId[i] = result.transactionDetails.officeHierarchyByLevelDto.divisionalOffices[i].globalNum;
                        divisionalOfficeNameVar[i] = result.transactionDetails.officeHierarchyByLevelDto.divisionalOffices[i].name;
                    }
                }
                AccountingDetails.setDivisionalOfficeId(divisionalOfficeId);
                AccountingDetails.setDivisionalOfficeNameVar(divisionalOfficeNameVar);
                if(result.transactionDetails.officeHierarchyByLevelDto.areaOffices != null){
                    for(var i=0;i<result.transactionDetails.officeHierarchyByLevelDto.areaOffices.length;i++){
                        areaOfficeId[i] = result.transactionDetails.officeHierarchyByLevelDto.areaOffices[i].globalNum;
                        areaOfficeNameVar[i] = result.transactionDetails.officeHierarchyByLevelDto.areaOffices[i].name;
                    }
                }
                AccountingDetails.setAreaOfficeId(areaOfficeId);
                AccountingDetails.setAreaOfficeNameVar(areaOfficeNameVar);
                if(result.transactionDetails.officeHierarchyByLevelDto.branchOffices != null){
                    for(var i=0;i<result.transactionDetails.officeHierarchyByLevelDto.branchOffices.length;i++){
                        branchOfficeId[i] = result.transactionDetails.officeHierarchyByLevelDto.branchOffices[i].globalNum;
                        branchOfficeNameVar[i] = result.transactionDetails.officeHierarchyByLevelDto.branchOffices[i].name;
                    }
                }
                AccountingDetails.setBranchOfficeId(branchOfficeId);
                AccountingDetails.setBranchOfficeNameVar(branchOfficeNameVar);


                if( dateUtils.convertToYMDFormat(dateUtils.convertMillisecToMifosDateFormatStr(result.transactionDetails.transactionDate))  <= result.transactionDetails.financialYearEndDate ){
                    AccountingDetails.setFinancialYearEndvar(dateUtils.convertMillisecToMifosDateFormatStr(result.transactionDetails.transactionDate));
                }else{
                    AccountingDetails.setFinancialYearEndvar(dateUtils.convertToDateWithSlash(result.transactionDetails.financialYearEndDate));
                }
                AccountingDetails.setTransactionDate(dateUtils.convertMillisecToMifosDateFormatStr(result.transactionDetails.transactionDate));
                AccountingDetails.setFinancialYearStartvar(dateUtils.convertToDateWithSlash(result.transactionDetails.financialYearStartDate));
                if(result.transactionDetails.mainAccountOfficeList != null){
                    for(var i=0;i<result.transactionDetails.mainAccountOfficeList.length;i++){
                        fromOfficeListId[i] = result.transactionDetails.mainAccountOfficeList[i].globalNum;
                        fromOfficeListName[i] = result.transactionDetails.mainAccountOfficeList[i].name;
                    }
                }
                AccountingDetails.setMainAccountOfficeHierarchyId(fromOfficeListId);
                AccountingDetails.setMainAccountOfficeHierarchyvar(fromOfficeListName);
                if(result.transactionDetails.subAccountOfficeList != null){
                    for(var i=0;i<result.transactionDetails.subAccountOfficeList.length;i++){
                        subOfficeListId[i] = result.transactionDetails.subAccountOfficeList[i].globalNum;
                        subOfficeListName[i] = result.transactionDetails.subAccountOfficeList[i].name;
                    }
                }
                AccountingDetails.setSubAccountOfficeHierarchyvar(subOfficeListName);
                AccountingDetails.setSubAccountOfficeHierarchyId(subOfficeListId);
                if(result.transactionDetails.mainAccountList != null){
                    var count = 0;
                    for(var i=0;i<result.transactionDetails.mainAccountList.length;i++){
                        if(req.session.officeId == result.transactionDetails.mainAccountList[i].officeId || result.transactionDetails.mainAccountList[i].officeId == 1 || req.session.officeId == 1){
                            if(microFinanceGlcode != result.transactionDetails.mainAccountList[i].glcode){
                                mainAccountListGlCode[count] = result.transactionDetails.mainAccountList[i].glcode;
                                mainAccountListGlName[count] = result.transactionDetails.mainAccountList[i].glname + "(" + result.transactionDetails.mainAccountList[i].glcode + ")";
                                mainAccountOfficeListGlCode[count] = result.transactionDetails.mainAccountList[i].officeId;
                                count++;
                            }
                        }
                    }
                }
                AccountingDetails.setMainAccountGlcodeId(mainAccountListGlCode);
                AccountingDetails.setMainAccountvar(mainAccountListGlName);
                AccountingDetails.setMainAccountGlcodeOfficeId(mainAccountOfficeListGlCode);
                if(result.transactionDetails.subAccountList != null){
                    var index = 0;
                    for(var i=0;i<result.transactionDetails.subAccountList.length;i++){
                        if(microFinanceGlcode != result.transactionDetails.subAccountList[i].glcode){
                            subAccountListGlCode[index] = result.transactionDetails.subAccountList[i].glcode;
                            subAccountListGlName[index] = result.transactionDetails.subAccountList[i].glname + "(" + result.transactionDetails.subAccountList[i].glcode + ")";
                            subAccountOfficeListGlCode[index] = result.transactionDetails.subAccountList[i].officeId;
                            index++;
                        }
                    }
                }
                AccountingDetails.setSubAccountGlcodeId(subAccountListGlCode);
                AccountingDetails.setSubAccountvar(subAccountListGlName);
                AccountingDetails.setSubAccountGlcodeOfficeId(subAccountOfficeListGlCode);

                AccountingDetails.setAllowedDecimals(result.transactionDetails.allowedDecimals);

                var statusMessage = "";
                if(req.session.journal == "success"){
                    statusMessage = "Transaction Successful";
                    req.session.journal = "";
                }
                var errorMessage = "";
                if(req.body.error != ""){
                    errorMessage = req.body.error;
                }
                var officeId = req.session.officeId;
                var globalOfficeNum;
                if(req.session.officeId <= 9){
                    globalOfficeNum = '000'+req.session.officeId;
                }else if(req.session.officeId > 9 && req.session.officeId < 100){
                    globalOfficeNum = '00'+req.session.officeId;
                }else {
                    globalOfficeNum = '0'+req.session.officeId;
                }
                // Added by chitra for Edit Transaction
                var transactionMasterId = "",dateofTransactionFrom = "";
                var dateofTransactionToDate = "",selectedOfficeIdVoucher = "";
                if(req.body.journal == "success" || req.body.journal == "failureEdit"){
                    transactionMasterId = req.body.transactionMasterId;
                    dateofTransactionFrom = req.body.dateofTransaction;
                    dateofTransactionToDate = req.body.dateofTransactionToDate;
                    selectedOfficeIdVoucher = req.body.selectedOfficeId;
                }

                if(req.body.journal == "failure" || req.body.journal == "failureEdit"){
                    var fromOfficeHierarchyValue = parseInt(req.body.fromofficeHierarchy,10);
                    var toOfficeHierarchyValue = parseInt(req.body.toofficeHierarchy,10);
                    var fromOfficeValue = req.body.fromOfficeValue;
                    var toOfficeValue = req.body.toOfficeValue;
                    var fromAccountValue = req.body.fromAccount;
                    var toAccountValue = req.body.toAccount ;
                    var trxnAmount = req.body.transactionAmount;
                    var notes =  req.body.transactionNotes;
                    var trxnDate =  req.body.transactionDate;
                    res.render("accounting/journalTransaction",{AccountingDetails : AccountingDetails,roleId:req.session.roleId, statusMessage : statusMessage,errorMessage:errorMessage,officeId : officeId, globalOfficeNum : globalOfficeNum,typeOfTransaction:req.body.typeOfTransaction,
                        officeHierarchyNameArray:officeHierarchyNameArray,fromOfficeHierarchyValue:fromOfficeHierarchyValue,toOfficeHierarchyValue:toOfficeHierarchyValue,fromOfficeValue:fromOfficeValue,toOfficeValue:toOfficeValue,fromAccountValue:fromAccountValue,toAccountValue:toAccountValue,
                        trxnAmount:trxnAmount,notes:notes,trxnDate:trxnDate, contextPath:props.contextPath,transactionMasterIdValue:transactionMasterId,dateofTransactionFrom:dateofTransactionFrom,dateofTransactionToDate:dateofTransactionToDate,selectedOfficeIdVoucher:selectedOfficeIdVoucher});
                }else if(req.body.journal == "success" && req.body.transactionDetails != null)
                {
                    var fromOfficeHierarchyValue = req.body.transactionDetails.fromOfficeLevelId;
                    var toOfficeHierarchyValue = req.body.transactionDetails.toOfficeLevelId;
                    var fromOfficeValue = req.body.transactionDetails.fromOfficeId;
                    var toOfficeValue = req.body.transactionDetails.toOfficeId;
                    var fromAccountValue = req.body.transactionDetails.mainAccountGlCode;
                    var toAccountValue = req.body.transactionDetails.subAccountGlCode;
                    var toOffice = req.body.transactionDetails.toOfficeId;
                    var trxnDate = dateUtils.convertToDateFormat(req.body.transactionDetails.trxnDate);
                    var trxnAmt = req.body.transactionDetails.trxnAmt;
                    var chequeNo,chequeDate;
                    if(typeof(req.body.transactionDetails.chequeNo) == 'undefined' | req.body.transactionDetails.chequeNo == '' |  req.body.transactionDetails.chequeNo== null){
                        chequeNo = "";
                    }else{
                        chequeNo = req.body.transactionDetails.chequeNo;
                    }
                    if(typeof(req.body.transactionDetails.chequeDate) == 'undefined' | req.body.transactionDetails.chequeDate == '' |  req.body.transactionDetails.chequeDate== null){
                        chequeDate = "";
                    }else{
                        chequeDate = dateUtils.convertToDateFormat(req.body.transactionDetails.chequeDate);
                    }

                    var notes = req.body.transactionDetails.notes;

                    res.render("accounting/journalTransaction",{AccountingDetails : AccountingDetails,roleId:req.session.roleId, statusMessage : "",errorMessage:"",officeId : officeId, globalOfficeNum : globalOfficeNum,typeOfTransaction:req.body.typeOfTransaction,
                        officeHierarchyNameArray:officeHierarchyNameArray,fromOfficeHierarchyValue:fromOfficeHierarchyValue,toOfficeHierarchyValue:toOfficeHierarchyValue,fromOfficeValue:fromOfficeValue,toOfficeValue:toOfficeValue,fromAccountValue:fromAccountValue,toAccountValue:toAccountValue,
                        trxnAmount:trxnAmt,chequeNo:chequeNo,chequeDate:chequeDate,notes:notes,trxnDate:trxnDate, contextPath:props.contextPath,transactionMasterIdValue:transactionMasterId,dateofTransactionFrom:dateofTransactionFrom,dateofTransactionToDate:dateofTransactionToDate,selectedOfficeIdVoucher:selectedOfficeIdVoucher});
                }else{
                    res.render("accounting/journalTransaction",{AccountingDetails : AccountingDetails,roleId:req.session.roleId, statusMessage : statusMessage,errorMessage:errorMessage,officeId : officeId, globalOfficeNum : globalOfficeNum,
                        officeHierarchyNameArray:officeHierarchyNameArray,fromOfficeHierarchyValue:"",toOfficeHierarchyValue:"",fromOfficeValue:"",toOfficeValue:"",fromAccountValue:"",toAccountValue:"",typeOfTransaction:"",
                        trxnAmount:"",notes:"Journal Transaction.",trxnDate:AccountingDetails.getTransactionDate(), contextPath:props.contextPath,transactionMasterIdValue:"",dateofTransactionFrom:"",dateofTransactionToDate:"",selectedOfficeIdVoucher:""});
                }
            }else{
                self.commonRouter.showErrorPage(req,res);
            }
        });
    },
    submitJournalTransaction : function(req,res) {
        res.setTimeout(0);
        var self = this;
        var AccountingDetails = require(path.join(rootPath,"app_modules/dto/accounting/AccountingDetails"));
        var AccountingDetails = new AccountingDetails();
        this.AccountingDetails = AccountingDetails;
        var AccountingDetails = this.AccountingDetails;
        AccountingDetails.setTransactionDate(dateUtils.convertToYMDFormat(req.body.transactionDate));
        AccountingDetails.setTransactionType(req.body.transactionType);
        AccountingDetails.setMainAccountOfficeHierarchy(parseInt(req.body.fromofficeHierarchy,10));
        AccountingDetails.setMainAccountOffice(req.body.fromOfficeValue);
        AccountingDetails.setMainAccount(req.body.fromAccount);
        AccountingDetails.setSubAccountOfficeHierarchy(parseInt(req.body.toofficeHierarchy,10));
        AccountingDetails.setSubAccountOffice(req.body.toOfficeValue);
        AccountingDetails.setSubAccount(req.body.toAccount);
        AccountingDetails.setAmount(req.body.transactionAmount);
        AccountingDetails.setContra(false);
        AccountingDetails.setNotes(req.body.transactionNotes);
        var jsonArray = JSON.stringify(AccountingDetails);
        customlog.info("jsonArray" + jsonArray);
        var rest = require("./rest.js");
        var http = require('http');
        var https = require('https');
        var postheaders = {
            'Content-Type' : 'application/json',
            'Content-Length' : Buffer.byteLength(jsonArray, 'utf8'),
            'Cookie' : req.session.mifosCookie
        };
        var options = {
            host: mifosServiceIP,
            port: mifosPort,
            path: "/mfi/api/accounting/journal.json",
            method: 'POST',
            headers : postheaders
        };
        rest.postJSON(options,jsonArray,function(statuscode,result,headers){
            if(statuscode == 302){
                res.redirect(props.contextPath+'/client/ci/logout');
            }else if(result.status == "success"){
                var activityDetails = new Array(iklantPort, req.session.tenantId, req.session.userId, req.session.userName, req.originalUrl, req.connection.remoteAddress, "routAccounting.js", "submitJournalTransaction", "success", "Journal Transaction", "Journal Transaction Entry Made Successfully from "+req.body.fromAccount+" to "+req.body.toAccount+ " for "+req.body.transactionNotes,"insert");
                self.commonRouter.insertActivityLogModel(activityDetails);
                req.session.journal = "success";
                req.body.journal = "success";
                self.journalTransaction(req,res);
            }else if(result.status == "failure"){
                if(result.hasOwnProperty('errors')){
                    req.body.journal = "failure";
                    req.body.error = result.errors[0];
                }else{
                    customlog.error("Inside ELSE ERROR");
                    req.body.journal = "runtime";
                }
                //res.send(req.body);
                self.journalTransaction(req,res);
            }else{
                self.commonRouter.showErrorPage(req,res);
            }
        });
    },
    contraBankPayment : function(req,res) {
        var self = this;
        var rest = require("./rest.js");
        var http = require('http');
        var https = require('https');
        customlog.info(req.session.mifosCookie);
        var postheaders = {
            'Content-Type' : 'application/json',
            'Cookie' : req.session.mifosCookie
        };
        var options = {
            host: mifosServiceIP,
            port: mifosPort,
            path: "/mfi/api/accounting/contra/withdraw/load.json",
            method: 'GET',
            headers : postheaders
        };
        rest.getJSON(options,function(statuscode,result,headers){
            customlog.info("statuscode:"+statuscode);
            customlog.info("result:" + result.status);
            if(statuscode == 302){
                res.redirect(props.contextPath+'/client/ci/logout');
            }else if(result.status == "success"){
                //var activityDetails = new Array(iklantPort, req.session.tenantId, req.session.userId, req.session.userName, req.originalUrl, req.connection.remoteAddress, "routAccounting.js", "contraBankPayment", "success", "contraBankPayment", "contraBankPayment");
                //self.commonRouter.insertActivityLogModel(activityDetails);
                var fromOfficeListId 	= new Array();
                var subOfficeListId 	= new Array();
                var fromOfficeListName 	= new Array();
                var subOfficeListName 	= new Array();
                var mainAccountListGlName 	= new Array();
                var mainAccountListGlCode 	= new Array();
                var mainAccountOfficeListGlCode 	= new Array();
                var subAccountListGlName 	= new Array();
                var subAccountListGlCode 	= new Array();
                var subAccountOfficeListGlCode 	= new Array();

                var headOfficeNameVar = new Array();
                var headOfficeId = new Array();

                var regionalOfficeNameVar = new Array();
                var regionalOfficeId = new Array();

                var divisionalOfficeNameVar = new Array();
                var divisionalOfficeId = new Array();

                var areaOfficeNameVar = new Array();
                var areaOfficeId = new Array();

                var branchOfficeNameVar = new Array();
                var branchOfficeId = new Array();

                var AccountingDetails = require(path.join(rootPath,"app_modules/dto/accounting/AccountingDetails"));
                var AccountingDetails = new AccountingDetails();
                this.AccountingDetails = AccountingDetails;
                var AccountingDetails = this.AccountingDetails;
                AccountingDetails.setTransactionType(result.transactionDetails.transactionType);
                if(result.transactionDetails.officeHierarchyByLevelDto.headOffices != null){
                    for(var i=0;i<result.transactionDetails.officeHierarchyByLevelDto.headOffices.length;i++){
                        headOfficeId[i] = result.transactionDetails.officeHierarchyByLevelDto.headOffices[i].globalNum;
                        headOfficeNameVar[i] = result.transactionDetails.officeHierarchyByLevelDto.headOffices[i].name;
                    }
                }
                AccountingDetails.setHeadOfficeId(headOfficeId);
                AccountingDetails.setHeadOfficeNameVar(headOfficeNameVar);
                if(result.transactionDetails.officeHierarchyByLevelDto.regionalOffices != null){
                    for(var i=0;i<result.transactionDetails.officeHierarchyByLevelDto.regionalOffices.length;i++){
                        regionalOfficeId[i] = result.transactionDetails.officeHierarchyByLevelDto.regionalOffices[i].globalNum;
                        regionalOfficeNameVar[i] = result.transactionDetails.officeHierarchyByLevelDto.regionalOffices[i].name;
                    }
                }
                AccountingDetails.setRegionalOfficeId(regionalOfficeId);
                AccountingDetails.setRegionalOfficeNameVar(regionalOfficeNameVar);
                if(result.transactionDetails.officeHierarchyByLevelDto.divisionalOffices != null){
                    for(var i=0;i<result.transactionDetails.officeHierarchyByLevelDto.divisionalOffices.length;i++){
                        divisionalOfficeId[i] = result.transactionDetails.officeHierarchyByLevelDto.divisionalOffices[i].globalNum;
                        divisionalOfficeNameVar[i] = result.transactionDetails.officeHierarchyByLevelDto.divisionalOffices[i].name;
                    }
                }
                AccountingDetails.setDivisionalOfficeId(divisionalOfficeId);
                AccountingDetails.setDivisionalOfficeNameVar(divisionalOfficeNameVar);
                if(result.transactionDetails.officeHierarchyByLevelDto.areaOffices != null){
                    for(var i=0;i<result.transactionDetails.officeHierarchyByLevelDto.areaOffices.length;i++){
                        areaOfficeId[i] = result.transactionDetails.officeHierarchyByLevelDto.areaOffices[i].globalNum;
                        areaOfficeNameVar[i] = result.transactionDetails.officeHierarchyByLevelDto.areaOffices[i].name;
                    }
                }
                AccountingDetails.setAreaOfficeId(areaOfficeId);
                AccountingDetails.setAreaOfficeNameVar(areaOfficeNameVar);
                if(result.transactionDetails.officeHierarchyByLevelDto.branchOffices != null){
                    for(var i=0;i<result.transactionDetails.officeHierarchyByLevelDto.branchOffices.length;i++){
                        branchOfficeId[i] = result.transactionDetails.officeHierarchyByLevelDto.branchOffices[i].globalNum;
                        branchOfficeNameVar[i] = result.transactionDetails.officeHierarchyByLevelDto.branchOffices[i].name;
                    }
                }
                AccountingDetails.setBranchOfficeId(branchOfficeId);
                AccountingDetails.setBranchOfficeNameVar(branchOfficeNameVar);


                if( dateUtils.convertToYMDFormat(dateUtils.convertMillisecToMifosDateFormatStr(result.transactionDetails.transactionDate))  <= result.transactionDetails.financialYearEndDate ){
                    AccountingDetails.setFinancialYearEndvar(dateUtils.convertMillisecToMifosDateFormatStr(result.transactionDetails.transactionDate));
                }else{
                    AccountingDetails.setFinancialYearEndvar(dateUtils.convertToDateWithSlash(result.transactionDetails.financialYearEndDate));
                }
                AccountingDetails.setTransactionDate(dateUtils.convertMillisecToMifosDateFormatStr(result.transactionDetails.transactionDate));
                AccountingDetails.setFinancialYearStartvar(dateUtils.convertToDateWithSlash(result.transactionDetails.financialYearStartDate));
                if(result.transactionDetails.mainAccountOfficeList != null){
                    for(var i=0;i<result.transactionDetails.mainAccountOfficeList.length;i++){
                        fromOfficeListId[i] = result.transactionDetails.mainAccountOfficeList[i].globalNum;
                        fromOfficeListName[i] = result.transactionDetails.mainAccountOfficeList[i].name;
                    }
                }
                AccountingDetails.setMainAccountOfficeHierarchyId(fromOfficeListId);
                AccountingDetails.setMainAccountOfficeHierarchyvar(fromOfficeListName);
                if(result.transactionDetails.subAccountOfficeList != null){
                    for(var i=0;i<result.transactionDetails.subAccountOfficeList.length;i++){
                        subOfficeListId[i] = result.transactionDetails.subAccountOfficeList[i].globalNum;
                        subOfficeListName[i] = result.transactionDetails.subAccountOfficeList[i].name;
                    }
                }
                AccountingDetails.setSubAccountOfficeHierarchyvar(subOfficeListName);
                AccountingDetails.setSubAccountOfficeHierarchyId(subOfficeListId);
                if(result.transactionDetails.mainAccountList != null){
                    var count = 0;
                    for(var i=0;i<result.transactionDetails.mainAccountList.length;i++){
                        if(req.session.officeId == result.transactionDetails.mainAccountList[i].officeId || result.transactionDetails.mainAccountList[i].officeId == 1 || req.session.officeId == 1){
                            if(microFinanceGlcode != result.transactionDetails.mainAccountList[i].glcode){
                                mainAccountListGlCode[count] = result.transactionDetails.mainAccountList[i].glcode;
                                mainAccountListGlName[count] = result.transactionDetails.mainAccountList[i].glname;
                                mainAccountOfficeListGlCode[count] = result.transactionDetails.mainAccountList[i].officeId;
                                count++;
                            }
                        }
                    }
                }
                AccountingDetails.setMainAccountGlcodeId(mainAccountListGlCode);
                AccountingDetails.setMainAccountvar(mainAccountListGlName);
                AccountingDetails.setMainAccountGlcodeOfficeId(mainAccountOfficeListGlCode);
                if(result.transactionDetails.subAccountList != null){
                    var index = 0;
                    for(var i=0;i<result.transactionDetails.subAccountList.length;i++){
                        if(microFinanceGlcode != result.transactionDetails.subAccountList[i].glcode){
                            subAccountListGlCode[index] = result.transactionDetails.subAccountList[i].glcode;
                            subAccountListGlName[index] = result.transactionDetails.subAccountList[i].glname;
                            subAccountOfficeListGlCode[index] = result.transactionDetails.subAccountList[i].officeId;
                            index++;
                        }
                    }
                }
                AccountingDetails.setSubAccountGlcodeId(subAccountListGlCode);
                AccountingDetails.setSubAccountvar(subAccountListGlName);
                AccountingDetails.setSubAccountGlcodeOfficeId(subAccountOfficeListGlCode);

                AccountingDetails.setAllowedDecimals(result.transactionDetails.allowedDecimals);

                var statusMessage = "";
                if(req.session.bankPayment == "success"){
                    statusMessage = "Transaction Successful";
                    req.session.bankPayment = "";
                }
                var errorMessage = "";
                if(req.body.error != ""){
                    errorMessage = req.body.error;
                }
                var officeId = req.session.officeId;
                var globalOfficeNum;
                if(req.session.officeId <= 9){
                    globalOfficeNum = '000'+req.session.officeId;
                }else if(req.session.officeId > 9 && req.session.officeId < 100){
                    globalOfficeNum = '00'+req.session.officeId;
                }else {
                    globalOfficeNum = '0'+req.session.officeId;
                }

                if(req.body.bankPayment == "failure"){
                    var fromOfficeHierarchyValue = parseInt(req.body.fromofficeHierarchy,10);
                    var toOfficeHierarchyValue = parseInt(req.body.toofficeHierarchy,10);
                    var fromOfficeValue = req.body.fromOfficeValue;
                    var toOfficeValue = req.body.toOfficeValue;
                    var fromAccountValue = req.body.fromAccount;
                    var toAccountValue = req.body.toAccount ;
                    var trxnAmount = req.body.transactionAmount;
                    var trxnDate =  req.body.transactionDate;
                    var chequeNo = "" ,chequeDate = "";
                    if(typeof(req.body.chequeNo) == 'undefined' | req.body.chequeNo == '' |  req.body.chequeNo == 'NULL'){
                        chequeNo = "";
                    }else{
                        chequeNo = req.body.chequeNo;
                    }
                    if(typeof(req.body.chequeDate) == 'undefined' | req.body.chequeDate == '' |  req.body.chequeDate == 'NULL'){
                        chequeDate = "";
                    }else{
                        chequeDate = req.body.chequeDate;
                    }
                    var notes =  req.body.transactionNotes;
                    res.render("accounting/contraBankPayment",{AccountingDetails : AccountingDetails,roleId:req.session.roleId, statusMessage : statusMessage,errorMessage:errorMessage,officeId : officeId, globalOfficeNum : globalOfficeNum,
                        officeHierarchyNameArray:officeHierarchyNameArray,fromOfficeHierarchyValue:fromOfficeHierarchyValue,toOfficeHierarchyValue:toOfficeHierarchyValue,fromOfficeValue:fromOfficeValue,toOfficeValue:toOfficeValue,fromAccountValue:fromAccountValue,toAccountValue:toAccountValue,
                        trxnAmount:trxnAmount,chequeNo:chequeNo,chequeDate:chequeDate,notes:notes,trxnDate:trxnDate, contextPath:props.contextPath});
                }else{
                    res.render("accounting/contraBankPayment",{AccountingDetails : AccountingDetails,roleId:req.session.roleId, statusMessage : statusMessage,errorMessage:errorMessage,officeId : officeId, globalOfficeNum : globalOfficeNum,
                        officeHierarchyNameArray:officeHierarchyNameArray,fromOfficeHierarchyValue:"",toOfficeHierarchyValue:"",fromOfficeValue:"",toOfficeValue:"",fromAccountValue:"",toAccountValue:"",
                        trxnAmount:"",chequeNo:"",chequeDate:"",notes:"Bank Withdraw.",trxnDate:AccountingDetails.getTransactionDate(), contextPath:props.contextPath});
                }
            }else{
                self.commonRouter.showErrorPage(req,res);
            }
        });
    },
    submitContraBankWithdraw : function(req,res) {
        res.setTimeout(0);
        var self = this;
        var AccountingDetails = require(path.join(rootPath,"app_modules/dto/accounting/AccountingDetails"));
        var AccountingDetails = new AccountingDetails();
        this.AccountingDetails = AccountingDetails;
        var AccountingDetails = this.AccountingDetails;
        AccountingDetails.setTransactionDate(dateUtils.convertToYMDFormat(req.body.transactionDate));
        AccountingDetails.setTransactionType(req.body.transactionType);
        AccountingDetails.setMainAccountOfficeHierarchy(parseInt(req.body.fromofficeHierarchy,10));
        AccountingDetails.setMainAccountOffice(req.body.fromOfficeValue);
        AccountingDetails.setMainAccount(req.body.fromAccount);
        AccountingDetails.setSubAccountOfficeHierarchy(parseInt(req.body.toofficeHierarchy,10));
        AccountingDetails.setSubAccountOffice(req.body.toOfficeValue);
        AccountingDetails.setSubAccount(req.body.toAccount);
        AccountingDetails.setAmount(req.body.transactionAmount);
        AccountingDetails.setContra(true);
        if(typeof(req.body.chequeNo) == 'undefined' | req.body.chequeNo == '' |  req.body.chequeNo== 'NULL'){
            AccountingDetails.setChequeNo(null);
        }else{
            AccountingDetails.setChequeNo(req.body.chequeNo);
        }
        if(typeof(req.body.chequeDate) == 'undefined' | req.body.chequeDate == '' |  req.body.chequeDate== 'NULL'){
            AccountingDetails.setChequeDate(null);
        }else{
            AccountingDetails.setChequeDate(dateUtils.convertToYMDFormat(req.body.chequeDate));
        }
        AccountingDetails.setNotes(req.body.transactionNotes);
        var jsonArray = JSON.stringify(AccountingDetails);
        customlog.info("jsonArray" + jsonArray);
        var rest = require("./rest.js");
        var http = require('http');
        var https = require('https');
        var postheaders = {
            'Content-Type' : 'application/json',
            'Content-Length' : Buffer.byteLength(jsonArray, 'utf8'),
            'Cookie' : req.session.mifosCookie
        };
        var options = {
            host: mifosServiceIP,
            port: mifosPort,
            path: "/mfi/api/accounting/contra/withdraw.json",
            method: 'POST',
            headers : postheaders
        };
        rest.postJSON(options,jsonArray,function(statuscode,result,headers){
            if(statuscode == 302){
                res.redirect(props.contextPath+'/client/ci/logout');
            }else if(result.status == "success"){
                var activityDetails = new Array(iklantPort, req.session.tenantId, req.session.userId, req.session.userName, req.originalUrl, req.connection.remoteAddress, "routAccounting.js", "submitContraBankWithdraw", "success", "Contra Bank Withdraw", "Contra Bank Withdraw submit Successfully from "+req.body.fromAccount+" to "+req.body.toAccount+ " for "+req.body.transactionNotes,"insert");
                self.commonRouter.insertActivityLogModel(activityDetails);
                req.session.bankPayment = "success";
                req.body.bankPayment = "success";
                self.contraBankPayment(req,res);
            }else if(result.status == "failure"){
                if(result.hasOwnProperty('errors')){
                    req.body.bankPayment = "failure";
                    req.body.error = result.errors[0];
                }else{
                    req.body.bankPayment = "runtime";
                }
                //res.send(req.body);
                self.contraBankPayment(req,res);
            }else{
                self.commonRouter.showErrorPage(req,res);
            }
        });
    },
    cashDepositForm : function(req,res) {
        var self = this;
        var rest = require("./rest.js");
        var http = require('http');
        var https = require('https');
        customlog.info(req.session.mifosCookie);
        var postheaders = {
            'Content-Type' : 'application/json',
            'Cookie' : req.session.mifosCookie
        };
        var options = {
            host: mifosServiceIP,
            port: mifosPort,
            path: "/mfi/api/accounting/contra/deposit/load.json",
            method: 'GET',
            headers : postheaders
        };
        rest.getJSON(options,function(statuscode,result,headers){
            customlog.info("statuscode:"+statuscode);
            customlog.info("result:" + result.status);

            if(statuscode == 302){
                res.redirect(props.contextPath+'/client/ci/logout');
            }else if(result.status == "success"){
                //var activityDetails = new Array(iklantPort, req.session.tenantId, req.session.userId, req.session.userName, req.originalUrl, req.connection.remoteAddress, "routAccounting.js", "cashDepositForm", "success", "cashDepositForm", "cashDepositForm");
                //self.commonRouter.insertActivityLogModel(activityDetails);
                var fromOfficeListId 	= new Array();
                var subOfficeListId 	= new Array();
                var fromOfficeListName 	= new Array();
                var subOfficeListName 	= new Array();
                var mainAccountListGlName 	= new Array();
                var mainAccountListGlCode 	= new Array();
                var mainAccountOfficeListGlCode 	= new Array();
                var subAccountListGlName 	= new Array();
                var subAccountListGlCode 	= new Array();
                var subAccountOfficeListGlCode 	= new Array();

                var headOfficeNameVar = new Array();
                var headOfficeId = new Array();

                var regionalOfficeNameVar = new Array();
                var regionalOfficeId = new Array();

                var divisionalOfficeNameVar = new Array();
                var divisionalOfficeId = new Array();

                var areaOfficeNameVar = new Array();
                var areaOfficeId = new Array();

                var branchOfficeNameVar = new Array();
                var branchOfficeId = new Array();

                var AccountingDetails = require(path.join(rootPath,"app_modules/dto/accounting/AccountingDetails"));
                var AccountingDetails = new AccountingDetails();
                this.AccountingDetails = AccountingDetails;
                var AccountingDetails = this.AccountingDetails;
                AccountingDetails.setTransactionType(result.transactionDetails.transactionType);
                if(result.transactionDetails.officeHierarchyByLevelDto.headOffices != null){
                    for(var i=0;i<result.transactionDetails.officeHierarchyByLevelDto.headOffices.length;i++){
                        headOfficeId[i] = result.transactionDetails.officeHierarchyByLevelDto.headOffices[i].globalNum;
                        headOfficeNameVar[i] = result.transactionDetails.officeHierarchyByLevelDto.headOffices[i].name;
                    }
                }
                AccountingDetails.setHeadOfficeId(headOfficeId);
                AccountingDetails.setHeadOfficeNameVar(headOfficeNameVar);
                if(result.transactionDetails.officeHierarchyByLevelDto.regionalOffices != null){
                    for(var i=0;i<result.transactionDetails.officeHierarchyByLevelDto.regionalOffices.length;i++){
                        regionalOfficeId[i] = result.transactionDetails.officeHierarchyByLevelDto.regionalOffices[i].globalNum;
                        regionalOfficeNameVar[i] = result.transactionDetails.officeHierarchyByLevelDto.regionalOffices[i].name;
                    }
                }
                AccountingDetails.setRegionalOfficeId(regionalOfficeId);
                AccountingDetails.setRegionalOfficeNameVar(regionalOfficeNameVar);
                if(result.transactionDetails.officeHierarchyByLevelDto.divisionalOffices != null){
                    for(var i=0;i<result.transactionDetails.officeHierarchyByLevelDto.divisionalOffices.length;i++){
                        divisionalOfficeId[i] = result.transactionDetails.officeHierarchyByLevelDto.divisionalOffices[i].globalNum;
                        divisionalOfficeNameVar[i] = result.transactionDetails.officeHierarchyByLevelDto.divisionalOffices[i].name;
                    }
                }
                AccountingDetails.setDivisionalOfficeId(divisionalOfficeId);
                AccountingDetails.setDivisionalOfficeNameVar(divisionalOfficeNameVar);
                if(result.transactionDetails.officeHierarchyByLevelDto.areaOffices != null){
                    for(var i=0;i<result.transactionDetails.officeHierarchyByLevelDto.areaOffices.length;i++){
                        areaOfficeId[i] = result.transactionDetails.officeHierarchyByLevelDto.areaOffices[i].globalNum;
                        areaOfficeNameVar[i] = result.transactionDetails.officeHierarchyByLevelDto.areaOffices[i].name;
                    }
                }
                AccountingDetails.setAreaOfficeId(areaOfficeId);
                AccountingDetails.setAreaOfficeNameVar(areaOfficeNameVar);
                if(result.transactionDetails.officeHierarchyByLevelDto.branchOffices != null){
                    for(var i=0;i<result.transactionDetails.officeHierarchyByLevelDto.branchOffices.length;i++){
                        branchOfficeId[i] = result.transactionDetails.officeHierarchyByLevelDto.branchOffices[i].globalNum;
                        branchOfficeNameVar[i] = result.transactionDetails.officeHierarchyByLevelDto.branchOffices[i].name;
                    }
                }
                AccountingDetails.setBranchOfficeId(branchOfficeId);
                AccountingDetails.setBranchOfficeNameVar(branchOfficeNameVar);


                if( dateUtils.convertToYMDFormat(dateUtils.convertMillisecToMifosDateFormatStr(result.transactionDetails.transactionDate))  <= result.transactionDetails.financialYearEndDate ){
                    AccountingDetails.setFinancialYearEndvar(dateUtils.convertMillisecToMifosDateFormatStr(result.transactionDetails.transactionDate));
                }else{
                    AccountingDetails.setFinancialYearEndvar(dateUtils.convertToDateWithSlash(result.transactionDetails.financialYearEndDate));
                }
                AccountingDetails.setTransactionDate(dateUtils.convertMillisecToMifosDateFormatStr(result.transactionDetails.transactionDate));
                AccountingDetails.setFinancialYearStartvar(dateUtils.convertToDateWithSlash(result.transactionDetails.financialYearStartDate));
                if(result.transactionDetails.mainAccountOfficeList != null){
                    for(var i=0;i<result.transactionDetails.mainAccountOfficeList.length;i++){
                        fromOfficeListId[i] = result.transactionDetails.mainAccountOfficeList[i].globalNum;
                        fromOfficeListName[i] = result.transactionDetails.mainAccountOfficeList[i].name;
                    }
                }
                AccountingDetails.setMainAccountOfficeHierarchyId(fromOfficeListId);
                AccountingDetails.setMainAccountOfficeHierarchyvar(fromOfficeListName);
                if(result.transactionDetails.subAccountOfficeList != null){
                    for(var i=0;i<result.transactionDetails.subAccountOfficeList.length;i++){
                        subOfficeListId[i] = result.transactionDetails.subAccountOfficeList[i].globalNum;
                        subOfficeListName[i] = result.transactionDetails.subAccountOfficeList[i].name;
                    }
                }
                AccountingDetails.setSubAccountOfficeHierarchyvar(subOfficeListName);
                AccountingDetails.setSubAccountOfficeHierarchyId(subOfficeListId);
                if(result.transactionDetails.mainAccountList != null){
                    var j=0;
                    for(var i=0;i<result.transactionDetails.mainAccountList.length;i++){
                        if(req.session.officeId == result.transactionDetails.mainAccountList[i].officeId || result.transactionDetails.mainAccountList[i].officeId == 1 || req.session.officeId == 1){
                            if(microFinanceGlcode != result.transactionDetails.mainAccountList[i].glcode){
                                mainAccountListGlCode[j] = result.transactionDetails.mainAccountList[i].glcode;
                                mainAccountListGlName[j] = result.transactionDetails.mainAccountList[i].glname;
                                mainAccountOfficeListGlCode[j] = result.transactionDetails.mainAccountList[i].officeId;
                                j++;
                            }
                        }
                    }
                }
                AccountingDetails.setMainAccountGlcodeId(mainAccountListGlCode);
                AccountingDetails.setMainAccountvar(mainAccountListGlName);
                AccountingDetails.setMainAccountGlcodeOfficeId(mainAccountOfficeListGlCode);
                if(result.transactionDetails.subAccountList != null){
                    var index = 0;
                    for(var i=0;i<result.transactionDetails.subAccountList.length;i++){
                        if(microFinanceGlcode != result.transactionDetails.subAccountList[i].glcode){
                            subAccountListGlCode[index] = result.transactionDetails.subAccountList[i].glcode;
                            subAccountListGlName[index] = result.transactionDetails.subAccountList[i].glname;
                            subAccountOfficeListGlCode[index] = result.transactionDetails.subAccountList[i].officeId;
                            index++;
                        }
                    }
                }
                AccountingDetails.setSubAccountGlcodeId(subAccountListGlCode);
                AccountingDetails.setSubAccountvar(subAccountListGlName);
                AccountingDetails.setSubAccountGlcodeOfficeId(subAccountOfficeListGlCode);

                AccountingDetails.setAllowedDecimals(result.transactionDetails.allowedDecimals);
                var statusMessage = "";
                if(req.session.cashDeposit == "success"){
                    statusMessage = "Transaction Successful";
                    req.session.cashDeposit = "";
                }
                var errorMessage = "";
                if(req.body.error != ""){
                    errorMessage = req.body.error;
                }
                var officeId = req.session.officeId;
                var globalOfficeNum;
                if(req.session.officeId <= 9){
                    globalOfficeNum = '000'+req.session.officeId;
                }else if(req.session.officeId > 9 && req.session.officeId < 100){
                    globalOfficeNum = '00'+req.session.officeId;
                }else {
                    globalOfficeNum = '0'+req.session.officeId;
                }
                if(req.body.cashDeposit == "failure"){
                    var fromOfficeHierarchyValue = parseInt(req.body.fromofficeHierarchy,10);
                    var toOfficeHierarchyValue = parseInt(req.body.toofficeHierarchy,10);
                    var fromOfficeValue = req.body.fromOfficeValue;
                    var toOfficeValue = req.body.toOfficeValue;
                    var fromAccountValue = req.body.fromAccount;
                    var toAccountValue = req.body.toAccount ;
                    var trxnAmount = req.body.transactionAmount;
                    var notes =  req.body.transactionNotes;
                    var trxnDate =  req.body.transactionDate;
                    res.render("accounting/contraCashDeposit",{AccountingDetails : AccountingDetails,roleId:req.session.roleId, statusMessage : statusMessage,errorMessage:errorMessage,officeId : officeId, globalOfficeNum : globalOfficeNum,
                        officeHierarchyNameArray:officeHierarchyNameArray,fromOfficeHierarchyValue:fromOfficeHierarchyValue,toOfficeHierarchyValue:toOfficeHierarchyValue,fromOfficeValue:fromOfficeValue,toOfficeValue:toOfficeValue,fromAccountValue:fromAccountValue,toAccountValue:toAccountValue,
                        trxnAmount:trxnAmount,notes:notes,trxnDate:trxnDate, contextPath:props.contextPath});
                }else{
                    res.render("accounting/contraCashDeposit",{AccountingDetails : AccountingDetails,roleId:req.session.roleId, statusMessage : statusMessage,errorMessage:errorMessage,officeId : officeId, globalOfficeNum : globalOfficeNum,
                        officeHierarchyNameArray:officeHierarchyNameArray,fromOfficeHierarchyValue:"",toOfficeHierarchyValue:"",fromOfficeValue:"",toOfficeValue:"",fromAccountValue:"",toAccountValue:"",
                        trxnAmount:"",notes:"Cash Deposit.",trxnDate:AccountingDetails.getTransactionDate(), contextPath:props.contextPath});
                }
            }else{
                self.commonRouter.showErrorPage(req,res);
            }
        });
    },
    submitcashDeposit : function(req,res) {
        res.setTimeout(0);
        var self = this;
        var AccountingDetails = require(path.join(rootPath,"app_modules/dto/accounting/AccountingDetails"));
        var AccountingDetails = new AccountingDetails();
        this.AccountingDetails = AccountingDetails;
        var AccountingDetails = this.AccountingDetails;
        AccountingDetails.setTransactionDate(dateUtils.convertToYMDFormat(req.body.transactionDate));
        AccountingDetails.setTransactionType(req.body.transactionType);
        AccountingDetails.setMainAccountOfficeHierarchy(parseInt(req.body.fromofficeHierarchy,10));
        AccountingDetails.setMainAccountOffice(req.body.fromOfficeValue);
        AccountingDetails.setMainAccount(req.body.fromAccount);
        AccountingDetails.setSubAccountOfficeHierarchy(parseInt(req.body.toofficeHierarchy,10));
        AccountingDetails.setSubAccountOffice(req.body.toOfficeValue);
        AccountingDetails.setSubAccount(req.body.toAccount);
        AccountingDetails.setAmount(req.body.transactionAmount);
        AccountingDetails.setContra(true);
        AccountingDetails.setNotes(req.body.transactionNotes);
        var jsonArray = JSON.stringify(AccountingDetails);
        customlog.info("jsonArray" + jsonArray);
        var rest = require("./rest.js");
        var http = require('http');
        var https = require('https');
        var postheaders = {
            'Content-Type' : 'application/json',
            'Content-Length' : Buffer.byteLength(jsonArray, 'utf8'),
            'Cookie' : req.session.mifosCookie
        };
        var options = {
            host: mifosServiceIP,
            port: mifosPort,
            path: "/mfi/api/accounting/contra/deposit.json",
            method: 'POST',
            headers : postheaders
        };
        rest.postJSON(options,jsonArray,function(statuscode,result,headers){
            if(statuscode == 302){
                res.redirect(props.contextPath+'/client/ci/logout');
            }else if(result.status == "success"){
                var activityDetails = new Array(iklantPort, req.session.tenantId, req.session.userId, req.session.userName, req.originalUrl, req.connection.remoteAddress, "routAccounting.js", "submitcashDeposit", "success", "Contra Cash Deposit", "Contra Cash Deposit Entry Made Successfully from "+req.body.fromAccount+" to "+req.body.toAccount+ " for "+req.body.transactionNotes,"insert");
                self.commonRouter.insertActivityLogModel(activityDetails);
                req.session.cashDeposit = "success";
                req.body.cashDeposit = "success";
                self.cashDepositForm(req,res);
            }else if(result.status == "failure"){
                if(result.hasOwnProperty('errors')){
                    req.body.cashDeposit = "failure";
                    req.body.error = result.errors[0];
                }else{
                    customlog.error("Inside ELSE ERROR");
                    req.body.bankPayment = "runtime";
                }
                //res.send(req.body);
                self.cashDepositForm(req,res);
            }else{
                self.commonRouter.showErrorPage(req,res);
            }
        });
    },
    fundTransferForm : function(req,res) {
        var self = this;
        var rest = require("./rest.js");
        var http = require('http');
        var https = require('https');
        customlog.info(req.session.mifosCookie);
        var postheaders = {
            'Content-Type' : 'application/json',
            'Cookie' : req.session.mifosCookie
        };
        var options = {
            host: mifosServiceIP,
            port: mifosPort,
            path: "/mfi/api/accounting/contra/fundtransfer/load.json",
            method: 'GET',
            headers : postheaders
        };
        rest.getJSON(options,function(statuscode,result,headers){
            if(statuscode == 302){
                res.redirect(props.contextPath+'/client/ci/logout');
            }else if(result.status == "success"){
                //var activityDetails = new Array(iklantPort, req.session.tenantId, req.session.userId, req.session.userName, req.originalUrl, req.connection.remoteAddress, "routAccounting.js", "fundTransferForm", "success", "Contra Fund Transfer", "Contra Fund Transfer");
                //self.commonRouter.insertActivityLogModel(activityDetails);
                var fromOfficeListId 	= new Array();
                var subOfficeListId 	= new Array();
                var fromOfficeListName 	= new Array();
                var subOfficeListName 	= new Array();
                var mainAccountListGlName 	= new Array();
                var mainAccountListGlCode 	= new Array();
                var mainAccountOfficeListGlCode 	= new Array();
                var subAccountListGlName 	= new Array();
                var subAccountListGlCode 	= new Array();
                var subAccountOfficeListGlCode 	= new Array();

                var headOfficeNameVar = new Array();
                var headOfficeId = new Array();

                var regionalOfficeNameVar = new Array();
                var regionalOfficeId = new Array();

                var divisionalOfficeNameVar = new Array();
                var divisionalOfficeId = new Array();

                var areaOfficeNameVar = new Array();
                var areaOfficeId = new Array();

                var branchOfficeNameVar = new Array();
                var branchOfficeId = new Array();


                var AccountingDetails = require(path.join(rootPath,"app_modules/dto/accounting/AccountingDetails"));
                var AccountingDetails = new AccountingDetails();
                this.AccountingDetails = AccountingDetails;
                var AccountingDetails = this.AccountingDetails;
                AccountingDetails.setTransactionType(result.transactionDetails.transactionType);
                if(result.transactionDetails.officeHierarchyByLevelDto.headOffices != null){
                    for(var i=0;i<result.transactionDetails.officeHierarchyByLevelDto.headOffices.length;i++){
                        headOfficeId[i] = result.transactionDetails.officeHierarchyByLevelDto.headOffices[i].globalNum;
                        headOfficeNameVar[i] = result.transactionDetails.officeHierarchyByLevelDto.headOffices[i].name;
                    }
                }
                AccountingDetails.setHeadOfficeId(headOfficeId);
                AccountingDetails.setHeadOfficeNameVar(headOfficeNameVar);
                if(result.transactionDetails.officeHierarchyByLevelDto.regionalOffices != null){
                    for(var i=0;i<result.transactionDetails.officeHierarchyByLevelDto.regionalOffices.length;i++){
                        regionalOfficeId[i] = result.transactionDetails.officeHierarchyByLevelDto.regionalOffices[i].globalNum;
                        regionalOfficeNameVar[i] = result.transactionDetails.officeHierarchyByLevelDto.regionalOffices[i].name;
                    }
                }
                AccountingDetails.setRegionalOfficeId(regionalOfficeId);
                AccountingDetails.setRegionalOfficeNameVar(regionalOfficeNameVar);
                if(result.transactionDetails.officeHierarchyByLevelDto.divisionalOffices != null){
                    for(var i=0;i<result.transactionDetails.officeHierarchyByLevelDto.divisionalOffices.length;i++){
                        divisionalOfficeId[i] = result.transactionDetails.officeHierarchyByLevelDto.divisionalOffices[i].globalNum;
                        divisionalOfficeNameVar[i] = result.transactionDetails.officeHierarchyByLevelDto.divisionalOffices[i].name;
                    }
                }
                AccountingDetails.setDivisionalOfficeId(divisionalOfficeId);
                AccountingDetails.setDivisionalOfficeNameVar(divisionalOfficeNameVar);
                if(result.transactionDetails.officeHierarchyByLevelDto.areaOffices != null){
                    for(var i=0;i<result.transactionDetails.officeHierarchyByLevelDto.areaOffices.length;i++){
                        areaOfficeId[i] = result.transactionDetails.officeHierarchyByLevelDto.areaOffices[i].globalNum;
                        areaOfficeNameVar[i] = result.transactionDetails.officeHierarchyByLevelDto.areaOffices[i].name;
                    }
                }
                AccountingDetails.setAreaOfficeId(areaOfficeId);
                AccountingDetails.setAreaOfficeNameVar(areaOfficeNameVar);
                if(result.transactionDetails.officeHierarchyByLevelDto.branchOffices != null){
                    for(var i=0;i<result.transactionDetails.officeHierarchyByLevelDto.branchOffices.length;i++){
                        branchOfficeId[i] = result.transactionDetails.officeHierarchyByLevelDto.branchOffices[i].globalNum;
                        branchOfficeNameVar[i] = result.transactionDetails.officeHierarchyByLevelDto.branchOffices[i].name;
                    }
                }
                AccountingDetails.setBranchOfficeId(branchOfficeId);
                AccountingDetails.setBranchOfficeNameVar(branchOfficeNameVar);


                if( dateUtils.convertToYMDFormat(dateUtils.convertMillisecToMifosDateFormatStr(result.transactionDetails.transactionDate))  <= result.transactionDetails.financialYearEndDate ){
                    AccountingDetails.setFinancialYearEndvar(dateUtils.convertMillisecToMifosDateFormatStr(result.transactionDetails.transactionDate));
                }else{
                    AccountingDetails.setFinancialYearEndvar(dateUtils.convertToDateWithSlash(result.transactionDetails.financialYearEndDate));
                }
                AccountingDetails.setTransactionDate(dateUtils.convertMillisecToMifosDateFormatStr(result.transactionDetails.transactionDate));
                AccountingDetails.setFinancialYearStartvar(dateUtils.convertToDateWithSlash(result.transactionDetails.financialYearStartDate));
                if(result.transactionDetails.mainAccountOfficeList != null){
                    for(var i=0;i<result.transactionDetails.mainAccountOfficeList.length;i++){
                        fromOfficeListId[i] = result.transactionDetails.mainAccountOfficeList[i].globalNum;
                        fromOfficeListName[i] = result.transactionDetails.mainAccountOfficeList[i].name;
                    }
                }
                AccountingDetails.setMainAccountOfficeHierarchyId(fromOfficeListId);
                AccountingDetails.setMainAccountOfficeHierarchyvar(fromOfficeListName);
                if(result.transactionDetails.subAccountOfficeList != null){
                    for(var i=0;i<result.transactionDetails.subAccountOfficeList.length;i++){
                        subOfficeListId[i] = result.transactionDetails.subAccountOfficeList[i].globalNum;
                        subOfficeListName[i] = result.transactionDetails.subAccountOfficeList[i].name;
                    }
                }
                AccountingDetails.setSubAccountOfficeHierarchyvar(subOfficeListName);
                AccountingDetails.setSubAccountOfficeHierarchyId(subOfficeListId);
                if(result.transactionDetails.mainAccountList != null){
                    var count = 0;
                    for(var i=0;i<result.transactionDetails.mainAccountList.length;i++){
                        if(req.session.officeId == result.transactionDetails.mainAccountList[i].officeId || result.transactionDetails.mainAccountList[i].officeId == 1 || req.session.officeId == 1){
                            if(microFinanceGlcode != result.transactionDetails.mainAccountList[i].glcode){
                                mainAccountListGlCode[count] = result.transactionDetails.mainAccountList[i].glcode;
                                mainAccountListGlName[count] = result.transactionDetails.mainAccountList[i].glname;
                                mainAccountOfficeListGlCode[count] = result.transactionDetails.mainAccountList[i].officeId;
                                count++;
                            }
                        }
                    }
                }
                AccountingDetails.setMainAccountGlcodeId(mainAccountListGlCode);
                AccountingDetails.setMainAccountvar(mainAccountListGlName);
                AccountingDetails.setMainAccountGlcodeOfficeId(mainAccountOfficeListGlCode);
                if(result.transactionDetails.subAccountList != null){
                    var count = 0;
                    for(var i=0;i<result.transactionDetails.subAccountList.length;i++){
                        if(microFinanceGlcode != result.transactionDetails.subAccountList[i].glcode){
                            subAccountListGlCode[count] = result.transactionDetails.subAccountList[i].glcode;
                            subAccountListGlName[count] = result.transactionDetails.subAccountList[i].glname;
                            subAccountOfficeListGlCode[count] = result.transactionDetails.subAccountList[i].officeId;
                            count++;
                        }
                    }
                }
                AccountingDetails.setSubAccountGlcodeId(subAccountListGlCode);
                AccountingDetails.setSubAccountvar(subAccountListGlName);
                AccountingDetails.setSubAccountGlcodeOfficeId(subAccountOfficeListGlCode);

                AccountingDetails.setAllowedDecimals(result.transactionDetails.allowedDecimals);

                var statusMessage = "";
                if(req.session.fundTransfer == "success"){
                    statusMessage = "Transaction Successful";
                    req.session.fundTransfer = "";
                }
                var errorMessage = "";
                if(req.body.error != ""){
                    errorMessage = req.body.error;
                }
                var officeId = req.session.officeId;
                var globalOfficeNum;
                if(req.session.officeId <= 9){
                    globalOfficeNum = '000'+req.session.officeId;
                }else if(req.session.officeId > 9 && req.session.officeId < 100){
                    globalOfficeNum = '00'+req.session.officeId;
                }else {
                    globalOfficeNum = '0'+req.session.officeId;
                }
                // Added by chitra for Edit Transaction
                var transactionMasterId = "",dateofTransactionFrom = "";
                var dateofTransactionToDate = "",selectedOfficeIdVoucher = "";
                if(req.body.fundTransfer == "success" || req.body.fundTransfer == "failureEdit"){
                    transactionMasterId = req.body.transactionMasterId;
                    dateofTransactionFrom = req.body.dateofTransaction;
                    dateofTransactionToDate = req.body.dateofTransactionToDate;
                    selectedOfficeIdVoucher = req.body.selectedOfficeId;
                }

                if(req.body.fundTransfer == "failure" || req.body.fundTransfer == "failureEdit"){
                    var fromOfficeHierarchyValue = parseInt(req.body.fromofficeHierarchy,10);
                    var toOfficeHierarchyValue = parseInt(req.body.toofficeHierarchy,10);
                    var fromOfficeValue = req.body.fromOfficeValue;
                    var toOfficeValue = req.body.toOfficeValue;
                    var fromAccountValue = req.body.fromAccount;
                    var toAccountValue = req.body.toAccount ;
                    var trxnAmount = req.body.transactionAmount;
                    var chequeNo = "" ,chequeDate = "",reconciledDate = "";
                    if(typeof(req.body.chequeNo) == 'undefined' | req.body.chequeNo == '' |  req.body.chequeNo == 'NULL'){
                        chequeNo = "";
                    }else{
                        chequeNo = req.body.chequeNo;
                    }
                    if(typeof(req.body.chequeDate) == 'undefined' | req.body.chequeDate == '' |  req.body.chequeDate == 'NULL'){
                        chequeDate = "";
                    }else{
                        chequeDate = req.body.chequeDate;
                    }
                    if(typeof(req.body.reconciledDateId) == 'undefined' | req.body.reconciledDateId == '' |  req.body.reconciledDateId== 'NULL'){
                        reconciledDate = "";
                    }else{
                        reconciledDate = dateUtils.convertToDateFormat(req.body.reconciledDateId);
                    }
                    var notes =  req.body.transactionNotes;
                    var trxnDate =  req.body.transactionDate;
                    res.render("accounting/contraFundTransfer",{AccountingDetails : AccountingDetails,roleId:req.session.roleId, statusMessage : statusMessage,errorMessage:errorMessage,officeId : officeId, globalOfficeNum : globalOfficeNum,reconciledDate:reconciledDate,typeOfTransaction:req.body.typeOfTransaction,
                        officeHierarchyNameArray:officeHierarchyNameArray,fromOfficeHierarchyValue:fromOfficeHierarchyValue,toOfficeHierarchyValue:toOfficeHierarchyValue,fromOfficeValue:fromOfficeValue,toOfficeValue:toOfficeValue,fromAccountValue:fromAccountValue,toAccountValue:toAccountValue,
                        trxnAmount:trxnAmount,chequeNo:chequeNo,chequeDate:chequeDate,notes:notes,trxnDate:trxnDate, contextPath:props.contextPath,transactionMasterIdValue:transactionMasterId,dateofTransactionFrom:dateofTransactionFrom,dateofTransactionToDate:dateofTransactionToDate,selectedOfficeIdVoucher:selectedOfficeIdVoucher});

                }else if(req.body.fundTransfer == "success" && req.body.transactionDetails != null)
                {
                    var fromOfficeHierarchyValue = req.body.transactionDetails.fromOfficeLevelId;
                    var toOfficeHierarchyValue = req.body.transactionDetails.toOfficeLevelId;
                    var fromOfficeValue = req.body.transactionDetails.fromOfficeId;
                    var toOfficeValue = req.body.transactionDetails.toOfficeId;
                    var fromAccountValue = req.body.transactionDetails.mainAccountGlCode;
                    var toAccountValue = req.body.transactionDetails.subAccountGlCode;
                    var toOffice = req.body.transactionDetails.toOfficeId;
                    var trxnDate = dateUtils.convertToDateFormat(req.body.transactionDetails.trxnDate);
                    var trxnAmt = req.body.transactionDetails.trxnAmt;
                    var reconciledDate;
                    if(typeof(req.body.transactionDetails.chequeNo) == 'undefined' | req.body.transactionDetails.chequeNo == '' |  req.body.transactionDetails.chequeNo== null){
                        chequeNo = "";
                    }else{
                        chequeNo = req.body.transactionDetails.chequeNo;
                    }
                    if(typeof(req.body.transactionDetails.chequeDate) == 'undefined' | req.body.transactionDetails.chequeDate == '' |  req.body.transactionDetails.chequeDate== null){
                        chequeDate = "";
                    }else{
                        chequeDate = dateUtils.convertToDateFormat(req.body.transactionDetails.chequeDate);
                    }
                    if(typeof(req.body.transactionDetails.reconciledDate) == 'undefined' | req.body.transactionDetails.reconciledDate == '' |  req.body.transactionDetails.reconciledDate== null){
                        reconciledDate = "";
                    }else{
                        reconciledDate = dateUtils.convertToDateFormat(req.body.transactionDetails.reconciledDate);
                    }
                    var notes = req.body.transactionDetails.notes;

                    res.render("accounting/contraFundTransfer",{AccountingDetails : AccountingDetails,roleId:req.session.roleId, statusMessage : "",errorMessage:"",officeId : officeId, globalOfficeNum : globalOfficeNum,reconciledDate:reconciledDate ,typeOfTransaction:req.body.typeOfTransaction,
                        officeHierarchyNameArray:officeHierarchyNameArray,fromOfficeHierarchyValue:fromOfficeHierarchyValue,toOfficeHierarchyValue:toOfficeHierarchyValue,fromOfficeValue:fromOfficeValue,toOfficeValue:toOfficeValue,fromAccountValue:fromAccountValue,toAccountValue:toAccountValue,
                        trxnAmount:trxnAmt,chequeNo:chequeNo,chequeDate:chequeDate,notes:notes,trxnDate:trxnDate, contextPath:props.contextPath,transactionMasterIdValue:transactionMasterId,dateofTransactionFrom:dateofTransactionFrom,dateofTransactionToDate:dateofTransactionToDate,selectedOfficeIdVoucher:selectedOfficeIdVoucher});
                }else{
                    res.render("accounting/contraFundTransfer",{AccountingDetails : AccountingDetails,roleId:req.session.roleId, statusMessage : statusMessage,errorMessage:errorMessage,officeId : officeId, globalOfficeNum : globalOfficeNum,reconciledDate:"",typeOfTransaction:"",
                        officeHierarchyNameArray:officeHierarchyNameArray,fromOfficeHierarchyValue:"",toOfficeHierarchyValue:"",fromOfficeValue:"",toOfficeValue:"",fromAccountValue:"",toAccountValue:"",
                        trxnAmount:"",chequeNo:"",chequeDate:"",notes:"Fund Transfer.",trxnDate:AccountingDetails.getTransactionDate(), contextPath:props.contextPath,transactionMasterIdValue:"",dateofTransactionFrom:"",dateofTransactionToDate:"",selectedOfficeIdVoucher:""});
                }
            }else{
                self.commonRouter.showErrorPage(req,res);
            }
        });
    },
    submitFundTransfer : function(req,res) {
        res.setTimeout(0);
        var self = this;
        var AccountingDetails = require(path.join(rootPath,"app_modules/dto/accounting/AccountingDetails"));
        var AccountingDetails = new AccountingDetails();
        this.AccountingDetails = AccountingDetails;
        var AccountingDetails = this.AccountingDetails;
        AccountingDetails.setTransactionDate(dateUtils.convertToYMDFormat(req.body.transactionDate));
        AccountingDetails.setTransactionType(req.body.transactionType);
        AccountingDetails.setMainAccountOfficeHierarchy(parseInt(req.body.fromofficeHierarchy,10));
        AccountingDetails.setMainAccountOffice(req.body.fromOfficeValue);
        AccountingDetails.setMainAccount(req.body.fromAccount);
        AccountingDetails.setSubAccountOfficeHierarchy(parseInt(req.body.toofficeHierarchy,10));
        AccountingDetails.setSubAccountOffice(req.body.toOfficeValue);
        AccountingDetails.setSubAccount(req.body.toAccount);
        AccountingDetails.setAmount(req.body.transactionAmount);
        AccountingDetails.setContra(true);
        if(typeof(req.body.chequeNo) == 'undefined' | req.body.chequeNo == '' |  req.body.chequeNo== 'NULL'){
            AccountingDetails.setChequeNo(null);
        }else{
            AccountingDetails.setChequeNo(req.body.chequeNo);
        }
        if(typeof(req.body.chequeDate) == 'undefined' | req.body.chequeDate == '' |  req.body.chequeDate== 'NULL'){
            AccountingDetails.setChequeDate(null);
        }else{
            AccountingDetails.setChequeDate(dateUtils.convertToYMDFormat(req.body.chequeDate));
        }
        AccountingDetails.setNotes(req.body.transactionNotes);
        var jsonArray = JSON.stringify(AccountingDetails);
        customlog.info("jsonArray" + jsonArray);
        var rest = require("./rest.js");
        var http = require('http');
        var https = require('https');
        var postheaders = {
            'Content-Type' : 'application/json',
            'Content-Length' : Buffer.byteLength(jsonArray, 'utf8'),
            'Cookie' : req.session.mifosCookie
        };
        var options = {
            host: mifosServiceIP,
            port: mifosPort,
            path: "/mfi/api/accounting/contra/fundtransfer.json",
            method: 'POST',
            headers : postheaders
        };
        rest.postJSON(options,jsonArray,function(statuscode,result,headers){
            if(statuscode == 302){
                res.redirect(props.contextPath+'/client/ci/logout');
            }else if(result.status == "success"){
                var activityDetails = new Array(iklantPort, req.session.tenantId, req.session.userId, req.session.userName, req.originalUrl, req.connection.remoteAddress, "routAccounting.js", "submitFundTransfer", "success", "Contra Fund Transfer", "Contra Fund Transfer Entry Made Successfully from "+req.body.fromAccount+" to "+req.body.toAccount+ " for "+req.body.transactionNotes,"insert");
                self.commonRouter.insertActivityLogModel(activityDetails);
                req.session.fundTransfer = "success";
                req.body.fundTransfer = "success";
                self.fundTransferForm(req,res);
            }else if(result.status == "failure"){
                if(result.hasOwnProperty('errors')){
                    req.body.fundTransfer = "failure";
                    req.body.error = result.errors[0];
                }else{
                    req.body.fundTransfer = "runtime";
                }
                //res.send(req.body);
                self.fundTransferForm(req,res);
            }else{
                self.commonRouter.showErrorPage(req,res);
            }
        });
    },
    cashTransferForm : function(req,res) {
        var self = this;
        var rest = require("./rest.js");
        var http = require('http');
        var https = require('https');
        var postheaders = {
            'Content-Type' : 'application/json',
            'Cookie' : req.session.mifosCookie
        };
        var options = {
            host: mifosServiceIP,
            port: mifosPort,
            path: "/mfi/api/accounting/contra/cashtransfer/load.json",
            method: 'GET',
            headers : postheaders
        };
        rest.getJSON(options,function(statuscode,result,headers){

            if(statuscode == 302){
                res.redirect(props.contextPath+'/client/ci/logout');
            }else if(result.status == "success"){
                //var activityDetails = new Array(iklantPort, req.session.tenantId, req.session.userId, req.session.userName, req.originalUrl, req.connection.remoteAddress, "routAccounting.js", "cashTransferForm", "success", "Contra Cash Transfer", "Contra Cash Transfer");
                //self.commonRouter.insertActivityLogModel(activityDetails);
                var fromOfficeListId 	= new Array();
                var subOfficeListId 	= new Array();
                var fromOfficeListName 	= new Array();
                var subOfficeListName 	= new Array();
                var mainAccountListGlName 	= new Array();
                var mainAccountListGlCode 	= new Array();
                var mainAccountOfficeListGlCode 	= new Array();
                var subAccountListGlName 	= new Array();
                var subAccountListGlCode 	= new Array();
                var subAccountOfficeListGlCode 	= new Array();

                var headOfficeNameVar = new Array();
                var headOfficeId = new Array();

                var regionalOfficeNameVar = new Array();
                var regionalOfficeId = new Array();

                var divisionalOfficeNameVar = new Array();
                var divisionalOfficeId = new Array();

                var areaOfficeNameVar = new Array();
                var areaOfficeId = new Array();

                var branchOfficeNameVar = new Array();
                var branchOfficeId = new Array();

                var AccountingDetails = require(path.join(rootPath,"app_modules/dto/accounting/AccountingDetails"));
                var AccountingDetails = new AccountingDetails();
                this.AccountingDetails = AccountingDetails;
                var AccountingDetails = this.AccountingDetails;
                AccountingDetails.setTransactionType(result.transactionDetails.transactionType);
                if(result.transactionDetails.officeHierarchyByLevelDto.headOffices != null){
                    for(var i=0;i<result.transactionDetails.officeHierarchyByLevelDto.headOffices.length;i++){
                        headOfficeId[i] = result.transactionDetails.officeHierarchyByLevelDto.headOffices[i].globalNum;
                        headOfficeNameVar[i] = result.transactionDetails.officeHierarchyByLevelDto.headOffices[i].name;
                    }
                }
                AccountingDetails.setHeadOfficeId(headOfficeId);
                AccountingDetails.setHeadOfficeNameVar(headOfficeNameVar);
                if(result.transactionDetails.officeHierarchyByLevelDto.regionalOffices != null){
                    for(var i=0;i<result.transactionDetails.officeHierarchyByLevelDto.regionalOffices.length;i++){
                        regionalOfficeId[i] = result.transactionDetails.officeHierarchyByLevelDto.regionalOffices[i].globalNum;
                        regionalOfficeNameVar[i] = result.transactionDetails.officeHierarchyByLevelDto.regionalOffices[i].name;
                    }
                }
                AccountingDetails.setRegionalOfficeId(regionalOfficeId);
                AccountingDetails.setRegionalOfficeNameVar(regionalOfficeNameVar);
                if(result.transactionDetails.officeHierarchyByLevelDto.divisionalOffices != null){
                    for(var i=0;i<result.transactionDetails.officeHierarchyByLevelDto.divisionalOffices.length;i++){
                        divisionalOfficeId[i] = result.transactionDetails.officeHierarchyByLevelDto.divisionalOffices[i].globalNum;
                        divisionalOfficeNameVar[i] = result.transactionDetails.officeHierarchyByLevelDto.divisionalOffices[i].name;
                    }
                }
                AccountingDetails.setDivisionalOfficeId(divisionalOfficeId);
                AccountingDetails.setDivisionalOfficeNameVar(divisionalOfficeNameVar);
                if(result.transactionDetails.officeHierarchyByLevelDto.areaOffices != null){
                    for(var i=0;i<result.transactionDetails.officeHierarchyByLevelDto.areaOffices.length;i++){
                        areaOfficeId[i] = result.transactionDetails.officeHierarchyByLevelDto.areaOffices[i].globalNum;
                        areaOfficeNameVar[i] = result.transactionDetails.officeHierarchyByLevelDto.areaOffices[i].name;
                    }
                }
                AccountingDetails.setAreaOfficeId(areaOfficeId);
                AccountingDetails.setAreaOfficeNameVar(areaOfficeNameVar);
                if(result.transactionDetails.officeHierarchyByLevelDto.branchOffices != null){
                    for(var i=0;i<result.transactionDetails.officeHierarchyByLevelDto.branchOffices.length;i++){
                        branchOfficeId[i] = result.transactionDetails.officeHierarchyByLevelDto.branchOffices[i].globalNum;
                        branchOfficeNameVar[i] = result.transactionDetails.officeHierarchyByLevelDto.branchOffices[i].name;
                    }
                }
                AccountingDetails.setBranchOfficeId(branchOfficeId);
                AccountingDetails.setBranchOfficeNameVar(branchOfficeNameVar);


                if( dateUtils.convertToYMDFormat(dateUtils.convertMillisecToMifosDateFormatStr(result.transactionDetails.transactionDate))  <= result.transactionDetails.financialYearEndDate ){
                    AccountingDetails.setFinancialYearEndvar(dateUtils.convertMillisecToMifosDateFormatStr(result.transactionDetails.transactionDate));
                }else{
                    AccountingDetails.setFinancialYearEndvar(dateUtils.convertToDateWithSlash(result.transactionDetails.financialYearEndDate));
                }
                AccountingDetails.setTransactionDate(dateUtils.convertMillisecToMifosDateFormatStr(result.transactionDetails.transactionDate));
                AccountingDetails.setFinancialYearStartvar(dateUtils.convertToDateWithSlash(result.transactionDetails.financialYearStartDate));
                if(result.transactionDetails.mainAccountOfficeList != null){
                    for(var i=0;i<result.transactionDetails.mainAccountOfficeList.length;i++){
                        fromOfficeListId[i] = result.transactionDetails.mainAccountOfficeList[i].globalNum;
                        fromOfficeListName[i] = result.transactionDetails.mainAccountOfficeList[i].name;
                    }
                }
                AccountingDetails.setMainAccountOfficeHierarchyId(fromOfficeListId);
                AccountingDetails.setMainAccountOfficeHierarchyvar(fromOfficeListName);
                if(result.transactionDetails.subAccountOfficeList != null){
                    for(var i=0;i<result.transactionDetails.subAccountOfficeList.length;i++){
                        subOfficeListId[i] = result.transactionDetails.subAccountOfficeList[i].globalNum;
                        subOfficeListName[i] = result.transactionDetails.subAccountOfficeList[i].name;
                    }
                }
                AccountingDetails.setSubAccountOfficeHierarchyvar(subOfficeListName);
                AccountingDetails.setSubAccountOfficeHierarchyId(subOfficeListId);
                if(result.transactionDetails.mainAccountList != null){
                    var j=0;
                    for(var i=0;i<result.transactionDetails.mainAccountList.length;i++){
                        if(req.session.officeId == result.transactionDetails.mainAccountList[i].officeId || result.transactionDetails.mainAccountList[i].officeId == 1 || req.session.officeId == 1){
                            if(microFinanceGlcode != result.transactionDetails.mainAccountList[i].glcode){
                                mainAccountListGlCode[j] = result.transactionDetails.mainAccountList[i].glcode;
                                mainAccountListGlName[j] = result.transactionDetails.mainAccountList[i].glname;
                                mainAccountOfficeListGlCode[j] = result.transactionDetails.mainAccountList[i].officeId;
                                j++;
                            }
                        }
                    }
                }
                AccountingDetails.setMainAccountGlcodeId(mainAccountListGlCode);
                AccountingDetails.setMainAccountvar(mainAccountListGlName);
                AccountingDetails.setMainAccountGlcodeOfficeId(mainAccountOfficeListGlCode);
                if(result.transactionDetails.subAccountList != null){
                    var count = 0;
                    for(var i=0;i<result.transactionDetails.subAccountList.length;i++){
                        if(microFinanceGlcode != result.transactionDetails.subAccountList[i].glcode){
                            subAccountListGlCode[count] = result.transactionDetails.subAccountList[i].glcode;
                            subAccountListGlName[count] = result.transactionDetails.subAccountList[i].glname;
                            subAccountOfficeListGlCode[count] = result.transactionDetails.subAccountList[i].officeId;
                            count++;
                        }
                    }
                }
                AccountingDetails.setSubAccountGlcodeId(subAccountListGlCode);
                AccountingDetails.setSubAccountvar(subAccountListGlName);
                AccountingDetails.setSubAccountGlcodeOfficeId(subAccountOfficeListGlCode);

                AccountingDetails.setAllowedDecimals(result.transactionDetails.allowedDecimals);


                var statusMessage = "";
                if(req.session.cashTransfer == "success"){
                    statusMessage = "Transaction Successful";
                    req.session.cashTransfer = "";
                }
                var errorMessage = "";
                if(req.body.error != ""){
                    errorMessage = req.body.error;
                }
                var officeId = req.session.officeId;
                var globalOfficeNum;
                if(req.session.officeId <= 9){
                    globalOfficeNum = '000'+req.session.officeId;
                }else if(req.session.officeId > 9 && req.session.officeId < 100){
                    globalOfficeNum = '00'+req.session.officeId;
                }else {
                    globalOfficeNum = '0'+req.session.officeId;
                }
                if(req.body.cashTransfer == "failure"){
                    var fromOfficeHierarchyValue = parseInt(req.body.fromofficeHierarchy,10);
                    var toOfficeHierarchyValue = parseInt(req.body.toofficeHierarchy,10);
                    var fromOfficeValue = req.body.fromOfficeValue;
                    var toOfficeValue = req.body.toOfficeValue;
                    var fromAccountValue = req.body.fromAccount;
                    var toAccountValue = req.body.toAccount ;
                    var trxnAmount = req.body.transactionAmount;
                    var notes =  req.body.transactionNotes;
                    var trxnDate =  req.body.transactionDate;
                    res.render("accounting/contraCashTransfer",{AccountingDetails : AccountingDetails,roleId:req.session.roleId, statusMessage : statusMessage,errorMessage:errorMessage,officeId : officeId, globalOfficeNum : globalOfficeNum,
                        officeHierarchyNameArray:officeHierarchyNameArray,fromOfficeHierarchyValue:fromOfficeHierarchyValue,toOfficeHierarchyValue:toOfficeHierarchyValue,fromOfficeValue:fromOfficeValue,toOfficeValue:toOfficeValue,fromAccountValue:fromAccountValue,toAccountValue:toAccountValue,
                        trxnAmount:trxnAmount,notes:notes,trxnDate:trxnDate, contextPath:props.contextPath});
                }else{
                    res.render("accounting/contraCashTransfer",{AccountingDetails : AccountingDetails,roleId:req.session.roleId, statusMessage : statusMessage,errorMessage:errorMessage,officeId : officeId, globalOfficeNum : globalOfficeNum,
                        officeHierarchyNameArray:officeHierarchyNameArray,fromOfficeHierarchyValue:"",toOfficeHierarchyValue:"",fromOfficeValue:"",toOfficeValue:"",fromAccountValue:"",toAccountValue:"",
                        trxnAmount:"",notes:"Cash Transfer.",trxnDate:AccountingDetails.getTransactionDate(), contextPath:props.contextPath});
                }
            }else{
                self.commonRouter.showErrorPage(req,res);
            }
        });
    },
    submitCashTransfer : function(req,res) {
        res.setTimeout(0);
        var self = this;
        var AccountingDetails = require(path.join(rootPath,"app_modules/dto/accounting/AccountingDetails"));
        var AccountingDetails = new AccountingDetails();
        this.AccountingDetails = AccountingDetails;
        var AccountingDetails = this.AccountingDetails;
        AccountingDetails.setTransactionDate(dateUtils.convertToYMDFormat(req.body.transactionDate));
        AccountingDetails.setTransactionType(req.body.transactionType);
        AccountingDetails.setMainAccountOfficeHierarchy(parseInt(req.body.fromofficeHierarchy,10));
        AccountingDetails.setMainAccountOffice(req.body.fromOfficeValue);
        AccountingDetails.setMainAccount(req.body.fromAccount);
        AccountingDetails.setSubAccountOfficeHierarchy(parseInt(req.body.toofficeHierarchy,10));
        AccountingDetails.setSubAccountOffice(req.body.toOfficeValue);
        AccountingDetails.setSubAccount(req.body.toAccount);
        AccountingDetails.setAmount(req.body.transactionAmount);
        AccountingDetails.setContra(true);
        AccountingDetails.setNotes(req.body.transactionNotes);
        var jsonArray = JSON.stringify(AccountingDetails);
        customlog.info("jsonArray" + jsonArray);
        var rest = require("./rest.js");
        var http = require('http');
        var https = require('https');
        var postheaders = {
            'Content-Type' : 'application/json',
            'Content-Length' : Buffer.byteLength(jsonArray, 'utf8'),
            'Cookie' : req.session.mifosCookie
        };
        var options = {
            host: mifosServiceIP,
            port: mifosPort,
            path: "/mfi/api/accounting/contra/cashtransfer.json",
            method: 'POST',
            headers : postheaders
        };
        rest.postJSON(options,jsonArray,function(statuscode,result,headers){
            if(statuscode == 302){
                res.redirect(props.contextPath+'/client/ci/logout');
            }else if(result.status == "success"){
                var activityDetails = new Array(iklantPort, req.session.tenantId, req.session.userId, req.session.userName, req.originalUrl, req.connection.remoteAddress, "routAccounting.js", "submitCashTransfer", "success", "Contra Cash Transfer", "Contra Cash Transfer Entry Made Successfully from "+req.body.fromAccount+" to "+req.body.toAccount+ " for "+req.body.transactionNotes,"insert");
                self.commonRouter.insertActivityLogModel(activityDetails);
                req.session.cashTransfer = "success";
                req.body.cashTransfer = "success";
                self.cashTransferForm(req,res);
            }else if(result.status == "failure"){
                if(result.hasOwnProperty('errors')){
                    req.body.cashTransfer = "failure";
                    req.body.error = result.errors[0];
                }else{
                    req.body.cashTransfer = "runtime";
                }
                //res.send(req.body);
                self.cashTransferForm(req,res);
            }else{
                self.commonRouter.showErrorPage(req,res);
            }
        });
    },
    cashPaymentForm : function(req,res) {
        var self = this;
        var rest = require("./rest.js");
        var http = require('http');
        var https = require('https');
        customlog.info(req.session.mifosCookie);
        var postheaders = {
            'Content-Type' : 'application/json',
            'Cookie' : req.session.mifosCookie
        };
        var options = {
            host: mifosServiceIP,
            port: mifosPort,
            path: "/mfi/api/accounting/payment/cash/load.json",
            method: 'GET',
            headers : postheaders
        };
        rest.getJSON(options,function(statuscode,result,headers){
            customlog.info("statuscode:"+statuscode);
            customlog.info("result:" + result.status);
            if(statuscode == 302){
                res.redirect(props.contextPath+'/client/ci/logout');
            }else if(result.status == "success"){
                //var activityDetails = new Array(iklantPort, req.session.tenantId, req.session.userId, req.session.userName, req.originalUrl, req.connection.remoteAddress, "routAccounting.js", "cashPaymentForm", "success", "Cash Payment", "Cash Payment");
                //self.commonRouter.insertActivityLogModel(activityDetails);
                var fromOfficeListId 	= new Array();
                var subOfficeListId 	= new Array();
                var fromOfficeListName 	= new Array();
                var subOfficeListName 	= new Array();
                var mainAccountListGlName 	= new Array();
                var mainAccountListGlCode 	= new Array();
                var mainAccountOfficeListGlCode 	= new Array();
                var subAccountListGlName 	= new Array();
                var subAccountListGlCode 	= new Array();
                var subAccountOfficeListGlCode 	= new Array();

                var headOfficeNameVar = new Array();
                var headOfficeId = new Array();

                var regionalOfficeNameVar = new Array();
                var regionalOfficeId = new Array();

                var divisionalOfficeNameVar = new Array();
                var divisionalOfficeId = new Array();

                var areaOfficeNameVar = new Array();
                var areaOfficeId = new Array();

                var branchOfficeNameVar = new Array();
                var branchOfficeId = new Array();

                var AccountingDetails = require(path.join(rootPath,"app_modules/dto/accounting/AccountingDetails"));
                var AccountingDetails = new AccountingDetails();
                this.AccountingDetails = AccountingDetails;
                var AccountingDetails = this.AccountingDetails;
                AccountingDetails.setTransactionType(result.transactionDetails.transactionType);
                if(result.transactionDetails.officeHierarchyByLevelDto.headOffices != null){
                    for(var i=0;i<result.transactionDetails.officeHierarchyByLevelDto.headOffices.length;i++){
                        headOfficeId[i] = result.transactionDetails.officeHierarchyByLevelDto.headOffices[i].globalNum;
                        headOfficeNameVar[i] = result.transactionDetails.officeHierarchyByLevelDto.headOffices[i].name;
                    }
                }
                AccountingDetails.setHeadOfficeId(headOfficeId);
                AccountingDetails.setHeadOfficeNameVar(headOfficeNameVar);
                if(result.transactionDetails.officeHierarchyByLevelDto.regionalOffices != null){
                    for(var i=0;i<result.transactionDetails.officeHierarchyByLevelDto.regionalOffices.length;i++){
                        regionalOfficeId[i] = result.transactionDetails.officeHierarchyByLevelDto.regionalOffices[i].globalNum;
                        regionalOfficeNameVar[i] = result.transactionDetails.officeHierarchyByLevelDto.regionalOffices[i].name;
                    }
                }
                AccountingDetails.setRegionalOfficeId(regionalOfficeId);
                AccountingDetails.setRegionalOfficeNameVar(regionalOfficeNameVar);
                if(result.transactionDetails.officeHierarchyByLevelDto.divisionalOffices != null){
                    for(var i=0;i<result.transactionDetails.officeHierarchyByLevelDto.divisionalOffices.length;i++){
                        divisionalOfficeId[i] = result.transactionDetails.officeHierarchyByLevelDto.divisionalOffices[i].globalNum;
                        divisionalOfficeNameVar[i] = result.transactionDetails.officeHierarchyByLevelDto.divisionalOffices[i].name;
                    }
                }
                AccountingDetails.setDivisionalOfficeId(divisionalOfficeId);
                AccountingDetails.setDivisionalOfficeNameVar(divisionalOfficeNameVar);
                if(result.transactionDetails.officeHierarchyByLevelDto.areaOffices != null){
                    for(var i=0;i<result.transactionDetails.officeHierarchyByLevelDto.areaOffices.length;i++){
                        areaOfficeId[i] = result.transactionDetails.officeHierarchyByLevelDto.areaOffices[i].globalNum;
                        areaOfficeNameVar[i] = result.transactionDetails.officeHierarchyByLevelDto.areaOffices[i].name;
                    }
                }
                AccountingDetails.setAreaOfficeId(areaOfficeId);
                AccountingDetails.setAreaOfficeNameVar(areaOfficeNameVar);
                if(result.transactionDetails.officeHierarchyByLevelDto.branchOffices != null){
                    for(var i=0;i<result.transactionDetails.officeHierarchyByLevelDto.branchOffices.length;i++){
                        branchOfficeId[i] = result.transactionDetails.officeHierarchyByLevelDto.branchOffices[i].globalNum;
                        branchOfficeNameVar[i] = result.transactionDetails.officeHierarchyByLevelDto.branchOffices[i].name;
                    }
                }
                AccountingDetails.setBranchOfficeId(branchOfficeId);
                AccountingDetails.setBranchOfficeNameVar(branchOfficeNameVar);


                if( dateUtils.convertToYMDFormat(dateUtils.convertMillisecToMifosDateFormatStr(result.transactionDetails.transactionDate))  <= result.transactionDetails.financialYearEndDate ){
                    AccountingDetails.setFinancialYearEndvar(dateUtils.convertMillisecToMifosDateFormatStr(result.transactionDetails.transactionDate));
                }else{
                    AccountingDetails.setFinancialYearEndvar(dateUtils.convertToDateWithSlash(result.transactionDetails.financialYearEndDate));
                }
                AccountingDetails.setTransactionDate(dateUtils.convertMillisecToMifosDateFormatStr(result.transactionDetails.transactionDate));
                AccountingDetails.setFinancialYearStartvar(dateUtils.convertToDateWithSlash(result.transactionDetails.financialYearStartDate));
                if(result.transactionDetails.mainAccountOfficeList != null){
                    for(var i=0;i<result.transactionDetails.mainAccountOfficeList.length;i++){
                        fromOfficeListId[i] = result.transactionDetails.mainAccountOfficeList[i].globalNum;
                        fromOfficeListName[i] = result.transactionDetails.mainAccountOfficeList[i].name;
                    }
                }
                AccountingDetails.setMainAccountOfficeHierarchyId(fromOfficeListId);
                AccountingDetails.setMainAccountOfficeHierarchyvar(fromOfficeListName);
                if(result.transactionDetails.subAccountOfficeList != null){
                    for(var i=0;i<result.transactionDetails.subAccountOfficeList.length;i++){
                        subOfficeListId[i] = result.transactionDetails.subAccountOfficeList[i].globalNum;
                        subOfficeListName[i] = result.transactionDetails.subAccountOfficeList[i].name;
                    }
                }
                AccountingDetails.setSubAccountOfficeHierarchyvar(subOfficeListName);
                AccountingDetails.setSubAccountOfficeHierarchyId(subOfficeListId);
                if(result.transactionDetails.mainAccountList != null){
                    var j=0;
                    for(var i=0;i<result.transactionDetails.mainAccountList.length;i++){
                        if(req.session.officeId == result.transactionDetails.mainAccountList[i].officeId || result.transactionDetails.mainAccountList[i].officeId == 1 || req.session.officeId == 1){
                            if(microFinanceGlcode != result.transactionDetails.mainAccountList[i].glcode){
                                mainAccountListGlCode[j] = result.transactionDetails.mainAccountList[i].glcode;
                                mainAccountListGlName[j] = result.transactionDetails.mainAccountList[i].glname;
                                //testmainAccountListGlName[j] = result.transactionDetails.mainAccountList[i].glname;
                                mainAccountOfficeListGlCode[j] = result.transactionDetails.mainAccountList[i].officeId;
                                j++;
                            }
                        }
                    }
                }

                AccountingDetails.setMainAccountGlcodeId(mainAccountListGlCode);
                AccountingDetails.setMainAccountvar(mainAccountListGlName);
                AccountingDetails.setMainAccountGlcodeOfficeId(mainAccountOfficeListGlCode);
                if(result.transactionDetails.subAccountList != null){
                    var count = 0;
                    for(var i=0;i<result.transactionDetails.subAccountList.length;i++){
                        if(microFinanceGlcode != result.transactionDetails.subAccountList[i].glcode){
                            subAccountListGlCode[count] = result.transactionDetails.subAccountList[i].glcode;
                            subAccountListGlName[count] = result.transactionDetails.subAccountList[i].glname + "(" + result.transactionDetails.subAccountList[i].glcode + ")";
                            subAccountOfficeListGlCode[count] = result.transactionDetails.subAccountList[i].officeId;
                            count++;
                        }
                    }
                }
                AccountingDetails.setSubAccountGlcodeId(subAccountListGlCode);
                AccountingDetails.setSubAccountvar(subAccountListGlName);
                AccountingDetails.setSubAccountGlcodeOfficeId(subAccountOfficeListGlCode);

                AccountingDetails.setAllowedDecimals(result.transactionDetails.allowedDecimals);

                var statusMessage = "";
                if(req.session.cashPayment == "success"){
                    statusMessage = "Transaction Successful";
                    req.session.cashPayment = "";
                }
                var errorMessage = "";
                if(req.body.error != ""){
                    errorMessage = req.body.error;
                }
                var officeId = req.session.officeId;
                var globalOfficeNum;
                if(req.session.officeId <= 9){
                    globalOfficeNum = '000'+req.session.officeId;
                }else if(req.session.officeId > 9 && req.session.officeId < 100){
                    globalOfficeNum = '00'+req.session.officeId;
                }else {
                    globalOfficeNum = '0'+req.session.officeId;
                }
                var transactionMasterId=""  ;
                var dateofTransactionFrom="" ;
                var dateofTransactionToDate="";
                var selectedOfficeIdVoucher="";
                if(req.body.cashPayment == "success" || req.body.cashPayment == "failureEdit"){
                    transactionMasterId = req.body.transactionMasterId;
                    dateofTransactionFrom = req.body.dateofTransaction;
                    dateofTransactionToDate = req.body.dateofTransactionToDate;
                    selectedOfficeIdVoucher = req.body.selectedOfficeId;
                }
                if(req.body.cashPayment == "failure" ||req.body.cashPayment == "failureEdit"){
                    var fromOfficeHierarchyValue = parseInt(req.body.fromofficeHierarchy,10);
                    var toOfficeHierarchyValue = parseInt(req.body.toofficeHierarchy,10);
                    var fromOfficeValue = req.body.fromOfficeValue;
                    var toOfficeValue = req.body.toOfficeValue;
                    var fromAccountValue = req.body.fromAccount;
                    var toAccountValue = req.body.toAccount ;
                    var trxnAmount = req.body.transactionAmount;
                    var notes =  req.body.transactionNotes;
                    var trxnDate =  req.body.transactionDate;
                    res.render("accounting/expensesCashPayment",{AccountingDetails : AccountingDetails,roleId:req.session.roleId, statusMessage : statusMessage,errorMessage:errorMessage,officeId : officeId, globalOfficeNum : globalOfficeNum,
                        officeHierarchyNameArray:officeHierarchyNameArray,fromOfficeHierarchyValue:fromOfficeHierarchyValue,toOfficeHierarchyValue:toOfficeHierarchyValue,fromOfficeValue:fromOfficeValue,toOfficeValue:toOfficeValue,fromAccountValue:fromAccountValue,toAccountValue:toAccountValue,
                        trxnAmount:trxnAmount,notes:notes,trxnDate:trxnDate, contextPath:props.contextPath,transactionMasterIdValue:transactionMasterId,dateofTransactionFrom:dateofTransactionFrom,dateofTransactionToDate:dateofTransactionToDate,selectedOfficeIdVoucher:selectedOfficeIdVoucher});
                }
                else if(req.body.cashPayment == "success" && req.body.transactionDetails != null)
                {
                    var fromOfficeHierarchyValue = req.body.transactionDetails.fromOfficeLevelId;
                    var toOfficeHierarchyValue = req.body.transactionDetails.toOfficeLevelId;
                    var fromOfficeValue = req.body.transactionDetails.fromOfficeId;
                    var toOfficeValue = req.body.transactionDetails.toOfficeId;
                    var fromAccountValue = req.body.transactionDetails.mainAccountGlCode;
                    var toAccountValue = req.body.transactionDetails.subAccountGlCode;
                    var toOffice = req.body.transactionDetails.toOfficeId;
                    var trxnDate = dateUtils.convertToDateFormat(req.body.transactionDetails.trxnDate);
                    var trxnAmount = req.body.transactionDetails.trxnAmt;
                    var notes = req.body.transactionDetails.notes;
                    res.render("accounting/expensesCashPayment",{AccountingDetails : AccountingDetails,roleId:req.session.roleId, statusMessage : statusMessage,errorMessage:errorMessage,officeId : officeId, globalOfficeNum : globalOfficeNum,
                        officeHierarchyNameArray:officeHierarchyNameArray,fromOfficeHierarchyValue:fromOfficeHierarchyValue,toOfficeHierarchyValue:toOfficeHierarchyValue,fromOfficeValue:fromOfficeValue,toOfficeValue:toOfficeValue,fromAccountValue:fromAccountValue,toAccountValue:toAccountValue,
                        trxnAmount:trxnAmount,notes:notes,trxnDate:trxnDate, contextPath:props.contextPath,transactionMasterIdValue:transactionMasterId,dateofTransactionFrom:dateofTransactionFrom,dateofTransactionToDate:dateofTransactionToDate,selectedOfficeIdVoucher:selectedOfficeIdVoucher,typeOfTransaction:req.body.typeOfTransaction});
                }else{
                    res.render("accounting/expensesCashPayment",{AccountingDetails : AccountingDetails,roleId:req.session.roleId, statusMessage : statusMessage,errorMessage:errorMessage,officeId : officeId, globalOfficeNum : globalOfficeNum,
                        officeHierarchyNameArray:officeHierarchyNameArray,fromOfficeHierarchyValue:"",toOfficeHierarchyValue:"",fromOfficeValue:"",toOfficeValue:"",fromAccountValue:"",toAccountValue:"",
                        trxnAmount:"",notes:"Cash Payment.",trxnDate:AccountingDetails.getTransactionDate(), contextPath:props.contextPath,transactionMasterIdValue:transactionMasterId,dateofTransactionFrom:dateofTransactionFrom,dateofTransactionToDate:dateofTransactionToDate,selectedOfficeIdVoucher:selectedOfficeIdVoucher});
                }
            }else{
                self.commonRouter.showErrorPage(req,res);
            }
        });
    },
    submitCashPayment : function(req,res){
        res.setTimeout(0);
        var self = this;
        var AccountingDetails = require(path.join(rootPath,"app_modules/dto/accounting/AccountingDetails"));
        var AccountingDetails = new AccountingDetails();
        this.AccountingDetails = AccountingDetails;
        var AccountingDetails = this.AccountingDetails;
        AccountingDetails.setTransactionDate(dateUtils.convertToYMDFormat(req.body.transactionDate));
        AccountingDetails.setTransactionType(req.body.transactionType);
        AccountingDetails.setMainAccountOfficeHierarchy(parseInt(req.body.fromofficeHierarchy,10));
        AccountingDetails.setMainAccountOffice(req.body.fromOfficeValue);
        AccountingDetails.setMainAccount(req.body.fromAccount);
        AccountingDetails.setSubAccountOfficeHierarchy(parseInt(req.body.toofficeHierarchy,10));
        AccountingDetails.setSubAccountOffice(req.body.toOfficeValue);
        AccountingDetails.setSubAccount(req.body.toAccount);
        AccountingDetails.setAmount(req.body.transactionAmount);
        AccountingDetails.setContra(false);
        AccountingDetails.setNotes(req.body.transactionNotes);
        var jsonArray = JSON.stringify(AccountingDetails);
        customlog.info("jsonArray" + jsonArray);
        var rest = require("./rest.js");
        var http = require('http');
        var https = require('https');
        var postheaders = {
            'Content-Type' : 'application/json',
            'Content-Length' : Buffer.byteLength(jsonArray, 'utf8'),
            'Cookie' : req.session.mifosCookie
        };
        var options = {
            host: mifosServiceIP,
            port: mifosPort,
            path: "/mfi/api/accounting/payment/cash.json",
            method: 'POST',
            headers : postheaders
        };
        rest.postJSON(options,jsonArray,function(statuscode,result,headers){
            if(statuscode == 302){
                res.redirect(props.contextPath+'/client/ci/logout');
            }else if(result.status == "success"){
                var activityDetails = new Array(iklantPort, req.session.tenantId, req.session.userId, req.session.userName, req.originalUrl, req.connection.remoteAddress, "routAccounting.js", "submitCashPayment", "success", "Accounting Cash Payment", "Cash Payment Entry Made Successfully from "+req.body.fromAccount+" to "+req.body.toAccount+ " for "+req.body.transactionNotes,"insert");
                self.commonRouter.insertActivityLogModel(activityDetails);
                req.session.cashPayment = "success";
                req.body.cashPayment = "success";
                self.cashPaymentForm(req,res);
            }else if(result.status == "failure"){
                if(result.hasOwnProperty('errors')){
                    req.body.cashPayment = "failure";
                    req.body.error = result.errors[0];
                }else{
                    customlog.error("Inside ELSE ERROR");
                    req.body.bankPayment = "runtime";
                }
                self.cashPaymentForm(req,res);
            }else{
                self.commonRouter.showErrorPage(req,res);
            }
        });
    },
    cashReceiptForm : function(req,res) {
        var self = this;
        var rest = require("./rest.js");
        var http = require('http');
        var https = require('https');
        customlog.info(req.session.mifosCookie);
        var postheaders = {
            'Content-Type' : 'application/json',
            'Cookie' : req.session.mifosCookie
        };
        var options = {
            host: mifosServiceIP,
            port: mifosPort,
            path: "/mfi/api/accounting/receipt/cash/load.json",
            method: 'GET',
            headers : postheaders
        };
        rest.getJSON(options,function(statuscode,result,headers){
            customlog.info("statuscode:"+statuscode);
            customlog.info("result:" + result.status);
            if(statuscode == 302){
                res.redirect(props.contextPath+'/client/ci/logout');
            }else if(result.status == "success"){
                //var activityDetails = new Array(iklantPort, req.session.tenantId, req.session.userId, req.session.userName, req.originalUrl, req.connection.remoteAddress, "routAccounting.js", "cashReceiptForm", "success", "cashReceiptForm", "Cash Receipt");
                //self.commonRouter.insertActivityLogModel(activityDetails);
                var fromOfficeListId 	= new Array();
                var subOfficeListId 	= new Array();
                var fromOfficeListName 	= new Array();
                var subOfficeListName 	= new Array();
                var mainAccountListGlName 	= new Array();
                var mainAccountListGlCode 	= new Array();
                var mainAccountOfficeListGlCode 	= new Array();
                var subAccountListGlName 	= new Array();
                var subAccountListGlCode 	= new Array();
                var subAccountOfficeListGlCode 	= new Array();

                var headOfficeNameVar = new Array();
                var headOfficeId = new Array();

                var regionalOfficeNameVar = new Array();
                var regionalOfficeId = new Array();

                var divisionalOfficeNameVar = new Array();
                var divisionalOfficeId = new Array();

                var areaOfficeNameVar = new Array();
                var areaOfficeId = new Array();

                var branchOfficeNameVar = new Array();
                var branchOfficeId = new Array();

                var AccountingDetails = require(path.join(rootPath,"app_modules/dto/accounting/AccountingDetails"));
                var AccountingDetails = new AccountingDetails();
                this.AccountingDetails = AccountingDetails;
                var AccountingDetails = this.AccountingDetails;
                AccountingDetails.setTransactionType(result.transactionDetails.transactionType);
                if(result.transactionDetails.officeHierarchyByLevelDto.headOffices != null){
                    for(var i=0;i<result.transactionDetails.officeHierarchyByLevelDto.headOffices.length;i++){
                        headOfficeId[i] = result.transactionDetails.officeHierarchyByLevelDto.headOffices[i].globalNum;
                        headOfficeNameVar[i] = result.transactionDetails.officeHierarchyByLevelDto.headOffices[i].name;
                    }
                }
                AccountingDetails.setHeadOfficeId(headOfficeId);
                AccountingDetails.setHeadOfficeNameVar(headOfficeNameVar);
                if(result.transactionDetails.officeHierarchyByLevelDto.regionalOffices != null){
                    for(var i=0;i<result.transactionDetails.officeHierarchyByLevelDto.regionalOffices.length;i++){
                        regionalOfficeId[i] = result.transactionDetails.officeHierarchyByLevelDto.regionalOffices[i].globalNum;
                        regionalOfficeNameVar[i] = result.transactionDetails.officeHierarchyByLevelDto.regionalOffices[i].name;
                    }
                }
                AccountingDetails.setRegionalOfficeId(regionalOfficeId);
                AccountingDetails.setRegionalOfficeNameVar(regionalOfficeNameVar);
                if(result.transactionDetails.officeHierarchyByLevelDto.divisionalOffices != null){
                    for(var i=0;i<result.transactionDetails.officeHierarchyByLevelDto.divisionalOffices.length;i++){
                        divisionalOfficeId[i] = result.transactionDetails.officeHierarchyByLevelDto.divisionalOffices[i].globalNum;
                        divisionalOfficeNameVar[i] = result.transactionDetails.officeHierarchyByLevelDto.divisionalOffices[i].name;
                    }
                }
                AccountingDetails.setDivisionalOfficeId(divisionalOfficeId);
                AccountingDetails.setDivisionalOfficeNameVar(divisionalOfficeNameVar);
                if(result.transactionDetails.officeHierarchyByLevelDto.areaOffices != null){
                    for(var i=0;i<result.transactionDetails.officeHierarchyByLevelDto.areaOffices.length;i++){
                        areaOfficeId[i] = result.transactionDetails.officeHierarchyByLevelDto.areaOffices[i].globalNum;
                        areaOfficeNameVar[i] = result.transactionDetails.officeHierarchyByLevelDto.areaOffices[i].name;
                    }
                }
                AccountingDetails.setAreaOfficeId(areaOfficeId);
                AccountingDetails.setAreaOfficeNameVar(areaOfficeNameVar);
                if(result.transactionDetails.officeHierarchyByLevelDto.branchOffices != null){
                    for(var i=0;i<result.transactionDetails.officeHierarchyByLevelDto.branchOffices.length;i++){
                        branchOfficeId[i] = result.transactionDetails.officeHierarchyByLevelDto.branchOffices[i].globalNum;
                        branchOfficeNameVar[i] = result.transactionDetails.officeHierarchyByLevelDto.branchOffices[i].name;
                    }
                }
                AccountingDetails.setBranchOfficeId(branchOfficeId);
                AccountingDetails.setBranchOfficeNameVar(branchOfficeNameVar);


                if( dateUtils.convertToYMDFormat(dateUtils.convertMillisecToMifosDateFormatStr(result.transactionDetails.transactionDate))  <= result.transactionDetails.financialYearEndDate ){
                    AccountingDetails.setFinancialYearEndvar(dateUtils.convertMillisecToMifosDateFormatStr(result.transactionDetails.transactionDate));
                }else{
                    AccountingDetails.setFinancialYearEndvar(dateUtils.convertToDateWithSlash(result.transactionDetails.financialYearEndDate));
                }
                AccountingDetails.setTransactionDate(dateUtils.convertMillisecToMifosDateFormatStr(result.transactionDetails.transactionDate));
                AccountingDetails.setFinancialYearStartvar(dateUtils.convertToDateWithSlash(result.transactionDetails.financialYearStartDate));
                if(result.transactionDetails.mainAccountOfficeList != null){
                    for(var i=0;i<result.transactionDetails.mainAccountOfficeList.length;i++){
                        fromOfficeListId[i] = result.transactionDetails.mainAccountOfficeList[i].globalNum;
                        fromOfficeListName[i] = result.transactionDetails.mainAccountOfficeList[i].name;
                    }
                }
                AccountingDetails.setMainAccountOfficeHierarchyId(fromOfficeListId);
                AccountingDetails.setMainAccountOfficeHierarchyvar(fromOfficeListName);
                if(result.transactionDetails.subAccountOfficeList != null){
                    for(var i=0;i<result.transactionDetails.subAccountOfficeList.length;i++){
                        subOfficeListId[i] = result.transactionDetails.subAccountOfficeList[i].globalNum;
                        subOfficeListName[i] = result.transactionDetails.subAccountOfficeList[i].name;
                    }
                }
                AccountingDetails.setSubAccountOfficeHierarchyvar(subOfficeListName);
                AccountingDetails.setSubAccountOfficeHierarchyId(subOfficeListId);
                if(result.transactionDetails.mainAccountList != null){
                    customlog.info("req.session.officeId"+req.session.officeId);
                    var j=0;
                    for(var i=0;i<result.transactionDetails.mainAccountList.length;i++){
                        if(req.session.officeId == result.transactionDetails.mainAccountList[i].officeId || result.transactionDetails.mainAccountList[i].officeId == 1 || req.session.officeId == 1){
                            if(microFinanceGlcode != result.transactionDetails.mainAccountList[i].glcode){
                                mainAccountListGlCode[j] = result.transactionDetails.mainAccountList[i].glcode;
                                mainAccountListGlName[j] = result.transactionDetails.mainAccountList[i].glname;
                                mainAccountOfficeListGlCode[j] = result.transactionDetails.mainAccountList[i].officeId;
                                j++;
                            }
                        }
                    }
                }

                AccountingDetails.setMainAccountGlcodeId(mainAccountListGlCode);
                AccountingDetails.setMainAccountvar(mainAccountListGlName);
                AccountingDetails.setMainAccountGlcodeOfficeId(mainAccountOfficeListGlCode);
                if(result.transactionDetails.subAccountList != null){
                    var count = 0;
                    for(var i=0;i<result.transactionDetails.subAccountList.length;i++){
                        if(microFinanceGlcode != result.transactionDetails.subAccountList[i].glcode){
                            subAccountListGlCode[count] = result.transactionDetails.subAccountList[i].glcode;
                            subAccountListGlName[count] = result.transactionDetails.subAccountList[i].glname + "(" + result.transactionDetails.subAccountList[i].glcode + ")";
                            subAccountOfficeListGlCode[count] = result.transactionDetails.subAccountList[i].officeId;
                            count++;
                        }
                    }
                }
                AccountingDetails.setSubAccountGlcodeId(subAccountListGlCode);
                AccountingDetails.setSubAccountvar(subAccountListGlName);
                AccountingDetails.setSubAccountGlcodeOfficeId(subAccountOfficeListGlCode);

                AccountingDetails.setAllowedDecimals(result.transactionDetails.allowedDecimals);

                var statusMessage = "";
                if(req.session.cashReceipt == "success"){
                    statusMessage = "Transaction Successful";
                    req.session.cashReceipt = "";
                }
                var errorMessage = "";
                if(req.body.error != ""){
                    errorMessage = req.body.error;
                }
                var officeId = req.session.officeId;
                var globalOfficeNum;
                if(req.session.officeId <= 9){
                    globalOfficeNum = '000'+req.session.officeId;
                }else if(req.session.officeId > 9 && req.session.officeId < 100){
                    globalOfficeNum = '00'+req.session.officeId;
                }else {
                    globalOfficeNum = '0'+req.session.officeId;
                }
                var transactionMasterId=""  ;
                var dateofTransactionFrom="" ;
                var dateofTransactionToDate="";
                var selectedOfficeIdVoucher="";
                if(req.body.cashReceipt == "success" || req.body.cashReceipt == "failureEdit"){
                    transactionMasterId = req.body.transactionMasterId;
                    dateofTransactionFrom = req.body.dateofTransaction;
                    dateofTransactionToDate = req.body.dateofTransactionToDate;
                    selectedOfficeIdVoucher = req.body.selectedOfficeId;
                }
                if(req.body.cashReceipt == "failure"||req.body.cashReceipt == "failureEdit"){
                    var fromOfficeHierarchyValue = parseInt(req.body.fromofficeHierarchy,10);
                    var toOfficeHierarchyValue = parseInt(req.body.toofficeHierarchy,10);
                    var fromOfficeValue = req.body.fromOfficeValue;
                    var toOfficeValue = req.body.toOfficeValue;
                    var fromAccountValue = req.body.fromAccount;
                    var toAccountValue = req.body.toAccount ;
                    var trxnAmount = req.body.transactionAmount;
                    var notes =  req.body.transactionNotes;
                    var trxnDate =  req.body.transactionDate;
                    res.render("accounting/expensesCashReceipt",{AccountingDetails : AccountingDetails,roleId:req.session.roleId, statusMessage : statusMessage,errorMessage:errorMessage,officeId : officeId, globalOfficeNum : globalOfficeNum,
                        officeHierarchyNameArray:officeHierarchyNameArray,fromOfficeHierarchyValue:fromOfficeHierarchyValue,toOfficeHierarchyValue:toOfficeHierarchyValue,fromOfficeValue:fromOfficeValue,toOfficeValue:toOfficeValue,fromAccountValue:fromAccountValue,toAccountValue:toAccountValue,
                        trxnAmount:trxnAmount,notes:notes,trxnDate:trxnDate, contextPath:props.contextPath,transactionMasterIdValue:transactionMasterId,dateofTransactionFrom:dateofTransactionFrom,dateofTransactionToDate:dateofTransactionToDate,selectedOfficeIdVoucher:selectedOfficeIdVoucher});
                } else if(req.body.cashReceipt == "success" && req.body.transactionDetails != null)
                {
                    var fromOfficeHierarchyValue = req.body.transactionDetails.fromOfficeLevelId;
                    var toOfficeHierarchyValue = req.body.transactionDetails.toOfficeLevelId;
                    var fromOfficeValue = req.body.transactionDetails.fromOfficeId;
                    var toOfficeValue = req.body.transactionDetails.toOfficeId;
                    var fromAccountValue = req.body.transactionDetails.mainAccountGlCode;
                    var toAccountValue = req.body.transactionDetails.subAccountGlCode;
                    var toOffice = req.body.transactionDetails.toOfficeId;
                    var trxnDate = dateUtils.convertToDateFormat(req.body.transactionDetails.trxnDate);
                    var trxnAmount = req.body.transactionDetails.trxnAmt;
                    var notes = req.body.transactionDetails.notes;
                    res.render("accounting/expensesCashReceipt",{AccountingDetails : AccountingDetails,roleId:req.session.roleId, statusMessage : statusMessage,errorMessage:errorMessage,officeId : officeId, globalOfficeNum : globalOfficeNum,
                        officeHierarchyNameArray:officeHierarchyNameArray,fromOfficeHierarchyValue:fromOfficeHierarchyValue,toOfficeHierarchyValue:toOfficeHierarchyValue,fromOfficeValue:fromOfficeValue,toOfficeValue:toOfficeValue,fromAccountValue:fromAccountValue,toAccountValue:toAccountValue,
                        trxnAmount:trxnAmount,notes:notes,trxnDate:trxnDate, contextPath:props.contextPath,transactionMasterIdValue:transactionMasterId,dateofTransactionFrom:dateofTransactionFrom,dateofTransactionToDate:dateofTransactionToDate,selectedOfficeIdVoucher:selectedOfficeIdVoucher,typeOfTransaction:req.body.typeOfTransaction});
                }
                else{
                    res.render("accounting/expensesCashReceipt",{AccountingDetails : AccountingDetails,roleId:req.session.roleId, statusMessage : statusMessage,errorMessage:errorMessage,officeId : officeId, globalOfficeNum : globalOfficeNum,
                        officeHierarchyNameArray:officeHierarchyNameArray,fromOfficeHierarchyValue:"",toOfficeHierarchyValue:"",fromOfficeValue:"",toOfficeValue:"",fromAccountValue:"",toAccountValue:"",
                        trxnAmount:"",notes:"Cash Receipt.",trxnDate:AccountingDetails.getTransactionDate(), contextPath:props.contextPath,transactionMasterIdValue:transactionMasterId,dateofTransactionFrom:dateofTransactionFrom,dateofTransactionToDate:dateofTransactionToDate,selectedOfficeIdVoucher:selectedOfficeIdVoucher});
                }
            }else{
                self.commonRouter.showErrorPage(req,res);
            }
        });
    },
    submitCashReceipt : function(req,res){
        res.setTimeout(0);
        var self = this;
        var AccountingDetails = require(path.join(rootPath,"app_modules/dto/accounting/AccountingDetails"));
        var AccountingDetails = new AccountingDetails();
        this.AccountingDetails = AccountingDetails;
        var AccountingDetails = this.AccountingDetails;
        AccountingDetails.setTransactionDate(dateUtils.convertToYMDFormat(req.body.transactionDate));
        AccountingDetails.setTransactionType(req.body.transactionType);
        AccountingDetails.setMainAccountOfficeHierarchy(parseInt(req.body.fromofficeHierarchy,10));
        AccountingDetails.setMainAccountOffice(req.body.fromOfficeValue);
        AccountingDetails.setMainAccount(req.body.fromAccount);
        AccountingDetails.setSubAccountOfficeHierarchy(parseInt(req.body.toofficeHierarchy,10));
        AccountingDetails.setSubAccountOffice(req.body.toOfficeValue);
        AccountingDetails.setSubAccount(req.body.toAccount);
        AccountingDetails.setAmount(req.body.transactionAmount);
        AccountingDetails.setContra(false);
        AccountingDetails.setNotes(req.body.transactionNotes);
        var jsonArray = JSON.stringify(AccountingDetails);
        customlog.info("jsonArray" + jsonArray);
        var rest = require("./rest.js");
        var http = require('http');
        var https = require('https');
        var postheaders = {
            'Content-Type' : 'application/json',
            'Content-Length' : Buffer.byteLength(jsonArray, 'utf8'),
            'Cookie' : req.session.mifosCookie
        };
        var options = {
            host: mifosServiceIP,
            port: mifosPort,
            path: "/mfi/api/accounting/receipt/cash.json",
            method: 'POST',
            headers : postheaders
        };
        rest.postJSON(options,jsonArray,function(statuscode,result,headers){
            if(statuscode == 302){
                res.redirect(props.contextPath+'/client/ci/logout');
            }else if(result.status == "success"){
                var activityDetails = new Array(iklantPort, req.session.tenantId, req.session.userId, req.session.userName, req.originalUrl, req.connection.remoteAddress, "routAccounting.js", "submitCashReceipt", "success", "Accounting Cash Receipt", "Cash Receipt Entry Made Successfully from "+req.body.fromAccount+" to "+req.body.toAccount+ " for "+req.body.transactionNotes,"insert");
                self.commonRouter.insertActivityLogModel(activityDetails);
                req.session.cashReceipt = "success";
                req.body.cashReceipt = "success";
                self.cashReceiptForm(req,res);
            }else if(result.status == "failure"){
                if(result.hasOwnProperty('errors')){
                    req.body.cashReceipt = "failure";
                    req.body.error = result.errors[0];
                }else{
                    customlog.error("Inside ELSE ERROR");
                    req.body.bankPayment = "runtime";
                }
                self.cashReceiptForm(req,res);
            }else{
                self.commonRouter.showErrorPage(req,res);
            }
        });
    },
    bankPaymentForm : function(req,res) {
        var self = this;
        var rest = require("./rest.js");
        var http = require('http');
        var https = require('https');
        customlog.info(req.session.mifosCookie);
        var postheaders = {
            'Content-Type' : 'application/json',
            'Cookie' : req.session.mifosCookie
        };
        var options = {
            host: mifosServiceIP,
            port: mifosPort,
            path: "/mfi/api/accounting/payment/bank/load.json",
            method: 'GET',
            headers : postheaders
        };
        rest.getJSON(options,function(statuscode,result,headers){
            customlog.info("statuscode:"+statuscode);
            customlog.info("result:" + result.status);
            if(statuscode == 302){
                res.redirect(props.contextPath+'/client/ci/logout');
            }else if(result.status == "success"){
                //var activityDetails = new Array(iklantPort, req.session.tenantId, req.session.userId, req.session.userName, req.originalUrl, req.connection.remoteAddress, "routAccounting.js", "bankPaymentForm", "success", "Bank Payment", "bankPaymentForm");
                //self.commonRouter.insertActivityLogModel(activityDetails);
                var fromOfficeListId 	= new Array();
                var subOfficeListId 	= new Array();
                var fromOfficeListName 	= new Array();
                var subOfficeListName 	= new Array();
                var mainAccountListGlName 	= new Array();
                var mainAccountListGlCode 	= new Array();
                var mainAccountOfficeListGlCode 	= new Array();
                var subAccountListGlName 	= new Array();
                var subAccountListGlCode 	= new Array();
                var subAccountOfficeListGlCode 	= new Array();

                var headOfficeNameVar = new Array();
                var headOfficeId = new Array();

                var regionalOfficeNameVar = new Array();
                var regionalOfficeId = new Array();

                var divisionalOfficeNameVar = new Array();
                var divisionalOfficeId = new Array();

                var areaOfficeNameVar = new Array();
                var areaOfficeId = new Array();

                var branchOfficeNameVar = new Array();
                var branchOfficeId = new Array();

                var AccountingDetails = require(path.join(rootPath,"app_modules/dto/accounting/AccountingDetails"));
                var AccountingDetails = new AccountingDetails();
                this.AccountingDetails = AccountingDetails;
                var AccountingDetails = this.AccountingDetails;
                AccountingDetails.setTransactionType(result.transactionDetails.transactionType);
                if(result.transactionDetails.officeHierarchyByLevelDto.headOffices != null){
                    for(var i=0;i<result.transactionDetails.officeHierarchyByLevelDto.headOffices.length;i++){
                        headOfficeId[i] = result.transactionDetails.officeHierarchyByLevelDto.headOffices[i].globalNum;
                        headOfficeNameVar[i] = result.transactionDetails.officeHierarchyByLevelDto.headOffices[i].name;
                    }
                }
                AccountingDetails.setHeadOfficeId(headOfficeId);
                AccountingDetails.setHeadOfficeNameVar(headOfficeNameVar);
                if(result.transactionDetails.officeHierarchyByLevelDto.regionalOffices != null){
                    for(var i=0;i<result.transactionDetails.officeHierarchyByLevelDto.regionalOffices.length;i++){
                        regionalOfficeId[i] = result.transactionDetails.officeHierarchyByLevelDto.regionalOffices[i].globalNum;
                        regionalOfficeNameVar[i] = result.transactionDetails.officeHierarchyByLevelDto.regionalOffices[i].name;
                    }
                }
                AccountingDetails.setRegionalOfficeId(regionalOfficeId);
                AccountingDetails.setRegionalOfficeNameVar(regionalOfficeNameVar);
                if(result.transactionDetails.officeHierarchyByLevelDto.divisionalOffices != null){
                    for(var i=0;i<result.transactionDetails.officeHierarchyByLevelDto.divisionalOffices.length;i++){
                        divisionalOfficeId[i] = result.transactionDetails.officeHierarchyByLevelDto.divisionalOffices[i].globalNum;
                        divisionalOfficeNameVar[i] = result.transactionDetails.officeHierarchyByLevelDto.divisionalOffices[i].name;
                    }
                }
                AccountingDetails.setDivisionalOfficeId(divisionalOfficeId);
                AccountingDetails.setDivisionalOfficeNameVar(divisionalOfficeNameVar);
                if(result.transactionDetails.officeHierarchyByLevelDto.areaOffices != null){
                    for(var i=0;i<result.transactionDetails.officeHierarchyByLevelDto.areaOffices.length;i++){
                        areaOfficeId[i] = result.transactionDetails.officeHierarchyByLevelDto.areaOffices[i].globalNum;
                        areaOfficeNameVar[i] = result.transactionDetails.officeHierarchyByLevelDto.areaOffices[i].name;
                    }
                }
                AccountingDetails.setAreaOfficeId(areaOfficeId);
                AccountingDetails.setAreaOfficeNameVar(areaOfficeNameVar);
                if(result.transactionDetails.officeHierarchyByLevelDto.branchOffices != null){
                    for(var i=0;i<result.transactionDetails.officeHierarchyByLevelDto.branchOffices.length;i++){
                        branchOfficeId[i] = result.transactionDetails.officeHierarchyByLevelDto.branchOffices[i].globalNum;
                        branchOfficeNameVar[i] = result.transactionDetails.officeHierarchyByLevelDto.branchOffices[i].name;
                    }
                }
                AccountingDetails.setBranchOfficeId(branchOfficeId);
                AccountingDetails.setBranchOfficeNameVar(branchOfficeNameVar);


                if( dateUtils.convertToYMDFormat(dateUtils.convertMillisecToMifosDateFormatStr(result.transactionDetails.transactionDate))  <= result.transactionDetails.financialYearEndDate ){
                    AccountingDetails.setFinancialYearEndvar(dateUtils.convertMillisecToMifosDateFormatStr(result.transactionDetails.transactionDate));
                }else{
                    AccountingDetails.setFinancialYearEndvar(dateUtils.convertToDateWithSlash(result.transactionDetails.financialYearEndDate));
                }
                AccountingDetails.setTransactionDate(dateUtils.convertMillisecToMifosDateFormatStr(result.transactionDetails.transactionDate));
                AccountingDetails.setFinancialYearStartvar(dateUtils.convertToDateWithSlash(result.transactionDetails.financialYearStartDate));
                if(result.transactionDetails.mainAccountOfficeList != null){
                    for(var i=0;i<result.transactionDetails.mainAccountOfficeList.length;i++){
                        fromOfficeListId[i] = result.transactionDetails.mainAccountOfficeList[i].globalNum;
                        fromOfficeListName[i] = result.transactionDetails.mainAccountOfficeList[i].name;
                    }
                }
                AccountingDetails.setMainAccountOfficeHierarchyId(fromOfficeListId);
                AccountingDetails.setMainAccountOfficeHierarchyvar(fromOfficeListName);
                if(result.transactionDetails.subAccountOfficeList != null){
                    for(var i=0;i<result.transactionDetails.subAccountOfficeList.length;i++){
                        subOfficeListId[i] = result.transactionDetails.subAccountOfficeList[i].globalNum;
                        subOfficeListName[i] = result.transactionDetails.subAccountOfficeList[i].name;
                    }
                }
                AccountingDetails.setSubAccountOfficeHierarchyvar(subOfficeListName);
                AccountingDetails.setSubAccountOfficeHierarchyId(subOfficeListId);
                if(result.transactionDetails.mainAccountList != null){
                    //customlog.info("req.session.officeId"+req.session.officeId);
                    var count = 0;
                    for(var i=0;i<result.transactionDetails.mainAccountList.length;i++){
                        if(req.session.officeId == result.transactionDetails.mainAccountList[i].officeId || result.transactionDetails.mainAccountList[i].officeId == 1 || req.session.officeId == 1){
                            if(microFinanceGlcode != result.transactionDetails.mainAccountList[i].glcode){
                                mainAccountListGlCode[count] = result.transactionDetails.mainAccountList[i].glcode;
                                mainAccountListGlName[count] = result.transactionDetails.mainAccountList[i].glname;
                                mainAccountOfficeListGlCode[count] = result.transactionDetails.mainAccountList[i].officeId;
                                count++;
                            }
                        }
                    }
                }

                AccountingDetails.setMainAccountGlcodeId(mainAccountListGlCode);
                AccountingDetails.setMainAccountvar(mainAccountListGlName);
                AccountingDetails.setMainAccountGlcodeOfficeId(mainAccountOfficeListGlCode);
                if(result.transactionDetails.subAccountList != null){
                    var count = 0;
                    for(var i=0;i<result.transactionDetails.subAccountList.length;i++){
                        if(microFinanceGlcode != result.transactionDetails.subAccountList[i].glcode){
                            subAccountListGlCode[count] = result.transactionDetails.subAccountList[i].glcode;
                            subAccountListGlName[count] = result.transactionDetails.subAccountList[i].glname + "(" + result.transactionDetails.subAccountList[i].glcode + ")";
                            subAccountOfficeListGlCode[count] = result.transactionDetails.subAccountList[i].officeId;
                            count++;
                        }
                    }
                }
                AccountingDetails.setSubAccountGlcodeId(subAccountListGlCode);
                AccountingDetails.setSubAccountvar(subAccountListGlName);
                AccountingDetails.setSubAccountGlcodeOfficeId(subAccountOfficeListGlCode);

                AccountingDetails.setAllowedDecimals(result.transactionDetails.allowedDecimals);

                var statusMessage = "";
                if(req.session.bankPayment == "success"){
                    statusMessage = "Transaction Successful";
                    req.session.bankPayment = "";
                }
                var errorMessage = "";
                if(req.body.error != ""){
                    errorMessage = req.body.error;
                }
                var officeId = req.session.officeId;
                var globalOfficeNum;
                if(req.session.officeId <= 9){
                    globalOfficeNum = '000'+req.session.officeId;
                }else if(req.session.officeId > 9 && req.session.officeId < 100){
                    globalOfficeNum = '00'+req.session.officeId;
                }else {
                    globalOfficeNum = '0'+req.session.officeId;
                }
                // Added by chitra for Edit Transaction
                var transactionMasterId = "",dateofTransactionFrom = "";
                var dateofTransactionToDate = "",selectedOfficeIdVoucher = "";
                if(req.body.bankPayment == "success" || req.body.bankPayment == "failureEdit"){
                    transactionMasterId = req.body.transactionMasterId;
                    dateofTransactionFrom = req.body.dateofTransaction;
                    dateofTransactionToDate = req.body.dateofTransactionToDate;
                    selectedOfficeIdVoucher = req.body.selectedOfficeId;
                }
                if(req.body.bankPayment == "failure" || req.body.bankPayment == "failureEdit"){

                    var fromOfficeHierarchyValue = parseInt(req.body.fromofficeHierarchy,10);
                    var toOfficeHierarchyValue = parseInt(req.body.toofficeHierarchy,10);
                    var fromOfficeValue = req.body.fromOfficeValue;
                    var toOfficeValue = req.body.toOfficeValue;
                    var fromAccountValue = req.body.fromAccount;
                    var toAccountValue = req.body.toAccount ;
                    var trxnAmount = req.body.transactionAmount;
                    var chequeNo = "" ,chequeDate = "";
                    var trxnDate =  req.body.transactionDate;
                    var reconciledDate;
                    if(typeof(req.body.chequeNo) == 'undefined' | req.body.chequeNo == '' |  req.body.chequeNo == 'NULL'){
                        chequeNo = "";
                    }else{
                        chequeNo = req.body.chequeNo;
                    }
                    if(typeof(req.body.chequeDate) == 'undefined' | req.body.chequeDate == '' |  req.body.chequeDate == 'NULL'){
                        chequeDate = "";
                    }else{
                        chequeDate = req.body.chequeDate;
                    }
                    if(typeof(req.body.reconciledDateId) == 'undefined' | req.body.reconciledDateId == '' |  req.body.reconciledDateId== 'NULL'){
                        reconciledDate = "";
                    }else{
                        reconciledDate = dateUtils.convertToDateFormat(req.body.reconciledDateId);
                    }
                    var notes =  req.body.transactionNotes;
                    res.render("accounting/expensesBankPayment",{AccountingDetails : AccountingDetails,roleId:req.session.roleId, statusMessage : statusMessage,errorMessage:errorMessage,officeId : officeId, globalOfficeNum : globalOfficeNum,reconciledDate:reconciledDate,typeOfTransaction:req.body.typeOfTransaction,
                        officeHierarchyNameArray:officeHierarchyNameArray,fromOfficeHierarchyValue:fromOfficeHierarchyValue,toOfficeHierarchyValue:toOfficeHierarchyValue,fromOfficeValue:fromOfficeValue,toOfficeValue:toOfficeValue,fromAccountValue:fromAccountValue,toAccountValue:toAccountValue,
                        trxnAmount:trxnAmount,chequeNo:chequeNo,chequeDate:chequeDate,notes:notes,trxnDate:trxnDate, contextPath:props.contextPath,transactionMasterIdValue:transactionMasterId,dateofTransactionFrom:dateofTransactionFrom,dateofTransactionToDate:dateofTransactionToDate,selectedOfficeIdVoucher:selectedOfficeIdVoucher});

                }else if(req.body.bankPayment == "success" && req.body.transactionDetails != null)
                {
                    var fromOfficeHierarchyValue = req.body.transactionDetails.fromOfficeLevelId;
                    var toOfficeHierarchyValue = req.body.transactionDetails.toOfficeLevelId;
                    var fromOfficeValue = req.body.transactionDetails.fromOfficeId;
                    var toOfficeValue = req.body.transactionDetails.toOfficeId;
                    var fromAccountValue = req.body.transactionDetails.mainAccountGlCode;
                    var toAccountValue = req.body.transactionDetails.subAccountGlCode;
                    var toOffice = req.body.transactionDetails.toOfficeId;
                    var trxnDate = dateUtils.convertToDateFormat(req.body.transactionDetails.trxnDate);
                    var reconciledDate;
                    var trxnAmt = req.body.transactionDetails.trxnAmt;

                    if(typeof(req.body.transactionDetails.chequeNo) == 'undefined' | req.body.transactionDetails.chequeNo == '' |  req.body.transactionDetails.chequeNo== null){
                        chequeNo = "";
                    }else{
                        chequeNo = req.body.transactionDetails.chequeNo;
                    }
                    if(typeof(req.body.transactionDetails.chequeDate) == 'undefined' | req.body.transactionDetails.chequeDate == '' |  req.body.transactionDetails.chequeDate== null){
                        chequeDate = "";
                    }else{
                        chequeDate = dateUtils.convertToDateFormat(req.body.transactionDetails.chequeDate);
                    }
                    if(typeof(req.body.transactionDetails.reconciledDate) == 'undefined' | req.body.transactionDetails.reconciledDate == '' |  req.body.transactionDetails.reconciledDate== null){
                        reconciledDate = "";
                    }else{
                        reconciledDate = dateUtils.convertToDateFormat(req.body.transactionDetails.reconciledDate);
                    }
                    var notes = req.body.transactionDetails.notes;

                    res.render("accounting/expensesBankPayment",{AccountingDetails : AccountingDetails,roleId:req.session.roleId, statusMessage : "",errorMessage:"",officeId : officeId, globalOfficeNum : globalOfficeNum,reconciledDate:reconciledDate,typeOfTransaction:req.body.typeOfTransaction,
                        officeHierarchyNameArray:officeHierarchyNameArray,fromOfficeHierarchyValue:fromOfficeHierarchyValue,toOfficeHierarchyValue:toOfficeHierarchyValue,fromOfficeValue:fromOfficeValue,toOfficeValue:toOfficeValue,fromAccountValue:fromAccountValue,toAccountValue:toAccountValue,
                        trxnAmount:trxnAmt,chequeNo:chequeNo,chequeDate:chequeDate,notes:notes,trxnDate:trxnDate, contextPath:props.contextPath,transactionMasterIdValue:transactionMasterId,dateofTransactionFrom:dateofTransactionFrom,dateofTransactionToDate:dateofTransactionToDate,selectedOfficeIdVoucher:selectedOfficeIdVoucher});
                }else{
                    res.render("accounting/expensesBankPayment",{AccountingDetails : AccountingDetails,roleId:req.session.roleId, statusMessage : statusMessage,errorMessage:errorMessage,officeId : officeId, globalOfficeNum : globalOfficeNum,reconciledDate:"",typeOfTransaction:"",
                        officeHierarchyNameArray:officeHierarchyNameArray,fromOfficeHierarchyValue:"",toOfficeHierarchyValue:"",fromOfficeValue:"",toOfficeValue:"",fromAccountValue:"",toAccountValue:"",
                        trxnAmount:"",chequeNo:"",chequeDate:"",notes:"Bank Payment.",trxnDate:AccountingDetails.getTransactionDate(), contextPath:props.contextPath,transactionMasterIdValue:"",dateofTransactionFrom:"",dateofTransactionToDate:"",selectedOfficeIdVoucher:""});
                }
            }else{
                self.commonRouter.showErrorPage(req,res);
            }
        });
    },
    submitBankPayment : function(req,res) {
        res.setTimeout(0);
        var self = this;
        var AccountingDetails = require(path.join(rootPath,"app_modules/dto/accounting/AccountingDetails"));
        var AccountingDetails = new AccountingDetails();
        this.AccountingDetails = AccountingDetails;
        var AccountingDetails = this.AccountingDetails;
        AccountingDetails.setTransactionDate(dateUtils.convertToYMDFormat(req.body.transactionDate));
        AccountingDetails.setTransactionType(req.body.transactionType);
        AccountingDetails.setMainAccountOfficeHierarchy(parseInt(req.body.fromofficeHierarchy,10));
        AccountingDetails.setMainAccountOffice(req.body.fromOfficeValue);
        AccountingDetails.setMainAccount(req.body.fromAccount);
        AccountingDetails.setSubAccountOfficeHierarchy(parseInt(req.body.toofficeHierarchy,10));
        AccountingDetails.setSubAccountOffice(req.body.toOfficeValue);
        AccountingDetails.setSubAccount(req.body.toAccount);
        AccountingDetails.setAmount(req.body.transactionAmount);
        AccountingDetails.setContra(false);
        if(typeof(req.body.chequeNo) == 'undefined' | req.body.chequeNo == '' |  req.body.chequeNo== 'NULL'){
            AccountingDetails.setChequeNo(null);
        }else{
            AccountingDetails.setChequeNo(req.body.chequeNo);
        }
        if(typeof(req.body.chequeDate) == 'undefined' | req.body.chequeDate == '' |  req.body.chequeDate== 'NULL'){
            AccountingDetails.setChequeDate(null);
        }else{
            AccountingDetails.setChequeDate(dateUtils.convertToYMDFormat(req.body.chequeDate));
        }
        AccountingDetails.setNotes(req.body.transactionNotes);
        var jsonArray = JSON.stringify(AccountingDetails);
        customlog.info("jsonArray" + jsonArray);
        var rest = require("./rest.js");
        var http = require('http');
        var https = require('https');
        var postheaders = {
            'Content-Type' : 'application/json',
            'Content-Length' : Buffer.byteLength(jsonArray, 'utf8'),
            'Cookie' : req.session.mifosCookie
        };
        var options = {
            host: mifosServiceIP,
            port: mifosPort,
            path: "/mfi/api/accounting/payment/bank.json",
            method: 'POST',
            headers : postheaders
        };
        rest.postJSON(options,jsonArray,function(statuscode,result,headers){
            if(statuscode == 302){
                res.redirect(props.contextPath+'/client/ci/logout');
            }else if(result.status == "success"){
                var activityDetails = new Array(iklantPort, req.session.tenantId, req.session.userId, req.session.userName, req.originalUrl, req.connection.remoteAddress, "routAccounting.js", "submitBankPayment", "success", "Accounting Bank Payment", "Bank Payment Entry Made Successfully from "+req.body.fromAccount+" to "+req.body.toAccount+ " for "+req.body.transactionNotes,"insert");
                self.commonRouter.insertActivityLogModel(activityDetails);
                req.session.bankPayment = "success";
                req.body.bankPayment = "success";
                self.bankPaymentForm(req,res);
            }else if(result.status == "failure"){
                if(result.hasOwnProperty('errors')){
                    req.body.bankPayment = "failure";
                    req.body.error = result.errors[0];
                }else{
                    req.body.bankPayment = "runtime";
                }
                self.bankPaymentForm(req,res);
            }else{
                self.commonRouter.showErrorPage(req,res);
            }
        });
    },
    bankReceiptForm : function(req,res) {
        var self = this;
        var rest = require("./rest.js");
        var http = require('http');
        var https = require('https');
        customlog.info(req.session.mifosCookie);
        var postheaders = {
            'Content-Type' : 'application/json',
            'Cookie' : req.session.mifosCookie
        };
        var options = {
            host: mifosServiceIP,
            port: mifosPort,
            path: "/mfi/api/accounting/receipt/bank/load.json",
            method: 'GET',
            headers : postheaders
        };
        rest.getJSON(options,function(statuscode,result,headers){
            customlog.info("statuscode:"+statuscode);
            customlog.info("result:" + result.status);
            if(statuscode == 302){
                res.redirect(props.contextPath+'/client/ci/logout');
            }else if(result.status == "success"){
                //var activityDetails = new Array(iklantPort, req.session.tenantId, req.session.userId, req.session.userName, req.originalUrl, req.connection.remoteAddress, "routAccounting.js", "bankReceiptForm", "success", "Bank Receipt", "bankReceiptForm");
                //self.commonRouter.insertActivityLogModel(activityDetails);
                var fromOfficeListId 	= new Array();
                var subOfficeListId 	= new Array();
                var fromOfficeListName 	= new Array();
                var subOfficeListName 	= new Array();
                var mainAccountListGlName 	= new Array();
                var mainAccountListGlCode 	= new Array();
                var mainAccountOfficeListGlCode 	= new Array();
                var subAccountListGlName 	= new Array();
                var subAccountListGlCode 	= new Array();
                var subAccountOfficeListGlCode 	= new Array();

                var headOfficeNameVar = new Array();
                var headOfficeId = new Array();

                var regionalOfficeNameVar = new Array();
                var regionalOfficeId = new Array();

                var divisionalOfficeNameVar = new Array();
                var divisionalOfficeId = new Array();

                var areaOfficeNameVar = new Array();
                var areaOfficeId = new Array();

                var branchOfficeNameVar = new Array();
                var branchOfficeId = new Array();

                var AccountingDetails = require(path.join(rootPath,"app_modules/dto/accounting/AccountingDetails"));
                var AccountingDetails = new AccountingDetails();
                this.AccountingDetails = AccountingDetails;
                var AccountingDetails = this.AccountingDetails;
                AccountingDetails.setTransactionType(result.transactionDetails.transactionType);
                if(result.transactionDetails.officeHierarchyByLevelDto.headOffices != null){
                    for(var i=0;i<result.transactionDetails.officeHierarchyByLevelDto.headOffices.length;i++){
                        headOfficeId[i] = result.transactionDetails.officeHierarchyByLevelDto.headOffices[i].globalNum;
                        headOfficeNameVar[i] = result.transactionDetails.officeHierarchyByLevelDto.headOffices[i].name;
                    }
                }
                AccountingDetails.setHeadOfficeId(headOfficeId);
                AccountingDetails.setHeadOfficeNameVar(headOfficeNameVar);
                if(result.transactionDetails.officeHierarchyByLevelDto.regionalOffices != null){
                    for(var i=0;i<result.transactionDetails.officeHierarchyByLevelDto.regionalOffices.length;i++){
                        regionalOfficeId[i] = result.transactionDetails.officeHierarchyByLevelDto.regionalOffices[i].globalNum;
                        regionalOfficeNameVar[i] = result.transactionDetails.officeHierarchyByLevelDto.regionalOffices[i].name;
                    }
                }
                AccountingDetails.setRegionalOfficeId(regionalOfficeId);
                AccountingDetails.setRegionalOfficeNameVar(regionalOfficeNameVar);
                if(result.transactionDetails.officeHierarchyByLevelDto.divisionalOffices != null){
                    for(var i=0;i<result.transactionDetails.officeHierarchyByLevelDto.divisionalOffices.length;i++){
                        divisionalOfficeId[i] = result.transactionDetails.officeHierarchyByLevelDto.divisionalOffices[i].globalNum;
                        divisionalOfficeNameVar[i] = result.transactionDetails.officeHierarchyByLevelDto.divisionalOffices[i].name;
                    }
                }
                AccountingDetails.setDivisionalOfficeId(divisionalOfficeId);
                AccountingDetails.setDivisionalOfficeNameVar(divisionalOfficeNameVar);
                if(result.transactionDetails.officeHierarchyByLevelDto.areaOffices != null){
                    for(var i=0;i<result.transactionDetails.officeHierarchyByLevelDto.areaOffices.length;i++){
                        areaOfficeId[i] = result.transactionDetails.officeHierarchyByLevelDto.areaOffices[i].globalNum;
                        areaOfficeNameVar[i] = result.transactionDetails.officeHierarchyByLevelDto.areaOffices[i].name;
                    }
                }
                AccountingDetails.setAreaOfficeId(areaOfficeId);
                AccountingDetails.setAreaOfficeNameVar(areaOfficeNameVar);
                if(result.transactionDetails.officeHierarchyByLevelDto.branchOffices != null){
                    for(var i=0;i<result.transactionDetails.officeHierarchyByLevelDto.branchOffices.length;i++){
                        branchOfficeId[i] = result.transactionDetails.officeHierarchyByLevelDto.branchOffices[i].globalNum;
                        branchOfficeNameVar[i] = result.transactionDetails.officeHierarchyByLevelDto.branchOffices[i].name;
                    }
                }
                AccountingDetails.setBranchOfficeId(branchOfficeId);
                AccountingDetails.setBranchOfficeNameVar(branchOfficeNameVar);


                if( dateUtils.convertToYMDFormat(dateUtils.convertMillisecToMifosDateFormatStr(result.transactionDetails.transactionDate))  <= result.transactionDetails.financialYearEndDate ){
                    AccountingDetails.setFinancialYearEndvar(dateUtils.convertMillisecToMifosDateFormatStr(result.transactionDetails.transactionDate));
                }else{
                    AccountingDetails.setFinancialYearEndvar(dateUtils.convertToDateWithSlash(result.transactionDetails.financialYearEndDate));
                }
                AccountingDetails.setTransactionDate(dateUtils.convertMillisecToMifosDateFormatStr(result.transactionDetails.transactionDate));
                AccountingDetails.setFinancialYearStartvar(dateUtils.convertToDateWithSlash(result.transactionDetails.financialYearStartDate));
                if(result.transactionDetails.mainAccountOfficeList != null){
                    for(var i=0;i<result.transactionDetails.mainAccountOfficeList.length;i++){
                        fromOfficeListId[i] = result.transactionDetails.mainAccountOfficeList[i].globalNum;
                        fromOfficeListName[i] = result.transactionDetails.mainAccountOfficeList[i].name;
                    }
                }
                AccountingDetails.setMainAccountOfficeHierarchyId(fromOfficeListId);
                AccountingDetails.setMainAccountOfficeHierarchyvar(fromOfficeListName);
                if(result.transactionDetails.subAccountOfficeList != null){
                    for(var i=0;i<result.transactionDetails.subAccountOfficeList.length;i++){
                        subOfficeListId[i] = result.transactionDetails.subAccountOfficeList[i].globalNum;
                        subOfficeListName[i] = result.transactionDetails.subAccountOfficeList[i].name;
                    }
                }
                AccountingDetails.setSubAccountOfficeHierarchyvar(subOfficeListName);
                AccountingDetails.setSubAccountOfficeHierarchyId(subOfficeListId);
                if(result.transactionDetails.mainAccountList != null){
                    var count = 0;
                    for(var i=0;i<result.transactionDetails.mainAccountList.length;i++){
                        if(req.session.officeId == result.transactionDetails.mainAccountList[i].officeId || result.transactionDetails.mainAccountList[i].officeId == 1 || req.session.officeId == 1){
                            if(microFinanceGlcode != result.transactionDetails.mainAccountList[i].glcode){
                                mainAccountListGlCode[count] = result.transactionDetails.mainAccountList[i].glcode;
                                mainAccountListGlName[count] = result.transactionDetails.mainAccountList[i].glname;
                                mainAccountOfficeListGlCode[count] = result.transactionDetails.mainAccountList[i].officeId;
                                count++;
                            }
                        }
                    }
                }
                AccountingDetails.setMainAccountGlcodeId(mainAccountListGlCode);
                AccountingDetails.setMainAccountvar(mainAccountListGlName);
                AccountingDetails.setMainAccountGlcodeOfficeId(mainAccountOfficeListGlCode);
                if(result.transactionDetails.subAccountList != null){
                    var count = 0;
                    for(var i=0;i<result.transactionDetails.subAccountList.length;i++){
                        if(microFinanceGlcode != result.transactionDetails.subAccountList[i].glcode){
                            subAccountListGlCode[count] = result.transactionDetails.subAccountList[i].glcode;
                            subAccountListGlName[count] = result.transactionDetails.subAccountList[i].glname  + "(" + result.transactionDetails.subAccountList[i].glcode + ")";
                            subAccountOfficeListGlCode[count] = result.transactionDetails.subAccountList[i].officeId;
                            count++;
                        }
                    }
                }
                AccountingDetails.setSubAccountGlcodeId(subAccountListGlCode);
                AccountingDetails.setSubAccountvar(subAccountListGlName);
                AccountingDetails.setSubAccountGlcodeOfficeId(subAccountOfficeListGlCode);

                AccountingDetails.setAllowedDecimals(result.transactionDetails.allowedDecimals);

                var statusMessage = "";
                if(req.session.bankReceipt == "success"){
                    statusMessage = "Transaction Successful";
                    req.session.bankReceipt = "";
                }
                var errorMessage = "";
                if(req.body.error != ""){
                    errorMessage = req.body.error;
                }
                var officeId = req.session.officeId;
                var globalOfficeNum;
                if(req.session.officeId <= 9){
                    globalOfficeNum = '000'+req.session.officeId;
                }else if(req.session.officeId > 9 && req.session.officeId < 100){
                    globalOfficeNum = '00'+req.session.officeId;
                }else {
                    globalOfficeNum = '0'+req.session.officeId;
                }
                // Added by chitra for Edit Transaction
                var transactionMasterId = "",dateofTransactionFrom = "";
                var dateofTransactionToDate = "",selectedOfficeIdVoucher = "";
                if(req.body.bankReceipt == "success" || req.body.bankReceipt == "failureEdit"){
                    transactionMasterId = req.body.transactionMasterId;
                    dateofTransactionFrom = req.body.dateofTransaction;
                    dateofTransactionToDate = req.body.dateofTransactionToDate;
                    selectedOfficeIdVoucher = req.body.selectedOfficeId;
                }

                if(req.body.bankReceipt == "failure" || req.body.fundTransfer == "failureEdit"){
                    var fromOfficeHierarchyValue = parseInt(req.body.fromofficeHierarchy,10);
                    var toOfficeHierarchyValue = parseInt(req.body.toofficeHierarchy,10);
                    var fromOfficeValue = req.body.fromOfficeValue;
                    var toOfficeValue = req.body.toOfficeValue;
                    var fromAccountValue = req.body.fromAccount;
                    var toAccountValue = req.body.toAccount ;
                    var trxnAmount = req.body.transactionAmount;
                    var trxnDate =  req.body.transactionDate;
                    var chequeNo = "" ,chequeDate = "";
                    var reconciledDate;
                    if(typeof(req.body.chequeNo) == 'undefined' | req.body.chequeNo == '' |  req.body.chequeNo == 'NULL'){
                        chequeNo = "";
                    }else{
                        chequeNo = req.body.chequeNo;
                    }
                    if(typeof(req.body.chequeDate) == 'undefined' | req.body.chequeDate == '' |  req.body.chequeDate == 'NULL'){
                        chequeDate = "";
                    }else{
                        chequeDate = req.body.chequeDate;
                    }
                    if(typeof(req.body.reconciledDateId) == 'undefined' | req.body.reconciledDateId == '' |  req.body.reconciledDateId== 'NULL'){
                        reconciledDate = "";
                    }else{
                        reconciledDate = dateUtils.convertToDateFormat(req.body.reconciledDateId);
                    }
                    var notes =  req.body.transactionNotes;
                    res.render("accounting/expensesBankReceipt",{AccountingDetails : AccountingDetails,roleId:req.session.roleId, statusMessage : statusMessage,errorMessage:errorMessage,officeId : officeId, globalOfficeNum : globalOfficeNum,reconciledDate:reconciledDate,typeOfTransaction:req.body.typeOfTransaction,
                        officeHierarchyNameArray:officeHierarchyNameArray,fromOfficeHierarchyValue:fromOfficeHierarchyValue,toOfficeHierarchyValue:toOfficeHierarchyValue,fromOfficeValue:fromOfficeValue,toOfficeValue:toOfficeValue,fromAccountValue:fromAccountValue,toAccountValue:toAccountValue,
                        trxnAmount:trxnAmount,chequeNo:chequeNo,chequeDate:chequeDate,notes:notes,trxnDate:trxnDate, contextPath:props.contextPath,transactionMasterIdValue:transactionMasterId,dateofTransactionFrom:dateofTransactionFrom,dateofTransactionToDate:dateofTransactionToDate,selectedOfficeIdVoucher:selectedOfficeIdVoucher});

                }else if(req.body.bankReceipt == "success" && req.body.transactionDetails != null)
                {
                    var fromOfficeHierarchyValue = req.body.transactionDetails.fromOfficeLevelId;
                    var toOfficeHierarchyValue = req.body.transactionDetails.toOfficeLevelId;
                    var fromOfficeValue = req.body.transactionDetails.fromOfficeId;
                    var toOfficeValue = req.body.transactionDetails.toOfficeId;
                    var fromAccountValue = req.body.transactionDetails.mainAccountGlCode;
                    var toAccountValue = req.body.transactionDetails.subAccountGlCode;
                    var toOffice = req.body.transactionDetails.toOfficeId;
                    var trxnDate = dateUtils.convertToDateFormat(req.body.transactionDetails.trxnDate);
                    var trxnAmt = req.body.transactionDetails.trxnAmt;
                    var reconciledDate;

                    if(typeof(req.body.transactionDetails.chequeNo) == 'undefined' | req.body.transactionDetails.chequeNo == '' |  req.body.transactionDetails.chequeNo== null){
                        chequeNo = "";
                    }else{
                        chequeNo = req.body.transactionDetails.chequeNo;
                    }
                    if(typeof(req.body.transactionDetails.chequeDate) == 'undefined' | req.body.transactionDetails.chequeDate == '' |  req.body.transactionDetails.chequeDate== null){
                        chequeDate = "";
                    }else{
                        chequeDate = dateUtils.convertToDateFormat(req.body.transactionDetails.chequeDate);
                    }
                    if(typeof(req.body.transactionDetails.reconciledDate) == 'undefined' | req.body.transactionDetails.reconciledDate == '' |  req.body.transactionDetails.reconciledDate== null){
                        reconciledDate = "";
                    }else{
                        reconciledDate = dateUtils.convertToDateFormat(req.body.transactionDetails.reconciledDate);
                    }
                    var notes = req.body.transactionDetails.notes;

                    res.render("accounting/expensesBankReceipt",{AccountingDetails : AccountingDetails,roleId:req.session.roleId, statusMessage : "",errorMessage:"",officeId : officeId, globalOfficeNum : globalOfficeNum,reconciledDate:reconciledDate,typeOfTransaction:req.body.typeOfTransaction,
                        officeHierarchyNameArray:officeHierarchyNameArray,fromOfficeHierarchyValue:fromOfficeHierarchyValue,toOfficeHierarchyValue:toOfficeHierarchyValue,fromOfficeValue:fromOfficeValue,toOfficeValue:toOfficeValue,fromAccountValue:fromAccountValue,toAccountValue:toAccountValue,
                        trxnAmount:trxnAmt,chequeNo:chequeNo,chequeDate:chequeDate,notes:notes,trxnDate:trxnDate, contextPath:props.contextPath,transactionMasterIdValue:transactionMasterId,dateofTransactionFrom:dateofTransactionFrom,dateofTransactionToDate:dateofTransactionToDate,selectedOfficeIdVoucher:selectedOfficeIdVoucher});
                }else{
                    res.render("accounting/expensesBankReceipt",{AccountingDetails : AccountingDetails,roleId:req.session.roleId, statusMessage : statusMessage,errorMessage:errorMessage,officeId : officeId, globalOfficeNum : globalOfficeNum,reconciledDate:"",typeOfTransaction:"",
                        officeHierarchyNameArray:officeHierarchyNameArray,fromOfficeHierarchyValue:"",toOfficeHierarchyValue:"",fromOfficeValue:"",toOfficeValue:"",fromAccountValue:"",toAccountValue:"",
                        trxnAmount:"",chequeNo:"",chequeDate:"",notes:"Bank Receipt.",trxnDate:AccountingDetails.getTransactionDate(), contextPath:props.contextPath,transactionMasterIdValue:"",dateofTransactionFrom:"",dateofTransactionToDate:"",selectedOfficeIdVoucher:""});
                }
            }else{
                self.commonRouter.showErrorPage(req,res);
            }
        });
    },

    submitBankReceipt : function(req,res) {
        res.setTimeout(0);
        var self = this;
        var AccountingDetails = require(path.join(rootPath,"app_modules/dto/accounting/AccountingDetails"));
        var AccountingDetails = new AccountingDetails();
        this.AccountingDetails = AccountingDetails;
        var AccountingDetails = this.AccountingDetails;
        AccountingDetails.setTransactionDate(dateUtils.convertToYMDFormat(req.body.transactionDate));
        AccountingDetails.setTransactionType(req.body.transactionType);
        AccountingDetails.setMainAccountOfficeHierarchy(parseInt(req.body.fromofficeHierarchy,10));
        AccountingDetails.setMainAccountOffice(req.body.fromOfficeValue);
        AccountingDetails.setMainAccount(req.body.fromAccount);
        AccountingDetails.setSubAccountOfficeHierarchy(parseInt(req.body.toofficeHierarchy,10));
        AccountingDetails.setSubAccountOffice(req.body.toOfficeValue);
        AccountingDetails.setSubAccount(req.body.toAccount);
        AccountingDetails.setAmount(req.body.transactionAmount);
        AccountingDetails.setContra(false);
        if(typeof(req.body.chequeNo) == 'undefined' | req.body.chequeNo == '' |  req.body.chequeNo== 'NULL'){
            AccountingDetails.setChequeNo(null);
        }else{
            AccountingDetails.setChequeNo(req.body.chequeNo);
        }
        if(typeof(req.body.chequeDate) == 'undefined' | req.body.chequeDate == '' |  req.body.chequeDate== 'NULL'){
            AccountingDetails.setChequeDate(null);
        }else{
            AccountingDetails.setChequeDate(dateUtils.convertToYMDFormat(req.body.chequeDate));
        }
        AccountingDetails.setNotes(req.body.transactionNotes);
        var jsonArray = JSON.stringify(AccountingDetails);
        customlog.info("jsonArray" + jsonArray);
        var rest = require("./rest.js");
        var http = require('http');
        var https = require('https');
        var postheaders = {
            'Content-Type' : 'application/json',
            'Content-Length' : Buffer.byteLength(jsonArray, 'utf8'),
            'Cookie' : req.session.mifosCookie
        };
        var options = {
            host: mifosServiceIP,
            port: mifosPort,
            path: "/mfi/api/accounting/receipt/bank.json",
            method: 'POST',
            headers : postheaders
        };
        rest.postJSON(options,jsonArray,function(statuscode,result,headers){
            if(statuscode == 302){
                res.redirect(props.contextPath+'/client/ci/logout');
            }else if(result.status == "success"){
                var activityDetails = new Array(iklantPort, req.session.tenantId, req.session.userId, req.session.userName, req.originalUrl, req.connection.remoteAddress, "routAccounting.js", "submitBankReceipt", "success", "Accounting Bank Receipt", "Bank Receipt Entry Made successfully from "+req.body.fromAccount+" to "+req.body.toAccount+ " for "+req.body.transactionNotes,"insert");
                self.commonRouter.insertActivityLogModel(activityDetails);
                req.session.bankReceipt = "success";
                req.body.bankReceipt = "success";
                self.bankReceiptForm(req,res);
            }else if(result.status == "failure"){
                if(result.hasOwnProperty('errors')){
                    req.body.bankReceipt = "failure";
                    req.body.error = result.errors[0];
                }else{
                    req.body.bankReceipt = "runtime";
                }
                self.bankReceiptForm(req,res);
            }else{
                self.commonRouter.showErrorPage(req,res);
            }
        });
    },

    // Added by Chitra 003 for Accounting Transaction Edit Screen  [BP,BR,JV,Fund Transfer in CV]
    editAccountingTransaction : function(req,res) {
        if(typeof req.session.tenantId == 'undefined' || typeof req.session.userId == 'undefined' || typeof req.body.transactionMasterId == 'undefined') {
            res.redirect(props.contextPath+'/client/ci/login');
        }else{
            var transactionMasterId = req.body.transactionMasterId;
            var typeOfTransaction = req.body.typeOfTransaction;
            var TransactionHolder = require(path.join(rootPath,"app_modules/dto/accounting/TransactionHolder"));
            var transactionHolderDetail = new TransactionHolder();
            var rest = require("./rest.js");
            var http = require('http');
            var https = require('https');
            var self = this;

            transactionHolderDetail.setTransactionMasterId(transactionMasterId);
            var transactionHolderDetailJson = JSON.stringify(transactionHolderDetail);
            customlog.info("transactionHolderDetailJson" + transactionHolderDetailJson);

            var postheaders = {
                'Content-Type' : 'application/json',
                'Content-Length' : Buffer.byteLength(transactionHolderDetailJson, 'utf8'),
                'Cookie' : req.session.mifosCookie
            };
            var options = {
                host: mifosServiceIP,
                port: mifosPort,
                path: "/mfi/api/accounting/payment/editAccountingTransaction.json",
                method: 'POST',
                headers : postheaders
            };
            rest.postJSON(options,transactionHolderDetailJson,function(statuscode,result,headers){
                if(statuscode == 302){
                    res.redirect(props.contextPath+'/client/ci/logout');
                }else if(result.status == "success"){
                    if(result.transactionDetails != null){
                        req.body.transactionDetails = result.transactionDetails;
                        req.body.transactionMasterId = transactionMasterId;
                    }
                }else if(result.status == "failure"){
                    req.body.error = result.transactionDetails;
                }
                req.body.typeOfTransaction = typeOfTransaction;

                var statusMessage = result.status;
                if(typeOfTransaction == 1){
                    //req.body.cashPayment = statusMessage;
                    req.body.cashPayment = statusMessage;
                    self.cashPaymentForm(req,res);
                }  else if(typeOfTransaction == 2){
                    //req.session.cashReceipt = statusMessage;
                    req.body.cashReceipt = statusMessage;
                    self.cashReceiptForm(req,res);
                }
                else if(typeOfTransaction == 3){
                    req.session.bankPayment = statusMessage;
                    req.body.bankPayment = statusMessage;
                    self.bankPaymentForm(req,res);
                }else if(typeOfTransaction == 4){
                    req.session.bankReceipt = statusMessage;
                    req.body.bankReceipt = statusMessage;
                    self.bankReceiptForm(req,res);
                }else if(typeOfTransaction == 5){
                    req.session.fundTransfer = statusMessage;
                    req.body.fundTransfer = statusMessage;
                    self.fundTransferForm(req,res);
                }else if(typeOfTransaction == 6){
                    req.session.journal = statusMessage;
                    req.body.journal = statusMessage;
                    self.journalTransaction(req,res);
                }
            });
        }
    },

    // Added by Chitra 003 for Update the Accounting Transactions [BP,BR,JV,Fund Transfer in CV]
    updateAccountingTransactions : function(req,res) {
        if(typeof req.session.tenantId == 'undefined' || typeof req.session.userId == 'undefined' || typeof req.body.transactionMasterId == 'undefined') {
            res.redirect(props.contextPath+'/client/ci/login');
        }else{
            res.setTimeout(0);
            var transactionMasterId = req.body.transactionMasterId;
            var self = this;
            var AccountingDetails = require(path.join(rootPath,"app_modules/dto/accounting/AccountingDetails"));
            var AccountingDetails = new AccountingDetails();
            this.AccountingDetails = AccountingDetails;
            var accountingDetails = this.AccountingDetails;
            accountingDetails.setTransactionDate(dateUtils.convertToYMDFormat(req.body.transactionDate));
            accountingDetails.setTransactionType(req.body.transactionType);
            accountingDetails.setMainAccountOfficeHierarchy(parseInt(req.body.fromofficeHierarchy,10));
            accountingDetails.setMainAccountOffice(req.body.fromOfficeValue);
            if(typeof(req.body.fromAccount) != 'undefined'){
                accountingDetails.setMainAccount(req.body.fromAccount);
            } else{
                accountingDetails.setMainAccount(req.body.fromAccountValue);
            }
            accountingDetails.setSubAccountOfficeHierarchy(parseInt(req.body.toofficeHierarchy,10));
            accountingDetails.setSubAccountOffice(req.body.toOfficeValue);
            accountingDetails.setSubAccount(req.body.toAccount);
            accountingDetails.setAmount(req.body.transactionAmount);
            accountingDetails.setContra(false);
            if(typeof(req.body.chequeNo) == 'undefined' | req.body.chequeNo == '' |  req.body.chequeNo== 'NULL'){
                accountingDetails.setChequeNo(null);
            }else{
                accountingDetails.setChequeNo(req.body.chequeNo);
            }
            if(typeof(req.body.chequeDate) == 'undefined' | req.body.chequeDate == '' |  req.body.chequeDate== 'NULL'){
                accountingDetails.setChequeDate(null);
            }else{
                accountingDetails.setChequeDate(dateUtils.convertToYMDFormat(req.body.chequeDate));
            }
            accountingDetails.setNotes(req.body.transactionNotes);
            accountingDetails.setTransactionMasterId(transactionMasterId);
            if(req.body.reconciliationStateFlag == "on"){
                accountingDetails.setBRSState(0);
            }
            var jsonArray = JSON.stringify(accountingDetails);
            customlog.info("editAccountingHolderJson" + jsonArray);
            var rest = require("./rest.js");
            var http = require('http');
            var https = require('https');

            var postheaders = {
                'Content-Type' : 'application/json',
                'Content-Length' : Buffer.byteLength(jsonArray, 'utf8'),
                'Cookie' : req.session.mifosCookie
            };
            var options = {
                host: mifosServiceIP,
                port: mifosPort,
                path: "/mfi/api/accounting/payment/updateAccountingTransaction.json",
                method: 'POST',
                headers : postheaders
            };
            rest.postJSON(options,jsonArray,function(statuscode,result,headers){
                req.body.dateofTransaction = req.body.dateofTransactionFrom;
                req.body.dateofTransactionToDate = req.body.dateofTransactionToDate;
                req.body.selectedOfficeId = req.body.selectedOfficeIdVoucher;
                if(statuscode == 302){
                    res.redirect(props.contextPath+'/client/ci/logout');
                }else if(result.status == "success"){
                    req.body.successMsg = "Transaction Updated Successfully";
                    if(result.transactionDetails != null){
                        var activityLogMessage
                        req.params.typeOfTransaction = req.body.typeOfTransaction;
                        if(req.body.typeOfTransaction == 1){
                            activityLogMessage = "Cash Payment";
                        }else if(req.body.typeOfTransaction == 2){
                            activityLogMessage = "Cash Reeipt";
                        }else if(req.body.typeOfTransaction == 3){
                            activityLogMessage = "Bank Payment";
                        }else if(req.body.typeOfTransaction == 4){
                            activityLogMessage = "Bank Receipt";
                        }else if(req.body.typeOfTransaction == 5){
                            activityLogMessage = "Fund Transfer";
                        }else if(req.body.typeOfTransaction == 6){
                            activityLogMessage = "Journal Voucher";
                        }
                        activityLogMessage += " Updated from the FromLedger "+req.body.fromAccountValue+",ToLedger "+req.body.toAccountValue+" ,FromOffice "+req.body.fromOfficeValueH+",ToOffice "+req.body.toOfficeValueH
                            +",TrxnDate "+req.body.trxnDate+",TrxnAmt "+req.body.trxnAmount;
                        if(typeof(req.body.chequeDateH) != 'undefined' && req.body.chequeDateH != '' &&  req.body.chequeDateH!= 'NULL'){
                            activityLogMessage += ",ChequeDate "+req.body.chequeDateH+",ChequeNo "+req.body.chequeNoH+" for the masterId "+transactionMasterId;
                        }else{
                            activityLogMessage += " for the masterId "+transactionMasterId;
                        }
                        var activityDetails = new Array(iklantPort, req.session.tenantId, req.session.userId, req.session.userName, req.originalUrl, req.connection.remoteAddress, "routeAccounting.js", "updateAccountingTransactions", "success", "Update Accounting", activityLogMessage,"update");
                        self.commonRouter.insertActivityLogModel(activityDetails);
                        self.cashPaymentVoucherLoad(req,res);
                    }
                }else if(result.status == "failure"){
                    req.body.error = result.errors[0];
                    if(req.body.typeOfTransaction == 1){
                        req.body.cashPayment = "failureEdit";
                        self.cashPaymentForm(req,res);
                    }else if(req.body.typeOfTransaction == 2){
                        req.body.cashReceipt = "failureEdit";
                        self.cashReceiptForm(req,res);
                    }else if(req.body.typeOfTransaction == 3){
                        req.body.bankPayment = "failureEdit";
                        self.bankPaymentForm(req,res);
                    }else if(req.body.typeOfTransaction == 4){
                        req.body.bankReceipt = "failureEdit";
                        self.bankReceiptForm(req,res);
                    }else if(req.body.typeOfTransaction == 5){
                        req.body.fundTransfer = "failureEdit";
                        self.fundTransferForm(req,res);
                    }else if(req.body.typeOfTransaction == 6){
                        req.body.journal = "failureEdit";
                        self.journalTransaction(req,res);
                    }
                }
            });
        }
    },

    showVoucherPaymentForBackOption: function(req,res) {
        var self = this;
        if(typeof req.session.tenantId == 'undefined' || typeof req.session.userId == 'undefined' || typeof req.body.transactionMasterId == 'undefined') {
            res.redirect(props.contextPath+'/client/ci/login');
        }else{
            req.body.dateofTransaction = req.body.dateofTransactionFrom;
            req.body.dateofTransactionToDate = req.body.dateofTransactionToDate;
            req.body.selectedOfficeId = req.body.selectedOfficeIdVoucher;
            req.params.typeOfTransaction = req.body.typeOfTransaction;
            self.cashPaymentVoucherLoad(req,res);
        }
    },
    // Transactions History Added by SathishKumar M
    transactionHistory : function(req,res) {
        try{
            var self = this;
            var constantsObj = this.constants;
            var tenantId = req.session.tenantId;
            var userId = req.session.userId;
            var roleId = req.session.roleId;
            var selectedOfficeId = req.body.selectedOfficeId;
            var download_report;
            var fileLocation;
            var toDate="";
            var reportId ="THRResult";
            customlog.info("Inside Show Transaction History");
            if(typeof tenantId == 'undefined' || typeof userId == 'undefined') {
                self.commonRouter.showErrorPage(req,res);
            }
            else {
                req.session.tenantId = tenantId;
                self.commonRouter.retriveOfficeCall(tenantId,req.session.userId,function(officeIdArray,officeNameArray,officeAddressArray,officeShortNameArray)
                {
                    var download_report_msg = "";
                    if(download_report == 'Download'){
                        download_report_msg = "No Records";
                    }else if(download_report == 'Download'){
                        download_report_msg = "Download";
                    }
                    req.session.tenantId = tenantId;
                    res.render('accounting/transactionHistory.jade', {todate:toDate,reportId:reportId,fileLocation:fileLocation,
                        download_report:download_report_msg,summary:'',detailed:'',result:'',constantsObj:constantsObj,
                        officeId:(typeof selectedOfficeId == 'undefined')?req.session.officeId:selectedOfficeId,
                        officeValue:(typeof selectedOfficeId == 'undefined')?req.session.officeId:selectedOfficeId,
                        officeIdArray:officeIdArray,officeNameArray:officeNameArray,roleId:roleId, contextPath:props.contextPath});
                });
            }
        }catch(e){
            customlog.error("Exception while transactionHistory "+e);
            self.commonRouter.showErrorPage(req,res);
        }
    },
    transactionHistoryGenerate : function(req,res){
        try{
            var self = this;
            if(typeof req.session.tenantId == 'undefined' || typeof req.session.userId == 'undefined') {
                self.commonRouter.showErrorPage(req,res);
            }else{
                var fromDate = req.body.todate;
                var toDate = req.body.todate;
                var officeId = req.body.listoffice;
                var daysInArrears = req.body.days_in_arrears;
                var reportId = req.body.reportId;
                var roleId = req.session.roleId;
                var tenantId = req.session.tenantId;
                var constantsObj = this.constants;
                var download_report = req.body.report_download_flag;
                var download_report_msg = "";
                var detailed="detailed";
                var summary="summary";
                var officeValue;

                if(typeof(officeId) == 'undefined'){
                    officeId = (roleId == constantsObj.getSMHroleId()||roleId == constantsObj.getAMHroleId())?-1:req.session.officeId;
                }
                // fetch all office
                self.commonRouter.retriveOfficeCall(tenantId,req.session.userId,function(officeIdArray,officeNameArray,officeAddressArray,officeShortNameArray) {
                    self.transactionHistoryCall(fromDate,toDate,officeId,reportId,req.session.userId, function(THRResult,fileLocation){
                        var download_report_msg = "";
                        if(download_report == 'Download' && (THRResult == null || THRResult.length == 0) ){
                            download_report_msg = "No Records";
                        }else if(download_report == 'Download'){
                            download_report_msg = "Download";
                        }
                        req.session.tenantId = tenantId;
                        res.render('accounting/transactionHistory.jade',{todate:toDate,result:THRResult,fileLocation:fileLocation,roleId:roleId,constantsObj:constantsObj,
                            officeIdArray:officeIdArray,officeNameArray:officeNameArray,download_report:download_report_msg,endDate:toDate,
                            officeId:req.session.officeId,reportId:reportId,detailed:detailed,summary:summary,officeValue:officeId, contextPath:props.contextPath});
                    });
                });
            }
        }catch(e){
            customlog.error("Exception while transactionHistoryGenerate "+e);
            self.commonRouter.showErrorPage(req,res);
        }
    },
    //Added by Sathishkumar M For Generate TransactionHistoryReport
    transactionHistoryCall : function(fromDate,toDate,officeId,reportId,userId, callBack){
        this.model.getTransactionHistoryModel(fromDate,toDate,officeId,reportId,userId, callBack);
    },
    // Added by chitra 003 [Accounting Bank Reconciliation]
    bankReconciliation : function(req,res) {
        var self = this;
        var constantsObj = this.constants;
        var tenantId = req.session.tenantId;
        var userId = req.session.userId;
        var officeId = req.session.officeId;
        var roleId = req.session.roleId;
        var statusMessage = "";
        var BankReconciliationHolder = require(path.join(rootPath,"app_modules/dto/accounting/BankReconciliationHolder"));
        var ledgerValue = req.body.listledger;
        var monthValue =  req.body.monthValue;
        var toDisplayLedger = req.body.ledgerNameBR;
        var months = ['April','May','June','July','August','September','October','November','December','January','February','March'];
        var monthIndex = ['04','05','06','07','08','09','10','11','12','01','02','03'];
        if(typeof tenantId == 'undefined' || typeof userId == 'undefined') {
            res.redirect(props.contextPath+'/client/ci/login');
        }else{
            if(roleId == constantsObj.getSMHroleId()||roleId == constantsObj.getAMHroleId()){
                officeId  = -1;
            }
            if(typeof req.body.statusMessage != 'undefined')
            {
                statusMessage = "BRS Completed Successfully";
            }
            self.retrieveLedgerDetailsCall(tenantId,officeId,"Bank",userId, function(ledger_name_array,gl_code_value_array){
                if(typeof monthValue != 'undefined'){
                    var fromDate = "";
                    var openingBal,balanceAsPerBook;
                    self.model.getActiveFinYearModel(function(finResult){
                        var minFinancialYear = ((finResult[0].minDate).toString()).split("-");
                        var maxFinancialYear = ((finResult[0].maxDate).toString()).split("-");
                        self.model.getLastDateOfMonthModel(monthValue,minFinancialYear[2],maxFinancialYear[2],function(toDate){
                            if(monthValue == '01' || monthValue == '02' || monthValue == '03'){
                                fromDate = maxFinancialYear[2]+'-'+monthValue+'-01';
                            }else{
                                fromDate = minFinancialYear[2]+'-'+monthValue+'-01';
                            }
                            var BankReconciliationDetails = new BankReconciliationHolder();
                            BankReconciliationDetails.setFromDate(fromDate);
                            BankReconciliationDetails.setToDate(toDate);
                            BankReconciliationDetails.setGlcodeValue(ledgerValue);
                            servicePath = '/mfi/api/account/accounting/brs/bankReconciliationStatement.json';
                            var BankReconciliation = JSON.stringify(BankReconciliationDetails);
                            customlog.info("BankReconciliation" + BankReconciliation);
                            var rest = require("./rest.js");
                            var http = require('http');
                            var https = require('https');
                            customlog.info("Cookie:"+req.session.mifosCookie);
                            var cookie = req.session.mifosCookie;
                            if(typeof cookie == 'undefined') {
                                res.redirect(props.contextPath+'/client/ci/login');
                            }
                            else {
                                var postheaders = {
                                    'Content-Type' : 'application/json',
                                    'Content-Length' : Buffer.byteLength(BankReconciliation, 'utf8'),
                                    'Cookie' : req.session.mifosCookie
                                };
                                var options = {
                                    host: mifosServiceIP,
                                    port: mifosPort,
                                    path: servicePath,
                                    method: 'POST',
                                    headers : postheaders
                                };
                                rest.postJSON(options,BankReconciliation,function(statuscode,result,headers){
                                    customlog.info("statuscode" + statuscode);
                                    if(statuscode == 302){
                                        res.redirect(props.contextPath+'/client/ci/logout');
                                    }
                                    else{
                                        if(result.status == 'success'){
                                            if(result.bankReconciliation != null){
                                                var CashPaymentVoucherDto = require(path.join(rootPath,"app_modules/dto/accounting/CashPaymentVoucher"));
                                                var CashPaymentVoucher = new Array();
                                                var debitVal = 0,creditVal = 0;
                                                for(var i=0;i<result.bankReconciliation.length;i++){
                                                    var CashPaymentVoucherDetail = new CashPaymentVoucherDto();
                                                    CashPaymentVoucherDetail.setTransactionMasterId(result.bankReconciliation[i].transactionMasterId);
                                                    CashPaymentVoucherDetail.setTransactionDate(result.bankReconciliation[i].transactionDate);
                                                    CashPaymentVoucherDetail.setDebitAccName(result.bankReconciliation[i].debitAccName);
                                                    CashPaymentVoucherDetail.setTransactionType(result.bankReconciliation[i].transactionType);
                                                    CashPaymentVoucherDetail.setChequeNumber(result.bankReconciliation[i].chequeNumber);
                                                    CashPaymentVoucherDetail.setChequeDate(result.bankReconciliation[i].chequeDate);
                                                    CashPaymentVoucherDetail.setDebitAcc(result.bankReconciliation[i].debitAcc);
                                                    debitVal += parseInt(result.bankReconciliation[i].debitAcc);
                                                    CashPaymentVoucherDetail.setCreditAcc(result.bankReconciliation[i].creditAcc);
                                                    creditVal += parseInt(result.bankReconciliation[i].creditAcc);
                                                    CashPaymentVoucher[i] = CashPaymentVoucherDetail;
                                                }
                                            }
                                        }
                                    }
                                    openingBal = result.openingBal;
                                    balanceAsPerBook =result.debitCreditSum;
                                    if(openingBal == null || openingBal == ""){
                                        openingBal = 0;
                                    }
                                    if(balanceAsPerBook == null || balanceAsPerBook == ""){
                                        balanceAsPerBook = 0;
                                    }
                                    balanceAsPerBook = parseInt(openingBal) + parseInt(balanceAsPerBook);
                                    res.render('accounting/bankReconciliation.jade', {bankReconciliationStmt:CashPaymentVoucher,contextPath:props.contextPath,months:months,toDisplayLedger:toDisplayLedger,dateStr:fromDate+" to "+toDate,bankReconciliationStmtLength:CashPaymentVoucher.length,fromDate:fromDate,
                                        monthIndex:monthIndex,gl_code_value_array:gl_code_value_array,ledger_name_array:ledger_name_array,ledgerValue:ledgerValue,selectedMonth:monthValue,opening_bal:openingBal,closing_bal:0,filePath:"",fileSize:"",balanceAsPerBook:balanceAsPerBook,statusMessage:statusMessage});
                                });
                            }
                        });
                    });
                }else{
                    res.render('accounting/bankReconciliation.jade', {bankReconciliationStmt:null,contextPath:props.contextPath,months:months,toDisplayLedger:"",dateStr:"",bankReconciliationStmtLength:0,fromDate:fromDate,
                        monthIndex:monthIndex,gl_code_value_array:gl_code_value_array,ledger_name_array:ledger_name_array,ledgerValue:"",selectedMonth:"",opening_bal:"",closing_bal:"",filePath:"",fileSize:"",balanceAsPerBook:0,statusMessage:""});
                }
            });
        }
    },
    // Added by chitra 003 [Accounting Bank Reconciliation]
    saveBankReconciliation : function(req,res) {

        var BankReconciliationHolder = require(path.join(rootPath,"app_modules/dto/accounting/BankReconciliationHolder"));
        var bankReconciliationLength = req.body.bankReconciliationArray;
        var bankReconciliationDTO =  require(path.join(rootPath,"app_modules/dto/accounting/BankReconciliationDto"));
        var userId = req.session.userId;
        var brsList = new Array();
        var masterIdStr = "";
        var self = this;
        if(bankReconciliationLength != 0){
            var index = 0;
            for(var i=0; i<bankReconciliationLength;i++){
                var dateValue =  req.body['reconciliationDate-'+i];
                if(dateValue != "" && dateValue != null){
                    var bankReconciliationDto = new bankReconciliationDTO();
                    bankReconciliationDto.setTransactionMasterId(req.body['transactionMasterId-'+i]);
                    bankReconciliationDto.setReconciledDate(dateValue);
                    bankReconciliationDto.setReconciledBy(userId);
                    brsList[index] = bankReconciliationDto;
                    masterIdStr += bankReconciliationDto.getTransactionMasterId() + ",";
                    index++;
                }
            }
        }
        var BankReconciliationDetails = new BankReconciliationHolder();
        BankReconciliationDetails.setBrsStatusList(brsList);
        servicePath = '/mfi/api/accounting/brs/update.json';
        var BankReconciliationDetail = JSON.stringify(BankReconciliationDetails);
        customlog.info("CashPaymentVoucherDetails" + BankReconciliationDetail);
        var rest = require("./rest.js");
        var http = require('http');
        var https = require('https');
        customlog.info("Cookie:"+req.session.mifosCookie);
        var cookie = req.session.mifosCookie;
        if(typeof cookie == 'undefined') {
            res.redirect(props.contextPath+'/client/ci/login');
        }
        else {
            var postheaders = {
                'Content-Type' : 'application/json',
                'Content-Length' : Buffer.byteLength(BankReconciliationDetail, 'utf8'),
                'Cookie' : req.session.mifosCookie
            };
            var options = {
                host: mifosServiceIP,
                port: mifosPort,
                path: servicePath,
                method: 'POST',
                headers : postheaders
            };
            rest.postJSON(options,BankReconciliationDetail,function(statuscode,result,headers){
                customlog.info("statuscode" + statuscode);
                if(statuscode == 302){
                    res.redirect(props.contextPath+'/client/ci/logout');
                }
                else{
                    if(result.status == 'success'){
                        console.log("Success");
                        var activityDetails = new Array(iklantPort, req.session.tenantId, req.session.userId, req.session.userName, req.originalUrl, req.connection.remoteAddress, "router.js", "saveBankReconciliation", "success", "Bank Reconciliation","BRS Completed for the following master_Ids "+masterIdStr,"update");
                        self.commonRouter.insertActivityLogModel(activityDetails);
                        req.body.statusMessage = "success";
                        self.bankReconciliation(req,res);
                    }else {
                        self.commonRouter.showErrorPage(req,res);
                    }
                }
            });
        }
    },

    bankReconciliationReport : function(req,res) {
        var self = this;
        var constantsObj = this.constants;
        var tenantId = req.session.tenantId;
        var userId = req.session.userId;
        var officeId = req.session.officeId;
        var roleId = req.session.roleId;
        var BankReconciliationHolder = require(path.join(rootPath,"app_modules/dto/accounting/BankReconciliationHolder"));
        var ledgerValue = req.body.listledger;
        var monthValue =  req.body.monthValue;
        var toDisplayLedger = req.body.ledgerNameBR;
        var months = ['April','May','June','July','August','September','October','November','December','January','February','March'];
        var monthIndex = ['04','05','06','07','08','09','10','11','12','01','02','03'];
        if(typeof tenantId == 'undefined' || typeof userId == 'undefined') {
            res.redirect(props.contextPath+'/client/ci/login');
        }else{
            if(roleId == constantsObj.getSMHroleId()||roleId == constantsObj.getAMHroleId()){
                officeId  = -1;
            }
            self.retrieveLedgerDetailsCall(tenantId,officeId,"Bank",userId, function(ledger_name_array,gl_code_value_array){
                if(typeof monthValue != 'undefined'){
                    var fromDate = "";
                    var openingBal;
                    self.model.getActiveFinYearModel(function(finResult){
                        var minFinancialYear = ((finResult[0].minDate).toString()).split("-");
                        var maxFinancialYear = ((finResult[0].maxDate).toString()).split("-");
                        self.model.getLastDateOfMonthModel(monthValue,minFinancialYear[2],maxFinancialYear[2],function(toDate){
                            if(monthValue == '01' || monthValue == '02' || monthValue == '03'){
                                fromDate = maxFinancialYear[2]+'-'+monthValue+'-01';
                            }else{
                                fromDate = minFinancialYear[2]+'-'+monthValue+'-01';
                            }
                            req.body.fromdate =  fromDate;
                            req.body.todate = toDate;
                            req.body.listledger = ledgerValue;
                            req.body.reportId = constantsObj.getBankReconciliationReportId();
                            req.body.reportspname =  "sp_bank_reconciliation_optimized";
                            req.body.reportDescription = constantsObj.getBankReconciliation();
                            req.params.reportMessage = "FromBRSScreen";
                            self.routerReport.generateSelectedReport(req,res);
                        });
                    });
                }
            });
        }
    },
    retrieveLedgerDetailsCall : function(tenantId,officeId,ledger_name,userId,callback){
        this.model.retrieveLedgerDetailsModel(tenantId,officeId,ledger_name,userId,callback);
    },
    expensetrackingload : function(req,res) {
        try{
            var self = this;
            var rest = require("./rest.js");
            var expensetrackingDetail = "";
            customlog.info("expensetrackingDetail"+expensetrackingDetail);
            var http = require('http');
            var https = require('https');
            customlog.info("Cookie:"+req.session.mifosCookie);
            var cookie = req.session.mifosCookie;
            if(typeof cookie == 'undefined') {
                res.redirect(props.contextPath+'/client/ci/login');
            }
            else {
                var postheaders = {
                    'Content-Type' : 'application/json',
                    'Content-Length' : Buffer.byteLength(expensetrackingDetail, 'utf8'),
                    'Cookie' : req.session.mifosCookie
                };

                var options = {
                    host: mifosServiceIP,
                    port: mifosPort,
                    path: '/mfi/api/account/accounting/expTrack/load.json',
                    method: 'POST',
                    headers : postheaders
                };

                rest.postJSON(options,expensetrackingDetail,function(statuscode,result,headers){
                    customlog.info("statuscode" + statuscode);
                    customlog.info("HEADERS:  "+headers)
                    customlog.info("RESULT"+result.status);
                    customlog.info("RESULT"+result.expTrack);
                    if(statuscode == 302){
                        res.redirect(props.contextPath+'/client/ci/logout');
                    }
                    else{
                        if(result.status == 'success'){
                            //var activityDetails = new Array(iklantPort, req.session.tenantId, req.session.userId, req.session.userName, req.originalUrl, req.connection.remoteAddress, "router.js", "expensetrackingload", "success", "Expense Tracking", "expensetrackingload");
                            //self.commonRouter.insertActivityLogModel(activityDetails);
                            var officeList = new Array();
                            var mainAccList = new Array();
                            var accHeadList = new Array();
                            var ExpenseTrackingHolder = require(path.join(rootPath,"app_modules/dto/accounting/ExpenseTrackingHolder"));
                            var expenseTrackingHolder = new ExpenseTrackingHolder();
                            if(result.expTrack != null){
                                //expenseTrackingHolder.setTrxnDate(convertDate(result.expTrack.trxnDate));
                                expenseTrackingHolder.setTrxnDateStr(dateUtils.convertDate(result.expTrack.trxnDate));
                                expenseTrackingHolder.setFinancialYearStartDate(result.expTrack.financialYearStartDate);
                                expenseTrackingHolder.setFinancialYearEndDate(result.expTrack.financialYearEndDate);
                                expenseTrackingHolder.setOffices(officeList);
                                expenseTrackingHolder.setOfficeHierarchy("");
                                expenseTrackingHolder.setMainAccCodes(mainAccList);
                                expenseTrackingHolder.setAccHeadCodes(accHeadList);
                                expenseTrackingHolder.setAmount("");
                                expenseTrackingHolder.setChequeNo("");
                                expenseTrackingHolder.setChequeDate("");
                                expenseTrackingHolder.setBankName("");
                                expenseTrackingHolder.setBankBranch("");
                                expenseTrackingHolder.setNotes("");
                                expenseTrackingHolder.setValidateEndDate(result.expTrack.validateEndDate);
                                expenseTrackingHolder.setAllowedDecimals(result.expTrack.allowedDecimals);
                            }
                            if(req.session.afterDoExpensetrack != 1)
                                req.session.expenseTrackMonthClosingError = "";
                            req.session.afterDoExpensetrack = 0;
                            res.render("accounting/ExpensesTracking",{expenseTrackMonthClosingError:req.session.expenseTrackMonthClosingError,expenseTrackingHolder:expenseTrackingHolder, contextPath:props.contextPath});
                        }
                        else{
                            self.commonRouter.showErrorPage(req,res);
                        }
                    }
                });
            }
        }catch(e){
            customlog.error("Exception while expensetrackingload "+e);
            self.commonRouter.showErrorPage(req,res);
        }
    },
    accountadjustmentload : function(req,res) {
        try{
            var self = this;
            var rest = require("./rest.js");
            var accountadjustmentDetail = "";
            customlog.info("accountadjustmentDetail"+accountadjustmentDetail);
            var http = require('http');
            var https = require('https');
            customlog.info("Cookie:"+req.session.mifosCookie);
            var cookie = req.session.mifosCookie;
            if(typeof cookie == 'undefined') {
                res.redirect(props.contextPath+'/client/ci/login');
            }
            else {
                var postheaders = {
                    'Content-Type' : 'application/json',
                    'Content-Length' : Buffer.byteLength(accountadjustmentDetail, 'utf8'),
                    'Cookie' : req.session.mifosCookie
                };

                var options = {
                    host: mifosServiceIP,
                    port: mifosPort,
                    path: '/mfi/api/account/accounting/jouVou/load.json',
                    method: 'POST',
                    headers : postheaders
                };

                rest.postJSON(options,accountadjustmentDetail,function(statuscode,result,headers){
                    customlog.info("statuscode" + statuscode);
                    customlog.info("HEADERS:  "+headers)
                    customlog.info("RESULT"+result.status);
                    if(statuscode == 302){
                        res.redirect(props.contextPath+'/client/ci/logout');
                    }
                    else{
                        if(result.status == 'success'){
                            //var activityDetails = new Array(iklantPort, req.session.tenantId, req.session.userId, req.session.userName, req.originalUrl, req.connection.remoteAddress, "router.js", "accountadjustmentload", "success", "Account Adjustment", "accountadjustmentload");
                            //self.commonRouter.insertActivityLogModel(activityDetails);
                            var officeList = new Array();
                            var debitAccountList = new Array();
                            var creditAccountList = new Array();
                            var JournalVoucherHolder = require(path.join(rootPath,"app_modules/dto/accounting/JournalVoucherHolder"));
                            var GLCodeDto = require(path.join(rootPath,"app_modules/dto/accounting/GLCodeDto"));
                            var journalVoucherHolder = new JournalVoucherHolder();
                            if(result.jouVou != null){
                                if(result.jouVou.debitAccount != null) {
                                    for(var i=0 ; i<result.jouVou.debitAccount.length; i++) {
                                        var glCodeDto = new GLCodeDto();
                                        glCodeDto.setGlcode(result.jouVou.debitAccount[i].glcode);
                                        glCodeDto.setGlname(result.jouVou.debitAccount[i].glname);
                                        debitAccountList[i] = glCodeDto;
                                    }
                                }
                                //journalVoucherHolder.setVoucherDate(convertDate(result.jouVou.voucherDate));
                                customlog.info("JOV"+result.jouVou.voucherDate);
                                journalVoucherHolder.setVoucherDateStr(dateUtils.convertDate(result.jouVou.voucherDate));
                                journalVoucherHolder.setOfficeHierarchy("");
                                journalVoucherHolder.setOffice("");
                                journalVoucherHolder.setDebitAccount(debitAccountList);
                                journalVoucherHolder.setCreditAccount(creditAccountList);
                                journalVoucherHolder.setOffices(officeList);
                                journalVoucherHolder.setAmount("");
                                journalVoucherHolder.setVoucherNotes("");
                                journalVoucherHolder.setFinancialYearStartDate(result.jouVou.financialYearStartDate);
                                journalVoucherHolder.setFinancialYearEndDate(result.jouVou.financialYearEndDate);
                                journalVoucherHolder.setValidateEndDate(result.jouVou.validateEndDate);
                                journalVoucherHolder.setAllowedDecimals(result.jouVou.allowedDecimals);

                            }
                            if(req.session.afterAccountAdjustment != 1)
                                req.session.accountAdjustmentMonthClosingError = "";
                            req.session.afterAccountAdjustment = 0;
                            res.render("accounting/AccountAdjustment",{accountAdjustmentMonthClosingError:req.session.accountAdjustmentMonthClosingError,journalVoucherHolder:journalVoucherHolder, contextPath:props.contextPath});
                        }
                        else{
                            self.commonRouter.showErrorPage(req,res);
                        }
                    }
                });
            }
        }catch(e){
            customlog.erro("Exception whlile accountadjustmentload "+e);
            self.commonRouter.showErrorPage(req,res);
        }
    },
    expensetracking : function(req,res) {
        try{
            var self = this;
            var officeIdArray = new Array();
            var officeNameArray = new Array();
            var mainAccIdArray = new Array();
            var mainAccNameArray = new Array();
            var accountHeadsIdArray = new Array();
            var accountHeadsNameArray = new Array();

            var transactionDate = dateUtils.convertToMifosDateFormat(req.body.transactionDate);
            var financialYearStartDate = req.body.financialYearStartDate;
            var financialYearEndDate = req.body.financialYearEndDate;
            var officeHierarchy = req.body.officeHierarchy;
            var office = req.body.office;
            var transactionType = req.body.transactionType;
            var mainAccount = req.body.mainAccount;
            var officeId = req.body.officeIds;
            var officeName = req.body.officeNames;
            var mainAccId = req.body.mainAccId;
            var mainAccName = req.body.mainAccName;
            var accountHeadsId = req.body.accountHeadsId;
            var accountHeadsName = req.body.accountHeadsName;
            var validateEndDate = req.body.validateEndDate;
            var allowedDecimals = req.body.allowedDecimals;

            var accountHead = req.body.accountHead;
            var amount = req.body.amount;
            var chequeNo = req.body.chequeNo;
            var chequeDate = req.body.chequeDate;
            var branchName = req.body.branchName;
            var bankBranch = req.body.bankBranch;
            var transactionNotes = req.body.transactionNotes;
            var currentSelectValue = req.body.currentSelectValue;

            officeIdArray = officeId.split(",");
            officeNameArray = officeName.split(",");

            mainAccIdArray = mainAccId.split(",");
            mainAccNameArray = mainAccName.split(",");

            accountHeadsIdArray = accountHeadsId.split(",");
            accountHeadsNameArray = accountHeadsName.split(",");

            var OfficeGlobalDto = require(path.join(rootPath,"app_modules/dto/common/OfficeGlobalDto"));
            var ExpenseTrackingHolder = require(path.join(rootPath,"app_modules/dto/accounting/ExpenseTrackingHolder"));
            var GLCodeDto = require(path.join(rootPath,"app_modules/dto/accounting/GLCodeDto"));
            var expenseTrackingHolder = new ExpenseTrackingHolder();
            var officeList = new Array();
            for(var i=0 ; i<officeIdArray.length; i++) {
                var officeGlobalDto = new OfficeGlobalDto();
                officeGlobalDto.setGlobalOfficeNum(officeIdArray[i]);
                officeGlobalDto.setDisplayName(officeNameArray[i]);
                officeList[i] = officeGlobalDto;
                customlog.info("======================="+officeIdArray[i]);
            }


            var mianAccList = new Array();
            for(var i=0 ; i<mainAccIdArray.length; i++) {
                var glCodeDto = new GLCodeDto();
                glCodeDto.setGlcode(mainAccIdArray[i]);
                glCodeDto.setGlname(mainAccNameArray[i]);
                mianAccList[i] = glCodeDto;
            }

            var accountHeadList = new Array();
            for(var i=0 ; i<accountHeadsIdArray.length; i++) {
                var glCodeDto = new GLCodeDto();
                glCodeDto.setGlcode(accountHeadsIdArray[i]);
                glCodeDto.setGlname(accountHeadsNameArray[i]);
                accountHeadList[i] = glCodeDto;
            }

            expenseTrackingHolder.setFinancialYearStartDate(financialYearStartDate);
            expenseTrackingHolder.setFinancialYearEndDate(financialYearEndDate);
            //expenseTrackingHolder.setTrxnDate(transactionDate);
            expenseTrackingHolder.setTrxnDateStr(req.body.transactionDate);
            expenseTrackingHolder.setTrxnType(transactionType);
            expenseTrackingHolder.setMainAccount(mainAccount);
            expenseTrackingHolder.setOfficeHierarchy(officeHierarchy);
            expenseTrackingHolder.setOffice(office);
            expenseTrackingHolder.setAccountHead(accountHead);
            expenseTrackingHolder.setAmount(amount);
            expenseTrackingHolder.setChequeNo(chequeNo);
            if(typeof(chequeDate) == 'undefined' | chequeDate == '' |  chequeDate == 'NULL'){
                expenseTrackingHolder.setChequeDate(null);
            }
            else{
                expenseTrackingHolder.setChequeDate(dateUtils.convertToMifosDateFormat(chequeDate));
            }
            expenseTrackingHolder.setBankName(branchName);
            expenseTrackingHolder.setBankBranch(bankBranch);
            expenseTrackingHolder.setNotes(transactionNotes);
            expenseTrackingHolder.setOffices(officeList);
            expenseTrackingHolder.setMainAccCodes(mianAccList);
            expenseTrackingHolder.setAccHeadCodes(accountHeadList);
            expenseTrackingHolder.setValidateEndDate(validateEndDate);
            expenseTrackingHolder.setAllowedDecimals(allowedDecimals);

            var rest = require("./rest.js");
            var expenseTrackingDetail = JSON.stringify(expenseTrackingHolder);
            customlog.info("expenseTrackingDetail"+expenseTrackingDetail);
            var http = require('http');
            var https = require('https');
            customlog.info("Cookie:"+req.session.mifosCookie);
            var cookie = req.session.mifosCookie;
            if(typeof cookie == 'undefined') {
                res.redirect(props.contextPath+'/client/ci/login');
            }
            else {
                var postheaders = {
                    'Content-Type' : 'application/json',
                    'Content-Length' : Buffer.byteLength(expenseTrackingDetail, 'utf8'),
                    'Cookie' : req.session.mifosCookie
                };
                var currentPath;
                if(currentSelectValue == "loadOffices") {
                    currentPath = '/mfi/api/account/accounting/expTrack/loadOffices.json';
                }
                if(currentSelectValue == "loadMainAcc") {
                    currentPath = '/mfi/api/account/accounting/expTrack/loadMainAcc.json';
                }
                if(currentSelectValue == "loadAccHead") {
                    currentPath = '/mfi/api/account/accounting/expTrack/loadAccHead.json';
                }

                customlog.info("Current Path = "+currentPath);
                var options = {
                    host: mifosServiceIP,
                    port: mifosPort,
                    path: currentPath,
                    method: 'POST',
                    headers : postheaders
                };

                rest.postJSON(options,expenseTrackingDetail,function(statuscode,result,headers){
                    customlog.info("statuscode" + statuscode);
                    customlog.info("HEADERS:  "+headers)
                    customlog.info("RESULT"+result.status);
                    if(statuscode == 302){
                        res.redirect(props.contextPath+'/client/ci/logout');
                    }
                    else{
                        if(result.status == 'success'){
                            //var activityDetails = new Array(iklantPort, req.session.tenantId, req.session.userId, req.session.userName, req.originalUrl, req.connection.remoteAddress, "router.js", "expensetracking", "success", "Expense Tracking", "expensetracking");
                            //self.commonRouter.insertActivityLogModel(activityDetails);
                            if(result.expTrack != null){
                                var expenseTrackingHolder = new ExpenseTrackingHolder();
                                //expenseTrackingHolder.setTrxnDate(convertDate(result.expTrack.trxnDate));
                                expenseTrackingHolder.setTrxnDateStr(result.expTrack.trxnDateStr);
                                expenseTrackingHolder.setFinancialYearStartDate(convertMillisecToMifosDateFormat(result.expTrack.financialYearStartDate));
                                expenseTrackingHolder.setFinancialYearEndDate(convertMillisecToMifosDateFormat(result.expTrack.financialYearEndDate));
                                expenseTrackingHolder.setTrxnType(result.expTrack.trxnType);
                                expenseTrackingHolder.setMainAccount(result.expTrack.mainAccount);
                                expenseTrackingHolder.setOfficeHierarchy(result.expTrack.officeHierarchy);
                                expenseTrackingHolder.setOffice(result.expTrack.office);
                                expenseTrackingHolder.setAccountHead(result.expTrack.accountHead);
                                expenseTrackingHolder.setAmount(result.expTrack.amount);
                                expenseTrackingHolder.setChequeNo(result.expTrack.chequeNo);
                                expenseTrackingHolder.setChequeDate(result.expTrack.chequeDate);
                                expenseTrackingHolder.setBankName(result.expTrack.branchName);
                                expenseTrackingHolder.setBankBranch(result.expTrack.bankBranch);
                                expenseTrackingHolder.setNotes(result.expTrack.notes);

                                var officeList = new Array();
                                if(result.expTrack.offices != null) {
                                    for(var i=0 ; i<result.expTrack.offices.length; i++) {
                                        var officeGlobalDto = new OfficeGlobalDto();
                                        officeGlobalDto.setGlobalOfficeNum(result.expTrack.offices[i].globalOfficeNum);
                                        officeGlobalDto.setDisplayName(result.expTrack.offices[i].displayName);
                                        officeList[i] = officeGlobalDto;
                                    }
                                    expenseTrackingHolder.setOffices(officeList);
                                }

                                var mianAccList = new Array();
                                if(result.expTrack.mainAccCodes != null) {
                                    for(var i=0 ; i<result.expTrack.mainAccCodes.length; i++) {
                                        var glCodeDto = new GLCodeDto();
                                        glCodeDto.setGlcode(result.expTrack.mainAccCodes[i].glcode);
                                        glCodeDto.setGlname(result.expTrack.mainAccCodes[i].glname);
                                        mianAccList[i] = glCodeDto;
                                    }
                                }
                                expenseTrackingHolder.setMainAccCodes(mianAccList);

                                var accHeadList = new Array();
                                if(result.expTrack.accHeadCodes != null) {
                                    for(var i=0 ; i<result.expTrack.accHeadCodes.length; i++) {
                                        var glCodeDto = new GLCodeDto();
                                        glCodeDto.setGlcode(result.expTrack.accHeadCodes[i].glcode);
                                        glCodeDto.setGlname(result.expTrack.accHeadCodes[i].glname);
                                        accHeadList[i] = glCodeDto;
                                    }
                                }
                                expenseTrackingHolder.setAccHeadCodes(accHeadList);
                                expenseTrackingHolder.setValidateEndDate(result.expTrack.validateEndDate);
                                expenseTrackingHolder.setAllowedDecimals(result.expTrack.allowedDecimals);
                            }
                            if(req.session.afterDoExpensetrack != 1)
                                req.session.expenseTrackMonthClosingError = "";
                            req.session.afterDoExpensetrack = 0;
                            res.render("accounting/ExpensesTracking",{expenseTrackMonthClosingError:req.session.expenseTrackMonthClosingError,expenseTrackingHolder:expenseTrackingHolder, contextPath:props.contextPath});
                        }
                        else{
                            self.commonRouter.showErrorPage(req,res);
                        }
                    }
                });
            }
        }catch(e){
            customlog.error("Exception while expensetracking "+e);
            self.commonRouter.showErrorPage(req,res);
        }
    },
    accountadjustment : function(req,res) {
        try{
            var self = this;
            var officeIdArray = new Array();
            var officeNameArray = new Array();
            var debitAccIdArray = new Array();
            var debitAccNameArray = new Array();
            var creditAccIdArray = new Array();
            var creditAccNameArray = new Array();

            var voucherDate = dateUtils.convertToMifosDateFormat(req.body.voucherDate);
            var officeHierarchy = req.body.officeHierarchy;
            var office = req.body.office;
            var debitAccountHead = req.body.debitAccountHead;
            var creditAccountHead = req.body.creditAccountHead;
            var amount = req.body.amount;
            var voucherNotes = req.body.voucherNotes;
            var officeId = req.body.officeIds;
            var officeName = req.body.officeNames;
            var debitAccId = req.body.debitAccId;
            var debitAccName = req.body.debitAccName;
            var creditAccId = req.body.creditAccId;
            var creditAccName = req.body.creditAccName;
            var financialYearStartDate = req.body.financialYearStartDate;
            var financialYearEndDate = req.body.financialYearEndDate;
            var currentSelectValue = req.body.currentSelectValue;
            var validateEndDate = req.body.validateEndDate;
            var allowedDecimals = req.body.allowedDecimals;

            officeIdArray = officeId.split(",");
            officeNameArray = officeName.split(",");
            debitAccIdArray = debitAccId.split(",");
            debitAccNameArray = debitAccName.split(",");
            creditAccIdArray = creditAccId.split(",");
            creditAccNameArray = creditAccName.split(",");

            var OfficeGlobalDto = require(path.join(rootPath,"app_modules/dto/common/OfficeGlobalDto"));
            var JournalVoucherHolder = require(path.join(rootPath,"app_modules/dto/accounting/JournalVoucherHolder"));
            var GLCodeDto = require(path.join(rootPath,"app_modules/dto/accounting/GLCodeDto"));
            var journalVoucherHolder = new JournalVoucherHolder();
            var officeList = new Array();
            for(var i=0 ; i<officeIdArray.length; i++) {
                var officeGlobalDto = new OfficeGlobalDto();
                officeGlobalDto.setGlobalOfficeNum(officeIdArray[i]);
                officeGlobalDto.setDisplayName(officeNameArray[i]);
                officeList[i] = officeGlobalDto;
                customlog.info("======================="+officeIdArray[i]);
            }

            var debitAccList = new Array();
            for(var i=0 ; i<debitAccIdArray.length; i++) {
                var glCodeDto = new GLCodeDto();
                glCodeDto.setGlcode(debitAccIdArray[i]);
                glCodeDto.setGlname(debitAccNameArray[i]);
                debitAccList[i] = glCodeDto;
            }
            var creditAccList = new Array();
            for(var i=0 ; i<creditAccIdArray.length; i++) {
                var glCodeDto = new GLCodeDto();
                glCodeDto.setGlcode(creditAccIdArray[i]);
                glCodeDto.setGlname(creditAccNameArray[i]);
                creditAccList[i] = glCodeDto;
            }

            customlog.info("creditAccountHead==="+creditAccountHead);
            //journalVoucherHolder.setVoucherDate(voucherDate);
            journalVoucherHolder.setVoucherDateStr(req.body.voucherDate);
            journalVoucherHolder.setOfficeHierarchy(officeHierarchy);
            journalVoucherHolder.setOffice(office);
            journalVoucherHolder.setDebitAccountHead(debitAccountHead);
            journalVoucherHolder.setCreditAccountHead(creditAccountHead);
            journalVoucherHolder.setAmount(amount);
            journalVoucherHolder.setVoucherNotes(voucherNotes);
            journalVoucherHolder.setFinancialYearStartDate(financialYearStartDate);
            journalVoucherHolder.setFinancialYearEndDate(financialYearEndDate);
            journalVoucherHolder.setOffices(officeList);
            journalVoucherHolder.setDebitAccount(debitAccList);
            journalVoucherHolder.setCreditAccount(creditAccList);
            journalVoucherHolder.setValidateEndDate(validateEndDate);
            journalVoucherHolder.setAllowedDecimals(allowedDecimals);


            var rest = require("./rest.js");
            var journalVoucherDetail = JSON.stringify(journalVoucherHolder);
            customlog.info("journalVoucherDetail"+journalVoucherDetail);
            var http = require('http');
            var https = require('https');
            customlog.info("Cookie:"+req.session.mifosCookie);
            var cookie = req.session.mifosCookie;
            if(typeof cookie == 'undefined') {
                res.redirect(props.contextPath+'/client/ci/login');
            }
            else {
                var postheaders = {
                    'Content-Type' : 'application/json',
                    'Content-Length' : Buffer.byteLength(journalVoucherDetail, 'utf8'),
                    'Cookie' : req.session.mifosCookie
                };

                var currentPath;
                if(currentSelectValue == "loadOffices"){
                    var currentPath = '/mfi/api/account/accounting/jouVou/loadOffices.json';
                }
                if(currentSelectValue == "loadCreditAcc") {
                    currentPath = '/mfi/api/account/accounting/jouVou/loadCreditAcc.json';
                }


                customlog.info("Current Path = "+currentPath);
                var options = {
                    host: mifosServiceIP,
                    port: mifosPort,
                    path: currentPath,
                    method: 'POST',
                    headers : postheaders
                };

                rest.postJSON(options,journalVoucherDetail,function(statuscode,result,headers){
                    customlog.info("statuscode" + statuscode);
                    customlog.info("HEADERS:  "+headers)
                    customlog.info("RESULT"+result.status);
                    customlog.info("RESULT"+result.jouVou);
                    if(statuscode == 302){
                        res.redirect(props.contextPath+'/client/ci/logout');
                    }
                    else{
                        if(result.status == 'success'){
                            //var activityDetails = new Array(iklantPort, req.session.tenantId, req.session.userId, req.session.userName, req.originalUrl, req.connection.remoteAddress, "router.js", "accountadjustment", "success", "Account Adjustment", "accountadjustment");
                            //self.commonRouter.insertActivityLogModel(activityDetails);
                            if(result.jouVou != null){
                                var journalVoucherHolder = new JournalVoucherHolder();
                                //journalVoucherHolder.setVoucherDate(convertDate(result.jouVou.voucherDate));
                                journalVoucherHolder.setVoucherDateStr(result.jouVou.voucherDateStr);
                                journalVoucherHolder.setFinancialYearStartDate(dateUtils.convertMillisecToMifosDateFormat(result.jouVou.financialYearStartDate));
                                journalVoucherHolder.setFinancialYearEndDate(dateUtils.convertMillisecToMifosDateFormat(result.jouVou.financialYearEndDate));
                                journalVoucherHolder.setOfficeHierarchy(result.jouVou.officeHierarchy);
                                journalVoucherHolder.setOffice(result.jouVou.office);
                                journalVoucherHolder.setDebitAccountHead(result.jouVou.debitAccountHead);
                                journalVoucherHolder.setCreditAccountHead(result.jouVou.creditAccountHead);
                                journalVoucherHolder.setAmount(result.jouVou.amount);
                                journalVoucherHolder.setVoucherNotes(result.jouVou.voucherNotes);

                                var officeList = new Array();
                                if(result.jouVou.offices != null) {
                                    for(var i=0 ; i<result.jouVou.offices.length; i++) {
                                        var officeGlobalDto = new OfficeGlobalDto();
                                        officeGlobalDto.setGlobalOfficeNum(result.jouVou.offices[i].globalOfficeNum);
                                        officeGlobalDto.setDisplayName(result.jouVou.offices[i].displayName);
                                        officeList[i] = officeGlobalDto;
                                    }
                                    journalVoucherHolder.setOffices(officeList);
                                }

                                var debitAccList = new Array();
                                if(result.jouVou.debitAccount != null) {
                                    for(var i=0 ; i<result.jouVou.debitAccount.length; i++) {
                                        var glCodeDto = new GLCodeDto();
                                        glCodeDto.setGlcode(result.jouVou.debitAccount[i].glcode);
                                        glCodeDto.setGlname(result.jouVou.debitAccount[i].glname);
                                        debitAccList[i] = glCodeDto;
                                    }
                                }
                                journalVoucherHolder.setDebitAccount(debitAccList);

                                var creditAccList = new Array();
                                if(result.jouVou.creditAccount != null) {
                                    for(var i=0 ; i<result.jouVou.creditAccount.length; i++) {
                                        var glCodeDto = new GLCodeDto();
                                        glCodeDto.setGlcode(result.jouVou.creditAccount[i].glcode);
                                        glCodeDto.setGlname(result.jouVou.creditAccount[i].glname);
                                        creditAccList[i] = glCodeDto;
                                    }
                                }
                                journalVoucherHolder.setCreditAccount(creditAccList);
                                journalVoucherHolder.setValidateEndDate(result.jouVou.validateEndDate);
                                journalVoucherHolder.setAllowedDecimals(result.jouVou.allowedDecimals);
                            }
                            if(req.session.afterAccountAdjustment != 1)
                                req.session.accountAdjustmentMonthClosingError = "";
                            req.session.afterAccountAdjustment = 0;
                            res.render("accounting/AccountAdjustment",{accountAdjustmentMonthClosingError:req.session.accountAdjustmentMonthClosingError,journalVoucherHolder:journalVoucherHolder, contextPath:props.contextPath});
                        }
                        else{
                            self.commonRouter.showErrorPage(req,res);
                        }
                    }
                });
            }
        }catch(e){
            customlog.error("Exception While accountadjustment "+e);
            self.commonRouter.showErrorPage(req,res);
        }
    },
    doexpensetracking :  function(req,res) {
        try{
            var self = this;
            var transactionDate = req.body.transactionDate;
            var financialYearStartDate = req.body.financialYearStartDate;
            var financialYearEndDate = req.body.financialYearEndDate;
            var officeHierarchy = req.body.officeHierarchy;
            var office = req.body.office;
            var transactionType = req.body.transactionType;
            var mainAccount = req.body.mainAccount;
            var accountHead = req.body.accountHead;
            var amount = req.body.amount;
            var chequeNo = req.body.chequeNo;
            var chequeDate = req.body.chequeDate;
            var branchName = req.body.branchName;
            var bankBranch = req.body.bankBranch;
            var transactionNotes = req.body.transactionNotes;
            var ExpenseTrackingHolder = require(path.join(rootPath,"app_modules/dto/accounting/ExpenseTrackingHolder"));
            var expenseTrackingHolder = new ExpenseTrackingHolder();

            customlog.info(officeHierarchy+"--"+transactionType+"--"+mainAccount);
            expenseTrackingHolder.setFinancialYearStartDate(financialYearStartDate);
            expenseTrackingHolder.setFinancialYearEndDate(financialYearEndDate);
            if(typeof(transactionDate) == 'undefined' | transactionDate == '' |  transactionDate == 'NULL'){
                expenseTrackingHolder.setTrxnDate(null);
            }
            else{
                //expenseTrackingHolder.setTrxnDate(convertToMifosDateFormat(transactionDate));
                expenseTrackingHolder.setTrxnDateStr(transactionDate);
            }
            expenseTrackingHolder.setOfficeHierarchy(officeHierarchy);
            expenseTrackingHolder.setOffice(office);
            expenseTrackingHolder.setTrxnType(transactionType);
            expenseTrackingHolder.setMainAccount(mainAccount);
            expenseTrackingHolder.setAccountHead(accountHead);
            expenseTrackingHolder.setAmount(amount);
            expenseTrackingHolder.setChequeNo(chequeNo);
            if(typeof(chequeDate) == 'undefined' | chequeDate == '' |  chequeDate == 'NULL'){
                expenseTrackingHolder.setChequeDate(null);
            }
            else{
                expenseTrackingHolder.setChequeDate(dateUtils.convertToMifosDateFormat(chequeDate));
            }
            expenseTrackingHolder.setBankName(branchName);
            expenseTrackingHolder.setBankBranch(bankBranch);
            expenseTrackingHolder.setNotes(transactionNotes);


            var rest = require("./rest.js");
            var expenseTrackingDetail = JSON.stringify(expenseTrackingHolder);
            customlog.info("expenseTrackingDetail"+expenseTrackingDetail);
            var http = require('http');
            var https = require('https');
            customlog.info("Cookie:"+req.session.mifosCookie);
            var cookie = req.session.mifosCookie;
            if(typeof cookie == 'undefined') {
                res.redirect(props.contextPath+'/client/ci/login');
            }
            else {
                var postheaders = {
                    'Content-Type' : 'application/json',
                    'Content-Length' : Buffer.byteLength(expenseTrackingDetail, 'utf8'),
                    'Cookie' : req.session.mifosCookie
                };
                var options = {
                    host: mifosServiceIP,
                    port: mifosPort,
                    path: '/mfi/api/account/accounting/expTrack/submit.json',
                    method: 'POST',
                    headers : postheaders
                };

                rest.postJSON(options,expenseTrackingDetail,function(statuscode,result,headers){
                    customlog.info("statuscode" + statuscode);
                    customlog.info("HEADERS:  "+headers)
                    customlog.info("RESULT"+result.status);
                    if(statuscode == 302){
                        res.redirect(props.contextPath+'/client/ci/logout');
                    }
                    else{
                        if(result.status == 'success'){
                            //var activityDetails = new Array(iklantPort, req.session.tenantId, req.session.userId, req.session.userName, req.originalUrl, req.connection.remoteAddress, "router.js", "doexpensetracking", "success", "doexpensetracking", "doexpensetracking");
                            //self.commonRouter.insertActivityLogModel(activityDetails);
                            self.expensetrackingload(req,res);
                        }
                        else{
                            //var activityDetails = new Array(iklantPort, req.session.tenantId, req.session.userId, req.session.userName, req.originalUrl, req.connection.remoteAddress, "router.js", "doexpensetracking", "failure", "doexpensetracking", "doexpensetracking");
                            //self.commonRouter.insertActivityLogModel(activityDetails);
                            customlog.error("Expense Tracking Error = "+result.error);
                            if(typeof result.error != 'undefined'){
                                req.session.expenseTrackMonthClosingError = result.error;
                                req.session.afterDoExpensetrack = 1;
                                self.expensetrackingload(req,res);
                            }
                            else {
                                self.commonRouter.showErrorPage(req,res);
                            }
                        }
                    }
                });
            }
        }catch(e){
            customlog.error("Exception while doexpensetracking "+e);
            self.commonRouter.showErrorPage(req,res);
        }
    },
    doaccountadjustment :  function(req,res) {
        try{
            var self = this;
            var voucherDate = dateUtils.convertToMifosDateFormat(req.body.voucherDate);
            var officeHierarchy = req.body.officeHierarchy;
            var office = req.body.office;
            var debitAccountHead = req.body.debitAccountHead;
            var creditAccountHead = req.body.creditAccountHead;
            var amount = req.body.amount;
            var voucherNotes = req.body.voucherNotes;
            var financialYearStartDate = req.body.financialYearStartDate;
            var financialYearEndDate = req.body.financialYearEndDate;
            var JournalVoucherHolder = require(path.join(rootPath,"app_modules/dto/accounting/JournalVoucherHolder"));
            var journalVoucherHolder = new JournalVoucherHolder();
            //journalVoucherHolder.setVoucherDate(voucherDate);
            journalVoucherHolder.setVoucherDateStr(req.body.voucherDate);
            journalVoucherHolder.setOfficeHierarchy(officeHierarchy);
            journalVoucherHolder.setOffice(office);
            journalVoucherHolder.setDebitAccountHead(debitAccountHead);
            journalVoucherHolder.setCreditAccountHead(creditAccountHead);
            journalVoucherHolder.setFinancialYearStartDate(financialYearStartDate);
            journalVoucherHolder.setFinancialYearEndDate(financialYearEndDate);
            journalVoucherHolder.setAmount(amount);
            journalVoucherHolder.setVoucherNotes(voucherNotes);

            var rest = require("./rest.js");
            var journalVoucherDetail = JSON.stringify(journalVoucherHolder);
            customlog.info("journalVoucherDetail"+journalVoucherDetail);
            var http = require('http');
            var https = require('https');
            customlog.info("Cookie:"+req.session.mifosCookie);
            var cookie = req.session.mifosCookie;
            if(typeof cookie == 'undefined') {
                res.redirect(props.contextPath+'/client/ci/login');
            }
            else {
                var postheaders = {
                    'Content-Type' : 'application/json',
                    'Content-Length' : Buffer.byteLength(journalVoucherDetail, 'utf8'),
                    'Cookie' : req.session.mifosCookie
                };
                var options = {
                    host: mifosServiceIP,
                    port: mifosPort,
                    path: '/mfi/api/account/accounting/jouVou/submit.json',
                    method: 'POST',
                    headers : postheaders
                };

                rest.postJSON(options,journalVoucherDetail,function(statuscode,result,headers){
                    customlog.info("statuscode" + statuscode);
                    customlog.info("HEADERS:  "+headers)
                    customlog.info("RESULT"+result.status);
                    if(statuscode == 302){
                        res.redirect(props.contextPath+'/client/ci/logout');
                    }
                    else{
                        if(result.status == 'success'){
                            var activityDetails = new Array(iklantPort, req.session.tenantId, req.session.userId, req.session.userName, req.originalUrl, req.connection.remoteAddress, "router.js", "doaccountadjustment", "success", "Account Adjustment", "Accountadjustment successfully","update");
                            self.commonRouter.insertActivityLogModel(activityDetails);
                            self.accountadjustmentload(req,res);
                        }
                        else{
                            if(typeof result.error != 'undefined'){
                                //var activityDetails = new Array(iklantPort, req.session.tenantId, req.session.userId, req.session.userName, req.originalUrl, req.connection.remoteAddress, "router.js", "doaccountadjustment", "failure", "doaccountadjustment", "doaccountadjustment");
                                //self.commonRouter.insertActivityLogModel(activityDetails);
                                req.session.accountAdjustmentMonthClosingError = result.error;
                                req.session.afterAccountAdjustment = 1;
                                self.accountadjustmentload(req,res);
                            }
                            else {
                                self.commonRouter.showErrorPage(req,res);
                            }

                        }
                    }
                });
            }
        }catch(e){
            customlog.error("Exception while doaccountadjustment "+e);
            self.commonRouter.showErrorPage(req,res);
        }
    },
    cashPaymentVoucherLoad : function(req,res) {
        try{
            var self = this;
            var constantsObj = this.constants;
            var CashPaymentVoucherHolder = require(path.join(rootPath,"app_modules/dto/accounting/CashPaymentVoucherHolder"));
            var CashPaymentVoucherDetail = new CashPaymentVoucherHolder();
            var selectedOfficeId = req.body.selectedOfficeId;
            var dateResetFlag = req.params.dateResetFlag;
            var typeOfTransaction = req.params.typeOfTransaction;
            var dateofTransaction = req.body.dateofTransaction;
            var dateofTransactionToDate = req.body.dateofTransactionToDate;
            var statusMessage = req.body.successMsg;
            customlog.info("typeOfTransaction="+typeOfTransaction);
            if(typeof typeOfTransaction == 'undefined' || typeOfTransaction == 1)
                servicePath = '/mfi/api/account/accounting/expTrack/report/cashPaymentList.json';
            else if(typeOfTransaction == 2)
                servicePath = '/mfi/api/account/accounting/expTrack/report/cashReceiptList.json';
            else if(typeOfTransaction == 3)
                servicePath = '/mfi/api/account/accounting/expTrack/report/bankPaymentList.json';
            else if(typeOfTransaction == 4)
                servicePath = '/mfi/api/account/accounting/expTrack/report/bankReceiptList.json';
            else if(typeOfTransaction == 5)
                servicePath = '/mfi/api/account/accounting/expTrack/report/contraList.json';
            else if(typeOfTransaction == 6)
                servicePath = '/mfi/api/account/accounting/expTrack/report/journalList.json';

            if(typeof selectedOfficeId == 'undefined')
                CashPaymentVoucherDetail.setOfficeId(req.session.officeId);
            else
                CashPaymentVoucherDetail.setOfficeId(selectedOfficeId);

            /*if(typeof dateofTransaction == 'undefined')
             CashPaymentVoucherDetail.setFromDate(convertMillisecToMifosDateFormatStr(new Date().getTime()));
             else
             CashPaymentVoucherDetail.setFromDate(dateofTransaction);

             if(typeof dateofTransactionToDate == 'undefined')
             CashPaymentVoucherDetail.setToDate(convertMillisecToMifosDateFormatStr(new Date().getTime()));
             else
             CashPaymentVoucherDetail.setToDate(dateofTransactionToDate);*/

            if(dateResetFlag == 1) {
                dateofTransaction = dateUtils.convertMillisecToMifosDateFormatStr(new Date().getTime());
                dateofTransactionToDate = dateUtils.convertMillisecToMifosDateFormatStr(new Date().getTime());
                CashPaymentVoucherDetail.setFromDate(dateofTransaction);
                CashPaymentVoucherDetail.setToDate(dateofTransactionToDate);

            } else {
                CashPaymentVoucherDetail.setFromDate(dateofTransaction);
                CashPaymentVoucherDetail.setToDate(dateofTransactionToDate);
            }

            var CashPaymentVoucherDetail = JSON.stringify(CashPaymentVoucherDetail);
            customlog.info("CashPaymentVoucherDetail" + CashPaymentVoucherDetail);
            var rest = require("./rest.js");
            var http = require('http');
            var https = require('https');
            customlog.info("Cookie:"+req.session.mifosCookie);
            var cookie = req.session.mifosCookie;
            if(typeof cookie == 'undefined') {
                res.redirect(props.contextPath+'/client/ci/login');
            }
            else {
                var postheaders = {
                    'Content-Type' : 'application/json',
                    'Content-Length' : Buffer.byteLength(CashPaymentVoucherDetail, 'utf8'),
                    'Cookie' : req.session.mifosCookie
                };
                var options = {
                    host: mifosServiceIP,
                    port: mifosPort,
                    path: servicePath,
                    method: 'POST',
                    headers : postheaders
                };

                rest.postJSON(options,CashPaymentVoucherDetail,function(statuscode,result,headers){
                    customlog.info("statuscode" + statuscode);
                    customlog.info("HEADERS:  "+headers)
                    customlog.info("RESULT"+result.status);
                    if(statuscode == 302){
                        res.redirect(props.contextPath+'/client/ci/logout');
                    }
                    else{
                        if(result.status == 'success'){
                            //var activityDetails = new Array(iklantPort, req.session.tenantId, req.session.userId, req.session.userName, req.originalUrl, req.connection.remoteAddress, "router.js", "cashPaymentVoucherLoad", "success", "Dashboard - Cash Payment Voucher", "cashPaymentVoucherLoad");
                            //self.commonRouter.insertActivityLogModel(activityDetails);
                            if(result.expTrack != null && result.officeAddress != null){
                                var CashPaymentVoucherDto = require(path.join(rootPath,"app_modules/dto/accounting/CashPaymentVoucher"));
                                var CashPaymentVoucher = new  Array();
                                for(var i=0;i<result.expTrack.length;i++){
                                    var CashPaymentVoucherDetail = new CashPaymentVoucherDto();
                                    customlog.info(result.expTrack[i].debitAccName);
                                    CashPaymentVoucherDetail.setTransactionMasterId(result.expTrack[i].transactionMasterId);
                                    CashPaymentVoucherDetail.setDebitAccName(result.expTrack[i].debitAccName);
                                    CashPaymentVoucherDetail.setCreditAccName(result.expTrack[i].creditAccName);
                                    CashPaymentVoucherDetail.setTrxnAmount(result.expTrack[i].trxnAmount);
                                    CashPaymentVoucherDetail.setNarration(result.expTrack[i].narration);
                                    CashPaymentVoucherDetail.setAmountInWords(result.expTrack[i].amountInWords);
                                    CashPaymentVoucherDetail.setVoucherNum(result.expTrack[i].voucherNum);
                                    CashPaymentVoucherDetail.setPaymentDate(dateUtils.convertToMifosDateFormat(result.expTrack[i].paymentDate)); // Praveen [PDF Issue]
                                    CashPaymentVoucherDetail.setCustomerName(result.expTrack[i].customerName);
                                    CashPaymentVoucherDetail.setTransactionType(result.expTrack[i].transactionType);
                                    CashPaymentVoucherDetail.setUpdatedBy(result.expTrack[i].updatedBy);
                                    CashPaymentVoucherDetail.setCreatedBy(result.expTrack[i].createdBy);
                                    CashPaymentVoucher[i] = CashPaymentVoucherDetail;
                                }
                                var OfficeDto = require(path.join(rootPath,"app_modules/dto/common/OfficeDto"));
                                var offices = new Array();
                                for(var i=0;i<result.officeList.length;i++){
                                    var OfficeDetail = new OfficeDto();
                                    OfficeDetail.setId(result.officeList[i].id);
                                    OfficeDetail.setName(result.officeList[i].name);
                                    offices[i] = OfficeDetail;
                                }
                                var Address = require(path.join(rootPath,"app_modules/dto/common/Address"));
                                var AddressDetail = new Address();
                                AddressDetail.setLine1(result.officeAddress.line1);
                                AddressDetail.setLine2(result.officeAddress.line2);
                                AddressDetail.setLine3(result.officeAddress.line3);
                                AddressDetail.setCity(result.officeAddress.city);
                                AddressDetail.setState(result.officeAddress.state);
                                AddressDetail.setCountry(result.officeAddress.country);
                                AddressDetail.setZip(result.officeAddress.zip);
                                AddressDetail.setPhoneNumber(result.officeAddress.phoneNumber);
                                AddressDetail.setPhoneNumberStripped(result.officeAddress.phoneNumberStripped);

                                res.render("accounting/CashPaymentVoucher",{officeId:(typeof selectedOfficeId == 'undefined')?req.session.officeId:selectedOfficeId,
                                    offices:offices,CashPaymentVoucher:CashPaymentVoucher,AddressDetail:AddressDetail,statusMessage:statusMessage,userId:req.session.userId,
                                    dateofTransaction:(typeof dateofTransaction == 'undefined')?dateUtils.convertDate(new Date().getTime()):dateofTransaction,
                                    //dateofTransaction:convertDate(new Date().getTime()),
                                    dateofTransactionToDate:(typeof dateofTransactionToDate == 'undefined')?dateUtils.convertDate(new Date().getTime()):dateofTransactionToDate,
                                    //dateofTransactionToDate:convertDate(new Date().getTime()),
                                    typeOfTransaction:(typeof typeOfTransaction == 'undefined')?1:typeOfTransaction,roleId:req.session.roleId,constantsObj:constantsObj, contextPath:props.contextPath});
                            }
                        }
                        else {
                            self.commonRouter.showErrorPage(req,res);
                        }
                    }
                });
            }
        }catch(e){
            customlog.error("Exception while cashPaymentVoucherLoad "+e);
            self.commonRouter.showErrorPage(req,res);
        }
    },
    generateCashPaymentVoucherPDF : function(req,res){
        try{
            var self = this;
            var doc = new PDFDocument;
            doc.font('Times-Roman').fontSize(14).text(props.tenantCompanyName,{align: 'center'});
            doc.font('Times-Roman').fontSize(10).text(props.tenantCompanyFKAName,{align: 'center'});
            //doc.font('Times-Roman').fontSize(14).text('APEX ABISHEK FINANCE LIMITED',{align: 'center'});
            doc.font('Times-Roman').fontSize(10).text('B-27,Hudco colony,near PSG Hospital',{align: 'center'});
            doc.font('Times-Roman').fontSize(10).text('Peelamedu, Coimbatore -641004. Phone-0422 4518475',{align: 'center'});
            doc.moveDown();
            var typeOfTransaction = req.body.typeOfTransaction;
            var voucherName;
            customlog.info("typeOfTransaction : "+typeOfTransaction);
            if(typeOfTransaction == 1) {
                voucherName = 'Cash Payment Voucher';
            } else if(typeOfTransaction == 2) {
                voucherName = 'Cash Receipt Voucher';
            } else if(typeOfTransaction == 3) {
                voucherName = 'Bank Payment Voucher';
            } else if(typeOfTransaction == 4) {
                voucherName = 'Bank Receipt Voucher';
            } else if(typeOfTransaction == 5) {
                voucherName = 'Contra Voucher';
            } else if(typeOfTransaction == 6) {
                voucherName = 'Journal Voucher';
            }
            doc.font('Times-Roman').fontSize(14).text(voucherName,{align: 'center'});
            doc.moveDown();
            var voucherNo = (req.body.voucherNo == 'null')?'':req.body.voucherNo;
            doc.font('Times-Roman').fontSize(10).text('No : '+voucherNo,12,155);
            //doc.font('Times-Roman').fontSize(10).text('Dated    : '+todaysDateDDMMMYYYY(),510,155);
            doc.font('Times-Roman').fontSize(10).text('Dated    : '+req.body.paymentDate,510,155); // Praveen [PDF Issue]
            longLines = "_______________________________________________________________________________________________________________________";
            doc.font('Times-Roman').fontSize(10).text(longLines,10,160);
            doc.font('Times-Roman').fontSize(11).text('Particulars',30,172);
            doc.font('Times-Roman').fontSize(11).text('Amount',530,172);
            doc.font('Times-Roman').fontSize(10).text(longLines,10,175);
            doc.font('Times-Roman').fontSize(11).text("Account :",12,190);
            doc.font('Times-Roman').fontSize(11).text(req.body.trxnAmt,530,198);
            //var creditOrDebit =  (typeOfTransaction == 1 || typeOfTransaction == 3)?' Dr':' Cr';
            doc.font('Times-Roman').fontSize(10).text(req.body.debitAcc+"      "+req.body.trxnAmt+" "+req.body.debitOrCredit,30,205);

            for(var s=166.5;s<=650;s=s+10) {
                doc.font('fonts/times.ttf').fontSize(12).text("|",510,s);
            }
            doc.font('Times-Roman').fontSize(11).text("Through :",12,550);
            doc.font('Times-Roman').fontSize(10).text(req.body.creditAcc,30,570);
            doc.font('Times-Roman').fontSize(11).text("On Account Of :",12,590);
            doc.font('Times-Roman').fontSize(10).text(req.body.narration,30,610);
            doc.font('Times-Roman').fontSize(11).text("Amount(in words) :",12,630);
            doc.font('Times-Roman').fontSize(10).text(req.body.amountInWords+" Indian Rupees Only",30,650);
            doc.font('Times-Roman').fontSize(10).text("___________________",511,636);
            doc.font('Times-Roman').fontSize(11).text(req.body.trxnAmt,530,648);
            doc.font('Times-Roman').fontSize(10).text("___________________",511,651);
            doc.font('Times-Roman').fontSize(10).text("Receiver's Signature:",12,690);
            doc.font('Times-Roman').fontSize(10).text("Checked By:",12,730);
            doc.font('Times-Roman').fontSize(10).text("Authorised Signatory",520,690);
            doc.font('Times-Roman').fontSize(10).text("Verified by",560,730);


            var self = this;
            var fileName;
            if(typeOfTransaction == 1) {
                fileName = 'cash_payment_voucher_form';
            } else if(typeOfTransaction == 2) {
                fileName = 'cash_receipt_voucher_form';
            } else if(typeOfTransaction == 3) {
                fileName = 'bank_payment_voucher_form';
            } else if(typeOfTransaction == 4) {
                fileName = 'bank_receipt_voucher_form';
            } else if(typeOfTransaction == 5) {
                fileName = 'contra_voucher_form';
            } else if(typeOfTransaction == 6) {
                fileName = 'journal_voucher_form';
            }
            doc.write(rootPath+"/documents/voucher_documents/"+fileName+req.body.masterId+".pdf",function(err){
                if(err){
                }else{
                    //var activityDetails = new Array(iklantPort, req.session.tenantId, req.session.userId, req.session.userName, req.originalUrl, req.connection.remoteAddress, "router.js", "generateCashPaymentVoucherPDF", "success", "Dashboard - "+fileName+" PDF Generation", "generateCashPaymentVoucherPDF");
                    //self.commonRouter.insertActivityLogModel(activityDetails);
                    req.body.path = rootPath+"/documents/voucher_documents/"+fileName+req.body.masterId+".pdf";
                    req.body.status = 'success';
                    res.send(req.body);
                }
            });
        }catch(e){
            customlog.error("Exception while generateCashPaymentVoucherPDF "+e);
            self.commonRouter.showErrorPage(req,res);
        }
    },
    dayBookLoad : function(req,res){
        try{
            var self = this;
            var constantsObj = this.constants;
            
            var DayBookDetail = new DayBookHolder();
            DayBookDetail.setCurrentDateStr(req.body.currentDateStr);
            DayBookDetail.setDisplayDate(req.body.displayDate);
            if(req.session.officeId == 1){
                DayBookDetail.setOfficeId(req.body.office);
            }
            else {
                DayBookDetail.setOfficeId(req.session.officeId);
            }
            DayBookDetail.setRoleId(req.session.roleId);
            var dateofTransaction = req.body.dateofTransaction;
            if(typeof dateofTransaction == 'undefined'){

            }
            else{
                DayBookDetail.setTransactionDateStr(dateUtils.convertToMifosDateFormat(dateofTransaction));
            }
            if(typeof dateofTransaction == 'undefined'){

            }
            else{
                DayBookDetail.setLastClosingDateStr(dateUtils.convertToMifosDateFormat(req.body.lastClosingDateStr));
            }
            //DayBookDetail.setTransactionDateStr("2013-08-20");
            var DayBookDetail = JSON.stringify(DayBookDetail);
            customlog.info("DayBookDetail" + DayBookDetail);
            var rest = require("./rest.js");
            var http = require('http');
            var https = require('https');
            customlog.info("Cookie:"+req.session.mifosCookie);
            var cookie = req.session.mifosCookie;
            if(typeof cookie == 'undefined') {
                res.redirect(props.contextPath+'/client/ci/login');
            }
            else {
                var postheaders = {
                    'Content-Type' : 'application/json',
                    'Content-Length' : Buffer.byteLength(DayBookDetail, 'utf8'),
                    'Cookie' : req.session.mifosCookie
                };
                var options = {
                    host: mifosServiceIP,
                    port: mifosPort,
                    path: '/mfi/api/account/accounting/dayBook/load.json',
                    method: 'POST',
                    headers : postheaders
                };

                rest.postJSON(options,DayBookDetail,function(statuscode,result,headers){
                    customlog.info("statuscode" + statuscode);
                    customlog.info("HEADERS:  "+headers)
                    customlog.info("RESULT"+result.status);
                    if(statuscode == 302){
                        res.redirect(props.contextPath+'/client/ci/logout');
                    }
                    else{
                        if(result.status == 'success'){
                            //var activityDetails = new Array(iklantPort, req.session.tenantId, req.session.userId, req.session.userName, req.originalUrl, req.connection.remoteAddress, "router.js", "dayBookLoad", "success", "Day book", "dayBookLoad");
                            //self.commonRouter.insertActivityLogModel(activityDetails);
                            var inflowDetails = new Array();
                            var outflowDetails = new Array();
                            var DayBookDetail = new DayBookHolder();
                            var ClosingBalance = null;
                            var officeList =  new Array();
                            if(result.officeList != null){
                                var OfficeDto = require(path.join(rootPath,"app_modules/dto/common/OfficeDto"));
                                for(var i=0; i<result.officeList.length; i++){
                                    var officeDto = new OfficeDto();
                                    officeDto.setName(result.officeList[i].name);
                                    officeDto.setId(result.officeList[i].id);
                                    officeList[i] = officeDto;
                                    customlog.info("office=="+result.officeList[i].id);
                                }
                            }
                            if(result.error != null){
                                req.session.afterVerify = 1;
                                req.session.dayBookErrors = result.error;
                                customlog.error("Errors Length="+result.error.length)
                                //for(var i=0; i<result.error.length;i++){
                                customlog.error(result.error);
                                //}
                            }
                            else if(result.inflowDetails != null && result.outflowDetails != null){
                                var InflowOutflowDto = require(path.join(rootPath,"app_modules/dto/accounting/InflowOutflowDto"));
                                customlog.info(result.inflowDetails.length);
                                customlog.info(result.outflowDetails.length);
                                for(var i =0; i<result.inflowDetails.length; i++){
                                    var InflowOutflowDtoDetail = new InflowOutflowDto();
                                    InflowOutflowDtoDetail.setOfficeName(result.inflowDetails[i].officeName);
                                    InflowOutflowDtoDetail.setDescription(result.inflowDetails[i].description);
                                    InflowOutflowDtoDetail.setTransactionType(result.inflowDetails[i].transactionType);
                                    InflowOutflowDtoDetail.setChequeNumber(result.inflowDetails[i].chequeNumber);
                                    InflowOutflowDtoDetail.setTransactionAmount(parseFloat(result.inflowDetails[i].transactionAmount).toFixed(2));
                                    inflowDetails.push(InflowOutflowDtoDetail);
                                }
                                for(var i =0; i<result.outflowDetails.length; i++){
                                    var InflowOutflowDtoDetail = new InflowOutflowDto();
                                    InflowOutflowDtoDetail.setOfficeName(result.outflowDetails[i].officeName);
                                    InflowOutflowDtoDetail.setDescription(result.outflowDetails[i].description);
                                    InflowOutflowDtoDetail.setTransactionType(result.outflowDetails[i].transactionType);
                                    InflowOutflowDtoDetail.setChequeNumber(result.outflowDetails[i].chequeNumber);
                                    InflowOutflowDtoDetail.setTransactionAmount(parseFloat(result.outflowDetails[i].transactionAmount).toFixed(2));
                                    outflowDetails.push(InflowOutflowDtoDetail);
                                }

                                DayBookDetail.setTransactionDateStr(dateUtils.convertToMifosDateFormat(result.dayBookHolder.transactionDateStr));
                                DayBookDetail.setOfficeId(result.dayBookHolder.officeId);
                                DayBookDetail.setRoleId(result.dayBookHolder.roleId);
                                DayBookDetail.setCurrentDateStr(result.dayBookHolder.currentDateStr);
                                DayBookDetail.setDisplayDate(result.dayBookHolder.displayDate);
                                DayBookDetail.setLastClosingDateStr(dateUtils.convertToMifosDateFormat(result.dayBookHolder.lastClosingDateStr));
                                ClosingBalance = parseFloat(result.closingBal.closingBalance).toFixed(2);
                            }
                            req.session.dayBookErrors = "";
                            req.session.VerifiedDayMsg = "";
                            res.render("accounting/DayBook",{VerifiedDayMsg:req.session.VerifiedDayMsg,dayBookErrors:req.session.dayBookErrors,DayBookDetail:DayBookDetail,ClosingBalance:ClosingBalance,inflowDetails:inflowDetails,outflowDetails:outflowDetails,officeList:officeList,constantsObj : constantsObj, contextPath:props.contextPath});
                        }
                        else {
                            self.commonRouter.showErrorPage(req,res);
                        }
                    }
                });
            }
        }catch(e){
            customlog.error("Exception while dayBookLoad "+e);
            self.commonRouter.showErrorPage(req,res);
        }
    },
    dayBookLoadInit: function(req,res) {
        try{
            var self = this;
            var constantsObj = this.constants;
            
            var DayBookDetail = new DayBookHolder();
            if(req.session.officeId == 1){
                DayBookDetail.setOfficeId(2);
            }
            else {
                DayBookDetail.setOfficeId(req.session.officeId);
            }
            DayBookDetail.setRoleId(req.session.roleId);
            var DayBookDetail = JSON.stringify(DayBookDetail);
            customlog.info("DayBookDetail" + DayBookDetail);
            var rest = require("./rest.js");
            var http = require('http');
            var https = require('https');
            customlog.info("Cookie:"+req.session.mifosCookie);
            var cookie = req.session.mifosCookie;
            if(typeof cookie == 'undefined' || typeof (req.session.tenantId) == 'undefined') {
                res.redirect(props.contextPath+'/client/ci/login');
            }
            else {
                var postheaders = {
                    'Content-Type' : 'application/json',
                    'Content-Length' : Buffer.byteLength(DayBookDetail, 'utf8'),
                    'Cookie' : req.session.mifosCookie
                };
                var options = {
                    host: mifosServiceIP,
                    port: mifosPort,
                    path: '/mfi/api/account/accounting/dayBook/load.json',
                    method: 'POST',
                    headers : postheaders
                };

                rest.postJSON(options,DayBookDetail,function(statuscode,result,headers){
                    customlog.info("statuscode" + statuscode);
                    customlog.info("HEADERS:  "+headers)
                    customlog.info("RESULT"+result.status);
                    if(statuscode == 302){
                        res.redirect(props.contextPath+'/client/ci/logout');
                    }
                    else{
                        if(result.status == 'success'){
                            //var activityDetails = new Array(iklantPort, req.session.tenantId, req.session.userId, req.session.userName, req.originalUrl, req.connection.remoteAddress, "router.js", "dayBookLoadInit", "success", "Day book", "dayBookLoadInit");
                            //self.commonRouter.insertActivityLogModel(activityDetails);
                            var inflowDetails = new Array();
                            var outflowDetails = new Array();
                            var DayBookDetail = new DayBookHolder();
                            DayBookDetail.setRoleId(req.session.roleId);
                            var ClosingBalance = null;
                            var officeList =  new Array();
                            if(result.officeList != null){
                                var OfficeDto = require(path.join(rootPath,"app_modules/dto/common/OfficeDto"));
                                for(var i=0; i<result.officeList.length; i++){
                                    var officeDto = new OfficeDto();
                                    officeDto.setName(result.officeList[i].name);
                                    officeDto.setId(result.officeList[i].id);
                                    officeList[i] = officeDto;
                                    customlog.info("office=="+result.officeList[i].id);
                                }
                            }
                            if(result.error != null){
                                req.session.afterVerify = 1;
                                req.session.dayBookErrors = result.error;
                                customlog.error("Errors Length="+result.error.length)
                                //for(var i=0; i<result.error.length;i++){
                                customlog.error(result.error);
                                //}
                            }
                            else if(result.inflowDetails != null && result.outflowDetails != null){

                                var InflowOutflowDto = require(path.join(rootPath,"app_modules/dto/accounting/InflowOutflowDto"));
                                customlog.info(result.inflowDetails.length);
                                customlog.info(result.outflowDetails.length);
                                for(var i =0; i<result.inflowDetails.length; i++){
                                    var InflowOutflowDtoDetail = new InflowOutflowDto();
                                    InflowOutflowDtoDetail.setOfficeName(result.inflowDetails[i].officeName);
                                    InflowOutflowDtoDetail.setDescription(result.inflowDetails[i].description);
                                    InflowOutflowDtoDetail.setTransactionType(result.inflowDetails[i].transactionType);
                                    InflowOutflowDtoDetail.setChequeNumber(result.inflowDetails[i].chequeNumber);
                                    InflowOutflowDtoDetail.setTransactionAmount(parseFloat(result.inflowDetails[i].transactionAmount).toFixed(2));
                                    inflowDetails.push(InflowOutflowDtoDetail);
                                }
                                for(var i =0; i<result.outflowDetails.length; i++){
                                    var InflowOutflowDtoDetail = new InflowOutflowDto();
                                    InflowOutflowDtoDetail.setOfficeName(result.outflowDetails[i].officeName);
                                    InflowOutflowDtoDetail.setDescription(result.outflowDetails[i].description);
                                    InflowOutflowDtoDetail.setTransactionType(result.outflowDetails[i].transactionType);
                                    InflowOutflowDtoDetail.setChequeNumber(result.outflowDetails[i].chequeNumber);
                                    InflowOutflowDtoDetail.setTransactionAmount(parseFloat(result.outflowDetails[i].transactionAmount).toFixed(2));
                                    outflowDetails.push(InflowOutflowDtoDetail);
                                }

                                DayBookDetail.setTransactionDateStr(dateUtils.convertToMifosDateFormat(result.dayBookHolder.transactionDateStr));
                                DayBookDetail.setOfficeId(result.dayBookHolder.officeId);
                                DayBookDetail.setRoleId(result.dayBookHolder.roleId);
                                DayBookDetail.setCurrentDateStr(result.dayBookHolder.currentDateStr);
                                DayBookDetail.setDisplayDate(result.dayBookHolder.displayDate);
                                DayBookDetail.setLastClosingDateStr(dateUtils.convertToMifosDateFormat(result.dayBookHolder.lastClosingDateStr));
                                ClosingBalance = parseFloat(result.closingBal.closingBalance).toFixed(2);
                            }
                            var errorMsg = new Array();
                            if(req.session.afterVerify != 1){
                                req.session.dayBookErrors = "";
                                req.session.VerifiedDayMsg = "";

                            }
                            req.session.afterVerify = 0;
                            customlog.info("After verify ==="+req.session.afterVerify);
                            res.render("accounting/DayBook",{VerifiedDayMsg:req.session.VerifiedDayMsg,dayBookErrors:req.session.dayBookErrors,DayBookDetail:DayBookDetail,ClosingBalance:ClosingBalance,inflowDetails:inflowDetails,outflowDetails:outflowDetails,officeList:officeList,constantsObj : constantsObj, contextPath:props.contextPath});
                        }
                        else {
                            self.commonRouter.showErrorPage(req,res);
                        }
                    }
                });
            }
        }catch(e){
            customlog.error("Exception while dayBookLoadInit "+e);
            self.commonRouter.showErrorPage(req,res);
        }
    },
    verifyDayBook : function(req,res){
        try{
            var self = this;
            var roleId = req.session.roleId;
            
            var DayBookDetail = new DayBookHolder();
            DayBookDetail.setCurrentDateStr(req.body.currentDateStr);
            DayBookDetail.setDisplayDate(req.body.displayDate);
            DayBookDetail.setOfficeId(req.session.officeId);
            DayBookDetail.setRoleId(roleId);
            var dateofTransaction = req.body.dateofTransaction;
            if(typeof dateofTransaction == 'undefined'){

            }
            else{
                DayBookDetail.setTransactionDateStr(dateUtils.convertToMifosDateFormat(dateofTransaction));
            }
            if(typeof dateofTransaction == 'undefined'){

            }
            else{
                DayBookDetail.setLastClosingDateStr(dateUtils.convertToMifosDateFormat(req.body.lastClosingDateStr));
            }
            //DayBookDetail.setTransactionDateStr("2013-08-20");
            var DayBookDetail = JSON.stringify(DayBookDetail);
            var servicePath;
            if(roleId == 9){
                servicePath = '/mfi/api/account/accounting/dayBook/aeVerified.json'
            }
            else {
                servicePath = '/mfi/api/account/accounting/dayBook/bmVerified.json'
            }
            customlog.info("DayBookDetail" + DayBookDetail);
            var rest = require("./rest.js");
            var http = require('http');
            var https = require('https');
            customlog.info("Cookie:"+req.session.mifosCookie);
            var cookie = req.session.mifosCookie;
            if(typeof cookie == 'undefined') {
                res.redirect(props.contextPath+'/client/ci/login');
            }
            else {
                var postheaders = {
                    'Content-Type' : 'application/json',
                    'Content-Length' : Buffer.byteLength(DayBookDetail, 'utf8'),
                    'Cookie' : req.session.mifosCookie
                };
                var options = {
                    host: mifosServiceIP,
                    port: mifosPort,
                    path: servicePath,
                    method: 'POST',
                    headers : postheaders
                };

                rest.postJSON(options,DayBookDetail,function(statuscode,result,headers){
                    customlog.info("statuscode" + statuscode);
                    customlog.info("HEADERS:  "+headers)
                    customlog.info("RESULT"+result.status);
                    if(statuscode == 302){
                        res.redirect(props.contextPath+'/client/ci/logout');
                    }
                    else{
                        if(result.status == 'success'){
                            //var activityDetails = new Array(iklantPort, req.session.tenantId, req.session.userId, req.session.userName, req.originalUrl, req.connection.remoteAddress, "router.js", "verifyDayBook", "success", "verifyDayBook", "verifyDayBook");
                            //self.commonRouter.insertActivityLogModel(activityDetails);
                            var dayBookErrors = new Array();
                            var VerifiedDayMsg;
                            if(result.errors == null){
                                VerifiedDayMsg = "Day Book has closed for the day ";
                            }
                            customlog.error("Errors = "+result.errors);
                            if(result.errors != null){
                                req.session.dayBookErrors = "";
                                for(var i=0; i<result.errors.length;i++){
                                    dayBookErrors.push(result.errors[i]);
                                }
                                //dayBookErrors.push("New Error Message");
                            }
                            req.session.dayBookErrors = dayBookErrors;
                            req.session.VerifiedDayMsg = VerifiedDayMsg;
                            req.session.afterVerify = 1;
                            res.redirect(props.contextPath+'/client/ci/daybook/dayBookLoadInit');
                        }
                        else {
                            self.commonRouter.showErrorPage(req,res);
                        }
                    }
                });
            }
        }catch(e){
            customlog.error("Exception while verifyDayBook "+e);
            self.commonRouter.showErrorPage(req,res);
        }
    },
    rejectDayBook : function(req,res){
        try{
            var self = this;
            var roleId = req.session.roleId;
            
            var DayBookDetail = new DayBookHolder();
            DayBookDetail.setOfficeId(req.session.officeId);
            DayBookDetail.setRoleId(roleId);
            var dateofTransaction = req.body.dateofTransaction;
            if(typeof dateofTransaction == 'undefined'){

            }
            else{
                DayBookDetail.setTransactionDateStr(dateUtils.convertToMifosDateFormat(dateofTransaction));
            }
            //DayBookDetail.setTransactionDateStr("2013-08-20");
            var DayBookDetail = JSON.stringify(DayBookDetail);
            customlog.info("DayBookDetail" + DayBookDetail);
            var rest = require("./rest.js");
            var http = require('http');
            var https = require('https');
            customlog.info("Cookie:"+req.session.mifosCookie);
            var cookie = req.session.mifosCookie;
            if(typeof cookie == 'undefined') {
                res.redirect(props.contextPath+'/client/ci/login');
            }
            else {
                var postheaders = {
                    'Content-Type' : 'application/json',
                    'Content-Length' : Buffer.byteLength(DayBookDetail, 'utf8'),
                    'Cookie' : req.session.mifosCookie
                };
                var options = {
                    host: mifosServiceIP,
                    port: mifosPort,
                    path: '/mfi/api/account/accounting/dayBook/rejectAEVerification.json',
                    method: 'POST',
                    headers : postheaders
                };
                rest.postJSON(options,DayBookDetail,function(statuscode,result,headers){
                    customlog.info("statuscode" + statuscode);
                    customlog.info("HEADERS:  "+headers)
                    customlog.info("RESULT"+result.status);
                    if(statuscode == 302){
                        res.redirect(props.contextPath+'/client/ci/logout');
                    }
                    else{
                        if(result.status == 'success'){
                            //var activityDetails = new Array(iklantPort, req.session.tenantId, req.session.userId, req.session.userName, req.originalUrl, req.connection.remoteAddress, "router.js", "rejectDayBook", "success", "rejectDayBook", "rejectDayBook");
                            //self.commonRouter.insertActivityLogModel(activityDetails);
                            var dayBookErrors = new Array();
                            var VerifiedDayMsg = "Day Book has rejected for the day ";
                            customlog.error("Errors = "+result.errors);
                            req.session.VerifiedDayMsg = VerifiedDayMsg;
                            req.session.afterVerify = 1;
                            res.redirect(props.contextPath+'/client/ci/daybook/dayBookLoadInit');
                        }
                        else {
                            self.commonRouter.showErrorPage(req,res);
                        }
                    }
                });
            }
        }catch(e){
            customlog.error("Exception while rejectDayBook "+e);
            self.commonRouter.showErrorPage(req,res);
        }
    },
    doFreezeDay : function(req,res){
        try{
            var self = this;
            
            var DayBookDetail = new DayBookHolder();
            DayBookDetail.setOfficeId(req.session.officeId);
            var dateofTransaction = req.body.dateofTransaction;
            if(typeof dateofTransaction == 'undefined'){

            }
            else{
                //DayBookDetail.setTransactionDateStr(convertToMifosDate(dateofTransaction));
                DayBookDetail.setTransactionDateStr(dateofTransaction);
            }
            //DayBookDetail.setTransactionDateStr("2013-08-20");
            var DayBookDetail = JSON.stringify(DayBookDetail);
            customlog.info("DayBookDetail" + DayBookDetail);
            var rest = require("./rest.js");
            var http = require('http');
            var https = require('https');
            customlog.info("Cookie:"+req.session.mifosCookie);
            var cookie = req.session.mifosCookie;
            if(typeof cookie == 'undefined') {
                res.redirect(props.contextPath+'/client/ci/login');
            }
            else {
                var postheaders = {
                    'Content-Type' : 'application/json',
                    'Content-Length' : Buffer.byteLength(DayBookDetail, 'utf8'),
                    'Cookie' : req.session.mifosCookie
                };
                var options = {
                    host: mifosServiceIP,
                    port: mifosPort,
                    path: '/mfi/api/account/accounting/dayBook/freezeDay.json',
                    method: 'POST',
                    headers : postheaders
                };
                rest.postJSON(options,DayBookDetail,function(statuscode,result,headers){
                    customlog.info("statuscode" + statuscode);
                    customlog.info("HEADERS:  "+headers)
                    customlog.info("RESULT"+result.status);
                    if(statuscode == 302){
                        res.redirect(props.contextPath+'/client/ci/logout');
                    }
                    else{
                        if(result.status == 'success'){
                            //var activityDetails = new Array(iklantPort, req.session.tenantId, req.session.userId, req.session.userName, req.originalUrl, req.connection.remoteAddress, "router.js", "doFreezeDay", "success", "doFreezeDay", "doFreezeDay");
                            //self.commonRouter.insertActivityLogModel(activityDetails);
                            var freezedStatusMsg = result.error;
                            customlog.error("Errors = "+result.error);
                            req.body.status = "success";
                            req.body.freezedStatusMsg = freezedStatusMsg;
                            res.send(req.body);
                        }
                        else {
                            req.body.status = "failure";
                            res.send(req.body);
                            //self.commonRouter.showErrorPage(req,res);
                        }
                    }
                });
            }
        }catch(e){
            customlog.error("Exception while doFreezeDay "+e);
            self.commonRouter.showErrorPage(req,res);
        }
    },
    doUnfreezeDay : function(req,res){
        try{
            var self = this;
            
            var DayBookDetail = new DayBookHolder();
            DayBookDetail.setOfficeId(req.session.officeId);
            var dateofTransaction = req.body.dateofTransaction;
            if(typeof dateofTransaction == 'undefined'){

            }
            else{
                DayBookDetail.setTransactionDateStr(dateUtils.convertToMifosDateFormat(dateofTransaction));
            }
            var DayBookDetail = JSON.stringify(DayBookDetail);
            customlog.info("DayBookDetail" + DayBookDetail);
            var rest = require("./rest.js");
            var http = require('http');
            var https = require('https');
            customlog.info("Cookie:"+req.session.mifosCookie);
            var cookie = req.session.mifosCookie;
            if(typeof cookie == 'undefined') {
                res.redirect(props.contextPath+'/client/ci/login');
            }
            else {
                var postheaders = {
                    'Content-Type' : 'application/json',
                    'Content-Length' : Buffer.byteLength(DayBookDetail, 'utf8'),
                    'Cookie' : req.session.mifosCookie
                };
                var options = {
                    host: mifosServiceIP,
                    port: mifosPort,
                    path: '/mfi/api/account/accounting/dayBook/unfreezeDay.json',
                    method: 'POST',
                    headers : postheaders
                };
                rest.postJSON(options,DayBookDetail,function(statuscode,result,headers){
                    customlog.info("statuscode" + statuscode);
                    customlog.info("HEADERS:  "+headers)
                    customlog.info("RESULT"+result.status);
                    if(statuscode == 302){
                        res.redirect(props.contextPath+'/client/ci/logout');
                    }
                    else{
                        if(result.status == 'success'){
                            //var activityDetails = new Array(iklantPort, req.session.tenantId, req.session.userId, req.session.userName, req.originalUrl, req.connection.remoteAddress, "router.js", "doUnfreezeDay", "success", "doUnfreezeDay", "doUnfreezeDay");
                            //self.commonRouter.insertActivityLogModel(activityDetails);
                            var freezedStatusMsg = result.error;
                            customlog.error("Errors = "+result.error);
                            req.body.status = "success";
                            req.body.freezedStatusMsg = freezedStatusMsg;
                            res.send(req.body);
                            //req.session.freezedStatusMsg = freezedStatusMsg;
                            //req.session.afterFreez = 1;
                            //res.redirect(props.contextPath+'/client/ci/daybook/showFreezUnfreezeDay');
                        }
                        else {
                            req.body.status = "failure";
                            res.send(req.body);
                            //self.commonRouter.showErrorPage(req,res);
                        }
                    }
                });
            }
        }catch(e){
            customlog.error("Exception while doUnfreezeDay "+e);
            self.commonRouter.showErrorPage(req,res);
        }
    },
    showFreezUnfreezeDay : function(req,res){
        try{
            var self = this;
            var constantsObj = this.constants;
            
            if(typeof (req.session.tenantId) == 'undefined' || typeof (req.session.userId) == 'undefined') {
                res.redirect(props.contextPath+'/client/ci/login');
            }else{
                //var activityDetails = new Array(iklantPort, req.session.tenantId, req.session.userId, req.session.userName, req.originalUrl, req.connection.remoteAddress, "router.js", "showFreezUnfreezeDay", "success", "Freeze Unfreez Days", "showFreezUnfreezeDay");
                //self.commonRouter.insertActivityLogModel(activityDetails);
                var DayBookDetailObj = new DayBookHolder();
                DayBookDetailObj.setRoleId(req.session.roleId);
                if(req.session.afterFreez == 1){
                    req.session.afterFreez = 0 ;
                    res.render('accounting/freezUnfreezDay',{freezedStatusMsg:req.session.freezedStatusMsg,constantsObj : constantsObj, DayBookDetail : DayBookDetailObj, contextPath:props.contextPath});
                }else {
                    res.render('accounting/freezUnfreezDay',{freezedStatusMsg:"",constantsObj : constantsObj, DayBookDetail : DayBookDetailObj, contextPath:props.contextPath});
                }
            }
        }catch(e){
            customlog.error("Exception while showFreezUnfreezeDay "+e);
            self.commonRouter.showErrorPage(req,res);
        }
    },
    showUnfreezeDaysList : function(req,res){
        try{
            var self = this;
            var constantsObj = this.constants;
            var DayBookDetailObj = new DayBookHolder();
            DayBookDetailObj.setOfficeId(req.session.officeId);
            var DayBookDetail = JSON.stringify(DayBookDetailObj);
            customlog.info("DayBookDetail" + DayBookDetail);
            var rest = require("./rest.js");
            var http = require('http');
            var https = require('https');
            customlog.info("Cookie:"+req.session.mifosCookie);
            var cookie = req.session.mifosCookie;
            if(typeof cookie == 'undefined' || typeof (req.session.tenantId) == 'undefined') {
                res.redirect(props.contextPath+'/client/ci/login');
            }
            else {
                var servicePath;
                if(req.session.roleId == constantsObj.getBMroleId()){
                    servicePath = "/mfi/api/account/accounting/dayBook/getUnfreezedDaysListForBM.json";
                }else if(req.session.roleId == constantsObj.getAccountsExecutiveRoleId()){
                    servicePath = "/mfi/api/account/accounting/dayBook/getUnfreezedDaysListForAE.json";
                }
                var postheaders = {
                    'Content-Type' : 'application/json',
                    'Content-Length' : Buffer.byteLength(DayBookDetail, 'utf8'),
                    'Cookie' : req.session.mifosCookie
                };
                var options = {
                    host: mifosServiceIP,
                    port: mifosPort,
                    path: servicePath,
                    method: 'POST',
                    headers : postheaders
                };
                rest.postJSON(options,DayBookDetail,function(statuscode,result,headers){
                    customlog.info("statuscode" + statuscode);
                    customlog.info("HEADERS:  "+headers)
                    customlog.info("RESULT"+result.status);
                    if(statuscode == 302){
                        res.redirect(props.contextPath+'/client/ci/logout');
                    }
                    else{
                        if(result.status == 'success'){
                            //var activityDetails = new Array(iklantPort, req.session.tenantId, req.session.userId, req.session.userName, req.originalUrl, req.connection.remoteAddress, "router.js", "showUnfreezeDaysList", "success", "unfreez days", "showUnfreezeDaysList");
                            //self.commonRouter.insertActivityLogModel(activityDetails);
                            var closingDate = new Array();
                            var status = new Array();
                            if(result.unfreezedList != null){
                                for(var i=0;i<result.unfreezedList.length;i++){
                                    closingDate[i] = result.unfreezedList[i].closingDate;
                                    if(result.unfreezedList[i].status == 0){
                                        status[i] = "AE Not Yet Verified";
                                    }else{
                                        status[i] = "AE Verified";
                                    }
                                }
                            }
                            customlog.info("closingDate"+closingDate);
                            DayBookDetailObj.setRoleId(req.session.roleId);
                            res.render('accounting/unFreezedDays',{constantsObj : constantsObj, closingDate : closingDate,status : status, DayBookDetail : DayBookDetailObj, contextPath:props.contextPath});
                        } else {
                            self.commonRouter.showErrorPage(req,res);
                        }
                    }
                });
            }
        }catch(e){
            customlog.error("Exception while showUnfreezeDaysList "+e);
            self.commonRouter.showErrorPage(req,res);
        }
    },
    closeUnfreezedDayForAE : function(req,res){
        try{
            var self = this;
            var DayBookDetail = new DayBookHolder();
            DayBookDetail.setOfficeId(req.session.officeId);
            var dateofTransaction = req.body.dateofTransaction;
            if(typeof dateofTransaction == 'undefined'){

            }
            else{
                //DayBookDetail.setTransactionDateStr(convertToMifosDate(dateofTransaction));
                DayBookDetail.setTransactionDateStr(dateofTransaction);
            }
            var DayBookDetail = JSON.stringify(DayBookDetail);
            customlog.info("DayBookDetail" + DayBookDetail);
            var rest = require("./rest.js");
            var http = require('http');
            var https = require('https');
            customlog.info("Cookie:"+req.session.mifosCookie);
            var cookie = req.session.mifosCookie;
            if(typeof cookie == 'undefined') {
                res.redirect(props.contextPath+'/client/ci/login');
            }
            else {
                var postheaders = {
                    'Content-Type' : 'application/json',
                    'Content-Length' : Buffer.byteLength(DayBookDetail, 'utf8'),
                    'Cookie' : req.session.mifosCookie
                };
                var options = {
                    host: mifosServiceIP,
                    port: mifosPort,
                    path: '/mfi/api/account/accounting/dayBook/updateAEAsChecked.json',
                    method: 'POST',
                    headers : postheaders
                };
                rest.postJSON(options,DayBookDetail,function(statuscode,result,headers){
                    customlog.info("statuscode" + statuscode);
                    customlog.info("HEADERS:  "+headers)
                    customlog.info("RESULT"+result.status);
                    if(statuscode == 302){
                        res.redirect(props.contextPath+'/client/ci/logout');
                    }
                    else{
                        if(result.status == 'success'){
                            //var activityDetails = new Array(iklantPort, req.session.tenantId, req.session.userId, req.session.userName, req.originalUrl, req.connection.remoteAddress, "router.js", "closeUnfreezedDayForAE", "success", "closeUnfreezedDayForAE", "closeUnfreezedDayForAE");
                            //self.commonRouter.insertActivityLogModel(activityDetails);
                            customlog.error("Errors = "+result.error);
                            req.body.status = "success";
                            res.send(req.body);
                        }
                        else {
                            req.body.status = "failure";
                            res.send(req.body);
                            //self.commonRouter.showErrorPage(req,res);
                        }
                    }
                });
            }
        }catch(e){
            customlog.error("Exception while closeUnfreezedDayForAE "+e);
            self.commonRouter.showErrorPage(req,res);
        }
    },
    retrieveInflowOutflow : function(req,res){
        try{
            var self = this;
            var constantsObj = this.constants;
            var DayBookDetail = new DayBookHolder();
            //DayBookDetail.setCurrentDateStr(req.body.currentDateStr);
            //DayBookDetail.setDisplayDate(req.body.displayDate);
            if(req.session.officeId == 1){
                DayBookDetail.setOfficeId(req.body.office);
            }
            else {
                DayBookDetail.setOfficeId(req.session.officeId);
            }
            DayBookDetail.setRoleId(req.session.roleId);
            var dateofTransaction = req.body.dateofTransaction;
            if(typeof dateofTransaction == 'undefined'){

            }
            else{
                //DayBookDetail.setTransactionDateStr(convertToMifosDate(dateofTransaction));
                DayBookDetail.setTransactionDateStr(dateofTransaction);
            }
            /*if(typeof dateofTransaction == 'undefined'){

             }
             else{
             DayBookDetail.setLastClosingDateStr(convertToMifosDate(req.body.lastClosingDateStr));
             }*/
            //DayBookDetail.setTransactionDateStr("2013-08-20");
            var DayBookDetail = JSON.stringify(DayBookDetail);
            customlog.info("DayBookDetail" + DayBookDetail);
            var rest = require("./rest.js");
            var http = require('http');
            var https = require('https');
            customlog.info("Cookie:"+req.session.mifosCookie);
            var cookie = req.session.mifosCookie;
            if(typeof cookie == 'undefined') {
                res.redirect(props.contextPath+'/client/ci/login');
            }
            else {
                var postheaders = {
                    'Content-Type' : 'application/json',
                    'Content-Length' : Buffer.byteLength(DayBookDetail, 'utf8'),
                    'Cookie' : req.session.mifosCookie
                };
                var options = {
                    host: mifosServiceIP,
                    port: mifosPort,
                    path: '/mfi/api/account/accounting/dayBook/load.json',
                    method: 'POST',
                    headers : postheaders
                };

                rest.postJSON(options,DayBookDetail,function(statuscode,result,headers){
                    customlog.info("statuscode" + statuscode);
                    customlog.info("HEADERS:  "+headers)
                    customlog.info("RESULT"+result.status);
                    if(statuscode == 302){
                        res.redirect(props.contextPath+'/client/ci/logout');
                    }
                    else{
                        if(result.status == 'success'){
                            //var activityDetails = new Array(iklantPort, req.session.tenantId, req.session.userId, req.session.userName, req.originalUrl, req.connection.remoteAddress, "router.js", "retrieveInflowOutflow", "success", "retrieveInflowOutflow", "retrieveInflowOutflow");
                            //self.commonRouter.insertActivityLogModel(activityDetails);
                            customlog.info("Inside Success");
                            var inflowDetails = new Array();
                            var outflowDetails = new Array();
                            var DayBookDetail = new DayBookHolder();
                            var ClosingBalance = null;
                            //var officeList =  new Array();
                            /*if(result.officeList != null){
                             var OfficeDto = require(domainPath +"/OfficeDto");
                             for(var i=0; i<result.officeList.length; i++){
                             var officeDto = new OfficeDto();
                             this.officeDto = officeDto;
                             var officeDto = this.officeDto;
                             officeDto.setName(result.officeList[i].name);
                             officeDto.setId(result.officeList[i].id);
                             officeList[i] = officeDto;
                             customlog.info("office=="+result.officeList[i].id);
                             }
                             }*/
                            if(result.error != null){
                                req.body.dayBookErrors = result.error;
                                customlog.error("Errors Length="+result.error.length)
                                customlog.error(result.error);
                                req.body.status = "failure";
                                res.send(req.body);
                            }
                            else if(result.inflowDetails != null && result.outflowDetails != null){
                                var InflowOutflowDto = require(path.join(rootPath,"app_modules/dto/accounting/InflowOutflowDto"));
                                customlog.info(result.inflowDetails.length);
                                customlog.info(result.outflowDetails.length);
                                for(var i =0; i<result.inflowDetails.length; i++){
                                    var InflowOutflowDtoDetail = new InflowOutflowDto();
                                    InflowOutflowDtoDetail.setOfficeName(result.inflowDetails[i].officeName);
                                    InflowOutflowDtoDetail.setDescription(result.inflowDetails[i].description);
                                    InflowOutflowDtoDetail.setTransactionType(result.inflowDetails[i].transactionType);
                                    InflowOutflowDtoDetail.setChequeNumber(result.inflowDetails[i].chequeNumber);
                                    InflowOutflowDtoDetail.setTransactionAmount(parseFloat(result.inflowDetails[i].transactionAmount).toFixed(2));
                                    inflowDetails.push(InflowOutflowDtoDetail);
                                }
                                for(var i =0; i<result.outflowDetails.length; i++){
                                    var InflowOutflowDtoDetail = new InflowOutflowDto();
                                    InflowOutflowDtoDetail.setOfficeName(result.outflowDetails[i].officeName);
                                    InflowOutflowDtoDetail.setDescription(result.outflowDetails[i].description);
                                    InflowOutflowDtoDetail.setTransactionType(result.outflowDetails[i].transactionType);
                                    InflowOutflowDtoDetail.setChequeNumber(result.outflowDetails[i].chequeNumber);
                                    InflowOutflowDtoDetail.setTransactionAmount(parseFloat(result.outflowDetails[i].transactionAmount).toFixed(2));
                                    outflowDetails.push(InflowOutflowDtoDetail);
                                }

                                //DayBookDetail.setTransactionDateStr(convertYYYYMMDDToDDMMYYYYFormat(result.dayBookHolder.transactionDateStr));
                                //DayBookDetail.setOfficeId(result.dayBookHolder.officeId);
                                //DayBookDetail.setRoleId(result.dayBookHolder.roleId);
                                //DayBookDetail.setCurrentDateStr(result.dayBookHolder.currentDateStr);
                                //DayBookDetail.setDisplayDate(result.dayBookHolder.displayDate);
                                //DayBookDetail.setLastClosingDateStr(convertYYYYMMDDToDDMMYYYYFormat(result.dayBookHolder.lastClosingDateStr));
                                ClosingBalance = parseFloat(result.closingBal.closingBalance).toFixed(2);
                                req.body.inflowDetails = inflowDetails;
                                req.body.outflowDetails = outflowDetails;
                                req.body.ClosingBalance = ClosingBalance;
                                req.body.status = "success";
                                res.send(req.body);
                            }
                            //res.render("DayBook",{VerifiedDayMsg:req.session.VerifiedDayMsg,dayBookErrors:req.session.dayBookErrors,DayBookDetail:DayBookDetail,ClosingBalance:ClosingBalance,inflowDetails:inflowDetails,outflowDetails:outflowDetails,officeList:officeList,constantsObj : constantsObj, contextPath:props.contextPath});
                        }
                        else if(result.status == "failure"){
                            req.body.status = "failure";
                            res.send(req.body);
                        }
                        else {
                            req.body.status = "runtimeError";
                            res.send(req.body);
                        }
                    }
                });
            }
        }catch(e){
            customlog.error("Exception while retrieveInflowOutflow "+e);
            self.commonRouter.showErrorPage(req,res);
        }
    },
	loadFund : function(req,res){
        var self = this;
        var rest = require("./rest.js");
        var http = require('http');
        var https = require('https');
        customlog.info(req.session.mifosCookie);
        var postheaders = {
            'Content-Type' : 'application/json',
            'Cookie' : req.session.mifosCookie
        };
        var options = {
            host: mifosServiceIP,
            port: mifosPort,
            path: "/mfi/api/accounting/fund/load.json",
            method: 'GET',
            headers : postheaders
        };
        rest.getJSON(options,function(statuscode,result,headers){
            customlog.info("statuscode:"+statuscode);
            customlog.info("result:" + result.status);
            if(statuscode == 302){
                res.redirect(props.contextPath+'/client/ci/logout');
            }else if(result.status == "success"){
                var fundListArray = new Array();
                var officeListArray = new Array();
                var fundManagement = require(commonDTO +"/fundManagement");
                for(var i=0;i<result.availableFunds.length;i++){
                    var fundManagementObj = new fundManagement();
                    fundManagementObj.setFundId(result.availableFunds[i].fundId);
                    fundManagementObj.setFundName(result.availableFunds[i].fundName);
                    fundListArray[i] = fundManagementObj;
                }
                for(var j=0;j<result.officeList.length;j++){
                    var fundManagementObj = new fundManagement();
                    fundManagementObj.setOfficeId(result.officeList[j].id);
                    fundManagementObj.setOfficeName(result.officeList[j].name);
                    officeListArray[j] = fundManagementObj;
                }
                console.log( fundListArray);
                console.log( officeListArray);
                res.render('accounting/FundManagement', { selectedFundId :0,fundListArray : fundListArray,ledgerClosingBalance : false, bookDebtOutstanding : false,officeListArray :officeListArray,
                                                         statusMessage : '',contextPath :props.contextPath });
            } else{
                self.showErrorPage(req,res);
            }
        });
    },
    loadSelectedFundDetails : function(req,res){
        res.setTimeout(0);
        var self = this;
        var rest = require("./rest.js");
        var http = require('http');
        var https = require('https');
        customlog.info(req.session.mifosCookie);
        var selectedFundId = req.params.fundId;
        customlog.info("Selected Fund ID : " + selectedFundId);
        var postheaders = {
            'Content-Type' : 'application/json',
            'Cookie' : req.session.mifosCookie
        };
        var options = {
            host: mifosServiceIP,
            port: mifosPort,
            path: "/mfi/api/accounting/fund/load/-"+req.params.fundId+".json",
            method: 'GET',
            headers : postheaders
        };
        customlog.info(options.path);
        rest.getJSON(options,function(statuscode,result,headers){
            if(statuscode == 302){
                res.redirect(props.contextPath+'/client/ci/logout');
            }else if(result.status == "success"){
                var fundListArray = new Array();
                var officeListArray = new Array();
                var fundManagement = require(commonDTO +"/fundManagement");
                for(var i=0;i<result.availableFunds.length;i++){
                    var fundManagementObj = new fundManagement();
                    fundManagementObj.setFundId(result.availableFunds[i].fundId);
                    fundManagementObj.setFundName(result.availableFunds[i].fundName);
                    fundListArray[i] = fundManagementObj;
                }
                for(var j=0;j<result.officeList.length;j++){
                    var fundManagementObj = new fundManagement();
                    fundManagementObj.setOfficeId(result.officeList[j].id);
                    fundManagementObj.setOfficeName(result.officeList[j].name);
                    officeListArray[j] = fundManagementObj;
                }
                console.log( fundListArray);
                console.log( officeListArray);
                customlog.info("ledgerClosingBalance : " + result.ledgerClosingBalance);
                customlog.info("bookDebtOutstanding  : " + result.bookDebtOutstanding);
                res.render('accounting/FundManagement', { selectedFundId : selectedFundId, fundListArray : fundListArray,ledgerClosingBalance : result.ledgerClosingBalance == null ? 0 : intToFormat(Number(result.ledgerClosingBalance).toFixed(2)),
                                                            bookDebtOutstanding : result.bookDebtOutstanding == null ? 0 : intToFormat(Number(result.bookDebtOutstanding).toFixed(2)),
                                                            officeListArray :officeListArray,statusMessage : '' ,contextPath :props.contextPath });
            } else{
                self.showErrorPage(req,res);
            }
        });

    } ,
    unallocatedGroupsLoanAmountForBranch : function(req,res){
        var self = this;
        var FundManagementHolder = {};
        FundManagementHolder.officeId = req.body.officeId;
        FundManagementHolder.date = req.body.disbursementDate;
        var jsonArray = JSON.stringify(FundManagementHolder);
        customlog.info("jsonArray" + jsonArray);
        var rest = require("./rest.js");
        var http = require('http');
        var https = require('https');
        var postheaders = {
            'Content-Type' : 'application/json',
            'Content-Length' : Buffer.byteLength(jsonArray, 'utf8'),
            'Cookie' : req.session.mifosCookie
        };
        var options = {
            host: mifosServiceIP,
            port: mifosPort,
            path: "/mfi/api/fund/unallocatedGroupsLoanAmount/load.json",
            method: 'POST',
            headers : postheaders
        };
        rest.postJSON(options,jsonArray,function(statuscode,result,headers){
            console.log(result);
            if(statuscode == 302){
                res.redirect(props.contextPath+'/client/ci/logout');
            }else if(result.status == "success"){
                customlog.info("result.fundUnallocatedAmount : " + result.fundUnallocatedAmount);
                 req.body.unallocatedAmount =  result.fundUnallocatedAmount == null ? 0 : Number(result.fundUnallocatedAmount).toFixed(2);
                 var unallocatedGroupsList = new Array();
                 for(var i=0;i<result.fundUnallocatedGroupsList.length;i++){
                     var unallocatedGroupDetail = {};
                     unallocatedGroupDetail.groupName = result.fundUnallocatedGroupsList[i].groupName;
                     unallocatedGroupDetail.accountId = result.fundUnallocatedGroupsList[i].accountId;
                     unallocatedGroupDetail.loanCustomDetailId = result.fundUnallocatedGroupsList[i].loanCustomDetailId;
                     unallocatedGroupDetail.loanAmount = result.fundUnallocatedGroupsList[i].loanAmount;
                     unallocatedGroupsList[i] = unallocatedGroupDetail;
                 }
                 req.body.unallocatedGroupsList = unallocatedGroupsList;
                 req.body.status =  "success";
                res.send(req.body);
            }else if(result.status == "failure"){
                if(result.hasOwnProperty('errors')){
                    req.body.journal = "failure";
                    req.body.error = result.errors[0];
                }else{
                    customlog.error("Inside ELSE ERROR");
                    req.body.journal = "runtime";
                }
            }else{
                self.showErrorPage(req,res);
            }
        });
    },
    allocateFundsToGroups : function(req,res){
        res.setTimeout(0);
        var self = this;
        var FundManagementHolder = {};
        FundManagementHolder.officeId = req.body.officeId;
        FundManagementHolder.date = req.body.dateName;
        FundManagementHolder.fundId = req.body.fundName;
        FundManagementHolder.allocatedAmount = req.body.amount;
        FundManagementHolder.unAllocatedAmount = req.body.unallocatedAmtName;
        FundManagementHolder.allocatedLoanAccountId = req.body.selectedAccountsIdArray.split(',');
        var jsonArray = JSON.stringify(FundManagementHolder);
        console.log( jsonArray);
        var rest = require("./rest.js");
        var http = require('http');
        var https = require('https');
        var postheaders = {
            'Content-Type' : 'application/json',
            'Content-Length' : Buffer.byteLength(jsonArray, 'utf8'),
            'Cookie' : req.session.mifosCookie
        };
        var options = {
            host: mifosServiceIP,
            port: mifosPort,
            path: "/mfi/api/fund/allocateFundsToGroups.json",
            method: 'POST',
            headers : postheaders
        };
        rest.postJSON(options,jsonArray,function(statuscode,result,headers){
            if(statuscode == 302){
                res.redirect(props.contextPath+'/client/ci/logout');
            }else if(result.status == "success"){

                var fundListArray = new Array();
                var officeListArray = new Array();
                var fundManagement = require(commonDTO +"/fundManagement");
                for(var i=0;i<result.availableFunds.length;i++){
                    var fundManagementObj = new fundManagement();
                    fundManagementObj.setFundId(result.availableFunds[i].fundId);
                    fundManagementObj.setFundName(result.availableFunds[i].fundName);
                    fundListArray[i] = fundManagementObj;
                }
                for(var j=0;j<result.officeList.length;j++){
                    var fundManagementObj = new fundManagement();
                    fundManagementObj.setOfficeId(result.officeList[j].id);
                    fundManagementObj.setOfficeName(result.officeList[j].name);
                    officeListArray[j] = fundManagementObj;
                }
                console.log( fundListArray);
                console.log( officeListArray);
                res.render('accounting/FundManagement', { selectedFundId :0,fundListArray : fundListArray,ledgerClosingBalance : false, bookDebtOutstanding : false,officeListArray :officeListArray,
                    statusMessage : "Fund Allocated for Rs."+ result.fundAllocatedAmount,  contextPath :props.contextPath });
            }else{

            }
        });
    },

    ledgerViewLoad : function(req,res) {
        if(typeof (req.session.tenantId) == 'undefined' || typeof (req.session.userId) == 'undefined') {
            res.redirect(props.contextPath+'/client/ci/login');
        }
        else{
            try{
                var self = this;
                var constantsObj = this.constants;
                self.commonRouter.retriveOfficeCall(req.session.tenantId,req.session.userId,function(officeIdArray,officeNameArray,officeAddressArray,officeShortNameArray)
                {
                    self.model.getActiveFinYearModel(function(finResult){
                        var minFinancialYear = ((finResult[0].minDate).toString()).split("-");
                        var maxFinancialYear = ((finResult[0].maxDate).toString()).split("-");
                        var fromDate = minFinancialYear[2]+"-"+minFinancialYear[1]+"-"+minFinancialYear[0];
                        var toDate = maxFinancialYear[2]+"-"+maxFinancialYear[1]+"-"+maxFinancialYear[0];
                        res.render("accounting/ledgerView",{officeIdArray:officeIdArray,officeNameArray:officeNameArray,minFinYear:fromDate,maxFinYear:toDate,errorMessage:"",trailBalanceResult:"",
                            roleId:req.session.roleId,constantsObj:constantsObj, contextPath:props.contextPath,fromDateLedgerValue:"",toDateLedgerValue:""});
                    });
                });
            }catch(e){
                customlog.error("Exception while Ledger View "+e);
                self.commonRouter.showErrorPage(req,res);
            }
        }
    } ,

    viewTrailBalanceLedger : function(req,res) {
        if(typeof (req.session.tenantId) == 'undefined' || typeof (req.session.userId) == 'undefined') {
            res.redirect(props.contextPath+'/client/ci/login');
        }
        else{
            try{
                var self = this;
                var constantsObj = this.constants;
                var fromDate,toDate,accOperation,mfiOperation;
                fromDate = req.body.fromDateLedger;
                toDate = req.body.toDateLedger;
                accOperation = req.body.accOperation;
                mfiOperation = req.body.mfiOperation;
                var pageValue = req.body.pageValue;
                if(pageValue == 'backButton'){
                    res.send(req.body);
                }else{
                    self.commonRouter.retriveOfficeCall(req.session.tenantId,req.session.userId,function(officeIdArray,officeNameArray,officeAddressArray,officeShortNameArray)
                    {
                        self.model.getActiveFinYearModel(function(finResult){
                            var minFinancialYear = ((finResult[0].minDate).toString()).split("-");
                            var maxFinancialYear = ((finResult[0].maxDate).toString()).split("-");
                            var fromDateFinYear = minFinancialYear[2]+"-"+minFinancialYear[1]+"-"+minFinancialYear[0];
                            var toDateFinYear = maxFinancialYear[2]+"-"+maxFinancialYear[1]+"-"+maxFinancialYear[0];
                            self.model.getTrailBalanceResultModel(minFinancialYear[2]+maxFinancialYear[2],fromDate,toDate,mfiOperation,accOperation,function(trailBalanceResult){
                                res.render("accounting/ledgerView",{officeIdArray:officeIdArray,officeNameArray:officeNameArray,minFinYear:fromDateFinYear,maxFinYear:toDateFinYear,errorMessage:"",trailBalanceResult:trailBalanceResult[0],
                                    roleId:req.session.roleId,constantsObj:constantsObj, contextPath:props.contextPath,fromDateLedgerValue:fromDate,toDateLedgerValue:toDate,accOperation:accOperation,mfiOperation:mfiOperation});
                            })
                        });
                    });
                }
            }catch(e){
                customlog.error("Exception while Ledger View "+e);
                self.commonRouter.showErrorPage(req,res);
            }
        }
    },

    generateLedgerTransactionsByGLCode : function(req,res) {
        if(typeof (req.session.tenantId) == 'undefined' || typeof (req.session.userId) == 'undefined') {
            res.redirect(props.contextPath+'/client/ci/login');
        }
        else{
            try{
                var self = this;
                var constantsObj = this.constants;
                var fromDate = req.body.fromDateLedger;
                var toDate = req.body.toDateLedger;
                var accOperation = req.body.accOperation;
                var mfiOperation = req.body.mfiOperation;
                var glcode = req.params.glcode;
                var userId = req.session.userId;
                self.commonRouter.retriveOfficeCall(req.session.tenantId,req.session.userId,function(officeIdArray,officeNameArray,officeAddressArray,officeShortNameArray)
                {
                    self.model.getActiveFinYearModel(function(finResult){
                        var minFinancialYear = ((finResult[0].minDate).toString()).split("-");
                        var maxFinancialYear = ((finResult[0].maxDate).toString()).split("-");
                        var fromDateFinYear = minFinancialYear[2]+"-"+minFinancialYear[1]+"-"+minFinancialYear[0];
                        var toDateFinYear = maxFinancialYear[2]+"-"+maxFinancialYear[1]+"-"+maxFinancialYear[0];
                        self.model.getLedgerTransactionResultModel(minFinancialYear[2]+maxFinancialYear[2],fromDate,toDate,mfiOperation,accOperation,glcode,userId,function(generalLedgerResult){
                            var accFlag = (accOperation == "on") ? 'Yes' : 'No';
                            var mfiFlag = (mfiOperation == "on") ? 'Yes' : 'No';
                            res.render("accounting/ledgerTransactionByGL",{officeIdArray:officeIdArray,officeNameArray:officeNameArray,minFinYear:fromDateFinYear,maxFinYear:toDateFinYear,errorMessage:"",generalLedgerResult:generalLedgerResult[0],accFlag:accFlag,mfiFlag:mfiFlag,
                                roleId:req.session.roleId,constantsObj:constantsObj, contextPath:props.contextPath,fromDateLedgerValue:fromDate,toDateLedgerValue:toDate,glcode:glcode,ledgerName:req.body.ledgerName});
                        })
                    });
                });
            }catch(e){
                customlog.error("Exception while Ledger View "+e);
                self.commonRouter.showErrorPage(req,res);
            }
        }
    }
};
function intToFormat(nStr) {
    nStr += '';
    x = nStr.split('.');
    x1 = x[0];
    x2 = x.length > 1 ? '.' + x[1] : '';
    var rgx = /(\d+)(\d{3})/;
    var z = 0;
    var len = String(x1).length;
    var num = parseInt((len/2)-1);

    while (rgx.test(x1))
    {
        if(z > 0)
        {
            x1 = x1.replace(rgx, '$1' + ',' + '$2');
        }
        else
        {
            x1 = x1.replace(rgx, '$1' + ',' + '$2');
            rgx = /(\d+)(\d{2})/;
        }
        z++;
        num--;
        if(num == 0)
        {
            break;
        }
    }
    return x1 + x2;
}