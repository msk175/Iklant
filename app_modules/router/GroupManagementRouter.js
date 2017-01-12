module.exports = groupManagement;
var path = require('path');
var rootPath = path.dirname(process.mainModule.filename);
var props = require(path.join(rootPath,"properties.json"));
var GroupManagementModel = require(path.join(rootPath,"app_modules/model/GroupManagementModel"));

var customLog = require(path.join(rootPath,"logger/loggerConfig.js"))('GroupManagementRouter.js');
var dateUtils = require(path.join(rootPath,"app_modules/utils/DateUtils"));
var commonDTO = path.join(rootPath,"app_modules/dto/common");
var groupManagementDTO = path.join(rootPath,"app_modules/dto/group_management");

mifosServiceIP = props.mifosServiceIp;
mifosPort = props.mifosPort;
GPSPort = props.GPSPort;
microFinanceGlcode = props.microFinanceGlcode;
iklantPort = props.iklantPort;

function groupManagement(constants) {
    customLog.debug("Inside Router");
    this.model = new GroupManagementModel(constants);
    this.constants = constants;
}

groupManagement.prototype = {
    //Ezra Johnson
    getKYCUploadStatus: function(req, res){
        try{
            var self = this;
            var constantsObj = this.constants;
            var groupId = req.body.groupId;
            var centerName = req.body.centerName;
            var groupName = req.body.groupName;
            var fieldOfficer = req.body.fieldOfficer;
            if(typeof(centerName) == 'undefined' || typeof(groupName) == 'undefined' || typeof(fieldOfficer) == 'undefined' || typeof(groupId) == 'undefined'){
                res.redirect(props.contextPath+'/client/ci/login');
            } else {
                this.model.getKYCUploadStatusModel(groupId, function(uploadStatusDetails){
                    if(uploadStatusDetails != null){
                        var kycStatus = require(groupManagementDTO +'/KYCupdateStatus');
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
                    customLog.info(uploadStatusArray)
                    res.render('group_management/kycStatusDetails',{kycUploadStatus: uploadStatusArray, groupId: groupId, groupName: groupName, centerName: centerName, fieldOfficer: fieldOfficer, contextPath:props.contextPath,roleId:req.session.roleId,constantsObj:constantsObj});
                });
            }
        }catch(e){
            customLog.error("Exception while getKYCUploadStatus "+e);
            self.commonRouter.showErrorPage(req,res);
        }
    },

    moveForDataEntry: function(req, res) {
        try{
            customLog.info("moving to data entry");
            var self = this;
            var constantsObj = this.constants;
            if(typeof req.params.groupId == 'undefined'){
                res.redirect(props.contextPath+'/client/ci/login');
            } else {
                var groupId = req.params.groupId;
                customLog.info("groupId: "+groupId);
                this.model.moveForDataEntryModel(groupId, function(queryStatus) {
                    customLog.info("queryStatus: "+queryStatus);
                    res.redirect(props.contextPath+'/client/ci/groups/operation/'+constantsObj.getKYCUploadStatusOperationId());
                });
            }
        }catch(e){
            customLog.error("Exception while moveForDataEntry "+e);
            self.commonRouter.showErrorPage(req,res);
        }
    },

    getGroupRecognitionTestDetails: function(req, res) {
        try{
            customLog.info("inside getGroupRecognitionTestDetails");
            var groupId = req.body.groupId;
            var centerName = req.body.centerName;
            var groupName = req.body.groupName;
            customLog.info("groupId: "+groupId);
            customLog.info("centerName: "+centerName);
            customLog.info("groupName: "+groupName);
            var self = this;
            var constantsObj = this.constants;
            if (typeof req.session.tenantId == 'undefined' || typeof req.session.userId == 'undefined') {
                res.redirect(props.contextPath+'/client/ci/login');
            } else {
                self.getGroupRecognitionTestDetailsCall(groupId,function(status,categoryId,categoryDesc,questionCategoryId,question,questionId,noOfClients) {
                    if(status == 'success') {
                        res.render('group_management/GRT',{categoryId: categoryId,categoryDesc: categoryDesc,
                            questionCategoryId: questionCategoryId,question: question,questionIdDetails: questionId,
                            groupId: groupId,centerName: centerName,groupName: groupName,noOfClients: noOfClients, contextPath:props.contextPath,constantsObj:constantsObj,roleId:req.session.roleId});
                    } else {
                        self.commonRouter.showErrorPage(req,res);
                    }

                });
            }
        }catch(e){
            customLog.error("Exception while getGroupRecognitionTestDetails "+e);
            self.commonRouter.showErrorPage(req,res);
        }
    },

    getGroupRecognitionTestDetailsCall: function(groupId,callback){
        this.model.getGroupRecognitionTestDetailsModel(groupId,callback);
    },

    submitRatingForGRT: function(req, res) {
        try{
            customLog.info('inside submitRatingForGRT');
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
            customLog.info(questionIdDetails);
            customLog.info(checkedOrNotDetails);
            customLog.info(totalRating);
            customLog.info(groupId);
            customLog.info(req.session.userId);

            var self = this;
            if (typeof req.session.tenantId == 'undefined' || typeof req.session.userId == 'undefined' || typeof totalRating == 'undefined') {
                res.redirect(props.contextPath+'/client/ci/login');
            } else {
                self.saveRatingForGRT(groupId,questionIdDetails,req.session.userId,checkedOrNotDetails,totalRating,remarks, function(status, isMoved) {
                    if(status == 'success') {
                        customLog.info('isMoved: '+isMoved);
                        if(isMoved == 1) {
                            customLog.info("Moved for Loan authorization");
                            statusMsg = "Group moved for Loan authorization";
                        } else {
                            customLog.error("Group Recognition Test Failed. please go for re-training.");
                            statusMsg = "Group Recognition Test Failed. please go for re-training.";
                        }
                        self.commonRouter.ListGroupsCall(tenantId,userId,officeId,roleId,constantsObj.getGroupRecognitionTestOperationId(),function(listGroupsIdArray,listGroupsArray,activeClients,neededInfo,isSynchronized,listGroupsGlobalNumberArray,fieldOfficerName,neededImageClarity,mifosCustomerId,isDataVerifiedArray,activeClientsPerStatus,dataEntryDate,error_msg_array,accountNumbers, loanCount){
                            self.commonRouter.showListGroupsOperations(req, res,constantsObj.getGroupRecognitionTestOperationId(),listGroupsIdArray,listGroupsArray,activeClients,neededInfo,isSynchronized,listGroupsGlobalNumberArray,fieldOfficerName,neededImageClarity,mifosCustomerId,isDataVerifiedArray,"",officeId,statusMsg,activeClientsPerStatus,dataEntryDate,error_msg_array,"",accountNumbers, loanCount);
                        });
                        customLog.info("success");
                    } else {
                        self.commonRouter.showErrorPage(req,res);
                    }
                });
            }
        }catch(e){
            customLog.error("Exception while submitRatingForGRT "+e);
            self.commonRouter.showErrorPage(req,res);
        }
    },

    saveRatingForGRT: function(groupId,questionIdDetails,createdBy,checkedOrNotDetails,totalRating,remarks, callback) {
        this.model.saveRatingForGRTModel(groupId,questionIdDetails,createdBy,checkedOrNotDetails,totalRating,remarks, callback);
    },

    retrieveClientsForLS : function(req,res) {
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
                self.listClientsForLoanSanctionCall(groupId,mifosCustomerId,function(groupId,thisclientId,clientNameArray,groupNameForLoanSanction,clientIdArray,productCategoryId,ProductCategoryType,disbDate,globalAccountNum){
                    if(disbDate != '' || globalAccountNum != ''){
                        self.showLoanSanctionPage(res,groupId,mifosCustomerId,0,isSynchronized,thisclientId,clientNameArray,groupNameForLoanSanction,clientIdArray,productCategoryId,ProductCategoryType,officeId, docLanguage);
                    }
                    else{
                        self.commonRouter.showErrorPage(req,res);
                    }
                });
            }
        }catch(e){
            customLog.error("Exception while retrive clients for LS "+e);
            self.commonRouter.showErrorPage(req,res);
        }
    },

    listClientsForLoanSanctionCall:function(groupId,mifosCustomerId,callback){
        this.model.listClientsForLoanSanctionModel(groupId,mifosCustomerId,callback);
    },

    showLoanSanctionPage : function(res,groupId,mifosCustomerId,path,isSynchronized,thisclientId,clientNameArray,groupNameForLoanSanction,clientIdArray,productCategoryId,ProductCategoryType,officeId, docLanguage) {
        res.render('group_management/LoanSanctionFileUpload', {groupId:groupId, mifosCustomerId:mifosCustomerId,thisclientId : thisclientId, clientNameArray : clientNameArray, groupNameForLoanSanction : groupNameForLoanSanction,
            clientIdArray : clientIdArray, productCategoryId : productCategoryId, ProductCategoryType : ProductCategoryType ,path:path, isSynchronized:isSynchronized,officeValue:officeId,docLanguage:docLanguage, contextPath:props.contextPath});
    },

    //Generate loan sanction form and kyc form from Synchronized page
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
                var clientName = (req.body.clientnamehidden).split(",");
                var prdid = req.body.prdidhidden;
                var formType = req.body.formTypeName;
                var bcOfficeId = req.session.bcOfficeId;
                if(formType == 1) {
                    self.commonRouter.KYCFileUploadForLoanSanctionCall(clientid,formType,mifosCustomerId,docLanguage,bcOfficeId,function(client_name,groupId,groupName,isSynchronized){
                        self.listClientsForLoanSanctionCall(groupId,mifosCustomerId,function(groupId,thisclientId,clientNameArray,groupNameForLoanSanction,clientIdArray,productCategoryId,ProductCategoryType,disbDate,globalAccountNum){

                            var path = "/GeneratedPDF/"+groupName+"_KYCform.pdf";
                            customLog.info("PATH : " + path);

                            setTimeout(self.showLoanSanctionPage(res,groupId,mifosCustomerId,path,isSynchronized,thisclientId,clientNameArray,groupNameForLoanSanction,clientIdArray,productCategoryId,ProductCategoryType,officeId,docLanguage),600000);
                        });
                    });
                }
                else if(formType == 2) {
                    self.commonRouter.KYCFileUploadForLoanSanctionCall(clientid,formType,mifosCustomerId,docLanguage,bcOfficeId,function(client_name,groupId,groupName,isSynchronized){
                        self.listClientsForLoanSanctionCall(groupId,mifosCustomerId,function(groupId,thisclientId,clientNameArray,groupNameForLoanSanction,clientIdArray,
                                                                                             productCategoryId,ProductCategoryType,disbDate,globalAccountNum,disbAmount,interestRateValue,recurrenceType){
                            customLog.info("\n");
                            customLog.info("groupName" + groupName);
                            self.loanDisbursementRouter.fileUploadForLoanSanctionCall(clientid,groupName,globalAccountNum,docLanguage,bcOfficeId, function(){
                                var path = "/GeneratedPDF/"+groupName+"_loanform.pdf";
                                customLog.info("PATH : " + path);

                                setTimeout(self.showLoanSanctionPage(res,groupId,mifosCustomerId,path,isSynchronized,thisclientId,clientNameArray,groupNameForLoanSanction,clientIdArray,productCategoryId,ProductCategoryType,officeId,docLanguage),600000);
                            });
                        });
                    });
                }
                else if(formType == 3) {
                    self.commonRouter.KYCFileUploadForLoanSanctionCall(clientid,formType,mifosCustomerId,docLanguage,bcOfficeId,function(client_name,groupId,groupName,isSynchronized){
                        self.listClientsForLoanSanctionCall(groupId,mifosCustomerId,function(groupId,thisclientId,clientNameArray,groupNameForLoanSanction,clientIdArray,
                                                                                             productCategoryId,ProductCategoryType,disbDate,globalAccountNum,disbAmount,interestRateValue,recurrenceType){
                            req.body.mifosCustomerId = mifosCustomerId;
                            req.body.syncDisbDate = disbDate;
                            req.body.mifosGlobalAccNo = globalAccountNum;
                            req.body.disbAmount = disbAmount;
                            req.body.interestRateValue = interestRateValue;
                            req.body.recurrenceType = recurrenceType;
                            self.commonRouter.generateLegalForm(req,res,function(){
                                var path = "/GeneratedPDF/"+mifosCustomerId+"_legalform.pdf";
                                customLog.info("PATH : " + path);

                                setTimeout(self.showLoanSanctionPage(res,groupId,mifosCustomerId,path,isSynchronized,thisclientId,clientNameArray,groupNameForLoanSanction,clientIdArray,productCategoryId,ProductCategoryType,officeId,docLanguage),600000);
                            });
                        });
                    });
                }
                else if(formType == 4) {
                    self.commonRouter.KYCFileUploadForLoanSanctionCall(clientid,formType,mifosCustomerId,docLanguage,bcOfficeId,function(client_name,groupId,groupName,isSynchronized){
                        self.listClientsForLoanSanctionCall(groupId,mifosCustomerId,function(groupId,thisclientId,clientNameArray,groupNameForLoanSanction,clientIdArray,
                                                                                             productCategoryId,ProductCategoryType,disbDate,globalAccountNum,disbAmount,interestRateValue,recurrenceType){
                            req.body.mifosCustomerId = mifosCustomerId;
                            req.body.mifosGlobalAccNo = globalAccountNum;
                            req.body.syncDisbDate = disbDate;
                            self.commonRouter.generatePromissoryNote(req,res,function(){
                                var path = "/GeneratedPDF/"+mifosCustomerId+"_promissoryNote.pdf";
                                customLog.info("PATH : " + path);
                                setTimeout(self.showLoanSanctionPage(res,groupId,mifosCustomerId,path,isSynchronized,thisclientId,clientNameArray,groupNameForLoanSanction,clientIdArray,productCategoryId,ProductCategoryType,officeId,docLanguage),600000);
                            });
                        });
                    });
                }
                else if(formType == 5) {
                    self.commonRouter.KYCFileUploadForLoanSanctionCall(clientid,formType,mifosCustomerId,docLanguage,bcOfficeId,function(client_name,groupId,groupName,isSynchronized){
                        self.listClientsForLoanSanctionCall(groupId,mifosCustomerId,function(groupId,thisclientId,clientNameArray,groupNameForLoanSanction,clientIdArray,productCategoryId,ProductCategoryType,disbDate,globalAccountNum,disbAmount,interestRateValue,recurrenceType,subLeaderNameArray,clientCodeArray){
                            req.body.mifosCustomerId = mifosCustomerId;
                            req.body.mifosGlobalAccNo = globalAccountNum;
                            req.body.syncDisbDate = disbDate;
                            req.body.subLeaderNameArray = subLeaderNameArray;
                            req.body.clientCodeArray = clientCodeArray;
                            self.commonRouter.generateLoanScheduleForm(req,res,function(){
                                var path = "/GeneratedPDF/"+mifosCustomerId+"_loanRepaymentSchedule.pdf";
                                customLog.info("PATH : " + path);
                                setTimeout(self.showLoanSanctionPage(res,groupId,mifosCustomerId,path,isSynchronized,thisclientId,clientNameArray,groupNameForLoanSanction,clientIdArray,productCategoryId,ProductCategoryType,officeId,docLanguage),600000);

                            });
                        });
                    });
                }
                else if(formType == 6) {
                    self.commonRouter.KYCFileUploadForLoanSanctionCall(clientid,formType,mifosCustomerId, docLanguage,bcOfficeId,function(client_name,groupId,groupName,isSynchronized){
                        self.listClientsForLoanSanctionCall(groupId,mifosCustomerId,function(groupId,thisclientId,clientNameArray,groupNameForLoanSanction,clientIdArray,
                                                                                             productCategoryId,ProductCategoryType,disbDate,globalAccountNum,disbAmount,interestRateValue,recurrenceType){
                            req.body.mifosCustomerId = mifosCustomerId;
                            req.body.mifosGlobalAccNo = globalAccountNum;
                            req.body.syncDisbDate = disbDate;
                            self.commonRouter.generateReceiptForm(req,res,function(){
                                var path = "/GeneratedPDF/"+mifosCustomerId+"_receiptForm.pdf";
                                customLog.info("PATH : " + path);
                                setTimeout(self.showLoanSanctionPage(res,groupId,mifosCustomerId,path,isSynchronized,thisclientId,clientNameArray,groupNameForLoanSanction,clientIdArray,productCategoryId,ProductCategoryType,officeId,docLanguage),600000);
                            });
                        });
                    });
                }
                else if(formType == 7) {
                    self.commonRouter.KYCFileUploadForLoanSanctionCall(clientid,formType,mifosCustomerId,docLanguage,bcOfficeId,function(client_name,groupId,groupName,isSynchronized){
                        self.listClientsForLoanSanctionCall(groupId,mifosCustomerId,function(groupId,thisclientId,clientNameArray,groupNameForLoanSanction,clientIdArray,
                                                                                             productCategoryId,ProductCategoryType,disbDate,globalAccountNum,disbAmount,interestRateValue,recurrenceType){
                            req.body.mifosCustomerId = mifosCustomerId;
                            req.body.syncDisbDate = disbDate;
                            req.body.mifosGlobalAccNo = globalAccountNum;
                            req.body.disbAmount = disbAmount;
                            req.body.interestRateValue = interestRateValue;
                            req.body.recurrenceType = recurrenceType;
                            self.commonRouter.generateMASLegalForm(req,res,function(ststus){
                                var path = "/GeneratedPDF/"+mifosCustomerId+"_MASLoanAgreementform.pdf";
                                customLog.info("PATH : " + path);

                                setTimeout(self.showLoanSanctionPage(res,groupId,mifosCustomerId,path,isSynchronized,thisclientId,clientNameArray,groupNameForLoanSanction,clientIdArray,productCategoryId,ProductCategoryType,officeId,docLanguage),600000);
                            });
                        });
                    });
                }else if(formType == 8){
                    self.commonRouter.KYCFileUploadForLoanSanctionCall(clientid,formType,mifosCustomerId,docLanguage,bcOfficeId,function(client_name,groupId,groupName,isSynchronized){
                        self.listClientsForLoanSanctionCall(groupId,mifosCustomerId,function(groupId,thisclientId,clientNameArray,groupNameForLoanSanction,clientIdArray,productCategoryId,ProductCategoryType,disbDate,globalAccountNum){

                            var path = "/GeneratedPDF/"+groupName+"_MASLoanCardform.pdf";
                            customLog.info("PATH : " + path);

                            setTimeout(self.showLoanSanctionPage(res,groupId,mifosCustomerId,path,isSynchronized,thisclientId,clientNameArray,groupNameForLoanSanction,clientIdArray,productCategoryId,ProductCategoryType,officeId,docLanguage),600000);
                        });
                    });
                }
                else if(formType == 9){
                    self.commonRouter.KYCFileUploadForLoanSanctionCall(clientid,formType,mifosCustomerId,docLanguage,bcOfficeId,function(client_name,groupId,groupName,isSynchronized){
                        self.listClientsForLoanSanctionCall(groupId,mifosCustomerId,function(groupId,thisclientId,clientNameArray,groupNameForLoanSanction,clientIdArray,
                                                                                             productCategoryId,ProductCategoryType,disbDate,globalAccountNum,disbAmount,interestRateValue,recurrenceType){
                            req.body.mifosCustomerId = mifosCustomerId;
                            req.body.syncDisbDate = disbDate;
                            req.body.mifosGlobalAccNo = globalAccountNum;
                            req.body.disbAmount = disbAmount;
                            req.body.interestRateValue = interestRateValue;
                            req.body.recurrenceType = recurrenceType;
                            self.commonRouter.generateMASDemandPromissoryform(req,res,function(status){
                                var path = "/GeneratedPDF/"+mifosCustomerId+"_MASDemandPromissoryform.pdf";
                                customLog.info("PATH : " + path);

                                setTimeout(self.showLoanSanctionPage(res,groupId,mifosCustomerId,path,isSynchronized,thisclientId,clientNameArray,groupNameForLoanSanction,clientIdArray,productCategoryId,ProductCategoryType,officeId,docLanguage),600000);
                            });
                        });
                    });
                }else if(formType == 10) {
                    self.commonRouter.KYCFileUploadForLoanSanctionCall(clientid,formType,mifosCustomerId, docLanguage,bcOfficeId,function(client_name,groupId,groupName,isSynchronized){
                        self.listClientsForLoanSanctionCall(groupId,mifosCustomerId,function(groupId,thisclientId,clientNameArray,groupNameForLoanSanction,clientIdArray,
                                                                                             productCategoryId,ProductCategoryType,disbDate,globalAccountNum,disbAmount,interestRateValue,recurrenceType){
                            req.body.mifosCustomerId = mifosCustomerId;
                            req.body.mifosGlobalAccNo = globalAccountNum;
                            req.body.syncDisbDate = disbDate;
                            req.body.clientNameArray = clientNameArray;
                            var path = "/GeneratedPDF/"+groupName+"_MAS_Appraisal.pdf";
                            customLog.info("PATH : " + path);
                            setTimeout(self.showLoanSanctionPage(res,groupId,mifosCustomerId,path,isSynchronized,thisclientId,clientNameArray,groupNameForLoanSanction,clientIdArray,productCategoryId,ProductCategoryType,officeId,docLanguage),600000);
                        });
                    });
                }
            }
        }catch(e){
            customLog.error("Exception while fileUploadFromSynchronized "+e);
            self.commonRouter.showErrorPage(req,res);
        }
    },

    retrieveClientList : function(req, res) {
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
            customLog.error("Exception while retrive client list "+e);
            self.commonRouter.showErrorPage(req,res);
        }
    } ,

    retrieveFieldVerificationDetails : function(req, res) {
        try{
            customLog.info("INSIDE RETRIEVE FIELD VERIFICATION DETAILS");
            var self = this;
            var clientId = req.params.id;
            var errorfield = "";
            var tenantId = req.session.tenantId;
            self.commonRouter.retrieveFieldVerificationDetailsCall(clientId,function(thisclientId,client_name,clientNameArray,groupName,clientIdArray,prospectClientPersonalObj,prospectClientGuarantorObj,prospectClientHouseDetailObj,prospectClientBankDetailObj,loanCounter){
                self.commonRouter.lookUpEntityCall(function(lookupEntityObj){
                    self.commonRouter.retrieveDocTypeList(tenantId,function(docTypeIdArray,docTypeNameArray){
                        self.commonRouter.showFieldVerificationDetails(req,res,thisclientId,client_name,clientNameArray,groupName,clientIdArray,prospectClientPersonalObj,prospectClientGuarantorObj,prospectClientHouseDetailObj,prospectClientBankDetailObj,lookupEntityObj,docTypeIdArray,docTypeNameArray,errorfield,"","",loanCounter);
                    });
                });
            });
        }catch(e){
            customLog.error("Exception while retrive field verification details "+e);
            self.commonRouter.showErrorPage(req,res);
        }
    },

    needClarificationDetails : function(req,res) {
        try{
            var clientArray = new Array();
            var clientArray = req.body.cl;
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
            customLog.error("Exception while Need clarification details "+e);
            self.commonRouter.showErrorPage(req,res);
        }
    },

    synchronizedPageOnchange : function(req,res) {
        try{
            var requestedOperationId = req.params.operationId;
            var officeId = req.params.officeId;
            var self = this;
            var tenantId = req.session.tenantId;
            var userId = req.session.userId;
            var roleId = req.session.roleId;
            if(typeof tenantId == 'undefined' || typeof userId == 'undefined' || typeof req.session.operationId == 'undefined') {
                res.redirect(props.contextPath+'/client/ci/login');
            }
            else {
                this.commonRouter.ListGroupsCall(tenantId,userId,officeId,roleId,requestedOperationId,function(listGroupsIdArray,listGroupsArray,activeClients,neededInfo,isSynchronized,listGroupsGlobalNumberArray,fieldOfficerName,neededImageClarity,mifosCustomerId){
                    self.commonRouter.showListGroupsOperations(req, res,requestedOperationId,listGroupsIdArray,listGroupsArray,activeClients,neededInfo,isSynchronized,listGroupsGlobalNumberArray,fieldOfficerName,neededImageClarity,mifosCustomerId,'','',officeId);
                });
            }
        }catch(e){
            customLog.error("Exception while synchronizedPageOnchange "+e);
            self.commonRouter.showErrorPage(req,res);
        }
    },

    clientListCallForRejectedGroups: function(groupId,callback) {
        this.model.getClientNamesModelForRejectedGroups(groupId,callback);
    },

    listClientsForRejectedGroups : function(req,res,groupId,thisclientId,groupNameForRejectedGroups,clientNameArray,clientIdArray,rejectedStage,centername,active_clients) {
        var self = this;
        try{
            var constantsObj = this.constants;
            res.render('group_management/rejectedGroupForm', {groupId:groupId, thisclientId:thisclientId,
                groupNameForRejectedGroups:groupNameForRejectedGroups, clientNameArray:clientNameArray,
                clientIdArray:clientIdArray, rejectedStage:rejectedStage, centername:centername,
                active_clients:active_clients, constantsObj:constantsObj, contextPath:props.contextPath, roleId: req.session.roleId});
        }catch(e){
            customLog.error("Exception while list clients for rejected groups "+e);
            self.commonRouter.showErrorPage(req,res);
        }
    },

    retrieveClientsForRejectedGroups : function(req, res) {
        try{
            var groupId = req.params.id;
            var self = this;
            var tenantId = req.session.tenantId;
            var userId = req.session.userId;
            if(typeof tenantId == 'undefined' || typeof userId == 'undefined' || typeof req.session.operationId == 'undefined') {
                res.redirect(props.contextPath+'/client/ci/login');
            }
            else {
                self.clientListCallForRejectedGroups(groupId,function(thisclientId,groupNameForRejectedGroups,clientNameArray,clientIdArray,rejectedStage,centername,active_clients){
                    self.listClientsForRejectedGroups(req,res,groupId,thisclientId,groupNameForRejectedGroups,clientNameArray,clientIdArray,rejectedStage,centername,active_clients);
                });
            }
        }catch(e){
            customLog.error("Exception While retrive client for rejected group "+e);
            self.commonRouter.showErrorPage(req,res);
        }
    },

    rejectedClientDetails : function(req, res) {
        try{
            var self = this;
            var clientId = req.params.id;
            var tenantId = req.session.tenantId;
            var userId = req.session.userId;
            var officeId = (typeof req.body.listoffice == 'undefined')?req.session.officeId:req.body.listoffice;
            customLog.info("Inside router rejectedClientDetails");
            if(typeof tenantId == 'undefined' || typeof userId == 'undefined' || typeof req.session.operationId == 'undefined') {
                res.redirect(props.contextPath+'/client/ci/login');
            }
            else {
                self.commonRouter.rejectedClientDetailsCall(tenantId,clientId,function(groupId,clientId,client_global_number,client_name,client_status_desc,client_status_id,group_status_id,group_name,center_name, remarks, remarksForRejection){
                    self.commonRouter.retrieveDocTypeList(tenantId,function(docTypeIdArray,docTypeNameArray){
                        self.commonRouter.showRejectedClientDetails(req,res,groupId,clientId,client_global_number,client_name,client_status_desc,client_status_id,group_status_id,group_name,center_name,docTypeIdArray,docTypeNameArray, officeId, '', remarks, remarksForRejection);
                    });
                });
            }
        }catch(e){
            customLog.error("Exception while rejected client details "+e);
            self.commonRouter.showErrorPage(req,res);
        }
    },

    reintiateClientCall : function(tenantId,clientId,remarksForReintiate,groupStatusID,clientStatus, groupId, roleId, callback){
        this.model.reintiateClientModel(tenantId,clientId,remarksForReintiate,groupStatusID,clientStatus, groupId, roleId, callback);
    },

    reintiateClient : function(req, res) {
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
            customLog.info("Inside reintiateClient");
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
            customLog.error("Exception While reinitiate client "+e);
            self.commonRouter.showErrorPage(req,res);
        }
    },

    populateGroupsCall : function(tenantId,officeId,userId,statusid,callback){
        this.model.populateGroupsModel(tenantId,officeId,userId,statusid,callback);
    },

    populateGroups : function(req,res){
        try{
            var self = this;
            var tenantId = req.session.tenantId;
            var officeId = req.body.officeId;
            var userId = req.body.userId;
            var statusid = req.body.statusId;
            self.populateGroupsCall(tenantId,officeId,userId,statusid,function(groupNameArray,centerNameArray){
                customLog.info("groupNameArray"+ groupNameArray);
                customLog.info("centerNameArray"+ centerNameArray);
                req.body.groupNameArray = groupNameArray;
                req.body.centerNameArray = centerNameArray;
                res.send(req.body);
            });
        }catch(e){
            customLog.error("Exception while populateGroups "+e);
            self.commonRouter.showErrorPage(req,res);
        }
    },

    populateRejectedGroupCall : function(tenantId,officeId,userId,statusid,callback){
        this.model.populateRejectedGroupsModel(tenantId,officeId,userId,statusid,callback);
    },

    populateRejectedGroups : function(req,res) {
        try{
            var self = this;
            var tenantId = req.session.tenantId;
            var officeId = req.body.officeId;
            var userId = req.body.userId;
            var statusid = req.body.statusId;
            self.populateRejectedGroupCall(tenantId,officeId,userId,statusid,function(groupNameArray,centerNameArray,statusDescArray){
                customLog.info("groupNameArray"+ groupNameArray);
                customLog.info("centerNameArray"+ centerNameArray);
                req.body.groupNameArray = groupNameArray;
                req.body.centerNameArray = centerNameArray;
                req.body.statusDescArray = statusDescArray;
                res.send(req.body);
            });
        }catch(e){
            customLog.error("Exception while populateRejectedGroups "+e);
            self.commonRouter.showErrorPage(req,res);
        }
    },

    showDashBoardCall : function(tenantId,officeId,callback){
        this.model.showDashBoardModel(tenantId,officeId,callback);
    },

    dashboard : function(req,res){
        try{
            var self = this;
            if(typeof (req.session.tenantId) == 'undefined' || typeof (req.session.userId) == 'undefined') {
                res.redirect(props.contextPath+'/client/ci/login');
            }else{
                var officeId = req.session.officeId;
                var tenantId = req.session.tenantId;
                self.showDashBoardCall(tenantId,officeId,function(dashBoardObject){
                    self.showDashBoard(req,res,dashBoardObject);
                });
            }
        }catch(e){
            customLog.error("Exception while dashboard "+e);
            self.commonRouter.showErrorPage(req,res);
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
            customLog.info("Inside router.js: generateDashBoard");
            customLog.info("tenantId: "+tenantId);
            customLog.info("roleId: "+roleId);
            customLog.info("req.session.userId: "+userId);
            if(typeof (tenantId) == 'undefined' || typeof (userId) == 'undefined') {
                res.redirect(props.contextPath+'/client/ci/login');
            }else{
                if( typeof officeId == 'undefined') {
                    officeId = selectedOfficeId;
                }
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
            customLog.error("Exception while generate dashboard ",e);
            self.commonRouter.showErrorPage(req,res);
        }
    },

    showDashBoard : function(req,res,dashBoardObject,officeIdArray,officeNameArray,officeId) {
        try{
            var self = this;
            var constantsObj = this.constants;
            var roleId = req.session.roleId;
            res.render('group_management/dashboard', {dashBoardObject: dashBoardObject, constantsObj: constantsObj,officeIdArray:officeIdArray,officeNameArray:officeNameArray,officeValue:officeId,roleId:roleId, contextPath:props.contextPath});
        }catch(e){
            customLog.error("Exception while show dashboard "+e);
            self.commonRouter.showErrorPage(req,res);
        }
    },

    setOperationsPage: function(req,res,branchesIdArray,branchesArray,statusObj,officeObj,operationObj) {
        req.session.branchesId = branchesIdArray;
        req.session.branches = branchesArray;
        req.session.statusIdArray = statusObj.getStatusIdArray();
        req.session.statusNameArray = statusObj.getStatusNameArray();
        req.session.officeName = officeObj.getOfficeName();
        req.session.operationName = operationObj.getOperationNameArray();
        req.session.operationId = operationObj.getOperationIdArray();
    },

    showCreateGroups: function(req,res,groupNames,nextGroupName,loanTypeIdArray,loanTypeArray, areaCodes, areaNames) {
        try{
            var self = this;
            if(req.session.browser == "mobile") {
                res.render('Mobile/GroupCreationMobile', { source:true,groupNames:groupNames,nextGroupName:nextGroupName,
                    officeName:req.session.officeName,officeId:req.session.officeId,loanTypeIdArray:loanTypeIdArray,loanTypeArray:loanTypeArray, areaCodes: areaCodes, areaNames: areaNames , contextPath:props.contextPath});
            }
            else {
                res.render('group_management/GroupCreation', { source:true,groupNames:groupNames,nextGroupName:nextGroupName,
                    officeName:req.session.officeName,officeId:req.session.officeId,loanTypeIdArray:loanTypeIdArray,loanTypeArray:loanTypeArray, areaCodes: areaCodes, areaNames: areaNames , contextPath:props.contextPath});
            }
        }catch(e){
            customLog.error("Exception while show create groups "+e);
            self.commonRouter.showErrorPage(req,res);
        }
    },

    createGroup: function(req, res){
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
            customLog.error("Exception while create group "+e);
            self.commonRouter.showErrorPage(req,res);
        }
    },

    saveGroupCall: function(userId,officeId,areaCodeId,prosGroup,callback) {
        this.model.saveGroupGroupModel(userId,officeId,areaCodeId,prosGroup,callback);
    },

    saveGroup: function(req, res) {
        try{
            var prospectGroupObj = require(commonDTO +"/prospectGroup");
            var prosClientObj = require(commonDTO +"/prospectClient");
            var self = this;
            var tenantId = req.session.tenantId;
            var userId = req.session.userId;
            var roleId = req.session.roleId;
            var officeId = req.session.officeId;
            var userContactNumber = req.session.userContactNumber;
            customLog.info("userContactNumber : "+userContactNumber);
            var clientNames;
            var clientLastNames;
            if(typeof tenantId == 'undefined' || typeof userId == 'undefined') {
                res.redirect(props.contextPath+'/client/ci/login');
            }
            else {
                var groupName = req.body.groupName;
                var centerName= req.body.centerName;
                var branchName= req.body.branchName;
                var createdDate = dateUtils.formatDate(req.body.createdDatePicker);
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
                 }*/
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
                this.saveGroupCall(userId,officeId,areaCodeId,prosGroup,function(){
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
            customLog.error("Exception While save group "+e);
            self.commonRouter.showErrorPage(req,res);
        }
    },

    showPreliminaryVerificationCall:function(groupId,callback) {
        this.model.showPreliminaryVerificationModel(groupId,callback);
    },

    showPreliminaryVerification: function(req,res,alertMsg,prosGroup,office,prosClient,docTypeIdArray,docTypeNameArray) {
        try{
            var self = this;
            if(req.session.browser == "mobile") {
                res.render('Mobile/preliminaryVerificationFormMobile', {alertMsg:alertMsg,prosGroup:prosGroup, office:office,prosClient:prosClient,docTypeIdArray:docTypeIdArray,docTypeNameArray:docTypeNameArray, contextPath:props.contextPath});
            }
            else {
                res.render('group_management/preliminaryVerificationForm', {alertMsg:alertMsg,prosGroup:prosGroup, office:office,prosClient:prosClient,docTypeIdArray:docTypeIdArray,docTypeNameArray:docTypeNameArray, contextPath:props.contextPath});
            }
        }catch(e){
            customLog.error("Exception While show preliminary verification "+e);
            self.commonRouter.showErrorPage(req,res);
        }
    },

    preVerification: function(req,res){
        try{
            var self = this;
            var groupId=req.params.id;
            customLog.info("Group ID params = "+groupId);
            var tenantId = req.session.tenantId;
            var userId = req.session.userId;
            if(typeof tenantId == 'undefined' || typeof userId == 'undefined' || typeof req.session.operationId == 'undefined') {
                res.redirect(props.contextPath+'/client/ci/login');
            }
            else {
                this.showPreliminaryVerificationCall(groupId,function(prosGroup,office,prosClient,docTypeIdArray,docTypeNameArray){
                    self.showPreliminaryVerification(req,res,"",prosGroup,office,prosClient,docTypeIdArray,docTypeNameArray);
                });
            }
        }catch(e){
            customLog.error("Exception While pre verification "+e);
            self.commonRouter.showErrorPage(req,res);
        }
    },

    showPreliminaryVerificationUploadCall:function(groupId,callback) {
        this.model.showPreliminaryVerificationUploadModel(groupId,callback);
    },

    preVerificationDocumentUploadCall:function(groupId,fileName,docTypeId,callback) {
        this.model.preVerificationDocumentUploadModel(groupId,fileName,docTypeId,callback);
    },

    preVerificationDocumentUpload: function(req,res){
        try{
            var self = this;
            var groupId=req.params.id;
            customLog.info("Group ID params = "+groupId);
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
                customLog.info("Multiple Doc="+isMulitpleDoc);
                if(isMulitpleDoc=="true"){
                    customLog.info("inside true");
                    for(var i=0; i<req.files.multipleUploadDocument.length; i++){
                        fileName[i]=req.files.multipleUploadDocument[i].name;
                        var is = fs.createReadStream(req.files.multipleUploadDocument[i].path)
                        var os = fs.createWriteStream(rootPath+"/documents/group_documents/"+fileName[i]);
                        is.pipe(os);
                        is.on('end', function() {
                            customLog.info('Successfully uploaded');
                            alertMsg = "File has been Uploaded Successfully!"
                        });
                        fs.unlink(req.files.multipleUploadDocument[i].path, function(err){
                            if(err){ customLog.error('Error while unlinking '+err); }
                            else { customLog.error('Successfully unlinked');};
                        });
                        is.on('error', function(err) { customLog.error("error while uploading "+err); });
                    }
                }
                else if(isMulitpleDoc== "false"){
                    if(req.files.singleUploadDocument.name!=""){
                        fileName[0]=req.files.singleUploadDocument.name;
                        customLog.info("fileName="+fileName);
                        if(req.files.singleUploadDocument.name!=""){
                            var is = fs.createReadStream(req.files.singleUploadDocument.path)
                            var os = fs.createWriteStream(rootPath+"/documents/group_documents/"+req.files.singleUploadDocument.name);
                            is.pipe(os);
                            is.on('end', function() {
                                customLog.info('Successfully uploaded');
                                alertMsg = "File has been Uploaded Successfully!"
                            });
                            fs.unlink(req.files.singleUploadDocument.path, function(err){
                                if(err){ customLog.error('Error while unlinking '+err); }
                                else { customLog.error('Successfully unlinked');};
                            });
                            is.on('error', function(err) { customLog.error("error while uploading "+err); });
                        }
                    }
                }
                this.preVerificationDocumentUploadCall(groupId,fileName,docTypeId,function(){
                });
                self.showPreliminaryVerificationCall(groupId,function(prosGroup,office,prosClient,docTypeIdArray,docTypeNameArray){
                    self.showPreliminaryVerification(req,res,alertMsg,prosGroup,office,prosClient,docTypeIdArray,docTypeNameArray);
                });
            }
        }catch(e){
            customLog.error("Exception while pre verification document upload "+e);
            self.commonRouter.showErrorPage(req,res);
        }
    },

    showSavedGroups: function(req, res,listGroupsIdArray,listGroupsArray,remarksDisplay,listGroupsGlobalNumberArray) {
        try{
            var self = this;
            var constantsObj = this.constants;
            operationNameArray = req.session.operationName;
            operationIdArray = req.session.operationId;
            var userName = req.session.userName;
            var remarksArray = new Array();
            remarksArray = remarksDisplay.split("-");
            customLog.info("remarksArray : "+remarksArray);
            var roleId = req.session.roleId;
            var errorMessage = "";
            if(listGroupsIdArray.length !=0) {
                errorMessage = "";
            }
            else {
                errorMessage = "No groups to Display";
            }
            if(req.session.browser == "mobile") {
                res.render('Mobile/PreliminaryVerificationMobile', {errorMessage:errorMessage, groupsName:listGroupsArray,
                    groupsId:listGroupsIdArray, operationNameArray:operationNameArray,
                    operationIdArray:operationIdArray,roleId:roleId,remarksDisplay:remarksArray,
                    userName:userName,listGroupsGlobalNumberArray : listGroupsGlobalNumberArray,
                    constantsObj:constantsObj, contextPath:props.contextPath});
            }
            else {
                res.render('group_management/PreliminaryVerification', {errorMessage:errorMessage, groupsName:listGroupsArray,
                    groupsId:listGroupsIdArray, operationNameArray:operationNameArray,
                    operationIdArray:operationIdArray,roleId:roleId,remarksDisplay:remarksArray,
                    userName:userName,listGroupsGlobalNumberArray : listGroupsGlobalNumberArray,
                    constantsObj:constantsObj,currentOperationIndex : operationIdArray.indexOf(parseInt(constantsObj.getPreliminaryVerificationOperationId())), contextPath:props.contextPath});
            }
        }catch(e){
            customLog.error("Exception while show saved groups "+e);
            self.commonRouter.showErrorPage(req,res);
        }
    },

    verifyGroup: function(req,res){
        try{
            var prospectGroupObj = require(commonDTO+"/prospectGroup");
            var prosClientObj = require(commonDTO+"/prospectClient");
            var preliminaryVerification = require(commonDTO+"/preliminaryVerification");
            var self = this;
            var groupId=req.params.id;
            var userId = req.session.userId;
            var tenantId = req.session.tenantId;
            var officeId = req.session.officeId;
            var roleId = req.session.roleId;
            var userContactNumber = req.session.userContactNumber;
            customLog.info("userContactNumber : "+userContactNumber);
            var docTypeId=req.body.documentType;
            if(typeof tenantId == 'undefined' || typeof userId == 'undefined' || typeof req.session.operationId == 'undefined') {
                res.redirect(props.contextPath+'/client/ci/login');
            }
            else {
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

                customLog.info("groupId = "+groupId);
                customLog.info("groupCreatedDate = "+groupCreatedDate);
                customLog.info("lastActiveDate = "+lastActiveDate);
                customLog.info("savingsDiscussed = "+savingsDiscussed);
                customLog.info("completeAttendance = "+completeAttendance);
                customLog.info("bankAccount = "+bankAccount);
                customLog.info("bankName = "+bankName);
                customLog.info("accountNumber = "+accountNumber);
                customLog.info("accountCreatedDate = "+accountCreatedDate);
                customLog.info("creditTransaction = "+creditTransaction);
                customLog.info("debitTransaction = "+debitTransaction);
                customLog.info("anyInternalLoans = "+anyInternalLoans);
                customLog.info("clientIds = "+clientIds);
                customLog.info("overdues = "+overdues);
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
            customLog.error("Exception while verify group "+e);
            self.commonRouter.showErrorPage(req,res);
        }
    },

    KYC_UploadingCall: function(group_id,callback) {
        this.model.KYC_UploadingModel(group_id,callback);
    },

    showKYC_Uploading : function(res,errorMsg,group_id,docTypeIdArray,docTypeNameArray,memberIdArray,memberNameArray) {
        res.render('group_management/kycUploading_form', {errorMsg:errorMsg,group_id:group_id,docTypeIdArray:docTypeIdArray,docTypeNameArray:docTypeNameArray,memberIdArray:memberIdArray,memberNameArray:memberNameArray, contextPath:props.contextPath});
    },

    KYC_Uploading: function(req,res,group_id) {
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
                customLog.info("group_id = "+group_id);
                var errMsg="";
                this.KYC_UploadingCall(group_id,function(group_id,docTypeIdArray,docTypeNameArray,memberIdArray,memberNameArray){
                    self.showKYC_Uploading(res,errMsg,group_id,docTypeIdArray,docTypeNameArray,memberIdArray,memberNameArray);
                });
            }
        }catch(e){
            customLog.error("Exception while Kyc uploading "+e);
            self.commonRouter.showErrorPage(req,res);
        }
    },

    showKYC_UploadingMenu : function(res,alertMsg,group_id,docTypeIdArray,docTypeNameArray,memberIdArray,memberNameArray) {
        res.render('group_management/kycUploadingMenu_form', {group_id:group_id,alertMsg:alertMsg,docTypeIdArray:docTypeIdArray,docTypeNameArray:docTypeNameArray,memberIdArray:memberIdArray,memberNameArray:memberNameArray, contextPath:props.contextPath});
    },

    KYC_UploadingMenu: function(req,res,group_id) {
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
                customLog.info("group_id = "+group_id);
                var alertMsg="";
                this.KYC_UploadingCall(group_id,function(group_id,docTypeIdArray,docTypeNameArray,memberIdArray,memberNameArray){
                    self.showKYC_UploadingMenu(res,alertMsg,group_id,docTypeIdArray,docTypeNameArray,memberIdArray,memberNameArray);
                });
            }
        }catch(e){
            customLog.error("Exception while KYC Uploading menu "+e);
            self.commonRouter.showErrorPage(req,res);
        }
    },

    KYC_UploadingImageCall: function(client_id,doc_type_id,image,fileName,callback) {
        this.model.KYC_UploadingImageModel(client_id,doc_type_id,image,fileName,callback);
    },

    KYC_UploadingImage:function(req,res,group_id) {
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
                customLog.info("Multiple Doc="+isMulitpleDoc);
                if(isMulitpleDoc=="true"){
                    customLog.info("inside true");
                    for(var i=0; i<req.files.multipleUploadDocument.length; i++){
                        fileName[i]=req.files.multipleUploadDocument[i].name;
                        filePath[i]=req.files.multipleUploadDocument[i].path;
                        var is = fs.createReadStream(req.files.multipleUploadDocument[i].path)
                        var os = fs.createWriteStream("client_documents/"+fileName[i]);
                        is.pipe(os);
                        is.on('end', function() {
                            customLog.info('Successfully uploaded');
                            alertMsg = "File has been Uploaded Successfully!"
                        });
                        fs.unlink(req.files.multipleUploadDocument[i].path, function(err){
                            if(err){ customLog.error('Error while unlinking '+err); }
                            else { customLog.error('Successfully unlinked');};
                        });
                        is.on('error', function(err) { customLog.error("error while uploading "+err); });
                    }
                }
                else if(isMulitpleDoc== "false"){
                    fileName[0]=req.files.singleUploadDocument.name;
                    customLog.info("fileName="+fileName);
                    if(req.files.singleUploadDocument.name!=""){
                        var is = fs.createReadStream(req.files.singleUploadDocument.path)
                        var os = fs.createWriteStream("client_documents/"+req.files.singleUploadDocument.name);
                        is.pipe(os);
                        is.on('end', function() {
                            customLog.info('Successfully uploaded');
                            alertMsg = "File has been Uploaded Successfully!"
                        });
                        fs.unlink(req.files.singleUploadDocument.path, function(err){
                            if(err){ customLog.error('Error while unlinking '+err); }
                            else { customLog.error('Successfully unlinked');};
                        });
                        is.on('error', function(err) { customLog.error("error while uploading "+err); });
                    }
                }
                customLog.info("group_id="+group_id);
                customLog.info("client_id="+client_id);
                customLog.info("doc_type_id="+doc_type_id);
                customLog.info("fileName="+fileName);
                this.KYC_UploadingImageCall(client_id,doc_type_id,fileName,function(){

                });
                self.KYC_UploadingCall(group_id,function(group_id,docTypeIdArray,docTypeNameArray,memberIdArray,memberNameArray){
                    self.showKYC_UploadingMenu(res,alertMsg,group_id,docTypeIdArray,docTypeNameArray,memberIdArray,memberNameArray);
                });
            }
        }catch(e){
            customLog.error("Exception while kyc uploading image"+e);
            self.commonRouter.showErrorPage(req,res);
        }
    },

    // from captured image
    storeCapturedImageCall: function(client_id,doc_type_id,image,fileName,callback) {
        this.model.storeCapturedImageModel(client_id,doc_type_id,image,fileName,callback);
    },

    storeCapturedImage: function(req, res) {
        try{
            var self = this;
            customLog.info("Inside Store captured image");
            var client_id=req.body.clientNameValue;
            var doc_type_id=req.body.docTypeValue;
            var base64Image=req.body.imageBase64Value;
            var fileName=req.body.fileName;
            customLog.info(fileName);
            customLog.info(req.body.docTypeValue);
            this.storeCapturedImageCall(client_id,doc_type_id,req.body.imageBase64Value,fileName,function(group_id){
                customLog.info("groupId : "+group_id);
                self.KYC_Uploading(req,res,group_id);
            });
        }catch(e){
            customLog.error("Exception while store captured image "+e);
            self.commonRouter.showErrorPage(req,res);
        }
    },

    storePreliminaryVerificationCapturedImageCall: function(groupId,doc_type_id,image,fileName,callback) {
        this.model.storePreliminaryVerificationCapturedImageModel(groupId,doc_type_id,image,fileName,callback);
    },

    storePreliminaryVerificationCapturedImage:function(req, res) {
        try{
            var self = this;
            customLog.info("Inside Store captured image");
            var groupId=req.body.groupIdValue;
            var doc_type_id=req.body.docTypeValue;
            var base64Image=req.body.imageBase64Value;
            var fileName=req.body.fileName;
            customLog.info(fileName);
            customLog.info(req.body.docTypeValue);
            this.storePreliminaryVerificationCapturedImageCall(groupId,doc_type_id,req.body.imageBase64Value,fileName,function(group_id){
                customLog.info("groupId : "+group_id);
            });
            self.showPreliminaryVerificationCall(groupId,function(prosGroup,office,prosClient,docTypeIdArray,docTypeNameArray){
                self.showPreliminaryVerification(req,res,"Image has been Successfully Uploaded !",prosGroup,office,prosClient,docTypeIdArray,docTypeNameArray);
            });
        }catch(e){
            customLog.error("Exception while store preliminary verification captured image "+e);
            self.commonRouter.showErrorPage(req,res);
        }
    },

    groupDetailsCall: function(tenant_id,office_id,callback) {
        this.model.groupDetailsModel(tenant_id,office_id,callback);
    },

    //Json group detail//
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
        res.end();
    },

    groupDetails: function(req, res) {
        try{
            var self = this;
            var tenant_id=req.body.tenant_id;
            var office_id=req.body.office_id;
            customLog.info("tenant_id="+tenant_id);
            this.groupDetailsCall(tenant_id,office_id,function(groupIdArray,groupNameArray){
                self.showGroupDetails(res,groupIdArray,groupNameArray);
            });
        }catch(e){
            customLog.error("Exception while group details "+e);
            self.commonRouter.showErrorPage(req,res);
        }
    },

    documentDetailsCall: function(tenant_id,callback) {
        this.model.documentDetailsModel(tenant_id,callback);
    },

    documentDetails: function(req, res) {
        var self = this;
        var tenant_id=req.body.tenant_id;
        this.documentDetailsCall(tenant_id,function(doc_idArray,doc_typeArray){
            self.showDocumentDetails(res,doc_idArray,doc_typeArray);
        });
    },

    //Json document detail//
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
        res.end();
    },

    //Json member detail//
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
        res.end();
    },

    memberDetailsCall: function(tenant_id,office_id,callback) {
        this.model.memberDetailsModel(tenant_id,office_id,callback);
    },

    memberDetails: function(req, res) {
        var self = this;
        var tenant_id=req.body.tenant_id;
        var office_id=req.body.office_id;
        customLog.info("tenant_id="+tenant_id);
        this.memberDetailsCall(tenant_id,office_id,function(groupIdArray,memberIdArray,memberNameArray){
            self.showMemberDetails(res,groupIdArray,memberIdArray,memberNameArray);
        });
    },

    availableDocumentDetailsCall: function(tenant_id,office_id,callback) {
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
        this.availableDocumentDetailsCall(tenant_id,office_id,function(groupIdArray,memberIdArray,docNameArray,docTypeArray){
            self.showAvailableDocumentDetails(res,groupIdArray,memberIdArray,docNameArray,docTypeArray);
        });
    },

    saveKycUploadcall: function(groupId,callback) {
        this.model.saveKycUploadModel(groupId,callback);
    },

    showKYCUploading: function(req, res,listGroupsIdArray,listGroupsArray,activeClients,listGroupsGlobalNumberArray){
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
            res.render('group_management/KYCUploading', {errorMessage:errorMessage, groupsName:listGroupsArray,
                groupsId:listGroupsIdArray, operationNameArray:operationNameArray,
                operationIdArray:operationIdArray,roleId:roleId,userName:userName,
                listGroupsGlobalNumberArray:listGroupsGlobalNumberArray, contextPath:props.contextPath});
        }catch(e){
            customLog.error("Exception while show kyc uploading "+e);
            self.commonRouter.showErrorPage(req,res);
        }
    },

    saveKycUpload: function(req,res){
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
            customLog.error("Exception while save kyc upload "+e);
            self.commonRouter.showErrorPage(req,res);
        }
    },

    saveKycUploadForUploadImage: function(req,res){
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
            customLog.error("Exception while save kyc upload for upload image "+e);
            self.commonRouter.showErrorPage(req,res);
        }
    },

    saveAssignFOcall: function(foName,assignGroupIds,callback) {
        this.model.saveAssignFOModel(foName,assignGroupIds,callback);
    },

    saveAssignFO: function(req,res){
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
                customLog.info(assignGroupIds+"++++++++++++++++++++++");
                this.saveAssignFOcall(foName,assignGroupIds,function(status){
                    if(status == 'success'){
                        var activityDetails = new Array(iklantPort, req.session.tenantId, req.session.userId, req.session.userName, req.originalUrl, req.connection.remoteAddress, "router.js", "saveAssignFO", "success", "AssignFO", "GroupIds "+assignGroupIds+" are Assigned to "+foName+" Fo successfully","insert");
                        self.commonRouter.insertActivityLogModel(activityDetails);
                        res.redirect(props.contextPath+'/client/ci/groups');
                    }else{
                        self.commonRouter.showErrorPage(req,res);
                    }
                });
            }
        }catch(e){
            customLog.error("Exception while save assign fo "+e);
            self.commonRouter.showErrorPage(req,res);
        }
    },

    cca1: function(req, res) {
        try{
            var self = this;
            var constantsObj = this.constants;
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
                customLog.info("cca1 Method weightage "+clientTotalWeightageRequired);
                self.commonRouter.ccaCall1(tenantId,groupId,function(groupId,unAppraisedClients,appraisedClientsObj,countOfRejectedClients){
                    self.commonRouter.showCcaSummary(res,groupId,unAppraisedClients,appraisedClientsObj,countOfRejectedClients,clientTotalWeightageRequired,errorfield,clientId,fileLocation,"",constantsObj,req.session.roleId);
                });
            }
        }catch(e){
            customLog.error("Exception while cca1 "+e);
            self.commonRouter.showErrorPage(req,res);
        }
    },

    cca1RejectClientsCall : function(rejectedClientName,remarksToReject, roleId, callback) {
        this.model.cca1RejectClientsModel(rejectedClientName,remarksToReject, roleId, callback)
    },

    cca1approvedGroupCall : function(rejectedClientName,approvedGroupName,callback) {
        this.model.cca1approvedGroupModel(rejectedClientName,approvedGroupName,callback)
    },

    cca1rejectedGroupCall : function(approvedGroupName,callback) {
        this.model.cca1rejectedGroupModel(approvedGroupName,callback)
    },

    cca1RejectClients: function (req, res) {
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
            customLog.error("Exception while cca1 rejected clients "+e);
            self.commonRouter.showErrorPage(req,res);
        }
    } ,

    synchronizeCall: function(groupId,callback){
        this.model.synchronizeModel(groupId,callback);
    },

    showCustomErrorPage :  function(req,res,error){
        res.render('group_management/errorpage.jade',{contextPath:props.contextPath,error : error});
    },

    cca1approveGroup: function(req, res) {
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
                                    var GroupCreationDetail = require(groupManagementDTO +"/GroupCreationDetail");
                                    var GroupCreationDetailObj = new GroupCreationDetail();
                                    this.GroupCreationDetailObj = GroupCreationDetailObj;
                                    var GroupCreationDetailObj = this.GroupCreationDetailObj; //object to store client and group details
                                    var customClientDetailObj = new Array();  //array to store list of client details
                                    for(var i=0;i<clientDetailsResultSet.length;i++){
                                        var ClientCreationDetail = require(groupManagementDTO +"/ClientCreationDetail");
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
                                    customLog.info("Cookie:"+req.session.mifosCookie);
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
                                            customLog.info("statuscode" + statuscode);
                                            customLog.info("HEADERS:  "+headers)
                                            customLog.info("RESULT"+result.status);
                                            if(statuscode == 302) {
                                                res.redirect(props.contextPath+'/client/ci/logout');
                                            }
                                            else if(result.status == "success"){
                                                customLog.info("result.groupAccountId" + result.groupAccountId);
                                                var activityDetails = new Array(iklantPort, req.session.tenantId, req.session.userId, req.session.userName, req.originalUrl, req.connection.remoteAddress, "router.js", "cca1approveGroup", "success", "Loan Authorization",  req.body.groupName+" : "+req.body.centerName+" authorized successfully","insert");
                                                self.commonRouter.insertActivityLogModel(activityDetails);
                                                self.commonRouter.ListGroupsCall(tenantId,userId,branchId,roleId,constantsObj.getAuthorizeGroupOperationId(),function(listGroupsIdArray,listGroupsArray,activeClients,neededInfo,isSynchronized,listGroupsGlobalNumberArray,fieldOfficerName,neededImageClarity){
                                                    self.commonRouter.showListGroupsOperations(req, res,constantsObj.getAuthorizeGroupOperationId(),listGroupsIdArray,listGroupsArray,activeClients,branchId,isSynchronized,listGroupsGlobalNumberArray,fieldOfficerName,neededImageClarity);
                                                });
                                            } else {
                                                self.commonRouter.showErrorPage(req,res);
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
            customLog.error("Exception while cca1 approve group "+e);
            self.commonRouter.showErrorPage(req,res);
        }
    },

    cca1rejectGroup: function (req, res) {
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
            customLog.error("Exception while cca1 reject group "+e);
            self.commonRouter.showErrorPage(req,res);
        }
    },

    retrieveIdleClients : function(req,res){
        var self = this;
        try{
            var groupId = req.params.groupId;
            var statusId = req.body.statusId;
            var tenantId = req.session.tenantId;
            var clientId = 0,clientTotalWeightageRequired = 0,errorField = "",fileLocation = "", docId = "";
            self.commonRouter.retrieveIdleClientsCall(tenantId, groupId, statusId, function(groupId,unAppraisedClients,appraisedClientsObj,countOfRejectedClients,isIdle, noOfIdleDays, lastCreditCheckDate){
                self.commonRouter.showIdleClientsSummary(req,res,groupId,unAppraisedClients,appraisedClientsObj,countOfRejectedClients,clientId,clientTotalWeightageRequired,errorField,fileLocation,docId, isIdle, noOfIdleDays, lastCreditCheckDate, statusId);
            });

        } catch (e) {
            customLog.error("Exception while Load retrieveIdleGroups " + e);
            self.commonRouter.showErrorPage(req, res);
        }
    },

    rejectIdleClientsCall : function(clientId, callback){
        this.model.rejectIdleClientsModel(clientId, callback)
    },

    rejectIdleClients : function(req,res){
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
                    customLog.error("Idle client rejection failed");
                    self.commonRouter.showErrorPage(req, res);
                }
            });

        } catch (e) {
            customLog.error("Exception while Load rejectIdleClients " + e);
            self.commonRouter.showErrorPage(req, res);
        }
    },

    rejectIdleGroup : function(req,res){
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
            customLog.error("Exception while Load rejectIdleGroup " + e);
            req.body.status = "failure";
            res.send(req.body);
        }
    },

    rejectIdleGroupCall : function(groupId, callback){
        this.model.rejectIdleGroupModel(groupId, callback)
    },

    approveIdleGroup : function(req,res){
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
            customLog.error("Exception while Load rejectIdleGroup " + e);
            req.body.status = "failure";
            res.send(req.body);
        }
    },

    approveIdleGroupCall : function(groupId, statusId, callback){
        this.model.approveIdleGroupModel(groupId, statusId, callback)
    },

    //List Groups for authorization according to branch - Jagan
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
            customLog.error("Exception while list Group Authorization "+e);
            self.commonRouter.showErrorPage(req,res);
        }
    },

    groupDetailsAuthorization: function(req,res) {
        try{
            var self = this;
            var tenantId = req.session.tenantId;
            var userId = req.session.userId;
            if(typeof tenantId == 'undefined' || typeof userId == 'undefined') {
                res.redirect(props.contextPath+'/client/ci/login');
            }
            else {
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
            customLog.error("Exception while group details authorization "+e);
            self.commonRouter.showErrorPage(req,res);
        }
    },

    listQuestionsCCA: function(req,res) {
        try{
            var self = this;
            var tenantId = req.session.tenantId;
            var userId = req.session.userId;
            if(typeof tenantId == 'undefined' || typeof userId == 'undefined') {
                res.redirect(props.contextPath+'/client/ci/login');
            }
            else {
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
                customLog.info("clientRatingPerc "+clientRatingPerc);
                customLog.info("clientTotalWeightageRequired "+clientTotalWeightageRequired);
                if(typeof clientLoanCount == 'undefined'){
                    clientLoanCount = req.params.loanCount;
                }
                this.commonRouter.listQuestionsCCACall(tenantId,clientId,clientLoanCount,function(clientName,questionsObj,choicesanswerObj,choicesObj,capturedImageArray,docTypeIdArray){
                    self.commonRouter.showCCAQuestions(req,res,groupId,selectedOfficeId,redirectValue,clientId,clientName,centerName,clientRatingPerc,clientTotalWeightage,clientTotalWeightageRequired,questionsObj,choicesanswerObj,choicesObj,capturedImageArray,docTypeIdArray,errorfield,clientLoanCount, statusId);
                });
            }
        }catch(e){
            customLog.error("Exception while List question CCA "+e);
            self.commonRouter.showErrorPage(req,res);
        }
    },

    updateClientStatusCall : function(clientIdListArray,clientIds,overdues,callback){
        this.model.updateClientStatusModel(clientIdListArray,clientIds,overdues,callback);
    },

    reinitiateGroupCall: function(groupId,remarks,callback) {
        this.model.reinitiateGroupModel(groupId,remarks,callback);
    },

    reinitiateGroup: function(req,res) {
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
                        self.commonRouter.showListGroupsOperations(req, res,constantsObj.getRejectedGroupsOperationId(),listGroupsIdArray,listGroupsArray,activeClients,neededInfo,isSynchronized,listGroupsGlobalNumberArray,fieldOfficerName,0/*needeed image clarity*/,0/*mifos customer id*/,0/*isDataVerifiedArray*/,reinitiatedStatusDisplay);
                    });
                });
            });
        }catch(e){
            customLog.error("Exception While Reinitiate Group "+e);
            self.commonRouter.showErrorPage(req,res);
        }
    },

    addQuestionsCall: function(tenantId,callback) {
        this.model.addQuestionsModel(tenantId,callback);
    },

    showAddQuestions: function(req,res,selectedQuestionId,questionId,questionsNonDefault,questionsObj) {
        res.render('group_management/AddQuestions', {selectedQuestionId: selectedQuestionId ,QuestionsId : questionId, QuestionsNDNames : questionsNonDefault,questionsObj:questionsObj, contextPath:props.contextPath});
    },

    addQuestions: function(req, res) {
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
            customLog.error("Exception while Add Questions "+e);
            self.commonRouter.showErrorPage(req,res);
        }
    },

    questionsSelectCall: function(tenantId,selectedQuestionId,callback) {
        this.model.questionsSelectModel(tenantId,selectedQuestionId,callback);
    },

    questionsSelect :function(req, res) {
        try{
            var self = this;
            var tenantId = req.session.tenantId;
            var userId = req.session.userId;
            var officeId = req.session.officeId;
            var roleId = req.session.roleId;
            var constantsObj = this.constants;

            var selectedQuestionId = req.body.questionsEditName;
            customLog.info("QNAme== "+selectedQuestionId);

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
            customLog.error("Exception While Question select Call "+e);
            self.commonRouter.showErrorPage(req,res);
        }
    },

    saveQuestionCall: function(tenantId,submitId,callback) {
        this.model.saveQuestionModel(tenantId,submitId,callback);
    },

    saveQuestion: function(req, res) {
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
                customLog.info("SubmitID=  "+submitId);
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
                customLog.info("question  "+ questionsObj.getQuestion());
                var choice = req.body.answerArray;
                var mark = req.body.marksArray
                var selectedQuestionId = 0;
                choiceArray = choice.split(",");
                marksArray = mark.split(",");;
                choiceObj.setChoice(choiceArray);
                choiceObj.setMarks(marksArray);
                customLog.info("choiceArray====="+choiceArray);
                customLog.info("choiceArray====="+marksArray);
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
            customLog.error("Exception while Save questions "+e);
            self.commonRouter.showErrorPage(req,res);
        }
    },

    calculateSecondaryAppraisalCall: function(tenantId,clientId,secondaryQuestionIdRouter,selectedAnswerArray,callback) {
        this.model.calculateSecondaryAppraisalModel(tenantId,clientId,secondaryQuestionIdRouter,selectedAnswerArray,callback);
    },

    calculateSecondaryAppraisal: function(req, res) {
        try{
            var self = this;
            var tenantId = req.session.tenantId;
            var userId = req.session.userId;
            var officeId = req.session.officeId;
            var roleId = req.session.roleId;
            var branchId = req.body.selectedOfficeIdName;
            customLog.info("branchId "+branchId);
            var constantsObj = this.constants;
            if(typeof tenantId == 'undefined' || typeof userId == 'undefined') {
                res.redirect(props.contextPath+'/client/ci/login');
            }
            else {
                var clientId = req.params.clientId;
                var noOfQuestions = req.params.noOfQuestions;
                var selectedAnswerArray = new Array();
                var secondaryQuestionIdRouter = new Array();
                var redirectValue = req.body.redirectValueName;//Adarsh-Modified
                customLog.info("redirectValueSec "+redirectValue);
                selectedAnswerArray = req.body.secondaryChoices.i;
                secondaryQuestionIdRouter = req.body.SecondaryQuestionId.i;
                self.calculateSecondaryAppraisalCall(tenantId,clientId,secondaryQuestionIdRouter,selectedAnswerArray,function(groupId,secondaryRating,clientTotalWeightageRequired){
                    customLog.info("secondaryRating : "+secondaryRating);
                    customLog.info("clientTotalWeightageRequired : "+clientTotalWeightageRequired);
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
            customLog.error("Exception while calculate secondary appraisal "+e);
            self.commonRouter.showErrorPage(req,res);
        }
    },

    skipKycUploadCall: function(groupId,callback) {
        this.model.skipKycUploadModel(groupId,callback);
    },

    skipKycUpload: function(req, res) {
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
            customLog.error("Exception while skip kyc upload "+e);
            self.commonRouter.showErrorPage(req,res);
        }
    },

    clientDetailsCall: function(group_id,callBack){
        this.model.getActiveOrRejectedClientsModel(group_id,callBack);
    },

    loadActiveOrRejectedClients: function(req,res){
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
            customLog.error("Exception while loadActiveOrRejectedClients "+e);
            self.commonRouter.showErrorPage(req,res);
        }
    },

    //Ramya
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
            customLog.error("Exception while showLoanSanctionGroups "+e);
            self.commonRouter.showErrorPage(req,res);
        }
    },

    synchronize :function(req, res) {
        try{
            var self = this;
            var tenantId = req.session.tenantId;
            var userId = req.session.userId;
            if(typeof tenantId == 'undefined' || typeof userId == 'undefined' || typeof req.session.operationId == 'undefined') {
                res.redirect(props.contextPath+'/client/ci/login');
            }
            else {
                customLog.info("Inside synchronize");
                var groupId = req.params.groupId;
                self.synchronizeCall(groupId,function(){
                    self.showLoanSanctionGroups(req, res);
                });
            }
        }catch(e){
            customLog.error("Exception while synchronize "+e);
            self.commonRouter.showErrorPage(req,res);
        }
    },

    downloadRequstedImageCall : function(tenantId,clientId,docId,callback) {
        this.model.downloadRequstedImageModel(tenantId,clientId,docId,callback);
    },

    retrieveDocumentList : function(req,res){
        customLog.info("Inside retrieveDocumentList");
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
                customLog.error("Exception while retrieve DocumentList "+e);
                self.commonRouter.showErrorPage(req,res);
            }
        }
    },

    nextLoanPreCheckDetails : function(req,res){
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
                        res.render("group_management/NextLoanPreCheckApproval", {
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
                    customLog.error("Fails while retrieving nextLoanPreCheckDetails in mifos");
                    self.commonRouter.showErrorPage(req,res);
                }
            });
        }catch(e){
            customLog.error("Exception while Load nextLoanPreCheckDetails "+e);
            self.commonRouter.showErrorPage(req,res);
        }
    },

    approveOrRejectClientForNextLoan : function(iklantGroupId,userId, callBack){
        this.model.approveOrRejectClientForNextLoanCallModel(iklantGroupId,userId,callBack);
    },

    approveOrRejectCustomerForNextLoan: function (req, res) {
        try {
            var self = this;
            var constantsObj = this.constants;
            var customerLevel = req.body.customerLevel;
            var nextLoanHolderObj = require(groupManagementDTO +"/nextLoan");
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
                    customLog.error("Fails while retrieving approveOrRejectClientForNextLoan in mifos");
                    self.commonRouter.showErrorPage(req, res);
                }
            });
        } catch (e) {
            customLog.error("Exception while Load approveOrRejectClientForNextLoan " + e);
            self.commonRouter.showErrorPage(req, res);
        }
    }
};
