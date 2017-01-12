module.exports = dataEntry;

var path = require('path');
var rootPath = path.dirname(process.mainModule.filename);
var dtoPathDE = path.join(rootPath,"app_modules/dto/data_entry");
var props = require(path.join(rootPath,"properties.json"));
mifosServiceIP = props.mifosServiceIp;
mifosPort = props.mifosPort;
GPSPort = props.GPSPort;
iklantPort = props.iklantPort;
var commonDTO = path.join(rootPath,"app_modules/dto/common");
var dateUtils = require(path.join(rootPath,'app_modules/utils/DateUtils'));

var DataEntryModel = require(path.join(rootPath,"app_modules/model/DataEntryModel"));

var customlog = require(path.join(rootPath,"logger/loggerConfig.js"))('DataEntryRouter.js');

function dataEntry(constants) {
    customlog.debug("Inside Router");
    this.model = new DataEntryModel(constants);
    this.constants = constants;
}

dataEntry.prototype = {
    KYC_Download:function(req,res) {
        try{
            var group_id=req.params.groupId;
            var memberId=req.body.memberID;
            var docType=req.body.documentTypeID;
            var self = this;
            var reqOfficeId = (typeof req.body.listoffice != 'undefined')?req.body.listoffice:(typeof req.body.reqOfficeHidden != 'undefined')?req.body.reqOfficeHidden:req.session.officeId;
            var tenantId = req.session.tenantId;
            var userId = req.session.userId;
            var custom_access_type = req.body.retrieveType;
            var access_type_id = props.accessType;
            var localMachineIp = props.loacalMachineIP;

            var menu = req.body.menuName;
            if(typeof tenantId == 'undefined' || typeof userId == 'undefined' || typeof req.session.operationId == 'undefined') {
                res.redirect(props.contextPath+'/client/ci/login');
            }
            else {
                self.KYC_DownloadCall(group_id,memberId,docType,access_type_id,localMachineIp,function(status,base64ImageArray,groupId,memberId,docType,memberIdArray,memberNameArray,docIdArray,docNameArray,docTypeIdArray,docTypeNameArray){
                    self.showKYC_Download(res,base64ImageArray,groupId,memberId,docType,memberIdArray,memberNameArray,docTypeIdArray,docTypeNameArray,reqOfficeId,status,menu);
                });
            }
        }catch(e){
            customlog.error("Exception while Kyc download "+e);
            self.commonRouter.showErrorPage(req,res);
        }
    },
    showKYC_Download: function(res,image,groupId,memberId,docType,memberIdArray,memberNameArray,docTypeIdArray,docTypeNameArray,officeId,status,menu) {
        res.render('data_entry/KYC_Download.jade', {image:image,groupId:groupId,memberId:memberId, memberIdArray:memberIdArray,memberNameArray:memberNameArray ,
            docTypeIdArray:docTypeIdArray,docTypeNameArray:docTypeNameArray,docType:docType,officeValue:officeId,status:status, contextPath:props.contextPath,menu:menu});
    },

    KYC_DownloadNew:function(req,res) {
        try{
            var group_id=req.params.groupId;
            var memberId=req.body.memberID;
            var docType=req.body.documentTypeID;
            //var memberId=3;
            var self = this;
            var tenantId = req.session.tenantId;
            var userId = req.session.userId;
            var custom_access_type = req.body.retrieveType;
            var access_type_id = props.accessType;
            var localMachineIp = props.loacalMachineIP;
            if(typeof tenantId == 'undefined' || typeof userId == 'undefined' || typeof req.session.operationId == 'undefined') {
                res.redirect(props.contextPath+'/client/ci/login');
            }
            else {
                self.KYC_DownloadCall(group_id,memberId,docType,access_type_id,localMachineIp,function(status,base64ImageArray,groupId,memberId,docType,memberIdArray,memberNameArray,docTypeIdArray,docTypeNameArray){
                    req.body.docTypeIdArray = docTypeIdArray;
                    req.body.docTypeNameArray = docTypeNameArray;
                    req.body.base64ImageArray = base64ImageArray;
                    req.body.groupId = groupId;
                    req.body.memberId = memberId;
                    req.body.memberIdArray = memberIdArray;
                    req.body.memberNameArray = memberNameArray;
                    req.body.status = status;
                    res.send(req.body);
                });
            }
        }catch(e){
            customlog.error("Exception while Kyc download new "+e);
            self.commonRouter.showErrorPage(req,res);
        }
    },
    KYC_DownloadCall: function(group_id,memberId,docType,access_type_id,localMachineIp,callback) {
        this.model.KYC_DownloadModel(group_id,memberId,docType,access_type_id,localMachineIp,callback);
    },
    KYC_Updating: function(req,res){
        try{
            var self = this;
            var pageName = req.body.pageName;
            var successMessage="";
            var tenantId = req.session.tenantId;
            var userId = req.session.userId;
            var roleId = req.session.roleId;
            var reqOfficeId = (typeof req.body.listoffice != 'undefined')?req.body.listoffice:(typeof req.body.reqOfficeHidden != 'undefined')?req.body.reqOfficeHidden:req.session.officeId;
            var officeId = req.session.officeId;
            var operationId = req.params.operationId;
            var docType=req.body.documentTypeID;
            var menu = req.body.menuName;
            var constantsObj = this.constants;
            var access_type_id = props.accessType;
            var localMachineIp = props.loacalMachineIP;
            if(typeof tenantId == 'undefined' || typeof userId == 'undefined' || typeof req.session.operationId == 'undefined') {
                res.redirect(props.contextPath+'/client/ci/login');
            }
            else {
                var groupId = req.params.id;
                var isDataVerified = req.params.isDataVerified;
                self.KYC_UpdatingCall(groupId,pageName,function(groupId,prospectClientFamilyFetchObject,prospectClient,prospectGroup,clientId,clientNames,lookupEntityObj,clientNameID,prospectClientPersonalObject,prospectClientGuarantorObject,prospectClientHouseDetailObject,prospectClientBankDetailObject,prospectClientOtherMfiDetailObject,prospectClientOtherDetailObject,flag){
                    if(clientId.length >0) {
                        self.commonRouter.retrieveDocTypeList(tenantId, function (docTypeIdArray, docTypeNameArray) {
                            if (isDataVerified == 1) {
                                self.showKYC_DataVerification(res, successMessage, groupId, prospectClientFamilyFetchObject, prospectClient,
                                    prospectGroup, clientId, clientNames, lookupEntityObj, clientNameID, prospectClientPersonalObject,
                                    prospectClientGuarantorObject, prospectClientHouseDetailObject, prospectClientBankDetailObject,
                                    prospectClientOtherMfiDetailObject, prospectClientOtherDetailObject, flag, docTypeIdArray, docTypeNameArray,pageName,reqOfficeId,docType,menu,access_type_id);
                            } else {
                                self.showKYC_Updating(res, successMessage, groupId, prospectClientFamilyFetchObject, prospectClient,
                                    prospectGroup, clientId, clientNames, lookupEntityObj, clientNameID, prospectClientPersonalObject,
                                    prospectClientGuarantorObject, prospectClientHouseDetailObject, prospectClientBankDetailObject,
                                    prospectClientOtherMfiDetailObject, prospectClientOtherDetailObject, flag, docTypeIdArray, docTypeNameArray, pageName,reqOfficeId,docType,menu,access_type_id);
                            }
                        });
                    }
                    else{
                        if (pageName == "KYC_Update" || pageName == "KYC_Update_New") {
                            operationId = constantsObj.getKYCUpdatingOperationId();
                        }
                        else {
                            operationId = constantsObj.getDataVerificationOperationId();
                        }
                        req.params.officeId = reqOfficeId;
                        self.commonRouter.listGroups(req, res);
                    }
                });
            }
        }catch(e){
            customlog.error("Exception while kyc updating "+e);
            self.commonRouter.showErrorPage(req,res);
        }
    },
    KYC_UpdatingCall: function(groupId,pageName,callback) {
        this.model.KYC_UpdatingModel(groupId,pageName,callback);
    },

    showKYC_DataVerification: function(res,successMessage,groupId,prospectClientFamilyFetchObject,prospectClient,
                                       prospectGroup,clientId,clientNames,lookupEntityObj,clientNameID,prospectClientPersonalObject,
                                       prospectClientGuarantorObject,prospectClientHouseDetailObject,prospectClientBankDetailObject,
                                       prospectClientOtherMfiDetailObject,prospectClientOtherDetailObject,flag,docTypeIdArray,docTypeNameArray,
                                       pageName,reqOfficeId,docType,menu,availDocTypeIdArray,availDocTypeNameArray,base64ImageArray,status,access_type_id){
        try{
            var constantsObj = this.constants;
            res.render("data_entry/"+pageName,{groupId :groupId,successMessage:successMessage,
                clientNames:clientNames,prospectClient:prospectClient, prospectGroup:prospectGroup ,
                clientId:clientId ,lookupEntityObj :lookupEntityObj, clientNameID:clientNameID,
                prospectClientPersonalObject:prospectClientPersonalObject,
                prospectClientGuarantorObject:prospectClientGuarantorObject,
                prospectClientHouseDetailObject:prospectClientHouseDetailObject,
                prospectClientBankDetailObject:prospectClientBankDetailObject,
                prospectClientOtherMfiDetailObject:prospectClientOtherMfiDetailObject,
                prospectClientOtherDetailObject:prospectClientOtherDetailObject,flag:flag,
                prospectClientFamilyFetchObject:prospectClientFamilyFetchObject,
                docTypeIdArray:docTypeIdArray,docTypeNameArray:docTypeNameArray,
                constantsObj : constantsObj,officeValue:reqOfficeId,docType:docType,
                menu:menu,availDocTypeIdArray:availDocTypeIdArray,availDocTypeNameArray:availDocTypeNameArray,
                base64ImageArray:base64ImageArray,status:status, contextPath:props.contextPath,access_type_id:access_type_id});
        }catch(e){
            customlog.error("Exception while show kyc data verification "+e);
            self.commonRouter.showErrorPage(req,res);
        }
    },
    showKYC_Updating: function(res,successMessage,groupId,prospectClientFamilyFetchObject,prospectClient,
                               prospectGroup,clientId,clientNames,lookupEntityObj,clientNameID,prospectClientPersonalObject,
                               prospectClientGuarantorObject,prospectClientHouseDetailObject,prospectClientBankDetailObject,
                               prospectClientOtherMfiDetailObject,prospectClientOtherDetailObject,flag,docTypeIdArray,docTypeNameArray,
                               pageName,reqOfficeId,docType,menu,availDocTypeIdArray,availDocTypeNameArray,base64ImageArray,status,access_type_id){
        try{
            var constantsObj = this.constants;
            res.render("data_entry/"+pageName,{groupId :groupId,successMessage:successMessage,
                clientNames:clientNames,prospectClient:prospectClient, prospectGroup:prospectGroup ,
                clientId:clientId ,lookupEntityObj :lookupEntityObj, clientNameID:clientNameID,
                prospectClientPersonalObject:prospectClientPersonalObject,
                prospectClientGuarantorObject:prospectClientGuarantorObject,
                prospectClientHouseDetailObject:prospectClientHouseDetailObject,
                prospectClientBankDetailObject:prospectClientBankDetailObject,
                prospectClientOtherMfiDetailObject:prospectClientOtherMfiDetailObject,
                prospectClientOtherDetailObject:prospectClientOtherDetailObject,flag:flag,
                prospectClientFamilyFetchObject:prospectClientFamilyFetchObject,
                docTypeIdArray:docTypeIdArray,docTypeNameArray:docTypeNameArray,
                constantsObj : constantsObj,officeValue:reqOfficeId,docType:docType,
                menu:menu,availDocTypeIdArray:availDocTypeIdArray,availDocTypeNameArray:availDocTypeNameArray,
                base64ImageArray:base64ImageArray,status:status, contextPath:props.contextPath, access_type_id:access_type_id});
        }catch(e){
            customlog.error("Exception while show kyc updating "+e);
            this.showErrorPage(req,res);
        }
    },
    KYC_UpdatingMember : function(req,res){
        try{
            var self = this;
            var pageName = req.body.pageName;
            var successMessage="";
            var tenantId = req.session.tenantId;
            var userId = req.session.userId;
            var constantsObj = this.constants;
            var menu = req.body.menuName;
            var docType = -1;
            var access_type_id = props.accessType;
            var localMachineIp = props.loacalMachineIP;
            var clientFirstName = req.body.MemberNameIdHidden;
            var clientLastName = req.body.MemberLastNameIdHidden;
            if(typeof tenantId == 'undefined' || typeof userId == 'undefined' || typeof req.session.operationId == 'undefined') {
                res.redirect(props.contextPath+'/client/ci/login');
            }
            else {
                var clientNameID = req.params.id;
                var isDataVerified = req.params.isDataVerified;
                var groupId = req.body.groupIdHiddenName;
                var reqOfficeId = req.body.reqOfficeHidden;
                this.KYC_UpdatingMemberCall(clientNameID,function(groupId,prospectClientFamilyFetchObject,prospectClient,prospectGroup,clientId,clientNames,lookupEntityVal,clientNameID,prospectClientPersonalObject,prospectClientGuarantorObject,prospectClientHouseDetailObject,prospectClientBankDetailObject,prospectClientOtherMfiDetailObject,prospectClientOtherDetailObject,flag){
                    if(clientId.length>0) {
                        self.KYC_DownloadCall(groupId,clientNameID,docType,access_type_id,localMachineIp,function(status,base64ImageArray,groupId,memberId,docType,memberIdArray,memberNameArray,availDocTypeIdArray,availDocTypeNameArray){
                            self.commonRouter.lookUpEntityCall(function (lookupEntityObj) {     // Modified by chitra
                                self.commonRouter.retrieveDocTypeList(tenantId, function (docTypeIdArray, docTypeNameArray) {
                                    if (isDataVerified == 1) {
                                        self.showKYC_DataVerification(res, successMessage, groupId, prospectClientFamilyFetchObject, prospectClient,
                                            prospectGroup, clientId, clientNames, lookupEntityObj, clientNameID, prospectClientPersonalObject,
                                            prospectClientGuarantorObject, prospectClientHouseDetailObject, prospectClientBankDetailObject,
                                            prospectClientOtherMfiDetailObject, prospectClientOtherDetailObject, flag, docTypeIdArray, docTypeNameArray,
                                            pageName,reqOfficeId,'',menu,availDocTypeIdArray,availDocTypeNameArray,base64ImageArray,status,access_type_id);
                                    } else {
                                        if(prospectClientPersonalObject.getMembFirstName() == ""){
                                            prospectClientPersonalObject.setMembFirstName(clientFirstName);
                                            prospectClientPersonalObject.setMembLastName(clientLastName);
                                        }
                                        self.showKYC_Updating(res, successMessage, groupId, prospectClientFamilyFetchObject, prospectClient,
                                            prospectGroup, clientId, clientNames, lookupEntityObj, clientNameID, prospectClientPersonalObject,
                                            prospectClientGuarantorObject, prospectClientHouseDetailObject, prospectClientBankDetailObject,
                                            prospectClientOtherMfiDetailObject, prospectClientOtherDetailObject, flag, docTypeIdArray, docTypeNameArray,
                                            pageName, reqOfficeId,'',menu,availDocTypeIdArray,availDocTypeNameArray,base64ImageArray,status,access_type_id);
                                    }
                                });
                            });
                        });
                    }else{
                        if (pageName == "KYC_Update" || pageName == "KYC_Update_New") {
                            req.params.operationId = constantsObj.getKYCUpdatingOperationId();
                        }
                        else {
                            req.params.operationId = constantsObj.getDataVerificationOperationId();
                        }
                        req.params.officeId = reqOfficeId;
                        self.commonRouter.listGroups(req, res);
                    }
                });
            }
        }catch(e){
            customlog.error("Exception while kyc Updating member "+e);
            self.commonRouter.showErrorPage(req,res);
        }
    },
    KYC_UpdatingMemberCall : function(clientNameID,callback) {
        this.model.KYC_UpdatingMemberModel(clientNameID,callback);
    },

    KycDocumentsCall : function(clientNameID,callback) {
        this.model.KycDocumentsModel(clientNameID,callback);
    },

    updateRMApprovalStatusCall : function(clientId,statusId,commentsByRM,groupId,callback){
        this.model.updateRMApprovalStatusModel(clientId,statusId,commentsByRM,groupId,callback);
    },

    KycDocumentsForRMApproval : function(req,res){
        var self = this;
        var tenantId = req.session.tenantId;
        var userId = req.session.userId;
        var constantObj = this.constants;
        if(typeof tenantId == 'undefined' || typeof userId == 'undefined' || typeof req.session.operationId == 'undefined') {
            res.redirect(props.contextPath+'/client/ci/login');
        }
        else {
            var clientId = req.params.clientId;
            self.KycDocumentsCall(clientId,function(clientDetailsForRMApproval){
                //console.log(clientDetailsForRMApproval);
                res.render('data_entry/KYCRMApproval',{contextPath: props.contextPath,constantsObj: constantObj, clientDetailsForRMApproval : clientDetailsForRMApproval});


            });

        }
    },

    updateRMApprovalStatus : function(req,res){
        var self = this;
        var tenantId = req.session.tenantId;
        var userId = req.session.userId;
        var constantObj = this.constants;
        if(typeof tenantId == 'undefined' || typeof userId == 'undefined' || typeof req.session.operationId == 'undefined') {
            res.redirect(props.contextPath+'/client/ci/login');
        }
        else {
            var clientId = req.body.clientId;
            var groupId = req.body.groupId;
            var statusId;
            if(req.body.status == 1){
                statusId = constantObj.getKYCUploaded();
            }else{
                statusId = constantObj.getRejectedKYCByRM();
            }
            var commentsByRM = req.body.commentsByRM;
            self.updateRMApprovalStatusCall(clientId,statusId,commentsByRM,groupId,function(){
                req.status = "success";
               res.send(req.body);
            });


        }
    },



    //Adarsh
    saveKYC_Updating: function(req,res){
        try{
            var self = this;
            var tenantId = req.session.tenantId;
            var userId = req.session.userId;
            var constantObj = this.constants;
            var menu = req.body.menuName;
            var isRejected = req.body.isRejected;
            if(typeof tenantId == 'undefined' || typeof userId == 'undefined' || typeof req.session.operationId == 'undefined') {
                res.redirect(props.contextPath+'/client/ci/login');
            }
            else {
                var reqOfficeId = req.body.reqOfficeHidden;
                var isDataVerified = req.params.isDataVerified;
                var groupId = req.body.groupIdHiddenName;
                var flagValue =  req.body.flagHidden;
                var deletedMembers = req.body.deleteclientNamehidden;
                var deletedMemberRelation = req.body.deleteclientRelationhidden;
                var deletedMemberIncome =	req.body.deleteclientIncomehidden;
                var pageName = req.body.pageName;
                var isSkip = req.body.isSkip;

                //MEMBER PERSONAL DETAILS
                var prosClientPersonal = require(commonDTO +"/prospectClientPersonal");
                var prospectClientPersonalObj = new prosClientPersonal();

                prospectClientPersonalObj.clearAll();
                prospectClientPersonalObj.setClient_id(req.body.MemberName);
                prospectClientPersonalObj.setMembFirstName(req.body.MembFirstName);
                prospectClientPersonalObj.setMembLastName(req.body.MembLastName);
                prospectClientPersonalObj.setDate_of_birth(dateUtils.formatDate(req.body.DateOfBirth));
                prospectClientPersonalObj.setMobile_number(req.body.ContactNumber);
                prospectClientPersonalObj.setLandLine_number(req.body.landlineNumber);
                prospectClientPersonalObj.setAddress(req.body.AddressDetails);
                prospectClientPersonalObj.setPincode(req.body.PinCode);
                prospectClientPersonalObj.setRation_card_number(req.body.RationCardNumber);
                prospectClientPersonalObj.setVoter_id(req.body.voterId);
                prospectClientPersonalObj.setGas_number(req.body.GasNumber);
                prospectClientPersonalObj.setAadhaar_number(req.body.AadhaarNo);
                prospectClientPersonalObj.setIs_other_id(req.body.otherIdsNameHidden);
                prospectClientPersonalObj.setOther_id_name(req.body.otherIdName);
                prospectClientPersonalObj.setOther_id(req.body.otherId);
                prospectClientPersonalObj.setOther_id_name2(req.body.otherIdName2);
                prospectClientPersonalObj.setOther_id2(req.body.otherId2);
                prospectClientPersonalObj.setGender(req.body.genderValue);
                prospectClientPersonalObj.setMarital_status(req.body.MaritalStatus);
                prospectClientPersonalObj.setNationality(req.body.nationality);
                prospectClientPersonalObj.setReligion(req.body.Religion);
                prospectClientPersonalObj.setCaste(req.body.Caste);
                prospectClientPersonalObj.setEducational_details(req.body.EducationDetails);
                prospectClientPersonalObj.setLoan_purpose(req.body.LoanPurpose);
                prospectClientPersonalObj.setBusinessCategoryId(req.body.BusinessCategory);
                //prospectClientPersonalObj.setGuardian_relationship(req.body.relationshipValue); //For removing duplication of GU
                prospectClientPersonalObj.setGuardian_relationship(req.body.GuarantorRelationship);
                //prospectClientPersonalObj.setGuardian_name(req.body.HusbandOrFatherName); //For removing duplication of GU
                prospectClientPersonalObj.setGuardian_name(req.body.GuarantorName);
                prospectClientPersonalObj.setGuardian_lastname(req.body.HusbandOrFatherLastName);
                prospectClientPersonalObj.setRemarksKycRejection(req.body.reasonForRejection);
                /*if(typeof(req.body.HusbandOrFatherAge) == 'undefined' | req.body.HusbandOrFatherAge == '' |  req.body.HusbandOrFatherAge== 'NULL' ){
                    prospectClientPersonalObj.setGuardian_dob('0000-00-00');
                }
                else{                                                                        //For removing duplication of GU
                    prospectClientPersonalObj.setGuardian_dob(dateUtils.formatDate(req.body.HusbandOrFatherAge));
                }*/

                //GUARANTOR DETAILS
                var prosClientGuarantor = require(commonDTO +"/prospectClientGuarantor");
                var prospectClientGuarantorObj = new prosClientGuarantor();
                prospectClientGuarantorObj.clearAll();
                prospectClientGuarantorObj.setGuarantorName(req.body.GuarantorName);
                if(typeof(req.body.GuarantorAge) == 'undefined' | req.body.GuarantorAge == '' |  req.body.GuarantorAge == 'NULL' ){
                    prospectClientGuarantorObj.setGuarantorDob('0000-00-00');
                    prospectClientPersonalObj.setGuardian_dob('0000-00-00');
                }
                else{
                    prospectClientGuarantorObj.setGuarantorDob(dateUtils.formatDate(req.body.GuarantorAge));
                    prospectClientPersonalObj.setGuardian_dob(dateUtils.formatDate(req.body.GuarantorAge));
                }
                prospectClientGuarantorObj.setGuarantorRelationship(req.body.GuarantorRelationship);
                prospectClientGuarantorObj.setGuarantorAddress(req.body.GuarantorAddress);
                prospectClientGuarantorObj.setGuarantorId(req.body.guarantorId);
                prospectClientGuarantorObj.setOtherGuarantorRelationshipName(req.body.otherRelationShipName);
                //FAMILY DETAILS(POPUP)
                var prosClientFamilyDetail = require(commonDTO +"/prospectClientFamilyDetail");
                var prospectClientFamilyDetailObj = new prosClientFamilyDetail();
                prospectClientFamilyDetailObj.clearAll();
                if(typeof(req.body.nameHidden) == 'undefined' | req.body.nameHidden== 'NULL'){
                    prospectClientFamilyDetailObj.setMember_name("");
                }
                else{
                    prospectClientFamilyDetailObj.setMember_name(req.body.nameHidden);
                }
                customlog.info("Family_Age====== "+req.body.ageHidden);
                if(typeof(req.body.ageHidden) == 'undefined' | req.body.ageHidden == '' |  req.body.ageHidden== 'NULL' ){
                    prospectClientFamilyDetailObj.setMember_dob('0000-00-00');
                }
                else{
                    prospectClientFamilyDetailObj.setMember_dob(req.body.ageHidden);
                }

                prospectClientFamilyDetailObj.setMember_gender(req.body.genderHidden);
                prospectClientFamilyDetailObj.setMember_relationship(req.body.relationshipHidden);
                prospectClientFamilyDetailObj.setMember_education(req.body.educationHidden);
                prospectClientFamilyDetailObj.setMember_occupation(req.body.occupationHidden);
                prospectClientFamilyDetailObj.setMember_income(req.body.incomeHidden);
                prospectClientFamilyDetailObj.setMemberRelationshipName(req.body.otherRelationshipHidden);

                //FAMILY DETAILS
                var prosClientObj = require(commonDTO +"/prospectClient");
                var prospectClientObj = new prosClientObj();
                prospectClientObj.clearAll();
                prospectClientObj.setIs_loan_secured(req.body.OtherMfiLoanHidden);
                prospectClientObj.setFamily_monthly_income(req.body.FamilyTotalIncome);
                prospectClientObj.setFamily_monthly_expense(req.body.FamilyMonthlyExpenses);
                //prospectClientObj.setRepaymentTrackRecord(req.body.RepaymentTrackRecordName);
                //customlog.info("Repayment : "+req.body.RepaymentTrackRecordName);
                //HOUSE DETAILS
                var prosClientHouseDetail = require(commonDTO +"/prospectClientHouseDetail");
                var prospectClientHouseDetailObj = new prosClientHouseDetail();
                prospectClientHouseDetailObj.clearAll();
                prospectClientHouseDetailObj.setHouse_type(req.body.House);
                if(typeof(req.body.TimePeriod) == 'undefined' | req.body.TimePeriod == '' |  req.body.TimePeriod== 'NULL' ){
                    prospectClientHouseDetailObj.setTime_period(0);
                }
                else{
                    prospectClientHouseDetailObj.setTime_period(req.body.TimePeriod);
                }

                if(typeof(req.body.Housesqft) == 'undefined' | req.body.Housesqft == '' |  req.body.Housesqft== 'NULL' ){
                    prospectClientHouseDetailObj.setHouse_sqft(0);
                }
                else{
                    prospectClientHouseDetailObj.setHouse_sqft(req.body.Housesqft);
                }

                prospectClientHouseDetailObj.setHouse_ceiling_type(req.body.HouseCeilingType);
                prospectClientHouseDetailObj.setHouse_wall_type(req.body.HouseWallType);
                prospectClientHouseDetailObj.setHouse_flooring_detail(req.body.HouseFlooringDetails);
                prospectClientHouseDetailObj.setHouse_room_detail(req.body.houseroom);
                //prospectClientHouseDetailObj.setHousehold_details(req.body.household);
                prospectClientHouseDetailObj.setVehicle_details(req.body.vehicles);
                prospectClientHouseDetailObj.setHouse_toilet(req.body.HouseToilet);

                //BANK ACCOUNT DETAILS
                var prosClientBankDetail = require(commonDTO +"/prospectClientBankDetail");
                var prospectClientBankDetailObj = new prosClientBankDetail();
                prospectClientBankDetailObj.clearAll();
                prospectClientBankDetailObj.setIs_bank_account(req.body.BankAccountHidden);
                prospectClientBankDetailObj.setIs_Savings(req.body.SavingsHidden);
                //prospectClientBankDetailObj.setIs_Insurance_Lifetime(req.body.LifeTimeInsuranceHidden);
                //prospectClientBankDetailObj.setIs_Insurance_Accidental(req.body.AccidentalInsuranceHidden);
                //prospectClientBankDetailObj.setIs_Insurance_Medical(req.body.MedicalInsuranceHidden);

                //OTHER MFI LOAN DETAILS
                var prosClientOtherMfiDetail = require(commonDTO +"/prospectClientOtherMfiDetail");
                var prospectClientOtherMfiDetailObj = new prosClientOtherMfiDetail();
                prospectClientOtherMfiDetailObj.clearAll();
                prospectClientOtherMfiDetailObj.setDeletedOtherMfiLoanClientNames(req.body.deleteOtherMfiClienthidden);
                prospectClientOtherMfiDetailObj.setDeletedOtherMfiLoanClientAmtSecured(req.body.deleteOtherMfiAmtSecuredHidden);
                prospectClientOtherMfiDetailObj.setDeletedOtherMfiLoanClientOutstanding(req.body.deleteOtherMfiOutHidden);
                prospectClientOtherMfiDetailObj.setOtherMfiName(req.body.OtherMfiNameHidden);
                prospectClientOtherMfiDetailObj.setOtherMfiAmountSecured(req.body.OtherMfiAmountHidden);

                if(typeof(req.body.OtherMfiOutstandingHidden) == 'undefined' | req.body.OtherMfiOutstandingHidden == '' |  req.body.OtherMfiOutstandingHidden== 'NULL' ){
                    prospectClientOtherMfiDetailObj.setOtherMfiLoanOutstanding(0);
                }
                else{
                    prospectClientOtherMfiDetailObj.setOtherMfiLoanOutstanding(req.body.OtherMfiOutstandingHidden);
                }
                prospectClientOtherMfiDetailObj.setOtherMfiLoanOutstanding(req.body.OtherMfiOutstandingHidden);

                //OTHER DETAILS
                var prosClientOtherDetail = require(commonDTO +"/prospectClientOtherDetail");
                var prospectClientOtherDetailObj = new prosClientOtherDetail();
                prospectClientOtherDetailObj.clearAll();
                prospectClientOtherDetailObj.setIsDeclarationAcksign(req.body.DeclarationAcknowledgedSignedHidden);
                prospectClientOtherDetailObj.setIsPledgeAcksign(req.body.PledgeAcknowledgedSignedHidden);
                prospectClientOtherDetailObj.setIsGuarantorAcksign(req.body.GuarantorAcknowledgedSignedHidden);
                prospectClientOtherDetailObj.setIsMemberPhotocopyAttached(req.body.MemberPhotocopyAttachedHidden);
                prospectClientOtherDetailObj.setIsGuarantorPhotocopyAttached(req.body.GuarantorPhotocopyAttachedHidden);

                self.saveKYC_UpdatingCall(tenantId,deletedMembers,deletedMemberRelation,deletedMemberIncome,flagValue,prospectClientPersonalObj,prospectClientGuarantorObj,prospectClientFamilyDetailObj,prospectClientObj,
                    prospectClientHouseDetailObj,prospectClientBankDetailObj,prospectClientOtherMfiDetailObj,prospectClientOtherDetailObj,userId,pageName,isSkip,groupId,isRejected,function(successMessage,groupId,prospectClientFamilyFetchObject,prospectClient,prospectGroup,clientIdArray,clientNames,lookupEntityObj,clientNameID,prospectClientPersonalObject,prospectClientGuarantorObject,prospectClientHouseDetailObject,prospectClientBankDetailObject,prospectClientOtherMfiDetailObject,prospectClientOtherDetailObject,flag){
                        if(typeof successMessage != "undefined") {
                            if(isRejected == 1){
                                var activityDetails = new Array(iklantPort, req.session.tenantId, req.session.userId, req.session.userName, req.originalUrl, req.connection.remoteAddress, "router.js", "saveKYC_Updating", "success", "KYC_Updating", "KYC_Updating Rejected successfully for "+req.body.MemberName,"insert");
                            }else{
                                var activityDetails = new Array(iklantPort, req.session.tenantId, req.session.userId, req.session.userName, req.originalUrl, req.connection.remoteAddress, "router.js", "saveKYC_Updating", "success", "KYC_Updating", "KYC_Updating successfully for "+req.body.MemberName,"insert");
                            }
                            self.commonRouter.insertActivityLogModel(activityDetails);
                            if (clientIdArray.length > 0) {
                                self.KYC_UpdatingCall(groupId,pageName, function (groupId, prospectClientFamilyFetchObject, prospectClient, prospectGroup, clientId, clientNames, lookupEntityObj, clientNameID, prospectClientPersonalObject, prospectClientGuarantorObject, prospectClientHouseDetailObject, prospectClientBankDetailObject, prospectClientOtherMfiDetailObject, prospectClientOtherDetailObject, flag) {
                                    self.commonRouter.retrieveDocTypeList(tenantId, function (docTypeIdArray, docTypeNameArray) {
                                        if (clientId.length > 0) {
                                            if (isDataVerified == 0) {
                                                self.showKYC_Updating(res, successMessage, groupId, prospectClientFamilyFetchObject,
                                                    prospectClient, prospectGroup, clientId, clientNames, lookupEntityObj, clientNameID,
                                                    prospectClientPersonalObject, prospectClientGuarantorObject, prospectClientHouseDetailObject,
                                                    prospectClientBankDetailObject, prospectClientOtherMfiDetailObject, prospectClientOtherDetailObject,
                                                    flag, docTypeIdArray, docTypeNameArray, pageName, reqOfficeId, '', menu);
                                            } else {

                                                self.showKYC_DataVerification(res, successMessage, groupId, prospectClientFamilyFetchObject,
                                                    prospectClient, prospectGroup, clientId, clientNames, lookupEntityObj, clientNameID,
                                                    prospectClientPersonalObject, prospectClientGuarantorObject, prospectClientHouseDetailObject,
                                                    prospectClientBankDetailObject, prospectClientOtherMfiDetailObject, prospectClientOtherDetailObject,
                                                    flag, docTypeIdArray, docTypeNameArray, pageName, reqOfficeId, '', menu);
                                            }
                                        }
                                        else {
                                            if (pageName == "KYC_Update" || pageName == "KYC_Update_New") {
                                                req.params.operationId = constantObj.getKYCUpdatingOperationId();
                                            }
                                            else {
                                                req.params.operationId = constantObj.getDataVerificationOperationId();
                                            }
                                            req.params.officeId = reqOfficeId;
                                            self.commonRouter.listGroups(req, res);
                                        }
                                    });
                                });
                            }
                            else {
                                if (pageName == "KYC_Update" || pageName == "KYC_Update_New") {
                                    req.params.operationId = constantObj.getKYCUpdatingOperationId();
                                }
                                else {
                                    req.params.operationId = constantObj.getDataVerificationOperationId();
                                }
                                req.params.officeId = reqOfficeId;
                                self.commonRouter.listGroups(req, res);
                            }
                        }
                        else{
                            customlog.error("Error while save kyc Updating - Query exception");
                            self.commonRouter.showErrorPage(req,res);
                        }
                    }
                );
                //this.KYC_Updating(req,res);
            }
        }catch(e){
            customlog.error("Exception while save kyc Updating ",e);
            self.commonRouter.showErrorPage(req,res);
        }
    },

    checkIfAlreadyExistsMember: function(req,res){
        try{
            var self = this;
            var tenantId = req.session.tenantId;
            var userId = req.session.userId;
            var clientName = req.body.clientName;
            var dateOfBirth = req.body.dateOfBirth;
            var guarantorName = req.body.GuarantorName;
            var clientId = req.body.clientId;
            if(typeof tenantId == 'undefined' || typeof userId == 'undefined' || typeof req.session.operationId == 'undefined') {
                res.redirect(props.contextPath+'/client/ci/login');
            }else{
                self.checkDuplicateClientNameWithDOBAndGuarantorCall(clientName,dateOfBirth,guarantorName,clientId,function(duplicateClientResult){
                    if(duplicateClientResult != null && duplicateClientResult.length > 0){
                        req.body.errorMessage = duplicateClientResult[0];
                        req.body.status = "failure";
                    }else{
                        req.body.errorMessage = "";
                        req.body.status = "success";
                    }
                    res.send(req.body);
                });
            }
        }catch(e){
            customlog.error("Exception while checkIfAlreadyExistsMember "+e);
            self.commonRouter.showErrorPage(req,res);
        }
    },

    checkDuplicateClientNameWithDOBAndGuarantorCall:function(clientName,dateOfBirth,gurantorName,clientId,callback) {
        this.model.checkDuplicateClientNameWithDOBAndGuarantorModel(clientName,dateOfBirth,gurantorName,clientId,callback);
    },

    saveKYC_UpdatingCall:function(tenantId,deletedMembers,deletedMemberRelation,deletedMemberIncome,flagValue,prospectClientPersonal,prospectClientGuarantor,prospectClientFamilyDetail,prospectClient,prospectClientHouseDetail,prospectClientBankDetail,prospectClientOtherMfiDetail,prospectClientOtherDetail,userId,pageName,isSkip,group_id,isRejected,callback) {
        this.model.saveKYC_UpdatingModel(tenantId,deletedMembers,deletedMemberRelation,deletedMemberIncome,flagValue,prospectClientPersonal,prospectClientGuarantor,prospectClientFamilyDetail,prospectClient,prospectClientHouseDetail,prospectClientBankDetail,prospectClientOtherMfiDetail,prospectClientOtherDetail,userId,pageName,isSkip,group_id,isRejected,callback);
    },
    KYC_UpdatingNeedImageClarity : function(req,res){
        try{
            var self = this;
            var tenantId = req.session.tenantId;
            var pageName = req.body.pageName;
            var userId = req.session.userId;
            var reqOfficeId = req.body.reqOfficeHidden;
            var constantsObj = this.constants;
            var menu = req.body.menuName;
            if(typeof tenantId == 'undefined' || typeof userId == 'undefined' || typeof req.session.operationId == 'undefined') {
                res.redirect(props.contextPath+'/client/ci/login');
            }
            else {
                var groupId = req.body.groupIdHiddenName;
                var remarks = req.body.reasonForHoldRemarks;
                var memberNameId = req.params.id;
                var reasonForHold = req.body.reasonForHoldRadio;
                customlog.info("memberNameId: "+memberNameId);
                var selectedDocTypes = req.body.selectedDocTypeArrayHidden;
                console.log("reasonForHold "+ reasonForHold);
                console.log("selectedDocTypes " + selectedDocTypes);
                self.KYC_UpdatingNeedImageClarityCall(tenantId,groupId,memberNameId,selectedDocTypes,remarks,reasonForHold,function(successMessage){
                    self.KYC_UpdatingCall(groupId,pageName,function(groupId,prospectClientFamilyFetchObject,prospectClient,
                                                           prospectGroup,clientId,clientNames,lookupEntityObj,clientNameID,prospectClientPersonalObject,
                                                           prospectClientGuarantorObject,prospectClientHouseDetailObject,prospectClientBankDetailObject,
                                                           prospectClientOtherMfiDetailObject,prospectClientOtherDetailObject,flag){
                        self.saveFOPerformanceTrackByClientCall(tenantId,userId,groupId,memberNameId,pageName,selectedDocTypes,remarks,reasonForHold,function(successMessage1){
                            if(clientId.length > 0){
                                self.commonRouter.retrieveDocTypeList(tenantId,function(docTypeIdArray,docTypeNameArray){
                                    if(pageName == 'KYC_Update' || pageName == 'KYC_Update_New') {
                                        self.showKYC_Updating(res, successMessage, groupId, prospectClientFamilyFetchObject, prospectClient,
                                            prospectGroup, clientId, clientNames, lookupEntityObj, memberNameId, prospectClientPersonalObject,
                                            prospectClientGuarantorObject, prospectClientHouseDetailObject, prospectClientBankDetailObject,
                                            prospectClientOtherMfiDetailObject, prospectClientOtherDetailObject, flag, docTypeIdArray, docTypeNameArray, pageName, reqOfficeId,'',menu);
                                    }
                                    else{
                                        self.showKYC_DataVerification(res, successMessage, groupId, prospectClientFamilyFetchObject, prospectClient,
                                            prospectGroup, clientId, clientNames, lookupEntityObj, clientNameID, prospectClientPersonalObject,
                                            prospectClientGuarantorObject, prospectClientHouseDetailObject, prospectClientBankDetailObject,
                                            prospectClientOtherMfiDetailObject, prospectClientOtherDetailObject, flag, docTypeIdArray, docTypeNameArray, pageName, reqOfficeId,'',menu);
                                    }
                                });
                            }else{
                                req.params.officeId = reqOfficeId;
                                if (pageName == "KYC_Update" || pageName == "KYC_Update_New") {
                                    req.params.operationId = constantsObj.getKYCUpdatingOperationId();
                                }
                                else {
                                    req.params.operationId = constantsObj.getDataVerificationOperationId();
                                }
                                self.commonRouter.listGroups(req,res);
                            }
                        });
                    });
                });
            }
        }catch(e){
            customlog.error("Exception while kyc updating nim clients "+e);
            self.commonRouter.showErrorPage(req,res);
        }
    },
    KYC_UpdatingNeedImageClarityCall : function(tenantId,groupId,memberNameId,selectedDocTypes,remarks,reasonForHold,callback){
        this.model.KYC_UpdatingNeedImageClarityModel(tenantId,groupId,memberNameId,selectedDocTypes,remarks,reasonForHold,callback);
    },

    saveFOPerformanceTrackByClientCall : function(tenantId,userId,groupId,clientId,pageName,selectedDocTypes,remarks,reasonForHold,callback){
        this.model.saveFOPerformanceTrackByClientModel(tenantId,userId,groupId,clientId,pageName,selectedDocTypes,remarks,reasonForHold,callback);
    },

    //Jagan
    creditReportClients: function(req, res) {
        try{
            var self = this;
            var tenantId = req.session.tenantId;
            var userId = req.session.userId;
            var userName = req.session.userName;
            var reqOfficeId =  (typeof req.body.listoffice != 'undefined')?req.body.listoffice:(typeof req.body.reqOfficeHidden != 'undefined')?req.body.reqOfficeHidden:req.session.officeId;
            var menu = req.body.menuName;
            if(typeof tenantId == 'undefined' || typeof userId == 'undefined') {
                res.redirect(props.contextPath+'/client/ci/login');
            }
            else {
                var groupId = req.params.groupId;
                var clientId = 0;
                this.listCreditReportClients(groupId,function(groupName,groupCentreName,clientIdsArray,clientNamesArray,prospectClientObj,prospectClientPersonalObj,prospectClientOtherMfiDetailObj,lookupEntityObj,prospectGuarantorObj) {
                    self.showCreditReport(req,res,groupId,groupName,groupCentreName,clientId,clientIdsArray,clientNamesArray,prospectClientObj,prospectClientPersonalObj,prospectClientOtherMfiDetailObj,lookupEntityObj,prospectGuarantorObj,userName,reqOfficeId,'',menu);
                });
            }
        }catch(e){
            customlog.error("Exception While Credit Report Clients "+e);
            self.commonRouter.showErrorPage(req,res);
        }
    },
    listCreditReportClients: function(groupId,callback) {
        this.model.listCreditReportClientsModel(groupId,callback);
    },
    showCreditReport: function(req,res,groupId,groupName,groupCentreName,clientId,clientIdsArray,clientNamesArray,prospectClientObj,prospectClientPersonalObj,prospectClientOtherMfiDetailObj,lookupEntityObj,prospectClientGuarantorObj,userName,officeId,successMsg,menu, groupPreviousStatus) {
        res.render('data_entry/CreditBureauForClients', { branchId:req.session.officeId,groupId:groupId,groupName:groupName,groupCentreName:groupCentreName,clientId:clientId,clientNamesArray:clientNamesArray,clientIdsArray: clientIdsArray,prospectClientObj:prospectClientObj,
            prospectClientPersonalObj:prospectClientPersonalObj,prospectClientOtherMfiDetailObj:prospectClientOtherMfiDetailObj,lookupEntityObj:lookupEntityObj,userName:userName,officeValue:officeId,successMsg:successMsg,menu:menu, contextPath:props.contextPath,
            groupPreviousStatus: (typeof groupPreviousStatus != 'undefined')?groupPreviousStatus:this.constants.getDataVerificationOperationId(),prospectClientGuarantorObj:prospectClientGuarantorObj});
    },
    loadHoldMembers : function(req,res) {
        try{
            var self = this;
            if(typeof (req.session.tenantId) == 'undefined' || typeof (req.session.userId) == 'undefined') {
                res.redirect(props.contextPath + '/client/ci/showErrorPage');
            }else{
                var customerId = req.body.customerId;
                var customerLevel = req.body.customerLevel;
                var clientId = (typeof req.body.memberName == 'undefined')?"":req.body.memberName;
                var groupName = (typeof req.body.groupName == 'undefined')?"":req.body.groupName;
                var officeId = (typeof req.body.listoffice != 'undefined')?req.body.listoffice:req.body.reqOfficeHidden;
                var menu = req.body.menuName;
                self.model.retrieveHoldClientsModel(customerId, customerLevel, clientId, function (status,clientIds,clientNames,docTypeIdArray,docTypeNameArray,base64ImageArray,updatedBy,remarks,imageStatus,holdBy,entryBy,verifiedBy,docTypeIdNMCArray,docTypeNameNMCArray) {
                    if(status == "success") {
                        res.render("data_entry/holdClients", {contextPath:props.contextPath,officeId: officeId, menu: menu,groupName: groupName,
                            clientId: clientId,entryBy:entryBy,verifiedBy:verifiedBy,holdBy:holdBy,kycDoneBy: updatedBy, customerId: customerId,clientIds: clientIds,clientNames: clientNames,
                            docTypeIdArray: docTypeIdArray,docTypeNameArray:docTypeNameArray, base64ImageArray: base64ImageArray,status: imageStatus,remarks: remarks,docTypeIdNMCArray:docTypeIdNMCArray,docTypeNameNMCArray:docTypeNameNMCArray});
                    }else{
                        customlog.error("Something wrong while executing query in loadHoldMembers");
                        res.redirect(props.contextPath + '/client/ci/showErrorPage');
                    }
                });
            }
        }
        catch(e){
            customlog.error("Exception while loading loadHoldMembers " + e);
            res.redirect(props.contextPath + '/client/ci/showErrorPage');
        }
    },
    memberHoldHistory: function(req,res){
      try{
          var self = this;
          var clientId = req.body.clientId;
          if(typeof clientId == 'undefined') {
              res.redirect(props.contextPath+'/client/ci/login');
          }else{
              self.model.checkingHoldHistoryModel(clientId,function(date,holdBy,remarks,docNameArray){
                  /*var docName = new Array();
                  for(var i =0 ;i< docNameArray.length; i++){
                      docName.push(docNameArray[i][0].Doc_name);
                  }*/
                  req.body.date=date;
                  req.body.holdBy=holdBy;
                  req.body.remarks=remarks;
                  req.body.docNameArray=docNameArray;
                  res.send(req.body);
              });
          }
      }catch(e){
          customlog.error("Exception while getting hold history "+e);
          self.commonRouter.showErrorPage(req,res);
      }
    },
    //Adarsh
    KYC_UpdatingForNMIClients : function(req,res){
        try{
            var self = this;
            var successMessage="";
            var tenantId = req.session.tenantId;
            var userId = req.session.userId;
            var reqOfficeId = (typeof req.body.listoffice != 'undefined')?req.body.listoffice:(typeof req.body.reqOfficeHidden != 'undefined')?req.body.reqOfficeHidden:req.session.officeId;
            var menu = req.body.menuName;
            if(typeof tenantId == 'undefined' || typeof userId == 'undefined' || typeof req.session.operationId == 'undefined') {
                res.redirect(props.contextPath+'/client/ci/login');
            }
            else {
                var groupId = req.params.id;
                this.KYC_UpdatingCallForNMIClients(groupId,function(groupId,prospectClientFamilyFetchObject,prospectClient,prospectGroup,clientId,clientNames,lookupEntityObj,clientNameID,prospectClientPersonalObject,prospectClientGuarantorObject,prospectClientHouseDetailObject,prospectClientBankDetailObject,prospectClientOtherMfiDetailObject,prospectClientOtherDetailObject,flag){
                    self.showKYC_UpdatingForNMIClients(res,successMessage,groupId,prospectClientFamilyFetchObject,prospectClient,prospectGroup,clientId,clientNames,lookupEntityObj,clientNameID,prospectClientPersonalObject,prospectClientGuarantorObject,prospectClientHouseDetailObject,prospectClientBankDetailObject,prospectClientOtherMfiDetailObject,prospectClientOtherDetailObject,flag,reqOfficeId,menu);
                });
            }
        }catch(e){
            customlog.error("Exception while kyc updating for nmi clients "+e);
            self.commonRouter.showErrorPage(req,res);
        }
    },
    KYC_UpdatingCallForNMIClients: function(groupId,callback) {
        this.model.KYC_UpdatingModelForNMIClients(groupId,callback);
    },
    showKYC_UpdatingForNMIClients: function(res,successMessage,groupId,prospectClientFamilyFetchObject,prospectClient,prospectGroup,clientId,clientNames,lookupEntityObj,clientNameID,prospectClientPersonalObject,prospectClientGuarantorObject,prospectClientHouseDetailObject,prospectClientBankDetailObject,prospectClientOtherMfiDetailObject,prospectClientOtherDetailObject,flag,reqOfficeId,menu){
        res.render('data_entry/KYC_UpdateForNMI',{layout: 'data_entry/KYC_UpdateForNMI.jade', groupId :groupId,successMessage:successMessage,clientNames:clientNames,prospectClient:prospectClient, prospectGroup:prospectGroup , clientId:clientId ,lookupEntityObj :lookupEntityObj, clientNameID:clientNameID,prospectClientPersonalObject:prospectClientPersonalObject,prospectClientGuarantorObject:prospectClientGuarantorObject,
            prospectClientHouseDetailObject:prospectClientHouseDetailObject,prospectClientBankDetailObject:prospectClientBankDetailObject,prospectClientOtherMfiDetailObject:prospectClientOtherMfiDetailObject,prospectClientOtherDetailObject:prospectClientOtherDetailObject,flag:flag,prospectClientFamilyFetchObject:prospectClientFamilyFetchObject,officeValue:reqOfficeId,menu:menu, contextPath:props.contextPath});
    },
    KYC_UpdatingMemberForNMIClients : function(req,res){
        try{
            var self = this;
            var successMessage="";
            var tenantId = req.session.tenantId;
            var userId = req.session.userId;
            var menu = req.body.menuName;
            if(typeof tenantId == 'undefined' || typeof userId == 'undefined' || typeof req.session.operationId == 'undefined') {
                res.redirect(props.contextPath+'/client/ci/login');
            }
            else {
                var clientNameID = req.params.id;
                var groupId = req.body.groupIdHiddenName;
                this.KYC_UpdatingMemberCallForNMIClients(clientNameID,function(groupId,prospectClientFamilyFetchObject,prospectClient,prospectGroup,clientId,clientNames,lookupEntityVal,clientNameID,prospectClientPersonalObject,prospectClientGuarantorObject,prospectClientHouseDetailObject,prospectClientBankDetailObject,prospectClientOtherMfiDetailObject,prospectClientOtherDetailObject,flag){
                    self.commonRouter.lookUpEntityCall(function(lookupEntityObj){     // Modified by chitra
                        self.showKYC_UpdatingForNMIClients(res,successMessage,groupId,prospectClientFamilyFetchObject,prospectClient,prospectGroup,clientId,clientNames,lookupEntityObj,clientNameID,prospectClientPersonalObject,prospectClientGuarantorObject,prospectClientHouseDetailObject,prospectClientBankDetailObject,prospectClientOtherMfiDetailObject,prospectClientOtherDetailObject,flag,req.body.reqOfficeHidden,menu);
                    });
                });
            }
        }catch(e){
            customlog.error("Exception while kyc updating member for nmi clients "+e);
            self.commonRouter.showErrorPage(req,res);
        }
    },
    KYC_UpdatingMemberCallForNMIClients : function(clientNameID,callback) {
        this.model.KYC_UpdatingMemberModelForNMIClients(clientNameID,callback);
    },
    saveKYC_UpdatingForNMIClients: function(req,res){
        try{
            var self = this;
            var tenantId = req.session.tenantId;
            var userId = req.session.userId;
            var constantObj = this.constants;
            var menu = req.body.menuName;
            var prosClientPersonalObj = require(commonDTO +"/prospectClientPersonal");
            var prosClientGuarantorObj = require(commonDTO +"/prospectClientGuarantor");
            var prosClientFamilyDetailObj = require(commonDTO +"/prospectClientFamilyDetail");
            var prosClientObj = require(commonDTO +"/prospectClient");
            var prosClientHouseDetailObj = require(commonDTO +"/prospectClientHouseDetail");
            var prosClientBankDetailObj = require(commonDTO +"/prospectClientBankDetail");
            var prosClientOtherMfiDetailObj = require(commonDTO +"/prospectClientOtherMfiDetail");
            var prosClientOtherDetailObj = require(commonDTO +"/prospectClientOtherDetail");

            if(typeof tenantId == 'undefined' || typeof userId == 'undefined' || typeof req.session.operationId == 'undefined') {
                res.redirect(props.contextPath+'/client/ci/login');
            }
            else {
                var groupId = req.body.groupIdHiddenName;
                var flagValue =  req.body.flagHidden;
                var deletedMembers = req.body.deleteclientNamehidden;
                var deletedMemberRelation = req.body.deleteclientRelationhidden;
                var deletedMemberIncome =	req.body.deleteclientIncomehidden;
                //MEMBER PERSONAL DETAILS
                var prospectClientPersonal = new prosClientPersonalObj();
                prospectClientPersonal.clearAll();
                prospectClientPersonal.setClient_id(req.body.MemberName);
                prospectClientPersonal.setMembFirstName(req.body.MembFirstName);
                prospectClientPersonal.setMembLastName(req.body.MembLastName);
                prospectClientPersonal.setDate_of_birth(dateUtils.formatDate(req.body.DateOfBirth));
                prospectClientPersonal.setMobile_number(req.body.ContactNumber);
                prospectClientPersonal.setLandLine_number(req.body.landlineNumber);
                prospectClientPersonal.setAddress(req.body.AddressDetails);
                prospectClientPersonal.setPincode(req.body.PinCode);
                prospectClientPersonal.setRation_card_number(req.body.RationCardNumber);
                prospectClientPersonal.setVoter_id(req.body.voterId);
                prospectClientPersonal.setGas_number(req.body.GasNumber);
                prospectClientPersonal.setAadhaar_number(req.body.AadhaarNo);
                prospectClientPersonal.setIs_other_id(req.body.otherIdsNameHidden);
                prospectClientPersonal.setOther_id_name(req.body.otherIdName);
                prospectClientPersonal.setOther_id(req.body.otherId);
                prospectClientPersonal.setOther_id_name2(req.body.otherIdName2);
                prospectClientPersonal.setOther_id2(req.body.otherId2);
                prospectClientPersonal.setGender(req.body.genderValue);
                prospectClientPersonal.setMarital_status(req.body.MaritalStatus);
                prospectClientPersonal.setNationality(req.body.nationality);
                prospectClientPersonal.setReligion(req.body.Religion);
                prospectClientPersonal.setCaste(req.body.Caste);
                prospectClientPersonal.setEducational_details(req.body.EducationDetails);
                prospectClientPersonal.setLoan_purpose(req.body.LoanPurpose);
                prospectClientPersonal.setBusinessCategoryId(req.body.BusinessCategory);
                prospectClientPersonal.setGuardian_relationship(req.body.relationshipValue);
                prospectClientPersonal.setGuardian_name(req.body.HusbandOrFatherName);
                prospectClientPersonal.setGuardian_lastname(req.body.HusbandOrFatherLastName);
                if(typeof(req.body.HusbandOrFatherAge) == 'undefined' | req.body.HusbandOrFatherAge == '' |  req.body.HusbandOrFatherAge== 'NULL' ){
                    prospectClientPersonal.setGuardian_dob('0000-00-00');
                }
                else{
                    prospectClientPersonal.setGuardian_dob(dateUtils.formatDate(req.body.HusbandOrFatherAge));
                }

                //GUARANTOR DETAILS
                var prospectClientGuarantor = new prosClientGuarantorObj();
                prospectClientGuarantor.clearAll();
                prospectClientGuarantor.setGuarantorName(req.body.GuarantorName);
                if(typeof(req.body.GuarantorAge) == 'undefined' | req.body.GuarantorAge == '' |  req.body.GuarantorAge == 'NULL' ){
                    prospectClientGuarantor.setGuarantorDob('0000-00-00');
                }
                else{
                    prospectClientGuarantor.setGuarantorDob(dateUtils.formatDate(req.body.GuarantorAge));
                }
                prospectClientGuarantor.setGuarantorRelationship(req.body.GuarantorRelationship);
                prospectClientGuarantor.setGuarantorAddress(req.body.GuarantorAddress);
                prospectClientGuarantor.setGuarantorId(req.body.guarantorId);
                prospectClientGuarantor.setOtherGuarantorRelationshipName(req.body.otherRelationShipName);
                //FAMILY DETAILS(POPUP)
                var prospectClientFamilyDetail = new prosClientFamilyDetailObj();
                prospectClientFamilyDetail.setMember_name(req.body.nameHidden);

                if(typeof(req.body.ageHidden) == 'undefined' | req.body.ageHidden == '' |  req.body.ageHidden== 'NULL' ){
                    prospectClientFamilyDetail.setMember_dob('0000-00-00');
                }
                else{
                    prospectClientFamilyDetail.setMember_dob(req.body.ageHidden);
                }

                prospectClientFamilyDetail.setMember_gender(req.body.genderHidden);
                prospectClientFamilyDetail.setMember_relationship(req.body.relationshipHidden);
                prospectClientFamilyDetail.setMember_education(req.body.educationHidden);
                prospectClientFamilyDetail.setMember_occupation(req.body.occupationHidden);
                prospectClientFamilyDetail.setMember_income(req.body.incomeHidden);

                //FAMILY DETAILS
                var prospectClient = new prosClientObj();
                prospectClient.clearAll();
                prospectClient.setIs_loan_secured(req.body.OtherMfiLoanHidden);
                prospectClient.setFamily_monthly_income(req.body.FamilyTotalIncome);
                prospectClient.setFamily_monthly_expense(req.body.FamilyMonthlyExpenses);
                //prospectClient.setRepaymentTrackRecord(req.body.RepaymentTrackRecordName);
                //customlog.info("Repayment : "+req.body.RepaymentTrackRecordName);
                //HOUSE DETAILS
                var prospectClientHouseDetail = new prosClientHouseDetailObj();
                prospectClientHouseDetail.clearAll();
                prospectClientHouseDetail.setHouse_type(req.body.House);
                if(typeof(req.body.TimePeriod) == 'undefined' | req.body.TimePeriod == '' |  req.body.TimePeriod== 'NULL' ){
                    prospectClientHouseDetail.setTime_period(0);
                }
                else{
                    prospectClientHouseDetail.setTime_period(req.body.TimePeriod);
                }

                if(typeof(req.body.Housesqft) == 'undefined' | req.body.Housesqft == '' |  req.body.Housesqft== 'NULL' ){
                    prospectClientHouseDetail.setHouse_sqft(0);
                }
                else{
                    prospectClientHouseDetail.setHouse_sqft(req.body.Housesqft);
                }

                prospectClientHouseDetail.setHouse_ceiling_type(req.body.HouseCeilingType);
                prospectClientHouseDetail.setHouse_wall_type(req.body.HouseWallType);
                prospectClientHouseDetail.setHouse_flooring_detail(req.body.HouseFlooringDetails);
                prospectClientHouseDetail.setHouse_room_detail(req.body.houseroom);
                //prospectClientHouseDetail.setHousehold_details(req.body.household);
                prospectClientHouseDetail.setVehicle_details(req.body.vehicles);
                prospectClientHouseDetail.setHouse_toilet(req.body.HouseToilet);

                //BANK ACCOUNT DETAILS
                var prospectClientBankDetail = new prosClientBankDetailObj();
                prospectClientBankDetail.clearAll();
                prospectClientBankDetail.setIs_bank_account(req.body.BankAccountHidden);
                prospectClientBankDetail.setIs_Savings(req.body.SavingsHidden);
                //prospectClientBankDetail.setIs_Insurance_Lifetime(req.body.LifeTimeInsuranceHidden);
                //prospectClientBankDetail.setIs_Insurance_Accidental(req.body.AccidentalInsuranceHidden);
                //prospectClientBankDetail.setIs_Insurance_Medical(req.body.MedicalInsuranceHidden);

                //OTHER MFI LOAN DETAILS
                var prospectClientOtherMfiDetail = new prosClientOtherMfiDetailObj();
                prospectClientOtherMfiDetail.clearAll();
                prospectClientOtherMfiDetail.setDeletedOtherMfiLoanClientNames(req.body.deleteOtherMfiClienthidden);
                prospectClientOtherMfiDetail.setDeletedOtherMfiLoanClientAmtSecured(req.body.deleteOtherMfiAmtSecuredHidden);
                prospectClientOtherMfiDetail.setDeletedOtherMfiLoanClientOutstanding(req.body.deleteOtherMfiOutHidden);

                prospectClientOtherMfiDetail.setOtherMfiName(req.body.OtherMfiNameHidden);
                prospectClientOtherMfiDetail.setOtherMfiAmountSecured(req.body.OtherMfiAmountHidden);

                if(typeof(req.body.OtherMfiOutstandingHidden) == 'undefined' | req.body.OtherMfiOutstandingHidden == '' |  req.body.OtherMfiOutstandingHidden== 'NULL' ){
                    prospectClientOtherMfiDetail.setOtherMfiLoanOutstanding(0);
                }
                else{
                    prospectClientOtherMfiDetail.setOtherMfiLoanOutstanding(req.body.OtherMfiOutstandingHidden);
                }
                prospectClientOtherMfiDetail.setOtherMfiLoanOutstanding(req.body.OtherMfiOutstandingHidden);

                //OTHER DETAILS
                var prospectClientOtherDetail = new prosClientOtherDetailObj();
                prospectClientOtherDetail.clearAll();
                prospectClientOtherDetail.setIsDeclarationAcksign(req.body.DeclarationAcknowledgedSignedHidden);
                prospectClientOtherDetail.setIsPledgeAcksign(req.body.PledgeAcknowledgedSignedHidden);
                prospectClientOtherDetail.setIsGuarantorAcksign(req.body.GuarantorAcknowledgedSignedHidden);
                prospectClientOtherDetail.setIsMemberPhotocopyAttached(req.body.MemberPhotocopyAttachedHidden);
                prospectClientOtherDetail.setIsGuarantorPhotocopyAttached(req.body.GuarantorPhotocopyAttachedHidden);

                self.saveKYC_UpdatingCallForNMIClients(deletedMembers,deletedMemberRelation,deletedMemberIncome,flagValue,prospectClientPersonal,prospectClientGuarantor,prospectClientFamilyDetail,prospectClient,prospectClientHouseDetail,prospectClientBankDetail,prospectClientOtherMfiDetail,prospectClientOtherDetail,function(successMessage,groupId,prospectClientFamilyFetchObject,prospectClient,prospectGroup,clientId,clientNames,lookupEntityObj,clientNameID,prospectClientPersonalObject,prospectClientGuarantorObject,prospectClientHouseDetailObject,prospectClientBankDetailObject,prospectClientOtherMfiDetailObject,prospectClientOtherDetailObject,flag){
                    var activityDetails = new Array(iklantPort, req.session.tenantId, req.session.userId, req.session.userName, req.originalUrl, req.connection.remoteAddress, "router.js", "saveKYC_UpdatingForNMIClients", "success", "KYC_UpdatingForNMIClients", "KYC_UpdatingForNMIClients successfully for "+req.body.MemberName,"insert");
                    self.commonRouter.insertActivityLogModel(activityDetails);
                    if(clientId.length > 0){
                        self.KYC_UpdatingCallForNMIClients(groupId,function(groupId,prospectClientFamilyFetchObject,prospectClient,prospectGroup,clientId,clientNames,lookupEntityObj,clientNameID,prospectClientPersonalObject,prospectClientGuarantorObject,prospectClientHouseDetailObject,prospectClientBankDetailObject,prospectClientOtherMfiDetailObject,prospectClientOtherDetailObject,flag){
                            self.showKYC_UpdatingForNMIClients(res,successMessage,groupId,prospectClientFamilyFetchObject,prospectClient,prospectGroup,clientId,clientNames,lookupEntityObj,clientNameID,prospectClientPersonalObject,prospectClientGuarantorObject,prospectClientHouseDetailObject,prospectClientBankDetailObject,prospectClientOtherMfiDetailObject,prospectClientOtherDetailObject,flag,req.body.reqOfficeHidden,menu);
                        });
                    }
                    else{
                        req.params.officeId = req.body.reqOfficeHidden;
                        req.params.operationId = constantObj.getNeedMoreVerificationOperationId();
                        self.commonRouter.listGroups(req,res);
                    }
                });
                //this.KYC_Updating(req,res);
            }
        }catch(e){
            customlog.error("Exception while saveKYC_UpdatingForNMIClients "+e);
            self.commonRouter.showErrorPage(req,res);
        }
    },
    saveKYC_UpdatingCallForNMIClients:function(deletedMembers,deletedMemberRelation,deletedMemberIncome,flagValue,prospectClientPersonal,prospectClientGuarantor,prospectClientFamilyDetail,prospectClient,prospectClientHouseDetail,prospectClientBankDetail,prospectClientOtherMfiDetail,prospectClientOtherDetail,callback) {
        this.model.saveKYC_UpdatingModelForNMIClients(deletedMembers,deletedMemberRelation,deletedMemberIncome,flagValue,prospectClientPersonal,prospectClientGuarantor,prospectClientFamilyDetail,prospectClient,prospectClientHouseDetail,prospectClientBankDetail,prospectClientOtherMfiDetail,prospectClientOtherDetail,callback);
    },
    creditBureauForClients: function(req, res) {
        try{
            var self = this;
            var tenantId = req.session.tenantId;
            var userId = req.session.userId;
            var userName = req.session.userName;
            var reqOfficeId = req.body.reqOfficeHidden;
            var menu = req.body.menuName;
            if(typeof tenantId == 'undefined' || typeof userId == 'undefined') {
                res.redirect(props.contextPath+'/client/ci/login');
            }
            else {
                //var activityDetails = new Array(iklantPort, req.session.tenantId, req.session.userId, req.session.userName, req.originalUrl, req.connection.remoteAddress, "router.js", "creditBureauForClients", "success", "creditBureauForClients", "creditBureauForClients");
                //self.model.insertActivityLogModel(activityDetails);
                var clientId = req.params.clientId;
                var groupId = req.body.groupIdName;
                this.listcreditBureauForClients(clientId,function(groupName,groupCentreName,clientIdsArray,clientNamesArray,prospectClientObj,prospectClientPersonalObj,prospectClientOtherMfiDetailObj,lookupEntityObj,prospectClientGuarantorObj,groupPreviousStatus) {
                    self.showCreditReport(req, res,groupId,groupName,groupCentreName,clientId,clientIdsArray,clientNamesArray,prospectClientObj,prospectClientPersonalObj,prospectClientOtherMfiDetailObj,lookupEntityObj,prospectClientGuarantorObj,userName,reqOfficeId,'',menu,groupPreviousStatus);
                });
            }

        }catch(e){
            customlog.error("Exception while Credit BureauFor Clients "+e);
            self.commonRouter.showErrorPage(req,res);
        }
    },
    listcreditBureauForClients: function(clientId,callback) {
        this.model.listcreditBureauForClientsModel(clientId,callback);
    },
    saveRepaymentRecord: function(req, res) {
        try{
            var self = this;
            var tenantId = req.session.tenantId;
            var userId = req.session.userId;
            var officeId = req.session.officeId;
            var roleId = req.session.roleId;
            var constantsObj = this.constants;
            var reqOfficeId = req.body.reqOfficeHidden;
            var groupPreviousStatus = req.body.groupPreviousStatus;
            var menu = req.body.menuName;
            //file upload[adarsh]
            var fs = require('fs'),
                util = require('util');
            var fileName = new Array();
            if(typeof tenantId == 'undefined' || typeof userId == 'undefined' || typeof req.session.officeId == 'undefined') {
                res.redirect(props.contextPath+'/client/ci/login');
            }
            else {
                var isMulitpleDoc = req.body.isMultipleDocument;
                if(isMulitpleDoc=="true"){
                    customlog.info("inside true");
                    customlog.info("req.files.multipleUploadDocument.length" + req.files.multipleUploadDocument.length + "\n")
                    for(var i=0; i<req.files.multipleUploadDocument.length; i++){
                        fileName[i]=req.files.multipleUploadDocument[i].name;
                        var is = fs.createReadStream(req.files.multipleUploadDocument[i].path);
                        var os = fs.createWriteStream(rootPath+"/documents/credit_reports/"+fileName[i]);
                        is.pipe(os);
                        is.on('end', function() {
                            customlog.info('Successfully uploaded');
                            alertMsg = "File has been Uploaded Successfully!"
                        });
                        fs.unlink(req.files.multipleUploadDocument[i].path, function(err){
                            if(err){ customlog.error('Error while unlinking '+err); }
                            else { customlog.info('Successfully unlinked');};
                        });
                        is.on('error', function(err) { customlog.error("error while uploading "+err); });
                    }
                }
                else if(isMulitpleDoc== "false"){
                    if(req.files.singleUploadDocument.name!=""){
                        fileName[0]=req.files.singleUploadDocument.name;
                        if(req.files.singleUploadDocument.name!=""){
                            var is = fs.createReadStream(req.files.singleUploadDocument.path)
                            var os = fs.createWriteStream(rootPath+"/documents/credit_reports/"+req.files.singleUploadDocument.name);
                            is.pipe(os);
                            is.on('end', function() {
                                customlog.info('Successfully uploaded');
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
                customlog.info("req.body.otherMfiBalanceAmount" + req.body.otherMfiBalanceAmount);
                customlog.info("req.body.OtherMfiNameHidden" + req.body.OtherMfiNameHidden);
                var otherMFINames =new Array();
                if(req.body.OtherMfiNameHidden != undefined){
                    otherMFINames = (req.body.OtherMfiNameHidden).split(",");
                }
                //customlog.info("otherMFINames" + otherMFINames);
                var  otherMFIBalanceAmounts;
                if(typeof(req.body.otherMfiBalanceAmount) == 'undefined' | req.body.otherMfiBalanceAmount == '' |  req.body.otherMfiBalanceAmount== 'NULL' ){
                    otherMFIBalanceAmounts = 0;
                }else{
                    otherMFIBalanceAmounts = (req.body.otherMfiBalanceAmount.indexOf(',') > -1)?req.body.otherMfiBalanceAmount.replace(',',''):req.body.otherMfiBalanceAmount;
                }
                var  otherMFIWrittenOffAmounts;
                if(typeof(req.body.otherMfiWrittenOffAmount) == 'undefined' | req.body.otherMfiWrittenOffAmount == '' |  req.body.otherMfiWrittenOffAmount== 'NULL' ){
                    otherMFIWrittenOffAmounts = 0;
                }else{
                    otherMFIWrittenOffAmounts = (req.body.otherMfiWrittenOffAmount.indexOf(',') > -1)?req.body.otherMfiWrittenOffAmount.replace(',',''):req.body.otherMfiWrittenOffAmount;
                }
                var repaymentTrackId = req.body.repaymentTrackRecord;
                var clientId = req.params.clientId;
                var groupId = req.body.groupIdName;
                if(officeId == constantsObj.getSMHroleId()){
                    officeId = reqOfficeId;
                }
                var remarksForRejection = (typeof req.body.reasonForRejection == 'undefined')?"":req.body.reasonForRejection;
                customlog.info('reqOfficeId '+reqOfficeId+" officeId "+officeId);
                this.saveCreditBureauForClients(clientId,repaymentTrackId,fileName,otherMFINames,otherMFIBalanceAmounts,otherMFIWrittenOffAmounts,userId,remarksForRejection,groupPreviousStatus,function(groupName,groupCentreName,clientIdsArray,clientNamesArray,prospectClientObj,prospectClientPersonalObj,prospectClientOtherMfiDetailObj,lookupEntityObj,prospectGuarantorObj,successMsg) {
                    var activityDetails = new Array(iklantPort, req.session.tenantId, req.session.userId, req.session.userName, req.originalUrl, req.connection.remoteAddress, "router.js", "saveRepaymentRecord", "success", "CBA Analysis", "ClientId "+clientId+" CBA Repayment record Saved successfully","insert");
                    self.commonRouter.insertActivityLogModel(activityDetails);
                    if(clientIdsArray.length!=0) {
                        self.showCreditReport(req, res,groupId,groupName,groupCentreName,clientId,clientIdsArray,clientNamesArray,prospectClientObj,prospectClientPersonalObj,prospectClientOtherMfiDetailObj,lookupEntityObj,prospectGuarantorObj,"",reqOfficeId,successMsg,menu);
                    }
                    else {
                        self.commonRouter.ListGroupsCall(tenantId,userId,officeId,roleId,constantsObj.getCreditBureauAnalysedOperationId(),function(listGroupsIdArray,listGroupsArray,activeClients,neededInfo,isSynchronized,listGroupsGlobalNumberArray,fieldOfficerName,neededImageClarity,mifosCustomerId,isDataVerifiedArray,activeClientsPerStatus,dataEntryDate,error_msg_array,accountNumbers, loanCount,statusIds,freshClientsCountArray,holdedClientsCount,totalClientsCountArray){
                            self.commonRouter.showListGroupsOperations(req, res,constantsObj.getCreditBureauAnalysedOperationId(),listGroupsIdArray,listGroupsArray,activeClients,neededInfo,isSynchronized,listGroupsGlobalNumberArray,fieldOfficerName,neededImageClarity,mifosCustomerId,isDataVerifiedArray,"",reqOfficeId,"",activeClientsPerStatus,dataEntryDate,'',menu,accountNumbers, loanCount,statusIds,freshClientsCountArray,holdedClientsCount,totalClientsCountArray);
                        });
                    }
                });
            }
        }catch(e){
            customlog.error("Exception while Save repayment track record "+e);
            self.commonRouter.showErrorPage(req,res);
        }
    },
    saveCreditBureauForClients: function(clientId,repaymentTrackId,fileName,otherMFINames,otherMFIBalanceAmounts,otherMFIWrittenOffAmounts,userId,remarksForRejection,groupPreviousStatus,callback) {
        this.model.saveCreditBureauForClientsModel(clientId,repaymentTrackId,fileName,otherMFINames,otherMFIBalanceAmounts,otherMFIWrittenOffAmounts,userId,remarksForRejection,groupPreviousStatus,callback);
        //[added fileName][modified by Adarsh]
},
    leaderSubLeaderFormDownloadCall: function(group_id,loanCount,docType,access_type_id,localMachineIp,callback) {
        this.model.leaderSubLeaderFormDownloadModel(group_id,loanCount,docType,access_type_id,localMachineIp,callback);
    },

    getClientDetailsForLeaderSubLeader: function(req, res) {
        try{
            var self = this;
            var tenantId = req.session.tenantId;
            var userId = req.session.userId;
            var officeId = req.session.officeId;
            var roleId = req.session.roleId;
            var constantsObj = this.constants;
            var reqOfficeId = req.body.reqOfficeHidden;
            var menu = req.body.menuName;
            //var access_type_id = 2;
            var access_type_id = props.accessType;
            var localMachineIp = props.loacalMachineIP;
            var loanCount = req.params.loanCount;
            var groupId = req.params.groupId;
            if(typeof tenantId == 'undefined' || typeof userId == 'undefined' || typeof req.session.officeId == 'undefined') {
                res.redirect(props.contextPath+'/client/ci/login');
            }
            else {
                self.leaderSubLeaderFormDownloadCall(groupId,loanCount,constantsObj.getLeaderSubLeaderDocId(),access_type_id,localMachineIp,function(status,base64ImageArray,groupId,memberId,docType,memberIdArray,memberNameArray,availDocTypeNameArray,availDocTypeIdArray){
                   self.getClientDetailsForLeaderSubLeaderCall(groupId,function(leaderSubLeaderDetailsDtoObj,groupName,centerName){
                       leaderSubLeaderDetailsDtoObj.setGroupName(groupName);
                       leaderSubLeaderDetailsDtoObj.setCenterName(centerName);
                       res.render('data_entry/leaderSubLeaderDetails', { leaderSubLeaderDetailsDtoObj:leaderSubLeaderDetailsDtoObj,operationId: req.body.operationId,selectedOfficeId:req.body.listoffice,
                           contextPath:props.contextPath,successMessage:"",base64ImageArray:base64ImageArray,groupId:groupId,memberId:memberId,docTypeIdArray:availDocTypeIdArray, memberIdArray:memberIdArray,memberNameArray:memberNameArray ,
                           availDocTypeIdArray:availDocTypeIdArray,availDocTypeNameArray:availDocTypeNameArray,docType:docType,officeValue:officeId,status:status,selectedClientType:"",loanCount:loanCount,access_type_id:access_type_id});
                   });
                });
            }
        }catch(e){
            customlog.error("Exception while fetching the details for the Leader and Sub Leader "+e);
            self.commonRouter.showErrorPage(req,res);
        }
    },

    getClientDetailsForLeaderSubLeaderCall: function(groupId,callback) {
        this.model.getClientDetailsForLeaderSubLeaderModel(groupId,callback);
    },

    saveSubGroupDetails: function(req, res) {
        try{
            var self = this;
            var tenantId = req.session.tenantId;
            var userId = req.session.userId;
            var officeId = req.session.officeId;
            var roleId = req.session.roleId;
            var constantsObj = this.constants;
            var reqOfficeId = req.body.reqOfficeHidden;
            var isDataVerified = req.body.isDataVerified;
            var menu = req.body.menuName;
            var access_type_id = 2;
            var loanCount = req.params.loanCount;
            var groupId = req.params.groupId;
            if(typeof tenantId == 'undefined' || typeof userId == 'undefined' || typeof req.session.officeId == 'undefined') {
                res.redirect(props.contextPath+'/client/ci/login');
            }
            else {
                self.saveSubGroupDetailsCall(req, res,groupId,loanCount,function(clientUpdateStatus){
                   if(clientUpdateStatus == "success"){
                        self.saveLeaderDetailsCall(req, res,groupId,loanCount,function(groupUpdateStatus){
                            if(groupUpdateStatus == "success"){
                                req.params.officeId = reqOfficeId;
                                var activityDetails = "";
                                if(isDataVerified == 1){
                                    req.params.operationId = constantsObj.getLeaderSubLeaderVerificationOperationId();
                                    activityDetails = new Array(iklantPort, req.session.tenantId, req.session.userId, req.session.userName, req.originalUrl, req.connection.remoteAddress, "DataEntryRouter.js", "saveSubGroupDetails", "success", "Leader and Sub Leader Verified", "Leader and Sub Leader Verified successfully for "+groupId,"update");
                                }else{
                                    activityDetails = new Array(iklantPort, req.session.tenantId, req.session.userId, req.session.userName, req.originalUrl, req.connection.remoteAddress, "DataEntryRouter.js", "saveSubGroupDetails", "success", "Leader and Sub Leader Updated", "Leader and Sub Leader Updated successfully for "+groupId,"update");
                                    req.params.operationId = constantsObj.getLeaderSubLeaderUpdatingOperationId();
                                }
                                self.commonRouter.insertActivityLogModel(activityDetails);
                                self.commonRouter.listGroups(req,res);
                            }
                            else{
                                customlog.error("Error while update the Leader and Sub Leader ");
                                self.commonRouter.showErrorPage(req,res);
                            }
                        });
                    }
                    else{
                       customlog.error("Error while updating the Leader and Sub Leader ");
                       self.commonRouter.showErrorPage(req,res);
                   }
                });
            }
        }catch(e){
            customlog.error("Exception while fetching the details for the Leader and Sub Leader "+e);
            self.commonRouter.showErrorPage(req,res);
        }
    },
    saveSubGroupDetailsCall: function(req, res,groupId,loanCount,callback) {
        this.model.saveSubGroupDetailsCallModel(req, res,groupId,loanCount,callback);
    },

    saveLeaderDetailsCall: function(req, res,groupId,loanCount,callback) {
        this.model.saveLeaderDetailsCallModel(req, res,groupId,loanCount,callback);
    },
    saveReUpdateDEClientDetails: function(req, res) {
        try{
            var self = this;
            var tenantId = req.session.tenantId;
            var userId = req.session.userId;
            var officeId = req.session.officeId;
            var roleId = req.session.roleId;
            var constantsObj = this.constants;
            var reqOfficeId = req.body.reqOfficeHidden;
            var isDataVerified = req.body.isDataVerified;
            var menu = req.body.menuName;
            var memberId = req.body.MemberName;
            var groupId = req.body.groupIdHiddenName;
            var pageName = req.body.pageName;
            var selectedDocTypes="DV Query";
            var remarks=req.body.remarks;
            remarks+=":";
            remarks+=req.body.checkBoxValue;
            var reasonForHold = '3';
            if(typeof tenantId == 'undefined' || typeof userId == 'undefined' || typeof req.session.officeId == 'undefined') {
                res.redirect(props.contextPath+'/client/ci/login');
            }
            else {
                self.saveReUpdateDEClientDetailsCall(groupId,memberId,tenantId,userId,pageName,selectedDocTypes,remarks,reasonForHold,function(statusmsg){
                    if(statusmsg=="kycresuccess"){
                        var successMessage ="KYC Data Verification Completed Successfully";
                        var activityDetails = new Array(iklantPort, req.session.tenantId, req.session.userId, req.session.userName, req.originalUrl, req.connection.remoteAddress, "DataEntryRouter.js", "saveReUpdateDEClientDetails", "success", "saveReUpdateDEClientDetails", "saveReUpdateDEClientDetails successfully for "+groupId+"member Id"+memberId,"update");
                        self.KYC_UpdatingCall(groupId,pageName, function (groupId, prospectClientFamilyFetchObject, prospectClient, prospectGroup, clientId, clientNames, lookupEntityObj, clientNameID, prospectClientPersonalObject, prospectClientGuarantorObject, prospectClientHouseDetailObject, prospectClientBankDetailObject, prospectClientOtherMfiDetailObject, prospectClientOtherDetailObject, flag) {
                            self.commonRouter.retrieveDocTypeList(tenantId, function (docTypeIdArray, docTypeNameArray) {
                                if (clientId.length == 0) {

                                    req.params.operationId = constantsObj.getDataVerificationOperationId();
                                    req.params.officeId = reqOfficeId;
                                    self.commonRouter.listGroups(req, res);
                                    self.commonRouter.insertActivityLogModel(activityDetails);
                                }
                                else if (clientId.length >= 0){
                                    self.commonRouter.insertActivityLogModel(activityDetails);
                                    self.showKYC_DataVerification(res, successMessage, groupId, prospectClientFamilyFetchObject,
                                        prospectClient, prospectGroup, clientId, clientNames, lookupEntityObj, clientNameID,
                                        prospectClientPersonalObject, prospectClientGuarantorObject, prospectClientHouseDetailObject,
                                        prospectClientBankDetailObject, prospectClientOtherMfiDetailObject, prospectClientOtherDetailObject,
                                        flag, docTypeIdArray, docTypeNameArray, pageName, reqOfficeId, '', menu);
                                }
                            });
                        });
                    }
                    else{
                        customlog.error("Error while save kyc Updating - Query exception");
                        self.commonRouter.showErrorPage(req,res);
                    }
                });
            }
        }catch(e){
            customlog.error("Exception while Saving Re update Data Entry Client Details "+e);
            self.commonRouter.showErrorPage(req,res);
        }
    },
    saveReUpdateDEClientDetailsCall: function(groupId,memberId,tenantId,userId,pageName,selectedDocTypes,remarks,reasonForHold,callback) {
        this.model.saveReUpdateDEClientDetailsCallModel(groupId,memberId,tenantId,userId,pageName,selectedDocTypes,remarks,reasonForHold,callback);
    },

    getClientDetailsForLeaderSubLeaderVerification: function(req, res) {
        try{
            var self = this;
            var tenantId = req.session.tenantId;
            var userId = req.session.userId;
            var roleId = req.session.roleId;
            var officeId = req.session.officeId;
            if(typeof tenantId == 'undefined' || typeof userId == 'undefined' || typeof officeId == 'undefined' || typeof roleId == 'undefined') {
                res.redirect(props.contextPath+'/client/ci/login');
            }
            else {
                var constantsObj = this.constants;
                var reqOfficeId = req.body.reqOfficeHidden;
                var menu = req.body.menuName;
                var access_type_id = 2;
                var loanCount = req.params.loanCount;
                var groupId = req.params.groupId;
                //self.leaderSubLeaderFormDownloadCall(groupId,loanCount,constantsObj.getLeaderSubLeaderDocId(),access_type_id,function(status,base64ImageArray,groupId,memberId,docType,memberIdArray,memberNameArray,availDocTypeNameArray,availDocTypeIdArray){
                    self.getClientDetailsForLeaderSubLeaderVerificationCall(groupId,roleId,function(leaderSubLeaderDetailsDtoObj,groupName,centerName){
                        leaderSubLeaderDetailsDtoObj.setGroupName(groupName);
                        leaderSubLeaderDetailsDtoObj.setCenterName(centerName);
                        res.render('data_entry/leaderSubLeaderVerificationDetails', { leaderSubLeaderDetailsDtoObj:leaderSubLeaderDetailsDtoObj,operationId: req.body.operationId,selectedOfficeId:req.body.listoffice,roleId:roleId,
                            contextPath:props.contextPath,successMessage:"",base64ImageArray:"",groupId:groupId,memberId:"",docTypeIdArray:"", memberIdArray:"",memberNameArray:"" ,
                            availDocTypeIdArray:"",availDocTypeNameArray:"",docType:"",officeValue:officeId,status:"",selectedClientType:"",loanCount:loanCount,constantsObj:constantsObj});
                    });
                //});
            }
        }catch(e){
            customlog.error("Exception while fetching the details for the Leader and Sub Leader "+e);
            self.commonRouter.showErrorPage(req,res);
        }
    },

    getClientDetailsForLeaderSubLeaderVerificationCall: function(groupId,roleId,callback) {
        this.model.getClientDetailsForLeaderSubLeaderVerificationModel(groupId,roleId,callback);
    },

    callToLDCallTrack:function(req, res) {
        try{
            var self = this;
            if(typeof (req.session.tenantId) == 'undefined' || typeof (req.session.userId) == 'undefined') {
                res.redirect(props.contextPath + '/client/ci/showErrorPage');
            }
            else
            {
                var tenantId = req.session.tenantId;
                var groupId = req.body.groupId;
                var groupName = req.body.groupName;
                var centerName = req.body.centerName;
                var clientId = req.body.clientId;
                var clientName = req.body.clientName;
                var numberToCall = req.body.numberToCall;
                var officeId = req.body.officeId;
                var loanAccountId = req.body.loanAccountId;
                var callCenterExeId = req.session.userId;
                var callTrackingId = req.body.callTrackingId;
                self.model.callToLDCallTrackModel(tenantId,groupId,groupName,centerName,clientId,clientName,numberToCall,officeId,loanAccountId,callCenterExeId,callTrackingId,function(status,callTrackingId,result) {
                    if(status == "success"){
                        req.body.callTrackingId = callTrackingId;
                        req.body.result = result;
                        req.body.status = status;
                        res.send(req.body);
                    }
                    else{
                        req.body.status = "failure";
                        req.body.callTrackingId = callTrackingId;
                        req.body.result = result;
                        res.send(req.body);
                    }
                });
            }
        }
        catch(e){

        }
    },
    showLDCallTrackingGroupDetail : function(req,res){
        var self = this;
        var constantsObj = this.constants;
        var tenantId = req.session.tenantId;
        var userId = req.session.userId;
        var roleId = req.session.roleId;
        var officeId = req.session.officeId;
        var groupId = req.body.groupId;
        var accountId = req.body.accountId;
        try{
            this.model.getLDClientDetailsModel(groupId,accountId,function(result){
                res.render('data_entry/LDCallTrackingGroupDetails',{result:result,contextPath:props.contextPath});
            });
        }
        catch(e){
            self.commonRouter.showErrorPage(req,res);
            customlog.error("Error In Show LD Tracking Method : ",e);
        }
    },

    showLDCheckList : function(req,res){
        var self = this;
        var constantsObj = this.constants;
        var groupId = req.body.groupId;
        var accountId = req.body.accountId;
        var clientId = req.body.clientId;
        try{
            this.model.getLDClientDetailByClientIdModel(groupId,accountId,clientId,function(result){
                res.render('data_entry/LDCallTrackingCheckList',{result:result,clientId:clientId,contextPath:props.contextPath});
            });
        }
        catch(e){
            self.commonRouter.showErrorPage(req,res);
            customlog.error("showLDCheckList : ",e);
        }

    },


    updateClientLDTrack: function(req,res){
        var self = this;
        var constantsObj = this.constants;
        var tenantId = req.session.tenantId;
        var userId = req.session.userId;
        var roleId = req.session.roleId;
        var officeId = req.session.officeId;


        var clientId = req.body.clientId;
        var groupId = req.body.groupId;
        var accountId = req.body.accountId;
        var clientAccountId = req.body.clientAccountId;
        var callTrackingId = req.body.callTrackingId;


        var mrs = req.body.mrs;
        var groupName = req.body.groupName;
        var apexAbishek = req.body.apexAbishek;
        var fv = req.body.fv;
        var fo = req.body.fo;
        var disbursedAmount = req.body.disbursedAmount;
        var EMIAMount = req.body.EMIAMount;
        var interestRate = req.body.interestRate;
        var tenurePeriod = req.body.tenurePeriod;
        var finLiteracy = req.body.finLiteracy;
        var legalPaper = req.body.legalPaper;
        var processingFee = req.body.processingFee;
        var awareness = req.body.awareness;
        var isCallTrackingCompleted = req.body.callTrackingCompleted;


        var mrsRemarksId = req.body.mrsRemarks;
        var groupNameRemarksId = req.body.groupNameRemarks;
        var apexAbishekRemarksId = req.body.apexAbishekRemarks;
        var fvRemarksId = req.body.fvRemarks;
        var disbursedAmountRemarksId = req.body.disbursedAmountRemarks;
        var EMIAMountRemarksId = req.body.EMIAMountRemarks;
        var interestRateRemarksId = req.body.interestRateRemarks;
        var tenurePeriodRemarks = req.body.tenurePeriodRemarks;
        var finLiteracyRemarks = req.body.finLiteracyRemarks;
        var legalPaperRemarks = req.body.legalPaperRemarks;
        var processingFeeRemarks = req.body.processingFeeRemarks;
        var awarenessRemarks = req.body.awarenessRemarks;
        var callStatusRemarks = req.body.callStatusRemarks;

        var callStatus = req.body.callStatus;
        var alternateNo = req.body.alternateNo;

        var questionList = new Array();

        try{
            var LDClientDetails = require(dtoPathDE+"/ldClientDetails");
            var LDClientDetails = new LDClientDetails();

            var questionListDto = require(dtoPathDE+"/ldQuestionListDto");

            if(callStatus == 147){
                var questionListDto1 = new questionListDto();
                questionListDto1.setQuestionId("35");
                questionListDto1.setAnswerId(mrs);
                questionListDto1.setRemarks(mrsRemarksId);

                var questionListDto2 = new questionListDto();
                questionListDto2.setQuestionId("36");
                questionListDto2.setAnswerId(groupName);
                questionListDto2.setRemarks(groupNameRemarksId);

                var questionListDto3 = new questionListDto();
                questionListDto3.setQuestionId("37");
                questionListDto3.setAnswerId(apexAbishek);
                questionListDto3.setRemarks(apexAbishekRemarksId);


                var questionListDto4 = new questionListDto();
                questionListDto4.setQuestionId("38");
                questionListDto4.setAnswerId(fv);
                questionListDto4.setRemarks(fvRemarksId);


                var questionListDto5 = new questionListDto();
                questionListDto5.setQuestionId("39");
                questionListDto5.setAnswerId(fo);
                questionListDto5.setRemarks("");

                var questionListDto6 = new questionListDto();
                questionListDto6.setQuestionId("40");
                questionListDto6.setAnswerId(disbursedAmount);
                questionListDto6.setRemarks(disbursedAmountRemarksId);

                var questionListDto7 = new questionListDto();
                questionListDto7.setQuestionId("41");
                questionListDto7.setAnswerId(EMIAMount);
                questionListDto7.setRemarks(EMIAMountRemarksId);

                var questionListDto8 = new questionListDto();
                questionListDto8.setQuestionId("42");
                questionListDto8.setAnswerId(interestRate);
                questionListDto8.setRemarks(interestRateRemarksId);

                var questionListDto9 = new questionListDto();
                questionListDto9.setQuestionId("43");
                questionListDto9.setAnswerId(tenurePeriod);
                questionListDto9.setRemarks(tenurePeriodRemarks);

                var questionListDto10 = new questionListDto();
                questionListDto10.setQuestionId("44");
                questionListDto10.setAnswerId(processingFee);
                questionListDto10.setRemarks(processingFeeRemarks);

                var questionListDto11 = new questionListDto();
                questionListDto11.setQuestionId("45");
                questionListDto11.setAnswerId(awareness);
                questionListDto11.setRemarks(awarenessRemarks);

                var questionListDto12 = new questionListDto();
                questionListDto12.setQuestionId("46");
                questionListDto12.setAnswerId(finLiteracy);
                questionListDto12.setRemarks(finLiteracyRemarks);

                var questionListDto13 = new questionListDto();
                questionListDto13.setQuestionId("47");
                questionListDto13.setAnswerId(legalPaper);
                questionListDto13.setRemarks(legalPaperRemarks);

                questionList.push(questionListDto1);
                questionList.push(questionListDto2);
                questionList.push(questionListDto3);
                questionList.push(questionListDto4);
                questionList.push(questionListDto5);
                questionList.push(questionListDto6);
                questionList.push(questionListDto7);
                questionList.push(questionListDto8);
                questionList.push(questionListDto9);
                questionList.push(questionListDto10);
                questionList.push(questionListDto11);
                questionList.push(questionListDto12);
                questionList.push(questionListDto13);
            }
            var questionListDto14 = new questionListDto();
            questionListDto14.setQuestionId("48");
            questionListDto14.setAnswerId(callStatus);
            questionListDto14.setRemarks(callStatusRemarks);
            questionList.push(questionListDto14);

            var callStatusCount = new Array();
            callStatusCount.push(parseInt(props.Lookup148Count));
            callStatusCount.push(parseInt(props.Lookup149Count));
            callStatusCount.push(parseInt(props.Lookup150Count));
            callStatusCount.push(parseInt(props.Lookup151Count));
            callStatusCount.push(parseInt(props.Lookup152Count));
            callStatusCount.push(parseInt(props.Lookup153Count));
            callStatusCount.push(parseInt(props.Lookup154Count));
            callStatusCount.push(parseInt(props.Lookup155Count));
            callStatusCount.push(parseInt(props.Lookup156Count));
            callStatusCount.push(parseInt(props.Lookup157Count));
            callStatusCount.push(parseInt(props.Lookup158Count));
            callStatusCount.push(parseInt(props.Lookup162Count));
            callStatusCount.push(parseInt(props.Lookup167Count));

            LDClientDetails.setClientId(clientId);
            LDClientDetails.setGroupId(groupId);
            LDClientDetails.setAccountId(accountId);
            LDClientDetails.setClientAccountId(clientAccountId);
            LDClientDetails.setCallTrackingId(callTrackingId);
            LDClientDetails.setUserId(userId);
            LDClientDetails.setCallTrackingCompleted(isCallTrackingCompleted);
            LDClientDetails.setQuestionList(questionList);
            LDClientDetails.setCallStatusCount(callStatusCount);
            LDClientDetails.setAlternateNo(alternateNo);
            var jsonArray = JSON.stringify(LDClientDetails);

            customlog.info("jsonArray" + jsonArray);

            var rest = require("./rest.js");

            var http = require('http');
            var https = require('https');

            var postheaders = {
                'Content-Type' : 'application/json',
                'Content-Length' : Buffer.byteLength(jsonArray, 'utf8'),
                'Cookie' : req.session.mifosCookie
            };

            var options = {
                host: mifosServiceIP,
                port: mifosPort,
                path: "/mfi/api/dataentry/ldcalltrack/update.json",
                method: 'POST',
                headers : postheaders
            };
            rest.postJSON(options,jsonArray,function(statuscode,result,headers){
                customlog.info("statuscode" + statuscode);
                customlog.info("result" + result.status);
                customlog.info("headers" + headers);
                if(statuscode == 302){
                    req.body.status = "Session Expired";
                    res.send(req.body);
                }
                else {
                    if(result.status == "success"){
                        req.body.status = "success";
                        req.body.isCallTrackingCompleted = isCallTrackingCompleted;
                        res.send(req.body);
                        //res.end();
                        //self.loanrecoveryloanaccounts(req,res);
                    }
                    else if(result.status == "failure"){
                        req.body.status = "failure";
                        res.send(req.body);
                        //res.end();
                    }else{
                        req.body.status = "failure";
                        res.send(req.body);
                        //res.end();
                    }
                }
            });

        }catch(e){
            req.body.status = "failure";
            res.send(req.body);
            //res.end();
            customlog.error("Error In updateClientLDTrack : ",e);
        }
    },

    showGroupCaseDetail : function(req,res){
        var self = this;
        var constantsObj = this.constants;
        var tenantId = req.session.tenantId;
        var userId = req.session.userId;
        var roleId = req.session.roleId;
        var officeId = req.session.officeId;
        var groupId = req.body.groupId;
        try{
            this.model.getLDGroupCaseDetailModel(groupId,roleId,function(result){
                res.render('data_entry/LDCallTrackingCaseView',{result:result,contextPath:props.contextPath,roleId:roleId});
            });
        }
        catch(e){
            self.showErrorPage(req,res);
        }
    },


    updateBMLDClientCaseTrack : function(req,res){
        var self = this;
        var constantsObj = this.constants;
        var tenantId = req.session.tenantId;
        var userId = req.session.userId;
        var roleId = req.session.roleId;
        var officeId = req.session.officeId;


        var groupId = req.body.groupId;
        var clientId = req.body.clientId;
        var emiMismatchCallTrackingDetailId = req.body.emiMismatchCallTrackingDetailId;
        var interestRateMismatchCallTrackingDetailId = req.body.interestRateMismatchCallTrackingDetailId;
        var tenureMismatchCallTrackingDetailId = req.body.tenureMismatchCallTrackingDetailId;
        var callStatusTrackId = req.body.callStatusTrackId;
        var bmRemarks = req.body.bmRemarks;

        var callTrakingList = new Array();
        var remarksList = new Array();


        try{
            var ldClientCaseDetails = require(dtoPathDE+"/ldClientCaseDetail");
            var ldClientCaseDetails = new ldClientCaseDetails();

            callTrakingList.push(emiMismatchCallTrackingDetailId);
            callTrakingList.push(interestRateMismatchCallTrackingDetailId);
            callTrakingList.push(tenureMismatchCallTrackingDetailId);
            callTrakingList.push(callStatusTrackId);


            remarksList.push(bmRemarks);
            remarksList.push(bmRemarks);
            remarksList.push(bmRemarks);
            remarksList.push(bmRemarks);

            ldClientCaseDetails.setClientId(clientId);
            ldClientCaseDetails.setGroupId(groupId);
            ldClientCaseDetails.setCallTrackingDetailIds(callTrakingList);
            ldClientCaseDetails.setRemarksIds(remarksList);
            ldClientCaseDetails.setRoleId(roleId);

            var jsonArray = JSON.stringify(ldClientCaseDetails);

            customlog.info("jsonArray" + jsonArray);

            var rest = require("./rest.js");

            var http = require('http');
            var https = require('https');

            var postheaders = {
                'Content-Type' : 'application/json',
                'Content-Length' : Buffer.byteLength(jsonArray, 'utf8'),
                'Cookie' : req.session.mifosCookie
            };

            var options = {
                host: mifosServiceIP,
                port: mifosPort,
                path: "/mfi/api/dataentry/ldcalltrack/updatecase.json",
                method: 'POST',
                headers : postheaders
            };
            rest.postJSON(options,jsonArray,function(statuscode,result,headers){
                customlog.info("statuscode" + statuscode);
                customlog.info("result" + result.status);
                customlog.info("headers" + headers);
                if(statuscode == 302){
                    req.body.status = "Session Expired";
                    res.send(req.body);
                }
                else {
                    if(result.status == "success"){
                        req.body.status = "success";
                        res.send(req.body.status);
                        //res.end();
                        //self.loanrecoveryloanaccounts(req,res);
                    }
                    else if(result.status == "failure"){
                        req.body.status = "failure";
                        res.send(req.body.status);
                        //res.end();
                    }else{
                        req.body.status = "failure";
                        res.send(req.body.status);
                        //res.end();
                    }
                }
            });
        }
        catch(e){
            req.body.status = "failure";
            res.send(req.body.status);
            //res.end();
        }
    },

    updateRMLDClientCaseTrack : function(req,res){
        var self = this;
        var constantsObj = this.constants;
        var tenantId = req.session.tenantId;
        var userId = req.session.userId;
        var roleId = req.session.roleId;
        var officeId = req.session.officeId;


        var groupId = req.body.groupId;
        var clientId = req.body.clientId;
        var clientMismatchCallTrackingDetailId = req.body.clientMismatchCallTrackingDetailId;
        var amountMismatchCallTrackingDetailId = req.body.amountMismatchCallTrackingDetailId;
        var rmRemarks = req.body.rmRemarks;

        var callTrakingList = new Array();
        var remarksList = new Array();


        try{
            var ldClientCaseDetails = require(dtoPathDE+"/ldClientCaseDetail");
            var ldClientCaseDetails = new ldClientCaseDetails();

            callTrakingList.push(clientMismatchCallTrackingDetailId);
            callTrakingList.push(amountMismatchCallTrackingDetailId);

            remarksList.push(rmRemarks);
            remarksList.push(rmRemarks);

            ldClientCaseDetails.setClientId(clientId);
            ldClientCaseDetails.setGroupId(groupId);
            ldClientCaseDetails.setCallTrackingDetailIds(callTrakingList);
            ldClientCaseDetails.setRemarksIds(remarksList);
            ldClientCaseDetails.setRoleId(roleId);

            var jsonArray = JSON.stringify(ldClientCaseDetails);

            customlog.info("jsonArray" + jsonArray);

            var rest = require("./rest.js");

            var http = require('http');
            var https = require('https');

            var postheaders = {
                'Content-Type' : 'application/json',
                'Content-Length' : Buffer.byteLength(jsonArray, 'utf8'),
                'Cookie' : req.session.mifosCookie
            };

            var options = {
                host: mifosServiceIP,
                port: mifosPort,
                path: "/mfi/api/dataentry/ldcalltrack/updatecase.json",
                method: 'POST',
                headers : postheaders
            };
            rest.postJSON(options,jsonArray,function(statuscode,result,headers){
                customlog.info("statuscode" + statuscode);
                customlog.info("result" + result.status);
                customlog.info("headers" + headers);
                if(statuscode == 302){
                    req.body.status = "Session Expired";
                    res.send(req.body);
                }
                else {
                    if(result.status == "success"){
                        req.body.status = "success";
                        res.send(req.body.status);
                        //res.end();
                        //self.loanrecoveryloanaccounts(req,res);
                    }
                    else if(result.status == "failure"){
                        req.body.status = "failure";
                        res.send(req.body.status);
                        //res.end();
                    }else{
                        req.body.status = "failure";
                        res.send(req.body.status);
                        //res.end();
                    }
                }
            });
        }
        catch(e){
            req.body.status = "failure";
            res.send(req.body.status);
            //res.end();
        }
    },


    callToLDCallTrackCallInitialAck:function(req, res) {
        var self = this;
        try{
            var groupId = req.body.groupId;
            var clientId = req.body.clientId;
            var clientName = req.body.clientName;
            var numberToCall = req.body.numberToCall;
            var callCenterExeId = req.body.callCenterExeId;
            var callStatus    =    req.body.callStatus;
            var callTrackingId  =   req.body.callTrackingId;
            var fileLocation = req.body.fileLocation;
            var versionNo = req.body.versionNo;
            self.model.callToLDCallTrackCallInitialAckModel(groupId,clientId,clientName,numberToCall,callCenterExeId,callStatus,fileLocation,callTrackingId,versionNo,function (status) {
                var http = require('http');
                var HTTPStatus = require('http-status');
                if (status == 'failure') {
                    customlog.error("sending Failure response for inserting new client docs");
                    res.send(HTTPStatus[201]);
                    //res.end();
                }
                else {
                    customlog.info("sending success response for inserting new client docs");
                    res.send(HTTPStatus[200]);
                    //res.end();
                }
            });
        }
        catch(e){
            customlog.error("Error In callToLDCallTrackCallInitialAck : ",e);
        }
    },

    uploadLDCallTrackAudioFile: function(req, res) {
        var self = this;
        try{
            var callCenterExeId = req.body.callCenterExeId;
            var clientId = req.body.clientId;
            var clientName = req.body.clientName;
            var groupId = req.body.groupId;
            var numberToCall = req.body.numberToCall;
            var callTrackingId = req.body.callTrackingId;
            var callStatus = req.body.callStatus;
            var versionNo = req.body.versionNo;
            console.log("uploadLDCallTrackAudioFile callCenterExeId : "+callCenterExeId+" clientId "+clientId+" clientName : "+clientName+" groupId "+groupId);
            console.log("numberToCall  : "+numberToCall+" callTrackingId "+callTrackingId);
            var currentDate = new Date();
            var fs = require('fs');
            var util = require('util');
            var mkdirp = require('mkdirp');
            var documentWritePath = "";
            var fileType = req.files.singleUploadDocument.name.split('.');
            console.log("fileType  : "+fileType);
            var folderPath = rootPath+"/audio/ldCallTracking/"+callCenterExeId+"/"+groupId;
            console.log("folderPath  : "+folderPath);
            var fileName = clientId+"_"+clientName+"_LDCALL_"+numberToCall+"_"+(currentDate.getFullYear()+"_"+(currentDate.getMonth()+1)+"_"+currentDate.getDate()+"_"+currentDate.getTime())+"."+fileType[1];
            console.log("fileName  : "+fileName);
            documentWritePath = "audio/ldCallTracking/"+callCenterExeId+"/"+groupId+"/"+fileName;
            if(req.files.singleUploadDocument.name!=""){
                mkdirp(folderPath, 0777, function (err) {
                    console.log("after mkdirp  : ");
                    var  os = fs.createWriteStream(documentWritePath);
                    var util = require('util');
                    var is = fs.createReadStream(req.files.singleUploadDocument.path) ;
                    is.pipe(os);
                    is.on('end', function() {
                        console.info('Successfully uploaded file going to insert db values......');
                        self.model.callToLDCallTrackCallInitialAckModel(groupId,clientId,clientName,numberToCall,callCenterExeId,callStatus,documentWritePath,callTrackingId,versionNo,function (status) {
                            var http = require('http');
                            var HTTPStatus = require('http-status');
                            if (status == 'failure') {
                                customlog.error("sending Failure response for inserting new client docs");
                                res.send(HTTPStatus[201]);
                                //res.end();
                            }
                            else {
                                customlog.info("sending success response for inserting new client docs");
                                res.send(HTTPStatus[200]);
                                //res.end();
                            }
                        });

                    });
                    fs.unlink(req.files.singleUploadDocument.path, function(err){
                        if(err){ console.log('Error while unlinking '+err); }
                        else { console.log('Successfully unlinked');};
                    }) ;
                    is.on('error', function(err) { console.log("error"); });
                });
            }

        }catch(e){
            console.log("Exception while upload audio "+e);
            res.end();
        }
    },

    // Added Paramasivan for request to change kyc change

    updateKYCContactDetails: function(req,res){
        var self = this;
        var constantsObj = this.constants;
        try{
            var clientId = req.body.clientId;
            var oldMobileNumber = req.body.oldMobileNumber;
            var oldLandLineNumber = req.body.oldLandLineNumber;
            var newMobileNumber = req.body.newMobileNumber;
            var newLandLineNumber = req.body.newLandLineNumber;
            var remarks = req.body.remarks;
            var roleId = (typeof req.session.roleId == 'undefined')?req.body.roleId:req.session.roleId;
            var userId = req.session.userId;
            var tenantId = req.session.tenantId;
            var operationId = req.body.operationId;

            if(typeof tenantId == 'undefined' || typeof userId == 'undefined' || operationId == 'undefined') {
                res.redirect(props.contextPath+'/client/ci/login');
            }else{
                if(roleId == constantsObj.getFOroleId()){
                    var fs1=require('fs');
                    var clientName = req.body.clientName;
                    var docTypeId = req.body.docTypeId;
                    var groupId = req.body.groupId;
                    var groupName = req.body.groupName;
                    var loanCounter = req.body.loanCounter;
                    var docName = groupId+"_"+groupName+"_"+clientName+"_"+docTypeId+"_"+getCurrentTimeStamp();
                    var capturedImage = "documents/client_documents/"+loanCounter+"/"+groupName+"/"+docName+".jpg";
                    var folderPath = rootPath+"/documents/client_documents/"+loanCounter+"/"+groupName;
                    var documentWritePath = rootPath+"/documents/client_documents/"+loanCounter+"/"+groupName+"/"+docName+".jpg";
                    mkdirp(folderPath, 0777, function (err) {
                        var os = fs1.createWriteStream(documentWritePath);
                        var util = require('util');
                        var is = fs1.createReadStream(req.files.uploadDocument.path) ;
                        is.pipe(os);
                        is.on('end', function() {
                            customlog.info('Successfully uploaded file going to insert db values......');
                            self.updateKYCChangeClientDocAndroid(capturedImage, clientId, docTypeId, docName,loanCounter,function (status,iklantClientId) {
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
                                    self.updateKYCRequest(userId,iklantClientId, oldMobileNumber, oldLandLineNumber, newMobileNumber, newLandLineNumber, remarks, roleId, operationId, function(status){
                                        customlog.info(HTTPStatus[200]);
                                        customlog.info("sending success response for inserting existing client docs");
                                        res.send(HTTPStatus[200]);
                                    });
                                }
                            });
                        });
                        is.on('error', function(err) { customlog.error("error"); });
                    });
                }
                else{
                    self.updateKYCRequest(userId,clientId, oldMobileNumber, oldLandLineNumber, newMobileNumber, newLandLineNumber, remarks, roleId, operationId, function(status){
                    var activityDetails = new Array(iklantPort, req.session.tenantId, req.session.userId, req.session.userName, req.originalUrl, req.connection.remoteAddress, "DataEntryRouter.js", "updateKYCContactDetails", "success", "KYC_ReUpdate", "KYC_ReUpdate Mobile and LandLine for clientId "+clientId,"insert");
                    self.commonRouter.insertActivityLogModel(activityDetails);
                        req.body.status = status;
                        res.send(req.body);
                    });
                }
            }
        }catch(e){
            customlog.error("Exception while loading updateKYCContactDetails "+e);
            self.commonRouter.showErrorPage(req,res);
        }
    },

    updateKYCRequest : function(userId,clientId, oldMobileNumber, oldLandLineNumber, newMobileNumber, newLandLineNumber, remarks, roleId, operationId, callback){
        this.model.updateKYCRequestModel(userId,clientId, oldMobileNumber, oldLandLineNumber, newMobileNumber, newLandLineNumber, remarks, roleId, operationId, callback);
    },

    updateKYCChangeClientDocAndroid: function (captured_image, clientID, doc_type_id, doc_name,loanCount, callback) {
        this.model.updateKYCChangeClientDocAndroidModel(captured_image, clientID, doc_type_id, doc_name,loanCount, callback);
    },
    // Added Paramasivan for request to change kyc change
    retrieveKYCReUpdateClients: function(req,res){
        var self = this;
        try{
            var groupId = req.body.groupId;
            var memberId  = (typeof req.body.memberId == 'undefined')?0:req.body.memberId;
            var officeId = (typeof req.body.officeId == 'undefined')?-1:req.body.officeId;
            var roleId = req.session.roleId;
            var constantsObj = self.constants;
            self.retrieveKYCReUpdateCall(groupId, roleId, function(status, groupName, centerName, clientIds, clientNames){
                if(status == 'success'){
                    if(clientIds.length > 0){
                        self.commonRouter.retrieveDocTypeList(req.session.tenantId, function (docTypeIdArray, docTypeNameArray) {
                            if(memberId != 0) {
                                self.retrieveKYCClientDetailsCall(groupId, memberId, function (status,base64ImageArray, allDocTypeIdArray,allDocTypeNameArray,result) {
                                    var errorMessage = "";
                                    if(status == "No Documents found for this member"){
                                        errorMessage = status;
                                    }
                                    res.render('data_entry/kycReUpdating', {clientIds: clientIds,clientNames: clientNames,centerName: centerName,groupName: groupName,
                                        clientId: memberId,currentRoleId: roleId,constantsObj: constantsObj,availDocTypeIdArray: allDocTypeIdArray,
                                        availDocTypeNameArray: allDocTypeNameArray,base64ImageArray: base64ImageArray,status: status,docTypeIdArray: docTypeIdArray,
                                        groupId: groupId,result:result,officeId:officeId,errorMessage:errorMessage
                                    });
                                });
                            }
                            else{
                                res.render('data_entry/kycReUpdating', {clientIds: clientIds,clientNames: clientNames,centerName: centerName,groupName: groupName,
                                    clientId: memberId,currentRoleId: roleId,constantsObj: constantsObj,availDocTypeIdArray: '',availDocTypeNameArray: '', errorMessage:"",
                                    base64ImageArray: '',status: '',docTypeIdArray: docTypeIdArray,groupId: groupId,prospectClientObj:'',result:'',officeId:officeId
                                });
                            }
                        });
                    }
                    else{
                        req.params.operationId = constantsObj.getKYCReUpdateOperationId();
                        req.params.officeId = officeId;
                        self.commonRouter.listGroups(req, res);
                    }
                }
                else{
                    customlog.error("Exception while calling retrieveKYCReUpdateClients ");
                    self.commonRouter.showErrorPage(req,res);
                }
            });
        }catch(e){
            customlog.error("Exception while loading retrieveKYCReUpdateClients "+e);
            self.commonRouter.showErrorPage(req,res);
        }
    },

    retrieveKYCReUpdateCall : function(groupId, roleId, callback){
        this.model.retrieveKYCReUpdateModel(groupId, roleId, callback);
    },

    retrieveKYCClientDetailsCall : function(groupId, clientId, callback){
        this.model.retrieveKYCClientDetailsModel(groupId, clientId, callback);
    },

    updateKYCDetails : function(req,res){
        var self = this;
        try{
            var clientId = req.body.memberId;
            var officeId = req.body.officeId;
            var mobileNumberMatched = (typeof req.body.mobileNumberMatched == 'undefined')?'NULL':(req.body.mobileNumberMatched == 'Yes')? 1:0;
            var landLineNumberMatched = (typeof req.body.landLineNumberMatched == 'undefined')?'NULL':(req.body.landLineNumberMatched == 'Yes')? 1:0;
            var addressMatched = (typeof req.body.addressMatched == 'undefined')?'NULL':(req.body.addressMatched == 'Yes')? 1:0;
            var newAddress = req.body.newAddress;
            var pinCode = req.body.pincode;
            var remarks = req.body.remarks;
            var roleId = req.session.roleId;
            var userId = req.session.userId;
            var updateKYCVerificationStatus = req.body.updateKYCVerificationStatus;
            self.saveKYCUpdateDetailsCall(userId,clientId, mobileNumberMatched, landLineNumberMatched, addressMatched, newAddress, pinCode, remarks, updateKYCVerificationStatus, roleId, function(status){
                if(status == 'success'){
                    req.body.memberId = 0;
                    var activityDetails = new Array(iklantPort, req.session.tenantId, req.session.userId, req.session.userName, req.originalUrl, req.connection.remoteAddress, "DataEntryRouter.js", "updateKYCContactDetails", "success", "KYC_ReUpdate", "KYC_ReUpdate Mobile and LandLine for clientId "+clientId+" with verification status "+updateKYCVerificationStatus,"insert");
                    self.commonRouter.insertActivityLogModel(activityDetails);
                    self.retrieveKYCReUpdateClients(req,res);
                }
                else{
                    customlog.error("Exception while update updateKYCDetails ");
                    self.commonRouter.showErrorPage(req,res);
                }
            });
        }catch(e){
            customlog.error("Exception while loading updateKYCDetails "+e);
            self.commonRouter.showErrorPage(req,res);
        }
    },

    saveKYCUpdateDetailsCall : function(userId,clientId, mobileNumberMatched, landLineNumberMatched, addressMatched, newAddress, pinCode, remarks, updateKYCVerificationStatus, roleId, callback){
        this.model.saveKYCUpdateDetailsModel(userId,clientId, mobileNumberMatched, landLineNumberMatched, addressMatched, newAddress, pinCode, remarks, updateKYCVerificationStatus, roleId, callback);
    },

    retrieveClientCurrentStatus : function(req,res) {

        var self = this;
        var groupId = req.body.groupId;
        self.model.retrieveClientCurrentStatusModel(groupId,function(clientStatusObject){
            req.body.status= "success";
            req.body.clientStatusObject = clientStatusObject;
            res.send(req.body);
        });
    },
    cronJobBOGroupStatus : function(req, res) {
        var self = this;
        console.log("Router : cronJobBOGroupStatus");
        try {
            self.model.cronJobBOGroupStatusModel(function (callbackObject){
                console.log("Router : cronJobBOGroupStatus callback success : "+callbackObject);
            });
        }catch(e){
            customlog.error("Exception cronJobBOGroupStatus "+e);
        }
    }
}