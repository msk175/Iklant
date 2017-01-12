var path = require('path');
var props = require(path.dirname(process.mainModule.filename)+"/"+"properties.json");
var rootPath = path.dirname(process.mainModule.filename);
var domainPath = path.join(__dirname, '..','domain');
var fs = require('fs');
var customlog = require(path.join(rootPath,"logger/loggerConfig.js"))('reports: routerReports.js');
mifosServiceIP = props.mifosServiceIp;
mifosPort = props.mifosPort;
var nodeExcel = require('excel-export-impr');

function routerReports(dataModelReports,commonDataModel) {
    customlog.debug("creating the reports router");
    this.datamodelReports = dataModelReports;
    this.commonDataModel = commonDataModel;

    var constantsRequire = require(path.join(rootPath,"app_modules/dto/common/Constants"));
    var constants = new constantsRequire();
    this.constants = constants;

    /*var dataModelObj = require(rootPath +"/app_modules/client_management/customer_identification/model/datamodel").datamodel;
    var dataModelOld = new dataModelObj();
    this.dataModel = dataModelOld;*/

    var reportQuery = require(rootPath+"/app_modules/reports/reportQueries/reportQueries.js");
    var reportQueryObj = new reportQuery();
    this.reportQueryObj = reportQueryObj;
}

