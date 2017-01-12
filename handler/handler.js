module.exports = handler;

function handler(newModulesReferences) {
	// TODO: Request Handlers
    var server = newModulesReferences[0];
    var commonRouter = newModulesReferences[1];
    var loanDisbursementRouter = newModulesReferences[2];
    var shortMessagingRouter = newModulesReferences[3];
    var accountingRouter = newModulesReferences[4];
    var androidRouter = newModulesReferences[5];
    var routerReports = newModulesReferences[6];
    var groupManagementRouter = newModulesReferences[8];
    var path = require('path');
	var props = require(path.dirname(process.mainModule.filename)+"/"+"properties.json");

	var datamodel = require(path.join(path.dirname(process.mainModule.filename),"/app_modules/client_management/customer_identification/model/datamodel")).datamodel;
	var model = require(path.join(path.dirname(process.mainModule.filename),"/app_modules/client_management/customer_identification/model/model")).model;
	var router = require(path.join(path.dirname(process.mainModule.filename),"/app_modules/client_management/customer_identification/router/router"));


    var datamodelReports = require(path.join(path.dirname(process.mainModule.filename),"/app_modules/reports/model/datamodelReports")).datamodelReports;
	// Create Data Access Layer
	var datamodel = new datamodel();

    var datamodelReports = new datamodelReports();
	
	// Create Business Layer
	var ciModel = new model(datamodel);

	// Create Router
	var route = new router(ciModel,datamodel);

    route.commonRouter = commonRouter;
    route.loanDisbursementRouter = loanDisbursementRouter;
    route.shortMessagingRouter = shortMessagingRouter;
    route.accountingRouter = accountingRouter;
    route.androidRouter = androidRouter;
    route.groupManagementRouter = groupManagementRouter;
    route.groupManagementModel = groupManagementRouter.model;
    datamodel.commonDataModel = commonRouter.model.dataModel;
    routerReports.dataModel = datamodel;

	// REST Calls
	server.get('/', function (req, res) {
		res.send('Server is running..');
	});

    /*// Added by Chitra for the Reports Management
        server.get(props.contextPath+'/client/ci/reportsMenu',route.reportsMenu.bind(route));
        server.get(props.contextPath+'/client/ci/reportsMenuByCategory/:categoryId',route.showReportManagementByCategory.bind(route));
        server.get(props.contextPath+'/client/ci/reportManagement',route.reportManagement.bind(route));
        server.get(props.contextPath+'/client/ci/reportManagement/:ledgerValue/:typeOfReport/:categoryOfReport/:reportId',route.reportManagement.bind(route));
        server.post(props.contextPath+'/client/ci/reports/insuranceCoverReport', route.insuranceCoverReportLoad.bind(route));
        server.post(props.contextPath+'/client/ci/reports/bankBookReport', route.bankBookReportLoad.bind(route));
        server.post(props.contextPath+'/client/ci/reports/cashBookReport', route.cashBookReportLoad.bind(route));
        server.post(props.contextPath+'/client/ci/reports/generateReportWithOfficeDate', route.generateReportWithOfficeDateLoad.bind(route));
        server.post(props.contextPath+'/client/ci/reports/generateReportWithOfficeDateCustomerAccount', route.generateReportWithOfficeDateCustomerAccountLoad.bind(route));
        server.post(props.contextPath+'/client/ci/reports/accountDefaultPaymentsReport', route.accountDefaultPaymentsReportLoad.bind(route));
        server.get(props.contextPath+'/client/ci/showBackGroundVerification', route.getGroupsForBackGroundVerification.bind(route));
        server.post(props.contextPath+'/client/ci/getGroupsForBackGroundVerification/:branch', route.getGroupsForBackGroundVerification.bind(route));
        server.post(props.contextPath+'/client/ci/retrieveClientDetailsForVerification', route.retrieveClientDetailsForVerification.bind(route));


        // Modified @ Paramasivan
        server.post(props.contextPath+'/client/ci/generateReport', route.generateReport.bind(route));  // Groups in various stages Report

    // Added By Paramasivan for the Reports Management
        server.post(props.contextPath+'/client/ci/loanOfficers',route.loanOfficers.bind(route));
        server.post(props.contextPath+'/client/ci/trailBalance', route.getTrailBalance.bind(route));
        server.post(props.contextPath+'/client/ci/overdueSummary', route.overdueSummary.bind(route));
        server.post(props.contextPath+'/client/ci/demandCollectionSummary',route.demandCollectionSummary.bind(route));
        server.post(props.contextPath+'/client/ci/generalLedger',route.generalLedgerSummary.bind(route));
        server.post(props.contextPath+'/client/ci/voucherOrReceiptOrLoanDisbursementRepayment',route.voucherOrReceiptOrLoanDP.bind(route));
        server.post(props.contextPath+'/client/ci/principalOutstandingSummary',route.principalOutstandingSummary.bind(route));
        server.post(props.contextPath+'/client/ci/DEOActivityTracking',route.DEOActivityTracking.bind(route));
        server.post(props.contextPath+'/client/ci/PARReport',route.PARReport.bind(route));
        server.post(props.contextPath+'/client/ci/LUCTrackingReport',route.LUCTrackingReport.bind(route));*/

	//Commonly used methods for both LD & LR
		///server.post(props.contextPath+'/client/ci/showErrorPage',route.showErrorPage.bind(route));
		////server.post(props.contextPath+'/client/ci/showPageExpired',route.showPageExpired.bind(route));

    //// Added Paramasivan for forgot password
    ////server.post(props.contextPath+'/client/ci/getNewPassword',route.getNewPassword.bind(route));

	/*//NPA Dashboard handler method starts
		server.post(props.contextPath+'/client/ci/viewnpaReport', route.viewnpaReport.bind(route));
		server.post(props.contextPath+'/client/ci/viewNpaAgingReport', route.viewNpaAgingReport.bind(route));
		server.post(props.contextPath+'/client/ci/viewNpaGroupSummaryReport', route.viewNpaGroupSummaryReport.bind(route));
		server.post(props.contextPath+'/client/ci/viewNpaDetailForDefaultDays', route.viewNpaDetailForDefaultDays.bind(route));
		
		server.get(props.contextPath+'/client/ci/viewNpaChartReport', route.viewNpaChartReport.bind(route));
		server.get(props.contextPath+'/client/ci/processNPA', route.processnpa.bind(route));
		server.post(props.contextPath+'/client/ci/process/npa', route.generateNPA.bind(route));
		
		server.get(props.contextPath+'/client/ci/showNPAMenuPage', route.showNPAMenuPage.bind(route));
		server.get(props.contextPath+'/client/ci/showNPAAgingMenuPage', route.showNPAAgingMenuPage.bind(route));
		server.get(props.contextPath+'/client/ci/showNPAGroupSummaryPage', route.showNPAGroupSummaryPage.bind(route));
	//NPA Dashboard handler method Ends*/
	
	
	/*Loan Recovery handler method starts*/
	
		////Loan Recovery For AE
			////server.get(props.contextPath+'/client/ci/searchpage', route.searchpage.bind(route));
		
		//apply payment For FO
			////server.get(props.contextPath+'/client/ci/loanrecoveryLoans', route.loanrecoveryLoans.bind(route));
			////server.post(props.contextPath+'/client/ci/loanrecoveryLoansAjaxCall', route.loanrecoveryLoansAjaxCall.bind(route));
			////server.get(props.contextPath+'/client/ci/pastDueLoans', route.pastDueLoans.bind(route));
			////server.post(props.contextPath+'/client/ci/pastDueLoansAjaxCall', route.pastDueLoansAjaxCall.bind(route));
			////server.get(props.contextPath+'/client/ci/futureDueLoans', route.futureDueLoans.bind(route));
			////server.get(props.contextPath+'/client/ci/dueloansformanager', route.dueLoansForManagerScreens.bind(route));
			////server.post(props.contextPath+'/client/ci/futureDueLoansajax/dateajaxcall', route.futureDueLoansDateAjaxCall.bind(route));
			
			////server.post(props.contextPath+'/client/ci/applyPaymentForFO', route.applyPaymentForFo.bind(route));
			////server.post(props.contextPath+'/client/ci/loanrecovery/doapplypaymentForFO', route.doapplypaymentForFO.bind(route));
			
		    ////server.post(props.contextPath+'/client/ci/syncmifosgroupdetails',route.syncmifosgroupdetails.bind(route));  //android
			////server.post(props.contextPath+'/client/ci/search',route.search.bind(route));
			
			////server.get(props.contextPath+'/client/ci/revertPaymentList', route.revertPaymentList.bind(route));
			////server.post(props.contextPath+'/client/ci/:paymentCollectionId/revertPayment', route.revertPayment.bind(route));
			////server.post(props.contextPath+'/client/ci/retrieveClientAmountDetails', route.retrieveClientAmountDetails.bind(route));
			
			////server.get(props.contextPath+'/client/ci/chequeDepositList', route.chequeDepositList.bind(route));
			////server.post(props.contextPath+'/client/ci/chequeDeposit', route.chequeDeposit.bind(route));
			////server.post(props.contextPath+'/client/ci/doChequeDeposit', route.doChequeDeposit.bind(route));
			////server.get(props.contextPath+'/client/ci/retrieveLoanOfficerList', route.retrieveLoanOfficerList.bind(route));
			
        //Ezra Johnson
        ////server.post(props.contextPath+'/client/ci/groups/member/kycUploadStatus', route.getKYCUploadStatus.bind(route));
        ////server.post(props.contextPath+'/client/ci/groups/member/moveForDataEntry/:groupId', route.moveForDataEntry.bind(route));
		////server.post(props.contextPath+'/client/ci/group/loansanction/previewDateEMI', route.calcPreviewDateEMI.bind(route));
        ////server.post(props.contextPath+'/client/ci/groups/getGroupRecognitionTestDetails', route.getGroupRecognitionTestDetails.bind(route));
        ////server.post(props.contextPath+'/client/ci/groups/submitRatingForGRT', route.submitRatingForGRT.bind(route));
		//loanSanction Document Verification
			////server.post(props.contextPath+'/client/ci/groups/member/docVerification', route.docVerification.bind(route));
			////server.post(props.contextPath+'/client/ci/preclosure', route.preclosure.bind(route));
			////server.post(props.contextPath+'/client/ci/loanrecovery/preclosure/retrievePreclosureInformation', route.retrievePreclosureInformation.bind(route));
			////server.post(props.contextPath+'/client/ci/loanrecovery/preclosure/submitPreclosureInformation', route.submitPreclosureInformation.bind(route));
        /*
        * Author : Baskar030
        * Date   : 28-Nov-2014
        * Module : Individual Preclosure(Loan Recovery)
        * */
        ////server.post(props.contextPath+'/client/ci/individualPreclosure', route.individualPreclosure.bind(route));
        ////server.post(props.contextPath+'/client/ci/individualPreclosure/retrieveIndividualLoanDetails', route.retrieveIndividualLoanDetailsForPreclosure.bind(route));
        ////server.post(props.contextPath+'/client/ci/individualPreclosure/submitIndividualPreclosure', route.submitIndividualPreclosure.bind(route));
			
			////server.post(props.contextPath+'/client/ci/reverse', route.reverse.bind(route));
			////server.post(props.contextPath+'/client/ci/loanrecovery/reverse/submitreverseInformation', route.submitreverseInformation.bind(route));
		
		//Kapil & prabha [TOo Generate PDF Lan sanction form]
			/////server.post(props.contextPath+'/client/ci/groups/member/loansanction/:id/downloadPDF', route.fileUploadFromSynchronized.bind(route));
			////server.post(props.contextPath+'/client/ci/groups/member/loansanction/downloadPDF', route.fileUploadForLS.bind(route));
		
		//kumaran
			////server.get(props.contextPath+'/client/ci/loanrecoveryactiveoffices', route.loanrecoveryactiveoffices.bind(route));
			////server.post(props.contextPath+'/client/ci/loanrecoveryloanofficer', route.loanrecoveryloanofficer.bind(route));
			////server.post(props.contextPath+'/client/ci/loanrecovery/loanofficers/:loanOfficerId/grouplist', route.loanrecoverygrouplist.bind(route));
			////server.post(props.contextPath+'/client/ci/loanrecovery/groups/:globalCustomerNum/loanaccounts', route.loanrecoveryloanaccounts.bind(route));
			/////server.post(props.contextPath+'/client/ci/loanrecovery/loanaccount/:globalAccountNum/loaninformation', route.loanrecoveryloaninformation.bind(route));
			////server.post(props.contextPath+'/client/ci/loanrecovery/applypayment', route.applypayment.bind(route));
			////server.post(props.contextPath+'/client/ci/loanrecovery/doapplypayment', route.doapplypayment.bind(route));
			////server.post(props.contextPath+'/client/ci/loanrecovery/listapplyadjustment', route.listapplyadjustment.bind(route));
			////server.post(props.contextPath+'/client/ci/loanrecovery/applyadjustment', route.applyadjustment.bind(route));
			////server.post(props.contextPath+'/client/ci/loanrecovery/applyadjustmentwhenobligationmet', route.applyadjustmentwhenobligationmet.bind(route));
			////server.post(props.contextPath+'/client/ci/loanrecovery/doapplyadjustment', route.doapplyadjustment.bind(route));
			////server.post(props.contextPath+'/client/ci/loanrecovery/doapplyadjustmentwhenobligationmet', route.doapplyadjustmentwhenobligationmet.bind(route));
			////server.post(props.contextPath+'/client/ci/loanrecovery/editaccountstatus', route.editaccountstatus.bind(route));
			////server.post(props.contextPath+'/client/ci/loanrecovery/doeditaccountstatus', route.doeditaccountstatus.bind(route));
			////server.post(props.contextPath+'/client/ci/loanrecovery/paymentVerificationLoad', route.paymentVerificationLoad.bind(route));
			////server.post(props.contextPath+'/client/ci/loanrecovery/doPaymentVerification', route.doPaymentVerification.bind(route));
			////server.post(props.contextPath+'/client/ci/loanrecovery/downloadPaymentVerificationImage', route.downloadPaymentVerificationImage.bind(route));
			////server.get(props.contextPath+'/client/ci/loanrecovery/chequeBounceLoad', route.chequeBounceLoad.bind(route));
			////server.post(props.contextPath+'/client/ci/loanrecovery/searchChequeBounceLoad', route.searchChequeBounceLoad.bind(route));
			////server.post(props.contextPath+'/client/ci/loanrecovery/revertChequePayment', route.revertChequePayment.bind(route));
		
		//Reports not used
			////server.get(props.contextPath+'/client/ci/reports/loandisbursalReportLoad', route.loanDisbursalReportLoad.bind(route));
			////server.post(props.contextPath+'/client/ci/reports/loanDisbursalReportLoadLoanOfficers', route.loanDisbursalReportLoadLoanOfficers.bind(route));
			////server.post(props.contextPath+'/client/ci/reports/loandisbursalReportLoadDetail', route.loandisbursalReportLoadDetail.bind(route));
			////server.get(props.contextPath+'/client/ci/reports/loanOutstandingReportLoad', route.loanOutstandingReportLoad.bind(route));
			////server.post(props.contextPath+'/client/ci/reports/loanOutstandingReportLoadLoanOfficers', route.loanOutstandingReportLoadLoanOfficers.bind(route));
			////server.post(props.contextPath+'/client/ci/reports/loanOutstandingReportLoadDetail', route.loanOutstandingReportLoadDetail.bind(route));
	/*Loan Recovery handler method ends*/

    ////Added by Sathish Kumar M 008 for Changing FO
        //1//12server.get(props.contextPath+'/client/ci/LRGroups/assignFOLoad',route.assignFOLoad.bind(route));
        //1//11server.post(props.contextPath+'/client/ci/LRGroups/groupsFOLoad',route.groupsFOLoad.bind(route));
        //1//10server.post(props.contextPath+'/client/ci/LRGroups/groupsForFOLoad',route.groupsForFOLoad.bind(route));
        //1//9server.post(props.contextPath+'/client/ci/LRGroups/assignFO',route.assignFO.bind(route));
	//NPA LOANRECOVERY Starts
		////server.get(props.contextPath+'/client/ci/NPALRGroups/assignROLoad',route.assignROLoad.bind(route));
		////server.post(props.contextPath+'/client/ci/NPALRGroups/assignRO',route.assignRO.bind(route));
		/*server.get(props.contextPath+'/client/ci/searchnpa', route.searchNPA.bind(route));
		server.post(props.contextPath+'/client/ci/listsearchednpa', route.listSearchedNPA.bind(route));
		server.post(props.contextPath+'/client/ci/getofficelistajaxcall', route.getOfficeListAjaxcall.bind(route));*/
		
		/*server.get(props.contextPath+'/client/ci/getGroupsForRecovery', route.getGroupsForRecovery.bind(route));
		server.post(props.contextPath+'/client/ci/npaloans/:accountId/updateVerifiedInformation', route.updateVerifiedInformation.bind(route));
		server.post(props.contextPath+'/client/ci/retrieveClientDetails', route.retrieveClientDetails.bind(route));
		server.post(props.contextPath+'/client/ci/npaloans/:accountId/:clientId/uploadFile', route.uploadFile.bind(route));
		server.post(props.contextPath+'/client/ci/retrieveUploadedDocs', route.retrieveUploadedDocs.bind(route));
		server.get(props.contextPath+'/client/ci/NPALRGroups/todo/current',route.NPALRTodoCurrent.bind(route));
		server.get(props.contextPath+'/client/ci/NPALRGroups/todo/future',route.NPALRTodoFuture.bind(route));
		server.get(props.contextPath+'/client/ci/NPALRGroups/todo/overdue',route.NPALRTodoOverdue.bind(route));
		server.get(props.contextPath+'/client/ci/NPALRGroups/todo/closed',route.NPALRTodoClosed.bind(route));
		server.post(props.contextPath+'/client/ci/NPALRGroups/todo/submittask',route.submitNpaCase.bind(route));*/
		//server.get(props.contextPath+'/client/ci/NPALRGroups/todoDashboard',route.NPALRTodoDashboard.bind(route));
	//NPA LOANRECOVERY Ends
	
	//Loan Disbursement handler method starts
		//Baskar
		////server.post(props.contextPath+'/client/ci/groups/fieldverification/:id/clientlist', route.retrieveClientList.bind(route));
		////server.post(props.contextPath+'/client/ci/groups/member/fieldverification/:id/memberid', route.retrieveFieldVerificationDetails.bind(route));
		////server.post(props.contextPath+'/client/ci/groups/member/fieldverification/insert', route.insertFieldVerifiedDetails.bind(route));
		////server.post(props.contextPath+'/client/ci/groups/member/fieldverification/:id/clarification', route.needClarificationDetails.bind(route));
		////server.post(props.contextPath+'/client/ci/groups/member/synchronizedpage/:id/:isSynchronized/:mifosCustomerId/upload', route.retrieveClientsForLS.bind(route));
		////server.post(props.contextPath+'/client/ci/groups/synchronizedpageonchange/:operationId/:officeId', route.synchronizedPageOnchange.bind(route));
		////server.post(props.contextPath+'/client/ci/groups/rejectedGroups/:id/clientlist', route.retrieveClientsForRejectedGroups.bind(route));
		////server.post(props.contextPath+'/client/ci/groups/rejectedClients/:id/clientDetails', route.rejectedClientDetails.bind(route));
		////server.post(props.contextPath+'/client/ci/groups/reintiateClient', route.reintiateClient.bind(route));
		////server.post(props.contextPath+'/client/ci/populateGroups', route.populateGroups.bind(route));
		////server.post(props.contextPath+'/client/ci/populateRejectedGroups', route.populateRejectedGroups.bind(route));
		////server.get(props.contextPath+'/client/ci/dashBoard',route.dashboard.bind(route));
		////server.post(props.contextPath+'/client/ci/generate/:id/dashboard',route.generateDashBoard.bind(route));
		//kumaran
		////server.get(props.contextPath+'/client/ci/groups/create', route.createGroup.bind(route));
		////server.post(props.contextPath+'/client/ci/groups/saveGroup', route.saveGroup.bind(route));
		////server.post(props.contextPath+'/client/ci/groups/:id/preVerification', route.preVerification.bind(route));
		////server.post(props.contextPath+'/client/ci/groups/preVerificationUpload/:id/preVerificationUpload', route.preVerificationUpload.bind(route));
		////server.post(props.contextPath+'/client/ci/groups/:id/preVerificationDocumentUpload', route.preVerificationDocumentUpload.bind(route));
		////server.post(props.contextPath+'/client/ci/groups/:id/verifyGroup', route.verifyGroup.bind(route));
		////server.post(props.contextPath+'/client/ci/groups/:id/kycuploading', route.KYC_Uploading.bind(route));
		////server.post(props.contextPath+'/client/ci/groups/:id/kycuploadingMenu', route.KYC_UploadingMenu.bind(route));
		////server.post(props.contextPath+'/client/ci/groups/:id/kycuploadingImage', route.KYC_UploadingImage.bind(route));
		
		//For Android kumaran & Baskar
		server.post(props.contextPath+'/client/ci/groups/:id/FromAndroidkycUploadingImage', route.FromAndroidkycUploadingImage.bind(route));
		////server.post(props.contextPath+'/client/ci/storeCapturedImage', route.storeCapturedImage.bind(route));
		////server.post(props.contextPath+'/client/ci/storePreliminaryVerificationCapturedImage', route.storePreliminaryVerificationCapturedImage.bind(route));
        server.post(props.contextPath+'/client/ci/registerNewUser', route.registerNewUser.bind(route)); //unused
		server.post(props.contextPath+'/client/ci/saveRegisterUser', route.saveRegisterUser.bind(route)); //unused

		//webservice kumaran & Baskar
		////server.post(props.contextPath+'/client/ci/groupDetails', route.groupDetails.bind(route));
		////server.post(props.contextPath+'/client/ci/documentDetails', route.documentDetails.bind(route));
		////server.post(props.contextPath+'/client/ci/memberDetails', route.memberDetails.bind(route));
		////server.post(props.contextPath+'/client/ci/availableDocumentDetails', route.availableDocumentDetails.bind(route));
		server.post(props.contextPath+'/client/ci/iklanttoandroiddetails', route.iklanToAndroidDetails.bind(route));
		//Sindhu
		////server.post(props.contextPath+'/client/ci/groups/kycUpload/:groupId/savegroupkycUpload', route.saveKycUpload.bind(route));
		////server.post(props.contextPath+'/client/ci/groups/kycUpload/:groupId/savegroupkycUploadForUploadImage', route.saveKycUploadForUploadImage.bind(route));
		////server.post(props.contextPath+'/client/ci/groups/assignFO/savegroupsassignFO', route.saveAssignFO.bind(route));
		////server.post(props.contextPath+'/client/ci/groups/cca1/:groupId/listClients', route.cca1.bind(route));
		////server.post(props.contextPath+'/client/ci/groups/cca1/rejectClients', route.cca1RejectClients.bind(route));
		////server.post(props.contextPath+'/client/ci/groups/cca1/approvedGroup', route.cca1approveGroup.bind(route));
		////server.post(props.contextPath+'/client/ci/groups/cca1/rejectedGroup', route.cca1rejectGroup.bind(route));
		////server.post(props.contextPath+'/client/ci/groups/cca1/uploadNOC', route.uploadNOC.bind(route));

		// Added Paramasivan [Retrieve idle group's clients]
		////server.post(props.contextPath+'/client/ci/idleGroups/:groupId/listClients', route.retrieveIdleClients.bind(route));
		////server.post(props.contextPath+'/client/ci/idleGroups/rejectClients', route.rejectIdleClients.bind(route));
		////server.post(props.contextPath+'/client/ci/idleGroups/rejectIdleGroup', route.rejectIdleGroup.bind(route));
		////server.post(props.contextPath+'/client/ci/idleGroups/approveIdleGroup', route.approveIdleGroup.bind(route));

		////server.post(props.contextPath+'/client/ci/client/checkforexistingmember', route.checkForAlreadyExistingmember.bind(route));
		////server.post(props.contextPath+'/client/ci/generateEquifaxReport', route.generateEquifaxReport.bind(route));
		////server.post(props.contextPath+'/client/ci/generateEquifaxReport/:groupId/viewClient', route.generateEquifaxReportClients.bind(route));
		////server.post(props.contextPath+'/client/ci/generateEquifaxReport/:clientId/downloadClientEquifaxReport', route.downloadClientEquifaxReport.bind(route));
		////server.post(props.contextPath+'/client/ci/generateClientDocuments/:clientId/:docId/downloadUploadedImages', route.downloadRequstedImage.bind(route));
		////server.post(props.contextPath+'/client/ci/downloadDocs', route.downloadDocs.bind(route));
		////document verification group list- report management
		////server.post(props.contextPath+'/client/ci/reportManagement/docVerificationGroupList', route.generateDocVerificationGroups.bind(route));
        //Jagan
		////server.get(props.contextPath+'/client/ci/groups', route.commonRouter.listGroups.bind(route.commonRouter));
		////server.get(props.contextPath+'/client/ci/groups/:new', route.commonRouter.listGroups.bind(route.commonRouter));
		////server.post(props.contextPath+'/client/ci/groups/authorization/:operationId/:officeId', route.listGroupsAuthorization.bind(route));
		////server.post(props.contextPath+'/client/ci/groups/authorization/group/:groupId/:branchId', route.groupDetailsAuthorization.bind(route));
		////server.post(props.contextPath+'/client/ci/groups/appraisal/:clientId/:groupId/:loanCount/:statusId/:redirectValue', route.listQuestionsCCA.bind(route));//Adarsh-Modified
		////server.post(props.contextPath+'/client/ci/groups/reinitiate/:groupId', route.reinitiateGroup.bind(route));
		////server.get(props.contextPath+'/client/ci/groups/operation/addquestions/cca',route.addQuestions.bind(route));
		////server.post(props.contextPath+'/client/ci/groups/operation/addquestions/cca/questions',route.questionsSelect.bind(route));
		////server.post(props.contextPath+'/client/ci/groups/savequestion/:id', route.saveQuestion.bind(route));
		////server.post(props.contextPath+'/client/ci/groups/secondaryappraisal/:clientId/:noOfQuestions', route.calculateSecondaryAppraisal.bind(route));
		////server.post(props.contextPath+'/client/ci/groups/kycUpload/skipKyc/:group_id', route.skipKycUpload.bind(route));

    // Paramsivan
        ////server.post(props.contextPath+'/client/ci/groups/loadClients', route.loadActiveOrRejectedClients.bind(route));
	//Ramya
	//To synchronize IKLANT DB TO MFI DB
		////server.post(props.contextPath+'/client/ci/groups/synchronize/:groupId',route.synchronize.bind(route));
		
	/* Author : bask1939
	   Date   : 13-March-2014
	   Development : Reports in rejected clients Screen
	*/
	////server.post(props.contextPath+'/client/ci/rejectedClient/retrieveDocumentList', route.retrieveDocumentList.bind(route));
	
	/*
     * Author : bask030
     * Date   : 13-Nov-2014
     * Module : LR FSO Travelling Path
     * */
    //1//8server.get(props.contextPath+'/loanRecovery/FSO/travellingPath',route.lrFSOTravellingPath.bind(route));
    //1//7server.post(props.contextPath+'/loanRecovery/FSO/travellingPath/ajaxCall',route.FSOTravellingPath.bind(route));
    //1//6server.post(props.contextPath+'/loanRecovery/FSO/travellingPath/getCurrentPosition',route.getCurrentPosition.bind(route));

    //// Added Paramasivan for new report management
    ////server.get(props.contextPath+'/client/ci/loadReportsMenu',routerReports.loadReportsMenu.bind(routerReports));
    ////server.get(props.contextPath+'/client/ci/loadReportsByCategory/:categoryId',routerReports.loadReportsByCategory.bind(routerReports));
    ////server.get(props.contextPath+'/client/ci/loadReport/:categoryId/:spname/:reportId/:reportName',routerReports.loadReport.bind(routerReports));
    ////server.post(props.contextPath+'/client/ci/generateSelectedReport',routerReports.generateSelectedReport.bind(routerReports));
    ////server.post(props.contextPath+'/client/ci/downloadReports',routerReports.downloadReports.bind(routerReports));

    // Added Paramasivan for SLD - list group & client schedule
    ////server.post(props.contextPath+'/client/ci/nextLoanGroups/nextLoanPreCheckDetails',route.nextLoanPreCheckDetails.bind(route));
	////server.post(props.contextPath+'/client/ci/nextLoanGroups/approveOrRejectCustomerForNextLoan',route.approveOrRejectCustomerForNextLoan.bind(route));

    //1//Added SathishKumar M 008 for [change password]
    //1//5server.get(props.contextPath + '/client/ci/changePassword',route.loadChangePassword.bind(route));
    //1//4server.post(props.contextPath + '/client/ci/submitChangePassword',route.submitChangePassword.bind(route));

    //1///Added by SathishKumar M 008 for [Forgot Password]
    //1//3server.get(props.contextPath + '/client/ci/forgotPassword',route.loadForgotPassword.bind(route));
    //1//2server.post(props.contextPath + '/client/ci/generatePassword',route.generatePassword.bind(route));
    //1//1server.get(props.contextPath + '/client/ci/loadUserNameChange',route.loadUserNameChange.bind(route));
    ////server.get('/mfi/api/1.0/client/ci/loadRescheduledGroups', route.loadRescheduledGroups.bind(route));
    ////server.post('/mfi/api/1.0/client/ci/groups/:globalAccountNum/retrieveRescheduledLoanAccounts', route.retrieveRescheduledLoanAccounts.bind(route));
    ////server.post('/mfi/api/1.0/client/ci/groups/updateRescheduledLoanAccount', route.updateRescheduledLoanAccount.bind(route));
    server.get('/*', function(req, res){
		res.redirect(props.contextPath+'/client/ci/login');
	});
	
	server.post('/*', function(req, res){
		res.redirect(props.contextPath+'/client/ci/login');
	});
    return server;
}