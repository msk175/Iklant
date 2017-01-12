module.exports = common;
var path = require('path');
var rootPath = path.dirname(process.mainModule.filename);
var props = require(path.join(rootPath,"properties.json"));
mifosServiceIP = props.mifosServiceIp;
mifosPort = props.mifosPort;
GPSPort = props.GPSPort;
iklantPort = props.iklantPort;
var fs = require('fs');

var commonDTO = path.join(rootPath,"app_modules/dto/common");

var customlog = new require(path.join(rootPath,"logger/loggerConfig.js"))('CommonRouting.js');
var CommonModel = require(path.join(rootPath,"app_modules/model/CommonModel"));
var dateUtils = require(path.join(rootPath,'app_modules/utils/DateUtils'));
var PDFDocument = require('pdfkit');

function common(constants) {
    customlog.debug("Inside Router");
    this.model = new CommonModel(constants);
    this.constants = constants;
}

common.prototype = {
    getBranches: function(req, res) {
        try{
            customlog.debug("inside getBranches()");
            customlog.debug(this);
            var self = this;
            var tenantId = req.session.tenantId;
            var userId = req.session.userId;
            if(typeof tenantId == 'undefined' || typeof userId == 'undefined') {
                res.redirect(props.contextPath+'/client/ci/login');
            }
            else {
                var officeId = req.session.officeId;
                if((req.session.roleIds).length > 1){
                    var roleId = req.session.roleIds;
                }
                else
                {
                    var roleId = req.session.roleId;
                }
                self.getBranchesCall(tenantId,userId,roleId,officeId,function(branchesIdArray,branchesArray,statusObj,officeObj,operationObj){
                    self.getBranchesPage(req,res,branchesIdArray,branchesArray,statusObj,officeObj,operationObj);
                });
            }
        }catch(e){
            customlog.error("Exception while get branches ",e);
            self.showErrorPage(req,res);
        }
    },
    getBranchesCall: function(tenantId,userId,roleId,officeId,callback) {
        this.model.getBranchesModel(tenantId,userId,roleId,officeId,callback);
    },

    getBranchesPage: function(req,res,branchesIdArray,branchesArray,statusObj,officeObj,operationObj) {
        try{
            var self = this;
            req.session.branchesId = branchesIdArray;
            req.session.branches = branchesArray;
            req.session.statusIdArray = statusObj.getStatusIdArray();
            req.session.statusNameArray = statusObj.getStatusNameArray();
            req.session.officeName = officeObj.getOfficeName();
            req.session.operationName = operationObj.getOperationNameArray();
            req.session.operationId = operationObj.getOperationIdArray();
            //customlog.info("statusIdArray : "+req.session.statusIdArray);
            //customlog.info("statusNameArray : "+req.session.statusNameArray);
            //customlog.info("operationId : "+req.session.operationId);
            //customlog.info("operationName : "+req.session.operationName);
            if(typeof req.params.new != 'undefined'){
                res.redirect(props.contextPath+'/client/ci/groups/new');
            }
            else{
                res.redirect(props.contextPath+'/client/ci/groups');
            }
        }
        catch(e){
            customlog.error("Exception while get Branches page ",e);
            self.showErrorPage(req,res);
        }
    },
    listGroups: function(req, res) {
        try{
            var self = this;
            var constantsObj = this.constants;
            var tenantId = req.session.tenantId;
            var userId = req.session.userId;
            var pageName = req.body.pageName;
            var menu = (typeof req.params.new == 'undefined')?req.body.menuName:req.params.new;
            if(typeof tenantId == 'undefined' || typeof userId == 'undefined' || typeof req.session.operationId == 'undefined') {
                res.redirect(props.contextPath+'/client/ci/login');
            }
            else {
                var officeId = req.params.officeId;
                var roleId = req.session.roleId;
                var selectedOperation = req.params.operationId;
                if(typeof officeId == 'undefined' || officeId == 'operation' || officeId == ''){
                    officeId = (roleId == constantsObj.getSMHroleId())?-1:(req.session.officeId == constantsObj.getApexHeadOffice())?-1:req.session.officeId;
                }
                var operationNameArray = req.session.operationName;
                var operationIdArray = req.session.operationId;
                var requestedOperationId = "";

                /*if(operationIdArray.indexOf(constantsObj.getGroupCreationOperationId()) > -1) {
                 requestedOperationId = req.session.operationId[1];
                 } else {*/
                if(selectedOperation != null || typeof selectedOperation != 'undefined'){
                    requestedOperationId = (selectedOperation <= 3) ? req.session.operationId[selectedOperation] : selectedOperation;
                }
                else{
                    if(operationIdArray.indexOf(constantsObj.getGroupCreationOperationId()) > -1) {
                        requestedOperationId = req.session.operationId[0];
                    }
                    else{
                        requestedOperationId = (menu == 'new')?req.session.operationId[0]:req.session.operationId[0];
                    }
                }
                //}
                self.ListGroupsCall(tenantId,userId,officeId,roleId,requestedOperationId,function(listGroupsIdArray,listGroupsArray,activeClients,neededInfo,isSynchronized,listGroupsGlobalNumberArray,fieldOfficerName,neededImageClarity,mifosCustomerId,isDataVerifiedArray,activeClientsPerStatus,dataEntryDate,error_msg_array,accountNumbers, loanCount,statusIds,freshClientsCountArray,holdedClientsCount,totalClientsCountArray,nicClearedCountArray,accountId,needRMApprovalCountArray,dvQuery){
                    self.showListGroupsOperations(req, res,requestedOperationId,listGroupsIdArray,listGroupsArray,activeClients,neededInfo,isSynchronized,listGroupsGlobalNumberArray,fieldOfficerName,neededImageClarity,mifosCustomerId,isDataVerifiedArray,"",officeId,"",activeClientsPerStatus,dataEntryDate,error_msg_array,menu,accountNumbers, loanCount,statusIds,freshClientsCountArray,holdedClientsCount,totalClientsCountArray,nicClearedCountArray,accountId,needRMApprovalCountArray,dvQuery);
                });
            }
        }catch(e){
            customlog.error("Exception while list group "+e);
            self.showErrorPage(req,res);
        }
    },

    ListGroupsCall: function(tenantId,userId,officeId,roleId,requestedOperationId,callback) {
        customlog.debug('inside ListGroupsCall');
        customlog.debug(this);
        this.model.listGroupsModel(tenantId,userId,officeId,roleId,requestedOperationId,callback);
    },

    showListGroupsOperations: function(req,res,requestedOperationId,listGroupsIdArray,listGroupsArray,activeClients,neededInfo,isSynchronized, listGroupsGlobalNumberArray,fieldOfficerName,
                                       neededImageClarity,mifosCustomerId,isDataVerifiedArray,reinitiatedStatusDisplay,officeValue,errorMsg,activeClientsPerStatus,dataEntryDate,error_msg_array,
                                       menu,accountNumbers, loanCount, statusIds,freshClientsCountArray,holdedClientsCount,totalClientsCountArray,nicClearedCountArray,accountId,needRMApprovalCountArray,dvQuery) {
        try{
            var constantsObj = this.constants;
            var self = this;
            var branchesIdArray = req.session.branchesId;
            var branchesArray = req.session.branches;
            var tenantId = req.session.tenantId;
            var userName = req.session.userName;
            var officeId = req.session.officeId;
            var FOIdsArray = new Array();
            var FONamesArray = new Array();
            var operationNameArray = req.session.operationName;
            var operationIdArray = req.session.operationId;

            var currentOperationIndex = operationIdArray.indexOf(parseInt(requestedOperationId));
            var currentOperation = operationNameArray[currentOperationIndex];
            if((req.session.roleIds).length>1){
                var roleIds=req.session.roleIds;
                for(var i=0;i<roleIds.length;i++)
                {
                    if(roleIds[i] == constantsObj.getSMHroleId()) {
                        var roleId = constantsObj.getSMHroleId();
                    }
                }
            }else{
                var roleId = req.session.roleId;
            }
           /* if(menu == 'new') {
                if (currentOperation == 'kYC Downloading') {
                    currentOperation = 'kYC Downloading';
                    currentOperationIndex = 1;
                }
            }*/
             if(menu == 'new') {
             if (currentOperation == 'KYC Downloading') {
             currentOperation = 'KYC Updating';
             currentOperationIndex = 1;
             }
             }
            customlog.info("currentOperation : "+currentOperation);
            customlog.info("currentOperationIndex : "+currentOperationIndex);
            if(typeof listGroupsIdArray != 'undefined' && listGroupsIdArray.length !=0) {
                errorMessage = "";
            }
            else {
                errorMessage = "No groups to Display";
            }

            var operationName = currentOperation.replace(/\s+/g, "");
            var operationJadeName = operationName[0].toLowerCase() + operationName.substring(1);
            if(operationJadeName == "groupCreation") {
                self.createGroupCall(tenantId,officeId,req.session.userId, function(groupNames,nextGroupName, areaCodes, areaNames){
                    self.retrieveLoanTypeList(tenantId,function(loanTypeIdArray,loanTypeArray){
                        res.render( operationJadeName, { source:false ,errorMessage:errorMessage,groupNames:groupNames,
                            nextGroupName:nextGroupName, groupsName:listGroupsArray , groupsId:listGroupsIdArray,
                            operationNameArray:operationNameArray, operationIdArray:operationIdArray,roleId:roleId,
                            remarksDisplay:"",userName:userName,officeName:req.session.officeName,officeId:req.session.officeId,
                            loanTypeIdArray:loanTypeIdArray,loanTypeArray:loanTypeArray, areaCodes: areaCodes, areaNames: areaNames, contextPath:props.contextPath,
                            constantsObj: constantsObj});
                    });
                });
            }
            else if(requestedOperationId == constantsObj.getManageUsersOperationId() || requestedOperationId == constantsObj.getManageOfficeOperationId()
                || requestedOperationId == constantsObj.getManageRolesOperationId() || requestedOperationId == constantsObj.getManageRolesAndPermissionsOperationId()) {
                var roleId = constantsObj.getAdminroleId();
                var CheckedValuesArray = new Array("");
                self.getUsersCall(tenantId,function(userIdArray,userNameArray,office_NameArray,contactNumberArray,emailIDArray,userRoleIdArray,imeiArray,userNameAllArray) {
                    self.getRolesCall(tenantId,function(roleIdArray,roleNameArray,roleDescriptionArray) {
                        var userId = (roleId == constantsObj.getAdminroleId())?-1:req.session.userId
                        self.retriveOfficeCall(tenantId,userId,function(officeIdArray,officeNameArray,officeAddressArray,officeShortNameArray) {
                            self.retrieveStateCall(function(stateIdArray,stateNameArray) {
                                self.manageRolesCall(function (manageRolesObject) {
                                    res.render("user_management/"+operationJadeName, {userName: req.session.userName, officeIdArray: officeIdArray,
                                        officeNameArray: officeNameArray, officeAddressArray: officeAddressArray,
                                        officeShortNameArray: officeShortNameArray, userRoleIdArray: userRoleIdArray, imeiNumberArray: imeiArray,
                                        userIdArray: userIdArray, userNameArray: userNameArray,
                                        roleIdArray: roleIdArray, roleNameArray: roleNameArray,
                                        roleDescriptionArray: roleDescriptionArray,
                                        office_NameArray: office_NameArray, contactNumberArray: contactNumberArray,
                                        emailIDArray: emailIDArray, manageRolesObj: manageRolesObject,editRoleName:"",activitySet:"", editRoleId:"",
                                        currentOperationIndex: currentOperationIndex, constantsObj: constantsObj, error_msg: errorMsg,CheckedValuesArray:CheckedValuesArray,
                                        stateIdArray:stateIdArray,stateNameArray:stateNameArray,userNameAllArray:userNameAllArray, contextPath:props.contextPath,operationNameArray:operationNameArray, operationIdArray:operationIdArray});
                                });
                            });
                        });
                    });
                });
            } else {
                if(requestedOperationId == constantsObj.getAssigningFOOperationId()) {
                    this.getFONamesForAssigningFOCall(tenantId,officeId,function(FOIdsArray,FONamesArray) {
                        //assigning branchId in the name of neededinfo for LoanAuthorization page to load with branch selected in dropdown
                        var branchIdAuthorization = req.params.officeId;
                        if(typeof branchIdAuthorization == 'undefined') {
                            branchIdAuthorization = neededInfo;
                        }
                        if(req.session.browser == "mobile") {
                            res.render("Mobile/"+operationJadeName+"Mobile",{source:false, errorMessage:errorMessage, groupNames:"", groupsName:listGroupsArray,
                                groupsId:listGroupsIdArray, operationNameArray:operationNameArray, operationIdArray:operationIdArray,roleId:roleId,
                                FOIdsArray:FOIdsArray, FONamesArray:FONamesArray, activeClients:activeClients, remarksDisplay:"",
                                reinitiatedStatusDisplay:"", neededInfo:neededInfo,statusName:"",userName:userName, isSynchronized:isSynchronized,
                                branches:branchesArray, branchesId:branchesIdArray, listGroupsGlobalNumberArray:listGroupsGlobalNumberArray,
                                branchIdAuthorization:branchIdAuthorization, constantsObj:constantsObj, currentOperationIndex:currentOperationIndex,
                                mifosCustomerId : mifosCustomerId,fieldOfficerName : fieldOfficerName, contextPath:props.contextPath});
                        }
                        else {
                            customlog.info("FOIdsArray : "+FOIdsArray);
                            customlog.info("FONamesArray : "+FONamesArray.length);
                            customlog.info("fieldOfficerName: assignFO: "+fieldOfficerName);
                            res.render(operationJadeName, {req:req, source:false, errorMessage:errorMessage, groupNames:"", groupsName:listGroupsArray, contextPath:props.contextPath,
                                groupsId:listGroupsIdArray, operationNameArray:operationNameArray, operationIdArray:operationIdArray, roleId:roleId,
                                FOIdsArray:FOIdsArray, FONamesArray:FONamesArray, activeClients:activeClients, remarksDisplay:"",
                                reinitiatedStatusDisplay:"", neededInfo:neededInfo,statusName:"",userName:userName, isSynchronized:isSynchronized,
                                branches:branchesArray, branchesId:branchesIdArray, listGroupsGlobalNumberArray:listGroupsGlobalNumberArray,
                                branchIdAuthorization:branchIdAuthorization, constantsObj:constantsObj,currentOperationIndex:currentOperationIndex,
                                mifosCustomerId : mifosCustomerId,fieldOfficerName : fieldOfficerName});
                        }
                    });
                } else if (requestedOperationId == constantsObj.getNextLoanPreCheckOperationId()) {
                    res.render(operationJadeName, {errorMessage: errorMessage, groupsName: listGroupsArray, contextPath: props.contextPath,listGroupsGlobalNumberArray: listGroupsGlobalNumberArray,
                        groupsId: listGroupsIdArray, operationNameArray: operationNameArray, operationIdArray: operationIdArray, roleId: roleId,accountNumbers: accountNumbers,
                        constantsObj: constantsObj,currentOperationIndex: currentOperationIndex, mifosCustomerId: mifosCustomerId, fieldOfficerName: fieldOfficerName,userName: req.session.userName,
                        loanCount: loanCount, clientCount: activeClientsPerStatus, statusMessage: (typeof req.body.statusMessage == 'undefined')?"":req.body.statusMessage});
                }else {
                    //assigning branchId in the name of neededinfo for LoanAuthorization page to load with branch selected in dropdown
                    var userId = (roleId == constantsObj.getSMHroleId()|| roleId == constantsObj.getBMroleId() || roleId == constantsObj.getAccountsExecutiveRoleId()||roleId == constantsObj.getAMHroleId())?req.session.userId:-1;
                    self.retriveOfficeCall(tenantId,userId,function(officeIdArray,officeNameArray,officeAddressArray,officeShortNameArray,languageArray) {
                        var branchIdAuthorization = req.params.officeId;
                        if(typeof branchIdAuthorization == 'undefined') {
                            branchIdAuthorization = neededInfo;
                        }
                        if(req.session.browser == "mobile") {
                            res.render("Mobile/"+operationJadeName+"Mobile",{source:false, errorMessage:errorMessage, groupNames:"", groupsName:listGroupsArray, contextPath:props.contextPath,
                                groupsId:listGroupsIdArray, operationNameArray:operationNameArray, operationIdArray:operationIdArray,roleId:roleId,
                                FOIdsArray:FOIdsArray, FONamesArray:FONamesArray, activeClients:activeClients, remarksDisplay:"",
                                reinitiatedStatusDisplay:"", neededInfo:neededInfo,statusName:"",userName:userName, isSynchronized:isSynchronized,
                                branches:branchesArray, branchesId:branchesIdArray, listGroupsGlobalNumberArray:listGroupsGlobalNumberArray,
                                neededImageClarity : neededImageClarity,branchIdAuthorization:branchIdAuthorization, constantsObj:constantsObj,
                                currentOperationIndex:currentOperationIndex,mifosCustomerId : mifosCustomerId,fieldOfficerName : fieldOfficerName,
                                officeIdArray:officeIdArray,officeNameArray:officeNameArray,officeValue:officeValue,office:officeId});
                        }
                        else {
                            res.render(operationJadeName, {req:req, source:false, errorMessage:errorMessage, groupNames:"", groupsName:listGroupsArray, contextPath:props.contextPath,
                                groupsId:listGroupsIdArray, operationNameArray:operationNameArray, operationIdArray:operationIdArray, roleId:roleId,
                                FOIdsArray:FOIdsArray, FONamesArray:FONamesArray, activeClients:activeClients, remarksDisplay:"",
                                reinitiatedStatusDisplay:(typeof reinitiatedStatusDisplay == 'undefined' || reinitiatedStatusDisplay == "")?"":"Group is Reinitiated and "+reinitiatedStatusDisplay,
                                neededInfo:neededInfo,statusName:"",userName:userName, isSynchronized:isSynchronized,
                                branches:branchesArray, branchesId:branchesIdArray, listGroupsGlobalNumberArray:listGroupsGlobalNumberArray,
                                neededImageClarity : neededImageClarity,branchIdAuthorization:branchIdAuthorization, constantsObj:constantsObj,dataEntryDate:dataEntryDate,error_msg_array:error_msg_array,
                                currentOperationIndex:currentOperationIndex,mifosCustomerId : mifosCustomerId,fieldOfficerName : fieldOfficerName,activeClientsPerStatus:activeClientsPerStatus,
                                officeIdArray:officeIdArray,officeNameArray:officeNameArray,officeValue:officeValue,office:officeId,errorMsg:errorMsg,isDataVerifiedArray:isDataVerifiedArray,menu:menu,
                                languageArray:languageArray, docLanguage:(typeof req.body.docLanguage == 'undefined')?req.session.language:req.body.docLanguage,roleIds:req.session.roleIds,statusIds: statusIds,
                                loanCount: loanCount,freshClientsCountArray: freshClientsCountArray,holdedClientsCount: holdedClientsCount,totalClientsCountArray: totalClientsCountArray,nicClearedCountArray:nicClearedCountArray,accountId:accountId, needRMApprovalCountArray : needRMApprovalCountArray, dvQuery: dvQuery});
                        }
                    });
                }
            }
        }catch(e){
            customlog.error("Exception While Show list group operation ",e);
            self.showErrorPage(req,res);
        }
    },

    createGroupCall: function(tenantId,officeId,userId,callback) {
        this.model.createGroupModel(tenantId,officeId,userId,callback);
    },

    retrieveLoanTypeList: function(tenantId,callback){
        this.model.retrieveLoanTypelistModel(tenantId,callback);
    },

    retriveOfficeCall: function(tenantId,userId,callback) {
        this.model.retriveOfficeModel(tenantId,userId,callback);
    },
    listGroupsOperation: function(req,res) {
        try{
            var self = this;
            var tenantId = req.session.tenantId;
            var userId = req.session.userId;
            var constantsObj = this.constants;
            var reqOfficeId = req.body.reqOfficeHidden;
            var menu = req.body.menuName;
            if(typeof tenantId == 'undefined' || typeof userId == 'undefined') {
                res.redirect(props.contextPath+'/client/ci/login');
            }
            else {
                var roleId = req.session.roleId;
                var officeId = req.session.officeId;
                if(typeof reqOfficeId == 'undefined' || reqOfficeId == ''){
                    reqOfficeId = (roleId == constantsObj.getSMHroleId())?(typeof req.body.listoffice == 'undefined')?-1:req.body.listoffice:(req.session.officeId == constantsObj.getApexHeadOffice())?-1:req.session.officeId;
                }
                userId = (roleId == constantsObj.getSMHroleId())?-1:req.session.userId;
                var reinitiatedStatusDisplay = "";
                var requestedOperationId = req.params.operationId;
                if(reqOfficeId == 'undefined' && requestedOperationId == constantsObj.getLeaderSubLeaderVerificationOperationId()){
                    reqOfficeId =  officeId;
                }
                if(requestedOperationId == constantsObj.getRejectedClientOperationId()){
                    self.listClientsCall(tenantId,userId,reqOfficeId,roleId,function(clientIdArray,clientNameArray,groupNameArray,centerNameArray,lastCreditCheckDate){
                        self.showListClientsOperations(req, res,requestedOperationId,clientIdArray,clientNameArray,groupNameArray,centerNameArray,reinitiatedStatusDisplay, reqOfficeId,lastCreditCheckDate);
                    });
                }else if(requestedOperationId == constantsObj.getClientAuthorizationOperationId()){
                    userId = req.session.userId;
                    self.listClientsForRMAuthorizationCall(tenantId,userId,reqOfficeId,roleId,function(clientIdArray,clientNameArray,groupNameArray,centerNameArray,remarksForRMApprovalArray){
                        self.showListClientsOperations(req, res,requestedOperationId,clientIdArray,clientNameArray,groupNameArray,centerNameArray,reinitiatedStatusDisplay, reqOfficeId,'',remarksForRMApprovalArray);
                    });
                }
                else{
                    self.ListGroupsCall(tenantId,userId,reqOfficeId,roleId,requestedOperationId,function(listGroupsIdArray,listGroupsArray,activeClients,neededInfo,isSynchronized,listGroupsGlobalNumberArray,fieldOfficerName,neededImageClarity,mifosCustomerId,isDataVerifiedArray,activeClientsPerStatus,dataEntryDate,error_msg_array,accountNumbers,loanCount, statusIds,freshClientsCountArray,holdedClientsCount,totalClientsCountArray,nicClearedCountArray,accountId,needRMApprovalCountArray,dvQuery){
                        self.showListGroupsOperations(req, res,requestedOperationId,listGroupsIdArray,listGroupsArray,activeClients,neededInfo,isSynchronized,listGroupsGlobalNumberArray,fieldOfficerName,neededImageClarity,mifosCustomerId,isDataVerifiedArray,"",reqOfficeId,"",activeClientsPerStatus,dataEntryDate,error_msg_array,menu,accountNumbers, loanCount, statusIds,freshClientsCountArray,holdedClientsCount,totalClientsCountArray,nicClearedCountArray,accountId,needRMApprovalCountArray,dvQuery);
                    });
                }
            }
        }catch(e){
            customlog.error("Exception while list group operation "+e);
            self.showErrorPage(req,res);
        }
    },

    listClientsForRMAuthorizationCall: function(tenantId,userId,officeId,roleId,callback) {
        this.model.listClientsForRMAuthorizationModel(tenantId,userId,officeId,roleId,callback);
    },

    listClientsCall: function(tenantId,userId,officeId,roleId,callback) {
        this.model.listClientsModel(tenantId,userId,officeId,roleId,callback);
    },

    showListClientsOperations: function(req, res,requestedOperationId,clientIdArray,clientNameArray,groupNameArray,centerNameArray,reinitiatedStatusDisplay, reqOfficeId,lastCreditCheckDate,remarksForRMApprovalArray) {
        try{
            var self = this;
            var branchesIdArray = req.session.branchesId;
            var branchesArray = req.session.branches;
            var roleId = req.session.roleId;
            var constantsObj = this.constants;
            var userName = req.session.userName;
            operationNameArray = req.session.operationName;
            operationIdArray = req.session.operationId;
            var currentOperationIndex = operationIdArray.indexOf(parseInt(requestedOperationId));
            var currentOperation = operationNameArray[currentOperationIndex];
            customlog.info(currentOperation);
            var errorMessage = "";
            if (clientIdArray.length != 0) {
                errorMessage = "";
            }
            else {
                errorMessage = "No Clients to Display";
            }
            var operationName = currentOperation.replace(/\s+/g, "");
            var operationJadeName = operationName[0].toLowerCase() + operationName.substring(1);
            self.retriveOfficeCall(req.session.tenantId, req.session.userId,function(officeIdArray, officeNameArray) {
                res.render(operationJadeName, {source: false, errorMessage: errorMessage, groupsName: clientNameArray, contextPath:props.contextPath,
                    groupsId: clientIdArray, operationNameArray: operationNameArray, operationIdArray: operationIdArray,
                    reinitiatedStatusDisplay: "", userName: userName, listGroupsGlobalNumberArray: centerNameArray,
                    groupNameArray: groupNameArray, reinitiatedStatusDisplay: (reinitiatedStatusDisplay == "")?req.body.statusMessage:reinitiatedStatusDisplay,
                    currentOperationIndex: currentOperationIndex, officeIdArray: officeIdArray, officeNameArray: officeNameArray,
                    roleId: roleId, constantsObj: constantsObj, officeId:reqOfficeId,lastCreditCheckDate: lastCreditCheckDate, remarksForRMApprovalArray : remarksForRMApprovalArray
                });
            });
        }catch(e){
            customlog.error("Exception while show list client operation "+e);
            self.showErrorPage(req,res);
        }
    },
    showErrorPage :  function(req,res){
        res.render('errorpage.jade',{contextPath:props.contextPath,error :"Page Expired.Please Contact System Administrator."});
    },
    getFONamesForAssigningFOCall: function(tenantId,officeId,callback) {
        this.model.getFONamesForAssigningFOModel(tenantId,officeId,callback);
    },
    getUsersCall: function(tenantId,callback) {
        this.model.getUsersModel(tenantId,callback);
    },
    getRolesCall: function(tenantId,callback) {
        this.model.getRolesModel(tenantId,callback);
    },
    retrieveStateCall : function(callback) {
        this.model.retrieveStateModel(callback);
    },
    manageRolesCall:function(callback){
        this.model.manageRolesModel(callback);
    },
    retriveFieldOfficersCall : function(officeId,callback) {
        this.model.retriveFieldOfficersModel(officeId,callback);
    },
    // Added By Paramasivan
    getPersonnelDetailsCall : function(office_id,userId, callBack){
        this.model.getPersonnelDetailsCallModel(office_id,userId,callBack);
    },
    sendEmail : function(toAddress,subject,mailContent,callback){
        var nodemailer = require('nodemailer');
        var transporter = nodemailer.createTransport("SMTP",{
            service: 'Gmail',
            auth: {
                user: props.emailId,
                pass: props.emailPassword
            }
        });

        var mailOptions = {
            from: props.emailFromText,
            to: toAddress ,
            subject: subject,//props.emailSubject,
            html: mailContent//props.emailText+""+newPassword
        };

        transporter.sendMail(mailOptions, function(error, response){
            if(error){
                customlog.error(error);
                callback(false);
            }else{
                callback(true);
            }
        });
    },
    retrieveClientDetailsForGeneratePDF : function(mifosCustomerId,selectedMemberId,callback){
        this.model.retrieveClientDetailsForGeneratePDFModel(mifosCustomerId,selectedMemberId,callback);
    },
    updateLeaderSubLeaderDetails : function (req,res,iklantGroupId,mifosCustomerId,callback){
        //try{
            var self = this;
            self.model.updateLeaderAndSubLeaderDetailsModel(iklantGroupId,mifosCustomerId,function(updateIklantStatus,subLeaderRejectedGlobalNumber,subLeaderRejectedClientId){
                console.log("updateIklantStatus : " + updateIklantStatus);
                if(updateIklantStatus == "Success"){
                    self.model.updateLeaderAndSubLeaderDetailsInMifosModel(iklantGroupId,mifosCustomerId,function(updateMifosStatus){
                        customlog.info("updateMifosStatus : " + updateMifosStatus);
                        if(updateMifosStatus == "Success"){
                            if(subLeaderRejectedGlobalNumber != null && subLeaderRejectedGlobalNumber.length > 0){
                                for(var i in subLeaderRejectedGlobalNumber){
                                    self.model.updateLeaderAndSubLeaderDetailsForRejectedModel(subLeaderRejectedGlobalNumber[i],subLeaderRejectedClientId[i],function(updateStatus){
                                        customlog.info("updateStatus : " + updateStatus);
                                        if(updateStatus == "Success"){
                                            customlog.info("Leader and Sub Leader Updated Successfully");
                                            callback("Success");
                                            customlog.info("Leader and Sub Leader Updated Successfully");
                                        }else{
                                            customlog.error("Exception while Leader and Sub Leader for Rejected");
                                            callback("Failure");

                                        }
                                    });
                                }
                            }else{
                                callback("Success");
                                customlog.info("Leader and Sub Leader Updated Successfully");
                            }
                        }else{
                            customlog.error("Exception while Leader and Sub Leader Information in mifos"+e);
                            callback("Failure");
                        }
                    });
                }else{
                    callback("Failure");
                    customlog.error("Exception while Leader and Sub Leader");
                }
            });
        /*}catch(e){
            customlog.error("Exception while Update Leader and Sub Leader Information "+e);
            self.showErrorPage(req,res);
        }*/
    },
    KYCFileUploadForLoanSanctionCall:function(clientid,formType,mifosCustomerId,docLanguage,bcOfficeId,callback){
        this.model.KYCFileUploadForLoanSanctionModel(clientid,formType,mifosCustomerId,docLanguage,bcOfficeId,callback);
    },
    // Added by Chitra [Documents shouldn't generated for rejected clients]
    getIklantGroupIdFromCustomerIdCall:function(mifosCustomerId,callBack){
        this.model.getIklantGroupIdFromCustomerIdModel(mifosCustomerId,callBack);
    },
    downloadingSourceImage : function (req,res){
        console.log("In downloading....");
        var self = this;
        var filename = req.body.fileName;
        var clientDocId = req.body.clientDocId;
        var clientId = req.body.clientId;
        var fs=require('fs');
        var isExists = fs.existsSync(filename);
        var http = require('http');
        var HTTPStatus = require('http-status');
        console.log("downloadingSourceImage : "+isExists);
        res.setHeader('Content-disposition', 'attachment; filename= ' + filename);
        if(isExists) {
           var filestream = fs.createReadStream(filename);
            //filestream.pipe(res);
            filestream.on('data', function (data) {
                console.log("downloadingSourceImage : write data");
                res.write(data);
            });
            filestream.on('end', function() {
                console.log("downloadingSourceImage : write end");
                self.model.archeivedFlagUpdateClientDocModel(clientDocId,clientId,function(status){
                    if(status == true){
                        console.log("downloadingSourceImage : archeivedFlagUpdateClientDocModel true ");
                        fs.unlink(filename, function(err){
                            if(err){
                                customlog.info('Error while unlinking '+err);
                                console.log("downloadingSourceImage : archeivedFlagUpdateClientDocModel unlink error ");
                            }
                            else {
                                console.log("downloadingSourceImage : archeivedFlagUpdateClientDocModel successfully unlink ");
                                res.end();
                            };
                        });
                    }
                });
            });
            filestream.on('error', function() {
                console.log("downloadingSourceImage : write error");
                res.end();
            });

        }else{
            console.log("false bloack");
            res.send(400);
        }
    },




    removableDocumentAvailabilityCall : function(isAvailableSize,isDelete,checkingType,callback){
        customlog.info("Router Call : removableDocumentAvailability entry");
        this.model.removableDocumentAvailabilityModel(isAvailableSize,isDelete,checkingType,callback)
    },

    removableDocumentAvailability : function(req,res) {
        customlog.info("Router : removableDocumentAvailability entry");
        var self = this;
        var isAvailableSize = req.params.isAvailableSize;
        var isDelete =  req.params.isDelete;
        var checkingType = "1";
        try {
            self.removableDocumentAvailabilityCall(isAvailableSize,isDelete,checkingType,function(status,checkingTypeCallback){
                customlog.info("Router : checkingType : "+checkingTypeCallback +" callback :"+ status);
                checkingType = "2";
                self.removableDocumentAvailabilityCall(isAvailableSize,isDelete,checkingType,function(status1,checkingTypeCallback){
                    customlog.info("Router : checkingType : "+checkingTypeCallback +" callback :"+ status1);
                    checkingType = "3";
                    self.removableDocumentAvailabilityCall(isAvailableSize,isDelete,checkingType,function(status2,checkingTypeCallback){
                        customlog.info("Router : checkingType : "+checkingTypeCallback +" callback :"+ status2);
                        checkingType = "4";
                        self.removableDocumentAvailabilityCall(isAvailableSize,isDelete,checkingType,function(status3,checkingTypeCallback){
                            customlog.info("Router : checkingType : "+checkingTypeCallback +" callback :"+ status3);
                            res.send(req.body);
                            customlog.info("Router : ----Completed-----");
                        });
                    });
                });
            });
        }catch(e){
            customlog.error("Exception removableDocumentAvailability "+e);
        }
    },

    //Added By Sathish Kumar M #008 For MAS Legal Form Generation.
    generateMASLegalForm: function(req,res,callback){
        try{
            var self = this;
            var http = require('http');
            var https = require('https');
            var groupId = req.body.mifosCustomerId;
            var mifosGlobalAccNo = req.body.mifosGlobalAccNo;
            var disbAmount = req.body.disbAmount;
            var interestRateValue = req.body.interestRateValue;
            var recurrenceType = req.body.recurrenceType;
            var month=new Array("January","February","March","April","May","June","July","August","September","October","November","December");
            if(req.body.syncDisbDate != null){
                var disbDate = req.body.syncDisbDate;
            }else{
                var disbDate = dateUtils.convertToMifosDateFormat(req.body.disbDate);
            }
            var disbDateStr = new Date(disbDate);
            customlog.info("groupId "+groupId);
            var postheaders = {
                'Content-Type' : 'application/json',
                'Cookie' : req.session.mifosCookie
            };
            var options = {
                host: mifosServiceIP,
                port: mifosPort,
                path: "/mfi/api/report/customer/legalForm-"+groupId+".json",
                method: 'GET',
                headers : postheaders
            };
            self.generateMASLoanAgreementFormCall(mifosGlobalAccNo,function(result){
                var ClientLegalFormDto = require(commonDTO +"/ClientLegalFormDto");
                for(var i =0; i<result.length; i++){
                    var ClientLegalFormDtoDetail = new ClientLegalFormDto();
                    this.ClientLegalFormDtoDetail = ClientLegalFormDtoDetail;
                    var ClientLegalFormDtoDetail = this.ClientLegalFormDtoDetail;
                    ClientLegalFormDtoDetail.setClientName(result[i].clientName);
                    ClientLegalFormDtoDetail.setRelationshipName(result[i].relationshipName);
                    ClientLegalFormDtoDetail.setClientAge(result[i].clientAge);
                    ClientLegalFormDtoDetail.setClientAddress(result[i].clientAddress);
                    ClientLegalFormDtoDetail.setOfficeName(result[i].officeName);
                    customlog.info("Length=="+result[i].clientName);
                }
                var doc = new PDFDocument({
                    size: 'LEGAL'
                });
                doc.image(rootPath + "/public/images/Loan Agreement-page-001.jpg", 5, 10, {scale: 0.5});
                doc.addPage({
                    size: 'LEGAL'
                });
                doc.image(rootPath + "/public/images/Loan Agreement-page-002.jpg", 5, 10, {scale: 0.5});
                doc.addPage({
                    size: 'LEGAL'
                });
                doc.image(rootPath + "/public/images/Loan Agreement-page-003-1.jpg", 5, 10, {scale: 0.5});
                doc.font('Times-Roman').fontSize(13).text("______________________________________________________________________________________",35,303);
                doc.font('Times-Roman').fontSize(13).text("  S.No.   Name of the Borrower               Amount in Rs.                   Purpose                               Sign",35,320);
                clientInc = 370;
                /*if(execute ==0){
                 var i =0;
                 var len =10;
                 }else if(execute == 1){
                 var i =10;
                 var len =20;
                 }else{
                 var i =20;
                 var len =30;
                 }*/
                for(var i=0; i < result.length; i++){
                    if(typeof result[i] != "undefined"){
                        doc.font('Times-Roman').fontSize(11).text(result[i].clientName,75,clientInc);
                        doc.font('Times-Roman').fontSize(11).text(result[i].loanAmount,212,clientInc);
                        //doc.font('Times-Roman').fontSize(11).text(result[i].loanAmount,340,clientInc);
                        doc.font('Times-Roman').fontSize(11).text(result[i].loan_purpose+"-"+result[i].sub_category,340,clientInc);
                        doc.font('Times-Roman').fontSize(10).text(" ",380,clientInc);
                        clientInc = clientInc + 30;
                    }
                    var ClientLegalFormDtoDetail = new ClientLegalFormDto();
                    this.ClientLegalFormDtoDetail = ClientLegalFormDtoDetail;
                    var ClientLegalFormDtoDetail = this.ClientLegalFormDtoDetail;
                    ClientLegalFormDtoDetail.setClientName(result[i].clientName);
                    ClientLegalFormDtoDetail.setRelationshipName(result[i].relationshipName);
                    ClientLegalFormDtoDetail.setClientAge(result[i].clientAge);
                    ClientLegalFormDtoDetail.setClientAddress(result[i].clientAddress);
                    customlog.info("Length=="+result[i].clientName);
                }
                for(var i=0; i<635; i=i+11.5){
                    doc.font('Times-Roman').fontSize(13).text("|",33.8,i+315);
                    doc.font('Times-Roman').fontSize(13).text("|",70,i+315);
                    doc.font('Times-Roman').fontSize(13).text("|",210,i+315);
                    doc.font('Times-Roman').fontSize(13).text("|",335,i+315);
                    doc.font('Times-Roman').fontSize(13).text("|",480,i+315);
                    doc.font('Times-Roman').fontSize(13).text("|",592,i+315);
                }
                var sno = 1;
                var j = 0;
                var tempHeight = 370;
                for(var i=0 ; i<525; i=i+25){
                    if(sno<21){
                        doc.font('Times-Roman').fontSize(13).text(""+sno,50,j+tempHeight);
                    }
                    doc.font('Times-Roman').fontSize(13).text("______________________________________________________________________________________",35,j+(tempHeight-25));
                    j = j + 30;
                    var jVal = 550;
                    if(tempHeight == 100){
                        jVal = 900;
                    }
                    sno ++;
                }
                doc.addPage({
                    size: 'LEGAL'
                });
                doc.image(rootPath + "/public/images/Loan Agreement-page-004.jpg", 5, 10, {scale: 0.5});
                doc.font('Times-Roman').fontSize(9).text("MSM MICROFINANCE LIMITED",165,68);
                doc.font('Times-Roman').fontSize(10.5).text("MSM MICROFINANCE LIMITED",213,170);
                /*doc.addPage({
                    size: 'LEGAL'
                });
                var lengthResults=Math.ceil(result.length/10);
                //for(var execute =0 ;execute<lengthResults;execute++){
                    //if(execute!=0){
                        //doc.addPage({
                         //   size: 'LEGAL'
                        //});
                   // }
                    doc.font('Times-Roman').fontSize(10).text('1',300,20);
                    doc.font('Times-Roman').fontSize(10).text('',520,30);
                    doc.font('Times-Roman').fontSize(16).text('LOAN AGREEMENT',180,40);
                    doc.font('Times-Roman').fontSize(10.5).text('This loan agreement made this _________day _________,___________between MAS Financial Services Ltd.,',50,55);
                    //doc.font('Times-Roman').fontSize(12).text(disbDateStr.getDate(),200,54);
                    //doc.font('Times-Roman').fontSize(12).text(month[disbDateStr.getMonth()],270,54);
                    //doc.font('Times-Roman').fontSize(12).text(disbDateStr.getFullYear(),355,54);
                    doc.font('Times-Roman').fontSize(10.5).text("a corporate body having its registered office at 6, Ground Floor, Narayan Chamber, B/h. Hotel Patang, Ashram ",50,75);
                    doc.font('Times-Roman').fontSize(10.5).text("Road,  Ahmedabad,  and  a  branch office at the address mentioned in the schedule hereunder written hereafter ",50,95);
                    doc.font('Times-Roman').fontSize(10.5).text("referred to us Company (which expression shall,unless repugnant to the context or meaning thereof shall mean ",50,115);
                    doc.font('Times-Roman').fontSize(10.5).text("and include its successors and assignees) and the borrower(s)s , the detail whereof are stated in the schedule -I ",50,130);
                    doc.font('Times-Roman').fontSize(10.5).text("(hereafter referred to as the borrower(s).)",50,145);
                    doc.font('Times-Roman').fontSize(10.5).text("It is hereby agreed between th borrower(s) and the Company as follows:",50,165);
                    doc.font('Times-Roman').fontSize(10.5).text("1.That the Company will advance to the borrower(s) as per Schedule -1 as MSE loan.",55,185);
                    doc.font('Times-Roman').fontSize(10.5).text("2.The borrower(s) agrees and undertake/s that he/she will utilize the whole amount of loan so advanced for any",55,200);
                    doc.font('Times-Roman').fontSize(10.5).text("   lawful purpose only and intimate the  Company,  the purpose for which the amount of loan is utilized by  the",55,215);
                    doc.font('Times-Roman').fontSize(10.5).text("   borrower(s) within a period of 10 days from the date of disbursement of loan..",55,230);
                    doc.font('Times-Roman').fontSize(10.5).text("3.That the amount of loan advanced to the borrower(s)under this agreement shall be repayable in equal/differential",55,245);
                    doc.font('Times-Roman').fontSize(10.5).text("   monthly installments with a minimum rate of interest as stated in Schedule -1. Interest shall be payable  by the",55,260);
                    doc.font('Times-Roman').fontSize(10.5).text("   borrower(s) at every pay out date and if not so paid, shall be debited to the account of the borrower(s) and same ",55,275);
                    doc.font('Times-Roman').fontSize(10.5).text("   shall be capitalized and shall carry interest as aforesaid, but nothing shall authorize the borrower(s)  to commit ",55,290);
                    doc.font('Times-Roman').fontSize(10.5).text("   default  in the monthly payment of installment  or interest.",55,305);
                    doc.font('Times-Roman').fontSize(10.5).text("4.If the requested facility amount is disbursed to the borrower based on the Application, the borrower shall repay ",55,320);
                    doc.font('Times-Roman').fontSize(10.5).text("   the Facility amount and applicable interest to the Company in installments on the Due Date(s) as specified above ",55,335);
                    doc.font('Times-Roman').fontSize(10.5).text("   (time being of essence of such obligation). The borrower herby undertakes and confirms that he/she shall, for the ",55,350);
                    doc.font('Times-Roman').fontSize(10.5).text("   purpose of meeting his/her payment obligation  to the Company, make payments on a weekly?  monthly basis to",55,365);
                    doc.font('Times-Roman').fontSize(10.5).text("   Apex Abishek Finance Ltd of such amounts as may be mutually agreed to between   Apex Abishek Finance Ltd ",55,380);
                    doc.font('Times-Roman').fontSize(10.5).text("   _____________________                                                                                           ________________________",55,381);
                    doc.font('Times-Roman').fontSize(10.5).text("   and the borrower or in accordance with such directions that may be issued from time to time by the Company.",55,395);
                    doc.font('Times-Roman').fontSize(10.5).text("   However, the same is without  any prejudice whatsoever to any of my repayment obligations to the Company in terms ",55,410);
                    doc.font('Times-Roman').fontSize(10.5).text("   of the Application.Further borrower agrees to the terms and condition contained in schedule -1 to this agreement. ",55,425);
                    doc.font('Times-Roman').fontSize(10.5).text("   However, Borrower agrees that in event of defaulti in ability in discharging payment obligation by the Borrower, ",55,440);
                    doc.font('Times-Roman').fontSize(10.5).text("   MAS shall have   rights to collect  the repayment  directly  from borrower  as agreed between  borrower and ",55,455);
                    doc.font('Times-Roman').fontSize(10.5).text("   Apex Abishek Finance Ltd through its authorized agent or officers.",55,470);
                    doc.font('Times-Roman').fontSize(10.5).text("    _____________________",55,471);
                    doc.font('Times-Roman').fontSize(10.5).text("5.If due to inability of borrower(s) to repay the installments of Loan I Borrowed amount as agreed upon to the ",55,485);
                    doc.font('Times-Roman').fontSize(10.5).text("   Business Associates , who in turn fails to release monthly installments to MAS as per agreed schedule for ",55,500);
                    doc.font('Times-Roman').fontSize(10.5).text("   whatsoever reason,  the borrower and business associates, shall be jointly and severally liable to pay the entire ",55,515);
                    doc.font('Times-Roman').fontSize(10.5).text("   amount ( i.e. amount prima facie receivable by the Company from Business Associate(s) as also the amount ",55,530);
                    doc.font('Times-Roman').fontSize(10.5).text("   payable  by borrower  to Business  Associates)  to  the  Company  including  accumulated  interest thereon for the",55,545);
                    doc.font('Times-Roman').fontSize(10.5).text("   delayed period till actual payment to the Company is made. Accordingly, the whole of the balance of the loan ",55,560);
                    doc.font('Times-Roman').fontSize(10.5).text("   with interest and other charges shall forthwith become due and payable by the borrower(s) to the Company and ",55,575);
                    doc.font('Times-Roman').fontSize(10.5).text("   the borrower(s) shall become liable to pay all costs, charges and expenses that may be incurred by the Company",55,590);
                    doc.font('Times-Roman').fontSize(10.5).text("   for recovery of the loan, unless the Company has agreed in writing to the postponement of payment of the",55,605);
                    doc.font('Times-Roman').fontSize(10.5).text("   installment as hereinafter provided.",55,620);
                    doc.font('Times-Roman').fontSize(10.5).text("6.The borrower(s)? Business Associates agrees that the Company shall have all the rights to recover the entire due ",55,635);
                    doc.font('Times-Roman').fontSize(10.5).text("   amount from the person and also from all the properties of the borrower(s). It is also agreed that the Company ",55,650);
                    doc.font('Times-Roman').fontSize(10.5).text("   shall have right to ask and/or to call upon the employer of the borrower(s) to deduct the amount of due installments",55,665);
                    doc.font('Times-Roman').fontSize(10.5).text("   from the salary of the borrower(s) and to pay the same to the Company. Th borrower(s) further agrees that they",55,680);
                    doc.font('Times-Roman').fontSize(10.5).text("   will pay the installment collectively, in case of any unavoidable circumstance if one or more of the borrower(s)",55,700);
                    doc.font('Times-Roman').fontSize(10.5).text("   fail to pay the obligation,  then others will honor the obligation  singly or collectively on behalf those borrower..",55,720);
                    doc.font('Times-Roman').fontSize(10.5).text("7.The Company may for sufficient and satisfactory cause allow postponement of payment of any monthly installment",55,735);
                    doc.font('Times-Roman').fontSize(10.5).text("   / installments for such period on such payment by the borrower(s) and charge                       per cent per month",55,750);
                    doc.font('Times-Roman').fontSize(10.5).text("                                                                                                                                _________",55,751);
                    doc.font('Times-Roman').fontSize(10.5).text("   additional charges for such postponement of payment, on the amount of the unpaid installment or installments",55,765);
                    doc.font('Times-Roman').fontSize(10.5).text("   for which extensions are given by debiting the same to the account of the borrower(s).",55,780);
                    doc.font('Times-Roman').fontSize(10.5).text("8.In the event of the borrower(s) failing to pay the balance or any other moneys which may become due to the ",55,795);
                    doc.font('Times-Roman').fontSize(10.5).text("   Company under or by virtue of this agreement in the event of the borrower(s) failing to observe or perform any of ",55,805);
                    doc.font('Times-Roman').fontSize(10.5).text("   the terms and conditions hereof or in the event of the borrower(s) becoming or being adjudicated an insolvent or ",55,820);
                    doc.font('Times-Roman').fontSize(10.5).text("   if for any reason, the Company thinks that the interest of the company is likely to be prejudiced in any manner, ",55,835);
                    doc.font('Times-Roman').fontSize(10.5).text("   the Company shall be entitled to recover the entire outstanding amount at once with interest and other charges.",55,850);
                    doc.font('Times-Roman').fontSize(10.5).text(" 1                                        2                                        3                                 4                                 5",55,870);
                    doc.font('Times-Roman').fontSize(10.5).text(" 6                                        7                                        8                                 9                                 10",55,900);
                    doc.font('Times-Roman').fontSize(10.5).text(" 11                                       12                                       13                                14                               15",55,930);
                    doc.font('Times-Roman').fontSize(10.5).text(" 16                                       17                                       18                                19                               20",55,960);
                    doc.addPage({
                        size: 'LEGAL'
                    });
                    doc.font('Times-Roman').fontSize(10).text('2',300,20);
                    doc.font('Times-Roman').fontSize(10.5).text("9.Authority to Appropriate Security Deposit: The  Loanee shall place / arrange to place with the financers as per ",55,30);
                    doc.font('Times-Roman').fontSize(10.5).text("   schedule-I as security deposit of his own or of third party forming part of initial payment of this agreement. The ",55,45);
                    doc.font('Times-Roman').fontSize(10.5).text("   Loanee andlor the third party depositor/s hereby through these presents, confer an unconditional lien in favour of ",55,60);
                    doc.font('Times-Roman').fontSize(10.5).text("   the financers in respect of the security deposit and interest if any accrued thereon, and further hereby grant to the ",55,75);
                    doc.font('Times-Roman').fontSize(10.5).text("   financiers an unconditional and irrevocable rights to adjust and appropriate the said security deposits towards his ",55,90);
                    doc.font('Times-Roman').fontSize(10.5).text("   outstanding dues. It is specifically agreed by the loanee that in case of irregular accounts simple interest @6% pa.",55,105);
                    doc.font('Times-Roman').fontSize(10.5).text("   shall be levied by the company on the security deposit and any commitment of the company to pay higher rate of",55,120);
                    doc.font('Times-Roman').fontSize(10.5).text("   interest shall come to an end, The Company shall have all the rights to adjust the  security  deposit  and  interest",55,135);
                    doc.font('Times-Roman').fontSize(10.5).text("   accrued thereon  against overdue/debit  balance  of the A/c of the Loanee.",55,150);
                    doc.font('Times-Roman').fontSize(10.5).text("10.Nothing herein contained shall be deemed to negative,qualify or otherwise prejudicially affect the Company's rights",55,165);
                    doc.font('Times-Roman').fontSize(10.5).text("   or remedies (which it is expressly agreed that the Company shall have) in respect of any present or future securities. ",55,180);
                    doc.font('Times-Roman').fontSize(10.5).text("   guarantees, or decree for any indebtedness or liability of the borrower(s) to the Company whether singly or jointly ",55,195);
                    doc.font('Times-Roman').fontSize(10.5).text("   with another or others and whether the said securities guarantees or decree referred to herein are renewed, altered or ",55,210);
                    doc.font('Times-Roman').fontSize(10.5).text("   varied to the extent or in any manner.",55,225);
                    doc.font('Times-Roman').fontSize(10.5).text("11.The Borrower(s) shall pay on demand all costs charges and expenses of the Company between attorney and ",55,240);
                    doc.font('Times-Roman').fontSize(10.5).text("   client incurred or suffered by the Company in execution or carrying into effect or enforcing or this agreement or in ",55,255);
                    doc.font('Times-Roman').fontSize(10.5).text("   relation to the exercise of any power of sale or in relation to any act, deed, matter or thing arising out of this ",55,265);
                    doc.font('Times-Roman').fontSize(10.5).text("   agreement or of and incidental thereto and shall also pay interest thereon at the rate and in the manner aforesaid.",55,290);
                    doc.font('Times-Roman').fontSize(10.5).text("12.This agreement shall continue in operation until this agreement is expressly cancelled either by the Company ",55,305);
                    doc.font('Times-Roman').fontSize(10.5).text("   or by mutual consent of both the parties, such cancellation by the Company not to affect the obligations of the ",55,320);
                    doc.font('Times-Roman').fontSize(10.5).text("   Borrower to the Company already incurred",55,335);
                    doc.font('Times-Roman').fontSize(10.5).text("13.The Borrower(s) if required by the Company agrees and undertakes to provide and furnish to the Company, to ",55,365);
                    doc.font('Times-Roman').fontSize(10.5).text("   their satisfaction, such security, to secure the Loan. Failure of the Borrower(s) shall be termed as an Event of Default. ",55,380);
                    doc.font('Times-Roman').fontSize(10.5).text("14.The Borrower(s) may by giving 14 days notice in writing prepay the entire Loan (principal amount along with interest",55,395);
                    doc.font('Times-Roman').fontSize(10.5).text("   and all outstanding amounts) amount to the Company. The Company shall levy prepayment charges at the rate ",55,405);
                    doc.font('Times-Roman').fontSize(10.5).text("   indicated in the schedule on the amount so prepaid. On such settlement, The Company shall return the post-dated ",55,420);
                    doc.font('Times-Roman').fontSize(10.5).text("   cheques to the Borrower(s). Such re payment shall be by the Borrower to the Company shallbe said to have been",55,435);
                    doc.font('Times-Roman').fontSize(10.5).text("   made only on realization and credit of such payment in the bank account of the Company.",55,450);
                    doc.font('Times-Roman').fontSize(10.5).text("15.The Borrower(s) shall not have any right to assign its obligations under this agreement; however the Company ",55,465);
                    doc.font('Times-Roman').fontSize(10.5).text("   has the right to transfer, assign and sell in any manner, in whole or in part, the outstanding and dues to any third ",55,480);
                    doc.font('Times-Roman').fontSize(10.5).text("   party without reference or intimation to the Borrower(s).",55,495);
                    doc.font('Times-Roman').fontSize(10.5).text("16.(a) To remove any doubt it is clarified that, where the Loan is provided to more than one Borrower(s), the ",55,505);
                    doc.font('Times-Roman').fontSize(10.5).text("   liability of the Borrower(s) to repay the Loan along with interest, costs, charges, expenses etc shall be joint and several and",55,520);
                    doc.font('Times-Roman').fontSize(10.5).text("   the word Borrower(s)  in this agreement shall be construed as Borrower(s).",55,535);
                    doc.font('Times-Roman').fontSize(10.5).text("   (b) To remove any doubt it is further clarified that the Borrower(s) agrees that the installment amount shaLl be ",55,550);
                    doc.font('Times-Roman').fontSize(10.5).text("   increased by Service Tax, other incremental taxes, interest tax and any other related and consequential charges and ",55,565);
                    doc.font('Times-Roman').fontSize(10.5).text("   taxes levied on this transaction now or hereafter to be levied between the date of availing of the Loan and the date",55,580);
                    doc.font('Times-Roman').fontSize(10.5).text("   of payment of entire Loan to the Company.",55,595);
                    doc.font('Times-Roman').fontSize(10.5).text("17.Any notice required to be given under this agreement shall be in writing and shall be deemed to have been duly given",55,605);
                    doc.font('Times-Roman').fontSize(10.5).text("   if dispatched by post addressed  to the party for whom  or which it is intended at his or its last known place of",55,620);
                    doc.font('Times-Roman').fontSize(10.5).text("   business and every such notice shall be deemed to have been received by the addressee on the expiration of the",55,635);
                    doc.font('Times-Roman').fontSize(10.5).text("   normal period occupied in transit by post.",55,650);
                    doc.font('Times-Roman').fontSize(10.5).text("18.All disputes and differences and claims and questions whatsoever which shall either during the continuance of ",55,665);
                    doc.font('Times-Roman').fontSize(10.5).text("   the Agreement or after wards between the parties hereto or their respective representatives touching these presents ",55,680);
                    doc.font('Times-Roman').fontSize(10.5).text("   or the construction or application thereof, or any clause or thing therein contained, or any account or liability ",55,695);
                    doc.font('Times-Roman').fontSize(10.5).text("   between the Parties hereto, or as to any act, deed or omission of any hereto in any way relating to these presents, ",55,705);
                    doc.font('Times-Roman').fontSize(10.5).text("   shall be settled by arbitration in accordance with and subject to the provisions of the Arbitration and Conciliation ",55,720);
                    doc.font('Times-Roman').fontSize(10.5).text("   Ordinance, 1996, or any statutory modification or re-enactment thereof for the time being in force & shall be referred ",55,735);
                    doc.font('Times-Roman').fontSize(10.5).text("   to the sole arbitration of an arbitrator nominated by the Company. The award given in arbitration shall be final and ",55,750);
                    doc.font('Times-Roman').fontSize(10.5).text("   binding on both the parties to this agreement.",55,765);
                    doc.font('Times-Roman').fontSize(10.5).text("   All such arbitration proceedings shall be held and conducted in Ahmedabad  city, Gujarat.",55,780);
                    doc.font('Times-Roman').fontSize(10.5).text("19.The Company may provide a facility of moratorium period, not exceeding months on written request of ",55,795);
                    doc.font('Times-Roman').fontSize(10.5).text("   the Borrower(s) at the time of loan application/loan disbursement or a any time during the loan period. The ",55,805);
                    doc.font('Times-Roman').fontSize(10.5).text("  (actual interest)",165,819);
                    doc.font('Times-Roman').fontSize(10.5).text("   company shall charge Rs _____________to provide such facilities. It is the sole discretion of the Company to cancel",55,820);
                    doc.font('Times-Roman').fontSize(10.5).text("   the facility whenever it deems fit, and the Borrower(s) has to start to repay the remaining loan installment(s) ",55,835);
                    doc.font('Times-Roman').fontSize(10.5).text("   regularly. Failure of which may cause the necessary legal actions by the Company.",55,850);
                    doc.font('Times-Roman').fontSize(10.5).text(" 1                                         2                                         3                                    4                                5",55,870);
                    doc.font('Times-Roman').fontSize(10.5).text(" 6                                         7                                         8                                    9                                10",55,900);
                    doc.font('Times-Roman').fontSize(10.5).text(" 11                                        12                                        13                                   14                              15",55,930);
                    doc.font('Times-Roman').fontSize(10.5).text(" 16                                        17                                        18                                   19                              20",55,960);*/
                    /*doc.addPage({
                        size: 'LEGAL'
                    });
                    doc.font('Times-Roman').fontSize(10).text('3',300,20);
                    doc.font('Times-Roman').fontSize(10.5).text("20.The Borrower(s) has agreed and given consent to the Company that, the Company can collect the information from",55,35);
                    doc.font('Times-Roman').fontSize(10.5).text("     Credit Bureau and /or any other Govt./Semi Govt./ Non-Govt. / Institution or Organization and share with any other",55,50);
                    doc.font('Times-Roman').fontSize(10.5).text("     institution or organization without informing to the Borrower(s).",55,65);
                    doc.font('Times-Roman').fontSize(10.5).text("21.Any new changes are amended by the Company they will inform the borrower(s), if he doesn't reply/oppose within ",55,80);
                    doc.font('Times-Roman').fontSize(10.5).text("     7 days of that information company will consider this as his/her acceptance.",55,95);
                    doc.font('Times-Roman').fontSize(10.5).text("22.KYC of the borrower (s) should be updated regularly.",55,110);
                    doc.font('Times-Roman').fontSize(10.5).text("23.The borrower (s) should adhere to the Company's requirement for KYC as per new guidelines issued by authorities",55,125);
                    doc.font('Times-Roman').fontSize(10.5).text("     from time to time.",55,140);
                    doc.font('Times-Roman').fontSize(10.5).text("24.All Disputes and differences and claims and questions whatsoever which shall either during the continuance of the",55,155);
                    doc.font('Times-Roman').fontSize(10.5).text("     agreement or after wards between the parties here to or their respective representatives touching these presents of",55,170);
                    doc.font('Times-Roman').fontSize(10.5).text("     the construction or application thereof,or any clause or thing therein contained, or any account or liability between",55,185);
                    doc.font('Times-Roman').fontSize(10.5).text("     the parties hereto,or as to any act,  deed or omission of any hereto in any way relating to these presents, shall be",55,200);
                    doc.font('Times-Roman').fontSize(10.5).text("     settled by arbitration in accordance with and subject to the provisions of the Arbitration and Conciliation Ordinance,",55,215);
                    doc.font('Times-Roman').fontSize(10.5).text("     1996,or any statutory modification or re-enactment thereof for the time being in force and shall be referred to the sole",55,230);
                    doc.font('Times-Roman').fontSize(10.5).text("     arbitration of an arbitrator nominated by the Company. The award given in arbitration shall be final and binding on",55,245);
                    doc.font('Times-Roman').fontSize(10.5).text("     both the parties to this agreement. All such arbitration proceedings shall be held and conducted in Ahmedabad or at",55,260);
                    doc.font('Times-Roman').fontSize(10.5).text("     any city in India. Company reserves its right for the same.",55,275);*/

                    /*doc.addPage({
                        size: 'LEGAL'
                    });
                    doc.font('Times-Roman').fontSize(10).text('4',300,20);
                    doc.font('Times-Roman').fontSize(10.5).text("                                       Apex Abishek Finance Ltd",55,48);
                    doc.font('Times-Roman').fontSize(10.5).text(" To be filled in by ___________________________________(Business Associate in this case))",55,50);
                    doc.font('Times-Roman').fontSize(10.5).text(" I/ We hereby certify that the above named person (s), whose photograph (s)  is/ are attached with  application form",55,65);
                    doc.font('Times-Roman').fontSize(10.5).text(" is/are the genuine borrowers. I/We have visited the above borrowers on __________________ (date) in connection",55,80);
                    doc.font('Times-Roman').fontSize(10.5).text(" with their loan application made as per schedule-1 for the purpose to MAS Financial Services Limited Ahmedabad.",55,95);
                    doc.font('Times-Roman').fontSize(10.5).text(" I/ We also certify that the particulars/information given by the Applicant (s) here in above are true and correct, and ",55,110);
                    doc.font('Times-Roman').fontSize(10.5).text(" recommend the same for approval from MAS Financial Services Limited.",55,125);
                    doc.font('Times-Roman').fontSize(10.5).text(" Name of Business Associate:    Apex Abishek Finance Ltd",55,145);
                    doc.font('Times-Roman').fontSize(10.5).text(" Business associate Seal: ",55,180);
                    doc.font('Times-Roman').fontSize(10.5).text(" Desigination of Employee of Business associate ",55,225);
                    doc.font('Times-Roman').fontSize(10.5).text(" Employee Name & Sign of Business associate:  ",55,270);
                //}*/
                doc.write(rootPath+"/public/GeneratedPDF/"+groupId+"_MASLoanAgreementform.pdf");
                doc.write("MASLegalForm.pdf",function(err){
                 if(err){
                    customlog.info(err);
                     callback("failure");
                 }else{
                    customlog.info("form write");
                     callback("success");
                 }

                 });
            });
        }catch(e){
            customlog.error("Exception while Generating legal Form "+ e);
            self.showErrorPage(req,res);
        }
    },
    generateMASLoanAgreementFormCall : function(mifosGlobalAccountNo,callback){
        this.model.generateMASLegalFormModel(mifosGlobalAccountNo,callback);
    },
    //Ended By Sathish Kumar #008 MAS Legal Form Generation

    //Added By Sathish Kumar M #008 For MAS Legal Form Generation.
    generateMASDemandPromissoryform: function(req,res,callback){
        try{
            var self = this;
            var http = require('http');
            var https = require('https');
            var groupId = req.body.mifosCustomerId;
            var mifosGlobalAccNo = req.body.mifosGlobalAccNo;
            var disbAmount = req.body.disbAmount;
            var interestRateValue = req.body.interestRateValue;
            var recurrenceType = req.body.recurrenceType;
            var month=new Array("January","February","March","April","May","June","July","August","September","October","November","December");
            if(req.body.syncDisbDate != null){
                var disbDate = req.body.syncDisbDate;
            }else{
                var disbDate = dateUtils.convertToMifosDateFormat(req.body.disbDate);
            }
            var disbDateStr = new Date(disbDate);
            customlog.info("groupId "+groupId);
            var postheaders = {
                'Content-Type' : 'application/json',
                'Cookie' : req.session.mifosCookie
            };
            var options = {
                host: mifosServiceIP,
                port: mifosPort,
                path: "/mfi/api/report/customer/legalForm-"+groupId+".json",
                method: 'GET',
                headers : postheaders
            };
            self.generateMASDemandPromissoryformCall(mifosGlobalAccNo,function(result){
                var word = new Array();
                for(i in result){
                    if(result[i].loanAmount == 15000){
                        word.push("Fifteen Thousand Rupees only");
                    }else if(result[i].loanAmount == 25000){
                        word.push("Twenty Five Thousand Rupees only");
                    }else if(result[i].loanAmount == 30000){
                        word.push("Thirty Thousand Rupees only");
                    }else if(result[i].loanAmount == 18000){
                        word.push("Eighteen Thousand Rupees only");
                    }else{
                        word.push(" ");
                    }
                }
                var doc = new PDFDocument({
                    size: 'LEGAL'
                });
                doc.font('Times-Roman').fontSize(10).text('',300,20);
                doc.font('Times-Roman').fontSize(10).text('',520,30);
                doc.font('Times-Roman').fontSize(16).text('DEMAND PROMISSORY NOTE',180,40);
                doc.font('Times-Roman').fontSize(10.5).text(disbAmount,70,59);
                doc.font('Times-Roman').fontSize(10.5).text('Rs.______________________along with interest @ ______________________ there on.',50,60);
                doc.font('Times-Roman').fontSize(10.5).text("Agreement No:______________________",50,75);
                doc.font('Times-Roman').fontSize(10).text(result[0].officeName,80,94);
                doc.font('Times-Roman').fontSize(10.5).text("Place:______________________",50,95);
                doc.font('Times-Roman').fontSize(10.5).text("Date: ______________________",50,115);

                doc.font('Times-Roman').fontSize(10.5).text("On Demand I/We  _______________________________________________________________________the",50,130);
                doc.font('Times-Roman').fontSize(10.5).text("undersigned jointly/severally promise to pay MAS FINANCIAL SERVICES LIMITED - AHMEDABAD,",50,145);
                doc.font('Times-Roman').fontSize(10.5).text("or order at Ahmedabad, sum of Rupees _______________________________________, along with interest",50,165);
                doc.font('Times-Roman').fontSize(10.5).text("there on @ ______________________,for value loan received.",50,185);

                doc.font('Times-Roman').fontSize(10).text('__________',540,130);
                doc.font('Times-Roman').fontSize(10).text('|',539,139);
                doc.font('Times-Roman').fontSize(10).text('|',539,148);
                doc.font('Times-Roman').fontSize(10).text('1 Rupee',543,148);
                doc.font('Times-Roman').fontSize(10).text('|',539,159);
                doc.font('Times-Roman').fontSize(10).text('Revenue',544,155);
                doc.font('Times-Roman').fontSize(10).text('|',539,165);
                doc.font('Times-Roman').fontSize(10).text('Stamp',545,167);
                doc.font('Times-Roman').fontSize(10).text('|',539,175);
                doc.font('Times-Roman').fontSize(10).text('|',590,139);
                doc.font('Times-Roman').fontSize(10).text('|',590,149);
                doc.font('Times-Roman').fontSize(10).text('|',590,159);
                doc.font('Times-Roman').fontSize(10).text('|',590,167);
                doc.font('Times-Roman').fontSize(10).text('|',590,175);
                doc.font('Times-Roman').fontSize(10).text('__________',540,175);

                doc.font('Times-Roman').fontSize(10.5).text("On Demand I/We  _________________________________________________________________________the",50,215);
                doc.font('Times-Roman').fontSize(10.5).text("undersigned jointly/severally promise to pay MAS FINANCIAL SERVICES LIMITED - AHMEDABAD, ",50,230);
                doc.font('Times-Roman').fontSize(10.5).text("or order at Ahmedabad, sum of Rupees ____________________________________________, along with interest ",50,245);
                doc.font('Times-Roman').fontSize(10.5).text("there on @ ______________________,for value loan received.  ",50,260);

                doc.font('Times-Roman').fontSize(10).text('__________',540,215);
                doc.font('Times-Roman').fontSize(10).text('|',539,223);
                doc.font('Times-Roman').fontSize(10).text('|',539,229);
                doc.font('Times-Roman').fontSize(10).text('1 Rupee',543,230);
                doc.font('Times-Roman').fontSize(10).text('|',539,238);
                doc.font('Times-Roman').fontSize(10).text('Revenue',544,240);
                doc.font('Times-Roman').fontSize(10).text('|',539,247);
                doc.font('Times-Roman').fontSize(10).text('Stamp',545,247);
                doc.font('Times-Roman').fontSize(10).text('|',539,256);
                doc.font('Times-Roman').fontSize(10).text('|',590,223);
                doc.font('Times-Roman').fontSize(10).text('|',590,229);
                doc.font('Times-Roman').fontSize(10).text('|',590,238);
                doc.font('Times-Roman').fontSize(10).text('|',590,247);
                doc.font('Times-Roman').fontSize(10).text('|',590,256);
                doc.font('Times-Roman').fontSize(10).text('__________',540,256);

                doc.font('Times-Roman').fontSize(10.5).text("On Demand I/We  _________________________________________________________________________the",50,290);
                doc.font('Times-Roman').fontSize(10.5).text("undersigned jointly/severally promise to pay MAS FINANCIAL SERVICES LIMITED - AHMEDABAD,  ",50,305);
                doc.font('Times-Roman').fontSize(10.5).text("or order at Ahmedabad, sum of Rupees ____________________________________________, along with interest  ",50,320);
                doc.font('Times-Roman').fontSize(10.5).text("there on @ ______________________,for value loan received.",50,335);

                doc.font('Times-Roman').fontSize(10).text('__________',540,290);
                doc.font('Times-Roman').fontSize(10).text('|',539,299);
                doc.font('Times-Roman').fontSize(10).text('|',539,308);
                doc.font('Times-Roman').fontSize(10).text('1 Rupee',543,305);
                doc.font('Times-Roman').fontSize(10).text('|',539,317);
                doc.font('Times-Roman').fontSize(10).text('Revenue',544,311);
                doc.font('Times-Roman').fontSize(10).text('|',539,326);
                doc.font('Times-Roman').fontSize(10).text('Stamp',545,319);
                doc.font('Times-Roman').fontSize(10).text('|',539,335);
                doc.font('Times-Roman').fontSize(10).text('|',590,299);
                doc.font('Times-Roman').fontSize(10).text('|',590,308);
                doc.font('Times-Roman').fontSize(10).text('|',590,317);
                doc.font('Times-Roman').fontSize(10).text('|',590,326);
                doc.font('Times-Roman').fontSize(10).text('|',590,335);
                doc.font('Times-Roman').fontSize(10).text('__________',540,335);

                doc.font('Times-Roman').fontSize(10.5).text("On Demand I/We  _________________________________________________________________________the",50,365);
                doc.font('Times-Roman').fontSize(10.5).text("undersigned jointly/severally promise to pay MAS FINANCIAL SERVICES LIMITED - AHMEDABAD, ",50,380);
                doc.font('Times-Roman').fontSize(10.5).text("or order at Ahmedabad, sum of Rupees ____________________________________________, along with interest ",50,395);
                doc.font('Times-Roman').fontSize(10.5).text("there on @ ______________________,for value loan received.",50,405);

                doc.font('Times-Roman').fontSize(10).text('__________',540,365);
                doc.font('Times-Roman').fontSize(10).text('|',539,374);
                doc.font('Times-Roman').fontSize(10).text('|',539,383);
                doc.font('Times-Roman').fontSize(10).text('1 Rupee',543,386);
                doc.font('Times-Roman').fontSize(10).text('|',539,392);
                doc.font('Times-Roman').fontSize(10).text('Revenue',544,392);
                doc.font('Times-Roman').fontSize(10).text('|',539,401);
                doc.font('Times-Roman').fontSize(10).text('Stamp',545,399);
                doc.font('Times-Roman').fontSize(10).text('|',539,410);
                doc.font('Times-Roman').fontSize(10).text('|',590,374);
                doc.font('Times-Roman').fontSize(10).text('|',590,383);
                doc.font('Times-Roman').fontSize(10).text('|',590,392);
                doc.font('Times-Roman').fontSize(10).text('|',590,401);
                doc.font('Times-Roman').fontSize(10).text('|',590,410);
                doc.font('Times-Roman').fontSize(10).text('__________',540,410);

                doc.font('Times-Roman').fontSize(10.5).text("On Demand I/We  _________________________________________________________________________the",50,435);
                doc.font('Times-Roman').fontSize(10.5).text("undersigned jointly/severally promise to pay MAS FINANCIAL SERVICES LIMITED - AHMEDABAD,",50,450);
                doc.font('Times-Roman').fontSize(10.5).text("or order at Ahmedabad, sum of Rupees ____________________________________________, along with interest",50,465);
                doc.font('Times-Roman').fontSize(10.5).text("there on @ ______________________,for value loan received.",50,480);

                doc.font('Times-Roman').fontSize(10).text('__________',540,435);
                doc.font('Times-Roman').fontSize(10).text('|',539,444);
                doc.font('Times-Roman').fontSize(10).text('|',539,453);
                doc.font('Times-Roman').fontSize(10).text('1 Rupee',543,453);
                doc.font('Times-Roman').fontSize(10).text('|',539,459);
                doc.font('Times-Roman').fontSize(10).text('Revenue',544,459);
                doc.font('Times-Roman').fontSize(10).text('|',539,467);
                doc.font('Times-Roman').fontSize(10).text('Stamp',545,467);
                doc.font('Times-Roman').fontSize(10).text('|',539,475);
                doc.font('Times-Roman').fontSize(10).text('|',590,444);
                doc.font('Times-Roman').fontSize(10).text('|',590,453);
                doc.font('Times-Roman').fontSize(10).text('|',590,459);
                doc.font('Times-Roman').fontSize(10).text('|',590,467);
                doc.font('Times-Roman').fontSize(10).text('|',590,475);
                doc.font('Times-Roman').fontSize(10).text('__________',540,475);

                doc.font('Times-Roman').fontSize(10.5).text("On Demand I/We  _________________________________________________________________________the",50,510);
                doc.font('Times-Roman').fontSize(10.5).text("undersigned jointly/severally promise to pay MAS FINANCIAL SERVICES LIMITED - AHMEDABAD, ",50,525);
                doc.font('Times-Roman').fontSize(10.5).text("or order at Ahmedabad, sum of Rupees ____________________________________________, along with interest ",50,540);
                doc.font('Times-Roman').fontSize(10.5).text("there on @ ______________________,for value loan received.",50,555);

                doc.font('Times-Roman').fontSize(10).text('__________',540,510);
                doc.font('Times-Roman').fontSize(10).text('|',539,519);
                doc.font('Times-Roman').fontSize(10).text('|',539,528);
                doc.font('Times-Roman').fontSize(10).text('1 Rupee',543,528);
                doc.font('Times-Roman').fontSize(10).text('|',539,537);
                doc.font('Times-Roman').fontSize(10).text('Revenue',544,534);
                doc.font('Times-Roman').fontSize(10).text('|',539,546);
                doc.font('Times-Roman').fontSize(10).text('Stamp',545,545);
                doc.font('Times-Roman').fontSize(10).text('|',539,555);
                doc.font('Times-Roman').fontSize(10).text('|',590,519);
                doc.font('Times-Roman').fontSize(10).text('|',590,528);
                doc.font('Times-Roman').fontSize(10).text('|',590,537);
                doc.font('Times-Roman').fontSize(10).text('|',590,546);
                doc.font('Times-Roman').fontSize(10).text('|',590,555);
                doc.font('Times-Roman').fontSize(10).text('__________',540,555);

                doc.font('Times-Roman').fontSize(10.5).text("On Demand I/We  _________________________________________________________________________the",50,585);
                doc.font('Times-Roman').fontSize(10.5).text("undersigned jointly/severally promise to pay MAS FINANCIAL SERVICES LIMITED - AHMEDABAD, ",50,600);
                doc.font('Times-Roman').fontSize(10.5).text(" or order at Ahmedabad, sum of Rupees ____________________________________________, along with interest",50,615);
                doc.font('Times-Roman').fontSize(10.5).text("there on @ ______________________,for value loan received. ",50,630);

                doc.font('Times-Roman').fontSize(10).text('__________',540,585);
                doc.font('Times-Roman').fontSize(10).text('|',539,594);
                doc.font('Times-Roman').fontSize(10).text('|',539,603);
                doc.font('Times-Roman').fontSize(10).text('1 Rupee',543,599);
                doc.font('Times-Roman').fontSize(10).text('|',539,612);
                doc.font('Times-Roman').fontSize(10).text('Revenue',544,605);
                doc.font('Times-Roman').fontSize(10).text('|',539,621);
                doc.font('Times-Roman').fontSize(10).text('Stamp',545,611);
                doc.font('Times-Roman').fontSize(10).text('|',539,630);
                doc.font('Times-Roman').fontSize(10).text('|',590,594);
                doc.font('Times-Roman').fontSize(10).text('|',590,603);
                doc.font('Times-Roman').fontSize(10).text('|',590,612);
                doc.font('Times-Roman').fontSize(10).text('|',590,621);
                doc.font('Times-Roman').fontSize(10).text('|',590,630);
                doc.font('Times-Roman').fontSize(10).text('__________',540,630);

                doc.font('Times-Roman').fontSize(10.5).text("On Demand I/We  _________________________________________________________________________the",50,660);
                doc.font('Times-Roman').fontSize(10.5).text("undersigned jointly/severally promise to pay MAS FINANCIAL SERVICES LIMITED - AHMEDABAD,",50,675);
                doc.font('Times-Roman').fontSize(10.5).text("or order at Ahmedabad, sum of Rupees ____________________________________________, along with interest ",50,690);
                doc.font('Times-Roman').fontSize(10.5).text("there on @ ______________________,for value loan received. ",50,705);

                doc.font('Times-Roman').fontSize(10).text('__________',540,665);
                doc.font('Times-Roman').fontSize(10).text('|',539,674);
                doc.font('Times-Roman').fontSize(10).text('|',539,683);
                doc.font('Times-Roman').fontSize(10).text('1 Rupee',543,686);
                doc.font('Times-Roman').fontSize(10).text('|',539,692);
                doc.font('Times-Roman').fontSize(10).text('Revenue',544,692);
                doc.font('Times-Roman').fontSize(10).text('|',539,701);
                doc.font('Times-Roman').fontSize(10).text('Stamp',545,699);
                doc.font('Times-Roman').fontSize(10).text('|',539,710);
                doc.font('Times-Roman').fontSize(10).text('|',590,674);
                doc.font('Times-Roman').fontSize(10).text('|',590,683);
                doc.font('Times-Roman').fontSize(10).text('|',590,692);
                doc.font('Times-Roman').fontSize(10).text('|',590,701);
                doc.font('Times-Roman').fontSize(10).text('|',590,710);
                doc.font('Times-Roman').fontSize(10).text('__________',540,710);

                doc.font('Times-Roman').fontSize(10.5).text("On Demand I/We  _________________________________________________________________________the",50,735);
                doc.font('Times-Roman').fontSize(10.5).text("undersigned jointly/severally promise to pay MAS FINANCIAL SERVICES LIMITED - AHMEDABAD,",50,750);
                doc.font('Times-Roman').fontSize(10.5).text("or order at Ahmedabad, sum of Rupees ____________________________________________, along with interest",50,765);
                doc.font('Times-Roman').fontSize(10.5).text("there on @ ______________________,for value loan received. ",50,780);

                doc.font('Times-Roman').fontSize(10).text('__________',540,735);
                doc.font('Times-Roman').fontSize(10).text('|',539,744);
                doc.font('Times-Roman').fontSize(10).text('|',539,753);
                doc.font('Times-Roman').fontSize(10).text('1 Rupee',543,753);
                doc.font('Times-Roman').fontSize(10).text('|',539,759);
                doc.font('Times-Roman').fontSize(10).text('Revenue',544,759);
                doc.font('Times-Roman').fontSize(10).text('|',539,767);
                doc.font('Times-Roman').fontSize(10).text('Stamp',545,767);
                doc.font('Times-Roman').fontSize(10).text('|',539,775);
                doc.font('Times-Roman').fontSize(10).text('|',590,744);
                doc.font('Times-Roman').fontSize(10).text('|',590,753);
                doc.font('Times-Roman').fontSize(10).text('|',590,759);
                doc.font('Times-Roman').fontSize(10).text('|',590,767);
                doc.font('Times-Roman').fontSize(10).text('|',590,775);
                doc.font('Times-Roman').fontSize(10).text('__________',540,775);

                doc.font('Times-Roman').fontSize(10.5).text("On Demand I/We  _________________________________________________________________________the",50,810);
                doc.font('Times-Roman').fontSize(10.5).text("undersigned jointly/severally promise to pay MAS FINANCIAL SERVICES LIMITED - AHMEDABAD,",50,825);
                doc.font('Times-Roman').fontSize(10.5).text("or order at Ahmedabad, sum of Rupees ____________________________________________, along with interest",50,840);
                doc.font('Times-Roman').fontSize(10.5).text("there on @ ______________________,for value loan received.",50,855);

                doc.font('Times-Roman').fontSize(10).text('__________',540,810);
                doc.font('Times-Roman').fontSize(10).text('|',539,819);
                doc.font('Times-Roman').fontSize(10).text('|',539,828);
                doc.font('Times-Roman').fontSize(10).text('1 Rupee',543,828);
                doc.font('Times-Roman').fontSize(10).text('|',539,837);
                doc.font('Times-Roman').fontSize(10).text('Revenue',544,834);
                doc.font('Times-Roman').fontSize(10).text('|',539,846);
                doc.font('Times-Roman').fontSize(10).text('Stamp',545,845);
                doc.font('Times-Roman').fontSize(10).text('|',539,855);
                doc.font('Times-Roman').fontSize(10).text('|',590,819);
                doc.font('Times-Roman').fontSize(10).text('|',590,828);
                doc.font('Times-Roman').fontSize(10).text('|',590,837);
                doc.font('Times-Roman').fontSize(10).text('|',590,846);
                doc.font('Times-Roman').fontSize(10).text('|',590,855);
                doc.font('Times-Roman').fontSize(10).text('__________',540,855);

                doc.font('Times-Roman').fontSize(12).text((typeof  result[0] == 'undefined')?"":result[0].clientName,150,129);
                doc.font('Times-Roman').fontSize(12).text((typeof  result[1] == 'undefined')?"":result[1].clientName,150,214);
                doc.font('Times-Roman').fontSize(12).text((typeof  result[2] == 'undefined')?"":result[2].clientName,150,289);
                doc.font('Times-Roman').fontSize(12).text((typeof  result[3] == 'undefined')?"":result[3].clientName,150,364);
                doc.font('Times-Roman').fontSize(12).text((typeof  result[4] == 'undefined')?"":result[4].clientName,150,434);
                doc.font('Times-Roman').fontSize(12).text((typeof  result[5] == 'undefined')?"":result[5].clientName,150,509);
                doc.font('Times-Roman').fontSize(12).text((typeof  result[6] == 'undefined')?"":result[6].clientName,150,584);
                doc.font('Times-Roman').fontSize(12).text((typeof  result[7] == 'undefined')?"":result[7].clientName,150,659);
                doc.font('Times-Roman').fontSize(12).text((typeof  result[8] == 'undefined')?"":result[8].clientName,150,734);
                doc.font('Times-Roman').fontSize(12).text((typeof  result[9] == 'undefined')?"":result[9].clientName,150,809);

                doc.font('Times-Roman').fontSize(12).text((typeof  result[0] == 'undefined')?"":result[0].loanAmount+"/-"+word[0],230,164);
                doc.font('Times-Roman').fontSize(12).text((typeof  result[1] == 'undefined')?"":result[1].loanAmount+"/-"+word[1],230,244);
                doc.font('Times-Roman').fontSize(12).text((typeof  result[2] == 'undefined')?"":result[2].loanAmount+"/-"+word[2],230,319);
                doc.font('Times-Roman').fontSize(12).text((typeof  result[3] == 'undefined')?"":result[3].loanAmount+"/-"+word[3],230,394);
                doc.font('Times-Roman').fontSize(12).text((typeof  result[4] == 'undefined')?"":result[4].loanAmount+"/-"+word[4],230,464);
                doc.font('Times-Roman').fontSize(12).text((typeof  result[5] == 'undefined')?"":result[5].loanAmount+"/-"+word[5],230,539);
                doc.font('Times-Roman').fontSize(12).text((typeof  result[6] == 'undefined')?"":result[6].loanAmount+"/-"+word[6],230,614);
                doc.font('Times-Roman').fontSize(12).text((typeof  result[7] == 'undefined')?"":result[7].loanAmount+"/-"+word[7],230,689);
                doc.font('Times-Roman').fontSize(12).text((typeof  result[8] == 'undefined')?"":result[8].loanAmount+"/-"+word[8],230,764);
                doc.font('Times-Roman').fontSize(12).text((typeof  result[9] == 'undefined')?"":result[9].loanAmount+"/-"+word[9],230,839);
                if(result.length >10){
                    doc.addPage({
                        size: 'LEGAL'
                    });
                    doc.font('Times-Roman').fontSize(10).text('',300,20);
                    doc.font('Times-Roman').fontSize(10).text('',520,30);
                    doc.font('Times-Roman').fontSize(16).text('DEMAND PROMISSORY NOTE',180,40);
                    doc.font('Times-Roman').fontSize(10.5).text(disbAmount,70,59);
                    doc.font('Times-Roman').fontSize(10.5).text('Rs.______________________along with interest @ ______________________ there on.',50,60);
                    doc.font('Times-Roman').fontSize(10.5).text("Agreement No:______________________",50,75);
                    doc.font('Times-Roman').fontSize(10).text(result[10].officeName,80,94);
                    doc.font('Times-Roman').fontSize(10.5).text("Place:______________________",50,95);
                    doc.font('Times-Roman').fontSize(10.5).text("Date: ______________________",50,115);

                    doc.font('Times-Roman').fontSize(10.5).text("On Demand I/We  _______________________________________________________________________the",50,130);
                    doc.font('Times-Roman').fontSize(10.5).text("undersigned jointly/severally promise to pay MAS FINANCIAL SERVICES LIMITED - AHMEDABAD,",50,145);
                    doc.font('Times-Roman').fontSize(10.5).text("or order at Ahmedabad, sum of Rupees _______________________________________, along with interest",50,165);
                    doc.font('Times-Roman').fontSize(10.5).text("there on @ ______________________,for value loan received.",50,185);

                    doc.font('Times-Roman').fontSize(10).text('__________',540,130);
                    doc.font('Times-Roman').fontSize(10).text('|',539,139);
                    doc.font('Times-Roman').fontSize(10).text('|',539,148);
                    doc.font('Times-Roman').fontSize(10).text('1 Rupee',543,148);
                    doc.font('Times-Roman').fontSize(10).text('|',539,159);
                    doc.font('Times-Roman').fontSize(10).text('Revenue',544,155);
                    doc.font('Times-Roman').fontSize(10).text('|',539,165);
                    doc.font('Times-Roman').fontSize(10).text('Stamp',545,167);
                    doc.font('Times-Roman').fontSize(10).text('|',539,175);
                    doc.font('Times-Roman').fontSize(10).text('|',590,139);
                    doc.font('Times-Roman').fontSize(10).text('|',590,149);
                    doc.font('Times-Roman').fontSize(10).text('|',590,159);
                    doc.font('Times-Roman').fontSize(10).text('|',590,167);
                    doc.font('Times-Roman').fontSize(10).text('|',590,175);
                    doc.font('Times-Roman').fontSize(10).text('__________',540,175);


                    doc.font('Times-Roman').fontSize(10.5).text("On Demand I/We  _________________________________________________________________________the",50,215);
                    doc.font('Times-Roman').fontSize(10.5).text("undersigned jointly/severally promise to pay MAS FINANCIAL SERVICES LIMITED - AHMEDABAD, ",50,230);
                    doc.font('Times-Roman').fontSize(10.5).text("or order at Ahmedabad, sum of Rupees ____________________________________________, along with interest ",50,245);
                    doc.font('Times-Roman').fontSize(10.5).text("there on @ ______________________,for value loan received.  ",50,260);

                    doc.font('Times-Roman').fontSize(10).text('__________',540,215);
                    doc.font('Times-Roman').fontSize(10).text('|',539,223);
                    doc.font('Times-Roman').fontSize(10).text('|',539,229);
                    doc.font('Times-Roman').fontSize(10).text('1 Rupee',543,230);
                    doc.font('Times-Roman').fontSize(10).text('|',539,238);
                    doc.font('Times-Roman').fontSize(10).text('Revenue',544,240);
                    doc.font('Times-Roman').fontSize(10).text('|',539,247);
                    doc.font('Times-Roman').fontSize(10).text('Stamp',545,247);
                    doc.font('Times-Roman').fontSize(10).text('|',539,256);
                    doc.font('Times-Roman').fontSize(10).text('|',590,223);
                    doc.font('Times-Roman').fontSize(10).text('|',590,229);
                    doc.font('Times-Roman').fontSize(10).text('|',590,238);
                    doc.font('Times-Roman').fontSize(10).text('|',590,247);
                    doc.font('Times-Roman').fontSize(10).text('|',590,256);
                    doc.font('Times-Roman').fontSize(10).text('__________',540,256);

                    doc.font('Times-Roman').fontSize(10.5).text("On Demand I/We  _________________________________________________________________________the",50,290);
                    doc.font('Times-Roman').fontSize(10.5).text("undersigned jointly/severally promise to pay MAS FINANCIAL SERVICES LIMITED - AHMEDABAD,  ",50,305);
                    doc.font('Times-Roman').fontSize(10.5).text("or order at Ahmedabad, sum of Rupees ____________________________________________, along with interest  ",50,320);
                    doc.font('Times-Roman').fontSize(10.5).text("there on @ ______________________,for value loan received.",50,335);

                    doc.font('Times-Roman').fontSize(10).text('__________',540,290);
                    doc.font('Times-Roman').fontSize(10).text('|',539,299);
                    doc.font('Times-Roman').fontSize(10).text('|',539,308);
                    doc.font('Times-Roman').fontSize(10).text('1 Rupee',543,305);
                    doc.font('Times-Roman').fontSize(10).text('|',539,317);
                    doc.font('Times-Roman').fontSize(10).text('Revenue',544,311);
                    doc.font('Times-Roman').fontSize(10).text('|',539,326);
                    doc.font('Times-Roman').fontSize(10).text('Stamp',545,319);
                    doc.font('Times-Roman').fontSize(10).text('|',539,335);
                    doc.font('Times-Roman').fontSize(10).text('|',590,299);
                    doc.font('Times-Roman').fontSize(10).text('|',590,308);
                    doc.font('Times-Roman').fontSize(10).text('|',590,317);
                    doc.font('Times-Roman').fontSize(10).text('|',590,326);
                    doc.font('Times-Roman').fontSize(10).text('|',590,335);
                    doc.font('Times-Roman').fontSize(10).text('__________',540,335);

                    doc.font('Times-Roman').fontSize(10.5).text("On Demand I/We  _________________________________________________________________________the",50,365);
                    doc.font('Times-Roman').fontSize(10.5).text("undersigned jointly/severally promise to pay MAS FINANCIAL SERVICES LIMITED - AHMEDABAD, ",50,380);
                    doc.font('Times-Roman').fontSize(10.5).text("or order at Ahmedabad, sum of Rupees ____________________________________________, along with interest ",50,395);
                    doc.font('Times-Roman').fontSize(10.5).text("there on @ ______________________,for value loan received.",50,405);

                    doc.font('Times-Roman').fontSize(10).text('__________',540,365);
                    doc.font('Times-Roman').fontSize(10).text('|',539,374);
                    doc.font('Times-Roman').fontSize(10).text('|',539,383);
                    doc.font('Times-Roman').fontSize(10).text('1 Rupee',543,386);
                    doc.font('Times-Roman').fontSize(10).text('|',539,392);
                    doc.font('Times-Roman').fontSize(10).text('Revenue',544,392);
                    doc.font('Times-Roman').fontSize(10).text('|',539,401);
                    doc.font('Times-Roman').fontSize(10).text('Stamp',545,399);
                    doc.font('Times-Roman').fontSize(10).text('|',539,410);
                    doc.font('Times-Roman').fontSize(10).text('|',590,374);
                    doc.font('Times-Roman').fontSize(10).text('|',590,383);
                    doc.font('Times-Roman').fontSize(10).text('|',590,392);
                    doc.font('Times-Roman').fontSize(10).text('|',590,401);
                    doc.font('Times-Roman').fontSize(10).text('|',590,410);
                    doc.font('Times-Roman').fontSize(10).text('__________',540,410);

                    doc.font('Times-Roman').fontSize(10.5).text("On Demand I/We  _________________________________________________________________________the",50,435);
                    doc.font('Times-Roman').fontSize(10.5).text("undersigned jointly/severally promise to pay MAS FINANCIAL SERVICES LIMITED - AHMEDABAD,",50,450);
                    doc.font('Times-Roman').fontSize(10.5).text("or order at Ahmedabad, sum of Rupees ____________________________________________, along with interest",50,465);
                    doc.font('Times-Roman').fontSize(10.5).text("there on @ ______________________,for value loan received.",50,480);

                    doc.font('Times-Roman').fontSize(10).text('__________',540,435);
                    doc.font('Times-Roman').fontSize(10).text('|',539,444);
                    doc.font('Times-Roman').fontSize(10).text('|',539,453);
                    doc.font('Times-Roman').fontSize(10).text('1 Rupee',543,453);
                    doc.font('Times-Roman').fontSize(10).text('|',539,459);
                    doc.font('Times-Roman').fontSize(10).text('Revenue',544,459);
                    doc.font('Times-Roman').fontSize(10).text('|',539,467);
                    doc.font('Times-Roman').fontSize(10).text('Stamp',545,467);
                    doc.font('Times-Roman').fontSize(10).text('|',539,475);
                    doc.font('Times-Roman').fontSize(10).text('|',590,444);
                    doc.font('Times-Roman').fontSize(10).text('|',590,453);
                    doc.font('Times-Roman').fontSize(10).text('|',590,459);
                    doc.font('Times-Roman').fontSize(10).text('|',590,467);
                    doc.font('Times-Roman').fontSize(10).text('|',590,475);
                    doc.font('Times-Roman').fontSize(10).text('__________',540,475);

                    doc.font('Times-Roman').fontSize(10.5).text("On Demand I/We  _________________________________________________________________________the",50,510);
                    doc.font('Times-Roman').fontSize(10.5).text("undersigned jointly/severally promise to pay MAS FINANCIAL SERVICES LIMITED - AHMEDABAD, ",50,525);
                    doc.font('Times-Roman').fontSize(10.5).text("or order at Ahmedabad, sum of Rupees ____________________________________________, along with interest ",50,540);
                    doc.font('Times-Roman').fontSize(10.5).text("there on @ ______________________,for value loan received.",50,555);

                    doc.font('Times-Roman').fontSize(10).text('__________',540,510);
                    doc.font('Times-Roman').fontSize(10).text('|',539,519);
                    doc.font('Times-Roman').fontSize(10).text('|',539,528);
                    doc.font('Times-Roman').fontSize(10).text('1 Rupee',543,528);
                    doc.font('Times-Roman').fontSize(10).text('|',539,537);
                    doc.font('Times-Roman').fontSize(10).text('Revenue',544,534);
                    doc.font('Times-Roman').fontSize(10).text('|',539,546);
                    doc.font('Times-Roman').fontSize(10).text('Stamp',545,545);
                    doc.font('Times-Roman').fontSize(10).text('|',539,555);
                    doc.font('Times-Roman').fontSize(10).text('|',590,519);
                    doc.font('Times-Roman').fontSize(10).text('|',590,528);
                    doc.font('Times-Roman').fontSize(10).text('|',590,537);
                    doc.font('Times-Roman').fontSize(10).text('|',590,546);
                    doc.font('Times-Roman').fontSize(10).text('|',590,555);
                    doc.font('Times-Roman').fontSize(10).text('__________',540,555);

                    doc.font('Times-Roman').fontSize(10.5).text("On Demand I/We  _________________________________________________________________________the",50,585);
                    doc.font('Times-Roman').fontSize(10.5).text("undersigned jointly/severally promise to pay MAS FINANCIAL SERVICES LIMITED - AHMEDABAD, ",50,600);
                    doc.font('Times-Roman').fontSize(10.5).text(" or order at Ahmedabad, sum of Rupees ____________________________________________, along with interest",50,615);
                    doc.font('Times-Roman').fontSize(10.5).text("there on @ ______________________,for value loan received. ",50,630);

                    doc.font('Times-Roman').fontSize(10).text('__________',540,585);
                    doc.font('Times-Roman').fontSize(10).text('|',539,594);
                    doc.font('Times-Roman').fontSize(10).text('|',539,603);
                    doc.font('Times-Roman').fontSize(10).text('1 Rupee',543,599);
                    doc.font('Times-Roman').fontSize(10).text('|',539,612);
                    doc.font('Times-Roman').fontSize(10).text('Revenue',544,605);
                    doc.font('Times-Roman').fontSize(10).text('|',539,621);
                    doc.font('Times-Roman').fontSize(10).text('Stamp',545,611);
                    doc.font('Times-Roman').fontSize(10).text('|',539,630);
                    doc.font('Times-Roman').fontSize(10).text('|',590,594);
                    doc.font('Times-Roman').fontSize(10).text('|',590,603);
                    doc.font('Times-Roman').fontSize(10).text('|',590,612);
                    doc.font('Times-Roman').fontSize(10).text('|',590,621);
                    doc.font('Times-Roman').fontSize(10).text('|',590,630);
                    doc.font('Times-Roman').fontSize(10).text('__________',540,630);

                    doc.font('Times-Roman').fontSize(10.5).text("On Demand I/We  _________________________________________________________________________the",50,660);
                    doc.font('Times-Roman').fontSize(10.5).text("undersigned jointly/severally promise to pay MAS FINANCIAL SERVICES LIMITED - AHMEDABAD,",50,675);
                    doc.font('Times-Roman').fontSize(10.5).text("or order at Ahmedabad, sum of Rupees ____________________________________________, along with interest ",50,690);
                    doc.font('Times-Roman').fontSize(10.5).text("there on @ ______________________,for value loan received. ",50,705);

                    doc.font('Times-Roman').fontSize(10).text('__________',540,665);
                    doc.font('Times-Roman').fontSize(10).text('|',539,674);
                    doc.font('Times-Roman').fontSize(10).text('|',539,683);
                    doc.font('Times-Roman').fontSize(10).text('1 Rupee',543,686);
                    doc.font('Times-Roman').fontSize(10).text('|',539,692);
                    doc.font('Times-Roman').fontSize(10).text('Revenue',544,692);
                    doc.font('Times-Roman').fontSize(10).text('|',539,701);
                    doc.font('Times-Roman').fontSize(10).text('Stamp',545,699);
                    doc.font('Times-Roman').fontSize(10).text('|',539,710);
                    doc.font('Times-Roman').fontSize(10).text('|',590,674);
                    doc.font('Times-Roman').fontSize(10).text('|',590,683);
                    doc.font('Times-Roman').fontSize(10).text('|',590,692);
                    doc.font('Times-Roman').fontSize(10).text('|',590,701);
                    doc.font('Times-Roman').fontSize(10).text('|',590,710);
                    doc.font('Times-Roman').fontSize(10).text('__________',540,710);

                    doc.font('Times-Roman').fontSize(10.5).text("On Demand I/We  _________________________________________________________________________the",50,735);
                    doc.font('Times-Roman').fontSize(10.5).text("undersigned jointly/severally promise to pay MAS FINANCIAL SERVICES LIMITED - AHMEDABAD,",50,750);
                    doc.font('Times-Roman').fontSize(10.5).text("or order at Ahmedabad, sum of Rupees ____________________________________________, along with interest",50,765);
                    doc.font('Times-Roman').fontSize(10.5).text("there on @ ______________________,for value loan received. ",50,780);

                    doc.font('Times-Roman').fontSize(10).text('__________',540,735);
                    doc.font('Times-Roman').fontSize(10).text('|',539,744);
                    doc.font('Times-Roman').fontSize(10).text('|',539,753);
                    doc.font('Times-Roman').fontSize(10).text('1 Rupee',543,753);
                    doc.font('Times-Roman').fontSize(10).text('|',539,759);
                    doc.font('Times-Roman').fontSize(10).text('Revenue',544,759);
                    doc.font('Times-Roman').fontSize(10).text('|',539,767);
                    doc.font('Times-Roman').fontSize(10).text('Stamp',545,767);
                    doc.font('Times-Roman').fontSize(10).text('|',539,775);
                    doc.font('Times-Roman').fontSize(10).text('|',590,744);
                    doc.font('Times-Roman').fontSize(10).text('|',590,753);
                    doc.font('Times-Roman').fontSize(10).text('|',590,759);
                    doc.font('Times-Roman').fontSize(10).text('|',590,767);
                    doc.font('Times-Roman').fontSize(10).text('|',590,775);
                    doc.font('Times-Roman').fontSize(10).text('__________',540,775);

                    doc.font('Times-Roman').fontSize(10.5).text("On Demand I/We  _________________________________________________________________________the",50,810);
                    doc.font('Times-Roman').fontSize(10.5).text("undersigned jointly/severally promise to pay MAS FINANCIAL SERVICES LIMITED - AHMEDABAD,",50,825);
                    doc.font('Times-Roman').fontSize(10.5).text("or order at Ahmedabad, sum of Rupees ____________________________________________, along with interest",50,840);
                    doc.font('Times-Roman').fontSize(10.5).text("there on @ ______________________,for value loan received.",50,855);

                    doc.font('Times-Roman').fontSize(10).text('__________',540,810);
                    doc.font('Times-Roman').fontSize(10).text('|',539,819);
                    doc.font('Times-Roman').fontSize(10).text('|',539,828);
                    doc.font('Times-Roman').fontSize(10).text('1 Rupee',543,828);
                    doc.font('Times-Roman').fontSize(10).text('|',539,837);
                    doc.font('Times-Roman').fontSize(10).text('Revenue',544,834);
                    doc.font('Times-Roman').fontSize(10).text('|',539,846);
                    doc.font('Times-Roman').fontSize(10).text('Stamp',545,845);
                    doc.font('Times-Roman').fontSize(10).text('|',539,855);
                    doc.font('Times-Roman').fontSize(10).text('|',590,819);
                    doc.font('Times-Roman').fontSize(10).text('|',590,828);
                    doc.font('Times-Roman').fontSize(10).text('|',590,837);
                    doc.font('Times-Roman').fontSize(10).text('|',590,846);
                    doc.font('Times-Roman').fontSize(10).text('|',590,855);
                    doc.font('Times-Roman').fontSize(10).text('__________',540,855);

                    var clientName11 = (typeof result[10] == 'undefined')?"":result[10].clientName;
                    var clientName12 = (typeof result[11] == 'undefined')?"":result[11].clientName;
                    var clientName13 = (typeof result[12] == 'undefined')?"":result[12].clientName;
                    var clientName14 = (typeof result[13] == 'undefined')?"":result[13].clientName;
                    var clientName15 = (typeof result[14] == 'undefined')?"":result[14].clientName;
                    var clientName16 = (typeof result[15] == 'undefined')?"":result[15].clientName;
                    var clientName17 = (typeof result[16] == 'undefined')?"":result[16].clientName;
                    var clientName18 = (typeof result[17] == 'undefined')?"":result[17].clientName;
                    var clientName19 = (typeof result[18] == 'undefined')?"":result[18].clientName;
                    var clientName20 = (typeof result[19] == 'undefined')?"":result[19].clientName;
                    doc.font('Times-Roman').fontSize(12).text(clientName11,150,129);
                    doc.font('Times-Roman').fontSize(12).text(clientName12,150,214);
                    doc.font('Times-Roman').fontSize(12).text(clientName13,150,289);
                    doc.font('Times-Roman').fontSize(12).text(clientName14,150,364);
                    doc.font('Times-Roman').fontSize(12).text(clientName15,150,434);
                    doc.font('Times-Roman').fontSize(12).text(clientName16,150,509);
                    doc.font('Times-Roman').fontSize(12).text(clientName17,150,584);
                    doc.font('Times-Roman').fontSize(12).text(clientName18,150,659);
                    doc.font('Times-Roman').fontSize(12).text(clientName19,150,734);
                    doc.font('Times-Roman').fontSize(12).text(clientName20,150,809);
                    doc.font('Times-Roman').fontSize(12).text((typeof  result[10] == 'undefined')?"":result[10].loanAmount+"/-"+word[10],230,164);
                    doc.font('Times-Roman').fontSize(12).text((typeof  result[11] == 'undefined')?"":result[11].loanAmount+"/-"+word[11],230,244);
                    doc.font('Times-Roman').fontSize(12).text((typeof  result[12] == 'undefined')?"":result[12].loanAmount+"/-"+word[12],230,319);
                    doc.font('Times-Roman').fontSize(12).text((typeof  result[13] == 'undefined')?"":result[13].loanAmount+"/-"+word[13],230,394);
                    doc.font('Times-Roman').fontSize(12).text((typeof  result[14] == 'undefined')?"":result[14].loanAmount+"/-"+word[14],230,464);
                    doc.font('Times-Roman').fontSize(12).text((typeof  result[15] == 'undefined')?"":result[15].loanAmount+"/-"+word[15],230,539);
                    doc.font('Times-Roman').fontSize(12).text((typeof  result[16] == 'undefined')?"":result[16].loanAmount+"/-"+word[16],230,614);
                    doc.font('Times-Roman').fontSize(12).text((typeof  result[17] == 'undefined')?"":result[17].loanAmount+"/-"+word[17],230,689);
                    doc.font('Times-Roman').fontSize(12).text((typeof  result[18] == 'undefined')?"":result[18].loanAmount+"/-"+word[18],230,764);
                    doc.font('Times-Roman').fontSize(12).text((typeof  result[19] == 'undefined')?"":result[19].loanAmount+"/-"+word[19],230,839);
                }
                if(result.length >20){
                    doc.addPage({
                        size: 'LEGAL'
                    });
                    doc.font('Times-Roman').fontSize(10).text('',300,20);
                    doc.font('Times-Roman').fontSize(10).text('',520,30);
                    doc.font('Times-Roman').fontSize(16).text('DEMAND PROMISSORY NOTE',180,40);
                    doc.font('Times-Roman').fontSize(10.5).text(disbAmount,70,59);
                    doc.font('Times-Roman').fontSize(10.5).text('Rs.______________________along with interest @ ______________________ there on.',50,60);
                    doc.font('Times-Roman').fontSize(10.5).text("Agreement No:______________________",50,75);
                    doc.font('Times-Roman').fontSize(10).text(result[10].officeName,80,94);
                    doc.font('Times-Roman').fontSize(10.5).text("Place:______________________",50,95);
                    doc.font('Times-Roman').fontSize(10.5).text("Date: ______________________",50,115);

                    doc.font('Times-Roman').fontSize(10.5).text("On Demand I/We  _______________________________________________________________________the",50,130);
                    doc.font('Times-Roman').fontSize(10.5).text("undersigned jointly/severally promise to pay MAS FINANCIAL SERVICES LIMITED - AHMEDABAD,",50,145);
                    doc.font('Times-Roman').fontSize(10.5).text("or order at Ahmedabad, sum of Rupees _______________________________________, along with interest",50,165);
                    doc.font('Times-Roman').fontSize(10.5).text("there on @ ______________________,for value loan received.",50,185);

                    doc.font('Times-Roman').fontSize(10).text('__________',540,130);
                    doc.font('Times-Roman').fontSize(10).text('|',539,139);
                    doc.font('Times-Roman').fontSize(10).text('|',539,148);
                    doc.font('Times-Roman').fontSize(10).text('1 Rupee',543,148);
                    doc.font('Times-Roman').fontSize(10).text('|',539,159);
                    doc.font('Times-Roman').fontSize(10).text('Revenue',544,155);
                    doc.font('Times-Roman').fontSize(10).text('|',539,165);
                    doc.font('Times-Roman').fontSize(10).text('Stamp',545,167);
                    doc.font('Times-Roman').fontSize(10).text('|',539,175);
                    doc.font('Times-Roman').fontSize(10).text('|',590,139);
                    doc.font('Times-Roman').fontSize(10).text('|',590,149);
                    doc.font('Times-Roman').fontSize(10).text('|',590,159);
                    doc.font('Times-Roman').fontSize(10).text('|',590,167);
                    doc.font('Times-Roman').fontSize(10).text('|',590,175);
                    doc.font('Times-Roman').fontSize(10).text('__________',540,175);

                    doc.font('Times-Roman').fontSize(10.5).text("On Demand I/We  _________________________________________________________________________the",50,215);
                    doc.font('Times-Roman').fontSize(10.5).text("undersigned jointly/severally promise to pay MAS FINANCIAL SERVICES LIMITED - AHMEDABAD, ",50,230);
                    doc.font('Times-Roman').fontSize(10.5).text("or order at Ahmedabad, sum of Rupees ____________________________________________, along with interest ",50,245);
                    doc.font('Times-Roman').fontSize(10.5).text("there on @ ______________________,for value loan received.  ",50,260);

                    doc.font('Times-Roman').fontSize(10).text('__________',540,215);
                    doc.font('Times-Roman').fontSize(10).text('|',539,223);
                    doc.font('Times-Roman').fontSize(10).text('|',539,229);
                    doc.font('Times-Roman').fontSize(10).text('1 Rupee',543,230);
                    doc.font('Times-Roman').fontSize(10).text('|',539,238);
                    doc.font('Times-Roman').fontSize(10).text('Revenue',544,240);
                    doc.font('Times-Roman').fontSize(10).text('|',539,247);
                    doc.font('Times-Roman').fontSize(10).text('Stamp',545,247);
                    doc.font('Times-Roman').fontSize(10).text('|',539,256);
                    doc.font('Times-Roman').fontSize(10).text('|',590,223);
                    doc.font('Times-Roman').fontSize(10).text('|',590,229);
                    doc.font('Times-Roman').fontSize(10).text('|',590,238);
                    doc.font('Times-Roman').fontSize(10).text('|',590,247);
                    doc.font('Times-Roman').fontSize(10).text('|',590,256);
                    doc.font('Times-Roman').fontSize(10).text('__________',540,256);

                    doc.font('Times-Roman').fontSize(10.5).text("On Demand I/We  _________________________________________________________________________the",50,290);
                    doc.font('Times-Roman').fontSize(10.5).text("undersigned jointly/severally promise to pay MAS FINANCIAL SERVICES LIMITED - AHMEDABAD,  ",50,305);
                    doc.font('Times-Roman').fontSize(10.5).text("or order at Ahmedabad, sum of Rupees ____________________________________________, along with interest  ",50,320);
                    doc.font('Times-Roman').fontSize(10.5).text("there on @ ______________________,for value loan received.",50,335);

                    doc.font('Times-Roman').fontSize(10).text('__________',540,290);
                    doc.font('Times-Roman').fontSize(10).text('|',539,299);
                    doc.font('Times-Roman').fontSize(10).text('|',539,308);
                    doc.font('Times-Roman').fontSize(10).text('1 Rupee',543,305);
                    doc.font('Times-Roman').fontSize(10).text('|',539,317);
                    doc.font('Times-Roman').fontSize(10).text('Revenue',544,311);
                    doc.font('Times-Roman').fontSize(10).text('|',539,326);
                    doc.font('Times-Roman').fontSize(10).text('Stamp',545,319);
                    doc.font('Times-Roman').fontSize(10).text('|',539,335);
                    doc.font('Times-Roman').fontSize(10).text('|',590,299);
                    doc.font('Times-Roman').fontSize(10).text('|',590,308);
                    doc.font('Times-Roman').fontSize(10).text('|',590,317);
                    doc.font('Times-Roman').fontSize(10).text('|',590,326);
                    doc.font('Times-Roman').fontSize(10).text('|',590,335);
                    doc.font('Times-Roman').fontSize(10).text('__________',540,335);

                    doc.font('Times-Roman').fontSize(10.5).text("On Demand I/We  _________________________________________________________________________the",50,365);
                    doc.font('Times-Roman').fontSize(10.5).text("undersigned jointly/severally promise to pay MAS FINANCIAL SERVICES LIMITED - AHMEDABAD, ",50,380);
                    doc.font('Times-Roman').fontSize(10.5).text("or order at Ahmedabad, sum of Rupees ____________________________________________, along with interest ",50,395);
                    doc.font('Times-Roman').fontSize(10.5).text("there on @ ______________________,for value loan received.",50,405);

                    doc.font('Times-Roman').fontSize(10).text('__________',540,365);
                    doc.font('Times-Roman').fontSize(10).text('|',539,374);
                    doc.font('Times-Roman').fontSize(10).text('|',539,383);
                    doc.font('Times-Roman').fontSize(10).text('1 Rupee',543,386);
                    doc.font('Times-Roman').fontSize(10).text('|',539,392);
                    doc.font('Times-Roman').fontSize(10).text('Revenue',544,392);
                    doc.font('Times-Roman').fontSize(10).text('|',539,401);
                    doc.font('Times-Roman').fontSize(10).text('Stamp',545,399);
                    doc.font('Times-Roman').fontSize(10).text('|',539,410);
                    doc.font('Times-Roman').fontSize(10).text('|',590,374);
                    doc.font('Times-Roman').fontSize(10).text('|',590,383);
                    doc.font('Times-Roman').fontSize(10).text('|',590,392);
                    doc.font('Times-Roman').fontSize(10).text('|',590,401);
                    doc.font('Times-Roman').fontSize(10).text('|',590,410);
                    doc.font('Times-Roman').fontSize(10).text('__________',540,410);


                    doc.font('Times-Roman').fontSize(10.5).text("On Demand I/We  _________________________________________________________________________the",50,435);
                    doc.font('Times-Roman').fontSize(10.5).text("undersigned jointly/severally promise to pay MAS FINANCIAL SERVICES LIMITED - AHMEDABAD,",50,450);
                    doc.font('Times-Roman').fontSize(10.5).text("or order at Ahmedabad, sum of Rupees ____________________________________________, along with interest",50,465);
                    doc.font('Times-Roman').fontSize(10.5).text("there on @ ______________________,for value loan received.",50,480);

                    doc.font('Times-Roman').fontSize(10).text('__________',540,435);
                    doc.font('Times-Roman').fontSize(10).text('|',539,444);
                    doc.font('Times-Roman').fontSize(10).text('|',539,453);
                    doc.font('Times-Roman').fontSize(10).text('1 Rupee',543,453);
                    doc.font('Times-Roman').fontSize(10).text('|',539,459);
                    doc.font('Times-Roman').fontSize(10).text('Revenue',544,459);
                    doc.font('Times-Roman').fontSize(10).text('|',539,467);
                    doc.font('Times-Roman').fontSize(10).text('Stamp',545,467);
                    doc.font('Times-Roman').fontSize(10).text('|',539,475);
                    doc.font('Times-Roman').fontSize(10).text('|',590,444);
                    doc.font('Times-Roman').fontSize(10).text('|',590,453);
                    doc.font('Times-Roman').fontSize(10).text('|',590,459);
                    doc.font('Times-Roman').fontSize(10).text('|',590,467);
                    doc.font('Times-Roman').fontSize(10).text('|',590,475);
                    doc.font('Times-Roman').fontSize(10).text('__________',540,475);

                    doc.font('Times-Roman').fontSize(10.5).text("On Demand I/We  _________________________________________________________________________the",50,510);
                    doc.font('Times-Roman').fontSize(10.5).text("undersigned jointly/severally promise to pay MAS FINANCIAL SERVICES LIMITED - AHMEDABAD, ",50,525);
                    doc.font('Times-Roman').fontSize(10.5).text("or order at Ahmedabad, sum of Rupees ____________________________________________, along with interest ",50,540);
                    doc.font('Times-Roman').fontSize(10.5).text("there on @ ______________________,for value loan received.",50,555);

                    doc.font('Times-Roman').fontSize(10).text('__________',540,510);
                    doc.font('Times-Roman').fontSize(10).text('|',539,519);
                    doc.font('Times-Roman').fontSize(10).text('|',539,528);
                    doc.font('Times-Roman').fontSize(10).text('1 Rupee',543,528);
                    doc.font('Times-Roman').fontSize(10).text('|',539,537);
                    doc.font('Times-Roman').fontSize(10).text('Revenue',544,534);
                    doc.font('Times-Roman').fontSize(10).text('|',539,546);
                    doc.font('Times-Roman').fontSize(10).text('Stamp',545,545);
                    doc.font('Times-Roman').fontSize(10).text('|',539,555);
                    doc.font('Times-Roman').fontSize(10).text('|',590,519);
                    doc.font('Times-Roman').fontSize(10).text('|',590,528);
                    doc.font('Times-Roman').fontSize(10).text('|',590,537);
                    doc.font('Times-Roman').fontSize(10).text('|',590,546);
                    doc.font('Times-Roman').fontSize(10).text('|',590,555);
                    doc.font('Times-Roman').fontSize(10).text('__________',540,555);

                    doc.font('Times-Roman').fontSize(10.5).text("On Demand I/We  _________________________________________________________________________the",50,585);
                    doc.font('Times-Roman').fontSize(10.5).text("undersigned jointly/severally promise to pay MAS FINANCIAL SERVICES LIMITED - AHMEDABAD, ",50,600);
                    doc.font('Times-Roman').fontSize(10.5).text(" or order at Ahmedabad, sum of Rupees ____________________________________________, along with interest",50,615);
                    doc.font('Times-Roman').fontSize(10.5).text("there on @ ______________________,for value loan received. ",50,630);

                    doc.font('Times-Roman').fontSize(10).text('__________',540,585);
                    doc.font('Times-Roman').fontSize(10).text('|',539,594);
                    doc.font('Times-Roman').fontSize(10).text('|',539,603);
                    doc.font('Times-Roman').fontSize(10).text('1 Rupee',543,599);
                    doc.font('Times-Roman').fontSize(10).text('|',539,612);
                    doc.font('Times-Roman').fontSize(10).text('Revenue',544,605);
                    doc.font('Times-Roman').fontSize(10).text('|',539,621);
                    doc.font('Times-Roman').fontSize(10).text('Stamp',545,611);
                    doc.font('Times-Roman').fontSize(10).text('|',539,630);
                    doc.font('Times-Roman').fontSize(10).text('|',590,594);
                    doc.font('Times-Roman').fontSize(10).text('|',590,603);
                    doc.font('Times-Roman').fontSize(10).text('|',590,612);
                    doc.font('Times-Roman').fontSize(10).text('|',590,621);
                    doc.font('Times-Roman').fontSize(10).text('|',590,630);
                    doc.font('Times-Roman').fontSize(10).text('__________',540,630);

                    doc.font('Times-Roman').fontSize(10.5).text("On Demand I/We  _________________________________________________________________________the",50,660);
                    doc.font('Times-Roman').fontSize(10.5).text("undersigned jointly/severally promise to pay MAS FINANCIAL SERVICES LIMITED - AHMEDABAD,",50,675);
                    doc.font('Times-Roman').fontSize(10.5).text("or order at Ahmedabad, sum of Rupees ____________________________________________, along with interest ",50,690);
                    doc.font('Times-Roman').fontSize(10.5).text("there on @ ______________________,for value loan received. ",50,705);

                    doc.font('Times-Roman').fontSize(10).text('__________',540,665);
                    doc.font('Times-Roman').fontSize(10).text('|',539,674);
                    doc.font('Times-Roman').fontSize(10).text('|',539,683);
                    doc.font('Times-Roman').fontSize(10).text('1 Rupee',543,686);
                    doc.font('Times-Roman').fontSize(10).text('|',539,692);
                    doc.font('Times-Roman').fontSize(10).text('Revenue',544,692);
                    doc.font('Times-Roman').fontSize(10).text('|',539,701);
                    doc.font('Times-Roman').fontSize(10).text('Stamp',545,699);
                    doc.font('Times-Roman').fontSize(10).text('|',539,710);
                    doc.font('Times-Roman').fontSize(10).text('|',590,674);
                    doc.font('Times-Roman').fontSize(10).text('|',590,683);
                    doc.font('Times-Roman').fontSize(10).text('|',590,692);
                    doc.font('Times-Roman').fontSize(10).text('|',590,701);
                    doc.font('Times-Roman').fontSize(10).text('|',590,710);
                    doc.font('Times-Roman').fontSize(10).text('__________',540,710);

                    doc.font('Times-Roman').fontSize(10.5).text("On Demand I/We  _________________________________________________________________________the",50,735);
                    doc.font('Times-Roman').fontSize(10.5).text("undersigned jointly/severally promise to pay MAS FINANCIAL SERVICES LIMITED - AHMEDABAD,",50,750);
                    doc.font('Times-Roman').fontSize(10.5).text("or order at Ahmedabad, sum of Rupees ____________________________________________, along with interest",50,765);
                    doc.font('Times-Roman').fontSize(10.5).text("there on @ ______________________,for value loan received. ",50,780);

                    doc.font('Times-Roman').fontSize(10).text('__________',540,735);
                    doc.font('Times-Roman').fontSize(10).text('|',539,744);
                    doc.font('Times-Roman').fontSize(10).text('|',539,753);
                    doc.font('Times-Roman').fontSize(10).text('1 Rupee',543,753);
                    doc.font('Times-Roman').fontSize(10).text('|',539,759);
                    doc.font('Times-Roman').fontSize(10).text('Revenue',544,759);
                    doc.font('Times-Roman').fontSize(10).text('|',539,767);
                    doc.font('Times-Roman').fontSize(10).text('Stamp',545,767);
                    doc.font('Times-Roman').fontSize(10).text('|',539,775);
                    doc.font('Times-Roman').fontSize(10).text('|',590,744);
                    doc.font('Times-Roman').fontSize(10).text('|',590,753);
                    doc.font('Times-Roman').fontSize(10).text('|',590,759);
                    doc.font('Times-Roman').fontSize(10).text('|',590,767);
                    doc.font('Times-Roman').fontSize(10).text('|',590,775);
                    doc.font('Times-Roman').fontSize(10).text('__________',540,775);


                    doc.font('Times-Roman').fontSize(10.5).text("On Demand I/We  _________________________________________________________________________the",50,810);
                    doc.font('Times-Roman').fontSize(10.5).text("undersigned jointly/severally promise to pay MAS FINANCIAL SERVICES LIMITED - AHMEDABAD,",50,825);
                    doc.font('Times-Roman').fontSize(10.5).text("or order at Ahmedabad, sum of Rupees ____________________________________________, along with interest",50,840);
                    doc.font('Times-Roman').fontSize(10.5).text("there on @ ______________________,for value loan received.",50,855);

                    doc.font('Times-Roman').fontSize(10).text('__________',540,810);
                    doc.font('Times-Roman').fontSize(10).text('|',539,819);
                    doc.font('Times-Roman').fontSize(10).text('|',539,828);
                    doc.font('Times-Roman').fontSize(10).text('1 Rupee',543,828);
                    doc.font('Times-Roman').fontSize(10).text('|',539,837);
                    doc.font('Times-Roman').fontSize(10).text('Revenue',544,834);
                    doc.font('Times-Roman').fontSize(10).text('|',539,846);
                    doc.font('Times-Roman').fontSize(10).text('Stamp',545,845);
                    doc.font('Times-Roman').fontSize(10).text('|',539,855);
                    doc.font('Times-Roman').fontSize(10).text('|',590,819);
                    doc.font('Times-Roman').fontSize(10).text('|',590,828);
                    doc.font('Times-Roman').fontSize(10).text('|',590,837);
                    doc.font('Times-Roman').fontSize(10).text('|',590,846);
                    doc.font('Times-Roman').fontSize(10).text('|',590,855);
                    doc.font('Times-Roman').fontSize(10).text('__________',540,855);

                    var clientName11 = (typeof result[20] == 'undefined')?"":result[20].clientName;
                    var clientName12 = (typeof result[21] == 'undefined')?"":result[21].clientName;
                    var clientName13 = (typeof result[22] == 'undefined')?"":result[22].clientName;
                    var clientName14 = (typeof result[23] == 'undefined')?"":result[23].clientName;
                    var clientName15 = (typeof result[24] == 'undefined')?"":result[24].clientName;
                    var clientName16 = (typeof result[25] == 'undefined')?"":result[25].clientName;
                    var clientName17 = (typeof result[26] == 'undefined')?"":result[26].clientName;
                    var clientName18 = (typeof result[27] == 'undefined')?"":result[27].clientName;
                    var clientName19 = (typeof result[28] == 'undefined')?"":result[28].clientName;
                    var clientName20 = (typeof result[29] == 'undefined')?"":result[29].clientName;
                    doc.font('Times-Roman').fontSize(12).text(clientName11,150,129);
                    doc.font('Times-Roman').fontSize(12).text(clientName12,150,214);
                    doc.font('Times-Roman').fontSize(12).text(clientName13,150,289);
                    doc.font('Times-Roman').fontSize(12).text(clientName14,150,364);
                    doc.font('Times-Roman').fontSize(12).text(clientName15,150,434);
                    doc.font('Times-Roman').fontSize(12).text(clientName16,150,509);
                    doc.font('Times-Roman').fontSize(12).text(clientName17,150,584);
                    doc.font('Times-Roman').fontSize(12).text(clientName18,150,659);
                    doc.font('Times-Roman').fontSize(12).text(clientName19,150,734);
                    doc.font('Times-Roman').fontSize(12).text(clientName20,150,809);
                    doc.font('Times-Roman').fontSize(12).text((typeof  result[20] == 'undefined')?"":result[20].loanAmount+"/-"+word[20],230,164);
                    doc.font('Times-Roman').fontSize(12).text((typeof  result[21] == 'undefined')?"":result[21].loanAmount+"/-"+word[21],230,244);
                    doc.font('Times-Roman').fontSize(12).text((typeof  result[22] == 'undefined')?"":result[22].loanAmount+"/-"+word[22],230,319);
                    doc.font('Times-Roman').fontSize(12).text((typeof  result[23] == 'undefined')?"":result[23].loanAmount+"/-"+word[23],230,394);
                    doc.font('Times-Roman').fontSize(12).text((typeof  result[24] == 'undefined')?"":result[24].loanAmount+"/-"+word[24],230,464);
                    doc.font('Times-Roman').fontSize(12).text((typeof  result[25] == 'undefined')?"":result[25].loanAmount+"/-"+word[25],230,539);
                    doc.font('Times-Roman').fontSize(12).text((typeof  result[26] == 'undefined')?"":result[26].loanAmount+"/-"+word[26],230,614);
                    doc.font('Times-Roman').fontSize(12).text((typeof  result[27] == 'undefined')?"":result[27].loanAmount+"/-"+word[27],230,689);
                    doc.font('Times-Roman').fontSize(12).text((typeof  result[28] == 'undefined')?"":result[28].loanAmount+"/-"+word[28],230,764);
                    doc.font('Times-Roman').fontSize(12).text((typeof  result[29] == 'undefined')?"":result[29].loanAmount+"/-"+word[29],230,839);
                }
                doc.addPage();
                doc.font('Times-Roman').fontSize(10).text('',300,20);
                doc.font('Times-Roman').fontSize(10.5).text("To,",55,35);
                doc.font('Times-Roman').fontSize(10.5).text("The Manager,",55,50);
                doc.font('Times-Roman').fontSize(10.5).text("MAS Financial Services Limited",55,65);
                doc.font('Times-Roman').fontSize(10.5).text("Ahmedabad ",55,80);
                doc.font('Times-Roman').fontSize(10.5).text("Dear Sir,",55,95);
                doc.font('Times-Roman').fontSize(10.5).text("Sub: Receipt of the loan amount and photocopy of the agreement",55,110);
                doc.font('Times-Roman').fontSize(10.5).text("We under Signed hereby acknowledge the receipt of the loan amount as under and also the photo copy of loan agreement",55,125);
                doc.font('Times-Roman').fontSize(10.5).text("Dated______________________________towards the loan taken by us from the company. ",55,140);
                doc.font('Times-Roman').fontSize(10.5).text("__________________________________________________________________________________________________________",35,150);
                doc.font('Times-Roman').fontSize(10.5).text("  S.No.      Agreement No                              Name                                   Loan Amount in Rs             Purpose               Sign",35,167);
                clientInc = 190;
                for(var i =0; i < result.length; i++){
                    if(typeof result[i] != "undefined"){
                        doc.font('Times-Roman').fontSize(11).text("",75,clientInc);
                        doc.font('Times-Roman').fontSize(11).text(result[i].clientName,212,clientInc);
                        doc.font('Times-Roman').fontSize(11).text(result[i].loanAmount,340,clientInc);
                        //doc.font('Times-Roman').fontSize(9).text(result.clientDetails[i].clientAddress,420,clientInc);
                        doc.font('Times-Roman').fontSize(9.5).text(result[i].loan_purpose+"-"+result[i].sub_category,430,clientInc);

                        clientInc = clientInc + 30;
                    }
                    customlog.info("Length=="+result[i].clientName);
                }
                var sno = 1;
                var j = 0;
                var tempHeight = 200;
                var rowLineHeight = 190;
                for(var i=0 ; i<500; i=i+25){
                    doc.font('Times-Roman').fontSize(13).text(""+sno,50,j+rowLineHeight);
                    doc.font('Times-Roman').fontSize(13).text("______________________________________________________________________________________",35,j+(tempHeight-35));
                    j = j + 30;
                    var jVal = 990;
                    if(tempHeight == 100){
                        jVal = 900;
                    }
                    if(j>jVal){
                        j=0;
                        tempHeight = 100;
                    }
                    sno ++;
                }
                for(var i=0; i<611; i=i+11.5){
                    doc.font('Times-Roman').fontSize(13).text("|",33.8,i+159);
                    doc.font('Times-Roman').fontSize(13).text("|",70,i+159);
                    doc.font('Times-Roman').fontSize(13).text("|",210,i+159);
                    doc.font('Times-Roman').fontSize(13).text("|",335,i+159);
                    doc.font('Times-Roman').fontSize(13).text("|",425,i+159);
                    doc.font('Times-Roman').fontSize(13).text("|",525,i+159);
                    doc.font('Times-Roman').fontSize(13).text("|",592,i+159);
                }
                doc.font('Times-Roman').fontSize(13).text("______________________________________________________________________________________",35,766);
                doc.addPage();
                doc.font('Times-Roman').fontSize(10).text('Date:',55,20);
                doc.font('Times-Roman').fontSize(10.5).text("To,",55,35);
                doc.font('Times-Roman').fontSize(10.5).text("The Manager,",55,50);
                doc.font('Times-Roman').fontSize(10.5).text("MAS Financial Services Limited",55,65);
                doc.font('Times-Roman').fontSize(10.5).text("Ahmedabad ",55,80);
                doc.font('Times-Roman').fontSize(10.5).text("Dear Sir,",55,95);
                doc.font('Times-Roman').fontSize(10.5).text("Sub: disbursement request letter",55,110);
                doc.font('Times-Roman').fontSize(10.5).text("I/We under Signed have applied for the loan with your company for following purpose,thank you very much for sanctioning the same.",35,125);
                doc.font('Times-Roman').fontSize(10.5).text("Please disburse the same in favor of MSM MicroFinance Ltd. after deducting initial payment amount.",35,140);
                doc.font('Times-Roman').fontSize(10.5).text("                                                         _________________________",36,141);
                doc.font('Times-Roman').fontSize(10.5).text("__________________________________________________________________________________________________________",35,150);
                doc.font('Times-Roman').fontSize(10.5).text("  S.No.      Agreement No                              Name                                   Loan Amount in Rs             Purpose               Sign",35,167);
                clientInc = 190;
                for(var i =0; i < result.length; i++){
                    if(typeof result[i] != "undefined"){
                        doc.font('Times-Roman').fontSize(11).text("",75,clientInc);
                        doc.font('Times-Roman').fontSize(11).text(result[i].clientName,212,clientInc);
                        doc.font('Times-Roman').fontSize(11).text(result[i].loanAmount,340,clientInc);
                        //doc.font('Times-Roman').fontSize(9).text(result.clientDetails[i].clientAddress,420,clientInc);
                        doc.font('Times-Roman').fontSize(9.5).text(result[i].loan_purpose+"-"+result[i].sub_category,430,clientInc);
                        clientInc = clientInc + 30;
                    }
                    customlog.info("Length=="+result[i].clientName);
                }
                var sno = 1;
                var j = 0;
                var tempHeight = 200;
                var rowLineHeight = 190;
                for(var i=0 ; i<500; i=i+25){
                    doc.font('Times-Roman').fontSize(13).text(""+sno,50,j+rowLineHeight);
                    doc.font('Times-Roman').fontSize(13).text("______________________________________________________________________________________",35,j+(tempHeight-35));
                    j = j + 30;
                    var jVal = 990;
                    if(tempHeight == 100){
                        jVal = 900;
                    }
                    if(j>jVal){
                        j=0;
                        tempHeight = 100;
                    }
                    sno ++;
                }
                for(var i=0; i<611; i=i+11.5){
                    doc.font('Times-Roman').fontSize(13).text("|",33.8,i+159);
                    doc.font('Times-Roman').fontSize(13).text("|",70,i+159);
                    doc.font('Times-Roman').fontSize(13).text("|",210,i+159);
                    doc.font('Times-Roman').fontSize(13).text("|",335,i+159);
                    doc.font('Times-Roman').fontSize(13).text("|",425,i+159);
                    doc.font('Times-Roman').fontSize(13).text("|",525,i+159);
                    doc.font('Times-Roman').fontSize(13).text("|",592,i+159);
                }
                doc.font('Times-Roman').fontSize(13).text("______________________________________________________________________________________",35,766);

                doc.addPage( {layout:'landscape'});
                doc.font('Times-Roman').fontSize(10.5).text("Schedule -1 to Loan agreement",55,25);
                doc.font('Times-Roman').fontSize(10.5).text("____________________________________________________________________________________________________________________________________________",35,30);
                doc.font('Times-Roman').fontSize(10.5).text("  Sr.No.  Agreement No    Name of the borrower   Loan Amount        Purpose          Interest       service         service         other        Installment    tenure         Fi date           Sign",35,57);
                doc.font('Times-Roman').fontSize(10.5).text("                                                                                                                                        rate             charges         tax            charges       amount  ",35,65);
                doc.font('Times-Roman').fontSize(10.5).text("____________________________________________________________________________________________________________________________________________",35,66);
                var serviceAmount;
                var q = new Date(disbDate);
                var m = q.getMonth();
                var d = q.getDate();
                var y = q.getFullYear();

                var date = new Date(y,m,d);

                var mydate=new Date('2015-06-01');
                if(date>mydate)
                {
                    serviceAmount=14.00;
                }
                else if (date<mydate)
                {
                    serviceAmount=12.36;
                }
                else
                {
                    serviceAmount=14.00;
                }
                clientInc = 80;
                for(var i =0; i < result.length; i++){
                    if(typeof result[i] != "undefined"){
                        doc.font('Times-Roman').fontSize(11).text("",75,clientInc);
                        doc.font('Times-Roman').fontSize(11).text(result[i].clientName,142,clientInc);
                        doc.font('Times-Roman').fontSize(11).text(result[i].loanAmount,247,clientInc);
                        //doc.font('Times-Roman').fontSize(9).text(result.clientDetails[i].clientAddress,420,clientInc);
                        doc.font('Times-Roman').fontSize(8.5).text(result[i].loan_purpose+"-"+result[i].sub_category,302,clientInc);
                        doc.font('Times-Roman').fontSize(11).text(result[i].interestRate,390,clientInc);
                        doc.font('Times-Roman').fontSize(11).text((parseInt(result[i].loanAmount)*1/100).toFixed(),422,clientInc);
                        doc.font('Times-Roman').fontSize(11).text((parseInt((parseInt(result[i].loanAmount)*1/100).toFixed())*serviceAmount/100).toFixed(),472,clientInc);
                        var num = ((parseFloat(result[i].premiumAmount)*parseInt(result[i].loanAmount/1000))).toFixed();
                        var service = (parseInt(num)*serviceAmount/100).toFixed();
                        var sum = (parseInt(num)+parseInt(service)).toFixed();
                        doc.font('Times-Roman').fontSize(11).text(sum,522,clientInc);
                        doc.font('Times-Roman').fontSize(11).text(result[i].installmentAmount,572,clientInc);
                        doc.font('Times-Roman').fontSize(11).text(result[i].tenure,622,clientInc);
                        doc.font('Times-Roman').fontSize(11).text(result[i].fiDate,668,clientInc);
                        clientInc = clientInc + 20;
                    }
                }
                var sno = 1;
                var j = 0;
                var tempHeight = 105;
                var rowLineHeight = 80;
                for(var i=0 ; i<500; i=i+25){
                    doc.font('Times-Roman').fontSize(13).text("_________________________________________________________________________________________________________________",35,j+(tempHeight-25));
                    doc.font('Times-Roman').fontSize(13).text(""+sno,50,j+rowLineHeight);
                    j = j + 20;
                    var jVal = 990;
                    if(tempHeight == 100){
                        jVal = 900;
                    }
                    if(j>jVal){
                        j=0;
                        tempHeight = 100;

                    }
                    sno ++;
                }
                for(var i=0; i<426; i=i+11.5){
                    doc.font('Times-Roman').fontSize(13).text("|",33.8,i+39);
                    doc.font('Times-Roman').fontSize(13).text("|",65,i+39);
                    doc.font('Times-Roman').fontSize(13).text("|",140,i+39);
                    doc.font('Times-Roman').fontSize(13).text("|",240,i+39);
                    doc.font('Times-Roman').fontSize(13).text("|",300,i+39);
                    doc.font('Times-Roman').fontSize(13).text("|",375,i+39);
                    doc.font('Times-Roman').fontSize(13).text("|",420,i+39);
                    doc.font('Times-Roman').fontSize(13).text("|",470,i+39);
                    doc.font('Times-Roman').fontSize(13).text("|",520,i+39);
                    doc.font('Times-Roman').fontSize(13).text("|",570,i+39);
                    doc.font('Times-Roman').fontSize(13).text("|",620,i+39);
                    doc.font('Times-Roman').fontSize(13).text("|",660,i+39);
                    doc.font('Times-Roman').fontSize(13).text("|",720,i+39);
                    doc.font('Times-Roman').fontSize(13).text("|",770,i+39);
                }
                //doc.font('Times-Roman').fontSize(13).text("_________________________________________________________________________________________________________________",35,381);
                var masSignature =" For Mas Financial Services Ltd.";
                var Signature =" For Business Associate.";
                var lines =" _______________________________ ";
                var authorisedSignature =" Authorised Signatory ";
                doc.font('Times-Roman').fontSize(10.5).text(masSignature,35,550);
                doc.font('Times-Roman').fontSize(10.5).text(lines,35,565);
                doc.font('Times-Roman').fontSize(10.5).text(authorisedSignature,35,585);
                doc.font('Times-Roman').fontSize(10.5).text(Signature,450,550);
                doc.font('Times-Roman').fontSize(10.5).text(lines,450,565);
                doc.font('Times-Roman').fontSize(10.5).text(authorisedSignature,450,585);
                /*if(result.length >10){
                    doc.addPage( {layout:'landscape'});
                    doc.font('Times-Roman').fontSize(10.5).text("Schedule -1 to Loan agreement",55,35);
                    doc.font('Times-Roman').fontSize(10.5).text("____________________________________________________________________________________________________________________________________________",35,50);
                    doc.font('Times-Roman').fontSize(10.5).text("  Sr.No.  Agreement No    Name of the borrower   Loan Amount        Purpose      Interest      service         service         other        Installment    tenure         Fi date          Sign",35,67);
                    doc.font('Times-Roman').fontSize(10.5).text("                                                                                                                                    rate             charges         tax            charges       amount  ",35,75);
                    clientInc = 100;
                    for(var i =10; i < result.length; i++){
                        if(typeof result[i] != "undefined" && i<20){
                            doc.font('Times-Roman').fontSize(11).text("",75,clientInc);
                            doc.font('Times-Roman').fontSize(11).text(result[i].clientName,142,clientInc);
                            doc.font('Times-Roman').fontSize(11).text(result[i].loanAmount,247,clientInc);
                            //doc.font('Times-Roman').fontSize(9).text(result.clientDetails[i].clientAddress,420,clientInc);
                            doc.font('Times-Roman').fontSize(11).text(result[i].loan_purpose,302,clientInc);
                            doc.font('Times-Roman').fontSize(11).text(result[i].interestRate,372,clientInc);
                            doc.font('Times-Roman').fontSize(11).text((parseInt(result[i].loanAmount)*1/100).toFixed(),422,clientInc);
                            doc.font('Times-Roman').fontSize(11).text((parseInt((parseInt(result[i].loanAmount)*1/100).toFixed())*serviceAmount/100).toFixed(),472,clientInc);
                            var num = ((parseFloat(result[i].premiumAmount)*parseInt(result[i].loanAmount/1000))).toFixed();
                            var service = (parseInt(num)*serviceAmount/100).toFixed();
                            var sum = (parseInt(num)+parseInt(service)).toFixed();
                            doc.font('Times-Roman').fontSize(11).text(sum,522,clientInc);
                            doc.font('Times-Roman').fontSize(11).text(result[i].installmentAmount,572,clientInc);
                            doc.font('Times-Roman').fontSize(11).text(result[i].tenure,622,clientInc);
                            doc.font('Times-Roman').fontSize(11).text(result[i].fiDate,668,clientInc);
                            clientInc = clientInc + 30;
                        }
                    }
                    var sno = 11;
                    var j = 0;
                    var tempHeight = 120;
                    var rowLineHeight = 100;
                    for(var i=0 ; i<250; i=i+25){
                        doc.font('Times-Roman').fontSize(13).text("_________________________________________________________________________________________________________________",35,j+(tempHeight-35));
                        doc.font('Times-Roman').fontSize(13).text(""+sno,50,j+rowLineHeight);
                        j = j + 30;
                        var jVal = 990;
                        if(tempHeight == 100){
                            jVal = 900;
                        }
                        if(j>jVal){
                            j=0;
                            tempHeight = 100;

                        }
                        sno ++;
                    }
                    for(var i=0; i<330; i=i+11.5){
                        doc.font('Times-Roman').fontSize(13).text("|",33.8,i+59);
                        doc.font('Times-Roman').fontSize(13).text("|",65,i+59);
                        doc.font('Times-Roman').fontSize(13).text("|",140,i+59);
                        doc.font('Times-Roman').fontSize(13).text("|",240,i+59);
                        doc.font('Times-Roman').fontSize(13).text("|",300,i+59);
                        doc.font('Times-Roman').fontSize(13).text("|",370,i+59);
                        doc.font('Times-Roman').fontSize(13).text("|",420,i+59);
                        doc.font('Times-Roman').fontSize(13).text("|",470,i+59);
                        doc.font('Times-Roman').fontSize(13).text("|",520,i+59);
                        doc.font('Times-Roman').fontSize(13).text("|",570,i+59);
                        doc.font('Times-Roman').fontSize(13).text("|",620,i+59);
                        doc.font('Times-Roman').fontSize(13).text("|",660,i+59);
                        doc.font('Times-Roman').fontSize(13).text("|",720,i+59);
                        doc.font('Times-Roman').fontSize(13).text("|",770,i+59);
                    }
                    doc.font('Times-Roman').fontSize(13).text("_________________________________________________________________________________________________________________",35,381);
                    doc.font('Times-Roman').fontSize(10.5).text(masSignature,35,450);
                    doc.font('Times-Roman').fontSize(10.5).text(lines,35,465);
                    doc.font('Times-Roman').fontSize(10.5).text(authorisedSignature,35,485);
                    doc.font('Times-Roman').fontSize(10.5).text(Signature,450,450);
                    doc.font('Times-Roman').fontSize(10.5).text(lines,450,465);
                    doc.font('Times-Roman').fontSize(10.5).text(authorisedSignature,450,485);
                }*/
                doc.addPage( {layout:'landscape'});
                doc.font('Times-Roman').fontSize(10.5).text("Schedule -1 to Loan agreement",55,25);
                doc.font('Times-Roman').fontSize(10.5).text("____________________________________________________________________________________________________________________________________________",35,32);
                doc.font('Times-Roman').fontSize(10.5).text("  Sr.No.  Agreement No    Name of the borrower   Loan Amount        Purpose          Interest      service          service         other        Installment    tenure         Fi date           Sign",35,52);
                doc.font('Times-Roman').fontSize(10.5).text("                                                                                                                                        rate             charges         tax            charges       amount  ",35,60);
                doc.font('Times-Roman').fontSize(10.5).text("____________________________________________________________________________________________________________________________________________",35,61);
                clientInc = 80;
                for(var i =0; i < result.length; i++){
                    if(typeof result[i] != "undefined"){
                        doc.font('Times-Roman').fontSize(11).text("",75,clientInc);
                        doc.font('Times-Roman').fontSize(11).text(result[i].clientName,142,clientInc);
                        doc.font('Times-Roman').fontSize(11).text(result[i].loanAmount,247,clientInc);
                        //doc.font('Times-Roman').fontSize(9).text(result.clientDetails[i].clientAddress,420,clientInc);
                        doc.font('Times-Roman').fontSize(8.5).text(result[i].loan_purpose+"-"+result[i].sub_category,302,clientInc);
                        doc.font('Times-Roman').fontSize(11).text("",375,clientInc);
                        doc.font('Times-Roman').fontSize(11).text("",622,clientInc);
                        clientInc = clientInc + 20;
                    }
                }
                var sno = 1;
                var j = 0;
                var tempHeight = 110;
                var rowLineHeight = 80;
                for(var i=0 ; i<500; i=i+25){
                    doc.font('Times-Roman').fontSize(13).text("_________________________________________________________________________________________________________________",35,j+(tempHeight-25));
                    doc.font('Times-Roman').fontSize(13).text(""+sno,50,j+rowLineHeight);
                    j = j + 20;
                    var jVal = 990;
                    if(tempHeight == 100){
                        jVal = 900;
                    }
                    if(j>jVal){
                        j=0;
                        tempHeight = 100;

                    }
                    sno ++;
                }
                for(var i=0; i<426; i=i+11.5){
                    doc.font('Times-Roman').fontSize(13).text("|",33.8,i+39);
                    doc.font('Times-Roman').fontSize(13).text("|",65,i+39);
                    doc.font('Times-Roman').fontSize(13).text("|",140,i+39);
                    doc.font('Times-Roman').fontSize(13).text("|",240,i+39);
                    doc.font('Times-Roman').fontSize(13).text("|",300,i+39);
                    doc.font('Times-Roman').fontSize(13).text("|",375,i+39);
                    doc.font('Times-Roman').fontSize(13).text("|",420,i+39);
                    doc.font('Times-Roman').fontSize(13).text("|",470,i+39);
                    doc.font('Times-Roman').fontSize(13).text("|",520,i+39);
                    doc.font('Times-Roman').fontSize(13).text("|",570,i+39);
                    doc.font('Times-Roman').fontSize(13).text("|",620,i+39);
                    doc.font('Times-Roman').fontSize(13).text("|",660,i+39);
                    doc.font('Times-Roman').fontSize(13).text("|",720,i+39);
                    doc.font('Times-Roman').fontSize(13).text("|",770,i+39);
                }
               // doc.font('Times-Roman').fontSize(13).text("_________________________________________________________________________________________________________________",35,381);
                doc.font('Times-Roman').fontSize(10.5).text(masSignature,35,550);
                doc.font('Times-Roman').fontSize(10.5).text(lines,35,565);
                doc.font('Times-Roman').fontSize(10.5).text(authorisedSignature,35,585);
                doc.font('Times-Roman').fontSize(10.5).text(Signature,450,550);
                doc.font('Times-Roman').fontSize(10.5).text(lines,450,565);
                doc.font('Times-Roman').fontSize(10.5).text(authorisedSignature,450,585);
                /*if(result.length >10){
                    doc.addPage( {layout:'landscape'});
                    doc.font('Times-Roman').fontSize(10.5).text("Schedule -1 to Loan agreement",55,35);
                    doc.font('Times-Roman').fontSize(10.5).text("____________________________________________________________________________________________________________________________________________",35,50);
                    doc.font('Times-Roman').fontSize(10.5).text("  Sr.No.  Agreement No    Name of the borrower   Loan Amount        Purpose      Interest      service         service         other        Installment    tenure         Fi date           Sign",35,67);
                    doc.font('Times-Roman').fontSize(10.5).text("                                                                                                                                    rate             charges         tax            charges       amount  ",35,75);
                    clientInc = 100;
                    for(var i =10; i < result.length; i++){
                        if(typeof result[i] != "undefined" && i<20){
                            doc.font('Times-Roman').fontSize(11).text("",75,clientInc);
                            doc.font('Times-Roman').fontSize(11).text(result[i].clientName,142,clientInc);
                            doc.font('Times-Roman').fontSize(11).text(result[i].loanAmount,247,clientInc);
                            //doc.font('Times-Roman').fontSize(9).text(result.clientDetails[i].clientAddress,420,clientInc);
                            doc.font('Times-Roman').fontSize(11).text(result[i].loan_purpose,302,clientInc);
                            doc.font('Times-Roman').fontSize(11).text("",372,clientInc);
                            doc.font('Times-Roman').fontSize(11).text("",622,clientInc);
                            clientInc = clientInc + 30;
                        }
                    }
                    var sno = 11;
                    var j = 0;
                    var tempHeight = 120;
                    var rowLineHeight = 100;
                    for(var i=0 ; i<250; i=i+25){
                        doc.font('Times-Roman').fontSize(13).text("_________________________________________________________________________________________________________________",35,j+(tempHeight-35));
                        doc.font('Times-Roman').fontSize(13).text(""+sno,50,j+rowLineHeight);
                        j = j + 30;
                        var jVal = 990;
                        if(tempHeight == 100){
                            jVal = 900;
                        }
                        if(j>jVal){
                            j=0;
                            tempHeight = 100;

                        }
                        sno ++;
                    }
                    for(var i=0; i<330; i=i+11.5){
                        doc.font('Times-Roman').fontSize(13).text("|",33.8,i+59);
                        doc.font('Times-Roman').fontSize(13).text("|",65,i+59);
                        doc.font('Times-Roman').fontSize(13).text("|",140,i+59);
                        doc.font('Times-Roman').fontSize(13).text("|",240,i+59);
                        doc.font('Times-Roman').fontSize(13).text("|",300,i+59);
                        doc.font('Times-Roman').fontSize(13).text("|",370,i+59);
                        doc.font('Times-Roman').fontSize(13).text("|",420,i+59);
                        doc.font('Times-Roman').fontSize(13).text("|",470,i+59);
                        doc.font('Times-Roman').fontSize(13).text("|",520,i+59);
                        doc.font('Times-Roman').fontSize(13).text("|",570,i+59);
                        doc.font('Times-Roman').fontSize(13).text("|",620,i+59);
                        doc.font('Times-Roman').fontSize(13).text("|",660,i+59);
                        doc.font('Times-Roman').fontSize(13).text("|",720,i+59);
                        doc.font('Times-Roman').fontSize(13).text("|",770,i+59);
                    }
                    doc.font('Times-Roman').fontSize(13).text("_________________________________________________________________________________________________________________",35,381);
                    doc.font('Times-Roman').fontSize(10.5).text(masSignature,35,450);
                    doc.font('Times-Roman').fontSize(10.5).text(lines,35,465);
                    doc.font('Times-Roman').fontSize(10.5).text(authorisedSignature,35,485);
                    doc.font('Times-Roman').fontSize(10.5).text(Signature,450,450);
                    doc.font('Times-Roman').fontSize(10.5).text(lines,450,465);
                    doc.font('Times-Roman').fontSize(10.5).text(authorisedSignature,450,485);
                }*/
                doc.addPage( {layout:'landscape'});
                doc.image(rootPath + "/public/images/Loan Agreement-page-010.jpg", 1, 5, {scale: 0.4});
                /*doc.font('Times-Roman').fontSize(10.5).text("PDC DETAILS",105,35);
                doc.font('Times-Roman').fontSize(10.5).text("MICR  (Yes/No.)",455,35);
                doc.font('Times-Roman').fontSize(10.5).text("________________________________________________________________________________________________________________",35,50);
                doc.font('Times-Roman').fontSize(10.5).text("  Sr.No.                    Date                             Cheque No.                         Bank Name                    Branch                         Amount",35,67);
                doc.font('Times-Roman').fontSize(10.5).text("                         From          To                   From           To",35,75);

                var sno = 1;
                var j = 0;
                var tempHeight = 120;
                var rowLineHeight = 100;
                for(var i=0 ; i<150; i=i+25){
                    doc.font('Times-Roman').fontSize(13).text("__________________________________________________________________________________________",35,j+(tempHeight-35));
                    doc.font('Times-Roman').fontSize(13).text(""+sno,50,j+rowLineHeight);
                    j = j + 30;
                    sno ++;
                }
                for(var i=0; i<200; i=i+11.5){
                    doc.font('Times-Roman').fontSize(13).text("|",33.8,i+59);
                    doc.font('Times-Roman').fontSize(13).text("|",75,i+59);
                    if(i !=0){
                        doc.font('Times-Roman').fontSize(13).text("|",130,i+59);
                    }
                    doc.font('Times-Roman').fontSize(13).text("|",200,i+59);
                    if(i !=0){
                        doc.font('Times-Roman').fontSize(13).text("|",260,i+59);
                    }
                    doc.font('Times-Roman').fontSize(13).text("|",320,i+59);
                    doc.font('Times-Roman').fontSize(13).text("|",420,i+59);
                    doc.font('Times-Roman').fontSize(13).text("|",520,i+59);
                    doc.font('Times-Roman').fontSize(13).text("|",620,i+59);
                }
                doc.font('Times-Roman').fontSize(13).text("__________________________________________________________________________________________",35,256);
                doc.font('Times-Roman').fontSize(10.5).text("IFSC Code :",35,350);
                doc.font('Times-Roman').fontSize(10.5).text("|",105,345);
                doc.font('Times-Roman').fontSize(10.5).text("|",105,350);
                doc.font('Times-Roman').fontSize(10.5).text("|",105,355);
                doc.font('Times-Roman').fontSize(10.5).text("|",270,345);
                doc.font('Times-Roman').fontSize(10.5).text("|",270,350);
                doc.font('Times-Roman').fontSize(10.5).text("|",270,355);
                doc.font('Times-Roman').fontSize(10.5).text(lines,105,335);
                doc.font('Times-Roman').fontSize(10.5).text(lines,105,355);
                doc.font('Times-Roman').fontSize(10.5).text("MICR Code :",430,350);
                doc.font('Times-Roman').fontSize(10.5).text("|",490,345);
                doc.font('Times-Roman').fontSize(10.5).text("|",490,350);
                doc.font('Times-Roman').fontSize(10.5).text("|",490,355);
                doc.font('Times-Roman').fontSize(10.5).text("|",655,345);
                doc.font('Times-Roman').fontSize(10.5).text("|",655,350);
                doc.font('Times-Roman').fontSize(10.5).text("|",655,355);
                doc.font('Times-Roman').fontSize(10.5).text(lines,490,335);
                doc.font('Times-Roman').fontSize(10.5).text(lines,490,355);*/
                doc.write(rootPath+"/public/GeneratedPDF/"+groupId+"_MASDemandPromissoryform.pdf");
                doc.write("MASDemandPromissoryform.pdf",function(err){
                    if(err){
                        customlog.info(err);
                        callback("failure");
                    }else{
                        customlog.info("form write");
                        callback("success");
                    }

                });
            });
        }catch(e){
            customlog.error("Exception while Generating legal Form "+ e);
            self.showErrorPage(req,res);
        }
    },
    generateMASDemandPromissoryformCall : function(mifosGlobalAccountNo,callback){
        this.model.generateMASLegalFormModel(mifosGlobalAccountNo,callback);
    },
    //Ended By Sathish Kumar #008 MAS Legal Form Generation
    generateLegalFormCall : function(mifosGlobalAccountNo,callback){
        this.model.generateLegalFormModel(mifosGlobalAccountNo,callback);
    },
    generateLegalForm: function(req,res,callback){
        try{
            var self = this;
            var http = require('http');
            var https = require('https');
            var groupId = req.body.mifosCustomerId;
            var mifosGlobalAccNo = req.body.mifosGlobalAccNo;
            var disbAmount = req.body.disbAmount;
            var interestRateValue = req.body.interestRateValue;
            var recurrenceType = req.body.recurrenceType;
            var bcOfficeId = req.session.bcOfficeId;
            var month=new Array("January","February","March","April","May","June","July","August","September","October","November","December");
            if(req.body.syncDisbDate != null){
                var disbDate = req.body.syncDisbDate;
            }else{
                var disbDate = dateUtils.convertToMifosDateFormat(req.body.disbDate);
            }
            var disbDateStr = new Date(disbDate);
            customlog.info("groupId "+groupId);
            var companyName ="";
            var address1="" ;
            var address2="";
            var altcompanyName="";
            if(bcOfficeId==1){
                companyName ='MSM Microfinance Ltd';
                altcompanyName='MSM Microfinance Ltd' ;
                address1 ='B - 27 ,Hudco Colony, Peelamedu, Coimbatore - 4 .';
                address2='';
            }else if(bcOfficeId==2){
                companyName ='Ananya Finance For Inclusive Growth Pvt.Ltd.';
                altcompanyName='Ananya Finance Pvt.Ltd.' ;
                address1 ='101,Sakar 1 Building, Nr.Gandhigram Station, Ashram Road';
                address2='Ahemadabad-09.';
            }
            var postheaders = {
                'Content-Type' : 'application/json',
                'Cookie' : req.session.mifosCookie
            };
            var options = {
                host: mifosServiceIP,
                port: mifosPort,
                path: "/mfi/api/report/customer/legalForm-"+groupId+".json",
                method: 'GET',
                headers : postheaders
            };
            self.generateLegalFormCall(mifosGlobalAccNo,function(result,leaderResult){
                var ClientLegalFormDto = require(commonDTO +"/ClientLegalFormDto");
                for(var i =0; i<result.length; i++){
                    var ClientLegalFormDtoDetail = new ClientLegalFormDto();
                    this.ClientLegalFormDtoDetail = ClientLegalFormDtoDetail;
                    var ClientLegalFormDtoDetail = this.ClientLegalFormDtoDetail;
                    ClientLegalFormDtoDetail.setClientName(result[i].clientName);
                    ClientLegalFormDtoDetail.setRelationshipName(result[i].relationshipName);
                    ClientLegalFormDtoDetail.setClientAge(result[i].clientAge);
                    ClientLegalFormDtoDetail.setClientAddress(result[i].clientAddress);
                    ClientLegalFormDtoDetail.setOfficeName(result[i].officeName);
                    customlog.info("Length=="+result[i].clientName);
                }
                var doc = new PDFDocument({
                    size: 'LEGAL'
                });
                doc.font('Times-Roman').fontSize(10).text('1',300,20);
                doc.font('Times-Roman').fontSize(10).text('AAMF - 3',520,40);
                doc.font('Times-Roman').fontSize(16).text('MASTER LOAN FACILITY AGREEMENT',180,60);
                doc.font('Times-Roman').fontSize(12.5).text('_____________________________________________',180,61);
                doc.font('Times-Roman').fontSize(12).text(result[0].officeName,350,84);
                doc.font('Times-Roman').fontSize(12.5).text('This Loan Agreement (" Agreement ") Made at ______________________________________on this ',55,85);
                doc.font('Times-Roman').fontSize(12).text(disbDateStr.getDate(),150,109);
                doc.font('Times-Roman').fontSize(12).text(month[disbDateStr.getMonth()],400,109);
                doc.font('Times-Roman').fontSize(12).text(disbDateStr.getFullYear(),525,110);
                doc.font('Times-Roman').fontSize(12.5).text('_________________________________day of_____________________________________         by',55,110);
                doc.font('Times-Roman').fontSize(12).text(result[0].clientName,150,133);
                doc.font('Times-Roman').fontSize(12).text(result[0].relationshipName,390,133);
                doc.font('Times-Roman').fontSize(12).text(result[0].clientAddress,70,158);
                doc.font('Times-Roman').fontSize(12.5).text('(a) Sri /Smt/Kum_________________________S/o / W/o / D/o ________________________residing',55,135);
                doc.font('Times-Roman').fontSize(12.5).text('at_________________________________________________________________________________',55,160);
                doc.font('Times-Roman').fontSize(12).text(result[1].clientName,150,183);
                doc.font('Times-Roman').fontSize(12).text(result[1].relationshipName,390,183);
                doc.font('Times-Roman').fontSize(12).text(result[1].clientAddress,70,208);
                doc.font('Times-Roman').fontSize(12.5).text('(a) Sri /Smt/Kum_________________________S/o / W/o / D/o ________________________residing',55,185);
                doc.font('Times-Roman').fontSize(12.5).text('at_________________________________________________________________________________',55,210);
                doc.font('Times-Roman').fontSize(12).text(result[2].clientName,150,233);
                doc.font('Times-Roman').fontSize(12).text(result[2].relationshipName,390,233);
                doc.font('Times-Roman').fontSize(12).text(result[2].clientAddress,70,258);
                doc.font('Times-Roman').fontSize(12.5).text('(a) Sri /Smt/Kum_________________________S/o / W/o / D/o ________________________residing',55,235);
                doc.font('Times-Roman').fontSize(12.5).text('at_________________________________________________________________________________',55,260);
                doc.font('Times-Roman').fontSize(12).text(result[3].clientName,150,283);
                doc.font('Times-Roman').fontSize(12).text(result[3].relationshipName,390,283);
                doc.font('Times-Roman').fontSize(12).text(result[3].clientAddress,70,308);
                doc.font('Times-Roman').fontSize(12.5).text('(a) Sri /Smt/Kum_________________________S/o / W/o / D/o ________________________residing',55,285);
                doc.font('Times-Roman').fontSize(12.5).text('at_________________________________________________________________________________',55,310);
                doc.font('Times-Roman').fontSize(12).text(result[4].clientName,150,333);
                doc.font('Times-Roman').fontSize(12).text(result[4].relationshipName,390,333);
                doc.font('Times-Roman').fontSize(12).text(result[4].clientAddress,70,358);
                doc.font('Times-Roman').fontSize(12.5).text('(a) Sri /Smt/Kum_________________________S/o / W/o / D/o ________________________residing',55,335);
                doc.font('Times-Roman').fontSize(12.5).text('at_________________________________________________________________________________',55,360);
                doc.font('Times-Roman').fontSize(12.5).text('in their capacity as the duly appointed representatives of the Self Help Group ("SHG") / Joint Liability',55,380);
                doc.font('Times-Roman').fontSize(12.5).text("Group consisting of various members, as identified in Annexure A hereto( hereinafter collectively and",55,400);
                doc.font('Times-Roman').fontSize(12.5).text("individually referred to as the 'BORROWERS' which expression shall unless  repugnant to the subject",55,420);
                doc.font('Times-Roman').fontSize(12.5).text("or context thereof , mean  and include the SHG  ?  JLG all the members of  SHG / JLG their respective",55,440);
                doc.font('Times-Roman').fontSize(12.5).text("successors, legal heirs and administrators and assigns) of the ONE PART,",55,460);
                doc.font('Times-Roman').fontSize(12.5).text("in favour of",265,480);
                doc.font('Times-Roman').fontSize(12.5).text(companyName+" a company incorporated under the Companies Act,1956 ",55,500);
                doc.font('Times-Roman').fontSize(12.5).text("and having its Registered Office at "+address1+" ,",55,520);
                doc.font('Times-Roman').fontSize(12.5).text(""+address2+"(here in after referred to as "+altcompanyName+" which expression",55,540);
                doc.font('Times-Roman').fontSize(12.5).text("shall,unless it be repugnant to the subject or context thereof include its successors and assigns) of the ",55,560);
                doc.font('Times-Roman').fontSize(12.5).text("OTHER PART. WHEREAS",55,585);
                doc.font('Times-Roman').fontSize(12.5).text("The Self Help Group / Joint Liability Group is an unregistered association of persons who have interse",55,610);
                doc.font('Times-Roman').fontSize(12.5).text("agreed to constitute  and  help each other as a Self  Help  Group  /  Joint Liability Group with a view to",55,630);
                doc.font('Times-Roman').fontSize(12.5).text("developing and ameliorating the socio-economic conditions of the group members.",55,650);
                doc.font('Times-Roman').fontSize(12.5).text("And whereas the Self Help Group/Joint Liability Group wishes to apply for various loan facilities from",55,680);
                doc.font('Times-Roman').fontSize(12.5).text(altcompanyName+", for the  individual use and purpose of the respective members.",55,700);
                doc.font('Times-Roman').fontSize(12.5).text("AND WHEREAS "+altcompanyName+" has agreed to grant/extend Loan/Credit ",55,730);
                doc.font('Times-Roman').fontSize(12.5).text("Facilities to the Borrowers, on certain terms and conditions.",55,750);
                doc.font('Times-Roman').fontSize(12.5).text("AND WHEREAS "+altcompanyName+" and the Borrowers are desirous of reducing",55,780);
                doc.font('Times-Roman').fontSize(12.5).text("the agreed terms into writing in this Master Loan Facility Agreement.",55,800);
                doc.font('Times-Roman').fontSize(12.5).text("NOW IT IS AGREED BY AND BETWEEN THE PARTIES HERETO AS UNDER:",55,830);
                doc.font('Times-Roman').fontSize(14).text("A. Amount Tenure and Purpose of the Loans",55,855);
                doc.font('Times-Roman').fontSize(12.5).text("1."+altcompanyName+" has agreed to lend to the  Borrowers Loan of the amounts ,",55,880);
                doc.font('Times-Roman').fontSize(12.5).text("tenure and purposes as may be specified in  Annexure B  hereto (  hereinafter collectively  and  ",55,900);
                doc.font('Times-Roman').fontSize(12.5).text('severally referred to as "the Loan").',55,920);
                doc.addPage({
                    size: 'LEGAL'
                });
                doc.font('Times-Roman').fontSize(10).text('2',300,20);
                doc.font('Times-Roman').fontSize(12.5).text("2."+altcompanyName+",a company formed to address the issues of livelihood of poor",55,60);
                doc.font('Times-Roman').fontSize(12.5).text("people and is involved in the formation and development of Self  Help  Group/Joint Liability Group.The",55,80);
                doc.font('Times-Roman').fontSize(12.5).text("Loans shall be used to improve the socio  -  exonomic  conditions  of the members of  the  Self  Help",55,100);
                doc.font('Times-Roman').fontSize(12.5).text("Group / Joint Liability Group abd their families;",55,120);
                doc.font('Times-Roman').fontSize(12.5).text("The Borrowers shall not divert  the  funds  or  utilise  the  funds for purposes other than for which the",55,140);
                doc.font('Times-Roman').fontSize(12.5).text("said loans are sanctioned.",55,160);
                doc.font('Times-Roman').fontSize(13).text("B. Interest & Repayment",55,185);
                doc.font('Times-Roman').fontSize(12.5).text("3. The Borrowers agree to repay the loan as specified in Annexure B hereto ,  along with  interest at the",55,205);
                doc.font('Times-Roman').fontSize(12.5).text("rate as specified in the Annexure B  hereto. The Borrowers confirm having understood and agreed to",55,225);
                doc.font('Times-Roman').fontSize(12).text(""+altcompanyName+"'s methods of calculating the installments for the repayments schedules.",55,245);
                doc.font('Times-Roman').fontSize(12).text("4."+altcompanyName+" may,during the tenure of this Agreements,increase the interest rate in",55,270);
                doc.font('Times-Roman').fontSize(12).text("the event of regulatory changes in market conditions.  The existence  or occurrence  of  any such  event",55,290);
                doc.font('Times-Roman').fontSize(12).text("shall be at the sole opinion of "+altcompanyName+" and the same shall be final and binding",55,310);
                doc.font('Times-Roman').fontSize(12.5).text("upon the Borrowers.",55,330);
                doc.font('Times-Roman').fontSize(12.5).text("5. The Borrowers shall also be liable for payments of all costs,charges including legal fees in relation",55,355);
                doc.font('Times-Roman').fontSize(12.5).text("to advancing of the loan.",55,375);
                doc.font('Times-Roman').fontSize(13).text("C. Security",55,400);
                doc.font('Times-Roman').fontSize(12.5).text("6. The Borrowers if required by "+altcompanyName+" shall provide and furnish to ",55,425);
                doc.font('Times-Roman').fontSize(12.5).text(""+altcompanyName+",to their satisfaction,such security as may be stipulated by ",55,445);
                doc.font('Times-Roman').fontSize(12.5).text(""+altcompanyName+" from time to time,to secure the Loan.Failure of the Borrowers ",55,465);
                doc.font('Times-Roman').fontSize(12.5).text("to do so shall be termed as an event of default.",55,485);
                doc.font('Times-Roman').fontSize(12).text("7."+altcompanyName+" shall have a paramount charge,lien and right of set off on all monies,",55,510);
                doc.font('Times-Roman').fontSize(12.5).text("securities , deposits  and  other assets  and  properties  belonging to  the  Borrowers  or  standing  to the",55,530);
                doc.font('Times-Roman').fontSize(12.5).text("Borrower's credit (whether singly or jointly with any other person/s)with  ",55,550);
                doc.font('Times-Roman').fontSize(12.5).text(""+altcompanyName+" or any of its Group companies.",55,570);
                doc.font('Times-Roman').fontSize(13).text("D. Pre-Payment",55,595);
                doc.font('Times-Roman').fontSize(12.5).text("8.The Self Help Group / Joint Liability Group may,on marking a request in writing to ",55,620);
                doc.font('Times-Roman').fontSize(12.5).text(""+altcompanyName+",prepay the loans(principal amount along with interest ",55,640);
                doc.font('Times-Roman').fontSize(12.5).text("and all outstanding amount)at any time during the tenure of the Agreements.",55,660);
                doc.font('Times-Roman').fontSize(13).text("E. Events and Consequences of Default",55,685);
                doc.font('Times-Roman').fontSize(12.5).text("9. An event of default shall be deemed to have occurred if the Borrowers ( a ) commit a breach of any",55,710);
                doc.font('Times-Roman').fontSize(12.5).text("of the terms and conditions int his Agreements,or (b)fail to pay any installments or any other payment",55,730);
                doc.font('Times-Roman').fontSize(12.5).text("on the due dates and such failure continues for 30 days; or (c) ( commit an act of bankruptcy or makes",55,750);
                doc.font('Times-Roman').fontSize(12.5).text("assignment for the benefit of creditors  or  consents  at  the appointment  of  the receiver or insolvency",55,770);
                doc.font('Times-Roman').fontSize(12.5).text("proceedings are instituted against the Borrowers.",55,790);
                doc.font('Times-Roman').fontSize(12).text("10.Upon occurrence of any of the events of default and at any time thereafter,"+altcompanyName+"",55,815);
                doc.font('Times-Roman').fontSize(12.5).text("shall be entitled to declare the loan immediately due  and  payable and upon the Borrowers failing",55,835);
                doc.font('Times-Roman').fontSize(12.5).text("to make the said payments with 7 days there of,"+altcompanyName+" may,at its sole ",55,855);
                doc.font('Times-Roman').fontSize(12.5).text("discretion (a) require the Borrowers to  pay any liquidated damages equal to all unpaid installments which in ",55,875);
                doc.font('Times-Roman').fontSize(12.5).text("the absence of a default would have been payable by the Borrowers for the full term hereof; or(b)exercise",55,895);
                doc.font('Times-Roman').fontSize(12.5).text("any other right or remedy which may be available to it under the applicable laws.",55,915);
                doc.addPage({
                    size: 'LEGAL'
                });
                doc.font('Times-Roman').fontSize(10).text('3',300,20);
                doc.font('Times-Roman').fontSize(12.5).text("11. The Borrowers  shall also  be liable for all legal and other costs  and  expenses  resulting  from the",55,60);
                doc.font('Times-Roman').fontSize(12.5).text("foregoing defaults or the exercise of "+altcompanyName+"'s remedies.",55,80);
                doc.font('Times-Roman').fontSize(12.5).text("12. The Borrowers hereby agree that in case the Borrowers commit a default in payment  or repayment",55,105);
                doc.font('Times-Roman').fontSize(12.5).text("of Principal amount or the loan  /  Financial  /  credit facility or interest  /  charges  due   thereon  ",55,125);
                doc.font('Times-Roman').fontSize(12.5).text(""+altcompanyName+"and/or the Reserve Bank of India(RBI)will have an unqualified",55,145);
                doc.font('Times-Roman').fontSize(12.5).text("right to disclose or publish the details or the default and the name or the Borrowers and/Partners/Coapplicants,",55,165);
                doc.font('Times-Roman').fontSize(12.5).text("as applicable,as defaulters in such manner and through such medium as ",55,185);
                doc.font('Times-Roman').fontSize(12.5).text(""+altcompanyName+" or RBI in their absolute discreation may think it.",55,205);
                doc.font('Times-Roman').fontSize(13).text("F. Assignment",55,230);
                doc.font('Times-Roman').fontSize(12.5).text("13. The Borrowers shall not have any right  to  assign its obligations under  this  agreement, however",55,255);
                doc.font('Times-Roman').fontSize(12.5).text(""+altcompanyName+" has the right to transfer,assign,securitise or sell in any ",55,275);
                doc.font('Times-Roman').fontSize(12.5).text("manner,in whole or in part,the outstandings and dues to any third party without reference or Intimation to the",55,295);
                doc.font('Times-Roman').fontSize(12.5).text("Borrowers  and  any such transfer  /  assignments  /  sale  /  securitisation  shall conclusively  bind the",55,315);
                doc.font('Times-Roman').fontSize(12.5).text("Borrowers and all Other persons.",55,335);
                doc.font('Times-Roman').fontSize(12.5).text("G. Notices",55,360);
                doc.font('Times-Roman').fontSize(12.5).text("14. Any notices sent will be deemed  to  have  been given when it shall be delivered by hand , mail or",55,385);
                doc.font('Times-Roman').fontSize(12.5).text("telegram  or  registered post  to  the concerned party at the address mentioned herein. The  Borrowers",55,405);
                doc.font('Times-Roman').fontSize(12.5).text("shall immediately intimate "+altcompanyName+" of any change in the address for",55,425);
                doc.font('Times-Roman').fontSize(12.5).text("communication.",55,445);
                doc.font('Times-Roman').fontSize(12.5).text("H. Miscellaneous",55,470);
                doc.font('Times-Roman').fontSize(12.5).text("15. Where the loan is provided to more than one Borrower, the liability of the Borrowers to repay the",55,495);
                doc.font('Times-Roman').fontSize(12.5).text("Loan along with interest,   costs,   charges,   expenses  etc  shall  be  joint  and  several  and  the word",55,515);
                doc.font('Times-Roman').fontSize(12.5).text("Borrower in this agreement shall be constructed as Borrowers.",55,535);
                doc.font('Times-Roman').fontSize(12.5).text("16. The Borrowers agree that the installment amounts for repayment of each Loan shall be increased",55,560);
                doc.font('Times-Roman').fontSize(12.5).text("by incremental Taxes, interest tax  and  other related  and  consequential charges and taxes levied on",55,580);
                doc.font('Times-Roman').fontSize(12.5).text("each transaction between the date of availing of the Loans and the date of repayments of the loans to",55,600);
                doc.font('Times-Roman').fontSize(12.5).text(""+altcompanyName+"",55,620);
                doc.font('Times-Roman').fontSize(12.5).text("17.The Borrowers hereby authorise "+altcompanyName+" and its agents to exchange",55,645);
                doc.font('Times-Roman').fontSize(12.5).text("share or part with all the information relating to the Borrowers loan details and repayments history",55,665);
                doc.font('Times-Roman').fontSize(12.5).text("information and all information pertaining to and contained in this Agreement to other "+altcompanyName+" ",55,685);
                doc.font('Times-Roman').fontSize(12.5).text("Group Companies/Banks/financial Institutions/Credit Bureaus/Agencies/Statutory Bodies as may",55,705);
                doc.font('Times-Roman').fontSize(12.5).text("required and undertakes not to hold "+altcompanyName+"all other group companies",55,725);
                doc.font('Times-Roman').fontSize(12.5).text("of "+altcompanyName+" and their agents liable for use of the aforesaid information.",55,745);
                doc.font('Times-Roman').fontSize(12.5).text("I. Arbitration",55,770);
                doc.font('Times-Roman').fontSize(12.5).text("18. It is agreed that in case of any dispute  on  the terms  and  conditions  of  the agreement  shall be",55,795);
                doc.font('Times-Roman').fontSize(12.5).text("referred to ab 'Arbitrator' to be selected  with  mutual consent whose decision in the matters will be",55,820);
                doc.font('Times-Roman').fontSize(12.5).text("final and conclusive and acceptable to each them.",55,840);
                doc.addPage({
                    size: 'LEGAL'
                });
                doc.font('Times-Roman').fontSize(10).text('4',300,20);
                doc.font('Times-Roman').fontSize(13).text("J. Governing law and Jurisdiction",55,60);
                doc.font('Times-Roman').fontSize(12.5).text("19. The Parties hereby agree that any legal action  or proceeding arising out of this Loan Agreement",55,85);
                doc.font('Times-Roman').fontSize(12.5).text("shall be brought  in  the Courts  at  Coimbatore in India  and  irrevocably  submit  themselves  to the",55,105);
                doc.font('Times-Roman').fontSize(12.5).text("jurisdiction of such courts and tribunals "+altcompanyName+" may,however,",55,125);
                doc.font('Times-Roman').fontSize(12.5).text("in their absolute discretion commence any legal action or proceedings arising out of this Loan Agreement",55,145);
                doc.font('Times-Roman').fontSize(12.5).text("in any other court or other appropriate forum, and the Borrowers here by consent to that jurisdiction.",55,165);
                doc.font('Times-Roman').fontSize(12.5).text("Any provision of this Loan Agreement which is prohibited or unenforceable in any jurisdiction shall",55,185);
                doc.font('Times-Roman').fontSize(12.5).text(",as to such jurisdiction, be ineffective to the extent  of  prohibition  or  unenforceability but shall not",55,205);
                doc.font('Times-Roman').fontSize(12.5).text("invalidate the  remaining provisions  of  this Loan agreement  or  affect such provision  in  any other",55,225);
                doc.font('Times-Roman').fontSize(12.5).text("jurisdiction.",55,245);
                doc.font('Times-Roman').fontSize(13).text("ANNEXURE - A",260,270);
                doc.font('Times-Roman').fontSize(13).text("(Details of each member of the SHG/JLG and address for communication)",100,290);
                doc.font('Times-Roman').fontSize(13).text("______________________________________________________________________________________",35,303);
                doc.font('Times-Roman').fontSize(13).text("  S.No.                Name                          Son/Wife/              Age                 Address                          Sign",35,320);
                doc.font('Times-Roman').fontSize(13).text("                                                              Daughter of                                        ",35,335);
                clientInc = 370;
                for(var i =0; i < result.length; i++){
                    if(typeof result[i] != "undefined"){
                        doc.font('Times-Roman').fontSize(11).text(result[i].clientName,75,clientInc);
                        doc.font('Times-Roman').fontSize(11).text(result[i].relationshipName,212,clientInc);
                        doc.font('Times-Roman').fontSize(11).text(result[i].clientAge,340,clientInc);
                        //doc.font('Times-Roman').fontSize(9).text(result.clientDetails[i].clientAddress,420,clientInc);
                        doc.font('Times-Roman').fontSize(11).text(" ",360,clientInc-25);
                        doc.font('Times-Roman').fontSize(10).text(result[i].clientAddress,{
                            width	:	343,
                            height	:	clientInc-60,
                            columns	:	2
                        });
                        clientInc = clientInc + 60;
                    }
                    var ClientLegalFormDtoDetail = new ClientLegalFormDto();
                     this.ClientLegalFormDtoDetail = ClientLegalFormDtoDetail;
                     var ClientLegalFormDtoDetail = this.ClientLegalFormDtoDetail;
                     ClientLegalFormDtoDetail.setClientName(result[i].clientName);
                     ClientLegalFormDtoDetail.setRelationshipName(result[i].relationshipName);
                     ClientLegalFormDtoDetail.setClientAge(result[i].clientAge);
                     ClientLegalFormDtoDetail.setClientAddress(result[i].clientAddress);
                     customlog.info("Length=="+result[i].clientName);
                }
                for(var i=0; i<632; i=i+11.5){
                    doc.font('Times-Roman').fontSize(13).text("|",33.8,i+315);
                    doc.font('Times-Roman').fontSize(13).text("|",70,i+315);
                    doc.font('Times-Roman').fontSize(13).text("|",210,i+315);
                    doc.font('Times-Roman').fontSize(13).text("|",335,i+315);
                    doc.font('Times-Roman').fontSize(13).text("|",358,i+315);
                    doc.font('Times-Roman').fontSize(13).text("|",525,i+315);
                    doc.font('Times-Roman').fontSize(13).text("|",592,i+315);
                }
                doc.font('Times-Roman').fontSize(13).text("______________________________________________________________________________________",35,937);
                var sno = 1;
                var j = 0;
                var tempHeight = 370;
                for(var i=0 ; i<625; i=i+25){
                    doc.font('Times-Roman').fontSize(13).text(""+sno,50,j+tempHeight);
                    doc.font('Times-Roman').fontSize(13).text("______________________________________________________________________________________",35,j+(tempHeight-35));
                    j = j + 60;
                    var jVal = 550;
                    if(tempHeight == 100){
                        jVal = 900;
                    }
                    if(j>jVal){
                        doc.addPage({
                            size: 'LEGAL'
                        });
                        doc.font('Times-Roman').fontSize(10).text('5',300,20);
                        doc.font('Times-Roman').fontSize(13).text("______________________________________________________________________________________",35,33);
                        doc.font('Times-Roman').fontSize(13).text("  S.No.                Name                          Son/Wife/              Age                 Address                           Sign",35,50);
                        doc.font('Times-Roman').fontSize(13).text("                                                              Daughter of                                        ",35,65);
                        j=0;
                        tempHeight = 100;
                    }
                    sno ++;
                }
                var heightInc = 100;
                if(result.length > 10){
                    for(var i = 10; i<result.length; i++){
                        doc.font('Times-Roman').fontSize(11).text(result[i].clientName,75,heightInc);
                        doc.font('Times-Roman').fontSize(11).text(result[i].relationshipName,212,heightInc);
                        doc.font('Times-Roman').fontSize(11).text(result[i].clientAge,340,heightInc);
                        //doc.font('Times-Roman').fontSize(9).text(result.clientDetails[i].clientAddress,420,heightInc);
                        doc.font('Times-Roman').fontSize(11).text(" ",360,heightInc-25);
                        var clientAdress = "";
                        if((result[i].clientAddress).indexOf('.')!=-1){
                            clientAdress = result[i].clientAddress.replace('.','');
                        }else
                            clientAdress = result[i].clientAddress;
                        customlog.info(result[i].clientAddress);
                        doc.font('Times-Roman').fontSize(10).text(clientAdress,{
                            width	:	343,
                            height	:	heightInc,
                            columns	:	2
                        });
                        heightInc = heightInc + 60;
                    }
                }
                for(var i=0; i<931; i=i+11.5){
                    doc.font('Times-Roman').fontSize(13).text("|",33.8,i+45);
                    doc.font('Times-Roman').fontSize(13).text("|",70,i+45);
                    doc.font('Times-Roman').fontSize(13).text("|",210,i+45);
                    doc.font('Times-Roman').fontSize(13).text("|",335,i+45);
                    doc.font('Times-Roman').fontSize(13).text("|",358,i+45);
                    doc.font('Times-Roman').fontSize(13).text("|",525,i+45);
                    doc.font('Times-Roman').fontSize(13).text("|",592,i+45);
                }
                doc.font('Times-Roman').fontSize(13).text("|",53.8,640);
                doc.font('Times-Roman').fontSize(13).text("|",90,640);
                doc.font('Times-Roman').fontSize(13).text("|",230,640);
                doc.font('Times-Roman').fontSize(13).text("|",355,640);
                doc.font('Times-Roman').fontSize(13).text("|",378,640);
                doc.font('Times-Roman').fontSize(13).text("|",545,640);
                doc.font('Times-Roman').fontSize(13).text("|",580,640);
                doc.font('Times-Roman').fontSize(13).text("______________________________________________________________________________________",35,966);
                doc.addPage({
                    size: 'LEGAL'
                });
                doc.font('Times-Roman').fontSize(10).text('6',300,20);
                doc.font('Times-Roman').fontSize(13).text("ANNEXURE - B",260,50);
                doc.font('Times-Roman').fontSize(12.5).text("1. Loan Amount",55,75);
                doc.font('Times-Roman').fontSize(12.5).text("2. Details of Repayment",55,95);
                doc.font('Times-Roman').fontSize(12.5).text("3. Interest Rate",55,115);
                doc.font('Times-Roman').fontSize(12.5).text("-",200,75);
                doc.font('Times-Roman').fontSize(12.5).text("-",200,95);
                doc.font('Times-Roman').fontSize(12.5).text("-",200,115);
                doc.font('Times-Roman').fontSize(12.5).text(disbAmount,220,75);
                doc.font('Times-Roman').fontSize(12.5).text(recurrenceType,220,95);
                doc.font('Times-Roman').fontSize(12.5).text(interestRateValue,220,115);
                doc.font('Times-Roman').fontSize(12.5).text("IN WITNESS WHERE OF the Borrower have executed these presents on the day, month and year",55,145);
                doc.font('Times-Roman').fontSize(12.5).text("first above written.",55,165);
                doc.font('Times-Roman').fontSize(12.5).text("Signed and delivered by the within - named ______________________________self Help Group",55,185);
                doc.font('Times-Roman').fontSize(12.5).text("/ joint Liability Group through the hands of their Authorised representatives as Follows:",55,205);
                var leader = "",subLeader1 = "",subLeader2 ="",subLeader3="",subLeader4="";
                if(leaderResult.length >0){
                    subLeader1 = leaderResult[0].subLeader;
                    leader = leaderResult[0].leader;
                }if(leaderResult.length >1){
                    subLeader2 = leaderResult[1].subLeader;
                }if(leaderResult.length >2){
                    subLeader3 = leaderResult[2].subLeader;
                }if(leaderResult.length >3){
                    subLeader4 =leaderResult[3].subLeader;
                }
                doc.font('Times-Roman').fontSize(12).text(leader,100,234);
                doc.font('Times-Roman').fontSize(12.5).text("Name__________________________________        Name__________________________________",55,235);
                doc.font('Times-Roman').fontSize(12.5).text("                        (Group Leader)                                                              (Group Leader)",55,255);
                doc.font('Times-Roman').fontSize(12).text(subLeader1,100,284);
                doc.font('Times-Roman').fontSize(12.5).text("Name__________________________________        Name__________________________________",55,285);
                doc.font('Times-Roman').fontSize(12.5).text("                        (Sub Leader) - 1                                                            (Sub Leader) - 1",55,305);
                doc.font('Times-Roman').fontSize(12).text(subLeader2,100,334);
                doc.font('Times-Roman').fontSize(12.5).text("Name__________________________________        Name__________________________________",55,335);
                doc.font('Times-Roman').fontSize(12.5).text("                         (Sub Leader) - 2                                                           (Sub Leader) - 2",55,355);
                doc.font('Times-Roman').fontSize(12).text(subLeader3,100,384);
                doc.font('Times-Roman').fontSize(12.5).text("Name__________________________________        Name__________________________________",55,385);
                doc.font('Times-Roman').fontSize(12.5).text("                         (Sub Leader) - 3                                                           (Sub Leader) - 3",55,405);
                doc.font('Times-Roman').fontSize(12).text(subLeader4,100,434);
                doc.font('Times-Roman').fontSize(12.5).text("Name__________________________________        Name__________________________________",55,435);
                doc.font('Times-Roman').fontSize(12.5).text("                         (Sub Leader) - 4                                                           (Sub Leader) - 4",55,455);
                doc.write(rootPath+"/public/GeneratedPDF/"+groupId+"_legalform.pdf");
                doc.write("LegalForm.pdf",function(err){
                    if(err){
                        customlog.info(err);
                        callback();
                    }else{
                        customlog.info("form write");
                        callback();
                    }
                });
            });
        }catch(e){
            customlog.error("Exception while Generating legal Form "+ e);
            self.showErrorPage(req,res);
        }
    },

    //promissory note pdf generation
    generatePromissoryNote: function(req,res,callback){
        try{
            customlog.info("inside generatePromissoryNote");
            var self = this;
            var rest = require("./rest.js");
            var http = require('http');
            var https = require('https');
            var groupId = req.body.mifosCustomerId;
            var mifosGlobalAccNo = req.body.mifosGlobalAccNo;
            var docLanguage = (typeof req.body.docLanguage == 'undefined')?req.session.language:req.body.docLanguage;
            var month=new Array("January","February","March","April","May","June","July","August","September","October","November","December");
            if(req.body.syncDisbDate != null){
                var disbDate = req.body.syncDisbDate;
            }else{
                var disbDate = dateUtils.convertToMifosDateFormat(req.body.disbDate);
            }
            var disbDateStr = new Date(disbDate);
            var disbMonth =  disbDateStr.getMonth() + 1;
            var bcOfficeId = req.session.bcOfficeId;
            var postheaders = {
                'Content-Type' : 'application/json',
                'Cookie' : req.session.mifosCookie
            };
            var options = {
                host: mifosServiceIP,
                port: mifosPort,
                path: "/mfi/api/report/customer/promissoryNote-"+groupId+"-"+mifosGlobalAccNo+".json",
                method: 'GET',
                headers : postheaders
            };
            rest.getJSON(options,function(statuscode,result,headers){
                customlog.info(statuscode);
                if(statuscode == 302){
                    res.redirect(props.contextPath+'/client/ci/logout');
                }
                else {
                    if(result.status == "success"){
                        eval("generatePromissoryNoteIn"+docLanguage+"(result,disbDateStr,disbMonth,groupId,month,bcOfficeId)");
                        callback();
                    }
                    else {
                        self.showErrorPage(req,res);
                    }
                }
            });
        }catch(e){
            customlog.error("Exception while generatePromissoryNote "+e);
            self.showErrorPage(req,res);
        }
    },
    groupAndClientsLoanScheduleReport : function(mifosCustomerId,globalAccountNum,clientid, callBack){
        this.model.groupAndClientsLoanScheduleModel(mifosCustomerId,globalAccountNum,clientid, callBack);
    },
    generateLoanScheduleForm : function(req,res,callback){
        var self = this;
        try{
            var clientId;
            var sumAssured= new Array();
            if(typeof (req.body.clientidhidden) == 'undefined'){
                clientId=req.body.selectedMemberId;
            }else{
                clientId= req.body.clientidhidden;
            }
            var bcOfficeId = req.session.bcOfficeId;
            self.groupAndClientsLoanScheduleReport(req.body.mifosCustomerId, req.body.mifosGlobalAccNo,clientId,
                function(loanScheduleResult,premiumClientAmount,premiumClientServiceAmount,documentClientAmount,documentClientServiceAmount,
                         premiumClientAmountGuarantor,premiumClientServiceAmountGuarantor,
                         premiumClientAmountSecond,premiumClientServiceAmountSecond,documentClientAmountSecond,documentClientServiceAmountSecond,
                         premiumClientAmountGuarantorSecond,premiumClientServiceAmountGuarantorSecond,clt_name,clt_Age){
                for(i in premiumClientAmount){
                    var sum = (parseInt(documentClientAmount[i])+parseInt(documentClientServiceAmount[i])+parseInt(premiumClientAmount[i])+parseInt(premiumClientServiceAmount[i])+parseInt(premiumClientAmountSecond[i])+parseInt(premiumClientServiceAmountSecond[i])+parseInt(premiumClientAmountGuarantor[i])+parseInt(premiumClientServiceAmountGuarantor[i])+parseInt(premiumClientAmountGuarantorSecond[i])+parseInt(premiumClientServiceAmountGuarantorSecond[i])).toFixed();
                    sumAssured.push(sum);
                }
                var doc = new PDFDocument({layout:'landscape'}) ;
                //variables declaration
                var groupCodeOld = 0, groupCodeNow = 0, linesWritten = 0;
                var vLineForTableData=135;
                var line = 137 ;
                var vLine = 129;
                var longLines = "________________________________________________________________________________________________________________________________________";
                var vLineStart_Y = 114, tableHeadValue_Y = 120;
                var subLeaderNameArray = req.body.subLeaderNameArray;
                var clientCodeArray = req.body.clientCodeArray;
                var SubClientIndex = 0;
                // start of pdf generation code
                for (var i in loanScheduleResult) {
                    groupCodeOld = groupCodeNow;
                    groupCodeNow = loanScheduleResult[i].group_code;
                    /**
                     * if same then current record belongs to same person so print in same page
                     * else diff user, diff page
                     */
                    if(groupCodeNow == groupCodeOld) {
                        if(linesWritten == 24) {
                            doc.addPage();
                            // reset values
                            vLineForTableData=135;
                            line = 137;
                            vLine = 129;
                            linesWritten = 0;
                            // writing the page header
                            if(subLeaderNameArray == ""){
                                writeHeaderForLoanSchedulePDF(loanScheduleResult[i], "",loanScheduleResult[0].group_code, doc, longLines, vLineStart_Y, tableHeadValue_Y,bcOfficeId);
                            }else{
                                writeHeaderForLoanSchedulePDF(loanScheduleResult[i], subLeaderNameArray[SubClientIndex],loanScheduleResult[0].group_code, doc, longLines, vLineStart_Y, tableHeadValue_Y,bcOfficeId);
                            }
                        }
                        // write a line to the current page
                        writeRowsForLoanSchedulePDF(loanScheduleResult[i], doc, vLine, vLineForTableData, longLines, line);
                        vLine+=15.5;
                        line+=15.5;
                        vLineForTableData +=15.5;
                        linesWritten++;
                    }
                    else {
                        if(i>0) {
                            doc.addPage();
                            // reset values
                            vLineForTableData=135;
                            line = 137;
                            vLine = 129;
                            linesWritten = 0;
                        }
                        // writing the page header
                        if(subLeaderNameArray == ""){
                            writeHeaderForLoanSchedulePDF(loanScheduleResult[i],"", loanScheduleResult[0].group_code, doc, longLines, vLineStart_Y, tableHeadValue_Y,bcOfficeId);
                        }else{
                            writeHeaderForLoanSchedulePDF(loanScheduleResult[i],subLeaderNameArray[SubClientIndex], loanScheduleResult[0].group_code, doc, longLines, vLineStart_Y, tableHeadValue_Y,bcOfficeId);
                        }
                        SubClientIndex++;
                        // write a line to the current page
                        writeRowsForLoanSchedulePDF(loanScheduleResult[i], doc, vLine, vLineForTableData, longLines, line);
                        vLine+=15.5;
                        line+=15.5;
                        vLineForTableData +=15.5;
                        linesWritten++;
                    }

                }
                doc.addPage();
                vLineForTableData=135;
                line = 137;
                vLine = 129;
                linesWritten = 0;
                // writing the page header
                    writeHeaderForLoanScheduleFeesPDF(loanScheduleResult[0],"", loanScheduleResult[0].group_code, doc, longLines, vLineStart_Y, tableHeadValue_Y,bcOfficeId);
                // write a line to the current page
                for (var i in premiumClientAmount) {
                    SubClientIndex++;
                    writeRowsForLoanScheduleFeesPDF((parseInt(i)+1),clt_name[i],clt_Age[i],premiumClientAmount[i],premiumClientServiceAmount[i],premiumClientAmountSecond[i],premiumClientServiceAmountSecond[i],premiumClientAmountGuarantor[i],premiumClientServiceAmountGuarantor[i],premiumClientAmountGuarantorSecond[i],premiumClientServiceAmountGuarantorSecond[i],documentClientAmount[i],documentClientServiceAmount[i],sumAssured[i], doc, vLine, vLineForTableData, longLines, line);
                    vLine+=15.5;
                    line+=15.5;
                    vLineForTableData +=15.5;
                    linesWritten++;
                }
                var total = 0;
                var insuranceTotalFirst =0;
                var insuranceServiceFirst = 0;
                var insuranceTotalSecond =0;
                var insuranceServiceSecond = 0;
                var insuranceTotalGuarantorFirst =0;
                var insuranceServiceGuarantorFirst = 0;
                var insuranceTotalGuarantorSecond =0;
                var insuranceServiceGuarantorSecond = 0;
                var docTotal = 0;
                var docServiceTotal =0;
                for(i in sumAssured){
                    total += parseInt(sumAssured[i]);
                    insuranceTotalFirst += parseInt(premiumClientAmount[i]);
                    insuranceServiceFirst += parseInt(premiumClientServiceAmount[i]);
                    insuranceTotalSecond += parseInt(premiumClientAmountSecond[i]);
                    insuranceServiceSecond += parseInt(premiumClientServiceAmountSecond[i]);
                    insuranceTotalGuarantorFirst += parseInt(premiumClientAmountGuarantor[i]);
                    insuranceServiceGuarantorFirst += parseInt(premiumClientServiceAmountGuarantor[i]);
                    insuranceTotalGuarantorSecond += parseInt(premiumClientAmountGuarantorSecond[i]);
                    insuranceServiceGuarantorSecond += parseInt(premiumClientServiceAmountGuarantorSecond[i]);
                    docTotal += parseInt(documentClientAmount[i]);
                    docServiceTotal += parseInt(documentClientServiceAmount[i]);
                }
                writeTotal(total,insuranceTotalFirst,insuranceServiceFirst,insuranceTotalSecond,insuranceServiceSecond,insuranceTotalGuarantorFirst,insuranceServiceGuarantorFirst,insuranceTotalGuarantorSecond,insuranceServiceGuarantorSecond,docTotal,docServiceTotal, doc, vLine, vLineForTableData, longLines, line);

                doc.write(rootPath+"/public/GeneratedPDF/"+req.body.mifosCustomerId+"_loanRepaymentSchedule.pdf");
                callback();
            });
        }catch(e){
            customlog.error("Exception while generateLoanScheduleForm "+e);
            self.showErrorPage(req,res);
        }
    },
    //receipt pdf generation
    generateReceiptForm: function(req,res,callback){
        try{
            customlog.info("inside generateReceiptForm");
            var self = this;
            var rest = require("./rest.js");
            var http = require('http');
            var https = require('https');
            var groupId = req.body.mifosCustomerId;
            var mifosGlobalAccNo = req.body.mifosGlobalAccNo;
            var docLanguage = (typeof req.body.docLanguage == 'undefined')?req.session.language:req.body.docLanguage;
            var month=new Array("January","February","March","April","May","June","July","August","September","October","November","December");
            if(req.body.syncDisbDate != null){
                var disbDate = req.body.syncDisbDate;
            }else{
                var disbDate = dateUtils.convertToMifosDateFormat(req.body.disbDate);
            }
            var disbDateStr = new Date(disbDate);
            var disbMonth =  disbDateStr.getMonth() + 1;
            var bcOfficeId = req.session.bcOfficeId;
            var postheaders = {
                'Content-Type' : 'application/json',
                'Cookie' : req.session.mifosCookie
            };
            var options = {
                host: mifosServiceIP,
                port: mifosPort,
                path: "/mfi/api/report/customer/promissoryNote-"+groupId+"-"+mifosGlobalAccNo+".json",
                method: 'GET',
                headers : postheaders
            };
            rest.getJSON(options,function(statuscode,result,headers){
                customlog.info(statuscode);
                if(statuscode == 302){
                    res.redirect(props.contextPath+'/client/ci/logout');
                }
                else {
                    if(result.status == "success"){
                        //var activityDetails = new Array(iklantPort, req.session.tenantId, req.session.userId, req.session.userName, req.originalUrl, req.connection.remoteAddress, "router.js", "generateReceiptForm", "success", "generateReceiptForm", "generateReceiptForm");
                        //self.model.insertActivityLogModel(activityDetails);
                        eval("generateReceiptIn"+docLanguage+"(result,disbDateStr,disbMonth,groupId,month,bcOfficeId)");
                        callback();
                    }
                    else{
                        self.showErrorPage(req,res);
                    }
                }
            });
        }catch(e){
            customlog.error("Exception while generateReceiptForm "+e);
            self.showErrorPage(req,res);
        }
    },

    insertFieldVerificationDetailsCall : function(fieldVerificationObj,prospectClientHouseDetail,callback) {
        this.model.insertFieldVerificationDetailsModel(fieldVerificationObj,prospectClientHouseDetail,callback);
    },

    insertFieldVerifiedDetails : function(req,res) {
        try{
            var self = this;
            customlog.info("INSIDE INSERT FIELD VERIFICATION DETAILS");
            var tenantId = req.session.tenantId;
            var userId = req.session.userId;
            var fieldVerificationReference = require(commonDTO +"/fieldVerification");
            var userContactNumber = req.session.userContactNumber;
            if(typeof tenantId == 'undefined' || typeof userId == 'undefined' || typeof req.session.operationId == 'undefined') {
                res.redirect(props.contextPath+'/client/ci/login');
            }
            else {
                var fieldVerificationObj = new fieldVerificationReference() ;
                fieldVerificationObj.clearAll();
                if(typeof(req.body.addressmatchedCheck) != 'undefined' & (req.body.addressmatchedCheck == 'on')){
                    fieldVerificationObj.setClient_address_matched(1);
                }
                if(typeof(req.body.rcnumbermatched) != 'undefined' & (req.body.rcnumbermatched == 'on')){
                    fieldVerificationObj.setRc_number_matched(1);

                }
                if(typeof(req.body.phonenumbercheck) != 'undefined' & (req.body.phonenumbercheck == 'on')){
                    fieldVerificationObj.setPhone_number_matched(1);

                }
                if(typeof(req.body.id_proofcheck) != 'undefined' && (req.body.id_proofcheck == 'on')){
                    fieldVerificationObj.setId_proof_matched(1);

                }
                if(typeof(req.body.guarantoraddressmatchedCheck) != 'undefined' & (req.body.guarantoraddressmatchedCheck == 'on')){
                    fieldVerificationObj.setGuarantor_address_matched(1);

                }
                if(typeof(req.body.guarantorrelationshipCheck) != 'undefined' & (req.body.guarantorrelationshipCheck == 'on')){
                    fieldVerificationObj.setGuarantor_relationship_matched(1);

                }

                if(typeof(req.body.guarantoridproofcheck) != 'undefined' & (req.body.guarantoridproofcheck == 'on')){
                    fieldVerificationObj.setIs_GuarantorIdProof_Matched(1);
                }
                if(typeof(req.body.bankaccountdetailscheck) != 'undefined' & (req.body.bankaccountdetailscheck == 'on')){
                    fieldVerificationObj.setBank_details_matched(1);

                }
                if(typeof(req.body.insurancedetailcheck) != 'undefined' & (req.body.insurancedetailcheck == 'on')){
                    fieldVerificationObj.setInsurance_details_matched(1);

                }

                if(typeof(req.body.memberaddproof) != 'undefined' & (req.body.memberaddproof == 'on')){
                    fieldVerificationObj.setIs_ClientAddressProofId_provided(1);
                }
                if(typeof(req.body.memberidproof) != 'undefined' & (req.body.memberidproof == 'on')){
                    fieldVerificationObj.setIs_ClientProofId_provided(1);
                }
                if(typeof(req.body.guarantoraddproof) != 'undefined' & (req.body.guarantoraddproof == 'on')){
                    fieldVerificationObj.setIs_GuarantorAddressProofId_provided(1);
                }
                if(typeof(req.body.guarantoridproof) != 'undefined' & (req.body.guarantoridproof == 'on')){
                    fieldVerificationObj.setIs_GuarantorProofId_provided(1);
                }

                var prosClientHouseDetailObj = require(commonDTO +"/prospectClientHouseDetail");
                var prospectClientHouseDetailToUpdate = new prosClientHouseDetailObj();
                prospectClientHouseDetailToUpdate.clearAll();
                prospectClientHouseDetailToUpdate.setHouse_type(req.body.House);
                if(typeof(req.body.TimePeriod) == 'undefined' | req.body.TimePeriod == '' |  req.body.TimePeriod== 'NULL' ){
                    prospectClientHouseDetailToUpdate.setTime_period(0);
                }
                else{
                    prospectClientHouseDetailToUpdate.setTime_period(req.body.TimePeriod);
                }

                if(typeof(req.body.Housesqft) == 'undefined' | req.body.Housesqft == '' |  req.body.Housesqft== 'NULL' ){
                    prospectClientHouseDetailToUpdate.setHouse_sqft(0);
                }
                else{
                    prospectClientHouseDetailToUpdate.setHouse_sqft(req.body.Housesqft);
                }

                prospectClientHouseDetailToUpdate.setHouse_ceiling_type(req.body.HouseCeilingType);
                prospectClientHouseDetailToUpdate.setHouse_wall_type(req.body.HouseWallType);
                prospectClientHouseDetailToUpdate.setHouse_flooring_detail(req.body.HouseFlooringDetails);
                prospectClientHouseDetailToUpdate.setHouse_room_detail(req.body.houseroom);
                prospectClientHouseDetailToUpdate.setVehicle_details(req.body.vehicles);
                prospectClientHouseDetailToUpdate.setHouse_toilet(req.body.HouseToilet);
                var clientIdArray = new Array();
                clientIdArray = req.body.cl;
                fieldVerificationObj.setClient_id(req.body.cl);
                fieldVerificationObj.setClientAddressProofId(req.body.clientProof);
                fieldVerificationObj.setClientProofId(req.body.ID_Proof);
                fieldVerificationObj.setGuarantorAddressProofId(req.body.guarantor_addproof);
                fieldVerificationObj.setGuarantorProofId(req.body.id_guarantorproof);
                var remarksarr = new Array();
                remarksarr = req.body.remarks;
                fieldVerificationObj.setRemarks(req.body.remarks);
                fieldVerificationObj.setLoanCounter(req.body.loanCounter);
                var client_name = req.body.clientName;
                var errorfield = "";
                self.insertFieldVerificationDetailsCall(fieldVerificationObj,prospectClientHouseDetailToUpdate,function(groupid,status_name){
                    var activityDetails = new Array(iklantPort, req.session.tenantId, req.session.userId, req.session.userName, req.originalUrl, req.connection.remoteAddress, "router.js", "insertFieldVerifiedDetails", "success", "Field Verification", "FieldVerifiedDetails Saved successfully","insert");
                    self.insertActivityLogModel(activityDetails);
                    var data = {};
                    data.userId = userId;
                    data.tenantId = tenantId;
                    data.contactNumber = userContactNumber;
                    data.taskDescription = "Field Verification ("+client_name+")";
                    self.retrieveClientListAfter(groupid,function(thisclientId,clientNameArray,groupName,clientIdArray,prospectClientPersonalObj,prospectClientGuarantorObj,prospectClientHouseDetailObj,prospectClientBankDetailObj,loanCounter){
                        if(clientIdArray.length > 0){
                            self.lookUpEntityCall(function(lookupEntityObj){
                                self.retrieveDocTypeList(tenantId,function(docTypeIdArray,docTypeNameArray){
                                    self.listClients(req,res,thisclientId,clientNameArray,groupName,clientIdArray,prospectClientPersonalObj,prospectClientGuarantorObj,prospectClientHouseDetailObj,prospectClientBankDetailObj,lookupEntityObj,docTypeIdArray,docTypeNameArray,errorfield,"","",loanCounter);
                                });
                            });
                        }
                        else{
                            self.listGroupsforFieldVerification(req,res,status_name);
                        }
                    });
                });
            }
        }catch(e){
            customlog.error("Exception while insert Field verification "+e);
            self.commonRouter.showErrorPage(req,res);
        }
    },

    listGroupsforFieldVerification: function(req, res, status_name) {
        try{
            var self = this;
            var constantsObj = this.constants;
            var tenantId = req.session.tenantId;
            var userId = req.session.userId;
            var officeId = req.session.officeId;
            var roleId = req.session.roleId;
            operationNameArray = req.session.operationName;
            operationIdArray = req.session.operationId;
            self.ListGroupsCall(tenantId,userId,officeId,roleId,constantsObj.getFieldVerificationOperationId(),function(listGroupsIdArray,listGroupsArray,activeClients,neededInfo,isSynchronized,listGroupsGlobalNumberArray,fieldOfficerName){
                self.showListGroupsOperations(req, res,constantsObj.getFieldVerificationOperationId(),listGroupsIdArray,listGroupsArray,activeClients,neededInfo,isSynchronized,listGroupsGlobalNumberArray,fieldOfficerName);
            });
        }catch(e){
            customlog.error("Exception While list groups for field verification "+e);
            self.commonRouter.showErrorPage(req,res);
        }
    },

    listClients : function(req,res,thisclientId,clientNameArray,groupName,clientIdArray,prospectClientPersonalObj,prospectClientGuarantorObj,prospectClientHouseDetailObj,prospectClientBankDetailObj,lookupEntityObj,docTypeIdArray,docTypeNameArray,errorfield,fileLocation,docId,loanCounter) {
        try{
            var self = this;
            if(req.session.browser == "mobile") {
                res.render('Mobile/fieldVerificationFormMobile', { thisclientId : thisclientId,thisclient_name:"", clientNameArray: clientNameArray, groupName: groupName, clientIdArray: clientIdArray, prospectClientPersonalObj : prospectClientPersonalObj, prospectClientGuarantorObj : prospectClientGuarantorObj, prospectClientHouseDetailObj : prospectClientHouseDetailObj, prospectClientBankDetailObj : prospectClientBankDetailObj, lookupEntityObj : lookupEntityObj,docTypeIdArray:docTypeIdArray,docTypeNameArray:docTypeNameArray,errorfield:errorfield,fileLocation:fileLocation,docId:docId, contextPath:props.contextPath,loanCounter:loanCounter});
            }
            else {
                res.render('fieldverificationform', { thisclientId : thisclientId,thisclient_name:"", clientNameArray: clientNameArray, groupName: groupName, clientIdArray: clientIdArray, prospectClientPersonalObj : prospectClientPersonalObj, prospectClientGuarantorObj : prospectClientGuarantorObj, prospectClientHouseDetailObj : prospectClientHouseDetailObj, prospectClientBankDetailObj : prospectClientBankDetailObj, lookupEntityObj : lookupEntityObj,docTypeIdArray:docTypeIdArray,docTypeNameArray:docTypeNameArray,errorfield:errorfield,fileLocation:fileLocation,docId:docId, contextPath:props.contextPath,loanCounter:loanCounter});
            }
        }catch(e){
            customlog.error("Exception While list clients "+e);
            self.commonRouter.showErrorPage(req,res);
        }
    },

    retrieveClientListAfter: function(groupid,callback) {
        this.model.getClientNamesAfterModel(groupid,callback);
    },

    retrieveDocTypeList : function(tenantId,callback){
        this.model.retrieveDocTypeListModel(tenantId,callback);
    },

    submitTaskService : function(req,res,data) {
        try{
            var self = this;
            var http = require('http');
            var options = {
                host: mifosServiceIP,
                port: GPSPort,
                path: "/gpstracking/savetask",
                method: 'POST',
                headers : {'Content-Type' : 'application/json'}
            };
            var req = http.request(options, function(res)
            {
                var output = '';
                customlog.info(options.host + ':' + res.statusCode);
                res.setEncoding('utf8');
                if(res.statusCode == 302){
                    customlog.info("status code : " + res.statusCode);
                }
                else{
                    res.on('data', function (chunk) {
                        customlog.info("Chunk:"+chunk);
                        output += chunk;
                    });
                    res.on('end', function() {
                        var obj = eval("(" + output + ")");
                        customlog.info("status code inside end : " + res.statusCode);
                    });
                }
            });
            req.on('error', function(err) {
                customlog.info('error: ' + err.message);
            });
            req.write(JSON.stringify(data));
            req.end();
        }catch(e){
            customlog.error("Exception while Submit task service "+e);
            self.commonRouter.showErrorPage(req,res);
        }
    },

    ccaCall1 : function(tenantId,groupId,callback) {
        this.model.ccaModel1(tenantId,groupId,callback)
    },

    showCcaSummary: function(res,groupId,unAppraisedClients,appraisedClientsObj,countOfRejectedClients,clientTotalWeightageRequired,errorfield,clientId,fileLocation,docId,constantsObj,roleId) {
        var constantsObj = this.constants;
        res.render('cca1', {groupId:groupId, unAppraisedClients:unAppraisedClients,appraisedClientsObj :appraisedClientsObj,countOfRejectedClients : countOfRejectedClients,clientTotalWeightageRequired:clientTotalWeightageRequired, errorfield : errorfield,clientId:clientId,fileLocation:fileLocation,docId:docId, contextPath:props.contextPath,constantsObj:constantsObj,roleId:roleId});
    },

    retrieveIdleClientsCall : function(tenantId, groupId, statusId, callback){
        this.model.retrieveIdleClientsModel(tenantId, groupId, statusId, callback)
    },

    rejectedClientDetailsCall : function(tenantId,clientId,callback){
        this.model.rejectedClientDetailsModel(tenantId,clientId,callback);
    },

    showRejectedClientDetails : function(req,res,groupId,clientId,client_global_number,client_name,client_status_desc,client_status_id,group_status_id,group_name,center_name,docTypeIdArray,docTypeNameArray, officeId, statusMessage,remarks, remarksForRejection) {
        try{
            var constantsObj = this.constants;
            res.render('reintiateClient', {groupId:groupId, clientId:clientId, client_global_number:client_global_number,
                client_name:client_name, client_status_desc:client_status_desc,
                client_status_id:client_status_id, group_status_id:group_status_id,
                group_name:group_name, center_name:center_name,constantsObj:constantsObj,
                docTypeIdArray : docTypeIdArray,docTypeNameArray : docTypeNameArray,
                roleId:req.session.roleId, officeId: officeId, statusMessage: statusMessage,
                remarks:remarks, remarksForRejection: remarksForRejection, contextPath:props.contextPath});
        }catch(e){
            customlog.error("Exception while Show rejected client details "+e);
            self.commonRouter.showErrorPage(req,res);
        }
    },

    showIdleClientsSummary: function(req,res,groupId,unAppraisedClients,appraisedClientsObj,countOfRejectedClients,clientId,clientTotalWeightageRequired,errorfield,fileLocation,docId, isIdle, noOfIdleDays, lastCreditCheckDate,statusId){
        var constantsObj = this.constants;
        res.render('cca1', {groupId:groupId, unAppraisedClients:unAppraisedClients,appraisedClientsObj :appraisedClientsObj,countOfRejectedClients : countOfRejectedClients,
            clientTotalWeightageRequired:clientTotalWeightageRequired, errorfield : errorfield,clientId:clientId,fileLocation:fileLocation,docId:docId, contextPath:props.contextPath,
            isIdle: isIdle, noOfIdleDays: noOfIdleDays, lastCreditCheckDate: lastCreditCheckDate, statusId: statusId,roleId:req.session.roleId,constantsObj:constantsObj});
    },

    needClarificationDetailsCall : function(clientId,remarks,callback) {
        this.model.needClarificationDetailsModel(clientId,remarks,callback);
    },

    groupAuthorizationClientCalculationCall : function(tenantId,groupId,callback) {
        this.model.groupAuthorizationClientCalculationModel(tenantId,groupId,callback)
    },

    clientListCall: function(groupId,callback) {
        this.model.getClientNamesModel(groupId,callback);
    },

    lookUpEntityCall : function(callback){
        this.model.retrieveLookUpIdModel(callback);
    },

    insertActivityLogModel: function(activityDetails) {
        this.model.insertActivityLogModel(activityDetails);
    },

    retrieveFieldVerificationDetailsCall : function(clientId,callback) {
        this.model.getFieldVerificationDetailsModel(clientId,callback);
    },

    showFieldVerificationDetails : function(req,res,thisclientId,client_name,clientNameArray,groupName,clientIdArray,prospectClientPersonalObj,prospectClientGuarantorObj,prospectClientHouseDetailObj,prospectClientBankDetailObj,lookupEntityObj,docTypeIdArray,docTypeNameArray,errorfield,fileLocation,docId,loanCounter) {
        try{
            var self = this;
            if(req.session.browser == "mobile") {
                res.render('Mobile/fieldVerificationFormMobile', { thisclientId: thisclientId, thisclient_name:client_name, clientNameArray : clientNameArray, groupName : groupName , clientIdArray : clientIdArray, prospectClientPersonalObj : prospectClientPersonalObj, prospectClientGuarantorObj : prospectClientGuarantorObj, prospectClientHouseDetailObj : prospectClientHouseDetailObj, prospectClientBankDetailObj : prospectClientBankDetailObj, lookupEntityObj : lookupEntityObj,docTypeIdArray:docTypeIdArray,docTypeNameArray:docTypeNameArray,errorfield:errorfield,fileLocation:fileLocation,docId:docId, contextPath:props.contextPath,loanCounter:loanCounter});
            }
            else {
                res.render('fieldverificationform', { thisclientId: thisclientId, thisclient_name:client_name, clientNameArray : clientNameArray, groupName : groupName , clientIdArray : clientIdArray, prospectClientPersonalObj : prospectClientPersonalObj, prospectClientGuarantorObj : prospectClientGuarantorObj, prospectClientHouseDetailObj : prospectClientHouseDetailObj, prospectClientBankDetailObj : prospectClientBankDetailObj, lookupEntityObj : lookupEntityObj,docTypeIdArray:docTypeIdArray,docTypeNameArray:docTypeNameArray,errorfield:errorfield,fileLocation:fileLocation,docId:docId, contextPath:props.contextPath,loanCounter:loanCounter});
            }
        }catch(e){
            customlog.error("Exception while show field verification details "+e);
            self.showErrorPage(req,res);
        }
    },

    groupDetailsAuthorizationCall: function(tenantId,branchId,groupId,clientId,callback) {
        this.model.groupDetailsAuthorizationModel(tenantId,branchId,groupId,clientId,callback);
    },

    showGroupDetailsForAuthorization: function(req,res,branchId,groupId,prosGroupObj,preliminaryVerificationObj,unAppraisedClients,appraisedClientsObj,clientTotalWeightageRequired,capturedImageArray,docTypeIdArray,clientId,fileLocation,selectedDocTypeId,errorfield,grtRating) {
        res.render('GroupAuthorization', { branchId : branchId,groupId:groupId, prosGroupObj:prosGroupObj, preliminaryVerificationObj:preliminaryVerificationObj,
            appraisedClientsObj:appraisedClientsObj,clientTotalWeightageRequired:clientTotalWeightageRequired,capturedImageArray:capturedImageArray,docTypeIdArray:docTypeIdArray, clientId:clientId,fileLocation:fileLocation, selectedDocTypeId:selectedDocTypeId, errorfield : errorfield, grtRating: grtRating, contextPath:props.contextPath});
    },

    listQuestionsCCACall: function(tenantId,clientId,clientLoanCount,callback) {
        this.model.listQuestionsCCACallModel(tenantId,clientId,clientLoanCount,callback);
    },

    //Adarsh-Modified
    showCCAQuestions: function(req, res,groupId,selectedOfficeId,redirectValue,clientId,clientName,centerName,clientRatingPerc,clientTotalWeightage,clientTotalWeightageRequired,questionsObj,choicesanswerObj,choicesObj,capturedImageArray,docTypeIdArray,errorfield,clientLoanCount,statusId) {
        var constantsObj = this.constants;
        res.render('cca2', {groupId:groupId,selectedOfficeId:selectedOfficeId,clientId:clientId,
            redirectValue:redirectValue,clientName:clientName,centerName:centerName,
            clientRatingPerc:clientRatingPerc,clientTotalWeightage:clientTotalWeightage,
            clientTotalWeightageRequired:clientTotalWeightageRequired,questionsObj: questionsObj,
            choicesanswerObj: choicesanswerObj,choicesObj:choicesObj,capturedImageArray:capturedImageArray,clientLoanCount:clientLoanCount,
            docTypeIdArray:docTypeIdArray,errorfield:errorfield,constantsObj:constantsObj, contextPath:props.contextPath,statusId:statusId});
    }

}
// Added by Ezra Johnson and Ashok
 function writeHeaderForLoanSchedulePDF(loanScheduleResult,subLeaderName,group_code, doc, longLines, vLineStart_Y, tableHeadValue_Y,bcOfficeId) {
     var leftSignature = "Branch Manager Signature";
     var rightSignature = "Client Signature";
     var middleSignature = "Field Officer Signature";
     if(bcOfficeId==1){
         doc.font('fonts/times.ttf').fontSize(12).text(props.tenantCompanyName, 280, 20);
         doc.font('fonts/times.ttf').fontSize(10).text(props.tenantCompanyFKAName, 250, 32);
         //doc.font('fonts/times.ttf').fontSize(12).text('APEX ABISHEK FINANCE LIMITED', 280, 20);
     }else if(bcOfficeId==2){
         doc.font('fonts/times.ttf').fontSize(12).text(props.tenantBcCompanyName, 280, 20);
     }
     doc.font('fonts/times.ttf');
     // write page head data
     doc.fontSize(11).text("Group Code : ",50,65);
     doc.fontSize(11).text("Group Name  : ",250,65);
     doc.fontSize(11).text("Rate of Interest: ", 500,65);
     doc.fontSize(11).text("Branch         : ",50,85);
     doc.fontSize(11).text("Loan Amount : ",250,85);
     doc.fontSize(11).text("Disb. date      : ",250,103);
     if(loanScheduleResult.group_type=='client') {
         doc.fontSize(11).text("Client Name : ", 500,85);
         doc.fontSize(11).text("Sub Leader Name : ", 50,103);
         doc.fontSize(11).text("Client Code : ", 480,103);
         if(loanScheduleResult.client_name.length > 17) {
             var firstLineStr = loanScheduleResult.client_name.substring(0, 17);
             var secondLineStr = loanScheduleResult.client_name.substring(17, 34);
             doc.font('fonts/times.ttf').fontSize(10).text(firstLineStr,565,86);
             doc.font('fonts/times.ttf').fontSize(10).text('-'+secondLineStr,565,102);
         }else{
             doc.font('fonts/times.ttf').fontSize(10).text(loanScheduleResult.client_name,565,86);
         }
         doc.font('fonts/times.ttf').fontSize(10).text(subLeaderName,135,104);
         doc.font('fonts/times.ttf').fontSize(10).text(loanScheduleResult.group_code,545,104);
         doc.font('fonts/times.ttf')
             .fontSize(11)
             .text('Client Installment Schedule', 310, 45);
         doc.fontSize(11).text("Phone : ",610,103);
         doc.fontSize(10).text(loanScheduleResult.phone_number,645,103);
     }
     else {
         doc.fontSize(11).text("Leader Name : ",50,103);
         doc.font('fonts/times.ttf')
             .fontSize(11)
             .text('Group Installment Schedule', 310, 45);
         rightSignature = "Group Leader Signature";
         doc.font('fonts/times.ttf').fontSize(10).text(subLeaderName,118,104);
     }
     doc.font('fonts/times.ttf').fontSize(10).text(group_code,120,66);
     doc.fontSize(10).text(loanScheduleResult.group_name,320,66);

     if(loanScheduleResult.office.length > 20) {
         firstLineStr = loanScheduleResult.office.substring(0, 20);
         secondLineStr = loanScheduleResult.office.substring(20, 40);
         doc.fontSize(10).text(firstLineStr,115,86);
         doc.fontSize(10).text('-'+secondLineStr,115,102);
     }else{
         doc.fontSize(10).text(loanScheduleResult.office,115,86);
     }
     doc.fontSize(10).text(loanScheduleResult.loan_amount,320,86);
     doc.fontSize(10).text(loanScheduleResult.disb_date,320,104);
     doc.fontSize(11).text(loanScheduleResult.interest_rate+"%", 580,65);



     var len=10;
     var photoPosition = 640;
     var error = "false";
     //fix to avoid empty images
     try {
         doc.image(loanScheduleResult.customer_photo, photoPosition, len, {fit: [125, 125]}).stroke();
     }
     catch (e) { //catches "Unknown image format" Error
         error = "true";
         customlog.info("caught exception: " + e);
     }
     if (error == "false")
         photoPosition = photoPosition + 90;
     len+=175;

     //draw the first row (table head)
     doc.font('fonts/times.ttf').fontSize(10).text(longLines,42.4, 106.5);
     doc.font('fonts/times.ttf').fontSize(17).text("|",41,vLineStart_Y);
     doc.font('fonts/times.ttf').fontSize(9).text(" Installment No ",43,tableHeadValue_Y);
     doc.font('fonts/times.ttf').fontSize(17).text("|",108,vLineStart_Y);
     doc.font('fonts/times.ttf').fontSize(9).text("Due Date",116,tableHeadValue_Y);
     doc.font('fonts/times.ttf').fontSize(17).text("|",170,vLineStart_Y);
     doc.font('fonts/times.ttf').fontSize(9).text("Principal Demand",177,tableHeadValue_Y);
     doc.font('fonts/times.ttf').fontSize(17).text("|",252,vLineStart_Y);
     doc.font('fonts/times.ttf').fontSize(9).text("Interest Demand",257,tableHeadValue_Y);
     doc.font('fonts/times.ttf').fontSize(17).text("|",325,vLineStart_Y);
     doc.font('fonts/times.ttf').fontSize(9).text("Total Demand",332,tableHeadValue_Y);
     doc.font('fonts/times.ttf').fontSize(17).text("|",392,vLineStart_Y);
     doc.font('fonts/times.ttf').fontSize(9).text("Paid Date",400,tableHeadValue_Y);
     doc.font('fonts/times.ttf').fontSize(17).text("|",444,vLineStart_Y);
     doc.font('fonts/times.ttf').fontSize(9).text("Principal Paid",451,tableHeadValue_Y);
     doc.font('fonts/times.ttf').fontSize(17).text("|",510,vLineStart_Y);
     doc.font('fonts/times.ttf').fontSize(9).text("Interest Paid",513,tableHeadValue_Y);
     doc.font('fonts/times.ttf').fontSize(17).text("|",562,vLineStart_Y);
     doc.font('fonts/times.ttf').fontSize(9).text("Total Paid",568,tableHeadValue_Y);
     doc.font('fonts/times.ttf').fontSize(17).text("|",609,vLineStart_Y);
     doc.font('fonts/times.ttf').fontSize(9).text("Customer Sign",617,tableHeadValue_Y);
     doc.font('fonts/times.ttf').fontSize(17).text("|",675,vLineStart_Y);
     doc.font('fonts/times.ttf').fontSize(9).text("FO Sign",684,tableHeadValue_Y);
     doc.font('fonts/times.ttf').fontSize(17).text("|",720,vLineStart_Y);
     doc.fontSize(10).text(longLines,42.4, 121.5);
     doc.font('fonts/times.ttf').fontSize(11).text(leftSignature,55,565);
     doc.font('fonts/times.ttf').fontSize(11).text(middleSignature,332,565);
     doc.font('fonts/times.ttf').fontSize(11).text(rightSignature,609,565);
 }