routerReports.prototype = {

    loadReportsMenu: function (req, res) {
        try {
            var constObj = this.constants;
            var tenantId = req.session.tenantId;
            var userId = req.session.userId;
            var roleId = req.session.roleId;
            var roleIds = req.session.roleIds;
            if (typeof tenantId == 'undefined' || typeof userId == 'undefined') {
                res.redirect(props.contextPath + '/client/ci/showErrorPage');
            }
            else {
                res.render('reports/reportsCategory', {roleId: roleId, constObj: constObj, contextPath: props.contextPath, title: 'Reports Management',roleIds:roleIds});
            }
        } catch (e) {
            customlog.error("Exception while loading loadReportsMenu " + e);
            res.redirect(props.contextPath + '/client/ci/showErrorPage');
        }
    },

    loadReportsByCategory: function (req, res) {
        try {
            var self = this;
            var constObj = this.constants;
            var tenantId = req.session.tenantId;
            var userId = req.session.userId;
            var roleId = req.session.roleId;
            var category = req.params.categoryId;
            if (typeof tenantId == 'undefined' || typeof userId == 'undefined') {
                res.redirect(props.contextPath + '/client/ci/showErrorPage');
            }
            else {
                self.datamodelReports.loadReportsDataModel(category, roleId, function (status, reportId, reportName,storedProcedureName) {
                    if (status == 'success') {
                        res.render('reports/listReports', {roleId: roleId, constantsObj: constObj, contextPath: props.contextPath, title: 'Reports Management',
                            categoryId: category, reportId: reportId, reportName: reportName,storedProcedureName:storedProcedureName});
                    }
                    else {
                        res.redirect(props.contextPath + '/client/ci/showErrorPage');
                    }
                });
            }
        } catch (e) {
            customlog.error("Exception while loading loadReportsByCategory " + e);
            res.redirect(props.contextPath + '/client/ci/showErrorPage');
        }
    },

    loadReport: function (req, res) {
        try {
            var self = this;
            var constObj = this.constants;
            var tenantId = req.session.tenantId;
            var userId = req.session.userId;
            var roleId = req.session.roleId;
            var reportId = req.params.reportId;
            var category = req.params.categoryId;
            var reportName = req.params.reportName;
            var spname = req.params.spname;
            var ledgerValue;

            if(reportId == constObj.getBankReconciliationReportId()){
                ledgerValue = "Bank";
            }
            else{
                ledgerValue = "ALL";
            }
            var officeId = (roleId == constObj.getSMHroleId() || roleId == constObj.getAMHroleId()) ? -1 : req.session.officeId;
            if (typeof tenantId == 'undefined' || typeof userId == 'undefined') {
                res.redirect(props.contextPath + '/client/ci/showErrorPage');
            }
            else {
                self.datamodelReports.loadReportByIdDataModel(reportId, function (status,generationType, reportFilterId, reportFilterValue) {
                    self.commonDataModel.retriveOfficeDatamodel(tenantId, userId, function (officeIdArray, officeNameArray) {
                        self.commonDataModel.getPersonnelDetailsDataModel(officeId, userId, function (personnelIdArray, personnelNameArray) {
                            self.reportManagementDataModel.retrieveLoanProductAndCategoryDatamodel(tenantId, function (prdOfferingIdArray, prdOfferingNameArray, prdCategoryIdArray, prdCategoryNameArray) {
                                self.reportManagementDataModel.retrieveLedgerDetailsDataModel(tenantId,officeId,ledgerValue,userId, function (ledger_name_array,gl_code_value_array) {
                                    self.reportManagementDataModel.retrieveStatusDataModel(reportId,function(stateId,stateName){
                                        self.reportManagementDataModel.retrieveFundDetailDataModel(reportId,function(fundIds, fundNames){
                                            if (status == 'success') {
                                                res.render('reports/reportView', {roleId: roleId, constantsObj: constObj, contextPath: props.contextPath, title: 'Reports Management',
                                                    categoryId: category, reportFilterId: reportFilterId, reportFilterValue: reportFilterValue, reportName: reportName,
                                                    fromDate: '', toDate: '', officeId: officeId, customerName: '', accountNo: '', fieldOfficerId: '', productTypeId: '',ledgerValue:"",
                                                    productCategoryId: '', officeIdArray: officeIdArray, officeNameArray: officeNameArray, personnelIdArray: personnelIdArray,
                                                    personnelNameArray: personnelNameArray, prdOfferingIdArray: prdOfferingIdArray, prdOfferingNameArray: prdOfferingNameArray,
                                                    prdCategoryIdArray: prdCategoryIdArray, prdCategoryNameArray: prdCategoryNameArray, result:0, reportId: reportId,fileSize:0,filePath:"",
                                                    ledger_name_array:ledger_name_array,gl_code_value_array:gl_code_value_array,spname:spname,npaIndicator:1500,loanStatus:'All',fundId:0,daysInArrears:0,
                                                    totalODAbove:0,accountStateId: stateId, accountStateName: stateName,fundIds:fundIds,fundNames:fundNames,generationType:generationType});
                                            }
                                            else {
                                                res.redirect(props.contextPath + '/client/ci/showErrorPage');
                                            }
                                        });
                                    });
                                });
                            });
                        });
                    });
                });
            }
        } catch (e) {
            customlog.error("Exception while loading loadReport " + e);
            res.redirect(props.contextPath + '/client/ci/showErrorPage');
        }
    },

    generateSelectedReport: function (req, res) {
        try {
            var tenantId = req.session.tenantId;
            var userId = req.session.userId;
            if (typeof tenantId == 'undefined' || typeof userId == 'undefined') {
                res.redirect(props.contextPath + '/client/ci/login');
            }
            else {
                var self = this;
                var constObj = this.constants;
                var roleId = req.session.roleId;
                var reportType = req.body.reportType;
                var reportId = req.body.reportId;
                var reportCategory = req.body.categoryId;
                var reportName = req.body.reportName;
                var fromDate = (typeof req.body.fromdate == 'undefined') ? '1900-01-01' : req.body.fromdate;
                var toDate = req.body.todate;
                var customer = req.body.customer;
                var account = req.body.account;
                var loanProduct = req.body.loan_product;
                var category = req.body.category;
                var fieldOfficer = req.body.loanOfficer;
                var requiredReport = req.body.reportDescription;
                var selectedLedger = (typeof req.body.listledger == 'undefined')?"":req.body.listledger;
                var npaIndicator = (typeof req.body.npaIndicator == 'undefined')?"":req.body.npaIndicator;
                var loanStatus = (typeof req.body.loanStatus == 'undefined')?"":req.body.loanStatus;
                var daysInArrears = (typeof req.body.daysInArrears == 'undefined')?"":req.body.daysInArrears;
                var totalODAbove = (typeof req.body.totalODAbove == 'undefined')?"":req.body.totalODAbove;
                var spname = req.body.reportspname;
                var generationType = req.body.generationType;
                var reportFilter = req.body.reportFilter;
                var ledgerValue;
                var fundName = req.body.fundName;
                var mfiFlag = (req.body.mfiFlag=="on")?"mfi":"";
                var accFlag = (req.body.accFlag=="on")?"accounting":"";

                if(reportId == constObj.getBankReconciliationReportId()){
                    ledgerValue = "Bank";
                }
                else{
                    ledgerValue = "ALL";
                }
                var officeId = (typeof req.body.listoffice == 'undefined') ? (roleId == constObj.getSMHroleId() || roleId == constObj.getAMHroleId()) ? -1 : req.session.officeId : req.body.listoffice;
                var jsonData = JSON.stringify({
                    100: fromDate,
                    101: toDate,
                    102: officeId,
                    103: fieldOfficer,
                    104: category,
                    105: loanProduct,
                    106: customer,
                    107: account,
                    108: userId,
                    110:selectedLedger,
                    111:npaIndicator,
                    112:loanStatus,
                    113:daysInArrears,
                    115:fundName,
                    163:totalODAbove,
                    168:mfiFlag,
                    169:accFlag
                });
                var reportParamTypeData = JSON.stringify({ //0 denotes varchar, 1 denotes int
                    lookup100:0,
                    lookup101:0,
                    lookup102:1,
                    lookup103:1,
                    lookup104:1,
                    lookup105:1,
                    lookup106:0,
                    lookup107:0,
                    lookup108:1,
                    lookup110:0,
                    lookup111:1,
                    lookup112:0,
                    lookup113:1,
                    lookup115:1,
                    lookup163:1,
                    lookup168:0,
                    lookup169:0
                });
                self.reportQueryObj.getReportQuery(requiredReport,spname,jsonData,reportFilter,reportParamTypeData, function (reportQuery) {
                    var rest = require(rootPath + "/app_modules/reports/router/rest.js");

                    var http = require('http');
                    var https = require('https');
                    var postheaders = {
                        'Content-Type': 'application/json',
                        'Cookie': req.session.mifosCookie
                    };
                    var options = {
                        host: mifosServiceIP,
                        port: mifosPort,
                        path: "/mfi/api/report/common/getResult.json",
                        method: 'POST',
                        headers: postheaders
                    };
                    customlog.info(reportName+" report Query: " + reportQuery);
                    //var headerValues = getHeaderValues(requiredReport);
                    var reportValues = JSON.stringify({
                        reportName: requiredReport,
                        reportQuery: reportQuery,
                        reportPath: (generationType == 0) ? rootPath+props.reportsPath : rootPath+props.creditReportsPath,
                        generationType: generationType,
                        host: props.ipAddress,
                        port: props.iklantPort,
                        emailId : req.session.emailId
                    });
                    rest.postJSON(options, reportValues, function (statusCode, result, headers) {
                        if (statusCode == 302) {
                            customlog.error("Error while generating Report in mifos 302 error");
                            res.redirect(props.contextPath + '/client/ci/showErrorPage');
                        }
                        else {
                            if (result.status == 'success') {
                                if(req.params.reportMessage == "FromBRSScreen"){
                                    var months = ['April','May','June','July','August','September','October','November','December','January','February','March'];
                                    var monthIndex = ['04','05','06','07','08','09','10','11','12','01','02','03'];
                                    self.reportManagementDataModel.retrieveLedgerDetailsDataModel(tenantId,officeId,ledgerValue,userId, function (ledger_name_array,gl_code_value_array) {
                                        res.render('accounting/bankReconciliation.jade', {bankReconciliationStmt:null,contextPath:props.contextPath,months:months,toDisplayLedger:"",dateStr:"",bankReconciliationStmtLength:0,
                                            monthIndex:monthIndex,gl_code_value_array:gl_code_value_array,ledger_name_array:ledger_name_array,ledgerValue:req.body.listledger,selectedMonth:req.body.monthValue,opening_bal:"",closing_bal:"",fileSize: result.fileSize,filePath:result.filePath});
                                    });
                                }else{
                                    var reportResult = result.resultSet;
                                    customlog.info("After query execution success: retrieve starts here "+new Date().getHours()+":"+new Date().getMinutes()+":"+new Date().getSeconds());
                                    self.datamodelReports.loadReportByIdDataModel(reportId, function (status, generationType, reportFilterId, reportFilterValue) {
                                        self.commonDataModel.retriveOfficeDatamodel(tenantId, userId, function (officeIdArray, officeNameArray) {
                                            self.commonDataModel.getPersonnelDetailsDataModel(officeId, userId, function (personnelIdArray, personnelNameArray) {
                                                self.reportManagementDataModel.retrieveLoanProductAndCategoryDatamodel(tenantId, function (prdOfferingIdArray, prdOfferingNameArray, prdCategoryIdArray, prdCategoryNameArray) {
                                                    self.reportManagementDataModel.retrieveLedgerDetailsDataModel(tenantId,officeId,ledgerValue,userId, function (ledger_name_array,gl_code_value_array) {
                                                        customlog.info("After query execution success: retrieve ends here "+new Date().getHours()+":"+new Date().getMinutes()+":"+new Date().getSeconds());
                                                        self.reportManagementDataModel.retrieveStatusDataModel(reportId, function(stateId,stateName) {
                                                            self.reportManagementDataModel.retrieveFundDetailDataModel(reportId,function(fundIds, fundNames){
                                                                if (reportResult.length == 0) {
                                                                    result.filePath = "";
                                                                }
                                                                if(result.backgroundStatus != 'running'){
                                                                    res.render("reports/reportView", {roleId: roleId,constantsObj: constObj,contextPath: props.contextPath,title: 'Reports Management',
                                                                        categoryId: reportCategory,reportFilterId: reportFilterId,reportFilterValue: reportFilterValue,reportName: reportName,fromDate: fromDate,
                                                                        toDate: toDate,officeId: officeId,customerName: customer,accountNo: account,fieldOfficerId: fieldOfficer,productTypeId: loanProduct,
                                                                        productCategoryId: category,officeIdArray: officeIdArray,officeNameArray: officeNameArray,personnelIdArray: personnelIdArray,
                                                                        ledgerValue: selectedLedger,personnelNameArray: personnelNameArray,prdOfferingIdArray: prdOfferingIdArray,prdOfferingNameArray: prdOfferingNameArray,
                                                                        prdCategoryIdArray: prdCategoryIdArray,prdCategoryNameArray: prdCategoryNameArray,result: reportResult,reportId: reportId,
                                                                        fileSize: result.fileSize,filePath: result.filePath,ledger_name_array: ledger_name_array,gl_code_value_array: gl_code_value_array,
                                                                        spname: spname,accountStateId: stateId, accountStateName: stateName,loanStatus:loanStatus,fundId:fundName,npaIndicator:npaIndicator,daysInArrears:daysInArrears,generationType:generationType,
                                                                        fundIds:fundIds,fundNames:fundNames,totalODAbove:totalODAbove
                                                                    });
                                                                }else{
                                                                    res.render('errorpage.jade',{contextPath:props.contextPath,error : "Report Request Already Submitted.Please Try Again Later."});
                                                                }
                                                            });
                                                        });
                                                    });
                                                });
                                            });
                                        });
                                    });
                                }
                            }
                            else {
                                customlog.error("Error while generating " + req.body.reportDescription + " Report in mifos");
                                res.redirect(props.contextPath + '/client/ci/showErrorPage');
                            }
                        }
                    });
                });
            }
        } catch (e) {
            customlog.error("Exception while loading generateSelectedReport " + e);
            res.redirect(props.contextPath + '/client/ci/showErrorPage');
        }
    },

    //generic function to download docs from path
    downloadReports:function(req,res) {
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
                            fs.unlink(selectedDocLocation);
                        }
                    });
                }else{
                    customlog.error(selectedDocLocation +" not found");
                    self.commonRouter.showErrorPage(req,res);
                }
            }
        }catch(e){
            customlog.error("Exception while downloadDocs "+e);
            self.commonRouter.showErrorPage(req,res);
        }
    }
}

