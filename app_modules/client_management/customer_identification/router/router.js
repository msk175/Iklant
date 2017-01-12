var crypto = require('crypto');
var path = require('path');
var props = require(path.dirname(process.mainModule.filename)+"/"+"properties.json");
var rootPath = path.dirname(process.mainModule.filename);
var domainPath = path.join(__dirname, '..','domain');
module.exports = router;
mifosServiceIP = props.mifosServiceIp;
mifosPort = props.mifosPort;
GPSPort = props.GPSPort;
iklantPort = props.iklantPort;
var PDFDocument;
PDFDocument = require('pdfkit');
var SmsConstants = require(path.join(rootPath,"app_modules/dto/sms/SmsConstants"));
var fs = require('fs');
var customlog = require(path.join(rootPath,"logger/loggerConfig.js"))('customer_identification: router.js');

function router(model,datamodel) {
    customlog.debug('Inside Router ');
	this.model = model;
	
	var constantsRequire = require(path.join(rootPath,"app_modules/dto/common/Constants"));
	var constants = new constantsRequire();
	this.constants = constants;

    var commonObj = require(domainPath +"/commonDomain");
    this.commonObj = commonObj;

    this.commonDataModel = datamodel;

    /*// Paramasivan
    // Used for all financial reports to allow dates within selected Financial Year
    var FinancialYearLoadHolder = require(domainPath +"/FinancialYearLoadHolder.js");
    var FinancialYearLoadHolder = new FinancialYearLoadHolder();
    this.FinancialYearLoadHolder = FinancialYearLoadHolder; */
}

router.prototype = {

	//Reports in rejected clients Screen
	/*retrieveDocumentList : function(req,res){
		customlog.info("Inside retrieveDocumentList");
		var self = this;
		var tenantId = req.session.tenantId;
		var userId   = req.session.userId;
		var clientId = req.body.clientId;
		var docId 	 = req.body.docId;
		if(typeof req.session.tenantId == 'undefined' || typeof req.session.userId == 'undefined') {
			res.redirect(props.contextPath+'/client/ci/login');
		}else{
            try{
                self.downloadRequstedImageCall(tenantId,clientId,docId,function(fileLocation){
                        req.body.fileLocation = fileLocation;
                        res.send(req.body);
                    });
            }
           catch(e){
                customlog.error("Exception while retrieve DocumentList "+e);
                self.showErrorPage(req,res);
            }
		}
	},*/
	
	/*//TO show process NPA Page Author : bask1939
	processnpa : function(req,res){
        try{
            var self = this;
            if(typeof req.session.tenantId == 'undefined' || typeof req.session.userId == 'undefined') {
                res.redirect(props.contextPath+'/client/ci/login');
            }
            else{
                var constantObj = this.constants;
                var roleId = req.session.roleId;
                var userId = (roleId == constantObj.getSMHroleId() ||roleId == constantObj.getBMroleId() || roleId == constantObj.getAccountsExecutiveRoleId())?req.session.userId:-1;
                var officeId = (roleId == constantObj.getSMHroleId() ||roleId == constantObj.getBMroleId() || roleId == constantObj.getAccountsExecutiveRoleId())?1:req.session.officeId;
                var rest = require("./rest.js");
                var http = require('http');
                var https = require('https');
                var todaysdate = getCurrentDate();
                var postheaders = {
                    'Content-Type' : 'application/json',
                    'Cookie' : req.session.mifosCookie
                };
                var options = {
                    host: mifosServiceIP,
                    port: mifosPort,
                    path: "/mfi/api/report/npa/load-"+userId+"-"+officeId+".json",
                    method: 'GET',
                    headers : postheaders
                };
                rest.getJSON(options,function(statuscode,result,headers){
                        customlog.info("statuscode:"+statuscode);
                        customlog.info("result:" + result.status);
                    if(statuscode == 302) {
                        res.redirect(props.contextPath+'/client/ci/logout');
                    }
                    else if(result.status == "success"){
                        var lastProcessedDate;
                        if(result.lastProcessedDate == null){
                            lastProcessedDate = "NPA is not processed yet";
                        }
                        else{
                            lastProcessedDate = convertToDateWithSlash(result.lastProcessedDate);
                        }
                        res.render('processManagement.jade',{status : '',lastProcessedDate : lastProcessedDate,todaysdate : todaysdate, contextPath:props.contextPath});

                    }else{
                        self.showErrorPage(req,res);
                        }
                    });
                }
        }catch(e){
            customlog.error("Exception while Process NPA "+e);
            self.showErrorPage(req,res);
        }
	},

	//TO Generate NPA Report for given date Author : bask1939
	generateNPA : function(req,res){
        try{
            customlog.info("Inside Generate NPA");
            var self = this;
            if(typeof req.session.tenantId == 'undefined' || typeof req.session.userId == 'undefined') {
                res.redirect(props.contextPath+'/client/ci/login');
            }else{
                var rptDate = convertChequeDateIntoMifosFormat(req.body.reportDate);
                var redo =req.body.redo;
                var thereshold =req.body.thereshold;

                var NPAProcessHolder = require(domainPath +"/NPAProcessHolder");
                var NPAProcessHolder = new NPAProcessHolder();;

                NPAProcessHolder.setRedo(redo);
                NPAProcessHolder.setThreshold(thereshold);

                var jsonArray = JSON.stringify(NPAProcessHolder);

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
                  path: "/mfi/api/process/npa/date-"+rptDate+".json",
                  method: 'POST',
                  headers : postheaders
                };
                rest.postJSON(options,jsonArray,function(statuscode,result,headers){
                        customlog.info("Status" + result.status);
                    if(statuscode == 302) {
                        res.redirect(props.contextPath+'/client/ci/logout');
                    }
                    else if(result.status == "success"){
                        req.body.status = result.status;
                        req.body.message = "NPA Report Generated Succesfully";
                        req.body.alreadyProcessed = false;
                        res.send(req.body);
                    }else{
                        req.body.status = result.status;
                        if(result.alreadyProcessed == true){
                            req.body.alreadyProcessed = true;
                            customlog.info(req.body.alreadyProcessed);
                            req.body.message = "Report Already Processed For Selected Date";
                            }
                            res.send(req.body);
                        }
                    });
                }
        }catch(e){
            customlog.error("Exception While Generate NPA "+e);
            self.showErrorPage(req,res);
        }
	},

	//To show trail balance report
	trailBalance : function(req,res){
		try{
            var self = this;
                customlog.info("Inside show Trail Balance Report");
            if(typeof req.session.tenantId == 'undefined' || typeof req.session.userId == 'undefined') {
                res.redirect(props.contextPath+'/client/ci/login');
            }else{
                var reportHolderObj = require(domainPath +"/ReportHolder");
                var reportHolder = new reportHolderObj();

                var startDate = req.body.fromdateTB;
                var endDate = req.body.todateTB;
                var officeId = req.body.listofficeTB;
                if(typeof(officeId) == 'undefined'){
                    officeId = req.session.officeId;
                }
                *//*reportHolder.setStartDateStr("2013-04-01");
                reportHolder.setEndDateStr("2013-09-30");
                reportHolder.setOfficeId(-1);*//*

                reportHolder.setStartDateStr(convertChequeDateIntoMifosFormat(startDate));
                reportHolder.setEndDateStr(convertChequeDateIntoMifosFormat(endDate));
                reportHolder.setOfficeId(officeId);

                var jsonArray = JSON.stringify(reportHolder);

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
                  path: "/mfi/api/report/account/loan/trailBalance.json",
                  method: 'POST',
                  headers : postheaders
                };

                rest.postJSON(options,jsonArray,function(statuscode,result,headers){
                        customlog.info("statuscode" + statuscode);
                        customlog.info("result" + result);
                        customlog.info("headers" + headers);
                    var trailBalanceArray = new Array();
                    var totalCreditAmount = 0;
                    var totalDebitAmount = 0;

                    if(statuscode == 302) {
                        res.redirect(props.contextPath+'/client/ci/logout');
                    }
                    else if(result.status == "success") {

                        for(var i=0;i<result.trailBalance.length;i++){
                            var trailBalanceObj = require(domainPath +"/trailBalance");
                            var trailBalance = new trailBalanceObj();
                            trailBalance.setGlCodeId(result.trailBalance[i].glCodeId);
                            trailBalance.setGlCode(result.trailBalance[i].glCode);
                            trailBalance.setCoaName(result.trailBalance[i].coaName);
                            trailBalance.setCredit(intToFormat(result.trailBalance[i].credit.toFixed()));
                            trailBalance.setDebit(intToFormat(result.trailBalance[i].debit.toFixed()));
                            totalCreditAmount = totalCreditAmount +  result.trailBalance[i].credit;
                            totalDebitAmount = totalDebitAmount +  result.trailBalance[i].debit;
                            trailBalanceArray[i] = trailBalance;

                        }
                        res.render('trailBalanceView',{trailBalanceArray : trailBalanceArray,totalCreditAmount : intToFormat(totalCreditAmount.toFixed()) ,totalDebitAmount : intToFormat(totalDebitAmount.toFixed()), contextPath:props.contextPath})
                    } else {
                            self.showErrorPage(req,res);
                        }
                    });
                }
        }catch(e){
            customlog.error("Exception while Generate Trail Balance "+e);
            self.showErrorPage(req,res);
        }
	},
	
	//TO show  NPA Report Menu Page Author : bask1939
	showNPAMenuPage :  function(req,res){
		try{
            var self = this;
            var constantObj = this.constants;
            var roleId = req.session.roleId;
                customlog.info("Inside show NPA Menu Page");
            if(typeof req.session.tenantId == 'undefined' || typeof req.session.userId == 'undefined') {
                res.redirect(props.contextPath+'/client/ci/login');
            }else{
                var errorField;
                if(req.session.loadNpaMenu == 0){
                    errorField = "";
                }else if(req.session.loadNpaMenu == 1){
                    if(typeof(req.body.npaReportDate) == 'undefined')
                        errorField = "";
                    else
                        errorField = "NPA Summary is not processed for selected date  " + req.body.npaReportDate ;
                }

                var userId = (roleId == constantObj.getSMHroleId() ||roleId == constantObj.getBMroleId() || roleId == constantObj.getAccountsExecutiveRoleId())?req.session.userId:-1;
                var officeId = (roleId == constantObj.getSMHroleId() ||roleId == constantObj.getBMroleId() || roleId == constantObj.getAccountsExecutiveRoleId())?1:req.session.officeId;
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
                    path: "/mfi/api/report/npa/load-"+userId+"-"+officeId+".json",
                    method: 'GET',
                    headers : postheaders
                };
                rest.getJSON(options,function(statuscode,result,headers){
                        customlog.info("statuscode:"+statuscode);
                        customlog.info("result:" + result.status);
                    if(statuscode == 302) {
                        res.redirect(props.contextPath+'/client/ci/logout');
                    }
                    else if(result.status == "success"){
                        if (result.lastProcessedDate == null) {
                            res.render('NPAReportError.jade',{contextPath:props.contextPath});

                        } else {

                            var productCategoryIdArray = new Array();
                            var productNameArray = new Array();

                            var officeIdArray = new Array();
                            var officeNameArray = new Array();

                            var officePersonnelIdArray = new Array();
                            var personnelIdArray = new Array();
                            var personnelNameArray = new Array();

                            var NPALoadHolder = require(domainPath +"/NPALoadHolder");
                            var NPALoadHolder = new NPALoadHolder();
                            for(var item = 0; item<result.prdCatories.length; item++) {
                                productCategoryIdArray[item]	= result.prdCatories[item].globalProductCategoryNumber;
                                productNameArray[item] 		= result.prdCatories[item].productCategoryName;
                            }
                            NPALoadHolder.setProductCategoryIdArray(productCategoryIdArray);
                            NPALoadHolder.setProductNameArray(productNameArray);
                            var i=0;
                            for(var item = 0; item<result.offices.length; item++) {
                                if(result.offices[item].levelId == 5){
                                    if(roleId == constantObj.getApexPromotors()){
                                        if(result.offices[item].officeId != 4){ // to hide PeriyanaikenPalayam
                                            officeIdArray[i]		= result.offices[item].officeId;
                                            officeNameArray[i] 	= result.offices[item].name;
                                            i=i+1;
                                        }
                                    }else{
                                        officeIdArray[i]		= result.offices[item].officeId;
                                        officeNameArray[i] 	= result.offices[item].name;
                                        i=i+1;
                                    }
                                }
                            }
                            NPALoadHolder.setOfficeIdArray(officeIdArray);
                            NPALoadHolder.setOfficeNameArray(officeNameArray);
                            var j=0;
                            for(var item = 0; item<result.loanOfficerList.length; item++) {
                                if(result.loanOfficerList[item].officeId != constantObj.getApexHeadOffice()){
                                    personnelIdArray[j]	= result.loanOfficerList[item].id;
                                    personnelNameArray[j] = result.loanOfficerList[item].firstName;
                                    officePersonnelIdArray[j] = result.loanOfficerList[item].officeId;
                                    j=j+1;
                                }
                            }
                            NPALoadHolder.setPersonnelIdArray(personnelIdArray);
                            NPALoadHolder.setPersonnelNameArray(personnelNameArray);
                            NPALoadHolder.setOfficePersonnelIdArray(officePersonnelIdArray);
                            NPALoadHolder.setLastReportGeneratedDate(convertToDateWithSlash(result.lastProcessedDate));
                            if(roleId == constantObj.getApexPromotors())
                            {
                                res.render('NPAAgingReportMenu.jade', {NPALoadHolder : NPALoadHolder,errorField : errorField, officeId : officeId,constantObj:constantObj,roleId:roleId, contextPath:props.contextPath});
                            }else{
                                res.render('NPAReportMenu.jade', {NPALoadHolder : NPALoadHolder,errorField : errorField, officeId : officeId,constantObj:constantObj,roleId:roleId, contextPath:props.contextPath});
                            }
                        }
                    }else{
                        self.showErrorPage(req,res);
                        }
                    });
                }
        }catch(e){
            customlog.error("Exception while Show NPA Menu page "+e);
            self.showErrorPage(req,res);
        }
	},
	//TO Retrieve NPA summary  Author : bask1939
	viewnpaReport :  function(req,res){
		try{
            customlog.info("Inside View NPA Report");
            var self = this;
            if(typeof req.session.tenantId == 'undefined' || typeof req.session.userId == 'undefined') {
                res.redirect(props.contextPath+'/client/ci/login');
            }else{
                var officeLabel;
                var productLabel;
                var personnelLabel;
                var loggedInOffice = req.session.officeId;
                var NPAHolderObj = require(domainPath +"/NPAHolder");
                var NPAHolder = new NPAHolderObj();
                var dateArray = new Array();
                var constantsObj = this.constants;
                var roleId = req.session.roleId;
                var userId = (roleId == constantsObj.getSMHroleId() || roleId == constantsObj.getBMroleId() || roleId == constantsObj.getApexPromotors() || roleId == constantsObj.getAccountsExecutiveRoleId())?req.session.userId:-1;
                var rptdate;
                if (typeof(req.body.npaReportDate) != 'undefined'){
                    rptdate = convertChequeDateIntoMifosFormat(req.body.npaReportDate);
                }
                var officeId;
                if (typeof(req.body.office) != 'undefined'){
                    officeId = req.body.office;
                }else{
                    officeId = req.session.officeId;
                }
                var productCategoryId = req.body.productCategory;
                var loanOfficer	= req.body.loanOfficer;
                var recurrenceType	= req.body.recurrenceTypeId;
                var limit 	= req.body.limit;
                if (typeof(recurrenceType) != 'undefined'){
                    req.session.recurrenceType = recurrenceType;
                }else{
                    recurrenceType = req.session.recurrenceType;
                }
                if (typeof(limit) != 'undefined'){
                    req.session.limit = limit;
                }else{
                    limit = req.session.limit;
                }
                if (typeof(rptdate) != 'undefined'){
                    req.session.rptdate = rptdate;
                }else{
                    rptdate = req.session.rptdate;
                }
                if(productCategoryId == -1){
                    productLabel = 'Overall';
                }
                if(officeId == -1){
                    officeLabel = 'Overall';
                }
                if(loanOfficer == -1){
                    personnelLabel = 'Overall';
                }
                var headerLabel;

                NPAHolder.setOfficeId(officeId);
                NPAHolder.setPrdCategoryId(productCategoryId);
                NPAHolder.setPersonnelId(loanOfficer);
                NPAHolder.setLoanStatus(-1);
                NPAHolder.setAccountTypeId(1);
                NPAHolder.setLimit(limit);
                NPAHolder.setRecurrenceType(recurrenceType);
                NPAHolder.setDate(rptdate);

                var jsonArray = JSON.stringify(NPAHolder);


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
                  path: "/mfi/api/report/npa/summary/date-"+rptdate+"-"+userId+".json",
                  method: 'POST',
                  headers : postheaders
                };

                rest.postJSON(options,jsonArray,function(statuscode,result,headers){
                    if(statuscode == 302) {
                        res.redirect(props.contextPath+'/client/ci/logout');
                    }
                    else if(result.status == "success"){
                        var productCategoryIdArray = new Array();
                        var productNameArray = new Array();
                        var officeIdArray = new Array();
                        var officeNameArray = new Array();
                        var officePersonnelIdArray = new Array();
                        var personnelIdArray = new Array();
                        var personnelNameArray = new Array();
                        var NPALoadHolder = require(domainPath +"/NPALoadHolder");
                        var NPALoadHolder = new NPALoadHolder();

                        for(var item = 0; item<result.prdCatories.length; item++) {
                            productCategoryIdArray[item]	= result.prdCatories[item].globalProductCategoryNumber;
                            productNameArray[item] 		= result.prdCatories[item].productCategoryName;
                            if(result.prdCatories[item].globalProductCategoryNumber == productCategoryId & productCategoryId != -1){
                                productLabel = result.prdCatories[item].productCategoryName;
                            }
                        }
                        productCategoryIdArray[productCategoryIdArray.length] = -1;
                        productNameArray[productNameArray.length] = 'All';
                        NPALoadHolder.setProductCategoryIdArray(productCategoryIdArray);
                        NPALoadHolder.setProductNameArray(productNameArray);
                        var i=0;
                        for(var item = 0; item<result.offices.length; item++) {
                            if(result.offices[item].levelId == 5){
                                officeIdArray[i]		= result.offices[item].officeId;
                                officeNameArray[i] 	= result.offices[item].name;
                                i=i+1;
                            }
                            if(result.offices[item].officeId == officeId && officeId != -1){
                                officeLabel =result.offices[item].name;
                            }
                        }
                        officeIdArray[officeIdArray.length] = -1;
                        officeNameArray[officeNameArray.length] = 'All';
                        NPALoadHolder.setOfficeIdArray(officeIdArray);
                        NPALoadHolder.setOfficeNameArray(officeNameArray);
                        var j=0;
                        for(var item = 0; item<result.loanOfficerList.length; item++) {
                            if(result.loanOfficerList[item].officeId != 1 ){
                                personnelIdArray[j]	= result.loanOfficerList[item].id;
                                personnelNameArray[j] = result.loanOfficerList[item].firstName;
                                officePersonnelIdArray[j] = result.loanOfficerList[item].officeId;
                                j=j+1;
                            }
                            if(result.loanOfficerList[item].id == loanOfficer & loanOfficer != -1){
                                personnelLabel = result.loanOfficerList[item].firstName;
                            }
                        }
                        personnelIdArray[personnelIdArray.length] = -1;
                        personnelNameArray[personnelNameArray.length] = 'All';
                        officePersonnelIdArray[officePersonnelIdArray.length] = '-1';
                        NPALoadHolder.setPersonnelIdArray(personnelIdArray);
                        NPALoadHolder.setPersonnelNameArray(personnelNameArray);
                        NPALoadHolder.setOfficePersonnelIdArray(officePersonnelIdArray);

                        for(var item = 0; item<result.npaDetails.length; item++) {
                            var NPAHolderObj1 = require(domainPath +"/NPAHolder");
                            var NPAHolderResult = new NPAHolderObj1();

                            NPAHolderResult.setDate(changeDateToStringFormat(result.npaDetails[item].date));
                            NPAHolderResult.setOfficeId(result.npaDetails[item].officeId);
                            NPAHolderResult.setPrdCategoryId(result.npaDetails[item].prdCategoryId);
                            NPAHolderResult.setPersonnelId(result.npaDetails[item].personnelId);
                            NPAHolderResult.setAccountTypeId(result.npaDetails[item].accountTypeId);
                            NPAHolderResult.setLoanStatus(result.npaDetails[item].loanStatus);

                            NPAHolderResult.setPrincipalOverdueOpenLoans(intToFormat(result.npaDetails[item].principalOverdueOpenLoans.toFixed()));
                            NPAHolderResult.setNpaPrincipalOutstandingOpenLoans(intToFormat(result.npaDetails[item].npaPrincipalOutstandingOpenLoans.toFixed()));
                            NPAHolderResult.setTotalPrincipalOutstandingOpenLoans(intToFormat(result.npaDetails[item].totalPrincipalOutstandingOpenLoans.toFixed()));
                            NPAHolderResult.setAvgNpaPrincipalOutstandingOpenLoans(intToFormat(result.npaDetails[item].avgNpaPrincipalOutstandingOpenLoans.toFixed()));
                            NPAHolderResult.setNpaPrincipalOutstandingOpenLoansRatio(result.npaDetails[item].npaPrincipalOutstandingOpenLoansRatio);

                            NPAHolderResult.setParOpenLoansRatio(result.npaDetails[item].parOpenLoansRatio);
                            NPAHolderResult.setPrincipalOverdueClosedLoans(intToFormat(result.npaDetails[item].principalOverdueClosedLoans.toFixed()));
                            NPAHolderResult.setNpaPrincipalOutstandingClosedLoans(intToFormat(result.npaDetails[item].npaPrincipalOutstandingClosedLoans.toFixed()));
                            NPAHolderResult.setTotalPrincipalOutstandingClosedLoans(intToFormat(result.npaDetails[item].totalPrincipalOutstandingClosedLoans.toFixed()));

                            NPAHolderResult.setAvgNpaPrincipalOutstandingClosedLoans(intToFormat(result.npaDetails[item].avgNpaPrincipalOutstandingClosedLoans.toFixed()));
                            NPAHolderResult.setNpaPrincipalOutstandingClosedLoansRatio(result.npaDetails[item].npaPrincipalOutstandingClosedLoansRatio);
                            NPAHolderResult.setParClosedLoansRatio(result.npaDetails[item].parClosedLoansRatio);
                            NPAHolderResult.setPrincipalOverdueAllLoans(intToFormat(result.npaDetails[item].principalOverdueAllLoans.toFixed()));

                            NPAHolderResult.setNpaPrincipalOutstandingAllLoans(intToFormat(result.npaDetails[item].npaPrincipalOutstandingAllLoans.toFixed()));
                            NPAHolderResult.setNpaPrincipalOutstandingAllLoansRbi(intToFormat(result.npaDetails[item].npaPrincipalOutstandingAllLoansRbi.toFixed()));
                            NPAHolderResult.setTotalPrincipalOutstandingAllLoans(intToFormat(result.npaDetails[item].totalPrincipalOutstandingAllLoans.toFixed()));
                            NPAHolderResult.setAvgNpaPrincipalOutstandingAllLoans(intToFormat(result.npaDetails[item].avgNpaPrincipalOutstandingAllLoans.toFixed()));

                            NPAHolderResult.setNpaPrincipalOutstandingAllLoansRatio(result.npaDetails[item].npaPrincipalOutstandingAllLoansRatio);
                            NPAHolderResult.setNpaPrincipalOutstandingAllLoansRatioRbi(result.npaDetails[item].npaPrincipalOutstandingAllLoansRatioRbi);
                            NPAHolderResult.setParAllLoansRatio(result.npaDetails[item].parAllLoansRatio);
                            NPAHolderResult.setNoOfNpaOpenLoans(result.npaDetails[item].noOfNpaOpenLoans);

                            NPAHolderResult.setTotalNoOfOpenLoans(result.npaDetails[item].totalNoOfOpenLoans);
                            NPAHolderResult.setNpaOpenLoansRatio(result.npaDetails[item].npaOpenLoansRatio);
                            NPAHolderResult.setNoOfNpaClosedLoans(result.npaDetails[item].noOfNpaClosedLoans);
                            NPAHolderResult.setTotalNoOfClosedLoans(result.npaDetails[item].totalNoOfClosedLoans);
                            NPAHolderResult.setNpaClosedLoansRatio(result.npaDetails[item].npaClosedLoansRatio);

                            NPAHolderResult.setNoOfNpaAllLoans(result.npaDetails[item].noOfNpaAllLoans);
                            NPAHolderResult.setTotalNoOfAllLoans(result.npaDetails[item].totalNoOfAllLoans);
                            NPAHolderResult.setNpaAllLoansRatio(result.npaDetails[item].npaAllLoansRatio);
                            var j=0;
                            var chartDetailsPOS = new Array();
                                chartDetailsPOS[j]	 = changeDateToStringFormat(result.npaDetails[item].date);
                                chartDetailsPOS[j+1] = result.npaDetails[item].npaPrincipalOutstandingOpenLoans;
                                chartDetailsPOS[j+2] = result.npaDetails[item].npaPrincipalOutstandingClosedLoans;
                                chartDetailsPOS[j+3] = result.npaDetails[item].npaPrincipalOutstandingAllLoans;
                                chartDetailsPOS[j+4] = result.npaDetails[item].npaPrincipalOutstandingAllLoansRbi;
                            NPAHolderResult.setChartNPAPOS(chartDetailsPOS);
                            var chartDetailsNoOfLoans 	= new Array();
                            chartDetailsNoOfLoans[j]	= changeDateToStringFormat(result.npaDetails[item].date);
                            chartDetailsNoOfLoans[j+1]  = result.npaDetails[item].noOfNpaOpenLoans;
                            chartDetailsNoOfLoans[j+2]	= result.npaDetails[item].totalNoOfOpenLoans;
                            chartDetailsNoOfLoans[j+3]	= result.npaDetails[item].noOfNpaClosedLoans;
                            chartDetailsNoOfLoans[j+4]	= result.npaDetails[item].totalNoOfClosedLoans;
                            chartDetailsNoOfLoans[j+5]	= result.npaDetails[item].noOfNpaAllLoans;
                            chartDetailsNoOfLoans[j+6]	= result.npaDetails[item].totalNoOfAllLoans;
                            NPAHolderResult.setChartNoOfLoans(chartDetailsNoOfLoans);
                            var chartDetailsNoOfLoansPercentage = new Array();
                            chartDetailsNoOfLoansPercentage[j]	= changeDateToStringFormat(result.npaDetails[item].date);
                            chartDetailsNoOfLoansPercentage[j+1]  = result.npaDetails[item].npaOpenLoansRatio;
                            chartDetailsNoOfLoansPercentage[j+2]	= result.npaDetails[item].npaClosedLoansRatio;
                            chartDetailsNoOfLoansPercentage[j+3]	= result.npaDetails[item].npaAllLoansRatio;
                            NPAHolderResult.setChartNoOfLoansPercentage(chartDetailsNoOfLoansPercentage);
                            var chartDetailsPOSPercentage 	= new Array();
                            chartDetailsPOSPercentage[j] 	= changeDateToStringFormat(result.npaDetails[item].date);
                            chartDetailsPOSPercentage[j+1] 	= result.npaDetails[item].npaPrincipalOutstandingOpenLoansRatio;
                            chartDetailsPOSPercentage[j+2]	= result.npaDetails[item].npaPrincipalOutstandingClosedLoansRatio
                            chartDetailsPOSPercentage[j+3] 	= result.npaDetails[item].npaPrincipalOutstandingAllLoansRatio;
                            chartDetailsPOSPercentage[j+4] 	= result.npaDetails[item].parOpenLoansRatio;
                            chartDetailsPOSPercentage[j+5] 	= result.npaDetails[item].parClosedLoansRatio;
                            chartDetailsPOSPercentage[j+6] 	= result.npaDetails[item].parAllLoansRatio;
                            chartDetailsPOSPercentage[j+7] 	= result.npaDetails[item].npaPrincipalOutstandingAllLoansRatioRbi;
                            NPAHolderResult.setChartNPAPOSPerc(chartDetailsPOSPercentage);
                            var chartDetailsOverdue = new Array();
                            chartDetailsOverdue[j] 	= convertToDateWithSlash(result.npaDetails[item].date);
                            chartDetailsOverdue[j+1] 	 = result.npaDetails[item].principalOverdueOpenLoans;
                            chartDetailsOverdue[j+2] = result.npaDetails[item].principalOverdueClosedLoans;
                            chartDetailsOverdue[j+3] = result.npaDetails[item].principalOverdueAllLoans;
                            NPAHolderResult.setChartOverdue(chartDetailsOverdue);
                            dateArray[item] = NPAHolderResult;
                        }
                        if(productCategoryId == -1 & officeId == -1 & loanOfficer == -1 ){
                            headerLabel = "OverAll";
                        }else if(productCategoryId != -1 & officeId == -1 & loanOfficer == -1 ){
                            headerLabel = productLabel;
                        }else if(productCategoryId == -1 & officeId != -1 & loanOfficer == -1 ){
                            headerLabel = officeLabel;
                        }else if(productCategoryId == -1 & officeId == -1 & loanOfficer != -1 ){
                            headerLabel = personnelLabel;
                        }
                        else if(productCategoryId != -1 & officeId != -1 & loanOfficer == -1 ){
                            headerLabel = officeLabel + "-" + productLabel;
                        }else if(productCategoryId != -1 & officeId == -1 & loanOfficer != -1 ){
                            headerLabel = productCategoryId + "-" + personnelLabel;
                        }
                        else if(productCategoryId == -1 & officeId != -1 & loanOfficer != -1 ){
                            headerLabel = officeLabel + "-" + personnelLabel;
                        }
                        else {
                            headerLabel = officeLabel + "-" + productLabel+ "-" + personnelLabel ;
                        }
                        //var activityDetails = new Array(iklantPort, req.session.tenantId, req.session.userId, req.session.userName, req.originalUrl, req.connection.remoteAddress, "router.js", "viewnpaReport", "success", "NPA Report", "NPA report generated successfully");
                        //self.commonRouter.insertActivityLogModel(activityDetails);
                        res.render('NPAReport.jade',{dateArray : dateArray, NPALoadHolder : NPALoadHolder,officeId : officeId,
                            productCategoryId : productCategoryId,loanOfficer : loanOfficer, headerLabel :headerLabel,
                            loggedInOffice : loggedInOffice, constantObj:constantsObj, roleId:roleId, contextPath:props.contextPath});
                    } else {
                        req.session.loadNpaMenu = 1;
                        self.showNPAMenuPage(req,res);
                        }
                    });
                }
        }catch(e){
            customlog.error("Exception while View NPA Report "+e);
            self.showErrorPage(req,res);
        }
	},

	//TO show  NPA Aging Menu Page Author : bask1939
	showNPAAgingMenuPage :  function(req,res){
        try{
            var self = this;
            var constantObj = this.constants;
            var roleId = req.session.roleId;
            var self = this;
                customlog.info("Inside show NPA Aging Menu Page");
            if(typeof req.session.tenantId == 'undefined' || typeof req.session.userId == 'undefined') {
                res.redirect(props.contextPath+'/client/ci/login');
            }else {
                var errorField;
                var officeId = req.session.officeId;
                if(req.session.loadNpaMenu == 0){
                    errorField = "";
                }else if(req.session.loadNpaMenu == 1){
                    if(typeof(req.body.npaReportDate) == 'undefined')
                        errorField = "";
                    else
                        errorField = "NPA Aging Report is not processed for selected date  " + req.body.npaReportDate ;
                }
                var rest = require("./rest.js");
                var userId = (roleId == constantObj.getSMHroleId() ||roleId == constantObj.getBMroleId() || roleId == constantObj.getAccountsExecutiveRoleId())?req.session.userId:-1;
                var officeId = (roleId == constantObj.getSMHroleId() ||roleId == constantObj.getBMroleId() || roleId == constantObj.getAccountsExecutiveRoleId())?1:req.session.officeId;
                var http = require('http');
                var https = require('https');


                var postheaders = {
                    'Content-Type' : 'application/json',
                    'Cookie' : req.session.mifosCookie
                };
                var options = {
                    host: mifosServiceIP,
                    port: mifosPort,
                    path: "/mfi/api/report/npa/load-"+userId+"-"+officeId+".json",
                    method: 'GET',
                    headers : postheaders
                };
                rest.getJSON(options,function(statuscode,result,headers){

                    if(statuscode == 302) {
                        res.redirect(props.contextPath+'/client/ci/logout');
                    }
                    else if(result.status == "success"){
                        if(result.lastProcessedDate == null){
                            res.render('NPAReportError.jade',{contextPath:props.contextPath});
                        }else {
                            var productCategoryIdArray = new Array();
                            var productNameArray = new Array();

                            var officeIdArray = new Array();
                            var officeNameArray = new Array();

                            var officePersonnelIdArray = new Array();
                            var personnelIdArray = new Array();
                            var personnelNameArray = new Array();

                            var NPALoadHolder = require(domainPath +"/NPALoadHolder");
                            var NPALoadHolder = new NPALoadHolder();
                            for(var item = 0; item<result.prdCatories.length; item++) {
                                productCategoryIdArray[item]	= result.prdCatories[item].globalProductCategoryNumber;
                                productNameArray[item] 		= result.prdCatories[item].productCategoryName;
                            }
                            NPALoadHolder.setProductCategoryIdArray(productCategoryIdArray);
                            NPALoadHolder.setProductNameArray(productNameArray);
                            var i=0;
                            for(var item = 0; item<result.offices.length; item++) {
                                if(result.offices[item].levelId == 5){
                                    if(result.offices[item].officeId != 4){ // to hide PeriyanaikenPalayam
                                        officeIdArray[i]		= result.offices[item].officeId;
                                        officeNameArray[i] 	= result.offices[item].name;
                                        i=i+1;
                                    }
                                }
                            }
                            NPALoadHolder.setOfficeIdArray(officeIdArray);
                            NPALoadHolder.setOfficeNameArray(officeNameArray);
                            var j=0;
                            for(var item = 0; item<result.loanOfficerList.length; item++) {
                                if(result.loanOfficerList[item].officeId != 1){
                                    personnelIdArray[j]	= result.loanOfficerList[item].id;
                                    personnelNameArray[j] = result.loanOfficerList[item].firstName;
                                    officePersonnelIdArray[j] = result.loanOfficerList[item].officeId;
                                    j=j+1;
                                }
                            }
                            NPALoadHolder.setPersonnelIdArray(personnelIdArray);
                            NPALoadHolder.setPersonnelNameArray(personnelNameArray);
                            NPALoadHolder.setOfficePersonnelIdArray(officePersonnelIdArray);
                            NPALoadHolder.setLastReportGeneratedDate(convertToDateWithSlash(result.lastProcessedDate));
                            //var activityDetails = new Array(iklantPort, req.session.tenantId, req.session.userId, req.session.userName, req.originalUrl, req.connection.remoteAddress, "router.js", "showNPAAgingMenuPage", "success", "NPA Aging Report", "NPA Aging report menu loaded successfully");
                            //self.commonRouter.insertActivityLogModel(activityDetails);
                            res.render('NPAAgingReportMenu.jade', {NPALoadHolder : NPALoadHolder,errorField : errorField,officeId : officeId,roleId:roleId,constantObj:constantObj, contextPath:props.contextPath});
                            }
                        } else {
                            self.showErrorPage(req,res);
                        }
                    });
                }
        }catch(e){
            customlog.error("Exception while Show NPA Menu Page "+e);
            self.showErrorPage(req,res);
        }
	},

    getPOSForAging : function(officeId,productCategoryId,loanOfficer,callback){
        this.model.getPOSForAgingModel(officeId,productCategoryId,loanOfficer,callback);
    },

    getCashBalanceCall : function(officeId,finYear,callback){
        this.model.getCashBalanceModel(officeId,finYear,callback);
    },

    viewNpaAgingReport :  function(req,res){
        try{
            var self = this;
            if(typeof req.session.tenantId == 'undefined' || typeof req.session.userId == 'undefined') {
                res.redirect(props.contextPath+'/client/ci/login');
            }else{
                self.commonRouter.retriveOfficeCall(req.session.tenantId,req.session.userId,function(officeIdArray,officeNameArray,officeAddressArray,officeShortNameArray){
                    self.viewNpaAgingReportCall(req,res,officeIdArray);
                    });
                }
        }catch(e){
            customlog.error("Exception while View NPA Aging report "+e);
            self.showErrorPage(req,res);
        }
    },

	//TO Retrieve NPA Aging Report Page Author : bask1939
	viewNpaAgingReportCall :   function(req,res,officeIdArray){
        try{
            var self = this;
            var constantsObj = this.constants;
                customlog.info("Inside View NPA Aging Report");
            if(typeof req.session.tenantId == 'undefined' || typeof req.session.userId == 'undefined') {
                res.redirect(props.contextPath+'/client/ci/login');
            }
            else {
                var roleId = req.session.roleId;
                var userId = (roleId == constantsObj.getSMHroleId() ||roleId == constantsObj.getBMroleId() || roleId == constantsObj.getAccountsExecutiveRoleId() || roleId == constantsObj.getApexPromotors())?req.session.userId:-1;
                var NPAAgingHolderObj = require(domainPath +"/NPAAgingHolder");
                var NPAAgingHolder = new NPAAgingHolderObj();
                var officeLabel;
                var loggedInOffice = req.session.officeId;
                var productLabel;
                var personnelLabel;
                var NPAHolderObj = require(domainPath +"/NPAHolder");
                var NPAHolder = new NPAHolderObj();
                var dateArray = new Array();

                var rptdate;
                if (typeof(req.body.npaReportDate) != 'undefined'){
                    rptdate = convertChequeDateIntoMifosFormat(req.body.npaReportDate);
                }
                var officeId;
                var reqOfficeId;

                if (typeof(req.body.office) != 'undefined'){
                    reqOfficeId = req.body.office;
                    officeId = req.body.office;
                }else{
                    reqOfficeId = req.session.officeId;
                    officeId = req.session.officeId;
                }
                var officeIdForSMH = req.session.officeId;
                if(req.session.officeId == constantsObj.getApexHeadOffice() || roleId == constantsObj.getSMHroleId()){
                    officeId = "";
                    if(req.body.office == -1){
                        for(var i in officeIdArray){
                            if(officeId == ""){
                                officeId = officeIdArray[i];
                            }else{
                                officeId += ","+officeIdArray[i];
                            }
                        }
                        officeIdForSMH = -1
                    }
                    else if(req.body.office == 2){
                        officeId = '2,4';
                    }
                    else{
                        officeIdForSMH = req.body.office;
                        officeId = req.body.office;
                    }
                }else if(officeId == 2){
                    officeId = "";
                    officeId = '2,4';
                }

                var productCategoryId = req.body.productCategory;
                var loanOfficer	= req.body.loanOfficer;
                var recurrenceType	= req.body.recurrenceTypeId;
                var limit 	= req.body.limit;
                if (typeof(recurrenceType) != 'undefined'){
                    req.session.recurrenceType = recurrenceType;
                }else{
                    recurrenceType = req.session.recurrenceType;
                }
                if (typeof(limit) != 'undefined'){
                    req.session.limit = limit;
                }else{
                    limit = req.session.limit;
                }
                if (typeof(rptdate) != 'undefined'){
                    req.session.rptdate = rptdate;
                }else{
                    rptdate = req.session.rptdate;
                }
                if(productCategoryId == -1){
                    productLabel = 'Overall';
                }
                if(officeId == -1){
                    officeLabel = 'Overall';
                }
                if(loanOfficer == -1){
                    personnelLabel = 'Overall';
                }
                var headerLabel;

                var dateArray = new Array();

                NPAAgingHolder.setofficeFilterId(officeId);  // for filter with mifos code
                NPAAgingHolder.setofficeId(officeIdForSMH);  // for filter with mifos code
                NPAAgingHolder.setPrdCategoryFilterId(productCategoryId);
                NPAAgingHolder.setPersonnelFilterId(loanOfficer);
                NPAAgingHolder.setLoanStatus(-1);
                NPAAgingHolder.setAccountTypeId(1);
                NPAAgingHolder.setLimit(limit);
                NPAAgingHolder.setRecurrenceType(recurrenceType);
                NPAAgingHolder.setDate(rptdate);

                var jsonArray = JSON.stringify(NPAAgingHolder);


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
                  path: "/mfi/api/report/npa/aging/date-"+rptdate+"-"+userId+".json",
                  method: 'POST',
                  headers : postheaders
                };
                rest.postJSON(options,jsonArray,function(statuscode,result,headers){
                    if(statuscode == 302) {
                        res.redirect(props.contextPath+'/client/ci/logout');
                    }
                    else if(result.status == "success"){
                        var productCategoryIdArray = new Array();
                        var productNameArray = new Array();
                        var officeIdArray = new Array();
                        var officeNameArray = new Array();
                        var officePersonnelIdArray = new Array();
                        var personnelIdArray = new Array();
                        var personnelNameArray = new Array();
                        var NPALoadHolder = require(domainPath +"/NPALoadHolder");
                        var NPALoadHolder = new NPALoadHolder();

                        for(var item = 0; item<result.prdCatories.length; item++) {
                            productCategoryIdArray[item]	= result.prdCatories[item].globalProductCategoryNumber;
                            productNameArray[item] 		= result.prdCatories[item].productCategoryName;
                            if(result.prdCatories[item].globalProductCategoryNumber == productCategoryId & productCategoryId != -1){
                                productLabel = result.prdCatories[item].productCategoryName;
                            }
                        }
                        productCategoryIdArray[productCategoryIdArray.length] = -1;
                        productNameArray[productNameArray.length] = 'All';
                        NPALoadHolder.setProductCategoryIdArray(productCategoryIdArray);
                        NPALoadHolder.setProductNameArray(productNameArray);
                        var i=0;
                        for(var item = 0; item<result.offices.length; item++) {
                            if(result.offices[item].levelId == 5){
                                if(result.offices[item].officeId != 4){    // to hide PeriyanaikenPalayam
                                    officeIdArray[i]		= result.offices[item].officeId;
                                    officeNameArray[i] 	= result.offices[item].name;
                                    i=i+1;
                                }
                            }
                            if(result.offices[item].officeId == reqOfficeId & reqOfficeId != -1 & reqOfficeId != 4){
                                officeLabel =result.offices[item].name;
                            }
                        }
                        officeIdArray[officeIdArray.length] = -1;
                        officeNameArray[officeNameArray.length] = 'All';
                        NPALoadHolder.setOfficeIdArray(officeIdArray);
                        NPALoadHolder.setOfficeNameArray(officeNameArray);
                        var j=0;
                        for(var item = 0; item<result.loanOfficerList.length; item++) {
                            if(result.loanOfficerList[item].officeId != 1 ){
                                personnelIdArray[j]	= result.loanOfficerList[item].id;
                                personnelNameArray[j] = result.loanOfficerList[item].firstName;
                                officePersonnelIdArray[j] = result.loanOfficerList[item].officeId;
                                j=j+1;
                            }
                            if(result.loanOfficerList[item].id == loanOfficer & loanOfficer != -1){
                                personnelLabel = result.loanOfficerList[item].firstName;
                            }
                        }
                        personnelIdArray[personnelIdArray.length] = -1;
                        personnelNameArray[personnelNameArray.length] = 'All';
                        officePersonnelIdArray[officePersonnelIdArray.length] = '-1';
                        NPALoadHolder.setPersonnelIdArray(personnelIdArray);
                        NPALoadHolder.setPersonnelNameArray(personnelNameArray);
                        NPALoadHolder.setOfficePersonnelIdArray(officePersonnelIdArray);
                            var agingHolderArray = new Array();
                            var PAR30POSDateList = new Array();
                            var PAR30POSList =  new Array();
                            var PAR30POSListvalues = new Array();
                            var PAR30percentageList = new Array();
                            for(var i=0;i<result.npaDetails.length;i++){
                                var NPAAgingHolderObjLocal = require(domainPath +"/NPAAgingHolder");
                                var NPAAgingHolderLocal = new NPAAgingHolderObjLocal();
                                var	totalNPPosKumaran = 0 ;
                                var	totalNPPosApex 	  = 0;
                                var	totalNPPosRBI 	  = 0;
                                var totalNPLoans = 0;

                                var PAR30POS = 0;
                                var principal = 0;
                                var principal_paid = 0;
                                for(var j=0;j<result.npaDetails[i].length;j++){
                                    if(j == 0){
                                        NPAAgingHolderLocal.setDefaultZeroToSevenDays(intToFormat(result.npaDetails[i][j].npaPrincipalOutstanding.toFixed()));
                                        NPAAgingHolderLocal.setDefaultZeroToSevenDaysApex(intToFormat(result.npaDetails[i][j].npaPrincipalOutstandingApex.toFixed()));
                                        NPAAgingHolderLocal.setDefaultZeroToSevenDaysRBI(intToFormat(result.npaDetails[i][j].npaPrincipalOutstandingRbi.toFixed()));
                                        NPAAgingHolderLocal.setDefaultZeroToSevenDaysLoans(intToFormat(result.npaDetails[i][j].noOfNpaLoans.toFixed()));
                                        NPAAgingHolderLocal.setDate(changeDateToStringFormat(result.npaDetails[i][j].date));
                                        NPAAgingHolderLocal.setOriginalDate(result.npaDetails[i][j].date);
                                        totalNPPosKumaran =  totalNPPosKumaran + result.npaDetails[i][j].npaPrincipalOutstanding;
                                        totalNPPosApex 	  =  totalNPPosApex    + result.npaDetails[i][j].npaPrincipalOutstandingApex;
                                        totalNPPosRBI 	  =  totalNPPosRBI 	   + result.npaDetails[i][j].npaPrincipalOutstandingRbi;
                                        totalNPLoans = totalNPLoans + result.npaDetails[i][j].noOfNpaLoans;
                                        //agingResultArray[j] = NPAAgingHolderLocal;

                                    }else if(j == 1){
                                        NPAAgingHolderLocal.setDefaultEightToThirtydays(intToFormat(result.npaDetails[i][j].npaPrincipalOutstanding.toFixed()));
                                        NPAAgingHolderLocal.setDefaultEightToThirtydaysApex(intToFormat(result.npaDetails[i][j].npaPrincipalOutstandingApex.toFixed()));
                                        NPAAgingHolderLocal.setDefaultEightToThirtydaysRBI(intToFormat(result.npaDetails[i][j].npaPrincipalOutstandingRbi.toFixed()));
                                        NPAAgingHolderLocal.setDefaultEightToThirtydaysLoans(intToFormat(result.npaDetails[i][j].noOfNpaLoans.toFixed()));
                                        totalNPPosKumaran =  totalNPPosKumaran + result.npaDetails[i][j].npaPrincipalOutstanding;
                                        totalNPPosApex 	  =  totalNPPosApex    + result.npaDetails[i][j].npaPrincipalOutstandingApex;
                                        totalNPPosRBI 	  =  totalNPPosRBI 	   + result.npaDetails[i][j].npaPrincipalOutstandingRbi;
                                        totalNPLoans = totalNPLoans + result.npaDetails[i][j].noOfNpaLoans;
                                    }else if(j == 2){
                                        NPAAgingHolderLocal.setDefaulThirtyOneToSixtydays(intToFormat(result.npaDetails[i][j].npaPrincipalOutstanding.toFixed()));
                                        NPAAgingHolderLocal.setDefaulThirtyOneToSixtydaysApex(intToFormat(result.npaDetails[i][j].npaPrincipalOutstandingApex.toFixed()));
                                        NPAAgingHolderLocal.setDefaulThirtyOneToSixtydaysRBI(intToFormat(result.npaDetails[i][j].npaPrincipalOutstandingRbi.toFixed()));
                                        NPAAgingHolderLocal.setDefaulThirtyOneToSixtydaysLoans(intToFormat(result.npaDetails[i][j].noOfNpaLoans.toFixed()));
                                        totalNPPosKumaran =  totalNPPosKumaran + result.npaDetails[i][j].npaPrincipalOutstanding;
                                        totalNPPosApex 	  =  totalNPPosApex    + result.npaDetails[i][j].npaPrincipalOutstandingApex;
                                        totalNPPosRBI 	  =  totalNPPosRBI 	   + result.npaDetails[i][j].npaPrincipalOutstandingRbi;
                                        totalNPLoans = totalNPLoans + result.npaDetails[i][j].noOfNpaLoans;
                                        PAR30POS = PAR30POS + parseInt(result.npaDetails[i][j].actualPrincipalOverdue.toFixed());
                                    }else if(j == 3){
                                        NPAAgingHolderLocal.setDefaultSixtyOneTONinetyDays(intToFormat(result.npaDetails[i][j].npaPrincipalOutstanding.toFixed()));
                                        NPAAgingHolderLocal.setDefaultSixtyOneTONinetyDaysApex(intToFormat(result.npaDetails[i][j].npaPrincipalOutstandingApex.toFixed()));
                                        NPAAgingHolderLocal.setDefaultSixtyOneTONinetyDaysRBI(intToFormat(result.npaDetails[i][j].npaPrincipalOutstandingRbi.toFixed()));
                                        NPAAgingHolderLocal.setDefaultSixtyOneTONinetyDaysLoans(intToFormat(result.npaDetails[i][j].noOfNpaLoans.toFixed()));
                                        totalNPPosKumaran =  totalNPPosKumaran + result.npaDetails[i][j].npaPrincipalOutstanding;
                                        totalNPPosApex 	  =  totalNPPosApex    + result.npaDetails[i][j].npaPrincipalOutstandingApex;
                                        totalNPPosRBI 	  =  totalNPPosRBI 	   + result.npaDetails[i][j].npaPrincipalOutstandingRbi;
                                        totalNPLoans = totalNPLoans + result.npaDetails[i][j].noOfNpaLoans;
                                        PAR30POS = PAR30POS + parseInt(result.npaDetails[i][j].actualPrincipalOverdue.toFixed());
                                    }else if(j == 4){
                                        NPAAgingHolderLocal.setDefaultNinetyOneTo120days(intToFormat(result.npaDetails[i][j].npaPrincipalOutstanding.toFixed()));
                                        NPAAgingHolderLocal.setDefaultNinetyOneTo120daysApex(intToFormat(result.npaDetails[i][j].npaPrincipalOutstandingApex.toFixed()));
                                        NPAAgingHolderLocal.setDefaultNinetyOneTo120daysRBI(intToFormat(result.npaDetails[i][j].npaPrincipalOutstandingRbi.toFixed()));
                                        NPAAgingHolderLocal.setDefaultNinetyOneTo120daysLoans(intToFormat(result.npaDetails[i][j].noOfNpaLoans.toFixed()));
                                        totalNPPosKumaran =  totalNPPosKumaran + result.npaDetails[i][j].npaPrincipalOutstanding;
                                        totalNPPosApex 	  =  totalNPPosApex    + result.npaDetails[i][j].npaPrincipalOutstandingApex;
                                        totalNPPosRBI 	  =  totalNPPosRBI 	   + result.npaDetails[i][j].npaPrincipalOutstandingRbi;
                                        totalNPLoans = totalNPLoans + result.npaDetails[i][j].noOfNpaLoans;
                                        PAR30POS = PAR30POS + parseInt(result.npaDetails[i][j].actualPrincipalOverdue.toFixed());
                                    }else if(j == 5){
                                        NPAAgingHolderLocal.setDefault121TO150Days(intToFormat(result.npaDetails[i][j].npaPrincipalOutstanding.toFixed()));
                                        NPAAgingHolderLocal.setDefault121TO150DaysApex(intToFormat(result.npaDetails[i][j].npaPrincipalOutstandingApex.toFixed()));
                                        NPAAgingHolderLocal.setDefault121TO150DaysRBI(intToFormat(result.npaDetails[i][j].npaPrincipalOutstandingRbi.toFixed()));
                                        NPAAgingHolderLocal.setDefault121TO150DaysLoans(intToFormat(result.npaDetails[i][j].noOfNpaLoans.toFixed()));
                                        totalNPPosKumaran =  totalNPPosKumaran + result.npaDetails[i][j].npaPrincipalOutstanding;
                                        totalNPPosApex 	  =  totalNPPosApex    + result.npaDetails[i][j].npaPrincipalOutstandingApex;
                                        totalNPPosRBI 	  =  totalNPPosRBI 	   + result.npaDetails[i][j].npaPrincipalOutstandingRbi;
                                        totalNPLoans = totalNPLoans + result.npaDetails[i][j].noOfNpaLoans;
                                        PAR30POS = PAR30POS + parseInt(result.npaDetails[i][j].actualPrincipalOverdue.toFixed());
                                    }else if(j == 6){
                                        NPAAgingHolderLocal.setDefault151TO180Days(intToFormat(result.npaDetails[i][j].npaPrincipalOutstanding.toFixed()));
                                        NPAAgingHolderLocal.setDefault151TO180DaysApex(intToFormat(result.npaDetails[i][j].npaPrincipalOutstandingApex.toFixed()));
                                        NPAAgingHolderLocal.setDefault151TO180DaysRBI(intToFormat(result.npaDetails[i][j].npaPrincipalOutstandingRbi.toFixed()));
                                        NPAAgingHolderLocal.setDefault151TO180DaysLoans(intToFormat(result.npaDetails[i][j].noOfNpaLoans.toFixed()));
                                        totalNPPosKumaran =  totalNPPosKumaran + result.npaDetails[i][j].npaPrincipalOutstanding;
                                        totalNPPosApex 	  =  totalNPPosApex    + result.npaDetails[i][j].npaPrincipalOutstandingApex;
                                        totalNPPosRBI 	  =  totalNPPosRBI 	   + result.npaDetails[i][j].npaPrincipalOutstandingRbi;
                                        totalNPLoans = totalNPLoans + result.npaDetails[i][j].noOfNpaLoans;
                                        PAR30POS = PAR30POS + parseInt(result.npaDetails[i][j].actualPrincipalOverdue.toFixed());
                                    }else if(j == 7){
                                        NPAAgingHolderLocal.setDefault181TO210Days(intToFormat(result.npaDetails[i][j].npaPrincipalOutstanding.toFixed()));
                                        NPAAgingHolderLocal.setDefault181TO210DaysApex(intToFormat(result.npaDetails[i][j].npaPrincipalOutstandingApex.toFixed()));
                                        NPAAgingHolderLocal.setDefault181TO210DaysRBI(intToFormat(result.npaDetails[i][j].npaPrincipalOutstandingRbi.toFixed()));
                                        NPAAgingHolderLocal.setDefault181TO210DaysLoans(intToFormat(result.npaDetails[i][j].noOfNpaLoans.toFixed()));
                                        totalNPPosKumaran =  totalNPPosKumaran + result.npaDetails[i][j].npaPrincipalOutstanding;
                                        totalNPPosApex 	  =  totalNPPosApex    + result.npaDetails[i][j].npaPrincipalOutstandingApex;
                                        totalNPPosRBI 	  =  totalNPPosRBI 	   + result.npaDetails[i][j].npaPrincipalOutstandingRbi;
                                        totalNPLoans = totalNPLoans + result.npaDetails[i][j].noOfNpaLoans;
                                        PAR30POS = PAR30POS + parseInt(result.npaDetails[i][j].actualPrincipalOverdue.toFixed());

                                    }else if(j == 8){
                                        NPAAgingHolderLocal.setDefault211TO240Days(intToFormat(result.npaDetails[i][j].npaPrincipalOutstanding.toFixed()));
                                        NPAAgingHolderLocal.setDefault211TO240DaysApex(intToFormat(result.npaDetails[i][j].npaPrincipalOutstandingApex.toFixed()));
                                        NPAAgingHolderLocal.setDefault211TO240DaysRBI(intToFormat(result.npaDetails[i][j].npaPrincipalOutstandingRbi.toFixed()));
                                        NPAAgingHolderLocal.setDefault211TO240DaysLoans(intToFormat(result.npaDetails[i][j].noOfNpaLoans.toFixed()));
                                        totalNPPosKumaran =  totalNPPosKumaran + result.npaDetails[i][j].npaPrincipalOutstanding;
                                        totalNPPosApex 	  =  totalNPPosApex    + result.npaDetails[i][j].npaPrincipalOutstandingApex;
                                        totalNPPosRBI 	  =  totalNPPosRBI 	   + result.npaDetails[i][j].npaPrincipalOutstandingRbi;
                                        totalNPLoans = totalNPLoans + result.npaDetails[i][j].noOfNpaLoans;
                                        PAR30POS = PAR30POS + parseInt(result.npaDetails[i][j].actualPrincipalOverdue.toFixed());
                                    }else if(j == 9){
                                        NPAAgingHolderLocal.setDefault241TO270Days(intToFormat(result.npaDetails[i][j].npaPrincipalOutstanding.toFixed()));
                                        NPAAgingHolderLocal.setDefault241TO270DaysApex(intToFormat(result.npaDetails[i][j].npaPrincipalOutstandingApex.toFixed()));
                                        NPAAgingHolderLocal.setDefault241TO270DaysRBI(intToFormat(result.npaDetails[i][j].npaPrincipalOutstandingRbi.toFixed()));
                                        NPAAgingHolderLocal.setDefault241TO270DaysLoans(intToFormat(result.npaDetails[i][j].noOfNpaLoans.toFixed()));
                                        totalNPPosKumaran =  totalNPPosKumaran + result.npaDetails[i][j].npaPrincipalOutstanding;
                                        totalNPPosApex 	  =  totalNPPosApex    + result.npaDetails[i][j].npaPrincipalOutstandingApex;
                                        totalNPPosRBI 	  =  totalNPPosRBI 	   + result.npaDetails[i][j].npaPrincipalOutstandingRbi;
                                        totalNPLoans = totalNPLoans + result.npaDetails[i][j].noOfNpaLoans;
                                        PAR30POS = PAR30POS + parseInt(result.npaDetails[i][j].actualPrincipalOverdue.toFixed());
                                    }else if(j == 10){
                                        NPAAgingHolderLocal.setDefault271TO300Days(intToFormat(result.npaDetails[i][j].npaPrincipalOutstanding.toFixed()));
                                        NPAAgingHolderLocal.setDefault271TO300DaysApex(intToFormat(result.npaDetails[i][j].npaPrincipalOutstandingApex.toFixed()));
                                        NPAAgingHolderLocal.setDefault271TO300DaysRBI(intToFormat(result.npaDetails[i][j].npaPrincipalOutstandingRbi.toFixed()));
                                        NPAAgingHolderLocal.setDefault271TO300DaysLoans(intToFormat(result.npaDetails[i][j].noOfNpaLoans.toFixed()));
                                        totalNPPosKumaran =  totalNPPosKumaran + result.npaDetails[i][j].npaPrincipalOutstanding;
                                        totalNPPosApex 	  =  totalNPPosApex    + result.npaDetails[i][j].npaPrincipalOutstandingApex;
                                        totalNPPosRBI 	  =  totalNPPosRBI 	   + result.npaDetails[i][j].npaPrincipalOutstandingRbi;
                                        totalNPLoans = totalNPLoans + result.npaDetails[i][j].noOfNpaLoans;
                                        PAR30POS = PAR30POS + parseInt(result.npaDetails[i][j].actualPrincipalOverdue.toFixed());
                                    }else if(j == 11){
                                        NPAAgingHolderLocal.setDefault301TO330Days(intToFormat(result.npaDetails[i][j].npaPrincipalOutstanding.toFixed()));
                                        NPAAgingHolderLocal.setDefault301TO330DaysApex(intToFormat(result.npaDetails[i][j].npaPrincipalOutstandingApex.toFixed()));
                                        NPAAgingHolderLocal.setDefault301TO330DaysRBI(intToFormat(result.npaDetails[i][j].npaPrincipalOutstandingRbi.toFixed()));
                                        NPAAgingHolderLocal.setDefault301TO330DaysLoans(intToFormat(result.npaDetails[i][j].noOfNpaLoans.toFixed()));
                                        totalNPPosKumaran =  totalNPPosKumaran + result.npaDetails[i][j].npaPrincipalOutstanding;
                                        totalNPPosApex 	  =  totalNPPosApex    + result.npaDetails[i][j].npaPrincipalOutstandingApex;
                                        totalNPPosRBI 	  =  totalNPPosRBI 	   + result.npaDetails[i][j].npaPrincipalOutstandingRbi;
                                        totalNPLoans = totalNPLoans + result.npaDetails[i][j].noOfNpaLoans;
                                        PAR30POS = PAR30POS + parseInt(result.npaDetails[i][j].actualPrincipalOverdue.toFixed());
                                    }else if(j == 12){
                                        NPAAgingHolderLocal.setDefault331TO360Days(intToFormat(result.npaDetails[i][j].npaPrincipalOutstanding.toFixed()));
                                        NPAAgingHolderLocal.setDefault331TO360DaysApex(intToFormat(result.npaDetails[i][j].npaPrincipalOutstandingApex.toFixed()));
                                        NPAAgingHolderLocal.setDefault331TO360DaysRBI(intToFormat(result.npaDetails[i][j].npaPrincipalOutstandingRbi.toFixed()));
                                        NPAAgingHolderLocal.setDefault331TO360DaysLoans(intToFormat(result.npaDetails[i][j].noOfNpaLoans.toFixed()));
                                        totalNPPosKumaran =  totalNPPosKumaran + result.npaDetails[i][j].npaPrincipalOutstanding;
                                        totalNPPosApex 	  =  totalNPPosApex    + result.npaDetails[i][j].npaPrincipalOutstandingApex;
                                        totalNPPosRBI 	  =  totalNPPosRBI 	   + result.npaDetails[i][j].npaPrincipalOutstandingRbi;
                                        totalNPLoans = totalNPLoans + result.npaDetails[i][j].noOfNpaLoans;
                                        PAR30POS = PAR30POS + parseInt(result.npaDetails[i][j].actualPrincipalOverdue.toFixed());
                                    }else if(j == 13){
                                        NPAAgingHolderLocal.setDefaultBeyond360Days(intToFormat(result.npaDetails[i][j].npaPrincipalOutstanding.toFixed()));
                                        NPAAgingHolderLocal.setDefaultBeyond360DaysApex(intToFormat(result.npaDetails[i][j].npaPrincipalOutstandingApex.toFixed()));
                                        NPAAgingHolderLocal.setDefaultBeyond360DaysRBI(intToFormat(result.npaDetails[i][j].npaPrincipalOutstandingRbi.toFixed()));
                                        NPAAgingHolderLocal.setDefaultBeyond360DaysLoans(intToFormat(result.npaDetails[i][j].noOfNpaLoans.toFixed()));
                                        totalNPPosKumaran =  totalNPPosKumaran + result.npaDetails[i][j].npaPrincipalOutstanding;
                                        totalNPPosApex 	  =  totalNPPosApex    + result.npaDetails[i][j].npaPrincipalOutstandingApex;
                                        totalNPPosRBI 	  =  totalNPPosRBI 	   + result.npaDetails[i][j].npaPrincipalOutstandingRbi;
                                        totalNPLoans = totalNPLoans + result.npaDetails[i][j].noOfNpaLoans;
                                        PAR30POS = PAR30POS + parseInt(result.npaDetails[i][j].actualPrincipalOverdue.toFixed());
                                    }

                                }
                                PAR30POSListvalues.push(PAR30POS);
                                PAR30POSList.push(intToFormat(PAR30POS));
                                NPAAgingHolderLocal.setNpaPrincipalOutstanding(intToFormat(totalNPPosKumaran.toFixed()));
                                NPAAgingHolderLocal.setNpaPrincipalOutstandingApex(intToFormat(totalNPPosApex.toFixed()));
                                NPAAgingHolderLocal.setNpaPrincipalOutstandingRbi(intToFormat(totalNPPosRBI.toFixed()));
                                NPAAgingHolderLocal.setNpaLoans(intToFormat(totalNPLoans.toFixed()));
                                //agingHolderArray[i] = NPAAgingHolderLocal;
                                agingHolderArray[i] = NPAAgingHolderLocal;
                            }
                            if(productCategoryId == -1 & reqOfficeId == -1 & loanOfficer == -1 ){
                                headerLabel = "OverAll";
                            }else if(productCategoryId != -1 & reqOfficeId == -1 & loanOfficer == -1 ){
                                headerLabel = productLabel;
                            }else if(productCategoryId == -1 & reqOfficeId != -1 & loanOfficer == -1 ){
                                headerLabel = officeLabel;
                            }else if(productCategoryId == -1 & reqOfficeId == -1 & loanOfficer != -1 ){
                                headerLabel = personnelLabel;
                            }
                            else if(productCategoryId != -1 & reqOfficeId != -1 & loanOfficer == -1 ){
                                headerLabel = officeLabel + "-" + productLabel;
                            }else if(productCategoryId != -1 & reqOfficeId == -1 & loanOfficer != -1 ){
                                headerLabel = productCategoryId + "-" + personnelLabel;
                            }
                            else if(productCategoryId == -1 & reqOfficeId != -1 & loanOfficer != -1 ){
                                headerLabel = officeLabel + "-" + personnelLabel;
                            }
                            else {
                                headerLabel = officeLabel + "-" + productLabel+ "-" + personnelLabel ;
                            }
                            var overallPosList = new Array();

                            self.getPOSForAging(officeId,productCategoryId,loanOfficer,function(date,overallpos){
                                for(var i=0; i<agingHolderArray.length;i++){
                                    for(var j=0 ; j<date.length;j++){
                                        if(agingHolderArray[i].getDate() == changeDateToStringFormat(date[j])){
                                            overallPosList[i]= intToFormat(overallpos[j].toFixed());
                                            var par30Percentage = 0;
                                            if(!isNaN(((PAR30POSListvalues[i]/overallpos[j].toFixed())*100).toFixed(2))){
                                                par30Percentage = ((PAR30POSListvalues[i]/overallpos[j].toFixed())*100).toFixed(2);
                                            }
                                            PAR30percentageList.push(par30Percentage);
                                        }
                                    }
                                }
                                var cashBalanceArray = new Array();
                                var bankBalanceArray = new Array();
                                self.getCashBalanceCall(officeId,constantsObj.getFinancialYear(),function(cash_report_date,cash_closing_balance_array,bank_report_date,bank_closing_balance_array){
                                    for(var i=0; i<agingHolderArray.length;i++){
                                        for(var j=0 ; j<cash_report_date.length;j++){
                                            if(agingHolderArray[i].getDate() == changeDateToStringFormat(cash_report_date[j])){
                                                cashBalanceArray[i]= intToFormat(cash_closing_balance_array[j].toFixed());
                                            }
                                        }
                                        for(var j=0 ; j<bank_report_date.length;j++){
                                            if(agingHolderArray[i].getDate() == changeDateToStringFormat(bank_report_date[j])){
                                                bankBalanceArray[i]= intToFormat(bank_closing_balance_array[j].toFixed());
                                            }
                                        }
                                    }
                                    //var activityDetails = new Array(iklantPort, req.session.tenantId, req.session.userId, req.session.userName, req.originalUrl, req.connection.remoteAddress, "router.js", "viewNpaAgingReport & viewNpaAgingReportCall", "success", "NPA Aging Report", "NPA Aging report generated successfully");
                                    //self.commonRouter.insertActivityLogModel(activityDetails);
                                    res.render('NPAAgingReport.jade', {agingHolderArray: agingHolderArray, NPALoadHolder: NPALoadHolder, officeId: reqOfficeId, cashBalanceArray: cashBalanceArray, bankBalanceArray: bankBalanceArray,
                                            productCategoryId: productCategoryId, loanOfficer: loanOfficer, headerLabel: headerLabel, loggedInOffice: loggedInOffice, overallPosList: overallPosList, PAR30POSList: PAR30POSList, PAR30percentage: PAR30percentageList, constantsObj: constantsObj, roleId: roleId, contextPath:props.contextPath});
                                });


                            });
                        }
                    else{
                        //self.showPageExpired(req,res);
                        req.session.loadNpaMenu = 1;
                        self.showNPAAgingMenuPage(req,res);
                        }
                    });
                }
        }catch(e){
            customlog.error("Exception while View NPA Aging Report Call "+e);
            self.showErrorPage(req,res);
        }
	},

	//To Show NPA Detail Menu Page
	showNPAGroupSummaryPage :  function(req,res){
		try{
            customlog.info("Inside show NPA Group Summary Menu Page");
            var self = this;
            if(typeof req.session.tenantId == 'undefined' || typeof req.session.userId == 'undefined') {
                res.redirect(props.contextPath+'/client/ci/login');
            }else {
                var errorField;
                var roleId = req.session.roleId
                var constantsObj = this.conatants;
                if(req.session.loadNpaMenu == 0){
                    errorField = "";
                }else if(req.session.loadNpaMenu == 1){
                    if(typeof(req.body.npaReportDate) == 'undefined')
                        errorField = "";
                    else
                        errorField = "No NPA Loans Found for selected Office and Loan Officer" ;
                }
                var rest = require("./rest.js");
                var userId = (roleId == constantsObj.getSMHroleId() ||roleId == constantsObj.getBMroleId() || roleId == constantsObj.getAccountsExecutiveRoleId())?req.session.userId:-1;
                var officeId = (roleId == constantsObj.getSMHroleId() ||roleId == constantsObj.getBMroleId() || roleId == constantsObj.getAccountsExecutiveRoleId())?1:req.session.officeId;
                var http = require('http');
                var https = require('https');

                var postheaders = {
                    'Content-Type' : 'application/json',
                    'Cookie' : req.session.mifosCookie
                };
                var options = {
                    host: mifosServiceIP,
                    port: mifosPort,
                    path: "/mfi/api/report/npa/load-"+userId+"-"+officeId+".json",
                    method: 'GET',
                    headers : postheaders
                };
                rest.getJSON(options,function(statuscode,result,headers){
                    if(statuscode == 302) {
                        res.redirect(props.contextPath+'/client/ci/logout');
                    }
                    else if(result.status == "success") {
                        if(result.lastProcessedDate == null){
                            res.render('NPAReportError.jade',{contextPath:props.contextPath});
                        }else {
                            var productCategoryIdArray = new Array();
                            var productNameArray = new Array();

                            var officeIdArray = new Array();
                            var officeNameArray = new Array();

                            var officePersonnelIdArray = new Array();
                            var personnelIdArray = new Array();
                            var personnelNameArray = new Array();

                            var NPALoadHolder = require(domainPath +"/NPALoadHolder");
                            var NPALoadHolder = new NPALoadHolder();
                            for(var item = 0; item<result.prdCatories.length; item++) {
                                productCategoryIdArray[item]	= result.prdCatories[item].globalProductCategoryNumber;
                                productNameArray[item] 		= result.prdCatories[item].productCategoryName;
                            }
                            NPALoadHolder.setProductCategoryIdArray(productCategoryIdArray);
                            NPALoadHolder.setProductNameArray(productNameArray);
                            var i=0;
                            for(var item = 0; item<result.offices.length; item++) {
                                if(result.offices[item].levelId == 5){
                                    officeIdArray[i]		= result.offices[item].officeId;
                                    officeNameArray[i] 	= result.offices[item].name;
                                    i=i+1;
                                }
                            }
                            NPALoadHolder.setOfficeIdArray(officeIdArray);
                            NPALoadHolder.setOfficeNameArray(officeNameArray);
                            var j=0;
                            for(var item = 0; item<result.loanOfficerList.length; item++) {
                                if(result.loanOfficerList[item].officeId != 1){
                                    personnelIdArray[j]	= result.loanOfficerList[item].id;
                                    personnelNameArray[j] = result.loanOfficerList[item].firstName;
                                    officePersonnelIdArray[j] = result.loanOfficerList[item].officeId;
                                    j=j+1;
                                }
                            }
                            NPALoadHolder.setPersonnelIdArray(personnelIdArray);
                            NPALoadHolder.setPersonnelNameArray(personnelNameArray);
                            NPALoadHolder.setOfficePersonnelIdArray(officePersonnelIdArray);
                            NPALoadHolder.setLastReportGeneratedDate(convertToDateWithSlash(result.lastProcessedDate));
                            //var activityDetails = new Array(iklantPort, req.session.tenantId, req.session.userId, req.session.userName, req.originalUrl, req.connection.remoteAddress, "router.js", "showNPAGroupSummaryPage", "success", "NPA Details page", "NPA report menu loaeded successfully");
                            //self.commonRouter.insertActivityLogModel(activityDetails);
                            res.render('NPASumaryReportMenu.jade', {NPALoadHolder : NPALoadHolder,errorField : errorField,officeId : officeId, contextPath:props.contextPath});
                            }
                        } else {
                            self.showErrorPage(req,res);
                        }
                    });
                }
        }catch(e){
            customlog.error("Exception while NPA Group Summary "+e);
            self.showErrorPage(req,res);
        }
	},
	viewNpaChartReport :  function(req,res){
        try{
            var self = this;
            if(typeof (req.session.tenantId) == 'undefined' || typeof (req.session.userId) == 'undefined') {
                res.redirect(props.contextPath+'/client/ci/login');
            }else{
                //var activityDetails = new Array(iklantPort, req.session.tenantId, req.session.userId, req.session.userName, req.originalUrl, req.connection.remoteAddress, "router.js", "viewNpaChartReport", "success", "NPA Chart", "NPA chart loaeded successfully");
                //self.commonRouter.insertActivityLogModel(activityDetails);
                res.render('chartReport.jade',{contextPath:props.contextPath});
                }
        }catch(e){
            customlog.error("Exception while View NPA Chart Report "+e);
            self.showErrorPage(req,res);
        }
	},

	//To Retrieve Detail in popup in aging page Author : bask1939
	viewNpaDetailForDefaultDays :  function(req,res){
		try{
            var self = this;
            customlog.info("Inside view NpaDetail For DefaultDays");
		    if(typeof req.session.tenantId == 'undefined' || typeof req.session.userId == 'undefined') {
			    res.redirect(props.contextPath+'/client/ci/login');
		    }
		    else {
                var NPAAgingHolderObj = require(domainPath +"/NPAGroupSummaryHolder");
                var NPAAgingHolder = new NPAAgingHolderObj();
                var officeId;
                if (typeof(req.body.office) != 'undefined'){
                    officeId = req.body.office;
                }else{
                    officeId = req.session.officeId;
                }
                var productCategoryId 	= req.body.productCategory;
                var loanOfficer 		= req.body.loanOfficer;
                var actualPOS 			= req.session.actualPOS;
                var actualPOD 			= req.session.actualPOD;
                var daysInArrears		= req.body.daysArrearsId;
                var daysInArrearsMaxRange = req.body.daysInArrearsMaxRange;
                var rptdate 			= req.body.rptdate;
                NPAAgingHolder.setofficeFilterId(officeId);
                NPAAgingHolder.setPrdCategoryFilterId(productCategoryId);
                NPAAgingHolder.setPersonnelFilterId(loanOfficer);
                NPAAgingHolder.setColumn(1);
                NPAAgingHolder.setAccountTypeId(1);
                NPAAgingHolder.setNpaThreshold(1500);
                NPAAgingHolder.setActualPrincipalOutstanding(0);
                NPAAgingHolder.setActualPrincipalOverdue(1500);
                NPAAgingHolder.setdaysInArrears(daysInArrears);
                NPAAgingHolder.setDaysInArrearsMaxRange(daysInArrearsMaxRange);
                NPAAgingHolder.setDate(rptdate);
                var jsonArray = JSON.stringify(NPAAgingHolder);


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
                  path: "/mfi/api/report/npa/detail/date-"+rptdate+".json",
                  method: 'POST',
                  headers : postheaders
                };
                rest.postJSON(options,jsonArray,function(statuscode,result,headers){
                    //res.render('NPAReport.jade');
                    var NPAGroupDetailArray = new Array();
                    if(statuscode == 302) {
                        res.redirect(props.contextPath+'/client/ci/logout');
                    }
                    else if(result.status == "success"){
                        if(result.npaDetails.length > 0){
                            for(var i=0;i<result.npaDetails.length;i++) {
                                var NPAGroupSummaryHolderObj1 = require(domainPath +"/NPAGroupSummaryHolder");
                                var NPAGroupSummaryHolderResult = new NPAGroupSummaryHolderObj1();

                                NPAGroupSummaryHolderResult.setGlobalAccountNum(result.npaDetails[i].globalAccountNum);
                                NPAGroupSummaryHolderResult.setCustomer(result.npaDetails[i].customer);
                                NPAGroupSummaryHolderResult.setOffice(result.npaDetails[i].office);
                                NPAGroupSummaryHolderResult.setPersonnel(result.npaDetails[i].personnel);
                                NPAGroupSummaryHolderResult.setOriginalPrincipal(intToFormat(result.npaDetails[i].originalPrincipal.toFixed()));
                                NPAGroupSummaryHolderResult.setActualPrincipalDemanded(intToFormat(result.npaDetails[i].actualPrincipalDemanded.toFixed()));
                                NPAGroupSummaryHolderResult.setActualPrincipalPaid(intToFormat(result.npaDetails[i].actualPrincipalPaid.toFixed()));
                                NPAGroupSummaryHolderResult.setActualPrincipalOverdue(intToFormat(result.npaDetails[i].actualPrincipalOverdue.toFixed()));
                                NPAGroupSummaryHolderResult.setdaysInArrears(intToFormat(result.npaDetails[i].daysInArrears.toFixed()));
                                NPAGroupSummaryHolderResult.setActualPrincipalOutstanding(intToFormat(result.npaDetails[i].actualPrincipalOutstanding.toFixed()));
                                NPAGroupDetailArray[i] = NPAGroupSummaryHolderResult;
                            }
                            //var activityDetails = new Array(iklantPort, req.session.tenantId, req.session.userId, req.session.userName, req.originalUrl, req.connection.remoteAddress, "router.js", "viewNpaDetailForDefaultDays", "success", "NPA report", "NPA generated successfully");
                            //self.commonRouter.insertActivityLogModel(activityDetails);
                                req.body.npaDetailArray = NPAGroupDetailArray;
                                res.send(req.body)
                        }
                    } else {
                        self.showErrorPage(req,res);
                        }
                    });
                }
        }catch(e){
            customlog.error("Exception while View NPA Detail for Default Days "+e);
            self.showErrorPage(req,res);
        }
	},

	//TO retrieve  NPA Detail Groups Page Author : bask1939
	viewNpaGroupSummaryReport :  function(req,res){
	    try{
            var self = this;
            customlog.info("Inside View NPA Aging Report");
            if(typeof req.session.tenantId == 'undefined' || typeof req.session.userId == 'undefined') {
                res.redirect(props.contextPath+'/client/ci/login');
            }
            else {
                var loggedInOffice = req.session.officeId;
                var officeLabel;
                var productLabel;
                var personnelLabel;
                var headerLabel;
                var NPAAgingHolderObj = require(domainPath +"/NPAGroupSummaryHolder");
                var NPAAgingHolder = new NPAAgingHolderObj();

                var rptdate;
                if (typeof(req.body.npaReportDate) != 'undefined'){
                    rptdate = convertChequeDateIntoMifosFormat(req.body.npaReportDate);
                }

                var officeId;
                if (typeof(req.body.office) != 'undefined'){
                    officeId = req.body.office;
                }else{
                    officeId = req.session.officeId;
                }
                var productCategoryId = req.body.productCategory;
                var loanOfficer = req.body.loanOfficer;
                var actualPOS = req.body.ActPOS;
                var actualPOD = req.body.ActOD;
                var daysInArrears = req.body.daysArrearsId;

                if(productCategoryId == -1){
                    productLabel = 'Overall';
                }
                if(officeId == -1){
                    officeLabel = 'Overall';
                }
                if(loanOfficer == -1){
                    personnelLabel = 'Overall';
                }

                if (typeof(rptdate) != 'undefined'){
                    req.session.rptdate = rptdate;
                }else{
                    rptdate = req.session.rptdate;
                }
                if (typeof(actualPOS) != 'undefined'){
                    req.session.actualPOS = actualPOS;
                }else{
                    actualPOS = req.session.actualPOS;
                }

                if (typeof(actualPOD) != 'undefined'){
                    req.session.actualPOD = actualPOD;
                }else{
                    actualPOD = req.session.actualPOD;
                }
                if (typeof(daysInArrears) != 'undefined'){
                    req.session.daysInArrears = daysInArrears;
                }else{
                    daysInArrears = req.session.daysInArrears;
                }
                NPAAgingHolder.setofficeFilterId(officeId);
                NPAAgingHolder.setPrdCategoryFilterId(productCategoryId);
                NPAAgingHolder.setPersonnelFilterId(loanOfficer);
                NPAAgingHolder.setColumn(1);
                NPAAgingHolder.setAccountTypeId(1);
                NPAAgingHolder.setNpaThreshold(1500);
                NPAAgingHolder.setActualPrincipalOutstanding(actualPOS);
                NPAAgingHolder.setdaysInArrears(daysInArrears);
                NPAAgingHolder.setActualPrincipalOverdue(actualPOD);
                NPAAgingHolder.setDaysInArrearsMaxRange(999999);
                NPAAgingHolder.setDate(rptdate);

                var jsonArray = JSON.stringify(NPAAgingHolder);

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
                  path: "/mfi/api/report/npa/detail/date-"+rptdate+".json",
                  method: 'POST',
                  headers : postheaders
                };
                rest.postJSON(options,jsonArray,function(statuscode,result,headers){
                        customlog.info("statuscode" + statuscode);
                        customlog.info("result" + result.status);
                        customlog.info("headers" + headers);
                    //res.render('NPAReport.jade');
                    var NPAGroupDetailArray = new Array();
                    if(statuscode == 302) {
                        res.redirect(props.contextPath+'/client/ci/logout');
                    }
                    else if(result.status == "success"){
                            customlog.info("result" + result);
                        if(result.npaDetails.length > 0){
                            var productCategoryIdArray = new Array();
                            var productNameArray = new Array();
                            var officeIdArray = new Array();
                            var officeNameArray = new Array();
                            var officePersonnelIdArray = new Array();
                            var personnelIdArray = new Array();
                            var personnelNameArray = new Array();
                            var NPALoadHolder = require(domainPath +"/NPALoadHolder");
                            var NPALoadHolder = new NPALoadHolder();

                            for(var item = 0; item<result.prdCatories.length; item++) {
                                productCategoryIdArray[item]	= result.prdCatories[item].globalProductCategoryNumber;
                                productNameArray[item] 		= result.prdCatories[item].productCategoryName;
                                if(result.prdCatories[item].globalProductCategoryNumber == productCategoryId & productCategoryId != -1){
                                    productLabel = result.prdCatories[item].productCategoryName;
                                }
                            }
                            productCategoryIdArray[productCategoryIdArray.length] = -1;
                            productNameArray[productNameArray.length] = 'All';
                            NPALoadHolder.setProductCategoryIdArray(productCategoryIdArray);
                            NPALoadHolder.setProductNameArray(productNameArray);
                            var i=0;
                            for(var item = 0; item<result.offices.length; item++) {
                                if(result.offices[item].levelId == 5){
                                    officeIdArray[i]		= result.offices[item].officeId;
                                    officeNameArray[i] 	= result.offices[item].name;
                                    i=i+1;
                                }
                                if(result.offices[item].officeId == officeId & officeId != -1){
                                    officeLabel =result.offices[item].name;
                                }
                            }
                            officeIdArray[officeIdArray.length] = -1;
                            officeNameArray[officeNameArray.length] = 'All';
                            NPALoadHolder.setOfficeIdArray(officeIdArray);
                            NPALoadHolder.setOfficeNameArray(officeNameArray);
                            var j=0;
                            for(var item = 0; item<result.loanOfficerList.length; item++) {
                                if(result.loanOfficerList[item].officeId != 1 ){
                                    personnelIdArray[j]	= result.loanOfficerList[item].id;
                                    personnelNameArray[j] = result.loanOfficerList[item].firstName;
                                    officePersonnelIdArray[j] = result.loanOfficerList[item].officeId;
                                    j=j+1;
                                }
                                if(result.loanOfficerList[item].id == loanOfficer & loanOfficer != -1){
                                    personnelLabel = result.loanOfficerList[item].firstName;
                                }
                            }
                            personnelIdArray[personnelIdArray.length] = -1;
                            personnelNameArray[personnelNameArray.length] = 'All';
                            officePersonnelIdArray[officePersonnelIdArray.length] = '-1';
                            NPALoadHolder.setPersonnelIdArray(personnelIdArray);
                            NPALoadHolder.setPersonnelNameArray(personnelNameArray);
                            NPALoadHolder.setOfficePersonnelIdArray(officePersonnelIdArray);

                                    for(var i=0;i<result.npaDetails.length;i++) {
                                        var NPAGroupSummaryHolderObj1 = require(domainPath +"/NPAGroupSummaryHolder");
                                        var NPAGroupSummaryHolderResult = new NPAGroupSummaryHolderObj1();

                                        NPAGroupSummaryHolderResult.setGlobalAccountNum(result.npaDetails[i].globalAccountNum);
                                        NPAGroupSummaryHolderResult.setCustomer(result.npaDetails[i].customer);
                                        NPAGroupSummaryHolderResult.setOffice(result.npaDetails[i].office);
                                        NPAGroupSummaryHolderResult.setPersonnel(result.npaDetails[i].personnel);
                                        NPAGroupSummaryHolderResult.setOriginalPrincipal(intToFormat(result.npaDetails[i].originalPrincipal.toFixed()));
                                        NPAGroupSummaryHolderResult.setActualPrincipalDemanded(intToFormat(result.npaDetails[i].actualPrincipalDemanded.toFixed()));
                                        NPAGroupSummaryHolderResult.setActualPrincipalPaid(intToFormat(result.npaDetails[i].actualPrincipalPaid.toFixed()));
                                        NPAGroupSummaryHolderResult.setActualPrincipalOverdue(intToFormat(result.npaDetails[i].actualPrincipalOverdue.toFixed()));
                                        NPAGroupSummaryHolderResult.setdaysInArrears(intToFormat(result.npaDetails[i].daysInArrears.toFixed()));
                                        NPAGroupSummaryHolderResult.setActualPrincipalOutstanding(intToFormat(result.npaDetails[i].actualPrincipalOutstanding.toFixed()));
                                        NPAGroupDetailArray[i] = NPAGroupSummaryHolderResult;
                                    }
                                    if(productCategoryId == -1 & officeId == -1 & loanOfficer == -1 ){
                                        headerLabel = "OverAll";
                                    }else if(productCategoryId != -1 & officeId == -1 & loanOfficer == -1 ){
                                        headerLabel = productLabel;
                                    }else if(productCategoryId == -1 & officeId != -1 & loanOfficer == -1 ){
                                        headerLabel = officeLabel;
                                    }else if(productCategoryId == -1 & officeId == -1 & loanOfficer != -1 ){
                                        headerLabel = personnelLabel;
                                    }
                                    else if(productCategoryId != -1 & officeId != -1 & loanOfficer == -1 ){
                                        headerLabel = officeLabel + "-" + productLabel;
                                    }else if(productCategoryId != -1 & officeId == -1 & loanOfficer != -1 ){
                                        headerLabel = productCategoryId + "-" + personnelLabel;
                                    }
                                    else if(productCategoryId == -1 & officeId != -1 & loanOfficer != -1 ){
                                        headerLabel = officeLabel + "-" + personnelLabel;
                                    }
                                    else {
                                        headerLabel = officeLabel + "-" + productLabel+ "-" + personnelLabel ;
                                    }
                                        res.render('NPAGroupSummaryReport.jade',{NPAGroupDetailArray : NPAGroupDetailArray, NPALoadHolder : NPALoadHolder,officeId : officeId,
                                                        productCategoryId : productCategoryId,loanOfficer : loanOfficer, headerLabel :headerLabel,errorLabel : "", loggedInOffice : loggedInOffice, contextPath:props.contextPath});
                        }else{
                            req.session.loadNpaMenu = 1;
                            self.showNPAGroupSummaryPage(req,res);
                        }
                    }else{
                        req.session.loadNpaMenu = 1;
                        self.showNPAGroupSummaryPage(req,res);
                        }

                    });
                }
        }catch(e){
            customlog.error("Exception while View NPA Summary report "+e);
            self.showErrorPage(req,res);
        }
	},

	listNPASearchGroupCall : function(tenantId,recoveryOfficer,capabilityPercentage,isLeaderTraceableID,reasonForNPA,overdueDurationFrom,
					overdueDurationTo,amountFrom,amountTo,branch,callback) {
		this.model.listNPASearchGroupModel(tenantId,recoveryOfficer,capabilityPercentage,isLeaderTraceableID,reasonForNPA,overdueDurationFrom,
					overdueDurationTo,amountFrom,amountTo,branch,callback);
    },
	
	getNPAReasonsCall: function(tenantId,userId, callback) {
		this.model.getNPAReasonsModel(tenantId,userId, callback);
    },
	
	npaDefaultSearchCall: function(userId, callback) {
		this.model.npaDefaultSearchModel(userId, callback);
    },
	
	getOfficeListAjaxcall: function(req,res) {
		var self   = this;
		var tenantId = req.session.tenantId;
		var officeId = (typeof req.body.branch == 'undefined')?req.session.officeId:req.body.branch;
		try{
            self.getFONamesCall(officeId,function(FOIdsArray,FONamesArray) {
                //var activityDetails = new Array(iklantPort, req.session.tenantId, req.session.userId, req.session.userName, req.originalUrl, req.connection.remoteAddress, "router.js", "getOfficeListAjaxcall", "success", "Retrieve FOs ajax call", "FOs retrieved successfully");
                //self.commonRouter.insertActivityLogModel(activityDetails);
                req.body.FOIds = FOIdsArray;
                req.body.FONames = FONamesArray;
                res.send(req.body);
                });
        }catch(e){
            customlog.error("Exception while Retriving office Details "+e);
            self.showErrorPage(req,res);
        }
	},
	
	searchNPA : function(req,res) {
        try{
            var self   = this;
            var tenantId = req.session.tenantId;
            var userId = req.session.userId;
            if(typeof tenantId == 'undefined' || typeof userId == 'undefined') {
                res.redirect(props.contextPath+'/client/ci/login');
            }
            else {
                self.commonRouter.retriveOfficeCall(tenantId,userId,function(officeIdArray,officeNameArray,officeAddressArray,officeShortNameArray){
                    self.getNPAReasonsCall(tenantId,userId, function(npaReasonIdArray,npaReasonArray,recoveryOfficerId,recoveryOfficerName) {
                        self.npaDefaultSearchCall(req.session.userId, function(accountIdArray,customerNameArray,overDueAmountArray,recoveryOfficerNameArray,daysInArrearsArray,expectedCompletionDateArray) {
                            res.render('SearchNPALoans',{npaReasonIdArray:npaReasonIdArray,npaReasonArray:npaReasonArray,
                                                    accountIdArray:accountIdArray,customerNameArray:customerNameArray,
                                                    overDueAmountArray:overDueAmountArray,recoveryOfficerNameArray:recoveryOfficerNameArray,
                                                    daysInArrearsArray:daysInArrearsArray,recoveryOfficerId:recoveryOfficerId,
                                                    recoveryOfficerName:recoveryOfficerName,officeIdArray:officeIdArray,
                                                    officeNameArray:officeNameArray,expectedCompletionDateArray:expectedCompletionDateArray, contextPath:props.contextPath});
                            });
                        });
                    });
                }
		}catch(e){
            customlog.error("Exception while search NPA "+e);
            self.showErrorPage(req,res);
        }
	},
	
	listSearchedNPA: function(req,res) {
        try{
            var self   = this;
            var tenantId = req.session.tenantId;
            var recoveryOfficer = req.body.recoveryOfficer;
            var capabilityPercentage = req.body.capabilityPercentage;
            var isLeaderTraceableID = req.body.isLeaderTraceableID;
            var reasonForNPA = req.body.reasonForNPA;
            var overdueDurationFrom = req.body.overdueDurationFrom;
            var overdueDurationTo = req.body.overdueDurationTo;
            var amountFrom = req.body.amountFrom;
            var amountTo = req.body.amountTo;
            var branch = req.body.branch;
            self.listNPASearchGroupCall(tenantId,recoveryOfficer,capabilityPercentage,isLeaderTraceableID,reasonForNPA,overdueDurationFrom,
                        overdueDurationTo,amountFrom,amountTo,branch,function(accountIdArray,customerNameArray,overDueAmountArray,
                                                                                    daysInArrearsArray,recoveryOfficerNameArray,
                                                                                    expectedCompletionDateArray){
                //var activityDetails = new Array(iklantPort, req.session.tenantId, req.session.userId, req.session.userName, req.originalUrl, req.connection.remoteAddress, "router.js", "listSearchedNPA", "success", "Search NPA loans", "NPA loans retrieved successfully");
                //self.commonRouter.insertActivityLogModel(activityDetails);
                req.body.accountId = accountIdArray;
                req.body.customerNameArray = customerNameArray;
                req.body.overDueAmountArray = overDueAmountArray;
                req.body.daysInArrearsArray = daysInArrearsArray;
                req.body.recoveryOfficerNameArray = recoveryOfficerNameArray;
                req.body.expectedCompletionDateArray = expectedCompletionDateArray;
                res.send(req.body);
                    });
        }catch(e){
            customlog.error("Exception while List Searched NPA "+ e);
            self.showErrorPage(req,res);
        }
	},
	
	getNpaCaseStatusCall : function(tenantId,callback) {
		this.model.getNpaCaseStatusModel(tenantId,callback);
    },
	
	getNpaCaseCall : function(userId,date,callback) {
		this.model.getNpaCaseModel(userId,date,callback);
    },
	
	NPALRTodoCurrent: function(req,res) {
        try{
            var self   = this;
            var userId = req.session.userId;
            var tenantId = req.session.tenantId;
            if(typeof tenantId == 'undefined' || typeof userId == 'undefined') {
                res.redirect(props.contextPath+'/client/ci/login');
            }
            else {
                        //var activityDetails = new Array(iklantPort, req.session.tenantId, req.session.userId, req.session.userName, req.originalUrl, req.connection.remoteAddress, "router.js", "NPALRTodoCurrent", "success", "NPA todo", "NPA todo page loaded successfully");
                        //self.commonRouter.insertActivityLogModel(activityDetails);
                var date = "current";
                self.getNpaCaseStatusCall(tenantId,function(npaCaseStatusIdArray,npaCaseStatusNameArray) {
                    self.getNpaCaseCall(userId,date,function(taskIdArray,accountIdArray,customerArray,taskNameArray,dueDateArray,dueTimeArray,statusIdArray,statusNameArray) {
                        if(req.session.browser == "mobile") {
                                res.render('Mobile/NPALRTodoMobile',{date:date,npaCaseStatusIdArray:npaCaseStatusIdArray,
                                            npaCaseStatusNameArray:npaCaseStatusNameArray,taskIdArray:taskIdArray,accountIdArray:accountIdArray,
                                            customerArray:customerArray,taskNameArray:taskNameArray,dueDateArray:dueDateArray,
                                            dueTimeArray:dueTimeArray,statusIdArray:statusIdArray,statusNameArray:statusNameArray, contextPath:props.contextPath});
                        }
                        else {
                            res.render('NPALRTodo',{date:date,npaCaseStatusIdArray:npaCaseStatusIdArray,
                                            npaCaseStatusNameArray:npaCaseStatusNameArray,taskIdArray:taskIdArray,accountIdArray:accountIdArray,
                                            customerArray:customerArray,taskNameArray:taskNameArray,dueDateArray:dueDateArray,
                                            dueTimeArray:dueTimeArray,statusIdArray:statusIdArray,statusNameArray:statusNameArray, contextPath:props.contextPath});
                            }
                        });
                    });
                }
		}catch(e){
            customlog.error("Exception while NPALR To do Current Task "+e);
            self.showErrorPage(req,res);
        }
	},
	
	NPALRTodoFuture: function(req,res) {
		try{
            var self   = this;
            var userId = req.session.userId;
            var tenantId = req.session.tenantId;
            if(typeof tenantId == 'undefined' || typeof userId == 'undefined') {
                res.redirect(props.contextPath+'/client/ci/login');
            }
            else {
                        //var activityDetails = new Array(iklantPort, req.session.tenantId, req.session.userId, req.session.userName, req.originalUrl, req.connection.remoteAddress, "router.js", "NPALRTodoFuture", "success", "NPA todo", "NPA todo page loaded successfully");
                        //self.commonRouter.insertActivityLogModel(activityDetails);
                var date = "future";
                self.getNpaCaseStatusCall(tenantId,function(npaCaseStatusIdArray,npaCaseStatusNameArray) {
                    self.getNpaCaseCall(userId,date,function(taskIdArray,accountIdArray,customerArray,taskNameArray,dueDateArray,dueTimeArray,statusIdArray,statusNameArray) {
                        if(req.session.browser == "mobile") {
                                res.render('Mobile/NPALRTodoMobile',{date:date,npaCaseStatusIdArray:npaCaseStatusIdArray,
                                            npaCaseStatusNameArray:npaCaseStatusNameArray,taskIdArray:taskIdArray,accountIdArray:accountIdArray,
                                            customerArray:customerArray,taskNameArray:taskNameArray,dueDateArray:dueDateArray,
                                            dueTimeArray:dueTimeArray,statusIdArray:statusIdArray,statusNameArray:statusNameArray, contextPath:props.contextPath});
                        }
                        else {
                            res.render('NPALRTodo',{date:date,npaCaseStatusIdArray:npaCaseStatusIdArray,
                                            npaCaseStatusNameArray:npaCaseStatusNameArray,taskIdArray:taskIdArray,accountIdArray:accountIdArray,
                                            customerArray:customerArray,taskNameArray:taskNameArray,dueDateArray:dueDateArray,
                                            dueTimeArray:dueTimeArray,statusIdArray:statusIdArray,statusNameArray:statusNameArray, contextPath:props.contextPath});
                            }
                        });
                    });
                }
        }catch(e){
            customlog.error("Exception while NPALR to do Future "+e);
            self.showErrorPage(req,res);
        }
	},

	NPALRTodoOverdue: function(req,res) {
		try{
            var self   = this;
            var userId = req.session.userId;
            var tenantId = req.session.tenantId;
            if(typeof tenantId == 'undefined' || typeof userId == 'undefined') {
                res.redirect(props.contextPath+'/client/ci/login');
            }
            else {
                        //var activityDetails = new Array(iklantPort, req.session.tenantId, req.session.userId, req.session.userName, req.originalUrl, req.connection.remoteAddress, "router.js", "NPALRTodoOverdue", "success", "NPA todo", "NPA todo page loaded successfully");
                        //self.commonRouter.insertActivityLogModel(activityDetails);
                var date = "overdue";
                self.getNpaCaseStatusCall(tenantId,function(npaCaseStatusIdArray,npaCaseStatusNameArray) {
                    self.getNpaCaseCall(userId,date,function(taskIdArray,accountIdArray,customerArray,taskNameArray,dueDateArray,dueTimeArray,statusIdArray,statusNameArray) {
                        if(req.session.browser == "mobile") {
                                res.render('Mobile/NPALRTodoMobile',{date:date,npaCaseStatusIdArray:npaCaseStatusIdArray,
                                            npaCaseStatusNameArray:npaCaseStatusNameArray,taskIdArray:taskIdArray,accountIdArray:accountIdArray,
                                            customerArray:customerArray,taskNameArray:taskNameArray,dueDateArray:dueDateArray,
                                            dueTimeArray:dueTimeArray,statusIdArray:statusIdArray,statusNameArray:statusNameArray, contextPath:props.contextPath});
                        }
                        else {
                            res.render('NPALRTodo',{date:date,npaCaseStatusIdArray:npaCaseStatusIdArray,
                                            npaCaseStatusNameArray:npaCaseStatusNameArray,taskIdArray:taskIdArray,accountIdArray:accountIdArray,
                                            customerArray:customerArray,taskNameArray:taskNameArray,dueDateArray:dueDateArray,
                                            dueTimeArray:dueTimeArray,statusIdArray:statusIdArray,statusNameArray:statusNameArray, contextPath:props.contextPath});
                            }
                        });
                    });
                }
        }catch(e){
            customlog.error("Exception while NPALR to do Overdue "+e);
            self.showErrorPage(req,res);
        }
	},
	
	getNpaClosedCaseCall: function(userId,date,callback) {
		this.model.getNpaClosedCaseModel(userId,date,callback);
    },
	
	NPALRTodoClosed: function(req,res) {
		try{
            var self   = this;
            var userId = req.session.userId;
            var tenantId = req.session.tenantId;
            if(typeof tenantId == 'undefined' || typeof userId == 'undefined') {
                res.redirect(props.contextPath+'/client/ci/login');
            }
            else {
                var date = "closed";
                self.getNpaClosedCaseCall(userId,date,function(taskIdArray,accountIdArray,customerArray,taskNameArray,dueDateArray,statusIdArray,statusNameArray,closedDateArray,remarksArray) {
                    //var activityDetails = new Array(iklantPort, req.session.tenantId, req.session.userId, req.session.userName, req.originalUrl, req.connection.remoteAddress, "router.js", "NPALRTodoClosed", "success", "NPA todo", "NPA todo page loaded successfully");
                    //self.commonRouter.insertActivityLogModel(activityDetails);
                    if(req.session.browser == "mobile") {
                        res.render('Mobile/NPALRTodoClosedMobile',{date:date,taskIdArray:taskIdArray,accountIdArray:accountIdArray,
                                        customerArray:customerArray,taskNameArray:taskNameArray,dueDateArray:dueDateArray,statusIdArray:statusIdArray,
                                        statusNameArray:statusNameArray,closedDateArray:closedDateArray,remarksArray:remarksArray, contextPath:props.contextPath});
                    }
                    else {
                        res.render('NPALRTodoClosed',{date:date,taskIdArray:taskIdArray,accountIdArray:accountIdArray,
                                        customerArray:customerArray,taskNameArray:taskNameArray,dueDateArray:dueDateArray,statusIdArray:statusIdArray,
                                        statusNameArray:statusNameArray,closedDateArray:closedDateArray,remarksArray:remarksArray, contextPath:props.contextPath});
                        }
                    });
                }
        }catch(e){
            customlog.error("Exception while NPALR to do Closed "+e);
            self.showErrorPage(req,res);
        }
	},
	
	submitNpaCaseCall : function(taskId,taskRemarks,callback) {
		this.model.submitNpaCaseModel(taskId,taskRemarks,callback);
    },
	
	submitNpaCase: function(req,res) {
        try{
            var self   = this;
            var userId = req.session.userId;
            var tenantId = req.session.tenantId;
            var taskRemarks = req.body.remarks;
            var taskId = req.body.taskId;
                self.submitNpaCaseCall(taskId,taskRemarks,function(result) {
                var activityDetails = new Array(iklantPort, req.session.tenantId, req.session.userId, req.session.userName, req.originalUrl, req.connection.remoteAddress, "router.js", "submitNpaCase", "success", "NPA groups", "NPA TaskId "+taskId+" submited successfully","insert");
                self.commonRouter.insertActivityLogModel(activityDetails);
                    req.body.result = result;
                    res.send(req.body);
                });
        }catch(e){
            customlog.error("Exception while Submit NPA Case "+e);
            self.showErrorPage(req,res);
        }
	},
	
    getGroupsForRecoveryPage : function(userId,callback) {
		this.model.getGroupsForRecoveryModel(userId,callback);
    },
	
	getGroupsForRecovery : function(req,res) {
		try{
            var self   = this;
            var userId = req.session.userId;
            if(typeof (req.session.tenantId) == 'undefined' || typeof (req.session.userId) == 'undefined') {
                res.redirect(props.contextPath+'/client/ci/login');
            }else{
                self.getGroupsForRecoveryPage(userId,function(groupDetailsArray){
                    //var activityDetails = new Array(iklantPort, req.session.tenantId, req.session.userId, req.session.userName, req.originalUrl, req.connection.remoteAddress, "router.js", "getGroupsForRecovery", "success", "Loan recovary", "NPA page loaded successfully");
                    //self.commonRouter.insertActivityLogModel(activityDetails);
                    if(req.session.browser == "mobile") {
                        res.render('Mobile/groupsForLoanRecoveryMobile',{ groupDetailsArray : groupDetailsArray, contextPath:props.contextPath});
                    }
                    else {
                        res.render('groupsForLoanRecovery',{ groupDetailsArray : groupDetailsArray, contextPath:props.contextPath});
                        }
                    });
                }
        }catch(e){
            customlog.error("Exception while get groups for Recovery "+e);
            self.showErrorPage(req,res);
        }
	},

	//Upload File
	updateFileLocation : function(accountId,fileName,selectedClientId,callback) {
		this.model.updateFileLocationModel(accountId,fileName,selectedClientId,callback);
	},
	
	uploadFile : function(req,res) {
		try{
            var self	= this;
            var userId = req.session.userId;
            var constantsObj = this.constants;
            var accountId = req.params.accountId;
            var selectedClientId = req.params.clientId;
            var backFlag = req.body.backFlagId;
            customlog.info("accountId" + accountId+"clientId"+selectedClientId);
            var alertMsg="";
            var fs = require('fs'),
            util = require('util');
            var fileName=new Array();
            var isMulitpleDoc=req.body.isMultipleDocument;
            customlog.info("Multiple Doc="+isMulitpleDoc);
            if(isMulitpleDoc=="true"){
                customlog.info("inside true");
                for(var i=0; i<req.files.multipleUploadDocument.length; i++){
                    fileName[i]=accountId+"_"+selectedClientId+"_"+getCurrentTimeStamp()+"_"+req.files.multipleUploadDocument[i].name;
                    var is = fs.createReadStream(req.files.multipleUploadDocument[i].path)
                    var os = fs.createWriteStream(rootPath+"/documents/group_documents/"+fileName[i]);
                    is.pipe(os);
                    is.on('end', function() {
                        alertMsg = "Files has been Uploaded Successfully!"
                        customlog.info('Successfully uploaded');
                    });
                    fs.unlink(req.files.multipleUploadDocument[i].path, function(err){
                        if(err){ customlog.info('Error while unlinking '+err); }
                        else { customlog.info('Successfully unlinked');};
                    });
                    is.on('error', function(err) { customlog.info("Error while uploading "+err); });
                }
            }
            else if(isMulitpleDoc== "false"){
                if(req.files.singleUploadDocument.name!=""){
                    fileName[0]=accountId+"_"+selectedClientId+"_"+getCurrentTimeStamp()+"_"+req.files.singleUploadDocument.name;
                    customlog.info("fileName="+fileName);
                    if(req.files.singleUploadDocument.name!=""){
                        var is = fs.createReadStream(req.files.singleUploadDocument.path)
                        var os = fs.createWriteStream(rootPath+"/documents/group_documents/"+fileName[0]);
                        is.pipe(os);
                        is.on('end', function() {
                            customlog.info('Successfully uploaded');
                            alertMsg = "File has been Uploaded Successfully!"
                        });
                        fs.unlink(req.files.singleUploadDocument.path, function(err){
                            if(err){ customlog.info('Error while unlinking '+err); }
                            else { customlog.info('Successfully unlinked');};
                        });
                        is.on('error', function(err) { customlog.info("Error while uploading "+err); });
                    }
                }
            }
            //var activityDetails = new Array(iklantPort, req.session.tenantId, req.session.userId, req.session.userName, req.originalUrl, req.connection.remoteAddress, "router.js", "uploadFile", "success", "uploadFile", "File upload successfully");
            //self.commonRouter.insertActivityLogModel(activityDetails);
            self.updateFileLocation(accountId,fileName,selectedClientId,function() {
                self.androidRouter.getGroupsDetailsForRecoveryPage(userId,accountId,function(accountDetailsArray){
                    self.androidRouter.recoveryReasons(function(recoveryReasonId,recoveryReasonDescription){
                        if(req.session.browser == "mobile") {
                            res.render('Mobile/groupsDetailsForRecoveryMobile',{alertMsg:alertMsg,accountDetailsArray : accountDetailsArray, recoveryReasonId : recoveryReasonId,recoveryReasonDescription : recoveryReasonDescription,backFlag:backFlag, contextPath:props.contextPath});
                        }
                        else {
                            res.render('groupsDetailsForRecovery',{alertMsg:alertMsg,accountDetailsArray : accountDetailsArray, recoveryReasonId : recoveryReasonId,recoveryReasonDescription : recoveryReasonDescription,backFlag:backFlag, contextPath:props.contextPath});
                            }
                        });
                    });
                });
        }catch(e){
            customlog.error("Exception while Upload File "+e);
            self.showErrorPage(req,res);
        }
	},

	updateVerifiedInformationPage : function(accountId,statusId,reason,remarks,capabilitypercentage,expecteddate,otherReason,answerOne,answerTwo,answerThree,answerFour,answerFive,answerSix,answerSeven,flag,userId,todoActivity,todoDueDate,todoDueTime,callback) {
		this.model.updateVerifiedInformationModel(accountId,statusId,reason,remarks,capabilitypercentage,expecteddate,otherReason,answerOne,answerTwo,answerThree,answerFour,answerFive,answerSix,answerSeven,flag,userId,todoActivity,todoDueDate,todoDueTime,callback);
	},

	updateVerifiedInformation : function(req,res) {
		try{
            var self	= this;
            var userId = req.session.userId;
            var accountId = req.params.accountId;
            customlog.info("accountId" + accountId);
            var statusId = req.body.statusId;
            var remarks;
            var reason = new Array();
            var capabilitypercentage;
            var expecteddate;
            var otherReason;
            var answerOne = req.body.questionNO1Id;
            var answerTwo = req.body.questionNO2Id;
            var answerThree = req.body.questionNO3Id;
            var answerFour = req.body.questionNO4Id;
            var answerFive = req.body.questionNO5Id;
            var answerSix = req.body.percentageId;
            var answerSeven = req.body.approvalDate;
            var backFlag = req.body.backFlagId;
            var flag;

            var todoActivity = req.body.todoActivity;
            var todoDueDate = req.body.todoDueDate;
            var todoDueTime = req.body.todoDueTime;

            todoActivity = todoActivity.split(",");
            todoDueDate = todoDueDate.split(",");
            todoDueTime = todoDueTime.split(",");

            customlog.info("todoActivity : " + todoActivity);
            customlog.info("todoDueDate : " +todoDueDate);
            customlog.info("todoDueTime : " +todoDueTime);
            customlog.info("answerSix : " +answerSix);
            customlog.info("capabilitypercentage : " +req.body.percentageId);
            if(req.body.loanstatus == 1) {
                flag = false;
            } else {
                flag = true;
            }
            customlog.info("statusId" + statusId);
            if(statusId == 1){

            }else if(statusId == 2){

            }else if(statusId == 3){
                reason = req.body.reasonName;
                otherReason = req.body.otherReasonName;
                remarks = req.body.remarksId;
            }else if(statusId == 4){
                reason = req.body.reasonName;
                otherReason = req.body.otherReasonName;
                capabilitypercentage = req.body.percentageId;
                expecteddate = req.body.approvalDate;
                customlog.info("reason inside" + reason[0]);
            }
            self.updateVerifiedInformationPage(accountId,statusId,reason,remarks,capabilitypercentage,expecteddate,
                                        otherReason,answerOne,answerTwo,answerThree,answerFour,answerFive,answerSix,
                                        answerSeven,flag,userId,todoActivity,todoDueDate,todoDueTime,function(){
                    var activityDetails = new Array(iklantPort, req.session.tenantId, req.session.userId, req.session.userName, req.originalUrl, req.connection.remoteAddress, "router.js", "updateVerifiedInformation", "success", "NPA Loan Recovery", "AccountId "+accountId+" NPA VerifiedInformation successfully","update");
                    self.commonRouter.insertActivityLogModel(activityDetails);
                    if(backFlag == 0) {
                    res.redirect(props.contextPath+"/client/ci/getGroupsForRecovery");
                }
                else if(backFlag == 1) {
                        res.redirect(props.contextPath+"/client/ci/pastDueLoans");
                    }
                });
        }catch(e){
            customlog.error("Exception while Update verified information "+e);
            self.showErrorPage(req,res);
        }
	},

	retrieveClientDetailsPage : function(accountId,callback) {
		this.model.retrieveClientDetailsPageModel(accountId,callback);
	},

	retrieveClientDetails :  function(req,res) {
		try{
            var self = this;
            var accountId = req.body.accountId;
            //var activityDetails = new Array(iklantPort, req.session.tenantId, req.session.userId, req.session.userName, req.originalUrl, req.connection.remoteAddress, "router.js", "retrieveClientDetails", "success", "retrieveClientDetails", "retrieveClientDetails");
            //self.commonRouter.insertActivityLogModel(activityDetails);
            self.retrieveClientDetailsPage(accountId,function(customerIdArray,customerNameArray,customerAddressArray){
                req.body.customerIdArray 	  = customerIdArray;
                req.body.customerNameArray 	  = customerNameArray;
                req.body.customerAddressArray = customerAddressArray;
                res.send(req.body);
                });
        }catch(e){
            customlog.error("Exception while retrieve Client Details "+e);
            self.showErrorPage(req,res);
        }
	},
	
	retrieveUploadedDocsPage : function(accountId,clientId,callback) {
		this.model.retrieveUploadedDocsPageModel(accountId,clientId,callback);
	},
	
	retrieveUploadedDocs :  function(req,res) {
		try{
            var self = this;
            var accountId = req.body.accountId;
            var clientId = req.body.clientId;
            //var activityDetails = new Array(iklantPort, req.session.tenantId, req.session.userId, req.session.userName, req.originalUrl, req.connection.remoteAddress, "router.js", "retrieveUploadedDocs", "success", "retrieveUploadedDocs", "retrieveUploadedDocs Successfully");
            //self.commonRouter.insertActivityLogModel(activityDetails);
            customlog.info("accountId "+accountId);
            customlog.info("clientId "+clientId);
            self.retrieveUploadedDocsPage(accountId,clientId,function(docsListArray){
                req.body.docsListArray 	  = docsListArray;
                res.send(req.body);
                });
        }catch(e){
            customlog.error("Exception while retrieve upload Document "+e);
            self.showErrorPage(req,res);
        }
	},
*/
	/*retrieveLoanOfficerList  : function(req,res){
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
                            res.render('PaymentVerification.jade',{PaymentCollectionArray : PaymentCollectionArray,personnelIdArray : req.session.personnelIdArray,personnelNameArray : req.session.personnelNameArray,officeId:req.session.officeId,personnelId : "0", contextPath:props.contextPath});
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
                            res.render('PaymentVerification.jade',{PaymentCollectionArray : PaymentCollectionArray,personnelIdArray : req.session.personnelIdArray,personnelNameArray : req.session.personnelNameArray,officeId:req.session.officeId,personnelId : "0", contextPath:props.contextPath});
                            }
                        } else {
                            self.showErrorPage(req,res);
                        }
                    });
                }
        }catch(e){
            customlog.error("Exception while retrieve loan officer list "+e);
            self.showErrorPage(req,res);
        }
	},
*/
	/*searchpage : function(req,res){
        try{
            var self = this;
            if(typeof (req.session.tenantId) == 'undefined' || typeof (req.session.userId) == 'undefined') {
                res.redirect(props.contextPath+'/client/ci/login');
            }else{
                var searchResult = new Array();
                constantsObj  = this.constants;
                res.render('serachResult.jade',{searchResult : searchResult,errorLabel : "",roleId : req.session.roleId,constantsObj : constantsObj, contextPath:props.contextPath});
                }
        }catch(e){
            customlog.error("Exception while search page "+e);
            self.showErrorPage(req,res);
        }
	},	*/

	/*chequeDepositList  : function(req,res){
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
                            var revertPaymentFO1 = require(domainPath +"/PaymentCollectionDetailDto");
                            var revertPayment = new revertPaymentFO1();
                            revertPayment.setPaymentCollectionId(result.chequeDepInfn[i].paymentCollectionId);
                            revertPayment.setGroupName(result.chequeDepInfn[i].groupName);
                            revertPayment.setGroupId(result.chequeDepInfn[i].groupId);
                            revertPayment.setGlobalAccNum(result.chequeDepInfn[i].globalAccNum);
                            revertPayment.setModeOfPayment(result.chequeDepInfn[i].modeOfPayment);
                            revertPayment.setAmount(result.chequeDepInfn[i].amount);
                            chequeDepositListArray[i] = revertPayment;
                        }
                        res.render('chequedepositlist.jade',{chequeDepositListArray : chequeDepositListArray, contextPath:props.contextPath});
                    } else {
                        self.showErrorPage(req,res);
                    }
                });
            }
        }catch(e){
            customlog.error("Exception While Cheque deposit list "+e);
            self.showErrorPage(req,res);
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
            res.render('chequedeposit.jade',{paymentCollectionId : paymentCollectionId ,groupName : groupName, contextPath:props.contextPath,
                                            globalAccountNumber : globalAccountNumber, amount : amount,
                                            glcodeId : req.session.glCodeId, glcodeName : req.session.glCode });
        }catch(e){
            customlog.error("Exception while Cheque Deposit List "+e);
            sel.showErrorPage(req,res);
        }
	},
	doChequeDeposit : function(req,res){
		try{
            customlog.info("Inside Do chequeDeposit");
            var self = this;
            var chequeDeposit1 = require(domainPath +"/PaymentCollectionDetailDto");
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
            self.showErrorPage(req,res);
        }
	},*/
	/*retrieveClientAmountDetails : function(req,res){
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
                    //var activityDetails = new Array(iklantPort, req.session.tenantId, req.session.userId, req.session.userName, req.originalUrl, req.connection.remoteAddress, "router.js", "retrieveClientAmountDetails", "success", "retrieveClientAmountDetails", "retrieveClientAmountDetails");
                    //self.commonRouter.insertActivityLogModel(activityDetails);
                    for(var i = 0; i < result.paymentInfn.length; i++) {
                        var revertPaymentFO1 = require(domainPath +"/PaymentCollectionDetailDto");
                        var revertPayment = new revertPaymentFO1();
                        revertPayment.setClientName(result.paymentInfn[i].clientName);
                        revertPayment.setAmount(result.paymentInfn[i].amount);
                        revertPaymentClientListArray[i] = revertPayment;
                }
                    req.body.clientList = revertPaymentClientListArray;
                    res.send(req.body);
                } else {
                    self.showErrorPage(req,res);
                }
            });
        }catch(e){
            customlog.error("Exception While retrive client Documents "+e);
            self.showErrorPage(req,res);
        }
	},*/

	/*revertPayment : function(req,res){
		try{
            var self = this;
            var paymentCollectionId = req.params.paymentCollectionId;
            customlog.info("paymentCollectionId =+-*//*********" + paymentCollectionId);
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
                        self.showErrorPage(req,res);
                    }
                }
            });
        }catch(e){
            customlog.error("Exception While Revert payment "+e);
            self.showErrorPage(req,res);
        }
	},
*/
	/*revertPaymentList : function(req,res){
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
                                res.render('revertPayment',{revertPaymentArray : revertPaymentArray, errorLabel : "No payments made for the day" , contextPath:props.contextPath});
                            }
                        }
                        else{
                            for(var i = 0; i < result.paymentInfn.length; i++) {
                                var revertPaymentFO1 = require(domainPath +"/PaymentCollectionDetailDto");
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
                                res.render('revertPayment.jade',{revertPaymentArray : revertPaymentArray, errorLabel : "" , contextPath:props.contextPath, roleId: req.session.roleId,constantsObj: self.constants});
                            }
                        }
                    } else {
                        self.showErrorPage(req,res);
                    }
                });
            }
        }catch(e){
            customlog.error("Exception while Revert payment list "+e);
            self.showErrorPage(req,res);
        }
	},*/
	
	/*showLoanRecoveryLoanAccountInformation: function(req,res,paymentMonthClosingError,loanAccInformationDto,loanSummary,paidInstallment,dueInstallment,futureInstallment,runningBalance,clientLoanAccountDetailsDto,recentAccountActivity,viewAllAccountActivity,loanStatusId,loanRepayment,clientName,redirectionPageId) {
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
                    res.render('applyPaymentForFo',{paymentMonthClosingError:req.session.paymentMonthClosingError,loanAccInformationDto:loanAccInformationDto,loanSummary:loanSummary,paidInstallment:paidInstallment,dueInstallment:dueInstallment,futureInstallment:futureInstallment,runningBalance:runningBalance,clientLoanAccountDetailsDto:clientLoanAccountDetailsDto,recentAccountActivity:recentAccountActivity,viewAllAccountActivity:viewAllAccountActivity,loanStatusId:loanStatusId,roleArray : req.session.roleArray,loanRepayment : loanRepayment,clientName : clientName,redirectionPageId : redirectionPageId, contextPath:props.contextPath});
                }
            }else{
                customlog.info("Inside Else Apply payment show page"+loanRepayment.getAmount());
                res.render('ApplyPayment',{paymentMonthClosingError:req.session.paymentMonthClosingError, contextPath:props.contextPath,
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
            self.showErrorPage(req,res);
        }
		
    },
*/
	/*applyPaymentForFo :function(req, res){
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
            var ClientPaymentObj = require(domainPath +"/ClientPaymentDto");
            if(typeof req.body.dateofTransaction != 'undefined')
                transactionDate = convertChequeDateIntoMifosFormat(req.body.dateofTransaction);
            customlog.info("Session Group Mifos Name " + req.session.groupCenterMifosName );
            if(typeof clientNameForGroup != 'undefined'){
                req.session.groupCenterMifosName = clientNameForGroup;
            }
            if(typeof clientNameForGroup == 'undefined'){
                clientNameForGroup = req.session.groupCenterMifosName;
            }

            var loanRepaymentHolder = require(domainPath +"/LoanRepayment");
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
                    var LoanRepayment = require(domainPath +"/LoanRepayment");
                    var ClientPaymentDto = require(domainPath +"/ClientPaymentDto");
                    var GLCodeDto = require(domainPath +"/GLCodeDto");
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
                                    clientPaymentDetail.setTotalOverdueAmount(result.paymentInfn.clientPaymentDetails[item].totalOverdueAmount);
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
                                groupClientPaymentDetail.setTotalOverdueAmount(result.paymentInfn.paymentDetails.totalOverdueAmount);
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

                            var loanAccountInformationDto = require(domainPath +"/loanAccountInformationDto");
                            var loanSummary = require(domainPath +"/loanSummary");
                                //var paidInstallment = require(domainPath +"/paidInstallment");
                                //var futureInstallment = require(domainPath +"/futureInstallment");
                                //var runningBalance = require(domainPath +"/runningBalance");
                                var RepaymentSchedule = require(domainPath +"/RepaymentSchedule");
                                var clientLoanAccountDetailsDto = require(domainPath +"/clientLoanAccountDetailsDto");
                                var RecentAccountActivity = require(domainPath +"/RecentAccountActivity");

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
                                *//*var individual_track;
                                if(result.loanInfnList.loanInformationDto.individualTracked == "true" )
                                    individual_track = "Yes";
                                else
                                    individual_track = "No"
                                customlog.info("individual_track"+individual_track)*//*
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


                            /*//*****************************************Group Paid Installment***************************************************//*/

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


                            /*//***************************************Group Due Installment****************************************************//*/

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

                            /*//***************************************Group Future Installment****************************************************//*/

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


                            *//*var futureStartValue = result.loanInfnList.loanInformationDto.loanRepaymentSchedule.dueInstallments.length;
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

                            }*//*
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

                            /*//***************************************** Running Balance **********************************************************************//*/

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
                            /*//**************************************Client Account Info **************************************************************//*/

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

                                    /*//**************************************Client Paid Installment **************************************************************//*/
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

                                    /*//**************************************Client Due Installment **************************************************************//*/
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

                                    /*//**************************************Client Future Installment **************************************************************//*/
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

                                    *//*var futureStartValue = result.loanInfnList.loanAccountDetailsDto[innerItem].loanRepaymentSchedule.dueInstallments.length;
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
                                    }*//*
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

                                    /*//**************************************Client Running Balance **************************************************************//*/
                                    *//*var clientRunningBalance = new RepaymentSchedule();
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
                                    totalRunBal = [];*//*
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
                            self.showErrorPage(req,res);
                        }
                    }
                });
            }
        }catch(e){
            customlog.error("Exception while Apply Payment for Fo "+e);
            self.showErrorPage(req,res);
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
            *//*var transactionDate;
            if(typeof req.body.dateofTransaction != 'undefined')
                transactionDate = new Date(convertToMifosDateFormat(req.body.dateofTransaction));
            var retrieveType = req.body.retrieveType;
            var sourceofPayment = req.body.sourceofPayment;
            var chequeNo = req.body.chequeNo;
            var chequeDate;
            if(typeof req.body.chequeDate != 'undefined')
                chequeDate = new Date(convertToMifosDateFormat(req.body.chequeDate));*//*
            var amount = req.body.amount;

            var noOfClients = parseInt(req.body.noOfClients,10);

            var clientsId = req.body.clientsId.split(",");
            var clientsName = req.body.clientsName.split(",");
            var clientAmounts = req.body.clientAmounts.split(",");
            if(noOfClients >0 ){
                var ClientPaymentDtoObj = require(domainPath +"/ClientPaymentDto");
                for(var item =0 ; item < noOfClients; item++) {
                    var clientPaymentDto=new ClientPaymentDtoObj();
                    //clientPaymentDto.clearAll();
                    clientPaymentDto.setClientId(clientsId[item]);
                    clientPaymentDto.setClientName(clientsName[item]);
                    clientPaymentDto.setClientPaymentAmount(clientAmounts[item]);
                    clientPaymentObjArray[item] = clientPaymentDto;

                }
            }

            var loanRepaymentHolder1 = require(domainPath +"/LoanRepayment");
            var loanRepaymentHolder = new loanRepaymentHolder1();
            *//*if(relaxValidation == 'on') {
                customlog.info("Relax Validation");
                loanRepaymentHolder.setRelaxMismatchValidationCheck("true");}
            else
                loanRepaymentHolder.setRelaxMismatchValidationCheck("false");*//*
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
            self.showErrorPage(req,res);
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
                        res.render('loanrecoveryLoans',{loanDetails : loanDetails,searchResult : searchResult, errorLabel : "Please enter group name to search",roleId : req.session.roleId,constantsObj : constantsObj , contextPath:props.contextPath});
                    }
                }else{
                        res.render('serachResult',{searchResult : searchResult, errorLabel :  "Please enter group name to search",roleId : req.session.roleId,constantsObj : constantsObj, contextPath:props.contextPath});
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


                var repayLoanHolderObj = require(domainPath +"/paymentCollectionImageHolder");
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
                        self.showErrorPage(req,res);
                    }
                    else if(result.status == "success") {
                        if (result.groupList.length == 0){
                            if(req.session.roleId == constantsObj.getFOroleId()){
                                if(req.session.browser == "mobile") {
                                    res.render('Mobile/loanrecoveryLoans',{loanDetails : loanDetails,searchResult : searchResult, errorLabel : "No groups found", roleId : req.session.roleId,constantsObj : constantsObj , contextPath:props.contextPath});
                                }else{
                                    res.render('loanrecoveryLoans',{loanDetails : loanDetails,searchResult : searchResult, errorLabel : "No groups found", roleId : req.session.roleId,constantsObj : constantsObj , contextPath:props.contextPath});
                                }
                            }else{
                                res.render('serachResult',{searchResult : searchResult, errorLabel :  "No groups found",roleId : req.session.roleId,constantsObj : constantsObj, contextPath:props.contextPath});
                            }
                        }
                        else{
                            for(var i = 0; i < result.groupList.length; i++) {

                                var LoanRepaymentForFO1 = require(domainPath +"/CustomerDetailDto");
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
                                    res.render('loanrecoveryLoans',{loanDetails : loanDetails,searchResult : searchResult, errorLabel : "", roleId : req.session.roleId,constantsObj : constantsObj, contextPath:props.contextPath});
                                }
                            }else{
                                res.render('serachResult',{searchResult : searchResult, errorLabel : "",roleId : req.session.roleId,constantsObj : constantsObj, contextPath:props.contextPath});
                            }
                        }
                    } else {
                        self.showErrorPage(req,res);
                    }
                });
            }
        }catch(e){
            customlog.error("Exception while search "+e);
            self.showErrorPage(req,res);
        }
	},
*/
	/*loanrecoveryLoans  :  function(req,res){
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
                var CustomerDetailDto1 = require(domainPath +"/CustomerDetailDto");
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
                                        res.render('loanrecoveryLoans',{loanDetails : loanDetails,searchResult : searchResult, errorLabel : "No groups found",officeIdArray :officeIdArray, officeNameArray : officeNameArray,roleId : roleId,officeId : officeId,foIdArray : foIdArray,foNameArray : foNameArray, userId : userId,constantsObj:constantsObj , contextPath:props.contextPath});
                                    }
                                }
                                else {
                                    var i=0;
                                    for(var item = 0; item<result.loanList.length; item++) {
                                        var LoanRepaymentForFO1 = require(domainPath +"/LoanRepaymentForFO");
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
                                        res.render('loanrecoveryLoans',{loanDetails : loanDetails,searchResult : searchResult,errorLabel :"",officeIdArray :officeIdArray,officeNameArray :officeNameArray,roleId :roleId,officeId :officeId,foIdArray : foIdArray,foNameArray : foNameArray, userId : userId,constantsObj:constantsObj, contextPath:props.contextPath});
                                    }
                                }
                            } else {
                                self.showErrorPage(req,res);
                            }
                        });
                    });
                });
            }
        }catch(e){
            customlog.error("Exception While Loan recovery Loans "+e);
            self.showErrorPage(req,res);
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
            var CustomerDetailDto1 = require(domainPath +"/CustomerDetailDto");
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
                            var LoanRepaymentForFO1 = require(domainPath +"/LoanRepaymentForFO");
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
                    self.showErrorPage(req,res);
                }

            });
        }catch(e){
            customlog.error("Exception while Loan recovery Ajexcall "+e);
            self.showErrorPage(req,res);
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
                var CustomerDetailDto1 = require(domainPath +"/CustomerDetailDto");
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
                                        res.render('pastDueLoans',{loanDetails : loanDetails,searchResult : searchResult,errorLabel :"",officeIdArray :officeIdArray,officeNameArray :officeNameArray,roleId :roleId,officeIdArray :officeIdArray, officeNameArray : officeNameArray,roleId : roleId,officeId : officeId,foIdArray : foIdArray,foNameArray : foNameArray, userId : userId,constantsObj:constantsObj, contextPath:props.contextPath});
                                    }
                                }
                                else {
                                    var i=0;
                                    for(var item = 0; item<result.loanList.length; item++) {
                                        var LoanRepaymentForFO1 = require(domainPath +"/LoanRepaymentForFO");
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
                                        res.render('pastDueLoans',{loanDetails : loanDetails,searchResult : searchResult,errorLabel :"",officeIdArray :officeIdArray,officeNameArray :officeNameArray,roleId :roleId,officeIdArray :officeIdArray, officeNameArray : officeNameArray,roleId : roleId,officeId : officeId,foIdArray : foIdArray,foNameArray : foNameArray, userId : userId,constantsObj:constantsObj, contextPath:props.contextPath});
                                    }
                                }
                            } else {
                                self.showErrorPage(req,res);
                            }
                        });
                    });
                });
            }
        }catch(e){
            customlog.error("Exception while Past due loans "+e);
            self.showErrorPage(req,res);
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
            var CustomerDetailDto1 = require(domainPath +"/CustomerDetailDto");
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
                            var LoanRepaymentForFO1 = require(domainPath +"/LoanRepaymentForFO");
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
                    self.showErrorPage(req,res);
                }

            });
        }catch(e){
            customlog.error("Exception while Past due loans ajax call "+e);
            self.showErrorPage(req,res);
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
                                        res.render('futureDueLoans',{loanDetails : loanDetails,searchResult : searchResult, errorLabel : "No groups found" ,officeIdArray : officeIdArray,officeNameArray : officeNameArray,roleId : roleId, officeId : officeId,foIdArray : foIdArray,foNameArray : foNameArray, userId : userId,constantsObj:constantsObj, contextPath:props.contextPath});
                                    }
                                }
                                else {
                                    //var activityDetails = new Array(iklantPort, req.session.tenantId, req.session.userId, req.session.userName, req.originalUrl, req.connection.remoteAddress, "router.js", "futureDueLoans", "success", "futureDueLoans", "futureDueLoans");
                                    //self.commonRouter.insertActivityLogModel(activityDetails);
                                    var i=0;
                                    for(var item = 0; item<result.loanList.length; item++) {
                                        var LoanRepaymentForFO1 = require(domainPath +"/LoanRepaymentForFO");
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
                                        res.render('futureDueLoans',{loanDetails : loanDetails,searchResult : searchResult, errorLabel : "" ,officeIdArray : officeIdArray,officeNameArray : officeNameArray,roleId : roleId, officeId : officeId,foIdArray : foIdArray,foNameArray : foNameArray, userId : userId,constantsObj:constantsObj, contextPath:props.contextPath});
                                    }
                                }
                            } else {
                                self.showErrorPage(req,res);
                            }
                        });
                    });
                });
            }
        }catch(e){
            customlog.error("Exception While Future due loans "+e);
            self.showErrorPage(req,res);
        }
	},
	
	futureDueLoansDateAjaxCall :  function(req,res) {
		try {
            var self = this;
            var FutureLoansRequestHolderVar = require(domainPath +"/FutureLoansRequestHolder");
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
                            var LoanRepaymentForFO1 = require(domainPath +"/LoanRepaymentForFO");
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
                    self.showErrorPage(req,res);
                }
            });
        }catch(e){
            customlog.error("Exception while Future due loans Ajax Call "+e);
            self.showErrorPage(req,res);
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
                //customlog.info("Path" + options.path);
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
                        officeIdArray[officeIdArray.length] = -1;
                        officeNameArray[officeNameArray.length] = 'All';
                        rest.getJSON(options,function(statuscode,result,headers){
                            customlog.info(statuscode);
                            //customlog.info(result);
                            if(statuscode == 302){
                                res.redirect(props.contextPath+'/client/ci/logout');
                            }
                            else if(result.status == "success") {
                                if (result.overdueLoanList.length == 0){
                                    //var activityDetails = new Array(iklantPort, req.session.tenantId, req.session.userId, req.session.userName, req.originalUrl, req.connection.remoteAddress, "router.js", "dueLoansForManagerScreens", "success", "dueLoansForManagerScreens", "dueLoansForManagerScreens");
                                    //self.commonRouter.insertActivityLogModel(activityDetails);
                                    res.render('futureDueLoansAdmin',{overDueCountArray : overDueCountArray,loanDetails : loanDetails,searchResult : searchResult, errorLabel : "No groups found" ,officeIdArray : officeIdArray,officeNameArray : officeNameArray,roleId : roleId, officeId : officeId,foIdArray : foIdArray,foNameArray : foNameArray, userId : userId,constantsObj:constantsObj, contextPath:props.contextPath});
                                }
                                else {
                                    //var activityDetails = new Array(iklantPort, req.session.tenantId, req.session.userId, req.session.userName, req.originalUrl, req.connection.remoteAddress, "router.js", "dueLoansForManagerScreens", "success", "dueLoansForManagerScreens", "dueLoansForManagerScreens");
                                    //self.commonRouter.insertActivityLogModel(activityDetails);
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
                                    res.render('futureDueLoansAdmin',{overDueCountArray:overDueCountArray,dueCountArray:dueCountArray,futureDueFirstDayCountArray:futureDueFirstDayCountArray,
                                        futureDueSecondDayCountArray:futureDueSecondDayCountArray,futureDueThirdDayCountArray:futureDueThirdDayCountArray,
                                        futureDueForthDayCountArray:futureDueForthDayCountArray,futureDueFifthDayCountArray:futureDueFifthDayCountArray,
                                        totalOverDueCount:totalOverDueCount,totalDueCountArray:totalDueCountArray,totalFutureDueFirstDayCount:totalFutureDueFirstDayCount,
                                        totalFutureDueSecondDayCount:totalFutureDueSecondDayCount,totalFutureDueThirdDayCount:totalFutureDueThirdDayCount,
                                        totalFutureDueForthDayCount :totalFutureDueForthDayCount,totalFutureDueFifthDayCount :totalFutureDueFifthDayCount,
                                        searchResult : searchResult, errorLabel : "" ,officeIdArray : officeIdArray,officeNameArray : officeNameArray,
                                        roleId : roleId, officeId : officeId,foIdArray : foIdArray,foNameArray : foNameArray, userId : userId,constantsObj:constantsObj, contextPath:props.contextPath});
                                    }
                                } else {
                                    self.showErrorPage(req,res);
                                }
                            });
                        });
                    });
                }
        }catch(e){
            customlog.error("Exception While due loans for manager screen "+e);
            self.showErrorPage(req,res);
        }
	},
*/
	/*showErrorPage :  function(req,res){
		res.render('errorpage.jade',{contextPath:props.contextPath,error :"Page Expired.Please Contact System Administrator."});
	},*/
   /* showCustomErrorPage :  function(req,res,error){
        res.render('errorpage.jade',{contextPath:props.contextPath,error : error});
    },*/
	/*showPageExpired :  function(req,res){
		customlog.info("Inside Expired Page");
		res.render('pageExpired.jade');
	},*/

	/*//Login
	showLoginPage: function(req,res) {
		if(req.session.browser == "mobile") {
			res.render('Mobile/LoginMobile', { errorMessage: '', contextPath:props.contextPath});
		}
		else {
			res.render('login', { errorMessage: '', contextPath:props.contextPath, loginDiv:'', forgotPasswordDiv:'hideContent'});
		}
    },*/

	/*//Authentication
	authLoginPage: function(userName,password,callback) {
		this.model.authLoginModel(userName,password,callback);
	},
	*/
	/*showHomePage: function(req,res,resultObj,menuObj) {
        try{
            var self =  this;
            var constantsObj = this.constants;
            var roleIdsArray = new Array();
            if(resultObj == null || resultObj.length == 0 || resultObj[0].user_name == "" || menuObj.length == 0) {
                if(req.session.browser == "mobile") {
                    res.render('Mobile/LoginMobile', { errorMessage: 'Invalid UserName/Password', contextPath:props.contextPath});
                }
                else {
                    res.render('login', { errorMessage: 'Invalid UserName/Password', contextPath:props.contextPath});
                }
            }
            else {
                for(var i=0;i< resultObj.length;i++){
                    roleIdsArray[i]= resultObj[i].role_id;
                }
                if(resultObj[0].role_id == constantsObj.getDEOroleId()&&roleIdsArray.length==1){
                    req.session.tenantId = resultObj[0].tenant_id;
                    req.session.userId = resultObj[0].user_id;
                    req.session.officeId = resultObj[0].office_id;
                    req.session.roleId = resultObj[0].role_id;
                    req.session.roleIds = roleIdsArray;
                    req.session.userName = resultObj[0].user_name;
                    req.session.userContactNumber = resultObj[0].contact_number;
                    req.session.roleName = resultObj[0].role_name;
                    req.session.roleDescription = resultObj[0].role_description;
                    req.session.access_type_description = resultObj[0].access_type_description;
                    req.session.access_type_id = resultObj[0].access_type_id;
                    req.session.language = resultObj[0].doc_language;
                    req.session.menuId = menuObj[0].menu_id;
                    req.session.menuName = menuObj[0].menu_name;
                    req.session.menuImgLocation = menuObj[0].img_location;
                    req.session.menuUrl = menuObj[0].menu_url;
                    req.session.passwordChanged = resultObj[0].password_changed;
                    res.redirect(props.contextPath+'/client/ci/empty');
                }else{
                    var userName = req.body.userName;
                    var password = req.body.password;
                    var rest = require("./rest.js");
                    var roleArray = new Array();
                    var inpdata = JSON.stringify({
                      username : userName,
                      password : password});


                    var http = require('http');
                    var https = require('https');

                    var postheaders = {
                        'Content-Type' : 'application/json',
                        'Content-Length' : Buffer.byteLength(inpdata, 'utf8')
                    };

                    var options = {
                      host: mifosServiceIP,
                      port: mifosPort,
                      path: '/mfi/j_spring_security_check?j_username='+userName+'&j_password='+password+'&spring-security-redirect=/sam/auth.json',
                      method: 'POST',
                      headers : postheaders
                    };
                    var cookie = new Array();
                    rest.postJSON(options,inpdata,function(statuscode,result,headers) {
                        *//*[Added by Ramya Baskar(ramy1746)] [This is used to extract the JSESSIONID from the header]*//*

                        if(statuscode == 302) {
                            res.redirect(props.contextPath+'/client/ci/logout');
                        }
                        else if(result.status == "success"){
                            cookie = headers['set-cookie'];
                            var jsessionid = rest.get_cookies(cookie[0])['JSESSIONID'];
                            for(var j=0;j<result.grantedAuthority.length;j++){
                                roleArray[j] = result.grantedAuthority[j].role;
                            }
                            req.session.roleArray = roleArray;
                            req.session.mifosCookie = "JSESSIONID="+jsessionid;

                            *//*This is for IKLANT*//*

                            req.session.tenantId = resultObj[0].tenant_id;
                            req.session.userId = resultObj[0].user_id;
                            req.session.officeId = resultObj[0].office_id;
                            req.session.roleId = resultObj[0].role_id;
                            req.session.roleIds = roleIdsArray;
                            req.session.userName = resultObj[0].user_name;
                            req.session.userContactNumber = resultObj[0].contact_number;
                            req.session.roleName = resultObj[0].role_name;
                            req.session.roleDescription = resultObj[0].role_description;
                            req.session.access_type_description = resultObj[0].access_type_description;
                            req.session.access_type_id = resultObj[0].access_type_id;
                            req.session.mifosLoanOfficerId = result.activityDto.userId;
                            req.session.language = resultObj[0].doc_language;
                            var userName = req.session.userName;
                            var roleId = req.session.roleId;
                            var roleIds = req.session.roleIds;
                            req.session.menuId = menuObj[0].menu_id;
                            req.session.menuName = menuObj[0].menu_name;
                            req.session.menuImgLocation = menuObj[0].img_location;
                            req.session.menuUrl = menuObj[0].menu_url;
                            req.session.passwordChanged = resultObj[0].password_changed;
							req.session.emailId = esultObj[0].email_id;
                            customlog.info("userName : "+req.session.userName);
                            customlog.info("roleName : "+req.session.roleName);
                            customlog.info("roleIds : "+roleId);
                            customlog.info("Login Date and Time : "+ new Date());
                            if(req.session.fromAndroid == true){
                                self.retrieveLoanRecoveryPaymentDetails(req,res);
                            }else{
                                if(req.session.browser == "mobile") {
                                    res.render('Mobile/MenuMobile', {userName:userName, roleId:roleId, constantsObj:constantsObj, contextPath:props.contextPath});
                                }else{
                                    res.redirect(props.contextPath+'/client/ci/empty');
                                }
                            }
                        } else {
                            res.render('login', { errorMessage: result.errMessage, contextPath:props.contextPath});
                        }
                    });
                }
            }
        }catch(e){
            customlog.error("Exception while Show home page "+e);
            self.showErrorPage(req,res);
        }
	},*/
	/*retrieveLoanRecoveryPaymentDetails : function(req, res) {
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
                            *//*var ImageCaptureDto1 = require(domainPath +"/ImageCaptureDto");
                            var ImageCaptureDto = new ImageCaptureDto1();
                            this.ImageCaptureDto = ImageCaptureDto;
                            var ImageCaptureDto = this.ImageCaptureDto;
                            ImageCaptureDto.setPaymentCollectionId(result.paymentInfn[item].paymentCollectionId);
                            ImageCaptureDto.setGlobalAccountNum(result.paymentInfn[item].globalAccountNum);
                            ImageCaptureDto.setGroupId(result.paymentInfn[item].groupId);
                            ImageCaptureDto.setGroupName(result.paymentInfn[item].groupName);
                            ImageCaptureDto.setAmount(result.paymentInfn[item].amount);
                            paymentDetails[item] = ImageCaptureDto;*//*
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
                        self.showErrorPage(req,res);
                        }

                    });
        }catch(e){
            customlog.error("Exception while retrive loan recovery payment details "+e);
            self.showErrorPage(req,res);
        }
	},*/

	/*syncmifosgroupdetails : function(req, res) {
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
            self.showErrorPage(req,res);
        }
	},
*/
	/*authLoginService : function(req, res) {
		try{
            customlog.info("Inside Router authLogin");
            var self = this;
            var userName = req.body.userName;
            var password = req.body.password;
            var recvdData = req.body.abc;
            this.authLoginPage(userName,password,function(usersObj,roleObj){
                self.showHomePage(req,res,usersObj,roleObj);
              });
        }catch(e){
            customlog.error("Exception while Auth Login Service "+e);
            self.showErrorPage(req,res);
        }
	},

	//Menu
	showMenuPage: function(req,res) {
        var constantsObj = this.constants;
        var userName = req.session.userName;
        var userId = req.session.userId;
        var roleId = req.session.roleId;
        var roleIds = req.session.roleIds;
        var menuId = req.session.menuId;
        var menuName = req.session.menuName;
        var menuImgLocation = req.session.menuImgLocation;
        var menuUrl = req.session.menuUrl;
        var passwordChanged = req.session.passwordChanged;
        if(req.session.browser == "mobile") {
            res.render('Mobile/MenuMobile', {userName:userName, roleId:roleId, constantsObj:constantsObj, contextPath:props.contextPath});
        }
        else {
            if(passwordChanged == 0){
                res.render('changePassword',{contextPath:props.contextPath,userId:userId,userName:userName,errorMessage:"",passwordChanged:passwordChanged});
            }else{
                res.render('menu', {userName:userName, roleId:roleId, constantsObj:constantsObj,officeId:req.session.officeId, contextPath:props.contextPath,roleIds:roleIds,menuId:menuId,menuName:menuName,menuImgLocation:menuImgLocation,menuUrl:menuUrl});
            }
        }
    },

    showMenu: function(req,res) {
        var constantsObj = this.constants;
        var userName = req.session.userName;
        var roleId = req.session.roleId;
        var roleIds = req.session.roleIds;
        var menuId = req.session.menuId;
        if(req.session.browser == "mobile") {
            res.render('Mobile/MenuMobile', {userName:userName, roleId:roleId, constantsObj:constantsObj, contextPath:props.contextPath,roleIds:roleIds,menuId:menuId});
        }
        else {
            res.render('empty');
        }
    },

	getMenu: function(req, res) {
		try{
            customlog.info("Inside Router getMenu");
            var self = this;
            var tenantId = req.session.tenantId;
            var userId = req.session.userId;
            var menuId = req.session.menuId;
            if(typeof tenantId == 'undefined' || typeof userId == 'undefined') {
                res.redirect(props.contextPath+'/client/ci/login');
            }
            else {
                self.showMenuPage(req,res);
                }
        }catch(e){
            customlog.error("Exception while Get Menu "+e);
            self.showErrorPage(req,res);
        }
 	},
*/
	getBranchesPage: function(req,res,branchesIdArray,branchesArray,statusObj,officeObj,operationObj) {
		try{
            var self = this;
            req.session.branchesId = branchesIdArray;
            req.session.branches = branchesArray;
            req.session.statusIdArray = statusObj.getStatusIdArray();
            req.session.statusNameArray = statusObj.getStatusNameArray();
            req.session.officeName = officeObj.getOfficeName();
            req.session.operationName = operationObj.getOperationNameArray();
            req.session.operationId = operationObj.getOperationIdArray();
                //customlog.info("statusIdArray : "+req.session.statusIdArray);
                //customlog.info("statusNameArray : "+req.session.statusNameArray);
                //customlog.info("operationId : "+req.session.operationId);
                //customlog.info("operationName : "+req.session.operationName);
            if(typeof req.params.new != 'undefined'){
                res.redirect(props.contextPath+'/client/ci/groups/new');
                }
                else{
                    res.redirect(props.contextPath+'/client/ci/groups');
                }
        }
        catch(e){
            customlog.error("Exception while get Branches page "+e);
            self.showErrorPage(req,res);
        }
	},
	
	getBranches: function(req, res) {
		try{
            var self = this;
            var constantsObj = this.constants;
            var tenantId = req.session.tenantId;
            var userId = req.session.userId;
            if(typeof tenantId == 'undefined' || typeof userId == 'undefined') {
                res.redirect(props.contextPath+'/client/ci/login');
            }
            else {
                var officeId = req.session.officeId;
                if((req.session.roleIds).length > 1){
                    var roleId = req.session.roleIds;
                }
                else
                {
                    var roleId = req.session.roleId;
                }
                self.commonRouter.getBranchesCall(tenantId,userId,roleId,officeId,function(branchesIdArray,branchesArray,statusObj,officeObj,operationObj){
                    self.getBranchesPage(req,res,branchesIdArray,branchesArray,statusObj,officeObj,operationObj);
                  });
                }
        }catch(e){
            customlog.error("Exception while get branches "+e);
            self.showErrorPage(req,res);
        }
	},
	
	getFONamesCall: function(officeId,callback) {
		this.model.getFONamesModel(officeId,callback);
	},
	
	/*listGroupsOperation: function(req,res) {
		try{
            var self = this;
            var tenantId = req.session.tenantId;
            var userId = req.session.userId;
            var constantsObj = this.constants;
            var reqOfficeId = req.body.reqOfficeHidden;
            var menu = req.body.menuName;
            if(typeof tenantId == 'undefined' || typeof userId == 'undefined') {
                res.redirect(props.contextPath+'/client/ci/login');
            }
            else {
                var roleId = req.session.roleId;
                var officeId = req.session.officeId;
                if(typeof reqOfficeId == 'undefined'){
                    reqOfficeId = (roleId == constantsObj.getSMHroleId())?(typeof req.body.listoffice == 'undefined')?-1:req.body.listoffice:(req.session.officeId == constantsObj.getApexHeadOffice())?-1:req.session.officeId;
                }
                userId = (roleId == constantsObj.getSMHroleId())?-1:req.session.userId;
                var reinitiatedStatusDisplay = "";
                var requestedOperationId = req.params.operationId;
                if(requestedOperationId == constantsObj.getRejectedClientOperationId()){
                    self.commonRouter.listClientsCall(tenantId,userId,reqOfficeId,roleId,function(clientIdArray,clientNameArray,groupNameArray,centerNameArray ,lastCreditCheckDate){
                        self.commonRouter.showListClientsOperations(req, res,requestedOperationId,clientIdArray,clientNameArray,groupNameArray,centerNameArray,reinitiatedStatusDisplay, reqOfficeId, lastCreditCheckDate);
                    });
                }
                else{
                    self.commonRouter.ListGroupsCall(tenantId,userId,reqOfficeId,roleId,requestedOperationId,function(listGroupsIdArray,listGroupsArray,activeClients,neededInfo,isSynchronized,listGroupsGlobalNumberArray,fieldOfficerName,neededImageClarity,mifosCustomerId,isDataVerifiedArray,activeClientsPerStatus,dataEntryDate,error_msg_array,accountNumbers,loanCount){
                        self.commonRouter.showListGroupsOperations(req, res,requestedOperationId,listGroupsIdArray,listGroupsArray,activeClients,neededInfo,isSynchronized,listGroupsGlobalNumberArray,fieldOfficerName,neededImageClarity,mifosCustomerId,isDataVerifiedArray,"",reqOfficeId,"",activeClientsPerStatus,dataEntryDate,error_msg_array,menu,accountNumbers, loanCount);
                        });
                    }
                }
        }catch(e){
            customlog.error("Exception while list group operation "+e);
            self.showErrorPage(req,res);
        }
	},*/
	
	/*//List Groups for authorization according to branch - Jagan
	listGroupsAuthorization: function(req,res) {
		try{
            var self = this;
            var tenantId = req.session.tenantId;
            var userId = req.session.userId;
            if(typeof tenantId == 'undefined' || typeof userId == 'undefined') {
                res.redirect(props.contextPath+'/client/ci/login');
            }
            else {
                var officeId = req.params.officeId;
                var roleId = req.session.roleId;
                var requestedOperationId = req.params.operationId;
                this.commonRouter.ListGroupsCall(tenantId,userId,officeId,roleId,requestedOperationId,function(listGroupsIdArray,listGroupsArray,activeClients,neededInfo,isSynchronized,listGroupsGlobalNumberArray,fieldOfficerName,neededImageClarity){
                    self.commonRouter.showListGroupsOperations(req, res,requestedOperationId,listGroupsIdArray,listGroupsArray,activeClients,neededInfo,isSynchronized,listGroupsGlobalNumberArray,fieldOfficerName,neededImageClarity);
                    });
                }
        }catch(e){
            customlog.error("Exception while list Group Authorization "+e);
            self.commonRouter.showErrorPage(req,res);
        }
	},*/
	
	/*showGroupDetailsForAuthorization: function(req,res,branchId,groupId,prosGroupObj,preliminaryVerificationObj,unAppraisedClients,appraisedClientsObj,clientTotalWeightageRequired,capturedImageArray,docTypeIdArray,clientId,fileLocation,selectedDocTypeId,errorfield,grtRating) {
		res.render('GroupAuthorization', { branchId : branchId,groupId:groupId, prosGroupObj:prosGroupObj, preliminaryVerificationObj:preliminaryVerificationObj,
										appraisedClientsObj:appraisedClientsObj,clientTotalWeightageRequired:clientTotalWeightageRequired,capturedImageArray:capturedImageArray,docTypeIdArray:docTypeIdArray, clientId:clientId,fileLocation:fileLocation, selectedDocTypeId:selectedDocTypeId, errorfield : errorfield, grtRating: grtRating, contextPath:props.contextPath});
	},*/
	
	/*groupDetailsAuthorizationCall: function(tenantId,branchId,groupId,clientId,callback) {
		this.model.groupDetailsAuthorizationModel(tenantId,branchId,groupId,clientId,callback);
	},*/

	/*groupDetailsAuthorization: function(req,res) {
		try{
            var self = this;
            var tenantId = req.session.tenantId;
            var userId = req.session.userId;
            if(typeof tenantId == 'undefined' || typeof userId == 'undefined') {
                res.redirect(props.contextPath+'/client/ci/login');
            }
            else {
                //var activityDetails = new Array(iklantPort, req.session.tenantId, req.session.userId, req.session.userName, req.originalUrl, req.connection.remoteAddress, "router.js", "groupDetailsAuthorization", "success", "groupDetailsAuthorization", "groupDetailsAuthorization");
                //self.commonRouter.insertActivityLogModel(activityDetails);
                var officeId = req.session.officeId;
                var roleId = req.session.roleId;
                var groupId = req.params.groupId;
                var branchId = req.params.branchId;
                var errorfield = "";
                var clientTotalWeightageRequired = req.body.clientTotalWeightageRequiredHiddenCCA1Name;
                this.commonRouter.groupDetailsAuthorizationCall(tenantId,branchId,groupId,0,function(prosGroupObj,preliminaryVerificationObj,capturedImageArray,docTypeIdArray){
                    self.commonRouter.groupAuthorizationClientCalculationCall(tenantId,groupId,function(groupId,unAppraisedClients,appraisedClientsObj,countOfRejectedClients,grtRating){
                        self.commonRouter.showGroupDetailsForAuthorization(req,res,branchId,groupId,prosGroupObj,preliminaryVerificationObj,unAppraisedClients,appraisedClientsObj,clientTotalWeightageRequired,capturedImageArray,docTypeIdArray,'','','',errorfield,grtRating);
                        });
                    });
                  }
        }catch(e){
            customlog.error("Exception while group details authorization "+e);
            self.commonRouter.showErrorPage(req,res);
        }
	},*/
	
	//Reinitiate Group
	/*reinitiateGroupCall: function(groupId,remarks,callback) {
		this.model.reinitiateGroupModel(groupId,remarks,callback);
	},*/
	
	showRejectedGroups:	function(req, res,listGroupsIdArray,listGroupsArray,reinitiatedStatusDisplay,activeClients,listGroupsGlobalNumberArray) {
        try{
          var self = this;
          operationNameArray = req.session.operationName;
          operationIdArray = req.session.operationId;
          var roleId = req.session.roleId;
          var userName = req.session.userName;
          var errorMessage = "";
            //var activityDetails = new Array(iklantPort, req.session.tenantId, req.session.userId, req.session.userName, req.originalUrl, req.connection.remoteAddress, "router.js", "showRejectedGroups", "success", "Rejected Groups", "showRejectedGroups");
            //self.commonRouter.insertActivityLogModel(activityDetails);
          if(listGroupsIdArray.length !=0) {
            errorMessage = "";
          }
          else {
            errorMessage = "No groups to Display";
          }
            res.render( 'RejectedGroups', {errorMessage:errorMessage, groupsName:listGroupsArray , groupsId:listGroupsIdArray, operationNameArray:operationNameArray, operationIdArray:operationIdArray,roleId:roleId, reinitiatedStatusDisplay:"Group is Reinitiated and "+reinitiatedStatusDisplay, activeClients:activeClients,userName:userName, listGroupsGlobalNumberArray : listGroupsGlobalNumberArray, contextPath:props.contextPath});
        }catch(e){
            customlog.error("Exception while list rejected groups "+e)
        }
	},
	/*updateClientStatusCall : function(clientIdListArray,clientIds,overdues,callback){
		this.model.updateClientStatusModel(clientIdListArray,clientIds,overdues,callback);
	},*/
	/*reinitiateGroup: function(req,res) {
        try{
            var self = this;
            var constantsObj = this.constants;
            var tenantId = req.session.tenantId;
            var userId = req.session.userId;
            var officeId = req.session.officeId;
            var roleId = req.session.roleId;
            var groupId = req.params.groupId;
            var reinitiatedStatusDisplay;
            var remarks = req.body.remarks;
            var clientIds =new Array();
            clientIds=(req.body.clientNames).split(",");
            var overdues=new Array();
            overdues=(req.body.overdues).split(",");
            var clientIdListArray = new Array();
            clientIdListArray = (req.body.clientIdList).split(",");
            self.updateClientStatusCall(clientIdListArray,clientIds,overdues,function(){
                self.reinitiateGroupCall(groupId,remarks,function(reinitiatedStatus){
                    reinitiatedStatusDisplay = reinitiatedStatus;
                    var activityDetails = new Array(iklantPort, req.session.tenantId, req.session.userId, req.session.userName, req.originalUrl, req.connection.remoteAddress, "router.js", "reinitiateGroup", "success", "reinitiateGroup","Group ID "+ groupId +" Reinitiated Successfully and "+reinitiatedStatusDisplay ,"insert");
                    self.commonRouter.insertActivityLogModel(activityDetails);
                    self.commonRouter.ListGroupsCall(tenantId,userId,officeId,roleId,constantsObj.getRejectedGroupsOperationId(),function(listGroupsIdArray,listGroupsArray,activeClients,neededInfo,isSynchronized,listGroupsGlobalNumberArray,fieldOfficerName){
                        //self.showRejectedGroups(req, res,listGroupsIdArray,listGroupsArray,reinitiatedStatusDisplay,activeClients,listGroupsGlobalNumberArray);
                        self.commonRouter.showListGroupsOperations(req, res,constantsObj.getRejectedGroupsOperationId(),listGroupsIdArray,listGroupsArray,activeClients,neededInfo,isSynchronized,listGroupsGlobalNumberArray,fieldOfficerName,0,needeed image clarity,0,mifos customer id,0,isDataVerifiedArray,reinitiatedStatusDisplay);
                        });
                    });
                });
        }catch(e){
            customlog.error("Exception While Reinitiate Group "+e);
            self.showErrorPage(req,res);
        }
	},*/

	/*listQuestionsCCACall: function(tenantId,clientId,clientLoanCount,callback) {
		this.model.listQuestionsCCACallModel(tenantId,clientId,clientLoanCount,callback);
	},*/

	/*//Adarsh-Modified
	showCCAQuestions: function(req, res,groupId,selectedOfficeId,redirectValue,clientId,clientName,centerName,clientRatingPerc,clientTotalWeightage,clientTotalWeightageRequired,questionsObj,choicesanswerObj,choicesObj,capturedImageArray,docTypeIdArray,errorfield,clientLoanCount,statusId) {
		var constantsObj = this.constants;
		res.render('cca2', {groupId:groupId,selectedOfficeId:selectedOfficeId,clientId:clientId,
		redirectValue:redirectValue,clientName:clientName,centerName:centerName,
		clientRatingPerc:clientRatingPerc,clientTotalWeightage:clientTotalWeightage,
		clientTotalWeightageRequired:clientTotalWeightageRequired,questionsObj: questionsObj,
		choicesanswerObj: choicesanswerObj,choicesObj:choicesObj,capturedImageArray:capturedImageArray,clientLoanCount:clientLoanCount,
		docTypeIdArray:docTypeIdArray,errorfield:errorfield,constantsObj:constantsObj, contextPath:props.contextPath,statusId:statusId});
	},*/
	
	/*listQuestionsCCA: function(req,res) {
		try{
            var self = this;
            var tenantId = req.session.tenantId;
            var userId = req.session.userId;
            if(typeof tenantId == 'undefined' || typeof userId == 'undefined') {
                res.redirect(props.contextPath+'/client/ci/login');
            }
            else {
                //var activityDetails = new Array(iklantPort, req.session.tenantId, req.session.userId, req.session.userName, req.originalUrl, req.connection.remoteAddress, "router.js", "listQuestionsCCA", "success", "listQuestionsCCA", "listQuestionsCCA");
                //self.commonRouter.insertActivityLogModel(activityDetails);
                var officeId = req.session.officeId;
                var roleId = req.session.roleId;
                var clientId = req.params.clientId;
                var groupId = req.params.groupId;
                var statusId = req.params.statusId;
                var redirectValue = req.params.redirectValue;//Adarsh-Modified
                var selectedOfficeId = req.body.brchid;//Adarsh-Modified
                var centerName = req.body.centerName;//Adarsh-Modified
                var clientRatingPerc = req.body.clientRatingPercHidden;//Adarsh-Modified
                var clientTotalWeightage = req.body.clientTotalWeightageHidden;//Adarsh-Modified
                var clientTotalWeightageRequired = req.body.clientTotalWeightageRequiredHiddenCCA1Name;//Adarsh-Modified
                var errorfield = "";//Adarsh-Modified
                var clientLoanCount = req.body['clientLoanCount_'+clientId];
                    customlog.info("clientRatingPerc "+clientRatingPerc);
                    customlog.info("clientTotalWeightageRequired "+clientTotalWeightageRequired);
                    //customlog.info("selectedOfficeId = "+selectedOfficeId);
                if(typeof clientLoanCount == 'undefined'){
                    clientLoanCount = req.params.loanCount;
                }
                this.listQuestionsCCACall(tenantId,clientId,clientLoanCount,function(clientName,questionsObj,choicesanswerObj,choicesObj,capturedImageArray,docTypeIdArray){
                    self.showCCAQuestions(req,res,groupId,selectedOfficeId,redirectValue,clientId,clientName,centerName,clientRatingPerc,clientTotalWeightage,clientTotalWeightageRequired,questionsObj,choicesanswerObj,choicesObj,capturedImageArray,docTypeIdArray,errorfield,clientLoanCount, statusId);
                });
            }
        }catch(e){
            customlog.error("Exception while List question CCA "+e);
            self.showErrorPage(req,res);
        }
	},*/

	/*addQuestionsCall: function(tenantId,callback) {
		this.model.addQuestionsModel(tenantId,callback);
	},*/
	
	/*showAddQuestions: function(req,res,selectedQuestionId,questionId,questionsNonDefault,questionsObj) {
		res.render('AddQuestions', {selectedQuestionId: selectedQuestionId ,QuestionsId : questionId, QuestionsNDNames : questionsNonDefault,questionsObj:questionsObj, contextPath:props.contextPath});
    },*/
	
	/*addQuestions: function(req, res) {
		try{
            var self = this;
            var tenantId = req.session.tenantId;
            var userId = req.session.userId;
            var officeId = req.session.officeId;
            var roleId = req.session.roleId;
            var constantsObj = this.constants;
            var selectedQuestionId = 0;
            var questionsObj = this.questions;
            questionsObj.clearAll();

            if(typeof tenantId == 'undefined' || typeof userId == 'undefined') {
                res.redirect(props.contextPath+'/client/ci/login');
            }
            else {
                self.addQuestionsCall(tenantId,function(questionId,questionsNonDefault){
                    var activityDetails = new Array(iklantPort, req.session.tenantId, req.session.userId, req.session.userName, req.originalUrl, req.connection.remoteAddress, "router.js", "addQuestions", "success", "addQuestions", "Questions Added Successfully","insert");
                    self.commonRouter.insertActivityLogModel(activityDetails);
                    self.showAddQuestions(req,res,selectedQuestionId,questionId,questionsNonDefault,questionsObj);
                });
            }
        }catch(e){
            customlog.error("Exception while Add Questions "+e);
            self.commonRouter.showErrorPage(req,res);
        }
	},*/
	
	/*questionsSelectCall: function(tenantId,selectedQuestionId,callback) {
		this.model.questionsSelectModel(tenantId,selectedQuestionId,callback);
	},*/
	
	
	/*questionsSelect :function(req, res) {
	    try{
            var self = this;
            var tenantId = req.session.tenantId;
            var userId = req.session.userId;
            var officeId = req.session.officeId;
            var roleId = req.session.roleId;
            var constantsObj = this.constants;

            var selectedQuestionId = req.body.questionsEditName;
            customlog.info("QNAme== "+selectedQuestionId);

            if(typeof tenantId == 'undefined' || typeof userId == 'undefined') {
                res.redirect(props.contextPath+'/client/ci/login');
            }
            else {
                self.questionsSelectCall(tenantId,selectedQuestionId,function(questionsObj){
                    self.addQuestionsCall(tenantId,function(questionId,questionsNonDefault){
                        self.showAddQuestions(req,res,selectedQuestionId,questionId,questionsNonDefault,questionsObj);
                    });
                });
            }
        }catch(e){
            customlog.error("Exception While Question select Call "+e);
            self.commonRouter.showErrorPage(req,res);
        }
	},*/
	
	/*saveQuestionCall: function(tenantId,submitId,callback) {
		this.model.saveQuestionModel(tenantId,submitId,callback);
	},*/
	
	/*saveQuestion: function(req, res) {
		try{
            var self = this;
            var tenantId = req.session.tenantId;
            var userId = req.session.userId;
            var officeId = req.session.officeId;
            var roleId = req.session.roleId;
            var constantsObj = this.constants;
            if(typeof tenantId == 'undefined' || typeof userId == 'undefined') {
                res.redirect(props.contextPath+'/client/ci/login');
            }
            else {
                var submitId = req.params.id;
                customlog.info("SubmitID=  "+submitId);
                var choiceArray = new Array();
                var marksArray = new Array();
                var questionsObj = this.questions;
                var choiceObj = this.choices;

                //for edit
                questionsObj.clearAll();
                questionsObj.setQuestionIDEdit(req.body.questionsEditName);
                questionsObj.setQuestionEdit(req.body.questionName);
                questionsObj.setDisplayEdit(req.body.displaytextName);
                questionsObj.setWeightageEdit(req.body.weightageName);
                questionsObj.setChoice_ID(req.body.choiceNameHidden);
                questionsObj.setAnswersEdit(req.body.questionNameHidden);
                questionsObj.setMarksEdit(req.body.marksNameHidden);

                questionsObj.setQuestion(req.body.question);
                questionsObj.setDisplaytext(req.body.displaytext);
                questionsObj.setWeightage(req.body.weightage);
                customlog.info("question  "+ questionsObj.getQuestion());
                var choice = req.body.answerArray;
                var mark = req.body.marksArray
                var selectedQuestionId = 0;
                choiceArray = choice.split(",");
                marksArray = mark.split(",");;
                choiceObj.setChoice(choiceArray);
                choiceObj.setMarks(marksArray);
                customlog.info("choiceArray====="+choiceArray);
                customlog.info("choiceArray====="+marksArray);
                var self = this;
                self.saveQuestionCall(tenantId,submitId,function(){
                    self.addQuestionsCall(tenantId,function(questionId,questionsNonDefault){
                        var activityDetails = new Array(iklantPort, req.session.tenantId, req.session.userId, req.session.userName, req.originalUrl, req.connection.remoteAddress, "router.js", "saveQuestion", "success", "Save Question", "Question Saved successfully","insert");
                        self.commonRouter.insertActivityLogModel(activityDetails);
                        res.redirect(props.contextPath+'/client/ci/menu');
                    });
                });
            }
        }catch(e){
            customlog.error("Exception while Save questions "+e);
            self.showErrorPage(req,res);
        }
	},*/

	/*calculateSecondaryAppraisalCall: function(tenantId,clientId,secondaryQuestionIdRouter,selectedAnswerArray,callback) {
		this.model.calculateSecondaryAppraisalModel(tenantId,clientId,secondaryQuestionIdRouter,selectedAnswerArray,callback);
	},*/

	/*calculateSecondaryAppraisal: function(req, res) {
		try{
            var self = this;
            var tenantId = req.session.tenantId;
            var userId = req.session.userId;
            var officeId = req.session.officeId;
            var roleId = req.session.roleId;
            var branchId = req.body.selectedOfficeIdName;
            customlog.info("branchId "+branchId);
            var constantsObj = this.constants;
            if(typeof tenantId == 'undefined' || typeof userId == 'undefined') {
                res.redirect(props.contextPath+'/client/ci/login');
            }
            else {
                //var activityDetails = new Array(iklantPort, req.session.tenantId, req.session.userId, req.session.userName, req.originalUrl, req.connection.remoteAddress, "router.js", "calculateSecondaryAppraisal", "success", "calculateSecondaryAppraisal", "calculateSecondaryAppraisal");
                //self.commonRouter.insertActivityLogModel(activityDetails);
                var clientId = req.params.clientId;
                var noOfQuestions = req.params.noOfQuestions;
                var selectedAnswerArray = new Array();
                var secondaryQuestionIdRouter = new Array();
                var redirectValue = req.body.redirectValueName;//Adarsh-Modified
                customlog.info("redirectValueSec "+redirectValue);
                selectedAnswerArray = req.body.secondaryChoices.i;
                secondaryQuestionIdRouter = req.body.SecondaryQuestionId.i;
                self.calculateSecondaryAppraisalCall(tenantId,clientId,secondaryQuestionIdRouter,selectedAnswerArray,function(groupId,secondaryRating,clientTotalWeightageRequired){
                customlog.info("secondaryRating : "+secondaryRating);
                customlog.info("clientTotalWeightageRequired : "+clientTotalWeightageRequired);
                var errorfield = "";
                var fileLocation = "";
                    if(redirectValue==0){
                        self.commonRouter.ccaCall1(tenantId,groupId,function(groupId,unAppraisedClients,appraisedClientsObj,countOfRejectedClients){
                        self.commonRouter.showCcaSummary(res,groupId,unAppraisedClients,appraisedClientsObj,countOfRejectedClients,clientTotalWeightageRequired,errorfield,clientId,fileLocation,"");
                        });
                    }
                    else{
                        self.commonRouter.groupDetailsAuthorizationCall(tenantId,branchId,groupId,0,function(prosGroupObj,preliminaryVerificationObj,capturedImageArray,docTypeIdArray){
                        self.commonRouter.groupAuthorizationClientCalculationCall(tenantId,groupId,function(groupId,unAppraisedClients,appraisedClientsObj,countOfRejectedClients,grtRating){
                        self.commonRouter.showGroupDetailsForAuthorization(req,res,branchId,groupId,prosGroupObj,preliminaryVerificationObj,unAppraisedClients,appraisedClientsObj,clientTotalWeightageRequired,capturedImageArray,docTypeIdArray,'','','',errorfield,grtRating);
                      });
                      });
                    }
                });
            }
        }catch(e){
            customlog.error("Exception while calculate secondary appraisal "+e);
            self.commonRouter.showErrorPage(req,res);
        }
	},*/
	
	/*skipKycUploadCall: function(groupId,callback) {
		this.model.skipKycUploadModel(groupId,callback);
	},*/
	
	/*skipKycUpload: function(req, res) {
		try{
            var self = this;
            var tenantId = req.session.tenantId;
            var userId = req.session.userId;
            var officeId = req.session.officeId;
            var roleId = req.session.roleId;
            var constantsObj = this.constants;
            if(typeof tenantId == 'undefined' || typeof userId == 'undefined') {
                res.redirect(props.contextPath+'/client/ci/login');
            }
            else {
                var self = this;
                var groupId = req.params.group_id;
                self.skipKycUploadCall(groupId,function(){
                    self.commonRouter.ListGroupsCall(tenantId,userId,officeId,roleId,constantsObj.getKYCUploadingOperationId(),function(listGroupsIdArray,listGroupsArray,activeClients,neededInfo,isSynchronized,listGroupsGlobalNumberArray,fieldOfficerName,neededImageClarity){
                    self.commonRouter.showListGroupsOperations(req, res,constantsObj.getKYCUploadingOperationId(),listGroupsIdArray,listGroupsArray,activeClients,neededInfo,isSynchronized,listGroupsGlobalNumberArray,fieldOfficerName,neededImageClarity);
                    });
                });
                }
        }catch(e){
            customlog.error("Exception while skip kyc upload "+e);
            self.commonRouter.showErrorPage(req,res);
        }
	},*/
	
	//Baskar

	/*clientListCallForRejectedGroups: function(groupId,callback) {
		this.model.getClientNamesModelForRejectedGroups(groupId,callback);
	},*/
	
	/*listClientsForRejectedGroups : function(res,groupId,thisclientId,groupNameForRejectedGroups,clientNameArray,clientIdArray,rejectedStage,centername,active_clients) {
		try{
            var constantsObj = this.constants;
      		res.render('rejectedGroupForm', {groupId:groupId, thisclientId:thisclientId, 
								groupNameForRejectedGroups:groupNameForRejectedGroups, clientNameArray:clientNameArray, 
								clientIdArray:clientIdArray, rejectedStage:rejectedStage, centername:centername, 
								active_clients:active_clients, constantsObj:constantsObj, contextPath:props.contextPath});
        }catch(e){
            customlog.error("Exception while list clients for rejected groups "+e);
            self.showErrorPage(req,res);
        }
    },*/
	
	/*retrieveClientsForRejectedGroups : function(req, res) {
		try{
            var groupId = req.params.id;
            var self = this;
            var tenantId = req.session.tenantId;
            var userId = req.session.userId;
            if(typeof tenantId == 'undefined' || typeof userId == 'undefined' || typeof req.session.operationId == 'undefined') {
                res.redirect(props.contextPath+'/client/ci/login');
            }
            else {
                //var activityDetails = new Array(iklantPort, req.session.tenantId, req.session.userId, req.session.userName, req.originalUrl, req.connection.remoteAddress, "router.js", "retrieveClientsForRejectedGroups", "success", "retrieveClientsForRejectedGroups", "retrieveClientsForRejectedGroups");
                //self.commonRouter.insertActivityLogModel(activityDetails);
                self.clientListCallForRejectedGroups(groupId,function(thisclientId,groupNameForRejectedGroups,clientNameArray,clientIdArray,rejectedStage,centername,active_clients){
                    self.listClientsForRejectedGroups(res,groupId,thisclientId,groupNameForRejectedGroups,clientNameArray,clientIdArray,rejectedStage,centername,active_clients);
                });
            }
        }catch(e){
            customlog.error("Exception While retrive client for rejected group "+e);
            self.showErrorPage(req,res);
        }
	},	
*/

	/*rejectedClientDetails : function(req, res) {
		try{
            var self = this;
            var clientId = req.params.id;
            var tenantId = req.session.tenantId;
            var userId = req.session.userId;
            var officeId = (typeof req.body.listoffice == 'undefined')?req.session.officeId:req.body.listoffice;
            customlog.info("Inside router rejectedClientDetails");
            if(typeof tenantId == 'undefined' || typeof userId == 'undefined' || typeof req.session.operationId == 'undefined') {
                res.redirect(props.contextPath+'/client/ci/login');
            }
            else {
                //var activityDetails = new Array(iklantPort, req.session.tenantId, req.session.userId, req.session.userName, req.originalUrl, req.connection.remoteAddress, "router.js", "rejectedClientDetails", "success", "rejectedClientDetails", "rejectedClientDetails");
                //self.commonRouter.insertActivityLogModel(activityDetails);
                self.commonRouter.rejectedClientDetailsCall(tenantId,clientId,function(groupId,clientId,client_global_number,client_name,client_status_desc,client_status_id,group_status_id,group_name,center_name, remarks, remarksForRejection){
                    self.commonRouter.retrieveDocTypeList(tenantId,function(docTypeIdArray,docTypeNameArray){
                        self.commonRouter.showRejectedClientDetails(req,res,groupId,clientId,client_global_number,client_name,client_status_desc,client_status_id,group_status_id,group_name,center_name,docTypeIdArray,docTypeNameArray, officeId, '', remarks, remarksForRejection);
                    });
                });
            }
        }catch(e){
            customlog.error("Exception while rejected client details "+e);
            self.showErrorPage(req,res);
        }
		
	},*/

	/*reintiateClientCall : function(tenantId,clientId,remarksForReintiate,groupStatusID,clientStatus, groupId, roleId, callback){
		this.model.reintiateClientModel(tenantId,clientId,remarksForReintiate,groupStatusID,clientStatus, groupId, roleId, callback);
	},*/

	/*reintiateClient : function(req, res) {
		try{
            var self = this;
            var constantsObj = this.constants;
            var tenantId = req.session.tenantId;
            var userId = req.session.userId;
            var officeId = (typeof req.body.reqOfficeHidden == 'undefined')?req.session.officeId:req.body.reqOfficeHidden;
            var roleId = req.session.roleId;
            var clientId = req.body.clientid;
            var remarksForReintiate =  req.body.remarks;
            var groupStatusID =  req.body.groupstatus;
            var clientStatus = req.body.clientstatus;
            var groupId = req.body.groupId;
            var requestedOperationId = constantsObj.getRejectedClientOperationId();
            customlog.info("Inside reintiateClient");
            if(typeof tenantId == 'undefined' || typeof userId == 'undefined' || typeof req.session.operationId == 'undefined') {
                res.redirect(props.contextPath+'/client/ci/login');
            }
            else {
                self.reintiateClientCall(tenantId,clientId,remarksForReintiate,groupStatusID,clientStatus, groupId, roleId, function(reinitiatedStatusDisplay){
                    self.commonRouter.listClientsCall(tenantId,userId,officeId,roleId,function(clientIdArray,clientNameArray,groupNameArray,centerNameArray,lastCreditCheckDate){
                        var activityDetails = new Array(iklantPort, req.session.tenantId, req.session.userId, req.session.userName, req.originalUrl, req.connection.remoteAddress, "router.js", "reintiateClient", "success", "Rejected Client", "ClientId "+clientId+" Reintiated successfully ","update");
                        self.commonRouter.insertActivityLogModel(activityDetails);
                        self.commonRouter.showListClientsOperations(req, res,requestedOperationId,clientIdArray,clientNameArray,groupNameArray,centerNameArray,reinitiatedStatusDisplay, officeId,lastCreditCheckDate);
                    });
                });
                }
        }catch(e){
            customlog.error("Exception While reinitiate client "+e);
            self.showErrorPage(req,res);
        }
    },*/

	/*retrieveClientList : function(req, res) {
		try{
            var groupId = req.params.id;
            var self = this;
            var tenantId = req.session.tenantId;
            var userId = req.session.userId;
            var errorfield = "";
            if(typeof tenantId == 'undefined' || typeof userId == 'undefined' || typeof req.session.operationId == 'undefined') {
                res.redirect(props.contextPath+'/client/ci/login');
            }
            else {
                //var activityDetails = new Array(iklantPort, req.session.tenantId, req.session.userId, req.session.userName, req.originalUrl, req.connection.remoteAddress, "router.js", "retrieveClientList", "success", "retrieveClientList", "retrieveClientList");
                //self.commonRouter.insertActivityLogModel(activityDetails);
                self.commonRouter.clientListCall(groupId,function(thisclientId,clientNameArray,groupName,clientIdArray,prospectClientPersonalObj,prospectClientGuarantorObj,prospectClientHouseDetailObj,prospectClientBankDetailObj,loanCounter){
                if(clientIdArray.length > 0){
                    self.commonRouter.lookUpEntityCall(function(lookupEntityObj){
                        self.commonRouter.retrieveDocTypeList(tenantId,function(docTypeIdArray,docTypeNameArray){
                            self.commonRouter.listClients(req,res,thisclientId,clientNameArray,groupName,clientIdArray,prospectClientPersonalObj,prospectClientGuarantorObj,prospectClientHouseDetailObj,prospectClientBankDetailObj,lookupEntityObj,docTypeIdArray,docTypeNameArray,errorfield,"","",loanCounter);
                        });
                    });
                }
                else{
                    self.commonRouter.listGroups(req,res);
                }
                });
            }
        }catch(e){
            customlog.error("Exception while retrive client list "+e);
            self.showErrorPage(req,res);
        }
	},*/

	/*retrieveFieldVerificationDetailsCall : function(clientId,callback) {
		this.model.getFieldVerificationDetailsModel(clientId,callback);
	},*/

	/*showFieldVerificationDetails : function(req,res,thisclientId,client_name,clientNameArray,groupName,clientIdArray,prospectClientPersonalObj,prospectClientGuarantorObj,prospectClientHouseDetailObj,prospectClientBankDetailObj,lookupEntityObj,docTypeIdArray,docTypeNameArray,errorfield,fileLocation,docId,loanCounter) {
        try{
            var self = this;

            //var activityDetails = new Array(iklantPort, req.session.tenantId, req.session.userId, req.session.userName, req.originalUrl, req.connection.remoteAddress, "router.js", "showFieldVerificationDetails", "success", "Field Verification", "showFieldVerificationDetails");
            //self.commonRouter.insertActivityLogModel(activityDetails);
            if(req.session.browser == "mobile") {
                res.render('Mobile/fieldVerificationFormMobile', { thisclientId: thisclientId, thisclient_name:client_name, clientNameArray : clientNameArray, groupName : groupName , clientIdArray : clientIdArray, prospectClientPersonalObj : prospectClientPersonalObj, prospectClientGuarantorObj : prospectClientGuarantorObj, prospectClientHouseDetailObj : prospectClientHouseDetailObj, prospectClientBankDetailObj : prospectClientBankDetailObj, lookupEntityObj : lookupEntityObj,docTypeIdArray:docTypeIdArray,docTypeNameArray:docTypeNameArray,errorfield:errorfield,fileLocation:fileLocation,docId:docId, contextPath:props.contextPath,loanCounter:loanCounter});
            }
            else {
                res.render('fieldverificationform', { thisclientId: thisclientId, thisclient_name:client_name, clientNameArray : clientNameArray, groupName : groupName , clientIdArray : clientIdArray, prospectClientPersonalObj : prospectClientPersonalObj, prospectClientGuarantorObj : prospectClientGuarantorObj, prospectClientHouseDetailObj : prospectClientHouseDetailObj, prospectClientBankDetailObj : prospectClientBankDetailObj, lookupEntityObj : lookupEntityObj,docTypeIdArray:docTypeIdArray,docTypeNameArray:docTypeNameArray,errorfield:errorfield,fileLocation:fileLocation,docId:docId, contextPath:props.contextPath,loanCounter:loanCounter});
            }
        }catch(e){
            customlog.error("Exception while show field verification details "+e);
            self.showErrorPage(req,res);
        }
    },*/
	
	/*retrieveFieldVerificationDetails : function(req, res) {
		try{
            customlog.info("INSIDE RETRIEVE FIELD VERIFICATION DETAILS");
            var self = this;
            var clientId = req.params.id;
            var errorfield = "";
            var tenantId = req.session.tenantId;
            //var activityDetails = new Array(iklantPort, req.session.tenantId, req.session.userId, req.session.userName, req.originalUrl, req.connection.remoteAddress, "router.js", "retrieveFieldVerificationDetails", "success", "retrieveFieldVerificationDetails", "retrieveFieldVerificationDetails");
            //self.commonRouter.insertActivityLogModel(activityDetails);
            self.commonRouter.retrieveFieldVerificationDetailsCall(clientId,function(thisclientId,client_name,clientNameArray,groupName,clientIdArray,prospectClientPersonalObj,prospectClientGuarantorObj,prospectClientHouseDetailObj,prospectClientBankDetailObj,loanCounter){
                self.commonRouter.lookUpEntityCall(function(lookupEntityObj){
                    self.commonRouter.retrieveDocTypeList(tenantId,function(docTypeIdArray,docTypeNameArray){
                    self.commonRouter.showFieldVerificationDetails(req,res,thisclientId,client_name,clientNameArray,groupName,clientIdArray,prospectClientPersonalObj,prospectClientGuarantorObj,prospectClientHouseDetailObj,prospectClientBankDetailObj,lookupEntityObj,docTypeIdArray,docTypeNameArray,errorfield,"","",loanCounter);
                });
                });
            });
        }catch(e){
            customlog.error("Exception while retrive field verification details "+e);
            self.showErrorPage(req,res);
        }
	},*/

	/*needClarificationDetails : function(req,res) {
		try{
            var clientArray = new Array();
            var clientArray = req.body.cl;
            //var clientId = clientArray[clientArray.length-1];
            var clientId = req.body.cl;
            var remarks = req.body.remarks;
            var errorfield = "";
            var self = this;
            var tenantId = req.session.tenantId;
            var userId = req.session.userId;
            if(typeof tenantId == 'undefined' || typeof userId == 'undefined' || typeof req.session.operationId == 'undefined') {
                res.redirect(props.contextPath+'/client/ci/login');
            }
            else {
            self.commonRouter.needClarificationDetailsCall(clientId,remarks,function(groupid){
                self.commonRouter.retrieveClientListAfter(groupid,function(thisclientId,clientNameArray,groupName,clientIdArray,prospectClientPersonalObj,prospectClientGuarantorObj,prospectClientHouseDetailObj,prospectClientBankDetailObj,loanCounter){
                    if(clientIdArray.length > 0){
                    self.commonRouter.lookUpEntityCall(function(lookupEntityObj){
                        self.commonRouter.retrieveDocTypeList(tenantId,function(docTypeIdArray,docTypeNameArray){
                        self.commonRouter.listClients(req,res,thisclientId,clientNameArray,groupName,clientIdArray,prospectClientPersonalObj,prospectClientGuarantorObj,prospectClientHouseDetailObj,prospectClientBankDetailObj,lookupEntityObj,docTypeIdArray,docTypeNameArray,errorfield,"","",loanCounter);
                    });
                    });
                    }
                    else{
                        self.commonRouter.listGroups(req,res);
                    }
                });
            });
            }
        }catch(e){
            customlog.error("Exception while Need clarification details "+e);
            self.showErrorPage(req,res);
        }
	},
*/

	//Android
	authenticationCall: function(userName,password ,callback) {
		this.model.authenticationModel(userName,password ,callback);
	},

    getOfficeAddress: function(officeId,callback) {
		// read the office address and map them to their coordinates
		console.log("inside getOfficeAddress method");
        var geocoderProvider = 'google';
        var httpAdapter = 'http';
		var geocoder = require('node-geocoder').getGeocoder(geocoderProvider, httpAdapter);
        geocoder.geocode({address: 'No:51/22 Ganesapuram,1st Street,Thoraiyur Road, Near IDBI Bank', city: 'Namakkal',  state: 'TamilNadu', country: 'India', zipcode: '637001'}, function(err, res) {
            console.log(res);
            callback(res);
        });
    },
	
	showinsertdocumentDetails : function(res,flag){
			var http = require('http');
		var HTTPStatus = require('http-status');
			res.write(
			JSON.stringify({ 
			flag: flag
			
			})
		);
		//customlog.info(JSON.stringify({ result: result}));
		res.end();
	},

	//temporary function for apex camera recept capture. to be removed once LR android app is ready.
	insertdocumentDetailsCall: function(captured_image,client_id,doc_type_id,doc_name,group_id,callback) {
		this.model.insertdocumentDetailsModel(captured_image,client_id,doc_type_id,doc_name,group_id,callback);
	},
	
	/*//Json group detail//
	showGroupDetails : function(res,groupIdArray,groupNameArray) {
		res.write("[");
       for(var i=0;i<groupIdArray.length;i++) {
			if((groupIdArray.length-1)==i){
				res.write(JSON.stringify({ group_id: groupIdArray[i],group_name:groupNameArray[i]}));
			}else if(groupIdArray.length>i){
				res.write(JSON.stringify({ group_id: groupIdArray[i],group_name:groupNameArray[i]})+",");
			
			}
			
		}
		res.write("]");
		//customlog.info(JSON.stringify({ result: result}));
		res.end();
    },*/
	
	/*groupDetailsCall: function(tenant_id,office_id,callback) {
		this.model.groupDetailsModel(tenant_id,office_id,callback);
	},*/
	
	/*groupDetails: function(req, res) {
		try{
            var self = this;
            var tenant_id=req.body.tenant_id;
            var office_id=req.body.office_id;
            //var activityDetails = new Array(iklantPort, req.session.tenantId, req.session.userId, req.session.userName, req.originalUrl, req.connection.remoteAddress, "router.js", "groupDetails", "success", "groupDetails", "groupDetails");
            //self.commonRouter.insertActivityLogModel(activityDetails);
            customlog.info("tenant_id="+tenant_id);
            this.groupDetailsCall(tenant_id,office_id,function(groupIdArray,groupNameArray){
                self.showGroupDetails(res,groupIdArray,groupNameArray);
            });
        }catch(e){
            customlog.error("Exception while group details "+e);
            self.showErrorPage(req,res);
        }
	},*/
	
	
	/*//Json document detail//////////////////////////////////////////////////////////////////
	showDocumentDetails : function(res,doc_idArray,doc_typeArray) {
		res.write("[");
       for(var i=0;i<doc_idArray.length;i++) {
			if((doc_idArray.length-1)==i){
				res.write(JSON.stringify({ doc_id: doc_idArray[i],doc_type:doc_typeArray[i]}));
			}else if(doc_idArray.length>i){
				res.write(JSON.stringify({ doc_id: doc_idArray[i],doc_type:doc_typeArray[i]})+",");
			}
			
		}
		res.write("]");
		//customlog.info(JSON.stringify({ result: result}));
		res.end();
    },*/
	
	/*documentDetailsCall: function(tenant_id,callback) {
		this.model.documentDetailsModel(tenant_id,callback);
	},*/
	
	/*documentDetails: function(req, res) {
		var self = this;
		var tenant_id=req.body.tenant_id;
        //var activityDetails = new Array(iklantPort, req.session.tenantId, req.session.userId, req.session.userName, req.originalUrl, req.connection.remoteAddress, "router.js", "documentDetails", "success", "documentDetails", "documentDetails");
        //self.commonRouter.insertActivityLogModel(activityDetails);
		this.documentDetailsCall(tenant_id,function(doc_idArray,doc_typeArray){
			self.showDocumentDetails(res,doc_idArray,doc_typeArray);
		});
	},*/
		
	/*//Json member detail//////////////////////////////////////////////////////////////////
	showMemberDetails : function(res,groupIdArray,memberIdArray,memberNameArray) {
		res.write("[");
       for(var i=0;i<groupIdArray.length;i++) {
			if((groupIdArray.length-1)==i){
				res.write(JSON.stringify({ group_id: groupIdArray[i],member_id:memberIdArray[i],member_name:memberNameArray[i]}));
			}else if(groupIdArray.length>i){
				res.write(JSON.stringify({ group_id: groupIdArray[i],member_id:memberIdArray[i],member_name:memberNameArray[i]})+",");
			}
			
		}
		res.write("]");
		//customlog.info(JSON.stringify({ result: result}));
		res.end();
    },
	
	memberDetailsCall: function(tenant_id,office_id,callback) {
		this.model.memberDetailsModel(tenant_id,office_id,callback);
	},
	
	memberDetails: function(req, res) {
		var self = this;
		var tenant_id=req.body.tenant_id;
		var office_id=req.body.office_id;
        //var activityDetails = new Array(iklantPort, req.session.tenantId, req.session.userId, req.session.userName, req.originalUrl, req.connection.remoteAddress, "router.js", "memberDetails", "success", "memberDetails", "memberDetails");
        //self.commonRouter.insertActivityLogModel(activityDetails);
		customlog.info("tenant_id="+tenant_id);
		this.memberDetailsCall(tenant_id,office_id,function(groupIdArray,memberIdArray,memberNameArray){
			self.showMemberDetails(res,groupIdArray,memberIdArray,memberNameArray);
		});
	},*/
	
	/*availableDocumentDetailsCall: function(tenant_id,office_id,callback) {
		this.model.availableDocumentDetailsModel(tenant_id,office_id,callback);
	},
	
	showAvailableDocumentDetails: function(res,groupIdArray,memberIdArray,docNameArray,docTypeArray) {
		res.write("[");
		for(var i=0;i<groupIdArray.length;i++) {
			if((groupIdArray.length-1)==i){
				res.write(JSON.stringify({ group_id: groupIdArray[i],member_id:memberIdArray[i],doc_name:docNameArray[i],doc_type_id:docTypeArray[i]}));
			}else if(groupIdArray.length>i){
				res.write(JSON.stringify({ group_id: groupIdArray[i],member_id:memberIdArray[i],doc_name:docNameArray[i],doc_type_id:docTypeArray[i]})+",");
			}
		}
		res.write("]");
		res.end();
    },
	
	availableDocumentDetails: function(req, res) {
		var self = this;
		var tenant_id=req.body.tenant_id;
		var office_id=req.body.office_id;
        //var activityDetails = new Array(iklantPort, req.session.tenantId, req.session.userId, req.session.userName, req.originalUrl, req.connection.remoteAddress, "router.js", "availableDocumentDetails", "success", "availableDocumentDetails", "availableDocumentDetails");
        //self.commonRouter.insertActivityLogModel(activityDetails);
		//customlog.info("tenant_id="+tenant_id);
		this.availableDocumentDetailsCall(tenant_id,office_id,function(groupIdArray,memberIdArray,docNameArray,docTypeArray){
			self.showAvailableDocumentDetails(res,groupIdArray,memberIdArray,docNameArray,docTypeArray);
		});
	},*/
	
	
	iklanToAndroidDetailsCall: function(tenant_id,office_id,user_id,role_id,callback) {
		this.model.iklanToAndroidDetailsModel(tenant_id,office_id,user_id,role_id,callback);
	},
    // Dhinakaran

    ShowIklanToAndroidDetails: function(res,role_id,office_id,officeName,prospectGroupForAndroidObj,
                                        prospectClientForAndroidObj,allDocTypeForAndroidObj,loanTypeIdArray,
                                        loanTypeArray,operationIdForRoleIdArray,prospectFieldVerificationForAndroidObj,
                                        lookUpEntityForAndroidObj,lookUpValueForAndroidObj) {
        var constantsObj = this.constants;
        //customlog.info("Inside iklanToAndroidDetails - if -method "+role_id);
        var commonDetailsJson = '"Common":'+JSON.stringify({noOfGroups:prospectGroupForAndroidObj.getGroup_id().length,
            officeId : office_id,
            officeName:officeName,
            loanTypeIdListArray : loanTypeIdArray,
            loanTypeListArray :loanTypeArray,
            nextGroupName:prospectGroupForAndroidObj.getNextGroupName()})
        var groupDetailsJson = '"GroupDetails":'+JSON.stringify({});
        if((typeof prospectGroupForAndroidObj != 'undefined') && (typeof allDocTypeForAndroidObj != 'undefined')){
            groupDetailsJson = '"GroupDetails":'+JSON.stringify({groupIdArray:prospectGroupForAndroidObj.getGroup_id(),
                groupGlobalNumberArray:prospectGroupForAndroidObj.getGroup_global_number(),
                groupNameArray:prospectGroupForAndroidObj.getGroup_name(),
                centreNameArray:prospectGroupForAndroidObj.getCenter_name(),
                statusIdArray:prospectGroupForAndroidObj.getStatus_id(),
                groupCreatedDateArray:prospectGroupForAndroidObj.getGroup_created_date(),
                selectedLoanTypeIdArray:prospectGroupForAndroidObj.getLoan_type_id(),
                createdByArray:prospectGroupForAndroidObj.getCreated_by(),
                createdDateArray:prospectGroupForAndroidObj.getCreated_date(),
                areaIdArray:prospectGroupForAndroidObj.getAreaCodes(),
                areaNamesArray:prospectGroupForAndroidObj.getAreaNames(),
                allDocTypeIdArray:allDocTypeForAndroidObj.getDocId(),
                allDocTypeEntityIdArray:allDocTypeForAndroidObj.getDocEntityId(),
                allDocTypeNameArray:allDocTypeForAndroidObj.getDocName(),
                mobileGroupName:prospectGroupForAndroidObj.getMobile_group_name(),
                neededImageClarityGroup:prospectGroupForAndroidObj.getNeeded_image_clarity(),
                neededInformationArray:prospectGroupForAndroidObj.getNeeded_information(),
                assignedToArray:prospectGroupForAndroidObj.getAssigned_to(),
                loanCountArray:prospectGroupForAndroidObj.getLoanCount()
            })
        }
        var clientDetailsJson = '"ClientDetails":'+JSON.stringify({});
        if(typeof prospectClientForAndroidObj != 'undefined' && prospectClientForAndroidObj != ''){
            clientDetailsJson = '"ClientDetails":'+JSON.stringify({clientGroupIdArray:prospectClientForAndroidObj.getGroup_id(),
                clientIdArray:prospectClientForAndroidObj.getClient_id(),
                clientFirstNameArray:prospectClientForAndroidObj.getClient_first_name(),
                clientLastNameArray:prospectClientForAndroidObj.getClient_last_name(),
                clientStatusIdArray:prospectClientForAndroidObj.getStatus_id(),
                updatedTimeArray:prospectClientForAndroidObj.getUpdated_time(),
                mobileGroupNameClient:prospectClientForAndroidObj.getMobile_group_name_client(),
                neededImageClarityDocsClient:prospectClientForAndroidObj.getNeeded_image_clarity_docs(),
                remarksForNeededImageClarityArray:prospectClientForAndroidObj.getRemarks_for_need_more_information(),
                clientLoanCountArray:prospectClientForAndroidObj.getLoan_count()
            })
        }
        //customlog.info("asdasd "+prospectFieldVerificationForAndroidObj);
        //customlog.info("operationIdForRoleIdArray "+operationIdForRoleIdArray);
        var fieldVerificationJson = '"FV":'+JSON.stringify({});
        if(typeof prospectFieldVerificationForAndroidObj != 'undefined'){
            fieldVerificationJson = '"FV":'+JSON.stringify({fieldVerificationClientIdArray:prospectFieldVerificationForAndroidObj.getClient_id(),
                clientAddressArray:prospectFieldVerificationForAndroidObj.getClient_address(),
                rationCardNumberArray:prospectFieldVerificationForAndroidObj.getRation_card_number(),
                contactNumberArray:prospectFieldVerificationForAndroidObj.getMobile_number(),
                landlineNumberArray:prospectFieldVerificationForAndroidObj.getLandline_number(),
                voterIdArray:prospectFieldVerificationForAndroidObj.getVoter_id(),
                gasNumberArray:prospectFieldVerificationForAndroidObj.getGas_number(),
                aadhaarNumberArray:prospectFieldVerificationForAndroidObj.getAadhaar_number(),
                otherIdNameArray1:prospectFieldVerificationForAndroidObj.getOther_id_name(),
                otherIdArray:prospectFieldVerificationForAndroidObj.getOther_id(),
                otherIdNameArray2:prospectFieldVerificationForAndroidObj.getOther_id_name2(),
                otherIdArray2:prospectFieldVerificationForAndroidObj.getOther_id2(),
                guarantorNameArray:prospectFieldVerificationForAndroidObj.getGuarantor_name(),
                guarantorAddressArray:prospectFieldVerificationForAndroidObj.getGuarantor_address(),
                guarantorIdArray:prospectFieldVerificationForAndroidObj.getGuarantor_id(),
                guarantorRelationshipArray:prospectFieldVerificationForAndroidObj.getGuarantor_relationship(),
                isBankAccountArray:prospectFieldVerificationForAndroidObj.getIs_bank_account(),
                isInsuranceLifetimeArray:prospectFieldVerificationForAndroidObj.getIs_insurance_lifetime(),
                householdDetailsArray:prospectFieldVerificationForAndroidObj.getHousehold_details(),
                timePeriodArray:prospectFieldVerificationForAndroidObj.getTime_period(),
                houseSqftArray:prospectFieldVerificationForAndroidObj.getHouse_sqft(),
                vehicleDetailsArray:prospectFieldVerificationForAndroidObj.getVehicle_details(),
                houseRoomDetailArray:prospectFieldVerificationForAndroidObj.getHouse_room_detail(),
                houseTypeArray:prospectFieldVerificationForAndroidObj.getHouse_type(),
                houseCeilingTypeArray:prospectFieldVerificationForAndroidObj.getHouse_ceiling_type(),
                houseWallTypeArray:prospectFieldVerificationForAndroidObj.getHouse_wall_type(),
                houseToiletArray:prospectFieldVerificationForAndroidObj.getHouse_toilet(),
                houseFlooringDetailArray:prospectFieldVerificationForAndroidObj.getHouse_flooring_detail(),
                entityIdArray:lookUpEntityForAndroidObj.getEntity_id(),
                entityNameArray:lookUpEntityForAndroidObj.getEntity_name(),
                lookUpEntityIdArray:lookUpValueForAndroidObj.getEntity_id(),
                lookupIdArray:lookUpValueForAndroidObj.getLookup_id(),
                lookupValueArray:lookUpValueForAndroidObj.getLookup_value(),
                reInitiatedClientArray:prospectFieldVerificationForAndroidObj.getReinitiated_client(),
                fieldVerificationClientloanCountArray:prospectFieldVerificationForAndroidObj.getLoan_count()
            });
        }
        var SyncDetails = "" ;
        //customlog.info("sss "+constantsObj.getGroupCreationOperationId());
        if(operationIdForRoleIdArray.indexOf(constantsObj.getGroupCreationOperationId()) > -1){
            SyncDetails = commonDetailsJson;
        }
        if(operationIdForRoleIdArray.indexOf(constantsObj.getPreliminaryVerificationOperationId()) > -1){
            SyncDetails = commonDetailsJson +","+ groupDetailsJson;
        }
        if(operationIdForRoleIdArray.indexOf(constantsObj.getKYCUploadingOperationId()) > -1){
            SyncDetails = commonDetailsJson +","+ groupDetailsJson +","+ clientDetailsJson;
        }
        if(operationIdForRoleIdArray.indexOf(constantsObj.getFieldVerificationOperationId()) > -1){
            SyncDetails = commonDetailsJson +","+ groupDetailsJson +","+ clientDetailsJson+","+fieldVerificationJson;
        }

        customlog.info("SyncDetails: "+SyncDetails);

        SyncDetails = "{"+ SyncDetails +"}";
        res.write(SyncDetails);
        res.end();
        /*
         if(role_id == constantsObj.getBDEroleId()){


         res.write(JSON.stringify({noOfGroups:prospectGroupForAndroidObj.getGroup_id().length,
         officeId : office_id,
         officeName:officeName,
         loanTypeIdListArray : loanTypeIdArray,
         loanTypeListArray :loanTypeArray,
         nextGroupName:prospectGroupForAndroidObj.getNextGroupName(),
         groupIdArray:prospectGroupForAndroidObj.getGroup_id(),
         groupGlobalNumberArray:prospectGroupForAndroidObj.getGroup_global_number(),
         groupNameArray:prospectGroupForAndroidObj.getGroup_name(),
         centreNameArray:prospectGroupForAndroidObj.getCenter_name(),
         statusIdArray:prospectGroupForAndroidObj.getStatus_id(),
         groupCreatedDateArray:prospectGroupForAndroidObj.getGroup_created_date(),
         selectedLoanTypeIdArray:prospectGroupForAndroidObj.getLoan_type_id(),
         createdByArray:prospectGroupForAndroidObj.getCreated_by(),
         createdDateArray:prospectGroupForAndroidObj.getCreated_date(),
         allDocTypeIdArray:allDocTypeForAndroidObj.getDocId(),
         allDocTypeEntityIdArray:allDocTypeForAndroidObj.getDocEntityId(),
         allDocTypeNameArray:allDocTypeForAndroidObj.getDocName(),
         clientGroupIdArray:prospectClientForAndroidObj.getGroup_id(),
         clientIdArray:prospectClientForAndroidObj.getClient_id(),
         clientFirstNameArray:prospectClientForAndroidObj.getClient_first_name(),
         clientLastNameArray:prospectClientForAndroidObj.getClient_last_name(),
         clientStatusIdArray:prospectClientForAndroidObj.getStatus_id(),
         updatedTimeArray:prospectClientForAndroidObj.getUpdated_time(),
         mobileGroupName:prospectGroupForAndroidObj.getMobile_group_name(),
         mobileGroupNameClient:prospectClientForAndroidObj.getMobile_group_name_client(),
         neededImageClarityGroup:prospectGroupForAndroidObj.getNeeded_image_clarity(),
         neededImageClarityDocsClient:prospectClientForAndroidObj.getNeeded_image_clarity_docs(),
         }));
         res.end();

         }else if(role_id == constantsObj.getFOroleId()){
         res.write(JSON.stringify({noOfGroups:prospectGroupForAndroidObj.getGroup_id().length,
         groupIdArray:prospectGroupForAndroidObj.getGroup_id(),
         groupGlobalNumberArray:prospectGroupForAndroidObj.getGroup_global_number(),
         groupNameArray:prospectGroupForAndroidObj.getGroup_name(),
         centreNameArray:prospectGroupForAndroidObj.getCenter_name(),
         statusIdArray:prospectGroupForAndroidObj.getStatus_id(),
         groupCreatedDateArray:prospectGroupForAndroidObj.getGroup_created_date(),
         neededInformationArray:prospectGroupForAndroidObj.getNeeded_information(),
         assignedToArray:prospectGroupForAndroidObj.getAssigned_to(),
         createdByArray:prospectGroupForAndroidObj.getCreated_by(),
         allDocTypeIdArray:allDocTypeForAndroidObj.getDocId(),
         allDocTypeEntityIdArray:allDocTypeForAndroidObj.getDocEntityId(),
         allDocTypeNameArray:allDocTypeForAndroidObj.getDocName(),
         clientGroupIdArray:prospectClientForAndroidObj.getGroup_id(),
         clientIdArray:prospectClientForAndroidObj.getClient_id(),
         clientFirstNameArray:prospectClientForAndroidObj.getClient_first_name(),
         clientLastNameArray:prospectClientForAndroidObj.getClient_last_name(),
         clientStatusIdArray:prospectClientForAndroidObj.getStatus_id(),
         updatedTimeArray:prospectClientForAndroidObj.getUpdated_time(),
         fieldVerificationClientIdArray:prospectFieldVerificationForAndroidObj.getClient_id(),
         clientAddressArray:prospectFieldVerificationForAndroidObj.getClient_address(),
         rationCardNumberArray:prospectFieldVerificationForAndroidObj.getRation_card_number(),
         contactNumberArray:prospectFieldVerificationForAndroidObj.getContact_number(),
         voterIdArray:prospectFieldVerificationForAndroidObj.getVoter_id(),
         gasNumberArray:prospectFieldVerificationForAndroidObj.getGas_number(),
         aadhaarNumberArray:prospectFieldVerificationForAndroidObj.getAadhaar_number(),
         otherIdArray:prospectFieldVerificationForAndroidObj.getOther_id(),
         guarantorNameArray:prospectFieldVerificationForAndroidObj.getGuarantor_name(),
         guarantorAddressArray:prospectFieldVerificationForAndroidObj.getGuarantor_address(),
         guarantorIdArray:prospectFieldVerificationForAndroidObj.getGuarantor_id(),
         guarantorRelationshipArray:prospectFieldVerificationForAndroidObj.getGuarantor_relationship(),
         isBankAccountArray:prospectFieldVerificationForAndroidObj.getIs_bank_account(),
         isInsuranceLifetimeArray:prospectFieldVerificationForAndroidObj.getIs_insurance_lifetime(),
         householdDetailsArray:prospectFieldVerificationForAndroidObj.getHousehold_details(),
         timePeriodArray:prospectFieldVerificationForAndroidObj.getTime_period(),
         houseSqftArray:prospectFieldVerificationForAndroidObj.getHouse_sqft(),
         vehicleDetailsArray:prospectFieldVerificationForAndroidObj.getVehicle_details(),
         houseRoomDetailArray:prospectFieldVerificationForAndroidObj.getHouse_room_detail(),
         houseTypeArray:prospectFieldVerificationForAndroidObj.getHouse_type(),
         houseCeilingTypeArray:prospectFieldVerificationForAndroidObj.getHouse_ceiling_type(),
         houseWallTypeArray:prospectFieldVerificationForAndroidObj.getHouse_wall_type(),
         houseToiletArray:prospectFieldVerificationForAndroidObj.getHouse_toilet(),
         houseFlooringDetailArray:prospectFieldVerificationForAndroidObj.getHouse_flooring_detail(),
         entityIdArray:lookUpEntityForAndroidObj.getEntity_id(),
         entityNameArray:lookUpEntityForAndroidObj.getEntity_name(),
         lookUpEntityIdArray:lookUpValueForAndroidObj.getEntity_id(),
         lookupIdArray:lookUpValueForAndroidObj.getLookup_id(),
         lookupValueArray:lookUpValueForAndroidObj.getLookup_value()
         }));
         res.end();
         }
         */

    },

	iklanToAndroidDetails: function(req, res) {
		var self = this;
		var tenant_id=req.body.tenant_id;
		var office_id=req.body.office_id;
		var user_id=req.body.user_id;
		var role_id=req.body.role_id;
		var constantsObj = this.constants;
        //var activityDetails = new Array(iklantPort, req.session.tenantId, req.session.userId, req.session.userName, req.originalUrl, req.connection.remoteAddress, "router.js", "iklanToAndroidDetails", "success", "iklanToAndroidDetails", "iklanToAndroidDetails");
        //self.commonRouter.insertActivityLogModel(activityDetails);
		customlog.info('tenant_id '+tenant_id+' office_id '+office_id);
        self.iklanToAndroidDetailsCall(tenant_id,office_id,user_id,role_id,function(operationIdForRoleIdArray,
										prospectGroupForAndroidObj,loanTypeIdArray,loanTypeArray,
										prospectClientForAndroidObj,allDocTypeForAndroidObj,prospectFieldVerificationForAndroidObj,
										lookUpEntityForAndroidObj,lookUpValueForAndroidObj){
			//if(prospectGroupForAndroidObj.getGroup_id().length != 0) {
			if(prospectGroupForAndroidObj.getNextGroupName() != "") {
                self.androidRouter.retriveOfficeName(tenant_id,office_id,function(officeName){
					self.ShowIklanToAndroidDetails(res,role_id,office_id,officeName,prospectGroupForAndroidObj,
											prospectClientForAndroidObj,allDocTypeForAndroidObj,loanTypeIdArray,
											loanTypeArray,operationIdForRoleIdArray,prospectFieldVerificationForAndroidObj,
											lookUpEntityForAndroidObj,lookUpValueForAndroidObj);
				});
			}
			else {
                self.androidRouter.ShowIklanToAndroidNoDetails(res,role_id,prospectGroupForAndroidObj);
			}
		});
	},

	retrieveClientName : function(clientId,callback) {
		this.model.retrieveClientNameModel(clientId,callback);
	},

    ShowLoanSanctionToAndroidDetails: function(res,role_id,office_id,officeName,prospectGroupForAndroidObj,prospectClientForAndroidObj) {
        var constantsObj = this.constants;
        //customlog.info("Inside iklanToAndroidDetails - if -method "+role_id);
        var commonDetailsJson = '"Common":'+JSON.stringify({noOfGroups:prospectGroupForAndroidObj.getGroup_id().length,
            officeId : office_id,
            officeName:officeName,
            //loanTypeIdListArray : loanTypeIdArray,
            //loanTypeListArray :loanTypeArray,
            nextGroupName:prospectGroupForAndroidObj.getNextGroupName()})
        var groupDetailsJson = '"GroupDetails":'+JSON.stringify({});
        if((typeof prospectGroupForAndroidObj != 'undefined')){
            groupDetailsJson = '"GroupDetails":'+JSON.stringify({groupIdArray:prospectGroupForAndroidObj.getGroup_id(),
                groupGlobalNumberArray:prospectGroupForAndroidObj.getGroup_global_number(),
                groupNameArray:prospectGroupForAndroidObj.getGroup_name(),
                centreNameArray:prospectGroupForAndroidObj.getCenter_name(),
                statusIdArray:prospectGroupForAndroidObj.getStatus_id(),
                groupCreatedDateArray:prospectGroupForAndroidObj.getGroup_created_date(),
                selectedLoanTypeIdArray:prospectGroupForAndroidObj.getLoan_type_id(),
                createdByArray:prospectGroupForAndroidObj.getCreated_by(),
                createdDateArray:prospectGroupForAndroidObj.getCreated_date(),
               // allDocTypeIdArray:allDocTypeForAndroidObj.getDocId(),
               // allDocTypeEntityIdArray:allDocTypeForAndroidObj.getDocEntityId(),
              //  allDocTypeNameArray:allDocTypeForAndroidObj.getDocName(),
                mobileGroupName:prospectGroupForAndroidObj.getMobile_group_name(),
                neededImageClarityGroup:prospectGroupForAndroidObj.getNeeded_image_clarity(),
                neededInformationArray:prospectGroupForAndroidObj.getNeeded_information(),
                assignedToArray:prospectGroupForAndroidObj.getAssigned_to()
            })
        }
        var clientDetailsJson = '"ClientDetails":'+JSON.stringify({});
        if(typeof prospectClientForAndroidObj != 'undefined'){
            clientDetailsJson = '"ClientDetails":'+JSON.stringify({clientGroupIdArray:prospectClientForAndroidObj.getGroup_id(),
                clientIdArray:prospectClientForAndroidObj.getClient_id(),
                clientFirstNameArray:prospectClientForAndroidObj.getClient_first_name(),
                clientLastNameArray:prospectClientForAndroidObj.getClient_last_name(),
                clientStatusIdArray:prospectClientForAndroidObj.getStatus_id(),
                updatedTimeArray:prospectClientForAndroidObj.getUpdated_time(),
                mobileGroupNameClient:prospectClientForAndroidObj.getMobile_group_name_client(),
                neededImageClarityDocsClient:prospectClientForAndroidObj.getNeeded_image_clarity_docs()
            })
        }
        var SyncDetails = commonDetailsJson +","+ groupDetailsJson +","+ clientDetailsJson ;
        SyncDetails = "{"+ SyncDetails +"}";
        customlog.info("SyncDetails: "+SyncDetails);
        res.write(SyncDetails);
        res.end();
    },

	showRegisterNewUser: function(req,res) {
      res.render('Register',{contextPath:props.contextPath});
    },
	
	registerNewUser: function(req, res){
		var self = this;
		self.showRegisterNewUser(req,res);
	},

	showSaveRegisterUser: function(req,res) {
      res.render('login', { errorMessage: 'Registration Successful', contextPath:props.contextPath, loginDiv:'', forgotPasswordDiv:'hideContent'});
    },
	
	saveRegisterUserCall: function(tenantName,tenantAddress,callback) {
		this.model.saveRegisterUserModel(tenantName,tenantAddress,callback);
	},
	
	saveRegisterUser: function(req, res){
		try{
            var self = this;
            var tenantName=req.body.tenantName;
            var tenantAddress=req.body.tenantAddress;
            this.saveRegisterUserCall(tenantName,tenantAddress,function(){
                var activityDetails = new Array(iklantPort, req.session.tenantId, req.session.userId, req.session.userName, req.originalUrl, req.connection.remoteAddress, "router.js", "saveRegisterUser", "success", "Register User as Tenant", "New tenant "+tenantName+" Created successfully","insert");
                self.commonRouter.insertActivityLogModel(activityDetails);
                self.showSaveRegisterUser(req,res);
            });
        }catch(e){
            customlog.error("Exception Whilw save register user "+e);
            self.showErrorPage(req,res);
        }
	
	},
	
	/*showCreateGroups: function(req,res,groupNames,nextGroupName,loanTypeIdArray,loanTypeArray, areaCodes, areaNames) {
        try{
            var self = this;
            //var activityDetails = new Array(iklantPort, req.session.tenantId, req.session.userId, req.session.userName, req.originalUrl, req.connection.remoteAddress, "router.js", "showCreateGroups", "success", "Group Creation", "showCreateGroups");
            //self.commonRouter.insertActivityLogModel(activityDetails);
            if(req.session.browser == "mobile") {
                res.render('Mobile/GroupCreationMobile', { source:true,groupNames:groupNames,nextGroupName:nextGroupName,
                officeName:req.session.officeName,officeId:req.session.officeId,loanTypeIdArray:loanTypeIdArray,loanTypeArray:loanTypeArray, areaCodes: areaCodes, areaNames: areaNames , contextPath:props.contextPath});
            }
            else {
                res.render('GroupCreation', { source:true,groupNames:groupNames,nextGroupName:nextGroupName,
                officeName:req.session.officeName,officeId:req.session.officeId,loanTypeIdArray:loanTypeIdArray,loanTypeArray:loanTypeArray, areaCodes: areaCodes, areaNames: areaNames , contextPath:props.contextPath});
            }
        }catch(e){
                customlog.error("Exception while show create groups "+e);
                self.showErrorPage(req,res);
            }
    },*/
	
	/*setOperationsPage: function(req,res,branchesIdArray,branchesArray,statusObj,officeObj,operationObj) {
		req.session.branchesId = branchesIdArray;
		req.session.branches = branchesArray;
		req.session.statusIdArray = statusObj.getStatusIdArray();
		req.session.statusNameArray = statusObj.getStatusNameArray();
		req.session.officeName = officeObj.getOfficeName();
		req.session.operationName = operationObj.getOperationNameArray();
		req.session.operationId = operationObj.getOperationIdArray();
	},*/
	
	/*createGroup: function(req, res){
		try{
            var self = this;
            var tenantId = req.session.tenantId;
            var userId = req.session.userId;
            var officeId = req.session.officeId;
            var roleId = req.session.roleId;
            var userId = req.session.userId;
            if(typeof tenantId == 'undefined' || typeof userId == 'undefined') {
                res.redirect(props.contextPath+'/client/ci/login');
            }
            else {
                //var activityDetails = new Array(iklantPort, req.session.tenantId, req.session.userId, req.session.userName, req.originalUrl, req.connection.remoteAddress, "router.js", "createGroup", "success", "Create New Group", "New Group created successfully","insert");
                //self.commonRouter.insertActivityLogModel(activityDetails);
                self.commonRouter.getBranchesCall(tenantId,userId,roleId,officeId,function(branchesIdArray,branchesArray,statusObj,officeObj,operationObj){
                self.setOperationsPage(req,res,branchesIdArray,branchesArray,statusObj,officeObj,operationObj);
                });

                self.commonRouter.createGroupCall(tenantId,officeId,userId, function(groupNames,nextGroupName, areaCodes, areaNames){
                    self.commonRouter.retrieveLoanTypeList(tenantId,function(loanTypeIdArray,loanTypeArray){
                        self.showCreateGroups(req,res,groupNames,nextGroupName,loanTypeIdArray,loanTypeArray, areaCodes, areaNames);
                    });
                });
            }
        }catch(e){
            customlog.error("Exception while create group "+e);
            self.showErrorPage(req,res);
        }
	},*/
	
	/*saveGroupCall: function(userId,officeId,areaCodeId,prosGroup,callback) {
		this.model.saveGroupGroupModel(userId,officeId,areaCodeId,prosGroup,callback);
	},*/

	/*saveGroup: function(req, res) {
        try{
            var prospectGroupObj = require(domainPath +"/prospectGroup");
            var prosClientObj = require(domainPath +"/prospectClient");
            var self = this;
            var tenantId = req.session.tenantId;
            var userId = req.session.userId;
            var roleId = req.session.roleId;
            var officeId = req.session.officeId;
            var userContactNumber = req.session.userContactNumber;
            customlog.info("userContactNumber : "+userContactNumber);
            var clientNames;
            var clientLastNames;
            if(typeof tenantId == 'undefined' || typeof userId == 'undefined') {
                res.redirect(props.contextPath+'/client/ci/login');
            }
            else {
                var groupName = req.body.groupName;
                var centerName= req.body.centerName;
                var branchName= req.body.branchName;
                var createdDate = formatDate(req.body.createdDatePicker);
                var loanTypeId = req.body.loanType;
                //var numberOfClients = req.body.totalClients;
                //customlog.info("numberOfClients : "+numberOfClients);
                /*if(typeof numberOfClients == 'undefined' || numberOfClients == 0) {
                    clientNames=req.body.clientNames;
                    clientLastNames=req.body.clientLastNames;
                }
                else {
                    for(var i=1;i<=numberOfClients;i++) {
                        customlog.info("mfn+i : "+"mfn"+i);
                        if(typeof clientNames != 'undefined' && typeof clientLastNames != 'undefined') {
                            if(i==numberOfClients) {
                                clientNames += "mfn"+i;
                                clientLastNames+= "mln"+i;
                            }
                            else {
                                clientNames += "mfn"+i+",";
                                clientLastNames+= "mln"+i+",";
                            }
                        }
                        else {
                            clientNames = "mfn"+i+",";
                            clientLastNames = "mln"+i+",";
                        }
                    }
                }
                var overdues=req.body.overdues;
                var weekradio =  req.body.meetingschedule;
                var recurweek = req.body.recurevery;
                var dayorder = req.body.dayorder;
                var weeklocation =  req.body.location;
                var areaCodeId =  req.body.areaName;
                var meetingTime =  (req.body.meetingTime == '')?(req.body.meetingTimeMonth == '')?defaultTime:req.body.meetingTimeMonth:req.body.meetingTime;

                var monthday = req.body.day;
                var everymonth =  req.body.onemonth;
                var monthlocation = req.body.locationmonth;


                var prosGroup = new prospectGroupObj();
                var prosClient = new prosClientObj();
                prosGroup.setTenant_id(tenantId);
                prosGroup.setGroup_name(groupName);
                prosGroup.setCenter_name(centerName);
                prosGroup.setOffice_id(officeId);
                prosGroup.setGroup_created_date(createdDate);
                prosGroup.setLoan_type_id(loanTypeId);
                prosGroup.setWeekradio(weekradio);
                prosGroup.setRecurweek(recurweek);
                prosGroup.setDayorder(dayorder);
                prosGroup.setWeeklocation(weeklocation);
                prosGroup.setMonthday(monthday);
                prosGroup.setEverymonth(everymonth);
                prosGroup.setMonthlocation(monthlocation);
                prosGroup.setMeetingTime(meetingTime);
                /*
                prosClient.setClient_name(clientNames);
                prosClient.setClient_last_name(clientLastNames);
                */
                /*this.saveGroupCall(userId,officeId,areaCodeId,prosGroup,function(){
                    //Submit Task
                    var activityDetails = new Array(iklantPort, req.session.tenantId, req.session.userId, req.session.userName, req.originalUrl, req.connection.remoteAddress, "router.js", "saveGroup", "success", "Group Creation", "GroupName: "+groupName+" Created successfully","insert");
                    self.commonRouter.insertActivityLogModel(activityDetails);
                    var data = {};
                        data.userId = userId;
                        data.officeId = officeId;
                        data.tenantId = tenantId;
                        data.contactNumber = userContactNumber;
                        data.taskDescription = "New Group Creation ("+groupName+")";
                        self.commonRouter.submitTaskService(req,res,data);
                });
                res.redirect(props.contextPath+'/client/ci/groups');
            }
        }catch(e){
            customlog.error("Exception While save group "+e);
            self.showErrorPage(req,res);
        }
	},*/
	
	/*showPreliminaryVerification: function(req,res,alertMsg,prosGroup,office,prosClient,docTypeIdArray,docTypeNameArray) {
		try{
            var self = this;
            //var activityDetails = new Array(iklantPort, req.session.tenantId, req.session.userId, req.session.userName, req.originalUrl, req.connection.remoteAddress, "router.js", "showPreliminaryVerification", "success", "Preliminary Verification", "showPreliminaryVerification");
            //self.commonRouter.insertActivityLogModel(activityDetails);
            if(req.session.browser == "mobile") {
                res.render('Mobile/preliminaryVerificationFormMobile', {alertMsg:alertMsg,prosGroup:prosGroup, office:office,prosClient:prosClient,docTypeIdArray:docTypeIdArray,docTypeNameArray:docTypeNameArray, contextPath:props.contextPath});
            }
            else {
                res.render('preliminaryVerificationForm', {alertMsg:alertMsg,prosGroup:prosGroup, office:office,prosClient:prosClient,docTypeIdArray:docTypeIdArray,docTypeNameArray:docTypeNameArray, contextPath:props.contextPath});
            }
        }catch(e){
            customlog.error("Exception While show preliminary verification "+e);
            self.showErrorPage(req,res);
        }
    },*/
	
	/*showSavedGroups: function(req, res,listGroupsIdArray,listGroupsArray,remarksDisplay,listGroupsGlobalNumberArray) {
      try{
          var self = this;
          var constantsObj = this.constants;
          operationNameArray = req.session.operationName;
          operationIdArray = req.session.operationId;
          var userName = req.session.userName;
          var remarksArray = new Array();
          remarksArray = remarksDisplay.split("-");
          customlog.info("remarksArray : "+remarksArray);
          var roleId = req.session.roleId;
          var errorMessage = "";
          if(listGroupsIdArray.length !=0) {
            errorMessage = "";
          }
          else {
            errorMessage = "No groups to Display";
          }
            //var activityDetails = new Array(iklantPort, req.session.tenantId, req.session.userId, req.session.userName, req.originalUrl, req.connection.remoteAddress, "router.js", "showSavedGroups", "success", "Preliminary Verification", "showSavedGroups");
            //self.commonRouter.insertActivityLogModel(activityDetails);
          if(req.session.browser == "mobile") {
            res.render('Mobile/PreliminaryVerificationMobile', {errorMessage:errorMessage, groupsName:listGroupsArray,
                                groupsId:listGroupsIdArray, operationNameArray:operationNameArray,
                                operationIdArray:operationIdArray,roleId:roleId,remarksDisplay:remarksArray,
                                userName:userName,listGroupsGlobalNumberArray : listGroupsGlobalNumberArray,
                                constantsObj:constantsObj, contextPath:props.contextPath});
          }
          else {
            res.render('PreliminaryVerification', {errorMessage:errorMessage, groupsName:listGroupsArray,
                                groupsId:listGroupsIdArray, operationNameArray:operationNameArray,
                                operationIdArray:operationIdArray,roleId:roleId,remarksDisplay:remarksArray,
                                userName:userName,listGroupsGlobalNumberArray : listGroupsGlobalNumberArray,
                                constantsObj:constantsObj,currentOperationIndex : operationIdArray.indexOf(parseInt(constantsObj.getPreliminaryVerificationOperationId())), contextPath:props.contextPath});
          }
      }catch(e){
          customlog.error("Exception while show saved groups "+e);
          self.showErrorPage(req,res);
          }
	},*/
	
	/*showPreliminaryVerificationCall:function(groupId,callback) {
		this.model.showPreliminaryVerificationModel(groupId,callback);
	},*/
	
	/*preVerification: function(req,res){
		try{
            var self = this;
            var groupId=req.params.id;
            customlog.info("Group ID params = "+groupId);
            var tenantId = req.session.tenantId;
            var userId = req.session.userId;
            if(typeof tenantId == 'undefined' || typeof userId == 'undefined' || typeof req.session.operationId == 'undefined') {
                res.redirect(props.contextPath+'/client/ci/login');
            }
            else {
                //var activityDetails = new Array(iklantPort, req.session.tenantId, req.session.userId, req.session.userName, req.originalUrl, req.connection.remoteAddress, "router.js", "preVerification", "success", "preVerification", "preVerification");
                //self.commonRouter.insertActivityLogModel(activityDetails);
                this.showPreliminaryVerificationCall(groupId,function(prosGroup,office,prosClient,docTypeIdArray,docTypeNameArray){
                    self.showPreliminaryVerification(req,res,"",prosGroup,office,prosClient,docTypeIdArray,docTypeNameArray);
                });
            }
        }catch(e){
            customlog.error("Exception While pre verification "+e);
            self.showErrorPage(req,res);
        }
	},*/
	
	showPreliminaryVerificationUpload: function(res,groupId,docTypeIdArray,docTypeNameArray) {
     res.render('preliminaryVerificationUploadForm', {groupId:groupId,docTypeIdArray:docTypeIdArray,docTypeNameArray:docTypeNameArray, contextPath:props.contextPath});
    },
	
	/*showPreliminaryVerificationUploadCall:function(groupId,callback) {
		this.model.showPreliminaryVerificationUploadModel(groupId,callback);
	},*/

	preVerificationUpload: function(req,res){
		try{
            var self = this;
            var groupId=req.params.id;
            customlog.info("Group ID params = "+groupId);
            var tenantId = req.session.tenantId;
            var userId = req.session.userId;
            if(typeof tenantId == 'undefined' || typeof userId == 'undefined' || typeof req.session.operationId == 'undefined') {
                res.redirect(props.contextPath+'/client/ci/login');
            }
            else {
                this.showPreliminaryVerificationUploadCall(groupId,function(docTypeIdArray,docTypeNameArray){
                    self.showPreliminaryVerificationUpload(res,groupId,docTypeIdArray,docTypeNameArray);
                });
            }
        }catch(e){
            customlog.error("Exception while pre verification upload "+e);
            self.showErrorPage(req,res);
        }
	},
	
	
	/*preVerificationDocumentUploadCall:function(groupId,fileName,docTypeId,callback) {
		this.model.preVerificationDocumentUploadModel(groupId,fileName,docTypeId,callback);
	},
    */
	/*preVerificationDocumentUpload: function(req,res){
		try{
            var self = this;
            var groupId=req.params.id;
            customlog.info("Group ID params = "+groupId);
            var tenantId = req.session.tenantId;
            var userId = req.session.userId;
            var alertMsg="Image has been Successfully Uploaded !";
            if(typeof tenantId == 'undefined' || typeof userId == 'undefined' || typeof req.session.operationId == 'undefined') {
                res.redirect(props.contextPath+'/client/ci/login');
            }
            else {
                var docTypeId=req.body.documentType;
                var fs = require('fs'),
                util = require('util');
                var fileName=new Array();
                var isMulitpleDoc=req.body.isMultipleDocument;
                customlog.info("Multiple Doc="+isMulitpleDoc);
                if(isMulitpleDoc=="true"){
                    customlog.info("inside true");
                    for(var i=0; i<req.files.multipleUploadDocument.length; i++){
                        fileName[i]=req.files.multipleUploadDocument[i].name;
                        var is = fs.createReadStream(req.files.multipleUploadDocument[i].path)
                        var os = fs.createWriteStream(rootPath+"/documents/group_documents/"+fileName[i]);
                        is.pipe(os);
                        is.on('end', function() {
                            customlog.info('Successfully uploaded');
                            alertMsg = "File has been Uploaded Successfully!"
                        });
                        fs.unlink(req.files.multipleUploadDocument[i].path, function(err){
                            if(err){ customlog.error('Error while unlinking '+err); }
                            else { customlog.error('Successfully unlinked');};
                        });
                        is.on('error', function(err) { customlog.error("error while uploading "+err); });
                    }
                }
                else if(isMulitpleDoc== "false"){
                    if(req.files.singleUploadDocument.name!=""){
                        fileName[0]=req.files.singleUploadDocument.name;
                        customlog.info("fileName="+fileName);
                        if(req.files.singleUploadDocument.name!=""){
                            var is = fs.createReadStream(req.files.singleUploadDocument.path)
                            var os = fs.createWriteStream(rootPath+"/documents/group_documents/"+req.files.singleUploadDocument.name);
                            is.pipe(os);
                            is.on('end', function() {
                                customlog.info('Successfully uploaded');
                                alertMsg = "File has been Uploaded Successfully!"
                            });
                            fs.unlink(req.files.singleUploadDocument.path, function(err){
                                if(err){ customlog.error('Error while unlinking '+err); }
                                else { customlog.error('Successfully unlinked');};
                            });
                            is.on('error', function(err) { customlog.error("error while uploading "+err); });
                        }
                    }
                }
                this.preVerificationDocumentUploadCall(groupId,fileName,docTypeId,function(){
                });
                this.showPreliminaryVerificationCall(groupId,function(prosGroup,office,prosClient,docTypeIdArray,docTypeNameArray){
                    self.showPreliminaryVerification(req,res,alertMsg,prosGroup,office,prosClient,docTypeIdArray,docTypeNameArray);
                });
            }
        }catch(e){
            customlog.error("Exception while pre verification document upload "+e);
            self.showErrorPage(req,res);
        }
	},*/

	/*verifyGroup: function(req,res){
        try{
            var prospectGroupObj = require(domainPath +"/prospectGroup");
            var prosClientObj = require(domainPath +"/prospectClient");
            var preliminaryVerification = require(domainPath +"/preliminaryVerification");
            var self = this;
            var groupId=req.params.id;
            var userId = req.session.userId;
            var tenantId = req.session.tenantId;
            var officeId = req.session.officeId;
            var roleId = req.session.roleId;
            var userContactNumber = req.session.userContactNumber;
            customlog.info("userContactNumber : "+userContactNumber);
            var docTypeId=req.body.documentType;
            if(typeof tenantId == 'undefined' || typeof userId == 'undefined' || typeof req.session.operationId == 'undefined') {
                res.redirect(props.contextPath+'/client/ci/login');
            }
            else {
                //var activityDetails = new Array(iklantPort, req.session.tenantId, req.session.userId, req.session.userName, req.originalUrl, req.connection.remoteAddress, "router.js", "verifyGroup", "success", "verifyGroup", "verifyGroup");
                //self.commonRouter.insertActivityLogModel(activityDetails);
            var groupName = req.body.groupName;
            var groupCreatedDate=formatDate(req.body.createdDatePicker);
            var lastActiveDate=formatDate(req.body.lastActiveDate);
            var savingsDiscussed=req.body.savingsDiscussed;
            var completeAttendance=req.body.completeAttendance;
            var bankAccount=req.body.bankAccountHidden;
            var bankName=req.body.bankNameSelect;
            var accountNumber=req.body.accountNumber;
            var accountCreatedDate=formatDate(req.body.accountCreatedDate);
            var creditTransaction;
            var debitTransaction;
            if(typeof(req.body.creditTransaction) == 'undefined' | req.body.creditTransaction == '' |  req.body.creditTransaction== 'NULL' ){
                creditTransaction = 0;
            }
            else {
                creditTransaction=req.body.creditTransaction;
            }
            if(typeof(req.body.debitTransaction) == 'undefined' | req.body.debitTransaction == '' |  req.body.debitTransaction== 'NULL' ){
                debitTransaction = 0;
            }
            else {
                debitTransaction=req.body.debitTransaction;
            }
            var anyInternalLoans=req.body.anyInternalLoansHidden;
            var clientIds =new Array();
            clientIds=(req.body.clientNames).split(",");
            var overdues=new Array();
            overdues=(req.body.overdues).split(",");

            for(var i =0; i<overdues.length;i++){
                if(overdues[i]=="true"){
                    overdues[i]=1;
                }else{
                    overdues[i]=0;
                }
            }

            customlog.info("groupId = "+groupId);
            customlog.info("groupCreatedDate = "+groupCreatedDate);
            customlog.info("lastActiveDate = "+lastActiveDate);
            customlog.info("savingsDiscussed = "+savingsDiscussed);
            customlog.info("completeAttendance = "+completeAttendance);
            customlog.info("bankAccount = "+bankAccount);
            customlog.info("bankName = "+bankName);
            customlog.info("accountNumber = "+accountNumber);
            customlog.info("accountCreatedDate = "+accountCreatedDate);
            customlog.info("creditTransaction = "+creditTransaction);
            customlog.info("debitTransaction = "+debitTransaction);
            customlog.info("anyInternalLoans = "+anyInternalLoans);
            customlog.info("clientIds = "+clientIds);
            customlog.info("overdues = "+overdues);
            var prosGroup= new prospectGroupObj();
            var prosClient= new prosClientObj();
            var preVerification= new preliminaryVerification();
            var constantsObj = this.constants;
            var remarksDisplay;
            prosGroup.clearAll();
            preVerification.clearAll();
            preVerification.setgroup_id(groupId);
            prosGroup.setGroup_created_date(groupCreatedDate);
            preVerification.setloan_active_from (lastActiveDate);
            preVerification.setis_savings_discussed (savingsDiscussed);
            preVerification.setis_complete_attendance (completeAttendance);
            preVerification.setis_bank_account (bankAccount);
            preVerification.setbank_name(bankName);
            preVerification.setaccount_number(accountNumber);
            preVerification.setaccount_created_date(accountCreatedDate);
            preVerification.setno_of_credit_transaction(creditTransaction);
            preVerification.setno_of_debit_transaction(debitTransaction);
            prosClient.setIs_internal_loan(anyInternalLoans);
            prosClient.setClientIds(clientIds);
            prosClient.setOverdues(overdues);

            self.androidRouter.verifyGroupCall(userId,prosGroup,preVerification,function(remarks) {
                remarksDisplay = remarks;
                //Submit Task
                    var data = {};
                    data.userId = userId;
                    data.tenantId = tenantId;
                    data.contactNumber = userContactNumber;
                    data.taskDescription = "Preliminary Verification ("+groupName+")";
                self.commonRouter.submitTaskService(req,res,data);
                //self.showPreliminaryVerification(res,prosGroup,office,prosClient);
                self.commonRouter.ListGroupsCall(tenantId,userId,officeId,roleId,constantsObj.getPreliminaryVerificationOperationId(),function(listGroupsIdArray,listGroupsArray,activeClients,neededInfo,isSynchronized,listGroupsGlobalNumberArray){
                    self.showSavedGroups(req, res,listGroupsIdArray,listGroupsArray,remarksDisplay,listGroupsGlobalNumberArray);
              });
            });
            }
        }catch(e){
            customlog.error("Exception while verify group "+e);
            self.showErrorPage(req,res);
        }
	},*/
	
	/*showKYC_Uploading : function(res,errorMsg,group_id,docTypeIdArray,docTypeNameArray,memberIdArray,memberNameArray) {
		res.render('kycUploading_form', {errorMsg:errorMsg,group_id:group_id,docTypeIdArray:docTypeIdArray,docTypeNameArray:docTypeNameArray,memberIdArray:memberIdArray,memberNameArray:memberNameArray, contextPath:props.contextPath});
    },*/
	
	/*KYC_UploadingCall: function(group_id,callback) {
		this.model.KYC_UploadingModel(group_id,callback);
	},*/
	
	/*KYC_Uploading: function(req,res,group_id) {
		try{
            var self = this;
            var tenantId = req.session.tenantId;
            var userId = req.session.userId;
            if(typeof tenantId == 'undefined' || typeof userId == 'undefined' || typeof req.session.operationId == 'undefined') {
                res.redirect(props.contextPath+'/client/ci/login');
            }
            else {
                if(typeof req.params.id != 'undefined') {
                var group_id = req.params.id;
                }
                customlog.info("group_id = "+group_id);
                var errMsg="";
                this.KYC_UploadingCall(group_id,function(group_id,docTypeIdArray,docTypeNameArray,memberIdArray,memberNameArray){
                    self.showKYC_Uploading(res,errMsg,group_id,docTypeIdArray,docTypeNameArray,memberIdArray,memberNameArray);
                });
            }
        }catch(e){
            customlog.error("Exception while Kyc uploading "+e);
            self.showErrorPage(req,res);
        }
	},*/
	
	/*
	showKYC_UploadingMenu : function(res,alertMsg,group_id,docTypeIdArray,docTypeNameArray,memberIdArray,memberNameArray) {
		res.render('kycUploadingMenu_form', {group_id:group_id,alertMsg:alertMsg,docTypeIdArray:docTypeIdArray,docTypeNameArray:docTypeNameArray,memberIdArray:memberIdArray,memberNameArray:memberNameArray, contextPath:props.contextPath});
    },*/
	
	
	/*KYC_UploadingMenu: function(req,res,group_id) {
		try{
            var self = this;
            var tenantId = req.session.tenantId;
            var userId = req.session.userId;
            if(typeof tenantId == 'undefined' || typeof userId == 'undefined' || typeof req.session.operationId == 'undefined') {
                res.redirect(props.contextPath+'/client/ci/login');
            }
            else {
            if(typeof req.params.id != 'undefined') {
                var group_id = req.params.id;
            }
            customlog.info("group_id = "+group_id);
            var alertMsg="";
            this.KYC_UploadingCall(group_id,function(group_id,docTypeIdArray,docTypeNameArray,memberIdArray,memberNameArray){
                self.showKYC_UploadingMenu(res,alertMsg,group_id,docTypeIdArray,docTypeNameArray,memberIdArray,memberNameArray);
            });
            }
        }catch(e){
            customlog.error("Exception while KYC Uploading menu "+e);
            self.showErrorPage(req,res);
        }
	},*/
	
	/*KYC_UploadingImageCall: function(client_id,doc_type_id,image,fileName,callback) {
		this.model.KYC_UploadingImageModel(client_id,doc_type_id,image,fileName,callback);
	},*/
	
	/*KYC_UploadingImage:function(req,res,group_id) {
		try{
            var self = this;
            var group_id;
            var tenantId = req.session.tenantId;
            var userId = req.session.userId;
            if(typeof tenantId == 'undefined' || typeof userId == 'undefined' || typeof req.session.operationId == 'undefined') {
                res.redirect(props.contextPath+'/client/ci/login');
            }
            else {
                if(typeof req.params.id != 'undefined') {
                    group_id = req.params.id;
                }
                var fs = require('fs'),
                util = require('util');
                var fileName=new Array();
                var filePath=new Array();
                var client_id=req.body.clientName;
                var doc_type_id=req.body.docType;
                var isMulitpleDoc=req.body.isMultipleDocument;
                var alertMsg="Image has been Successfully Uploaded !";
                customlog.info("Multiple Doc="+isMulitpleDoc);
                if(isMulitpleDoc=="true"){
                    customlog.info("inside true");
                    for(var i=0; i<req.files.multipleUploadDocument.length; i++){
                        fileName[i]=req.files.multipleUploadDocument[i].name;
                        filePath[i]=req.files.multipleUploadDocument[i].path;
                        var is = fs.createReadStream(req.files.multipleUploadDocument[i].path)
                        var os = fs.createWriteStream("client_documents/"+fileName[i]);
                        is.pipe(os);
                        is.on('end', function() {
                            customlog.info('Successfully uploaded');
                            alertMsg = "File has been Uploaded Successfully!"
                        });
                        fs.unlink(req.files.multipleUploadDocument[i].path, function(err){
                            if(err){ customlog.error('Error while unlinking '+err); }
                            else { customlog.error('Successfully unlinked');};
                        });
                        is.on('error', function(err) { customlog.error("error while uploading "+err); });
                    }
                }
                else if(isMulitpleDoc== "false"){
                fileName[0]=req.files.singleUploadDocument.name;
                    customlog.info("fileName="+fileName);
                    if(req.files.singleUploadDocument.name!=""){
                        var is = fs.createReadStream(req.files.singleUploadDocument.path)
                        var os = fs.createWriteStream("client_documents/"+req.files.singleUploadDocument.name);
                        is.pipe(os);
                        is.on('end', function() {
                            customlog.info('Successfully uploaded');
                            alertMsg = "File has been Uploaded Successfully!"
                        });
                        fs.unlink(req.files.singleUploadDocument.path, function(err){
                            if(err){ customlog.error('Error while unlinking '+err); }
                            else { customlog.error('Successfully unlinked');};
                        });
                        is.on('error', function(err) { customlog.error("error while uploading "+err); });
                    }
                }
                customlog.info("group_id="+group_id);
                customlog.info("client_id="+client_id);
                customlog.info("doc_type_id="+doc_type_id);
                customlog.info("fileName="+fileName);
                //customlog.info("filePath="+filePath);

                this.KYC_UploadingImageCall(client_id,doc_type_id,fileName,function(){

                });
                this.KYC_UploadingCall(group_id,function(group_id,docTypeIdArray,docTypeNameArray,memberIdArray,memberNameArray){
                    self.showKYC_UploadingMenu(res,alertMsg,group_id,docTypeIdArray,docTypeNameArray,memberIdArray,memberNameArray);
                });
            }
        }catch(e){
            customlog.error("Exception while kyc uploading image"+e);
            self.showErrorPage(req,res);
        }
	},*/
	
	showImageInsertedDetail : function(res) {
		res.render('imageDetail.jade', { layout: 'imageDetail.jade', title: 'Todo list', contextPath:props.contextPath});
	
    },
	
	/*// from captured image
	storeCapturedImageCall: function(client_id,doc_type_id,image,fileName,callback) {
		this.model.storeCapturedImageModel(client_id,doc_type_id,image,fileName,callback);
	},*/
	
	/*storeCapturedImage: function(req, res) {
		try{
            var self = this;
            customlog.info("Inside Store captured image");
            //customlog.info(req.body.base64Value);
            // var fs = require("fs");
            //fs.writeFile("arghhhh.png", new Buffer(req.body.imageBase64Value, "base64"),"binary", function(err) {});
            var client_id=req.body.clientNameValue;
            var doc_type_id=req.body.docTypeValue;
            var base64Image=req.body.imageBase64Value;
            var fileName=req.body.fileName;
            customlog.info(fileName);
            customlog.info(req.body.docTypeValue);
            this.storeCapturedImageCall(client_id,doc_type_id,req.body.imageBase64Value,fileName,function(group_id){
                customlog.info("groupId : "+group_id);
                self.KYC_Uploading(req,res,group_id);
            });
        }catch(e){
            customlog.error("Exception while store captured image "+e);
            self.showErrorPage(req,res);
        }
	},	*/
	
	/*storePreliminaryVerificationCapturedImageCall: function(groupId,doc_type_id,image,fileName,callback) {
		this.model.storePreliminaryVerificationCapturedImageModel(groupId,doc_type_id,image,fileName,callback);
	},*/
	
	/*storePreliminaryVerificationCapturedImage:function(req, res) {
		try{
            var self = this;
            customlog.info("Inside Store captured image");
            //customlog.info(req.body.base64Value);
            // var fs = require("fs");
            //fs.writeFile("arghhhh.png", new Buffer(req.body.imageBase64Value, "base64"),"binary", function(err) {});
            var groupId=req.body.groupIdValue;
            var doc_type_id=req.body.docTypeValue;
            var base64Image=req.body.imageBase64Value;
            var fileName=req.body.fileName;
            //var activityDetails = new Array(iklantPort, req.session.tenantId, req.session.userId, req.session.userName, req.originalUrl, req.connection.remoteAddress, "router.js", "storePreliminaryVerificationCapturedImage", "success", "storePreliminaryVerificationCapturedImage", "storePreliminaryVerificationCapturedImage");
            //self.commonRouter.insertActivityLogModel(activityDetails);

            customlog.info(fileName);
            customlog.info(req.body.docTypeValue);
            this.storePreliminaryVerificationCapturedImageCall(groupId,doc_type_id,req.body.imageBase64Value,fileName,function(group_id){
                customlog.info("groupId : "+group_id);
            });
            this.showPreliminaryVerificationCall(groupId,function(prosGroup,office,prosClient,docTypeIdArray,docTypeNameArray){
                self.showPreliminaryVerification(req,res,"Image has been Successfully Uploaded !",prosGroup,office,prosClient,docTypeIdArray,docTypeNameArray);
            });
        }catch(e){
            customlog.error("Exception while store preliminary verification captured image "+e);
            self.showErrorPage(req,res);
        }
	},	*/

	
	/*saveKycUploadcall: function(groupId,callback) {
		this.model.saveKycUploadModel(groupId,callback);
	},*/
	
	/*saveAssignFOcall: function(foName,assignGroupIds,callback) {
		this.model.saveAssignFOModel(foName,assignGroupIds,callback);
	}, */
	
	/*cca1RejectClientsCall : function(rejectedClientName,remarksToReject, roleId, callback) {
	  this.model.cca1RejectClientsModel(rejectedClientName,remarksToReject, roleId, callback)
    },
			
	cca1approvedGroupCall : function(rejectedClientName,approvedGroupName,callback) {
	  this.model.cca1approvedGroupModel(rejectedClientName,approvedGroupName,callback)	  
    },

	cca1rejectedGroupCall : function(approvedGroupName,callback) {
	  this.model.cca1rejectedGroupModel(approvedGroupName,callback)	  
    },*/
	
	/*showKYCUploading: function(req, res,listGroupsIdArray,listGroupsArray,activeClients,listGroupsGlobalNumberArray){
	  try{
          var self = this;
          operationNameArray = req.session.operationName;
          operationIdArray = req.session.operationId;
          var roleId = req.session.roleId;
          var userName = req.session.userName;
          var errorMessage = "";
          if(listGroupsIdArray.length !=0) {
            errorMessage = "";
          }
          else {
            errorMessage = "No groups to Display";
          }
            res.render('KYCUploading', {errorMessage:errorMessage, groupsName:listGroupsArray,
                            groupsId:listGroupsIdArray, operationNameArray:operationNameArray,
                            operationIdArray:operationIdArray,roleId:roleId,userName:userName,
                            listGroupsGlobalNumberArray:listGroupsGlobalNumberArray, contextPath:props.contextPath});
      }catch(e){
          customlog.error("Exception while show kyc uploading "+e);
          self.showErrorPage(req,res);
      }
	},*/
		
	/*saveKycUpload: function(req,res){
		try{
            var self = this;
            var constantsObj = this.constants;
            var tenantId = req.session.tenantId;
            var userId = req.session.userId;
            var officeId = req.session.officeId;
            var roleId = req.session.roleId;
            var groupId = req.params.groupId;

            if(typeof tenantId == 'undefined' || typeof userId == 'undefined' || typeof req.session.operationId == 'undefined') {
                res.redirect(props.contextPath+'/client/ci/login');
            }
            else {
                this.saveKycUploadcall(groupId,function(errorMsg){
                    if(errorMsg==""){
                        var activityDetails = new Array(iklantPort, req.session.tenantId, req.session.userId, req.session.userName, req.originalUrl, req.connection.remoteAddress, "router.js", "saveKycUpload", "success", "KYC Updating", "GroupId "+groupId+" KYC upload successfully","insert");
                        self.commonRouter.insertActivityLogModel(activityDetails);
                        self.commonRouter.ListGroupsCall(tenantId,userId,officeId,roleId,constantsObj.getKYCUploadingOperationId(),function(listGroupsIdArray,listGroupsArray,activeClients,neededInfo,isSynchronized,listGroupsGlobalNumberArray){
                            self.showKYCUploading(req, res,listGroupsIdArray,listGroupsArray,activeClients,listGroupsGlobalNumberArray);
                        });
                    }else{
                        self.KYC_UploadingCall(groupId,function(group_id,docTypeIdArray,docTypeNameArray,memberIdArray,memberNameArray){
                            self.showKYC_Uploading(res,errorMsg,group_id,docTypeIdArray,docTypeNameArray,memberIdArray,memberNameArray);
                        });
                    }
                });
            }
        }catch(e){
            customlog.error("Exception while save kyc upload "+e);
            self.showErrorPage(req,res);
        }
	},*/

	/*saveKycUploadForUploadImage: function(req,res){
		try{
            var self = this;
            var constantsObj = this.constants;
            var tenantId = req.session.tenantId;
            var userId = req.session.userId;
            var officeId = req.session.officeId;
            var roleId = req.session.roleId;
            var groupId = req.params.groupId;

            if(typeof tenantId == 'undefined' || typeof userId == 'undefined' || typeof req.session.operationId == 'undefined') {
                res.redirect(props.contextPath+'/client/ci/login');
            }
            else {
            this.saveKycUploadcall(groupId,function(errorMsg){
                if(errorMsg==""){
                    self.commonRouter.ListGroupsCall(tenantId,userId,officeId,roleId,constantsObj.getKYCUploadingOperationId(),function(listGroupsIdArray,listGroupsArray,activeClients,neededInfo,isSynchronized,listGroupsGlobalNumberArray){
                        self.showKYCUploading(req, res,listGroupsIdArray,listGroupsArray,activeClients,listGroupsGlobalNumberArray);
                    });
                }else{
                        self.KYC_UploadingCall(groupId,function(group_id,docTypeIdArray,docTypeNameArray,memberIdArray,memberNameArray){
                        self.showKYC_UploadingMenu(res,errorMsg,group_id,docTypeIdArray,docTypeNameArray,memberIdArray,memberNameArray);
                    });
                }
            });
            }
        }catch(e){
            customlog.error("Exception while save kyc upload for upload image "+e);
            self.showErrorPage(req,res);
        }
	},*/
	
	/*saveAssignFO: function(req,res){
		try{
            var self = this;
            var tenantId = req.session.tenantId;
            var userId = req.session.userId;
            if(typeof tenantId == 'undefined' || typeof userId == 'undefined' || typeof req.session.operationId == 'undefined') {
                res.redirect(props.contextPath+'/client/ci/login');
            }
            else {
                var foName = req.body.fieldOfficer;
                var assignGroupIds = new Array();
                assignGroupIds = req.body.assignGroupIdsHidden;
                customlog.info(assignGroupIds+"++++++++++++++++++++++");
                this.saveAssignFOcall(foName,assignGroupIds,function(status){
                    if(status == 'success'){
                        var activityDetails = new Array(iklantPort, req.session.tenantId, req.session.userId, req.session.userName, req.originalUrl, req.connection.remoteAddress, "router.js", "saveAssignFO", "success", "AssignFO", "GroupIds "+assignGroupIds+" are Assigned to "+foName+" Fo successfully","insert");
                        self.commonRouter.insertActivityLogModel(activityDetails);
                        res.redirect(props.contextPath+'/client/ci/groups');
                    }else{
                        self.showErrorPage();
                    }
                });
            }
        }catch(e){
            customlog.error("Exception while save assign fo "+e);
            self.showErrorPage(req,res);
        }
	},*/
	
	
	/*cca1: function(req, res) {
		try{
            var self = this;
            var tenantId = req.session.tenantId;
            var userId = req.session.userId;
            if(typeof tenantId == 'undefined' || typeof userId == 'undefined' || typeof req.session.operationId == 'undefined') {
                res.redirect(props.contextPath+'/client/ci/login');
            }
            else {
            var groupId = req.params.groupId;
            var errorfield = "";
            var fileLocation = "";
            var clientId = 0;
            var clientTotalWeightageRequired = req.body.clientTotalWeightageRequiredHiddenCCA1Name;
            customlog.info("cca1 Method weightage "+clientTotalWeightageRequired);
            self.commonRouter.ccaCall1(tenantId,groupId,function(groupId,unAppraisedClients,appraisedClientsObj,countOfRejectedClients){
            self.commonRouter.showCcaSummary(res,groupId,unAppraisedClients,appraisedClientsObj,countOfRejectedClients,clientTotalWeightageRequired,errorfield,clientId,fileLocation,"");
            });
          }
        }catch(e){
            customlog.error("Exception while cca1 "+e);
            self.showErrorPage(req,res);
        }
	},*/

    /*cca1RejectClients: function (req, res) {
        try{
            var self = this;
            var constantsObj = this.constants;
            var tenantId = req.session.tenantId;
            var userId = req.session.userId;
            var roleId = req.session.roleId;
            var pageName = (typeof req.body.pageName == 'undefined')?'':req.body.pageName;
            if (typeof tenantId == 'undefined' || typeof userId == 'undefined' || typeof req.session.operationId == 'undefined') {
                res.redirect(props.contextPath+'/client/ci/login');
            }
            else {
                var rejectedClientName = new Array();
                rejectedClientName = req.body.rejectedClientName;
                var remarksToReject = req.body.remarksToReject;
                this.cca1RejectClientsCall(rejectedClientName, remarksToReject, roleId, function (groupId, branchId) {
                    if (pageName == 'reintiateClient') {
                        req.params.operationId = constantsObj.getRejectedClientOperationId();
                        req.body.listoffice = branchId;
                        req.body.statusMessage = req.body.rejectedClient + " rejected successfully";
                        var activityDetails = new Array(iklantPort, req.session.tenantId, req.session.userId, req.session.userName, req.originalUrl, req.connection.remoteAddress, "router.js", "cca1RejectClients", "success", "Rejected Clients",  rejectedClientName+" : "+req.body.rejectedClient + " rejected successfully","insert");
                        self.commonRouter.insertActivityLogModel(activityDetails);
                        self.commonRouter.listGroupsOperation(req, res);
                    }
                    else {
                        self.commonRouter.groupAuthorizationClientCalculationCall(tenantId, groupId, function (groupId, unAppraisedClients, appraisedClientsObj, countOfRejectedClients,grtRating) {
                            if (appraisedClientsObj.getListClientIdArray().length != 0) {
                                if (roleId == constantsObj.getSMHroleId()) {
                                    var errorfield = req.body.rejectedClient + " rejected successfully";
                                    var clientTotalWeightageRequired = req.body.clientTotalWeightageRequiredHiddenCCA1Name;
                                    var activityDetails = new Array(iklantPort, req.session.tenantId, req.session.userId, req.session.userName, req.originalUrl, req.connection.remoteAddress, "router.js", "cca1RejectClients", "success", "Loan Authorization",  rejectedClientName+" : "+req.body.rejectedClient + " rejected successfully","insert");
                                    self.commonRouter.insertActivityLogModel(activityDetails);
                                    self.commonRouter.groupDetailsAuthorizationCall(tenantId, branchId, groupId, 0, function (prosGroupObj, preliminaryVerificationObj, capturedImageArray, docTypeIdArray) {
                                        self.commonRouter.showGroupDetailsForAuthorization(req, res, branchId, groupId, prosGroupObj, preliminaryVerificationObj, unAppraisedClients, appraisedClientsObj, clientTotalWeightageRequired, capturedImageArray, docTypeIdArray, '', '', '', errorfield,grtRating);
                                    });
                                }
                                else {
                                    var errorfield = req.body.rejectedClient + " rejected successfully";
                                    var fileLocation = "";
                                    var clientTotalWeightageRequired = req.body.clientTotalWeightageRequiredHiddenCCA1Name;
                                    var activityDetails = new Array(iklantPort, req.session.tenantId, req.session.userId, req.session.userName, req.originalUrl, req.connection.remoteAddress, "router.js", "cca1RejectClients", "success", "Appraisal",  rejectedClientName+" : "+req.body.rejectedClient + " rejected successfully","insert");
                                    self.commonRouter.insertActivityLogModel(activityDetails);
                                    self.commonRouter.showCcaSummary(res, groupId, unAppraisedClients, appraisedClientsObj, countOfRejectedClients, clientTotalWeightageRequired, errorfield, "", fileLocation, "");
                                }
                            }
                            else {
                                var officeId = req.session.officeId;
                                var activityDetails = new Array(iklantPort, req.session.tenantId, req.session.userId, req.session.userName, req.originalUrl, req.connection.remoteAddress, "router.js", "cca1RejectClients", "success", "Appraisal",  groupId + " rejected successfully","insert");
                                self.commonRouter.insertActivityLogModel(activityDetails);
                                self.commonRouter.ListGroupsCall(tenantId, userId, officeId, roleId, constantsObj.getAppraisalOperationId(), function (listGroupsIdArray, listGroupsArray, activeClients, neededInfo, isSynchronized, listGroupsGlobalNumberArray, fieldOfficerName, neededImageClarity) {
                                    self.commonRouter.showListGroupsOperations(req, res, constantsObj.getAppraisalOperationId(), listGroupsIdArray, listGroupsArray, activeClients, neededInfo, isSynchronized, listGroupsGlobalNumberArray, fieldOfficerName, neededImageClarity);
                                });
                            }
                        });
                    }
                });
            }
        }catch(e){
            customlog.error("Exception while cca1 rejected clients "+e);
            self.commonRouter.showErrorPage(req,res);
        }
    },*/

	/*cca1approveGroup: function(req, res) {
		try{
            var self = this;
            var tenantId = req.session.tenantId;
            var userId = req.session.userId;
            var roleId = req.session.roleId;
            if(typeof tenantId == 'undefined' || typeof userId == 'undefined' || typeof req.session.operationId == 'undefined') {
                res.redirect(props.contextPath+'/client/ci/login');
            }
            else {
                var currentgroupid = req.body.currentgroupid;
                var constantsObj = this.constants;
                var approvedGroupName = req.body.approvedGroupName;
                var rejectedClientName = new Array();
                rejectedClientName = req.body.rejectedClientName;
                self.cca1approvedGroupCall(rejectedClientName,approvedGroupName,function(groupId,branchId){
                    var message = req.body.groupName+" : "+req.body.centerName+" Appaised and Moved to Group Recognition Testing."
                    self.commonRouter.ccaCall1(tenantId,groupId,function(groupId,unAppraisedClients,appraisedClientsObj,countOfRejectedClients){
                        if(roleId == constantsObj.getSMHroleId()) {
                            self.synchronizeCall(currentgroupid,function(groupDetailsResultSet,clientDetailsResultSet,mifosClientStatus, rejectedClientsId){
                                if(mifosClientStatus == 1){
                                    var GroupCreationDetail = require(domainPath +"/GroupCreationDetail");
                                    var GroupCreationDetailObj = new GroupCreationDetail();
                                    this.GroupCreationDetailObj = GroupCreationDetailObj;
                                    var GroupCreationDetailObj = this.GroupCreationDetailObj; //object to store client and group details
                                    var customClientDetailObj = new Array();  //array to store list of client details
                                    for(var i=0;i<clientDetailsResultSet.length;i++){
                                        var ClientCreationDetail = require(domainPath +"/ClientCreationDetail");
                                        var ClientCreationDetailObj = new ClientCreationDetail();
                                        this.ClientCreationDetailObj = ClientCreationDetailObj;
                                        var ClientCreationDetailObj = this.ClientCreationDetailObj;
                                        ClientCreationDetailObj.setCustomerCustomNumber(clientDetailsResultSet[i].client_global_number);
										ClientCreationDetailObj.setClientId(clientDetailsResultSet[i].client_id);
                                        ClientCreationDetailObj.setFirstName(clientDetailsResultSet[i].firstName);
                                        ClientCreationDetailObj.setLastName(clientDetailsResultSet[i].lastName);
                                        ClientCreationDetailObj.setDateOfBirth(clientDetailsResultSet[i].dateOfBirth);
                                        ClientCreationDetailObj.setLine1(clientDetailsResultSet[i].line1);
                                        ClientCreationDetailObj.setLine2(clientDetailsResultSet[i].line2);
                                        ClientCreationDetailObj.setCity(clientDetailsResultSet[i].city);
                                        ClientCreationDetailObj.setState(clientDetailsResultSet[i].state);
                                        ClientCreationDetailObj.setZip(clientDetailsResultSet[i].zip);
                                        ClientCreationDetailObj.setPhoneNumber((clientDetailsResultSet[i].phoneNumber)?clientDetailsResultSet[i].phoneNumber:clientDetailsResultSet[i].landlineNumber);
                                        ClientCreationDetailObj.setFormedBy(clientDetailsResultSet[i].formedBy);
                                        ClientCreationDetailObj.setSalutation(clientDetailsResultSet[i].salutation);
                                        ClientCreationDetailObj.setMaritialStatus(clientDetailsResultSet[i].maritialStatus);
                                        ClientCreationDetailObj.setReligion(clientDetailsResultSet[i].religion);
                                        ClientCreationDetailObj.setEducationalQualification(clientDetailsResultSet[i].educationalQualification);
                                        ClientCreationDetailObj.setNationality(clientDetailsResultSet[i].nationality);
                                        ClientCreationDetailObj.setClientNameType(3);
                                        ClientCreationDetailObj.setGender(clientDetailsResultSet[i].gender);
                                        ClientCreationDetailObj.setPovertyStatus(clientDetailsResultSet[i].povertyStatus);
                                        ClientCreationDetailObj.setSpouseFatherFirstName(clientDetailsResultSet[i].spouseFatherFirstName);
                                        ClientCreationDetailObj.setSpouseFatherLastName(clientDetailsResultSet[i].spouseFatherLastName);
                                        ClientCreationDetailObj.setSpouseFatherNameType(clientDetailsResultSet[i].spouseFatherNameType);
                                        ClientCreationDetailObj.setLoanOfficerId(clientDetailsResultSet[i].formedBy);
                                        ClientCreationDetailObj.setOfficeId(clientDetailsResultSet[i].officeId);
                                        ClientCreationDetailObj.setLoanCounter(clientDetailsResultSet[i].loan_count);
                                        ClientCreationDetailObj.setMifosClientCustomerId(clientDetailsResultSet[i].mifos_client_customer_id);
                                        var questionIdArray = new Array(1,2,3,4,5,6,7,8,9,11,12,13,14,15); //additonal question id
                                        ClientCreationDetailObj.setQuestionId(questionIdArray);
                                        var valueArray = new Array();   //array to store additonal questions answers
                                        valueArray[0] = clientDetailsResultSet[i].rationCardNumber;
                                        valueArray[1] = clientDetailsResultSet[i].voterId;
                                        valueArray[2] = clientDetailsResultSet[i].caste;
                                        valueArray[3] = clientDetailsResultSet[i].isBankAccountAvailable;
                                        valueArray[4] = clientDetailsResultSet[i].isInsuranceAvailable;
                                        valueArray[5] = clientDetailsResultSet[i].asset;
                                        valueArray[6] = clientDetailsResultSet[i].ownHouse;
                                        valueArray[7] = clientDetailsResultSet[i].borrowersHouseholdIncome;
                                        valueArray[8] = clientDetailsResultSet[i].earningMembersInTheBorrowerFamily;
                                        valueArray[9] = clientDetailsResultSet[i].borrowersLoanRepaymentTrackRecord;
                                        valueArray[10] = clientDetailsResultSet[i].gasNumber;
                                        valueArray[11] = clientDetailsResultSet[i].aadhaarNumber;
                                        valueArray[12] = clientDetailsResultSet[i].otherId1;
                                        valueArray[13] = clientDetailsResultSet[i].otherId2;
                                        ClientCreationDetailObj.setvalue(valueArray);
                                        customClientDetailObj[i] = ClientCreationDetailObj;
                                    }
                                    GroupCreationDetailObj.setCustomClientCreationDetail(customClientDetailObj);
                                    GroupCreationDetailObj.setDisplayName(groupDetailsResultSet[0].displayName);
                                    GroupCreationDetailObj.setCustomerCustomNumber(groupDetailsResultSet[0].group_name);
									GroupCreationDetailObj.setExternalId("");
                                    GroupCreationDetailObj.setLoanOfficerId(groupDetailsResultSet[0].loanOfficerId);
                                    GroupCreationDetailObj.setCustomerStatus(9);
                                    GroupCreationDetailObj.setTrained(false);
                                    GroupCreationDetailObj.setTrainedOn(groupDetailsResultSet[0].mfiJoiningDate);
                                    GroupCreationDetailObj.setParentSystemId("");
                                    GroupCreationDetailObj.setOfficeId(groupDetailsResultSet[0].officeId);
                                    GroupCreationDetailObj.setMfiJoiningDate(groupDetailsResultSet[0].mfiJoiningDate);
                                    GroupCreationDetailObj.setActivationDate(groupDetailsResultSet[0].activationDate);
                                    GroupCreationDetailObj.setLine1(groupDetailsResultSet[0].line1);
                                    GroupCreationDetailObj.setLine2(groupDetailsResultSet[0].line2);
                                    GroupCreationDetailObj.setLine3(groupDetailsResultSet[0].line3);
                                    GroupCreationDetailObj.setCity(groupDetailsResultSet[0].city);
                                    GroupCreationDetailObj.setState(groupDetailsResultSet[0].state);
                                    GroupCreationDetailObj.setCountry(groupDetailsResultSet[0].country);
                                    GroupCreationDetailObj.setZip(groupDetailsResultSet[0].zip);
                                    GroupCreationDetailObj.setPhoneNumber(groupDetailsResultSet[0].phoneNumber);
                                    GroupCreationDetailObj.setRecurrenceType(groupDetailsResultSet[0].recurrenceType);
                                    GroupCreationDetailObj.setDayNumber(groupDetailsResultSet[0].dayNumber);
                                    GroupCreationDetailObj.setRecurAfter(groupDetailsResultSet[0].recureAfter);
                                    GroupCreationDetailObj.setMeetingPlace(groupDetailsResultSet[0].meetingPlace);
                                    GroupCreationDetailObj.setMeetingTime(groupDetailsResultSet[0].meetingTime);
                                    GroupCreationDetailObj.setGroupId(currentgroupid);
                                    GroupCreationDetailObj.setLoanCounter(groupDetailsResultSet[0].loan_count);
                                    GroupCreationDetailObj.setRejectedClientsId(rejectedClientsId);
                                    if(groupDetailsResultSet[0].mifos_customer_id == null && groupDetailsResultSet[0].loan_count == 1) {
                                        GroupCreationDetailObj.setMifosCustomerId(0);
                                    }else{
                                        GroupCreationDetailObj.setMifosCustomerId(groupDetailsResultSet[0].mifos_customer_id);
                                    }

                                    var GroupCreationDetail = JSON.stringify(GroupCreationDetailObj);
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
                                            'Content-Length' : Buffer.byteLength(GroupCreationDetail, 'utf8'),
                                            'Cookie' : req.session.mifosCookie
                                        };
                                        var options = {
                                            host: mifosServiceIP,
                                            port: mifosPort,
                                            path: '/mfi/api/customer/group/create/group.json',
                                            method: 'POST',
                                            headers : postheaders
                                        };
                                        rest.postJSON(options,GroupCreationDetail,function(statuscode,result,headers){
                                            customlog.info("statuscode" + statuscode);
                                            customlog.info("HEADERS:  "+headers)
                                            customlog.info("RESULT"+result.status);
                                            if(statuscode == 302) {
                                                res.redirect(props.contextPath+'/client/ci/logout');
                                            }
                                            else if(result.status == "success"){
                                                customlog.info("result.groupAccountId" + result.groupAccountId);
                                                var activityDetails = new Array(iklantPort, req.session.tenantId, req.session.userId, req.session.userName, req.originalUrl, req.connection.remoteAddress, "router.js", "cca1approveGroup", "success", "Loan Authorization",  req.body.groupName+" : "+req.body.centerName+" authorized successfully","insert");
                                                self.commonRouter.insertActivityLogModel(activityDetails);
                                                self.commonRouter.ListGroupsCall(tenantId,userId,branchId,roleId,constantsObj.getAuthorizeGroupOperationId(),function(listGroupsIdArray,listGroupsArray,activeClients,neededInfo,isSynchronized,listGroupsGlobalNumberArray,fieldOfficerName,neededImageClarity){
                                                    self.commonRouter.showListGroupsOperations(req, res,constantsObj.getAuthorizeGroupOperationId(),listGroupsIdArray,listGroupsArray,activeClients,branchId,isSynchronized,listGroupsGlobalNumberArray,fieldOfficerName,neededImageClarity);
                                                });
                                            } else {
                                                self.showErrorPage(req,res);
                                            }

                                        });
                                    }
                                }
                                else {
                                    self.showCustomErrorPage(req,res,"Mapping Error. Please contact IT team to proceed further.");
                                }
                            });
                        }
                        else {
                            var officeId = req.session.officeId;
                            var activityDetails = new Array(iklantPort, req.session.tenantId, req.session.userId, req.session.userName, req.originalUrl, req.connection.remoteAddress, "router.js", "cca1approveGroup", "success", "Appraisal", message,"insert");
                            self.commonRouter.insertActivityLogModel(activityDetails);
                            self.commonRouter.ListGroupsCall(tenantId,userId,officeId,roleId,constantsObj.getAppraisalOperationId(),function(listGroupsIdArray,listGroupsArray,activeClients,neededInfo,isSynchronized,listGroupsGlobalNumberArray,fieldOfficerName,neededImageClarity){
                                self.commonRouter.showListGroupsOperations(req, res,constantsObj.getAppraisalOperationId(),listGroupsIdArray,listGroupsArray,activeClients,neededInfo,isSynchronized,listGroupsGlobalNumberArray,fieldOfficerName,neededImageClarity,'','','','',message);
                            });
                        }
                    });
                });
            }
        }catch(e){
            customlog.error("Exception while cca1 approve group "+e);
            self.showErrorPage(req,res);
        }
	},*/

    /*cca1rejectGroup: function (req, res) {
        try{
            var self = this;
            var tenantId = req.session.tenantId;
            var userId = req.session.userId;
            var roleId = req.session.roleId;
            if (typeof tenantId == 'undefined' || typeof userId == 'undefined' || typeof req.session.operationId == 'undefined') {
                res.redirect(props.contextPath+'/client/ci/login');
            }
            else {
                var groupId = req.params.groupId;
                var constantsObj = this.constants;
                var approvedGroupName = req.body.approvedGroupName;
                this.cca1rejectedGroupCall(approvedGroupName, function (groupId, branchId) {
                    var message = req.body.groupName + " : " + req.body.centerName;
                    message += (req.body.membersCount < 5) ? " rejected due to group has less than five clients." : " rejected successfully.";
                    self.commonRouter.ccaCall1(tenantId, groupId, function (groupId, unAppraisedClients, appraisedClientsObj, countOfRejectedClients) {
                        if (roleId == constantsObj.getSMHroleId()) {
                            var activityDetails = new Array(iklantPort, req.session.tenantId, req.session.userId, req.session.userName, req.originalUrl, req.connection.remoteAddress, "router.js", "cca1rejectGroup", "success", "Loan Authorization",message,"update");
                            self.commonRouter.insertActivityLogModel(activityDetails);
                            self.commonRouter.ListGroupsCall(tenantId, userId, branchId, roleId, constantsObj.getAuthorizeGroupOperationId(), function (listGroupsIdArray, listGroupsArray, activeClients, neededInfo, isSynchronized, listGroupsGlobalNumberArray, fieldOfficerName, neededImageClarity) {
                                self.commonRouter.showListGroupsOperations(req, res, constantsObj.getAuthorizeGroupOperationId(), listGroupsIdArray, listGroupsArray, activeClients, branchId, isSynchronized, listGroupsGlobalNumberArray, fieldOfficerName, neededImageClarity);
                            });
                        }
                        else {
                            var officeId = req.session.officeId;
                            var activityDetails = new Array(iklantPort, req.session.tenantId, req.session.userId, req.session.userName, req.originalUrl, req.connection.remoteAddress, "router.js", "cca1rejectGroup", "success", "Appraisal",message,"update");
                            self.commonRouter.insertActivityLogModel(activityDetails);
                            self.commonRouter.ListGroupsCall(tenantId, userId, officeId, roleId, constantsObj.getAppraisalOperationId(), function (listGroupsIdArray, listGroupsArray, activeClients, neededInfo, isSynchronized, listGroupsGlobalNumberArray, fieldOfficerName, neededImageClarity) {
                                self.commonRouter.showListGroupsOperations(req, res, constantsObj.getAppraisalOperationId(), listGroupsIdArray, listGroupsArray, activeClients, neededInfo, isSynchronized, listGroupsGlobalNumberArray, fieldOfficerName, neededImageClarity, '', '', '', '', message);
                            });
                        }
                    });
                });
            }
        }catch(e){
            customlog.error("Exception while cca1 reject group "+e);
            self.commonRouter.showErrorPage(req,res);
        }
    },*/

	
	/*checkForAlreadyExistingmemberCall:function(tenantId,rationCardNumber,contactNumber,voterId,aadhaarNumber,callback){
		this.model.checkForAlreadyExistingmemberModel(tenantId,rationCardNumber,contactNumber,voterId,aadhaarNumber,callback);
	},
	
	checkForAlreadyExistingmember : function(req,res) {
		try{
            var self = this;
            var tenantId = req.session.tenantId;
            var rationCardNumber = req.body.rationCardNumber;
            var contactNumber = req.body.contactNumber;
            var voterId = req.body.voterId;
            var aadhaarNumber = req.body.aadhaarNumber;
            //var activityDetails = new Array(iklantPort, req.session.tenantId, req.session.userId, req.session.userName, req.originalUrl, req.connection.remoteAddress, "router.js", "checkForAlreadyExistingmember", "success", "checkForAlreadyExistingmember", "checkForAlreadyExistingmember");
            //self.commonRouter.insertActivityLogModel(activityDetails);
            this.checkForAlreadyExistingmemberCall(tenantId,rationCardNumber,contactNumber,voterId,aadhaarNumber,function(noOfClients,groupName,centerName,clientName){
                req.body.noOfClients = noOfClients;
                req.body.groupName = groupName;
                req.body.centerName = centerName;
                req.body.clientName = clientName;
                res.send(req.body);
            });
        }catch(e){
            customlog.error("Exception while checkForAlreadyExistingmember "+e);
            self.showErrorPage(req,res);
        }
	},*/
	
	/*listClientsForLoanSanctionCall:function(groupId,mifosCustomerId,callback){
		this.model.listClientsForLoanSanctionModel(groupId,mifosCustomerId,callback);
	},*/

	/*showLoanSanctionPage : function(res,groupId,mifosCustomerId,path,isSynchronized,thisclientId,clientNameArray,groupNameForLoanSanction,clientIdArray,productCategoryId,ProductCategoryType,officeId, docLanguage) {
	  res.render('LoanSanctionFileUpload', {groupId:groupId, mifosCustomerId:mifosCustomerId,thisclientId : thisclientId, clientNameArray : clientNameArray, groupNameForLoanSanction : groupNameForLoanSanction,
          clientIdArray : clientIdArray, productCategoryId : productCategoryId, ProductCategoryType : ProductCategoryType ,path:path, isSynchronized:isSynchronized,officeValue:officeId,docLanguage:docLanguage, contextPath:props.contextPath});
    },*/

	/*retrieveClientsForLS : function(req,res) {
		try{
            var groupId = req.params.id;
            var isSynchronized = req.params.isSynchronized;
            var mifosCustomerId = req.params.mifosCustomerId;
            var self = this;
            var tenantId = req.session.tenantId;
            var userId = req.session.userId;
            var officeId = (typeof req.body.branchName == 'undefined')?req.session.officeId:req.body.branchName;
            var docLanguage = req.body.docLanguage;
            if(typeof tenantId == 'undefined' || typeof userId == 'undefined' || typeof req.session.operationId == 'undefined') {
                res.redirect(props.contextPath+'/client/ci/login');
            }
            else {
                //var activityDetails = new Array(iklantPort, req.session.tenantId, req.session.userId, req.session.userName, req.originalUrl, req.connection.remoteAddress, "router.js", "retrieveClientsForLS", "success", "retrieveClientsForLS", "retrieveClientsForLS");
                //self.commonRouter.insertActivityLogModel(activityDetails);
                self.listClientsForLoanSanctionCall(groupId,mifosCustomerId,function(groupId,thisclientId,clientNameArray,groupNameForLoanSanction,clientIdArray,productCategoryId,ProductCategoryType,disbDate,globalAccountNum){
                    if(disbDate != '' || globalAccountNum != ''){
                        self.showLoanSanctionPage(res,groupId,mifosCustomerId,0,isSynchronized,thisclientId,clientNameArray,groupNameForLoanSanction,clientIdArray,productCategoryId,ProductCategoryType,officeId, docLanguage);
                    }
                    else{
                        self.showErrorPage(req,res);
                    }
            });
            }
        }catch(e){
            customlog.error("Exception while retrive clients for LS "+e);
            self.showErrorPage(req,res);
        }
	},*/
	
	/*synchronizedPageOnchange : function(req,res) {
		try{
            var requestedOperationId = req.params.operationId;
            var officeId = req.params.officeId;
            var self = this;
            var tenantId = req.session.tenantId;
            var userId = req.session.userId;
            var roleId = req.session.roleId;
            customlog.info("officeId : "+officeId);
            if(typeof tenantId == 'undefined' || typeof userId == 'undefined' || typeof req.session.operationId == 'undefined') {
                res.redirect(props.contextPath+'/client/ci/login');
            }
            else {
                this.commonRouter.ListGroupsCall(tenantId,userId,officeId,roleId,requestedOperationId,function(listGroupsIdArray,listGroupsArray,activeClients,neededInfo,isSynchronized,listGroupsGlobalNumberArray,fieldOfficerName,neededImageClarity,mifosCustomerId){
                    self.commonRouter.showListGroupsOperations(req, res,requestedOperationId,listGroupsIdArray,listGroupsArray,activeClients,neededInfo,isSynchronized,listGroupsGlobalNumberArray,fieldOfficerName,neededImageClarity,mifosCustomerId,'','',officeId);
                });
            }
        }catch(e){
            customlog.error("Exception while synchronizedPageOnchange "+e);
            self.showErrorPage(req,res);
        }
	},*/

	showPDF : function(res,path) {
		res.render('generatePDF',{path:path, contextPath:props.contextPath});
	},
	
	
	/*//Generate loan sanction form and kyc form from Synchronized page
	fileUploadFromSynchronized :  function(req,res) {
		try{
            var tenantId = req.session.tenantId;
            var userId = req.session.userId;
            var self = this;

            if(typeof tenantId == 'undefined' || typeof userId == 'undefined' || typeof req.session.operationId == 'undefined') {
                res.redirect(props.contextPath+'/client/ci/login');
            }
            else {
                var officeId = req.body.reqOfficeHidden;
                var docLanguage = (typeof req.body.docLanguage == 'undefined')?req.session.language:req.body.docLanguage;
                var mifosCustomerId = req.body.mifosCustomerIdHidden;
                var clientid = (req.body.clientidhidden).split(",");
                //var clientid = req.body.clientidhidden);
                var clientName = (req.body.clientnamehidden).split(",");
                var prdid = req.body.prdidhidden;
                var formType = req.body.formTypeName;
                //var activityDetails = new Array(iklantPort, req.session.tenantId, req.session.userId, req.session.userName, req.originalUrl, req.connection.remoteAddress, "router.js", "fileUploadFromSynchronized", "success", "fileUploadFromSynchronized", "fileUploadFromSynchronized");
                //self.commonRouter.insertActivityLogModel(activityDetails);
                if(formType == 1) {
                    self.commonRouter.KYCFileUploadForLoanSanctionCall(clientid,formType,mifosCustomerId,docLanguage,function(client_name,groupId,groupName,isSynchronized){
                        self.listClientsForLoanSanctionCall(groupId,mifosCustomerId,function(groupId,thisclientId,clientNameArray,groupNameForLoanSanction,clientIdArray,productCategoryId,ProductCategoryType,disbDate,globalAccountNum){

                        var path = "/GeneratedPDF/"+groupName+"_KYCform.pdf";
                        customlog.info("PATH : " + path);

                        setTimeout(self.showLoanSanctionPage(res,groupId,mifosCustomerId,path,isSynchronized,thisclientId,clientNameArray,groupNameForLoanSanction,clientIdArray,productCategoryId,ProductCategoryType,officeId,docLanguage),600000);
                    });
                    });
                }
                else if(formType == 2) {
                    self.commonRouter.KYCFileUploadForLoanSanctionCall(clientid,formType,mifosCustomerId,docLanguage,function(client_name,groupId,groupName,isSynchronized){
                        self.listClientsForLoanSanctionCall(groupId,mifosCustomerId,function(groupId,thisclientId,clientNameArray,groupNameForLoanSanction,clientIdArray,
                                                                                             productCategoryId,ProductCategoryType,disbDate,globalAccountNum,disbAmount,interestRateValue,recurrenceType){
                        customlog.info("\n");
                        customlog.info("groupName" + groupName);
                        self.loanDisbursementRouter.fileUploadForLoanSanctionCall(clientid,groupName,globalAccountNum,docLanguage, function(){
                        var path = "/GeneratedPDF/"+groupName+"_loanform.pdf";
                        customlog.info("PATH : " + path);

                            setTimeout(self.showLoanSanctionPage(res,groupId,mifosCustomerId,path,isSynchronized,thisclientId,clientNameArray,groupNameForLoanSanction,clientIdArray,productCategoryId,ProductCategoryType,officeId,docLanguage),600000);
                        });
                        });
                    });
                }
                else if(formType == 3) {
                    self.commonRouter.KYCFileUploadForLoanSanctionCall(clientid,formType,mifosCustomerId,docLanguage,function(client_name,groupId,groupName,isSynchronized){
                        self.listClientsForLoanSanctionCall(groupId,mifosCustomerId,function(groupId,thisclientId,clientNameArray,groupNameForLoanSanction,clientIdArray,
                                                                                             productCategoryId,ProductCategoryType,disbDate,globalAccountNum,disbAmount,interestRateValue,recurrenceType){
                            req.body.mifosCustomerId = mifosCustomerId;
                            req.body.syncDisbDate = disbDate;
                            req.body.mifosGlobalAccNo = globalAccountNum;
                            req.body.disbAmount = disbAmount;
                            req.body.interestRateValue = interestRateValue;
                            req.body.recurrenceType = recurrenceType;
                            self.commonRouter.generateLegalForm(req,res);
                            var path = "/GeneratedPDF/"+mifosCustomerId+"_legalform.pdf";
                            customlog.info("PATH : " + path);

                            setTimeout(self.showLoanSanctionPage(res,groupId,mifosCustomerId,path,isSynchronized,thisclientId,clientNameArray,groupNameForLoanSanction,clientIdArray,productCategoryId,ProductCategoryType,officeId,docLanguage),600000);
                        });
                    });
                }
                else if(formType == 4) {
                    self.commonRouter.KYCFileUploadForLoanSanctionCall(clientid,formType,mifosCustomerId,docLanguage,function(client_name,groupId,groupName,isSynchronized){
                        self.listClientsForLoanSanctionCall(groupId,mifosCustomerId,function(groupId,thisclientId,clientNameArray,groupNameForLoanSanction,clientIdArray,
                                                                                             productCategoryId,ProductCategoryType,disbDate,globalAccountNum,disbAmount,interestRateValue,recurrenceType){
                            req.body.mifosCustomerId = mifosCustomerId;
                            req.body.mifosGlobalAccNo = globalAccountNum;
                            req.body.syncDisbDate = disbDate;
                            self.commonRouter.generatePromissoryNote(req,res);
                            var path = "/GeneratedPDF/"+mifosCustomerId+"_promissoryNote.pdf";
                            customlog.info("PATH : " + path);

                            setTimeout(self.showLoanSanctionPage(res,groupId,mifosCustomerId,path,isSynchronized,thisclientId,clientNameArray,groupNameForLoanSanction,clientIdArray,productCategoryId,ProductCategoryType,officeId,docLanguage),600000);
                        });
                    });
                }
                else if(formType == 5) {
                    self.commonRouter.KYCFileUploadForLoanSanctionCall(clientid,formType,mifosCustomerId,docLanguage,function(client_name,groupId,groupName,isSynchronized){
                        self.listClientsForLoanSanctionCall(groupId,mifosCustomerId,function(groupId,thisclientId,clientNameArray,groupNameForLoanSanction,clientIdArray,productCategoryId,ProductCategoryType,disbDate,globalAccountNum,disbAmount,interestRateValue,recurrenceType,subLeaderNameArray,clientCodeArray){
                            req.body.mifosCustomerId = mifosCustomerId;
                            req.body.mifosGlobalAccNo = globalAccountNum;
                            req.body.syncDisbDate = disbDate;
                            req.body.subLeaderNameArray = subLeaderNameArray;
                            req.body.clientCodeArray = clientCodeArray;
                            self.commonRouter.generateLoanScheduleForm(req,res);
                            var path = "/GeneratedPDF/"+mifosCustomerId+"_loanRepaymentSchedule.pdf";
                            customlog.info("PATH : " + path);
                            setTimeout(self.showLoanSanctionPage(res,groupId,mifosCustomerId,path,isSynchronized,thisclientId,clientNameArray,groupNameForLoanSanction,clientIdArray,productCategoryId,ProductCategoryType,officeId,docLanguage),600000);
                        });
                    });
                }
                else if(formType == 6) {
                    self.commonRouter.KYCFileUploadForLoanSanctionCall(clientid,formType,mifosCustomerId, docLanguage,function(client_name,groupId,groupName,isSynchronized){
                        self.listClientsForLoanSanctionCall(groupId,mifosCustomerId,function(groupId,thisclientId,clientNameArray,groupNameForLoanSanction,clientIdArray,
                                                                                             productCategoryId,ProductCategoryType,disbDate,globalAccountNum,disbAmount,interestRateValue,recurrenceType){
                            req.body.mifosCustomerId = mifosCustomerId;
                            req.body.mifosGlobalAccNo = globalAccountNum;
                            req.body.syncDisbDate = disbDate;
                            self.commonRouter.generateReceiptForm(req,res);
                            var path = "/GeneratedPDF/"+mifosCustomerId+"_receiptForm.pdf";
                            customlog.info("PATH : " + path);

                            setTimeout(self.showLoanSanctionPage(res,groupId,mifosCustomerId,path,isSynchronized,thisclientId,clientNameArray,groupNameForLoanSanction,clientIdArray,productCategoryId,ProductCategoryType,officeId,docLanguage),600000);
                        });
                    });
                }
            }
        }catch(e){
            customlog.error("Exception while fileUploadFromSynchronized "+e);
            self.showErrorPage(req,res);
        }
	},*/
	
	/*//Ramya
	showLoanSanctionGroups: function(req, res) {
		try{
            var self = this;
            var constantsObj = this.constants;
            var tenantId = req.session.tenantId;
            var userId = req.session.userId;
            var officeId = req.session.officeId;
            var roleId = req.session.roleId;
            self.commonRouter.ListGroupsCall(tenantId,userId,officeId,roleId,constantsObj.getLoanSanctionOperationId(),function(listGroupsIdArray,listGroupsArray,activeClients,neededInfo,isSynchronized,listGroupsGlobalNumberArray,fieldOfficerName,neededImageClarity){
                self.commonRouter.showListGroupsOperations(req, res,constantsObj.getLoanSanctionOperationId(),listGroupsIdArray,listGroupsArray,activeClients,neededInfo,isSynchronized,listGroupsGlobalNumberArray,fieldOfficerName,neededImageClarity);
              });
        }catch(e){
            customlog.error("Exception while showLoanSanctionGroups "+e);
            self.showErrorPage(req,res);
        }
	},*/

	
	/*synchronizeCall: function(groupId,callback){
		this.model.synchronizeModel(groupId,callback);
	},*/

	/*synchronize :function(req, res) {
		try{
            var self = this;
            var tenantId = req.session.tenantId;
            var userId = req.session.userId;
            if(typeof tenantId == 'undefined' || typeof userId == 'undefined' || typeof req.session.operationId == 'undefined') {
                res.redirect(props.contextPath+'/client/ci/login');
            }
            else {
                customlog.info("Inside synchronize");
                var groupId = req.params.groupId;
                self.synchronizeCall(groupId,function(){
                    self.showLoanSanctionGroups(req, res);
                });
            }
        }catch(e){
            customlog.error("Exception while synchronize "+e);
            self.commonRouter.showErrorPage(req,res);
        }
	},	*/

	showAndroidUploadingImage : function(res) {
		var http = require('http');
		var HTTPStatus = require('http-status');
		customlog.info(HTTPStatus[200]);
		customlog.info("sending response");
		res.send(HTTPStatus[200]);
		res.end();
    },

	//have to be removed once LR android app is completed.
	showFromAndroidkycUploadingImage : function(res) {
		var http = require('http');
		var HTTPStatus = require('http-status');
		customlog.info(HTTPStatus[200]);
		res.send(HTTPStatus[200]);
		//res.end();
    },

	FromAndroidkycUploadingImage:function(req,res) {
		customlog.info('In Uploading!');
		var self = this;
		if(typeof req.params.id != 'undefined') {
		var group_id = req.params.id;
		}	
		var alertMsg="Image has been Successfully Uploaded !";
		var details = req.files.uploadDocument.name.split("*");
		customlog.info("received: "+details);
		customlog.info(details[0]+","+details[1]+","+details[2]+","+details[3]+","+details[4]+","+details[5]+","+details[6]);
		
		var doc_name = details[0]+"_"+details[3]+"_"+details[2]+"_"+getCurrentTimeStamp();
		var group_id = details[0];
		var client_id = details[1];
		var doc_type_id = details[2];
		var captured_image = "documents/client_documents/"+doc_name+".jpg";
		var tenant_id = details[4];
		var user_id = details[5];
		var contactNumber = details[6];
		////customlog.info("doc_name : "+doc_name);
		//customlog.info("FilePath= "+req.files.uploadDocument.path);
		//customlog.info("FileName= "+req.files.uploadDocument.name);
		if(req.files.uploadDocument.name!=""){
			var fs1=require('fs');
			var util = require('util');
			var is = fs1.createReadStream(req.files.uploadDocument.path)
			var os = fs1.createWriteStream(rootPath+"/documents/client_documents/"+doc_name+".jpg");
				is.pipe(os);
				is.on('end', function() {
					customlog.info('Successfully uploaded');
				});
				fs1.unlink(req.files.uploadDocument.path, function(err){
					if(err){ customlog.error('Error while unlinking '+err); }
					else { customlog.error('Successfully unlinked');};
				}); 
				is.on('error', function(err) { customlog.error("error while uploading "+err); });
			
			customlog.info(client_id +  doc_type_id + doc_name + captured_image +"   " + group_id);
            //var activityDetails = new Array(iklantPort, req.session.tenantId, req.session.userId, req.session.userName, req.originalUrl, req.connection.remoteAddress, "router.js", "FromAndroidkycUploadingImage", "success", "FromAndroidkycUploadingImage", "FromAndroidkycUploadingImage");
            //self.commonRouter.insertActivityLogModel(activityDetails);
			self.insertdocumentDetailsCall(captured_image,client_id,doc_type_id,doc_name,group_id,function(flag){
				//Submit Task
				var data = {};
				data.userId = user_id;
				data.tenantId = tenant_id;
				data.contactNumber = contactNumber;
				data.taskDescription = "KYC Uploading ("+details[3]+")";
                self.commonRouter.submitTaskService(req,res,data);
			self.showFromAndroidkycUploadingImage(res);
			});	
		}
	},

	/*generateReportCall : function(startdate,enddate,statusId,officeId,userId,callback) {
		this.model.generateReportModel(startdate,enddate,statusId,officeId,userId,callback);
	},

    // Modified @ Paramasivan
	generateReport : function(req,res) {
		try{
            var self = this;
            var constantsObj = this.constants;
            var tenantId = req.session.tenantId;
            var userId = req.session.userId;
            var officeId = req.body.listoffice;
            var roleId = req.session.roleId;
            var statusId = req.body.statusdesc;
            var finYearId = req.body.finYearId;
            var startdate = req.body.fromdateValue;
            var enddate   = req.body.todateValue;
            var download_report = req.body.report_download_flag;
            var download_report_msg = "";

            if(typeof(officeId) == 'undefined'){
                officeId = (roleId == constantsObj.getSMHroleId()||roleId == constantsObj.getAMHroleId())?-1:req.session.officeId;
            }
            self.reportManagementCall(tenantId,officeId,userId,function(statusIdArray,statusArray,finResult,ledgerResult,prdOfferingIdArray,prdOfferingNameArray,prdCategoryIdArray,
                                                                 prdCategoryNameArray,personnelIdArray, personnelNameArray){
                self.commonRouter.retriveOfficeCall(tenantId,userId,function(officeIdArray,officeNameArray,officeAddressArray,officeShortNameArray) {
                    self.generateReportCall(startdate,enddate,statusId,officeId,userId,function(offNameArray, groupNameArray, centerNameArray, globalAccountNumberArray, createdDateArray, bdeArray, fieldOfficerArray, totalNoOfClientsArray, noOfActiveClientsArray, noOfRejectedClientsArray, statusDescArray,loanCountArray, fileLocation){
                        self.getFinancialYearLoadHolder(finResult,function(FinancialYearLoadHolder){
                            if(download_report == 'Download' &&  offNameArray.length == 0){
                                download_report_msg = "No Records";
                            }else if(download_report == 'Download'){
                                download_report_msg = "Download";
                            }
                            req.session.tenantId = tenantId;
                            res.render('groupsInVariousStages',{offNameArray : offNameArray, groupNameArray : groupNameArray, centerNameArray : centerNameArray ,globalAccountNumberArray : globalAccountNumberArray,
                                createdDateArray : createdDateArray, bdeArray : bdeArray, fieldOfficerArray : fieldOfficerArray,totalNoOfClientsArray : totalNoOfClientsArray ,noOfActiveClientsArray :noOfActiveClientsArray ,
                                noOfRejectedClientsArray : noOfRejectedClientsArray, statusDescArray : statusDescArray ,fileLocation:fileLocation,download_report:download_report_msg,
                                statusIdArray:statusIdArray,startDate:startdate,endDate:enddate,statusArray:statusArray,officeNameArray:officeNameArray,loanCountArray:loanCountArray,
                                officeIdArray:officeIdArray,officeValue:officeId,statusDescValue:statusId,roleId:roleId,constantsObj:constantsObj,FinancialYearLoadHolder:FinancialYearLoadHolder,finYearId:finYearId, contextPath:props.contextPath,roleIds:req.session.roleIds});
                        });
                    });
                });
            });
        }catch(e){
            customlog.error("Exception while generate report "+e);
            self.showErrorPage(req,res);
        }
	},*/
	
	/*//Equifax Report[Adarsh]
	showEquifaxReportScreen : function(res,groupIdArray,groupNameArray,centerNameArray){
		customlog.info("inside showEquifaxReportScreen");
		res.render('equifaxReportView',{groupIdArray:groupIdArray,groupNameArray:groupNameArray,centerNameArray:centerNameArray, contextPath:props.contextPath});
	},

	generateEquifaxReportCall : function(tenantId,userId,officeId,callback) {
		this.model.generateEquifaxReportModel(tenantId,userId,officeId,callback);
	},

	generateEquifaxReport :function(req,res) {
		try{
            customlog.info("inside generate");
            var self = this;
            var tenantId = req.session.tenantId;
            var userId = req.session.userId;
            var roleId = req.session.roleId;
            var roleIds = req.session.roleIds;
            var constantsObj = this.constants;
            var officeId = (roleId == constantsObj.getSMHroleId() || roleIds.indexOf(constantsObj.getCCEroleId())>-1)?-1:req.session.officeId;

            if(typeof tenantId == 'undefined' || typeof userId == 'undefined') {
                res.redirect(props.contextPath+'/client/ci/login');
            }
            else {
                self.generateEquifaxReportCall(tenantId,userId,officeId,function(groupIdArray,groupNameArray,centerNameArray){
                    self.showEquifaxReportScreen(res,groupIdArray,groupNameArray,centerNameArray);
                });
            }
        }catch(e){
            customlog.error("Exception while generateEquifaxReport "+e);
            self.showErrorPage(req,res);
        }
	},

	showEquifaxReportClientsScreen : function(res,groupName,centerName,clientIdArray,clientNameArray){
		customlog.info("inside showEquifaxReportScreenClients");
		res.render('equifaxReportViewClients',{groupName:groupName,centerName:centerName,clientIdArray:clientIdArray,clientNameArray:clientNameArray, contextPath:props.contextPath});
	},

	generateEquifaxReportClientsCall : function(tenantId,groupId,callback) {
		this.model.generateEquifaxReportClientsModel(tenantId,groupId,callback);
	},

	generateEquifaxReportClients :function(req,res) {
		try{
            customlog.info("inside generate clients");
            var self = this;
            var tenantId = req.session.tenantId;
            var userId = req.session.userId;
            var officeId = req.session.officeId;
            var roleId = req.session.roleId;
            var groupId = req.params.groupId;
            if(typeof tenantId == 'undefined' || typeof userId == 'undefined') {
                res.redirect(props.contextPath+'/client/ci/login');
            }
            else {
                //var activityDetails = new Array(iklantPort, req.session.tenantId, req.session.userId, req.session.userName, req.originalUrl, req.connection.remoteAddress, "router.js", "generateEquifaxReportClients", "success", "generateEquifaxReportClients", "generateEquifaxReportClients");
                //self.commonRouter.insertActivityLogModel(activityDetails);
                self.generateEquifaxReportClientsCall(tenantId,groupId,function(groupName,centerName,clientIdArray,clientNameArray){
                    self.showEquifaxReportClientsScreen(res,groupName,centerName,clientIdArray,clientNameArray);
                });
            }
        }catch(e){
            customlog.error("Exception while generateEquifaxReportClients "+e);
            self.showErrorPage(req,res);
        }
	}, 
	
	downloadClientEquifaxReportScreen : function(res,fileLocation){
		try{
            var self = this;
            customlog.info("fileLocation="+fileLocation);
            var fileName = fileLocation.split("/");
            //var activityDetails = new Array(iklantPort, req.session.tenantId, req.session.userId, req.session.userName, req.originalUrl, req.connection.remoteAddress, "router.js", "downloadClientEquifaxReportScreen", "success", "Reports management- Equifax", "downloadClientEquifaxReportScreen");
            //self.commonRouter.insertActivityLogModel(activityDetails);
            res.download(fileLocation,fileName[1], function(err){
              if (err) {
                customlog.info(err);
              } else {
                // decrement a download credit etc
              }
            });
            //res.download(fileLocation);
        }catch(e){
            customlog.error("Exception while downloadClientEquifaxReportScreen "+e);
            self.showErrorPage(req,res);
        }
	},*/
	/*downloadRequstedImageCall : function(tenantId,clientId,docId,callback) {
		this.model.downloadRequstedImageModel(tenantId,clientId,docId,callback);
	},*/

	/*//generic function to retrieve file location for documents
	downloadRequstedImage : function(req,res){
		try{
            customlog.info("inside clientsdocuments download");
            var self = this;
            var tenantId = req.session.tenantId;
            var userId = req.session.userId;
            var officeId = req.session.officeId;
            var roleId = req.session.roleId;
            var clientId = req.params.clientId;//selected clientId
            var docId = req.params.docId;//selected docTypeId
            var statusId = req.body.statusId;
            var operationid = req.session.operationId;
            //from cca2 jade Adarsh-Modified
            var selectedOfficeId = req.body.selectedOfficeIdName;
            var redirectValue = req.body.redirectValueName;
            var centerNameCCA1 = req.body.centerName;
            var centerNameCCA2 = req.body.centerNameHidden;
            var clientRatingPerc = req.body.clientRatingPercName;
            var clientTotalWeightage = req.body.clientTotalWeightageName;
            var totalWeightage = req.body.totalWeightageHiddenName;
            var errorfield = "";
            //from loanSanction docVerification
            var iklantGroupId = req.body.iklantGroupIdHiddenDocVer;
            var isSynchronized = req.body.isSynchronizedHiddenDocVer;
            var mifosCustomerId = req.body.mifosCustomerIdHiddenDocVer;
            var docVerificationFlag = req.body.docVerificationFlagHidden;
            var clientLoanCount = req.body['clientLoanCount_'+clientId];
            //End
            var groupid = req.body.groupnamefordownload;
            req.session.branchId = req.body.brchid;
            customlog.info("clientID=" + clientId);
            customlog.info("docId="+ docId);
            customlog.info("groupId= " + groupid);
            customlog.info("operationid= " + operationid);
            var constantsObj = this.constants;
            if(typeof tenantId == 'undefined' || typeof userId == 'undefined') {
                res.redirect(props.contextPath+'/client/ci/login');
            }
            else {
                //var activityDetails = new Array(iklantPort, req.session.tenantId, req.session.userId, req.session.userName, req.originalUrl, req.connection.remoteAddress, "router.js", "downloadRequstedImage", "success", "downloadRequstedImage", "downloadRequstedImage");
                //self.commonRouter.insertActivityLogModel(activityDetails);
                    self.groupManagementRouter.downloadRequstedImageCall(tenantId,clientId,docId,function(fileLocation){
                    //self.downloadUploadedImages(req,res,tenantId,clientId,fileLocation,operationid,groupid,selectedOfficeId,redirectValue,centerNameCCA1,centerNameCCA2,clientRatingPerc,clientTotalWeightage,totalWeightage);
                    //if(operationid == constantsObj.getAuthorizeGroupOperationId()){
                    if(typeof operationid != 'undefined' && operationid.indexOf(constantsObj.getAuthorizeGroupOperationId()) > -1) {
                        //for smh role
                        var branchId = req.session.branchId;
                        var ccaRedirectVal =req.body.ccaRedirectHiddenName;
                        if(ccaRedirectVal == 1){
                            var totalWeightage =req.body.totalWeightageHiddenName;
                            self.commonRouter.groupDetailsAuthorizationCall(tenantId,branchId,groupid,clientId,function(prosGroupObj,preliminaryVerificationObj,capturedImageArray,docTypeIdArray){
                            self.commonRouter.groupAuthorizationClientCalculationCall(tenantId,groupid,function(groupId,unAppraisedClients,appraisedClientsObj,countOfRejectedClients,grtRating){
                            self.commonRouter.showGroupDetailsForAuthorization(req,res,branchId,groupId,prosGroupObj,preliminaryVerificationObj,unAppraisedClients,appraisedClientsObj,totalWeightage,capturedImageArray,docTypeIdArray,clientId,fileLocation,docId,errorfield,grtRating);
                            });
                            });
                        }else if(ccaRedirectVal==2){
                            var clientTotalWeightageRequired =req.body.clientTotalWeightageRequiredHiddenCCA2Name;
                            self.listQuestionsCCACall(tenantId,clientId,clientLoanCount,function(clientName,questionsObj,choicesanswerObj,choicesObj,capturedImageArray,docTypeIdArray){
                                self.showCCAQuestions(req,res,groupid,selectedOfficeId,redirectValue,clientId,clientName,centerNameCCA2,clientRatingPerc,clientTotalWeightage,clientTotalWeightageRequired,questionsObj,choicesanswerObj,choicesObj,capturedImageArray,docTypeIdArray,errorfield,clientLoanCount,statusId);
                            });
                        }
                    }
                    else if(typeof operationid != 'undefined' && operationid == constantsObj.getFieldVerificationOperationId()){
                        //for fieldofficer role
                        self.commonRouter.retrieveFieldVerificationDetailsCall(clientId,function(thisclientId,client_name,clientNameArray,groupName,clientIdArray,prospectClientPersonalObj,prospectClientGuarantorObj,prospectClientHouseDetailObj,prospectClientBankDetailObj,loanCounter){
                            self.commonRouter.lookUpEntityCall(function(lookupEntityObj){
                                self.commonRouter.retrieveDocTypeList(tenantId,function(docTypeIdArray,docTypeNameArray){
                                    self.commonRouter.showFieldVerificationDetails(req,res,thisclientId,client_name,clientNameArray,groupName,clientIdArray,prospectClientPersonalObj,prospectClientGuarantorObj,prospectClientHouseDetailObj,prospectClientBankDetailObj,lookupEntityObj,docTypeIdArray,docTypeNameArray,errorfield,fileLocation,docId,loanCounter);
                                });
                            });
                        });
                    }
                    else {
                        //for cca BM role
                        var ccaRedirectVal =req.body.ccaRedirectHiddenName;
                        if(ccaRedirectVal == 1){
                            var clientTotalWeightageRequired =req.body.clientTotalWeightageRequiredHiddenCCA1Name;
                            self.commonRouter.ccaCall1(tenantId,groupid,function(groupId,unAppraisedClients,appraisedClientsObj,countOfRejectedClients){
                                self.commonRouter.showCcaSummary(res,groupId,unAppraisedClients,appraisedClientsObj,countOfRejectedClients,clientTotalWeightageRequired,errorfield,clientId,fileLocation,docId, statusId);
                            });
                        }
                        else if(ccaRedirectVal==2){
                            var clientTotalWeightageRequired =req.body.clientTotalWeightageRequiredHiddenCCA2Name;
                            self.listQuestionsCCACall(tenantId,clientId,clientLoanCount,function(clientName,questionsObj,choicesanswerObj,choicesObj,capturedImageArray,docTypeIdArray){
                                self.showCCAQuestions(req,res,groupid,selectedOfficeId,redirectValue,clientId,clientName,centerNameCCA2,clientRatingPerc,clientTotalWeightage,clientTotalWeightageRequired,questionsObj,choicesanswerObj,choicesObj,capturedImageArray,docTypeIdArray,errorfield,clientLoanCount,statusId);
                            });
                        }
                        else if(ccaRedirectVal==3){
                            var clientTotalWeightageRequired =req.body.clientTotalWeightageRequiredHiddenCCA1Name;
                            self.commonRouter.retrieveIdleClientsCall(tenantId,groupid,statusId,function(groupId,unAppraisedClients,appraisedClientsObj,countOfRejectedClients,isIdle, noOfIdleDays, lastCreditCheckDate){
                                self.commonRouter.showIdleClientsSummary(res,groupid,unAppraisedClients,appraisedClientsObj,countOfRejectedClients,clientId,clientTotalWeightageRequired,errorfield,fileLocation,docId,isIdle, noOfIdleDays, lastCreditCheckDate, statusId);
                            });
                        }
                        else{
                            //for loan Sanction Doc Verification
                            self.commonRouter.retrieveDocTypeList(tenantId,function(docTypeIdArray,docTypeNameArray){
                                self.docVerificationCall(iklantGroupId,docVerificationFlag,function(centerName,clientIdArray,clientNameArray,clientLoanCountArray) {
                                    self.showDocVerification(req,res,clientId,mifosCustomerId,isSynchronized,iklantGroupId,centerName,clientIdArray,clientNameArray,docTypeIdArray,docTypeNameArray,docId,fileLocation,docVerificationFlag,clientLoanCountArray);
                                });
                            });
                        }
                    }
                });
            }
        }catch(e){
            customlog.error("Exception while downloadRequstedImage "+e);
            self.showErrorPage(req,res);
        }
	},
	
	//generic function to download docs from path
	downloadDocs:function(req,res) {
		try{
            var self = this;
            var fs = require('fs');
            var selectedDocLocation = req.body.selectedDocName;
            customlog.info("selectedDocLocation= "+selectedDocLocation);
            if(typeof selectedDocLocation != "undefined"){
                var docName = selectedDocLocation.split("/");
                if(docName.length > 1){
                    res.download(selectedDocLocation,docName[docName.length-1], function(err){
                        if (err) {
                            customlog.error(err);
                        } else {
                           customlog.info(selectedDocLocation);
                           var docNameArray = selectedDocLocation.split('/');
                           customlog.info(docNameArray);
                           for(var i=0; i<docNameArray.length-1;i++ ){
                               if(docNameArray[i]=="report_documents" || docNameArray[i]=="voucher_documents"){
                                   fs.unlink(selectedDocLocation);
                               }
                            }
                        }
                    });
                }else{
                    customlog.error(selectedDocLocation +" not found");
                    self.showErrorPage(req,res);
                }
            }
        }catch(e){
            customlog.error("Exception while downloadDocs "+e);
            self.showErrorPage(req,res);
        }
	},
	
	downloadClientEquifaxReportCall : function(tenantId,clientId,callback) {
		this.model.downloadClientEquifaxReportModel(tenantId,clientId,callback);
	},

	downloadClientEquifaxReport :function(req,res) {
		try{
            customlog.info("inside generate clients");
            var self = this;
            var tenantId = req.session.tenantId;
            var userId = req.session.userId;
            var officeId = req.session.officeId;
            var roleId = req.session.roleId;
            var clientId = req.params.clientId;
            if(typeof tenantId == 'undefined' || typeof userId == 'undefined') {
                res.redirect(props.contextPath+'/client/ci/login');
            }
            else {
                self.downloadClientEquifaxReportCall(tenantId,clientId,function(fileLocation){
                    self.downloadClientEquifaxReportScreen(res,fileLocation);
                });
            }
        }catch(e){
            customlog.error("Exception while downloadClientEquifaxReport "+e);
            self.showErrorPage(req,res);
        }
	},
	
	//End By Adarsh

    *//* Added by chitra for existing user check  *//*
    checkExistingUserCall:function(user_name,callback){
         this.model.checkExistingUserModel(user_name,callback);
    },
*/
    /*showDashBoard : function(req,res,dashBoardObject,officeIdArray,officeNameArray,officeId) {
        try{
            var self = this;
            var constantsObj = this.constants;
            var roleId = req.session.roleId;
            //var activityDetails = new Array(iklantPort, req.session.tenantId, req.session.userId, req.session.userName, req.originalUrl, req.connection.remoteAddress, "router.js", "showDashBoard", "success", "Dashboard", "showDashBoard");
            //self.commonRouter.insertActivityLogModel(activityDetails);
            res.render('dashboard', {dashBoardObject: dashBoardObject, constantsObj: constantsObj,officeIdArray:officeIdArray,officeNameArray:officeNameArray,officeValue:officeId,roleId:roleId, contextPath:props.contextPath});
        }catch(e){
            customlog.error("Exception while show dashboard "+e);
            self.showErrorPage(req,res);
        }
    },*/

    /*showDashBoardCall : function(tenantId,officeId,callback){
		this.model.showDashBoardModel(tenantId,officeId,callback);
	},*/

	/*dashboard : function(req,res){
        try{
            var self = this;
            if(typeof (req.session.tenantId) == 'undefined' || typeof (req.session.userId) == 'undefined') {
                res.redirect(props.contextPath+'/client/ci/login');
            }else{
                //var activityDetails = new Array(iklantPort, req.session.tenantId, req.session.userId, req.session.userName, req.originalUrl, req.connection.remoteAddress, "router.js", "dashboard", "success", "dashboard", "dashboard");
                //self.commonRouter.insertActivityLogModel(activityDetails);
                var officeId = req.session.officeId;
                var tenantId = req.session.tenantId;
                self.showDashBoardCall(tenantId,officeId,function(dashBoardObject){
                    self.showDashBoard(req,res,dashBoardObject);
                });
            }
        }catch(e){
            customlog.error("Exception while dashboard "+e);
            self.showErrorPage(req,res);
        }
	},

    generateDashBoard : function(req,res) {
        try{
            var self = this;
            var officeId = req.params.id;
            var tenantId = req.session.tenantId;
            var roleId = req.session.roleId;
            var userId = req.session.userId;
            var selectedOfficeId = req.body.listofficefordashboard;
            var requestOfficeIdArray = new Array();
            var requestOfficeNameArray= new Array();
            var constantsObj  = this.constants;
            customlog.info("Inside router.js: generateDashBoard");
            customlog.info("tenantId: "+tenantId);
            customlog.info("roleId: "+roleId);
            customlog.info("req.session.userId: "+userId);
            if(typeof (tenantId) == 'undefined' || typeof (userId) == 'undefined') {
                res.redirect(props.contextPath+'/client/ci/login');
            }else{
                if( typeof officeId == 'undefined') {
                    officeId = selectedOfficeId;
                }
                //var activityDetails = new Array(iklantPort, req.session.tenantId, req.session.userId, req.session.userName, req.originalUrl, req.connection.remoteAddress, "router.js", "generateDashBoard", "success", "generateDashBoard", "generateDashBoard");
                //self.commonRouter.insertActivityLogModel(activityDetails);
                self.showDashBoardCall(tenantId, officeId, function (dashBoardObject) {
                    self.commonRouter.retriveOfficeCall(tenantId,userId, function (officeIdArray, officeNameArray, officeAddressArray, officeShortNameArray) {
                        if(roleId != constantsObj.getSMHroleId()){
                            for(var i=0; i<officeIdArray.length; i++){
                                if(selectedOfficeId == officeIdArray[i]){
                                    requestOfficeIdArray[0]  = officeIdArray[i];
                                    requestOfficeNameArray[0] = officeNameArray[i];
                                    break;
                                }
                            }
                            officeIdArray = new Array();officeIdArray = requestOfficeIdArray;
                            officeNameArray = new Array();officeNameArray = requestOfficeNameArray;
                        }
                        self.showDashBoard(req,res,dashBoardObject, officeIdArray, officeNameArray, officeId);
                    });
                });
            }
        }catch(e){
            customlog.error("Exception while generate dashboard ",e);
            self.showErrorPage(req,res);
        }
    },*/

	/*populateGroupsCall : function(tenantId,officeId,userId,statusid,callback){
		this.model.populateGroupsModel(tenantId,officeId,userId,statusid,callback);
	},*/

	/*populateGroups : function(req,res){
		try{
            var self = this;
            var tenantId = req.session.tenantId;
            var officeId = req.body.officeId;
            var userId = req.body.userId;
            var statusid = req.body.statusId;
            //var activityDetails = new Array(iklantPort, req.session.tenantId, req.session.userId, req.session.userName, req.originalUrl, req.connection.remoteAddress, "router.js", "populateGroups", "success", "populateGroups", "populateGroups");
            //self.commonRouter.insertActivityLogModel(activityDetails);
            self.populateGroupsCall(tenantId,officeId,userId,statusid,function(groupNameArray,centerNameArray){
                customlog.info("groupNameArray"+ groupNameArray);
                customlog.info("centerNameArray"+ centerNameArray);

                req.body.groupNameArray = groupNameArray;
                req.body.centerNameArray = centerNameArray;

                res.send(req.body);

            });
        }catch(e){
            customlog.error("Exception while populateGroups "+e);
            self.showErrorPage(req,res);
        }
	},*/

	/*populateRejectedGroupCall : function(tenantId,officeId,userId,statusid,callback){
		this.model.populateRejectedGroupsModel(tenantId,officeId,userId,statusid,callback);
	},*/

	/*populateRejectedGroups : function(req,res) {
		try{
            var self = this;
            var tenantId = req.session.tenantId;
            var officeId = req.body.officeId;
            var userId = req.body.userId;
            var statusid = req.body.statusId;
            //var activityDetails = new Array(iklantPort, req.session.tenantId, req.session.userId, req.session.userName, req.originalUrl, req.connection.remoteAddress, "router.js", "populateRejectedGroups", "success", "populateRejectedGroups", "populateRejectedGroups");
            //self.commonRouter.insertActivityLogModel(activityDetails);
            self.populateRejectedGroupCall(tenantId,officeId,userId,statusid,function(groupNameArray,centerNameArray,statusDescArray){
                customlog.info("groupNameArray"+ groupNameArray);
                customlog.info("centerNameArray"+ centerNameArray);
                req.body.groupNameArray = groupNameArray;
                req.body.centerNameArray = centerNameArray;
                req.body.statusDescArray = statusDescArray;
                res.send(req.body);
            });
        }catch(e){
            customlog.error("Exception while populateRejectedGroups "+e);
            self.showErrorPage(req,res);
        }
	},*/

	/*activeofficeslist : function(req,res,errmsg){
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

                                res.render('LoanRecoveryActiveOfficeList',{officeId:officeId,officeName:officeName,errmsg:errmsg, contextPath:props.contextPath});
                            }
                            else{
                                self.showErrorPage(req,res);
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
            self.showErrorPage(req,res);
        }
	},
	*/
	/*loanrecoveryactiveoffices :function(req, res){
        var self = this;
        if(typeof (req.session.tenantId) == 'undefined' || typeof (req.session.userId) == 'undefined') {
            res.redirect(props.contextPath+'/client/ci/login');
        }else{
            //var activityDetails = new Array(iklantPort, req.session.tenantId, req.session.userId, req.session.userName, req.originalUrl, req.connection.remoteAddress, "router.js", "loanrecoveryactiveoffices", "success", "loanrecoveryactiveoffices", "loanrecoveryactiveoffices");
            //self.commonRouter.insertActivityLogModel(activityDetails);
            self.activeofficeslist(req,res,"");
        }
	},
	*/
	
	/*showLoanRecoveryLoanOfficer: function(req,res,loanOfficerId,loanOfficerName,errMsg,viasmh) {
        var self = this;
        //var activityDetails = new Array(iklantPort, req.session.tenantId, req.session.userId, req.session.userName, req.originalUrl, req.connection.remoteAddress, "router.js", "showLoanRecoveryLoanOfficer", "success", "LoanRecoveryLoanOfficer", "showLoanRecoveryLoanOfficer");
        //self.commonRouter.insertActivityLogModel(activityDetails);
        res.render('LoanRecoveryLoanOfficer',{loanOfficerId: loanOfficerId,loanOfficerName:loanOfficerName,errMsg:errMsg,viasmh:viasmh, contextPath:props.contextPath});
    },*/

	/*loanOfficerListCall : function (req, res,errMsg,viasmh) {
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
                                self.showErrorPage(req,res);
                            }
                        }
                    });
                }
            }
        }catch(e){
            customlog.error("Exception while loan office list call "+e);
            self.showErrorPage(req,res);
        }
	},
*/
	/*loanrecoveryloanofficer :function(req, res){
		var self = this;
        //var activityDetails = new Array(iklantPort, req.session.tenantId, req.session.userId, req.session.userName, req.originalUrl, req.connection.remoteAddress, "router.js", "loanrecoveryloanofficer", "success", "loanrecoveryloanofficer", "loanrecoveryloanofficer");
        //self.commonRouter.insertActivityLogModel(activityDetails);
		if(typeof req.body.officeId != 'undefined'){
			req.session.officeId = req.body.officeId;
		}
		self.loanOfficerListCall(req,res,"",req.session.viasmh);
	},
*/
	/*showLoanRecoveryGroupList: function(req,res,groupId,groupName,globalCustomerNum,errorMsg,viaLoanOfficer) {
      res.render('LoanRecoveryGroupList',{groupId: groupId,groupName:groupName,globalCustomerNum:globalCustomerNum,errorMsg:errorMsg,viaLoanOfficer:viaLoanOfficer, contextPath:props.contextPath});
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

                            *//*if(result.groupList.length==0){
                                self.loanOfficerListCall(req,res,"No Group created for this Loan officer");
                            }
                            else{*//*
                                self.showLoanRecoveryGroupList(req,res,groupId,groupName,globalCustomerNum,errorMsg,viaLoanOfficer);
                            //}
                            //customlog.info('In Mifos successful office creation');
                        }else{
                            self.showErrorPage(req,res);
                        }
                    }
                });
            }
        }catch(e){
            customlog.error("Exception while group list call "+e);
            self.showErrorPage(req,res);
        }
	},
*/
	/*loanrecoverygrouplist :function(req, res){
		try{
            var self = this;
            var viaLoanOfficer = true;
            var loanOfficerId = req.params.loanOfficerId;
            //var activityDetails = new Array(iklantPort, req.session.tenantId, req.session.userId, req.session.userName, req.originalUrl, req.connection.remoteAddress, "router.js", "loanrecoverygrouplist", "success", "loanrecoverygrouplist", "loanrecoverygrouplist");
            //self.commonRouter.insertActivityLogModel(activityDetails);
            if(typeof loanOfficerId == 'undefined') {
                loanOfficerId = req.session.mifosLoanOfficerId;
                viaLoanOfficer = false;
            }
            var officeId = req.session.officeId;
            customlog.info("loanOfficerId == "+loanOfficerId);
            self.groupListCall(officeId,loanOfficerId,req,res,"",req.session.viaLoanOfficer);
        }catch(e){
            customlog.error("Exception while loanrecoverygrouplist "+e);
            self.showErrorPage(req,res);
        }
	},*/
	
	/*showLoanRecoveryLoanAccountList: function(req,res,activeLoanAccountInformation,closedLoanAccountsInformation,loanOfficerName,loanOfficerId,createLoanCustomerId) {
      try{
          customlog.info("activeLoanAccountInformation"+activeLoanAccountInformation.getAccountId()[0]);
            var self = this;
            //var activityDetails = new Array(iklantPort, req.session.tenantId, req.session.userId, req.session.userName, req.originalUrl, req.connection.remoteAddress, "router.js", "showLoanRecoveryLoanAccountList", "success", "LoanRecoveryLoanAccountList", "showLoanRecoveryLoanAccountList");
            //self.commonRouter.insertActivityLogModel(activityDetails);
          res.render('LoanRecoveryLoanAccountList',{activeLoanAccountInformation:activeLoanAccountInformation,
                                closedLoanAccountsInformation:closedLoanAccountsInformation,
                                loanOfficerName:loanOfficerName, loanOfficerId:loanOfficerId,
                                createLoanCustomerId:createLoanCustomerId, roleId:req.session.roleId,
                                constantsObj:this.constants,groupName : req.session.groupCenterMifosName, contextPath:props.contextPath});
      }catch(e){
          customlog.error("Exception while showLoanRecoveryLoanAccountList "+e);
          self.showErrorPage(req,res);
      }
    },
*/
	/*loanrecoveryloanaccounts :function(req, res) {
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

                            var loanAccountInformation = require(domainPath +"/loanAccountInformation");
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
                                res.render('serachResult',{searchResult : new Array(), errorLabel :  "No Loan Accounts for that Group",roleId : req.session.roleId,constantsObj : this.constantsObj, contextPath:props.contextPath});
                            }
                            else{
                                self.showLoanRecoveryLoanAccountList(req,res,activeLoanAccountInformation,closedLoanAccountsInformation,loanOfficerName,loanOfficerId,createLoanCustomerId);
                            }
                        }else{
                            self.showErrorPage(req,res);
                        }
                    }
                });
            }
        }catch(e){
            customlog.error("Exception while loanrecoveryloanaccounts "+e);
            self.showErrorPage(req,res);
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
            *//*if(typeof loanStatusId != 'undefined'){
                req.session.loanStatusId = loanStatusId;
            }
            if(typeof loanStatusId == 'undefined'){
                loanStatusId = req.session.loanStatusId;
            }*//*
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
                                //var activityDetails = new Array(iklantPort, req.session.tenantId, req.session.userId, req.session.userName, req.originalUrl, req.connection.remoteAddress, "router.js", "loanrecoveryloaninformation", "success", "loanrecoveryloaninformation", "loanrecoveryloaninformation");
                                //self.commonRouter.insertActivityLogModel(activityDetails);
                                //customlog.info(result.loanInfnList.loanInformationDto.loanSummary);
                                //customlog.info(result.loanInfnList.loanInformationDto);
                                //customlog.info(result.loanInfnList.loanInformationDto.loanRepaymentSchedule);
                                //customlog.info(result.loanInfnList.loanInformationDto.recentAccountActivity);
                                //customlog.info("Account Activity");
                                //customlog.info(result.loanInfnList.allAccountActivities);
                                //customlog.info(result.loanInfnList.loanAccountDetailsDto[0].loanRepaymentSchedule);
                                var loanAccountInformationDto = require(domainPath +"/loanAccountInformationDto");
                                var loanSummary = require(domainPath +"/loanSummary");
                                //var paidInstallment = require(domainPath +"/paidInstallment");
                                //var futureInstallment = require(domainPath +"/futureInstallment");
                                //var runningBalance = require(domainPath +"/runningBalance");
                                var RepaymentSchedule = require(domainPath +"/RepaymentSchedule");
                                var clientLoanAccountDetailsDto = require(domainPath +"/clientLoanAccountDetailsDto");
                                var RecentAccountActivity = require(domainPath +"/RecentAccountActivity");

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


                                *//*loanOfficerName = result.loanList.loanOfficerName
                                customlog.info(result.loanList.loanAccountsInUse);
                                customlog.info("Length=="+result.loanList.loanAccountsInUse.length);*//*

                                *//*accountId[item] = result.loanInfnList.loanInformationDto[item].accountId ;
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
                                individualTracked[item] = result.loanInfnList.loanInformationDto[item].individualTracked;*//*

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
                            *//*var individual_track;
                            if(result.loanInfnList.loanInformationDto.individualTracked == "true" )
                                individual_track = "Yes";
                            else
                                individual_track = "No"
                            customlog.info("individual_track"+individual_track)*//*
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


                        /*//*****************************************Group Paid Installment***************************************************//*/

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


                        /*//***************************************Group Due Installment****************************************************//*/

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

                        /*//***************************************Group Future Installment****************************************************//*/

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


                        *//*var futureStartValue = result.loanInfnList.loanInformationDto.loanRepaymentSchedule.dueInstallments.length;
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

                        }*//*
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

                        /*//***************************************** Running Balance **********************************************************************//*/

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
                        /*//**************************************Client Account Info **************************************************************//*/

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

                                /*//**************************************Client Paid Installment **************************************************************//*/
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

                                /*//**************************************Client Due Installment **************************************************************//*/
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

                                /*//**************************************Client Future Installment **************************************************************//*/
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

                                *//*var futureStartValue = result.loanInfnList.loanAccountDetailsDto[innerItem].loanRepaymentSchedule.dueInstallments.length;
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
                                }*//*
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

                                /*//**************************************Client Running Balance **************************************************************//*/
                                *//*var clientRunningBalance = new RepaymentSchedule();
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
                                totalRunBal = [];*//*
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
                        self.showErrorPage(req,res);
                    }
            }
                });
            }
        }catch(e){
            customlog.error("Exception while loanrecoveryloaninformation "+e);
            self.showErrorPage(req,res);
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

            var loanRepaymentHolder = require(domainPath +"/LoanRepayment");
            var loanRepaymentHolder = new loanRepaymentHolder();

            var ClientPaymentDto = require(domainPath +"/ClientPaymentDto");
            var clientPaymentDto = new ClientPaymentDto();

            var GLCodeDto = require(domainPath +"/GLCodeDto");
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
                            var LoanRepayment = require(domainPath +"/LoanRepayment");
                            var ClientPaymentDto = require(domainPath +"/ClientPaymentDto");
                            var GLCodeDto = require(domainPath +"/GLCodeDto");

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
                                    clientPaymentDetail.setTotalOverdueAmount(result.paymentInfn.clientPaymentDetails[item].totalOverdueAmount);
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
                                groupClientPaymentDetail.setTotalOverdueAmount(result.paymentInfn.paymentDetails.totalOverdueAmount);
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
                            res.render('ApplyPayment',{loanRepayment:loanRepayment,groupName : req.session.groupCenterMifosName,constantsObj:constantsObj, contextPath:props.contextPath});
                        } else {
                            self.showErrorPage(req,res);
                        }
                    }
                });
                //res.render('ApplyPayment');
            }
        }catch(e){
            customlog.error("Exception while applypayment "+e);
            self.showErrorPage(req,res);
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
            *//*if(typeof req.body.chequeDate != 'undefined')
                //chequeDate = new Date(convertToMifosDateFormat(req.body.chequeDate));
                chequeDate = req.body.chequeDate;*//*
            var amount = req.body.amount;
            customlog.info("Amount----------------------"+amount);
            customlog.info("Data="+chequeNo+"--"+chequeDate+"--"+globalAccountNum+"--"+transactionDate+"--"+retrieveType+"--"+sourceofPayment+"--"+relaxValidation);
            var noOfClients = parseInt(req.body.noOfClients,10);

            var clientsId = req.body.clientsId.split(",");
            var clientsName = req.body.clientsName.split(",");
            var clientAmounts = req.body.clientAmounts.split(",");
            if(noOfClients >0 ){
                var ClientPaymentDto = require(domainPath +"/ClientPaymentDto");
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

            var loanRepaymentHolder = require(domainPath +"/LoanRepayment");
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
                            //var activityDetails = new Array(iklantPort, req.session.tenantId, req.session.userId, req.session.userName, req.originalUrl, req.connection.remoteAddress, "router.js", "doapplypayment", "failure", "doapplypayment", "doapplypayment");
                            //self.commonRouter.insertActivityLogModel(activityDetails);
                            customlog.error("Error "+result.error);
                            if(typeof result.error != 'undefined'){
                                req.session.paymentMonthClosingError = result.error;
                                req.session.afterDoApplyPayment = 1;
                                self.applyPaymentForFo(req,res);
                            }
                            else {
                                self.showErrorPage(req,res);
                            }

                        }

                        }

                });
            }
        }catch(e){
            customlog.error("Exception while do apply payment "+e);
            self.showErrorPage(req,res);
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
                            //var activityDetails = new Array(iklantPort, req.session.tenantId, req.session.userId, req.session.userName, req.originalUrl, req.connection.remoteAddress, "router.js", "listapplyadjustment", "success", "Apply Adjustment", "listapplyadjustment");
                            //self.commonRouter.insertActivityLogModel(activityDetails);
                            customlog.info("Office id===="+req.session.officeId);
                            //customlog.info(result.adjList[0].amount.amount);
                            if(result.adjList != null) {
                                var AdjustablePayment = require(domainPath +"/AdjustablePaymentDto");
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
                            res.render('ApplyAdjustmentList',{adjustablePaymentList:adjustablePaymentList,globalAccountNum:globalAccountNum,officeId:req.session.officeId,loanStatusId:req.session.loanStatusId,accountId : accountId,accountTypeId : accountTypeId ,groupName : req.session.groupCenterMifosName,flagIdForClosedLoans : flagIdForClosedLoans, contextPath:props.contextPath,individualPreclosed : result.individualPreclosed});
                        }
                        else{
                            self.showErrorPage(req,res);
                        }
                    }
                });
            }
        }catch(e){
            customlog.error("Exception While list apply adjustment "+e);
            self.showErrorPage(req,res);
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
                            //var activityDetails = new Array(iklantPort, req.session.tenantId, req.session.userId, req.session.userName, req.originalUrl, req.connection.remoteAddress, "router.js", "applyadjustment", "success", "Apply Adjustment From", "applyadjustment");
                            //self.commonRouter.insertActivityLogModel(activityDetails);
                            var LoanAdjustment = require(domainPath +"/LoanAdjustment");
                            var ClientPaymentDto = require(domainPath +"/ClientPaymentDto");
                            var GLCodeDto = require(domainPath +"/GLCodeDto");
                            var ValueListElement = require(domainPath +"/ValueListElement");
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
                                    clientPaymentDetail.setTotalOverdueAmount(result.adjInfn.clientPaymentDetails[item].totalOverdueAmount);
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
                            *//*customlog.info("clientId "+result.adjInfn.paymentDetails.clientId);
                            customlog.info("clientPaymentObjArray "+result.adjInfn.paymentDetails.clientName);
                            customlog.info("clientPaymentAmount "+result.adjInfn.paymentDetails.clientPaymentAmount);
                            customlog.info("clientPaymentId "+result.adjInfn.paymentDetails.clientPaymentId);
                            customlog.info("totalOverdueAmount "+result.adjInfn.paymentDetails.totalOverdueAmount);
                            customlog.info("totalOutstandingAmount "+result.adjInfn.paymentDetails.totalOutstandingAmount);
                            customlog.info("totalAmountDemanded "+result.adjInfn.paymentDetails.totalAmountDemanded);
                            customlog.info("totalAmountPaid "+result.adjInfn.paymentDetails.totalAmountPaid);
                            customlog.info("totalInstallmentAmount "+result.adjInfn.paymentDetails.totalInstallmentAmount);*//*
                            if(result.adjInfn.paymentDetails != null) {
                                groupClientPaymentDetail.setClientId(result.adjInfn.paymentDetails.clientId);
                                groupClientPaymentDetail.setClientName(result.adjInfn.paymentDetails.clientName);
                                groupClientPaymentDetail.setClientPaymentAmount(result.adjInfn.paymentDetails.clientPaymentAmount);
                                groupClientPaymentDetail.setClientPaymentId(result.adjInfn.paymentDetails.clientPaymentId);
                                groupClientPaymentDetail.setLoanAccountId(result.adjInfn.paymentDetails.loanAccountId);
                                groupClientPaymentDetail.setTotalOverdueAmount(result.adjInfn.paymentDetails.totalOverdueAmount);
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
                            res.render('ApplyAdjustmentForm',{adjustmentMonthClosingError:req.session.adjustmentMonthClosingError,loanAdjustment:loanAdjustment,accountId : accountId,accountTypeId : accountTypeId ,groupName : req.session.groupCenterMifosName, contextPath:props.contextPath});
                        }
                        else{
                            self.showErrorPage(req,res);
                        }

                    }
                });
            }
        }catch(e){
            customlog.error("Exception while apply adjustment "+e);
            self.showErrorPage(req,res);
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
                var ClientPaymentDto = require(domainPath +"/ClientPaymentDto");
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

            var LoanAdjustmentHolder = require(domainPath +"/LoanAdjustment");
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
                            //var activityDetails = new Array(iklantPort, req.session.tenantId, req.session.userId, req.session.userName, req.originalUrl, req.connection.remoteAddress, "router.js", "doapplyadjustment", "failure", "doapplyadjustment", "doapplyadjustment");
                            //self.commonRouter.insertActivityLogModel(activityDetails);
                            customlog.info("Apply Adjustment Error ="+result.error);
                            if(typeof result.error != 'undefined'){
                                req.session.adjustmentMonthClosingError = result.error;
                                req.session.afterDoApplyAdjustment = 1;
                                self.applyadjustment(req,res);
                            }
                            else{
                                self.showErrorPage(req,res);
                            }
                        }
                    }
                });
            }
        }catch(e){
            customlog.error("Exception while do apply adjustment "+e);
            self.showErrorPage(req,res);
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
                            //var activityDetails = new Array(iklantPort, req.session.tenantId, req.session.userId, req.session.userName, req.originalUrl, req.connection.remoteAddress, "router.js", "applyadjustmentwhenobligationmet", "success", "Apply Adjustment Obligation Met Form", "applyadjustmentwhenobligationmet");
                            //self.commonRouter.insertActivityLogModel(activityDetails);
                            var LoanAdjustmentHolderObj = require(domainPath +"/LoanAdjustment");
                            var loanAdjustment=new LoanAdjustmentHolderObj();
                            //loanAdjustmentHolder.clearAll();
                            if(result.adjInfn != null) {
                                loanAdjustment.setGlobalAccountNum(result.adjInfn.globalAccountNum);
                                loanAdjustment.setAdjustmentNote(result.adjInfn.adjustmentNote);
                                loanAdjustment.setPaymentId(result.adjInfn.paymentId);
                                loanAdjustment.setAmount(result.adjInfn.amount);
                                loanAdjustment.setVoucherNumber(result.adjInfn.voucherNumber); // Praveen [Production Issue]
                                res.render('ApplyAdjustmentObligationMetForm',{loanAdjustment:loanAdjustment, contextPath:props.contextPath});
                            }
                        }
                        else{
                            self.showErrorPage(req,res);
                        }
                    }
                });
            }
        }catch(e){
            customlog.error("Exception while applyadjustmentwhenobligationmet "+e);
            self.showErrorPage(req,res);
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

            var LoanAdjustmentHolderObj = require(domainPath +"/LoanAdjustment");
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
                            self.showErrorPage(req,res);
                        }
                    }
                });
            }
        }catch(e){
            customlog.error("Exception while doapplyadjustmentwhenobligationmet "+e);
            self.showErrorPage(req,res);
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
                            //var activityDetails = new Array(iklantPort, req.session.tenantId, req.session.userId, req.session.userName, req.originalUrl, req.connection.remoteAddress, "router.js", "editaccountstatus", "success", "Edit Status", "editaccountstatus");
                            //self.commonRouter.insertActivityLogModel(activityDetails);
                            var LoanStatusHolder = require(domainPath +"/LoanStatusHolder");
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

                            res.render('editStatus',{loanStatusHolder:loanStatusHolder,accountId : accountId,accountTypeId : accountTypeId ,groupName : req.session.groupCenterMifosName,accountStateName:req.session.accountStateName.split("-")[1].replace( /([a-z])([A-Z])/g, "$1 $2"), contextPath:props.contextPath});
                        }
                        else{
                            self.showErrorPage(req,res);
                        }
                    }
                });
            }
        }catch(e){
            customlog.error("Exception while editaccountstatus "+e);
            self.showErrorPage(req,res);
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
            var LoanStatusHolder = require(domainPath +"/LoanStatusHolder");
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
                            self.showErrorPage(req,res);
                        }
                    }
                });
            }
        }catch(e){
            customlog.error("Exception while doeditaccountstatus "+e);
            self.showErrorPage(req,res);
        }
		
	},
*/
	/*loanDisbursalReportLoad : function(req,res){
        try{
            var self = this;
            var rest = require("./rest.js");
            var loanDisbursalReport = "";
            customlog.info("loanDisbursalReport"+loanDisbursalReport);
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
                'Content-Length' : Buffer.byteLength(loanDisbursalReport, 'utf8'),
                'Cookie' : req.session.mifosCookie
                };
                var options = {
                  host: mifosServiceIP,
                  port: mifosPort,
                  path: '/mfi/api/report/account/loan/load.json',
                  method: 'POST',
                  headers : postheaders
                };

                rest.postJSON(options,loanDisbursalReport,function(statuscode,result,headers){
                    customlog.info("statuscode" + statuscode);
                    customlog.info("HEADERS:  "+headers)
                    customlog.info("RESULT"+result.status);
                    if(statuscode == 302){
                        res.redirect(props.contextPath+'/client/ci/logout');
                    }
                    else{
                        if(result.status == 'success'){
                            //var activityDetails = new Array(iklantPort, req.session.tenantId, req.session.userId, req.session.userName, req.originalUrl, req.connection.remoteAddress, "router.js", "loanDisbursalReportLoad", "success", "Loan Disbursal Report", "loanDisbursalReportLoad");
                            //self.commonRouter.insertActivityLogModel(activityDetails);
                            var officeList = new Array();
                            var prdCategoryList = new Array();
                            var loanOfficerList = new Array();
                            var ReportHolder = require(domainPath +"/ReportHolder");
                            var OfficeDto = require(domainPath +"/OfficeDto");
                            var PrdCatDto = require(domainPath +"/PrdCatDto");
                            var PersonnelDto = require(domainPath +"/PersonnelDto");
                            var reportHolder = new ReportHolder();

                            if(result.disbReportInfn.offices != null) {
                                for(var i =0; i<result.disbReportInfn.offices.length; i++) {
                                    var officeDto = new OfficeDto();;
                                    officeDto.setId(result.disbReportInfn.offices[i].id);
                                    officeDto.setName(result.disbReportInfn.offices[i].name);
                                    customlog.info(result.disbReportInfn.offices[i].name);
                                    officeList[i] = officeDto;
                                }
                            }
                            if(result.disbReportInfn.prdCategories != null) {
                                for(var i =0; i<result.disbReportInfn.prdCategories.length; i++) {
                                    var prdCatDto = new PrdCatDto();
                                    prdCatDto.setPrdCatId(result.disbReportInfn.prdCategories[i].prdCatId);
                                    prdCatDto.setPrdCatName(result.disbReportInfn.prdCategories[i].prdCatName);
                                    prdCategoryList[i] = prdCatDto;
                                }

                            }
                            if(result.disbReportInfn.loanOfficers != null) {
                                for(var i =0; i<result.disbReportInfn.loanOfficers.length; i++) {
                                    var personnelDto = new PersonnelDto();
                                    personnelDto.setPersonnelId(result.disbReportInfn.loanOfficers[i].personnelId);
                                    personnelDto.setDisplayName(result.disbReportInfn.loanOfficers[i].displayName);
                                    loanOfficerList[i] = personnelDto;
                                }

                            }
                            reportHolder.setOfficeId("");
                            reportHolder.setCategoryId("");
                            reportHolder.setOffices(officeList);
                            reportHolder.setPrdCategories(prdCategoryList);
                            reportHolder.setLoanOfficers(loanOfficerList);

                            var LoanDisbursalDto = require(domainPath +"/LoanDisbursalDto");
                            var loanDisbursalSummary = new LoanDisbursalDto();
                            res.render("loanDisbursalReport",{reportHolder:reportHolder,loanDisbursalSummary:loanDisbursalSummary,loanDisbursalDetList:"",isReportLoaded:0, contextPath:props.contextPath});
                        }else{
                            self.showErrorPage(req,res);
                        }
                    }
                });
            }
        }catch(e){
               customlog.error("Exception while loanDisbursalReportLoad "+e);
               self.showErrorPage(req,res);
            }
	},

	loanDisbursalReportLoadLoanOfficers : function(req,res){
		try{
            var self = this;
            var startDate = req.body.startDate;
            if(startDate != "")
                startDate = convertToMifosDateFormat(startDate);
            else
                startDate = null;
            var endDate = req.body.endDate;
            if(endDate != "")
                endDate = convertToMifosDateFormat(endDate);
            else
                endDate = null;
            var office = req.body.office;
            var loanOfficer = req.body.loanOfficer;
            var productCategory = req.body.productCategory;
            var officeIds = req.body.officeIds;
            var officeNames = req.body.officeNames;
            var prdCategoryIds = req.body.prdCategoryIds;
            var prdCategoryNames = req.body.prdCategoryNames;
            var ReportHolder = require(domainPath +"/ReportHolder");
            var reportHolder = new ReportHolder();

            //var selectedOfficeIdsArray = new Array();
            var officeIdsArray = new Array();
            var officeNamesArray = new Array();
            var prdCategoryIdsArray = new Array();
            var prdCategoryNamesArray = new Array();
            *//*if(parseInt(office,10) == -1){
                if(typeof officeIds != 'undefined') {
                    selectedOfficeIdsArray = officeIds.split(",");
                }
            }
            else {
                selectedOfficeIdsArray[0] = office;
            }*//*
            officeIdsArray = officeIds.split(",");
            officeNamesArray = officeNames.split(",");
            prdCategoryIdsArray = prdCategoryIds.split(",");
            prdCategoryNamesArray = prdCategoryNames.split(",");
            customlog.info("startDate="+startDate);
            reportHolder.setStartDate(startDate);
            reportHolder.setEndDate(endDate);
            reportHolder.setOfficeId(office);
            reportHolder.setCategoryId(productCategory);
            reportHolder.setLoanOfficerId(loanOfficer);
            //reportHolder.setOfficeIdList(selectedOfficeIdsArray);

            var OfficeDto = require(domainPath +"/OfficeDto");
            var officeList = new Array();
            for(var i =0; i<officeIdsArray.length; i++) {
                var officeDto = new OfficeDto();
                officeDto.setId(officeIdsArray[i]);
                officeDto.setName(officeNamesArray[i]);
                officeList[i] = officeDto;
            }
            reportHolder.setOffices(officeList);

            var PrdCatDto = require(domainPath +"/PrdCatDto");
            var prdCategoryList = new Array();
            for(var i =0; i<prdCategoryIdsArray.length; i++) {
                var prdCatDto = new PrdCatDto();
                prdCatDto.setPrdCatId(prdCategoryIdsArray[i]);
                prdCatDto.setPrdCatName(prdCategoryNamesArray[i]);

                prdCategoryList[i] = prdCatDto;
            }
            reportHolder.setPrdCategories(prdCategoryList);


            var rest = require("./rest.js");
            var reportHolderDetail = JSON.stringify(reportHolder);
            customlog.info("reportHolderDetail"+reportHolderDetail);
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
                'Content-Length' : Buffer.byteLength(reportHolderDetail, 'utf8'),
                'Cookie' : req.session.mifosCookie
                };
                var options = {
                  host: mifosServiceIP,
                  port: mifosPort,
                  path: '/mfi/api/report/account/loan/loadLoanOfficers.json',
                  method: 'POST',
                  headers : postheaders
                };

                rest.postJSON(options,reportHolderDetail,function(statuscode,result,headers){
                    customlog.info("statuscode" + statuscode);
                    customlog.info("HEADERS:  "+headers)
                    customlog.info("RESULT"+result.status);
                    if(statuscode == 302){
                        res.redirect(props.contextPath+'/client/ci/logout');
                    }
                    else{
                        if(result.status == 'success'){
                            //var activityDetails = new Array(iklantPort, req.session.tenantId, req.session.userId, req.session.userName, req.originalUrl, req.connection.remoteAddress, "router.js", "loanDisbursalReportLoadLoanOfficers", "success", "Loan Disbursal Report", "loanDisbursalReportLoadLoanOfficers");
                            //self.commonRouter.insertActivityLogModel(activityDetails);
                            var officeList = new Array();
                            var prdCategoryList = new Array();
                            var loanOfficerList = new Array();
                            var ReportHolder = require(domainPath +"/ReportHolder");
                            var OfficeDto = require(domainPath +"/OfficeDto");
                            var PrdCatDto = require(domainPath +"/PrdCatDto");
                            var PersonnelDto = require(domainPath +"/PersonnelDto");
                            var reportHolder = new ReportHolder();
                            if(result.disbReportInfn.offices != null) {
                                for(var i =0; i<result.disbReportInfn.offices.length; i++) {
                                    var officeDto = new OfficeDto();
                                    officeDto.setId(result.disbReportInfn.offices[i].id);
                                    officeDto.setName(result.disbReportInfn.offices[i].name);
                                    customlog.info(result.disbReportInfn.offices[i].name);
                                    officeList[i] = officeDto;
                                }
                            }
                            if(result.disbReportInfn.prdCategories != null) {
                                for(var i =0; i<result.disbReportInfn.prdCategories.length; i++) {
                                    var prdCatDto = new PrdCatDto();
                                    prdCatDto.setPrdCatId(result.disbReportInfn.prdCategories[i].prdCatId);
                                    prdCatDto.setPrdCatName(result.disbReportInfn.prdCategories[i].prdCatName);
                                    prdCategoryList[i] = prdCatDto;
                                }

                            }
                            if(result.disbReportInfn.loanOfficers != null) {
                                for(var i =0; i<result.disbReportInfn.loanOfficers.length; i++) {
                                    var personnelDto = new PersonnelDto();
                                    personnelDto.setPersonnelId(result.disbReportInfn.loanOfficers[i].personnelId);
                                    personnelDto.setDisplayName(result.disbReportInfn.loanOfficers[i].displayName);
                                    loanOfficerList[i] = personnelDto;
                                }

                            }

                            reportHolder.setStartDate((result.disbReportInfn.startDate != null )?convertDate(result.disbReportInfn.startDate):"");
                            reportHolder.setEndDate((result.disbReportInfn.endDate != null )?convertDate(result.disbReportInfn.endDate):"");
                            //reportHolder.setEndDate(endDate);
                            customlog.info("statDate=="+reportHolder.getStartDate());
                            customlog.info("endDate=="+reportHolder.getEndDate());
                            reportHolder.setOfficeId(result.disbReportInfn.officeId);
                            reportHolder.setCategoryId(result.disbReportInfn.categoryId);
                            reportHolder.setLoanOfficerId(result.disbReportInfn.loanOfficerId);
                            reportHolder.setOffices(officeList);
                            reportHolder.setPrdCategories(prdCategoryList);
                            reportHolder.setLoanOfficers(loanOfficerList);


                            var LoanDisbursalDto = require(domainPath +"/LoanDisbursalDto");
                            var loanDisbursalSummary = new LoanDisbursalDto();

                            res.render("loanDisbursalReport",{reportHolder:reportHolder,loanDisbursalSummary:loanDisbursalSummary,loanDisbursalDetList:"",isReportLoaded:0, contextPath:props.contextPath});
                        }
                        else{
                            self.showErrorPage(req,res);
                        }
                    }
                });
            }
        }catch(e){
            customlog.error("Exception While loanDisbursalReportLoadLoanOfficers "+e);
            self.showErrorPage(req,res);
        }
	},
	
	loandisbursalReportLoadDetail : function(req,res){
		try{
            //res.render("loanOutstandingReport");
            var self = this;

            var startDate = req.body.startDate;
            if(startDate != "")
                startDate = convertToMifosDateFormat(startDate);
            else
                startDate = null;
            var endDate = req.body.endDate;
            if(endDate != "")
                endDate = convertToMifosDateFormat(endDate);
            else
                endDate = null;
            var office = req.body.office;
            var loanOfficer = req.body.loanOfficer;
            var productCategory = req.body.productCategory;
            var officeIds = req.body.officeIds;
            var loanOfficer = req.body.loanOfficer;
            var officeNames = req.body.officeNames;
            var prdCategoryIds = req.body.prdCategoryIds;
            var prdCategoryNames = req.body.prdCategoryNames;
            var loanOfficerIds = req.body.loanOfficerIds;
            var loanOfficerNames = req.body.loanOfficerNames;
            var ReportHolder = require(domainPath +"/ReportHolder");
            var reportHolder = new ReportHolder();

            reportHolder.setStartDate(startDate);
            reportHolder.setEndDate(endDate);
            reportHolder.setOfficeId(office);
            reportHolder.setCategoryId(productCategory);
            reportHolder.setLoanOfficerId(loanOfficer);

            var officeIdsArray = new Array();
            var officeNamesArray = new Array();
            var prdCategoryIdsArray = new Array();
            var prdCategoryNamesArray = new Array();
            var loanOfficerIdsArray = new Array();
            var loanOfficerNamesArray = new Array();

            officeIdsArray = officeIds.split(",");
            officeNamesArray = officeNames.split(",");
            prdCategoryIdsArray = prdCategoryIds.split(",");
            prdCategoryNamesArray = prdCategoryNames.split(",");
            loanOfficerIdsArray = loanOfficerIds.split(",");
            loanOfficerNamesArray = loanOfficerNames.split(",");

            var OfficeDto = require(domainPath +"/OfficeDto");
            var officeList = new Array();
            for(var i =0; i<officeIdsArray.length; i++) {
                var officeDto = new OfficeDto();
                officeDto.setId(officeIdsArray[i]);
                officeDto.setName(officeNamesArray[i]);
                officeList[i] = officeDto;
            }
            reportHolder.setOffices(officeList);

            var PrdCatDto = require(domainPath +"/PrdCatDto");
            var prdCategoryList = new Array();
            for(var i =0; i<prdCategoryIdsArray.length; i++) {
                var prdCatDto = new PrdCatDto();
                prdCatDto.setPrdCatId(prdCategoryIdsArray[i]);
                prdCatDto.setPrdCatName(prdCategoryNamesArray[i]);

                prdCategoryList[i] = prdCatDto;
            }
            reportHolder.setPrdCategories(prdCategoryList);

            var PersonnelDto = require(domainPath +"/PersonnelDto");
            var loanOfficerList = new Array();
            for(var i =0; i<loanOfficerIdsArray.length; i++) {
                var personnelDto = new PersonnelDto();
                personnelDto.setPersonnelId(loanOfficerIdsArray[i]);
                personnelDto.setDisplayName(loanOfficerNamesArray[i]);

                loanOfficerList[i] = personnelDto;
                customlog.info(loanOfficerNamesArray[i]);
            }

            reportHolder.setLoanOfficers(loanOfficerList);


            *//*var startDate = convertToMifosDateFormat(req.body.startDate);
            var endDate = convertToMifosDateFormat(req.body.endDate);
            var office = req.body.office;
            var loanOfficer = req.body.loanOfficer;
            var productCategory = req.body.productCategory;
            var ReportHolder = require(domainPath +"/ReportHolder");
            var reportHolder = new ReportHolder();
            this.reportHolder = reportHolder;
            var reportHolder = this.reportHolder;
            reportHolder.setStartDate(startDate);
            reportHolder.setEndDate(endDate);
            reportHolder.setOfficeId(office);
            reportHolder.setLoanOfficerId(loanOfficer);
            reportHolder.setCategoryId(productCategory);*//*

            var rest = require("./rest.js");
            var reportHolderDetail = JSON.stringify(reportHolder);
            customlog.info("reportHolderDetail"+reportHolderDetail);
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
                'Content-Length' : Buffer.byteLength(reportHolderDetail, 'utf8'),
                'Cookie' : req.session.mifosCookie
                };
                var options = {
                  host: mifosServiceIP,
                  port: mifosPort,
                  path: '/mfi/api/report/account/loan/disbursal/getLoanDisb.json',
                  method: 'POST',
                  headers : postheaders
                };

                rest.postJSON(options,reportHolderDetail,function(statuscode,result,headers){
                    customlog.info("statuscode" + statuscode);
                    customlog.info("HEADERS:  "+headers)
                    customlog.info("RESULT"+result.status);
                    if(statuscode == 302){
                        res.redirect(props.contextPath+'/client/ci/logout');
                    }
                    else{
                        if(result.status == 'success'){
                            //var activityDetails = new Array(iklantPort, req.session.tenantId, req.session.userId, req.session.userName, req.originalUrl, req.connection.remoteAddress, "router.js", "loandisbursalReportLoadDetail", "success", "Loan Disbursal Report", "loandisbursalReportLoadDetail");
                            //self.commonRouter.insertActivityLogModel(activityDetails);
                            var officeList = new Array();
                            var prdCategoryList = new Array();
                            var loanOfficerList = new Array();
                            var ReportHolder = require(domainPath +"/ReportHolder");
                            var OfficeDto = require(domainPath +"/OfficeDto");
                            var PrdCatDto = require(domainPath +"/PrdCatDto");
                            var PersonnelDto = require(domainPath +"/PersonnelDto");
                            var reportHolder = new ReportHolder();
                            if(result.disbReportInfn.offices != null) {
                                for(var i =0; i<result.disbReportInfn.offices.length; i++) {
                                    var officeDto = new OfficeDto();
                                    officeDto.setId(result.disbReportInfn.offices[i].id);
                                    officeDto.setName(result.disbReportInfn.offices[i].name);
                                    customlog.info(result.disbReportInfn.offices[i].name);
                                    officeList[i] = officeDto;
                                }
                            }
                            if(result.disbReportInfn.prdCategories != null) {
                                for(var i =0; i<result.disbReportInfn.prdCategories.length; i++) {
                                    var prdCatDto = new PrdCatDto();
                                    prdCatDto.setPrdCatId(result.disbReportInfn.prdCategories[i].prdCatId);
                                    prdCatDto.setPrdCatName(result.disbReportInfn.prdCategories[i].prdCatName);
                                    prdCategoryList[i] = prdCatDto;
                                }

                            }
                            if(result.disbReportInfn.loanOfficers != null) {
                                for(var i =0; i<result.disbReportInfn.loanOfficers.length; i++) {
                                    var personnelDto = new PersonnelDto();
                                    personnelDto.setPersonnelId(result.disbReportInfn.loanOfficers[i].personnelId);
                                    personnelDto.setDisplayName(result.disbReportInfn.loanOfficers[i].displayName);
                                    loanOfficerList[i] = personnelDto;
                                }

                            }

                            reportHolder.setStartDate((result.disbReportInfn.startDate != null )?convertDate(result.disbReportInfn.startDate):"");
                            reportHolder.setEndDate((result.disbReportInfn.endDate != null )?convertDate(result.disbReportInfn.endDate):"");
                            //reportHolder.setEndDate(endDate);
                            customlog.info("statDate=="+reportHolder.getStartDate());
                            customlog.info("endDate=="+reportHolder.getEndDate());
                            reportHolder.setOfficeId(result.disbReportInfn.officeId);
                            reportHolder.setCategoryId(result.disbReportInfn.categoryId);
                            reportHolder.setLoanOfficerId(result.disbReportInfn.loanOfficerId);
                            reportHolder.setOffices(officeList);
                            reportHolder.setPrdCategories(prdCategoryList);
                            reportHolder.setLoanOfficers(loanOfficerList);

                            var LoanDisbursalDto = require(domainPath +"/LoanDisbursalDto");
                            var loanDisbursalSummary = new LoanDisbursalDto();
                            loanDisbursalSummary.setNoOfLoans(result.loanDisbSummary[0].noOfLoans);
                            loanDisbursalSummary.setTotalLoanAmount(parseInt(result.loanDisbSummary[0].totalLoanAmount,10)|| 0);

                            var loanDisbursalDetList = new Array();
                            for(var i=0; i<result.loanDisbDetail.length; i++) {
                                var loanDisbursalDetail = new LoanDisbursalDto();
                                loanDisbursalDetail.setLoanAccount(result.loanDisbDetail[i].loanAccount);
                                loanDisbursalDetail.setLoanNumber(result.loanDisbDetail[i].loanNumber);
                                loanDisbursalDetail.setGroupName(result.loanDisbDetail[i].groupName);
                                loanDisbursalDetail.setDisbursalDate(result.loanDisbDetail[i].disbursalDate);
                                loanDisbursalDetail.setLoanAmount(parseInt(result.loanDisbDetail[i].loanAmount,10)|| 0);
                                loanDisbursalDetail.setNoOfLoans(result.loanDisbDetail[i].noOfLoans);
                                //loanDisbursalDetail.setTotalLoanAmount(parseInt(result.loanDisbDetail[i].totalLoanAmount,10));
                                loanDisbursalDetList[i] = loanDisbursalDetail;
                            }
                            customlog.info(result.loanDisbDetail.length);
                            res.render("loanDisbursalReport",{reportHolder:reportHolder,loanDisbursalSummary:loanDisbursalSummary,loanDisbursalDetList:loanDisbursalDetList,isReportLoaded:1, contextPath:props.contextPath});
                        }
                        else{
                            self.showErrorPage(req,res);
                        }
                    }
                });
            }
        }catch(e){
            customlog.error("Exception while loandisbursalReportLoadDetail "+e);
            self.showErrorPage(req,res);
        }
	},
	
	
	loanOutstandingReportLoad : function(req,res){
		try{
            var self = this;
            var rest = require("./rest.js");
            var loanOutstandingReport = "";
            customlog.info("loanOutstandingReport"+loanOutstandingReport);
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
                'Content-Length' : Buffer.byteLength(loanOutstandingReport, 'utf8'),
                'Cookie' : req.session.mifosCookie
                };
                var options = {
                  host: 'localhost',
                  port: mifosPort,
                  path: '/mfi/api/report/account/loan/outstanding/load.json',
                  method: 'POST',
                  headers : postheaders
                };

                rest.postJSON(options,loanOutstandingReport,function(statuscode,result,headers){
                    customlog.info("statuscode" + statuscode);
                    customlog.info("HEADERS:  "+headers)
                    customlog.info("RESULT "+result.portfolioReportInfn);
                    if(statuscode == 302){
                        res.redirect(props.contextPath+'/client/ci/logout');
                    }
                    else{
                        if(result.status == 'success'){
                            //var activityDetails = new Array(iklantPort, req.session.tenantId, req.session.userId, req.session.userName, req.originalUrl, req.connection.remoteAddress, "router.js", "loanOutstandingReportLoad", "success", "Loan Outstanding Report", "loanOutstandingReportLoad");
                            //self.commonRouter.insertActivityLogModel(activityDetails);
                            var officeList = new Array();
                            var prdCategoryList = new Array();
                            var loanOfficerList = new Array();
                            var interestRateList = new Array();
                            var loanAmountsList = new Array();
                            var loanCategoriesList = new Array();
                            var loanCyclesList = new Array();
                            var loanProductsList = new Array();
                            var loanPurposesList = new Array();
                            var loanSizesList = new Array();
                            var statesList = new Array();
                            var LoanOutstandingHolder = require(domainPath +"/LoanOutstandingHolder");
                            var OfficeDto = require(domainPath +"/OfficeDto");
                            var PrdCatDto = require(domainPath +"/PrdCatDto");
                            var PersonnelDto = require(domainPath +"/PersonnelDto");
                            var PortfolioDto = require(domainPath +"/PortfolioDto");
                            var loanOutstandingHolder = new LoanOutstandingHolder();
                            if(result.portfolioReportInfn.offices != null) {
                                for(var i =0; i<result.portfolioReportInfn.offices.length; i++) {
                                    var officeDto = new OfficeDto();
                                    officeDto.setId(result.portfolioReportInfn.offices[i].id);
                                    officeDto.setName(result.portfolioReportInfn.offices[i].name);
                                    customlog.info(result.portfolioReportInfn.offices[i].name);
                                    officeList[i] = officeDto;
                                }
                            }
                            if(result.portfolioReportInfn.prdCategories != null) {
                                for(var i =0; i<result.portfolioReportInfn.prdCategories.length; i++) {
                                    var prdCatDto = new PrdCatDto();
                                    prdCatDto.setPrdCatId(result.portfolioReportInfn.prdCategories[i].prdCatId);
                                    prdCatDto.setPrdCatName(result.portfolioReportInfn.prdCategories[i].prdCatName);
                                    prdCategoryList[i] = prdCatDto;
                                }
                            }
                            if(result.portfolioReportInfn.loanOfficers != null) {
                                for(var i =0; i<result.portfolioReportInfn.loanOfficers.length; i++) {
                                    var personnelDto = new PersonnelDto();
                                    personnelDto.setPersonnelId(result.portfolioReportInfn.loanOfficers[i].personnelId);
                                    personnelDto.setDisplayName(result.portfolioReportInfn.loanOfficers[i].displayName);
                                    loanOfficerList[i] = personnelDto;
                                }
                            }
                            if(result.portfolioReportInfn.interestRates != null) {
                                for(var i =0; i<result.portfolioReportInfn.interestRates.length; i++) {
                                    customlog.info("INTEREST***************************"+result.portfolioReportInfn.interestRates[i].portfolioName);
                                    var interestRates = new PortfolioDto();
                                    interestRates.setPortfolioId(result.portfolioReportInfn.interestRates[i].portfolioId);
                                    interestRates.setPortfolioName(result.portfolioReportInfn.interestRates[i].portfolioName);
                                    interestRateList[i] = interestRates;
                                }
                            }
                            if(result.portfolioReportInfn.loanAmounts != null) {
                                for(var i =0; i<result.portfolioReportInfn.loanAmounts.length; i++) {
                                    var loanAmounts = new PortfolioDto();
                                    loanAmounts.setPortfolioId(result.portfolioReportInfn.loanAmounts[i].portfolioId);
                                    loanAmounts.setPortfolioName(result.portfolioReportInfn.loanAmounts[i].portfolioName);
                                    loanAmountsList[i] = loanAmounts;
                                }
                            }
                            if(result.portfolioReportInfn.loanCategories != null) {
                                for(var i =0; i<result.portfolioReportInfn.loanCategories.length; i++) {
                                    var loanCategories = new PortfolioDto();
                                    loanCategories.setPortfolioId(result.portfolioReportInfn.loanCategories[i].portfolioId);
                                    loanCategories.setPortfolioName(result.portfolioReportInfn.loanCategories[i].portfolioName);
                                    loanCategoriesList[i] = loanCategories;
                                }
                            }
                            if(result.portfolioReportInfn.loanCycles != null) {
                                for(var i =0; i<result.portfolioReportInfn.loanCycles.length; i++) {
                                    var loanCycles = new PortfolioDto();
                                    this.loanCycles = loanCycles;
                                    var loanCycles = this.loanCycles;
                                    loanCycles.setPortfolioId(result.portfolioReportInfn.loanCycles[i].portfolioId);
                                    loanCycles.setPortfolioName(result.portfolioReportInfn.loanCycles[i].portfolioName);
                                    loanCyclesList[i] = loanCycles;
                                }
                            }

                            if(result.portfolioReportInfn.loanProducts != null) {
                                for(var i =0; i<result.portfolioReportInfn.loanProducts.length; i++) {
                                    var loanProducts = new PortfolioDto();
                                    loanProducts.setPortfolioId(result.portfolioReportInfn.loanProducts[i].portfolioId);
                                    loanProducts.setPortfolioName(result.portfolioReportInfn.loanProducts[i].portfolioName);
                                    loanProductsList[i] = loanProducts;
                                }
                            }
                            if(result.portfolioReportInfn.loanPurposes != null) {
                                for(var i =0; i<result.portfolioReportInfn.loanPurposes.length; i++) {
                                    var loanPurposes = new PortfolioDto();
                                    loanPurposes.setPortfolioId(result.portfolioReportInfn.loanPurposes[i].portfolioId);
                                    loanPurposes.setPortfolioName(result.portfolioReportInfn.loanPurposes[i].portfolioName);
                                    loanPurposesList[i] = loanPurposes;
                                }
                            }
                            if(result.portfolioReportInfn.loanSizes != null) {
                                for(var i =0; i<result.portfolioReportInfn.loanSizes.length; i++) {
                                    var loanSizes = new PortfolioDto();
                                    loanSizes.setPortfolioId(result.portfolioReportInfn.loanSizes[i].portfolioId);
                                    loanSizes.setPortfolioName(result.portfolioReportInfn.loanSizes[i].portfolioName);
                                    loanSizesList[i] = loanSizes;
                                }
                            }
                            if(result.portfolioReportInfn.states != null) {
                                for(var i =0; i<result.portfolioReportInfn.states.length; i++) {
                                    var states = new PortfolioDto();
                                    states.setPortfolioId(result.portfolioReportInfn.states[i].portfolioId);
                                    states.setPortfolioName(result.portfolioReportInfn.states[i].portfolioName);
                                    statesList[i] = states;
                                }
                            }

                            customlog.info(result.portfolioReportInfn.loanPurposes[1]);
                            loanOutstandingHolder.setOffices(officeList);
                            loanOutstandingHolder.setPrdCategories(prdCategoryList);
                            loanOutstandingHolder.setLoanOfficers(loanOfficerList);
                            loanOutstandingHolder.setInterestRates(interestRateList);
                            loanOutstandingHolder.setLoanAmounts(loanAmountsList);
                            loanOutstandingHolder.setLoanCategories(loanCategoriesList);
                            loanOutstandingHolder.setLoanCycles(loanCyclesList);
                            loanOutstandingHolder.setLoanProducts(loanProductsList);
                            loanOutstandingHolder.setLoanPurposes(loanPurposesList);
                            loanOutstandingHolder.setLoanSizes(loanSizesList);
                            loanOutstandingHolder.setStates(statesList);
                            var LoanOutstandingSummaryList = new Array();
                            var LoanOutstandingDetailList = new Array();
                            res.render("loanOutstandingReport",{loanOutstandingHolder:loanOutstandingHolder,LoanOutstandingSummaryList:LoanOutstandingSummaryList,LoanOutstandingDetailList:LoanOutstandingDetailList,isReportLoaded:0, contextPath:props.contextPath});
                        } else {
                            self.showErrorPage(req,res);
                        }
                    }
                });
            }
        }catch(e){
            customlog.error("Exception while loanOutstandingReportLoad "+e);
            self.showErrorPage(req,res);
        }
	},
	
	loanOutstandingReportLoadLoanOfficers : function(req,res){
		try{
            var self = this;
            var startDate = req.body.startDate;
            if(startDate != "")
                startDate = convertToMifosDateFormat(startDate);
            else
                startDate = null;
            var endDate = req.body.endDate;
            if(endDate != "")
                endDate = convertToMifosDateFormat(endDate);
            else
                endDate = null;
            var office = req.body.office;
            var productCategory = req.body.productCategory;
            var category = req.body.category;

            var officeIds = req.body.officeIds;
            var offices = req.body.offices;
            var productCategoryIds = req.body.productCategoryIds;
            var productCategorys = req.body.productCategorys;
            var interestRateIds = req.body.interestRateIds;
            var interestRates = req.body.interestRates;
            var loanAmountIds = req.body.loanAmountIds;
            var loanAmountNames = req.body.loanAmountNames;
            var loanCycleIds = req.body.loanCycleIds;
            var loanCycleNames = req.body.loanCycleNames;
            var loanProductIds = req.body.loanProductIds;
            var loanProductNames = req.body.loanProductNames;
            var loanPurposeIds = req.body.loanPurposeIds;
            var loanPurposeNames = req.body.loanPurposeNames;
            var loanSizeIds = req.body.loanSizeIds;
            var loanSizeNames = req.body.loanSizeNames;
            var stateIds = req.body.stateIds;
            var stateNames = req.body.stateNames;


            var officeIdsArray = officeIds.split(",");
            var officesArray = offices.split(",");
            var productCategoryIdsArray = productCategoryIds.split(",");
            var productCategorysArray = productCategorys.split(",");
            var interestRateIdsArray = interestRateIds.split(",");
            var interestRatesArray = interestRates.split(",");
            var loanAmountIdsArray = loanAmountIds.split(",");
            var loanAmountNamesArray = loanAmountNames.split(",");
            var loanCycleIdsArray = loanCycleIds.split(",");
            var loanCycleNamesArray = loanCycleNames.split(",");
            var loanProductIdsArray = loanProductIds.split(",");
            var loanProductNamesArray = loanProductNames.split(",");
            var loanPurposeIdsArray = loanPurposeIds.split(",");
            var loanPurposeNamesArray = loanPurposeNames.split(",");
            var loanSizeIdsArray = loanSizeIds.split(",");
            var loanSizeNamesArray = loanSizeNames.split(",");
            var stateIdsArray = stateIds.split(",");
            var stateNamesArray = stateNames.split(",");


            var officeList = new Array();
            var prdCategoryList = new Array();
            var interestRateList = new Array();
            var loanAmountsList = new Array();
            var loanCategoriesList = new Array();
            var loanCyclesList = new Array();
            var loanProductsList = new Array();
            var loanPurposesList = new Array();
            var loanSizesList = new Array();
            var statesList = new Array();

            var LoanOutstandingHolder = require(domainPath +"/LoanOutstandingHolder");
            var OfficeDto = require(domainPath +"/OfficeDto");
            var PrdCatDto = require(domainPath +"/PrdCatDto");
            var PersonnelDto = require(domainPath +"/PersonnelDto");
            var PortfolioDto = require(domainPath +"/PortfolioDto");
            var loanOutstandingHolder = new LoanOutstandingHolder();

            for(var i =0; i<officeIdsArray.length; i++) {
                var officeDto = new OfficeDto();
                officeDto.setId(officeIdsArray[i]);
                officeDto.setName(officesArray[i]);
                officeList[i] = officeDto;
            }

            for(var i =0; i<productCategoryIdsArray.length; i++) {
                var prdCatDto = new PrdCatDto();
                prdCatDto.setPrdCatId(productCategoryIdsArray[i]);
                prdCatDto.setPrdCatName(productCategorysArray[i]);
                prdCategoryList[i] = prdCatDto;
            }

            for(var i =0; i<interestRateIdsArray.length; i++) {
                var interestRates = new PortfolioDto();
                interestRates.setPortfolioId(interestRateIdsArray[i]);
                interestRates.setPortfolioName(interestRatesArray[i]);
                interestRateList[i] = interestRates;
            }

            for(var i =0; i<loanAmountIdsArray.length; i++) {
                var loanAmounts = new PortfolioDto();
                loanAmounts.setPortfolioId(loanAmountIdsArray[i]);
                loanAmounts.setPortfolioName(loanAmountNamesArray[i]);
                loanAmountsList[i] = loanAmounts;
            }


            for(var i =0; i<loanCycleIdsArray.length; i++) {
                var loanCycles = new PortfolioDto();
                loanCycles.setPortfolioId(loanCycleIdsArray[i]);
                loanCycles.setPortfolioName(loanCycleNamesArray[i]);
                loanCyclesList[i] = loanCycles;
            }

            for(var i =0; i<loanProductIdsArray.length; i++) {
                var loanProducts = new PortfolioDto();
                loanProducts.setPortfolioId(loanProductIdsArray[i]);
                loanProducts.setPortfolioName(loanProductNamesArray[i]);
                loanProductsList[i] = loanProducts;
            }

            var loanPurposeIdsArray = loanPurposeIds.split(",");
            var loanPurposeNamesArray = loanPurposeNames.split(",");
            var loanSizeIdsArray = loanSizeIds.split(",");
            var loanSizeNamesArray = loanSizeNames.split(",");
            var stateIdsArray = stateIds.split(",");
            var stateNamesArray = stateNames.split(",");

            for(var i =0; i<loanPurposeIdsArray.length; i++) {
                var loanPurposes = new PortfolioDto();
                loanPurposes.setPortfolioId(loanPurposeIdsArray[i]);
                loanPurposes.setPortfolioName(loanPurposeNamesArray[i]);
                loanPurposesList[i] = loanPurposes;
            }

            for(var i =0; i<loanSizeIdsArray.length; i++) {
                var loanSizes = new PortfolioDto();
                loanSizes.setPortfolioId(loanSizeIdsArray[i]);
                loanSizes.setPortfolioName(loanSizeNamesArray[i]);
                loanSizesList[i] = loanSizes;
            }

            for(var i =0; i<stateIdsArray.length; i++) {
                var states = new PortfolioDto();
                states.setPortfolioId(stateIdsArray[i]);
                states.setPortfolioName(stateNamesArray[i]);
                statesList[i] = states;
            }

            loanOutstandingHolder.setStartDate(startDate);
            loanOutstandingHolder.setEndDate(endDate);
            loanOutstandingHolder.setOfficeId(office);
            loanOutstandingHolder.setCategoryId(productCategory);
            loanOutstandingHolder.setOffices(officeList);
            loanOutstandingHolder.setPrdCategories(prdCategoryList);
            loanOutstandingHolder.setInterestRates(interestRateList);
            loanOutstandingHolder.setLoanAmounts(loanAmountsList);
            loanOutstandingHolder.setLoanCategories(loanCategoriesList);
            loanOutstandingHolder.setLoanCycles(loanCyclesList);
            loanOutstandingHolder.setLoanProducts(loanProductsList);
            loanOutstandingHolder.setLoanPurposes(loanPurposesList);
            loanOutstandingHolder.setLoanSizes(loanSizesList);
            loanOutstandingHolder.setStates(statesList);

            var rest = require("./rest.js");
            var loanOutstandingReport = JSON.stringify(loanOutstandingHolder);
            customlog.info("loanOutstandingReport"+loanOutstandingReport);
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
                'Content-Length' : Buffer.byteLength(loanOutstandingReport, 'utf8'),
                'Cookie' : req.session.mifosCookie
                };
                var options = {
                  host: 'localhost',
                  port: mifosPort,
                  path: '/mfi/api/report/account/loan/outstanding/loadLoanOfficers.json',
                  method: 'POST',
                  headers : postheaders
                };

                rest.postJSON(options,loanOutstandingReport,function(statuscode,result,headers){
                    customlog.info("statuscode" + statuscode);
                    customlog.info("HEADERS:  "+headers)
                    customlog.info("RESULT "+result.portfolioReportInfn);
                    if(statuscode == 302){
                        res.redirect(props.contextPath+'/client/ci/logout');
                    }
                    else{
                        if(result.status == 'success'){
                            //var activityDetails = new Array(iklantPort, req.session.tenantId, req.session.userId, req.session.userName, req.originalUrl, req.connection.remoteAddress, "router.js", "loanOutstandingReportLoadLoanOfficers", "success", "Loan Outstanding Report", "loanOutstandingReportLoadLoanOfficers");
                            //self.commonRouter.insertActivityLogModel(activityDetails);
                            var officeList = new Array();
                            var prdCategoryList = new Array();
                            var loanOfficerList = new Array();
                            var interestRateList = new Array();
                            var loanAmountsList = new Array();
                            var loanCategoriesList = new Array();
                            var loanCyclesList = new Array();
                            var loanProductsList = new Array();
                            var loanPurposesList = new Array();
                            var loanSizesList = new Array();
                            var statesList = new Array();
                            var LoanOutstandingHolder = require(domainPath +"/LoanOutstandingHolder");
                            var OfficeDto = require(domainPath +"/OfficeDto");
                            var PrdCatDto = require(domainPath +"/PrdCatDto");
                            var PersonnelDto = require(domainPath +"/PersonnelDto");
                            var PortfolioDto = require(domainPath +"/PortfolioDto");
                            var loanOutstandingHolder = new LoanOutstandingHolder();
                            if(result.portfolioReportInfn.offices != null) {
                                for(var i =0; i<result.portfolioReportInfn.offices.length; i++) {
                                    var officeDto = new OfficeDto();
                                    officeDto.setId(result.portfolioReportInfn.offices[i].id);
                                    officeDto.setName(result.portfolioReportInfn.offices[i].name);
                                    customlog.info(result.portfolioReportInfn.offices[i].name);
                                    officeList[i] = officeDto;
                                }
                            }
                            if(result.portfolioReportInfn.prdCategories != null) {
                                for(var i =0; i<result.portfolioReportInfn.prdCategories.length; i++) {
                                    var prdCatDto = new PrdCatDto();
                                    prdCatDto.setPrdCatId(result.portfolioReportInfn.prdCategories[i].prdCatId);
                                    prdCatDto.setPrdCatName(result.portfolioReportInfn.prdCategories[i].prdCatName);
                                    prdCategoryList[i] = prdCatDto;
                                }
                            }
                            if(result.portfolioReportInfn.loanOfficers != null) {
                                for(var i =0; i<result.portfolioReportInfn.loanOfficers.length; i++) {
                                    var personnelDto = new PersonnelDto();
                                    personnelDto.setPersonnelId(result.portfolioReportInfn.loanOfficers[i].personnelId);
                                    personnelDto.setDisplayName(result.portfolioReportInfn.loanOfficers[i].displayName);
                                    loanOfficerList[i] = personnelDto;
                                }
                            }
                            if(result.portfolioReportInfn.interestRates != null) {
                                for(var i =0; i<result.portfolioReportInfn.interestRates.length; i++) {
                                    var interestRates = new PortfolioDto();
                                    interestRates.setPortfolioId(result.portfolioReportInfn.interestRates[i].portfolioId);
                                    interestRates.setPortfolioName(result.portfolioReportInfn.interestRates[i].portfolioName);
                                    interestRateList[i] = interestRates;
                                }
                            }
                            if(result.portfolioReportInfn.loanAmounts != null) {
                                for(var i =0; i<result.portfolioReportInfn.loanAmounts.length; i++) {
                                    var loanAmounts = new PortfolioDto();
                                    loanAmounts.setPortfolioId(result.portfolioReportInfn.loanAmounts[i].portfolioId);
                                    loanAmounts.setPortfolioName(result.portfolioReportInfn.loanAmounts[i].portfolioName);
                                    loanAmountsList[i] = loanAmounts;
                                }
                            }
                            if(result.portfolioReportInfn.loanCategories != null) {
                                for(var i =0; i<result.portfolioReportInfn.loanCategories.length; i++) {
                                    var loanCategories = new PortfolioDto();
                                    loanCategories.setPortfolioId(result.portfolioReportInfn.loanCategories[i].portfolioId);
                                    loanCategories.setPortfolioName(result.portfolioReportInfn.loanCategories[i].portfolioName);
                                    loanCategoriesList[i] = loanCategories;
                                }
                            }
                            if(result.portfolioReportInfn.loanCycles != null) {
                                for(var i =0; i<result.portfolioReportInfn.loanCycles.length; i++) {
                                    var loanCycles = new PortfolioDto();
                                    loanCycles.setPortfolioId(result.portfolioReportInfn.loanCycles[i].portfolioId);
                                    loanCycles.setPortfolioName(result.portfolioReportInfn.loanCycles[i].portfolioName);
                                    loanCyclesList[i] = loanCycles;
                                }
                            }

                            if(result.portfolioReportInfn.loanProducts != null) {
                                for(var i =0; i<result.portfolioReportInfn.loanProducts.length; i++) {
                                    var loanProducts = new PortfolioDto();
                                    loanProducts.setPortfolioId(result.portfolioReportInfn.loanProducts[i].portfolioId);
                                    loanProducts.setPortfolioName(result.portfolioReportInfn.loanProducts[i].portfolioName);
                                    loanProductsList[i] = loanProducts;
                                }
                            }
                            if(result.portfolioReportInfn.loanPurposes != null) {
                                for(var i =0; i<result.portfolioReportInfn.loanPurposes.length; i++) {
                                    var loanPurposes = new PortfolioDto();
                                    loanPurposes.setPortfolioId(result.portfolioReportInfn.loanPurposes[i].portfolioId);
                                    loanPurposes.setPortfolioName(result.portfolioReportInfn.loanPurposes[i].portfolioName);
                                    loanPurposesList[i] = loanPurposes;
                                }
                            }
                            if(result.portfolioReportInfn.loanSizes != null) {
                                for(var i =0; i<result.portfolioReportInfn.loanSizes.length; i++) {
                                    var loanSizes = new PortfolioDto();
                                    loanSizes.setPortfolioId(result.portfolioReportInfn.loanSizes[i].portfolioId);
                                    loanSizes.setPortfolioName(result.portfolioReportInfn.loanSizes[i].portfolioName);
                                    loanSizesList[i] = loanSizes;
                                }
                            }
                            if(result.portfolioReportInfn.states != null) {
                                for(var i =0; i<result.portfolioReportInfn.states.length; i++) {
                                    var states = new PortfolioDto();
                                    states.setPortfolioId(result.portfolioReportInfn.states[i].portfolioId);
                                    states.setPortfolioName(result.portfolioReportInfn.states[i].portfolioName);
                                    statesList[i] = states;
                                }
                            }
                            customlog.info(result.portfolioReportInfn.loanPurposes[1]);
                            loanOutstandingHolder.setStartDate((result.portfolioReportInfn.startDate != null )?convertDate(result.portfolioReportInfn.startDate):"");
                            loanOutstandingHolder.setEndDate((result.portfolioReportInfn.endDate != null )?convertDate(result.portfolioReportInfn.endDate):"");
                            loanOutstandingHolder.setOfficeId(result.portfolioReportInfn.officeId);
                            loanOutstandingHolder.setLoanOfficerId(result.portfolioReportInfn.loanOfficerId);
                            loanOutstandingHolder.setCategoryId(result.portfolioReportInfn.categoryId);
                            loanOutstandingHolder.setOffices(officeList);
                            loanOutstandingHolder.setLoanOfficers(loanOfficerList);
                            loanOutstandingHolder.setPrdCategories(prdCategoryList);
                            loanOutstandingHolder.setInterestRates(interestRateList);
                            loanOutstandingHolder.setLoanAmounts(loanAmountsList);
                            loanOutstandingHolder.setLoanCategories(loanCategoriesList);
                            loanOutstandingHolder.setLoanCycles(loanCyclesList);
                            loanOutstandingHolder.setLoanProducts(loanProductsList);
                            loanOutstandingHolder.setLoanPurposes(loanPurposesList);
                            loanOutstandingHolder.setLoanSizes(loanSizesList);
                            loanOutstandingHolder.setStates(statesList);
                            var LoanOutstandingSummaryList = new Array();
                            var LoanOutstandingDetailList = new Array();
                            res.render("loanOutstandingReport",{loanOutstandingHolder:loanOutstandingHolder,LoanOutstandingSummaryList:LoanOutstandingSummaryList,LoanOutstandingDetailList:LoanOutstandingDetailList,isReportLoaded:0, contextPath:props.contextPath});
                        } else {
                            self.showErrorPage(req,res);
                        }
                    }
                });
            }
        }catch(e){
            customlog.error("Exception while loanOutstandingReportLoadLoanOfficers "+e);
            self.showErrorPage(req,res);
        }
	},

	loanOutstandingReportLoadDetail :  function(req,res) {
        try{
            var self = this;
            var startDate = req.body.startDate;
            if(startDate != "")
                startDate = convertToMifosDateFormat(startDate);
            else
                startDate = null;
            var endDate = req.body.endDate;
            if(endDate != "")
                endDate = convertToMifosDateFormat(endDate);
            else
                endDate = null;
            var office = req.body.office;
            var productCategory = req.body.productCategory;
            var loanOfficer = req.body.loanOfficer;
            var portfolioCategory = req.body.category;

            var officeIds = req.body.officeIds;
            var offices = req.body.offices;
            var loanOfficerIds = req.body.loanOfficerIds;
            var loanOfficerNames = req.body.loanOfficerNames;
            var productCategoryIds = req.body.productCategoryIds;
            var productCategorys = req.body.productCategorys;
            var interestRateIds = req.body.interestRateIds;
            var interestRates = req.body.interestRates;
            var loanAmountIds = req.body.loanAmountIds;
            var loanAmountNames = req.body.loanAmountNames;
            var loanCycleIds = req.body.loanCycleIds;
            var loanCycleNames = req.body.loanCycleNames;
            var loanProductIds = req.body.loanProductIds;
            var loanProductNames = req.body.loanProductNames;
            var loanPurposeIds = req.body.loanPurposeIds;
            var loanPurposeNames = req.body.loanPurposeNames;
            var loanSizeIds = req.body.loanSizeIds;
            var loanSizeNames = req.body.loanSizeNames;
            var stateIds = req.body.stateIds;
            var stateNames = req.body.stateNames;


            var officeIdsArray = officeIds.split(",");
            var officesArray = offices.split(",");
            var loanOfficerIdsArray = loanOfficerIds.split(",");
            var loanOfficerNamesArray = loanOfficerNames.split(",");
            var productCategoryIdsArray = productCategoryIds.split(",");
            var productCategorysArray = productCategorys.split(",");
            var interestRateIdsArray = interestRateIds.split(",");
            var interestRatesArray = interestRates.split(",");
            var loanAmountIdsArray = loanAmountIds.split(",");
            var loanAmountNamesArray = loanAmountNames.split(",");
            var loanCycleIdsArray = loanCycleIds.split(",");
            var loanCycleNamesArray = loanCycleNames.split(",");
            var loanProductIdsArray = loanProductIds.split(",");
            var loanProductNamesArray = loanProductNames.split(",");
            var loanPurposeIdsArray = loanPurposeIds.split(",");
            var loanPurposeNamesArray = loanPurposeNames.split(",");
            var loanSizeIdsArray = loanSizeIds.split(",");
            var loanSizeNamesArray = loanSizeNames.split(",");
            var stateIdsArray = stateIds.split(",");
            var stateNamesArray = stateNames.split(",");


            var officeList = new Array();
            var loanOfficerList = new Array();
            var prdCategoryList = new Array();
            var interestRateList = new Array();
            var loanAmountsList = new Array();
            var loanCategoriesList = new Array();
            var loanCyclesList = new Array();
            var loanProductsList = new Array();
            var loanPurposesList = new Array();
            var loanSizesList = new Array();
            var statesList = new Array();

            var LoanOutstandingHolder = require(domainPath +"/LoanOutstandingHolder");
            var OfficeDto = require(domainPath +"/OfficeDto");
            var PersonnelDto = require(domainPath +"/PersonnelDto");
            var PrdCatDto = require(domainPath +"/PrdCatDto");
            var PersonnelDto = require(domainPath +"/PersonnelDto");
            var PortfolioDto = require(domainPath +"/PortfolioDto");
            var loanOutstandingHolder = new LoanOutstandingHolder();

            for(var i =0; i<officeIdsArray.length; i++) {
                var officeDto = new OfficeDto();
                officeDto.setId(officeIdsArray[i]);
                officeDto.setName(officesArray[i]);
                officeList[i] = officeDto;
            }

            for(var i =0; i<loanOfficerIdsArray.length; i++) {
                var personnelDto = new PersonnelDto();
                personnelDto.setPersonnelId(loanOfficerIdsArray[i]);
                personnelDto.setDisplayName(loanOfficerNamesArray[i]);
                loanOfficerList[i] = personnelDto;
                customlog.info(loanOfficerNamesArray[i]);
            }


            for(var i =0; i<productCategoryIdsArray.length; i++) {
                var prdCatDto = new PrdCatDto();
                prdCatDto.setPrdCatId(productCategoryIdsArray[i]);
                prdCatDto.setPrdCatName(productCategorysArray[i]);
                prdCategoryList[i] = prdCatDto;
            }

            for(var i =0; i<interestRateIdsArray.length; i++) {
                var interestRates = new PortfolioDto();
                interestRates.setPortfolioId(interestRateIdsArray[i]);
                interestRates.setPortfolioName(interestRatesArray[i]);
                interestRateList[i] = interestRates;
            }

            for(var i =0; i<loanAmountIdsArray.length; i++) {
                var loanAmounts = new PortfolioDto();
                loanAmounts.setPortfolioId(loanAmountIdsArray[i]);
                loanAmounts.setPortfolioName(loanAmountNamesArray[i]);
                loanAmountsList[i] = loanAmounts;
            }


            for(var i =0; i<loanCycleIdsArray.length; i++) {
                var loanCycles = new PortfolioDto();
                loanCycles.setPortfolioId(loanCycleIdsArray[i]);
                loanCycles.setPortfolioName(loanCycleNamesArray[i]);
                loanCyclesList[i] = loanCycles;
            }

            for(var i =0; i<loanProductIdsArray.length; i++) {
                var loanProducts = new PortfolioDto();
                loanProducts.setPortfolioId(loanProductIdsArray[i]);
                loanProducts.setPortfolioName(loanProductNamesArray[i]);
                loanProductsList[i] = loanProducts;
            }

            var loanPurposeIdsArray = loanPurposeIds.split(",");
            var loanPurposeNamesArray = loanPurposeNames.split(",");
            var loanSizeIdsArray = loanSizeIds.split(",");
            var loanSizeNamesArray = loanSizeNames.split(",");
            var stateIdsArray = stateIds.split(",");
            var stateNamesArray = stateNames.split(",");

            for(var i =0; i<loanPurposeIdsArray.length; i++) {
                var loanPurposes = new PortfolioDto();
                loanPurposes.setPortfolioId(loanPurposeIdsArray[i]);
                loanPurposes.setPortfolioName(loanPurposeNamesArray[i]);
                loanPurposesList[i] = loanPurposes;
            }

            for(var i =0; i<loanSizeIdsArray.length; i++) {
                var loanSizes = new PortfolioDto();
                loanSizes.setPortfolioId(loanSizeIdsArray[i]);
                loanSizes.setPortfolioName(loanSizeNamesArray[i]);
                loanSizesList[i] = loanSizes;
            }

            for(var i =0; i<stateIdsArray.length; i++) {
                var states = new PortfolioDto();
                states.setPortfolioId(stateIdsArray[i]);
                states.setPortfolioName(stateNamesArray[i]);
                statesList[i] = states;
            }

            var currentPath = "";
            if(portfolioCategory == 1){
                currentPath = '/mfi/api/report/account/loan/outstanding/getInterestRate.json';
                loanOutstandingHolder.setPortfolioSubCategoryId(req.body.subCategory);
            }
            else if(portfolioCategory == 2){
                currentPath = '/mfi/api/report/account/loan/outstanding/getLoanAmount.json';
                loanOutstandingHolder.setPortfolioSubCategoryId(req.body.subCategory);
            }
            else if(portfolioCategory == 3){
                currentPath = '/mfi/api/report/account/loan/outstanding/getLoanCycle.json';
                loanOutstandingHolder.setPortfolioSubCategoryId(req.body.subCategory);
            }
            else if(portfolioCategory == 4){
                currentPath = '/mfi/api/report/account/loan/outstanding/getLoanProduct.json';
                loanOutstandingHolder.setPortfolioSubCategoryId(req.body.subCategory);
            }
            else if(portfolioCategory == 5){
                currentPath = '/mfi/api/report/account/loan/outstanding/getLoanPurpose.json';
                loanOutstandingHolder.setPortfolioSubCategoryId(req.body.subCategory);
            }
            else if(portfolioCategory == 6){
                currentPath = '/mfi/api/report/account/loan/outstanding/getLoanSize.json';
                loanOutstandingHolder.setPortfolioSubCategoryId(req.body.subCategory);
            }
            else if(portfolioCategory == 7){
                currentPath = '/mfi/api/report/account/loan/outstanding/getState.json';
                loanOutstandingHolder.setPortfolioSubCategoryId(req.body.subCategory);
            }
            loanOutstandingHolder.setPortfolioCategoryId(portfolioCategory);
            loanOutstandingHolder.setStartDate(startDate);
            loanOutstandingHolder.setEndDate(endDate);
            loanOutstandingHolder.setOfficeId(office);
            loanOutstandingHolder.setLoanOfficerId(loanOfficer);
            loanOutstandingHolder.setCategoryId(productCategory);
            loanOutstandingHolder.setOffices(officeList);
            loanOutstandingHolder.setLoanOfficers(loanOfficerList);
            loanOutstandingHolder.setPrdCategories(prdCategoryList);
            loanOutstandingHolder.setInterestRates(interestRateList);
            loanOutstandingHolder.setLoanAmounts(loanAmountsList);
            loanOutstandingHolder.setLoanCategories(loanCategoriesList);
            loanOutstandingHolder.setLoanCycles(loanCyclesList);
            loanOutstandingHolder.setLoanProducts(loanProductsList);
            loanOutstandingHolder.setLoanPurposes(loanPurposesList);
            loanOutstandingHolder.setLoanSizes(loanSizesList);
            loanOutstandingHolder.setStates(statesList);

            customlog.info("Current Path="+currentPath);
            var rest = require("./rest.js");
            var loanOutstandingReport = JSON.stringify(loanOutstandingHolder);
            customlog.info("loanOutstandingReport"+loanOutstandingReport);
            var http = require('http');
            var https = require('https');
            customlog.info("Cookie:"+req.session.mifosCookie);
            var cookie = req.session.mifosCookie;
            if(typeof cookie == 'undefined') {
                res.redirect(props.contextPath+'/client/ci/login');
            }
            else {
                var self = this;
                var postheaders = {
                'Content-Type' : 'application/json',
                'Content-Length' : Buffer.byteLength(loanOutstandingReport, 'utf8'),
                'Cookie' : req.session.mifosCookie
                };


                var options = {
                  host: 'localhost',
                  port: mifosPort,
                  path: currentPath,
                  method: 'POST',
                  headers : postheaders
                };

                rest.postJSON(options,loanOutstandingReport,function(statuscode,result,headers){
                    customlog.info("statuscode" + statuscode);
                    customlog.info("HEADERS:  "+headers)
                    customlog.info("RESULT "+result.portfolioDetail);
                    if(statuscode == 302){
                        res.redirect(props.contextPath+'/client/ci/logout');
                    }
                    else{
                        if(result.status == 'success'){
                            //var activityDetails = new Array(iklantPort, req.session.tenantId, req.session.userId, req.session.userName, req.originalUrl, req.connection.remoteAddress, "router.js", "loanOutstandingReportLoadDetail", "success", "Loan Outstanding Report", "loanOutstandingReportLoadDetail");
                            //self.commonRouter.insertActivityLogModel(activityDetails);
                            var officeList = new Array();
                            var prdCategoryList = new Array();
                            var loanOfficerList = new Array();
                            var interestRateList = new Array();
                            var loanAmountsList = new Array();
                            var loanCategoriesList = new Array();
                            var loanCyclesList = new Array();
                            var loanProductsList = new Array();
                            var loanPurposesList = new Array();
                            var loanSizesList = new Array();
                            var statesList = new Array();
                            var LoanOutstandingSummaryList = new Array();
                            var LoanOutstandingDetailList = new Array();
                            var LoanOutstandingHolder = require(domainPath +"/LoanOutstandingHolder");
                            //var LoanOutstandingDto = require(domainPath +"/LoanOutstandingDto");
                            var OfficeDto = require(domainPath +"/OfficeDto");
                            var PrdCatDto = require(domainPath +"/PrdCatDto");
                            var PersonnelDto = require(domainPath +"/PersonnelDto");
                            var PortfolioDto = require(domainPath +"/PortfolioDto");
                            var loanOutstandingHolder = new LoanOutstandingHolder();

                            if(result.portfolioSummary != null) {
                                for(var i =0; i<result.portfolioSummary.length; i++) {
                                    var loanOutstandingSummary = new LoanOutstandingDto();
                                    loanOutstandingSummary.setPrincipal(parseInt(result.portfolioSummary[i].principal,10)||0);
                                    loanOutstandingSummary.setPrincipalPaid(parseInt(result.portfolioSummary[i].principalPaid,10)||0);
                                    loanOutstandingSummary.setPrincipalOutstanding(parseInt(result.portfolioSummary[i].principalOutstanding,10)||0);
                                    loanOutstandingSummary.setPortfolioName(result.portfolioSummary[i].portfolioName);
                                    LoanOutstandingSummaryList[i] = loanOutstandingSummary;
                                }
                            }
                            if(result.portfolioDetail != null) {
                                for(var i =0; i<result.portfolioDetail.length; i++) {
                                    var LoanOutstandingDetail = new LoanOutstandingDto();
                                    LoanOutstandingDetail.setGroupName(result.portfolioDetail[i].groupName);
                                    LoanOutstandingDetail.setLoanAccount(result.portfolioDetail[i].loanAccount);
                                    LoanOutstandingDetail.setPrincipal(parseInt(result.portfolioDetail[i].principal,10)||0);
                                    LoanOutstandingDetail.setPrincipalPaid(parseInt(result.portfolioDetail[i].principalPaid,10)||0);
                                    LoanOutstandingDetail.setPrincipalOutstanding(parseInt(result.portfolioDetail[i].principalOutstanding,10)||0);
                                    LoanOutstandingDetail.setPortfolioName(result.portfolioDetail[i].portfolioName);
                                    LoanOutstandingDetailList[i] = LoanOutstandingDetail;
                                }
                            }

                            if(result.portfolioReportInfn.offices != null) {
                                for(var i =0; i<result.portfolioReportInfn.offices.length; i++) {
                                    var officeDto = new OfficeDto();
                                    officeDto.setId(result.portfolioReportInfn.offices[i].id);
                                    officeDto.setName(result.portfolioReportInfn.offices[i].name);
                                    customlog.info(result.portfolioReportInfn.offices[i].name);
                                    officeList[i] = officeDto;
                                }
                            }
                            if(result.portfolioReportInfn.prdCategories != null) {
                                for(var i =0; i<result.portfolioReportInfn.prdCategories.length; i++) {
                                    var prdCatDto = new PrdCatDto();
                                    prdCatDto.setPrdCatId(result.portfolioReportInfn.prdCategories[i].prdCatId);
                                    prdCatDto.setPrdCatName(result.portfolioReportInfn.prdCategories[i].prdCatName);
                                    prdCategoryList[i] = prdCatDto;
                                }
                            }
                            if(result.portfolioReportInfn.loanOfficers != null) {
                                for(var i =0; i<result.portfolioReportInfn.loanOfficers.length; i++) {
                                    var personnelDto = new PersonnelDto();
                                    personnelDto.setPersonnelId(result.portfolioReportInfn.loanOfficers[i].personnelId);
                                    personnelDto.setDisplayName(result.portfolioReportInfn.loanOfficers[i].displayName);
                                    loanOfficerList[i] = personnelDto;
                                }
                            }
                            if(result.portfolioReportInfn.interestRates != null) {
                                for(var i =0; i<result.portfolioReportInfn.interestRates.length; i++) {
                                    var interestRates = new PortfolioDto();
                                    interestRates.setPortfolioId(result.portfolioReportInfn.interestRates[i].portfolioId);
                                    interestRates.setPortfolioName(result.portfolioReportInfn.interestRates[i].portfolioName);
                                    interestRateList[i] = interestRates;
                                }
                            }
                            if(result.portfolioReportInfn.loanAmounts != null) {
                                for(var i =0; i<result.portfolioReportInfn.loanAmounts.length; i++) {
                                    var loanAmounts = new PortfolioDto();
                                    loanAmounts.setPortfolioId(result.portfolioReportInfn.loanAmounts[i].portfolioId);
                                    loanAmounts.setPortfolioName(result.portfolioReportInfn.loanAmounts[i].portfolioName);
                                    loanAmountsList[i] = loanAmounts;
                                }
                            }
                            if(result.portfolioReportInfn.loanCategories != null) {
                                for(var i =0; i<result.portfolioReportInfn.loanCategories.length; i++) {
                                    var loanCategories = new PortfolioDto();
                                    loanCategories.setPortfolioId(result.portfolioReportInfn.loanCategories[i].portfolioId);
                                    loanCategories.setPortfolioName(result.portfolioReportInfn.loanCategories[i].portfolioName);
                                    loanCategoriesList[i] = loanCategories;
                                }
                            }
                            if(result.portfolioReportInfn.loanCycles != null) {
                                for(var i =0; i<result.portfolioReportInfn.loanCycles.length; i++) {
                                    var loanCycles = new PortfolioDto();
                                    loanCycles.setPortfolioId(result.portfolioReportInfn.loanCycles[i].portfolioId);
                                    loanCycles.setPortfolioName(result.portfolioReportInfn.loanCycles[i].portfolioName);
                                    loanCyclesList[i] = loanCycles;
                                }
                            }

                            if(result.portfolioReportInfn.loanProducts != null) {
                                for(var i =0; i<result.portfolioReportInfn.loanProducts.length; i++) {
                                    var loanProducts = new PortfolioDto();
                                    loanProducts.setPortfolioId(result.portfolioReportInfn.loanProducts[i].portfolioId);
                                    loanProducts.setPortfolioName(result.portfolioReportInfn.loanProducts[i].portfolioName);
                                    loanProductsList[i] = loanProducts;
                                }
                            }
                            if(result.portfolioReportInfn.loanPurposes != null) {
                                for(var i =0; i<result.portfolioReportInfn.loanPurposes.length; i++) {
                                    var loanPurposes = new PortfolioDto();
                                    loanPurposes.setPortfolioId(result.portfolioReportInfn.loanPurposes[i].portfolioId);
                                    loanPurposes.setPortfolioName(result.portfolioReportInfn.loanPurposes[i].portfolioName);
                                    loanPurposesList[i] = loanPurposes;
                                }
                            }
                            if(result.portfolioReportInfn.loanSizes != null) {
                                for(var i =0; i<result.portfolioReportInfn.loanSizes.length; i++) {
                                    var loanSizes = new PortfolioDto();
                                    loanSizes.setPortfolioId(result.portfolioReportInfn.loanSizes[i].portfolioId);
                                    loanSizes.setPortfolioName(result.portfolioReportInfn.loanSizes[i].portfolioName);
                                    loanSizesList[i] = loanSizes;
                                }
                            }
                            if(result.portfolioReportInfn.states != null) {
                                for(var i =0; i<result.portfolioReportInfn.states.length; i++) {
                                    var states = new PortfolioDto();
                                    states.setPortfolioId(result.portfolioReportInfn.states[i].portfolioId);
                                    states.setPortfolioName(result.portfolioReportInfn.states[i].portfolioName);
                                    statesList[i] = states;
                                }
                            }
                            customlog.info(result.portfolioReportInfn.loanPurposes[1]);
                            loanOutstandingHolder.setStartDate((result.portfolioReportInfn.startDate != null )?convertDate(result.portfolioReportInfn.startDate):"");
                            loanOutstandingHolder.setEndDate((result.portfolioReportInfn.endDate != null )?convertDate(result.portfolioReportInfn.endDate):"");
                            loanOutstandingHolder.setOfficeId(result.portfolioReportInfn.officeId);
                            loanOutstandingHolder.setCategoryId(result.portfolioReportInfn.categoryId);
                            loanOutstandingHolder.setPortfolioCategoryId(result.portfolioReportInfn.portfolioCategoryId);
                            loanOutstandingHolder.setPortfolioSubCategoryId(result.portfolioReportInfn.portfolioSubCategoryId);
                            loanOutstandingHolder.setOffices(officeList);
                            loanOutstandingHolder.setLoanOfficerId(productCategory);
                            loanOutstandingHolder.setPrdCategories(prdCategoryList);
                            loanOutstandingHolder.setLoanOfficers(loanOfficerList);
                            loanOutstandingHolder.setInterestRates(interestRateList);
                            loanOutstandingHolder.setLoanAmounts(loanAmountsList);
                            loanOutstandingHolder.setLoanCategories(loanCategoriesList);
                            loanOutstandingHolder.setLoanCycles(loanCyclesList);
                            loanOutstandingHolder.setLoanProducts(loanProductsList);
                            loanOutstandingHolder.setLoanPurposes(loanPurposesList);
                            loanOutstandingHolder.setLoanSizes(loanSizesList);
                            loanOutstandingHolder.setStates(statesList);
                            //customlog.info("result.portfolioReportInfn.portfolioCategoryId=="+result.portfolioReportInfn.portfolioCategoryId);
                            res.render("loanOutstandingReport",{loanOutstandingHolder:loanOutstandingHolder,LoanOutstandingSummaryList:LoanOutstandingSummaryList,LoanOutstandingDetailList:LoanOutstandingDetailList,isReportLoaded:1, contextPath:props.contextPath});
                        } else {
                            self.showErrorPage(req,res);
                        }
                    }
                });
            }
        }catch(e){
            customlog.error("Exception while loanOutstandingReportLoadDetail "+e);
            self.showErrorPage(req,res);
        }
	},*/
    /*individualPreclosure :  function(req,res) {
        var self=this;
        try{
            customlog.info("Inside Individual Preclosure");
            var accountId = parseInt(req.body.accountId,10);
            var accountTypeId = req.body.accountTypeId;
            var globalAccNum = req.body.globalAccountNum;
            var clientList = new Array();
            var repayLoanHolderObj = require(domainPath +"/repayLoanHolder");
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
                        var repayLoanHolder = require(domainPath +"/repayLoanHolder");
                        var repayLoanHolder = new repayLoanHolder();
                        repayLoanHolder.setClientGlobalAccountNumberList(result.clientDetails[i].globalAccountNum);
                        repayLoanHolder.setClientNameList(result.clientDetails[i].clientName);
                        clientList[i] =  repayLoanHolder;
                    }
                    res.render('individualPreclosure',{clientList : clientList ,selectedClientName : 0,repayLoanHolder : repayLoanHolder,glCodesList : glCodesList,cashOrBank : cashOrBank,accountId : accountId,accountTypeId : accountTypeId ,groupName : req.session.groupCenterMifosName,lastDayBookClosedDate : lastDayBookClosedDate,globalAccNum : globalAccNum, contextPath:props.contextPath});
                }
                else {
                    self.showErrorPage(req,res);
                }
            });
        }catch(e){
            customlog.error("Exception while Individual preclosure "+e);
            self.showErrorPage(req,res);
        }
    },
    retrieveIndividualLoanDetailsForPreclosure :  function(req,res) {
        var self = this;
        var repayLoanHolderObj = require(domainPath +"/repayLoanHolder");
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
                var repayLoanHolderObj = require(domainPath +"/repayLoanHolder");
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
                    var repayLoanHolder1 = require(domainPath +"/repayLoanHolder");
                    var repayLoanHolder1 = new repayLoanHolder1();
                    repayLoanHolder1.setClientGlobalAccountNumberList(result.clientDetails[i].globalAccountNum);
                    repayLoanHolder1.setClientNameList(result.clientDetails[i].clientName);
                    clientList[i] =  repayLoanHolder1;
                }
                res.render('individualPreclosure',{clientList : clientList ,selectedClientName :req.body.clientName, repayLoanHolder : repayLoanHolder,glCodesList : glCodesList,accountId : accountId,cashOrBank : cashOrBank,accountTypeId : accountTypeId ,groupName : req.session.groupCenterMifosName,lastDayBookClosedDate : lastDayBookClosedDate,globalAccNum : globalAccNum, contextPath:props.contextPath});
            }
        });
    },
    submitIndividualPreclosure : function(req,res){
        res.setTimeout(0);
        var self = this;
        var repayLoanHolderObj = require(domainPath +"/repayLoanHolder");
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
    },*/
	/*preclosure :  function(req,res) {
		try{
            customlog.info("Inside Preclosure");
            var self=this;
            var accountId = parseInt(req.body.accountId,10);
            var accountTypeId = req.body.accountTypeId;
            var globalAccountNum = req.body.globalAccountNum;
            var repayLoanHolder = require(domainPath +"/repayLoanHolder");
            var repayLoanHolder = new repayLoanHolder();
            var glCodesDTO = require(path.join(rootPath,"app_modules/dto/common/glcodes"));
            var glCodes = new glCodesDTO();
            var repayLoanDTOObj = require(domainPath +"/repayLoanDTO");
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
                    res.render('preclosure',{repayLoanHolder : repayLoanHolder,glCodes : glCodes,accountId : accountId,accountTypeId : accountTypeId ,groupName : req.session.groupCenterMifosName,lastDayBookClosedDate : lastDayBookClosedDate, contextPath:props.contextPath});
                } else {
                    self.showErrorPage(req,res);
                }
            });
        }catch(e){
            customlog.error("Exception while preclosure "+e);
            self.showErrorPage(req,res);
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
            var repayLoanHolderObj = require(domainPath +"/repayLoanHolder");
            var repayLoanHolder = new repayLoanHolderObj();
            var glCodesDTO = require(path.join(rootPath,"app_modules/dto/common/glcodes"));
            var glCodes = new glCodesDTO();
            var repayLoanDTOObj = require(domainPath +"/repayLoanDTO");
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
                    res.render('preclosure',{repayLoanHolder : repayLoanHolder,glCodes : glCodes,accountId : accountId,accountTypeId : accountTypeId ,groupName : req.session.groupCenterMifosName,lastDayBookClosedDate : lastDayBookClosedDate, contextPath:props.contextPath});
                } else {
                    self.showErrorPage(req,res);
                }
            });
        }catch(e){
            customlog.error("Exception while retrievePreclosureInformation "+e);
            self.showErrorPage(req,res);
        }
	},
	
	submitPreclosureInformation : function(req,res) {
	    try{
            var self = this;
            var repayLoanHolderObj = require(domainPath +"/repayLoanHolder");
            var repayLoanHolder = new repayLoanHolderObj();
            var repayLoanDTOObj = require(domainPath +"/repayLoanDTO");
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
            *//*if(typeof(req.body.waiveInterestCheckboxId) != 'undefined' & (req.body.waiveInterestCheckboxId == 'on')){
                repayLoanHolder.setWaiverInterest(true);
            }else{
                repayLoanHolder.setWaiverInterest(false);
            }*//*

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
                        self.showErrorPage(req,res);
                    }
                }
            });
        }catch(e){
            customlog.error("Exception while submitPreclosureInformation "+e);
            self.showErrorPage(req,res);
        }
	},*/

	/*//Loan Sanction Document Verification
	showDocVerification : function(req,res,clientId,mifosCustomerId,isSynchronized,iklantGroupId,centerName,clientIdArray,clientNameArray,docTypeIdArray,docTypeNameArray,docId,fileLocation,docVerificationFlag,clientLoanCountArray){
        try{
            var self = this;
            //var activityDetails = new Array(iklantPort, req.session.tenantId, req.session.userId, req.session.userName, req.originalUrl, req.connection.remoteAddress, "router.js", "showDocVerification", "success", "DocVerification", "showDocVerification");
            //self.commonRouter.insertActivityLogModel(activityDetails);
            res.render('docVerification',{clientId:clientId,mifosCustomerId:mifosCustomerId,isSynchronized:isSynchronized,iklantGroupId : iklantGroupId,
                    centerName:centerName,clientIdArray:clientIdArray,clientNameArray:clientNameArray,docTypeIdArray:docTypeIdArray,clientLoanCountArray:clientLoanCountArray,
                    docTypeNameArray:docTypeNameArray,docId:docId,fileLocation:fileLocation,docVerificationFlag:docVerificationFlag, contextPath:props.contextPath});
        }catch(e){
            customlog.error("Exception while showDocVerification "+e);
            self.showErrorPage(req,res);
        }
	},
	
	docVerificationCall : function(iklantGroupId,docVerificationFlag,callback){
		this.model.docVerificationCallModel(iklantGroupId,docVerificationFlag,callback);
	},
	
	docVerification : function(req,res){
		try{
            var self = this;
            var userId = req.session.userId;
            var tenantId = req.session.tenantId;
            //customlog.info("mifosCustomerId DV :"+req.params.mifosCustomerId);
            var iklantGroupId = req.body.iklantGroupIdHidden;
            var isSynchronized = req.body.isSynchronizedHidden;
            var mifosCustomerId = req.body.mifosCustomerIdHidden;
            var docVerificationFlag = req.body.docVerificationFlagHidden;
            var fileLocation = "";
            var clientId = "";
            var docId ="";
            customlog.info("iklantGroupIddoc "+iklantGroupId);
            if(typeof tenantId == 'undefined' || typeof userId == 'undefined') {
                res.redirect(props.contextPath+'/client/ci/login');
            }
            else{
                //var activityDetails = new Array(iklantPort, req.session.tenantId, req.session.userId, req.session.userName, req.originalUrl, req.connection.remoteAddress, "router.js", "docVerification", "success", "docVerification", "docVerification");
                //self.commonRouter.insertActivityLogModel(activityDetails);
                self.commonRouter.retrieveDocTypeList(tenantId,function(docTypeIdArray,docTypeNameArray){
                    self.docVerificationCall(iklantGroupId,docVerificationFlag,function(centerName,clientIdArray,clientNameArray,clientLoanCountArray) {
                        self.showDocVerification(req,res,clientId,mifosCustomerId,isSynchronized,iklantGroupId,centerName,clientIdArray,clientNameArray,docTypeIdArray,docTypeNameArray,docId,fileLocation,docVerificationFlag,clientLoanCountArray);
                    });
                });
            }
        }catch(e){
            customlog.error("Exception while docVerification "+e);
            self.showErrorPage(req,res);
        }
	},
	
	//Document Verification Groups List
	showDocVerificationGroups : function(req,res,groupIdArray,groupNameArray,centerNameArray,roleId,officeIdArray,officeNameArray,selectedOfficeId,errorField){
        try{
            var self = this;
            var constantsObj = this.constants;
            //var activityDetails = new Array(iklantPort, req.session.tenantId, req.session.userId, req.session.userName, req.originalUrl, req.connection.remoteAddress, "router.js", "showDocVerificationGroups", "success", "DocVerificationGroupList", "showDocVerificationGroups");
            //self.commonRouter.insertActivityLogModel(activityDetails);
            res.render('docVerificationGroupList',{groupIdArray:groupIdArray,groupNameArray:groupNameArray,
                                                centerNameArray:centerNameArray,roleId:roleId,officeIdArray:officeIdArray,
                                                officeNameArray:officeNameArray,selectedOfficeId:selectedOfficeId,errorField:errorField,constantsObj:constantsObj, contextPath:props.contextPath});
        }catch(e){
            customlog.error("Exception while showDocVerificationGroups "+e);
            self.showErrorPage(req,res);
        }
	},
	
	generateDocVerificationGroupsCall : function(tenantId,officeId,userId,callback){
		this.model.generateDocVerificationGroupsCallModel(tenantId,officeId,userId,callback);
	},
	
	generateDocVerificationGroups : function(req,res){
		try{
            var self = this;
            var constantsObj = this.constants;
            var userId = req.session.userId;
            var tenantId = req.session.tenantId;
            var roleId  = req.session.roleId;
            var roleIds  = req.session.roleIds;
            var officeId = req.body.selectedOfficeHidden;
            if((typeof officeId == 'undefined')){
                officeId = (roleId == constantsObj.getSMHroleId() || roleIds.indexOf(constantsObj.getCCEroleId())>-1)?-1:req.session.officeId;
            }

            if(typeof tenantId == 'undefined' || typeof userId == 'undefined') {
                res.redirect(props.contextPath+'/client/ci/login');
            }
            else{
                self.generateDocVerificationGroupsCall(tenantId,officeId,userId,function(groupIdArray,groupNameArray,centerNameArray,errorField) {
                    self.commonRouter.retriveOfficeCall(tenantId,userId,function(officeIdArray,officeNameArray,officeAddressArray,officeShortNameArray){
                        self.showDocVerificationGroups(req,res,groupIdArray,groupNameArray,centerNameArray,roleId,officeIdArray,
                        officeNameArray,officeId,errorField);
                    });
                });
            }
        }catch(e){
            customlog.error("Exception while generateDocVerificationGroups "+e);
            self.showErrorPage(req,res);
        }
	},*/
	
	/*//For Reverse Loan By Bask:1939
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

                var reverseLoanHolderObj = require(domainPath +"/reverseLoanHolder");
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
                    res.render('LoanReversal.jade',{reverseLoanHolder : reverseLoanHolder,accountId : accountId,accountTypeId : accountTypeId ,groupName : req.session.groupCenterMifosName, contextPath:props.contextPath});
                } else {
                    self.showErrorPage(req,res);
                }
            });
        }catch(e){
            customlog.error("Exception while reverse "+e);
            self.showErrorPage(req,res);
        }
	},
*/
    /*submitreverseInformation : function(req,res) {
		try{
            var self = this;
            customlog.info("req.session.mifosCookie" + req.session.mifosCookie);
            //var globalAccNum = '000100000019745';
            var globalAccNum = req.body.globalAccountNum;
            var notes = req.body.notes;

            var reverseLoanHolderObj = require(domainPath +"/reverseLoanHolder");
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
                        self.showErrorPage(req,res);
                    }
                }
            });
        }catch(e){
            customlog.error("Exception while submitreverse information "+e);
            self.showErrorPage(req,res);
        }
	},*/
	
	/*paymentVerificationLoad : function(req,res){
		try{
            var self = this;
            var officeId;
            var personnelId = req.body.abc;
            var officeIdsadas = req.body.officeId;
            var loanAccountInformationDto = require(domainPath +"/loanAccountInformationDto");
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
                        //var activityDetails = new Array(iklantPort, req.session.tenantId, req.session.userId, req.session.userName, req.originalUrl, req.connection.remoteAddress, "router.js", "paymentVerificationLoad", "success", "Payment Verification", "paymentVerificationLoad");
                        //self.commonRouter.insertActivityLogModel(activityDetails);
                        if(result.status == 'success'){
                            var PaymentCollectionArray = new Array();
                            for(var i=0; i<result.paymentInfn.length;i++) {
                                var PaymentCollectionDetailDto = require(domainPath +"/PaymentCollectionDetailDto");
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
                            res.render('PaymentVerification.jade',{PaymentCollectionArray : PaymentCollectionArray,personnelIdArray : req.session.personnelIdArray,personnelNameArray : req.session.personnelNameArray,officeId:req.session.officeId,personnelId : personnelId, contextPath:props.contextPath});
                        }
                        else{
                            self.showErrorPage(req,res);
                        }
                    }
                });
            }
        }catch(e){
            customlog.error("Exception while paymentVerificationLoad "+e);
            self.showErrorPage(req,res);
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
            var PaymentCollectionDetailDto = require(domainPath +"/PaymentCollectionDetailDto");
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
                                self.showErrorPage(req,res);
                            }
                        }
                    }
                });
            }
        }catch(e){
            customlog.error("Exception while dopaymentverification "+e);
            self.showErrorPage(req,res);
        }
	},*/
   /* getClientPaymentsDetail: function(paymentCollectionId,callback){
        this.model.getClientPaymentsDetailModel(paymentCollectionId,callback);
    },*/

	/*downloadPaymentVerificationImage : function(req,res){
		try{
            var self = this;
            var fileLocation = req.body.fileLocation;
            var fileName = fileLocation.split("/");
            //var activityDetails = new Array(iklantPort, req.session.tenantId, req.session.userId, req.session.userName, req.originalUrl, req.connection.remoteAddress, "router.js", "downloadPaymentVerificationImage", "success", "downloadPaymentVerificationImage", "downloadPaymentVerificationImage");
            //self.commonRouter.insertActivityLogModel(activityDetails);
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
            self.showErrorPage(req,res);
        }
	},

	chequeBounceLoad : function(req,res){
        try{
            var self = this;
            if(typeof (req.session.tenantId) == 'undefined' || typeof (req.session.userId) == 'undefined') {
                res.redirect(props.contextPath+'/client/ci/login');
            }else{
                //var activityDetails = new Array(iklantPort, req.session.tenantId, req.session.userId, req.session.userName, req.originalUrl, req.connection.remoteAddress, "router.js", "chequeBounceLoad", "success", "heque Bounce", "chequeBounceLoad");
                //self.commonRouter.insertActivityLogModel(activityDetails);
                res.render('ChequeBounce',{chequeDetail:0, contextPath:props.contextPath});
            }
        }catch(e){
            customlog.error("Exception while chequebounceload "+e);
            self.showErrorPage(req,res);
        }
	},
	
	searchChequeBounceLoad : function(req,res){
		try{
            var self = this;
            var chequeNo = req.body.searchChequeNo;
            if(chequeNo.length < 6 | chequeNo.length > 7){
                res.render('ChequeBounce',{chequeDetail:2, contextPath:props.contextPath});
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
                                //var activityDetails = new Array(iklantPort, req.session.tenantId, req.session.userId, req.session.userName, req.originalUrl, req.connection.remoteAddress, "router.js", "searchChequeBounceLoad", "success", "Cheque Bounce", "searchChequeBounceLoad");
                                //self.commonRouter.insertActivityLogModel(activityDetails);
                                var PaymentCollectionDetailDto = require(domainPath +"/PaymentCollectionDetailDto");
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
                                res.render('ChequeBounce',{PaymentCollectionDetail:PaymentCollectionDetail,chequeDetail:1, contextPath:props.contextPath});
                            }
                            else {
                                self.showErrorPage(req,res);
                            }
                        }
                    });
                }
            }
        }catch(e){
            customlog.error("Exception while searchChequeBounceLoad "+e);
            self.showErrorPage(req,res);
        }
	},
	
	revertChequePayment : function(req,res){
		try{
            var self = this;
            var PaymentCollectionDetailDto = require(domainPath +"/PaymentCollectionDetailDto");
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
            self.showErrorPage(req,res);
        }
	},*/

	/*getGroupDetailCall : function(userId, callback){
		this.model.getGroupDetailModel(userId, callback);
	},

	assignROLoad: function(req,res){
        try{
            var self = this;
            if(typeof (req.session.tenantId) == 'undefined' || typeof (req.session.userId) == 'undefined') {
                res.redirect(props.contextPath+'/client/ci/login');
            }else{
                self.getGroupDetailCall(req.session.userId, function(NPALoanRecoveryGroupsObject,NPALoanRecoveryGroupsStatusObject,userName,userId){
                    res.render("assignRO",{NPALoanRecoveryGroupsObject:NPALoanRecoveryGroupsObject,userName:userName,
                        userId:userId,NPALoanRecoveryGroupsStatusObject:NPALoanRecoveryGroupsStatusObject, contextPath:props.contextPath});
                });
            }
        }catch(e){
            customlog.error("Exception while assignROLoad "+e);
            self.showErrorPage(req,res);
        }
	},*/
/*    //Added by Sathish Kumar M 008 For Changing Fo Module

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
                    res.render("changingFO",{constantsObj:constantsObj,roleId:roleId,dateValue:dateValue,statusMessage:statusMessage,LoanRecoveryGroupsObject:"",userName:"",userId:"", officeName:officeName,officeId:officeId,officeValue:0,contextPath:props.contextPath});
                });

            }
        }catch(e){
            customlog.error("Exception while assignFOLoad "+e);
            self.showErrorPage(req,res);
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
                          res.render("changingFO",{constantsObj:constantsObj,dateValue:dateValue,roleId:roleId,LoanRecoveryGroupsObject:LoanRecoveryGroupsObject,userName:userName,
                              userId:userId, officeName:officeName,officeId:officeId,officeValue:officeValue,statusMessage:statusMessage,contextPath:props.contextPath});
                      });
                    });
                }
        }catch(e){
            customlog.error("Exception while assignFOLoad "+e);
            self.showErrorPage(req,res);
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
                        res.render("changingFO",{constantsObj:constantsObj,roleId:roleId,dateValue:dateValue,LoanRecoveryGroupsObject:LoanRecoveryGroupsObject,userName:userName,
                            userId:userId, officeName:officeName,officeId:officeId,officeValue:officeValue,userIdValue:userIdValue,statusMessage:statusMessage,contextPath:props.contextPath});
                    });
                });
            }
        }catch(e){
            customlog.error("Exception while assignFOLoad "+e);
            self.showErrorPage(req,res);
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
                if(status){
                    var activityDetails = new Array(iklantPort, req.session.tenantId, req.session.userId, req.session.userName, req.originalUrl, req.connection.remoteAddress, "router.js", "assignFO", "success", "assignFO","customerId:"+customerId+" iklantGroupId:"+iklantGroupId+" From Loan Officer:"+ userIdValue +" To loanRecoveryOfficer:"+loanRecoveryOfficer+" Changed successfully","insert");
                    self.commonRouter.insertActivityLogModel(activityDetails);
                    req.body.statusMessage = "Changing Field Officer saved successfully";
                }else{
                    req.body.statusMessage = "Changing Field Officer saved failed";
                }
                req.body.office=officeValue;
                req.body.currentFO=userIdValue;
                self.groupsFOLoad(req,res);
            });
        }catch(e){
            customlog.error("Exception while assignFO "+e);
            self.showErrorPage(req,res);
        }
    },*/

	/*assignGroupToROCall : function(accountId,roId,callback){
		this.model.assignGroupToROModel(accountId,roId,callback);
	},

	assignRO : function(req,res){
		try{
            var self = this;
            var loanRecoveryOfficer = req.body.selectRO;
            var accountId = req.body.accountId.split(",");
            self.assignGroupToROCall(accountId,loanRecoveryOfficer,function(){
                res.redirect(props.contextPath+'/client/ci/NPALRGroups/assignROLoad');
            });
        }catch(e){
            customlog.error("Exception while assignRo "+e);
            self.showErrorPage(req,res);
        }
	},
*/
    /*// Added by Chitra
    reportManagement : function(req,res) {
        try{
            var self = this;
            var constantsObj = this.constants;
            var tenantId = req.session.tenantId;
            var userId = req.session.userId;
            var roleId = req.session.roleId;
            var officeId;
            var reportName = "";
            var ledgerValue = "";
            var categoryOfReport = "";
            var reportId = "";
            if(req.params != null){
                reportName = req.params.typeOfReport;
                ledgerValue = req.params.ledgerValue;
                categoryOfReport = parseInt(req.params.categoryOfReport);
                reportId = parseInt(req.params.reportId);
            }
            // For senior management
            if(roleId == constantsObj.getSMHroleId() || roleId == constantsObj.getNaiveroleId()||roleId == constantsObj.getAMHroleId()){
                officeId = -1;
            }
            else{
                officeId = req.session.officeId;
            }

            customlog.info("Inside Report Management");
            if(typeof tenantId == 'undefined' || typeof userId == 'undefined') {
                self.showErrorPage(req,res);
            }else{
                self.commonRouter.retriveOfficeCall(tenantId,userId,function(officeIdArray,officeNameArray,officeAddressArray,officeShortNameArray) {
                    if(typeof ledgerValue !== 'undefined' && ledgerValue != "0"){ // For Bank,Cash ledger reports
                        self.accountingRouter.retrieveLedgerDetailsCall(tenantId,officeId,ledgerValue,userId, function(ledger_name_array,gl_code_value_array){
                            self.showReportManagement(req,res,tenantId,officeId,roleId,officeIdArray,officeNameArray,ledger_name_array,gl_code_value_array,reportName,reportId,categoryOfReport);
                        });
                    }else{
                        if(reportName == 'dashboard' && roleId != constantsObj.getSMHroleId()){
                              req.body.listofficefordashboard = officeId;
                              self.groupManagementRouter.generateDashBoard(req,res);
                        }else{
                            self.showReportManagement(req,res,tenantId,officeId,roleId,officeIdArray,officeNameArray,"","",reportName,reportId,categoryOfReport);
                        }
                    }
                });
            }
        }catch(e){
            customlog.error("Exception while reportManagement "+e);
            self.showErrorPage(req,res);
        }
    },

    showReportManagement : function(req,res,tenantId,officeId,roleId,officeIdArray,officeNameArray,ledger_name_array,gl_code_value_array,reportName,reportId,categoryOfReport){
        try{
            customlog.info("Inside Show Report Management");
            var self = this;
            var requestOfficeIdArray = new Array();
            var requestOfficeNameArray = new Array();
            var constantsObj = this.constants;
            if(reportId != 0){
                // Added by chitra for dashboard filter
                if(reportId == constantsObj.getDashboard() && roleId != constantsObj.getSMHroleId()){
                    for(var i=0; i<officeIdArray.length; i++){
                         if(officeId == officeIdArray[i]){
                             requestOfficeIdArray[0]  = officeIdArray[i];
                             requestOfficeNameArray[0] = officeNameArray[i];
                             break;
                         }
                    }
                    officeIdArray = new Array();officeIdArray = requestOfficeIdArray;
                    officeNameArray = new Array();officeNameArray = requestOfficeNameArray;
                }
                self.getReportStatus(reportId,function(statusMessage){
                    if(statusMessage == "Success") {
                        self.reportManagementCall(tenantId, officeId, req.session.userId, function (statusIdArray, statusDescArray, finResult, ledgerResult, prdOfferingIdArray, prdOfferingNameArray, prdCategoryIdArray, prdCategoryNameArray, personnelIdArray, personnelNameArray) {
                            self.getFinancialYearLoadHolder(finResult, function (FinancialYearLoadHolder) {
                                if (reportName == "" || typeof reportName == 'undefined') {
                                    reportName = "reportManagement.jade";
                                }
                                res.render(reportName, {statusIdArray: statusIdArray, statusArray: statusDescArray, groupNameArray: null,
                                    officeIdArray: officeIdArray, officeNameArray: officeNameArray, roleId: roleId,
                                    constantsObj: constantsObj, finResult: finResult, ledgerResult: ledgerResult, fileLocation: "", result: null, gl_code_value_array: gl_code_value_array, ledger_name_array: ledger_name_array,
                                    startDate: "", endDate: "", officeValue: "", customerVal: "", accountNo: "", ledgerValue: "", download_report: "", FinancialYearLoadHolder: FinancialYearLoadHolder,
                                    prdOfferingIdArray: prdOfferingIdArray, prdOfferingNameArray: prdOfferingNameArray, prdCategoryIdArray: prdCategoryIdArray, prdCategoryNameArray: prdCategoryNameArray,
                                    loan_product_value: "", prd_category_value: "", personnelIdArray: personnelIdArray, personnelNameArray: personnelNameArray, personnel_value: "", finYearId: "",
                                    reportCategory: 'monthly', daysInArrearsAbove: 0, totalOverdueAbove: 0, personnel_value: '', loanStatus: 'All', npaIndicator: '1500', accOperation: 'on', mfiOperation: 'on', classValue: '', statusDescValue: "",
                                    dashBoardObject:'',includePrevOperation:'No',groupIdArray:"",reportId:reportId,daysInArrears:15, contextPath:props.contextPath,roleIds:req.session.roleIds});
                            });
                        });
                    }
                    else{
                        self.showMaintenancePage(reportName,categoryOfReport,res);
                    }
                });
            }
            else{
                self.showMaintenancePage(reportName,categoryOfReport,res);
            }
        }catch(e){
            customlog.error("Exception while showReportManagement "+e);
            self.showErrorPage(req,res);
        }
    },

    reportManagementCall : function(tenantId,officeId,userId,callback) {
        this.model.reportManagementModel(tenantId,officeId,userId, callback);
    },

    reportsMenu : function(req,res) {
        try{
            var self = this;
            var constObj = this.constants;
            var tenantId = req.session.tenantId;
            var userId = req.session.userId;
            var roleId = req.session.roleId;
            var roleIds = req.session.roleIds;
            customlog.info("Inside Show Report Menu");
            if(typeof tenantId == 'undefined' || typeof userId == 'undefined') {
                self.showErrorPage(req,res);
            }
            else {
                req.session.tenantId = tenantId;
                res.render('reportsMenu.jade', {roleId:roleId,constObj:constObj, contextPath:props.contextPath,roleIds:roleIds});
            }
        }catch(e){
                customlog.error("Exception while reportsMenu "+e);
                self.showErrorPage(req,res);
        }
    },

    showReportManagementByCategory :  function(req,res) {
        try{
            var self = this;
            var tenantId = req.session.tenantId;
            var userId = req.session.userId;
            if((req.session.roleIds).length>1){
                var roleId = req.session.roleIds[1];
            }
            else
            {
                var roleId = req.session.roleId;
            }

            var officeId = req.session.officeId;
            var constantsObj = this.constants;
            var reportCategoryId = parseInt(req.params.categoryId);
            // For senior management
            if(roleId == constantsObj.getSMHroleId() || roleId == constantsObj.getAMHroleId()){
                officeId = -1;
            }

            if(typeof tenantId == 'undefined' || typeof userId == 'undefined') {
                self.showErrorPage(req,res);
            }
            else {   // fetch all office
                var pageName = (reportCategoryId == constantsObj.getFinancialReports())?'Financial':(reportCategoryId == constantsObj.getManagementReports())?'Management':(reportCategoryId == constantsObj.getOperationalReports())?'Operational':(reportCategoryId == constantsObj.getGroupsReports())?'Groups':(reportCategoryId == constantsObj.getGroupMembersReports())?'Group Members':'Porfolio';
                //var activityDetails = new Array(iklantPort, req.session.tenantId, req.session.userId, req.session.userName, req.originalUrl, req.connection.remoteAddress, "router.js", "showReportManagementByCategory", "success", pageName+" Reports", "showReportManagementByCategory");
                //self.commonRouter.insertActivityLogModel(activityDetails);
                self.commonRouter.retriveOfficeCall(tenantId,userId,function(officeIdArray,officeNameArray,officeAddressArray,officeShortNameArray) {
                    self.reportManagementCall(tenantId,officeId,userId, function(statusIdArray,statusDescArray,finResult,ledgerResult,prdOfferingIdArray,prdOfferingNameArray,prdCategoryIdArray,prdCategoryNameArray,personnelIdArray, personnelNameArray){
                        self.reportsMenuCall(reportCategoryId,roleId, function(reportResult){
                            req.session.tenantId = tenantId;
                            res.render('reportManagement.jade',{statusIdArray:statusIdArray, statusDescArray:statusDescArray,
                                officeIdArray:officeIdArray, officeNameArray:officeNameArray, roleId:roleId,constantsObj:constantsObj,
                                categoryId:reportCategoryId,userId:userId, reportResult: reportResult, contextPath:props.contextPath});
                        });
                    });
                });
            }
        }catch(e){
            customlog.error("Exception while showReportManagementByCategory "+e);
            self.showErrorPage(req,res);
        }
    },

    // Method for call the Insurance Cover Report
    insuranceCoverReportLoad : function(req,res){
        try{
            var self = this;
            var tenantId = req.session.tenantId;
            var roleId = req.session.roleId;
            var startDate = req.body.fromdateICR;
            var endDate = req.body.todateINS;
            var officeId = req.body.listoffice;
            var download_report = req.body.report_download_flag;
            var constantsObj = this.constants;
            var body;
            //var activityDetails = new Array(iklantPort, req.session.tenantId, req.session.userId, req.session.userName, req.originalUrl, req.connection.remoteAddress, "router.js", "insuranceCoverReportLoad", "success", "Insurance Cover Report", "insuranceCoverReportLoad");
            //self.commonRouter.insertActivityLogModel(activityDetails);
            if(typeof officeId == 'undefined'){
                officeId = (roleId == constantsObj.getSMHroleId())?req.session.userId:req.session.officeId;
            }
            var userId = (roleId == constantsObj.getSMHroleId()||roleId == constantsObj.getAMHroleId())?req.session.userId:-1;
            if(typeof tenantId == 'undefined' || typeof userId == 'undefined') {
                self.showErrorPage(req,res);
            }
            else {
                self.commonRouter.retriveOfficeCall(tenantId,userId,function(officeIdArray,officeNameArray,officeAddressArray,officeShortNameArray) {
                    self.insuranceCoverReportCall(tenantId,startDate,endDate,officeId,userId, function(insuranceClaimResult,fileLocation){
                        var download_report_msg = "";
                        if(download_report == 'Download' && (insuranceClaimResult == null || insuranceClaimResult.length == 0) ){
                            download_report_msg = "No Records";
                        }else if(download_report == 'Download'){
                            download_report_msg = "Download";
                        }
                        req.session.tenantId = tenantId;
                        res.render("insuranceCoverReport",{startDate:startDate,endDate:endDate,fileLocation:fileLocation,result:insuranceClaimResult,download_report:download_report_msg,constantsObj:constantsObj,roleId:roleId,
                            officeIdArray:officeIdArray,officeValue:officeId,officeNameArray:officeNameArray, contextPath:props.contextPath});
                    });
                });
            }
        }catch(e){
            customlog.error("Exception while insuranceCoverReportLoad "+e);
            self.showErrorPage(req,res);
        }
    },

    insuranceCoverReportCall : function(tenantId,startDate,endDate,officeId,userId, callback){
        this.model.insuranceCoverReportModel(tenantId,startDate,endDate,officeId,userId, callback);
    },

    // Method for Bank Book Report Call
    bankBookReportLoad : function(req,res){
        try{
            var self = this;
            var constantsObj = this.constants;
            var finYearId = req.body.finYearId;
            var officeId = req.body.listofficeBB;
            var tenantId = req.session.tenantId;
            var userId = req.session.userId;
            var roleId = req.session.roleId;
            var startDate = req.body.fromdateBB;
            var endDate = req.body.todateBB;
            var selected_ledger_id = req.body.listledgerBB;
            var selected_ledger_name = req.body.ledgerNameBB;
            var accOperation = req.body.accOperation;
            var mfiOperation = req.body.mfiOperation;
            var download_report = req.body.report_download_flag;
            var reportType = req.body.reportType;
            //var activityDetails = new Array(iklantPort, req.session.tenantId, req.session.userId, req.session.userName, req.originalUrl, req.connection.remoteAddress, "router.js", "bankBookReportLoad", "success", "Bank Book Report", "bankBookReportLoad");
            //self.commonRouter.insertActivityLogModel(activityDetails);
            if(typeof officeId == 'undefined'){
                officeId = (roleId == constantsObj.getSMHroleId() || roleId == constantsObj.getNaiveroleId() || roleId == constantsObj.getAMHroleId())?-1:req.session.officeId;
            }

            self.bankBookReportLoadCall(finYearId,tenantId,officeId,startDate,endDate,selected_ledger_name,selected_ledger_id,mfiOperation,accOperation,userId,function(bankBookResult,fileLocation){
                var detailed = '',summary ='',download_report_msg = "";
                var download_report_msg = ( (download_report == 'Download' && (bankBookResult == null || bankBookResult.length == 0) )?"No Records" :(download_report == 'Download') ? "Download" : "")
                var check = (reportType == 'Summary')?detailed = 'hideContent': ((reportType == 'Detailed')? summary = 'hideContent' : detailed = 'hideContent');

                self.commonRouter.retriveOfficeCall(tenantId,userId,function(officeIdArray,officeNameArray,officeAddressArray,officeShortNameArray) {
                    self.accountingRouter.retrieveLedgerDetailsCall(tenantId,officeId,"Bank",userId,function(ledger_name_array,gl_code_value_array){
                        self.reportManagementCall(tenantId,officeId,userId,function(statusIdArray,statusDescArray,finResult,ledgerResult,prdOfferingIdArray,prdOfferingNameArray,prdCategoryIdArray,
                                                                             prdCategoryNameArray,personnelIdArray, personnelNameArray){
                            self.getFinancialYearLoadHolder(finResult,function(FinancialYearLoadHolder){
                                req.session.tenantId = tenantId;
                                res.render("bankBookReport",{startDate:startDate,endDate:endDate,officeValue:officeId,ledgerValue:selected_ledger_id,fileLocation:fileLocation,officeNameArray:officeNameArray,officeIdArray:officeIdArray,
                                    ledger_name_array:ledger_name_array,result:bankBookResult,gl_code_value_array:gl_code_value_array,download_report:download_report_msg,detailed:detailed,summary:summary,FinancialYearLoadHolder:FinancialYearLoadHolder,
                                finYearId:finYearId,finResult:finResult,constantsObj:constantsObj,accOperation:accOperation,mfiOperation:mfiOperation, contextPath:props.contextPath});
                            });
                        });
                    });
                });
            });
        }catch(e){
            customlog.error("Exception while bankBookReportLoad "+e);
            self.showErrorPage(req,res);
        }
    },

    bankBookReportLoadCall : function(finYearId,tenantId,officeId,startDate,endDate,selected_ledger_name,selected_ledger_id,mfiOperation,accOperation,userId, callback){
        this.model.bankBookReportModel(finYearId,tenantId,officeId,startDate,endDate,selected_ledger_name,selected_ledger_id,mfiOperation,accOperation,userId, callback);
    },

    // Method for call the Cash Book Report
    cashBookReportLoad : function(req,res){
        try{
            var self = this;
            var constantsObj = this.constants;
            var finYearId = req.body.finYearId;
            var officeId = req.body.listofficeCB;
            var tenantId = req.session.tenantId;
            var userId = req.session.userId;
            var roleId = req.session.roleId;
            var startDate = req.body.fromdateCB;
            var endDate = req.body.todateCB;
            var selected_ledger_id = req.body.listledgerCB;
            var selected_ledger_name = req.body.ledgerNameCB;
            var accOperation = req.body.accOperation;
            var mfiOperation = req.body.mfiOperation;
            var download_report = req.body.report_download_flag;
            var reportType = req.body.reportType;
            //var activityDetails = new Array(iklantPort, req.session.tenantId, req.session.userId, req.session.userName, req.originalUrl, req.connection.remoteAddress, "router.js", "cashBookReportLoad", "success", "Cash Book Report", "cashBookReportLoad");
            //self.commonRouter.insertActivityLogModel(activityDetails);
            if(typeof officeId == 'undefined'){
                officeId = (roleId == constantsObj.getSMHroleId() || roleId == constantsObj.getNaiveroleId() || roleId == constantsObj.getAMHroleId())?-1:req.session.userId;
            }

            self.cashBookReportLoadCall(finYearId,tenantId,officeId,startDate,endDate,selected_ledger_name,selected_ledger_id,mfiOperation,accOperation,userId,function(cashBookResult,fileLocation){
                var detailed = '',summary ='',download_report_msg = "";
                var download_report_msg = ( (download_report == 'Download' && (cashBookResult == null || cashBookResult.length == 0) )?"No Records" :(download_report == 'Download') ? "Download" : "")
                var check = (reportType == 'Summary')?detailed = 'hideContent': ((reportType == 'Detailed')? summary = 'hideContent' : detailed = 'hideContent');

                self.commonRouter.retriveOfficeCall(tenantId,userId,function(officeIdArray,officeNameArray,officeAddressArray,officeShortNameArray) {
                    self.accountingRouter.retrieveLedgerDetailsCall(tenantId,officeId,"Cash",userId,function(ledger_name_array,gl_code_value_array){
                        self.reportManagementCall(tenantId,officeId,userId, function(statusIdArray,statusDescArray,finResult,ledgerResult,prdOfferingIdArray,prdOfferingNameArray,prdCategoryIdArray,
                                                                             prdCategoryNameArray,personnelIdArray, personnelNameArray){
                            self.getFinancialYearLoadHolder(finResult,function(FinancialYearLoadHolder){
                                req.session.tenantId = tenantId;
                                res.render("cashBookReport",{startDate:startDate,endDate:endDate,officeValue:officeId,ledgerValue:selected_ledger_id,fileLocation:fileLocation,officeNameArray:officeNameArray,
                                    officeIdArray:officeIdArray,ledger_name_array:ledger_name_array,result:cashBookResult,gl_code_value_array:gl_code_value_array,
                                    download_report:download_report_msg,detailed:detailed,summary:summary,FinancialYearLoadHolder:FinancialYearLoadHolder,finYearId:finYearId,
                                    finResult:finResult,constantsObj:constantsObj,accOperation:accOperation,mfiOperation:mfiOperation, contextPath:props.contextPath});
                            });
                        });
                    });
                });
            });
        }catch(e){
            customlog.error("Exception while cashBookReportLoad "+e);
            self.showErrorPage(req,res);
        }
    },

    cashBookReportLoadCall : function(finYearId,tenantId,officeId,startDate,endDate,selected_ledger_name,selected_ledger_id,mfiOperation,accOperation,userId,callback){
        this.model.cashBookReportModel(finYearId,tenantId,officeId,startDate,endDate,selected_ledger_name,selected_ledger_id,mfiOperation,accOperation,userId,callback);
    },

    *//*Generate the Report with filter from_date,to_date,office for the reports   *//*
    generateReportWithOfficeDateLoad : function(req,res){
        try{
            var self = this;
            var constantsObj = this.constants;
            var finYearId = req.body.finYearId;
            var officeId = req.body.listoffice;
            var tenantId = req.session.tenantId;
            var roleId = req.session.roleId;
            var userId = req.session.userId;
            var startDate = req.body.fromdateValue;
            var endDate = req.body.todateValue;
            var selected_product_id = req.body.loanPrdValue;
            var selected_category_id = req.body.prdCategoryValue;
            var selected_field_off_id = req.body.fieldOffValue;
            var download_report = req.body.report_download_flag;
            var reportPageName = req.body.reportPageName;
            var reportType = req.body.reportType;
            var detailed = '',summary ='',download_report_msg;
            //var activityDetails = new Array(iklantPort, req.session.tenantId, req.session.userId, req.session.userName, req.originalUrl, req.connection.remoteAddress, "router.js", "generateReportWithOfficeDateLoad", "success", "generateReportWithOfficeDateLoad", "generateReportWithOfficeDateLoad");
            //self.commonRouter.insertActivityLogModel(activityDetails);
            if(typeof officeId == 'undefined'){
                officeId = (roleId == constantsObj.getSMHroleId()||roleId == constantsObj.getAMHroleId())?-1:req.session.officeId;
            }
            self.generateReportWithOfficeDateCall(tenantId,officeId,startDate,endDate,selected_product_id,selected_category_id,selected_field_off_id,reportPageName,finYearId,userId, function(reportResult,fileLocation){
                var detailed = '',summary ='',download_report_msg = "";
                var download_report_msg = ( (download_report == 'Download' && (reportResult == null || reportResult.length == 0) )?"No Records" :(download_report == 'Download') ? "Download" : "");
                var check = (reportType == 'Summary')?detailed = 'hideContent': ((reportType == 'Detailed')? summary = 'hideContent' : detailed = 'hideContent');
                self.reportManagementCall(tenantId,officeId,userId, function(statusIdArray,statusDescArray,finResult,ledgerResult,prdOfferingIdArray,prdOfferingNameArray,prdCategoryIdArray,
                                                                     prdCategoryNameArray,personnelIdArray, personnelNameArray){
                    self.commonRouter.retriveOfficeCall(tenantId,userId,function(officeIdArray,officeNameArray,officeAddressArray,officeShortNameArray) {
                        self.getFinancialYearLoadHolder(finResult,function(FinancialYearLoadHolder) {
                            req.session.tenantId = tenantId;
                            res.render(reportPageName, {startDate: startDate, endDate: endDate, officeValue: officeId, fileLocation: fileLocation, officeNameArray: officeNameArray, officeIdArray: officeIdArray,
                                result: reportResult, download_report: download_report_msg, detailed: detailed, summary: summary, prdOfferingIdArray: prdOfferingIdArray, prdOfferingNameArray: prdOfferingNameArray, prdCategoryIdArray: prdCategoryIdArray, prdCategoryNameArray: prdCategoryNameArray,
                                loan_product_value: selected_product_id, prd_category_value: selected_category_id, personnelIdArray: personnelIdArray, personnelNameArray: personnelNameArray, personnel_value: selected_field_off_id, roleId: roleId, constantsObj: constantsObj,
                                finYearId:finYearId,FinancialYearLoadHolder:FinancialYearLoadHolder,finResult:finResult, contextPath:props.contextPath,roleIds:req.session.roleIds});
                        });
                    });
                });
            });
        }catch(e){
            customlog.error("Exception while generateReportWithOfficeDateLoad "+e);
            self.showErrorPage(req,res);
        }
    },

    generateReportWithOfficeDateCall : function(tenantId,officeId,startDate,endDate,selected_product_id,selected_category_id,selected_field_off_id,reportPageName,finYearId,userId, callback){
        this.model.generateReportWithOfficeDateModel(tenantId,officeId,startDate,endDate,selected_product_id,selected_category_id,selected_field_off_id,reportPageName,finYearId,userId, callback);
    },

    *//*Generate the Report with filter from_date,to_date,office,customer,account_no for the reports   *//*
    generateReportWithOfficeDateCustomerAccountLoad : function(req,res){
        try{
            var self = this;
            var constantsObj = this.constants;
            var finYearId = req.body.finYearId;
            var officeId = req.body.listoffice;
            var tenantId = req.session.tenantId;
            var userId = req.session.userId;
            var roleId = req.session.roleId;
            var startDate = req.body.fromdateValue;
            var endDate = req.body.todateValue;
            var selected_product_id = req.body.loanPrdValue;
            var selected_category_id = req.body.prdCategoryValue;
            var selected_field_off_id = req.body.fieldOffValue;
            var customer  = req.body.customerValue;
            var accountNo = req.body.accountNoValue;
            var customerInput  = (req.body.customerValue)== ""?'%':req.body.customerValue;
            var accountNoInput =(req.body.accountNoValue)== ""?'%':req.body.accountNoValue;
            var download_report = req.body.report_download_flag;
            var reportPageName = req.body.reportPageName;
            var reportType = req.body.reportType;
            var includePrevOperation = req.body.includePrevOperation;
            //var activityDetails = new Array(iklantPort, req.session.tenantId, req.session.userId, req.session.userName, req.originalUrl, req.connection.remoteAddress, "router.js", "generateReportWithOfficeDateCustomerAccountLoad", "success", "generateReportWithOfficeDateCustomerAccountLoad", "generateReportWithOfficeDateCustomerAccountLoad");
            //self.commonRouter.insertActivityLogModel(activityDetails);
            if(typeof officeId == 'undefined'){
                officeId = (roleId == constantsObj.getSMHroleId()||roleId == constantsObj.getAMHroleId())?-1:req.session.officeId;
            }
            self.generateReportWithOfficeDateCustomerAccountCall(tenantId,officeId,startDate,endDate,customerInput,accountNoInput,selected_product_id,selected_category_id,
                selected_field_off_id,reportPageName,includePrevOperation,userId,function(reportResult,fileLocation){
                var detailed = '',summary ='',download_report_msg = "";
                var download_report_msg = ( (download_report == 'Download' && (reportResult == null || reportResult.length == 0) )?"No Records" :(download_report == 'Download') ? "Download" : "")
                var check = (reportType == 'Summary')?detailed = 'hideContent': ((reportType == 'Detailed')? summary = 'hideContent' : detailed = 'hideContent');

                self.commonRouter.retriveOfficeCall(tenantId,userId,function(officeIdArray,officeNameArray,officeAddressArray,officeShortNameArray) {
                    self.reportManagementCall(tenantId,officeId,userId, function(statusIdArray,statusDescArray,finResult,ledgerResult,prdOfferingIdArray,prdOfferingNameArray,prdCategoryIdArray,
                                                                         prdCategoryNameArray,personnelIdArray, personnelNameArray){
                        self.getFinancialYearLoadHolder(finResult,function(FinancialYearLoadHolder){
                            req.session.tenantId = tenantId;
                            res.render(reportPageName,{startDate:startDate,endDate:endDate,officeValue:officeId,customerVal:customer,
                            accountNo:accountNo,fileLocation:fileLocation,officeNameArray:officeNameArray,officeIdArray:officeIdArray,result:reportResult,
                            download_report:download_report_msg,detailed:detailed,summary:summary,prdOfferingIdArray:prdOfferingIdArray,prdOfferingNameArray:prdOfferingNameArray,prdCategoryIdArray:prdCategoryIdArray,prdCategoryNameArray:prdCategoryNameArray,
                            loan_product_value:selected_product_id,prd_category_value:selected_category_id,personnelIdArray:personnelIdArray,personnelNameArray:personnelNameArray,personnel_value:selected_field_off_id,roleId:roleId,constantsObj:constantsObj,
                            finYearId:finYearId,FinancialYearLoadHolder:FinancialYearLoadHolder,finResult:finResult,includePrevOperation:includePrevOperation, contextPath:props.contextPath});
                        });
                    });
                });
            });
        }catch(e){
            customlog.error("Exception while generateReportWithOfficeDateCustomerAccountLoad "+e);
            self.showErrorPage(req,res);
        }
    },

    generateReportWithOfficeDateCustomerAccountCall : function(tenantId,officeId,startDate,endDate,customer,accountNo,selected_product_id,selected_category_id,selected_field_off_id,reportPageName,includePrevOperation,userId,callback){
        this.model.generateReportWithOfficeDateCustomerAccountDateModel(tenantId,officeId,startDate,endDate,customer,accountNo,selected_product_id,selected_category_id,selected_field_off_id,reportPageName,includePrevOperation,userId,callback);
    },

    *//*Generate the Report with filter from_date,to_date,office,customer,account_no for the reports   *//*
    accountDefaultPaymentsReportLoad : function(req,res){
        try{
            var self = this;
            var roleId = req.session.roleId;
            var constantsObj = this.constants;
            var officeId = req.body.listoffice;
            var tenantId = req.session.tenantId;
            var userId = req.session.userId;
            var endDate = req.body.todateValue;
            var selected_product_id = req.body.loanPrdValue;
            var selected_category_id = req.body.prdCategoryValue;
            var selected_field_off_id = req.body.fieldOffValue;
            var customer  = req.body.customerValue;
            var accountNo = req.body.accountNoValue;
            var customerInput  = (req.body.customerValue)== ""?'%':req.body.customerValue;
            var accountNoInput =(req.body.accountNoValue)== ""?'%':req.body.accountNoValue;
            var download_report = req.body.report_download_flag;
            var reportPageName = req.body.reportPageName;
            var reportType = req.body.reportType;
            //var activityDetails = new Array(iklantPort, req.session.tenantId, req.session.userId, req.session.userName, req.originalUrl, req.connection.remoteAddress, "router.js", "accountDefaultPaymentsReportLoad", "success", "accountDefaultPaymentsReportLoad", "accountDefaultPaymentsReportLoad");
            //self.commonRouter.insertActivityLogModel(activityDetails);
            if(typeof officeId == 'undefined'){
                officeId = (roleId == constantsObj.getSMHroleId() || roleId == constantsObj.getAMHroleId())?-1:req.session.officeId;
            }
            self.accountDefaultPaymentsReportCall(tenantId,officeId,endDate,customerInput,accountNoInput,selected_product_id,selected_category_id,selected_field_off_id,reportPageName,userId, function(reportResult,fileLocation){
                var detailed = '',summary ='',download_report_msg = "";
                var download_report_msg = ( (download_report == 'Download' && (reportResult == null || reportResult.length == 0) )?"No Records" :(download_report == 'Download') ? "Download" : "")
                var check = (reportType == 'Summary')?detailed = 'hideContent': ((reportType == 'Detailed')? summary = 'hideContent' : detailed = 'hideContent');
                self.commonRouter.retriveOfficeCall(tenantId,userId,function(officeIdArray,officeNameArray,officeAddressArray,officeShortNameArray) {
                    self.reportManagementCall(tenantId,officeId,userId,function(statusIdArray,statusDescArray,finResult,ledgerResult,prdOfferingIdArray,prdOfferingNameArray,prdCategoryIdArray,
                                                                                   prdCategoryNameArray,personnelIdArray, personnelNameArray){
                        req.session.tenantId = tenantId;
                        res.render(reportPageName,{endDate:endDate,officeValue:officeId,customerVal:customer,accountNo:accountNo,fileLocation:fileLocation,officeNameArray:officeNameArray,
                        officeIdArray:officeIdArray,result:reportResult,download_report:download_report_msg,detailed:detailed,summary:summary,roleId:roleId,constantsObj:constantsObj,
                        loan_product_value:selected_product_id,prd_category_value:selected_category_id,prdOfferingIdArray:prdOfferingIdArray,prdOfferingNameArray:prdOfferingNameArray,prdCategoryIdArray:prdCategoryIdArray,
                        prdCategoryNameArray:prdCategoryNameArray,personnel_value:selected_field_off_id,personnelIdArray:personnelIdArray,personnelNameArray:personnelNameArray, contextPath:props.contextPath});
                    });
                });
            });
        }catch(e){
            customlog.error("Exception While accountDefaultPaymentsReportLoad "+e);
            self.showErrorPage(req,res);
        }
    },

    accountDefaultPaymentsReportCall : function(tenantId,officeId,endDate,customer,accountNo,selected_product_id,selected_category_id,selected_field_off_id,reportPageName,userId, callback){
        this.model.accountDefaultPaymentsReportModel(tenantId,officeId,endDate,customer,accountNo,selected_product_id,selected_category_id,selected_field_off_id,reportPageName,userId, callback);
    },
    // Ended by Chitra
*/
    /*loanOfficers : function(req,res){
        try{
            customlog.info('Inside get loan officers ');
            var self = this;
            var constantsObj = this.constants;
            var office_id = req.body.listoffice;
            var officeId = req.session.officeId;
            var roleId = req.session.roleId;
            var personnelArray = new Array();
            this.commonRouter.getPersonnelDetailsCall(office_id,req.session.userId,function(personnelIdArray,personnelNameArray){
                req.body.personnelIdArray = personnelIdArray;
                req.body.personnelNameArray = personnelNameArray
                res.send(req.body);
            });
        }catch(e){
            customlog.error("Exception while loanOfficers "+e);
            self.showErrorPage(req,res);
        }
    },

    trailBalanceCall: function(financialYearId,startDate,endDate,officeId,reportId,accOperation,mfiOperation,callBack){
        this.model.getTrailBalanceModel(financialYearId,startDate,endDate,officeId,reportId,accOperation,mfiOperation,callBack)
    },

    //To show trail balance report
    getTrailBalance :  function(req,res){
        try{
            var self = this;
            customlog.info("Inside show Trail Balance Report");
            if(typeof req.session.tenantId == 'undefined' || typeof req.session.userId == 'undefined') {
                self.showErrorPage(req,res);
            }else{
                var pageName = req.body.reportPageName;
                //var activityDetails = new Array(iklantPort, req.session.tenantId, req.session.userId, req.session.userName, req.originalUrl, req.connection.remoteAddress, "router.js", "getTrailBalance", "success", pageName+" Report", "getTrailBalance");
                //self.commonRouter.insertActivityLogModel(activityDetails);
                var startDate = req.body.fromdate;
                var endDate = req.body.todate;
                var officeId = req.body.listoffice;
                var financialYearId = req.body.finYearId;
                var roleId = req.session.roleId;
                var tenantId = req.session.tenantId;
                var userId = req.session.userId;
                var constantsObj = this.constants;
                var download_report = req.body.report_download_flag;
                var download_report_msg = "";
                var accOperation = (req.body.accOperation == 'on')?'accounting':'';
                var mfiOperation = (req.body.mfiOperation == 'on')?'mfi':'';
                var reportId = req.body.reportId;

                if(typeof(officeId) == 'undefined'){
                    officeId = (roleId == constantsObj.getSMHroleId() ||roleId == constantsObj.getAMHroleId())?-1:req.session.officeId;
                }

                self.commonRouter.retriveOfficeCall(tenantId,userId,function(officeIdArray,officeNameArray,officeAddressArray,officeShortNameArray) {
                    self.reportManagementCall(tenantId,officeId,userId,function(statusIdArray,statusDescArray,finResult,ledgerResult,prdOfferingIdArray,prdOfferingNameArray,prdCategoryIdArray,
                                                                         prdCategoryNameArray,personnelIdArray, personnelNameArray){
                        self.trailBalanceCall(financialYearId,startDate,endDate,officeId,reportId,accOperation,mfiOperation,function(trailBalanceResult,fileLocation){
                            self.getFinancialYearLoadHolder(finResult,function(FinancialYearLoadHolder){
                                if(download_report == 'Download' && (trailBalanceResult == null || trailBalanceResult.length == 0) ){
                                    download_report_msg = "No Records";
                                }else if(download_report == 'Download'){
                                    download_report_msg = "Download";
                                }
                                req.session.tenantId = tenantId;
                                res.render(pageName,{result : trailBalanceResult,fileLocation:fileLocation,officeIdArray:officeIdArray,officeNameArray:officeNameArray,roleId:roleId,constantsObj:constantsObj,
                                    finResult:finResult,ledgerResult:ledgerResult,download_report:download_report_msg,startDate:startDate,endDate:endDate,officeValue:officeId,finYearId:financialYearId,FinancialYearLoadHolder:FinancialYearLoadHolder,
                                    accOperation:req.body.accOperation,mfiOperation:req.body.mfiOperation,reportId:reportId, contextPath:props.contextPath});
                            });
                        });
                    });
                });
            }
        }catch(e){
            customlog.error("Exception While getTrailBalance "+e);
            self.showErrorPage(req,res);
        }
    },

    overdueSummaryCall: function(toDate,officeId,category,loan_product,personnelId,loanStatus,customer,loanAccount,npaIndicator,daysInArrearsAbove,totalOverdueAbove,userId,callBack){
        this.model.getOverdueSummaryModel(toDate,officeId,category,loan_product,personnelId,loanStatus,customer,loanAccount,npaIndicator,daysInArrearsAbove,totalOverdueAbove,userId,callBack)
    },

    // To show overdue report
    overdueSummary : function(req,res){
        try{
            var self = this;
            customlog.info("Inside show Overdue Report");
            if(typeof req.session.tenantId == 'undefined' || typeof req.session.userId == 'undefined') {
                self.showErrorPage(req,res);
            }else{
                //var activityDetails = new Array(iklantPort, req.session.tenantId, req.session.userId, req.session.userName, req.originalUrl, req.connection.remoteAddress, "router.js", "overdueSummary", "success", "Overdue Summary", "overdueSummary");
                //self.commonRouter.insertActivityLogModel(activityDetails);
                var toDate = req.body.todate;
                var officeId = req.body.listoffice;
                var personnelId = req.body.loanOfficer;
                var category = req.body.category;
                var loan_product = req.body.loan_product;
                var loanStatus = req.body.loanStatus;
                var daysInArrearsAbove = req.body.days_in_arrears_above;
                var totalOverdueAbove = req.body.total_overdue_above;
                var customer = req.body.customer;
                var loanAccount = req.body.account;
                var npaIndicator = req.body.npaIndicator;
                var roleId = req.session.roleId;
                var tenantId = req.session.tenantId;
                var userId = req.session.userId;
                var constantsObj = this.constants;
                var download_report = req.body.report_download_flag;
                var download_report_msg = "";
                var reportType = req.body.reportType;
                var detailed = '',summary ='';
                if(reportType == 'Summary'){
                    detailed = 'hideContent';
                }
                else if(reportType=='Detailed'){
                    summary = 'hideContent';
                }
                else{
                    detailed = 'hideContent';
                }

                if(typeof(officeId) == 'undefined'){
                    officeId = (roleId == constantsObj.getSMHroleId() || roleId == constantsObj.getAMHroleId())?-1:req.session.officeId;
                }
                self.commonRouter.retriveOfficeCall(tenantId,userId,function(officeIdArray,officeNameArray,officeAddressArray,officeShortNameArray) {
                    self.overdueSummaryCall(toDate,officeId,category,loan_product,personnelId,loanStatus,customer,loanAccount,npaIndicator,daysInArrearsAbove,totalOverdueAbove,userId,function(overdueResult,fileLocation){
                        if(download_report == 'Download' && (overdueResult == null || overdueResult.length == 0) ){
                            download_report_msg = "No Records";
                        }else if(download_report == 'Download'){
                            download_report_msg = "Download";
                        }
                        self.commonRouter.getPersonnelDetailsCall(officeId,userId,function(personnelIdArray,personnelNameArray){
                            self.retrieveLoanProductAndCategoryCall(tenantId,function(prdOfferingIdArray, prdOfferingNameArray, prdCategoryIdArray, prdCategoryNameArray){
                                req.session.tenantId = tenantId;
                                res.render('overdueSummary',{result:overdueResult,fileLocation:fileLocation,officeIdArray:officeIdArray,officeNameArray:officeNameArray,roleId:roleId,fileLocation:fileLocation,constantsObj:constantsObj,personnelResult:null,
                                    download_report:download_report_msg,endDate:toDate,officeValue:officeId,prdCategory:category,loanStatus:loanStatus,daysInArrearsAbove:daysInArrearsAbove,totalOverdueAbove:totalOverdueAbove,accountNo:loanAccount,customerVal:customer,
                                    npaIndicator:npaIndicator,loanOfficerId:personnelId,detailed:detailed,summary:summary,personnel_value:personnelId,personnelIdArray:personnelIdArray,personnelNameArray:personnelNameArray,prd_category_value:category,
                                    prdOfferingIdArray:prdOfferingIdArray,prdOfferingNameArray:prdOfferingNameArray,loan_product_value:loan_product,prdCategoryIdArray:prdCategoryIdArray,prdCategoryNameArray:prdCategoryNameArray,prd_category_value:category, contextPath:props.contextPath});
                            });
                        });
                    });
                });
            }
        }catch(e){
            customlog.error("Exception while overdueSummary "+e);
            self.showErrorPage(req,res);
        }
    },

    demandCollectionCall: function(fromDate, toDate, officeId,loanOfficerId,productCategoryId,loanProductId,customer,account, reportCategory, reportId, individual_tracked, userId,callBack){
        this.model.getDemandCollectionSummaryModel(fromDate, toDate, officeId,loanOfficerId,productCategoryId,loanProductId,customer,account,reportCategory, reportId, individual_tracked, userId,callBack);
    },

    retrieveLoanProductAndCategoryCall : function(tenantId,callBack){
        this.model.retrieveLoanProductAndCategoryModel(tenantId,callBack);
    },
*/
  /*  // To show demand collection summary
    demandCollectionSummary : function(req,res){
        try{
            var self = this;
            customlog.info('Inside demand collection summary');
            if(typeof req.session.tenantId == 'undefined' || typeof req.session.userId == 'undefined') {
                self.showErrorPage(req,res);
            }else{
                var pageName = req.body.reportPageName;
                //var activityDetails = new Array(iklantPort, req.session.tenantId, req.session.userId, req.session.userName, req.originalUrl, req.connection.remoteAddress, "router.js", "demandCollectionSummary", "success", pageName+" Report", "demandCollectionSummary");
                //self.commonRouter.insertActivityLogModel(activityDetails);
                var fromDate = req.body.fromdate;
                var toDate = req.body.todate;
                var officeId = req.body.listoffice;
                var productCategoryId = req.body.category;
                var loanProductId = req.body.loan_product;
                var loanOfficerId = req.body.loanOfficer;
                var customer = req.body.customer;
                var account = req.body.account;
                var roleId = req.session.roleId;
                var tenantId = req.session.tenantId;
                var userId = req.session.userId;
                var constantsObj = this.constants;
                var download_report = req.body.report_download_flag;
                var download_report_msg = "";
                var reportType = req.body.reportType;
                var reportCategory = req.body.reportCategory;
                var individual_tracked = req.body.individual_tracked;
                var reportId = req.body.reportId;
                var detailed = '',summary ='';

                if(reportType == 'Summary'){
                    detailed = 'hideContent';
                }
                else if(reportType=='Detailed'){
                    summary = 'hideContent';
                }
                else{
                    detailed = 'hideContent';
                }
                if(typeof(officeId) == 'undefined'){
                    officeId = (roleId == constantsObj.getSMHroleId() || roleId == constantsObj.getAMHroleId())?-1:req.session.officeId;
                }

                self.commonRouter.retriveOfficeCall(tenantId,userId,function(officeIdArray,officeNameArray,officeAddressArray,officeShortNameArray) {
                    self.demandCollectionCall(fromDate, toDate, officeId,loanOfficerId,productCategoryId,loanProductId,customer,account,reportCategory,reportId,individual_tracked,userId,function(demandCollectionResult,fileLocation){
                        self.commonRouter.getPersonnelDetailsCall(officeId,userId,function(personnelIdArray,personnelNameArray){
                            self.retrieveLoanProductAndCategoryCall(tenantId,function(prdOfferingIdArray, prdOfferingNameArray, prdCategoryIdArray, prdCategoryNameArray){
                                if(download_report == 'Download' && (demandCollectionResult == null || demandCollectionResult.length == 0) ){
                                    download_report_msg = "No Records";
                                }else if(download_report == 'Download'){
                                    download_report_msg = "Download";
                                }
                                req.session.tenantId = tenantId;
                                res.render(pageName,{result:demandCollectionResult,fileLocation:fileLocation,officeIdArray:officeIdArray,
                                    officeNameArray:officeNameArray,roleId:roleId,constantsObj:constantsObj,download_report:download_report_msg,
                                    officeValue:officeId,startDate:fromDate,endDate:toDate,accountNo:account,customerVal:customer,
                                    detailed:detailed,summary:summary,reportCategory:reportCategory,personnel_value:loanOfficerId,
                                    prd_category_value:productCategoryId,loan_product_value:loanProductId,personnelIdArray:personnelIdArray,
                                    personnelNameArray:personnelNameArray,prdOfferingIdArray:prdOfferingIdArray, prdOfferingNameArray:prdOfferingNameArray,
                                    prdCategoryIdArray:prdCategoryIdArray, prdCategoryNameArray:prdCategoryNameArray,reportId:reportId, contextPath:props.contextPath});
                            });
                        });
                    });
                });
            }
        }catch(e){
            customlog.error("Exception while demandCollectionSummary "+e);
            self.showErrorPage(req,res);
        }
    },

    generalLedgerCall: function(fromDate, toDate, officeId, selected_ledger_name,ledger_id, accOperation,mfiOperation,userId,callBack){
        this.model.getGeneralLedgerSummaryModel(fromDate, toDate, officeId, selected_ledger_name,ledger_id, accOperation,mfiOperation,userId,callBack);
    },

    // To show general ledger summary
    generalLedgerSummary : function(req,res){
        try{
            var self = this;
            customlog.info('Inside general ledger summary');
            if(typeof req.session.tenantId == 'undefined' || typeof req.session.userId == 'undefined') {
                self.showErrorPage(req,res);
            }else{
                //var activityDetails = new Array(iklantPort, req.session.tenantId, req.session.userId, req.session.userName, req.originalUrl, req.connection.remoteAddress, "router.js", "generalLedgerSummary", "success", "General Ledger Summary", "generalLedgerSummary");
                //self.commonRouter.insertActivityLogModel(activityDetails);
                var finYearId = req.body.finYearId;
                var fromDate = req.body.fromdate;
                var toDate = req.body.todate;
                var officeId = req.body.listoffice;
                var ledger_id = req.body.ledger_id;
                var selected_ledger_name = req.body.ledgerNameGL;
                var roleId = req.session.roleId;
                var tenantId = req.session.tenantId;
                var userId = req.session.userId;
                var constantsObj = this.constants;
                var download_report = req.body.report_download_flag;
                var download_report_msg = "";
                var reportType = req.body.reportType;
                var detailed = '',summary ='';
                var accOperation = (req.body.accOperation == 'on')?'accounting':'';
                var mfiOperation = (req.body.mfiOperation == 'on')?'mfi':'';

                if(reportType == 'Summary'){
                    detailed = 'hideContent';
                }
                else if(reportType=='Detailed'){
                    summary = 'hideContent';
                }
                else{
                    detailed = 'hideContent';
                }
                if(typeof(officeId) == 'undefined'){
                    officeId = (roleId == constantsObj.getSMHroleId() || roleId == constantsObj.getAMHroleId())?-1:req.session.officeId;
                }

                self.generalLedgerCall(fromDate, toDate, officeId,selected_ledger_name,ledger_id,accOperation,mfiOperation,userId,function(generalLedgerResult,fileLocation){
                    self.commonRouter.retriveOfficeCall(tenantId,userId,function(officeIdArray,officeNameArray,officeAddressArray,officeShortNameArray) {
                        self.reportManagementCall(tenantId,officeId,userId,function(statusIdArray,statusDescArray,finResult,ledgerResult,prdOfferingIdArray,prdOfferingNameArray,prdCategoryIdArray,
                                                                             prdCategoryNameArray,personnelIdArray, personnelNameArray){
                            self.getFinancialYearLoadHolder(finResult,function(FinancialYearLoadHolder){
                                if(download_report == 'Download' && (generalLedgerResult == null || generalLedgerResult.length == 0) ){
                                    download_report_msg = "No Records";
                                }else if(download_report == 'Download'){
                                    download_report_msg = "Download";
                                }
                                req.session.tenantId = tenantId;
                                res.render('generalLedgerSummary',{result:generalLedgerResult,fileLocation:fileLocation,officeIdArray:officeIdArray,officeNameArray:officeNameArray,roleId:roleId,constantsObj:constantsObj,
                                    ledgerResult:ledgerResult,download_report:download_report_msg,officeValue:officeId,startDate:fromDate,endDate:toDate,ledgerValue:ledger_id,detailed:detailed,summary:summary,finResult:finResult,
                                    finYearId:finYearId,FinancialYearLoadHolder:FinancialYearLoadHolder,finResult:finResult,accOperation:req.body.accOperation,mfiOperation:req.body.mfiOperation, contextPath:props.contextPath});
                            });
                        });
                    });
                });
            }
        }catch(e){
            customlog.error("Exception while generalLedgerSummary "+e);
            self.showErrorPage(req,res);
        }
    },


    voucherOrReceiptOrLoanDPCall : function(fromDate,toDate,officeId,loanOfficerId,category,loanProduct,accOperation,mfiOperation,reportId,userId,callBack){
        this.model.getVoucherOrReceiptOrLoanDP(fromDate,toDate,officeId,loanOfficerId,category,loanProduct,accOperation,mfiOperation,reportId,userId,callBack);
    },

    // To show cash payment voucher
    voucherOrReceiptOrLoanDP : function(req,res){
        try{
            var self = this;
            if(typeof req.session.tenantId == 'undefined' || typeof req.session.userId == 'undefined') {
                self.showErrorPage(req,res);
            }else{
                var pageName = req.body.reportPageName;
                //var activityDetails = new Array(iklantPort, req.session.tenantId, req.session.userId, req.session.userName, req.originalUrl, req.connection.remoteAddress, "router.js", "voucherOrReceiptOrLoanDP", "success", pageName+" Report", "voucherOrReceiptOrLoanDP");
                //self.commonRouter.insertActivityLogModel(activityDetails);
                var finYearId = req.body.finYearId;
                var fromDate = req.body.fromdate;
                var toDate = req.body.todate;
                var officeId = req.body.listoffice;
                var loanOfficerId = req.body.loanOfficer;
                var category = req.body.category;
                var loanProduct = req.body.loan_product;
                var roleId = req.session.roleId;
                var tenantId = req.session.tenantId;
                var userId = req.session.userId;
                var constantsObj = this.constants;
                var accOperation = (req.body.accOperation == 'on')?'accounting':'';
                var mfiOperation = (req.body.mfiOperation == 'on')?'mfi':'';
                var download_report = req.body.report_download_flag;
                var download_report_msg = "";
                var reportType = req.body.reportType;
                var detailed = '',summary ='',classValue='';
                var reportId = req.body.reportId;
                if(reportType == 'Summary'){
                    detailed = 'hideContent';
                }
                else if(reportType=='Detailed'){
                    summary = 'hideContent';
                }
                else{
                    detailed = 'hideContent';
                }

                if(typeof(officeId) == 'undefined') {
                    officeId = (roleId == constantsObj.getSMHroleId() || roleId == constantsObj.getAMHroleId()) ? -1 :req.session.officeId;
                }

                if(mfiOperation == undefined || mfiOperation == 'off'){
                    classValue = 'hideContent';
                }

                self.commonRouter.retriveOfficeCall(tenantId,userId,function(officeIdArray,officeNameArray,officeAddressArray,officeShortNameArray) {
                    self.reportManagementCall(tenantId,officeId,userId,function(statusIdArray,statusDescArray,finResult,ledgerResult,prdOfferingIdArray,prdOfferingNameArray,prdCategoryIdArray,
                                                                         prdCategoryNameArray,personnelIdArray, personnelNameArray){
                        self.voucherOrReceiptOrLoanDPCall(fromDate,toDate,officeId,loanOfficerId,category,loanProduct,accOperation,mfiOperation,reportId,userId,function(cashPaymentResult,fileLocation){
                            self.getFinancialYearLoadHolder(finResult,function(FinancialYearLoadHolder){
                                if(download_report == 'Download' && (cashPaymentResult == null || cashPaymentResult.length == 0) ){
                                    download_report_msg = "No Records";
                                }else if(download_report == 'Download'){
                                    download_report_msg = "Download";
                                }
                                req.session.tenantId = tenantId;
                                res.render(pageName,{result:cashPaymentResult,fileLocation:fileLocation,roleId:roleId,constantsObj:constantsObj,officeIdArray:officeIdArray,officeNameArray:officeNameArray,
                                    accOperation:req.body.accOperation,mfiOperation:req.body.mfiOperation,startDate:fromDate,endDate:toDate,officeValue:officeId,download_report:download_report_msg,detailed:detailed,
                                    summary:summary,personnelIdArray:personnelIdArray,personnelNameArray:personnelNameArray,personnel_value:loanOfficerId,classValue:classValue,
                                    prdOfferingIdArray:prdOfferingIdArray,prdOfferingNameArray:prdOfferingNameArray,loan_product_value:loanProduct,prdCategoryIdArray:prdCategoryIdArray,
                                    prdCategoryNameArray:prdCategoryNameArray,prd_category_value:category,FinancialYearLoadHolder:FinancialYearLoadHolder, finYearId:finYearId,finResult:finResult,reportId:reportId, contextPath:props.contextPath});
                            });
                        });
                    });
                });
            }
        }catch(e){
            customlog.error("Exception While voucherOrReceiptOrLoanDP "+e);
            self.showErrorPage(req,res);
        }
    },

    principalOutstandingCall : function(toDate,officeId,productCategoryId,loanProductId,loanOfficerId,customer,account,reportId,includePrevOperation,userId,callBack){
        this.model.getPrincipalOutstandingModel(toDate,officeId,productCategoryId,loanProductId,loanOfficerId,customer,account,reportId,includePrevOperation,userId,callBack);
    },

    // To show interest rate wise/amount wise principal outstanding report
    principalOutstandingSummary : function(req,res){
        try{
            var self = this;
            if(typeof req.session.tenantId == 'undefined' || typeof req.session.userId == 'undefined') {
                self.showErrorPage(req,res);
            }else{
                var pageName = req.body.reportPageName;
                //var activityDetails = new Array(iklantPort, req.session.tenantId, req.session.userId, req.session.userName, req.originalUrl, req.connection.remoteAddress, "router.js", "principalOutstandingSummary", "success", pageName+" Report", "principalOutstandingSummary");
                //self.commonRouter.insertActivityLogModel(activityDetails);
                var toDate = req.body.todate;
                var officeId = req.body.listoffice;
                var loanOfficerId = req.body.loanOfficer;
                var productCategoryId = req.body.category;
                var loanProductId = req.body.loan_product;
                var customer = req.body.customer;
                var account = req.body.account;
                var roleId = req.session.roleId;
                var tenantId = req.session.tenantId;
                var constantsObj = this.constants;
                var download_report = req.body.report_download_flag;
                var download_report_msg = "";
                var reportType = req.body.reportType;
                var includePrevOperation = req.body.includePrevOperation;
                var detailed = '',summary ='';
                var reportId = req.body.reportId;
                var userId = req.session.userId;
                if(reportType == 'Summary'){
                    detailed = 'hideContent';
                }
                else if(reportType=='Detailed'){
                    summary = 'hideContent';
                }
                else{
                    detailed = 'hideContent';
                }

                if(typeof(officeId) == 'undefined'){
                    officeId = (roleId == constantsObj.getSMHroleId() || roleId == constantsObj.getAMHroleId())?-1:req.session.officeId;
                }

                self.commonRouter.retriveOfficeCall(tenantId,userId,function(officeIdArray,officeNameArray,officeAddressArray,officeShortNameArray) {
                    self.principalOutstandingCall(toDate,officeId,productCategoryId,loanProductId,loanOfficerId,customer,account,reportId,includePrevOperation,userId,function(principalOutstandingResult,fileLocation){
                        self.commonRouter.getPersonnelDetailsCall(officeId,userId, function(personnelIdArray,personnelNameArray){
                            self.retrieveLoanProductAndCategoryCall(tenantId,function(prdOfferingIdArray, prdOfferingNameArray, prdCategoryIdArray, prdCategoryNameArray){
                                if(download_report == 'Download' && (principalOutstandingResult == null || principalOutstandingResult.length == 0) ){
                                    download_report_msg = "No Records";
                                }else if(download_report == 'Download'){
                                    download_report_msg = "Download";
                                }
                                req.session.tenantId = tenantId;
                                res.render(pageName,{result:principalOutstandingResult,fileLocation:fileLocation,roleId:roleId,constantsObj:constantsObj,
                                    officeIdArray:officeIdArray,officeNameArray:officeNameArray,download_report:download_report_msg,endDate:toDate,
                                    officeValue:officeId,customerVal:customer,accountNo:account,detailed:detailed,summary:summary,
                                    prd_category_value:productCategoryId,loan_product_value:loanProductId,prdOfferingIdArray:prdOfferingIdArray,
                                    prdOfferingNameArray:prdOfferingNameArray,prdCategoryIdArray:prdCategoryIdArray, prdCategoryNameArray:prdCategoryNameArray,
                                    personnelIdArray:personnelIdArray,personnelNameArray:personnelNameArray,personnel_value:loanOfficerId,includePrevOperation:includePrevOperation,reportId:reportId, contextPath:props.contextPath});
                            });
                        });
                    });
                });
            }
        }catch(e){
            customlog.error("Exception while principalOutstandingSummary "+e);
            self.showErrorPage(req,res);
        }
    },

    DEOActivityTrackingCall : function(fromDate,toDate,officeId,customer,roleId,userId,callBack){
        this.model.getDEOActivityTrackingModel(fromDate,toDate,officeId,customer,roleId,userId,callBack);
    },

    // To show DEO Activity Tracking report
    DEOActivityTracking : function(req,res){
        try{
            var self = this;
            if(typeof req.session.tenantId == 'undefined' || typeof req.session.userId == 'undefined') {
                self.showErrorPage(req,res);
            }else{
                //var activityDetails = new Array(iklantPort, req.session.tenantId, req.session.userId, req.session.userName, req.originalUrl, req.connection.remoteAddress, "router.js", "DEOActivityTracking", "success", "DEOActivity Report", "DEOActivityTracking");
                //self.commonRouter.insertActivityLogModel(activityDetails);
                var fromDate = req.body.fromdate;
                var toDate = req.body.todate;
                var officeId = req.body.listoffice;
                var customer = req.body.customer;
                var roleId = req.session.roleId;
                var tenantId = req.session.tenantId;
                var constantsObj = this.constants;
                var download_report = req.body.report_download_flag;
                var download_report_msg = "";

                if(typeof(officeId) == 'undefined'){
                    officeId = req.session.officeId;
                }

                self.commonRouter.retriveOfficeCall(tenantId,req.session.userId,function(officeIdArray,officeNameArray,officeAddressArray,officeShortNameArray) {
                    self.DEOActivityTrackingCall(fromDate,toDate,officeId,customer,roleId,req.session.userId,function(DEOActivityResult,fileLocation){
                            if(download_report == 'Download' && (DEOActivityResult == null || DEOActivityResult.length == 0) ){
                                download_report_msg = "No Records";
                            }else if(download_report == 'Download'){
                                download_report_msg = "Download";
                            }
                            res.render(req.body.reportPageName,{result:DEOActivityResult,fileLocation:fileLocation,roleId:roleId,constantsObj:constantsObj,
                                officeIdArray:officeIdArray,officeNameArray:officeNameArray,download_report:download_report_msg,startDate:fromDate,endDate:toDate,
                                officeValue:officeId,customerVal:customer, contextPath:props.contextPath,roleIds:req.session.roleIds});
                        });
                });
            }
        }catch(e){
            customlog.error("Exception while DEOActivityTracking "+e);
            self.showErrorPage(req,res);
        }
    },

    PARReportCall : function(toDate,officeId,daysInArrears,reportId,userId, callBack){
        this.model.getPARReportModel(toDate,officeId,daysInArrears,reportId, userId,callBack);
    },

    PARReport : function(req,res){
        try{
            var self = this;
            if(typeof req.session.tenantId == 'undefined' || typeof req.session.userId == 'undefined') {
                self.showErrorPage(req,res);
            }else{
                //var activityDetails = new Array(iklantPort, req.session.tenantId, req.session.userId, req.session.userName, req.originalUrl, req.connection.remoteAddress, "router.js", "PARReport", "success", "PAR Report", "PARReport");
                //self.commonRouter.insertActivityLogModel(activityDetails);
                var toDate = req.body.todate;
                var officeId = req.body.listoffice;
                var daysInArrears = req.body.days_in_arrears;
                var reportId = req.body.reportId;
                var roleId = req.session.roleId;
                var tenantId = req.session.tenantId;
                var constantsObj = this.constants;
                var download_report = req.body.report_download_flag;
                var download_report_msg = "";
                var userId = req.session.userId;

                if(typeof(officeId) == 'undefined'){
                    officeId =  (roleId == constantsObj.getSMHroleId() || roleId == constantsObj.getAMHroleId())?-1:req.session.officeId;
                }

                self.commonRouter.retriveOfficeCall(tenantId,userId,function(officeIdArray,officeNameArray,officeAddressArray,officeShortNameArray) {
                    self.PARReportCall(toDate,officeId,daysInArrears,reportId,userId, function(PARResult,fileLocation){
                        if(download_report == 'Download' && (PARResult == null || PARResult.length == 0) ){
                            download_report_msg = "No Records";
                        }else if(download_report == 'Download'){
                            download_report_msg = "Download";
                        }
                        res.render(req.body.reportPageName,{result:PARResult,fileLocation:fileLocation,roleId:roleId,constantsObj:constantsObj,
                            officeIdArray:officeIdArray,officeNameArray:officeNameArray,download_report:download_report_msg,endDate:toDate,
                            officeValue:officeId,reportId:reportId,daysInArrears:daysInArrears, contextPath:props.contextPath});
                    });
                });
            }
        }catch(e){
                customlog.error("Exception while PARReport "+e);
            self.showErrorPage(req,res);
            }
    },

    LUCTrackingReportCall : function(fromDate,toDate,officeId,roleId,download_report,userId,callBack){
        this.model.getLUCTrackingReportModel(fromDate,toDate,officeId,roleId,download_report,userId,callBack);
    },

    // To show luc Tracking report @ Paramasivan
    LUCTrackingReport : function(req,res){
        try{
            var moment = require('moment');
            var self = this;
            if(typeof req.session.tenantId == 'undefined' || typeof req.session.userId == 'undefined') {
                self.showErrorPage(req,res);
            }else{
                //var activityDetails = new Array(iklantPort, req.session.tenantId, req.session.userId, req.session.userName, req.originalUrl, req.connection.remoteAddress, "router.js", "DEOActivityTracking", "success", "DEOActivity Report", "DEOActivityTracking");
                //self.commonRouter.insertActivityLogModel(activityDetails);
                var fromDate = req.body.fromdate
                var toDate = req.body.todate
                var officeId = req.body.listoffice;
                var roleId = req.session.roleId;
                var tenantId = req.session.tenantId;
                var constantsObj = this.constants;
                var download_report = req.body.report_download_flag;
                var download_report_msg = "";
                var userId = req.session.userId;

                if(typeof(officeId) == 'undefined'){
                    officeId = req.session.officeId;
                }

                self.commonRouter.retriveOfficeCall(tenantId,req.session.userId,function(officeIdArray,officeNameArray,officeAddressArray,officeShortNameArray) {
                    self.LUCTrackingReportCall(fromDate,toDate,officeId,roleId,download_report,userId,function(LUCTrackingResult,fileLocation){
                        if(download_report == 'Download' && (LUCTrackingResult == null || LUCTrackingResult.length == 0) ){
                            download_report_msg = "No Records";
                        }else if(download_report == 'Download'){
                            download_report_msg = "Download";
                        }
                        res.render(req.body.reportPageName,{result:LUCTrackingResult,fileLocation:fileLocation,roleId:roleId,constantsObj:constantsObj,
                            officeIdArray:officeIdArray,officeNameArray:officeNameArray,download_report:download_report_msg,startDate:fromDate,endDate:toDate,
                            officeValue:officeId,moment: moment});
                    });
                });
            }
        }catch(e){
            customlog.error("Exception while LUCTrackingReport "+e);
            self.showErrorPage(req,res);
        }
    },
*/
    // Method to get active and rejected clients for AssignFO screen
    /*clientDetailsCall: function(group_id,callBack){
        this.model.getActiveOrRejectedClientsModel(group_id,callBack);
    },*/

    /*loadActiveOrRejectedClients: function(req,res){
        try{
            var self = this;
            var group_id = req.body.group_id;
            this.clientDetailsCall(group_id,function(status,clientDetails,rejectedDetails,reinitiatedDetails,reintiatedClients,lastCreditCheckDate){
                req.body.status = status;
                req.body.clientDetails = clientDetails;
                req.body.rejectedDetails = rejectedDetails;
                req.body.reinitiatedDetails = reinitiatedDetails;
                req.body.reintiatedClients = reintiatedClients;
                req.body.lastCreditCheckDate = lastCreditCheckDate;
                res.send(req.body);
            });
        }catch(e){
            customlog.error("Exception while loadActiveOrRejectedClients "+e);
            self.commonRouter.showErrorPage(req,res);
        }
    },*/

    /*getFinancialYearLoadHolder : function(finResult,callBack){
        try{
            var FinancialYearLoadHolder = require(domainPath +"/FinancialYearLoadHolder.js");
            var financialYearIdArray = new Array();
            var financialYearStartDateArray = new Array();
            var financialYearEndDateArray = new Array();
            var FinancialYearLoadHolder = new FinancialYearLoadHolder() ;
            for(var item = 0; item<finResult.length; item++) {
                financialYearIdArray[item]	= finResult[item].financialyear_id;
                financialYearStartDateArray[item] = finResult[item].financialyear_startdate;
                financialYearEndDateArray[item] = finResult[item].financialyear_enddate;
            }
            FinancialYearLoadHolder.setFinancialYearIdArray(financialYearIdArray);
            FinancialYearLoadHolder.setFinancialYearStartDateArray(financialYearStartDateArray);
            FinancialYearLoadHolder.setFinancialYearEndDateArray(financialYearEndDateArray);
            callBack(FinancialYearLoadHolder);
        }catch(e){
            customlog.error("Exception while getFinancialYearLoadHolder "+e);
            self.showErrorPage(req,res);
        }
    },

    getReportStatus : function(reportId,callBack){
        this.model.getReportStatusModel(reportId,callBack);
    },

    showMaintenancePage : function(reportName,reportCategory,res){
        res.render("maintenancePage",{reportName:reportName,reportCategory:reportCategory, contextPath:props.contextPath});
    },

    reportsMenuCall : function(reportCategoryId, roleId, callBack){
        this.model.reportsMenuModel(reportCategoryId, roleId, callBack);
    },
*/
    /*// Added by chitra
    *//*Get the group details for the background verification   *//*
    getGroupsForBackGroundVerification : function(req,res){
        try{
            var self = this;
            var officeId = req.params.branch;
            var tenantId = req.session.tenantId;
            var constantsObj = this.constants;
            var roleId = req.session.roleId;
            var error_msg = "Please select Branch";
            if(typeof (tenantId) == 'undefined' || typeof (req.session.userId) == 'undefined') {
                res.redirect(props.contextPath+'/client/ci/login');
            }else{
                //var activityDetails = new Array(iklantPort, req.session.tenantId, req.session.userId, req.session.userName, req.originalUrl, req.connection.remoteAddress, "router.js", "getGroupsForBackGroundVerification", "success", "getGroupsForBackGroundVerification", "getGroupsForBackGroundVerification");
                //self.commonRouter.insertActivityLogModel(activityDetails);
                self.commonRouter.retriveOfficeCall(tenantId,req.session.userId,function(officeIdArray,officeNameArray,officeAddressArray,officeShortNameArray) {
                    req.session.tenantId = tenantId;
                    if(officeId == -1 || typeof(officeId) == 'undefined'){
                        res.render('backgroundVerification',{officeNameArray:officeNameArray,officeIdArray:officeIdArray,roleId:roleId,constantsObj:constantsObj,
                            selectedOfficeId:"",errorField:error_msg,backGroundVerificationResult:"", contextPath:props.contextPath});
                    }else{
                        self.getGroupsForBackGroundVerificationCall(officeId,function(backGroundVerificationResult){
                            res.render('backgroundVerification',{officeNameArray:officeNameArray,officeIdArray:officeIdArray,roleId:roleId,constantsObj:constantsObj,
                                selectedOfficeId:officeId,errorField:"",backGroundVerificationResult:backGroundVerificationResult, contextPath:props.contextPath});
                        });
                    }
                });
            }
        }catch(e){
            customlog.error("Exception while getGroupsForBackGroundVerification "+e);
            self.showErrorPage(req,res);
        }
    },

    getGroupsForBackGroundVerificationCall : function(officeId, callBack){
        this.model.getGroupsForBackGroundVerificationModel(officeId, callBack);
    },

    retrieveClientDetailsForVerificationPage : function(parent_customer_id,callback) {
        this.model.retrieveClientDetailsForVerificationPageModel(parent_customer_id,callback);
    },

    retrieveClientDetailsForVerification :  function(req,res) {
        try{
            var self = this;
            var parent_customer_id = req.body.parent_customer_id;
            //var activityDetails = new Array(iklantPort, req.session.tenantId, req.session.userId, req.session.userName, req.originalUrl, req.connection.remoteAddress, "router.js", "retrieveClientDetailsForVerification", "success", "retrieveClientDetailsForVerification", "retrieveClientDetailsForVerification");
            //self.commonRouter.insertActivityLogModel(activityDetails);
            self.retrieveClientDetailsForVerificationPage(parent_customer_id,function(clientResult){
                req.body.clientResult 	  = clientResult;
                res.send(req.body);
            });
        }catch(e){
            customlog.error("Exception while retrieveClientDetailsForVerification "+e);
            self.showErrorPage(req,res);
        }
    },
    // Ended by chitra
*/
    //Ezra Johnson
    /*getKYCUploadStatus: function(req, res){
        try{
            var self = this;
            var groupId = req.body.groupId;
            var centerName = req.body.centerName;
            var groupName = req.body.groupName;
            var fieldOfficer = req.body.fieldOfficer;
            if(typeof(centerName) == 'undefined' || typeof(groupName) == 'undefined' || typeof(fieldOfficer) == 'undefined' || typeof(groupId) == 'undefined'){
                res.redirect(props.contextPath+'/client/ci/login');
            } else {
                //var activityDetails = new Array(iklantPort, req.session.tenantId, req.session.userId, req.session.userName, req.originalUrl, req.connection.remoteAddress, "router.js", "getKYCUploadStatus", "success", "KYC Upload Status", "KYC Upload Status page");
                //self.commonRouter.insertActivityLogModel(activityDetails);
                this.model.getKYCUploadStatusModel(groupId, function(uploadStatusDetails){
                    if(uploadStatusDetails != null){
                        var kycStatus = require(domainPath +'/KYCupdateStatus');
                        var uploadStatusArray = [];
                        for(var i=0; i<uploadStatusDetails.length; i++) {
                            kycStatusObj = new kycStatus();
                            kycStatusObj.setApplicationForm(uploadStatusDetails[i].ApplicationForm)
                            kycStatusObj.setPhoto(uploadStatusDetails[i].Photo)
                            kycStatusObj.setMemID(uploadStatusDetails[i].MemID)
                            kycStatusObj.setMemAddress(uploadStatusDetails[i].MemAddress)
                            kycStatusObj.setGuarantorID(uploadStatusDetails[i].GuarantorID)
                            kycStatusObj.setGuarantorAddress(uploadStatusDetails[i].GuarantorAddress)
                            kycStatusObj.setOwnHouseReceipt(uploadStatusDetails[i].OwnHouseReceipt)
                            uploadStatusArray.push(kycStatusObj);
                        }
                    }
                    customlog.info(uploadStatusArray)
                    res.render('kycStatusDetails',{kycUploadStatus: uploadStatusArray, groupId: groupId, groupName: groupName, centerName: centerName, fieldOfficer: fieldOfficer, contextPath:props.contextPath});
                });
            }
        }catch(e){
            customlog.error("Exception while getKYCUploadStatus "+e);
            self.showErrorPage(req,res);
        }
    },*/

    /*moveForDataEntry: function(req, res) {
        try{
            customlog.info("moving to data entry");
            var self = this;
            var constantsObj = this.constants;
            if(typeof req.params.groupId == 'undefined'){
                res.redirect(props.contextPath+'/client/ci/login');
            } else {
                //var activityDetails = new Array(iklantPort, req.session.tenantId, req.session.userId, req.session.userName, req.originalUrl, req.connection.remoteAddress, "router.js", "moveForDataEntry", "success", "KYC Uploading Status", "moveForDataEntry");
                //self.commonRouter.insertActivityLogModel(activityDetails);
                var groupId = req.params.groupId;
                customlog.info("groupId: "+groupId);
                this.model.moveForDataEntryModel(groupId, function(queryStatus) {
                    customlog.info("queryStatus: "+queryStatus);
                    res.redirect(props.contextPath+'/client/ci/groups/operation/'+constantsObj.getKYCUploadStatusOperationId());
                });
            }
        }catch(e){
            customlog.error("Exception while moveForDataEntry "+e);
            self.showErrorPage(req,res);
        }
    },*/

	/*calcPreviewDateEMI: function(req, res) {
		try{
            var self = this;
            customlog.info("request received for EMI");
            var recurrenceDay = req.body.recurrenceDay;
            var disbursalDate = req.body.disbursalDate;
            var mifosCustomerId = req.body.mifosCustomerId;

            if(typeof req.session.tenantId == 'undefined' || typeof req.session.userId == 'undefined' || typeof recurrenceDay == 'undefined' || typeof disbursalDate == 'undefined') {
                res.redirect(props.contextPath+'/client/ci/login');
            }else {
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
                    path: "/mfi/api/account/loan/offering/loanproducts/disDate-"+convertToMifosDateFormat(disbursalDate)+"/recDay-"+recurrenceDay+"/cust-"+mifosCustomerId+".json",  //due-"+userId+"-"+officeId+".json",
                    method: 'GET',
                    headers : postheaders
                };
                customlog.info(options.path);
                rest.getJSON(options,function(statuscode,result,headers){
                    customlog.info("statuscode:"+statuscode);
                    customlog.info("result");
                    customlog.info(result);
                    if(statuscode == 302) {
                        res.redirect(props.contextPath+'/client/ci/logout');
                    }
                    else if(result.status == "success") {
                        customlog.info(result.firstInstallmentDate);
                        res.json(result);
                    } else {
                        var err = {};
                        err.status = 'failure'
                        err.message = 'Connection problem';
                        res.json(err);
                    }
                });
            }
        }catch(e){
            customlog.error("Exception while calcPreviewDateEMI "+e);
            self.showErrorPage(req,res);
        }
    },*/

    /*getGroupRecognitionTestDetails: function(req, res) {
        try{
            customlog.info("inside getGroupRecognitionTestDetails");
            var groupId = req.body.groupId;
            var centerName = req.body.centerName;
            var groupName = req.body.groupName;
            customlog.info("groupId: "+groupId);
            customlog.info("centerName: "+centerName);
            customlog.info("groupName: "+groupName);
            var self = this;
            var constantsObj = this.constants;
            if (typeof req.session.tenantId == 'undefined' || typeof req.session.userId == 'undefined') {
                res.redirect(props.contextPath+'/client/ci/login');
            } else {
                self.getGroupRecognitionTestDetailsCall(groupId,function(status,categoryId,categoryDesc,questionCategoryId,question,questionId,noOfClients) {
                    if(status == 'success') {
                        res.render('GRT',{categoryId: categoryId,categoryDesc: categoryDesc,
                            questionCategoryId: questionCategoryId,question: question,questionIdDetails: questionId,
                            groupId: groupId,centerName: centerName,groupName: groupName,noOfClients: noOfClients, contextPath:props.contextPath});
                    } else {
                        self.showErrorPage(req,res);
                    }

                });
            }
        }catch(e){
            customlog.error("Exception while getGroupRecognitionTestDetails "+e);
            self.showErrorPage(req,res);
        }
    },

    getGroupRecognitionTestDetailsCall: function(groupId,callback){
        this.model.getGroupRecognitionTestDetailsModel(groupId,callback);
    },*/

    /*submitRatingForGRT: function(req, res) {
        try{
            customlog.info('inside submitRatingForGRT');
            var questionIdDetails = req.body.questionIdDetails;
            var checkedOrNotDetails = req.body.checkedOrNotDetails
            var totalRating = req.body.totalRatingHidden;
            var groupId = req.body.groupId;
            var constantsObj = this.constants;
            var tenantId = req.session.tenantId;
            var userId = req.session.userId;
            var officeId = req.session.officeId;
            var roleId = req.session.roleId;
            var remarks = req.body.remarks;
            var statusMsg="";
            customlog.info(questionIdDetails);
            customlog.info(checkedOrNotDetails);
            customlog.info(totalRating);
            customlog.info(groupId);
            customlog.info(req.session.userId);

            var self = this;
            if (typeof req.session.tenantId == 'undefined' || typeof req.session.userId == 'undefined' || typeof totalRating == 'undefined') {
                res.redirect(props.contextPath+'/client/ci/login');
            } else {
                *//*questionIdDetails = questionIdDetails.split(',');
                checkedOrNotDetails = checkedOrNotDetails.split(',');*//*
                self.saveRatingForGRT(groupId,questionIdDetails,req.session.userId,checkedOrNotDetails,totalRating,remarks, function(status, isMoved) {
                    if(status == 'success') {
                        customlog.info('isMoved: '+isMoved);
                        if(isMoved == 1) {
                            customlog.info("Moved for Loan authorization");
                            statusMsg = "Group moved for Loan authorization";
                        } else {
                            customlog.error("Group Recognition Test Failed. please go for re-training.");
                            statusMsg = "Group Recognition Test Failed. please go for re-training.";
                        }
                        self.commonRouter.ListGroupsCall(tenantId,userId,officeId,roleId,constantsObj.getGroupRecognitionTestOperationId(),function(listGroupsIdArray,listGroupsArray,activeClients,neededInfo,isSynchronized,listGroupsGlobalNumberArray,fieldOfficerName,neededImageClarity,mifosCustomerId,isDataVerifiedArray,activeClientsPerStatus,dataEntryDate,error_msg_array,accountNumbers, loanCount){
                            self.commonRouter.showListGroupsOperations(req, res,constantsObj.getGroupRecognitionTestOperationId(),listGroupsIdArray,listGroupsArray,activeClients,neededInfo,isSynchronized,listGroupsGlobalNumberArray,fieldOfficerName,neededImageClarity,mifosCustomerId,isDataVerifiedArray,"",officeId,statusMsg,activeClientsPerStatus,dataEntryDate,error_msg_array,"",accountNumbers, loanCount);
                        });
                        customlog.info("success");
                    } else {
                        self.showErrorPage(req,res);
                    }
                });
            }
            //res.end();
        }catch(e){
                customlog.error("Exception while submitRatingForGRT "+e);
                self.showErrorPage(req,res);
        }
    },

    saveRatingForGRT: function(groupId,questionIdDetails,createdBy,checkedOrNotDetails,totalRating,remarks, callback) {
        this.model.saveRatingForGRTModel(groupId,questionIdDetails,createdBy,checkedOrNotDetails,totalRating,remarks, callback);
    },*/
	
	/*lrFSOTravellingPath : function(req,res){
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
                            res.render('PaymentVerification.jade',{personnelIdArray : req.session.personnelIdArray,personnelNameArray : req.session.personnelNameArray,officeId:req.session.officeId,personnelId : "0"});
                        }
                        else{
                            for(var i=0;i<result.loanOfficerList.length;i++){
                                personnelIdArray [i] = result.loanOfficerList[i].personnelId;
                                personnelNameArray[i] = result.loanOfficerList[i].displayName;
                            }
                            req.session.personnelIdArray = personnelIdArray;
                            req.session.personnelNameArray = personnelNameArray;
                            res.render('LRFSOTravellingPath.jade',{personnelIdArray : req.session.personnelIdArray,
                                personnelNameArray : req.session.personnelNameArray,officeId:req.session.officeId,personnelId : "0",
                                contextPath:props.contextPath});
                        }
                    } else {
                        self.showErrorPage(req,res);
                    }
                });
            }
            //res.render('LRFSOTravellingPath.jade');
        }catch(e){
            customlog.error("Exception while lrFSOTravellingPath "+e);
            self.showErrorPage(req,res);
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
        var CustomerDetailDto1 = require("../domain/CustomerDetailDto");
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
                        var LoanRepaymentForFO1 = require("../domain/LoanRepaymentForFO");
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
                    self.showErrorPage(req,res);
                }

             });
        }
        }catch(e){
            customlog.error("Exception while FSOTravellingPath "+e);
            self.showErrorPage(req,res);
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
*/
    /*// Added by Paramasivan
    getNewPassword : function(req,res) {
        try{
            var self = this;
            var randtoken = require('rand-token');
            var emailId = req.body.email;
            var newPassword = randtoken.generate(8);
            var rest = require("./rest.js");
            var cookie = new Array();
            var mifosCookie;
            self.commonDataModel.retrieveUserDetails(req.body.forgotUserName,emailId,function(status,userDetails){
                if(status == "success" && userDetails.length>0){
                    var userName = userDetails[0].user_name;
                    var oldPassword = decrypt(userDetails[0].password,userName);
                    var inpdata = JSON.stringify({
                        username : userName,
                        password : oldPassword});

                    var postHeaders = {
                        'Content-Type' : 'application/json',
                        'Content-Length' : Buffer.byteLength(inpdata, 'utf8')
                    };

                    var option = {
                        host: mifosServiceIP,
                        port: mifosPort,
                        path: '/mfi/j_spring_security_check?j_username='+userName+'&j_password='+oldPassword+'&spring-security-redirect=/sam/auth.json',
                        method: 'POST',
                        headers : postHeaders
                    };
                    rest.postJSON(option,inpdata,function(statuscode,result,headers) {
                        if(statuscode == 302) {
                            res.redirect(props.contextPath+'/client/ci/showErrorPage');
                        }
                        else if(result.status == "success"){
                            cookie = headers['set-cookie'];
                            var jsessionid = rest.get_cookies(cookie[0])['JSESSIONID'];

                            mifosCookie = "JSESSIONID="+jsessionid;

                            var userCredentials = JSON.stringify({
                                 username: userName,
                                 oldPassword: oldPassword,
                                 newPassword: newPassword
                            });
                            var postHeader = {
                                'Content-Type' : 'application/json',
                                'Content-Length' : Buffer.byteLength(userCredentials, 'utf8'),
                                'Cookie' : mifosCookie
                            };
                            var options = {
                                host: mifosServiceIP,
                                port: mifosPort,
                                path: "/mfi/api/user/update/password.json",
                                method: 'POST',
                                headers : postHeader
                            };
                            var encryptedNewPassword = encrypt(newPassword,userName);
                            self.commonDataModel.updateUserDetails(userDetails[0].user_id, userName, oldPassword, encryptedNewPassword,function(status){
                                if(status == 'success'){
                                    rest.postJSON(options,userCredentials,function(statuscode,result,headers){
                                        if(statuscode == 302) {
                                            res.redirect(props.contextPath+'/client/ci/showErrorPage');
                                        }
                                        else if(result.status == "success") {
                                            var subject = "Password Reset. Do not reply.";
                                            var text = "Your new password is "+ newPassword;
                                            var toAddress = userDetails[0].email_id;
                                            self.commonRouter.sendEmail(toAddress,props.emailSubject,props.emailText+""+newPassword,function(mailStatus){
                                                if(mailStatus){
                                                    var activityDetails = new Array(iklantPort,1, userDetails[0].user_id, userName, req.originalUrl, req.connection.remoteAddress, "router.js", "getNewPassword", "success", "forget password", "New Password of "+userName+" has been generated and mail has been sent","insert");
                                                    self.commonRouter.insertActivityLogModel(activityDetails);
                                                    res.render('login', { errorMessage: 'New password has been sent to your email ID', contextPath:props.contextPath});

                                                }else{

                                                    res.render('forgotPassword', { errorMessage: 'Reset password process failed', contextPath:props.contextPath});
                                                }
                                            });

                                        }else{
                                            res.render('forgotPassword', { errorMessage: 'Reset password process failed', contextPath:props.contextPath});
                                        }
                                    });
                                }
                                else{
                                    res.render('forgotPassword', { errorMessage: 'Invalid user credentials', contextPath:props.contextPath});
                                }
                            });
                        }
                        else{
                            res.render('forgotPassword', { errorMessage: 'Invalid user credentials', contextPath:props.contextPath});
                        }
                    });
                }else{
                    res.render('forgotPassword', { errorMessage: 'Invalid user credentials', contextPath:props.contextPath});
                }
            });
        }
        catch(e){
            customlog.error("Exception while loading getNewPassword " + e);
            res.redirect(props.contextPath + '/client/ci/showErrorPage');
        }
    },
*/    /*//Added by SathishKumar 008 for change password
    loadChangePassword : function(req,res){
        try{
            var self = this;
            if(typeof (req.session.tenantId) == 'undefined' || typeof (req.session.userId) == 'undefined') {
                res.redirect(props.contextPath + '/client/ci/showErrorPage');
            }else{
                var pwdChange=1;
                res.render('changePassword',{contextPath:props.contextPath,userId:req.session.userId,userName:req.session.userName,errorMessage : "",passwordChanged:pwdChange});
            }
        }catch(e){
            customlog.error("Exception while Load Change password "+e);
            self.showErrorPage(req,res);
        }
    },

    submitChangePassword : function(req,res){
        try{
            var constantsObj = this.constants;
            var cookie;
            var self = this;
            var errorMessage = "";
            if(typeof (req.session.tenantId) == 'undefined' || typeof (req.session.userId) == 'undefined') {
                self.showErrorPage(req,res);
            }else{
                var tenantId = req.session.tenantId;
                var userId = req.session.userId;
                var userName = (typeof req.body.userName == 'undefined')?"":req.body.userName;
                var oldPassword = req.body.oldPassword;
                var newPassword = req.body.confirmPassword;
                var pwdChange=1;
                var encrptedOldPassword = encrypt(oldPassword,userName);
                self.commonDataModel.validateOldPassword(userId,encrptedOldPassword,function(oldPasswordStatus){
                    if(oldPasswordStatus == 'old password success'){
                        if(req.session.roleId == constantsObj.getDEOroleId()){
                            self.generateMifosSession(userName,oldPassword,function(mifosCookie){
                                cookie = mifosCookie;
                                customlog.info("Cookie:"+cookie);
                                if(typeof cookie == "") {
                                    self.showErrorPage(req,res);
                                }else{
                                    self.updateNewPassword(userId,userName,oldPassword,newPassword,cookie,function(status){
                                        if(status == 'success'){
                                            errorMessage = "Password Updated Successfully";
                                            req.session.passwordChanged = pwdChange;
                                            var activityDetails = new Array(iklantPort, req.session.tenantId, req.session.userId, req.session.userName, req.originalUrl, req.connection.remoteAddress, "router.js", "submitChangePassword", "success", "Change Old Password", "Password of "+userName+" has been changed successfully","update");
                                            self.commonRouter.insertActivityLogModel(activityDetails);
                                            res.render('changePassword',{contextPath:props.contextPath,userId:req.session.userId,userName:req.session.userName, errorMessage : errorMessage,passwordChanged:pwdChange});

                                        }
                                        else if(status == 'failure'){
                                            errorMessage = "Error occurred while updating new password";
                                            res.render('changePassword',{contextPath:props.contextPath,userId:req.session.userId,userName:req.session.userName, errorMessage : errorMessage,passwordChanged:pwdChange});
                                            var activityDetails = new Array(iklantPort, req.session.tenantId, req.session.userId, req.session.userName, req.originalUrl, req.connection.remoteAddress, "router.js", "submitChangePassword", "failure", "Change Old Password", "Error occurred while updating new password. Password of "+userName+" has been tried change" ,"update");
                                            self.commonRouter.insertActivityLogModel(activityDetails);
                                        }
                                        else{
                                            self.showErrorPage(req,res);
                                        }

                                    });
                                }
                            })
                        }
                        else{
                            cookie = req.session.mifosCookie;
                            customlog.info("Cookie:"+cookie);
                            if(typeof cookie == 'undefined') {
                                self.showErrorPage(req,res);
                            }else{
                                self.updateNewPassword(userId,userName,oldPassword,newPassword,cookie,function(status){
                                    if(status == 'success'){
                                        errorMessage = "Password Updated Successfully";
                                        req.session.passwordChanged = pwdChange;
                                        var activityDetails = new Array(iklantPort, req.session.tenantId, req.session.userId, req.session.userName, req.originalUrl, req.connection.remoteAddress, "router.js", "submitChangePassword", "success", "Change Old Password", "Password of "+userName+" has been changed successfully" ,"update");
                                        self.commonRouter.insertActivityLogModel(activityDetails);
                                        res.render('changePassword',{contextPath:props.contextPath,userId:req.session.userId,userName:req.session.userName, errorMessage : errorMessage,passwordChanged:pwdChange});

                                    }
                                    else if(status == 'failure'){
                                        errorMessage = "Error occurred while updating new password";
                                        var activityDetails = new Array(iklantPort, req.session.tenantId, req.session.userId, req.session.userName, req.originalUrl, req.connection.remoteAddress, "router.js", "submitChangePassword", "failure", "Change Old Password", "Error occurred while updating new password. Password of "+userName+" has been tried change ","update");
                                        self.commonRouter.insertActivityLogModel(activityDetails);
                                        res.render('changePassword',{contextPath:props.contextPath,userId:req.session.userId,userName:req.session.userName, errorMessage : errorMessage,passwordChanged:pwdChange});
                                    }
                                    else{
                                        self.showErrorPage(req,res);
                                    }
                                });
                            }
                        }
                    }else if(oldPasswordStatus == 'old password failure'){
                        errorMessage = "Invalid old password";
                        res.render('changePassword',{contextPath:props.contextPath,userId:req.session.userId,userName:req.session.userName, errorMessage : errorMessage,passwordChanged:pwdChange});
                    }else{
                        errorMessage = "Error in validating old password";
                        res.render('changePassword',{contextPath:props.contextPath,userId:req.session.userId,userName:req.session.userName, errorMessage : errorMessage,passwordChanged:pwdChange});
                    }
                });
            }
        }catch(e){
            customlog.error("Exception while Load Change password "+e);
            self.showErrorPage(req,res);
        }
    },

    updateNewPassword : function(userId,userName,oldPassword,newPassword,cookie,callback){
        var self = this;
        var encyptedOldPassword =  encrypt(oldPassword,userName);
        var encyptedNewPassword =  encrypt(newPassword,userName);
        self.model.changePasswordCall(userId,userName,encyptedOldPassword,encyptedNewPassword, function(status){
            if(status == 'success'){
                var rest = require("./rest.js");
                var http = require('http');
                var https = require('https');
                customlog.info("Cookie:"+cookie);
                if(typeof cookie == 'undefined') {
                    callback('error');
                }
                else {
                    var userCredentials = JSON.stringify({
                        username: userName,
                        oldPassword: oldPassword,
                        newPassword: newPassword
                    });
                    var postHeader = {
                        'Content-Type' : 'application/json',
                        'Content-Length' : Buffer.byteLength(userCredentials, 'utf8'),
                        'Cookie' : cookie
                    };
                    var options = {
                        host: mifosServiceIP,
                        port: mifosPort,
                        path: "/mfi/api/user/update/password.json",
                        method: 'POST',
                        headers : postHeader
                    };
                    rest.postJSON(options,userCredentials,function(statuscode,result,headers){
                        customlog.info("statuscode" + statuscode);
                        if(statuscode == 302){
                            callback('error');
                        }
                        else{
                            if(result.status == 'success'){
                                //errorMessage = "Password Updated Successfully";
                                callback('success');
                                //res.render('changePassword',{contextPath:props.contextPath,userId:req.session.userId,userName:req.session.userName, errorMessage : errorMessage});
                            }else{
                                //errorMessage = "Error occurred while updating new password";
                                callback('failure');
                                //res.render('changePassword',{contextPath:props.contextPath,userId:req.session.userId,userName:req.session.userName, errorMessage : errorMessage});
                            }
                        }
                    });
                }
            }
            else{
                callback('failure');
            }
        });
    },

    generateMifosSession : function(userName,password,callback){
        var rest = require("./rest.js");
        var http = require('http');
        var https = require('https');
        var cookie = "";
        var inpdata = JSON.stringify({
            username : userName,
            password : password});

        var postHeaders = {
            'Content-Type' : 'application/json',
            'Content-Length' : Buffer.byteLength(inpdata, 'utf8')
        };

        var option = {
            host: mifosServiceIP,
            port: mifosPort,
            path: '/mfi/j_spring_security_check?j_username='+userName+'&j_password='+password+'&spring-security-redirect=/sam/auth.json',
            method: 'POST',
            headers : postHeaders
        };
        rest.postJSON(option,inpdata,function(statuscode,result,headers) {
            if(statuscode == 302) {
                callback(cookie);
            }
            else if(result.status == "success"){
                cookie = headers['set-cookie'];
                var jsessionid = rest.get_cookies(cookie[0])['JSESSIONID'];

                cookie = "JSESSIONID="+jsessionid;
                callback(cookie)
            }

        });
    },

    loadForgotPassword : function(req,res){
        try{
            var self = this;
            res.render('forgotPassword',{contextPath:props.contextPath,errorMessage : ""});
        }catch(e){
            customlog.error("Exception while Load Change password "+e);
            self.showErrorPage(req,res);
        }
    },

    loadUserNameChange: function(req,res){
        var self = this;
        res.render("ChangeUsername",{contextPath:props.contextPath,errorMessage : ""});
    },
    generatePassword : function(req,res){
        var self = this;
        var newUserName = req.body.newUserName;
        var userName = req.body.userName;
        self.commonDataModel.encryptUserDetails(userName,function(status,userDetails){
            //console.log("Encrypted = "+encrypt('sbcbm123','sbcbm'));
            if(userDetails.length == 1 ){
                var decryptedPassword = decrypt(userDetails[0].password,userName);
                var encrptedpassword = encrypt(decryptedPassword,newUserName);
                console.log('UPDATE iklant_users SET `password` = "'+encrptedpassword+'" WHERE user_id ='+userDetails[0].user_id+';');
                self.commonDataModel.updateCustomUserDetails(userDetails[0].user_id,newUserName,encrptedpassword,function(status){
                       if(status == 'success'){
                           res.render("ChangeUsername",{contextPath:props.contextPath,errorMessage : "Succesfully changed"});
                       }
                       else{
                            res.render("ChangeUsername",{contextPath:props.contextPath,errorMessage : "Updated failed"});
                       }
                });
                //console.log(decrypt(userDetails[i].password,userDetails[i].user_name));
               *//* if(userDetails[i].password_backup == decrypt(userDetails[i].password,userDetails[i].user_name)){

                }else{
                    console.log("failure...........");
                }*//*
            }
            else{
                res.render("ChangeUsername",{contextPath:props.contextPath,errorMessage : "Username not found."});
            }
        });
    },*/

    /*nextLoanPreCheckDetails : function(req,res){
        try{
            var self = this;
            var customerId = req.body.customerId;
            var accountNo = req.body.accountNo;
            var iklantGroupId = req.body.groupId;
            var currentLoanCount = req.body.currentLoanCount;
            var clientCount = req.body.clientCount;

            var postHeaders = {
                'Content-Type' : 'application/json',
                'Cookie' : req.session.mifosCookie
            };
            var options = {
                host: mifosServiceIP,
                port: mifosPort,
                path: "/mfi/api/groups/nextLoanPreCheckDetails-"+customerId+"-"+accountNo+".json",
                method: 'GET',
                headers : postHeaders
            };
            var rest = require("./rest.js");
            rest.getJSON(options,function(statuscode,result,headers){
                if(result.status == 'success') {
                    self.commonRouter.getPersonnelDetailsCall(req.session.officeId,req.session.userId,function(personnelIdArray,personnelNameArray) {
                        res.render("NextLoanPreCheckApproval", {
                            groupDetails: result.groupAccountDetails,
                            clientDetails: result.clientAccountDetails,
                            clientRepaymentTrack: result.repaymentTrackRecord,
                            contextPath: props.contextPath,
                            iklantGroupId: iklantGroupId,
                            clientLucDetails: result.clientLucDetails,
                            mifosAccountNo: accountNo,
                            currentLoanCount: currentLoanCount,
                            clientCount: clientCount,
                            personnelIdArray: personnelIdArray,
                            personnelNameArray: personnelNameArray,
                            rejectedClients: result.rejectedClients,
                            loanOfficerId:''
                        });
                    });
                }
                else{
                    customlog.error("Fails while retrieving nextLoanPreCheckDetails in mifos");
                    self.commonRouter.showErrorPage(req,res);
                }
            });
        }catch(e){
            customlog.error("Exception while Load nextLoanPreCheckDetails "+e);
            self.commonRouter.showErrorPage(req,res);
        }
    },*/

    /*approveOrRejectClientForNextLoan : function(iklantGroupId,userId, callBack){
        this.model.approveOrRejectClientForNextLoanCallModel(iklantGroupId,userId,callBack);
    },*/

    /*approveOrRejectCustomerForNextLoan: function (req, res) {
        try {
            var self = this;
            var constantsObj = this.constants;
            var customerLevel = req.body.customerLevel;
            var nextLoanHolderObj = require(domainPath +"/nextLoan");
            var nextLoanHolder = new nextLoanHolderObj();
            var clientCount = parseInt(req.body.clientCount);
            var iklantGroupId = (req.body.iklantGroupId == 'null')?null:parseInt(req.body.iklantGroupId);
            var iklantClientId = (req.body.iklantClientId == "")?null:parseInt(req.body.iklantClientId);
            if(customerLevel == constantsObj.getClientLevel()){
                nextLoanHolder.setCustomerId(parseInt(req.body.mifosCustomerId));
                nextLoanHolder.setMifosParentCustomerId(parseInt(req.body.mifosParentCustomerId));
            }
            else{
                nextLoanHolder.setCustomerId(parseInt(req.body.mifosParentCustomerId));
                nextLoanHolder.setMifosParentCustomerId(0);
            }
            nextLoanHolder.setIklantGroupId(iklantGroupId);
            nextLoanHolder.setGroupCurrentLoanCount(parseInt(req.body.groupCurrentLoanCount));
            nextLoanHolder.setClientCurrentLoanCount(parseInt(req.body.clientCurrentLoanCount));
            nextLoanHolder.setUpdatedBy(req.session.userId);
            nextLoanHolder.setApproveRejectFlag(parseInt(req.body.flag));
            nextLoanHolder.setAccountNo(parseInt(req.body.mifosAccountNo));
            nextLoanHolder.setClientAccountNo(parseInt(req.body.mifosClientAccountNo));
            nextLoanHolder.setIklantClientId(iklantClientId);
            nextLoanHolder.setOfficeId(req.session.officeId);
            nextLoanHolder.setTenantId(req.session.tenantId);
            nextLoanHolder.setGroupName(req.body.groupName);
            nextLoanHolder.setClientFirstName(req.body.clientFirstName);
            nextLoanHolder.setClientLastName(req.body.clientLastName);
            nextLoanHolder.setTotalClients(clientCount);
            nextLoanHolder.setLoanOfficerId(parseInt(req.body.loanOfficer));
            nextLoanHolder.setRemarksForRejection(req.body.remarks);

            var inputData =  JSON.stringify(nextLoanHolder);
            var serviceUrl = (customerLevel == constantsObj.getClientLevel()) ? "/mfi/api/groups/approveOrRejectClientForNextLoan.json" : "/mfi/api/groups/approveOrRejectGroupForNextLoan.json"
             var postHeaders = {
                'Content-Type': 'application/json',
                'Content-Length' : Buffer.byteLength(inputData, 'utf8'),
                'Cookie': req.session.mifosCookie
            };
            var options = {
                host: mifosServiceIP,
                port: mifosPort,
                path: serviceUrl,
                method: 'POST',
                headers: postHeaders
            };
            var rest = require("./rest.js");
            rest.postJSON(options, inputData, function (statuscode, result, headers) {
                if (result.status == 'success') {
                    var activityDetails;
                    if(customerLevel == constantsObj.getGroupLevel() && nextLoanHolder.getApproveRejectFlag()){
                        self.approveOrRejectClientForNextLoan(iklantGroupId,req.session.userId,function(status){
                            // Activity log for different cases
                            if(iklantGroupId != null)
                                activityDetails = new Array(iklantPort, req.session.tenantId, req.session.userId, req.session.userName, req.originalUrl, req.connection.remoteAddress, "router.js", "approveOrRejectCustomerForNextLoan", "success", "Next loan pre check", iklantGroupId+" - "+ nextLoanHolder.getGroupName()+" successfully moved for KYC uploading while next loan pre check","update");
                            else
                                activityDetails = new Array(iklantPort, req.session.tenantId, req.session.userId, req.session.userName, req.originalUrl, req.connection.remoteAddress, "router.js", "approveOrRejectCustomerForNextLoan", "success", "Next loan pre check", nextLoanHolder.getCustomerId()+" (mifos group id) - "+ nextLoanHolder.getGroupName()+" successfully moved for KYC uploading while next loan pre check","insert");
                            self.commonRouter.insertActivityLogModel(activityDetails);

                            req.body.statusMessage = "Group approved successfully & moved for KYC uploading"
                            req.params.operationId = constantsObj.getNextLoanPreCheckOperationId();
                            self.commonRouter.listGroupsOperation(req,res);
                        });
                    }
                    else if(customerLevel == constantsObj.getClientLevel()){

                        // Activity log for different cases - group level
                        if((clientCount-1) == result.clientAccountDetails.length){
                            activityDetails = new Array(iklantPort, req.session.tenantId, req.session.userId, req.session.userName, req.originalUrl, req.connection.remoteAddress, "router.js", "approveOrRejectCustomerForNextLoan", "success", "Next loan pre check", result.groupAccountDetails[0].iklantGroupId+" - "+ nextLoanHolder.getGroupName()+" : First client in this group approved/rejected while next loan pre check","update");
                            self.commonRouter.insertActivityLogModel(activityDetails);
                        }else if((clientCount - result.clientAccountDetails.length) == 0 && (clientCount - result.rejectedClients) >= 5){
                            activityDetails = new Array(iklantPort, req.session.tenantId, req.session.userId, req.session.userName, req.originalUrl, req.connection.remoteAddress, "router.js", "approveOrRejectCustomerForNextLoan", "success", "Next loan pre check", iklantGroupId+" - "+ nextLoanHolder.getGroupName()+" successfully moved for KYC uploading while next loan pre check","update");
                            self.commonRouter.insertActivityLogModel(activityDetails);
                        }
                        else if((clientCount - result.rejectedClients) < 5){
                            activityDetails = new Array(iklantPort, req.session.tenantId, req.session.userId, req.session.userName, req.originalUrl, req.connection.remoteAddress, "router.js", "approveOrRejectCustomerForNextLoan", "success", "Next loan pre check", iklantGroupId+" - "+ nextLoanHolder.getGroupName()+" & its remaining clients rejected due to active clients less than 5, while next loan pre check","update");
                            self.commonRouter.insertActivityLogModel(activityDetails);
                        }

                        // Activity log for different cases - client level
                        if(iklantClientId != null && nextLoanHolder.getApproveRejectFlag()) {
                            activityDetails = new Array(iklantPort, req.session.tenantId, req.session.userId, req.session.userName, req.originalUrl, req.connection.remoteAddress, "router.js", "approveOrRejectCustomerForNextLoan", "success", "Next loan pre check", iklantGroupId + " - " + nextLoanHolder.getGroupName() + " : " + iklantClientId + " - " + nextLoanHolder.getClientFirstName() + " " + nextLoanHolder.getClientLastName() + " successfully moved for KYC uploading while next loan pre check", "update");
                        }else if(iklantClientId != null && !nextLoanHolder.getApproveRejectFlag()) {
                            activityDetails = new Array(iklantPort, req.session.tenantId, req.session.userId, req.session.userName, req.originalUrl, req.connection.remoteAddress, "router.js", "approveOrRejectCustomerForNextLoan", "success", "Next loan pre check", iklantGroupId + " - " + nextLoanHolder.getGroupName() + " : " + iklantClientId + " - " + nextLoanHolder.getClientFirstName() + " " + nextLoanHolder.getClientLastName() + " rejected while next loan pre check", "update");
                        }else if(iklantClientId == null && nextLoanHolder.getApproveRejectFlag()) {
                            activityDetails = new Array(iklantPort, req.session.tenantId, req.session.userId, req.session.userName, req.originalUrl, req.connection.remoteAddress, "router.js", "approveOrRejectCustomerForNextLoan", "success", "Next loan pre check", result.groupAccountDetails[0].iklantGroupId + " - " + nextLoanHolder.getGroupName() + " : " + req.body.mifosCustomerId + " (mifos client id) - " + nextLoanHolder.getClientFirstName() + " " + nextLoanHolder.getClientLastName() + " moved for KYC uploading while next loan pre check", "insert");
                        }else {
                            activityDetails = new Array(iklantPort, req.session.tenantId, req.session.userId, req.session.userName, req.originalUrl, req.connection.remoteAddress, "router.js", "approveOrRejectCustomerForNextLoan", "success", "Next loan pre check", result.groupAccountDetails[0].iklantGroupId + " - " + nextLoanHolder.getGroupName() + " : " + req.body.mifosCustomerId + "  (mifos client id) - " + nextLoanHolder.getClientFirstName() + " " + nextLoanHolder.getClientLastName() + " rejected while next loan pre check", "insert");
                        }
                        self.commonRouter.insertActivityLogModel(activityDetails);

                        req.body.groupDetails = result.groupAccountDetails;
                        req.body.clientDetails = (result.clientAccountDetails.length>0)?result.clientAccountDetails:new Array();
                        req.body.clientRepaymentTrack = result.repaymentTrackRecord;
                        req.body.clientLucDetails = result.clientLucDetails;
                        req.body.rejectedClients = result.rejectedClients;
                        req.body.loanOfficerId = nextLoanHolder.getLoanOfficerId();
                        res.send(req.body);
                    }
                    else{
                        // Activity log for different cases
                        if(iklantGroupId != null)
                            activityDetails = new Array(iklantPort, req.session.tenantId, req.session.userId, req.session.userName, req.originalUrl, req.connection.remoteAddress, "router.js", "approveOrRejectCustomerForNextLoan", "success", "Next loan pre check", iklantGroupId+" - "+ nextLoanHolder.getGroupName()+" rejected while next loan pre check","update");
                        else
                            activityDetails = new Array(iklantPort, req.session.tenantId, req.session.userId, req.session.userName, req.originalUrl, req.connection.remoteAddress, "router.js", "approveOrRejectCustomerForNextLoan", "success", "Next loan pre check", nextLoanHolder.getCustomerId()+" (mifos group id) - "+ nextLoanHolder.getGroupName()+" rejected while next loan pre check","insert");
                        self.commonRouter.insertActivityLogModel(activityDetails);

                        req.body.status = result.status;
                        res.send(req.body);
                    }
                }
                else {
                    customlog.error("Fails while retrieving approveOrRejectClientForNextLoan in mifos");
                    self.commonRouter.showErrorPage(req, res);
                }
            });
        } catch (e) {
            customlog.error("Exception while Load approveOrRejectClientForNextLoan " + e);
            self.commonRouter.showErrorPage(req, res);
        }
	 },*/
	 
    /*loadRescheduledGroups : function(req,res){
        var self = this;
        var constantsObj = this.constants;
        var tenantId = req.session.tenantId;
        var userId = req.session.userId;
        var roleId = req.session.roleId;
        var officeId = req.session.officeId;
        self.model.loadRescheduledGroupsModel(officeId,userId, function(results){
            res.render('serachRescheduledResult',{searchResult : results, errorLabel : "",roleId : req.session.roleId,constantsObj : constantsObj});
        });

    },
    retrieveRescheduledLoanAccounts : function(req,res){
        var self = this;
        var constantsObj = this.constants;
        var tenantId = req.session.tenantId;
        var userId = req.session.userId;
        var roleId = req.session.roleId;
        var officeId = req.session.officeId;
        var groupAccNum = req.body.groupAccNum;
        self.model.retrieveRescheduledGroupsModel(officeId,userId,groupAccNum, function(results){
            res.render('rescheduledLoan',{searchResult : results, errorLabel : "",roleId : req.session.roleId,constantsObj : constantsObj});
        });
    },

    updateRescheduledLoanAccount : function(req,res){
        var self = this;
        try{

            var inputData = JSON.stringify({
                groupGlobalAccountNum : req.body.groupAccNum,
                clientGloablAccountNum : req.body.clientGlobalNumArray.toString(),
                lastPaymentDate : req.body.lastPaymentArray.toString(),
                currentBalance : req.body.currentBalanceArray.toString(),
                paidAmount : req.body.paidAmountArray.toString(),
                amountOverdue : req.body.amountOverdueArray.toString(),
                daysInArrear : req.body.daysInArrearsArray.toString(),
                loanStatus : req.body.loanStatusArray.toString()
            });
            console.log(inputData);
            var serviceUrl = "/mfi/api/report/rescheduled/data/update.json";
            var postHeaders = {
                'Content-Type': 'application/json',
                'Content-Length': Buffer.byteLength(inputData, 'utf8'),
                'Cookie': req.session.mifosCookie
            };
            var options = {
                host: mifosServiceIP,
                port: mifosPort,
                path: serviceUrl,
                method: 'POST',
                headers: postHeaders
            };
            var rest = require("./rest.js");
            rest.postJSON(options, inputData, function (statuscode, result, headers) {
                if (result.status == 'success') {
                    self.retrieveRescheduledLoanAccounts(req,res);
                }
                else {
                    customlog.error("Fails while retrieving approveOrRejectClientForNextLoan in mifos");
                    self.showErrorPage(req, res);
                }
            });
        } catch (e) {
            customlog.error("Exception while Load approveOrRejectClientForNextLoan " + e);
            self.showErrorPage(req, res);
        }
    }
*/

    /*retrieveIdleClients : function(req,res){
        var self = this;
        try{
            var groupId = req.params.groupId;
            var statusId = req.body.statusId;
            var tenantId = req.session.tenantId;
            var clientId = 0,clientTotalWeightageRequired = 0,errorField = "",fileLocation = "", docId = "";
            self.commonRouter.retrieveIdleClientsCall(tenantId, groupId, statusId, function(groupId,unAppraisedClients,appraisedClientsObj,countOfRejectedClients,isIdle, noOfIdleDays, lastCreditCheckDate){
                self.commonRouter.showIdleClientsSummary(res,groupId,unAppraisedClients,appraisedClientsObj,countOfRejectedClients,clientId,clientTotalWeightageRequired,errorField,fileLocation,docId, isIdle, noOfIdleDays, lastCreditCheckDate, statusId);
            });

        } catch (e) {
            customlog.error("Exception while Load retrieveIdleGroups " + e);
            self.commonRouter.showErrorPage(req, res);
        }
    },*/

    /*rejectIdleClients : function(req,res){
        var self = this;
        try{
            var clientId = req.body.rejectedClient;
            var rejectedClientName = req.body.rejectedClientName;
            var statusId = req.body.statusId;
            var groupId = req.body.groupnamefordownload;
            var statusMessage = '';
            self.rejectIdleClientsCall(clientId, function(status){
                if(status == "success") {
                    statusMessage = rejectedClientName+" rejected successfully";
                    var activityDetails = new Array(iklantPort, req.session.tenantId, req.session.userId, req.session.userName, req.originalUrl, req.connection.remoteAddress, "router.js", "approveIdleGroup", "success", "Manage Idle Groups", statusMessage+" from Idle stage","insert");
                    self.commonRouter.insertActivityLogModel(activityDetails);
                    self.commonRouter.retrieveIdleClientsCall(req.session.tenantId, groupId, statusId, function (groupId, unAppraisedClients, appraisedClientsObj, countOfRejectedClients, isIdle, noOfIdleDays, lastCreditCheckDate) {
                        self.commonRouter.showIdleClientsSummary(res, groupId, unAppraisedClients, appraisedClientsObj, countOfRejectedClients, clientId, 0, statusMessage, "", "", isIdle, noOfIdleDays, lastCreditCheckDate, statusId);
                    });
                }
                else{
                    customlog.error("Idle client rejection failed");
                    self.showErrorPage(req, res);
                }
            });

        } catch (e) {
            customlog.error("Exception while Load rejectIdleClients " + e);
            self.showErrorPage(req, res);
        }
    },*/

   /* rejectIdleClientsCall : function(clientId, callback){
        this.model.rejectIdleClientsModel(clientId, callback)
    },*/

    /*rejectIdleGroup : function(req,res){
        var self = this;
        try{
            var groupId = req.body.groupId;
            self.rejectIdleGroupCall(groupId, function(status){
                if(status == 'success'){
                    var activityDetails = new Array(iklantPort, req.session.tenantId, req.session.userId, req.session.userName, req.originalUrl, req.connection.remoteAddress, "router.js", "approveIdleGroup", "success", "Idle Groups", groupId+" successfully rejected from Idle stage and moved to rejected while Idle stage","insert");
                    self.commonRouter.insertActivityLogModel(activityDetails);
                }
                req.body.status = status;
                res.send(req.body);
            });

        } catch (e) {
            customlog.error("Exception while Load rejectIdleGroup " + e);
            req.body.status = "failure";
            res.send(req.body);
        }
    },

    rejectIdleGroupCall : function(groupId, callback){
        this.model.rejectIdleGroupModel(groupId, callback)
    },
*/
    /*approveIdleGroup : function(req,res){
        var self = this;
        try{
            var groupId = req.body.groupId;
            var statusId = req.body.statusId;
            self.approveIdleGroupCall(groupId, statusId, function(status){
                if(status == 'success'){
                    var activityDetails = new Array(iklantPort, req.session.tenantId, req.session.userId, req.session.userName, req.originalUrl, req.connection.remoteAddress, "router.js", "approveIdleGroup", "success", "Manage Idle Groups", groupId+" successfully approved from Idle stage and moved for CBA","insert");
                    self.commonRouter.insertActivityLogModel(activityDetails);
                }
                req.body.status = status;
                res.send(req.body);
            });

        } catch (e) {
            customlog.error("Exception while Load rejectIdleGroup " + e);
            req.body.status = "failure";
            res.send(req.body);
        }
    },

    approveIdleGroupCall : function(groupId, statusId, callback){
        this.model.approveIdleGroupModel(groupId, statusId, callback)
    }*/
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

/*
function encrypt(text,password){
    var cipher = crypto.createCipher('aes-256-ctr',password)
    var crypted = cipher.update(text,'utf8','hex')
    crypted += cipher.final('hex');
    return crypted;
}
*/

function decrypt(text,password){
    var decipher = crypto.createDecipher('aes-256-ctr',password)
    var dec = decipher.update(text,'hex','utf8')
    dec += decipher.final('utf8');
    return dec;
}
