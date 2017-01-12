module.exports = businessCorrespondentDBDataModel;

var path = require('path');
var rootPath = path.dirname(process.mainModule.filename);
var dbTableName = require(path.join(rootPath,"properties.json"));

var connectionDataSource = require(path.join(rootPath,"app_modules/data_model/DataSource"));
var customlog = require(path.join(rootPath,"logger/loggerConfig.js"))('BusinessCorrespondentDBDataModel.js');
var dateUtils = require(path.join(rootPath,'app_modules/utils/DateUtils'));
var commonUtils = require(path.join(rootPath,'app_modules/utils/commonUtils'));
var commonDTO = path.join(rootPath,"app_modules/dto/common");
var PDFDocument = require('pdfkit');
var ciDB = dbTableName.database;
var mysql = require('mysql');


function businessCorrespondentDBDataModel(constants) {
    customlog.debug("Inside BC Data Access Layer");
    this.constants = constants;
    var excelUtility = require(path.join(rootPath,"app_modules/client_management/customer_identification/model/excelReportUtility.js"));
    this.excelUtility = excelUtility;
}

businessCorrespondentDBDataModel.prototype = {


    getBCSummaryDataModel : function(userId,roleId,groupByColumn,previousDate,callback){

        var self=this;
        var constantsObj = this.constants;
        var bcSummaryJsonArray = new Array();
       /* var bcSummaryQuery = "SELECT  "+
            "	bcp.`bc_id`,bcp.`bc_name`,bd.office_id,bd.display_name, "+
            "	IFNULL(bd.orig_principal,0) + IFNULL(cd.loan_amount,0) AS total_disbursed, "+
            "	IFNULL(bd.actual_principal_demd,0) + IFNULL(cdue.principal_demd,0) AS principal_demanded, "+
            "	IFNULL(bd.actual_principal_paid,0) + IFNULL(cp.principal_paid,0) AS principal_paid, "+
            " 	(IFNULL(bd.orig_principal,0) + IFNULL(cd.loan_amount,0)) -  (IFNULL(bd.actual_principal_paid,0) + IFNULL(cp.principal_paid,0))  AS "+
            "	principal_outstanding "+
            " FROM  "+
            "	`business_correspondent_office` bcp "+
            "	INNER JOIN `personnel` p ON p.`bc_office_id` = bcp.`bc_id` "+
            "	LEFT JOIN "+
            "		(SELECT bc.`bc_id`,o.office_id,o.display_name,SUM(np.`orig_principal`) AS orig_principal , "+
            "			SUM(np.`actual_principal_demd`) AS `actual_principal_demd`, "+
            "			SUM(np.`actual_interest_demd`) AS `actual_interest_demd`, "+
            "			SUM(np.`actual_principal_paid`) AS `actual_principal_paid`, "+
            "			SUM(np.`actual_interest_paid`) AS `actual_interest_paid`, "+
            "			SUM(np.`actual_principal_outstanding`) AS `actual_principal_outstanding`, "+
            "			SUM(np.`actual_interest_outstanding`) AS `actual_interest_outstanding` "+
            "		FROM `npa_summary` np "+
            "			INNER JOIN `office` o ON o.`office_id` = np.`office_id` "+
            "			INNER JOIN `business_correspondent_office` bc ON bc.`bc_id` = o.`bc_id` "+
            "			INNER JOIN `personnel` p ON p.`bc_office_id` = bc.`bc_id` "+
            "		WHERE np.date = '"+previousDate+"' AND p.`personnel_id` = "+userId+" "+
            "		GROUP BY np.date,"+groupByColumn+") bd ON bd.bc_id = bcp.bc_id "+
            "	LEFT JOIN "+
            "		(SELECT  bc.`bc_id`,o.office_id,a.account_id ,SUM(la.`loan_amount`) AS `loan_amount` "+
            "		FROM account a "+
            "			INNER JOIN `loan_account` la ON la.account_id = a.account_id "+
            "			INNER JOIN `office` o ON o.`office_id` = a.`office_id` "+
            "			INNER JOIN `business_correspondent_office` bc ON bc.`bc_id` = o.`bc_id` "+
            "			INNER JOIN `personnel` p ON p.`bc_office_id` = bc.`bc_id` "+
            "		WHERE la.disbursement_date = CURDATE() AND a.account_state_id IN (5,6,7,9,19) AND la.`parent_account_id` IS NULL AND p.`personnel_id` = "+userId+" "+
            "		GROUP BY "+groupByColumn+") cd ON cd.bc_id = bcp.bc_id "+
            "	LEFT JOIN "+
            "		(SELECT bc.`bc_id`, o.office_id, "+
            "			SUM(IFNULL(ls.principal,0)) principal_demd, "+
            "			SUM(IFNULL(ls.interest,0)) interest_demd "+
            "		FROM loan_schedule ls "+
            "			INNER JOIN loan_account la ON ls.account_id = la.account_id "+
            "			INNER JOIN account a ON la.account_id = a.account_id "+
            "			INNER JOIN loan_custom_detail lcd ON lcd.account_id = la.account_id "+
            "			INNER JOIN `office` o ON o.`office_id` = a.`office_id` "+
            "			INNER JOIN `business_correspondent_office` bc ON bc.`bc_id` = o.`bc_id` "+
            "			INNER JOIN `personnel` p ON p.`bc_office_id` = bc.`bc_id` "+
            "		WHERE 	la.disbursement_date <= CURDATE() "+
            "			AND a.account_state_id IN (5,9) "+
            "			AND la.parent_account_id IS NOT NULL "+
            "			AND lcd.individual_tracked = 1  "+
            "			AND ls.action_date = CURDATE() AND p.`personnel_id` = "+userId+" "+
            "		GROUP BY ls.action_date,"+groupByColumn+") cdue ON cdue.bc_id = bcp.bc_id "+
            "	LEFT JOIN "+
            "		(SELECT	bc.`bc_id`, o.office_id, "+
            "			SUM(ltx.principal_amount) principal_paid, "+
            "           SUM(ltx.interest_amount) interest_paid, "+
            "			SUM(ltx.principal_amount) + SUM(ltx.interest_amount) + SUM(ltx.misc_fee_amount) "+
            "			+ SUM(ltx.penalty_amount) + SUM(ltx.misc_penalty_amount) total_paid "+
            "		FROM account_payment ap "+
            "			INNER JOIN account_trxn atx ON ap.payment_id = atx.payment_id "+
            "			INNER JOIN loan_trxn_detail ltx ON atx.account_trxn_id = ltx.account_trxn_id "+
            "			INNER JOIN loan_account la ON ap.account_id = la.account_id "+
            "			INNER JOIN account a ON la.account_id = a.account_id "+
            "			INNER JOIN `office` o ON o.`office_id` = a.`office_id` "+
            "			INNER JOIN `business_correspondent_office` bc ON bc.`bc_id` = o.`bc_id` "+
            "			INNER JOIN `personnel` p ON p.`bc_office_id` = bc.`bc_id` "+
            "		WHERE la.parent_account_id IS NOT NULL "+
            "			AND a.account_state_id IN (5,6,7,9,19) "+
            "			AND ap.payment_date = CURDATE() "+
            "			AND ap.amount <> 0 "+
            "			AND atx.account_action_id IN (1,2,3,4,5,15,16,17) "+
            "			AND p.`personnel_id` = "+userId+" "+
            "		GROUP BY ap.payment_date,"+groupByColumn+")cp ON cp.bc_id = bcp.bc_id "+
            " WHERE p.`personnel_id` = "+userId+" ";*/
        var bcSummaryQuery = "SELECT  "+
            "	bcp.`bc_id`,bcp.`bc_name`,bd.office_id,bd.display_name, "+
            "	IFNULL(bd.orig_principal,0) + IFNULL(cd.loan_amount,0) AS total_disbursed, "+
            "	IFNULL(bd.actual_principal_demd,0) + IFNULL(cp.principal_demanded,0) AS principal_demanded, "+
            "   IFNULL(cp.principal_demanded,0) AS todays_principal_demanded, " +
            "	IFNULL(bd.actual_principal_paid,0) + IFNULL(cp.principal_paid,0) AS principal_paid, "+
            " 	(IFNULL(bd.orig_principal,0) + IFNULL(cd.loan_amount,0)) -  (IFNULL(bd.actual_principal_paid,0) + IFNULL(cp.principal_paid,0))  AS "+
            "	principal_outstanding "+
            " FROM  "+
            "	`business_correspondent_office` bcp "+
            "	INNER JOIN `personnel` p ON p.`bc_office_id` = bcp.`bc_id` "+
            "	LEFT JOIN "+
            "		(SELECT bc.`bc_id`,o.office_id,o.display_name,SUM(np.`orig_principal`) AS orig_principal , "+
            "			SUM(np.`actual_principal_demd`) AS `actual_principal_demd`, "+
            "			SUM(np.`actual_interest_demd`) AS `actual_interest_demd`, "+
            "			SUM(np.`actual_principal_paid`) AS `actual_principal_paid`, "+
            "			SUM(np.`actual_interest_paid`) AS `actual_interest_paid`, "+
            "			SUM(np.`actual_principal_outstanding`) AS `actual_principal_outstanding`, "+
            "			SUM(np.`actual_interest_outstanding`) AS `actual_interest_outstanding` "+
            "		FROM `npa_summary` np "+
            "			INNER JOIN `office` o ON o.`office_id` = np.`office_id` "+
            "			INNER JOIN `business_correspondent_office` bc ON bc.`bc_id` = o.`bc_id` "+
            "			INNER JOIN `personnel` p ON p.`bc_office_id` = bc.`bc_id` "+
            "		WHERE np.date = '"+previousDate+"' AND p.`personnel_id` = "+userId+" "+
            "		GROUP BY np.date,"+groupByColumn+") bd ON bd.bc_id = bcp.bc_id "+
            "	LEFT JOIN "+
            "		(SELECT  bc.`bc_id`,o.office_id,a.account_id ,SUM(la.`loan_amount`) AS `loan_amount` "+
            "		FROM account a "+
            "			INNER JOIN `loan_account` la ON la.account_id = a.account_id "+
            "			INNER JOIN `office` o ON o.`office_id` = a.`office_id` "+
            "			INNER JOIN `business_correspondent_office` bc ON bc.`bc_id` = o.`bc_id` "+
            "			INNER JOIN `personnel` p ON p.`bc_office_id` = bc.`bc_id` "+
            "		WHERE la.disbursement_date = CURDATE() AND a.account_state_id IN (5,6,7,9,19) AND la.`parent_account_id` IS NULL AND p.`personnel_id` = "+userId+" "+
            "		GROUP BY "+groupByColumn+") cd ON cd.bc_id = bcp.bc_id "+
            "	LEFT JOIN "+
            "		(SELECT   "+
        "            	bcp.bc_id,bcp.`bc_name`,o.office_id,o.display_name,  "+
        "            	IFNULL(SUM(cdue.principal_demd),0) AS principal_demanded, "+
        "            	IFNULL(SUM(cdue.interest_demd),0) AS interest_demd, "+
        "            	IFNULL(SUM(cp.principal_paid),0) AS principal_paid, "+
        "            	IFNULL(SUM(cp.interest_paid),0) AS interest_paid, "+
        "            	IFNULL(SUM(cdue.principal_demd),0) + IFNULL(SUM(cdue.interest_demd),0)  AS total_demd, "+
        "            	IFNULL(SUM(cp.principal_paid),0) + IFNULL(SUM(cp.interest_paid),0)  AS total_paid, "+
        "            	IFNULL(SUM(cdue.principal_demd),0) -  IFNULL(SUM(cp.principal_paid),0) AS principal_overdue, "+
        "            	IFNULL(SUM(cdue.interest_demd),0)  -  IFNULL(SUM(cp.interest_paid),0)  AS interest_overdue, "+
        "            	(IFNULL(SUM(cdue.principal_demd),0) + IFNULL(SUM(cdue.interest_demd),0))  -  (IFNULL(SUM(cp.principal_paid),0) + "+
        "		IFNULL(SUM(cp.interest_paid),0)) AS total_overdue "+
        "     FROM  "+
        "            loan_account a  "+
        "            INNER JOIN account la ON la.account_id = a.parent_account_id "+
        "            INNER JOIN `office` o ON o.office_id = la.`office_id` "+
        "            INNER JOIN `business_correspondent_office` bcp ON bcp.`bc_id` = o.`bc_id`  "+
        "            INNER JOIN `personnel` p ON p.`bc_office_id` = bcp.`bc_id`  "+
        "            LEFT JOIN  "+
        "            	(SELECT  a.account_id, "+
        "            		SUM(IFNULL(ls.principal,0)) principal_demd,  "+
        "            		SUM(IFNULL(ls.interest,0)) interest_demd  "+
        "            	FROM 	loan_schedule ls  "+
        "            		INNER JOIN loan_account la ON ls.account_id = la.account_id  "+
        "            		INNER JOIN account a ON la.account_id = a.account_id  "+
        "            		INNER JOIN loan_custom_detail lcd ON lcd.account_id = la.account_id  "+
        "            	WHERE 	la.disbursement_date <= CURDATE()  "+
        "            		AND a.account_state_id IN (5,6,7,9,19)  "+
        "            		AND la.parent_account_id IS NOT NULL  "+
        "            		AND lcd.individual_tracked = 1   "+
        "            		AND ls.action_date = CURDATE()  "+
        "            	GROUP BY a.account_id) cdue ON cdue.account_id = a.account_id "+
        "            	LEFT JOIN  "+
        "            	(SELECT	a.account_id, "+
        "            		SUM(ltx.principal_amount) principal_paid,  "+
        "            		SUM(ltx.interest_amount) interest_paid,  "+
        "            		SUM(ltx.principal_amount) + SUM(ltx.interest_amount) + SUM(ltx.misc_fee_amount)  "+
        "            		+ SUM(ltx.penalty_amount) + SUM(ltx.misc_penalty_amount) total_paid  "+
        "             	 FROM 	account_payment ap  "+
        "            		INNER JOIN account_trxn atx ON ap.payment_id = atx.payment_id  "+
        "            		INNER JOIN loan_trxn_detail ltx ON atx.account_trxn_id = ltx.account_trxn_id  "+
        "            		INNER JOIN loan_account la ON ap.account_id = la.account_id  "+
        "            		INNER JOIN account a ON la.account_id = a.account_id  "+
        "            	WHERE	la.parent_account_id IS NOT NULL  "+
        "            		AND a.account_state_id IN (5,6,7,9,19)   "+
        "            		AND ap.payment_date = CURDATE()  "+
        "            		AND ap.amount <> 0  "+
        "            		AND atx.account_action_id IN (1,2,3,4,5,15,16,17)  "+
        "            	GROUP BY a.account_id)cp ON cp.account_id = a.account_id "+
        "            WHERE  "+
        "            p.`personnel_id` = "+userId+"  AND  la.account_state_id IN (5,6,9,19) "+
        " 		GROUP BY bcp.bc_id )cp ON cp.bc_id = bcp.bc_id "+
            " WHERE p.`personnel_id` = "+userId+" ";
        customlog.info("bcSummaryQuery : " + bcSummaryQuery);
        connectionDataSource.getConnection(function(clientConnect){
            clientConnect.query(bcSummaryQuery ,function(err,results,fields){
                if(err){
                    customlog.error(err);
                    connectionDataSource.releaseConnectionPool(clientConnect);
                    callback("failure");
                }else{
                    if(results.length > 0){
                        for (var i = 0; i < results.length; i++) {
                            var bcSummaryJson = {};
                            bcSummaryJson.totalDisbursed = results[i].total_disbursed;
                            bcSummaryJson.totalPrincipalDemanded = results[i].principal_demanded;
                            bcSummaryJson.todaysPrincipalDemanded = results[i].todays_principal_demanded;
                            bcSummaryJson.totalCollected = results[i].principal_paid;
                            bcSummaryJson.totalPrincipalOutstanding = results[i].principal_outstanding;
                            bcSummaryJson.totalDisbursedLabel = intToFormat(results[i].total_disbursed);
                            bcSummaryJson.totalPrincipalDemandedLabel = intToFormat(results[i].principal_demanded);
                            bcSummaryJson.totalCollectedLabel = intToFormat(results[i].principal_paid);
                            bcSummaryJson.totalPrincipalOutstandingLabel = intToFormat(results[i].principal_outstanding);
                            bcSummaryJson.bcId = results[i].bc_id;
                            bcSummaryJson.bcName = results[i].bc_name;
                            bcSummaryJson.officeId = results[i].office_id;
                            bcSummaryJson.officeName = results[i].display_name;
                            bcSummaryJsonArray.push(bcSummaryJson);
                        }
                        connectionDataSource.releaseConnectionPool(clientConnect);
                        callback(bcSummaryJsonArray);
                    }else{
                        connectionDataSource.releaseConnectionPool(clientConnect);
                        callback(bcSummaryJsonArray);
                    }
                }
            });
        });
    },

    getBCOfficeWiseSummaryDataModel : function(userId,roleId,groupByColumn,previousDate,callback){

        var self=this;
        var constantsObj = this.constants;
        var bcSummaryJsonArray = new Array();
        var bcSummaryQuery = "SELECT  "+
            "	bcp.`bc_id`,bcp.`bc_name`,bd.office_id,bd.display_name, "+
            "	IFNULL(bd.orig_principal,0) + IFNULL(cd.loan_amount,0) AS total_disbursed, "+
            "	IFNULL(bd.actual_principal_demd,0) + IFNULL(cp.principal_demanded,0) AS principal_demanded, "+
            "	IFNULL(bd.actual_principal_paid,0) + IFNULL(cp.principal_paid,0) AS principal_paid, "+
            " 	(IFNULL(bd.orig_principal,0) + IFNULL(cd.loan_amount,0)) -  (IFNULL(bd.actual_principal_paid,0) + IFNULL(cp.principal_paid,0))  AS "+
            "	principal_outstanding "+
            " FROM  "+
            "	`business_correspondent_office` bcp "+
            "  INNER JOIN `office` o ON o.bc_id = bcp.`bc_id` "+
            "	INNER JOIN `personnel` p ON p.`bc_office_id` = bcp.`bc_id` "+
            "	LEFT JOIN "+
            "		(SELECT bc.`bc_id`,o.office_id,o.display_name,SUM(np.`orig_principal`) AS orig_principal , "+
            "			SUM(np.`actual_principal_demd`) AS `actual_principal_demd`, "+
            "			SUM(np.`actual_interest_demd`) AS `actual_interest_demd`, "+
            "			SUM(np.`actual_principal_paid`) AS `actual_principal_paid`, "+
            "			SUM(np.`actual_interest_paid`) AS `actual_interest_paid`, "+
            "			SUM(np.`actual_principal_outstanding`) AS `actual_principal_outstanding`, "+
            "			SUM(np.`actual_interest_outstanding`) AS `actual_interest_outstanding` "+
            "		FROM `npa_summary` np "+
            "			INNER JOIN `office` o ON o.`office_id` = np.`office_id` "+
            "			INNER JOIN `business_correspondent_office` bc ON bc.`bc_id` = o.`bc_id` "+
            "			INNER JOIN `personnel` p ON p.`bc_office_id` = bc.`bc_id` "+
            "		WHERE np.date = '"+previousDate+"' AND p.`personnel_id` = "+userId+" "+
            "		GROUP BY np.date,"+groupByColumn+") bd ON bd.office_id = o.office_id "+
            "	LEFT JOIN "+
            "		(SELECT  bc.`bc_id`,o.office_id,a.account_id ,SUM(la.`loan_amount`) AS `loan_amount` "+
            "		FROM account a "+
            "			INNER JOIN `loan_account` la ON la.account_id = a.account_id "+
            "			INNER JOIN `office` o ON o.`office_id` = a.`office_id` "+
            "			INNER JOIN `business_correspondent_office` bc ON bc.`bc_id` = o.`bc_id` "+
            "			INNER JOIN `personnel` p ON p.`bc_office_id` = bc.`bc_id` "+
            "		WHERE la.disbursement_date = CURDATE() AND a.account_state_id IN (5,6,7,9,19) AND la.`parent_account_id` IS NULL AND p.`personnel_id` = "+userId+" "+
            "		GROUP BY "+groupByColumn+") cd ON cd.office_id = o.office_id "+
            "	LEFT JOIN "+
            "		(SELECT   "+
        "            	bcp.bc_id,bcp.`bc_name`,o.office_id,o.display_name,  "+
        "            	IFNULL(SUM(cdue.principal_demd),0) AS principal_demanded, "+
        "            	IFNULL(SUM(cdue.interest_demd),0) AS interest_demd, "+
        "            	IFNULL(SUM(cp.principal_paid),0) AS principal_paid, "+
        "            	IFNULL(SUM(cp.interest_paid),0) AS interest_paid, "+
        "            	IFNULL(SUM(cdue.principal_demd),0) + IFNULL(SUM(cdue.interest_demd),0)  AS total_demd, "+
        "            	IFNULL(SUM(cp.principal_paid),0) + IFNULL(SUM(cp.interest_paid),0)  AS total_paid, "+
        "            	IFNULL(SUM(cdue.principal_demd),0) -  IFNULL(SUM(cp.principal_paid),0) AS principal_overdue, "+
        "            	IFNULL(SUM(cdue.interest_demd),0)  -  IFNULL(SUM(cp.interest_paid),0)  AS interest_overdue, "+
        "            	(IFNULL(SUM(cdue.principal_demd),0) + IFNULL(SUM(cdue.interest_demd),0))  -  (IFNULL(SUM(cp.principal_paid),0) + "+
        "		IFNULL(SUM(cp.interest_paid),0)) AS total_overdue "+
        "     FROM  "+
        "            loan_account a  "+
        "            INNER JOIN account la ON la.account_id = a.parent_account_id "+
        "            INNER JOIN `office` o ON o.office_id = la.`office_id` "+
        "            INNER JOIN `business_correspondent_office` bcp ON bcp.`bc_id` = o.`bc_id`  "+
        "            INNER JOIN `personnel` p ON p.`bc_office_id` = bcp.`bc_id`  "+
        "            LEFT JOIN  "+
        "            	(SELECT  a.account_id, "+
        "            		SUM(IFNULL(ls.principal,0)) principal_demd,  "+
        "            		SUM(IFNULL(ls.interest,0)) interest_demd  "+
        "            	FROM 	loan_schedule ls  "+
        "            		INNER JOIN loan_account la ON ls.account_id = la.account_id  "+
        "            		INNER JOIN account a ON la.account_id = a.account_id  "+
        "            		INNER JOIN loan_custom_detail lcd ON lcd.account_id = la.account_id  "+
        "            	WHERE 	la.disbursement_date <= CURDATE()  "+
        "            		AND a.account_state_id IN (5,6,7,9,19)  "+
        "            		AND la.parent_account_id IS NOT NULL  "+
        "            		AND lcd.individual_tracked = 1   "+
        "            		AND ls.action_date = CURDATE()  "+
        "            	GROUP BY a.account_id) cdue ON cdue.account_id = a.account_id "+
        "            	LEFT JOIN  "+
        "            	(SELECT	a.account_id, "+
        "            		SUM(ltx.principal_amount) principal_paid,  "+
        "            		SUM(ltx.interest_amount) interest_paid,  "+
        "            		SUM(ltx.principal_amount) + SUM(ltx.interest_amount) + SUM(ltx.misc_fee_amount)  "+
        "            		+ SUM(ltx.penalty_amount) + SUM(ltx.misc_penalty_amount) total_paid  "+
        "             	 FROM 	account_payment ap  "+
        "            		INNER JOIN account_trxn atx ON ap.payment_id = atx.payment_id  "+
        "            		INNER JOIN loan_trxn_detail ltx ON atx.account_trxn_id = ltx.account_trxn_id  "+
        "            		INNER JOIN loan_account la ON ap.account_id = la.account_id  "+
        "            		INNER JOIN account a ON la.account_id = a.account_id  "+
        "            	WHERE	la.parent_account_id IS NOT NULL  "+
        "            		AND a.account_state_id IN (5,6,7,9,19)   "+
        "            		AND ap.payment_date = CURDATE()  "+
        "            		AND ap.amount <> 0  "+
        "            		AND atx.account_action_id IN (1,2,3,4,5,15,16,17)  "+
        "            	GROUP BY a.account_id)cp ON cp.account_id = a.account_id "+
        "            WHERE  "+
        "            p.`personnel_id` = "+userId+"  AND  la.account_state_id IN (5,6,9,19) "+
        " 		GROUP BY o.office_id)cp ON cp.office_id = o.office_id "+
            " WHERE p.`personnel_id` = "+userId+" " +
            "GROUP BY o.office_id ";
        customlog.info("bcSummaryQuery for office : " + bcSummaryQuery);
        console.log("bcSummaryQuery for office : " + bcSummaryQuery);

        connectionDataSource.getConnection(function(clientConnect){
            clientConnect.query(bcSummaryQuery ,function(err,results,fields){
                if(err){
                    customlog.error(err);
                    connectionDataSource.releaseConnectionPool(clientConnect);
                    callback("failure");
                }else{
                    if(results.length > 0){
                        for (var i = 0; i < results.length; i++) {
                            var bcSummaryJson = {};
                            bcSummaryJson.totalDisbursed = results[i].total_disbursed;
                            bcSummaryJson.totalPrincipalDemanded = results[i].principal_demanded;
                            bcSummaryJson.totalCollected = results[i].principal_paid;
                            bcSummaryJson.totalPrincipalOutstanding = results[i].principal_outstanding;
                            bcSummaryJson.totalDisbursedLabel = intToFormat(results[i].total_disbursed);
                            bcSummaryJson.totalPrincipalDemandedLabel = intToFormat(results[i].principal_demanded);
                            bcSummaryJson.totalCollectedLabel = intToFormat(results[i].principal_paid);
                            bcSummaryJson.totalPrincipalOutstandingLabel = intToFormat(results[i].principal_outstanding);
                            bcSummaryJson.bcId = results[i].bc_id;
                            bcSummaryJson.bcName = results[i].bc_name;
                            bcSummaryJson.officeId = results[i].office_id;
                            bcSummaryJson.officeName = results[i].display_name;
                            bcSummaryJsonArray.push(bcSummaryJson);
                        }
                        connectionDataSource.releaseConnectionPool(clientConnect);
                        callback(bcSummaryJsonArray);
                    }else{
                        connectionDataSource.releaseConnectionPool(clientConnect);
                        callback(bcSummaryJsonArray);
                    }
                }
            });
        });
    },

    getBCDemandVsCollectionSummaryDataModel : function(userId,roleId,groupByColumn,fromDate,toDate,callback){

        var self=this;
        var constantsObj = this.constants;
        var bcDemandVsCollectionSummaryJsonArray = new Array();
        var bcDemandVsCollectionSummaryQuery = "SELECT   "+
            "            	bcp.bc_id,bcp.`bc_name`,o.office_id,o.display_name,  "+
            "            	IFNULL(SUM(cdue.principal_demd),0) AS principal_demanded, "+
            "            	IFNULL(SUM(cdue.interest_demd),0) AS interest_demd, "+
            "            	IFNULL(SUM(cp.principal_paid),0) AS principal_paid, "+
            "            	IFNULL(SUM(cp.interest_paid),0) AS interest_paid, "+
            "            	IFNULL(SUM(cdue.principal_demd),0) + IFNULL(SUM(cdue.interest_demd),0)  AS total_demd, "+
            "            	IFNULL(SUM(cp.principal_paid),0) + IFNULL(SUM(cp.interest_paid),0)  AS total_paid, "+
            "            	IFNULL(SUM(cdue.principal_demd),0) -  IFNULL(SUM(cp.principal_paid),0) AS principal_overdue, "+
            "            	IFNULL(SUM(cdue.interest_demd),0)  -  IFNULL(SUM(cp.interest_paid),0)  AS interest_overdue, "+
            "            	(IFNULL(SUM(cdue.principal_demd),0) + IFNULL(SUM(cdue.interest_demd),0))  -  (IFNULL(SUM(cp.principal_paid),0) + "+
            "		IFNULL(SUM(cp.interest_paid),0)) AS total_overdue "+
            "     FROM  "+
            "            loan_account a  "+
            "            INNER JOIN account la ON la.account_id = a.parent_account_id "+
            "            INNER JOIN `office` o ON o.office_id = la.`office_id` "+
            "            INNER JOIN `business_correspondent_office` bcp ON bcp.`bc_id` = o.`bc_id`  "+
            "            INNER JOIN `personnel` p ON p.`bc_office_id` = bcp.`bc_id`  "+
            "            LEFT JOIN  "+
            "            	(SELECT  a.account_id, "+
            "            		SUM(IFNULL(ls.principal,0)) principal_demd,  "+
            "            		SUM(IFNULL(ls.interest,0)) interest_demd  "+
            "            	FROM 	loan_schedule ls  "+
            "            		INNER JOIN loan_account la ON ls.account_id = la.account_id  "+
            "            		INNER JOIN account a ON la.account_id = a.account_id  "+
            "            		INNER JOIN loan_custom_detail lcd ON lcd.account_id = la.account_id  "+
            "            	WHERE 	la.disbursement_date <= CURDATE()  "+
            "            		  "+
            "            		AND la.parent_account_id IS NOT NULL  "+
            "            		AND lcd.individual_tracked = 1   "+
            //"            		AND ls.action_date >= '"+fromDate+"' AND  ls.action_date <= '"+toDate+"'  "+
            " AND (a.account_state_id IN (5,6,9,19)AND ls.action_date BETWEEN '"+fromDate+"' AND IF(ls.payment_date < '"+fromDate+"',ls.payment_date, '"+toDate+"')) "+
            " OR (a.account_state_id  IN (7,8) AND ls.action_date BETWEEN '"+fromDate+"' AND IF(a.closed_date < '"+toDate+"', a.closed_date, '"+toDate+"') "+
            " AND a.closed_date >= '"+fromDate+"' AND ls.payment_date >= '"+fromDate+"' ) "+
            "            	GROUP BY a.account_id) cdue ON cdue.account_id = a.account_id "+
            "            	LEFT JOIN  "+
            "            	(SELECT	a.account_id, "+
            "            		SUM(ltx.principal_amount) principal_paid,  "+
            "            		SUM(ltx.interest_amount) interest_paid,  "+
            "            		SUM(ltx.principal_amount) + SUM(ltx.interest_amount) + SUM(ltx.misc_fee_amount)  "+
            "            		+ SUM(ltx.penalty_amount) + SUM(ltx.misc_penalty_amount) total_paid  "+
            "             	 FROM 	account_payment ap  "+
            "            		INNER JOIN account_trxn atx ON ap.payment_id = atx.payment_id  "+
            "            		INNER JOIN loan_trxn_detail ltx ON atx.account_trxn_id = ltx.account_trxn_id  "+
            "            		INNER JOIN loan_account la ON ap.account_id = la.account_id  "+
            "            		INNER JOIN account a ON la.account_id = a.account_id  "+
            "            	WHERE	la.parent_account_id IS NOT NULL  "+
            "            		AND a.account_state_id IN (5,6,7,9,19)   "+
            "            		AND ap.payment_date >= '"+fromDate+"' AND  ap.payment_date <= '"+toDate+"'  "+
            "            		AND ap.amount <> 0  "+
            "            		AND atx.account_action_id IN (1,2,3,4,5,15,16,17)  "+
            "            	GROUP BY a.account_id)cp ON cp.account_id = a.account_id "+
            "            WHERE  "+
            "            p.`personnel_id` = "+userId+"  AND  la.account_state_id IN (5,6,9,19) "+
            " 		GROUP BY "+groupByColumn+" ";


        customlog.info("bcDemandVsCollectionSummaryQuery : " + bcDemandVsCollectionSummaryQuery);

        connectionDataSource.getConnection(function(clientConnect){
            clientConnect.query(bcDemandVsCollectionSummaryQuery ,function(err,results,fields){
                if(err){
                    customlog.error(err);
                    connectionDataSource.releaseConnectionPool(clientConnect);
                    callback("failure");
                }else{
                    if(results.length > 0){
                        for (var i = 0; i < results.length; i++) {
                            var bcDemandVsCollectionSummaryJson = {};
                            bcDemandVsCollectionSummaryJson.totalPrincipalDemanded = results[i].principal_demanded;
                            bcDemandVsCollectionSummaryJson.totalInterestDemanded = results[i].interest_demd;
                            bcDemandVsCollectionSummaryJson.totalPrincipalPaid = results[i].principal_paid;
                            bcDemandVsCollectionSummaryJson.totalInterestPaid = results[i].interest_paid;
                            bcDemandVsCollectionSummaryJson.totalDemanded = results[i].total_demd;
                            bcDemandVsCollectionSummaryJson.totalCollected = results[i].total_paid;
                            bcDemandVsCollectionSummaryJson.totalPrincipalOverdue = results[i].principal_overdue;
                            bcDemandVsCollectionSummaryJson.totalInterestOverdue = results[i].interest_overdue;
                            bcDemandVsCollectionSummaryJson.totalOverdue = results[i].total_overdue;
                            bcDemandVsCollectionSummaryJson.bcId = results[i].bc_id;
                            bcDemandVsCollectionSummaryJson.bcName = results[i].bc_name;
                            bcDemandVsCollectionSummaryJson.officeId = results[i].office_id;
                            bcDemandVsCollectionSummaryJson.officeName = results[i].display_name;
                            bcDemandVsCollectionSummaryJsonArray.push(bcDemandVsCollectionSummaryJson);
                        }
                        connectionDataSource.releaseConnectionPool(clientConnect);
                        callback(bcDemandVsCollectionSummaryJsonArray);
                    }else{
                        connectionDataSource.releaseConnectionPool(clientConnect);
                        callback(bcDemandVsCollectionSummaryJsonArray);
                    }
                }
            });
        });

    },

    getBCDemandVsCollectionOfficeWiseyDataModel : function(userId,roleId,groupByColumn,fromDate,toDate,callback){

        var self=this;
        var constantsObj = this.constants;
        var bcDemandVsCollectionSummaryJsonArray = new Array();
        var bcDemandVsCollectionOfficeWiseQuery = "SELECT  "+
            "	bcp.`bc_id`,bcp.`bc_name`,cdue.office_id,cdue.display_name, "+
            "	IFNULL(cdue.principal_demd,0) AS principal_demanded, "+
            "	IFNULL(cdue.interest_demd,0) AS interest_demd, "+
            "	IFNULL(cdue.principal_demd,0) + IFNULL(cdue.interest_demd,0) AS total_demd, "+
            "	IFNULL(cp.principal_paid,0) AS principal_paid, "+
            "	IFNULL(cp.interest_paid,0) AS interest_paid, "+
            "	IFNULL(cp.interest_paid,0) +  IFNULL(interest_paid,0) AS total_paid, "+
            "	IFNULL(cdue.principal_demd,0) - IFNULL(cp.principal_paid,0) AS principal_overdue, "+
            "	IFNULL(cdue.interest_demd,0) - IFNULL(cp.interest_paid,0) AS interest_overdue, "+
            "	(IFNULL(cdue.principal_demd,0) - IFNULL(cp.principal_paid,0)) +  (IFNULL(cdue.interest_demd,0) - IFNULL(cp.interest_paid,0))  AS "+
            " total_overdue "+
            "FROM `business_correspondent_office` bcp "+
            "     INNER JOIN `office` o ON o.bc_id = bcp.`bc_id` "+
            "	INNER JOIN `personnel` p ON p.`bc_office_id` = bcp.`bc_id` "+
            "	LEFT JOIN "+
            "	(SELECT bc.`bc_id`, o.office_id,o.display_name, "+
            "		SUM(IFNULL(ls.principal,0)) principal_demd, "+
            "		SUM(IFNULL(ls.interest,0)) interest_demd "+
            "	FROM 	loan_schedule ls "+
            "		INNER JOIN loan_account la ON ls.account_id = la.account_id "+
            "		INNER JOIN account a ON la.account_id = a.account_id "+
            "		INNER JOIN loan_custom_detail lcd ON lcd.account_id = la.account_id "+
            "		INNER JOIN `office` o ON o.`office_id` = a.`office_id` "+
            "		INNER JOIN `business_correspondent_office` bc ON bc.`bc_id` = o.`bc_id` "+
            "		INNER JOIN `personnel` p ON p.`bc_office_id` = bc.`bc_id` "+
            "	WHERE 	la.disbursement_date <= CURDATE() "+
            "		AND a.account_state_id IN (5,9) "+
            "		AND la.parent_account_id IS NOT NULL "+
            "		AND lcd.individual_tracked = 1  "+
            "		AND ls.action_date >= '"+fromDate+"' AND  ls.action_date <= '"+toDate+"' AND p.`personnel_id` = "+userId+" "+
            "	GROUP BY "+groupByColumn+") cdue ON cdue.office_id = o.office_id "+
            "	LEFT JOIN "+
            "	(SELECT	bc.`bc_id`, o.office_id, "+
            "		SUM(ltx.principal_amount) principal_paid, "+
            "		SUM(ltx.interest_amount) interest_paid, "+
            "		SUM(ltx.principal_amount) + SUM(ltx.interest_amount) + SUM(ltx.misc_fee_amount) "+
            "		+ SUM(ltx.penalty_amount) + SUM(ltx.misc_penalty_amount) total_paid "+
            " 	 FROM 	account_payment ap "+
            "		INNER JOIN account_trxn atx ON ap.payment_id = atx.payment_id "+
            "		INNER JOIN loan_trxn_detail ltx ON atx.account_trxn_id = ltx.account_trxn_id "+
            "		INNER JOIN loan_account la ON ap.account_id = la.account_id "+
            "		INNER JOIN loan_schedule ls ON ls.account_id = la.account_id "+
            "		INNER JOIN account a ON la.account_id = a.account_id "+
            "		INNER JOIN `office` o ON o.`office_id` = a.`office_id` "+
            "		INNER JOIN `business_correspondent_office` bc ON bc.`bc_id` = o.`bc_id` "+
            "		INNER JOIN `personnel` p ON p.`bc_office_id` = bc.`bc_id` "+
            "	WHERE	la.parent_account_id IS NOT NULL "+
            "		AND a.account_state_id IN (5,6,7,9,19)  "+
            "		AND ls.action_date >= '"+fromDate+"' AND  ls.action_date <= '"+toDate+"' "+
            "		AND ap.payment_date >= '"+fromDate+"' AND  ap.payment_date <= '"+toDate+"' "+
            "		AND ap.amount <> 0 "+
            "		AND atx.account_action_id IN (1,2,3,4,5,15,16,17) "+
            "		AND p.`personnel_id` = "+userId+" "+
            "	GROUP BY "+groupByColumn+")cp ON cp.office_id = o.office_id "+
            "WHERE p.`personnel_id` = "+userId+ " " +
            " GROUP BY o.office_id ";

        customlog.info("bcDemandVsCollectionOfficeWiseQuery : " + bcDemandVsCollectionOfficeWiseQuery);

        connectionDataSource.getConnection(function(clientConnect){
            clientConnect.query(bcDemandVsCollectionOfficeWiseQuery ,function(err,results,fields){
                if(err){
                    customlog.error(err);
                    connectionDataSource.releaseConnectionPool(clientConnect);
                    callback("failure");
                }else{
                    if(results.length > 0){
                        for (var i = 0; i < results.length; i++) {
                            var bcDemandVsCollectionSummaryJson = {};
                            bcDemandVsCollectionSummaryJson.totalPrincipalDemanded = results[i].principal_demanded;
                            bcDemandVsCollectionSummaryJson.totalInterestDemanded = results[i].interest_demd;
                            bcDemandVsCollectionSummaryJson.totalPrincipalPaid = results[i].principal_paid;
                            bcDemandVsCollectionSummaryJson.totalInterestPaid = results[i].interest_paid;
                            bcDemandVsCollectionSummaryJson.totalDemanded = results[i].total_demd;
                            bcDemandVsCollectionSummaryJson.totalCollected = results[i].total_paid;
                            bcDemandVsCollectionSummaryJson.totalPrincipalOverdue = results[i].principal_overdue;
                            bcDemandVsCollectionSummaryJson.totalInterestOverdue = results[i].interest_overdue;
                            bcDemandVsCollectionSummaryJson.totalOverdue = results[i].total_overdue;
                            bcDemandVsCollectionSummaryJson.bcId = results[i].bc_id;
                            bcDemandVsCollectionSummaryJson.bcName = results[i].bc_name;
                            bcDemandVsCollectionSummaryJson.officeId = results[i].office_id;
                            bcDemandVsCollectionSummaryJson.officeName = results[i].display_name;
                            bcDemandVsCollectionSummaryJsonArray.push(bcDemandVsCollectionSummaryJson);
                        }
                        connectionDataSource.releaseConnectionPool(clientConnect);
                        callback(bcDemandVsCollectionSummaryJsonArray);
                    }else{
                        connectionDataSource.releaseConnectionPool(clientConnect);
                        callback(bcDemandVsCollectionSummaryJsonArray);
                    }
                }
            });
        });

    },
        //Added By Sathish Kumar M #008 for Sales Pile Line Dashboard
    getBCSalesPipeLineBranchWiseDataModel : function(userId,roleId,groupByColumn,callback){
        var self=this;
        var constantsObj = this.constants;
        var bcSalesJsonArray = new Array();
        var bcSalesJsonTotalArray = new Array();
        var bcSalesQuery = "SELECT "+
            "   io.office_id,"+
            "   io.display_name AS office_name, "+
            "   IFNULL(kyc_process.kyc_process_count,0) AS kyc_process,"+
            "   IFNULL(field_verification.field_verification_count,0) AS field_verification, "+
            "   IFNULL(bm_approval.bm_approval_count,0) AS bm_approval, "+
            "   IFNULL(rm_approval.rm_approval_count,0) AS rm_approval, "+
            "   IFNULL(ready_to_disburse.ready_to_disburse_count,0) AS ready_to_disburse "+
            "   FROM office io   "+
               //#this Left Join for get the count of kyc_process
            "   LEFT JOIN ( "+
            "       SELECT io.`office_id`,COUNT(*) AS kyc_process_count "+
            "       FROM iklant_prospect_client ipc "+
            "       INNER JOIN iklant_prospect_group ipg ON ipg.`group_id` = ipc.`group_id` "+
		    "	    INNER JOIN office io ON io.office_id = ipg.office_id "+
            "       INNER JOIN personnel p ON p.`bc_office_id` = io.`bc_id`"+
		    "       WHERE p.`personnel_id` = "+ userId +" AND ipc.status_id IN(1,27,28,3,4,19,23,24) AND ipg.`status_id`IN (27,3,4,19,23,24)"+
            "       GROUP BY "+ groupByColumn +
            "   )kyc_process ON kyc_process.office_id = io.office_id  "+
            //"   #this Left Join for get the count of field_verification "+
            "   LEFT JOIN ( "+
            "       SELECT io.`office_id`,COUNT(*) AS field_verification_count  "+
            "       FROM iklant_prospect_client ipc     "+
            "       INNER JOIN iklant_prospect_group ipg ON ipg.`group_id` = ipc.`group_id` "+
            "	    INNER JOIN office io ON io.office_id = ipg.office_id "+
            "       INNER JOIN personnel p ON p.`bc_office_id` = io.`bc_id`"+
		    "       WHERE  p.`personnel_id` = "+ userId +" AND ipc.status_id IN(5,6) AND ipg.`status_id`IN (5,6)  "+
            "       GROUP BY "+ groupByColumn +
            "   )field_verification ON field_verification.office_id = io.office_id "+
            //"   #this Left Join for get the count of bm_approval "+
            "   LEFT JOIN (  "+
            "       SELECT io.`office_id`,COUNT(*) AS bm_approval_count "+
            "       FROM iklant_prospect_client ipc      "+
            "       INNER JOIN iklant_prospect_group ipg ON ipg.`group_id` = ipc.`group_id`  "+
            "	    INNER JOIN office io ON io.office_id = ipg.office_id "+
            "       INNER JOIN personnel p ON p.`bc_office_id` = io.`bc_id`"+
		    "       WHERE  p.`personnel_id` = "+ userId +" AND ipc.status_id IN(7,9) AND ipg.`status_id`IN (7,9) "+
            "       GROUP BY "+ groupByColumn +
            "   )bm_approval ON bm_approval.office_id = io.office_id "+
            //"   #this Left Join for get the count of rm_approval  "+
            "   LEFT JOIN (  "+
            "       SELECT io.`office_id`,COUNT(*) AS rm_approval_count "+
            "       FROM iklant_prospect_client ipc  "+
            "       INNER JOIN iklant_prospect_group ipg ON ipg.`group_id` = ipc.`group_id`  "+
            "	    INNER JOIN office io ON io.office_id = ipg.office_id "+
            "       INNER JOIN personnel p ON p.`bc_office_id` = io.`bc_id`"+
		    "       WHERE  p.`personnel_id` = "+ userId +" AND ipc.status_id IN(20) AND ipg.`status_id`IN (20) "+
            "       GROUP BY "+ groupByColumn +
            "   )rm_approval ON rm_approval.office_id = io.office_id "+
            //"   #this Left Join for get the count of ready_to_disburse "+
            "   LEFT JOIN (   "+
            "       SELECT io.`office_id`,COUNT(*) AS ready_to_disburse_count"+
            "       FROM iklant_prospect_client ipc "+
            "       INNER JOIN iklant_prospect_group ipg ON ipg.`group_id` = ipc.`group_id` "+
            "	    INNER JOIN office io ON io.office_id = ipg.office_id "+
            "       INNER JOIN personnel p ON p.bc_office_id = io.`bc_id`"+
	        "       WHERE  p.`personnel_id` = "+ userId +" AND ipc.status_id IN(10) AND ipg.`status_id`IN (10) "+
            "       GROUP BY "+ groupByColumn +
            "   )ready_to_disburse ON ready_to_disburse.office_id = io.office_id "+
            "   LEFT JOIN personnel p ON p.`bc_office_id`=io.`bc_id` WHERE p.`personnel_id` = "+userId+" GROUP BY "+ groupByColumn;
        customlog.info("bcSalesQuery : " + bcSalesQuery);
        connectionDataSource.getConnection(function(clientConnect){
            clientConnect.query(bcSalesQuery ,function(err,results,fields){
                if(err){
                    customlog.error(err);
                    connectionDataSource.releaseConnectionPool(clientConnect);
                    callback("failure");
                }else{
                    if(results.length > 0){
                        for (var i = 0; i < results.length; i++) {
                            var bcSalesPipeLineJson = {};
                            bcSalesPipeLineJson.officeId = results[i].office_id;
                            bcSalesPipeLineJson.officeName = results[i].office_name;
                            bcSalesPipeLineJson.kycProcess = results[i].kyc_process;
                            bcSalesPipeLineJson.fieldVerification = results[i].field_verification;
                            bcSalesPipeLineJson.bmApproval = results[i].bm_approval;
                            bcSalesPipeLineJson.rmApproval = results[i].rm_approval;
                            bcSalesPipeLineJson.readyToDisburse = results[i].ready_to_disburse;
                            bcSalesJsonArray.push(bcSalesPipeLineJson);
                        }
                        var kycProcessTotal=0;
                        var fieldVerificationTotal=0;
                        var bmApprovalTotal=0;
                        var rmApprovalTotal=0;
                        var readyToDisburseTotal=0;
                        var grandTotal = 0;
                        for (var i = 0; i < results.length; i++) {
                            kycProcessTotal +=parseInt(results[i].kyc_process);
                            fieldVerificationTotal +=parseInt(results[i].field_verification);
                            bmApprovalTotal +=parseInt(results[i].bm_approval);
                            rmApprovalTotal +=parseInt(results[i].rm_approval);
                            readyToDisburseTotal +=parseInt(results[i].ready_to_disburse);
                        }
                        grandTotal=kycProcessTotal+fieldVerificationTotal+ bmApprovalTotal+ rmApprovalTotal+ readyToDisburseTotal;
                        bcSalesJsonTotalArray.push(kycProcessTotal);
                        bcSalesJsonTotalArray.push(fieldVerificationTotal);
                        bcSalesJsonTotalArray.push(bmApprovalTotal);
                        bcSalesJsonTotalArray.push(rmApprovalTotal);
                        bcSalesJsonTotalArray.push(readyToDisburseTotal);
                        bcSalesJsonTotalArray.push(grandTotal);
                        connectionDataSource.releaseConnectionPool(clientConnect);
                        callback(bcSalesJsonArray,bcSalesJsonTotalArray);
                    }else{
                        connectionDataSource.releaseConnectionPool(clientConnect);
                        callback(bcSalesJsonArray);
                    }
                }
            });
        });
    },

    getMonthwisePortfolioDataModel : function(userId,roleId,callback){

        var self=this;
        var constantsObj = this.constants;
        var bcMontheisePortfolioJson = new Array();
        var monthwisePortfolioQuery = "SELECT np.date, "+
                                        "	DATE_FORMAT(np.`date`,'%M %Y') AS month_name, "+
                                        "	IFNULL(SUM(np.`actual_principal_outstanding`),0) AS actual_principal_outstanding "+
                                        "FROM `npa_summary` np "+
                                        "	INNER JOIN `office` o ON o.`office_id` = np.`office_id` "+
                                        "	INNER JOIN `business_correspondent_office` bc ON bc.`bc_id` = o.`bc_id` "+
                                        "	INNER JOIN `personnel` p ON p.`bc_office_id` = bc.`bc_id` "+
                                        "	INNER JOIN  "+
                                        "		(SELECT MAX(np.date) AS max_date "+
                                        "		FROM `npa_summary` np "+
                                        "		GROUP BY YEAR(np.date), MONTH(np.date))  "+
                                        "	max_dates ON max_dates.max_date = np.`date` "+
                                        "WHERE p.personnel_id = "+userId+" "+
                                        "GROUP BY  np.`date` "+
                                        "ORDER BY  np.`date` DESC "+
                                        "LIMIT  6 ";
        customlog.info("monthwisePortfolioQuery : " + monthwisePortfolioQuery);

        connectionDataSource.getConnection(function(clientConnect){
            clientConnect.query(monthwisePortfolioQuery ,function(err,results,fields){
                if(err){
                    customlog.error(err);
                    connectionDataSource.releaseConnectionPool(clientConnect);
                    callback("failure");
                }else{
                    if(results.length > 0){
                        for (var i = 0; i < results.length; i++) {
                            var bcPortfolioMonthwiseJson = {};
                            bcPortfolioMonthwiseJson.date = results[i].date;
                            bcPortfolioMonthwiseJson.monthName = results[i].month_name;
                            bcPortfolioMonthwiseJson.portfolioOutstanding = results[i].actual_principal_outstanding;
                            bcMontheisePortfolioJson.push(bcPortfolioMonthwiseJson);
                        }
                        connectionDataSource.releaseConnectionPool(clientConnect);
                        callback(bcMontheisePortfolioJson);
                    }else{
                        connectionDataSource.releaseConnectionPool(clientConnect);
                        callback(bcMontheisePortfolioJson);
                    }
                }
            });
        });

    },

    getStateWisePortfolioDataModel : function(userId,roleId,previousDate,callback){

        var self=this;
        var constantsObj = this.constants;
        var bcStateWisePortfolioJson = new Array();
        var stateWisePortfolioQuery = "SELECT  "+
            "	bcp.`bc_id`,bcp.`bc_name`,bd.state_name, "+
            "	IFNULL(bd.orig_principal,0) + IFNULL(cd.loan_amount,0) AS total_disbursed, "+
            "	IFNULL(bd.actual_principal_demd,0) + IFNULL(cdue.principal_demd,0) AS principal_demanded, "+
            "	IFNULL(bd.actual_principal_paid,0) + IFNULL(cp.principal_paid,0) AS principal_paid, "+
            "	(IFNULL(bd.orig_principal,0) + IFNULL(cd.loan_amount,0)) -  (IFNULL(bd.actual_principal_paid,0) + IFNULL(cp.principal_paid,0))  AS "+
            "		principal_outstanding "+
            "FROM  "+
            "	`business_correspondent_office` bcp "+
            "   INNER JOIN `iklant_office` o ON o.bc_id = bcp.`bc_id` "+
            "	INNER JOIN `personnel` p ON p.`bc_office_id` = bcp.`bc_id` "+
            "   INNER JOIN `iklant_state_list` sl ON sl.`state_id` = o.`state_id`  " +
            "	LEFT JOIN "+
            "		(SELECT bc.`bc_id`,sl.`state_id`,sl.`state_name`,SUM(np.`orig_principal`) AS orig_principal , "+
            "			SUM(np.`actual_principal_demd`) AS `actual_principal_demd`, "+
            "			SUM(np.`actual_interest_demd`) AS `actual_interest_demd`, "+
            "			SUM(np.`actual_principal_paid`) AS `actual_principal_paid`, "+
            "			SUM(np.`actual_interest_paid`) AS `actual_interest_paid`, "+
            "			SUM(np.`actual_principal_outstanding`) AS `actual_principal_outstanding`, "+
            "			SUM(np.`actual_interest_outstanding`) AS `actual_interest_outstanding` "+
            "		FROM `npa_summary` np "+
            "			INNER JOIN `iklant_office` o ON o.`office_id` = np.`office_id` "+
            "			INNER JOIN `iklant_state_list` sl ON sl.`state_id` = o.`state_id` "+
            "			INNER JOIN `business_correspondent_office` bc ON bc.`bc_id` = o.`bc_id` "+
            "			INNER JOIN `personnel` p ON p.`bc_office_id` = bc.`bc_id` "+
            "		WHERE np.date = '"+previousDate+"' AND p.`personnel_id` = "+userId+" "+
            "		GROUP BY np.date,o.`state_id`) bd ON bd.state_id = sl.`state_id`	 "+
            "		LEFT JOIN "+
            "		(SELECT  bc.`bc_id`,sl.`state_id`,sl.`state_name` ,SUM(la.`loan_amount`) AS `loan_amount` "+
            "		FROM   "+
            "		account a "+
            "			INNER JOIN `loan_account` la ON la.account_id = a.account_id "+
            "			INNER JOIN `iklant_office` o ON o.`office_id` = a.`office_id` "+
            "			INNER JOIN `iklant_state_list` sl ON sl.`state_id` = o.`state_id` "+
            "			INNER JOIN `business_correspondent_office` bc ON bc.`bc_id` = o.`bc_id` "+
            "			INNER JOIN `personnel` p ON p.`bc_office_id` = bc.`bc_id` "+
            "		WHERE la.disbursement_date = CURDATE() AND a.account_state_id IN (5,6,7,9,19)   "+
            "		AND la.`parent_account_id` IS NULL AND p.`personnel_id` = "+userId+" "+
            "		GROUP BY sl.state_id) cd ON cd.state_id = sl.`state_id`	 "+
            "	LEFT JOIN "+
            "		(SELECT 	bc.`bc_id`, sl.`state_id`,sl.`state_name`, "+
            "			SUM(IFNULL(ls.principal,0)) principal_demd, "+
            "			SUM(IFNULL(ls.interest,0)) interest_demd "+
            "		FROM 	loan_schedule ls "+
            "			INNER JOIN loan_account la ON ls.account_id = la.account_id "+
            "			INNER JOIN account a ON la.account_id = a.account_id "+
            "			INNER JOIN loan_custom_detail lcd ON lcd.account_id = la.account_id "+
            "			INNER JOIN `iklant_office` o ON o.`office_id` = a.`office_id` "+
            "			INNER JOIN `iklant_state_list` sl ON sl.`state_id` = o.`state_id` "+
            "			INNER JOIN `business_correspondent_office` bc ON bc.`bc_id` = o.`bc_id` "+
            "			INNER JOIN `personnel` p ON p.`bc_office_id` = bc.`bc_id` "+
            "		WHERE 	la.disbursement_date <= CURDATE() "+
            "			AND a.account_state_id IN (5,9) "+
            "			AND la.parent_account_id IS NOT NULL "+
            "			AND lcd.individual_tracked = 1  "+
            "			AND ls.action_date = CURDATE() AND p.`personnel_id` = "+userId+" "+
            "		GROUP BY ls.action_date,sl.state_id) cdue ON cdue.state_id = sl.`state_id`	 "+
            "	LEFT JOIN "+
            "		(SELECT	bc.`bc_id`, sl.`state_id`,sl.`state_name`,  "+
            "			SUM(ltx.principal_amount) principal_paid, "+
            "			SUM(ltx.interest_amount) interest_paid, "+
            "			SUM(ltx.principal_amount) + SUM(ltx.interest_amount) + SUM(ltx.misc_fee_amount) "+
            "			+ SUM(ltx.penalty_amount) + SUM(ltx.misc_penalty_amount) total_paid "+
            "		FROM 	account_payment ap "+
            "			INNER JOIN account_trxn atx ON ap.payment_id = atx.payment_id "+
            "			INNER JOIN loan_trxn_detail ltx ON atx.account_trxn_id = ltx.account_trxn_id "+
            "			INNER JOIN loan_account la ON ap.account_id = la.account_id "+
            "			INNER JOIN account a ON la.account_id = a.account_id "+
            "			INNER JOIN `iklant_office` o ON o.`office_id` = a.`office_id` "+
            "			INNER JOIN `iklant_state_list` sl ON sl.`state_id` = o.`state_id` "+
            "			INNER JOIN `business_correspondent_office` bc ON bc.`bc_id` = o.`bc_id` "+
            "			INNER JOIN `personnel` p ON p.`bc_office_id` = bc.`bc_id` "+
            "		WHERE	la.parent_account_id IS NOT NULL "+
            "			AND a.account_state_id IN (5,6,7,9,19) "+
            "			AND ap.payment_date = CURDATE() "+
            "			AND ap.amount <> 0 "+
            "			AND atx.account_action_id IN (1,2,3,4,5,15,16,17) "+
            "			AND p.`personnel_id` = "+userId+" "+
            "		GROUP BY ap.payment_date,sl.state_id)cp ON cp.state_id = sl.`state_id`	 "+
            "WHERE p.`personnel_id` = "+userId+" " +
            " GROUP BY   sl.`state_id` ";

        customlog.info("stateWisePortfolioQuery : " + stateWisePortfolioQuery);

        connectionDataSource.getConnection(function(clientConnect){
            clientConnect.query(stateWisePortfolioQuery ,function(err,results,fields){
                if(err){
                    customlog.error(err);
                    connectionDataSource.releaseConnectionPool(clientConnect);
                    callback("failure");
                }else{
                    if(results.length > 0){
                        for (var i = 0; i < results.length; i++) {
                            var stateWisePortfolioJson = {};
                            stateWisePortfolioJson.stateName = results[i].state_name;
                            stateWisePortfolioJson.principalOutstanding = results[i].principal_outstanding;
                            bcStateWisePortfolioJson.push(stateWisePortfolioJson);
                        }
                        connectionDataSource.releaseConnectionPool(clientConnect);
                        callback(bcStateWisePortfolioJson);
                    }else{
                        connectionDataSource.releaseConnectionPool(clientConnect);
                        callback(bcStateWisePortfolioJson);
                    }
                }
            });
        });
    },

    getLoanSizeWisePortfolioDataModel : function(userId,roleId,callback){

        var self=this;
        var constantsObj = this.constants;
        var bcLoanSizeWisePortfolioJson = new Array();

        var loanSizeWisePortfolioQuery = "SELECT	 "+
        "	os.loan_size, "+
        "	SUM(os.principal) AS principal, "+
        "	SUM(os.principal_paid) AS principal_paid, "+
        "	SUM(os.prin_outstanding) AS prin_outstanding "+
        "	FROM "+
        "	( "+
        "	SELECT	 "+
        "		prin.account_id, "+
        "		IFNULL(prin.principal,0) AS principal, "+
        "		IFNULL(pp.principal_paid,0) AS principal_paid, "+
        "		IFNULL(pp.interest_paid,0) AS interest_paid, "+
        "		IFNULL(prin.principal,0)  - IFNULL(pp.principal_paid,0) AS prin_outstanding, "+
        "		IF(prin.principal<5000,'<5000', "+
        "		IF(prin.principal BETWEEN 5000 AND 10000,'10000', "+
        "		IF(prin.principal BETWEEN 10000 AND 14999,'10000', "+
        "		IF(prin.principal BETWEEN 15000 AND 24999,'15000', "+
        "		IF(prin.principal BETWEEN 25000 AND 50000,'25000','>50000'))))) "+
        "		AS loan_size, "+
        "		IF(prin.principal <5000,'a', "+
        "		IF(prin.principal BETWEEN 5000 AND 10000,'b', "+
        "		IF(prin.principal BETWEEN 10000 AND 14999,'c', "+
        "		IF(prin.principal BETWEEN 15000 AND 24999,'d', "+
        "		IF(prin.principal  BETWEEN 25000 AND 50000,'e','f'))))) "+
        "		AS size "+
        "	FROM "+
        "	( "+
        "		SELECT	a.account_id, "+
        "		la.loan_amount AS principal, "+
        "		SUBSTRING(SUBSTRING_INDEX(lv.lookup_name,'.',2),14) AS loan_purpose "+
        "		FROM	loan_account la "+
        "			INNER JOIN account a ON la.account_id = a.account_id "+
        "			INNER JOIN `office` o ON o.`office_id` = a.`office_id` "+
        "			INNER JOIN `business_correspondent_office` bc ON bc.`bc_id` = o.`bc_id` "+
        "			INNER JOIN `personnel` p ON p.`bc_office_id` = bc.`bc_id` "+
        "			LEFT JOIN lookup_value lv ON la.business_activities_id = lv.lookup_id "+
        "		WHERE	la.parent_account_id IS NOT NULL "+
        "			AND a.account_state_id IN (5,6,7,8,9,19) "+
        "			AND la.disbursement_date <= CURDATE() AND p.personnel_id  ="+userId+" "+
        "		GROUP BY a.account_id "+
        "	) prin "+
        "	LEFT JOIN "+
        "	( "+
        "		SELECT	ap.account_id, "+
        "			SUM(ltx.principal_amount) principal_paid, "+
        "			SUM(ltx.interest_amount) interest_paid, "+
        "			SUM(ltx.misc_fee_amount) fees_paid, "+
        "			SUM(ltx.penalty_amount) penalty_paid, "+
        "			SUM(ltx.misc_penalty_amount) misc_penalty_paid, "+
        "			SUM(ltx.principal_amount) + SUM(ltx.interest_amount) + SUM(ltx.misc_fee_amount) "+
        "			+ SUM(ltx.penalty_amount) + SUM(ltx.misc_penalty_amount) total_paid "+
        "		FROM 	account_payment ap "+
        "			INNER JOIN account_trxn atx ON ap.payment_id = atx.payment_id "+
        "			INNER JOIN loan_trxn_detail ltx ON atx.account_trxn_id = ltx.account_trxn_id "+
        "			INNER JOIN loan_account la ON ap.account_id = la.account_id "+
        "			INNER JOIN account a ON la.account_id = a.account_id "+
        "			INNER JOIN office o ON o.office_id = a.office_id "+
        "			INNER JOIN `business_correspondent_office` bc ON bc.`bc_id` = o.`bc_id` "+
        "			INNER JOIN `personnel` p ON p.`bc_office_id` = bc.`bc_id` "+
        "		WHERE	la.parent_account_id IS NOT NULL "+
        "			AND a.account_state_id IN (5,6,7,8,9,19) "+
        "			AND ap.payment_date <= CURDATE() "+
        "			AND ap.amount <> 0 "+
        "			AND atx.account_action_id IN (1,2,3,4,5,15,16,17,20) AND p.personnel_id  ="+userId+" "+
        "		GROUP BY ap.account_id "+
        "		ORDER BY ap.account_id "+
        "	) pp ON pp.account_id = prin.account_id "+
        "	INNER JOIN	 loan_account  la ON la.account_id  = prin.account_id "+
        "	INNER JOIN account a ON a.account_id = la.parent_account_id "+
        "	WHERE a.account_state_id IN (5,6,7,9,19) "+
        "	) os  "+
        "	WHERE (os.prin_outstanding <> 0) "+
        "	GROUP BY os.loan_size "+
        "	ORDER BY  size ";
        customlog.info("loanSizeWisePortfolioQuery : " + loanSizeWisePortfolioQuery);

        connectionDataSource.getConnection(function(clientConnect){
            clientConnect.query(loanSizeWisePortfolioQuery ,function(err,results,fields){
                if(err){
                    customlog.error(err);
                    connectionDataSource.releaseConnectionPool(clientConnect);
                    callback("failure");
                }else{
                    if(results.length > 0){
                        for (var i = 0; i < results.length; i++) {
                            var loanSizeWisePortfolioJson = {};
                            loanSizeWisePortfolioJson.loanSize = results[i].loan_size;
                            loanSizeWisePortfolioJson.principalOutstanding = results[i].prin_outstanding;
                            bcLoanSizeWisePortfolioJson.push(loanSizeWisePortfolioJson);
                        }
                        connectionDataSource.releaseConnectionPool(clientConnect);
                        callback(bcLoanSizeWisePortfolioJson);
                    }else{
                        connectionDataSource.releaseConnectionPool(clientConnect);
                        callback(bcLoanSizeWisePortfolioJson);
                    }
                }
            });
        });
    },

    getLoanPurposeWisePortfolioDataModel : function(userId,roleId,callback){

        var self=this;
        var constantsObj = this.constants;
        var bcLoanPurposeWisePortfolioJson = new Array();

        var loanPurposeWisePortfolioQuery = "SELECT	 "+
            "	os.loan_purpose, "+
            "	SUM(os.principal) AS principal, "+
            "	SUM(os.principal_paid) AS principal_paid, "+
            "	SUM(os.prin_outstanding) AS prin_outstanding "+
            "	FROM "+
            "	( "+
            "	SELECT	 "+
            "		prin.account_id, "+
            "		IFNULL(prin.principal,0) AS principal, "+
            "		IFNULL(pp.principal_paid,0) AS principal_paid, "+
            "		IFNULL(pp.interest_paid,0) AS interest_paid, "+
            "		IFNULL(prin.principal,0)  - IFNULL(pp.principal_paid,0) AS prin_outstanding, "+
            "		IFNULL(prin.loan_purpose,'Others') AS loan_purpose "+
            "	FROM "+
            "	( "+
            "		SELECT	a.account_id, "+
            "		la.loan_amount AS principal, "+
            "		SUBSTRING(SUBSTRING_INDEX(lv.lookup_name,'.',2),14) AS loan_purpose "+
            "		FROM	loan_account la "+
            "			INNER JOIN account a ON la.account_id = a.account_id "+
            "			INNER JOIN `office` o ON o.`office_id` = a.`office_id` "+
            "			INNER JOIN `business_correspondent_office` bc ON bc.`bc_id` = o.`bc_id` "+
            "			INNER JOIN `personnel` p ON p.`bc_office_id` = bc.`bc_id` "+
            "			LEFT JOIN lookup_value lv ON la.business_activities_id = lv.lookup_id "+
            "		WHERE	la.parent_account_id IS NOT NULL "+
            "			AND a.account_state_id IN (5,6,7,8,9,19) "+
            "			AND la.disbursement_date <= CURDATE() AND p.personnel_id  ="+userId+" "+
            "		GROUP BY a.account_id "+
            "	) prin "+
            "	LEFT JOIN "+
            "	( "+
            "		SELECT	ap.account_id, "+
            "			SUM(ltx.principal_amount) principal_paid, "+
            "			SUM(ltx.interest_amount) interest_paid, "+
            "			SUM(ltx.misc_fee_amount) fees_paid, "+
            "			SUM(ltx.penalty_amount) penalty_paid, "+
            "			SUM(ltx.misc_penalty_amount) misc_penalty_paid, "+
            "			SUM(ltx.principal_amount) + SUM(ltx.interest_amount) + SUM(ltx.misc_fee_amount) "+
            "			+ SUM(ltx.penalty_amount) + SUM(ltx.misc_penalty_amount) total_paid "+
            "		FROM 	account_payment ap "+
            "			INNER JOIN account_trxn atx ON ap.payment_id = atx.payment_id "+
            "			INNER JOIN loan_trxn_detail ltx ON atx.account_trxn_id = ltx.account_trxn_id "+
            "			INNER JOIN loan_account la ON ap.account_id = la.account_id "+
            "			INNER JOIN account a ON la.account_id = a.account_id "+
            "			INNER JOIN office o ON o.office_id = a.office_id "+
            "			INNER JOIN `business_correspondent_office` bc ON bc.`bc_id` = o.`bc_id` "+
            "			INNER JOIN `personnel` p ON p.`bc_office_id` = bc.`bc_id` "+
            "		WHERE	la.parent_account_id IS NOT NULL "+
            "			AND a.account_state_id IN (5,6,7,8,9,19) "+
            "			AND ap.payment_date <= CURDATE()  "+
            "			AND ap.amount <> 0 "+
            "			AND atx.account_action_id IN (1,2,3,4,5,15,16,17,20) AND p.personnel_id  ="+userId+" "+
            "		GROUP BY ap.account_id "+
            "		ORDER BY ap.account_id "+
            "	) pp ON pp.account_id = prin.account_id "+
            "	INNER JOIN	 loan_account  la ON la.account_id  = prin.account_id "+
            "	INNER JOIN account a ON a.account_id = la.parent_account_id "+
            "	WHERE a.account_state_id IN (5,6,7,9,19) "+
            "	) os  "+
            "	WHERE (os.prin_outstanding <> 0) "+
            "	GROUP BY os.loan_purpose ";
        customlog.info("loanPurposeWisePortfolioQuery : " + loanPurposeWisePortfolioQuery);
        connectionDataSource.getConnection(function(clientConnect){
            clientConnect.query(loanPurposeWisePortfolioQuery ,function(err,results,fields){
                if(err){
                    customlog.error(err);
                    connectionDataSource.releaseConnectionPool(clientConnect);
                    callback("failure");
                }else{
                    if(results.length > 0){
                        for (var i = 0; i < results.length; i++) {
                            var loanSizeWisePortfolioJson = {};
                            loanSizeWisePortfolioJson.loanPurpose = results[i].loan_purpose;
                            loanSizeWisePortfolioJson.principalOutstanding = results[i].prin_outstanding;
                            bcLoanPurposeWisePortfolioJson.push(loanSizeWisePortfolioJson);
                        }
                        connectionDataSource.releaseConnectionPool(clientConnect);
                        callback(bcLoanPurposeWisePortfolioJson);
                    }else{
                        connectionDataSource.releaseConnectionPool(clientConnect);
                        callback(bcLoanPurposeWisePortfolioJson);
                    }
                }
            });
        });

    },

    getLoanCycleWisePortfolioDataModel : function(userId,roleId,callback){

        var self=this;
        var constantsObj = this.constants;
        var bcLoanCycleWisePortfolioJson = new Array();

        var loanCycleWisePortfolioQuery = "SELECT	 "+
            "	os.loan_cycle, "+
            "	SUM(os.principal) AS principal, "+
            "	SUM(os.principal_paid) AS principal_paid, "+
            "	SUM(os.prin_outstanding) AS prin_outstanding "+
            "	FROM "+
            "	( "+
            "	SELECT	 "+
            "		prin.account_id, "+
            "		IFNULL(prin.principal,0) AS principal, "+
            "		IFNULL(pp.principal_paid,0) AS principal_paid, "+
            "		IFNULL(pp.interest_paid,0) AS interest_paid, "+
            "		IFNULL(prin.principal,0)  - IFNULL(pp.principal_paid,0) AS prin_outstanding, "+
            "		IFNULL(ad.`loan_cycle`,1) AS loan_cycle "+
            "	FROM "+
            "	( "+
            "		SELECT	a.account_id, "+
            "		la.loan_amount AS principal, "+
            "		SUBSTRING(SUBSTRING_INDEX(lv.lookup_name,'.',2),14) AS loan_purpose "+
            "		FROM	loan_account la "+
            "			INNER JOIN account a ON la.account_id = a.account_id "+
            "			INNER JOIN `office` o ON o.`office_id` = a.`office_id` "+
            "			INNER JOIN `business_correspondent_office` bc ON bc.`bc_id` = o.`bc_id` "+
            "			INNER JOIN `personnel` p ON p.`bc_office_id` = bc.`bc_id` "+
            "			LEFT JOIN lookup_value lv ON la.business_activities_id = lv.lookup_id "+
            "		WHERE	la.parent_account_id IS NOT NULL "+
            "			AND a.account_state_id IN (5,6,7,8,9,19) "+
            "			AND la.disbursement_date <= CURDATE() AND p.personnel_id  ="+userId+" "+
            "		GROUP BY a.account_id "+
            "	) prin "+
            "	LEFT JOIN "+
            "	( "+
            "		SELECT	ap.account_id, "+
            "			SUM(ltx.principal_amount) principal_paid, "+
            "			SUM(ltx.interest_amount) interest_paid, "+
            "			SUM(ltx.misc_fee_amount) fees_paid, "+
            "			SUM(ltx.penalty_amount) penalty_paid, "+
            "			SUM(ltx.misc_penalty_amount) misc_penalty_paid, "+
            "			SUM(ltx.principal_amount) + SUM(ltx.interest_amount) + SUM(ltx.misc_fee_amount) "+
            "			+ SUM(ltx.penalty_amount) + SUM(ltx.misc_penalty_amount) total_paid "+
            "		FROM 	account_payment ap "+
            "			INNER JOIN account_trxn atx ON ap.payment_id = atx.payment_id "+
            "			INNER JOIN loan_trxn_detail ltx ON atx.account_trxn_id = ltx.account_trxn_id "+
            "			INNER JOIN loan_account la ON ap.account_id = la.account_id "+
            "			INNER JOIN account a ON la.account_id = a.account_id "+
            "			INNER JOIN office o ON o.office_id = a.office_id "+
            "			INNER JOIN `business_correspondent_office` bc ON bc.`bc_id` = o.`bc_id` "+
            "			INNER JOIN `personnel` p ON p.`bc_office_id` = bc.`bc_id` "+
            "		WHERE	la.parent_account_id IS NOT NULL "+
            "			AND a.account_state_id IN (5,6,7,8,9,19) "+
            "			AND ap.payment_date <= CURDATE()  "+
            "			AND ap.amount <> 0 "+
            "			AND atx.account_action_id IN (1,2,3,4,5,15,16,17,20) AND p.personnel_id  ="+userId+" "+
            "		GROUP BY ap.account_id "+
            "		ORDER BY ap.account_id "+
            "	) pp ON pp.account_id = prin.account_id "+
            "	INNER JOIN	 loan_account  la ON la.account_id  = prin.account_id "+
            "	INNER JOIN account a ON a.account_id = la.parent_account_id "+
            "   LEFT JOIN account_detail ad ON ad.account_id =  la.parent_account_id "+
            "	WHERE a.account_state_id IN (5,6,7,9,19) "+
            "	) os  "+
            "	WHERE (os.prin_outstanding <> 0) "+
            "	GROUP BY os.loan_cycle ";
        customlog.info("loanCycleWisePortfolioQuery : " + loanCycleWisePortfolioQuery);

        connectionDataSource.getConnection(function(clientConnect){
            clientConnect.query(loanCycleWisePortfolioQuery ,function(err,results,fields){
                if(err){
                    customlog.error(err);
                    connectionDataSource.releaseConnectionPool(clientConnect);
                    callback("failure");
                }else{
                    if(results.length > 0){
                        for (var i = 0; i < results.length; i++) {
                            var loanCycleWisePortfolioJson = {};
                            loanCycleWisePortfolioJson.loanCycle = results[i].loan_cycle;
                            loanCycleWisePortfolioJson.principalOutstanding = results[i].prin_outstanding;
                            bcLoanCycleWisePortfolioJson.push(loanCycleWisePortfolioJson);
                        }
                        connectionDataSource.releaseConnectionPool(clientConnect);
                        callback(bcLoanCycleWisePortfolioJson);
                    }else{
                        connectionDataSource.releaseConnectionPool(clientConnect);
                        callback(bcLoanCycleWisePortfolioJson);
                    }
                }
            });
        });

    },
    //Added By Sathish Kumar M #008 For Generate the Excel BC Demand report
    callGenerateReportForBc: function(fromDate,toDate,userId,reportName,exportType,callBack){
        var officeId="7";
        var date = new Date();
        var dateTime = date.getFullYear() + '_' + (date.getMonth() + 1) + '_' + date.getDate() + '_' + date.getHours() + '_' + date.getMinutes() + '_' + date.getSeconds();
        var self = this;
        var report_name = "Demand Report-" + dateTime + ".xlsx";
        var excel = require('msexcel-builder');
        var workbook = excel.createWorkbook(rootPath+'/documents/report_documents/', report_name);
        var fileLocation = '';
        var demandReportQuery = "CALL  sp_bc_demand_collection_report_clientwise_with_OD('" + fromDate + "','" + toDate + "'," + userId + ");";
        customlog.info('Demand Query :' + demandReportQuery);
        customlog.info("Query Start Execution");
        connectionDataSource.getConnection(function(clientConnect) {
            clientConnect.query(demandReportQuery, function (error, generalLedgerResult) {

                if (error) {
                    customlog.error(error);
                    connectionDataSource.releaseConnectionPool(clientConnect);
                    callBack('', '');
                }
                else {
                    customlog.info('Execution Completed'+exportType);
                    if(generalLedgerResult){
                        var generalLedgerResult = generalLedgerResult[0];
                        connectionDataSource.releaseConnectionPool(clientConnect);
                        if(exportType=='0'){
                            customlog.info("Excel Start Writing");
                            var rowLength = generalLedgerResult.length + 34;
                            /*// sheet1 for summary
                            var sheet1 = workbook.createSheet("Summary", 20, parseInt(rowLength));
                            var headerForSummarySheet = new Array('S.No', 'Office', 'Sum of Current Principal Demd', 'Sum of Current Interest Demd', 'Sum of Overdue Principal', 'Sum of Overdue Interest','Sum of Emi Amount','Sum of Overdue Amount','Sum of Total Demand','Sum of Principal Collected','Sum of Interest Collected','Sum of Total Collected');
                            */
                            // sheet2 for detailed report
                            var sheet1 = workbook.createSheet("Detailed_Vs_Collection_Summary", 40, parseInt(rowLength));
                            var headerForDetailedSheet = new Array('S.No', 'Office', 'Group AccNo', 'Group Code', 'Group Name',
                                'Client AccNo', 'Client Code', 'Client Name', 'Guarantor', 'Address','Phone Number','Collection Day','Collection Date','Collection Time','Disbursement Date','First Due','last Due','Loan Officer','Collection Officer','Loan Product','Category Name','Current Principal Demd','Overdue Principal','Current Interest Demd','Overdue Interest','Emi Amount','Overdue Amount','Total Demand','Payment Date','Principal Collected','Interest Collected','Total Collected');

                            //var heading = "Demand Vs Collection Report from " + fromDate + " to " + toDate + "      Report Name : " + reportName + " ";
                            var heading = "Demand Vs Collection Report from " + fromDate + " to " + toDate + " ";
                            var count1 = 1, count2 = 1, summaryArray = new Array();
                            self.excelUtility.setAlignmentForHeader(sheet1, 2, 33, 4, new Array(10, 20, 20, 20, 20, 30, 20, 20, 20, 20,10, 20, 20, 20, 20, 30, 20, 20, 20, 20,10, 20, 20, 20, 20, 30, 20, 20, 20, 20,20,20,20,20), headerForDetailedSheet, heading, function (result) {
                                sheet1 = result;
                                for (var i in generalLedgerResult) {
                                    var rowValue = parseInt(4);
                                    rowValue = rowValue + parseInt(count2);
                                    sheet1.set(2, rowValue, parseInt(count2));
                                    sheet1.set(3, rowValue, generalLedgerResult[i].branchName);
                                    sheet1.set(4, rowValue, generalLedgerResult[i].group_global_acc_no);
                                    sheet1.set(5, rowValue, generalLedgerResult[i].group_code);
                                    sheet1.set(6, rowValue, generalLedgerResult[i].group_name);
                                    sheet1.set(7, rowValue, generalLedgerResult[i].client_global_acc_no);
                                    sheet1.set(8, rowValue, generalLedgerResult[i].client_code);
                                    sheet1.set(9, rowValue, generalLedgerResult[i].client_name);
                                    sheet1.set(10, rowValue, generalLedgerResult[i].gurrantor);
                                    sheet1.set(11, rowValue, generalLedgerResult[i].address);
                                    sheet1.set(12, rowValue, generalLedgerResult[i].phone_number);
                                    sheet1.set(13, rowValue, generalLedgerResult[i].collection_day);
                                    sheet1.set(14, rowValue, generalLedgerResult[i].collection_date);
                                    sheet1.set(15, rowValue, generalLedgerResult[i].collection_time);
                                    sheet1.set(16, rowValue, generalLedgerResult[i].disbursement_date);
                                    sheet1.set(17, rowValue, generalLedgerResult[i].first_due);
                                    sheet1.set(18, rowValue, generalLedgerResult[i].last_due);
                                    sheet1.set(19, rowValue, generalLedgerResult[i].loan_officer);
                                    sheet1.set(20, rowValue, generalLedgerResult[i].collection_officer);
                                    sheet1.set(21, rowValue, generalLedgerResult[i].loan_product);
                                    sheet1.set(22, rowValue, generalLedgerResult[i].category_name);
                                    sheet1.set(23, rowValue, generalLedgerResult[i].current_principal_demd,'number');
                                    sheet1.set(24, rowValue, generalLedgerResult[i].overdue_principal,'number');
                                    sheet1.set(25, rowValue, generalLedgerResult[i].current_interest_demd,'number');
                                    sheet1.set(26, rowValue, generalLedgerResult[i].overdue_interest,'number');
                                    sheet1.set(27, rowValue, generalLedgerResult[i].emi_amount,'number');
                                    sheet1.set(28, rowValue, generalLedgerResult[i].overdue_amount,'number');
                                    sheet1.set(29, rowValue, generalLedgerResult[i].total_demand,'number');
                                    sheet1.set(30, rowValue, generalLedgerResult[i].payment_date);
                                    sheet1.set(31, rowValue, generalLedgerResult[i].principal_collected,'number');
                                    sheet1.set(32, rowValue, generalLedgerResult[i].interest_collected,'number');
                                    sheet1.set(33, rowValue, generalLedgerResult[i].total_collected,'number');
                                    count2++;
                                    self.excelUtility.setBorderAndAlignForCell(sheet1, 2, 33, rowValue, new Array(9, 10), new Array(2, 4, 5, 6, 11), function (sheet) {
                                        sheet1 = sheet;
                                    });
                                }
                            });


                            /*self.excelUtility.setBorderAndAlignForCell(sheet1, 2, 7, 12, new Array(5, 6, 7), new Array(0, 2), function (sheet) {
                                sheet1 = sheet;
                            });*/
                            fileLocation = rootPath+'/documents/report_documents/' + report_name;
                            workbook.save(function (err) {
                                if (err) {
                                    workbook.cancel();
                                    customlog.error(err.message);
                                    callBack(generalLedgerResult, fileLocation);
                                }
                                else {
                                    customlog.info('Excel Writing Completed');
                                    callBack(generalLedgerResult, fileLocation);
                                }
                            });
                        }else if(exportType=='1'){
                            var longLines = "________________________________________________________________________________________________________________________________________";
                            var vLineStart_Y = 114, tableHeadValue_Y = 120;
                            var doc = new PDFDocument({layout:'landscape'});
                            head = 'MSM MICROFINANCE LIMITED';
                            doc.font('fonts/PalatinoBold.ttf').fontSize(13).text(head, 200, 30);
                            doc.font('fonts/PalatinoBold.ttf').fontSize(10).text('(FORMERLY KNOWN AS APEX ABISHEK FINANCE LIMITED)', 200, 35);
                            //'S.No','Client Code', 'Client Name', 'Guarantor', 'Address','Phone Number','Collection Day','Collection Date','Collection Time','Disbursement Date','First Due','last Due','Loan Officer','Collection Officer','Loan Product','Category Name','Current Principal Demd','Overdue Principal','Current Interest Demd','Overdue Interest','Emi Amount','Overdue Amount','Total Demand','Payment Date','Principal Collected','Interest Collected','Total Collected'
                            doc.font('fonts/times.ttf');
                            // write page head data
                            doc.fontSize(11).text("Group Name",50,85);
                            doc.fontSize(11).text("Client AccNo",250,85);
                            doc.fontSize(11).text("Client Code",250,103);
                            //draw the first row (table head)
                            doc.font('fonts/times.ttf').fontSize(10).text(longLines,42.4, 106.5);
                            doc.font('fonts/times.ttf').fontSize(17).text("|",41,vLineStart_Y);
                            doc.font('fonts/times.ttf').fontSize(9).text("Office",43,tableHeadValue_Y);
                            doc.font('fonts/times.ttf').fontSize(17).text("|",108,vLineStart_Y);
                            doc.font('fonts/times.ttf').fontSize(9).text("Group Code",116,tableHeadValue_Y);
                            doc.font('fonts/times.ttf').fontSize(17).text("|",170,vLineStart_Y);
                            doc.font('fonts/times.ttf').fontSize(9).text("Principal Demand",177,tableHeadValue_Y);
                            doc.font('fonts/times.ttf').fontSize(17).text("|",252,vLineStart_Y);
                            doc.font('fonts/times.ttf').fontSize(9).text("Interest Demand",257,tableHeadValue_Y);
                            doc.font('fonts/times.ttf').fontSize(17).text("|",325,vLineStart_Y);
                            doc.font('fonts/times.ttf').fontSize(9).text("Total Demand",332,tableHeadValue_Y);
                            doc.font('fonts/times.ttf').fontSize(17).text("|",392,vLineStart_Y);
                            doc.font('fonts/times.ttf').fontSize(9).text("Paid Date",400,tableHeadValue_Y);
                            doc.font('fonts/times.ttf').fontSize(17).text("|",444,vLineStart_Y);
                            doc.font('fonts/times.ttf').fontSize(9).text("Principal Paid",451,tableHeadValue_Y);
                            doc.font('fonts/times.ttf').fontSize(17).text("|",510,vLineStart_Y);
                            doc.font('fonts/times.ttf').fontSize(9).text("Interest Paid",513,tableHeadValue_Y);
                            doc.font('fonts/times.ttf').fontSize(17).text("|",562,vLineStart_Y);
                            doc.font('fonts/times.ttf').fontSize(9).text("Total Paid",568,tableHeadValue_Y);
                            doc.font('fonts/times.ttf').fontSize(17).text("|",609,vLineStart_Y);
                            doc.font('fonts/times.ttf').fontSize(9).text("Customer Sign",617,tableHeadValue_Y);
                            doc.font('fonts/times.ttf').fontSize(17).text("|",675,vLineStart_Y);
                            doc.font('fonts/times.ttf').fontSize(9).text("FO Sign",684,tableHeadValue_Y);
                            doc.font('fonts/times.ttf').fontSize(17).text("|",720,vLineStart_Y);
                            doc.fontSize(10).text(longLines,42.4, 121.5);
                            doc.write(rootPath+'/documents/report_documents/' + reportName+".pdf");
                            fileLocation = rootPath+'/documents/report_documents/' + reportName+".pdf";
                            callBack(generalLedgerResult, fileLocation);
                        }else{
                            callBack(generalLedgerResult, '');
                        }
                    } else{
                        callBack(generalLedgerResult, '');
                    }
                 }
            });
        });
    }




};

function intToFormat(nStr) {
    nStr += '';
    x = nStr.split('.');
    x1 = x[0];
    x2 = x.length > 1 ? '.' + x[1] : '';
    var rgx = /(\d+)(\d{3})/;
    var z = 0;
    var len = String(x1).length;
    var num = parseInt((len/2)-1);

    while (rgx.test(x1))
    {
        if(z > 0)
        {
            x1 = x1.replace(rgx, '$1' + ',' + '$2');
        }
        else
        {
            x1 = x1.replace(rgx, '$1' + ',' + '$2');
            rgx = /(\d+)(\d{2})/;
        }
        z++;
        num--;
        if(num == 0)
        {
            break;
        }
    }
    return x1 + x2;
}