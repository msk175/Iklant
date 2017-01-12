module.exports = constants;

var SMHroleId = 1;
var AdminroleId = 2;
var BMroleId = 3;
var BDEroleId = 4;
var FOroleId = 5;
var DEOroleId = 6;
var CCEroleId = 7;
var naiveRoleId = 8;
var AccountsExecutiveRoleId = 9;
var ApexPromotors = 11;
var AMHroleId = 12;
var AuditorRoleId = 14;
var GuestUserRoleId = 15;
var ApexCoordinatorRoleId = 16;
var BcCoordinatorRoleId =17;

var groupCreationOperationId = 1;
var preliminaryVerificationOperationId = 2;
var KYCUploadingOperationId = 3;
var KYCDownloadingOperationId = 4;
var KYCUpdatingOperationId = 5;
var creditBureauAnalysedOperationId = 6;
var assigningFOOperationId = 7;
var fieldVerificationOperationId = 8;
var needMoreVerificationOperationId = 9;
var appraisalOperationId = 10;
var authorizeGroupOperationId = 11;
var loanSanctionOperationId = 12;
var synchronizedOperationId = 13;
var rejectedGroupsOperationId = 14;
var rejectedClientOperationId = 15;
var manageUsersOperationId = 16;
var manageOfficeOperationId = 17;
var manageRolesOperationId = 18;
var dataVerificationOperationId = 19;
var KYCUploadStatusOperationId = 20;
var areaCreationOperationId = 21;
var listAreaOperationId = 22;
var assignAreaOperationId = 23;
var groupRecognitionTestOperationId = 24;
var holdGroupsOperationId = 25;
var nextLoanPreCheck = 26;
var manageRolesAndPermissionsOperationId = 27;
var idleGroupsOperationId = 28;
var leaderSubLeaderUpdatingOperationId = 29;
var ldCalltrackingId = 30;
var leaderSubLeaderVerificationOperationId = 31;
var kycReUpdateOperationId = 32;
var ManageQuestionsOperationId = 33;
var AssignAuditorOperationId = 34;
var ClientAuthorizationOperationId = 35;

var newGroup = 1;
var preliminaryVerified = 2;
var KYCUploaded = 3;
var KYCCompleted = 4;
var creditBureauAnalysedStatus = 5;
var assignedFO = 6;
var FieldVerified = 7;
var NeedInformation = 8;
var appraisedStatus = 9;
var authorizedStatus = 10;
var loanSanctionedStatus = 11;
var synchronizedGroupsStatus = 12;
var groupRecognitionTested = 20;
var rejectedInNextLoanPreCheck = 21;
var rejectedWhileIdleGroupsStatusId = 22;
var leaderSubLeaderUpdatedStatus = 23;
var leaderSubLeaderVerifiedStatus = 24;
var archived = 13;
var RejectedPriliminaryVerification = 14;
var RejectedCreditBureauAnalysisStatusId = 15;
var RejectedFieldVerification = 16;
var RejectedAppraisal = 17;
var RejectedLoanSanction = 18;
var neededImageClarity = 1;
var RejectedKYCDataVerificationStatusId = 25;
var RejectedPreviousLoanStatusId = 26;
var KYCVerificationStatusId = 27;
var NeedRMApprovalStatusId = 28;
var RejectedKYCByRM = 29;
var LeaderSubleaderVerificationCompletedStatusId = 19;

var apexHeadOffice = 1;


var groupDocsEntity = 1;
var clientDocsEntity = 2;

var genderLookupEntity = 1;
var maritalStatusLookupEntity = 2;
var nationalityLookupEntity = 3;
var religionLookupEntity = 4;
var casteLookupEntity = 5;
var educationalDetailsLookupEntity = 6;
var loanPurposeLookupEntity = 7;
var relationshipLookupEntity = 8;
var familyRelationshipLookupEntity = 9;
var occupationLookupEntity = 10;
var houseLookupEntity = 11;
var houseCeilingLookupEntity = 12;
var houseWallLookupEntity = 13;
var houseFloorLookupEntity = 14;
var houseToiletLookupEntity = 15;
var guarantorRelationshipLookupEntity = 16;
var repaymentTrackRecordLookupEntity = 17;
var clientTypeEntity = 34;
var memberTypeLookUp = 117;
var subLeaderTypeLookUp = 116;