// Added by Ezra Johnson and Ashok
function writeRowsForLoanSchedulePDF(loanScheduleResult, doc, vLine, vLineForTableData, longLines, line) {
    //write the first line of the page
    doc.font('fonts/times.ttf').fontSize(17).text("|",41,vLine);
    doc.fontSize(9).text(loanScheduleResult.installment_id,70,vLineForTableData);
    doc.font('fonts/times.ttf').fontSize(17).text("|",108,vLine);
    doc.fontSize(9).text(loanScheduleResult.due_date,116,vLineForTableData);
    doc.font('fonts/times.ttf').fontSize(17).text("|",170,vLine);
    doc.fontSize(9).text(loanScheduleResult.principal_demd,200,vLineForTableData);
    doc.font('fonts/times.ttf').fontSize(17).text("|",252,vLine);
    doc.fontSize(9).text(loanScheduleResult.interest_demd,280,vLineForTableData);
    doc.font('fonts/times.ttf').fontSize(17).text("|",325,vLine);
    doc.fontSize(9).text(loanScheduleResult.total_demd,350,vLineForTableData);
    doc.font('fonts/times.ttf').fontSize(17).text("|",392,vLine);
    doc.fontSize(9).text("",400,vLineForTableData);
    doc.font('fonts/times.ttf').fontSize(17).text("|",444,vLine);
    doc.fontSize(9).text("",451,vLineForTableData);
    doc.font('fonts/times.ttf').fontSize(17).text("|",510,vLine);
    doc.fontSize(9).text("",517,vLineForTableData);
    doc.font('fonts/times.ttf').fontSize(17).text("|",562,vLine);
    doc.fontSize(9).text("",568,vLineForTableData);
    doc.font('fonts/times.ttf').fontSize(17).text("|",609,vLine);
    doc.fontSize(9).text("",617,vLineForTableData);
    doc.font('fonts/times.ttf').fontSize(17).text("|",675,vLine);
    doc.fontSize(9).text("",684,vLineForTableData);
    doc.font('fonts/times.ttf').fontSize(17).text("|",720,vLine);
    doc.fontSize(10).text(longLines,42.4, line);
}

