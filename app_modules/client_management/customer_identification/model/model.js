var path = require('path');
var applicationHome = path.dirname(process.mainModule.filename);
model = function(datamodel) {
	this.datamodel = datamodel;
};

model.prototype = {
	/*listNPASearchGroupModel : function(tenantId,recoveryOfficer,capabilityPercentage,isLeaderTraceableID,reasonForNPA,
					overdueDurationFrom,overdueDurationTo,amountFrom,amountTo,branch,callback) {
		this.datamodel.listNPASearchGroupDatamodel(tenantId,recoveryOfficer,capabilityPercentage,isLeaderTraceableID,
				reasonForNPA,overdueDurationFrom,overdueDurationTo,amountFrom,amountTo,branch,callback);
	},
	
	getNPAReasonsModel : function(tenantId,userId, callback) {
		this.datamodel.getNPAReasonsDatamodel(tenantId,userId, callback);
	},
	
	npaDefaultSearchModel: function(userId, callback) {
		this.datamodel.getNPADefaultSearchDatamodel(userId,callback);
	},
	
	getNpaCaseStatusModel: function(tenantId,callback) {
		this.datamodel.getNpaCaseStatusDatamodel(tenantId,callback);
	},
	
	getNpaCaseModel: function(userId,date,callback) {
		this.datamodel.getNpaCaseDatamodel(userId,date,callback);
	},
	
	getNpaClosedCaseModel: function(userId,date,callback) {
		this.datamodel.getNpaClosedCaseDatamodel(userId,date,callback);
	},
	
	submitNpaCaseModel: function(taskId,taskRemarks,callback) {
		this.datamodel.submitNpaCaseDatamodel(taskId,taskRemarks,callback);
	},
	//NPA LR
	getGroupsForRecoveryModel : function(userId,callback) {
		this.datamodel.getGroupsForRecoveryDataModel(userId,callback);
	},

	updateVerifiedInformationModel : function(accountId,statusId,reason,remarks,capabilitypercentage,expecteddate,otherReason,answerOne,answerTwo,answerThree,answerFour,answerFive,answerSix,answerSeven,flag,userId,todoActivity,todoDueDate,todoDueTime,callback){
		this.datamodel.updateVerifiedInformationDataModel(accountId,statusId,reason,remarks,capabilitypercentage,expecteddate,otherReason,answerOne,answerTwo,answerThree,answerFour,answerFive,answerSix,answerSeven,flag,userId,todoActivity,todoDueDate,todoDueTime,callback);
	},
	//upload File
	updateFileLocationModel : function(accountId,fileName,selectedClientId,callback){
		this.datamodel.updateFileLocationDataModel(accountId,fileName,selectedClientId,callback);
	},*/

	/*retrieveClientDetailsPageModel : function(accountId,callback) {
		this.datamodel.retrieveClientDetailsDataModel(accountId,callback);
	},
	retrieveUploadedDocsPageModel : function(accountId,clientId,callback) {
		this.datamodel.retrieveUploadedDocsPageDataModel(accountId,clientId,callback);
	},*/

	/*// TODO: Business Layer
	authLoginModel: function(userName,password,callback) {
		this.datamodel.authLoginAcess(userName,password,callback);
	},*/

	/*reintiateClientModel: function(tenantId,clientId,remarksForReintiate,groupStatusID,clientStatus, groupId, roleId, callback){
			this.datamodel.reintiateClientDataModel(tenantId,clientId,remarksForReintiate,groupStatusID,clientStatus, groupId, roleId, callback);
	},*/

	/*listQuestionsCCACallModel: function(tenantId,clientId,clientLoanCount,callback) {
		this.datamodel.listQuestionsCCACallDataModel(tenantId,clientId,clientLoanCount,callback);
	},*/
	
	getFONamesModel: function(officeId,callback) {
		this.datamodel.getFONamesDataModel(officeId,callback);
	},
	
	/*reinitiateGroupModel: function(groupId,remarks,callback) {
		this.datamodel.reinitiateGroupDatamodel(groupId,remarks,callback);
	},*/

	/*saveQuestionModel: function(tenantId,submitId,callback) {
		this.datamodel.saveQuestionDataModel(tenantId,submitId,callback);
	},*/
	
	/*addQuestionsModel: function(tenantId,callback) {
		this.datamodel.addQuestionsDataModel(tenantId,callback);
	},*/
	
	/*questionsSelectModel: function(tenantId,selectedQuestionId,callback) {
		this.datamodel.questionsSelectDataModel(tenantId,selectedQuestionId,callback);
	},*/
	
	/*calculateSecondaryAppraisalModel: function(tenantId,clientId,secondaryQuestionIdRouter,selectedAnswerArray,callback) {
		this.datamodel.calculateSecondaryAppraisalDataModel(tenantId,clientId,secondaryQuestionIdRouter,selectedAnswerArray,callback);
	},*/
	
	/*skipKycUploadModel: function(groupId,callback) {
		this.datamodel.skipKycUploadDatamodel(groupId,callback);
	},*/
	
	/*groupDetailsAuthorizationModel: function(tenantId,branchId,groupId,clientId,callback) {
		this.datamodel.groupDetailsAuthorizationDatamodel(tenantId,branchId,groupId,clientId,callback);
	},*/
	
	/*getClientNamesModelForRejectedGroups: function(groupId,callback) {
		this.datamodel.getClientNamesForRejectedGroups(groupId,callback);
	},*/

	/*getFieldVerificationDetailsModel: function(clientId,callback) {
		this.datamodel.getFieldVerificationDetails(clientId,callback);
	},*/

	/*listClientsForLoanSanctionModel : function(groupId,mifosCustomerId,callback) {
		this.datamodel.getClientNamesForLoanSanction(groupId,mifosCustomerId,callback);
	},*/

	/*//document verification for Loan Sanction
	docVerificationCallModel : function(iklantGroupId,docVerificationFlag,callback){
		this.datamodel.docVerificationCallDataModel(iklantGroupId,docVerificationFlag,callback);
	},
	//document verification Group List 	
	generateDocVerificationGroupsCallModel:function(tenantId,officeId,userId,callback){
		this.datamodel.generateDocVerificationGroupsCallDataModel(tenantId,officeId,userId,callback);
	},*/
	
	/*updateClientStatusModel : function(clientIdListArray,clientIds,overdues,callback){
		this.datamodel.updateClientStatusDataModel(clientIdListArray,clientIds,overdues,callback);
	},*/
	/*showDashBoardModel : function(tenantId,officeId,callback) {
		this.datamodel.showDashBoardDataModel(tenantId,officeId,callback);
	},*/
	/*populateGroupsModel: function(tenantId,officeId,userId,statusid,callback){
		this.datamodel.populateGroupsDataModel(tenantId,officeId,userId,statusid,callback);
	},*/
	/*populateRejectedGroupsModel: function(tenantId,officeId,userId,statusid,callback){
		this.datamodel.populateRejectedGroupsDataModel(tenantId,officeId,userId,statusid,callback);
	},

	/*groupDetailsModel: function(tenant_id,office_id,callback) {
		this.datamodel.groupDetails(tenant_id,office_id,callback);
	},
	
	memberDetailsModel: function(tenant_id,office_id,callback) {
		this.datamodel.memberDetails(tenant_id,office_id,callback);
	},*/
	
	/*availableDocumentDetailsModel: function(tenant_id,office_id,callback) {
		this.datamodel.availableDocumentDetailsDatamodel(tenant_id,office_id,callback);
	},*/
	
	iklanToAndroidDetailsModel: function(tenant_id,office_id,user_id,role_id,callback) {
		this.datamodel.iklanToAndroidDetailsDatamodel(tenant_id,office_id,user_id,role_id,callback);
	},

	/*documentDetailsModel: function(tenant_id,callback) {
		this.datamodel.documentDetails(tenant_id,callback);
	},	*/
	
	//temporary function for apex camera recept capture. to be removed once LR android app is ready.
	insertdocumentDetailsModel: function(captured_image,client_id,doc_type_id,doc_name,group_id,callback) {
		this.datamodel.insertdocumentDetails(captured_image,client_id,doc_type_id,doc_name,group_id,callback);
	},

	saveRegisterUserModel: function(tenantName,tenantAddress,callback) {
		this.datamodel.saveRegisterUser(tenantName,tenantAddress,callback);
	},
	
	/*saveGroupGroupModel: function(userId,officeId,areaCodeId,prosGroup,callback) {
		this.datamodel.saveGroup(userId,officeId,areaCodeId,prosGroup,callback);
	},*/

	/*showPreliminaryVerificationModel: function(groupId,callback) {
		this.datamodel.showPreliminaryVerification(groupId,callback);
	},*/
	
	/*preVerificationDocumentUploadModel: function(groupId,fileName,docTypeId,callback) {
		this.datamodel.preVerificationDocumentUpload(groupId,fileName,docTypeId,callback);
	},*/
	
	/*KYC_UploadingModel: function(group_id,callback) {
		this.datamodel.KYC_Uploading(group_id,callback);
	},*/
	
	/*storeCapturedImageModel: function(client_id,doc_type_id,image,fileName,callback) {
		this.datamodel.storeCapturedImage(client_id,doc_type_id,image,fileName,callback);
	},*/
	
	/*storePreliminaryVerificationCapturedImageModel: function(groupId,doc_type_id,image,fileName,callback) {
		this.datamodel.storePreliminaryVerificationCapturedImage(groupId,doc_type_id,image,fileName,callback);
	},*/
	
	/*KYC_UploadingImageModel: function(client_id,doc_type_id,image,fileName,callback) {
		this.datamodel.KYC_UploadingImage(client_id,doc_type_id,image,fileName,callback);
	},*/
	
	/*showPreliminaryVerificationUploadModel: function(groupId,callback) {
		this.datamodel.showPreliminaryVerificationUpload(groupId,callback);
	},*/

	/*saveKycUploadModel: function(groupId,callback) {
		this.datamodel.saveKycUpload(groupId,callback);
	},*/
	/*saveAssignFOModel: function(foName,assignGroupIds,callback) {
		this.datamodel.saveAssignFO(foName,assignGroupIds,callback);
	},*/
	
	/*cca1RejectClientsModel: function(rejectedClientName,remarksToReject, roleId, callback) {
		this.datamodel.cca1RejectClients(rejectedClientName,remarksToReject, roleId, callback);
	},*/
	/*cca1approvedGroupModel: function(rejectedClientName,approvedGroupName,callback) {
		this.datamodel.cca1approvedGroup(rejectedClientName,approvedGroupName,callback);
	},
	cca1rejectedGroupModel: function(approvedGroupName,callback) {
		this.datamodel.cca1rejectedGroup(approvedGroupName,callback);
	},
	checkForAlreadyExistingmemberModel : function(tenantId,rationCardNumber,contactNumber,voterId,aadhaarNumber,callback) {
		this.datamodel.checkForAlreadyExistingmemberDatamodel(tenantId,rationCardNumber,contactNumber,voterId,aadhaarNumber,callback);
	},*/

	/*reportManagementModel : function(tenantId,officeId,userId,callback){
        this.datamodel.reportManagementDataModel(tenantId,officeId,userId,callback);
	},
	generateReportModel  : function(startdate,enddate,statusId,officeId,userId,callback){
		this.datamodel.generateReportDataModel(startdate,enddate,statusId,officeId,userId,callback);
	},
	//Adarsh
	generateEquifaxReportModel  : function(tenantId,userId,officeId,callback){
		this.datamodel.generateEquifaxReportDataModel(tenantId,userId,officeId,callback);
	},
	generateEquifaxReportClientsModel  : function(tenantId,groupId,callback){
		this.datamodel.generateEquifaxReportClientsDataModel(tenantId,groupId,callback);
	},
	downloadClientEquifaxReportModel  : function(tenantId,clientId,callback){
		this.datamodel.downloadClientEquifaxReportDataModel(tenantId,clientId,callback);
	},*/
	/*downloadRequstedImageModel  : function(tenantId,clientId,docId,callback){
		this.datamodel.downloadRequstedImageDataModel(tenantId,clientId,docId,callback);
	},*/
	//End By Adarsh
	
	/*performanceManagementModel : function(tenantId,callback){
		this.datamodel.performanceManagementDataModel(tenantId,callback);
	},*/
	
	/*//Ramya
	synchronizeModel: function(groupId,callback) {
		this.datamodel.toInsertGroup(groupId,callback);
	},*/
	insertMFICustomerIdModel : function(groupId,groupAccountId,callback){
        this.datamodel.insertMFICustomerIdDataModel(groupId,groupAccountId,callback);
    },
	
	//New Admin Screen
	
	//Manage Users
	/*retriveOfficeModel : function(tenantId,userId,callback) {
		this.datamodel.retriveOfficeDatamodel(tenantId,userId,callback);
	},*/
	/*retrieveStateModel : function(callback) {
		this.datamodel.retriveStateDatamodel(callback);
	},*/
	/*getUsersModel: function(tenantId,callback) {
		this.datamodel.getUsersDatamodel(tenantId,callback);
	},*/
	
	/*getRolesModel: function(tenantId,callback) {
		this.datamodel.getRolesDatamodel(tenantId,callback);
	},*/
   /* // Dhinakaran
    saveUserModel: function (tenantId, officeId, userName, password, contactNumber, emailId, roleIdArray, userId, imeiNumberId, callback) {
        this.datamodel.saveUserDatamodel(tenantId, officeId, userName, password, contactNumber, emailId, roleIdArray, userId, imeiNumberId, callback);
    },
    //   Dhinakaran
    updateUserModel: function (tenantId, currentUserId, officeId, userName, password, contactNumber, emailId, roleId, userId, imeiNumberId, callback) {
        this.datamodel.updateUserDatamodel(tenantId, currentUserId, officeId, userName, password, contactNumber, emailId, roleId, userId, imeiNumberId, callback);
    },
	populateUserDetailsModel: function(tenantId,userId,callback) {
		this.datamodel.populateUserDetailsDatamodel(tenantId,userId,callback);
	},
	deleteUserModel  : function(userid,tenantId,callback){
		this.datamodel.deleteUserDataModel(userid,tenantId,callback);
	},
	
	//Manage Office
	saveOfficeModel: function(tenantId,officeName,officeShortName,officeAddress,userId,stateId,callback) {
		this.datamodel.saveOfficeDatamodel(tenantId,officeName,officeShortName,officeAddress,userId,stateId,callback);
	},
	
	updateOfficeModel: function(tenantId,officeId,officeName,officeShortName,officeAddress,userId,callback) {
		this.datamodel.updateOfficeDatamodel(tenantId,officeId,officeName,officeShortName,officeAddress,userId,callback);
	},
	populateOfficeDetailsModel: function(tenantId,officeId,callback) {
		this.datamodel.populateOfficeDetailsDatamodel(tenantId,officeId,callback);
	},
	deleteOfficeModel: function(officeid,tenantId,callback){
		this.datamodel.deleteOfficeDataModel(officeid,tenantId,callback);
	},
*/	//for androidtoiklant
	retrieveClientNameModel :function(clientId,callback) {
		this.datamodel.retrieveClientNameDataModel(clientId,callback);
	},
	/*getGroupDetailModel: function(userId, callback){
		this.datamodel.getGroupDetailDataModel(userId, callback);
	}*/
    /*getLRBranchCallModel: function(userId, callback){
        this.datamodel.getLRBranchCallModelDataModel(userId, callback);
    },
    getLRGroupDetailModel: function(officeValue,userId1, callback){
        this.datamodel.getLRGroupDetailDataModel(officeValue,userId1, callback);
    },
    getLRFoDetailCallModel: function (officeValue, callback){
        this.datamodel.getLRFoDetailDataModel(officeValue, callback);
    },
    assignGroupToFOModel: function(customerId,loanRecoveryOfficer,iklantGroupId,callback){
        this.datamodel.assignGroupToFODataModel(customerId,loanRecoveryOfficer,iklantGroupId,callback);
    },*/
    /*assignGroupToROModel: function(accountId,roId,callback){
		this.datamodel.assignGroupToRODataModel(accountId,roId,callback);
	},*/

    /*// Added by Chitra
    retrieveLedgerDetailsModel : function(tenantId,officeId,ledger_name,userId,callback) {
        this.datamodel.retrieveLedgerDetailsDataModel(tenantId,officeId,ledger_name,userId,callback);
    },

    insuranceCoverReportModel: function(tenantId,startDate,endDate,officeId,userId,callback) {
        this.datamodel.insuranceCoverReportDatamodel(tenantId,startDate,endDate,officeId,userId,callback);
    },

    bankBookReportModel: function(finYearId,tenantId,officeId,startDate,endDate,selected_ledger_name,selected_ledger_id,mfiOperation,accOperation,userId,callback) {
        this.datamodel.bankBookReportDatamodel(finYearId,tenantId,officeId,startDate,endDate,selected_ledger_name,selected_ledger_id,mfiOperation,accOperation,userId,callback);
    },
    cashBookReportModel: function(finYearId,tenantId,officeId,startDate,endDate,selected_ledger_name,selected_ledger_id,mfiOperation,accOperation,userId,callback) {
        this.datamodel.cashBookReportDatamodel(finYearId,tenantId,officeId,startDate,endDate,selected_ledger_name,selected_ledger_id,mfiOperation,accOperation,userId,callback);
    },
    generateReportWithOfficeDateModel: function(tenantId,officeId,startDate,endDate,selected_product_id,selected_category_id,selected_field_off_id,reportPageName,finYearId,userId,callback) {
        if(reportPageName == "loanDisbursalNewReport"){
            this.datamodel.loanDisbursalReportDatamodel(tenantId,officeId,startDate,endDate,selected_product_id,selected_category_id,selected_field_off_id,userId,callback);
        }else if(reportPageName == "loanDisbursalSummaryReport"){
            this.datamodel.loanDisbursalSummaryReportDatamodel(tenantId,officeId,startDate,endDate,selected_product_id,selected_category_id,selected_field_off_id,userId,callback);
        }else if(reportPageName == "loanRepaymentReport"){
            this.datamodel.loanRepaymentReportDatamodel(tenantId,officeId,startDate,endDate,selected_product_id,selected_category_id,selected_field_off_id,userId,callback);
        }else if(reportPageName == "loanRepaymentSummaryReport"){
            this.datamodel.loanRepaymentSummaryReportDatamodel(tenantId,officeId,startDate,endDate,selected_product_id,selected_category_id,selected_field_off_id,userId,callback);
        }else if(reportPageName == "loanTransactionReport"){
            this.datamodel.loanTransactionReportDatamodel(tenantId,officeId,startDate,endDate,selected_product_id,selected_category_id,selected_field_off_id,userId,callback);
        }else if(reportPageName == "loanRescheduledReport"){
            this.datamodel.loanRescheduledReportDatamodel(tenantId,officeId,startDate,endDate,selected_product_id,selected_category_id,selected_field_off_id,userId,callback);
        }else if(reportPageName == "loanWrittenOffReport"){
            this.datamodel.loanWrittenOffReportDatamodel(tenantId,officeId,startDate,endDate,selected_product_id,selected_category_id,selected_field_off_id,userId,callback);
        }else if(reportPageName == "profitLossReport"){
            this.datamodel.profitLossReportDatamodel(tenantId,-1,startDate,endDate,finYearId,userId,callback);
        }else if(reportPageName == "closedAccountsReport"){
            this.datamodel.closedAccountsReportDatamodel(tenantId,officeId,startDate,endDate,selected_product_id,selected_category_id,selected_field_off_id,userId,callback);
        }else if(reportPageName == "delayedPaymentReport"){
            this.datamodel.closedAccountsReportDatamodel(tenantId,officeId,startDate,endDate,selected_product_id,selected_category_id,selected_field_off_id,userId,callback);
        }
    },
    generateReportWithOfficeDateCustomerAccountDateModel: function(tenantId,officeId,startDate,endDate,customer,accountNo,selected_product_id,selected_category_id,selected_field_off_id,reportPageName,includePrevOperation,userId,callback) {
        if(reportPageName == "groupOutstandingReport"){
            this.datamodel.groupOutstandingReportDatamodel(tenantId,officeId,startDate,endDate,customer,accountNo,selected_product_id,selected_category_id,selected_field_off_id,userId,callback);
        }else if(reportPageName == "groupLedgerReport" || reportPageName == "groupLedgerInterestReport"){
            this.datamodel.groupLedgerReportDatamodel(tenantId,officeId,startDate,endDate,customer,accountNo,selected_product_id,selected_category_id,selected_field_off_id,reportPageName,includePrevOperation,userId,callback);
        }else if(reportPageName == "activeGMReport"){
            this.datamodel.activeGMReportDatamodel(tenantId,officeId,startDate,endDate,customer,accountNo,selected_product_id,selected_category_id,selected_field_off_id,userId,callback);
        }else if(reportPageName == "createdGMSummaryReport"){
            this.datamodel.createdGMSummaryReportDatamodel(tenantId,officeId,startDate,endDate,customer,accountNo,selected_field_off_id,userId,callback);
        }else if(reportPageName == "overDueClientWiseReport"){
            this.datamodel.createdGMSummaryReportDatamodel(tenantId,officeId,startDate,endDate,customer,accountNo,userId,callback);
        }else if(reportPageName == "delayedPaymentReport"){
            this.datamodel.delayedPaymentReportDatamodel(tenantId,officeId,startDate,endDate,customer,accountNo,selected_product_id,selected_category_id,selected_field_off_id,userId,callback);
        }else if(reportPageName == "groupOutstandingClientWiseReport"){
            this.datamodel.groupOutstandingClientWiseReportDatamodel(tenantId,officeId,startDate,endDate,customer,accountNo,selected_product_id,selected_category_id,selected_field_off_id,userId,callback);
        }
    },
    accountDefaultPaymentsReportModel: function(tenantId,officeId,endDate,customer,accountNo,selected_product_id,selected_category_id,selected_field_off_id,reportPageName,userId,callback) {
        if(reportPageName == "loanAccountDefaultPaymentsReport"){
            this.datamodel.loanAccountDefaultPaymentsReportDatamodel(tenantId,officeId,endDate,customer,accountNo,selected_product_id,selected_category_id,selected_field_off_id,reportPageName,userId,callback);
        }else if(reportPageName == "groupAccountDefaultPaymentsReport"){
            this.datamodel.groupAccountDefaultPaymentsReportDatamodel(tenantId,officeId,endDate,customer,accountNo,selected_product_id,selected_category_id,selected_field_off_id,reportPageName,userId,callback);
        }
    },
    // Ended by chitra

    getTrailBalanceModel: function(financialYearId,startDate,endDate,officeId,reportId,accOperation,mfiOperation,callBack){
        this.datamodel.getTrailBalanceReportDatamodel (financialYearId,startDate,endDate,officeId,reportId,accOperation,mfiOperation,callBack);
    },

    getOverdueSummaryModel: function(toDate,officeId,category,loan_product,personnelId,loanStatus,customer,loanAccount,npaIndicator,daysInArrearsAbove,totalOverdueAbove,userId,callBack){
        this.datamodel.getOverdueSummaryDataModel(toDate,officeId,category,loan_product,personnelId,loanStatus,customer,loanAccount,npaIndicator,daysInArrearsAbove,totalOverdueAbove,userId,callBack);
    },

    getDemandCollectionSummaryModel : function(fromDate, toDate, officeId,loanOfficerId,productCategoryId,loanProductId,customer,account,reportCategory, reportId, individual_tracked, userId,callBack){
        this.datamodel.getDemandCollectionSummary(fromDate, toDate, officeId,loanOfficerId,productCategoryId,loanProductId,customer,account,reportCategory, reportId, individual_tracked, userId,callBack);
    },

    retrieveLoanProductAndCategoryModel : function(tenantId,callBack){
        this.datamodel.retrieveLoanProductAndCategoryDatamodel(tenantId,callBack);
    },

    getGeneralLedgerSummaryModel : function(fromDate, toDate, officeId, selected_ledger_name, ledger_id, accOperation,mfiOperation,userId,callBack){
        this.datamodel.getGeneralLedgerSummaryDataModel(fromDate, toDate, officeId, selected_ledger_name, ledger_id, accOperation,mfiOperation,userId,callBack);
    },

    getVoucherOrReceiptOrLoanDP : function(fromDate,toDate,officeId,loanOfficerId,category,loanProduct,accOperation,mfiOperation,reportId,userId,callBack){
        var constantsRequire = require(path.join(applicationHome,"/app_modules/dto/common/Constants"));
        var constants = new constantsRequire();
        if(reportId == constants.getLoanDisbursementAndRepaymentSummary()){
            this.datamodel.getLoanDisbursementAndRepaymentSummaryDataModel(fromDate,toDate,officeId,loanOfficerId,category,loanProduct,userId,callBack);
        }
        else{
            this.datamodel.getVoucherOrReceipt(fromDate, toDate, officeId,accOperation,mfiOperation,reportId,userId,callBack);
        }
    },

    getPrincipalOutstandingModel : function(toDate, officeId,productCategoryId,loanProductId,loanOfficerId,customer,account, reportId,includePrevOperation,userId,callBack){
        this.datamodel.getPrincipalOutstandingDataModel(toDate, officeId,productCategoryId,loanProductId,loanOfficerId,customer,account,reportId, includePrevOperation,userId,callBack);
    },

    getDEOActivityTrackingModel : function(fromDate,toDate,officeId,customer,roleId,userId,callBack){
        this.datamodel.getDEOActivityTrackingDataModel(fromDate,toDate,officeId,customer,roleId,userId,callBack);
    },

    getPARReportModel : function(toDate,officeId,daysInArrears,reportId, userId,callBack){
        this.datamodel.getPARReportDataModel(toDate,officeId,daysInArrears,reportId,userId,callBack);
    },
    getLUCTrackingReportModel : function(fromDate,toDate,officeId,roleId,download_report,userId,callBack){
        this.datamodel.getLUCTrackingReportDataModel(fromDate,toDate,officeId,roleId,download_report,userId,callBack);
    },*/

    /*getActiveOrRejectedClientsModel: function(group_id,callBack){
        this.datamodel.getActiveOrRejectedClientsDataModel(group_id,callBack);
    },*/

   /* getReportStatusModel: function(reportId,callBack){
        this.datamodel.getReportStatusDataModel(reportId,callBack);
    },

    reportsMenuModel : function(reportCategoryId, roleId, callBack){
        this.datamodel.reportsMenuDataModel(reportCategoryId, roleId, callBack);
    } ,

    getGroupsForBackGroundVerificationModel : function(officeId,callback){
        this.datamodel.getGroupsForBackGroundVerificationDataModel(officeId,callback);
    },

    retrieveClientDetailsForVerificationPageModel : function(parent_customer_id,callback) {
        this.datamodel.retrieveClientDetailsForVerificationPageDataModel(parent_customer_id,callback);
    },

    getPOSForAgingModel : function(officeId,productCategoryId,loanOfficer,callback) {
        this.datamodel.getPOSForAgingDataModel(officeId,productCategoryId,loanOfficer,callback);
    },

    getCashBalanceModel : function(officeId,finYear,callback) {
        this.datamodel.getCashBalanceDataModel(officeId,finYear,callback);
    },*/

    /*checkExistingUserModel : function(user_name,callback) {
        this.datamodel.checkExistingUserDataModel(user_name,callback);
    },*/
// Ended by Chitra

    //Added by Ezra Johnson
    /*getKYCUploadStatusModel: function(groupId, callback){
        this.datamodel.getKYCUploadStatusDataModel(groupId, callback);
    },*/
   /* moveForDataEntryModel: function(groupId, callback){
        this.datamodel.moveForDataEntryDataModel(groupId, callback);
    },*/

   /* getGroupRecognitionTestDetailsModel: function(groupId,callback) {
        this.datamodel.getGroupRecognitionTestDetailsDataModel(groupId,callback);
    },*/
    /*saveRatingForGRTModel: function(groupId,questionIdDetails,createdBy,checkedOrNotDetails,totalRating,remarks, callback) {
        this.datamodel.saveRatingForGRTDataModel(groupId,questionIdDetails,createdBy,checkedOrNotDetails,totalRating,remarks, callback);
    },*/
	/*getCurrentPositionModel : function(userId,callback){
        this.datamodel.getCurrentPositionDataModel(userId,callback);
    },*/

    /*//Added by SathishKumar 008[Change Password]
    changePasswordCall : function(userId,userName,encyptedOldPassword,encyptedNewPassword, callback){
        this.datamodel.changePasswordDataModelCall(userId,userName,encyptedOldPassword,encyptedNewPassword,callback);
    } ,*/
    /*loadRescheduledGroupsModel : function(officeId,userId,callback){
        this.datamodel.loadRescheduledGroupsDataModel(officeId,userId,callback);
    },

    retrieveRescheduledGroupsModel : function(officeId,userId,groupAccNum,callback){
        this.datamodel.retrieveRescheduledGroupsDataModel(officeId,userId,groupAccNum,callback);
    }*/
	/*rejectIdleClientsModel: function(clientId, callback) {
		this.datamodel.rejectIdleClientsDataModel(clientId, callback);
	},*/
	/*rejectIdleGroupModel: function(groupId, callback) {
		this.datamodel.rejectIdleGroupDataModel(groupId, callback);
	},
	approveIdleGroupModel: function(groupId, statusId, callback) {
		this.datamodel.approveIdleGroupDataModel(groupId, statusId, callback);
	},*/
    //Ezra Johnson
    /*getClientPaymentsDetailModel: function(paymentCollectionId,callback){
        this.datamodel.getClientPaymentsDetailDataModel(paymentCollectionId,callback);
    },*/
    /*approveOrRejectClientForNextLoanCallModel: function(iklantGroupId,userId,callback){
        this.datamodel.approveOrRejectClientForNextLoanDataModel(iklantGroupId,userId,callback);
    }*/
};

exports.model = model;