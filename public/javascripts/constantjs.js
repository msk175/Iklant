ajaxcallip = window.location.hostname+":"+window.location.port;
minimumClients = 5;

hoId = 1;
smhRoleId = 1;
bmRoleId = 3;
foRoleId = 5;
bdeRoleId=4;
naiveRoleId = 8;
aeRoleId = 9;
cceRoleId = 7;
amhRoleId = 12;

//Status Constants
preliminaryVerified = 2;
creditBureauAnalysedStatus = 5;
assignedFO = 6;
FieldVerified = 7;
appraisedStatus = 9;
RejectedPriliminaryVerification = 14;
RejectedCreditBureauAnalysisStatusId = 15;
RejectedFieldVerification = 16;
RejectedAppraisal = 17;
dataVerified = 19;
rejectedInNextLoanPreCheck = 21;
rejectedWhileIdleGroupsStatusId = 22;

//Operation Constants
preliminaryVerificationOperationId = 2;
KYCUploadingOperationId = 3;
kycDownloadingOperationId = 4;
kycUpdatingOperationId = 5;
creditBureauAnalysedOperationId = 6;
fieldVerificationOperationId = 8;
neededMoreinformationOperationId = 9;
appraisalOperationId = 10;
authorizeGroupOperationId = 11;
loanSanctionOperationId = 12;
synchronizedOperationId = 13;
rejectedGroupsOperationId = 14;
rejectedClientOperationId = 15;
manageOfficeOperationId = 17;
dataVerificationOperationId = 19;
kycUpdatingStatusOperationId = 20;
groupRecognitionTestOperationId = 24;
holdGroupsOperationId = 25;
nextLoanPreCheck = 26;
idleGroupsOperationId = 28;
leaderSubLeaderUpdatingOperationId = 29;
leaderSubLeaderVerificationOperationId = 31;
kycReUpdateOperationId = 32;

memberTypeLookUp = 117;
subLeaderTypeLookUp = 116;

//Lookup Value
ownHouse = 32;
rentalHouse = 33;
leaseHouse = 34;

//DocumentId
MOMBookId = 1;
bankPassBookId = 2;

groupLevel = 1;
clientLevel = 2;

poorStatus = "Poor";
averageStatus = "Average";
goodStatus = "Good";
vGoodStatus = "Very Good";
excellentStatus = "Excellent";

callStatusSuccess = "Call Success";
callStatusNoResponse = "No response";
callStatusNotAware = "Family member not aware";
callStatusWrongNumber = "Wrong Number";
callStatusOff = "Switched off";
callStatusBusy = "Busy";
callStatusRing = "Ringing No Response";
callStatusNotReach = "Not Reachable";
callStatusIncorrect = "Incorrect Number";
callStatusBarred = "Barred";
callStatusNoNum = "No mobile no";
callStatusAvailability = "Member not available";

deoRejected = 2;
verificationFailed = 4;
verificationSuccess = 5;
