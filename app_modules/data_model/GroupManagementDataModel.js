module.exports = groupManagementDataModel;

var path = require('path');
var rootPath = path.dirname(process.mainModule.filename);
var dbTableName = require(path.join(rootPath,"properties.json"));
var fs = require('fs');
var connectionDataSource = require(path.join(rootPath,"app_modules/data_model/DataSource"));
var customLog = require(path.join(rootPath,"logger/loggerConfig.js"))('GroupManagementDataModel.js');
var commonDTO = path.join(rootPath,"app_modules/dto/common");
var groupManagementDTO = path.join(rootPath,"app_modules/dto/group_management");
var dateUtils = require(path.join(rootPath,"app_modules/utils/DateUtils"));

//Business Layer
function groupManagementDataModel(constants) {
    customLog.debug("Inside Group Management Data Access Layer");
    this.constants = constants;
}

groupManagementDataModel.prototype = {

    getKYCUploadStatusDataModel: function(groupId, callback){
        var self = this;
        var retrieveKYCStatusQuery =
            " SELECT  "+
                " `clientId`, "+
                "     SUM(CASE  "+
                "         WHEN dc.doc_type_id = 3 THEN "+
                "             CASE `clientId` "+
                "             WHEN 'client_id' THEN dc.client_id "+
                "         END "+
                "         ELSE  '' "+
                "     END)   AS 'ApplicationForm', "+
                "     SUM(CASE  "+
                "         WHEN dc.doc_type_id = 5 THEN "+
                "             CASE `clientId` "+
                "             WHEN 'client_id' THEN dc.client_id "+
                "         END "+
                "         ELSE  '' "+
                "     END)   AS 'Photo', "+
                "     SUM(CASE  "+
                "         WHEN dc.doc_type_id = 6 THEN "+
                "             CASE `clientId` "+
                "             WHEN 'client_id' THEN dc.client_id "+
                "         END "+
                "         ELSE  '' "+
                "     END)   AS 'MemID', "+
                "     SUM(CASE  "+
                "         WHEN dc.doc_type_id = 7 THEN "+
                "             CASE `clientId` "+
                "             WHEN 'client_id' THEN dc.client_id "+
                "         END "+
                "         ELSE  '' "+
                "     END)   AS 'MemAddress', "+
                "     SUM(CASE  "+
                "         WHEN dc.doc_type_id = 8 THEN "+
                "             CASE `clientId` "+
                "             WHEN 'client_id' THEN dc.client_id "+
                "         END "+
                "         ELSE  '' "+
                "     END)   AS 'GuarantorID', "+
                "     SUM(CASE  "+
                "         WHEN dc.doc_type_id = 9 THEN "+
                "             CASE `clientId` "+
                "             WHEN 'client_id' THEN dc.client_id "+
                "         END "+
                "         ELSE  '' "+
                "     END)   AS 'GuarantorAddress', "+
                "     SUM(CASE  "+
                "         WHEN dc.doc_type_id = 12 THEN "+
                "             CASE `clientId` "+
                "             WHEN 'client_id' THEN dc.client_id "+
                "         END "+
                "         ELSE  '' "+
                "     END)   AS 'OwnHouseReceipt' "+
                "  "+
                "     FROM "+
                "      (SELECT * "+
                " 	 FROM "+dbTableName.iklantClientDoc +"  "+
                " 	 WHERE client_id IN (SELECT client_id FROM "+dbTableName.iklantProspectClient +" WHERE group_id = "+groupId+") "+
                " 	 GROUP BY client_id,doc_type_id)dc "+
                "  INNER JOIN ( "+
                "        SELECT 'client_id' AS `clientId` "+
                "       ) AS value_columns "+
                "     GROUP BY `clientId`,dc.client_id ";
        connectionDataSource.getConnection(function (clientConnect) {
            clientConnect.query(retrieveKYCStatusQuery, function (err, results, fields) {
                connectionDataSource.releaseConnectionPool(clientConnect);
                if (err) {
                    customLog.error(err);
                }
                callback(results);
            });
        });
    },

    moveForDataEntryDataModel: function(groupId, callback){
        var self = this;
        var moveForDEQuery = " UPDATE `"+dbTableName.iklantProspectGroup+"` SET `status_id`=3 WHERE `group_id`="+groupId;
        connectionDataSource.getConnection(function (clientConnect) {
            clientConnect.query(moveForDEQuery, function (err, results, fields) {
                connectionDataSource.releaseConnectionPool(clientConnect);
                if (err) {
                    callback("failure");
                    customLog.error(err);
                }
                else{
                    callback("success");
                }
            });
        });
    },

    getGroupRecognitionTestDetailsDataModel: function(groupId,callback) {
        var self = this;
        var categoryId = new Array();
        var categoryDesc = new Array();
        var questionCategoryId = new Array();
        var question = new Array();
        var questionId = new Array();
        var constantsObj = this.constants;
        connectionDataSource.getConnection(function (clientConnect) {
            var retrieveQuery = "SELECT c_id, `description` FROM `" + dbTableName.iklantGrtCategories + "` ORDER BY c_id ASC";
            clientConnect.query(retrieveQuery, function (err, result) {
                if (err) {
                    customLog.info(retrieveQuery);
                    connectionDataSource.releaseConnectionPool(clientConnect);
                    callback("failure");
                } else {
                    for (var i = 0; i < result.length; i++) {
                        categoryId[i] = result[i].c_id;
                        categoryDesc[i] = result[i].description;
                    }
                    retrieveQuery = "SELECT `pt_id`,`category`,`check_point_ques` FROM `" + dbTableName.iklantGrtCheckPts + "` ORDER BY category ASC";
                    clientConnect.query(retrieveQuery, function (err, result) {
                        if (err) {
                            customLog.info(retrieveQuery);
                            connectionDataSource.releaseConnectionPool(clientConnect);
                            callback("failure");
                        } else {
                            for (var i = 0; i < result.length; i++) {
                                questionCategoryId[i] = result[i].category;
                                question[i] = result[i].check_point_ques;
                                questionId[i] = result[i].pt_id;
                            }
                            retrieveQuery = "SELECT COUNT(*) AS no_of_clients FROM " + dbTableName.iklantProspectClient + " WHERE group_id = "+groupId+" AND `status_id`="+constantsObj.getAppraisedStatus();
                            customLog.info(retrieveQuery);
                            clientConnect.query(retrieveQuery, function (err, result) {
                                connectionDataSource.releaseConnectionPool(clientConnect);
                                if (err) {
                                    customLog.error("error in "+retrieveQuery);
                                    callback("failure");
                                } else {
                                    var noOfClients = "";
                                    if(result.length > 0)
                                        noOfClients = result[0].no_of_clients;
                                    customLog.info("noOfClients in appraisal state: "+noOfClients);
                                    callback('success',categoryId,categoryDesc,questionCategoryId,question,questionId,noOfClients);
                                }
                            });
                        }
                    });
                }
            });
        });
    },

    insertRemarksForGRT: function(connectionDataSource,clientConnect,groupId,remarks,totalRating,isMoved,callback) {
        var remarksQuery = "INSERT INTO `" + dbTableName.iklantGrtGroupRemarks + "` (`group_id`,`created_date`,`remarks`,`total_rate`) VALUES ("+groupId+",NOW() + INTERVAL 5 HOUR + INTERVAL 30 MINUTE,'"+remarks+"',"+totalRating+");"
        customLog.info(remarksQuery);
        clientConnect.query(remarksQuery, function (err, result) {
            connectionDataSource.releaseConnectionPool(clientConnect);
            if (err) {
                callback("failure");
            } else {
                callback("success", isMoved);
            }
        });
    },

    saveRatingForGRTDataModel: function(groupId,questionIdDetails,createdBy,checkedOrNotDetails,totalRating,remarks, callback) {
        var self = this;
        var saveRatingQuery;
        var constantsObj = this.constants;
        var groupStatus;
        if(remarks == undefined){
            remarks=''
        }
        customLog.info(totalRating);
        connectionDataSource.getConnection(function (clientConnect) {
            /**
             *  As per client requirement, storing each question's answer is not required.
             *  But it might be used in the future.
             */

            /*for(var i=0; i<questionIdDetails.length; i++){
             saveRatingQuery = "INSERT INTO `" + dbTableName.iklant_grt_group_ratings + "` (`group_id`,`pt_id`,`created_by`,`response`,`created_date`) " +
             "VALUES ("+groupId+", "+questionIdDetails[i]+","+createdBy+","+checkedOrNotDetails[i]+",NOW() + INTERVAL 5 HOUR + INTERVAL 30 MINUTE)";
             customlog.info(saveRatingQuery);
             clientConnect.query(saveRatingQuery, function (err, result) {
             if (err) {
             callback("failure");
             }
             });
             }*/

            if(totalRating > constantsObj.getMinimumRatingRequiredForGroupRecognitionTest()){
                var updateQuery = "UPDATE `" + dbTableName.iklantProspectGroup + "` SET `status_id` = "+constantsObj.getGroupRecognitionTested()+" WHERE `group_id` = "+groupId+" AND `status_id` ="+constantsObj.getAppraisedStatus();
                clientConnect.query(updateQuery, function (err, result) {
                    if (err) {
                        connectionDataSource.releaseConnectionPool(clientConnect);
                        callback("failure");
                    } else {
                        updateQuery = "UPDATE `" + dbTableName.iklantProspectClient + "` SET `status_id` = "+constantsObj.getGroupRecognitionTested()+" WHERE `group_id` = "+groupId+" AND `status_id` ="+constantsObj.getAppraisedStatus();
                        clientConnect.query(updateQuery, function (err, result) {
                            if (err) {
                                connectionDataSource.releaseConnectionPool(clientConnect);
                                callback("failure");
                            } else {
                                self.insertRemarksForGRT(connectionDataSource,clientConnect,groupId,remarks,totalRating,1,callback);
                            }
                        });
                    }
                });
            } else {
                self.insertRemarksForGRT(connectionDataSource,clientConnect,groupId,remarks,totalRating,0,callback);
            }
        });
    },

    getClientNamesForLoanSanction: function (groupId, mifosCustomerId, callback) {
        var self=this;
        var constantsObj = this.constants;
        var clientNameArray = new Array();
        var clientIdArray = new Array();
        var subLeaderNameArray = new Array();
        var clientCodeArray = new Array();
        var groupNameForLoanSanction;
        var thisclientId = 0;
        var disbDate;
        var globalAccountNum;

        var retrieveClientListQuery = "SELECT pg.group_name,ipc.client_id,ipc.client_name,ipc.client_global_number " +
            " FROM iklant_prospect_client ipc "+
            "INNER JOIN iklant_mifos_mapping imm ON imm.group_id = ipc.group_id "+
            "INNER JOIN iklant_prospect_group pg ON pg.group_id = ipc.group_id "+
            "INNER JOIN account acc ON acc.customer_id = imm.mifos_client_customer_id "+
            "INNER JOIN loan_account la ON la.account_id = acc.account_id "+
            "WHERE la.parent_account_id = (SELECT MAX(account_id) FROM account WHERE customer_id = "+mifosCustomerId+" GROUP BY customer_id) " +
            "AND mifos_customer_id = "+mifosCustomerId+" AND ipc.status_id = " + constantsObj.getAuthorizedStatus()+" GROUP BY ipc.client_id";
        customLog.info("retrieveClientListQuery : " + retrieveClientListQuery);
        connectionDataSource.getConnection(function (clientConnect) {
            clientConnect.query(retrieveClientListQuery, function selectCb(err, results, fields) {
                if (err) {
                    connectionDataSource.releaseConnectionPool(clientConnect);
                    customLog.error(err);
                } else {
                    var subLeaderQuery = " SELECT sub_leader_global_number,client_name FROM iklant_prospect_client pc WHERE group_id = "+groupId+" AND sub_leader_global_number IS NOT NULL  AND pc.status_id NOT IN ("+constantsObj.getRejectedPriliminaryVerification()+","+constantsObj.getRejectedAppraisal()+","+constantsObj.getRejectedFieldVerification()+","+constantsObj.getRejectedLoanSanction()+","+constantsObj.getRejectedCreditBureauAnalysisStatusId()+","+
                        constantsObj.getRejectedInNextLoanPreCheck()+","+constantsObj.getRejectedWhileIdleGroupsStatusId()+")";
                    clientConnect.query(subLeaderQuery, function selectCb(error, leaderResults, fields) {
                        if(error){
                            connectionDataSource.releaseConnectionPool(clientConnect);
                            customLog.error(err);
                        } else{
                            for (var i in results) {
                                var fieldName = results[i];
                                groupNameForLoanSanction = fieldName.group_name;
                                var clientname = fieldName.client_name;
                                var clientId = fieldName.client_id;
                                clientNameArray.push(clientname);
                                clientIdArray.push(clientId);
                                clientCodeArray.push(fieldName.client_global_number);
                                var subLeader = "";
                                for (var j in leaderResults) {
                                    var clientGlobalCode = fieldName.client_global_number;
                                    if(clientGlobalCode.match(leaderResults[j].sub_leader_global_number)){
                                        subLeader = leaderResults[j].client_name;
                                    }
                                }
                                subLeaderNameArray.push(subLeader);
                            }
                            //client.query("USE " + mifosDB);
                            //Existing Query
                            //var retrieveProductCategoryQuery = "SELECT prd_offering_id,prd_offering_name FROM prd_offering";
                            //Modified above query to retrieve corresponding mifoscustomerId's loanProduct
                            var retrieveProductCategoryQuery = "SELECT prd_offering_id,prd_offering_name FROM prd_offering " +
                                "WHERE prd_offering_id= (SELECT MAX(prd_offering_id) FROM loan_account lo " +
                                "INNER JOIN account ac ON lo.account_id = ac.account_id INNER JOIN customer cu ON cu.customer_id = ac.customer_id " +
                                "WHERE cu.customer_id=" + mifosCustomerId + ")";

                            var productCategoryId = new Array();
                            var ProductCategoryType = new Array();
                            customLog.info("retrieveProductCategoryQuery" + retrieveProductCategoryQuery);
                            clientConnect.query(retrieveProductCategoryQuery,function selectCb(err, results, fields) {
                                if (err) {
                                    connectionDataSource.releaseConnectionPool(clientConnect);
                                    customLog.error(err);
                                } else {
                                    for (var i in results) {
                                        var fieldName = results[i];
                                        productCategoryId[i] = fieldName.prd_offering_id;
                                        ProductCategoryType[i] = fieldName.prd_offering_name;
                                    }
                                }
                                customLog.info("productCategoryId[i]" + productCategoryId);
                                customLog.info("ProductCategoryType[i]" + ProductCategoryType);
                                var disbAmount, interestRateValue, recurrenceType;
                                var disbQuery = "SELECT `disbursement_date`,a.global_account_num,la.loan_amount,la.interest_rate,rt.recurrence_name FROM `loan_account` la " +
                                    "INNER JOIN account a ON la.account_id = a.account_id INNER JOIN recurrence_detail rd ON rd.meeting_id = la.meeting_id " +
                                    "INNER JOIN recurrence_type rt ON rt.recurrence_id = rd.recurrence_id WHERE  a.customer_id = " + mifosCustomerId + " AND account_type_id = 1 AND a.account_state_id IN (5,9) order by a.account_id desc";
                                clientConnect.query(disbQuery,function selectCb(err, results, fields) {
                                    connectionDataSource.releaseConnectionPool(clientConnect);
                                    if (err) {
                                        customLog.error(err);
                                    } else {
                                        if(results.length>0){
                                            disbDate = results[0].disbursement_date;
                                            globalAccountNum = results[0].global_account_num;
                                            disbAmount = results[0].loan_amount;
                                            interestRateValue = results[0].interest_rate;
                                            recurrenceType = results[0].recurrence_name;
                                            callback(groupId, thisclientId, clientNameArray, groupNameForLoanSanction, clientIdArray,
                                                productCategoryId, ProductCategoryType, disbDate, globalAccountNum, disbAmount, interestRateValue, recurrenceType,subLeaderNameArray,clientCodeArray);
                                        }
                                        else{
                                            callback(groupId, thisclientId, clientNameArray, groupNameForLoanSanction, clientIdArray,
                                                productCategoryId, ProductCategoryType, disbDate, globalAccountNum, disbAmount, interestRateValue, recurrenceType,subLeaderNameArray,clientCodeArray);
                                        }
                                    }
                                });
                            });
                        }
                    });
                }
            });
        });
    },

    getClientNamesForRejectedGroups: function (groupId, callback) {
        var self=this;
        var constantsObj = this.constants;
        var clientNameArray = new Array();
        var clientIdArray = new Array();
        var groupNameForRejectedGroups;
        var rejectedStage;
        var centername;
        var active_clients;
        var thisclientId = 0;
        var retrieveClientListForRejectedGroups = "SELECT gp.*,ac.* FROM " +
            "(SELECT pg.group_name,pc.client_id,pc.client_name,ps.status_desc, " +
            "pg.center_name,pg.group_id FROM "+dbTableName.iklantProspectGroup+" pg " +
            "LEFT JOIN "+dbTableName.iklantProspectClient+" pc ON pc.group_id = pg.group_id  " +
            "INNER JOIN "+dbTableName.iklantProspectStatus+" ps ON ps.status_id = pg.status_id " +
            "WHERE pg.group_id = " + groupId + " " +
            /*"and pc.status_id "+
             "NOT IN("+constantsObj.getRejectedCreditBureauAnalysisStatusId()+") "+*/
            "GROUP BY pc.client_id)gp " +
            "LEFT JOIN " +
            "(SELECT COUNT(pc.client_id) AS active_clients ,pc.group_id  FROM "+dbTableName.iklantProspectClient+" pc " +
            "INNER JOIN "+dbTableName.iklantProspectGroup+" pg ON pg.group_id = pc.group_id " +
            "WHERE pc.status_id NOT IN (" + constantsObj.getRejectedPriliminaryVerification() + ", " +
            "" + constantsObj.getRejectedCreditBureauAnalysisStatusId() + ", " +
            "" + constantsObj.getRejectedFieldVerification() + "," + constantsObj.getRejectedAppraisal() + ") " +
            "GROUP BY pc.group_id) ac ON " +
            "ac.group_id = gp.group_id";

        customLog.info("retrieveClientListForRejectedGroups : " + retrieveClientListForRejectedGroups);
        connectionDataSource.getConnection(function (clientConnect) {
                clientConnect.query(retrieveClientListForRejectedGroups,
                    function selectCb(err, results, fields) {
                        connectionDataSource.releaseConnectionPool(clientConnect);
                        if (err) {
                            customLog.error(err);
                        } else {
                            for (var i in results) {
                                var fieldName = results[i];
                                groupNameForRejectedGroups = fieldName.group_name;
                                var clientname = fieldName.client_name;
                                var clientId = fieldName.client_id;
                                centername = fieldName.center_name;
                                rejectedStage = fieldName.status_desc;
                                active_clients = fieldName.active_clients;
                                clientNameArray.push(clientname);
                                clientIdArray.push(clientId);
                            }
                            callback(thisclientId, groupNameForRejectedGroups, clientNameArray, clientIdArray, rejectedStage, centername, active_clients);
                        }

                    }
                );
            }
        );
    },

    updateRejectedClientStatus: function(groupId, clientId, clientStatus, roleId, remarksForReintiate, clientConnect, callback){
        var self=this;
        var constantsObj = this.constants;
        if(roleId == constantsObj.getSMHroleId()) {
            var reinitiateClientQuery = "UPDATE " + dbTableName.iklantRejectedClientStatus + " SET is_rm_reinitiated = 1 " +
                "WHERE group_id = " + groupId + " AND client_id = " + clientId;
        }
        else{
            var reinitiateClientQuery = "INSERT INTO " + dbTableName.iklantRejectedClientStatus + " (`group_id`,`client_id`,`rejected_status_id`," +
                "`is_bm_reinitiated`) VALUES (" + groupId + "," + clientId + "," + clientStatus + ",1);";
        }
        if(clientConnect !=null){
            clientConnect.query(reinitiateClientQuery, function postCreate(err) {
                if (err) {
                    clientConnect.rollback(function(){
                        customLog.error(err);
                        callback();
                    });
                }
                else {
                    callback();
                }
            });
        }
    },

    reintiateClientDataModel: function (tenantId, clientId, remarksForReintiate, groupStatusID, clientStatus, groupId, roleId, callback) {
        var self=this;
        var constantsObj = this.constants;
        var preliminaryVerified = constantsObj.getPreliminaryVerified(); //2
        var preliminaryRejected = constantsObj.getRejectedPriliminaryVerification(); //10
        var fieldVerified = constantsObj.getFieldVerified(); //6
        var fieldRejected = constantsObj.getRejectedFieldVerification(); //11
        var appraisalRejected = constantsObj.getRejectedAppraisal(); //12
        var appraisedStatus = constantsObj.getAppraisedStatus();//7
        var creditBureauAnalysed = constantsObj.getCreditBureauAnalysedStatus(); //5
        var creditBureauRejected = constantsObj.getRejectedCreditBureauAnalysisStatusId(); //17

        var reinitiatedStatusDisplay;
        if (groupStatusID == preliminaryVerified) {
            reinitiatedStatusDisplay = "Client Reintiated Succesfully and Moved To KYC Uploading";
        } else if (groupStatusID == constantsObj.getFieldVerified()) {
            reinitiatedStatusDisplay = "Client Reintiated Succesfully and Moved To Appraisal";
        } else if (groupStatusID == constantsObj.getAppraisedStatus()) {
            reinitiatedStatusDisplay = "Client Reintiated Succesfully  and Moved To Authorization";
        } else if (groupStatusID == constantsObj.getCreditBureauAnalysedStatus()) {
            reinitiatedStatusDisplay = "Client Reintiated Succesfully  and Moved To Assign FO";
        } else if (groupStatusID == constantsObj.getAssignedFO()) {
            reinitiatedStatusDisplay = "Client Reintiated Succesfully and Moved To Field Verification";
        } else if(groupStatusID == constantsObj.getPreliminaryVerified()){
            reinitiatedStatusDisplay = "Client Reintiated Succesfully  and Moved To KYC uploading";
        } else if(groupStatusID == constantsObj.getDataVerificationOperationId()){
            reinitiatedStatusDisplay = "Client Reintiated Succesfully  and Moved To Credit bureau analysis";
        } else{
            reinitiatedStatusDisplay = "Client Reintiated Succesfully  and Moved To Group recognition test";
        }

        connectionDataSource.getConnection(function (clientConnect) {
            clientConnect.beginTransaction(function(err){
               if(err){
                   customLog.error(err);
               }
                if(roleId == constantsObj.getSMHroleId()) {
                    if (groupStatusID == fieldVerified) {
                        var reintiateClientQuery = "UPDATE " + dbTableName.iklantProspectClient + " pc " +
                            "SET pc.status_id = IF(pc.status_id=" + preliminaryRejected + "," + preliminaryVerified + ", " +
                            "IF(pc.status_id=" + fieldRejected + "," + fieldVerified + ", " +
                            "IF(pc.status_id=" + creditBureauRejected + "," + fieldVerified + ", " +
                            "IF(pc.status_id=" + appraisalRejected + "," + fieldVerified + ", pc.status_id)))), " +
                            "pc.is_overdue = " + constantsObj.getActiveIndicatorFalse() + ", " +
                            "remarks_for_reintiate = '" + remarksForReintiate + "', " +
                            "pc.updated_date = NOW() + INTERVAL 5 HOUR + INTERVAL 30 MINUTE WHERE  pc.client_id = " + clientId + "";
                        customLog.info("reintiateClientQuery in if" + reintiateClientQuery);
                        if(clientConnect !=null){
                            clientConnect.query(reintiateClientQuery, function postCreate(err) {
                                if (err) {
                                    clientConnect.rollback(function(){
                                        connectionDataSource.releaseConnectionPool(clientConnect);
                                        customLog.error(err);
                                        clientConnect = null;
                                    });
                                }
                                else{
                                    self.updateRejectedClientStatus(groupId, clientId, clientStatus, roleId, remarksForReintiate, clientConnect, function(){
                                        clientConnect.commit(function(err){
                                           if(err){
                                               clientConnect.rollback(function(){

                                               });
                                           }
                                            callback(reinitiatedStatusDisplay);
                                        });
                                    });
                                }
                            });
                        }
                    } else {
                        var reintiateClientQuery = "UPDATE " + dbTableName.iklantProspectClient + " pc " +
                            "SET pc.status_id = IF(pc.status_id=" + preliminaryRejected + "," + preliminaryVerified + ", " +
                            "IF(pc.status_id=" + fieldRejected + "," + fieldVerified + ", " +
                            "IF(pc.status_id=" + appraisalRejected + "," + appraisedStatus + ", " +
                            "IF(pc.status_id=" + creditBureauRejected + "," + creditBureauAnalysed + ", " +
                            "IF(pc.status_id=" + constantsObj.getRejectedInNextLoanPreCheck() + "," + preliminaryVerified + ", " +
                            "IF(pc.status_id=" + constantsObj.getRejectedWhileIdleGroupsStatusId() + "," + creditBureauRejected + ",pc.status_id)))))), " +
                            "pc.is_overdue=" + constantsObj.getActiveIndicatorFalse() + ", " +
                            "remarks_for_reintiate = '" + remarksForReintiate + "', " +
                            "pc.updated_date = NOW() + INTERVAL 5 HOUR + INTERVAL 30 MINUTE WHERE  pc.client_id = " + clientId + "";
                        customLog.info("reintiateClientQuery in else" + reintiateClientQuery);
                        if(clientConnect !=null){
                            clientConnect.query(reintiateClientQuery, function postCreate(err) {
                                if (err) {
                                    clientConnect.rollback(function(){
                                        connectionDataSource.releaseConnectionPool(clientConnect);
                                        customLog.error(err);
                                        clientConnect = null;
                                    });
                                }
                                else{
                                    self.updateRejectedClientStatus(groupId, clientId, clientStatus, roleId, remarksForReintiate, clientConnect, function(){
                                        clientConnect.commit(function(err){
                                            if(err){
                                                clientConnect.rollback(function(){

                                                });
                                            }
                                            connectionDataSource.releaseConnectionPool(clientConnect);
                                            callback(reinitiatedStatusDisplay);
                                        });

                                    })
                                }
                            });
                        }
                    }
                }
                else{
                    self.updateRejectedClientStatus(groupId, clientId, clientStatus, roleId, remarksForReintiate, clientConnect, function(){
                        var reintiateClientQuery = "UPDATE " + dbTableName.iklantProspectClient + " pc " +
                            "SET remarks_for_reintiate = '" + remarksForReintiate + "', " +
                            "pc.updated_date = NOW() + INTERVAL 5 HOUR + INTERVAL 30 MINUTE WHERE  pc.client_id = " + clientId + "";
                        if(clientConnect !=null){
                            clientConnect.query(reintiateClientQuery, function postCreate(err) {
                                if (err) {
                                    clientConnect.rollback(function(){
                                        connectionDataSource.releaseConnectionPool(clientConnect);
                                        customLog.error(err);
                                        clientConnect = null;
                                    });
                                }
                                else {
                                    clientConnect.commit(function(err){
                                        if(err){
                                            clientConnect.rollback(function(){

                                            });
                                        }
                                        connectionDataSource.releaseConnectionPool(clientConnect);
                                        callback("Client re-initiated & Moved to Regional Manager approval");
                                    });
                                }
                            });
                        }
                    })
                }
            });
        });
    },

    populateGroupsDataModel: function (tenantId, officeId, userId, statusid, callback) {
        var self=this;
        var constantsObj = this.constants;
        var groupNameArray = new Array();
        var centerNameArray = new Array();
        connectionDataSource.getConnection(function (clientConnect) {
            if (statusid == constantsObj.getNewGroup() || statusid == constantsObj.getPreliminaryVerified() ) {
                var retrievePopulateGroupsQuery = "SELECT group_name,center_name FROM "+dbTableName.iklantProspectGroup+" " +
                    "WHERE office_id =" + officeId + " AND created_by =" + userId + " " +
                    "AND status_id = " + statusid + " ";
                clientConnect.query(retrievePopulateGroupsQuery, function selectCb(err, results, fields) {
                    connectionDataSource.releaseConnectionPool(clientConnect);
                    customLog.info(retrievePopulateGroupsQuery);
                    if (err) {
                        customLog.error(err);
                    } else {
                        for (var i in results) {
                            groupNameArray[i] = results[i].group_name;
                            centerNameArray[i] = results[i].center_name;
                        }
                        callback(groupNameArray, centerNameArray);
                    }
                });
            }else if (statusid == constantsObj.getAssignedFO()) {
                var retrievePopulateGroupsQuery = "SELECT group_name,center_name FROM "+dbTableName.iklantProspectGroup+" " +
                    "WHERE office_id =" + officeId + " AND assigned_to =" + userId + " " +
                    "AND status_id = " + statusid + " ";
                clientConnect.query(retrievePopulateGroupsQuery, function selectCb(err, results, fields) {
                    customLog.info(retrievePopulateGroupsQuery);
                    connectionDataSource.releaseConnectionPool(clientConnect);
                    if (err) {
                        customLog.error(err);
                    } else {
                        for (var i in results) {
                            groupNameArray[i] = results[i].group_name;
                            centerNameArray[i] = results[i].center_name;
                        }
                        callback(groupNameArray, centerNameArray);
                    }
                });
            }else {
                var retrievePopulateGroupsQuery = "SELECT group_name,center_name FROM "+dbTableName.iklantProspectGroup+" " +
                    "WHERE office_id =" + officeId + " AND status_id IN(" + statusid + ")  ";
                clientConnect.query(retrievePopulateGroupsQuery, function selectCb(err, results, fields) {
                    connectionDataSource.releaseConnectionPool(clientConnect);
                    if (err) {
                        customLog.error(err);
                    } else {
                        for (var i in results) {
                            groupNameArray[i] = results[i].group_name;
                            centerNameArray[i] = results[i].center_name;
                        }
                        callback(groupNameArray, centerNameArray);
                    }
                });
            }
        });
    },

    populateRejectedGroupsDataModel: function (tenantId, officeId, userId, statusid, callback) {
        var self=this;
        var constantsObj = this.constants;
        var groupNameArray = new Array();
        var centerNameArray = new Array();
        var statusDescArray = new Array();
        var status = new Array();
        var retrievePopulateGroupsQuery = "SELECT pg.group_name,pg.center_name,ps.status_desc FROM "+dbTableName.iklantProspectGroup+" pg " +
            "INNER JOIN "+dbTableName.iklantProspectStatus+" ps ON ps.status_id = pg.status_id " +
            "WHERE pg.office_id =" + officeId + " AND pg.created_by = " + userId + " AND pg.status_id IN " ;
        if(statusid == 0){
            retrievePopulateGroupsQuery += "(" + constantsObj.getRejectedPriliminaryVerification() + ", " +
            "" + constantsObj.getRejectedFieldVerification() + "," + constantsObj.getRejectedAppraisal() + ", " + constantsObj.getRejectedLoanSanction() +", "+
            "" + constantsObj.getRejectedCreditBureauAnalysisStatusId() + ")";
        }
        if(statusid == 1){
            retrievePopulateGroupsQuery += "(" + constantsObj.getCreditBureauAnalysedStatus() + ", " +
                "" + constantsObj.getAssignedFO() + "," + constantsObj.getFieldVerified() + ", " + constantsObj.getAppraisedStatus() +", "+
                "" + constantsObj.getGroupRecognitionTested() + ","+ constantsObj.getAuthorizedStatus()+") and pg.is_idle =1";
        }
        connectionDataSource.getConnection(function (clientConnect) {
            clientConnect.query(retrievePopulateGroupsQuery, function selectCb(err, results, fields) {
                connectionDataSource.releaseConnectionPool(clientConnect);
                if (err) {
                    customLog.error(err);
                } else {
                    for (var i in results) {
                        groupNameArray[i] = results[i].group_name;
                        centerNameArray[i] = results[i].center_name;
                        statusDescArray[i] = results[i].status_desc;
                    }
                    callback(groupNameArray, centerNameArray, statusDescArray);
                }
            });
        });
    },

    showDashBoardDataModel: function (tenantId, officeId, callback) {
        var self=this;
        var dashBoard = require(groupManagementDTO+"/dashboard");
        var dashBoardObject = new dashBoard();
        var constantsObj = this.constants;
        var apexHeadOffice = constantsObj.getApexHeadOffice();
        var userIdArray = new Array();
        var userNameArray = new Array();
        var officeIdArray = new Array();
        var officeNameArray = new Array();
        var pvCount = new Array();
        var kycUploadCount = new Array();
        var kycUpdatingCount = new Array();
        var dataVerificationCount = new Array();
        var creditCheckCount = new Array();
        var rejectedCount = new Array();
        var assignFoCount = new Array();
        var fvCount = new Array();
        var appraisalCount = new Array();
        var loanAuthorizeCount = new Array();
        var loanSanctionCount = new Array();
        var roleIdArray = new Array();
        var roleNameArray = new Array();
        var noOfGroupsArray = new Array();
        var grtCountArray = new Array();
        var idleCountArray = new Array();
        var retrieveDashBoardQueryDetails = "SELECT user_id,user_name,role_id,IF(role_id = "+constantsObj.getBDEroleId()+",'BDE','FO') AS role_name,office_id,office_name,IF((pv_count IS NULL OR pv_count = 0),'-',pv_count) AS pv_count,IF((kyc_upload_count IS NULL OR kyc_upload_count = 0),'-',kyc_upload_count) AS kyc_upload_count," +
            " IF((fv_count IS NULL OR fv_count = 0),'-',fv_count) AS fv_count,IF((rejected_count IS NULL OR rejected_count = 0),'-',rejected_count) AS rejected_count,IF((kyc_updating_count IS NULL OR kyc_updating_count = 0),'-',kyc_updating_count) AS kyc_updating_count," +
            " IF((dv_count IS NULL OR dv_count = 0),'-',dv_count) AS dv_count,IF((cba_count IS NULL OR cba_count = 0),'-',cba_count) AS cba_count,IF((assigned_fo_count IS NULL OR assigned_fo_count = 0),'-',assigned_fo_count) AS assigned_fo_count,IF((appraisal_count IS NULL OR appraisal_count = 0),'-',appraisal_count) AS appraisal_count," +
            " IF((la_count IS NULL OR la_count = 0),'-',la_count) AS la_count,IF((ls_count IS NULL OR ls_count = 0),'-',ls_count) AS ls_count," +
            " IF((grt_count IS NULL OR grt_count = 0),'-',grt_count) AS grt_count,IF((idle_count IS NULL OR idle_count = 0),'-',idle_count) AS idle_count  FROM ( SELECT u.user_id,u.user_name,pr.role_id,(SELECT role_name FROM iklant_role role WHERE role.role_id = pr.role_id) AS role_name, " +
            " u.office_id,(SELECT office_name FROM "+dbTableName.iklantOffice+" WHERE office_id = u.office_id) AS office_name," +
            " (SELECT COUNT(group_id) FROM "+dbTableName.iklantProspectGroup+" pg1 WHERE pg1.created_by = pr.personnel_id AND status_id = "+constantsObj.getNewGroup()+" GROUP BY pg1.created_by) AS pv_count," +
            " (SELECT COUNT(group_id) FROM "+dbTableName.iklantProspectGroup+" pg1 WHERE pg1.created_by = pr.personnel_id AND status_id = "+constantsObj.getPreliminaryVerified()+" GROUP BY pg1.created_by) AS kyc_upload_count," +
            " (SELECT COUNT(group_id) FROM "+dbTableName.iklantProspectGroup+" pg1 WHERE pg1.assigned_to = pr.personnel_id AND status_id = "+constantsObj.getAssignedFO()+" AND `is_idle` =0 GROUP BY pg1.assigned_to) AS fv_count," +
            " (SELECT COUNT(group_id) FROM "+dbTableName.iklantProspectGroup+" pg1 WHERE pg1.created_by = pr.personnel_id AND status_id IN("+constantsObj.getRejectedPriliminaryVerification()+","+constantsObj.getRejectedAppraisal()+","+constantsObj.getRejectedLoanSanction()+","+constantsObj.getRejectedFieldVerification()+","+constantsObj.getRejectedCreditBureauAnalysisStatusId()+","+constantsObj.getArchived() +","+ constantsObj.getRejectedInNextLoanPreCheck()+","+ constantsObj.getRejectedWhileIdleGroupsStatusId()+","+constantsObj.getRejectedKYCDataVerificationStatusId() +","+ constantsObj.getRejectedPreviousLoanStatusId()+") GROUP BY pg1.created_by) AS rejected_count," +
            " (SELECT COUNT(group_id) FROM "+dbTableName.iklantProspectGroup+" pg1 WHERE status_id = "+constantsObj.getKYCUploaded()+" AND office_id IN(" + officeId + ")) AS kyc_updating_count," +
            " (SELECT COUNT(group_id) FROM "+dbTableName.iklantProspectGroup+" pg1 WHERE status_id = "+constantsObj.getKYCCompleted()+" AND office_id IN(" + officeId + ")) AS dv_count," +
            " (SELECT COUNT(group_id) FROM "+dbTableName.iklantProspectGroup+" pg1 WHERE status_id = "+constantsObj.getDataVerificationOperationId()+" AND office_id IN(" + officeId + ")) AS cba_count," +
            " (SELECT COUNT(group_id) FROM "+dbTableName.iklantProspectGroup+" pg1 WHERE status_id = "+constantsObj.getCreditBureauAnalysedStatus()+" AND office_id IN(" + officeId + ") AND `is_idle` =0) AS assigned_fo_count," +
            " (SELECT COUNT(group_id) FROM "+dbTableName.iklantProspectGroup+" pg1 WHERE status_id = "+constantsObj.getFieldVerified()+" AND office_id IN(" + officeId + ") AND `is_idle` =0) AS appraisal_count," +
            " (SELECT COUNT(group_id) FROM "+dbTableName.iklantProspectGroup+" pg1 WHERE status_id = "+constantsObj.getGroupRecognitionTested()+" AND office_id IN("+ officeId + ") AND `is_idle` =0 ) AS la_count," +
            " (SELECT COUNT(group_id) FROM "+dbTableName.iklantProspectGroup+" pg1 WHERE status_id = "+constantsObj.getAuthorizedStatus()+" AND office_id IN("+ officeId + ") AND `is_idle` =0 ) AS ls_count," +
            " (SELECT COUNT(group_id) FROM "+dbTableName.iklantProspectGroup+" pg1 WHERE status_id = "+constantsObj.getAppraisedStatus()+" AND office_id IN("+ officeId + ") AND `is_idle` =0 ) AS grt_count," +
            " (SELECT COUNT(group_id) FROM "+dbTableName.iklantProspectGroup+" pg1 WHERE pg1.created_by = pr.personnel_id AND pg1.status_id IN("+constantsObj.getCreditBureauAnalysedStatus()+","+constantsObj.getAssignedFO()+","+constantsObj.getFieldVerified()+","+constantsObj.getAppraisedStatus()+","+constantsObj.getGroupRecognitionTested()+","+constantsObj.getAuthorizedStatus()+") AND pg1.is_idle = 1 GROUP BY pg1.created_by) AS idle_count "+
            " FROM "+dbTableName.iklantUsers+" u,"+dbTableName.mfiPersonnelRole+" pr" +
            " LEFT JOIN "+dbTableName.iklantProspectGroup+" pg ON pr.personnel_id = pg.created_by" +
            " WHERE u.user_id = pr.personnel_id AND u.office_id IN(" + apexHeadOffice + "," + officeId + ") AND pr.role_id IN ("+constantsObj.getBDEroleId()+","+constantsObj.getFOroleId()+")" +
            " GROUP BY u.user_id ORDER BY pr.role_id,u.office_id)temp";
        customLog.info("retrieveDashBoardQueryDetails : " + retrieveDashBoardQueryDetails);
        connectionDataSource.getConnection(function (clientConnect) {
            clientConnect.query(retrieveDashBoardQueryDetails, function selectCb(err, results, fields) {
                if (err) {
                    connectionDataSource.releaseConnectionPool(clientConnect);
                    customLog.error(err);
                } else {
                    for (var i in results) {
                        userIdArray [i] = results[i].user_id;
                        userNameArray[i] = results[i].user_name;
                        officeIdArray[i] = results[i].office_id;
                        officeNameArray[i] = results[i].office_name;
                        roleIdArray[i] = results[i].role_id;
                        roleNameArray[i] = results[i].role_name;
                        pvCount[i] = results[i].pv_count;
                        kycUploadCount[i] = results[i].kyc_upload_count;
                        kycUpdatingCount[i] = results[i].kyc_updating_count;
                        dataVerificationCount[i] = results[i].dv_count;
                        creditCheckCount[i] = results[i].cba_count;
                        assignFoCount[i] = results[i].assigned_fo_count;
                        fvCount[i] = results[i].fv_count;
                        rejectedCount[i] = results[i].rejected_count;
                        appraisalCount[i] = results[i].appraisal_count;
                        loanAuthorizeCount[i] = results[i].la_count;
                        loanSanctionCount[i] = results[i].ls_count;
                        grtCountArray[i] = results[i].grt_count;
                        idleCountArray[i] = results[i].idle_count;
                    }
                    dashBoardObject.setUserId(userIdArray);
                    dashBoardObject.setUserName(userNameArray);
                    dashBoardObject.setOfficeId(officeIdArray);
                    dashBoardObject.setofficeName(officeNameArray);
                    dashBoardObject.setRoleId(roleIdArray);
                    dashBoardObject.setRoleName(roleNameArray);
                    dashBoardObject.setPvCount(pvCount);
                    dashBoardObject.setKycUploadCount(kycUploadCount);
                    dashBoardObject.setKycUpdatingCount(kycUpdatingCount);
                    dashBoardObject.setRejectedCount(rejectedCount);
                    dashBoardObject.setDataVerificationCount(dataVerificationCount);
                    dashBoardObject.setCreditCheckCount(creditCheckCount);
                    dashBoardObject.setAssignFoCount(assignFoCount);
                    dashBoardObject.setFvCount(fvCount);
                    dashBoardObject.setAppraisalCount(appraisalCount);
                    dashBoardObject.setLoanAuthorizeCount(loanAuthorizeCount);
                    dashBoardObject.setLoanSanctionCount(loanSanctionCount);
                    dashBoardObject.setGrtCount(grtCountArray);
                    dashBoardObject.setIdleCount(idleCountArray);
                    connectionDataSource.releaseConnectionPool(clientConnect);
                    callback(dashBoardObject);
                }
            });
        });
    },

    saveGroup: function (userId,officeId,areaCodeId,prosGroup,callback) {
        var self=this;
        var prosClient = require(commonDTO +"/prospectClient");
        var constantsObj = this.constants;
        var group_id_for_client = 0;
        var prosGroup = prosGroup;
        var prosClient = new prosClient();
        var overdue = 0;
        var new_group_global_number;
        /*var query1 = "select grp.*,grp_id.* " +
         "from " +
         "(SELECT IFNULL(MAX(group_global_number)+1,0) AS group_global_number , " +
         "IFNULL(MAX(group_id),0)AS group_id,us.user_id,pg.office_id FROM "+dbTableName.iklantUsers+" us  " +
         "left JOIN "+dbTableName.iklantProspectGroup+" pg  ON  pg.created_by  = us.user_id " +
         "GROUP BY us.user_id " +
         ")grp " +
         "left join " +
         "(select COUNT(prg.group_id) AS glo_acc_num,prg.created_by from "+dbTableName.iklantProspectGroup+" prg " +
         "group BY prg.created_by) grp_id " +
         "on grp_id.created_by = grp.user_id " +
         "GROUP by grp_id.created_by ";*/
        var query1 = "select grp.*,grp_id.* " +
            "from " +
            "(SELECT IFNULL(MAX(group_global_number)+1,0) AS group_global_number , " +
            "IFNULL(MAX(group_id),0)AS group_id,us.office_id FROM "+dbTableName.iklantUsers+" us  " +
            "left JOIN "+dbTableName.iklantProspectGroup+" pg  ON  pg.office_id  = us.office_id " +
            "GROUP BY pg.office_id " +
            ")grp " +
            "left join " +
            "(select COUNT(prg.group_id) AS glo_acc_num,prg.office_id from "+dbTableName.iklantProspectGroup+" prg " +
            "group BY prg.office_id) grp_id " +
            "on grp_id.office_id = grp.office_id " +
            "GROUP by grp_id.office_id ";
        connectionDataSource.getConnection(function (clientConnect) {
            clientConnect.query(query1,function selectCb(err, results, fields) {
                var group_id = 0;
                var group_global_number = 0;
                var temp_count;
                var office_id;
                var officeIdName;
                if (err) {
                    connectionDataSource.releaseConnectionPool(clientConnect);
                    customLog.error(err);
                } else {
                    /*for (var i in results) {
                     var fieldName = results[i];
                     useridname = fieldName.user_id;
                     customlog.info(useridname + "  USERID  " + userId);
                     if (useridname == userId) {
                     group_global_number = fieldName.group_id;
                     group_id = fieldName.group_id;
                     temp_count = fieldName.glo_acc_num;
                     customlog.info("-----------------------" + temp_count);
                     }
                     var temp = fieldName.glo_acc_num;
                     group_id_for_client = group_id_for_client + temp;
                     customlog.info("+++++++++++" + group_id_for_client);
                     } */
                    for (var i in results) {
                        var fieldName = results[i];
                        if(fieldName.office_id != null){
                            officeIdName = fieldName.office_id;
                            if (officeIdName == officeId) {
                                group_global_number = fieldName.group_id;
                                group_id = fieldName.group_id;
                                temp_count = fieldName.glo_acc_num;
                            }
                            var temp = fieldName.glo_acc_num;
                            group_id_for_client = group_id_for_client + temp;
                        }
                    }
                }
                office_id = officeId;
                var group_id_for_client_local;
                if (group_id_for_client == 0) {
                    group_id_for_client_local = 1;
                }
                if (group_global_number == 0) {
                    new_group_global_number = "00" + office_id + "-00001";
                }
                else if (temp_count >= 1 && temp_count < 9) {
                    new_group_global_number = "00" + office_id + "-0000" + (temp_count + 1);
                    customLog.info("new_group_global_number : " + new_group_global_number);
                }
                else if (temp_count >= 9 && temp_count < 100) {
                    new_group_global_number = "00" + office_id + "-000" + (temp_count + 1);
                }
                else if (temp_count >= 100 && temp_count < 1000) {
                    new_group_global_number = "00" + office_id + "-00" + (temp_count);
                }
                else if (temp_count >= 1000 && temp_count < 10000) {
                    new_group_global_number = "00" + office_id + "-0" + (temp_count);
                }
                else if (temp_count >= 10000) {
                    new_group_global_number = "00" + office_id + "-" + (temp_count);
                }

                var groupStatusId = "";
                if (prosGroup.getLoan_type_id() == constantsObj.getLoanTypeIdJLG()) {
                    groupStatusId = constantsObj.getPreliminaryVerified();
                }
                else if (prosGroup.getLoan_type_id() == constantsObj.getLoanTypeIdSHG()) {
                    groupStatusId = constantsObj.getNewGroup();
                }
                var query2 = "INSERT INTO "+dbTableName.iklantProspectGroup+" (tenant_id,group_global_number,group_name, " +
                    "center_name,office_id,area_code_id, loan_type_id,status_id,group_created_date,created_by,created_date,updated_date,mobile_group_name) " +
                    "VALUES ('" + prosGroup.getTenant_id() + "','" + new_group_global_number + "', " +
                    "'" + prosGroup.getGroup_name() + "','" + prosGroup.getCenter_name() + "', " +
                    "" + prosGroup.getOffice_id() + "," + areaCodeId + "," + prosGroup.getLoan_type_id() + "," + groupStatusId + ", " +
                    "'" + prosGroup.getGroup_created_date() + "'," + userId + ",NOW() + INTERVAL 5 HOUR + INTERVAL 30 MINUTE,NOW() + INTERVAL 5 HOUR + INTERVAL 30 MINUTE,'" + prosGroup.getGroup_name() + "')";
                clientConnect.query(query2,function postCreate(err) {
                    if (err) {
                        connectionDataSource.releaseConnectionPool(clientConnect);
                        customLog.error(err);
                    }else{
                        if (prosGroup.getWeekradio() == 1) {
                            var insertMeetingQuery = "INSERT INTO "+dbTableName.iklantMeeting+" (meeting_type_id, meeting_place, start_date, meeting_time) " +
                                "VALUES(4, '" + prosGroup.getWeeklocation() + "','" + prosGroup.getGroup_created_date() + "', '" + prosGroup.getMeetingTime() + "') ";
                            clientConnect.query(insertMeetingQuery,
                                function postCreate(err) {
                                    if (err) {
                                        customLog.error(err);
                                        connectionDataSource.releaseConnectionPool(clientConnect);
                                    }
                                });
                        }
                        else if (prosGroup.getWeekradio() == 2) {
                            var insertMeetingQuery = "INSERT INTO "+dbTableName.iklantMeeting+" (meeting_type_id, meeting_place, start_date, meeting_time) " +
                                "VALUES(4, '" + prosGroup.getMonthlocation() + "','" + prosGroup.getGroup_created_date() + "', '" + prosGroup.getMeetingTime() + "') ";
                            clientConnect.query(insertMeetingQuery,
                                function postCreate(err) {
                                    if (err) {
                                        customLog.error(err);
                                        connectionDataSource.releaseConnectionPool(clientConnect);
                                    }
                                });
                        }
                        var retrieveMeetingIdQuery = "SELECT MAX(meeting_id) AS meeting_id FROM "+dbTableName.iklantMeeting;
                        var meeting_id;
                        clientConnect.query(retrieveMeetingIdQuery,function selectCb(err, results, fields) {
                            if (err) {
                                connectionDataSource.releaseConnectionPool(clientConnect);
                                customLog.error(err);
                            } else {
                                for (var i in results) {
                                    var fieldName = results[i];
                                    meeting_id = fieldName.meeting_id;
                                }
                                if (prosGroup.getWeekradio() == 1) {
                                    var insertRecurrenceDetailQuery = "INSERT INTO "+dbTableName.iklantRecurrenceDetail+" ( meeting_id, recurrence_id, recur_after) " +
                                        "VALUES(" + meeting_id + "," + prosGroup.getWeekradio() + "," + prosGroup.getRecurweek() + " );	";
                                    clientConnect.query(insertRecurrenceDetailQuery,
                                        function postCreate(err) {
                                            if (err) {
                                                customLog.error(err);
                                                connectionDataSource.releaseConnectionPool(clientConnect);
                                            }
                                        });
                                }
                                else if (prosGroup.getWeekradio() == 2) {

                                    var insertRecurrenceDetailQuery = "INSERT INTO "+dbTableName.iklantRecurrenceDetail+" ( meeting_id, recurrence_id, recur_after) " +
                                        "VALUES(" + meeting_id + "," + prosGroup.getWeekradio() + "," + prosGroup.getEverymonth() + " );	";
                                    clientConnect.query(insertRecurrenceDetailQuery,
                                        function postCreate(err) {
                                            if (err) {
                                                customLog.error(err);
                                                connectionDataSource.releaseConnectionPool(clientConnect);
                                            }
                                        });
                                }
                                var retrieveDetailsIdQuery = "SELECT MAX(details_id) AS details_id FROM "+dbTableName.iklantRecurrenceDetail;
                                var details_id;
                                clientConnect.query(retrieveDetailsIdQuery,
                                    function selectCb(err, results, fields) {
                                        if (err) {
                                            connectionDataSource.releaseConnectionPool(clientConnect);
                                            customLog.error(err);
                                        } else {
                                            for (var i in results) {
                                                var fieldName = results[i];
                                                details_id = fieldName.details_id;
                                            }
                                            if (prosGroup.getWeekradio() == 1) {
                                                var insertRecurOnDayQuery = "INSERT INTO "+dbTableName.iklantRecurOnDay+" (details_id, days) " +
                                                    "VALUES(" + details_id + ", " + prosGroup.getDayorder() + "); ";
                                                clientConnect.query(insertRecurOnDayQuery,
                                                    function postCreate(err) {
                                                        if (err) {
                                                            customLog.error(err);
                                                            connectionDataSource.releaseConnectionPool(clientConnect);
                                                        }
                                                    });
                                            }
                                            else if (prosGroup.getWeekradio() == 2) {

                                                var insertRecurOnDayQuery = "INSERT INTO "+dbTableName.iklantRecurOnDay+" (details_id, day_number) " +
                                                    "VALUES(" + details_id + ", " + prosGroup.getMonthday() + "); ";
                                                clientConnect.query(insertRecurOnDayQuery,
                                                    function postCreate(err) {
                                                        if (err) {
                                                            customLog.error(err);
                                                            connectionDataSource.releaseConnectionPool(clientConnect);
                                                        }
                                                    });
                                            }
                                            var retrieveGroupIdQuery = "SELECT MAX(group_id) AS group_id FROM "+dbTableName.iklantProspectGroup;
                                            var group_id;
                                            clientConnect.query(retrieveGroupIdQuery,
                                                function selectCb(err, results, fields) {
                                                    if (err) {
                                                        connectionDataSource.releaseConnectionPool(clientConnect);
                                                        customLog.error(err);
                                                    } else {
                                                        for (var i in results) {
                                                            var fieldName = results[i];
                                                            group_id = fieldName.group_id;
                                                        }

                                                        var insertProspectGroupQuery = "INSERT INTO "+dbTableName.iklantProspectGroupMeeting+" ( group_id, meeting_id) " +
                                                            "VALUES(" + group_id + ", " + meeting_id + ");";
                                                        clientConnect.query(insertProspectGroupQuery,
                                                            function postCreate(err) {
                                                                if (err) {
                                                                    customLog.error(err);
                                                                }
                                                                connectionDataSource.releaseConnectionPool(clientConnect);
                                                                callback();
                                                            });
                                                    }
                                                }
                                            );
                                        }
                                    }
                                );
                            }
                        });
                    }
                });
            });
        });
    },

    showPreliminaryVerification: function (groupId, callback) {
        var prospectGroup = require(commonDTO+"/prospectGroup");
        var prosClient = require(commonDTO+"/prospectClient");
        var officeRequire = require(commonDTO+"/office");
        var self=this;
        var constantsObj = this.constants;
        var prosGroup = new prospectGroup();
        var prosClient = new prosClient();
        var office = new officeRequire();
        var clientId = new Array();
        var memberName = new Array();
        var docTypeIdArray = new Array();
        var docTypeNameArray = new Array();
        office.clearAll();

        var groupDetailsQuery = "SELECT lt.*,grp_det.group_id,grp_det.group_name,grp_det.center_name,grp_det.group_created_date, " +
            "grp_det.office_id,o.office_name FROM "+dbTableName.iklantProspectGroup+" grp_det INNER JOIN "+dbTableName.iklantOffice+" o ON grp_det.office_id=o.office_id " +
            "LEFT JOIN "+dbTableName.iklantLoanType+" lt ON lt.loan_type_id = grp_det.loan_type_id WHERE group_id=" + groupId + "";
        connectionDataSource.getConnection(function (clientConnect) {
            clientConnect.query(groupDetailsQuery,function selectCb(err, results, fields) {
                if (err) {
                    connectionDataSource.releaseConnectionPool(clientConnect);
                    customLog.error(err);
                } else {
                    for (var i in results) {
                        var fieldName = results[i];
                        prosGroup.setGroup_id(fieldName.group_id);
                        prosGroup.setGroup_name(fieldName.group_name);
                        prosGroup.setCenter_name(fieldName.center_name);
                        prosGroup.setGroup_created_date(dateUtils.formatDateForUI(fieldName.group_created_date));
                        prosGroup.setLoan_type(fieldName.loan_type);
                        office.setOfficeName(fieldName.office_name);
                    }
                }
            });

            var query2 = "SELECT doc_id,doc_name FROM "+dbTableName.iklantDocType+" where doc_entity_id=" + constantsObj.getGroupDocsEntity() + "";
            clientConnect.query(query2,function selectCb(err, results, fields) {
                if (err) {
                    customLog.error(err);
                } else {
                    for (var i in results) {
                        var fieldName = results[i];
                        docTypeIdArray[i] = fieldName.doc_id;
                        docTypeNameArray[i] = fieldName.doc_name;
                    }
                }
                customLog.info("docTypeIdArray : " + docTypeIdArray);
                connectionDataSource.releaseConnectionPool(clientConnect);
                callback(prosGroup, office, prosClient, docTypeIdArray, docTypeNameArray);
            });

            /*var groupMembersDetailsQuery="SELECT client_id,client_name FROM "+dbTableName.iklantProspectClient+" WHERE group_id="+groupId;
             client.query(groupMembersDetailsQuery,
             function selectCb(err, results, fields) {
             if (err) {
             customlog.error(err);
             }else{
             for (var i in results) {
             var fieldName=results[i];
             clientId[i]=fieldName.client_id;
             memberName[i]=fieldName.client_name;
             }
             prosClient.setClientIds(clientId);
             prosClient.setMemberNames(memberName);
             customlog.info("clientId ="+clientId);
             }
             callback(prosGroup,office,prosClient,docTypeIdArray,docTypeNameArray);
             });*/
        });
    },

    showPreliminaryVerificationUpload: function (groupId, callback) {
        var self = this;
        var constantsObj = this.constants;
        var docTypeIdArray = new Array();
        var docTypeNameArray = new Array();
        var query2 = "SELECT doc_id,doc_name FROM "+dbTableName.iklantDocType+" where doc_entity_id=" + constantsObj.getGroupDocsEntity() + "";
        connectionDataSource.getConnection(function (clientConnect) {
            clientConnect.query(query2,function selectCb(err, results, fields) {
                connectionDataSource.releaseConnectionPool(clientConnect);
                if (err) {
                    customLog.error(err);
                } else {
                    for (var i in results) {
                        var fieldName = results[i];
                        docTypeIdArray[i] = fieldName.doc_id;
                        docTypeNameArray[i] = fieldName.doc_name;
                    }
                }
                customLog.info("docTypeIdArray : " + docTypeIdArray);
                callback(docTypeIdArray, docTypeNameArray);
            });
        });
    },

    preVerificationDocumentUpload: function (groupId, fileName, docTypeId, callback) {
        var self=this;
        if (fileName != "") {
            for (var i = 0; i < fileName.length; i++) {
                var fileLoacation = "documents/group_documents/" + fileName[i];
                var query = "INSERT INTO "+dbTableName.iklantGroupDoc+"(image_location,group_id,doc_type_id,doc_name)VALUES('" + fileLoacation + "'," + groupId + "," + docTypeId + ",'" + fileName[i] + "')";
                connectionDataSource.getConnection(function (clientConnect) {
                    clientConnect.query(query,function selectCb(err, results, fields) {
                        connectionDataSource.releaseConnectionPool(clientConnect);
                        if (err) {
                            customLog.error(err);
                        } else {
                            customLog.info("Image Location Inserted..!");
                            if (fileName.length - 1 == i)
                                callback();
                        }
                    });
                });
            }
        }
    },

    KYC_Uploading: function (group_id, callback) {
        var self=this;
        var constantsObj = this.constants;
        var docTypeIdArray = new Array();
        var docTypeNameArray = new Array();
        var memberIdArray = new Array();
        var memberNameArray = new Array();

        var query1 = "SELECT client_id,client_name FROM "+dbTableName.iklantProspectClient+" WHERE " +
            "group_id=" + group_id + " and is_overdue = 0";
        connectionDataSource.getConnection(function (clientConnect) {
            clientConnect.query(query1,function selectCb(err, results, fields) {
                if (err) {
                    connectionDataSource.releaseConnectionPool(clientConnect);
                    customLog.error(err);
                } else {
                    for (var i in results) {
                        var fieldName = results[i];
                        memberIdArray[i] = fieldName.client_id;
                        memberNameArray[i] = fieldName.client_name;
                    }
                }
                customLog.info("memberNameArray : " + memberNameArray);
            });
            var query2 = "SELECT doc_id,doc_name FROM "+dbTableName.iklantDocType+" where " +
                "doc_entity_id=" + constantsObj.getClientDocsEntity() + "";
            clientConnect.query(query2,function selectCb(err, results, fields) {
                if (err) {
                    connectionDataSource.releaseConnectionPool(clientConnect);
                    customLog.error(err);
                } else {
                    for (var i in results) {
                        var fieldName = results[i];
                        docTypeIdArray[i] = fieldName.doc_id;
                        docTypeNameArray[i] = fieldName.doc_name;
                    }
                    connectionDataSource.releaseConnectionPool(clientConnect);
                }
                customLog.info("docTypeIdArray : " + docTypeIdArray);
                callback(group_id, docTypeIdArray, docTypeNameArray, memberIdArray, memberNameArray);
            });
        });
    },

    KYC_UploadingImage: function (client_id, doc_type_id, fileName, callback) {
        //customlog.info("Before captured image insert");
        var self=this;
        var groupId;
        for (var i = 0; i < fileName.length; i++) {
            customLog.info(fileName[i]);
            var fileLoacation = "documents/client_documents/" + fileName[i];
            var query = "INSERT INTO "+dbTableName.iklantClientDoc+"(Captured_image,client_id,doc_type_id,doc_name)VALUES('" + fileLoacation + "'," + client_id + "," + doc_type_id + ",'" + fileName[i] + "')";
            connectionDataSource.getConnection(function (clientConnect) {
                clientConnect.query(query,function selectCb(err, results, fields) {
                    connectionDataSource.releaseConnectionPool(clientConnect);
                    if (err) {
                        customLog.error(err);
                    } else {
                        customLog.info("Image Inserted..!");
                        if (fileName.length - 1 == i)
                            callback();
                    }
                });
            });
        }
    },

    storeCapturedImage: function (client_id, doc_type_id, image, fileName, callback) {
        customLog.info("Before captured image insert");
        var self=this;
        var groupId;
        var fileLoacation = "documents/client_documents/" + fileName + ".png"
        var query = "INSERT INTO "+dbTableName.iklantClientDoc+"(Captured_image,client_id,doc_type_id,doc_name)VALUES('" + fileLoacation + "'," + client_id + "," + doc_type_id + ",'" + fileName + "')";
        var fs = require('fs');
        fs.writeFile(fileLoacation, new Buffer(image.replace(/^data:image\/png;base64,/, ""), "base64"), function (err) {
        });

        connectionDataSource.getConnection(function (clientConnect) {
            clientConnect.query(query,function selectCb(err, results, fields) {
                if (err) {
                    connectionDataSource.releaseConnectionPool(clientConnect);
                    customLog.error(err);
                }
            });
            var getGroupIdQuery = "SELECT group_id FROM "+dbTableName.iklantProspectClient+" WHERE client_id = " + client_id + " ";
            customLog.info("getGroupIdQuery:====>" + getGroupIdQuery);
            clientConnect.query(getGroupIdQuery, function selectCb(err, results, fields) {
                if (err) {
                    connectionDataSource.releaseConnectionPool(clientConnect);
                    customLog.error(err);
                } else {
                    for (var i in results) {
                        groupId = results[i].group_id;
                    }
                    customLog.info("groupId : " + groupId);
                    connectionDataSource.releaseConnectionPool(clientConnect);
                    callback(groupId);
                }
            });
        });
    },

    storePreliminaryVerificationCapturedImage: function (groupId, doc_type_id, image, fileName, callback) {
        var self=this;
        var fileLoacation = "documents/group_documents/" + fileName + ".png"
        var query = "INSERT INTO "+dbTableName.iklantGroupDoc+"(image_location,group_id,doc_type_id,doc_name)VALUES('" + fileLoacation + "'," + groupId + "," + doc_type_id + ",'" + fileName + "')";
        var fs = require('fs');
        fs.writeFile(fileLoacation, new Buffer(image.replace(/^data:image\/png;base64,/, ""), "base64"), function (err) {
        });

        customLog.info(query);
        connectionDataSource.getConnection(function (clientConnect) {
            clientConnect.query(query,function selectCb(err, results, fields) {
                connectionDataSource.releaseConnectionPool(clientConnect);
                if (err) {
                    customLog.error(err);
                } else {
                    customLog.info("Image Location Inserted..");
                    callback(groupId);
                }
            });
        });
    },

    groupDetails: function (tenant_id, office_id, callback) {
        var groupIdArray = new Array();
        var groupNameArray = new Array();
        var self=this;
        var constantsObj = this.constants;
        var query = "SELECT group_id,group_name FROM "+dbTableName.iklantProspectGroup+" WHERE status_id " +
            "IN(" + constantsObj.getNewGroup() + "," + constantsObj.getPreliminaryVerified() + ", " +
            "" + constantsObj.getKYCUploaded() + "," + constantsObj.getAssignedFO() + ") and " +
            "tenant_id=" + tenant_id + " AND office_id=" + office_id + "";
        customLog.info("Sync Group Query : " + query);
        connectionDataSource.getConnection(function (clientConnect) {
                clientConnect.query(query,
                    function selectCb(err, results, fields) {
                        connectionDataSource.releaseConnectionPool(clientConnect);
                        if (err) {
                            customLog.error(err);
                        } else {
                            for (var i in results) {
                                var fieldName = results[i];
                                groupIdArray[i] = fieldName.group_id;
                                groupNameArray[i] = fieldName.group_name;
                            }
                        }
                        customLog.info(groupNameArray);
                        callback(groupIdArray, groupNameArray);
                    }
                );
            }
        );
    },

    documentDetails: function (tenant_id, callback) {
        var doc_id = new Array();
        var doc_type = new Array();
        var self= this;
        var query = "SELECT doc_id,doc_name FROM "+dbTableName.iklantDocType+" WHERE tenant_id=" + tenant_id + "";
        connectionDataSource.getConnection(function (clientConnect) {
                clientConnect.query(query,
                    function selectCb(err, results, fields) {
                        connectionDataSource.releaseConnectionPool(clientConnect);
                        if (err) {
                            customLog.error(err);
                        } else {
                            for (var i in results) {
                                doc_id[i] = results[i].doc_id;
                                doc_type[i] = results[i].doc_name;
                            }
                        }
                        customLog.info(doc_type);
                        callback(doc_id, doc_type);
                    }
                );
            }
        );
    },

    memberDetails: function (tenant_id, office_id, callback) {
        var groupIdArray = new Array();
        var memberIdArray = new Array();
        var memberNameArray = new Array();
        var self=this;
        var constantsObj = this.constants;
        var query = "SELECT pc.group_id,pc.client_id,pc.client_name FROM "+dbTableName.iklantProspectClient+" pc " +
            "INNER JOIN "+dbTableName.iklantProspectGroup+" pg ON pg.group_id=pc.group_id WHERE pg.tenant_id=" + tenant_id + " " +
            "AND pc.status_id IN (" + constantsObj.getNewGroup() + "," + constantsObj.getPreliminaryVerified() + ", " +
            "" + constantsObj.getKYCUploaded() + "," + constantsObj.getAssignedFO() + ") AND pg.status_id " +
            "IN (" + constantsObj.getNewGroup() + "," + constantsObj.getPreliminaryVerified() + ", " +
            "" + constantsObj.getKYCUploaded() + "," + constantsObj.getAssignedFO() + ") AND pg.office_id=" + office_id + " ";
        customLog.info("Sync Clients Query : " + query);
        connectionDataSource.getConnection(function (clientConnect) {
                clientConnect.query(query,
                    function selectCb(err, results, fields) {
                        connectionDataSource.releaseConnectionPool(clientConnect);
                        if (err) {
                            customLog.error(err);
                        } else {
                            for (var i in results) {
                                groupIdArray[i] = results[i].group_id;
                                memberIdArray[i] = results[i].client_id;
                                memberNameArray[i] = results[i].client_name;
                            }
                        }
                        callback(groupIdArray, memberIdArray, memberNameArray);
                    }
                );
            }
        );
    },

    availableDocumentDetailsDatamodel: function (tenant_id, office_id, callback) {
        var groupIdArray = new Array();
        var memberIdArray = new Array();
        var docNameArray = new Array();
        var docTypeArray = new Array();
        var self=this;
        var constantsObj = this.constants;
        var preliminaryVerified = constantsObj.getPreliminaryVerified();
        var query = "SELECT pg.group_id,pc.client_id,cd.doc_name,cd.doc_type_id FROM "+dbTableName.iklantProspectClient+" pc " +
            "INNER JOIN "+dbTableName.iklantClientDoc+" cd ON cd.client_id = pc.client_id " +
            "INNER JOIN "+dbTableName.iklantProspectGroup+" pg ON pg.group_id = pc.group_id " +
            "WHERE pc.status_id=" + preliminaryVerified + " AND pg.status_id=" + preliminaryVerified + " " +
            "AND pg.tenant_id = " + tenant_id + " AND pg.office_id = " + office_id + " order by client_id";
        customLog.info("Sync available Document details Query : " + query);
        connectionDataSource.getConnection(function (clientConnect) {
            clientConnect.query(query,function selectCb(err, results, fields) {
                connectionDataSource.releaseConnectionPool(clientConnect);
                if (err) {
                    customLog.error(err);
                } else {
                    for (var i in results) {
                        groupIdArray[i] = results[i].group_id;
                        memberIdArray[i] = results[i].client_id;
                        docNameArray[i] = results[i].doc_name;
                        docTypeArray[i] = results[i].doc_type_id;
                    }
                }
                callback(groupIdArray, memberIdArray, docNameArray, docTypeArray);
            });
        });
    },

    //Sindhu
    saveKycUpload: function (groupId, callback) {
        var self=this;
        var constantsObj = this.constants;
        var groupIds = new Array();
        var clientDocCount;
        var noOfClients;
        var errorMsg = "All the client documents not yet uploaded";
        var clientDoc_query = "SELECT * FROM(SELECT COUNT(DISTINCT cd.client_id)AS client_doc_count " +
            "FROM "+dbTableName.iklantClientDoc+" cd INNER JOIN "+dbTableName.iklantProspectClient+" pc ON  pc.client_id=cd.client_id " +
            "WHERE cd.doc_type_id=" + constantsObj.getApplicationFormDocId() + " " +
            "AND pc.group_id=" + groupId + ")aa " +
            "JOIN(SELECT COUNT(client_id) AS no_of_clients FROM "+dbTableName.iklantProspectClient+" " +
            "WHERE group_id=" + groupId + " AND is_overdue=0)bb";
        connectionDataSource.getConnection(function (clientConnect) {
            clientConnect.query(clientDoc_query,function selectCb(err, results, fields) {
                if (err) {
                    connectionDataSource.releaseConnectionPool(clientConnect);
                    customLog.error(err);
                } else {
                    for (var i in results) {
                        var fieldName = results[i];
                        clientDocCount = fieldName.client_doc_count;
                        noOfClients = fieldName.no_of_clients;
                    }
                }
                customLog.info("clientDocCount : " + clientDocCount);
                customLog.info("noOfClients : " + noOfClients);
                if (clientDocCount == noOfClients) {
                    errorMsg = "";
                    var groupInsertQuery = "UPDATE "+dbTableName.iklantProspectGroup+" pg, "+dbTableName.iklantProspectClient+" pc " +
                        "SET pg.status_id=" + constantsObj.getKYCUploaded() + ", " +
                        "pc.status_id=if(pc.is_overdue=0," + constantsObj.getKYCUploaded() + ",pc.status_id), " +
                        "pg.updated_date=NOW() + INTERVAL 5 HOUR + INTERVAL 30 MINUTE,pc.updated_date=NOW() + INTERVAL 5 HOUR + INTERVAL 30 MINUTE WHERE pg.group_id = " + groupId + " AND pc.group_id = " + groupId + " ";
                    customLog.info("groupInsertQuery : " + groupInsertQuery);
                    clientConnect.query(groupInsertQuery, function postCreate(err) {
                        if (err) {
                            connectionDataSource.releaseConnectionPool(clientConnect);
                            customLog.error(err);
                        }
                    });
                }
                connectionDataSource.releaseConnectionPool(clientConnect);
                customLog.error("errorMsg : " + errorMsg);
                callback(errorMsg);
            });
        });
    },

    saveAssignFO: function (foName, assignGroupIds, callback) {
        var self = this;
        var constantsObj = this.constants;
        var assignFOQuery = "UPDATE "+dbTableName.iklantProspectGroup+" pg, "+dbTableName.iklantProspectClient+" pc SET " +
            "pg.assigned_to='" + foName + "',pg.status_id=" + constantsObj.getAssignedFO() + ", " +
            "pc.status_id=if(pc.is_overdue=0 && pc.status_id=" + constantsObj.getCreditBureauAnalysedStatus() + ", " +
            "" + constantsObj.getAssignedFO() + ",pc.status_id), " +
            "pg.updated_date=NOW() + INTERVAL 5 HOUR + INTERVAL 30 MINUTE,pc.updated_date=NOW() + INTERVAL 5 HOUR + INTERVAL 30 MINUTE WHERE " +
            "pg.group_id IN (" + assignGroupIds + ") AND pc.group_id IN (" + assignGroupIds + ") ";
        connectionDataSource.getConnection(function (clientConnect) {
            clientConnect.beginTransaction(function(err){
               if(err){
                   customLog.error(err)
               }
               clientConnect.query(assignFOQuery, function postCreate(err) {
                    connectionDataSource.releaseConnectionPool(clientConnect);
                    if (err) {
                        clientConnect.rollback(function(){
                            customLog.error(err);
                            callback('failure');
                        });
                    }
                    else{
                        clientConnect.commit(function(err){
                            if(err){
                                clientConnect.rollback(function(){

                                });
                            }
                            callback('success');
                        });
                    }
                });
            });

        });
    },

    cca1RejectClients: function (rejectedClientName, remarksToReject, roleId, callback) {
        var self = this;
        var constantsObj = this.constants;
        var groupId;
        var branchId;
        var clientName = new Array();
        clientName = rejectedClientName.split(",");

        connectionDataSource.getConnection(function (clientConnect) {
            if(roleId == constantsObj.getSMHroleId()){
                var clientRejectQuery = "UPDATE " + dbTableName.iklantProspectClient + " SET status_id=" + constantsObj.getRejectedAppraisal() + ",remarks_for_rejection='" + remarksToReject + "', " +
                    "updated_date=NOW() + INTERVAL 5 HOUR + INTERVAL 30 MINUTE WHERE client_id='" + rejectedClientName + "'";
                clientConnect.query(clientRejectQuery,function postCreate(err) {
                    if (err) {
                        connectionDataSource.releaseConnectionPool(clientConnect);
                        customLog.error(err);
                    }
                });
                clientConnect.query("DELETE FROM " + dbTableName.iklantRejectedClientStatus + " WHERE client_id = "+rejectedClientName,
                    function postCreate(err) {
                        if (err) {
                            connectionDataSource.releaseConnectionPool(clientConnect);
                            customLog.error(err);
                        }
                });
                var getGroupIdQuery = "SELECT pg.group_id,pg.office_id FROM "+dbTableName.iklantProspectClient+" pc " +
                    "INNER JOIN "+dbTableName.iklantProspectGroup+" pg ON pg.group_id = pc.group_id " +
                    "WHERE pc.client_id = " + rejectedClientName;
            }
            else {
                for (var j = 0; j < clientName.length; j++) {
                    var clientRejectQuery = "UPDATE " + dbTableName.iklantProspectClient + " SET status_id=" + constantsObj.getRejectedAppraisal() + ", " +
                        "updated_date=NOW() + INTERVAL 5 HOUR + INTERVAL 30 MINUTE WHERE client_id='" + clientName[j] + "'";
                    clientConnect.query(clientRejectQuery,
                        function postCreate(err) {
                            if (err) {
                                connectionDataSource.releaseConnectionPool(clientConnect);
                                customLog.error(err);
                            }
                        });
                }
                var getGroupIdQuery = "SELECT pg.group_id,pg.office_id FROM "+dbTableName.iklantProspectClient+" pc " +
                    "INNER JOIN "+dbTableName.iklantProspectGroup+" pg ON pg.group_id = pc.group_id " +
                    "WHERE pc.client_id = " + clientName[0];
            }
            clientConnect.query(getGroupIdQuery,
                function selectCb(err, results, fields) {
                    connectionDataSource.releaseConnectionPool(clientConnect);
                    if (err) {
                        customLog.error(err);
                        callback();
                    } else {
                        for (var i in results) {
                            groupId = results[i].group_id;
                            branchId = results[i].office_id;
                        }
                        callback(groupId, branchId);
                    }
                }
            );
        });
    },

    cca1approvedGroup: function (rejectedClientName, approvedGroupName, callback) {
        var self = this;
        var constantsObj = this.constants;
        var fieldVerified = constantsObj.getFieldVerified(); //6
        var appraised = constantsObj.getAppraisedStatus(); //7
        var authorized = constantsObj.getAuthorizedStatus(); //16
        var branchId;
        var approveGroupQuery = "UPDATE "+dbTableName.iklantProspectGroup+" pg, "+dbTableName.iklantProspectClient+" pc " +
            "SET pg.status_id=IF(pg.status_id=" + fieldVerified + "," + appraised + ", " +
            "IF(pg.status_id=" + appraised + "," + appraised + ",pg.status_id)), " +
            "pc.status_id = IF(pc.status_id=" + fieldVerified + "," + appraised + ", " +
            "IF(pc.status_id=" + appraised + "," + appraised + ",pc.status_id)), " +
            "pg.updated_date=NOW() + INTERVAL 5 HOUR + INTERVAL 30 MINUTE,pc.updated_date=NOW() + INTERVAL 5 HOUR + INTERVAL 30 MINUTE WHERE pc.group_id=" + approvedGroupName + " " +
            "AND pg.group_id=" + approvedGroupName;
        customLog.info("approveGroupQuery : " + approveGroupQuery);
        connectionDataSource.getConnection(function (clientConnect) {
            clientConnect.query(approveGroupQuery,
                function postCreate(err) {
                    if (err) {
                        customLog.error(err);
                        connectionDataSource.releaseConnectionPool(clientConnect);
                    }
                });
            var getGroupIdQuery = "SELECT office_id FROM "+dbTableName.iklantProspectGroup+" WHERE group_id =" + approvedGroupName;
            clientConnect.query(getGroupIdQuery,
                function selectCb(err, results, fields) {
                    if (err) {
                        connectionDataSource.releaseConnectionPool(clientConnect);
                        callback();
                        customLog.error(err);
                    } else {
                        for (var i in results) {
                            branchId = results[i].office_id;
                        }
                        connectionDataSource.releaseConnectionPool(clientConnect);
                        callback(approvedGroupName, branchId);
                    }

                });
        });
    },

    cca1rejectedGroup: function (approvedGroupName, callback) {
        var self = this;
        var constantsObj = this.constants;
        var rejectGroupQuery = "UPDATE "+dbTableName.iklantProspectGroup+" pg SET pg.status_id=" + constantsObj.getRejectedAppraisal() + ", " +
            "pg.rejected_less_no_of_clients=IF((SELECT COUNT(pc.client_id) AS active_clients " +
            "FROM "+dbTableName.iklantProspectClient+" pc " +
            "WHERE pc.group_id='" + approvedGroupName + "' " +
            "AND pc.status_id =" + constantsObj.getFieldVerified() + " " +
            ")>=5,0,1),pg.updated_date=NOW() + INTERVAL 5 HOUR + INTERVAL 30 MINUTE " +
            "WHERE pg.group_id='" + approvedGroupName + "'";
        customLog.info("rejectGroupQuery : " + rejectGroupQuery);
        connectionDataSource.getConnection(function (clientConnect) {
            clientConnect.query(rejectGroupQuery,
                function postCreate(err) {
                    if (err) {
                        connectionDataSource.releaseConnectionPool(clientConnect);
                        customLog.error(err);
                    }
                });
            var updateClientQuery = "UPDATE "+dbTableName.iklantProspectClient+" pc SET pc.status_id=" + constantsObj.getAppraisedStatus() + ", " +
                "pc.updated_date=NOW() + INTERVAL 5 HOUR + INTERVAL 30 MINUTE " +
                "WHERE pc.status_id =" + constantsObj.getFieldVerified() + " " +
                "AND pc.group_id='" + approvedGroupName + "'";
            customLog.info("updateClientQuery : " + updateClientQuery);
            clientConnect.query(updateClientQuery, function postCreate(err) {
                if (err) {
                    connectionDataSource.releaseConnectionPool(clientConnect);
                    customLog.error(err);
                }
            });
            var getGroupIdQuery = "SELECT office_id FROM "+dbTableName.iklantProspectGroup+" WHERE group_id =" + approvedGroupName;
            clientConnect.query(getGroupIdQuery,
                function selectCb(err, results, fields) {
                    connectionDataSource.releaseConnectionPool(clientConnect);
                    if (err) {
                        customLog.error(err);
                        callback();
                    } else {
                        for (var i in results) {
                            branchId = results[i].office_id;
                        }
                        callback(approvedGroupName, branchId);
                    }
                }
            );
        });
    },

    toInsertGroup: function (groupId, callback) {
        var constantsObj = this.constants;
        var group_id = groupId;
        connectionDataSource.getConnection(function (clientConnect) {
            var ciQuery = "SELECT 	pg.`group_id`,pg.group_name,pg.`center_name` AS displayName, pg.loan_count, "+
                "	pg.`created_by` AS loanOfficerId, imm.mifos_customer_id,"+
                "	DATE_FORMAT(NOW() + INTERVAL 5 HOUR + INTERVAL 30 MINUTE,'%Y-%m-%d') AS mfiJoiningDate, "+
                "	DATE_FORMAT(NOW() + INTERVAL 5 HOUR + INTERVAL 30 MINUTE,'%Y-%m-%d') AS activationDate, "+
                "	pg.`office_id` AS officeId, "+
                "	IFNULL(SUBSTRING_INDEX(pcp.`address`,',',1),' ') AS line1, "+
                "	IFNULL(SUBSTRING_INDEX(SUBSTRING_INDEX(pcp.`address`,',',2),',',-1),' ') AS line2, "+
                "	IFNULL(SUBSTRING_INDEX(SUBSTRING_INDEX(pcp.`address`,',',3),',',-1),' ') AS line3, "+
                "	IFNULL(SUBSTRING_INDEX(SUBSTRING_INDEX(pcp.`address`,',',4),',',-1),' ') AS city, "+
                "	st.state_name AS state, "+
                "	'India' AS country, "+
                "	pcp.pincode AS zip, "+
                "	pcp.`mobile_number` AS phoneNumber, "+
                "	pcp.`landline_number` AS landlineNumber, "+
                "	IF(rd.`recurrence_id` = 1,rod.days,IF(rod.day_number = 0,1,rod.day_number)) AS dayNumber, "+
                "	rd.`recur_after` AS recureAfter, "+
                "	m.`meeting_place` AS meetingPlace, "+
                "	m.`meeting_time` AS meetingTime, "+
                "	rd.`recurrence_id` AS recurrenceType "+
                "	 "+
                "FROM 	"+dbTableName.iklantProspectGroup+" pg "+
                "	INNER JOIN "+dbTableName.iklantProspectClient+" pc ON pc.`group_id` = pg.`group_id` "+
                "	INNER JOIN "+dbTableName.iklantProspectClientPersonal+" pcp ON pcp.`client_id` = pc.`client_id` "+
                "	INNER JOIN "+dbTableName.iklantOffice+" o ON o.office_id = pg.office_id "+
                "	INNER JOIN iklant_state_list st ON st.state_id = o.state_id "+
                "	LEFT JOIN "+dbTableName.iklantProspectGroupMeeting+" pgm ON pgm.`group_id` = pg.`group_id` "+
                "	LEFT JOIN "+dbTableName.iklantMeeting+" m ON m.`meeting_id` = pgm.`meeting_id` "+
                "	LEFT JOIN "+dbTableName.iklantRecurrenceDetail+" rd ON rd.`meeting_id` = m.`meeting_id` "+
                "	LEFT JOIN "+dbTableName.iklantRecurOnDay+" rod ON rod.`details_id` = rd.`details_id` "+
                "   LEFT JOIN "+dbTableName.iklantMifosMapping+" imm ON imm.group_id = pg.group_id "+
                "WHERE CASE WHEN (SELECT client_id FROM iklant_prospect_client WHERE sub_leader_global_number  = (SELECT leader_global_number FROM "+dbTableName.iklantProspectGroup+" WHERE group_id =  " + group_id + ") AND status_id = " + constantsObj.getGroupRecognitionTested() + " ) IS NOT NULL THEN"+
            " pg.group_id = " + group_id + " AND pc.client_id = (SELECT client_id FROM " +dbTableName.iklantProspectClient+ " WHERE sub_leader_global_number  = (SELECT leader_global_number FROM "+dbTableName.iklantProspectGroup+" WHERE group_id =  "+ group_id +") AND status_id = " + constantsObj.getGroupRecognitionTested() + " )"+
            " ELSE  pc.client_id = (SELECT client_id FROM "+dbTableName.iklantProspectClient+" WHERE group_id = "+ group_id +" AND status_id = " + constantsObj.getGroupRecognitionTested() + " LIMIT 1 ) END "+
            " LIMIT 1";
            customLog.info("ciQuery "+ciQuery);
            clientConnect.query(ciQuery, function selectCb(err, groupDetailsResultSet, fields) {
                if (err) {
                    connectionDataSource.releaseConnectionPool(clientConnect);
                    customLog.error(err);
                } else{
                    var clientQuery =  "SELECT 	pc.client_id,pc.client_global_number, pc.`client_name` AS firstName,   "+
                        "	pc.`client_last_name` AS lastName,pc.loan_count,IFNULL(imm.`mifos_client_customer_id`,0) AS mifos_client_customer_id, "+
                        "	DATE_FORMAT(pcp.`date_of_birth`,'%Y%m%d') AS dateOfBirth, "+
                        "	IFNULL(SUBSTRING_INDEX(pcp.`address`,',',2),'') AS line1, "+
                        "	IFNULL(SUBSTRING_INDEX(SUBSTRING_INDEX(pcp.`address`,',',3),',',-1),'') AS line2, "+
                        "	IFNULL(SUBSTRING_INDEX(SUBSTRING_INDEX(pcp.`address`,',',4),',',-1),'') AS city, "+
                        "	st.state_name AS state, "+
                        "	pcp.pincode AS zip, "+
                        "	pcp.`mobile_number` AS phoneNumber, "+
                        "	pc.`created_by` AS formedBy, "+
                        "	IF(pcp.`gender` = 1,662,IF(pcp.`marital_status` = 3,664,663)) AS salutation, "+
                        "	IF(pcp.`gender` = 1,49,50) AS gender, "+
                        "   IF(pcp.`marital_status` = 4,665,  "+
                        "   IF(pcp.`marital_status` = 3,666,  "+
                        "   IF(pcp.`marital_status` = 49,667,  "+
                        "   IF(pcp.`marital_status` = 48,668,665)))) AS maritialStatus,  "+
                        "   IF(pcp.`religion` = 7,669, "+
                        "   IF(pcp.`religion` = 9,670,  "+
                        "   IF(pcp.`religion` = 8,671,673))) AS religion, "+
                        "   IF(pcp.`educational_details` = 17,676,  "+
                        "   IF(pcp.`educational_details` = 18,677,674)) AS educationalQualification, "+
                        "   IF(pcp.`nationality` = 6,836,679) AS nationality, "+
                        "	IF(pc.`family_monthly_income`<5000,41,IF(pc.`family_monthly_income` > 5000 && pc.`family_monthly_income` <= 10000,42,43)) AS povertyStatus, "+
                        "	IFNULL(pcp.`guardian_name`,pcg.`guarantor_name`) AS spouseFatherFirstName, "+
                        "   IFNULL(pcp.`guardian_lastname`,pcg.`guarantor_name`) AS spouseFatherLastName, "+
                        "	IF(pcg.`guarantor_relationship` = 55,2, "+
                        "	IF(pcg.`guarantor_relationship` = 56,4, "+
                        "	IF(pcg.`guarantor_relationship` = 57,1, "+
                        "	IF(pcg.`guarantor_relationship` = 58,10, "+
                        "	IF(pcg.`guarantor_relationship` = 59,9, "+
                        "	IF(pcg.`guarantor_relationship` = 60,5, "+
                        "	IF(pcg.`guarantor_relationship` = 65,11, "+
                        "	IF(pcg.`guarantor_relationship` = 66,13, "+
                        "	IF(pcg.`guarantor_relationship` = 67,8, "+
                        "	IF(pcg.`guarantor_relationship` = 68,6,15)))))))))) AS spouseFatherNameType, "+
                        "	pg.`created_by` AS loanOfficerId, "+
                        "	pg.`office_id` AS officeId, "+
                        "	pcp.`ration_card_number` AS rationCardNumber, "+
                        "	pcp.`voter_id` AS voterId, "+
                        "   IF(pcp.`caste` = 11,'OC', "+
                        "	IF(pcp.`caste` = 12,'BC', "+
                        "	IF(pcp.`caste` = 13,'MBC', "+
                        "	IF(pcp.`caste` = 14,'SC', "+
                        "	IF(pcp.`caste` = 15,'ST','Others'))))) AS caste, "+
                        "	IF(pcb.`is_bank_account` = 1,'Yes','No') AS isBankAccountAvailable, "+
                        "	IF(pcb.`is_insurance_lifetime` IS NOT NULL,'Yes','No') AS isInsuranceAvailable, "+
                        "	pch.`vehicle_details` AS asset, "+
                        "	IF(pch.house_type = 32,'Yes','No') ownHouse, "+
                        "	IF(pc.`family_monthly_income`<5000,'Less than 5000',IF(pc.`family_monthly_income` > 5000 && pc.`family_monthly_income` <= 10000,'Up to Rs.10000','Above Rs.10000')) AS borrowersHouseholdIncome, "+
                        "	(SELECT COUNT(pcf.`client_id`) FROM "+dbTableName.iklantProspectClientFamilyDetail+" pcf WHERE pcf.`client_id` = pc.`client_id`) AS earningMembersInTheBorrowerFamily, "+
                        "	IF(pc.`loan_repayment_track_record` = 50,'New', "+
                        "	IF(pc.`loan_repayment_track_record` = 51,'Very Good', "+
                        "	IF(pc.`loan_repayment_track_record` = 52,'Good','Average'))) AS borrowersLoanRepaymentTrackRecord, "+
                        "	pcp.`aadhaar_number` AS aadhaarNumber, "+
                        "	pcp.`gas_number` AS gasNumber, "+
                        "	pcp.`other_id1` AS otherId1, "+
                        "	pcp.`other_id2` AS otherId2 "+
                        "	  "+
                        "FROM 	"+dbTableName.iklantProspectGroup+" pg "+
                        "	INNER JOIN "+dbTableName.iklantProspectClient+" pc ON pc.`group_id` = pg.`group_id` "+
                        "	INNER JOIN "+dbTableName.iklantProspectClientPersonal+" pcp ON pcp.`client_id` = pc.`client_id` "+
                        "	INNER JOIN "+dbTableName.iklantOffice+" o ON o.office_id = pg.office_id "+
                        "	INNER JOIN iklant_state_list st ON st.state_id = o.state_id "+
                        "	LEFT JOIN "+dbTableName.iklantProspectClientGuarantor+" pcg ON pcg.`client_id` = pc.`client_id` "+
                        "	LEFT JOIN "+dbTableName.iklantprospectClientBankDetail+" pcb ON pcb.`client_id` = pc.`client_id` "+
                        "	LEFT JOIN "+dbTableName.iklantProspectClientHouseDetail+" pch ON pch.`client_id` = pc.`client_id` "+
                        "   LEFT JOIN "+dbTableName.iklantMifosMapping+" imm ON imm.client_id = pc.client_id "+
                        "WHERE pc.`group_id` = " + group_id+" AND pc.status_id = " + constantsObj.getGroupRecognitionTested() + " GROUP BY pc.client_id "+
                        "ORDER BY pc.client_id ";
                    customLog.info("clientQuery:" + clientQuery);
                    clientConnect.query(clientQuery, function selectCb(err, clientDetailsResultSet) {
                        customLog.info("In Client Detail");
                        if (err) {
                            connectionDataSource.releaseConnectionPool(clientConnect);
                            customLog.error(err);
                        } else{
                            var mifosClientStatus = 1;
                            for(var i=0; i<clientDetailsResultSet.length; i++){
                                if(clientDetailsResultSet[i].mifos_client_customer_id == null  && clientDetailsResultSet[i].loan_count > 1){
                                    mifosClientStatus = 0;
                                }
                            }
                            var mifosRejectedCustomerIdQuery = "SELECT c.customer_id FROM customer c " +
                                "INNER JOIN iklant_mifos_mapping imm ON imm.mifos_client_customer_id = c.customer_id " +
                                "INNER JOIN iklant_prospect_group ipg ON ipg.`group_id` = imm.`group_id` "+
                                "INNER JOIN iklant_prospect_client ipc ON ipc.client_id = imm.client_id " +
                                "WHERE ipc.status_id NOT IN (" + constantsObj.getGroupRecognitionTested() + ") AND ipc.group_id = " + group_id + " AND imm.mifos_client_customer_id IS NOT NULL "+
                                "AND ipc.`loan_count` = ipg.`loan_count` ";
                            var rejectedClientIds = new Array();
                            console.log("mifosRejectedCustomerIdQuery:"+mifosRejectedCustomerIdQuery);
                            clientConnect.query(mifosRejectedCustomerIdQuery, function selectCb(error, rejectedClientDetails) {
                                connectionDataSource.releaseConnectionPool(clientConnect);
                                if(!error){
                                    for(var i=0;i<rejectedClientDetails.length;i++){
                                        rejectedClientIds[i] = rejectedClientDetails[i].customer_id;
                                    }
                                    callback(groupDetailsResultSet,clientDetailsResultSet,mifosClientStatus,rejectedClientIds);
                                }
                                else{
                                    callback(groupDetailsResultSet,clientDetailsResultSet,mifosClientStatus,rejectedClientIds);
                                }
                            });
                        }
                    });
                }
            });
        });
    },

    rejectIdleClientsDataModel : function(clientId, callback){
        var constantsObj = this.constants;
        var updateClientQuery = "UPDATE " + dbTableName.iklantProspectClient + " SET status_id=" + constantsObj.getRejectedWhileIdleGroupsStatusId() + ", " +
            "updated_date=NOW() + INTERVAL 5 HOUR + INTERVAL 30 MINUTE, remarks_for_rejection = 'Rejected while idle stage' WHERE client_id='" + clientId + "'";
        connectionDataSource.getConnection(function (clientConnect) {
            clientConnect.query(updateClientQuery, function selectCb(err) {
                connectionDataSource.releaseConnectionPool(clientConnect);
                if(err){
                    callback('failure');
                }
                else{
                    callback('success');
                }
            })
        })
    },

    rejectIdleGroupDataModel : function(groupId, callback){
        var constantsObj = this.constants;
        var updateGroupQuery = "UPDATE " + dbTableName.iklantProspectGroup + " SET status_id=" + constantsObj.getRejectedWhileIdleGroupsStatusId() + ", " +
            "updated_date = NOW() + INTERVAL 5 HOUR + INTERVAL 30 MINUTE, is_idle = 0, last_credit_check_date = NULL, remarks = 'Rejected while idle stage' WHERE group_id=" + groupId;
        connectionDataSource.getConnection(function (clientConnect) {
            clientConnect.query(updateGroupQuery, function(err) {
                connectionDataSource.releaseConnectionPool(clientConnect);
                if(err){
                    callback('failure');
                }
                else{
                    callback('success');
                }
            })
        })
    },

    approveIdleGroupDataModel : function(groupId, statusId, callback){
        var constantsObj = this.constants;
        var updateClientQuery = "UPDATE " + dbTableName.iklantProspectClient + " SET status_id=" + constantsObj.getDataVerificationOperationId() + ", " +
            "updated_date = NOW() + INTERVAL 5 HOUR + INTERVAL 30 MINUTE WHERE group_id=" + groupId + " AND status_id = "+statusId;
        connectionDataSource.getConnection(function (clientConnect) {
            clientConnect.query(updateClientQuery, function(err) {
                if(err){
                    connectionDataSource.releaseConnectionPool(clientConnect);
                    callback('failure');
                }
                else{
                    var updateGroupQuery = "UPDATE " + dbTableName.iklantProspectGroup + " SET status_id=" + constantsObj.getDataVerificationOperationId() + ", " +
                        "updated_date = NOW() + INTERVAL 5 HOUR + INTERVAL 30 MINUTE, last_credit_check_date = NULL, is_idle = 0, remarks = " + statusId + " WHERE group_id=" + groupId;
                    clientConnect.query(updateGroupQuery, function(err) {
                        connectionDataSource.releaseConnectionPool(clientConnect);
                        if (err) {
                            callback('failure');
                        } else {
                            callback('success');
                        }
                    });
                }
            })
        })
    },

    updateClientStatusDataModel: function (clientIdListArray, clientIds, overdues, callback) {
        var self = this;
        var constantsObj = this.constants;
        var newGroupStatus = constantsObj.getNewGroup();
        var preliminaryVerifiedStatus = constantsObj.getPreliminaryVerified();
        var rejectedPriliminaryVerificationStatus = constantsObj.getRejectedPriliminaryVerification();
        var assignedFOStatus = constantsObj.getAssignedFO();
        var fieldVerifiedStatus = constantsObj.getFieldVerified();
        var rejectedFieldVerifiedStatus = constantsObj.getRejectedFieldVerification();
        var appraisedStatus = constantsObj.getAppraisedStatus();
        var rejectedAppraisal = constantsObj.getRejectedAppraisal();
        connectionDataSource.getConnection(function (clientConnect) {
            for (var j = 0; j < clientIdListArray.length; j++) {
                for (var i = 0; i < clientIds.length; i++) {
                    if (clientIdListArray[j] == clientIds[i]) {
                        var updateClientStatusForRejectedClient = "UPDATE "+dbTableName.iklantProspectClient+" pc  " +
                            "SET pc.status_id = IF (pc.status_id IN " +
                            "(" + newGroupStatus + "," + preliminaryVerifiedStatus + ", " +
                            "" + rejectedPriliminaryVerificationStatus + ")," + rejectedPriliminaryVerificationStatus + ", " +
                            "IF (pc.status_id IN (" + assignedFOStatus + "," + fieldVerifiedStatus + ", " +
                            "" + rejectedFieldVerifiedStatus + ")," + rejectedFieldVerifiedStatus + ", " +
                            "IF (pc.status_id IN (" + fieldVerifiedStatus + "," + appraisedStatus + ", " +
                            "" + rejectedAppraisal + ")," + rejectedAppraisal + ", pc.status_id))), " +
                            "pc.is_overdue = " + constantsObj.getActiveIndicatorTrue() + ", " +
                            "pc.remarks_for_rejection = '" + overdues[i] + "', pc.updated_date = NOW() + INTERVAL 5 HOUR + INTERVAL 30 MINUTE " +
                            "WHERE  pc.client_id = " + clientIdListArray[j] + "";
                        customLog.info("updateClientStatusForRejectedClient" + updateClientStatusForRejectedClient);
                        clientConnect.query(updateClientStatusForRejectedClient, function postCreate(err) {
                            if (err) {
                                customLog.error(err);
                                connectionDataSource.releaseConnectionPool(clientConnect);
                            }
                        });
                        break;
                    }
                    else {
                        customLog.info("clientIdListArray In else" + clientIdListArray[j]);
                        var updateClientStatusForReintiatedClient = "UPDATE "+dbTableName.iklantProspectClient+" pc " +
                            "SET pc.status_id = IF (pc.status_id IN (" + newGroupStatus + ", " +
                            "" + preliminaryVerifiedStatus + "," + rejectedPriliminaryVerificationStatus + "), " +
                            "" + preliminaryVerifiedStatus + ", " +
                            "IF (pc.status_id IN (" + assignedFOStatus + "," + fieldVerifiedStatus + ", " +
                            "" + rejectedFieldVerifiedStatus + ")," + fieldVerifiedStatus + ", " +
                            "IF (pc.status_id IN (" + fieldVerifiedStatus + "," + appraisedStatus + "," + rejectedAppraisal + "), " +
                            "" + appraisedStatus + ", pc.status_id))), " +
                            "pc.is_overdue=" + constantsObj.getActiveIndicatorFalse() + ", " +
                            "pc.updated_date = NOW() + INTERVAL 5 HOUR + INTERVAL 30 MINUTE WHERE  pc.client_id = " + clientIdListArray[j] + "";

                        customLog.info("updateClientStatusForReintiatedClient" + updateClientStatusForReintiatedClient);
                        clientConnect.query(updateClientStatusForReintiatedClient, function postCreate(err) {
                            if (err) {
                                customLog.error(err);
                                connectionDataSource.releaseConnectionPool(clientConnect);
                            }
                        });
                    }
                }
            }
            connectionDataSource.releaseConnectionPool(clientConnect);
            callback();
        });
    },

    reinitiateGroupDatamodel: function (groupId, remarks, callback) {
        var self=this;
        var constantsObj = this.constants;
        var reinitiatedStatus = "";
        var previousStatus = 0;
        var previousStatusQuery = "SELECT remarks AS previousStatus FROM "+dbTableName.iklantProspectGroup+" WHERE group_id = "+ groupId;
        connectionDataSource.getConnection(function (clientConnect) {
            clientConnect.query(previousStatusQuery, function selectCb(err, results, fields) {
                if(!err && results.length>0){
                    var status = (results[0].previousStatus)?results[0].previousStatus:0;
                    if(status !=0 && (status == constantsObj.getCreditBureauAnalysedStatus() || status == constantsObj.getAssignedFO())){
                        previousStatus = constantsObj.getCreditBureauAnalysedStatus();
                    }
                    else if(status != 0 && (status == constantsObj.getFieldVerified() || status == constantsObj.getGroupRecognitionTested() || status == constantsObj.getAppraisedStatus() || status == constantsObj.getAuthorizedStatus())){
                        previousStatus = constantsObj.getFieldVerified();
                    }
                    else{
                        previousStatus = 0;
                    }
                    var reinitiateQuery = "UPDATE "+dbTableName.iklantProspectGroup+" pg, "+dbTableName.iklantProspectClient+" pc " +
                        "SET pg.status_id = IF (pg.status_id=" + constantsObj.getRejectedPriliminaryVerification() + ", " +
                        "" + constantsObj.getPreliminaryVerified() + ", " +
                        "IF (pg.status_id=" + constantsObj.getRejectedCreditBureauAnalysisStatusId() + " AND "+previousStatus+" <> 0, " +
                        "" + previousStatus + ", " +
                        "IF (pg.status_id=" + constantsObj.getRejectedCreditBureauAnalysisStatusId() + " AND "+previousStatus+" = 0, " +
                        "" + constantsObj.getCreditBureauAnalysedStatus() + ", " +
                        "IF (pg.status_id=" + constantsObj.getRejectedFieldVerification() + ", " +
                        "" + constantsObj.getFieldVerified() + ",IF (pg.status_id=" + constantsObj.getRejectedAppraisal() + ", " +
                        "" + constantsObj.getAppraisedStatus() + "," + constantsObj.getNewGroup() + "))))), " +
                        "pg.remarks = '" + remarks + "', pg.updated_date = NOW() + INTERVAL 5 HOUR + INTERVAL 30 MINUTE " +
                        "WHERE pg.group_id = " + groupId + "";// AND pc.group_id = "+groupId+"";
                    customLog.info("reinitiateQuery : "+reinitiateQuery);
                    clientConnect.query(reinitiateQuery, function selectCb(err, results, fields) {
                        if (err) {
                            connectionDataSource.releaseConnectionPool(clientConnect);
                            customLog.error(err);
                            callback(reinitiatedStatus);
                        }
                        else{
                            var getStatusQuery = "SELECT ps.status_name FROM "+dbTableName.iklantProspectGroup+" pg " +
                                "INNER JOIN "+dbTableName.iklantProspectStatus+" ps ON ps.status_id = pg.status_id " +
                                "WHERE pg.group_id = " + groupId + "";
                            clientConnect.query(getStatusQuery, function selectCb(err, results, fields) {
                                connectionDataSource.releaseConnectionPool(clientConnect);
                                if (err) {
                                    customLog.error(err);
                                    callback(reinitiatedStatus);
                                } else {
                                    reinitiatedStatus = results[0].status_name;
                                    callback(reinitiatedStatus);
                                }
                            });
                        }
                    });
                }
                else{
                    connectionDataSource.releaseConnectionPool(clientConnect);
                    callback(reinitiatedStatus);
                }
            });
        });
    },

    addQuestionsDataModel: function (tenantId, callback) {
        var questionId = new Array();
        var questionsNonDefault = new Array();
        var self=this;
        var questionsNonDefaultQuery = "SELECT * FROM "+dbTableName.iklantQuestions+" WHERE is_default=1 AND tenant_id=" + tenantId + " ";
        connectionDataSource.getConnection(function (clientConnect) {
            clientConnect.query(questionsNonDefaultQuery, function selectCb(err, results, fields) {
                connectionDataSource.releaseConnectionPool(clientConnect);
                if (err) {
                    customLog.error(err);
                } else {
                    for (var i in results) {
                        questionId[i] = results[i].question_Id;
                        questionsNonDefault[i] = results[i].question_Name;
                        customLog.info("inside for" + questionId, questionsNonDefault);
                    }
                    callback(questionId, questionsNonDefault);
                }
            });
        });
    },

    questionsSelectDataModel: function (tenantId, selectedQuestionId, callback) {
        var questionsRequire = require(commonDTO+"/questions");
        var questionsObj = new questionsRequire();
        var choice_id = new Array();
        var choice_name = new Array();
        var marks = new Array();
        var self=this;
        var answersFetchQuery = "SELECT q.question_id,q.question_Name,q.display_name,q.weightage, " +
            "c.choice_id,c.choice_name,c.choice_marks " +
            "FROM "+dbTableName.iklantQuestions+" q " +
            "INNER JOIN "+dbTableName.iklantChoices+" c on c.question_id = q.question_id " +
            "WHERE q.question_Id = '" + selectedQuestionId + "' AND q.is_default=1 " +
            "AND q.tenant_id=" + tenantId + " ";
        connectionDataSource.getConnection(function (clientConnect) {
            clientConnect.query(answersFetchQuery, function selectCb(err, results, fields) {
                connectionDataSource.releaseConnectionPool(clientConnect);
                if (err) {
                    customLog.error(err);
                } else {
                    questionsObj.clearAll();
                    var questionsName = questionsObj.setQuestion(results[0].question_Name);
                    var displayName = questionsObj.setDisplaytext(results[0].display_name);
                    var weightage = questionsObj.setWeightage(results[0].weightage);
                    for (var i in results) {
                        choice_id[i] = results[i].choice_id;
                        choice_name[i] = results[i].choice_name;
                        marks[i] = results[i].choice_marks;
                    }
                    questionsObj.setChoiceId(choice_id);
                    questionsObj.setChoiceName(choice_name);
                    questionsObj.setMarks(marks);
                    callback(questionsObj);
                }
            });
        });
    },

    saveQuestionDataModel: function (tenantId, submitId, callback) {
        var choicesRequire = require(commonDTO+"/choices");
        var questionsRequire = require(commonDTO+"/questions");
        var questionsObj = new questionsRequire();
        var choiceObj = new choicesRequire();
        var self=this;
        customLog.info("submitId DM== " + submitId);
        connectionDataSource.getConnection(function (clientConnect) {
            if (submitId == 0) {
                var question_Name = questionsObj.getQuestion();
                var display_name = questionsObj.getDisplaytext();
                var weightage = questionsObj.getWeightage();
                var currentQuestionId;
                var insertQuestionQuery = "INSERT INTO "+dbTableName.iklantQuestions+" (tenant_id,question_Name,display_name,weightage, " +
                    "questionnaire_version,is_default,created_date) " +
                    "VALUES(" + tenantId + ",'" + question_Name + "','" + display_name + "', " +
                    "" + weightage + "," + 1.0 + "," + 1 + ", NOW() + INTERVAL 5 HOUR + INTERVAL 30 MINUTE)";
                customLog.info("insertQuestionQuery : " + insertQuestionQuery);
                clientConnect.query(insertQuestionQuery, function postCreate(err) {
                    if (err) {
                        customLog.error(err);
                        connectionDataSource.releaseConnectionPool(clientConnect);
                    }
                });

                var currentQuestionIdQuery = "SELECT MAX(question_Id) AS current_question FROM "+dbTableName.iklantQuestions+
                    " where tenant_id=" + tenantId + " ";
                clientConnect.query(currentQuestionIdQuery, function selectCb(err, results, fields) {
                    if (err) {
                        connectionDataSource.releaseConnectionPool(clientConnect);
                        customLog.error(err);
                    }
                    else {
                        for (var i in results) {
                            currentQuestionId = results[i].current_question;
                        }
                        var choiceArray = new Array();
                        var marksArray = new Array();
                        choiceArray = choiceObj.getChoice();
                        customLog.info(choiceArray);
                        marksArray = choiceObj.getMarks();
                        for (var i = 0; i < choiceArray.length; i++) {
                            var choice_id = i + 1;
                            var insertChoicesQuery = "INSERT INTO "+dbTableName.iklantChoices+" (question_id,choice_id,choice_name,choice_marks) " +
                                "VALUES(" + currentQuestionId + "," + choice_id + ",'" + choiceArray[i] + "'," + marksArray[i] + " );"
                            clientConnect.query(insertChoicesQuery, function postCreate(err) {
                                if (err) {
                                    customLog.error(err);
                                    connectionDataSource.releaseConnectionPool(clientConnect);
                                }

                            });
                        }
                        connectionDataSource.releaseConnectionPool(clientConnect);
                        callback();
                    }
                });
            }
            else if (submitId == 1) {
                //query to update questions
                var updateEditedQuestionsQuery = "UPDATE "+dbTableName.iklantQuestions+" SET question_Name='" + questionsObj.getQuestionEdit() + "', " +
                    "display_name='" + questionsObj.getDisplayEdit() + "', " +
                    "weightage='" + questionsObj.getWeightageEdit() + "' ,updated_date= NOW() + INTERVAL 5 HOUR + INTERVAL 30 MINUTE " +
                    "WHERE tenant_id=" + tenantId + " AND question_Id=" + questionsObj.getQuestionIDEdit();

                clientConnect.query(updateEditedQuestionsQuery,
                    function postCreate(err) {
                        if (err) {
                            customLog.error(err);
                            connectionDataSource.releaseConnectionPool(clientConnect);
                        }
                    });
                //query to update answers & marks
                var choiceIdArray = questionsObj.getChoice_ID().split(",");
                var answersArray = questionsObj.getAnswersEdit().split(",");
                var marksArray = questionsObj.getMarksEdit().split(",");

                customLog.info("A= " + answersArray);
                customLog.info("M= " + marksArray);

                for (var i = 0; i < answersArray.length; i++) {
                    var updateEditedAnswersQuery = "UPDATE "+dbTableName.iklantChoices+" SET choice_name ='" + answersArray[i] + "', " +
                        "choice_marks='" + marksArray[i] + "' " +
                        "WHERE question_Id='" + questionsObj.getQuestionIDEdit() + "' " +
                        "AND choice_id = " + choiceIdArray[i];
                    clientConnect.query(updateEditedAnswersQuery,function postCreate(err) {
                        if (err) {
                            connectionDataSource.releaseConnectionPool(clientConnect);
                            customLog.error(err);
                        }
                    });
                }
                connectionDataSource.releaseConnectionPool(clientConnect);
                callback();
            }
        });
    },

    calculateSecondaryAppraisalDataModel: function (tenantId, clientId, secondaryQuestionId, selectedAnswerArray, callback) {
        var self=this;
        var questionId = new Array();
        var choice_marks = new Array();
        var weightage = new Array();
        var secondaryRating;
        var totalRatingWeightage = new Array();
        var groupId;
        var clientAppraisalRating;
        var forIteration;
        var secQueForInsert = new Array();
        if (isNaN(secondaryQuestionId - 1)) {
            forIteration = secondaryQuestionId.length;
            for (var i = 0; i < secondaryQuestionId.length; i++) {
                secQueForInsert[i] = secondaryQuestionId[i];
            }
        }
        else {
            forIteration = 1;
            secQueForInsert[0] = secondaryQuestionId;
        }
        connectionDataSource.getConnection(function (clientConnect) {
            for (var i = 0; i < forIteration; i++) {
                var secondaryAppraisalQuery = "INSERT INTO "+dbTableName.iklantClientAssessment+" (client_id,question_id,answer_id,created_date) " +
                    "VALUES(" + clientId + "," + secQueForInsert[i] + "," + selectedAnswerArray[i] + ",NOW() + INTERVAL 5 HOUR + INTERVAL 30 MINUTE)";
                customLog.info("secondaryAppraisalQuery : " + secondaryAppraisalQuery);
                clientConnect.query(secondaryAppraisalQuery, function selectCb(err, results, fields) {
                    if (err) {
                        connectionDataSource.releaseConnectionPool(clientConnect);
                        customLog.error(err);
                    }
                });
            }
            var calculateSecondaryAppraisalQuery = "SELECT pc.group_id,c.question_id,c.choice_name, " +
                "c.choice_marks,q.weightage,cr.appraisal_rating FROM "+dbTableName.iklantChoices+" c " +
                "INNER JOIN "+dbTableName.iklantProspectClient+" pc ON pc.client_id = " + clientId + " " +
                "INNER JOIN "+dbTableName.iklantQuestions+" q ON q.is_default = 1 " +
                "INNER JOIN "+dbTableName.iklantClientRating+" cr ON cr.client_id = " + clientId + " " +
                "INNER JOIN "+dbTableName.iklantClientAssessment+" ca ON ca.question_id = q.question_Id " +
                "WHERE ca.client_id = " + clientId + " AND c.choice_id = ca.answer_id " +
                "AND c.question_id = ca.question_id AND q.tenant_id=" + tenantId + "";

            customLog.info("calculateSecondaryAppraisalQuery : " + calculateSecondaryAppraisalQuery);
            clientConnect.query(calculateSecondaryAppraisalQuery, function selectCb(err, results, fields) {
                if (err) {
                    connectionDataSource.releaseConnectionPool(clientConnect);
                    customLog.error(err);
                }
                else {
                    for (var i in results) {
                        clientAppraisalRating = results[i].appraisal_rating;
                        groupId = results[i].group_id;
                        questionId[i] = results[i].question_id;
                        choice_marks[i] = results[i].choice_marks;
                        weightage[i] = results[i].weightage;
                    }
                    secondaryRating = calculateCCAForClient(choice_marks, weightage);
                    totalRatingWeightage = calculateTotalCCAForClient(choice_marks, weightage, clientAppraisalRating)
                    customLog.info("totalRatingWeightage " + totalRatingWeightage);
                }
                var updateSecondaryAppraisalQuery = "UPDATE "+dbTableName.iklantClientRating+" SET appraisal_rating = " + totalRatingWeightage[0] + ", secondary_rating = " + secondaryRating + ",total_weightage_obtained=" + totalRatingWeightage[1] + ",total_weightage_required=" + totalRatingWeightage[2] + " WHERE client_id= " + clientId + "";
                clientConnect.query(updateSecondaryAppraisalQuery, function selectCb(err, results, fields) {
                    connectionDataSource.releaseConnectionPool(clientConnect);
                    if (err) {
                        customLog.error(err);
                    }
                    else {
                        callback(groupId, secondaryRating, totalRatingWeightage[2]);
                    }
                });
            });
        });
    },

    skipKycUploadDatamodel: function (groupId, callback) {
        var self=this;
        var constantsObj = this.constants;
        var groupInsertQuery = "UPDATE "+dbTableName.iklantProspectGroup+" pg, "+dbTableName.iklantProspectClient+" pc " +
            "SET pg.status_id=" + constantsObj.getKYCUploaded() + ", " +
            "pc.status_id=if(pc.is_overdue=0," + constantsObj.getKYCUploaded() + ",pc.status_id), " +
            "pg.updated_date=NOW() + INTERVAL 5 HOUR + INTERVAL 30 MINUTE,pc.updated_date=NOW() + INTERVAL 5 HOUR + INTERVAL 30 MINUTE WHERE " +
            "pg.group_id = " + groupId + " AND pc.group_id = " + groupId + " ";
        customLog.info("groupInsertQuery : " + groupInsertQuery);
        connectionDataSource.getConnection(function (clientConnect) {
            clientConnect.query(groupInsertQuery, function postCreate(err) {
                connectionDataSource.releaseConnectionPool(clientConnect);
                if (err) {
                    customLog.error(err);
                }
                callback();
            });
        });
    },

    // Ended by SathishKumar M
    getActiveOrRejectedClientsDataModel: function (group_id, callBack) {
        var self = this;
        var clientDetails = new Array();
        var reinitiatedDetails = new Array();
        var rejectedDetails = new Array();
        var reintiatedClients = new Array();
        var lastCreditCheckDate = new Array();
        var constantsObj = this.constants;
        var status = true;
        var activeOrRejectedDetailsQuery = "SELECT 	pc.client_name,IF(pg.status_id = pc.status_id,0,1) AS is_rejected, " +
            "IF(irc.is_rm_reinitiated = 1 && irc.is_bm_reinitiated = 1,1,0) AS is_reinitiated, " +
            "IFNULL(irc.is_rm_reinitiated,0) AS is_rm_reinitiated,IFNULL(irc.is_bm_reinitiated,0) AS is_bm_reinitiated," +
            "IF(pc.status_id = "+constantsObj.getRejectedCreditBureauAnalysisStatusId()+",pc.updated_date,ps.status_name) AS last_credit_date " +
            "FROM iklant_prospect_client pc " +
            "INNER JOIN iklant_prospect_group pg ON pg.group_id = pc.group_id " +
            "INNER JOIN iklant_prospect_status ps ON ps.status_id = pc.status_id " +
            "LEFT JOIN iklant_rejected_client_status irc ON irc.client_id = pc.client_id " +
            "WHERE  pg.group_id = " + group_id + " GROUP BY pc.client_id ORDER BY is_rejected";
        customLog.info("activeOrRejectedDetailsQuery: "+activeOrRejectedDetailsQuery);
        connectionDataSource.getConnection(function (clientConnect) {
            clientConnect.query(activeOrRejectedDetailsQuery, function (error, activeOrRejectedClients) {
                connectionDataSource.releaseConnectionPool(clientConnect);
                if (error) {
                    callBack(false);
                }
                else {
                    var j=0;
                    for(var i = 0; i < activeOrRejectedClients.length; i++){
                        if(activeOrRejectedClients[i].is_bm_reinitiated == 1 && activeOrRejectedClients[i].is_rm_reinitiated == 0){
                            status = false;
                            reintiatedClients[j] = activeOrRejectedClients[i].client_name;
                            j++
                        }
                        clientDetails[i] = activeOrRejectedClients[i].client_name;
                        rejectedDetails[i] = activeOrRejectedClients[i].is_rejected;
                        reinitiatedDetails[i] = activeOrRejectedClients[i].is_reinitiated;
                        lastCreditCheckDate[i] = activeOrRejectedClients[i].last_credit_date.toString();
                    }
                    callBack(status,clientDetails,rejectedDetails,reinitiatedDetails,reintiatedClients,lastCreditCheckDate);
                }
            });
        });
    },

    downloadRequstedImageDataModel: function (tenantId, clientId, docId, callback) {
        var self = this;
        var fileLocation = new Array();
        customLog.info("clientId" + clientId);
        customLog.info("docId" + docId);
        var downloadRequstedImageQuery = "select Captured_image from "+dbTableName.iklantClientDoc+"  where client_id = " + clientId + " and doc_type_id = " + docId + " ";
        customLog.info("downloadRequstedImageQuery" + downloadRequstedImageQuery);
        connectionDataSource.getConnection(function (clientConnect) {
            clientConnect.query(downloadRequstedImageQuery,
                function selectCb(err, results, fields) {
                    connectionDataSource.releaseConnectionPool(clientConnect);
                    if (err) {
                        customLog.error(err);
                        callback(fileLocation);
                    }
                    else {
                        var fileLocationAlt = new Array();
                        for (var i in results) {
                            fileLocationAlt[i] = results[i].Captured_image;
                        }
                        customLog.info("fileLocationDatamodel All Images" + fileLocationAlt);
                        for(var j=0;j<fileLocationAlt.length;j++){
                            try{
                                var bitmap = fs.readFileSync(fileLocationAlt[j]);
                                fileLocation.push(fileLocationAlt[j]);
                            }catch(exc){
                            }
                        }
                        customLog.info("fileLocationDatamodel Only Available Images" + fileLocation);
                        callback(fileLocation);
                    }
                }
            );
        });
    },

    approveOrRejectClientForNextLoanDataModel: function (iklantGroupId,userId,callback){
        var self = this;
        var constantsObj = this.constants;
        var clientsIdArray = new Array();
        var retriveClientDetails = "SELECT ipc.client_id,ipc.status_id FROM iklant_prospect_group ipg "+
            " LEFT JOIN iklant_prospect_client ipc ON ipg.group_id = ipc.group_id "+
            " WHERE ipg.group_id = "+ iklantGroupId +" AND ipc.status_id NOT IN (21,2);"
        customLog.info("retriveClientDetails :"+retriveClientDetails);
        connectionDataSource.getConnection(function (clientConnect) {
            clientConnect.query(retriveClientDetails, function selectCb(err, results) {
                if (err) {
                    connectionDataSource.releaseConnectionPool(clientConnect);
                    customLog.error("error occured in approveOrRejectClientForNextLoanDataModel(): ", err);
                    callback("failure");
                }
                else {
                    for (var i in results) {
                        clientsIdArray.push(results[i].client_id);
                    }
                    if (clientsIdArray.length > 0) {
                        var updateQuery = "UPDATE iklant_prospect_client SET status_id = "+ constantsObj.getRejectedPreviousLoanStatusId() +" WHERE client_id IN (" + clientsIdArray + ");"
                        console.log(updateQuery);
                        clientConnect.query(updateQuery, function selectCb(err, result) {
                            connectionDataSource.releaseConnectionPool(clientConnect);
                            if (err) {
                                customLog.error("error occured in approveOrRejectClientForNextLoanDataModel(): ", err);
                                callback("failure");
                            }
                            else{
                                callback("success");
                            }
                        });
                    }
                    else{
                        callback("success");
                    }
                }
            });
        });
    }
};
