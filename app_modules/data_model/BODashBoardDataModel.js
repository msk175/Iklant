module.exports = boDashBoardDataModel;

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


function boDashBoardDataModel(constants) {
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

boDashBoardDataModel.prototype = {

    getGroupCountDataModel : function(toDate,callback) {

        var self=this;
        var regionalGroupCountJsonArray = new Array();

        var freshGroupCountTotal = 0;
        var inProgressGroupCountTotal = 0;
        var holdGroupCountTotal = 0;
        var completedGroupCountTotal = 0;

        var retrieveGroupCountRegionalWise = "SELECT bod.`regional_office_id`,bod.`regional_office_name`, "+
                                             "IFNULL(MAX(CASE WHEN bod.report_status_id = 1 THEN   bod. group_count END),0)  fresh_group, "+
                                             "IFNULL(MAX(CASE WHEN bod.report_status_id = 2 THEN   bod. group_count END),0)    in_progess, "+
                                             "IFNULL(MAX(CASE WHEN bod.report_status_id = 3 THEN   bod. group_count END) ,0)  hold_group, "+
                                             "IFNULL(MAX(CASE WHEN bod.report_status_id = 4 THEN   bod. group_count END ),0)   completed "+
                                             "FROM "+
                                             "(SELECT  io.`regional_office_id`,ro.`regional_office_name`,bo.`report_status_id`,brs.`report_status_name`, "+
                                            "COUNT(*)  AS group_count "+
                                             "FROM `iklant_bo_group_details` bo "+
                                            "INNER JOIN `iklant_prospect_group` pg ON pg.`group_id` =  bo.`group_id` "+
                                            "INNER JOIN `iklant_office` io ON io.`office_id` = pg.`office_id` "+
                                            "LEFT JOIN `iklant_bo_report_status` brs ON brs.`report_status_id` = bo.`report_status_id` "+
                                            "INNER  JOIN   `regional_office` ro ON ro.`regional_office_id` = io.`regional_office_id` "+
                                            "WHERE bo.`date` = '"+toDate+"' "+
                                            "GROUP BY io.regional_office_id,brs.`report_status_id` "+
                                            "ORDER BY io.regional_office_id,brs.`report_status_id`)  bod "+
                                            "GROUP BY bod.`regional_office_id` ";

        customlog.info('retrieveGroupCountRegionalWise ' + retrieveGroupCountRegionalWise);

        connectionDataSource.getConnection(function(clientConnect){
            clientConnect.query(retrieveGroupCountRegionalWise ,function(err,results,fields){
                if(err){
                    customlog.error(err);
                    connectionDataSource.releaseConnectionPool(clientConnect);
                    callback("failure");
                }else{
                    if(results.length > 0){
                        for (var i = 0; i < results.length; i++) {
                            var groupCountDashboardJsonObj = {};
                            groupCountDashboardJsonObj.regionalOfficeId = results[i].regional_office_id;
                            groupCountDashboardJsonObj.regionalOfficeName = results[i].regional_office_name;
                            groupCountDashboardJsonObj.freshGroupCount = results[i].fresh_group;
                            groupCountDashboardJsonObj.inProgressGroupCount = results[i].in_progess;
                            groupCountDashboardJsonObj.holdGroupCount = results[i].hold_group;
                            groupCountDashboardJsonObj.completedGroupCount = results[i].completed;
                            regionalGroupCountJsonArray.push(groupCountDashboardJsonObj);
                        }
                        connectionDataSource.releaseConnectionPool(clientConnect);
                        callback(regionalGroupCountJsonArray);
                    }else{
                        connectionDataSource.releaseConnectionPool(clientConnect);
                        callback(regionalGroupCountJsonArray);
                    }
                }
            });
        });

    },

    getGroupCountBranchWiseDataModel : function(regionalOfficeId,toDate,callback) {
        var self=this;
        var regionalGroupCountJsonArray = new Array();

        var retrieveGroupCountBranchWise = "SELECT bod.regional_office_id,bod.`office_id`,bod.`office_name`,  "+
                                            "IFNULL(MAX(CASE WHEN bod.report_status_id = 1 THEN   bod. group_count END),0)  fresh_group, "+
                                            "IFNULL(MAX(CASE WHEN bod.report_status_id = 2 THEN   bod. group_count END),0)  in_progess, "+
                                            "IFNULL(MAX(CASE WHEN bod.report_status_id = 3 THEN   bod. group_count END) ,0)  hold_group, "+
                                            "IFNULL(MAX(CASE WHEN bod.report_status_id = 4 THEN   bod. group_count END ),0)   completed "+
                                            "FROM  "+
                                            "(SELECT  io.`regional_office_id`,io.office_id,io.office_name,bo.`report_status_id`,brs.`report_status_name`, "+
                                            "COUNT(*)  AS group_count "+
                                            "FROM `iklant_bo_group_details` bo "+
                                            "INNER JOIN `iklant_prospect_group` pg ON pg.`group_id` =  bo.`group_id` "+
                                            "INNER JOIN `iklant_office` io ON io.`office_id` = pg.`office_id` "+
                                            "LEFT JOIN `iklant_bo_report_status` brs ON brs.`report_status_id` = bo.`report_status_id` "+
                                            "INNER  JOIN   `regional_office` ro ON ro.`regional_office_id` = io.`regional_office_id` "+
                                            "WHERE bo.`date` = '"+toDate+"' "+
                                            "GROUP BY io.office_id,brs.`report_status_id` "+
                                            "ORDER BY io.office_id,brs.`report_status_id`)  bod "+
                                            "WHERE bod.regional_office_id = "+regionalOfficeId+" "+
                                            "GROUP BY bod.`office_id` ";

        customlog.info('retrieveGroupCountBranchWise ' + retrieveGroupCountBranchWise);

        connectionDataSource.getConnection(function(clientConnect){
            clientConnect.query(retrieveGroupCountBranchWise ,function(err,results,fields){
                if(err){
                    customlog.error(err);
                    connectionDataSource.releaseConnectionPool(clientConnect);
                    callback("failure");
                }else{
                    if(results.length > 0){
                        for (var i = 0; i < results.length; i++) {
                            var groupCountDashboardJsonObj = {};
                            groupCountDashboardJsonObj.regionalOfficeId = results[i].office_id;
                            groupCountDashboardJsonObj.regionalOfficeName = results[i].office_name;
                            groupCountDashboardJsonObj.freshGroupCount = results[i].fresh_group;
                            groupCountDashboardJsonObj.inProgressGroupCount = results[i].in_progess;
                            groupCountDashboardJsonObj.holdGroupCount = results[i].hold_group;
                            groupCountDashboardJsonObj.completedGroupCount = results[i].completed;
                            regionalGroupCountJsonArray.push(groupCountDashboardJsonObj);
                        }
                        connectionDataSource.releaseConnectionPool(clientConnect);
                        callback(regionalGroupCountJsonArray);
                    }else{
                        connectionDataSource.releaseConnectionPool(clientConnect);
                        callback(regionalGroupCountJsonArray);
                    }
                }
            });
        });
    },

    getGroupStatusCountForSelectedBranchDataModel : function(branchOfficeId,toDate,callback) {

        var self=this;
        var groupStatusCountJsonArray = new Array();
        var groupStatusCountQuery = "SELECT god.`report_status_id`,god.`report_status_name`, "+
                                    "IFNULL(MAX(CASE WHEN god.report_status_id IN (1 ,2,3)  AND god.group_status_id  = 3 THEN   god. group_count END),0)  AS kyc_updating, "+
                                    "IFNULL(MAX(CASE WHEN god.report_status_id IN (2 ,3) AND god.group_status_id  = 4  THEN   god. group_count END),0) AS kyc_verification, "+
                                    "IFNULL(MAX(CASE WHEN god.report_status_id IN (2 ,3)  AND god.group_status_id  = 23   THEN   god. group_count END),0) AS leader_subleader_updation, "+
                                    "IFNULL(MAX(CASE WHEN god.report_status_id IN (2 ,3) AND god.group_status_id  = 24   THEN   god. group_count END),0)  AS leader_sub_leader_verification, "+
                                    "IFNULL(MAX(CASE WHEN god.report_status_id IN (2 ,3,4) AND god.group_status_id  IN  (19,5)   THEN   god. group_count END),0)  cba, "+
                                    "IFNULL(MAX(CASE WHEN god.report_status_id IN (4) AND god.group_status_id  IN  (15)   THEN   god. group_count END),0)  cba_rejected "+
                                    "FROM "+
                                    "( "+
                                    "SELECT pg.`office_id`,brs.`report_status_name`,ps.`status_name`,bo.`group_id`,bo.`hold_status`,bo.`report_status_id`,bo.`group_status_id` "+
                                    ",COUNT(*)  AS group_count "+
                                    "FROM  "+
                                    "`iklant_bo_group_details` bo "+
                                    "INNER JOIN  `iklant_prospect_status` ps ON ps.status_id = bo.`group_status_id` "+
                                    "INNER JOIN `iklant_bo_report_status` brs ON brs.`report_status_id` = bo.`report_status_id` "+
                                    "INNER JOIN `iklant_prospect_group` pg ON pg.`group_id` = bo.`group_id` "+
                                    "INNER JOIN `iklant_office` io ON io.`office_id` =  pg.`office_id` "+
                                    "WHERE pg.`office_id` = "+branchOfficeId+" AND bo.`date` = '"+toDate+"' "+
                                    "GROUP BY bo.`hold_status` ,bo.`group_status_id`,bo.`report_status_id` "+
                                    "ORDER BY bo.`report_status_id` ,bo.`group_status_id`,bo.`hold_status`) god "+
                                    "GROUP BY  god.report_status_id  "+
                                    "ORDER BY  god.report_status_id  ";

        customlog.info('groupStatusCountQuery ' + groupStatusCountQuery);

        connectionDataSource.getConnection(function(clientConnect){
            clientConnect.query(groupStatusCountQuery ,function(err,results,fields){
                if(err){
                    customlog.error(err);
                    connectionDataSource.releaseConnectionPool(clientConnect);
                    callback("failure");
                }else{
                    if(results.length > 0){
                        for (var i = 0; i < results.length; i++) {
                            var groupStatusCountDashboardJsonObj = {};
                            groupStatusCountDashboardJsonObj.reportStatusId = results[i].report_status_id;
                            groupStatusCountDashboardJsonObj.officeId = branchOfficeId;
                            groupStatusCountDashboardJsonObj.reportStatusName = results[i].report_status_name;
                            groupStatusCountDashboardJsonObj.kycUpdaingCount = results[i].kyc_updating;
                            groupStatusCountDashboardJsonObj.kycVerificationCount = results[i].kyc_verification;
                            groupStatusCountDashboardJsonObj.leaderSubleaderUpdationCount = results[i].leader_subleader_updation;
                            groupStatusCountDashboardJsonObj.leaderSubleaderVerificationCount = results[i].leader_sub_leader_verification;
                            groupStatusCountDashboardJsonObj.cbaCount = results[i].cba;
                            groupStatusCountDashboardJsonObj.cbaRejected = results[i].cba_rejected;
                            groupStatusCountJsonArray.push(groupStatusCountDashboardJsonObj);
                        }
                        connectionDataSource.releaseConnectionPool(clientConnect);
                        callback(groupStatusCountJsonArray);
                    }else{
                        connectionDataSource.releaseConnectionPool(clientConnect);
                        callback(groupStatusCountJsonArray);
                    }
                }
            });
        });
    },

    getGroupListForSelectedStatusModel : function(branchOfficeId,reportStatus,groupStatus,toDate,callback) {

        var self=this;
        var groupListForSelectedStatusJsonArray = new Array();
        var statusDescription;
        var additonalGroupStatusId = 0;
        /*if(groupStatus == 5) {
            additonalGroupStatusId = 15;
        }*/
        var groupListForSelectedStatusQuery = "SELECT  pg.`group_id`,pg.`group_name`,pg.`center_name`,iu.user_name, "+
                                               "bo.`total_client_count`,bo.`hold_client_count`,bo.`rejected_client_count`, "+
                                                "CONCAT(brs.`report_status_name`  ,'-', IF(bo.`group_status_id`=3,'KYC Updating',IF(bo.`group_status_id`=4,'KYC Verification',IF(bo.`group_status_id`=23,'Leader Sub-Leader Updating',IF(bo.`group_status_id`=24,'Leader Subleader Verification',IF(bo.`group_status_id`=19,'In CBA','CBA Completed')))))) AS status_desc "+
                                               "FROM `iklant_bo_group_details` bo "+
                                               "INNER JOIN `iklant_prospect_group` pg ON pg.`group_id` = bo.`group_id` "+
                                               "INNER JOIN `iklant_prospect_status` ps ON ps.`status_id` = bo.`group_status_id` "+
                                               "INNER JOIN  `iklant_bo_report_status` brs ON brs.`report_status_id` = bo.`report_status_id` "+
                                               "INNER JOIN iklant_users iu ON iu.user_id = pg.created_by "+
                                                "WHERE pg.`office_id` = "+branchOfficeId+" AND bo.`group_status_id` = "+groupStatus+" AND bo.`report_status_id` = "+reportStatus+" AND bo.`date` = '"+toDate+"' ";
        console.log('groupListForSelectedStatusQuery ' + groupListForSelectedStatusQuery);
        customlog.info('groupListForSelectedStatusQuery ' + groupListForSelectedStatusQuery);
        connectionDataSource.getConnection(function(clientConnect){
            clientConnect.query(groupListForSelectedStatusQuery ,function(err,results,fields){
                if(err){
                    customlog.error(err);
                    connectionDataSource.releaseConnectionPool(clientConnect);
                    callback("failure");
                }else{
                    if(results.length > 0){
                        for (var i = 0; i < results.length; i++) {
                            var groupListDashboardJsonObj = {};
                            statusDescription = results[i].status_desc;
                            groupListDashboardJsonObj.groupId = results[i].group_id;
                            groupListDashboardJsonObj.groupName = results[i].group_name;
                            groupListDashboardJsonObj.centerName = results[i].center_name;
                            groupListDashboardJsonObj.totalClientCount = results[i].total_client_count;
                            groupListDashboardJsonObj.holdClientCount = results[i].hold_client_count;
                            groupListDashboardJsonObj.rejectedClientCount = results[i].rejected_client_count;
                            groupListDashboardJsonObj.foName = results[i].user_name;
                            groupListForSelectedStatusJsonArray.push(groupListDashboardJsonObj);
                        }
                        connectionDataSource.releaseConnectionPool(clientConnect);
                        callback(groupListForSelectedStatusJsonArray,statusDescription);
                    }else{
                        connectionDataSource.releaseConnectionPool(clientConnect);
                        callback(groupListForSelectedStatusJsonArray,statusDescription);
                    }
                }
            });
        });


    },

    deoListForClientDataModel : function(clientId,callback){

        var self=this;
        var deoListJson = {};
        var deoListQuery = "SELECT det.client_id, "+
                            "IFNULL((SELECT user_name FROM iklant_users WHERE user_id = det.data_entry_by) ,'-')  AS data_entry_by, "+
                            "IFNULL((SELECT user_name FROM iklant_users WHERE user_id = det.data_verified_by),'-')   AS data_verified_by, "+
                            "IFNULL((SELECT user_name FROM iklant_users WHERE user_id = det.data_entry_updated_by),'-')   AS data_entry_updated_by, "+
                            "IFNULL((SELECT user_name FROM iklant_users WHERE user_id = det.credit_check_by),'-')   AS credit_check_by "+
                            "FROM "+
                            "`iklant_prospect_client_data_entry_tracking` det "+
                            "WHERE client_id  = "+clientId+ "";
        console.log('deoListQuery ' + deoListQuery);
        connectionDataSource.getConnection(function(clientConnect){
            clientConnect.query(deoListQuery ,function(err,results,fields){
                if(err){
                    customlog.error(err);
                    connectionDataSource.releaseConnectionPool(clientConnect);
                    callback("failure");
                }else{
                    if(results.length > 0){
                        for (var i = 0; i < results.length; i++) {
                            deoListJson.clientId = results[i].client_id;
                            deoListJson.dataEntryBy = results[i].data_entry_by;
                            deoListJson.dataVerifiedBy = results[i].data_verified_by;
                            deoListJson.dataEntryUpdatedBy = results[i].data_entry_updated_by;
                            deoListJson.creditCheckBy = results[i].credit_check_by;
                        }
                        connectionDataSource.releaseConnectionPool(clientConnect);
                        callback(deoListJson);
                    }else{
                        deoListJson.clientId = clientId;
                        deoListJson.dataEntryBy = "-";
                        deoListJson.dataVerifiedBy = "-";
                        deoListJson.dataEntryUpdatedBy = "-";
                        deoListJson.creditCheckBy = "-";
                        connectionDataSource.releaseConnectionPool(clientConnect);
                        callback(deoListJson);
                    }
                }
            });
        });

    },

    getRegionalWiseGroupCountSummaryDataModel : function(fromDate,toDate,callback) {

        var self=this;
        var regionalWiseSummaryArray = new Array();
        var totalSummaryJson = {};
        var totalClients = 0;
        var holdedClients = 0;
        var rejectedClients = 0;
        var regionalWiseSummaryQuery = "SELECT ro.`regional_office_id`,ro.`regional_office_name`,tc.total_clients,ho.holded_clients,rc.rejected_clients "+
                                "FROM `regional_office` ro "+
                                "LEFT JOIN  "+
                                "(SELECT io.`regional_office_id`,IFNULL(COUNT(*),0)  AS total_clients FROM  "+
                                "`iklant_prospect_client_data_entry_tracking` det  "+
                                "INNER JOIN `iklant_prospect_client` pc ON pc.client_id = det.client_id "+
                                "INNER JOIN `iklant_prospect_group` pg ON pg.group_id = pc.group_id "+
                                "INNER JOIN  iklant_office io ON io.`office_id` = pg.`office_id` "+
                                "WHERE det.`credit_check_by` IS NOT NULL AND det.`credit_updated_date` BETWEEN  '"+fromDate+"'  AND '"+toDate+"' "+
                                "GROUP BY io.`regional_office_id`) tc ON tc.regional_office_id = ro.`regional_office_id` "+
                                "LEFT JOIN  "+
                                "(SELECT io.`regional_office_id`,IFNULL(COUNT(*),0)  AS holded_clients FROM  `iklant_fo_hold_image_track` ho "+
                                "INNER JOIN  iklant_office io ON io.`office_id` = ho.`office_id` "+
                                "WHERE  ho.`operation_id` NOT IN (36)  AND  DATE(ho.`created_date`) BETWEEN  '"+fromDate+"'  AND '"+toDate+"'  "+
                                "GROUP BY io.`regional_office_id`)ho ON ho.regional_office_id = ro.`regional_office_id` "+
                                "LEFT JOIN  "+
                                "(SELECT io.`regional_office_id`,IFNULL(COUNT(*),0)  AS rejected_clients FROM `iklant_prospect_client`  pc "+
                                "INNER JOIN `iklant_prospect_group` pg ON pg.group_id = pc.group_id "+
                                "INNER JOIN  iklant_office io ON io.`office_id` = pg.`office_id` "+
                                "WHERE pc.status_id IN (15,25,29)  AND  DATE(pc.`updated_date`)  >=  '"+fromDate+"'  AND  DATE(pc.`updated_date`) <= '"+toDate+"'  "+
                                "GROUP BY io.`regional_office_id`) rc ON  rc.regional_office_id = ro.`regional_office_id` "+
                                "ORDER BY ro.`regional_office_id`  ";

        console.log('regionalWiseSummaryQuery ' + regionalWiseSummaryQuery);
        customlog.info('regionalWiseSummaryQuery ' + regionalWiseSummaryQuery);
        connectionDataSource.getConnection(function(clientConnect){
            clientConnect.query(regionalWiseSummaryQuery ,function(err,results,fields){
                if(err){
                    customlog.error(err);
                    connectionDataSource.releaseConnectionPool(clientConnect);
                    callback("failure");
                }else{
                    if(results.length > 0){
                        for (var i = 0; i < results.length; i++) {
                            var regionalSummary = {};
                            regionalSummary.regionalOfficeId = results[i].regional_office_id;
                            regionalSummary.regionalOfficeName = results[i].regional_office_name;
                            regionalSummary.totalClients = results[i].total_clients;
                            totalClients = totalClients + results[i].total_clients;
                            regionalSummary.holdedClients = results[i].holded_clients;
                            holdedClients = holdedClients + results[i].holded_clients;
                            regionalSummary.rejectedClients = results[i].rejected_clients;
                            rejectedClients = rejectedClients +  results[i].rejected_clients;
                            regionalWiseSummaryArray.push(regionalSummary);
                        }
                        connectionDataSource.releaseConnectionPool(clientConnect);
                        totalSummaryJson.totalClients =totalClients ;
                        totalSummaryJson.holdedClients = holdedClients ;
                        totalSummaryJson.rejectedClients = rejectedClients;
                        callback(regionalWiseSummaryArray,totalSummaryJson);
                    }else{
                        connectionDataSource.releaseConnectionPool(clientConnect);
                        totalSummaryJson.totalClients =totalClients ;
                        totalSummaryJson.holdedClients = holdedClients ;
                        totalSummaryJson.rejectedClients = rejectedClients;
                        callback(regionalWiseSummaryArray,totalSummaryJson);
                    }
                }
            });
        });
    },

    getDateWiseGroupCountDataModel : function(fromDate,toDate,callback) {

        var self=this;
        var dateWiseSummaryArray = new Array();
        var moment = require('moment');
        var dateWiseSummaryQuery = "SELECT bod.date, "+
                                    "IFNULL(MAX(CASE WHEN bod.report_status_id = 1 THEN   bod. group_count END),0)  fresh_group, "+
                                    "IFNULL(MAX(CASE WHEN bod.report_status_id = 2 THEN   bod. group_count END),0)    in_progess, "+
                                    "IFNULL(MAX(CASE WHEN bod.report_status_id = 3 THEN   bod. group_count END) ,0)  hold_group, "+
                                    "IFNULL(MAX(CASE WHEN bod.report_status_id = 4 THEN   bod. group_count END ),0)   completed "+
                                    "FROM "+
                                    "(SELECT  bo.`date`,bo.`report_status_id`,brs.`report_status_name`, "+
                                    "COUNT(*)  AS group_count "+
                                    "FROM `iklant_bo_group_details` bo "+
                                    "INNER JOIN `iklant_prospect_group` pg ON pg.`group_id` =  bo.`group_id` "+
                                    "INNER JOIN `iklant_office` io ON io.`office_id` = pg.`office_id` "+
                                    "LEFT JOIN `iklant_bo_report_status` brs ON brs.`report_status_id` = bo.`report_status_id` "+
                                    "INNER  JOIN   `regional_office` ro ON ro.`regional_office_id` = io.`regional_office_id` "+
                                    "WHERE bo.`date` BETWEEN '"+fromDate+"'  AND '"+toDate+"' "+
                                    "GROUP BY bo.`date`,brs.`report_status_id` "+
                                    "ORDER BY bo.`date`,brs.`report_status_id`)  bod "+
                                    "GROUP BY bod.date "+
                                    "ORDER BY bod.date DESC ";

        customlog.info('dateWiseSummaryQuery ' + dateWiseSummaryQuery);

        connectionDataSource.getConnection(function(clientConnect){
            clientConnect.query(dateWiseSummaryQuery ,function(err,results,fields){
                if(err){
                    customlog.error(err);
                    connectionDataSource.releaseConnectionPool(clientConnect);
                    callback("failure");
                }else{
                    if(results.length > 0){
                        for (var i = 0; i < results.length; i++) {
                            var groupCountDashboardJsonObj = {};
                            groupCountDashboardJsonObj.date =  moment(results[i].date).format("YYYY-MM-DD");
                            groupCountDashboardJsonObj.freshGroupCount = results[i].fresh_group;
                            groupCountDashboardJsonObj.inProgressGroupCount = results[i].in_progess;
                            groupCountDashboardJsonObj.holdGroupCount = results[i].hold_group;
                            groupCountDashboardJsonObj.completedGroupCount = results[i].completed;
                            dateWiseSummaryArray.push(groupCountDashboardJsonObj);
                        }
                        connectionDataSource.releaseConnectionPool(clientConnect);
                        callback(dateWiseSummaryArray);
                    }else{
                        connectionDataSource.releaseConnectionPool(clientConnect);
                        callback(dateWiseSummaryArray);
                    }
                }
            });
        });

    },

    deoWiseListDataModel : function(fromDate,toDate ,callback) {

        var self=this;
        var deoWiseSummaryArray = new Array();

        var deoWiseSummaryQuery = "SELECT iu.`user_id`,iu.`user_name`,IFNULL(de.data_entry_count,0) AS data_entry_count, "+
            "IFNULL(dvc.data_verification_count,0) AS data_verification_count, "+
            "IFNULL(duc.data_entry_update_count,0) AS data_entry_update_count, "+
            "IFNULL(ccc.credit_check_count,0) AS credit_check_count "+
            "FROM  iklant_users iu "+
            "INNER JOIN `iklant_user_role` iur ON iur.`user_id` = iu.`user_id` "+
            "LEFT JOIN "+
            "(SELECT iu.`user_id` ,iu.`user_name`,COUNT(*)  AS  data_entry_count FROM `iklant_prospect_client_data_entry_tracking` det "+
            "INNER JOIN iklant_users iu ON iu.`user_id` = det.`data_entry_by`  "+
            "WHERE det.`data_entry_by` IS NOT NULL  AND det.`created_date` BETWEEN '"+fromDate+"'  AND '"+toDate+"' "+
            "GROUP BY  det.`data_entry_by` ) de ON de.user_id = iu.`user_id` "+
            "LEFT JOIN "+
            "(SELECT iu.`user_id` ,iu.`user_name`,COUNT(*)  AS data_verification_count FROM `iklant_prospect_client_data_entry_tracking` det "+
            "INNER JOIN iklant_users iu ON iu.`user_id` = det.`data_verified_by` "+
            "WHERE det.`data_verified_by`IS NOT NULL  AND det.`data_verified_date` BETWEEN '"+fromDate+"'  AND '"+toDate+"'  "+
            "GROUP BY  det.`data_verified_by`) dvc ON dvc.user_id = iu.`user_id`  "+
            "LEFT JOIN  "+
            "(SELECT iu.`user_id` ,iu.`user_name`,COUNT(*)  AS data_entry_update_count  FROM `iklant_prospect_client_data_entry_tracking` det "+
            "INNER JOIN iklant_users iu ON iu.`user_id` = det.`data_entry_updated_by` "+
            "WHERE det.`data_entry_updated_by` IS NOT NULL AND det.`data_entry_updated_date` BETWEEN '"+fromDate+"'  AND '"+toDate+"' "+
            "GROUP BY  det.`data_entry_updated_by`) duc ON duc.user_id = iu.`user_id` "+
            "LEFT JOIN "+
            "(SELECT iu.`user_id` ,iu.`user_name`,COUNT(*)  AS credit_check_count  FROM `iklant_prospect_client_data_entry_tracking` det "+
            "INNER JOIN iklant_users iu ON iu.`user_id` = det.`credit_check_by` "+
            "WHERE det.`credit_check_by` IS NOT NULL  AND det.`credit_updated_date` BETWEEN '"+fromDate+"'  AND '"+toDate+"' "+
            "GROUP BY  det.`credit_check_by`) ccc ON ccc.user_id = iu.`user_id` "+
            "WHERE iur.`role_id` = 6 AND iu.`active_indicator` = 1 "+
            "ORDER BY iu.`user_id` ";

        customlog.info('deoWiseSummaryQuery ' + deoWiseSummaryQuery);

        connectionDataSource.getConnection(function(clientConnect){
            clientConnect.query(deoWiseSummaryQuery ,function(err,results,fields){
                if(err){
                    customlog.error(err);
                    connectionDataSource.releaseConnectionPool(clientConnect);
                    callback("failure");
                }else{
                    if(results.length > 0){
                        for (var i = 0; i < results.length; i++) {
                            var deoDoneGroupJsonObj = {};
                            deoDoneGroupJsonObj.userId = results[i].user_id;
                            deoDoneGroupJsonObj.userName = results[i].user_name;
                            deoDoneGroupJsonObj.dataEntryCount = results[i].data_entry_count;
                            deoDoneGroupJsonObj.dataVeriifcationCount = results[i].data_verification_count;
                            deoDoneGroupJsonObj.dataEntryUpdateCount = results[i].data_entry_update_count;
                            deoDoneGroupJsonObj.creditCheckCount = results[i].credit_check_count;
                            deoWiseSummaryArray.push(deoDoneGroupJsonObj);
                        }
                        connectionDataSource.releaseConnectionPool(clientConnect);
                        callback(deoWiseSummaryArray);
                    }else{
                        connectionDataSource.releaseConnectionPool(clientConnect);
                        callback(deoWiseSummaryArray);
                    }
                }
            });
        });

    }




};
