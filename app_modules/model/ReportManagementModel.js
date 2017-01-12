module.exports = reportManagementModel;

var path = require('path');
var applicationHome = path.dirname(process.mainModule.filename);
var ReportManagementDataModel = require(path.join(applicationHome,"app_modules/data_model/ReportManagementDataModel"));
var customLog = require(path.join(applicationHome,"logger/loggerConfig.js"))('ReportManagementModel.js');

//Business Layer
function reportManagementModel(constants) {
    customLog.debug("Inside business layer");
    this.dataModel = new ReportManagementDataModel(constants);
}

reportManagementModel.prototype = {
    checkForAlreadyExistingmemberModel : function(tenantId,rationCardNumber,contactNumber,voterId,aadhaarNumber,callback) {
        this.dataModel.checkForAlreadyExistingmemberDatamodel(tenantId,rationCardNumber,contactNumber,voterId,aadhaarNumber,callback);
    },
    getFONamesModel: function(officeId,callback) {
        this.dataModel.getFONamesDataModel(officeId,callback);
    },
    // Added by Chitra
    retrieveLedgerDetailsModel : function(tenantId,officeId,ledger_name,userId,callback) {
        this.dataModel.retrieveLedgerDetailsDataModel(tenantId,officeId,ledger_name,userId,callback);
    },

    insuranceCoverReportModel: function(tenantId,startDate,endDate,officeId,userId,callback) {
        this.dataModel.insuranceCoverReportDatamodel(tenantId,startDate,endDate,officeId,userId,callback);
    },

    bankBookReportModel: function(finYearId,tenantId,officeId,startDate,endDate,selected_ledger_name,selected_ledger_id,mfiOperation,accOperation,userId,callback) {
        this.dataModel.bankBookReportDatamodel(finYearId,tenantId,officeId,startDate,endDate,selected_ledger_name,selected_ledger_id,mfiOperation,accOperation,userId,callback);
    },
    cashBookReportModel: function(finYearId,tenantId,officeId,startDate,endDate,selected_ledger_name,selected_ledger_id,mfiOperation,accOperation,userId,callback) {
        this.dataModel.cashBookReportDatamodel(finYearId,tenantId,officeId,startDate,endDate,selected_ledger_name,selected_ledger_id,mfiOperation,accOperation,userId,callback);
    },
    generateReportWithOfficeDateModel: function(tenantId,officeId,startDate,endDate,selected_product_id,selected_category_id,selected_field_off_id,reportPageName,finYearId,userId,callback) {
        if(reportPageName == "loanDisbursalNewReport"){
            this.dataModel.loanDisbursalReportDatamodel(tenantId,officeId,startDate,endDate,selected_product_id,selected_category_id,selected_field_off_id,userId,callback);
        }else if(reportPageName == "loanDisbursalSummaryReport"){
            this.dataModel.loanDisbursalSummaryReportDatamodel(tenantId,officeId,startDate,endDate,selected_product_id,selected_category_id,selected_field_off_id,userId,callback);
        }else if(reportPageName == "loanRepaymentReport"){
            this.dataModel.loanRepaymentReportDatamodel(tenantId,officeId,startDate,endDate,selected_product_id,selected_category_id,selected_field_off_id,userId,callback);
        }else if(reportPageName == "loanRepaymentSummaryReport"){
            this.dataModel.loanRepaymentSummaryReportDatamodel(tenantId,officeId,startDate,endDate,selected_product_id,selected_category_id,selected_field_off_id,userId,callback);
        }else if(reportPageName == "loanTransactionReport"){
            this.dataModel.loanTransactionReportDatamodel(tenantId,officeId,startDate,endDate,selected_product_id,selected_category_id,selected_field_off_id,userId,callback);
        }else if(reportPageName == "loanRescheduledReport"){
            this.dataModel.loanRescheduledReportDatamodel(tenantId,officeId,startDate,endDate,selected_product_id,selected_category_id,selected_field_off_id,userId,callback);
        }else if(reportPageName == "loanWrittenOffReport"){
            this.dataModel.loanWrittenOffReportDatamodel(tenantId,officeId,startDate,endDate,selected_product_id,selected_category_id,selected_field_off_id,userId,callback);
        }else if(reportPageName == "profitLossReport"){
            this.dataModel.profitLossReportDatamodel(tenantId,-1,startDate,endDate,finYearId,userId,callback);
        }else if(reportPageName == "closedAccountsReport"){
            this.dataModel.closedAccountsReportDatamodel(tenantId,officeId,startDate,endDate,selected_product_id,selected_category_id,selected_field_off_id,userId,callback);
        }else if(reportPageName == "delayedPaymentReport"){
            this.dataModel.closedAccountsReportDatamodel(tenantId,officeId,startDate,endDate,selected_product_id,selected_category_id,selected_field_off_id,userId,callback);
        }
    },
    generateReportWithOfficeDateCustomerAccountDateModel: function(tenantId,officeId,startDate,endDate,customer,accountNo,selected_product_id,selected_category_id,selected_field_off_id,reportPageName,includePrevOperation,userId,callback) {
        if(reportPageName == "groupOutstandingReport"){
            this.dataModel.groupOutstandingReportDatamodel(tenantId,officeId,startDate,endDate,customer,accountNo,selected_product_id,selected_category_id,selected_field_off_id,userId,callback);
        }else if(reportPageName == "groupLedgerReport" || reportPageName == "groupLedgerInterestReport"){
            this.dataModel.groupLedgerReportDatamodel(tenantId,officeId,startDate,endDate,customer,accountNo,selected_product_id,selected_category_id,selected_field_off_id,reportPageName,includePrevOperation,userId,callback);
        }else if(reportPageName == "activeGMReport"){
            this.dataModel.activeGMReportDatamodel(tenantId,officeId,startDate,endDate,customer,accountNo,selected_product_id,selected_category_id,selected_field_off_id,userId,callback);
        }else if(reportPageName == "createdGMSummaryReport"){
            this.dataModel.createdGMSummaryReportDatamodel(tenantId,officeId,startDate,endDate,customer,accountNo,selected_field_off_id,userId,callback);
        }else if(reportPageName == "overDueClientWiseReport"){
            this.dataModel.createdGMSummaryReportDatamodel(tenantId,officeId,startDate,endDate,customer,accountNo,userId,callback);
        }else if(reportPageName == "delayedPaymentReport"){
            this.dataModel.delayedPaymentReportDatamodel(tenantId,officeId,startDate,endDate,customer,accountNo,selected_product_id,selected_category_id,selected_field_off_id,userId,callback);
        }else if(reportPageName == "groupOutstandingClientWiseReport"){
            this.dataModel.groupOutstandingClientWiseReportDatamodel(tenantId,officeId,startDate,endDate,customer,accountNo,selected_product_id,selected_category_id,selected_field_off_id,userId,callback);
        }
    },
    accountDefaultPaymentsReportModel: function(tenantId,officeId,endDate,customer,accountNo,selected_product_id,selected_category_id,selected_field_off_id,reportPageName,userId,callback) {
        if(reportPageName == "loanAccountDefaultPaymentsReport"){
            this.dataModel.loanAccountDefaultPaymentsReportDatamodel(tenantId,officeId,endDate,customer,accountNo,selected_product_id,selected_category_id,selected_field_off_id,reportPageName,userId,callback);
        }else if(reportPageName == "groupAccountDefaultPaymentsReport"){
            this.dataModel.groupAccountDefaultPaymentsReportDatamodel(tenantId,officeId,endDate,customer,accountNo,selected_product_id,selected_category_id,selected_field_off_id,reportPageName,userId,callback);
        }
    },
    // Ended by chitra

    getTrailBalanceModel: function(financialYearId,startDate,endDate,officeId,reportId,accOperation,mfiOperation,callBack){
        this.dataModel.getTrailBalanceReportDatamodel (financialYearId,startDate,endDate,officeId,reportId,accOperation,mfiOperation,callBack);
    },

    getOverdueSummaryModel: function(toDate,officeId,category,loan_product,personnelId,loanStatus,customer,loanAccount,npaIndicator,daysInArrearsAbove,totalOverdueAbove,userId,callBack){
        this.dataModel.getOverdueSummaryDataModel(toDate,officeId,category,loan_product,personnelId,loanStatus,customer,loanAccount,npaIndicator,daysInArrearsAbove,totalOverdueAbove,userId,callBack);
    },

    getDemandCollectionSummaryModel : function(fromDate, toDate, officeId,loanOfficerId,productCategoryId,loanProductId,customer,account,reportCategory, reportId, individual_tracked, userId,callBack){
        this.dataModel.getDemandCollectionSummary(fromDate, toDate, officeId,loanOfficerId,productCategoryId,loanProductId,customer,account,reportCategory, reportId, individual_tracked, userId,callBack);
    },

    retrieveLoanProductAndCategoryModel : function(tenantId,callBack){
        this.dataModel.retrieveLoanProductAndCategoryDatamodel(tenantId,callBack);
    },

    getGeneralLedgerSummaryModel : function(fromDate, toDate, officeId, selected_ledger_name, ledger_id, accOperation,mfiOperation,userId,callBack){
        this.dataModel.getGeneralLedgerSummaryDataModel(fromDate, toDate, officeId, selected_ledger_name, ledger_id, accOperation,mfiOperation,userId,callBack);
    },

    getVoucherOrReceiptOrLoanDP : function(fromDate,toDate,officeId,loanOfficerId,category,loanProduct,accOperation,mfiOperation,reportId,userId,callBack){
        var constantsRequire = require(path.join(applicationHome,"/app_modules/dto/common/Constants"));
        var constants = new constantsRequire();
        if(reportId == constants.getLoanDisbursementAndRepaymentSummary()){
            this.dataModel.getLoanDisbursementAndRepaymentSummaryDataModel(fromDate,toDate,officeId,loanOfficerId,category,loanProduct,userId,callBack);
        }
        else{
            this.dataModel.getVoucherOrReceipt(fromDate, toDate, officeId,accOperation,mfiOperation,reportId,userId,callBack);
        }
    },

    getPrincipalOutstandingModel : function(toDate, officeId,productCategoryId,loanProductId,loanOfficerId,customer,account, reportId,includePrevOperation,userId,callBack){
        this.dataModel.getPrincipalOutstandingDataModel(toDate, officeId,productCategoryId,loanProductId,loanOfficerId,customer,account,reportId, includePrevOperation,userId,callBack);
    },

    getDEOActivityTrackingModel : function(fromDate,toDate,officeId,customer,roleId,userId,callBack){
        this.dataModel.getDEOActivityTrackingDataModel(fromDate,toDate,officeId,customer,roleId,userId,callBack);
    },

    getPARReportModel : function(toDate,officeId,daysInArrears,reportId, userId,callBack){
        this.dataModel.getPARReportDataModel(toDate,officeId,daysInArrears,reportId,userId,callBack);
    },
    getLUCTrackingReportModel : function(fromDate,toDate,officeId,roleId,download_report,userId,callBack){
        this.dataModel.getLUCTrackingReportDataModel(fromDate,toDate,officeId,roleId,download_report,userId,callBack);
    },
    getReportStatusModel: function(reportId,callBack){
        this.dataModel.getReportStatusDataModel(reportId,callBack);
    },

    reportsMenuModel : function(reportCategoryId, roleId, callBack){
        this.dataModel.reportsMenuDataModel(reportCategoryId, roleId, callBack);
    } ,

    getGroupsForBackGroundVerificationModel : function(officeId,callback){
        this.dataModel.getGroupsForBackGroundVerificationDataModel(officeId,callback);
    },

    retrieveClientDetailsForVerificationPageModel : function(parent_customer_id,callback) {
        this.dataModel.retrieveClientDetailsForVerificationPageDataModel(parent_customer_id,callback);
    },

    getPOSForAgingModel : function(officeId,productCategoryId,loanOfficer,callback) {
        this.dataModel.getPOSForAgingDataModel(officeId,productCategoryId,loanOfficer,callback);
    },

    getCashBalanceModel : function(officeId,finYear,callback) {
        this.dataModel.getCashBalanceDataModel(officeId,finYear,callback);
    },
    loadRescheduledGroupsModel : function(officeId,userId,callback){
        this.dataModel.loadRescheduledGroupsDataModel(officeId,userId,callback);
    },

    retrieveRescheduledGroupsModel : function(officeId,userId,groupAccNum,callback){
        this.dataModel.retrieveRescheduledGroupsDataModel(officeId,userId,groupAccNum,callback);
    },
    checkExistingUserModel : function(user_name,callback) {
        this.dataModel.checkExistingUserDataModel(user_name,callback);
    },
    assignGroupToROModel: function(accountId,roId,callback){
        this.dataModel.assignGroupToRODataModel(accountId,roId,callback);
    },
    reportManagementModel : function(tenantId,officeId,userId,callback){
        this.dataModel.reportManagementDataModel(tenantId,officeId,userId,callback);
    },
    generateReportModel  : function(startdate,enddate,statusId,officeId,userId,callback){
        this.dataModel.generateReportDataModel(startdate,enddate,statusId,officeId,userId,callback);
    },
    //Adarsh
    generateEquifaxReportModel  : function(tenantId,userId,officeId,callback){
        this.dataModel.generateEquifaxReportDataModel(tenantId,userId,officeId,callback);
    },
    generateEquifaxReportClientsModel  : function(tenantId,groupId,callback){
        this.dataModel.generateEquifaxReportClientsDataModel(tenantId,groupId,callback);
    },
    downloadClientEquifaxReportModel  : function(tenantId,clientId,callback){
        this.dataModel.downloadClientEquifaxReportDataModel(tenantId,clientId,callback);
    },
    //document verification for Loan Sanction
    docVerificationCallModel : function(iklantGroupId,docVerificationFlag,callback){
        this.dataModel.docVerificationCallDataModel(iklantGroupId,docVerificationFlag,callback);
    },
    //document verification Group List
    generateDocVerificationGroupsCallModel:function(tenantId,officeId,userId,callback){
        this.dataModel.generateDocVerificationGroupsCallDataModel(tenantId,officeId,userId,callback);
    },
    listNPASearchGroupModel : function(tenantId,recoveryOfficer,capabilityPercentage,isLeaderTraceableID,reasonForNPA,
                                       overdueDurationFrom,overdueDurationTo,amountFrom,amountTo,branch,callback) {
        this.dataModel.listNPASearchGroupDatamodel(tenantId,recoveryOfficer,capabilityPercentage,isLeaderTraceableID,
            reasonForNPA,overdueDurationFrom,overdueDurationTo,amountFrom,amountTo,branch,callback);
    },

    getNPAReasonsModel : function(tenantId,userId, callback) {
        this.dataModel.getNPAReasonsDatamodel(tenantId,userId, callback);
    },

    npaDefaultSearchModel: function(userId, callback) {
        this.dataModel.getNPADefaultSearchDatamodel(userId,callback);
    },

    getNpaCaseStatusModel: function(tenantId,callback) {
        this.dataModel.getNpaCaseStatusDatamodel(tenantId,callback);
    },

    getNpaCaseModel: function(userId,date,callback) {
        this.dataModel.getNpaCaseDatamodel(userId,date,callback);
    },

    getNpaClosedCaseModel: function(userId,date,callback) {
        this.dataModel.getNpaClosedCaseDatamodel(userId,date,callback);
    },

    submitNpaCaseModel: function(taskId,taskRemarks,callback) {
        this.dataModel.submitNpaCaseDatamodel(taskId,taskRemarks,callback);
    },
    //NPA LR
    getGroupsForRecoveryModel : function(userId,callback) {
        this.dataModel.getGroupsForRecoveryDataModel(userId,callback);
    },

    updateVerifiedInformationModel : function(accountId,statusId,reason,remarks,capabilitypercentage,expecteddate,otherReason,answerOne,answerTwo,answerThree,answerFour,answerFive,answerSix,answerSeven,flag,userId,todoActivity,todoDueDate,todoDueTime,callback){
        this.dataModel.updateVerifiedInformationDataModel(accountId,statusId,reason,remarks,capabilitypercentage,expecteddate,otherReason,answerOne,answerTwo,answerThree,answerFour,answerFive,answerSix,answerSeven,flag,userId,todoActivity,todoDueDate,todoDueTime,callback);
    },
    //upload File
    updateFileLocationModel : function(accountId,fileName,selectedClientId,callback){
        this.dataModel.updateFileLocationDataModel(accountId,fileName,selectedClientId,callback);
    },
    retrieveClientDetailsPageModel : function(accountId,callback) {
        this.dataModel.retrieveClientDetailsDataModel(accountId,callback);
    },
    retrieveUploadedDocsPageModel : function(accountId,clientId,callback) {
        this.dataModel.retrieveUploadedDocsPageDataModel(accountId,clientId,callback);
    },
    getGroupDetailModel: function(userId, callback){
        this.dataModel.getGroupDetailDataModel(userId, callback);
    } ,
    callOfficeAndPersonnelForBC: function(bcOfficeId , callback){
        this.dataModel.getcallOfficeAndPersonnelForBC(bcOfficeId, callback)
    }
};