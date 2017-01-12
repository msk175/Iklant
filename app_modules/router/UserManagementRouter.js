var crypto = require('crypto');
var express = require('express');
module.exports = userManagement;
router = express.Router();
var path = require('path');
var rootPath = path.dirname(process.mainModule.filename);
var props = require(path.join(rootPath,"properties.json"));
mifosServiceIP = props.mifosServiceIp;
mifosPort = props.mifosPort;
GPSPort = props.GPSPort;
iklantPort = props.iklantPort;
var userManagementDTO = path.join(rootPath,"app_modules/dto/user_management");
var dateUtils = require('../utils/DateUtils');

var UserManagementModel = require(path.join(rootPath,"app_modules/model/UserManagementModel"));
var commonDTO = path.join(rootPath,"app_modules/dto/common");
var customlog = require(path.join(rootPath,"logger/loggerConfig.js"))('UserManagementRouter.js');



function userManagement(constants) {
    customlog.debug("Inside Router");
    this.model = new UserManagementModel(constants);
    this.constants = constants;
}
userManagement.prototype = {

    // Dhinakaran
    saveUserCall:function(tenantId,officeId,userName,password,contactNumber,emailId,roleIdArray,userId,imeiNumberId,callback) {
        this.model.saveUserModel(tenantId,officeId,userName,password,contactNumber,emailId,roleIdArray,userId,imeiNumberId,callback);
    },
    // Dhinakaran
    saveUser: function (req, res) {
        var randtoken = require('rand-token');
        try{
            var self = this;
            var constantsObj = this.constants;
            var tenantId = req.session.tenantId;
            if((req.session.roleIds).length>1){
                var roleIds=req.session.roleIds;
                for(var i= 0;i<roleIds.length;i++){
                    if(roleIds[i] == constantsObj.getAdminroleId()) {
                        var roleId = constantsObj.getAdminroleId();
                    }
                }
            }else{
                var roleId = req.session.roleId;
            }
            var userId = req.session.userId;
            if (roleId == constantsObj.getAdminroleId()) {
                var officeId = req.body.office;
                var roleId = 0;
                var roleIdArray = req.body.role.split(',');
                var userName = req.body.userName;
                //var password = req.body.password;
                var randomPassword = randtoken.generate(8);
                var contactNumber = req.body.contactNumber;
                var firstName = req.body.firstName;
                var lastName = req.body.lastName;
                var dob = req.body.dob;
                var gender = req.body.gender;
                var address = req.body.address;
                var userHierarchy = req.body.userHierarchy;
                var emailId = req.body.emailId;
                var imeiNumberId = req.body.imeiNumberId;

                var PersonnelHolderObj = require(userManagementDTO +"/PersonnelHolder");
                var personnelHolder = new PersonnelHolderObj();
                personnelHolder.setFirstName(firstName);
                personnelHolder.setLastName(lastName);
                personnelHolder.setUserName(userName);
                personnelHolder.setPassword(randomPassword);
                personnelHolder.setDob(convertToMifosDateFormat(dob));
                personnelHolder.setGender(gender);
                personnelHolder.setAddress1(address);
                personnelHolder.setUserHierarchy(userHierarchy);
                personnelHolder.setRoleId(roleId);
                personnelHolder.setOfficeId(officeId);
                personnelHolder.setEmailId(emailId);
                personnelHolder.setRoleIds(roleIdArray);
                var rest = require("./rest.js");
                var personnelHolderDetail = JSON.stringify(personnelHolder);

                customlog.info("personnelHolderDetail" + personnelHolderDetail);
                var http = require('http');
                var https = require('https');

                customlog.info("Cookie:" + req.session.mifosCookie);
                var cookie = req.session.mifosCookie;
                if (typeof cookie == 'undefined') {
                    res.redirect(props.contextPath+'/client/ci/login');
                }
                else {
                    var postheaders = {
                        'Content-Type': 'application/json',
                        'Content-Length': Buffer.byteLength(personnelHolderDetail, 'utf8'),
                        'Cookie': req.session.mifosCookie
                    };

                    var options = {
                        host: mifosServiceIP,
                        port: mifosPort,
                        path: '/mfi/personnel/createUser.json',
                        method: 'POST',
                        headers: postheaders
                    };

                    var resultStatus;
                    rest.postJSON(options, personnelHolderDetail, function (statuscode, result, headers) {
                        customlog.info("statuscode" + statuscode);
                        customlog.info("HEADERS:  " + headers)
                        if (statuscode == 302) {
                            res.redirect(props.contextPath+'/client/ci/logout');
                        } else {
                            if (result.status == 'success') {
                                var activityDetails = new Array(iklantPort, req.session.tenantId, req.session.userId, req.session.userName, req.originalUrl, req.connection.remoteAddress, "router.js", "saveUser", "success", "Manage Users-Save New User", personnelHolder.getUserName()+" User created successfully","insert");
                                var password = encrypt(randomPassword,personnelHolder.getUserName());
                                self.saveUserCall(tenantId, officeId, userName, password, contactNumber, emailId, roleIdArray, userId, imeiNumberId, function () {
                                    self.commonRouter.insertActivityLogModel(activityDetails);
                                    self.commonRouter.sendEmail(emailId,props.emailSubject,props.emailText+""+randomPassword,function(status){
                                        if(status == true){
                                            self.commonRouter.showListGroupsOperations(req, res, constantsObj.getManageUsersOperationId(), '', '', '', '', '', '', '', '', '', '', '', '', "User created successfully");
                                        }else{
                                            self.commonRouter.showListGroupsOperations(req, res, constantsObj.getManageUsersOperationId(), '', '', '', '', '', '', '', '', '', '', '', '', "User created successfully but mail was not sent to the user");
                                        }
                                    });
                                });
                            }
                            else{
                                self.commonRouter.showListGroupsOperations(req, res, constantsObj.getManageUsersOperationId(), '', '', '', '', '', '', '', '', '', '', '', '', "User created failed");
                            }
                        }
                    });
                }
            }
            else {
                res.redirect(props.contextPath+"/client/ci/login");
            }
        }catch(e){
            customlog.error("Exception while save user "+e);
            self.commonRouter.showErrorPage(req,res);
        }
    },
    //  Dhinakaran
    updateUserCall:function(tenantId,currentUserId,officeId,userName,password,contactNumber,emailId,roleId,userId,imeiNumberId,callback) {
        this.model.updateUserModel(tenantId,currentUserId,officeId,userName,password,contactNumber,emailId,roleId,userId,imeiNumberId,callback);
    },

    // Dhinakaran
    updateUser: function(req, res) {
        try{
            var self = this;
            var constantsObj = this.constants;
            var tenantId = req.session.tenantId;
            if((req.session.roleIds).length>1){
                var roleIds=req.session.roleIds;
                for(var i= 0;i<roleIds.length;i++){
                    if(roleIds[i] == constantsObj.getAdminroleId()) {
                        var roleId = constantsObj.getAdminroleId();
                    }
                }
            }else{
                var roleId = req.session.roleId;
            }
            var userId = req.session.userId;
            if(roleId == constantsObj.getAdminroleId()) {
                var currentUserId = parseInt(req.body.userNameSelect, 10);
                var officeId = parseInt(req.body.officeEdit, 10);
                var role = 0;//parseInt(req.body.roleEdit, 10);
                var roleEdit = req.body.role.split(',');
                var userName = req.body.userNameEdit;
                var password = req.body.passwordEdit;
                var encryptedPassword = encrypt(req.body.passwordEdit, userName);
                var contactNumber = req.body.contactNumberEdit;
                var emailId = req.body.emailIdEdit;
                var firstName = req.body.firstNameEdit;
                var lastName = req.body.lastNameEdit;
                var dob = req.body.dobEdit;
                var gender;
                var address = req.body.addressEdit;
                var userHierarchy;
                var imeiNumberId = req.body.imeiNumberIdEdit;
                if (req.body.userHierarchyEdit == 2) {
                    userHierarchy = 'Non-loan Officer';
                } else {
                    userHierarchy = 'Loan Officer';
                }
                if (req.body.genderEdit == 49) {
                    gender = 'Male';
                } else {
                    gender = 'Female';
                }
                var PersonnelHolderObj = require(userManagementDTO + "/PersonnelHolder");
                var personnelHolder = new PersonnelHolderObj();
                personnelHolder.setPersonnelId(currentUserId);
                personnelHolder.setFirstName(firstName);
                personnelHolder.setLastName(lastName);
                personnelHolder.setUserName(userName);
                personnelHolder.setPassword(password);
                personnelHolder.setDob(dob);
                personnelHolder.setGender(gender);
                personnelHolder.setAddress1(address);
                personnelHolder.setUserHierarchy(userHierarchy);
                personnelHolder.setRoleId(role);
                personnelHolder.setOfficeId(officeId);
                personnelHolder.setEmailId(emailId);
                personnelHolder.setRoleIds(roleEdit);
                var rest = require("./rest.js");
                var personnelHolderDetail = JSON.stringify(personnelHolder);
                customlog.info("personnelHolderDetail" + personnelHolderDetail);
                var http = require('http');
                var https = require('https');
                customlog.info("Cookie:" + req.session.mifosCookie);
                var cookie = req.session.mifosCookie;
                if (typeof cookie == 'undefined') {
                    res.redirect(props.contextPath + '/client/ci/login');
                }
                else {
                    var postheaders = {
                        'Content-Type': 'application/json',
                        'Content-Length': Buffer.byteLength(personnelHolderDetail, 'utf8'),
                        'Cookie': req.session.mifosCookie
                    };

                    var options = {
                        host: mifosServiceIP,
                        port: mifosPort,
                        path: '/mfi/api/user/update.json',
                        method: 'POST',
                        headers: postheaders
                    };
                    var resultStatus;
                    rest.postJSON(options, personnelHolderDetail, function (statuscode, result, headers) {
                        customlog.info("statuscode" + statuscode);
                        customlog.info("HEADERS:  " + headers)

                        customlog.info("RESULT" + result.status);
                        if (statuscode == 302) {
                            res.redirect(props.contextPath + '/client/ci/logout');
                        } else if (result.status == 'success') {
                            var activityDetails = new Array(iklantPort, req.session.tenantId, req.session.userId, req.session.userName, req.originalUrl, req.connection.remoteAddress, "router.js", "updateUser", "success", "Manage Users-Update", "User Details Updated successfully", "update");
                            self.commonRouter.insertActivityLogModel(activityDetails);
                            self.updateUserCall(tenantId, currentUserId, officeId, userName, encryptedPassword, contactNumber, emailId, roleEdit, userId, imeiNumberId, function (status, message) {
                                if (status){
                                    self.commonRouter.showListGroupsOperations(req, res, constantsObj.getManageUsersOperationId(), '', '', '', '', '', '', '', '', '', '', '', '', "User updated successfully");
                                }else {
                                    self.commonRouter.showListGroupsOperations(req, res, constantsObj.getManageUsersOperationId(), '', '', '', '', '', '', '', '', '', '', '', '', "User updated Failed");
                                }
                            });
                        } else {
                            self.commonRouter.showErrorPage(req, res);
                        }
                    });
                }
            }else {
                res.redirect(props.contextPath+"/client/ci/login");
            }
        }catch(e){
            customlog.error("Exception while update user "+e);
            self.commonRouter.showErrorPage(req,res);
        }
    },
    deleteUserCall 	: function(userid,tenantId,callback){
        this.model.deleteUserModel(userid,tenantId,callback);
    },

    deleteUser : function(req, res) {
        var self = this;
        var constantsObj = this.constants;
        var tenantId = req.session.tenantId;
        var userid = req.params.id;
        try{
            customlog.info("userid::" + userid);
            self.deleteUserCall(userid,tenantId,function(){
                var activityDetails = new Array(iklantPort, req.session.tenantId, req.session.userId, req.session.userName, req.originalUrl, req.connection.remoteAddress, "router.js", "deleteUser", "success", "Manage Users-Delete", "UserID "+userid+" Deletion Success","update");
                self.commonRouter.insertActivityLogModel(activityDetails);
                self.commonRouter.showListGroupsOperations(req, res,constantsObj.getManageUsersOperationId(),'','','','','','','','','','','','',"User deleted successfully");
            });
        }catch(e){
            customlog.error("Exception while Delete user "+e);
            self.commonRouter.showErrorPage(req,res);
        }
    },

    populateUserDetailsCall:function(tenantId,userId,callback){
        this.model.populateUserDetailsModel(tenantId,userId,callback);
    },

    populateUserDetails: function(req, res) {
        try{
            var self = this;
            var constantsObj = this.constants;
            var tenantId = req.session.tenantId;
            if((req.session.roleIds).length>1){
                var roleIds = req.session.roleIds;
                for (var i = 0;i<roleIds.length; ++i) {
                    if (roleIds[i] == constantsObj.getAdminroleId()) {
                        var roleId = constantsObj.getAdminroleId();
                    }
                }
            }else{
                var roleId = req.session.roleId;
            }
            if (roleId == constantsObj.getAdminroleId()) {
                var userId = req.body.userId;
                var rest = require("./rest.js");
                var http = require('http');
                var https = require('https');
                var postheaders = {
                    'Content-Type': 'application/json',
                    'Cookie': req.session.mifosCookie
                };
                var options = {
                    host: mifosServiceIP,
                    port: mifosPort,
                    path: "/mfi/api/user/load-" + userId + ".json",
                    method: 'GET',
                    headers: postheaders
                };
                customlog.info("Path==" + options.path);
                rest.getJSON(options, function (statuscode, result, headers) {
                    customlog.info(statuscode);
                    if (statuscode == 302) {
                        res.redirect(props.contextPath + '/client/ci/logout');
                    }
                    else if (result.status == "success") {
                        self.populateUserDetailsCall(tenantId, userId,
                            function (contactNumber, imeiNumber,roleId) {
                                customlog.info("contactNumber" + contactNumber);
                                req.body.contactNumberId = contactNumber;
                                req.body.imeiNumberId = imeiNumber;
                                var userHierarchy;
                                if (result.personnelDetail.userHierarchy == 'Non-loan Officer') {
                                    userHierarchy = 2;
                                } else {
                                    userHierarchy = 1;
                                }
                                customlog.info("userName" + result.personnelDetail.userName);
                                req.body.userId = result.personnelDetail.personnelId;
                                req.body.officeId = result.personnelDetail.officeId;
                                req.body.roleId = roleId;
                                req.body.userNameId = result.personnelDetail.userName;
                                req.body.firstName = result.personnelDetail.firstName;
                                req.body.lastName = result.personnelDetail.lastName;
                                req.body.passwordId = result.personnelDetail.password;
                                req.body.emailIdID = result.personnelDetail.emailId;
                                req.body.dob = result.personnelDetail.dob;
                                req.body.gender = result.personnelDetail.gender;
                                req.body.address = result.personnelDetail.address1;
                                req.body.userHierarchy = userHierarchy;
                                res.send(req.body);
                            });
                    } else {
                        self.commonRouter.showErrorPage(req, res);
                    }
                });
            }else{
                res.redirect(props.contextPath+"/client/ci/login");
            }
        }catch(e){
            customlog.error("Exception While Populate user Details "+e);
            self.commonRouter.showErrorPage(req,res);
        }
    },
    saveOfficeCall:function(tenantId,officeName,officeShortName,officeAddress,userId,stateId,callback){
        this.model.saveOfficeModel(tenantId,officeName,officeShortName,officeAddress,userId,stateId,callback);
    },

    saveOffice: function(req, res) {
        try{
            var self = this;
            var constantsObj = this.constants;
            var tenantId = req.session.tenantId;
            if((req.session.roleIds).length>1){
                var roleIds = req.session.roleIds;
                for(var i= 0;i<roleIds.length;i++){
                    if(roleIds[i] == constantsObj.getAdminroleId()) {
                        var roleId = constantsObj.getAdminroleId();
                    }
                }
            }else{
                var roleId = req.session.roleId;
            }
            var userId = req.session.userId;
            var stateId = req.body.state;
            if(roleId == constantsObj.getAdminroleId()) {
                customlog.info('In saveOffice');
                var officeName = req.body.officeName;
                var officeAddress = req.body.officeAddress;
                var officeShortName = req.body.officeShortName;
                this.saveOfficeCall(tenantId,officeName,officeShortName,officeAddress,userId,stateId,function(status){
                    customlog.info('In IKLANT office creation');
                    customlog.info(status);
                    if(status) {
                        var activityDetails = new Array(iklantPort, req.session.tenantId, req.session.userId, req.session.userName, req.originalUrl, req.connection.remoteAddress, "router.js", "saveOffice", "success", "Manage Office", officeName+" New Office Created Successfully","insert");
                        self.commonRouter.insertActivityLogModel(activityDetails);
                        self.showOfficeCreationCompletion(req, res);
                    }
                    else{
                        self.commonRouter.showListGroupsOperations(req, res,constantsObj.getManageOfficeOperationId(),'','','','','','','','','','','','',"Office Already Exists");
                    }
                });
            }
            else {
                res.redirect(props.contextPath+"/client/ci/login");
            }
        }catch(e){
            customlog.error("Exception while save office "+e);
            self.commonRouter.showErrorPage(req,res);
        }
    },

    showOfficeCreationCompletion: function(req,res,status){
        try{
            customlog.info('In showOfficeCreationCompletion');
            customlog.info(status);
            var self = this;
            var constantsObj = this.constants;
            var tenantId = req.session.tenantId;

            var rest = require("./rest.js");
            var officeName=req.body.officeName;
            var officeAddress=req.body.officeAddress;
            var officeShortName=req.body.officeShortName;
            var state = req.body.stateName;

            var office = JSON.stringify({
                officeName : officeName,
                officeAddress : officeAddress,
                officeShortName : officeShortName,
                state : state
            });

            var http = require('http');
            var https = require('https');

            var postheaders = {
                'Content-Type' : 'application/json',
                'Content-Length' : Buffer.byteLength(office, 'utf8'),
                'Cookie' : req.session.mifosCookie
            };

            var options = {
                host: mifosServiceIP,
                port: mifosPort,
                path: '/mfi/office/creation.json',
                method: 'POST',
                headers : postheaders
            };

            var resuStatus;
            rest.postJSON(options,office,function(statuscode,result,headers){
                customlog.info("statuscode" + statuscode);
                customlog.info("HEADERS:  "+headers)
                resuStatus = result.status;
                if(statuscode == 302) {
                    res.redirect(props.contextPath+'/client/ci/logout');
                }
                else if(resuStatus == "success"){
                    var activityDetails = new Array(iklantPort, req.session.tenantId, req.session.userId, req.session.userName, req.originalUrl, req.connection.remoteAddress, "router.js", "showOfficeCreationCompletion", "success", "Manage Office", officeName+" After Office Creation Success in MFI","insert");
                    self.commonRouter.insertActivityLogModel(activityDetails);
                    customlog.info('In Mifos successful office creation');
                    self.commonRouter.showListGroupsOperations(req, res,constantsObj.getManageOfficeOperationId());
                }else if(resuStatus == 'failure'){
                    customlog.error(result.errors)
                    self.retriveOfficeCall(tenantId,req.session.userId,function(officeIdArray,officeNameArray,officeAddressArray,officeShortNameArray){
                        self.commonRouter.showListGroupsOperations(req, res,constantsObj.getManageOfficeOperationId());
                    });
                } else {
                    self.commonRouter.showErrorPage(req,res);
                }
            });
        }catch(e){
            customlog.error("Exception while showOfficeCreationCompletion "+e);
            self.commonRouter.showErrorPage(req,res);
        }
    },

    updateOfficeCall:function(tenantId,officeId,officeName,officeShortName,officeAddress,userId,callback){
        this.model.updateOfficeModel(tenantId,officeId,officeName,officeShortName,officeAddress,userId,callback);
    },

    updateOffice: function(req, res) {
        try{
            var self = this;
            var constantsObj = this.constants;
            var tenantId = req.session.tenantId;
            if((req.session.roleIds).length>1){
                var roleIds=req.session.roleIds;
                for(var i=0;i<roleIds.length;i++){
                    if (roleIds[i] == constantsObj.getAdminroleId()) {
                        var roleId = constantsObj.getAdminroleId();
                    }
                }
            }else{
                var roleId = req.session.roleId;
            }
            var userId = req.session.userId;
            if (roleId == constantsObj.getAdminroleId()) {
                var officeId = req.body.officeIdEdit;
                var officeName = req.body.officeNameEdit;
                var officeShortName = req.body.officeShortNameEdit;
                var officeAddress = req.body.officeAddressEdit;
                this.updateOfficeCall(tenantId, officeId, officeName, officeShortName, officeAddress, userId, function () {
                    var activityDetails = new Array(iklantPort, req.session.tenantId, req.session.userId, req.session.userName, req.originalUrl, req.connection.remoteAddress, "router.js", "updateOffice", "success", "Manage Office", "Office Id " + officeId + " Name " + officeName + " Details updated successfully", "update");
                    self.commonRouter.insertActivityLogModel(activityDetails);
                    self.commonRouter.showListGroupsOperations(req, res, constantsObj.getManageOfficeOperationId());
                });
            }
            else {
                res.redirect(props.contextPath+"/client/ci/login");
            }
        }catch(e){
            customlog.error("Exception while update office "+e);
            self.commonRouter.showErrorPage(req,res);
        }
    },

    populateOfficeDetailsCall:function(tenantId,officeId,callback){
        this.model.populateOfficeDetailsModel(tenantId,officeId,callback);
    },

    populateOfficeDetails: function(req, res) {
        try{
            var self = this;
            var constantsObj = this.constants;
            var tenantId = req.session.tenantId;
            if((req.session.roleIds).length>1){
                var roleIds=req.session.roleIds;
                for(var i=0;i<roleIds.length;i++)
                {
                    if(roleIds[i] == constantsObj.getAdminroleId()) {
                        var roleId = constantsObj.getAdminroleId();
                    }
                }
            }else{
                var roleId = req.session.roleId;
            }
            if (roleId == constantsObj.getAdminroleId()) {
                var officeId = req.body.officeId;
                this.populateOfficeDetailsCall(tenantId, officeId, function (officeId, officeName, officeAddress, officeShortName, stateName) {
                    req.body.officeName = officeName;
                    req.body.officeShortName = officeShortName;
                    req.body.officeAddress = officeAddress;
                    req.body.stateName = stateName;
                    res.send(req.body);
                });
            }
            else {
                res.redirect(props.contextPath+"/client/ci/login");
            }
        }catch(e){
            customlog.error("Exception while populateOfficeDetails "+e);
            self.commonRouter.showErrorPage(req,res);
        }
    },

    deleteOfficeCall : function(officeid,tenantId,callback){
        this.model.deleteOfficeModel(officeid,tenantId,callback);
    },

    deleteoffice : function(req, res) {
        var self = this;
        var constantsObj = this.constants;
        var tenantId = req.session.tenantId;
        var officeid = req.params.id;
        customlog.info("officeid::" + officeid);
        self.deleteOfficeCall(officeid,tenantId,function(){
            var activityDetails = new Array(iklantPort, req.session.tenantId, req.session.userId, req.session.userName, req.originalUrl, req.connection.remoteAddress, "router.js", "deleteoffice", "success", "Manage Office", "office "+officeid+" deleted successfully","update");
            self.commonRouter.insertActivityLogModel(activityDetails);
            self.commonRouter.showListGroupsOperations(req, res,constantsObj.getManageOfficeOperationId());
        });
    },
    populateRoleDetailsCall:function(tenantId,roleId,callback){
        this.model.populateRoleDetailsModel(tenantId,roleId,callback);
    },

    populateRoleDetails: function(req, res) {
        try{
            var self = this;
            var constantsObj = this.constants;
            var tenantId = req.session.tenantId;
            if((req.session.roleIds).length>1){
                var roleIds=req.session.roleIds;
                for (var i = 0; i < roleIds.length; i++) {
                    if (roleIds[i] == constantsObj.getAdminroleId()) {
                        var roleId = constantsObj.getAdminroleId();
                    }
                }
            }else{
                var roleId = req.session.roleId;
            }
            if(roleId == constantsObj.getAdminroleId()) {
                var roleId = req.body.roleId;
                this.manageRolesCall(function(manageRolesObject) {
                    self.populateRoleDetailsCall(tenantId,roleId,function(roleId,roleName,roleDescription,
                                                                          selectedOperationIdArray,selectedOperationNameArray,
                                                                          selectedRolePrevilegeIdArray,selectedRolePrevilegeNameArray){
                        customlog.info("manageRolesObj : "+selectedOperationIdArray);
                        customlog.info("manageRolesObj : "+selectedOperationNameArray);
                        req.body.roleName = roleName;
                        req.body.roleDescription = roleDescription;
                        req.body.selectedOperationIdArray = selectedOperationIdArray;
                        req.body.selectedOperationNameArray = selectedOperationNameArray;
                        req.body.selectedRolePrevilegeIdArray = selectedRolePrevilegeIdArray;
                        req.body.selectedRolePrevilegeNameArray = selectedRolePrevilegeNameArray;
                        res.send(req.body);
                    });
                });
            }
            else {
                res.redirect(props.contextPath+"/client/ci/login");
            }
        }catch(e){
            customlog.error("Exception while populateRoleDetails "+e);
            self.commonRouter.showErrorPage(req,res);
        }
    },

    saveManageRolesCall:function(manageRolesObj,callback){
        this.model.saveManageRolesModel(manageRolesObj,callback);
    },

    saveManageRoles : function(req,res) {
        try{
            var manageRolesObject = require(commonDTO +"/manageRoles");
            var self = this;
            var constantsObj = this.constants;
            var manageRolesObj = new manageRolesObject();
            var tenantID = manageRolesObj.setTenantId(req.session.tenantId);
            var roleName = manageRolesObj.setRoleName(req.body.roleName);
            var roleDescName = manageRolesObj.setRoleDescName(req.body.roleDescName);
            var checkedValues = manageRolesObj.setCheckedValues(req.body.checkedValuesHiddenName);
            customlog.info("****************" +req.body.checkedValuesHiddenName);
            self.saveManageRolesCall(manageRolesObj,function(){
                var activityDetails = new Array(iklantPort, req.session.tenantId, req.session.userId, req.session.userName, req.originalUrl, req.connection.remoteAddress, "router.js", "saveManageRoles", "success", "Manage Roles", "RoleName "+roleName+" Saved successfully","insert");
                self.commonRouter.insertActivityLogModel(activityDetails);
                self.commonRouter.showListGroupsOperations(req, res,constantsObj.getManageRolesOperationId());
            });
        }catch(e){
            customlog.error("Exception while saveManageRoles "+e);
            self.commonRouter.showErrorPage(req,res);
        }
    },

    updateRoleCall:function(tenantId,userId,roleId,roleName,roleDescription,insertFlag,deleteFlag,previouslySelectedOperationlist,selectedOperation,callback){
        this.model.updateRoleModel(tenantId,userId,roleId,roleName,roleDescription,insertFlag,deleteFlag,previouslySelectedOperationlist,selectedOperation,callback);
    },

    updateRole: function(req, res) {
        try{
            var self = this;
            var constantsObj = this.constants;
            var tenantId = req.session.tenantId;
            var userId = req.session.userId;
            var roleId = req.body.roleIdEdit;
            var roleName = req.body.roleNameEdit;
            var roleDescription = req.body.roleDescNameEdit;
            var selectedOperation = req.body.checkedValuesHiddenName.split(',');
            var previouslySelectedOperationlist = req.body.operationValuesHiddenName.split(',');
            customlog.info("roleId::" + roleId);
            customlog.info("selectedOperation====" + selectedOperation);
            customlog.info("previouslySelectedOperationlist===" + previouslySelectedOperationlist);
            customlog.info(selectedOperation.length);
            customlog.info(previouslySelectedOperationlist.length);
            var insertFlag = new Array();
            var deleteFlag = new Array();
            for(var i=0;i<selectedOperation.length;i++) {

                for(var j=0;j<previouslySelectedOperationlist.length;j++) {
                    if(selectedOperation[i] == previouslySelectedOperationlist[j] ){
                        insertFlag[i] = 0;
                        break;
                    }
                    else if(j == ((previouslySelectedOperationlist.length)-1)) {
                        insertFlag[i] = 1;
                    }
                }
            }
            for(var i=0;i<previouslySelectedOperationlist.length;i++) {
                for(var j=0;j<selectedOperation.length;j++) {
                    if(selectedOperation[j] == previouslySelectedOperationlist[i] ){
                        deleteFlag[i] = 0;
                        break;
                    }
                    else if(j == ((selectedOperation.length)-1)) {
                        deleteFlag[i] = 1;
                    }
                }
            }

            for(var i=0;i<insertFlag.length;i++){
                if(insertFlag[i] == 1) {
                    customlog.info("New Operation==="  + selectedOperation[i]);
                }
            }
            for(var i=0;i<deleteFlag.length;i++){
                if(deleteFlag[i] == 1) {
                    customlog.info("Delete Operation==="  + previouslySelectedOperationlist[i]);
                }
            }

            self.updateRoleCall(tenantId,userId,roleId,roleName,roleDescription,insertFlag,deleteFlag,previouslySelectedOperationlist,selectedOperation,function(){
                var activityDetails = new Array(iklantPort, req.session.tenantId, req.session.userId, req.session.userName, req.originalUrl, req.connection.remoteAddress, "router.js", "updateRole", "success", "Manage Role", "User RoleId "+roleId+" updated successfully","update");
                self.commonRouter.insertActivityLogModel(activityDetails);
                self.commonRouter.showListGroupsOperations(req, res,constantsObj.getManageRolesOperationId());
            });
        }catch(e){
            customlog.error("Exception while updatre role "+e);
            self.commonRouter.showErrorPage(req,res);
        }
    },

    deleteRoleCall : function(tenantId,roleId,callback) {
        this.model.deleteRoleModel(tenantId,roleId,callback);
    },

    deleteRole:function(req, res) {
        try{
            var self = this;
            var constantsObj = this.constants;
            var tenantId = req.session.tenantId;
            var roleId = req.params.roleid;
            customlog.info("roleId::" + roleId);
            self.deleteRoleCall(tenantId,roleId,function() {
                var activityDetails = new Array(iklantPort, req.session.tenantId, req.session.userId, req.session.userName, req.originalUrl, req.connection.remoteAddress, "router.js", "deleteRole", "success", "Manage Role", "User RoleId "+roleId+" deleted successfully","update");
                self.commonRouter.insertActivityLogModel(activityDetails);
                self.commonRouter.showListGroupsOperations(req, res,constantsObj.getManageRolesOperationId());
            });
        }catch(e){
            customlog.error("Exception while deleteRole "+e);
            self.commonRouter.showErrorPage(req,res);
        }
    },

    checkForRoleIsAssignedCall : function(tenantId,roleId,callback) {
        this.model.checkForRoleIsAssignedModel(tenantId,roleId,callback);
    },

    checkForRoleIsAssigned:function(req, res) {
        try{
            var self = this;
            var constantsObj = this.constants;
            var tenantId = req.session.tenantId;
            var roleId = req.body.roleId;
            customlog.info("roleId::" + roleId);
            self.checkForRoleIsAssignedCall(tenantId,roleId,function(noOfUsers) {
                req.body.noOfUsers = noOfUsers;
                res.send(req.body);
            });
        }catch(e){
            customlog.error("Exception while checkForRoleIsAssigned "+e);
            self.commonRouter.showErrorPage(req,res);
        }
    },

    //manageUsers
    manageUsersCall:function(manageUsersObject,callback){
        this.model.manageUsersModel(manageUsersObject,callback);
    },

    manageUsers:function(req,res){
        try{
            var self = this;
            var manageUsersObj = require(userManagementDTO +"/manageUsers");
            var manageUsersObject = new manageUsersObj();
            var tenantId = manageUsersObject.setTenant_id(req.session.tenantId)
            var officeId = manageUsersObject.setOffice_id(req.body.office);
            var userName = manageUsersObject.setUser_name(req.body.userName);
            var password = manageUsersObject.setPassword(req.body.password);
            //var confirmPassword = manageUsersObject.setConfirm_password(req.body.confirmPassword);
            var contactNumber = manageUsersObject.setContact_number(req.body.contactNumber);
            var emailId = manageUsersObject.setEmail_id(req.body.emailId);
            //customlog.info("users details = "+manageUsersObject.getTenant_id()+" "+manageUsersObject.getOffice_id()+" "+manageUsersObject.getUser_name()+" "+manageUsersObject.getPassword()+" "+manageUsersObject.getConfirm_password()+" "+manageUsersObject.getContact_number()+" "+manageUsersObject.getEmail_id());
            this.manageUsersCall(manageUsersObject,function(){
                var activityDetails = new Array(iklantPort, req.session.tenantId, req.session.userId, req.session.userName, req.originalUrl, req.connection.remoteAddress, "router.js", "manageUsers", "success", "Manage Users", "UserName "+userName+" Created successfully","insert");
                self.commonRouter.insertActivityLogModel(activityDetails);
                res.redirect(props.contextPath+'/client/ci/groups');
            });
        }catch(e){
            customlog.error("Exception while manage users "+e);
            self.commonRouter.showErrorPage(req,res);
        }
    },


    manageRolesCall:function(callback){
        this.commonRouter.model.manageRolesModel(callback);
    },

    showAssignRoles: function(res,userName,assignRolesObject){
        res.render('AssignRoles',{layout: 'AssignRoles.jade',userName:userName,assignRolesObj:assignRolesObject, contextPath:props.contextPath});
    },

    assignRolesCall:function(tenantID,callback){
        this.model.assignRolesModel(tenantID,callback);
    },

    assignRoles : function(req,res){
        try{
            var self = this;
            var userName = req.session.userName;
            var tenantID = req.session.tenantId;
            this.assignRolesCall(tenantID,function(assignRolesObject){
                self.showAssignRoles(res,userName,assignRolesObject);
            });
        }catch(e){
            customlog.error("Exception while assign role "+e );
            self.commonRouter.showErrorPage(req,res);
        }
    },

    saveAssignRolesCall:function(assignRolesObject,callback){
        this.model.saveAssignRolesModel(assignRolesObject,callback);
    },

    saveAssignRoles: function(req,res){
        try{
            var self = this;
            var assignRolesObj = require(commonDTO+"/assignRoles");
            var assignRolesObject = new assignRolesObj();
            var assignRoles_userID = req.body.usersId;
            var assignRoles_roleID = req.body.rolesId;
            var userName = req.session.userName;
            var tenantID = req.session.tenantId;
            customlog.info(assignRoles_userID);
            assignRolesObject.clearAll();
            assignRolesObject.setSelected_user_id(assignRoles_userID);
            assignRolesObject.setSelected_role_id(assignRoles_roleID);
            this.saveAssignRolesCall(assignRolesObject,function(){
                var activityDetails = new Array(iklantPort, req.session.tenantId, req.session.userId, req.session.userName, req.originalUrl, req.connection.remoteAddress, "router.js", "saveAssignRoles", "success", "Manage Roles", "RoleId "+assignRoles_userID+" Assign Roles successfully","insert");
                self.commonRouter.insertActivityLogModel(activityDetails);
                self.assignRolesCall(tenantID,function(assignRolesObject){
                    self.showAssignRoles(res,userName,assignRolesObject);
                });
            });
        }catch(e){
            customlog.error("Exception while save assign roles "+e);
            self.commonRouter.showErrorPage(req,res);
        }
    },
    populateRolesAndPermissionsDetails: function(req, res) {
        try{
            var self = this;
            var roleId = req.params.roleIdEdit;
            var editRoleName = req.body['roleNameEdit_'+roleId];
            var rest = require("./rest.js");
            var PersonnelHolderObj = require(userManagementDTO +"/PersonnelHolder");
            var personnelHolder = new PersonnelHolderObj();
            var constantsObj = this.constants;

            personnelHolder.setRoleId(roleId);
            var personnelHolderDetail = JSON.stringify(personnelHolder);
            var http = require('http');
            var https = require('https');
            var postheaders = {
                'Content-Type': 'application/json',
                'Content-Length': Buffer.byteLength(personnelHolderDetail, 'utf8'),
                'Cookie': req.session.mifosCookie
            };
            var options = {
                host: mifosServiceIP,
                port: mifosPort,
                path: '/mfi/personnel/loadRolesAndPermissionsByParent.json',
                method: 'POST',
                headers: postheaders
            };

            var resultStatus;
            rest.postJSON(options, personnelHolderDetail, function (statuscode, result, headers) {

                if (statuscode == 302) {
                    res.redirect(props.contextPath+'/client/ci/logout');
                } else {
                    if (result.status == 'success' && result.resultActivitySet != null) {
                        var operationNameArray = req.session.operationName;
                        var operationIdArray = req.session.operationId;
                        res.render("user_management/manageRolesandPermissions", {activitySet: result.resultActivitySet,operationNameArray:operationNameArray,operationIdArray:operationIdArray,userName:req.session.userName,contextPath:props.contextPath,
                            currentOperationIndex:constantsObj.getManageRolesAndPermissionsOperationId(),roleIdArray: "", roleNameArray: "",editRoleName:editRoleName,editRoleId:roleId,constantsObj:constantsObj});
                    }
                }
            });
        }catch(e){
            customlog.error("Exception while PopulateRolesAndPermissions "+e);
            self.commonRouter.showErrorPage(req,res);
        }
    },
    saveNewOfficeCall: function(tenantId,userId,officeObj,callback) {
        this.model.saveNewOfficeModel(tenantId,userId,officeObj,callback);
    },

    saveNewOffice: function(req, res) {
        try{
            var self = this;
            var officeObj = this.office;
            officeObj.clearAll();
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
                officeObj.setOfficeName(req.body.officeName);
                officeObj.setOfficeAddress(req.body.officeAddress);
                self.saveNewOfficeCall(tenantId,userId,officeObj,function(){
                    var activityDetails = new Array(iklantPort, req.session.tenantId, req.session.userId, req.session.userName, req.originalUrl, req.connection.remoteAddress, "router.js", "saveNewOffice", "success", "Manage Office", "Office "+officeObj.getOfficeName()+" Created successfully","insert");
                    self.commonRouter.insertActivityLogModel(activityDetails);
                    self.ListGroupsCall(tenantId,userId,officeId,roleId,constantsObj.getManageOfficeOperationId(),function(listGroupsIdArray,listGroupsArray,activeClients,neededInfo,isSynchronized,listGroupsGlobalNumberArray,fieldOfficerName,neededImageClarity){
                        self.commonRouter.showListGroupsOperations(req, res,constantsObj.getManageOfficeOperationId(),listGroupsIdArray,listGroupsArray,activeClients,neededInfo,isSynchronized,listGroupsGlobalNumberArray,fieldOfficerName,neededImageClarity);
                    });
                });
            }
        }catch(e){
            customlog.error("Exception while Save new office "+e);
            self.commonRouter.showErrorPage(req,res);
        }
    },

    // Added by Paramasivan Modified by Sathish Kumar M 008 For Forgot Password
    retrieveUserDetails: function(userName, emailId, callback) {
        this.model.retrieveUserDetailsModel(userName, emailId, callback);
    },

    updateUserDetails: function(user_id, userName, oldPassword, newPassword, callback) {
        this.model.updateUserDetailsModel(user_id, userName, oldPassword, newPassword, callback);
    },

    getNewPassword : function(req,res) {
        try{
            var self = this;
            var randtoken = require('rand-token');
            var emailId = req.body.email;
            var newPassword = randtoken.generate(8);
            var rest = require("./rest.js");
            var cookie = new Array();
            var mifosCookie;
            self.retrieveUserDetails(req.body.forgotUserName,emailId,function(status,userDetails){
                if(status == "success" && userDetails.length>0){
                    var userName = userDetails[0].user_name;
                    var oldPassword = decrypt(userDetails[0].password,userName);
                    var inpdata = JSON.stringify({
                        username : userName,
                        password : oldPassword});

                    var postHeaders = {
                        'Content-Type' : 'application/json',
                        'Content-Length' : Buffer.byteLength(inpdata, 'utf8')
                    };

                    var option = {
                        host: mifosServiceIP,
                        port: mifosPort,
                        path: '/mfi/j_spring_security_check?j_username='+userName+'&j_password='+oldPassword+'&spring-security-redirect=/sam/auth.json',
                        method: 'POST',
                        headers : postHeaders
                    };
                    rest.postJSON(option,inpdata,function(statuscode,result,headers) {
                        if(statuscode == 302) {
                            res.redirect(props.contextPath+'/client/ci/showErrorPage');
                        }
                        else if(result.status == "success"){
                            cookie = headers['set-cookie'];
                            var jsessionid = rest.get_cookies(cookie[0])['JSESSIONID'];

                            mifosCookie = "JSESSIONID="+jsessionid;

                            var userCredentials = JSON.stringify({
                                username: userName,
                                oldPassword: oldPassword,
                                newPassword: newPassword
                            });
                            var postHeader = {
                                'Content-Type' : 'application/json',
                                'Content-Length' : Buffer.byteLength(userCredentials, 'utf8'),
                                'Cookie' : mifosCookie
                            };
                            var options = {
                                host: mifosServiceIP,
                                port: mifosPort,
                                path: "/mfi/api/user/update/password.json",
                                method: 'POST',
                                headers : postHeader
                            };
                            var encryptedNewPassword = encrypt(newPassword,userName);
                            self.updateUserDetails(userDetails[0].user_id, userName, oldPassword, encryptedNewPassword,function(status){
                                if(status == 'success'){
                                    rest.postJSON(options,userCredentials,function(statuscode,result,headers){
                                        if(statuscode == 302) {
                                            res.redirect(props.contextPath+'/client/ci/showErrorPage');
                                        }
                                        else if(result.status == "success") {
                                            var subject = "Password Reset. Do not reply.";
                                            var text = "Your new password is "+ newPassword;
                                            var toAddress = userDetails[0].email_id;
                                            self.commonRouter.sendEmail(toAddress,props.emailSubject,props.emailText+""+newPassword,function(mailStatus){
                                                if(mailStatus){
                                                    var activityDetails = new Array(iklantPort,1, userDetails[0].user_id, userName, req.originalUrl, req.connection.remoteAddress, "router.js", "getNewPassword", "success", "forget password", "New Password of "+userName+" has been generated and mail has been sent","insert");
                                                    self.commonRouter.insertActivityLogModel(activityDetails);
                                                    res.render('login', { errorMessage: 'New password has been sent to your email ID', contextPath:props.contextPath});

                                                }else{

                                                    res.render('user_management/forgotPassword', { errorMessage: 'Reset password process failed', contextPath:props.contextPath});
                                                }
                                            });

                                        }else{
                                            res.render('user_management/forgotPassword', { errorMessage: 'Reset password process failed', contextPath:props.contextPath});
                                        }
                                    });
                                }
                                else{
                                    res.render('user_management/forgotPassword', { errorMessage: 'Invalid user credentials', contextPath:props.contextPath});
                                }
                            });
                        }
                        else{
                            res.render('user_management/forgotPassword', { errorMessage: 'Invalid user credentials', contextPath:props.contextPath});
                        }
                    });
                }else{
                    res.render('user_management/forgotPassword', { errorMessage: 'Invalid user credentials', contextPath:props.contextPath});
                }
            });
        }
        catch(e){
            customlog.error("Exception while loading getNewPassword " + e);
            res.redirect(props.contextPath + '/client/ci/showErrorPage');
        }
    },
    //Added by SathishKumar 008 for change password
    loadChangePassword : function(req,res){
        try{
            var self = this;
            if(typeof (req.session.tenantId) == 'undefined' || typeof (req.session.userId) == 'undefined') {
                res.redirect(props.contextPath + '/client/ci/showErrorPage');
            }else{
                var pwdChange=1;
                res.render('user_management/changePassword',{contextPath:props.contextPath,userId:req.session.userId,userName:req.session.userName,errorMessage : "",passwordChanged:pwdChange});
            }
        }catch(e){
            customlog.error("Exception while Load Change password "+e);
            self.commonRouter.showErrorPage(req,res);
        }
    },

    validateOldPassword : function (userId,encrptedOldPassword,callback){
        this.model.validateOldPasswordModel (userId,encrptedOldPassword,callback);
    },

    submitChangePassword : function(req,res){
        try{
            var constantsObj = this.constants;
            var cookie;
            var self = this;
            var errorMessage = "";
            if(typeof (req.session.tenantId) == 'undefined' || typeof (req.session.userId) == 'undefined') {
                self.commonRouter.showErrorPage(req,res);
            }else{
                var tenantId = req.session.tenantId;
                var userId = req.session.userId;
                var userName = (typeof req.body.userName == 'undefined')?"":req.body.userName;
                var oldPassword = req.body.oldPassword;
                var newPassword = req.body.confirmPassword;
                var pwdChange=1;
                var encrptedOldPassword = encrypt(oldPassword,userName);
                self.validateOldPassword(userId,encrptedOldPassword,function(oldPasswordStatus){
                    if(oldPasswordStatus == 'old password success'){
                        if(req.session.roleId == constantsObj.getDEOroleId()){
                            self.generateMifosSession(userName,oldPassword,function(mifosCookie){
                                cookie = mifosCookie;
                                customlog.info("Cookie:"+cookie);
                                if(typeof cookie == "") {
                                    self.commonRouter.showErrorPage(req,res);
                                }else{
                                    self.updateNewPassword(userId,userName,oldPassword,newPassword,cookie,function(status){
                                        if(status == 'success'){
                                            errorMessage = "Password Updated Successfully";
                                            req.session.passwordChanged = pwdChange;
                                            var activityDetails = new Array(iklantPort, req.session.tenantId, req.session.userId, req.session.userName, req.originalUrl, req.connection.remoteAddress, "router.js", "submitChangePassword", "success", "Change Old Password", "Password of "+userName+" has been changed successfully","update");
                                            self.commonRouter.insertActivityLogModel(activityDetails);
                                            res.render('user_management/changePassword',{contextPath:props.contextPath,userId:req.session.userId,userName:req.session.userName, errorMessage : errorMessage,passwordChanged:pwdChange});

                                        }
                                        else if(status == 'failure'){
                                            errorMessage = "Error occurred while updating new password";
                                            res.render('user_management/changePassword',{contextPath:props.contextPath,userId:req.session.userId,userName:req.session.userName, errorMessage : errorMessage,passwordChanged:pwdChange});
                                            var activityDetails = new Array(iklantPort, req.session.tenantId, req.session.userId, req.session.userName, req.originalUrl, req.connection.remoteAddress, "router.js", "submitChangePassword", "failure", "Change Old Password", "Error occurred while updating new password. Password of "+userName+" has been tried change" ,"update");
                                            self.commonRouter.insertActivityLogModel(activityDetails);
                                        }
                                        else{
                                            self.commonRouter.showErrorPage(req,res);
                                        }

                                    });
                                }
                            })
                        }
                        else{
                            cookie = req.session.mifosCookie;
                            customlog.info("Cookie:"+cookie);
                            if(typeof cookie == 'undefined') {
                                self.commonRouter.showErrorPage(req,res);
                            }else{
                                self.updateNewPassword(userId,userName,oldPassword,newPassword,cookie,function(status){
                                    if(status == 'success'){
                                        errorMessage = "Password Updated Successfully";
                                        req.session.passwordChanged = pwdChange;
                                        var activityDetails = new Array(iklantPort, req.session.tenantId, req.session.userId, req.session.userName, req.originalUrl, req.connection.remoteAddress, "router.js", "submitChangePassword", "success", "Change Old Password", "Password of "+userName+" has been changed successfully" ,"update");
                                        self.commonRouter.insertActivityLogModel(activityDetails);
                                        res.render('user_management/changePassword',{contextPath:props.contextPath,userId:req.session.userId,userName:req.session.userName, errorMessage : errorMessage,passwordChanged:pwdChange});

                                    }
                                    else if(status == 'failure'){
                                        errorMessage = "Error occurred while updating new password";
                                        var activityDetails = new Array(iklantPort, req.session.tenantId, req.session.userId, req.session.userName, req.originalUrl, req.connection.remoteAddress, "router.js", "submitChangePassword", "failure", "Change Old Password", "Error occurred while updating new password. Password of "+userName+" has been tried change ","update");
                                        self.commonRouter.insertActivityLogModel(activityDetails);
                                        res.render('user_management/changePassword',{contextPath:props.contextPath,userId:req.session.userId,userName:req.session.userName, errorMessage : errorMessage,passwordChanged:pwdChange});
                                    }
                                    else{
                                        self.commonRouter.showErrorPage(req,res);
                                    }
                                });
                            }
                        }
                    }else if(oldPasswordStatus == 'old password failure'){
                        errorMessage = "Invalid old password";
                        res.render('user_management/changePassword',{contextPath:props.contextPath,userId:req.session.userId,userName:req.session.userName, errorMessage : errorMessage,passwordChanged:pwdChange});
                    }else{
                        errorMessage = "Error in validating old password";
                        res.render('user_management/changePassword',{contextPath:props.contextPath,userId:req.session.userId,userName:req.session.userName, errorMessage : errorMessage,passwordChanged:pwdChange});
                    }
                });
            }
        }catch(e){
            customlog.error("Exception while Load Change password "+e);
            self.commonRouter.showErrorPage(req,res);
        }
    },

    updateNewPassword : function(userId,userName,oldPassword,newPassword,cookie,callback){
        var self = this;
        var encyptedOldPassword =  encrypt(oldPassword,userName);
        var encyptedNewPassword =  encrypt(newPassword,userName);
        self.model.changePasswordCall(userId,userName,encyptedOldPassword,encyptedNewPassword, function(status){
            if(status == 'success'){
                var rest = require("./rest.js");
                var http = require('http');
                var https = require('https');
                customlog.info("Cookie:"+cookie);
                if(typeof cookie == 'undefined') {
                    callback('error');
                }
                else {
                    var userCredentials = JSON.stringify({
                        username: userName,
                        oldPassword: oldPassword,
                        newPassword: newPassword
                    });
                    var postHeader = {
                        'Content-Type' : 'application/json',
                        'Content-Length' : Buffer.byteLength(userCredentials, 'utf8'),
                        'Cookie' : cookie
                    };
                    var options = {
                        host: mifosServiceIP,
                        port: mifosPort,
                        path: "/mfi/api/user/update/password.json",
                        method: 'POST',
                        headers : postHeader
                    };
                    rest.postJSON(options,userCredentials,function(statuscode,result,headers){
                        customlog.info("statuscode" + statuscode);
                        if(statuscode == 302){
                            callback('error');
                        }
                        else{
                            if(result.status == 'success'){
                                //errorMessage = "Password Updated Successfully";
                                callback('success');
                                //res.render('changePassword',{contextPath:props.contextPath,userId:req.session.userId,userName:req.session.userName, errorMessage : errorMessage});
                            }else{
                                //errorMessage = "Error occurred while updating new password";
                                callback('failure');
                                //res.render('changePassword',{contextPath:props.contextPath,userId:req.session.userId,userName:req.session.userName, errorMessage : errorMessage});
                            }
                        }
                    });
                }
            }
            else{
                callback('failure');
            }
        });
    },

    generateMifosSession : function(userName,password,callback){
        var rest = require("./rest.js");
        var http = require('http');
        var https = require('https');
        var cookie = "";
        var inpdata = JSON.stringify({
            username : userName,
            password : password});

        var postHeaders = {
            'Content-Type' : 'application/json',
            'Content-Length' : Buffer.byteLength(inpdata, 'utf8')
        };

        var option = {
            host: mifosServiceIP,
            port: mifosPort,
            path: '/mfi/j_spring_security_check?j_username='+userName+'&j_password='+password+'&spring-security-redirect=/sam/auth.json',
            method: 'POST',
            headers : postHeaders
        };
        rest.postJSON(option,inpdata,function(statuscode,result,headers) {
            if(statuscode == 302) {
                callback(cookie);
            }
            else if(result.status == "success"){
                cookie = headers['set-cookie'];
                var jsessionid = rest.get_cookies(cookie[0])['JSESSIONID'];

                cookie = "JSESSIONID="+jsessionid;
                callback(cookie)
            }

        });
    },

    loadForgotPassword : function(req,res){
        try{
            var self = this;
            res.render('user_management/forgotPassword',{contextPath:props.contextPath,errorMessage : ""});
        }catch(e){
            customlog.error("Exception while Load Change password "+e);
            self.commonRouter.showErrorPage(req,res);
        }
    },

    loadUserNameChange: function(req,res){
        var self = this;
        res.render("ChangeUsername",{contextPath:props.contextPath,errorMessage : ""});
    },

    encryptUserDetails : function (userName,callback){
        this.model.encryptUserDetailsModel(userName,callback);
    },

    updateCustomUserDetails : function (user_id, userName, newPassword, callback){
        this.model.updateCustomUserDetailsModel(user_id, userName, newPassword, callback);
    },

    generatePassword : function(req,res){
        var self = this;
        var newUserName = req.body.newUserName;
        var userName = req.body.userName;
        self.encryptUserDetails(userName,function(status,userDetails){
            //console.log("Encrypted = "+encrypt('sbcbm123','sbcbm'));
            if(userDetails.length == 1 ){
                var decryptedPassword = decrypt(userDetails[0].password,userName);
                var encrptedpassword = encrypt(decryptedPassword,newUserName);
                console.log('UPDATE iklant_users SET `password` = "'+encrptedpassword+'" WHERE user_id ='+userDetails[0].user_id+';');
                self.updateCustomUserDetails(userDetails[0].user_id,newUserName,encrptedpassword,function(status){
                    if(status == 'success'){
                        res.render("user_management/ChangeUsername",{contextPath:props.contextPath,errorMessage : "Succesfully changed"});
                    }
                    else{
                        res.render("user_management/ChangeUsername",{contextPath:props.contextPath,errorMessage : "Updated failed"});
                    }
                });
                //console.log(decrypt(userDetails[i].password,userDetails[i].user_name));
                /* if(userDetails[i].password_backup == decrypt(userDetails[i].password,userDetails[i].user_name)){

                 }else{
                 console.log("failure...........");
                 }*/
            }
            else{
                res.render("ChangeUsername",{contextPath:props.contextPath,errorMessage : "Username not found."});
            }
        });
    },

    //Ended by Sathish Kumar M 008
    listExistingReports : function(req,res){
        var self = this;
        try{
            if(req.session.roleId == 2){
                self.model.listExistingReportsModel(function(result,status){
                    if(status == "success"){
                        res.render("user_management/ListExistingReport",{result:result,contextPath:props.contextPath})
                    }
                    else{
                        customlog.error("Error in ListExistingReports query execution");
                        self.commonRouter.showErrorPage(req,res);
                    }

                });
            }
            else{
                self.commonRouter.showErrorPage(req,res);
            }
        }
        catch(e){
            customlog.error("Error in ListExistingReports"+e);
            self.commonRouter.showErrorPage(req,res);
        }
    },

    addReportView : function(req,res){
        var self = this;
        try{
            self.model.showAddReportViewModel(function(ReportParams,ReportRoles,reportCategory,status){
                if(status == "success"){
                    res.render("user_management/AddNewReportView",{ReportParams:ReportParams,ReportRoles:ReportRoles,reportCategory:reportCategory,contextPath:props.contextPath,errorMsg:""})
                }
                else{
                    customlog.error("Error in addReportView query execution");
                    self.commonRouter.showErrorPage(req,res);
                }
            });
        }
        catch(e){
            customlog.error("Error in addReportView"+e);
            self.commonRouter.showErrorPage(req,res);
        }
    },

    CreateDynamicReport : function(req,res){
        var self = this;
        var reportData = new Array();
        reportData.push(req.body.reportName);
        reportData.push(req.body.storedProcedureName);
        reportData.push(req.body.reportCategory);
        reportData.push(req.body.reportParameter.toString());
        reportData.push(req.body.reportRole.toString());
        try{
            self.model.createDynamicReportModel(reportData,function(status){
                if(status == "success"){
                    self.model.showAddReportViewModel(function(ReportParams,ReportRoles,reportCategory,status){
                        if(status == "success"){
                            res.render("user_management/AddNewReportView",{ReportParams:ReportParams,ReportRoles:ReportRoles,reportCategory:reportCategory,contextPath:props.contextPath,errorMsg:"Report has been successfully added."})
                        }
                        else{
                            customlog.error("Error in addReportView query execution");
                            self.commonRouter.showErrorPage(req,res);
                        }
                    });
                }
                else{
                    customlog.error("Error in CreateDynamicReport query execution");
                    self.commonRouter.showErrorPage(req,res);
                }

            });
        }
        catch(e){
            customlog.error("Error in CreateDynamicReport"+e);
            self.commonRouter.showErrorPage(req,res);
        }
    }

}
function encrypt(text,password){
    var cipher = crypto.createCipher('aes-256-ctr',password)
    var crypted = cipher.update(text,'utf8','hex')
    crypted += cipher.final('hex');
    return crypted;
}
function decrypt(text,password){
    var decipher = crypto.createDecipher('aes-256-ctr',password)
    var dec = decipher.update(text,'hex','utf8')
    dec += decipher.final('utf8');
    return dec;
}
function convertToMifosDateFormat(date) {
    var dateInArray = date.split("-");
    return dateInArray[2]+"-"+dateInArray[1]+"-"+dateInArray[0];
}
