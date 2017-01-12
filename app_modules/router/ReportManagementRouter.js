module.exports = reportManagement;
var path = require('path');
var rootPath = path.dirname(process.mainModule.filename);
var props = require(path.join(rootPath,"properties.json"));
var ReportManagementModel = require(path.join(rootPath,"app_modules/model/ReportManagementModel"));

var customlog = require(path.join(rootPath,"logger/loggerConfig.js"))('ReportManagementRouter.js');
var dateUtils = require(path.join(rootPath,"app_modules/utils/DateUtils"));
var commonDTO = path.join(rootPath,"app_modules/dto/common");
var reportManagementDTO = path.join(rootPath,"app_modules/dto/report_management");

mifosServiceIP = props.mifosServiceIp;
mifosPort = props.mifosPort;
GPSPort = props.GPSPort;
microFinanceGlcode = props.microFinanceGlcode;
iklantPort = props.iklantPort;

function reportManagement(constants) {
    customlog.debug("Inside Router");
    this.model = new ReportManagementModel(constants);
    this.constants = constants;

    // Paramasivan
    // Used for all financial reports to allow dates within selected Financial Year
    var FinancialYearLoadHolder = require(reportManagementDTO +"/FinancialYearLoadHolder.js");
    var FinancialYearLoadHolder = new FinancialYearLoadHolder();
    this.FinancialYearLoadHolder = FinancialYearLoadHolder;
}

