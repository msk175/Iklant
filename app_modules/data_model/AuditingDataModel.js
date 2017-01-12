module.exports = auditingDataModel;

var path = require('path');
var rootPath = path.dirname(process.mainModule.filename);
var lookupEntityObj;

var dbTableName = require(path.join(rootPath,"properties.json"));

var connectionDataSource = require(path.join(rootPath,"app_modules/data_model/DataSource"));
var customlog = require(path.join(rootPath,"logger/loggerConfig.js"))('AuditingDataModel.js');
var auditAndroidDTO = path.join(rootPath,"app_modules/dto/audit_android");
var dateUtils = require(path.join(rootPath,"app_modules/utils/DateUtils"));

//Business Layer
function auditingDataModel(constants) {
    customlog.debug("Inside Auditing Data Access Layer");
    this.constants = constants;
}

auditingDataModel.prototype = {
    //Added by Sathish Kumar M 008 for Audit Module
    retrieveOperationDetailsForAuditDataModel: function(roleId,callback) {
        var self = this;
        var operationId = new Array();
        var operationName = new Array();
        var categoryAllId = new Array();
        var categoryAllName = new Array();
        var auditAllId = new Array();
        var categoryId = new Array();
        var categoryName = new Array();
        var auditId = new Array();
        var operationQuery = "SELECT op.operation_id,op.operation_name FROM "+dbTableName.iklantOperation+" op " +
            "INNER JOIN "+dbTableName.iklantRoleOperation+" ro ON  ro.role_id IN (" + roleId + ") " +
            "WHERE op.operation_id = ro.operation_id ORDER BY op.operation_id";
        customlog.info("operationQuery : " + operationQuery);
        connectionDataSource.getConnection(function (clientConnect) {
            clientConnect.query(operationQuery, function (err, results, fields) {
                if (err) {
                    connectionDataSource.releaseConnectionPool(clientConnect);
                    callback("failure");
                }
                else {
                    for (var i = 0; i < results.length; i++) {
                        operationId[i] = results[i].operation_id;
                        operationName[i] = results[i].operation_name;
                    }
                    var categoryAllQuery = "SELECT category_type_id,category_type_name,audit_type_id FROM iklant_audit_category ORDER BY category_type_id";
                    clientConnect.query(categoryAllQuery, function (err, result, fields) {
                        if (err) {
                            connectionDataSource.releaseConnectionPool(clientConnect);
                            callback(operationId, operationName,categoryAllId, categoryAllName,auditAllId,categoryId, categoryName,auditId);
                        }
                        else {
                            for (var i = 0; i < result.length; i++) {
                                categoryAllId[i] = result[i].category_type_id;
                                categoryAllName[i] = result[i].category_type_name;
                                auditAllId[i] = result[i].audit_type_id;
                            }
                            var categoryQuery = " SELECT iac.category_type_id,iac.category_type_name,iac.audit_type_id FROM iklant_audit_category iac "+
                                                " INNER JOIN iklant_audit_questions iaq ON iac.category_type_id = iaq.category_type GROUP BY iac.category_type_id"
                            clientConnect.query(categoryQuery,function(err,result,fields){
                                connectionDataSource.releaseConnectionPool(clientConnect);
                                if(err){
                                    callback(operationId, operationName,categoryAllId, categoryAllName,auditAllId,categoryId, categoryName,auditId);
                                }else{
                                    for (var i = 0; i < result.length; i++) {
                                        categoryId[i] = result[i].category_type_id;
                                        categoryName[i] = result[i].category_type_name;
                                        auditId[i] = result[i].audit_type_id;
                                    }
                                    callback(operationId, operationName,categoryAllId, categoryAllName,auditAllId,categoryId, categoryName,auditId);
                                }
                            });

                        }
                    });
                }
            });
        });
    },
    retriveAuditDataModelCall : function(callback){
        var self = this;
        var auditId = new Array();
        var auditName = new Array();
        var auditQuery = "SELECT role_id,role_name FROM "+dbTableName.iklantRole+" where is_audit = 1;"
        connectionDataSource.getConnection(function (clientConnect) {
            clientConnect.query(auditQuery, function (err, results, fields) {
                connectionDataSource.releaseConnectionPool(clientConnect);
                if (err) {
                    callback("failure");
                }
                else {
                    var count = -1;
                    for (var i = 0; i < results.length; i++) {
                        auditId[i] = results[i].role_id;
                        auditName[i] = results[i].role_name;
                    }
                    callback(auditId,auditName);
                }
            });
        });
    },
    retrieveAuditQuestionsDetailsDataModel: function(auditTypeId, categoryTypeId, callback) {
        var self = this;
        var retrieveAuditQuestionsQuery = "SELECT question_Id,question_Name,display_name,weightage,audit_type,category_type FROM iklant_audit_questions WHERE category_type = "+categoryTypeId+" AND audit_type = "+auditTypeId+" AND is_default = 1";
        connectionDataSource.getConnection(function (clientConnect) {
            clientConnect.query(retrieveAuditQuestionsQuery, function (err, auditResults, fields) {
                connectionDataSource.releaseConnectionPool(clientConnect);
                if (err) {
                    callback("failure");
                }
                else {
                    var status = 1;
                    callback(auditResults,status);
                }
            });
        });
    },
    saveCategoryDetailsDataModel: function (categoryName,auditType, callback) {
        var self = this;
        var saveCategoryQuery = "INSERT INTO iklant_audit_category (category_type_name,audit_type_id) VALUES ('"+categoryName+"',"+auditType+");";
        connectionDataSource.getConnection(function (clientConnect) {
            clientConnect.query(saveCategoryQuery, function (err) {
                connectionDataSource.releaseConnectionPool(clientConnect);
                if (err) {
                    callback("failure");
                }
                else {
                    callback("success");
                }
            });
        });
    },
    saveAuditDetailsDataModel: function (tenantId, questionName, questionShortName, weightage,auditType,categoryType,createdBy,weightageArray,oldQuestionId, callback) {
        var self = this;
        var templateSelectQuery = "SELECT IFNULL(MAX(a.audit_status),1) AS audit_status FROM iklant_auditing a "+
        " WHERE a.audit_type_id="+ auditType +" AND a.audit_category_id="+ categoryType +" AND `audit_template_id` = (SELECT MAX(`audit_template_id`) FROM `iklant_audit_template` WHERE `audit_type`="+ auditType +" AND `category_type`="+ categoryType +")"
        customlog.info("templateSelectQueryFirst "+templateSelectQuery);
        connectionDataSource.getConnection(function (clientConnect) {
            clientConnect.query(templateSelectQuery, function (err,resuls,fields) {
                if (err) {
                    connectionDataSource.releaseConnectionPool(clientConnect);
                    customlog.error(err);
                    callback("failure");
                }else{
                    if(resuls.length != 0){
                        if(resuls[0].audit_status == 159){
                            var count = new Array();
                            self.updateAndInsertQuestions(tenantId, questionName, questionShortName, weightage,auditType,categoryType,createdBy,weightageArray,oldQuestionId,function (status){
                                if(status == "success"){
                                    self.insertTemplate(tenantId, questionName, questionShortName, weightage,auditType,categoryType,createdBy,weightageArray,oldQuestionId, callback,function(status){
                                        if(status == "success"){
                                            callback("success");
                                        }else{
                                            callback("failure");
                                        }
                                    });
                                }else{
                                    callback("failure");
                                }
                            });

                        }else{
                            connectionDataSource.releaseConnectionPool(clientConnect);
                            self.updateAndInsertQuestions(tenantId, questionName, questionShortName, weightage,auditType,categoryType,createdBy,weightageArray,oldQuestionId,function (status){
                                if(status == "success"){
                                    var templateSelectAuditNotStartedQuery = "SELECT (SELECT IFNULL(MAX(iat.audit_template_id),1) FROM iklant_audit_template iat WHERE iat.audit_type ="+ auditType +" AND iat.category_type="+ categoryType +") AS audit_template_id,"+
                                        "iaq.weightage,iaq.question_Id,iaq.audit_type,iaq.category_type FROM iklant_audit_questions iaq WHERE iaq.audit_type= "+ auditType +" AND iaq.category_type="+ categoryType +" AND iaq.is_default = 1;"
                                    customlog.info("templateSelectQuery in not Audit Started "+templateSelectAuditNotStartedQuery);
                                    connectionDataSource.getConnection(function (clientConnect) {
                                        clientConnect.query(templateSelectAuditNotStartedQuery, function (err, reslts, fields) {
                                            if (err) {
                                                connectionDataSource.releaseConnectionPool(clientConnect);
                                                customlog.error(err);
                                                callback("failure");
                                            } else {
                                                var templateDeleteQuery = "DELETE FROM iklant_audit_template WHERE audit_template_id = " + reslts[0].audit_template_id + ";"
                                                clientConnect.query(templateDeleteQuery,function(err){
                                                    if(!err){
                                                        var count = new Array();
                                                        for(j in reslts){
                                                            count.push(j);
                                                            var templateInsertQuery = "INSERT INTO iklant_audit_template (audit_template_id,audit_question_id,weightage,audit_type,category_type,created_date,updated_date) VALUES ("+reslts[j].audit_template_id+","+reslts[j].question_Id+","+reslts[j].weightage+","+reslts[j].audit_type+","+reslts[j].category_type+",NOW() + INTERVAL 5 HOUR + INTERVAL 30 MINUTE,NOW() + INTERVAL 5 HOUR + INTERVAL 30 MINUTE);"
                                                            clientConnect.query(templateInsertQuery,function(err){
                                                                if(err){
                                                                    connectionDataSource.releaseConnectionPool(clientConnect);
                                                                    callback("failure");
                                                                }
                                                            });
                                                            if(count.length == reslts.length){
                                                                connectionDataSource.releaseConnectionPool(clientConnect);
                                                                callback("success");
                                                            }
                                                        }
                                                    }
                                                });
                                            }
                                        });
                                    });
                                }
                                else{
                                    callback("failure");
                                }
                            });
                        }
                    }else{
                        connectionDataSource.releaseConnectionPool(clientConnect);
                        self.updateAndInsertQuestions(tenantId, questionName, questionShortName, weightage,auditType,categoryType,createdBy,weightageArray,oldQuestionId,function (status){
                            if(status == "success"){
                                var templateSelectAuditNotStartedQuery = "SELECT (SELECT IFNULL(MAX(iat.audit_template_id),1) FROM iklant_audit_template iat WHERE iat.audit_type ="+ auditType +" AND iat.category_type="+ categoryType +") AS audit_template_id,"+
                                    "iaq.weightage,iaq.question_Id,iaq.audit_type,iaq.category_type FROM iklant_audit_questions iaq WHERE iaq.audit_type= "+ auditType +" AND iaq.category_type="+ categoryType +" AND iaq.is_default = 1;"
                                customlog.info("templateSelectQuery in not Audit Started "+templateSelectAuditNotStartedQuery);
                                connectionDataSource.getConnection(function (clientConnect) {
                                    clientConnect.query(templateSelectAuditNotStartedQuery, function (err, reslts, fields) {
                                        if (err) {
                                            connectionDataSource.releaseConnectionPool(clientConnect);
                                            customlog.error(err);
                                            callback("failure");
                                        } else {
                                            var templateDeleteQuery = "DELETE FROM iklant_audit_template WHERE audit_template_id = " + reslts[0].audit_template_id + ";"
                                            clientConnect.query(templateDeleteQuery,function(err){
                                                if(!err){
                                                    var count = new Array();
                                                    for(j in reslts){
                                                        count.push(j);
                                                        var templateInsertQuery = "INSERT INTO iklant_audit_template (audit_template_id,audit_question_id,weightage,audit_type,category_type,created_date,updated_date) VALUES ("+reslts[j].audit_template_id+","+reslts[j].question_Id+","+reslts[j].weightage+","+reslts[j].audit_type+","+reslts[j].category_type+",NOW() + INTERVAL 5 HOUR + INTERVAL 30 MINUTE,NOW() + INTERVAL 5 HOUR + INTERVAL 30 MINUTE);"
                                                        clientConnect.query(templateInsertQuery,function(err){
                                                            if(err){
                                                                connectionDataSource.releaseConnectionPool(clientConnect);
                                                                callback("failure");
                                                            }
                                                        });
                                                        if(count.length == reslts.length){
                                                            connectionDataSource.releaseConnectionPool(clientConnect);
                                                            callback("success");
                                                        }
                                                    }
                                                }
                                            });
                                        }
                                    });
                                });
                            }
                            else{
                                callback("failure");
                            }
                        });
                    }
                }
            });
        });
    },

    insertTemplate : function (tenantId, questionName, questionShortName, weightage,auditType,categoryType,createdBy,weightageArray,oldQuestionId, callback){
        var count = new Array();
        var templateSelectQuery = "SELECT (SELECT IFNULL(MAX(iat.audit_template_id),0)+1 FROM iklant_audit_template iat WHERE iat.audit_type ="+ auditType +" AND iat.category_type="+ categoryType +") AS audit_template_id,"+
            "iaq.weightage,iaq.question_Id,iaq.audit_type,iaq.category_type FROM iklant_audit_questions iaq WHERE iaq.audit_type= "+ auditType +" AND iaq.category_type="+ categoryType +" AND iaq.is_default = 1;"
        customlog.info("templateSelectQuery "+templateSelectQuery);
        connectionDataSource.getConnection(function (clientConnect) {
            clientConnect.query(templateSelectQuery,function(err,results,fields){
                for(i in results){
                    count.push(i);
                    var templateInsertQuery = "INSERT INTO iklant_audit_template (audit_template_id,audit_question_id,weightage,audit_type,category_type,created_date,updated_date) VALUES ("+results[i].audit_template_id+","+results[i].question_Id+","+results[i].weightage+","+results[i].audit_type+","+results[i].category_type+",NOW() + INTERVAL 5 HOUR + INTERVAL 30 MINUTE,NOW() + INTERVAL 5 HOUR + INTERVAL 30 MINUTE);"
                    customlog.info("templateInsertQuery "+templateInsertQuery);
                    clientConnect.query(templateInsertQuery, function (err) {
                        if (err) {
                            connectionDataSource.releaseConnectionPool(clientConnect);
                            customlog.error(err);
                            callback("failure");
                        }
                    });
                    if(results.length == count.length){
                        connectionDataSource.releaseConnectionPool(clientConnect);
                        callback("success");
                    }
                }
            });
        });
    },

    updateAndInsertQuestions : function (tenantId, questionName, questionShortName, weightage,auditType,categoryType,createdBy,weightageArray,oldQuestionId,callback){
        var self = this;
        if(oldQuestionId.length>0){
            connectionDataSource.getConnection(function (clientConnect) {
                for (var i = 0; i < oldQuestionId.length; i++) {
                    var oldQuestionUpdateQuery = "UPDATE iklant_audit_questions SET weightage =" + weightageArray[i] + " ,updated_by=" + createdBy + ",updated_date= NOW() + INTERVAL 5 HOUR + INTERVAL 30 MINUTE WHERE question_Id=" + oldQuestionId[i];
                    clientConnect.query(oldQuestionUpdateQuery, function (err) {
                        if (err) {
                            customlog.error(err);
                            callback("failure");
                        }
                    });
                    if(i == oldQuestionId.length-1){
                        connectionDataSource.releaseConnectionPool(clientConnect);
                        if(questionName != "") {
                            self.insertQuestions(tenantId, questionName, questionShortName, weightage, auditType, categoryType, createdBy, weightageArray, oldQuestionId, callback, function (status) {
                                if (status == "success") {
                                    callback("success");
                                } else {
                                    callback("failure");
                                }
                            });
                        }else{
                            callback("success");
                        }
                    }
                }

            });
        }else{
            if(questionName != "") {
                self.insertQuestions(tenantId, questionName, questionShortName, weightage, auditType, categoryType, createdBy, weightageArray, oldQuestionId, callback, function (status) {
                    if (status == "success") {
                        callback("success");
                    } else {
                        callback("failure");
                    }
                });
            }else{
                callback("success");
            }
        }
    },
    insertQuestions : function (tenantId, questionName, questionShortName, weightage,auditType,categoryType,createdBy,weightageArray,oldQuestionId,callback){
        var self = this;
        if(questionName != "") {
            var auditQuestionsQuery = "INSERT INTO iklant_audit_questions (tenant_id,question_Name,display_name,weightage,audit_type,category_type,created_by,created_date) " +
                "VALUES ("+tenantId+",'"+questionName+"','"+questionShortName+"',"+weightage+","+auditType+","+categoryType+","+createdBy+",NOW() + INTERVAL 5 HOUR + INTERVAL 30 MINUTE);";
            customlog.info("auditQuestionsQuery "+auditQuestionsQuery);
            connectionDataSource.getConnection(function (clientConnect) {
                clientConnect.query(auditQuestionsQuery, function (err) {
                    connectionDataSource.releaseConnectionPool(clientConnect);
                    if (err) {
                        customlog.error(err);
                        callback("failure");
                    }
                    else {
                        callback("success");
                    }
                });
            });
        }
        else{
            callback("success");
        }

    },

    deleteAuditQuestionsDetailsDataModel: function(questionDeleteId, userId, callback){
        var self = this;
        var deleteQuestionsQuery = "UPDATE iklant_audit_questions SET is_default = 0 , deleted_date = NOW() + INTERVAL 5 HOUR + INTERVAL 30 MINUTE,updated_by="+userId+",updated_date=NOW() + INTERVAL 5 HOUR + INTERVAL 30 MINUTE  WHERE question_Id ="+ questionDeleteId
        customlog.info("deleteQuestionsQuery"+deleteQuestionsQuery);
        connectionDataSource.getConnection(function (clientConnect) {
            clientConnect.query(deleteQuestionsQuery, function (err) {
                connectionDataSource.releaseConnectionPool(clientConnect);
                if (err) {
                    callback("failure");
                }
                else {
                    callback("success");
                }
            });
        });
    },
    retriveAuditorDataModelCall: function(callback){
        var self = this;
        var auditNamesArray = new Array();
        var auditIdsArray = new Array();
        var auditEmailIdArray = new Array();
        var retriveAuditorQuery = "SELECT u.email_id,u.user_id,u.user_name FROM "+dbTableName.iklantUsers+" u INNER JOIN personnel_role pr ON pr.personnel_id = u.user_id WHERE pr.role_id = 14"
        connectionDataSource.getConnection(function (clientConnect) {
            clientConnect.query(retriveAuditorQuery, function (err,results,fields) {
                connectionDataSource.releaseConnectionPool(clientConnect);
                if (err) {
                    callback("failure");
                }
                else {
                    for (var i in results) {
                        auditNamesArray[i] = results[i].user_name;
                        auditIdsArray[i] = results[i].user_id;
                        auditEmailIdArray= results[i].email_id;
                    }
                    callback(auditIdsArray,auditNamesArray,auditEmailIdArray);
                }
            });
        });

    },
    saveAssignAuditorDetailsDataModel: function(tenantId,auditees,officeId,fromDate,auditType,toDate,categoryTypeId,callback){
        var self = this;
        var maxTemplateQuery = "SELECT IFNULL(MAX(audit_template_id),1) AS audit_template_id FROM iklant_audit_template WHERE audit_type = " + auditType + " AND category_type=" + categoryTypeId +";"
        connectionDataSource.getConnection(function (clientConnect) {
            clientConnect.query(maxTemplateQuery, function (err,result,fields) {
                if (err) {
                    customlog.error(err);
                    connectionDataSource.releaseConnectionPool(clientConnect);
                    callback("failure");
                }
                else {
                   var audit_template_id = result[0].audit_template_id;
                    var saveAssignAuditorQuery = "INSERT INTO iklant_auditing (audit_type_id,audit_category_id,audit_template_id,auditor_id,office_id,assigned_to,audit_status,audit_due_from,audit_due_to,created_date) " +
                        " VALUES (" + auditType + "," + categoryTypeId + "," + audit_template_id + "," + auditees + "," + officeId + "," + auditees + "," + 159 + ",'" + fromDate + "','" + toDate + "',NOW() + INTERVAL 5 HOUR + INTERVAL 30 MINUTE);";
                    customlog.info("saveAssignAuditorQuery " + saveAssignAuditorQuery);
                    clientConnect.query(saveAssignAuditorQuery, function (err) {
                        if (err) {
                            customlog.error(err);
                            connectionDataSource.releaseConnectionPool(clientConnect);
                            callback("failure");
                        }
                        else {
                            var emailIdQuery = "select email_id from " + dbTableName.iklantUsers + " where user_id = " + auditees + ";"
                            clientConnect.query(emailIdQuery, function (err, result, fields) {
                                connectionDataSource.releaseConnectionPool(clientConnect);
                                if (err) {
                                    customlog.error(err);
                                    callback("failure");
                                }
                                else {
                                    var emailId = result[0].email_id;
                                    callback("success", emailId);
                                }
                            });
                        }
                    });
                }
            });
        });

    },
    retrieveAuditorAssignmentDetailsDataModel: function (auditees,callback){
        var self = this;
        var retrieveAuditAssignmentQuery = "SELECT office_id,DATE_FORMAT(audit_due_from,'%d-%M-%y') AS audit_due_from,DATE_FORMAT(audit_due_to,'%d-%M-%y') AS audit_due_to FROM iklant_auditing WHERE auditor_id="+auditees+";"
        connectionDataSource.getConnection(function (clientConnect) {
            clientConnect.query(retrieveAuditAssignmentQuery, function (err, auditResults, fields) {
                connectionDataSource.releaseConnectionPool(clientConnect);
                if (err) {
                    callback("failure");
                }
                else {
                    var status = "success";
                    callback(auditResults,status);
                }
            });
        });
    } ,

    retreiveAndroidAuditingDetailsDatamodel: function (auditorId, callback) {
        var constantsObj = this.constants;
        var auditingForAndroidRequire = require(auditAndroidDTO +"/auditingForAndroid");
        var auditingIdArray = new Array();
        var auditTypeIdArray = new Array();
        var auditCategoryIdArray = new Array();
        var auditTemplateIdArray   = new Array();
        var auditeeIdArray = new Array();
        var auditorIdArray = new Array();
        var officeIdArray = new Array();
        var assignToArray = new Array();
        var auditStatusArray = new Array();
        var auditDueFromArray = new Array();
        var auditDueToArray = new Array();
        var createdDateArray = new Array();
        var updatedDateArray = new Array();
        var completedDateArray = new Array();
        var auditingGroupForAndroidObj = new auditingForAndroidRequire();
        var auditingDetailsQuery = "SELECT * FROM "+dbTableName.iklantAuditing+" where auditor_id = "+auditorId;
        customlog.info("auditingDetailsQuery AndroidQuery : " + auditingDetailsQuery);
        connectionDataSource.getConnection(function (clientConnect) {
            if (auditingDetailsQuery != "") {
                clientConnect.query(auditingDetailsQuery, function selectCb(err, results, fields) {
                    connectionDataSource.releaseConnectionPool(clientConnect);
                    if(err){
                        customlog.error(err);
                        callback();
                    }else{
                        for (var i in results) {
                            auditingIdArray[i] = results[i].auditing_id;
                            auditTypeIdArray[i] = results[i].audit_type_id;
                            auditCategoryIdArray[i] = results[i].audit_category_id;
                            auditTemplateIdArray[i] = results[i].audit_template_id;//
                            console.log();
                            auditeeIdArray[i] = results[i].auditee_id;
                            auditorIdArray[i] = results[i].auditor_id;
                            officeIdArray[i] = results[i].office_id;
                            assignToArray[i] = results[i].assign_to;
                            auditStatusArray[i] = results[i].audit_status;
                            auditDueFromArray[i] = dateUtils.formatDateForUI(results[i].audit_due_from);
                            auditDueToArray[i] = dateUtils.formatDateForUI(results[i].audit_due_to);
                            createdDateArray[i] = dateUtils.formatDateForUI(results[i].created_date);
                            updatedDateArray[i] = dateUtils.formatDateForUI(results[i].updated_date);
                            completedDateArray[i] = dateUtils.formatDateForUI(results[i].completed_date);
                        }
                        auditingGroupForAndroidObj.setAuditingId(auditingIdArray);
                        auditingGroupForAndroidObj.setAuditTypeId(auditTypeIdArray);
                        auditingGroupForAndroidObj.setAuditCategoryId(auditCategoryIdArray);
                        auditingGroupForAndroidObj.setAuditTemplateId(auditTemplateIdArray);
                        auditingGroupForAndroidObj.setAuditeeId(auditeeIdArray);
                        auditingGroupForAndroidObj.setAuditorId(auditorIdArray);
                        auditingGroupForAndroidObj.setOfficeId(officeIdArray);
                        auditingGroupForAndroidObj.setAssignTo(assignToArray);
                        auditingGroupForAndroidObj.setAuditStatus(auditStatusArray);
                        auditingGroupForAndroidObj.setAuditDueFrom(auditDueFromArray);
                        auditingGroupForAndroidObj.setAuditDueTo(auditDueToArray);
                        auditingGroupForAndroidObj.setCreatedDate(createdDateArray);
                        auditingGroupForAndroidObj.setUpdatedDate(updatedDateArray);
                        auditingGroupForAndroidObj.setCompletedDate(completedDateArray);
                        callback(auditingGroupForAndroidObj);
                    }
                });
            }
        });
    },

    retreiveAndroidAuditeeSyncDetailsDatamodel: function (auditorId, callback) {
    var constantsObj = this.constants;
    var auditeeDetailsForAndroidRequire = require(auditAndroidDTO +"/auditeeDetailsForAndroid");
    var tenantIdArray = new Array();
    var officeIdArray = new Array();
    var userIdArray = new Array();
    var userNameArray = new Array();
    var auditTypeIdArray = new Array();
    var officeNameArray = new Array();
    var auditeeDetailsForAndroidForAndroidObj = new auditeeDetailsForAndroidRequire();
    //var auditeeDetailsQuery = "SELECT u.tenant_id,u.office_id,u.user_id,u.user_name,u.active_indicator,ag.audit_type_id,,io.office_name  FROM iklant_users u,iklant_auditing ag,iklant_office io WHERE u.active_indicator=1 AND u.office_id=ag.office_id AND u.office_id=io.office_id AND u.user_id IN (SELECT ur.user_id FROM `iklant_user_role` ur  WHERE ur.role_id IN"
    //+"(SELECT ag1.audit_type_id FROM `iklant_auditing` ag1 WHERE ag1.auditor_id="+auditorId+" AND ag1.office_id=ag.office_id))";
    var auditeeDetailsQuery = "SELECT u.tenant_id,u.office_id,u.user_id,u.user_name,u.active_indicator,ag.audit_type_id,io.office_name FROM iklant_users u,iklant_auditing ag,iklant_office io WHERE u.active_indicator=1 AND u.office_id=ag.office_id AND u.office_id=io.office_id AND u.user_id IN (SELECT ur.user_id FROM `iklant_user_role` ur  WHERE ur.role_id IN(SELECT ag1.audit_type_id FROM `iklant_auditing` ag1 WHERE ag1.auditor_id="+auditorId+" AND ag1.office_id=ag.office_id))";

        customlog.info("auditeeDetailsQuery AndroidQuery : " + auditeeDetailsQuery);
        connectionDataSource.getConnection(function (clientConnect) {
            if (auditeeDetailsQuery != "") {
                clientConnect.query(auditeeDetailsQuery, function selectCb(err, results, fields) {
                    connectionDataSource.releaseConnectionPool(clientConnect);
                    if(err){
                        customlog.error(err);
                        callback();
                    }else{
                        for (var i in results) {
                            tenantIdArray[i] = results[i].tenant_id;
                            officeIdArray[i] = results[i].office_id;
                            userIdArray[i] = results[i].user_id;
                            userNameArray[i] = results[i].user_name;
                            auditTypeIdArray[i] = results[i].audit_type_id;
                            officeNameArray[i] = results[i].office_name;

                        }


                        auditeeDetailsForAndroidForAndroidObj.setTenantId(tenantIdArray);
                        auditeeDetailsForAndroidForAndroidObj.setOfficeId(officeIdArray);
                        auditeeDetailsForAndroidForAndroidObj.setUserId(userIdArray);
                        auditeeDetailsForAndroidForAndroidObj.setUserName(userNameArray);
                        auditeeDetailsForAndroidForAndroidObj.setAuditTypeId(auditTypeIdArray);
                        auditeeDetailsForAndroidForAndroidObj.setOfficeName(officeNameArray);
                        callback(auditeeDetailsForAndroidForAndroidObj);
                    }
                });
            }
        });
},

    retreiveAndroidCategorySyncDetailsDatamodel: function (auditorId, callback) {
        var constantsObj = this.constants;
        var categoryForAndroidRequire = require(auditAndroidDTO +"/auditCategoryForAndroid");
        var categoryTypeId = new Array();
        var categoryTypeName = new Array();
        var auditTypeId = new Array();
        var categoryDetailsForAndroidForAndroidObj = new categoryForAndroidRequire();
        var categoryDetailsQuery = "SELECT ac.category_type_id,ac.category_type_name,ac.audit_type_id FROM `iklant_auditing` ag, `iklant_audit_category` ac WHERE ac.category_type_id=ag.audit_category_id AND auditor_id="+auditorId+"";
        customlog.info("categoryDetailsQuery AndroidQuery : " + categoryDetailsQuery);
        connectionDataSource.getConnection(function (clientConnect) {
            if (categoryDetailsQuery != "") {
                clientConnect.query(categoryDetailsQuery, function selectCb(err, results, fields) {
                    connectionDataSource.releaseConnectionPool(clientConnect);
                    if(err){
                        customlog.error(err);
                        callback();
                    }else{
                        for (var i in results) {
                            categoryTypeId[i] = results[i].category_type_id;
                            categoryTypeName[i] = results[i].category_type_name;
                            auditTypeId[i] = results[i].audit_type_id;
                        }
                        categoryDetailsForAndroidForAndroidObj.setCategoryTypeId(categoryTypeId);
                        categoryDetailsForAndroidForAndroidObj.setCategoryTypeName(categoryTypeName);
                        categoryDetailsForAndroidForAndroidObj.setAuditTypeId(auditTypeId);
                        callback(categoryDetailsForAndroidForAndroidObj);
                    }
                });
            }
        });
    },

    retreiveAndroidAuditTemplateSyncDetailsDatamodel: function (auditorId, callback) {
        var constantsObj = this.constants;
        var templateForAndroidRequire = require(auditAndroidDTO +"/auditTemplateForAndroid");
        var auditTemplateId = new Array();
        var auditQuestionId = new Array();
        var weightage = new Array();
        var auditType = new Array();
        var categoryType = new Array();
        var createdDate = new Array();
        var updatedDate = new Array();
        var templateDetailsForAndroidForAndroidObj = new templateForAndroidRequire();
        var templateDetailsQuery = "SELECT audit_template_id,audit_question_id,weightage,audit_type,category_type,created_date,updated_date FROM `iklant_audit_template` WHERE audit_template_id IN (SELECT audit_template_id FROM iklant_auditing WHERE auditor_id="+auditorId+")";
        customlog.info("templateDetailsQuery AndroidQuery : " + templateDetailsQuery);
        connectionDataSource.getConnection(function (clientConnect) {
            if (templateDetailsQuery != "") {
                clientConnect.query(templateDetailsQuery, function selectCb(err, results, fields) {
                    connectionDataSource.releaseConnectionPool(clientConnect);
                    if(err){
                        customlog.error(err);
                        callback();
                    }else{
                        for (var i in results) {
                            auditTemplateId[i] = results[i].audit_template_id;
                            auditQuestionId[i] = results[i].audit_question_id;
                            weightage[i] = results[i].weightage;
                            auditType[i] = results[i].audit_type;
                            categoryType[i] = results[i].category_type;
                            createdDate[i] = results[i].created_date;
                            updatedDate[i] = results[i].updated_date;
                        }
                        templateDetailsForAndroidForAndroidObj.setAuditTemplateId(auditTemplateId);
                        templateDetailsForAndroidForAndroidObj.setAuditQuestionId(auditQuestionId);
                        templateDetailsForAndroidForAndroidObj.setWeightage(weightage);
                        templateDetailsForAndroidForAndroidObj.setAuditType(auditType);
                        templateDetailsForAndroidForAndroidObj.setCategoryType(categoryType);
                        templateDetailsForAndroidForAndroidObj.setCreatedDate(createdDate);
                        templateDetailsForAndroidForAndroidObj.setUpdatedDate(updatedDate);
                        callback(templateDetailsForAndroidForAndroidObj);
                    }
                });
            }
        });
    },

    retreiveAndroidAuditQuestionSyncDetailsDatamodel: function (auditorId, callback) {
        var constantsObj = this.constants;
        var auditQuestionsForAndroidRequire = require(auditAndroidDTO +"/auditQuestionsForAndroid");

        var tenantId = new Array();
        var questionId  = new Array();
        var questionName  = new Array();
        var displayName   = new Array();
        var weightage   = new Array();
        var auditType   = new Array();
        var categoryType   = new Array();
        var isDefault   = new Array();
        var createdBy   = new Array();
        var createdDate   = new Array();
        var deletedDate    = new Array();
        var updatedBy     = new Array();
        var updatedDate     = new Array();
        var auditQuestionsForAndroidForAndroidObj = new auditQuestionsForAndroidRequire();
        var questionsDetailsQuery = "SELECT aq.tenant_id,aq.question_id,aq.question_name,aq.display_name,aq.weightage,aq.audit_type,aq.category_type,aq.is_default,aq.created_date,aq.deleted_date,aq.updated_by,aq.updated_date FROM iklant_audit_template atp,iklant_auditing ag,iklant_audit_questions aq WHERE atp.audit_question_id=aq.question_id AND atp.audit_template_id=ag.audit_template_id AND ag.auditor_id="+auditorId;
        customlog.info("questionsDetailsQuery AndroidQuery : " + questionsDetailsQuery);
        connectionDataSource.getConnection(function (clientConnect) {
            if (questionsDetailsQuery != "") {
                clientConnect.query(questionsDetailsQuery, function selectCb(err, results, fields) {
                    connectionDataSource.releaseConnectionPool(clientConnect);
                    if(err){
                        customlog.error(err);
                        callback();
                    }else{
                        for (var i in results) {
                            tenantId[i] = results[i].tenant_id;
                            questionId[i] = results[i].question_id;
                            questionName[i] = results[i].question_name;
                            displayName[i] = results[i].display_name;
                            weightage[i] = results[i].weightage;
                            auditType[i] = results[i].audit_type;
                            categoryType[i] = results[i].category_type;
                            isDefault[i] = results[i].is_default;
                            createdBy[i] = results[i].created_by;
                            createdDate[i] = results[i].created_date;
                            deletedDate[i] = results[i].deleted_date;
                            updatedBy[i] = results[i].updated_by;
                            updatedDate[i] = results[i].updated_date;
                        }
                        auditQuestionsForAndroidForAndroidObj.setTenantId(tenantId);
                        auditQuestionsForAndroidForAndroidObj.setQuestionId(questionId);
                        auditQuestionsForAndroidForAndroidObj.setQuestionName(questionName);
                        auditQuestionsForAndroidForAndroidObj.setDisplayName(questionName);
                        auditQuestionsForAndroidForAndroidObj.setWeightage(weightage);
                        auditQuestionsForAndroidForAndroidObj.setAuditType(auditType);
                        auditQuestionsForAndroidForAndroidObj.setCategoryType(categoryType);
                        auditQuestionsForAndroidForAndroidObj.setIsDefault(isDefault);
                        auditQuestionsForAndroidForAndroidObj.setCreatedBy(createdBy);
                        auditQuestionsForAndroidForAndroidObj.setCreatedDate(createdDate);
                        auditQuestionsForAndroidForAndroidObj.setDeletedDate(deletedDate);
                        auditQuestionsForAndroidForAndroidObj.setUpdatedBy(updatedBy);
                        auditQuestionsForAndroidForAndroidObj.setUpdatedDate(updatedDate);
                        callback(auditQuestionsForAndroidForAndroidObj);
                    }
                });
            }
        });
    },

    retreiveAndroidAuditAnswereSyncDetailsDatamodel : function (auditorId, callback) {
        var constantsObj = this.constants;
        var auditAnswereForAndroidRequire = require(auditAndroidDTO +"/auditAnswereForAndroid");

        var auditingAnswerId  = new Array();
        var auditingQuestionId   = new Array();
        var auditingId    = new Array();
        var answersTypeId   = new Array();
        var answerRemarks  = new Array();
        var createdDate = new Array();
        var updateDate = new Array();
        var auditTemplateId = new Array();
        var auditeeId = new Array();
        var auditAnswersForAndroidForAndroidObj = new auditAnswereForAndroidRequire();
        var answereDetailsQuery = "SELECT aas.auditing_answer_id,aas.auditing_question_id,aas.auditing_id,aas.answers_type_id,aas.answer_remarks,aas.created_date,aas.updated_date,aas.audit_template_id,aas.auditee_id FROM iklant_auditing ag,iklant_audit_template atp,iklant_audit_questions aqt,iklant_audit_answers aas WHERE "+
        "ag.audit_template_id=atp.audit_template_id AND aqt.question_id=aas.auditing_question_id AND ag.auditor_id="+auditorId+" AND ag.audit_status=160 GROUP BY aas.auditing_question_id";
        customlog.info("answereDetailsQuery AndroidQuery : " + answereDetailsQuery);
        connectionDataSource.getConnection(function (clientConnect) {
            if (answereDetailsQuery != "") {
                clientConnect.query(answereDetailsQuery, function selectCb(err, results, fields) {
                    connectionDataSource.releaseConnectionPool(clientConnect);
                    if(err){
                        customlog.error(err);
                        callback();
                    }else{
                        for (var i in results) {
                            auditingAnswerId[i] = results[i].auditing_answer_id;
                            auditingQuestionId[i] = results[i].auditing_question_id;
                            auditingId[i] = results[i].auditing_id;
                            answersTypeId[i] = results[i].answers_type_id;
                            answerRemarks[i] = results[i].answer_remarks;
                            createdDate[i] = results[i].created_date;
                            updateDate[i] = results[i].updated_date;
                            auditTemplateId[i]=results[i].audit_template_id;
                            auditeeId[i]=results[i].auditee_id;

                        }
                        auditAnswersForAndroidForAndroidObj.setAuditing_answere_id(auditingAnswerId);
                        auditAnswersForAndroidForAndroidObj.setAuditing_question_id(auditingQuestionId);
                        auditAnswersForAndroidForAndroidObj.setAuditing_id(auditingId);
                        auditAnswersForAndroidForAndroidObj.setAnswers_type_id(answersTypeId);
                        auditAnswersForAndroidForAndroidObj.setAnswer_remarks(answerRemarks);
                        auditAnswersForAndroidForAndroidObj.setCreated_date(createdDate);
                        auditAnswersForAndroidForAndroidObj.setUpdate_date(updateDate);
                        auditAnswersForAndroidForAndroidObj.setAudit_template_id(auditTemplateId);
                        auditAnswersForAndroidForAndroidObj.setAuditee_id(auditeeId);
                        callback(auditAnswersForAndroidForAndroidObj);
                    }
                });
            }
        });
    },

        retreiveAndroidAuditingSyncDetailsDatamodel: function (auditorId, callback) {
        var self = this;
        var constantsObj = this.constants;

            self.retreiveAndroidAuditingDetailsDatamodel(auditorId, function (auditingGroupForAndroidObj) {
                if(auditingGroupForAndroidObj != ""){
                            self.retreiveAndroidAuditeeSyncDetailsDatamodel(auditorId, function (auditeeDetailsForAndroidForAndroidObj) {
                                    self.retreiveAndroidCategorySyncDetailsDatamodel(auditorId, function (categoryDetailsForAndroidForAndroidObj) {
                                            self.retreiveAndroidAuditTemplateSyncDetailsDatamodel(auditorId,function (templateDetailsForAndroidForAndroidObj) {
                                                    self.retreiveAndroidAuditQuestionSyncDetailsDatamodel(auditorId,function (auditQuestionsForAndroidForAndroidObj) {
                                                        self.retreiveAndroidAuditAnswereSyncDetailsDatamodel(auditorId,function (auditAnswersForAndroidForAndroidObj){
                                                        callback(auditingGroupForAndroidObj, auditeeDetailsForAndroidForAndroidObj,categoryDetailsForAndroidForAndroidObj,
                                                            templateDetailsForAndroidForAndroidObj,auditQuestionsForAndroidForAndroidObj,auditAnswersForAndroidForAndroidObj);
                                                    });
                                                  });
                                            });
                                    });
                            });
                }/*else{
                    self.commonDataModel.retrieveLoanTypelistDataModel(tenant_id, function (loanTypeIdArray, loanTypeArray) {
                        self.retrieveAllDocTypeListSyncDataModel(tenant_id, function (allDocTypeForAndroidObj) {
                            callback(operationIdForRoleIdArray, "", loanTypeIdArray, loanTypeArray,"",allDocTypeForAndroidObj);
                        });
                    });
                }*/
            });

    },

    doAuditorSaveAndroidDataModel: function(auditingAnswerId,auditingQuestionId,auditingId,answersTypeId,answerRemarks,auditTemplateId,auditeeId,auditStatus,callback){
        console.log("doAuditorSaveAndroidDataMode");
        connectionDataSource.getConnection(function (clientConnect) {
            var selectQuery = "Select * from iklant_audit_answers where auditing_id = "+ auditingId + " and auditing_question_id = "+auditingQuestionId;
            console.log("doAuditorSaveAndroidDataMode selectQuery : "+selectQuery);
            clientConnect.query(selectQuery, function (err, result) {
                if (err) {
                    console.log('Answer Check user query Error ' + err);
                    connectionDataSource.releaseConnectionPool(clientConnect);
                    callback("failure");
                } else if (result.length > 0) {
                    console.log("result.length > 0");
                    var answerUpdateQuery = "UPDATE iklant_audit_answers SET  updated_date = NOW() + INTERVAL 5 HOUR + INTERVAL 30 MINUTE WHERE auditing_id = " + auditingId + " and auditing_question_id = "+auditingQuestionId;
                    console.log("doAuditorSaveAndroidDataMode answerUpdateQuery : "+answerUpdateQuery);
                    clientConnect.query(answerUpdateQuery,function (err) {
                            if (!err) {
                                connectionDataSource.releaseConnectionPool(clientConnect);
                                callback("success");
                            } else {
                                console.log(err);
                                connectionDataSource.releaseConnectionPool(clientConnect);
                                callback("failure");
                            }
                        });

                } else {
                    var query = "INSERT INTO iklant_audit_answers (auditing_question_id,auditing_id,answers_type_id,answer_remarks,created_date,updated_date,audit_template_id,auditee_id) " +
                        "VALUES(" + auditingQuestionId + ","+auditingId + ","+ answersTypeId + ","+answerRemarks +
                        ",NOW() + INTERVAL 5 HOUR + INTERVAL 30 MINUTE,NOW() + INTERVAL 5 HOUR + INTERVAL 30 MINUTE,"+auditTemplateId +","+auditeeId+ ")";
                            console.log("doAuditorSaveAndroidDataMode answerUpdateQuery : "+query);
                            clientConnect.query(query, function (err) {
                            if (!err) {
                                connectionDataSource.releaseConnectionPool(clientConnect);
                                callback("success");
                            } else {
                                console.log(err);
                                connectionDataSource.releaseConnectionPool(clientConnect);
                                callback("failure");
                            }
                        }
                    );
                }

            });
        });
    },

    doAuditingStatusUpdateDataModel :function(auditingId,auditStatus,callback){
        console.log("doAuditingStatusUpdateDataModel");
        connectionDataSource.getConnection(function (clientConnect) {
            var auditStatusUpdateQuesry = "update iklant_auditing SET audit_status = "+auditStatus+" WHERE auditing_id = " + auditingId ;
            clientConnect.query(auditStatusUpdateQuesry,
                function (err,result) {
                    connectionDataSource.releaseConnectionPool(clientConnect);
                    if (!err) {
                        callback("success");
                    } else {
                        console.log(err);
                        callback("failure");
                    }
                });
        });
    },
    getMailDetailsDataModel: function(auditTemplateId,auditingId,auditeeId,callback){
        var self = this;
        var emailId = new Array();
        connectionDataSource.getConnection(function (clientConnect) {
            var mailSendingQuery = "SELECT iac.`category_type_name`,ir.`role_name`,p.`display_name`,iaq.question_name,ilv.lookup_value,IFNULL(iaa.answer_remarks,'')AS remarks,iat.weightage,SUM(iat.weightage) AS totalWeighatage,DATE_FORMAT(ia.audit_due_from,'%Y/%m%/%d') AS audit_due_from,DATE_FORMAT(ia.audit_due_to,'%Y/%m%/%d') AS audit_due_to,io.office_name FROM iklant_audit_answers iaa "+
            " LEFT JOIN iklant_audit_questions iaq ON iaq.question_id = iaa.auditing_question_id "+
            " LEFT JOIN iklant_lookup_value ilv ON ilv.lookup_id = iaa.answers_type_id "+
            " LEFT JOIN iklant_audit_template iat ON iat.audit_question_id = iaa.auditing_question_id "+
            " LEFT JOIN `iklant_auditing` ia ON ia.`auditing_id` = iaa.`auditing_id` "+
            " LEFT JOIN iklant_office io ON io.office_id = ia.office_id "+
            " LEFT JOIN `personnel` p ON p.`personnel_id` = iaa.`auditee_id` "+
            " LEFT JOIN iklant_role ir ON ir.role_id = ia.audit_type_id "+
            " LEFT JOIN `iklant_audit_category` iac ON iac.`category_type_id` = ia.`audit_category_id` "+
            " WHERE iaa.audit_template_id = "+ auditTemplateId +" AND iaa.auditing_id = " + auditingId + " AND iaa.auditee_id = " + auditeeId + " GROUP BY iaa.auditing_question_id";
            customlog.info("mailSendingQuery "+mailSendingQuery);
            clientConnect.query(mailSendingQuery,function (err,result) {
                    if (!err) {
                        var mailQuery = "SELECT `email_id` FROM `iklant_users` iu LEFT JOIN `personnel_role` pr ON pr.`personnel_id` = iu.user_id WHERE pr.`role_id` = 13";
                        clientConnect.query(mailQuery,function(err,toMail){
                            connectionDataSource.releaseConnectionPool(clientConnect);
                            for (i in toMail){
                                emailId.push(toMail[i].email_id);
                            }
                            callback(result,emailId);
                        });
                    } else {
                        console.log(err);
                        connectionDataSource.releaseConnectionPool(clientConnect);
                        callback(result,emailId);
                    }
            });
        });
    }
};