function getHeaderValues(reportName) {
    var constantsRequire = require(path.join(rootPath,"app_modules/dto/common/Constants"));
    var constantsObj = new constantsRequire();
    var headerValues;
    if(reportName == constantsObj.getClientOutstanding()) {
        headerValues = {office:'Office',customer:'Customer',account_num: 'Account No',group_name: 'Group Name',
            field_officer: 'Field Officer',loan_product: 'Loan Product',category_name: 'Product Category',disbursement_date: 'Disb. Date',
            loan_amount: 'Loan Amount',principal: 'Principal',principal_paid: 'Principal Paid',interest: 'Interest',
            interest_paid: 'Interest Paid',prin_outstanding: 'Principal Outstanding',int_outstanding: 'Interest Outstanding'};
    }
    else if(reportName == constantsObj.getClientDemand()){
        headerValues = {month: 'Month',loan_product: 'Loan Product',demd_office: 'Branch',field_officer: 'Field Officer',
            demd_date: 'Due Date',group_code: 'Group Code',demd_group_name: 'Group Name',demd_customer: 'Client Name',principal_demd: 'Pri.Demd',
            interest_demd: 'Int.Demd',total_demd: 'Tot.Demd'};
    }
    else if(reportName == constantsObj.getBankReconciliation()){
        headerValues = {transactionDate: 'Date',debitAccName: 'Debit Account Name',transactionType: 'Transaction Type',chequeNumber: 'Cheque Number',
            chequeDate: 'Cheque Date',reconciled_date:'Bank Date',debitAcc: 'Debit',creditAcc: 'Credit'};
    }
    return headerValues;
}

module.exports = routerReports;