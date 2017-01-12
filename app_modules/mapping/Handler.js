
function handler(server) {
    var path = require('path');
    var applicationHome = path.dirname(process.mainModule.filename);
    var props = require(path.join(applicationHome,"properties.json"));

    var constantsRequire = require(path.join(applicationHome,"app_modules/dto/common/Constants"));
    var constants = new constantsRequire();
    var authenticationRouter = new (require(path.join(applicationHome,"/app_modules/router/AuthenticationRouter")))(constants);
    var commonRouter = new (require(path.join(applicationHome,"/app_modules/router/CommonRouting")))(constants);
    var dataEntryRouter = new (require(path.join(applicationHome,"/app_modules/router/DataEntryRouter")))(constants);
    var accountingRouter = new (require(path.join(applicationHome,"/app_modules/router/AccountingRouter")))(constants);
    var areaManagementRouter = new (require(path.join(applicationHome,"/app_modules/router/AreaManagementRouter")))(constants);
    var loanUtilCheckRouter = new (require(path.join(applicationHome,"/app_modules/router/LoanUtilCheckRouter")))(constants);
    var userManagementRouter = new (require(path.join(applicationHome,"/app_modules/router/UserManagementRouter")))(constants);
    var loanDisbursementRouter = new (require(path.join(applicationHome,"/app_modules/router/LoanDisbursementRouter")))(constants);
    var shortMessagingRouter = new (require(path.join(applicationHome,"/app_modules/router/ShortMessagingRouter")))(constants);
    var androidRouter = new (require(path.join(applicationHome,"/app_modules/router/AndroidRouter")))(constants,commonRouter);
    var auditingRouter = new (require(path.join(applicationHome,"/app_modules/router/AuditingRouter")))(constants);
    var groupManagementRouter = new (require(path.join(applicationHome,"/app_modules/router/GroupManagementRouter")))(constants);
    var loanRecoveryRouter = new (require(path.join(applicationHome,"/app_modules/router/LoanRecoveryRouter")))(constants);
    var dataEntryDataModel = new (require(path.join(applicationHome,"/app_modules/data_model/DataEntryDataModel")))(constants);
    var administrativeTasksRouter = new (require(path.join(applicationHome,"/app_modules/router/AdministrativeTasksRouter")))(constants);
    administrativeTasksRouter.commonRouter = commonRouter;
    var reportManagementRouter = new (require(path.join(applicationHome,"/app_modules/router/ReportManagementRouter")))(constants);
    var reportManagementDataModel = new (require(path.join(applicationHome,"/app_modules/data_model/ReportManagementDataModel")))(constants);

    var coordinatorVerificationRouter = new (require(path.join(applicationHome,"/app_modules/router/CoordinatorVerificationRouter")))(constants);
    var boDashBoardRouter = new (require(path.join(applicationHome,"/app_modules/router/BODashBoardRouter")))(constants);
    var businessCorrespondentDBRouter = new (require(path.join(applicationHome,"/app_modules/router/BusinessCorrespondentDBRouter")))(constants);

    /* temporary fix for reports - must be removed after separating reports module  */
    var datamodelReports = require(path.join(applicationHome,"/app_modules/reports/model/datamodelReports")).datamodelReports;
    var routerReports = require(path.join(applicationHome,"/app_modules/reports/router/routerReports"));
    datamodelReports = new datamodelReports();
    routerReports = new routerReports(datamodelReports,commonRouter.model.dataModel);
    /* providing accesablity to other module methods */
    accountingRouter.routerReport = routerReports;
    dataEntryRouter.commonRouter = commonRouter;
    authenticationRouter.commonRouter = commonRouter;
    accountingRouter.commonRouter = commonRouter;
    areaManagementRouter.commonRouter = commonRouter;
    loanUtilCheckRouter.commonRouter = commonRouter;
    userManagementRouter.commonRouter = commonRouter;
    loanDisbursementRouter.commonRouter = commonRouter;
    loanDisbursementRouter.shortMessagingRouter = shortMessagingRouter;
    androidRouter.commonRouter = commonRouter;
    auditingRouter.commonRouter = commonRouter;
    groupManagementRouter.commonRouter = commonRouter;
    loanRecoveryRouter.commonRouter = commonRouter;
    groupManagementRouter.loanDisbursementRouter = loanDisbursementRouter;
    loanRecoveryRouter.shortMessagingRouter = shortMessagingRouter;
    reportManagementRouter.commonRouter = commonRouter;
    reportManagementRouter.accountingRouter = accountingRouter;
    reportManagementRouter.androidRouter = androidRouter;
    reportManagementRouter.groupManagementRouter = groupManagementRouter;
    routerReports.reportManagementDataModel = reportManagementDataModel;

    coordinatorVerificationRouter.commonRouter = commonRouter;
    boDashBoardRouter.commonRouter = commonRouter;
    businessCorrespondentDBRouter.commonRouter = commonRouter;

    /*
     * BC Dashboard Router Mapping
     *
     */


    server.get(props.contextPath+'/bc/stats/summary', businessCorrespondentDBRouter.getBCSummary.bind(businessCorrespondentDBRouter));
    server.get(props.contextPath+'/bc/accounts/depositStatement', businessCorrespondentDBRouter.getDepositStatement.bind(businessCorrespondentDBRouter));
    server.post(props.contextPath+'/bc/stats/summary/branchwise', businessCorrespondentDBRouter.getBCSummaryBranchWise.bind(businessCorrespondentDBRouter));
    server.post(props.contextPath+'/bc/stats/summary/demandvscollection', businessCorrespondentDBRouter.getdemandvscollectionSummary.bind(businessCorrespondentDBRouter));
    server.post(props.contextPath+'/bc/stats/salespipeline/branchwise', businessCorrespondentDBRouter.getBCSalesPipeLineBranchWise.bind(businessCorrespondentDBRouter));			
    server.post(props.contextPath+'/bc/stats/monthwise/portfolio', businessCorrespondentDBRouter.getMonthwisePortfolio.bind(businessCorrespondentDBRouter));
    server.post(props.contextPath+'/bc/stats/stateWise/portfolio', businessCorrespondentDBRouter.getStateWisePortfolio.bind(businessCorrespondentDBRouter));
    server.post(props.contextPath+'/bc/stats/loanSizeWise/portfolio', businessCorrespondentDBRouter.getLoanSizeWisePortfolio.bind(businessCorrespondentDBRouter));
    server.post(props.contextPath+'/bc/stats/loanPurposeWise/portfolio', businessCorrespondentDBRouter.getLoanPurposeWisePortfolio.bind(businessCorrespondentDBRouter));
    server.post(props.contextPath+'/bc/stats/demand/demandGenerateReport', businessCorrespondentDBRouter.getDemandReportExport.bind(businessCorrespondentDBRouter));
    server.post(props.contextPath+'/bc/stats/loanCycleWise/portfolio', businessCorrespondentDBRouter.getLoanCycleWisePortfolio.bind(businessCorrespondentDBRouter));


    /**
     * Backoffice Dashboard
     */

    server.get(props.contextPath+'/client/ci/getGroupCount/regionWise', boDashBoardRouter.getGroupCount.bind(boDashBoardRouter));
    server.post(props.contextPath+'/client/ci/getGroupCount/regionWise/date/:requestedDate', boDashBoardRouter.getGroupCount.bind(boDashBoardRouter));
    server.get(props.contextPath+'/client/ci/getGroupCount/regionWise/summary', boDashBoardRouter.getRegionalWiseGroupCountSummary.bind(boDashBoardRouter));
    server.get(props.contextPath+'/client/ci/getGroupCount/dateWise/summary', boDashBoardRouter.getDateWiseGroupCountSummary.bind(boDashBoardRouter));
    server.post(props.contextPath+'/client/ci/getGroupCount/dateWise/summary', boDashBoardRouter.getDateWiseGroupCountSummary.bind(boDashBoardRouter));
    server.post(props.contextPath+'/client/ci/getGroupCount/regionWise/summary', boDashBoardRouter.getRegionalWiseGroupCountSummary.bind(boDashBoardRouter));
    server.post(props.contextPath+'/client/ci/getGroupCount/branchWise/:regionId/:regionOfficeName', boDashBoardRouter.getGroupCountBranchWise.bind(boDashBoardRouter));
    server.post(props.contextPath+'/client/ci/getGroupStatusCount/branch/:branchId/:branchOfficeName/:regionalOfficeName', boDashBoardRouter.getGroupStatusCountForSelectedBranch.bind(boDashBoardRouter));
    server.post(props.contextPath+'/client/ci/getGroupList/:branchId/:reportStatus/:groupStatus', boDashBoardRouter.getGroupListForSelectedStatus.bind(boDashBoardRouter));
    server.post(props.contextPath+'/client/ci/deoListForClient/:clientId',boDashBoardRouter.deoListForClient.bind(boDashBoardRouter));
    server.get(props.contextPath+'/client/ci/getClientCount/deoWiseList', boDashBoardRouter.deoWiseList.bind(boDashBoardRouter));
    server.post(props.contextPath+'/client/ci/getClientCount/deoWiseList', boDashBoardRouter.deoWiseList.bind(boDashBoardRouter));

    /**
     * Coordinator Verification Process
     */

    server.get(props.contextPath+'/client/ci/getFreshGroupsForVerifcation/:requestedTab', coordinatorVerificationRouter.getFreshGroupsForVerifcation.bind(coordinatorVerificationRouter));
    server.post(props.contextPath+'/client/ci/verification/groupsWhileOfficeChange/:officeId', coordinatorVerificationRouter.getGroupsForVerifcation.bind(coordinatorVerificationRouter) );
    server.post(props.contextPath+'/client/ci/verification/group/clientList/:groupId/:screenFlag', coordinatorVerificationRouter.getClientListForKYCrVerifcation.bind(coordinatorVerificationRouter) );
    server.post(props.contextPath+'/client/ci/verification/client/getKYCDocuments', coordinatorVerificationRouter.getKYCDocumentsForClient.bind(coordinatorVerificationRouter) );
    server.post(props.contextPath+'/client/ci/verification/client/getResolvedKYCDocuments', coordinatorVerificationRouter.getResolvedKYCDocuments.bind(coordinatorVerificationRouter) );
    server.post(props.contextPath+'/client/ci/verification/client/updateVerificationClientStatus', coordinatorVerificationRouter.updateVerificationClientStatus.bind(coordinatorVerificationRouter) );
    server.get(props.contextPath+'/client/ci/kycverification/client/groupCountDashBoard', coordinatorVerificationRouter.groupCountDashBoard.bind(coordinatorVerificationRouter) );


    /**
     * Authentication process
     */
    server.get(props.contextPath+'/client/ci/login', authenticationRouter.loginPage.bind(authenticationRouter));
    server.post(props.contextPath+'/client/ci/auth', authenticationRouter.authLogin.bind(authenticationRouter));
    server.get(props.contextPath+'/client/ci/menu', authenticationRouter.getMenu.bind(authenticationRouter));
    server.get(props.contextPath+'/client/ci/logout', authenticationRouter.logoutPage.bind(authenticationRouter));
    server.get(props.contextPath+'/client/ci/empty',authenticationRouter.showMenu.bind(authenticationRouter));

    /**
     * Used commonly
     */
    server.get(props.contextPath+'/client/ci/getGroups',commonRouter.getBranches.bind(commonRouter));
    server.get(props.contextPath+'/client/ci/getGroups/:new',commonRouter.getBranches.bind(commonRouter));
    server.get(props.contextPath+'/client/ci/groups', commonRouter.listGroups.bind(commonRouter));
    server.get(props.contextPath+'/client/ci/groups/:new', commonRouter.listGroups.bind(commonRouter));
    server.post(props.contextPath+'/client/ci/groups/operation/:operationId', commonRouter.listGroupsOperation.bind(commonRouter));
    server.post(props.contextPath+'/client/ci/groupsWhileOfficeChange/:officeId/:operationId', commonRouter.listGroups.bind(commonRouter));
    server.post(props.contextPath+'/client/ci/listClients/Office/:officeId/:operationId', commonRouter.listGroupsOperation.bind(commonRouter));
    server.post(props.contextPath+'/client/ci/groups/member/fieldverification/insert', commonRouter.insertFieldVerifiedDetails.bind(commonRouter));
    //Jagan
    server.get(props.contextPath+'/client/ci/groups', commonRouter.listGroups.bind(commonRouter));
    server.get(props.contextPath+'/client/ci/groups/:new', commonRouter.listGroups.bind(commonRouter));
    /**
     * Data Entry Operation
     */
    server.post(props.contextPath+'/client/ci/kycdownload/groupId/:groupId/kycdownload', dataEntryRouter.KYC_Download.bind(dataEntryRouter));
    server.post(props.contextPath+'/client/ci/kycdownload/groupId/:groupId/kycdownloadNew', dataEntryRouter.KYC_DownloadNew.bind(dataEntryRouter));
    server.post(props.contextPath+'/client/ci/kycupdating/:id/:groupName/:isDataVerified/:operationId', dataEntryRouter.KYC_Updating.bind(dataEntryRouter));   // Added by chitra
    server.post(props.contextPath+'/client/ci/kycupdating/member/:id/:isDataVerified', dataEntryRouter.KYC_UpdatingMember.bind(dataEntryRouter));  // Modified by chitra
    server.post(props.contextPath+'/client/ci/savekycupdating/:isDataVerified', dataEntryRouter.saveKYC_Updating.bind(dataEntryRouter));
    server.post(props.contextPath+'/client/ci/KYC_updatingNeedImageClarity/member/:id/memberId', dataEntryRouter.KYC_UpdatingNeedImageClarity.bind(dataEntryRouter));
    server.post(props.contextPath+'/client/ci/groups/member/creditreport/:groupId', dataEntryRouter.creditReportClients.bind(dataEntryRouter));
    server.post(props.contextPath+'/client/ci/loadHoldMembers', dataEntryRouter.loadHoldMembers.bind(dataEntryRouter));
    server.post(props.contextPath+'/client/ci/client/memberHoldHistory', dataEntryRouter.memberHoldHistory.bind(dataEntryRouter));
    server.post(props.contextPath+'/client/ci/NMIClientsVerification/:id/NMIClients', dataEntryRouter.KYC_UpdatingForNMIClients.bind(dataEntryRouter));
    server.post(props.contextPath+'/client/ci/NMIClientsVerification/member/:id/memberId', dataEntryRouter.KYC_UpdatingMemberForNMIClients.bind(dataEntryRouter));
    server.post(props.contextPath+'/client/ci/client/nmisavekycupdating', dataEntryRouter.saveKYC_UpdatingForNMIClients.bind(dataEntryRouter));
    server.post(props.contextPath+'/client/ci/groups/creditBureau/:clientId/analysis',dataEntryRouter.creditBureauForClients.bind(dataEntryRouter));
    server.post(props.contextPath+'/client/ci/groups/creditBureau/saveRepaymentTrack/:clientId',dataEntryRouter.saveRepaymentRecord.bind(dataEntryRouter));
    server.post(props.contextPath+'/client/ci/groups/getClientDetailsForLeaderSubLeader/:groupId/:loanCount',dataEntryRouter.getClientDetailsForLeaderSubLeader.bind(dataEntryRouter));
    server.post(props.contextPath+'/client/ci/groups/getClientDetailsForLeaderSubLeaderVerification/:groupId/:loanCount',dataEntryRouter.getClientDetailsForLeaderSubLeaderVerification.bind(dataEntryRouter));
    server.post(props.contextPath+'/client/ci/groups/saveSubGroupDetails/:groupId/:loanCount',dataEntryRouter.saveSubGroupDetails.bind(dataEntryRouter));
    server.post(props.contextPath+'/client/ci/kycDocuments/:clientId',dataEntryRouter.KycDocumentsForRMApproval.bind(dataEntryRouter));
    server.post(props.contextPath+'/client/ci/kycDocuments/:clientId/:status',dataEntryRouter.updateRMApprovalStatus.bind(dataEntryRouter));
    server.post(props.contextPath+'/client/ci/updateKYCDEDetails',dataEntryRouter.saveReUpdateDEClientDetails.bind(dataEntryRouter));
    server.post(props.contextPath+'/client/ci/retrieveClientCurrentStatus',dataEntryRouter.retrieveClientCurrentStatus.bind(dataEntryRouter));

    server.post(props.contextPath+'/client/ci/callToLDCallTrack',dataEntryRouter.callToLDCallTrack.bind(dataEntryRouter));
    server.post(props.contextPath+'/client/ci/callToLDCallTrackCallInitialAck',dataEntryRouter.callToLDCallTrackCallInitialAck.bind(dataEntryRouter));
    server.post(props.contextPath+'/client/ci/LDCallTracking/showLDCallTrackingGroupDetail', dataEntryRouter.showLDCallTrackingGroupDetail.bind(dataEntryRouter));
    server.post(props.contextPath+'/client/ci/LDCallTracking/updateClientLDTrack', dataEntryRouter.updateClientLDTrack.bind(dataEntryRouter));
    server.post(props.contextPath+'/client/ci/LDCallTracking/showGroupCaseDetail', dataEntryRouter.showGroupCaseDetail.bind(dataEntryRouter));
    server.post(props.contextPath+'/client/ci/LDCallTracking/updateRMLDClientCaseTrack', dataEntryRouter.updateRMLDClientCaseTrack.bind(dataEntryRouter));
    server.post(props.contextPath+'/client/ci/LDCallTracking/updateBMLDClientCaseTrack', dataEntryRouter.updateBMLDClientCaseTrack.bind(dataEntryRouter));
    server.post(props.contextPath+'/client/ci/LDCallTracking/showLDCheckList', dataEntryRouter.showLDCheckList.bind(dataEntryRouter));
    server.post('/mfi/api/1.0/client/ci/uploadLDCallTrackAudioFile', dataEntryRouter.uploadLDCallTrackAudioFile.bind(dataEntryRouter));
    server.post(props.contextPath+'/client/ci/updateKYCContactDetails', dataEntryRouter.updateKYCContactDetails.bind(dataEntryRouter));
    server.post(props.contextPath+'/client/ci/retrieveKYCReUpdateClients', dataEntryRouter.retrieveKYCReUpdateClients.bind(dataEntryRouter));
    server.post(props.contextPath+'/client/ci/updateKYCDetails', dataEntryRouter.updateKYCDetails.bind(dataEntryRouter));
    server.post(props.contextPath+'/client/ci/checkIfAlreadyExistsMember', dataEntryRouter.checkIfAlreadyExistsMember.bind(dataEntryRouter));

    /**
     * Accounting Module
     */
    server.get(props.contextPath+'/client/ci/accounts/accountsMenu', accountingRouter.accountsMenu.bind(accountingRouter));
    server.post(props.contextPath+'/accounts/contraBankPaymentForm', accountingRouter.contraBankPayment.bind(accountingRouter));
    server.post(props.contextPath+'/accounts/submitContraBankWithdraw', accountingRouter.submitContraBankWithdraw.bind(accountingRouter));
    server.post(props.contextPath+'/accounts/cashDepositForm', accountingRouter.cashDepositForm.bind(accountingRouter));
    server.post(props.contextPath+'/accounts/submitcashDeposit', accountingRouter.submitcashDeposit.bind(accountingRouter));
    server.post(props.contextPath+'/accounts/fundTransferForm', accountingRouter.fundTransferForm.bind(accountingRouter));
    server.post(props.contextPath+'/accounts/submitFundTransfer', accountingRouter.submitFundTransfer.bind(accountingRouter));
    server.post(props.contextPath+'/accounts/cashTransferForm', accountingRouter.cashTransferForm.bind(accountingRouter));
    server.post(props.contextPath+'/accounts/submitCashTransfer', accountingRouter.submitCashTransfer.bind(accountingRouter));
    server.post(props.contextPath+'/accounts/cashPaymentForm', accountingRouter.cashPaymentForm.bind(accountingRouter));
    server.post(props.contextPath+'/accounts/submitCashPayment', accountingRouter.submitCashPayment.bind(accountingRouter));
    server.post(props.contextPath+'/accounts/cashReceiptForm', accountingRouter.cashReceiptForm.bind(accountingRouter));
    server.post(props.contextPath+'/accounts/submitCashReceipt', accountingRouter.submitCashReceipt.bind(accountingRouter));
    server.post(props.contextPath+'/accounts/bankPaymentForm', accountingRouter.bankPaymentForm.bind(accountingRouter));
    server.post(props.contextPath+'/accounts/submitBankPayment', accountingRouter.submitBankPayment.bind(accountingRouter));
    server.post(props.contextPath+'/accounts/bankReceiptForm', accountingRouter.bankReceiptForm.bind(accountingRouter));
    server.post(props.contextPath+'/accounts/submitBankReceipt', accountingRouter.submitBankReceipt.bind(accountingRouter));
    server.post(props.contextPath+'/accounts/journalTransaction', accountingRouter.journalTransaction.bind(accountingRouter));
    server.post(props.contextPath+'/accounts/submitJournalTransaction', accountingRouter.submitJournalTransaction.bind(accountingRouter));
    server.post(props.contextPath+'/accounts/editAccountingTransaction', accountingRouter.editAccountingTransaction.bind(accountingRouter));
    server.post(props.contextPath+'/accounts/updateAccountingTransactions', accountingRouter.updateAccountingTransactions.bind(accountingRouter));
    server.post(props.contextPath+'/accounts/showVoucherPaymentForBackOption', accountingRouter.showVoucherPaymentForBackOption.bind(accountingRouter));
    server.get(props.contextPath+'/accounts/transactionHistory', accountingRouter.transactionHistory.bind(accountingRouter));
    server.post(props.contextPath+'/client/ci/transactionHistoryGenerate',accountingRouter.transactionHistoryGenerate.bind(accountingRouter));
    //Bank Reconciliation
    server.post(props.contextPath+'/accounts/bankReconciliation', accountingRouter.bankReconciliation.bind(accountingRouter));
    server.post(props.contextPath+'/accounts/saveBankReconciliation', accountingRouter.saveBankReconciliation.bind(accountingRouter));
    server.post(props.contextPath+'/accounts/bankReconciliationReport', accountingRouter.bankReconciliationReport.bind(accountingRouter));
    server.get(props.contextPath+'/client/ci/accounts/accountsMenu', accountingRouter.accountsMenu.bind(accountingRouter));
    //Expense Tracking
    server.post(props.contextPath+'/client/ci/accounts/expensetrackingload', accountingRouter.expensetrackingload.bind(accountingRouter));
    server.post(props.contextPath+'/client/ci/accounts/accountadjustmentload', accountingRouter.accountadjustmentload.bind(accountingRouter));
    server.post(props.contextPath+'/client/ci/accounts/expensetracking', accountingRouter.expensetracking.bind(accountingRouter));
    server.post(props.contextPath+'/client/ci/accounts/accountadjustment', accountingRouter.accountadjustment.bind(accountingRouter));
    server.post(props.contextPath+'/client/ci/accounts/doexpensetracking', accountingRouter.doexpensetracking.bind(accountingRouter));
    server.post(props.contextPath+'/client/ci/accounts/doaccountadjustment', accountingRouter.doaccountadjustment.bind(accountingRouter));
    server.post(props.contextPath+'/client/ci/accounts/cashPaymentVoucherLoad/:typeOfTransaction/:dateResetFlag', accountingRouter.cashPaymentVoucherLoad.bind(accountingRouter));
    server.post(props.contextPath+'/client/ci/accounts/generateCashPaymentVoucherPDF', accountingRouter.generateCashPaymentVoucherPDF.bind(accountingRouter));
    //Day Book
    server.post(props.contextPath+'/client/ci/daybook/dayBookLoad', accountingRouter.dayBookLoad.bind(accountingRouter));
    server.get(props.contextPath+'/client/ci/daybook/dayBookLoadInit', accountingRouter.dayBookLoadInit.bind(accountingRouter));
    server.post(props.contextPath+'/client/ci/daybook/verifyDayBook', accountingRouter.verifyDayBook.bind(accountingRouter));
    server.post(props.contextPath+'/client/ci/daybook/rejectDayBook', accountingRouter.rejectDayBook.bind(accountingRouter));
    server.post(props.contextPath+'/client/ci/daybook/doFreezeDay', accountingRouter.doFreezeDay.bind(accountingRouter));
    server.post(props.contextPath+'/client/ci/daybook/doUnfreezeDay', accountingRouter.doUnfreezeDay.bind(accountingRouter));
    server.get(props.contextPath+'/client/ci/daybook/showFreezUnfreezeDay', accountingRouter.showFreezUnfreezeDay.bind(accountingRouter));
    server.get(props.contextPath+'/client/ci/daybook/showUnfreezeDaysList', accountingRouter.showUnfreezeDaysList.bind(accountingRouter));
    server.post(props.contextPath+'/client/ci/daybook/closeUnfreezedDayForAE', accountingRouter.closeUnfreezedDayForAE.bind(accountingRouter));
    server.post(props.contextPath+'/client/ci/daybook/retrieveInflowOutflow', accountingRouter.retrieveInflowOutflow.bind(accountingRouter));

    /**
     * Module : Accounting
     * Sub-Module : Fund Management
     * Author : baskar030
     */
    server.post(props.contextPath+'/accounting/fund/load', accountingRouter.loadFund.bind(accountingRouter));
    server.post(props.contextPath+'/accounting/fund/load/:fundId', accountingRouter.loadSelectedFundDetails.bind(accountingRouter));
    server.post(props.contextPath+'/accounting/fund/unallocatedGroupsLoanAmount/load', accountingRouter.unallocatedGroupsLoanAmountForBranch.bind(accountingRouter));
    server.post(props.contextPath+'/accounting/fund/allocateFundsToGroups', accountingRouter.allocateFundsToGroups.bind(accountingRouter));

    /*  Chitra 003 for Ledger View*/
    server.post(props.contextPath+'/client/ci/accounts/ledgerViewLoad', accountingRouter.ledgerViewLoad.bind(accountingRouter));
    server.post(props.contextPath+'/client/ci/accounts/viewTrailBalanceLedger', accountingRouter.viewTrailBalanceLedger.bind(accountingRouter));
    server.post(props.contextPath+'/client/ci/accounts/generateLedgerTransactionsByGLCode/:glcode', accountingRouter.generateLedgerTransactionsByGLCode.bind(accountingRouter));

    // Paramasivan for Area management
    //Area Management
    server.get(props.contextPath+'/client/ci/area/areaManagement', areaManagementRouter.areaManagement.bind(areaManagementRouter));
    server.post(props.contextPath+'/client/ci/area/submitAreaManagement', areaManagementRouter.areaManagement.bind(areaManagementRouter));
    server.post(props.contextPath+'/client/ci/area/saveArea', areaManagementRouter.saveArea.bind(areaManagementRouter));
    server.post(props.contextPath+'/client/ci/area/updateArea', areaManagementRouter.updateArea.bind(areaManagementRouter));
    server.post(props.contextPath+'/client/ci/populateAreaDetails', areaManagementRouter.populateAreaDetails.bind(areaManagementRouter));
    server.post(props.contextPath+'/client/ci/approveOrRejectArea', areaManagementRouter.approveOrRejectArea.bind(areaManagementRouter));
    server.post(props.contextPath+'/client/ci/assignArea', areaManagementRouter.assignOrReleaseArea.bind(areaManagementRouter));
    server.post(props.contextPath+'/client/ci/area/releaseArea/:areaCodeId/:releaseFlag', areaManagementRouter.assignOrReleaseArea.bind(areaManagementRouter));

    // Paramasivan for LUC
    server.get(props.contextPath+'/client/ci/loanUtilizationCheck', loanUtilCheckRouter.loanUtilizationCheck.bind(loanUtilCheckRouter));
    server.post(props.contextPath+'/client/ci/getLUCGroups', loanUtilCheckRouter.loanUtilizationCheck.bind(loanUtilCheckRouter));
    server.post(props.contextPath+'/client/ci/getLUCAccounts', loanUtilCheckRouter.getLUCAccounts.bind(loanUtilCheckRouter));
    server.post(props.contextPath+'/client/ci/getLUCCustomerDetails', loanUtilCheckRouter.getLUCAccounts.bind(loanUtilCheckRouter));
    server.post(props.contextPath+'/client/ci/populateClientDetails', loanUtilCheckRouter.populateClientDetails.bind(loanUtilCheckRouter));
    server.post(props.contextPath+'/client/ci/saveLUCDetails', loanUtilCheckRouter.saveLUCDetails.bind(loanUtilCheckRouter));

    //Admin Screen handler method starts

    //Manage Users
    server.post(props.contextPath+'/client/ci/saveuser',userManagementRouter.saveUser.bind(userManagementRouter));
    server.post(props.contextPath+'/client/ci/updateuser',userManagementRouter.updateUser.bind(userManagementRouter));
    server.post(props.contextPath+'/client/ci/:id/deleteUser',userManagementRouter.deleteUser.bind(userManagementRouter));
    server.post(props.contextPath+'/client/ci/populateuserdetails',userManagementRouter.populateUserDetails.bind(userManagementRouter));

    //Manage Office
    server.post(props.contextPath+'/client/ci/groups/saveNewOffice', userManagementRouter.saveNewOffice.bind(userManagementRouter));
    server.post(props.contextPath+'/client/ci/saveoffice',userManagementRouter.saveOffice.bind(userManagementRouter));
    server.post(props.contextPath+'/client/ci/updateoffice',userManagementRouter.updateOffice.bind(userManagementRouter));
    server.post(props.contextPath+'/client/ci/:id/deleteoffice',userManagementRouter.deleteoffice.bind(userManagementRouter));
    server.post(props.contextPath+'/client/ci/populateofficedetails',userManagementRouter.populateOfficeDetails.bind(userManagementRouter));

    //Manage Roles
    server.post(props.contextPath+'/client/ci/populateroledetails',userManagementRouter.populateRoleDetails.bind(userManagementRouter));
    server.post(props.contextPath+'/client/ci/updaterole',userManagementRouter.updateRole.bind(userManagementRouter));
    server.post(props.contextPath+'/client/ci/:roleid/deleterole',userManagementRouter.deleteRole.bind(userManagementRouter));
    server.post(props.contextPath+'/client/ci/checkForRoleIsAssigned',userManagementRouter.checkForRoleIsAssigned.bind(userManagementRouter));
    server.post(props.contextPath+'/client/ci/groups/saveManageRoles',userManagementRouter.saveManageRoles.bind(userManagementRouter));
    server.post(props.contextPath+'/client/ci/groups/assignRoles',userManagementRouter.assignRoles.bind(userManagementRouter));
    server.post(props.contextPath+'/client/ci/groups/saveAssignRoles',userManagementRouter.saveAssignRoles.bind(userManagementRouter));
    server.post(props.contextPath+'/client/ci/populateRolesAndPermissionsDetails/:roleIdEdit',userManagementRouter.populateRolesAndPermissionsDetails.bind(userManagementRouter));

    // Added Paramasivan for [forgot password]
    server.post(props.contextPath+'/client/ci/getNewPassword',userManagementRouter.getNewPassword.bind(userManagementRouter));

    //Added SathishKumar M 008 for [change password]
    server.get(props.contextPath + '/client/ci/changePassword',userManagementRouter.loadChangePassword.bind(userManagementRouter));
    server.post(props.contextPath + '/client/ci/submitChangePassword',userManagementRouter.submitChangePassword.bind(userManagementRouter));

    //Added by SathishKumar M 008 for [Forgot Password]
    server.get(props.contextPath + '/client/ci/forgotPassword',userManagementRouter.loadForgotPassword.bind(userManagementRouter));
    server.post(props.contextPath + '/client/ci/generatePassword',userManagementRouter.generatePassword.bind(userManagementRouter));
    server.get(props.contextPath + '/client/ci/loadUserNameChange',userManagementRouter.loadUserNameChange.bind(userManagementRouter));

    server.get(props.contextPath + '/admin/ci/listreports',userManagementRouter.listExistingReports.bind(userManagementRouter));
    server.post(props.contextPath + '/admin/ci/addreportview',userManagementRouter.addReportView.bind(userManagementRouter));
    server.post(props.contextPath + '/admin/ci/createDynamicReport',userManagementRouter.CreateDynamicReport.bind(userManagementRouter));
    //Loan Sanction / Disbursement
    server.post(props.contextPath+'/client/ci/groups/member/loansanction/:id/:isSynchronized/:mifosCustomerId/upload', loanDisbursementRouter.retrieveClientsFromService.bind(loanDisbursementRouter));
    server.post(props.contextPath+'/client/ci/group/loansanction/:mifosCustomerId/:loanProductId/:iklantGroupId/retrieveGroupInformation', loanDisbursementRouter.retrieveGroupInformation.bind(loanDisbursementRouter));
    server.post(props.contextPath+'/client/ci/loanOffering', loanDisbursementRouter.loanOffering.bind(loanDisbursementRouter));
    server.post(props.contextPath+'/client/ci/groups/member/loansanction/downloadPDF', loanDisbursementRouter.fileUploadForLS.bind(loanDisbursementRouter));
    server.post(props.contextPath+'/client/ci/groups/member/loansanction/:mifosCustomerId/createLoan', loanDisbursementRouter.createLoan.bind(loanDisbursementRouter));
    server.post(props.contextPath+'/client/ci/group/loansanction/previewDateEMI', loanDisbursementRouter.calcPreviewDateEMI.bind(loanDisbursementRouter));

    // Android Module
    server.post(props.contextPath+'/client/ci/iklanttoandroiddetailssync', androidRouter.iklanToAndroidDetailsSync.bind(androidRouter));
    server.post(props.contextPath+'/client/ci/authentication', androidRouter.authentication.bind(androidRouter));
    server.post(props.contextPath+'/client/ci/doGroupCreationAndroid', androidRouter.doGroupCreationAndroid.bind(androidRouter));
    server.post(props.contextPath+'/client/ci/doPreVerificationAndroid', androidRouter.doPreVerificationAndroid.bind(androidRouter));
    server.post(props.contextPath+'/client/ci/doFieldVerificationAndroid', androidRouter.doFieldVerificationAndroid.bind(androidRouter));
    server.post(props.contextPath+'/client/ci/doLoanSanctionAndroid', androidRouter.doLoanSanctionAndroid.bind(androidRouter));
    server.post(props.contextPath+'/client/ci/doGcmRegistration', androidRouter.doGcmRegistration.bind(androidRouter));
    server.post(props.contextPath+'/client/ci/doAndroidLogFileUpload', androidRouter.doAndroidLogFileUpload.bind(androidRouter));
    server.post(props.contextPath+'/client/ci/:accountId/retrieveGroupDetails/:backFlag', androidRouter.retrieveGroupDetails.bind(androidRouter));
    // Android_LR_Gps_notification
    server.post(props.contextPath+'/client/ci/doLRGPSNotificationAndroid', androidRouter.doLRGPSNotificationAndroid.bind(androidRouter));
    server.post(props.contextPath+'/client/ci/groups/cca1/uploadNOC', androidRouter.uploadNOC.bind(androidRouter));
    //androidLatestServiceURL
    server.post(props.contextPath+'/client/ci/groups/:id/androidUploadingImage', androidRouter.androidUploadingImage.bind(androidRouter));
    server.post(props.contextPath+'/client/ci/groups/:id/androidUploadingLoanSanctionImage', androidRouter.androidUploadingLoanSanctionImage.bind(androidRouter));
    server.post(props.contextPath+'/client/ci/groups/:id/FromPaymentCollectionUploadingImage', androidRouter.FromPaymentCollectionUploadingImage.bind(androidRouter));

    //for Audit Module / Added by Sathish Kumar M 008
    server.get(props.contextPath+'/client/ci/auditing', auditingRouter.auditManagement.bind(auditingRouter));
    server.post(props.contextPath+'/client/ci/audit/submitAuditManagement', auditingRouter.auditManagement.bind(auditingRouter));
    server.post(props.contextPath+'/client/ci/populateAuditQuestionsDetails', auditingRouter.populateAuditQuestionsDetails.bind(auditingRouter));
    server.post(props.contextPath+'/client/ci/audit/saveQuestions', auditingRouter.saveAuditQuestions.bind(auditingRouter));
    server.post(props.contextPath+'/client/ci/audit/deleteQuestion', auditingRouter.deleteAuditQuestions.bind(auditingRouter));
    server.post(props.contextPath+'/client/ci/saveCategory', auditingRouter.saveCategory.bind(auditingRouter));
    server.post(props.contextPath+'/client/ci/audit/assignAuditor', auditingRouter.saveAssignAuditor.bind(auditingRouter));
    server.post(props.contextPath+'/client/ci/populateAuditorAssignmentDetails', auditingRouter.populateAuditorAssignmentDetails.bind(auditingRouter));

    //for Audit Module Mobile Part/ Added by Dhinakaran
    server.post(props.contextPath+'/client/ci/audit/androidAuditorSyncDetails', auditingRouter.androidAuditorSyncDetails.bind(auditingRouter));
    server.post(props.contextPath+'/client/ci/audit/doAuditorSaveAndroid', auditingRouter.doAuditorSaveAndroid.bind(auditingRouter));

    // Group Management
                //Ezra Johnson
    server.post(props.contextPath+'/client/ci/groups/member/kycUploadStatus', groupManagementRouter.getKYCUploadStatus.bind(groupManagementRouter));
    server.post(props.contextPath+'/client/ci/groups/member/moveForDataEntry/:groupId', groupManagementRouter.moveForDataEntry.bind(groupManagementRouter));
    server.post(props.contextPath+'/client/ci/groups/getGroupRecognitionTestDetails', groupManagementRouter.getGroupRecognitionTestDetails.bind(groupManagementRouter));
    server.post(props.contextPath+'/client/ci/groups/submitRatingForGRT', groupManagementRouter.submitRatingForGRT.bind(groupManagementRouter));
    server.post(props.contextPath+'/client/ci/groups/member/synchronizedpage/:id/:isSynchronized/:mifosCustomerId/upload', groupManagementRouter.retrieveClientsForLS.bind(groupManagementRouter));
                //Kapil & prabha [TOo Generate PDF Lan sanction form]
    server.post(props.contextPath+'/client/ci/groups/member/loansanction/:id/downloadPDF', groupManagementRouter.fileUploadFromSynchronized.bind(groupManagementRouter));

    server.post(props.contextPath+'/client/ci/groups/fieldverification/:id/clientlist', groupManagementRouter.retrieveClientList.bind(groupManagementRouter));
    server.post(props.contextPath+'/client/ci/groups/member/fieldverification/:id/memberid', groupManagementRouter.retrieveFieldVerificationDetails.bind(groupManagementRouter));
    server.post(props.contextPath+'/client/ci/groups/member/fieldverification/:id/clarification', groupManagementRouter.needClarificationDetails.bind(groupManagementRouter));
    server.post(props.contextPath+'/client/ci/groups/synchronizedpageonchange/:operationId/:officeId', groupManagementRouter.synchronizedPageOnchange.bind(groupManagementRouter));
    server.post(props.contextPath+'/client/ci/groups/rejectedGroups/:id/clientlist', groupManagementRouter.retrieveClientsForRejectedGroups.bind(groupManagementRouter));
    server.post(props.contextPath+'/client/ci/groups/rejectedClients/:id/clientDetails', groupManagementRouter.rejectedClientDetails.bind(groupManagementRouter));
    server.post(props.contextPath+'/client/ci/groups/reintiateClient', groupManagementRouter.reintiateClient.bind(groupManagementRouter));
    server.post(props.contextPath+'/client/ci/populateGroups', groupManagementRouter.populateGroups.bind(groupManagementRouter));
    server.post(props.contextPath+'/client/ci/populateRejectedGroups', groupManagementRouter.populateRejectedGroups.bind(groupManagementRouter));
    server.get(props.contextPath+'/client/ci/dashBoard',groupManagementRouter.dashboard.bind(groupManagementRouter));
    server.post(props.contextPath+'/client/ci/generate/:id/dashboard',groupManagementRouter.generateDashBoard.bind(groupManagementRouter));
    server.get(props.contextPath+'/client/ci/groups/create', groupManagementRouter.createGroup.bind(groupManagementRouter));
    server.post(props.contextPath+'/client/ci/groups/saveGroup', groupManagementRouter.saveGroup.bind(groupManagementRouter));
    server.post(props.contextPath+'/client/ci/groups/:id/preVerification', groupManagementRouter.preVerification.bind(groupManagementRouter));
    //server.post(props.contextPath+'/client/ci/groups/preVerificationUpload/:id/preVerificationUpload', groupManagementRouter.preVerificationUpload.bind(groupManagementRouter));
   // server.post(props.contextPath+'/client/ci/groups/:id/preVerificationDocumentUpload', groupManagementRouter.preVerificationDocumentUpload.bind(groupManagementRouter));
    server.post(props.contextPath+'/client/ci/groups/:id/verifyGroup', groupManagementRouter.verifyGroup.bind(groupManagementRouter));
    server.post(props.contextPath+'/client/ci/groups/:id/kycuploading', groupManagementRouter.KYC_Uploading.bind(groupManagementRouter));
    server.post(props.contextPath+'/client/ci/groups/:id/kycuploadingMenu', groupManagementRouter.KYC_UploadingMenu.bind(groupManagementRouter));
    server.post(props.contextPath+'/client/ci/groups/:id/kycuploadingImage', groupManagementRouter.KYC_UploadingImage.bind(groupManagementRouter));

            // For Android
    server.post(props.contextPath+'/client/ci/storeCapturedImage', groupManagementRouter.storeCapturedImage.bind(groupManagementRouter));
    server.post(props.contextPath+'/client/ci/storePreliminaryVerificationCapturedImage', groupManagementRouter.storePreliminaryVerificationCapturedImage.bind(groupManagementRouter));
    server.post(props.contextPath+'/client/ci/groupDetails', groupManagementRouter.groupDetails.bind(groupManagementRouter));
    server.post(props.contextPath+'/client/ci/documentDetails', groupManagementRouter.documentDetails.bind(groupManagementRouter));
    server.post(props.contextPath+'/client/ci/memberDetails', groupManagementRouter.memberDetails.bind(groupManagementRouter));
    server.post(props.contextPath+'/client/ci/availableDocumentDetails', groupManagementRouter.availableDocumentDetails.bind(groupManagementRouter));

    server.post(props.contextPath+'/client/ci/groups/kycUpload/:groupId/savegroupkycUpload', groupManagementRouter.saveKycUpload.bind(groupManagementRouter));
    server.post(props.contextPath+'/client/ci/groups/kycUpload/:groupId/savegroupkycUploadForUploadImage', groupManagementRouter.saveKycUploadForUploadImage.bind(groupManagementRouter));
    server.post(props.contextPath+'/client/ci/groups/assignFO/savegroupsassignFO', groupManagementRouter.saveAssignFO.bind(groupManagementRouter));

    server.post(props.contextPath+'/client/ci/groups/cca1/:groupId/listClients', groupManagementRouter.cca1.bind(groupManagementRouter));
    server.post(props.contextPath+'/client/ci/groups/cca1/rejectClients', groupManagementRouter.cca1RejectClients.bind(groupManagementRouter));
    server.post(props.contextPath+'/client/ci/groups/cca1/approvedGroup', groupManagementRouter.cca1approveGroup.bind(groupManagementRouter));
    server.post(props.contextPath+'/client/ci/groups/cca1/rejectedGroup', groupManagementRouter.cca1rejectGroup.bind(groupManagementRouter));

            // Added Paramasivan [Retrieve idle group's clients]
    server.post(props.contextPath+'/client/ci/idleGroups/:groupId/listClients', groupManagementRouter.retrieveIdleClients.bind(groupManagementRouter));
    server.post(props.contextPath+'/client/ci/idleGroups/rejectClients', groupManagementRouter.rejectIdleClients.bind(groupManagementRouter));
    server.post(props.contextPath+'/client/ci/idleGroups/rejectIdleGroup', groupManagementRouter.rejectIdleGroup.bind(groupManagementRouter));
    server.post(props.contextPath+'/client/ci/idleGroups/approveIdleGroup', groupManagementRouter.approveIdleGroup.bind(groupManagementRouter));

    server.post(props.contextPath+'/client/ci/groups/authorization/:operationId/:officeId', groupManagementRouter.listGroupsAuthorization.bind(groupManagementRouter));
    server.post(props.contextPath+'/client/ci/groups/authorization/group/:groupId/:branchId', groupManagementRouter.groupDetailsAuthorization.bind(groupManagementRouter));
    server.post(props.contextPath+'/client/ci/groups/appraisal/:clientId/:groupId/:loanCount/:statusId/:redirectValue', groupManagementRouter.listQuestionsCCA.bind(groupManagementRouter));//Adarsh-Modified
    server.post(props.contextPath+'/client/ci/groups/reinitiate/:groupId', groupManagementRouter.reinitiateGroup.bind(groupManagementRouter));
    server.get(props.contextPath+'/client/ci/groups/operation/addquestions/cca',groupManagementRouter.addQuestions.bind(groupManagementRouter));
    server.post(props.contextPath+'/client/ci/groups/operation/addquestions/cca/questions',groupManagementRouter.questionsSelect.bind(groupManagementRouter));
    server.post(props.contextPath+'/client/ci/groups/savequestion/:id', groupManagementRouter.saveQuestion.bind(groupManagementRouter));
    server.post(props.contextPath+'/client/ci/groups/secondaryappraisal/:clientId/:noOfQuestions', groupManagementRouter.calculateSecondaryAppraisal.bind(groupManagementRouter));
    server.post(props.contextPath+'/client/ci/groups/kycUpload/skipKyc/:group_id', groupManagementRouter.skipKycUpload.bind(groupManagementRouter));

    server.post(props.contextPath+'/client/ci/groups/loadClients', groupManagementRouter.loadActiveOrRejectedClients.bind(groupManagementRouter));

        //Ramya
        //To synchronize IKLANT DB TO MFI DB
    server.post(props.contextPath+'/client/ci/groups/synchronize/:groupId',groupManagementRouter.synchronize.bind(groupManagementRouter));

        /* Author : bask1939
         Date   : 13-March-2014
         Development : Reports in rejected clients Screen
         */
    server.post(props.contextPath+'/client/ci/rejectedClient/retrieveDocumentList', groupManagementRouter.retrieveDocumentList.bind(groupManagementRouter));
        // Added Paramasivan for SLD - list group & client schedule
    server.post(props.contextPath+'/client/ci/nextLoanGroups/nextLoanPreCheckDetails',groupManagementRouter.nextLoanPreCheckDetails.bind(groupManagementRouter));
    server.post(props.contextPath+'/client/ci/nextLoanGroups/approveOrRejectCustomerForNextLoan',groupManagementRouter.approveOrRejectCustomerForNextLoan.bind(groupManagementRouter));


    //For Loan Recovery Module  / Added by Sathish Kumar M 008

    //Loan Recovery For AE
    server.get(props.contextPath+'/client/ci/searchpage', loanRecoveryRouter.searchpage.bind(loanRecoveryRouter));

    //apply payment For FO
    server.get(props.contextPath+'/client/ci/loanrecoveryLoans', loanRecoveryRouter.loanrecoveryLoans.bind(loanRecoveryRouter));
    server.post(props.contextPath+'/client/ci/loanrecoveryLoansAjaxCall', loanRecoveryRouter.loanrecoveryLoansAjaxCall.bind(loanRecoveryRouter));
    server.get(props.contextPath+'/client/ci/pastDueLoans', loanRecoveryRouter.pastDueLoans.bind(loanRecoveryRouter));
    server.post(props.contextPath+'/client/ci/pastDueLoansAjaxCall', loanRecoveryRouter.pastDueLoansAjaxCall.bind(loanRecoveryRouter));
    server.get(props.contextPath+'/client/ci/futureDueLoans', loanRecoveryRouter.futureDueLoans.bind(loanRecoveryRouter));
    server.get(props.contextPath+'/client/ci/dueloansformanager', loanRecoveryRouter.dueLoansForManagerScreens.bind(loanRecoveryRouter));
    server.post(props.contextPath+'/client/ci/futureDueLoansajax/dateajaxcall', loanRecoveryRouter.futureDueLoansDateAjaxCall.bind(loanRecoveryRouter));
    server.post(props.contextPath+'/client/ci/dueloansformanager/WhileOfficeChange', loanRecoveryRouter.dueLoansForManagerScreensWhileOfficeChange.bind(loanRecoveryRouter));

    server.post(props.contextPath+'/client/ci/applyPaymentForFO', loanRecoveryRouter.applyPaymentForFo.bind(loanRecoveryRouter));
    server.post(props.contextPath+'/client/ci/loanrecovery/doapplypaymentForFO', loanRecoveryRouter.doapplypaymentForFO.bind(loanRecoveryRouter));

    server.post(props.contextPath+'/client/ci/syncmifosgroupdetails',loanRecoveryRouter.syncmifosgroupdetails.bind(loanRecoveryRouter));  //android
    server.post(props.contextPath+'/client/ci/search',loanRecoveryRouter.search.bind(loanRecoveryRouter));

    server.get(props.contextPath+'/client/ci/revertPaymentList', loanRecoveryRouter.revertPaymentList.bind(loanRecoveryRouter));
    server.post(props.contextPath+'/client/ci/:paymentCollectionId/revertPayment', loanRecoveryRouter.revertPayment.bind(loanRecoveryRouter));
    server.post(props.contextPath+'/client/ci/retrieveClientAmountDetails', loanRecoveryRouter.retrieveClientAmountDetails.bind(loanRecoveryRouter));

    server.get(props.contextPath+'/client/ci/chequeDepositList', loanRecoveryRouter.chequeDepositList.bind(loanRecoveryRouter));
    server.post(props.contextPath+'/client/ci/chequeDeposit', loanRecoveryRouter.chequeDeposit.bind(loanRecoveryRouter));
    server.post(props.contextPath+'/client/ci/doChequeDeposit', loanRecoveryRouter.doChequeDeposit.bind(loanRecoveryRouter));
    server.get(props.contextPath+'/client/ci/retrieveLoanOfficerList', loanRecoveryRouter.retrieveLoanOfficerList.bind(loanRecoveryRouter));

    server.post(props.contextPath+'/client/ci/preclosure', loanRecoveryRouter.preclosure.bind(loanRecoveryRouter));
    server.post(props.contextPath+'/client/ci/loanrecovery/preclosure/retrievePreclosureInformation', loanRecoveryRouter.retrievePreclosureInformation.bind(loanRecoveryRouter));
    server.post(props.contextPath+'/client/ci/loanrecovery/preclosure/submitPreclosureInformation', loanRecoveryRouter.submitPreclosureInformation.bind(loanRecoveryRouter));

    server.post(props.contextPath+'/client/ci/individualPreclosure', loanRecoveryRouter.individualPreclosure.bind(loanRecoveryRouter));
    server.post(props.contextPath+'/client/ci/individualPreclosure/retrieveIndividualLoanDetails', loanRecoveryRouter.retrieveIndividualLoanDetailsForPreclosure.bind(loanRecoveryRouter));
    server.post(props.contextPath+'/client/ci/individualPreclosure/submitIndividualPreclosure', loanRecoveryRouter.submitIndividualPreclosure.bind(loanRecoveryRouter));

    server.post(props.contextPath+'/client/ci/reverse', loanRecoveryRouter.reverse.bind(loanRecoveryRouter));
    server.post(props.contextPath+'/client/ci/loanrecovery/reverse/submitreverseInformation', loanRecoveryRouter.submitreverseInformation.bind(loanRecoveryRouter));

    server.get(props.contextPath+'/client/ci/loanrecoveryactiveoffices', loanRecoveryRouter.loanrecoveryactiveoffices.bind(loanRecoveryRouter));
    server.post(props.contextPath+'/client/ci/loanrecoveryloanofficer', loanRecoveryRouter.loanrecoveryloanofficer.bind(loanRecoveryRouter));
    server.post(props.contextPath+'/client/ci/loanrecovery/loanofficers/:loanOfficerId/grouplist', loanRecoveryRouter.loanrecoverygrouplist.bind(loanRecoveryRouter));
    server.post(props.contextPath+'/client/ci/loanrecovery/groups/:globalCustomerNum/loanaccounts', loanRecoveryRouter.loanrecoveryloanaccounts.bind(loanRecoveryRouter));
    server.post(props.contextPath+'/client/ci/loanrecovery/loanaccount/:globalAccountNum/loaninformation', loanRecoveryRouter.loanrecoveryloaninformation.bind(loanRecoveryRouter));
    server.post(props.contextPath+'/client/ci/loanrecovery/applypayment', loanRecoveryRouter.applypayment.bind(loanRecoveryRouter));
    server.post(props.contextPath+'/client/ci/loanrecovery/doapplypayment', loanRecoveryRouter.doapplypayment.bind(loanRecoveryRouter));
    server.post(props.contextPath+'/client/ci/loanrecovery/listapplyadjustment', loanRecoveryRouter.listapplyadjustment.bind(loanRecoveryRouter));
    server.post(props.contextPath+'/client/ci/loanrecovery/applyadjustment', loanRecoveryRouter.applyadjustment.bind(loanRecoveryRouter));
    server.post(props.contextPath+'/client/ci/loanrecovery/applyadjustmentwhenobligationmet', loanRecoveryRouter.applyadjustmentwhenobligationmet.bind(loanRecoveryRouter));
    server.post(props.contextPath+'/client/ci/loanrecovery/doapplyadjustment', loanRecoveryRouter.doapplyadjustment.bind(loanRecoveryRouter));
    server.post(props.contextPath+'/client/ci/loanrecovery/doapplyadjustmentwhenobligationmet', loanRecoveryRouter.doapplyadjustmentwhenobligationmet.bind(loanRecoveryRouter));
    server.post(props.contextPath+'/client/ci/loanrecovery/editaccountstatus', loanRecoveryRouter.editaccountstatus.bind(loanRecoveryRouter));
    server.post(props.contextPath+'/client/ci/loanrecovery/doeditaccountstatus', loanRecoveryRouter.doeditaccountstatus.bind(loanRecoveryRouter));
    server.post(props.contextPath+'/client/ci/loanrecovery/paymentVerificationLoad', loanRecoveryRouter.paymentVerificationLoad.bind(loanRecoveryRouter));
    server.post(props.contextPath+'/client/ci/loanrecovery/doPaymentVerification', loanRecoveryRouter.doPaymentVerification.bind(loanRecoveryRouter));
    server.post(props.contextPath+'/client/ci/loanrecovery/downloadPaymentVerificationImage', loanRecoveryRouter.downloadPaymentVerificationImage.bind(loanRecoveryRouter));
    server.get(props.contextPath+'/client/ci/loanrecovery/chequeBounceLoad', loanRecoveryRouter.chequeBounceLoad.bind(loanRecoveryRouter));
    server.post(props.contextPath+'/client/ci/loanrecovery/searchChequeBounceLoad', loanRecoveryRouter.searchChequeBounceLoad.bind(loanRecoveryRouter));
    server.post(props.contextPath+'/client/ci/loanrecovery/revertChequePayment', loanRecoveryRouter.revertChequePayment.bind(loanRecoveryRouter));

    /*
     * Author : bask030
     * Date   : 13-Nov-2014
     * Module : LR FSO Travelling Path
     * */
    server.get(props.contextPath+'/loanRecovery/FSO/travellingPath',loanRecoveryRouter.lrFSOTravellingPath.bind(loanRecoveryRouter));
    server.post(props.contextPath+'/loanRecovery/FSO/travellingPath/ajaxCall',loanRecoveryRouter.FSOTravellingPath.bind(loanRecoveryRouter));
    server.post(props.contextPath+'/loanRecovery/FSO/travellingPath/getCurrentPosition',loanRecoveryRouter.getCurrentPosition.bind(loanRecoveryRouter));

    //Added by Sathish Kumar M 008 for Changing FO
    server.get(props.contextPath+'/client/ci/LRGroups/assignFOLoad',loanRecoveryRouter.assignFOLoad.bind(loanRecoveryRouter));
    server.post(props.contextPath+'/client/ci/LRGroups/groupsFOLoad',loanRecoveryRouter.groupsFOLoad.bind(loanRecoveryRouter));
    server.post(props.contextPath+'/client/ci/LRGroups/groupsForFOLoad',loanRecoveryRouter.groupsForFOLoad.bind(loanRecoveryRouter));
    server.post(props.contextPath+'/client/ci/LRGroups/assignFO',loanRecoveryRouter.assignFO.bind(loanRecoveryRouter));

    // Added by Chitra for Administrative Tasks Module and Fund Creation
    server.get(props.contextPath+'/client/ci/getAdministrativeTasksMenu', administrativeTasksRouter.getMenuForAdministrativeTasks.bind(administrativeTasksRouter));
    server.get(props.contextPath+'/client/ci/getAdministrativeTasksMenu/:menuName', administrativeTasksRouter.getMenuForAdministrativeTasks.bind(administrativeTasksRouter));
    server.post(props.contextPath+'/client/ci/fund/defineNewFund/:viewType/:fundId', administrativeTasksRouter.defineNewFund.bind(administrativeTasksRouter));
    server.post(props.contextPath+'/client/ci/fund/viewFund', administrativeTasksRouter.viewFundDetails.bind(administrativeTasksRouter));
    server.post(props.contextPath+'/client/ci/fund/saveOrUpdateFund/:saveType', administrativeTasksRouter.saveOrUpdateFundDetails.bind(administrativeTasksRouter));
    server.post(props.contextPath+'/client/ci/fund/generateFundCode', administrativeTasksRouter.generateFundCode.bind(administrativeTasksRouter));
    //Added by Sathish Kumar M 008
    server.post(props.contextPath+'/client/ci/gl/defineNewGL/:viewType', administrativeTasksRouter.defineNewGL.bind(administrativeTasksRouter));
    server.post(props.contextPath+'/client/ci/gl/viewGL', administrativeTasksRouter.viewGLDetails.bind(administrativeTasksRouter));
    server.post(props.contextPath+'/client/ci/gl/retriveFirstchildGLParent/:viewType', administrativeTasksRouter.retriveFirstchildGLParent.bind(administrativeTasksRouter));
    server.post(props.contextPath+'/client/ci/gl/retriveSecondchildGLParent/:viewType', administrativeTasksRouter.retriveSecondchildGLParent.bind(administrativeTasksRouter));
    server.post(props.contextPath+'/client/ci/gl/saveOrUpdateGL/:saveType', administrativeTasksRouter.saveOrUpdateGLDetails.bind(administrativeTasksRouter));
    server.get(props.contextPath+'/client/ci/loanproduct/listloanproduct', administrativeTasksRouter.listAllLoanProducts.bind(administrativeTasksRouter));
    server.post(props.contextPath+'/client/ci/loanproduct/listloanproduct/:prdOfferingId', administrativeTasksRouter.showLoanProductDetails.bind(administrativeTasksRouter));

    // Added by Chitra for the Reports Management
    server.get(props.contextPath+'/client/ci/reportsMenu',reportManagementRouter.reportsMenu.bind(reportManagementRouter));
    server.get(props.contextPath+'/client/ci/reportsMenuByCategory/:categoryId',reportManagementRouter.showReportManagementByCategory.bind(reportManagementRouter));
    server.get(props.contextPath+'/client/ci/reportManagement',reportManagementRouter.reportManagement.bind(reportManagementRouter));
    server.get(props.contextPath+'/client/ci/reportManagement/:ledgerValue/:typeOfReport/:categoryOfReport/:reportId',reportManagementRouter.reportManagement.bind(reportManagementRouter));
    server.post(props.contextPath+'/client/ci/reports/insuranceCoverReport', reportManagementRouter.insuranceCoverReportLoad.bind(reportManagementRouter));
    server.post(props.contextPath+'/client/ci/reports/bankBookReport', reportManagementRouter.bankBookReportLoad.bind(reportManagementRouter));
    server.post(props.contextPath+'/client/ci/reports/cashBookReport', reportManagementRouter.cashBookReportLoad.bind(reportManagementRouter));
    server.post(props.contextPath+'/client/ci/reports/generateReportWithOfficeDate', reportManagementRouter.generateReportWithOfficeDateLoad.bind(reportManagementRouter));
    server.post(props.contextPath+'/client/ci/reports/generateReportWithOfficeDateCustomerAccount', reportManagementRouter.generateReportWithOfficeDateCustomerAccountLoad.bind(reportManagementRouter));
    server.post(props.contextPath+'/client/ci/reports/accountDefaultPaymentsReport', reportManagementRouter.accountDefaultPaymentsReportLoad.bind(reportManagementRouter));
    server.get(props.contextPath+'/client/ci/showBackGroundVerification', reportManagementRouter.getGroupsForBackGroundVerification.bind(reportManagementRouter));
    server.post(props.contextPath+'/client/ci/getGroupsForBackGroundVerification/:branch', reportManagementRouter.getGroupsForBackGroundVerification.bind(reportManagementRouter));
    server.post(props.contextPath+'/client/ci/retrieveClientDetailsForVerification', reportManagementRouter.retrieveClientDetailsForVerification.bind(reportManagementRouter));


    // Modified @ Paramasivan
    server.post(props.contextPath+'/client/ci/generateReport', reportManagementRouter.generateReport.bind(reportManagementRouter));  // Groups in various stages Report

    // Added By Paramasivan for the Reports Management
    server.post(props.contextPath+'/client/ci/loanOfficers',reportManagementRouter.loanOfficers.bind(reportManagementRouter));
    server.post(props.contextPath+'/client/ci/trailBalance', reportManagementRouter.getTrailBalance.bind(reportManagementRouter));
    server.post(props.contextPath+'/client/ci/overdueSummary', reportManagementRouter.overdueSummary.bind(reportManagementRouter));
    server.post(props.contextPath+'/client/ci/demandCollectionSummary',reportManagementRouter.demandCollectionSummary.bind(reportManagementRouter));
    server.post(props.contextPath+'/client/ci/generalLedger',reportManagementRouter.generalLedgerSummary.bind(reportManagementRouter));
    server.post(props.contextPath+'/client/ci/voucherOrReceiptOrLoanDisbursementRepayment',reportManagementRouter.voucherOrReceiptOrLoanDP.bind(reportManagementRouter));
    server.post(props.contextPath+'/client/ci/principalOutstandingSummary',reportManagementRouter.principalOutstandingSummary.bind(reportManagementRouter));
    server.post(props.contextPath+'/client/ci/DEOActivityTracking',reportManagementRouter.DEOActivityTracking.bind(reportManagementRouter));
    server.post(props.contextPath+'/client/ci/PARReport',reportManagementRouter.PARReport.bind(reportManagementRouter));
    server.post(props.contextPath+'/client/ci/LUCTrackingReport',reportManagementRouter.LUCTrackingReport.bind(reportManagementRouter));

    //NPA Dashboard handler method starts
    server.post(props.contextPath+'/client/ci/viewnpaReport', reportManagementRouter.viewnpaReport.bind(reportManagementRouter));
    server.post(props.contextPath+'/client/ci/viewNpaAgingReport', reportManagementRouter.viewNpaAgingReport.bind(reportManagementRouter));
    server.post(props.contextPath+'/client/ci/viewNpaGroupSummaryReport', reportManagementRouter.viewNpaGroupSummaryReport.bind(reportManagementRouter));
    server.post(props.contextPath+'/client/ci/viewNpaDetailForDefaultDays', reportManagementRouter.viewNpaDetailForDefaultDays.bind(reportManagementRouter));

    server.get(props.contextPath+'/client/ci/viewNpaChartReport', reportManagementRouter.viewNpaChartReport.bind(reportManagementRouter));
    server.get(props.contextPath+'/client/ci/processNPA', reportManagementRouter.processnpa.bind(reportManagementRouter));
    server.post(props.contextPath+'/client/ci/process/npa', reportManagementRouter.generateNPA.bind(reportManagementRouter));

    server.get(props.contextPath+'/client/ci/showNPAMenuPage', reportManagementRouter.showNPAMenuPage.bind(reportManagementRouter));
    server.get(props.contextPath+'/client/ci/showNPAAgingMenuPage', reportManagementRouter.showNPAAgingMenuPage.bind(reportManagementRouter));
    server.get(props.contextPath+'/client/ci/showNPAGroupSummaryPage', reportManagementRouter.showNPAGroupSummaryPage.bind(reportManagementRouter));
    //NPA Dashboard handler method Ends

    server.get(props.contextPath+'/client/ci/searchnpa', reportManagementRouter.searchNPA.bind(reportManagementRouter));
    server.post(props.contextPath+'/client/ci/listsearchednpa', reportManagementRouter.listSearchedNPA.bind(reportManagementRouter));
    server.post(props.contextPath+'/client/ci/getofficelistajaxcall', reportManagementRouter.getOfficeListAjaxcall.bind(reportManagementRouter));

    server.get(props.contextPath+'/client/ci/getGroupsForRecovery', reportManagementRouter.getGroupsForRecovery.bind(reportManagementRouter));
    server.post(props.contextPath+'/client/ci/npaloans/:accountId/updateVerifiedInformation', reportManagementRouter.updateVerifiedInformation.bind(reportManagementRouter));
    server.post(props.contextPath+'/client/ci/retrieveClientDetails', reportManagementRouter.retrieveClientDetails.bind(reportManagementRouter));
    server.post(props.contextPath+'/client/ci/npaloans/:accountId/:clientId/uploadFile', reportManagementRouter.uploadFile.bind(reportManagementRouter));
    server.post(props.contextPath+'/client/ci/retrieveUploadedDocs', reportManagementRouter.retrieveUploadedDocs.bind(reportManagementRouter));
    server.get(props.contextPath+'/client/ci/NPALRGroups/todo/current',reportManagementRouter.NPALRTodoCurrent.bind(reportManagementRouter));
    server.get(props.contextPath+'/client/ci/NPALRGroups/todo/future',reportManagementRouter.NPALRTodoFuture.bind(reportManagementRouter));
    server.get(props.contextPath+'/client/ci/NPALRGroups/todo/overdue',reportManagementRouter.NPALRTodoOverdue.bind(reportManagementRouter));
    server.get(props.contextPath+'/client/ci/NPALRGroups/todo/closed',reportManagementRouter.NPALRTodoClosed.bind(reportManagementRouter));
    server.post(props.contextPath+'/client/ci/NPALRGroups/todo/submittask',reportManagementRouter.submitNpaCase.bind(reportManagementRouter));

    server.post(props.contextPath+'/client/ci/groups/member/docVerification', reportManagementRouter.docVerification.bind(reportManagementRouter));
    //document verification group list- report management
    server.post(props.contextPath+'/client/ci/reportManagement/docVerificationGroupList', reportManagementRouter.generateDocVerificationGroups.bind(reportManagementRouter));

    server.get('/mfi/api/1.0/client/ci/loadRescheduledGroups', reportManagementRouter.loadRescheduledGroups.bind(reportManagementRouter));
    server.post('/mfi/api/1.0/client/ci/groups/:globalAccountNum/retrieveRescheduledLoanAccounts', reportManagementRouter.retrieveRescheduledLoanAccounts.bind(reportManagementRouter));
    server.post('/mfi/api/1.0/client/ci/groups/updateRescheduledLoanAccount', reportManagementRouter.updateRescheduledLoanAccount.bind(reportManagementRouter));

    // Added Paramasivan for new report management
    server.get(props.contextPath+'/client/ci/loadReportsMenu',routerReports.loadReportsMenu.bind(routerReports));
    server.get(props.contextPath+'/client/ci/loadReportsByCategory/:categoryId',routerReports.loadReportsByCategory.bind(routerReports));
    server.get(props.contextPath+'/client/ci/loadReport/:categoryId/:spname/:reportId/:reportName',routerReports.loadReport.bind(routerReports));
    server.post(props.contextPath+'/client/ci/generateSelectedReport',routerReports.generateSelectedReport.bind(routerReports));
    server.post(props.contextPath+'/client/ci/downloadReports',routerReports.downloadReports.bind(routerReports));

    server.post(props.contextPath+'/client/ci/client/checkforexistingmember', reportManagementRouter.checkForAlreadyExistingmember.bind(reportManagementRouter));
    server.post(props.contextPath+'/client/ci/generateEquifaxReport', reportManagementRouter.generateEquifaxReport.bind(reportManagementRouter));
    server.post(props.contextPath+'/client/ci/generateEquifaxReport/:groupId/viewClient', reportManagementRouter.generateEquifaxReportClients.bind(reportManagementRouter));
    server.post(props.contextPath+'/client/ci/generateEquifaxReport/:clientId/downloadClientEquifaxReport', reportManagementRouter.downloadClientEquifaxReport.bind(reportManagementRouter));
    server.post(props.contextPath+'/client/ci/generateClientDocuments/:clientId/:docId/downloadUploadedImages', reportManagementRouter.downloadRequstedImage.bind(reportManagementRouter));
    server.post(props.contextPath+'/client/ci/downloadDocs', reportManagementRouter.downloadDocs.bind(reportManagementRouter));

    server.get(props.contextPath+'/client/ci/NPALRGroups/assignROLoad',reportManagementRouter.assignROLoad.bind(reportManagementRouter));
    server.post(props.contextPath+'/client/ci/NPALRGroups/assignRO',reportManagementRouter.assignRO.bind(reportManagementRouter));


    //Reports not used
    server.get(props.contextPath+'/client/ci/reports/loandisbursalReportLoad', reportManagementRouter.loanDisbursalReportLoad.bind(reportManagementRouter));
    server.post(props.contextPath+'/client/ci/reports/loanDisbursalReportLoadLoanOfficers', reportManagementRouter.loanDisbursalReportLoadLoanOfficers.bind(reportManagementRouter));
    server.post(props.contextPath+'/client/ci/reports/loandisbursalReportLoadDetail', reportManagementRouter.loandisbursalReportLoadDetail.bind(reportManagementRouter));
    server.get(props.contextPath+'/client/ci/reports/loanOutstandingReportLoad', reportManagementRouter.loanOutstandingReportLoad.bind(reportManagementRouter));
    server.post(props.contextPath+'/client/ci/reports/loanOutstandingReportLoadLoanOfficers', reportManagementRouter.loanOutstandingReportLoadLoanOfficers.bind(reportManagementRouter));
    server.post(props.contextPath+'/client/ci/reports/loanOutstandingReportLoadDetail', reportManagementRouter.loanOutstandingReportLoadDetail.bind(reportManagementRouter));

    server.get(props.contextPath + '/admin/ci/removableDocumentAvailability/:isAvailableSize/:isDelete',commonRouter.removableDocumentAvailability.bind(commonRouter));
    server.post(props.contextPath+'/client/ci/groups/:id/downloadingSourceImage', commonRouter.downloadingSourceImage.bind(commonRouter));
    
    var cronJob = require('cron').CronJob;
    new cronJob('10 06 * * *', dataEntryRouter.cronJobBOGroupStatus.bind(dataEntryRouter), null, true);
    var newModulesReferencesArray = [];
    newModulesReferencesArray.push(server);
    newModulesReferencesArray.push(commonRouter);
    newModulesReferencesArray.push(loanDisbursementRouter);
    newModulesReferencesArray.push(shortMessagingRouter);
    newModulesReferencesArray.push(accountingRouter);
    newModulesReferencesArray.push(androidRouter);
    newModulesReferencesArray.push(routerReports);
    newModulesReferencesArray.push(loanRecoveryRouter);
    newModulesReferencesArray.push(groupManagementRouter);
    newModulesReferencesArray.push(reportManagementRouter);
    newModulesReferencesArray.push(administrativeTasksRouter);
    newModulesReferencesArray.push(coordinatorVerificationRouter);
    newModulesReferencesArray.push(boDashBoardRouter);
    newModulesReferencesArray.push(businessCorrespondentDBRouter);
    return newModulesReferencesArray;
}
//exports.handler = handler;
module.exports = handler;