function writeHeaderForLoanScheduleFeesPDF(loanScheduleResult,subLeaderName,group_code, doc, longLines, vLineStart_Y, tableHeadValue_Y,bcOfficeId) {
    var leftSignature = "Branch Manager Signature";
    var rightSignature = "Client Signature";
    var middleSignature = "Field Officer Signature";
    if(bcOfficeId==1){
        doc.font('fonts/times.ttf').fontSize(12).text(props.tenantCompanyName, 280, 20);
        doc.font('fonts/times.ttf').fontSize(10).text(props.tenantCompanyFKAName, 250, 32);
        //doc.font('fonts/times.ttf').fontSize(12).text('APEX ABISHEK FINANCE LIMITED', 280, 20);
    }else if(bcOfficeId==2){
        doc.font('fonts/times.ttf').fontSize(12).text(props.tenantBcCompanyName, 280, 20);
    }
    doc.font('fonts/times.ttf');
    // write page head data
    doc.fontSize(11).text("Group Code : ",50,65);
    doc.fontSize(11).text("Group Name  : ",250,65);
    doc.fontSize(11).text("Rate of Interest: ", 550,65);
    doc.fontSize(11).text("Branch         : ",50,85);
    doc.fontSize(11).text("Loan Amount : ",250,85);
    doc.fontSize(11).text("Disb. date : ",400,85);
    if(loanScheduleResult.group_type=='client') {
        doc.font('fonts/times.ttf')
            .fontSize(11)
            .text('Client Fees Schedule', 310, 45);
    }
    else {
        doc.fontSize(11).text("Leader Name : ",50,103);
        doc.font('fonts/times.ttf')
            .fontSize(11)
            .text('Group Installment Schedule', 310, 45);
        rightSignature = "Group Leader Signature";
        doc.font('fonts/times.ttf').fontSize(10).text(subLeaderName,118,104);
    }
    doc.font('fonts/times.ttf').fontSize(10).text(group_code,120,66);
    doc.fontSize(10).text(loanScheduleResult.group_name,320,66);

    if(loanScheduleResult.office.length > 20) {
        firstLineStr = loanScheduleResult.office.substring(0, 20);
        secondLineStr = loanScheduleResult.office.substring(20, 40);
        doc.fontSize(10).text(firstLineStr,115,86);
        doc.fontSize(10).text('-'+secondLineStr,115,102);
    }else{
        doc.fontSize(10).text(loanScheduleResult.office,115,86);
    }
    doc.fontSize(10).text(loanScheduleResult.loan_amount,320,86);
    doc.fontSize(10).text(loanScheduleResult.disb_date,455,86);
    doc.fontSize(11).text(loanScheduleResult.interest_rate+"%", 630,65);

    //draw the first row (table head)
    doc.font('fonts/times.ttf').fontSize(10).text(longLines,42.4, 106.5);
    doc.font('fonts/times.ttf').fontSize(17).text("|",41,vLineStart_Y);
    doc.font('fonts/times.ttf').fontSize(9).text(" S. No ",43,tableHeadValue_Y);
    doc.font('fonts/times.ttf').fontSize(17).text("|",80,vLineStart_Y);
    doc.font('fonts/times.ttf').fontSize(9).text(" Member Name ",90,tableHeadValue_Y);
    doc.font('fonts/times.ttf').fontSize(17).text("|",180,vLineStart_Y);
    doc.font('fonts/times.ttf').fontSize(9).text("Age",190,tableHeadValue_Y);
    doc.font('fonts/times.ttf').fontSize(17).text("|",210,vLineStart_Y);
    doc.font('fonts/times.ttf').fontSize(9).text("Insurance-I",215,tableHeadValue_Y);
    doc.font('fonts/times.ttf').fontSize(17).text("|",260,vLineStart_Y);
    doc.font('fonts/times.ttf').fontSize(9).text("Tax-I",265,tableHeadValue_Y);
    doc.font('fonts/times.ttf').fontSize(17).text("|",290,vLineStart_Y);
    doc.font('fonts/times.ttf').fontSize(9).text("Insurance-II",295,tableHeadValue_Y);
    doc.font('fonts/times.ttf').fontSize(17).text("|",340,vLineStart_Y);
    doc.font('fonts/times.ttf').fontSize(9).text("Tax-II",350,tableHeadValue_Y);
    doc.font('fonts/times.ttf').fontSize(17).text("|",380,vLineStart_Y);
    doc.font('fonts/times.ttf').fontSize(9).text("Gu-I",385,tableHeadValue_Y);
    doc.font('fonts/times.ttf').fontSize(17).text("|",412,vLineStart_Y);
    doc.font('fonts/times.ttf').fontSize(9).text("GuTax-I",420,tableHeadValue_Y);
    doc.font('fonts/times.ttf').fontSize(17).text("|",455,vLineStart_Y);
    doc.font('fonts/times.ttf').fontSize(9).text("Gu-II",460,tableHeadValue_Y);
    doc.font('fonts/times.ttf').fontSize(17).text("|",490,vLineStart_Y);
    doc.font('fonts/times.ttf').fontSize(9).text("GuTax-II",495,tableHeadValue_Y);
    doc.font('fonts/times.ttf').fontSize(17).text("|",530,vLineStart_Y);
    doc.font('fonts/times.ttf').fontSize(9).text("DocCharges",540,tableHeadValue_Y);
    doc.font('fonts/times.ttf').fontSize(17).text("|",590,vLineStart_Y);
    doc.font('fonts/times.ttf').fontSize(9).text("Tax",610,tableHeadValue_Y);
    doc.font('fonts/times.ttf').fontSize(17).text("|",640,vLineStart_Y);
    doc.font('fonts/times.ttf').fontSize(9).text("Total",663,tableHeadValue_Y);
    doc.font('fonts/times.ttf').fontSize(17).text("|",720,vLineStart_Y);
    doc.fontSize(10).text(longLines,42.4, 121.5);
}


