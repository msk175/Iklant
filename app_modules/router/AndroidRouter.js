module.exports = androidRouter;
var crypto = require('crypto');
var path = require('path');
var rootPath = path.dirname(process.mainModule.filename);
var props = require(path.join(rootPath,"properties.json"));
mifosServiceIP = props.mifosServiceIp;
mifosPort = props.mifosPort;
GPSPort = props.GPSPort;
iklantPort = props.iklantPort;
var AndroidModel = require(path.join(rootPath,"app_modules/model/AndroidModel"));
var commonModel = require(path.join(rootPath,"app_modules/model/CommonModel"));
var customlog = require(path.join(rootPath,"logger/loggerConfig.js"))('AndroidRouter.js');
var commonDTO = path.join(rootPath,"app_modules/dto/common");
var dateUtils = require(path.join(rootPath,"app_modules/utils/DateUtils"));

function androidRouter(constants,commonRouter) {
    customlog.debug("Inside Android Router");
    this.model = new AndroidModel(constants,commonRouter);
    this.constants = constants;
}

androidRouter.prototype = {

    retriveOfficeName : function(tenant_id,office_id,callback) {
        this.model.retriveOfficeNameModel(tenant_id,office_id,callback);
    },


    ShowIklanToAndroidDetails: function(res,role_id,office_id,officeName,prospectGroupForAndroidObj,
                                        prospectClientForAndroidObj,allDocTypeForAndroidObj,allSubDocTypeForAndroidObj,loanTypeIdArray,
                                        loanTypeArray,operationIdForRoleIdArray,prospectFieldVerificationForAndroidObj,
                                        lookUpEntityForAndroidObj,lookUpValueForAndroidObj) {
        var constantsObj = this.constants;
        var commonDetailsJson = '"Common":'+JSON.stringify({noOfGroups:prospectGroupForAndroidObj.getGroup_id().length,
            officeId : office_id,
            officeName:officeName,
            loanTypeIdListArray : loanTypeIdArray,
            loanTypeListArray :loanTypeArray,
            nextGroupName:prospectGroupForAndroidObj.getNextGroupName()})
        var groupDetailsJson = '"GroupDetails":'+JSON.stringify({});
        if((typeof prospectGroupForAndroidObj != 'undefined') && (typeof allDocTypeForAndroidObj != 'undefined')){
            groupDetailsJson = '"GroupDetails":'+JSON.stringify({groupIdArray:prospectGroupForAndroidObj.getGroup_id(),
                groupGlobalNumberArray:prospectGroupForAndroidObj.getGroup_global_number(),
                groupNameArray:prospectGroupForAndroidObj.getGroup_name(),
                centreNameArray:prospectGroupForAndroidObj.getCenter_name(),
                statusIdArray:prospectGroupForAndroidObj.getStatus_id(),
                groupCreatedDateArray:prospectGroupForAndroidObj.getGroup_created_date(),
                selectedLoanTypeIdArray:prospectGroupForAndroidObj.getLoan_type_id(),
                createdByArray:prospectGroupForAndroidObj.getCreated_by(),
                createdDateArray:prospectGroupForAndroidObj.getCreated_date(),
                areaIdArray:prospectGroupForAndroidObj.getAreaCodes(),
                areaNamesArray:prospectGroupForAndroidObj.getAreaNames(),

                allDocTypeIdArray:allDocTypeForAndroidObj.getDocId(),
                allDocTypeEntityIdArray:allDocTypeForAndroidObj.getDocEntityId(),
                allDocTypeNameArray:allDocTypeForAndroidObj.getDocName(),

                allSubDocTypeIdArray:allSubDocTypeForAndroidObj.getDocTypeId(),
                allSubDocIdArray:allSubDocTypeForAndroidObj.getSubDocId(),
                allSubDocNameArray:allSubDocTypeForAndroidObj.getSubDocName(),

                mobileGroupName:prospectGroupForAndroidObj.getMobile_group_name(),
                neededImageClarityGroup:prospectGroupForAndroidObj.getNeeded_image_clarity(),
                neededInformationArray:prospectGroupForAndroidObj.getNeeded_information(),
                assignedToArray:prospectGroupForAndroidObj.getAssigned_to(),
                loanCountArray:prospectGroupForAndroidObj.getLoanCount()
            })
        }
        var clientDetailsJson = '"ClientDetails":'+JSON.stringify({});
        if(typeof prospectClientForAndroidObj != 'undefined' && prospectClientForAndroidObj != ''){
            clientDetailsJson = '"ClientDetails":'+JSON.stringify({clientGroupIdArray:prospectClientForAndroidObj.getGroup_id(),
                clientIdArray:prospectClientForAndroidObj.getClient_id(),
                clientFirstNameArray:prospectClientForAndroidObj.getClient_first_name(),
                clientLastNameArray:prospectClientForAndroidObj.getClient_last_name(),
                clientStatusIdArray:prospectClientForAndroidObj.getStatus_id(),
                updatedTimeArray:prospectClientForAndroidObj.getUpdated_time(),
                mobileGroupNameClient:prospectClientForAndroidObj.getMobile_group_name_client(),
                neededImageClarityDocsClient:prospectClientForAndroidObj.getNeeded_image_clarity_docs(),
                remarksForNeededImageClarityArray:prospectClientForAndroidObj.getRemarks_for_need_more_information(),
                clientLoanCountArray:prospectClientForAndroidObj.getLoan_count()
            })
        }

        var fieldVerificationJson = '"FV":'+JSON.stringify({});
        if(typeof prospectFieldVerificationForAndroidObj != 'undefined'){
            fieldVerificationJson = '"FV":'+JSON.stringify({fieldVerificationClientIdArray:prospectFieldVerificationForAndroidObj.getClient_id(),
                clientAddressArray:prospectFieldVerificationForAndroidObj.getClient_address(),
                rationCardNumberArray:prospectFieldVerificationForAndroidObj.getRation_card_number(),
                contactNumberArray:prospectFieldVerificationForAndroidObj.getMobile_number(),
                landlineNumberArray:prospectFieldVerificationForAndroidObj.getLandline_number(),
                voterIdArray:prospectFieldVerificationForAndroidObj.getVoter_id(),
                gasNumberArray:prospectFieldVerificationForAndroidObj.getGas_number(),
                aadhaarNumberArray:prospectFieldVerificationForAndroidObj.getAadhaar_number(),
                otherIdNameArray1:prospectFieldVerificationForAndroidObj.getOther_id_name(),
                otherIdArray:prospectFieldVerificationForAndroidObj.getOther_id(),
                otherIdNameArray2:prospectFieldVerificationForAndroidObj.getOther_id_name2(),
                otherIdArray2:prospectFieldVerificationForAndroidObj.getOther_id2(),
                guarantorNameArray:prospectFieldVerificationForAndroidObj.getGuarantor_name(),
                guarantorAddressArray:prospectFieldVerificationForAndroidObj.getGuarantor_address(),
                guarantorIdArray:prospectFieldVerificationForAndroidObj.getGuarantor_id(),
                guarantorRelationshipArray:prospectFieldVerificationForAndroidObj.getGuarantor_relationship(),
                isBankAccountArray:prospectFieldVerificationForAndroidObj.getIs_bank_account(),
                isInsuranceLifetimeArray:prospectFieldVerificationForAndroidObj.getIs_insurance_lifetime(),
                householdDetailsArray:prospectFieldVerificationForAndroidObj.getHousehold_details(),
                timePeriodArray:prospectFieldVerificationForAndroidObj.getTime_period(),
                houseSqftArray:prospectFieldVerificationForAndroidObj.getHouse_sqft(),
                vehicleDetailsArray:prospectFieldVerificationForAndroidObj.getVehicle_details(),
                houseRoomDetailArray:prospectFieldVerificationForAndroidObj.getHouse_room_detail(),
                houseTypeArray:prospectFieldVerificationForAndroidObj.getHouse_type(),
                houseCeilingTypeArray:prospectFieldVerificationForAndroidObj.getHouse_ceiling_type(),
                houseWallTypeArray:prospectFieldVerificationForAndroidObj.getHouse_wall_type(),
                houseToiletArray:prospectFieldVerificationForAndroidObj.getHouse_toilet(),
                houseFlooringDetailArray:prospectFieldVerificationForAndroidObj.getHouse_flooring_detail(),
                entityIdArray:lookUpEntityForAndroidObj.getEntity_id(),
                entityNameArray:lookUpEntityForAndroidObj.getEntity_name(),
                lookUpEntityIdArray:lookUpValueForAndroidObj.getEntity_id(),
                lookupIdArray:lookUpValueForAndroidObj.getLookup_id(),
                lookupValueArray:lookUpValueForAndroidObj.getLookup_value(),
                reInitiatedClientArray:prospectFieldVerificationForAndroidObj.getReinitiated_client(),
                fieldVerificationClientloanCountArray:prospectFieldVerificationForAndroidObj.getLoan_count()
            });
        }
        var SyncDetails = "" ;
        if(operationIdForRoleIdArray.indexOf(constantsObj.getGroupCreationOperationId()) > -1){
            SyncDetails = commonDetailsJson;
        }
        if(operationIdForRoleIdArray.indexOf(constantsObj.getPreliminaryVerificationOperationId()) > -1){
            SyncDetails = commonDetailsJson +","+ groupDetailsJson;
        }
        if(operationIdForRoleIdArray.indexOf(constantsObj.getKYCUploadingOperationId()) > -1){
            SyncDetails = commonDetailsJson +","+ groupDetailsJson +","+ clientDetailsJson;
        }
        if(operationIdForRoleIdArray.indexOf(constantsObj.getFieldVerificationOperationId()) > -1){
            SyncDetails = commonDetailsJson +","+ groupDetailsJson +","+ clientDetailsJson+","+fieldVerificationJson;
        }
        customlog.info("SyncDetails: "+SyncDetails);
        SyncDetails = "{"+ SyncDetails +"}";
        res.write(SyncDetails);
        res.end();
    },

    iklanToAndroidDetailsSyncCall: function(tenant_id,office_id,user_id,role_id,callback) {
        this.model.iklanToAndroidDetailsSyncModel(tenant_id,office_id,user_id,role_id,callback);
    },

    ShowIklanToAndroidNoDetails: function(res,role_id,prospectGroupForAndroidObj) {
        customlog.info("Inside iklanToAndroidDetails - else noGroup-method");
        res.write(JSON.stringify({noOfGroups:prospectGroupForAndroidObj.getGroup_id().length}));
        res.end();
    },

    iklanToAndroidDetailsSync: function(req, res) {
        var self = this;
        var tenant_id=req.body.tenant_id;
        var office_id=req.body.office_id;
        var user_id=req.body.user_id;
        var role_id=req.body.role_id;

        customlog.info('tenant_id '+tenant_id+' office_id '+office_id);
        self.iklanToAndroidDetailsSyncCall(tenant_id,office_id,user_id,role_id,function(operationIdForRoleIdArray,prospectGroupForAndroidObj,loanTypeIdArray,loanTypeArray,
                    prospectClientForAndroidObj,allDocTypeForAndroidObj,allSubDocTypeForAndroidObj,prospectFieldVerificationForAndroidObj,lookUpEntityForAndroidObj,lookUpValueForAndroidObj){
            if(prospectGroupForAndroidObj.getNextGroupName() != "") {
                self.retriveOfficeName(tenant_id,office_id,function(officeName){
                    self.ShowIklanToAndroidDetails(res,role_id,office_id,officeName,prospectGroupForAndroidObj,prospectClientForAndroidObj,allDocTypeForAndroidObj,allSubDocTypeForAndroidObj,loanTypeIdArray,
                        loanTypeArray,operationIdForRoleIdArray,prospectFieldVerificationForAndroidObj,lookUpEntityForAndroidObj,lookUpValueForAndroidObj);


                });
            }
            else{
                self.ShowIklanToAndroidNoDetails(res,role_id,prospectGroupForAndroidObj);
            }
        });
    },

    readOfficeCoordinatesCall: function(officeId, callback) {
        this.model.readOfficeCoordinatesModel(officeId, callback);
    },

    readOfficeCoordinates: function(officeId, sendResponseCallBack) {
        var self=this;
        self.readOfficeCoordinatesCall(officeId,function(status,coordinates){
            if(status == 'success'){
                if(coordinates.getLatitude() && coordinates.getLongitude()){
                    customlog.debug("coordinates is available");
                    customlog.debug(coordinates);
                } else {
                    customlog.debug("coordinates is null");
                }
            }
            sendResponseCallBack(coordinates);
        });
    },

    //Kumaran
    //Json authentication-Android
    showauthentication : function(req,res,result,tenant_id,office_id,role_id,user_id,contact_number,
                                  assignRolesObj,roleOperationObj,manageRolesObj,officeCoordinates) {
        try{
            if(result == "true"){
                res.write(
                    JSON.stringify({
                        result						:	result,
                        tenantId					:	tenant_id,
                        officeId					:	office_id,
                        roleId						:	role_id,
                        userId						:	user_id,
                        contactNumber				:	contact_number,
                        roleIdArray		 			: 	assignRolesObj.getRole_id(),
                        roleNameArray	 			:	assignRolesObj.getRole_name(),
                        roleOperationRoleIdArray	:	roleOperationObj.getRoleId(),
                        roleOperationOperationIdArray:	roleOperationObj.getOperationId(),
                        operationIdArray			:	manageRolesObj.getOperation_id(),
                        operationNameArray			:	manageRolesObj.getOperation_name(),
                        officeCoordinates			:	officeCoordinates
                    })
                );
            }
            customlog.info("result: "+result);
            res.end();
            customlog.info("success");
        }catch(e){
            customlog.error("Exception while show authentication "+e);
            self.commonRouter.showErrorPage(req,res);
        }
    },

    authenticationCall: function(userName,password ,callback) {
        this.model.authenticationModel(userName,password ,callback);
    },

    authentication: function(req, res) {
        try{
            var self = this;
            var userName=req.body.userName;
            var password=req.body.password;
            customlog.info("UserName="+userName+"  password="+password);
            password = encrypt(req.body.password,userName);
            customlog.info("UserName="+userName+"  password="+password);
            var gcmRegId =  req.body.gcmRegId;
            if(typeof gcmRegId == 'undefined' )
            {
                this.authenticationCall(userName,password ,function(result,tenant_id,office_id,role_id,user_id,
                            contact_number,assignRolesObj,roleOperationObj,manageRolesObj){
                    if(result == "true"){
                        self.readOfficeCoordinates(office_id,function(officeCoordinates){
                            self.showauthentication(req,res,result,tenant_id,office_id,role_id,user_id,
                                contact_number,assignRolesObj,roleOperationObj,manageRolesObj,officeCoordinates);
                        });
                    }else{
                        self.showauthentication(req,res,result,tenant_id,office_id,role_id,user_id,
                            contact_number,assignRolesObj,roleOperationObj,manageRolesObj);
                    }
                });
            }
            else
            {
                this.authenticationCallLD(userName,password,gcmRegId,function(result,tenant_id,office_id,role_id,user_id,contact_number,assignRolesObj,roleOperationObj,manageRolesObj){
                    if(result == "true"){
                        self.readOfficeCoordinates(office_id,function(officeCoordinates){
                            self.showauthentication(req,res,result,tenant_id,office_id,role_id,user_id,
                                contact_number,assignRolesObj,roleOperationObj,manageRolesObj,officeCoordinates);
                        });
                    } else {
                        self.showauthentication(req,res,result,tenant_id,office_id,role_id,user_id,
                            contact_number,assignRolesObj,roleOperationObj,manageRolesObj);
                    }
                });
            }
        }catch(e){
            customlog.error("Exception while authentication "+e);
            self.commonRouter.showErrorPage(req,res);
        }
    },

    // Dhinakaran
    authenticationCallLD: function(userName,password,gcmRegId,callback) {
        this.model.authenticationModelLDCallTrack(userName,password,gcmRegId,callback);
    },

    saveGroupAndroidCall: function(userId,officeId,jsonObjectGCDetails,jsonObjectUserDetails,callback) {
        this.model.saveGroupAndroidModel(userId,officeId,jsonObjectGCDetails,jsonObjectUserDetails,callback);
    },

    //GroupCreation from Android
    doGroupCreationAndroid : function(req,res){
        customlog.info("........Group Creation Started.........");
        var constantsObj = this.constants;
        var jsonObjectGCDetails = req.body.jsonObjectGC;
        var jsonObjectUserDetails = req.body.jsonObjectUser;
        //prospectGroup dto require
        var prospectGroupRef = require(commonDTO +"/prospectGroup");
        var prosGroup = new prospectGroupRef();
        var self= this;
        customlog.info("tenantId: "+jsonObjectUserDetails.tenantId);
        customlog.info("userId: "+jsonObjectUserDetails.userId);
        customlog.info("conNo: "+jsonObjectUserDetails.contactNumber);
        customlog.info("roleId: "+jsonObjectUserDetails.roleId);

        var tenantId=jsonObjectUserDetails.tenantId;
        var userId=jsonObjectUserDetails.userId;
        var roleId=jsonObjectUserDetails.roleId;
        var officeId=jsonObjectUserDetails.officeId;
        var userContactNumber=jsonObjectUserDetails.contactNumber;

        prosGroup.setTenant_id(tenantId);
        prosGroup.setOffice_id(officeId);
        customlog.info("jsonlength "+jsonObjectGCDetails.length);
        try{
            self.saveGroupAndroidCall(userId,officeId,jsonObjectGCDetails,jsonObjectUserDetails,function(groupName){
                customlog.info("inside saveGroupAndroidCall ");
                if(typeof groupName !='undefined'){
                    var data = {};
                    data.userId = userId;
                    data.tenantId = tenantId;
                    data.contactNumber = userContactNumber;
                    data.taskDescription = "New Group Creation ("+groupName+")";
                    customlog.info("groupName "+groupName);
                    self.commonRouter.submitTaskService(req,res,data);
                }
                res.end();
            });
        }catch(e){
            customlog.error("Exception GroupCreation Router: "+e);
            self.commonRouter.showErrorPage(req,res);
        }
    },

    //PreliminaryVerification from Android
    doPreVerificationAndroid: function(req,res) {
        var self = this;
        var constantsObj = this.constants;
        var tenantId=req.body.jsonObjectUser.tenantId;
        var userId=req.body.jsonObjectUser.userId;
        var roleId=req.body.jsonObjectUser.roleId;
        var officeId=req.body.jsonObjectUser.officeId;
        var userContactNumber=req.body.jsonObjectUser.contactNumber;
        customlog.info("inside doPreVerificationAndroid ");

        //prospectGroup dto require
        var prospectGroupRef = require(commonDTO +"/prospectGroup");
        var prosGroup = new prospectGroupRef();
        //preliminaryVerification dto require
        var preliminaryVerificationRef = require(commonDTO +"/preliminaryVerification");
        var preVerification = new preliminaryVerificationRef();
        preVerification.clearAll();
        if(req.body.jsonObjectPV.mobGroupStatusFlag == 2 || req.body.jsonObjectPV.mobGroupStatusFlag == 23 ||
            req.body.jsonObjectPV.mobGroupStatusFlag == 12 || req.body.jsonObjectPV.mobGroupStatusFlag == 123){
            var groupNamePV = req.body.jsonObjectPV.groupNamePV;
            customlog.info("groupNamePV : "+groupNamePV);
            prosGroup.setGroup_created_date(req.body.jsonObjectPV.groupCreatedDate);
            preVerification.setloan_active_from(req.body.jsonObjectPV.lastActiveDate);
            preVerification.setis_savings_discussed(req.body.jsonObjectPV.savingsDiscussed);
            preVerification.setis_complete_attendance(req.body.jsonObjectPV.completeAttendance);
            preVerification.setis_bank_account(req.body.jsonObjectPV.isBankAccount);
            preVerification.setbank_name(req.body.jsonObjectPV.bankName);
            preVerification.setaccount_number(req.body.jsonObjectPV.accountNumber);
            preVerification.setaccount_created_date(req.body.jsonObjectPV.accountCreatedDate);
            preVerification.setno_of_credit_transaction(req.body.jsonObjectPV.creditTransaction) //deposits;
            preVerification.setno_of_debit_transaction(req.body.jsonObjectPV.debitTransaction) //withdrawals

            self.retrieveGroupDetail(userId,tenantId,groupNamePV,function(groupId,groupName,loanCounter){
                customlog.info("groupIdRouter : "+groupId+" groupName :"+groupName);
                preVerification.setgroup_id(groupId);
                self.verifyGroupCall(userId,prosGroup,preVerification,function(remarks) {
                    //Submit Task
                    var data = {};
                    data.userId = userId;
                    data.tenantId = tenantId;
                    data.contactNumber = userContactNumber;
                    data.taskDescription = "Preliminary Verification ("+groupName+")";
                    self.commonRouter.submitTaskService(req,res,data);
                    res.end();
                });
            });
        }
    },

    verifyGroupCall:function(userId,prosGroup,preVerification,callback) {
        this.model.verifyGroupModel(userId,prosGroup,preVerification,callback);
    },

    retrieveGroupDetail : function(userId,tenantId,groupName,callback){
        this.model.retrieveGroupDetailModel(userId,tenantId,groupName,callback);
    },
    retrieveKycAndroidGroupDetail : function(userId,tenantId,groupName,loanCount,callback){
        if(loanCount == 0)
            this.model.retrieveGroupDetailModel(userId,tenantId,groupName,callback);
        else
            this.model.retrieveKycAndroidGroupDetailModel(userId,tenantId,groupName,loanCount,callback);
    },


    checkClientDocAvailability : function(groupId,androidDocName,callback){
           this.model.checkClientDocAvailabilityModel(groupId,androidDocName,callback);
    },

    retrieveGroupDetails : function(req,res) {
        try{
            var self	= this;
            var constantsObj = this.constants;
            var accountId = req.params.accountId;
            var backFlag = req.params.backFlag;
            var userId = req.session.userId;
            self.getGroupsDetailsForRecoveryPage(userId,accountId,function(accountDetailsArray){
                self.recoveryReasons(function(recoveryReasonId,recoveryReasonDescription){
                    if(req.session.roleId == constantsObj.getSMHroleId()) {
                        res.render('groupsDetailsForRecoveryReadOnly',{alertMsg:"",accountDetailsArray : accountDetailsArray, recoveryReasonId : recoveryReasonId,recoveryReasonDescription : recoveryReasonDescription,constantsObj:constantsObj, contextPath:props.contextPath});
                    }
                    else if(req.session.browser == "mobile") {
                        res.render('Mobile/groupsDetailsForRecoveryMobile',{alertMsg:"",accountDetailsArray : accountDetailsArray, recoveryReasonId : recoveryReasonId,recoveryReasonDescription : recoveryReasonDescription,backFlag:backFlag, contextPath:props.contextPath});
                    }
                    else {
                        res.render('groupsDetailsForRecovery',{alertMsg:"",accountDetailsArray : accountDetailsArray, recoveryReasonId : recoveryReasonId,recoveryReasonDescription : recoveryReasonDescription,backFlag:backFlag, contextPath:props.contextPath});
                    }
                });
            });
        }catch(e){
            customlog.error("Exception while retrieve Group Details "+e);
            self.commonRouter.showErrorPage(req,res);
        }
    },

    getGroupsDetailsForRecoveryPage : function(userId,accountId,callback) {
        this.model.getGroupDetailsForRecoveryModel(userId,accountId,callback);
    },

    recoveryReasons : function(callback){
        this.model.getRecoveryReasons(callback);
    },

    doFieldVerificationAndroid : function(req,res){
        var self = this;
        var prosClientHouseDetailObj = require(commonDTO +"/prospectClientHouseDetail");
        var tenantId=req.body.jsonObjectUser.tenantId;
        var userId=req.body.jsonObjectUser.userId;
        var roleId=req.body.jsonObjectUser.roleId;
        var officeId=req.body.jsonObjectUser.officeId;
        var userContactNumber=req.body.jsonObjectUser.contactNumber;
        var constantsObj = this.constants;
        var fieldVerificationReference = require(commonDTO +"/fieldVerification");
        var fieldVerificationValue = new fieldVerificationReference();

        if(req.body.jsonObject.statusId == constantsObj.getNeedInformation()){
            var clientID = req.body.jsonObject.clientID;
            customlog.info("clientID "+clientID);
            var remarks = req.body.jsonObject.remarks;
            self.commonRouter.needClarificationDetailsCall(clientID,remarks,function(groupid){});
            res.end();
        }
        else{
            fieldVerificationValue.setClient_address_matched(req.body.jsonObject.clientAddressMatched);
            fieldVerificationValue.setRc_number_matched(req.body.jsonObject.clientRcNoMatched);
            fieldVerificationValue.setPhone_number_matched(req.body.jsonObject.clientPhoneNumberMatched);
            fieldVerificationValue.setId_proof_matched(req.body.jsonObject.clientIdProofMatched);
            fieldVerificationValue.setGuarantor_address_matched(req.body.jsonObject.guarantorAddressMatched);
            customlog.info("guarantorAddressMatchedRouter: "+req.body.jsonObject.guarantorAddressMatched);
            customlog.info("guarantorAddressMatchedRouterGet: "+fieldVerificationValue.getGuarantor_address_matched());

            fieldVerificationValue.setGuarantor_relationship_matched(req.body.jsonObject.guarantorRelationMatched);
            fieldVerificationValue.setIs_GuarantorIdProof_Matched(req.body.jsonObject.guarantorIdProofMatched);
            fieldVerificationValue.setBank_details_matched(req.body.jsonObject.bankDetailsMatched);
            fieldVerificationValue.setInsurance_details_matched(req.body.jsonObject.insuranceDetailsMatched);
            fieldVerificationValue.setIs_ClientAddressProofId_provided(req.body.jsonObject.isClientAddressProvided);
            fieldVerificationValue.setIs_ClientProofId_provided(req.body.jsonObject.isClientIdProvided);
            customlog.info("guarantorAddress : "+req.body.jsonObject.isGuarantorAddressProvided);
            fieldVerificationValue.setIs_GuarantorAddressProofId_provided(req.body.jsonObject.isGuarantorAddressProvided);
            fieldVerificationValue.setIs_GuarantorProofId_provided(req.body.jsonObject.isGuarantorIdProvided);

            //Dhinakaran
            var isOtherId1Provided = (typeof req.body.jsonObject.otherId1Provided == 'undefined')?0:req.body.jsonObject.otherId1Provided;
            var isOtherId2Provided = (typeof req.body.jsonObject.otherId2Provided == 'undefined')?0:req.body.jsonObject.otherId2Provided;
            fieldVerificationValue.setIs_OtherId1_provided(isOtherId1Provided);
            fieldVerificationValue.setIs_OtherId2_provided(isOtherId2Provided);
            var prospectClientHouseDetailToUpdate = new prosClientHouseDetailObj();
            prospectClientHouseDetailToUpdate.setHouse_type(req.body.jsonObject.houseType);
            if(typeof(req.body.jsonObject.timePeriod) == 'undefined' | req.body.jsonObject.timePeriod == '' |  req.body.jsonObject.timePeriod== 'NULL' ){
                prospectClientHouseDetailToUpdate.setTime_period(0);
            }
            else{
                prospectClientHouseDetailToUpdate.setTime_period(req.body.jsonObject.timePeriod);
            }

            if(typeof(req.body.jsonObject.houseSQFT) == 'undefined' | req.body.jsonObject.houseSQFT == '' |  req.body.jsonObject.houseSQFT== 'NULL' ){
                prospectClientHouseDetailToUpdate.setHouse_sqft(0);
            }
            else{
                prospectClientHouseDetailToUpdate.setHouse_sqft(req.body.jsonObject.houseSQFT);
            }

            prospectClientHouseDetailToUpdate.setHouse_ceiling_type(req.body.jsonObject.ceilingType);
            prospectClientHouseDetailToUpdate.setHouse_wall_type(req.body.jsonObject.wallType);
            prospectClientHouseDetailToUpdate.setHouse_flooring_detail(req.body.jsonObject.floorDetails);
            prospectClientHouseDetailToUpdate.setHouse_room_detail(req.body.jsonObject.roomDetails);
            prospectClientHouseDetailToUpdate.setVehicle_details(req.body.jsonObject.vehicleDetails);
            prospectClientHouseDetailToUpdate.setHouse_toilet(req.body.jsonObject.HouseToilet);
            var clientIdArray = new Array();
            customlog.info(""+req.body.jsonObject.clientID);
            var clientId = req.body.jsonObject.clientID;
            customlog.info("Inside retrieve method..............");
            var client_name = req.body.jsonObject.clientName;
            customlog.info("clientName "+req.body.jsonObject.clientName);
            clientIdArray = req.body.jsonObject.clientID;
            fieldVerificationValue.setClient_id(clientIdArray);
            fieldVerificationValue.setClientAddressProofId(req.body.jsonObject.clientAddressProof);
            fieldVerificationValue.setClientProofId(req.body.jsonObject.clientIdProof);
            fieldVerificationValue.setGuarantorAddressProofId(req.body.jsonObject.guarantorAddressProof);
            fieldVerificationValue.setGuarantorProofId(req.body.jsonObject.guarantorIdProof);
            fieldVerificationValue.setRemarks(req.body.jsonObject.remarks);
            if(typeof req.body.jsonObject.loanCounter != 'undefined'){
                fieldVerificationValue.setLoanCounter(req.body.jsonObject.loanCounter);
            }
            else{
                fieldVerificationValue.setLoanCounter(1);
            }
            var errorfield = "";
            self.commonRouter.insertFieldVerificationDetailsCall(fieldVerificationValue,prospectClientHouseDetailToUpdate,function(groupid,status_name){
                var activityDetails = new Array(iklantPort, tenantId, userId, "", req.originalUrl, req.connection.remoteAddress, "router.js", "doFieldVerificationAndroid", "success", "Field Verification Android", "Field Verification From Android Successfully for "+clientIdArray,"insert");
                self.commonRouter.insertActivityLogModel(activityDetails);
                var data = {};
                data.userId = userId;
                data.tenantId = tenantId;
                data.contactNumber = userContactNumber;
                data.taskDescription = "Field Verification ("+client_name+")";
                self.commonRouter.submitTaskService(req,res,data);
                res.end();
            });
        }
    },

    loanSanctionAndroidCall: function(userId,tenantId,officeId,roleId,callback) {
        this.model.loanSanctionAndroidModel(userId,tenantId,officeId,roleId,callback);
    },

    doLoanSanctionAndroid : function(req,res){
        customlog.info("........Loan sanction Started.........");
        var self = this;
        var tenant_id=req.body.tenant_id;
        var office_id=req.body.office_id;
        var user_id=req.body.user_id;
        var role_id=req.body.role_id;
        var constantsObj = this.constants;
        customlog.info('tenant_id '+tenant_id+' office_id '+office_id);
        this.loanSanctionAndroidCall(user_id,tenant_id,office_id,role_id,function(prospectGroupForAndroidObj,prospectClientForAndroidObj){
            self.retriveOfficeName(tenant_id,office_id,function(officeName){
                self.ShowLoanSanctionToAndroidDetails(res,role_id,office_id,officeName,prospectGroupForAndroidObj,prospectClientForAndroidObj);
            });
        });
    },

    ShowLoanSanctionToAndroidDetails: function(res,role_id,office_id,officeName,prospectGroupForAndroidObj,prospectClientForAndroidObj) {
        var commonDetailsJson = '"Common":'+JSON.stringify({noOfGroups:prospectGroupForAndroidObj.getGroup_id().length,
            officeId : office_id,
            officeName:officeName,
            nextGroupName:prospectGroupForAndroidObj.getNextGroupName()})
        var groupDetailsJson = '"GroupDetails":'+JSON.stringify({});
        if((typeof prospectGroupForAndroidObj != 'undefined')){
            groupDetailsJson = '"GroupDetails":'+JSON.stringify({groupIdArray:prospectGroupForAndroidObj.getGroup_id(),
                groupGlobalNumberArray:prospectGroupForAndroidObj.getGroup_global_number(),
                groupNameArray:prospectGroupForAndroidObj.getGroup_name(),
                centreNameArray:prospectGroupForAndroidObj.getCenter_name(),
                statusIdArray:prospectGroupForAndroidObj.getStatus_id(),
                groupCreatedDateArray:prospectGroupForAndroidObj.getGroup_created_date(),
                selectedLoanTypeIdArray:prospectGroupForAndroidObj.getLoan_type_id(),
                createdByArray:prospectGroupForAndroidObj.getCreated_by(),
                createdDateArray:prospectGroupForAndroidObj.getCreated_date(),
                mobileGroupName:prospectGroupForAndroidObj.getMobile_group_name(),
                neededImageClarityGroup:prospectGroupForAndroidObj.getNeeded_image_clarity(),
                neededInformationArray:prospectGroupForAndroidObj.getNeeded_information(),
                assignedToArray:prospectGroupForAndroidObj.getAssigned_to()
            })
        }
        var clientDetailsJson = '"ClientDetails":'+JSON.stringify({});
        if(typeof prospectClientForAndroidObj != 'undefined'){
            clientDetailsJson = '"ClientDetails":'+JSON.stringify({clientGroupIdArray:prospectClientForAndroidObj.getGroup_id(),
                clientIdArray:prospectClientForAndroidObj.getClient_id(),
                clientFirstNameArray:prospectClientForAndroidObj.getClient_first_name(),
                clientLastNameArray:prospectClientForAndroidObj.getClient_last_name(),
                clientStatusIdArray:prospectClientForAndroidObj.getStatus_id(),
                updatedTimeArray:prospectClientForAndroidObj.getUpdated_time(),
                mobileGroupNameClient:prospectClientForAndroidObj.getMobile_group_name_client(),
                neededImageClarityDocsClient:prospectClientForAndroidObj.getNeeded_image_clarity_docs()
            })
        }
        var SyncDetails = commonDetailsJson +","+ groupDetailsJson +","+ clientDetailsJson ;
        SyncDetails = "{"+ SyncDetails +"}";
        customlog.info("SyncDetails: "+SyncDetails);
        res.write(SyncDetails);
        res.end();
    },

    doGcmRegistration : function(reg,res) {
        var userId = reg.body.userId;
        var gcmRegId = reg.body.gcmRegId;
        this.model.doGcmRegistrationModel(userId,gcmRegId,function(status){
            customlog.info("status : in router "+status);
            res.write(JSON.stringify({
                    status: status,
                    gcmRegId:gcmRegId
            }));
            res.end();
        });
    },

    //Dhinakaran
    doAndroidLogFileUpload : function(req,res) {
        customlog.info("doAndroidLogFileUpload............................................");
        var details = req.files.uploadDocument.originalname;
        var fs1=require('fs');
        var os = fs1.createWriteStream(props.logPath+"/Android/Users/"+details);
        var util = require('util');
        var is = fs1.createReadStream(req.files.uploadDocument.path) ;
        is.pipe(os);
        is.on('end', function() {
            customlog.info('Successfully uploaded');
            var http = require('http');
            var HTTPStatus = require('http-status');
            res.send(HTTPStatus[200]);
            res.end();
        });
        fs1.unlink(req.files.uploadDocument.path, function(err){
            if(err){ customlog.error('Error while unlinking '+err); }
            else { customlog.info('Successfully unlinked');};
        });
        is.on('error', function(err) { customlog.error("error"); });
    },

    getDisplayNameCall: function(userId,callback) {
        this.model.getDisplayNameModel(userId,callback);
    },

    getEmailIdOfBM: function(officeId,callback){
        this.model.getEmailIdOfBMmodel(officeId,callback);
    },

    LRGPSNotificationAndroidCall: function(userId,officeId,collectedDetails,callback) {
        this.model.LRGPSNotificationAndroidModel(userId,officeId,collectedDetails,callback);
    },

    doLRGPSNotificationAndroid : function(req,res){
        var http = require('http');
        var HTTPStatus = require('http-status');
        customlog.info("........ LRGPS Notification Started .........");
        if(typeof (req.body.paymentCollectionArray) == 'undefined' || typeof (req.body.jsonObjectUser) == 'undefined') {
            customlog.error("doLRGPSNotificationAndroid(): paymentCollectionDetails is undefined.");
        }else{
            var self = this;
            var constantsObj = this.constants;
            var paymentCollectionDetailsArray = req.body.paymentCollectionArray;
            var jsonObjectUserDetails = req.body.jsonObjectUser;
            customlog.info("paymentCollectionDetailsArray: ",paymentCollectionDetailsArray);
            customlog.info("tenantId: "+jsonObjectUserDetails.tenantId);
            customlog.info("userId: "+jsonObjectUserDetails.userId);
            customlog.info("conNo: "+jsonObjectUserDetails.contactNumber);
            customlog.info("roleId: "+jsonObjectUserDetails.roleId);
            var tenantId=jsonObjectUserDetails.tenantId;
            var userId=jsonObjectUserDetails.userId;
            var roleId=jsonObjectUserDetails.roleId;
            var officeId=jsonObjectUserDetails.officeId;
            var userContactNumber=jsonObjectUserDetails.contactNumber;
            try{
                var isSendNotification = true;
                if(props.notificationRestrictionforDeviation){
                    var restrictedOffice = props.notificationRestrictionforDeviation.split(',');
                    customlog.info("restricted offices for LR notification ",restrictedOffice);
                    for(var i=0;i<restrictedOffice.length;i++){
                        if(restrictedOffice[i] == officeId) {
                            isSendNotification = false;
                        }
                    }
                }
                if(paymentCollectionDetailsArray.length > 0 && isSendNotification){
                    self.LRGPSNotificationAndroidCall(userId,officeId,paymentCollectionDetailsArray,function(status, paymentCollectionVisitedStatus){
                        if(status == "success"){
                            if(paymentCollectionVisitedStatus ){
                                self.getEmailIdOfBM(officeId,function(status,emailIdResult){
                                    if(status == 'success' && emailIdResult != null){
                                        self.getDisplayNameCall(userId,function(status,displayName){
                                            if(status == 'success'){
                                                var tableStyle = "border-collapse:collapse;border-spacing:0;border-color:#999;";
                                                var tdStyle = "font-family:Arial, "+
                                                    "sans-serif;font-size:14px;padding:10px 5px;border-style:solid;"+
                                                    "border-width:1px;overflow:hidden;word-break:normal;border-color:#999;"+
                                                    "color:#444;background-color:#F7FDFA;"
                                                var thStyle = "font-family:Arial, sans-serif;font-size:14px;font-weight:normal;padding:10px 5px;"+
                                                    "border-style:solid;border-width:1px;overflow:hidden;word-break:normal;"+
                                                    "border-color:#999;color:#fff;background-color:#26ADE4;"
                                                var centerText = "text-align:center;"
                                                var bolder = "font-weight:bold;text-align:center;";
                                                var redFont = "color:red;";
                                                var notificationContent = "<p><h3>Loan Recovery Status for "+displayName+"</h3></p>";
                                                notificationContent += "<table border='2',style='"+tableStyle+"'>"+
                                                    "<tr>"+
                                                    "<th style='"+thStyle+centerText+"'>S.No</th>"+
                                                    "<th style='"+thStyle+"'>Loan Account Number</th>"+
                                                    "<th style='"+thStyle+"'>Address</th>"+
                                                    "<th style='"+thStyle+"'>Visited / Not Visited </th>"+
                                                    "<th style='"+thStyle+centerText+"'>Collection Status</th>"+
                                                    "</tr>";
                                                for(var i=0; i<paymentCollectionVisitedStatus.length; i++){
                                                    notificationContent+=
                                                        "<tr>"+
                                                            "<td style='"+tdStyle+centerText+"'>"+(i+1)+"</td>"+
                                                            "<td style='"+tdStyle+"'>"+paymentCollectionVisitedStatus[i].loanAccountId+"</td>"+
                                                            "<td style='"+tdStyle+"'>"+paymentCollectionVisitedStatus[i].address+"</td>";
                                                    if(paymentCollectionVisitedStatus[i].visitedStatus == constantsObj.getNotVisitedStatus()){
                                                        notificationContent+=
                                                            "<td style='"+tdStyle+centerText+bolder+redFont+"'>Not visited</td>";
                                                    } else
                                                    if(paymentCollectionVisitedStatus[i].visitedStatus == constantsObj.getVisitedStatus()){
                                                        notificationContent+=
                                                            "<td style='"+tdStyle+centerText+bolder+"'>visited</td>";
                                                    } else
                                                    if(paymentCollectionVisitedStatus[i].visitedStatus == constantsObj.getNoAddressCoordinatesStatus()){
                                                        notificationContent+=
                                                            "<td style='"+tdStyle+centerText+bolder+"'>Not able to locate the address by the map</td>";
                                                    }
                                                    if(paymentCollectionVisitedStatus[i].collectionStatus == constantsObj.getNotCollectedStatus()){
                                                        notificationContent+=
                                                            "<td style='"+tdStyle+centerText+bolder+redFont+"'>Not collected</td>";
                                                    } else
                                                    if(paymentCollectionVisitedStatus[i].collectionStatus == constantsObj.getCollectedStatus()){
                                                        notificationContent+=
                                                            "<td style='"+tdStyle+centerText+bolder+"'>collected</td>";
                                                    }
                                                    notificationContent+=
                                                        "</tr>";
                                                }
                                                notificationContent+="</table>"
                                                customlog.debug(emailIdResult);
                                                self.commonRouter.sendEmail(emailIdResult,"Travelling path deviation Notification for "+displayName,notificationContent,function(status){
                                                    if(status){
                                                        customlog.info("mail sent for LR notification");
                                                        res.end();
                                                    } else {
                                                        customlog.error("mail not sent for LR notification");
                                                        res.send(HTTPStatus[201]);
                                                    }
                                                });
                                            } else {
                                                customlog.error('error no details for the user for field officer LR notification');
                                                res.send(HTTPStatus[201]);
                                            }
                                        });
                                    } else {
                                        customlog.error('error getting the BM email id for field officer LR notification');
                                        res.send(HTTPStatus[201]);
                                    }
                                });
                            } else {
                                customlog.error('doLRGPSNotificationAndroid(): PaymentCollectionVisited Status is undefined');
                                res.send(HTTPStatus[201]);
                            }
                        } else {
                            customlog.error("doLRGPSNotificationAndroid(): error in datamodel");
                            res.send(HTTPStatus[201]);
                        }
                    });
                } else  {
                    customlog.info("Collections not available / restricted to send mail for this office");
                    res.send(HTTPStatus[201]);
                }
            }catch(e){
                customlog.error("Exception doLRGPSNotificationAndroid Router: "+e);
                res.send(HTTPStatus[201]);
            }
        }
    },

    insertNOCDocuments: function(clientId, fileName,callback) {
        this.model.insertNOCDocumentsModel(clientId, fileName, callback);
    },

    uploadNOC: function(req, res) {
        try{
            var self = this;
            var tenantId = req.session.tenantId;
            var userId = req.session.userId;
            var clientId = req.body.selectedClientForNOCUpload;
            var clientName = req.body.selectedClientNameForNOCUpload;
            var groupId = req.body.groupnamefordownload;
            var constantsObj = this.constants;
            var statusId = req.body.statusId;
            var isMobile = req.body.isMobile;
            var currentDate = new Date();
            var pageName = req.body.pageName;
            var fs = require('fs'),
                util = require('util');
            var fileName = new Array();
            if(typeof isMobile == 'undefined' && (typeof tenantId == 'undefined' || typeof userId == 'undefined' || typeof req.session.officeId == 'undefined')) {
                res.redirect(props.contextPath+'/client/ci/login');
            }
            else {
                if(isMobile == "true") {
                    tenantId = req.body.tenantId;
                    userId = req.body.userId;
                }
                var isMulitpleDoc = req.body.isMultipleDocument;
                if(isMulitpleDoc=="true"){
                    for(var i=0; i<req.files.multipleUploadDocument.length; i++){
                        var fileType = req.files.multipleUploadDocument[i].name.split('.');
                        fileName[i] = clientId+"_"+clientName+"_NOC_"+(currentDate.getFullYear()+"_"+(currentDate.getMonth()+1)+"_"+currentDate.getTime())+i+"."+fileType[1];
                        var is = fs.createReadStream(req.files.multipleUploadDocument[i].path);
                        var os = fs.createWriteStream(rootPath+"/documents/client_documents/"+fileName[i]);
                        is.pipe(os);
                        is.on('end', function() {
                            alertMsg = "File has been Uploaded Successfully!"
                        });
                        fs.unlink(req.files.multipleUploadDocument[i].path, function(err){
                            if(err){ customlog.error('Error while unlinking '+err); }
                            else { customlog.info('Successfully unlinked');};
                        });
                        is.on('error', function(err) { customlog.error("error while uploading "+err); });
                    }
                }
                else{
                    if(req.files.singleUploadDocument.name!=""){
                        var fileType = req.files.singleUploadDocument.name.split('.');
                        fileName[0] = clientId+"_"+clientName+"_NOC_"+(currentDate.getFullYear()+"_"+(currentDate.getMonth()+1)+"_"+currentDate.getTime())+"0."+fileType[1];
                        if(req.files.singleUploadDocument.name!=""){
                            var is = fs.createReadStream(req.files.singleUploadDocument.path)
                            var os = fs.createWriteStream(rootPath+"/documents/client_documents/"+fileName[0]);
                            is.pipe(os);
                            is.on('end', function() {
                                if(isMobile != "true")
                                    alertMsg = "Files has been Uploaded Successfully!"
                            });
                            fs.unlink(req.files.singleUploadDocument.path, function(err){
                                if(err){ customlog.error('Error while unlinking '+err); }
                                else { customlog.info('Successfully unlinked');};
                            });
                            is.on('error', function(err) { customlog.error("error while uploading "+err); });
                        }
                    }
                }
                self.insertNOCDocuments(clientId, fileName, function(status){
                    if(status == 'success'){
                        var statusMessage = (fileName.length>1)?"NOC Documents are uploaded successfully":"NOC Document uploaded successfully";
                        if(pageName == 'cca1') {
                            self.commonRouter.ccaCall1(tenantId, groupId, function (groupId, unAppraisedClients, appraisedClientsObj, countOfRejectedClients) {
                                self.commonRouter.showCcaSummary(res, groupId, unAppraisedClients, appraisedClientsObj, countOfRejectedClients, '', statusMessage, clientId, '', "",constantsObj,req.session.roleId);
                            });
                        }
                        else if(pageName == 'manageIdleGroups'){
                            var clientTotalWeightageRequired =req.body.clientTotalWeightageRequiredHiddenCCA1Name;
                            self.commonRouter.retrieveIdleClientsCall(tenantId,groupId,statusId, function(groupId,unAppraisedClients,appraisedClientsObj,countOfRejectedClients,isIdle, noOfIdleDays, lastCreditCheckDate){
                                self.commonRouter.showIdleClientsSummary(res,groupId,unAppraisedClients,appraisedClientsObj,countOfRejectedClients,clientId,clientTotalWeightageRequired,statusMessage,"","",isIdle, noOfIdleDays, lastCreditCheckDate,statusId);
                            });
                        }
                        else if(isMobile == "true"){
                            var http = require('http');
                            var HTTPStatus = require('http-status');
                            res.send(HTTPStatus[200]);

                        }
                        else{
                            self.commonRouter.rejectedClientDetailsCall(tenantId,clientId,function(groupId,clientId,client_global_number,client_name,client_status_desc,client_status_id,group_status_id,group_name,center_name,remarks,remarksForRejection){
                                self.commonRouter.retrieveDocTypeList(tenantId,function(docTypeIdArray,docTypeNameArray){
                                    self.commonRouter.showRejectedClientDetails(req,res,groupId,clientId,client_global_number,client_name,client_status_desc,client_status_id,group_status_id,group_name,center_name,docTypeIdArray,docTypeNameArray, req.session.officeId,statusMessage,remarks,remarksForRejection);
                                });
                            });
                        }
                    }
                    else{
                        if(isMobile == "true"){
                            var http = require('http');
                            var HTTPStatus = require('http-status');
                            res.send(HTTPStatus[201]);
                        }
                        else {
                            self.commonRouter.showErrorPage(req, res);
                        }
                    }
                });
            }
        }catch(e){
            customlog.error("Exception while upload noc "+e);
            self.commonRouter.showErrorPage(req,res);
        }
    },

    /*uploadNOC: function(req, res) {
        try{
            var self = this;
            var tenantId = req.session.tenantId;
            var userId = req.session.userId;
            var clientId = req.body.selectedClientForNOCUpload;
            var clientName = req.body.selectedClientNameForNOCUpload;
            var groupId = req.body.groupnamefordownload;
            var constantsObj = this.constants;
            var statusId = req.body.statusId;

            var currentDate = new Date();
            var pageName = req.body.pageName;
            var fs = require('fs'),
                util = require('util');
            var fileName = new Array();
            if(typeof tenantId == 'undefined' || typeof userId == 'undefined' || typeof req.session.officeId == 'undefined') {
                res.redirect(props.contextPath+'/client/ci/login');
            }
            else {
                var isMulitpleDoc = req.body.isMultipleDocument;
                if(isMulitpleDoc=="true"){
                    for(var i=0; i<req.files.multipleUploadDocument.length; i++){
                        var fileType = req.files.multipleUploadDocument[i].name.split('.');
                        fileName[i] = clientId+"_"+clientName+"_NOC_"+(currentDate.getFullYear()+"_"+(currentDate.getMonth()+1)+"_"+currentDate.getTime())+i+"."+fileType[1];
                        var is = fs.createReadStream(req.files.multipleUploadDocument[i].path);
                        var os = fs.createWriteStream(rootPath+"/documents/client_documents/"+fileName[i]);
                        is.pipe(os);
                        is.on('end', function() {
                            alertMsg = "File has been Uploaded Successfully!"
                        });
                        fs.unlink(req.files.multipleUploadDocument[i].path, function(err){
                            if(err){ customlog.error('Error while unlinking '+err); }
                            else { customlog.info('Successfully unlinked');};
                        });
                        is.on('error', function(err) { customlog.error("error while uploading "+err); });
                    }
                }
                else{
                    if(req.files.singleUploadDocument.name!=""){
                        var fileType = req.files.singleUploadDocument.name.split('.');
                        fileName[0] = clientId+"_"+clientName+"_NOC_"+(currentDate.getFullYear()+"_"+(currentDate.getMonth()+1)+"_"+currentDate.getTime())+"0."+fileType[1];
                        if(req.files.singleUploadDocument.name!=""){
                            var is = fs.createReadStream(req.files.singleUploadDocument.path)
                            var os = fs.createWriteStream(rootPath+"/documents/client_documents/"+fileName[0]);
                            is.pipe(os);
                            is.on('end', function() {
                                alertMsg = "Files has been Uploaded Successfully!"
                            });
                            fs.unlink(req.files.singleUploadDocument.path, function(err){
                                if(err){ customlog.error('Error while unlinking '+err); }
                                else { customlog.info('Successfully unlinked');};
                            });
                            is.on('error', function(err) { customlog.error("error while uploading "+err); });
                        }
                    }
                }
                self.insertNOCDocuments(clientId, fileName, function(status){
                    if(status == 'success'){
                        var statusMessage = (fileName.length>1)?"NOC Documents are uploaded successfully":"NOC Document uploaded successfully";
                        if(pageName == 'cca1') {
                            self.commonRouter.ccaCall1(tenantId, groupId, function (groupId, unAppraisedClients, appraisedClientsObj, countOfRejectedClients) {
                                self.commonRouter.showCcaSummary(res, groupId, unAppraisedClients, appraisedClientsObj, countOfRejectedClients, '', statusMessage, clientId, '', "");
                            });
                        }
                        else if(pageName == 'manageIdleGroups'){
                            var clientTotalWeightageRequired =req.body.clientTotalWeightageRequiredHiddenCCA1Name;
                            self.commonRouter.retrieveIdleClientsCall(tenantId,groupId,statusId, function(groupId,unAppraisedClients,appraisedClientsObj,countOfRejectedClients,isIdle, noOfIdleDays, lastCreditCheckDate){
                                self.commonRouter.showIdleClientsSummary(res,groupId,unAppraisedClients,appraisedClientsObj,countOfRejectedClients,clientId,clientTotalWeightageRequired,statusMessage,"","",isIdle, noOfIdleDays, lastCreditCheckDate,statusId);
                            });
                        }
                        else{
                            self.commonRouter.rejectedClientDetailsCall(tenantId,clientId,function(groupId,clientId,client_global_number,client_name,client_status_desc,client_status_id,group_status_id,group_name,center_name,remarks,remarksForRejection){
                                self.commonRouter.retrieveDocTypeList(tenantId,function(docTypeIdArray,docTypeNameArray){
                                    self.commonRouter.showRejectedClientDetails(req,res,groupId,clientId,client_global_number,client_name,client_status_desc,client_status_id,group_status_id,group_name,center_name,docTypeIdArray,docTypeNameArray, req.session.officeId,statusMessage,remarks,remarksForRejection);
                                });
                            });
                        }
                    }
                    else{
                        self.commonRouter.showErrorPage(req,res);
                    }
                });
            }
        }catch(e){
            customlog.error("Exception while upload noc "+e);
            self.commonRouter.showErrorPage(req,res);
        }
    },*/

    // Dhinakaran
    insertdocumentDetailsCallAndroid: function(userId,docEntityId,captured_image,client_id,doc_type_id,doc_name,
                                               groupId,groupName,clientName,clientLastName,newClientGlobalNumber,tempCount,totalClients,loanCount,androidDocName,callback) {
        this.model.insertdocumentDetailsAndroidModel(userId,docEntityId,captured_image,client_id,doc_type_id,doc_name,
            groupId,groupName,clientName,clientLastName,newClientGlobalNumber,tempCount,totalClients,loanCount,androidDocName,callback);
    },

    /// Dhinakaran
     insertKycNeedImgDocumentDetailsCallAndroid: function(userId,docEntityId,captured_image,client_id,doc_type_id,doc_name,
                    groupId,groupName,clientName,clientLastName,newClientGlobalNumber,tempCount,totalClients,loanCount,androidDocName,callback) {
        this.model.insertKycNeedImgDocumentDetailsCallAndroidModel(userId,docEntityId,captured_image,client_id,doc_type_id,doc_name,
                    groupId,groupName,clientName,clientLastName,newClientGlobalNumber,tempCount,totalClients,loanCount,androidDocName,callback);
     },

    checkGroupClientAvailabilityCallAndroid: function(userId,docEntityId,captured_image,client_id,doc_type_id,doc_name,
                                                      groupId,groupName,clientName,clientLastName,newClientGlobalNumber,tempCount,totalClients,loanCount,androidDocName,callback) {
        this.model.checkGroupClientAvailabilityCallAndroidModel(userId,docEntityId,captured_image,client_id,doc_type_id,doc_name,
            groupId,groupName,clientName,clientLastName,newClientGlobalNumber,tempCount,totalClients,loanCount,androidDocName,callback);
    },

    // Dhinakaran
    androidUploadingImage:function(req,res) {
        customlog.info('In Uploading!');
        var self = this;
        var constantsObj = this.constants;
        var docEntityId = req.params.id;
        var mkdirp = require('mkdirp');

        if(req.files.uploadDocument.originalname!=""){

            var loanCount = req.body.loanCount;
            var groupLoanCount = req.body.groupLoanCount;
            if(typeof groupLoanCount == 'undefined' || groupLoanCount == null) {
                groupLoanCount = 0;
            }
            if((typeof loanCount == 'undefined') || loanCount == 0)
                loanCount = 1;
            var details = req.files.uploadDocument.originalname.split("*");
            var groupNameAndroid = details[0];
            var userId = details[6];
            var tenantId = details[5];
            var androidDocName = req.files.uploadDocument.originalname;
            androidDocName = androidDocName.replace("*","_");
            customlog.info('details from androind: '+groupNameAndroid+' @User ID: '+userId+' @Tenant ID: '+tenantId);
            self.retrieveKycAndroidGroupDetail(userId,tenantId,groupNameAndroid,groupLoanCount,function(groupId,groupName,loanCounter){
                customlog.info("Router : androidUploadingImage : FilePath = "+req.files.uploadDocument.path);
                customlog.info("Router : androidUploadingImage: FileName = "+req.files.uploadDocument.name);
                self.checkClientDocAvailability(groupId,androidDocName,function(isDocAvailable){
                    if(isDocAvailable == 'false')  {
                      //  androidDocName
                //customlog.info("Router :androidUploadingImage: androidDocName already not available = "+androidDocName);
                var details = req.files.uploadDocument.originalname.split("*");
               // customlog.info("Router :androidUploadingImage: Document name = "+details);

                var tempClientId  = 0;
                var clientId = details[1];

                customlog.info("Router :androidUploadingImage: Client ID  = "+clientId);
                var clientFirstName = details[2];
                var clientLastName = details[3];
                var docTypeId = details[4];
                var contactNumber = details[7];
                var isNewClient = details[8]; // its denote existing client or newly create client

                customlog.info("Router :androidUploadingImage: isNewClient   = "+isNewClient);
                var totalClients = details[9];
                var subDocId = details[10];
                var totalDocs = details[11];

                if(typeof subDocId == 'undefined' || subDocId == null || (subDocId.indexOf(".jpg") > -1)) {
                    subDocId = 0;
                    docTypeId = docTypeId + ":" + subDocId;
                }else {
                    docTypeId = docTypeId + ":" + subDocId;
                }
                if(typeof totalDocs == 'undefined' || totalDocs == null) {
                    totalDocs = 0;
                    totalClients = totalClients + ":" +totalDocs;
                }else{
                    totalClients = totalClients + ":" +totalDocs;
                }

                var docName = "";
                var capturedImage = "";
                var os = "";
                var fs1=require('fs');
                var folderPath = "";
                var documentWritePath = "";
                //customlog.info("Router :androidUploadingImage: docEntityId  = "+docEntityId);
                if(docEntityId == constantsObj.getGroupDocsEntity()){
                    docName = groupId+"_"+groupName+"_"+details[4]+"_"+dateUtils.getCurrentTimeStamp();
                    capturedImage = "documents/group_documents/"+loanCounter+"/"+groupName+"/"+docName+".jpg";
                    folderPath = rootPath+"/documents/group_documents/"+loanCounter+"/"+groupName;
                    documentWritePath = rootPath+"/documents/group_documents/"+loanCounter+"/"+groupName+"/"+docName+".jpg";
                }
                else if(docEntityId == constantsObj.getClientDocsEntity()){
                    var newClientGlobalNumber = "";
                    if(clientId == tempClientId){
                        //tempCount ++;
                        var tempClientFirstName  = clientFirstName.split(" ");
                        if(tempClientFirstName[1]>9){
                            newClientGlobalNumber = groupName + "-" + (tempClientFirstName[1]);
                        }else{
                            newClientGlobalNumber = groupName + "-0" + (tempClientFirstName[1]);
                        }
                        //Submit Task GPS
                        var data = {};
                        data.userId = userId;
                        data.tenantId = tenantId;
                        data.contactNumber = contactNumber;
                        data.taskDescription = "KYC Uploading ("+clientFirstName+")";
                        self.commonRouter.submitTaskService(req,res,data);
                        //self.showAndroidUploadingImage(res);
                    }
                    docName = groupId+"_"+groupName+"_"+details[2]+"_"+details[4]+"_"+dateUtils.getCurrentTimeStamp();

                    customlog.info("Router :uploaded Doc Name : "+docName);

                    capturedImage = "documents/client_documents/"+loanCounter+"/"+groupName+"/"+docName+".jpg";
                    folderPath = rootPath+"/documents/client_documents/"+loanCounter+"/"+groupName;
                    documentWritePath = rootPath+"/documents/client_documents/"+loanCounter+"/"+groupName+"/"+docName+".jpg";
                    /*if(loanCounter>1){
                     folderPath = rootPath+"/documents/client_documents/"+loanCounter+"/"+groupName;
                     documentWritePath = rootPath+"/documents/client_documents/"+loanCounter+"/"+groupName+"/"+docName+".jpg";
                     }
                     else{
                     documentWritePath = rootPath+"/documents/client_documents/"+docName+".jpg";
                     }*/
                }
                mkdirp(folderPath, 0777, function (err) {
                    os = fs1.createWriteStream(documentWritePath);
                    var util = require('util');
                    var is = fs1.createReadStream(req.files.uploadDocument.path) ;
                    is.pipe(os);
                    is.on('end', function() {
                        customlog.info('Successfully uploaded file going to insert db values......');
                        if(docEntityId == constantsObj.getGroupDocsEntity()){
                            self.insertdocumentDetailsCallAndroid(userId, docEntityId, capturedImage, clientId, docTypeId, docName,
                                groupId, groupName, clientFirstName, clientLastName, newClientGlobalNumber, isNewClient, totalClients,loanCount,androidDocName,function (status) {
                                    fs1.unlink(req.files.uploadDocument.path, function(err){
                                        if(err){ customlog.error('Error while unlinking group docs '+err); }
                                        else { customlog.info('Successfully unlinked group docs');};
                                    });
                                    var http = require('http');
                                    var HTTPStatus = require('http-status');
                                    if (status == 'failure') {
                                        customlog.error(HTTPStatus[200]);
                                        customlog.error("sending Failure response for inserting group docs");
                                        res.send(HTTPStatus[201]);
                                    }
                                    else {
                                        customlog.info(HTTPStatus[200]);
                                        customlog.info("sending success response for inserting group docs");
                                        res.send(HTTPStatus[200]);
                                    }
                                    res.end();

                                });
                        }
                        else if(docEntityId == constantsObj.getClientDocsEntity()){
                            if (isNewClient !=0){//} || clientId == 0) {
                                customlog.info("Router :androidUploadingImage: going to insert new client " );
                                customlog.info("Router :androidUploadingImage: isNewClient || clientId  = "+clientId +" isNewClient :"+isNewClient );
                                self.insertdocumentDetailsCallAndroid(userId, docEntityId, capturedImage, clientId, docTypeId, docName,
                                    groupId, groupName, clientFirstName, clientLastName, newClientGlobalNumber, isNewClient, totalClients,loanCount,androidDocName,function (status) {
                                        fs1.unlink(req.files.uploadDocument.path, function(err){
                                            if(err){ customlog.info('Error while unlinking existing client docs '+err); }
                                            else { customlog.info('Successfully unlinked existing client docs');};
                                        });
                                        var http = require('http');
                                        var HTTPStatus = require('http-status');
                                        if (status == 'failure') {
                                            customlog.error(HTTPStatus[200]);
                                            customlog.error("sending Failure response for inserting existing client docs");
                                            res.send(HTTPStatus[201]);
                                        }
                                        else {
                                            customlog.info(HTTPStatus[200]);
                                            customlog.info("sending success response for inserting existing client docs");
                                            res.send(HTTPStatus[200]);
                                        }
                                        res.end();

                                    });
                            }else {
                                customlog.info("Router :androidUploadingImage: going to update existing client" );
                                customlog.info("Router :androidUploadingImage: isNewClient || clientId  = "+clientId +" isNewClient :"+isNewClient );
                                self.checkGroupClientAvailabilityCallAndroid(userId, docEntityId, capturedImage, clientId, docTypeId, docName,
                                    groupId, groupName, clientFirstName, clientLastName, newClientGlobalNumber, isNewClient, totalClients,loanCount,androidDocName,function (status,callback_clientId)
                                    {
                                        //clientId = (status == 'success')?callback_clientId:clientId;
                                        if(status == 'success' && callback_clientId != -1)
                                        {
                                            clientId = callback_clientId;
                                            isNewClient = 1;
                                            self.insertdocumentDetailsCallAndroid(userId, docEntityId, capturedImage, clientId, docTypeId, docName,
                                                groupId, groupName, clientFirstName, clientLastName, newClientGlobalNumber, isNewClient, totalClients,loanCount,androidDocName, function (status) {
                                                    fs1.unlink(req.files.uploadDocument.path, function(err){
                                                        if(err){ customlog.info('Error while unlinking existing client docs '+err); }
                                                        else { customlog.info('Successfully unlinked existing client docs');};
                                                    });
                                                    var http = require('http');
                                                    var HTTPStatus = require('http-status');
                                                    if (status == 'failure') {
                                                        customlog.error(HTTPStatus[200]);
                                                        customlog.error("sending Failure response for inserting existing client docs");
                                                        res.send(HTTPStatus[201]);
                                                    }
                                                    else {
                                                        customlog.info(HTTPStatus[200]);
                                                        customlog.info("sending success response for inserting existing client docs");
                                                        res.send(HTTPStatus[200]);
                                                    }
                                                    res.end();

                                                });
                                        }else
                                        {
                                self.insertKycNeedImgDocumentDetailsCallAndroid(userId, docEntityId, capturedImage, clientId, docTypeId, docName,
                                    groupId, groupName, clientFirstName, clientLastName, newClientGlobalNumber, isNewClient, totalClients,loanCount,androidDocName, function (status) {
                                        fs1.unlink(req.files.uploadDocument.path, function(err){
                                            if(err){ customlog.error('Error while unlinking new client docs '+err); }
                                            else { customlog.info('Successfully unlinked new client docs');};
                                        });
                                        var http = require('http');
                                        var HTTPStatus = require('http-status');
                                        if (status == 'failure') {
                                            customlog.error(HTTPStatus[200]);
                                            customlog.error("sending Failure response for inserting new client docs");
                                            res.send(HTTPStatus[201]);
                                        }
                                        else {
                                            customlog.info(HTTPStatus[200]);
                                            customlog.info("sending success response for inserting new client docs");
                                            res.send(HTTPStatus[200]);
                                                }
                                                res.end();

                                            });
                                        }

                                });
                            }

                        }
                    });
                    is.on('error', function(err) { customlog.error("error"); });
                });
                }else{
                        customlog.info("Router :androidUploadingImage: androidDocName already available = "+androidDocName);
                        var http = require('http');
                        var HTTPStatus = require('http-status');
                        customlog.info(HTTPStatus[200]);
                        customlog.info("sending success response for duplicate entry");
                        res.send(HTTPStatus[200]);
                        res.end();
                }
            });
        });
        }
    },

    // Dhinakaran
    insertLoanSanctionDetailsCallAndroid:function(capturedImage,clientId,docTypeId,docName,groupId,groupName,callback){
        this.model.insertLoanSanctionDetailsCallAndroidModel(capturedImage,clientId,docTypeId,docName,groupId,groupName,callback)
    },

    // Dhinakaran
    androidUploadingLoanSanctionImage:function(req,res){
        customlog.info('Loan sanction  Uploading!');
        var self = this;
        var constantsObj = this.constants;
        var docEntityId = req.params.id;
        if(req.files.uploadDocument.originalname!=""){
            var details = req.files.uploadDocument.originalname.split("_");

            customlog.info("Router : androidUploadingImage : FilePath = "+req.files.uploadDocument.path);
            customlog.info("Router : androidUploadingImage: FileName = "+req.files.uploadDocument.name);

            var details = req.files.uploadDocument.originalname.split("_");
            customlog.info("Router :androidUploadingImage: Document name = "+details);
            var groupName = details[0];
            var groupId  = details[1];
            var clientId = details[2];
            var clientFirstName = details[3];
            var docTypeId = details[4];
            var tenantId = details[5];
            var userId = details[6];
            var contactNumber = details[7];
            var docName = "";
            var capturedImage = "";
            var os = "";
            var fs1=require('fs');

            docName = clientId+"_"+clientFirstName+"_"+docTypeId+"_"+dateUtils.getCurrentTimeStamp();
            capturedImage = "documents/client_documents/"+docName+".jpg";
            os = fs1.createWriteStream(rootPath+"/documents/client_documents/"+docName+".jpg");

            var util = require('util');
            var is = fs1.createReadStream(req.files.uploadDocument.path) ;
            is.pipe(os);
            is.on('end', function() {
                customlog.info('Successfully uploaded file going to insert db values......');
                capturedImage,clientId,docTypeId,docName,groupId,groupName
                self.insertLoanSanctionDetailsCallAndroid(capturedImage,clientId,docTypeId,docName,groupId,groupName, function (status) {
                    var http = require('http');
                    var HTTPStatus = require('http-status');
                    if (status == 'failure') {
                        customlog.error(HTTPStatus[200]);
                        customlog.error("sending Failure response for inserting in kyc dbs");
                        res.send(HTTPStatus[201]);
                    }
                    else {
                        customlog.info(HTTPStatus[200]);
                        customlog.info("sending success response for inserting in kyc dbs");
                        res.send(HTTPStatus[200]);
                    }
                    res.end();

                });
            });
            fs1.unlink(req.files.uploadDocument.path, function(err){
                if(err){ customlog.error('Error while unlinking '+err); }
                else { customlog.info('Successfully unlinked');};
            });
            is.on('error', function(err) { customlog.error("error"); });
        }
    },

    insertdocumentDetailsPmtCollCall: function(captured_image,client_id,doc_type_id,doc_name,group_id,callback) {
        this.model.insertdocumentDetailsPmtCollModel(captured_image,client_id,doc_type_id,doc_name,group_id,callback);
    },

    FromPaymentCollectionUploadingImage:function(req,res) {
        customlog.info('FromPaymentCollectionUploadingImage Entry');
        var self = this;
        var http = require('http');
        var HTTPStatus = require('http-status');
        if(typeof req.params.id != 'undefined') {
            var group_id = req.params.id;
        }
        var details = req.files.uploadDocument.originalname.split("*");
        var doc_name = details[0]+"_"+details[3]+"_"+details[2]+"_"+dateUtils.getCurrentTimeStamp();
        var group_id = details[0];
        var client_id = details[7];
        var doc_type_id = details[2];
        var captured_image = "documents/client_documents/"+doc_name+".jpg";
        customlog.info('FromPaymentCollectionUploadingImage : Account ID :'+group_id +" Payment Collection ID : "+client_id);
        customlog.info('FromPaymentCollectionUploadingImage : Document Name : '+doc_name);
        var tenant_id = details[4];
        var user_id = details[5];
        var contactNumber = details[6];
        customlog.info('FromPaymentCollectionUploadingImage : Loan Officer ID : '+user_id);
        if(req.files.uploadDocument.originalname!=""){
            var fs1=require('fs');
            var util = require('util');
            var is = fs1.createReadStream(req.files.uploadDocument.path)
            var os = fs1.createWriteStream(rootPath+"/documents/client_documents/"+doc_name+".jpg");
            is.pipe(os);
            is.on('end', function() {
                customlog.info('FromPaymentCollectionUploadingImage : Successfully uploaded');
                self.insertdocumentDetailsPmtCollCall(captured_image,client_id,doc_type_id,doc_name,group_id,function(flag){
                    customlog.info('FromPaymentCollectionUploadingImage : Successfully insert into payment collection tables');
                    if(flag == "Success"){
                        var data = {};
                        data.userId = user_id;
                        data.tenantId = tenant_id;
                        data.contactNumber = contactNumber;
                        data.taskDescription = "KYC Uploading ("+details[3]+")";
                        //self.submitTaskService(data);
						self.commonRouter.submitTaskService(req,res,data);
                        customlog.info(HTTPStatus[200]);
                        customlog.info('FromPaymentCollectionUploadingImage : Success response send to mobile');
                        res.send(HTTPStatus[200]);
                    }else if(flag == "Failure"){
                        customlog.info(HTTPStatus[201]);
                        customlog.info('FromPaymentCollectionUploadingImage : Failure response send to mobile');
                        res.send(HTTPStatus[201]);
                    }
                });
            });
            fs1.unlink(req.files.uploadDocument.path, function(err){
                if(err){ customlog.error('Error while unlinking '+err); }
                else { customlog.info('FromPaymentCollectionUploadingImage : Successfully unlinked');};
            });
            is.on('error', function(err) { customlog.error("FromPaymentCollectionUploadingImage : error while uploading "+err); });
            customlog.info("FromPaymentCollectionUploadingImage  :"+client_id +  doc_type_id + doc_name + captured_image +"   " + group_id);
        }
    }
}

function encrypt(text,password){
    var cipher = crypto.createCipher('aes-256-ctr',password)
    var crypted = cipher.update(text,'utf8','hex')
    crypted += cipher.final('hex');
    return crypted;
}