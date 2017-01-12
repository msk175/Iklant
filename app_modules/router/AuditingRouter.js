module.exports = auditing;

var path = require('path');
var rootPath = path.dirname(process.mainModule.filename);
var props = require(path.join(rootPath,"properties.json"));
mifosServiceIP = props.mifosServiceIp;
mifosPort = props.mifosPort;
GPSPort = props.GPSPort;
iklantPort = props.iklantPort;
var AuditingModel = require(path.join(rootPath,"app_modules/model/AuditingModel"));
var customlog = require(path.join(rootPath,"logger/loggerConfig.js"))('AuditingRouter.js');
function auditing(constants) {
    customlog.debug("Inside Router");
    this.model = new AuditingModel(constants);
    this.constants = constants;
}
auditing.prototype = {

    //Added by Sathish Kumar M 008 for Audit Module
    auditManagement: function (req, res) {
        try{
            var self = this;
            if (typeof req.session.tenantId == 'undefined' || typeof req.session.userId == 'undefined') {
                res.redirect(props.contextPath+'/client/ci/login');
            } else {
                var roleId = req.session.roleId;
                var constantsObj = this.constants;
                var auditValue = req.body.auditType;
                var categoryValue = req.body.categoryType;
                var selectedOperationId = req.body.operationId;
                if(typeof selectedOperationId == 'undefined'){selectedOperationId = constantsObj.getManageQuestionsOperationId()};
                var statusMessage = (typeof req.body.statusMessage == 'undefined')?"":req.body.statusMessage;
                if(selectedOperationId == constantsObj.getManageQuestionsOperationId()){
                    self.model.retriveAuditCall(function(auditIdArray, auditNameArray){
                        self.model.retrieveOperationDetailsForAudit(roleId,function(operationId, operationName,categoryAllId, categoryAllName,auditAllId,categoryId, categoryName,auditId){
                            res.render("auditing/manageAuditQuestions", {categoryValue:"",auditValue:"",statusMessage:statusMessage,selectedOperationId:selectedOperationId,operationNameArray:operationName, operationIdArray:operationId,categoryAllId:categoryAllId, categoryAllName:categoryAllName,auditAllId:auditAllId,auditIdArray:auditIdArray,auditNameArray:auditNameArray,categoryId:categoryId, categoryName:categoryName,auditId:auditId,contextPath:props.contextPath});
                        });
                    });
                }
                else if(selectedOperationId == constantsObj.getAssignAuditorOperationId()){
                    self.commonRouter.retriveOfficeCall(req.session.tenantId, req.session.userId,function(officeIdArray, officeNameArray){
                        self.model.retriveAuditCall(function(auditIdArray, auditNameArray) {
                            self.model.retrieveOperationDetailsForAudit(roleId, function (operationId, operationName,categoryAllId, categoryAllName,auditAllId,categoryId, categoryName,auditId) {
                                self.model.retriveAuditorCall(function(auditorId,auditorName,auditEmailIdArray) {
                                    res.render("auditing/assignAuditor", {auditorId:auditorId,auditorName:auditorName,auditEmailIdArray:auditEmailIdArray,statusMessage: statusMessage, selectedOperationId: selectedOperationId, auditIdArray: auditIdArray, auditNameArray: auditNameArray, operationNameArray: operationName, operationIdArray: operationId, officeIdArray: officeIdArray, officeNameArray: officeNameArray, categoryAllId: categoryAllId, categoryAllName: categoryAllName, auditAllId: auditAllId,categoryId:categoryId, categoryName:categoryName,auditId:auditId,contextPath: props.contextPath});
                                });
                            });
                        });
                    });
                }
                else{
                    self.commonRouter.showErrorPage(req,res);
                }
            }
        }catch(e){
            customlog.error("Exception while auditManagement "+e);
            self.commonRouter.showErrorPage(req,res);
        }
    },
    populateAuditQuestionsDetails: function(req,res){
        try{
            var self = this;
            if (typeof req.session.tenantId == 'undefined' || typeof req.session.userId == 'undefined') {
                res.redirect(props.contextPath+'/client/ci/login');
            } else {
                var auditTypeId = req.body.auditType;
                var categoryTypeId = req.body.categoryType;
                self.retrieveAuditQuestionsDetails(auditTypeId, categoryTypeId, function(auditDetails,status){
                    req.body.auditDetails = auditDetails;
                    req.body.status = status;
                    res.send(req.body);
                })
            }
        }catch(e){
            customlog.error("Exception while populateAuditQuestionsDetails "+e);
            self.commonRouter.showErrorPage(req,res);
        }
    },

    retrieveAuditQuestionsDetails: function(auditTypeId, categoryTypeId, callback){
        this.model.retrieveAuditQuestionsDetailsModel(auditTypeId, categoryTypeId, callback);
    },
    saveCategory: function (req, res) {
        try{
            var self = this;
            if (typeof req.session.tenantId == 'undefined' || typeof req.session.userId == 'undefined') {
                res.redirect(props.contextPath+'/client/ci/login');
            } else {
                var constantsObj = this.constants;
                var categoryName = req.body.categoryName;
                var auditType = req.body.auditType;
                self.saveCategoryDetails(categoryName,auditType,function (status) {
                    if (status == 'success') {
                        req.body.operationId = constantsObj.getManageQuestionsOperationId();
                        req.body.statusMessage = "Category has been created successfully";
                        req.body.auditType=auditType;
                        //req.body.categoryName=categoryName;
                        //self.populateAuditQuestionsDetails(req,res);
                        self.auditManagement(req,res);
                    }
                    else {
                        self.commonRouter.showErrorPage(req,res);
                    }
                });
            }
        }catch(e){
            customlog.error("Exception while saveCategory "+e);
            self.commonRouter.showErrorPage(req,res);
        }
    },

    saveCategoryDetails: function(categoryName,auditType, callback){
        this.model.saveCategoryDetailsModel(categoryName,auditType, callback);
    },
    saveAuditQuestions: function (req, res) {
        try{
            var self = this;
            if (typeof req.session.tenantId == 'undefined' || typeof req.session.userId == 'undefined') {
                res.redirect(props.contextPath+'/client/ci/login');
            } else {
                var constantsObj = this.constants;
                var tenantId =req.session.tenantId;
                var questionName = req.body.questionName;
                var questionShortName = req.body.questionShortName;
                var weightage = req.body.weightAge;
                var auditType = req.body.auditType;
                var categoryType= req.body.categoryType;
                var createdBy = req.session.userId;
                var weightageArray = new Array();
                var oldQuestionId = new Array();
                if(req.body.oldQuestionId){
                    weightageArray = req.body.oldQuestionWeightId.split(',');
                    oldQuestionId = req.body.oldQuestionId.split(',');
                }
                self.saveAuditDetails(tenantId, questionName, questionShortName, weightage,auditType,categoryType,createdBy,weightageArray,oldQuestionId, function (status) {
                    if (status == 'success') {
                        req.body.operationId = constantsObj.getManageQuestionsOperationId();
                        req.body.statusMessage = "Question has been created successfully";
                        self.auditManagement(req,res);
                    }
                    else {
                        self.commonRouter.showErrorPage(req,res);
                    }
                });
            }
        }catch(e){
            customlog.error("Exception while saveQuestions "+e);
            self.commonRouter.showErrorPage(req,res);
        }
    },

    saveAuditDetails: function(tenantId, questionName, questionShortName, weightage,auditType,categoryType,createdBy,weightageArray,oldQuestionId, callback){
        this.model.saveAuditDetailsModel(tenantId, questionName, questionShortName, weightage,auditType,categoryType,createdBy,weightageArray,oldQuestionId, callback);
    },
    deleteAuditQuestions: function(req,res){
        try{
            var self = this;
            if (typeof req.session.tenantId == 'undefined' || typeof req.session.userId == 'undefined') {
                res.redirect(props.contextPath+'/client/ci/login');
            } else {
                var questionDeleteId = req.body.questionDeleteId;
                var userId = req.session.userId;
                var auditTypeId = req.body.auditType;
                var categoryTypeId = req.body.categoryType;
                self.deleteAuditQuestionsDetails(questionDeleteId, userId, function(status) {
                    self.retrieveAuditQuestionsDetails(auditTypeId, categoryTypeId, function (auditDetails, statusRetrive) {
                        req.body.auditDetails = auditDetails;
                        req.body.status = status;
                        req.body.statusRetrive = statusRetrive;
                        res.send(req.body);
                    });
                });
            }
        }catch(e){
            customlog.error("Exception while deleteAuditQuestions "+e);
            self.commonRouter.showErrorPage(req,res);
        }
    },

    deleteAuditQuestionsDetails: function(questionDeleteId, userId, callback){
        this.model.deleteAuditQuestionsDetailsModel(questionDeleteId, userId, callback);
    },

    saveAssignAuditor: function (req, res) {
    try{
        var self = this;
        if (typeof req.session.tenantId == 'undefined' || typeof req.session.userId == 'undefined') {
            res.redirect(props.contextPath+'/client/ci/login');
        } else {
            var constantsObj = this.constants;
            var tenantId =req.session.tenantId;
            var auditees = req.body.auditees;
            var officeId = req.body.officeId;
            var fromDate = req.body.fromdate;
            var toDate = req.body.todate;
            var auditType= req.body.auditType;
            var categoryTypeId = req.body.categoryType;
            self.saveAssignAuditorDetails(tenantId,auditees,officeId,fromDate,auditType,toDate,categoryTypeId,function (status,emailId) {
                if (status == 'success') {
                    req.body.operationId = constantsObj.getAssignAuditorOperationId();
                    req.body.statusMessage = "Auditor has been assigned successfully";
                    var subject = "New Audit Assigining Reg. Do not reply.";
                    var text = "You are assigned for new Audit process";
                    var toAddress = emailId;
                    self.commonRouter.sendEmail(toAddress,subject,text,function(mailStatus){
                        if(mailStatus){
                            var activityDetails = new Array(iklantPort,1, auditees, auditees, req.originalUrl, req.connection.remoteAddress, "AuditingRouter.js", "AssignAuditor", "success", "AssignAuditor", "Auditor id "+auditees+" has assigned for New Audit and mail has been sent","insert");
                            self.commonRouter.insertActivityLogModel(activityDetails);
                        }
                    });
                    self.auditManagement(req,res);
                }
                else if (status == 'failure') {
                    req.body.operationId = constantsObj.getAssignAuditorOperationId();
                    req.body.statusMessage = "Auditor has been Assigned Failed";
                    self.auditManagement(req,res);
                }
                else {
                    self.commonRouter.showErrorPage(req,res);
                }
            });
        }
    }catch(e){
        customlog.error("Exception while saveAssignment "+e);
        self.commonRouter.showErrorPage(req,res);
    }
},

    saveAssignAuditorDetails: function(tenantId,auditees,officeId,fromDate,auditType,toDate,categoryTypeId, callback){
        this.model.saveAssignAuditorDetailsModel(tenantId,auditees,officeId,fromDate,auditType,toDate,categoryTypeId, callback);
    },
    populateAuditorAssignmentDetails: function(req,res){
        try{
            var self = this;
            if (typeof req.session.tenantId == 'undefined' || typeof req.session.userId == 'undefined') {
                res.redirect(props.contextPath+'/client/ci/login');
            } else {
                var auditees = req.body.auditees;
                self.retrieveAuditorAssignmentDetails(auditees, function(auditDetails,status){
                    req.body.auditDetails = auditDetails;
                    req.body.status = status;
                    res.send(req.body);
                })
            }
        }catch(e){
            customlog.error("Exception while populateAuditor Assignment Details "+e);
            self.commonRouter.showErrorPage(req,res);
        }
    },

    retrieveAuditorAssignmentDetails: function(auditees, callback){
        this.model.retrieveAuditorAssignmentDetailsModel(auditees, callback);
    } ,

    retreiveAndroidAuditingSyncDetails:function(auditorId,callback){
        this.model.retreiveAndroidAuditingSyncDetailsModel(auditorId,callback);
    },
    androidAuditorSyncDetails:function(req,res){
        try{
            var self = this;
            var auditorId = req.body.auditorId;
            console.log("androidAuditorSyncDetails : auditorId "+auditorId);
            self.retreiveAndroidAuditingSyncDetails(auditorId,function(auditingGroupForAndroidObj, auditeeDetailsForAndroidForAndroidObj,categoryDetailsForAndroidForAndroidObj,
                                                                  templateDetailsForAndroidForAndroidObj,auditQuestionsForAndroidForAndroidObj,auditAnswersForAndroidForAndroidObj){
                self.ShowIklanToAndroidDetails(res,auditorId,auditingGroupForAndroidObj,auditeeDetailsForAndroidForAndroidObj,categoryDetailsForAndroidForAndroidObj,
                    templateDetailsForAndroidForAndroidObj,auditQuestionsForAndroidForAndroidObj,auditAnswersForAndroidForAndroidObj);
            });
        }catch(e){
            customlog.error("Exception while populateAuditor Assignment Details "+e);
            self.commonRouter.showErrorPage(req,res);
        }
    },
    ShowIklanToAndroidDetails: function(res,auditorId,auditingGroupForAndroidObj,auditeeDetailsForAndroidForAndroidObj,categoryDetailsForAndroidForAndroidObj,
                                        templateDetailsForAndroidForAndroidObj,auditQuestionsForAndroidForAndroidObj,auditAnswersForAndroidForAndroidObj) {
        var constantsObj = this.constants;
        var auditingDetailsJson = "";
        var auditingDetailsJson = '"AuditingDetails":'+JSON.stringify({});
        if((typeof auditingGroupForAndroidObj != 'undefined')){
            auditingDetailsJson = '"AuditingDetails":'+JSON.stringify({
                auditingIdArray:auditingGroupForAndroidObj.getAuditingId(),
                auditTypeId:auditingGroupForAndroidObj.getAuditTypeId(),
                auditCategoryId:auditingGroupForAndroidObj.getAuditCategoryId(),
                auditTemplateId:auditingGroupForAndroidObj.getAuditTemplateId(),
                auditeeId:auditingGroupForAndroidObj.getAuditeeId(),
                auditorId:auditingGroupForAndroidObj.getAuditorId(),
                officeId:auditingGroupForAndroidObj.getOfficeId(),
                assignTo:auditingGroupForAndroidObj.getAssignTo(),
                auditStatus:auditingGroupForAndroidObj.getAuditStatus(),
                auditDueFrom:auditingGroupForAndroidObj.getAuditDueFrom(),
                auditDueTo:auditingGroupForAndroidObj.getAuditDueTo(),
                createdDate:auditingGroupForAndroidObj.getCreatedDate(),
                updatedDate:auditingGroupForAndroidObj.getUpdatedDate(),
                completedDate:auditingGroupForAndroidObj.getCompletedDate()
            })
        }
        var auditeeDetailsJson = '"AuditeeDetails":'+JSON.stringify({});
        if(typeof auditeeDetailsForAndroidForAndroidObj != 'undefined'){
            auditeeDetailsJson = '"AuditeeDetails":'+JSON.stringify({
                tenantId:auditeeDetailsForAndroidForAndroidObj.getTenantId(),
                officeId:auditeeDetailsForAndroidForAndroidObj.getOfficeId(),
                userId:auditeeDetailsForAndroidForAndroidObj.getUserId(),
                userName:auditeeDetailsForAndroidForAndroidObj.getUserName(),
                auditTypeId:auditeeDetailsForAndroidForAndroidObj.getAuditTypeId(),
                officeName:auditeeDetailsForAndroidForAndroidObj.getOfficeName()
            })
        }
        var categoryDetailsJson = '"CategoryDetails":'+JSON.stringify({});
        if(typeof categoryDetailsForAndroidForAndroidObj != 'undefined'){
            categoryDetailsJson = '"CategoryDetails":'+JSON.stringify({
                categoryTypeId:categoryDetailsForAndroidForAndroidObj.getCategoryTypeId(),
                categoryTypeName:categoryDetailsForAndroidForAndroidObj.getCategoryTypeName(),
                auditTypeId:categoryDetailsForAndroidForAndroidObj.getAuditTypeId()
            })
        }

        var templateDetailsJson = '"templateDetails":'+JSON.stringify({});
        if(typeof templateDetailsForAndroidForAndroidObj != 'undefined'){
                templateDetailsJson = '"templateDetails":'+JSON.stringify({
                    auditTemplateId:templateDetailsForAndroidForAndroidObj.getAuditTemplateId(),
                    auditQuestionId:templateDetailsForAndroidForAndroidObj.getAuditQuestionId(),
                    weightage:templateDetailsForAndroidForAndroidObj.getWeightage(),
                    auditType:templateDetailsForAndroidForAndroidObj.getAuditType(),
                    categoryType:templateDetailsForAndroidForAndroidObj.getCategoryType(),
                    createdDate:templateDetailsForAndroidForAndroidObj.getCreatedDate(),
                    updatedDate:templateDetailsForAndroidForAndroidObj.getUpdatedDate()
            })
        }
        var questionDetailsJson = '"questionDetails":'+JSON.stringify({});
        if(typeof auditQuestionsForAndroidForAndroidObj != 'undefined'){
            questionDetailsJson = '"questionDetails":'+JSON.stringify({
                tenantId:auditQuestionsForAndroidForAndroidObj.getTenantId(),
                questionId:auditQuestionsForAndroidForAndroidObj.getQuestionId(),
                questionName:auditQuestionsForAndroidForAndroidObj.getQuestionName(),
                displayName:auditQuestionsForAndroidForAndroidObj.getDisplayName(),
                weightage:auditQuestionsForAndroidForAndroidObj.getWeightage(),
                auditType:auditQuestionsForAndroidForAndroidObj.getAuditType(),
                categoryType:auditQuestionsForAndroidForAndroidObj.getCategoryType(),

                isDefault:auditQuestionsForAndroidForAndroidObj.getIsDefault(),
                createdBy:auditQuestionsForAndroidForAndroidObj.getCreatedBy(),


               createdDate:auditQuestionsForAndroidForAndroidObj.getCreatedDate(),
               deletedDate:auditQuestionsForAndroidForAndroidObj.getDeletedDate(),
               updatedBy:auditQuestionsForAndroidForAndroidObj.getUpdatedBy(),
               updatedDate:auditQuestionsForAndroidForAndroidObj.getUpdatedDate()
            })
        }

        var answereDetailsJson = '"answereDetails":'+JSON.stringify({});
        if(typeof auditAnswersForAndroidForAndroidObj != 'undefined'){
            answereDetailsJson = '"answereDetails":'+JSON.stringify({
                auditingAnswereId:auditAnswersForAndroidForAndroidObj.getAuditing_answere_id(),
                auditingQuestionId:auditAnswersForAndroidForAndroidObj.getAuditing_question_id(),
                auditingId:auditAnswersForAndroidForAndroidObj.getAuditing_id(),
                answersTypeId:auditAnswersForAndroidForAndroidObj.getAnswers_type_id(),
                answerRemarks:auditAnswersForAndroidForAndroidObj.getAnswer_remarks(),
                createdDate:auditAnswersForAndroidForAndroidObj.getCreated_date(),
                updatedDate:auditAnswersForAndroidForAndroidObj.getUpdate_date(),
                auditTemplateId:auditAnswersForAndroidForAndroidObj.getAudit_template_id(),
                auditeeId:auditAnswersForAndroidForAndroidObj.getAuditee_id()
            })
        }
        var SyncDetails = "" ;
        SyncDetails = auditingDetailsJson +","+ auditeeDetailsJson +","+ categoryDetailsJson+","+templateDetailsJson+","+questionDetailsJson+","+answereDetailsJson;
        SyncDetails = "{"+ SyncDetails +"}";
        customlog.info("SyncDetails: "+SyncDetails);
        res.write(SyncDetails);
        res.end();
    },

    doAuditorSaveAndroid : function(req,res){
        console.log("........Auditor save answere.........");
        //res.write("Successfully Reached server for audt save request");
       // res.end();
        var constantsObj = this.constants;
        var jsonObjectAuditDetais = req.body.jsonObject;
        var self= this;
       //{"jsonObject":{"auditee_id":89,"answers_type_id":146,"auditing_question_id":1,"auditing_answer_id":"1","answer_remarks":"Group less than 5 member","auditing_id":"20","audit_template_id":1}}

        var auditingAnswerId =  jsonObjectAuditDetais.auditing_answer_id;
        var auditingQuestionId =   jsonObjectAuditDetais.auditing_question_id;
        var auditingId  =  jsonObjectAuditDetais.auditing_id;
        var answersTypeId =  jsonObjectAuditDetais.answers_type_id;
        var answerRemarks =  jsonObjectAuditDetais.answer_remarks;
        var auditTemplateId = jsonObjectAuditDetais.audit_template_id;
        var auditeeId = jsonObjectAuditDetais.auditee_id;
        var auditStatus = jsonObjectAuditDetais.audit_status;
        if(answerRemarks == "")
            answerRemarks = "''";
        console.log("auditingAnswerId: "+auditingAnswerId);
        console.log("questionId: "+auditingQuestionId);
        console.log("auditingId: "+auditingId);
        console.log("answersTypeId: "+answersTypeId);
        console.log("answerRemarks: "+answerRemarks);
        console.log("auditTemplateId: "+auditTemplateId);
        console.log("auditeeId: "+auditeeId);
        this.model.doAuditorSaveAndroidModel(auditingAnswerId,auditingQuestionId,auditingId,answersTypeId,answerRemarks,auditTemplateId,auditeeId,auditStatus,function(status){
            customlog.info("status : in router "+status);
            var http = require('http');
            var HTTPStatus = require('http-status');
            if(status == "success"){
                console.log("doAuditorSaveAndroidModel : callback success ");
                self.model.doAuditingStatusUpdateModel(auditingId,auditStatus,function(callbackRes){
                    if(callbackRes == "success"){
                       if(auditStatus != 159){
                           self.model.getMailDetailsModel(auditTemplateId,auditingId,auditeeId,function(mailDetails,toMail){
                               self.doMailServiceAfterAuditComplete(mailDetails,toMail,function(status){
                                   console.log("doAuditorSaveAndroidModel : status update callback success ");
                                   res.send(HTTPStatus[200]);
                                   res.end();
                               });
                           });
                       }else{
                           console.log("doAuditorSaveAndroidModel : status update callback success ");
                           res.send(HTTPStatus[200]);
                           res.end();
                       }

                    }else{
                        console.log("doAuditorSaveAndroidModel : status update callback failure ");
                        res.send(HTTPStatus[201]);
                        res.end();
                    }
                });
            }else{
                res.send(HTTPStatus[201]);
                res.end();
                console.log("doAuditorSaveAndroidModel : callback failure ");
            }

        });
    },
    //Added by sathish Kumar M 008 for after completed audit sending mail to Audit Head
    doMailServiceAfterAuditComplete : function(mailDetails,toMail,callback){
        var self= this;
        var subject = "Audit Process Completed Reg. Do not reply.";

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
        var notificationContent = "<p><h3>Audit Assigneed Status for "+mailDetails[0].display_name+"</h3></p>";
        notificationContent += "<table border='2',style='"+tableStyle+"'>"+
            "<tr>"+
            "<th style='"+thStyle+centerText+"'>S.No</th>"+
            "<th style='"+thStyle+centerText+"'>Office Name</th>"+
            "<th style='"+thStyle+"'>Auditee Name</th>"+
            "<th style='"+thStyle+"'>Audit Type</th>"+
            "<th style='"+thStyle+"'>Category Type </th>"+
            "<th style='"+thStyle+centerText+"'>Date of Audit Start</th>"+
            "<th style='"+thStyle+centerText+"'>Date of Audit Completed</th>"+
            "<th style='"+thStyle+centerText+"'>Weightage</th>"+
            "</tr>";
            notificationContent+=
                "<tr>"+
                "<td style='"+tdStyle+centerText+"'>"+(1)+"</td>"+
                "<td style='"+tdStyle+"'>"+mailDetails[0].office_name+"</td>" +
                "<td style='"+tdStyle+"'>"+mailDetails[0].display_name+"</td>"+
                "<td style='"+tdStyle+"'>"+mailDetails[0].role_name+"</td>"+
                    "<td style='"+tdStyle+"'>"+mailDetails[0].category_type_name+"</td>"+
                    "<td style='"+tdStyle+"'>"+mailDetails[0].audit_due_from+"</td>"+
                    "<td style='"+tdStyle+"'>"+mailDetails[0].audit_due_to+"</td>"+
                "<td style='"+tdStyle+"'>"+mailDetails[0].weightage+"</td>";
            notificationContent+=
                "</tr>";
        notificationContent+="</table>";
        notificationContent+= "<p><h3>Audit Done Check list Details for "+mailDetails[0].display_name+"</h3></p>";
        notificationContent += "<table border='2',style='"+tableStyle+"'>"+
            "<tr>"+
            "<th style='"+thStyle+centerText+"'>S.No</th>"+
            "<th style='"+thStyle+centerText+"'>Question Name</th>"+
            "<th style='"+thStyle+"'>Answer</th>"+
            "<th style='"+thStyle+"'>Remarks</th>"+
            "<th style='"+thStyle+"'>Weighatage</th>"+
            "</tr>";
        for(var i=0; i<mailDetails.length; i++){
            notificationContent+=
                "<tr>"+
                "<td style='"+tdStyle+centerText+"'>"+(i+1)+"</td>"+
                "<td style='"+tdStyle+"'>"+mailDetails[i].question_name+"</td>" +
                "<td style='"+tdStyle+"'>"+mailDetails[i].lookup_value+"</td>"+
                "<td style='"+tdStyle+"'>"+mailDetails[i].remarks+"</td>"+
                "<td style='"+tdStyle+"'>"+mailDetails[i].weightage+"</td>";
            notificationContent+=
                "</tr>";
        }
        notificationContent+="</table>";
        //var toAddress = toMail[0].email_id;
        self.commonRouter.sendEmail(toMail,subject,notificationContent,function(mailStatus){
            if(mailStatus){
                callback("success")
            }else{
                callback("failure")
            }
        });

    }
    //Ended by Sathish Kumar M 008 for after completed audit sending mail to Audit Head

};