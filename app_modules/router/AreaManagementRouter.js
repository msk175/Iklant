module.exports = areaManagement;

var path = require('path');
var rootPath = path.dirname(process.mainModule.filename);
var props = require(path.join(rootPath,"properties.json"));
mifosServiceIP = props.mifosServiceIp;
mifosPort = props.mifosPort;
GPSPort = props.GPSPort;
iklantPort = props.iklantPort;
var AreaManagementModel = require(path.join(rootPath,"app_modules/model/AreaManagementModel"));
var customlog = require(path.join(rootPath,"logger/loggerConfig.js"))('AreaManagementRouter.js');

function areaManagement(constants) {
    customlog.debug("Inside Router");
    this.model = new AreaManagementModel(constants);
    this.constants = constants;
}

areaManagement.prototype = {
    areaManagement: function (req, res) {
        try{
            var self = this;
            if (typeof req.session.tenantId == 'undefined' || typeof req.session.userId == 'undefined') {
                res.redirect(props.contextPath+'/client/ci/login');
            } else {
                var roleId = req.session.roleId;
                var constantsObj = this.constants;
                var statusMessage = (typeof req.body.statusMessage == 'undefined')?"":req.body.statusMessage;
                var officeId = (roleId == constantsObj.getSMHroleId())?(typeof req.body.listoffice =='undefined')?req.session.officeId:req.body.listoffice:req.session.officeId;
                var isVerified = (roleId == constantsObj.getSMHroleId()) ? 0 : 1;
                var selectedOperationId = req.body.operationId;
                if(typeof selectedOperationId == 'undefined'){selectedOperationId = constantsObj.getListAreaOperationId()};
                if(selectedOperationId == constantsObj.getListAreaOperationId()){
                    self.commonRouter.retriveOfficeCall(req.session.tenantId, req.session.userId,function(officeIdArray, officeNameArray){
                        self.retrieveAreaDetails(officeId, roleId, isVerified, selectedOperationId, function (status, areaCodeId, areaCode, areaName, isVerified, officeIds, statusArray, operationId, operationName, foIds, foNames, releaseRequests) {
                            if (status == 'success') {
                                res.render('area_management/areaManagement', {areaCodeId: areaCodeId, areaCode: areaCode, isVerified: isVerified, error_msg: '', userName: req.session.userName, areaName: areaName,
                                    operationId: operationId, operationName: operationName, selectedOperationId: selectedOperationId, roleId: roleId, constantsObj: constantsObj, foIds: foIds, foNames: foNames,
                                    officeIds: officeIds, statusArray: statusArray, officeIdArray: officeIdArray, officeNameArray: officeNameArray, officeId: officeId, statusMessage: statusMessage,
                                    releaseRequests: releaseRequests, contextPath:props.contextPath})
                            }
                            else {
                                self.commonRouter.showErrorPage(req,res);
                            }
                        });
                    });
                }
                else if(selectedOperationId == constantsObj.getAreaCreationOperationId()){
                    self.retrieveAreaQuestionDetails(officeId, function (status, questionId, questions, description, subQuestions,  subQuestionsId, inputType, areaCode, operationId, operationName) {
                        if (status == 'success') {
                            res.render('area_management/areaCreation', {questionId: questionId, questions: questions, description: description, subQuestions: subQuestions, inputType: inputType,
                                error_msg: '', userName: req.session.userName,operationId: operationId, operationName: operationName, selectedOperationId: selectedOperationId,
                                subQuestionsId: subQuestionsId, areaCode: areaCode, contextPath:props.contextPath})
                        }
                        else {
                            self.commonRouter.showErrorPage(req,res);
                        }
                    });
                }
                else if(selectedOperationId == constantsObj.getAssignAreaOperationId()){
                    self.commonRouter.retriveFieldOfficersCall(officeId, function(foIdArray, foNameArray){
                        self.commonRouter.retriveOfficeCall(req.session.tenantId, req.session.userId,function(officeIdArray, officeNameArray){
                            self.retrieveAreaDetails(officeId, roleId, isVerified, selectedOperationId, function (status, areaCodeId, areaCode, areaName, isVerified, officeIds, statusArray, operationId, operationName, foIds, foNames) {
                                if (status == 'success') {
                                    res.render('area_management/assignAreaFO', {areaCodeId: areaCodeId, areaCode: areaCode, isVerified: isVerified, error_msg: '', userName: req.session.userName, areaName: areaName,
                                        operationId: operationId, operationName: operationName, selectedOperationId: selectedOperationId, roleId: roleId, constantsObj: constantsObj, foIds: foIds, foNames: foNames,
                                        officeIds: officeIds, statusArray: statusArray, officeIdArray: officeIdArray, officeNameArray: officeNameArray, officeId: officeId, statusMessage: statusMessage,
                                        foIdArray: foIdArray, foNameArray: foNameArray, contextPath:props.contextPath})
                                }
                                else {
                                    self.commonRouter.showErrorPage(req,res);
                                }
                            });
                        });
                    })
                }
                else{
                    self.commonRouter.showErrorPage(req,res);
                }
            }
        }catch(e){
            customlog.error("Exception while areaManagement "+e);
            self.commonRouter.showErrorPage(req,res);
        }
    },

    retrieveAreaDetails: function (officeId, roleId, isVerified, selectedOperationId, callback) {
        this.model.retrieveAreaDetailsModel(officeId, roleId, isVerified, selectedOperationId, callback);
    },

    retrieveAreaQuestionDetails: function (officeId, callback) {
        this.model.retrieveAreaQuestionDetailsModel(officeId, callback);
    },

    saveArea: function (req, res) {
        try{
            var self = this;
            if (typeof req.session.tenantId == 'undefined' || typeof req.session.userId == 'undefined') {
                res.redirect(props.contextPath+'/client/ci/login');
            } else {
                var constantsObj = this.constants;
                var officeId = req.session.officeId;

                var questionsId = req.body.questionIdArray.split(',');
                var subQuestionsId = req.body.subQuestionArray.split(',');
                var areaName = req.body.area_name;
                var povertyLevel = new Array(req.body.poverty_level_Below_Poverty_Level,req.body.poverty_level_Above_Poverty_Level,req.body.poverty_level_Middle_Class_Level,req.body.poverty_level_Above_Middle_Class_Level);
                var population = new Array(req.body.population_Male,req.body.population_Female);
                var otherMFI = req.body.other_mfi_count;
                var religion = new Array(req.body.religion_Hindu,req.body.religion_Muslim,req.body.religion_Christian,req.body.religion_Others);
                var localMoneyLenders = req.body.local_money_lenders;
                var politicalInfluence = (typeof req.body.political_influence_Yes_text == 'undefined')?"":req.body.political_influence_Yes_text;
                var potentialCustomer = req.body.potential_customer_list;
                var businessProjection = req.body.business_projection;
                var distance = req.body.distance;
                var school = (typeof req.body.educational_institution_School_text == 'undefined')?"":req.body.educational_institution_School_text;
                var college = (typeof req.body.educational_institution_College_text == 'undefined')?"":req.body.educational_institution_College_text;
                var educationalInstitutions = new Array(school, college);
                var landmark = req.body.landmark;
                var primaryOccupation = req.body.primary_occupation;
                var daily = (typeof req.body.frequency_of_income_Daily_text == 'undefined')?"":req.body.frequency_of_income_Daily_text;
                var weekly = (typeof req.body.frequency_of_income_Weekly_text == 'undefined')?"":req.body.frequency_of_income_Weekly_text;
                var forthNightly = (typeof req.body.frequency_of_income_Fortnightly_text == 'undefined')?"":req.body.frequency_of_income_Fortnightly_text;
                var monthly = (typeof req.body.frequency_of_income_Monthly_text == 'undefined')?"":req.body.frequency_of_income_Monthly_text;
                var frequencyOfIncome = new Array(daily, weekly, forthNightly, monthly);
                var remarks = req.body.remarks;
                var remarks_SMH = (typeof req.body.remarks_for_SMH == 'undefined')?"":req.body.remarks_for_SMH;

                var areaManagement = new Array(areaName, population, povertyLevel, otherMFI, religion, localMoneyLenders, politicalInfluence, potentialCustomer, businessProjection,
                    distance, educationalInstitutions, landmark, primaryOccupation, frequencyOfIncome, remarks, remarks_SMH);
                self.saveAreaDetails(officeId, areaManagement, questionsId, subQuestionsId, function (status) {
                    if (status == 'success') {
                        var activityDetails = new Array(iklantPort, req.session.tenantId, req.session.userId, req.session.userName, req.originalUrl, req.connection.remoteAddress, "AreaManagementRouter.js", "saveArea", "success", "Create Area", areaName+" created successfully","insert");
                        self.commonRouter.insertActivityLogModel(activityDetails);
                        req.body.operationId = constantsObj.getListAreaOperationId();
                        req.body.statusMessage = "Area created successfully & moved to Regional Manager approval";
                        self.areaManagement(req,res);
                    }
                    else {
                        self.commonRouter.showErrorPage(req,res);
                    }
                });
            }
        }catch(e){
            customlog.error("Exception while saveArea "+e);
            self.commonRouter.showErrorPage(req,res);
        }
    },

    saveAreaDetails: function(officeId, areaManagement, questionsId, subQuestionsId, callback){
        this.model.saveAreaDetailsModel(officeId, areaManagement, questionsId, subQuestionsId, callback);
    },

    updateArea: function (req, res) {
        try{
            var self = this;
            var constantsObj = this.constants;
            if (typeof req.session.tenantId == 'undefined' || typeof req.session.userId == 'undefined') {
                res.redirect(props.contextPath+'/client/ci/login');
            } else {
                var officeId = req.session.officeId;

                self.retrieveAreaQuestionDetails(officeId, function (status, questionId, questions, description, subQuestions,  subQuestionsId) {
                    var questionsId = questionId;
                    var subQuestionsId = subQuestionsId;

                    var areaCode = req.body.modifyAreaCode;
                    var areaName = req.body.area_name_edit;
                    var povertyLevel = new Array(req.body.poverty_level_BPL_edit,req.body.poverty_level_APL_edit,req.body.poverty_level_MCL_edit,req.body.poverty_level_AMCL_edit);
                    var population = new Array(req.body.population_Male_edit,req.body.population_Female_edit);
                    var otherMFI = req.body.other_mfi_count_edit;
                    var religion = new Array(req.body.religion_Hindu_edit,req.body.religion_Muslim_edit,req.body.religion_Christian_edit,req.body.religion_Others_edit);
                    var localMoneyLenders = req.body.local_money_lenders_edit;
                    var politicalInfluence = (typeof req.body.political_influence_Yes_text == 'undefined')?"":req.body.political_influence_Yes_text;
                    var potentialCustomer = req.body.potential_customer_list_edit;
                    var businessProjection = req.body.business_projection_edit;
                    var distance = req.body.distance_edit;
                    var school = (typeof req.body.educational_institution_School_text == 'undefined')?"":req.body.educational_institution_School_text;
                    var college = (typeof req.body.educational_institution_College_text == 'undefined')?"":req.body.educational_institution_College_text;
                    var educationalInstitutions = new Array(school, college);
                    var landmark = req.body.landmark_edit;
                    var primaryOccupation = req.body.primary_occupation_edit;
                    var daily = (typeof req.body.frequency_of_income_Daily_text == 'undefined')?"":req.body.frequency_of_income_Daily_text;
                    var weekly = (typeof req.body.frequency_of_income_Weekly_text == 'undefined')?"":req.body.frequency_of_income_Weekly_text;
                    var forthNightly = (typeof req.body.frequency_of_income_Fortnightly_text == 'undefined')?"":req.body.frequency_of_income_Fortnightly_text;
                    var monthly = (typeof req.body.frequency_of_income_Monthly_text == 'undefined')?"":req.body.frequency_of_income_Monthly_text;
                    var frequencyOfIncome = new Array(daily, weekly, forthNightly, monthly);
                    var remarks = req.body.remarks_edit;
                    var remarksSMH = req.body.remarks_for_SMH_edit;

                    var areaManagement = new Array(areaName, population, povertyLevel, otherMFI, religion, localMoneyLenders, politicalInfluence, potentialCustomer, businessProjection,
                        distance, educationalInstitutions, landmark, primaryOccupation, frequencyOfIncome, remarks, remarksSMH);
                    self.updateAreaDetails(officeId, areaManagement, questionsId, subQuestionsId, areaCode,function (statusMsg) {
                        if (statusMsg == 'success') {
                            var activityDetails = new Array(iklantPort, req.session.tenantId, req.session.userId, req.session.userName, req.originalUrl, req.connection.remoteAddress, "AreaManagementRouter.js", "updateArea", "success", "Update Area", areaName+" updated successfully","insert");
                            self.commonRouter.insertActivityLogModel(activityDetails);
                            req.body.operationId = constantsObj.getListAreaOperationId();
                            req.body.statusMessage = (req.body.areaStatus != 1)?"Area details updated successfully & moved to Regional Manager approval":"Area details updated successfully";
                            self.areaManagement(req,res);
                        }
                        else {
                            self.commonRouter.showErrorPage(req,res);
                        }
                    });
                });
            }
        }catch(e){
            customlog.error("Exception while updateArea "+e);
            self.commonRouter.showErrorPage(req,res);
        }
    },

    updateAreaDetails: function(officeId, areaManagement, questionsId, subQuestionsId, areaCode,callback){
        this.model.updateAreaDetailsModel(officeId, areaManagement, questionsId, subQuestionsId, areaCode,callback);
    },

    populateAreaDetails: function(req,res){
        try{
            var self = this;
            if (typeof req.session.tenantId == 'undefined' || typeof req.session.userId == 'undefined') {
                res.redirect(props.contextPath+'/client/ci/login');
            } else {
                var areaCodeId = req.body.areaCodeId;
                var officeId = (typeof req.body.listoffice == 'undefined')?req.session.officeId:req.body.listoffice;
                self.retrieveAreaCodeDetails(areaCodeId, officeId, function(areaDetails,existingAreaCodes,status){
                    req.body.areaDetails = areaDetails;
                    req.body.existingAreaCodes = existingAreaCodes;
                    req.body.status = status;
                    res.send(req.body);
                })
            }
        }catch(e){
            customlog.error("Exception while populateAreaDetails "+e);
            self.commonRouter.showErrorPage(req,res);
        }
    },

    retrieveAreaCodeDetails: function(areaCodeId, officeId, callback){
        this.model.retrieveAreaCodeDetailsModel(areaCodeId, officeId, callback);
    },

    approveOrRejectArea: function(req,res){
        try{
            var self = this;
            var remarks = req.body.remarks_for_SMH;
            var questionId = req.body.question_id;
            if (typeof req.session.tenantId == 'undefined' || typeof req.session.userId == 'undefined') {
                res.redirect(props.contextPath+'/client/ci/login');
            } else {
                var areaCodeId = req.body.areaCodeId;
                var officeId = req.body.officeId;
                var approveFlag = req.body.flag;
                self.approveOrRejectAreaCall(areaCodeId, officeId, approveFlag, remarks, questionId, function(status){
                    var msg = (approveFlag == 1)?"Area approved successfully":"Area rejected successfully";
                    var activityDetails = new Array(iklantPort, req.session.tenantId, req.session.userId, req.session.userName, req.originalUrl, req.connection.remoteAddress, "AreaManagementRouter.js", "approveOrRejectArea", "success", "Approve Or Rejected Area", msg,"insert");
                    self.commonRouter.insertActivityLogModel(activityDetails);
                    res.send(status);
                })
            }
        }catch(e){
            customlog.error("Exception while approveOrRejectArea "+e);
            self.commonRouter.showErrorPage(req,res);
        }
    },

    approveOrRejectAreaCall: function(areaCodeId, officeId, approveFlag, remarks, questionId, callback){
        this.model.approveOrRejectAreaModel(areaCodeId, officeId, approveFlag, remarks, questionId, callback);
    },

    assignOrReleaseArea: function(req,res){
        try{
            var self = this;
            var constantsObj = this.constants;
            if (typeof req.session.tenantId == 'undefined' || typeof req.session.userId == 'undefined') {
                res.redirect(props.contextPath+'/client/ci/login');
            } else {
                var areaCodes = (typeof req.body.areaCodesId != 'undefined' && req.body.areaCodesId != '')?req.body.areaCodesId.split(','):req.params.areaCodeId;
                var releaseFlag = (typeof req.params.releaseFlag == 'undefined')?0:req.params.releaseFlag;
                var fieldOfficerId = req.body.selectFO;
                var existingFieldOfficerId = req.body.existingFieldOfficerId;
                var roleId = req.session.roleId;
                self.assignOrReleaseAreaCall(areaCodes, fieldOfficerId, releaseFlag, roleId, existingFieldOfficerId, function(status){
                    if(status == 'success'){
                        var msg = (roleId == constantsObj.getSMHroleId())?"Area released successfully":(releaseFlag == 1)?areaCodes+" Area released successfully & moved for Regional Manager approval":(roleId == constantsObj.getSMHroleId())?"Area released successfully":(releaseFlag == 1)?"Area released successfully & moved for Regional Manager approval":"Area assigned successfully";areaCodes+" Area assigned successfully";
                        var activityDetails = new Array(iklantPort, req.session.tenantId, req.session.userId, req.session.userName, req.originalUrl, req.connection.remoteAddress, "AreaManagementRouter.js", "assignOrReleaseArea", "success", "Assign Or Release Area", msg,"insert");
                        self.commonRouter.insertActivityLogModel(activityDetails);
                        req.body.operationId = (releaseFlag == 1)?constantsObj.getListAreaOperationId():constantsObj.getAssignAreaOperationId();
                        req.body.statusMessage = (roleId == constantsObj.getSMHroleId())?"Area released successfully":(releaseFlag == 1)?"Area released successfully & moved for Regional Manager approval":"Area assigned successfully";
                        self.areaManagement(req,res);
                    }
                    else{
                        self.commonRouter.showErrorPage(req,res);
                    }
                })
            }
        }catch(e){
            customlog.error("Exception while assignOrReleaseArea "+e);
            self.commonRouter.showErrorPage(req,res);
        }
    },

    assignOrReleaseAreaCall: function(areaCodes, fieldOfficerId, releaseFlag, roleId, existingFieldOfficerId, callback){
        this.model.assignOrReleaseAreaModel(areaCodes, fieldOfficerId, releaseFlag, roleId, existingFieldOfficerId, callback);
    }
}