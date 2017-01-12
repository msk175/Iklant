module.exports = loanUtilCheck;

var path = require('path');
var rootPath = path.dirname(process.mainModule.filename);
var lucDtoPath = path.join(rootPath,"app_modules/dto/loan_utilization_check");
var props = require(path.join(rootPath,"properties.json"));
mifosServiceIP = props.mifosServiceIp;
mifosPort = props.mifosPort;
GPSPort = props.GPSPort;
iklantPort = props.iklantPort;
var LoanUtilCheckModel = require(path.join(rootPath,"app_modules/model/LoanUtilCheckModel"));
var customlog = require(path.join(rootPath,"logger/loggerConfig.js"))('LoanUtilCheckRouter.js');

function loanUtilCheck(constants) {
    customlog.debug("Inside Router");
    this.model = new LoanUtilCheckModel(constants);
    this.constants = constants;
}

loanUtilCheck.prototype = {
    loanUtilizationCheck: function(req,res){
        try{
            var self = this;
            var userId = req.session.userId;
            var tenantId = req.session.tenantId;
            var constantsObj = this.constants;
            var roleId = req.session.roleId;
            var officeId = req.session.officeId;
            var fieldOfficerId = (typeof req.body.fieldOfficer == 'undefined')?req.session.userId:req.body.fieldOfficer;
            var groupIdArray = new Array();
            var groupCodeArray = new Array();
            var groupNameArray = new Array();
            var personnelIdArray  = new Array();
            var personnelNameArray  = new Array();
            if (typeof tenantId == 'undefined' || typeof userId == 'undefined') {
                self.commonRouter.showErrorPage(req,res);
            } else {
                if(roleId == constantsObj.getBMroleId()) {
                    self.commonRouter.getPersonnelDetailsCall(officeId, req.session.userId, function (personnelIdArray, personnelNameArray) {
                        if(userId != fieldOfficerId){
                            self.getLUCGroups(officeId, fieldOfficerId, function(status, groupIds, groupCodes, groupNames, disbursementDate){
                                if(status == 'success') {
                                    self.showLUCGroups(res,roleId,personnelIdArray,personnelNameArray,constantsObj,fieldOfficerId,groupIds, groupCodes, groupNames, disbursementDate);
                                }
                                else{
                                    self.commonRouter.showErrorPage(req,res);
                                }
                            });
                        }
                        else{
                            self.showLUCGroups(res,roleId,personnelIdArray,personnelNameArray,constantsObj,fieldOfficerId,groupIdArray, groupCodeArray, groupNameArray, '');
                        }
                    });
                }
                else{
                    self.getLUCGroups(officeId, fieldOfficerId, function(status, groupIds, groupCodes, groupNames, disbursementDate){
                        if(status == 'success') {
                            self.showLUCGroups(res, roleId, personnelIdArray, personnelNameArray, constantsObj, fieldOfficerId, groupIds, groupCodes, groupNames, disbursementDate);
                        }
                        else{
                            self.commonRouter.showErrorPage(req,res);
                        }
                    });
                }
            }
        }catch(e){
            customlog.error("Exception while loanUtilizationCheck "+e);
            self.commonRouter.showErrorPage(req,res);
        }
    },
    getLUCGroups: function(officeId, fieldOfficerId, callback){
        this.model.getLUCGroupsModel(officeId, fieldOfficerId, callback);
    },
    showLUCGroups: function(res,roleId,personnelIdArray,personnelNameArray,constantsObj,fieldOfficerId,groupIds, groupCodes, groupNames, disbursementDate){
        res.render('loan_utilization_check/loanUtilizationCheck', {roleId: roleId, personnelIdArray: personnelIdArray, personnelNameArray: personnelNameArray,
            personnelId: fieldOfficerId, constantsObj: constantsObj, groupIds: groupIds, groupCodes: groupCodes, groupNames: groupNames, disbursementDate: disbursementDate,contextPath: props.contextPath});
    },
    getLUCAccounts: function(req,res){
        try{
            var self = this;
            var constantsObj = this.constants;
            var fieldOfficerId = req.body.fieldOfficer;
            var userId = req.session.userId;
            var tenantId = req.session.tenantId;
            var constantsObj = this.constants;
            var officeId = req.session.officeId;
            var loanAccountId = (typeof req.body.loanAccountId == 'undefined')?'':req.body.loanAccountId;
            var statusMessage = (typeof req.body.statusMessage == 'undefined')?'':req.body.statusMessage;
            var groupName = (typeof req.body.groupName == 'undefined')?'':req.body.groupName;
            if (typeof tenantId == 'undefined' || typeof userId == 'undefined') {
                self.commonRouter.showErrorPage(req,res);
            } else {
                self.retrieveLUCAccountsCall(req.body.groupId, function (status, accountIdArray, globalNameArray) {
                    if(status == 'success') {
                        if (loanAccountId != '') {
                            self.retrieveCustomerForLUC(loanAccountId, function (clientIdArray, clientCodeArray, clientNameArray, lastLUCDate, expectedLUCDate, lastLUCEndDate,clientMobileNumbers,clientLandLineNumbers,iklantClientIdArray) {
                                res.render('loan_utilization_check/lucForClients', {personnelId: fieldOfficerId, constantsObj: constantsObj, accountIdArray: accountIdArray,
                                    globalNameArray: globalNameArray, loanAccountId: loanAccountId, clientIds: clientIdArray, clientCodes: clientCodeArray,
                                    clientNames: clientNameArray, lastLUCDate: lastLUCDate, expectedLUCDate: expectedLUCDate, groupId: req.body.groupId,
                                    statusMessage: statusMessage, groupName: groupName, lastLUCEndDate: lastLUCEndDate, contextPath:props.contextPath,
                                    clientMobileNumbers : clientMobileNumbers ,clientLandLineNumbers : clientLandLineNumbers,iklantClientIdArray:iklantClientIdArray});
                            });
                        }
                        else {
                            res.render('loan_utilization_check/lucForClients', {personnelId: fieldOfficerId, constantsObj: constantsObj, accountIdArray: accountIdArray,
                                globalNameArray: globalNameArray, loanAccountId: loanAccountId, clientIds: '', clientCodes: '',
                                clientNames: '', lastLUCDate: '', groupId: req.body.groupId, statusMessage: statusMessage, groupName: groupName, lastLUCEndDate: '',
                                clientMobileNumbers : '' ,clientLandLineNumbers : '',contextPath:props.contextPath});
                        }
                    }else{
                        self.commonRouter.showErrorPage(req,res);
                    }
                })
            }
        }catch(e){
            customlog.error("Exception while getLUCAccounts "+e);
            self.commonRouter.showErrorPage(req,res);
        }
    },
    retrieveLUCAccountsCall: function(groupId, callback){
        this.model.retrieveLUCAccountsModel(groupId, callback);
    },
    retrieveCustomerForLUC: function(accountId, callback){
        this.model.retrieveLUCCustomerModel(accountId, callback);
    },
    populateClientDetails: function(req, res){
        var clientId = req.body.clientId;
        var parentAccountId = req.body.parentAccountId;
        this.retrieveClientDetailsForLUC(clientId, parentAccountId, function(result){
            req.body.clientDetails = result;
            res.send(req.body);
        });
    },
    retrieveClientDetailsForLUC: function(clientId, parentAccountId, callback) {
        this.model.retrieveClientDetailsForLUCModel(clientId, parentAccountId, callback);
    },
    saveLUCDetails: function(req, res){
        try{
            var self = this;
            var groupId = req.body.groupId;
            var lucObj = require(lucDtoPath +'/loanUtilizationCheck');
            var lucForClient = new lucObj();
            if (typeof req.body.clientId == 'undefined' || typeof req.session.userId == 'undefined') {
                self.commonRouter.showErrorPage(req,res);
            } else {
                lucForClient.setGroupParentId(groupId);
                lucForClient.setClientId(req.body.clientId);
                lucForClient.setAccountNumber(req.body.accountId);
                lucForClient.setLUCDoneBy(req.session.userId);
                if(req.body.is_loan_amount_used_for_intended_purpose == 'yes'){
                    lucForClient.setIsLoanAmountUsedForIntendedPurpose(1);
                    lucForClient.setReasonForLoanAmountNotUsed("");
                }
                else {
                    lucForClient.setIsLoanAmountUsedForIntendedPurpose(0);
                    lucForClient.setReasonForLoanAmountNotUsed(req.body.reason_for_loan_amount_not_used_for_intended_purpose);
                }
                if(req.body.physical_verification == 'yes'){
                    lucForClient.setPhysicalVerification(1);
                    lucForClient.setReasonForNotVerifyingPhysically("");
                }
                else {
                    lucForClient.setPhysicalVerification(0);
                    lucForClient.setReasonForNotVerifyingPhysically(req.body.reason_for_physical_verification_not_done);
                }
                if(req.body.is_luc_result_satisfied == 'yes'){
                    lucForClient.setIsLUCSatisfied(1);
                    lucForClient.setReasonForLUC("");
                }
                else {
                    lucForClient.setIsLUCSatisfied(0);
                    lucForClient.setReasonForLUC(req.body.reason_for_luc_result_not_satisfied);
                }
                if(req.body.is_there_any_grievance_with_fo_or_branch == 'yes'){
                    lucForClient.setIsThereAnyGrievance(1);
                    lucForClient.setRemarks(req.body.remarks);
                }
                else {
                    lucForClient.setIsThereAnyGrievance(0);
                    lucForClient.setRemarks("");
                }
                this.saveLUCDetailsCall(lucForClient, function(status){
                    if(status == 'success') {
                        req.body.statusMessage = "Loan utilization check completed successfully";
                        self.getLUCAccounts(req, res);
                    }
                    else{
                        self.commonRouter.showErrorPage(req,res);
                    }
                });
            }
        }catch(e){
            customlog.error("Exception while saveLUCDetails "+e);
            self.commonRouter.showErrorPage(req,res);
        }
    },
    saveLUCDetailsCall: function(lucForClient, callback) {
        this.model.saveLUCDetailsModel(lucForClient, callback);
    }
}