//Document type
var MOMDocId = 1;
var bankPassBookDocId = 2;
var applicationFormDocId = 3;
var loanFormDocId = 4;
var photoDocId = 5;
var memberIdProofDocId = 6;
var memberAddressProofDocId = 7;
var guarantorIdProofDocId = 8;
var guarantorAddressProofDocId = 9;
var equifaxReportDocId = 10;
var receiptDocId = 11;
var ownHouseReceiptDocId = 12;
var NOCId = 13;
var leaderSubLeaderDocId = 14;

var AadarIdProofDocId = 15 ;
var OtherIdProofDocId = 16;


var minimumNumberOfClients = 5;
var activeIndicatorTrue = 1;
var activeIndicatorFalse = 0;

var npaGroupLeaderTraceableQuestionId = 1;
var npaCapabilityPercentageQuestionId = 6;
var npaExpectedPaymentDateQuestionId = 7;
var npaReasonForNotPaidQuestionId = 8;

var npaCaseOpenStatusId = 1;
var npaCaseClosedStatusId = 5;

var meetingScheduleWeek = 1;
var meetingScheduleMonth = 2;

//meeting_type table
var customerMeetingTypeId = 4;

//loanType
var loanTypeIdSHG = 1
var loanTypeIdJLG = 2;

// reports Category
var financialReports = 1;
var operationalReports = 2;
var managementReports = 3;
var portfolioReports = 4;
var groupsReports = 5;
var groupMembersReports = 6;
var operationalMonthlyReports = 7;

//financial reports
var bankBookReport = 1;
var bankPaymentVoucherSummary = 2;
var bankReceiptVoucherSummary = 3;
var cashBookReport = 4;
var cashPaymentVoucherSummary = 5;
var cashReceiptVoucherSummary = 6;
var contraVoucherReport = 7;
var generalLedgerSummary = 8;
var groupLedgerReport = 9;
var groupLedgerInterestReport = 10;
var journalVoucherReport = 11;
var profitLossReport = 12;
var trailBalanceReport = 13;
var detailedTrailBalanceView = 14;

//Opearational reports
var closedAccountsReport = 15;
var dashboard = 16;
var docVerificationGroupList = 17;
var equifaxReportView = 18;
var groupAccountDefaultPaymentsReport = 19;
var reportView = 20;
var insuranceCoverReport = 21;
var loanAccountDefaultPaymentsReport = 22;
var loanDisbursalNewReport = 23;
var loanDisbursementAndRepaymentSummary = 24;
var loanDisbursalSummaryReport = 25;
var loanRepaymentReport = 26;
var loanRepaymentSummaryReport = 27;
var loanRescheduledReport = 28;
var loanTransactionReport = 29;
var loanWrittenOffReport = 30;
var overdueSummary = 31;
var overDueClientWiseReport = 32;
var delayedPaymentReport = 53;
var DEOActivityReport = 49;
var PARGroupWiseReport = 50;
var PARClientWiseReport = 51;
var GroupOutstandingClientWiseReport = 53;

//management reports
var activeGMReport = 33;
var activeGMSummaryReport = 34;
var createdGMSummaryReport = 35;
var demandCollectionClientWise = 36;
var demandCollectionSummary = 37;
var demandReportGroupWise = 38;
var demandReportClientWise = 52;
var NPASummary = 39;

//Portfolio reports
var groupOutstandingReport = 40;
var interestRateWisePrincipalOutstanding = 41;
var loanAmountWisePrincipalOutstanding = 42;
var loanCycleWisePrincipalOutstanding = 43;
var loanProductWisePrincipalOutstanding = 44;
var loanPurposeWisePrincipalOutstanding = 45;
var loanSizeWisePrincipalOutstanding = 46;
var officeWisePrincipalOutstanding = 47;
var stateWisePrincipalOutstanding = 48;

var accessTypeId = 1; // For Local
var financial_year = 20132014;
var minimumRatingRequiredForGroupRecognitionTest = 11;

// GCM Push Notification

var gcmApiKey = "AIzaSyBmccuiPlf04NTEwl9q4pUCSajgEmkkF3A";//"AIzaSyCR5BCjGm3JXfK41q3VCb5TLpOasoac5ZQ";

var fromDate = 100;
var toDate = 101;
var officeId = 102;
var fieldOfficerId = 103;
var productCategory = 104;
var productType = 105;
var customerName = 106;
var accountNo = 107;
var userId = 108;
var ledger = 110;
var npaIndicator = 111;
var loanStatus = 112;
var daysInArrears  = 113;
var Status = 114;
var fundId= 115;
var totalODAbove = 163;
var mfiFlag = 168;
var accFlag = 169;

