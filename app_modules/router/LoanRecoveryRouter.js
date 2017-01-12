module.exports = loanRecovery;

var path = require('path');
var rootPath = path.dirname(process.mainModule.filename);
var loanRecoveryDtoPath = path.join(rootPath,"app_modules/dto/loan_recovery");
var props = require(path.join(rootPath,"properties.json"));
mifosServiceIP = props.mifosServiceIp;
mifosPort = props.mifosPort;
GPSPort = props.GPSPort;
iklantPort = props.iklantPort;
var LoanRecoveryModel = require(path.join(rootPath,"app_modules/model/LoanRecoveryModel"));
var customlog = require(path.join(rootPath,"logger/loggerConfig.js"))('LoanRecoveryRouter.js');
var SmsConstants = require(path.join(rootPath,"app_modules/dto/sms/SmsConstants"));

function loanRecovery(constants) {
    customlog.debug("Inside Router");
    this.model = new LoanRecoveryModel(constants);
    this.constants = constants;
}

loanRecovery.prototype = {
    //Added by Sathish Kumar M 008 for Loan Recovery Module
    searchpage : function(req,res){
        try{
            var self = this;
            if(typeof (req.session.tenantId) == 'undefined' || typeof (req.session.userId) == 'undefined') {
                res.redirect(props.contextPath+'/client/ci/login');
            }else{
                var searchResult = new Array();
                constantsObj  = this.constants;
                res.render('loan_recovery/serachResult.jade',{searchResult : searchResult,errorLabel : "",roleId : req.session.roleId,constantsObj : constantsObj, contextPath:props.contextPath});
            }
        }catch(e){
            customlog.error("Exception while search page "+e);
            self.commonRouter.showErrorPage(req,res);
        }
    },

    loanrecoveryLoans  :  function(req,res){
        try{
            var self = this;
            var rest = require("./rest.js");
            var http = require('http');
            var https = require('https');
            var officeId ;
            var roleId;
            var tenantId;
            var userId;
            var constantsObj = this.constants;
            if(typeof (req.session.tenantId) == 'undefined' || typeof (req.session.userId) == 'undefined') {
                res.redirect(props.contextPath+'/client/ci/login');
            }else{
                if(req.session.roleId == this.constants.getSMHroleId()){
                    if(typeof(req.query.officeNameId) == 'undefined'){
                        officeId = 1;
                    }else{
                        officeId = req.query.officeNameId;
                    }
                    if(typeof(req.query.FOId) == 'undefined'){
                        userId = -1;
                    }else if(req.query.FOId == 1){
                        userId = -1;
                    }
                    else{
                        userId = req.query.FOId;
                    }
                }
                else if(req.session.roleId == this.constants.getBMroleId()){
                    officeId 	= req.session.officeId;
                    if(typeof(req.query.FOId) == 'undefined'){
                        userId = -1;
                    }else if(req.query.FOId == 1){
                        userId = -1;
                    }
                    else{
                        userId = req.query.FOId;
                    }
                }
                else{
                    officeId 	= req.session.officeId;
                    userId = req.session.userId;
                }

                roleId 		= req.session.roleId;
                tenantId 	= req.session.tenantId;

                var postheaders = {
                    'Content-Type' : 'application/json',
                    'Cookie' : req.session.mifosCookie
                };
                var loanDetails = new Array();
                var searchResult = new Array();
                var options = {
                    host: mifosServiceIP,
                    port: mifosPort,
                    path: "/mfi/api/account/loan/personnel/due-"+userId+"-"+officeId+".json",
                    method: 'GET',
                    headers : postheaders
                };
                var CustomerDetailDto1 = require(loanRecoveryDtoPath +"/CustomerDetailDto");
                var CustomerDetailDto = new CustomerDetailDto1();
                CustomerDetailDto.setFlag(0);
                //searchResult[0] = CustomerDetailDto;
                self.commonRouter.retriveFieldOfficersCall(officeId,function(foIdArray,foNameArray){
                    self.commonRouter.retriveOfficeCall(tenantId,req.session.userId,function(officeIdArray,officeNameArray,officeAddressArray,officeShortNameArray){
                        officeIdArray[officeIdArray.length] = 1;
                        officeNameArray[officeNameArray.length] = 'All';
                        rest.getJSON(options,function(statuscode,result,headers){
                            customlog.info(statuscode);
                            if(statuscode == 302){
                                res.redirect(props.contextPath+'/client/ci/logout');
                            }
                            else if(result.status == "success") {
                                if (result.loanList.length == 0){
                                    if(req.session.browser == "mobile") {
                                        res.render('Mobile/loanrecoveryLoans',{loanDetails : loanDetails,searchResult : searchResult, errorLabel : "No groups found",officeIdArray :officeIdArray, officeNameArray : officeNameArray,roleId : roleId,officeId : officeId,foIdArray : foIdArray,foNameArray : foNameArray, userId : userId,constantsObj:constantsObj , contextPath:props.contextPath});
                                    }else{
                                        res.render('loan_recovery/loanrecoveryLoans',{loanDetails : loanDetails,searchResult : searchResult, errorLabel : "No groups found",officeIdArray :officeIdArray, officeNameArray : officeNameArray,roleId : roleId,officeId : officeId,foIdArray : foIdArray,foNameArray : foNameArray, userId : userId,constantsObj:constantsObj , contextPath:props.contextPath});
                                    }
                                }
                                else {
                                    var i=0;
                                    for(var item = 0; item<result.loanList.length; item++) {
                                        var LoanRepaymentForFO1 = require(loanRecoveryDtoPath +"/LoanRepaymentForFO");
                                        var LoanRepaymentForFO = new LoanRepaymentForFO1();

                                        if(result.loanList[item].displayLoan == true){
                                            LoanRepaymentForFO.setClientId(result.loanList[item].clientId);
                                            LoanRepaymentForFO.setClientName(result.loanList[item].clientName);
                                            LoanRepaymentForFO.setLoanAccountId(result.loanList[item].loanAccountId);
                                            LoanRepaymentForFO.setGlobalAccountNum(result.loanList[item].globalAccountNum);
                                            LoanRepaymentForFO.setDisplayloan(result.loanList[item].displayLoan);
                                            if(result.loanList[item].customerCustomNumber != null) {
                                                LoanRepaymentForFO.setGroupCode(result.loanList[item].customerCustomNumber);
                                            } else {
                                                LoanRepaymentForFO.setGroupCode(" ");
                                            }
                                            LoanRepaymentForFO.setActionDate(result.loanList[item].actionDate);
                                            loanDetails[i] = LoanRepaymentForFO;
                                            i = i+1;
                                        }
                                    }
                                    if(req.session.browser == "mobile") {
                                        res.render('Mobile/loanrecoveryLoans',{loanDetails : loanDetails,searchResult : searchResult,errorLabel :"",officeIdArray :officeIdArray,officeNameArray :officeNameArray,roleId :roleId,officeId :officeId,foIdArray : foIdArray,foNameArray : foNameArray, userId : userId,constantsObj:constantsObj, contextPath:props.contextPath});
                                    }else {
                                        res.render('loan_recovery/loanrecoveryLoans',{loanDetails : loanDetails,searchResult : searchResult,errorLabel :"",officeIdArray :officeIdArray,officeNameArray :officeNameArray,roleId :roleId,officeId :officeId,foIdArray : foIdArray,foNameArray : foNameArray, userId : userId,constantsObj:constantsObj, contextPath:props.contextPath});
                                    }
                                }
                            } else {
                                self.commonRouter.showErrorPage(req,res);
                            }
                        });
                    });
                });
            }
        }catch(e){
            customlog.error("Exception While Loan recovery Loans "+e);
            self.commonRouter.showErrorPage(req,res);
        }
    },

    loanrecoveryLoansAjaxCall : function(req,res) {
        try{
            var self = this;
            var rest = require("./rest.js");
            var http = require('http');
            var https = require('https');
            var roleId;
            var tenantId;
            var constantsObj = this.constants;
            var officeId = req.body.officeId;
            var userId = req.body.personnelId;

            roleId 		= req.session.roleId;
            tenantId 	= req.session.tenantId;
            customlog.info("Due Personnel Id "  +userId);
            var postheaders = {
                'Content-Type' : 'application/json',
                'Cookie' : req.session.mifosCookie
            };
            var loanDetails = new Array();
            var searchResult = new Array();
            var options = {
                host: mifosServiceIP,
                port: mifosPort,
                path: "/mfi/api/account/loan/personnel/due-"+userId+"-"+officeId+".json",
                method: 'GET',
                headers : postheaders
            };
            var CustomerDetailDto1 = require(loanRecoveryDtoPath +"/CustomerDetailDto");
            var CustomerDetailDto = new CustomerDetailDto1();
            CustomerDetailDto.setFlag(0);
            //searchResult[0] = CustomerDetailDto;
            rest.getJSON(options,function(statuscode,result,headers) {
                customlog.info(statuscode);
                if(statuscode == 302){
                    res.redirect(props.contextPath+'/client/ci/logout');
                }
                else if(result.status == "success") {
                    if (result.loanList.length == 0){
                        req.body.statuscode = statuscode;
                        req.body.loanDetails = loanDetails;
                        res.send(req.body);
                    }
                    else {
                        var i=0;
                        for(var item = 0; item<result.loanList.length; item++) {
                            var LoanRepaymentForFO1 = require(loanRecoveryDtoPath +"/LoanRepaymentForFO");
                            var LoanRepaymentForFO = new LoanRepaymentForFO1();
                            if(result.loanList[item].displayLoan == true) {
                                LoanRepaymentForFO.setClientId(result.loanList[item].clientId);
                                LoanRepaymentForFO.setClientName(result.loanList[item].clientName);
                                LoanRepaymentForFO.setLoanAccountId(result.loanList[item].loanAccountId);
                                LoanRepaymentForFO.setGlobalAccountNum(result.loanList[item].globalAccountNum);
                                LoanRepaymentForFO.setDisplayloan(result.loanList[item].displayLoan);
                                if(result.loanList[item].customerCustomNumber != null) {
                                    LoanRepaymentForFO.setGroupCode(result.loanList[item].customerCustomNumber);
                                } else {
                                    LoanRepaymentForFO.setGroupCode(" ");
                                }
                                LoanRepaymentForFO.setActionDate(result.loanList[item].actionDate);
                                loanDetails[i] = LoanRepaymentForFO;
                                i = i+1;
                            }
                        }
                        req.body.statuscode = statuscode;
                        req.body.loanDetails = loanDetails;
                        res.send(req.body);
                    }
                } else {
                    self.commonRouter.showErrorPage(req,res);
                }

            });
        }catch(e){
            customlog.error("Exception while Loan recovery Ajexcall "+e);
            self.commonRouter.showErrorPage(req,res);
        }
    },

    pastDueLoans  :  function(req,res){
        try{
            var self= this;
            var constantsObj = this.constants;
            var rest = require("./rest.js");
            var http = require('http');
            var https = require('https');
            var officeId ;
            var roleId;
            var tenantId;
            var userId;

            if(typeof (req.session.tenantId) == 'undefined' || typeof (req.session.userId) == 'undefined') {
                res.redirect(props.contextPath+'/client/ci/login');
            }else{
                if(req.session.roleId == this.constants.getSMHroleId()){
                    if(typeof(req.query.officeNameId) == 'undefined'){
                        officeId = 1;
                    }else{
                        officeId = req.query.officeNameId;
                    }
                    if(typeof(req.query.FOId) == 'undefined'){
                        userId = -1;
                    }else if(req.query.FOId == 1){
                        userId = -1;
                    }
                    else{
                        userId = req.query.FOId;
                    }
                }
                else if(req.session.roleId == this.constants.getBMroleId()){
                    officeId 	= req.session.officeId;
                    if(typeof(req.query.FOId) == 'undefined'){
                        userId = -1;
                    }else if(req.query.FOId == 1){
                        userId = -1;
                    }
                    else{
                        userId = req.query.FOId;
                    }
                }
                else{
                    officeId 	= req.session.officeId;
                    userId = req.session.userId;
                }
                roleId 		= req.session.roleId;
                tenantId 	= req.session.tenantId;
                customlog.info("officeId "  + officeId);
                customlog.info("roleId "  + roleId);
                customlog.info("tenantId "  + tenantId);
                customlog.info("Personnel Id "  + userId);
                var postheaders = {
                    'Content-Type' : 'application/json',
                    'Cookie' : req.session.mifosCookie
                };
                var loanDetails = new Array();
                var searchResult = new Array();
                var options = {
                    host: mifosServiceIP,
                    port: mifosPort,
                    path: "/mfi/api/account/loan/personnel/overdue-"+userId+"-"+officeId+".json",
                    method: 'GET',
                    headers : postheaders
                };
                var CustomerDetailDto1 = require(loanRecoveryDtoPath +"/CustomerDetailDto");
                var CustomerDetailDto = new CustomerDetailDto1();
                CustomerDetailDto.setFlag(0);
                //searchResult[0] = CustomerDetailDto;
                self.commonRouter.retriveFieldOfficersCall(officeId,function(foIdArray,foNameArray){
                    self.commonRouter.retriveOfficeCall(tenantId,req.session.userId,function(officeIdArray,officeNameArray,officeAddressArray,officeShortNameArray){
                        officeIdArray[officeIdArray.length] = 1;
                        officeNameArray[officeNameArray.length] = 'All';
                        rest.getJSON(options,function(statuscode,result,headers){
                            customlog.info(statuscode);
                            if(statuscode == 302){
                                res.redirect(props.contextPath+'/client/ci/logout');
                            }
                            else if(result.status == "success") {
                                if (result.loanList.length == 0){
                                    if(req.session.browser == "mobile") {
                                        res.render('Mobile/pastDueLoans',{loanDetails : loanDetails,searchResult : searchResult,errorLabel :"",officeIdArray :officeIdArray,officeNameArray :officeNameArray,roleId :roleId,officeIdArray :officeIdArray, officeNameArray : officeNameArray,roleId : roleId,officeId : officeId,foIdArray : foIdArray,foNameArray : foNameArray, userId : userId,constantsObj:constantsObj, contextPath:props.contextPath});
                                    }else{
                                        res.render('loan_recovery/pastDueLoans',{loanDetails : loanDetails,searchResult : searchResult,errorLabel :"",officeIdArray :officeIdArray,officeNameArray :officeNameArray,roleId :roleId,officeIdArray :officeIdArray, officeNameArray : officeNameArray,roleId : roleId,officeId : officeId,foIdArray : foIdArray,foNameArray : foNameArray, userId : userId,constantsObj:constantsObj, contextPath:props.contextPath});
                                    }
                                }
                                else {
                                    var i=0;
                                    for(var item = 0; item<result.loanList.length; item++) {
                                        var LoanRepaymentForFO1 = require(loanRecoveryDtoPath +"/LoanRepaymentForFO");
                                        var LoanRepaymentForFO = new LoanRepaymentForFO1();
                                        if(result.loanList[item].displayLoan == true){
                                            LoanRepaymentForFO.setClientId(result.loanList[item].clientId);
                                            LoanRepaymentForFO.setClientName(result.loanList[item].clientName);
                                            LoanRepaymentForFO.setLoanAccountId(result.loanList[item].loanAccountId);
                                            LoanRepaymentForFO.setGlobalAccountNum(result.loanList[item].globalAccountNum);
                                            LoanRepaymentForFO.setDisplayloan(result.loanList[item].displayLoan);
                                            LoanRepaymentForFO.setInstallmentId(result.loanList[item].installmentId);
                                            if(result.loanList[item].customerCustomNumber != null) {
                                                LoanRepaymentForFO.setGroupCode(result.loanList[item].customerCustomNumber);
                                            } else {
                                                LoanRepaymentForFO.setGroupCode(" ");
                                            }
                                            LoanRepaymentForFO.setActionDate(result.loanList[item].actionDate);
                                            loanDetails[i] = LoanRepaymentForFO;
                                            i = i+1;
                                        }
                                    }
                                    customlog.info("userId" + userId);
                                    if(req.session.browser == "mobile") {
                                        res.render('Mobile/pastDueLoans',{loanDetails : loanDetails,searchResult : searchResult,errorLabel :"",officeIdArray :officeIdArray,officeNameArray :officeNameArray,roleId :roleId,officeIdArray :officeIdArray, officeNameArray : officeNameArray,roleId : roleId,officeId : officeId,foIdArray : foIdArray,foNameArray : foNameArray, userId : userId,constantsObj:constantsObj, contextPath:props.contextPath});
                                    }else{
                                        res.render('loan_recovery/pastDueLoans',{loanDetails : loanDetails,searchResult : searchResult,errorLabel :"",officeIdArray :officeIdArray,officeNameArray :officeNameArray,roleId :roleId,officeIdArray :officeIdArray, officeNameArray : officeNameArray,roleId : roleId,officeId : officeId,foIdArray : foIdArray,foNameArray : foNameArray, userId : userId,constantsObj:constantsObj, contextPath:props.contextPath});
                                    }
                                }
                            } else {
                                self.commonRouter.showErrorPage(req,res);
                            }
                        });
                    });
                });
            }
        }catch(e){
            customlog.error("Exception while Past due loans "+e);
            self.commonRouter.showErrorPage(req,res);
        }
    },

    pastDueLoansAjaxCall  :  function(req,res) {
        try{
            var self= this;
            var constantsObj = this.constants;
            var rest = require("./rest.js");
            var http = require('http');
            var https = require('https');
            var officeId = req.body.officeId;
            var userId = req.body.personnelId;

            var roleId 		= req.session.roleId;
            var tenantId 	= req.session.tenantId;
            customlog.info("officeId "  + officeId);
            customlog.info("roleId "  + roleId);
            customlog.info("tenantId "  + tenantId);
            customlog.info("Personnel Id "  + userId);
            var postheaders = {
                'Content-Type' : 'application/json',
                'Cookie' : req.session.mifosCookie
            };
            var loanDetails = new Array();
            var searchResult = new Array();
            var options = {
                host: mifosServiceIP,
                port: mifosPort,
                path: "/mfi/api/account/loan/personnel/overdue-"+userId+"-"+officeId+".json",
                method: 'GET',
                headers : postheaders
            };
            var CustomerDetailDto1 = require(loanRecoveryDtoPath +"/CustomerDetailDto");
            var CustomerDetailDto = new CustomerDetailDto1();
            CustomerDetailDto.setFlag(0);
            //searchResult[0] = CustomerDetailDto;
            rest.getJSON(options,function(statuscode,result,headers) {
                customlog.info(statuscode);
                if(statuscode == 302) {
                    res.redirect(props.contextPath+'/client/ci/logout');
                }
                else if(result.status == "success") {
                    if (result.loanList.length == 0) {
                        req.body.statuscode = statuscode;
                        req.body.loanDetails = loanDetails;
                        res.send(req.body);
                    }
                    else {
                        var i=0;
                        for(var item = 0; item<result.loanList.length; item++) {
                            var LoanRepaymentForFO1 = require(loanRecoveryDtoPath +"/LoanRepaymentForFO");
                            var LoanRepaymentForFO = new LoanRepaymentForFO1();

                            if(result.loanList[item].displayLoan == true){
                                LoanRepaymentForFO.setClientId(result.loanList[item].clientId);
                                LoanRepaymentForFO.setClientName(result.loanList[item].clientName);
                                LoanRepaymentForFO.setLoanAccountId(result.loanList[item].loanAccountId);
                                LoanRepaymentForFO.setGlobalAccountNum(result.loanList[item].globalAccountNum);
                                LoanRepaymentForFO.setDisplayloan(result.loanList[item].displayLoan);
                                LoanRepaymentForFO.setInstallmentId(result.loanList[item].installmentId);
                                if(result.loanList[item].customerCustomNumber != null) {
                                    LoanRepaymentForFO.setGroupCode(result.loanList[item].customerCustomNumber);
                                } else {
                                    LoanRepaymentForFO.setGroupCode(" ");
                                }
                                LoanRepaymentForFO.setActionDate(result.loanList[item].actionDate);
                                loanDetails[i] = LoanRepaymentForFO;
                                i = i+1;
                            }
                        }

                        req.body.statuscode = statuscode;
                        req.body.loanDetails = loanDetails;
                        res.send(req.body);
                    }
                } else {
                    self.commonRouter.showErrorPage(req,res);
                }

            });
        }catch(e){
            customlog.error("Exception while Past due loans ajax call "+e);
            self.commonRouter.showErrorPage(req,res);
        }
    },

    futureDueLoans  :  function(req,res){
        try{
            var self = this;
            var constantsObj = this.constants;
            var rest = require("./rest.js");
            var http = require('http');
            var https = require('https');

            var officeId;
            var roleId;
            var tenantId;
            var userId;
            customlog.info("req.params.officeNameId" + req.query.officeNameId);

            if(typeof (req.session.tenantId) == 'undefined' || typeof (req.session.userId) == 'undefined') {
                res.redirect(props.contextPath+'/client/ci/login');
            }else{
                if(req.session.roleId == this.constants.getSMHroleId()){
                    if(typeof(req.query.officeNameId) == 'undefined'){
                        officeId = 1;
                    }else{
                        officeId = req.query.officeNameId;
                    }
                    if(typeof(req.query.FOId) == 'undefined'){
                        userId = -1;
                    }else if(req.query.FOId == 1){
                        userId = -1;
                    }
                    else{
                        userId = req.query.FOId;
                    }
                }else if(req.session.roleId == this.constants.getBMroleId()){
                    officeId 	= req.session.officeId;
                    if(typeof(req.query.FOId) == 'undefined'){
                        userId = -1;
                    }else if(req.query.FOId == 1){
                        userId = -1;
                    }
                    else{
                        userId = req.query.FOId;
                    }
                }
                else{
                    officeId 	= req.session.officeId;
                    userId = req.session.userId;
                }
                roleId 		= req.session.roleId;
                tenantId 	= req.session.tenantId;
                customlog.info("officeId "  + officeId);
                customlog.info("roleId "  + roleId);
                customlog.info("tenantId "  + tenantId);
                customlog.info("Personnel Id "  + userId);
                var postheaders = {
                    'Content-Type' : 'application/json',
                    'Cookie' : req.session.mifosCookie
                };
                var loanDetails = new Array();
                var searchResult = new Array();
                var options = {
                    host: mifosServiceIP,
                    port: mifosPort,
                    path: "/mfi/api/account/loan/personnel/futuredue-"+userId+"-"+officeId+".json",
                    method: 'GET',
                    headers : postheaders
                };

                self.commonRouter.retriveFieldOfficersCall(officeId,function(foIdArray,foNameArray){
                    self.commonRouter.retriveOfficeCall(tenantId,req.session.userId,function(officeIdArray,officeNameArray,officeAddressArray,officeShortNameArray){
                        officeIdArray[officeIdArray.length] = 1;
                        officeNameArray[officeNameArray.length] = 'All';
                        rest.getJSON(options,function(statuscode,result,headers){
                            customlog.info(statuscode);
                            if(statuscode == 302){
                                res.redirect(props.contextPath+'/client/ci/logout');
                            }
                            else if(result.status == "success") {
                                if (result.loanList.length == 0){
                                    //var activityDetails = new Array(iklantPort, req.session.tenantId, req.session.userId, req.session.userName, req.originalUrl, req.connection.remoteAddress, "router.js", "futureDueLoans", "success", "futureDueLoans", "futureDueLoans");
                                    //self.commonRouter.insertActivityLogModel(activityDetails);
                                    if(req.session.browser == "mobile") {
                                        res.render('Mobile/futureDueLoans',{loanDetails : loanDetails,searchResult : searchResult, errorLabel : "No groups found" ,officeIdArray : officeIdArray,officeNameArray : officeNameArray,roleId : roleId, officeId : officeId,foIdArray : foIdArray,foNameArray : foNameArray, userId : userId,constantsObj:constantsObj, contextPath:props.contextPath});
                                    } else {
                                        res.render('loan_recovery/futureDueLoans',{loanDetails : loanDetails,searchResult : searchResult, errorLabel : "No groups found" ,officeIdArray : officeIdArray,officeNameArray : officeNameArray,roleId : roleId, officeId : officeId,foIdArray : foIdArray,foNameArray : foNameArray, userId : userId,constantsObj:constantsObj, contextPath:props.contextPath});
                                    }
                                }
                                else {
                                    //var activityDetails = new Array(iklantPort, req.session.tenantId, req.session.userId, req.session.userName, req.originalUrl, req.connection.remoteAddress, "router.js", "futureDueLoans", "success", "futureDueLoans", "futureDueLoans");
                                    //self.commonRouter.insertActivityLogModel(activityDetails);
                                    var i=0;
                                    for(var item = 0; item<result.loanList.length; item++) {
                                        var LoanRepaymentForFO1 = require(loanRecoveryDtoPath +"/LoanRepaymentForFO");
                                        var LoanRepaymentForFO = new LoanRepaymentForFO1();
                                        if(result.loanList[item].displayLoan == true){
                                            LoanRepaymentForFO.setClientId(result.loanList[item].clientId);
                                            LoanRepaymentForFO.setClientName(result.loanList[item].clientName);
                                            LoanRepaymentForFO.setLoanAccountId(result.loanList[item].loanAccountId);
                                            LoanRepaymentForFO.setGlobalAccountNum(result.loanList[item].globalAccountNum);
                                            LoanRepaymentForFO.setDisplayloan(result.loanList[item].displayLoan);
                                            LoanRepaymentForFO.setInstallmentId(result.loanList[item].installmentId);
                                            if(result.loanList[item].customerCustomNumber != null) {
                                                LoanRepaymentForFO.setGroupCode(result.loanList[item].customerCustomNumber);
                                            } else {
                                                LoanRepaymentForFO.setGroupCode(" ");
                                            }
                                            LoanRepaymentForFO.setActionDate(result.loanList[item].actionDate);
                                            loanDetails[i] = LoanRepaymentForFO;
                                            i = i+1;
                                        }
                                    }
                                    customlog.info("officeId" + officeId);
                                    customlog.info("officeIdArray" + officeIdArray);
                                    if(req.session.browser == "mobile") {
                                        res.render('Mobile/futureDueLoans',{loanDetails : loanDetails,searchResult : searchResult, errorLabel : "" ,officeIdArray : officeIdArray,officeNameArray : officeNameArray,roleId : roleId, officeId : officeId,foIdArray : foIdArray,foNameArray : foNameArray, userId : userId,constantsObj:constantsObj, contextPath:props.contextPath});
                                    } else {
                                        res.render('loan_recovery/futureDueLoans',{loanDetails : loanDetails,searchResult : searchResult, errorLabel : "" ,officeIdArray : officeIdArray,officeNameArray : officeNameArray,roleId : roleId, officeId : officeId,foIdArray : foIdArray,foNameArray : foNameArray, userId : userId,constantsObj:constantsObj, contextPath:props.contextPath});
                                    }
                                }
                            } else {
                                self.commonRouter.showErrorPage(req,res);
                            }
                        });
                    });
                });
            }
        }catch(e){
            customlog.error("Exception While Future due loans "+e);
            self.commonRouter.showErrorPage(req,res);
        }
    },

    futureDueLoansDateAjaxCall :  function(req,res) {
        try {
            var self = this;
            var FutureLoansRequestHolderVar = require(loanRecoveryDtoPath +"/FutureLoansRequestHolder");
            var FutureLoansRequestHolderObj = new FutureLoansRequestHolderVar();
            var constantsObj = this.constants;
            var rest = require("./rest.js");
            var http = require('http');
            var https = require('https');

            if(typeof req.body.officeId == 'undefined') {
                var userId 		= req.session.userId;
                var officeId	= req.session.officeId;
            } else {
                var userId 		= req.body.personnelId;
                var officeId	= req.body.officeId;
            }

            customlog.info("req.body.officeId : "+req.body.officeId);
            customlog.info("req.body.userId : "+req.body.personnelId);
            var roleId 		= req.session.roleId;
            var tenantId 	= req.session.tenantId;

            var requestedDate = req.body.requestedDate;

            customlog.info("officeId "  + officeId);
            customlog.info("roleId "  + roleId);
            customlog.info("tenantId "  + tenantId);
            customlog.info("Personnel Id "  + userId);
            customlog.info("requestedDate "  + requestedDate);

            FutureLoansRequestHolderObj.setOfficeId(officeId);
            FutureLoansRequestHolderObj.setUserId(userId);
            FutureLoansRequestHolderObj.setRequestedDate(requestedDate);

            var jsonArray = JSON.stringify(FutureLoansRequestHolderObj);

            var postheaders = {
                'Content-Type' : 'application/json',
                'Content-Length' : Buffer.byteLength(jsonArray, 'utf8'),
                'Cookie' : req.session.mifosCookie
            };
            var loanDetails = new Array();
            var searchResult = new Array();
            //customlog.info("Path" + options.path);
            var options = {
                host: mifosServiceIP,
                port: mifosPort,
                path: "/mfi/api/account/loan/personnel/futureduedate.json",
                method: 'POST',
                headers : postheaders
            };
            rest.postJSON(options,jsonArray,function(statuscode,result,headers){
                customlog.info(statuscode);
                //customlog.info(result);
                if(statuscode == 302) {
                    res.redirect(props.contextPath+'/client/ci/logout');
                }
                else if(result.status == "success") {
                    if (result.loanList.length == 0){
                        //var activityDetails = new Array(iklantPort, req.session.tenantId, req.session.userId, req.session.userName, req.originalUrl, req.connection.remoteAddress, "router.js", "futureDueLoansDateAjaxCall", "success", "futureDueLoansDateAjaxCall", "futureDueLoansDateAjaxCall");
                        //self.commonRouter.insertActivityLogModel(activityDetails);
                        req.body.statuscode = statuscode;
                        req.body.loanDetails = loanDetails;
                        res.send(req.body);
                    }
                    else {
                        //var activityDetails = new Array(iklantPort, req.session.tenantId, req.session.userId, req.session.userName, req.originalUrl, req.connection.remoteAddress, "router.js", "futureDueLoansDateAjaxCall", "success", "futureDueLoansDateAjaxCall", "futureDueLoansDateAjaxCall");
                        //self.commonRouter.insertActivityLogModel(activityDetails);
                        var i=0;
                        for(var item = 0; item<result.loanList.length; item++) {
                            var LoanRepaymentForFO1 = require(loanRecoveryDtoPath +"/LoanRepaymentForFO");
                            var LoanRepaymentForFO = new LoanRepaymentForFO1();
                            if(result.loanList[item].displayLoan == true){
                                LoanRepaymentForFO.setClientId(result.loanList[item].clientId);
                                LoanRepaymentForFO.setClientName(result.loanList[item].clientName);
                                LoanRepaymentForFO.setLoanAccountId(result.loanList[item].loanAccountId);
                                LoanRepaymentForFO.setGlobalAccountNum(result.loanList[item].globalAccountNum);
                                LoanRepaymentForFO.setDisplayloan(result.loanList[item].displayLoan);
                                LoanRepaymentForFO.setInstallmentId(result.loanList[item].installmentId);
                                if(result.loanList[item].customerCustomNumber != null) {
                                    LoanRepaymentForFO.setGroupCode(result.loanList[item].customerCustomNumber);
                                } else {
                                    LoanRepaymentForFO.setGroupCode(" ");
                                }
                                LoanRepaymentForFO.setActionDate(result.loanList[item].actionDate);
                                loanDetails[i] = LoanRepaymentForFO;
                                i = i+1;
                            }
                        }
                        req.body.statuscode = statuscode;
                        req.body.loanDetails = loanDetails;
                        res.send(req.body);
                    }
                } else {
                    self.commonRouter.showErrorPage(req,res);
                }
            });
        }catch(e){
            customlog.error("Exception while Future due loans Ajax Call "+e);
            self.commonRouter.showErrorPage(req,res);
        }
    },

    dueLoansForManagerScreens : function(req,res) {
        try{
            var self = this;
            var constantsObj = this.constants;
            var rest = require("./rest.js");
            var http = require('http');
            var https = require('https');
            var officeId;
            var roleId;
            var tenantId;
            var userId;
            //customlog.info("req.params.officeNameId" + req.query.officeNameId);
            //customlog.info("req.session.roleId" + req.session.roleId);
            if(typeof (req.session.tenantId) == 'undefined' || typeof (req.session.userId) == 'undefined') {
                res.redirect(props.contextPath+'/client/ci/login');
            }else{
                if(req.session.roleId == this.constants.getSMHroleId() || req.session.roleId == this.constants.getNaiveroleId()){
                    if(typeof(req.query.officeNameId) == 'undefined'){
                        officeId = -1;
                    }else{
                        officeId = req.query.officeNameId;
                    }
                    if(typeof(req.query.FOId) == 'undefined'){
                        userId = -1;
                    }else if(req.query.FOId == 1){
                        userId = -1;
                    }
                    else{
                        userId = req.query.FOId;
                    }
                }else if(req.session.roleId == this.constants.getBMroleId()){
                    officeId 	= req.session.officeId;
                    if(typeof(req.query.FOId) == 'undefined'){
                        userId = -1;
                    }else if(req.query.FOId == 1){
                        userId = -1;
                    }
                    else{
                        userId = req.query.FOId;
                    }
                }
                else{
                    officeId 	= req.session.officeId;
                    userId = req.session.userId;
                }
                roleId 		= req.session.roleId;
                tenantId 	= req.session.tenantId;
                customlog.info("officeId "  + officeId);
                customlog.info("roleId "  + roleId);
                customlog.info("tenantId "  + tenantId);
                customlog.info("Personnel Id "  + userId);
                var postheaders = {
                    'Content-Type' : 'application/json',
                    'Cookie' : req.session.mifosCookie
                };
                var loanDetails = new Array();

                var overDueCountArray = new Array();
                var dueCountArray = new Array();
                var futureDueFirstDayCountArray = new Array();
                var futureDueSecondDayCountArray = new Array();
                var futureDueThirdDayCountArray = new Array();
                var futureDueForthDayCountArray = new Array();
                var futureDueFifthDayCountArray = new Array();

                var totalOverDueCount = 0;
                var totalDueCountArray = 0;
                var totalFutureDueFirstDayCount = 0;
                var totalFutureDueSecondDayCount = 0;
                var totalFutureDueThirdDayCount = 0;
                var totalFutureDueForthDayCount = 0;
                var totalFutureDueFifthDayCount = 0;

                var searchResult = new Array();
                var options = {
                    host: mifosServiceIP,
                    port: mifosPort,
                    path: "/mfi/api/account/loan/personnel/dues-"+officeId+".json",
                    //path: "/mfi/api/account/loan/personnel/futuredue-"+userId+"-"+officeId+".json",
                    method: 'GET',
                    headers : postheaders
                };

                self.commonRouter.retriveFieldOfficersCall(officeId,function(foIdArray,foNameArray){
                    self.commonRouter.retriveOfficeCall(tenantId,req.session.userId,function(officeIdArray,officeNameArray,officeAddressArray,officeShortNameArray){
                        //officeIdArray[officeIdArray.length] = -1;
                        //officeNameArray[officeNameArray.length] = 'All';
                        if(req.session.roleId == constantsObj.getCCEroleId() || req.session.roleId == constantsObj.getSMHroleId() ){
                            res.render('loan_recovery/futureDueLoansAdmin',{overDueCountArray:overDueCountArray,dueCountArray:dueCountArray,futureDueFirstDayCountArray:futureDueFirstDayCountArray,
                                 futureDueSecondDayCountArray:futureDueSecondDayCountArray,futureDueThirdDayCountArray:futureDueThirdDayCountArray,
                                 futureDueForthDayCountArray:futureDueForthDayCountArray,futureDueFifthDayCountArray:futureDueFifthDayCountArray,
                                 totalOverDueCount:totalOverDueCount,totalDueCountArray:totalDueCountArray,totalFutureDueFirstDayCount:totalFutureDueFirstDayCount,
                                 totalFutureDueSecondDayCount:totalFutureDueSecondDayCount,totalFutureDueThirdDayCount:totalFutureDueThirdDayCount,
                                 totalFutureDueForthDayCount :totalFutureDueForthDayCount,totalFutureDueFifthDayCount :totalFutureDueFifthDayCount,
                                 searchResult : searchResult, errorLabel : "" ,officeIdArray : officeIdArray,officeNameArray : officeNameArray,
                                 roleId : roleId, officeId : officeId,foIdArray : foIdArray,foNameArray : foNameArray, userId : userId,constantsObj:constantsObj, contextPath:props.contextPath});
                        }
                        else{
                            rest.getJSON(options,function(statuscode,result,headers){
                                 customlog.info(statuscode);
                                 if(statuscode == 302){
                                     res.redirect(props.contextPath+'/client/ci/logout');
                                 }
                                 else if(result.status == "success") {
                                     if (result.overdueLoanList.length == 0){
                                         res.render('loan_recovery/futureDueLoansAdmin',{overDueCountArray : overDueCountArray,loanDetails : loanDetails,searchResult : searchResult, errorLabel : "No groups found" ,officeIdArray : officeIdArray,officeNameArray : officeNameArray,roleId : roleId, officeId : officeId,foIdArray : foIdArray,foNameArray : foNameArray, userId : userId,constantsObj:constantsObj, contextPath:props.contextPath});
                                     }
                                     else {
                                         if(officeId == -1 || officeId == 1) {
                                             for(var item = 0; item < officeIdArray.length; item++) {
                                                 var x=0;
                                                 var y=0;
                                                 var z1=0;var z2=0;var z3=0;var z4=0;var z5=0;
                                                 for(var i=0;i<result.overdueLoanList.length;i++) {
                                                     if(result.overdueLoanList[i].officeId == officeIdArray[item]) {
                                                         x = result.overdueLoanList[i].noOfLoans;
                                                         totalOverDueCount += parseInt(result.overdueLoanList[i].noOfLoans);
                                                     }
                                                 }
                                                 for(var i=0;i<result.dueLoanList.length;i++) {
                                                     if(result.dueLoanList[i].officeId == officeIdArray[item]) {
                                                         y = result.dueLoanList[i].noOfLoans;
                                                         totalDueCountArray += parseInt(result.dueLoanList[i].noOfLoans);
                                                     }
                                                 }
                                                 for(var i=0;i<result.futureDueLoanList.length;i++) {
                                                     if(result.futureDueLoanList[i].officeId == officeIdArray[item] && result.futureDueLoanList[i].actionDate == addingDaysWithDate(new Date() , 1)) {
                                                         z1 = result.futureDueLoanList[i].noOfLoans;
                                                         totalFutureDueFirstDayCount += parseInt(result.futureDueLoanList[i].noOfLoans);
                                                     } else if(result.futureDueLoanList[i].officeId == officeIdArray[item] && result.futureDueLoanList[i].actionDate == addingDaysWithDate(new Date() , 2)) {
                                                         z2 = result.futureDueLoanList[i].noOfLoans;
                                                         totalFutureDueSecondDayCount += parseInt(result.futureDueLoanList[i].noOfLoans);
                                                     } else if(result.futureDueLoanList[i].officeId == officeIdArray[item] && result.futureDueLoanList[i].actionDate == addingDaysWithDate(new Date() , 3)) {
                                                         z3 = result.futureDueLoanList[i].noOfLoans;
                                                         totalFutureDueThirdDayCount += parseInt(result.futureDueLoanList[i].noOfLoans);
                                                     } else if(result.futureDueLoanList[i].officeId == officeIdArray[item] && result.futureDueLoanList[i].actionDate == addingDaysWithDate(new Date() , 4)) {
                                                         z4 = result.futureDueLoanList[i].noOfLoans;
                                                         totalFutureDueForthDayCount += parseInt(result.futureDueLoanList[i].noOfLoans);
                                                     } else if(result.futureDueLoanList[i].officeId == officeIdArray[item] && result.futureDueLoanList[i].actionDate == addingDaysWithDate(new Date() , 5)) {
                                                         z5 = result.futureDueLoanList[i].noOfLoans;
                                                         totalFutureDueFifthDayCount += parseInt(result.futureDueLoanList[i].noOfLoans);
                                                     }
                                                 }
                                                 overDueCountArray[item] = x;
                                                 dueCountArray[item] = y;
                                                 futureDueFirstDayCountArray[item] = z1;
                                                 futureDueSecondDayCountArray[item] = z2;
                                                 futureDueThirdDayCountArray[item] = z3;
                                                 futureDueForthDayCountArray[item] = z4;
                                                 futureDueFifthDayCountArray[item] = z5;
                                             }
                                         } else {
                                             customlog.info("foIdArray : "+foIdArray);
                                             customlog.info("foIdArray length : "+foIdArray.length);
                                             for(var item2 = 0;item2<foIdArray.length;item2++) {
                                                 var x=0;
                                                 var y=0;
                                                 var z1=0;var z2=0;var z3=0;var z4=0;var z5=0;
                                                 for(var i=0;i<result.overdueLoanList.length;i++) {
                                                     if(result.overdueLoanList[i].personnelId == foIdArray[item2]) {
                                                         x = result.overdueLoanList[i].noOfLoans;
                                                         totalOverDueCount += parseInt(result.overdueLoanList[i].noOfLoans);
                                                     }
                                                 }
                                                 for(var i=0;i<result.dueLoanList.length;i++) {
                                                     if(result.dueLoanList[i].personnelId == foIdArray[item2]) {
                                                         y = result.dueLoanList[i].noOfLoans;
                                                         totalDueCountArray += parseInt(result.dueLoanList[i].noOfLoans);
                                                     }
                                                 }
                                                 for(var i=0;i<result.futureDueLoanList.length;i++) {
                                                     if(result.futureDueLoanList[i].personnelId == foIdArray[item2] && result.futureDueLoanList[i].actionDate == addingDaysWithDate(new Date() , 1)) {
                                                         z1 = result.futureDueLoanList[i].noOfLoans;
                                                         totalFutureDueFirstDayCount += parseInt(result.futureDueLoanList[i].noOfLoans);
                                                     } else if(result.futureDueLoanList[i].personnelId == foIdArray[item2] && result.futureDueLoanList[i].actionDate == addingDaysWithDate(new Date() , 2)) {
                                                         z2 = result.futureDueLoanList[i].noOfLoans;
                                                         totalFutureDueSecondDayCount += parseInt(result.futureDueLoanList[i].noOfLoans);
                                                     } else if(result.futureDueLoanList[i].personnelId == foIdArray[item2] && result.futureDueLoanList[i].actionDate == addingDaysWithDate(new Date() , 3)) {
                                                         z3 = result.futureDueLoanList[i].noOfLoans;
                                                         totalFutureDueThirdDayCount += parseInt(result.futureDueLoanList[i].noOfLoans);
                                                     } else if(result.futureDueLoanList[i].personnelId == foIdArray[item2] && result.futureDueLoanList[i].actionDate == addingDaysWithDate(new Date() , 4)) {
                                                         z4 = result.futureDueLoanList[i].noOfLoans;
                                                         totalFutureDueForthDayCount += parseInt(result.futureDueLoanList[i].noOfLoans);
                                                     } else if(result.futureDueLoanList[i].personnelId == foIdArray[item2] && result.futureDueLoanList[i].actionDate == addingDaysWithDate(new Date() , 5)) {
                                                         z5 = result.futureDueLoanList[i].noOfLoans;
                                                         totalFutureDueFifthDayCount += parseInt(result.futureDueLoanList[i].noOfLoans);
                                                     }
                                                 }
                                                 overDueCountArray[item2] = x;
                                                 dueCountArray[item2] = y;
                                                 futureDueFirstDayCountArray[item2] = z1;
                                                 futureDueSecondDayCountArray[item2] = z2;
                                                 futureDueThirdDayCountArray[item2] = z3;
                                                 futureDueForthDayCountArray[item2] = z4;
                                                 futureDueFifthDayCountArray[item2] = z5;
                                             }
                                         }
                                         customlog.info("officeId" + officeId);
                                         customlog.info("officeIdArray" + officeIdArray);
                                         res.render('loan_recovery/futureDueLoansAdmin',{overDueCountArray:overDueCountArray,dueCountArray:dueCountArray,futureDueFirstDayCountArray:futureDueFirstDayCountArray,
                                             futureDueSecondDayCountArray:futureDueSecondDayCountArray,futureDueThirdDayCountArray:futureDueThirdDayCountArray,
                                             futureDueForthDayCountArray:futureDueForthDayCountArray,futureDueFifthDayCountArray:futureDueFifthDayCountArray,
                                             totalOverDueCount:totalOverDueCount,totalDueCountArray:totalDueCountArray,totalFutureDueFirstDayCount:totalFutureDueFirstDayCount,
                                             totalFutureDueSecondDayCount:totalFutureDueSecondDayCount,totalFutureDueThirdDayCount:totalFutureDueThirdDayCount,
                                             totalFutureDueForthDayCount :totalFutureDueForthDayCount,totalFutureDueFifthDayCount :totalFutureDueFifthDayCount,
                                             searchResult : searchResult, errorLabel : "" ,officeIdArray : officeIdArray,officeNameArray : officeNameArray,
                                             roleId : roleId, officeId : officeId,foIdArray : foIdArray,foNameArray : foNameArray, userId : userId,constantsObj:constantsObj, contextPath:props.contextPath});
                                     }
                                 } else {
                                     self.commonRouter.showErrorPage(req,res);
                                 }
                             });
                         }
                    });
                });
            }
        }catch(e){
            customlog.error("Exception While due loans for manager screen "+e);
            self.commonRouter.showErrorPage(req,res);
        }
    },
    dueLoansForManagerScreensWhileOfficeChange : function(req,res) {
        try{
            var self = this;
            var constantsObj = this.constants;
            var rest = require("./rest.js");
            var http = require('http');
            var https = require('https');
            var officeId;
            var roleId;
            var tenantId;
            var userId;
            if(typeof (req.session.tenantId) == 'undefined' || typeof (req.session.userId) == 'undefined') {
                res.redirect(props.contextPath+'/client/ci/login');
            }else{
                officeId = req.body.officeNameId;
                userId   = req.session.userId;
                roleId 	 = req.session.roleId;
                tenantId = req.session.tenantId;
                customlog.info("officeId "  + officeId);
                customlog.info("roleId "  + roleId);
                customlog.info("tenantId "  + tenantId);
                customlog.info("Personnel Id "  + userId);
                var postheaders = {
                    'Content-Type' : 'application/json',
                    'Cookie' : req.session.mifosCookie
                };
                var loanDetails = new Array();
                var overDueCountArray = new Array();
                var dueCountArray = new Array();
                var futureDueFirstDayCountArray = new Array();
                var futureDueSecondDayCountArray = new Array();
                var futureDueThirdDayCountArray = new Array();
                var futureDueForthDayCountArray = new Array();
                var futureDueFifthDayCountArray = new Array();
                var totalOverDueCount = 0;
                var totalDueCountArray = 0;
                var totalFutureDueFirstDayCount = 0;
                var totalFutureDueSecondDayCount = 0;
                var totalFutureDueThirdDayCount = 0;
                var totalFutureDueForthDayCount = 0;
                var totalFutureDueFifthDayCount = 0;
                var searchResult = new Array();
                var options = {
                    host: mifosServiceIP,
                    port: mifosPort,
                    path: "/mfi/api/account/loan/personnel/dues-"+officeId+".json",
                    method: 'GET',
                    headers : postheaders
                };
                self.commonRouter.retriveFieldOfficersCall(officeId,function(foIdArray,foNameArray){
                    self.commonRouter.retriveOfficeCall(tenantId,req.session.userId,function(officeIdArray,officeNameArray,officeAddressArray,officeShortNameArray){
                        //officeIdArray[officeIdArray.length] = -1;
                        //officeNameArray[officeNameArray.length] = 'All';
                        rest.getJSON(options,function(statuscode,result,headers){
                            customlog.info(statuscode);
                            if(statuscode == 302){
                                res.redirect(props.contextPath+'/client/ci/logout');
                            }
                            else if(result.status == "success") {
                                if (result.overdueLoanList.length == 0){
                                    res.render('loan_recovery/futureDueLoansAdmin',{overDueCountArray : overDueCountArray,loanDetails : loanDetails,searchResult : searchResult, errorLabel : "No groups found" ,officeIdArray : officeIdArray,officeNameArray : officeNameArray,roleId : roleId, officeId : officeId,foIdArray : foIdArray,foNameArray : foNameArray, userId : userId,constantsObj:constantsObj, contextPath:props.contextPath});
                                }
                                else {
                                    if(officeId == -1 || officeId == 1) {
                                        for(var item = 0; item < officeIdArray.length; item++) {
                                            var x=0;
                                            var y=0;
                                            var z1=0;var z2=0;var z3=0;var z4=0;var z5=0;
                                            for(var i=0;i<result.overdueLoanList.length;i++) {
                                                if(result.overdueLoanList[i].officeId == officeIdArray[item]) {
                                                    x = result.overdueLoanList[i].noOfLoans;
                                                    totalOverDueCount += parseInt(result.overdueLoanList[i].noOfLoans);
                                                }
                                            }
                                            for(var i=0;i<result.dueLoanList.length;i++) {
                                                if(result.dueLoanList[i].officeId == officeIdArray[item]) {
                                                    y = result.dueLoanList[i].noOfLoans;
                                                    totalDueCountArray += parseInt(result.dueLoanList[i].noOfLoans);
                                                }
                                            }
                                            for(var i=0;i<result.futureDueLoanList.length;i++) {
                                                if(result.futureDueLoanList[i].officeId == officeIdArray[item] && result.futureDueLoanList[i].actionDate == addingDaysWithDate(new Date() , 1)) {
                                                    z1 = result.futureDueLoanList[i].noOfLoans;
                                                    totalFutureDueFirstDayCount += parseInt(result.futureDueLoanList[i].noOfLoans);
                                                } else if(result.futureDueLoanList[i].officeId == officeIdArray[item] && result.futureDueLoanList[i].actionDate == addingDaysWithDate(new Date() , 2)) {
                                                    z2 = result.futureDueLoanList[i].noOfLoans;
                                                    totalFutureDueSecondDayCount += parseInt(result.futureDueLoanList[i].noOfLoans);
                                                } else if(result.futureDueLoanList[i].officeId == officeIdArray[item] && result.futureDueLoanList[i].actionDate == addingDaysWithDate(new Date() , 3)) {
                                                    z3 = result.futureDueLoanList[i].noOfLoans;
                                                    totalFutureDueThirdDayCount += parseInt(result.futureDueLoanList[i].noOfLoans);
                                                } else if(result.futureDueLoanList[i].officeId == officeIdArray[item] && result.futureDueLoanList[i].actionDate == addingDaysWithDate(new Date() , 4)) {
                                                    z4 = result.futureDueLoanList[i].noOfLoans;
                                                    totalFutureDueForthDayCount += parseInt(result.futureDueLoanList[i].noOfLoans);
                                                } else if(result.futureDueLoanList[i].officeId == officeIdArray[item] && result.futureDueLoanList[i].actionDate == addingDaysWithDate(new Date() , 5)) {
                                                    z5 = result.futureDueLoanList[i].noOfLoans;
                                                    totalFutureDueFifthDayCount += parseInt(result.futureDueLoanList[i].noOfLoans);
                                                }
                                            }
                                            overDueCountArray[item] = x;
                                            dueCountArray[item] = y;
                                            futureDueFirstDayCountArray[item] = z1;
                                            futureDueSecondDayCountArray[item] = z2;
                                            futureDueThirdDayCountArray[item] = z3;
                                            futureDueForthDayCountArray[item] = z4;
                                            futureDueFifthDayCountArray[item] = z5;
                                        }
                                    } else {
                                        customlog.info("foIdArray : "+foIdArray);
                                        customlog.info("foIdArray length : "+foIdArray.length);
                                        for(var item2 = 0;item2<foIdArray.length;item2++) {
                                            var x=0;
                                            var y=0;
                                            var z1=0;var z2=0;var z3=0;var z4=0;var z5=0;
                                            for(var i=0;i<result.overdueLoanList.length;i++) {
                                                if(result.overdueLoanList[i].personnelId == foIdArray[item2]) {
                                                    x = result.overdueLoanList[i].noOfLoans;
                                                    totalOverDueCount += parseInt(result.overdueLoanList[i].noOfLoans);
                                                }
                                            }
                                            for(var i=0;i<result.dueLoanList.length;i++) {
                                                if(result.dueLoanList[i].personnelId == foIdArray[item2]) {
                                                    y = result.dueLoanList[i].noOfLoans;
                                                    totalDueCountArray += parseInt(result.dueLoanList[i].noOfLoans);
                                                }
                                            }
                                            for(var i=0;i<result.futureDueLoanList.length;i++) {
                                                if(result.futureDueLoanList[i].personnelId == foIdArray[item2] && result.futureDueLoanList[i].actionDate == addingDaysWithDate(new Date() , 1)) {
                                                    z1 = result.futureDueLoanList[i].noOfLoans;
                                                    totalFutureDueFirstDayCount += parseInt(result.futureDueLoanList[i].noOfLoans);
                                                } else if(result.futureDueLoanList[i].personnelId == foIdArray[item2] && result.futureDueLoanList[i].actionDate == addingDaysWithDate(new Date() , 2)) {
                                                    z2 = result.futureDueLoanList[i].noOfLoans;
                                                    totalFutureDueSecondDayCount += parseInt(result.futureDueLoanList[i].noOfLoans);
                                                } else if(result.futureDueLoanList[i].personnelId == foIdArray[item2] && result.futureDueLoanList[i].actionDate == addingDaysWithDate(new Date() , 3)) {
                                                    z3 = result.futureDueLoanList[i].noOfLoans;
                                                    totalFutureDueThirdDayCount += parseInt(result.futureDueLoanList[i].noOfLoans);
                                                } else if(result.futureDueLoanList[i].personnelId == foIdArray[item2] && result.futureDueLoanList[i].actionDate == addingDaysWithDate(new Date() , 4)) {
                                                    z4 = result.futureDueLoanList[i].noOfLoans;
                                                    totalFutureDueForthDayCount += parseInt(result.futureDueLoanList[i].noOfLoans);
                                                } else if(result.futureDueLoanList[i].personnelId == foIdArray[item2] && result.futureDueLoanList[i].actionDate == addingDaysWithDate(new Date() , 5)) {
                                                    z5 = result.futureDueLoanList[i].noOfLoans;
                                                    totalFutureDueFifthDayCount += parseInt(result.futureDueLoanList[i].noOfLoans);
                                                }
                                            }
                                            overDueCountArray[item2] = x;
                                            dueCountArray[item2] = y;
                                            futureDueFirstDayCountArray[item2] = z1;
                                            futureDueSecondDayCountArray[item2] = z2;
                                            futureDueThirdDayCountArray[item2] = z3;
                                            futureDueForthDayCountArray[item2] = z4;
                                            futureDueFifthDayCountArray[item2] = z5;
                                        }
                                    }
                                    customlog.info("officeId" + officeId);
                                    customlog.info("officeIdArray" + officeIdArray);
                                    res.render('loan_recovery/futureDueLoansAdmin',{overDueCountArray:overDueCountArray,dueCountArray:dueCountArray,futureDueFirstDayCountArray:futureDueFirstDayCountArray,
                                        futureDueSecondDayCountArray:futureDueSecondDayCountArray,futureDueThirdDayCountArray:futureDueThirdDayCountArray,
                                        futureDueForthDayCountArray:futureDueForthDayCountArray,futureDueFifthDayCountArray:futureDueFifthDayCountArray,
                                        totalOverDueCount:totalOverDueCount,totalDueCountArray:totalDueCountArray,totalFutureDueFirstDayCount:totalFutureDueFirstDayCount,
                                        totalFutureDueSecondDayCount:totalFutureDueSecondDayCount,totalFutureDueThirdDayCount:totalFutureDueThirdDayCount,
                                        totalFutureDueForthDayCount :totalFutureDueForthDayCount,totalFutureDueFifthDayCount :totalFutureDueFifthDayCount,
                                        searchResult : searchResult, errorLabel : "" ,officeIdArray : officeIdArray,officeNameArray : officeNameArray,
                                        roleId : roleId, officeId : officeId,foIdArray : foIdArray,foNameArray : foNameArray, userId : userId,constantsObj:constantsObj, contextPath:props.contextPath});
                                }
                            } else {
                                self.commonRouter.showErrorPage(req,res);
                            }
                        });
                    });
                });
            }
        }catch(e){
            customlog.error("Exception While due loans for manager screen "+e);
            self.commonRouter.showErrorPage(req,res);
        }
    },
    applyPaymentForFo :function(req, res){
        try{
            customlog.info("Inside Retrieve Payment Details");
            var self = this;
            var redirectionPageId = req.body.redirectionPageId;
            var accountId = parseInt(req.body.accountId,10);
            var accountTypeId = req.body.accountTypeId;
            var globalAccountNum = req.body.globalAccountNum;
            var clientNameForGroup = req.body.groupName;
            var relaxValidation = req.body.relaxValidation;
            var transactionDate;
            var ClientPaymentObj = require(loanRecoveryDtoPath +"/ClientPaymentDto");
            if(typeof req.body.dateofTransaction != 'undefined')
                transactionDate = convertChequeDateIntoMifosFormat(req.body.dateofTransaction);
            customlog.info("Session Group Mifos Name " + req.session.groupCenterMifosName );
            if(typeof clientNameForGroup != 'undefined'){
                req.session.groupCenterMifosName = clientNameForGroup;
            }
            if(typeof clientNameForGroup == 'undefined'){
                clientNameForGroup = req.session.groupCenterMifosName;
            }

            var loanRepaymentHolder = require(loanRecoveryDtoPath +"/LoanRepayment");
            var loanRepaymentHolder = new loanRepaymentHolder();
            loanRepaymentHolder.setAccountId(accountId);
            loanRepaymentHolder.setAccountTypeId(accountTypeId);
            loanRepaymentHolder.setGlobalAccountNum(globalAccountNum);
            loanRepaymentHolder.setTransactionDateStr(req.body.dateofTransaction);
            if(relaxValidation == 'on') {
                //customlog.info("Relax Validation");
                loanRepaymentHolder.setRelaxMismatchValidationCheck("true");}
            else
                loanRepaymentHolder.setRelaxMismatchValidationCheck("false");
            var clientPaymentObjArray = new Array();
            var glCodeObjArray = new Array();

            var rest = require("./rest.js");
            var accountDetail = JSON.stringify(loanRepaymentHolder);

            customlog.info("accountDetail"+accountDetail);
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
                    'Content-Length' : Buffer.byteLength(accountDetail, 'utf8'),
                    'Cookie' : req.session.mifosCookie
                };

                var options = {
                    host: mifosServiceIP,
                    port: mifosPort,
                    path: '/mfi/api/account/loan/repayment.json',
                    method: 'POST',
                    headers : postheaders
                };

                var resultStatus;
                rest.postJSON(options,accountDetail,function(statuscode,result,headers){
                    customlog.info("statuscode" + statuscode);
                    customlog.info("HEADERS:  "+headers)
                    var LoanRepayment = require(loanRecoveryDtoPath +"/LoanRepayment");
                    var ClientPaymentDto = require(loanRecoveryDtoPath +"/ClientPaymentDto");
                    var GLCodeDto = require(loanRecoveryDtoPath +"/GLCodeDto");
                    if(statuscode == 302){
                        res.redirect(props.contextPath+'/client/ci/logout');
                    }
                    else{
                        if(result.status == 'success'){
                            //var activityDetails = new Array(iklantPort, req.session.tenantId, req.session.userId, req.session.userName, req.originalUrl, req.connection.remoteAddress, "router.js", "applyPaymentForFo", "success", "Apply Payment", "Apply Payment ForFo");
                            //self.commonRouter.insertActivityLogModel(activityDetails);
                            if(result.paymentInfn.clientPaymentDetails != null){
                                for(var item = 0; item<result.paymentInfn.clientPaymentDetails.length; item++) {
                                    var clientPaymentDetail= new ClientPaymentObj();
                                    clientPaymentDetail.clearAll();
                                    clientPaymentDetail.setClientId(result.paymentInfn.clientPaymentDetails[item].clientId);
                                    clientPaymentDetail.setClientName(result.paymentInfn.clientPaymentDetails[item].clientName);
                                    if(redirectionPageId == 2){
                                        clientPaymentDetail.setClientPaymentAmount(result.paymentInfn.clientPaymentDetails[item].totalInstallmentAmount);

                                    }else{
                                        clientPaymentDetail.setClientPaymentAmount(result.paymentInfn.clientPaymentDetails[item].clientPaymentAmount);
                                    }

                                    clientPaymentDetail.setClientPaymentId(result.paymentInfn.clientPaymentDetails[item].clientPaymentId);
                                    clientPaymentDetail.setLoanAccountId(result.paymentInfn.clientPaymentDetails[item].loanAccountId);
                                    if(result.paymentInfn.clientPaymentDetails[item].totalOverdueAmount < 0){
                                        clientPaymentDetail.setTotalOverdueAmount(0);
                                    }else{
                                        clientPaymentDetail.setTotalOverdueAmount(result.paymentInfn.clientPaymentDetails[item].totalOverdueAmount);
                                    }
                                    clientPaymentDetail.setTotalOutstandingAmount(result.paymentInfn.clientPaymentDetails[item].totalOutstandingAmount);
                                    clientPaymentDetail.setTotalAmountDemanded(result.paymentInfn.clientPaymentDetails[item].totalAmountDemanded);
                                    clientPaymentDetail.setTotalAmountPaid(result.paymentInfn.clientPaymentDetails[item].totalAmountPaid);
                                    clientPaymentDetail.setTotalInstallmentAmount(result.paymentInfn.clientPaymentDetails[item].totalInstallmentAmount);
                                    clientPaymentDetail.setAccountStateId(result.paymentInfn.clientPaymentDetails[item].accountStateId);
                                    if(result.paymentInfn.clientPaymentDetails[item].phoneNumber == ""){
                                        clientPaymentDetail.setPhoneNumber("-");
                                    }else
                                        clientPaymentDetail.setPhoneNumber(result.paymentInfn.clientPaymentDetails[item].phoneNumber);
                                    clientPaymentObjArray[item] = clientPaymentDetail;
                                }
                            }
                            var groupClientPaymentDetail= new ClientPaymentObj();
                            groupClientPaymentDetail.clearAll();

                            if(result.paymentInfn.paymentDetails != null) {
                                groupClientPaymentDetail.setClientId(result.paymentInfn.paymentDetails.clientId);
                                groupClientPaymentDetail.setClientName(result.paymentInfn.paymentDetails.clientName);
                                groupClientPaymentDetail.setClientPaymentAmount(result.paymentInfn.paymentDetails.clientPaymentAmount);
                                groupClientPaymentDetail.setClientPaymentId(result.paymentInfn.paymentDetails.clientPaymentId);
                                groupClientPaymentDetail.setLoanAccountId(result.paymentInfn.paymentDetails.loanAccountId);
                                if(result.paymentInfn.paymentDetails.totalOverdueAmount < 0){
                                    groupClientPaymentDetail.setTotalOverdueAmount(0);
                                }else{
                                    groupClientPaymentDetail.setTotalOverdueAmount(result.paymentInfn.paymentDetails.totalOverdueAmount);
                                }
                                groupClientPaymentDetail.setTotalOutstandingAmount(result.paymentInfn.paymentDetails.totalOutstandingAmount);
                                groupClientPaymentDetail.setTotalAmountDemanded(result.paymentInfn.paymentDetails.totalAmountDemanded);
                                groupClientPaymentDetail.setTotalAmountPaid(result.paymentInfn.paymentDetails.totalAmountPaid);
                                groupClientPaymentDetail.setTotalInstallmentAmount(result.paymentInfn.paymentDetails.totalInstallmentAmount);
                                if(result.paymentInfn.paymentDetails.phoneNumber == ""){
                                    groupClientPaymentDetail.setPhoneNumber("-");
                                }else
                                    groupClientPaymentDetail.setPhoneNumber(result.paymentInfn.paymentDetails.phoneNumber);
                            }

                            if(result.paymentInfn.glCodes != null) {
                                for(var item = 0; item<result.paymentInfn.glCodes.length; item++) {
                                    var glCodeDto = new GLCodeDto();
                                    glCodeDto.clearAll();
                                    glCodeDto.setGlcodeId(result.paymentInfn.glCodes[item].glcodeId);
                                    glCodeDto.setGlcode(result.paymentInfn.glCodes[item].glcode);
                                    glCodeDto.setGlname(result.paymentInfn.glCodes[item].glname);
                                    glCodeDto.setOfficeId(result.paymentInfn.glCodes[item].officeId);
                                    glCodeDto.setCashOrBank(result.paymentInfn.glCodes[item].cashOrBank);

                                    glCodeObjArray[item] = glCodeDto;
                                }
                            }


                            var missedInstallmentsArray = new Array();
                            var loanRepayment= new LoanRepayment();
                            loanRepayment.clearAll();
                            if(result.paymentInfn != null) {
                                loanRepayment.setAccountId(result.paymentInfn.accountId);
                                loanRepayment.setAccountTypeId(result.paymentInfn.accountTypeId);
                                loanRepayment.setGlobalAccountNum(result.paymentInfn.globalAccountNum);
                                loanRepayment.setRetrieveType(result.paymentInfn.retrieveType);
                                loanRepayment.setIsDisbursal(result.paymentInfn.isDisbursal);
                                if(redirectionPageId == 2){
                                    loanRepayment.setAmount(result.paymentInfn.paymentDetails.totalInstallmentAmount);
                                }else{
                                    loanRepayment.setAmount(result.paymentInfn.amount);
                                }

                                if(result.paymentInfn.missedInstallmentsId != null){
                                    for(var m = 0; m < result.paymentInfn.missedInstallmentsId.length; m++) {
                                        missedInstallmentsArray[m] = result.paymentInfn.missedInstallmentsId[m];
                                    }
                                }

                                loanRepayment.setMissedInstallmentIdArray(missedInstallmentsArray);
                                loanRepayment.setTransferPaymentTypeId(result.paymentInfn.transferPaymentTypeId);
                                loanRepayment.setClientPaymentDetails(clientPaymentObjArray);
                                loanRepayment.setRelaxMismatchValidationCheck(result.paymentInfn.relaxMismatchValidationCheck);
                                loanRepayment.setTransactionDate(convertDate(result.paymentInfn.transactionDate));
                                loanRepayment.setPaymentDetails(groupClientPaymentDetail);
                                loanRepayment.setOfficeId(result.paymentInfn.officeId);
                                loanRepayment.setLastPaymentDate(convertDate(result.paymentInfn.lastPaymentDate));
                                loanRepayment.setCurrentDate(result.paymentInfn.currentDate);
                                loanRepayment.setDisbursementDate(convertDate(result.paymentInfn.disbursementDate));
                                loanRepayment.setFinancialYearEndDate(convertDate(result.paymentInfn.financialYearEndDate));
                                loanRepayment.setGlCodes(glCodeObjArray);
                                loanRepayment.setGlCodeId(result.paymentInfn.glCodeId);
                                loanRepayment.setReceiptId(result.paymentInfn.receiptId);
                                if(result.paymentInfn.partialPaidAmount != null) {
                                    loanRepayment.setPartialPaidAmount(result.paymentInfn.partialPaidAmount);
                                }else{
                                    loanRepayment.setPartialPaidAmount(0);
                                }
                                //loanRepayment.setInstallmentId(installmentIdHidden);
                                if(result.paymentInfn.receiptDate !=null)
                                    loanRepayment.setReceiptDate(convertDate(result.paymentInfn.receiptDate));
                                else
                                    loanRepayment.setReceiptDate(result.paymentInfn.receiptDate);
                                loanRepayment.setAccountForTransfer(result.paymentInfn.accountForTransfer);

                                var loanAccountInformationDto = require(loanRecoveryDtoPath +"/loanAccountInformationDto");
                                var loanSummary = require(loanRecoveryDtoPath +"/loanSummary");
                                //var paidInstallment = require(loanRecoveryDtoPath +"/paidInstallment");
                                //var futureInstallment = require(loanRecoveryDtoPath +"/futureInstallment");
                                //var runningBalance = require(loanRecoveryDtoPath +"/runningBalance");
                                var RepaymentSchedule = require(loanRecoveryDtoPath +"/RepaymentSchedule");
                                var clientLoanAccountDetailsDto = require(loanRecoveryDtoPath +"/clientLoanAccountDetailsDto");
                                var RecentAccountActivity = require(loanRecoveryDtoPath +"/RecentAccountActivity");

                                var accountId = new Array();
                                var clientId = new Array();
                                var clientName = new Array();
                                var govermentId = new Array();
                                var loanPurpose = new Array();
                                var loanAmount = new Array();
                                var insured = new Array();
                                var individualTracked = new Array();
                                var businessActivity = new Array();
                                var businessActivityName = new Array();
                                var loanAccountId = new Array();
                                var loanGlobalAccountNum = new Array();
                                var parentLoanGlobalAccountNum = new Array();
                                var parentLoanAccountId = new Array();
                                var clientPaidInstallmentArray = new Array();
                                var clientDueInstallmentArray = new Array();
                                var clientFutureInstallmentArray = new Array();
                                var clientRunningBalanceArray = new Array();


                                var installmentId = new Array();
                                var actionDate = new Array();
                                var paymentDate = new Array();
                                var principal = new Array();
                                var interest = new Array();
                                var fees = new Array();
                                var penalty = new Array();
                                var total = new Array();
                                var runBalPrincipal = new Array();
                                var runBalInterest = new Array();
                                var runBalFees = new Array();
                                var runBalPenalty = new Array();
                                var totalRunBal = new Array();


                                var clientInstallmentId = new Array();
                                var clientActionDate = new Array();
                                var clientPaymentDate = new Array();
                                var clientPrincipal = new Array();
                                var clientInterest = new Array();
                                var clientFees = new Array();
                                var clientPenalty = new Array();
                                var clientTotal = new Array();
                                var clientRunBalPrincipal = new Array();
                                var clientRunBalInterest = new Array();
                                var clientRunBalFees = new Array();
                                var clientRunBalPenalty = new Array();
                                var clientTotalRunBal = new Array();

                                var loanAccInformationDto=new loanAccountInformationDto();
                                loanAccInformationDto.clearAll();
                                if(result.loanInfnList.loanInformationDto != null){
                                    req.session.loanStatusId = result.loanInfnList.loanInformationDto.accountStateId;
                                    loanStatusId = result.loanInfnList.loanInformationDto.accountStateId;
                                    req.session.accountId = result.loanInfnList.loanInformationDto.accountId ;
                                    req.session.accountStateName = result.loanInfnList.loanInformationDto.accountStateName;
                                    loanAccInformationDto.setAccountId(result.loanInfnList.loanInformationDto.accountId);
                                    loanAccInformationDto.setGlobalAccountNum(result.loanInfnList.loanInformationDto.globalAccountNum);
                                    loanAccInformationDto.setAccountStateId(result.loanInfnList.loanInformationDto.accountStateId);
                                    loanAccInformationDto.setAccountStateName(result.loanInfnList.loanInformationDto.accountStateName);
                                    loanAccInformationDto.setCustomerName(result.loanInfnList.loanInformationDto.customerName);
                                    loanAccInformationDto.setGlobalCustNum(result.loanInfnList.loanInformationDto.globalCustNum);
                                    loanAccInformationDto.setCustomerId(result.loanInfnList.loanInformationDto.customerId);
                                    loanAccInformationDto.setPrdOfferingName(result.loanInfnList.loanInformationDto.prdOfferingName);
                                    loanAccInformationDto.setDisbursementDate(convertDate(result.loanInfnList.loanInformationDto.disbursementDate));
                                    loanAccInformationDto.setAccountTypeId(result.loanInfnList.loanInformationDto.accountTypeId);
                                    loanAccInformationDto.setOfficeName(result.loanInfnList.loanInformationDto.officeName);
                                    loanAccInformationDto.setOfficeId(result.loanInfnList.loanInformationDto.officeId);
                                    loanAccInformationDto.setPersonnelId(result.loanInfnList.loanInformationDto.personnelId);
                                    loanAccInformationDto.setNextMeetingDate(result.loanInfnList.loanInformationDto.nextMeetingDate);
                                    loanAccInformationDto.setTotalAmountDue(result.loanInfnList.loanInformationDto.totalAmountDue);
                                    loanAccInformationDto.setTotalAmountInArrears(result.loanInfnList.loanInformationDto.totalAmountInArrears);
                                    loanAccInformationDto.setVoucherNumberIfBank(result.loanInfnList.voucherNumberIfBank);
                                    loanAccInformationDto.setVoucherNumberIfCash(result.loanInfnList.voucherNumberIfCash);
                                    customlog.info("Voucher Number = "+result.loanInfnList.voucherNumberIfBank);
                                    customlog.info("Voucher Number = "+result.loanInfnList.voucherNumberIfCash);
                                    /*var individual_track;
                                     if(result.loanInfnList.loanInformationDto.individualTracked == "true" )
                                     individual_track = "Yes";
                                     else
                                     individual_track = "No"
                                     customlog.info("individual_track"+individual_track)*/
                                    loanAccInformationDto.setIndividualTracked(result.loanInfnList.loanInformationDto.individualTracked);

                                }

                                var loanSummary= new loanSummary();
                                loanSummary.clearAll();
                                if(result.loanInfnList.loanInformationDto.loanSummary != null) {
                                    loanSummary.setOriginalPrincipal(result.loanInfnList.loanInformationDto.loanSummary.originalPrincipal );
                                    loanSummary.setPrincipalPaid(result.loanInfnList.loanInformationDto.loanSummary.principalPaid );
                                    loanSummary.setPrincipalDue(result.loanInfnList.loanInformationDto.loanSummary.principalDue );
                                    loanSummary.setOriginalInterest(result.loanInfnList.loanInformationDto.loanSummary.originalInterest );
                                    loanSummary.setInterestPaid(result.loanInfnList.loanInformationDto.loanSummary.interestPaid );
                                    loanSummary.setInterestDue(result.loanInfnList.loanInformationDto.loanSummary.interestDue );
                                    loanSummary.setOriginalFees(result.loanInfnList.loanInformationDto.loanSummary.originalFees );
                                    loanSummary.setFeesPaid(result.loanInfnList.loanInformationDto.loanSummary.feesPaid );
                                    loanSummary.setFeesDue(result.loanInfnList.loanInformationDto.loanSummary.feesDue );
                                    loanSummary.setOriginalPenalty(result.loanInfnList.loanInformationDto.loanSummary.originalPenalty );
                                    loanSummary.setPenaltyPaid(result.loanInfnList.loanInformationDto.loanSummary.penaltyPaid );
                                    loanSummary.setPenaltyDue(result.loanInfnList.loanInformationDto.loanSummary.penaltyDue );
                                }


                                //*****************************************Group Paid Installment***************************************************//

                                var paidInstallment= new RepaymentSchedule();
                                paidInstallment.clearAll();
                                //customlog.info(result.loanInfnList.loanInformationDto.loanRepaymentSchedule.paidInstallments.length);
                                if(result.loanInfnList.loanInformationDto.loanRepaymentSchedule.paidInstallments != null){
                                    for(var item = 0; item < result.loanInfnList.loanInformationDto.loanRepaymentSchedule.paidInstallments.length; item++){
                                        installmentId[item] = result.loanInfnList.loanInformationDto.loanRepaymentSchedule.paidInstallments[item].installmentId;
                                        actionDate[item] = result.loanInfnList.loanInformationDto.loanRepaymentSchedule.paidInstallments[item].actionDate;
                                        paymentDate[item] = result.loanInfnList.loanInformationDto.loanRepaymentSchedule.paidInstallments[item].paymentDate;
                                        principal[item] = result.loanInfnList.loanInformationDto.loanRepaymentSchedule.paidInstallments[item].principal;
                                        interest[item] = result.loanInfnList.loanInformationDto.loanRepaymentSchedule.paidInstallments[item].interest;
                                        fees[item] = result.loanInfnList.loanInformationDto.loanRepaymentSchedule.paidInstallments[item].fees;
                                        penalty[item] = result.loanInfnList.loanInformationDto.loanRepaymentSchedule.paidInstallments[item].penalty;
                                        total[item] = result.loanInfnList.loanInformationDto.loanRepaymentSchedule.paidInstallments[item].total;
                                    }
                                }

                                paidInstallment.setInstallmentId(installmentId);
                                paidInstallment.setActionDate(actionDate);
                                paidInstallment.setPaymentDate(paymentDate);
                                paidInstallment.setPrincipal(principal);
                                paidInstallment.setInterest(interest);
                                paidInstallment.setFees(fees);
                                paidInstallment.setPenalty(penalty);
                                paidInstallment.setTotal(total);
                                installmentId = [];
                                actionDate = [];
                                paymentDate = [];
                                principal = [];
                                interest = [];
                                fees = [];
                                penalty = [];
                                total = [];

                                //customlog.info("paidInstallment.getPrincipal()=="+paidInstallment.getPrincipal());


                                //***************************************Group Due Installment****************************************************//

                                var dueInstallment=new RepaymentSchedule();
                                dueInstallment.clearAll();
                                if(result.loanInfnList.loanInformationDto.loanRepaymentSchedule.dueInstallments != null){
                                    for(var item = 0; item < result.loanInfnList.loanInformationDto.loanRepaymentSchedule.dueInstallments.length; item++){
                                        installmentId[item] = result.loanInfnList.loanInformationDto.loanRepaymentSchedule.dueInstallments[item].installmentId;
                                        actionDate[item] = result.loanInfnList.loanInformationDto.loanRepaymentSchedule.dueInstallments[item].actionDate;
                                        paymentDate[item] = result.loanInfnList.loanInformationDto.loanRepaymentSchedule.dueInstallments[item].paymentDate;
                                        principal[item] = result.loanInfnList.loanInformationDto.loanRepaymentSchedule.dueInstallments[item].principal;
                                        interest[item] = result.loanInfnList.loanInformationDto.loanRepaymentSchedule.dueInstallments[item].interest;
                                        fees[item] = result.loanInfnList.loanInformationDto.loanRepaymentSchedule.dueInstallments[item].fees;
                                        penalty[item] = result.loanInfnList.loanInformationDto.loanRepaymentSchedule.dueInstallments[item].penalty;
                                        total[item] = result.loanInfnList.loanInformationDto.loanRepaymentSchedule.dueInstallments[item].total;
                                    }
                                }
                                dueInstallment.setInstallmentId(installmentId);
                                dueInstallment.setActionDate(actionDate);
                                dueInstallment.setPaymentDate(paymentDate);
                                dueInstallment.setPrincipal(principal);
                                dueInstallment.setInterest(interest);
                                dueInstallment.setFees(fees);
                                dueInstallment.setPenalty(penalty);
                                dueInstallment.setTotal(total);
                                installmentId = [];
                                actionDate = [];
                                paymentDate = [];
                                principal = [];
                                interest = [];
                                fees = [];
                                penalty = [];
                                total = [];

                                //***************************************Group Future Installment****************************************************//

                                var futureInstallment=new RepaymentSchedule();
                                futureInstallment.clearAll();

                                //customlog.info(result.loanInfnList.loanInformationDto.loanRepaymentSchedule.futureInstallment.length);
                                if(result.loanInfnList.loanInformationDto.loanRepaymentSchedule.futureInstallment != null) {
                                    for(var item = 0; item < result.loanInfnList.loanInformationDto.loanRepaymentSchedule.futureInstallment.length; item++){
                                        installmentId[item] = result.loanInfnList.loanInformationDto.loanRepaymentSchedule.futureInstallment[item].installmentId;
                                        actionDate[item] = result.loanInfnList.loanInformationDto.loanRepaymentSchedule.futureInstallment[item].actionDate;
                                        paymentDate[item] = result.loanInfnList.loanInformationDto.loanRepaymentSchedule.futureInstallment[item].paymentDate;
                                        principal[item] = result.loanInfnList.loanInformationDto.loanRepaymentSchedule.futureInstallment[item].principal;
                                        interest[item] = result.loanInfnList.loanInformationDto.loanRepaymentSchedule.futureInstallment[item].interest;
                                        fees[item] = result.loanInfnList.loanInformationDto.loanRepaymentSchedule.futureInstallment[item].fees;
                                        penalty[item] = result.loanInfnList.loanInformationDto.loanRepaymentSchedule.futureInstallment[item].penalty;
                                        total[item] = result.loanInfnList.loanInformationDto.loanRepaymentSchedule.futureInstallment[item].total;
                                    }
                                }


                                /*var futureStartValue = result.loanInfnList.loanInformationDto.loanRepaymentSchedule.dueInstallments.length;
                                 var futureEndValue = result.loanInfnList.loanInformationDto.loanRepaymentSchedule.dueInstallments.length+result.loanInfnList.loanInformationDto.loanRepaymentSchedule.futureInstallment.length;
                                 for(var item = futureStartValue; item < futureEndValue; item++){
                                 customlog.info("Item Value = "+item);
                                 installmentId[item] = result.loanInfnList.loanInformationDto.loanRepaymentSchedule.futureInstallment[item-futureStartValue].installmentId;
                                 actionDate[item] = result.loanInfnList.loanInformationDto.loanRepaymentSchedule.futureInstallment[item-futureStartValue].actionDate;
                                 paymentDate[item] = result.loanInfnList.loanInformationDto.loanRepaymentSchedule.futureInstallment[item-futureStartValue].paymentDate;
                                 principal[item] = result.loanInfnList.loanInformationDto.loanRepaymentSchedule.futureInstallment[item-futureStartValue].principal;
                                 interest[item] = result.loanInfnList.loanInformationDto.loanRepaymentSchedule.futureInstallment[item-futureStartValue].interest;
                                 fees[item] = result.loanInfnList.loanInformationDto.loanRepaymentSchedule.futureInstallment[item-futureStartValue].fees;
                                 penalty[item] = result.loanInfnList.loanInformationDto.loanRepaymentSchedule.futureInstallment[item-futureStartValue].penalty;
                                 total[item] = result.loanInfnList.loanInformationDto.loanRepaymentSchedule.futureInstallment[item-futureStartValue].total;

                                 }*/
                                futureInstallment.setInstallmentId(installmentId);
                                futureInstallment.setActionDate(actionDate);
                                futureInstallment.setPaymentDate(paymentDate);
                                futureInstallment.setPrincipal(principal);
                                futureInstallment.setInterest(interest);
                                futureInstallment.setFees(fees);
                                futureInstallment.setPenalty(penalty);
                                futureInstallment.setTotal(total);
                                installmentId = [];
                                actionDate = [];
                                paymentDate = [];
                                principal = [];
                                interest = [];
                                fees = [];
                                penalty = [];
                                total = [];
                                //customlog.info("paidInstallment.getPrincipal()=="+paidInstallment.getPrincipal());
                                //customlog.info("futureInstallment.getPrincipal()=="+futureInstallment.getPrincipal());

                                //***************************************** Running Balance **********************************************************************//

                                var runningBalance=new RepaymentSchedule();
                                runningBalance.clearAll();
                                //customlog.info(result.loanInfnList.loanInformationDto.loanRepaymentSchedule.runningBalance.length);
                                if(result.loanInfnList.loanInformationDto.loanRepaymentSchedule.runningBalance != null) {
                                    for(var item = 0; item < result.loanInfnList.loanInformationDto.loanRepaymentSchedule.runningBalance.length; item++){
                                        runBalPrincipal[item] = result.loanInfnList.loanInformationDto.loanRepaymentSchedule.runningBalance[item].runBalPrincipal;
                                        runBalInterest[item] = result.loanInfnList.loanInformationDto.loanRepaymentSchedule.runningBalance[item].runBalInterest;
                                        runBalFees[item] = result.loanInfnList.loanInformationDto.loanRepaymentSchedule.runningBalance[item].runBalFees;
                                        runBalPenalty[item] = result.loanInfnList.loanInformationDto.loanRepaymentSchedule.runningBalance[item].runBalPenalty;
                                        totalRunBal[item] = result.loanInfnList.loanInformationDto.loanRepaymentSchedule.runningBalance[item].totalRunBal;
                                    }
                                }

                                runningBalance.setRunBalPrincipal(runBalPrincipal);
                                runningBalance.setRunBalInterest(runBalInterest);
                                runningBalance.setRunBalFees(runBalFees);
                                runningBalance.setRunBalPenalty(runBalPenalty);
                                runningBalance.setTotalRunBal(totalRunBal);
                                runBalPrincipal = [];
                                runBalInterest = [];
                                runBalFees = [];
                                runBalPenalty = [];
                                totalRunBal = [];

                                //customlog.info("paidInstallment.getPrincipal()=="+paidInstallment.getPrincipal());
                                //customlog.info("futureInstallment.getPrincipal()=="+futureInstallment.getPrincipal());
                                //customlog.info("runningBalance.getRunBalPrincipal()=="+runningBalance.getRunBalPrincipal());
                                //**************************************Client Account Info **************************************************************//

                                var clientLoanAccountDetailsDto = new clientLoanAccountDetailsDto();
                                if(result.loanInfnList.loanAccountDetailsDto != null) {
                                    for(var item = 0; item < result.loanInfnList.loanAccountDetailsDto.length; item++){
                                        accountId[item] = result.loanInfnList.loanAccountDetailsDto[item].accountId;
                                        clientId[item] = result.loanInfnList.loanAccountDetailsDto[item].clientId;
                                        clientName[item] = result.loanInfnList.loanAccountDetailsDto[item].clientName;
                                        govermentId[item] = result.loanInfnList.loanAccountDetailsDto[item].govermentId;
                                        loanPurpose[item] = result.loanInfnList.loanAccountDetailsDto[item].loanPurpose;
                                        loanAmount[item] = result.loanInfnList.loanAccountDetailsDto[item].loanAmount;
                                        insured[item] =	result.loanInfnList.loanAccountDetailsDto[item].insured;
                                        individualTracked[item] = result.loanInfnList.loanAccountDetailsDto[item].individualTracked;
                                        businessActivity[item] = result.loanInfnList.loanAccountDetailsDto[item].businessActivity;
                                        businessActivityName[item] = result.loanInfnList.loanAccountDetailsDto[item].businessActivityName;
                                        loanAccountId[item] = result.loanInfnList.loanAccountDetailsDto[item].loanAccountId;
                                        loanGlobalAccountNum[item] = result.loanInfnList.loanAccountDetailsDto[item].loanGlobalAccountNum;
                                        parentLoanGlobalAccountNum[item] = result.loanInfnList.loanAccountDetailsDto[item].parentLoanGlobalAccountNum;
                                        parentLoanAccountId[item] = result.loanInfnList.loanAccountDetailsDto[item].parentLoanAccountId;

                                        //**************************************Client Paid Installment **************************************************************//
                                        var clientPaidInstallment = new RepaymentSchedule();
                                        for(var innerItem = 0; innerItem < result.loanInfnList.loanAccountDetailsDto[item].loanRepaymentSchedule.paidInstallments.length; innerItem++){
                                            installmentId[innerItem] = result.loanInfnList.loanAccountDetailsDto[item].loanRepaymentSchedule.paidInstallments[innerItem].installmentId;
                                            actionDate[innerItem] = result.loanInfnList.loanAccountDetailsDto[item].loanRepaymentSchedule.paidInstallments[innerItem].actionDate ;
                                            paymentDate[innerItem] = result.loanInfnList.loanAccountDetailsDto[item].loanRepaymentSchedule.paidInstallments[innerItem].paymentDate;
                                            principal[innerItem] = result.loanInfnList.loanAccountDetailsDto[item].loanRepaymentSchedule.paidInstallments[innerItem].principal;
                                            interest[innerItem] = result.loanInfnList.loanAccountDetailsDto[item].loanRepaymentSchedule.paidInstallments[innerItem].interest;
                                            fees[innerItem] = result.loanInfnList.loanAccountDetailsDto[item].loanRepaymentSchedule.paidInstallments[innerItem].fees;
                                            penalty[innerItem] = result.loanInfnList.loanAccountDetailsDto[item].loanRepaymentSchedule.paidInstallments[innerItem].penalty;
                                            total[innerItem] = result.loanInfnList.loanAccountDetailsDto[item].loanRepaymentSchedule.paidInstallments[innerItem].total;
                                        }
                                        clientPaidInstallment.setInstallmentId(installmentId);
                                        clientPaidInstallment.setActionDate(actionDate);
                                        clientPaidInstallment.setPaymentDate(paymentDate);
                                        clientPaidInstallment.setPrincipal(principal);
                                        clientPaidInstallment.setInterest(interest);
                                        clientPaidInstallment.setFees(fees);
                                        clientPaidInstallment.setPenalty(penalty);
                                        clientPaidInstallment.setTotal(total);
                                        installmentId = [];
                                        actionDate = [];
                                        paymentDate = [];
                                        principal = [];
                                        interest = [];
                                        fees = [];
                                        penalty = [];
                                        total = [];
                                        clientPaidInstallmentArray[item] = clientPaidInstallment;

                                        //**************************************Client Due Installment **************************************************************//
                                        var clientDueInstallment = new RepaymentSchedule();
                                        for(var innerItem = 0; innerItem < result.loanInfnList.loanAccountDetailsDto[item].loanRepaymentSchedule.dueInstallments.length; innerItem++){
                                            installmentId[innerItem] = result.loanInfnList.loanAccountDetailsDto[item].loanRepaymentSchedule.dueInstallments[innerItem].installmentId;
                                            actionDate[innerItem] = result.loanInfnList.loanAccountDetailsDto[item].loanRepaymentSchedule.dueInstallments[innerItem].actionDate;
                                            paymentDate[innerItem] = result.loanInfnList.loanAccountDetailsDto[item].loanRepaymentSchedule.dueInstallments[innerItem].paymentDate;
                                            principal[innerItem] = result.loanInfnList.loanAccountDetailsDto[item].loanRepaymentSchedule.dueInstallments[innerItem].principal;
                                            interest[innerItem] = result.loanInfnList.loanAccountDetailsDto[item].loanRepaymentSchedule.dueInstallments[innerItem].interest;
                                            fees[innerItem] = result.loanInfnList.loanAccountDetailsDto[item].loanRepaymentSchedule.dueInstallments[innerItem].fees;
                                            penalty[innerItem] = result.loanInfnList.loanAccountDetailsDto[item].loanRepaymentSchedule.dueInstallments[innerItem].penalty;
                                            total[innerItem] = result.loanInfnList.loanAccountDetailsDto[item].loanRepaymentSchedule.dueInstallments[innerItem].total;
                                        }
                                        clientDueInstallment.setInstallmentId(installmentId);
                                        clientDueInstallment.setActionDate(actionDate);
                                        clientDueInstallment.setPaymentDate(paymentDate);
                                        clientDueInstallment.setPrincipal(principal);
                                        clientDueInstallment.setInterest(interest);
                                        clientDueInstallment.setFees(fees);
                                        clientDueInstallment.setPenalty(penalty);
                                        clientDueInstallment.setTotal(total);
                                        installmentId = [];
                                        actionDate = [];
                                        paymentDate = [];
                                        principal = [];
                                        interest = [];
                                        fees = [];
                                        penalty = [];
                                        total = [];
                                        clientDueInstallmentArray[item] = clientDueInstallment;

                                        //**************************************Client Future Installment **************************************************************//
                                        var clientFutureInstallment=new RepaymentSchedule();
                                        clientFutureInstallment.clearAll();
                                        for(var innerItem = 0; innerItem < result.loanInfnList.loanAccountDetailsDto[item].loanRepaymentSchedule.futureInstallment.length; innerItem++){
                                            installmentId[innerItem] = result.loanInfnList.loanAccountDetailsDto[item].loanRepaymentSchedule.futureInstallment[innerItem].installmentId;
                                            actionDate[innerItem] = result.loanInfnList.loanAccountDetailsDto[item].loanRepaymentSchedule.futureInstallment[innerItem].actionDate;
                                            paymentDate[innerItem] = result.loanInfnList.loanAccountDetailsDto[item].loanRepaymentSchedule.futureInstallment[innerItem].paymentDate;
                                            principal[innerItem] = result.loanInfnList.loanAccountDetailsDto[item].loanRepaymentSchedule.futureInstallment[innerItem].principal;
                                            interest[innerItem] = result.loanInfnList.loanAccountDetailsDto[item].loanRepaymentSchedule.futureInstallment[innerItem].interest;
                                            fees[innerItem] = result.loanInfnList.loanAccountDetailsDto[item].loanRepaymentSchedule.futureInstallment[innerItem].fees;
                                            penalty[innerItem] = result.loanInfnList.loanAccountDetailsDto[item].loanRepaymentSchedule.futureInstallment[innerItem].penalty;
                                            total[innerItem] = result.loanInfnList.loanAccountDetailsDto[item].loanRepaymentSchedule.futureInstallment[innerItem].total;
                                        }

                                        /*var futureStartValue = result.loanInfnList.loanAccountDetailsDto[innerItem].loanRepaymentSchedule.dueInstallments.length;
                                         var futureEndValue = result.loanInfnList.loanAccountDetailsDto[innerItem].loanRepaymentSchedule.dueInstallments.length+result.loanInfnList.loanAccountDetailsDto[innerItem].loanRepaymentSchedule.futureInstallment.length;
                                         for(var innerItem = futureStartValue; innerItem < futureEndValue; innerItem++){
                                         installmentId[innerItem] = result.loanInfnList.loanAccountDetailsDto[item].loanRepaymentSchedule.futureInstallment[innerItem-futureStartValue].installmentId;
                                         actionDate[innerItem] = result.loanInfnList.loanAccountDetailsDto[item].loanRepaymentSchedule.futureInstallment[innerItem-futureStartValue].actionDate ;
                                         paymentDate[innerItem] = result.loanInfnList.loanAccountDetailsDto[item].loanRepaymentSchedule.futureInstallment[innerItem-futureStartValue].paymentDate;
                                         principal[innerItem] = result.loanInfnList.loanAccountDetailsDto[item].loanRepaymentSchedule.futureInstallment[innerItem-futureStartValue].principal;
                                         interest[innerItem] = result.loanInfnList.loanAccountDetailsDto[item].loanRepaymentSchedule.futureInstallment[innerItem-futureStartValue].interest;
                                         fees[innerItem] = result.loanInfnList.loanAccountDetailsDto[item].loanRepaymentSchedule.futureInstallment[innerItem-futureStartValue].fees;
                                         penalty[innerItem] = result.loanInfnList.loanAccountDetailsDto[item].loanRepaymentSchedule.futureInstallment[innerItem-futureStartValue].penalty;
                                         total[innerItem] = result.loanInfnList.loanAccountDetailsDto[item].loanRepaymentSchedule.futureInstallment[innerItem-futureStartValue].total;
                                         }*/
                                        clientFutureInstallment.setInstallmentId(installmentId);
                                        clientFutureInstallment.setActionDate(actionDate);
                                        clientFutureInstallment.setPaymentDate(paymentDate);
                                        clientFutureInstallment.setPrincipal(principal);
                                        clientFutureInstallment.setInterest(interest);
                                        clientFutureInstallment.setFees(fees);
                                        clientFutureInstallment.setPenalty(penalty);
                                        clientFutureInstallment.setTotal(total);
                                        installmentId = [];
                                        actionDate = [];
                                        paymentDate = [];
                                        principal = [];
                                        interest = [];
                                        fees = [];
                                        penalty = [];
                                        total = [];
                                        clientFutureInstallmentArray[item] = clientFutureInstallment;

                                        //**************************************Client Running Balance **************************************************************//
                                        /*var clientRunningBalance = new RepaymentSchedule();
                                         this.clientRunningBalance = clientRunningBalance;
                                         var clientRunningBalance=this.clientRunningBalance;
                                         clientRunningBalance.clearAll();
                                         //customlog.info(result.loanInfnList.loanInformationDto.loanRepaymentSchedule.runningBalance.length);
                                         for(var innerItem = 0; innerItem < result.loanInfnList.loanAccountDetailsDto[item].loanRepaymentSchedule.runningBalance.length; innerItem++){
                                         runBalPrincipal[innerItem] = result.loanInfnList.loanAccountDetailsDto[item].loanRepaymentSchedule.runningBalance[innerItem].runBalPrincipal;
                                         runBalInterest[innerItem] = result.loanInfnList.loanAccountDetailsDto[item].loanRepaymentSchedule.runningBalance[innerItem].runBalInterest;
                                         runBalFees[innerItem] = result.loanInfnList.loanAccountDetailsDto[item].loanRepaymentSchedule.runningBalance[innerItem].runBalFees;
                                         runBalPenalty[innerItem] = result.loanInfnList.loanAccountDetailsDto[item].loanRepaymentSchedule.runningBalance[innerItem].runBalPenalty;
                                         totalRunBal[innerItem] = result.loanInfnList.loanAccountDetailsDto[item].loanRepaymentSchedule.runningBalance[innerItem].totalRunBal;
                                         }
                                         clientRunningBalance.setRunBalPrincipal(runBalPrincipal);
                                         clientRunningBalance.setRunBalInterest(runBalInterest);
                                         clientRunningBalance.setRunBalFees(runBalFees);
                                         clientRunningBalance.setRunBalPenalty(runBalPenalty);
                                         clientRunningBalance.setTotalRunBal(totalRunBal);
                                         clientRunningBalanceArray[item] = clientRunningBalance;
                                         runBalPrincipal = [];
                                         runBalInterest = [];
                                         runBalFees = [];
                                         runBalPenalty = [];
                                         totalRunBal = [];*/
                                    }

                                }

                                clientLoanAccountDetailsDto.setAccountId(accountId);
                                clientLoanAccountDetailsDto.setClientId(clientId);
                                clientLoanAccountDetailsDto.setClientName(clientName);
                                clientLoanAccountDetailsDto.setGovermentId(govermentId);
                                clientLoanAccountDetailsDto.setLoanPurpose(loanPurpose);
                                clientLoanAccountDetailsDto.setLoanAmount(loanAmount);
                                clientLoanAccountDetailsDto.setInsured(insured);
                                clientLoanAccountDetailsDto.setIndividualTracked(individualTracked);
                                clientLoanAccountDetailsDto.setBusinessActivity(businessActivity);
                                clientLoanAccountDetailsDto.setBusinessActivityName(businessActivityName);
                                clientLoanAccountDetailsDto.setLoanAccountId(loanAccountId);
                                clientLoanAccountDetailsDto.setLoanGlobalAccountNum(loanGlobalAccountNum);
                                clientLoanAccountDetailsDto.setParentLoanGlobalAccountNum(parentLoanGlobalAccountNum);
                                clientLoanAccountDetailsDto.setParentLoanAccountId(parentLoanAccountId);
                                clientLoanAccountDetailsDto.setPaidInstallment(clientPaidInstallmentArray);
                                clientLoanAccountDetailsDto.setDueInstallment(clientDueInstallmentArray);
                                clientLoanAccountDetailsDto.setFutureInstallment(clientFutureInstallmentArray);
                                //clientLoanAccountDetailsDto.setRunningBalance(clientRunningBalanceArray);


                                var id = new Array();
                                var actionDate = new Array();
                                var activity = new Array();
                                var principal = new Array();
                                var interest = new Array();
                                var fees = new Array();
                                var penalty = new Array();
                                var total = new Array();
                                var runningBalancePrincipal = new Array();
                                var runningBalanceInterest = new Array();
                                var runningBalanceFees = new Array();
                                var runningBalancePenalty = new Array();
                                var locale = new Array();
                                var timeStamp = new Array();
                                var runningBalancePrincipleWithInterestAndFees = new Array();
                                var totalValue = new Array();
                                var userPrefferedDate = new Array();

                                //customlog.info(result.loanInfnList.loanInformationDto.recentAccountActivity);
                                var recentAccountActivity=new RecentAccountActivity();
                                recentAccountActivity.clearAll();
                                if(result.loanInfnList.loanInformationDto.recentAccountActivity != null) {
                                    for(var item = 0; item < result.loanInfnList.loanInformationDto.recentAccountActivity.length; item++){
                                        id[item] = result.loanInfnList.loanInformationDto.recentAccountActivity[item].id;
                                        actionDate[item] = convertDate(result.loanInfnList.loanInformationDto.recentAccountActivity[item].actionDate);
                                        activity[item] = result.loanInfnList.loanInformationDto.recentAccountActivity[item].activity;
                                        principal[item] = result.loanInfnList.loanInformationDto.recentAccountActivity[item].principal;
                                        interest[item] = result.loanInfnList.loanInformationDto.recentAccountActivity[item].interest;
                                        fees[item] = result.loanInfnList.loanInformationDto.recentAccountActivity[item].fees;
                                        penalty[item] = result.loanInfnList.loanInformationDto.recentAccountActivity[item].penalty;
                                        total[item] = result.loanInfnList.loanInformationDto.recentAccountActivity[item].total;
                                        runningBalancePrincipal[item] = result.loanInfnList.loanInformationDto.recentAccountActivity[item].runningBalancePrinciple;
                                        runningBalanceInterest[item] = result.loanInfnList.loanInformationDto.recentAccountActivity[item].runningBalanceInterest;
                                        runningBalanceFees[item] = result.loanInfnList.loanInformationDto.recentAccountActivity[item].runningBalanceFees;
                                        runningBalancePenalty[item] = result.loanInfnList.loanInformationDto.recentAccountActivity[item].runningBalancePenalty;
                                        locale[item] = result.loanInfnList.loanInformationDto.recentAccountActivity[item].locale;
                                        timeStamp[item] = convertDate(result.loanInfnList.loanInformationDto.recentAccountActivity[item].timeStamp);
                                        runningBalancePrincipleWithInterestAndFees[item] = result.loanInfnList.loanInformationDto.recentAccountActivity[item].runningBalancePrincipleWithInterestAndFees;
                                        totalValue[item] = result.loanInfnList.loanInformationDto.recentAccountActivity[item].totalValue;
                                        userPrefferedDate[item] = result.loanInfnList.loanInformationDto.recentAccountActivity[item].userPrefferedDate;
                                    }
                                }

                                recentAccountActivity.setId(id);
                                recentAccountActivity.setActionDate(actionDate);
                                recentAccountActivity.setActivity(activity);
                                recentAccountActivity.setPrincipal(principal);
                                recentAccountActivity.setInterest(interest);
                                recentAccountActivity.setFees(fees);
                                recentAccountActivity.setPenalty(penalty);
                                recentAccountActivity.setTotal(total);
                                recentAccountActivity.setRunningBalancePrinciple(runningBalancePrincipal);
                                recentAccountActivity.setRunningBalanceInterest(runningBalanceInterest);
                                recentAccountActivity.setRunningBalanceFees(runningBalanceFees);
                                recentAccountActivity.setRunningBalancePenalty(runningBalancePenalty);
                                recentAccountActivity.setLocale(locale);
                                recentAccountActivity.setTimeStamp(timeStamp);
                                recentAccountActivity.setRunningBalancePrincipleWithInterestAndFees(runningBalancePrincipleWithInterestAndFees);
                                recentAccountActivity.setTotalValue(totalValue);
                                recentAccountActivity.setUserPrefferedDate(userPrefferedDate);

                                id = [];
                                actionDate = [];
                                activity = [];
                                principal = [];
                                interest = [];
                                fees = [];
                                penalty = [];
                                total = [];
                                runningBalancePrincipal = [];
                                runningBalanceInterest = [];
                                runningBalanceFees = [];
                                runningBalancePenalty = [];
                                locale = [];
                                timeStamp = [];
                                runningBalancePrincipleWithInterestAndFees = [];
                                totalValue = [];
                                userPrefferedDate = [];

                                var viewAllAccountActivity=new RecentAccountActivity();
                                viewAllAccountActivity.clearAll();
                                if(result.loanInfnList.allAccountActivities != null) {
                                    for(var item = 0; item < result.loanInfnList.allAccountActivities.length; item++){
                                        id[item] = result.loanInfnList.allAccountActivities[item].id;
                                        actionDate[item] = convertDate(result.loanInfnList.allAccountActivities[item].actionDate);
                                        activity[item] = result.loanInfnList.allAccountActivities[item].activity;
                                        principal[item] = result.loanInfnList.allAccountActivities[item].principal;
                                        interest[item] = result.loanInfnList.allAccountActivities[item].interest;
                                        fees[item] = result.loanInfnList.allAccountActivities[item].fees;
                                        penalty[item] = result.loanInfnList.allAccountActivities[item].penalty;
                                        total[item] = result.loanInfnList.allAccountActivities[item].total;
                                        runningBalancePrincipal[item] = result.loanInfnList.allAccountActivities[item].runningBalancePrinciple;
                                        runningBalanceInterest[item] = result.loanInfnList.allAccountActivities[item].runningBalanceInterest;
                                        runningBalanceFees[item] = result.loanInfnList.allAccountActivities[item].runningBalanceFees;
                                        runningBalancePenalty[item] = result.loanInfnList.allAccountActivities[item].runningBalancePenalty;
                                        locale[item] = result.loanInfnList.allAccountActivities[item].locale;
                                        timeStamp[item] = convertDate(result.loanInfnList.allAccountActivities[item].timeStamp);
                                        runningBalancePrincipleWithInterestAndFees[item] = result.loanInfnList.allAccountActivities[item].runningBalancePrincipleWithInterestAndFees;
                                        totalValue[item] = result.loanInfnList.allAccountActivities[item].totalValue;
                                        userPrefferedDate[item] = result.loanInfnList.allAccountActivities[item].userPrefferedDate;
                                    }
                                }

                                viewAllAccountActivity.setId(id);
                                viewAllAccountActivity.setActionDate(actionDate);
                                viewAllAccountActivity.setActivity(activity);
                                viewAllAccountActivity.setPrincipal(principal);
                                viewAllAccountActivity.setInterest(interest);
                                viewAllAccountActivity.setFees(fees);
                                viewAllAccountActivity.setPenalty(penalty);
                                viewAllAccountActivity.setTotal(total);
                                viewAllAccountActivity.setRunningBalancePrinciple(runningBalancePrincipal);
                                viewAllAccountActivity.setRunningBalanceInterest(runningBalanceInterest);
                                viewAllAccountActivity.setRunningBalanceFees(runningBalanceFees);
                                viewAllAccountActivity.setRunningBalancePenalty(runningBalancePenalty);
                                viewAllAccountActivity.setLocale(locale);
                                viewAllAccountActivity.setTimeStamp(timeStamp);
                                viewAllAccountActivity.setRunningBalancePrincipleWithInterestAndFees(runningBalancePrincipleWithInterestAndFees);
                                viewAllAccountActivity.setTotalValue(totalValue);
                                viewAllAccountActivity.setUserPrefferedDate(userPrefferedDate);
                                id = [];
                                actionDate = [];
                                activity = [];
                                principal = [];
                                interest = [];
                                fees = [];
                                penalty = [];
                                total = [];
                                runningBalancePrincipal = [];
                                runningBalanceInterest = [];
                                runningBalanceFees = [];
                                runningBalancePenalty = [];
                                locale = [];
                                timeStamp = [];
                                runningBalancePrincipleWithInterestAndFees = [];
                                totalValue = [];
                                userPrefferedDate = [];
                                customlog.info("req.session.paymentMonthClosingError=="+req.session.paymentMonthClosingError);
                                if(req.session.afterDoApplyPayment != 1){
                                    req.session.paymentMonthClosingError = "";
                                }
                                req.session.afterDoApplyPayment = 0;
                                customlog.info("req.session.paymentMonthClosingError=="+req.session.paymentMonthClosingError);
                                self.showLoanRecoveryLoanAccountInformation(req,res,req.session.paymentMonthClosingError,loanAccInformationDto,loanSummary,paidInstallment,dueInstallment,futureInstallment,runningBalance,clientLoanAccountDetailsDto,recentAccountActivity,viewAllAccountActivity,loanStatusId,loanRepayment,clientNameForGroup,redirectionPageId);
                                customlog.info('Retrieved Loan information');
                            }
                        } else {
                            self.commonRouter.showErrorPage(req,res);
                        }
                    }
                });
            }
        }catch(e){
            customlog.error("Exception while Apply Payment for Fo "+e);
            self.commonRouter.showErrorPage(req,res);
        }

    },

    showLoanRecoveryLoanAccountInformation: function(req,res,paymentMonthClosingError,loanAccInformationDto,loanSummary,paidInstallment,dueInstallment,futureInstallment,runningBalance,clientLoanAccountDetailsDto,recentAccountActivity,viewAllAccountActivity,loanStatusId,loanRepayment,clientName,redirectionPageId) {
        try{
            var self = this;
            var constantsObj = this.constants;
            //var activityDetails = new Array(iklantPort, req.session.tenantId, req.session.userId, req.session.userName, req.originalUrl, req.connection.remoteAddress, "router.js", "showLoanRecoveryLoanAccountInformation", "success", "showLoanRecoveryLoanAccountInformation", "showLoanRecoveryLoanAccountInformation");
            //self.commonRouter.insertActivityLogModel(activityDetails);
            customlog.info("req.session.globalCustomerNum"+req.session.globalCustomerNum);
            if(req.session.roleId == constantsObj.getFOroleId()){
                if(req.session.browser == "mobile") {
                    res.render('Mobile/applyPaymentForFo',{paymentMonthClosingError:req.session.paymentMonthClosingError,loanAccInformationDto:loanAccInformationDto,loanSummary:loanSummary,paidInstallment:paidInstallment,dueInstallment:dueInstallment,futureInstallment:futureInstallment,runningBalance:runningBalance,clientLoanAccountDetailsDto:clientLoanAccountDetailsDto,recentAccountActivity:recentAccountActivity,viewAllAccountActivity:viewAllAccountActivity,loanStatusId:loanStatusId,roleArray : req.session.roleArray,loanRepayment : loanRepayment,clientName : clientName,redirectionPageId : redirectionPageId, contextPath:props.contextPath});
                }else{
                    res.render('loan_recovery/applyPaymentForFo',{paymentMonthClosingError:req.session.paymentMonthClosingError,loanAccInformationDto:loanAccInformationDto,loanSummary:loanSummary,paidInstallment:paidInstallment,dueInstallment:dueInstallment,futureInstallment:futureInstallment,runningBalance:runningBalance,clientLoanAccountDetailsDto:clientLoanAccountDetailsDto,recentAccountActivity:recentAccountActivity,viewAllAccountActivity:viewAllAccountActivity,loanStatusId:loanStatusId,roleArray : req.session.roleArray,loanRepayment : loanRepayment,clientName : clientName,redirectionPageId : redirectionPageId, contextPath:props.contextPath});
                }
            }else{
                customlog.info("Inside Else Apply payment show page"+loanRepayment.getAmount());
                res.render('loan_recovery/ApplyPayment',{paymentMonthClosingError:req.session.paymentMonthClosingError, contextPath:props.contextPath,
                    loanAccInformationDto:loanAccInformationDto,loanSummary:loanSummary,
                    paidInstallment:paidInstallment,dueInstallment:dueInstallment,
                    futureInstallment:futureInstallment,runningBalance:runningBalance,
                    clientLoanAccountDetailsDto:clientLoanAccountDetailsDto,
                    recentAccountActivity:recentAccountActivity,viewAllAccountActivity:viewAllAccountActivity,
                    loanStatusId:loanStatusId,roleArray:req.session.roleArray,loanRepayment:loanRepayment,
                    groupName:clientName,roleId:req.session.roleId,constantsObj:constantsObj});
            }
        }catch(e){
            customlog.error("Exception While Show Loan Recovery Loan Account "+e);
            self.commonRouter.showErrorPage(req,res);
        }

    },

    doapplypaymentForFO : function(req, res){
        try{
            customlog.info("Inside Apply Payment Details");
            var self = this;
            var userId = req.session.userId;
            var tenantId = req.session.tenantId;
            var contactNumber = req.session.userContactNumber;

            var clientPaymentObjArray = new Array();
            var accountId = parseInt(req.body.accountId,10);
            var accountTypeId = parseInt(req.body.accountTypeId,10);
            var globalAccountNum = req.body.globalAccountNum;
            //var relaxValidation = req.body.relaxValidation;
            var loanStatusId = req.body.loanStatusId;
            var modeOfPayment = parseInt(req.body.response,10);
            customlog.info("modeOfPayment++" + modeOfPayment);
            var receiptId = req.body.receiptId;
            var installmentIdHidden = req.body.installmentNumber;
            //customlog.info("installmentIdHidden*******===++++ "+installmentIdHidden);
            /*var transactionDate;
             if(typeof req.body.dateofTransaction != 'undefined')
             transactionDate = new Date(convertToMifosDateFormat(req.body.dateofTransaction));
             var retrieveType = req.body.retrieveType;
             var sourceofPayment = req.body.sourceofPayment;
             var chequeNo = req.body.chequeNo;
             var chequeDate;
             if(typeof req.body.chequeDate != 'undefined')
             chequeDate = new Date(convertToMifosDateFormat(req.body.chequeDate));*/
            var amount = req.body.amount;

            var noOfClients = parseInt(req.body.noOfClients,10);

            var clientsId = req.body.clientsId.split(",");
            var clientsName = req.body.clientsName.split(",");
            var clientAmounts = req.body.clientAmounts.split(",");
            if(noOfClients >0 ){
                var ClientPaymentDtoObj = require(loanRecoveryDtoPath +"/ClientPaymentDto");
                for(var item =0 ; item < noOfClients; item++) {
                    var clientPaymentDto=new ClientPaymentDtoObj();
                    //clientPaymentDto.clearAll();
                    clientPaymentDto.setClientId(clientsId[item]);
                    clientPaymentDto.setClientName(clientsName[item]);
                    clientPaymentDto.setClientPaymentAmount(clientAmounts[item]);
                    clientPaymentObjArray[item] = clientPaymentDto;

                }
            }

            var loanRepaymentHolder1 = require(loanRecoveryDtoPath +"/LoanRepayment");
            var loanRepaymentHolder = new loanRepaymentHolder1();
            /*if(relaxValidation == 'on') {
             customlog.info("Relax Validation");
             loanRepaymentHolder.setRelaxMismatchValidationCheck("true");}
             else
             loanRepaymentHolder.setRelaxMismatchValidationCheck("false");*/
            loanRepaymentHolder.setAccountId(accountId);
            loanRepaymentHolder.setAccountTypeId(accountTypeId);
            loanRepaymentHolder.setGlobalAccountNum(globalAccountNum);
            loanRepaymentHolder.setOfficeId(req.session.officeId);
            //loanRepaymentHolder.setTransactionDate(transactionDate);
            loanRepaymentHolder.setAmount(amount);
            loanRepaymentHolder.setPaymentTypeId(modeOfPayment);
            loanRepaymentHolder.setReceiptId(receiptId);
            loanRepaymentHolder.setInstallmentId(installmentIdHidden);
            //loanRepaymentHolder.setRetrieveType(retrieveType);
            //loanRepaymentHolder.setGlCodeId(sourceofPayment);
            //loanRepaymentHolder.setReceiptId(chequeNo);
            //loanRepaymentHolder.setReceiptDate(chequeDate);
            loanRepaymentHolder.setClientPaymentDetails(clientPaymentObjArray);
            loanRepaymentHolder.setVoucherNumber(req.body.voucherNumber);
            customlog.info("req.body.voucherNumber"+req.body.voucherNumber);
            var rest = require("./rest.js");
            var accountDetail = JSON.stringify(loanRepaymentHolder);

            customlog.info("accountDetail"+accountDetail);
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
                    'Content-Length' : Buffer.byteLength(accountDetail, 'utf8'),
                    'Cookie' : req.session.mifosCookie
                };

                var options = {
                    host: mifosServiceIP,
                    port: mifosPort,
                    path: '/mfi/api/account/loan/repayment/saveCollection.json',
                    method: 'POST',
                    headers : postheaders
                };

                var resultStatus;
                rest.postJSON(options,accountDetail,function(statuscode,result,headers){
                    customlog.info("statuscode" + statuscode);
                    customlog.info("HEADERS:  "+headers)
                    customlog.info("RESULT"+result.status);
                    if(statuscode == 302){
                        res.redirect(props.contextPath+'/client/ci/logout');
                    }
                    else{
                        if(result.status == 'success'){
                            var activityDetails = new Array(iklantPort, req.session.tenantId, req.session.userId, req.session.userName, req.originalUrl, req.connection.remoteAddress, "router.js", "doapplypaymentForFO", "success", "Apply PaymentForFO", "Apply PaymentForFO AccountId "+accountId+" Made Successfully","insert");
                            self.commonRouter.insertActivityLogModel(activityDetails);
                            var data = {};
                            customlog.info("userId : "+userId);
                            customlog.info("tenantId : "+tenantId);
                            customlog.info("contactNumber : "+contactNumber);
                            data.userId = userId;
                            data.tenantId = tenantId;
                            data.contactNumber = contactNumber;
                            data.taskDescription = "Loan Repayment";
                            self.commonRouter.submitTaskService(req,res,data);

                            req.body.status = result.status;
                            res.send(req.body);
                        }else if(result.hasOwnProperty('errors')){
                            req.body.status = "failure";
                            req.body.error = result.errors;
                            res.send(req.body);
                        }
                        else{
                            req.body.status = "runtime";
                            res.send(req.body);
                        }
                    }
                });
            }
        }catch(e){
            customlog.error("Exception while Do Apply payment "+e);
            self.commonRouter.showErrorPage(req,res);
        }
    },

    search :  function(req,res){
        try{
            customlog.info("Inside Search");
            var self=this;
            var constantsObj = this.constants;
            var loanDetails = new Array();
            var searchResult = new Array();
            customlog.info("req.body.serachgroup " + req.body.abcdee);
            var searchKeyword = req.body.abcdee;
            if (searchKeyword == ""){
                if(req.session.roleId == this.constants.getFOroleId()){
                    if(req.session.browser == "mobile") {
                        res.render('Mobile/loanrecoveryLoans',{loanDetails : loanDetails,searchResult : searchResult, errorLabel : "Please enter group name to search",roleId : req.session.roleId,constantsObj : constantsObj , contextPath:props.contextPath});
                    }else{
                        res.render('loan_recovery/loanrecoveryLoans',{loanDetails : loanDetails,searchResult : searchResult, errorLabel : "Please enter group name to search",roleId : req.session.roleId,constantsObj : constantsObj , contextPath:props.contextPath});
                    }
                }else{
                    res.render('loan_recovery/serachResult',{searchResult : searchResult, errorLabel :  "Please enter group name to search",roleId : req.session.roleId,constantsObj : constantsObj, contextPath:props.contextPath});
                }
            }
            else {
                var self = this;
                var officeId;
                var personnelId;
                var roleId;
                if(req.session.roleId == constantsObj.getFOroleId() ) {
                    officeId 	=  req.session.officeId;
                    personnelId	=  req.session.userId;
                }else if (req.session.roleId == this.constants.getSMHroleId() || req.session.roleId == this.constants.getNaiveroleId() || req.session.roleId == this.constants.getAMHroleId() ) {
                    officeId 	=  -1;
                    personnelId	= (req.session.officeId == constantsObj.getApexHeadOffice)?-1:req.session.userId;
                }
                else if (req.session.roleIds.indexOf(this.constants.getCCEroleId())>-1) {  // for display all
                    officeId 	= -1;
                    personnelId	= req.session.userId;
                }
                else {
                    officeId 	=  req.session.officeId;
                    personnelId	=  -1;
                }


                var repayLoanHolderObj = require(loanRecoveryDtoPath +"/paymentCollectionImageHolder");
                var repayLoanHolder = new repayLoanHolderObj();
                repayLoanHolder.setOfficeId(officeId);
                repayLoanHolder.setPersonnelId(personnelId);
                repayLoanHolder.setSearchString(searchKeyword);

                var jsonArray = JSON.stringify(repayLoanHolder);

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
                    path: "/mfi/api/loan/searchGroup.json",
                    method: 'POST',
                    headers : postheaders
                };
                rest.postJSON(options,jsonArray,function(statuscode,result,headers){
                    customlog.info("statuscode" + statuscode);
                    customlog.info("HEADERS:  "+headers)
                    if(statuscode == 302){
                        res.redirect(props.contextPath+'/client/ci/logout');
                    }else if(statuscode == 400){
                        self.commonRouter.showErrorPage(req,res);
                    }
                    else if(result.status == "success") {
                        if (result.groupList.length == 0){
                            if(req.session.roleId == constantsObj.getFOroleId()){
                                if(req.session.browser == "mobile") {
                                    res.render('Mobile/loanrecoveryLoans',{loanDetails : loanDetails,searchResult : searchResult, errorLabel : "No groups found", roleId : req.session.roleId,constantsObj : constantsObj , contextPath:props.contextPath});
                                }else{
                                    res.render('loan_recovery/loanrecoveryLoans',{loanDetails : loanDetails,searchResult : searchResult, errorLabel : "No groups found", roleId : req.session.roleId,constantsObj : constantsObj , contextPath:props.contextPath});
                                }
                            }else{
                                res.render('loan_recovery/serachResult',{searchResult : searchResult, errorLabel :  "No groups found",roleId : req.session.roleId,constantsObj : constantsObj, contextPath:props.contextPath});
                            }
                        }
                        else{
                            for(var i = 0; i < result.groupList.length; i++) {

                                var LoanRepaymentForFO1 = require(loanRecoveryDtoPath +"/CustomerDetailDto");
                                var LoanRepaymentForFO = new LoanRepaymentForFO1();
                                LoanRepaymentForFO.setCustomerId(result.groupList[i].customerId);
                                LoanRepaymentForFO.setDisplayName(result.groupList[i].displayName);
                                LoanRepaymentForFO.setGlobalCustNum(result.groupList[i].globalCustNum);
                                LoanRepaymentForFO.setLoanOfficerName(result.groupList[i].loanOfficerName);
                                LoanRepaymentForFO.setOfficeName(result.groupList[i].officeName);
                                LoanRepaymentForFO.setGroupCode(result.groupList[i].customerCustomNum);


                                searchResult[i] = LoanRepaymentForFO;
                            }

                            if(req.session.roleId == constantsObj.getFOroleId()){
                                if(req.session.browser == "mobile") {
                                    res.render('Mobile/loanrecoveryLoans',{loanDetails : loanDetails,searchResult : searchResult, errorLabel : "", roleId : req.session.roleId,constantsObj : constantsObj, contextPath:props.contextPath});
                                }else{
                                    res.render('loan_recovery/loanrecoveryLoans',{loanDetails : loanDetails,searchResult : searchResult, errorLabel : "", roleId : req.session.roleId,constantsObj : constantsObj, contextPath:props.contextPath});
                                }
                            }else{
                                res.render('loan_recovery/serachResult',{searchResult : searchResult, errorLabel : "",roleId : req.session.roleId,constantsObj : constantsObj, contextPath:props.contextPath});
                            }
                        }
                    } else {
                        self.commonRouter.showErrorPage(req,res);
                    }
                });
            }
        }catch(e){
            customlog.error("Exception while search "+e);
            self.commonRouter.showErrorPage(req,res);
        }
    },
    syncmifosgroupdetails : function(req, res) {
        try{
            var self = this;
            customlog.info("Inside Router authLogin");
            var userName = req.body.userName;
            var password = req.body.password;

            //var userName = "karthikeyan";
            //var password = "karthi123";

            this.authLoginPage(userName,password,function(usersObj,roleObj){
                customlog.info("inside android service syncmifosgroupdetails");
                req.session.fromAndroid = true;
                self.showHomePage(req,res,usersObj,roleObj);
            });
        }catch(e){
            customlog.error("Exception while Sync Mifos Group Details "+e);
            self.commonRouter.showErrorPage(req,res);
        }
    },
    revertPaymentList : function(req,res){
        try{
            var self = this;
            var officeId;
            var personnelId;
            var roleId;
            if(typeof (req.session.tenantId) == 'undefined' || typeof (req.session.userId) == 'undefined') {
                res.redirect(props.contextPath+'/client/ci/login');
            }else{
                if(req.session.roleId == this.constants.getFOroleId() ) {
                    officeId 	=  req.session.officeId;
                    personnelId	=  req.session.userId;
                }else if (req.session.roleId == this.constants.getSMHroleId() ) {
                    officeId 	=  -1;
                    personnelId	=  -1;
                }
                //else if (req.session.roleId == this.constants.getAccountsExecutiveRoleId() ) {
                else  {
                    officeId 	=  req.session.officeId;
                    personnelId	=  -1;
                }
                customlog.info("officeId" + officeId);
                customlog.info("personnelId" + personnelId);

                var repayLoanHolderObj = require(loanRecoveryDtoPath +"/paymentCollectionImageHolder");
                var repayLoanHolder = new repayLoanHolderObj();
                repayLoanHolder.setOfficeId(officeId);
                repayLoanHolder.setPersonnelId(personnelId);

                var jsonArray = JSON.stringify(repayLoanHolder);

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
                    path: '/mfi/api/account/loan/repayment/collection/revert/load.json',
                    method: 'POST',
                    headers : postheaders
                };
                rest.postJSON(options,jsonArray,function(statuscode,result,headers){
                    customlog.info("statuscode" + statuscode);
                    customlog.info("HEADERS:  "+headers)
                    //customlog.info("RESULT"+result);
                    var revertPaymentArray = new Array();
                    if(statuscode == 302){
                        res.redirect(props.contextPath+'/client/ci/logout');
                    }
                    else if(result.status == "success") {
                        if (result.paymentInfn.length == 0){
                            if(req.session.browser == "mobile") {
                                res.render('Mobile/revertPayment',{revertPaymentArray : revertPaymentArray, errorLabel : "No payments made for the day" , contextPath:props.contextPath});
                            }else{
                                res.render('loan_recovery/revertPayment',{revertPaymentArray : revertPaymentArray, errorLabel : "No payments made for the day" , contextPath:props.contextPath});
                            }
                        }
                        else{
                            for(var i = 0; i < result.paymentInfn.length; i++) {
                                var revertPaymentFO1 = require(loanRecoveryDtoPath +"/PaymentCollectionDetailDto");
                                var revertPayment = new revertPaymentFO1();
                                revertPayment.setPaymentCollectionId(result.paymentInfn[i].paymentCollectionId);
                                revertPayment.setGroupName(result.paymentInfn[i].groupName);
                                revertPayment.setGroupId(result.paymentInfn[i].groupId);
                                revertPayment.setGlobalAccNum(result.paymentInfn[i].globalAccNum);
                                revertPayment.setModeOfPayment(result.paymentInfn[i].modeOfPayment);
                                revertPayment.setAmount(result.paymentInfn[i].amount);
                                revertPaymentArray[i] = revertPayment;
                            }
                            if(req.session.browser == "mobile") {
                                res.render('Mobile/revertPayment.jade',{revertPaymentArray : revertPaymentArray, errorLabel : "" , contextPath:props.contextPath, roleId: req.session.roleId});
                            }else{
                                res.render('loan_recovery/revertPayment.jade',{revertPaymentArray : revertPaymentArray, errorLabel : "" , contextPath:props.contextPath, roleId: req.session.roleId,constantsObj: self.constants});
                            }
                        }
                    } else {
                        self.commonRouter.showErrorPage(req,res);
                    }
                });
            }
        }catch(e){
            customlog.error("Exception while Revert payment list "+e);
            self.commonRouter.showErrorPage(req,res);
        }
    },
    revertPayment : function(req,res){
        try{
            var self = this;
            var paymentCollectionId = req.params.paymentCollectionId;
            customlog.info("paymentCollectionId =+-/*********" + paymentCollectionId);
            var rest = require("./rest.js");
            var http = require('http');
            var https = require('https');

            var revertPaymentClientListArray = new Array();
            var postheaders = {
                'Content-Type' : 'application/json',
                'Cookie' : req.session.mifosCookie
            };
            var options = {
                host: mifosServiceIP,
                port: mifosPort,
                path: "/mfi/api/account/loan/repayment/collection/revert/update-"+paymentCollectionId+".json",
                method: 'GET',
                headers : postheaders
            };
            rest.getJSON(options,function(statuscode,result,headers){
                customlog.info(statuscode);
                if(statuscode == 302){
                    res.redirect(props.contextPath+'/client/ci/logout');
                }
                else {
                    if(result.status == "success"){
                        var activityDetails = new Array(iklantPort, req.session.tenantId, req.session.userId, req.session.userName, req.originalUrl, req.connection.remoteAddress, "router.js", "revertPayment", "success", "Payment Verification", "PaymentCollectionId "+paymentCollectionId+" Reverted Successfully","update");
                        self.commonRouter.insertActivityLogModel(activityDetails);
                        req.body.status = "success";
                        res.send(req.body);
                    }
                    else {
                        self.commonRouter.showErrorPage(req,res);
                    }
                }
            });
        }catch(e){
            customlog.error("Exception While Revert payment "+e);
            self.commonRouter.showErrorPage(req,res);
        }
    },
    retrieveClientAmountDetails : function(req,res){
        try{
            customlog.info("Inside retrieveClientAmountDetails");
            var self = this;
            var paymentColectionId = req.body.paymentId;
            var revertPaymentClientListArray = new Array();
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
                path: "/mfi/api/account/loan/repayment/collection/revert/client-"+paymentColectionId+".json",
                method: 'GET',
                headers : postheaders
            };
            customlog.info("Path==" + options.path);
            rest.getJSON(options,function(statuscode,result,headers){
                customlog.info(statuscode);
                if(statuscode == 302){
                    res.redirect(props.contextPath+'/client/ci/logout');
                }
                else if(result.status == "success") {
                    for(var i = 0; i < result.paymentInfn.length; i++) {
                        var revertPaymentFO1 = require(loanRecoveryDtoPath +"/PaymentCollectionDetailDto");
                        var revertPayment = new revertPaymentFO1();
                        revertPayment.setClientName(result.paymentInfn[i].clientName);
                        revertPayment.setAmount(result.paymentInfn[i].amount);
                        revertPaymentClientListArray[i] = revertPayment;
                    }
                    req.body.clientList = revertPaymentClientListArray;
                    res.send(req.body);
                } else {
                    self.commonRouter.showErrorPage(req,res);
                }
            });
        }catch(e){
            customlog.error("Exception While retrive client Documents "+e);
            self.commonRouter.showErrorPage(req,res);
        }
    },
    chequeDepositList  : function(req,res){
        try{
            customlog.info("Inside chequeDepositList");
            var self = this;
            var chequeDepositListArray = new Array();
            var rest = require("./rest.js");
            var http = require('http');
            var https = require('https');
            if(typeof (req.session.tenantId) == 'undefined' || typeof (req.session.userId) == 'undefined') {
                res.redirect(props.contextPath+'/client/ci/login');
            }else{
                var postheaders = {
                    'Content-Type' : 'application/json',
                    'Cookie' : req.session.mifosCookie
                };
                var options = {
                    host: mifosServiceIP,
                    port: mifosPort,
                    path: "/mfi/api/account/loan/repayment/chequeDeposit/load-"+req.session.officeId+".json",
                    method: 'GET',
                    headers : postheaders
                };
                customlog.info("Path==" + options.path);
                rest.getJSON(options,function(statuscode,result,headers){
                    customlog.info(statuscode);
                    if(statuscode == 302){
                        res.redirect(props.contextPath+'/client/ci/logout');
                    }
                    else if(result.status == "success") {
                        //var activityDetails = new Array(iklantPort, req.session.tenantId, req.session.userId, req.session.userName, req.originalUrl, req.connection.remoteAddress, "router.js", "chequeDepositList", "success", "chequeDepositList", "chequeDepositList Successfully");
                        //self.commonRouter.insertActivityLogModel(activityDetails);
                        var glCodeId = new Array();
                        var glCode = new Array();
                        for(var i=0;i<result.glcodeList.length;i++){
                            glCodeId[i] = result.glcodeList[i].glcodeId;
                            glCode[i] = result.glcodeList[i].glcode + "-" + result.glcodeList[i].glname;
                        }
                        req.session.glCodeId = glCodeId;
                        req.session.glCode 	 = glCode;
                        for(var i = 0; i < result.chequeDepInfn.length; i++) {
                            var revertPaymentFO1 = require(loanRecoveryDtoPath +"/PaymentCollectionDetailDto");
                            var revertPayment = new revertPaymentFO1();
                            revertPayment.setPaymentCollectionId(result.chequeDepInfn[i].paymentCollectionId);
                            revertPayment.setGroupName(result.chequeDepInfn[i].groupName);
                            revertPayment.setGroupId(result.chequeDepInfn[i].groupId);
                            revertPayment.setGlobalAccNum(result.chequeDepInfn[i].globalAccNum);
                            revertPayment.setModeOfPayment(result.chequeDepInfn[i].modeOfPayment);
                            revertPayment.setAmount(result.chequeDepInfn[i].amount);
                            chequeDepositListArray[i] = revertPayment;
                        }
                        res.render('loan_recovery/chequedepositlist.jade',{chequeDepositListArray : chequeDepositListArray, contextPath:props.contextPath});
                    } else {
                        self.commonRouter.showErrorPage(req,res);
                    }
                });
            }
        }catch(e){
            customlog.error("Exception While Cheque deposit list "+e);
            self.commonRouter.showErrorPage(req,res);
        }
    },
    chequeDeposit : function(req,res){
        try{
            customlog.info("Inside chequeDepositList");
            var paymentCollectionId = req.body.paymentCollection;
            var groupName = req.body.groupName;
            var globalAccountNumber = req.body.globalAccountNum;
            var amount = req.body.amount;
            var self = this;
            //var activityDetails = new Array(iklantPort, req.session.tenantId, req.session.userId, req.session.userName, req.originalUrl, req.connection.remoteAddress, "router.js", "chequeDeposit", "success", "chequeDeposit", "chequeDeposit");
            //self.commonRouter.insertActivityLogModel(activityDetails);
            res.render('loan_recovery/chequedeposit.jade',{paymentCollectionId : paymentCollectionId ,groupName : groupName, contextPath:props.contextPath,
                globalAccountNumber : globalAccountNumber, amount : amount,
                glcodeId : req.session.glCodeId, glcodeName : req.session.glCode });
        }catch(e){
            customlog.error("Exception while Cheque Deposit List "+e);
            self.commonRouter.showErrorPage(req,res);
        }
    },
    doChequeDeposit : function(req,res){
        try{
            customlog.info("Inside Do chequeDeposit");
            var self = this;
            var chequeDeposit1 = require(loanRecoveryDtoPath +"/PaymentCollectionDetailDto");
            var chequeDeposit = new chequeDeposit1();
            chequeDeposit.setPaymentCollectionId(req.body.paymentCollection);
            chequeDeposit.setGlcodeId(req.body.sourceOfPay);
            if(typeof(req.body.chequeNumber) == 'undefined' | req.body.chequeNumber == '' |  req.body.chequeNumber== 'NULL'){
                chequeDeposit.setChequeNumber(null);
            }else{
                chequeDeposit.setChequeNumber(req.body.chequeNumber);
            }
            if(typeof(req.body.chequeDateName) == 'undefined' | req.body.chequeDateName == '' |  req.body.chequeDateName== 'NULL'){
                chequeDeposit.setChequeDate(null);
            }else{
                //chequeDeposit.setChequeDate(convertChequeDateIntoMifosFormat(req.body.chequeDateName));
                chequeDeposit.setChequeDateStr(req.body.chequeDateName);
            }
            var jsonArray = JSON.stringify(chequeDeposit);
            customlog.info("jsonArray for cheque bounce" + jsonArray);
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
                path: '/mfi/api/account/loan/repayment/chequeDeposit/update.json',
                method: 'POST',
                headers : postheaders
            };
            rest.postJSON(options,jsonArray,function(statuscode,result,headers){
                customlog.info("statuscode" + statuscode);
                customlog.info("HEADERS:  "+headers)
                customlog.info("RESULT"+result);
                var revertPaymentArray = new Array();
                if(statuscode == 302){
                    res.redirect(props.contextPath+'/client/ci/logout');
                }
                else {
                    customlog.info("Inside Cheque deposit status" + result.status);
                    if(result.status == "success"){
                        var activityDetails = new Array(iklantPort, req.session.tenantId, req.session.userId, req.session.userName, req.originalUrl, req.connection.remoteAddress, "router.js", "doChequeDeposit", "success", "doChequeDeposit", "ChequeNo "+ chequeDeposit.getChequeNumber() +" Deposited successfully","insert");
                        self.commonRouter.insertActivityLogModel(activityDetails);
                        req.body.status = result.status;
                        res.send(req.body);
                    }
                    else if(result.hasOwnProperty('error')){
                        req.body.status = result.status;
                        req.body.error = result.error;
                        res.send(req.body);
                    }else{
                        req.body.status = "errorpage";
                        res.send(req.body);
                    }
                }
            });
        }catch(e){
            customlog.error("Exception While Do cheque deposit "+e);
            self.commonRouter.showErrorPage(req,res);
        }
    },
    retrieveLoanOfficerList  : function(req,res){
        try{
            customlog.info("Inside chequeDepositList");
            var self = this;
            var PaymentCollectionArray = new Array();
            var personnelIdArray = new Array();
            var personnelNameArray = new Array();
            var rest = require("./rest.js");
            var http = require('http');
            var https = require('https');
            if(typeof (req.session.tenantId) == 'undefined' || typeof (req.session.userId) == 'undefined') {
                res.redirect(props.contextPath+'/client/ci/login');
            }else{
                var postheaders = {
                    'Content-Type' : 'application/json',
                    'Cookie' : req.session.mifosCookie
                };
                var options = {
                    host: mifosServiceIP,
                    port: mifosPort,
                    path: "/mfi/api/account/loan/office-"+req.session.officeId+".json",
                    method: 'GET',
                    headers : postheaders
                };
                //customlog.info("Path==" + options.path);
                rest.getJSON(options,function(statuscode,result,headers){
                    customlog.info(statuscode);
                    if(statuscode == 302) {
                        res.redirect(props.contextPath+'/client/ci/logout');
                    }
                    else if(result.status == "success") {
                        if(result.loanOfficerList.length == 0){
                            //var activityDetails = new Array(iklantPort, req.session.tenantId, req.session.userId, req.session.userName, req.originalUrl, req.connection.remoteAddress, "router.js", "retrieveLoanOfficerList", "success", "retrieveLoanOfficerList", "retrieveLoanOfficerList Successfully");
                            //self.commonRouter.insertActivityLogModel(activityDetails);
                            res.render('loan_recovery/PaymentVerification.jade',{PaymentCollectionArray : PaymentCollectionArray,personnelIdArray : req.session.personnelIdArray,personnelNameArray : req.session.personnelNameArray,officeId:req.session.officeId,personnelId : "0", contextPath:props.contextPath});
                        }
                        else{
                            //var activityDetails = new Array(iklantPort, req.session.tenantId, req.session.userId, req.session.userName, req.originalUrl, req.connection.remoteAddress, "router.js", "retrieveLoanOfficerList", "success", "retrieveLoanOfficerList", "retrieveLoanOfficerList Successfully");
                            //self.commonRouter.insertActivityLogModel(activityDetails);
                            for(var i=0;i<result.loanOfficerList.length;i++){

                                personnelIdArray [i] = result.loanOfficerList[i].personnelId;
                                personnelNameArray[i] = result.loanOfficerList[i].displayName;
                            }

                            req.session.personnelIdArray = personnelIdArray;
                            req.session.personnelNameArray = personnelNameArray;
                            res.render('loan_recovery/PaymentVerification.jade',{PaymentCollectionArray : PaymentCollectionArray,personnelIdArray : req.session.personnelIdArray,personnelNameArray : req.session.personnelNameArray,officeId:req.session.officeId,personnelId : "0", contextPath:props.contextPath});
                        }
                    } else {
                        self.commonRouter.showErrorPage(req,res);
                    }
                });
            }
        }catch(e){
            customlog.error("Exception while retrieve loan officer list "+e);
            self.commonRouter.showErrorPage(req,res);
        }
    },
    preclosure :  function(req,res) {
        try{
            customlog.info("Inside Preclosure");
            var self=this;
            var accountId = parseInt(req.body.accountId,10);
            var accountTypeId = req.body.accountTypeId;
            var globalAccountNum = req.body.globalAccountNum;
            var repayLoanHolder = require(loanRecoveryDtoPath +"/repayLoanHolder");
            var repayLoanHolder = new repayLoanHolder();
            var glCodesDTO = require(path.join(rootPath,"app_modules/dto/common/glcodes"));
            var glCodes = new glCodesDTO();
            var repayLoanDTOObj = require(loanRecoveryDtoPath +"/repayLoanDTO");
            var repayLoanDTO = new repayLoanDTOObj();
            customlog.info("req.session.mifosCookie" + req.session.mifosCookie);
            //var globalAccNum = '000100000024320';
            var globalAccNum = req.body.globalAccountNum;
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
                path: "/mfi/api/account/loan/preclose/load/num-"+globalAccNum+".json",
                method: 'GET',
                headers : postheaders
            };
            rest.getJSON(options,function(statuscode,result,headers){
                if(statuscode == 302){
                    res.redirect(props.contextPath+'/client/ci/logout');
                }
                else if(result.status == "success") {
                    console.log(result);
                    var lastDayBookClosedDate = result.lastClosingDate;
                    repayLoanHolder.setDisbursementDate(convertToDateWithSlash(result.repayLoanDetails.lastPaymentDate));
                    repayLoanHolder.setAccountId(result.repayLoanDetails.accountId);
                    repayLoanHolder.setDateOfPayment(result.repayLoanDetails.dateOfPayment);
                    repayLoanHolder.setWaiverInterest(result.repayLoanDetails.waiverInterest);
                    repayLoanHolder.setWaiverInterestSelected(result.repayLoanDetails.waiverInterestSelected);
                    if(result.repayLoanDetails.waiverInterest && result.repayLoanDetails.waiverInterestSelected ){
                        repayLoanHolder.setAmount(result.repayLoanDetails.waivedRepaymentMoney);
                        glCodes.setChecked(true);
                    }else{
                        repayLoanHolder.setAmount(result.repayLoanDetails.earlyRepaymentMoney);
                        glCodes.setChecked(false);
                    }
                    repayLoanHolder.setWaivedRepaymentMoney(result.repayLoanDetails.waivedRepaymentMoney);
                    repayLoanHolder.setEarlyRepaymentMoney(result.repayLoanDetails.earlyRepaymentMoney);
                    repayLoanHolder.setVoucherNumberIfBank(result.repayLoanDetails.voucherNumberIfBank);
                    repayLoanHolder.setVoucherNumberIfCash(result.repayLoanDetails.voucherNumberIfCash);
                    var glCodeId = new Array();
                    var glCode = new Array();
                    var cashOrBank = new Array();
                    if(result.repayLoanDetails.glcodeList != null) {
                        for(var i=0;i<result.repayLoanDetails.glcodeList.length;i++){
                            glCodeId[i] = result.repayLoanDetails.glcodeList[i].glcodeId;
                            glCode[i] = result.repayLoanDetails.glcodeList[i].glcode + "-" + result.repayLoanDetails.glcodeList[i].glname;
                            cashOrBank[i] = result.repayLoanDetails.glcodeList[i].cashOrBank;
                        }
                    }
                    customlog.info("glCodeId" + glCodeId);
                    customlog.info("glCode" + glCode);
                    glCodes.setGlcodeId(glCodeId);
                    glCodes.setGlcode(glCode);
                    glCodes.setCashOrBank(cashOrBank);
                    glCodes.setGlobalAccNumber(globalAccNum);
                    res.render('loan_recovery/preclosure',{repayLoanHolder : repayLoanHolder,glCodes : glCodes,accountId : accountId,accountTypeId : accountTypeId ,groupName : req.session.groupCenterMifosName,lastDayBookClosedDate : lastDayBookClosedDate, contextPath:props.contextPath});
                } else {
                    self.commonRouter.showErrorPage(req,res);
                }
            });
        }catch(e){
            customlog.error("Exception while preclosure "+e);
            self.commonRouter.showErrorPage(req,res);
        }
    },

    retrievePreclosureInformation : function(req,res) {
        try{
            var self = this;
            var accountId = parseInt(req.body.accountId,10);
            var accountTypeId = req.body.accountTypeId;
            var globalAccountNum = req.body.globalAccountNum;
            var globalAccountNumber = req.body.globalAccNumber;
            var dateOfTransaction = req.body.dOTransaction;
            var lastPaymentDate = req.body.lastPaymentDate;
            customlog.info("lastPaymentDate"  +lastPaymentDate);
            var repayLoanHolderObj = require(loanRecoveryDtoPath +"/repayLoanHolder");
            var repayLoanHolder = new repayLoanHolderObj();
            var glCodesDTO = require(path.join(rootPath,"app_modules/dto/common/glcodes"));
            var glCodes = new glCodesDTO();
            var repayLoanDTOObj = require(loanRecoveryDtoPath +"/repayLoanDTO");
            var repayLoanDTO = new repayLoanDTOObj();


            repayLoanHolder.setDateOfPayment(dateOfTransaction);
            var jsonArray = JSON.stringify(repayLoanHolder);
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
                path: "/mfi/api/account/loan/preclose/reload/num-"+globalAccountNumber+".json",
                method: 'POST',
                headers : postheaders
            };
            rest.postJSON(options,jsonArray,function(statuscode,result,headers){
                customlog.info("statuscode" + statuscode);
                customlog.info("result" + result);
                customlog.info("headers" + headers);
                if(statuscode == 302){
                    res.redirect(props.contextPath+'/client/ci/logout');
                }
                else if(result.status == "success") {
                    //var activityDetails = new Array(iklantPort, req.session.tenantId, req.session.userId, req.session.userName, req.originalUrl, req.connection.remoteAddress, "router.js", "retrievePreclosureInformation", "success", "Preclosure", "retrievePreclosureInformation");
                    //self.commonRouter.insertActivityLogModel(activityDetails);
                    var lastDayBookClosedDate = result.lastClosingDate;
                    customlog.info("dateOfPaymentinpostmethod" + lastPaymentDate);
                    repayLoanHolder.setDisbursementDate(lastPaymentDate);
                    repayLoanHolder.setAccountId(result.repayLoanDetails.accountId);
                    repayLoanHolder.setDateOfPayment(result.repayLoanDetails.dateOfPayment);
                    repayLoanHolder.setWaiverInterest(result.repayLoanDetails.waiverInterest);
                    repayLoanHolder.setWaiverInterestSelected(result.repayLoanDetails.waiverInterestSelected);
                    if(result.repayLoanDetails.waiverInterest && result.repayLoanDetails.waiverInterestSelected ){
                        repayLoanHolder.setAmount(result.repayLoanDetails.waivedRepaymentMoney);
                        glCodes.setChecked(true);
                    }else{
                        repayLoanHolder.setAmount(result.repayLoanDetails.earlyRepaymentMoney);
                        glCodes.setChecked(false);
                    }
                    //repayLoanDTO.setWaivedRepaymentMoney(result.repayLoanDetails.repayLoanDto.waivedRepaymentMoney);
                    //repayLoanDTO.setEarlyRepaymentMoney(result.repayLoanDetails.repayLoanDto.earlyRepaymentMoney);
                    //repayLoanHolder.setRepayLoanDto(repayLoanDTO);
                    repayLoanHolder.setWaivedRepaymentMoney(result.repayLoanDetails.waivedRepaymentMoney);
                    repayLoanHolder.setEarlyRepaymentMoney(result.repayLoanDetails.earlyRepaymentMoney);
                    repayLoanHolder.setVoucherNumberIfBank(result.repayLoanDetails.voucherNumberIfBank);
                    repayLoanHolder.setVoucherNumberIfCash(result.repayLoanDetails.voucherNumberIfCash);

                    var glCodeId = new Array();
                    var glCode = new Array();
                    var cashOrBank = new Array();

                    if(result.repayLoanDetails.glcodeList != null) {
                        for(var i=0;i<result.repayLoanDetails.glcodeList.length;i++){
                            glCodeId[i] = result.repayLoanDetails.glcodeList[i].glcodeId;
                            glCode[i] = result.repayLoanDetails.glcodeList[i].glcode + "-" + result.repayLoanDetails.glcodeList[i].glname;
                            cashOrBank[i] = result.repayLoanDetails.glcodeList[i].cashOrBank;
                        }
                    }
                    customlog.info("glCodeId" + glCodeId);
                    customlog.info("glCode" + glCode);
                    glCodes.setGlcodeId(glCodeId);
                    glCodes.setGlcode(glCode);
                    glCodes.setCashOrBank(cashOrBank);
                    glCodes.setGlobalAccNumber(globalAccountNumber);
                    res.render('loan_recovery/preclosure',{repayLoanHolder : repayLoanHolder,glCodes : glCodes,accountId : accountId,accountTypeId : accountTypeId ,groupName : req.session.groupCenterMifosName,lastDayBookClosedDate : lastDayBookClosedDate, contextPath:props.contextPath});
                } else {
                    self.commonRouter.showErrorPage(req,res);
                }
            });
        }catch(e){
            customlog.error("Exception while retrievePreclosureInformation "+e);
            self.commonRouter.showErrorPage(req,res);
        }
    },

    submitPreclosureInformation : function(req,res) {
        try{
            var self = this;
            var repayLoanHolderObj = require(loanRecoveryDtoPath +"/repayLoanHolder");
            var repayLoanHolder = new repayLoanHolderObj();
            var repayLoanDTOObj = require(loanRecoveryDtoPath +"/repayLoanDTO");
            var repayLoanDTO = new repayLoanDTOObj();
            var globalAccountNumber = req.body.globalAccNumber;
            customlog.info("req.body.voucherNumber="+req.body.voucherNumber);
            repayLoanHolder.setVoucherNumber(req.body.voucherNumber);
            repayLoanHolder.setAccountId(req.body.accountId);
            repayLoanHolder.setAmount(req.body.amount);
            repayLoanHolder.setDateOfPayment(req.body.dOTransaction);
            repayLoanHolder.setPaymentTypeId(req.body.paymentType);
            if(req.body.paymentType == 3){
                customlog.info("req.body.chequeNumber" + req.body.chequeNumber);
                if(typeof(req.body.chequeNumber) == 'undefined' | req.body.chequeNumber == '' |  req.body.chequeNumber== 'NULL'){
                    customlog.info("Inside Cheque Number");
                    repayLoanHolder.setReceiptNumber(null);

                }else{
                    customlog.info("ELse Cheque Number");
                    repayLoanHolder.setReceiptNumber(req.body.chequeNumber);
                }
                if(typeof(req.body.chequeDateName) == 'undefined' | req.body.chequeDateName == '' |  req.body.chequeDateName== 'NULL'){
                    customlog.info("Inside Cheque  Dtae");
                    repayLoanHolder.setReceiptDate(null);
                }else{
                    customlog.info("ELse Cheque Dtae");
                    repayLoanHolder.setReceiptDate(convertChequeDateIntoMifosFormat(req.body.chequeDateName));
                }
            }else{
                repayLoanHolder.setReceiptNumber(null);
                repayLoanHolder.setReceiptDate(null);
            }
            repayLoanHolder.setPaymentGLCode(req.body.sourceOfPay);
            repayLoanHolder.setWaivedRepaymentMoney(req.body.waivedrepaymentamount);
            repayLoanHolder.setEarlyRepaymentMoney(req.body.earlyRepaymentMoney);
            repayLoanHolder.setWaiverInterest(req.body.waiveInterestCheckboxId);
            //[Commented while changing to form submisson in to ajax call]
            /*if(typeof(req.body.waiveInterestCheckboxId) != 'undefined' & (req.body.waiveInterestCheckboxId == 'on')){
             repayLoanHolder.setWaiverInterest(true);
             }else{
             repayLoanHolder.setWaiverInterest(false);
             }*/

            var jsonArray = JSON.stringify(repayLoanHolder);

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
                path: "/mfi/api/account/loan/preclose/num-"+globalAccountNumber+".json",
                method: 'POST',
                headers : postheaders
            };
            rest.postJSON(options,jsonArray,function(statuscode,result,headers){
                customlog.info("statuscode" + statuscode);
                customlog.info("result" + result.status);
                customlog.info("headers" + headers);
                if(statuscode == 302){
                    res.redirect(props.contextPath+'/client/ci/logout');
                }
                else {
                    if(result.status == "success"){
                        var activityDetails = new Array(iklantPort, req.session.tenantId, req.session.userId, req.session.userName, req.originalUrl, req.connection.remoteAddress, "router.js", "submitPreclosureInformation", "success", "Apply Preclosure", "AccountId "+req.body.accountId+" PreclosureInformation saved successfully","insert");
                        self.commonRouter.insertActivityLogModel(activityDetails);
                        req.body.status = "success";
                        req.body.text = "Loan Preclosed Succesfully";
                        res.send(req.body);
                        //self.loanrecoveryloanaccounts(req,res);
                    }
                    else if(result.hasOwnProperty('errors')){
                        req.body.status = "failure";
                        req.body.error = result.errors[0];
                        res.send(req.body);
                    }else{
                        self.commonRouter.showErrorPage(req,res);
                    }
                }
            });
        }catch(e){
            customlog.error("Exception while submitPreclosureInformation "+e);
            self.commonRouter.showErrorPage(req,res);
        }
    },
    individualPreclosure :  function(req,res) {
        var self=this;
        try{
            customlog.info("Inside Individual Preclosure");
            var accountId = parseInt(req.body.accountId,10);
            var accountTypeId = req.body.accountTypeId;
            var globalAccNum = req.body.globalAccountNum;
            var clientList = new Array();
            var repayLoanHolderObj = require(loanRecoveryDtoPath +"/repayLoanHolder");
            var repayLoanHolder = new repayLoanHolderObj();
            var glCodesList = new Array();
            var cashOrBank = new Array();
            var lastDayBookClosedDate;
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
                path: "/mfi/api/account/loan/individual/preclose/load/num-"+globalAccNum+".json",
                method: 'GET',
                headers : postheaders
            };
            rest.getJSON(options,function(statuscode,result,headers){
                if(statuscode == 302){
                    res.redirect(props.contextPath+'/client/ci/logout');
                }
                else if(result.status == "success") {
                    for(var i=0;i<result.clientDetails.length;i++){
                        var repayLoanHolder = require(loanRecoveryDtoPath +"/repayLoanHolder");
                        var repayLoanHolder = new repayLoanHolder();
                        repayLoanHolder.setClientGlobalAccountNumberList(result.clientDetails[i].globalAccountNum);
                        repayLoanHolder.setClientNameList(result.clientDetails[i].clientName);
                        clientList[i] =  repayLoanHolder;
                    }
                    res.render('loan_recovery/individualPreclosure',{clientList : clientList ,selectedClientName : 0,repayLoanHolder : repayLoanHolder,glCodesList : glCodesList,cashOrBank : cashOrBank,accountId : accountId,accountTypeId : accountTypeId ,groupName : req.session.groupCenterMifosName,lastDayBookClosedDate : lastDayBookClosedDate,globalAccNum : globalAccNum, contextPath:props.contextPath});
                }
                else {
                    self.commonRouter.showErrorPage(req,res);
                }
            });
        }catch(e){
            customlog.error("Exception while Individual preclosure "+e);
            self.commonRouter.showErrorPage(req,res);
        }
    },
    retrieveIndividualLoanDetailsForPreclosure :  function(req,res) {
        var self = this;
        var repayLoanHolderObj = require(loanRecoveryDtoPath +"/repayLoanHolder");
        var repayLoanHolderPost = new repayLoanHolderObj();
        var dateOfTransaction = req.body.dOTransaction;
        console.log(typeof(req.body.dOTransaction));
        if(req.body.dOTransaction == "undefined"){
        }else{
            repayLoanHolderPost.setDateOfPayment(dateOfTransaction);
        }

        var jsonArray = JSON.stringify(repayLoanHolderPost);
        var clientList = new Array();
        var glCodesList = new Array();
        var accountId = parseInt(req.body.accountId,10);
        var accountTypeId = req.body.accountTypeId;
        var globalAccNum = req.body.globalAccountNum;


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
            path: "/mfi/api/account/loan/individual/preclose/reload/num-"+req.body.globalAccountNum+"/mem-"+req.body.clientName+".json",
            method: 'POST',
            headers : postheaders
        };
        rest.postJSON(options,jsonArray,function(statuscode,result,headers){
            customlog.info("statuscode" + statuscode);
            customlog.info("result" + result);
            customlog.info("headers" + headers);
            if(statuscode == 302){
                res.redirect(props.contextPath+'/client/ci/logout');
            }
            else if(result.status == "success") {
                var repayLoanHolderObj = require(loanRecoveryDtoPath +"/repayLoanHolder");
                var repayLoanHolder = new repayLoanHolderObj();
                console.log("Waived Interest Amount  : " + result.repayLoanDetails.waivedInterestAmount);

                var lastDayBookClosedDate = result.lastClosingDate;
                repayLoanHolder.setDisbursementDate(convertToDateWithSlash(result.repayLoanDetails.lastPaymentDate));
                repayLoanHolder.setAccountId(result.repayLoanDetails.accountId);
                repayLoanHolder.setDateOfPayment(result.repayLoanDetails.dateOfPayment);
                repayLoanHolder.setWaiverInterest(result.repayLoanDetails.waiverInterest);
                repayLoanHolder.setWaiverInterestSelected(result.repayLoanDetails.waiverInterestSelected);
                repayLoanHolder.setWaivedInterestAmount(result.repayLoanDetails.waivedInterestAmount);
                if(result.repayLoanDetails.waiverInterest && result.repayLoanDetails.waiverInterestSelected ){
                    repayLoanHolder.setAmount(result.repayLoanDetails.waivedRepaymentMoney);
                    repayLoanHolder.setChecked(true);
                }else{
                    repayLoanHolder.setAmount(result.repayLoanDetails.earlyRepaymentMoney);
                    repayLoanHolder.setChecked(false);
                }
                repayLoanHolder.setWaivedRepaymentMoney(result.repayLoanDetails.waivedRepaymentMoney);
                repayLoanHolder.setEarlyRepaymentMoney(result.repayLoanDetails.earlyRepaymentMoney);
                repayLoanHolder.setVoucherNumberIfBank(result.repayLoanDetails.voucherNumberIfBank);
                repayLoanHolder.setVoucherNumberIfCash(result.repayLoanDetails.voucherNumberIfCash);
                var cashOrBank = new Array();
                if(result.repayLoanDetails.glcodeList != null) {
                    for(var i=0;i<result.repayLoanDetails.glcodeList.length;i++){
                        var glCodesDTO = require(path.join(rootPath,"app_modules/dto/common/glcodes"));
                        var glCodes = new glCodesDTO();
                        glCodes.setGlcodeValue(result.repayLoanDetails.glcodeList[i].glcodeId);
                        glCodes.setGlcodeLabel(result.repayLoanDetails.glcodeList[i].glcode + "-" + result.repayLoanDetails.glcodeList[i].glname);
                        cashOrBank[i] = result.repayLoanDetails.glcodeList[i].cashOrBank;
                        glCodesList[i] = glCodes;
                    }
                }
                for(var i=0;i<result.clientDetails.length;i++){
                    var repayLoanHolder1 = require(loanRecoveryDtoPath +"/repayLoanHolder");
                    var repayLoanHolder1 = new repayLoanHolder1();
                    repayLoanHolder1.setClientGlobalAccountNumberList(result.clientDetails[i].globalAccountNum);
                    repayLoanHolder1.setClientNameList(result.clientDetails[i].clientName);
                    clientList[i] =  repayLoanHolder1;
                }
                res.render('loan_recovery/individualPreclosure',{clientList : clientList ,selectedClientName :req.body.clientName, repayLoanHolder : repayLoanHolder,glCodesList : glCodesList,accountId : accountId,cashOrBank : cashOrBank,accountTypeId : accountTypeId ,groupName : req.session.groupCenterMifosName,lastDayBookClosedDate : lastDayBookClosedDate,globalAccNum : globalAccNum, contextPath:props.contextPath});
            }
        });
    },

    submitIndividualPreclosure : function(req,res){
        res.setTimeout(0);
        var self = this;
        var repayLoanHolderObj = require(loanRecoveryDtoPath +"/repayLoanHolder");
        var repayLoanHolder = new repayLoanHolderObj();
        var globalAccountNumber = req.body.globalAccountNum;
        //customlog.info("req.body.voucherNumber="+req.body.voucherNumber);
        //repayLoanHolder.setVoucherNumber(req.body.voucherNumber);
        repayLoanHolder.setAccountId(req.body.accountId);
        repayLoanHolder.setAmount(req.body.amount);
        repayLoanHolder.setDateOfPayment(req.body.dOTransaction);
        repayLoanHolder.setPaymentTypeId(req.body.paymentType);
        if(req.body.paymentType == 3){
            customlog.info("req.body.chequeNumber" + req.body.chequeNumber);
            if(typeof(req.body.chequeNumber) == 'undefined' | req.body.chequeNumber == '' |  req.body.chequeNumber== 'NULL'){
                customlog.info("Inside Cheque Number");
                repayLoanHolder.setReceiptNumber(null);

            }else{
                customlog.info("ELse Cheque Number");
                repayLoanHolder.setReceiptNumber(req.body.chequeNumber);
            }
            if(typeof(req.body.chequeDateName) == 'undefined' | req.body.chequeDateName == '' |  req.body.chequeDateName== 'NULL'){
                customlog.info("Inside Cheque  Dtae");
                repayLoanHolder.setReceiptDate(null);
            }else{
                customlog.info("ELse Cheque Dtae");
                repayLoanHolder.setReceiptDate(convertChequeDateIntoMifosFormat(req.body.chequeDateName));
            }
        }else{
            repayLoanHolder.setReceiptNumber(null);
            repayLoanHolder.setReceiptDate(null);
        }
        repayLoanHolder.setPaymentGLCode(req.body.sourceOfPay);
        repayLoanHolder.setWaivedRepaymentMoney(req.body.waivedrepaymentamount);
        repayLoanHolder.setEarlyRepaymentMoney(req.body.earlyRepaymentMoney);
        repayLoanHolder.setWaiverInterest(req.body.waiveInterestCheckboxId);
        repayLoanHolder.setWaivedInterestAmount(req.body.waiverInterestAmount);
        console.log("Voucher Number " + req.body.voucherNumber);
        repayLoanHolder.setVoucherNumber(req.body.voucherNumber);
        var jsonArray = JSON.stringify(repayLoanHolder);
        console.log("jsonArray" + jsonArray);
        var rest = require("./rest.js");

        var http = require('http');
        var https = require('https');

        var postheaders = {
            'Content-Type' : 'application/json',
            'Content-Length' : Buffer.byteLength(jsonArray, 'utf8'),
            'Cookie' : req.session.mifosCookie
        };
        console.log("req.body.globalAccountNum " + req.body.globalAccountNum);
        console.log("req.body.clientName " + req.body.clientName);
        var options = {
            host: mifosServiceIP,
            port: mifosPort,
            path: "/mfi/api/account/loan/individual/preclose/num-"+req.body.globalAccountNum+"/mem-"+req.body.clientName+".json",
            method: 'POST',
            headers : postheaders
        };
        rest.postJSON(options,jsonArray,function(statuscode,result,headers){
            customlog.info("statuscode" + statuscode);
            customlog.info("result" + result.status);
            customlog.info("headers" + headers);
            if(statuscode == 302){
                res.redirect(props.contextPath+'/client/ci/logout');
            }
            else {
                if(result.status == "success"){
                    req.body.status = "success";
                    res.send(req.body);
                } else{
                    console.log(result);
                    req.body.status = "failure";
                    req.body.statusMessage = result.errors[0];

                    res.send(req.body);
                }
            }
        });

        //self.loanrecoveryloanaccounts(req,res);
    },
    //For Reverse Loan By Bask:1939
    reverse : function(req,res) {
        try{
            var self = this;
            customlog.info("req.session.mifosCookie" + req.session.mifosCookie);
            //var globalAccNum = req.body.globalAccountNum;
            var accountId = parseInt(req.body.accountId,10);
            var accountTypeId = req.body.accountTypeId;
            var globalAccountNum = req.body.globalAccountNum;
            customlog.info("globalAccNum" + globalAccountNum);
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
                path: "/mfi/api/account/loan/reverse/load/num-"+globalAccountNum+".json",
                method: 'GET',
                headers : postheaders
            };
            rest.getJSON(options,function(statuscode,result,headers){

                var reverseLoanHolderObj = require(loanRecoveryDtoPath +"/reverseLoanHolder");
                var reverseLoanHolder = new reverseLoanHolderObj();
                customlog.info("statuscode" + statuscode);
                customlog.info("result" + result);
                if(statuscode == 302){
                    res.redirect(props.contextPath+'/client/ci/logout');
                }
                else if(result.status == "success") {
                    //var activityDetails = new Array(iklantPort, req.session.tenantId, req.session.userId, req.session.userName, req.originalUrl, req.connection.remoteAddress, "router.js", "reverse", "success", "Loan Reversal","Loan Reversal made successfully","update");
                    //self.commonRouter.insertActivityLogModel(activityDetails);
                    reverseLoanHolder.setGlobalAccNumber(globalAccountNum);
                    reverseLoanHolder.setCustomerName(result.reverseLoanDetails.customerName);
                    reverseLoanHolder.setLoanOfficerName(result.reverseLoanDetails.loanOfficerName);
                    reverseLoanHolder.setDisbursalAmount(result.reverseLoanDetails.disbursalAmount);
                    reverseLoanHolder.setDisbursalDate(result.reverseLoanDetails.disbursalDate);
                    reverseLoanHolder.setNoOfPayments(result.reverseLoanDetails.noOfPayments);
                    reverseLoanHolder.setAmountPaid(result.reverseLoanDetails.amountPaid);
                    //reverseLoanHolder.setNotes(result.reverseLoanDetails.notes);
                    customlog.info("headers" + headers);
                    var actionDateArray = new Array();
                    var amountArray = new Array();
                    if(result.reverseLoanDetails.payments != null) {
                        for(var i=0;i<result.reverseLoanDetails.payments.length;i++){
                            actionDateArray[i] = convertToMifosDateFormat(result.reverseLoanDetails.payments[i].actionDate);
                            amountArray[i] = result.reverseLoanDetails.payments[i].total;
                        }
                    }
                    customlog.info("actionDateArray"  +actionDateArray);
                    reverseLoanHolder.setPaymentDate(actionDateArray);
                    customlog.info("amountArray" + amountArray);
                    reverseLoanHolder.setPaymentAmount(amountArray);
                    res.render('loan_recovery/LoanReversal.jade',{reverseLoanHolder : reverseLoanHolder,accountId : accountId,accountTypeId : accountTypeId ,groupName : req.session.groupCenterMifosName, contextPath:props.contextPath});
                } else {
                    self.commonRouter.showErrorPage(req,res);
                }
            });
        }catch(e){
            customlog.error("Exception while reverse "+e);
            self.commonRouter.showErrorPage(req,res);
        }
    },

    submitreverseInformation : function(req,res) {
        try{
            var self = this;
            customlog.info("req.session.mifosCookie" + req.session.mifosCookie);
            //var globalAccNum = '000100000019745';
            var globalAccNum = req.body.globalAccountNum;
            var notes = req.body.notes;

            var reverseLoanHolderObj = require(loanRecoveryDtoPath +"/reverseLoanHolder");
            var reverseLoanHolder = new reverseLoanHolderObj();
            reverseLoanHolder.setNotes(notes);

            var jsonArray = JSON.stringify(reverseLoanHolder);

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
                path: "/mfi/api/account/loan/reverse/num-"+globalAccNum+".json",
                method: 'POST',
                headers : postheaders
            };
            rest.postJSON(options,jsonArray,function(statuscode,result,headers){
                customlog.info("statuscode" + statuscode);
                customlog.info("result" + result);
                customlog.info("headers" + headers);
                if(statuscode == 302){
                    res.redirect(props.contextPath+'/client/ci/logout');
                }
                else {
                    if(result.status == "success"){
                        var activityDetails = new Array(iklantPort, req.session.tenantId, req.session.userId, req.session.userName, req.originalUrl, req.connection.remoteAddress, "router.js", "submitreverseInformation", "success", "Loan Reversal", "Accno "+globalAccNum+" Loan Reversal Done successfully","update");
                        self.commonRouter.insertActivityLogModel(activityDetails);
                        self.loanrecoveryloanaccounts(req,res);
                    }
                    else {
                        self.commonRouter.showErrorPage(req,res);
                    }
                }
            });
        }catch(e){
            customlog.error("Exception while submitreverse information "+e);
            self.commonRouter.showErrorPage(req,res);
        }
    },

    loanrecoveryactiveoffices :function(req, res){
        var self = this;
        if(typeof (req.session.tenantId) == 'undefined' || typeof (req.session.userId) == 'undefined') {
            res.redirect(props.contextPath+'/client/ci/login');
        }else{
            //var activityDetails = new Array(iklantPort, req.session.tenantId, req.session.userId, req.session.userName, req.originalUrl, req.connection.remoteAddress, "router.js", "loanrecoveryactiveoffices", "success", "loanrecoveryactiveoffices", "loanrecoveryactiveoffices");
            //self.commonRouter.insertActivityLogModel(activityDetails);
            self.activeofficeslist(req,res,"");
        }
    },

    activeofficeslist : function(req,res,errmsg){
        try{
            var self = this;
            var constantsObj = this.constants;
            if(req.session.roleId == constantsObj.getSMHroleId()){
                req.session.viasmh = 1;
                var rest = require("./rest.js");
                var http = require('http');
                var https = require('https');
                var cookie = req.session.mifosCookie;
                customlog.info("Cookie:"+req.session.mifosCookie);
                if(typeof cookie == 'undefined') {
                    res.redirect(props.contextPath+'/client/ci/login');
                } else {
                    var postheaders = {
                        'Content-Type' : 'application/json',
                        'Content-Length' : Buffer.byteLength("", 'utf8'),
                        'Cookie' : req.session.mifosCookie
                    };

                    var options = {
                        host: mifosServiceIP,
                        port: mifosPort,
                        path: '/mfi/loan/retrieveActiveBranchOffices.json',
                        method: 'POST',
                        headers : postheaders
                    };

                    var resuStatus;
                    rest.postJSON(options,"",function(statuscode,result,headers){
                        customlog.info("statuscode" + statuscode);
                        customlog.info("HEADERS:  "+headers)
                        customlog.info("RESULT"+result);
                        resuStatus = result.status;
                        var officeId = new Array();
                        var officeName = new Array();
                        if(statuscode == 302){
                            res.redirect(props.contextPath+'/client/ci/logout');
                        }else{
                            if(resuStatus == 'success'){
                                //var activityDetails = new Array(iklantPort, req.session.tenantId, req.session.userId, req.session.userName, req.originalUrl, req.connection.remoteAddress, "router.js", "activeofficeslist", "success", "LoanRecoveryActiveOfficeList", "activeofficeslist");
                                //self.commonRouter.insertActivityLogModel(activityDetails);
                                customlog.info(result.officeList);
                                if(result.officeList != null) {
                                    for(var item = 0; item < result.officeList.length; item++){
                                        customlog.info(result.officeList[item].officeId);
                                        customlog.info(result.officeList[item].officeName);
                                        officeId[item] = result.officeList[item].officeId;
                                        officeName[item] = result.officeList[item].officeName;
                                    }
                                }

                                res.render('loan_recovery/LoanRecoveryActiveOfficeList',{officeId:officeId,officeName:officeName,errmsg:errmsg, contextPath:props.contextPath});
                            }
                            else{
                                self.commonRouter.showErrorPage(req,res);
                            }
                        }
                    });
                }
            }
            else {
                req.session.viasmh = 0;
                self.loanrecoveryloanofficer(req,res);
            }
        }catch(e){
            customlog.error("Exception while active office list "+e);
            self.commonRouter.showErrorPage(req,res);
        }
    },

    loanrecoveryloanofficer :function(req, res){
        var self = this;
        //var activityDetails = new Array(iklantPort, req.session.tenantId, req.session.userId, req.session.userName, req.originalUrl, req.connection.remoteAddress, "router.js", "loanrecoveryloanofficer", "success", "loanrecoveryloanofficer", "loanrecoveryloanofficer");
        //self.commonRouter.insertActivityLogModel(activityDetails);
        if(typeof req.body.officeId != 'undefined'){
            req.session.officeId = req.body.officeId;
        }
        self.loanOfficerListCall(req,res,"",req.session.viasmh);
    },

    loanOfficerListCall : function (req, res,errMsg,viasmh) {
        try{
            var self = this;
            var constantsObj = this.constants;
            var loanOfficerId = new Array();
            var loanOfficerName = new Array();
            var officeId = req.session.officeId;
            var userId = req.session.userId;
            customlog.info("req.session.roleId ==== "+req.session.roleId);
            req.session.viaLoanOfficer = 0;
            if(req.session.roleId == constantsObj.getFOroleId()) {
                self.loanrecoverygrouplist(req,res);
            }
            else{
                var rest = require("./rest.js");
                var office = JSON.stringify({
                    officeId : officeId});
                var http = require('http');
                var https = require('https');
                var cookie = req.session.mifosCookie;
                customlog.info("Cookie:"+req.session.mifosCookie);
                if(typeof cookie == 'undefined' || typeof officeId == 'undefined') {
                    res.redirect(props.contextPath+'/client/ci/login');
                } else {
                    var postheaders = {
                        'Content-Type' : 'application/json',
                        'Content-Length' : Buffer.byteLength(office, 'utf8'),
                        'Cookie' : req.session.mifosCookie
                    };

                    var options = {
                        host: mifosServiceIP,
                        port: mifosPort,
                        path: '/mfi/loan/retrieveLoanOfficer.json',
                        method: 'POST',
                        headers : postheaders
                    };

                    var resuStatus;
                    rest.postJSON(options,office,function(statuscode,result,headers){
                        customlog.info("statuscode" + statuscode);
                        customlog.info("HEADERS:  "+headers)
                        customlog.info("RESULT"+result);
                        resuStatus = result.status;
                        if(statuscode == 302){
                            res.redirect(props.contextPath+'/client/ci/logout');
                        }else{
                            if(resuStatus == 'success'){
                                //var activityDetails = new Array(iklantPort, req.session.tenantId, req.session.userId, req.session.userName, req.originalUrl, req.connection.remoteAddress, "router.js", "loanOfficerListCall", "success", "loanOfficerListCall", "loanOfficerListCall");
                                //self.commonRouter.insertActivityLogModel(activityDetails);
                                customlog.info(result.loanOfficerList);
                                if(result.loanOfficerList != null) {
                                    for(var item = 0; item < result.loanOfficerList.length; item++){
                                        customlog.info(result.loanOfficerList[item].loanOfficerId);
                                        customlog.info(result.loanOfficerList[item].loanOfficerName);
                                        loanOfficerId[item] = result.loanOfficerList[item].loanOfficerId;
                                        loanOfficerName[item] = result.loanOfficerList[item].loanOfficerName;
                                    }
                                }
                                customlog.info("roleId==========="+req.session.roleId);
                                customlog.info("mifosLoanOfficerId==========="+req.session.mifosLoanOfficerId);
                                req.session.viaLoanOfficer = 1;
                                if(loanOfficerId.length == 0) {
                                    self.activeofficeslist(req,res,"No loan officers available.");
                                }
                                else {
                                    self.showLoanRecoveryLoanOfficer(req,res,loanOfficerId,loanOfficerName,errMsg,viasmh);
                                }

                            }else{
                                self.commonRouter.showErrorPage(req,res);
                            }
                        }
                    });
                }
            }
        }catch(e){
            customlog.error("Exception while loan office list call "+e);
            self.commonRouter.showErrorPage(req,res);
        }
    },

    showLoanRecoveryLoanOfficer: function(req,res,loanOfficerId,loanOfficerName,errMsg,viasmh) {
        var self = this;
        res.render('loan_recovery/LoanRecoveryLoanOfficer',{loanOfficerId: loanOfficerId,loanOfficerName:loanOfficerName,errMsg:errMsg,viasmh:viasmh, contextPath:props.contextPath});
    },

    loanrecoverygrouplist :function(req, res){
        try{
            var self = this;
            var viaLoanOfficer = true;
            var loanOfficerId = req.params.loanOfficerId;
            if(typeof loanOfficerId == 'undefined') {
                loanOfficerId = req.session.mifosLoanOfficerId;
                viaLoanOfficer = false;
            }
            var officeId = req.session.officeId;
            customlog.info("loanOfficerId == "+loanOfficerId);
            self.groupListCall(officeId,loanOfficerId,req,res,"",req.session.viaLoanOfficer);
        }catch(e){
            customlog.error("Exception while loanrecoverygrouplist "+e);
            self.commonRouter.showErrorPage(req,res);
        }
    },

    showLoanRecoveryGroupList: function(req,res,groupId,groupName,globalCustomerNum,errorMsg,viaLoanOfficer) {
        res.render('loan_recovery/LoanRecoveryGroupList',{groupId: groupId,groupName:groupName,globalCustomerNum:globalCustomerNum,errorMsg:errorMsg,viaLoanOfficer:viaLoanOfficer, contextPath:props.contextPath});
    },

    groupListCall : function(officeId,loanOfficerId,req,res,errorMsg,viaLoanOfficer){
        try{
            var groupId = new Array();
            var groupName = new Array();
            var globalCustomerNum = new Array();
            var self = this;
            var rest = require("./rest.js");
            var office = JSON.stringify({
                officeId : officeId,
                loanOfficerId : loanOfficerId});

            var http = require('http');
            var https = require('https');

            customlog.info("office:"+office);
            customlog.info("Cookie:"+req.session.mifosCookie);
            var cookie = req.session.mifosCookie;
            if(typeof cookie == 'undefined') {
                res.redirect(props.contextPath+'/client/ci/login');
            }
            else {
                var postheaders = {
                    'Content-Type' : 'application/json',
                    'Content-Length' : Buffer.byteLength(office, 'utf8'),
                    'Cookie' : req.session.mifosCookie
                };

                var options = {
                    host: mifosServiceIP,
                    port: mifosPort,
                    path: '/mfi/loan/retrieveGroup.json',
                    method: 'POST',
                    headers : postheaders
                };

                var resultStatus;
                rest.postJSON(options,office,function(statuscode,result,headers){
                    customlog.info("statuscode" + statuscode);
                    customlog.info("HEADERS:  "+headers)
                    customlog.info("RESULT"+result);
                    resultStatus = result.status;
                    customlog.info(result);
                    if(statuscode == 302){
                        res.redirect(props.contextPath+'/client/ci/logout');
                    }
                    else{
                        if(resultStatus == 'success'){
                            //var activityDetails = new Array(iklantPort, req.session.tenantId, req.session.userId, req.session.userName, req.originalUrl, req.connection.remoteAddress, "router.js", "groupListCall", "success", "groupListCall", "groupListCall");
                            //self.commonRouter.insertActivityLogModel(activityDetails);
                            if(result.groupList != null) {
                                for(var item = 0; item < result.groupList.length; item++){
                                    customlog.info(result.groupList[item].customerId);
                                    customlog.info(result.groupList[item].displayName);
                                    groupId[item] = result.groupList[item].customerId;
                                    groupName[item] = result.groupList[item].displayName;
                                    globalCustomerNum[item] = result.groupList[item].globalCustNum;
                                }
                            }

                            /*if(result.groupList.length==0){
                             self.loanOfficerListCall(req,res,"No Group created for this Loan officer");
                             }
                             else{*/
                            self.showLoanRecoveryGroupList(req,res,groupId,groupName,globalCustomerNum,errorMsg,viaLoanOfficer);
                            //}
                            //customlog.info('In Mifos successful office creation');
                        }else{
                            self.commonRouter.showErrorPage(req,res);
                        }
                    }
                });
            }
        }catch(e){
            customlog.error("Exception while group list call "+e);
            self.commonRouter.showErrorPage(req,res);
        }
    },

    loanrecoveryloanaccounts :function(req, res) {
        try{
            var loanOfficerName;
            var loanOfficerId;
            var createLoanCustomerId = (typeof req.body.customerId == 'undefined')?(typeof req.body.mifosGroupId)?req.body.mifosCustomerIdHidden:req.body.mifosGroupId:req.body.customerId;
            var status;
            var self = this;
            var globalCustNum = req.params.globalCustomerNum;
            var officeId = req.session.officeId;
            //req.session.groupCenterMifosName = req.body.groupName;
            var groupName = req.body.groupName;

            customlog.info("req.session.globalCustomerNum"+req.session.globalCustomerNum);

            if(typeof groupName != 'undefined'){
                req.session.groupCenterMifosName = groupName;
            }
            if(typeof groupName == 'undefined'){
                groupName = req.session.groupCenterMifosName;
            }
            if(typeof createLoanCustomerId != 'undefined'){
                req.session.createLoanCustomerId = createLoanCustomerId;
            }
            if(typeof createLoanCustomerId == 'undefined'){
                createLoanCustomerId = req.session.createLoanCustomerId;
            }
            if(typeof globalCustNum != 'undefined' & globalCustNum != 'undefined'){
                req.session.globalCustomerNum = globalCustNum;
            }
            if(typeof globalCustNum == 'undefined' | globalCustNum == 'undefined'){
                globalCustNum = req.session.globalCustomerNum;
            }
            var rest = require("./rest.js");
            var office = JSON.stringify({
                globalCustNum : globalCustNum});
            customlog.info("globalCustNum"+globalCustNum);
            customlog.info("Retrieve Group Loan Custom Num"+office);

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
                    'Content-Length' : Buffer.byteLength(office, 'utf8'),
                    'Cookie' : req.session.mifosCookie
                };

                var options = {
                    host: mifosServiceIP,
                    port: mifosPort,
                    path: '/mfi/loan/retrieveGroupLoan.json',
                    method: 'POST',
                    headers : postheaders
                };

                var resultStatus;
                rest.postJSON(options,office,function(statuscode,result,headers){
                    customlog.info("statuscode" + statuscode);
                    customlog.info("HEADERS:  "+headers);
                    resultStatus = result.status;
                    if(statuscode == 302){
                        res.redirect(props.contextPath+'/client/ci/logout');
                    }
                    else{
                        if(resultStatus == 'success'){
                            //var activityDetails = new Array(iklantPort, req.session.tenantId, req.session.userId, req.session.userName, req.originalUrl, req.connection.remoteAddress, "router.js", "loanrecoveryloanaccounts", "success", "loanrecoveryloanaccounts", "loanrecoveryloanaccounts");
                            //self.commonRouter.insertActivityLogModel(activityDetails);
                            loanOfficerId = result.loanList.loanOfficerId;
                            loanOfficerName = result.loanList.loanOfficerName;

                            //customlog.info("Length=="+result.loanList.loanAccountsInUse.length);
                            var globalAccountNum = new Array();
                            var prdOfferingName =  new Array();
                            var accountStateId  =  new Array();
                            var accountStateName  =  new Array();
                            var outstandingBalance  =  new Array();
                            var totalAmountDue  =  new Array();
                            var accountId  =  new Array();

                            var loanAccountInformation = require(loanRecoveryDtoPath +"/loanAccountInformation");
                            var activeLoanAccountInformation= new loanAccountInformation();
                            //activeLoanAccountInformation.clearAll();
                            if(result.loanList.loanAccountsInUse != null) {
                                for(var item = 0; item < result.loanList.loanAccountsInUse.length; item++){
                                    customlog.info("Account Id "+result.loanList.loanAccountsInUse[item]. accountId);
                                    globalAccountNum[item] = result.loanList.loanAccountsInUse[item].globalAccountNum;
                                    prdOfferingName[item] = result.loanList.loanAccountsInUse[item].prdOfferingName;
                                    accountStateId[item] = result.loanList.loanAccountsInUse[item].accountStateId;
                                    accountStateName[item] = result.loanList.loanAccountsInUse[item].accountStateName;
                                    outstandingBalance[item] = result.loanList.loanAccountsInUse[item].outstandingBalance
                                    totalAmountDue[item] = result.loanList.loanAccountsInUse[item].totalAmountDue;
                                    accountId[item] = result.loanList.loanAccountsInUse[item].accountId;
                                }
                            }
                            activeLoanAccountInformation.setGlobalAccountNum(globalAccountNum);
                            activeLoanAccountInformation.setPrdOfferingName(prdOfferingName);
                            activeLoanAccountInformation.setAccountStateId(accountStateId);
                            activeLoanAccountInformation.setAccountStateName(accountStateName);
                            activeLoanAccountInformation.setOutstandingBalance(outstandingBalance);
                            activeLoanAccountInformation.setTotalAmountDue(totalAmountDue);
                            activeLoanAccountInformation.setAccountId(accountId);

                            globalAccountNum = [];
                            prdOfferingName = [];
                            accountStateId = [];
                            accountStateName = [];
                            outstandingBalance = [];
                            totalAmountDue = [];
                            accountId = [];
                            var closedLoanAccountsInformation=new loanAccountInformation();
                            closedLoanAccountsInformation.clearAll();
                            if(result.loanList.closedLoanAccounts != null) {
                                for(var item = 0; item < result.loanList.closedLoanAccounts.length; item++){
                                    globalAccountNum[item] = result.loanList.closedLoanAccounts[item].globalAccountNum;
                                    prdOfferingName[item] = result.loanList.closedLoanAccounts[item].prdOfferingName;
                                    accountStateId[item] = result.loanList.closedLoanAccounts[item].accountStateId;
                                    accountStateName[item] = result.loanList.closedLoanAccounts[item].accountStateName;
                                    outstandingBalance[item] = result.loanList.closedLoanAccounts[item].outstandingBalance
                                    totalAmountDue[item] = result.loanList.closedLoanAccounts[item].totalAmountDue;
                                    accountId[item] = result.loanList.closedLoanAccounts[item].accountId;

                                }
                            }
                            customlog.info("Closed Loan Account" + accountId);

                            closedLoanAccountsInformation.setGlobalAccountNum(globalAccountNum);
                            closedLoanAccountsInformation.setPrdOfferingName(prdOfferingName);
                            closedLoanAccountsInformation.setAccountStateId(accountStateId);
                            closedLoanAccountsInformation.setAccountStateName(accountStateName);
                            closedLoanAccountsInformation.setOutstandingBalance(outstandingBalance);
                            closedLoanAccountsInformation.setTotalAmountDue(totalAmountDue);
                            closedLoanAccountsInformation.setAccountId(accountId);

                            globalAccountNum = [];
                            prdOfferingName = [];
                            accountStateId = [];
                            accountStateName = [];
                            outstandingBalance = [];
                            totalAmountDue = [];

                            if(result.loanList.loanAccountsInUse.length==0 && result.loanList.closedLoanAccounts.length==0) {
                                //self.groupListCall(officeId,loanOfficerId,req,res,"No Loan Sanctioned for this Group",req.session.viaLoanOfficer);
                                res.render('loan_recovery/serachResult',{searchResult : new Array(), errorLabel :  "No Loan Accounts for that Group",roleId : req.session.roleId,constantsObj : this.constantsObj, contextPath:props.contextPath});
                            }
                            else{
                                self.showLoanRecoveryLoanAccountList(req,res,activeLoanAccountInformation,closedLoanAccountsInformation,loanOfficerName,loanOfficerId,createLoanCustomerId);
                            }
                        }else{
                            self.commonRouter.showErrorPage(req,res);
                        }
                    }
                });
            }
        }catch(e){
            customlog.error("Exception while loanrecoveryloanaccounts "+e);
            self.commonRouter.showErrorPage(req,res);
        }
    },

    showLoanRecoveryLoanAccountList: function(req,res,activeLoanAccountInformation,closedLoanAccountsInformation,loanOfficerName,loanOfficerId,createLoanCustomerId) {
        try{
            customlog.info("activeLoanAccountInformation"+activeLoanAccountInformation.getAccountId()[0]);
            var self = this;
            res.render('loan_recovery/LoanRecoveryLoanAccountList',{activeLoanAccountInformation:activeLoanAccountInformation,
                closedLoanAccountsInformation:closedLoanAccountsInformation,
                loanOfficerName:loanOfficerName, loanOfficerId:loanOfficerId,
                createLoanCustomerId:createLoanCustomerId, roleId:req.session.roleId,
                constantsObj:this.constants,groupName : req.session.groupCenterMifosName, contextPath:props.contextPath});
        }catch(e){
            customlog.error("Exception while showLoanRecoveryLoanAccountList "+e);
            self.commonRouter.showErrorPage(req,res);
        }
    },

    loanrecoveryloaninformation :function(req, res){
        try{
            var globalAccountNum = new Array();
            var prdOfferingName =  new Array();
            var accountStateId  =  new Array();
            var accountStateName  =  new Array();
            var outstandingBalance  =  new Array();
            var totalAmountDue  =  new Array();
            var loanOfficerName;
            var status;
            var self = this;
            var loanStatusId ;
            /*if(typeof loanStatusId != 'undefined'){
             req.session.loanStatusId = loanStatusId;
             }
             if(typeof loanStatusId == 'undefined'){
             loanStatusId = req.session.loanStatusId;
             }*/
            var globalAccNum = req.params.globalAccountNum;

            var globalCustomerNum  = req.body.mifosGlobalId;
            var createLoanCustomerId =  req.body.mifosGroupId;

            if(typeof globalCustomerNum != 'undefined'){
                req.session.globalCustomerNum = globalCustomerNum;
            }
            if(typeof globalCustomerNum == 'undefined'){
                globalCustomerNum = req.session.globalCustomerNum;
            }
            if(typeof createLoanCustomerId != 'undefined'){
                req.session.createLoanCustomerId = createLoanCustomerId;
            }
            if(typeof createLoanCustomerId == 'undefined'){
                createLoanCustomerId = req.session.createLoanCustomerId;
            }

            if(typeof globalAccNum != 'undefined'){
                req.session.globalAccNum = globalAccNum;
            }
            if(typeof globalAccNum == 'undefined'){
                globalAccNum = req.session.globalAccNum;
            }
            customlog.info("req.session.globalAccNum" + req.session.globalAccNum);
            customlog.info("globalAccNum" + globalAccNum);
            //var officeId = req.session.officeId;
            customlog.info("loanStatusId =============== "+loanStatusId);
            var rest = require("./rest.js");
            var accountNum = JSON.stringify({
                globalAccountNum : globalAccNum});

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
                    'Content-Length' : Buffer.byteLength(accountNum, 'utf8'),
                    'Cookie' : req.session.mifosCookie
                };

                var options = {
                    host: mifosServiceIP,
                    port: mifosPort,
                    path: '/mfi/loan/retrieveLoanInformation.json',
                    method: 'POST',
                    headers : postheaders
                };

                var resultStatus;
                rest.postJSON(options,accountNum,function(statuscode,result,headers){
                    customlog.info("statuscode" + statuscode);
                    customlog.info("HEADERS:  "+headers)
                    customlog.info("RESULT"+result);
                    resultStatus = result.status;
                    if(statuscode == 302){
                        res.redirect(props.contextPath+'/client/ci/logout');
                    }
                    else{
                        if(resultStatus == 'success'){
                            var loanAccountInformationDto = require(loanRecoveryDtoPath +"/loanAccountInformationDto");
                            var loanSummary = require(loanRecoveryDtoPath +"/loanSummary");
                            //var paidInstallment = require(loanRecoveryDtoPath +"/paidInstallment");
                            //var futureInstallment = require(loanRecoveryDtoPath +"/futureInstallment");
                            //var runningBalance = require(loanRecoveryDtoPath +"/runningBalance");
                            var RepaymentSchedule = require(loanRecoveryDtoPath +"/RepaymentSchedule");
                            var clientLoanAccountDetailsDto = require(loanRecoveryDtoPath +"/clientLoanAccountDetailsDto");
                            var RecentAccountActivity = require(loanRecoveryDtoPath +"/RecentAccountActivity");

                            var accountId = new Array();
                            var clientId = new Array();
                            var clientName = new Array();
                            var govermentId = new Array();
                            var loanPurpose = new Array();
                            var loanAmount = new Array();
                            var insured = new Array();
                            var individualTracked = new Array();
                            var businessActivity = new Array();
                            var businessActivityName = new Array();
                            var loanAccountId = new Array();
                            var loanGlobalAccountNum = new Array();
                            var parentLoanGlobalAccountNum = new Array();
                            var parentLoanAccountId = new Array();
                            var clientPaidInstallmentArray = new Array();
                            var clientDueInstallmentArray = new Array();
                            var clientFutureInstallmentArray = new Array();
                            var clientRunningBalanceArray = new Array();


                            var installmentId = new Array();
                            var actionDate = new Array();
                            var paymentDate = new Array();
                            var principal = new Array();
                            var interest = new Array();
                            var fees = new Array();
                            var penalty = new Array();
                            var total = new Array();
                            var runBalPrincipal = new Array();
                            var runBalInterest = new Array();
                            var runBalFees = new Array();
                            var runBalPenalty = new Array();
                            var totalRunBal = new Array();


                            var clientInstallmentId = new Array();
                            var clientActionDate = new Array();
                            var clientPaymentDate = new Array();
                            var clientPrincipal = new Array();
                            var clientInterest = new Array();
                            var clientFees = new Array();
                            var clientPenalty = new Array();
                            var clientTotal = new Array();
                            var clientRunBalPrincipal = new Array();
                            var clientRunBalInterest = new Array();
                            var clientRunBalFees = new Array();
                            var clientRunBalPenalty = new Array();
                            var clientTotalRunBal = new Array();


                            /*loanOfficerName = result.loanList.loanOfficerName
                             customlog.info(result.loanList.loanAccountsInUse);
                             customlog.info("Length=="+result.loanList.loanAccountsInUse.length);*/

                            /*accountId[item] = result.loanInfnList.loanInformationDto[item].accountId ;
                             globalAccountNum[item] = result.loanInfnList.loanInformationDto[item].globalAccountNum;
                             accountStateId[item] = result.loanInfnList.loanInformationDto[item].accountStateId;
                             accountStateName[item] = result.loanInfnList.loanInformationDto[item].accountStateName;
                             customerName[item] = result.loanInfnList.loanInformationDto[item].customerName;
                             globalCustNum[item] = result.loanInfnList.loanInformationDto[item].globalCustNum;
                             customerId[item] = result.loanInfnList.loanInformationDto[item].customerId;
                             prdOfferingName[item] = result.loanInfnList.loanInformationDto[item].prdOfferingName;
                             disbursementDate[item] = result.loanInfnList.loanInformationDto[item].disbursementDate;
                             officeName[item] = result.loanInfnList.loanInformationDto[item].officeName;
                             officeId[item] = result.loanInfnList.loanInformationDto[item].officeId;
                             personnelId[item] = result.loanInfnList.loanInformationDto[item].personnelId;
                             nextMeetingDate[item] = result.loanInfnList.loanInformationDto[item].nextMeetingDate;
                             totalAmountDue[item] = result.loanInfnList.loanInformationDto[item].totalAmountDue;
                             totalAmountInArrears[item] = result.loanInfnList.loanInformationDto[item].totalAmountInArrears;
                             individualTracked[item] = result.loanInfnList.loanInformationDto[item].individualTracked;*/

                            var loanAccInformationDto=new loanAccountInformationDto();
                            loanAccInformationDto.clearAll();
                            //customlog.info("result.loanInfnList.loanInformationDto.accountStateId======"+result.loanInfnList.loanInformationDto.accountStateId);
                            if(result.loanInfnList.loanInformationDto != null){
                                req.session.loanStatusId = result.loanInfnList.loanInformationDto.accountStateId;
                                loanStatusId = result.loanInfnList.loanInformationDto.accountStateId;
                                req.session.accountId = result.loanInfnList.loanInformationDto.accountId ;
                                req.session.accountStateName = result.loanInfnList.loanInformationDto.accountStateName;
                                loanAccInformationDto.setAccountId(result.loanInfnList.loanInformationDto.accountId);
                                loanAccInformationDto.setGlobalAccountNum(result.loanInfnList.loanInformationDto.globalAccountNum);
                                loanAccInformationDto.setAccountStateId(result.loanInfnList.loanInformationDto.accountStateId);
                                loanAccInformationDto.setAccountStateName(result.loanInfnList.loanInformationDto.accountStateName);
                                loanAccInformationDto.setCustomerName(result.loanInfnList.loanInformationDto.customerName);
                                loanAccInformationDto.setGlobalCustNum(result.loanInfnList.loanInformationDto.globalCustNum);
                                loanAccInformationDto.setCustomerId(result.loanInfnList.loanInformationDto.customerId);
                                loanAccInformationDto.setPrdOfferingName(result.loanInfnList.loanInformationDto.prdOfferingName);
                                loanAccInformationDto.setDisbursementDate(convertDate(result.loanInfnList.loanInformationDto.disbursementDate));
                                loanAccInformationDto.setAccountTypeId(result.loanInfnList.loanInformationDto.accountTypeId);
                                loanAccInformationDto.setOfficeName(result.loanInfnList.loanInformationDto.officeName);
                                loanAccInformationDto.setOfficeId(result.loanInfnList.loanInformationDto.officeId);
                                loanAccInformationDto.setPersonnelId(result.loanInfnList.loanInformationDto.personnelId);
                                loanAccInformationDto.setNextMeetingDate(result.loanInfnList.loanInformationDto.nextMeetingDate);
                                loanAccInformationDto.setTotalAmountDue(result.loanInfnList.loanInformationDto.totalAmountDue);
                                loanAccInformationDto.setTotalAmountInArrears(result.loanInfnList.loanInformationDto.totalAmountInArrears);
                                /*var individual_track;
                                 if(result.loanInfnList.loanInformationDto.individualTracked == "true" )
                                 individual_track = "Yes";
                                 else
                                 individual_track = "No"
                                 customlog.info("individual_track"+individual_track)*/
                                loanAccInformationDto.setIndividualTracked(result.loanInfnList.loanInformationDto.individualTracked);

                            }

                            var loanSummary=new loanSummary();
                            loanSummary.clearAll();
                            if(result.loanInfnList.loanInformationDto.loanSummary != null) {
                                loanSummary.setOriginalPrincipal(result.loanInfnList.loanInformationDto.loanSummary.originalPrincipal );
                                loanSummary.setPrincipalPaid(result.loanInfnList.loanInformationDto.loanSummary.principalPaid );
                                loanSummary.setPrincipalDue(result.loanInfnList.loanInformationDto.loanSummary.principalDue );
                                loanSummary.setOriginalInterest(result.loanInfnList.loanInformationDto.loanSummary.originalInterest );
                                loanSummary.setInterestPaid(result.loanInfnList.loanInformationDto.loanSummary.interestPaid );
                                loanSummary.setInterestDue(result.loanInfnList.loanInformationDto.loanSummary.interestDue );
                                loanSummary.setOriginalFees(result.loanInfnList.loanInformationDto.loanSummary.originalFees );
                                loanSummary.setFeesPaid(result.loanInfnList.loanInformationDto.loanSummary.feesPaid );
                                loanSummary.setFeesDue(result.loanInfnList.loanInformationDto.loanSummary.feesDue );
                                loanSummary.setOriginalPenalty(result.loanInfnList.loanInformationDto.loanSummary.originalPenalty );
                                loanSummary.setPenaltyPaid(result.loanInfnList.loanInformationDto.loanSummary.penaltyPaid );
                                loanSummary.setPenaltyDue(result.loanInfnList.loanInformationDto.loanSummary.penaltyDue );
                            }


                            //*****************************************Group Paid Installment***************************************************//

                            var paidInstallment=new RepaymentSchedule();
                            paidInstallment.clearAll();
                            //customlog.info(result.loanInfnList.loanInformationDto.loanRepaymentSchedule.paidInstallments.length);
                            if(result.loanInfnList.loanInformationDto.loanRepaymentSchedule.paidInstallments != null){
                                for(var item = 0; item < result.loanInfnList.loanInformationDto.loanRepaymentSchedule.paidInstallments.length; item++){
                                    installmentId[item] = result.loanInfnList.loanInformationDto.loanRepaymentSchedule.paidInstallments[item].installmentId;
                                    actionDate[item] = result.loanInfnList.loanInformationDto.loanRepaymentSchedule.paidInstallments[item].actionDate;
                                    paymentDate[item] = result.loanInfnList.loanInformationDto.loanRepaymentSchedule.paidInstallments[item].paymentDate;
                                    principal[item] = result.loanInfnList.loanInformationDto.loanRepaymentSchedule.paidInstallments[item].principal;
                                    interest[item] = result.loanInfnList.loanInformationDto.loanRepaymentSchedule.paidInstallments[item].interest;
                                    fees[item] = result.loanInfnList.loanInformationDto.loanRepaymentSchedule.paidInstallments[item].fees;
                                    penalty[item] = result.loanInfnList.loanInformationDto.loanRepaymentSchedule.paidInstallments[item].penalty;
                                    total[item] = result.loanInfnList.loanInformationDto.loanRepaymentSchedule.paidInstallments[item].total;
                                }
                            }

                            paidInstallment.setInstallmentId(installmentId);
                            paidInstallment.setActionDate(actionDate);
                            paidInstallment.setPaymentDate(paymentDate);
                            paidInstallment.setPrincipal(principal);
                            paidInstallment.setInterest(interest);
                            paidInstallment.setFees(fees);
                            paidInstallment.setPenalty(penalty);
                            paidInstallment.setTotal(total);
                            installmentId = [];
                            actionDate = [];
                            paymentDate = [];
                            principal = [];
                            interest = [];
                            fees = [];
                            penalty = [];
                            total = [];

                            //customlog.info("paidInstallment.getPrincipal()=="+paidInstallment.getPrincipal());


                            //***************************************Group Due Installment****************************************************//

                            var dueInstallment=new RepaymentSchedule();
                            dueInstallment.clearAll();
                            if(result.loanInfnList.loanInformationDto.loanRepaymentSchedule.dueInstallments != null){
                                for(var item = 0; item < result.loanInfnList.loanInformationDto.loanRepaymentSchedule.dueInstallments.length; item++){
                                    installmentId[item] = result.loanInfnList.loanInformationDto.loanRepaymentSchedule.dueInstallments[item].installmentId;
                                    actionDate[item] = result.loanInfnList.loanInformationDto.loanRepaymentSchedule.dueInstallments[item].actionDate;
                                    paymentDate[item] = result.loanInfnList.loanInformationDto.loanRepaymentSchedule.dueInstallments[item].paymentDate;
                                    principal[item] = result.loanInfnList.loanInformationDto.loanRepaymentSchedule.dueInstallments[item].principal;
                                    interest[item] = result.loanInfnList.loanInformationDto.loanRepaymentSchedule.dueInstallments[item].interest;
                                    fees[item] = result.loanInfnList.loanInformationDto.loanRepaymentSchedule.dueInstallments[item].fees;
                                    penalty[item] = result.loanInfnList.loanInformationDto.loanRepaymentSchedule.dueInstallments[item].penalty;
                                    total[item] = result.loanInfnList.loanInformationDto.loanRepaymentSchedule.dueInstallments[item].total;
                                }
                            }
                            dueInstallment.setInstallmentId(installmentId);
                            dueInstallment.setActionDate(actionDate);
                            dueInstallment.setPaymentDate(paymentDate);
                            dueInstallment.setPrincipal(principal);
                            dueInstallment.setInterest(interest);
                            dueInstallment.setFees(fees);
                            dueInstallment.setPenalty(penalty);
                            dueInstallment.setTotal(total);
                            installmentId = [];
                            actionDate = [];
                            paymentDate = [];
                            principal = [];
                            interest = [];
                            fees = [];
                            penalty = [];
                            total = [];

                            //***************************************Group Future Installment****************************************************//

                            var futureInstallment= new RepaymentSchedule();
                            futureInstallment.clearAll();

                            //customlog.info(result.loanInfnList.loanInformationDto.loanRepaymentSchedule.futureInstallment.length);
                            if(result.loanInfnList.loanInformationDto.loanRepaymentSchedule.futureInstallment != null) {
                                for(var item = 0; item < result.loanInfnList.loanInformationDto.loanRepaymentSchedule.futureInstallment.length; item++){
                                    installmentId[item] = result.loanInfnList.loanInformationDto.loanRepaymentSchedule.futureInstallment[item].installmentId;
                                    actionDate[item] = result.loanInfnList.loanInformationDto.loanRepaymentSchedule.futureInstallment[item].actionDate;
                                    paymentDate[item] = result.loanInfnList.loanInformationDto.loanRepaymentSchedule.futureInstallment[item].paymentDate;
                                    principal[item] = result.loanInfnList.loanInformationDto.loanRepaymentSchedule.futureInstallment[item].principal;
                                    interest[item] = result.loanInfnList.loanInformationDto.loanRepaymentSchedule.futureInstallment[item].interest;
                                    fees[item] = result.loanInfnList.loanInformationDto.loanRepaymentSchedule.futureInstallment[item].fees;
                                    penalty[item] = result.loanInfnList.loanInformationDto.loanRepaymentSchedule.futureInstallment[item].penalty;
                                    total[item] = result.loanInfnList.loanInformationDto.loanRepaymentSchedule.futureInstallment[item].total;
                                }
                            }


                            /*var futureStartValue = result.loanInfnList.loanInformationDto.loanRepaymentSchedule.dueInstallments.length;
                             var futureEndValue = result.loanInfnList.loanInformationDto.loanRepaymentSchedule.dueInstallments.length+result.loanInfnList.loanInformationDto.loanRepaymentSchedule.futureInstallment.length;
                             for(var item = futureStartValue; item < futureEndValue; item++){
                             customlog.info("Item Value = "+item);
                             installmentId[item] = result.loanInfnList.loanInformationDto.loanRepaymentSchedule.futureInstallment[item-futureStartValue].installmentId;
                             actionDate[item] = result.loanInfnList.loanInformationDto.loanRepaymentSchedule.futureInstallment[item-futureStartValue].actionDate;
                             paymentDate[item] = result.loanInfnList.loanInformationDto.loanRepaymentSchedule.futureInstallment[item-futureStartValue].paymentDate;
                             principal[item] = result.loanInfnList.loanInformationDto.loanRepaymentSchedule.futureInstallment[item-futureStartValue].principal;
                             interest[item] = result.loanInfnList.loanInformationDto.loanRepaymentSchedule.futureInstallment[item-futureStartValue].interest;
                             fees[item] = result.loanInfnList.loanInformationDto.loanRepaymentSchedule.futureInstallment[item-futureStartValue].fees;
                             penalty[item] = result.loanInfnList.loanInformationDto.loanRepaymentSchedule.futureInstallment[item-futureStartValue].penalty;
                             total[item] = result.loanInfnList.loanInformationDto.loanRepaymentSchedule.futureInstallment[item-futureStartValue].total;

                             }*/
                            futureInstallment.setInstallmentId(installmentId);
                            futureInstallment.setActionDate(actionDate);
                            futureInstallment.setPaymentDate(paymentDate);
                            futureInstallment.setPrincipal(principal);
                            futureInstallment.setInterest(interest);
                            futureInstallment.setFees(fees);
                            futureInstallment.setPenalty(penalty);
                            futureInstallment.setTotal(total);
                            installmentId = [];
                            actionDate = [];
                            paymentDate = [];
                            principal = [];
                            interest = [];
                            fees = [];
                            penalty = [];
                            total = [];
                            //customlog.info("paidInstallment.getPrincipal()=="+paidInstallment.getPrincipal());
                            //customlog.info("futureInstallment.getPrincipal()=="+futureInstallment.getPrincipal());

                            //***************************************** Running Balance **********************************************************************//

                            var runningBalance=new RepaymentSchedule();
                            runningBalance.clearAll();
                            //customlog.info(result.loanInfnList.loanInformationDto.loanRepaymentSchedule.runningBalance.length);
                            if(result.loanInfnList.loanInformationDto.loanRepaymentSchedule.runningBalance != null) {
                                for(var item = 0; item < result.loanInfnList.loanInformationDto.loanRepaymentSchedule.runningBalance.length; item++){
                                    runBalPrincipal[item] = result.loanInfnList.loanInformationDto.loanRepaymentSchedule.runningBalance[item].runBalPrincipal;
                                    runBalInterest[item] = result.loanInfnList.loanInformationDto.loanRepaymentSchedule.runningBalance[item].runBalInterest;
                                    runBalFees[item] = result.loanInfnList.loanInformationDto.loanRepaymentSchedule.runningBalance[item].runBalFees;
                                    runBalPenalty[item] = result.loanInfnList.loanInformationDto.loanRepaymentSchedule.runningBalance[item].runBalPenalty;
                                    totalRunBal[item] = result.loanInfnList.loanInformationDto.loanRepaymentSchedule.runningBalance[item].totalRunBal;
                                }
                            }

                            runningBalance.setRunBalPrincipal(runBalPrincipal);
                            runningBalance.setRunBalInterest(runBalInterest);
                            runningBalance.setRunBalFees(runBalFees);
                            runningBalance.setRunBalPenalty(runBalPenalty);
                            runningBalance.setTotalRunBal(totalRunBal);
                            runBalPrincipal = [];
                            runBalInterest = [];
                            runBalFees = [];
                            runBalPenalty = [];
                            totalRunBal = [];

                            //customlog.info("paidInstallment.getPrincipal()=="+paidInstallment.getPrincipal());
                            //customlog.info("futureInstallment.getPrincipal()=="+futureInstallment.getPrincipal());
                            //customlog.info("runningBalance.getRunBalPrincipal()=="+runningBalance.getRunBalPrincipal());
                            //**************************************Client Account Info **************************************************************//

                            var clientLoanAccountDetailsDto=new clientLoanAccountDetailsDto();
                            clientLoanAccountDetailsDto.clearAll();
                            if(result.loanInfnList.loanAccountDetailsDto != null) {
                                for(var item = 0; item < result.loanInfnList.loanAccountDetailsDto.length; item++){
                                    accountId[item] = result.loanInfnList.loanAccountDetailsDto[item].accountId;
                                    clientId[item] = result.loanInfnList.loanAccountDetailsDto[item].clientId;
                                    clientName[item] = result.loanInfnList.loanAccountDetailsDto[item].clientName;
                                    govermentId[item] = result.loanInfnList.loanAccountDetailsDto[item].govermentId;
                                    loanPurpose[item] = result.loanInfnList.loanAccountDetailsDto[item].loanPurpose;
                                    loanAmount[item] = result.loanInfnList.loanAccountDetailsDto[item].loanAmount;
                                    insured[item] =	result.loanInfnList.loanAccountDetailsDto[item].insured;
                                    individualTracked[item] = result.loanInfnList.loanAccountDetailsDto[item].individualTracked;
                                    businessActivity[item] = result.loanInfnList.loanAccountDetailsDto[item].businessActivity;
                                    businessActivityName[item] = result.loanInfnList.loanAccountDetailsDto[item].businessActivityName;
                                    loanAccountId[item] = result.loanInfnList.loanAccountDetailsDto[item].loanAccountId;
                                    loanGlobalAccountNum[item] = result.loanInfnList.loanAccountDetailsDto[item].loanGlobalAccountNum;
                                    parentLoanGlobalAccountNum[item] = result.loanInfnList.loanAccountDetailsDto[item].parentLoanGlobalAccountNum;
                                    parentLoanAccountId[item] = result.loanInfnList.loanAccountDetailsDto[item].parentLoanAccountId;

                                    //**************************************Client Paid Installment **************************************************************//
                                    var clientPaidInstallment=new RepaymentSchedule();
                                    clientPaidInstallment.clearAll();

                                    for(var innerItem = 0; innerItem < result.loanInfnList.loanAccountDetailsDto[item].loanRepaymentSchedule.paidInstallments.length; innerItem++){
                                        installmentId[innerItem] = result.loanInfnList.loanAccountDetailsDto[item].loanRepaymentSchedule.paidInstallments[innerItem].installmentId;
                                        actionDate[innerItem] = result.loanInfnList.loanAccountDetailsDto[item].loanRepaymentSchedule.paidInstallments[innerItem].actionDate ;
                                        paymentDate[innerItem] = result.loanInfnList.loanAccountDetailsDto[item].loanRepaymentSchedule.paidInstallments[innerItem].paymentDate;
                                        principal[innerItem] = result.loanInfnList.loanAccountDetailsDto[item].loanRepaymentSchedule.paidInstallments[innerItem].principal;
                                        interest[innerItem] = result.loanInfnList.loanAccountDetailsDto[item].loanRepaymentSchedule.paidInstallments[innerItem].interest;
                                        fees[innerItem] = result.loanInfnList.loanAccountDetailsDto[item].loanRepaymentSchedule.paidInstallments[innerItem].fees;
                                        penalty[innerItem] = result.loanInfnList.loanAccountDetailsDto[item].loanRepaymentSchedule.paidInstallments[innerItem].penalty;
                                        total[innerItem] = result.loanInfnList.loanAccountDetailsDto[item].loanRepaymentSchedule.paidInstallments[innerItem].total;
                                    }
                                    clientPaidInstallment.setInstallmentId(installmentId);
                                    clientPaidInstallment.setActionDate(actionDate);
                                    clientPaidInstallment.setPaymentDate(paymentDate);
                                    clientPaidInstallment.setPrincipal(principal);
                                    clientPaidInstallment.setInterest(interest);
                                    clientPaidInstallment.setFees(fees);
                                    clientPaidInstallment.setPenalty(penalty);
                                    clientPaidInstallment.setTotal(total);
                                    installmentId = [];
                                    actionDate = [];
                                    paymentDate = [];
                                    principal = [];
                                    interest = [];
                                    fees = [];
                                    penalty = [];
                                    total = [];
                                    clientPaidInstallmentArray[item] = clientPaidInstallment;

                                    //**************************************Client Due Installment **************************************************************//
                                    var clientDueInstallment = new RepaymentSchedule();
                                    clientDueInstallment.clearAll();
                                    for(var innerItem = 0; innerItem < result.loanInfnList.loanAccountDetailsDto[item].loanRepaymentSchedule.dueInstallments.length; innerItem++){
                                        installmentId[innerItem] = result.loanInfnList.loanAccountDetailsDto[item].loanRepaymentSchedule.dueInstallments[innerItem].installmentId;
                                        actionDate[innerItem] = result.loanInfnList.loanAccountDetailsDto[item].loanRepaymentSchedule.dueInstallments[innerItem].actionDate;
                                        paymentDate[innerItem] = result.loanInfnList.loanAccountDetailsDto[item].loanRepaymentSchedule.dueInstallments[innerItem].paymentDate;
                                        principal[innerItem] = result.loanInfnList.loanAccountDetailsDto[item].loanRepaymentSchedule.dueInstallments[innerItem].principal;
                                        interest[innerItem] = result.loanInfnList.loanAccountDetailsDto[item].loanRepaymentSchedule.dueInstallments[innerItem].interest;
                                        fees[innerItem] = result.loanInfnList.loanAccountDetailsDto[item].loanRepaymentSchedule.dueInstallments[innerItem].fees;
                                        penalty[innerItem] = result.loanInfnList.loanAccountDetailsDto[item].loanRepaymentSchedule.dueInstallments[innerItem].penalty;
                                        total[innerItem] = result.loanInfnList.loanAccountDetailsDto[item].loanRepaymentSchedule.dueInstallments[innerItem].total;
                                    }
                                    clientDueInstallment.setInstallmentId(installmentId);
                                    clientDueInstallment.setActionDate(actionDate);
                                    clientDueInstallment.setPaymentDate(paymentDate);
                                    clientDueInstallment.setPrincipal(principal);
                                    clientDueInstallment.setInterest(interest);
                                    clientDueInstallment.setFees(fees);
                                    clientDueInstallment.setPenalty(penalty);
                                    clientDueInstallment.setTotal(total);
                                    installmentId = [];
                                    actionDate = [];
                                    paymentDate = [];
                                    principal = [];
                                    interest = [];
                                    fees = [];
                                    penalty = [];
                                    total = [];
                                    clientDueInstallmentArray[item] = clientDueInstallment;

                                    //**************************************Client Future Installment **************************************************************//
                                    var clientFutureInstallment = new RepaymentSchedule();
                                    clientFutureInstallment.clearAll();
                                    for(var innerItem = 0; innerItem < result.loanInfnList.loanAccountDetailsDto[item].loanRepaymentSchedule.futureInstallment.length; innerItem++){
                                        installmentId[innerItem] = result.loanInfnList.loanAccountDetailsDto[item].loanRepaymentSchedule.futureInstallment[innerItem].installmentId;
                                        actionDate[innerItem] = result.loanInfnList.loanAccountDetailsDto[item].loanRepaymentSchedule.futureInstallment[innerItem].actionDate;
                                        paymentDate[innerItem] = result.loanInfnList.loanAccountDetailsDto[item].loanRepaymentSchedule.futureInstallment[innerItem].paymentDate;
                                        principal[innerItem] = result.loanInfnList.loanAccountDetailsDto[item].loanRepaymentSchedule.futureInstallment[innerItem].principal;
                                        interest[innerItem] = result.loanInfnList.loanAccountDetailsDto[item].loanRepaymentSchedule.futureInstallment[innerItem].interest;
                                        fees[innerItem] = result.loanInfnList.loanAccountDetailsDto[item].loanRepaymentSchedule.futureInstallment[innerItem].fees;
                                        penalty[innerItem] = result.loanInfnList.loanAccountDetailsDto[item].loanRepaymentSchedule.futureInstallment[innerItem].penalty;
                                        total[innerItem] = result.loanInfnList.loanAccountDetailsDto[item].loanRepaymentSchedule.futureInstallment[innerItem].total;
                                    }

                                    /*var futureStartValue = result.loanInfnList.loanAccountDetailsDto[innerItem].loanRepaymentSchedule.dueInstallments.length;
                                     var futureEndValue = result.loanInfnList.loanAccountDetailsDto[innerItem].loanRepaymentSchedule.dueInstallments.length+result.loanInfnList.loanAccountDetailsDto[innerItem].loanRepaymentSchedule.futureInstallment.length;
                                     for(var innerItem = futureStartValue; innerItem < futureEndValue; innerItem++){
                                     installmentId[innerItem] = result.loanInfnList.loanAccountDetailsDto[item].loanRepaymentSchedule.futureInstallment[innerItem-futureStartValue].installmentId;
                                     actionDate[innerItem] = result.loanInfnList.loanAccountDetailsDto[item].loanRepaymentSchedule.futureInstallment[innerItem-futureStartValue].actionDate ;
                                     paymentDate[innerItem] = result.loanInfnList.loanAccountDetailsDto[item].loanRepaymentSchedule.futureInstallment[innerItem-futureStartValue].paymentDate;
                                     principal[innerItem] = result.loanInfnList.loanAccountDetailsDto[item].loanRepaymentSchedule.futureInstallment[innerItem-futureStartValue].principal;
                                     interest[innerItem] = result.loanInfnList.loanAccountDetailsDto[item].loanRepaymentSchedule.futureInstallment[innerItem-futureStartValue].interest;
                                     fees[innerItem] = result.loanInfnList.loanAccountDetailsDto[item].loanRepaymentSchedule.futureInstallment[innerItem-futureStartValue].fees;
                                     penalty[innerItem] = result.loanInfnList.loanAccountDetailsDto[item].loanRepaymentSchedule.futureInstallment[innerItem-futureStartValue].penalty;
                                     total[innerItem] = result.loanInfnList.loanAccountDetailsDto[item].loanRepaymentSchedule.futureInstallment[innerItem-futureStartValue].total;
                                     }*/
                                    clientFutureInstallment.setInstallmentId(installmentId);
                                    clientFutureInstallment.setActionDate(actionDate);
                                    clientFutureInstallment.setPaymentDate(paymentDate);
                                    clientFutureInstallment.setPrincipal(principal);
                                    clientFutureInstallment.setInterest(interest);
                                    clientFutureInstallment.setFees(fees);
                                    clientFutureInstallment.setPenalty(penalty);
                                    clientFutureInstallment.setTotal(total);
                                    installmentId = [];
                                    actionDate = [];
                                    paymentDate = [];
                                    principal = [];
                                    interest = [];
                                    fees = [];
                                    penalty = [];
                                    total = [];
                                    clientFutureInstallmentArray[item] = clientFutureInstallment;

                                    //**************************************Client Running Balance **************************************************************//
                                    /*var clientRunningBalance = new RepaymentSchedule();
                                     this.clientRunningBalance = clientRunningBalance;
                                     var clientRunningBalance=this.clientRunningBalance;
                                     clientRunningBalance.clearAll();
                                     //customlog.info(result.loanInfnList.loanInformationDto.loanRepaymentSchedule.runningBalance.length);
                                     for(var innerItem = 0; innerItem < result.loanInfnList.loanAccountDetailsDto[item].loanRepaymentSchedule.runningBalance.length; innerItem++){
                                     runBalPrincipal[innerItem] = result.loanInfnList.loanAccountDetailsDto[item].loanRepaymentSchedule.runningBalance[innerItem].runBalPrincipal;
                                     runBalInterest[innerItem] = result.loanInfnList.loanAccountDetailsDto[item].loanRepaymentSchedule.runningBalance[innerItem].runBalInterest;
                                     runBalFees[innerItem] = result.loanInfnList.loanAccountDetailsDto[item].loanRepaymentSchedule.runningBalance[innerItem].runBalFees;
                                     runBalPenalty[innerItem] = result.loanInfnList.loanAccountDetailsDto[item].loanRepaymentSchedule.runningBalance[innerItem].runBalPenalty;
                                     totalRunBal[innerItem] = result.loanInfnList.loanAccountDetailsDto[item].loanRepaymentSchedule.runningBalance[innerItem].totalRunBal;
                                     }
                                     clientRunningBalance.setRunBalPrincipal(runBalPrincipal);
                                     clientRunningBalance.setRunBalInterest(runBalInterest);
                                     clientRunningBalance.setRunBalFees(runBalFees);
                                     clientRunningBalance.setRunBalPenalty(runBalPenalty);
                                     clientRunningBalance.setTotalRunBal(totalRunBal);
                                     clientRunningBalanceArray[item] = clientRunningBalance;
                                     runBalPrincipal = [];
                                     runBalInterest = [];
                                     runBalFees = [];
                                     runBalPenalty = [];
                                     totalRunBal = [];*/
                                }

                            }

                            clientLoanAccountDetailsDto.setAccountId(accountId);
                            clientLoanAccountDetailsDto.setClientId(clientId);
                            clientLoanAccountDetailsDto.setClientName(clientName);
                            clientLoanAccountDetailsDto.setGovermentId(govermentId);
                            clientLoanAccountDetailsDto.setLoanPurpose(loanPurpose);
                            clientLoanAccountDetailsDto.setLoanAmount(loanAmount);
                            clientLoanAccountDetailsDto.setInsured(insured);
                            clientLoanAccountDetailsDto.setIndividualTracked(individualTracked);
                            clientLoanAccountDetailsDto.setBusinessActivity(businessActivity);
                            clientLoanAccountDetailsDto.setBusinessActivityName(businessActivityName);
                            clientLoanAccountDetailsDto.setLoanAccountId(loanAccountId);
                            clientLoanAccountDetailsDto.setLoanGlobalAccountNum(loanGlobalAccountNum);
                            clientLoanAccountDetailsDto.setParentLoanGlobalAccountNum(parentLoanGlobalAccountNum);
                            clientLoanAccountDetailsDto.setParentLoanAccountId(parentLoanAccountId);
                            clientLoanAccountDetailsDto.setPaidInstallment(clientPaidInstallmentArray);
                            clientLoanAccountDetailsDto.setDueInstallment(clientDueInstallmentArray);
                            clientLoanAccountDetailsDto.setFutureInstallment(clientFutureInstallmentArray);
                            //clientLoanAccountDetailsDto.setRunningBalance(clientRunningBalanceArray);

                            var id = new Array();
                            var actionDate = new Array();
                            var activity = new Array();
                            var principal = new Array();
                            var interest = new Array();
                            var fees = new Array();
                            var penalty = new Array();
                            var total = new Array();
                            var runningBalancePrincipal = new Array();
                            var runningBalanceInterest = new Array();
                            var runningBalanceFees = new Array();
                            var runningBalancePenalty = new Array();
                            var locale = new Array();
                            var timeStamp = new Array();
                            var runningBalancePrincipleWithInterestAndFees = new Array();
                            var totalValue = new Array();
                            var userPrefferedDate = new Array();

                            //customlog.info(result.loanInfnList.loanInformationDto.recentAccountActivity);
                            var recentAccountActivity=new RecentAccountActivity();
                            recentAccountActivity.clearAll();
                            if(result.loanInfnList.loanInformationDto.recentAccountActivity != null) {
                                for(var item = 0; item < result.loanInfnList.loanInformationDto.recentAccountActivity.length; item++){
                                    id[item] = result.loanInfnList.loanInformationDto.recentAccountActivity[item].id;
                                    actionDate[item] = convertDate(result.loanInfnList.loanInformationDto.recentAccountActivity[item].actionDate);
                                    activity[item] = result.loanInfnList.loanInformationDto.recentAccountActivity[item].activity;
                                    principal[item] = result.loanInfnList.loanInformationDto.recentAccountActivity[item].principal;
                                    interest[item] = result.loanInfnList.loanInformationDto.recentAccountActivity[item].interest;
                                    fees[item] = result.loanInfnList.loanInformationDto.recentAccountActivity[item].fees;
                                    penalty[item] = result.loanInfnList.loanInformationDto.recentAccountActivity[item].penalty;
                                    total[item] = result.loanInfnList.loanInformationDto.recentAccountActivity[item].total;
                                    runningBalancePrincipal[item] = result.loanInfnList.loanInformationDto.recentAccountActivity[item].runningBalancePrinciple;
                                    runningBalanceInterest[item] = result.loanInfnList.loanInformationDto.recentAccountActivity[item].runningBalanceInterest;
                                    runningBalanceFees[item] = result.loanInfnList.loanInformationDto.recentAccountActivity[item].runningBalanceFees;
                                    runningBalancePenalty[item] = result.loanInfnList.loanInformationDto.recentAccountActivity[item].runningBalancePenalty;
                                    locale[item] = result.loanInfnList.loanInformationDto.recentAccountActivity[item].locale;
                                    timeStamp[item] = convertDate(result.loanInfnList.loanInformationDto.recentAccountActivity[item].timeStamp);
                                    runningBalancePrincipleWithInterestAndFees[item] = result.loanInfnList.loanInformationDto.recentAccountActivity[item].runningBalancePrincipleWithInterestAndFees;
                                    totalValue[item] = result.loanInfnList.loanInformationDto.recentAccountActivity[item].totalValue;
                                    userPrefferedDate[item] = result.loanInfnList.loanInformationDto.recentAccountActivity[item].userPrefferedDate;
                                }
                            }

                            recentAccountActivity.setId(id);
                            recentAccountActivity.setActionDate(actionDate);
                            recentAccountActivity.setActivity(activity);
                            recentAccountActivity.setPrincipal(principal);
                            recentAccountActivity.setInterest(interest);
                            recentAccountActivity.setFees(fees);
                            recentAccountActivity.setPenalty(penalty);
                            recentAccountActivity.setTotal(total);
                            recentAccountActivity.setRunningBalancePrinciple(runningBalancePrincipal);
                            recentAccountActivity.setRunningBalanceInterest(runningBalanceInterest);
                            recentAccountActivity.setRunningBalanceFees(runningBalanceFees);
                            recentAccountActivity.setRunningBalancePenalty(runningBalancePenalty);
                            recentAccountActivity.setLocale(locale);
                            recentAccountActivity.setTimeStamp(timeStamp);
                            recentAccountActivity.setRunningBalancePrincipleWithInterestAndFees(runningBalancePrincipleWithInterestAndFees);
                            recentAccountActivity.setTotalValue(totalValue);
                            recentAccountActivity.setUserPrefferedDate(userPrefferedDate);

                            id = [];
                            actionDate = [];
                            activity = [];
                            principal = [];
                            interest = [];
                            fees = [];
                            penalty = [];
                            total = [];
                            runningBalancePrincipal = [];
                            runningBalanceInterest = [];
                            runningBalanceFees = [];
                            runningBalancePenalty = [];
                            locale = [];
                            timeStamp = [];
                            runningBalancePrincipleWithInterestAndFees = [];
                            totalValue = [];
                            userPrefferedDate = [];

                            var viewAllAccountActivity=new RecentAccountActivity();
                            viewAllAccountActivity.clearAll();
                            if(result.loanInfnList.allAccountActivities != null) {
                                for(var item = 0; item < result.loanInfnList.allAccountActivities.length; item++){
                                    id[item] = result.loanInfnList.allAccountActivities[item].id;
                                    actionDate[item] = convertDate(result.loanInfnList.allAccountActivities[item].actionDate);
                                    activity[item] = result.loanInfnList.allAccountActivities[item].activity;
                                    principal[item] = result.loanInfnList.allAccountActivities[item].principal;
                                    interest[item] = result.loanInfnList.allAccountActivities[item].interest;
                                    fees[item] = result.loanInfnList.allAccountActivities[item].fees;
                                    penalty[item] = result.loanInfnList.allAccountActivities[item].penalty;
                                    total[item] = result.loanInfnList.allAccountActivities[item].total;
                                    runningBalancePrincipal[item] = result.loanInfnList.allAccountActivities[item].runningBalancePrinciple;
                                    runningBalanceInterest[item] = result.loanInfnList.allAccountActivities[item].runningBalanceInterest;
                                    runningBalanceFees[item] = result.loanInfnList.allAccountActivities[item].runningBalanceFees;
                                    runningBalancePenalty[item] = result.loanInfnList.allAccountActivities[item].runningBalancePenalty;
                                    locale[item] = result.loanInfnList.allAccountActivities[item].locale;
                                    timeStamp[item] = convertDate(result.loanInfnList.allAccountActivities[item].timeStamp);
                                    runningBalancePrincipleWithInterestAndFees[item] = result.loanInfnList.allAccountActivities[item].runningBalancePrincipleWithInterestAndFees;
                                    totalValue[item] = result.loanInfnList.allAccountActivities[item].totalValue;
                                    userPrefferedDate[item] = result.loanInfnList.allAccountActivities[item].userPrefferedDate;
                                }
                            }

                            viewAllAccountActivity.setId(id);
                            viewAllAccountActivity.setActionDate(actionDate);
                            viewAllAccountActivity.setActivity(activity);
                            viewAllAccountActivity.setPrincipal(principal);
                            viewAllAccountActivity.setInterest(interest);
                            viewAllAccountActivity.setFees(fees);
                            viewAllAccountActivity.setPenalty(penalty);
                            viewAllAccountActivity.setTotal(total);
                            viewAllAccountActivity.setRunningBalancePrinciple(runningBalancePrincipal);
                            viewAllAccountActivity.setRunningBalanceInterest(runningBalanceInterest);
                            viewAllAccountActivity.setRunningBalanceFees(runningBalanceFees);
                            viewAllAccountActivity.setRunningBalancePenalty(runningBalancePenalty);
                            viewAllAccountActivity.setLocale(locale);
                            viewAllAccountActivity.setTimeStamp(timeStamp);
                            viewAllAccountActivity.setRunningBalancePrincipleWithInterestAndFees(runningBalancePrincipleWithInterestAndFees);
                            viewAllAccountActivity.setTotalValue(totalValue);
                            viewAllAccountActivity.setUserPrefferedDate(userPrefferedDate);
                            id = [];
                            actionDate = [];
                            activity = [];
                            principal = [];
                            interest = [];
                            fees = [];
                            penalty = [];
                            total = [];
                            runningBalancePrincipal = [];
                            runningBalanceInterest = [];
                            runningBalanceFees = [];
                            runningBalancePenalty = [];
                            locale = [];
                            timeStamp = [];
                            runningBalancePrincipleWithInterestAndFees = [];
                            totalValue = [];
                            userPrefferedDate = [];
                            self.showLoanRecoveryLoanAccountInformation(req,res,loanAccInformationDto,loanSummary,paidInstallment,dueInstallment,futureInstallment,runningBalance,clientLoanAccountDetailsDto,recentAccountActivity,viewAllAccountActivity,loanStatusId);
                            customlog.info('Retrieved Loan information');
                        }else{
                            self.commonRouter.showErrorPage(req,res);
                        }
                    }
                });
            }
        }catch(e){
            customlog.error("Exception while loanrecoveryloaninformation "+e);
            self.commonRouter.showErrorPage(req,res);
        }
    },

    applypayment :function(req, res){
        try{
            var self = this;
            var constantsObj = this.constants;
            var accountId = parseInt(req.body.accountId,10);
            var accountTypeId = req.body.accountTypeId;
            var globalAccountNum = req.body.globalAccountNum;
            var transactionDate;
            if(typeof req.body.dateofTransaction != 'undefined')
                transactionDate = new Date(convertToMifosDateFormat(req.body.dateofTransaction));
            var retrieveType = req.body.retrieveType;
            var sourceofPayment = req.body.sourceofPayment;
            var relaxValidation = req.body.relaxValidation;
            var chequeNo = req.body.chequeNo;
            var chequeDate;
            if(typeof req.body.chequeDate != 'undefined')
                chequeDate = new Date(convertToMifosDateFormat(req.body.chequeDate));
            customlog.info("Data="+chequeNo+"--"+chequeDate+"--"+globalAccountNum+"--"+transactionDate+"--"+retrieveType+"--"+sourceofPayment+"--"+relaxValidation);

            var loanRepaymentHolder = require(loanRecoveryDtoPath +"/LoanRepayment");
            var loanRepaymentHolder = new loanRepaymentHolder();

            var ClientPaymentDto = require(loanRecoveryDtoPath +"/ClientPaymentDto");
            var clientPaymentDto = new ClientPaymentDto();

            var GLCodeDto = require(loanRecoveryDtoPath +"/GLCodeDto");
            var glCodeDto = new GLCodeDto();

            loanRepaymentHolder.setAccountId(accountId);
            loanRepaymentHolder.setAccountTypeId(accountTypeId);
            loanRepaymentHolder.setGlobalAccountNum(globalAccountNum);
            loanRepaymentHolder.setRetrieveType(retrieveType);
            loanRepaymentHolder.setTransactionDate(transactionDate);
            loanRepaymentHolder.setGlCodeId(sourceofPayment);
            if(relaxValidation == 'on') {
                //customlog.info("Relax Validation");
                loanRepaymentHolder.setRelaxMismatchValidationCheck("true");}
            else
                loanRepaymentHolder.setRelaxMismatchValidationCheck("false");
            loanRepaymentHolder.setReceiptId(chequeNo);
            loanRepaymentHolder.setReceiptDate(chequeDate);


            var rest = require("./rest.js");
            var accountDetail = JSON.stringify(loanRepaymentHolder);

            customlog.info("accountDetail"+accountDetail);
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
                    'Content-Length' : Buffer.byteLength(accountDetail, 'utf8'),
                    'Cookie' : req.session.mifosCookie
                };

                var options = {
                    host: mifosServiceIP,
                    port: mifosPort,
                    path: '/mfi/api/account/loan/repayment.json',
                    method: 'POST',
                    headers : postheaders
                };

                var resultStatus;
                rest.postJSON(options,accountDetail,function(statuscode,result,headers){
                    customlog.info("statuscode" + statuscode);
                    customlog.info("HEADERS:  "+headers)
                    customlog.info("RESULT"+result);
                    //customlog.info("PAYMENT INFN:"+result.paymentInfn);

                    //customlog.info("GLCODES:"+result.paymentInfn.glCodes);
                    //customlog.info("GLCODES:"+result.paymentInfn.glCodes[0].glname);
                    //customlog.info("paymentInfn:"+result.paymentInfn);
                    //customlog.info("accountId:"+result.paymentInfn.accountId);
                    //customlog.info("GLCODES length:"+result.paymentInfn.glCodes.length);
                    //customlog.info(result.status);
                    resultStatus = result.status;

                    var clientPaymentObjArray = new Array();
                    var glCodeObjArray = new Array();
                    if(statuscode == 302){
                        res.redirect(props.contextPath+'/client/ci/logout');
                    }
                    else{
                        if(resultStatus == 'success'){
                            //var activityDetails = new Array(iklantPort, req.session.tenantId, req.session.userId, req.session.userName, req.originalUrl, req.connection.remoteAddress, "router.js", "applypayment", "success", "Apply Payment", "Apply Payment Made for Group successfully","insert");
                            //self.commonRouter.insertActivityLogModel(activityDetails);
                            var LoanRepayment = require(loanRecoveryDtoPath +"/LoanRepayment");
                            var ClientPaymentDto = require(loanRecoveryDtoPath +"/ClientPaymentDto");
                            var GLCodeDto = require(loanRecoveryDtoPath +"/GLCodeDto");

                            //result.paymentInfn.clientPaymentDetails
                            //customlog.info(result.paymentInfn.clientPaymentDetails);
                            if(result.paymentInfn.clientPaymentDetails != null){

                                for(var item = 0; item<result.paymentInfn.clientPaymentDetails.length; item++) {
                                    var clientPaymentDetail=new ClientPaymentDto();
                                    clientPaymentDetail.setClientId(result.paymentInfn.clientPaymentDetails[item].clientId);
                                    clientPaymentDetail.setClientName(result.paymentInfn.clientPaymentDetails[item].clientName);
                                    clientPaymentDetail.setClientPaymentAmount(result.paymentInfn.clientPaymentDetails[item].clientPaymentAmount);
                                    clientPaymentDetail.setClientPaymentId(result.paymentInfn.clientPaymentDetails[item].clientPaymentId);
                                    clientPaymentDetail.setLoanAccountId(result.paymentInfn.clientPaymentDetails[item].loanAccountId);
                                    if(result.paymentInfn.clientPaymentDetails[item].totalOverdueAmount > 0){
                                        clientPaymentDetail.setTotalOverdueAmount(0);
                                    }else{
                                        clientPaymentDetail.setTotalOverdueAmount(result.paymentInfn.clientPaymentDetails[item].totalOverdueAmount);
                                    }
                                    clientPaymentDetail.setTotalOutstandingAmount(result.paymentInfn.clientPaymentDetails[item].totalOutstandingAmount);
                                    clientPaymentDetail.setTotalAmountDemanded(result.paymentInfn.clientPaymentDetails[item].totalAmountDemanded);
                                    clientPaymentDetail.setTotalAmountPaid(result.paymentInfn.clientPaymentDetails[item].totalAmountPaid);
                                    clientPaymentDetail.setTotalInstallmentAmount(result.paymentInfn.clientPaymentDetails[item].totalInstallmentAmount);
                                    //customlog.info("getClientId ==== "+result.paymentInfn.clientPaymentDetails[item].clientId);
                                    clientPaymentObjArray[item] = clientPaymentDetail;
                                }
                            }
                            var groupClientPaymentDetail=new ClientPaymentDto();
                            if(result.paymentInfn.paymentDetails != null) {
                                groupClientPaymentDetail.setClientId(result.paymentInfn.paymentDetails.clientId);
                                groupClientPaymentDetail.setClientName(result.paymentInfn.paymentDetails.clientName);
                                groupClientPaymentDetail.setClientPaymentAmount(result.paymentInfn.paymentDetails.clientPaymentAmount);
                                groupClientPaymentDetail.setClientPaymentId(result.paymentInfn.paymentDetails.clientPaymentId);
                                groupClientPaymentDetail.setLoanAccountId(result.paymentInfn.paymentDetails.loanAccountId);
                                if(result.paymentInfn.paymentDetails.totalOverdueAmount > 0){
                                    groupClientPaymentDetail.setTotalOverdueAmount(0);
                                }else{
                                    groupClientPaymentDetail.setTotalOverdueAmount(result.paymentInfn.paymentDetails.totalOverdueAmount);
                                }
                                groupClientPaymentDetail.setTotalOutstandingAmount(result.paymentInfn.paymentDetails.totalOutstandingAmount);
                                groupClientPaymentDetail.setTotalAmountDemanded(result.paymentInfn.paymentDetails.totalAmountDemanded);
                                groupClientPaymentDetail.setTotalAmountPaid(result.paymentInfn.paymentDetails.totalAmountPaid);
                                groupClientPaymentDetail.setTotalInstallmentAmount(result.paymentInfn.paymentDetails.totalInstallmentAmount);

                            }

                            if(result.paymentInfn.glCodes != null) {
                                for(var item = 0; item<result.paymentInfn.glCodes.length; item++) {
                                    var glCodeDto=new GLCodeDto();
                                    glCodeDto.clearAll();
                                    glCodeDto.setGlcodeId(result.paymentInfn.glCodes[item].glcodeId);
                                    glCodeDto.setGlcode(result.paymentInfn.glCodes[item].glcode);
                                    glCodeDto.setGlname(result.paymentInfn.glCodes[item].glname);
                                    glCodeDto.setOfficeId(result.paymentInfn.glCodes[item].officeId);
                                    glCodeDto.setCashOrBank(result.paymentInfn.glCodes[item].cashOrBank);
                                    //customlog.info("getGlcodeId ==== "+glCodeDto.getGlcodeId());
                                    //customlog.info("getClientId ==== "+glCodeDto.getGlname());
                                    //customlog.info("getCashOrBank ==== "+glCodeDto.getCashOrBank());
                                    glCodeObjArray[item] = glCodeDto;
                                }
                            }

                            //customlog.info("glCodeObjArray ==== "+glCodeObjArray);
                            var loanRepayment=new LoanRepayment();
                            if(result.paymentInfn != null) {
                                loanRepayment.setAccountId(result.paymentInfn.accountId);
                                loanRepayment.setAccountTypeId(result.paymentInfn.accountTypeId);
                                loanRepayment.setGlobalAccountNum(result.paymentInfn.globalAccountNum);
                                loanRepayment.setRetrieveType(result.paymentInfn.retrieveType);
                                loanRepayment.setIsDisbursal(result.paymentInfn.isDisbursal);
                                loanRepayment.setAmount(result.paymentInfn.amount);
                                loanRepayment.setTransferPaymentTypeId(result.paymentInfn.transferPaymentTypeId);
                                loanRepayment.setClientPaymentDetails(clientPaymentObjArray);
                                loanRepayment.setRelaxMismatchValidationCheck(result.paymentInfn.relaxMismatchValidationCheck);
                                loanRepayment.setTransactionDate(convertDate(result.paymentInfn.transactionDate));
                                loanRepayment.setPaymentDetails(groupClientPaymentDetail);
                                loanRepayment.setOfficeId(result.paymentInfn.officeId);
                                loanRepayment.setLastPaymentDate(convertDate(result.paymentInfn.lastPaymentDate));
                                loanRepayment.setCurrentDate(result.paymentInfn.currentDate);
                                loanRepayment.setDisbursementDate(convertDate(result.paymentInfn.disbursementDate));
                                loanRepayment.setFinancialYearEndDate(convertDate(result.paymentInfn.financialYearEndDate));
                                loanRepayment.setGlCodes(glCodeObjArray);
                                loanRepayment.setGlCodeId(result.paymentInfn.glCodeId);
                                loanRepayment.setReceiptId(result.paymentInfn.receiptId);
                                if(result.paymentInfn.receiptDate !=null)
                                    loanRepayment.setReceiptDate(convertDate(result.paymentInfn.receiptDate));
                                else
                                    loanRepayment.setReceiptDate(result.paymentInfn.receiptDate);
                                loanRepayment.setAccountForTransfer(result.paymentInfn.accountForTransfer);

                            }
                            res.render('loan_recovery/ApplyPayment',{loanRepayment:loanRepayment,groupName : req.session.groupCenterMifosName,constantsObj:constantsObj, contextPath:props.contextPath});
                        } else {
                            self.commonRouter.showErrorPage(req,res);
                        }
                    }
                });
                //res.render('ApplyPayment');
            }
        }catch(e){
            customlog.error("Exception while applypayment "+e);
            self.commonRouter.showErrorPage(req,res);
        }
    },

    doapplypayment : function(req, res){
        try{
            var self = this;
            var clientPaymentObjArray = new Array();
            var accountId = parseInt(req.body.accountId,10);
            var accountTypeId = req.body.accountTypeId;
            var globalAccountNum = req.body.globalAccountNum;
            var relaxValidation = req.body.relaxValidation;
            //var loanStatusId = req.body.loanStatusId;
            var transactionDate;
            var transactionDateStr;
            if(typeof req.body.dateofTransaction != 'undefined')
            //transactionDate = convertToMifosDateFormat(req.body.dateofTransaction);
                transactionDateStr = req.body.dateofTransaction;
            var retrieveType = req.body.retrieveType;
            var sourceofPayment = req.body.sourceofPayment;


            var chequeNo;
            var chequeDate;
            if(typeof(req.body.chequeNo) == 'undefined' | req.body.chequeNo == '' |  req.body.chequeNo== 'NULL'){
                chequeNo = null;
            }else{
                chequeNo = req.body.chequeNo;
            }
            if(typeof(req.body.chequeDate) == 'undefined' | req.body.chequeDate == '' |  req.body.chequeDate== 'NULL'){
                chequeDate = null;
            }else{
                //chequeDeposit.setChequeDate(convertChequeDateIntoMifosFormat(req.body.chequeDateName));
                chequeDate = req.body.chequeDate;
            }
            /*if(typeof req.body.chequeDate != 'undefined')
             //chequeDate = new Date(convertToMifosDateFormat(req.body.chequeDate));
             chequeDate = req.body.chequeDate;*/
            var amount = req.body.amount;
            customlog.info("Amount----------------------"+amount);
            customlog.info("Data="+chequeNo+"--"+chequeDate+"--"+globalAccountNum+"--"+transactionDate+"--"+retrieveType+"--"+sourceofPayment+"--"+relaxValidation);
            var noOfClients = parseInt(req.body.noOfClients,10);

            var clientsId = req.body.clientsId.split(",");
            var clientsName = req.body.clientsName.split(",");
            var clientAmounts = req.body.clientAmounts.split(",");
            if(noOfClients >0 ){
                var ClientPaymentDto = require(loanRecoveryDtoPath +"/ClientPaymentDto");
                for(var item =0 ; item < noOfClients; item++) {
                    var clientPaymentDto=new ClientPaymentDto();
                    //clientPaymentDto.clearAll();
                    customlog.info("Client Id====="+clientsId[item]);
                    customlog.info("clientsName====="+clientsName[item]);
                    customlog.info("clientAmounts====="+clientAmounts[item]);
                    clientPaymentDto.setClientId(clientsId[item]);
                    clientPaymentDto.setClientName(clientsName[item]);
                    clientPaymentDto.setClientPaymentAmount(clientAmounts[item]);
                    clientPaymentObjArray[item] = clientPaymentDto;

                }
            }

            var loanRepaymentHolder = require(loanRecoveryDtoPath +"/LoanRepayment");
            var loanRepaymentHolder = new loanRepaymentHolder();
            if(relaxValidation == 'on') {
                customlog.info("Relax Validation");
                loanRepaymentHolder.setRelaxMismatchValidationCheck("true");}
            else
                loanRepaymentHolder.setRelaxMismatchValidationCheck("false");
            loanRepaymentHolder.setAccountId(accountId);
            loanRepaymentHolder.setAccountTypeId(accountTypeId);
            loanRepaymentHolder.setGlobalAccountNum(globalAccountNum);
            loanRepaymentHolder.setTransactionDate(transactionDate);
            loanRepaymentHolder.setTransactionDateStr(transactionDateStr);
            loanRepaymentHolder.setAmount(amount);
            loanRepaymentHolder.setRetrieveType(retrieveType);
            loanRepaymentHolder.setGlCodeId(sourceofPayment);
            loanRepaymentHolder.setVoucherNumber(req.body.voucherNumber);


            loanRepaymentHolder.setReceiptId(chequeNo);
            //loanRepaymentHolder.setReceiptDate(chequeDate);
            loanRepaymentHolder.setReceiptDateStr(chequeDate);
            loanRepaymentHolder.setClientPaymentDetails(clientPaymentObjArray);

            var rest = require("./rest.js");
            var accountDetail = JSON.stringify(loanRepaymentHolder);

            customlog.info("accountDetail"+accountDetail);
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
                    'Content-Length' : Buffer.byteLength(accountDetail, 'utf8'),
                    'Cookie' : req.session.mifosCookie
                };

                var options = {
                    host: mifosServiceIP,
                    port: mifosPort,
                    path: '/mfi/api/account/loan/repayment/save.json',
                    method: 'POST',
                    headers : postheaders
                };

                var resultStatus;
                rest.postJSON(options,accountDetail,function(statuscode,result,headers){
                    customlog.info("statuscode" + statuscode);
                    customlog.info("HEADERS:  "+headers)
                    customlog.info("RESULT"+result.status);
                    if(statuscode == 302){
                        res.redirect(props.contextPath+'/client/ci/logout');
                    }
                    else{
                        if(result.status == 'success'){
                            var activityDetails = new Array(iklantPort, req.session.tenantId, req.session.userId, req.session.userName, req.originalUrl, req.connection.remoteAddress, "router.js", "doapplypayment", "success", "Apply Payment", "AccountId "+accountId+" Applypayment Made successfully","insert");
                            self.commonRouter.insertActivityLogModel(activityDetails);
                            self.loanrecoveryloanaccounts(req,res);
                        }
                        else{
                            customlog.error("Error "+result.error);
                            if(typeof result.error != 'undefined'){
                                req.session.paymentMonthClosingError = result.error;
                                req.session.afterDoApplyPayment = 1;
                                self.applyPaymentForFo(req,res);
                            }
                            else {
                                self.commonRouter.showErrorPage(req,res);
                            }

                        }

                    }

                });
            }
        }catch(e){
            customlog.error("Exception while do apply payment "+e);
            self.commonRouter.showErrorPage(req,res);
        }
    },

    listapplyadjustment : function(req, res){
        try{
            var self = this;
            var globalAccountNum = req.body.globalAccountNum;
            var accountId = req.body.accountId;
            var accountTypeId = req.body.accountTypeId;
            var flagIdForClosedLoans;
            customlog.info("Before Assign "  +  req.body.flag);
            if(req.body.flag == 1){
                flagIdForClosedLoans = 6;
            }
            customlog.info("After Assign "  +  flagIdForClosedLoans);
            customlog.info("globalAccountNum"+ globalAccountNum + "accountId"+ accountId +"accountTypeId"+ accountTypeId );
            var rest = require("./rest.js");
            var accountNum = JSON.stringify({
                globalAccountNum : globalAccountNum});
            customlog.info("accountDetail"+accountNum);
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
                    'Content-Length' : Buffer.byteLength(accountNum, 'utf8'),
                    'Cookie' : req.session.mifosCookie
                };

                var options = {
                    host: mifosServiceIP,
                    port: mifosPort,
                    path: '/mfi/api/account/loan/adjustment/list.json',
                    method: 'POST',
                    headers : postheaders
                };

                rest.postJSON(options,accountNum,function(statuscode,result,headers){
                    customlog.info("statuscode" + statuscode);
                    customlog.info("HEADERS:  "+headers)
                    customlog.info("RESULT"+result.status);
                    var adjustablePaymentList = new Array();
                    if(statuscode == 302){
                        res.redirect(props.contextPath+'/client/ci/logout');
                    }
                    else{
                        if(result.status == 'success'){
                            customlog.info("Office id===="+req.session.officeId);
                            //customlog.info(result.adjList[0].amount.amount);
                            if(result.adjList != null) {
                                var AdjustablePayment = require(loanRecoveryDtoPath +"/AdjustablePaymentDto");
                                for(var item=0; item<result.adjList.length; item++){
                                    var adjustablePayment=new AdjustablePayment();
                                    adjustablePayment.clearAll();
                                    adjustablePayment.setpaymentId(result.adjList[item].paymentId);
                                    adjustablePayment.setamount(result.adjList[item].amount.amount);
                                    adjustablePayment.setpaymentType(result.adjList[item].paymentType);
                                    adjustablePayment.setpaymentDate(result.adjList[item].paymentDate);
                                    adjustablePayment.setreceiptDate(result.adjList[item].receiptDate);
                                    adjustablePayment.setreceiptId(result.adjList[item].receiptId);
                                    adjustablePaymentList[item] = adjustablePayment;
                                }
                            }
                            res.render('loan_recovery/ApplyAdjustmentList',{adjustablePaymentList:adjustablePaymentList,globalAccountNum:globalAccountNum,officeId:req.session.officeId,loanStatusId:req.session.loanStatusId,accountId : accountId,accountTypeId : accountTypeId ,groupName : req.session.groupCenterMifosName,flagIdForClosedLoans : flagIdForClosedLoans, contextPath:props.contextPath,individualPreclosed : result.individualPreclosed});
                        }
                        else{
                            self.commonRouter.showErrorPage(req,res);
                        }
                    }
                });
            }
        }catch(e){
            customlog.error("Exception While list apply adjustment "+e);
            self.commonRouter.showErrorPage(req,res);
        }
    },

    applyadjustment : function(req, res){
        try{
            var self = this;
            var clientPaymentObjArray = new Array();
            var glCodeObjArray = new Array();
            var valueListElementObjArray = new Array();
            var officeId = req.body.officeId;
            var globalAccountNum = req.body.globalAccountNum;
            var paymentId = parseInt(req.body.paymentId,10);
            var accountId = req.body.accountId;
            var accountTypeId = req.body.accountTypeId;
            customlog.info(officeId+"--"+globalAccountNum+"--"+paymentId);

            var rest = require("./rest.js");
            var applyAdjustmentDetail = JSON.stringify({
                globalAccountNum : globalAccountNum,
                officeId : officeId,
                paymentId : paymentId,
                adjKey : "adjustSpec"
            });

            customlog.info("accountDetail"+applyAdjustmentDetail);
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
                    'Content-Length' : Buffer.byteLength(applyAdjustmentDetail, 'utf8'),
                    'Cookie' : req.session.mifosCookie
                };

                var options = {
                    host: mifosServiceIP,
                    port: mifosPort,
                    path: '/mfi/api/account/loan/adjustment/load.json',
                    method: 'POST',
                    headers : postheaders
                };

                rest.postJSON(options,applyAdjustmentDetail,function(statuscode,result,headers){
                    customlog.info("statuscode" + statuscode);
                    customlog.info("HEADERS:  "+headers)
                    customlog.info("RESULT"+result.status);
                    customlog.info("RESULT"+result);
                    //customlog.info("RESULT"+result.adjInfn.globalAccountNum);
                    var adjustablePaymentList = new Array();
                    if(statuscode == 302){
                        res.redirect(props.contextPath+'/client/ci/logout');
                    }
                    else{
                        if(result.status == 'success'){
                            var LoanAdjustment = require(loanRecoveryDtoPath +"/LoanAdjustment");
                            var ClientPaymentDto = require(loanRecoveryDtoPath +"/ClientPaymentDto");
                            var GLCodeDto = require(loanRecoveryDtoPath +"/GLCodeDto");
                            var ValueListElement = require(loanRecoveryDtoPath +"/ValueListElement");
                            customlog.info("result.adjInfn.clientPaymentDetails ==="+result.adjInfn.clientPaymentDetails);
                            if(result.adjInfn.clientPaymentDetails != null) {

                                for(var item = 0; item<result.adjInfn.clientPaymentDetails.length; item++) {
                                    var clientPaymentDetail=new ClientPaymentDto();
                                    clientPaymentDetail.clearAll();
                                    clientPaymentDetail.setClientId(result.adjInfn.clientPaymentDetails[item].clientId);
                                    clientPaymentDetail.setClientName(result.adjInfn.clientPaymentDetails[item].clientName);
                                    clientPaymentDetail.setClientPaymentAmount(result.adjInfn.clientPaymentDetails[item].clientPaymentAmount);
                                    clientPaymentDetail.setClientPaymentId(result.adjInfn.clientPaymentDetails[item].clientPaymentId);
                                    clientPaymentDetail.setLoanAccountId(result.adjInfn.clientPaymentDetails[item].loanAccountId);
                                    if(result.adjInfn.clientPaymentDetails[item].totalOverdueAmount < 0){
                                        clientPaymentDetail.setTotalOverdueAmount(0);
                                    }else{
                                        clientPaymentDetail.setTotalOverdueAmount(result.adjInfn.clientPaymentDetails[item].totalOverdueAmount);
                                    }
                                    clientPaymentDetail.setTotalOutstandingAmount(result.adjInfn.clientPaymentDetails[item].totalOutstandingAmount);
                                    clientPaymentDetail.setTotalAmountDemanded(result.adjInfn.clientPaymentDetails[item].totalAmountDemanded);
                                    clientPaymentDetail.setTotalAmountPaid(result.adjInfn.clientPaymentDetails[item].totalAmountPaid);
                                    clientPaymentDetail.setTotalInstallmentAmount(result.adjInfn.clientPaymentDetails[item].totalInstallmentAmount);
                                    clientPaymentDetail.setAccountStateId(result.adjInfn.clientPaymentDetails[item].accountStateId);
                                    clientPaymentObjArray[item] = clientPaymentDetail;
                                }
                            }

                            var groupClientPaymentDetail=new ClientPaymentDto();
                            groupClientPaymentDetail.clearAll();
                            /*customlog.info("clientId "+result.adjInfn.paymentDetails.clientId);
                             customlog.info("clientPaymentObjArray "+result.adjInfn.paymentDetails.clientName);
                             customlog.info("clientPaymentAmount "+result.adjInfn.paymentDetails.clientPaymentAmount);
                             customlog.info("clientPaymentId "+result.adjInfn.paymentDetails.clientPaymentId);
                             customlog.info("totalOverdueAmount "+result.adjInfn.paymentDetails.totalOverdueAmount);
                             customlog.info("totalOutstandingAmount "+result.adjInfn.paymentDetails.totalOutstandingAmount);
                             customlog.info("totalAmountDemanded "+result.adjInfn.paymentDetails.totalAmountDemanded);
                             customlog.info("totalAmountPaid "+result.adjInfn.paymentDetails.totalAmountPaid);
                             customlog.info("totalInstallmentAmount "+result.adjInfn.paymentDetails.totalInstallmentAmount);*/
                            if(result.adjInfn.paymentDetails != null) {
                                groupClientPaymentDetail.setClientId(result.adjInfn.paymentDetails.clientId);
                                groupClientPaymentDetail.setClientName(result.adjInfn.paymentDetails.clientName);
                                groupClientPaymentDetail.setClientPaymentAmount(result.adjInfn.paymentDetails.clientPaymentAmount);
                                groupClientPaymentDetail.setClientPaymentId(result.adjInfn.paymentDetails.clientPaymentId);
                                groupClientPaymentDetail.setLoanAccountId(result.adjInfn.paymentDetails.loanAccountId);
                                if(result.adjInfn.paymentDetails.totalOverdueAmount < 0){
                                    groupClientPaymentDetail.setTotalOverdueAmount(0);
                                }else{
                                    groupClientPaymentDetail.setTotalOverdueAmount(result.adjInfn.paymentDetails.totalOverdueAmount);
                                }
                                groupClientPaymentDetail.setTotalOutstandingAmount(result.adjInfn.paymentDetails.totalOutstandingAmount);
                                groupClientPaymentDetail.setTotalAmountDemanded(result.adjInfn.paymentDetails.totalAmountDemanded);
                                groupClientPaymentDetail.setTotalAmountPaid(result.adjInfn.paymentDetails.totalAmountPaid);
                                groupClientPaymentDetail.setTotalInstallmentAmount(result.adjInfn.paymentDetails.totalInstallmentAmount);
                            }
                            if(result.adjInfn.glCodes != null) {
                                for(var item = 0; item<result.adjInfn.glCodes.length; item++) {
                                    var glCodeDto=new GLCodeDto();
                                    glCodeDto.clearAll();
                                    glCodeDto.setGlcodeId(result.adjInfn.glCodes[item].glcodeId);
                                    glCodeDto.setGlcode(result.adjInfn.glCodes[item].glcode);
                                    glCodeDto.setGlname(result.adjInfn.glCodes[item].glname);
                                    glCodeDto.setOfficeId(result.adjInfn.glCodes[item].officeId);
                                    glCodeDto.setCashOrBank(result.adjInfn.glCodes[item].cashOrBank);
                                    customlog.info("getGlcodeId ==== "+glCodeDto.getGlcodeId());
                                    customlog.info("getClientId ==== "+glCodeDto.getGlname());
                                    customlog.info("getCashOrBank ==== "+glCodeDto.getCashOrBank());
                                    glCodeObjArray[item] = glCodeDto;
                                }
                            }
                            if(result.adjInfn.revertReasons != null) {
                                for(var item = 0; item<result.adjInfn.revertReasons.length; item++) {
                                    var valueListElement = new ValueListElement();
                                    valueListElement.setId(result.adjInfn.revertReasons[item].id);
                                    valueListElement.setName(result.adjInfn.revertReasons[item].name);
                                    valueListElementObjArray[item] = valueListElement;
                                }
                            }
                            var loanAdjustment=new LoanAdjustment();
                            loanAdjustment.clearAll();
                            if(result.adjInfn.clientPaymentDetails != null) {
                                for(var j = 0; j<result.adjInfn.clientPaymentDetails.length; j++) {
                                    if(result.adjInfn.clientPaymentDetails[j].accountStateId == 19){
                                        loanAdjustment.setIsRevertPaymentNotApplicable(true);
                                        break;
                                    } else{
                                        loanAdjustment.setIsRevertPaymentNotApplicable(false);
                                    }
                                }
                            }
                            if(result.adjInfn != null) {
                                loanAdjustment.setGlobalAccountNum(result.adjInfn.globalAccountNum);
                                loanAdjustment.setClientPaymentDetails(clientPaymentObjArray);
                                loanAdjustment.setAdjustmentNote(result.adjInfn.adjustmentNote);
                                loanAdjustment.setRevertReason(result.adjInfn.revertReason);
                                loanAdjustment.setFinancialYearEndDate(convertYYYYMMDDToDDMMYYYYFormat(result.adjInfn.financialYearEndDate));
                                loanAdjustment.setPaymentId(result.adjInfn.paymentId);
                                loanAdjustment.setPaymentDetails(groupClientPaymentDetail);
                                loanAdjustment.setOfficeId(result.adjInfn.officeId);
                                loanAdjustment.setGlCodeId(result.adjInfn.glCodeId);
                                loanAdjustment.setPreviousPaymentDate(convertYYYYMMDDToDDMMYYYYFormat(result.adjInfn.previousPaymentDate));
                                if(result.adjInfn.nextPaymentDate != null)
                                    loanAdjustment.setNextPaymentDate(convertYYYYMMDDToDDMMYYYYFormat(result.adjInfn.nextPaymentDate));
                                else
                                    loanAdjustment.setNextPaymentDate(result.adjInfn.nextPaymentDate);
                                loanAdjustment.setPaymentType(result.adjInfn.paymentType);
                                loanAdjustment.setAmount(result.adjInfn.amount);
                                loanAdjustment.setTransactionDate(convertYYYYMMDDToDDMMYYYYFormat(result.adjInfn.transactionDate));
                                loanAdjustment.setGlCodes(glCodeObjArray);
                                loanAdjustment.setRevertReasons(valueListElementObjArray);
                                loanAdjustment.setReceiptId(result.adjInfn.receiptId);
                                loanAdjustment.setReceiptDate(result.adjInfn.receiptDate);
                                loanAdjustment.setVoucherNumber(result.adjInfn.voucherNumber); // Praveen [Production Issue]
                                loanAdjustment.setPaymentComments(result.adjInfn.paymentComments);
                                customlog.info("Glcode==="+result.adjInfn.revertReasons[0].name);
                                customlog.info("Glcode==="+result.adjInfn.revertReasons[0].id);
                                //customlog.info("Glcode==="+result.adjInfn.revertReasons[2].name);
                            }
                            if(req.session.afterDoApplyAdjustment != 1){
                                req.session.adjustmentMonthClosingError = "";
                            }
                            req.session.afterDoApplyAdjustment = 0;
                            res.render('loan_recovery/ApplyAdjustmentForm',{adjustmentMonthClosingError:req.session.adjustmentMonthClosingError,loanAdjustment:loanAdjustment,accountId : accountId,accountTypeId : accountTypeId ,groupName : req.session.groupCenterMifosName, contextPath:props.contextPath});
                        }
                        else{
                            self.commonRouter.showErrorPage(req,res);
                        }

                    }
                });
            }
        }catch(e){
            customlog.error("Exception while apply adjustment "+e);
            self.commonRouter.showErrorPage(req,res);
        }
    },

    doapplyadjustment : function(req, res){
        try{
            var self = this;
            var clientPaymentObjArray = new Array();
            //var accountId = parseInt(req.body.accountId,10);
            //var accountTypeId = req.body.accountTypeId;
            var globalAccountNum = req.body.globalAccountNum;
            var isRevert = req.body.revertPayment;

            var transactionDate = convertToMifosDateFormat(req.body.dateofTransaction);
            var sourceofPayment = req.body.sourceofPayment;
            var chequeNo = req.body.chequeNo;
            var chequeDate = new Date(convertToMifosDateFormat(req.body.chequeDate));
            var amount = req.body.amount;
            //customlog.info("Amount----------------------"+amount);
            //customlog.info("Data="+chequeNo+"--"+chequeDate+"--"+transactionDate+"--"+sourceofPayment+"--"+isRevert);
            var noOfClients = parseInt(req.body.noOfClients,10);

            var clientsId = req.body.clientsId.split(",");
            var clientsName = req.body.clientsName.split(",");
            var clientAmounts = req.body.clientAmounts.split(",");
            if(noOfClients >0 ){
                var ClientPaymentDto = require(loanRecoveryDtoPath +"/ClientPaymentDto");
                for(var item =0 ; item < noOfClients; item++) {
                    var clientPaymentDto=new ClientPaymentDto();
                    clientPaymentDto.clearAll();
                    //customlog.info("Client Id====="+clientsId[item]);
                    //customlog.info("clientsName====="+clientsName[item]);
                    //customlog.info("clientAmounts====="+clientAmounts[item]);
                    clientPaymentDto.setClientId(clientsId[item]);
                    clientPaymentDto.setClientName(clientsName[item]);
                    clientPaymentDto.setClientPaymentAmount(clientAmounts[item]);
                    clientPaymentObjArray[item] = clientPaymentDto;

                }
            }
            var revertReason =req.body.revertReason;
            var adjustmentNote =req.body.voucherNotes;
            var paymentId = req.body.paymentId;

            var LoanAdjustmentHolder = require(loanRecoveryDtoPath +"/LoanAdjustment");
            var loanAdjustmentHolder=new LoanAdjustmentHolder();
            //loanAdjustmentHolder.clearAll();

            loanAdjustmentHolder.setGlobalAccountNum(globalAccountNum);
            loanAdjustmentHolder.setClientPaymentDetails(clientPaymentObjArray);
            loanAdjustmentHolder.setAdjustmentNote(adjustmentNote);
            loanAdjustmentHolder.setRevertReason(revertReason);
            loanAdjustmentHolder.setFinancialYearEndDate("");
            loanAdjustmentHolder.setPaymentId(paymentId);
            loanAdjustmentHolder.setGlCodeId(sourceofPayment);
            loanAdjustmentHolder.setAmount(amount);
            loanAdjustmentHolder.setTransactionDate(transactionDate);
            loanAdjustmentHolder.setTransactionDateStr(convertToDateWithSlashForApplyPayment(req.body.dateofTransaction));
            loanAdjustmentHolder.setReceiptId(chequeNo);
            loanAdjustmentHolder.setReceiptDate(chequeDate);
            loanAdjustmentHolder.setVoucherNumber(req.body.voucherNumber); // Praveen [Production Issue]
            if(isRevert == 'on')
                loanAdjustmentHolder.setAdjustData(false);
            else
                loanAdjustmentHolder.setAdjustData(true);


            var rest = require("./rest.js");
            var adjustmentDetail = JSON.stringify(loanAdjustmentHolder);
            customlog.info("accountDetail"+adjustmentDetail);
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
                    'Content-Length' : Buffer.byteLength(adjustmentDetail, 'utf8'),
                    'Cookie' : req.session.mifosCookie
                };

                var options = {
                    host: mifosServiceIP,
                    port: mifosPort,
                    path: '/mfi/api/account/loan/adjustment/applyAdjustment.json',
                    method: 'POST',
                    headers : postheaders
                };

                rest.postJSON(options,adjustmentDetail,function(statuscode,result,headers){
                    customlog.info("statuscode" + statuscode);
                    customlog.info("HEADERS:  "+headers)
                    customlog.info("RESULT"+result.status);
                    //customlog.info("RESULT"+result);
                    if(statuscode == 302){
                        res.redirect(props.contextPath+'/client/ci/logout');
                    }
                    else{
                        if(result.status == 'success'){
                            var activityDetails = new Array(iklantPort, req.session.tenantId, req.session.userId, req.session.userName, req.originalUrl, req.connection.remoteAddress, "router.js", "doapplyadjustment", "success", "Applyadjustment", "Applyadjustment made For PaymentId "+paymentId+" sucessfully","update");
                            self.commonRouter.insertActivityLogModel(activityDetails);
                            self.loanrecoveryloanaccounts(req,res);
                        }
                        else{
                            customlog.info("Apply Adjustment Error ="+result.error);
                            if(typeof result.error != 'undefined'){
                                req.session.adjustmentMonthClosingError = result.error;
                                req.session.afterDoApplyAdjustment = 1;
                                self.applyadjustment(req,res);
                            }
                            else{
                                self.commonRouter.showErrorPage(req,res);
                            }
                        }
                    }
                });
            }
        }catch(e){
            customlog.error("Exception while do apply adjustment "+e);
            self.commonRouter.showErrorPage(req,res);
        }
    },

    applyadjustmentwhenobligationmet : function(req,res) {
        try{
            var self = this;
            var officeId = req.body.officeId;
            var globalAccountNum = req.body.globalAccountNum;
            var paymentId = parseInt(req.body.paymentId,10);
            //customlog.info(officeId+"--"+globalAccountNum+"--"+paymentId);

            var rest = require("./rest.js");
            var applyAdjustmentDetail = JSON.stringify({
                globalAccountNum : globalAccountNum,
                officeId : officeId,
                paymentId : paymentId,
                adjKey : "adjustSpec"
            });

            customlog.info("accountDetail"+applyAdjustmentDetail);
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
                    'Content-Length' : Buffer.byteLength(applyAdjustmentDetail, 'utf8'),
                    'Cookie' : req.session.mifosCookie
                };

                var options = {
                    host: mifosServiceIP,
                    port: mifosPort,
                    path: '/mfi/api/account/loan/adjustment/loadObligationMet.json',
                    method: 'POST',
                    headers : postheaders
                };

                rest.postJSON(options,applyAdjustmentDetail,function(statuscode,result,headers){
                    customlog.info("statuscode" + statuscode);
                    customlog.info("HEADERS:  "+headers)
                    customlog.info("status"+result.status);
                    customlog.info("RESULT"+result);
                    customlog.info("globalAccountNum"+result.adjInfn.globalAccountNum);
                    customlog.info("amount"+result.adjInfn.amount);
                    customlog.info("paymentId"+result.adjInfn.paymentId);
                    var adjustablePaymentList = new Array();
                    if(statuscode == 302){
                        res.redirect(props.contextPath+'/client/ci/logout');
                    }
                    else{
                        if(result.status == 'success'){
                            var LoanAdjustmentHolderObj = require(loanRecoveryDtoPath +"/LoanAdjustment");
                            var loanAdjustment=new LoanAdjustmentHolderObj();
                            //loanAdjustmentHolder.clearAll();
                            if(result.adjInfn != null) {
                                loanAdjustment.setGlobalAccountNum(result.adjInfn.globalAccountNum);
                                loanAdjustment.setAdjustmentNote(result.adjInfn.adjustmentNote);
                                loanAdjustment.setPaymentId(result.adjInfn.paymentId);
                                loanAdjustment.setAmount(result.adjInfn.amount);
                                loanAdjustment.setVoucherNumber(result.adjInfn.voucherNumber); // Praveen [Production Issue]
                                res.render('loan_recovery/ApplyAdjustmentObligationMetForm',{loanAdjustment:loanAdjustment, contextPath:props.contextPath});
                            }
                        }
                        else{
                            self.commonRouter.showErrorPage(req,res);
                        }
                    }
                });
            }
        }catch(e){
            customlog.error("Exception while applyadjustmentwhenobligationmet "+e);
            self.commonRouter.showErrorPage(req,res);
        }
    },

    doapplyadjustmentwhenobligationmet : function(req,res) {
        try{
            var self = this;
            var globalAccountNum = req.body.globalAccountNum;
            var amount = req.body.amount;
            var revertReason = 0;
            var adjustmentNote =req.body.adjustmentNote;
            var paymentId = req.body.paymentId;
            //customlog.info("Amount----------------------"+amount+"----"+adjustmentNote+"---"+paymentId);

            var LoanAdjustmentHolderObj = require(loanRecoveryDtoPath +"/LoanAdjustment");
            var loanAdjustmentHolder= new LoanAdjustmentHolderObj();
            //loanAdjustmentHolder.clearAll();

            loanAdjustmentHolder.setGlobalAccountNum(globalAccountNum);
            loanAdjustmentHolder.setAdjustmentNote(adjustmentNote);
            loanAdjustmentHolder.setRevertReason(revertReason);
            loanAdjustmentHolder.setPaymentId(paymentId);
            loanAdjustmentHolder.setAmount(amount);
            loanAdjustmentHolder.setAdjustData(false);
            loanAdjustmentHolder.setVoucherNumber(req.body.voucherNumber); // Praveen [Production Issue]

            var rest = require("./rest.js");
            var adjustmentDetail = JSON.stringify(loanAdjustmentHolder);
            customlog.info("accountDetail"+adjustmentDetail);
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
                    'Content-Length' : Buffer.byteLength(adjustmentDetail, 'utf8'),
                    'Cookie' : req.session.mifosCookie
                };

                var options = {
                    host: mifosServiceIP,
                    port: mifosPort,
                    path: '/mfi/api/account/loan/adjustment/applyAdjustment.json',
                    method: 'POST',
                    headers : postheaders
                };

                rest.postJSON(options,adjustmentDetail,function(statuscode,result,headers){
                    customlog.info("statuscode" + statuscode);
                    customlog.info("HEADERS:  "+headers)
                    customlog.info("RESULT"+result.status);
                    customlog.info("RESULT"+result);
                    if(statuscode == 302){
                        res.redirect(props.contextPath+'/client/ci/logout');
                    }
                    else{
                        if(result.status == 'success'){
                            var activityDetails = new Array(iklantPort, req.session.tenantId, req.session.userId, req.session.userName, req.originalUrl, req.connection.remoteAddress, "router.js", "doapplyadjustmentwhenobligationmet", "success", "Applyadjustmentwhenobligationmet", "Paymentid "+paymentId+" Apply Adjustment Made successfully","update");
                            self.commonRouter.insertActivityLogModel(activityDetails);
                            self.loanrecoveryloanaccounts(req,res);
                        }
                        else{
                            self.commonRouter.showErrorPage(req,res);
                        }
                    }
                });
            }
        }catch(e){
            customlog.error("Exception while doapplyadjustmentwhenobligationmet "+e);
            self.commonRouter.showErrorPage(req,res);
        }
    },

    //For Preclosure By Bask:1939
    editaccountstatus : function(req,res) {
        try{
            var self = this;
            var accountId = parseInt(req.session.accountId,10);
            var accountTypeId = req.body.accountTypeId;
            var globalAccountNum = req.body.globalAccountNum;
            var rest = require("./rest.js");
            var editAccountStatusDetail = JSON.stringify({
                accountId : accountId
            });
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
                    'Content-Length' : Buffer.byteLength(editAccountStatusDetail, 'utf8'),
                    'Cookie' : req.session.mifosCookie
                };

                var options = {
                    host: mifosServiceIP,
                    port: mifosPort,
                    path: '/mfi/api/account/loan/editStatus/load.json',
                    method: 'POST',
                    headers : postheaders
                };

                rest.postJSON(options,editAccountStatusDetail,function(statuscode,result,headers){
                    customlog.info("statuscode" + statuscode);
                    customlog.info("HEADERS:  "+headers)
                    customlog.info("status"+result.status);
                    customlog.info("RESULT"+result.statusInfn);
                    if(statuscode == 302){
                        res.redirect(props.contextPath+'/client/ci/logout');
                    }
                    else{
                        if(result.status == 'success'){
                            var LoanStatusHolder = require(loanRecoveryDtoPath +"/LoanStatusHolder");
                            var loanStatusHolder = new LoanStatusHolder();
                            if(result.statusInfn != null){
                                loanStatusHolder.setFinancialYearEndDate(convertYYYYMMDDToDDMMYYYYFormat(result.statusInfn.financialYearEndDate));
                                loanStatusHolder.setLastPaymentDate(convertYYYYMMDDToDDMMYYYYFormat(result.statusInfn.lastPaymentDate));
                                loanStatusHolder.setTransactionDate(convertDate(result.statusInfn.transactionDate));
                                loanStatusHolder.setAccountId(result.statusInfn.accountId);
                                loanStatusHolder.setNotes(result.statusInfn.notes);
                                loanStatusHolder.setNewStatusId(result.statusInfn.newStatusId);
                                loanStatusHolder.setAllowBackDatedApprovals(result.statusInfn.allowBackDatedApprovals);
                                loanStatusHolder.setAccountTypeId(result.statusInfn.accountTypeId);
                                loanStatusHolder.setCurrentStatusId(result.statusInfn.currentStatusId);
                                loanStatusHolder.setGlobalAccountNum(result.statusInfn.globalAccountNum);
                                loanStatusHolder.setAccountName(result.statusInfn.accountName);
                                loanStatusHolder.setInput(result.statusInfn.input);
                            }
                            customlog.info("req.session.accountStateName==="+req.session.accountStateName.split("-")[1].replace( /([a-z])([A-Z])/g, "$1 $2"));

                            res.render('loan_recovery/editStatus',{loanStatusHolder:loanStatusHolder,accountId : accountId,accountTypeId : accountTypeId ,groupName : req.session.groupCenterMifosName,accountStateName:req.session.accountStateName.split("-")[1].replace( /([a-z])([A-Z])/g, "$1 $2"), contextPath:props.contextPath});
                        }
                        else{
                            self.commonRouter.showErrorPage(req,res);
                        }
                    }
                });
            }
        }catch(e){
            customlog.error("Exception while editaccountstatus "+e);
            self.commonRouter.showErrorPage(req,res);
        }
    },

    doeditaccountstatus : function(req,res) {
        try{
            var self = this;
            var newStatus = req.body.currentStatus;
            customlog.info("req.body.dateofTransaction"+req.body.dateofTransaction);
            var dateofTransaction = new Date(convertChequeDateIntoMifosFormat(req.body.dateofTransaction));
            var notes = req.body.notes;
            var accountId = parseInt(req.session.accountId,10);

            //customlog.info(newStatus+"--"+dateofTransaction+"--"+notes+req.session.accountId);
            var LoanStatusHolder = require(loanRecoveryDtoPath +"/LoanStatusHolder");
            var loanStatusHolder = new LoanStatusHolder();
            loanStatusHolder.setTransactionDate(dateofTransaction);
            loanStatusHolder.setAccountId(accountId);
            loanStatusHolder.setNotes(notes);
            loanStatusHolder.setNewStatusId(newStatus);

            var rest = require("./rest.js");
            var editStatusDetail = JSON.stringify(loanStatusHolder);
            customlog.info("editStatusDetail"+editStatusDetail);
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
                    'Content-Length' : Buffer.byteLength(editStatusDetail, 'utf8'),
                    'Cookie' : req.session.mifosCookie
                };

                var options = {
                    host: mifosServiceIP,
                    port: mifosPort,
                    path: '/mfi/api/account/loan/editStatus/update.json',
                    method: 'POST',
                    headers : postheaders
                };

                rest.postJSON(options,editStatusDetail,function(statuscode,result,headers){
                    customlog.info("statuscode" + statuscode);
                    customlog.info("HEADERS:  "+headers)
                    customlog.info("RESULT"+result.status);
                    customlog.info("RESULT"+result);
                    if(statuscode == 302){
                        res.redirect(props.contextPath+'/client/ci/logout');
                    }
                    else{
                        if(result.status == 'success'){
                            var activityDetails = new Array(iklantPort, req.session.tenantId, req.session.userId, req.session.userName, req.originalUrl, req.connection.remoteAddress, "router.js", "doeditaccountstatus", "success", "Edit Account Status", "AccountId "+accountId+" Account Status Edited successfully","update");
                            self.commonRouter.insertActivityLogModel(activityDetails);
                            //req.session.loanStatusId = 3;
                            //customlog.info("req.session.loanStatusId"+req.session.loanStatusId);
                            self.loanrecoveryloanaccounts(req,res);
                            //customlog.info("Successsssssssss");
                        }
                        else{
                            self.commonRouter.showErrorPage(req,res);
                        }
                    }
                });
            }
        }catch(e){
            customlog.error("Exception while doeditaccountstatus "+e);
            self.commonRouter.showErrorPage(req,res);
        }

    },
    paymentVerificationLoad : function(req,res){
        try{
            var self = this;
            var officeId;
            var personnelId = req.body.abc;
            var officeIdsadas = req.body.officeId;
            var loanAccountInformationDto = require(loanRecoveryDtoPath +"/loanAccountInformationDto");
            var loanAccInformationDto = new loanAccountInformationDto();
            if(req.session.roleId == this.constants.getFOroleId() ) {
                officeId 	=  req.session.officeId;
                personnelId	=  req.session.userId;
            }else if (req.session.roleId == this.constants.getSMHroleId() ) {
                officeId 	=  -1;
                personnelId	=  -1;
            }
            //else if (req.session.roleId == this.constants.getAccountsExecutiveRoleId() ) {
            else  {
                officeId 	=  req.session.officeId;
            }

            loanAccInformationDto.setOfficeId(officeId);
            loanAccInformationDto.setPersonnelId(personnelId);

            var rest = require("./rest.js");
            var loanAccInformationDetail = JSON.stringify(loanAccInformationDto);
            customlog.info("loanAccInformationDetail"+loanAccInformationDetail);
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
                    'Content-Length' : Buffer.byteLength(loanAccInformationDetail, 'utf8'),
                    'Cookie' : req.session.mifosCookie
                };
                var options = {
                    host: mifosServiceIP,
                    port: mifosPort,
                    path: '/mfi/api/account/loan/repayment/cashReceipt/load.json',
                    method: 'POST',
                    headers : postheaders
                };

                rest.postJSON(options,loanAccInformationDetail,function(statuscode,result,headers){
                    customlog.info("statuscode" + statuscode);
                    customlog.info("HEADERS:  "+headers)
                    customlog.info("RESULT"+result.status);
                    if(statuscode == 302){
                        res.redirect(props.contextPath+'/client/ci/logout');
                    }
                    else{
                        if(result.status == 'success'){
                            var PaymentCollectionArray = new Array();
                            for(var i=0; i<result.paymentInfn.length;i++) {
                                var PaymentCollectionDetailDto = require(loanRecoveryDtoPath +"/PaymentCollectionDetailDto");
                                var PaymentCollectionDetail = new PaymentCollectionDetailDto();
                                customlog.info("Receipt Number" + "i== " + i +  result.paymentInfn[i].receiptNum);
                                PaymentCollectionDetail.setPaymentCollectionId(result.paymentInfn[i].paymentCollectionId);
                                PaymentCollectionDetail.setAmount(result.paymentInfn[i].amount);
                                PaymentCollectionDetail.setClientAmount(result.paymentInfn[i].clientAmount);
                                PaymentCollectionDetail.setGroupId(result.paymentInfn[i].groupId);
                                PaymentCollectionDetail.setGroupName(result.paymentInfn[i].groupName);
                                PaymentCollectionDetail.setGlobalAccNum(result.paymentInfn[i].globalAccNum);
                                PaymentCollectionDetail.setModeOfPayment(result.paymentInfn[i].modeOfPayment);
                                var fileLocationArray = new Array();

                                if(result.paymentInfn[i].receiptNum == null){
                                    PaymentCollectionDetail.setReceiptId('-');
                                }else{
                                    PaymentCollectionDetail.setReceiptId(result.paymentInfn[i].receiptNum);
                                }
                                var fileLocationArray = new Array();
                                var docTypeIdArray = new Array();
                                PaymentCollectionDetail.setIsApplyPayment(result.paymentInfn[i].isApplyPayment);
                                if(result.paymentInfn[i].fileLocation != null ){
                                    fileLocationArray = result.paymentInfn[i].fileLocation.split(",");
                                    docTypeIdArray = result.paymentInfn[i].docId.split(",");
                                    PaymentCollectionDetail.setFileLocation(fileLocationArray);
                                    PaymentCollectionDetail.setDocId(docTypeIdArray);
                                }else{
                                    PaymentCollectionDetail.setFileLocation(fileLocationArray);
                                    PaymentCollectionDetail.setDocId(docTypeIdArray);
                                }
                                PaymentCollectionArray.push(PaymentCollectionDetail);
                            }
                            customlog.info(PaymentCollectionArray);
                            res.render('loan_recovery/PaymentVerification.jade',{PaymentCollectionArray : PaymentCollectionArray,personnelIdArray : req.session.personnelIdArray,personnelNameArray : req.session.personnelNameArray,officeId:req.session.officeId,personnelId : personnelId, contextPath:props.contextPath});
                        }
                        else{
                            self.commonRouter.showErrorPage(req,res);
                        }
                    }
                });
            }
        }catch(e){
            customlog.error("Exception while paymentVerificationLoad "+e);
            self.commonRouter.showErrorPage(req,res);
        }
    },

    doPaymentVerification : function(req,res){
        try{
            var self = this;
            var paymentCollectionId = parseInt(req.body.paymentCollectionId,10);
            var amount = req.body.amount;
            var groupName = req.body.groupName;
            var globalAccNum = req.body.globalAccNum;
            var modeOfPayment = req.body.modeOfPayment;
            var isMatch = req.body.isMatch;
            var officeId = req.body.officeId;
            var PaymentCollectionDetailDto = require(loanRecoveryDtoPath +"/PaymentCollectionDetailDto");
            var PaymentCollectionDetail = new PaymentCollectionDetailDto();
            PaymentCollectionDetail.setPaymentCollectionId(paymentCollectionId);
            PaymentCollectionDetail.setAmount(amount);
            PaymentCollectionDetail.setGroupName(groupName);
            PaymentCollectionDetail.setGlobalAccNum(globalAccNum);
            PaymentCollectionDetail.setModeOfPayment(modeOfPayment);
            PaymentCollectionDetail.setIsMatch((isMatch==1)?true:false);
            PaymentCollectionDetail.setOfficeId(officeId);


            var rest = require("./rest.js");
            var PaymentCollectionDetail = JSON.stringify(PaymentCollectionDetail);
            customlog.info("PaymentCollectionDetail"+PaymentCollectionDetail);
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
                    'Content-Length' : Buffer.byteLength(PaymentCollectionDetail, 'utf8'),
                    'Cookie' : req.session.mifosCookie
                };
                var options = {
                    host: mifosServiceIP,
                    port: mifosPort,
                    path: '/mfi/api/account/loan/repayment/cashReceipt/update.json',
                    method: 'POST',
                    headers : postheaders
                };

                rest.postJSON(options,PaymentCollectionDetail,function(statuscode,result,headers){
                    customlog.info("statuscode" + statuscode);
                    customlog.info("HEADERS:  "+headers)
                    customlog.info("RESULT"+result.status);
                    if(statuscode == 302){
                        res.redirect(props.contextPath+'/client/ci/logout');
                    }
                    else{
                        if(result.status == 'success'){
                            var activityDetails = new Array(iklantPort, req.session.tenantId, req.session.userId, req.session.userName, req.originalUrl, req.connection.remoteAddress, "router.js", "doPaymentVerification", "success", "Payment Verification", "PaymentCollectionId "+paymentCollectionId+" PaymentVerification Done successfully","insert");
                            self.commonRouter.insertActivityLogModel(activityDetails);
                            //self.paymentVerificationLoad(req,res);
                            var smsConstants = new SmsConstants();
                            //Ezra Johnson
                            if(isMatch == 1){
                                self.shortMessagingRouter.getAlertStatus(smsConstants.getPaymentCollectionId(),function(callbackStatus, smsAlertStatus){
                                    if(smsAlertStatus){
                                        customlog.debug("Constructing message for sending SMS after payment collection");
                                        self.getClientPaymentsDetail(paymentCollectionId,function(status,paymentCollectionsArray){
                                            if(status === 'success'){
                                                self.shortMessagingRouter.sendPaymentCollectionSMS(paymentCollectionsArray);
                                            }else {
                                                customlog.error("error occured querying the mobile number of the clients");
                                            }
                                        });
                                    }
                                });
                            }
                            req.body.status = result.status;
                            res.send(req.body.status);
                        }
                        else if(result.status == 'failure'){
                            req.body.status = result.status;
                            res.send(req.body.status);
                        }else{
                            {
                                self.commonRouter.showErrorPage(req,res);
                            }
                        }
                    }
                });
            }
        }catch(e){
            customlog.error("Exception while dopaymentverification "+e);
            self.commonRouter.showErrorPage(req,res);
        }
    },

    getClientPaymentsDetail: function(paymentCollectionId,callback){
        this.model.getClientPaymentsDetailModel(paymentCollectionId,callback);
    },

    downloadPaymentVerificationImage : function(req,res){
        try{
            var self = this;
            var fileLocation = req.body.fileLocation;
            var fileName = fileLocation.split("/");
            res.download(fileLocation,fileName[2], function(err){
                if (err) {
                    customlog.error(err);
                } else {
                    // decrement a download credit etc
                }
            });
        }
        catch(e){
            customlog.error("Exception while downloadpaymentverificationimage "+e);
            self.commonRouter.showErrorPage(req,res);
        }
    },

    chequeBounceLoad : function(req,res){
        try{
            var self = this;
            if(typeof (req.session.tenantId) == 'undefined' || typeof (req.session.userId) == 'undefined') {
                res.redirect(props.contextPath+'/client/ci/login');
            }else{
                res.render('loan_recovery/ChequeBounce',{chequeDetail:0, contextPath:props.contextPath});
            }
        }catch(e){
            customlog.error("Exception while chequebounceload "+e);
            self.commonRouter.showErrorPage(req,res);
        }
    },

    searchChequeBounceLoad : function(req,res){
        try{
            var self = this;
            var chequeNo = req.body.searchChequeNo;
            if(chequeNo.length < 6 | chequeNo.length > 7){
                res.render('loan_recovery/ChequeBounce',{chequeDetail:2, contextPath:props.contextPath});
            }
            else {
                var rest = require("./rest.js");
                var chequeBounceDetail = "";
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
                        'Cookie' : req.session.mifosCookie
                    };
                    var options = {
                        host: mifosServiceIP,
                        port: mifosPort,
                        path: "/mfi/api/account/loan/repayment/chequeDishonor/load-"+chequeNo+".json",
                        method: 'GET',
                        headers : postheaders
                    };

                    rest.getJSON(options,function(statuscode,result,headers){
                        customlog.info("statuscode" + statuscode);
                        customlog.info("HEADERS:  "+headers)
                        customlog.info("RESULT"+result.status);
                        if(statuscode == 302){
                            res.redirect(props.contextPath+'/client/ci/logout');
                        }
                        else{
                            if(result.status == 'success'){
                                var PaymentCollectionDetailDto = require(loanRecoveryDtoPath +"/PaymentCollectionDetailDto");
                                var PaymentCollectionDetail = new PaymentCollectionDetailDto();
                                if(result.accPayInfn != null) {
                                    PaymentCollectionDetail.setAmount(parseInt(result.accPayInfn.amount,10)|| 0);
                                    PaymentCollectionDetail.setGroupName(result.accPayInfn.groupName);
                                    PaymentCollectionDetail.setGlobalAccNum(result.accPayInfn.globalAccNum);
                                    PaymentCollectionDetail.setOfficeId(result.accPayInfn.officeId);
                                    PaymentCollectionDetail.setChequeNumber(result.accPayInfn.chequeNumber);
                                    PaymentCollectionDetail.setChequeDate(result.accPayInfn.chequeDate);
                                    PaymentCollectionDetail.setPaymentId(result.accPayInfn.paymentId);
                                    PaymentCollectionDetail.setPaymentCollectionId(result.accPayInfn.paymentCollectionId);
                                    customlog.info(result.accPayInfn.paymentCollectionId);
                                }
                                res.render('loan_recovery/ChequeBounce',{PaymentCollectionDetail:PaymentCollectionDetail,chequeDetail:1, contextPath:props.contextPath});
                            }
                            else {
                                self.commonRouter.showErrorPage(req,res);
                            }
                        }
                    });
                }
            }
        }catch(e){
            customlog.error("Exception while searchChequeBounceLoad "+e);
            self.commonRouter.showErrorPage(req,res);
        }
    },

    revertChequePayment : function(req,res){
        try{
            var self = this;
            var PaymentCollectionDetailDto = require(loanRecoveryDtoPath +"/PaymentCollectionDetailDto");
            var PaymentCollectionDetail = new PaymentCollectionDetailDto();
            PaymentCollectionDetail.setPaymentId(req.body.paymentId);
            PaymentCollectionDetail.setGlobalAccNum(req.body.globalAccountNum);
            PaymentCollectionDetail.setPaymentCollectionId(req.body.paymentCollectionId);


            var rest = require("./rest.js");
            var PaymentCollectionDetail = JSON.stringify(PaymentCollectionDetail);
            customlog.info("PaymentCollectionDetail"+PaymentCollectionDetail);
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
                    'Content-Length' : Buffer.byteLength(PaymentCollectionDetail, 'utf8'),
                    'Cookie' : req.session.mifosCookie
                };
                var options = {
                    host: mifosServiceIP,
                    port: mifosPort,
                    path: '/mfi/api/account/loan/repayment/chequeDishonor/update.json',
                    method: 'POST',
                    headers : postheaders
                };

                rest.postJSON(options,PaymentCollectionDetail,function(statuscode,result,headers){
                    customlog.info("statuscode" + statuscode);
                    customlog.info("HEADERS:  "+headers)
                    customlog.info("RESULT"+result.status);
                    if(statuscode == 302){
                        res.redirect(props.contextPath+'/client/ci/logout');
                    }
                    else{
                        if(result.status == 'success'){
                            var activityDetails = new Array(iklantPort, req.session.tenantId, req.session.userId, req.session.userName, req.originalUrl, req.connection.remoteAddress, "router.js", "revertChequePayment", "success", "Cheque Deposit", "PaymentCollectionId "+req.body.paymentId+" ChequePayment Reverted successfully","update");
                            self.commonRouter.insertActivityLogModel(activityDetails);
                            //self.chequeBounceLoad(req,res);
                            req.body = result.status;
                            res.send(req.body);
                        }
                        else {
                            req.body = result.status;
                            res.send(req.body);
                        }
                    }
                });
            }
        }catch(e){
            customlog.error("Exception while revertchequepayment "+e);
            self.commonRouter.showErrorPage(req,res);
        }
    },
    lrFSOTravellingPath : function(req,res){
        try{
            console.log("Inside lrFSOTravellingPath");
            var self = this;
            var personnelIdArray = new Array();
            var personnelNameArray = new Array();
            var rest = require("./rest.js");
            var http = require('http');
            var https = require('https');
            if(typeof (req.session.tenantId) == 'undefined' || typeof (req.session.userId) == 'undefined') {
                res.redirect(props.contextPath+'/client/ci/login');
            }else{
                var postheaders = {
                    'Content-Type' : 'application/json',
                    'Cookie' : req.session.mifosCookie
                };
                var options = {
                    host: mifosServiceIP,
                    port: mifosPort,
                    path: "/mfi/api/account/loan/office-"+req.session.officeId+".json",
                    method: 'GET',
                    headers : postheaders
                };
                //console.log("Path==" + options.path);
                rest.getJSON(options,function(statuscode,result,headers){
                    console.log(statuscode);
                    if(statuscode == 302) {
                        res.redirect('/mfi/api/1.0/client/ci/logout');
                    }
                    else if(result.status == "success") {
                        if(result.loanOfficerList.length == 0){
                            res.render('loan_recovery/PaymentVerification.jade',{personnelIdArray : req.session.personnelIdArray,personnelNameArray : req.session.personnelNameArray,officeId:req.session.officeId,personnelId : "0"});
                        }
                        else{
                            for(var i=0;i<result.loanOfficerList.length;i++){
                                personnelIdArray [i] = result.loanOfficerList[i].personnelId;
                                personnelNameArray[i] = result.loanOfficerList[i].displayName;
                            }
                            req.session.personnelIdArray = personnelIdArray;
                            req.session.personnelNameArray = personnelNameArray;
                            res.render('loan_recovery/LRFSOTravellingPath.jade',{personnelIdArray : req.session.personnelIdArray,
                                personnelNameArray : req.session.personnelNameArray,officeId:req.session.officeId,personnelId : "0",
                                contextPath:props.contextPath});
                        }
                    } else {
                        self.commonRouter.showErrorPage(req,res);
                    }
                });
            }
            //res.render('LRFSOTravellingPath.jade');
        }catch(e){
            customlog.error("Exception while lrFSOTravellingPath "+e);
            self.commonRouter.showErrorPage(req,res);
        }

    },
    FSOTravellingPath : function(req,res){
        try{
            var jsonArray = JSON.stringify('');
            console.log("Inside FSOTravellingPath " + req.body.loanOfficerId);
            var self = this;
            if(typeof (req.session.tenantId) == 'undefined' || typeof (req.session.userId) == 'undefined') {
                res.redirect(props.contextPath+'/client/ci/login');
            }else{
                var rest = require("./rest.js");
                var http = require('http');
                var https = require('https');
                var loanDetails = new Array();
                var postheaders = {
                    'Content-Type' : 'application/json',
                    'Content-Length' : Buffer.byteLength(jsonArray, 'utf8'),
                    'Cookie' : req.session.mifosCookie
                };
                var options = {
                    host: mifosServiceIP,
                    port: mifosPort,
                    path: "/mfi/api/group/lrGPSTracking/account/loan/personnel/due-"+req.body.loanOfficerId+"-"+req.session.officeId+".json",
                    method: 'POST',
                    headers : postheaders
                };
                var CustomerDetailDto1 = require(loanRecoveryDtoPath+"/CustomerDetailDto");
                var CustomerDetailDto = new CustomerDetailDto1();
                rest.postJSON(options,jsonArray,function(statuscode,result,headers){
                    console.log(statuscode);
                    if(statuscode == 302){
                        res.redirect('/mfi/api/1.0/client/ci/logout');
                    }
                    else if(result.status == "success") {
                        if (result.loanList.length == 0){

                        }
                        else {
                            var i=0;
                            for(var item = 0; item<result.loanList.length; item++) {
                                var LoanRepaymentForFO1 = require(loanRecoveryDtoPath +"/LoanRepaymentForFO");
                                var LoanRepaymentForFO = new LoanRepaymentForFO1();

                                //if(result.loanList[item].displayLoan == true){
                                LoanRepaymentForFO.setClientId(result.loanList[item].clientId);
                                LoanRepaymentForFO.setClientName(result.loanList[item].clientName);
                                LoanRepaymentForFO.setLoanAccountId(result.loanList[item].loanAccountId);
                                LoanRepaymentForFO.setGlobalAccountNum(result.loanList[item].globalAccountNum);
                                LoanRepaymentForFO.setDisplayloan(result.loanList[item].displayLoan);
                                LoanRepaymentForFO.setAddress(result.loanList[item].address);
                                LoanRepaymentForFO.setStartLatitude(result.loanList[item].startLatitude);
                                LoanRepaymentForFO.setStartLongitude(result.loanList[item].startLongitude);
                                LoanRepaymentForFO.setPhoneNumber(result.loanList[item].phoneNumber);
                                LoanRepaymentForFO.setInstallmentId(result.loanList[item].installmentId);
                                LoanRepaymentForFO.setDisplayLoan(result.loanList[item].displayLoan);
                                LoanRepaymentForFO.setOfficeAddress(result.loanList[item].officeAddress);
                                if(result.loanList[item].customerCustomNumber != null) {
                                    LoanRepaymentForFO.setGroupCode(result.loanList[item].customerCustomNumber);
                                } else {
                                    LoanRepaymentForFO.setGroupCode(" ");
                                }
                                LoanRepaymentForFO.setActionDate(result.loanList[item].actionDate);
                                loanDetails[i] = LoanRepaymentForFO;
                                i = i+1;
                                //}
                            }
                        }

                        self.model.getCurrentPositionModel(req.body.loanOfficerId, function(latitide,longitude){
                            req.body.loanDetails = loanDetails;
                            req.body.currentLatitide = latitide;
                            req.body.currentLongitude = longitude;
                            //console.log(latitide + ", " + longitude);
                            res.send(req.body);
                        });
                    } else {
                        self.commonRouter.showErrorPage(req,res);
                    }

                });
            }
        }catch(e){
            customlog.error("Exception while FSOTravellingPath "+e);
            self.commonRouter.showErrorPage(req,res);
        }
    },
    getCurrentPosition : function(req,res){
        var self = this;
        var userId = req.body.loanOfficerId;
        self.model.getCurrentPositionModel(userId, function(latitide,longitude){
            req.body.currentLatitide = latitide;
            req.body.currentLongitude = longitude;
            res.send(req.body);
        });

    },
    //Added by Sathish Kumar M 008 For Changing Fo Module

    getLRGroupDetailCall : function(officeValue,userIdValue, callback){
        this.model.getLRGroupDetailModel(officeValue,userIdValue, callback);
    },

    getLRBranchCall : function(userId, callback){
        this.model.getLRBranchCallModel(userId, callback);
    },

    assignFOLoad: function(req,res){
        try{
            var self = this;
            var roleId = req.session.roleId;
            var constantsObj = this.constants;
            var statusMessage = (typeof req.body.statusMessage == 'undefined')?"":req.body.statusMessage;
            if(typeof (req.session.tenantId) == 'undefined' || typeof (req.session.userId) == 'undefined') {
                res.redirect(props.contextPath+'/client/ci/login');
            }else{
                self.getLRBranchCall(req.session.userId,function(officeName,officeId,dateValue){
                    res.render("loan_recovery/changingFO",{constantsObj:constantsObj,roleId:roleId,dateValue:dateValue,statusMessage:statusMessage,LoanRecoveryGroupsObject:"",userName:"",userId:"", officeName:officeName,officeId:officeId,officeValue:0,contextPath:props.contextPath});
                });

            }
        }catch(e){
            customlog.error("Exception while assignFOLoad "+e);
            self.commonRouter.showErrorPage(req,res);
        }
    },

    getLRFoDetailCall : function(officeValue, callback){
        this.model.getLRFoDetailCallModel(officeValue, callback);
    },

    groupsFOLoad: function(req,res){
        try{
            var self = this;
            var officeValue = req.body.office;
            var roleId = req.session.roleId;
            var constantsObj = this.constants;
            var statusMessage = (typeof req.body.statusMessage == 'undefined')?"":req.body.statusMessage;
            if(typeof (req.session.tenantId) == 'undefined' || typeof (req.session.userId) == 'undefined') {
                res.redirect(props.contextPath+'/client/ci/login');
            }else{
                self.getLRFoDetailCall(officeValue, function(LoanRecoveryGroupsObject,userName,userId){
                    self.getLRBranchCall(req.session.userId,function(officeName,officeId,dateValue){
                        res.render("loan_recovery/changingFO",{constantsObj:constantsObj,dateValue:dateValue,roleId:roleId,LoanRecoveryGroupsObject:LoanRecoveryGroupsObject,userName:userName,
                            userId:userId, officeName:officeName,officeId:officeId,officeValue:officeValue,statusMessage:statusMessage,contextPath:props.contextPath});
                    });
                });
            }
        }catch(e){
            customlog.error("Exception while assignFOLoad "+e);
            self.commonRouter.showErrorPage(req,res);
        }
    },
    groupsForFOLoad: function(req,res){
        try{
            var self = this;
            var officeValue = req.body.office;
            var userIdValue = req.body.currentFO;
            var roleId = req.session.roleId;
            var constantsObj = this.constants;
            var statusMessage = (typeof req.body.statusMessage == 'undefined')?"":req.body.statusMessage;
            if(typeof (req.session.tenantId) == 'undefined' || typeof (req.session.userId) == 'undefined') {
                res.redirect(props.contextPath+'/client/ci/login');
            }else{
                self.getLRGroupDetailCall(officeValue,userIdValue, function(LoanRecoveryGroupsObject,userName,userId){
                    self.getLRBranchCall(req.session.userId,function(officeName,officeId,dateValue){
                        res.render("loan_recovery/changingFO",{constantsObj:constantsObj,roleId:roleId,dateValue:dateValue,LoanRecoveryGroupsObject:LoanRecoveryGroupsObject,userName:userName,
                            userId:userId, officeName:officeName,officeId:officeId,officeValue:officeValue,userIdValue:userIdValue,statusMessage:statusMessage,contextPath:props.contextPath});
                    });
                });
            }
        }catch(e){
            customlog.error("Exception while assignFOLoad "+e);
            self.commonRouter.showErrorPage(req,res);
        }
    },

    assignGroupToFOCall : function(customerId,loanRecoveryOfficer,iklantGroupId,callback){
        this.model.assignGroupToFOModel(customerId,loanRecoveryOfficer,iklantGroupId,callback);
    },

    assignFO : function(req,res){
        try{
            var self = this;
            var officeValue = req.body.office;
            var userIdValue = req.body.currentFO;
            var loanRecoveryOfficer = req.body.selectRO;
            var customerId = req.body.accountId.split(",");
            var iklantGroupId = req.body.iklantGroupId.split(",");
            self.assignGroupToFOCall(customerId,loanRecoveryOfficer,iklantGroupId,function(status){
                if(status == "success"){
                    var activityDetails = new Array(iklantPort, req.session.tenantId, req.session.userId, req.session.userName, req.originalUrl, req.connection.remoteAddress, "router.js", "assignFO", "success", "assignFO","customerId:"+customerId+" iklantGroupId:"+iklantGroupId+" From Loan Officer:"+ userIdValue +" To loanRecoveryOfficer:"+loanRecoveryOfficer+" Changed successfully","insert");
                    self.commonRouter.insertActivityLogModel(activityDetails);
                    req.body.statusMessage = "Changing Field Officer saved successfully";
                }else{
                    var activityDetails = new Array(iklantPort, req.session.tenantId, req.session.userId, req.session.userName, req.originalUrl, req.connection.remoteAddress, "router.js", "assignFO", "success", "assignFO","customerId:"+customerId+" iklantGroupId:"+iklantGroupId+" From Loan Officer:"+ userIdValue +" To loanRecoveryOfficer:"+loanRecoveryOfficer+" Changed Failure","insert");
                    self.commonRouter.insertActivityLogModel(activityDetails);
                    req.body.statusMessage = "Changing Field Officer saved failed";
                }
                req.body.office=officeValue;
                req.body.currentFO=userIdValue;
                self.groupsFOLoad(req,res);
            });
        }catch(e){
            customlog.error("Exception while assignFO "+e);
            self.commonRouter.showErrorPage(req,res);
        }
    },
    retrieveLoanRecoveryPaymentDetails : function(req, res) {
        try{
            var self = this;
            var officeId;
            var personnelId;
            var roleId;
            if(req.session.roleId == this.constants.getFOroleId() ) {
                officeId 	=  req.session.officeId;
                personnelId	=  req.session.userId;
            }else if (req.session.roleId == this.constants.getSMHroleId() ) {
                officeId 	=  -1;
                personnelId	=  -1;
            }
            //else if (req.session.roleId == this.constants.getAccountsExecutiveRoleId() ) {
            else {
                officeId 	=  req.session.officeId;
                personnelId	=  -1;
            }
            customlog.info("officeId" + officeId);
            customlog.info("personnelId" + personnelId);

            var repayLoanHolderObj = require(domainPath +"/paymentCollectionImageHolder");
            var repayLoanHolder = new repayLoanHolderObj();
            repayLoanHolder.setOfficeId(officeId);
            repayLoanHolder.setPersonnelId(personnelId);

            var jsonArray = JSON.stringify(repayLoanHolder);

            customlog.info("jsonArray" + jsonArray);

            var rest = require("./rest.js");

            var http = require('http');
            var https = require('https');

            var postheaders = {
                'Content-Type' : 'application/json',
                'Content-Length' : Buffer.byteLength(jsonArray, 'utf8'),
                'Cookie' : req.session.mifosCookie
            };
            var paymentCollectionId = new Array();
            var globalAccountNum = new Array();
            var groupId = new Array();
            var groupName = new Array();
            var amount = new Array();

            var options = {
                host: mifosServiceIP,
                port: mifosPort,
                path: "/mfi/api/account/loan/repayment/collection.json",
                method: 'POST',
                headers : postheaders
            };
            rest.postJSON(options,jsonArray,function(statuscode,result,headers){
                customlog.info("Status" + result.status);

                var paymentDetails = new Array();
                if(statuscode == 302) {
                    res.redirect(props.contextPath+'/client/ci/logout');
                }
                else if(result.status == "success"){
                    //var activityDetails = new Array(iklantPort, req.session.tenantId, req.session.userId, req.session.userName, req.originalUrl, req.connection.remoteAddress, "router.js", "retrieveLoanRecoveryPaymentDetails", "success", "retrieveLoanRecoveryPaymentDetails", "retrieveLoanRecoveryPaymentDetails");
                    //self.commonRouter.insertActivityLogModel(activityDetails);
                    for(var item = 0; item<result.paymentInfn.length; item++) {
                        /*var ImageCaptureDto1 = require(domainPath +"/ImageCaptureDto");
                         var ImageCaptureDto = new ImageCaptureDto1();
                         this.ImageCaptureDto = ImageCaptureDto;
                         var ImageCaptureDto = this.ImageCaptureDto;
                         ImageCaptureDto.setPaymentCollectionId(result.paymentInfn[item].paymentCollectionId);
                         ImageCaptureDto.setGlobalAccountNum(result.paymentInfn[item].globalAccountNum);
                         ImageCaptureDto.setGroupId(result.paymentInfn[item].groupId);
                         ImageCaptureDto.setGroupName(result.paymentInfn[item].groupName);
                         ImageCaptureDto.setAmount(result.paymentInfn[item].amount);
                         paymentDetails[item] = ImageCaptureDto;*/
                        paymentCollectionId[item] = result.paymentInfn[item].paymentCollectionId;
                        globalAccountNum[item] = result.paymentInfn[item].globalAccountNum;
                        groupId[item] = result.paymentInfn[item].groupId;
                        groupName[item] = result.paymentInfn[item].groupName;
                        amount[item] = result.paymentInfn[item].amount;
                    }
                    req.session.fromAndroid = null;
                    res.write("[");
                    for(var i=0;i<paymentCollectionId.length;i++) {
                        if((paymentCollectionId.length-1)==i){
                            res.write(JSON.stringify({paymentCollectionId : paymentCollectionId[i],globalAccountNum:globalAccountNum[i],
                                groupId : groupId[i] , groupName : groupName[i] ,amount : amount[i]}));
                        }else if(paymentCollectionId.length>i){
                            res.write(JSON.stringify({paymentCollectionId : paymentCollectionId[i],globalAccountNum:globalAccountNum[i],
                                groupId : groupId[i] , groupName : groupName[i] ,amount : amount[i] })+",");
                        }
                    }
                    res.write("]");
                    res.end();
                } else {
                    self.commonRouter.showErrorPage(req,res);
                }

            });
        }catch(e){
            customlog.error("Exception while retrive loan recovery payment details "+e);
            self.commonRouter.showErrorPage(req,res);
        }
    },
};

function formatDate(tempDate) {
    if(typeof(tempDate) != 'undefined'){
        var ddd = tempDate.split("/");
        var now = new Date(ddd[2],ddd[1]-1,ddd[0]);
        var curr_date = ("0" + now.getDate()).slice(-2);
        var curr_month = ("0" + (now.getMonth() + 1)).slice(-2);
        var curr_year = now.getFullYear();
        var tempDate = curr_year+"-"+curr_month+"-"+curr_date;
        return tempDate;
    }
}

function getCurrentTimeStamp() {
    var currentdate = new Date();
    var datetime = checkDate_Time(currentdate.getFullYear()) + checkDate_Time((currentdate.getMonth()+1))
        + checkDate_Time(currentdate.getDate()) + checkDate_Time(currentdate.getHours())
        + checkDate_Time(currentdate.getMinutes()) + checkDate_Time(currentdate.getSeconds());
    return datetime;
}
function checkDate_Time(time) {
    return (time < 10) ? ("0" + time) : time;
}
function convertToMifosDate(date) {
    var dateInArray = date.split("-");
    return dateInArray[2]+"-"+dateInArray[1]+"-"+dateInArray[0];
}
function convertChequeDateIntoMifosFormat(date) {
    var dateInArray = date.split("/");
    return dateInArray[2]+"-"+dateInArray[1]+"-"+dateInArray[0];
}
function convertToTodaysDateFormat(date) {
    var dateInArray = date.split("-");
    return dateInArray[2]+"-"+dateInArray[1]+"-"+dateInArray[0];
}
function convertToDateWithSlash(date) {
    var dateInArray = date.split("-");
    return dateInArray[2]+"/"+dateInArray[1]+"/"+dateInArray[0];
}

function convertToDateWithSlashForApplyPayment(date) {
    var dateInArray = date.split("-");
    return dateInArray[0]+"/"+dateInArray[1]+"/"+dateInArray[2];
}


function convertDate(timeInMilliSec) {
    var d = new Date(timeInMilliSec);
    var date = d.getDate();
    var month = d.getMonth() + 1; //Months are zero based
    var year = d.getFullYear();
    var date = (date <= 9 ? '0' + date : date) + '/' + (month<=9 ? '0' + month : month) + '/' + year ;

    return date;
}
function convertMillisecToMifosDateFormat(timeInMilliSec) {
    var d = new Date(timeInMilliSec);
    var date = d.getDate();
    var month = d.getMonth() + 1; //Months are zero based
    var year = d.getFullYear();
    var date = year + '-' + (month<=9 ? '0' + month : month) + '-' +(date <= 9 ? '0' + date : date) ;

    return date;
}
function convertMillisecToMifosDateFormatStr(timeInMilliSec) {
    var d = new Date(timeInMilliSec);
    var date = d.getDate();
    var month = d.getMonth() + 1; //Months are zero based
    var year = d.getFullYear();
    var date = (date <= 9 ? '0' + date : date) + '/' + (month<=9 ? '0' + month : month) + '/' + year;

    return date;
}
function convertToMifosDateFormat(date) {
    var dateInArray = date.split("-");
    return dateInArray[2]+"-"+dateInArray[1]+"-"+dateInArray[0];
}
function convertYYYYMMDDToDDMMYYYYFormat(date) {
    var dateInArray = date.split("-");
    return dateInArray[2]+"-"+dateInArray[1]+"-"+dateInArray[0];
}
function todaysDateDDMMMYYYY(){
    var m_names = new Array("Jan", "Feb", "Mar",
        "Apr", "May", "Jun", "Jul", "Aug", "Sep",
        "Oct", "Nov", "Dec");
    var d = new Date();
    var curr_date = d.getDate();
    var curr_month = d.getMonth();
    var curr_year = d.getFullYear();
    return curr_date + "-" + m_names[curr_month] + "-" + curr_year;

}
function convertToDateWithSlash(date) {
    var dateInArray = date.split("-");
    return dateInArray[2]+"/"+dateInArray[1]+"/"+dateInArray[0];
}
function changeDateToStringFormat(date1){
    //var date1="2012-06-21";
    //customlog.info(date1 + "date");
    var dateConcat  = date1.split("-");
    for(var i=0;i<dateConcat.length;i++){
        //	customlog.info(dateConcat[i]);
    }
    var month = new Array();
    month[0] = "";
    month[1] = "Jan";
    month[2] = "Feb";
    month[3] = "Mar";
    month[4] = "April";
    month[5] ="May" ;
    month[6] = "June";
    month[7] = "July";
    month[8] = "Aug";
    month[9] = "Sep";
    month[10] = "Oct";
    month[11] = "Nov";
    month[12] = "Dec";
    var months = Number(dateConcat[1]);
    var date = dateConcat[2] +"-"+month[months]+"-" + dateConcat[0];
    return date;
}
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
function getCurrentDate() {
    var currentdate = new Date();
    var datetime = checkDate_Time(currentdate.getDate()) + "/" + checkDate_Time(currentdate.getMonth()+1) + "/" + checkDate_Time(currentdate.getFullYear());
    return datetime;
}
function getCurrentYear() {
    var currentdate = new Date();
    var datetime =  "01/04/" + checkDate_Time(currentdate.getFullYear());
    return datetime;
}
function addingDaysWithDate(tempDate, addDays) {
    //var now = new Date(tempDate);
    var now = tempDate;
    now.setDate(now.getDate() + parseInt(addDays));
    var curr_date = ("0" + now.getDate()).slice(-2);
    var curr_month = ("0" + (now.getMonth() + 1)).slice(-2);
    var curr_year = now.getFullYear();
    var tempDate = curr_date+"-"+curr_month+"-"+curr_year;
    if(isNaN(curr_date)) {
        tempDate = "";
    }
    return convertToMifosDateFormat(tempDate);
}

function encrypt(text,password){
    var cipher = crypto.createCipher('aes-256-ctr',password)
    var crypted = cipher.update(text,'utf8','hex')
    crypted += cipher.final('hex');
    return crypted;
}

function decrypt(text,password){
    var decipher = crypto.createDecipher('aes-256-ctr',password)
    var dec = decipher.update(text,'hex','utf8')
    dec += decipher.final('utf8');
    return dec;
}