function writeRowsForLoanScheduleFeesPDF(sno,clt_name,clt_Age,premiumClientAmount,premiumClientServiceAmount,premiumClientAmountSecond,premiumClientServiceAmountSecond,premiumClientAmountGuarantor,premiumClientServiceAmountGuarantor,premiumClientAmountGuarantorSecond,premiumClientServiceAmountGuarantorSecond,documentClientAmount,documentClientServiceAmount,sumAssured, doc, vLine, vLineForTableData, longLines, line) {
    //write the first line of the page
    doc.font('fonts/times.ttf').fontSize(17).text("|", 41, vLine);
    doc.fontSize(9).text(sno, 43, vLineForTableData);
    doc.font('fonts/times.ttf').fontSize(17).text("|", 80, vLine);
    doc.fontSize(9).text(clt_name, 90, vLineForTableData);
    doc.font('fonts/times.ttf').fontSize(17).text("|", 180, vLine);
    doc.fontSize(9).text(clt_Age, 195, vLineForTableData);
    doc.font('fonts/times.ttf').fontSize(17).text("|", 210, vLine);
    doc.fontSize(9).text(premiumClientAmount, 215, vLineForTableData);
    doc.font('fonts/times.ttf').fontSize(17).text("|", 260, vLine);
    doc.fontSize(9).text(premiumClientServiceAmount, 265, vLineForTableData);
    doc.font('fonts/times.ttf').fontSize(17).text("|", 290, vLine);
    doc.font('fonts/times.ttf').fontSize(9).text(premiumClientAmountSecond,295,vLineForTableData);
    doc.font('fonts/times.ttf').fontSize(17).text("|",340,vLine);
    doc.font('fonts/times.ttf').fontSize(9).text(premiumClientServiceAmountSecond,350,vLineForTableData);
    doc.font('fonts/times.ttf').fontSize(17).text("|",380,vLine);
    doc.font('fonts/times.ttf').fontSize(9).text(premiumClientAmountGuarantor,385,vLineForTableData);
    doc.font('fonts/times.ttf').fontSize(17).text("|",412,vLine);
    doc.font('fonts/times.ttf').fontSize(9).text(premiumClientServiceAmountGuarantor,420,vLineForTableData);
    doc.font('fonts/times.ttf').fontSize(17).text("|",455,vLine);
    doc.font('fonts/times.ttf').fontSize(9).text(premiumClientAmountGuarantorSecond,460,vLineForTableData);
    doc.font('fonts/times.ttf').fontSize(17).text("|",490,vLine);
    doc.font('fonts/times.ttf').fontSize(9).text(premiumClientServiceAmountGuarantorSecond,495,vLineForTableData);
    doc.font('fonts/times.ttf').fontSize(17).text("|",530,vLine);
    doc.fontSize(9).text(documentClientAmount, 540, vLineForTableData);
    doc.font('fonts/times.ttf').fontSize(17).text("|", 590, vLine);
    doc.fontSize(9).text(documentClientServiceAmount, 610, vLineForTableData);
    doc.font('fonts/times.ttf').fontSize(17).text("|", 640, vLine);
    doc.fontSize(9).text(sumAssured, 663, vLineForTableData);
    doc.font('fonts/times.ttf').fontSize(17).text("|", 720, vLine);
    doc.fontSize(10).text(longLines, 42.4, line);
}