var groupMemberDetail = "GroupMembersPersonalDetails";
var bankReconciliationReportId = 3;

var groupLevel = 1;
var clientLevel = 2;

var ageQuestionId = 1;
var educationalQualificationQuestionId = 2;
var maritalQuestionId = 3;
var earningQuestionId = 4;
var familySavingsQuestionId = 5;
var houseTypeQuestionId = 6;
var vehicleTypeQuestionId = 7;
var loanPurposeQuestionId = 8;
var bankAccInsuranceQuestionId = 9;
var otherMicrofinanceLoanQuestionId = 10;
var loanRepaymentTrackCBAQuestionId = 11;
var attendanceRatingQuestionId = 12;
var loanRepaymentTrackPrevLoanQuestionId = 13;
//LR payment collection status
var collected = 1;
var notCollected = 2;
var visited = 3;
var notVisited = 4;
var noAddressCoordinates = 5;

var organizationManagementActivityId = 1;
var officeManagementActivityId = 13;
var userManagementActivityId = 17;
var clientManagementActivityId = 33;
var productManagementActivityId = 89;
var loanManagementActivityId = 99;
var savingsManagementActivityId = 136;
var reportsManagementActivityId = 141;
var bulkManagementActivityId = 196;
var configurationManagementActivityId = 203;
var systemInformationManagementActivityId = 227;
var chartOfAccountsManagementActivityId = 1000;

var fundBookDebtReport = 13;
var ldTrackingReport = "LDCallTracking";

var lucOperationId = 'luc';
var clientOutstanding = "ClientOutstanding";
var clientDemand = "ClientDemand";
var bankReconciliation = "BankReconciliation";
var branchWiseOutstanding = "BranchWisePrincipalOutstanding";
var principalOutstandingDetailed = "GroupPrincipalOutstanding";
var overDueDBranchWiseReport = "OverDueBranchWiseSummary";
var overDueDetailedReport = "OverDueDetailed";
var disbursementAndOutstanding = "DisbursementandOutstanding";
var groupMemberDetail = "GroupMembersPersonalDetails";
var npaAndGLPDifference = "NPAandGPLDifference";
var pos = "PrincipalOutstanding";

// for kyc update verification
var bmVerified = 1;
var deoRejected = 2;
var rmVerified = 3;
var verificationFailed = 4;
var verificationSuccess = 5;

//rejected status
var rejectedStatusArray = new Array();
rejectedStatusArray.push(RejectedPriliminaryVerification);
rejectedStatusArray.push(RejectedCreditBureauAnalysisStatusId);
rejectedStatusArray.push(RejectedFieldVerification);
rejectedStatusArray.push(RejectedAppraisal);
rejectedStatusArray.push(RejectedLoanSanction);
rejectedStatusArray.push(rejectedInNextLoanPreCheck);
rejectedStatusArray.push(rejectedWhileIdleGroupsStatusId);
rejectedStatusArray.push(RejectedPreviousLoanStatusId);
rejectedStatusArray.push(RejectedKYCDataVerificationStatusId);
rejectedStatusArray.push(RejectedKYCByRM);
function constants() {
}

