module.exports = areaManagementDataModel;

var path = require('path');
var rootPath = path.dirname(process.mainModule.filename);
var lookupEntityObj;

var dbTableName = require(path.join(rootPath,"properties.json"));

var connectionDataSource = require(path.join(rootPath,"app_modules/data_model/DataSource"));
var customlog = require(path.join(rootPath,"logger/loggerConfig.js"))('AreaManagementDataModel.js');

//Business Layer
function areaManagementDataModel(constants) {
    customlog.debug("Inside Area Management Data Access Layer");
    this.constants = constants;
}

areaManagementDataModel.prototype = {

    retrieveAreaDetailsDataModel: function (officeId, roleId, is_verified, selectedOperationId, callback) {
        var self = this;
        var areaCodeId = new Array();
        var areaCode = new Array();
        var areaName = new Array();
        var isVerified = new Array();
        var officeIds = new Array();
        var statusArray = new Array();
        var foNames = new Array();
        var foIds = new Array();
        var releaseRequest = new Array();
        var constantsObj = this.constants;
        var retrieveAreaCodeQuery = "SELECT iac.area_code_id,iac.area_code,iaqr.response,iac.is_verified, iac.office_id, iac.area_code_status,iu.user_id,iu.user_name,iac.release_request FROM " + dbTableName.iklantAreaCode + " iac " +
            "LEFT JOIN " + dbTableName.iklantAreaQuestionResponse + " iaqr ON iaqr.area_code_id = iac.area_code_id " +
            "LEFT JOIN " + dbTableName.iklantUsers + " iu ON iu.user_id = iac.assigned_to ";
        if(selectedOperationId == constantsObj.getAssignAreaOperationId()) {
            if (roleId == constantsObj.getBMroleId()) {
                retrieveAreaCodeQuery += " WHERE iac.area_code_status = 1 AND iaqr.question_id = 1 AND iac.office_id = " + officeId + " AND is_verified = 1 AND iac.assigned_to IS NULL";
            }
            else {
                retrieveAreaCodeQuery +=  " WHERE iac.area_code_status = 1 AND iaqr.question_id = 1 AND iac.office_id = " + officeId + " AND iac.release_request = 1";
            }
        }
        else{
            if(is_verified == 0){
                retrieveAreaCodeQuery += " WHERE iac.area_code_status = 1 AND iaqr.question_id = 1 AND iac.office_id = " + officeId + " AND iac.is_verified = " + is_verified;
            }
            else{
                retrieveAreaCodeQuery += " WHERE iaqr.question_id = 1 AND iac.office_id = " + officeId;
            }
        }

        retrieveAreaCodeQuery += " ORDER BY iac.area_code_id,iac.area_code";
        connectionDataSource.getConnection(function (clientConnect) {
            clientConnect.query(retrieveAreaCodeQuery, function (err, results, fields) {
                connectionDataSource.releaseConnectionPool(clientConnect);
                if (err) {
                    callback("failure");
                }
                else {
                    for (var i = 0; i < results.length; i++) {
                        areaCodeId[i] = results[i].area_code_id;
                        areaCode[i] = results[i].area_code;
                        areaName[i] = results[i].response;
                        isVerified[i] = results[i].is_verified;
                        officeIds[i] = results[i].office_id;
                        statusArray[i] = results[i].area_code_status;
                        releaseRequest[i] = results[i].release_request;
                        foIds[i] = results[i].user_id;
                        foNames[i] = results[i].user_name;
                    }
                    self.retrieveOperationDetailsForAreaMgmt(function(operationId, operationName){
                        callback("success", areaCodeId, areaCode, areaName, isVerified, officeIds, statusArray, operationId, operationName, foIds, foNames, releaseRequest);
                    });
                }
            });
        });
    },

    retrieveAreaQuestionDetailsDataModel: function (officeId, callback) {
        var self = this;
        var questionId = new Array();
        var questions = new Array();
        var description = new Array();
        var subQuestions = new Array();
        var subQuestionsId = new Array();
        var inputType = new Array();
        var areaCode = new Array();
        var retrieveQuestionsQuery = "SELECT iaq.id AS question_id,ile.entity_name AS question,iaq.description,oqt.description AS input_type "+
            "FROM "+dbTableName.iklantAreaQuestions+" iaq "+
            "LEFT JOIN "+dbTableName.iklantLookupEntity+" ile ON ile.entity_id = iaq.question_id "+
            "LEFT JOIN "+dbTableName.iklantQuestionsInputType+" oqt ON oqt.input_type_id = iaq.input_type ORDER BY iaq.id";

        connectionDataSource.getConnection(function (clientConnect) {
            clientConnect.query(retrieveQuestionsQuery, function (err, results, fields) {
                if (err) {
                    connectionDataSource.releaseConnectionPool(clientConnect);
                    callback("failure");
                }
                else {
                    for (var i = 0; i < results.length; i++) {
                        questionId[i] = results[i].question_id;
                        questions[i] = results[i].question;
                        description[i] = results[i].description;
                        inputType[i] = results[i].input_type;
                    }
                    var subQuestionsQuery = "SELECT iaq.id AS question_id,IFNULL(ilv.lookup_value,'') AS subQuestions "+
                        "FROM "+dbTableName.iklantAreaQuestions+" iaq JOIN "+dbTableName.iklantLookupValue+" ilv ON ilv.entity_id = iaq.question_id ORDER BY iaq.id"
                    clientConnect.query(subQuestionsQuery, function (err, result, fields) {
                        if (err) {
                            connectionDataSource.releaseConnectionPool(clientConnect);
                            callback("failure");
                        }
                        else {
                            for (var i = 0; i < result.length; i++) {
                                subQuestions[i] = result[i].subQuestions;
                                subQuestionsId[i] = result[i].question_id;
                            }
                            self.retrieveOperationDetailsForAreaMgmt(function (operationId, operationName) {
                                clientConnect.query("SELECT iaqr.response,iaq.area_code_id FROM iklant_area_questions_response iaqr LEFT JOIN iklant_area_code iaq ON iaq.area_code_id = iaqr.area_code_id WHERE iaqr.question_id = 1 AND iaq.office_id = "+officeId,
                                    function (err, results, fields) {
                                        connectionDataSource.releaseConnectionPool(clientConnect);
                                        if (err) {
                                            callback("failure");
                                        }
                                        else{
                                            for (var i = 0; i < results.length; i++) {
                                                areaCode[i] = results[i].response;
                                            }
                                            callback("success", questionId, questions, description, subQuestions, subQuestionsId, inputType, areaCode, operationId, operationName);
                                        }
                                    });
                            });
                        }
                    });
                }
            });
        });
    },

    retrieveOperationDetailsForAreaMgmt: function(callback) {
        var self = this;
        var operationId = new Array();
        var operationName = new Array();
        var retrieveOperationsQuery = "SELECT * FROM "+dbTableName.iklantOperation+" where operation_id IN(21,22,23)";

        connectionDataSource.getConnection(function (clientConnect) {
            clientConnect.query(retrieveOperationsQuery, function (err, results, fields) {
                connectionDataSource.releaseConnectionPool(clientConnect);
                if (err) {
                    callback("failure");
                }
                else {
                    var count = -1;
                    for (var i = 0; i < results.length; i++) {
                        operationId[i] = results[i].operation_id;
                        operationName[i] = results[i].operation_name;
                    }
                    callback(operationId, operationName);
                }
            });
        });
    },

    saveAreaDetailsDataModel: function (officeId, areaManagement, questionsId, subQuestionsId, callback) {
        var self = this;
        var area_code_id;
        connectionDataSource.getConnection(function (clientConnect) {
            var areaCodeQuery = "INSERT INTO "+dbTableName.iklantAreaCode+"(office_id) VALUES(" + officeId + ")";
            clientConnect.query(areaCodeQuery, function (err) {
                if (err) {
                    connectionDataSource.releaseConnectionPool(clientConnect);
                    callback("failure");
                }
                else {
                    clientConnect.query("SELECT MAX(area_code_id) AS area_code FROM "+dbTableName.iklantAreaCode+" WHERE office_id = " + officeId, function (error, result) {
                        if (error) {
                            connectionDataSource.releaseConnectionPool(clientConnect);
                            callback("failure");
                        }
                        else {
                            area_code_id = result[0].area_code;
                            var getLookupIdQuery = "SELECT ilv.lookup_id from "+dbTableName.iklantLookupValue+" ilv LEFT JOIN "+dbTableName.iklantAreaQuestions+" iaq ON iaq.question_id = ilv.entity_id WHERE iaq.id IN(" + subQuestionsId + ") ORDER BY iaq.id";
                            var lookupId = new Array();
                            var areaCreationQuery;
                            clientConnect.query(getLookupIdQuery, function (err, results) {
                                if (!err) {
                                    for (var j = 0; j < results.length; j++) {
                                        lookupId[j] = results[j].lookup_id;
                                    }
                                    for (var i = 0; i < questionsId.length; i++) {
                                        var count = 0;
                                        if (subQuestionsId.indexOf(questionsId[i]) > -1) {
                                            for (var j = 0; j < subQuestionsId.length; j++) {
                                                if (subQuestionsId[j] == questionsId[i]) {
                                                    if(questionsId[i] == 7 ){
                                                        j =(areaManagement[i] == '')?parseInt(j)+1:j;
                                                        areaCreationQuery = "INSERT INTO "+dbTableName.iklantAreaQuestionResponse+"(area_code_id, question_id, lookup_id, response) " +
                                                            "VALUES(" + area_code_id + ", " + questionsId[i] + ", " + lookupId[j] + ", '" + areaManagement[i] + "')";
                                                        j++;
                                                    }
                                                    else{
                                                        areaCreationQuery = "INSERT INTO "+dbTableName.iklantAreaQuestionResponse+"(area_code_id, question_id, lookup_id, response) " +
                                                            "VALUES(" + area_code_id + ", " + questionsId[i] + ", " + lookupId[j] + ", '" + areaManagement[i][count] + "')";
                                                    }
                                                    clientConnect.query(areaCreationQuery, function(err){
                                                        if(err){
                                                            connectionDataSource.releaseConnectionPool(clientConnect);
                                                            callback("failure");
                                                        }
                                                    });
                                                    count++;
                                                }
                                            }
                                        }
                                        else {
                                            areaCreationQuery = "INSERT INTO "+dbTableName.iklantAreaQuestionResponse+"(area_code_id, question_id, lookup_id, response) " +
                                                "VALUES(" + area_code_id + ", " + questionsId[i] + ", 0, '" + areaManagement[i] + "')";
                                            clientConnect.query(areaCreationQuery, function(err){
                                                if(err){
                                                    connectionDataSource.releaseConnectionPool(clientConnect);
                                                    callback("failure");
                                                }
                                            });
                                        }
                                    }
                                    connectionDataSource.releaseConnectionPool(clientConnect);
                                    callback('success');
                                }
                                else {
                                    connectionDataSource.releaseConnectionPool(clientConnect);
                                    callback("failure");
                                }
                            });
                        }
                    });
                }
            });
        });
    },

    updateAreaDetailsDataModel: function (officeId, areaManagement, questionsId, subQuestionsId, areaCode,callback) {
        var self = this;
        var area_code_id;
        connectionDataSource.getConnection(function (clientConnect) {
            area_code_id = areaCode;
            var deleteAreaDetailsQuery = "DELETE FROM "+dbTableName.iklantAreaQuestionResponse+" WHERE area_code_id = "+area_code_id;
            clientConnect.query(deleteAreaDetailsQuery, function (err, results) {
                if(!err) {
                    var getLookupIdQuery = "SELECT ilv.lookup_id from "+dbTableName.iklantLookupValue+" ilv LEFT JOIN "+dbTableName.iklantAreaQuestions+" iaq ON iaq.question_id = ilv.entity_id WHERE iaq.id IN(" + subQuestionsId + ") ORDER BY iaq.id";
                    var lookupId = new Array();
                    var areaCreationQuery;
                    clientConnect.query(getLookupIdQuery, function (err, results) {
                        if (!err) {
                            for (var j = 0; j < results.length; j++) {
                                lookupId[j] = results[j].lookup_id;
                            }
                            for (var i = 0; i < questionsId.length; i++) {
                                var count = 0;
                                if (subQuestionsId.indexOf(questionsId[i]) > -1) {
                                    for (var j = 0; j < subQuestionsId.length; j++) {
                                        if (subQuestionsId[j] == questionsId[i]) {
                                            if(questionsId[i] == 7 ){
                                                j =(areaManagement[i] == '')?parseInt(j)+1:j;
                                                areaCreationQuery = "INSERT INTO "+dbTableName.iklantAreaQuestionResponse+"(area_code_id, question_id, lookup_id, response) " +
                                                    "VALUES(" + area_code_id + ", " + questionsId[i] + ", " + lookupId[j] + ", '" + areaManagement[i] + "')";
                                                j++;
                                            }
                                            else{
                                                areaCreationQuery = "INSERT INTO "+dbTableName.iklantAreaQuestionResponse+"(area_code_id, question_id, lookup_id, response) " +
                                                    "VALUES(" + area_code_id + ", " + questionsId[i] + ", " + lookupId[j] + ", '" + areaManagement[i][count] + "')";
                                            }
                                            clientConnect.query(areaCreationQuery, function (err) {
                                                if (err) {
                                                    connectionDataSource.releaseConnectionPool(clientConnect);
                                                    callback("failure");
                                                }
                                            });
                                            count++;
                                        }
                                    }
                                }
                                else {
                                    areaCreationQuery = "INSERT INTO "+dbTableName.iklantAreaQuestionResponse+"(area_code_id, question_id, lookup_id, response) " +
                                        "VALUES(" + area_code_id + ", " + questionsId[i] + ", 0, '" + areaManagement[i] + "')";
                                    clientConnect.query(areaCreationQuery, function (err) {
                                        if (err) {
                                            connectionDataSource.releaseConnectionPool(clientConnect);
                                            callback("failure");
                                        }
                                    });
                                }
                            }
                            clientConnect.query("UPDATE "+dbTableName.iklantAreaCode+" SET area_code_status = 1 WHERE area_code_id = " + area_code_id + " AND office_id = "+officeId, function (err) {
                                if (!err) {
                                    connectionDataSource.releaseConnectionPool(clientConnect);
                                    callback('success');
                                }
                                else{
                                    connectionDataSource.releaseConnectionPool(clientConnect);
                                    callback("failure");
                                }
                            });
                        }
                        else {
                            connectionDataSource.releaseConnectionPool(clientConnect);
                            callback("failure");
                        }
                    });
                }
                else{
                    connectionDataSource.releaseConnectionPool(clientConnect);
                    callback("failure");
                }
            });
        });
    },

    retrieveAreaCodeDetailsDataModel: function(areaCodeId, officeId, callback) {
        var self = this;
        var areaCode = new Array();
        var retrieveAreaQuery = "SELECT iaqr.question_id,iaqr.lookup_id,iaqr.response, " +
            "ilv.lookup_value AS subQuestions,iaq.description,ipt.description AS input_type " +
            "FROM "+dbTableName.iklantAreaQuestionResponse+" iaqr  " +
            "LEFT JOIN "+dbTableName.iklantAreaQuestions+" iaq ON iaq.id = iaqr.question_id " +
            "LEFT JOIN "+dbTableName.iklantQuestionsInputType+" ipt ON ipt.input_type_id = iaq.input_type " +
            "LEFT JOIN "+dbTableName.iklantLookupValue+" ilv ON ilv.lookup_id = iaqr.lookup_id " +
            "WHERE iaqr.area_code_id = "+areaCodeId;
        connectionDataSource.getConnection(function (clientConnect) {
            clientConnect.query(retrieveAreaQuery, function (err, areaResults, fields) {
                if (err) {
                    connectionDataSource.releaseConnectionPool(clientConnect);
                    callback("failure");
                }
                else {
                    clientConnect.query("SELECT iaqr.response,iaq.area_code_id,iaq.area_code_status FROM iklant_area_questions_response iaqr LEFT JOIN iklant_area_code iaq ON iaq.area_code_id = iaqr.area_code_id WHERE iaqr.question_id = 1 AND iaqr.area_code_id NOT IN("+areaCodeId+") AND iaq.office_id = " + officeId,
                        function (err, results, fields) {
                            connectionDataSource.releaseConnectionPool(clientConnect);
                            if (err) {
                                callback("failure");
                            }
                            else{
                                var status = 0;
                                for (var i = 0; i < results.length; i++) {
                                    areaCode[i] = results[i].response;
                                    if(results[i].area_code_status){
                                        status = 1;
                                    }
                                }
                                callback(areaResults,areaCode,status);
                            }
                        });
                }
            });
        });
    },

    approveOrRejectAreaDataModel: function (areaCodeId, officeId, approveFlag, remarks, questionId, callback) {
        var self = this;
        var approveOrRejectAreaQuery;
        var updateResponse;
        questionId = (questionId != "")?questionId:16;
        var areaQuery = "SELECT MAX(area_code) AS area_code FROM "+dbTableName.iklantAreaCode+" WHERE office_id = " + officeId;
        connectionDataSource.getConnection(function (clientConnect) {
            clientConnect.query(areaQuery, function (err, result) {
                if (err) {
                    connectionDataSource.releaseConnectionPool(clientConnect);
                    callback("failure");
                }
                else {
                    var areaCode;
                    var areaCodeExtn = (officeId < 10) ? "000" + officeId : (officeId >= 10 && officeId < 100) ? "00" + officeId : "0" + officeId;
                    if (result[0].area_code) {
                        var maxAreaCode = parseInt(result[0].area_code.split("A-").pop());
                        areaCode = areaCodeExtn + ((maxAreaCode<9)?"-A-000"+(maxAreaCode+1):(maxAreaCode>9&& maxAreaCode<99)?"-A-00"+(maxAreaCode+1):"-A-0"+(maxAreaCode+1));
                    }
                    else {
                        areaCode = areaCodeExtn + "-A-000" + 1;
                    }
                    if (approveFlag == 1) {
                        approveOrRejectAreaQuery = "UPDATE "+dbTableName.iklantAreaCode+" SET is_verified = " + approveFlag + ", area_code = '" + areaCode + "'  WHERE area_code_id = " + areaCodeId + " AND office_id = " + officeId + "";
                    }
                    else {
                        approveOrRejectAreaQuery = "UPDATE "+dbTableName.iklantAreaCode+" SET area_code_status = 0 WHERE area_code_id = " + areaCodeId + " AND office_id = " + officeId + "";
                    }
                    updateResponse = "UPDATE "+dbTableName.iklantAreaQuestionResponse+" SET response = '" + remarks + "' WHERE area_code_id = " + areaCodeId + " AND question_id = " + questionId + "";
                    clientConnect.query(approveOrRejectAreaQuery, function (err) {
                        if (err) {
                            connectionDataSource.releaseConnectionPool(clientConnect);
                            callback("failure");
                        }
                        else {
                            clientConnect.query(updateResponse, function (err) {
                                connectionDataSource.releaseConnectionPool(clientConnect);
                                if (err) {
                                    callback("failure");
                                }
                                else {
                                    callback("success");
                                }
                            });
                        }
                    });
                }
            });
        });
    },

    assignOrReleaseAreaDataModel: function (areaCodes, fieldOfficerId, releaseFlag, roleId, existingFieldOfficerId, callback) {
        var self = this;
        var constantsObj = this.constants;
        var assignAreaQuery;
        if(roleId == constantsObj.getBMroleId()) {
            if (releaseFlag == 0) {
                assignAreaQuery = "UPDATE " + dbTableName.iklantAreaCode + " SET assigned_to = " + fieldOfficerId + " WHERE area_code_id  IN( " + areaCodes + ")";
            }
            else {
                assignAreaQuery = "UPDATE " + dbTableName.iklantAreaCode + " SET release_request = 1 WHERE area_code_id  = " + areaCodes;
            }
        }
        else{
            assignAreaQuery = "UPDATE " + dbTableName.iklantAreaCode + " SET release_request = 0,assigned_to = NULL WHERE area_code_id  = " + areaCodes;
        }
        connectionDataSource.getConnection(function (clientConnect) {
            clientConnect.query(assignAreaQuery, function (err) {
                if (err) {
                    connectionDataSource.releaseConnectionPool(clientConnect);
                    callback("failure");
                }
                else {
                    if (roleId == constantsObj.getBMroleId()) {
                        self.updateGroupsAndAreaTracking(roleId, releaseFlag, fieldOfficerId, areaCodes, existingFieldOfficerId, clientConnect,function(status) {
                            connectionDataSource.releaseConnectionPool(clientConnect);
                            callback(status);
                        });
                    }
                    else{
                        self.updateGroupsAndAreaTracking(roleId, releaseFlag, fieldOfficerId, areaCodes, existingFieldOfficerId, clientConnect,function(status){
                            connectionDataSource.releaseConnectionPool(clientConnect);
                            callback(status);
                        })
                    }
                }
            });
        });
    },
    updateGroupsAndAreaTracking: function (roleId, releaseFlag, fieldOfficerId, areaCodes, existingFieldOfficerId, clientConnect, callback) {
        var self = this;
        var constantsObj = this.constants;
        var areaTrackingQuery;
        if (roleId == constantsObj.getBMroleId()) {
            if(releaseFlag == 0) {
                var updateGroupsQuery = "UPDATE " + dbTableName.iklantProspectGroup + " SET assigned_to = " + fieldOfficerId + ",updated_date = NOW() WHERE area_code_id IN (" + areaCodes + ")";
                clientConnect.query(updateGroupsQuery, function (err) {
                    if (err) {
                        connectionDataSource.releaseConnectionPool(clientConnect);
                        callback("failure");
                    }
                    else {
                        var retrieveGroupsQuery = "SELECT imm.mifos_customer_id FROM iklant_mifos_mapping imm LEFT JOIN iklant_prospect_group ipg ON ipg.group_id = imm.group_id WHERE ipg.area_code_id IN(" + areaCodes + ")"
                        clientConnect.query(retrieveGroupsQuery, function (err, results) {
                            if (err) {
                                connectionDataSource.releaseConnectionPool(clientConnect);
                                callback("failure");
                            }
                            else {
                                if(results.length>0){
                                    var mifosCustomerId = new Array();
                                    for(var i=0;i<results.length;i++){
                                        mifosCustomerId[i] = results[i].mifos_customer_id;
                                    }
                                    var updateCustomerQuery = "UPDATE customer SET loan_officer_id = " + fieldOfficerId + ",updated_date = NOW() WHERE customer_id IN (" + mifosCustomerId + ")"
                                    clientConnect.query(updateCustomerQuery, function (error) {
                                        if (error) {
                                            connectionDataSource.releaseConnectionPool(clientConnect);
                                            callback("failure");
                                        }
                                    })
                                }
                            }
                        });
                    }
                });
                for (var i = 0; i < areaCodes.length; i++) {
                    areaTrackingQuery = "INSERT INTO " + dbTableName.iklantAreaTracking + "(area_code_id, field_officer_id, assigned_date) VALUES(" + areaCodes[i] + "," + fieldOfficerId + ",NOW())";
                    clientConnect.query(areaTrackingQuery, function (error) {
                        if (error) {
                            connectionDataSource.releaseConnectionPool(clientConnect);
                            callback("failure");
                        }
                    })
                }
            }
            callback("success");
        }
        else {
            areaTrackingQuery = "UPDATE " + dbTableName.iklantAreaTracking + " SET released_date = NOW() WHERE area_code_id = " + areaCodes + " AND field_officer_id = " + existingFieldOfficerId + " AND released_date IS NULL";
            clientConnect.query(areaTrackingQuery, function (error) {
                if (error) {
                    connectionDataSource.releaseConnectionPool(clientConnect);
                    callback("failure");
                }
                else {
                    callback("success");
                }
            })
        }
    }
}
