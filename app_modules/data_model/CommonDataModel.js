module.exports = commonDataModel;

var path = require('path');
var rootPath = path.dirname(process.mainModule.filename);
var dbTableName = require(path.join(rootPath,"properties.json"));

var connectionDataSource = require(path.join(rootPath,"app_modules/data_model/DataSource"));
var customlog = require(path.join(rootPath,"logger/loggerConfig.js"))('commonDataModel.js');
var dateUtils = require(path.join(rootPath,'app_modules/utils/DateUtils'));
var commonUtils = require(path.join(rootPath,'app_modules/utils/commonUtils'));
var commonDTO = path.join(rootPath,"app_modules/dto/common");
var PDFDocument = require('pdfkit');
var ciDB = dbTableName.database;
var mysql = require('mysql');


function commonDataModel(constants) {
    customlog.debug("Inside Common Data Access Layer");
    this.constants = constants;

    this.client = mysql.createConnection({
        host:dbTableName.host,
        user: dbTableName.username,
        password: dbTableName.password,
        insecureAuth: true
    });
    this.client.query("USE " + ciDB);
}

commonDataModel.prototype = {
    getBranchesDataModel: function (tenantId, userId, roleId, officeId, callback) {
        customlog.info("Inside Data Access Layer getBranchesDataModel");
        var self=this;
        var statusRequireObj = require(path.join(rootPath,"app_modules/dto/common/prospectStatus"));
        var officeRequireObj = require(path.join(rootPath,"app_modules/dto/common/office"));
        var operationRequireObj = require(path.join(rootPath,"app_modules/dto/common/operation"));

        var statusObj = new statusRequireObj();
        var officeObj = new officeRequireObj();
        var operationObj = new operationRequireObj();
        var constantsObj = self.constants;
        var branchesArray = new Array();
        var branchesIdArray = new Array();
        var statusNameArray = new Array();
        var statusIdArray = new Array();
        var operationNameArray = new Array();
        var operationIdArray = new Array();

        var roleIdQuery = "SELECT ps.status_id,ps.status_name FROM "+dbTableName.iklantProspectStatus+" ps " +
            "INNER JOIN "+dbTableName.iklantRoleStatus+" rs ON  rs.role_id IN (" + roleId + ") " +
            "WHERE ps.status_id = rs.status_id";
        customlog.info("roleIdQuery : " + roleIdQuery);
        connectionDataSource.getConnection(function (clientConnect) {
            clientConnect.query(roleIdQuery, function selectCb(err, results, fields) {
                if (err) {
                    connectionDataSource.releaseConnectionPool(clientConnect);
                    customlog.error(err);
                }
                else {
                    for (var i in results) {
                        statusIdArray[i] = results[i].status_id;
                        statusNameArray[i] = results[i].status_name;
                    }
                    statusObj.setStatusIdArray(statusIdArray);
                    statusObj.setStatusNameArray(statusNameArray);
                }
            });

            clientConnect.query('SELECT office_name FROM '+dbTableName.iklantOffice+' where office_id =' + officeId,
                function selectCb(err, results, fields) {
                    if (err) {
                        connectionDataSource.releaseConnectionPool(clientConnect);
                        customlog.error(err);
                    }
                    else {
                        for (var i in results) {
                            officeObj.setOfficeName(results[i].office_name);
                        }
                    }
                });

            var operationQuery = "SELECT op.operation_id,op.operation_name FROM "+dbTableName.iklantOperation+" op " +
                "INNER JOIN "+dbTableName.iklantRoleOperation+" ro ON  ro.role_id IN (" + roleId + ") " +
                "WHERE op.operation_id = ro.operation_id ORDER BY op.operation_id";
            customlog.info("operationQuery : " + operationQuery);
            clientConnect.query(operationQuery, function selectCb(err, results, fields) {
                if (err) {
                    connectionDataSource.releaseConnectionPool(clientConnect);
                    customlog.error(err);
                }
                else {
                    for (var i in results) {
                        operationIdArray[i] = results[i].operation_id;
                        operationNameArray[i] = results[i].operation_name;
                    }
                    operationObj.setOperationIdArray(operationIdArray);
                    operationObj.setOperationNameArray(operationNameArray);
                }
            });

            clientConnect.query(
                'SELECT * FROM '+dbTableName.iklantOffice+' where tenant_id = ' + tenantId,
                function selectCb(err, results, fields) {
                    connectionDataSource.releaseConnectionPool(clientConnect);
                    if (err) {
                        customlog.error(err);
                    }
                    else {
                        for (var i in results) {
                            branchesIdArray[i] = results[i].office_id;
                            branchesArray[i] = results[i].office_name;
                        }
                    }
                    callback(branchesIdArray, branchesArray, statusObj, officeObj, operationObj);
                });
        });
    },
    listGroups: function (tenantId, userId, officeId, roleId, requestedOperationId, callback) {
        var self=this;
        var listGroupsArray = new Array();
        var listGroupsIdArray = new Array();
        var activeClients = new Array();
        var nic_clients_per_status = new Array();
        var error_msg_array = new Array();
        var activeClientsPerStatus = new Array();
        var dataEntryDate = new Array();
        var neededInfo = new Array();
        var neededImageClarity = new Array();
        var holdedClientsCount = new Array();
        var isSynchronized = new Array();
        var mifosCustomerId = new Array();
        var listGroupsGlobalNumberArray = new Array();
        var fieldOfficerName = new Array();
        var isDataVerifiedArray = new Array();
        var accountNumbers = new Array();
        var loanCount = new Array();
        var statusIds = new Array();
        var freshClientsCountArray = new Array();
        var totalClientsCountArray = new Array();
        var nicClearedCountArray = new Array();
        var needRMApprovalCountArray = new Array();
        var accountId = new Array();
        var dvQuery = new Array();

        customlog.info("Inside Data Access Layer listGroups; OperationId : " + requestedOperationId);
        var constantsObj = this.constants;
        var prelimRejectedStatus = constantsObj.getRejectedPriliminaryVerification();
        var fieldRejectedStatus = constantsObj.getRejectedFieldVerification();
        var appraisalRejectedStatus = constantsObj.getRejectedAppraisal();
        var creditRejectedStatus = constantsObj.getRejectedCreditBureauAnalysisStatusId();
        var nextLoanPreCheckRejectedStatus = constantsObj.getRejectedInNextLoanPreCheck();
        var rejectedIdleStage = constantsObj.getRejectedWhileIdleGroupsStatusId();
        var dataVerifiedStatus = constantsObj.getDataVerificationOperationId();
        var rejectedPrevLoan = constantsObj.getRejectedPreviousLoanStatusId();

        var groupQuery = "";
        //Query for Field Officer
        // active client status modified by Ezra Johnson
        if (requestedOperationId == constantsObj.getFieldVerificationOperationId()) {
            groupQuery = "SELECT gp.*,ac.active_clients FROM " +
                "(SELECT pg.*,0 as mifos_customer_id,IF(pg.loan_count > 1, u.user_name,u.user_name) AS user_name FROM "+dbTableName.iklantProspectGroup+" pg " +
                "LEFT JOIN "+dbTableName.iklantProspectClient+" pc ON pc.group_id = pg.group_id " +
                "INNER JOIN "+dbTableName.iklantOperationStatus+" os ON os.operation_id = " + requestedOperationId + " " +
                "LEFT JOIN "+dbTableName.iklantUsers+" u ON u.user_id = pg.created_by " +
                "LEFT JOIN "+dbTableName.iklantUsers+" u1 ON u1.user_id = pg.assigned_to " + //Added to retrieve FO who created the group
                "WHERE pg.tenant_id = " + tenantId + " AND pg.office_id = " + officeId + " AND pg.assigned_to = " + userId + " " +
                "AND os.status_id = pg.status_id AND pg.is_idle = 0 " +
                "GROUP BY pg.group_id)gp " +
                "LEFT JOIN " +
                "(SELECT COUNT(pc.client_id) AS active_clients ,pc.group_id  FROM "+dbTableName.iklantProspectClient+" pc " +
                "INNER JOIN "+dbTableName.iklantProspectGroup+" pg ON pg.group_id = pc.group_id WHERE pc.status_id " +
                "NOT IN (" +constantsObj.getRejectedStatusIds()+") " +
                " AND pg.is_idle = 0 GROUP BY pc.group_id)ac ON " +
                "ac.group_id = gp.group_id";
        }
        else if (requestedOperationId == constantsObj.getDataVerificationOperationId() || requestedOperationId == constantsObj.getCreditBureauAnalysedOperationId()
            || requestedOperationId == constantsObj.getKYCDownloadingOperationId()) {
            groupQuery = "SELECT tot_cli.total_clients,(CASE WHEN hcc.hold_clients_count IS NULL THEN 0 ELSE hcc.hold_clients_count END) AS hold_clients_count" +
                ",(CASE WHEN fcc.fresh_clients IS NULL THEN 0 ELSE fcc.fresh_clients END) AS fresh_clients,";
            if(requestedOperationId == constantsObj.getDataVerificationOperationId()){
            groupQuery += " nic_cleared.nic_cleared_status,";
            }
            groupQuery +=   " gp.*,ac.active_clients,DATE_FORMAT(gp.updated_date,'%d-%m-%Y   %k:%i:%s') AS de_date,acs.active_clients_per_status,(SELECT COUNT(ipc.client_id) FROM "+dbTableName.iklantProspectClient+" ipc WHERE group_id = gp.group_id AND needed_image_clarity_docs != 0) AS total_nmi FROM " +
                "(SELECT pg.*,0 as mifos_customer_id,IF(pg.loan_count > 1, u.user_name,u.user_name) AS user_name,IFNULL(pcd.is_data_verified,0) AS is_data_verified FROM "+dbTableName.iklantProspectGroup+" pg " +
                "LEFT JOIN "+dbTableName.iklantProspectClient+" pc ON pc.group_id = pg.group_id " +
                "LEFT JOIN "+dbTableName.iklantProspectClientDataEntryTracking+" pcd ON pcd.client_id = pc.client_id " +
                "LEFT JOIN "+dbTableName.iklantUsers+" u ON u.user_id = pg.created_by " +
                "LEFT JOIN "+dbTableName.iklantUsers+" u1 ON u1.user_id = pg.assigned_to " + //Added to retrieve FO who created the group
                "WHERE pg.tenant_id = " + tenantId + " AND pg.office_id = " + officeId;
            if(requestedOperationId == constantsObj.getDataVerificationOperationId()){
                groupQuery += " AND pg.status_id IN ("+constantsObj.getKYCCompleted()+") ";
            }else if(requestedOperationId == constantsObj.getCreditBureauAnalysedOperationId()){
                groupQuery += " AND pg.status_id IN ("+constantsObj.getDataVerificationOperationId()+") ";
            }else if(requestedOperationId == constantsObj.getKYCDownloadingOperationId()){
                // Added by chitra [for include the need more information groups]
                groupQuery += " AND pg.status_id IN ("+constantsObj.getKYCUploaded()+","+constantsObj.getKYCCompleted()+","+constantsObj.getAssignedFO()+") AND CASE WHEN (pg.status_id = "+constantsObj.getAssignedFO()+" ) THEN `needed_information` = 1 ELSE 1=1 END ";
            }
            groupQuery += " GROUP BY pg.group_id)gp " +
                "LEFT JOIN " +
                "(SELECT COUNT(pc.client_id) AS active_clients ,pc.group_id  FROM "+dbTableName.iklantProspectClient+" pc " +
                "INNER JOIN "+dbTableName.iklantProspectGroup+" pg ON pg.group_id = pc.group_id WHERE pc.status_id " +
                "NOT IN (" +constantsObj.getRejectedStatusIds()+") " +
                " GROUP BY pc.group_id)ac ON " +
                "ac.group_id = gp.group_id ";
            //Displaying the total number of clients [total clients = total rows - all rejected in prev loan counts]
            groupQuery +=
                " LEFT JOIN (SELECT COUNT(pc.client_id) AS total_clients,pc.group_id "+
                " FROM "+dbTableName.iklantProspectClient+" pc INNER JOIN "+dbTableName.iklantProspectGroup+" pg "+
                " ON pg.group_id = pc.group_id WHERE IF(pc.loan_count < pg.loan_count,pc.status_id "+
                " NOT IN (" +constantsObj.getRejectedStatusIds()+"),pc.status_id NOT IN ("+constantsObj.getRejectedInNextLoanPreCheck()+","+constantsObj.getRejectedPreviousLoanStatusId()+")) AND pg.is_idle = 0 "+
                " GROUP BY pc.group_id) tot_cli ON tot_cli.group_id = gp.group_id "
            // for active clients in the current status
            if(requestedOperationId == constantsObj.getKYCDownloadingOperationId()){
                groupQuery += " LEFT JOIN (SELECT COUNT(pc.client_id) AS active_clients_per_status ,pc.group_id  FROM "+dbTableName.iklantProspectClient+" pc INNER JOIN "+dbTableName.iklantProspectGroup+" pg ON pg.group_id = pc.group_id WHERE pc.status_id IN ( "+ constantsObj.getKYCUploaded() +","+ constantsObj.getKYCCompleted() +","+ constantsObj.getNeedInformation() +")";
            }
            else if(requestedOperationId == constantsObj.getDataVerificationOperationId()){
                groupQuery += " LEFT JOIN (SELECT COUNT(pc.client_id) AS active_clients_per_status ,pc.group_id  FROM "+dbTableName.iklantProspectClient+" pc INNER JOIN "+dbTableName.iklantProspectGroup+" pg ON pg.group_id = pc.group_id WHERE pc.status_id IN ( "+ constantsObj.getKYCCompleted() +" )";
            }
            else{
                groupQuery += " LEFT JOIN (SELECT COUNT(pc.client_id) AS active_clients_per_status ,pc.group_id  FROM "+dbTableName.iklantProspectClient+" pc INNER JOIN "+dbTableName.iklantProspectGroup+" pg ON pg.group_id = pc.group_id WHERE pc.status_id NOT IN ( "+ prelimRejectedStatus + "," +nextLoanPreCheckRejectedStatus +" ," +rejectedIdleStage +","+ rejectedPrevLoan +" )";
            }
            groupQuery += " GROUP BY pc.group_id)acs ON acs.group_id = gp.group_id ";
            groupQuery +=
                " LEFT JOIN (SELECT COUNT(pc.client_id) AS fresh_clients, pc.group_id  "+
                    " FROM "+dbTableName.iklantProspectClient+" pc INNER JOIN "+dbTableName.iklantProspectGroup+" pg  "+
                    " ON pg.group_id = pc.group_id WHERE pc.status_id NOT IN (" +constantsObj.getRejectedStatusIds()+") " +
                    " AND pc.loan_count = 1 AND pg.is_idle = 0 GROUP BY pc.group_id) fcc ON fcc.group_id = gp.group_id  ";
            groupQuery +=
                " LEFT JOIN (SELECT COUNT(pc.client_id) AS hold_clients_count, pc.group_id "+
                    " FROM "+dbTableName.iklantProspectClient+" pc INNER JOIN "+dbTableName.iklantProspectGroup+" pg "+
                    " ON pg.group_id = pc.group_id WHERE pc.status_id = "+constantsObj.getNeededImageClarity()+" AND pg.is_idle = 0 "+
                    " GROUP BY pc.group_id) hcc ON hcc.group_id = gp.group_id ";
            if(requestedOperationId == constantsObj.getDataVerificationOperationId()){
            groupQuery += "LEFT JOIN (SELECT COUNT(pc.client_id)AS nic_cleared_status,pc.group_id FROM "+dbTableName.iklantFoHoldImageTrack+" fo,"+dbTableName.iklantProspectClient+" pc,"+dbTableName.iklantProspectGroup+" pg WHERE " +
                " pg.group_id = pc.group_id and pc.client_id = fo.client_id AND operation_id = "+constantsObj.getDataVerificationOperationId()+" AND `needed_image_clarity_docs` = 0 and pc.status_id NOT IN (" +constantsObj.getRejectedStatusIds()+" ) AND fo.created_date >= pg.created_date GROUP BY pc.group_id) nic_cleared ON nic_cleared.group_id = gp.group_id ";
            }
            groupQuery += "ORDER BY de_date ";
        }
        else if (requestedOperationId == constantsObj.getPreliminaryVerificationOperationId() || requestedOperationId == constantsObj.getKYCUploadingOperationId()) {
            //Query for BDE
            if (roleId == constantsObj.getBDEroleId()) {
                groupQuery = "SELECT gp.*,ac.active_clients FROM " +
                    "(SELECT pg.*,0 as mifos_customer_id,IF(pg.loan_count > 1, u.user_name,u.user_name) AS user_name FROM "+dbTableName.iklantProspectGroup+" pg " +
                    "LEFT JOIN "+dbTableName.iklantProspectClient+" pc ON pc.group_id = pg.group_id " +
                    "INNER JOIN "+dbTableName.iklantOperationStatus+" os ON os.operation_id = " + requestedOperationId + " " +
                    "LEFT JOIN "+dbTableName.iklantUsers+" u ON u.user_id = pg.created_by " +
                    "LEFT JOIN "+dbTableName.iklantUsers+" u1 ON u1.user_id = pg.assigned_to " + //Added to retrieve FO who created the group
                    "WHERE pg.tenant_id = " + tenantId + " AND pg.office_id = " + officeId + " AND pg.created_by = " + userId + " ";
                if(requestedOperationId == constantsObj.getPreliminaryVerificationOperationId()){
                    groupQuery += " AND pg.loan_type_id = " + constantsObj.getLoanTypeIdSHG()+" ";
                }else{
                    groupQuery += " AND pg.loan_type_id in( " + constantsObj.getLoanTypeIdSHG() + "," + constantsObj.getLoanTypeIdJLG() + ")";
                }
                groupQuery+= " AND os.status_id = pg.status_id AND pg.is_idle = 0 " +
                    "GROUP BY pg.group_id)gp " +
                    "LEFT JOIN " +
                    "(SELECT COUNT(pc.client_id) AS active_clients ,pc.group_id  FROM "+dbTableName.iklantProspectClient+" pc " +
                    "INNER JOIN "+dbTableName.iklantProspectGroup+" pg ON pg.group_id = pc.group_id WHERE pc.status_id " +
                    "NOT IN (" +constantsObj.getRejectedStatusIds()+") " +
                    " GROUP BY pc.group_id)ac ON " +
                    "ac.group_id = gp.group_id";
            } else if (roleId == constantsObj.getBMroleId()) {
                groupQuery = "SELECT gp.*,ac.active_clients FROM " +
                    "(SELECT pg.*,0 as mifos_customer_id,IF(pg.loan_count > 1, u.user_name,u.user_name) AS user_name FROM "+dbTableName.iklantProspectGroup+" pg " +
                    "LEFT JOIN "+dbTableName.iklantProspectClient+" pc ON pc.group_id = pg.group_id " +
                    "INNER JOIN "+dbTableName.iklantOperationStatus+" os ON os.operation_id = " + requestedOperationId + " " +
                    "LEFT JOIN "+dbTableName.iklantUsers+" u ON u.user_id = pg.created_by " +
                    "LEFT JOIN "+dbTableName.iklantUsers+" u1 ON u1.user_id = pg.assigned_to " + //Added to retrieve FO who created the group
                    "WHERE pg.tenant_id = " + tenantId + " AND pg.office_id = " + officeId + " " +
                    "AND pg.loan_type_id = " + constantsObj.getLoanTypeIdSHG() + " AND os.status_id = pg.status_id AND pg.is_idle = 0 " +
                    "GROUP BY pg.group_id)gp " +
                    "LEFT JOIN " +
                    "(SELECT COUNT(pc.client_id) AS active_clients ,pc.group_id  FROM "+dbTableName.iklantProspectClient+" pc " +
                    "INNER JOIN "+dbTableName.iklantProspectGroup+" pg ON pg.group_id = pc.group_id WHERE pc.status_id " +
                    "NOT IN (" +constantsObj.getRejectedStatusIds()+") " +
                    " GROUP BY pc.group_id)ac ON " +
                    "ac.group_id = gp.group_id";
            } else {
                groupQuery = "SELECT gp.*,ac.active_clients FROM " +
                    "(SELECT pg.*,0 as mifos_customer_id,IF(pg.loan_count > 1, u.user_name,u.user_name) AS user_name FROM "+dbTableName.iklantProspectGroup+" pg " +
                    "LEFT JOIN "+dbTableName.iklantProspectClient+" pc ON pc.group_id = pg.group_id " +
                    "INNER JOIN "+dbTableName.iklantOperationStatus+" os ON os.operation_id = " + requestedOperationId + " " +
                    "LEFT JOIN "+dbTableName.iklantUsers+" u ON u.user_id = pg.created_by " +
                    "LEFT JOIN "+dbTableName.iklantUsers+" u1 ON u1.user_id = pg.assigned_to " + //Added to retrieve FO who created the group
                    "WHERE pg.tenant_id = " + tenantId + " AND pg.office_id = " + officeId;
                if(requestedOperationId == constantsObj.getPreliminaryVerificationOperationId()){
                    groupQuery += " AND pg.loan_type_id = " + constantsObj.getLoanTypeIdSHG()+" ";
                }else{
                    groupQuery += " AND pg.loan_type_id in( " + constantsObj.getLoanTypeIdSHG() + "," + constantsObj.getLoanTypeIdJLG() + ")";
                }
                groupQuery+= " AND os.status_id = pg.status_id AND pg.is_idle = 0 " +
                    "GROUP BY pg.group_id)gp " +
                    "LEFT JOIN " +
                    "(SELECT COUNT(pc.client_id) AS active_clients ,pc.group_id  FROM "+dbTableName.iklantProspectClient+" pc " +
                    "INNER JOIN "+dbTableName.iklantProspectGroup+" pg ON pg.group_id = pc.group_id WHERE pc.status_id " +
                    "NOT IN (" +constantsObj.getRejectedStatusIds()+") " +
                    " GROUP BY pc.group_id)ac ON " +
                    "ac.group_id = gp.group_id";
            }
        } else if (requestedOperationId == constantsObj.getLoanSanctionOperationId() || requestedOperationId == constantsObj.getSynchronizedOperationId()) {
            groupQuery = "SELECT gp.*,ac.active_clients FROM " +
                "(SELECT pg.*,imp.mifos_customer_id,IF(pg.loan_count > 1, u.user_name,u.user_name) AS user_name FROM "+dbTableName.iklantProspectGroup+" pg " +
                "LEFT JOIN "+dbTableName.iklantProspectClient+" pc ON pc.group_id = pg.group_id " +
                "INNER JOIN "+dbTableName.iklantMifosMapping+" imp ON imp.group_id = pg.group_id " +
                "INNER JOIN "+dbTableName.iklantOperationStatus+" os ON os.operation_id = " + requestedOperationId + " " +
                "LEFT JOIN "+dbTableName.iklantUsers+" u ON u.user_id = pg.created_by " +
                "LEFT JOIN "+dbTableName.iklantUsers+" u1 ON u1.user_id = pg.assigned_to " + //Added to retrieve FO who created the group
                "WHERE pg.tenant_id = " + tenantId + " AND pg.office_id = " + officeId + " " +
                "AND os.status_id = pg.status_id  AND pg.is_idle = 0 " +
                "GROUP BY pg.group_id)gp " +
                "LEFT JOIN " +
                "(SELECT COUNT(pc.client_id) AS active_clients ,pc.group_id  FROM "+dbTableName.iklantProspectClient+" pc " +
                "INNER JOIN "+dbTableName.iklantProspectGroup+" pg ON pg.group_id = pc.group_id WHERE pc.status_id " +
                "NOT IN (" +constantsObj.getRejectedStatusIds()+") " +
                " AND pg.is_idle = 0 GROUP BY pc.group_id)ac ON " +
                "ac.group_id = gp.group_id";
        } else if (requestedOperationId == constantsObj.getNeedMoreVerificationOperationId()) {
            groupQuery = "SELECT tot_cli.total_clients,gp.*,ac.active_clients,DATE_FORMAT(gp.updated_date,'%d-%m-%Y   %l:%i:%s') AS de_date,acs.active_clients_per_status FROM " +
                "(SELECT pg.*,0 AS mifos_customer_id,IF(pg.loan_count > 1, u.user_name,u.user_name) AS user_name FROM "+dbTableName.iklantProspectGroup+" pg " +
                "LEFT JOIN "+dbTableName.iklantProspectClient+" pc ON pc.group_id = pg.group_id " +
                "INNER JOIN "+dbTableName.iklantOperationStatus+" os ON os.operation_id = " + requestedOperationId + " " +
                "LEFT JOIN "+dbTableName.iklantUsers+" u ON u.user_id = pg.created_by " +
                "LEFT JOIN "+dbTableName.iklantUsers+" u1 ON u1.user_id = pg.assigned_to " + //Added to retrieve FO who created the group
                "WHERE pg.tenant_id = " + tenantId + " AND pg.office_id = " + officeId + " AND " +
                "pg.needed_information = " + constantsObj.getActiveIndicatorTrue() + " " +
                "AND os.status_id = pg.status_id AND pg.is_idle = 0 " +
                "GROUP BY pg.group_id)gp " +
                "LEFT JOIN " +
                "(SELECT COUNT(pc.client_id) AS active_clients ,pc.group_id  FROM "+dbTableName.iklantProspectClient+" pc " +
                "INNER JOIN "+dbTableName.iklantProspectGroup+" pg ON pg.group_id = pc.group_id WHERE pc.status_id " +
                "NOT IN (" +constantsObj.getRejectedStatusIds()+") " +
                " AND pg.is_idle = 0 GROUP BY pc.group_id)ac ON " +
                "ac.group_id = gp.group_id ";
            //Displaying the total number of clients [total clients = total rows - all rejected in prev loan counts]
            groupQuery +=
                " LEFT JOIN (SELECT COUNT(pc.client_id) AS total_clients,pc.group_id "+
                " FROM "+dbTableName.iklantProspectClient+" pc INNER JOIN "+dbTableName.iklantProspectGroup+" pg "+
                " ON pg.group_id = pc.group_id WHERE IF(pc.loan_count < pg.loan_count,pc.status_id "+
                " NOT IN (" +constantsObj.getRejectedStatusIds()+"),pc.status_id NOT IN ("+constantsObj.getRejectedInNextLoanPreCheck()+","+constantsObj.getRejectedPreviousLoanStatusId()+")) AND pg.is_idle = 0 "+
                " GROUP BY pc.group_id) tot_cli ON tot_cli.group_id = gp.group_id "
            // Modified by chitra for active clients in each status
            groupQuery += " LEFT JOIN (SELECT COUNT(pc.client_id) AS active_clients_per_status ,pc.group_id  FROM "+dbTableName.iklantProspectClient+" pc INNER JOIN "+dbTableName.iklantProspectGroup+" pg ON pg.group_id = pc.group_id WHERE pc.status_id NOT IN ( "+ constantsObj.getNeedInformation() +" )" +
                " GROUP BY pc.group_id)acs ON acs.group_id = gp.group_id ORDER BY de_date ";
        } else if (requestedOperationId == constantsObj.getHoldGroupsOperationId()) {
            groupQuery = "SELECT tot_cli.total_clients,pg.group_id,pg.group_name,pg.center_name,pg.is_synchronized,pg.updated_date as de_date," +
                "IF(pg.loan_count > 1, u.user_name,u.user_name) AS user_name,0 AS mifos_customer_id,0 AS active_clients_per_status," +
                "(SELECT COUNT(pc1.client_id) FROM "+dbTableName.iklantProspectClient+" pc1 WHERE pc1.group_id = pg.group_id AND pc1.status_id " +
                "NOT IN (" +constantsObj.getRejectedStatusIds()+")) AS active_clients "+
                "FROM "+dbTableName.iklantProspectGroup+" pg "+
                "LEFT JOIN "+dbTableName.iklantProspectClient+" pc ON pc.group_id = pg.group_id "+
                "LEFT JOIN "+dbTableName.iklantUsers+" u ON u.user_id = pg.created_by " +
                "LEFT JOIN "+dbTableName.iklantUsers+" u1 ON u1.user_id = pg.assigned_to ";
            //Displaying the total number of clients [total clients = total rows - all rejected in prev loan counts]
            groupQuery +=
                " LEFT JOIN (SELECT COUNT(pc.client_id) AS total_clients,pc.group_id "+
                " FROM "+dbTableName.iklantProspectClient+" pc INNER JOIN "+dbTableName.iklantProspectGroup+" ipg "+
                " ON ipg.group_id = pc.group_id WHERE IF(pc.loan_count < ipg.loan_count,pc.status_id "+
                " NOT IN (" +constantsObj.getRejectedStatusIds()+"),pc.status_id NOT IN ("+constantsObj.getRejectedInNextLoanPreCheck()+","+constantsObj.getRejectedPreviousLoanStatusId()+")) AND ipg.is_idle = 0 "+
                " GROUP BY pc.group_id) tot_cli ON tot_cli.group_id = pg.group_id "
            groupQuery +="WHERE pg.tenant_id = "+tenantId+" AND pg.office_id = "+officeId+" AND pg.status_id IN ("+constantsObj.getKYCUploaded()+","+constantsObj.getKYCCompleted()+") AND pg.needed_image_clarity IN( 1,-1) "+
                "GROUP BY pg.group_id";
        }else if (requestedOperationId == constantsObj.getNextLoanPreCheckOperationId()) {
            groupQuery = "SELECT IFNULL(ipg.loan_count,1) AS loanCount," +
            "(SELECT COUNT(la.account_id) FROM loan_account la WHERE la.parent_account_id = a.account_id GROUP BY la.parent_account_id) AS noOfClients, " +
            "c.customer_id AS mifos_customer_id, c.loan_officer_id, ipg.group_id, ipg.group_name, p.display_name AS user_name, c.display_name AS center_name, a.account_id FROM customer c " +
            "INNER JOIN account a ON a.customer_id = c.customer_id " +
            "INNER JOIN personnel p ON p.personnel_id = c.loan_officer_id " +
            "LEFT JOIN " + dbTableName.iklantMifosMapping + " imm ON imm.mifos_customer_id = c.customer_id " +
            "LEFT JOIN " + dbTableName.iklantProspectGroup + " ipg ON ipg.group_id = imm.group_id " +
            "WHERE c.branch_id = " + officeId + " AND a.account_state_id = 6 AND c.customer_level_id = 2 AND ((ipg.status_id = " + constantsObj.getLoanSanctionOperationId() + " AND ipg.is_idle = 0) OR ipg.status_id IS NULL) " +
            "GROUP BY c.customer_id ORDER BY center_name;";
        }else if(requestedOperationId == constantsObj.getLdCalltrackingId()){
            if(roleId == constantsObj.getCCEroleId()){
                groupQuery = " SELECT  "+
                    "   ipg.*, "+
                    "   imm.`mifos_customer_id`, "+
                    "   la.`account_id`, "+
                    "   a.`account_state_id`, "+
                    "   c.`customer_id`, "+
                    "   iu.`user_name` "+
                    " FROM account a "+
                    " 	INNER JOIN loan_account la   ON la.`account_id` = a.`account_id`  "+
                    " 	INNER JOIN customer c  ON c.`customer_id` = a.`customer_id` "+
                    " 	INNER JOIN `iklant_mifos_mapping` imm   ON imm.`mifos_customer_id` = c.`customer_id`  "+
                    " 	INNER JOIN iklant_prospect_group ipg ON ipg.`group_id` = imm.`group_id` "+
                    " 	LEFT JOIN iklant_users iu  ON iu.user_id = ipg.created_by  "+
                    " WHERE a.`account_state_id` IN (5,9) "+
                    " 	AND la.`disbursement_date` < '"+dateUtils.getCurrentDate(new Date())+"'" +
                    "   AND la.`parent_account_id` IS NULL "+
                    " 	AND a.`office_id` = "+officeId+
                    " 	AND ipg.`is_ld_tracked` = 0  "+
                    " 	GROUP BY la.`account_id` "+
                    "   ORDER BY la.`account_id`";
            }else if(roleId == constantsObj.getSMHroleId()){
                groupQuery =  " SELECT lct.*,ipg.*,iu.user_name FROM"+
                    " (SELECT "+
                    " client_det.*,"+
                    " client_mismatch.rm_verified AS client_mismatch_rm_verified,"+
                    " amount_mismatch.rm_verified AS amount_mismatch_rm_verified"+
                    " FROM"+
                    " (SELECT "+
                    " client_id,"+
                    " group_id,"+
                    " account_id "+
                    " FROM"+
                    " `ld_call_tracking` "+
                    " GROUP BY client_id"+
                    " )client_det"+
                    " LEFT JOIN "+
                    " (SELECT "+
                    " `call_tracking_detail_id` AS client_mistmatch_call_track_id,"+
                    " `cce_remarks` AS client_mismatch,"+
                    " version_no,"+
                    " rm_verified,"+
                    " (SELECT client_id FROM `ld_call_tracking` lct WHERE lct.`call_tracking_id` = lctd1.`parent_call_tracking_id`) AS client_id,"+
                    " (SELECT group_id FROM `ld_call_tracking` lct WHERE lct.`call_tracking_id` = lctd1.`parent_call_tracking_id`) AS group_id"+
                    " FROM ld_call_tracking_detail lctd1 "+
                    " WHERE " +
                    " `version_no` = (SELECT MAX(version_no) FROM ld_call_tracking_detail lctd WHERE lctd.`parent_call_tracking_id` = lctd1.`parent_call_tracking_id`)"+
                    " AND lctd1.`question_id`=48  "+
                    " AND lctd1.`answer_id` = 167 "+
                    " AND rm_verified=0"+
                    " GROUP BY lctd1.`parent_call_tracking_id`"+
                    " )client_mismatch ON client_mismatch.client_id = client_det.client_id"+
                    " LEFT JOIN "+
                    " (SELECT "+
                    " `call_tracking_detail_id` AS amount_mismatch_call_track_id,"+
                    " `cce_remarks` AS amount_mismatch,"+
                    " version_no, "+
                    " rm_verified,"+
                    " (SELECT client_id FROM `ld_call_tracking` lct WHERE lct.`call_tracking_id` = lctd1.`parent_call_tracking_id`) AS client_id,"+
                    " (SELECT group_id FROM `ld_call_tracking` lct WHERE lct.`call_tracking_id` = lctd1.`parent_call_tracking_id`) AS group_id"+
                    " FROM ld_call_tracking_detail lctd1 "+
                    " WHERE " +
                    " `version_no` = (SELECT MAX(version_no) FROM ld_call_tracking_detail lctd WHERE lctd.`parent_call_tracking_id` = lctd1.`parent_call_tracking_id`)"+
                    " AND lctd1.`question_id`=40  "+
                    " AND lctd1.`answer_id` = 132 "+
                    " AND rm_verified=0"+
                    " GROUP BY lctd1.`parent_call_tracking_id`"+
                    " )amount_mismatch ON amount_mismatch.client_id = client_det.client_id"+
                    " INNER JOIN loan_account la ON la.`account_id` = client_det.`account_id`"+
                    " INNER JOIN `iklant_prospect_client` ipc ON ipc.`client_id` = client_det.`client_id`"+
                    " INNER JOIN `iklant_prospect_group` ipg ON ipg.`group_id` = client_det.`group_id`"+
                    " WHERE amount_mismatch_call_track_id IS NOT NULL OR  client_mistmatch_call_track_id IS NOT NULL"+
                    " )lct"+
                    " INNER JOIN `iklant_prospect_group` ipg ON ipg.`group_id` = lct.`group_id`"+
                    " LEFT JOIN iklant_users iu ON iu.user_id = ipg.created_by "+
                    " WHERE ipg.`office_id` = "+officeId+
                    " GROUP BY ipg.`group_id`";
            }
            else if(roleId == constantsObj.getBMroleId()){
                groupQuery = "  SELECT lct.*,ipg.*,iu.user_name FROM"+
                    " (SELECT "+
                    " client_det.*,"+
                    " emi.bm_verified AS emi_bm_verified,"+
                    " interest.bm_verified AS interest_bm_verified,"+
                    " tenure.bm_verified AS tenure_bm_verified,"+
                    " call_status.bm_verified AS call_status_bm_verified"+
                    "  	"+
                    " FROM"+
                    " (SELECT "+
                    " client_id,"+
                    " group_id,"+
                    " account_id "+
                    " FROM"+
                    " `ld_call_tracking` "+
                    " GROUP BY client_id"+
                    " )client_det"+
                    " LEFT JOIN "+
                    " (SELECT "+
                    " `call_tracking_detail_id` AS emi_call_track_id,"+
                    " `cce_remarks` AS emi_mismatch,"+
                    " bm_verified,"+
                    " version_no,"+
                    " (SELECT client_id FROM `ld_call_tracking` lct WHERE lct.`call_tracking_id` = lctd1.`parent_call_tracking_id`) AS client_id,"+
                    " (SELECT group_id FROM `ld_call_tracking` lct WHERE lct.`call_tracking_id` = lctd1.`parent_call_tracking_id`) AS group_id"+
                    "  	"+
                    " FROM ld_call_tracking_detail lctd1 "+
                    " WHERE " +
                    " `version_no` = (SELECT MAX(version_no) FROM ld_call_tracking_detail lctd WHERE lctd.`parent_call_tracking_id` = lctd1.`parent_call_tracking_id`)"+
                    " AND lctd1.`question_id`=41  "+
                    " AND lctd1.`answer_id` = 134 "+
                    " AND bm_verified=0"+
                    " GROUP BY lctd1.`parent_call_tracking_id`"+
                    " )emi ON emi.client_id = client_det.client_id"+
                    " LEFT JOIN "+
                    " (SELECT "+
                    " `call_tracking_detail_id` AS interest_call_track_id,"+
                    " `cce_remarks` AS interest_mismatch,"+
                    " bm_verified,"+
                    " version_no, "+
                    " (SELECT client_id FROM `ld_call_tracking` lct WHERE lct.`call_tracking_id` = lctd1.`parent_call_tracking_id`) AS client_id,"+
                    " (SELECT group_id FROM `ld_call_tracking` lct WHERE lct.`call_tracking_id` = lctd1.`parent_call_tracking_id`) AS group_id"+
                    " FROM ld_call_tracking_detail lctd1 "+
                    " WHERE " +
                    " `version_no` = (SELECT MAX(version_no) FROM ld_call_tracking_detail lctd WHERE lctd.`parent_call_tracking_id` = lctd1.`parent_call_tracking_id`)"+
                    " AND lctd1.`question_id`=42  "+
                    " AND lctd1.`answer_id` = 136 "+
                    " AND bm_verified=0"+
                    " GROUP BY lctd1.`parent_call_tracking_id`"+
                    " )interest ON interest.client_id = client_det.client_id"+
                    " LEFT JOIN "+
                    " (SELECT "+
                    " `call_tracking_detail_id` AS tenure_call_track_id,"+
                    " `cce_remarks` AS tenure_mismatch,"+
                    " bm_verified,"+
                    " version_no, "+
                    " (SELECT client_id FROM `ld_call_tracking` lct WHERE lct.`call_tracking_id` = lctd1.`parent_call_tracking_id`) AS client_id,"+
                    " (SELECT group_id FROM `ld_call_tracking` lct WHERE lct.`call_tracking_id` = lctd1.`parent_call_tracking_id`) AS group_id"+
                    " FROM ld_call_tracking_detail lctd1 "+
                    " WHERE " +
                    " `version_no` = (SELECT MAX(version_no) FROM ld_call_tracking_detail lctd WHERE lctd.`parent_call_tracking_id` = lctd1.`parent_call_tracking_id`)"+
                    " AND lctd1.`question_id`=43  "+
                    " AND lctd1.`answer_id` = 138 "+
                    " AND bm_verified=0"+
                    " GROUP BY lctd1.`parent_call_tracking_id`"+
                    " )tenure ON tenure.client_id = client_det.client_id"+
                    " LEFT JOIN "+
                    " (SELECT "+
                    " `call_tracking_detail_id` AS call_status_track_id,"+
                    " lctd1.`question_id`,lctd1.`answer_id`,ilv.`lookup_value`,"+
                    " bm_verified,"+
                    " version_no, "+
                    " (SELECT client_id FROM `ld_call_tracking` lct WHERE lct.`call_tracking_id` = lctd1.`parent_call_tracking_id`) AS client_id,"+
                    " (SELECT group_id FROM `ld_call_tracking` lct WHERE lct.`call_tracking_id` = lctd1.`parent_call_tracking_id`) AS group_id"+
                    " FROM ld_call_tracking_detail lctd1 "+
                    " INNER JOIN `iklant_lookup_value` ilv ON ilv.`lookup_id` = lctd1.`answer_id`"+
                    " WHERE " +
                    " `version_no` = (SELECT MAX(version_no) FROM ld_call_tracking_detail lctd WHERE lctd.`parent_call_tracking_id` = lctd1.`parent_call_tracking_id`)"+
                    " AND lctd1.`question_id`=48  "+
                    " AND (       "+
                        " ( lctd1.`answer_id` = 148 AND (SELECT COUNT(*) FROM ld_call_tracking_detail lctd WHERE lctd.`parent_call_tracking_id` = lctd1.`parent_call_tracking_id` AND lctd.`answer_id` = 148) >= "+dbTableName.Lookup148Count+" )  "+
                        " OR ( lctd1.`answer_id` = 149 AND (SELECT COUNT(*) FROM ld_call_tracking_detail lctd WHERE lctd.`parent_call_tracking_id` = lctd1.`parent_call_tracking_id` AND lctd.`answer_id` = 149) >= "+dbTableName.Lookup149Count+" )  "+
                        " OR ( lctd1.`answer_id` = 150 AND (SELECT COUNT(*) FROM ld_call_tracking_detail lctd WHERE lctd.`parent_call_tracking_id` = lctd1.`parent_call_tracking_id` AND lctd.`answer_id` = 150) >= "+dbTableName.Lookup150Count+" )  "+
                        " OR ( lctd1.`answer_id` = 151 AND (SELECT COUNT(*) FROM ld_call_tracking_detail lctd WHERE lctd.`parent_call_tracking_id` = lctd1.`parent_call_tracking_id` AND lctd.`answer_id` = 151) >= "+dbTableName.Lookup151Count+" )  "+
                        " OR ( lctd1.`answer_id` = 152 AND (SELECT COUNT(*) FROM ld_call_tracking_detail lctd WHERE lctd.`parent_call_tracking_id` = lctd1.`parent_call_tracking_id` AND lctd.`answer_id` = 152) >= "+dbTableName.Lookup152Count+" )  "+
                        " OR ( lctd1.`answer_id` = 153 AND (SELECT COUNT(*) FROM ld_call_tracking_detail lctd WHERE lctd.`parent_call_tracking_id` = lctd1.`parent_call_tracking_id` AND lctd.`answer_id` = 153) >= "+dbTableName.Lookup153Count+" )  "+
                        " OR ( lctd1.`answer_id` = 154 AND (SELECT COUNT(*) FROM ld_call_tracking_detail lctd WHERE lctd.`parent_call_tracking_id` = lctd1.`parent_call_tracking_id` AND lctd.`answer_id` = 154) >= "+dbTableName.Lookup154Count+" )  "+
                        " OR ( lctd1.`answer_id` = 155 AND (SELECT COUNT(*) FROM ld_call_tracking_detail lctd WHERE lctd.`parent_call_tracking_id` = lctd1.`parent_call_tracking_id` AND lctd.`answer_id` = 155) >= "+dbTableName.Lookup155Count+" )  "+
                        " OR ( lctd1.`answer_id` = 156 AND (SELECT COUNT(*) FROM ld_call_tracking_detail lctd WHERE lctd.`parent_call_tracking_id` = lctd1.`parent_call_tracking_id` AND lctd.`answer_id` = 156) >= "+dbTableName.Lookup156Count+" )  "+
                        " OR ( lctd1.`answer_id` = 157 AND (SELECT COUNT(*) FROM ld_call_tracking_detail lctd WHERE lctd.`parent_call_tracking_id` = lctd1.`parent_call_tracking_id` AND lctd.`answer_id` = 157) >= "+dbTableName.Lookup157Count+" )  "+
                        " OR ( lctd1.`answer_id` = 158 AND (SELECT COUNT(*) FROM ld_call_tracking_detail lctd WHERE lctd.`parent_call_tracking_id` = lctd1.`parent_call_tracking_id` AND lctd.`answer_id` = 158) >= "+dbTableName.Lookup158Count+" )  "+
                        " OR ( lctd1.`answer_id` = 162 AND (SELECT COUNT(*) FROM ld_call_tracking_detail lctd WHERE lctd.`parent_call_tracking_id` = lctd1.`parent_call_tracking_id` AND lctd.`answer_id` = 162) >= "+dbTableName.Lookup162Count+" )   "+
                    " ) "+
                    //" AND (SELECT group_id FROM `ld_call_tracking` lct WHERE lct.`call_tracking_id` = lctd1.`parent_call_tracking_id`) = 1131"+
                    " AND bm_verified=0"+
                    " GROUP BY lctd1.`parent_call_tracking_id`"+
                    " )call_status ON call_status.client_id = client_det.client_id"+
                    " INNER JOIN loan_account la ON la.`account_id` = client_det.`account_id`"+
                    " INNER JOIN `iklant_prospect_client` ipc ON ipc.`client_id` = client_det.`client_id`"+
                    " INNER JOIN `iklant_prospect_group` ipg ON ipg.`group_id` = client_det.`group_id`"+
                    " WHERE tenure_call_track_id IS NOT NULL OR interest_call_track_id IS NOT NULL OR emi_call_track_id IS NOT NULL OR call_status_track_id IS NOT NULL "+
                    " )lct"+
                    " INNER JOIN `iklant_prospect_group` ipg ON ipg.`group_id` = lct.`group_id`"+
                    " LEFT JOIN iklant_users iu ON iu.user_id = ipg.created_by "+
                    " WHERE ipg.`office_id` = "+officeId+
                    " GROUP BY ipg.`group_id`";
            }
        }
        else if(requestedOperationId == constantsObj.getIdleGroupsOperationId()){
            groupQuery = "SELECT ipg.group_id,ipg.status_id, ipg.loan_count, ipg.group_name, ipg.center_name,p.display_name AS user_name," +
                "(SELECT COUNT(client_id) FROM iklant_prospect_client WHERE group_id = ipg.group_id AND status_id = ipg.status_id) AS active_clients,"+
                "(SELECT DISTINCT(mifos_customer_id) FROM iklant_mifos_mapping WHERE group_id = ipg.group_id AND mifos_client_customer_id IS NULL) AS mifos_customer_id," +
                "0 AS active_clients_per_status,'' AS de_date,ipg.is_synchronized,ipg.loan_count AS loanCount " +
                "FROM " + dbTableName.iklantProspectGroup + " ipg " +
                "INNER JOIN personnel p ON p.personnel_id = ipg.created_by   "+
                "WHERE ipg.office_id = " + officeId + " AND is_idle = 1 "+
                "GROUP BY ipg.group_id ORDER BY ipg.group_id,ipg.group_name;";
        }else if(requestedOperationId == constantsObj.getLeaderSubLeaderVerificationOperationId() && roleId == constantsObj.getBMroleId()){
            groupQuery = "SELECT tot_cli.total_clients,gp.*,ac.active_clients,DATE_FORMAT(gp.updated_date,'%d-%m-%Y   %k:%i:%s') AS de_date ";
            groupQuery += ",(SELECT COUNT(ipc.client_id) FROM "+dbTableName.iklantProspectClient+" ipc WHERE group_id = gp.group_id AND needed_image_clarity_docs != 0) AS total_nmi ";
            groupQuery += " FROM (SELECT pg.*,0 as mifos_customer_id,IF(pg.loan_count > 1, u.user_name,u.user_name) AS user_name FROM "+dbTableName.iklantProspectGroup+" pg " +
                "LEFT JOIN "+dbTableName.iklantProspectClient+" pc ON pc.group_id = pg.group_id " +
                "LEFT JOIN "+dbTableName.iklantUsers+" u ON u.user_id = pg.created_by " +
                "LEFT JOIN "+dbTableName.iklantUsers+" u1 ON u1.user_id = pg.assigned_to " + //Added to retrieve FO who created the group
                "WHERE pg.tenant_id = " + tenantId + " AND pg.office_id = " + officeId + " " +
                "AND pg.leader_global_number IS NOT NULL " +
                "GROUP BY pg.group_id)gp " +
                "LEFT JOIN " +
                "(SELECT COUNT(pc.client_id) AS active_clients ,pc.group_id  FROM "+dbTableName.iklantProspectClient+" pc " +
                "INNER JOIN "+dbTableName.iklantProspectGroup+" pg ON pg.group_id = pc.group_id WHERE pc.status_id " +
                "NOT IN (" +constantsObj.getRejectedStatusIds()+") " +
                " AND pg.is_idle = 0 GROUP BY pc.group_id)ac ON " +
                "ac.group_id = gp.group_id";
            //Displaying the total number of clients [total clients = total rows - all rejected in prev loan counts]
            groupQuery +=
                " LEFT JOIN (SELECT COUNT(pc.client_id) AS total_clients,pc.group_id "+
                " FROM "+dbTableName.iklantProspectClient+" pc INNER JOIN "+dbTableName.iklantProspectGroup+" pg "+
                " ON pg.group_id = pc.group_id WHERE IF(pc.loan_count < pg.loan_count,pc.status_id "+
                " NOT IN (" +constantsObj.getRejectedStatusIds()+"),pc.status_id NOT IN ("+constantsObj.getRejectedInNextLoanPreCheck()+","+constantsObj.getRejectedPreviousLoanStatusId()+","+ constantsObj.getRejectedKYCDataVerificationStatusId()+")) AND pg.is_idle = 0 "+
                " GROUP BY pc.group_id) tot_cli ON tot_cli.group_id = gp.group_id "
        }else if(requestedOperationId == constantsObj.getKYCReUpdateOperationId()){
            groupQuery = "SELECT gp.*," +
            "DATE_FORMAT(gp.updated_date,'%d-%m-%Y   %k:%i:%s') AS de_date," +
            "(SELECT COUNT(ipc.client_id) FROM iklant_prospect_client ipc " +
            "WHERE group_id = gp.group_id AND needed_image_clarity_docs != 0) AS total_nmi " +
            "FROM (SELECT pg.*, 0 AS mifos_customer_id, IF(pg.loan_count > 1, u.user_name, u.user_name) AS user_name," +
            "(SELECT COUNT(client_id) FROM "+dbTableName.iklantProspectClient+" WHERE status_id " +
            "NOT IN (" +constantsObj.getRejectedStatusIds()+") " +
            "AND loan_count = pg.loan_count AND group_id = pg.group_id GROUP BY group_id )AS active_clients " +
            "FROM "+dbTableName.iklantProspectGroup+" pg " +
            "INNER JOIN "+dbTableName.iklantProspectClient+" pc ON pc.group_id = pg.group_id " +
            "INNER JOIN "+dbTableName.iklantUsers+" u ON u.user_id = pg.created_by " +
            "INNER JOIN "+dbTableName.iklantUsers+" u1 ON u1.user_id = pg.assigned_to " +
            "LEFT JOIN "+dbTableName.iklantProspectClientPreviousContact+" ipc ON ipc.client_id = pc.client_id " +
            "WHERE pg.tenant_id = " + tenantId + " AND pg.office_id = " +officeId+ " AND pg.is_idle = 0 " +
            "AND pc.kyc_update_request = 1 ";
            if(roleId == constantsObj.getBMroleId()){
                groupQuery += "AND ipc.verification_status = 0 ";
            }else if(roleId == constantsObj.getDEOroleId()){
                groupQuery += "AND ipc.verification_status IN (1,3) ";
            }
            else if(roleId == constantsObj.getSMHroleId()){
                groupQuery += "AND ipc.verification_status IN (2) ";
            }
            groupQuery +=  "GROUP BY pg.group_id) gp";
        }
        else{
            //Query for Other roles
            // Modified by chitra for active clients in each status
            groupQuery = "SELECT tot_cli.total_clients,(CASE WHEN hcc.hold_clients_count IS NULL THEN 0 ELSE hcc.hold_clients_count END) AS hold_clients_count" +
                ",(CASE WHEN rma.rma_clients_count IS NULL THEN 0 ELSE rma.rma_clients_count END) AS rma_clients_count "+
                ",gp.*,ac.active_clients,DATE_FORMAT(gp.updated_date,'%d-%m-%Y   %k:%i:%s') AS de_date ";
            if (requestedOperationId == constantsObj.getKYCUpdatingOperationId()){
                groupQuery += ",acs.active_clients_per_status,"+
                "(CASE WHEN fcc.fresh_clients IS NULL THEN 0 ELSE fcc.fresh_clients END) AS fresh_clients"
            }
            if (requestedOperationId == constantsObj.getKYCUpdatingOperationId()){
                groupQuery += " ,nic_cleared.nic_cleared_status ";
            }
            if (requestedOperationId == constantsObj.getKYCUpdatingOperationId()){
                groupQuery += ",IFNULL(dv_query.dv_query_status,0) AS dv_query ";
            }
            groupQuery += ",(SELECT COUNT(ipc.client_id) FROM "+dbTableName.iklantProspectClient+" ipc WHERE group_id = gp.group_id AND needed_image_clarity_docs != 0) AS total_nmi ";
            groupQuery += " FROM (SELECT pg.*,0 as mifos_customer_id,IF(pg.loan_count > 1, u.user_name,u.user_name) AS user_name FROM "+dbTableName.iklantProspectGroup+" pg " +
                "LEFT JOIN "+dbTableName.iklantProspectClient+" pc ON pc.group_id = pg.group_id ";
            if(requestedOperationId == constantsObj.getLeaderSubLeaderVerificationOperationId()){
                groupQuery +=    "INNER JOIN "+dbTableName.iklantOperationStatus+" os ON os.operation_id = " + constantsObj.getLeaderSubLeaderVerificationOperationId() + " ";
            }else{
                groupQuery +=    "INNER JOIN "+dbTableName.iklantOperationStatus+" os ON os.operation_id = " + requestedOperationId + " ";
            }
            groupQuery += "LEFT JOIN "+dbTableName.iklantUsers+" u ON u.user_id = pg.created_by " +
                "LEFT JOIN "+dbTableName.iklantUsers+" u1 ON u1.user_id = pg.assigned_to " + //Added to retrieve FO who created the group
                "WHERE pg.tenant_id = " + tenantId + " AND pg.office_id = " + officeId + " " +
                "AND os.status_id = pg.status_id AND pg.is_idle = 0 ";
            if(requestedOperationId == constantsObj.getLeaderSubLeaderVerificationOperationId() || requestedOperationId == constantsObj.getLeaderSubLeaderUpdatingOperationId()){
                groupQuery += " AND (pg.needed_image_clarity != 1 OR pg.needed_image_clarity IS  NULL) ";
            }
            groupQuery +=  " GROUP BY pg.group_id)gp " +
                "LEFT JOIN " +
                "(SELECT COUNT(pc.client_id) AS active_clients ,pc.group_id  FROM "+dbTableName.iklantProspectClient+" pc " +
                "INNER JOIN "+dbTableName.iklantProspectGroup+" pg ON pg.group_id = pc.group_id WHERE pc.status_id " +
                "NOT IN (" +constantsObj.getRejectedStatusIds()+") " +
                " AND pg.is_idle = 0 GROUP BY pc.group_id)ac ON " +
                "ac.group_id = gp.group_id";
            // Displaying the number of clients in Need Image clarity
            groupQuery +=
                " LEFT JOIN (SELECT COUNT(pc.client_id) AS hold_clients_count, pc.group_id "+
                " FROM "+dbTableName.iklantProspectClient+" pc INNER JOIN "+dbTableName.iklantProspectGroup+" pg "+
                " ON pg.group_id = pc.group_id WHERE pc.status_id in( "+constantsObj.getKYCVerificationStatusId()+","+ constantsObj.getNewGroup() +") AND pg.is_idle = 0 "+
                " GROUP BY pc.group_id) hcc ON hcc.group_id = gp.group_id ";

            // Displaying the number of clients in Need RM Approval

            groupQuery +=
                " LEFT JOIN (SELECT COUNT(pc.client_id) AS rma_clients_count, pc.group_id "+
                " FROM "+dbTableName.iklantProspectClient+" pc INNER JOIN "+dbTableName.iklantProspectGroup+" pg "+
                " ON pg.group_id = pc.group_id WHERE pc.status_id = "+constantsObj.getNeedRMApprovalStatusId()+" AND pg.is_idle = 0 "+
                " GROUP BY pc.group_id) rma ON rma.group_id = gp.group_id ";


            //Displaying the total number of clients [total clients = total rows - all rejected in prev loan counts]
            groupQuery +=
                " LEFT JOIN (SELECT COUNT(pc.client_id) AS total_clients,pc.group_id "+
                " FROM "+dbTableName.iklantProspectClient+" pc INNER JOIN "+dbTableName.iklantProspectGroup+" pg "+
                " ON pg.group_id = pc.group_id WHERE IF(pc.loan_count < pg.loan_count,pc.status_id "+
                " NOT IN (" +constantsObj.getRejectedStatusIds()+"),pc.status_id NOT IN ("+constantsObj.getRejectedInNextLoanPreCheck()+","+constantsObj.getRejectedPreviousLoanStatusId()+","+ constantsObj.getRejectedKYCDataVerificationStatusId()+")) AND pg.is_idle = 0 "+
                " GROUP BY pc.group_id) tot_cli ON tot_cli.group_id = gp.group_id "
            if (requestedOperationId == constantsObj.getKYCUpdatingOperationId()){
                groupQuery +=
                    " LEFT JOIN  "+
                    "    (SELECT  "+
                    "      COUNT(pc.client_id) AS fresh_clients, "+
                    "      pc.group_id  "+
                    "    FROM "+
                    "      "+dbTableName.iklantProspectClient+" pc  "+
                    "      INNER JOIN "+dbTableName.iklantProspectGroup+" pg  "+
                    "        ON pg.group_id = pc.group_id  "+
                    "    WHERE pc.status_id " +
                        "NOT IN (" +constantsObj.getRejectedStatusIds()+") " +
                    "      AND pc.loan_count = 1 "+
                    "      AND pg.is_idle = 0  "+
                    "    GROUP BY pc.group_id) fcc  "+
                    "    ON fcc.group_id = gp.group_id  ";
                groupQuery += " LEFT JOIN (SELECT COUNT(pc.client_id) AS active_clients_per_status ,pc.group_id  FROM "+dbTableName.iklantProspectClient+" pc INNER JOIN "+dbTableName.iklantProspectGroup+" pg ON pg.group_id = pc.group_id WHERE pc.status_id NOT IN ( "+ prelimRejectedStatus + "," +nextLoanPreCheckRejectedStatus +"," +rejectedIdleStage +","+rejectedPrevLoan+" ,"+ constantsObj.getRejectedKYCDataVerificationStatusId()+")" +
                    " GROUP BY pc.group_id)acs ON acs.group_id = gp.group_id LEFT JOIN (SELECT COUNT(pc.client_id)AS nic_cleared_status,pc.group_id FROM "+dbTableName.iklantFoHoldImageTrack+" fo,"+dbTableName.iklantProspectClient+" pc,"+dbTableName.iklantProspectGroup+" pg WHERE " +
                    " pg.group_id = pc.group_id and pc.client_id = fo.client_id AND operation_id = "+constantsObj.getKYCUpdatingOperationId()+" AND `needed_image_clarity_docs` = 0 AND  pc.status_id NOT IN (" +constantsObj.getRejectedStatusIds()+" ) AND fo.created_date >= pg.created_date GROUP BY pc.group_id) nic_cleared ON nic_cleared.group_id = gp.group_id ";
                groupQuery += "LEFT JOIN (SELECT COUNT(pc.client_id)AS dv_query_status,pc.group_id FROM "+dbTableName.iklantFoHoldImageTrack+" fo,"+dbTableName.iklantProspectClient+" pc,"+dbTableName.iklantProspectGroup+" pg WHERE " +
                    " pg.group_id = pc.group_id and pc.client_id = fo.client_id AND pg.`needed_image_clarity` =0 AND `needed_image_clarity_docs` = 0 AND IF((SELECT MAX(hold_type) FROM iklant_fo_hold_image_track WHERE client_id = fo.`client_id` AND id =(SELECT MAX(id) FROM iklant_fo_hold_image_track WHERE client_id = fo.`client_id`) GROUP BY client_id)=3,fo.hold_type=3,fo.hold_type=0) AND  pc.status_id NOT IN (" +constantsObj.getRejectedStatusIds()+" ) AND fo.created_date >= pg.created_date GROUP BY pc.group_id) dv_query ON dv_query.group_id = gp.group_id ORDER BY de_date ";
            }
        }
        customlog.info("groupQuery : " + groupQuery);
        connectionDataSource.getConnection(function (clientConnect) {
            clientConnect.query(groupQuery,
                    function selectCb(err, results, fields) {
                    connectionDataSource.releaseConnectionPool(clientConnect);
                    if (err) {
                        customlog.error(err);
                    } else {
                        if(requestedOperationId == constantsObj.getNextLoanPreCheckOperationId()){
                            for (var i in results) {
                                listGroupsIdArray[i] = results[i].group_id;
                                listGroupsArray[i] = results[i].group_name;
                                listGroupsGlobalNumberArray[i] = results[i].center_name;
                                mifosCustomerId[i] = results[i].mifos_customer_id;
                                fieldOfficerName[i] = results[i].user_name;
                                accountNumbers[i] = results[i].account_id;
                                activeClientsPerStatus[i] = results[i].noOfClients;
                                loanCount[i] = results[i].loanCount;
                            }
                        }
                        else {
                            for (var i in results) {
                                accountId[i] = (results[i].account_id!='undefined')?results[i].account_id:0;
                                listGroupsIdArray[i] = results[i].group_id;
                                listGroupsArray[i] = results[i].group_name;
                                listGroupsGlobalNumberArray[i] = results[i].center_name;
                                activeClients[i] = results[i].active_clients;
                                mifosCustomerId[i] = results[i].mifos_customer_id;
                                // Added by chitra for active clients in each status
                                activeClientsPerStatus[i] = results[i].active_clients_per_status;
                                if (requestedOperationId == constantsObj.getKYCDownloadingOperationId() || requestedOperationId == constantsObj.getDataVerificationOperationId()) {
                                    if (!activeClientsPerStatus[i]) {
                                        error_msg_array[i] = 1;
                                    }
                                    freshClientsCountArray[i] = results[i].fresh_clients;
                                    totalClientsCountArray[i] = results[i].total_clients;
                                    if (requestedOperationId == constantsObj.getDataVerificationOperationId()) {
                                        nicClearedCountArray[i]  = results[i].nic_cleared_status;
                                    }
                                }
                                else if (requestedOperationId == constantsObj.getKYCUpdatingOperationId()) {
                                    if (results[i].total_nmi == activeClientsPerStatus[i]) {
                                        error_msg_array[i] = 1;
                                    }
                                    freshClientsCountArray[i] = results[i].fresh_clients;
                                    totalClientsCountArray[i] = results[i].total_clients;
                                    nicClearedCountArray[i]  = results[i].nic_cleared_status;
                                    needRMApprovalCountArray[i]  = results[i].rma_clients_count;
                                    dvQuery[i] = results[i].dv_query;
                                }
                                dataEntryDate[i] = results[i].de_date;
                                if (requestedOperationId == constantsObj.getFieldVerificationOperationId()) {
                                    neededInfo[i] = results[i].needed_information;
                                } else if (requestedOperationId == constantsObj.getKYCUpdatingOperationId() || requestedOperationId == constantsObj.getKYCDownloadingOperationId() || requestedOperationId == constantsObj.getDataVerificationOperationId()) {
                                    neededImageClarity[i] = results[i].needed_image_clarity;
                                    holdedClientsCount[i] = results[i].hold_clients_count;
                                }
                                else if (requestedOperationId == constantsObj.getDataVerificationOperationId()) {
                                    isDataVerifiedArray[i] = results[i].is_data_verified;
                                    nicClearedCountArray[i]  = results[i].nic_cleared_status;
                                }
                                isSynchronized[i] = results[i].is_synchronized;
                                fieldOfficerName[i] = results[i].user_name;
                                loanCount[i] = results[i].loan_count;
                                if(requestedOperationId == constantsObj.getIdleGroupsOperationId()){
                                    statusIds[i] = results[i].status_id;
                                }
                                if(requestedOperationId == constantsObj.getCreditBureauAnalysedOperationId()
                                    || requestedOperationId == constantsObj.getHoldGroupsOperationId() || requestedOperationId == constantsObj.getHoldGroupsOperationId()
                                    || requestedOperationId == constantsObj.getLeaderSubLeaderUpdatingOperationId() || requestedOperationId == constantsObj.getLeaderSubLeaderVerificationOperationId()
                                    || requestedOperationId == constantsObj.getNeedMoreVerificationOperationId()){
                                    totalClientsCountArray[i] = results[i].total_clients;
                                }

                                if(totalClientsCountArray[i] == 'undefined' || typeof totalClientsCountArray[i] == 'undefined' || totalClientsCountArray[i] == null || totalClientsCountArray[i] == ""){
                                    totalClientsCountArray[i] = 0;
                                }
                                if(activeClients[i] == 'undefined' || typeof activeClients[i] == 'undefined' || activeClients[i] == null || activeClients[i] == ""){
                                    activeClients[i] = 0;
                                }
                            }
                        }
                    }
                    callback(listGroupsIdArray, listGroupsArray, activeClients, neededInfo, isSynchronized, listGroupsGlobalNumberArray,
                        fieldOfficerName, neededImageClarity, mifosCustomerId,isDataVerifiedArray,activeClientsPerStatus,dataEntryDate,error_msg_array,
                        accountNumbers, loanCount, statusIds,freshClientsCountArray,holdedClientsCount,totalClientsCountArray,nicClearedCountArray,accountId,needRMApprovalCountArray,dvQuery);
                });
        });
    },
    createGroup: function (tenantId, officeId, userId, callback) {
        var groupNames = new Array();
        var areaCodes = new Array();
        var areaNames = new Array();
        var self=this;
        var query = "SELECT group_name from "+dbTableName.iklantProspectGroup+" where office_id =" + officeId + " and tenant_id=" + tenantId + "";
        connectionDataSource.getConnection(function (clientConnect) {
            clientConnect.query(query,
                function selectCb(err, results, fields) {
                    if (err) {
                        connectionDataSource.releaseConnectionPool(clientConnect);
                    } else {
                        var nextGroupName = "";
                        for (var i in results) {
                            var fieldName = results[i];
                            groupNames[i] = fieldName.group_name;
                        }
                        if (results == "") {
                            nextGroupName = "00" + officeId + "-" + "001";
                        } else {
                            var lastGroupName = groupNames[groupNames.length - 1];
                            var lastGroupNameSplitted = groupNames[groupNames.length - 1].split('-');
                            var parsedIncValue = (parseInt(lastGroupNameSplitted[1], 10) + 1);
                            if (parsedIncValue.toString().length == 2) {
                                nextGroupName = (lastGroupNameSplitted[0]) + "-" + "0" + parsedIncValue;
                            }
                            else if (parsedIncValue.toString().length == 1) {
                                nextGroupName = (lastGroupNameSplitted[0]) + "-" + "0" + "0" + parsedIncValue;
                            }
                            else {
                                nextGroupName = (lastGroupNameSplitted[0]) + "-" + parsedIncValue;
                            }
                        }
                        var areaCodesQuery = "SELECT iac.area_code_id,iaqr.response FROM " + dbTableName.iklantAreaCode + " iac " +
                            "LEFT JOIN " + dbTableName.iklantAreaQuestionResponse + " iaqr ON iaqr.area_code_id = iac.area_code_id " +
                            "WHERE iac.area_code_status = 1 AND iaqr.question_id = 1 AND iac.office_id = " + officeId + " AND iac.assigned_to = " + userId;
                        clientConnect.query(areaCodesQuery,function(err,result){
                            connectionDataSource.releaseConnectionPool(clientConnect);
                            if(err){
                            }
                            else{
                                for(var i=0;i<result.length;i++){
                                    areaCodes[i] = result[i].area_code_id;
                                    areaNames[i] = result[i].response;
                                }
                                callback(groupNames, nextGroupName, areaCodes, areaNames);
                            }
                        });
                    }
                });
        });
    },
    retrieveLoanTypelistDataModel: function (tenantId, callback) {
        //Retrieve LoanType List
        var self = this;
        var loanTypeIdArray = new Array();
        var loanTypeArray = new Array();
        var loanTypeListQuery = "SELECT * FROM "+dbTableName.iklantLoanType+"  where tenant_id=" + tenantId + "";
        connectionDataSource.getConnection(function (clientConnect) {
            clientConnect.query(loanTypeListQuery,
                function selectCb(err, results, fields) {
                    connectionDataSource.releaseConnectionPool(clientConnect);
                    if (err) {
                        customlog.error(err);
                        callback(loanTypeIdArray, loanTypeArray);
                    } else {
                        for (var i in results) {
                            var fieldName = results[i];
                            loanTypeIdArray[i] = fieldName.loan_type_id;
                            loanTypeArray[i] = fieldName.loan_type;
                        }
                        callback(loanTypeIdArray, loanTypeArray);
                    }
                }
            );
        });
    },
    retriveOfficeDatamodel: function (tenantId, userId,callback) {
        var self = this;
        var constantsObj = this.constants;
        var officeIdArray = new Array();
        var officeNameArray = new Array();
        var officeShortNameArray = new Array();
        var officeAddressArray = new Array();
        var languageArray = new Array();
        var retriveOfficeQuery = "SELECT io.office_id,io.office_name,io.office_short_name,io.office_address,io.tenant_id,isl.doc_language FROM "+dbTableName.iklantOffice+" io " +
            "LEFT JOIN `iklant_state_list` isl ON isl.state_id = io.`state_id` " +
            "LEFT JOIN rm_regional_office_list rmro ON rmro.office_id = io.office_id WHERE " +
            "io.tenant_id = " + tenantId + " and io.active_indicator=" + constantsObj.getActiveIndicatorTrue()+" " +
            "AND (rmro.user_id = " + userId + " OR " + userId + " = -1) GROUP BY io.office_id";

        customlog.info("retriveOfficeQuery: " + retriveOfficeQuery);
        connectionDataSource.getConnection(function (clientConnect) {
            clientConnect.query(retriveOfficeQuery, function selectCb(err, results, fields) {
                connectionDataSource.releaseConnectionPool(clientConnect);
                if (err) {
                    customlog.error(err);
                    callback(officeIdArray, officeNameArray, officeAddressArray, officeShortNameArray);
                }
                else {
                    for (var i in results) {
                        officeIdArray[i] = results[i].office_id;
                        officeNameArray[i] = results[i].office_name;
                        officeShortNameArray[i] = results[i].office_short_name;
                        officeAddressArray[i] = results[i].office_address;
                        languageArray[i] = results[i].doc_language;
                    }
                    customlog.info("officeNameArray" + officeNameArray);
                    callback(officeIdArray, officeNameArray, officeAddressArray, officeShortNameArray,languageArray);
                }
            });
        });
    },
    listClientsForRMAuthorizationDataModel : function (tenantId, userId, officeId, roleId, callback) {
        var self=this;
        customlog.info("Inside listClientsDataModel");
        var clientIdArray = new Array();
        var clientNameArray = new Array();
        var groupNameArray = new Array();
        var centerNameArray = new Array();
        var remarksForRMApprovalArray = new Array();
        var constantsObj = this.constants;
        var retrieveClientsForRMAuthorization = " SELECT pg.group_name,pg.center_name,pc.client_id,pc.client_name,pc.remarks_for_rm_approval "+
            "FROM "+dbTableName.iklantProspectClient+" pc " +
            "INNER JOIN "+dbTableName.iklantProspectGroup+" pg ON pg.group_id = pc.group_id " +
            "INNER JOIN "+dbTableName.iklantOffice+" o ON o.office_id = pg.office_id " +
            "LEFT JOIN rm_regional_office_list rmro ON rmro.office_id = o.office_id " +
            "WHERE pc.status_id = "+ constantsObj.getNeedRMApprovalStatusId() +" AND o.active_indicator=1 AND (rmro.user_id = "+userId+" OR "+userId+" = -1)  GROUP BY pc.client_id";
        customlog.info("retrieveClientsForRMAuthorization" + retrieveClientsForRMAuthorization);
        connectionDataSource.getConnection(function (clientConnect) {
            clientConnect.query(retrieveClientsForRMAuthorization,
                function selectCb(err, results, fields) {
                    connectionDataSource.releaseConnectionPool(clientConnect);
                    if (err) {
                        customlog.error(err);
                    } else {
                        for (var i in results) {
                            clientIdArray[i] = results[i].client_id;
                            clientNameArray[i] = results[i].client_name;
                            groupNameArray[i] = results[i].group_name;
                            centerNameArray[i] = results[i].center_name;
                            remarksForRMApprovalArray[i] = results[i].remarks_for_rm_approval;
                        }
                        callback(clientIdArray, clientNameArray, groupNameArray, centerNameArray, remarksForRMApprovalArray);
                    }
                });
        });

    },
    listClientsDataModel: function (tenantId, userId, officeId, roleId, callback) {
        var self=this;
        customlog.info("Inside listClientsDataModel");
        var clientIdArray = new Array();
        var clientNameArray = new Array();
        var groupNameArray = new Array();
        var centerNameArray = new Array();
        var lastCreditCheckDate = new Array();
        var constantsObj = this.constants;
        var prelimRejectedStatus = constantsObj.getRejectedPriliminaryVerification();
        var fieldRejectedStatus = constantsObj.getRejectedFieldVerification();
        var appraisalRejectedStatus = constantsObj.getRejectedAppraisal();
        var creditRejectedStatus = constantsObj.getRejectedCreditBureauAnalysisStatusId();
        var syncronizedStatus = constantsObj.getSynchronizedGroupsStatus();
        var kycRejectedStatus = constantsObj.getRejectedKYCDataVerificationStatusId();
        var rejectedClientsList;
        if(roleId == constantsObj.getBMroleId() || roleId == constantsObj.getGuestUserRoleId()){
            rejectedClientsList = "SELECT pc.client_id,pc.client_name,pg.group_name,pg.center_name," +
            "IF(pc.status_id = "+creditRejectedStatus+",pc.updated_date,ps.status_name) AS last_credit_date " +
                "FROM "+dbTableName.iklantProspectClient+" pc " +
                "INNER JOIN "+dbTableName.iklantProspectGroup+" pg ON pg.group_id = pc.group_id " +
                "INNER JOIN "+dbTableName.iklantOffice+" o ON o.office_id = pg.office_id " +
                "INNER JOIN "+dbTableName.iklantProspectStatus+" ps ON ps.status_id = pc.status_id " +
                "WHERE pc.status_id IN (" + prelimRejectedStatus + ", " +
                "" + fieldRejectedStatus + "," + kycRejectedStatus +"," + appraisalRejectedStatus + ", " +
                "" + creditRejectedStatus + "," + constantsObj.getRejectedInNextLoanPreCheck() + ", " + constantsObj.getRejectedWhileIdleGroupsStatusId() + ") " +
                "AND pg.office_id =" + officeId + " AND (pg.status_id NOT IN ("+syncronizedStatus+") OR pg.status_id IS NULL) AND pc.updated_date >= DATE_SUB(CURDATE(), INTERVAL 2 MONTH) "+
                "AND pc.client_id NOT IN (SELECT client_id FROM "+dbTableName.iklantRejectedClientStatus+" WHERE is_bm_reinitiated = 1 AND is_rm_reinitiated = 0);";
        } /*else if(roleId == constantsObj.getSMHroleId()) {
            rejectedClientsList = "SELECT pc.client_id,pc.client_name,pg.group_name,pg.center_name," +
            "IF(pc.status_id = "+creditRejectedStatus+",pc.updated_date,ps.status_name) AS last_credit_date  " +
                "FROM "+dbTableName.iklantProspectClient+" pc " +
                "INNER JOIN "+dbTableName.iklantProspectGroup+" pg ON pg.group_id = pc.group_id " +
                "INNER JOIN "+dbTableName.iklantProspectStatus+" ps ON ps.status_id = pc.status_id " +
                "LEFT JOIN "+dbTableName.iklantRejectedClientStatus+" rcs ON rcs.client_id = pc.client_id "+
                "WHERE pc.status_id IN (" + prelimRejectedStatus + ", " +
                "" + fieldRejectedStatus + "," + kycRejectedStatus +"," + appraisalRejectedStatus + ", " +
                "" + creditRejectedStatus + "," + constantsObj.getRejectedInNextLoanPreCheck() + ", " + constantsObj.getRejectedWhileIdleGroupsStatusId() + ") " +
                " AND (pg.status_id NOT IN ("+syncronizedStatus+") OR pg.status_id IS NULL) AND pc.updated_date >= DATE_SUB(CURDATE(), INTERVAL 2 MONTH) "+
                " AND pc.client_id NOT IN (SELECT client_id FROM "+dbTableName.iklantRejectedClientStatus+" WHERE is_bm_reinitiated = 1 AND is_rm_reinitiated = 0)"+
                " AND pg.office_id = " + officeId;
        }*/
        else if(roleId == constantsObj.getSMHroleId()) {
            rejectedClientsList = "SELECT pc.client_id,pc.client_name,pg.group_name,pg.center_name," +
                "IF(pc.status_id = "+creditRejectedStatus+",pc.updated_date,ps.status_name) AS last_credit_date  " +
                "FROM "+dbTableName.iklantProspectClient+" pc " +
                "INNER JOIN "+dbTableName.iklantProspectGroup+" pg ON pg.group_id = pc.group_id " +
                "INNER JOIN "+dbTableName.iklantRejectedClientStatus+" rcs ON rcs.client_id = pc.client_id "+
                "INNER JOIN "+dbTableName.iklantProspectStatus+" ps ON ps.status_id = pc.status_id " +
                "WHERE pc.status_id IN (" + prelimRejectedStatus + ", " +
                "" + fieldRejectedStatus + "," + appraisalRejectedStatus + ", " +
                "" + creditRejectedStatus + "," + constantsObj.getRejectedInNextLoanPreCheck() + ", " + constantsObj.getRejectedWhileIdleGroupsStatusId() + ") " +
                " AND (pg.status_id NOT IN ("+syncronizedStatus+") OR pg.status_id IS NULL) AND pc.updated_date >= DATE_SUB(CURDATE(), INTERVAL 2 MONTH) "+
                "AND rcs.is_bm_reinitiated = 1 AND rcs.is_rm_reinitiated = 0 AND pg.office_id = " + officeId;
        }
        customlog.info("rejectedClientsList" + rejectedClientsList);
        connectionDataSource.getConnection(function (clientConnect) {
            clientConnect.query(rejectedClientsList,
                function selectCb(err, results, fields) {
                    connectionDataSource.releaseConnectionPool(clientConnect);
                    if (err) {
                        customlog.error(err);
                    } else {
                        for (var i in results) {
                            clientIdArray[i] = results[i].client_id;
                            clientNameArray[i] = results[i].client_name;
                            groupNameArray[i] = results[i].group_name;
                            centerNameArray[i] = results[i].center_name;
                            lastCreditCheckDate[i] = results[i].last_credit_date;
                        }
                        callback(clientIdArray, clientNameArray, groupNameArray, centerNameArray, lastCreditCheckDate);
                    }
                });
        });
    },
    retrieveLookUpIdDataModel: function (callback) {
        var self = this;
        var lookupEntity = require(commonDTO+"/lookupEntity");
        var constantsObj = this.constants;
        var lookupEntityObj = new lookupEntity();
        var entityId = new Array();
        var lookupId = new Array();
        var lookupValue = new Array();
        var gender = new Array();
        var maritalStatus = new Array();
        var nationality = new Array();
        var religion = new Array();
        var caste = new Array();
        var educationalDetails = new Array();
        var loanPurpose = new Array();
        var relationship = new Array();
        var familyRelationship = new Array();
        var guarantorRelationship = new Array();
        var occupation = new Array();
        var house = new Array();
        var houseCeiling = new Array();
        var houseWall = new Array();
        var houseFloor = new Array();
        var houseToilet = new Array();
        //var repaymentTrackRecord = new Array();
        //Names//
        var genderName = new Array();
        var maritalStatusName = new Array();
        var nationalityName = new Array();
        var religionName = new Array();
        var casteName = new Array();
        var educationalDetailsName = new Array();
        var loanPurposeName = new Array();
        var relationshipName = new Array();
        var familyRelationshipName = new Array();
        var guarantorRelationshipName = new Array();
        var occupationName = new Array();
        var houseName = new Array();
        var houseCeilingName = new Array();
        var houseWallName = new Array();
        var houseFloorName = new Array();
        var houseToiletName = new Array();
        //var repaymentTrackRecordName = new Array();
        var businessCategory = new Array();
        var businessCategoryName = new Array();

        var lookupValueFetchQuery = "select le.entity_id,lv.lookup_id,lookup_value from "+dbTableName.iklantLookupEntity+" le " +
            "inner join "+dbTableName.iklantLookupValue+" lv on lv.entity_id = le.entity_id ";
        connectionDataSource.getConnection(function (clientConnect) {
            clientConnect.query(lookupValueFetchQuery,
                function selectCb(err, results, fields) {
                    connectionDataSource.releaseConnectionPool(clientConnect);
                    if (err) {
                        callback();
                        customlog.error(err);
                    }
                    else {
                        for (var i in results) {
                            entityId = results[i].entity_id;
                            lookupId = results[i].lookup_id;
                            lookupValue = results[i].lookup_value;
                            if (entityId == constantsObj.getGenderLookupEntity()) {
                                gender.push(lookupId);
                                genderName.push(lookupValue);
                            }
                            if (entityId == constantsObj.getMaritalStatusLookupEntity()) {
                                maritalStatus.push(lookupId);
                                maritalStatusName.push(lookupValue);
                            }
                            if (entityId == constantsObj.getNationalityLookupEntity()) {
                                nationality.push(lookupId);
                                nationalityName.push(lookupValue);
                            }
                            if (entityId == constantsObj.getReligionLookupEntity()) {
                                religion.push(lookupId);
                                religionName.push(lookupValue);
                            }
                            if (entityId == constantsObj.getCasteLookupEntity()) {
                                caste.push(lookupId);
                                casteName.push(lookupValue);
                            }
                            if (entityId == constantsObj.getEducationalDetailsLookupEntity()) {
                                educationalDetails.push(lookupId);
                                educationalDetailsName.push(lookupValue);
                            }
                            if (entityId == constantsObj.getLoanPurposeLookupEntity()) {
                                loanPurpose.push(lookupId);
                                loanPurposeName.push(lookupValue);
                            }
                            if (entityId == constantsObj.getRelationshipLookupEntity()) {
                                relationship.push(lookupId);
                                relationshipName.push(lookupValue);
                            }
                            if (entityId == constantsObj.getFamilyRelationshipLookupEntity()) {
                                familyRelationship.push(lookupId);
                                familyRelationshipName.push(lookupValue);
                            }
                            if (entityId == constantsObj.getOccupationLookupEntity()) {
                                occupation.push(lookupId);
                                occupationName.push(lookupValue);
                            }
                            if (entityId == constantsObj.getHouseLookupEntity()) {
                                house.push(lookupId);
                                houseName.push(lookupValue);
                            }
                            if (entityId == constantsObj.getHouseCeilingLookupEntity()) {
                                houseCeiling.push(lookupId);
                                houseCeilingName.push(lookupValue);
                            }
                            if (entityId == constantsObj.getHouseWallLookupEntity()) {
                                houseWall.push(lookupId);
                                houseWallName.push(lookupValue);
                            }
                            if (entityId == constantsObj.getHouseFloorLookupEntity()) {
                                houseFloor.push(lookupId);
                                houseFloorName.push(lookupValue);
                            }
                            if (entityId == constantsObj.getHouseToiletLookupEntity()) {
                                houseToilet.push(lookupId);
                                houseToiletName.push(lookupValue);
                            }
                            if (entityId == constantsObj.getGuarantorRelationshipLookupEntity()) {
                                guarantorRelationship.push(lookupId);
                                guarantorRelationshipName.push(lookupValue);
                            }
                            var businessCategoryEntityIdArray = dbTableName.businessCategoryEntityId.split(',');
                            for(var i=0;i<businessCategoryEntityIdArray.length;i++){
                                if(businessCategoryEntityIdArray[i] == entityId) {
                                    businessCategory.push(lookupId);
                                    businessCategoryName.push(lookupValue);
                                    break;
                                }
                            }
                            /*if(entityId==constantsObj.getRepaymentTrackRecordLookupEntity()){
                             repaymentTrackRecord.push(lookupId);
                             repaymentTrackRecordName.push(lookupValue);
                             }*/
                        }
                        lookupEntityObj.setGender(gender);
                        lookupEntityObj.setGenderName(genderName);
                        lookupEntityObj.setMaritalStatus(maritalStatus);
                        lookupEntityObj.setMaritalStatusName(maritalStatusName);
                        lookupEntityObj.setNationality(nationality);
                        lookupEntityObj.setNationalityName(nationalityName);
                        lookupEntityObj.setReligion(religion);
                        lookupEntityObj.setReligionName(religionName);
                        lookupEntityObj.setCaste(caste);
                        lookupEntityObj.setCasteName(casteName);
                        lookupEntityObj.setEducationalDetails(educationalDetails);
                        lookupEntityObj.setEducationalDetailsName(educationalDetailsName);
                        lookupEntityObj.setLoanPurpose(loanPurpose);
                        lookupEntityObj.setLoanPurposeName(loanPurposeName);
                        lookupEntityObj.setBusinessCategory(businessCategory);
                        lookupEntityObj.setBusinessCategoryName(businessCategoryName);
                        lookupEntityObj.setRelationship(relationship);
                        lookupEntityObj.setRelationshipName(relationshipName);
                        lookupEntityObj.setFamilyRelationship(familyRelationship);
                        lookupEntityObj.setFamilyRelationshipName(familyRelationshipName);
                        lookupEntityObj.setGuarantorRelationship(guarantorRelationship);
                        lookupEntityObj.setGuarantorRelationshipName(guarantorRelationshipName);
                        lookupEntityObj.setOccupation(occupation);
                        lookupEntityObj.setOccupationName(occupationName);
                        lookupEntityObj.setHouse(house);
                        lookupEntityObj.setHouseName(houseName);
                        lookupEntityObj.setHouseCeiling(houseCeiling);
                        lookupEntityObj.setHouseCeilingName(houseCeilingName);
                        lookupEntityObj.setHouseWall(houseWall);
                        lookupEntityObj.setHouseWallName(houseWallName);
                        lookupEntityObj.setHouseFloor(houseFloor);
                        lookupEntityObj.setHouseFloorName(houseFloorName);
                        lookupEntityObj.setHouseToilet(houseToilet);
                        lookupEntityObj.setHouseToiletName(houseToiletName);

                        callback(lookupEntityObj);
                    }
                }
            );
        });
    },
    insertActivityLogDataModel: function(activityDetails){
        var self = this;
        if(activityDetails[11]){
            if(activityDetails[11] == "insert" || activityDetails[11] == "update" || activityDetails[11] == "delete"){
                var userLogQuery = "INSERT INTO iklant_user_activity_log (port,tenant_id,created_date_time,user_id,user_name,url,ip_address,file_name,method_name,status,page_name,description) " +
                    "VALUES ('"+activityDetails[0]+"','"+activityDetails[1]+"',NOW() + INTERVAL 5 HOUR + INTERVAL 30 MINUTE,'"+ activityDetails[2] +"','"+activityDetails[3]+"','"+activityDetails[4]+"','"+activityDetails[5]+"','"+activityDetails[6]+"','"+activityDetails[7]+"','"+activityDetails[8]+"','"+activityDetails[9]+"','"+activityDetails[10]+"');";
                customlog.info(userLogQuery);
                connectionDataSource.getConnection(function (clientConnect) {
                    clientConnect.query(userLogQuery,
                        function selectCb(err, results) {
                            connectionDataSource.releaseConnectionPool(clientConnect);
                            if (err) {
                                customlog.error(err);
                            }
                        });
                });
            }
        }
    },
    getFONamesForAssigningFODatamodel: function (tenantId, officeId, callback) {
        var self=this;
        var FOIdsArrayForAssigning = new Array();
        var FONamesArrayForAssigning = new Array();

        var constantsObj = this.constants;
        var FONamesQuery = "SELECT u.user_id,u.user_name FROM "+dbTableName.iklantUsers+" u " +
            "INNER JOIN "+dbTableName.mfiPersonnelRole+" ur ON ur.personnel_id = u.user_id " +
            "INNER JOIN "+dbTableName.iklantRole+" r ON r.role_id = ur.role_id " +
            "INNER JOIN "+dbTableName.iklantRoleOperation+" ro ON ro.role_id = ur.role_id " +
            "WHERE ro.operation_id = " + constantsObj.getFieldVerificationOperationId() + " " +
            "AND u.office_id = " + officeId + " AND u.tenant_id = " + tenantId + " " +
            "AND u.active_indicator = " + constantsObj.getActiveIndicatorTrue() + "";
        customlog.info("FONamesQueryForAssigningFO : " + FONamesQuery);
        connectionDataSource.getConnection(function (clientConnect) {
            clientConnect.query(FONamesQuery, function selectCb(err, results, fields) {
                connectionDataSource.releaseConnectionPool(clientConnect);
                if (err) {
                    customlog.error(err);
                } else {
                    for (var i in results) {
                        FOIdsArrayForAssigning[i] = results[i].user_id;
                        FONamesArrayForAssigning[i] = results[i].user_name;
                    }
                    callback(FOIdsArrayForAssigning, FONamesArrayForAssigning);
                }
            });
        });
    },
    getUsersDatamodel: function (tenantId, callback) {
        var self = this;
        var constantsObj = this.constants;
        var getUsersQuery = "SELECT u.user_id,u.user_name,o.office_name,contact_number,email_id, imei_number " +
            "FROM "+dbTableName.iklantUsers+"  u " +
            "INNER JOIN  "+dbTableName.iklantOffice+"  o ON o.office_id = u.office_id " +
            "INNER JOIN  "+dbTableName.mfiPersonnelRole+"  pr ON pr.personnel_id = u.user_id " +
            "WHERE u.tenant_id=" + tenantId + " AND " +
            "u.active_indicator =" + constantsObj.getActiveIndicatorTrue() + " " +
            "ORDER BY o.office_id,u.user_id ";
        var userIdArray = new Array();
        var userNameArray = new Array();
        var office_NameArray = new Array();
        var contactNumberArray = new Array();
        var emailIDArray = new Array();
        var userRoleIdArray = new Array();
        var imeiArray = new Array();
        var userNameAllArray = new Array();
        customlog.info("GetUsers Query : " + getUsersQuery);
        connectionDataSource.getConnection(function (clientConnect) {
            clientConnect.query(getUsersQuery, function selectCb(err, results, fields) {
                if (!err) {
                    for (var i in results) {
                        userIdArray[i] = results[i].user_id;
                        userNameArray[i] = results[i].user_name;
                        office_NameArray[i] = results[i].office_name;
                        contactNumberArray[i] = results[i].contact_number;
                        emailIDArray[i] = results[i].email_id;
                        userRoleIdArray[i] = results[i].role_id;
                        if(results[i].imei_number != null){
                            imeiArray.push(results[i].imei_number);
                        }
                    }
                    var getAllUsersQuery = "SELECT u.user_id,u.user_name,o.office_name,contact_number,email_id, imei_number " +
                        "FROM "+dbTableName.iklantUsers+"  u " +
                        "INNER JOIN  "+dbTableName.iklantOffice+"  o ON o.office_id = u.office_id " +
                        "INNER JOIN  "+dbTableName.mfiPersonnelRole+"  pr ON pr.personnel_id = u.user_id " +
                        "WHERE u.tenant_id=" + tenantId + " ORDER BY o.office_id,u.user_id ";
                    customlog.info("GetAllUsers Query : " + getAllUsersQuery);
                    //connectionDataSource.getConnection(function (clientConnect) {
                        clientConnect.query(getAllUsersQuery, function selectCb(err, results, fields) {
                            connectionDataSource.releaseConnectionPool(clientConnect);
                            if (!err) {
                                for (var i in results) {
                                    userNameAllArray[i] = results[i].user_name;
                                }
                                callback(userIdArray, userNameArray, office_NameArray, contactNumberArray, emailIDArray,userRoleIdArray,imeiArray,userNameAllArray);
                            }
                            else
                            {
                                customlog.error(err);
                                callback(userIdArray, userNameArray, office_NameArray, contactNumberArray, emailIDArray,userRoleIdArray,imeiArray,userNameAllArray);
                            }
                        });
                   // });
                } else {
                    connectionDataSource.releaseConnectionPool(clientConnect);
                    customlog.error(err);
                    callback(userIdArray, userNameArray, office_NameArray, contactNumberArray, emailIDArray,userRoleIdArray,imeiArray,userNameAllArray);
                }
            });
        });
    },
    getRolesDatamodel: function (tenantId, callback) {
        var self = this;
        var constantsObj = this.constants;
        var getRolesQuery = "SELECT role_id,role_name,role_description FROM " +
            ""+dbTableName.iklantRole+"  WHERE tenant_id=" + tenantId + " " +
            "AND active_indicator=" + constantsObj.getActiveIndicatorTrue() + " " +
            "AND role_id NOT IN (" + constantsObj.getSMHroleId() + "," + constantsObj.getAdminroleId() + ") ";

        var roleIdArray = new Array();
        var roleNameArray = new Array();
        var roleDescriptionArray = new Array();
        customlog.info("GetRoles Query : " + getRolesQuery);
        connectionDataSource.getConnection(function (clientConnect) {
            clientConnect.query(getRolesQuery, function selectCb(err, results, fields) {
                connectionDataSource.releaseConnectionPool(clientConnect);
                if (!err) {
                    for (var i in results) {
                        roleIdArray[i] = results[i].role_id;
                        roleNameArray[i] = results[i].role_name;
                        roleDescriptionArray[i] = results[i].role_description;
                    }
                    callback(roleIdArray, roleNameArray, roleDescriptionArray);
                } else {
                    customlog.error(err);
                    callback(roleIdArray, roleNameArray, roleDescriptionArray);
                }
            });
        });
    },
    retriveStateDatamodel: function (callback) {
        var self = this;
        var constantsObj = this.constants;
        var stateIdArray = new Array();
        var stateNameArray = new Array();
        var retriveStateQuery = "SELECT state_id,state_name FROM iklant_state_list";;
        customlog.info("retriveStateQuery" + retriveStateQuery);
        connectionDataSource.getConnection(function (clientConnect) {
            clientConnect.query(retriveStateQuery, function selectCb(err, results, fields) {
                connectionDataSource.releaseConnectionPool(clientConnect);
                if (err) {
                    customlog.error(err);
                    callback(stateIdArray, stateNameArray);
                }
                else {
                    for (var i in results) {
                        stateIdArray[i] = results[i].state_id;
                        stateNameArray[i] = results[i].state_name;
                    }
                    callback(stateIdArray, stateNameArray);
                }
            });
        });
    },
    getIklantGroupIdFromCustomerIdDataModel: function (mifosCustomerId, callback) {
        var self = this;
        var iklantMifosMappingQuery = "SELECT group_id FROM "+dbTableName.iklantMifosMapping+" WHERE mifos_customer_id = " + mifosCustomerId;
        customlog.info("Query" + iklantMifosMappingQuery);
        connectionDataSource.getConnection(function (clientConnect) {
            clientConnect.query(iklantMifosMappingQuery, function (error, iklantMifosMappingQueryResult) {
                connectionDataSource.releaseConnectionPool(clientConnect);
                if (error) {
                    customlog.error(error);
                    callback(iklantMifosMappingQueryResult);
                }
                else {
                    callback(iklantMifosMappingQueryResult);
                }
            });
        });
    },
    manageRoles: function (callback) {
        //select query to fetch operations from operation table
        var manageRoles = require(path.join(commonDTO,"/manageRoles"));
        var manageRolesObj = new manageRoles();
        var operation_id = new Array();
        var operation_name = new Array();
        var fetchOperationQuery = "SELECT * FROM "+dbTableName.iklantOperation;
        connectionDataSource.getConnection(function (clientConnect) {
            clientConnect.query(fetchOperationQuery, function selectCb(err, results, fields) {
                connectionDataSource.releaseConnectionPool(clientConnect);
                if (err) {
                    customlog.error(err);
                }
                else {
                    for (var i in results) {
                        operation_id[i] = results[i].operation_id;
                        operation_name[i] = results[i].operation_name;
                    }
                    manageRolesObj.setOperation_id(operation_id);
                    manageRolesObj.setOperation_name(operation_name);
                }
                callback(manageRolesObj);
            });
        });
    },
    retriveFieldOfficersDataModel: function (officeId, callback) {
        var self=this;
        var constantsObj = this.constants;
        var foIdArray = new Array();
        var foNameArray = new Array();
        var retrieveAciveFOQuery = "SELECT u.user_id,u.user_name,pr.role_id FROM "+dbTableName.iklantUsers+" u " +
            "INNER JOIN  "+dbTableName.mfiPersonnelRole+" pr ON u.user_id = pr.personnel_id " +
            "WHERE u.office_id = " + officeId + " AND  pr.role_id = " + constantsObj.getFOroleId() + " AND active_indicator = 1; ";
        customlog.info("retrieveAciveFOQuery : " + retrieveAciveFOQuery);
        connectionDataSource.getConnection(function (clientConnect) {
            clientConnect.query(retrieveAciveFOQuery,
                function selectCb(err, results, fields) {
                    connectionDataSource.releaseConnectionPool(clientConnect);
                    if (err) {
                        customlog.error(err);
                    } else {
                        for (var i in results) {
                            foIdArray[i] = results[i].user_id;
                            foNameArray[i] = results[i].user_name;
                        }
                    }
                    callback(foIdArray, foNameArray);
                });
        });
    },
    getPersonnelDetailsDataModel: function (office_id, userId, callBack) {
        var self = this;
        var constObj = this.constants;
        var personnelIdArray = new Array();
        var personnelNameArray = new Array();
        var personnelDetailsQuery = "SELECT p.personnel_id,p.display_name FROM personnel p" +
            " INNER JOIN personnel_role pr ON pr.personnel_id = p.personnel_id" +
            " LEFT JOIN rm_regional_office_list rmro ON rmro.office_id = p.office_id" +
            " WHERE pr.role_id IN(" + constObj.getFOroleId() + "," + constObj.getBDEroleId() + ") AND (p.office_id = " + office_id + " OR " + office_id + " = -1)" +
            " AND (rmro.user_id = " + userId + " OR " + userId + " = -1) AND p.personnel_status = 1";
        connectionDataSource.getConnection(function (clientConnect) {
            clientConnect.query(personnelDetailsQuery, function (error, personnelResult) {
                connectionDataSource.releaseConnectionPool(clientConnect);
                if (error) {
                    customlog.error(error);
                    callBack(personnelIdArray, personnelNameArray);
                }
                else {
                    for (var i in personnelResult) {
                        personnelIdArray[i] = personnelResult[i].personnel_id;
                        personnelNameArray[i] = personnelResult[i].display_name;
                    }
                    callBack(personnelIdArray, personnelNameArray);
                }
            });
        });
    },
    retrieveClientDetailsForGeneratePDFDataModel: function (mifosCustomerId, selectedMemberId, callback) {
        var self=this;
        var clientIdArray = new Array();
        var groupCode;
        var retrieveClientIdQuery = "SELECT imm.group_id,pg.group_name,pc.client_id FROM "+dbTableName.iklantMifosMapping+" imm " +
            "INNER JOIN "+dbTableName.iklantProspectGroup+" pg ON pg.group_id = imm.group_id " +
            "INNER JOIN "+dbTableName.iklantProspectClient+" pc ON pc.group_id = pg.group_id " +
            "WHERE imm.mifos_customer_id = " + mifosCustomerId + " "
        if (selectedMemberId != "") {
            retrieveClientIdQuery += " AND pc.client_id IN (" + selectedMemberId + ")";
        }
        retrieveClientIdQuery += ";"
        customlog.info("retrieveClientIdQuery" + retrieveClientIdQuery);
        connectionDataSource.getConnection(function (clientConnect) {
            clientConnect.query(retrieveClientIdQuery, function selectCb(err, results, fields) {
                connectionDataSource.releaseConnectionPool(clientConnect);
                if (err) {
                    customlog.error(err);
                } else {
                    for (var i in results) {
                        var fieldName = results[i];
                        clientIdArray[i] = fieldName.client_id;
                        groupCode = fieldName.group_name;
                    }
                    customlog.info("clientIdArray" + clientIdArray);
                    customlog.info("groupCode" + groupCode);
                    callback(clientIdArray, groupCode);
                }
            });
        });
    },
    updateLeaderAndSubLeaderDetailsDataModel : function(groupId,mifosCustomerId,callback){
        var constantsObj = this.constants;
        var selectGroupQuery = "SELECT * FROM `iklant_prospect_group` WHERE group_id = "+groupId;
        var subLeaderRejectedGlobalNumber = new Array();
        var subLeaderRejectedClientId = new Array();
        connectionDataSource.getConnection(function (clientConnect) {
            clientConnect.query(selectGroupQuery, function(err,results) {
                if(err){
                    customlog.error(err);
                    connectionDataSource.releaseConnectionPool(clientConnect);
                    callback('failure');
                }
                else if(results != null && results[0].leader_global_number != null){
                    var selectClientQuery = "SELECT * FROM `iklant_prospect_client` WHERE group_id = "+groupId + " AND `status_id` IN ("+constantsObj.getRejectedPriliminaryVerification()+","+constantsObj.getRejectedCreditBureauAnalysisStatusId()+","+constantsObj.getRejectedFieldVerification()+","+constantsObj.getRejectedAppraisal()+"" +
                        ","+constantsObj.getRejectedLoanSanction()+","+constantsObj.getRejectedInNextLoanPreCheck()+","+constantsObj.getRejectedWhileIdleGroupsStatusId()+","+constantsObj.getArchived()+","+constantsObj.getRejectedKYCDataVerificationStatusId()+","+constantsObj.getRejectedPreviousLoanStatusId()+") AND (`sub_leader_global_number` IS NOT NULL or sub_leader_global_number != '')";
                    clientConnect.query(selectClientQuery, function(error,clientResult) {
                        if(error){
                            customlog.error(error);
                            connectionDataSource.releaseConnectionPool(clientConnect);
                            callback('failure');
                        }
                        else if(clientResult != null && clientResult.length > 0){
                            for(var j in clientResult){
                                subLeaderRejectedGlobalNumber [j] =  clientResult[j].sub_leader_global_number;
                                subLeaderRejectedClientId [j] =  clientResult[j].client_id;
                            }
                            var updateRejectedLeaderquery = "UPDATE iklant_prospect_client SET sub_leader_global_number = null,total_sub_group_client = null, updated_date= NOW() + INTERVAL 5 HOUR + INTERVAL 30 MINUTE WHERE client_id in( "+subLeaderRejectedClientId+")";
                            clientConnect.query(updateRejectedLeaderquery, function(error3,subLeaderRejectedResult) {
                                if(error3){
                                    customlog.error(error3);
                                    connectionDataSource.releaseConnectionPool(clientConnect);
                                    callback('failure');
                                }else{
                                    connectionDataSource.releaseConnectionPool(clientConnect);
                                    callback('Success',subLeaderRejectedGlobalNumber,subLeaderRejectedClientId);
                                }
                            });
                        }else{
                            connectionDataSource.releaseConnectionPool(clientConnect);
                            callback('Success',subLeaderRejectedGlobalNumber,subLeaderRejectedClientId);
                        }
                    });
                }else{
                    connectionDataSource.releaseConnectionPool(clientConnect);
                    callback('Success',subLeaderRejectedGlobalNumber,subLeaderRejectedClientId);
                }
            });
        });
    },

    updateLeaderAndSubLeaderDetailsInMifosDataModel : function(groupId,mifosCustomerId,callback){
        var selectClientQuery = "SELECT `mifos_client_customer_id` FROM `iklant_mifos_mapping` WHERE `mifos_customer_id` = "+mifosCustomerId+" AND `mifos_client_customer_id` IS NOT NULL";
        connectionDataSource.getConnection(function (clientConnect) {
            clientConnect.query(selectClientQuery, function(err,results) {
                if(err){
                    customlog.error(err);
                    connectionDataSource.releaseConnectionPool(clientConnect);
                    callback('failure');
                }
                else{
                    for(var i = 0; i< results.length ; i++){
                        var updateClientQuery = "UPDATE `customer_custom_detail` SET `customer_custom_num` = (SELECT `client_global_number` FROM `iklant_mifos_mapping` imm,`iklant_prospect_client` pc WHERE imm.client_id = pc.client_id  AND pc.group_id = "+groupId+" AND `mifos_client_customer_id` = "+results[i].mifos_client_customer_id+" )" +
                            " WHERE customer_id = (SELECT `mifos_client_customer_id` FROM `iklant_mifos_mapping` imm,`iklant_prospect_client` pc WHERE imm.client_id = pc.client_id AND `mifos_client_customer_id` = "+results[i].mifos_client_customer_id+" AND pc.group_id = "+groupId+" )";
                        console.log(i +" "+updateClientQuery);
                        clientConnect.query(updateClientQuery, function(error,leaderResult) {
                            if(error){
                                customlog.error(error);
                                connectionDataSource.releaseConnectionPool(clientConnect);
                                callback('failure');
                            }
                        });
                    }
                    if(i == results.length){
                        connectionDataSource.releaseConnectionPool(clientConnect);
                        callback('Success');
                    }
                }
            });
        });
    },

    updateLeaderAndSubLeaderDetailsForRejectedDataModel : function(subLeaderRejectedGlobalNumber,subLeaderRejectedClientId,callback){
        var constantsObj = this.constants;
        connectionDataSource.getConnection(function (clientConnect) {
            var selectClientQuery = "SELECT * FROM `iklant_prospect_client` WHERE `client_global_number` LIKE '%"+subLeaderRejectedGlobalNumber+"%' AND client_id != "+subLeaderRejectedClientId+" AND status_id NOT IN ("+constantsObj.getRejectedPriliminaryVerification()+","+constantsObj.getRejectedCreditBureauAnalysisStatusId()+","+constantsObj.getRejectedFieldVerification()+","+constantsObj.getRejectedAppraisal()+"" +
                ","+constantsObj.getRejectedLoanSanction()+","+constantsObj.getRejectedInNextLoanPreCheck()+","+constantsObj.getRejectedWhileIdleGroupsStatusId()+","+constantsObj.getArchived()+","+constantsObj.getRejectedKYCDataVerificationStatusId()+","+constantsObj.getRejectedPreviousLoanStatusId()+") ORDER BY client_global_number";
            console.log("selectClientQuery : " + selectClientQuery)  ;
            clientConnect.query(selectClientQuery, function(error,clientResult) {
                if(error){
                    customlog.error(error);
                    connectionDataSource.releaseConnectionPool(clientConnect);
                    callback('failure');
                }else{
                    if(clientResult.length != null || clientResult.length > 0)
                        var updateClientQuery = "UPDATE iklant_prospect_client SET sub_leader_global_number = '"+subLeaderRejectedGlobalNumber+"',total_sub_group_client = "+clientResult.length+", updated_date= NOW() + INTERVAL 5 HOUR + INTERVAL 30 MINUTE WHERE client_id = "+clientResult[0].client_id;
                    clientConnect.query(updateClientQuery, function(error,leaderResult) {
                        if(error){
                            customlog.error(error);
                            connectionDataSource.releaseConnectionPool(clientConnect);
                            callback('failure');
                        }else{
                            console.log(updateClientQuery);
                            connectionDataSource.releaseConnectionPool(clientConnect);
                            callback('Success');
                        }
                    });
                }
            });
        });
    },

    KYCFileUploadForLoanSanctionDatamodel: function (clientid, formType, mifosCustomerId, docLanguage, bcOfficeId, callback) {
        var kycform = require(path.join(commonDTO,"/kycform"));
        var clientFamilyFetch = require(path.join(commonDTO,"/prospectClientFamilyFetch"));
        var clientOtherMfiFetch = require(path.join(commonDTO,"/prospectClientOtherMfiFetch"));

        var self=this;
        var constantsObj = this.constants;
        var activeIndicatorTrue = constantsObj.getActiveIndicatorTrue();
        var kycformObj = new kycform();
        var prospectClientFamilyFetchObj = new clientFamilyFetch();
        var prospectClientOtherMfiFetchObj = new clientOtherMfiFetch();
        var groupId;
        var groupName;
        var isSynchronized;

        var client_name = new Array();
        var clientIdArray = new Array();
        var branchNameArray = new Array();
        var centerNameArray = new Array();
        var clientNameArray = new Array();
        var dateOfBirthArray = new Array();
        var guardianRelationshipArray = new Array();
        var guardianNameArray = new Array();
        var guardianAgeArray = new Array();
        var guarantorNameArray = new Array();
        var guarantorAgeArray = new Array();
        var guarantorRelationshipArray = new Array();
        var rationCardNoArray = new Array();
        var voterIdArray = new Array();
        var gasNoArray = new Array();
        var aadharNoArray = new Array();
        var guarantorIdArray = new Array();
        var phoneNoArray = new Array();
        var religionArray = new Array();
        var casteArray = new Array();
        var maritalStatusArray = new Array();
        var educationArray = new Array();
        var loanPurposeArray = new Array();
        var addressArray = new Array();
        var pinCodeArray = new Array();
        var familyMonthlyIncomeArray = new Array();
        var familyMonthlyExpenseArray = new Array();
        var houseArray = new Array();
        var houseSizeArray = new Array();
        var houseRoofArray = new Array();
        var houseFloorArray = new Array();
        var toiletArray = new Array();
        var vehicleArray = new Array();
        var bankAccountArray = new Array();
        var savingsArray = new Array();

        var other_mfi_client_id_array = new Array();
        var other_mfi_name_array = new Array();
        var other_mfi_outstanding_array = new Array();

        var family_client_id_array = new Array();
        var family_member_name_array = new Array();
        var family_member_gender_array = new Array();
        var family_member_relationship_array = new Array();
        var family_member_dob_array = new Array();
        var family_member_education_array = new Array();
        var family_member_occupation_array = new Array();
        var family_member_income_array = new Array();

        var photo_clientId_array = new Array();
        var captured_image_array = new Array();
        var foName = new Array();
        var grtDate = new Array();

        /*var photoPathQuery = "SELECT client_id,Captured_image FROM "+dbTableName.iklantClientDoc+
         " WHERE client_id IN (SELECT client_id FROM "+dbTableName.iklantProspectClient+" pc WHERE client_id IN (" + clientid + ") AND pc.status_id NOT IN (14,15,16,17,18)) AND doc_type_id = " + constantsObj.getPhotoDocId() + " " +
         "ORDER BY doc_type_id DESC LIMIT 1";*/

        var photoPathQuery ="SELECT doc.* FROM ( "+
            "SELECT client_id,Captured_image,client_doc_id FROM "+dbTableName.iklantClientDoc +
            " WHERE client_id IN  "+
            "(SELECT client_id FROM "+dbTableName.iklantProspectClient+" pc "+
            " WHERE client_id IN (" + clientid + ") AND pc.status_id NOT IN (14,15,16,17,18))  "+
            "AND doc_type_id = 5  "+
            "ORDER BY client_id ,client_doc_id DESC)doc GROUP BY client_id ";
        customlog.info(" photoPathQuery : "+photoPathQuery);
        connectionDataSource.getConnection(function (clientConnect) {
            clientConnect.query(photoPathQuery, function selectCb(err, results, fields) {
                if (err) {
                    connectionDataSource.releaseConnectionPool(clientConnect);
                    customlog.error(err);
                }
                else if (results.length > 0) {
                    for (var i in results) {
                        photo_clientId_array[i] = results[i].client_id;
                        captured_image_array[i] = results[i].Captured_image;
                    }
                }
            });

            var otherMfiDetailQuery = "SELECT ipc.client_id,ipc.other_mfi_name,pc.`other_mfi_balance_amount` FROM " +
                dbTableName.iklantProspectClientOtherMfiDetail+" ipc " +
                "LEFT JOIN "+dbTableName.iklantProspectClient+" pc ON pc.client_id = ipc.client_id WHERE " +
                "pc.client_id IN (" + clientid + ") AND pc.status_id NOT IN (14,15,16,17,18) ORDER BY client_id";
            customlog.info("otherMfiDetailQuery : " + otherMfiDetailQuery);
            clientConnect.query(otherMfiDetailQuery, function selectCb(err, results, fields) {
                if (err) {
                    customlog.error("otherMfiDetailQuery: ",otherMfiDetailQuery);
                    connectionDataSource.releaseConnectionPool(clientConnect);
                    customlog.error(err);
                }
                else if (results.length > 0) {
                    for (var i in results) {
                        other_mfi_client_id_array[i] = results[i].client_id;
                        other_mfi_name_array[i] = results[i].other_mfi_name;
                        other_mfi_outstanding_array[i]=results[i].other_mfi_balance_amount;
                    }
                    prospectClientOtherMfiFetchObj.setOtherMfiClientIdArray(other_mfi_client_id_array);
                    prospectClientOtherMfiFetchObj.setOtherMfiNameArrayDto(other_mfi_name_array);
                    prospectClientOtherMfiFetchObj.setOtherMfiOutstandingArrayDto(other_mfi_outstanding_array);
                }
            });

            var familyDetailQuery = "SELECT pcfd.client_id,pcfd.member_name,lv1.lookup_value AS gender " +
                ",IF(lv2.lookup_value = 'Others',pcfd.other_family_relationship_name,lv2.lookup_value) AS relationship,pcfd.member_dob " +
                ",IF(lv3.lookup_value IS NULL,'',lv3.lookup_value) AS education " +
                ",IF(lv4.lookup_value IS NULL,'',lv4.lookup_value) AS occupation " +
                ",pcfd.member_income FROM "+dbTableName.iklantProspectClientFamilyDetail+" pcfd " +
                "INNER JOIN "+dbTableName.iklantLookupValue+" lv1 ON lv1.lookup_id=pcfd.member_gender " +
                "INNER JOIN "+dbTableName.iklantLookupValue+" lv2 ON lv2.lookup_id=pcfd.member_relationship " +
                "INNER JOIN "+dbTableName.iklantLookupValue+" lv3 ON lv3.lookup_id=pcfd.member_education " +
                "INNER JOIN "+dbTableName.iklantLookupValue+" lv4 ON lv4.lookup_id=pcfd.member_occupation " +
                "WHERE client_id IN (SELECT client_id FROM "+dbTableName.iklantProspectClient+" pc WHERE client_id IN (" + clientid + ") AND pc.status_id NOT IN (14,15,16,17,18)) ORDER BY pcfd.client_id";
            customlog.info("familyDetailQuery : " + familyDetailQuery);
            clientConnect.query(familyDetailQuery, function selectCb(err, results, fields) {
                if (err) {
                    connectionDataSource.releaseConnectionPool(clientConnect);
                    customlog.error(err);
                }
                else if (results.length > 0) {
                    for (var i in results) {
                        family_client_id_array[i] = results[i].client_id;
                        family_member_name_array[i] = results[i].member_name;
                        family_member_gender_array[i] = results[i].gender;
                        family_member_relationship_array[i] = results[i].relationship;
                        family_member_dob_array[i] = dateUtils.getAge(results[i].member_dob);
                        family_member_education_array[i] = results[i].education;
                        family_member_occupation_array[i] = results[i].occupation;
                        family_member_income_array[i] = results[i].member_income;
                    }
                    prospectClientFamilyFetchObj.setClient_id(family_client_id_array);
                    prospectClientFamilyFetchObj.setMember_name(family_member_name_array);
                    prospectClientFamilyFetchObj.setMember_gender(family_member_gender_array);
                    prospectClientFamilyFetchObj.setMember_relationship(family_member_relationship_array);
                    prospectClientFamilyFetchObj.setMember_dob(family_member_dob_array);
                    prospectClientFamilyFetchObj.setMember_education(family_member_education_array);
                    prospectClientFamilyFetchObj.setMember_occupation(family_member_occupation_array);
                    prospectClientFamilyFetchObj.setMember_income(family_member_income_array);
                }
            });

            var retrieveClientDetailsforKYCFormQuery = "SELECT pg.group_id,pg.group_name,pg.is_synchronized,o.office_name,pg.center_name,pc.client_id,pc.client_name, " +
                "pc.client_last_name,pcp.date_of_birth,lv.lookup_value AS relationship, " +
                "pcp.guardian_name,pcp.guardian_lastname,pcp.guardian_dob,pcg.guarantor_name, " +
                "IF(pcg.guarantor_lastname IS NULL,'',pcg.guarantor_lastname) AS guarantor_lastname, " +
                "IF(lv1.lookup_value = 'Others',pcg.other_guarantor_relationship_name,lv1.lookup_value) AS guarantor_relationship, " +
                "pcp.ration_card_number,pcp.voter_id,pcp.gas_number,pcp.aadhaar_number, " +
                "IF(pcg.guarantor_id IS NULL,'',pcg.guarantor_id) AS guarantor_id, " +
                "pcg.guarantor_dob,pcp.mobile_number,pcp.landline_number, " +
                "lv2.lookup_value AS religion,lv3.lookup_value AS caste, " +
                "lv6.lookup_value AS marital_status,lv4.lookup_value AS educational_details, " +
                "CONCAT(lv5.lookup_value,'-',IFNULL(lv11.lookup_value,''))AS loan_purpose,pcp.address,pcp.pincode, " +
                "pc.family_monthly_income,pc.family_monthly_expense, " +
                "lv7.lookup_value AS house_type,pch.house_sqft, " +
                "lv8.lookup_value AS house_ceiling_type,lv9.lookup_value AS house_flooring_detail, " +
                "lv10.lookup_value AS house_toilet,pch.vehicle_details, " +
                "CASE " +
                "WHEN pcbd.is_bank_account=" + activeIndicatorTrue + " THEN 'Yes' " +
                "ELSE 'No' " +
                "END AS is_bank_account, " +
                "CASE " +
                "WHEN pcbd.is_savings=" + activeIndicatorTrue + " THEN 'Yes' " +
                "ELSE 'No' " +
                "END AS is_savings " +
                ",(SELECT display_name FROM `personnel` WHERE `personnel_id` = pg.`created_by`) AS fo_name, DATE_FORMAT((SELECT created_date FROM `iklant_grt_group_remarks` WHERE group_id = pg.group_id ORDER BY id DESC LIMIT 1),'%Y-%m-%d') AS grt_date FROM "+dbTableName.iklantProspectClient+" pc " +
                "INNER JOIN  "+dbTableName.iklantProspectClientGuarantor+" pcg ON pcg.client_id = pc.client_id " +
                "INNER JOIN  "+dbTableName.iklantProspectClientHouseDetail+"  pch ON pch.client_id = pc.client_id " +
                "INNER JOIN  "+dbTableName.iklantProspectClientOtherDetail+"  pcod ON pcod.client_id = pc.client_id " +
                "INNER JOIN  "+dbTableName.iklantProspectClientPersonal+"  pcp ON pcp.client_id = pc.client_id " +
                "LEFT JOIN "+dbTableName.iklantLookupValue+" lv ON lv.lookup_id = pcp.guardian_relationship " +
                "LEFT JOIN "+dbTableName.iklantLookupValue+" lv1 ON lv1.lookup_id = pcg.guarantor_relationship " +
                "LEFT JOIN "+dbTableName.iklantLookupValue+" lv2 ON lv2.lookup_id = pcp.religion " +
                "LEFT JOIN "+dbTableName.iklantLookupValue+" lv3 ON lv3.lookup_id = pcp.caste " +
                "LEFT JOIN "+dbTableName.iklantLookupValue+" lv4 ON lv4.lookup_id = pcp.educational_details " +
                "LEFT JOIN "+dbTableName.iklantLookupValue+" lv5 ON lv5.lookup_id = pcp.loan_purpose " +
                "LEFT JOIN "+dbTableName.iklantLookupValue+" lv6 ON lv6.lookup_id = pcp.marital_status " +
                "LEFT JOIN "+dbTableName.iklantLookupValue+" lv7 ON lv7.lookup_id = pch.house_type " +
                "LEFT JOIN "+dbTableName.iklantLookupValue+" lv8 ON lv8.lookup_id = pch.house_ceiling_type " +
                "LEFT JOIN "+dbTableName.iklantLookupValue+" lv9 ON lv9.lookup_id = pch.house_flooring_detail " +
                "LEFT JOIN "+dbTableName.iklantLookupValue+" lv10 ON lv10.lookup_id = pch.house_toilet " +
                "LEFT JOIN "+dbTableName.iklantLookupValue+" lv11 ON lv11.lookup_id = pcp.business_category " +
                "INNER JOIN  "+dbTableName.iklantprospectClientBankDetail+"  pcbd ON pcbd.client_id = pc.client_id " +
                "INNER JOIN  "+dbTableName.iklantProspectGroup+"  pg ON pg.group_id = pc.group_id " +
                "INNER JOIN  "+dbTableName.iklantOffice+"  o ON o.office_id = pg.office_id " +
                "WHERE pc.status_id = " + constantsObj.getAuthorizedStatus() + " " +
                "AND pc.status_id NOT IN (14,15,16,17,18) AND pc.client_id IN (" + clientid + ") " +
                "GROUP BY pc.client_id ORDER BY pc.client_id";
            customlog.info("retrieveClientDetailsforKYCFormQuery : " + retrieveClientDetailsforKYCFormQuery);
            clientConnect.query(retrieveClientDetailsforKYCFormQuery, function selectCb(err, results, fields) {
                if (err) {
                    connectionDataSource.releaseConnectionPool(clientConnect);
                    customlog.error(err);
                }
                else if (results.length > 0) {
                    for (var i in results) {
                        groupId = results[0].group_id;
                        groupName = results[0].group_name;
                        isSynchronized = results[0].is_synchronized;
                        client_name[i] = results[i].client_name;

                        clientIdArray[i] = results[i].client_id;
                        branchNameArray[i] = results[i].office_name;
                        centerNameArray[i] = results[i].center_name;
                        clientNameArray[i] = results[i].client_name + " " + results[i].client_last_name;
                        dateOfBirthArray[i] = dateUtils.formatDateForUI(results[i].date_of_birth);
                        guardianRelationshipArray[i] = results[i].relationship;
                        guardianNameArray[i] = results[i].guardian_name + " " + results[i].guardian_lastname;
                        guardianAgeArray[i] = dateUtils.getAge(results[i].guardian_dob);
                        guarantorNameArray[i] = results[i].guarantor_name + " " + results[i].guarantor_lastname;
                        guarantorAgeArray[i] = dateUtils.getAge(results[i].guarantor_dob);
                        guarantorRelationshipArray[i] = results[i].guarantor_relationship;
                        rationCardNoArray[i] = results[i].ration_card_number;
                        voterIdArray[i] = results[i].voter_id;
                        gasNoArray[i] = results[i].gas_number;
                        aadharNoArray[i] = results[i].aadhaar_number;
                        guarantorIdArray[i] = results[i].guarantor_id;
                        if(results[i].mobile_number != "" && results[i].mobile_number != null && (/^0+$/.test(results[i].mobile_number)) && (results[i].landline_number != null && results[i].landline_number != "")){
                            phoneNoArray[i] = results[i].landline_number;
                        }else{
                            phoneNoArray[i] = results[i].mobile_number;
                        }
                        religionArray[i] = results[i].religion;
                        casteArray[i] = results[i].caste;
                        maritalStatusArray[i] = results[i].marital_status;
                        educationArray[i] = results[i].educational_details;
                        loanPurposeArray[i] = results[i].loan_purpose;
                        addressArray[i] = results[i].address;
                        pinCodeArray[i] = results[i].pincode;
                        familyMonthlyIncomeArray[i] = results[i].family_monthly_income;
                        familyMonthlyExpenseArray[i] = results[i].family_monthly_expense;
                        houseArray[i] = results[i].house_type;
                        houseSizeArray[i] = results[i].house_sqft;
                        houseRoofArray[i] = results[i].house_ceiling_type;
                        houseFloorArray[i] = results[i].house_flooring_detail;
                        toiletArray[i] = results[i].house_toilet;
                        vehicleArray[i] = commonUtils.trimSpaces(results[i].vehicle_details);
                        bankAccountArray[i] = results[i].is_bank_account;
                        savingsArray[i] = results[i].is_savings;
                        foName[i] = results[i].fo_name;
                        grtDate[i] = results[i].grt_date;
                    }
                    kycformObj.setClientId(clientIdArray);
                    kycformObj.setBranchName(branchNameArray);
                    kycformObj.setCenterName(centerNameArray);
                    kycformObj.setClientName(clientNameArray);
                    kycformObj.setDateOfBirth(dateOfBirthArray);
                    kycformObj.setGuardianRelationship(guardianRelationshipArray);
                    kycformObj.setGuardianName(guardianNameArray);
                    kycformObj.setGuardianAge(guardianAgeArray);
                    kycformObj.setGuarantorName(guarantorNameArray);
                    kycformObj.setGuarantorAge(guarantorAgeArray);
                    kycformObj.setGuarantorRelationship(guarantorRelationshipArray);
                    kycformObj.setRationCardNo(rationCardNoArray);
                    kycformObj.setVoterId(voterIdArray);
                    kycformObj.setGasNo(gasNoArray);
                    kycformObj.setAadharNo(aadharNoArray);
                    kycformObj.setGuarantorId(guarantorIdArray);
                    kycformObj.setPhoneNo(phoneNoArray);
                    kycformObj.setReligion(religionArray);
                    kycformObj.setCaste(casteArray);
                    kycformObj.setMaritalStatus(maritalStatusArray);
                    kycformObj.setEducation(educationArray);
                    kycformObj.setLoanPurpose(loanPurposeArray);
                    kycformObj.setAddress(addressArray);
                    kycformObj.setPinCode(pinCodeArray);
                    kycformObj.setFamilyMonthlyIncome(familyMonthlyIncomeArray);
                    kycformObj.setFamilyMonthlyExpense(familyMonthlyExpenseArray);
                    kycformObj.setHouse(houseArray);
                    kycformObj.setHouseSize(houseSizeArray);
                    kycformObj.setHouseRoof(houseRoofArray);
                    kycformObj.setHouseFloor(houseFloorArray);
                    kycformObj.setToilet(toiletArray);
                    kycformObj.setVehicle(vehicleArray);
                    kycformObj.setBankAccount(bankAccountArray);
                    kycformObj.setSavings(savingsArray);
                    kycformObj.setFoName(foName);
                    kycformObj.setGrtDate(grtDate);

                    // Added by Chitra [Documents shouldn't generated for rejected clients]
                    var disbQuery = "SELECT round((ls.principal+ls.interest)) as emi_amount, IFNULL(disbursement_date,'1900-01-01') AS disbursement_date,a.global_account_num,round(la.loan_amount) as loan_amount,la.interest_rate,rt.recurrence_name FROM `loan_account` la " +
                        " INNER JOIN account a ON la.account_id = a.account_id" +
                        " INNER JOIN loan_schedule ls on ls.account_id = la.account_id" +
                        " INNER JOIN recurrence_detail rd ON rd.meeting_id = la.meeting_id " +
                        " INNER JOIN recurrence_type rt ON rt.recurrence_id = rd.recurrence_id WHERE  a.customer_id = " + mifosCustomerId + " AND account_type_id = 1 AND a.account_state_id IN (5,9) AND ls.installment_id =2 order by a.account_id desc";
                    customlog.info ("disbQuery "+disbQuery);
                    clientConnect.query(disbQuery,
                        function selectCb(err, results, fields) {
                            if (err) {
                                connectionDataSource.releaseConnectionPool(clientConnect);
                                customlog.error(err);
                            } else {
                                connectionDataSource.releaseConnectionPool(clientConnect);
                                if(results.length == 0){
                                    var disbDate ='1990-01-01';
                                }else{
                                    var disbDate = results[0].disbursement_date;
                                    kycformObj.setLoanAmount(results[0].loan_amount);
                                    kycformObj.setEMIAmount(results[0].emi_amount);
                                }
                                if(formType == 1){
                                    eval("generateKYCFormIn"+docLanguage+"(groupName, kycformObj, prospectClientFamilyFetchObj, photo_clientId_array, captured_image_array, prospectClientOtherMfiFetchObj, disbDate, bcOfficeId)");
                                }
                                if(formType == 8){
                                    eval("generateMASLoanCardForm(groupName, kycformObj, prospectClientFamilyFetchObj, photo_clientId_array, captured_image_array, prospectClientOtherMfiFetchObj, disbDate)");
                                }
                                if(formType == 10){
                                    eval("MASCreditAppraisalFormPDF(groupName, kycformObj, prospectClientFamilyFetchObj, photo_clientId_array, captured_image_array, prospectClientOtherMfiFetchObj, disbDate)");
                                }
                            }
                        });

                }
                //connectionDataSource.releaseConnectionPool(clientConnect);
                callback(clientIdArray, groupId, groupName, isSynchronized);
            });
        });
    },
    // Added by Chitra [Documents shouldn't generated for rejected clients]
    generateLegalFormForGroupDataModel: function (mifosGlobalAccountNo, callback) {
        var self = this;
        var constantsObj = this.constants;
        var legalFormQuery = "SELECT c.display_name AS clientName,cnd.display_name AS relationshipName," +
            "(DATE_FORMAT(NOW() + INTERVAL 5 HOUR + INTERVAL 30 MINUTE, '%Y') - DATE_FORMAT((c.date_of_birth), '%Y') - (DATE_FORMAT(NOW() + INTERVAL 5 HOUR + INTERVAL 30 MINUTE, '00-%m-%d') < (DATE_FORMAT((c.date_of_birth),'00-%m-%d')))) AS clientAge," +
            "CONCAT(cad.line_1, IF(cad.line_2 IS NULL OR cad.line_2='', '', CONCAT(', ',cad.line_2)), " +
            "IF(cad.line_3 IS NULL OR cad.line_3='', '', CONCAT(', ',cad.line_3)), " +
            "IF(cad.city IS NULL OR cad.city='', '', CONCAT(', ',cad.city))) AS clientAddress,o.display_name As officeName " +
            "FROM account a " +
            "INNER JOIN loan_account la ON la.account_id = a.account_id " +
            "INNER JOIN customer c ON c.customer_id = a.customer_id " +
            "INNER JOIN customer_address_detail cad ON cad.customer_id = c.customer_id " +
            "INNER JOIN office o ON o.office_id = c.branch_id " +
            "LEFT JOIN customer_name_detail cnd ON cnd.customer_id = c.customer_id " +
            "WHERE cnd.name_type != 3 and la.parent_account_id IN (SELECT account_id FROM account WHERE global_account_num in (" + mifosGlobalAccountNo + ")) GROUP BY c.customer_id";
        customlog.info("Query " + legalFormQuery);
        connectionDataSource.getConnection(function (clientConnect) {
            clientConnect.query(legalFormQuery, function (error, legalFormResult) {
                if (error) {
                    customlog.error(error);
                    connectionDataSource.releaseConnectionPool(clientConnect);
                    callback(legalFormResult);
                }
                else {
                    var leaderSubLeaderQuery = "SELECT CONCAT(client_name,' ',client_last_name) AS subLeader,"+
                        " (SELECT CONCAT(client_name,'',client_last_name) FROM "+dbTableName.iklantProspectClient+" WHERE `sub_leader_global_number` = `leader_global_number`) AS leader"+
                        " FROM "+dbTableName.iklantProspectClient+" pc," + dbTableName.iklantProspectGroup + " pg WHERE "+
                        " pc.group_id = pg.group_id AND pc.`status_id` NOT IN ("+constantsObj.getRejectedPriliminaryVerification()+","+constantsObj.getRejectedAppraisal()+","+constantsObj.getRejectedFieldVerification()+","+constantsObj.getRejectedLoanSanction()+","+constantsObj.getRejectedCreditBureauAnalysisStatusId()+","+
                        constantsObj.getRejectedInNextLoanPreCheck()+","+constantsObj.getRejectedWhileIdleGroupsStatusId()+") AND `sub_leader_global_number` IS NOT NULL"+
                        " AND pg.group_id = (SELECT group_id FROM account," + dbTableName.iklantMifosMapping + " WHERE global_account_num = " + mifosGlobalAccountNo + " "+
                        " AND `mifos_customer_id` = customer_id GROUP BY group_id)";
                    console.log("print"+leaderSubLeaderQuery);
                    clientConnect.query(leaderSubLeaderQuery, function (error, leaderResult) {
                        if (error) {
                            customlog.error(error);
                            connectionDataSource.releaseConnectionPool(clientConnect);
                            callback(legalFormResult,leaderResult);
                        }
                        else {
                            connectionDataSource.releaseConnectionPool(clientConnect);
                            callback(legalFormResult,leaderResult);
                        }
                    });
                }
            });
        });
    },
    // Added by Sathish Kumar M
    generateMASLegalFormForGroupDataModel: function (mifosGlobalAccountNo, callback) {
        var self = this;
        var constantsObj = this.constants;
        var legalFormQuery = "SELECT c.display_name AS clientName,cnd.display_name AS relationshipName," +
            "(DATE_FORMAT(NOW() + INTERVAL 5 HOUR + INTERVAL 30 MINUTE, '%Y') - DATE_FORMAT((c.date_of_birth), '%Y') - (DATE_FORMAT(NOW() + INTERVAL 5 HOUR + INTERVAL 30 MINUTE, '00-%m-%d') < (DATE_FORMAT((c.date_of_birth),'00-%m-%d')))) AS clientAge," +
            "CONCAT(cad.line_1, IF(cad.line_2 IS NULL OR cad.line_2='', '', CONCAT(', ',cad.line_2)), " +
            "IF(cad.line_3 IS NULL OR cad.line_3='', '', CONCAT(', ',cad.line_3)), " +
            "IF(cad.city IS NULL OR cad.city='', '', CONCAT(', ',cad.city))) AS clientAddress,o.display_name As officeName,round(la.loan_amount) AS loanAmount,SUBSTRING(SUBSTRING_INDEX(lv.lookup_name,'.',2),14) AS loan_purpose,ROUND(la.`interest_rate`,2) AS interestRate,la.`no_of_installments` AS tenure " +
            ",(SELECT SUM(principal+interest) FROM `loan_schedule` WHERE account_id = la.account_id AND `installment_id` =2)AS installmentAmount,(SELECT DATE_FORMAT(action_date,'%d-%m-%Y') FROM `loan_schedule` WHERE account_id = la.account_id AND `installment_id` =1)AS fiDate,IFNULL((SELECT premium_per_thousands FROM iklant_ta_premium_details WHERE age= (DATE_FORMAT(NOW() + INTERVAL 5 HOUR + INTERVAL 30 MINUTE, '%Y') - DATE_FORMAT((c.date_of_birth), '%Y') - (DATE_FORMAT(NOW() + INTERVAL 5 HOUR + INTERVAL 30 MINUTE, '00-%m-%d') < (DATE_FORMAT((c.date_of_birth),'00-%m-%d')))) ),22.72) AS premiumAmount," +
            "IFNULL((SELECT `lookup_value` FROM iklant_lookup_value WHERE `lookup_id` = (SELECT `business_category` FROM `iklant_prospect_client_personal` WHERE client_id = (SELECT client_id FROM `iklant_mifos_mapping` WHERE `mifos_client_customer_id` = c.customer_id LIMIT 1) LIMIT 1)),'') AS sub_category  FROM account a " +
            "INNER JOIN loan_account la ON la.account_id = a.account_id " +
            "INNER JOIN customer c ON c.customer_id = a.customer_id " +
            "INNER JOIN customer_address_detail cad ON cad.customer_id = c.customer_id " +
            "INNER JOIN office o ON o.office_id = c.branch_id " +
            "LEFT JOIN customer_name_detail cnd ON cnd.customer_id = c.customer_id " +
            " LEFT JOIN lookup_value lv ON la.business_activities_id = lv.lookup_id "+
            "WHERE cnd.name_type != 3 and la.parent_account_id IN (SELECT account_id FROM account WHERE global_account_num in (" + mifosGlobalAccountNo + ")) GROUP BY c.customer_id";
        customlog.info("Query " + legalFormQuery);
        connectionDataSource.getConnection(function (clientConnect) {
            clientConnect.query(legalFormQuery, function (error, legalFormResult) {
                if (error) {
                    customlog.error(error);
                    connectionDataSource.releaseConnectionPool(clientConnect);
                    callback(legalFormResult);
                }
                else {
                    connectionDataSource.releaseConnectionPool(clientConnect);
                    callback(legalFormResult);
                }
            });
        });
    },
    groupAndClientsLoanScheduleDataModel: function (mifosCustomerId, globalAccountNum,clientid, callBack) {
        var self = this;
            var loanScheduleQuery = "CALL  sp_installment_schedule('" + globalAccountNum + "')";
            var report_name = mifosCustomerId + "_installmentSchedule.xlsx";
            var excel = require('msexcel-builder');
            var workbook = excel.createWorkbook(rootPath+'/public/GeneratedPDF', report_name);
            var guarantorName = new Array();
            var guarantorAge = new Array();
            var guarantorAgeFinal = new Array();
            var guarantorAgeSecondFinal = new Array();
            var loan_amount_second = new Array();
            var constantsObj = this.constants;
            customlog.info('Query: ' + loanScheduleQuery);
            connectionDataSource.getConnection(function (clientConnect) {
                clientConnect.query(loanScheduleQuery, function (error, loanScheduleResult) {
                    //connectionDataSource.releaseConnectionPool(clientConnect);
                    if (error) {
                        connectionDataSource.releaseConnectionPool(clientConnect);
                        callBack(loanScheduleResult);
                        customlog.error(error);
                    }
                    else {
                        var guarantorQuery = "SELECT guarantor_name,guarantor_dob FROM iklant_prospect_client_guarantor ipcg"+
                            " LEFT JOIN iklant_prospect_client ipc ON ipc.client_id =ipcg.client_id "+
                            " LEFT JOIN iklant_prospect_group ipg ON ipg.group_id = ipc.group_id"+
                            " where ipc.client_id IN (" + clientid + ") AND ipc.status_id = " + constantsObj.getAuthorizedStatus() + " GROUP BY ipc.client_id ORDER BY ipc.client_id; ";
                        customlog.info("guarantorQuery:"+guarantorQuery);
                        clientConnect.query(guarantorQuery, function selectCb(err, result, fields) {
                            if (err) {
                                connectionDataSource.releaseConnectionPool(clientConnect);
                                customlog.error(err);
                            }
                            else if (result.length > 0) {
                                for (var i in result) {
                                    guarantorName[i] = result[i].guarantor_name;
                                    guarantorAge[i] = dateUtils.getAge(result[i].guarantor_dob);
                                }
                            }
                        });
                        var amountQuery ="SELECT c.display_name,c.date_of_birth,la.loan_amount,c.customer_id,la.disbursement_date FROM customer c "+
                                         "LEFT JOIN account a ON a.customer_id = c.customer_id "+
                                         "LEFT JOIN loan_account la ON la.account_id = a.account_id "+
                                         "WHERE c.parent_customer_id = " + mifosCustomerId + " AND la.parent_account_id = (SELECT account_id FROM account WHERE  global_account_num = '"+ globalAccountNum +"' ORDER BY account_id) ORDER BY c.customer_id";
                        console.log("amountQuery "+amountQuery);
                        clientConnect.query(amountQuery,function(err,results){
                            var clt_name = new Array();
                            var clt_Age= new Array();
                            var clt_Age_second= new Array();
                            var loan_amount = new Array();
                            for (var i in results) {
                                clt_name[i] = (results[i].display_name);
                                clt_Age[i] = dateUtils.getAge(results[i].date_of_birth);
                                clt_Age_second[i] = parseInt(dateUtils.getAge(results[i].date_of_birth)+1);
                                loan_amount[i] = results[i].loan_amount;
                                if(results[i].loan_amount==20000){
                                    loan_amount_second[i]= 13000;
                                } else if(results[i].loan_amount==25000){
                                    loan_amount_second[i] =17000;
                                }else if(results[i].loan_amount==30000){
                                    loan_amount_second[i]= 20000;
                                }else{
                                    loan_amount_second[i]=0;
                                }
                            }
                            for(j in guarantorAge){
                                if(guarantorAge[j]=="" || guarantorAge[j] == 0){
                                    guarantorAgeFinal[j]=clt_Age[j];
                                    guarantorAgeSecondFinal[j]=parseInt(clt_Age[j]+1);
                                }else{
                                    guarantorAgeFinal[j]= guarantorAge[j];
                                    guarantorAgeSecondFinal[j]=parseInt(guarantorAge[j]+1);
                                }
                            }
                            self.premiumAmountCalculate(clientConnect,results,clt_Age,loan_amount,results[0].disbursement_date,function (clientConnect,premiumAmount,premiumClientAmount,premiumClientServiceAmount,documentClientAmount,documentClientServiceAmount){
                            //self.premiumAmountCalculate(clientConnect,results,clt_Age,loan_amount,results[0].disbursement_date,function (clientConnect,premiumAmount,premiumClientAmount,premiumClientServiceAmount,documentClientAmount,documentClientServiceAmount,sumAssured){
                                self.premiumAmountCalculate(clientConnect,results,guarantorAgeFinal,loan_amount,results[0].disbursement_date,function (clientConnect,premiumAmountGuarantor,premiumClientAmountGuarantor,premiumClientServiceAmountGuarantor,documentClientAmountGuarantor,documentClientServiceAmountGuarantor){
                                    self.premiumAmountCalculate(clientConnect,results,clt_Age_second,loan_amount_second,results[0].disbursement_date,function (clientConnect,premiumAmountSecond,premiumClientAmountSecond,premiumClientServiceAmountSecond,documentClientAmountSecond,documentClientServiceAmountSecond){
                                        self.premiumAmountCalculate(clientConnect,results,guarantorAgeSecondFinal,loan_amount_second,results[0].disbursement_date,function (clientConnect,premiumAmountGuarantorSecond,premiumClientAmountGuarantorSecond,premiumClientServiceAmountGuarantorSecond,documentClientAmountGuarantorSecond,documentClientServiceAmountGuarantorSecond){
                                            connectionDataSource.releaseConnectionPool(clientConnect);
                                            callBack(loanScheduleResult[0],premiumClientAmount,premiumClientServiceAmount,documentClientAmount,documentClientServiceAmount,
                                                premiumClientAmountGuarantor,premiumClientServiceAmountGuarantor,
                                                premiumClientAmountSecond,premiumClientServiceAmountSecond,documentClientAmountSecond,documentClientServiceAmountSecond,
                                                premiumClientAmountGuarantorSecond,premiumClientServiceAmountGuarantorSecond,
                                                clt_name,clt_Age);
                                        });
                                    });
                                });
                            });
                        });
                    }
                });
            });

    },

    //Added by Sathish Kumar M 008 For LIC Premium calculate
    premiumAmountCalculate : function (clientConnect,results,clt_Age,loan_amount,disbDate,callback){
        var premiumAmount = new Array();
        var premiumClientAmount = new Array();
        var premiumClientServiceAmount = new Array();
        var documentClientAmount = new Array();
        var documentClientServiceAmount = new Array();
        var sumAssured = new Array();

        var serviceTaxAmount;
        var dbTableName;
        var q = new Date(disbDate);
        var m = q.getMonth();
        var d = q.getDate();
        var y = q.getFullYear();

        var date = new Date(y,m,d);

        var mydate=new Date('2015-06-01');
        var myloandate=new Date('2015-08-31');
        if(date>=mydate){
            serviceTaxAmount=14;
        }else if (date<mydate){
            serviceTaxAmount=12.36;
        }else{
            serviceTaxAmount=14;
        }
        if(date>myloandate | date==myloandate){
            dbTableName="iklant_ta_bajaj_premium_details";
        }else if (date<myloandate){
            dbTableName="iklant_ta_premium_details";
        }else{
            dbTableName="iklant_ta_bajaj_premium_details";
        }
        //connectionDataSource.getConnection(function (clientConnect) {
        for (var i in results) {
            var premiumAmountQuery = "SELECT premium_per_thousands FROM "+dbTableName+" WHERE age=" + clt_Age[i] + ";"
            customlog.info("premiumAmountQuery :" + premiumAmountQuery);
            clientConnect.query(premiumAmountQuery, function selectCb(err, reslt, fields) {
                if (!err) {
                    if(reslt.length == 0){
                        if(clt_Age[i] < 10){
                            var premiumAmountMinQuery = "SELECT MIN(premium_per_thousands) AS  premium_per_thousands FROM "+dbTableName+" "
                            clientConnect.query(premiumAmountMinQuery, function selectCb(err, result, fields) {
                                premiumAmount.push(result[0].premium_per_thousands);
                            });
                        }else{
                            var premiumAmountMaxQuery = "SELECT MAX(premium_per_thousands) AS  premium_per_thousands FROM "+dbTableName+" "
                            clientConnect.query(premiumAmountMaxQuery, function selectCb(err, result, fields) {
                                premiumAmount.push(result[0].premium_per_thousands);
                            });
                        }
                    }else{
                        premiumAmount.push(reslt[0].premium_per_thousands);
                    }
                    if(results.length == premiumAmount.length){
                        //connectionDataSource.releaseConnectionPool(clientConnect);
                        for (i in results){
                            var num = ((parseFloat(premiumAmount[i])*parseInt(loan_amount[i]/1000))).toFixed();
                            var service = (parseInt(num)*serviceTaxAmount/100).toFixed();
                            var doc = (parseInt(loan_amount[i])*1/100).toFixed();
                            var docService = (parseInt(doc)*serviceTaxAmount/100).toFixed();
                            var sum = (parseInt(doc)+parseInt(docService)+parseInt(num)+parseInt(service)).toFixed();
                            premiumClientAmount.push(num);
                            premiumClientServiceAmount.push(service);
                            documentClientAmount.push(doc);
                            documentClientServiceAmount.push(docService);
                            //sumAssured.push(sum);
                            if(premiumAmount.length == premiumClientAmount.length){
                                callback(clientConnect,premiumAmount,premiumClientAmount,premiumClientServiceAmount,documentClientAmount,documentClientServiceAmount);
                            }
                        }
                    }
                }else{
                    //connectionDataSource.releaseConnectionPool(clientConnect);
                    customlog.error(err);
                    callback(clientConnect,premiumAmount,premiumClientAmount);
                }
            });
        }
        //});
    },
    //Ended by Sathish Kumar M 008


    insertFieldVerificationDetails: function (fieldVerificationValue, prospectClientHouseDetailToUpdate, callback) {
        var client = this.client;
        var clientPersonalObj = require(commonDTO +"/prospectClientPersonal");
        var clientGuarantorObj = require(commonDTO +"/prospectClientGuarantor");
        var clientHouseDetailObj = require(commonDTO +"/prospectClientHouseDetail");
        var clientBankDetailObj = require(commonDTO +"/prospectClientBankDetail");
        var prospectClientPersonalObj = new clientPersonalObj();
        var prospectClientGuarantorObj = new clientGuarantorObj();
        var prospectClientHouseDetailObj = new clientHouseDetailObj();
        var prospectClientBankDetailObj = new clientBankDetailObj();
        var self = this;
        var constantsObj = this.constants;
        var clientId = fieldVerificationValue.getClient_id();
        var clientAddressMatched = fieldVerificationValue.getClient_address_matched();
        var clientaddressproof = fieldVerificationValue.getClientAddressProofId();
        var clientproof = fieldVerificationValue.getClientProofId();
        var rationCardMatched = fieldVerificationValue.getRc_number_matched();
        var phoneNumberMatched = fieldVerificationValue.getPhone_number_matched();
        var idProofMatched = fieldVerificationValue.getId_proof_matched();
        var guarantorAddressMatched = fieldVerificationValue.getGuarantor_address_matched();
        var guarantorRelationshipMatched = fieldVerificationValue.getGuarantor_relationship_matched();
        var guarantoraddressproof = fieldVerificationValue.getGuarantorAddressProofId();
        var guarantorIdProof = fieldVerificationValue.getGuarantorProofId();
        var guarantorIdProofcheck = fieldVerificationValue.getIs_GuarantorIdProof_Matched();
        var houseDetailsMatched = fieldVerificationValue.getHouse_details_matched();
        var bankDetailsMatched = fieldVerificationValue.getBank_details_matched();
        var insuranceDetailsMatched = fieldVerificationValue.getInsurance_details_matched();
        var isclientaddressproofprovided = fieldVerificationValue.getIs_ClientAddressProofId_provided();
        var isclientproofprovided = fieldVerificationValue.getIs_ClientProofId_provided();
        var isguarantoraddressproofprovided = fieldVerificationValue.getIs_GuarantorAddressProofId_provided();
        var isguarantorproofprovided = fieldVerificationValue.getIs_GuarantorProofId_provided();
        //Dhinakaran
        var isotherid1provided =  fieldVerificationValue.getIs_OtherId1_provided();
        var isotherid2provided =  fieldVerificationValue.getIs_OtherId2_provided();
        var remarks = fieldVerificationValue.getRemarks();
        var statusId;

        connectionDataSource.getConnection(function (clientConnect) {
            if (clientAddressMatched & rationCardMatched & phoneNumberMatched & idProofMatched & guarantorAddressMatched & guarantorRelationshipMatched & guarantorIdProofcheck) {
                statusId = constantsObj.getFieldVerified();
            }
            else {
                statusId = constantsObj.getRejectedFieldVerification();
            }
            var houseDetailsUpdate = "update "+dbTableName.iklantProspectClientHouseDetail+" set house_type = '" + prospectClientHouseDetailToUpdate.getHouse_type() + "', " +
                "time_period = '" + prospectClientHouseDetailToUpdate.getTime_period() + "' ,house_sqft = '" + prospectClientHouseDetailToUpdate.getHouse_sqft() + "' , " +
                "vehicle_details = '" + prospectClientHouseDetailToUpdate.getVehicle_details() + "' , house_ceiling_type = '" + prospectClientHouseDetailToUpdate.getHouse_ceiling_type() + "' , " +
                "house_wall_type = '" + prospectClientHouseDetailToUpdate.getHouse_wall_type() + "' ,house_flooring_detail = '" + prospectClientHouseDetailToUpdate.getHouse_flooring_detail() + "' , " +
                "house_room_detail = '" + prospectClientHouseDetailToUpdate.getHouse_room_detail() + "' ,house_toilet = '" + prospectClientHouseDetailToUpdate.getHouse_toilet() + "' " +
                "where client_id =" + clientId;
            client.query(houseDetailsUpdate,
                function updateDetail(err) {
                    if (err) {
                        customlog.error(err);
                        connectionDataSource.releaseConnectionPool(clientConnect);
                    }
                }
            );

            var clientFieldVerifiedCheckQuery = "SELECT client_id FROM "+dbTableName.iklantFieldVerification+" WHERE client_id=" + clientId + "";
            var insertedClientId = "";
            customlog.info("clientFieldVerifiedCheckQuery : " + clientFieldVerifiedCheckQuery);
            client.query(clientFieldVerifiedCheckQuery,
                function selectCb(err, results, fields) {
                    if (err) {
                        connectionDataSource.releaseConnectionPool(clientConnect);
                        customlog.error(err);
                    } else {
                        for (var i in results) {
                            var fieldName = results[i];
                            insertedClientId = fieldName.client_id;
                        }
                    }
                    customlog.info("insertedClientId : " + insertedClientId);
                    if (typeof(insertedClientId) == "undefined" | insertedClientId == '' | insertedClientId == 'NULL') {
                        customlog.info("inside insert");
                        //clientId is not duplicate,hence insert performed
                        var insertFieldVerificationDetailsQuery = "INSERT INTO "+dbTableName.iklantFieldVerification+" (client_id,client_address_proof,client_address_matched,rc_number_matched,phone_number_matched, " +
                            "client_id_proof,client_id_proof_matched,guarantor_address_proof,guarantor_address_matched,guarantor_id_proof, " +
                            "guarantor_id_proof_matched,guarantor_relationship_matched,bank_details_matched,insurance_details_matched, " +
                            "is_client_add_provided,is_client_id_provided,is_guarantor_add_provided,is_guarantor_id_provided,remarks,created_date,is_other_id1_provided,is_other_id2_provided) " +
                            "VALUES(" + clientId + ",'" + clientaddressproof + "'," + clientAddressMatched + "," + rationCardMatched + "," + phoneNumberMatched + ", " +
                            " '" + clientproof + "'," + idProofMatched + ",'" + guarantoraddressproof + "'," + guarantorAddressMatched + ",'" + guarantorIdProof + "', " +
                            " " + guarantorIdProofcheck + "," + guarantorRelationshipMatched + "," + bankDetailsMatched + "," + insuranceDetailsMatched + ", " +
                            " " + isclientaddressproofprovided + "," + isclientproofprovided + "," + isguarantoraddressproofprovided + "," + isguarantorproofprovided + ",'" + remarks + "',NOW() + INTERVAL 5 HOUR + INTERVAL 30 MINUTE ," + isotherid1provided + ", "+isotherid2provided+")";
                        customlog.info("insertFieldVerificationDetailsQuery : " + insertFieldVerificationDetailsQuery);
                        client.query(insertFieldVerificationDetailsQuery);
                    } else {
                        customlog.info("inside update");
                        //clientId is duplicate,hence update performed
                        var updateFieldVerificationDetailsQuery = "UPDATE "+dbTableName.iklantFieldVerification+" SET client_id=" + clientId + ",client_address_proof='" + clientaddressproof + "'," +
                            "client_address_matched=" + clientAddressMatched + ",rc_number_matched=" + rationCardMatched + "," +
                            "phone_number_matched=" + phoneNumberMatched + ",client_id_proof='" + clientproof + "'," +
                            "client_id_proof_matched=" + idProofMatched + ",guarantor_address_proof='" + guarantoraddressproof + "'," +
                            "guarantor_address_matched=" + guarantorAddressMatched + ",guarantor_id_proof='" + guarantorIdProof + "'," +
                            "guarantor_id_proof_matched=" + guarantorIdProofcheck + ",guarantor_relationship_matched=" + guarantorRelationshipMatched + "," +
                            "bank_details_matched=" + bankDetailsMatched + ",insurance_details_matched=" + insuranceDetailsMatched + "," +
                            "is_client_add_provided=" + isclientaddressproofprovided + ",is_client_id_provided=" + isclientproofprovided + "," +
                            "is_guarantor_add_provided=" + isguarantoraddressproofprovided + ",is_guarantor_id_provided=" + isguarantorproofprovided + "," +
                            "is_other_id1_provided=" + isotherid1provided + "," + "is_other_id2_provided=" + isotherid2provided + "," +
                            "remarks='" + remarks + "',created_date=NOW() + INTERVAL 5 HOUR + INTERVAL 30 MINUTE WHERE client_id =" + clientId + "";
                        client.query(updateFieldVerificationDetailsQuery);
                    }
                });


            var updateStatusIdQueryForClient = "UPDATE "+dbTableName.iklantProspectClient+" SET status_id =" + statusId + ",updated_date=NOW() + INTERVAL 5 HOUR + INTERVAL 30 MINUTE WHERE client_id =" + clientId + " ";
            client.query(updateStatusIdQueryForClient,function postCreate(err) {
                if (!err) {
                    var tenantId = 1;
                    var initialTotalWeightageRequired = 225;
                    var clientAppraisalArray = new Array();
                    var clientTotalWeightageArray = new Array();
                    var answerIdArray = new Array();
                    var returnedArray = new Array();
                    self.calculateCCAForClientsWhileFieldVerification(tenantId, clientId, client,fieldVerificationValue.getLoanCounter(),function (questionsObj, choicesSelectedAnswerObj) {
                        returnedArray[0] = calculateAppraisalPercentage(questionsObj, choicesSelectedAnswerObj, 0);
                        clientAppraisalArray.push(returnedArray[0][0][0]);
                        answerIdArray.push(returnedArray[0][1]);
                        clientTotalWeightageArray.push(returnedArray[0][0][1]);
                        customlog.info("returnedArray " + returnedArray);
                        customlog.info(returnedArray[0][1] + "+++++++++++++++" + returnedArray[0][0][0] + "====" + returnedArray[0][0][1]);
                        customlog.info("clientAppraisalArray" + clientAppraisalArray);
                        customlog.info("answerIdArray" + answerIdArray);
                        customlog.info("clientTotalWeightageArray" + clientTotalWeightageArray);
                        var deleteClientRatingQuery = "DELETE FROM "+dbTableName.iklantClientRating+" WHERE client_id = "+clientId;
                        var updateAppraisalQuery = "INSERT INTO "+dbTableName.iklantClientRating+" (client_id,appraisal_rating,total_weightage_obtained,total_weightage_required,appraised_date,loan_count) " +
                            "VALUES(" + clientId + "," + clientAppraisalArray[0] + "," + clientTotalWeightageArray[0] + "," + initialTotalWeightageRequired + ",NOW() + INTERVAL 5 HOUR + INTERVAL 30 MINUTE," + fieldVerificationValue.getLoanCounter() + ")";
                        customlog.info("updateAppraisalQuery : " + updateAppraisalQuery);
                        client.query(deleteClientRatingQuery,function(err){
                            if(!err){
                                client.query(updateAppraisalQuery,
                                    function selectCb(err, results, fields) {
                                        if (err) {
                                            customlog.error(err);
                                            connectionDataSource.releaseConnectionPool(clientConnect);
                                        }
                                    });
                            }else{
                                connectionDataSource.releaseConnectionPool(clientConnect);
                                customlog.error(err);
                            }
                        });
                        for (var i = 0; i < questionsObj.getQuestionIdArray().length; i++) {
                            var updateAnswerQuery = "INSERT INTO "+dbTableName.iklantClientAssessment+" (client_id,question_id,answer_id,created_date,loan_count) " +
                                "VALUES(" + clientId + "," + questionsObj.getQuestionIdArray()[i] + "," + answerIdArray[0][i] + ",NOW() + INTERVAL 5 HOUR + INTERVAL 30 MINUTE," + fieldVerificationValue.getLoanCounter() + ")";
                            customlog.info("updateAnswerQuery : " + updateAnswerQuery);
                            client.query(updateAnswerQuery,
                                function selectCb(err, results, fields) {
                                    if (err) {
                                        connectionDataSource.releaseConnectionPool(clientConnect);
                                        customlog.error(err);
                                    }
                                });
                        }
                    });
                }else {
                    connectionDataSource.releaseConnectionPool(clientConnect);
                    customlog.error(err);
                }
            });

            var groupid;
            var groupstatus_id;
            var flag;
            var retrieveGroupId = "select group_id from "+dbTableName.iklantProspectClient+" where client_id = " + clientId + " ";
            client.query(retrieveGroupId, function selectCb(err, results, fields) {
                if (err) {
                    connectionDataSource.releaseConnectionPool(clientConnect);
                    customlog.error(err);
                } else {
                    for (var i in results) {
                        var fieldName = results[i];
                        groupid = fieldName.group_id;
                    }
                }
                var noOfVerifiedClients = 0;
                var noOfNMIClient = 0;
                var noOfRejectedClients = 0;
                var noOFNonVerifiedClients = 0;
                var retrieveClientList = "select client_id,status_id from "+dbTableName.iklantProspectClient+" where group_id = " + groupid + " ";
                client.query(retrieveClientList, function selectCb(err, results, fields) {
                    if (err) {
                        connectionDataSource.releaseConnectionPool(clientConnect);
                        customlog.error(err);
                    } else {
                        for (var i in results) {
                            var fieldName = results[i];
                            if (fieldName.status_id == constantsObj.getFieldVerified()) {
                                noOfVerifiedClients = noOfVerifiedClients + 1;
                            }
                            else if (fieldName.status_id == constantsObj.getRejectedFieldVerification()) {
                                noOfRejectedClients = noOfRejectedClients + 1;
                            }
                            else if (fieldName.status_id == constantsObj.getNeedInformation()) {
                                noOfNMIClient = noOfNMIClient + 1;
                            }
                            else if (fieldName.status_id == constantsObj.getAssignedFO()) {
                                noOFNonVerifiedClients = noOFNonVerifiedClients + 1;
                            }
                        }
                    }
                    customlog.info("noOFNonVerifiedClients : " + noOFNonVerifiedClients);
                    if ((noOfVerifiedClients >= 5) & (noOfNMIClient == 0) & (noOFNonVerifiedClients == 0)) {
                        groupstatus_id = constantsObj.getFieldVerified();
                    }
                    else if ((noOfVerifiedClients < 5) & (noOfNMIClient == 0) & (noOFNonVerifiedClients == 0)) {
                        groupstatus_id = constantsObj.getRejectedFieldVerification();
                    }
                    else if (noOfNMIClient > 0 | (noOFNonVerifiedClients > 0)) {
                        groupstatus_id = constantsObj.getAssignedFO();
                    }

                    var retrieveStatusDescriptionQuery = "SELECT status_name FROM "+dbTableName.iklantProspectStatus+" WHERE status_id =" + groupstatus_id + " ";
                    var status_name;
                    client.query(retrieveStatusDescriptionQuery, function selectCb(err, results, fields) {
                        if (err) {
                            connectionDataSource.releaseConnectionPool(clientConnect);
                            customlog.error(err);
                        } else {
                            for (var i in results) {
                                var fieldName = results[i];
                                status_name = fieldName.status_name;
                            }
                            //connectionDataSource.releaseConnectionPool(clientConnect);
                        }
                        prospectClientPersonalObj.clearAll();
                        prospectClientGuarantorObj.clearAll();
                        prospectClientHouseDetailObj.clearAll();
                        prospectClientBankDetailObj.clearAll();
                        customlog.info("status_name in Data Model : " + status_name);

                    });

                    if (groupstatus_id == constantsObj.getFieldVerified()) {
                        var updateStatusIDForGroupQuery = "UPDATE "+dbTableName.iklantProspectGroup+" SET status_id = " + groupstatus_id + ", " +
                            "needed_information = 0 ,rejected_less_no_of_clients = 0, " +
                            "updated_date=NOW() + INTERVAL 5 HOUR + INTERVAL 30 MINUTE WHERE group_id =" + groupid + " ";
                        client.query(updateStatusIDForGroupQuery,
                            function postCreate(err) {
                                connectionDataSource.releaseConnectionPool(clientConnect);
                                if (!err) {
                                    callback(groupid, status_name);
                                } else {
                                    //connectionDataSource.releaseConnectionPool(clientConnect);
                                    customlog.error(err);
                                }
                            }
                        );
                    }
                    else if (groupstatus_id == constantsObj.getRejectedFieldVerification()) {
                        var updateStatusIDForGroupQuery = "UPDATE "+dbTableName.iklantProspectGroup+" SET status_id = " + groupstatus_id + " ,needed_information = 0 ,rejected_less_no_of_clients = 1,updated_date=NOW() + INTERVAL 5 HOUR + INTERVAL 30 MINUTE WHERE group_id =" + groupid + " ";
                        client.query(updateStatusIDForGroupQuery,
                            function postCreate(err) {
                                connectionDataSource.releaseConnectionPool(clientConnect);
                                if (!err) {
                                    callback(groupid, status_name);
                                } else {
                                    //connectionDataSource.releaseConnectionPool(clientConnect);
                                    customlog.error(err);
                                }
                            });
                    }
                    else if (groupstatus_id == constantsObj.getAssignedFO()) {
                        var updateStatusIDForGroupQuery;
                        if (noOFNonVerifiedClients > 0) {
                            updateStatusIDForGroupQuery = "UPDATE "+dbTableName.iklantProspectGroup+" SET status_id = " + groupstatus_id + " ,needed_information = 0 ,rejected_less_no_of_clients = 0,updated_date=NOW() + INTERVAL 5 HOUR + INTERVAL 30 MINUTE WHERE group_id =" + groupid + " ";
                        }
                        else {
                            updateStatusIDForGroupQuery = "UPDATE "+dbTableName.iklantProspectGroup+" SET status_id = " + groupstatus_id + " ,needed_information = 1 ,rejected_less_no_of_clients = 0,updated_date=NOW() + INTERVAL 5 HOUR + INTERVAL 30 MINUTE WHERE group_id =" + groupid + " ";
                        }
                        client.query(updateStatusIDForGroupQuery,
                            function postCreate(err) {
                                connectionDataSource.releaseConnectionPool(clientConnect);
                                if (!err) {
                                    callback(groupid, status_name);
                                } else {
                                    //connectionDataSource.releaseConnectionPool(clientConnect);
                                    customlog.error(err);
                                }
                            });
                    }else{
                        connectionDataSource.releaseConnectionPool(clientConnect);
                        callback(groupid, status_name);
                    }
                });
            });
        });
    },

    calculateCCAForClientsWhileFieldVerification: function (tenantId, clientId,client,loanCounter,callback) {
        var choicesSelectedAnswerRequire = require(commonDTO +"/choicesSelectedAnswer");
        var questionsRequire = require(commonDTO +"/questions");
        var clientListArray = new Array();
        var currentDate = new Date();
        var constantsObj = this.constants;
        var fieldVerified = constantsObj.getFieldVerified();
        var rejectedFieldVerification = constantsObj.getRejectedFieldVerification();
        var choicesSelectedAnswerObj = new choicesSelectedAnswerRequire();
        var self=this;
        var ageArray = new Array();
        var educationalArray = new Array();
        var maritalArray = new Array();
        var numberOfEarningsArray = new Array();
        var familySavingsArray = new Array();
        var houseTypeArray = new Array();
        var vehicleArray = new Array();
        var purposeOfLoanArray = new Array();
        var bankArray = new Array();
        var lifeInsuranceArray = new Array();
        var accidentalInsuranceArray = new Array();
        var medicalInsuranceArray = new Array();
        var otherMfiLoanArray = new Array();
        var repaymentTrackerArray = new Array();
        var questionsObj = new questionsRequire();
        var CCAQuestionsIdArray = new Array();
        var CCAQuestionsArray = new Array();
        var CCAQuestionsWeightageArray = new Array();
        var noOfRegularAttendanceArray = new Array();
        var noOfIrregularAttendanceArray = new Array();
        var noOfRegularPaymentsArray = new Array();
        var noOfIrregularPaymentsArray = new Array();

        var questionsQuery;

        if(loanCounter > 1){
            questionsQuery = "SELECT * FROM "+dbTableName.iklantQuestions+" WHERE (is_default = 0 OR (loan_count = "+loanCounter+" AND is_default = 1)) AND tenant_id = " + tenantId + " ";
        }else{
            questionsQuery = "SELECT * FROM "+dbTableName.iklantQuestions+" WHERE (is_default = 0) AND tenant_id = " + tenantId + " ";
        }
        connectionDataSource.getConnection(function (clientConnect) {
            client.query(questionsQuery,
                function selectCb(err, results, fields) {
                    if (err) {
                        connectionDataSource.releaseConnectionPool(clientConnect);
                        customlog.error(err);
                    } else {
                        for (var i in results) {
                            CCAQuestionsIdArray[i] = results[i].question_Id;
                            CCAQuestionsArray[i] = results[i].question_Name;
                            CCAQuestionsWeightageArray[i] = results[i].weightage;
                        }
                        questionsObj.setQuestionIdArray(CCAQuestionsIdArray);
                        questionsObj.setQuestionNameArray(CCAQuestionsArray);
                        questionsObj.setQuestionWeightage(CCAQuestionsWeightageArray);
                    }
                });
            var choicesAnswerQuery = "SELECT over.client_id,over.date_of_birth , hd.educational_details , hd.marital_status , " +
                "cou.number_of_earnings, over.family_monthly_income ,over.family_monthly_expense , gr.house_type , " +
                "over.vehicle_details,hd.loan_purpose, over.is_bank_account,over.is_insurance_lifetime, " +
                "over.is_insurance_accidental,over.is_insurance_medical, over.is_loan_secured,coumfi.number_of_loan,hd.loan_repayment_track_record," +
                "over.no_of_regular_attendance,over.no_of_irregular_attendance,over.no_of_regular_payments,over.no_of_irregular_payments FROM " +
                "(SELECT pcp.client_id,pcp.date_of_birth,pcp.educational_details,pcp.marital_status,pcp.loan_purpose, " +
                "pc.family_monthly_income,pc.family_monthly_expense,pch.house_type,pch.vehicle_details, " +
                "pcb.is_bank_account,pcb.is_insurance_lifetime,pcb.is_insurance_accidental,pcb.is_insurance_medical, " +
                "pc.is_loan_secured,other.no_of_regular_attendance,other.no_of_irregular_attendance,other.no_of_regular_payments,other.no_of_irregular_payments " +
                "FROM "+dbTableName.iklantProspectClient+" pc " +
                "LEFT JOIN "+dbTableName.iklantProspectClientPersonal+" pcp ON pcp.client_id = pc.client_id " +
                "LEFT JOIN "+dbTableName.iklantProspectClientFamilyDetail+" pcf ON pcf.client_id = pc.client_id " +
                "LEFT JOIN "+dbTableName.iklantProspectClientHouseDetail+" pch ON pch.client_id = pc.client_id " +
                "LEFT JOIN "+dbTableName.iklantprospectClientBankDetail+" pcb ON pcb.client_id = pc.client_id " +
                "LEFT JOIN "+dbTableName.iklantProspectClientOtherMfiDetail+" pcm ON pcm.client_id = pc.client_id " +
                "LEFT JOIN "+dbTableName.iklantProspectClientOtherDetail+" other ON other.client_id = pc.client_id " +
                "INNER JOIN "+dbTableName.iklantProspectGroup+" pg ON pg.group_id = pc.group_id " +
                "WHERE pc.client_id = " + clientId + " and pc.status_id IN " +
                "(" + fieldVerified + "," + rejectedFieldVerification + ") " +
                "GROUP BY pc.client_id)over " +
                "LEFT JOIN " +
                "(SELECT pcp.client_id AS clt,lv1.lookup_value AS educational_details, " +
                "lv2.lookup_value  AS marital_status, " +
                "lv4.lookup_value AS loan_purpose, " +
                "lv5.lookup_value AS loan_repayment_track_record " +
                "FROM "+dbTableName.iklantProspectClientPersonal+" pcp " +
                "LEFT JOIN "+dbTableName.iklantLookupValue+" lv1 ON  lv1.lookup_id = pcp.educational_details " +
                "LEFT JOIN "+dbTableName.iklantLookupValue+" lv2 ON  lv2.lookup_id = pcp.marital_status " +
                "LEFT JOIN "+dbTableName.iklantLookupValue+" lv4 ON  lv4.lookup_id = pcp.loan_purpose " +
                "LEFT JOIN "+dbTableName.iklantProspectClient+" pc ON pc.client_id = pcp.client_id " +
                "LEFT JOIN "+dbTableName.iklantLookupValue+" lv5 ON  lv5.lookup_id = pc.loan_repayment_track_record " +
                "LEFT JOIN "+dbTableName.iklantProspectGroup+" pg ON pg.group_id = pc.group_id " +
                "WHERE pc.client_id = " + clientId + " and pc.status_id IN " +
                "(" + fieldVerified + "," + rejectedFieldVerification + ")  " +
                "GROUP BY pcp.client_id)hd ON " +
                "hd.clt = over.client_id " +
                "LEFT JOIN " +
                "(SELECT lv3.lookup_value AS house_type,hdlp.client_id " +
                "FROM "+dbTableName.iklantProspectClientHouseDetail+" hdlp " +
                "INNER JOIN "+dbTableName.iklantLookupValue+" lv3 ON  lv3.lookup_id = hdlp.house_type " +
                "INNER JOIN "+dbTableName.iklantProspectClient+" pc ON pc.client_id = hdlp.client_id " +
                "INNER JOIN "+dbTableName.iklantProspectGroup+" pg ON pg.group_id = pc.group_id " +
                "WHERE pc.client_id = " + clientId + " and pc.status_id IN " +
                "(" + fieldVerified + "," + rejectedFieldVerification + ")  " +
                "GROUP BY pc.client_id) gr ON " +
                "hd.clt = gr.client_id " +
                "LEFT JOIN " +
                "(SELECT COUNT(pcfd.client_id) AS number_of_earnings,pc.client_id FROM "+dbTableName.iklantProspectClientFamilyDetail+" pcfd " +
                "INNER JOIN "+dbTableName.iklantProspectClient+" pc ON pc.client_id = pcfd.client_id " +
                "INNER JOIN "+dbTableName.iklantProspectGroup+" pg ON pg.group_id = pc.group_id " +
                "WHERE pc.client_id = " + clientId + " and pc.status_id IN " +
                "(" + fieldVerified + "," + rejectedFieldVerification + ") " +
                "GROUP BY pc.client_id) cou " +
                "ON hd.clt = cou.client_id " +

                "LEFT JOIN " +
                "(SELECT COUNT(pcmd.client_id) AS number_of_loan,pc.client_id FROM "+dbTableName.iklantProspectClientOtherMfiDetail+" pcmd " +
                "INNER JOIN "+dbTableName.iklantProspectClient+" pc ON pc.client_id = pcmd.client_id " +
                "WHERE pc.client_id = " + clientId + " and pc.status_id IN " +
                "(" + fieldVerified + "," + rejectedFieldVerification + ") GROUP BY pc.client_id) coumfi " +
                "ON hd.clt = coumfi.client_id " +
                "GROUP BY over.client_id";
            customlog.info("choicesAnswerQuery" + choicesAnswerQuery);
            client.query(choicesAnswerQuery, function selectCb(err, results, fields) {
                if (err) {
                    connectionDataSource.releaseConnectionPool(clientConnect);
                    customlog.error(err);
                } else {
                    connectionDataSource.releaseConnectionPool(clientConnect);
                    for (var i in results) {
                        ageArray[i] = currentDate.getYear() - results[i].date_of_birth.getYear();
                        educationalArray[i] = results[i].educational_details;
                        maritalArray[i] = results[i].marital_status;
                        numberOfEarningsArray[i] = results[i].number_of_earnings;
                        familySavingsArray[i] = results[i].family_monthly_income - results[i].family_monthly_expense;
                        houseTypeArray[i] = results[i].house_type;
                        vehicleArray[i] = results[i].vehicle_details;
                        purposeOfLoanArray[i] = results[i].loan_purpose;
                        bankArray[i] = results[i].is_bank_account;
                        lifeInsuranceArray[i] = results[i].is_insurance_lifetime;
                        accidentalInsuranceArray[i] = results[i].is_insurance_accidental;
                        medicalInsuranceArray[i] = results[i].is_insurance_medical;
                        otherMfiLoanArray[i] = results[i].number_of_loan;
                        repaymentTrackerArray[i] = results[i].loan_repayment_track_record;
                        noOfRegularAttendanceArray[i]= results[i].no_of_regular_attendance;
                        noOfIrregularAttendanceArray[i]= results[i].no_of_irregular_attendance;
                        noOfRegularPaymentsArray[i]= results[i].no_of_regular_payments;
                        noOfIrregularPaymentsArray[i]= results[i].no_of_irregular_payments;
                    }
                    choicesSelectedAnswerObj.setAge(ageArray);
                    choicesSelectedAnswerObj.setEducationalDetails(educationalArray);
                    choicesSelectedAnswerObj.setMaritalStatus(maritalArray);
                    choicesSelectedAnswerObj.setNumberOfEarnings(numberOfEarningsArray);
                    choicesSelectedAnswerObj.setFamilySavings(familySavingsArray);
                    choicesSelectedAnswerObj.setCurrentHouseType(houseTypeArray);
                    choicesSelectedAnswerObj.setVehicleType(vehicleArray);
                    choicesSelectedAnswerObj.setPurposeOfLoan(purposeOfLoanArray);
                    choicesSelectedAnswerObj.setBankDetails(bankArray);
                    choicesSelectedAnswerObj.setLifeInsuranceDetails(lifeInsuranceArray);
                    choicesSelectedAnswerObj.setAccidentalInsuranceDetails(accidentalInsuranceArray);
                    choicesSelectedAnswerObj.setMedicalInsuranceDetails(medicalInsuranceArray);
                    choicesSelectedAnswerObj.setOtherMicrofinance(otherMfiLoanArray);
                    choicesSelectedAnswerObj.setBorrowersLoanRepayment(repaymentTrackerArray);
                    choicesSelectedAnswerObj.setNoOfRegularAttendance(noOfRegularAttendanceArray);
                    choicesSelectedAnswerObj.setNoOfIrregularAttendance(noOfIrregularAttendanceArray);
                    choicesSelectedAnswerObj.setNoOfRegularPayments(noOfRegularPaymentsArray);
                    choicesSelectedAnswerObj.setNoOfIrregularPayments(noOfIrregularPaymentsArray);
                }
                callback(questionsObj, choicesSelectedAnswerObj);
            });
       });
    },

    //Baskar
    getClientNamesForFieldVerification: function (groupId, callback) {
        var clientPersonalObj = require(commonDTO +"/prospectClientPersonal");
        var clientGuarantorObj = require(commonDTO +"/prospectClientGuarantor");
        var clientHouseDetailObj = require(commonDTO +"/prospectClientHouseDetail");
        var clientBankDetailObj = require(commonDTO +"/prospectClientBankDetail");
        var VerificationObj = require(commonDTO +"/fieldVerification");
        var constantsObj = this.constants;
        var clientNameArray = new Array();
        var clientIdArray = new Array();
        var groupNameForFieldVerification;
        var prospectClientPersonalObj = new clientPersonalObj();
        var prospectClientGuarantorObj = new clientGuarantorObj();
        var prospectClientHouseDetailObj = new clientHouseDetailObj();
        var prospectClientBankDetailObj = new clientBankDetailObj();
        var fieldVerificationObj = new VerificationObj();
        var loanCounter;
        var thisclientId = 0;
        var retrieveClientListQuery = "SELECT pg.group_name,pc.client_id,pc.client_name,pg.loan_count FROM "+dbTableName.iklantProspectClient+" pc " +
            "INNER JOIN "+dbTableName.iklantProspectGroup+" pg ON pg.group_id = pc.group_id  " +
            "WHERE pc.group_id = " + groupId + " and  pc.status_id =" + constantsObj.getAssignedFO() + " " +
            "GROUP BY pc.client_id";
        customlog.info("retrieveClientListQuery : " + retrieveClientListQuery);
        connectionDataSource.getConnection(function (clientConnect) {
            clientConnect.query(retrieveClientListQuery,function selectCb(err, results, fields) {
                connectionDataSource.releaseConnectionPool(clientConnect);
                if (err) {
                    customlog.error(err);
                } else {
                    for (var i in results) {
                        var fieldName = results[i];
                        groupNameForFieldVerification = fieldName.group_name;
                        if(thisclientId == fieldName.client_id){
                            loanCounter = fieldName.loan_count;
                        }
                        var clientname = fieldName.client_name;
                        var clientId = fieldName.client_id;
                        clientNameArray.push(clientname);
                        clientIdArray.push(clientId);
                    }
                    customlog.info("clientNameArray : " + clientNameArray);
                    callback(thisclientId, clientNameArray, groupNameForFieldVerification, clientIdArray, prospectClientPersonalObj, prospectClientGuarantorObj, prospectClientHouseDetailObj, prospectClientBankDetailObj,loanCounter);
                }
            });
        });
    },

    retrieveDocTypeListDataModel: function (tenantId, callback) {
        var constantsObj = this.constants;
        var docTypeIdArray = new Array();
        var docTypeNameArray = new Array();
        var docTypequery = "SELECT doc_id,doc_name FROM "+dbTableName.iklantDocType+" where " +
            "doc_entity_id=" + constantsObj.getClientDocsEntity() + " " +
            "and tenant_id=" + tenantId + "";
        connectionDataSource.getConnection(function (clientConnect) {
            clientConnect.query(docTypequery,function selectCb(err, results, fields) {
                connectionDataSource.releaseConnectionPool(clientConnect);
                if(err){
                    customlog.error(err);
                }else{
                    for (var i in results) {
                        var fieldName = results[i];
                        docTypeIdArray[i] = fieldName.doc_id;
                        docTypeNameArray[i] = fieldName.doc_name;
                    }
                }
                callback(docTypeIdArray, docTypeNameArray);
            });
        });
    },

    getClientsForCCADatamodel: function (groupid, callback) {
        var clientListArray = new Array();
        var loanCounter;
        var self=this;
        var constantsObj = this.constants;
        var fieldVerified = constantsObj.getFieldVerified();
        var rejectedFieldVerification = constantsObj.getRejectedFieldVerification();
        var clientListQuery = "SELECT pc.client_id,pg.loan_count FROM "+dbTableName.iklantProspectGroup+" pg " +
            "INNER JOIN "+dbTableName.iklantProspectClient+" pc ON pc.group_id = pg.group_id " +
            "WHERE pg.group_id = " + groupid + " AND pg.status_id IN " +
            "(" + fieldVerified + ") " +
            "AND pc.status_id IN (" + fieldVerified + ","+ rejectedFieldVerification +") " +
            "AND pc.is_overdue=" + constantsObj.getActiveIndicatorFalse() + "";
        // pc.status_id in (constantsObj.getRejectedFieldVerification()) Removed due to rejected clients showing in the CCA
        customlog.info("clientListQuery : " + clientListQuery);
        connectionDataSource.getConnection(function (clientConnect) {
            clientConnect.query(clientListQuery,function selectCb(err, results, fields) {
                connectionDataSource.releaseConnectionPool(clientConnect);
                if (err) {
                    customlog.error(err);
                } else {
                    for (var i in results) {
                        clientListArray[i] = results[i].client_id;
                        loanCounter = results[0].loan_count;
                    }
                }
                customlog.info("clientListArray : " + clientListArray);
                callback(clientListArray,loanCounter);
            });
        });
    },

    checkAppraisalCalculated: function (clientListArray, callback) {
        var self = this;
        var clientArray = new Array();
        customlog.info("checkAppraisalCalculated length : " + clientListArray.length);
        if (clientListArray.length != 0) {
            var appraisedClientsQuery = "SELECT client_id FROM "+dbTableName.iklantClientRating+" WHERE client_id IN (" + clientListArray + ")";
        }
        else {
            var appraisedClientsQuery = "SELECT client_id FROM "+dbTableName.iklantClientRating+" WHERE client_id IN (0)";
        }
        connectionDataSource.getConnection(function (clientConnect) {
            clientConnect.query(appraisedClientsQuery,function selectCb(err, results, fields) {
                connectionDataSource.releaseConnectionPool(clientConnect);
                if (err) {
                    customlog.error(err);
                } else {
                    for (var i in results) {
                        var fieldName = results[i];
                        clientArray[i] = fieldName.client_id;
                    }
                }
                customlog.info("clientArray.length : " + clientArray.length);
                callback(clientArray.length);
            });
        });
    },

    calculateCCAforClientsDatamodel: function (tenantId, groupid,loanCounter,callback) {
        var choicesSelectedAnswerRequireObj = require(commonDTO+"/choicesSelectedAnswer");
        var questionsRequire = require(commonDTO+"/questions");
        var clientListArray = new Array();
        var currentDate = new Date();
        var constantsObj = this.constants;
        var fieldVerified = constantsObj.getFieldVerified();
        var rejectedFieldVerification = constantsObj.getRejectedFieldVerification();
        var choicesSelectedAnswerObj = new choicesSelectedAnswerRequireObj();
        var ageArray = new Array();
        var educationalArray = new Array();
        var maritalArray = new Array();
        var numberOfEarningsArray = new Array();
        var familySavingsArray = new Array();
        var houseTypeArray = new Array();
        var vehicleArray = new Array();
        var purposeOfLoanArray = new Array();
        var bankArray = new Array();
        var lifeInsuranceArray = new Array();
        var accidentalInsuranceArray = new Array();
        var medicalInsuranceArray = new Array();
        var otherMfiLoanArray = new Array();
        var repaymentTrackerArray = new Array();
        var noOfRegularAttendanceArray = new Array();
        var noOfIrregularAttendanceArray = new Array();
        var noOfRegularPaymentsArray = new Array();
        var noOfIrregularPaymentsArray = new Array();
        var questionsObj = new questionsRequire();
        var CCAQuestionsIdArray = new Array();
        var CCAQuestionsArray = new Array();
        var CCAQuestionsWeightageArray = new Array();
        var questionsQuery;

        if(loanCounter > 1){
            questionsQuery = "SELECT * FROM "+dbTableName.iklantQuestions+" WHERE (is_default = 0 OR (loan_count = "+loanCounter+" AND is_default = 1)) AND tenant_id = " + tenantId + " ";
        }else{
            questionsQuery = "SELECT * FROM "+dbTableName.iklantQuestions+" WHERE (is_default = 0) AND tenant_id = " + tenantId + " ";
        }

        connectionDataSource.getConnection(function (clientConnect) {
            clientConnect.query(questionsQuery,
                function selectCb(err, results, fields) {
                    if (err) {
                        connectionDataSource.releaseConnectionPool(clientConnect);
                        customlog.error(err);
                    } else {
                        for (var i in results) {
                            CCAQuestionsIdArray[i] = results[i].question_Id;
                            CCAQuestionsArray[i] = results[i].question_Name;
                            CCAQuestionsWeightageArray[i] = results[i].weightage;
                        }
                        questionsObj.setQuestionIdArray(CCAQuestionsIdArray);
                        questionsObj.setQuestionNameArray(CCAQuestionsArray);
                        questionsObj.setQuestionWeightage(CCAQuestionsWeightageArray);
                    }
                });
            var choicesAnswerQuery = "SELECT over.client_id,over.date_of_birth , hd.educational_details , hd.marital_status , " +
                "cou.number_of_earnings, over.family_monthly_income ,over.family_monthly_expense , gr.house_type , " +
                "over.vehicle_details,hd.loan_purpose, over.is_bank_account,over.is_insurance_lifetime, " +
                "over.is_insurance_accidental,over.is_insurance_medical, over.is_loan_secured,coumfi.number_of_loan,hd.loan_repayment_track_record," +
                "over.no_of_regular_attendance,over.no_of_irregular_attendance,over.no_of_regular_payments,over.no_of_irregular_payments FROM " +
                "(SELECT pcp.client_id,pcp.date_of_birth,pcp.educational_details,pcp.marital_status,pcp.loan_purpose, " +
                "pc.family_monthly_income,pc.family_monthly_expense,pch.house_type,pch.vehicle_details, " +
                "pcb.is_bank_account,pcb.is_insurance_lifetime,pcb.is_insurance_accidental,pcb.is_insurance_medical, " +
                "pc.is_loan_secured,other.no_of_regular_attendance,other.no_of_irregular_attendance,other.no_of_regular_payments,other.no_of_irregular_payments " +
                "FROM "+dbTableName.iklantProspectClient+" pc " +
                "LEFT JOIN "+dbTableName.iklantProspectClientPersonal+" pcp ON pcp.client_id = pc.client_id " +
                "LEFT JOIN "+dbTableName.iklantProspectClientFamilyDetail+" pcf ON pcf.client_id = pc.client_id " +
                "LEFT JOIN "+dbTableName.iklantProspectClientHouseDetail+" pch ON pch.client_id = pc.client_id " +
                "LEFT JOIN "+dbTableName.iklantprospectClientBankDetail+" pcb ON pcb.client_id = pc.client_id " +
                "LEFT JOIN "+dbTableName.iklantProspectClientOtherMfiDetail+" pcm ON pcm.client_id = pc.client_id " +
                "LEFT JOIN "+dbTableName.iklantProspectClientOtherDetail+" other ON other.client_id = pc.client_id " +
                "INNER JOIN "+dbTableName.iklantProspectGroup+" pg ON pg.group_id = pc.group_id " +
                "WHERE pg.group_id = " + groupid + " and pc.status_id IN " +
                "(" + fieldVerified + "," + rejectedFieldVerification + ") " +
                "GROUP BY pc.client_id)over " +
                "LEFT JOIN " +
                "(SELECT pcp.client_id AS clt,lv1.lookup_value AS educational_details, " +
                "lv2.lookup_value  AS marital_status, " +
                "lv4.lookup_value AS loan_purpose, " +
                "lv5.lookup_value AS loan_repayment_track_record " +
                "FROM "+dbTableName.iklantProspectClientPersonal+" pcp " +
                "LEFT JOIN "+dbTableName.iklantLookupValue+" lv1 ON  lv1.lookup_id = pcp.educational_details " +
                "LEFT JOIN "+dbTableName.iklantLookupValue+" lv2 ON  lv2.lookup_id = pcp.marital_status " +
                "LEFT JOIN "+dbTableName.iklantLookupValue+" lv4 ON  lv4.lookup_id = pcp.loan_purpose " +
                "LEFT JOIN "+dbTableName.iklantProspectClient+" pc ON pc.client_id = pcp.client_id " +
                "LEFT JOIN "+dbTableName.iklantLookupValue+" lv5 ON  lv5.lookup_id = pc.loan_repayment_track_record " +
                "LEFT JOIN "+dbTableName.iklantProspectGroup+" pg ON pg.group_id = pc.group_id " +
                "WHERE pg.group_id = " + groupid + " and pc.status_id IN " +
                "(" + fieldVerified + "," + rejectedFieldVerification + ")  " +
                "GROUP BY pcp.client_id)hd ON " +
                "hd.clt = over.client_id " +
                "LEFT JOIN " +
                "(SELECT lv3.lookup_value AS house_type,hdlp.client_id " +
                "FROM "+dbTableName.iklantProspectClientHouseDetail+" hdlp " +
                "INNER JOIN "+dbTableName.iklantLookupValue+" lv3 ON  lv3.lookup_id = hdlp.house_type " +
                "INNER JOIN "+dbTableName.iklantProspectClient+" pc ON pc.client_id = hdlp.client_id " +
                "INNER JOIN "+dbTableName.iklantProspectGroup+" pg ON pg.group_id = pc.group_id " +
                "WHERE pg.group_id = " + groupid + " and pc.status_id IN " +
                "(" + fieldVerified + "," + rejectedFieldVerification + ")  " +
                "GROUP BY pc.client_id) gr ON " +
                "hd.clt = gr.client_id " +
                "LEFT JOIN " +
                "(SELECT COUNT(pcfd.client_id) AS number_of_earnings,pc.client_id FROM "+dbTableName.iklantProspectClientFamilyDetail+" pcfd " +
                "INNER JOIN "+dbTableName.iklantProspectClient+" pc ON pc.client_id = pcfd.client_id " +
                "INNER JOIN "+dbTableName.iklantProspectGroup+" pg ON pg.group_id = pc.group_id " +
                "WHERE pg.group_id = " + groupid + " and pc.status_id IN " +
                "(" + fieldVerified + "," + rejectedFieldVerification + ") " +
                "GROUP BY pc.client_id) cou " +
                "ON hd.clt = cou.client_id " +

                "LEFT JOIN " +
                "(SELECT COUNT(pcmd.client_id) AS number_of_loan,pc.client_id FROM "+dbTableName.iklantProspectClientOtherMfiDetail+" pcmd " +
                "INNER JOIN "+dbTableName.iklantProspectClient+" pc ON pc.client_id = pcmd.client_id " +
                "WHERE pc.group_id = " + groupid + " and pc.status_id IN " +
                "(" + fieldVerified + "," + rejectedFieldVerification + ") GROUP BY pc.client_id) coumfi " +
                "ON hd.clt = coumfi.client_id " +
                "GROUP BY over.client_id";
            clientConnect.query(choicesAnswerQuery, function selectCb(err, results, fields) {
                if (err) {
                    connectionDataSource.releaseConnectionPool(clientConnect);
                    customlog.error(err);
                } else {
                    connectionDataSource.releaseConnectionPool(clientConnect);
                    for (var i in results) {
                        ageArray[i] = currentDate.getYear() - results[i].date_of_birth.getYear();
                        educationalArray[i] = results[i].educational_details;
                        maritalArray[i] = results[i].marital_status;
                        numberOfEarningsArray[i] = results[i].number_of_earnings;
                        familySavingsArray[i] = results[i].family_monthly_income - results[i].family_monthly_expense;
                        houseTypeArray[i] = results[i].house_type;
                        vehicleArray[i] = results[i].vehicle_details;
                        purposeOfLoanArray[i] = results[i].loan_purpose;
                        bankArray[i] = results[i].is_bank_account;
                        lifeInsuranceArray[i] = results[i].is_insurance_lifetime;
                        accidentalInsuranceArray[i] = results[i].is_insurance_accidental;
                        medicalInsuranceArray[i] = results[i].is_insurance_medical;
                        otherMfiLoanArray[i] = results[i].number_of_loan;
                        repaymentTrackerArray[i] = results[i].loan_repayment_track_record;
                        noOfRegularAttendanceArray[i]= results[i].no_of_regular_attendance;
                        noOfIrregularAttendanceArray[i]= results[i].no_of_irregular_attendance;
                        noOfRegularPaymentsArray[i]= results[i].no_of_regular_payments;
                        noOfIrregularPaymentsArray[i]= results[i].no_of_irregular_payments;
                    }
                    choicesSelectedAnswerObj.setAge(ageArray);
                    choicesSelectedAnswerObj.setEducationalDetails(educationalArray);
                    choicesSelectedAnswerObj.setMaritalStatus(maritalArray);
                    choicesSelectedAnswerObj.setNumberOfEarnings(numberOfEarningsArray);
                    choicesSelectedAnswerObj.setFamilySavings(familySavingsArray);
                    choicesSelectedAnswerObj.setCurrentHouseType(houseTypeArray);
                    choicesSelectedAnswerObj.setVehicleType(vehicleArray);
                    choicesSelectedAnswerObj.setPurposeOfLoan(purposeOfLoanArray);
                    choicesSelectedAnswerObj.setBankDetails(bankArray);
                    choicesSelectedAnswerObj.setLifeInsuranceDetails(lifeInsuranceArray);
                    choicesSelectedAnswerObj.setAccidentalInsuranceDetails(accidentalInsuranceArray);
                    choicesSelectedAnswerObj.setMedicalInsuranceDetails(medicalInsuranceArray);
                    choicesSelectedAnswerObj.setOtherMicrofinance(otherMfiLoanArray);
                    choicesSelectedAnswerObj.setBorrowersLoanRepayment(repaymentTrackerArray);
                    choicesSelectedAnswerObj.setNoOfRegularAttendance(noOfRegularAttendanceArray);
                    choicesSelectedAnswerObj.setNoOfIrregularAttendance(noOfIrregularAttendanceArray);
                    choicesSelectedAnswerObj.setNoOfRegularPayments(noOfRegularPaymentsArray);
                    choicesSelectedAnswerObj.setNoOfIrregularPayments(noOfIrregularPaymentsArray);
                }
                callback(questionsObj, choicesSelectedAnswerObj);
            });
        });
    },

    //Baskar
    groupAuthorizationClientCalculationDataModel: function (tenantId, groupId, callback) {
        var appClient = require(commonDTO+"/appraisedClients");
        var constantsObj = this.constants;
        var groupName = "";
        var centerName = "";
        var sum = 0.0;
        var len = "";
        var average = "";
        var v;
        var unAppraisedClients;
        var listClientIdArray = new Array();
        var listClientNameArray = new Array();
        var listClientRatingArray = new Array();
        var listClientTotalWeightageArray = new Array();
        var listClientTotalWeightageRequiredArray = new Array();
        var listLoanCountArray = new Array();
        var countOfOtherMFILoans = new Array();
        var isReinitiated = new Array();
        var reinitiatedStatus = new Array();
        var otherMFIBalanceAmount = new Array();
        var otherMFIWrittenOffAmount = new Array();
        var countOfRejectedClients;
        var appraisedClientsObj = new appClient();
        var mobileNumbers = new Array();
        var landLineNumbers = new Array();
        var statusId = new Array();
        var query = "SELECT cca_rating.*,rejected_clients.*,IFNULL(cca_rating.is_reinitiated,0) AS re_initiated,cca_rating.is_bm_reinitiated,cca_rating.is_rm_reinitiated FROM ( " +
            "SELECT pc.status_id,cr.client_id, pc.group_id,CONCAT(pc.client_name,' ',pc.client_last_name) AS client_name, pg.group_name,pg.center_name,pc.loan_count, " +
            "cr.appraisal_rating,cr.total_weightage_obtained,cr.total_weightage_required, " +
            "IF(irc.is_rm_reinitiated = 1 && irc.is_bm_reinitiated = 1,1,0) AS is_reinitiated, " +
            "IFNULL(irc.is_bm_reinitiated,0) AS  is_bm_reinitiated,IFNULL(irc.is_rm_reinitiated,0) AS  is_rm_reinitiated, " +
            "IFNULL(pc.other_mfi_balance_amount,0) AS other_mfi_balance_amount, " +
            "IFNULL(pc.other_mfi_written_off_amount,0) AS other_mfi_written_off_amount, " +
            "(SELECT COUNT(client_id) FROM "+dbTableName.iklantProspectClientOtherMfiDetail+" WHERE client_id = pc.client_id) AS other_mfi_count," +
            "IFNULL(ipcp.mobile_number,'') AS mobile_number," +
            "IFNULL(ipcp.landline_number,'') AS landline_number " +
            "FROM "+dbTableName.iklantClientRating+" cr " +
            "INNER JOIN "+dbTableName.iklantProspectClient+" pc ON pc.client_id = cr.client_id " +
            "INNER JOIN "+dbTableName.iklantProspectGroup+" pg ON pg.group_id = pc.group_id " +
            "INNER JOIN "+dbTableName.iklantProspectClientPersonal+" ipcp ON ipcp.client_id = pc.client_id " +
            "LEFT JOIN "+dbTableName.iklantRejectedClientStatus+" irc ON irc.client_id = pc.client_id " +
            "WHERE pc.group_id=" + groupId + " " +
            "AND (pc.status_id IN(" + constantsObj.getFieldVerified() + "," + constantsObj.getGroupRecognitionTested() + "," + constantsObj.getRejectedAppraisal() + ")) " +
            "GROUP BY cr.client_id)cca_rating " +
            "LEFT JOIN( " +
            "SELECT count_rej.groupid, " +
            "CASE " +
            "WHEN count_rej.rejected_in_fv > 0 THEN 1 " +
            "WHEN count_rej.rejected_in_fv <= 0 THEN 0 " +
            "ELSE 0 " +
            "END AS rejected_clients_count " +
            "FROM " +
            "(SELECT COUNT(client_id) AS rejected_in_fv," + groupId + " AS groupid  " +
            "FROM "+dbTableName.iklantProspectClient+" WHERE status_id IN " +
            "(" + constantsObj.getRejectedFieldVerification() + "," + constantsObj.getRejectedAppraisal() + ") " +
            "AND group_id = " + groupId + ")count_rej)rejected_clients ON " +
            "rejected_clients.groupid = cca_rating.group_id ";
        customlog.info("cca1Query : " + query);
        connectionDataSource.getConnection(function (clientConnect) {
            clientConnect.query(query, function selectCb(err, results, fields) {
                if (err) {
                    customlog.error("Error Query Evaluation "+err);
                    connectionDataSource.releaseConnectionPool(clientConnect);
                    callback();
                } else {
                    for (var i in results) {
                        customlog.info("Inside Query Evaluation")
                        var fieldName = results[i];
                        groupName = fieldName.group_name;
                        centerName = fieldName.center_name;
                        listClientIdArray[i] = fieldName.client_id;
                        listClientNameArray[i] = fieldName.client_name;
                        listClientRatingArray[i] = fieldName.appraisal_rating;
                        listLoanCountArray[i] = fieldName.loan_count;
                        listClientTotalWeightageArray[i] = fieldName.total_weightage_obtained;
                        listClientTotalWeightageRequiredArray[i] = fieldName.total_weightage_required;
                        countOfRejectedClients = fieldName.rejected_clients_count;
                        otherMFIBalanceAmount[i] = fieldName.other_mfi_balance_amount;
                        otherMFIWrittenOffAmount[i] = fieldName.other_mfi_written_off_amount;
                        countOfOtherMFILoans[i] = fieldName.other_mfi_count;
                        isReinitiated[i] = fieldName.is_reinitiated;
                        mobileNumbers[i] = fieldName.mobile_number;
                        landLineNumbers[i] = fieldName.landline_number;
                        statusId[i] = fieldName.status_id;
                        if(fieldName.is_bm_reinitiated == 1 && fieldName.is_rm_reinitiated == 0){
                            reinitiatedStatus[i] = false;
                        }
                        else{
                            reinitiatedStatus[i] = true;
                        }
                        v = parseFloat(listClientRatingArray[i]);
                        sum += v;
                        len = listClientRatingArray.length;
                        average = sum / len;
                        customlog.info("Client Id=" + listClientIdArray[i]);
                        customlog.info("Client Name=" + listClientNameArray[i]);
                        customlog.info("Appraisal Rating=" + listClientRatingArray[i]);
                        customlog.info("TotalWeightage=" + listClientTotalWeightageArray[i]);
                        customlog.info("listClientTotalWeightageRequiredArray=" + listClientTotalWeightageRequiredArray[i]);
                    }
                    customlog.info("otherMFIWrittenOffAmount" + otherMFIWrittenOffAmount);
                    customlog.info("otherMFIBalanceAmount" + otherMFIBalanceAmount);
                    customlog.info("countOfOtherMFILoans" + countOfOtherMFILoans);
                    customlog.info("listClientIdArray" + listClientIdArray);
                    customlog.info("listClientNameArray" + listClientNameArray);
                    appraisedClientsObj.setListClientIdArray(listClientIdArray);
                    appraisedClientsObj.setListClientNameArray(listClientNameArray);
                    appraisedClientsObj.setListClientRatingArray(listClientRatingArray);
                    appraisedClientsObj.setListClientTotalWeightageArray(listClientTotalWeightageArray);
                    appraisedClientsObj.setListClientTotalWeightageRequiredArray(listClientTotalWeightageRequiredArray);
                    appraisedClientsObj.setListLoanCountArray(listLoanCountArray);
                    appraisedClientsObj.setAppraisal_Rating(average);
                    appraisedClientsObj.setGroup_name(groupName);
                    appraisedClientsObj.setAppraisal_group_name(centerName);
                    appraisedClientsObj.setIsReinitiated(isReinitiated);
                    appraisedClientsObj.setReinitiatedStatus(reinitiatedStatus);
                    appraisedClientsObj.setStatusId(statusId);
                    appraisedClientsObj.setotherMFIWrittenOffAmount(otherMFIWrittenOffAmount);
                    appraisedClientsObj.setotherMFIBalanceAmount(otherMFIBalanceAmount);
                    appraisedClientsObj.setcountOfOtherMFILoans(countOfOtherMFILoans);
                    appraisedClientsObj.setClientMobileNumbers(mobileNumbers);
                    appraisedClientsObj.setClientLandLineNumbers(landLineNumbers);
                }
                customlog.info("average=" + average);
                customlog.info("countOfRejectedClients====" + countOfRejectedClients);
            });
            var docTypeIdArray = new Array();
            var docTypeNameArray = new Array();
            var docTypequery = "SELECT doc_id,doc_name FROM "+dbTableName.iklantDocType+"  where doc_entity_id=" + constantsObj.getClientDocsEntity() + "";
            clientConnect.query(docTypequery,
                function selectCb(err, results, fields) {
                    if (err) {
                        connectionDataSource.releaseConnectionPool(clientConnect);
                        customlog.error(err);
                        callback();
                    } else {
                        for (var i in results) {
                            var fieldName = results[i];
                            docTypeIdArray[i] = fieldName.doc_id;
                            docTypeNameArray[i] = fieldName.doc_name;
                        }
                        appraisedClientsObj.setDocumentIdArray(docTypeIdArray);
                        appraisedClientsObj.setDocumentNameArray(docTypeNameArray);
                    }
                    customlog.info("docTypeIdArray" + appraisedClientsObj.getDocumentIdArray());
                    customlog.info("docTypeNameArray" + appraisedClientsObj.getDocumentNameArray());
                });
            var secondaryAppraisalDiffQuery = "SELECT COUNT(pc.client_id) AS no_of_clients, " +
                "COUNT(secondary_rating) AS no_of_sec_rating FROM "+dbTableName.iklantClientRating+" cr " +
                "INNER JOIN "+dbTableName.iklantProspectClient+" pc ON pc.group_id = " + groupId + " " +
                "WHERE pc.status_id =" + constantsObj.getFieldVerified() + " AND " +
                "cr.client_id = pc.client_id AND IF(pc.loan_count > 1,"+
                "((SELECT COUNT(question_Id) FROM "+dbTableName.iklantQuestions+" WHERE (is_default = 1 and (loan_count = pc.loan_count AND is_default = 0)) AND tenant_id = "+tenantId+" ) <> 0), "+
                "((SELECT COUNT(question_Id) FROM "+dbTableName.iklantQuestions+" WHERE is_default=1 AND loan_count = pc.loan_count AND tenant_id = "+tenantId+" ) <> 0)"+
                ")";
            customlog.info("secondaryAppraisalDiffQuery : " + secondaryAppraisalDiffQuery);
            clientConnect.query(secondaryAppraisalDiffQuery, function selectCb(err, results, fields) {
                if (err) {
                    connectionDataSource.releaseConnectionPool(clientConnect);
                    customlog.error(err);
                    callback();
                } else {
                    for (var i in results) {
                        unAppraisedClients = results[i].no_of_clients - results[i].no_of_sec_rating;
                    }
                    customlog.info("unAppraisedClients : " + unAppraisedClients);
                    var retrieveRatingQuery = "SELECT `total_rate` FROM `"+dbTableName.iklantGrtGroupRemarks+"` WHERE group_id = "+groupId+" ORDER BY id DESC LIMIT 1";
                    customlog.info("retrieveRatingQuery : " + retrieveRatingQuery);
                    clientConnect.query(retrieveRatingQuery, function selectCb(err, results, fields) {
                        connectionDataSource.releaseConnectionPool(clientConnect);
                        if (err) {
                            customlog.error(err);
                            callback();
                        } else {
                            var totalRate = "0";
                            if(results.length > 0)
                                totalRate = results[0].total_rate;
                            callback(groupId, unAppraisedClients, appraisedClientsObj, countOfRejectedClients,totalRate);
                        }
                    });

                }
            });
        });
    },

    cca1AfterCheck: function (tenantId, groupId, callback) {
        var self = this;
        self.getClientsForCCADatamodel(groupId, function (clientListArray,loanCounter) {
            self.checkAppraisalCalculated(clientListArray, function (noOfAppraisedClients) {
                if (noOfAppraisedClients == 0) {
                    customlog.info("Inside if ");
                    self.calculateCCAforClientsDatamodel(tenantId, groupId,loanCounter, function (questionsObj, choicesSelectedAnswerObj) {
                        self.calculateAppraisalPercentageCall(questionsObj, choicesSelectedAnswerObj, clientListArray,function(){
                            self.groupAuthorizationClientCalculationDataModel(tenantId, groupId, function (groupId, unAppraisedClients, appraisedClientsObj, countOfRejectedClients) {
                                callback(groupId, unAppraisedClients, appraisedClientsObj, countOfRejectedClients);
                            });
                        });
                    });
                }
                else {
                    customlog.info("Inside else ");
                    self.groupAuthorizationClientCalculationDataModel(tenantId, groupId, function (groupId, unAppraisedClients, appraisedClientsObj, countOfRejectedClients) {
                        callback(groupId, unAppraisedClients, appraisedClientsObj, countOfRejectedClients);
                    });
                }
            });
        });
    },

    calculateAppraisalPercentageCall: function (questionsObj, choicesSelectedAnswerObj, clientListArray, callback) {
        var self = this;
        var clientAppraisalArray = new Array();
        var clientTotalWeightageArray = new Array();
        var answerIdArray = new Array();
        var returnedArray = new Array();
        for (var i = 0; i < choicesSelectedAnswerObj.getAge().length; i++) {
            returnedArray[i] = calculateAppraisalPercentage(questionsObj, choicesSelectedAnswerObj, i);
            clientAppraisalArray.push(returnedArray[i][0][0]);
            answerIdArray.push(returnedArray[i][1]);
            clientTotalWeightageArray.push(returnedArray[i][0][1]);
            customlog.info("returnedArray " + returnedArray);
            customlog.info(returnedArray[i][1] + "+" + returnedArray[i][0][0] + "=" + returnedArray[i][0][1]);
        }
        self.saveAppraisalDatamodel(clientListArray, questionsObj, clientAppraisalArray, clientTotalWeightageArray, answerIdArray, function () {
            callback();
        });
    },

    saveAppraisalDatamodel: function (clientListArray, questionsObj, clientAppraisalArray, clientTotalWeightageArray, answerIdArray, callback) {
        var initialTotalWeightageRequired = 225;
        connectionDataSource.getConnection(function (clientConnect) {
            for (var k = 0; k < clientListArray.length; k++) {
                for (var i = 0; i < questionsObj.getQuestionIdArray().length; i++) {
                    var updateAnswerQuery = "INSERT INTO "+dbTableName.iklantClientAssessment+" (client_id,question_id,answer_id,created_date) " +
                        "VALUES(" + clientListArray[k] + "," + questionsObj.getQuestionIdArray()[i] + "," + answerIdArray[k][i] + ",NOW() + INTERVAL 5 HOUR + INTERVAL 30 MINUTE)";
                    customlog.info("updateAnswerQuery : " + updateAnswerQuery);
                    clientConnect.query(updateAnswerQuery,function selectCb(err, results, fields) {
                        if (err) {
                            connectionDataSource.releaseConnectionPool(clientConnect);
                            customlog.error(err);
                        }
                    });
                }
            }
            for (var i = 0; i < clientListArray.length; i++) {
                var updateAppraisalQuery = "INSERT INTO "+dbTableName.iklantClientRating+" (client_id,appraisal_rating,total_weightage_obtained,total_weightage_required,appraised_date) " +
                    "VALUES(" + clientListArray[i] + "," + clientAppraisalArray[i] + "," + clientTotalWeightageArray[i] + "," + initialTotalWeightageRequired + ",NOW() + INTERVAL 5 HOUR + INTERVAL 30 MINUTE)";
                customlog.info("updateAppraisalQuery : " + updateAppraisalQuery);
                clientConnect.query(updateAppraisalQuery,function selectCb(err, results, fields) {
                    if (err) {
                        connectionDataSource.releaseConnectionPool(clientConnect);
                        customlog.error(err);
                    }
                });
                /*if(i == (clientListArray.length-1)){
                 connectionDataSource.releaseConnectionPool(clientConnect);
                 }*/
            }
            connectionDataSource.releaseConnectionPool(clientConnect);
        })
        callback();
    },

    retrieveIdleClientsDataModel : function(tenantId, groupId, statusIdValue, callback){
        var self = this;
        var constantsObj = this.constants;
        var groupName = "";
        var centerName = "";
        var sum = 0.0,len = "",average = "", v,isIdle,noOfIdleDays,lastCreditCheckDate;
        var appClient = require(commonDTO+"/appraisedClients");
        var dateUtil = require(path.join(rootPath,"app_modules/utils/DateUtils"));
        var unAppraisedClients;
        var listClientIdArray = new Array();
        var listClientNameArray = new Array();
        var listClientRatingArray = new Array();
        var listClientTotalWeightageArray = new Array();
        var listClientTotalWeightageRequiredArray = new Array();
        var listLoanCountArray = new Array();
        var countOfOtherMFILoans = new Array();
        var otherMFIBalanceAmount = new Array();
        var otherMFIWrittenOffAmount = new Array();
        var countOfRejectedClients;
        var appraisedClientsObj = new appClient();
        var isReinitiated = new Array();
        var reinitiatedStatus = new Array();
        var retrieveIdleClientsQuery = "";
        var mobileNumbers = new Array();
        var landLineNumbers = new Array();
        var statusId = new Array();

        if(statusIdValue != constantsObj.getCreditBureauAnalysedStatus() && statusIdValue != constantsObj.getAssignedFO()) {
            retrieveIdleClientsQuery = "SELECT cr.client_id,pc.status_id,pc.group_id,CONCAT(pc.client_name,' ',pc.client_last_name) AS client_name," +
                "pg.group_name,pg.center_name,pc.loan_count,cr.appraisal_rating,cr.total_weightage_obtained,cr.total_weightage_required," +
                " IF(irc.is_rm_reinitiated = 1 && irc.is_bm_reinitiated = 1,1,0) AS is_reinitiated," +
                "IFNULL(irc.is_bm_reinitiated, 0) AS is_bm_reinitiated,IFNULL(irc.is_rm_reinitiated, 0) AS is_rm_reinitiated," +
                "IFNULL(pc.other_mfi_balance_amount, 0) AS other_mfi_balance_amount,IFNULL(pc.other_mfi_written_off_amount,0) AS other_mfi_written_off_amount," +
                "IFNULL(ipcp.mobile_number,'') AS mobile_number," +
                "IFNULL(ipcp.landline_number,'') AS landline_number, " +
                "(SELECT COUNT(client_id) FROM iklant_prospect_client_other_mfi_detail WHERE client_id = pc.client_id) AS other_mfi_count " +
                "FROM iklant_client_rating cr " +
                "INNER JOIN iklant_prospect_client pc ON pc.client_id = cr.client_id " +
                "INNER JOIN iklant_prospect_group pg ON pg.group_id = pc.group_id " +
                "INNER JOIN iklant_prospect_client_personal ipcp ON ipcp.client_id = pc.client_id " +
                "LEFT JOIN iklant_rejected_client_status irc ON irc.client_id = pc.client_id " +
                "WHERE pc.group_id = " + groupId + " AND (pc.status_id = pg.status_id OR irc.group_id = " + groupId + ") " +
                "AND pc.loan_count = pg.loan_count GROUP BY cr.client_id";
        }
        else{
            retrieveIdleClientsQuery = "SELECT pc.client_id,pc.status_id,pc.group_id,CONCAT(pc.client_name,' ',pc.client_last_name) AS client_name," +
                "pg.group_name,pg.center_name,pc.loan_count,0.00 AS appraisal_rating,0 AS total_weightage_obtained,225 AS total_weightage_required," +
                " IF(irc.is_rm_reinitiated = 1 && irc.is_bm_reinitiated = 1,1,0) AS is_reinitiated," +
                "IFNULL(irc.is_bm_reinitiated, 0) AS is_bm_reinitiated,IFNULL(irc.is_rm_reinitiated, 0) AS is_rm_reinitiated," +
                "IFNULL(pc.other_mfi_balance_amount, 0) AS other_mfi_balance_amount,IFNULL(pc.other_mfi_written_off_amount,0) AS other_mfi_written_off_amount," +
                "IFNULL(ipcp.mobile_number,'') AS mobile_number," +
                "IFNULL(ipcp.landline_number,'') AS landline_number, " +
                "(SELECT COUNT(client_id) FROM iklant_prospect_client_other_mfi_detail WHERE client_id = pc.client_id) AS other_mfi_count " +
                "FROM iklant_prospect_client pc " +
                "INNER JOIN iklant_prospect_group pg ON pg.group_id = pc.group_id " +
                "INNER JOIN iklant_prospect_client_personal ipcp ON ipcp.client_id = pc.client_id " +
                "LEFT JOIN iklant_rejected_client_status irc ON irc.client_id = pc.client_id " +
                "WHERE pc.group_id = " + groupId + " AND (pc.status_id = pg.status_id OR irc.group_id = " + groupId + ") " +
                "AND pc.loan_count = pg.loan_count GROUP BY pc.client_id";
        }
        connectionDataSource.getConnection(function (clientConnect) {
            clientConnect.query(retrieveIdleClientsQuery, function selectCb(err, results, fields) {
                if (err) {
                    connectionDataSource.releaseConnectionPool(clientConnect);
                    customlog.error(err);
                    callback(groupId, unAppraisedClients, appraisedClientsObj, countOfRejectedClients, isIdle);
                }
                else {
                    for(var i=0;i<results.length;i++){
                        var fieldName = results[i];
                        groupName = fieldName.group_name;
                        centerName = fieldName.center_name;
                        listClientIdArray[i] = fieldName.client_id;
                        listClientNameArray[i] = fieldName.client_name;
                        listClientRatingArray[i] = fieldName.appraisal_rating;
                        listLoanCountArray[i] = fieldName.loan_count;
                        listClientTotalWeightageArray[i] = fieldName.total_weightage_obtained;
                        listClientTotalWeightageRequiredArray[i] = fieldName.total_weightage_required;
                        otherMFIBalanceAmount[i] = fieldName.other_mfi_balance_amount;
                        otherMFIWrittenOffAmount[i] = fieldName.other_mfi_written_off_amount;
                        countOfOtherMFILoans[i] = fieldName.other_mfi_count;
                        mobileNumbers[i] = fieldName.mobile_number;
                        landLineNumbers[i] = fieldName.landline_number;
                        statusId[i] = fieldName.status_id;
                        v = parseFloat(listClientRatingArray[i]);
                        sum += v;
                        len = listClientRatingArray.length;
                        average = sum / len;
                        isReinitiated[i] = fieldName.is_reinitiated;
                        if(fieldName.is_bm_reinitiated == 1 && fieldName.is_rm_reinitiated == 0){
                            reinitiatedStatus[i] = false;
                        }
                        else{
                            reinitiatedStatus[i] = true;
                        }
                    }
                    appraisedClientsObj.setListClientIdArray(listClientIdArray);
                    appraisedClientsObj.setListClientNameArray(listClientNameArray);
                    appraisedClientsObj.setListClientRatingArray(listClientRatingArray);
                    appraisedClientsObj.setListClientTotalWeightageArray(listClientTotalWeightageArray);
                    appraisedClientsObj.setListClientTotalWeightageRequiredArray(listClientTotalWeightageRequiredArray);
                    appraisedClientsObj.setListLoanCountArray(listLoanCountArray);
                    appraisedClientsObj.setAppraisal_Rating(average);
                    appraisedClientsObj.setGroup_name(groupName);
                    appraisedClientsObj.setAppraisal_group_name(centerName);
                    appraisedClientsObj.setotherMFIWrittenOffAmount(otherMFIWrittenOffAmount);
                    appraisedClientsObj.setotherMFIBalanceAmount(otherMFIBalanceAmount);
                    appraisedClientsObj.setcountOfOtherMFILoans(countOfOtherMFILoans);
                    appraisedClientsObj.setIsReinitiated(isReinitiated);
                    appraisedClientsObj.setStatusId(statusId);
                    appraisedClientsObj.setReinitiatedStatus(reinitiatedStatus);
                    appraisedClientsObj.setClientMobileNumbers(mobileNumbers);
                    appraisedClientsObj.setClientLandLineNumbers(landLineNumbers);

                    var docTypeIdArray = new Array();
                    var docTypeNameArray = new Array();
                    var docTypequery = "SELECT doc_id,doc_name FROM "+dbTableName.iklantDocType+"  where doc_entity_id=" + constantsObj.getClientDocsEntity() + "";
                    clientConnect.query(docTypequery,
                        function selectCb(err, results, fields) {
                            if (err) {
                                connectionDataSource.releaseConnectionPool(clientConnect);
                                customlog.error(err);
                                callback(groupId, unAppraisedClients, appraisedClientsObj, countOfRejectedClients, isIdle);
                            } else {
                                for (var i in results) {
                                    var fieldName = results[i];
                                    docTypeIdArray[i] = fieldName.doc_id;
                                    docTypeNameArray[i] = fieldName.doc_name;
                                }
                                appraisedClientsObj.setDocumentIdArray(docTypeIdArray);
                                appraisedClientsObj.setDocumentNameArray(docTypeNameArray);
                            }
                        });
                    var secondaryAppraisalDiffQuery = "SELECT COUNT(pc.client_id) AS no_of_clients, " +
                        "COUNT(secondary_rating) AS no_of_sec_rating FROM "+dbTableName.iklantClientRating+" cr " +
                        "INNER JOIN "+dbTableName.iklantProspectClient+" pc ON pc.group_id = " + groupId + " " +
                        "INNER JOIN "+dbTableName.iklantProspectGroup+" pg ON pg.group_id = pc.group_id " +
                        "WHERE pc.status_id = pg.status_id AND " +
                        "cr.client_id = pc.client_id AND IF(pc.loan_count > 1,"+
                        "((SELECT COUNT(question_Id) FROM "+dbTableName.iklantQuestions+" WHERE (is_default = 1 and (loan_count = pc.loan_count AND is_default = 0)) AND tenant_id = "+tenantId+" ) <> 0), "+
                        "((SELECT COUNT(question_Id) FROM "+dbTableName.iklantQuestions+" WHERE is_default=1 AND loan_count = pc.loan_count AND tenant_id = "+tenantId+" ) <> 0)"+
                        ")";
                    clientConnect.query(secondaryAppraisalDiffQuery, function selectCb(err, results, fields) {
                        if (err) {
                            connectionDataSource.releaseConnectionPool(clientConnect);
                            callback(groupId, unAppraisedClients, appraisedClientsObj, countOfRejectedClients, isIdle);
                        } else {
                            for (var i in results) {
                                unAppraisedClients = results[i].no_of_clients - results[i].no_of_sec_rating;
                            }
                            var currentDate = dateUtil.getCurrentDate(new Date());
                            clientConnect.query("SELECT is_idle,(IFNULL(TO_DAYS('" + currentDate + "')-TO_DAYS(last_credit_check_date),0)) AS no_of_idle_days, last_credit_check_date FROM iklant_prospect_group WHERE group_id = "+groupId,function(error,result){
                                connectionDataSource.releaseConnectionPool(clientConnect);
                                if(result.length>0){
                                    isIdle = result[0].is_idle;
                                    noOfIdleDays = result[0].no_of_idle_days;
                                    lastCreditCheckDate = dateUtil.getCurrentDate(result[0].last_credit_check_date);
                                }
                                callback(groupId, unAppraisedClients, appraisedClientsObj, countOfRejectedClients, isIdle, noOfIdleDays, lastCreditCheckDate);
                            })
                        }
                    });
                }
            });
        });
    },

    rejectedClientDetailsDataModel: function (tenantId, clientId, callback) {
        var constantsObj = this.constants;
        var clientId;
        var groupId;
        var client_global_number;
        var client_name;
        var client_status_desc;
        var group_status_id;
        var client_status_id;
        var group_name;
        var center_name;
        var remarks;
        var remarksForRejection;
        var rejectedClientDetailsQuery = "SELECT pc.group_id,pc.client_id,pc.client_global_number,pc.client_name, " +
            "pg.group_name,pg.center_name,pc.status_id as client_status_id, " +
            "CONCAT(ps.status_desc,'  ',(IF(pc.status_id = "+constantsObj.getRejectedCreditBureauAnalysisStatusId()+",CONCAT('Last Credit Date',': ',pc.updated_date),''))) status_desc," +
            "pg.status_id as group_status_id,pc.remarks_for_reintiate, pc.remarks_for_rejection " +
            "FROM "+dbTableName.iklantProspectClient+" pc " +
            "INNER JOIN "+dbTableName.iklantProspectStatus+" ps ON ps.status_id = pc.status_id " +
            "INNER JOIN "+dbTableName.iklantProspectGroup+" pg ON pg.group_id = pc.group_id " +
            "WHERE  pc.client_id = " + clientId + "; ";
        customlog.info("rejectedClientDetailsQuery : " + rejectedClientDetailsQuery);
        connectionDataSource.getConnection(function (clientConnect) {
            clientConnect.query(rejectedClientDetailsQuery,function selectCb(err, results, fields) {
                    connectionDataSource.releaseConnectionPool(clientConnect);
                if (err) {
                    customlog.error(err);
                } else {
                    for (var i in results) {
                        groupId = results[i].group_id;
                        clientId = results[i].client_id;
                        clientId = results[i].client_id;
                        client_global_number = results[i].client_global_number;
                        client_name = results[i].client_name;
                        client_status_desc = results[i].status_desc;
                        client_status_id = results[i].client_status_id;
                        group_status_id = results[i].group_status_id;
                        group_name = results[i].group_name;
                        center_name = results[i].center_name;
                        remarks = results[i].remarks_for_reintiate;
                        remarksForRejection = results[i].remarks_for_rejection;
                    }
                    customlog.info("clientId" + clientId);
                    customlog.info("client_global_number" + client_global_number);
                    customlog.info("client_name" + client_name);
                    customlog.info("client_status_desc" + client_status_desc);
                    customlog.info("client_status_id" + client_status_id);
                    customlog.info("group_status_id" + group_status_id);
                    customlog.info("center_name" + center_name);
                    customlog.info("group_name" + group_name);
                    callback(groupId, clientId, client_global_number, client_name, client_status_desc, client_status_id, group_status_id, group_name, center_name, remarks, remarksForRejection);
                }
            });
        });
    },

    needClarificationDetails: function (clientId, remarks, callback) {
        var client_Id = clientId;
        var groupid;
        var groupstatus_id;
        var clientPersonalObj = require(commonDTO+"/prospectClientPersonal");
        var clientGuarantorObj = require(commonDTO+"/prospectClientGuarantor");
        var clientHouseDetailObj = require(commonDTO+"/prospectClientHouseDetail");
        var clientBankDetailObj = require(commonDTO+"/prospectClientBankDetail");
        var prospectClientPersonalObj = new clientPersonalObj();
        var prospectClientGuarantorObj = new clientGuarantorObj();
        var prospectClientHouseDetailObj = new clientHouseDetailObj();
        var prospectClientBankDetailObj = new clientBankDetailObj();
        var constantsObj = this.constants;

        var needClarificationStatusUpdateQuery = "UPDATE "+dbTableName.iklantProspectClient+" SET status_id = " + constantsObj.getNeedInformation() + " ,remarks_for_need_more_information = '" + remarks + "',updated_date=NOW() + INTERVAL 5 HOUR + INTERVAL 30 MINUTE WHERE client_id =" + client_Id + " ";
        connectionDataSource.getConnection(function (clientConnect) {
            clientConnect.query(needClarificationStatusUpdateQuery,
                function postCreate(err) {
                    if (err) {
                        customlog.error(err);
                        connectionDataSource.releaseConnectionPool(clientConnect);
                    }
                });
            var retrieveGroupId = "select group_id from "+dbTableName.iklantProspectClient+" where client_id = " + client_Id + " ";
            clientConnect.query(retrieveGroupId, function selectCb(err, results, fields) {
                if (err) {
                    connectionDataSource.releaseConnectionPool(clientConnect);
                    customlog.error(err);
                } else {
                    for (var i in results) {
                        var fieldName = results[i];
                        groupid = fieldName.group_id;
                    }
                    var noOfVerifiedClients = 0;
                    var noOfNMIClient = 0;
                    var noOfRejectedClients = 0;
                    var noOFNonVerifiedClients = 0;
                    var retrieveClientList = "select client_id,status_id from "+dbTableName.iklantProspectClient+" where group_id = " + groupid + " ";
                    clientConnect.query(retrieveClientList, function selectCb(err, results, fields) {
                        if (err) {
                            connectionDataSource.releaseConnectionPool(clientConnect);
                            customlog.error(err);
                        } else {
                            for (var i in results) {
                                var fieldName = results[i];
                                customlog.error("client_id : " + fieldName.client_id);
                                if (fieldName.status_id == constantsObj.getFieldVerified()) {
                                    noOfVerifiedClients = noOfVerifiedClients + 1;
                                }
                                else if (fieldName.status_id == constantsObj.getRejectedFieldVerification()) {
                                    noOfRejectedClients = noOfRejectedClients + 1;
                                }
                                else if (fieldName.status_id == constantsObj.getAssignedFO() | fieldName.status_id == constantsObj.getNeedInformation()) {
                                    noOfNMIClient = noOfNMIClient + 1;
                                    break;
                                }
                            }
                        }
                        if ((noOfVerifiedClients >= 5) & (noOfNMIClient == 0) & (noOFNonVerifiedClients == 0)) {
                            groupstatus_id = constantsObj.getFieldVerified();
                        }
                        else if ((noOfVerifiedClients < 5) & (noOfNMIClient == 0)) {
                            groupstatus_id = constantsObj.getRejectedFieldVerification();
                        }
                        else if (noOfNMIClient > 0) {
                            groupstatus_id = constantsObj.getAssignedFO();
                        }
                        if (groupstatus_id == constantsObj.getFieldVerified()) {
                            var updateStatusIDForGroupQuery = "UPDATE "+dbTableName.iklantProspectGroup+" SET status_id = " + groupstatus_id + " ,needed_information = 0 ,rejected_less_no_of_clients = 0,updated_date=NOW() + INTERVAL 5 HOUR + INTERVAL 30 MINUTE WHERE group_id =" + groupid + " ";
                            clientConnect.query(updateStatusIDForGroupQuery,function postCreate(err) {
                                connectionDataSource.releaseConnectionPool(clientConnect);
                                if (err) {
                                    customlog.error(err);
                                }
                            });
                        }
                        else if (groupstatus_id == constantsObj.getRejectedFieldVerification()) {
                            var updateStatusIDForGroupQuery = "UPDATE "+dbTableName.iklantProspectGroup+" SET status_id = " + groupstatus_id + " ,needed_information = 0 ,rejected_less_no_of_clients = 1,updated_date=NOW() + INTERVAL 5 HOUR + INTERVAL 30 MINUTE WHERE group_id =" + groupid + " ";
                            clientConnect.query(updateStatusIDForGroupQuery,function postCreate(err) {
                                connectionDataSource.releaseConnectionPool(clientConnect);
                                if (err) {
                                    customlog.error(err);
                                }
                            });
                        }
                        else if (groupstatus_id == constantsObj.getAssignedFO()) {
                            var updateStatusIDForGroupQuery = "UPDATE "+dbTableName.iklantProspectGroup+" SET status_id = " + groupstatus_id + " ,needed_information = 1 , rejected_less_no_of_clients = 0,updated_date=NOW() + INTERVAL 5 HOUR + INTERVAL 30 MINUTE WHERE group_id =" + groupid + " ";
                            clientConnect.query(updateStatusIDForGroupQuery,function postCreate(err) {
                                connectionDataSource.releaseConnectionPool(clientConnect);
                                if (err) {
                                    customlog.error(err);
                                }
                            });
                        }
                    });
                    prospectClientPersonalObj.clearAll();
                    prospectClientGuarantorObj.clearAll();
                    prospectClientHouseDetailObj.clearAll();
                    prospectClientBankDetailObj.clearAll();
                    callback(groupid);
                }
            });
        });
    },

    getFieldVerificationDetails: function (clientId, callback) {
        var self=this;
        var clientPersonalObj = require(commonDTO +"/prospectClientPersonal");
        var clientGuarantorObj = require(commonDTO +"/prospectClientGuarantor");
        var clientHouseDetailObj = require(commonDTO +"/prospectClientHouseDetail");
        var clientBankDetailObj = require(commonDTO +"/prospectClientBankDetail");
        var VerificationObj = require(commonDTO +"/fieldVerification");
        var prospectClientPersonalObj = new clientPersonalObj();
        var prospectClientGuarantorObj = new clientGuarantorObj();
        var prospectClientHouseDetailObj = new clientHouseDetailObj();
        var prospectClientBankDetailObj = new clientBankDetailObj();
        var fieldVerificationObj = new VerificationObj();

        var constantsObj = this.constants;
        var activeIndicatorTrue = constantsObj.getActiveIndicatorTrue();
        var groupd;
        var clientNameArray = new Array();
        var clientIdArray = new Array();
        var thisclientId = clientId;
        var client_id;
        var client_name;
        var groupName,loanCounter;
        customlog.info("clientId : " + clientId + "INSIDE GET FIELD VERIFICATION DETAILS");
        var retrieveClientDetailsQuery = "SELECT over.client_id,over.client_name,over.address , over.ration_card_number , over.mobile_number, over.landline_number,over.voter_id,over.gas_number,over.aadhaar_number,over.other_id_name1,over.other_id_name2,over.other_id1,over.other_id2, " +
            "over.guarantor_name ,over.guarantor_address , over.guarantor_id,over.is_bank_account ,over.is_insurance_lifetime,over.group_id, " +
            "hd.house_type,hd.house_ceiling_type,hd.house_wall_type,hd.house_toilet,hd.house_flooring_detail, " +
            "over.household_details,over.time_period,over.house_sqft,over.vehicle_details,over.house_room_detail,gr.guarantor_relation " +
            "FROM " +
            "(SELECT pc.client_id AS client_id,pc.client_name,pcp.address,pcp.ration_card_number,pcp.mobile_number,pcp.landline_number,pcp.voter_id,pcp.gas_number,pcp.aadhaar_number,pcp.other_id_name1,pcp.other_id_name2,pcp.other_id1,pcp.other_id2, " +
            "pcg.guarantor_name,pcg.guarantor_address,pcg.guarantor_id, " +
            "pcbd.is_bank_account,pcbd.is_insurance_lifetime,pc.group_id, " +
            "pchd.household_details,pchd.time_period,pchd.house_sqft,pchd.vehicle_details,pchd.house_room_detail " +
            "FROM "+dbTableName.iklantProspectClient+"  pc " +
            "LEFT JOIN "+dbTableName.iklantProspectClientPersonal+"  pcp ON pcp.client_id = pc.client_id " +
            "LEFT JOIN "+dbTableName.iklantProspectClientGuarantor+" pcg ON pcg.client_id = pcp.client_id " +
            "LEFT JOIN "+dbTableName.iklantProspectClientHouseDetail+"  pchd ON pchd.client_id = pcp.client_id " +
            "LEFT JOIN "+dbTableName.iklantprospectClientBankDetail+"  pcbd ON pcbd.client_id = pcp.client_id " +
            /*"LEFT JOIN "+dbTableName.iklantProspectGroup+" pg ON pg.group_id = pc.client_id "+*/
            "WHERE pc.client_id = " + clientId + ") over " +
            "LEFT JOIN " +
            "(SELECT hdlp.client_id AS clt,lv1.lookup_value AS house_type, " +
            "lv2.lookup_value  AS house_ceiling_type, " +
            "lv3.lookup_value AS house_wall_type, " +
            "lv4.lookup_value AS house_toilet, " +
            "lv5.lookup_value AS house_flooring_detail " +
            "FROM "+dbTableName.iklantProspectClientHouseDetail+"  hdlp " +
            "LEFT JOIN "+dbTableName.iklantLookupValue+" lv1 ON  lv1.lookup_id = hdlp.house_type " +
            "LEFT JOIN "+dbTableName.iklantLookupValue+" lv2 ON  lv2.lookup_id = hdlp.house_ceiling_type " +
            "LEFT JOIN "+dbTableName.iklantLookupValue+" lv3 ON  lv3.lookup_id = hdlp.house_wall_type " +
            "LEFT JOIN "+dbTableName.iklantLookupValue+" lv4 ON  lv4.lookup_id = hdlp.house_toilet " +
            "LEFT JOIN "+dbTableName.iklantLookupValue+" lv5 ON  lv5.lookup_id = hdlp.house_flooring_detail " +
            "WHERE hdlp.client_id = " + clientId + " " +
            "GROUP BY hdlp.client_id)hd ON " +
            "hd.clt = over.client_id " +
            "LEFT JOIN " +
            "(SELECT pcg.guarantor_relationship,IF(lv6.lookup_value = 'Others',pcg.other_guarantor_relationship_name,lv6.lookup_value) AS guarantor_relation  FROM "+dbTableName.iklantProspectClientGuarantor+" pcg " +
            "LEFT JOIN "+dbTableName.iklantLookupValue+"  lv6 ON  lv6.lookup_id =pcg.guarantor_relationship " +
            "WHERE pcg.client_id =" + clientId + ") gr ON " +
            "hd.clt = over.client_id";
        connectionDataSource.getConnection(function (clientConnect) {
            clientConnect.query(retrieveClientDetailsQuery, function selectCb(err, results, fields) {
                if (err) {
                    connectionDataSource.releaseConnectionPool(clientConnect);
                    customlog.error(err);
                } else {
                    for (var i in results) {
                        var fieldName = results[i];
                        client_name = fieldName.client_name;
                        prospectClientPersonalObj.setClient_id(fieldName.client_id);
                        prospectClientPersonalObj.setAddress(fieldName.address);
                        prospectClientPersonalObj.setMobile_number(fieldName.mobile_number);
                        prospectClientPersonalObj.setLandLine_number((fieldName.landline_number)?fieldName.landline_number:'');
                        prospectClientPersonalObj.setRation_card_number(fieldName.ration_card_number);
                        prospectClientPersonalObj.setVoter_id(fieldName.voter_id);
                        prospectClientPersonalObj.setGas_number(fieldName.gas_number);
                        prospectClientPersonalObj.setAadhaar_number(fieldName.aadhaar_number);
                        prospectClientPersonalObj.setOther_id(fieldName.other_id1);
                        prospectClientPersonalObj.setOther_id2(fieldName.other_id2);
                        prospectClientPersonalObj.setOther_id_name(fieldName.other_id_name1);
                        prospectClientPersonalObj.setOther_id_name2(fieldName.other_id_name2);
                        var guarantorAddress = fieldName.guarantor_name + "   " + fieldName.guarantor_address;
                        prospectClientGuarantorObj.setGuarantorAddress(guarantorAddress);
                        prospectClientGuarantorObj.setGuarantorRelationship(fieldName.guarantor_relation);
                        prospectClientGuarantorObj.setGuarantorId(fieldName.guarantor_id);
                        prospectClientHouseDetailObj.setHouse_type(fieldName.house_type);
                        prospectClientHouseDetailObj.setHousehold_details(fieldName.household_details);
                        prospectClientHouseDetailObj.setTime_period(fieldName.time_period);
                        prospectClientHouseDetailObj.setHouse_sqft(fieldName.house_sqft);
                        prospectClientHouseDetailObj.setVehicle_details(fieldName.vehicle_details);
                        prospectClientHouseDetailObj.setHouse_ceiling_type(fieldName.house_ceiling_type);
                        prospectClientHouseDetailObj.setHouse_wall_type(fieldName.house_wall_type);
                        prospectClientHouseDetailObj.setHouse_flooring_detail(fieldName.house_flooring_detail);
                        prospectClientHouseDetailObj.setHouse_room_detail(fieldName.house_room_detail);
                        if (fieldName.is_bank_account == activeIndicatorTrue)
                            prospectClientBankDetailObj.setIs_bank_account('yes');
                        else
                            prospectClientBankDetailObj.setIs_bank_account('No');
                        if (fieldName.is_insurance_lifetime == activeIndicatorTrue)
                            prospectClientBankDetailObj.setIs_Insurance_Lifetime('Yes');
                        else
                            prospectClientBankDetailObj.setIs_Insurance_Lifetime('No');

                        prospectClientHouseDetailObj.setHouse_toilet(fieldName.house_toilet);
                        customlog.info("fieldName.group_id : " + fieldName.group_id);
                        groupd = fieldName.group_id;
                        customlog.info("groupd : " + groupd);
                    }
                    var retrieveClientListQuery = "SELECT pg.group_name,pc.client_id,pc.client_name,pc.loan_count FROM "+dbTableName.iklantProspectClient+"  pc " +
                        "INNER JOIN "+dbTableName.iklantProspectGroup+" pg ON pg.group_id = pc.group_id  " +
                        "WHERE pc.group_id =" + groupd + " and  pc.status_id =" + constantsObj.getAssignedFO() + " " +
                        "GROUP BY pc.client_id";
                    clientConnect.query(retrieveClientListQuery,function selectCb(err, results, fields) {
                        connectionDataSource.releaseConnectionPool(clientConnect);
                        if (err) {
                            customlog.error(err);
                        } else {
                            for (var i in results) {
                                var fieldName = results[i];
                                groupName = fieldName.group_name;
                                if(thisclientId == fieldName.client_id){
                                    loanCounter = fieldName.loan_count;
                                }
                                var clientname = fieldName.client_name;
                                var clientIds = fieldName.client_id;
                                clientNameArray.push(clientname);
                                clientIdArray.push(clientIds);
                            }
                        }
                        customlog.info("clientIdArray : " + clientIdArray);
                        customlog.info("clientNameArray : " + clientNameArray);
                        callback(thisclientId, client_name, clientNameArray, groupName, clientIdArray, prospectClientPersonalObj, prospectClientGuarantorObj, prospectClientHouseDetailObj, prospectClientBankDetailObj,loanCounter);
                    });
                }
            });
        });
    },

    groupDetailsAuthorizationDatamodel: function (tenantId, branchId, groupId, clientId, callback) {
        var prospectGroupObj = require(commonDTO+"/prospectGroup");
        var preliminaryVerificationObj = require(commonDTO+"/preliminaryVerification");
        var self = this;
        var prosGroupObj = new prospectGroupObj();
        var preliminaryVerificationObj = new preliminaryVerificationObj();

        var groupDetailsAuthorizationQuery = "SELECT pg.tenant_id,pg.group_id,pg.group_global_number,pg.group_name, " +
            "pg.center_name,pg.group_created_date,pv.loan_active_from,pv.is_savings_discussed, " +
            "pv.is_complete_attendance,pv.bank_name,pv.account_number,pv.account_created_date " +
            "FROM "+dbTableName.iklantProspectGroup+" pg " +
            "LEFT JOIN "+dbTableName.iklantPreliminaryVerification+" pv ON pv.group_id = pg.group_id " +
            "WHERE pg.group_id = " + groupId + " AND pg.tenant_id = " + tenantId + " AND pg.office_id=" + branchId + "";
        customlog.info("group Details AuthorizationQuery : " + groupDetailsAuthorizationQuery);
        connectionDataSource.getConnection(function (clientConnect) {
            clientConnect.query(groupDetailsAuthorizationQuery, function selectCb(err, results, fields) {
                connectionDataSource.releaseConnectionPool(clientConnect);
                if (err) {
                    customlog.error(err);
                } else {
                    for (var i in results) {
                        prosGroupObj.setGroup_global_number(results[i].group_global_number);
                        prosGroupObj.setGroup_name(results[i].group_name);
                        prosGroupObj.setCenter_name(results[i].center_name);

                        if (results[i].group_created_date != null) {
                            prosGroupObj.setGroup_created_date(dateUtils.formatDateForUI(results[i].group_created_date));
                        } else {
                            prosGroupObj.setGroup_created_date("Group Created Date Not Provided");
                        }
                        if (results[i].loan_active_from != null) {
                            preliminaryVerificationObj.setloan_active_from(dateUtils.formatDateForUI(results[i].loan_active_from));
                        } else {
                            preliminaryVerificationObj.setloan_active_from("Group Last Active From Not Provided");
                        }
                        preliminaryVerificationObj.setis_savings_discussed(results[i].is_savings_discussed);
                        preliminaryVerificationObj.setis_complete_attendance(results[i].is_complete_attendance);
                        if (results[i].bank_name != null) {
                            preliminaryVerificationObj.setbank_name(results[i].bank_name);
                        } else {
                            preliminaryVerificationObj.setbank_name("Bank Name Not Provided");
                        }
                        if (results[i].account_number != null) {
                            preliminaryVerificationObj.setaccount_number(results[i].account_number);
                        } else {
                            preliminaryVerificationObj.setaccount_number("Account Number Not Provided");
                        }
                        if (results[i].account_created_date != null) {
                            preliminaryVerificationObj.setaccount_created_date(dateUtils.formatDateForUI(results[i].account_created_date));
                        } else {
                            preliminaryVerificationObj.setaccount_created_date("Account Created Date Not Provided");
                        }
                    }
                    self.retrieveDocDatamodel(tenantId, clientId, function (capturedImageArray, docTypeIdArray) {
                        callback(prosGroupObj, preliminaryVerificationObj, capturedImageArray, docTypeIdArray);
                    });

                }
            });
        });
    },

    retrieveDocDatamodel: function (tenantId, clientId, callback) {
        var self=this;
        var capturedImageArray = new Array();
        var docTypeIdArray = new Array();
        if (clientId != 0) {
            var retrieveDocQuery = "SELECT Captured_image,doc_type_id FROM "+dbTableName.iklantClientDoc+" WHERE client_id = " + clientId + " ORDER BY client_id";
            customlog.info("retrieveDocQuery : " + retrieveDocQuery);
            connectionDataSource.getConnection(function (clientConnect) {
                clientConnect.query(retrieveDocQuery, function selectCb(err, results, fields) {
                    connectionDataSource.releaseConnectionPool(clientConnect);
                    if (err) {
                        customlog.error(err);
                    } else {
                        for (var i in results) {
                            capturedImageArray[i] = results[i].Captured_image;
                            docTypeIdArray[i] = results[i].doc_type_id;
                        }
                        customlog.info("capturedImageArray= " + capturedImageArray);
                        customlog.info("docTypeIdArray= " + docTypeIdArray);
                    }
                    callback(capturedImageArray, docTypeIdArray);
                });
            });
        } else {
            callback(capturedImageArray, docTypeIdArray);
        }
    },

    removableDocumentAvailabilityDataModel : function(isAvailableSize,isDelete,checkingType,callback){
        customlog.info("DataModel : removableDocumentAvailabilityDataModel entry");
        var self = this;
        var query = "";
        if(checkingType == "1"){
            checkingType = "First Loan Client Documents";
            query = "SELECT  DISTINCT * FROM "+dbTableName.iklantClientDoc+" WHERE loan_count =1 AND client_id IN (SELECT client_id FROM "+dbTableName.iklantProspectClient+" WHERE status_id =10 AND loan_count=2)";
            customlog.info("DataModel : "+checkingType+" : "+query);
        }else if(checkingType == "2"){
            checkingType = "Rejected before loan approved Documents ";
            query = "SELECT DISTINCT * FROM "+dbTableName.iklantClientDoc+" WHERE client_id IN (SELECT client_id FROM "+dbTableName.iklantProspectClient+" WHERE status_id IN (14,15,16,17,18,25,26,29) AND  group_id IN (SELECT group_id FROM "+dbTableName.iklantProspectGroup+" WHERE status_id =12)) ;";
            customlog.info("DataModel : "+checkingType+" : "+query);
        }else if(checkingType == "3"){
            checkingType = "Rejected groups Documents ";
            query = "SELECT * FROM "+dbTableName.iklantClientDoc+" WHERE client_id IN (SELECT client_id FROM "+dbTableName.iklantProspectClient+" WHERE group_id IN (SELECT group_id FROM "+dbTableName.iklantProspectGroup+" WHERE status_id IN (14,15,16,17,18,25,26,29)))";
            customlog.info("DataModel : "+checkingType+" : "+query);
        }else{
            checkingType = "Archived Groups";
            query = "SELECT DISTINCT * FROM "+dbTableName.iklantClientDoc+" WHERE client_id IN (SELECT client_id FROM "+dbTableName.iklantProspectClient+" WHERE group_id IN (SELECT group_id FROM "+dbTableName.iklantProspectGroup+" WHERE status_id =13))";
            customlog.info("DataModel : "+checkingType+" : "+query);
        }
        connectionDataSource.getConnection(function (clientConnect) {
            clientConnect.query(query, function selectCb(err, results) {
                connectionDataSource.releaseConnectionPool(clientConnect);
                var resultSet = results;
                if (err) {
                    customlog.error(err);
                    status = 'failure:Query execution failure';
                    callback(status,checkingType);
                } else {
                    if (resultSet.length > 0){
                        self.removableDocumentAvailabilityCheck(checkingType,resultSet, function (status) {
                            if (status == false) {
                                callback('failure:Query execution failure',checkingType);
                            } else {
                                callback('success',checkingType);
                            }
                        });
                    }else {
                        customlog.info("DataModel Total Client Documents : "+resultSet.length);
                        status = 'failure:Resultset empty';
                        callback(status,checkingType);
                    }
                }
            });
        });
    },

    removableDocumentAvailabilityCheck : function(checkingType,resultSet,callback){
        var totalFileAvailable = 0;
        var totalFileNotAvailable = 0;
        var rejectedClientDocumentTotalSize = 0;
        customlog.info("DataModel Total Client Documents : "+resultSet.length);
        var fs=require('fs');
        for(var i=0;i<resultSet.length;i++){
            var capturedImagePath = resultSet[i].Captured_image;
            /* fs.existsSync(capturedImagePath, function(exists) {
             if(exists){
             totalFileAvailable = totalFileAvailable +1;
             fs.stat(capturedImagePath, function(error, stats) {
             var size = stats.size;
             rejectedClientDocumentTotalSize = rejectedClientDocumentTotalSize + size;
             });
             }else{
             totalFileNotAvailable = totalFileNotAvailable + 1;
             console.log("DataModel "+checkingType+ " File Not Available  :"+totalFileNotAvailable );
             }
             });*/
            var isExists = fs.existsSync(capturedImagePath);
            if(isExists){
                var stat = fs.statSync(capturedImagePath);
                totalFileAvailable = totalFileAvailable +1;
                var size = stat.size;
                rejectedClientDocumentTotalSize = rejectedClientDocumentTotalSize + size;
            }else {
                totalFileNotAvailable = totalFileNotAvailable + 1;
            }
        }
        customlog.info("DataModel "+checkingType+ " File Available  :"+totalFileAvailable );
        customlog.info("DataModel "+checkingType+"  File Not Available  :"+totalFileNotAvailable );
        customlog.info("DataModel "+checkingType+"  Total File Size in Bytes  :"+rejectedClientDocumentTotalSize);
        var sizeInMB = parseFloat((rejectedClientDocumentTotalSize/(1024*1024)));
        customlog.info("DataModel "+checkingType+"  Total File Size in MB  :"+sizeInMB);
        var sizeInGB = parseFloat((rejectedClientDocumentTotalSize/(1024*1024*1024)));
        customlog.info("DataModel "+checkingType+"  Total File Size in GB  :"+sizeInGB);
        callback(true);
    },
    archeivedFlagUpdateClientDoc : function (clientDocId,clientId,callback){

        console.log("archeivedFlagUpdateClientDoc : "+clientDocId);
        connectionDataSource.getConnection(function (clientConnect) {
            var query = "UPDATE "+dbTableName.iklantClientDoc+" SET archived =1 WHERE client_id="+clientId+" and client_doc_id =" + clientDocId;
            console.log("archeivedFlagUpdateClientDoc : "+query);
            clientConnect.query(query, function selectCb(err, results) {
                if (err) {
                    customlog.error(err);
                    status = 'failure:Update Query execution failure ';
                    connectionDataSource.releaseConnectionPool(clientConnect);
                    console.log("archeivedFlagUpdateClientDoc : callback false");
                    callback(false);

                } else {
                    connectionDataSource.releaseConnectionPool(clientConnect);
                    console.log("archeivedFlagUpdateClientDoc : callback true");
                    callback(true);
                }
            });
        });
    },

    //CCA - Jagan
    listQuestionsCCACallDataModel: function (tenantId, clientId,clientLoanCount,callback) {
        var self=this;
        var choicesAnswerRequireObj = require(commonDTO+"/choicesanswer");
        var questionsRequireObj = require(commonDTO+"/questions");
        var choicesRequireObj = require(commonDTO+"/choices");
        var choicesanswerObj = new choicesAnswerRequireObj();
        var questionsObj = new questionsRequireObj();
        var choicesObj = new choicesRequireObj();
        var questionIdArray = new Array();
        var questionArray = new Array();
        var answerArray = new Array();
        var marksArray = new Array();
        var noOfPrimaryQuestions;
        var secondaryQuestionsQuery;
        var secondaryQuestionIdArray = new Array();
        var secondaryQuestionArray = new Array();
        var noOfPrimaryQuestionsQuery = "";
        var secondaryChoiceOneArray = new Array();
        var secondaryChoiceTwoArray = new Array();
        var secondaryChoiceThreeArray = new Array();
        var clientName;
        var capturedImageArray = new Array();
        var docTypeIdArray = new Array();

        choicesanswerObj.clearAll();
        questionsObj.clearAll();
        choicesObj.clearAll();

        if(clientLoanCount > 1){
            noOfPrimaryQuestionsQuery = "SELECT COUNT(question_Id) AS no_of_questions FROM "+dbTableName.iklantQuestions+" WHERE (is_default = 0 OR (loan_count = "+clientLoanCount+" AND is_default = 1)) AND tenant_id = " + tenantId + " ";
        }else{
            noOfPrimaryQuestionsQuery = "SELECT COUNT(question_Id) AS no_of_questions FROM "+dbTableName.iklantQuestions+" WHERE (is_default = 0) AND tenant_id = " + tenantId + " ";
        }

        connectionDataSource.getConnection(function (clientConnect) {
            clientConnect.query(noOfPrimaryQuestionsQuery, function selectCb(err, results, fields) {
                if (err) {
                    connectionDataSource.releaseConnectionPool(clientConnect);
                    customlog.error(err);
                } else {
                    for (var i in results) {
                        noOfPrimaryQuestions = results[i].no_of_questions;
                    }
                    questionsObj.setNoOfPrimaryQuestions(noOfPrimaryQuestions);
                }
            });

            if(clientLoanCount > 1){
                secondaryQuestionsQuery = "SELECT question_Id,question_Name FROM "+dbTableName.iklantQuestions+" q WHERE (q.is_default = 1 OR (loan_count = "+clientLoanCount+" AND q.is_default = 0))  AND q.question_Id " +
                    "NOT IN (SELECT question_id FROM "+dbTableName.iklantClientAssessment+" ca WHERE ca.client_id = " + clientId + ") AND q.tenant_id=" + tenantId + " ";
            }else{
                secondaryQuestionsQuery = "SELECT question_Id,question_Name FROM "+dbTableName.iklantQuestions+" q WHERE q.is_default=0 AND q.question_Id " +
                    "NOT IN (SELECT question_id FROM "+dbTableName.iklantClientAssessment+" ca WHERE ca.client_id = " + clientId + ") AND q.tenant_id=" + tenantId + " ";
            }

            customlog.info("secondaryQuestionsQuery : " + secondaryQuestionsQuery);
            clientConnect.query(secondaryQuestionsQuery, function selectCb(err, results, fields) {
                if (err) {
                    connectionDataSource.releaseConnectionPool(clientConnect);
                    customlog.error(err);
                } else {
                    for (var i in results) {
                        secondaryQuestionIdArray[i] = results[i].question_Id;
                        secondaryQuestionArray[i] = results[i].question_Name;
                    }
                    questionsObj.setSecondaryQuestionIdArray(secondaryQuestionIdArray);
                    questionsObj.setSecondaryQuestionNameArray(secondaryQuestionArray);
                }
            });

            var secondaryChoicesOneQuery;
            if(clientLoanCount > 1){
                secondaryChoicesOneQuery = "SELECT c.* FROM "+dbTableName.iklantChoices+" c INNER JOIN "+dbTableName.iklantQuestions+" q ON q.question_Id = c.question_id WHERE (q.is_default = 1 OR (loan_count = "+clientLoanCount+" AND q.is_default = 0)) AND c.choice_id=1 " +
                    "AND q.tenant_id= " + tenantId + " AND q.question_Id NOT IN (SELECT question_id FROM "+dbTableName.iklantClientAssessment+" ca WHERE ca.client_id = " + clientId + ")";
            }else{
                secondaryChoicesOneQuery = "SELECT c.* FROM "+dbTableName.iklantChoices+" c INNER JOIN "+dbTableName.iklantQuestions+" q ON q.question_Id = c.question_id WHERE q.is_default=0 AND c.choice_id=1 " +
                    "AND q.tenant_id= " + tenantId + " AND q.question_Id NOT IN (SELECT question_id FROM "+dbTableName.iklantClientAssessment+" ca WHERE ca.client_id = " + clientId + ")";
            }

            customlog.info("secondaryChoicesOneQuery : " + secondaryChoicesOneQuery);
            clientConnect.query(secondaryChoicesOneQuery, function selectCb(err, results, fields) {
                if (err) {
                    connectionDataSource.releaseConnectionPool(clientConnect);
                    customlog.error(err);
                } else {
                    for (var i in results) {
                        secondaryChoiceOneArray[i] = results[i].choice_name;
                    }
                    choicesObj.setSecondaryChoiceArrayOne(secondaryChoiceOneArray);
                }
            });

            var secondaryChoicesTwoQuery;
            if(clientLoanCount > 1){
                secondaryChoicesTwoQuery = "SELECT c.* FROM "+dbTableName.iklantChoices+" c INNER JOIN "+dbTableName.iklantQuestions+" q ON q.question_Id = c.question_id WHERE (q.is_default = 1 OR (loan_count = "+clientLoanCount+" AND q.is_default = 0)) AND c.choice_id=2 " +
                    "AND q.tenant_id= " + tenantId + " AND q.question_Id NOT IN (SELECT question_id FROM "+dbTableName.iklantClientAssessment+" ca WHERE ca.client_id = " + clientId + ")";
            }else{
                secondaryChoicesTwoQuery = "SELECT c.* FROM "+dbTableName.iklantChoices+" c INNER JOIN "+dbTableName.iklantQuestions+" q ON q.question_Id = c.question_id WHERE q.is_default=0 AND c.choice_id=2 " +
                    "AND q.tenant_id= " + tenantId + " AND q.question_Id NOT IN (SELECT question_id FROM "+dbTableName.iklantClientAssessment+" ca WHERE ca.client_id = " + clientId + ")";
            }
            customlog.info("secondaryChoicesTwoQuery : " + secondaryChoicesTwoQuery);
            clientConnect.query(secondaryChoicesTwoQuery, function selectCb(err, results, fields) {
                if (err) {
                    connectionDataSource.releaseConnectionPool(clientConnect);
                    customlog.error(err);
                } else {
                    for (var i in results) {
                        secondaryChoiceTwoArray[i] = results[i].choice_name;
                    }
                    choicesObj.setSecondaryChoiceArrayTwo(secondaryChoiceTwoArray);
                }
            });

            var secondaryChoicesThreeQuery;
            if(clientLoanCount > 1){
                secondaryChoicesThreeQuery = "SELECT c.* FROM "+dbTableName.iklantChoices+" c INNER JOIN "+dbTableName.iklantQuestions+" q ON q.question_Id = c.question_id WHERE (q.is_default = 1 OR (loan_count = "+clientLoanCount+" AND q.is_default = 0)) AND c.choice_id=3 " +
                    "AND q.tenant_id= " + tenantId + " AND q.question_Id NOT IN (SELECT question_id FROM "+dbTableName.iklantClientAssessment+" ca WHERE ca.client_id = " + clientId + ")";
            }else{
                secondaryChoicesThreeQuery = "SELECT c.* FROM "+dbTableName.iklantChoices+" c INNER JOIN "+dbTableName.iklantQuestions+" q ON q.question_Id = c.question_id WHERE q.is_default=0 AND c.choice_id=3 " +
                    "AND q.tenant_id= " + tenantId + " AND q.question_Id NOT IN (SELECT question_id FROM "+dbTableName.iklantClientAssessment+" ca WHERE ca.client_id = " + clientId + ")";
            }

            customlog.info("secondaryChoicesThreeQuery : " + secondaryChoicesThreeQuery);
            clientConnect.query(secondaryChoicesThreeQuery, function selectCb(err, results, fields) {
                if (err) {
                    connectionDataSource.releaseConnectionPool(clientConnect);
                    customlog.error(err);
                } else {
                    for (var i in results) {
                        secondaryChoiceThreeArray[i] = results[i].choice_name;
                    }
                    choicesObj.setSecondaryChoiceArrayThree(secondaryChoiceThreeArray);
                }
            });
            //to retrieve docs-Adarsh
            var retrieveDocQuery = "SELECT Captured_image,doc_type_id FROM "+dbTableName.iklantClientDoc+" WHERE client_id = " + clientId + " and loan_count = "+clientLoanCount+" ORDER BY client_id";
            customlog.info("retrieveDocQuery : " + retrieveDocQuery);
            clientConnect.query(retrieveDocQuery, function selectCb(err, results, fields) {
                if (err) {
                    connectionDataSource.releaseConnectionPool(clientConnect);
                    customlog.error(err);
                } else {
                    for (var i in results) {
                        capturedImageArray[i] = results[i].Captured_image;
                        docTypeIdArray[i] = results[i].doc_type_id;
                    }

                }
            });
            //End By Adarsh

            var choicesAnswerQuery = "SELECT quest_det.*,choice_det.* FROM " +
                "(SELECT ca.client_id,q.question_Name,ca.question_id,ca.answer_id, " +
                "pc.client_name FROM "+dbTableName.iklantClientAssessment+" ca " +
                "INNER JOIN "+dbTableName.iklantProspectClient+" pc ON pc.client_id = ca.client_id " +
                "INNER JOIN "+dbTableName.iklantQuestions+" q ON q.question_id=ca.question_id " +
                "WHERE ca.client_id=" + clientId + " AND q.tenant_id=" + tenantId + " AND ca.loan_count = "+clientLoanCount+" ) quest_det " +
                "INNER JOIN " +
                "(SELECT question_id,choice_id,choice_name,choice_marks FROM "+dbTableName.iklantChoices+" )choice_det " +
                "ON choice_det.question_id=quest_det.question_id " +
                "WHERE quest_det.answer_id=choice_det.choice_id GROUP BY quest_det.question_id";
            customlog.info("choicesAnswerQuery : " + choicesAnswerQuery);
            clientConnect.query(choicesAnswerQuery, function selectCb(err, results, fields) {
                if (err) {
                    connectionDataSource.releaseConnectionPool(clientConnect);
                    customlog.error(err);
                } else {
                    for (var i in results) {
                        questionIdArray[i] = results[i].question_id;
                        questionArray[i] = results[i].question_Name;
                        answerArray[i] = results[i].choice_name;
                        marksArray[i] = results[i].choice_marks;
                        clientName = results[i].client_name;
                    }
                    var marksTotal = 0;
                    for (var i in marksArray) {
                        marksTotal += marksArray[i];
                    }
                    customlog.info("marksTotal " + marksTotal);

                    choicesanswerObj.setSelectedChoice(answerArray);
                    choicesanswerObj.setSelectedChoiceMarks(marksArray);
                    choicesanswerObj.setSelectedChoiceMarksTotal(marksTotal);

                    questionsObj.setQuestionIdArray(questionIdArray);
                    questionsObj.setQuestionNameArray(questionArray);
                    connectionDataSource.releaseConnectionPool(clientConnect);
                    callback(clientName, questionsObj, choicesanswerObj, choicesObj, capturedImageArray, docTypeIdArray);
                }

            });
        });
    }
}

function MASCreditAppraisalFormPDF(groupName, kycformObj, prospectClientFamilyFetchObj, photo_clientId_array, captured_image_array, prospectClientOtherMfiFetchObj, disbDate) {
    var doc = new PDFDocument({
        size: 'B5'
    });
    /*for(var i=10; i<500;){
     doc.fontSize(11).text("|",10,i);
     i =i+5;
     }*/
    for (var i = 0; i < kycformObj.getClientName().length; i++) {
        if(i!=0){
            doc.addPage({
                size: 'B5'
            });
        }
        doc.image(rootPath + "/public/images/MAS1.jpg", 5, 10, {scale: 0.3});



        doc.font('Times-Roman').fontSize(10).text(kycformObj.getBranchName()[0],75, 120);
        doc.font('Times-Roman').fontSize(10).text(kycformObj.getClientName()[i], 110, 155);
        doc.font('Times-Roman').fontSize(10).text(kycformObj.getGrtDate()[i], 385, 120);
        doc.font('Times-Roman').fontSize(10).text(kycformObj.getPhoneNo()[i], 390, 170);
        doc.font('Times-Roman').fontSize(10).text(kycformObj.getEducation()[i], 180, 268);
        doc.font('Times-Roman').fontSize(10).text(kycformObj.getDateOfBirth()[i], 390, 268);

        if(kycformObj.getCaste()[i] == "ST"){
            doc.image(rootPath + "/public/images/tick.png", 278, 202, {scale: 0.2});
        }
        else if(kycformObj.getCaste()[i] == "SC"){
            doc.image(rootPath + "/public/images/tick.png", 330, 202, {scale: 0.2});
        }
        else if(kycformObj.getCaste()[i] == "BC" || kycformObj.getCaste()[i] == "MBC"){
            doc.image(rootPath + "/public/images/tick.png", 377, 202, {scale: 0.2});
        }
        else{
            doc.image(rootPath + "/public/images/tick.png", 205, 202, {scale: 0.2});
        }
        doc.image(rootPath + "/public/images/tick.png", 85, 140, {scale: 0.2});
        doc.image(rootPath + "/public/images/tick.png", 388, 140, {scale: 0.2});
        doc.image(rootPath + "/public/images/tick.png", 93, 202, {scale: 0.2});
        doc.image(rootPath + "/public/images/tick.png", 93, 216, {scale: 0.2});
        doc.image(rootPath + "/public/images/tick.png", 93, 230, {scale: 0.2});
        doc.image(rootPath + "/public/images/tick.png", 146, 288, {scale: 0.2});

        if(kycformObj.getHouse()[i] == "Own"){
            doc.image(rootPath + "/public/images/tick.png", 146, 308, {scale: 0.2});
        }
        else{
            doc.image(rootPath + "/public/images/tick.png", 146, 328, {scale: 0.2});
        }

        var rowPosition = 570;
        var income = 0;
        var expense =0;
        var totalFamilyMembers = 0
        for (var j = 0; j < prospectClientFamilyFetchObj.getClient_id().length; j++) {
            if (prospectClientFamilyFetchObj.getClient_id()[j] == kycformObj.getClientId()[i]) {
                doc.font('Times-Roman').fontSize(10).text(prospectClientFamilyFetchObj.getMember_name()[j], 35, rowPosition);
                doc.font('Times-Roman').fontSize(10).text(prospectClientFamilyFetchObj.getMember_relationship()[j], 175, rowPosition);
                doc.font('Times-Roman').fontSize(10).text(prospectClientFamilyFetchObj.getMember_occupation()[j], 280, rowPosition);
                doc.font('Times-Roman').fontSize(10).text(prospectClientFamilyFetchObj.getMember_income()[j], 390, rowPosition);
                rowPosition = rowPosition + 17;
                totalFamilyMembers=totalFamilyMembers+1;
                income = income+parseInt(prospectClientFamilyFetchObj.getMember_income()[j],10);
                expense = expense+parseInt(kycformObj.getFamilyMonthlyExpense()[j],10);
            }
        }

        doc.font('Times-Roman').fontSize(10).text(totalFamilyMembers, 146, 345);
        doc.font('Times-Roman').fontSize(10).text(income, 390, 650);
        doc.font('Times-Roman').fontSize(10).text(kycformObj.getClientName()[i], 146, 365);
        doc.image(rootPath + "/public/images/tick.png", 140, 380, {scale: 0.2});
        doc.image(rootPath + "/public/images/tick.png", 140, 398, {scale: 0.2});
        doc.font('Times-Roman').fontSize(10).text(income, 365, 465);
        doc.font('Times-Roman').fontSize(10).text(income, 365, 485);
        doc.font('Times-Roman').fontSize(10).text(parseInt(kycformObj.getFamilyMonthlyExpense()[i]), 145, 485);
        doc.font('Times-Roman').fontSize(10).text(kycformObj.getLoanPurpose()[i], 140, 430);
        doc.addPage({
            size: 'B5'
        });
        doc.image(rootPath + "/public/images/MAS2.jpg", 5, 10, {scale: 0.3});
        doc.font('Times-Roman').fontSize(10).text(kycformObj.getVehicle()[i], 40, 70);
        var rowPosition1 = 380;
        for (var j = 0; j < prospectClientOtherMfiFetchObj.getOtherMfiClientIdArray().length; j++) {
            if (prospectClientOtherMfiFetchObj.getOtherMfiClientIdArray()[j] == kycformObj.getClientId()[i]) {
                doc.font('Times-Roman').fontSize(10).text(prospectClientOtherMfiFetchObj.getOtherMfiNameArrayDto()[j], 25, rowPosition1);
                if(rowPosition1 == 380){
                    doc.font('Times-Roman').fontSize(10).text(prospectClientOtherMfiFetchObj.getOtherMfiOutstandingArrayDto()[j], 225, rowPosition1+70);
                }
                rowPosition1 = rowPosition1 +17;
            }
        }

        var maxEmi = ((kycformObj.getEMIAmount()/kycformObj.getClientName().length).toFixed()*115/100).toFixed();

        doc.font('Times-Roman').fontSize(10).text(kycformObj.getLoanPurpose()[i], 110, 245);
        doc.font('Times-Roman').fontSize(10).text(kycformObj.getLoanAmount()/kycformObj.getClientName().length, 110, 315);
        doc.font('Times-Roman').fontSize(10).text(maxEmi,360, 315);
        doc.font('Times-Roman').fontSize(10).text(kycformObj.getGrtDate()[i], 385, 660);



    }
    //doc.fontSize(11).text("______________________________________________________________________________",11,70);
    //doc.fontSize(11).text("CREDIT APRAISAL SHEET - MSME LOAN",140,85);
    //doc.fontSize(11).text("______________________________________________________________________________",11,90);
    doc.write(rootPath+"/public/GeneratedPDF/"+groupName+"_MAS_Appraisal.pdf");
}
// method to generate KYC forms in hindi & gujarati @ Paramasivan
function generateKYCFormInHindi(groupName, kycformObj, prospectClientFamilyFetchObj, photo_clientId_array, captured_image_array, prospectClientOtherMfiFetchObj, disbDate, bcOfficeId) {
    var doc = new PDFDocument;
    var disbDateStr = new Date(disbDate);
    var disbMonth = disbDateStr.getMonth() + 1;
    for (i = 0; i < kycformObj.getClientId().length; i++) {
        if (i == 0) {
            doc.font('Times-Roman').fontSize(12).text(kycformObj.getClientName()[i], 230, 190);
        }
        else {
            doc.addPage().font('Times-Roman').fontSize(12).text(kycformObj.getClientName()[i], 230, 190);
        }
        customlog.info("photo_clientId_array: " + photo_clientId_array);
        var photoPosition = 420;
        var error = "false";
        for (var a = 0; a < photo_clientId_array.length; a++) {
            if (photo_clientId_array[a] == kycformObj.getClientId()[i]) {
                //fix to avoid empty images
                try {
                    doc.image(captured_image_array[a], photoPosition, 180, {fit: [100, 100]}).stroke();
                }
                catch (e) { //catches "Unknown image format" Error
                    error = "true";
                    customlog.info("caught exception: " + e);
                }
                if (error == "false")
                    photoPosition = photoPosition + 90;
            }
        }
        //Signature box
        doc.font('fonts/times.ttf').fontSize(12).text("_____________", 421, 274);
        doc.font('fonts/times.ttf').fontSize(12).text("_____________", 421, 304);
        doc.font('fonts/times.ttf').fontSize(12).text("_____________", 511, 274);
        doc.font('fonts/times.ttf').fontSize(12).text("_____________", 511, 304);
        for (var s = 284; s <= 304; s = s + 10) {
            doc.font('fonts/times.ttf').fontSize(12).text("|", 420, s);
            doc.font('fonts/times.ttf').fontSize(12).text("|", 498, s);
            doc.font('fonts/times.ttf').fontSize(12).text("|", 510, s);
            doc.font('fonts/times.ttf').fontSize(12).text("|", 588, s);
        }
        doc.font('Times-Roman').fontSize(11).text("- "+kycformObj.getBranchName()[i], 302, 100);
        doc.font('Times-Roman').fontSize(12).text(kycformObj.getCenterName()[i], 230, 150);
        doc.font('Times-Roman').fontSize(12).text(kycformObj.getBranchName()[i], 230, 170);
        doc.font('Times-Roman').fontSize(12).text(kycformObj.getDateOfBirth()[i], 230, 210);
        doc.font('Times-Roman').fontSize(12).text(kycformObj.getGuardianRelationship()[i] + " / " + kycformObj.getGuardianName()[i] + " / " + kycformObj.getGuardianAge()[i], 230, 230);
        doc.font('Times-Roman').fontSize(12).text(kycformObj.getGuarantorName()[i] + " / " + kycformObj.getGuarantorAge()[i] + " / " + kycformObj.getGuarantorRelationship()[i], 230, 250);
        doc.font('Times-Roman').fontSize(12).text(kycformObj.getRationCardNo()[i], 230, 270);
        doc.font('Times-Roman').fontSize(12).text(kycformObj.getVoterId()[i], 230, 290);
        doc.font('Times-Roman').fontSize(12).text(kycformObj.getGasNo()[i], 230, 310);
        doc.font('Times-Roman').fontSize(12).text(kycformObj.getAadharNo()[i], 230, 330);
        doc.font('Times-Roman').fontSize(12).text(kycformObj.getGuarantorId()[i], 230, 350);
        doc.font('Times-Roman').fontSize(12).text(kycformObj.getPhoneNo()[i], 230, 370);
        doc.font('Times-Roman').fontSize(12).text(kycformObj.getReligion()[i], 230, 390);
        doc.font('Times-Roman').fontSize(12).text(kycformObj.getCaste()[i], 230, 410);
        doc.font('Times-Roman').fontSize(12).text(kycformObj.getMaritalStatus()[i], 230, 430);
        doc.font('Times-Roman').fontSize(12).text(kycformObj.getEducation()[i], 230, 450);
        doc.font('Times-Roman').fontSize(12).text(kycformObj.getLoanPurpose()[i], 230, 470);
        doc.font('Times-Roman').fontSize(12).text(kycformObj.getAddress()[i], 230, 490);
        doc.font('Times-Roman').fontSize(12).text(kycformObj.getPinCode()[i], 230, 510);
        doc.font('Times-Roman').fontSize(12).text(kycformObj.getHouse()[i], 230, 530);
        doc.font('Times-Roman').fontSize(12).text(kycformObj.getHouseSize()[i], 230, 550);
        doc.font('Times-Roman').fontSize(12).text(kycformObj.getHouseRoof()[i], 230, 570);
        doc.font('Times-Roman').fontSize(12).text(kycformObj.getHouseFloor()[i], 230, 590);
        doc.font('Times-Roman').fontSize(12).text(kycformObj.getToilet()[i], 230, 610);
        doc.font('Times-Roman').fontSize(12).text(kycformObj.getVehicle()[i], 230, 630);
        doc.font('Times-Roman').fontSize(12).text(kycformObj.getFamilyMonthlyIncome()[i], 230, 650);
        doc.font('Times-Roman').fontSize(12).text(kycformObj.getFamilyMonthlyExpense()[i], 230, 670);
        doc.font('Times-Roman').fontSize(12).text(kycformObj.getBankAccount()[i], 230, 690);
        doc.font('Times-Roman').fontSize(12).text(kycformObj.getSavings()[i], 230, 710);
        doc.font('fonts/times.ttf').fontSize(12).text(dbTableName.tenantCompanyName, 220, 20);
        doc.font('fonts/times.ttf').fontSize(10).text(dbTableName.tenantCompanyFKAName, 180, 32);
        //doc.font('fonts/times.ttf').fontSize(12).text("APEX ABISHEK FINANCE LIMITED", 200, 20);
        doc.font('fonts/times.ttf').fontSize(10).text("(Micro Finance Division)", 250, 40);
        //header ="viSDl vch'ksd Qkbusal fyfeVsM";
        header =",e,l,e ekbØksQkbusal fyfeVsM";
        doc.font('fonts/KrutiDev010.ttf').fontSize(13).text(header, 235, 55);
        regOffice = "iath—r dk;kZy;";
        doc.font('fonts/KrutiDev010.ttf').fontSize(12).text(regOffice, 170, 70);
        doc.font('fonts/times.ttf').fontSize(11).text("- B - 27, ", 240, 70);
        doc.font('fonts/KrutiDev010.ttf').fontSize(11).text("    gqMdks d‚yksuh]      g‚fLiVy ds ikl ]", 262, 70);
        doc.font('fonts/times.ttf').fontSize(11).text("PSG ", 335, 70);
        doc.font('fonts/KrutiDev010.ttf').fontSize(11).text(" ihyesMq] dksbEcVksj ", 190, 85);
        doc.font('fonts/times.ttf').fontSize(11).text("- 641004, Ph - 0422 - 4518475 ", 270, 85);
        branchOffice = "'kk[kk dk;kZy;";
        doc.font('fonts/KrutiDev010.ttf').fontSize(12).text(branchOffice, 240, 100);
        doc.font('fonts/times.ttf').fontSize(12).text("___________________________________________________________________________________________________", 10, 105);
        form = "lnL;ksa ds fy, vkosnu QkeZ";
        doc.font('fonts/KrutiDev010.ttf').fontSize(13).text(form, 255, 120);
        smallLines = "_______________________________";
        normalLines = "_____________________________________________________________";
        tableLines = "_____________________________________________________________________________________________";
        centerNameNumber = 'dsaæ dk uke@ la';
        doc.font('fonts/KrutiDev010.ttf').fontSize(12).text(centerNameNumber, 70, 150);
        doc.moveDown().font('fonts/times.ttf').fontSize(12).text(normalLines, 220, 150);
        branchNameNumber = "'kk[kk dk uke@ la ";
        doc.font('fonts/KrutiDev010.ttf').fontSize(12).text(branchNameNumber, 70, 170);
        doc.moveDown().font('fonts/times.ttf').fontSize(12).text(smallLines, 220, 170);
        clientName = "lnL; dk uke";
        doc.font('fonts/KrutiDev010.ttf').fontSize(12).text(clientName, 70, 190);3
        doc.moveDown().font('fonts/times.ttf').fontSize(12).text(smallLines, 220, 190);
        dateOfBirth = "tUe frfFk";
        doc.font('fonts/KrutiDev010.ttf').fontSize(12).text(dateOfBirth, 70, 210);
        doc.moveDown().font('fonts/times.ttf').fontSize(12).text(smallLines, 220, 210);
        husbandDadNameAge = "ifr@ firk dk uke@ mez";
        doc.font('fonts/KrutiDev010.ttf').fontSize(12).text(husbandDadNameAge, 70, 230);
        doc.moveDown().font('fonts/times.ttf').fontSize(12).text(smallLines, 220, 230);
        guarantorNameAgeRelation = "tekurnkj dk uke@ vk;q@ fj'rk";
        doc.font('fonts/KrutiDev010.ttf').fontSize(12).text(guarantorNameAgeRelation, 70, 250);
        doc.moveDown().font('fonts/times.ttf').fontSize(12).text(smallLines, 220, 250);
        rationCardNumber = "ifjokj jk'ku dkMZ uacj";
        doc.font('fonts/KrutiDev010.ttf').fontSize(12).text(rationCardNumber, 70, 270);
        doc.moveDown().font('fonts/times.ttf').fontSize(12).text(smallLines, 220, 270);
        voterId = "ernkrk igpku uacj";
        doc.font('fonts/KrutiDev010.ttf').fontSize(12).text(voterId, 70, 290);
        doc.moveDown().font('fonts/times.ttf').fontSize(12).text(smallLines, 220, 290);
        gasNum = "jlksbZ xSl dusD'ku uacj";
        doc.font('fonts/KrutiDev010.ttf').fontSize(12).text(gasNum, 70, 310);
        doc.moveDown().font('fonts/times.ttf').fontSize(12).text(normalLines, 220, 310);
        aadharNum = "vk@kkj dkMZ la";
        doc.font('fonts/KrutiDev010.ttf').fontSize(12).text(aadharNum, 70, 330);
        doc.moveDown().font('fonts/times.ttf').fontSize(12).text(normalLines, 220, 330);
        guarantorId = "tekurnkj dh igpkudk çek.k";
        doc.font('fonts/KrutiDev010.ttf').fontSize(12).text(guarantorId, 70, 350);
        doc.moveDown().font('fonts/times.ttf').fontSize(12).text(normalLines, 220, 350);
        phoneNumber = "VsyhQksu uacj";
        doc.font('fonts/KrutiDev010.ttf').fontSize(12).text(phoneNumber, 70, 370);
        doc.moveDown().font('fonts/times.ttf').fontSize(12).text(normalLines, 220, 370);
        religion = "/keZ";
        doc.font('fonts/KrutiDev010.ttf').fontSize(12).text(religion, 70, 390);
        doc.moveDown().font('fonts/times.ttf').fontSize(12).text(normalLines, 220, 390);
        caste = "tkfr";
        doc.font('fonts/KrutiDev010.ttf').fontSize(12).text(caste, 70, 410);
        doc.moveDown().font('fonts/times.ttf').fontSize(12).text(normalLines, 220, 410);
        maritalStatus = "oSokfgd fLFkfr";
        doc.font('fonts/KrutiDev010.ttf').fontSize(12).text(maritalStatus, 70, 430);
        doc.moveDown().font('fonts/times.ttf').fontSize(12).text(normalLines, 220, 430);
        education = "''kSf{kd ;ksX;rk";
        doc.font('fonts/KrutiDev010.ttf').fontSize(12).text(education, 70, 450);
        doc.moveDown().font('fonts/times.ttf').fontSize(12).text(normalLines, 220, 450);
        loanReason = "_.k dk mís';";
        doc.font('fonts/KrutiDev010.ttf').fontSize(12).text(loanReason, 70, 470);
        doc.moveDown().font('fonts/times.ttf').fontSize(12).text(normalLines, 220, 470);
        address = "irk";
        doc.font('fonts/KrutiDev010.ttf').fontSize(12).text(address, 70, 490);
        doc.moveDown().font('fonts/times.ttf').fontSize(12).text(normalLines, 220, 490);
        pincode = "fiu dksM la[;k";
        doc.font('fonts/KrutiDev010.ttf').fontSize(12).text(pincode, 70, 510);
        doc.moveDown().font('fonts/times.ttf').fontSize(12).text(normalLines, 220, 510);
        house = "viuk ?kj@ fdjk, ds edku";
        doc.font('fonts/KrutiDev010.ttf').fontSize(12).text(house, 70, 530);
        doc.moveDown().font('fonts/times.ttf').fontSize(12).text(normalLines, 220, 530);
        houseSize = "?kj dk dqy {ks=Qy";
        doc.font('fonts/KrutiDev010.ttf').fontSize(12).text(houseSize, 70, 550);
        doc.moveDown().font('fonts/times.ttf').fontSize(12).text(normalLines, 220, 550);
        houseRoof = "?kj dh Nr VkbYl@";
        doc.font('fonts/KrutiDev010.ttf').fontSize(12).text(houseRoof, 70, 570);
        doc.font('fonts/times.ttf').fontSize(12).text(" RCC", 150, 570);
        doc.moveDown().font('fonts/times.ttf').fontSize(12).text(normalLines, 220, 570);
        houseFloor = "?kj dh Q'kZ";
        doc.font('fonts/KrutiDev010.ttf').fontSize(12).text(houseFloor, 70, 590);
        doc.moveDown().font('fonts/times.ttf').fontSize(12).text(normalLines, 220, 590);
        toilet = "'kkSpky;";
        doc.font('fonts/KrutiDev010.ttf').fontSize(12).text(toilet, 70, 610);
        doc.moveDown().font('fonts/times.ttf').fontSize(12).text(normalLines, 220, 610);
        Vechicle = "vius v/khu ckgu";
        doc.font('fonts/KrutiDev010.ttf').fontSize(12).text(Vechicle, 70, 630);
        doc.moveDown().font('fonts/times.ttf').fontSize(12).text(normalLines, 220, 630);
        familyMonthlyIncome = "ifjokj dh ekfld vk;";
        doc.font('fonts/KrutiDev010.ttf').fontSize(12).text(familyMonthlyIncome, 70, 650);
        doc.moveDown().font('fonts/times.ttf').fontSize(12).text(normalLines, 220, 650);
        familyMonthlyExpense = "çfr ekg ifjokj dk O;;";
        doc.font('fonts/KrutiDev010.ttf').fontSize(12).text(familyMonthlyExpense, 70, 670);
        doc.moveDown().font('fonts/times.ttf').fontSize(12).text(normalLines, 220, 670);
        bankAccount = "D;k vkids ikl dksbZ cSad [kkrk gS";
        doc.font('fonts/KrutiDev010.ttf').fontSize(12).text(bankAccount, 70, 690);
        doc.moveDown().font('fonts/times.ttf').fontSize(12).text(normalLines, 220, 690);
        savings = "D;k vkids ikl dqN cpr gS";
        doc.font('fonts/KrutiDev010.ttf').fontSize(12).text(savings, 70, 710);
        doc.moveDown().font('fonts/times.ttf').fontSize(12).text(normalLines, 220, 710);
        //second page starting here
        doc.addPage();
        var rowPosition = 95;
        var serialNo = 1;
        for (var j = 0; j < prospectClientFamilyFetchObj.getClient_id().length; j++) {
            if (prospectClientFamilyFetchObj.getClient_id()[j] == kycformObj.getClientId()[i]) {
                doc.font('Times-Roman').fontSize(12).text(serialNo + ".", 45, rowPosition);
                doc.font('Times-Roman').fontSize(12).text(prospectClientFamilyFetchObj.getMember_name()[j], 75, rowPosition);
                doc.font('Times-Roman').fontSize(12).text(prospectClientFamilyFetchObj.getMember_gender()[j], 274, rowPosition);
                doc.font('Times-Roman').fontSize(12).text(prospectClientFamilyFetchObj.getMember_relationship()[j], 331, rowPosition);
                //doc.font('Times-Roman').fontSize(12).text(prospectClientFamilyFetchObj.getMember_dob()[j], 383, rowPosition);
                //doc.font('Times-Roman').fontSize(12).text(prospectClientFamilyFetchObj.getMember_education()[j], 415, rowPosition);
                doc.font('Times-Roman').fontSize(12).text(prospectClientFamilyFetchObj.getMember_occupation()[j], 415, rowPosition);
                doc.font('Times-Roman').fontSize(12).text(prospectClientFamilyFetchObj.getMember_income()[j], 551, rowPosition);
                rowPosition = rowPosition + 20;
                serialNo = serialNo + 1;
            }
        }
        tableTitle = "ifjokj vkSj vk; dk focj.k";
        doc.font('fonts/KrutiDev010.ttf').fontSize(12).text(tableTitle, 240, 45);
        doc.moveDown().font('fonts/times.ttf').fontSize(12).text("___________________", 240, 45);
        //Horizontal Lines
        doc.font('fonts/times.ttf').fontSize(12).text(tableLines, 30, 55);
        doc.font('fonts/times.ttf').fontSize(12).text(tableLines, 30, 75);
        doc.font('fonts/times.ttf').fontSize(12).text(tableLines, 30, 95);
        doc.font('fonts/times.ttf').fontSize(12).text(tableLines, 30, 115);
        doc.font('fonts/times.ttf').fontSize(12).text(tableLines, 30, 135);
        doc.font('fonts/times.ttf').fontSize(12).text(tableLines, 30, 155);
        doc.font('fonts/times.ttf').fontSize(12).text(tableLines, 30, 175);
        //Vertical Lines
        for (var x = 65; x <= 175; x = x + 10) {
            doc.font('fonts/times.ttf').fontSize(12).text("|", 29, x);
            doc.font('fonts/times.ttf').fontSize(12).text("|", 69, x);
            doc.font('fonts/times.ttf').fontSize(12).text("|", 269, x);
            doc.font('fonts/times.ttf').fontSize(12).text("|", 327, x);
            //doc.font('fonts/times.ttf').fontSize(12).text("|", 379, x);
            doc.font('fonts/times.ttf').fontSize(12).text("|", 409, x);
            //doc.font('fonts/times.ttf').fontSize(12).text("|", 479, x);
            doc.font('fonts/times.ttf').fontSize(12).text("|", 545, x);
            doc.font('fonts/times.ttf').fontSize(12).text("|", 587, x);
        }
        sNo = "Øekad";
        doc.font('fonts/KrutiDev010.ttf').fontSize(12).text(sNo, 35, 70);
        familyMemberName = "ifjokj ds lnL; dk uke";
        doc.font('fonts/KrutiDev010.ttf').fontSize(12).text(familyMemberName, 120, 70);
        gender = 'iqL"kZ@efgyk';
        doc.font('fonts/KrutiDev010.ttf').fontSize(12).text(gender, 274, 70);
        relationShip = "laca/k";
        doc.font('fonts/KrutiDev010.ttf').fontSize(12).text(relationShip, 340, 70);
        age = "mez";
        //doc.font('fonts/KrutiDev010.ttf').fontSize(12).text(age, 386, 70);
        education = ";ksX;rk";
        //doc.font('fonts/KrutiDev010.ttf').fontSize(12).text(education, 431, 70);
        occupation = "O;olk;@o`fÙk";
        doc.font('fonts/KrutiDev010.ttf').fontSize(12).text(occupation, 483, 70);
        income = "vk;";
        doc.font('fonts/KrutiDev010.ttf').fontSize(12).text(income, 555, 70);
        selfAgreement = 'Lo ?kks"k.kk i=';
        doc.font('fonts/KrutiDev010.ttf').fontSize(12).text(selfAgreement, 260, 200);
        point1 = "1- esjk vkt dh fnukad esa vfr y?kq {ks= ;k fdlhHkh foÙkh; laxBu dks pqdkus ds fy, _.k dk dksbZ cdk;k ughagS";
        doc.font('fonts/KrutiDev010.ttf').fontSize(12).text(point1, 50, 220);
        point2 = "2- esjk fuEufyf[kr vfr y?kq {ks=] foÙkh; laxBu ls _.k py jgk gS";
        doc.font('fonts/KrutiDev010.ttf').fontSize(12).text(point2, 50, 240);
        var otherMfiNamePosition = 60;
        for (var m = 0; m < prospectClientOtherMfiFetchObj.getOtherMfiClientIdArray().length; m++) {
            if (prospectClientOtherMfiFetchObj.getOtherMfiClientIdArray()[m] == kycformObj.getClientId()[i]) {
                doc.font('fonts/times.ttf').fontSize(12).text(prospectClientOtherMfiFetchObj.getOtherMfiNameArrayDto()[m], otherMfiNamePosition, 260);
                otherMfiNamePosition = otherMfiNamePosition + 180;
            }
        }
        otherMFI = "1.____________________________ 2.___________________________ 3.__________________________";
        doc.moveDown().font('fonts/times.ttf').fontSize(12).text(otherMFI, 50, 260);
        agreement = 'esa ;g ?kks"kuk djrh gw¡ dh] eSaus fdlh Hkh cSad ;k xSj cSafdax laLFkkvksa ls _.k dk ykHk mBkdj] iquHkqZxrku esa pwd ugha dh gS';
        doc.font('fonts/KrutiDev010.ttf').fontSize(12).text(agreement, {width: 495, align: 'justify', paragraphGap: 12}, 280, 50);
        place = "LFkku :";
        doc.font('fonts/KrutiDev010.ttf').fontSize(12).text(place, 50, 295);
        date = "rkjh[k :";
        doc.font('fonts/KrutiDev010.ttf').fontSize(12).text(date, 50, 310);
        doc.font('Times-Roman').fontSize(12).text(": " + kycformObj.getBranchName()[i], 90, 295);
        doc.font('Times-Roman').fontSize(12).text(": " + disbDateStr.getDate() + "/" + disbMonth + "/" + disbDateStr.getFullYear(), 90, 310 );
        name = "uke:";
        doc.font('fonts/KrutiDev010.ttf').fontSize(12).text(name, 350, 295);
        signature = "gLrk{kj:";
        doc.font('fonts/KrutiDev010.ttf').fontSize(12).text(signature, 350, 310);
        doc.font('fonts/times.ttf').fontSize(12).text("______________", 250, 186);
        doc.font('fonts/times.ttf').fontSize(12).text("______________", 250, 200);
        doc.font('fonts/times.ttf').fontSize(12).text("____________________________________", 30, 194);
        doc.font('fonts/times.ttf').fontSize(12).text("__________________________________________", 336, 194);
        doc.font('fonts/times.ttf').fontSize(12).text(tableLines, 30, 315);
        for (var z = 205; z <= 316; z = z + 10) {
            doc.font('fonts/times.ttf').fontSize(12).text("|", 29, z);
            doc.font('fonts/times.ttf').fontSize(12).text("|", 587, z);
        }
        pledge = '?kks"k.kk';
        doc.font('fonts/KrutiDev010.ttf').fontSize(12).text(pledge, 270, 330);
        doc.moveDown().font('fonts/times.ttf').fontSize(12).text("____", 270, 330);
        doc.font('fonts/times.ttf').fontSize(12).text("", 50, 325);
        pledgeContent = 'eSa ;g ?kks"k.kk djrh gw¡ fd] vxj dksbZ Hkh lnL; iquHkqZxrku esa pwd djrh gS] rks ge lc ml lnL; dks iquHkqZxrku dsfy, le>k;saxs vFkok lewg ds lHkh lnL; feydj ml lnL; ds _.k dk Hkqxrku djsaxs A blds vykok esjs }kjk mBk;s x, _.k dk Hkqxrku Lohdkj fu;ekuqlkj gksxk ,oa eSa çca/ku }kjk fy, x, fdlh Hkh fu.kZ; dk ikyu d#¡xh A eSa ;g ?kks"k.kk djrh gw¡ dh esjs }kjk çLrqr lHkh tkudkjh vkSj fooj.k] lR; o lgh gS vkSj eSa ;g le>rh gw¡ dh vxj esjs }kjk nh x;h tkudkjh xyr ik;h x;h rks çca/ku] dkuwu ds rgr esjs fo#) dkjokgh djus dk vf/kdkj j[krh gS A';
        doc.font('fonts/KrutiDev010.ttf').fontSize(12).text(pledgeContent, {width: 495, indent: 40, align: 'justify', paragraphGap: 12}, 350, 50);
        doc.font('fonts/KrutiDev010.ttf').fontSize(12).text(place, 50, 420);
        doc.font('fonts/KrutiDev010.ttf').fontSize(12).text(date, 50, 435);
        doc.font('Times-Roman').fontSize(12).text(": " + kycformObj.getBranchName()[i], 90, 420);
        doc.font('Times-Roman').fontSize(12).text(": " + disbDateStr.getDate() + "/" + disbMonth + "/" + disbDateStr.getFullYear(), 90, 435);
        customerSignature = "lnL; ds gLrk{kj";
        doc.font('fonts/KrutiDev010.ttf').fontSize(12).text(customerSignature, 460, 435);
        doc.font('fonts/times.ttf').fontSize(12).text("", 50, 435);
        guarantorPledge = ";fn lnL; _.k dkHkqxrku djus esa foQy jgrk gS] rks eSa iquHkqZxrku djus dh tekur ysrk gw¡ A";
        doc.font('fonts/KrutiDev010.ttf').fontSize(12).text(guarantorPledge, {width: 495, indent: 40, align: 'justify', paragraphGap: 12}, 455, 50);
        guarantorSignature = "tekurnkj ds gLrk{kj o lEoU/k";
        doc.font('fonts/KrutiDev010.ttf').fontSize(12).text(guarantorSignature, 460, 475);
        doc.font('fonts/KrutiDev010.ttf').fontSize(12).text(relationShip, 460, 490);
        doc.font('fonts/times.ttf').fontSize(12).text(" : "+kycformObj.getGuarantorRelationship()[i],480,490);
        officeUseOnly = "dsoy dk;kZy; mi;ksx gsrw";
        doc.font('fonts/KrutiDev010.ttf').fontSize(12).text(officeUseOnly, 250, 510);
        doc.moveDown().font('fonts/times.ttf').fontSize(12).text("_________________", 250, 510);
        //Horizontal Lines
        doc.font('fonts/times.ttf').fontSize(12).text(tableLines, 30, 525);
        doc.font('fonts/times.ttf').fontSize(12).text(tableLines, 30, 545);
        doc.font('fonts/times.ttf').fontSize(12).text(tableLines, 30, 590);
        doc.font('fonts/times.ttf').fontSize(12).text(tableLines, 30, 625);
        doc.font('fonts/times.ttf').fontSize(12).text(tableLines, 30, 655);
        //Vertical Lines
        for (var y = 535; y <= 655; y = y + 10) {
            doc.font('fonts/times.ttf').fontSize(12).text("|", 29, y);
            doc.font('fonts/times.ttf').fontSize(12).text("|", 89, y);
            doc.font('fonts/times.ttf').fontSize(12).text("|", 199, y);
            doc.font('fonts/times.ttf').fontSize(12).text("|", 587, y);
        }
        doc.font('fonts/KrutiDev010.ttf').fontSize(14).text("Ø-la", 43, 543);
        doc.font('fonts/times.ttf').fontSize(12).text("1.", 49, 575);
        doc.font('fonts/times.ttf').fontSize(12).text("2.", 49, 615);
        doc.font('fonts/times.ttf').fontSize(12).text("3.", 49, 645);
        particulars = "fooj.k";
        doc.font('fonts/KrutiDev010.ttf').fontSize(12).text(particulars, 130, 543);
        photoProof = "QksVks";
        doc.font('fonts/KrutiDev010.ttf').fontSize(12).text(photoProof, 110, 575);
        identityProof = "igpku dk çek.k";
        doc.font('fonts/KrutiDev010.ttf').fontSize(12).text(identityProof, 110, 615);
        addressProof = "irs dk çek.k";
        doc.font('fonts/KrutiDev010.ttf').fontSize(12).text(addressProof, 110, 645);
        details = "çek.k i= dk fooj.k";
        doc.font('fonts/KrutiDev010.ttf').fontSize(12).text(details, 370, 543);
        photoDetails1 = "vkosnd ";
        doc.font('fonts/KrutiDev010.ttf').fontSize(12).text(photoDetails1, 220, 560);
        doc.moveDown().font('fonts/times.ttf').fontSize(14).text("_____________________________________", 251, 560);
        photoDetails2 = "tekurnkj";
        doc.font('fonts/KrutiDev010.ttf').fontSize(12).text(photoDetails1, 220, 580);
        doc.moveDown().font('fonts/times.ttf').fontSize(14).text("_____________________________________", 251, 580);
        identityDetails = "ernkrk igpku i=@ Mh-,sy@ jk'kudkMZ";
        doc.font('fonts/KrutiDev010.ttf').fontSize(12).text(identityDetails, 220, 615);
        doc.moveDown().font('fonts/times.ttf').fontSize(14).text("__________________________", 385, 615);
        addressDetails = "ernkrk igpku i=@ Mh-,sy@ jk'ku dkMZ@ ,yihth fcy";
        doc.font('fonts/KrutiDev010.ttf').fontSize(12).text(addressDetails, 220, 645)
        doc.moveDown().font('fonts/times.ttf').fontSize(14).text("________________", 455, 645);;
        doc.font('fonts/KrutiDev010.ttf').fontSize(12).text(place, 50, 690);
        doc.font('fonts/KrutiDev010.ttf').fontSize(12).text(date, 50, 720);
        doc.font('Times-Roman').fontSize(12).text(": " + kycformObj.getBranchName()[i], 90, 690);
        doc.font('Times-Roman').fontSize(12).text(": " + disbDateStr.getDate() + "/" + disbMonth + "/" + disbDateStr.getFullYear(), 90, 720);
        branchOfficerSignature = "lqijokbtj ds gLrk{kj";
        doc.font('fonts/KrutiDev010.ttf').fontSize(12).text(branchOfficerSignature, 460, 690);
        branchManagerSignature = "'kk[kk çca/kd ds gLrk{kj";
        doc.font('fonts/KrutiDev010.ttf').fontSize(12).text(branchManagerSignature, 460, 720);
    }
    doc.write(rootPath+"/public/GeneratedPDF/" + groupName + "_KYCform.pdf");
}
function generateKYCFormInGujarati(groupName, kycformObj, prospectClientFamilyFetchObj, photo_clientId_array, captured_image_array, prospectClientOtherMfiFetchObj, disbDate, bcOfficeId) {
    var doc = new PDFDocument;
    var disbDateStr = new Date(disbDate);
    var disbMonth = disbDateStr.getMonth() + 1;
    for (i = 0; i < kycformObj.getClientId().length; i++) {
        if (i == 0) {
            doc.image(rootPath+"/public/images/KYC_Gujarati_New1.png",0,0, {scale:0.25});
        }
        else {
            doc.addPage().image(rootPath+"/public/images/KYC_Gujarati_1.png",0,0, {scale:0.25});
        }
        var photoPosition = 420;
        var error = "false";
        for (var a = 0; a < photo_clientId_array.length; a++) {
            if (photo_clientId_array[a] == kycformObj.getClientId()[i]) {
                //fix to avoid empty images
                try {
                    doc.image(captured_image_array[a], photoPosition, 200, {fit: [100, 100]}).stroke();
                }
                catch (e) { //catches "Unknown image format" Error
                    error = "true";
                    customlog.info("caught exception: " + e);
                }
                if (error == "false")
                    photoPosition = photoPosition + 90;
            }
        }
        //Signature box
        doc.font('fonts/times.ttf').fontSize(12).text("_____________", 421, 294);
        doc.font('fonts/times.ttf').fontSize(12).text("_____________", 421, 324);
        doc.font('fonts/times.ttf').fontSize(12).text("_____________", 511, 294);
        doc.font('fonts/times.ttf').fontSize(12).text("_____________", 511, 324);
        for (var s = 304; s <= 324; s = s + 10) {
            doc.font('fonts/times.ttf').fontSize(12).text("|", 420, s);
            doc.font('fonts/times.ttf').fontSize(12).text("|", 498, s);
            doc.font('fonts/times.ttf').fontSize(12).text("|", 510, s);
            doc.font('fonts/times.ttf').fontSize(12).text("|", 588, s);
        }
        smallLines = "__________________________";
        normalLines = "_______________________________________________________";
        doc.font('Times-Roman').fontSize(11).text("- "+kycformObj.getBranchName()[i], 315, 123);
        doc.font('Times-Roman').fontSize(11).text("________________________________________________________________________________________________________", 20, 135);
        doc.font('Times-Roman').fontSize(12).text(kycformObj.getCenterName()[i], 270, 176);
        doc.moveDown().font('fonts/times.ttf').fontSize(12).text(normalLines, 260, 176);
        doc.font('Times-Roman').fontSize(12).text(kycformObj.getBranchName()[i], 270, 196);
        doc.moveDown().font('fonts/times.ttf').fontSize(12).text(smallLines, 260, 196);
        doc.font('Times-Roman').fontSize(12).text(kycformObj.getClientName()[i], 270, 216);
        doc.moveDown().font('fonts/times.ttf').fontSize(12).text(smallLines, 260, 216);
        doc.font('Times-Roman').fontSize(12).text(kycformObj.getDateOfBirth()[i], 270, 235);
        doc.moveDown().font('fonts/times.ttf').fontSize(12).text(smallLines, 260, 235);
        doc.font('Times-Roman').fontSize(12).text(kycformObj.getGuardianRelationship()[i] + " / " + kycformObj.getGuardianName()[i] + " / " + kycformObj.getGuardianAge()[i], 270, 255);
        doc.moveDown().font('fonts/times.ttf').fontSize(12).text(smallLines, 260, 255);
        doc.font('Times-Roman').fontSize(12).text(kycformObj.getGuarantorName()[i] + " / " + kycformObj.getGuarantorAge()[i] + " / " + kycformObj.getGuarantorRelationship()[i], 270, 275);
        doc.moveDown().font('fonts/times.ttf').fontSize(12).text(smallLines, 260, 275);
        doc.font('Times-Roman').fontSize(12).text(kycformObj.getRationCardNo()[i], 270, 295);
        doc.moveDown().font('fonts/times.ttf').fontSize(12).text(smallLines, 260, 295);
        doc.font('Times-Roman').fontSize(12).text(kycformObj.getVoterId()[i], 270, 315);
        doc.moveDown().font('fonts/times.ttf').fontSize(12).text(smallLines, 260, 315);
        doc.font('Times-Roman').fontSize(12).text(kycformObj.getGasNo()[i], 270, 333);
        doc.moveDown().font('fonts/times.ttf').fontSize(12).text(normalLines, 260, 333);
        doc.font('Times-Roman').fontSize(12).text(kycformObj.getAadharNo()[i], 270, 353);
        doc.moveDown().font('fonts/times.ttf').fontSize(12).text(normalLines, 260, 353);
        doc.font('Times-Roman').fontSize(12).text(kycformObj.getGuarantorId()[i], 270, 373);
        doc.moveDown().font('fonts/times.ttf').fontSize(12).text(normalLines, 260, 373);
        doc.font('Times-Roman').fontSize(12).text(kycformObj.getPhoneNo()[i], 270, 393);
        doc.moveDown().font('fonts/times.ttf').fontSize(12).text(normalLines, 260, 393);
        doc.font('Times-Roman').fontSize(12).text(kycformObj.getReligion()[i], 270, 413);
        doc.moveDown().font('fonts/times.ttf').fontSize(12).text(normalLines, 260, 413);
        doc.font('Times-Roman').fontSize(12).text(kycformObj.getCaste()[i], 270, 432);
        doc.moveDown().font('fonts/times.ttf').fontSize(12).text(normalLines, 260, 432);
        doc.font('Times-Roman').fontSize(12).text(kycformObj.getMaritalStatus()[i], 270, 452);
        doc.moveDown().font('fonts/times.ttf').fontSize(12).text(normalLines, 260, 452);
        doc.font('Times-Roman').fontSize(12).text(kycformObj.getEducation()[i], 270, 472);
        doc.moveDown().font('fonts/times.ttf').fontSize(12).text(normalLines, 260, 472);
        doc.font('Times-Roman').fontSize(12).text(kycformObj.getLoanPurpose()[i], 270, 492);
        doc.moveDown().font('fonts/times.ttf').fontSize(12).text(normalLines, 260, 492);
        doc.font('Times-Roman').fontSize(12).text(kycformObj.getAddress()[i], 270, 512);
        doc.moveDown().font('fonts/times.ttf').fontSize(12).text(normalLines, 260, 512);
        doc.font('Times-Roman').fontSize(12).text(kycformObj.getPinCode()[i], 270, 535);
        doc.moveDown().font('fonts/times.ttf').fontSize(12).text(normalLines, 260, 535);
        doc.font('Times-Roman').fontSize(12).text(kycformObj.getHouse()[i], 270, 552);
        doc.moveDown().font('fonts/times.ttf').fontSize(12).text(normalLines, 260, 552);
        doc.font('Times-Roman').fontSize(12).text(kycformObj.getHouseSize()[i], 270, 572);
        doc.moveDown().font('fonts/times.ttf').fontSize(12).text(normalLines, 260, 572);
        doc.font('Times-Roman').fontSize(12).text(kycformObj.getHouseRoof()[i], 270, 592);
        doc.moveDown().font('fonts/times.ttf').fontSize(12).text(normalLines, 260, 592);
        doc.font('Times-Roman').fontSize(12).text(kycformObj.getHouseFloor()[i], 270, 612);
        doc.moveDown().font('fonts/times.ttf').fontSize(12).text(normalLines, 260, 612);
        doc.font('Times-Roman').fontSize(12).text(kycformObj.getToilet()[i], 270, 632);
        doc.moveDown().font('fonts/times.ttf').fontSize(12).text(normalLines, 260, 632);
        doc.font('Times-Roman').fontSize(12).text(kycformObj.getVehicle()[i], 270, 652);
        doc.moveDown().font('fonts/times.ttf').fontSize(12).text(normalLines, 260, 652);
        doc.font('Times-Roman').fontSize(12).text(kycformObj.getFamilyMonthlyIncome()[i], 270, 672);
        doc.moveDown().font('fonts/times.ttf').fontSize(12).text(normalLines, 260, 672);
        doc.font('Times-Roman').fontSize(12).text(kycformObj.getFamilyMonthlyExpense()[i], 270, 692);
        doc.moveDown().font('fonts/times.ttf').fontSize(12).text(normalLines, 260, 692);
        doc.font('Times-Roman').fontSize(12).text(kycformObj.getBankAccount()[i], 270, 712);
        doc.moveDown().font('fonts/times.ttf').fontSize(12).text(normalLines, 260, 712);
        doc.font('Times-Roman').fontSize(12).text(kycformObj.getSavings()[i], 270, 732);
        doc.moveDown().font('fonts/times.ttf').fontSize(12).text(normalLines, 260, 732);
        // Second page starts here
        doc.addPage().image(rootPath+"/public/images/KYC_Gujarati_2.png",0,0, {scale:0.25});
        var rowPosition = 75;
        var serialNo = 1;
        for (var j = 0; j < prospectClientFamilyFetchObj.getClient_id().length; j++) {
            if (prospectClientFamilyFetchObj.getClient_id()[j] == kycformObj.getClientId()[i]) {
                doc.font('Times-Roman').fontSize(12).text(serialNo, 95, rowPosition);
                doc.font('Times-Roman').fontSize(12).text(prospectClientFamilyFetchObj.getMember_name()[j], 130, rowPosition);
                doc.font('Times-Roman').fontSize(12).text(prospectClientFamilyFetchObj.getMember_gender()[j], 265, rowPosition);
                doc.font('Times-Roman').fontSize(12).text(prospectClientFamilyFetchObj.getMember_relationship()[j], 330, rowPosition);
                //doc.font('Times-Roman').fontSize(12).text(prospectClientFamilyFetchObj.getMember_dob()[j], 320, rowPosition);
                //doc.font('Times-Roman').fontSize(12).text(prospectClientFamilyFetchObj.getMember_education()[j], 375, rowPosition);
                doc.font('Times-Roman').fontSize(12).text(prospectClientFamilyFetchObj.getMember_occupation()[j], 410, rowPosition);
                doc.font('Times-Roman').fontSize(12).text(prospectClientFamilyFetchObj.getMember_income()[j], 515, rowPosition);
                rowPosition = rowPosition + 20;
                serialNo = serialNo + 1;
            }
        }
        var otherMfiNamePosition = 81;
        for (var m = 0; m < prospectClientOtherMfiFetchObj.getOtherMfiClientIdArray().length; m++) {
            if (prospectClientOtherMfiFetchObj.getOtherMfiClientIdArray()[m] == kycformObj.getClientId()[i]) {
                doc.font('fonts/times.ttf').fontSize(12).text(prospectClientOtherMfiFetchObj.getOtherMfiNameArrayDto()[m], otherMfiNamePosition, 248);
                otherMfiNamePosition = otherMfiNamePosition + 182;
            }
        }
        otherMFI = "1.____________________________ 2.___________________________ 3._______________________";
        doc.font('fonts/times.ttf').fontSize(12).text(otherMFI, 75, 248);
        doc.font('fonts/times.ttf').fontSize(12).text("_______________", 250, 168);
        doc.font('fonts/times.ttf').fontSize(12).text("_______________", 250, 188);
        doc.font('fonts/times.ttf').fontSize(12).text("________________________________", 56, 178);
        doc.font('fonts/times.ttf').fontSize(12).text("_______________________________________", 345, 178);
        doc.font('fonts/times.ttf').fontSize(12).text("_______________________________________________________________________________________", 56, 308);
        for (var z = 188; z <= 308; z = z + 10) {
            doc.font('fonts/times.ttf').fontSize(12).text("|", 55, z);
            doc.font('fonts/times.ttf').fontSize(12).text("|", 578, z);
        }
        doc.font('Times-Roman').fontSize(12).text(": " + kycformObj.getBranchName()[i], 110, 285);
        doc.font('Times-Roman').fontSize(12).text(": " + disbDateStr.getDate() + "/" + disbMonth + "/" + disbDateStr.getFullYear(), 110, 305);
        doc.font('Times-Roman').fontSize(12).text(": " + kycformObj.getBranchName()[i], 110, 464);
        doc.font('Times-Roman').fontSize(12).text(": " + disbDateStr.getDate() + "/" + disbMonth + "/" + disbDateStr.getFullYear(), 110, 481);
        doc.font('Times-Roman').fontSize(12).text(": " + kycformObj.getBranchName()[i], 120, 708);
        doc.font('Times-Roman').fontSize(12).text(": " + disbDateStr.getDate() + "/" + disbMonth + "/" + disbDateStr.getFullYear(), 120, 745);
    }
    doc.write(rootPath+"/public/GeneratedPDF/" + groupName + "_KYCform.pdf");
}
function generateKYCFormInTamil(groupName, kycformObj, prospectClientFamilyFetchObj, photo_clientId_array, captured_image_array, prospectClientOtherMfiFetchObj, disbDate,bcOfficeId) {
    var doc = new PDFDocument;
    var disbDateStr = new Date(disbDate);
    var disbMonth = disbDateStr.getMonth() + 1;
    for (i = 0; i < kycformObj.getClientId().length; i++) {
        if (i == 0) {
            doc.font('Times-Roman').fontSize(16).text(kycformObj.getClientName()[i], 210, 241);
        }
        else {
            doc.addPage().font('Times-Roman').fontSize(16).text(kycformObj.getClientName()[i], 210, 241);
        }
        customlog.info("photo_clientId_array: " + photo_clientId_array);
        var photoPosition = 420;
        var error = "false";
        for (var a = 0; a < photo_clientId_array.length; a++) {
            if (photo_clientId_array[a] == kycformObj.getClientId()[i]) {
                //fix to avoid empty images
                try {
                    doc.image(captured_image_array[a], photoPosition, 220, {fit: [100, 100]}).stroke();
                }
                catch (e) { //catches "Unknown image format" Error
                    error = "true";
                    customlog.info("caught exception: " + e);
                }
                if (error == "false")
                    photoPosition = photoPosition + 90;
            }
        }
        //Signature box
        doc.font('fonts/times.ttf').fontSize(12).text("_____________", 421, 329);
        doc.font('fonts/times.ttf').fontSize(12).text("_____________", 421, 359);
        doc.font('fonts/times.ttf').fontSize(12).text("_____________", 511, 329);
        doc.font('fonts/times.ttf').fontSize(12).text("_____________", 511, 359);
        for (var s = 339; s <= 359; s = s + 10) {
            doc.font('fonts/times.ttf').fontSize(12).text("|", 420, s);
            doc.font('fonts/times.ttf').fontSize(12).text("|", 498, s);
            doc.font('fonts/times.ttf').fontSize(12).text("|", 510, s);
            doc.font('fonts/times.ttf').fontSize(12).text("|", 588, s);
        }
        doc.font('Times-Roman').fontSize(12).text(kycformObj.getBranchName()[i], 182, 142);
        doc.font('Times-Roman').fontSize(14).text(kycformObj.getCenterName()[i], 210, 197);
        doc.font('Times-Roman').fontSize(14).text(kycformObj.getBranchName()[i], 210, 219);
        doc.font('Times-Roman').fontSize(14).text(kycformObj.getDateOfBirth()[i], 210, 263);
        doc.font('Times-Roman').fontSize(14).text(kycformObj.getGuardianRelationship()[i] + " / " + kycformObj.getGuardianName()[i] + " / " + kycformObj.getGuardianAge()[i], 210, 285);
        doc.font('Times-Roman').fontSize(14).text(kycformObj.getGuarantorName()[i] + " / " + kycformObj.getGuarantorAge()[i] + " / " + kycformObj.getGuarantorRelationship()[i], 210, 307);
        doc.font('Times-Roman').fontSize(14).text(kycformObj.getRationCardNo()[i], 210, 329);
        doc.font('Times-Roman').fontSize(14).text(kycformObj.getVoterId()[i], 210, 351);
        doc.font('Times-Roman').fontSize(14).text(kycformObj.getGasNo()[i], 210, 373);
        doc.font('Times-Roman').fontSize(14).text(kycformObj.getAadharNo()[i], 210, 395);
        doc.font('Times-Roman').fontSize(14).text(kycformObj.getGuarantorId()[i], 210, 417);
        doc.font('Times-Roman').fontSize(14).text(kycformObj.getPhoneNo()[i], 210, 439);
        doc.font('Times-Roman').fontSize(14).text(kycformObj.getReligion()[i], 210, 461);
        doc.font('Times-Roman').fontSize(14).text(kycformObj.getCaste()[i], 210, 483);
        doc.font('Times-Roman').fontSize(14).text(kycformObj.getMaritalStatus()[i], 210, 505);
        doc.font('Times-Roman').fontSize(14).text(kycformObj.getEducation()[i], 210, 527);
        doc.font('Times-Roman').fontSize(14).text(kycformObj.getLoanPurpose()[i], 210, 549);
        doc.font('Times-Roman').fontSize(14).text(kycformObj.getAddress()[i], 210, 571);
        doc.font('Times-Roman').fontSize(14).text(kycformObj.getPinCode()[i], 210, 593);
        doc.font('Times-Roman').fontSize(14).text(kycformObj.getHouse()[i], 210, 615);
        doc.font('Times-Roman').fontSize(14).text(kycformObj.getHouseSize()[i], 210, 637);
        doc.font('Times-Roman').fontSize(14).text(kycformObj.getHouseRoof()[i], 210, 659);
        doc.font('Times-Roman').fontSize(14).text(kycformObj.getHouseFloor()[i], 210, 681);
        doc.font('Times-Roman').fontSize(14).text(kycformObj.getToilet()[i], 210, 703);
        doc.font('Times-Roman').fontSize(14).text(kycformObj.getVehicle()[i], 210, 725);
        if(bcOfficeId==1){
             head = dbTableName.tenantCompanyName;
             doc.font('fonts/PalatinoBold.ttf').fontSize(12).text(head, 180, 30);
             doc.font('fonts/times.ttf').fontSize(10).text(dbTableName.tenantCompanyFKAName, 150, 42);
             title1 = '(Micro Finance Division)';
             doc.moveDown().font('fonts/times.ttf').fontSize(12).text(title1, 220, 52);
             apextam = 'vk@v!@vk@ ikf@nuhigdhd@!@ ypkpbll;';
             doc.font('fonts/Amudham.ttf').fontSize(22).text(apextam, 130, 65);
             addr1 = 'gjpt[ mYtyfk;- gp-27/ Ql;nfh fhydp/';
             doc.font('fonts/Amudham.ttf').fontSize(16).text(addr1, 115, 88);
             doc.font('fonts/times.ttf').fontSize(11).text('PSG', 360, 90);
             addr3 = ' kUj;Jtkid mUfpy;/';
             doc.font('fonts/Amudham.ttf').fontSize(16).text(addr3, 376, 88);
             addr2 = 'gPsnkL/ nfhaKj;J}h;-641004. nghd;-0422 4518475.';
             doc.font('fonts/Amudham.ttf').fontSize(16).text(addr2, 130, 107);
        }else if (bcOfficeId==2){
            //head = 'Ananya Finance for Inclusive Growth Private Limited';
            head = dbTableName.tenantBcCompanyName;
            doc.font('fonts/PalatinoBold.ttf').fontSize(14).text(head, 120, 30);
            //doc.font('fonts/times.ttf').fontSize(11).text('101,Sakar 1 Building, Nr.Gandhigram station, Ashram Road,', 160, 42);
            //title1 = 'Ahmedabad-380 009,Gujarat,India.';
            //doc.moveDown().font('fonts/times.ttf').fontSize(11).text(title1, 220, 52);
            apextam = 'mdd@ah igdhd@!@ `ghh@ ,d@FYh!pt@ f@nuhj@ g@iuntl@ ypkpbll;';
            doc.font('fonts/Amudham.ttf').fontSize(18).text(apextam, 110, 65);
            addr1 = "gjpt[ mYtyfk;- 101/rhQu@ 1 gpy@lp'@/";
            doc.font('fonts/Amudham.ttf').fontSize(16).text(addr1, 130, 88);
            addr3 = 'vd@Mu@.fhe@jpfpuhk@  !@nlrd@/';
            doc.font('fonts/Amudham.ttf').fontSize(16).text(addr3, 371, 88);
            addr2 = 'M#@uk@ nuhl@/ mQbkjhghj@-380609/ F$uhj@/ ,e@jpah.';
            doc.font('fonts/Amudham.ttf').fontSize(16).text(addr2, 150, 107);
        }
        bran = 'fpis mYtyfk; -';
        doc.font('fonts/Amudham.ttf').fontSize(16).text(bran, 60, 140);
        apexLines = "_______________________________________________________________________________________________";
        doc.font('fonts/times.ttf').fontSize(12).text(apexLines, 20, 150);
        smallLines = "___________________________________";
        normalLines = "__________________________________________________________________";
        tableLines = "_____________________________________________________________________________________________";
        title = 'cWg;gpdh; tpz;zg;g gotk;';
        doc.font('fonts/Agni.ttf').fontSize(16).text(title, 200, 170);
        centerNameNumber = 'ikaj;jpd; bgah;_vz;';
        doc.font('fonts/Amudham.ttf').fontSize(12).text(centerNameNumber, 30, 197);
        doc.font('fonts/times.ttf').fontSize(12).text(normalLines, 190, 197);
        branchNameNumber = 'fpisapd; bgah;_vz;';
        doc.font('fonts/Amudham.ttf').fontSize(12).text(branchNameNumber, 30, 219);
        doc.font('fonts/times.ttf').fontSize(12).text(smallLines, 190, 219);
        clientName = 'cWg;gpdh; bgah;';
        doc.font('fonts/Amudham.ttf').fontSize(12).text(clientName, 30, 241);
        doc.font('fonts/times.ttf').fontSize(12).text(smallLines, 190, 241);
        dateOfBirth = 'gpwe;j njjp';
        doc.font('fonts/Amudham.ttf').fontSize(12).text(dateOfBirth, 30, 263);
        doc.font('fonts/times.ttf').fontSize(12).text(smallLines, 190, 263);
        husbandDadNameAge = 'fzth;_je;ij_bgah;_taJ';
        doc.font('fonts/Amudham.ttf').fontSize(12).text(husbandDadNameAge, 30, 285);
        doc.font('fonts/times.ttf').fontSize(12).text(smallLines, 190, 285);
        guarantorNameAgeRelation = '$hkPd; jhuh;_bgah;_taJ_cwt[';
        doc.font('fonts/Amudham.ttf').fontSize(12).text(guarantorNameAgeRelation, 30, 307);
        doc.font('fonts/times.ttf').fontSize(12).text(smallLines, 190, 307);
        rationCardNumber = 'FLk;g ml;il vz;';
        doc.font('fonts/Amudham.ttf').fontSize(12).text(rationCardNumber, 30, 329);
        doc.font('fonts/times.ttf').fontSize(12).text(smallLines, 190, 329);
        voterId = 'thf;fhsh; milahs ml;il vz;';
        doc.font('fonts/Amudham.ttf').fontSize(12).text(voterId, 30, 351);
        doc.font('fonts/times.ttf').fontSize(12).text(smallLines, 190, 351);
        gasNum = 'nf!@ ,izg;g[ vz;';
        doc.font('fonts/Amudham.ttf').fontSize(12).text(gasNum, 30, 373);
        doc.font('fonts/times.ttf').fontSize(12).text(normalLines, 190, 373);
        aadharNum = 'Mjhh; vz;';
        doc.font('fonts/Amudham.ttf').fontSize(12).text(aadharNum, 30, 395);
        doc.font('fonts/times.ttf').fontSize(12).text(normalLines, 190, 395);
        guarantorId = '$hkPd; jhuh; milahs vz;';
        doc.font('fonts/Amudham.ttf').fontSize(12).text(guarantorId, 30, 417);
        doc.font('fonts/times.ttf').fontSize(12).text(normalLines, 190, 417);
        phoneNumber = 'bjhiyngrp vz;';
        doc.font('fonts/Amudham.ttf').fontSize(12).text(phoneNumber, 30, 439);
        doc.font('fonts/times.ttf').fontSize(12).text(normalLines, 190, 439);
        religion = 'kjk;';
        doc.font('fonts/Amudham.ttf').fontSize(12).text(religion, 30, 461);
        doc.font('fonts/times.ttf').fontSize(12).text(normalLines, 190, 461);
        caste = '$hjp';
        doc.font('fonts/Amudham.ttf').fontSize(12).text(caste, 30, 483);
        doc.font('fonts/times.ttf').fontSize(12).text(normalLines, 190, 483);
        maritalStatus = 'jpUkzk;';
        doc.font('fonts/Amudham.ttf').fontSize(12).text(maritalStatus, 30, 505);
        doc.font('fonts/times.ttf').fontSize(12).text(normalLines, 190, 505);
        education = 'fy;tpj;jFjp';
        doc.font('fonts/Amudham.ttf').fontSize(12).text(education, 30, 527);
        doc.font('fonts/times.ttf').fontSize(12).text(normalLines, 190, 527);
        loanReason = "fld; th';Fk; nehf;fk;";
        doc.font('fonts/Amudham.ttf').fontSize(12).text(loanReason, 30, 549);
        doc.font('fonts/times.ttf').fontSize(12).text(normalLines, 190, 549);
        address = 'Kfthp';
        doc.font('fonts/Amudham.ttf').fontSize(12).text(address, 30, 571);
        doc.font('fonts/times.ttf').fontSize(12).text(normalLines, 190, 571);
        pincode = 'm";ry; vz;';
        doc.font('fonts/Amudham.ttf').fontSize(12).text(pincode, 30, 593);
        doc.font('fonts/times.ttf').fontSize(12).text(normalLines, 190, 593);
        house = 'tPL';
        doc.font('fonts/Amudham.ttf').fontSize(12).text(house, 30, 615);
        doc.font('fonts/times.ttf').fontSize(12).text(normalLines, 190, 615);
        houseSize = 'tPl;od; mst[';
        doc.font('fonts/Amudham.ttf').fontSize(12).text(houseSize, 30, 637);
        doc.font('fonts/times.ttf').fontSize(12).text(normalLines, 190, 637);
        houseRoof = 'tPl;od; nky;g[wk;';
        doc.font('fonts/Amudham.ttf').fontSize(12).text(houseRoof, 30, 659);
        doc.font('fonts/times.ttf').fontSize(12).text(normalLines, 190, 659);
        houseFloor = 'tPl;od; fPH;jsk;';
        doc.font('fonts/Amudham.ttf').fontSize(12).text(houseFloor, 30, 681);
        doc.font('fonts/times.ttf').fontSize(12).text(normalLines, 190, 681);
        toilet = 'fHpg;gplk;';
        doc.font('fonts/Amudham.ttf').fontSize(12).text(toilet, 30, 703);
        doc.font('fonts/times.ttf').fontSize(12).text(normalLines, 190, 703);
        Vechicle = 'thfd cgnahfk;';
        doc.font('fonts/Amudham.ttf').fontSize(12).text(Vechicle, 30, 725);
        doc.font('fonts/times.ttf').fontSize(12).text(normalLines, 190, 725);
        //second page starting here
        familyMonthlyIncome = 'FLk;gj;jpd; khjtUkhdk;';
        doc.addPage().font('fonts/Amudham.ttf').fontSize(12).text(familyMonthlyIncome, 30, 40);
        doc.font('fonts/times.ttf').fontSize(12).text(normalLines, 190, 40);
        familyMonthlyExpense = 'FLk;gj;jpd; khjbryt[';
        doc.font('fonts/Amudham.ttf').fontSize(12).text(familyMonthlyExpense, 30, 62);
        doc.font('fonts/times.ttf').fontSize(12).text(normalLines, 190, 62);
        bankAccount = "t';fp fzf;F";
        doc.font('fonts/Amudham.ttf').fontSize(12).text(bankAccount, 30, 84);
        doc.font('fonts/times.ttf').fontSize(12).text(normalLines, 190, 84);
        savings = 'nrkpg;g[';
        doc.font('fonts/Amudham.ttf').fontSize(12).text(savings, 30, 106);
        doc.font('fonts/times.ttf').fontSize(12).text(normalLines, 190, 106);
        doc.font('Times-Roman').fontSize(14).text(kycformObj.getFamilyMonthlyIncome()[i], 210, 40);
        doc.font('Times-Roman').fontSize(14).text(kycformObj.getFamilyMonthlyExpense()[i], 210, 62);
        doc.font('Times-Roman').fontSize(14).text(kycformObj.getBankAccount()[i], 210, 84);
        doc.font('Times-Roman').fontSize(14).text(kycformObj.getSavings()[i], 210, 106);
        var rowPosition = 167;
        var serialNo = 1;
        for (var j = 0; j < prospectClientFamilyFetchObj.getClient_id().length; j++) {
            if (prospectClientFamilyFetchObj.getClient_id()[j] == kycformObj.getClientId()[i]) {
                doc.font('Times-Roman').fontSize(12).text(serialNo + ".", 45, rowPosition);
                doc.font('Times-Roman').fontSize(12).text(prospectClientFamilyFetchObj.getMember_name()[j], 75, rowPosition);
                doc.font('Times-Roman').fontSize(12).text(prospectClientFamilyFetchObj.getMember_gender()[j], 272, rowPosition);
                doc.font('Times-Roman').fontSize(12).text(prospectClientFamilyFetchObj.getMember_relationship()[j], 315, rowPosition);
                //doc.font('Times-Roman').fontSize(12).text(prospectClientFamilyFetchObj.getMember_dob()[j], 383, rowPosition);
                //doc.font('Times-Roman').fontSize(12).text(prospectClientFamilyFetchObj.getMember_education()[j], 415, rowPosition);
                doc.font('Times-Roman').fontSize(12).text(prospectClientFamilyFetchObj.getMember_occupation()[j], 415, rowPosition);
                doc.font('Times-Roman').fontSize(12).text(prospectClientFamilyFetchObj.getMember_income()[j], 545, rowPosition);
                rowPosition = rowPosition + 20;
                serialNo = serialNo + 1;
            }
        }
        tableTitle = 'FLk;gj;jfty;> tUkhdk;';
        doc.font('fonts/Agni.ttf').fontSize(16).text(tableTitle, 200, 128);
        //Horizontal Lines
        doc.font('fonts/times.ttf').fontSize(12).text(tableLines, 30, 130);
        doc.font('fonts/times.ttf').fontSize(12).text(tableLines, 30, 150);
        doc.font('fonts/times.ttf').fontSize(12).text(tableLines, 30, 170);
        doc.font('fonts/times.ttf').fontSize(12).text(tableLines, 30, 190);
        doc.font('fonts/times.ttf').fontSize(12).text(tableLines, 30, 210);
        doc.font('fonts/times.ttf').fontSize(12).text(tableLines, 30, 230);
        doc.font('fonts/times.ttf').fontSize(12).text(tableLines, 30, 250);
        //Vertical Lines
        for (var x = 140; x <= 250; x = x + 10) {
            doc.font('fonts/times.ttf').fontSize(12).text("|", 29, x);
            doc.font('fonts/times.ttf').fontSize(12).text("|", 69, x);
            doc.font('fonts/times.ttf').fontSize(12).text("|", 269, x);
            doc.font('fonts/times.ttf').fontSize(12).text("|", 309, x);
            //doc.font('fonts/times.ttf').fontSize(12).text("|", 379, x);
            doc.font('fonts/times.ttf').fontSize(12).text("|", 409, x);
            //doc.font('fonts/times.ttf').fontSize(12).text("|", 479, x);
            doc.font('fonts/times.ttf').fontSize(12).text("|", 539, x);
            doc.font('fonts/times.ttf').fontSize(12).text("|", 587, x);
        }
        sNo = "t.vz;";
        doc.font('fonts/Amudham.ttf').fontSize(14).text(sNo, 35, 148);
        familyMemberName = "FLk;g cWg;gpdh; bgah;";
        doc.font('fonts/Amudham.ttf').fontSize(14).text(familyMemberName, 110, 148);
        gender = "M/bg";
        doc.font('fonts/Amudham.ttf').fontSize(14).text(gender, 273, 148);
        relationShip = "cwt[";
        doc.font('fonts/Amudham.ttf').fontSize(14).text(relationShip, 358, 148);
        age = "taJ";
        //doc.font('fonts/Amudham.ttf').fontSize(14).text(age, 382, 148);
        education = "gog;g[";
        //doc.font('fonts/Amudham.ttf').fontSize(14).text(education, 435, 148);
        occupation = "bjhHpy;";
        doc.font('fonts/Amudham.ttf').fontSize(14).text(occupation, 465, 148);
        income = "tUkhdk;";
        doc.font('fonts/Amudham.ttf').fontSize(12).text(income, 543, 148);
        selfAgreement = "Ra xg;g[jy;";
        doc.font('fonts/Agni.ttf').fontSize(14).text(selfAgreement, 260, 270);
        point1 = "1. vdf;F ,d;iwa njjpapy; ve;j rpWfld; epWtdj;jpYk; ve;j xU flDk; epYitapy; ,y;iy.";
        doc.font('fonts/Amudham.ttf').fontSize(12).text(point1, 50, 295);
        point2 = "2. vdf;F ,d;iwa njjpapy; fPH;fz;l rpWfld; epWtd';fspd; fld; epYitapy; cs;sJ.";
        doc.font('fonts/Amudham.ttf').fontSize(12).text(point2, 50, 310);
        var otherMfiNamePosition = 61;
        for (var m = 0; m < prospectClientOtherMfiFetchObj.getOtherMfiClientIdArray().length; m++) {
            if (prospectClientOtherMfiFetchObj.getOtherMfiClientIdArray()[m] == kycformObj.getClientId()[i]) {
                doc.font('fonts/times.ttf').fontSize(12).text(prospectClientOtherMfiFetchObj.getOtherMfiNameArrayDto()[m], otherMfiNamePosition, 335);
                otherMfiNamePosition = otherMfiNamePosition + 127;
            }
        }
        otherMFI = "1.___________________ 2.___________________ 3.___________________ 4.___________________";
        doc.font('fonts/times.ttf').fontSize(12).text(otherMFI, 50, 335);
        agreement = "ehd; t';fp kw;Wk; t';fp rhuh() epWtd';fspy; th';fpa fldpd; jtidfis jpUk;gf; fl;l jtwpajpy;iy vd;W cWjpaspf;fpnwd;";
        doc.font('fonts/Amudham.ttf').fontSize(12).text(agreement, {width: 495, align: 'justify', paragraphGap: 12}, 350, 50);
        place = ",lk;";
        doc.font('fonts/Amudham.ttf').fontSize(12).text(place, 50, 375);
        date = "njjp";
        doc.font('fonts/Amudham.ttf').fontSize(12).text(date, 50, 390);
        doc.font('Times-Roman').fontSize(13).text(": " + kycformObj.getBranchName()[i], 80, 375);
        doc.font('Times-Roman').fontSize(13).text(": " + disbDateStr.getDate() + "/" + disbMonth + "/" + disbDateStr.getFullYear(), 80, 390);
        name = "bgah;";
        doc.font('fonts/Amudham.ttf').fontSize(12).text(name, 350, 375);
        signature = "ifbahg;gk;";
        doc.font('fonts/Amudham.ttf').fontSize(12).text(signature, 350, 390);
        doc.font('fonts/times.ttf').fontSize(12).text("________________", 250, 255);
        doc.font('fonts/times.ttf').fontSize(12).text("________________", 250, 270);
        doc.font('fonts/times.ttf').fontSize(12).text("____________________________________", 30, 265);
        doc.font('fonts/times.ttf').fontSize(12).text("________________________________________", 350, 265);
        doc.font('fonts/times.ttf').fontSize(12).text(tableLines, 30, 395);
        for (var z = 275; z <= 395; z = z + 10) {
            doc.font('fonts/times.ttf').fontSize(12).text("|", 29, z);
            doc.font('fonts/times.ttf').fontSize(12).text("|", 587, z);
        }
        pledge = "cWjp bkhHp";
        doc.font('fonts/Agni.ttf').fontSize(14).text(pledge, 260, 415);
        doc.font('fonts/times.ttf').fontSize(12).text("", 50, 416);
        pledgeContent = "FGtpy; cs;s xUth; jtid fl;lj;jtwpdhy; me;j bjhifia mtiu fl;l itg;nghk; my;yJ kw;w cWg;gpdh;fs; xd;W nrh;e;J md;nw fl;Lnthk; vd;W cskhw cWjp mspf;fpnwd; .j';fsplk; ehd; th';fpa flid xg;g[f;bfhz;lgo chpa fhyj;jpy; brYj;jptpLntd; vd;Wk; eph;thfk; vLf;Fk; Kotpw;F fl;Lg;gLntd; vd;Wk; cWjpaspf;fpnwd;. nkny bfhLf;fg;gl;l tpgu';fs; midj;Jk; cz;ik vd cWjp TWfpnwd;.jtWk; gl;rj;jpy; eph;thfk; vd;nky; rl;lhPjpahf eltof;if vLf;f chpik cz;L vd;gij mwpntd;.";
        doc.font('fonts/Amudham.ttf').fontSize(12).text(pledgeContent, {width: 495, indent: 40, align: 'justify', paragraphGap: 12}, 435, 50);
        doc.font('fonts/Amudham.ttf').fontSize(12).text(place, 50, 500);
        doc.font('fonts/Amudham.ttf').fontSize(12).text(date, 50, 515);
        doc.font('Times-Roman').fontSize(13).text(": " + kycformObj.getBranchName()[i], 80, 500);
        doc.font('Times-Roman').fontSize(13).text(": " + disbDateStr.getDate() + "/" + disbMonth + "/" + disbDateStr.getFullYear(), 80, 515);
        customerSignature = "cWg;gpdu; ifbahg;gk;";
        doc.font('fonts/Amudham.ttf').fontSize(12).text(customerSignature, 460, 515);
        doc.font('fonts/times.ttf').fontSize(12).text("", 50, 516);
        guarantorPledge = "fld; bjhifia cWg;gpdh; fl;l jtWk; gl;rj;jpy; $hkPd;jhuuhfpa ehd; mj;bjhiff;F KGg;bghWg;ngw;W brYj;jptpLntd; vd cWjpaspf;fpnwd;.";
        doc.font('fonts/Amudham.ttf').fontSize(12).text(guarantorPledge, {width: 495, indent: 40, align: 'justify', paragraphGap: 12}, 535, 50);
        guarantorSignature = "$hkPd;jhuh; ifbahg;gk;";
        doc.font('fonts/Amudham.ttf').fontSize(12).text(guarantorSignature, 460, 570);
        doc.font('fonts/Amudham.ttf').fontSize(12).text(relationShip, 460, 585);
        officeUseOnly = "mYtyf cgnahfj;jpw;F kl;Lk;";
        doc.font('fonts/Agni.ttf').fontSize(14).text(officeUseOnly, 190, 600);
        //Horizontal Lines
        doc.font('fonts/times.ttf').fontSize(12).text(tableLines, 30, 605);
        doc.font('fonts/times.ttf').fontSize(12).text(tableLines, 30, 625);
        doc.font('fonts/times.ttf').fontSize(12).text(tableLines, 30, 645);
        doc.font('fonts/times.ttf').fontSize(12).text(tableLines, 30, 665);
        doc.font('fonts/times.ttf').fontSize(12).text(tableLines, 30, 685);
        //Vertical Lines
        for (var y = 615; y <= 685; y = y + 10) {
            doc.font('fonts/times.ttf').fontSize(12).text("|", 29, y);
            doc.font('fonts/times.ttf').fontSize(12).text("|", 89, y);
            doc.font('fonts/times.ttf').fontSize(12).text("|", 199, y);
            doc.font('fonts/times.ttf').fontSize(12).text("|", 587, y);
        }
        doc.font('fonts/Amudham.ttf').fontSize(14).text(sNo, 43, 621);
        doc.font('fonts/times.ttf').fontSize(12).text("1.", 49, 638);
        doc.font('fonts/times.ttf').fontSize(12).text("2.", 49, 658);
        doc.font('fonts/times.ttf').fontSize(12).text("3.", 49, 678);
        details = "tpguk;";
        doc.font('fonts/Amudham.ttf').fontSize(12).text(details, 120, 621);
        photo = "g[ifg;glk;";
        doc.font('fonts/Amudham.ttf').fontSize(12).text(photo, 100, 638);
        identityProof = "milahsr; rhd;W";
        doc.font('fonts/Amudham.ttf').fontSize(12).text(identityProof, 100, 658);
        addressProof = "Kfthpr; rhd;W";
        doc.font('fonts/Amudham.ttf').fontSize(12).text(addressProof, 100, 678);
        documentDetails = "rhd;wpjH; tpguk;";
        doc.font('fonts/Amudham.ttf').fontSize(12).text(documentDetails, 360, 621);
        photoDetails = "tpz;zg;gjhuh;.......................................................................... _ $hkPd;jhuh;..........................................................................";
        doc.font('fonts/Amudham.ttf').fontSize(12).text(photoDetails, 220, 638);
        identityDetails = "thf;fhsh; milahs ml;il _ Xl;Leh; chpkk; _ FLk;g ml;il";
        doc.font('fonts/Amudham.ttf').fontSize(12).text(identityDetails, 220, 658);
        addressDetails = "thf;fhsh; milahs ml;il _ Xl;Leh; chpkk; _ FLk;g ml;il _ nf!; gpy;";
        doc.font('fonts/Amudham.ttf').fontSize(12).text(addressDetails, 220, 678);
        doc.font('fonts/Amudham.ttf').fontSize(12).text(place, 50, 710);
        doc.font('fonts/Amudham.ttf').fontSize(12).text(date, 50, 725);
        doc.font('Times-Roman').fontSize(13).text(": " + kycformObj.getBranchName()[i], 80, 710);
        doc.font('Times-Roman').fontSize(13).text(": " + disbDateStr.getDate() + "/" + disbMonth + "/" + disbDateStr.getFullYear(), 80, 725);
        branchOfficerSignature = "fsg;gzpahsh; ifbahg;gk;";
        doc.font('fonts/Amudham.ttf').fontSize(12).text(branchOfficerSignature, 230, 725);
        branchManagerSignature = "fpisnkyhsh; ifbahg;gk;";
        doc.font('fonts/Amudham.ttf').fontSize(12).text(branchManagerSignature, 460, 725);
    }
    doc.write(rootPath+"/public/GeneratedPDF/" + groupName + "_KYCform.pdf");
}

function generateMASLoanCardForm(groupName, kycformObj, prospectClientFamilyFetchObj, photo_clientId_array, captured_image_array, prospectClientOtherMfiFetchObj, disbDate) {
    var doc = new PDFDocument;
    var len=82;
    for (i = 0; i < kycformObj.getClientId().length; i++) {
        if(i <3){
            doc.font('Times-Roman').fontSize(10).text(kycformObj.getClientName()[i], 199, len+63);
            customlog.info("photo_clientId_array: " + photo_clientId_array);
            var photoPosition = 20;
            var error = "false";
            for (var a = 0; a < photo_clientId_array.length; a++) {
                if (photo_clientId_array[a] == kycformObj.getClientId()[i]) {
                    //fix to avoid empty images
                    try {
                        doc.image(captured_image_array[a], photoPosition, len+78, {fit: [100, 100]}).stroke();
                    }
                    catch (e) { //catches "Unknown image format" Error
                        error = "true";
                        customlog.info("caught exception: " + e);
                    }
                    if (error == "false")
                        photoPosition = photoPosition + 90;
                }
            }
            if(i==0){
                doc.font('Times-Roman').fontSize(10).text(kycformObj.getBranchName()[i], 81, len);
                doc.font('Times-Roman').fontSize(10).text(kycformObj.getFoName()[i], 250, len+17);
            }
            doc.font('Times-Roman').fontSize(10).text(kycformObj.getAddress()[i], 250, len+90);
            doc.font('Times-Roman').fontSize(10).text(kycformObj.getPinCode()[i], 449, len+146);
            doc.font('Times-Roman').fontSize(10).text(kycformObj.getPhoneNo()[i], 449, len+165);
            doc.font('Times-Roman').fontSize(10).text(kycformObj.getDateOfBirth()[i], 255, len+185);
            doc.font('Times-Roman').fontSize(10).text(kycformObj.getCaste()[i], 439, len+187);
            doc.font('Times-Roman').fontSize(10).text(kycformObj.getFamilyMonthlyIncome()[i], 89, len+205);
            doc.font('Times-Roman').fontSize(10).text(kycformObj.getFamilyMonthlyExpense()[i], 249, len+202);
            doc.font('Times-Roman').fontSize(10).text(kycformObj.getFamilyMonthlyIncome()[i], 419, len+202);
            doc.font('Times-Roman').fontSize(10).text(kycformObj.getLoanPurpose()[i], 99, len+217);
            len+=175;
        }
    }

        smallLines = "______________________";
        normalLines = "__________________________________________________________________";
        tableLines = "_____________________________________________________________________________________________";
        apexLines = "___________________________________________________________________________________________________________________";
        head = 'MSE/MICRO LOAN';
        doc.font('fonts/PalatinoBold.ttf').fontSize(14).text(head, 25, 30);
        doc.font('fonts/times.ttf').fontSize(10).text("Special Sanction Sign", 380, 30);
        doc.font('fonts/times.ttf').fontSize(10).text(smallLines, 470, 32);
        title1 = 'MAS Financial Services Limited';
        doc.moveDown().font('fonts/times.ttf').fontSize(10).text(title1, 25, 52);
        doc.font('fonts/times.ttf').fontSize(10).text("CIN No", 380, 45);
        doc.font('fonts/times.ttf').fontSize(10).text(smallLines, 470, 46);
        doc.font('fonts/times.ttf').fontSize(10).text("TAT No", 380, 60);
        doc.font('fonts/times.ttf').fontSize(10).text(smallLines, 470, 61);
        doc.font('fonts/times.ttf').fontSize(10).text("Centre", 25, 80);
        doc.font('fonts/times.ttf').fontSize(10).text(smallLines, 80, 81);
        doc.font('fonts/times.ttf').fontSize(10).text("BK Sr No", 200, 80);
        doc.font('fonts/times.ttf').fontSize(10).text(smallLines, 240, 81);
        doc.font('fonts/times.ttf').fontSize(10).text("Agreement ID", 380, 80);
        doc.font('fonts/times.ttf').fontSize(10).text(smallLines, 470, 81);
        doc.font('fonts/times.ttf').fontSize(10).text("Module", 25, 100);
        doc.font('fonts/times.ttf').fontSize(10).text(smallLines, 80, 101);
        doc.font('fonts/times.ttf').fontSize(10).text("Executive", 200, 100);
        doc.font('fonts/times.ttf').fontSize(10).text(smallLines, 240, 101);
        doc.font('fonts/times.ttf').fontSize(10).text("Source", 380, 100);
        doc.font('fonts/times.ttf').fontSize(10).text(smallLines, 470, 101);
        doc.font('fonts/times.ttf').fontSize(10).text("Scheme Code", 25, 120);
        doc.font('fonts/times.ttf').fontSize(10).text(smallLines, 80, 121);
        doc.font('fonts/times.ttf').fontSize(10).text("Screen No", 200, 120);
        doc.font('fonts/times.ttf').fontSize(10).text(smallLines, 240, 121);
        doc.font('fonts/times.ttf').fontSize(10).text("Category", 380, 120);
        doc.font('fonts/times.ttf').fontSize(10).text("Business Associate", 470, 121);
        doc.font('fonts/times.ttf').fontSize(10).text(smallLines, 470, 121);
        doc.font('fonts/times.ttf').fontSize(10).text(apexLines, 20, 130);

        var temp =145;
        for(var i =0 ; i<499;i=temp){
            doc.font('fonts/times.ttf').fontSize(10).text("APPLICANT", 25, temp);
            doc.font('fonts/times.ttf').fontSize(10).text("Name", 130, temp+1);
            doc.font('fonts/times.ttf').fontSize(10).text(smallLines, 200, temp+1);
            doc.font('fonts/times.ttf').fontSize(10).text(smallLines, 320, temp+1);
            doc.font('fonts/times.ttf').fontSize(10).text(smallLines, 450, temp+1);
            doc.font('fonts/times.ttf').fontSize(10).text("First Name", 200, temp+10);
            doc.font('fonts/times.ttf').fontSize(10).text("Middle Name", 320, temp+10);
            doc.font('fonts/times.ttf').fontSize(10).text("Last Name", 450, temp+11);
            doc.font('fonts/times.ttf').fontSize(10).text("Residence", 130, temp+25);
            doc.font('fonts/times.ttf').fontSize(10).text("Block No", 200, temp+26);
            doc.font('fonts/times.ttf').fontSize(10).text(smallLines, 250, temp+27);
            //doc.font('fonts/times.ttf').fontSize(10).text("Flat/Soc Name", 370, 173);
            doc.font('fonts/times.ttf').fontSize(10).text(smallLines, 370, temp+28);
            doc.font('fonts/times.ttf').fontSize(10).text(smallLines, 450, temp+28);
            doc.font('fonts/times.ttf').fontSize(10).text("Area", 200, temp+45);
            doc.font('fonts/times.ttf').fontSize(10).text(smallLines, 250, temp+46);
            doc.font('fonts/times.ttf').fontSize(10).text("Land Mark", 370, temp+47);
            doc.font('fonts/times.ttf').fontSize(10).text(smallLines, 450, temp+47);
            doc.font('fonts/times.ttf').fontSize(10).text(" ", 200, temp+65);
            doc.font('fonts/times.ttf').fontSize(10).text(smallLines, 250, temp+66);
            doc.font('fonts/times.ttf').fontSize(10).text("District", 370, temp+67);
            doc.font('fonts/times.ttf').fontSize(10).text(smallLines, 450, temp+66);
            doc.font('fonts/times.ttf').fontSize(10).text("Signature of the customer", 20, temp+100);
            doc.font('fonts/times.ttf').fontSize(10).text("City", 200, temp+81);
            doc.font('fonts/times.ttf').fontSize(10).text(smallLines, 250, temp+82);
            doc.font('fonts/times.ttf').fontSize(10).text("Pincode", 370, temp+83);
            doc.font('fonts/times.ttf').fontSize(10).text(smallLines, 450, temp+84);
            doc.font('fonts/times.ttf').fontSize(10).text("Phone(LL)", 135, temp+100);
            doc.font('fonts/times.ttf').fontSize(10).text(smallLines, 200, temp+101);
            doc.font('fonts/times.ttf').fontSize(10).text("Mobile", 370, temp+102);
            doc.font('fonts/times.ttf').fontSize(10).text(smallLines, 450, temp+103);
            doc.font('fonts/times.ttf').fontSize(10).text("Business Category", 30, temp+120);
            doc.font('fonts/times.ttf').fontSize(10).text(smallLines, 90, temp+121);
            doc.font('fonts/times.ttf').fontSize(10).text("Date of Birth", 200, temp+122);
            doc.font('fonts/times.ttf').fontSize(10).text(smallLines, 250, temp+123);
            doc.font('fonts/times.ttf').fontSize(10).text("Caste", 370, temp+124);
            doc.font('fonts/times.ttf').fontSize(10).text(smallLines, 420, temp+125);
            doc.font('fonts/times.ttf').fontSize(10).text("Gross Income", 30, temp+140);
            doc.font('fonts/times.ttf').fontSize(10).text(smallLines, 90, temp+140);
            doc.font('fonts/times.ttf').fontSize(10).text("Expenses", 200, temp+140);
            doc.font('fonts/times.ttf').fontSize(10).text(smallLines, 250, temp+140);
            doc.font('fonts/times.ttf').fontSize(10).text("Net Income", 370, temp+140);
            doc.font('fonts/times.ttf').fontSize(10).text(smallLines, 420, temp+140);
            doc.font('fonts/times.ttf').fontSize(10).text("Purpose of Loan", 30, temp+155);
            doc.font('fonts/times.ttf').fontSize(10).text(smallLines, 100, temp+155);
            doc.font('fonts/times.ttf').fontSize(10).text("Signature", 300, temp+155);
            doc.font('fonts/times.ttf').fontSize(10).text(smallLines, 350, temp+155);
            doc.font('fonts/times.ttf').fontSize(10).text(apexLines, 20, temp+160);
            temp += 175;
        }
        //var length =(kycformObj.getClientId().length/4).toFixed()
        //var length =2;
        //for(var j=0;j<length;j++){
            doc.addPage();
            var temp =30;
            for(var i =0 ; i<599;i=temp){
                doc.font('fonts/times.ttf').fontSize(10).text("APPLICANT", 25, temp);
                doc.font('fonts/times.ttf').fontSize(10).text("Name", 130, temp+1);
                doc.font('fonts/times.ttf').fontSize(10).text(smallLines, 200, temp+1);
                doc.font('fonts/times.ttf').fontSize(10).text(smallLines, 320, temp+1);
                doc.font('fonts/times.ttf').fontSize(10).text(smallLines, 450, temp+1);
                doc.font('fonts/times.ttf').fontSize(10).text("First Name", 200, temp+10);
                doc.font('fonts/times.ttf').fontSize(10).text("Middle Name", 320, temp+10);
                doc.font('fonts/times.ttf').fontSize(10).text("Last Name", 450, temp+11);
                doc.font('fonts/times.ttf').fontSize(10).text("Residence", 130, temp+25);
                doc.font('fonts/times.ttf').fontSize(10).text("Block No", 200, temp+26);
                doc.font('fonts/times.ttf').fontSize(10).text(smallLines, 250, temp+27);
                //doc.font('fonts/times.ttf').fontSize(10).text("Flat/Soc Name", 370, 173);
                doc.font('fonts/times.ttf').fontSize(10).text(smallLines, 370, temp+28);
                doc.font('fonts/times.ttf').fontSize(10).text(smallLines, 450, temp+28);
                doc.font('fonts/times.ttf').fontSize(10).text("Area", 200, temp+45);
                doc.font('fonts/times.ttf').fontSize(10).text(smallLines, 250, temp+46);
                doc.font('fonts/times.ttf').fontSize(10).text("Land Mark", 370, temp+47);
                doc.font('fonts/times.ttf').fontSize(10).text(smallLines, 450, temp+47);
                doc.font('fonts/times.ttf').fontSize(10).text(" ", 200, temp+65);
                doc.font('fonts/times.ttf').fontSize(10).text(smallLines, 250, temp+66);
                doc.font('fonts/times.ttf').fontSize(10).text("District", 370, temp+67);
                doc.font('fonts/times.ttf').fontSize(10).text(smallLines, 450, temp+66);
                doc.font('fonts/times.ttf').fontSize(10).text("Signature of the customer", 20, temp+100);
                doc.font('fonts/times.ttf').fontSize(10).text("City", 200, temp+81);
                doc.font('fonts/times.ttf').fontSize(10).text(smallLines, 250, temp+82);
                doc.font('fonts/times.ttf').fontSize(10).text("Pincode", 370, temp+83);
                doc.font('fonts/times.ttf').fontSize(10).text(smallLines, 450, temp+84);
                doc.font('fonts/times.ttf').fontSize(10).text("Phone(LL)", 135, temp+100);
                doc.font('fonts/times.ttf').fontSize(10).text(smallLines, 200, temp+101);
                doc.font('fonts/times.ttf').fontSize(10).text("Mobile", 370, temp+102);
                doc.font('fonts/times.ttf').fontSize(10).text(smallLines, 450, temp+103);
                doc.font('fonts/times.ttf').fontSize(10).text("Business Category", 30, temp+120);
                doc.font('fonts/times.ttf').fontSize(10).text(smallLines, 90, temp+121);
                doc.font('fonts/times.ttf').fontSize(10).text("Date of Birth", 200, temp+122);
                doc.font('fonts/times.ttf').fontSize(10).text(smallLines, 250, temp+123);
                doc.font('fonts/times.ttf').fontSize(10).text("Caste", 370, temp+124);
                doc.font('fonts/times.ttf').fontSize(10).text(smallLines, 420, temp+125);
                doc.font('fonts/times.ttf').fontSize(10).text("Gross Income", 30, temp+140);
                doc.font('fonts/times.ttf').fontSize(10).text(smallLines, 90, temp+140);
                doc.font('fonts/times.ttf').fontSize(10).text("Expenses", 200, temp+140);
                doc.font('fonts/times.ttf').fontSize(10).text(smallLines, 250, temp+140);
                doc.font('fonts/times.ttf').fontSize(10).text("Net Income", 370, temp+140);
                doc.font('fonts/times.ttf').fontSize(10).text(smallLines, 420, temp+140);
                doc.font('fonts/times.ttf').fontSize(10).text("Purpose of Loan", 30, temp+155);
                doc.font('fonts/times.ttf').fontSize(10).text(smallLines, 100, temp+155);
                doc.font('fonts/times.ttf').fontSize(10).text("Signature", 300, temp+155);
                doc.font('fonts/times.ttf').fontSize(10).text(smallLines, 350, temp+155);
                doc.font('fonts/times.ttf').fontSize(10).text(apexLines, 20, temp+160);
                temp += 175;
            }
            var len=20;
            for (var itreateOne =3; itreateOne < kycformObj.getClientId().length; itreateOne++) {
                if(itreateOne <7){
                    doc.font('Times-Roman').fontSize(10).text(kycformObj.getClientName()[itreateOne], 199, len+11);
                    customlog.info("photo_clientId_array: " + photo_clientId_array);
                    var photoPosition = 20;
                    var error = "false";
                    for (var a = 0; a < photo_clientId_array.length; a++) {
                        if (photo_clientId_array[a] == kycformObj.getClientId()[itreateOne]) {
                            //fix to avoid empty images
                            try {
                                doc.image(captured_image_array[a], photoPosition, len+26, {fit: [100, 100]}).stroke();
                            }
                            catch (e) { //catches "Unknown image format" Error
                                error = "true";
                                customlog.info("caught exception: " + e);
                            }
                            if (error == "false")
                                photoPosition = photoPosition + 90;
                        }
                    }
                    doc.font('Times-Roman').fontSize(10).text(kycformObj.getAddress()[itreateOne], 250, len+38);
                    doc.font('Times-Roman').fontSize(10).text(kycformObj.getPinCode()[itreateOne], 449, len+94);
                    doc.font('Times-Roman').fontSize(10).text(kycformObj.getPhoneNo()[itreateOne], 449, len+113);
                    doc.font('Times-Roman').fontSize(10).text(kycformObj.getDateOfBirth()[itreateOne], 255, len+133);
                    doc.font('Times-Roman').fontSize(10).text(kycformObj.getCaste()[itreateOne], 439, len+135);
                    doc.font('Times-Roman').fontSize(10).text(kycformObj.getFamilyMonthlyIncome()[itreateOne], 89, len+153);
                    doc.font('Times-Roman').fontSize(10).text(kycformObj.getFamilyMonthlyExpense()[itreateOne], 249, len+150);
                    doc.font('Times-Roman').fontSize(10).text(kycformObj.getFamilyMonthlyIncome()[itreateOne], 419, len+150);
                    doc.font('Times-Roman').fontSize(10).text(kycformObj.getLoanPurpose()[itreateOne], 99, len+165);
                    len+=175;
                }
            //}
        }
    doc.addPage();
    var temp =30;
    for(var i =0 ; i<599;i=temp){
        doc.font('fonts/times.ttf').fontSize(10).text("APPLICANT", 25, temp);
        doc.font('fonts/times.ttf').fontSize(10).text("Name", 130, temp+1);
        doc.font('fonts/times.ttf').fontSize(10).text(smallLines, 200, temp+1);
        doc.font('fonts/times.ttf').fontSize(10).text(smallLines, 320, temp+1);
        doc.font('fonts/times.ttf').fontSize(10).text(smallLines, 450, temp+1);
        doc.font('fonts/times.ttf').fontSize(10).text("First Name", 200, temp+10);
        doc.font('fonts/times.ttf').fontSize(10).text("Middle Name", 320, temp+10);
        doc.font('fonts/times.ttf').fontSize(10).text("Last Name", 450, temp+11);
        doc.font('fonts/times.ttf').fontSize(10).text("Residence", 130, temp+25);
        doc.font('fonts/times.ttf').fontSize(10).text("Block No", 200, temp+26);
        doc.font('fonts/times.ttf').fontSize(10).text(smallLines, 250, temp+27);
        //doc.font('fonts/times.ttf').fontSize(10).text("Flat/Soc Name", 370, 173);
        doc.font('fonts/times.ttf').fontSize(10).text(smallLines, 370, temp+28);
        doc.font('fonts/times.ttf').fontSize(10).text(smallLines, 450, temp+28);
        doc.font('fonts/times.ttf').fontSize(10).text("Area", 200, temp+45);
        doc.font('fonts/times.ttf').fontSize(10).text(smallLines, 250, temp+46);
        doc.font('fonts/times.ttf').fontSize(10).text("Land Mark", 370, temp+47);
        doc.font('fonts/times.ttf').fontSize(10).text(smallLines, 450, temp+47);
        doc.font('fonts/times.ttf').fontSize(10).text(" ", 200, temp+65);
        doc.font('fonts/times.ttf').fontSize(10).text(smallLines, 250, temp+66);
        doc.font('fonts/times.ttf').fontSize(10).text("District", 370, temp+67);
        doc.font('fonts/times.ttf').fontSize(10).text(smallLines, 450, temp+66);
        doc.font('fonts/times.ttf').fontSize(10).text("Signature of the customer", 20, temp+100);
        doc.font('fonts/times.ttf').fontSize(10).text("City", 200, temp+81);
        doc.font('fonts/times.ttf').fontSize(10).text(smallLines, 250, temp+82);
        doc.font('fonts/times.ttf').fontSize(10).text("Pincode", 370, temp+83);
        doc.font('fonts/times.ttf').fontSize(10).text(smallLines, 450, temp+84);
        doc.font('fonts/times.ttf').fontSize(10).text("Phone(LL)", 135, temp+100);
        doc.font('fonts/times.ttf').fontSize(10).text(smallLines, 200, temp+101);
        doc.font('fonts/times.ttf').fontSize(10).text("Mobile", 370, temp+102);
        doc.font('fonts/times.ttf').fontSize(10).text(smallLines, 450, temp+103);
        doc.font('fonts/times.ttf').fontSize(10).text("Business Category", 30, temp+120);
        doc.font('fonts/times.ttf').fontSize(10).text(smallLines, 90, temp+121);
        doc.font('fonts/times.ttf').fontSize(10).text("Date of Birth", 200, temp+122);
        doc.font('fonts/times.ttf').fontSize(10).text(smallLines, 250, temp+123);
        doc.font('fonts/times.ttf').fontSize(10).text("Caste", 370, temp+124);
        doc.font('fonts/times.ttf').fontSize(10).text(smallLines, 420, temp+125);
        doc.font('fonts/times.ttf').fontSize(10).text("Gross Income", 30, temp+140);
        doc.font('fonts/times.ttf').fontSize(10).text(smallLines, 90, temp+140);
        doc.font('fonts/times.ttf').fontSize(10).text("Expenses", 200, temp+140);
        doc.font('fonts/times.ttf').fontSize(10).text(smallLines, 250, temp+140);
        doc.font('fonts/times.ttf').fontSize(10).text("Net Income", 370, temp+140);
        doc.font('fonts/times.ttf').fontSize(10).text(smallLines, 420, temp+140);
        doc.font('fonts/times.ttf').fontSize(10).text("Purpose of Loan", 30, temp+155);
        doc.font('fonts/times.ttf').fontSize(10).text(smallLines, 100, temp+155);
        doc.font('fonts/times.ttf').fontSize(10).text("Signature", 300, temp+155);
        doc.font('fonts/times.ttf').fontSize(10).text(smallLines, 350, temp+155);
        doc.font('fonts/times.ttf').fontSize(10).text(apexLines, 20, temp+160);
        temp += 175;
    }
    var len=20;
    for (var itreateOne =7; itreateOne < kycformObj.getClientId().length; itreateOne++) {
        if(itreateOne <11){
            doc.font('Times-Roman').fontSize(10).text(kycformObj.getClientName()[itreateOne], 199, len+11);
            customlog.info("photo_clientId_array: " + photo_clientId_array);
            var photoPosition = 20;
            var error = "false";
            for (var a = 0; a < photo_clientId_array.length; a++) {
                if (photo_clientId_array[a] == kycformObj.getClientId()[itreateOne]) {
                    //fix to avoid empty images
                    try {
                        doc.image(captured_image_array[a], photoPosition, len+26, {fit: [100, 100]}).stroke();
                    }
                    catch (e) { //catches "Unknown image format" Error
                        error = "true";
                        customlog.info("caught exception: " + e);
                    }
                    if (error == "false")
                        photoPosition = photoPosition + 90;
                }
            }
            doc.font('Times-Roman').fontSize(10).text(kycformObj.getAddress()[itreateOne], 250, len+38);
            doc.font('Times-Roman').fontSize(10).text(kycformObj.getPinCode()[itreateOne], 449, len+94);
            doc.font('Times-Roman').fontSize(10).text(kycformObj.getPhoneNo()[itreateOne], 449, len+113);
            doc.font('Times-Roman').fontSize(10).text(kycformObj.getDateOfBirth()[itreateOne], 255, len+133);
            doc.font('Times-Roman').fontSize(10).text(kycformObj.getCaste()[itreateOne], 439, len+135);
            doc.font('Times-Roman').fontSize(10).text(kycformObj.getFamilyMonthlyIncome()[itreateOne], 89, len+153);
            doc.font('Times-Roman').fontSize(10).text(kycformObj.getFamilyMonthlyExpense()[itreateOne], 249, len+150);
            doc.font('Times-Roman').fontSize(10).text(kycformObj.getFamilyMonthlyIncome()[itreateOne], 419, len+150);
            doc.font('Times-Roman').fontSize(10).text(kycformObj.getLoanPurpose()[itreateOne], 99, len+165);
            len+=175;
        }
        //}
    }
        if(kycformObj.getClientId().length>11){
            doc.addPage();
            var len=82;
            for (i = 11; i < kycformObj.getClientId().length; i++) {
                if(i <14){
                    doc.font('Times-Roman').fontSize(10).text(kycformObj.getClientName()[i], 199, len+63);
                    customlog.info("photo_clientId_array: " + photo_clientId_array);
                    var photoPosition = 20;
                    var error = "false";
                    for (var a = 0; a < photo_clientId_array.length; a++) {
                        if (photo_clientId_array[a] == kycformObj.getClientId()[i]) {
                            //fix to avoid empty images
                            try {
                                doc.image(captured_image_array[a], photoPosition, len+78, {fit: [100, 100]}).stroke();
                            }
                            catch (e) { //catches "Unknown image format" Error
                                error = "true";
                                customlog.info("caught exception: " + e);
                            }
                            if (error == "false")
                                photoPosition = photoPosition + 90;
                        }
                    }
                    if(i==11){
                        doc.font('Times-Roman').fontSize(10).text(kycformObj.getBranchName()[i], 81, len);
                    }
                    doc.font('Times-Roman').fontSize(10).text(kycformObj.getAddress()[i], 250, len+90);
                    doc.font('Times-Roman').fontSize(10).text(kycformObj.getPinCode()[i], 449, len+146);
                    doc.font('Times-Roman').fontSize(10).text(kycformObj.getPhoneNo()[i], 449, len+165);
                    doc.font('Times-Roman').fontSize(10).text(kycformObj.getDateOfBirth()[i], 255, len+185);
                    doc.font('Times-Roman').fontSize(10).text(kycformObj.getCaste()[i], 439, len+187);
                    doc.font('Times-Roman').fontSize(10).text(kycformObj.getFamilyMonthlyIncome()[i], 89, len+205);
                    doc.font('Times-Roman').fontSize(10).text(kycformObj.getFamilyMonthlyExpense()[i], 249, len+202);
                    doc.font('Times-Roman').fontSize(10).text(kycformObj.getFamilyMonthlyIncome()[i], 419, len+202);
                    doc.font('Times-Roman').fontSize(10).text(kycformObj.getLoanPurpose()[i], 99, len+217);
                    len+=175;
                }
            }
            doc.font('fonts/PalatinoBold.ttf').fontSize(14).text(head, 25, 30);
            doc.font('fonts/times.ttf').fontSize(10).text("Special Sanction Sign", 380, 30);
            doc.font('fonts/times.ttf').fontSize(10).text(smallLines, 470, 32);
            title1 = 'MAS Financial Services Limited';
            doc.moveDown().font('fonts/times.ttf').fontSize(10).text(title1, 25, 52);
            doc.font('fonts/times.ttf').fontSize(10).text("CIN No", 380, 45);
            doc.font('fonts/times.ttf').fontSize(10).text(smallLines, 470, 46);
            doc.font('fonts/times.ttf').fontSize(10).text("TAT No", 380, 60);
            doc.font('fonts/times.ttf').fontSize(10).text(smallLines, 470, 61);
            doc.font('fonts/times.ttf').fontSize(10).text("Centre", 25, 80);
            doc.font('fonts/times.ttf').fontSize(10).text(smallLines, 80, 81);
            doc.font('fonts/times.ttf').fontSize(10).text("BK Sr No", 200, 80);
            doc.font('fonts/times.ttf').fontSize(10).text(smallLines, 240, 81);
            doc.font('fonts/times.ttf').fontSize(10).text("Agreement ID", 380, 80);
            doc.font('fonts/times.ttf').fontSize(10).text(smallLines, 470, 81);
            doc.font('fonts/times.ttf').fontSize(10).text("Module", 25, 100);
            doc.font('fonts/times.ttf').fontSize(10).text(smallLines, 80, 101);
            doc.font('fonts/times.ttf').fontSize(10).text("Executive", 200, 100);
            doc.font('fonts/times.ttf').fontSize(10).text(smallLines, 240, 101);
            doc.font('fonts/times.ttf').fontSize(10).text("Source", 380, 100);
            doc.font('fonts/times.ttf').fontSize(10).text(smallLines, 470, 101);
            doc.font('fonts/times.ttf').fontSize(10).text("Scheme Code", 25, 120);
            doc.font('fonts/times.ttf').fontSize(10).text(smallLines, 80, 121);
            doc.font('fonts/times.ttf').fontSize(10).text("Screen No", 200, 120);
            doc.font('fonts/times.ttf').fontSize(10).text(smallLines, 240, 121);
            doc.font('fonts/times.ttf').fontSize(10).text("Category", 380, 120);
            doc.font('fonts/times.ttf').fontSize(10).text("Business Associate", 470, 121);
            doc.font('fonts/times.ttf').fontSize(10).text(smallLines, 470, 121);
            doc.font('fonts/times.ttf').fontSize(10).text(apexLines, 20, 130);

            var temp =145;
            for(var i =0 ; i<499;i=temp){
                doc.font('fonts/times.ttf').fontSize(10).text("APPLICANT", 25, temp);
                doc.font('fonts/times.ttf').fontSize(10).text("Name", 130, temp+1);
                doc.font('fonts/times.ttf').fontSize(10).text(smallLines, 200, temp+1);
                doc.font('fonts/times.ttf').fontSize(10).text(smallLines, 320, temp+1);
                doc.font('fonts/times.ttf').fontSize(10).text(smallLines, 450, temp+1);
                doc.font('fonts/times.ttf').fontSize(10).text("First Name", 200, temp+10);
                doc.font('fonts/times.ttf').fontSize(10).text("Middle Name", 320, temp+10);
                doc.font('fonts/times.ttf').fontSize(10).text("Last Name", 450, temp+11);
                doc.font('fonts/times.ttf').fontSize(10).text("Residence", 130, temp+25);
                doc.font('fonts/times.ttf').fontSize(10).text("Block No", 200, temp+26);
                doc.font('fonts/times.ttf').fontSize(10).text(smallLines, 250, temp+27);
                //doc.font('fonts/times.ttf').fontSize(10).text("Flat/Soc Name", 370, 173);
                doc.font('fonts/times.ttf').fontSize(10).text(smallLines, 370, temp+28);
                doc.font('fonts/times.ttf').fontSize(10).text(smallLines, 450, temp+28);
                doc.font('fonts/times.ttf').fontSize(10).text("Area", 200, temp+45);
                doc.font('fonts/times.ttf').fontSize(10).text(smallLines, 250, temp+46);
                doc.font('fonts/times.ttf').fontSize(10).text("Land Mark", 370, temp+47);
                doc.font('fonts/times.ttf').fontSize(10).text(smallLines, 450, temp+47);
                doc.font('fonts/times.ttf').fontSize(10).text(" ", 200, temp+65);
                doc.font('fonts/times.ttf').fontSize(10).text(smallLines, 250, temp+66);
                doc.font('fonts/times.ttf').fontSize(10).text("District", 370, temp+67);
                doc.font('fonts/times.ttf').fontSize(10).text(smallLines, 450, temp+66);
                doc.font('fonts/times.ttf').fontSize(10).text("Signature of the customer", 20, temp+100);
                doc.font('fonts/times.ttf').fontSize(10).text("City", 200, temp+81);
                doc.font('fonts/times.ttf').fontSize(10).text(smallLines, 250, temp+82);
                doc.font('fonts/times.ttf').fontSize(10).text("Pincode", 370, temp+83);
                doc.font('fonts/times.ttf').fontSize(10).text(smallLines, 450, temp+84);
                doc.font('fonts/times.ttf').fontSize(10).text("Phone(LL)", 135, temp+100);
                doc.font('fonts/times.ttf').fontSize(10).text(smallLines, 200, temp+101);
                doc.font('fonts/times.ttf').fontSize(10).text("Mobile", 370, temp+102);
                doc.font('fonts/times.ttf').fontSize(10).text(smallLines, 450, temp+103);
                doc.font('fonts/times.ttf').fontSize(10).text("Business Category", 30, temp+120);
                doc.font('fonts/times.ttf').fontSize(10).text(smallLines, 90, temp+121);
                doc.font('fonts/times.ttf').fontSize(10).text("Date of Birth", 200, temp+122);
                doc.font('fonts/times.ttf').fontSize(10).text(smallLines, 250, temp+123);
                doc.font('fonts/times.ttf').fontSize(10).text("Caste", 370, temp+124);
                doc.font('fonts/times.ttf').fontSize(10).text(smallLines, 420, temp+125);
                doc.font('fonts/times.ttf').fontSize(10).text("Gross Income", 30, temp+140);
                doc.font('fonts/times.ttf').fontSize(10).text(smallLines, 90, temp+140);
                doc.font('fonts/times.ttf').fontSize(10).text("Expenses", 200, temp+140);
                doc.font('fonts/times.ttf').fontSize(10).text(smallLines, 250, temp+140);
                doc.font('fonts/times.ttf').fontSize(10).text("Net Income", 370, temp+140);
                doc.font('fonts/times.ttf').fontSize(10).text(smallLines, 420, temp+140);
                doc.font('fonts/times.ttf').fontSize(10).text("Purpose of Loan", 30, temp+155);
                doc.font('fonts/times.ttf').fontSize(10).text(smallLines, 100, temp+155);
                doc.font('fonts/times.ttf').fontSize(10).text("Signature", 300, temp+155);
                doc.font('fonts/times.ttf').fontSize(10).text(smallLines, 350, temp+155);
                doc.font('fonts/times.ttf').fontSize(10).text(apexLines, 20, temp+160);
                temp += 175;
            }
            //var length =(kycformObj.getClientId().length/4).toFixed()
            //var length =2;
            //for(var j=0;j<length;j++){
            if(kycformObj.getClientId().length>14){
                doc.addPage()
                var temp =30;
                for(var i =0 ; i<599;i=temp){
                    doc.font('fonts/times.ttf').fontSize(10).text("APPLICANT", 25, temp);
                    doc.font('fonts/times.ttf').fontSize(10).text("Name", 130, temp+1);
                    doc.font('fonts/times.ttf').fontSize(10).text(smallLines, 200, temp+1);
                    doc.font('fonts/times.ttf').fontSize(10).text(smallLines, 320, temp+1);
                    doc.font('fonts/times.ttf').fontSize(10).text(smallLines, 450, temp+1);
                    doc.font('fonts/times.ttf').fontSize(10).text("First Name", 200, temp+10);
                    doc.font('fonts/times.ttf').fontSize(10).text("Middle Name", 320, temp+10);
                    doc.font('fonts/times.ttf').fontSize(10).text("Last Name", 450, temp+11);
                    doc.font('fonts/times.ttf').fontSize(10).text("Residence", 130, temp+25);
                    doc.font('fonts/times.ttf').fontSize(10).text("Block No", 200, temp+26);
                    doc.font('fonts/times.ttf').fontSize(10).text(smallLines, 250, temp+27);
                    //doc.font('fonts/times.ttf').fontSize(10).text("Flat/Soc Name", 370, 173);
                    doc.font('fonts/times.ttf').fontSize(10).text(smallLines, 370, temp+28);
                    doc.font('fonts/times.ttf').fontSize(10).text(smallLines, 450, temp+28);
                    doc.font('fonts/times.ttf').fontSize(10).text("Area", 200, temp+45);
                    doc.font('fonts/times.ttf').fontSize(10).text(smallLines, 250, temp+46);
                    doc.font('fonts/times.ttf').fontSize(10).text("Land Mark", 370, temp+47);
                    doc.font('fonts/times.ttf').fontSize(10).text(smallLines, 450, temp+47);
                    doc.font('fonts/times.ttf').fontSize(10).text(" ", 200, temp+65);
                    doc.font('fonts/times.ttf').fontSize(10).text(smallLines, 250, temp+66);
                    doc.font('fonts/times.ttf').fontSize(10).text("District", 370, temp+67);
                    doc.font('fonts/times.ttf').fontSize(10).text(smallLines, 450, temp+66);
                    doc.font('fonts/times.ttf').fontSize(10).text("Signature of the customer", 20, temp+100);
                    doc.font('fonts/times.ttf').fontSize(10).text("City", 200, temp+81);
                    doc.font('fonts/times.ttf').fontSize(10).text(smallLines, 250, temp+82);
                    doc.font('fonts/times.ttf').fontSize(10).text("Pincode", 370, temp+83);
                    doc.font('fonts/times.ttf').fontSize(10).text(smallLines, 450, temp+84);
                    doc.font('fonts/times.ttf').fontSize(10).text("Phone(LL)", 135, temp+100);
                    doc.font('fonts/times.ttf').fontSize(10).text(smallLines, 200, temp+101);
                    doc.font('fonts/times.ttf').fontSize(10).text("Mobile", 370, temp+102);
                    doc.font('fonts/times.ttf').fontSize(10).text(smallLines, 450, temp+103);
                    doc.font('fonts/times.ttf').fontSize(10).text("Business Category", 30, temp+120);
                    doc.font('fonts/times.ttf').fontSize(10).text(smallLines, 90, temp+121);
                    doc.font('fonts/times.ttf').fontSize(10).text("Date of Birth", 200, temp+122);
                    doc.font('fonts/times.ttf').fontSize(10).text(smallLines, 250, temp+123);
                    doc.font('fonts/times.ttf').fontSize(10).text("Caste", 370, temp+124);
                    doc.font('fonts/times.ttf').fontSize(10).text(smallLines, 420, temp+125);
                    doc.font('fonts/times.ttf').fontSize(10).text("Gross Income", 30, temp+140);
                    doc.font('fonts/times.ttf').fontSize(10).text(smallLines, 90, temp+140);
                    doc.font('fonts/times.ttf').fontSize(10).text("Expenses", 200, temp+140);
                    doc.font('fonts/times.ttf').fontSize(10).text(smallLines, 250, temp+140);
                    doc.font('fonts/times.ttf').fontSize(10).text("Net Income", 370, temp+140);
                    doc.font('fonts/times.ttf').fontSize(10).text(smallLines, 420, temp+140);
                    doc.font('fonts/times.ttf').fontSize(10).text("Purpose of Loan", 30, temp+155);
                    doc.font('fonts/times.ttf').fontSize(10).text(smallLines, 100, temp+155);
                    doc.font('fonts/times.ttf').fontSize(10).text("Signature", 300, temp+155);
                    doc.font('fonts/times.ttf').fontSize(10).text(smallLines, 350, temp+155);
                    doc.font('fonts/times.ttf').fontSize(10).text(apexLines, 20, temp+160);
                    temp += 175;
                }
                var len=20;
                for (var itreateOne =14; itreateOne < kycformObj.getClientId().length; itreateOne++) {
                    if(itreateOne <18){
                        doc.font('Times-Roman').fontSize(10).text(kycformObj.getClientName()[itreateOne], 199, len+11);
                        customlog.info("photo_clientId_array: " + photo_clientId_array);
                        var photoPosition = 20;
                        var error = "false";
                        for (var a = 0; a < photo_clientId_array.length; a++) {
                            if (photo_clientId_array[a] == kycformObj.getClientId()[itreateOne]) {
                                //fix to avoid empty images
                                try {
                                    doc.image(captured_image_array[a], photoPosition, len+26, {fit: [100, 100]}).stroke();
                                }
                                catch (e) { //catches "Unknown image format" Error
                                    error = "true";
                                    customlog.info("caught exception: " + e);
                                }
                                if (error == "false")
                                    photoPosition = photoPosition + 90;
                            }
                        }
                        doc.font('Times-Roman').fontSize(10).text(kycformObj.getAddress()[itreateOne], 250, len+38);
                        doc.font('Times-Roman').fontSize(10).text(kycformObj.getPinCode()[itreateOne], 449, len+94);
                        doc.font('Times-Roman').fontSize(10).text(kycformObj.getPhoneNo()[itreateOne], 449, len+113);
                        doc.font('Times-Roman').fontSize(10).text(kycformObj.getDateOfBirth()[itreateOne], 255, len+133);
                        doc.font('Times-Roman').fontSize(10).text(kycformObj.getCaste()[itreateOne], 439, len+135);
                        doc.font('Times-Roman').fontSize(10).text(kycformObj.getFamilyMonthlyIncome()[itreateOne], 89, len+153);
                        doc.font('Times-Roman').fontSize(10).text(kycformObj.getFamilyMonthlyExpense()[itreateOne], 249, len+150);
                        doc.font('Times-Roman').fontSize(10).text(kycformObj.getFamilyMonthlyIncome()[itreateOne], 419, len+150);
                        doc.font('Times-Roman').fontSize(10).text(kycformObj.getLoanPurpose()[itreateOne], 99, len+165);
                        len+=175;
                    }
                    //}
                }
            }
            if(kycformObj.getClientId().length>18){
                doc.addPage();
                var temp =30;
                for(var i =0 ; i<599;i=temp){
                    doc.font('fonts/times.ttf').fontSize(10).text("APPLICANT", 25, temp);
                    doc.font('fonts/times.ttf').fontSize(10).text("Name", 130, temp+1);
                    doc.font('fonts/times.ttf').fontSize(10).text(smallLines, 200, temp+1);
                    doc.font('fonts/times.ttf').fontSize(10).text(smallLines, 320, temp+1);
                    doc.font('fonts/times.ttf').fontSize(10).text(smallLines, 450, temp+1);
                    doc.font('fonts/times.ttf').fontSize(10).text("First Name", 200, temp+10);
                    doc.font('fonts/times.ttf').fontSize(10).text("Middle Name", 320, temp+10);
                    doc.font('fonts/times.ttf').fontSize(10).text("Last Name", 450, temp+11);
                    doc.font('fonts/times.ttf').fontSize(10).text("Residence", 130, temp+25);
                    doc.font('fonts/times.ttf').fontSize(10).text("Block No", 200, temp+26);
                    doc.font('fonts/times.ttf').fontSize(10).text(smallLines, 250, temp+27);
                    //doc.font('fonts/times.ttf').fontSize(10).text("Flat/Soc Name", 370, 173);
                    doc.font('fonts/times.ttf').fontSize(10).text(smallLines, 370, temp+28);
                    doc.font('fonts/times.ttf').fontSize(10).text(smallLines, 450, temp+28);
                    doc.font('fonts/times.ttf').fontSize(10).text("Area", 200, temp+45);
                    doc.font('fonts/times.ttf').fontSize(10).text(smallLines, 250, temp+46);
                    doc.font('fonts/times.ttf').fontSize(10).text("Land Mark", 370, temp+47);
                    doc.font('fonts/times.ttf').fontSize(10).text(smallLines, 450, temp+47);
                    doc.font('fonts/times.ttf').fontSize(10).text(" ", 200, temp+65);
                    doc.font('fonts/times.ttf').fontSize(10).text(smallLines, 250, temp+66);
                    doc.font('fonts/times.ttf').fontSize(10).text("District", 370, temp+67);
                    doc.font('fonts/times.ttf').fontSize(10).text(smallLines, 450, temp+66);
                    doc.font('fonts/times.ttf').fontSize(10).text("Signature of the customer", 20, temp+100);
                    doc.font('fonts/times.ttf').fontSize(10).text("City", 200, temp+81);
                    doc.font('fonts/times.ttf').fontSize(10).text(smallLines, 250, temp+82);
                    doc.font('fonts/times.ttf').fontSize(10).text("Pincode", 370, temp+83);
                    doc.font('fonts/times.ttf').fontSize(10).text(smallLines, 450, temp+84);
                    doc.font('fonts/times.ttf').fontSize(10).text("Phone(LL)", 135, temp+100);
                    doc.font('fonts/times.ttf').fontSize(10).text(smallLines, 200, temp+101);
                    doc.font('fonts/times.ttf').fontSize(10).text("Mobile", 370, temp+102);
                    doc.font('fonts/times.ttf').fontSize(10).text(smallLines, 450, temp+103);
                    doc.font('fonts/times.ttf').fontSize(10).text("Business Category", 30, temp+120);
                    doc.font('fonts/times.ttf').fontSize(10).text(smallLines, 90, temp+121);
                    doc.font('fonts/times.ttf').fontSize(10).text("Date of Birth", 200, temp+122);
                    doc.font('fonts/times.ttf').fontSize(10).text(smallLines, 250, temp+123);
                    doc.font('fonts/times.ttf').fontSize(10).text("Caste", 370, temp+124);
                    doc.font('fonts/times.ttf').fontSize(10).text(smallLines, 420, temp+125);
                    doc.font('fonts/times.ttf').fontSize(10).text("Gross Income", 30, temp+140);
                    doc.font('fonts/times.ttf').fontSize(10).text(smallLines, 90, temp+140);
                    doc.font('fonts/times.ttf').fontSize(10).text("Expenses", 200, temp+140);
                    doc.font('fonts/times.ttf').fontSize(10).text(smallLines, 250, temp+140);
                    doc.font('fonts/times.ttf').fontSize(10).text("Net Income", 370, temp+140);
                    doc.font('fonts/times.ttf').fontSize(10).text(smallLines, 420, temp+140);
                    doc.font('fonts/times.ttf').fontSize(10).text("Purpose of Loan", 30, temp+155);
                    doc.font('fonts/times.ttf').fontSize(10).text(smallLines, 100, temp+155);
                    doc.font('fonts/times.ttf').fontSize(10).text("Signature", 300, temp+155);
                    doc.font('fonts/times.ttf').fontSize(10).text(smallLines, 350, temp+155);
                    doc.font('fonts/times.ttf').fontSize(10).text(apexLines, 20, temp+160);
                    temp += 175;
                }
                var len=20;
                for (var itreateOne =18; itreateOne < kycformObj.getClientId().length; itreateOne++) {
                    if(itreateOne <22){
                        doc.font('Times-Roman').fontSize(10).text(kycformObj.getClientName()[itreateOne], 199, len+11);
                        customlog.info("photo_clientId_array: " + photo_clientId_array);
                        var photoPosition = 20;
                        var error = "false";
                        for (var a = 0; a < photo_clientId_array.length; a++) {
                            if (photo_clientId_array[a] == kycformObj.getClientId()[itreateOne]) {
                                //fix to avoid empty images
                                try {
                                    doc.image(captured_image_array[a], photoPosition, len+26, {fit: [100, 100]}).stroke();
                                }
                                catch (e) { //catches "Unknown image format" Error
                                    error = "true";
                                    customlog.info("caught exception: " + e);
                                }
                                if (error == "false")
                                    photoPosition = photoPosition + 90;
                            }
                        }
                        doc.font('Times-Roman').fontSize(10).text(kycformObj.getAddress()[itreateOne], 250, len+38);
                        doc.font('Times-Roman').fontSize(10).text(kycformObj.getPinCode()[itreateOne], 449, len+94);
                        doc.font('Times-Roman').fontSize(10).text(kycformObj.getPhoneNo()[itreateOne], 449, len+113);
                        doc.font('Times-Roman').fontSize(10).text(kycformObj.getDateOfBirth()[itreateOne], 255, len+133);
                        doc.font('Times-Roman').fontSize(10).text(kycformObj.getCaste()[itreateOne], 439, len+135);
                        doc.font('Times-Roman').fontSize(10).text(kycformObj.getFamilyMonthlyIncome()[itreateOne], 89, len+153);
                        doc.font('Times-Roman').fontSize(10).text(kycformObj.getFamilyMonthlyExpense()[itreateOne], 249, len+150);
                        doc.font('Times-Roman').fontSize(10).text(kycformObj.getFamilyMonthlyIncome()[itreateOne], 419, len+150);
                        doc.font('Times-Roman').fontSize(10).text(kycformObj.getLoanPurpose()[itreateOne], 99, len+165);
                        len+=175;
                    }
                    //}
                }
            }
        }
    if(kycformObj.getClientId().length>22){
        doc.addPage();
        doc.font('fonts/PalatinoBold.ttf').fontSize(14).text(head, 25, 30);
        doc.font('fonts/times.ttf').fontSize(10).text("Special Sanction Sign", 380, 30);
        doc.font('fonts/times.ttf').fontSize(10).text(smallLines, 470, 32);
        title1 = 'MAS Financial Services Limited';
        doc.moveDown().font('fonts/times.ttf').fontSize(10).text(title1, 25, 52);
        doc.font('fonts/times.ttf').fontSize(10).text("CIN No", 380, 45);
        doc.font('fonts/times.ttf').fontSize(10).text(smallLines, 470, 46);
        doc.font('fonts/times.ttf').fontSize(10).text("TAT No", 380, 60);
        doc.font('fonts/times.ttf').fontSize(10).text(smallLines, 470, 61);
        doc.font('fonts/times.ttf').fontSize(10).text("Centre", 25, 80);
        doc.font('fonts/times.ttf').fontSize(10).text(smallLines, 80, 81);
        doc.font('fonts/times.ttf').fontSize(10).text("BK Sr No", 200, 80);
        doc.font('fonts/times.ttf').fontSize(10).text(smallLines, 240, 81);
        doc.font('fonts/times.ttf').fontSize(10).text("Agreement ID", 380, 80);
        doc.font('fonts/times.ttf').fontSize(10).text(smallLines, 470, 81);
        doc.font('fonts/times.ttf').fontSize(10).text("Module", 25, 100);
        doc.font('fonts/times.ttf').fontSize(10).text(smallLines, 80, 101);
        doc.font('fonts/times.ttf').fontSize(10).text("Executive", 200, 100);
        doc.font('fonts/times.ttf').fontSize(10).text(smallLines, 240, 101);
        doc.font('fonts/times.ttf').fontSize(10).text("Source", 380, 100);
        doc.font('fonts/times.ttf').fontSize(10).text(smallLines, 470, 101);
        doc.font('fonts/times.ttf').fontSize(10).text("Scheme Code", 25, 120);
        doc.font('fonts/times.ttf').fontSize(10).text(smallLines, 80, 121);
        doc.font('fonts/times.ttf').fontSize(10).text("Screen No", 200, 120);
        doc.font('fonts/times.ttf').fontSize(10).text(smallLines, 240, 121);
        doc.font('fonts/times.ttf').fontSize(10).text("Category", 380, 120);
        doc.font('fonts/times.ttf').fontSize(10).text("Business Associate", 470, 121);
        doc.font('fonts/times.ttf').fontSize(10).text(smallLines, 470, 121);
        doc.font('fonts/times.ttf').fontSize(10).text(apexLines, 20, 130);

        var temp =145;
        for(var i =0 ; i<499;i=temp){
            doc.font('fonts/times.ttf').fontSize(10).text("APPLICANT", 25, temp);
            doc.font('fonts/times.ttf').fontSize(10).text("Name", 130, temp+1);
            doc.font('fonts/times.ttf').fontSize(10).text(smallLines, 200, temp+1);
            doc.font('fonts/times.ttf').fontSize(10).text(smallLines, 320, temp+1);
            doc.font('fonts/times.ttf').fontSize(10).text(smallLines, 450, temp+1);
            doc.font('fonts/times.ttf').fontSize(10).text("First Name", 200, temp+10);
            doc.font('fonts/times.ttf').fontSize(10).text("Middle Name", 320, temp+10);
            doc.font('fonts/times.ttf').fontSize(10).text("Last Name", 450, temp+11);
            doc.font('fonts/times.ttf').fontSize(10).text("Residence", 130, temp+25);
            doc.font('fonts/times.ttf').fontSize(10).text("Block No", 200, temp+26);
            doc.font('fonts/times.ttf').fontSize(10).text(smallLines, 250, temp+27);
            //doc.font('fonts/times.ttf').fontSize(10).text("Flat/Soc Name", 370, 173);
            doc.font('fonts/times.ttf').fontSize(10).text(smallLines, 370, temp+28);
            doc.font('fonts/times.ttf').fontSize(10).text(smallLines, 450, temp+28);
            doc.font('fonts/times.ttf').fontSize(10).text("Area", 200, temp+45);
            doc.font('fonts/times.ttf').fontSize(10).text(smallLines, 250, temp+46);
            doc.font('fonts/times.ttf').fontSize(10).text("Land Mark", 370, temp+47);
            doc.font('fonts/times.ttf').fontSize(10).text(smallLines, 450, temp+47);
            doc.font('fonts/times.ttf').fontSize(10).text(" ", 200, temp+65);
            doc.font('fonts/times.ttf').fontSize(10).text(smallLines, 250, temp+66);
            doc.font('fonts/times.ttf').fontSize(10).text("District", 370, temp+67);
            doc.font('fonts/times.ttf').fontSize(10).text(smallLines, 450, temp+66);
            doc.font('fonts/times.ttf').fontSize(10).text("Signature of the customer", 20, temp+100);
            doc.font('fonts/times.ttf').fontSize(10).text("City", 200, temp+81);
            doc.font('fonts/times.ttf').fontSize(10).text(smallLines, 250, temp+82);
            doc.font('fonts/times.ttf').fontSize(10).text("Pincode", 370, temp+83);
            doc.font('fonts/times.ttf').fontSize(10).text(smallLines, 450, temp+84);
            doc.font('fonts/times.ttf').fontSize(10).text("Phone(LL)", 135, temp+100);
            doc.font('fonts/times.ttf').fontSize(10).text(smallLines, 200, temp+101);
            doc.font('fonts/times.ttf').fontSize(10).text("Mobile", 370, temp+102);
            doc.font('fonts/times.ttf').fontSize(10).text(smallLines, 450, temp+103);
            doc.font('fonts/times.ttf').fontSize(10).text("Business Category", 30, temp+120);
            doc.font('fonts/times.ttf').fontSize(10).text(smallLines, 90, temp+121);
            doc.font('fonts/times.ttf').fontSize(10).text("Date of Birth", 200, temp+122);
            doc.font('fonts/times.ttf').fontSize(10).text(smallLines, 250, temp+123);
            doc.font('fonts/times.ttf').fontSize(10).text("Caste", 370, temp+124);
            doc.font('fonts/times.ttf').fontSize(10).text(smallLines, 420, temp+125);
            doc.font('fonts/times.ttf').fontSize(10).text("Gross Income", 30, temp+140);
            doc.font('fonts/times.ttf').fontSize(10).text(smallLines, 90, temp+140);
            doc.font('fonts/times.ttf').fontSize(10).text("Expenses", 200, temp+140);
            doc.font('fonts/times.ttf').fontSize(10).text(smallLines, 250, temp+140);
            doc.font('fonts/times.ttf').fontSize(10).text("Net Income", 370, temp+140);
            doc.font('fonts/times.ttf').fontSize(10).text(smallLines, 420, temp+140);
            doc.font('fonts/times.ttf').fontSize(10).text("Purpose of Loan", 30, temp+155);
            doc.font('fonts/times.ttf').fontSize(10).text(smallLines, 100, temp+155);
            doc.font('fonts/times.ttf').fontSize(10).text("Signature", 300, temp+155);
            doc.font('fonts/times.ttf').fontSize(10).text(smallLines, 350, temp+155);
            doc.font('fonts/times.ttf').fontSize(10).text(apexLines, 20, temp+160);
            temp += 175;
        }
    }
    doc.write(rootPath+"/public/GeneratedPDF/" + groupName + "_MASLoanCardform.pdf");
}
function calculateAppraisalPercentage(questionsObj, choicesSelectedAnswerObj, i) {
    var returnArray = new Array();
    var vehicleType = new Array()
    var vehicles = new Array();
    var constantsRequire = require(commonDTO+"/Constants");
    var constantsObj = new constantsRequire();

    customlog.info(choicesSelectedAnswerObj.getVehicleType()[i]);
    if (choicesSelectedAnswerObj.getVehicleType()[i] != "" || choicesSelectedAnswerObj.getVehicleType()[i] != "null") {
        vehicleType = choicesSelectedAnswerObj.getVehicleType()[i].split(",");
        for (var a = 0; a < vehicleType.length; a++) {
            vehicles[a] = vehicleType[a].trim();
        }
    }
    customlog.info(vehicles);
    var selectedAnswer = new Array();
    var selectedAnswerId = new Array();
    var selectedAnswerMark = new Array();
    var index = 0;
    for(var quesIndex=0;quesIndex<questionsObj.getQuestionIdArray().length;quesIndex++){
        if(questionsObj.getQuestionIdArray()[quesIndex] == constantsObj.getAgeQuestionId()){
            if (choicesSelectedAnswerObj.getAge()[i] >= 18 && choicesSelectedAnswerObj.getAge()[i] <= 35) {
                selectedAnswer[index] = "Above 20 and up to 35 years";
                selectedAnswerMark[index] = 3;
                selectedAnswerId[index] = 1;
            }
            else if (choicesSelectedAnswerObj.getAge()[i] > 35 && choicesSelectedAnswerObj.getAge()[i] <= 50) {
                selectedAnswer[index] = "Above 35 and up to 50 years";
                selectedAnswerMark[index] = 2;
                selectedAnswerId[index] = 2;
            }
            else if (choicesSelectedAnswerObj.getAge()[i] > 50) {
                selectedAnswer[index] = "Above 50 Years";
                selectedAnswerMark[index] = 1;
                selectedAnswerId[index] = 3;
            }
            else {
                selectedAnswerMark[index] = 0;
            }
            index++;
        }
        else if(questionsObj.getQuestionIdArray()[quesIndex] == constantsObj.getEducationalQualificationQuestionId()){
            if (choicesSelectedAnswerObj.getEducationalDetails()[i] == "Below SSLC") {
                selectedAnswer[index] = "Below SSLC";
                selectedAnswerMark[index] = 1;
                selectedAnswerId[index] = 3;
            }
            else if (choicesSelectedAnswerObj.getEducationalDetails()[i] == "Above SSLC") {
                selectedAnswer[index] = "SSLC and above";
                selectedAnswerMark[index] = 2;
                selectedAnswerId[index] = 2;
            }
            else if (choicesSelectedAnswerObj.getEducationalDetails()[i] == "Any Degree") {
                selectedAnswer[index] = "Degree";
                selectedAnswerMark[index] = 3;
                selectedAnswerId[index] = 1;
            }
            else {

            }
            index++;
        }

        else if(questionsObj.getQuestionIdArray()[quesIndex] == constantsObj.getMaritalQuestionId()){
            if (choicesSelectedAnswerObj.getMaritalStatus()[i] == "Unmarried") {
                selectedAnswer[index] = "Unmarried";
                selectedAnswerMark[index] = 1;
                selectedAnswerId[index] = 3;
            }
            else if (choicesSelectedAnswerObj.getMaritalStatus()[i] == "Married") {
                selectedAnswer[index] = "Married";
                selectedAnswerMark[index] = 3;
                selectedAnswerId[index] = 1;
            }
            else if (choicesSelectedAnswerObj.getMaritalStatus()[i] == "Widow" || choicesSelectedAnswerObj.getMaritalStatus()[i] == "Divorced") {
                selectedAnswer[index] = "Widow / Divorce";
                selectedAnswerMark[index] = 2;
                selectedAnswerId[index] = 2;
            }
            else {
            }
            index++;
        }

        else if(questionsObj.getQuestionIdArray()[quesIndex] == constantsObj.getEarningQuestionId()){
            if (choicesSelectedAnswerObj.getNumberOfEarnings()[i] == 1) {
                selectedAnswer[index] = "1 Member";
                selectedAnswerMark[index] = 1;
                selectedAnswerId[index] = 3;
            }
            else if (choicesSelectedAnswerObj.getNumberOfEarnings()[i] == 2) {
                selectedAnswer[index] = "2 Members";
                selectedAnswerMark[index] = 2;
                selectedAnswerId[index] = 2;
            }
            else if (choicesSelectedAnswerObj.getNumberOfEarnings()[i] >= 3) {
                selectedAnswer[index] = "3 Members";
                selectedAnswerMark[index] = 3;
                selectedAnswerId[index] = 1;
            }
            else {
                selectedAnswer[index] = "1 Member";
                selectedAnswerMark[index] = 1;
                selectedAnswerId[index] = 3;
            }
            index++;
        }

        else if(questionsObj.getQuestionIdArray()[quesIndex] == constantsObj.getFamilySavingsQuestionId()){
            if (choicesSelectedAnswerObj.getFamilySavings()[i] < 1000) {
                selectedAnswer[index] = "Less than 1000";
                selectedAnswerMark[index] = 1;
                selectedAnswerId[index] = 3;
            }
            else if (choicesSelectedAnswerObj.getFamilySavings()[i] >= 1000 && choicesSelectedAnswerObj.getFamilySavings()[i] <= 3000) {
                selectedAnswer[index] = "Above 1000 up to 3000";
                selectedAnswerMark[index] = 2;
                selectedAnswerId[index] = 2;
            }
            else if (choicesSelectedAnswerObj.getFamilySavings()[i] > 3000) {
                selectedAnswer[index] = "Greater than 3000";
                selectedAnswerMark[index] = 3;
                selectedAnswerId[index] = 1;
            }
            else {
            }
            index++;
        }

        else if(questionsObj.getQuestionIdArray()[quesIndex] == constantsObj.getHouseTypeQuestionId()){
            if (choicesSelectedAnswerObj.getCurrentHouseType()[i] == "Own") {
                selectedAnswer[index] = "Own House ";
                selectedAnswerMark[index] = 3;
                selectedAnswerId[index] = 1;
            }
            else if (choicesSelectedAnswerObj.getCurrentHouseType()[i] == "Rental") {
                selectedAnswer[index] = "Rented";
                selectedAnswerMark[index] = 1;
                selectedAnswerId[index] = 3;
            }
            else if (choicesSelectedAnswerObj.getCurrentHouseType()[i] == "Lease") {
                selectedAnswer[index] = "Leased";
                selectedAnswerMark[index] = 2;
                selectedAnswerId[index] = 2;
            }
            else {
            }
            index++;
        }

        else  if(questionsObj.getQuestionIdArray()[quesIndex] == constantsObj.getVehicleTypeQuestionId()){
            if (vehicles.indexOf("Scooter") > -1 || vehicles.indexOf("Moped") > -1 || vehicles.indexOf("Bike") > -1 || vehicles.indexOf("Car") > -1) {
                selectedAnswer[index] = "Two Wheeler / Four Wheeler";
                selectedAnswerMark[index] = 3;
                selectedAnswerId[index] = 1;
            }
            else if (vehicles.indexOf("Bi-Cycle") > -1) {
                selectedAnswer[index] = "Cycle";
                selectedAnswerMark[index] = 2;
                selectedAnswerId[index] = 2;
            }
            else {
                selectedAnswer[index] = "None";
                selectedAnswerMark[index] = 1;
                selectedAnswerId[index] = 3;
            }
            index++;
        }

        else if(questionsObj.getQuestionIdArray()[quesIndex] == constantsObj.getLoanPurposeQuestionId()){
            if (choicesSelectedAnswerObj.getPurposeOfLoan()[i] == "Own Business") {
                selectedAnswer[index] = "Own Business";
                selectedAnswerMark[index] = 3;
                selectedAnswerId[index] = 1;
            }
            else if (choicesSelectedAnswerObj.getPurposeOfLoan()[i] == "To Repay debt") {
                selectedAnswer[index] = "To repay Debt";
                selectedAnswerMark[index] = 2;
                selectedAnswerId[index] = 2;
            }
            else if (choicesSelectedAnswerObj.getPurposeOfLoan()[i] == "Consumption") {
                selectedAnswer[index] = "Consumption";
                selectedAnswerMark[index] = 1;
                selectedAnswerId[index] = 3;
            }
            else {
            }
            index++;
        }

        else  if(questionsObj.getQuestionIdArray()[quesIndex] == constantsObj.getBankAccInsuranceQuestionId()){
            if (choicesSelectedAnswerObj.getBankDetails()[i] == 1 && (choicesSelectedAnswerObj.getLifeInsuranceDetails()[i] == 1 || choicesSelectedAnswerObj.getAccidentalInsuranceDetails()[i] == 1 || choicesSelectedAnswerObj.getMedicalInsuranceDetails()[i] == 1 )) {
                selectedAnswer[index] = "Bank A/C and Insurance";
                selectedAnswerMark[index] = 3;
                selectedAnswerId[index] = 1;
            }
            else if (choicesSelectedAnswerObj.getBankDetails()[i] == 1 || choicesSelectedAnswerObj.getLifeInsuranceDetails()[i] == 1 || choicesSelectedAnswerObj.getAccidentalInsuranceDetails()[i] == 1 || choicesSelectedAnswerObj.getMedicalInsuranceDetails()[i] == 1) {
                selectedAnswer[index] = "Bank A/C or Insurance";
                selectedAnswerMark[index] = 2;
                selectedAnswerId[index] = 2;
            }
            else {
                selectedAnswer[index] = "None";
                selectedAnswerMark[index] = 1;
                selectedAnswerId[index] = 3;
            }
            index++;
        }

        else if(questionsObj.getQuestionIdArray()[quesIndex] == constantsObj.getOtherMicrofinanceLoanQuestionId()){
            if (choicesSelectedAnswerObj.getOtherMicrofinance()[i] == 1) {
                selectedAnswer[index] = "1 Loan";
                selectedAnswerMark[index] = 2;
                selectedAnswerId[index] = 2;
            }
            else if (choicesSelectedAnswerObj.getOtherMicrofinance()[i] == 0) {
                selectedAnswer[index] = "No Loan";
                selectedAnswerMark[index] = 3;
                selectedAnswerId[index] = 1;
            }
            else if (choicesSelectedAnswerObj.getOtherMicrofinance()[i] > 1) {
                selectedAnswer[index] = "Greater than 1 Loan";
                selectedAnswerMark[index] = 1;
                selectedAnswerId[index] = 3;
            }
            else {
                selectedAnswer[index] = "No Loan";
                selectedAnswerMark[index] = 3;
                selectedAnswerId[index] = 1;
            }
            index++;
        }

        else if(questionsObj.getQuestionIdArray()[quesIndex] == constantsObj.getLoanRepaymentTrackCBAQuestionId()){
            if (choicesSelectedAnswerObj.getBorrowersLoanRepayment()[i] == "Very Good" || choicesSelectedAnswerObj.getBorrowersLoanRepayment()[i] == "New") {
                selectedAnswer[index] = "Very Good / New";
                selectedAnswerMark[index] = 3;
                selectedAnswerId[index] = 1;
            }
            else if (choicesSelectedAnswerObj.getBorrowersLoanRepayment()[i] == "Good") {
                selectedAnswer[index] = "Good";
                selectedAnswerMark[index] = 2;
                selectedAnswerId[index] = 2;
            }
            else if (choicesSelectedAnswerObj.getBorrowersLoanRepayment()[i] == "Average") {
                selectedAnswer[index] = "Average";
                selectedAnswerMark[index] = 1;
                selectedAnswerId[index] = 3;
            }
            else {
                selectedAnswerMark[index] = 1;
                selectedAnswerId[index] = 3;
            }
            index++;
        }

        else if(questionsObj.getQuestionIdArray()[quesIndex] == constantsObj.getAttendanceRatingQuestionId()){
            var totalAttendance =  (choicesSelectedAnswerObj.getNoOfRegularAttendance()[i] == null) ? "" :parseInt(choicesSelectedAnswerObj.getNoOfRegularAttendance()[i]) + parseInt(choicesSelectedAnswerObj.getNoOfIrregularAttendance()[i]);
            var avgAttendance = (totalAttendance == null || totalPayments < 12) ? (totalAttendance) : (totalAttendance/2);

            if (avgAttendance == null || avgAttendance == 12) {
                selectedAnswer[index] = "Very Good / New";
                selectedAnswerMark[index] = 3;
                selectedAnswerId[index] = 1;
            }
            else if (avgAttendance > 6) {
                selectedAnswer[index] = "Good";
                selectedAnswerMark[index] = 2;
                selectedAnswerId[index] = 2;
            }
            else if (avgAttendance < 6) {
                selectedAnswer[index] = "Average";
                selectedAnswerMark[index] = 1;
                selectedAnswerId[index] = 3;
            }
            else {
                selectedAnswerMark[index] = 1;
                selectedAnswerId[index] = 3;
            }
            index++;
        }

        else if(questionsObj.getQuestionIdArray()[quesIndex] == constantsObj.getLoanRepaymentTrackPrevLoanQuestionId()){
            var totalPayments =  parseInt(choicesSelectedAnswerObj.getNoOfRegularPayments()[i]) + parseInt(choicesSelectedAnswerObj.getNoOfIrregularPayments()[i]);
            var avgPayments = (totalPayments < 12) ? (totalPayments) : (totalPayments/2);
            if (avgPayments == 12 ) {
                selectedAnswer[index] = "Very Good / New";
                selectedAnswerMark[index] = 3;
                selectedAnswerId[index] = 1;
            }
            else if (avgPayments > 6) {
                selectedAnswer[index] = "Good";
                selectedAnswerMark[index] = 2;
                selectedAnswerId[index] = 2;
            }
            else if (avgPayments < 6) {
                selectedAnswer[index] = "Average";
                selectedAnswerMark[index] = 1;
                selectedAnswerId[index] = 3;
            }
            else {
                selectedAnswerMark[index] = 1;
                selectedAnswerId[index] = 3;
            }
            index++;
        }
    }
    var returnArrayCCA = calculateCCAForClient(questionsObj, selectedAnswerMark);
    customlog.info("After method calling" + returnArrayCCA);
    returnArray.push(returnArrayCCA);
    returnArray.push(selectedAnswerId);
    return returnArray;
}

function calculateCCAForClient(questionsObj, selectedAnswerMark) {
    customlog.info("inside method" + questionsObj.getQuestionWeightage());
    customlog.info("inside method" + selectedAnswerMark);
    var appraisalCalculation = new Array();
    var returnArrayCCA = new Array();
    var totalWeightage = 0;
    for (var i = 0; i < selectedAnswerMark.length; i++) {
        totalWeightage += questionsObj.getQuestionWeightage()[i] * selectedAnswerMark[i];
        customlog.info("totalWeightage= " + totalWeightage);
    }
    var CCARating = (totalWeightage / 225) * 100;
    customlog.info("CCARating= " + CCARating);
    customlog.info("totalWeightageTotal= " + totalWeightage);
    returnArrayCCA.push(CCARating);
    returnArrayCCA.push(totalWeightage);
    return returnArrayCCA;
}