reportManagement.prototype = {
    // Added by Chitra
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
                self.commonRouter.showErrorPage(req,res);
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
            self.commonRouter.showErrorPage(req,res);
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
            self.commonRouter.showErrorPage(req,res);
        }
    },
    getFinancialYearLoadHolder : function(finResult,callBack){
        try{
            var FinancialYearLoadHolder = require(reportManagementDTO +"/FinancialYearLoadHolder.js");
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
                self.commonRouter.showErrorPage(req,res);
            }
            else {
                req.session.tenantId = tenantId;
                res.render('reportsMenu.jade', {roleId:roleId,constObj:constObj, contextPath:props.contextPath,roleIds:roleIds});
            }
        }catch(e){
            customlog.error("Exception while reportsMenu "+e);
            self.commonRouter.showErrorPage(req,res);
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
                self.commonRouter.showErrorPage(req,res);
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
            self.commonRouter.showErrorPage(req,res);
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
                self.commonRouter.showErrorPage(req,res);
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
            self.commonRouter.showErrorPage(req,res);
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
            self.commonRouter.showErrorPage(req,res);
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
            self.commonRouter.showErrorPage(req,res);
        }
    },

    cashBookReportLoadCall : function(finYearId,tenantId,officeId,startDate,endDate,selected_ledger_name,selected_ledger_id,mfiOperation,accOperation,userId,callback){
        this.model.cashBookReportModel(finYearId,tenantId,officeId,startDate,endDate,selected_ledger_name,selected_ledger_id,mfiOperation,accOperation,userId,callback);
    },

    /*Generate the Report with filter from_date,to_date,office for the reports   */
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
            self.commonRouter.showErrorPage(req,res);
        }
    },

    generateReportWithOfficeDateCall : function(tenantId,officeId,startDate,endDate,selected_product_id,selected_category_id,selected_field_off_id,reportPageName,finYearId,userId, callback){
        this.model.generateReportWithOfficeDateModel(tenantId,officeId,startDate,endDate,selected_product_id,selected_category_id,selected_field_off_id,reportPageName,finYearId,userId, callback);
    },

    /*Generate the Report with filter from_date,to_date,office,customer,account_no for the reports   */
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
            self.commonRouter.showErrorPage(req,res);
        }
    },

    generateReportWithOfficeDateCustomerAccountCall : function(tenantId,officeId,startDate,endDate,customer,accountNo,selected_product_id,selected_category_id,selected_field_off_id,reportPageName,includePrevOperation,userId,callback){
        this.model.generateReportWithOfficeDateCustomerAccountDateModel(tenantId,officeId,startDate,endDate,customer,accountNo,selected_product_id,selected_category_id,selected_field_off_id,reportPageName,includePrevOperation,userId,callback);
    },

    /*Generate the Report with filter from_date,to_date,office,customer,account_no for the reports   */
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
            self.commonRouter.showErrorPage(req,res);
        }
    },

    accountDefaultPaymentsReportCall : function(tenantId,officeId,endDate,customer,accountNo,selected_product_id,selected_category_id,selected_field_off_id,reportPageName,userId, callback){
        this.model.accountDefaultPaymentsReportModel(tenantId,officeId,endDate,customer,accountNo,selected_product_id,selected_category_id,selected_field_off_id,reportPageName,userId, callback);
    },
    // Ended by Chitra
    // Added by chitra
    /*Get the group details for the background verification   */
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
            self.commonRouter.showErrorPage(req,res);
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
            self.commonRouter.showErrorPage(req,res);
        }
    },
    // Ended by chitra
    generateReportCall : function(startdate,enddate,statusId,officeId,userId,callback) {
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
            self.commonRouter.showErrorPage(req,res);
        }
    },
    loanOfficers : function(req,res){
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
            self.commonRouter.showErrorPage(req,res);
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
                self.commonRouter.showErrorPage(req,res);
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
            self.commonRouter.showErrorPage(req,res);
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
                self.commonRouter.showErrorPage(req,res);
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
            self.commonRouter.showErrorPage(req,res);
        }
    },

    demandCollectionCall: function(fromDate, toDate, officeId,loanOfficerId,productCategoryId,loanProductId,customer,account, reportCategory, reportId, individual_tracked, userId,callBack){
        this.model.getDemandCollectionSummaryModel(fromDate, toDate, officeId,loanOfficerId,productCategoryId,loanProductId,customer,account,reportCategory, reportId, individual_tracked, userId,callBack);
    },

    retrieveLoanProductAndCategoryCall : function(tenantId,callBack){
        this.model.retrieveLoanProductAndCategoryModel(tenantId,callBack);
    },
    // To show demand collection summary
    demandCollectionSummary : function(req,res){
        try{
            var self = this;
            customlog.info('Inside demand collection summary');
            if(typeof req.session.tenantId == 'undefined' || typeof req.session.userId == 'undefined') {
                self.commonRouter.showErrorPage(req,res);
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
            self.commonRouter.showErrorPage(req,res);
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
                self.commonRouter.showErrorPage(req,res);
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
            self.commonRouter.showErrorPage(req,res);
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
                self.commonRouter.showErrorPage(req,res);
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
            self.commonRouter.showErrorPage(req,res);
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
                self.commonRouter.showErrorPage(req,res);
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
            self.commonRouter.showErrorPage(req,res);
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
                self.commonRouter.showErrorPage(req,res);
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
            self.commonRouter.showErrorPage(req,res);
        }
    },

    PARReportCall : function(toDate,officeId,daysInArrears,reportId,userId, callBack){
        this.model.getPARReportModel(toDate,officeId,daysInArrears,reportId, userId,callBack);
    },

    PARReport : function(req,res){
        try{
            var self = this;
            if(typeof req.session.tenantId == 'undefined' || typeof req.session.userId == 'undefined') {
                self.commonRouter.showErrorPage(req,res);
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
            self.commonRouter.showErrorPage(req,res);
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
                self.commonRouter.showErrorPage(req,res);
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
            self.commonRouter.showErrorPage(req,res);
        }
    },
    //TO show process NPA Page Author : bask1939
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
                        self.commonRouter.showErrorPage(req,res);
                    }
                });
            }
        }catch(e){
            customlog.error("Exception while Process NPA "+e);
            self.commonRouter.showErrorPage(req,res);
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

                var NPAProcessHolder = require(reportManagementDTO +"/NPAProcessHolder");
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
            self.commonRouter.showErrorPage(req,res);
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
                var reportHolderObj = require(reportManagementDTO +"/ReportHolder");
                var reportHolder = new reportHolderObj();

                var startDate = req.body.fromdateTB;
                var endDate = req.body.todateTB;
                var officeId = req.body.listofficeTB;
                if(typeof(officeId) == 'undefined'){
                    officeId = req.session.officeId;
                }
                /*reportHolder.setStartDateStr("2013-04-01");
                 reportHolder.setEndDateStr("2013-09-30");
                 reportHolder.setOfficeId(-1);*/

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
                            var trailBalanceObj = require(reportManagementDTO +"/trailBalance");
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
                        self.commonRouter.showErrorPage(req,res);
                    }
                });
            }
        }catch(e){
            customlog.error("Exception while Generate Trail Balance "+e);
            self.commonRouter.showErrorPage(req,res);
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

                            var NPALoadHolder = require(reportManagementDTO +"/NPALoadHolder");
                            var NPALoadHolder = new NPALoadHolder();
                            if(req.session.bcOfficeId !=1){
                                self.model.callOfficeAndPersonnelForBC(req.session.bcOfficeId,function(officeIdArray, officeNameArray, personnelIdArray, personnelNameArray,personnelOfficeIdArray){
                                    for(var item = 0; item<result.prdCatories.length; item++) {
                                        productCategoryIdArray[item]	= result.prdCatories[item].globalProductCategoryNumber;
                                        productNameArray[item] 		= result.prdCatories[item].productCategoryName;
                                    }
                                    NPALoadHolder.setProductCategoryIdArray(productCategoryIdArray);
                                    NPALoadHolder.setProductNameArray(productNameArray);
                                    NPALoadHolder.setOfficeIdArray(officeIdArray);
                                    NPALoadHolder.setOfficeNameArray(officeNameArray);
                                    NPALoadHolder.setPersonnelIdArray(personnelIdArray);
                                    NPALoadHolder.setPersonnelNameArray(personnelNameArray);
                                    NPALoadHolder.setOfficePersonnelIdArray(personnelOfficeIdArray);
                                    NPALoadHolder.setLastReportGeneratedDate(convertToDateWithSlash(result.lastProcessedDate));
                                    if(roleId == constantObj.getApexPromotors())
                                    {
                                        res.render('NPAAgingReportMenu.jade', {NPALoadHolder : NPALoadHolder,errorField : errorField, officeId : officeId,constantObj:constantObj,roleId:roleId, contextPath:props.contextPath});
                                    }else{
                                        res.render('NPAReportMenu.jade', {NPALoadHolder : NPALoadHolder,errorField : errorField, officeId : officeId,constantObj:constantObj,roleId:roleId, contextPath:props.contextPath});
                                    }
                                });
                            }else{
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
                        }
                    }else{
                        self.commonRouter.showErrorPage(req,res);
                    }
                });
            }
        }catch(e){
            customlog.error("Exception while Show NPA Menu page "+e);
            self.commonRouter.showErrorPage(req,res);
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
                var NPAHolderObj = require(reportManagementDTO +"/NPAHolder");
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
                    if(req.session.bcOfficeId !=1 && req.body.office ==-1)
                        officeId = -1;
                    else if (req.session.bcOfficeId !=1 && req.body.office !=-1)
                        officeId = req.body.office;
                    else
                        officeId = req.body.office;
                }else{
                    officeId = req.session.officeId;
                }
                var productCategoryId;
                if (typeof(req.body.productCategory) != 'undefined')
                    productCategoryId = req.body.productCategory;
                else
                    productCategoryId =-1;
                var loanOfficer;
                if (typeof(req.body.loanOfficer) != 'undefined')
                    loanOfficer	= req.body.loanOfficer;
                else
                    loanOfficer =-1;
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
                NPAHolder.setBcOfficeId(req.session.bcOfficeId);

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
                        var NPALoadHolder = require(reportManagementDTO +"/NPALoadHolder");
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
                            var NPAHolderObj1 = require(reportManagementDTO +"/NPAHolder");
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
            self.commonRouter.showErrorPage(req,res);
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

                            var NPALoadHolder = require(reportManagementDTO +"/NPALoadHolder");
                            var NPALoadHolder = new NPALoadHolder();
                            if(req.session.bcOfficeId !=1){
                                self.model.callOfficeAndPersonnelForBC(req.session.bcOfficeId,function(officeIdArray, officeNameArray, personnelIdArray, personnelNameArray,personnelOfficeIdArray){
                                    for(var item = 0; item<result.prdCatories.length; item++) {
                                        productCategoryIdArray[item]	= result.prdCatories[item].globalProductCategoryNumber;
                                        productNameArray[item] 		= result.prdCatories[item].productCategoryName;
                                    }
                                    NPALoadHolder.setProductCategoryIdArray(productCategoryIdArray);
                                    NPALoadHolder.setProductNameArray(productNameArray);
                                    NPALoadHolder.setOfficeIdArray(officeIdArray);
                                    NPALoadHolder.setOfficeNameArray(officeNameArray);
                                    NPALoadHolder.setPersonnelIdArray(personnelIdArray);
                                    NPALoadHolder.setPersonnelNameArray(personnelNameArray);
                                    NPALoadHolder.setOfficePersonnelIdArray(personnelOfficeIdArray);
                                    NPALoadHolder.setLastReportGeneratedDate(convertToDateWithSlash(result.lastProcessedDate));
                                    res.render('NPAAgingReportMenu.jade', {NPALoadHolder : NPALoadHolder,errorField : errorField,officeId : officeId,roleId:roleId,constantObj:constantObj, contextPath:props.contextPath});
                                });
                            }else{
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
                                res.render('NPAAgingReportMenu.jade', {NPALoadHolder : NPALoadHolder,errorField : errorField,officeId : officeId,roleId:roleId,constantObj:constantObj, contextPath:props.contextPath});
                            }
                        }
                    } else {
                        self.commonRouter.showErrorPage(req,res);
                    }
                });
            }
        }catch(e){
            customlog.error("Exception while Show NPA Menu Page "+e);
            self.commonRouter.showErrorPage(req,res);
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
                    self.model.callOfficeAndPersonnelForBC(req.session.bcOfficeId,function(officeIdBcArray, officeNameBcArray, personnelIdBcArray, personnelNameBcArray,personnelOfficeIdBcArray){
                        self.viewNpaAgingReportCall(req,res,officeIdArray,officeIdBcArray);
                    });
                });
            }
        }catch(e){
            customlog.error("Exception while View NPA Aging report "+e);
            self.commonRouter.showErrorPage(req,res);
        }
    },

    //TO Retrieve NPA Aging Report Page Author : bask1939
    viewNpaAgingReportCall :   function(req,res,officeIdArray,officeIdBcArray){
        try{
            var self = this;
            var constantsObj = this.constants;
            customlog.info("Inside View NPA Aging Report");
            if(typeof req.session.tenantId == 'undefined' || typeof req.session.userId == 'undefined') {
                res.redirect(props.contextPath+'/client/ci/login');
            }
            else {
                var roleId = req.session.roleId;
                var userId = (roleId == constantsObj.getSMHroleId() ||roleId == constantsObj.getBMroleId() || roleId == constantsObj.getAccountsExecutiveRoleId() || roleId == constantsObj.getApexPromotors() )?req.session.userId:-1;
                var NPAAgingHolderObj = require(reportManagementDTO +"/NPAAgingHolder");
                var NPAAgingHolder = new NPAAgingHolderObj();
                var officeLabel;
                var loggedInOffice = req.session.officeId;
                var productLabel;
                var personnelLabel;
                var NPAHolderObj = require(reportManagementDTO +"/NPAHolder");
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
                if( req.session.bcOfficeId ==1 && req.session.officeId == constantsObj.getApexHeadOffice() || roleId == constantsObj.getSMHroleId() ){
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
                }else if (req.session.bcOfficeId !=1){
                    officeId = "";
                    if(req.body.office == -1){
                        for(var i in officeIdBcArray){
                            if(officeId == ""){
                                officeId = officeIdBcArray[i];
                            }else{
                                officeId += ","+officeIdBcArray[i];
                            }
                        }
                        officeIdForSMH = 1;
                    }else{
                        officeIdForSMH = req.body.office;
                        officeId = req.body.office;
                    }
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
                        var NPALoadHolder = require(reportManagementDTO +"/NPALoadHolder");
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
                            var NPAAgingHolderObjLocal = require(reportManagementDTO +"/NPAAgingHolder");
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
            self.commonRouter.showErrorPage(req,res);
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

                            var NPALoadHolder = require(reportManagementDTO +"/NPALoadHolder");
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
                        self.commonRouter.showErrorPage(req,res);
                    }
                });
            }
        }catch(e){
            customlog.error("Exception while NPA Group Summary "+e);
            self.commonRouter.showErrorPage(req,res);
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
            self.commonRouter.showErrorPage(req,res);
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
                var NPAAgingHolderObj = require(reportManagementDTO +"/NPAGroupSummaryHolder");
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
                                var NPAGroupSummaryHolderObj1 = require(reportManagementDTO +"/NPAGroupSummaryHolder");
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
                        self.commonRouter.showErrorPage(req,res);
                    }
                });
            }
        }catch(e){
            customlog.error("Exception while View NPA Detail for Default Days "+e);
            self.commonRouter.showErrorPage(req,res);
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
                var NPAAgingHolderObj = require(reportManagementDTO +"/NPAGroupSummaryHolder");
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
                            var NPALoadHolder = require(reportManagementDTO +"/NPALoadHolder");
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
                                var NPAGroupSummaryHolderObj1 = require(reportManagementDTO +"/NPAGroupSummaryHolder");
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
            self.commonRouter.showErrorPage(req,res);
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
            self.commonRouter.showErrorPage(req,res);
        }
    },

    getFONamesCall: function(officeId,callback) {
        this.model.getFONamesModel(officeId,callback);
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
            self.commonRouter.showErrorPage(req,res);
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
            self.commonRouter.showErrorPage(req,res);
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
            self.commonRouter.showErrorPage(req,res);
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
            self.commonRouter.showErrorPage(req,res);
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
            self.commonRouter.showErrorPage(req,res);
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
            self.commonRouter.showErrorPage(req,res);
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
            self.commonRouter.showErrorPage(req,res);
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
            self.commonRouter.showErrorPage(req,res);
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
            self.commonRouter.showErrorPage(req,res);
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
            self.commonRouter.showErrorPage(req,res);
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
            self.commonRouter.showErrorPage(req,res);
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
            self.commonRouter.showErrorPage(req,res);
        }
    },
    //Loan Sanction Document Verification
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
            self.commonRouter.showErrorPage(req,res);
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
            self.commonRouter.showErrorPage(req,res);
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
            self.commonRouter.showErrorPage(req,res);
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
            self.commonRouter.showErrorPage(req,res);
        }
    },
    loadRescheduledGroups : function(req,res){
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
                    self.commonRouter.showErrorPage(req, res);
                }
            });
        } catch (e) {
            customlog.error("Exception while Load approveOrRejectClientForNextLoan " + e);
            self.commonRouter.showErrorPage(req, res);
        }
    },
    checkForAlreadyExistingmemberCall:function(tenantId,rationCardNumber,contactNumber,voterId,aadhaarNumber,callback){
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
            self.commonRouter.showErrorPage(req,res);
        }
    },
    //Equifax Report[Adarsh]
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
            self.commonRouter.showErrorPage(req,res);
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
            self.commonRouter.showErrorPage(req,res);
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
            self.commonRouter.showErrorPage(req,res);
        }
    },
    //generic function to retrieve file location for documents
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
                            self.commonRouter.listQuestionsCCACall(tenantId,clientId,clientLoanCount,function(clientName,questionsObj,choicesanswerObj,choicesObj,capturedImageArray,docTypeIdArray){
                                self.commonRouter.showCCAQuestions(req,res,groupid,selectedOfficeId,redirectValue,clientId,clientName,centerNameCCA2,clientRatingPerc,clientTotalWeightage,clientTotalWeightageRequired,questionsObj,choicesanswerObj,choicesObj,capturedImageArray,docTypeIdArray,errorfield,clientLoanCount,statusId);
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
                                self.commonRouter.showCCAQuestions(req,res,groupid,selectedOfficeId,redirectValue,clientId,clientName,centerNameCCA2,clientRatingPerc,clientTotalWeightage,clientTotalWeightageRequired,questionsObj,choicesanswerObj,choicesObj,capturedImageArray,docTypeIdArray,errorfield,clientLoanCount,statusId);
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
            self.commonRouter.showErrorPage(req,res);
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
                    self.commonRouter.showErrorPage(req,res);
                }
            }
        }catch(e){
            customlog.error("Exception while downloadDocs "+e);
            self.commonRouter.showErrorPage(req,res);
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
            self.commonRouter.showErrorPage(req,res);
        }
    },

    //End By Adarsh

    /* Added by chitra for existing user check  */
    checkExistingUserCall:function(user_name,callback){
        this.model.checkExistingUserModel(user_name,callback);
    },
    getGroupDetailCall : function(userId, callback){
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
            self.commonRouter.showErrorPage(req,res);
        }
    },
    assignGroupToROCall : function(accountId,roId,callback){
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
            self.commonRouter.showErrorPage(req,res);
        }
    },
    loanDisbursalReportLoad : function(req,res){
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
                            var ReportHolder = require(reportManagementDTO +"/ReportHolder");
                            var OfficeDto = require(reportManagementDTO +"/OfficeDto");
                            var PrdCatDto = require(reportManagementDTO +"/PrdCatDto");
                            var PersonnelDto = require(reportManagementDTO +"/PersonnelDto");
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

                            var LoanDisbursalDto = require(reportManagementDTO +"/LoanDisbursalDto");
                            var loanDisbursalSummary = new LoanDisbursalDto();
                            res.render("loanDisbursalReport",{reportHolder:reportHolder,loanDisbursalSummary:loanDisbursalSummary,loanDisbursalDetList:"",isReportLoaded:0, contextPath:props.contextPath});
                        }else{
                            self.commonRouter.showErrorPage(req,res);
                        }
                    }
                });
            }
        }catch(e){
            customlog.error("Exception while loanDisbursalReportLoad "+e);
            self.commonRouter.showErrorPage(req,res);
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
            var ReportHolder = require(reportManagementDTO +"/ReportHolder");
            var reportHolder = new ReportHolder();

            //var selectedOfficeIdsArray = new Array();
            var officeIdsArray = new Array();
            var officeNamesArray = new Array();
            var prdCategoryIdsArray = new Array();
            var prdCategoryNamesArray = new Array();
            /*if(parseInt(office,10) == -1){
             if(typeof officeIds != 'undefined') {
             selectedOfficeIdsArray = officeIds.split(",");
             }
             }
             else {
             selectedOfficeIdsArray[0] = office;
             }*/
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

            var OfficeDto = require(reportManagementDTO +"/OfficeDto");
            var officeList = new Array();
            for(var i =0; i<officeIdsArray.length; i++) {
                var officeDto = new OfficeDto();
                officeDto.setId(officeIdsArray[i]);
                officeDto.setName(officeNamesArray[i]);
                officeList[i] = officeDto;
            }
            reportHolder.setOffices(officeList);

            var PrdCatDto = require(reportManagementDTO +"/PrdCatDto");
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
                            var ReportHolder = require(reportManagementDTO +"/ReportHolder");
                            var OfficeDto = require(reportManagementDTO +"/OfficeDto");
                            var PrdCatDto = require(reportManagementDTO +"/PrdCatDto");
                            var PersonnelDto = require(reportManagementDTO +"/PersonnelDto");
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


                            var LoanDisbursalDto = require(reportManagementDTO +"/LoanDisbursalDto");
                            var loanDisbursalSummary = new LoanDisbursalDto();

                            res.render("loanDisbursalReport",{reportHolder:reportHolder,loanDisbursalSummary:loanDisbursalSummary,loanDisbursalDetList:"",isReportLoaded:0, contextPath:props.contextPath});
                        }
                        else{
                            self.commonRouter.showErrorPage(req,res);
                        }
                    }
                });
            }
        }catch(e){
            customlog.error("Exception While loanDisbursalReportLoadLoanOfficers "+e);
            self.commonRouter.showErrorPage(req,res);
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
            var ReportHolder = require(reportManagementDTO +"/ReportHolder");
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

            var OfficeDto = require(reportManagementDTO +"/OfficeDto");
            var officeList = new Array();
            for(var i =0; i<officeIdsArray.length; i++) {
                var officeDto = new OfficeDto();
                officeDto.setId(officeIdsArray[i]);
                officeDto.setName(officeNamesArray[i]);
                officeList[i] = officeDto;
            }
            reportHolder.setOffices(officeList);

            var PrdCatDto = require(reportManagementDTO +"/PrdCatDto");
            var prdCategoryList = new Array();
            for(var i =0; i<prdCategoryIdsArray.length; i++) {
                var prdCatDto = new PrdCatDto();
                prdCatDto.setPrdCatId(prdCategoryIdsArray[i]);
                prdCatDto.setPrdCatName(prdCategoryNamesArray[i]);

                prdCategoryList[i] = prdCatDto;
            }
            reportHolder.setPrdCategories(prdCategoryList);

            var PersonnelDto = require(reportManagementDTO +"/PersonnelDto");
            var loanOfficerList = new Array();
            for(var i =0; i<loanOfficerIdsArray.length; i++) {
                var personnelDto = new PersonnelDto();
                personnelDto.setPersonnelId(loanOfficerIdsArray[i]);
                personnelDto.setDisplayName(loanOfficerNamesArray[i]);

                loanOfficerList[i] = personnelDto;
                customlog.info(loanOfficerNamesArray[i]);
            }

            reportHolder.setLoanOfficers(loanOfficerList);


            /*var startDate = convertToMifosDateFormat(req.body.startDate);
             var endDate = convertToMifosDateFormat(req.body.endDate);
             var office = req.body.office;
             var loanOfficer = req.body.loanOfficer;
             var productCategory = req.body.productCategory;
             var ReportHolder = require(reportManagementDTO +"/ReportHolder");
             var reportHolder = new ReportHolder();
             this.reportHolder = reportHolder;
             var reportHolder = this.reportHolder;
             reportHolder.setStartDate(startDate);
             reportHolder.setEndDate(endDate);
             reportHolder.setOfficeId(office);
             reportHolder.setLoanOfficerId(loanOfficer);
             reportHolder.setCategoryId(productCategory);*/

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
                            var ReportHolder = require(reportManagementDTO +"/ReportHolder");
                            var OfficeDto = require(reportManagementDTO +"/OfficeDto");
                            var PrdCatDto = require(reportManagementDTO +"/PrdCatDto");
                            var PersonnelDto = require(reportManagementDTO +"/PersonnelDto");
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

                            var LoanDisbursalDto = require(reportManagementDTO +"/LoanDisbursalDto");
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
                            self.commonRouter.showErrorPage(req,res);
                        }
                    }
                });
            }
        }catch(e){
            customlog.error("Exception while loandisbursalReportLoadDetail "+e);
            self.commonRouter.showErrorPage(req,res);
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
                            var LoanOutstandingHolder = require(reportManagementDTO +"/LoanOutstandingHolder");
                            var OfficeDto = require(reportManagementDTO +"/OfficeDto");
                            var PrdCatDto = require(reportManagementDTO +"/PrdCatDto");
                            var PersonnelDto = require(reportManagementDTO +"/PersonnelDto");
                            var PortfolioDto = require(reportManagementDTO +"/PortfolioDto");
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
                            self.commonRouter.showErrorPage(req,res);
                        }
                    }
                });
            }
        }catch(e){
            customlog.error("Exception while loanOutstandingReportLoad "+e);
            self.commonRouter.showErrorPage(req,res);
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

            var LoanOutstandingHolder = require(reportManagementDTO +"/LoanOutstandingHolder");
            var OfficeDto = require(reportManagementDTO +"/OfficeDto");
            var PrdCatDto = require(reportManagementDTO +"/PrdCatDto");
            var PersonnelDto = require(reportManagementDTO +"/PersonnelDto");
            var PortfolioDto = require(reportManagementDTO +"/PortfolioDto");
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
                            var LoanOutstandingHolder = require(reportManagementDTO +"/LoanOutstandingHolder");
                            var OfficeDto = require(reportManagementDTO +"/OfficeDto");
                            var PrdCatDto = require(reportManagementDTO +"/PrdCatDto");
                            var PersonnelDto = require(reportManagementDTO +"/PersonnelDto");
                            var PortfolioDto = require(reportManagementDTO +"/PortfolioDto");
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
                            self.commonRouter.showErrorPage(req,res);
                        }
                    }
                });
            }
        }catch(e){
            customlog.error("Exception while loanOutstandingReportLoadLoanOfficers "+e);
            self.commonRouter.showErrorPage(req,res);
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

            var LoanOutstandingHolder = require(reportManagementDTO +"/LoanOutstandingHolder");
            var OfficeDto = require(reportManagementDTO +"/OfficeDto");
            var PersonnelDto = require(reportManagementDTO +"/PersonnelDto");
            var PrdCatDto = require(reportManagementDTO +"/PrdCatDto");
            var PersonnelDto = require(reportManagementDTO +"/PersonnelDto");
            var PortfolioDto = require(reportManagementDTO +"/PortfolioDto");
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
                            var LoanOutstandingHolder = require(reportManagementDTO +"/LoanOutstandingHolder");
                            //var LoanOutstandingDto = require(reportManagementDTO +"/LoanOutstandingDto");
                            var OfficeDto = require(reportManagementDTO +"/OfficeDto");
                            var PrdCatDto = require(reportManagementDTO +"/PrdCatDto");
                            var PersonnelDto = require(reportManagementDTO +"/PersonnelDto");
                            var PortfolioDto = require(reportManagementDTO +"/PortfolioDto");
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
                            self.commonRouter.showErrorPage(req,res);
                        }
                    }
                });
            }
        }catch(e){
            customlog.error("Exception while loanOutstandingReportLoadDetail "+e);
            self.commonRouter.showErrorPage(req,res);
        }
    },
    showPDF : function(res,path) {
        res.render('generatePDF',{path:path, contextPath:props.contextPath});
    }

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