constants.prototype = {
	getBDEroleId: function(){
		return BDEroleId;
	},

	getAdminroleId: function(){
		return AdminroleId;
	},
	
	getBMroleId: function(){
		return BMroleId;
	},
	
	getFOroleId: function(){
		return FOroleId;
	},
	
	getDEOroleId: function(){
		return DEOroleId;
	},
    getNaiveroleId: function(){
        return naiveRoleId;
    },
	getAccountsExecutiveRoleId: function(){
		return AccountsExecutiveRoleId;
	},	
	getSMHroleId: function(){
		return SMHroleId;
	},
    getAMHroleId: function(){
        return AMHroleId;
    },
    getAuditorRoleId: function(){
        return AuditorRoleId;
    },
	getFieldVerificationOperationId: function(){
		return fieldVerificationOperationId;
	},
	getAppraisalOperationId: function(){
		return appraisalOperationId;
	},
	
	getGroupCreationOperationId: function(){
		return groupCreationOperationId;
	},
	
	getPreliminaryVerificationOperationId: function(){
		return preliminaryVerificationOperationId;
	},
	
	getKYCUploadingOperationId: function(){
		return KYCUploadingOperationId;
	},
	
	getKYCUpdatingOperationId: function(){
		return KYCUpdatingOperationId;
	},
	
	getLoanSanctionOperationId: function(){
		return loanSanctionOperationId;
	},
	
	getRejectedGroupsOperationId: function(){
		return rejectedGroupsOperationId;
	},
		
	getNeedMoreVerificationOperationId: function(){
		return needMoreVerificationOperationId;
	},
	
	getKYCDownloadingOperationId: function(){
		return KYCDownloadingOperationId;
	},
		
	getNewGroup: function(){
		return newGroup;
	},
	getPreliminaryVerified: function(){
		return preliminaryVerified;
	},
	getKYCUploaded: function(){
		return KYCUploaded;
	},
	getKYCCompleted: function(){
		return KYCCompleted;
	},	
	getAssignedFO: function(){
		return assignedFO;
	},
	getFieldVerified: function(){
		return FieldVerified;
	},
	getAppraisedStatus: function(){
		return appraisedStatus;
	},
	getLoanSanctionedStatus: function(){
		return loanSanctionedStatus;
	},
	getArchived: function(){
		return archived;
	},
	getRejectedPriliminaryVerification: function(){
		return RejectedPriliminaryVerification;
	},
	getRejectedAppraisal: function(){
		return RejectedAppraisal;
	},
    getRejectedLoanSanction: function(){
        return RejectedLoanSanction;
    },
	getRejectedFieldVerification: function(){
		return RejectedFieldVerification;
	},
	getNeedInformation : function(){
		return NeedInformation;
	},
	getCreditBureauAnalysedStatus : function(){
		return creditBureauAnalysedStatus;
	},
	getSynchronizedGroupsStatus : function(){
		return synchronizedGroupsStatus;
	},
	getRejectedInNextLoanPreCheck : function(){
		return rejectedInNextLoanPreCheck;
	},
    getGroupRecognitionTested: function() {
        return groupRecognitionTested;
    },
	getAuthorizedStatus : function(){
		return authorizedStatus;
	},
	getCreditBureauAnalysedOperationId : function(){
		return creditBureauAnalysedOperationId;
	},
	getSynchronizedOperationId : function(){
		return synchronizedOperationId;
	},	
	getAssigningFOOperationId : function(){
		return assigningFOOperationId;
	},	
	getManageUsersOperationId : function(){
		return manageUsersOperationId;
	},
	getManageOfficeOperationId : function(){
		return manageOfficeOperationId;
	},
	getManageRolesOperationId : function(){
		return manageRolesOperationId;
	},
    getDataVerificationOperationId : function(){
        return dataVerificationOperationId;
    },
	getAuthorizeGroupOperationId : function(){
		return authorizeGroupOperationId;
	},
	getRejectedClientOperationId : function(){
		return rejectedClientOperationId;
	},
    getKYCUploadStatusOperationId: function(){
        return KYCUploadStatusOperationId;
    },
	getAreaCreationOperationId: function(){
        return areaCreationOperationId;
    },
	getListAreaOperationId: function(){
        return listAreaOperationId;
    },
    getAssignAreaOperationId: function(){
        return assignAreaOperationId;
    },
    getGroupRecognitionTestOperationId: function() {
        return groupRecognitionTestOperationId;
    },
    getHoldGroupsOperationId: function() {
        return holdGroupsOperationId;
    },
    getNextLoanPreCheckOperationId: function() {
        return nextLoanPreCheck;
    },
    getRejectedCreditBureauAnalysisStatusId : function(){
		return RejectedCreditBureauAnalysisStatusId;
	},
    getApexHeadOffice : function(){
		return apexHeadOffice;
	},
	getGenderLookupEntity : function(){
		return genderLookupEntity;
	},
	getMaritalStatusLookupEntity : function(){
		return maritalStatusLookupEntity;
	},
	getNationalityLookupEntity : function(){
		return nationalityLookupEntity;
	},
	getReligionLookupEntity : function(){
		return religionLookupEntity;
	},
	getCasteLookupEntity : function(){
		return casteLookupEntity;
	},
	getEducationalDetailsLookupEntity : function(){
		return educationalDetailsLookupEntity;
	},
	getLoanPurposeLookupEntity : function(){
		return loanPurposeLookupEntity;
	},
	getRelationshipLookupEntity : function(){
		return relationshipLookupEntity;
	},
	getFamilyRelationshipLookupEntity : function(){
		return familyRelationshipLookupEntity;
	},
	getOccupationLookupEntity : function(){
		return occupationLookupEntity;
	},
	getHouseLookupEntity : function(){
		return houseLookupEntity;
	},
	getHouseCeilingLookupEntity : function(){
		return houseCeilingLookupEntity;
	},
	getHouseWallLookupEntity : function(){
		return houseWallLookupEntity;
	},
	getHouseFloorLookupEntity : function(){
		return houseFloorLookupEntity;
	},
	getHouseToiletLookupEntity : function(){
		return houseToiletLookupEntity;
	},
	getGuarantorRelationshipLookupEntity : function(){
		return guarantorRelationshipLookupEntity;
	},
	getRepaymentTrackRecordLookupEntity : function(){
		return repaymentTrackRecordLookupEntity;
	},
	getGroupDocsEntity : function(){
		return groupDocsEntity;
	},
	getClientDocsEntity : function(){
		return clientDocsEntity;
	},
	getMOMDocId : function(){
		return MOMDocId;
	},
	getBankPassBookDocId : function(){
		return bankPassBookDocId;
	},
	getApplicationFormDocId : function(){
		return applicationFormDocId;
	},
	getLoanFormDocId : function(){
		return loanFormDocId;
	},
	getPhotoDocId : function(){
		return photoDocId;
	},
	getMemberIdProofDocId : function(){
		return memberIdProofDocId;
	},
	getMemberAddressProofDocId : function(){
		return memberAddressProofDocId;
	},
	getGuarantorIdProofDocId : function(){
		return guarantorIdProofDocId;
	},
	getGuarantorAddressProofDocId : function(){
		return guarantorAddressProofDocId;
	},
	getEquifaxReportDocId : function(){
		return equifaxReportDocId;
	},
	getReceiptDocId : function(){
		return receiptDocId;
	},
	getOwnHouseReceiptDocId : function(){
		return ownHouseReceiptDocId;
	},
	getNOCId : function(){
		return NOCId;
	},
	getMinimumNumberOfClients : function(){
		return minimumNumberOfClients;
	},
	getActiveIndicatorTrue : function(){
		return activeIndicatorTrue;
	},
	getActiveIndicatorFalse : function(){
		return activeIndicatorFalse;
	},
	getNpaGroupLeaderTraceableQuestionId : function(){
		return npaGroupLeaderTraceableQuestionId;
	},
	getNpaCapabilityPercentageQuestionId : function(){
		return npaCapabilityPercentageQuestionId;
	},
	getNpaExpectedPaymentDateQuestionId : function(){
		return npaExpectedPaymentDateQuestionId;
	},	
	getNpaReasonForNotPaidQuestionId : function(){
		return npaReasonForNotPaidQuestionId;
	},
	getNpaCaseOpenStatusId : function(){
		return npaCaseOpenStatusId;
	},	
	getNpaCaseClosedStatusId : function(){
		return npaCaseClosedStatusId;
	},
	
	getMeetingScheduleWeek : function(){
		return meetingScheduleWeek;
	},

	getMeetingScheduleMonth : function(){
		return meetingScheduleMonth;
	},
	
	getCustomerMeetingTypeId : function(){
		return customerMeetingTypeId;
	},
	
	getLoanTypeIdJLG : function(){
		return loanTypeIdJLG;
	},
	
	getLoanTypeIdSHG : function(){
		return loanTypeIdSHG;
	},
	
	getNeededImageClarity : function(){
		return neededImageClarity;
	},

    getFinancialReports : function(){
        return financialReports;
    },

    getOperationalReports : function(){
        return operationalReports;
    },

    getOperationalMonthlyReports : function(){
        return operationalMonthlyReports;
    },

    getManagementReports : function(){
        return managementReports;
    },

    getPortfolioReports : function(){
        return portfolioReports;
    },

    getGroupsReports : function(){
        return groupsReports;
    },

    getGroupMembersReports : function(){
        return groupMembersReports;
    },

    getBankBookReport : function(){
        return bankBookReport;
    },

    getBankPaymentVoucherSummary : function(){
        return bankPaymentVoucherSummary;
    },

    getBankReceiptVoucherSummary : function(){
        return bankReceiptVoucherSummary;
    },

    getCashBookReport : function(){
        return cashBookReport;
    },

    getCashPaymentVoucherSummary : function(){
        return cashPaymentVoucherSummary;
    },

    getCashReceiptVoucherSummary : function(){
        return cashReceiptVoucherSummary;
    },

    getContraVoucherReport : function(){
        return contraVoucherReport;
    },

    getGroupLedgerReport : function(){
        return groupLedgerReport;
    },

    getGroupLedgerInterestReport : function(){
        return groupLedgerInterestReport;
    },

    getJournalVoucherReport : function(){
        return journalVoucherReport;
    },

    getProfitLossReport : function(){
        return profitLossReport;
    },

    getTrailBalanceReport : function(){
        return trailBalanceReport;
    },

    getDetailedTrailBalanceView : function(){
        return detailedTrailBalanceView;
    },

    getClosedAccountsReport : function(){
        return closedAccountsReport;
    },

    getDashboard : function(){
        return dashboard;
    },

    getDocVerificationGroupList : function(){
        return docVerificationGroupList;
    },

    getGeneralLedgerSummary : function(){
        return generalLedgerSummary;
    },

    getEquifaxReportView : function(){
        return equifaxReportView;
    },

    getGroupAccountDefaultPaymentsReport : function(){
        return groupAccountDefaultPaymentsReport;
    },

    getReportView : function(){
        return reportView;
    },

    getInsuranceCoverReport : function(){
        return insuranceCoverReport;
    },

    getLoanAccountDefaultPaymentsReport : function(){
        return loanAccountDefaultPaymentsReport;
    },

    getLoanDisbursalNewReport : function(){
        return loanDisbursalNewReport;
    },

    getLoanDisbursementAndRepaymentSummary : function(){
        return loanDisbursementAndRepaymentSummary;
    },

    getLoanDisbursalSummaryReport : function(){
        return loanDisbursalSummaryReport;
    },

    getLoanRepaymentReport : function(){
        return loanRepaymentReport;
    },

    getLoanRepaymentSummaryReport : function(){
        return loanRepaymentSummaryReport;
    },

    getLoanRescheduledReport : function(){
        return loanRescheduledReport;
    },

    getLoanTransactionReport : function(){
        return loanTransactionReport;
    },

    getLoanWrittenOffReport : function(){
        return loanWrittenOffReport;
    },

    getOverdueSummary : function(){
        return overdueSummary;
    },

    getOverDueClientWiseReport : function(){
        return overDueClientWiseReport;
    },

    getActiveGMReport : function(){
        return activeGMReport;
    },

    getActiveGMSummaryReport : function(){
        return activeGMSummaryReport;
    },

    getCreatedGMSummaryReport : function(){
        return createdGMSummaryReport;
    },

    getDemandCollectionClientWise : function(){
        return demandCollectionClientWise;
    },

    getDemandCollectionSummary : function(){
        return demandCollectionSummary;
    },

    getDemandGroupWiseReport : function(){
        return demandReportGroupWise;
    },

    getNPASummary : function(){
        return NPASummary;
    },

    getGroupOutstandingReport : function(){
        return groupOutstandingReport;
    },

    getInterestRateWisePrincipalOutstanding : function(){
        return interestRateWisePrincipalOutstanding;
    },

    getLoanAmountWisePrincipalOutstanding : function(){
        return loanAmountWisePrincipalOutstanding;
    },

    getLoanCycleWisePrincipalOutstanding : function(){
        return loanCycleWisePrincipalOutstanding;
    },

    getLoanProductWisePrincipalOutstanding : function(){
        return loanProductWisePrincipalOutstanding;
    },

    getLoanPurposeWisePrincipalOutstanding : function(){
        return loanPurposeWisePrincipalOutstanding;
    },

    getLoanSizeWisePrincipalOutstanding : function(){
        return loanSizeWisePrincipalOutstanding;
    },

    getOfficeWisePrincipalOutstanding : function(){
        return officeWisePrincipalOutstanding;
    },

    getStateWisePrincipalOutstanding : function(){
        return stateWisePrincipalOutstanding;
    },

    getDelayedPaymentReport : function(){
        return delayedPaymentReport;
    },

    getDEOActivityReport : function(){
        return DEOActivityReport;
    },

    getPARGroupWiseReport : function(){
        return PARGroupWiseReport;
    },

    getPARClientWiseReport : function(){
        return PARClientWiseReport;
    },
    getGroupOutstandingClientWiseReport : function(){
        return GroupOutstandingClientWiseReport;
    },
    getApexPromotors : function(){
		return ApexPromotors;
	},
    getCCEroleId: function(){
        return CCEroleId;
    },
	getGuestUserRoleId: function(){
		return GuestUserRoleId;
	},
	getApexCoordinatorRoleId : function(){
		return ApexCoordinatorRoleId;
	},
    getFinancialYear : function(){
        return financial_year;
    },
    getDemandClientWiseReport : function(){
        return demandReportClientWise;
    },

    getAccessTypeId: function(){
        return accessTypeId;
    },

    getGcmApiKey: function(){
        return gcmApiKey;
    },
    getMinimumRatingRequiredForGroupRecognitionTest: function() {
        return minimumRatingRequiredForGroupRecognitionTest;
    },
    getFromDateLabel: function() {
        return fromDate;
    },
    getToDateLabel: function() {
        return toDate;
    },
    getOfficeIdLabel: function() {
        return officeId;
    },
    getCustomerNameLabel: function() {
        return customerName;
    },
    getAccountNoLabel: function() {
        return accountNo;
    },
    getProductTypeLabel: function() {
        return productType;
    },
    getFieldOfficerIdLabel: function() {
        return fieldOfficerId;
    },
    getProductCategoryLabel: function() {
        return productCategory;
    },
    getUserIdLabel: function() {
        return userId;
    },
    getGroupLevel: function() {
        return groupLevel;
    },
    getClientLevel: function() {
        return clientLevel;
    },
    getLedger: function() {
        return ledger;
    },
    getNPAIndicatorLabel: function() {
        return npaIndicator;
    },
    getLoanStatusLabel: function() {
        return loanStatus;
    },
    getDaysInArrearsLabel: function() {
        return daysInArrears;
    },
	getTotalODAboveLabel: function() {
        return totalODAbove;
    },
    getStatusLabel: function() {
        return status;
    },
	getFundLabel: function() {
        return fundId;
    },
	getBankReconciliationReportId: function() {
        return bankReconciliationReportId;
    },
    getAgeQuestionId: function() {
        return ageQuestionId;
    },
	getCollectedStatus: function() {
		return collected;
	},
	getNotCollectedStatus: function() {
		return notCollected;
	},
    getVisitedStatus: function(){
        return visited;
    },
    getNotVisitedStatus: function(){
        return notVisited;
    },
    getNoAddressCoordinatesStatus: function() {
        return noAddressCoordinates;
    },
    getEducationalQualificationQuestionId: function() {
        return educationalQualificationQuestionId;
    },
    getMaritalQuestionId: function() {
        return maritalQuestionId;
    },
    getEarningQuestionId: function() {
        return earningQuestionId;
    },
    getFamilySavingsQuestionId: function() {
        return familySavingsQuestionId;
    },
    getHouseTypeQuestionId: function() {
        return houseTypeQuestionId;
    },
    getVehicleTypeQuestionId: function() {
        return vehicleTypeQuestionId;
    },
    getLoanPurposeQuestionId: function() {
        return loanPurposeQuestionId;
    },
    getBankAccInsuranceQuestionId: function() {
        return bankAccInsuranceQuestionId;
    },
    getOtherMicrofinanceLoanQuestionId: function() {
        return otherMicrofinanceLoanQuestionId;
    },
    getLoanRepaymentTrackCBAQuestionId: function() {
        return loanRepaymentTrackCBAQuestionId;
    },
    getAttendanceRatingQuestionId: function() {
        return attendanceRatingQuestionId;
    },
    getLoanRepaymentTrackPrevLoanQuestionId: function() {
        return loanRepaymentTrackPrevLoanQuestionId;
    },
    getManageRolesAndPermissionsOperationId : function(){
        return manageRolesAndPermissionsOperationId;
    },
    getIdleGroupsOperationId : function(){
		return idleGroupsOperationId;
	},
	getRejectedWhileIdleGroupsStatusId : function(){
		return rejectedWhileIdleGroupsStatusId;
	},
    getLeaderSubLeaderUpdatingOperationId : function(){
        return leaderSubLeaderUpdatingOperationId;
    },
	getGroupMembersDetailReport: function() {
		return groupMemberDetail;
	},
	getLeaderSubLeaderUpdatedStatus : function(){
        return leaderSubLeaderUpdatedStatus;
    },
    getOrganizationManagementActivityId: function(){
        return organizationManagementActivityId;
    },
    getOfficeManagementActivityId: function(){
        return officeManagementActivityId;
    },
    getUserManagementActivityId: function(){
        return userManagementActivityId;
    },

    getLeaderSubLeaderVerificationOperationId : function(){
        return leaderSubLeaderVerificationOperationId;
    },
    getLeaderSubLeaderVerifiedStatus : function(){
        return leaderSubLeaderVerifiedStatus;
    },
    getClientTypeEntity : function(){
        return clientTypeEntity;
    },
    getLeaderSubLeaderDocId : function(){
        return leaderSubLeaderDocId;
    },
    getClientManagementActivityId: function(){
        return clientManagementActivityId;
    },
    getProductManagementActivityId: function(){
        return productManagementActivityId;
    },
    getLoanManagementActivityId: function(){
        return loanManagementActivityId;
    },
    getSavingsManagementActivityId: function(){
        return savingsManagementActivityId;
    },
    getReportsManagementActivityId: function(){
        return reportsManagementActivityId;
    },
    getLdCalltrackingId : function(){
        return ldCalltrackingId;
    },
    getBulkManagementActivityId: function(){
        return bulkManagementActivityId;
    },
    getConfigurationManagementActivityId: function(){
        return configurationManagementActivityId;
    },
    getSystemInformationManagementActivityId: function(){
        return systemInformationManagementActivityId;
    },
    getChartOfAccountsManagementActivityId: function(){
        return chartOfAccountsManagementActivityId;
    },
   getFundBookDebtReport: function(){
        return fundBookDebtReport;
    },
    getMemberTypeLookUp : function(){
        return memberTypeLookUp;
    },
    getSubLeaderTypeLookUp : function(){
        return subLeaderTypeLookUp;
    },
	getLDTrackingReport: function(){
        return ldTrackingReport;
    },
	getLUCOperationId: function(){
        return lucOperationId;
    },
	getKYCReUpdateOperationId: function(){
        return kycReUpdateOperationId;
    },
    getBMVerified : function(){
        return bmVerified;
    },
	getDEORejected: function(){
        return deoRejected;
    },
	getRMVerified: function(){
        return rmVerified;
    },
	getVerificationFailed: function(){
        return verificationFailed;
    },
	getVerificationSuccess: function(){
        return verificationSuccess;
    },
    getManageQuestionsOperationId: function(){
        return ManageQuestionsOperationId;
    },
    getRejectedStatusIds: function(){
        return rejectedStatusArray.toString();
    },
    getAssignAuditorOperationId : function (){
        return AssignAuditorOperationId;
    },
	getClientAuthorizationOperationId : function (){
		return ClientAuthorizationOperationId;
	},
    getRejectedKYCDataVerificationStatusId : function (){
        return RejectedKYCDataVerificationStatusId;
    },
    getBankReconciliation: function() {
        return bankReconciliation;
    },
    getClientOutstanding: function() {
        return clientOutstanding;
    },
    getClientDemand: function() {
        return clientDemand;
    },
    getBranchWisePrincipalOutstandingSummary: function() {
        return branchWiseOutstanding;
    },
    getDetailedPrincipalOutstanding: function() {
        return principalOutstandingDetailed;
    },
    getOverDueDetailedReport: function() {
        return overDueDetailedReport;
    },
    getOverDueBranchWiseReport: function() {
        return overDueDBranchWiseReport;
    },
    getDisbursementAndOutstanding: function() {
        return disbursementAndOutstanding;
    },
    getGroupMembersDetailReport: function() {
        return groupMemberDetail;
    },
    getPOSReport: function() {
        return pos;
    },
    getGPLNPADifferenceReport: function() {
        return npaAndGLPDifference;
    },
	getKYCVerificationStatusId : function (){
		return KYCVerificationStatusId;
	},
    getRejectedPreviousLoanStatusId : function (){
        return RejectedPreviousLoanStatusId;
    },
	getNeedRMApprovalStatusId : function (){
		return NeedRMApprovalStatusId;
	},
	getLeaderSubleaderVerificationCompletedStatusId : function (){
		return LeaderSubleaderVerificationCompletedStatusId;
	},
	getRejectedKYCByRM : function (){
		return RejectedKYCByRM;
	},
    getMfiFlag : function(){
        return mfiFlag;
    },
    getAccFlag : function(){
        return accFlag;
    },
    getAadarIdProofDocId : function() {
        return AadarIdProofDocId;
    },
    getOtherIdProofDocId : function() {
        return OtherIdProofDocId;
    },
	getBcCoordinatorRoleId: function(){
		return BcCoordinatorRoleId;
	}
};