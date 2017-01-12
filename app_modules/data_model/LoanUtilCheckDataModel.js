module.exports = loanUtilCheckDataModel;

var path = require('path');
var rootPath = path.dirname(process.mainModule.filename);
var lookupEntityObj;

var dbTableName = require(path.join(rootPath,"properties.json"));

var connectionDataSource = require(path.join(rootPath,"app_modules/data_model/DataSource"));
var customlog = require(path.join(rootPath,"logger/loggerConfig.js"))('LoanUtilCheckDataModel.js');

//Business Layer
function loanUtilCheckDataModel(constants) {
    customlog.debug("Inside LUC Data Access Layer");
    this.constants = constants;
}

loanUtilCheckDataModel.prototype = {
    getLUCGroupsDataModel: function (officeId, fieldOfficerId, callback) {
        var groupIdArray = new Array();
        var groupNameArray = new Array();
        var groupCodeArray = new Array();
        var disbursementDate = new Array();
        var groupQuery = "SELECT c.customer_id, ipg.group_name AS global_cust_num, c.display_name,DATE_FORMAT(la.disbursement_date ,'%d-%m-%Y') AS disbursement_date FROM iklant_prospect_group ipg " +
            "INNER JOIN iklant_mifos_mapping imm ON imm.group_id = ipg.group_id " +
            "INNER JOIN customer c ON c.customer_id = imm.mifos_customer_id " +
            "INNER JOIN account ac ON ac.customer_id = c.customer_id " +
            "INNER JOIN loan_account la ON la.account_id = ac.account_id " +
            "WHERE c.branch_id = " + officeId + " AND c.customer_level_id = 2 AND c.loan_officer_id = " + fieldOfficerId + " AND ac.account_state_id IN (5,9) GROUP BY c.customer_id ORDER BY c.customer_id,la.disbursement_date";
        connectionDataSource.getConnection(function (clientConnect) {
            clientConnect.query(groupQuery, function (err, result) {
                connectionDataSource.releaseConnectionPool(clientConnect);
                if (err) {
                    callback("failure");
                }
                else {
                    for(var i=0;i<result.length;i++){
                        groupIdArray[i] = result[i].customer_id;
                        groupCodeArray[i] = result[i].global_cust_num;
                        groupNameArray[i] = result[i].display_name
                        disbursementDate[i] = result[i].disbursement_date;
                    }
                    callback('success',groupIdArray, groupCodeArray, groupNameArray, disbursementDate);
                }
            });
        });
    },

    retrieveLUCAccountsDataModel: function (groupId, callback) {
        var accountIdArray = new Array();
        var globalNameArray = new Array();
        var clientQuery = "SELECT a.account_id,a.global_account_num FROM customer c " +
            "INNER JOIN account a ON a.customer_id = c.customer_id " +
            "WHERE c.customer_id = " + groupId + " AND a.account_state_id IN (5,9) ORDER BY c.customer_id";
        customlog.info("clientQueryWhileAcc "+clientQuery);
        connectionDataSource.getConnection(function (clientConnect) {
            clientConnect.query(clientQuery, function (err, result) {
                connectionDataSource.releaseConnectionPool(clientConnect);
                if (err) {
                    callback("failure");
                }
                else {
                    for(var i=0;i<result.length;i++){
                        accountIdArray[i] = result[i].account_id;
                        globalNameArray[i] = result[i].global_account_num;
                    }
                    callback('success',accountIdArray, globalNameArray);
                }
            });
        });
    },

    retrieveLUCCustomerDataModel: function (accountId, callback) {
        var clientIdArray = new Array();
        var iklantClientIdArray = new Array();
        var clientCodeArray = new Array();
        var clientNameArray = new Array();
        var lastLUCDate = new Array();
        var expectedLUCDate = new Array();
        var lastLUCEndDate = new Array();
        var clientMobileNumbers = new Array();
        var clientLandLineNumbers = new Array();
        var moment = require('moment');
        var clientQuery = "SELECT c.customer_id,ipp.client_id, c.global_cust_num, c.display_name,IFNULL(DATE_FORMAT(MAX(luc.luc_date),'%d/%m/%Y'),0) AS lastLucDate," +
            "la.disbursement_date,MAX(ls.installment_id) AS no_of_installment,IFNULL(MAX(luc.luc_count),0) AS luc_count," +
            "IFNULL(ipp.mobile_number,'') AS mobile_number,"+
            "IFNULL(ipp.landline_number,'') AS landline_number "+
            "FROM loan_account la " +
            "INNER JOIN account a ON a.account_id = la.account_id " +
            "INNER JOIN customer c ON c.customer_id = a.customer_id " +
            "INNER JOIN loan_schedule ls ON ls.account_id = a.account_id " +
            "INNER JOIN iklant_mifos_mapping imm ON imm.mifos_client_customer_id = c.customer_id " +
            "INNER JOIN iklant_prospect_client_personal ipp ON ipp.client_id = imm.client_id " +
            "LEFT JOIN " + dbTableName.iklantLoanUtilizationCheck + " luc ON luc.client_id = c.customer_id " +
            "WHERE la.parent_account_id = '" + accountId + "' GROUP BY c.customer_id ORDER BY c.customer_id";
        customlog.info("clientQueryCustomer "+clientQuery);
        connectionDataSource.getConnection(function (clientConnect) {
            clientConnect.query(clientQuery, function (err, result) {
                connectionDataSource.releaseConnectionPool(clientConnect);
                if (err) {
                    callback("failure");
                }
                else {
                    for(var i=0;i<result.length;i++){
                        clientIdArray[i] = result[i].customer_id;
                        iklantClientIdArray[i] = result[i].client_id;
                        clientCodeArray[i] = result[i].global_cust_num;
                        clientNameArray[i] = result[i].display_name;
                        lastLUCDate[i] = result[i].lastLucDate;
                        clientMobileNumbers[i] = result[i].mobile_number;
                        clientLandLineNumbers[i] = result[i].landline_number;
                        var newDate = moment(result[i].disbursement_date);
                        if(result[i].no_of_installment == 12) {
                            if(result[i].luc_count == 0){
                                expectedLUCDate[i] = moment(newDate).add(6,'months');
                                lastLUCEndDate[i] = expectedLUCDate[i];
                            }else if(result[i].luc_count == 1){
                                expectedLUCDate[i] = moment(newDate).add(12, 'months');
                                lastLUCEndDate[i] = moment(newDate).add(6,'months');
                            }
                            else{
                                expectedLUCDate[i] = moment(newDate).add(12, 'months');
                                lastLUCEndDate[i] = moment(newDate).add(12,'months');
                            }
                        }
                        else if(result[i].no_of_installment == 24){
                            if(result[i].luc_count == 0){
                                expectedLUCDate[i] = moment(newDate).add(6,'months');
                                lastLUCEndDate[i] = expectedLUCDate[i];
                            }else if(result[i].luc_count == 1){
                                expectedLUCDate[i] = moment(newDate).add(12,'months');
                                lastLUCEndDate[i] = moment(newDate).add(6,'months');
                            }else if(result[i].luc_count == 2){
                                expectedLUCDate[i] = moment(newDate).add(18,'months');
                                lastLUCEndDate[i] = moment(newDate).add(12,'months');
                            }else if(result[i].luc_count == 3){
                                expectedLUCDate[i] = moment(newDate).add(24,'months');
                                lastLUCEndDate[i] = moment(newDate).add(18,'months');
                            }
                            else{
                                expectedLUCDate[i] = moment(newDate).add(24,'months');
                                lastLUCEndDate[i] = moment(newDate).add(24,'months');
                            }
                        }
                    }
                    callback(clientIdArray, clientCodeArray, clientNameArray, lastLUCDate, expectedLUCDate,lastLUCEndDate,clientMobileNumbers,clientLandLineNumbers,iklantClientIdArray);
                }
            });
        });
    },

    retrieveClientDetailsForLUCDataModel: function (clientId, parentAccountId, callback) {
        var clientQuery = "SELECT la.account_id,c.customer_id,c.display_name,c.parent_customer_id,la.loan_amount, " +
            "IFNULL(SUBSTRING(SUBSTRING_INDEX(lv.lookup_name,'.',2),14),'Others') AS loan_purpose," +
            "DATE_FORMAT(la.disbursement_date ,'%d-%m-%Y') AS disbursement_date,cad.phone_number," +
            "CONCAT(cad.line_1, IF(cad.line_2 IS NULL OR cad.line_2='', '', CONCAT(', ',cad.line_2))," +
            "IF(cad.line_3 IS NULL OR cad.line_3='', '', CONCAT(', ',cad.line_3))," +
            "IF(cad.city IS NULL OR cad.city='', '', CONCAT(', ',cad.city))) AS clientAddress, " +
            "ROUND(la.interest_rate,2) AS interest_rate,c.date_of_birth,IF(cnd.name_type = 1,cnd.first_name,'')AS guarantor_name," +
            "IFNULL(lv1.lookup_name,'') AS relationship " +
            "FROM customer c INNER JOIN account a ON a.customer_id = c.customer_id " +
            "INNER JOIN loan_account la ON la.account_id = a.account_id " +
            "INNER JOIN customer_name_detail cnd ON cnd.customer_id = c.customer_id  " +
            "INNER JOIN spouse_father_lookup spl ON spl.spouse_father_id = cnd.name_type " +
            "LEFT JOIN customer_address_detail cad ON cad.customer_id = c.customer_id  " +
            "LEFT JOIN lookup_value lv ON la.business_activities_id = lv.lookup_id " +
            "LEFT JOIN lookup_value lv1 ON spl.lookup_id = lv1.lookup_id " +
            "WHERE c.customer_id = '" + clientId + "' AND la.parent_account_id = '" + parentAccountId + "' GROUP BY c.customer_id";
        customlog.info("clientQuery: "+clientQuery);
        connectionDataSource.getConnection(function (clientConnect) {
            clientConnect.query(clientQuery, function (err, result) {
                connectionDataSource.releaseConnectionPool(clientConnect);
                if (err) {
                    callback("failure");
                }
                else {
                    callback(result);
                }
            });
        });
    },

    saveLUCDetailsDataModel: function (lucForClient, callback) {
        var retrieveLUCCheckQuery = "SELECT IFNULL(MAX(luc_count),0) AS luc_count FROM " + dbTableName.iklantLoanUtilizationCheck + " WHERE group_id = " + lucForClient.getGroupParentId() + " AND client_id = " + lucForClient.getClientId() + " AND account_id =" + lucForClient.getAccountNumber();
        connectionDataSource.getConnection(function (clientConnect) {
            clientConnect.query(retrieveLUCCheckQuery, function (err, result) {
                if (err) {
                    callback("failure");
                    connectionDataSource.releaseConnectionPool(clientConnect);
                }
                else {
                    if(result.length>0){
                        var clientQuery = "INSERT INTO " + dbTableName.iklantLoanUtilizationCheck + "(group_id, client_id, luc_date, account_id, is_loan_used_for_intended_purpose, " +
                            "reason_for_not_using_loan_indened_purpose, physical_verfication, reason_for_not_physically_verifiying, is_luc_result_satisfied, " +
                            "reason_for_luc, is_there_any_grievance_with_fo_or_branch, remarks, luc_done_by, luc_count) VALUES(" + lucForClient.getGroupParentId() + ", " +
                            "" + lucForClient.getClientId() + ", NOW(), " + lucForClient.getAccountNumber() + ", " + lucForClient.getIsLoanAmountUsedForIntendedPurpose() + ", " +
                            "'" + lucForClient.getReasonForLoanAmountNotUsed() + "', " + lucForClient.getPhysicalVerification() + ", '" + lucForClient.getReasonForNotVerifyingPhysically() + "', " +
                            "" + lucForClient.getIsLUCSatisfied() + ", '" + lucForClient.getReasonForLUC() + "', " + lucForClient.getIsThereAnyGrievance() + ", '" + lucForClient.getRemarks() + "', " +
                            "" + lucForClient.getLUCDoneBy() + ", " + (result[0].luc_count+1) + ")";
                        clientConnect.query(clientQuery, function (err) {
                            if (err) {
                                connectionDataSource.releaseConnectionPool(clientConnect);
                                callback("failure");
                            }
                        })
                    }
                    connectionDataSource.releaseConnectionPool(clientConnect);
                    callback("success");
                }
            });
        });
    }
}