function writeTotal(total, insuranceTotalFirst,insuranceServiceFirst,insuranceTotalSecond,insuranceServiceSecond,insuranceTotalGuarantorFirst,insuranceServiceGuarantorFirst,insuranceTotalGuarantorSecond,insuranceServiceGuarantorSecond,docTotal,docServiceTotal, doc, vLine, vLineForTableData, longLines, line) {
    doc.font('fonts/times.ttf').fontSize(17).text("|", 41, vLine);
    doc.fontSize(9).text("", 43, vLineForTableData);
    //doc.font('fonts/times.ttf').fontSize(17).text("|", 80, vLine);
    doc.fontSize(12).text("Total:", 100, vLineForTableData);
    //doc.font('fonts/times.ttf').fontSize(17).text("|", 180, vLine);
    doc.fontSize(9).text("", 120, vLineForTableData);
    doc.font('fonts/times.ttf').fontSize(17).text("|", 210, vLine);
    doc.fontSize(11).text(insuranceTotalFirst, 215, vLineForTableData);
    doc.font('fonts/times.ttf').fontSize(17).text("|", 260, vLine);
    doc.fontSize(11).text(insuranceServiceFirst, 265, vLineForTableData);
    doc.font('fonts/times.ttf').fontSize(17).text("|", 290, vLine);
    doc.fontSize(11).text(insuranceTotalSecond, 295, vLineForTableData);
    doc.font('fonts/times.ttf').fontSize(17).text("|", 340, vLine);
    doc.fontSize(11).text(insuranceServiceSecond, 350, vLineForTableData);
    doc.font('fonts/times.ttf').fontSize(17).text("|", 380, vLine);
    doc.fontSize(11).text(insuranceTotalGuarantorFirst, 385, vLineForTableData);
    doc.font('fonts/times.ttf').fontSize(17).text("|", 412, vLine);
    doc.fontSize(11).text(insuranceServiceGuarantorFirst, 420, vLineForTableData);
    doc.font('fonts/times.ttf').fontSize(17).text("|", 455, vLine);
    doc.fontSize(11).text(insuranceTotalGuarantorSecond, 460, vLineForTableData);
    doc.font('fonts/times.ttf').fontSize(17).text("|", 490, vLine);
    doc.fontSize(11).text(insuranceServiceGuarantorSecond, 495, vLineForTableData);
    doc.font('fonts/times.ttf').fontSize(17).text("|", 530, vLine);
    doc.fontSize(11).text(docTotal, 540, vLineForTableData);
    doc.font('fonts/times.ttf').fontSize(17).text("|", 590, vLine);
    doc.fontSize(11).text(docServiceTotal, 610, vLineForTableData);
    doc.font('fonts/times.ttf').fontSize(17).text("|", 640, vLine);
    doc.fontSize(11).text(total, 663, vLineForTableData);
    doc.font('fonts/times.ttf').fontSize(17).text("|", 720, vLine);
    doc.fontSize(10).text(longLines, 42.4, line);
}
function generatePromissoryNoteInTamil(result,disbDateStr,disbMonth,groupId,month,bcOfficeId){
    //var ClientPromissoryNoteDto = require(domainPath +"/ClientPromissoryNoteDto");
    var doc = new PDFDocument({
        size: 'B5'
    });
    for(var i =0; i<result.clientDetails.length; i++){
        /*var ClientPromissoryNoteDtoDetail = new ClientPromissoryNoteDto();
         this.ClientPromissoryNoteDtoDetail = ClientPromissoryNoteDtoDetail;
         var ClientPromissoryNoteDtoDetail = this.ClientPromissoryNoteDtoDetail;
         ClientPromissoryNoteDtoDetail.setClientName(result.clientDetails[i].clientName);
         ClientPromissoryNoteDtoDetail.setRelationshipName(result.clientDetails[i].relationshipName);
         ClientPromissoryNoteDtoDetail.setClientAge(result.clientDetails[i].clientAge);
         ClientPromissoryNoteDtoDetail.setClientAddress(result.clientDetails[i].clientAddress);
         ClientPromissoryNoteDtoDetail.setOfficeName(result.clientDetails[i].officeName);
         ClientPromissoryNoteDtoDetail.setLoanAmount(result.clientDetails[i].loanAmount);
         ClientPromissoryNoteDtoDetail.setInstallment(result.clientDetails[i].installment);
         ClientPromissoryNoteDtoDetail.setInterest(result.clientDetails[i].interest);*/
        if(i!=0){
            doc.addPage({
                size: 'B5'
            });
        }
        doc.font('Times-Roman').fontSize(11).text('AAMF - 4',410,40);
        apextam='gpuhkprhp nehl;L';
        doc.font('fonts/Amudham.ttf').fontSize(24).text(apextam,180,55);
        apextam='........................Mk; tUlk;................................khjk;......................Mk; njjp.............................................................khtl;lk;';
        doc.font('fonts/Amudham.ttf').fontSize(13.5).text(apextam,40,110);
        doc.font('Times-Roman').fontSize(11).text(disbDateStr.getFullYear(),52,110);
        doc.font('Times-Roman').fontSize(11).text(month[disbDateStr.getMonth()],148,110);
        doc.font('Times-Roman').fontSize(11).text(disbDateStr.getDate(),235,110);
        apextam='..................................................................................jhYf;fh fjt[ vz;.........................................................................................................y;';
        doc.font('fonts/Amudham.ttf').fontSize(13.5).text(apextam,40,135);
        apextam='trpf;Fk;.................................................................................................................................................................f_bg.................................................';
        doc.font('fonts/Amudham.ttf').fontSize(13.5).text(apextam,40,160);
        doc.font('Times-Roman').fontSize(11).text(result.clientDetails[i].clientAddress,80,160);
        doc.font('Times-Roman').fontSize(11).text(result.clientDetails[i].clientName,372,160);
        if(bcOfficeId==1){
            apextam='vk@v!@vk@  ikf@nuhigdhd@!@  ypkpbll; epWtdj;jpw;F ';
        }else if(bcOfficeId==2){
            apextam='mdd@ah igdhd@!@ `ghh@ ,d@FYh!pt@ f@nuhj@ g@iuntl@ ypkpbll;  epWtdj;jpw;F ';
        }
        doc.font('fonts/Amudham.ttf').fontSize(13.5).text(apextam,40,185);
        apextam="vGjpf;bfhLj;j gpuhkprhp nehl;L / ehsJ njjpapy; ehd; j';fsplk;  bgw;Wf;bfhz;l ";
        doc.font('fonts/Amudham.ttf').fontSize(13.5).text(apextam,40,210);
        apextam='buhf;fk; U...........................................................(Ugha;..........................................................................................................................................';
        doc.font('fonts/Amudham.ttf').fontSize(13.5).text(apextam,40,235);
        doc.font('Times-Roman').fontSize(11).text(result.clientDetails[i].loanAmount,100,235);
        apextam='................................................................................................................................................................................................................................) kl;Lk;';
        doc.font('fonts/Amudham.ttf').fontSize(13.5).text(apextam,40,260);
        doc.font('Times-Roman').fontSize(11).text(result.clientDetails[i].loanAmountInWords,40,260);
        apextam='fld; bjhifia jtiz ml;ltizapy; Fwpg;gpl;Ls;sgo thu thuk; _ khj khjk; ';
        doc.font('fonts/Amudham.ttf').fontSize(13.5).text(apextam,40,285);
        doc.font('fonts/Amudham.ttf').fontSize(11).text("",97,285);
        apextam='_ gjpdhd;F ehl;fSf;F xU Kiw tNypf;fg;gLk; tUlj;jpw;F  ............................................................';
        doc.font('fonts/Amudham.ttf').fontSize(13.5).text(apextam,40,310);
        doc.font('Times-Roman').fontSize(11).text(Number(result.clientDetails[i].interest).toFixed(2)+'%',380,310);
        apextam="tl;oa[k; TLjyhFk; mry; kw;Wk; tl;oj; bjhifia jh';fs; ntz;Lk; nghJ j';fs";
        doc.font('fonts/Amudham.ttf').fontSize(13.5).text(apextam,40,335);
        apextam="-splkhtJ my;yJ j';fs; cj;jut[ bgw;wth;fsplkhtJ brYj;jp  igry; bra;J ,e;j ";
        doc.font('fonts/Amudham.ttf').fontSize(13.5).text(apextam,40,360);
        apextam='gpuhkprhp nehl;il thg!; bgw;Wf; bfhs;fpnwd;.';
        doc.font('fonts/Amudham.ttf').fontSize(13.5).text(apextam,40,385);
        doc.font('Times-Roman').fontSize(10).text('__________',365,425);
        doc.font('Times-Roman').fontSize(10).text('|',364,434);
        doc.font('Times-Roman').fontSize(10).text('|',364,443);
        doc.font('Times-Roman').fontSize(10).text('|',364,452);
        doc.font('Times-Roman').fontSize(10).text('|',364,461);
        doc.font('Times-Roman').fontSize(10).text('|',364,470);
        doc.font('Times-Roman').fontSize(10).text('|',414,434);
        doc.font('Times-Roman').fontSize(10).text('|',414,443);
        doc.font('Times-Roman').fontSize(10).text('|',414,452);
        doc.font('Times-Roman').fontSize(10).text('|',414,461);
        doc.font('Times-Roman').fontSize(10).text('|',414,470);
        doc.font('Times-Roman').fontSize(10).text('__________',365,470);
        apextam='cWg;gpdh; ifbahg;gk;';
        doc.font('fonts/Amudham.ttf').fontSize(13.5).text(apextam,335,490);
        doc.font('Times-Roman').fontSize(10).text('______________________',335,545);
        doc.font('Times-Roman').fontSize(10).text('|',334,554);
        doc.font('Times-Roman').fontSize(10).text('|',334,563);
        doc.font('Times-Roman').fontSize(10).text('|',334,572);
        doc.font('Times-Roman').fontSize(10).text('|',334,581);
        doc.font('Times-Roman').fontSize(10).text('|',334,590);
        doc.font('Times-Roman').fontSize(10).text('|',444,554);
        doc.font('Times-Roman').fontSize(10).text('|',444,563);
        doc.font('Times-Roman').fontSize(10).text('|',444,572);
        doc.font('Times-Roman').fontSize(10).text('|',444,581);
        doc.font('Times-Roman').fontSize(10).text('|',444,590);
        doc.font('Times-Roman').fontSize(10).text('______________________',335,590);
        apextam=',lJ if bgUtpuy;';
        doc.font('fonts/Amudham.ttf').fontSize(13.5).text(apextam,340,600);
        apextam='ifnuif';
        doc.font('fonts/Amudham.ttf').fontSize(13.5).text(apextam,370,615);
        apextam=',lk;';
        doc.font('fonts/Amudham.ttf').fontSize(13.5).text(apextam,40,450);
        doc.font('Times-Roman').fontSize(10).text(':',85,452);
        doc.font('Times-Roman').fontSize(10).text(result.clientDetails[i].officeName,90,452);
        apextam='njjp';
        doc.font('fonts/Amudham.ttf').fontSize(13.5).text(apextam,40,475);
        doc.font('Times-Roman').fontSize(10).text(':',85,477);
        doc.font('Times-Roman').fontSize(10).text(disbDateStr.getDate()+"/"+disbMonth+"/"+disbDateStr.getFullYear(),90,477);
        apextam='rhl;rpfs;';
        doc.font('fonts/Amudham.ttf').fontSize(13.5).text(apextam,40,500);
        doc.font('Times-Roman').fontSize(10).text(':',85,502);
        doc.font('Times-Roman').fontSize(10).text('1.',40,520);
        doc.font('Times-Roman').fontSize(10).text('2.',40,570);
        doc.addPage({
            size: 'B5'
        });
        doc.font('Times-Roman').fontSize(11).text('AAMF - 6',410,40);
        apextam='gpuhkprhp nehl;L';
        doc.font('fonts/Amudham.ttf').fontSize(24).text(apextam,180,55);
        apextam='.......................................Mk; tUlk;..................................................khjk;....................................Mk; njjp.........................................';
        doc.font('fonts/Amudham.ttf').fontSize(13.5).text(apextam,40,110);
        doc.font('Times-Roman').fontSize(11).text(disbDateStr.getFullYear(),62,110);
        doc.font('Times-Roman').fontSize(11).text(month[disbDateStr.getMonth()],188,110);
        doc.font('Times-Roman').fontSize(11).text(disbDateStr.getDate(),300,110);
        apextam='khtl;lk;........................................................................................jhYf;fh................................................................................................................';
        doc.font('fonts/Amudham.ttf').fontSize(13.5).text(apextam,40,135);
        apextam='.............................................................................................................................................................................vd;w Kfthpapy; trpf;Fk;';
        doc.font('fonts/Amudham.ttf').fontSize(13.5).text(apextam,40,160);
        doc.font('Times-Roman').fontSize(11).text(result.clientDetails[i].clientAddress,40,160);
        doc.font('Times-Roman').fontSize(11).text('M/s.',342,188);
        if(bcOfficeId==1){
            apextam='.....................................................................................................................................................................................      vk@v!@vk@';
            doc.font('fonts/Amudham.ttf').fontSize(13.5).text(apextam,40,185);
            apextam='ikf@nuhigdhd@!@ ypkpbll; epWtdj;jplk;  ,Ue;J bgw;wf; fld; ';
            doc.font('fonts/Amudham.ttf').fontSize(13.5).text(apextam,40,210);
        }
        else if(bcOfficeId==2){
            apextam='.....................................................................................................................................................................................   mdd@ah igdhd@!@';
            doc.font('fonts/Amudham.ttf').fontSize(13.5).text(apextam,40,185);
            apextam=' `ghh@ ,d@FYh!pt@ f@nuhj@ g@iuntl@ ypkpbll; epWtdj;jplk;  ,Ue;J bgw;wf; fld; ';
            doc.font('fonts/Amudham.ttf').fontSize(13.5).text(apextam,40,210);
        }
        doc.font('Times-Roman').fontSize(11).text(result.clientDetails[i].clientName,40,185);
        doc.font('Times-Roman').fontSize(11).text(result.clientDetails[i].loanAmount,95,235);
        apextam='bjhif (U......................................................................................................................................................................................................) kl;Lk;/';
        doc.font('fonts/Amudham.ttf').fontSize(13.5).text(apextam,40,235);
        doc.font('Times-Roman').fontSize(11).text(result.clientDetails[i].loanAmountInWords,335,235);
        apextam=',e;j fld; bjhiff;F $hkPd;jhuuhfpa ehd;..........................................................................................................................';
        doc.font('fonts/Amudham.ttf').fontSize(13.5).text(apextam,40,260);
        doc.font('Times-Roman').fontSize(11).text(result.clientDetails[i].relationshipName,300,260);
        apextam='j_bg.....................................................................................Kfthp..................................................................................................................................';
        doc.font('fonts/Amudham.ttf').fontSize(13.5).text(apextam,40,285);
        apextam='..................................................................................................................................................................................bghWg;nghw;W cs;nsd;.';
        doc.font('fonts/Amudham.ttf').fontSize(13.5).text(apextam,40,310);
        apextam='fld; bjhifia.........................................................................................................................................................................(cWg;gpdh;)';
        doc.font('fonts/Amudham.ttf').fontSize(13.5).text(apextam,40,335);
        doc.font('Times-Roman').fontSize(11).text(result.clientDetails[i].clientName,130,335);
        apextam='fl;lj; jtWk;  gl;rj;jpy; $hkPd;jhuuhfpa  ehd;  mj;bjhiff;F  KGg;bghWg;ngw;W';
        doc.font('fonts/Amudham.ttf').fontSize(13.5).text(apextam,40,360);
        apextam="jh';fs; ntz;Lk; nghJ j';fsplkhtJ my;yJ j';fs; cj;jut[ bgw;wth;fsplkhtJ";
        doc.font('fonts/Amudham.ttf').fontSize(13.5).text(apextam,40,385);
        apextam="brYj;jp  igry;  bra;J  ,e;j gpuhkprhp  nehl;ilj; jpUk;gg;  bgw;Wf;bfhs;fpnwd;.";
        doc.font('fonts/Amudham.ttf').fontSize(13.5).text(apextam,40,415);
        doc.font('Times-Roman').fontSize(10).text('__________',365,450);
        doc.font('Times-Roman').fontSize(10).text('|',364,459);
        doc.font('Times-Roman').fontSize(10).text('|',364,468);
        doc.font('Times-Roman').fontSize(10).text('|',364,477);
        doc.font('Times-Roman').fontSize(10).text('|',364,486);
        doc.font('Times-Roman').fontSize(10).text('|',364,495);
        doc.font('Times-Roman').fontSize(10).text('|',414,459);
        doc.font('Times-Roman').fontSize(10).text('|',414,468);
        doc.font('Times-Roman').fontSize(10).text('|',414,477);
        doc.font('Times-Roman').fontSize(10).text('|',414,486);
        doc.font('Times-Roman').fontSize(10).text('|',414,495);
        doc.font('Times-Roman').fontSize(10).text('__________',365,495);
        apextam='$hkPd;jhuh; ifbahg;gk;';
        doc.font('fonts/Amudham.ttf').fontSize(13.5).text(apextam,335,515);
        apextam='cwt[';
        doc.font('fonts/Amudham.ttf').fontSize(13.5).text(apextam,335,540);
        doc.font('Times-Roman').fontSize(10).text(':',360,542);
        doc.font('Times-Roman').fontSize(10).text('______________________',335,570);
        doc.font('Times-Roman').fontSize(10).text('|',334,579);
        doc.font('Times-Roman').fontSize(10).text('|',334,588);
        doc.font('Times-Roman').fontSize(10).text('|',334,597);
        doc.font('Times-Roman').fontSize(10).text('|',334,606);
        doc.font('Times-Roman').fontSize(10).text('|',334,615);
        doc.font('Times-Roman').fontSize(10).text('|',444,579);
        doc.font('Times-Roman').fontSize(10).text('|',444,588);
        doc.font('Times-Roman').fontSize(10).text('|',444,597);
        doc.font('Times-Roman').fontSize(10).text('|',444,606);
        doc.font('Times-Roman').fontSize(10).text('|',444,615);
        doc.font('Times-Roman').fontSize(10).text('______________________',335,615);
        apextam=',lJ if bgUtpuy;';
        doc.font('fonts/Amudham.ttf').fontSize(13.5).text(apextam,340,625);
        apextam='ifnuif';
        doc.font('fonts/Amudham.ttf').fontSize(13.5).text(apextam,370,640);
        apextam=',lk;';
        doc.font('fonts/Amudham.ttf').fontSize(13.5).text(apextam,40,475);
        doc.font('Times-Roman').fontSize(10).text(':',85,477);
        doc.font('Times-Roman').fontSize(10).text(result.clientDetails[i].officeName,90,477);
        apextam='njjp';
        doc.font('fonts/Amudham.ttf').fontSize(13.5).text(apextam,40,500);
        doc.font('Times-Roman').fontSize(10).text(':',85,502);
        doc.font('Times-Roman').fontSize(10).text(disbDateStr.getDate()+"/"+disbMonth+"/"+disbDateStr.getFullYear(),90,502);
        apextam='rhl;rpfs;';
        doc.font('fonts/Amudham.ttf').fontSize(13.5).text(apextam,40,525);
        doc.font('Times-Roman').fontSize(10).text(':',85,527);
        doc.font('Times-Roman').fontSize(10).text('1.',40,540);
        doc.font('Times-Roman').fontSize(10).text('2.',40,595);
        /*
         apextam='abcdefghijklmnopqrstuvwxyz';
         doc.font('fonts/Amudham.ttf').fontSize(16).text(apextam,55,500);
         apextam='ABCDEFGHIJKLMNOPQRSTUVWXYZ <>,.";:[]{}\|=+_-?/';
         doc.font('fonts/Amudham.ttf').fontSize(16).text(apextam,55,550);
         apextam='`1234567890-=[]\;   ~!@#$%^&*()_+{}|:';
         doc.font('fonts/Amudham.ttf').fontSize(16).text(apextam,55,600);
         apextam=" ' : ;";
         doc.font('fonts/Amudham.ttf').fontSize(16).text(apextam,55,625);
         */
    }
    doc.write(rootPath+"/public/GeneratedPDF/"+groupId+"_promissoryNote.pdf");
}
function generatePromissoryNoteInHindi(result,disbDateStr,disbMonth,groupId,month,bcOfficeId){
    var doc = new PDFDocument({
        size: 'B5'
    });
    for(var i =0; i<result.clientDetails.length; i++){
        if (i == 0) {
            doc.image(rootPath+"/public/images/Promissory_Hindi_Self.png",0,0, {scale:0.2});
        }
        else {
            doc.addPage().image(rootPath+"/public/images/Promissory_Hindi_Self.png",0,0, {scale:0.2,size: 'B5'});
        }
        doc.font('Times-Roman').fontSize(11).text('AAMF - 4',410,40);
        doc.font('Times-Roman').fontSize(12).text("M/S."+result.clientDetails[i].clientName,78,88);
        doc.font('Times-Roman').fontSize(12).text(result.clientDetails[i].relationshipName,338,88);
        doc.font('Times-Roman').fontSize(12).text(result.clientDetails[i].clientAddress,95,115);
        doc.font('Times-Roman').fontSize(12).text(Number(result.clientDetails[i].loanAmount).toFixed(2),210,141);
        doc.font('Times-Roman').fontSize(12).text(Number(result.clientDetails[i].interest).toFixed(2),65,157);
        //doc.font('Times-Roman').fontSize(12).text(Number(result.clientDetails[i].installment).toFixed(2),183,157);
        doc.font('Times-Roman').fontSize(12).text(disbDateStr.getDate(),250,173);
        doc.font('Times-Roman').fontSize(12).text(month[disbDateStr.getMonth()]+"  "+disbDateStr.getFullYear(),350,173);
        doc.font('Times-Roman').fontSize(12).text(": "+result.clientDetails[i].officeName,100,249);
        doc.font('Times-Roman').fontSize(12).text(": "+disbDateStr.getDate()+"/"+disbMonth+"/"+disbDateStr.getFullYear(),100,269);
        // For guardian
        doc.addPage().image(rootPath+"/public/images/Promissory_Hindi_Guardian.png",0,0, {scale:0.2,size: 'B5'});
        doc.font('Times-Roman').fontSize(11).text('AAMF - 6',410,40);
        doc.font('Times-Roman').fontSize(12).text(result.clientDetails[i].clientName,80,88);
        doc.font('Times-Roman').fontSize(12).text(result.clientDetails[i].relationshipName,343,88);
        doc.font('Times-Roman').fontSize(12).text(result.clientDetails[i].clientAddress,93,116);
        doc.font('Times-Roman').fontSize(12).text("Rs."+Number(result.clientDetails[i].loanAmount).toFixed(2),186,140);
        doc.font('Times-Roman').fontSize(12).text(result.clientDetails[i].relationshipName,80,167);
        doc.font('Times-Roman').fontSize(12).text(result.clientDetails[i].clientName,80,243);
        doc.font('Times-Roman').fontSize(12).text(disbDateStr.getDate(),70,282);
        doc.font('Times-Roman').fontSize(12).text(month[disbDateStr.getMonth()]+"  "+disbDateStr.getFullYear(),165,282);
        doc.font('Times-Roman').fontSize(12).text(": "+result.clientDetails[i].officeName,110,322);
        doc.font('Times-Roman').fontSize(12).text(": "+disbDateStr.getDate()+"/"+disbMonth+"/"+disbDateStr.getFullYear(),110,344);
    }
    doc.write(rootPath+"/public/GeneratedPDF/"+groupId+"_promissoryNote.pdf");
}
function generatePromissoryNoteInGujarati(result,disbDateStr,disbMonth,groupId,month,bcOfficeId){
    var doc = new PDFDocument({
        size: 'B5'
    });
    for(var i =0; i<result.clientDetails.length; i++){
        if (i == 0) {
            doc.image(rootPath+"/public/images/Promissory_Gujarati_Self.png",0,0, {scale:0.2});
        }
        else {
            doc.addPage().image(rootPath+"/public/images/Promissory_Gujarati_Self.png",0,0, {scale:0.2,size: 'B5'});
        }
        doc.font('Times-Roman').fontSize(11).text('AAMF - 4',410,40);
        doc.font('Times-Roman').fontSize(12).text(result.clientDetails[i].clientName,75,82);
        doc.font('Times-Roman').fontSize(12).text(result.clientDetails[i].relationshipName,345,82);
        doc.font('Times-Roman').fontSize(12).text(result.clientDetails[i].clientAddress,100,108);
        doc.font('Times-Roman').fontSize(12).text(Number(result.clientDetails[i].loanAmount).toFixed(2),200,134);
        doc.font('Times-Roman').fontSize(12).text(Number(result.clientDetails[i].interest).toFixed(2),398,134);
        //doc.font('Times-Roman').fontSize(12).text(Number(result.clientDetails[i].installment).toFixed(2),150,160);
        doc.font('Times-Roman').fontSize(12).text(disbDateStr.getDate(),205,181);
        doc.font('Times-Roman').fontSize(12).text(month[disbDateStr.getMonth()]+"  "+disbDateStr.getFullYear(),285,181);
        doc.font('Times-Roman').fontSize(12).text(": "+result.clientDetails[i].officeName,100,255);
        doc.font('Times-Roman').fontSize(12).text(": "+disbDateStr.getDate()+"/"+disbMonth+"/"+disbDateStr.getFullYear(),100,270);
        // For Guardian
        doc.addPage().image(rootPath+"/public/images/Promissory_Gujarati_Guardian.png",0,0, {scale:0.2,size: 'B5'});
        doc.font('Times-Roman').fontSize(11).text('AAMF - 6',410,40);
        doc.font('Times-Roman').fontSize(12).text(result.clientDetails[i].clientName,75,70);
        doc.font('Times-Roman').fontSize(12).text(result.clientDetails[i].relationshipName,345,70);
        doc.font('Times-Roman').fontSize(12).text(result.clientDetails[i].clientAddress,93,97);
        doc.font('Times-Roman').fontSize(11).text("Rs."+Number(result.clientDetails[i].loanAmount).toFixed(2),217,123);
        doc.font('Times-Roman').fontSize(12).text(result.clientDetails[i].relationshipName,80,147);
        doc.font('Times-Roman').fontSize(12).text(result.clientDetails[i].clientName,110,223);
        doc.font('Times-Roman').fontSize(12).text(disbDateStr.getDate(),70,292);
        doc.font('Times-Roman').fontSize(12).text(month[disbDateStr.getMonth()]+"  "+disbDateStr.getFullYear(),145,292);
        doc.font('Times-Roman').fontSize(12).text(": "+result.clientDetails[i].officeName,110,332);
        doc.font('Times-Roman').fontSize(12).text(": "+disbDateStr.getDate()+"/"+disbMonth+"/"+disbDateStr.getFullYear(),110,350);
    }
    doc.write(rootPath+"/public/GeneratedPDF/"+groupId+"_promissoryNote.pdf");
}
function generateReceiptInHindi(result,disbDateStr,disbMonth,groupId,month,bcOfficeId){
    var doc = new PDFDocument({
        size: 'B5'
    });
    for(var i =0; i<result.clientDetails.length; i++){
        if (i == 0) {
            doc.image(rootPath+"/public/images/Receipt_Hindi.png",0,0, {scale:0.2});
        }
        else {
            doc.addPage().image(rootPath+"/public/images/Receipt_Hindi.png",0,0, {scale:0.2,size: 'B5'});
        }
        doc.font('Times-Roman').fontSize(11).text('AAMF - 5',410,40);
        doc.font('Times-Roman').fontSize(12).text("M/S. "+result.clientDetails[i].clientName,105,112);
        doc.font('Times-Roman').fontSize(12).text(result.clientDetails[i].relationshipName,330,112);
        doc.font('Times-Roman').fontSize(12).text(result.clientDetails[i].clientAddress,95,130);
        doc.font('Times-Roman').fontSize(12).text("Rs."+Number(result.clientDetails[i].loanAmount).toFixed(2),70,162);
        doc.font('Times-Roman').fontSize(12).text(result.clientDetails[i].loanAmountInWords,155,162);
        doc.font('Times-Roman').fontSize(12).text(disbDateStr.getDate(),292,145);
        doc.font('Times-Roman').fontSize(12).text(month[disbDateStr.getMonth()]+" "+disbDateStr.getFullYear(),348,145);
        doc.font('Times-Roman').fontSize(12).text(": "+result.clientDetails[i].officeName,110,240);
        doc.font('Times-Roman').fontSize(12).text(": "+disbDateStr.getDate()+"/"+disbMonth+"/"+disbDateStr.getFullYear(),110,256);
    }
    doc.write(rootPath+"/public/GeneratedPDF/"+groupId+"_receiptForm.pdf");
}
function generateReceiptInGujarati(result,disbDateStr,disbMonth,groupId,month,bcOfficeId){
    var doc = new PDFDocument({
        size: 'B5'
    });
    for(var i =0; i<result.clientDetails.length; i++){
        if (i == 0) {
            doc.image(rootPath+"/public/images/Receipt_Gujarati.png",0,0, {scale:0.2});
        }
        else {
            doc.addPage().image(rootPath+"/public/images/Receipt_Gujarati.png",0,0, {scale:0.2,size: 'B5'});
        }
        doc.font('Times-Roman').fontSize(11).text('AAMF - 5',410,40);
        doc.font('Times-Roman').fontSize(12).text("M/S. "+result.clientDetails[i].clientName,99,97);
        doc.font('Times-Roman').fontSize(12).text(result.clientDetails[i].relationshipName,347,97);
        doc.font('Times-Roman').fontSize(12).text(result.clientDetails[i].clientAddress,95,119);
        doc.font('Times-Roman').fontSize(12).text("Rs."+Number(result.clientDetails[i].loanAmount).toFixed(2),163,144);
        doc.font('Times-Roman').fontSize(12).text(result.clientDetails[i].loanAmountInWords+"Only",240,144);
        doc.font('Times-Roman').fontSize(12).text(disbDateStr.getDate()+" "+month[disbDateStr.getMonth()]+" "+disbDateStr.getFullYear(),250,170);
        doc.font('Times-Roman').fontSize(12).text(": "+result.clientDetails[i].officeName,110,250);
        doc.font('Times-Roman').fontSize(12).text(": "+disbDateStr.getDate()+"/"+disbMonth+"/"+disbDateStr.getFullYear(),110,270);
    }
    doc.write(rootPath+"/public/GeneratedPDF/"+groupId+"_receiptForm.pdf");
}
function generateReceiptInTamil(result,disbDateStr,disbMonth,groupId,month,bcOfficeId){
    var doc = new PDFDocument({
        size: 'B5'
    });
    for(var i =0; i<result.clientDetails.length; i++){
        if (i != 0) {
            doc.addPage({scale:0.2,size: 'B5'});
        }
        doc.font('Times-Roman').fontSize(11).text('AAMF - 5',410,40);
        apextam=',urPJ';
        doc.font('fonts/Amudham.ttf').fontSize(24).text(apextam,180,55);
        apextam='.......................................Mk; tUlk;..................................................khjk;....................................Mk; njjp.........................................';
        doc.font('fonts/Amudham.ttf').fontSize(13.5).text(apextam,40,110);
        doc.font('Times-Roman').fontSize(11).text(disbDateStr.getFullYear(),62,110);
        doc.font('Times-Roman').fontSize(11).text(month[disbDateStr.getMonth()],188,110);
        doc.font('Times-Roman').fontSize(11).text(disbDateStr.getDate(),300,110);
        apextam='khtl;lk;........................................................................................jhYf;fh................................................................................................................';
        doc.font('fonts/Amudham.ttf').fontSize(13.5).text(apextam,40,135);
        apextam='.............................................................................................................................................................................vd;w Kfthpapy; trpf;Fk;';
        doc.font('fonts/Amudham.ttf').fontSize(13.5).text(apextam,40,160);
        doc.font('Times-Roman').fontSize(11).text(result.clientDetails[i].clientAddress,40,160);
        doc.font('Times-Roman').fontSize(11).text('M/s.',342,188);
        if(bcOfficeId==1){
            apextam='.....................................................................................................................................................................................      vk@v!@vk@';
            doc.font('fonts/Amudham.ttf').fontSize(13.5).text(apextam,40,185);
            apextam='ikf@nuhigdhd@!@ ypkpbll; epWtdj;jplk; ,Ue;J bgw;wf; fld;';
            doc.font('fonts/Amudham.ttf').fontSize(13.5).text(apextam,40,210);
        }else if(bcOfficeId==2){
            apextam='.....................................................................................................................................................................................   mdd@ah igdhd@!@';
            doc.font('fonts/Amudham.ttf').fontSize(13.5).text(apextam,40,185);
            apextam='`ghh@ ,d@FYh!pt@ f@nuhj@ g@iuntl@ ypkpbll; epWtdj;jplk; ,Ue;J bgw;wf; fld;';
            doc.font('fonts/Amudham.ttf').fontSize(13.5).text(apextam,40,210);
        }
        doc.font('Times-Roman').fontSize(11).text(result.clientDetails[i].clientName,40,185);
        apextam='bjhif U.........................................................................................................................................................................................................................';
        doc.font('fonts/Amudham.ttf').fontSize(13.5).text(apextam,40,235);
        doc.font('Times-Roman').fontSize(11).text(result.clientDetails[i].loanAmount,385,235);
        apextam='(...............................................................................................................................................................................................................................) kl;Lk;/';
        doc.font('fonts/Amudham.ttf').fontSize(13.5).text(apextam,40,260);
        doc.font('Times-Roman').fontSize(11).text(result.clientDetails[i].loanAmountInWords,40,260);
        doc.font('Times-Roman').fontSize(10).text('__________',365,450);
        doc.font('Times-Roman').fontSize(10).text('|',364,459);
        doc.font('Times-Roman').fontSize(10).text('|',364,468);
        doc.font('Times-Roman').fontSize(10).text('|',364,477);
        doc.font('Times-Roman').fontSize(10).text('|',364,486);
        doc.font('Times-Roman').fontSize(10).text('|',364,495);
        doc.font('Times-Roman').fontSize(10).text('|',414,459);
        doc.font('Times-Roman').fontSize(10).text('|',414,468);
        doc.font('Times-Roman').fontSize(10).text('|',414,477);
        doc.font('Times-Roman').fontSize(10).text('|',414,486);
        doc.font('Times-Roman').fontSize(10).text('|',414,495);
        doc.font('Times-Roman').fontSize(10).text('__________',365,495);
        apextam='cWg;gpdh; ifbahg;gk;'
        doc.font('fonts/Amudham.ttf').fontSize(13.5).text(apextam,335,515);
        apextam=',lk;';
        doc.font('fonts/Amudham.ttf').fontSize(13.5).text(apextam,40,475);
        doc.font('Times-Roman').fontSize(10).text(':',85,477);
        doc.font('Times-Roman').fontSize(10).text(result.clientDetails[i].officeName,90,477);
        apextam='njjp';
        doc.font('fonts/Amudham.ttf').fontSize(13.5).text(apextam,40,500);
        doc.font('Times-Roman').fontSize(10).text(':',85,502);
        doc.font('Times-Roman').fontSize(10).text(disbDateStr.getDate()+"/"+disbMonth+"/"+disbDateStr.getFullYear(),90,502);
        apextam='rhl;rpfs;';
        doc.font('fonts/Amudham.ttf').fontSize(13.5).text(apextam,40,525);
        doc.font('Times-Roman').fontSize(10).text(':',85,527);
        doc.font('Times-Roman').fontSize(10).text('1.',40,540);
        doc.font('Times-Roman').fontSize(10).text('2.',40,595);
    }
    doc.write(rootPath+"/public/GeneratedPDF/"+groupId+"_receiptForm.pdf");
}
