module.exports = loanRecoveryDataModel;

var path = require('path');
var rootPath = path.dirname(process.mainModule.filename);
var lookupEntityObj;

var dbTableName = require(path.join(rootPath,"properties.json"));
var loanRecoveryDTO = path.join(rootPath,'app_modules/dto/loan_recovery');

var connectionDataSource = require(path.join(rootPath,"app_modules/data_model/DataSource"));
var customlog = require(path.join(rootPath,"logger/loggerConfig.js"))('LoanRecoveryDataModel.js');

//Business Layer
function loanRecoveryDataModel(constants) {
    customlog.debug("Inside LUC Data Access Layer");
    this.constants = constants;
}

loanRecoveryDataModel.prototype = {

    //Added by Sathish Kumar M 008 For Loan Recovery Module

    getClientPaymentsDetailDataModel: function(paymentCollectionId,callback){
        var collectedPaymentsArray = [];
        var PaymentCollection = require(path.join(loanRecoveryDTO,"/PaymentCollection.js"));
        var collection;
        var retrievePaymentCollectionsQuery = " SELECT pcc.client_payment_amount due_amount,  "+
            " pers.display_name fo_name, "+
            " pc.transaction_date, "+
            " cad.phone_number, "+
            " cus.display_name  "+
            " FROM `payment_collection` pc "+
            " INNER JOIN `payment_collection_client` pcc ON (pc.`payment_collection_id` = pcc.payment_collection_id) "+
            " INNER JOIN `account` acc ON (acc.account_id = pc.account_id) "+
            " INNER JOIN personnel pers ON (pers.personnel_id = acc.personnel_id) "+
            " INNER JOIN account act ON (pcc.client_id = act.account_id) "+
            " INNER JOIN customer cus ON (act.customer_id = cus.customer_id) "+
            " INNER JOIN `customer_address_detail` cad ON (cad.customer_id = cus.customer_id) "+
            " WHERE pc.payment_collection_id = "+paymentCollectionId+" AND pcc.client_payment_amount <> 0 "

        connectionDataSource.getConnection(function (clientConnect) {
            clientConnect.query(retrievePaymentCollectionsQuery, function selectCb(err, results) {
                connectionDataSource.releaseConnectionPool(clientConnect);
                if (err) {
                    customlog.error("retrievePaymentCollectionsQuery: ",retrievePaymentCollectionsQuery);
                    customlog.error("error occured in getClientPaymentsDetailDataModel(): ",err);
                    callback("failure");
                }
                else {
                    if (results.length > 0) {
                        for (var i in results) {
                            collection = new PaymentCollection();
                            collection.setDueAmount(results[i].due_amount);
                            collection.setFoName(results[i].fo_name);
                            customlog.debug(results[i].transaction_date);
                            collection.setReceivedDate(dateUtils.formatDateForUI(results[i].transaction_date));
                            collection.setMobileNumber(results[i].phone_number);
                            collection.setClientName(results[i].display_name);
                            collectedPaymentsArray.push(collection);
                        }
                        customlog.debug("collectedPaymentsArray: ",collectedPaymentsArray);
                        callback("success",collectedPaymentsArray);
                    }else{
                        callback("failure");
                    }
                }
            });
        });
    },
    //Added by Sathish Kumar M 008 for Changing FO module
    getLRBranchCallModelDataModel: function (userId,callback){
        var self = this;
        var constantsObj = this.constants;
        var officeName = new Array();
        var officeId = new Array();
        var dateValue;
        var retriveBranchCallQuery = " SELECT (SELECT DAY(NOW())) AS date_value,ik.office_name,ik.office_id FROM iklant_office ik "+
            "INNER JOIN rm_regional_office_list rol ON rol.office_id = ik.office_id "+
            "WHERE user_id = "+ userId +";"
        customlog.info("getLRBranchDetailDataModelQuery=" + retriveBranchCallQuery);
        connectionDataSource.getConnection(function (clientConnect) {
            clientConnect.query(retriveBranchCallQuery, function selectCb(err, results, fields) {
                connectionDataSource.releaseConnectionPool(clientConnect);
                if (!err) {
                    for (var i in results) {
                        officeName.push(results[i].office_name);
                        officeId.push(results[i].office_id);
                    }
                    dateValue = results[0].date_value;
                    callback(officeName, officeId,dateValue);
                } else {
                    customlog.error(err);
                    callback("failure");
                }
            });
        });
    },
    getLRFoDetailDataModel: function (officeId, callback) {
        var self = this;
        var constantsObj = this.constants;
        var retrieveRO = " SELECT u_role.personnel_id AS user_id,u_role.role_id,u.user_name " +
            " FROM "+dbTableName.mfiPersonnelRole+"  u_role " +
            " INNER JOIN "+dbTableName.iklantUsers+"  u ON u.user_id = u_role.personnel_id " +
            " WHERE u_role.role_id =" + constantsObj.getFOroleId() + " " +
            " AND (u.office_id = " + officeId +" OR " + officeId +" = -1)";
        connectionDataSource.getConnection(function (clientConnect) {
            clientConnect.query(retrieveRO, function selectCb(err, results, fields) {
                connectionDataSource.releaseConnectionPool(clientConnect);
                if (!err) {
                    var userName = new Array();
                    var userId = new Array();
                    for (var i in results) {
                        userName[i] = results[i].user_name;
                        userId[i] = results[i].user_id;
                    }
                    callback("", userName, userId);
                } else {
                    customlog.error(err);
                    callback();
                }
            });
        });
    },
    getLRGroupDetailDataModel: function (officeValue,userId1, callback) {
        var self = this;
        var constantsObj = this.constants;
        var retrieveGroupsDetailQuery = "SELECT 'Synchronized Groups' AS status_name,demd_account_id AS account_id,demd_parent_account_id AS parent_account_id,"+
        "customer_id AS customer_id,field_officer,group_code AS global_account_num,iklant_group_name,iklantGroup,group_name FROM ("+
        "SELECT temp.*"+
        " FROM ("+
        "SELECT "+
        "prin_demd.field_officer,"+
        "prin_demd.demd_account_id,"+
        "prin_demd.demd_group_code 		        AS group_code,"+
        "prin_demd.iklant_group_code 		        AS iklant_group_name,"+
        "prin_demd.iklant_group_id 		        AS iklantGroup,"+
        "prin_demd.demd_global_account_num 		AS client_code,"+
        "prin_demd.demd_group_name AS group_name,"+
        "prin_demd.demd_parent_account_id,"+
        "prin_demd.customer_id "+

        " FROM ("+
        "("+
        "SELECT "+
        " a.office_id AS demd_office_id,"+
        "   a.global_account_num AS demd_global_account_num,"+
        "   (SELECT cr.display_name FROM customer cr,account acc WHERE cr.customer_id = acc.customer_id"+
        " AND acc.account_id = la.parent_account_id) AS demd_group_name,"+
            "(SELECT acc.global_account_num FROM account acc,customer cr WHERE cr.customer_id = acc.customer_id"+
        " AND acc.account_id = la.parent_account_id) AS demd_group_code,"+
            "IFNULL((SELECT group_name FROM `iklant_prospect_group` WHERE group_id = (SELECT group_id FROM `iklant_mifos_mapping` WHERE `mifos_customer_id` = (SELECT `parent_customer_id` FROM customer WHERE customer_id = c.customer_id) LIMIT 1)),'Created in Mifos') AS iklant_group_code,"+
            "IFNULL((SELECT group_id FROM `iklant_prospect_group` WHERE group_id = (SELECT group_id FROM `iklant_mifos_mapping` WHERE `mifos_customer_id` = (SELECT `parent_customer_id` FROM customer WHERE customer_id = c.customer_id) LIMIT 1)),0) AS iklant_group_id,"+
            "la.account_id AS demd_account_id,"+
            "la.parent_account_id AS demd_parent_account_id,"+
            "p.personnel_id,p.display_name AS field_officer,"+
            "c.`parent_customer_id` AS customer_id "+
        " FROM 	loan_schedule ls"+
        " INNER JOIN loan_account la ON ls.account_id = la.account_id"+
        " INNER JOIN account a ON la.account_id = a.account_id"+
        " INNER JOIN customer c ON c.customer_id = a.customer_id"+
        " INNER JOIN personnel p ON p.personnel_id = a.personnel_id"+
        " INNER JOIN office o ON o.office_id = a.office_id"+
        " INNER JOIN loan_custom_detail lcd ON lcd.account_id = la.account_id"+
       " INNER JOIN rm_regional_office_list rmro ON rmro.office_id = o.office_id"+
        " WHERE"+
        "("+
            "(a.account_state_id  IN (5,6,9,19) AND ls.action_date BETWEEN (SELECT CONCAT ((SELECT YEAR(NOW())),'-','0',(SELECT MONTH(NOW())),'-','01')) AND IF(a.account_state_id IN (6,19) AND a.closed_date < (SELECT LAST_DAY (NOW())), IF(ls.action_date < a.closed_date,a.closed_date,(SELECT LAST_DAY (NOW()))), (SELECT LAST_DAY (NOW()))))"+
        " OR (a.account_state_id  IN (7,8) AND ls.action_date BETWEEN (SELECT CONCAT ((SELECT YEAR(NOW())),'-','0',(SELECT MONTH(NOW())),'-','01')) AND IF(a.closed_date < (SELECT LAST_DAY (NOW())), IF(ls.action_date < a.closed_date,a.closed_date,(SELECT LAST_DAY (NOW()))), (SELECT LAST_DAY (NOW())))"+
       " AND a.closed_date >= (SELECT CONCAT ((SELECT YEAR(NOW())),'-','0',(SELECT MONTH(NOW())),'-','01')))"+
        ")"+
        " AND"+
        " la.parent_account_id IS NOT NULL"+
        " AND (a.closed_date IS NULL OR a.closed_date >= (SELECT CONCAT ((SELECT YEAR(NOW())),'-','0',(SELECT MONTH(NOW())),'-','01')))"+
        " AND (a.office_id = "+ officeValue +" OR "+ officeValue +" = -1)"+
        " AND (p.personnel_id =  "+ userId1 +" OR "+ userId1 +" = -1)"+
        " AND la.parent_account_id IN (SELECT ac.account_id FROM account ac WHERE ac.account_state_id IN (5,6,7,8,9))"+
        " GROUP BY ls.action_date, a.office_id, o.display_name, c.display_name, a.global_account_num, la.account_id"+
        " ORDER BY ls.action_date, a.office_id, o.display_name, c.display_name, a.global_account_num, la.account_id)"+
        ") prin_demd "+
        ")temp "+
            "ORDER BY field_officer)demand GROUP BY demd_parent_account_id;";
        customlog.info("retrieveGroupsDetailQuery=" + retrieveGroupsDetailQuery);
        connectionDataSource.getConnection(function (clientConnect) {
            clientConnect.query(retrieveGroupsDetailQuery, function selectCb(err, results, fields) {
                if (!err) {
                    var LoanRecoveryGroupsObject = new Array();
                    var LoanRecoveryGroups = require(path.join(loanRecoveryDTO+"/LoanRecoveryGroups"));

                    if(results.length !=0){
                        for (var i in results) {
                            var LoanRecoveryGroupsDetail = new LoanRecoveryGroups();
                            LoanRecoveryGroupsDetail.setAccountId(results[i].account_id);
                            LoanRecoveryGroupsDetail.setCustomerId(results[i].customer_id);
                            LoanRecoveryGroupsDetail.setGlobalAccountNum(results[i].global_account_num);
                            LoanRecoveryGroupsDetail.setGroupName(results[i].group_name);
                            LoanRecoveryGroupsDetail.setGlAddress(results[i].global_account_num);
                            LoanRecoveryGroupsDetail.setiklantGroupId(results[i].iklantGroup);
                            LoanRecoveryGroupsDetail.setIklantGroupName(results[i].iklant_group_name);
                            LoanRecoveryGroupsDetail.setStatusName(results[i].status_name);
                            LoanRecoveryGroupsObject[i] = LoanRecoveryGroupsDetail;
                        }
                    }else{
                        LoanRecoveryGroupsObject = "";
                    }
                    var retrieveRO = " SELECT u_role.personnel_id AS user_id,u_role.role_id,u.user_name " +
                        " FROM "+dbTableName.mfiPersonnelRole+"  u_role " +
                        " INNER JOIN "+dbTableName.iklantUsers+"  u ON u.user_id = u_role.personnel_id " +
                        " WHERE u_role.role_id =" + constantsObj.getFOroleId() + " " +
                        " AND (u.office_id = " + officeValue +" OR " + officeValue +" = -1)";
                    clientConnect.query(retrieveRO, function selectCb(err, results, fields) {
                        if (!err) {
                            var userName = new Array();
                            var userId = new Array();
                            for (var i in results) {
                                userName[i] = results[i].user_name;
                                userId[i] = results[i].user_id;
                            }
                            connectionDataSource.releaseConnectionPool(clientConnect);
                            callback(LoanRecoveryGroupsObject,userName,userId);
                        } else {
                            connectionDataSource.releaseConnectionPool(clientConnect);
                            customlog.error(err);
                            callback();
                        }
                    });
                } else {
                    connectionDataSource.releaseConnectionPool(clientConnect);
                    customlog.error(err);
                    LoanRecoveryGroupsObject = "";
                    callback(LoanRecoveryGroupsObject,'','');
                }
            });
        });
    },
    /*getLRGroupDetailDataModel: function (officeValue,userId1, callback) {
        var self = this;
        var constantsObj = this.constants;
        var retrieveGroupsDetailQuery = "(SELECT IFNULL(ips.status_name,'Synchronized Group') AS status_name,ipg.status_id AS iklant_status ,IFNULL(ipg.group_name,'Created in mifos') AS iklant_group_name ,a.global_account_num,a.account_id as account_id,c.customer_id AS customer_id, c.display_name AS group_name ,c.parent_customer_id, CONCAT(cad.line_1,',',IFNULL(cad.line_2,''),',' ,IFNULL(cad.line_3,''),',',cad.city,',',cad.state,',',cad.country) AS address "+
            ",(IFNULL((SELECT group_id FROM iklant_mifos_mapping WHERE mifos_customer_id = c.customer_id GROUP BY mifos_customer_id),0)) AS iklantGroup "+
            " FROM customer c   INNER JOIN customer_address_detail cad ON c.customer_id = cad.customer_id "+
            " INNER JOIN account a ON a.customer_id = c.customer_id "+
            " LEFT JOIN iklant_mifos_mapping imm ON imm.mifos_customer_id = c.customer_id "+
            " LEFT JOIN iklant_prospect_group ipg ON ipg.group_id = imm.group_id "+
            " LEFT JOIN iklant_prospect_status ips ON ips.status_id = ipg.status_id "+
            " WHERE c.customer_level_id =2 AND a.account_state_id IN (5,6,9) AND loan_officer_id = "+userId1+ " "+
            " GROUP BY c.customer_id ORDER BY c.parent_customer_id,c.customer_id   ) " +
            " UNION ALL "+
            " (SELECT ips.status_name,ipg.status_id AS iklant_status,ipg.group_name AS iklant_group_name,ipg.group_global_number AS global_account_num,0 AS account_id,0 AS customer_id,ipg.center_name AS group_name,(NULL) AS parent_customer_id "+
            " ,ipcp.address AS address,ipg.group_id AS iklantGroup "+
            " FROM iklant_prospect_group ipg "+
            " INNER JOIN iklant_prospect_client ipc ON ipc.group_id = ipg.group_id "+
            " INNER JOIN iklant_prospect_client_personal ipcp ON ipcp.client_id = ipc.client_id "+
            " INNER JOIN iklant_prospect_status ips ON ips.status_id = ipg.status_id "+
            " WHERE ipg.status_id IN (6,7,9) AND ipg.loan_count = 1 AND ipg.assigned_to = "+ userId1 +" GROUP BY ipg.group_id)"
        customlog.info("retrieveGroupsDetailQuery=" + retrieveGroupsDetailQuery);
        connectionDataSource.getConnection(function (clientConnect) {
            clientConnect.query(retrieveGroupsDetailQuery, function selectCb(err, results, fields) {
                if (!err) {
                    var LoanRecoveryGroupsObject = new Array();
                    var LoanRecoveryGroups = require(path.join(loanRecoveryDTO+"/LoanRecoveryGroups"));

                    if(results.length !=0){
                        for (var i in results) {
                            var LoanRecoveryGroupsDetail = new LoanRecoveryGroups();
                            LoanRecoveryGroupsDetail.setAccountId(results[i].account_id);
                            LoanRecoveryGroupsDetail.setCustomerId(results[i].customer_id);
                            LoanRecoveryGroupsDetail.setGlobalAccountNum(results[i].global_account_num);
                            LoanRecoveryGroupsDetail.setGroupName(results[i].group_name);
                            LoanRecoveryGroupsDetail.setGlAddress(results[i].address);
                            LoanRecoveryGroupsDetail.setiklantGroupId(results[i].iklantGroup);
                            LoanRecoveryGroupsDetail.setIklantGroupName(results[i].iklant_group_name);
                            LoanRecoveryGroupsDetail.setStatusName(results[i].status_name);
                            LoanRecoveryGroupsObject[i] = LoanRecoveryGroupsDetail;
                        }
                    }else{
                        LoanRecoveryGroupsObject = "";
                    }
                    var retrieveRO = " SELECT u_role.personnel_id AS user_id,u_role.role_id,u.user_name " +
                        " FROM "+dbTableName.mfiPersonnelRole+"  u_role " +
                        " INNER JOIN "+dbTableName.iklantUsers+"  u ON u.user_id = u_role.personnel_id " +
                        " WHERE u_role.role_id =" + constantsObj.getFOroleId() + " " +
                        " AND (u.office_id = " + officeValue +" OR " + officeValue +" = -1)";
                    clientConnect.query(retrieveRO, function selectCb(err, results, fields) {
                        if (!err) {
                            var userName = new Array();
                            var userId = new Array();
                            for (var i in results) {
                                userName[i] = results[i].user_name;
                                userId[i] = results[i].user_id;
                            }
                            connectionDataSource.releaseConnectionPool(clientConnect);
                            callback(LoanRecoveryGroupsObject,userName,userId);
                        } else {
                            connectionDataSource.releaseConnectionPool(clientConnect);
                            customlog.error(err);
                            callback();
                        }
                    });
                } else {
                    connectionDataSource.releaseConnectionPool(clientConnect);
                    customlog.error(err);
                    callback();
                }
            });
        });
    },*/
/*    assignGroupToFODataModel: function (customerId,loanRecoveryOfficer,iklantGroupId, callback) {
        var self = this;
        var callResult =  new Array();
        customlog.info("accountId" + customerId);
        customlog.info("roId========================" + loanRecoveryOfficer);
        connectionDataSource.getConnection(function (clientConnect) {
            clientConnect.beginTransaction(function(err){
                customlog.info("transaction Has been begin");
                if(err){
                    customlog.error(err);
                }
                for (var i in customerId) {
                    callResult.push(i);
                    if(customerId[i] == 0){
                        var iklantOnlyUpdateQuery = "UPDATE iklant_prospect_group SET assigned_to = "+ loanRecoveryOfficer +",updated_date = NOW() + INTERVAL 5 HOUR + INTERVAL 30 MINUTE  WHERE group_id="+iklantGroupId[i] + ";"
                        clientConnect.query(iklantOnlyUpdateQuery, function postCreate(err) {
                            if (err) {
                                clientConnect.rollback(function(){
                                    connectionDataSource.releaseConnectionPool(clientConnect);
                                    customlog.error(err);
                                    callback("failure");
                                });

                            }else{
                                if(callResult.length == customerId.length){
                                    customlog.info("Before committing");
                                    clientConnect.commit(function(err){
                                        if(err){
                                            customlog.error(err);
                                        }
                                        customlog.info("Transaction Has been completed in Assigning FO");
                                        callback("success");
                                        connectionDataSource.releaseConnectionPool(clientConnect);
                                    });

                                }
                            }
                        });
                    }else{
                        var updateLoansDetail = "UPDATE customer SET loan_officer_id =" + loanRecoveryOfficer + ",updated_date = NOW() + INTERVAL 5 HOUR + INTERVAL 30 MINUTE WHERE customer_id = " + customerId[i] + " OR parent_customer_id = " + customerId[i] + "";
                        customlog.info("First Customer Update Query");
                        clientConnect.query(updateLoansDetail, function postCreate(err) {
                            if (err) {
                                clientConnect.rollback(function(err){
                                    connectionDataSource.releaseConnectionPool(clientConnect);
                                    customlog.error(err);
                                    callback("failure");
                                });
                            }else{
                                var updateAccountQury = "UPDATE account SET personnel_id = " + loanRecoveryOfficer + ",updated_date = NOW() + INTERVAL 5 HOUR + INTERVAL 30 MINUTE WHERE customer_id = "+ customerId[i] +"";
                                customlog.info("Second account Update Query"+updateAccountQury);
                                clientConnect.query(updateAccountQury, function postCreate(err) {
                                    if (err) {
                                        clientConnect.rollback(function(err){
                                            connectionDataSource.releaseConnectionPool(clientConnect);
                                            customlog.error(err);
                                            callback("failure");
                                        });
                                    }
                                    else{
                                        if(iklantGroupId[i] != 0){
                                            var iklantUpdateQuery = "UPDATE iklant_prospect_group SET assigned_to = '"+ loanRecoveryOfficer +"',updated_date = NOW() + INTERVAL 5 HOUR + INTERVAL 30 MINUTE  WHERE group_id="+iklantGroupId[i] + ";"
                                            customlog.info("Third iklant group Update Query"+iklantUpdateQuery);
                                            clientConnect.query(iklantUpdateQuery, function postCreate(err) {
                                                if (err) {
                                                    clientConnect.rollback(function(err){
                                                        connectionDataSource.releaseConnectionPool(clientConnect);
                                                        customlog.error(err);
                                                        callback("failure");
                                                    });
                                                }else{
                                                    if(callResult.length == customerId.length){
                                                        customlog.info("Before committing");
                                                        clientConnect.commit(function(err){
                                                            if(err){
                                                                customlog.error(err);
                                                            }
                                                            customlog.info("Transaction Has been completed in Assigning FO");
                                                            callback("success");
                                                            connectionDataSource.releaseConnectionPool(clientConnect);
                                                        });
                                                    }
                                                }
                                            });
                                        }else{
                                            if(callResult.length == customerId.length){
                                                customlog.info("Before committing");
                                                clientConnect.commit(function(err){
                                                    if(err){
                                                        customlog.error(err);
                                                    }
                                                    customlog.info("Transaction Has been completed in Assigning FO");
                                                    callback("success");
                                                    connectionDataSource.releaseConnectionPool(clientConnect);
                                                });
                                            }
                                        }
                                    }
                                });
                            }
                        });
                    }
                }
            });
        });
    },*/

    assignGroupToFODataModel: function (customerId,loanRecoveryOfficer,iklantGroupId, callback) {
        var self = this;
        var callResult =  new Array();
        customlog.info("accountId" + customerId);
        customlog.info("roId========================" + loanRecoveryOfficer);
        connectionDataSource.getConnection(function (clientConnect) {
            var updateLoansDetail = "UPDATE customer SET loan_officer_id =" + loanRecoveryOfficer + ",updated_date = NOW() + INTERVAL 5 HOUR + INTERVAL 30 MINUTE WHERE customer_id IN (" + customerId + ") OR parent_customer_id IN ( " + customerId + ")";
            customlog.info("First Customer Update Query"+updateLoansDetail);
            clientConnect.query(updateLoansDetail, function postCreate(err) {
                if (err) {
                    connectionDataSource.releaseConnectionPool(clientConnect);
                    customlog.error(err);
                    callback("failure");
                }else{
                    var updateAccountQury = "UPDATE account SET personnel_id = " + loanRecoveryOfficer + ",updated_date = NOW() + INTERVAL 5 HOUR + INTERVAL 30 MINUTE WHERE customer_id IN ( SELECT customer_id FROM customer WHERE parent_customer_id IN ( "+ customerId +") OR customer_id IN ( "+ customerId +")) AND account_state_id IN (5,9,11)";
                    customlog.info("Second account Update Query"+updateAccountQury);
                    clientConnect.query(updateAccountQury, function postCreate(err) {
                        if (err) {
                            connectionDataSource.releaseConnectionPool(clientConnect);
                            customlog.error(err);
                            callback("failure");
                        }
                        else {
                            var iklantUpdateQuery = "UPDATE iklant_prospect_group SET assigned_to = '" + loanRecoveryOfficer + "',updated_date = NOW() + INTERVAL 5 HOUR + INTERVAL 30 MINUTE  WHERE group_id IN (" + iklantGroupId + ");"
                            customlog.info("Third iklant group Update Query" + iklantUpdateQuery);
                            clientConnect.query(iklantUpdateQuery, function postCreate(err) {
                                if (err) {
                                    connectionDataSource.releaseConnectionPool(clientConnect);
                                    customlog.error(err);
                                    callback("failure");
                                } else {
                                    customlog.info("Transaction Has been completed in Assigning FO");
                                    connectionDataSource.releaseConnectionPool(clientConnect);
                                    callback("success");
                                }
                            });
                        }

                    });
                }
            });

        });
    },

    getCurrentPositionDataModel : function(userId,callback){
        var latitudePosition = new Array();
        var longititudePosition = new Array();
        var getCurrentPositionQuery  = "SELECT latitude_position,longitude_position FROM gps_location_log FORCE INDEX(PRIMARY) WHERE user_id = "+userId+" AND DATE(created_time) = CURDATE() ORDER BY location_log_id"
        //var getCurrentPositionQuery  = "SELECT latitude_position,longitude_position FROM gps_location_log FORCE INDEX(PRIMARY) WHERE user_id = "+userId+" AND DATE(created_time) = CURDATE() ORDER BY location_log_id DESC LIMIT 1"
        console.log(getCurrentPositionQuery);
        connectionDataSource.getConnection(function (clientConnect) {
            clientConnect.query(getCurrentPositionQuery, function (err, result) {
                connectionDataSource.releaseConnectionPool(clientConnect);
                if (err) {
                } else {
                    for (var i = 0; i < result.length; i++) {
                        latitudePosition[i] = result[i].latitude_position;
                        longititudePosition[i] = result[i].longitude_position;
                    }
                    callback(latitudePosition, longititudePosition);
                }
            });
        });

    }
};
