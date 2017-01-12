var globalGroupIdKYC;
var groupIdForKyc;
var memberNameId;
var groupNameForKyc;
var PDFDocument = require('pdfkit');
var lookupEntityObj;
//var dbTableName = require("./properties.json");
var path = require('path');
var rootPath = path.dirname(process.mainModule.filename);
var dbTableName = require(path.dirname(process.mainModule.filename)+"/"+"properties.json");
var applicationHome = path.dirname(process.mainModule.filename);
iklantPort = dbTableName.iklantPort;
var dateUtils = require(path.join(applicationHome,'app_modules/utils/DateUtils'));
var commonUtils = require(path.join(applicationHome,'app_modules/utils/commonUtils'));
var loanRecoveryDTO = path.join(rootPath,'app_modules/dto/loan_recovery');
var ciDB = dbTableName.database;
var connectionDataSource = require(path.join(applicationHome,"/app_modules/data_model/DataSource"));
var fs = require('fs');
var customlog = require(path.join(rootPath,"logger/loggerConfig.js"))('customer_identification: datamodel.js');
var androidDataModel = require(path.join(rootPath,"app_modules/data_model/AndroidDataModel"));


datamodel = function () {

    customlog.debug("Inside Data Access Layer");
    var mysql = require('mysql');
    this.client = mysql.createConnection({
        host:dbTableName.host,
        user: dbTableName.username,
        password: dbTableName.password,
        insecureAuth: true
    });
    this.client.query("USE " + ciDB);

    var excelUtility = require("../model/excelReportUtility.js");
    this.excelUtility = excelUtility;

    var constantsRequire = require(path.join(applicationHome,"/app_modules/dto/common/Constants"));
    var constants = new constantsRequire();
    this.constants = constants;

    var commonObj = require("../domain/commonDomain");
    this.commonObj = commonObj;
};

datamodel.prototype = {
    getProductCategoryDataModel: function (callback) {
        var self = this;
        var prdCategoryIdArray = new Array();
        var prdCategoryNameArray = new Array();
        var getProductCategoryQuery = "SELECT prd_offering_id,prd_offering_name FROM prd_offering;";
        connectionDataSource.getConnection(function (clientConnect) {
            clientConnect.query(getProductCategoryQuery,
                function selectCb(err, results, fields) {
                    connectionDataSource.releaseConnectionPool(clientConnect);
                    if (err) {
                        customlog.error(err);
                    } else {
                        for (var i in results) {
                            prdCategoryIdArray[i] = results[i].prd_offering_id;
                            prdCategoryNameArray[i] = results[i].prd_offering_name;
                        }
                    }
                    callback(prdCategoryIdArray, prdCategoryNameArray);
                });
        });
    },
    getProductCategoryDeatailsDataModel: function (productCategoryId, callback) {
        var self =this;
        var productName;
        var loanAmount;
        var frequencyOfInstallment;
        var installmentAmount;
        var interestRate;
        var noOfInstallments;
        var getProductCategoryDeatailsQuery = "SELECT " +
            "polp.prd_loan_amount,polp.prd_no_of_installments,polp.prd_installment_amount, " +
            "polp.prd_installment_type,polp.prd_interest_rate,po.prd_offering_name " +
            "FROM prd_offering_loan_product polp " +
            "INNER JOIN prd_offering po ON po.prd_offering_id = polp.prd_offering_id " +
            "WHERE polp.prd_offering_id = " + productCategoryId + "; ";

        customlog.info("getProductCategoryDeatailsQuery : " + getProductCategoryDeatailsQuery);
        connectionDataSource.getConnection(function (clientConnect) {
            clientConnect.query(getProductCategoryDeatailsQuery,
                function selectCb(err, results, fields) {
                    connectionDataSource.releaseConnectionPool(clientConnect);
                    if (err) {
                        customlog.error(err);
                    } else {
                        for (var i in results) {
                            productName = results[i].prd_offering_name;
                            loanAmount = results[i].prd_loan_amount;
                            frequencyOfInstallment = results[i].prd_installment_type;
                            installmentAmount = results[i].prd_installment_amount;
                            interestRate = results[i].prd_interest_rate;
                            noOfInstallments = results[i].prd_no_of_installments;
                        }
                    }
                    callback(productName, loanAmount, frequencyOfInstallment, installmentAmount, interestRate, noOfInstallments);
                });
        });
    },

    /*listNPASearchGroupDatamodel: function (tenantId, recoveryOfficer, capabilityPercentage, isLeaderTraceableID, reasonForNPA, overdueDurationFrom, overdueDurationTo, amountFrom, amountTo, branch, callback) {
        var self=this;
        var constantsObj = this.constants;

        var recoveryOfficerNameArray = new Array();
        var accountIdArray = new Array();
        var customerNameArray = new Array();
        var overDueAmountArray = new Array();
        var daysInArrearsArray = new Array();
        var expectedCompletionDateArray = new Array();
        var npaSearchResultsQuery = "";
        if (recoveryOfficer != 0) {
            npaSearchResultsQuery = "SELECT nld.account_id,nl.customer, " +
                "(nl.actual_principal_overdue+nl.actual_interest_overdue) AS overdue_amount, " +
                "nl.days_in_arrears,us.user_name,nur.response_txt " +
                "FROM npa_util_loan_detail nld " +
                "INNER JOIN npa_util_loan nl ON nl.account_id = nld.account_id " +
                "INNER JOIN "+dbTableName.iklantUsers+" us ON us.user_id = nld.recovery_officer_id " +
                "INNER JOIN npa_util_response nur ON nur.account_id = nld.account_id " +
                "WHERE nld.recovery_officer_id IN(" + recoveryOfficer + ") AND " +
                "nur.question_id = " + constantsObj.getNpaExpectedPaymentDateQuestionId() + " " +
                "AND nl.npa_indicator <> 'N' AND nld.status_id IS NOT NULL ORDER BY overdue_amount DESC";
        }
        else if (capabilityPercentage != 0) {
            if (capabilityPercentage == 100) {
                npaSearchResultsQuery = "SELECT nld.account_id,nl.customer, " +
                    "(nl.actual_principal_overdue+nl.actual_interest_overdue) AS overdue_amount, " +
                    "nl.days_in_arrears,us.user_name,nur.response_txt " +
                    "FROM npa_util_loan_detail nld " +
                    "INNER JOIN npa_util_loan nl ON nl.account_id = nld.account_id " +
                    "INNER JOIN "+dbTableName.iklantUsers+" us ON us.user_id = nld.recovery_officer_id " +
                    "INNER JOIN npa_util_response nr ON nr.account_id = nld.account_id " +
                    "INNER JOIN npa_util_response nur ON nur.account_id = nld.account_id " +
                    "WHERE nr.question_id = " + constantsObj.getNpaCapabilityPercentageQuestionId() + " " +
                    "AND nr.response_txt IN (" + capabilityPercentage + ") AND " +
                    "nur.question_id = " + constantsObj.getNpaExpectedPaymentDateQuestionId() + " " +
                    "AND nld.status_id IS NOT NULL ORDER BY overdue_amount DESC";

            } else {
                npaSearchResultsQuery = "SELECT nld.account_id,nl.customer, " +
                    "(nl.actual_principal_overdue+nl.actual_interest_overdue) AS overdue_amount, " +
                    "nl.days_in_arrears,us.user_name,nur.response_txt " +
                    "FROM npa_util_loan_detail nld " +
                    "INNER JOIN npa_util_loan nl ON nl.account_id = nld.account_id " +
                    "INNER JOIN "+dbTableName.iklantUsers+" us ON us.user_id = nld.recovery_officer_id " +
                    "INNER JOIN npa_util_response nr ON nr.account_id = nld.account_id " +
                    "INNER JOIN npa_util_response nur ON nur.account_id = nld.account_id " +
                    "WHERE nr.question_id = " + constantsObj.getNpaCapabilityPercentageQuestionId() + " " +
                    "AND nr.response_txt IN (" + capabilityPercentage + ") " +
                    "AND nl.npa_indicator <> 'N' AND " +
                    "nur.question_id = " + constantsObj.getNpaExpectedPaymentDateQuestionId() + " " +
                    "AND nld.status_id IS NOT NULL ORDER BY overdue_amount DESC";
            }
        }
        else if (isLeaderTraceableID != 0) {
            if (isLeaderTraceableID == 2) {
                isLeaderTraceableID = 0;
            }
            npaSearchResultsQuery = "SELECT nld.account_id,nl.customer, " +
                "(nl.actual_principal_overdue+nl.actual_interest_overdue) AS overdue_amount, " +
                "nl.days_in_arrears,us.user_name,nur.response_txt " +
                "FROM npa_util_loan_detail nld " +
                "INNER JOIN npa_util_loan nl ON nl.account_id = nld.account_id " +
                "INNER JOIN "+dbTableName.iklantUsers+" us ON us.user_id = nld.recovery_officer_id " +
                "INNER JOIN npa_util_response nr ON nr.account_id = nld.account_id " +
                "INNER JOIN npa_util_response nur ON nur.account_id = nld.account_id " +
                "WHERE nr.question_id = " + constantsObj.getNpaGroupLeaderTraceableQuestionId() + " " +
                "AND nr.response_txt IN (" + isLeaderTraceableID + ") " +
                "AND nl.npa_indicator <> 'N' AND " +
                "nur.question_id = " + constantsObj.getNpaExpectedPaymentDateQuestionId() + " AND " +
                "nld.status_id IS NOT NULL ORDER BY overdue_amount DESC";
        }
        else if (reasonForNPA != 0) {
            npaSearchResultsQuery = "SELECT nld.account_id,nl.customer, " +
                "(nl.actual_principal_overdue+nl.actual_interest_overdue) AS overdue_amount, " +
                "nl.days_in_arrears,us.user_name,nur.response_txt " +
                "FROM npa_util_loan_detail nld " +
                "INNER JOIN npa_util_loan nl ON nl.account_id = nld.account_id " +
                "INNER JOIN "+dbTableName.iklantUsers+" us ON us.user_id = nld.recovery_officer_id " +
                "INNER JOIN npa_util_recovery_reason nlrr ON nlrr.account_id = nld.account_id " +
                "INNER JOIN npa_util_response nur ON nur.account_id = nld.account_id " +
                "WHERE nlrr.recovery_reason_type_id IN (" + reasonForNPA + ") " +
                "AND nl.npa_indicator <> 'N' AND " +
                "nur.question_id = " + constantsObj.getNpaExpectedPaymentDateQuestionId() + " AND " +
                "nld.status_id IS NOT NULL GROUP BY account_id ORDER BY overdue_amount DESC";


        }
        else if (overdueDurationFrom != 0 && overdueDurationTo != 0) {
            npaSearchResultsQuery = "SELECT nld.account_id,nl.customer, " +
                "(nl.actual_principal_overdue+nl.actual_interest_overdue) AS overdue_amount, " +
                "nl.days_in_arrears,us.user_name,nur.response_txt " +
                "FROM npa_util_loan_detail nld " +
                "LEFT JOIN npa_util_loan nl ON nl.account_id = nld.account_id " +
                "INNER JOIN "+dbTableName.iklantUsers+" us ON us.user_id = nld.recovery_officer_id " +
                "INNER JOIN npa_util_response nur ON nur.account_id = nld.account_id " +
                "WHERE nl.days_in_arrears >=" + overdueDurationFrom + " AND " +
                "nl.days_in_arrears <=" + overdueDurationTo + " " +
                "AND nl.npa_indicator <> 'N' AND " +
                "nur.question_id = " + constantsObj.getNpaExpectedPaymentDateQuestionId() + " AND " +
                "nld.status_id IS NOT NULL ORDER BY overdue_amount DESC";

        }
        else if (amountFrom != 0 && amountTo != 0) {
            npaSearchResultsQuery = "SELECT nld.account_id,nl.customer, " +
                "(nl.actual_principal_overdue+nl.actual_interest_overdue) AS overdue_amount, " +
                "nl.days_in_arrears,us.user_name,nur.response_txt " +
                "FROM npa_util_loan_detail nld " +
                "LEFT JOIN npa_util_loan nl ON nl.account_id = nld.account_id " +
                "INNER JOIN "+dbTableName.iklantUsers+" us ON us.user_id = nld.recovery_officer_id " +
                "INNER JOIN npa_util_response nur ON nur.account_id = nld.account_id " +
                "WHERE (nl.actual_principal_overdue+nl.actual_interest_overdue) >=" + amountFrom + " " +
                "AND (nl.actual_principal_overdue+nl.actual_interest_overdue) <=" + amountTo + " " +
                "AND nl.npa_indicator <> 'N' AND " +
                "nur.question_id = " + constantsObj.getNpaExpectedPaymentDateQuestionId() + " AND " +
                "nld.status_id IS NOT NULL ORDER BY overdue_amount DESC";
        }
        else if (branch != 0) {
            npaSearchResultsQuery = "SELECT nld.account_id,nl.customer, " +
                "(nl.actual_principal_overdue+nl.actual_interest_overdue) AS overdue_amount, " +
                "nl.days_in_arrears,us.user_name,nur.response_txt " +
                "FROM npa_util_loan_detail nld " +
                "INNER JOIN npa_util_loan nl ON nl.account_id = nld.account_id " +
                "INNER JOIN "+dbTableName.iklantUsers+" us ON us.user_id = nld.recovery_officer_id " +
                "INNER JOIN npa_util_response nur ON nur.account_id = nld.account_id " +
                "WHERE nl.office_id IN(" + branch + ") AND nl.npa_indicator <> 'N' AND " +
                "nur.question_id = " + constantsObj.getNpaExpectedPaymentDateQuestionId() + " " +
                "ORDER BY overdue_amount DESC";
        }
        customlog.info("npaSearchResultsQuery : " + npaSearchResultsQuery);
        if(npaSearchResultsQuery != "") {
            connectionDataSource.getConnection(function (clientConnect) {
                clientConnect.query(npaSearchResultsQuery,
                    function selectCb(err, results, fields) {
                        connectionDataSource.releaseConnectionPool(clientConnect);
                        if (err) {
                            customlog.error(err);
                        } else {
                            for (var i in results) {
                                accountIdArray[i] = results[i].account_id;
                                customerNameArray[i] = results[i].customer;
                                overDueAmountArray[i] = Math.round(results[i].overdue_amount);
                                daysInArrearsArray[i] = results[i].days_in_arrears;
                                recoveryOfficerNameArray[i] = results[i].user_name;
                                expectedCompletionDateArray[i] = formatDateForUI(results[i].response_txt);
                            }
                            callback(accountIdArray, customerNameArray, overDueAmountArray, daysInArrearsArray, recoveryOfficerNameArray, expectedCompletionDateArray);
                        }
                    });
            });
        }
        else{
            callback(accountIdArray, customerNameArray, overDueAmountArray, daysInArrearsArray, recoveryOfficerNameArray, expectedCompletionDateArray);
        }
    },
*/
    getRecoveryOfficersDatamodel: function (tenantId, userId, callback) {
        var self =this;
        var constantsObj = this.constants;
        var recoveryOfficerId = new Array();
        var recoveryOfficerName = new Array();

        var recoveryOfficersQuery = " SELECT u_role.personnel_id AS user_id,u_role.role_id,u.user_name " +
            " FROM "+dbTableName.mfiPersonnelRole+" u_role " +
            " INNER JOIN "+dbTableName.iklantUsers+" u ON u.user_id = u_role.personnel_id " +
            " LEFT JOIN rm_regional_office_list rmrol ON rmrol.office_id = u.office_id" +
            " WHERE u_role.role_id =" + constantsObj.getFOroleId() + " " +
            " AND u.tenant_id = " + tenantId + "" +
            " AND (rmrol.user_id = "+ userId +" OR "+ userId +" = -1)";
        customlog.info("recoveryOfficersQuery : " + recoveryOfficersQuery);
        connectionDataSource.getConnection(function (clientConnect) {
            clientConnect.query(recoveryOfficersQuery, function selectCb(err, results, fields) {
                connectionDataSource.releaseConnectionPool(clientConnect);
                if (err) {
                    customlog.error(err);
                } else {
                    for (var i in results) {
                        recoveryOfficerId[i] = results[i].user_id;
                        recoveryOfficerName[i] = results[i].user_name;
                    }
                    callback(recoveryOfficerId, recoveryOfficerName);
                }
            });
        });
    },

    /*getNPAReasonsDatamodel: function (tenantId, userId, callback) {
        var npaReasonIdArray = new Array();
        var npaReasonArray = new Array();
        var self = this;
        var npaReasonsQuery = "SELECT * FROM npa_util_recovery_reason_type";
        customlog.info("npaReasonsQuery : " + npaReasonsQuery);
        connectionDataSource.getConnection(function (clientConnect) {
            clientConnect.query(npaReasonsQuery, function selectCb(err, results, fields) {
                connectionDataSource.releaseConnectionPool(clientConnect);
                if (err) {
                    customlog.error(err);
                } else {
                    for (var i in results) {
                        npaReasonIdArray[i] = results[i].recovery_reason_type_id;
                        npaReasonArray[i] = results[i].recovery_reason_type;
                    }
                    self.getRecoveryOfficersDatamodel(tenantId, userId, function (recoveryOfficerId, recoveryOfficerName) {
                        callback(npaReasonIdArray, npaReasonArray, recoveryOfficerId, recoveryOfficerName);
                    });
                }
            });
        });
    },
*/
    /*getNPADefaultSearchDatamodel: function (userId,callback) {
        var self = this;
        var constantsObj = this.constants;
        var recoveryOfficerNameArray = new Array();
        var accountIdArray = new Array();
        var customerNameArray = new Array();
        var overDueAmountArray = new Array();
        var daysInArrearsArray = new Array();
        var expectedCompletionDateArray = new Array();

        var npaDefaultSearchQuery = "SELECT nld.account_id,nl.customer, " +
            "(nl.actual_principal_overdue+nl.actual_interest_overdue) AS overdue_amount, " +
            "nl.days_in_arrears,us.user_name,nur.response_txt FROM npa_util_loan_detail nld " +
            "LEFT JOIN npa_util_loan nl ON nl.account_id = nld.account_id " +
            "INNER JOIN "+dbTableName.iklantUsers+" us ON us.user_id = nld.recovery_officer_id " +
            "INNER JOIN npa_util_response nur ON nur.account_id = nld.account_id " +
            "LEFT JOIN rm_regional_office_list rmro ON rmro.office_id = nl.office_id " +
            "WHERE nur.question_id = " + constantsObj.getNpaExpectedPaymentDateQuestionId() + " " +
            "AND nl.npa_indicator <> 'N' " +
            "AND (rmro.user_id = " + userId +" OR " + userId +" = -1)" +
            "AND nld.status_id IS NOT null ORDER BY overdue_amount desc";
        customlog.info("npaDefaultSearchQuery : " + npaDefaultSearchQuery);
        connectionDataSource.getConnection(function (clientConnect) {
            clientConnect.query(npaDefaultSearchQuery, function selectCb(err, results, fields) {
                connectionDataSource.releaseConnectionPool(clientConnect);
                if (err) {
                    customlog.error(err);
                } else {
                    for (var i in results) {
                        accountIdArray[i] = results[i].account_id;
                        customerNameArray[i] = results[i].customer;
                        overDueAmountArray[i] = Math.round(results[i].overdue_amount);
                        recoveryOfficerNameArray[i] = results[i].user_name;
                        daysInArrearsArray[i] = results[i].days_in_arrears;
                        expectedCompletionDateArray[i] = formatDateForUI(results[i].response_txt);
                    }
                    callback(accountIdArray, customerNameArray, overDueAmountArray, recoveryOfficerNameArray,
                        daysInArrearsArray, expectedCompletionDateArray);
                }
            });
        });
    },

    getNpaCaseStatusDatamodel: function (tenantId, callback) {
        var self = this;
        
        var npaCaseStatusIdArray = new Array();
        var npaCaseStatusNameArray = new Array();
        var npaCaseStatusQuery = "SELECT * FROM npa_util_case_status";
        connectionDataSource.getConnection(function (clientConnect) {
            clientConnect.query(npaCaseStatusQuery, function selectCb(err, results, fields) {
                connectionDataSource.releaseConnectionPool(clientConnect);
                if (err) {
                    customlog.error(err);
                } else {
                    for (var i in results) {
                        npaCaseStatusIdArray[i] = results[i].status_id;
                        npaCaseStatusNameArray[i] = results[i].status_name;
                    }
                    callback(npaCaseStatusIdArray, npaCaseStatusNameArray);
                }
            });
        });
    },

    getNpaCaseDatamodel: function (userId, date, callback) {
        var self = this;
        var constantsObj = this.constants;
        var taskIdArray = new Array();
        var accountIdArray = new Array();
        var customerArray = new Array();
        var taskNameArray = new Array();
        var dueDateArray = new Array();
        var dueTimeArray = new Array();
        var statusIdArray = new Array();
        var statusNameArray = new Array();
        if (date == "current") {
            var npaCaseStatusQuery = "SELECT nut.task_id,nut.account_id,nut.task_name,nut.due_date,nut.due_time, " +
                "nul.customer,nucs.status_id,nucs.status_name " +
                "FROM npa_util_task nut " +
                "INNER JOIN npa_util_task_alloc nuta ON nuta.task_id = nut.task_id " +
                "INNER JOIN npa_util_loan nul ON nul.account_id = nut.account_id " +
                "INNER JOIN npa_util_case_status nucs ON nucs.status_id = nuta.status_id " +
                "WHERE nuta.allocated_to = " + userId + " AND nut.due_date = CURDATE() " +
                "AND nuta.status_id = " + constantsObj.getNpaCaseOpenStatusId() + " ORDER BY nut.due_date";
        } else if (date == "overdue") {
            var npaCaseStatusQuery = "SELECT nut.task_id,nut.account_id,nut.task_name,nut.due_date,nut.due_time, " +
                "nul.customer,nucs.status_id,nucs.status_name " +
                "FROM npa_util_task nut " +
                "INNER JOIN npa_util_task_alloc nuta ON nuta.task_id = nut.task_id " +
                "INNER JOIN npa_util_loan nul ON nul.account_id = nut.account_id " +
                "INNER JOIN npa_util_case_status nucs ON nucs.status_id = nuta.status_id " +
                "WHERE nuta.allocated_to = " + userId + " AND nut.due_date < CURDATE() " +
                "AND nuta.status_id = " + constantsObj.getNpaCaseOpenStatusId() + " ORDER BY nut.due_date";
        } else if (date == "future") {
            var npaCaseStatusQuery = "SELECT nut.task_id,nut.account_id,nut.task_name,nut.due_date,nut.due_time, " +
                "nul.customer,nucs.status_id,nucs.status_name " +
                "FROM npa_util_task nut " +
                "INNER JOIN npa_util_task_alloc nuta ON nuta.task_id = nut.task_id " +
                "INNER JOIN npa_util_loan nul ON nul.account_id = nut.account_id " +
                "INNER JOIN npa_util_case_status nucs ON nucs.status_id = nuta.status_id " +
                "WHERE nuta.allocated_to = " + userId + " AND nut.due_date > CURDATE() " +
                "AND nuta.status_id = " + constantsObj.getNpaCaseOpenStatusId() + " ORDER BY nut.due_date";
        }
        connectionDataSource.getConnection(function (clientConnect) {
            clientConnect.query(npaCaseStatusQuery, function selectCb(err, results, fields) {
                connectionDataSource.releaseConnectionPool(clientConnect);
                if (err) {
                    customlog.error(err);
                } else {
                    for (var i in results) {
                        taskIdArray[i] = results[i].task_id;
                        accountIdArray[i] = results[i].account_id;
                        customerArray[i] = results[i].customer;
                        taskNameArray[i] = results[i].task_name;
                        dueDateArray[i] = formatDateForUI(results[i].due_date);
                        dueTimeArray[i] = results[i].due_time;
                        statusIdArray[i] = results[i].status_id;
                        statusNameArray[i] = results[i].status_name;
                    }
                    callback(taskIdArray, accountIdArray, customerArray, taskNameArray, dueDateArray, dueTimeArray, statusIdArray, statusNameArray);
                }
            });
        });
    },

    getNpaClosedCaseDatamodel: function (userId, date, callback) {
        var self = this;
        var constantsObj = this.constants;
        var taskIdArray = new Array();
        var accountIdArray = new Array();
        var customerArray = new Array();
        var taskNameArray = new Array();
        var dueDateArray = new Array();
        var dueTimeArray = new Array();
        var statusIdArray = new Array();
        var statusNameArray = new Array();
        var closedDateArray = new Array();
        var remarksArray = new Array();

        var npaClosedCaseStatusQuery = "SELECT nut.task_id,nut.account_id,nut.task_name,nut.due_date,nut.due_time, " +
            "nul.customer,nucs.status_id,nucs.status_name,nuta.remarks,nuta.closed_date " +
            "FROM npa_util_task nut " +
            "INNER JOIN npa_util_task_alloc nuta ON nuta.task_id = nut.task_id " +
            "INNER JOIN npa_util_loan nul ON nul.account_id = nut.account_id " +
            "INNER JOIN npa_util_case_status nucs ON nucs.status_id = nuta.status_id " +
            "WHERE nuta.allocated_to = " + userId + " " +
            "AND nuta.status_id = " + constantsObj.getNpaCaseClosedStatusId() + " ORDER BY nut.due_date";
        connectionDataSource.getConnection(function (clientConnect) {
            clientConnect.query(npaClosedCaseStatusQuery, function selectCb(err, results, fields) {
                connectionDataSource.releaseConnectionPool(clientConnect);
                if (err) {
                    customlog.error(err);
                } else {
                    for (var i in results) {
                        taskIdArray[i] = results[i].task_id;
                        accountIdArray[i] = results[i].account_id;
                        customerArray[i] = results[i].customer;
                        taskNameArray[i] = results[i].task_name;
                        dueDateArray[i] = formatDateForUI(results[i].due_date);
                        statusIdArray[i] = results[i].status_id;
                        statusNameArray[i] = results[i].status_name;
                        closedDateArray[i] = formatDateForUI(results[i].closed_date);
                        remarksArray[i] = results[i].remarks;
                    }
                    callback(taskIdArray, accountIdArray, customerArray, taskNameArray, dueDateArray, statusIdArray, statusNameArray, closedDateArray, remarksArray);
                }
            });
        });
    },

    submitNpaCaseDatamodel: function (taskId, taskRemarks, callback) {
        var self= this;
        var constantsObj = this.constants;
        var npaCaseSubmitQuery = "UPDATE npa_util_task_alloc SET status_id = " + constantsObj.getNpaCaseClosedStatusId() + ", " +
            "last_updated_date = NOW() + INTERVAL 5 HOUR + INTERVAL 30 MINUTE,remarks='" + taskRemarks + "',closed_date = NOW() + INTERVAL 5 HOUR + INTERVAL 30 MINUTE " +
            "WHERE task_id = " + taskId + "";
        connectionDataSource.getConnection(function (clientConnect) {
            clientConnect.query(npaCaseSubmitQuery, function selectCb(err, results, fields) {
                connectionDataSource.releaseConnectionPool(clientConnect);
                if (err) {
                    customlog.error(err);
                } else {
                    callback('success');
                }
            });
        });
    },
*/
   /* // TODO: Data Access Layer
    getGroupsForRecoveryDataModel: function (userId, callback) {
        customlog.info("Inside getGroupsForRecoveryDataModel");
        var self=this;
        var groupDetailsArray = new Array();
        var retrieveGroupListForLR = "SELECT  " +
            "npa_det.account_id, " +
            "npa_det.customer_id, " +
            "npa_det.global_account_num, " +
            "npa_det.customer, " +
            "group_lead_add.address " +
            "FROM " +
            "( " +
            "SELECT  " +
            "npa.account_id, " +
            "npa.customer_id, " +
            "npa.global_account_num, " +
            "npa.customer, " +
            "npa.npa_indicator  " +
            "FROM  " +
            "npa_util_loan npa " +
            ")npa_det " +
            "LEFT JOIN " +
            "( " +
            "SELECT  " +
            "MIN(c.customer_id) AS customer_id, " +
            "c.parent_customer_id, " +
            "cad.line_1 AS address  " +
            "FROM customer c  " +
            "INNER JOIN customer_address_detail cad ON c.customer_id = cad.customer_id " +
            "WHERE c.customer_level_id =1  " +
            "GROUP BY c.parent_customer_id " +
            "ORDER BY c.parent_customer_id,c.customer_id " +
            ")group_lead_add " +
            "ON npa_det.customer_id = group_lead_add.parent_customer_id " +
            "INNER JOIN  npa_util_loan_detail nla ON nla.account_id =  npa_det.account_id " +
            "WHERE nla.recovery_officer_id = " + userId + " AND npa_det.npa_indicator <> 'N'";
        customlog.info("retrieveGroupListForLR : " + retrieveGroupListForLR);
        connectionDataSource.getConnection(function (clientConnect) {
            clientConnect.query(retrieveGroupListForLR,
                function selectCb(err, results, fields) {
                    connectionDataSource.releaseConnectionPool(clientConnect);
                    if (err) {
                        customlog.error(err);
                    }
                    else {
                        for (var i in results) {
                            var LoanRepaymentForFO1 = require("../domain/recoveryHolder");
                            var LoanRepaymentForFO = new LoanRepaymentForFO1();
                            LoanRepaymentForFO.setAccountId(results[i].account_id);
                            LoanRepaymentForFO.setGroupName(results[i].customer);
                            LoanRepaymentForFO.setAddress(results[i].address);
                            groupDetailsArray[i] = LoanRepaymentForFO;
                        }
                    }
                    callback(groupDetailsArray);
                });
        });
    },
*/
    /*updateVerifiedInformationDataModel: function (accountId, statusId, reason, remarks, capabilitypercentage, expecteddate, otherReason, answerOne, answerTwo, answerThree, answerFour, answerFive, answerSix, answerSeven, flag, userId, todoActivity, todoDueDate, todoDueTime, callback) {
        var self=this;
        var updateVerifiedInformationQuery;
        var insertQuestion1Query;
        var insertQuestion2Query;
        var insertQuestion3Query;
        var insertQuestion4Query;
        var insertQuestion5Query;
        var insertQuestion6Query;
        var insertQuestion7Query
        customlog.info("todoActivity : " + todoActivity);
        connectionDataSource.getConnection(function (clientConnect) {
            if (todoActivity != '') {
                for (var j = 0; j < todoActivity.length; j++) {
                    var insertTodoQuery = "INSERT INTO npa_util_task(activity_id,account_id,created_personnel_id,task_name,created_date, " +
                        "due_date,due_time)VALUES(1," + accountId + "," + userId + ",'" + todoActivity[j] + "', " +
                        "NOW() + INTERVAL 5 HOUR + INTERVAL 30 MINUTE,'" + formatDate(todoDueDate[j]) + "','" + todoDueTime[j] + ":00:00')";
                    customlog.info("insertTodoQuery :" + insertTodoQuery);
                    clientConnect.query(insertTodoQuery, function postCreate(err) {
                        if (!err) {

                        } else {
                            connectionDataSource.releaseConnectionPool(clientConnect);
                            customlog.error(err);
                        }
                    });

                    var insertTodoAllocQuery = "INSERT INTO npa_util_task_alloc(task_id,status_id,allocated_by,allocated_to, " +
                        "allocated_date, due_date, due_time)VALUES " +
                        "((SELECT MAX(task_id) FROM npa_util_task WHERE created_personnel_id = " + userId + "),1," +
                        "" + userId + "," + userId + ",CURDATE(),'" + formatDate(todoDueDate[j]) + "','" + todoDueTime[j] + ":00:00')";
                    customlog.info("insertTodoAllocQuery :" + insertTodoAllocQuery);
                    clientConnect.query(insertTodoAllocQuery, function postCreate(err) {
                        if (!err) {

                        } else {
                            connectionDataSource.releaseConnectionPool(clientConnect);
                            customlog.error(err);
                        }
                    });
                }
            }
            var deleteReasonsQuery = "DELETE FROM npa_util_recovery_reason WHERE account_id = " + accountId + "";
            clientConnect.query(deleteReasonsQuery,
                function postCreate(err) {
                    if (!err) {

                    } else {
                        connectionDataSource.releaseConnectionPool(clientConnect);
                        customlog.error(err);
                    }
                });
            for (var i = 0; i < reason.length; i++) {
                var insertReasonsQuery = "INSERT INTO npa_util_recovery_reason (account_id, recovery_reason_type_id) " +
                    "VALUES( " + accountId + ", " + reason[i] + "); ";
                clientConnect.query(insertReasonsQuery,
                    function postCreate(err) {
                        if (!err) {

                        } else {
                            connectionDataSource.releaseConnectionPool(clientConnect);
                            customlog.error(err);
                        }
                    });
            }
            if (flag) {
                insertQuestion1Query = "INSERT INTO npa_util_response " +
                    "(account_id, question_id, response_txt,created_date) " +
                    "VALUES(" + accountId + ", 1, " + answerOne + ", NOW() + INTERVAL 5 HOUR + INTERVAL 30 MINUTE); ";
            } else {
                insertQuestion1Query = "UPDATE npa_util_response  " +
                    "SET response_txt = " + answerOne + ", updated_date = NOW() + INTERVAL 5 HOUR + INTERVAL 30 MINUTE " +
                    "WHERE account_id = " + accountId + " AND question_id = 1;";
            }
            clientConnect.query(insertQuestion1Query,
                function postCreate(err) {
                    if (!err) {

                    } else {
                        connectionDataSource.releaseConnectionPool(clientConnect);
                        customlog.error(err);
                    }
                });
            if (flag) {
                insertQuestion2Query = "INSERT INTO npa_util_response " +
                    "(account_id, question_id, response_txt,created_date) " +
                    "VALUES(" + accountId + ",2," + answerTwo + ",NOW() + INTERVAL 5 HOUR + INTERVAL 30 MINUTE); ";
            } else {
                insertQuestion2Query = "UPDATE npa_util_response  " +
                    "SET response_txt = " + answerTwo + ", updated_date = NOW() + INTERVAL 5 HOUR + INTERVAL 30 MINUTE " +
                    "WHERE account_id = " + accountId + " AND question_id = 2;";
            }
            clientConnect.query(insertQuestion2Query,
                function postCreate(err) {
                    if (!err) {

                    } else {
                        connectionDataSource.releaseConnectionPool(clientConnect);
                        customlog.error(err);
                    }
                });
            if (flag) {
                insertQuestion3Query = "INSERT INTO npa_util_response " +
                    "(account_id, question_id, response_txt,created_date) " +
                    "VALUES(" + accountId + ", 3, " + answerThree + ", NOW() + INTERVAL 5 HOUR + INTERVAL 30 MINUTE); ";
            } else {
                insertQuestion3Query = "UPDATE npa_util_response  " +
                    "SET response_txt = " + answerThree + ", updated_date = NOW() + INTERVAL 5 HOUR + INTERVAL 30 MINUTE " +
                    "WHERE account_id = " + accountId + " AND question_id = 3;";
            }
            clientConnect.query(insertQuestion3Query,
                function postCreate(err) {
                    if (!err) {

                    } else {
                        connectionDataSource.releaseConnectionPool(clientConnect);
                        customlog.error(err);
                    }
                });
            if (flag) {
                insertQuestion4Query = "INSERT INTO npa_util_response " +
                    "(account_id, question_id, response_txt,created_date) " +
                    "VALUES(" + accountId + ", 4, " + answerFour + ", NOW() + INTERVAL 5 HOUR + INTERVAL 30 MINUTE); ";
            }
            else {
                insertQuestion4Query = "UPDATE npa_util_response  " +
                    "SET response_txt = " + answerFour + ", updated_date = NOW() + INTERVAL 5 HOUR + INTERVAL 30 MINUTE " +
                    "WHERE account_id = " + accountId + " AND question_id = 4;";

            }
            clientConnect.query(insertQuestion4Query,
                function postCreate(err) {
                    if (!err) {

                    } else {
                        connectionDataSource.releaseConnectionPool(clientConnect);
                        customlog.error(err);
                    }
                });

            if (flag) {
                insertQuestion5Query = "INSERT INTO npa_util_response " +
                    "(account_id, question_id, response_txt,created_date) " +
                    "VALUES(" + accountId + ", 5, " + answerFive + ", NOW() + INTERVAL 5 HOUR + INTERVAL 30 MINUTE); ";

            }
            else {
                insertQuestion5Query = "UPDATE npa_util_response  " +
                    "SET response_txt = " + answerFive + ", updated_date = NOW() + INTERVAL 5 HOUR + INTERVAL 30 MINUTE " +
                    "WHERE account_id = " + accountId + " AND question_id = 5;";

            }
            clientConnect.query(insertQuestion5Query,
                function postCreate(err) {
                    if (!err) {
                        customlog.info("success");
                    } else {
                        connectionDataSource.releaseConnectionPool(clientConnect);
                        customlog.error(err);
                    }
                });
            if (typeof(answerSix) != 'undefined') {
                if (flag) {
                    insertQuestion6Query = "INSERT INTO npa_util_response " +
                        "(account_id, question_id, response_txt,created_date) " +
                        "VALUES(" + accountId + ", 6, " + answerSix + ", NOW() + INTERVAL 5 HOUR + INTERVAL 30 MINUTE); ";

                }
                else {
                    insertQuestion6Query = "UPDATE npa_util_response  " +
                        "SET response_txt = " + answerSix + ", updated_date = NOW() + INTERVAL 5 HOUR + INTERVAL 30 MINUTE " +
                        "WHERE account_id = " + accountId + " AND question_id = 6;";

                }
                clientConnect.query(insertQuestion6Query,
                    function postCreate(err) {
                        if (!err) {
                            customlog.info("success");
                        } else {
                            connectionDataSource.releaseConnectionPool(clientConnect);
                            customlog.error(err);
                        }
                    });
            }
            if (typeof(answerSeven) != 'undefined') {
                if (flag) {
                    insertQuestion7Query = "INSERT INTO npa_util_response " +
                        "(account_id, question_id, response_txt,created_date) " +
                        "VALUES(" + accountId + ", 7, '" + formatDate(answerSeven) + "', NOW() + INTERVAL 5 HOUR + INTERVAL 30 MINUTE); ";
                }
                else {
                    insertQuestion7Query = "UPDATE npa_util_response  " +
                        "SET response_txt = '" + formatDate(answerSeven) + "', updated_date = NOW() + INTERVAL 5 HOUR + INTERVAL 30 MINUTE " +
                        "WHERE account_id = " + accountId + " AND question_id = 7;";
                }
                clientConnect.query(insertQuestion7Query,
                    function postCreate(err) {
                        if (!err) {
                            customlog.info("success");
                        } else {
                            connectionDataSource.releaseConnectionPool(clientConnect);
                            customlog.error(err);
                        }
                    });
            }
            if (statusId == 1) {
                updateVerifiedInformationQuery = "UPDATE npa_util_loan_detail SET status_id = 1,last_updated_date = NOW() + INTERVAL 5 HOUR + INTERVAL 30 MINUTE WHERE account_id = " + accountId + "; ";
            } else if (statusId == 2) {
                updateVerifiedInformationQuery = "UPDATE npa_util_loan_detail SET status_id = 2,last_updated_date = NOW() + INTERVAL 5 HOUR + INTERVAL 30 MINUTE WHERE account_id = " + accountId + "; ";
            } else if (statusId == 3) {
                updateVerifiedInformationQuery = "UPDATE npa_util_loan_detail SET status_id = 3,reason_for_not_paid = '" + reason + "',remarks ='" + remarks + "',other_reasons = '" + otherReason + "',last_updated_date = NOW() + INTERVAL 5 HOUR + INTERVAL 30 MINUTE  WHERE account_id =" + accountId + "; ";
            } else if (statusId == 4) {
                updateVerifiedInformationQuery = "UPDATE npa_util_loan_detail SET status_id = 4,reason_for_not_paid = '" + reason + "',capablility_percentage =" + capabilitypercentage + ",expected_payment_date='" + formatDate(expecteddate) + "',other_reasons = '" + otherReason + "',last_updated_date = NOW() + INTERVAL 5 HOUR + INTERVAL 30 MINUTE  WHERE account_id = " + accountId + "; ";
            }
            clientConnect.query(updateVerifiedInformationQuery,
                function postCreate(err) {
                    connectionDataSource.releaseConnectionPool(clientConnect);
                    if (!err) {
                        customlog.info("success");
                    } else {
                        customlog.error(err);
                    }
                    callback();
                });
        });
    },
*/
    /*//upload File
    updateFileLocationDataModel: function (accountId, fileName, selectedClientId, callback) {
        customlog.info("reached Datamodel " + accountId + " " + fileName);
        var self=this;
        if (fileName != "") {
            for (var i = 0; i < fileName.length; i++) {
                var fileLocation = "documents/group_documents/" + fileName[i];
                var query = "INSERT INTO account_doc(account_id,client_id,captured_image,account_doc_name)VALUES('" + accountId + "','" + selectedClientId + "','" + fileLocation + "','" + fileName[i] + "')";
                connectionDataSource.getConnection(function (clientConnect) {
                    clientConnect.query(query,
                        function selectCb(err, results, fields) {
                            connectionDataSource.releaseConnectionPool(clientConnect);
                            if (err) {
                                customlog.error(err);
                            } else {
                                customlog.info("Image Location Instered..!");
                                if (fileName.length - 1 == i)
                                    callback();
                            }
                        });
                });
            }
        }
        callback();
    },*/

    /*retrieveClientDetailsDataModel: function (accountId, callback) {
        var self=this;
        var customerIdArray = new Array();
        var customerNameArray = new Array();
        var customerAddressArray = new Array();
        var retrieveClientDetailsQuery = "SELECT * FROM " +
            "( " +
            "	SELECT  " +
            "	la.account_id,la.parent_account_id ,a.customer_id " +
            "	FROM " +
            "	loan_account la " +
            "	INNER JOIN account a ON a.account_id = la.account_id " +
            "	WHERE la.parent_account_id = " + accountId + " " +
            ")acc " +
            "LEFT JOIN  " +
            "( " +
            "	SELECT  " +
            "	c.customer_id, " +
            "	c.display_name, " +
            "	c.parent_customer_id , " +
            "	CONCAT(cad.line_1,',',IFNULL(cad.line_2,''),',' ,IFNULL(cad.line_3,''),',',cad.city,',',cad.state,',',cad.country) AS address  " +
            "	FROM customer c " +
            "	LEFT JOIN customer_address_detail cad ON cad.customer_id = c.customer_id " +
            "	WHERE c.customer_level_id =1 " +
            "	ORDER BY c.customer_id " +
            ")address " +
            "ON acc.customer_id = address.customer_id; ";
        connectionDataSource.getConnection(function (clientConnect) {
            clientConnect.query(retrieveClientDetailsQuery,
                function selectCb(err, results, fields) {
                    connectionDataSource.releaseConnectionPool(clientConnect);
                    if (err) {
                        customlog.error(err);
                    }
                    else {
                        for (var i in results) {
                            customerIdArray[i] = results[i].customer_id;
                            customerNameArray[i] = results[i].display_name;
                            customerAddressArray[i] = results[i].address;
                        }
                    }
                    callback(customerIdArray, customerNameArray, customerAddressArray);
                });
        });
    },

    retrieveUploadedDocsPageDataModel: function (accountId, clientId, callback) {
        var self=this;
        var docsListArray = new Array();
        var retrieveUploadedDocsQuery = "SELECT * FROM account_doc WHERE account_id=" + accountId + " AND client_id=" + clientId + "";
        connectionDataSource.getConnection(function (clientConnect) {
            clientConnect.query(retrieveUploadedDocsQuery,
                function selectCb(err, results, fields) {
                    connectionDataSource.releaseConnectionPool(clientConnect);
                    if (err) {
                        customlog.error(err);
                    }
                    else {
                        for (var i in results) {
                            docsListArray[i] = results[i].captured_image;
                        }
                    }
                    customlog.info("docsListArray " + docsListArray);
                    callback(docsListArray);
                });
        });
    },
*/
    /*authLoginAcess: function (userName, password, callback) {
        var constantsObj = this.constants;
        var self =  this;
        var userDetailsQuery = "SELECT us.*,r.role_id,r.role_name,r.role_description,isl.doc_language,atype.access_type_description,atype.access_type_id FROM "+dbTableName.iklantUsers+" us " +
            "INNER JOIN "+dbTableName.mfiPersonnelRole+" ur ON ur.personnel_id = us.user_id " +
            "INNER JOIN "+dbTableName.iklantRole+" r ON r.role_id = ur.role_id " +
            "LEFT JOIN iklant_office o ON o.`office_id` = us.`office_id` " +
            "LEFT JOIN iklant_state_list isl ON isl.`state_id` = o.`state_id` " +
            "LEFT JOIN "+dbTableName.iklantAccessType+" atype ON atype.user_id = us.user_id "+
            "WHERE us.user_name = '" + userName + "' and us.password = '" + password + "' " +
            "and us.active_indicator = " + this.constants.getActiveIndicatorTrue() + "";
        customlog.info("Login Query : " + userDetailsQuery);
        connectionDataSource.getConnection(function (clientConnect) {
            customlog.info('Inside Connection');
            clientConnect.query(userDetailsQuery, function selectCb(err, results, fields) {
                customlog.info('Inside Query excecution');
                if (err) {
                    customlog.error(err);
                    connectionDataSource.releaseConnectionPool(clientConnect);
                    callback(results);
                }
                else if (results !=null && results.length !=0){
                    var menuId = new Array(),menuName = new Array(),menuUrl = new Array(), imgLocation = new Array();
                    var roleIdArray = new Array();
                    for(var i=0;i<results.length;i++){
                        roleIdArray.push(results[i].role_id);
                    }
                    var menuDetailsQuery = "SELECT mr.menu_id,ml.menu_name,ml.img_location,ml.menu_url " +
                        "FROM "+dbTableName.iklantMenuRoleMapping+" mr INNER JOIN "+dbTableName.iklantMenuLevels+" ml ON (ml.menu_id = mr.menu_id) " +
                        "WHERE mr.role_id IN ("+roleIdArray+") AND ml.parent_menu_id IS NULL  AND ml.`depth_level`=0 AND currently_in_use = 1 GROUP BY mr.menu_id";
                    customlog.info(menuDetailsQuery);
                    connectionDataSource.getConnection(function (clientConnect) {
                        connectionDataSource.releaseConnectionPool(clientConnect);
                        clientConnect.query(menuDetailsQuery, function selectCb(err, resultsMenu, fields) {
                            if (err) {
                                customlog.error(err);
                                callback(results,resultsMenu);
                            }
                            else{
                                for(var i=0;i<resultsMenu.length;i++){
                                    menuId[i] = resultsMenu[i].menu_id;
                                    menuName[i] = resultsMenu[i].menu_name;
                                    menuUrl[i] = resultsMenu[i].menu_url;
                                    imgLocation[i] = resultsMenu[i].img_location;
                                }
                                var resultArray = new Array({menu_id:menuId, menu_name:menuName, menu_url:menuUrl, img_location:imgLocation});
                                callback(results,resultArray);
                            }
                        });
                    });
                }
                else{
                    connectionDataSource.releaseConnectionPool(clientConnect);
                    callback(results);
                }
            });
        });
    },
*/
    /*getPOSForAgingDataModel: function (officeId,productCategoryId,loanOfficer,callback) {
        var self=this;
        var date = new Array();
        var overallpos = new Array();
        var posQuery = "SELECT DATE_FORMAT(DATE,'%Y-%m-%d') AS pos_date, SUM(actual_principal_outstanding) AS overall_pos FROM npa_summary "
            +"WHERE (office_id IN ("+officeId+"))"
            +"AND (prd_category_id IN ("+productCategoryId+") OR "+productCategoryId+" = -1)"
            +"AND (personnel_id IN ("+loanOfficer+") OR "+loanOfficer+" = -1)"
            +"GROUP BY pos_date";
        customlog.info("POS Query : " + posQuery);
        connectionDataSource.getConnection(function (clientConnect) {
            customlog.info('Inside Connection');
            clientConnect.query(posQuery, function selectCb(err, results, fields) {
                customlog.info('Inside Query excecution');
                if (err) {
                    customlog.error(err);
                    connectionDataSource.releaseConnectionPool(clientConnect);
                    callback(results);
                }
                else{
                    // customlog.info("result",results);
                    for (var i in results) {
                        date[i] = results[i].pos_date;
                        overallpos[i] = results[i].overall_pos;
                    }
                    connectionDataSource.releaseConnectionPool(clientConnect);
                    callback(date,overallpos);
                }
            });
        });

    },

    // Code Added by chitra
    getCashBalanceDataModel: function (officeId,finYear,callback) {
        var self=this;
        var cash_report_date = new Array();
        var cash_closing_balance_array = new Array();
        var bank_report_date = new Array();
        var bank_closing_balance_array = new Array();
        var cashBalQuery;
        if(officeId == -1){ // All Office
            cashBalQuery = "SELECT office_id,DATE_FORMAT(ledger_report_date,'%Y-%m-%d') as report_date,SUM(closing_balance) as closing_balance,entity_id FROM `batch_ledger_balance` WHERE fin_year = "+finYear+" GROUP BY entity_id,ledger_report_date ";
        }else{
            cashBalQuery = "SELECT office_id,DATE_FORMAT(ledger_report_date,'%Y-%m-%d') as report_date,SUM(closing_balance) as closing_balance,entity_id FROM `batch_ledger_balance` WHERE fin_year = "+finYear+
                " AND office_id in( "+officeId+") GROUP BY entity_id,ledger_report_date";
        }
        customlog.info("cashBalQuery : " + cashBalQuery);
        connectionDataSource.getConnection(function (clientConnect) {
            clientConnect.query(cashBalQuery, function selectCb(err, results, fields) {
                if (err) {
                    customlog.error(err);
                    connectionDataSource.releaseConnectionPool(clientConnect);
                    callback(results);
                }
                else{
                    // customlog.info("result",results);
                    var cash_index = 0,bank_index = 0;
                    for (var i in results) {
                        if(results[i].entity_id == 102){
                            cash_report_date[cash_index] = results[i].report_date;
                            cash_closing_balance_array[cash_index] = results[i].closing_balance;
                            cash_index++;
                        }else if(results[i].entity_id == 103){
                            bank_report_date[bank_index] = results[i].report_date;
                            bank_closing_balance_array[bank_index] = results[i].closing_balance;
                            bank_index++;
                        }
                    }
                    connectionDataSource.releaseConnectionPool(clientConnect);
                    callback(cash_report_date,cash_closing_balance_array,bank_report_date,bank_closing_balance_array);
                }
            });
        });
    },*/
   /* *//* Added by chitra for existing user *//*
    checkExistingUserDataModel: function (user_name,callback) {
        var self = this;
        var userExistingQuery;
        var existingUserArray = new Array();
        var userStatus = "";
        userExistingQuery = "SELECT user_id,user_name FROM "+dbTableName.iklantUsers+" WHERE user_name = '"+user_name+"' ";
        customlog.info("userExistingQuery : " + userExistingQuery);
        connectionDataSource.getConnection(function (clientConnect) {
            clientConnect.query(userExistingQuery, function selectCb(err, results, fields) {
                if (err) {
                    customlog.error(err);
                    connectionDataSource.releaseConnectionPool(clientConnect);
                    callback(results);
                }
                else{
                    if(results != null && results.length > 0){
                        for (var i in results) {
                            existingUserArray[i] = results[i].user_id;
                        }
                        userStatus = "Existing User";
                    }else{
                        userStatus = "Not Existing User";
                    }
                    connectionDataSource.releaseConnectionPool(clientConnect);
                    callback(existingUserArray,userStatus);
                }
            });
        });
    },
    // Ended by Chitra*/

    changeStatusIdDataModel: function (groupId, rejected_id_array, callback) {
        customlog.info("Inside changeStatusIdDataModel");
        var self=this;
        var constantsObj = this.constants;
        var synchronizedGroupsStatus = constantsObj.getSynchronizedGroupsStatus();
        var changeStatusIdAfterLoanSanctionInIklantDB = "update "+dbTableName.iklantProspectGroup+" set status_id = " + synchronizedGroupsStatus + ", updated_date=NOW() + INTERVAL 5 HOUR + INTERVAL 30 MINUTE where group_id = " + groupId + " ";
        customlog.info("changeStatusIdAfterLoanSanctionInIklantDB" + changeStatusIdAfterLoanSanctionInIklantDB);
        connectionDataSource.getConnection(function (clientConnect) {
            clientConnect.query(changeStatusIdAfterLoanSanctionInIklantDB,
                function postCreate(err) {
                    if (!err) {
                        customlog.info("StatusIdUpudated updated Succesfully");
                        //Added by Chitra [Documents shouldn't generated for rejected clients]
                        if (rejected_id_array.length != 0) {
                            var rejectedLoanSanctionStatus = constantsObj.getRejectedLoanSanction();
                            var StatusIdAfterLoanSanctionInIklantDB = "UPDATE "+dbTableName.iklantProspectClient+" SET `status_id` = " + rejectedLoanSanctionStatus + ", updated_date=NOW() + INTERVAL 5 HOUR + INTERVAL 30 MINUTE WHERE `client_id` IN ( " + rejected_id_array + ")";
                            clientConnect.query(StatusIdAfterLoanSanctionInIklantDB,
                                function postCreate(err) {
                                    connectionDataSource.releaseConnectionPool(clientConnect);
                                    if (err) {
                                        customlog.error("StatusId Updated for client Succesfully");
                                    }
                                });
                        } else {
                            connectionDataSource.releaseConnectionPool(clientConnect);
                        }
                    } else {
                        connectionDataSource.releaseConnectionPool(clientConnect);
                        customlog.error(err);
                    }
                });
        });
    },

    getFONamesDataModel: function (officeId, callback) {
        var self=this;
        var FOIdsArray = new Array();
        var FONamesArray = new Array();
        var constantsObj = this.constants;

        var FONamesQuery = "SELECT u.user_name, u.user_id FROM "+dbTableName.iklantUsers+" u " +
            "INNER JOIN "+dbTableName.mfiPersonnelRole+" ur ON ur.personnel_id = u.user_id " +
            "WHERE u.office_id IN(" + officeId + ") AND ur.role_id = " + constantsObj.getFOroleId() + " " +
            "and u.active_indicator = " + this.constants.getActiveIndicatorTrue() + "";
        customlog.info("FONamesQuery : " + FONamesQuery);
        connectionDataSource.getConnection(function (clientConnect) {
            clientConnect.query(FONamesQuery, function selectCb(err, results, fields) {
                    connectionDataSource.releaseConnectionPool(clientConnect);
                    if (err) {
                        customlog.error(err);
                    } else {
                        for (var i in results) {
                            FOIdsArray[i] = results[i].user_id;
                            FONamesArray[i] = results[i].user_name;

                        }
                    }
                    customlog.info("FOIdsArray : " + FOIdsArray);
                    customlog.info("FONamesArray : " + FONamesArray);
                    callback(FOIdsArray, FONamesArray);
                }
            );
        });
    },

    /*updateClientStatusDataModel: function (clientIdListArray, clientIds, overdues, callback) {
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
     customlog.info("updateClientStatusForRejectedClient" + updateClientStatusForRejectedClient);
     clientConnect.query(updateClientStatusForRejectedClient, function postCreate(err) {
     if (err) {
     customlog.error(err);
     connectionDataSource.releaseConnectionPool(clientConnect);
     }
     });
     break;
     }
     else {
     customlog.info("clientIdListArray In else" + clientIdListArray[j]);
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

     customlog.info("updateClientStatusForReintiatedClient" + updateClientStatusForReintiatedClient);
     clientConnect.query(updateClientStatusForReintiatedClient, function postCreate(err) {
     if (err) {
     customlog.error(err);
     connectionDataSource.releaseConnectionPool(clientConnect);
     }
     });
     }
     }
     }
     connectionDataSource.releaseConnectionPool(clientConnect);
     callback();
     });
     },*/
    /*reinitiateGroupDatamodel: function (groupId, remarks, callback) {
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
     customlog.info("reinitiateQuery : "+reinitiateQuery);
     clientConnect.query(reinitiateQuery, function selectCb(err, results, fields) {
     if (err) {
     connectionDataSource.releaseConnectionPool(clientConnect);
     customlog.error(err);
     callback(reinitiatedStatus);
     }
     else{
     var getStatusQuery = "SELECT ps.status_name FROM "+dbTableName.iklantProspectGroup+" pg " +
     "INNER JOIN "+dbTableName.iklantProspectStatus+" ps ON ps.status_id = pg.status_id " +
     "WHERE pg.group_id = " + groupId + "";
     clientConnect.query(getStatusQuery, function selectCb(err, results, fields) {
     connectionDataSource.releaseConnectionPool(clientConnect);
     if (err) {
     customlog.error(err);
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
     },*/

    /*groupDetailsAuthorizationDatamodel: function (tenantId, branchId, groupId, clientId, callback) {
     var prospectGroupObj = require("../domain/prospectGroup");
     var preliminaryVerificationObj = require("../domain/preliminaryVerification");
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
     prosGroupObj.setGroup_created_date(formatDateForUI(results[i].group_created_date));
     } else {
     prosGroupObj.setGroup_created_date("Group Created Date Not Provided");
     }
     if (results[i].loan_active_from != null) {
     preliminaryVerificationObj.setloan_active_from(formatDateForUI(results[i].loan_active_from));
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
     preliminaryVerificationObj.setaccount_created_date(formatDateForUI(results[i].account_created_date));
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
     },*/
    /*retrieveDocDatamodel: function (tenantId, clientId, callback) {
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
     },*/

    // Added by chitra
    /*showDashBoardDataModel: function (tenantId, officeId, callback) {
     var self=this;
     var dashBoard = require("../domain/dashboard");
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
     var retrieveDashBoardQueryDetails = "SELECT user_id,user_name,role_id,IF(role_id = "+constantsObj.getBDEroleId()+",'BDE','FO') AS role_name,office_id,office_name,IF((pv_count IS NULL OR pv_count = 0),'-',pv_count) AS pv_count,IF((kyc_upload_count IS NULL OR kyc_upload_count = 0),'-',kyc_upload_count) AS kyc_upload_count," +
     " IF((fv_count IS NULL OR fv_count = 0),'-',fv_count) AS fv_count,IF((rejected_count IS NULL OR rejected_count = 0),'-',rejected_count) AS rejected_count,IF((kyc_updating_count IS NULL OR kyc_updating_count = 0),'-',kyc_updating_count) AS kyc_updating_count," +
     " IF((dv_count IS NULL OR dv_count = 0),'-',dv_count) AS dv_count,IF((cba_count IS NULL OR cba_count = 0),'-',cba_count) AS cba_count,IF((assigned_fo_count IS NULL OR assigned_fo_count = 0),'-',assigned_fo_count) AS assigned_fo_count,IF((appraisal_count IS NULL OR appraisal_count = 0),'-',appraisal_count) AS appraisal_count," +
     " IF((la_count IS NULL OR la_count = 0),'-',la_count) AS la_count,IF((ls_count IS NULL OR ls_count = 0),'-',ls_count) AS ls_count FROM ( SELECT u.user_id,u.user_name,pr.role_id,(SELECT role_name FROM iklant_role role WHERE role.role_id = pr.role_id) AS role_name, " +
     " u.office_id,(SELECT office_name FROM "+dbTableName.iklantOffice+" WHERE office_id = u.office_id) AS office_name," +
     " (SELECT COUNT(group_id) FROM "+dbTableName.iklantProspectGroup+" pg1 WHERE pg1.created_by = pr.personnel_id AND status_id = "+constantsObj.getNewGroup()+" GROUP BY pg1.created_by) AS pv_count," +
     " (SELECT COUNT(group_id) FROM "+dbTableName.iklantProspectGroup+" pg1 WHERE pg1.created_by = pr.personnel_id AND status_id = "+constantsObj.getPreliminaryVerified()+" GROUP BY pg1.created_by) AS kyc_upload_count," +
     " (SELECT COUNT(group_id) FROM "+dbTableName.iklantProspectGroup+" pg1 WHERE pg1.assigned_to = pr.personnel_id AND status_id = "+constantsObj.getAssignedFO()+" GROUP BY pg1.assigned_to) AS fv_count," +
     " (SELECT COUNT(group_id) FROM "+dbTableName.iklantProspectGroup+" pg1 WHERE pg1.created_by = pr.personnel_id AND status_id IN("+constantsObj.getRejectedPriliminaryVerification()+","+constantsObj.getRejectedAppraisal()+","+constantsObj.getRejectedLoanSanction()+","+constantsObj.getRejectedFieldVerification()+","+constantsObj.getRejectedCreditBureauAnalysisStatusId()+") GROUP BY pg1.created_by) AS rejected_count," +
     " (SELECT COUNT(group_id) FROM "+dbTableName.iklantProspectGroup+" pg1 WHERE status_id = "+constantsObj.getKYCUploaded()+" AND office_id IN(" + officeId + ")) AS kyc_updating_count," +
     " (SELECT COUNT(group_id) FROM "+dbTableName.iklantProspectGroup+" pg1 WHERE status_id = "+constantsObj.getKYCCompleted()+" AND office_id IN(" + officeId + ")) AS dv_count," +
     " (SELECT COUNT(group_id) FROM "+dbTableName.iklantProspectGroup+" pg1 WHERE status_id = "+constantsObj.getDataVerificationOperationId()+" AND office_id IN(" + officeId + ")) AS cba_count," +
     " (SELECT COUNT(group_id) FROM "+dbTableName.iklantProspectGroup+" pg1 WHERE status_id = "+constantsObj.getCreditBureauAnalysedStatus()+" AND office_id IN(" + officeId + ")) AS assigned_fo_count," +
     " (SELECT COUNT(group_id) FROM "+dbTableName.iklantProspectGroup+" pg1 WHERE status_id = "+constantsObj.getFieldVerified()+" AND office_id IN(" + officeId + ")) AS appraisal_count," +
     " (SELECT COUNT(group_id) FROM "+dbTableName.iklantProspectGroup+" pg1 WHERE status_id = "+constantsObj.getAppraisedStatus()+" AND office_id IN("+ officeId + ")) AS la_count," +
     " (SELECT COUNT(group_id) FROM "+dbTableName.iklantProspectGroup+" pg1 WHERE status_id = "+constantsObj.getAuthorizedStatus()+" AND office_id IN("+ officeId + ")) AS ls_count" +
     " FROM "+dbTableName.iklantUsers+" u,"+dbTableName.mfiPersonnelRole+" pr" +
     " LEFT JOIN "+dbTableName.iklantProspectGroup+" pg ON pr.personnel_id = pg.created_by" +
     " WHERE u.user_id = pr.personnel_id AND u.office_id IN(" + apexHeadOffice + "," + officeId + ") AND pr.role_id IN ("+constantsObj.getBDEroleId()+","+constantsObj.getFOroleId()+")" +
     " GROUP BY u.user_id ORDER BY pr.role_id,u.office_id)temp";
     customlog.info("retrieveDashBoardQueryDetails : " + retrieveDashBoardQueryDetails);
     connectionDataSource.getConnection(function (clientConnect) {
     clientConnect.query(retrieveDashBoardQueryDetails, function selectCb(err, results, fields) {
     if (err) {
     connectionDataSource.releaseConnectionPool(clientConnect);
     customlog.error(err);
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
     connectionDataSource.releaseConnectionPool(clientConnect);
     callback(dashBoardObject);
     }
     });
     });


    },*/

    /*populateGroupsDataModel: function (tenantId, officeId, userId, statusid, callback) {
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
     customlog.info(retrievePopulateGroupsQuery);
     if (err) {
     customlog.error(err);
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
     customlog.info(retrievePopulateGroupsQuery);
     connectionDataSource.releaseConnectionPool(clientConnect);
     if (err) {
     customlog.error(err);
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
     customlog.error(err);
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
     },*/
    /*populateRejectedGroupsDataModel: function (tenantId, officeId, userId, statusid, callback) {
     var self=this;
     var constantsObj = this.constants;
     var groupNameArray = new Array();
     var centerNameArray = new Array();
     var statusDescArray = new Array();
     var retrievePopulateGroupsQuery = "SELECT pg.group_name,pg.center_name,ps.status_desc FROM "+dbTableName.iklantProspectGroup+" pg " +
     "INNER JOIN "+dbTableName.iklantProspectStatus+" ps ON ps.status_id = pg.status_id " +
     "WHERE pg.office_id =" + officeId + " AND pg.created_by = " + userId + " AND pg.status_id IN " +
     "(" + constantsObj.getRejectedPriliminaryVerification() + ", " +
     "" + constantsObj.getRejectedFieldVerification() + "," + constantsObj.getRejectedAppraisal() + ", " + constantsObj.getRejectedLoanSanction() +", "+
     "" + constantsObj.getRejectedCreditBureauAnalysisStatusId() + ")";
     connectionDataSource.getConnection(function (clientConnect) {
     clientConnect.query(retrievePopulateGroupsQuery, function selectCb(err, results, fields) {
     connectionDataSource.releaseConnectionPool(clientConnect);
     if (err) {
     customlog.error(err);
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
     },*/
    /*//CCA - Jagan
     listQuestionsCCACallDataModel: function (tenantId, clientId,clientLoanCount,callback) {
     var self=this;
     var choicesAnswerRequireObj = require("../domain/choicesanswer");
     var questionsRequireObj = require("../domain/questions");
     var choicesRequireObj = require("../domain/choices");
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

     },*/

    calculateCCAForClientsWhileFieldVerification: function (tenantId, clientId,client,loanCounter,callback) {
        var choicesSelectedAnswerRequire = require("../domain/choicesSelectedAnswer");
        var questionsRequire = require("../domain/questions");
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

    /*reintiateClientDataModel: function (tenantId, clientId, remarksForReintiate, groupStatusID, clientStatus, groupId, roleId, callback) {
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
     customlog.info("reintiateClientQuery in if" + reintiateClientQuery);
     clientConnect.query(reintiateClientQuery, function postCreate(err) {
     if (err) {
     connectionDataSource.releaseConnectionPool(clientConnect);
     customlog.error(err);
     }
     else{
     self.updateRejectedClientStatus(groupId, clientId, clientStatus, roleId, remarksForReintiate, clientConnect, function(){
     callback(reinitiatedStatusDisplay);
     })
     }
     });
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
     customlog.info("reintiateClientQuery in else" + reintiateClientQuery);
     clientConnect.query(reintiateClientQuery, function postCreate(err) {
     if (err) {
     connectionDataSource.releaseConnectionPool(clientConnect);
     customlog.error(err);
     }
     else{
     self.updateRejectedClientStatus(groupId, clientId, clientStatus, roleId, remarksForReintiate, clientConnect, function(){
     connectionDataSource.releaseConnectionPool(clientConnect);
     callback(reinitiatedStatusDisplay);
     })
     }
     });
     }
     }
     else{
     self.updateRejectedClientStatus(groupId, clientId, clientStatus, roleId, remarksForReintiate, clientConnect, function(){
     var reintiateClientQuery = "UPDATE " + dbTableName.iklantProspectClient + " pc " +
     "SET remarks_for_reintiate = '" + remarksForReintiate + "', " +
     "pc.updated_date = NOW() + INTERVAL 5 HOUR + INTERVAL 30 MINUTE WHERE  pc.client_id = " + clientId + "";
     clientConnect.query(reintiateClientQuery, function postCreate(err) {
     connectionDataSource.releaseConnectionPool(clientConnect);
     if (err) {
     customlog.error(err);
     }
     else {
     callback("Client re-initiated & Moved to Regional Manager approval");
     }
     });
     })
     }
     });
     },
     */
    /*updateRejectedClientStatus: function(groupId, clientId, clientStatus, roleId, remarksForReintiate, clientConnect, callback){
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
     clientConnect.query(reinitiateClientQuery, function postCreate(err) {
     if (err) {
     connectionDataSource.releaseConnectionPool(clientConnect);
     customlog.error(err);
     callback();
     }
     else {
     callback();
     }
     });

     },
     */

    /*addQuestionsDataModel: function (tenantId, callback) {
     var questionId = new Array();
     var questionsNonDefault = new Array();
     var self=this;
     var questionsNonDefaultQuery = "SELECT * FROM "+dbTableName.iklantQuestions+" WHERE is_default=1 AND tenant_id=" + tenantId + " ";
     connectionDataSource.getConnection(function (clientConnect) {
     clientConnect.query(questionsNonDefaultQuery, function selectCb(err, results, fields) {
     connectionDataSource.releaseConnectionPool(clientConnect);
     if (err) {
     customlog.error(err);
     } else {
     for (var i in results) {
     questionId[i] = results[i].question_Id;
     questionsNonDefault[i] = results[i].question_Name;
     customlog.info("inside for" + questionId, questionsNonDefault);

     }
     callback(questionId, questionsNonDefault);
     }
     });
     });
     },
     */
    /*questionsSelectDataModel: function (tenantId, selectedQuestionId, callback) {
     var questionsRequire = require("../domain/questions");
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
     customlog.error(err);
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
     },*/


    /*saveQuestionDataModel: function (tenantId, submitId, callback) {
     var choicesRequire = require("../domain/choices");
     var questionsRequire = require("../domain/questions");
     var questionsObj = new questionsRequire();
     var choiceObj = new choicesRequire();
     var self=this;
     customlog.info("submitId DM== " + submitId);
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
     customlog.info("insertQuestionQuery : " + insertQuestionQuery);
     clientConnect.query(insertQuestionQuery, function postCreate(err) {
     if (err) {
     customlog.error(err);
     connectionDataSource.releaseConnectionPool(clientConnect);
     }
     });

     var currentQuestionIdQuery = "SELECT MAX(question_Id) AS current_question FROM "+dbTableName.iklantQuestions+
     " where tenant_id=" + tenantId + " ";
     clientConnect.query(currentQuestionIdQuery, function selectCb(err, results, fields) {
     if (err) {
     connectionDataSource.releaseConnectionPool(clientConnect);
     customlog.error(err);
     }
     else {
     for (var i in results) {
     currentQuestionId = results[i].current_question;
     }
     var choiceArray = new Array();
     var marksArray = new Array();
     choiceArray = choiceObj.getChoice();
     customlog.info(choiceArray);
     marksArray = choiceObj.getMarks();
     for (var i = 0; i < choiceArray.length; i++) {
     var choice_id = i + 1;
     var insertChoicesQuery = "INSERT INTO "+dbTableName.iklantChoices+" (question_id,choice_id,choice_name,choice_marks) " +
     "VALUES(" + currentQuestionId + "," + choice_id + ",'" + choiceArray[i] + "'," + marksArray[i] + " );"
     clientConnect.query(insertChoicesQuery, function postCreate(err) {
     if (err) {
     customlog.error(err);
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
     customlog.error(err);
     connectionDataSource.releaseConnectionPool(clientConnect);
     }
     });
     //query to update answers & marks
     var choiceIdArray = questionsObj.getChoice_ID().split(",");
     var answersArray = questionsObj.getAnswersEdit().split(",");
     var marksArray = questionsObj.getMarksEdit().split(",");

     customlog.info("A= " + answersArray);
     customlog.info("M= " + marksArray);

     for (var i = 0; i < answersArray.length; i++) {
     var updateEditedAnswersQuery = "UPDATE "+dbTableName.iklantChoices+" SET choice_name ='" + answersArray[i] + "', " +
     "choice_marks='" + marksArray[i] + "' " +
     "WHERE question_Id='" + questionsObj.getQuestionIDEdit() + "' " +
     "AND choice_id = " + choiceIdArray[i];

     clientConnect.query(updateEditedAnswersQuery,
     function postCreate(err) {
     if (err) {
     connectionDataSource.releaseConnectionPool(clientConnect);
     customlog.error(err);
     }
     });
     }
     connectionDataSource.releaseConnectionPool(clientConnect);
     callback();
     }
     });
     },*/

    /*calculateSecondaryAppraisalDataModel: function (tenantId, clientId, secondaryQuestionId, selectedAnswerArray, callback) {
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
     customlog.info("secondaryAppraisalQuery : " + secondaryAppraisalQuery);
     clientConnect.query(secondaryAppraisalQuery, function selectCb(err, results, fields) {
     if (err) {
     connectionDataSource.releaseConnectionPool(clientConnect);
     customlog.error(err);
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

     customlog.info("calculateSecondaryAppraisalQuery : " + calculateSecondaryAppraisalQuery);
     clientConnect.query(calculateSecondaryAppraisalQuery, function selectCb(err, results, fields) {
     if (err) {
     connectionDataSource.releaseConnectionPool(clientConnect);
     customlog.error(err);
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
     customlog.info("totalRatingWeightage " + totalRatingWeightage);
     }
     var updateSecondaryAppraisalQuery = "UPDATE "+dbTableName.iklantClientRating+" SET appraisal_rating = " + totalRatingWeightage[0] + ", secondary_rating = " + secondaryRating + ",total_weightage_obtained=" + totalRatingWeightage[1] + ",total_weightage_required=" + totalRatingWeightage[2] + " WHERE client_id= " + clientId + "";
     clientConnect.query(updateSecondaryAppraisalQuery, function selectCb(err, results, fields) {
     connectionDataSource.releaseConnectionPool(clientConnect);
     if (err) {
     customlog.error(err);
     }
     else {
     callback(groupId, secondaryRating, totalRatingWeightage[2]);
     }
     });
     });
     });
     },*/

    saveNewOfficeDatamodel: function (tenantId, userId, officeObj, callback) {
        var docTypeIdArray = new Array();
        var docTypeNameArray = new Array();
        var officeCount;
        var self=this;
        var officeIdQuery = "SELECT COUNT(office_id) as office_count FROM "+dbTableName.iklantOffice;
        connectionDataSource.getConnection(function (clientConnect) {
            clientConnect.query(officeIdQuery, function selectCb(err, results, fields) {
                if (err) {
                    connectionDataSource.releaseConnectionPool(clientConnect);
                    customlog.error(err);
                } else {
                    for (var i in results) {
                        officeCount = results[i].office_count;
                    }
                    var newOfficeQuery = "INSERT INTO "+dbTableName.iklantOffice+" (tenant_id,office_id,office_name,office_address,created_by,created_date) " +
                        "VALUES(" + tenantId + "," + (officeCount + 1) + ",'" + officeObj.getOfficeName() + "','" + officeObj.getOfficeAddress() + "'," + userId + ",NOW() + INTERVAL 5 HOUR + INTERVAL 30 MINUTE)";
                    clientConnect.query(newOfficeQuery, function selectCb(err, fields) {
                        if (err) {
                            customlog.error(err);
                        }
                        connectionDataSource.releaseConnectionPool(clientConnect);
                        callback();
                    });

                }
            });
        });
    },

    /*getClientNamesForRejectedGroups: function (groupId, callback) {
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
     *//*"and pc.status_id "+
     "NOT IN("+constantsObj.getRejectedCreditBureauAnalysisStatusId()+") "+*//*
     "GROUP BY pc.client_id)gp " +
     "LEFT JOIN " +
     "(SELECT COUNT(pc.client_id) AS active_clients ,pc.group_id  FROM "+dbTableName.iklantProspectClient+" pc " +
     "INNER JOIN "+dbTableName.iklantProspectGroup+" pg ON pg.group_id = pc.group_id " +
     "WHERE pc.status_id NOT IN (" + constantsObj.getRejectedPriliminaryVerification() + ", " +
     "" + constantsObj.getRejectedCreditBureauAnalysisStatusId() + ", " +
     "" + constantsObj.getRejectedFieldVerification() + "," + constantsObj.getRejectedAppraisal() + ") " +
     "GROUP BY pc.group_id) ac ON " +
     "ac.group_id = gp.group_id";

     customlog.info("retrieveClientListForRejectedGroups : " + retrieveClientListForRejectedGroups);
     connectionDataSource.getConnection(function (clientConnect) {
     clientConnect.query(retrieveClientListForRejectedGroups,
     function selectCb(err, results, fields) {
     connectionDataSource.releaseConnectionPool(clientConnect);
     if (err) {
     customlog.error(err);
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
     },*/

    /*getClientNamesForLoanSanction: function (groupId, mifosCustomerId, callback) {
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
     *//*var retrieveClientListQuery = "SELECT pg.group_name,pc.client_id,pc.client_name FROM "+dbTableName.iklantProspectClient+" pc " +
     "INNER JOIN "+dbTableName.iklantProspectGroup+" pg ON pg.group_id = pc.group_id  " +
     "WHERE pc.group_id = " + groupId + " AND " +
     "pc.status_id = " + constantsObj.getAuthorizedStatus() + " " +
     "GROUP BY pc.client_id";*//*
     var retrieveClientListQuery = "SELECT pg.group_name,ipc.client_id,ipc.client_name,ipc.client_global_number " +
     " FROM iklant_prospect_client ipc "+
     "INNER JOIN iklant_mifos_mapping imm ON imm.client_id = ipc.client_id "+
     "INNER JOIN iklant_prospect_group pg ON pg.group_id = ipc.group_id "+
     "INNER JOIN account acc ON acc.customer_id = imm.mifos_client_customer_id "+
     "INNER JOIN loan_account la ON la.account_id = acc.account_id "+
     "WHERE la.parent_account_id = (SELECT MAX(account_id) FROM account WHERE customer_id = "+mifosCustomerId+" GROUP BY customer_id) " +
     "AND ipc.status_id = " + constantsObj.getAuthorizedStatus()+" GROUP BY ipc.client_id";
     customlog.info("retrieveClientListQuery : " + retrieveClientListQuery);
     connectionDataSource.getConnection(function (clientConnect) {
     clientConnect.query(retrieveClientListQuery, function selectCb(err, results, fields) {
     if (err) {
     connectionDataSource.releaseConnectionPool(clientConnect);
     customlog.error(err);
     } else {
     var subLeaderQuery = " SELECT sub_leader_global_number,client_name FROM iklant_prospect_client pc WHERE group_id = "+groupId+" AND sub_leader_global_number IS NOT NULL  AND pc.status_id NOT IN ("+constantsObj.getRejectedPriliminaryVerification()+","+constantsObj.getRejectedAppraisal()+","+constantsObj.getRejectedFieldVerification()+","+constantsObj.getRejectedLoanSanction()+","+constantsObj.getRejectedCreditBureauAnalysisStatusId()+","+
     constantsObj.getRejectedInNextLoanPreCheck()+","+constantsObj.getRejectedWhileIdleGroupsStatusId()+")";
     clientConnect.query(subLeaderQuery, function selectCb(error, leaderResults, fields) {
     if(error){
     connectionDataSource.releaseConnectionPool(clientConnect);
     customlog.error(err);
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
     customlog.info("retrieveProductCategoryQuery" + retrieveProductCategoryQuery);
     clientConnect.query(retrieveProductCategoryQuery,
     function selectCb(err, results, fields) {
     if (err) {
     connectionDataSource.releaseConnectionPool(clientConnect);
     customlog.error(err);
     } else {
     for (var i in results) {
     var fieldName = results[i];
     productCategoryId[i] = fieldName.prd_offering_id;
     ProductCategoryType[i] = fieldName.prd_offering_name;
     }
     }
     customlog.info("productCategoryId[i]" + productCategoryId);
     customlog.info("ProductCategoryType[i]" + ProductCategoryType);
     var disbAmount, interestRateValue, recurrenceType;
     var disbQuery = "SELECT `disbursement_date`,a.global_account_num,la.loan_amount,la.interest_rate,rt.recurrence_name FROM `loan_account` la " +
     "INNER JOIN account a ON la.account_id = a.account_id INNER JOIN recurrence_detail rd ON rd.meeting_id = la.meeting_id " +
     "INNER JOIN recurrence_type rt ON rt.recurrence_id = rd.recurrence_id WHERE  a.customer_id = " + mifosCustomerId + " AND account_type_id = 1 AND a.account_state_id IN (5,9) order by a.account_id desc";
     clientConnect.query(disbQuery,
     function selectCb(err, results, fields) {
     connectionDataSource.releaseConnectionPool(clientConnect);
     if (err) {
     customlog.error(err);
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
     },*/

    getFieldVerificationDetails: function (clientId, callback) {
        var self=this;
        var clientPersonalObj = require("../domain/prospectClientPersonal");
        var clientGuarantorObj = require("../domain/prospectClientGuarantor");
        var clientHouseDetailObj = require("../domain/prospectClientHouseDetail");
        var clientBankDetailObj = require("../domain/prospectClientBankDetail");
        var VerificationObj = require("../domain/fieldVerification");
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
                    clientConnect.query(retrieveClientListQuery,
                        function selectCb(err, results, fields) {
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
                        }
                    );
                }
            });
        });
    },

    /*groupDetails: function (tenant_id, office_id, callback) {
     var groupIdArray = new Array();
     var groupNameArray = new Array();
     var self=this;
     var constantsObj = this.constants;
     var query = "SELECT group_id,group_name FROM "+dbTableName.iklantProspectGroup+" WHERE status_id " +
     "IN(" + constantsObj.getNewGroup() + "," + constantsObj.getPreliminaryVerified() + ", " +
     "" + constantsObj.getKYCUploaded() + "," + constantsObj.getAssignedFO() + ") and " +
     "tenant_id=" + tenant_id + " AND office_id=" + office_id + "";
     customlog.info("Sync Group Query : " + query);
     connectionDataSource.getConnection(function (clientConnect) {
     clientConnect.query(query,
     function selectCb(err, results, fields) {
     connectionDataSource.releaseConnectionPool(clientConnect);
     if (err) {
     customlog.error(err);
     } else {
     for (var i in results) {
     var fieldName = results[i];
     groupIdArray[i] = fieldName.group_id;
     groupNameArray[i] = fieldName.group_name;
     }
     }
     customlog.info(groupNameArray);
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
     customlog.error(err);
     } else {
     for (var i in results) {
     doc_id[i] = results[i].doc_id;
     doc_type[i] = results[i].doc_name;
     }
     }
     customlog.info(doc_type);
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
     customlog.info("Sync Clients Query : " + query);
     connectionDataSource.getConnection(function (clientConnect) {
     clientConnect.query(query,
     function selectCb(err, results, fields) {
     connectionDataSource.releaseConnectionPool(clientConnect);
     if (err) {
     customlog.error(err);
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
     },*/

    /*availableDocumentDetailsDatamodel: function (tenant_id, office_id, callback) {
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
     customlog.info("Sync available Document details Query : " + query);
     connectionDataSource.getConnection(function (clientConnect) {
     clientConnect.query(query,
     function selectCb(err, results, fields) {
     connectionDataSource.releaseConnectionPool(clientConnect);
     if (err) {
     customlog.error(err);
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

    },*/

    //function to retrieve iklant to android service details for BDE and FO
    iklanToAndroidDetailsDatamodel: function (tenant_id, office_id, user_id, role_id, callback) {
        var self = this;
        var constantsObj = this.constants;
        this.androidDataModel.retrieveOperationIdForRoleID(role_id, tenant_id, function (operationIdForRoleIdArray) {
            this.androidDataModel.iklanToAndroidGroupDetailsDatamodel(tenant_id, office_id, user_id, operationIdForRoleIdArray, function (prospectGroupForAndroidObj) {
                this.commonDataModel.createGroup(tenant_id, office_id, function (groupNames, nextGroupName, areaCodes, areaNames) {
                    prospectGroupForAndroidObj.setNextGroupName(nextGroupName);
                    prospectGroupForAndroidObj.setAreaCodes(areaCodes);
                    prospectGroupForAndroidObj.setAreaNames(areaNames);
                    this.commonDataModel.retrieveLoanTypelistDataModel(tenant_id, function (loanTypeIdArray, loanTypeArray) {
                        if (prospectGroupForAndroidObj.getGroup_id().length != 0) {
                            this.androidDataModel.iklanToAndroidClientDetailsDatamodel(prospectGroupForAndroidObj, function (prospectClientForAndroidObj) {
                                self.retrieveAllDocTypeListDataModel(tenant_id, function (allDocTypeForAndroidObj) { //retrieves all docType
                                    //if(operationIdForRoleIdArray.indexOf(constantsObj.getFieldVerificationOperationId()) > -1){
                                    if (prospectClientForAndroidObj.getStatus_id().indexOf(constantsObj.getAssignedFO()) > -1) {
                                        //for FO
                                        this.androidDataModel.iklanToAndroidFieldVerificationDetailsDatamodel(prospectClientForAndroidObj,
                                            function (prospectFieldVerificationForAndroidObj) {
                                                this.androidDataModel.iklanToAndroidLookUpDetailsDatamodel(function (lookUpEntityForAndroidObj, lookUpValueForAndroidObj) {
                                                    callback(operationIdForRoleIdArray, prospectGroupForAndroidObj,
                                                        loanTypeIdArray, loanTypeArray, prospectClientForAndroidObj,
                                                        allDocTypeForAndroidObj, prospectFieldVerificationForAndroidObj,
                                                        lookUpEntityForAndroidObj, lookUpValueForAndroidObj);
                                                });
                                            });
                                        //}
                                    } else {
                                        callback(operationIdForRoleIdArray, prospectGroupForAndroidObj, loanTypeIdArray, loanTypeArray,
                                            prospectClientForAndroidObj, allDocTypeForAndroidObj);
                                    }
                                });
                            });
                        } else {
                            callback(operationIdForRoleIdArray, prospectGroupForAndroidObj, loanTypeIdArray, loanTypeArray);
                        }
                    });
                });
            });
        });
    },

    //generic function to retrieve all DocType
    retrieveAllDocTypeListDataModel: function (tenant_id, callback) {
        //Retrieve All Document Type
        var self=this;
        var constantsObj = this.constants;
        var allDocTypeIdArray = new Array();
        var allDocTypeEntityIdArray = new Array();
        var allDocTypeNameArray = new Array();

        var allDocTypeForAndroidRequire = require(path.join(applicationHome,"/app_modules/dto/android/docTypeForAndroid"));
        var allDocTypeForAndroidObj = new allDocTypeForAndroidRequire();
        var allDocTypequery = "SELECT doc_id,doc_entity_id,doc_name FROM "+dbTableName.iklantDocType+" where " + "tenant_id=" + tenant_id + " and doc_id NOT IN (13,14)";
        connectionDataSource.getConnection(function (clientConnect) {
            clientConnect.query(allDocTypequery,
                function selectCb(err, results, fields) {
                    connectionDataSource.releaseConnectionPool(clientConnect);
                    if (err) {
                        customlog.error(err);
                    } else {
                        for (var i in results) {
                            var fieldName = results[i];
                            allDocTypeIdArray[i] = fieldName.doc_id;
                            allDocTypeEntityIdArray[i] = fieldName.doc_entity_id;
                            allDocTypeNameArray[i] = fieldName.doc_name;
                        }
                        allDocTypeForAndroidObj.setDocId(allDocTypeIdArray);
                        allDocTypeForAndroidObj.setDocEntityId(allDocTypeEntityIdArray);
                        allDocTypeForAndroidObj.setDocName(allDocTypeNameArray);
                    }
                    callback(allDocTypeForAndroidObj);
                });
        });
    },

    //temporary function for apex camera recept capture. to be removed once LR android app is ready.
    insertdocumentDetails: function (captured_image, client_id, doc_type_id, doc_name, group_id, callback) {
        var self = this;
        var constantsObj = this.constants;
        var clientDocCount = 0;
        var noOfClients = 0;
        var flag = 0;
        var exe = false;
        connectionDataSource.getConnection(function (clientConnect) {
            if (doc_type_id == this.constants.getReceiptDocId()) {
                //client.query("USE " + mifosDB);
                var searchPaymentCollectionId = "SELECT payment_collection_id FROM payment_collection_image WHERE payment_collection_id=" + client_id;
                clientConnect.query(searchPaymentCollectionId,
                    function selectCb(err, results, fields) {
                        if (err) {
                            connectionDataSource.releaseConnectionPool(clientConnect);
                            customlog.error(err);
                        } else {
                            var insertOrUpdateClientDocQuery = "";
                            if (results.length >= 1) {
                                var insertOrUpdateClientDocQuery = "UPDATE payment_collection_image SET Captured_image ='" + captured_image + "',doc_name = '" + doc_name + "' WHERE payment_collection_id= " + client_id;
                                customlog.info("For Mifos Doc" + insertOrUpdateClientDocQuery);
                            }
                            else {
                                var insertOrUpdateClientDocQuery = "INSERT INTO payment_collection_image(payment_collection_id,Captured_image,doc_id,doc_name) " +
                                    "VALUES(" + client_id + ",'" + captured_image + "'," + doc_type_id + ",'" + doc_name + "')";
                                customlog.info("For Mifos Doc" + insertOrUpdateClientDocQuery);
                            }
                            //client.query("USE " + mifosDB);
                            clientConnect.query(insertOrUpdateClientDocQuery,
                                function postCreate(err) {
                                    if (!err) {
                                        clientConnect.query("USE " + ciDB);
                                    } else {
                                        connectionDataSource.releaseConnectionPool(clientConnect);
                                        customlog.error(err);
                                    }
                                }
                            );
                        }
                    }
                );
                clientConnect.query("USE " + ciDB);
                exe = true;
            }
            else {
                clientConnect.query("USE " + ciDB);
                var insertClientDocQuery = "INSERT INTO "+dbTableName.iklantClientDoc+" (Captured_image,client_id,doc_type_id,doc_name) " +
                    "VALUES('" + captured_image + "'," + client_id + "," + doc_type_id + ",'" + doc_name + "')";
                customlog.info(insertClientDocQuery);
                clientConnect.query(insertClientDocQuery,
                    function postCreate(err) {
                        if (err) {
                            customlog.error(err);
                            connectionDataSource.releaseConnectionPool(clientConnect);
                        }
                    }
                );
                exe = true;
            }
            if (exe == true) {
                clientConnect.query("USE " + ciDB);
                var clientDoc_query = "SELECT * FROM(SELECT COUNT(DISTINCT cd.client_id)AS client_doc_count " +
                    "FROM "+dbTableName.iklantClientDoc+" cd INNER JOIN "+dbTableName.iklantProspectClient+" pc ON  pc.client_id=cd.client_id " +
                    "WHERE cd.doc_type_id=" + constantsObj.getApplicationFormDocId() + " AND " +
                    "pc.group_id=" + group_id + ")aa JOIN(SELECT COUNT(client_id) AS no_of_clients " +
                    "FROM "+dbTableName.iklantProspectClient+" WHERE group_id=" + group_id + " AND is_overdue=" + constantsObj.getActiveIndicatorFalse() + ")bb";
                customlog.info("clientDoc_query" + clientDoc_query);
                clientConnect.query(clientDoc_query,
                    function selectCb(err, results, fields) {
                        if (err) {
                            connectionDataSource.releaseConnectionPool(clientConnect);
                            customlog.error(err);
                        } else {
                            for (var i in results) {
                                var fieldName = results[i];
                                clientDocCount = fieldName.client_doc_count;
                                noOfClients = fieldName.no_of_clients;
                            }

                            if ((clientDocCount == noOfClients) && (noOfClients != 0)) {
                                var groupUpdateQuery = "UPDATE "+dbTableName.iklantProspectGroup+" pg, "+dbTableName.iklantProspectClient+" pc SET " +
                                    "pg.status_id=" + constantsObj.getKYCUploaded() + ", " +
                                    "pc.status_id=if(pc.is_overdue=" + constantsObj.getActiveIndicatorFalse() + ", " +
                                    "" + constantsObj.getKYCUploaded() + ",pc.status_id), " +
                                    "pg.updated_date=NOW() + INTERVAL 5 HOUR + INTERVAL 30 MINUTE,pc.updated_date=NOW() + INTERVAL 5 HOUR + INTERVAL 30 MINUTE WHERE pg.group_id = " + group_id + " " +
                                    "AND pc.group_id = " + group_id + " ";
                                clientConnect.query(groupUpdateQuery, function postCreate(err) {
                                        if (!err) {
                                            flag = 1;
                                        } else {
                                            connectionDataSource.releaseConnectionPool(clientConnect);
                                            customlog.error(err);
                                        }
                                    }
                                );
                            }
                            if ((clientDocCount == noOfClients) && (noOfClients != 0)) {
                                flag = 1;
                                customlog.info("flag==" + flag);
                                connectionDataSource.releaseConnectionPool(clientConnect);
                                callback(flag);
                            }
                            else {
                                flag = 0;
                                customlog.info("flag==" + flag);
                                connectionDataSource.releaseConnectionPool(clientConnect);
                                callback(flag);
                            }

                        }
                    });
            } else {
                connectionDataSource.releaseConnectionPool(clientConnect);
            }
        });
    },

    saveRegisterUser: function (tenantName, tenantAddress, callback) {
        var self=this;
        var query = "INSERT INTO "+dbTableName.iklantTenant+" (tenant_name, tenant_address) VALUES('" + tenantName + "','" + tenantAddress + "')";
        customlog.info(query);
        connectionDataSource.getConnection(function (clientConnect) {
            clientConnect.query(query,
                function selectCb(err, results, fields) {
                    connectionDataSource.releaseConnectionPool(clientConnect);
                    if (err) {
                        customlog.error(err);
                    }
                    callback();
                });
        });
    },

    // changed by chitra .. this browser based GC creation
    /*saveGroup: function (userId,officeId,areaCodeId,prosGroup,callback) {
     var self=this;
     var prosClient = require("../domain/prospectClient");
     var constantsObj = this.constants;
     var group_id_for_client = 0;
     var prosGroup = prosGroup;
     var prosClient = new prosClient();
     var overdue = 0;
     var new_group_global_number;
     *//*var query1 = "select grp.*,grp_id.* " +
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
     "GROUP by grp_id.created_by ";*//*
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
     clientConnect.query(query1,
     function selectCb(err, results, fields) {
     var group_id = 0;
     var group_global_number = 0;
     var temp_count;
     var office_id;
     var officeIdName;
     if (err) {
     connectionDataSource.releaseConnectionPool(clientConnect);
     customlog.error(err);
     } else {
     *//*for (var i in results) {
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
     } *//*
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
     customlog.info("new_group_global_number : " + new_group_global_number);
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
     clientConnect.query(query2,
     function postCreate(err) {
     if (err) {
     connectionDataSource.releaseConnectionPool(clientConnect);
     customlog.error(err);
     }else{
     if (prosGroup.getWeekradio() == 1) {
     var insertMeetingQuery = "INSERT INTO "+dbTableName.iklantMeeting+" (meeting_type_id, meeting_place, start_date, meeting_time) " +
     "VALUES(4, '" + prosGroup.getWeeklocation() + "','" + prosGroup.getGroup_created_date() + "', '" + prosGroup.getMeetingTime() + "') ";
     clientConnect.query(insertMeetingQuery,
     function postCreate(err) {
     if (err) {
     customlog.error(err);
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
     customlog.error(err);
     connectionDataSource.releaseConnectionPool(clientConnect);
     }
     });
     }
     var retrieveMeetingIdQuery = "SELECT MAX(meeting_id) AS meeting_id FROM "+dbTableName.iklantMeeting;
     var meeting_id;
     clientConnect.query(retrieveMeetingIdQuery,function selectCb(err, results, fields) {
     if (err) {
     connectionDataSource.releaseConnectionPool(clientConnect);
     customlog.error(err);
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
     customlog.error(err);
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
     customlog.error(err);
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
     customlog.error(err);
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
     customlog.error(err);
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
     customlog.error(err);
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
     customlog.error(err);
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
     customlog.error(err);
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
     */

    /*showPreliminaryVerification: function (groupId, callback) {
     var prospectGroup = require("../domain/prospectGroup");
     var prosClient = require("../domain/prospectClient");
     var officeRequire = require("../domain/office");
     var  self=this;
     var constantsObj = this.constants;
     var prosGroup = new prospectGroup();
     var prosClient = new prosClient();
     var office = new officeRequire();
     var clientId = new Array();
     var memberName = new Array();
     var docTypeIdArray = new Array();
     var docTypeNameArray = new Array();

     office.clearAll();
     //var groupDetailsQuery="SELECT grp_det.group_id,grp_det.group_name,grp_det.center_name,grp_det.group_created_date,grp_det.office_id,o.office_name FROM "+dbTableName.iklantProspectGroup+" grp_det INNER JOIN office o ON grp_det.office_id=o.office_id WHERE group_id="+groupId;
     //retrieved loanType in addition
     var groupDetailsQuery = "SELECT lt.*,grp_det.group_id,grp_det.group_name,grp_det.center_name,grp_det.group_created_date, " +
     "grp_det.office_id,o.office_name FROM "+dbTableName.iklantProspectGroup+" grp_det INNER JOIN "+dbTableName.iklantOffice+" o ON grp_det.office_id=o.office_id " +
     "LEFT JOIN "+dbTableName.iklantLoanType+" lt ON lt.loan_type_id = grp_det.loan_type_id WHERE group_id=" + groupId + "";
     connectionDataSource.getConnection(function (clientConnect) {
     clientConnect.query(groupDetailsQuery,
     function selectCb(err, results, fields) {
     if (err) {
     connectionDataSource.releaseConnectionPool(clientConnect);
     customlog.error(err);
     } else {
     for (var i in results) {
     var fieldName = results[i];
     prosGroup.setGroup_id(fieldName.group_id);
     prosGroup.setGroup_name(fieldName.group_name);
     prosGroup.setCenter_name(fieldName.center_name);
     prosGroup.setGroup_created_date(formatDateForUI(fieldName.group_created_date));
     prosGroup.setLoan_type(fieldName.loan_type);
     office.setOfficeName(fieldName.office_name);
     }
     }
     });


     var query2 = "SELECT doc_id,doc_name FROM "+dbTableName.iklantDocType+" where doc_entity_id=" + constantsObj.getGroupDocsEntity() + "";
     clientConnect.query(query2,
     function selectCb(err, results, fields) {
     if (err) {
     customlog.error(err);
     } else {
     for (var i in results) {
     var fieldName = results[i];
     docTypeIdArray[i] = fieldName.doc_id;
     docTypeNameArray[i] = fieldName.doc_name;
     }
     }
     customlog.info("docTypeIdArray : " + docTypeIdArray);
     connectionDataSource.releaseConnectionPool(clientConnect);
     callback(prosGroup, office, prosClient, docTypeIdArray, docTypeNameArray);
     }
     );


     *//*var groupMembersDetailsQuery="SELECT client_id,client_name FROM "+dbTableName.iklantProspectClient+" WHERE group_id="+groupId;
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
     });*//*
     });
     },*/

    /*showPreliminaryVerificationUpload: function (groupId, callback) {
     var self = this;
     var constantsObj = this.constants;
     var docTypeIdArray = new Array();
     var docTypeNameArray = new Array();
     var query2 = "SELECT doc_id,doc_name FROM "+dbTableName.iklantDocType+" where doc_entity_id=" + constantsObj.getGroupDocsEntity() + "";
     connectionDataSource.getConnection(function (clientConnect) {
     clientConnect.query(query2,
     function selectCb(err, results, fields) {
     connectionDataSource.releaseConnectionPool(clientConnect);
     if (err) {
     customlog.error(err);
     } else {
     for (var i in results) {
     var fieldName = results[i];
     docTypeIdArray[i] = fieldName.doc_id;
     docTypeNameArray[i] = fieldName.doc_name;
     }
     }
     customlog.info("docTypeIdArray : " + docTypeIdArray);
     callback(docTypeIdArray, docTypeNameArray);
     }
     );
     }
     );

     },*/
    /*storePreliminaryVerificationCapturedImage: function (groupId, doc_type_id, image, fileName, callback) {
     var self=this;
     var fileLoacation = "documents/group_documents/" + fileName + ".png"
     var query = "INSERT INTO "+dbTableName.iklantGroupDoc+"(image_location,group_id,doc_type_id,doc_name)VALUES('" + fileLoacation + "'," + groupId + "," + doc_type_id + ",'" + fileName + "')";

     var fs = require('fs');
     fs.writeFile(fileLoacation, new Buffer(image.replace(/^data:image\/png;base64,/, ""), "base64"), function (err) {
     });
     //"/tmp/test.png", base, "binary",
     //fs.writeFile("test.png", new Buffer(image, "base64").toString('base64'), "binary", function(err) {
     *//*fs.writeFile("test.png", image, "binary", function(err) {
     if(err) {
     customlog.error(err);
     } else {
     customlog.info("The file was saved!");
     }
     }); *//*


     *//*var bitmap = new Buffer(image, 'base64');
     // write buffer to file
     fs.writeFileSync("test1111.png", bitmap);*//*
     customlog.info(query);
     connectionDataSource.getConnection(function (clientConnect) {
     clientConnect.query(query,
     function selectCb(err, results, fields) {
     connectionDataSource.releaseConnectionPool(clientConnect);
     if (err) {
     customlog.error(err);
     } else {
     customlog.info("Image Location Inserted..");
     callback(groupId);
     }
     });
     *//*var getGroupIdQuery = "SELECT group_id FROM "+dbTableName.iklantProspectClient+" WHERE client_id = "+client_id+" ";
     customlog.info("getGroupIdQuery:====>"+getGroupIdQuery);
     client.query(getGroupIdQuery,function selectCb(err, results, fields) {
     if (err) {
     customlog.error(err);
     }else{
     for(var i in results) {
     groupId=results[i].group_id;
     }
     customlog.info("groupId : "+groupId);
     callback(groupId);
     }

     });*//*
     });
     },
     */
    /*preVerificationDocumentUpload: function (groupId, fileName, docTypeId, callback) {
     var self=this;
     if (fileName != "") {
     for (var i = 0; i < fileName.length; i++) {
     var fileLoacation = "documents/group_documents/" + fileName[i];
     var query = "INSERT INTO "+dbTableName.iklantGroupDoc+"(image_location,group_id,doc_type_id,doc_name)VALUES('" + fileLoacation + "'," + groupId + "," + docTypeId + ",'" + fileName[i] + "')";
     connectionDataSource.getConnection(function (clientConnect) {
     clientConnect.query(query,
     function selectCb(err, results, fields) {
     connectionDataSource.releaseConnectionPool(clientConnect);
     if (err) {
     customlog.error(err);
     } else {
     customlog.info("Image Location Inserted..!");
     if (fileName.length - 1 == i)
     callback();
     }
     });
     });
     }
     }

     },*/



    /*KYC_Uploading: function (group_id, callback) {
     //var result="false";
     var self=this;
     var constantsObj = this.constants;
     var docTypeIdArray = new Array();
     var docTypeNameArray = new Array();
     var memberIdArray = new Array();
     var memberNameArray = new Array();

     var query1 = "SELECT client_id,client_name FROM "+dbTableName.iklantProspectClient+" WHERE " +
     "group_id=" + group_id + " and is_overdue = 0";
     connectionDataSource.getConnection(function (clientConnect) {
     clientConnect.query(query1,
     function selectCb(err, results, fields) {
     if (err) {
     connectionDataSource.releaseConnectionPool(clientConnect);
     customlog.error(err);
     } else {
     for (var i in results) {
     var fieldName = results[i];
     memberIdArray[i] = fieldName.client_id;
     memberNameArray[i] = fieldName.client_name;
     }
     }
     customlog.info("memberNameArray : " + memberNameArray);
     }
     );
     var query2 = "SELECT doc_id,doc_name FROM "+dbTableName.iklantDocType+" where " +
     "doc_entity_id=" + constantsObj.getClientDocsEntity() + "";
     clientConnect.query(query2,
     function selectCb(err, results, fields) {
     if (err) {
     connectionDataSource.releaseConnectionPool(clientConnect);
     customlog.error(err);
     } else {
     for (var i in results) {
     var fieldName = results[i];
     docTypeIdArray[i] = fieldName.doc_id;
     docTypeNameArray[i] = fieldName.doc_name;
     }
     connectionDataSource.releaseConnectionPool(clientConnect);
     }
     customlog.info("docTypeIdArray : " + docTypeIdArray);
     callback(group_id, docTypeIdArray, docTypeNameArray, memberIdArray, memberNameArray);
     }
     );
     }
     );

     },*/

    /*KYC_UploadingImage: function (client_id, doc_type_id, fileName, callback) {
     //customlog.info("Before captured image insert");
     var self=this;
     var groupId;
     for (var i = 0; i < fileName.length; i++) {
     customlog.info(fileName[i]);
     var fileLoacation = "documents/client_documents/" + fileName[i];
     var query = "INSERT INTO "+dbTableName.iklantClientDoc+"(Captured_image,client_id,doc_type_id,doc_name)VALUES('" + fileLoacation + "'," + client_id + "," + doc_type_id + ",'" + fileName[i] + "')";
     connectionDataSource.getConnection(function (clientConnect) {
     clientConnect.query(query,
     function selectCb(err, results, fields) {
     connectionDataSource.releaseConnectionPool(clientConnect);
     if (err) {
     customlog.error(err);
     } else {
     customlog.info("Image Inserted..!");
     if (fileName.length - 1 == i)
     callback();
     }
     });
     });
     }
     },*/

    /*storeCapturedImage: function (client_id, doc_type_id, image, fileName, callback) {
     customlog.info("Before captured image insert");
     var self=this;
     var groupId;
     var fileLoacation = "documents/client_documents/" + fileName + ".png"
     var query = "INSERT INTO "+dbTableName.iklantClientDoc+"(Captured_image,client_id,doc_type_id,doc_name)VALUES('" + fileLoacation + "'," + client_id + "," + doc_type_id + ",'" + fileName + "')";

     var fs = require('fs');
     fs.writeFile(fileLoacation, new Buffer(image.replace(/^data:image\/png;base64,/, ""), "base64"), function (err) {
     });
     //"/tmp/test.png", base, "binary",
     //fs.writeFile("test.png", new Buffer(image, "base64").toString('base64'), "binary", function(err) {
     *//*fs.writeFile("test.png", image, "binary", function(err) {
     if(err) {
     customlog.error(err);
     } else {
     customlog.info("The file was saved!");
     }
     }); *//*


     *//*var bitmap = new Buffer(image, 'base64');
     // write buffer to file
     fs.writeFileSync("test1111.png", bitmap);*//*

     connectionDataSource.getConnection(function (clientConnect) {
     clientConnect.query(query,
     function selectCb(err, results, fields) {
     if (err) {
     connectionDataSource.releaseConnectionPool(clientConnect);
     customlog.error(err);
     }
     });
     var getGroupIdQuery = "SELECT group_id FROM "+dbTableName.iklantProspectClient+" WHERE client_id = " + client_id + " ";
     customlog.info("getGroupIdQuery:====>" + getGroupIdQuery);
     clientConnect.query(getGroupIdQuery, function selectCb(err, results, fields) {
     if (err) {
     connectionDataSource.releaseConnectionPool(clientConnect);
     customlog.error(err);
     } else {
     for (var i in results) {
     groupId = results[i].group_id;
     }
     customlog.info("groupId : " + groupId);
     connectionDataSource.releaseConnectionPool(clientConnect);
     callback(groupId);
     }

     });
     });
     },*/


    /*//Sindhu
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
     customlog.error(err);
     } else {
     for (var i in results) {
     var fieldName = results[i];
     clientDocCount = fieldName.client_doc_count;
     noOfClients = fieldName.no_of_clients;
     }
     }
     customlog.info("clientDocCount : " + clientDocCount);
     customlog.info("noOfClients : " + noOfClients);
     if (clientDocCount == noOfClients) {
     errorMsg = "";
     var groupInsertQuery = "UPDATE "+dbTableName.iklantProspectGroup+" pg, "+dbTableName.iklantProspectClient+" pc " +
     "SET pg.status_id=" + constantsObj.getKYCUploaded() + ", " +
     "pc.status_id=if(pc.is_overdue=0," + constantsObj.getKYCUploaded() + ",pc.status_id), " +
     "pg.updated_date=NOW() + INTERVAL 5 HOUR + INTERVAL 30 MINUTE,pc.updated_date=NOW() + INTERVAL 5 HOUR + INTERVAL 30 MINUTE WHERE pg.group_id = " + groupId + " AND pc.group_id = " + groupId + " ";
     customlog.info("groupInsertQuery : " + groupInsertQuery);
     clientConnect.query(groupInsertQuery, function postCreate(err) {
     if (err) {
     connectionDataSource.releaseConnectionPool(clientConnect);
     customlog.error(err);
     }
     });
     }
     connectionDataSource.releaseConnectionPool(clientConnect);
     customlog.error("errorMsg : " + errorMsg);
     callback(errorMsg);
     });
     });
     },*/

    /*skipKycUploadDatamodel: function (groupId, callback) {
     var self=this;
     var constantsObj = this.constants;
     var groupInsertQuery = "UPDATE "+dbTableName.iklantProspectGroup+" pg, "+dbTableName.iklantProspectClient+" pc " +
     "SET pg.status_id=" + constantsObj.getKYCUploaded() + ", " +
     "pc.status_id=if(pc.is_overdue=0," + constantsObj.getKYCUploaded() + ",pc.status_id), " +
     "pg.updated_date=NOW() + INTERVAL 5 HOUR + INTERVAL 30 MINUTE,pc.updated_date=NOW() + INTERVAL 5 HOUR + INTERVAL 30 MINUTE WHERE " +
     "pg.group_id = " + groupId + " AND pc.group_id = " + groupId + " ";
     customlog.info("groupInsertQuery : " + groupInsertQuery);
     connectionDataSource.getConnection(function (clientConnect) {
     clientConnect.query(groupInsertQuery, function postCreate(err) {
     connectionDataSource.releaseConnectionPool(clientConnect);
     if (err) {
     customlog.error(err);
     }
     callback();
     });
     });
     },*/

    /*saveAssignFO: function (foName, assignGroupIds, callback) {
     var self = this;
     var constantsObj = this.constants;
     var assignFOQuery = "UPDATE "+dbTableName.iklantProspectGroup+" pg, "+dbTableName.iklantProspectClient+" pc SET " +
     "pg.assigned_to='" + foName + "',pg.status_id=" + constantsObj.getAssignedFO() + ", " +
     "pc.status_id=if(pc.is_overdue=0 && pc.status_id=" + constantsObj.getCreditBureauAnalysedStatus() + ", " +
     "" + constantsObj.getAssignedFO() + ",pc.status_id), " +
     "pg.updated_date=NOW() + INTERVAL 5 HOUR + INTERVAL 30 MINUTE,pc.updated_date=NOW() + INTERVAL 5 HOUR + INTERVAL 30 MINUTE WHERE " +
     "pg.group_id IN (" + assignGroupIds + ") AND pc.group_id IN (" + assignGroupIds + ") ";
     connectionDataSource.getConnection(function (clientConnect) {
     clientConnect.query(assignFOQuery, function postCreate(err) {
     connectionDataSource.releaseConnectionPool(clientConnect);
     if (err) {
     customlog.error(err);
     callback('failure');
     }
     else{
     callback('success');
     }
     });
     });
     },*/

    calculateAppraisalPercentageCall: function (questionsObj, choicesSelectedAnswerObj, clientListArray) {
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
            customlog.info(returnedArray[i][1] + "+++++++++++++++" + returnedArray[i][0][0] + "====" + returnedArray[i][0][1]);
        }
        self.commonDataModel.saveAppraisalDatamodel(clientListArray, questionsObj, clientAppraisalArray, clientTotalWeightageArray, answerIdArray, function () {
        });
    },

    cca1: function (tenantId, groupId, callback) {
        var appClient = require("../domain/appraisedClients");
        var constantsObj = this.constants;
        var self = this;
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
        var countOfRejectedClients;
        var appraisedClientsObj = new appClient();
        customlog.info("Inside Data Access Layer cca; groupId : " + groupId);

        //Appraisal Rating
        var query = "SELECT cca_rating.*,rejected_clients.* FROM ( " +
            "SELECT cr.client_id, pc.group_id,pc.client_name,pc.loan_count, pg.group_name,pg.center_name, " +
            "cr.appraisal_rating,cr.total_weightage_obtained,cr.total_weightage_required " +
            "FROM "+dbTableName.iklantClientRating+" cr " +
            "INNER JOIN "+dbTableName.iklantProspectClient+" pc ON pc.client_id = cr.client_id " +
            "INNER JOIN "+dbTableName.iklantProspectGroup+" pg ON pg.group_id = pc.group_id " +
            "WHERE pc.group_id=" + groupId + " " +
            "AND pc.status_id IN(" + constantsObj.getFieldVerified() + ", " +
            "" + constantsObj.getGroupRecognitionTested() + "))cca_rating " +
            "LEFT JOIN( " +
            "SELECT count_rej.groupid, " +
            "CASE " +
            "WHEN count_rej.rejected_in_fv > 0 THEN 1 " +
            "WHEN count_rej.rejected_in_fv <= 0 THEN 0 " +
            "ELSE 0 " +
            "END AS rejected_clients_count " +
            "FROM " +
            "(SELECT COUNT(client_id) AS rejected_in_fv," + groupId + " AS groupid " +
            "FROM "+dbTableName.iklantProspectClient+" WHERE status_id IN(" + constantsObj.getRejectedFieldVerification() + ", " +
            "" + constantsObj.getRejectedAppraisal() + ") " +
            "AND group_id = " + groupId + ")count_rej)rejected_clients ON " +
            "rejected_clients.groupid = cca_rating.group_id ";
        customlog.info("cca1Query : " + query);
        connectionDataSource.getConnection(function (clientConnect) {
            clientConnect.query(query, function selectCb(err, results, fields) {
                if (err) {
                    connectionDataSource.releaseConnectionPool(clientConnect);
                    customlog.error(err);
                } else {
                    for (var i in results) {
                        var fieldName = results[i];
                        groupName = fieldName.group_name;
                        centerName = fieldName.center_name;
                        listClientIdArray[i] = fieldName.client_id;
                        listClientNameArray[i] = fieldName.client_name;
                        listClientRatingArray[i] = fieldName.appraisal_rating;
                        listClientTotalWeightageArray[i] = fieldName.total_weightage_obtained;
                        listClientTotalWeightageRequiredArray[i] = fieldName.total_weightage_required;
                        countOfRejectedClients = fieldName.rejected_clients_count;
                        listLoanCountArray[i] = fieldName.loan_count;
                        v = parseFloat(listClientRatingArray[i]);
                        sum += v;
                        len = listClientRatingArray.length;
                        average = sum / len;
                        customlog.info("Client Id=" + listClientIdArray[i]);
                        customlog.info("Client Name=" + listClientNameArray[i]);
                        customlog.info("Appraisal Rating=" + listClientRatingArray[i]);
                        customlog.info("total Weightage=" + listClientTotalWeightageArray[i]);
                    }
                    appraisedClientsObj.setListClientIdArray(listClientIdArray);
                    appraisedClientsObj.setListClientNameArray(listClientNameArray);
                    appraisedClientsObj.setListClientRatingArray(listClientRatingArray);
                    appraisedClientsObj.setListClientTotalWeightageArray(listClientTotalWeightageArray);
                    appraisedClientsObj.setListClientTotalWeightageRequiredArray(listClientTotalWeightageRequiredArray);
                    appraisedClientsObj.setAppraisal_Rating(average);
                    appraisedClientsObj.setGroup_name(groupName);
                    appraisedClientsObj.setAppraisal_group_name(centerName);
                    appraisedClientsObj.setListLoanCountArray(listLoanCountArray);
                }
                customlog.info("listClientIdArray=" + listClientIdArray);
                customlog.info("average=" + average);
                customlog.info("countOfRejectedClients====" + countOfRejectedClients);
                customlog.info("listClientTotalWeightageRequiredArray====" + listClientTotalWeightageRequiredArray);
            });
            //Retrieve Document Type
            var docTypeIdArray = new Array();
            var docTypeNameArray = new Array();
            var docTypequery = "SELECT doc_id,doc_name FROM "+dbTableName.iklantDocType+"  where doc_entity_id=" + constantsObj.getClientDocsEntity() + "";
            clientConnect.query(docTypequery,
                function selectCb(err, results, fields) {
                    if (err) {
                        connectionDataSource.releaseConnectionPool(clientConnect);
                        customlog.error(err);
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
                "((SELECT COUNT(question_Id) FROM "+dbTableName.iklantQuestions+" WHERE is_default = 1 AND loan_count = pc.loan_count AND tenant_id = "+tenantId+" ) <> 0)"+
                ")";
            customlog.info("secondaryAppraisalDiffQuery : " + secondaryAppraisalDiffQuery);
            clientConnect.query(secondaryAppraisalDiffQuery, function selectCb(err, results, fields) {
                if (err) {
                    connectionDataSource.releaseConnectionPool(clientConnect);
                    customlog.error(err);
                } else {
                    for (var i in results) {
                        unAppraisedClients = results[i].no_of_clients - results[i].no_of_sec_rating;
                    }
                    connectionDataSource.releaseConnectionPool(clientConnect);
                }
                customlog.info("unAppraisedClients : " + unAppraisedClients);
                callback(groupId, unAppraisedClients, appraisedClientsObj, countOfRejectedClients);
            });
        });
    },

    /*cca1RejectClients: function (rejectedClientName, remarksToReject, roleId, callback) {
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
     clientConnect.query(clientRejectQuery,
     function postCreate(err) {
     if (err) {
     connectionDataSource.releaseConnectionPool(clientConnect);
     customlog.error(err);
     }
     });
     clientConnect.query("DELETE FROM " + dbTableName.iklantRejectedClientStatus + " WHERE client_id = "+rejectedClientName,
     function postCreate(err) {
     if (err) {
     connectionDataSource.releaseConnectionPool(clientConnect);
     customlog.error(err);
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
     customlog.error(err);
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
     customlog.error(err);
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
     */
    /*cca1approvedGroup: function (rejectedClientName, approvedGroupName, callback) {
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
     customlog.info("approveGroupQuery : " + approveGroupQuery);
     connectionDataSource.getConnection(function (clientConnect) {
     clientConnect.query(approveGroupQuery,
     function postCreate(err) {
     if (err) {
     customlog.error(err);
     connectionDataSource.releaseConnectionPool(clientConnect);
     }
     });
     var getGroupIdQuery = "SELECT office_id FROM "+dbTableName.iklantProspectGroup+" WHERE group_id =" + approvedGroupName;
     clientConnect.query(getGroupIdQuery,
     function selectCb(err, results, fields) {
     if (err) {
     connectionDataSource.releaseConnectionPool(clientConnect);
     callback();
     customlog.error(err);
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
     customlog.info("rejectGroupQuery : " + rejectGroupQuery);
     connectionDataSource.getConnection(function (clientConnect) {
     clientConnect.query(rejectGroupQuery,
     function postCreate(err) {
     if (err) {
     connectionDataSource.releaseConnectionPool(clientConnect);
     customlog.error(err);
     }
     });
     var updateClientQuery = "UPDATE "+dbTableName.iklantProspectClient+" pc SET pc.status_id=" + constantsObj.getAppraisedStatus() + ", " +
     "pc.updated_date=NOW() + INTERVAL 5 HOUR + INTERVAL 30 MINUTE " +
     "WHERE pc.status_id =" + constantsObj.getFieldVerified() + " " +
     "AND pc.group_id='" + approvedGroupName + "'";
     customlog.info("updateClientQuery : " + updateClientQuery);
     clientConnect.query(updateClientQuery, function postCreate(err) {
     if (err) {
     connectionDataSource.releaseConnectionPool(clientConnect);
     customlog.error(err);
     }
     });
     var getGroupIdQuery = "SELECT office_id FROM "+dbTableName.iklantProspectGroup+" WHERE group_id =" + approvedGroupName;
     clientConnect.query(getGroupIdQuery,
     function selectCb(err, results, fields) {
     connectionDataSource.releaseConnectionPool(clientConnect);
     if (err) {
     customlog.error(err);
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
     }, */

    /*checkForAlreadyExistingmemberDatamodel: function (tenantId, rationCardNumber, contactNumber, voterId, aadhaarNumber, callback) {
        var self = this;
        var noOfClients = 0;
        var clientName;
        var groupName;
        var centerName;

        if (voterId == '' && aadhaarNumber == '') {
            var checkForAlreadyExistingmemberQuery = "SELECT COUNT(pc.client_id) as clients,pc.client_name,pg.group_name,pg.center_name " +
                "FROM "+dbTableName.iklantProspectClientPersonal+"  pcp " +
                "INNER JOIN "+dbTableName.iklantProspectClient+"  pc ON pc.client_id = pcp.client_id " +
                "INNER JOIN "+dbTableName.iklantProspectGroup+"  pg ON pg.group_id = pc.group_id " +
                "WHERE (pcp.ration_card_number = '" + rationCardNumber + "' " +
                "OR pcp.mobile_number = '" + contactNumber + "') " +
                "AND pg.tenant_id = " + tenantId + " GROUP BY pg.center_name, pg.group_name, pc.client_name ";
        } else if (voterId == '') {
            var checkForAlreadyExistingmemberQuery = "SELECT COUNT(pc.client_id) as clients,pc.client_name,pg.group_name,pg.center_name " +
                "FROM "+dbTableName.iklantProspectClientPersonal+" pcp " +
                "INNER JOIN "+dbTableName.iklantProspectClient+" pc ON pc.client_id = pcp.client_id " +
                "INNER JOIN "+dbTableName.iklantProspectGroup+" pg ON pg.group_id = pc.group_id " +
                "WHERE (pcp.ration_card_number = '" + rationCardNumber + "' " +
                "OR pcp.mobile_number = '" + contactNumber + "' OR pcp.aadhaar_number = '" + aadhaarNumber + "') " +
                "AND pg.tenant_id = " + tenantId + " GROUP BY pg.center_name, pg.group_name, pc.client_name ";
        } else if (aadhaarNumber == '') {
            var checkForAlreadyExistingmemberQuery = "SELECT COUNT(pc.client_id) as clients,pc.client_name,pg.group_name,pg.center_name " +
                "FROM "+dbTableName.iklantProspectClientPersonal+" pcp " +
                "INNER JOIN "+dbTableName.iklantProspectClient+" pc ON pc.client_id = pcp.client_id " +
                "INNER JOIN "+dbTableName.iklantProspectGroup+" pg ON pg.group_id = pc.group_id " +
                "WHERE (pcp.ration_card_number = '" + rationCardNumber + "' OR pcp.voter_id = '" + voterId + "' " +
                "OR pcp.mobile_number = '" + contactNumber + "') " +
                "AND pg.tenant_id = " + tenantId + " GROUP BY pg.center_name, pg.group_name, pc.client_name ";
        } else {
            var checkForAlreadyExistingmemberQuery = "SELECT COUNT(pc.client_id) as clients,pc.client_name,pg.group_name,pg.center_name " +
                "FROM "+dbTableName.iklantProspectClientPersonal+" pcp " +
                "INNER JOIN "+dbTableName.iklantProspectClient+" pc ON pc.client_id = pcp.client_id " +
                "INNER JOIN "+dbTableName.iklantProspectGroup+" pg ON pg.group_id = pc.group_id " +
                "WHERE (pcp.ration_card_number = '" + rationCardNumber + "' OR pcp.voter_id = '" + voterId + "' " +
                "OR pcp.mobile_number = '" + contactNumber + "' OR pcp.aadhaar_number = '" + aadhaarNumber + "') " +
                "AND pg.tenant_id = " + tenantId + " GROUP BY pg.center_name, pg.group_name, pc.client_name ";
        }
        customlog.info("checkForAlreadyExistingmemberQuery : " + checkForAlreadyExistingmemberQuery);
        connectionDataSource.getConnection(function (clientConnect) {
            clientConnect.query(checkForAlreadyExistingmemberQuery, function selectCb(err, results, fields) {
                if (err) {
                    connectionDataSource.releaseConnectionPool(clientConnect);
                    customlog.error(err);
                    callback(noOfClients, groupName, centerName, clientName);
                }
                else {
                    for (var i in results) {
                        noOfClients = results[i].clients;
                        clientName = results[i].client_name;
                        groupName = results[i].group_name;
                        centerName = results[i].center_name;
                    }
                    customlog.info("noOfClients : " + noOfClients);
                    connectionDataSource.releaseConnectionPool(clientConnect);
                    callback(noOfClients, groupName, centerName, clientName);
                }
            });
        });
    },
*/

    //Ramya
    insertMFICustomerIdDataModel : function(groupId,groupAccountId,callback){
        connectionDataSource.getConnection(function (clientConnect) {
            var insertRoleOperationQuery = "INSERT INTO "+dbTableName.iklantMifosMapping+" (group_id,mifos_customer_id)VALUES("+groupId+", "+groupAccountId+"); ";
            clientConnect.query(insertRoleOperationQuery, function postCreate(err) {
                if (!err) {
                    connectionDataSource.releaseConnectionPool(clientConnect);
                } else {
                    connectionDataSource.releaseConnectionPool(clientConnect);
                    customlog.error(err);
                }
            });

        });
    },
    /*toInsertGroup: function (groupId, callback) {
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
     "	IF(rd.`recurrence_id` = 1,rod.days,rod.day_number) AS dayNumber, "+
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
     "WHERE pg.`group_id` = "+ group_id +"	 "+
     "ORDER BY pc.`client_id` LIMIT 1 ";
     clientConnect.query(ciQuery, function selectCb(err, groupDetailsResultSet, fields) {
     if (err) {
     connectionDataSource.releaseConnectionPool(clientConnect);
     customlog.error(err);
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
     customlog.info("clientQuery:" + clientQuery);
     clientConnect.query(clientQuery, function selectCb(err, clientDetailsResultSet) {
     customlog.info("In Client Detail");
     if (err) {
     connectionDataSource.releaseConnectionPool(clientConnect);
     customlog.error(err);
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
     },*/

    /*generateReportDataModel: function (startdate, enddate, statusId, officeId,userId, callback) {
        var date = new Date();
        var dateTime = date.getFullYear() + '_' + date.getMonth() + 1 + '_' + date.getDate() + '_' + date.getHours() + '_' + date.getMinutes() + '_' + date.getSeconds();

        var officeNameArray = new Array();
        var groupNameArray = new Array();
        var centerNameArray = new Array();
        var globalAccountNumberArray = new Array();
        var createdDateArray = new Array();
        var bdeArray = new Array();
        var fieldOfficerArray = new Array();
        var totalNoOfClientsArray = new Array();
        var noOfActiveClientsArray = new Array();
        var noOfRejectedClientsArray = new Array();
        var statusDescArray = new Array();
        var self = this;
        var loanCountArray = new Array();

        var report_name = "Groups in Various Stages Report-" + dateTime + ".xlsx";
        var excel = require('msexcel-builder');
        var workbook = excel.createWorkbook(rootPath+'/documents/report_documents', report_name);
        var fileLocation = '';

        // For modified report
        *//* var rejectionStatusIdList = [constantsObj.getRejectedPriliminaryVerification(), constantsObj.getRejectedCreditBureauAnalysisStatusId(),
         constantsObj.getRejectedFieldVerification(), constantsObj.getRejectedAppraisal()];
         var allStatusIdList = [constantsObj.getNewGroup(), constantsObj.getPreliminaryVerified(), constantsObj.getKYCUploaded(),
         constantsObj.getKYCCompleted(), constantsObj.getCreditBureauAnalysedStatus(), constantsObj.getAssignedFO(),
         constantsObj.getFieldVerified(), constantsObj.getNeedInformation(), constantsObj.getAppraisedStatus(),
         constantsObj.getAuthorizedStatus(), constantsObj.getLoanSanctionedStatus(), constantsObj.getSynchronizedGroupsStatus(),
         constantsObj.getArchived(), constantsObj.getRejectedPriliminaryVerification(), constantsObj.getRejectedCreditBureauAnalysisStatusId(),
         constantsObj.getRejectedFieldVerification(), constantsObj.getRejectedAppraisal()];

         customlog.info("allStatusIdList: " + allStatusIdList);
         *//*
        *//*
         var generateReportQuery = "SELECT pc.group_id,ab.group_name,ab.center_name,ab.office_name,COUNT(pc.client_id) AS no_of_clients,ab.status_desc,ab.status_id FROM "+dbTableName.iklantProspectClient+" pc " +
         "LEFT JOIN "+
         "(SELECT pg.group_id,pg.group_name,pg.center_name,o.office_name,ps.status_desc,pg.status_id  FROM "+
         ""+dbTableName.iklantProspectGroup+" pg "+
         "INNER JOIN office o ON o.office_id = pg.office_id "+
         "INNER JOIN prospect_status ps ON ps.status_id = pg.status_id "+
         "WHERE pg.status_id IN ("+statusIdList+") AND pg.tenant_id = "+tenantId+" AND DATE(pg.updated_date) >= '"+startdate+"' AND DATE(pg.updated_date) <= '"+enddate+"' AND pg.office_id="+officeId+"  "+
         "ORDER BY pg.group_id)ab "+
         "ON ab.group_id = pc.group_id "+
         "WHERE pc.group_id = ab.group_id AND pc.status_id IN ("+statusIdList+") "+
         "GROUP BY pc.group_id " +
         "ORDER BY ab.status_id; ";
         *//*
        *//*
         var generateReportQuery = "SELECT * FROM " +
         "(SELECT pc.group_id,ab.group_name,ab.center_name,ab.office_name, " +
         "COUNT(pc.client_id) AS total_no_of_clients,ab.status_desc,ab.status_id FROM "+dbTableName.iklantProspectClient+" pc  " +
         "LEFT JOIN (SELECT pg.group_id,pg.group_name,pg.center_name,o.office_name,ps.status_desc,pg.status_id   " +
         "FROM "+dbTableName.iklantProspectGroup+" pg INNER JOIN "+dbTableName.iklantOffice+" o ON o.office_id = pg.office_id  " +
         "INNER JOIN prospect_status ps ON ps.status_id = pg.status_id WHERE pg.status_id  " +
         "IN (" + statusIdList + ") AND pg.tenant_id = " + tenantId + "  " +
         "AND DATE(pg.updated_date) >= '" + startdate + "' AND DATE(pg.updated_date) <= '" + enddate + "'  ";
         if(officeId != -1){
         generateReportQuery += "AND pg.office_id=" + officeId;
         }
         generateReportQuery += " ORDER BY pg.group_id)ab ON ab.group_id= pc.group_id  " +
         "WHERE pc.group_id = ab.group_id AND pc.status_id IN (" + allStatusIdList + ")  " +
         "GROUP BY pc.group_id ORDER BY ab.status_id)a " +
         "LEFT JOIN " +
         "(SELECT pc.group_id, " +
         "COUNT(pc.client_id) AS no_of_active_clients FROM "+dbTableName.iklantProspectClient+" pc  " +
         "LEFT JOIN (SELECT pg.group_id,pg.group_name,pg.center_name,o.office_name,ps.status_desc,pg.status_id   " +
         "FROM "+dbTableName.iklantProspectGroup+" pg INNER JOIN "+dbTableName.iklantOffice+" o ON o.office_id = pg.office_id  " +
         "INNER JOIN prospect_status ps ON ps.status_id = pg.status_id WHERE pg.status_id  " +
         "IN (" + statusIdList + ") AND pg.tenant_id = " + tenantId + "  " +
         "AND DATE(pg.updated_date) >= '" + startdate + "' AND DATE(pg.updated_date) <= '" + enddate + "'  " +
         "AND pg.office_id=" + officeId + "  ORDER BY pg.group_id)ab ON ab.group_id= pc.group_id  " +
         "WHERE pc.group_id = ab.group_id AND pc.status_id NOT IN (" + rejectionStatusIdList + ") " +
         "GROUP BY pc.group_id ORDER BY ab.status_id)b " +
         "ON b.group_id = a.group_id ";*//*
        var generateReportQuery = "CALL sp_groups_in_various_stages('" + startdate + "','" + enddate + "'," + officeId + "," + statusId + "," + userId + ")"
        customlog.info("generateReportQuery: " + generateReportQuery);
        connectionDataSource.getConnection(function (clientConnect) {
            clientConnect.query(generateReportQuery,
                function selectCb(err, resultSet, fields) {
                    connectionDataSource.releaseConnectionPool(clientConnect);
                    if (err) {
                        customlog.error(err);
                        callback(officeNameArray, groupNameArray, centerNameArray, globalAccountNumberArray, createdDateArray, bdeArray, fieldOfficerArray, totalNoOfClientsArray, noOfActiveClientsArray, noOfRejectedClientsArray, statusDescArray, fileLocation);
                    }
                    else {
                        // sheet for detailed report
                        var results = resultSet[0];
                        var rowLength = results.length + 10;
                        var sheet = workbook.createSheet("groups_in_various_stages", 20, parseInt(rowLength));
                        var columns = new Array('S.No', 'Office', 'Group Name', 'Center Name', 'Group Global Number', 'Loan Count',
                            'Created Date', 'BDE', 'Field Officer', 'Total Clients', 'Active Clients', 'Rejected Clients', 'Status');
                        var heading = "Groups in various Stages Report from " + startdate + " to " + enddate;
                        self.excelUtility.setAlignmentForHeader(sheet, 2, 14, 4, new Array(10, 30, 20, 45, 30, 10, 30, 45, 45, 25, 25, 25, 40), columns, heading, function (result) {
                            sheet = result;
                            for (var i = 0; i < results.length; i++) {
                                var rowValue = parseInt(4);
                                rowValue = rowValue + parseInt(i + 1);
                                sheet.set(2, rowValue, parseInt(i + 1));
                                sheet.set(3, rowValue, results[i].office_name);
                                sheet.set(4, rowValue, results[i].group_name);
                                sheet.set(5, rowValue, results[i].center_name);
                                sheet.set(6, rowValue, results[i].group_global_number);
                                sheet.set(7, rowValue, results[i].loan_count);
                                sheet.set(8, rowValue, results[i].created_date);
                                sheet.set(9, rowValue, results[i].BDE);
                                sheet.set(10, rowValue, results[i].field_officer);
                                sheet.set(11, rowValue, results[i].no_of_clients);
                                sheet.set(12, rowValue, results[i].active_clients);
                                sheet.set(13, rowValue, results[i].rejected_clients);
                                sheet.set(14, rowValue, results[i].status_desc);
                                self.excelUtility.setBorderAndAlignForCell(sheet, 2, 14, rowValue, new Array(11,12,13), new Array(2, 4, 6, 7,8), function (sheet) {
                                    sheet = sheet;
                                });

                                // For sending to view
                                officeNameArray[i] = results[i].office_name;
                                groupNameArray[i] = results[i].group_name;
                                centerNameArray[i] = results[i].center_name;
                                globalAccountNumberArray[i] = results[i].group_global_number;
                                loanCountArray[i] = results[i].loan_count;
                                createdDateArray[i] = results[i].created_date;
                                bdeArray[i] = results[i].BDE;
                                fieldOfficerArray[i] = results[i].field_officer;
                                totalNoOfClientsArray[i] = results[i].no_of_clients;
                                noOfActiveClientsArray[i] = results[i].active_clients;
                                noOfRejectedClientsArray[i] = results[i].rejected_clients;
                                statusDescArray[i] = results[i].status_desc;
                            }
                        });
                        fileLocation = rootPath+'/documents/report_documents/' + report_name;
                        workbook.save(function (err) {
                            if (err) {
                                workbook.cancel();
                                callback(officeNameArray, groupNameArray, centerNameArray, globalAccountNumberArray, createdDateArray, bdeArray, fieldOfficerArray, totalNoOfClientsArray, noOfActiveClientsArray, noOfRejectedClientsArray, statusDescArray,loanCountArray, fileLocation);
                            } else {
                                callback(officeNameArray, groupNameArray, centerNameArray, globalAccountNumberArray, createdDateArray, bdeArray, fieldOfficerArray, totalNoOfClientsArray, noOfActiveClientsArray, noOfRejectedClientsArray, statusDescArray,loanCountArray, fileLocation);
                            }
                        });
                    }
                }
            );
        });
    },

    //[Equifax]Adarsh
    generateEquifaxReportDataModel: function (tenantId, userId,officeId,callback) {
        var self = this;
        var constantsObj = this.constants;
        var groupNameArray = new Array();
        var centerNameArray = new Array();
        var groupIdArray = new Array();

        var generateEquifaxReportQuery = "select * from "+dbTableName.iklantProspectGroup+"  pg " +
            "LEFT JOIN rm_regional_office_list rmro ON rmro.office_id = pg.office_id WHERE pg.status_id IN " +
            "(" + constantsObj.getAssignedFO() + "," + constantsObj.getCreditBureauAnalysedStatus() + ", " +
            "" + constantsObj.getRejectedCreditBureauAnalysisStatusId() + ")"+
            " AND (pg.office_id = " + officeId + " OR " + officeId + " = -1)" +
            " AND (rmro.user_id = " + userId + " OR " + userId + " = -1)";

        customlog.info("generateEquifaxReportQuery" + generateEquifaxReportQuery);
        connectionDataSource.getConnection(function (clientConnect) {
            clientConnect.query(generateEquifaxReportQuery,
                function selectCb(err, results, fields) {
                    connectionDataSource.releaseConnectionPool(clientConnect);
                    if (err) {
                        customlog.error(err);
                        callback(groupIdArray, groupNameArray, centerNameArray);
                    }
                    else {
                        for (var i in results) {
                            groupIdArray[i] = results[i].group_id;
                            groupNameArray[i] = results[i].group_name;
                            centerNameArray[i] = results[i].center_name;
                        }
                        callback(groupIdArray, groupNameArray, centerNameArray);
                    }
                }
            );
        });
    },

    generateEquifaxReportClientsDataModel: function (tenantId, groupId, callback) {
        var self = this;
        var constantsObj = this.constants;
        var clientIdArray = new Array();
        var clientNameArray = new Array();
        var groupName = '', centerName = '';
        var generateEquifaxReportClientsQuery = "select pg.group_name,pg.center_name, pc.* from "+dbTableName.iklantProspectClient+"   pc " +
            "inner join "+dbTableName.iklantProspectGroup+"  pg on pg.group_id = pc.group_id " +
            "where  pc.group_id=" + groupId + " AND pc.status_id IN " +
            "(" + constantsObj.getAssignedFO() + "," + constantsObj.getCreditBureauAnalysedStatus() + ", " +
            "" + constantsObj.getRejectedCreditBureauAnalysisStatusId() + ") ";
        customlog.info("generateEquifaxReportClientsQuery" + generateEquifaxReportClientsQuery);
        connectionDataSource.getConnection(function (clientConnect) {
            clientConnect.query(generateEquifaxReportClientsQuery,
                function selectCb(err, results, fields) {
                    connectionDataSource.releaseConnectionPool(clientConnect);
                    if (err) {
                        customlog.error(err);
                        callback(groupName, centerName, clientIdArray, clientNameArray);
                    }
                    else {
                        for (var i in results) {
                            groupName = results[0].group_name;
                            centerName = results[0].center_name;
                            clientIdArray[i] = results[i].client_id;
                            clientNameArray[i] = results[i].client_name;
                        }
                        callback(groupName, centerName, clientIdArray, clientNameArray);
                    }
                });
        });
    },

    downloadClientEquifaxReportDataModel: function (tenantId, clientId, callback) {
        var self = this;
        var constantsObj = this.constants;
        var fileLocation = ""
        var downloadClientEquifaxReportQuery = "select Captured_image from "+dbTableName.iklantClientDoc+"  where client_id = " + clientId + " " +
            "and doc_type_id = " + constantsObj.getEquifaxReportDocId() + "";
        customlog.info("downloadEquifaxReportClientQuery" + downloadClientEquifaxReportQuery);
        connectionDataSource.getConnection(function (clientConnect) {
            clientConnect.query(downloadClientEquifaxReportQuery,
                function selectCb(err, results, fields) {
                    connectionDataSource.releaseConnectionPool(clientConnect);
                    if (err) {
                        customlog.error(err);
                        callback(fileLocation);
                    }
                    else {
                        for (var i in results) {
                            fileLocation = results[i].Captured_image;
                        }
                        callback(fileLocation);
                    }
                }
            );
        });
    },
*/
    /*downloadRequstedImageDataModel: function (tenantId, clientId, docId, callback) {
     var self = this;
     var fileLocation = new Array();
     customlog.info("clientId" + clientId);
     customlog.info("docId" + docId);
     var downloadRequstedImageQuery = "select Captured_image from "+dbTableName.iklantClientDoc+"  where client_id = " + clientId + " and doc_type_id = " + docId + " ";
     customlog.info("downloadRequstedImageQuery" + downloadRequstedImageQuery);
     connectionDataSource.getConnection(function (clientConnect) {
     clientConnect.query(downloadRequstedImageQuery,
     function selectCb(err, results, fields) {
     connectionDataSource.releaseConnectionPool(clientConnect);
     if (err) {
     customlog.error(err);
     callback(fileLocation);
     }
     else {
     var fileLocationAlt = new Array();
     for (var i in results) {
     fileLocationAlt[i] = results[i].Captured_image;
     }
     customlog.info("fileLocationDatamodel All Images" + fileLocationAlt);
     for(var j=0;j<fileLocationAlt.length;j++){
     try{
     var bitmap = fs.readFileSync(fileLocationAlt[j]);
     fileLocation.push(fileLocationAlt[j]);
     }catch(exc){
     }
     }
     customlog.info("fileLocationDatamodel Only Available Images" + fileLocation);
     callback(fileLocation);
     }
     }
     );
     });
     },*/

    //New Admin Screen
    //Manage Users
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
                    connectionDataSource.releaseConnectionPool(clientConnect);
                    customlog.info("officeNameArray" + officeNameArray);
                    callback(officeIdArray, officeNameArray, officeAddressArray, officeShortNameArray,languageArray);
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
                if (err) {
                    customlog.error(err);
                    callback(stateIdArray, stateNameArray);
                }
                else {
                    for (var i in results) {
                        stateIdArray[i] = results[i].state_id;
                        stateNameArray[i] = results[i].state_name;
                    }
                    connectionDataSource.releaseConnectionPool(clientConnect);
                    callback(stateIdArray, stateNameArray);
                }
            });
        });
    },

    /*getGroupDetailDataModel: function (userId1, callback) {
        var self = this;
        var constantsObj = this.constants;
        var retrieveGroupsDetailQuery = "SELECT " +
            "	npa_det.account_id," +
            "	npa_det.customer_id, " +
            "	npa_det.global_account_num, " +
            "	npa_det.customer, " +
            "	group_lead_add.address " +
            "FROM " +
            "(" +
            "SELECT " +
            "       npa.office_id, " +
            "		npa.account_id, " +
            "		npa.customer_id, " +
            "		npa.global_account_num, " +
            "		npa.customer,npa.npa_indicator " +
            "	FROM " +
            "		npa_util_loan npa " +
            ")npa_det " +
            "LEFT JOIN " +
            "( " +
            "SELECT " +
            "		MIN(c.customer_id) AS customer_id, " +
            "		c.parent_customer_id, " +
            "		CONCAT(cad.line_1,',',IFNULL(cad.line_2,''),',' ,IFNULL(cad.line_3,''),',',cad.city,',',cad.state,',',cad.country) AS address " +
            "	FROM customer c " +
            "		INNER JOIN customer_address_detail cad ON c.customer_id = cad.customer_id " +
            "	WHERE c.customer_level_id =1 " +
            "		GROUP BY c.parent_customer_id " +
            "		ORDER BY c.parent_customer_id,c.customer_id " +
            ")group_lead_add " +
            "ON npa_det.customer_id = group_lead_add.parent_customer_id " +
            "LEFT JOIN rm_regional_office_list rmro ON rmro.office_id = npa_det.office_id " +
            "WHERE npa_det.npa_indicator <> 'N' AND npa_det.account_id NOT IN(SELECT account_id FROM npa_util_loan_detail) " +
            "AND (rmro.user_id = " + userId1 +" OR " + userId1 +" = -1)";
        customlog.info("Query=" + retrieveGroupsDetailQuery);
        connectionDataSource.getConnection(function (clientConnect) {
            clientConnect.query(retrieveGroupsDetailQuery, function selectCb(err, results, fields) {
                if (!err) {
                    var NPALoanRecoveryGroupsObject = new Array();
                    var NPALoanRecoveryGroups = require("../domain/NPALoanRecoveryGroups");
                    for (var i in results) {
                        var NPALoanRecoveryGroupsDetail = new NPALoanRecoveryGroups();
                        NPALoanRecoveryGroupsDetail.setAccountId(results[i].account_id);
                        NPALoanRecoveryGroupsDetail.setCustomerId(results[i].customer_id);
                        NPALoanRecoveryGroupsDetail.setGlobalAccountNum(results[i].global_account_num);
                        NPALoanRecoveryGroupsDetail.setGroupName(results[i].customer);
                        NPALoanRecoveryGroupsDetail.setGlAddress(results[i].address);
                        NPALoanRecoveryGroupsObject[i] = NPALoanRecoveryGroupsDetail;
                    }
                    var retrieveRO = " SELECT u_role.personnel_id AS user_id,u_role.role_id,u.user_name " +
                        " FROM "+dbTableName.mfiPersonnelRole+"  u_role " +
                        " INNER JOIN "+dbTableName.iklantUsers+"  u ON u.user_id = u_role.personnel_id " +
                        " LEFT JOIN rm_regional_office_list rmro ON rmro.office_id = u.office_id " +
                        " WHERE u_role.role_id =" + constantsObj.getFOroleId() + " " +
                        " AND (rmro.user_id = " + userId1 +" OR " + userId1 +" = -1)";
                    clientConnect.query(retrieveRO, function selectCb(err, results, fields) {
                        if (!err) {
                            var userName = new Array();
                            var userId = new Array();
                            for (var i in results) {
                                userName[i] = results[i].user_name;
                                userId[i] = results[i].user_id;
                            }

                            var retrieveClosedGroups = " SELECT  " +
                                " nld.account_id, " +
                                " nl.customer, " +
                                " nld.status_id, " +
                                " nld.reason_for_not_paid, " +
                                " nld.capablility_percentage, " +
                                " nld.expected_payment_date, " +
                                " nld.remarks, " +
                                " nls.status_name " +
                                " FROM " +
                                " 	npa_util_loan_detail nld " +
                                " 	INNER JOIN npa_util_loan_status nls ON nls.status_id = nld.status_id " +
                                " 	INNER JOIN npa_util_loan nl ON nl.account_id = nld.account_id " +
                                "   LEFT JOIN rm_regional_office_list rmro ON rmro.office_id = nl.office_id" +
                                "   WHERE (rmro.user_id = " + userId1 +" OR " + userId1 +" = -1)";
                            clientConnect.query(retrieveClosedGroups, function selectCb(err, results, fields) {
                                connectionDataSource.releaseConnectionPool(clientConnect);
                                if (!err) {
                                    var NPALoanRecoveryGroupsStatusObject = new Array();
                                    var NPALoanRecoveryGroupsStatus = require("../domain/NPALoanRecoveryGroupsStatus");
                                    for (var i in results) {
                                        var NPALoanRecoveryGroupsStatusDetail = new NPALoanRecoveryGroupsStatus();
                                        NPALoanRecoveryGroupsStatusDetail.setAccountId(results[i].account_id);
                                        NPALoanRecoveryGroupsStatusDetail.setGroupName(results[i].customer);
                                        NPALoanRecoveryGroupsStatusDetail.setIsRecovered(results[i].status_id);
                                        NPALoanRecoveryGroupsStatusDetail.setReasonForNotPaid(results[i].reason_for_not_paid);
                                        NPALoanRecoveryGroupsStatusDetail.setCapablilityPercentage(results[i].capablility_percentage);
                                        NPALoanRecoveryGroupsStatusDetail.setExpectedPaymentDate(formatDateForUI(results[i].expected_payment_date));
                                        NPALoanRecoveryGroupsStatusDetail.setRemarks(results[i].remarks);
                                        NPALoanRecoveryGroupsStatusDetail.setLoansStatusDescription(results[i].status_name);
                                        NPALoanRecoveryGroupsStatusObject [i] = NPALoanRecoveryGroupsStatusDetail;
                                    }
                                    callback(NPALoanRecoveryGroupsObject, NPALoanRecoveryGroupsStatusObject, userName, userId);
                                } else {
                                    customlog.error(err);
                                    callback(NPALoanRecoveryGroupsObject, NPALoanRecoveryGroupsStatusObject, userName, userId);
                                }
                            });
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
    },
*/
    /*assignGroupToRODataModel: function (accountId, roId, callback) {
        var self = this;
        customlog.info("accountId" + accountId);
        customlog.info("roId========================" + roId);
        connectionDataSource.getConnection(function (clientConnect) {
            for (var i in accountId) {
                var insertNPALoansDetail = "INSERT INTO npa_util_loan_detail " +
                    "(account_id, recovery_officer_id, allocated_date, last_updated_date) " +
                    " VALUES(" + accountId[i] + "," + roId + ",NOW() + INTERVAL 5 HOUR + INTERVAL 30 MINUTE,NOW() + INTERVAL 5 HOUR + INTERVAL 30 MINUTE)";
                clientConnect.query(insertNPALoansDetail, function postCreate(err) {
                    if (err) {
                        customlog.error(err);
                        callback();
                    }
                });
            }
            connectionDataSource.releaseConnectionPool(clientConnect);
        });
        callback();
    },*/
    /*//Added by Sathish Kumar M 008 for Changing FO module
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
                    var LoanRecoveryGroups = require("../domain/LoanRecoveryGroups");

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
    },
    assignGroupToFODataModel: function (customerId,loanRecoveryOfficer,iklantGroupId, callback) {
        var self = this;
        customlog.info("accountId" + customerId);
        customlog.info("roId========================" + loanRecoveryOfficer);
        connectionDataSource.getConnection(function (clientConnect) {
            for (var i in customerId) {
                if(customerId[i] == 0){
                    var iklantOnlyUpdateQuery = "UPDATE iklant_prospect_group SET assigned_to = "+ loanRecoveryOfficer +",updated_date = NOW() + INTERVAL 5 HOUR + INTERVAL 30 MINUTE  WHERE group_id="+iklantGroupId[i] + ";"
                    clientConnect.query(iklantOnlyUpdateQuery, function postCreate(err) {
                        if (err) {
                            connectionDataSource.releaseConnectionPool(clientConnect);
                            customlog.error(err);
                            callback("failure");
                        }
                    });
                }else{
                    var updateLoansDetail = "UPDATE customer SET loan_officer_id =" + loanRecoveryOfficer + ",updated_date = NOW() + INTERVAL 5 HOUR + INTERVAL 30 MINUTE WHERE customer_id = " + customerId[i] + " OR parent_customer_id = " + customerId[i] + "";
                    clientConnect.query(updateLoansDetail, function postCreate(err) {
                        if (err) {
                            connectionDataSource.releaseConnectionPool(clientConnect);
                            customlog.error(err);
                            callback("failure");
                        }else{
                            var updateAccountQury = "UPDATE account SET personnel_id = " + loanRecoveryOfficer + ",updated_date = NOW() + INTERVAL 5 HOUR + INTERVAL 30 MINUTE WHERE customer_id = "+ customerId[i] +"";
                            clientConnect.query(updateAccountQury, function postCreate(err) {
                                if (err) {
                                    connectionDataSource.releaseConnectionPool(clientConnect);
                                    customlog.error(err);
                                    callback("failure");
                                }
                                else{
                                    if(iklantGroupId[i] != 0){
                                        var iklantUpdateQuery = "UPDATE iklant_prospect_group SET assigned_to = "+ loanRecoveryOfficer +",updated_date = NOW() + INTERVAL 5 HOUR + INTERVAL 30 MINUTE  WHERE group_id="+iklantGroupId[i] + ";"
                                        clientConnect.query(iklantUpdateQuery, function postCreate(err) {
                                            if (err) {
                                                connectionDataSource.releaseConnectionPool(clientConnect);
                                                customlog.error(err);
                                                callback("failure");
                                            }
                                        });
                                    }
                                }
                            });
                        }
                    });
                }
                var callResult = parseInt(i)+1;
                if(callResult == customerId.length){
                    callback("success");
                    connectionDataSource.releaseConnectionPool(clientConnect);
                }
            }
        });
    },
*/
    //Query to retrieve client name
    retrieveClientNameDataModel: function (clientId, callback) {
        var self = this;
        var retrieveClientNameQuery = "SELECT * FROM "+dbTableName.iklantProspectClient+"  WHERE client_id=" + clientId;
        customlog.info("retrieveClientNameQuery " + retrieveClientNameQuery);
        connectionDataSource.getConnection(function (clientConnect) {
            clientConnect.query(retrieveClientNameQuery, function selectCb(err, results, fields) {
                connectionDataSource.releaseConnectionPool(clientConnect);
                if (err) {
                    customlog.error(err);
                    callback(clientName);
                }
                else {
                    var clientName = results.client_name;
                    callback(clientName);
                }
            });
        });
    },

    /*//Document Verification for Loan Sanction
    docVerificationCallDataModel: function (iklantGroupId, docVerificationFlag, callback) {
        var self = this;
        var constantsObj = this.constants;
        var clientIdArray = new Array();
        var clientNameArray = new Array();
        var clientLoanCountArray = new Array();
        var centerName = "";
        var retrieveClientsForLoanSanction = "";
        if (docVerificationFlag == 1) {
            //from docVerification report management
            retrieveClientsForLoanSanction = "SELECT pg.group_id,pg.group_name,pg.center_name,pc.client_id,pc.loan_count, " +
                "pc.client_name,pc.client_last_name,pc.status_id FROM "+dbTableName.iklantProspectGroup+"  pg " +
                "INNER JOIN "+dbTableName.iklantProspectClient+"  pc ON pc.group_id = pg.group_id " +
                "WHERE pg.group_id = " + iklantGroupId + " AND pc.status_id " +
                "NOT IN (" + constantsObj.getRejectedPriliminaryVerification() + ", " +
                "" + constantsObj.getRejectedFieldVerification() + "," + constantsObj.getRejectedAppraisal() + ", " +
                "" + constantsObj.getRejectedCreditBureauAnalysisStatusId() + ")";
        } else {
            retrieveClientsForLoanSanction = "SELECT pg.group_id,pg.group_name,pg.center_name,pc.client_id,pc.loan_count, " +
                "pc.client_name,pc.client_last_name,pc.status_id FROM "+dbTableName.iklantProspectGroup+"  pg " +
                "INNER JOIN "+dbTableName.iklantProspectClient+"  pc ON pc.group_id = pg.group_id " +
                "WHERE pg.group_id = " + iklantGroupId + " AND " +
                "pc.status_id=" + constantsObj.getAuthorizedStatus() + " "
        }

        customlog.info("retrieveClientsForLoanSanction " + retrieveClientsForLoanSanction);
        connectionDataSource.getConnection(function (clientConnect) {
            clientConnect.query(retrieveClientsForLoanSanction, function selectCb(err, results, fields) {
                connectionDataSource.releaseConnectionPool(clientConnect);
                if (err) {
                    customlog.error(err);
                    callback(centerName, clientIdArray, clientNameArray,clientLoanCountArray);
                }
                else {
                    for (var i in results) {
                        centerName = results[0].center_name;
                        clientIdArray[i] = results[i].client_id;
                        clientNameArray[i] = results[i].client_name + " " + results[i].client_last_name;
                        clientLoanCountArray[i] = results[i].loan_count;
                    }
                    callback(centerName, clientIdArray, clientNameArray,clientLoanCountArray);
                }
                customlog.info("clientID: " + clientIdArray + " clientName: " + clientNameArray + " " + docVerificationFlag);
            });
        });
    },

    //Document Verification GroupList
    generateDocVerificationGroupsCallDataModel: function (tenantId, officeId, userId,callback) {
        var self = this;
        var constantsObj = this.constants;
        var groupIdArray = new Array();
        var groupNameArray = new Array();
        var centerNameArray = new Array();
        var errorField = "";

        var generateDocVerificationGroupsQuery = "SELECT * FROM "+dbTableName.iklantProspectGroup+"  pg " +
            "LEFT JOIN rm_regional_office_list rmro ON rmro.office_id = pg.office_id  WHERE pg.status_id NOT IN " +
            "(" + constantsObj.getNewGroup() + "," + constantsObj.getPreliminaryVerified() + "," +
            "" + constantsObj.getArchived() + "," + constantsObj.getRejectedPriliminaryVerification() + "," +
            "" + constantsObj.getRejectedFieldVerification() + "," + constantsObj.getRejectedAppraisal() + "," +
            "" + constantsObj.getRejectedCreditBureauAnalysisStatusId() + ") AND (pg.office_id = " + officeId + " OR " + officeId + " = -1) " +
            "AND (rmro.user_id = " + userId + " OR " + userId + " = -1)";
        customlog.info("generateDocVerificationGroupsQuery" + generateDocVerificationGroupsQuery);
        connectionDataSource.getConnection(function (clientConnect) {
            clientConnect.query(generateDocVerificationGroupsQuery,
                function selectCb(err, results, fields) {
                    connectionDataSource.releaseConnectionPool(clientConnect);
                    if (err) {
                        customlog.error(err);
                        callback(groupIdArray, groupNameArray, centerNameArray, errorField);
                    }
                    else {
                        for (var i in results) {
                            groupIdArray[i] = results[i].group_id;
                            groupNameArray[i] = results[i].group_name;
                            centerNameArray[i] = results[i].center_name;
                        }
                        if (groupIdArray == "") {
                            errorField = "No Groups to Display";
                        }
                        customlog.info("groupIdArray " + groupIdArray + " errorField" + errorField);
                        callback(groupIdArray, groupNameArray, centerNameArray, errorField);
                    }
                });
        });
    },
*/
    /*// Added by chitra for Report Management
    reportManagementDataModel: function (tenantId, officeId, userId, callback) {
        var self = this;
        var statusIdArray = new Array();
        var statusDescArray = new Array();
        var retrieveStatusQuery = "SELECT status_id,status_desc FROM "+dbTableName.iklantProspectStatus+"";
        connectionDataSource.getConnection(function (clientConnect) {
            clientConnect.query(retrieveStatusQuery, function selectCb(err, results, fields) {
                if (err) {
                    connectionDataSource.releaseConnectionPool(clientConnect);
                    customlog.error(err);
                }
                else {
                    for (var i in results) {
                        statusIdArray[i] = results[i].status_id;
                        statusDescArray[i] = results[i].status_desc;
                    }
                }
                customlog.info("statusIdArray" + statusIdArray);
                customlog.info("statusDescArray" + statusDescArray);
                var finYearQuery = "SELECT * FROM `acc_financialyear` ORDER BY `status`";
                clientConnect.query(finYearQuery, function (error, finResult) {
                    if (error) {
                        connectionDataSource.releaseConnectionPool(clientConnect);
                        customlog.error(error);
                    }
                    else {
                        var ledgerQuery = "SELECT co.glcode_id,co.coa_name,glc.glcode_value FROM coa co " +
                            "LEFT JOIN gl_code glc ON glc.glcode_id = co.glcode_id " +
                            "LEFT JOIN gl_code_custom c ON c.glcode_id = co.glcode_id " +
                            "LEFT JOIN rm_regional_office_list rmro ON rmro.office_id = c.office_id " +
                            "WHERE (rmro.user_id = " + userId +" OR " + userId +" = -1) OR c.office_id = 1 GROUP BY co.glcode_id";
                        clientConnect.query(ledgerQuery, function (err, ledgerResult) {
                            connectionDataSource.releaseConnectionPool(clientConnect);
                            if (error) {
                                customlog.error(err);
                            }
                            else {
                                self.retrieveLoanProductAndCategoryDatamodel(tenantId, function (prdOfferingIdArray, prdOfferingNameArray, prdCategoryIdArray, prdCategoryNameArray) {
                                    self.commonDataModel.getPersonnelDetailsDataModel(officeId,userId,function (personnelIdArray, personnelNameArray) {
                                        callback(statusIdArray, statusDescArray, finResult, ledgerResult,
                                            prdOfferingIdArray, prdOfferingNameArray, prdCategoryIdArray, prdCategoryNameArray, personnelIdArray, personnelNameArray);
                                    });
                                });
                            }
                        });
                    }
                });
            });
        });
    },

    retrieveLoanProductAndCategoryDatamodel: function (tenantId, callback) {
        var self = this;
        var loan_product_Query = "SELECT prd_offering_id,prd_offering_name FROM prd_offering po ";
        var prdOfferingIdArray = new Array();
        var prdOfferingNameArray = new Array();
        var prdCategoryIdArray = new Array();
        var prdCategoryNameArray = new Array();
        connectionDataSource.getConnection(function (clientConnect) {
            clientConnect.query(loan_product_Query, function (err, loan_product_result) {
                if (err) {
                    connectionDataSource.releaseConnectionPool(clientConnect);
                    customlog.error(err);
                }
                else {
                    for (var i in loan_product_result) {
                        prdOfferingIdArray[i] = loan_product_result[i].prd_offering_id;
                        prdOfferingNameArray[i] = loan_product_result[i].prd_offering_name;
                    }
                    var product_category_Query = "SELECT prd_category_id,prd_category_name FROM prd_category WHERE prd_type_id = 1 "; // for loan only
                    clientConnect.query(product_category_Query, function (error, loan_product_result) {
                        connectionDataSource.releaseConnectionPool(clientConnect);
                        if (error) {
                            customlog.error(error);
                            callback(prdOfferingIdArray, prdOfferingNameArray, prdCategoryIdArray, prdCategoryNameArray)
                        }
                        else {
                            for (var i in loan_product_result) {
                                prdCategoryIdArray[i] = loan_product_result[i].prd_category_id;
                                prdCategoryNameArray[i] = loan_product_result[i].prd_category_name;
                            }
                            callback(prdOfferingIdArray, prdOfferingNameArray, prdCategoryIdArray, prdCategoryNameArray)
                        }
                    });
                }
            });
        });
    },

    retrieveLedgerDetailsDataModel: function (tenantId, officeId, ledger_name, userId,callback) {
        var self = this;
        var ledger_name_array = new Array();
        var gl_code_value_array = new Array();
        if (typeof ledger_name != "undefined") {
            var retrieveLedgerQuery = "SELECT a.coa_name AS glname,b.glcode_value FROM coa a " +
                "LEFT JOIN gl_code b ON b.glcode_id = a.glcode_id " +
                "LEFT JOIN gl_code_custom c ON c.glcode_id = a.glcode_id " +
                "LEFT JOIN rm_regional_office_list rmro ON rmro.office_id = c.office_id " +
                "WHERE a.glcode_id=b.glcode_id AND a.glcode_id=c.glcode_id " +
                "AND glcode_value IN (SELECT lookup_name FROM lookup_value WHERE entity_id IN " +
                "(SELECT entity_id FROM lookup_entity WHERE entity_name = '" + ledger_name + "')) " +
                "AND (c.office_id = " + officeId + " OR " + officeId + " = -1) " +
                "AND (rmro.user_id = " + userId +" OR " + userId +" = -1) GROUP BY b.glcode_value";

            customlog.info("retrieveLedgerQuery : " + retrieveLedgerQuery);
            connectionDataSource.getConnection(function (clientConnect) {
                clientConnect.query(retrieveLedgerQuery, function selectCb(err, results, fields) {
                    connectionDataSource.releaseConnectionPool(clientConnect);
                    if (err) {
                        customlog.error(err);
                        callback(ledger_name_array, gl_code_value_array);
                    } else {
                        for (var i in results) {
                            ledger_name_array[i] = results[i].glname;
                            gl_code_value_array[i] = results[i].glcode_value;
                        }
                        customlog.info("ledger_name_array= " + ledger_name_array);
                        callback(ledger_name_array, gl_code_value_array);
                    }
                });
            });
        }else{
            callback(ledger_name_array, gl_code_value_array);
        }
    },

    retrieveStatusDataModel : function(reportId,callback){
        var self = this;
        var constObj = this.constants;
        var stateId = new Array();
        var stateName = new Array();
        if(reportId == constObj.getFundBookDebtReport()){
            var accountStateQuery = "SELECT ca.coa_id AS account_state_id,ca.coa_name AS status_description FROM  coa ca "+
                "INNER JOIN `coahierarchy` ch ON ch.coa_id = ca.coa_id "+
                "WHERE ch.parent_coaid = 53; ";
        }
        else {
            var accountStateQuery = "SELECT ast.account_state_id,ast.status_description FROM account_state ast WHERE ast.account_state_id IN (5,6,7,8,9)";
        }
        connectionDataSource.getConnection(function (clientConnect) {
            clientConnect.query(accountStateQuery, function (error, result) {
                connectionDataSource.releaseConnectionPool(clientConnect);
                if (error) {
                    callback(stateId, stateName);
                }
                else {
                    for (var i in result) {
                        stateId[i] = result[i].account_state_id;
                        stateName[i] = result[i].status_description;
                    }
                    callback(stateId, stateName);
                }
            });
        });
    },

    *//* For delete the excel files in the report documents directory*//*
    deleteFilesInDirectory: function (directory_name) {
        var fs = require('fs');
        fs.readdir(directory_name, function (err, files) {
            if (err) {
                throw err;
            }
            for (var i in files) {
                fs.unlinkSync(directory_name + files[i]);
            }
        });
    },

    // Method for  groupOutstandingReport
    groupOutstandingReportDatamodel: function (tenantId, officeId, startDate, endDate, customer, accountNo, selected_product_id, selected_category_id, selected_field_off_id, userId, callback) {
        var excel = require('msexcel-builder');
        var currentDate = new Date();
        var date_value = currentDate.getDate() + "_" + currentDate.getMonth() + 1 + "_" + currentDate.getFullYear() + "_" + currentDate.getHours() + "_" + currentDate.getSeconds();
        var self = this;
        var fileLocation = '', summary_result_set = new Array();

        var dynamic_file_name = "group_outstanding_report_" + date_value + ".xlsx";
        var workbook = excel.createWorkbook(rootPath+'/documents/report_documents/', dynamic_file_name);
        var group_query = "CALL `sp_group_outstanding_with_product`( '1900-01-01','" + endDate + "'," + officeId + ",'" + customer + "','" + accountNo + "'," + selected_field_off_id + "," + selected_product_id + "," + selected_category_id + "," + userId + ")";
        connectionDataSource.getConnection(function (clientConnect) {
            clientConnect.query(group_query, function selectCb(err, resultSet, fields) {
                connectionDataSource.releaseConnectionPool(clientConnect);
                if (err) {
                    customlog.error(err);
                    callback(resultSet, fileLocation);
                }
                else {
                    var groupOutstandingResult = resultSet[0];
                    var row_size = groupOutstandingResult.length + 5;
                    var report_index = 0, rowvalue = parseInt(4), summary_result_set_index = 0;
                    var report_sheet = workbook.createSheet('group_outstanding_report', 20, parseInt(row_size));
                    var report_sheet_array = new Array('S.No', 'Office', 'Customer', 'Account No', 'Loan Officer', 'Loan Product', 'Category Name', 'Disb.Date','No.of Clients', 'Loan Amt', 'Principal', 'Prin Paid', 'Prin Outstanding', 'Interest', 'Int.Paid');
                    var summary_sheet = workbook.createSheet('summary_report', 15, parseInt(300));
                    var summary_sheet_array = new Array('S.No', 'Office', 'Loan Officer', 'Tot.Customers', 'Tot.Loan Amt', 'Tot.Principal', 'Tot.Prin Paid', 'Tot.Prin Outstanding', 'Tot.Interest', 'Tot.Int.Paid');
                    var heading = "Group Outstanding Report from " + startDate + " to " + endDate;

                    self.excelUtility.setAlignmentForHeader(report_sheet, 2, 16, 4, new Array(10, 25, 40, 25, 35, 30, 20, 20,20, 20, 20, 20, 20, 20, 20), report_sheet_array, heading, function (sheet_result) {
                        for (var i in groupOutstandingResult) {
                            if (groupOutstandingResult[i].account_id != null) {
                                rowvalue = rowvalue + 1;
                                report_sheet = sheet_result;
                                report_sheet.set(2, rowvalue, parseInt(report_index) + 1);
                                report_sheet.set(3, rowvalue, groupOutstandingResult[i].office);
                                report_sheet.set(4, rowvalue, groupOutstandingResult[i].customer);
                                report_sheet.set(5, rowvalue, groupOutstandingResult[i].account_num);
                                report_sheet.set(6, rowvalue, groupOutstandingResult[i].field_officer);
                                report_sheet.set(7, rowvalue, groupOutstandingResult[i].loan_product);
                                report_sheet.set(8, rowvalue, groupOutstandingResult[i].category_name);
                                report_sheet.set(9, rowvalue, groupOutstandingResult[i].disbursement_date);
                                report_sheet.set(10, rowvalue, groupOutstandingResult[i].no_of_clients);
                                report_sheet.set(11, rowvalue, groupOutstandingResult[i].loan_amount, 'number');
                                report_sheet.set(12, rowvalue, groupOutstandingResult[i].principal, 'number');
                                report_sheet.set(13, rowvalue, groupOutstandingResult[i].principal_paid, 'number');
                                report_sheet.set(14, rowvalue, groupOutstandingResult[i].prin_outstanding, 'number');
                                report_sheet.set(15, rowvalue, groupOutstandingResult[i].interest, 'number');
                                report_sheet.set(16, rowvalue, groupOutstandingResult[i].interest_paid, 'number');
                                report_index++;
                                self.excelUtility.setBorderAndAlignForCell(report_sheet, 2, 16, rowvalue, new Array(11, 12, 13, 14, 15,16), new Array(2, 9,10), function (sheet) {
                                    report_sheet = sheet;
                                });
                            } else {
                                summary_result_set[summary_result_set_index] = groupOutstandingResult[i];
                                summary_result_set_index++;
                            }
                        }
                    });

                    var rowvalue = parseInt(4);
                    var report_index = 0;
                    self.excelUtility.setAlignmentForHeader(summary_sheet, 2, 11, 4, new Array(10, 20, 35, 20, 20, 20, 20, 20, 20, 20), summary_sheet_array, "Summary Report from " + startDate + " to " + endDate, function (sheet_result) {
                        for (var i in summary_result_set) {
                            summary_sheet = sheet_result;
                            if (summary_result_set[i].account_id == null && summary_result_set[i].office_id != null && summary_result_set[i].personnel_id != null) {
                                rowvalue = rowvalue + 1;
                                summary_sheet.set(2, rowvalue, parseInt(report_index) + 1);
                                summary_sheet.set(3, rowvalue, summary_result_set[i].office);
                                summary_sheet.set(4, rowvalue, summary_result_set[i].field_officer);
                                summary_sheet.set(5, rowvalue, summary_result_set[i].total_customers);
                                summary_sheet.set(6, rowvalue, summary_result_set[i].total_loan_amount, 'number');
                                summary_sheet.set(7, rowvalue, summary_result_set[i].total_principal, 'number');
                                summary_sheet.set(8, rowvalue, summary_result_set[i].total_principal_paid, 'number');
                                summary_sheet.set(9, rowvalue, summary_result_set[i].total_prin_outstanding, 'number');
                                summary_sheet.set(10, rowvalue, summary_result_set[i].total_interest, 'number');
                                summary_sheet.set(11, rowvalue, summary_result_set[i].total_interest_paid, 'number');
                                report_index++;
                            } else if (summary_result_set[i].account_id == null && summary_result_set[i].office_id == null && summary_result_set[i].personnel_id == null) {
                                rowvalue = rowvalue + 1;
                                summary_sheet.set(4, rowvalue, "Total :");
                                summary_sheet.align(4, rowvalue, 'right');
                                summary_sheet.set(5, rowvalue, summary_result_set[i].total_customers);
                                summary_sheet.set(6, rowvalue, summary_result_set[i].total_loan_amount, 'number');
                                summary_sheet.set(7, rowvalue, summary_result_set[i].total_principal, 'number');
                                summary_sheet.set(8, rowvalue, summary_result_set[i].total_principal_paid, 'number');
                                summary_sheet.set(9, rowvalue, summary_result_set[i].total_prin_outstanding, 'number');
                                summary_sheet.set(10, rowvalue, summary_result_set[i].total_interest, 'number');
                                summary_sheet.set(11, rowvalue, summary_result_set[i].total_interest_paid, 'number');
                            }
                            self.excelUtility.setBorderAndAlignForCell(summary_sheet, 2, 11, rowvalue, new Array(6, 7, 8, 9, 10, 11), new Array(2, 5), function (sheet) {
                                summary_sheet = sheet;
                            });
                        }
                    });
                    fileLocation = rootPath+'/documents/report_documents/' + dynamic_file_name;
                    workbook.save(function (err) {
                        if (err) {
                            workbook.cancel();
                            callback(groupOutstandingResult, fileLocation);
                        } else {
                            customlog.info('group_outstanding_report created');
                            callback(groupOutstandingResult, fileLocation);
                        }
                    });
                }
            });
        });
    },

    // Added By Sathish Kumar M
    // Method for  groupOutstandingClientWiseReport
    groupOutstandingClientWiseReportDatamodel: function (tenantId, officeId, startDate, endDate, customer, accountNo, selected_product_id, selected_category_id, selected_field_off_id, userId, callback) {
        var excel = require('msexcel-builder');
        var currentDate = new Date();
        var date_value = currentDate.getDate() + "_" + currentDate.getMonth() + 1 + "_" + currentDate.getFullYear() + "_" + currentDate.getHours() + "_" + currentDate.getSeconds();
        var self = this;
        var fileLocation = '', summary_result_set = new Array();

        var dynamic_file_name = "group_outstanding_client_wise_report_" + date_value + ".xlsx";
        var workbook = excel.createWorkbook(rootPath+'/documents/report_documents/', dynamic_file_name);
        customlog.info("Before Executing query");
        var group_query = "CALL `sp_group_outstanding_with_product_client_wise`( '" + startDate + "','" + endDate + "'," + officeId + ",'" + customer + "','" + accountNo + "'," + selected_field_off_id + "," + selected_product_id + "," + selected_category_id + "," + userId + ")";
        customlog.info("Group Outstanding query" + group_query);
        connectionDataSource.getConnection(function (clientConnect) {
            clientConnect.query(group_query, function selectCb(err, resultSet, fields) {
                connectionDataSource.releaseConnectionPool(clientConnect);
                if (err) {
                    customlog.error(err);
                    callback(resultSet, fileLocation);
                }
                else {
                    var groupOutstandingResult = resultSet[0];
                    var row_size = groupOutstandingResult.length + 5;
                    var report_index = 0, rowvalue = parseInt(4), summary_result_set_index = 0;
                    var report_sheet = workbook.createSheet('group_outstanding_report_client_wise', 20, parseInt(row_size));
                    var report_sheet_array = new Array('S.No', 'Office', 'Customer', 'Account No', 'Group Name','Loan Officer', 'Loan Product', 'Category Name', 'Disb.Date', 'Loan Amt', 'Tenure Months','Principal', 'Prin.Paid', 'Prin.Outstanding', 'Interest', 'Int.Paid', 'Int.Outstanding');
                    var heading = "Group Outstanding Report from " + startDate + " to " + endDate;

                    self.excelUtility.setAlignmentForHeader(report_sheet, 2, 17, 4, new Array(10, 25, 40, 25, 35, 30, 20, 20,20, 20, 20, 20, 20, 20, 20, 20), report_sheet_array, heading, function (sheet_result) {
                        for (var i in groupOutstandingResult) {
                            if (groupOutstandingResult[i].account_id != null) {
                                rowvalue = rowvalue + 1;
                                report_sheet = sheet_result;
                                report_sheet.set(2, rowvalue, parseInt(report_index) + 1);
                                report_sheet.set(3, rowvalue, groupOutstandingResult[i].office);
                                report_sheet.set(4, rowvalue, groupOutstandingResult[i].customer);
                                report_sheet.set(5, rowvalue, groupOutstandingResult[i].account_num);
                                report_sheet.set(6, rowvalue, groupOutstandingResult[i].group_name);
                                report_sheet.set(7, rowvalue, groupOutstandingResult[i].field_officer);
                                report_sheet.set(8, rowvalue, groupOutstandingResult[i].loan_product);
                                report_sheet.set(9, rowvalue, groupOutstandingResult[i].category_name);
                                report_sheet.set(10, rowvalue, groupOutstandingResult[i].disbursement_date);
                                report_sheet.set(11, rowvalue, groupOutstandingResult[i].loan_amount, 'number');
                                report_sheet.set(12, rowvalue, groupOutstandingResult[i].tenure_months, 'number');
                                report_sheet.set(13, rowvalue, groupOutstandingResult[i].principal, 'number');
                                report_sheet.set(14, rowvalue, groupOutstandingResult[i].principal_paid);
                                report_sheet.set(15, rowvalue, groupOutstandingResult[i].prin_outstanding, 'number');
                                report_sheet.set(16, rowvalue, groupOutstandingResult[i].interest, 'number');
                                report_sheet.set(17, rowvalue, groupOutstandingResult[i].interest_paid);
                                report_index++;
                                self.excelUtility.setBorderAndAlignForCell(report_sheet, 2, 17, rowvalue, new Array(11, 12, 13, 14, 15,16,17), new Array(2, 9,10), function (sheet) {
                                    report_sheet = sheet;
                                });
                            } else {
                                summary_result_set[summary_result_set_index] = groupOutstandingResult[i];
                                summary_result_set_index++;
                            }
                        }
                    });
                    fileLocation = rootPath+'/documents/report_documents/' + dynamic_file_name;
                    workbook.save(function (err) {
                        if (err) {
                            workbook.cancel();
                            callback(groupOutstandingResult, fileLocation);
                        } else {
                            customlog.info('group_outstanding_report created');
                            callback(groupOutstandingResult, fileLocation);
                        }
                    });
                }
            });
        });
    },
// Ended by Sathih Kumar M
// Method for  insuranceCoverReport
    insuranceCoverReportDatamodel: function (tenantId, startDate, endDate,officeId, userId, callback) {
        var self = this;
        var currentDate = new Date();
        var date_value = currentDate.getDate() + "_" + currentDate.getMonth() + 1 + "_" + currentDate.getFullYear() + "_" + currentDate.getHours() + "_" + currentDate.getSeconds();
        var dynamic_file_name = "insurance_cover_report_" + date_value + ".xlsx";
        var excel = require('msexcel-builder');
        var fileLocation = '', summary_result_set = new Array();

        var workbook = excel.createWorkbook(rootPath+'/documents/report_documents/', dynamic_file_name);
        var group_query = "CALL `sp_insurance_cover`( '" + startDate + "','" + endDate + "',"+officeId+"," + userId + ")";
        connectionDataSource.getConnection(function (clientConnect) {
            clientConnect.query(group_query, function selectCb(err, resultSet, fields) {
                connectionDataSource.releaseConnectionPool(clientConnect);
                if (err) {
                    customlog.error(err);
                    callback(resultSet, fileLocation);
                }
                else {
                    var insuranceCoverResult = resultSet[0];
                    var row_size = insuranceCoverResult.length + 5;
                    var report_index = 0, rowvalue = parseInt(4), summary_result_set_index = 0;
                    var report_sheet = workbook.createSheet('insurance_cover_report_', 15, parseInt(row_size));
                    var report_sheet_array = new Array('S.No', 'Office', 'Group Name', 'Member Name', 'Member Age', 'Loan Amount', 'Customer No', 'Global Cust No');
                    var heading = "Insurance Cover Report from " + startDate + " to " + endDate;

                    self.excelUtility.setAlignmentForHeader(report_sheet, 2, 9, 4, new Array(10, 30, 40, 25, 17, 20, 20, 30), report_sheet_array, heading, function (sheet_result) {
                        for (var i in insuranceCoverResult) {
                            rowvalue = rowvalue + 1;
                            report_sheet = sheet_result;
                            report_sheet.set(2, rowvalue, parseInt(report_index) + 1);
                            report_sheet.set(3, rowvalue, insuranceCoverResult[i].office);
                            report_sheet.set(4, rowvalue, insuranceCoverResult[i].group_name);
                            report_sheet.set(5, rowvalue, insuranceCoverResult[i].member_name);
                            report_sheet.set(6, rowvalue, insuranceCoverResult[i].member_age);
                            report_sheet.set(7, rowvalue, insuranceCoverResult[i].loan_amount, 'number');
                            report_sheet.set(8, rowvalue, insuranceCoverResult[i].cus_no);
                            report_sheet.set(9, rowvalue, insuranceCoverResult[i].global_cust_num);
                            report_index++;
                            self.excelUtility.setBorderAndAlignForCell(report_sheet, 2, 9, rowvalue, new Array(7, 8), new Array(2, 6, 9), function (sheet) {
                                report_sheet = sheet;
                            });
                        }
                    });

                    fileLocation = rootPath+'/documents/report_documents/' + dynamic_file_name;
                    workbook.save(function (err) {
                        if (err) {
                            workbook.cancel();
                            customlog.error(err);
                            callback(insuranceCoverResult, fileLocation);
                        }
                        else {
                            customlog.info('insurance_cover_report_ created');
                            callback(insuranceCoverResult, fileLocation);
                        }
                    });
                }
            });
        });
    },

    // Method for  groupLedgerReport & groupLedgerInterestReport
    groupLedgerReportDatamodel: function (tenantId, officeId, startDate, endDate, customer, accountNo, selected_product_id, selected_category_id, selected_field_off_id, reportPageName, includePrevOperation, userId, callback) {
        var excel = require('msexcel-builder');
        var self = this;
        var currentDate = new Date();
        var date_value = currentDate.getDate() + "_" + currentDate.getMonth() + 1 + "_" + currentDate.getFullYear() + "_" + currentDate.getHours() + "_" + currentDate.getSeconds();
        var fileLocation = '', summary_result_set = new Array(), group_query;

        //var includePrevOperation_flag = "No";
        var dynamic_file_name = "group_ledger_report_" + date_value + ".xlsx";
        var workbook = excel.createWorkbook(rootPath+'/documents/report_documents/', dynamic_file_name);
        *//*if(includePrevOperation == "on") {
         includePrevOperation_flag   = "Yes";
         } *//*
        if (reportPageName == "groupLedgerInterestReport") {
            group_query = "CALL `sp_group_ledger_interest`('" + startDate + "','" + endDate + "'," + officeId + ",'" + customer + "','" + accountNo + "'," + selected_field_off_id + "," + selected_product_id + "," + selected_category_id + "," + userId + ")";
        } else {
            group_query = "CALL `sp_group_ledger`('" + startDate + "','" + endDate + "'," + officeId + ",'" + customer + "','" + accountNo + "'," + selected_field_off_id + "," + selected_product_id + "," + selected_category_id + ",'Yes'," + userId + ")";
        }
        connectionDataSource.getConnection(function (clientConnect) {
            clientConnect.query(group_query, function selectCb(err, resultSet, fields) {
                connectionDataSource.releaseConnectionPool(clientConnect);
                if (err) {
                    customlog.error(err);
                    callback(resultSet, fileLocation);
                } else {
                    var groupLedgerResult = resultSet[0];
                    var row_size = groupLedgerResult.length + 5;
                    var report_index = 0, rowvalue = parseInt(4), summary_result_set_index = 0;
                    if (reportPageName == "groupLedgerInterestReport") {
                        var report_sheet = workbook.createSheet('group_ledger_interest_report', 15, parseInt(row_size));
                    } else {
                        var report_sheet = workbook.createSheet('group_ledger_report', 15, parseInt(row_size));
                    }
                    var report_sheet_array = new Array('S.No', 'Office', 'Customer', 'Account No', 'Loan Officer', 'Loan Product', 'Category Name', 'Opening Bal', 'Debit', 'Credit', 'Closing Bal');
                    var summary_sheet = workbook.createSheet('summary_report', 15, parseInt(300));
                    var summary_sheet_array = new Array('S.No', 'Office', 'Loan Officer', 'Total Accounts', 'Total Credit', 'Total Debit', 'Total Opening Bal', 'Total Closing Bal');
                    var heading = "Group Ledger Report from " + startDate + " to " + endDate;

                    self.excelUtility.setAlignmentForHeader(report_sheet, 2, 12, 4, new Array(10, 25, 40, 25, 30, 20, 25, 15, 15, 15, 15), report_sheet_array, heading, function (sheet_result) {
                        for (var i in groupLedgerResult) {
                            if (groupLedgerResult[i].account_id != null) {
                                rowvalue = rowvalue + 1;
                                report_sheet = sheet_result;
                                report_sheet.set(2, rowvalue, parseInt(report_index) + 1);
                                report_sheet.set(3, rowvalue, groupLedgerResult[i].office);
                                report_sheet.set(4, rowvalue, groupLedgerResult[i].customer);
                                report_sheet.set(5, rowvalue, groupLedgerResult[i].account_num);
                                report_sheet.set(6, rowvalue, groupLedgerResult[i].field_officer);
                                report_sheet.set(7, rowvalue, groupLedgerResult[i].loan_product);
                                report_sheet.set(8, rowvalue, groupLedgerResult[i].category_name);
                                report_sheet.set(9, rowvalue, groupLedgerResult[i].opening_balance, 'number');
                                report_sheet.set(10, rowvalue, groupLedgerResult[i].debit, 'number');
                                report_sheet.set(11, rowvalue, groupLedgerResult[i].credit, 'number');
                                report_sheet.set(12, rowvalue, groupLedgerResult[i].closing_balance, 'number');
                                report_index++;
                                self.excelUtility.setBorderAndAlignForCell(report_sheet, 2, 12, rowvalue, new Array(9, 10, 11, 12), new Array(2, 8), function (sheet) {
                                    report_sheet = sheet;
                                });
                            } else {
                                summary_result_set[summary_result_set_index] = groupLedgerResult[i];
                                summary_result_set_index++;
                            }
                        }
                    });

                    self.excelUtility.summaryGenerateReportWithCreditDebit(summary_sheet, summary_result_set, summary_sheet_array, "opening_closing", "Summary Report from " + startDate + " to " + endDate, function (sheet) {
                        summary_sheet = sheet;
                    });

                    fileLocation = rootPath+'/documents/report_documents/' + dynamic_file_name;
                    workbook.save(function (err) {
                        if (err) {
                            workbook.cancel();
                            callback(groupLedgerResult, fileLocation);
                        } else {
                            customlog.info('group_ledger_report created');
                            callback(groupLedgerResult, fileLocation);
                        }
                    });
                }
            });
        });
    },

    // Method for Bank Book Report
    bankBookReportDatamodel: function (finYearId,tenantId, officeId, startDate, endDate,selected_ledger_name,selected_ledger_id, mfiOperation, accOperation, userId, callback) {
        var excel = require('msexcel-builder');
        var self = this;
        var currentDate = new Date();
        var date_value = currentDate.getDate() + "_" + currentDate.getMonth() + 1 + "_" + currentDate.getFullYear() + "_" + currentDate.getHours() + "_" + currentDate.getSeconds();
        var fileLocation = '', summary_result_set = new Array();
        var acc_flag = "", mfi_flag = "";

        var dynamic_file_name = "bank_book_report_" + date_value + ".xlsx";
        var workbook = excel.createWorkbook(rootPath+'/documents/report_documents/', dynamic_file_name);
        if (accOperation == "on") {
            acc_flag = "accounting"
        }
        if (mfiOperation == "on") {
            mfi_flag = "mfi"
        }
        var group_query = "CALL `sp_bank_book`("+finYearId+",'" + startDate + "','" + endDate + "',-1," + selected_ledger_id + ",'" + mfi_flag + "','" + acc_flag + "'," + userId + ")";
        //var group_query = "CALL `sp_bank_book`('" + startDate + "','" + endDate + "',-1," + selected_ledger_id +")";
        var beforeDate = new Date();
        customlog.info("Before Execute Query " + beforeDate.getHours() + "_" + beforeDate.getMinutes() + "_" + beforeDate.getSeconds() + "_" + beforeDate.getMilliseconds());
        connectionDataSource.getConnection(function (clientConnect) {
            clientConnect.query(group_query, function selectCb(err, resultSet, fields) {
                connectionDataSource.releaseConnectionPool(clientConnect);
                if (err) {
                    customlog.error(err);
                    callback(resultSet, fileLocation);
                } else {
                    var bankBookResult = resultSet[0];
                    var afterDate = new Date();
                    customlog.info("After Execute Query " + afterDate.getHours() + "_" + afterDate.getMinutes() + "_" + afterDate.getSeconds() + "_" + afterDate.getMilliseconds());
                    var row_size = bankBookResult.length + 20;
                    var report_index = 0, rowvalue = parseInt(6), summary_result_set_index = 0;
                    var report_sheet = workbook.createSheet('bank_book_report', 15, parseInt(row_size));
                    var report_sheet_array = new Array('S.No', 'Office', 'Customer', 'Payment Date', 'Ledger', 'Narration', 'Transaction Type', 'Cheque No.', 'Voucher No', 'Debit', 'Credit', 'Closing Bal');
                    var heading = "Bank Book Report from " + startDate + " to " + endDate + "      Ledger Name :" + selected_ledger_name + " ";
                    var total_debit = 0;
                    var total_credit = 0;

                    self.excelUtility.setAlignmentForHeader(report_sheet, 2, 13, 6, new Array(10, 25, 40, 15, 25, 40, 15, 15, 15, 15, 15, 15), report_sheet_array, heading, function (sheet_result) {
                        for (var i in bankBookResult) {
                            if (bankBookResult[i].id != null) {
                                rowvalue = rowvalue + 1;
                                total_credit = parseInt(total_credit) + parseInt(bankBookResult[i].credit);
                                total_debit = parseInt(total_debit) + parseInt(bankBookResult[i].debit);
                                report_sheet = sheet_result;
                                report_sheet.set(2, rowvalue, parseInt(report_index) + 1);
                                report_sheet.set(3, rowvalue, bankBookResult[i].office);
                                report_sheet.set(4, rowvalue, bankBookResult[i].customer);
                                report_sheet.set(5, rowvalue, bankBookResult[i].payment_date);
                                report_sheet.set(6, rowvalue, bankBookResult[i].ledger);
                                report_sheet.set(7, rowvalue, bankBookResult[i].narration);
                                report_sheet.set(8, rowvalue, bankBookResult[i].transaction_type);
                                report_sheet.set(9, rowvalue, bankBookResult[i].cheque_number);
                                report_sheet.set(10, rowvalue, bankBookResult[i].voucher_number);
                                report_sheet.set(11, rowvalue, bankBookResult[i].debit, 'number');
                                report_sheet.set(12, rowvalue, bankBookResult[i].credit, 'number');
                                report_sheet.set(13, rowvalue, bankBookResult[i].closing_balance, 'number');
                                report_index++;
                                self.excelUtility.setBorderAndAlignForCell(report_sheet, 2, 13, rowvalue, new Array(11, 12, 13), new Array(2, 5, 8, 9), function (sheet) {
                                    report_sheet = sheet;
                                });
                            }
                        }
                        if (bankBookResult.length != 0) {
                            // For Opening and Closing Balance
                            var last_closing_bal = bankBookResult[bankBookResult.length - 1].closing_balance;
                            bankBookResult['opening_balance'] = bankBookResult[0].opening_balance;
                            bankBookResult['closing_balance'] = last_closing_bal;
                            bankBookResult['total_debit'] = total_debit;
                            bankBookResult['total_credit'] = total_credit;
                            self.excelUtility.setOpeningAndClosingBalance(report_sheet, bankBookResult[0].opening_balance, last_closing_bal, rowvalue + 1, total_debit, total_credit, function (sheet) {
                                report_sheet = sheet;
                            });
                        }
                    });

                    fileLocation = rootPath+'/documents/report_documents/' + dynamic_file_name;
                    workbook.save(function (err) {
                        if (err) {
                            workbook.cancel();
                            callback(bankBookResult, fileLocation);
                        } else {
                            customlog.info('Bank Book Report Exported');
                            callback(bankBookResult, fileLocation);
                        }
                    });
                }
            });
        });
    },

    // Method for Cash Book Report
    cashBookReportDatamodel: function (finYearId,tenantId, officeId, startDate, endDate, selected_ledger_name, selected_ledger_id, mfiOperation, accOperation, userId, callback) {
        var excel = require('msexcel-builder');
        var self = this;
        var currentDate = new Date();
        var date_value = currentDate.getDate() + "_" + currentDate.getMonth() + 1 + "_" + currentDate.getFullYear() + "_" + currentDate.getHours() + "_" + currentDate.getSeconds();
        var fileLocation = '', summary_result_set = new Array();
        var acc_flag = "", mfi_flag = "";
        var dynamic_file_name = "cash_book_report_" + date_value + ".xlsx";
        var workbook = excel.createWorkbook(rootPath+'/documents/report_documents/', dynamic_file_name);

        if (accOperation == "on") {
            acc_flag = "accounting"
        }
        if (mfiOperation == "on") {
            mfi_flag = "mfi"
        }
        var group_query = "CALL `sp_cash_book`("+finYearId+",'" + startDate + "','" + endDate + "',-1," + selected_ledger_id + ",'" + mfi_flag + "','" + acc_flag + "'," + userId + ")";
        connectionDataSource.getConnection(function (clientConnect) {
            clientConnect.query(group_query, function selectCb(err, resultSet, fields) {
                connectionDataSource.releaseConnectionPool(clientConnect);
                if (err) {
                    customlog.error(err);
                    callback(resultSet, fileLocation);
                } else {
                    var cashBookResult = resultSet[0];
                    var row_size = cashBookResult.length + 20;
                    var report_index = 0, rowvalue = parseInt(6), summary_result_set_index = 0;
                    var report_sheet = workbook.createSheet('cash_book_report', 15, parseInt(row_size));
                    var report_sheet_array = new Array('S.No', 'Office', 'Customer', 'Payment Date', 'Ledger', 'Narration', 'Transaction Type', 'Receipt No.', 'Voucher No', 'Debit', 'Credit', 'Closing Bal');
                    var heading = "Cash Book Report from " + startDate + " to " + endDate + "     Ledger Name : " + selected_ledger_name + " ";
                    var total_debit = 0;
                    var total_credit = 0;

                    self.excelUtility.setAlignmentForHeader(report_sheet, 2, 13, 6, new Array(10, 25, 40, 15, 30, 40, 15, 15, 15, 15, 15, 15), report_sheet_array, heading, function (sheet_result) {
                        for (var i in cashBookResult) {
                            if (cashBookResult[i].id != null) {
                                rowvalue = rowvalue + 1;
                                report_sheet = sheet_result;
                                total_credit = parseInt(total_credit) + parseInt(cashBookResult[i].credit);
                                total_debit = parseInt(total_debit) + parseInt(cashBookResult[i].debit);
                                report_sheet.set(2, rowvalue, parseInt(report_index) + 1);
                                report_sheet.set(3, rowvalue, cashBookResult[i].office);
                                report_sheet.set(4, rowvalue, cashBookResult[i].customer);
                                report_sheet.set(5, rowvalue, cashBookResult[i].payment_date);
                                report_sheet.set(6, rowvalue, cashBookResult[i].ledger);
                                report_sheet.set(7, rowvalue, cashBookResult[i].narration);
                                report_sheet.set(8, rowvalue, cashBookResult[i].transaction_type);
                                report_sheet.set(9, rowvalue, cashBookResult[i].receipt_num);
                                report_sheet.set(10, rowvalue, cashBookResult[i].voucher_number);
                                report_sheet.set(11, rowvalue, cashBookResult[i].debit, 'number');
                                report_sheet.set(12, rowvalue, cashBookResult[i].credit, 'number');
                                report_sheet.set(13, rowvalue, cashBookResult[i].closing_balance, 'number');
                                report_index++;
                                self.excelUtility.setBorderAndAlignForCell(report_sheet, 2, 13, rowvalue, new Array(11, 12, 13), new Array(2, 5, 8), function (sheet) {
                                    report_sheet = sheet;
                                });
                            }
                        }
                        if (cashBookResult.length != 0) {
                            // For Opening and Closing Balance
                            var last_closing_bal = cashBookResult[cashBookResult.length - 1].closing_balance;
                            cashBookResult['opening_balance'] = cashBookResult[0].opening_balance;
                            cashBookResult['closing_balance'] = last_closing_bal;
                            cashBookResult['total_debit'] = total_debit;
                            cashBookResult['total_credit'] = total_credit;
                            self.excelUtility.setOpeningAndClosingBalance(report_sheet, cashBookResult[0].opening_balance, last_closing_bal, rowvalue + 1, total_debit, total_credit, function (sheet) {
                                report_sheet = sheet;
                            });
                        }
                    });
                    fileLocation = rootPath+'/documents/report_documents/' + dynamic_file_name;
                    workbook.save(function (err) {
                        if (err) {
                            workbook.cancel();
                            callback(cashBookResult, fileLocation);
                        } else {
                            customlog.info('Cash Book Report Exported');
                            callback(cashBookResult, fileLocation);
                        }
                    });
                }
            });
        });
    },

    // Method for  profitLossReport
    profitLossReportDatamodel: function (tenantId, officeId, startDate, endDate, finYearId, userId, callback) {
        var excel = require('msexcel-builder');
        var self = this;
        var currentDate = new Date();
        var date_value = currentDate.getDate() + "_" + currentDate.getMonth() + 1 + "_" + currentDate.getFullYear() + "_" + currentDate.getHours() + "_" + currentDate.getSeconds();
        var fileLocation = '', summary_result_set = new Array();

        var dynamic_file_name = "profit_loss_report_" + date_value + ".xlsx";
        var workbook = excel.createWorkbook(rootPath+'/documents/report_documents/', dynamic_file_name);
        var group_query = "CALL `sp_profit_n_loss`('" + finYearId + "',' " + startDate + "','" + endDate + "'," + officeId + ")";
        connectionDataSource.getConnection(function (clientConnect) {
            clientConnect.query(group_query, function selectCb(err, resultSet, fields) {
                connectionDataSource.releaseConnectionPool(clientConnect);
                if (err) {
                    customlog.error(err);
                    callback(resultSet, fileLocation);
                } else {
                    var profitLossResult =resultSet[0];
                    var row_size = profitLossResult.length + 5;
                    var report_index = 0, rowvalue = parseInt(4), summary_result_set_index = 0;
                    var report_sheet = workbook.createSheet('profit_loss_report', 15, parseInt(row_size));
                    var report_sheet_array = new Array('S.No', 'GL Code', 'GL Name', 'Income', 'Expense');
                    var total_income = 0, total_expense = 0;
                    var heading = "Profit And Loss Report from " + startDate + " to " + endDate;

                    self.excelUtility.setAlignmentForHeader(report_sheet, 2, 6, 4, new Array(10, 20, 40, 20, 20), report_sheet_array, heading, function (sheet_result) {
                        for (var i in profitLossResult) {
                            rowvalue = rowvalue + 1;
                            report_sheet = sheet_result;
                            total_income = parseInt(total_income) + parseInt(profitLossResult[i].income);
                            total_expense = parseInt(total_expense) + parseInt(profitLossResult[i].expense);
                            report_sheet.set(2, rowvalue, parseInt(report_index) + 1);
                            report_sheet.set(3, rowvalue, profitLossResult[i].glcode_value);
                            report_sheet.set(4, rowvalue, profitLossResult[i].coa_name);
                            report_sheet.set(5, rowvalue, profitLossResult[i].income, 'number');
                            report_sheet.set(6, rowvalue, profitLossResult[i].expense, 'number');
                            report_index++;
                            self.excelUtility.setBorderAndAlignForCell(report_sheet, 2, 6, rowvalue, new Array(5, 6), new Array(0, 2), function (sheet) {
                                report_sheet = sheet;
                            });
                        }
                        report_sheet.set(4, rowvalue + 1, "Total :");
                        report_sheet.set(5, rowvalue + 1, total_income);
                        report_sheet.set(6, rowvalue + 1, total_expense);
                        report_sheet.font(4, rowvalue + 1, {bold: 'true'});
                        report_sheet.font(5, rowvalue + 1, {bold: 'true'});
                        report_sheet.font(6, rowvalue + 1, {bold: 'true'});
                    });
                    profitLossResult['total_income'] = total_income;
                    profitLossResult['total_expense'] = total_expense;
                    fileLocation = rootPath+'/documents/report_documents/' + dynamic_file_name;
                    workbook.save(function (err) {
                        if (err) {
                            workbook.cancel();
                            callback(profitLossResult, fileLocation);
                        } else {
                            customlog.info('profit_loss_report created');
                            callback(profitLossResult, fileLocation);
                        }
                    });
                }
            });
        });
    },

    // Method for   loanDisbursalReport
    loanDisbursalReportDatamodel: function (tenantId, officeId, startDate, endDate, selected_product_id, selected_category_id, selected_field_off_id, userId, callback) {
        var excel = require('msexcel-builder');
        var self = this;
        var currentDate = new Date();
        var date_value = currentDate.getDate() + "_" + currentDate.getMonth() + 1 + "_" + currentDate.getFullYear() + "_" + currentDate.getHours() + "_" + currentDate.getSeconds();
        var fileLocation = '', summary_result_set = new Array();

        var dynamic_file_name = "loan_disbursal_report_" + date_value + ".xlsx";
        var workbook = excel.createWorkbook(rootPath+'/documents/report_documents/', dynamic_file_name);
        var group_query = "CALL `sp_loan_disbursal`(' " + startDate + "','" + endDate + "'," + officeId + "," + selected_field_off_id + "," + selected_product_id + "," + selected_category_id + "," + userId + ")";
        connectionDataSource.getConnection(function (clientConnect) {
            clientConnect.query(group_query, function selectCb(err, resultSet, fields) {
                connectionDataSource.releaseConnectionPool(clientConnect);
                if (err) {
                    customlog.error(err);
                    callback(resultSet, fileLocation);
                } else {
                    var loanDisbursalResult = resultSet[0];
                    var row_size = loanDisbursalResult.length + 5;
                    var report_index = 0, rowvalue = parseInt(4), summary_result_set_index = 0;
                    var report_sheet = workbook.createSheet('loan_disbursal_report', 15, parseInt(row_size));
                    var report_sheet_array = new Array('S.No', 'Office', 'Group Code', 'Customer', 'Global Account No', 'Loan Product', 'Product Category', 'Field Officer', 'Loan Cycle', 'Payment Date', 'Mode of Payment', 'Amount', 'Receipt No');
                    var summary_sheet = workbook.createSheet('summary_report', 15, parseInt(300));
                    var summary_sheet_array = new Array('S.No', 'Office', 'Field Officer', 'Total Disb. Amt', 'Total Accounts');
                    var heading = "Loan Disbursal Report from " + startDate + " to " + endDate;

                    self.excelUtility.setAlignmentForHeader(report_sheet, 2, 14, 4, new Array(10, 20, 20, 40, 25, 25, 15, 30, 15, 10, 10, 15, 20), report_sheet_array, heading, function (sheet_result) {
                        for (var i in loanDisbursalResult) {
                            if (loanDisbursalResult[i].account_id != null) {
                                rowvalue = rowvalue + 1;
                                report_sheet = sheet_result;
                                report_sheet.set(2, rowvalue, parseInt(report_index) + 1);
                                report_sheet.set(3, rowvalue, loanDisbursalResult[i].office);
                                report_sheet.set(4, rowvalue, loanDisbursalResult[i].group_name);
                                report_sheet.set(5, rowvalue, loanDisbursalResult[i].customer);
                                report_sheet.set(6, rowvalue, loanDisbursalResult[i].global_account_num);
                                report_sheet.set(7, rowvalue, loanDisbursalResult[i].loan_product);
                                report_sheet.set(8, rowvalue, loanDisbursalResult[i].category_name);
                                report_sheet.set(9, rowvalue, loanDisbursalResult[i].field_officer);
                                report_sheet.set(10, rowvalue, loanDisbursalResult[i].loan_cycle);
                                report_sheet.set(11, rowvalue, loanDisbursalResult[i].payment_date);
                                report_sheet.set(12, rowvalue, loanDisbursalResult[i].mode_of_payment);
                                report_sheet.set(13, rowvalue, loanDisbursalResult[i].amount, 'number');
                                report_sheet.set(14, rowvalue, loanDisbursalResult[i].receipt_number);
                                report_index++;
                                self.excelUtility.setBorderAndAlignForCell(report_sheet, 2, 14, rowvalue, new Array(0, 11), new Array(2, 4, 8, 11, 14), function (sheet) {
                                    report_sheet = sheet;
                                });
                            } else {
                                summary_result_set[summary_result_set_index] = loanDisbursalResult[i];
                                summary_result_set_index++;
                            }
                        }
                    });

                    self.excelUtility.summaryGenerateReportWithAmt(summary_sheet, summary_result_set, summary_sheet_array, "", "Summary Report from " + startDate + " to " + endDate, function (sheet) {
                        summary_sheet = sheet;
                    });

                    fileLocation = rootPath+'/documents/report_documents/' + dynamic_file_name;
                    workbook.save(function (err) {
                        if (err) {
                            workbook.cancel();
                            callback(loanDisbursalResult, fileLocation);
                        } else {
                            customlog.info('loan_disbursal_report created');
                            callback(loanDisbursalResult, fileLocation);
                        }
                    });
                }
            });
        });
    },

    // Method for loanDisbursalSummaryReport
    loanDisbursalSummaryReportDatamodel: function (tenantId, officeId, startDate, endDate, selected_product_id, selected_category_id, selected_field_off_id, userId, callback) {
        var excel = require('msexcel-builder');
        var self = this;
        var currentDate = new Date();
        var date_value = currentDate.getDate() + "_" + currentDate.getMonth() + 1 + "_" + currentDate.getFullYear() + "_" + currentDate.getHours() + "_" + currentDate.getSeconds();
        var fileLocation = '', summary_result_set = new Array();

        var dynamic_file_name = "loan_disbursal_summary_report_" + date_value + ".xlsx";
        var workbook = excel.createWorkbook(rootPath+'/documents/report_documents/', dynamic_file_name);
        var group_query = "CALL `sp_loan_disbursal_summary`(' " + startDate + "','" + endDate + "'," + officeId + "," + selected_field_off_id + "," + selected_product_id + "," + selected_category_id + "," + userId + ")";
        connectionDataSource.getConnection(function (clientConnect) {
            clientConnect.query(group_query, function selectCb(err, resultSet, fields) {
                connectionDataSource.releaseConnectionPool(clientConnect);
                if (err) {
                    customlog.error(err);
                    callback(resultSet, fileLocation);
                } else {
                    var loanDisbursalSummaryResult = resultSet[0];
                    var row_size = loanDisbursalSummaryResult.length + 5;
                    var report_index = 0, rowvalue = parseInt(4), summary_result_set_index = 0;
                    var report_sheet = workbook.createSheet('loan_disbursal_summary_report', 15, parseInt(row_size));
                    var report_sheet_array = new Array('S.No', 'Office', 'Field Officer', 'Loan Product', 'Product Category', 'Year', 'Month', 'No.of Loans', 'Disb.Amt', 'Resch.Amt', 'Amount');
                    var summary_sheet = workbook.createSheet('summary_report', 15, parseInt(300));
                    var summary_sheet_array = new Array('S.No', 'Office', 'Field Officer', 'Total Disb. Amt', 'Total No.of Loans');
                    var heading = "Loan Disbursal Summary Report from " + startDate + " to " + endDate;

                    self.excelUtility.setAlignmentForHeader(report_sheet, 2, 12, 4, new Array(10, 20, 30, 25, 15, 15, 15, 15, 15, 15, 15), report_sheet_array, heading, function (sheet_result) {
                        for (var i in loanDisbursalSummaryResult) {
                            if (loanDisbursalSummaryResult[i].account_id != null) {
                                rowvalue = rowvalue + 1;
                                report_sheet = sheet_result;
                                report_sheet.set(2, rowvalue, parseInt(report_index) + 1);
                                report_sheet.set(3, rowvalue, loanDisbursalSummaryResult[i].office);
                                report_sheet.set(4, rowvalue, loanDisbursalSummaryResult[i].field_officer);
                                report_sheet.set(5, rowvalue, loanDisbursalSummaryResult[i].loan_product);
                                report_sheet.set(6, rowvalue, loanDisbursalSummaryResult[i].category_name);
                                report_sheet.set(7, rowvalue, loanDisbursalSummaryResult[i].YEAR);
                                report_sheet.set(8, rowvalue, loanDisbursalSummaryResult[i].MONTH);
                                report_sheet.set(9, rowvalue, loanDisbursalSummaryResult[i].no_of_loans, 'number');
                                report_sheet.set(10, rowvalue, loanDisbursalSummaryResult[i].disbursed_amount, 'number');
                                report_sheet.set(11, rowvalue, loanDisbursalSummaryResult[i].rescheduled_amount, 'number');
                                report_sheet.set(12, rowvalue, loanDisbursalSummaryResult[i].amount, 'number');
                                report_index++;
                                self.excelUtility.setBorderAndAlignForCell(report_sheet, 2, 12, rowvalue, new Array(10, 11, 12), new Array(2, 6, 7, 8, 9), function (sheet) {
                                    report_sheet = sheet;
                                });
                            } else {
                                summary_result_set[summary_result_set_index] = loanDisbursalSummaryResult[i];
                                summary_result_set_index++;
                            }
                        }
                    });

                    self.excelUtility.summaryGenerateReportWithAmt(summary_sheet, summary_result_set, summary_sheet_array, "total_loans_available_without_acc", "Summary Report from " + startDate + " to " + endDate, function (sheet) {
                        summary_sheet = sheet;
                    });

                    fileLocation = rootPath+'/documents/report_documents/' + dynamic_file_name;
                    workbook.save(function (err) {
                        if (err) {
                            workbook.cancel();
                            callback(loanDisbursalSummaryResult, fileLocation);
                        } else {
                            customlog.info('loan_disbursal_summary_report created');
                            callback(loanDisbursalSummaryResult, fileLocation);
                        }
                    });
                }
            });
        });
    },

    // Method for loanRepaymentReport
    loanRepaymentReportDatamodel: function (tenantId, officeId, startDate, endDate, selected_product_id, selected_category_id, selected_field_off_id, userId, callback) {
        var excel = require('msexcel-builder');
        var self = this;
        var currentDate = new Date();
        var date_value = currentDate.getDate() + "_" + currentDate.getMonth() + 1 + "_" + currentDate.getFullYear() + "_" + currentDate.getHours() + "_" + currentDate.getSeconds();
        var fileLocation = '', summary_result_set = new Array();

        var dynamic_file_name = "loan_repayment_report_" + date_value + ".xlsx";
        var workbook = excel.createWorkbook(rootPath+'/documents/report_documents/', dynamic_file_name);
        var group_query = "CALL `sp_loan_repayment`(' " + startDate + "','" + endDate + "'," + officeId + "," + selected_field_off_id + "," + selected_product_id + "," + selected_category_id + "," + userId + ")";
        connectionDataSource.getConnection(function (clientConnect) {
            clientConnect.query(group_query, function selectCb(err, resultSet, fields) {
                connectionDataSource.releaseConnectionPool(clientConnect);
                if (err) {
                    customlog.error(err);
                    callback(resultSet, fileLocation);
                } else {
                    var loanRepaymentResult = resultSet[0];
                    var row_size = loanRepaymentResult.length + 5;
                    var report_index = 0, rowvalue = parseInt(4), summary_result_set_index = 0;
                    var report_sheet = workbook.createSheet('loan_repayment_report', 15, parseInt(row_size));
                    var report_sheet_array = new Array('S.No', 'Office', 'Loan Officer', 'Payment Date', 'Customer', 'Global Account No', 'Loan Product', 'Product Category', 'Mode of Payment', 'Amount', 'Principal', 'Interest', 'Receipt No');
                    var summary_sheet = workbook.createSheet('summary_report', 15, parseInt(300));
                    var heading = "Loan Repayment Report from " + startDate + " to " + endDate;

                    self.excelUtility.setAlignmentForHeader(report_sheet, 2, 14, 4, new Array(10, 20, 30, 15, 40, 40, 25, 10, 15, 15, 15, 15, 15), report_sheet_array, heading, function (sheet_result) {
                        for (var i in loanRepaymentResult) {
                            if (loanRepaymentResult[i].account_id != null) {
                                rowvalue = rowvalue + 1;
                                report_sheet = sheet_result;
                                report_sheet.set(2, rowvalue, parseInt(report_index) + 1);
                                report_sheet.set(3, rowvalue, loanRepaymentResult[i].office);
                                report_sheet.set(4, rowvalue, loanRepaymentResult[i].field_officer);
                                report_sheet.set(5, rowvalue, loanRepaymentResult[i].payment_date);
                                report_sheet.set(6, rowvalue, loanRepaymentResult[i].customer);
                                report_sheet.set(7, rowvalue, loanRepaymentResult[i].global_account_num);
                                report_sheet.set(8, rowvalue, loanRepaymentResult[i].loan_product);
                                report_sheet.set(9, rowvalue, loanRepaymentResult[i].category_name);
                                report_sheet.set(10, rowvalue, loanRepaymentResult[i].mode_of_payment);
                                report_sheet.set(11, rowvalue, loanRepaymentResult[i].amount, 'number');
                                report_sheet.set(12, rowvalue, loanRepaymentResult[i].principal, 'number');
                                report_sheet.set(13, rowvalue, loanRepaymentResult[i].interest, 'number');
                                report_sheet.set(14, rowvalue, loanRepaymentResult[i].receipt_number);
                                report_index++;
                                self.excelUtility.setBorderAndAlignForCell(report_sheet, 2, 14, rowvalue, new Array(11, 12, 13), new Array(2, 5, 9, 10, 14), function (sheet) {
                                    report_sheet = sheet;
                                });
                            } else {
                                summary_result_set[summary_result_set_index] = loanRepaymentResult[i];
                                summary_result_set_index++;
                            }
                        }
                    });

                    self.excelUtility.summaryGenerateReportWithPrincipalInt(summary_sheet, summary_result_set, "Summary Report from " + startDate + " to " + endDate, function (sheet) {
                        summary_sheet = sheet;
                    });

                    fileLocation = rootPath+'/documents/report_documents/' + dynamic_file_name;
                    workbook.save(function (err) {
                        if (err) {
                            workbook.cancel();
                            callback(loanRepaymentResult, fileLocation);
                        } else {
                            customlog.info('loan_repayment_report created');
                            callback(loanRepaymentResult, fileLocation);
                        }
                    });
                }
            });
        });
    },

    // Method for loanRepaymentSummaryReport
    loanRepaymentSummaryReportDatamodel: function (tenantId, officeId, startDate, endDate, selected_product_id, selected_category_id, selected_field_off_id, userId, callback) {
        var excel = require('msexcel-builder');
        var self = this;
        var currentDate = new Date();
        var date_value = currentDate.getDate() + "_" + currentDate.getMonth() + 1 + "_" + currentDate.getFullYear() + "_" + currentDate.getHours() + "_" + currentDate.getSeconds();
        var fileLocation = '', summary_result_set = new Array();

        var dynamic_file_name = "loan_repayment_summary_report_" + date_value + ".xlsx";
        var workbook = excel.createWorkbook(rootPath+'/documents/report_documents/', dynamic_file_name);
        var group_query = "CALL `sp_loan_repayment_summary`(' " + startDate + "','" + endDate + "'," + officeId + "," + selected_field_off_id + "," + selected_product_id + "," + selected_category_id + "," + userId + ")";
        connectionDataSource.getConnection(function (clientConnect) {
            clientConnect.query(group_query, function selectCb(err, resultSet, fields) {
                connectionDataSource.releaseConnectionPool(clientConnect);
                if (err) {
                    customlog.error(err);
                    callback(resultSet, fileLocation);
                } else {
                    var loanRepaymentSummaryResult = resultSet[0];
                    var row_size = loanRepaymentSummaryResult.length + 5;
                    var report_index = 0, rowvalue = parseInt(4), summary_result_set_index = 0;
                    var report_sheet = workbook.createSheet('loan_repayment_summary_report', 15, parseInt(row_size));
                    var report_sheet_array = new Array('S.No', 'Office', 'Loan Officer', 'Loan Product', 'Product Category', 'Year', 'Month', 'Amount', 'Principal', 'Interest');
                    var summary_sheet = workbook.createSheet('summary_report', 15, parseInt(300));
                    var heading = "Loan Repayment Summary Report from " + startDate + " to " + endDate;

                    self.excelUtility.setAlignmentForHeader(report_sheet, 2, 11, 4, new Array(10, 20, 30, 25, 20, 10, 20, 20, 20, 20), report_sheet_array, heading, function (sheet_result) {
                        for (var i in loanRepaymentSummaryResult) {
                            if (loanRepaymentSummaryResult[i].account_id != null) {
                                rowvalue = rowvalue + 1;
                                report_sheet = sheet_result;
                                report_sheet.set(2, rowvalue, parseInt(report_index) + 1);
                                report_sheet.set(3, rowvalue, loanRepaymentSummaryResult[i].office);
                                report_sheet.set(4, rowvalue, loanRepaymentSummaryResult[i].field_officer);
                                report_sheet.set(5, rowvalue, loanRepaymentSummaryResult[i].loan_product);
                                report_sheet.set(6, rowvalue, loanRepaymentSummaryResult[i].category_name);
                                report_sheet.set(7, rowvalue, loanRepaymentSummaryResult[i].YEAR);
                                report_sheet.set(8, rowvalue, loanRepaymentSummaryResult[i].MONTH);
                                report_sheet.set(9, rowvalue, loanRepaymentSummaryResult[i].amount, 'number');
                                report_sheet.set(10, rowvalue, loanRepaymentSummaryResult[i].principal, 'number');
                                report_sheet.set(11, rowvalue, loanRepaymentSummaryResult[i].interest, 'number');
                                report_sheet.set(11, rowvalue, loanRepaymentSummaryResult[i].total_no_of_loans, 'number');
                                report_index++;
                                self.excelUtility.setBorderAndAlignForCell(report_sheet, 2, 11, rowvalue, new Array(9, 10, 11), new Array(2, 6, 7, 8), function (sheet) {
                                    report_sheet = sheet;
                                });
                            } else {
                                summary_result_set[summary_result_set_index] = loanRepaymentSummaryResult[i];
                                summary_result_set_index++;
                            }
                        }
                    });

                    self.excelUtility.summaryGenerateReportWithPrincipalInt(summary_sheet, summary_result_set, "Summary Report from " + startDate + " to " + endDate, function (sheet) {
                        summary_sheet = sheet;
                    });

                    fileLocation = rootPath+'/documents/report_documents/' + dynamic_file_name;
                    workbook.save(function (err) {
                        if (err) {
                            workbook.cancel();
                            callback(loanRepaymentSummaryResult, fileLocation);
                        } else {
                            customlog.info('loan_repayment_summary_report created');
                            callback(loanRepaymentSummaryResult, fileLocation);
                        }
                    });
                }
            });
        });
    },

    // Method for Loan Transaction Report
    loanTransactionReportDatamodel: function (tenantId, officeId, startDate, endDate, selected_product_id, selected_category_id, selected_field_off_id, userId, callback) {
        var excel = require('msexcel-builder');
        var self = this;
        var currentDate = new Date();
        var date_value = currentDate.getDate() + "_" + currentDate.getMonth() + 1 + "_" + currentDate.getFullYear() + "_" + currentDate.getHours() + "_" + currentDate.getSeconds();
        var fileLocation = '', summary_result_set = new Array();

        var dynamic_file_name = "loan_transaction_report_" + date_value + ".xlsx";
        var workbook = excel.createWorkbook(rootPath+'/documents/report_documents/', dynamic_file_name);
        var group_query = "CALL `sp_loan_transaction`(' " + startDate + "','" + endDate + "'," + officeId + "," + selected_field_off_id + "," + selected_product_id + "," + selected_category_id + "," + userId + ")";
        connectionDataSource.getConnection(function (clientConnect) {
            clientConnect.query(group_query, function selectCb(err, resultSet, fields) {
                connectionDataSource.releaseConnectionPool(clientConnect);
                if (err) {
                    customlog.error(err);
                    callback(resultSet, fileLocation);
                } else {
                    var loanTransactionResult = resultSet[0];
                    var row_size = loanTransactionResult.length + 5;
                    var report_index = 0, rowvalue = parseInt(4), summary_result_set_index = 0;
                    var report_sheet = workbook.createSheet('loan_transaction_report', 15, parseInt(row_size));
                    var report_sheet_array = new Array('S.No', 'Office', 'Customer', 'Loan Officer', 'Loan Product', 'Product Category', 'Global Account No', 'Mode of Payment', 'Action', 'Payment Date', 'Amount', 'Principal', 'Interest', 'Receipt No');
                    var summary_sheet = workbook.createSheet('summary_report', 15, parseInt(300));
                    var heading = "Loan Transaction Report from " + startDate + " to " + endDate;

                    self.excelUtility.setAlignmentForHeader(report_sheet, 2, 15, 4, new Array(10, 20, 40, 30, 25, 20, 20, 15, 20, 10, 15, 15, 15, 15), report_sheet_array, heading, function (sheet_result) {
                        for (var i in loanTransactionResult) {
                            if (loanTransactionResult[i].account_id != null) {
                                rowvalue = rowvalue + 1;
                                report_sheet = sheet_result;
                                report_sheet.set(2, rowvalue, parseInt(report_index) + 1);
                                report_sheet.set(3, rowvalue, loanTransactionResult[i].office);
                                report_sheet.set(4, rowvalue, loanTransactionResult[i].customer);
                                report_sheet.set(5, rowvalue, loanTransactionResult[i].field_officer);
                                report_sheet.set(6, rowvalue, loanTransactionResult[i].loan_product);
                                report_sheet.set(7, rowvalue, loanTransactionResult[i].category_name);
                                report_sheet.set(8, rowvalue, loanTransactionResult[i].global_account_num);
                                report_sheet.set(9, rowvalue, loanTransactionResult[i].mode_of_payment);
                                report_sheet.set(10, rowvalue, loanTransactionResult[i].ACTION);
                                report_sheet.set(11, rowvalue, loanTransactionResult[i].payment_date);
                                report_sheet.set(12, rowvalue, loanTransactionResult[i].amount, 'number');
                                report_sheet.set(13, rowvalue, loanTransactionResult[i].principal, 'number');
                                report_sheet.set(14, rowvalue, loanTransactionResult[i].interest, 'number');
                                report_sheet.set(15, rowvalue, loanTransactionResult[i].receipt_number);
                                report_index++;
                                self.excelUtility.setBorderAndAlignForCell(report_sheet, 2, 15, rowvalue, new Array(12, 13, 14), new Array(2, 7, 9, 11), function (sheet) {
                                    report_sheet = sheet;
                                });
                            } else {
                                summary_result_set[summary_result_set_index] = loanTransactionResult[i];
                                summary_result_set_index++;
                            }
                        }
                    });

                    self.excelUtility.summaryGenerateReportWithPrincipalInt(summary_sheet, summary_result_set, "Summary Report from " + startDate + " to " + endDate, function (sheet) {
                        summary_sheet = sheet;
                    });

                    fileLocation = rootPath+'/documents/report_documents/' + dynamic_file_name;
                    workbook.save(function (err) {
                        if (err) {
                            workbook.cancel();
                            callback(loanTransactionResult, fileLocation);
                        } else {
                            customlog.info('loan_transaction_report created');
                            callback(loanTransactionResult, fileLocation);
                        }
                    });
                }
            });
        });
    },

    // Method for LoanRescheduledReport
    loanRescheduledReportDatamodel: function (tenantId, officeId, startDate, endDate, selected_product_id, selected_category_id, selected_field_off_id, userId, callback) {
        var excel = require('msexcel-builder');
        var self = this;
        var currentDate = new Date();
        var date_value = currentDate.getDate() + "_" + currentDate.getMonth() + 1 + "_" + currentDate.getFullYear() + "_" + currentDate.getHours() + "_" + currentDate.getSeconds();
        var fileLocation = '', summary_result_set = new Array();

        var dynamic_file_name = "loan_rescheduled_report_" + date_value + ".xlsx";
        var workbook = excel.createWorkbook(rootPath+'/documents/report_documents/', dynamic_file_name);
        var group_query = "CALL `sp_loan_rescheduled`(' " + startDate + "','" + endDate + "'," + officeId + "," + selected_field_off_id + "," + selected_product_id + "," + selected_category_id + "," + userId + ")";
        connectionDataSource.getConnection(function (clientConnect) {
            clientConnect.query(group_query, function selectCb(err, resultSet, fields) {
                connectionDataSource.releaseConnectionPool(clientConnect);
                if (err) {
                    customlog.error(err);
                    callback(resultSet, fileLocation);
                } else {
                    var loanRescheduledResult = resultSet[0];
                    var row_size = loanRescheduledResult.length + 5;
                    var report_index = 0, rowvalue = parseInt(4), summary_result_set_index = 0;
                    var report_sheet = workbook.createSheet('loan_rescheduled_report', 15, parseInt(row_size));
                    var report_sheet_array = new Array('S.No', 'Office', 'Customer', 'Loan Officer', 'Loan Product', 'Product Category', 'Global Account No', 'Mode of Payment', 'Payment Date', 'Amount', 'Principal', 'Interest', 'Receipt No');
                    var summary_sheet = workbook.createSheet('summary_report', 15, parseInt(300));
                    var heading = "Loan Rescheduled Report from " + startDate + " to " + endDate;

                    self.excelUtility.setAlignmentForHeader(report_sheet, 2, 14, 4, new Array(10, 20, 40, 30, 25, 20, 20, 15, 20, 10, 15, 15, 15, 15), report_sheet_array, heading, function (sheet_result) {
                        for (var i in loanRescheduledResult) {
                            if (loanRescheduledResult[i].account_id != null) {
                                rowvalue = rowvalue + 1;
                                report_sheet = sheet_result;
                                report_sheet.set(2, rowvalue, parseInt(report_index) + 1);
                                report_sheet.set(3, rowvalue, loanRescheduledResult[i].office);
                                report_sheet.set(4, rowvalue, loanRescheduledResult[i].customer);
                                report_sheet.set(5, rowvalue, loanRescheduledResult[i].field_officer);
                                report_sheet.set(6, rowvalue, loanRescheduledResult[i].loan_product);
                                report_sheet.set(7, rowvalue, loanRescheduledResult[i].category_name);
                                report_sheet.set(8, rowvalue, loanRescheduledResult[i].global_account_num);
                                report_sheet.set(9, rowvalue, loanRescheduledResult[i].mode_of_payment);
                                report_sheet.set(10, rowvalue, loanRescheduledResult[i].payment_date);
                                report_sheet.set(11, rowvalue, loanRescheduledResult[i].amount, 'number');
                                report_sheet.set(12, rowvalue, loanRescheduledResult[i].principal, 'number');
                                report_sheet.set(13, rowvalue, loanRescheduledResult[i].interest, 'number');
                                report_sheet.set(14, rowvalue, loanRescheduledResult[i].receipt_number);
                                report_index++;
                                self.excelUtility.setBorderAndAlignForCell(report_sheet, 2, 14, rowvalue, new Array(11, 12, 13), new Array(2, 7, 9, 10), function (sheet) {
                                    report_sheet = sheet;
                                });
                            } else {
                                summary_result_set[summary_result_set_index] = loanRescheduledResult[i];
                                summary_result_set_index++;
                            }
                        }
                    });

                    self.excelUtility.summaryGenerateReportWithPrincipalInt(summary_sheet, summary_result_set, "Summary Report from " + startDate + " to " + endDate, function (sheet) {
                        summary_sheet = sheet;
                    });

                    fileLocation = rootPath+'/documents/report_documents/' + dynamic_file_name;
                    workbook.save(function (err) {
                        if (err) {
                            workbook.cancel();
                            callback(loanRescheduledResult, fileLocation);
                        } else {
                            customlog.info('loan_rescheduled_report created');
                            callback(loanRescheduledResult, fileLocation);
                        }
                    });
                }
            });
        });
    },

    // Method for LoanWrittenOffReport
    loanWrittenOffReportDatamodel: function (tenantId, officeId, startDate, endDate, selected_product_id, selected_category_id, selected_field_off_id, userId, callback) {
        var excel = require('msexcel-builder');
        var self = this;
        var currentDate = new Date();
        var date_value = currentDate.getDate() + "_" + currentDate.getMonth() + "_" + currentDate.getFullYear() + "_" + currentDate.getHours() + "_" + currentDate.getSeconds();
        var fileLocation = '', summary_result_set = new Array();

        var dynamic_file_name = "loan_writtenoff_report_" + date_value + ".xlsx";
        var workbook = excel.createWorkbook(rootPath+'/documents/report_documents/', dynamic_file_name);
        var group_query = "CALL `sp_loan_written_off`(' " + startDate + "','" + endDate + "'," + officeId + "," + selected_field_off_id + "," + selected_product_id + "," + selected_category_id + "," + userId + ")";
        connectionDataSource.getConnection(function (clientConnect) {
            clientConnect.query(group_query, function selectCb(err, resultSet, fields) {
                connectionDataSource.releaseConnectionPool(clientConnect);
                if (err) {
                    customlog.error(err);
                    callback(resultSet, fileLocation);
                } else {
                    var loanWrittenOffResult = resultSet[0];
                    var row_size = loanWrittenOffResult.length + 5;
                    var report_index = 0, rowvalue = parseInt(4), summary_result_set_index = 0;
                    var report_sheet = workbook.createSheet('loan_writtenoff_report', 15, parseInt(row_size));
                    var report_sheet_array = new Array('S.No', 'Office', 'Customer', 'Loan Officer', 'Loan Product', 'Product Category', 'Global Account No', 'Mode of Payment', 'Payment Date', 'Amount', 'Receipt No');
                    var summary_sheet = workbook.createSheet('summary_report', 15, parseInt(300));
                    var summary_sheet_array = new Array('S.No', 'Office', 'Field Officer', 'Total Amount', 'Total Accounts');
                    var heading = "Loan Written Off Report from " + startDate + " to " + endDate;

                    self.excelUtility.setAlignmentForHeader(report_sheet, 2, 12, 4, new Array(10, 20, 40, 30, 25, 20, 20, 15, 15, 15, 15), report_sheet_array, heading, function (sheet_result) {
                        for (var i in loanWrittenOffResult) {
                            if (loanWrittenOffResult[i].account_id != null) {
                                rowvalue = rowvalue + 1;
                                report_sheet = sheet_result;
                                report_sheet.set(2, rowvalue, parseInt(report_index) + 1);
                                report_sheet.set(3, rowvalue, loanWrittenOffResult[i].office);
                                report_sheet.set(4, rowvalue, loanWrittenOffResult[i].customer);
                                report_sheet.set(5, rowvalue, loanWrittenOffResult[i].field_officer);
                                report_sheet.set(6, rowvalue, loanWrittenOffResult[i].loan_product);
                                report_sheet.set(7, rowvalue, loanWrittenOffResult[i].category_name);
                                report_sheet.set(8, rowvalue, loanWrittenOffResult[i].global_account_num);
                                report_sheet.set(9, rowvalue, loanWrittenOffResult[i].mode_of_payment);
                                report_sheet.set(10, rowvalue, loanWrittenOffResult[i].payment_date);
                                report_sheet.set(11, rowvalue, loanWrittenOffResult[i].amount, 'number');
                                report_sheet.set(12, rowvalue, loanWrittenOffResult[i].receipt_number);
                                report_index++;
                                self.excelUtility.setBorderAndAlignForCell(report_sheet, 2, 12, rowvalue, new Array(0, 11), new Array(2, 7, 9, 10), function (sheet) {
                                    report_sheet = sheet;
                                });
                            } else {
                                summary_result_set[summary_result_set_index] = loanWrittenOffResult[i];
                                summary_result_set_index++;
                            }
                        }
                    });

                    self.excelUtility.summaryGenerateReportWithAmt(summary_sheet, summary_result_set, summary_sheet_array, "", "Summary Report from " + startDate + " to " + endDate, function (sheet) {
                        summary_sheet = sheet;
                    });

                    fileLocation = rootPath+'/documents/report_documents/' + dynamic_file_name;
                    workbook.save(function (err) {
                        if (err) {
                            workbook.cancel();
                            callback(loanWrittenOffResult, fileLocation);
                        } else {
                            customlog.info('loan_writtenoff_report created');
                            callback(loanWrittenOffResult, fileLocation);
                        }
                    });
                }
            });
        });
    },

    // Method for Active GM Report and Summary
    activeGMReportDatamodel: function (tenantId, officeId, startDate, endDate, customer, accountNo, selected_product_id, selected_category_id, selected_field_off_id, userId, callback) {
        var excel = require('msexcel-builder');
        var self = this;
        var currentDate = new Date();
        var date_value = currentDate.getDate() + "_" + currentDate.getMonth() + "_" + currentDate.getFullYear() + "_" + currentDate.getHours() + "_" + currentDate.getSeconds();
        var fileLocation = '', summary_result_set = new Array();

        var dynamic_file_name = "activeGroupMembers_report_" + date_value + ".xlsx";
        var workbook = excel.createWorkbook(rootPath+'/documents/report_documents/', dynamic_file_name);
        var group_query = "CALL `sp_active_groups_n_clients`(' " + startDate + "','" + endDate + "'," + officeId + ",'" + customer + "','" + accountNo + "'," + selected_field_off_id + "," + selected_product_id + "," + selected_category_id + "," + userId + ")";
        connectionDataSource.getConnection(function (clientConnect) {
            clientConnect.query(group_query, function selectCb(err, resultSet, fields) {
                connectionDataSource.releaseConnectionPool(clientConnect);
                if (err) {
                    customlog.error(err);
                    callback(resultSet, fileLocation);
                } else {
                    var activeGMResult = resultSet[0];
                    var row_size = activeGMResult.length + 5;
                    var report_index = 0, rowvalue = parseInt(4), summary_result_set_index = 0;
                    var report_sheet = workbook.createSheet('activeGroupMembers_report', 15, parseInt(row_size));
                    var report_sheet_array = new Array('S.No', 'Office', 'Customer', 'Loan Officer', 'Loan Product', 'Product Category', 'No.of Members');
                    var summary_sheet = workbook.createSheet('summary_report', 15, parseInt(300));
                    var summary_sheet_array = new Array('S.No', 'Office', 'Loan Officer', 'Active Groups', 'Active Clients');
                    var heading = "Active Groups and Members Report from " + startDate + " to " + endDate;

                    self.excelUtility.setAlignmentForHeader(report_sheet, 2, 8, 4, new Array(10, 20, 40, 40, 30, 25, 20), report_sheet_array, heading, function (sheet_result) {
                        for (var i in activeGMResult) {
                            if (activeGMResult[i].account_id != null) {
                                rowvalue = rowvalue + 1;
                                report_sheet = sheet_result;
                                report_sheet.set(2, rowvalue, parseInt(report_index) + 1);
                                report_sheet.set(3, rowvalue, activeGMResult[i].office);
                                report_sheet.set(4, rowvalue, activeGMResult[i].customer);
                                report_sheet.set(5, rowvalue, activeGMResult[i].field_officer);
                                report_sheet.set(6, rowvalue, activeGMResult[i].loan_product);
                                report_sheet.set(7, rowvalue, activeGMResult[i].category_name);
                                report_sheet.set(8, rowvalue, activeGMResult[i].no_of_members, 'number');
                                report_index++;
                                self.excelUtility.setBorderAndAlignForCell(report_sheet, 2, 8, rowvalue, new Array(), new Array(2, 7, 8), function (sheet) {
                                    report_sheet = sheet;
                                });
                            } else {
                                summary_result_set[summary_result_set_index] = activeGMResult[i];
                                summary_result_set_index++;
                            }
                        }
                    });

                    var rowvalue = parseInt(4);
                    var report_index = 0;
                    self.excelUtility.setAlignmentForHeader(summary_sheet, 2, 6, 4, new Array(10, 20, 35, 20, 20), summary_sheet_array, "Summary Report from " + startDate + " to " + endDate, function (sheet_result) {
                        for (var i in summary_result_set) {
                            summary_sheet = sheet_result;
                            if (summary_result_set[i].account_id == null && summary_result_set[i].office != null && summary_result_set[i].personnel_id != null) {
                                rowvalue = rowvalue + 1;
                                summary_sheet.set(2, rowvalue, parseInt(report_index) + 1);
                                summary_sheet.set(3, rowvalue, summary_result_set[i].office);
                                summary_sheet.set(4, rowvalue, summary_result_set[i].field_officer);
                                summary_sheet.set(5, rowvalue, summary_result_set[i].active_groups, 'number');
                                summary_sheet.set(6, rowvalue, summary_result_set[i].active_clients, 'number');
                                report_index++;
                            } else if (summary_result_set[i].account_id == null && summary_result_set[i].office == null ) {
                                rowvalue = rowvalue + 1;
                                summary_sheet.set(4, rowvalue, "Total :");
                                summary_sheet.align(4, rowvalue, 'right');
                                // set bold font for the columns
                                for (var col = 4; col <= 6; col++) {
                                    summary_sheet.font(col, rowvalue, {bold: 'true'});
                                }
                                summary_sheet.set(5, rowvalue, summary_result_set[i].active_groups, 'number');
                                summary_sheet.set(6, rowvalue, summary_result_set[i].active_clients, 'number');
                            }
                            self.excelUtility.setBorderAndAlignForCell(summary_sheet, 2, 6, rowvalue, new Array(), new Array(2, 5, 6), function (sheet) {
                                summary_sheet = sheet;
                            });
                        }
                    });

                    fileLocation = rootPath+'/documents/report_documents/' + dynamic_file_name;
                    workbook.save(function (err) {
                        if (err) {
                            workbook.cancel();
                            callback(activeGMResult, fileLocation);
                        } else {
                            customlog.info('activeGroupMembers_report created');
                            callback(activeGMResult, fileLocation);
                        }
                    });
                }
            });
        });
    },

    // Method for  createdGMSummaryReport
    createdGMSummaryReportDatamodel: function (tenantId, officeId, startDate, endDate, customer, accountNo, selected_field_off_id, userId, callback) {
        var excel = require('msexcel-builder');
        var self = this;
        var currentDate = new Date();
        var date_value = currentDate.getDate() + "_" + currentDate.getMonth() + "_" + currentDate.getFullYear() + "_" + currentDate.getHours() + "_" + currentDate.getSeconds();
        var fileLocation = '', summary_result_set = new Array();

        var dynamic_file_name = "createdGCReport_" + date_value + ".xlsx";
        var workbook = excel.createWorkbook(rootPath+'/documents/report_documents/', dynamic_file_name);
        var group_query = "CALL `sp_created_groups_n_clients_summary`(' " + startDate + "','" + endDate + "'," + officeId + ",'" + customer + "','" + accountNo + "'," + selected_field_off_id + "," + userId + ")";
        connectionDataSource.getConnection(function (clientConnect) {
            clientConnect.query(group_query, function selectCb(err, resultSet, fields) {
                connectionDataSource.releaseConnectionPool(clientConnect);
                if (err) {
                    customlog.error(err);
                    callback(resultSet, fileLocation);
                } else {
                    var createdGMSummaryResult = resultSet[0];
                    var row_size = createdGMSummaryResult.length + 5;
                    var report_index = 0, rowvalue = parseInt(4), summary_result_set_index = 0;
                    var report_sheet = workbook.createSheet('CreatedClientsGroups', 15, parseInt(row_size));
                    var report_sheet_array = new Array('S.No', 'Office', 'Field Officer', 'Group Id', 'Group Name', 'Member Id', 'Member Name', 'Created Date', 'Created Month', 'Created Year');
                    var summary_sheet = workbook.createSheet('summary_report', 15, parseInt(300));
                    var summary_sheet_array = new Array('S.No', 'Office', 'Field Officer', 'Total Created Groups', 'Total Created Members');
                    var heading = "Created Groups and Members Report from " + startDate + " to " + endDate;

                    self.excelUtility.setAlignmentForHeader(report_sheet, 2, 11, 4, new Array(10, 20, 30, 20, 40, 25, 35, 15, 15, 15), report_sheet_array, heading, function (sheet_result) {
                        for (var i in createdGMSummaryResult) {
                            report_sheet = sheet_result;
                            if (createdGMSummaryResult[i].account_id != null ) {
                                rowvalue = rowvalue + 1;
                                report_sheet.set(2, rowvalue, parseInt(report_index) + 1);
                                report_sheet.set(3, rowvalue, createdGMSummaryResult[i].office);
                                report_sheet.set(4, rowvalue, createdGMSummaryResult[i].field_officer);
                                report_sheet.set(5, rowvalue, createdGMSummaryResult[i].group_id);
                                report_sheet.set(6, rowvalue, createdGMSummaryResult[i].group_name);
                                report_sheet.set(7, rowvalue, createdGMSummaryResult[i].member_id);
                                report_sheet.set(8, rowvalue, createdGMSummaryResult[i].member_name);
                                report_sheet.set(9, rowvalue, createdGMSummaryResult[i].created_date);
                                report_sheet.set(10, rowvalue, createdGMSummaryResult[i].created_month);
                                report_sheet.set(11, rowvalue, createdGMSummaryResult[i].created_year);
                                report_index++
                                self.excelUtility.setBorderAndAlignForCell(report_sheet, 2, 11, rowvalue, new Array(), new Array(2, 9, 10, 11), function (sheet) {
                                    report_sheet = sheet;
                                });
                            } else {
                                summary_result_set[summary_result_set_index] = createdGMSummaryResult[i];
                                summary_result_set_index++;
                            }
                        }
                    });

                    rowvalue = parseInt(4);
                    report_index = 0;
                    self.excelUtility.setAlignmentForHeader(summary_sheet, 2, 6, 4, new Array(10, 20, 15, 20, 20), summary_sheet_array, "Summary Report from " + startDate + " to " + endDate, function (sheet_result) {
                        for (var i in summary_result_set) {
                            summary_sheet = sheet_result;
                            if (summary_result_set[i].account_id == null && summary_result_set[i].office_id != null && summary_result_set[i].personnel_id != null) {
                                rowvalue = rowvalue + 1;
                                summary_sheet.set(2, rowvalue, parseInt(report_index) + 1);
                                summary_sheet.set(3, rowvalue, summary_result_set[i].office);
                                summary_sheet.set(4, rowvalue, summary_result_set[i].field_officer);
                                summary_sheet.set(5, rowvalue, summary_result_set[i].total_groups, 'number');
                                summary_sheet.set(6, rowvalue, summary_result_set[i].total_clients, 'number');
                                report_index++;
                                self.excelUtility.setBorderAndAlignForCell(summary_sheet, 2, 6, rowvalue, new Array(), new Array(5, 6), function (sheet) {
                                    summary_sheet = sheet;
                                });
                            } else if (summary_result_set[i].account_id == null && summary_result_set[i].office_id == null ) {
                                rowvalue = rowvalue + 1;
                                summary_sheet.set(4, rowvalue, "Total :");
                                summary_sheet.set(5, rowvalue, summary_result_set[i].total_groups, 'number');
                                summary_sheet.set(6, rowvalue, summary_result_set[i].total_clients, 'number');
                                self.excelUtility.setBorderAndAlignForCell(summary_sheet, 2, 6, rowvalue, new Array(0, 4), new Array(5, 6), function (sheet) {
                                    summary_sheet = sheet;
                                });
                                // set bold font for the columns
                                for (var col = 4; col <= 6; col++) {
                                    summary_sheet.font(col, rowvalue, {bold: 'true'});
                                }
                            }
                        }
                    });
                    fileLocation = rootPath+'/documents/report_documents/' + dynamic_file_name;
                    workbook.save(function (err) {
                        if (err) {
                            workbook.cancel();
                            callback(createdGMSummaryResult, fileLocation);
                        } else {
                            customlog.info('createdGroupsMembersSummary_report created');
                            callback(createdGMSummaryResult, fileLocation);
                        }
                    });
                }
            });
        });
    },

    // Method for LoanAccountDefaultPaymentsReport
    loanAccountDefaultPaymentsReportDatamodel: function (tenantId, officeId, endDate, customer, accountNo, selected_product_id, selected_category_id, selected_field_off_id, reportPageName, userId, callback) {
        var excel = require('msexcel-builder');
        var self = this;
        var currentDate = new Date();
        var date_value = currentDate.getDate() + "_" + currentDate.getMonth() + "_" + currentDate.getFullYear() + "_" + currentDate.getHours() + "_" + currentDate.getSeconds();
        var summary_result_set = new Array(), fileLocation = "";

        var dynamic_file_name = "loan_acc_pmt_report_" + date_value + ".xlsx";
        var workbook = excel.createWorkbook(rootPath+'/documents/report_documents/', dynamic_file_name);
        var group_query = "CALL `sp_loan_account_default_payments`('" + endDate + "'," + officeId + ",'" + customer + "','" + accountNo + "'," + selected_field_off_id + "," + selected_product_id + "," + selected_category_id + "," + userId + ")";
        connectionDataSource.getConnection(function (clientConnect) {
            clientConnect.query(group_query, function selectCb(err, resultSet, fields) {
                connectionDataSource.releaseConnectionPool(clientConnect);
                if (err) {
                    customlog.error(err);
                    callback(resultSet, fileLocation);
                } else {
                    var loanAccountDefaultPaymentsResult = resultSet[0];
                    var row_size = loanAccountDefaultPaymentsResult.length + 5;
                    var report_index = 0, rowvalue = parseInt(4), summary_result_set_index = 0;
                    var report_sheet = workbook.createSheet('loan_acc_pmt_report', 15, parseInt(row_size));
                    var report_sheet_array = new Array('S.No', 'Office', 'Customer', 'Loan Officer', 'Loan Product', 'Product Category', 'Global Account No', 'Total Installments', 'No.of Installments Done', 'No.of Regular Payments', 'No.of Delayed Payments');
                    var summary_sheet = workbook.createSheet('summary_report', 15, parseInt(300));
                    var summary_sheet_array = new Array('S.No', 'Office', 'Loan Officer', 'Total Customers', 'Total Regular Payments', 'Total Delayed Payments');
                    var heading = "Loan Account Default Payments Report as on " + endDate;

                    self.excelUtility.setAlignmentForHeader(report_sheet, 2, 12, 4, new Array(10, 20, 40, 30, 25, 20, 20, 25, 15, 15, 15), report_sheet_array, heading, function (sheet_result) {
                        for (var i in loanAccountDefaultPaymentsResult) {
                            report_sheet = sheet_result;
                            if (loanAccountDefaultPaymentsResult[i].account_id != null) {
                                rowvalue = rowvalue + 1;
                                report_sheet.set(2, rowvalue, parseInt(report_index) + 1);
                                report_sheet.set(3, rowvalue, loanAccountDefaultPaymentsResult[i].office);
                                report_sheet.set(4, rowvalue, loanAccountDefaultPaymentsResult[i].customer);
                                report_sheet.set(5, rowvalue, loanAccountDefaultPaymentsResult[i].field_officer);
                                report_sheet.set(6, rowvalue, loanAccountDefaultPaymentsResult[i].loan_product);
                                report_sheet.set(7, rowvalue, loanAccountDefaultPaymentsResult[i].category_name);
                                report_sheet.set(8, rowvalue, loanAccountDefaultPaymentsResult[i].global_account_num);
                                report_sheet.set(9, rowvalue, loanAccountDefaultPaymentsResult[i].total_installments, 'number');
                                report_sheet.set(10, rowvalue, loanAccountDefaultPaymentsResult[i].no_of_installments_done, 'number');
                                report_sheet.set(11, rowvalue, loanAccountDefaultPaymentsResult[i].no_of_regular_payments, 'number');
                                report_sheet.set(12, rowvalue, loanAccountDefaultPaymentsResult[i].no_of_delayed_payments, 'number');
                                report_index++;
                                self.excelUtility.setBorderAndAlignForCell(report_sheet, 2, 12, rowvalue, new Array(), new Array(2, 7, 9, 10, 11, 12), function (sheet) {
                                    report_sheet = sheet;
                                });
                            } else {
                                summary_result_set[summary_result_set_index] = loanAccountDefaultPaymentsResult[i];
                                summary_result_set_index++;
                            }
                        }
                    });

                    rowvalue = parseInt(4);
                    report_index = 0;
                    self.excelUtility.setAlignmentForHeader(summary_sheet, 2, 7, 4, new Array(10, 20, 30, 15, 20, 20), summary_sheet_array, "Summary Report as on " + endDate, function (sheet_result) {
                        for (var i in summary_result_set) {
                            summary_sheet = sheet_result;
                            if (summary_result_set[i].account_id == null && summary_result_set[i].office != null && summary_result_set[i].personnel_id != null) {
                                rowvalue = rowvalue + 1;
                                summary_sheet.set(2, rowvalue, parseInt(report_index) + 1);
                                summary_sheet.set(3, rowvalue, summary_result_set[i].office);
                                summary_sheet.set(4, rowvalue, summary_result_set[i].field_officer);
                                summary_sheet.set(5, rowvalue, summary_result_set[i].total_accounts, 'number');
                                summary_sheet.set(6, rowvalue, summary_result_set[i].total_no_of_regular_payments, 'number');
                                summary_sheet.set(7, rowvalue, summary_result_set[i].total_no_of_regular_payments, 'number');
                                report_index++;
                            } else if (summary_result_set[i].account_id == null && summary_result_set[i].office == null) {
                                rowvalue = rowvalue + 1;
                                summary_sheet.set(4, rowvalue, "Total :");
                                summary_sheet.set(5, rowvalue, summary_result_set[i].total_accounts, 'number');
                                summary_sheet.set(6, rowvalue, summary_result_set[i].total_no_of_regular_payments, 'number');
                                summary_sheet.set(7, rowvalue, summary_result_set[i].total_no_of_delayed_payments, 'number');
                                // set bold font for the columns
                                for (var col = 4; col <= 7; col++) {
                                    summary_sheet.font(col, rowvalue, {bold: 'true'});
                                }
                            }
                            self.excelUtility.setBorderAndAlignForCell(summary_sheet, 2, 7, rowvalue, new Array(), new Array(2, 5, 6, 7), function (sheet) {
                                summary_sheet = sheet;
                            });
                        }
                    });

                    fileLocation = rootPath+'/documents/report_documents/' + dynamic_file_name;
                    workbook.save(function (err) {
                        if (err) {
                            workbook.cancel();
                            callback(loanAccountDefaultPaymentsResult, fileLocation);
                        } else {
                            customlog.info('AccountDefaultPaymentsReport created');
                            callback(loanAccountDefaultPaymentsResult, fileLocation);
                        }
                    });
                }
            });
        });
    },

    // Method for GroupAccountDefaultPaymentsReport
    groupAccountDefaultPaymentsReportDatamodel: function (tenantId, officeId, endDate, customer, accountNo, selected_product_id, selected_category_id, selected_field_off_id, reportPageName, userId, callback) {
        var excel = require('msexcel-builder');
        var self = this;
        var currentDate = new Date();
        var date_value = currentDate.getDate() + "_" + currentDate.getMonth() + "_" + currentDate.getFullYear() + "_" + currentDate.getHours() + "_" + currentDate.getSeconds();
        var summary_result_set = new Array(), fileLocation = "";

        var dynamic_file_name = "group_acc_pmt_report_" + date_value + ".xlsx";
        var workbook = excel.createWorkbook(rootPath+'/documents/report_documents/', dynamic_file_name);
        var group_query = "CALL `sp_group_account_default_payments`('" + endDate + "'," + officeId + ",'" + customer + "'," + selected_field_off_id + "," + selected_product_id + "," + selected_category_id + "," + userId + ")";
        connectionDataSource.getConnection(function (clientConnect) {
            clientConnect.query(group_query, function selectCb(err, resultSet, fields) {
                connectionDataSource.releaseConnectionPool(clientConnect);
                if (err) {
                    customlog.error(err);
                    callback(resultSet, fileLocation);
                } else {
                    var groupAccountDefaultPaymentsResult = resultSet[0];
                    var row_size = groupAccountDefaultPaymentsResult.length + 5;
                    var report_index = 0, rowvalue = parseInt(4), summary_result_set_index = 0;
                    var report_sheet = workbook.createSheet('group_acc_pmt_report', 15, parseInt(row_size));
                    var report_sheet_array = new Array('S.No', 'Office', 'Customer', 'Loan Officer', 'Loan Product', 'Product Category', 'Total Installments', 'No.of Installments Done', 'No.of Regular Payments', 'No.of Delayed Payments');
                    var summary_sheet = workbook.createSheet('summary_report', 15, parseInt(300));
                    var summary_sheet_array = new Array('S.No', 'Office', 'Loan Officer', 'Total Customers', 'Total Regular Payments', 'Total Delayed Payments');
                    var heading = "Group Account Default Payments Report as on " + endDate;

                    self.excelUtility.setAlignmentForHeader(report_sheet, 2, 11, 4, new Array(10, 20, 40, 30, 25, 20, 25, 15, 15, 15), report_sheet_array, heading, function (sheet_result) {
                        for (var i in groupAccountDefaultPaymentsResult) {
                            report_sheet = sheet_result;
                            if (groupAccountDefaultPaymentsResult[i].account_id != null) {
                                rowvalue = rowvalue + 1;
                                report_sheet.set(2, rowvalue, parseInt(report_index) + 1);
                                report_sheet.set(3, rowvalue, groupAccountDefaultPaymentsResult[i].office);
                                report_sheet.set(4, rowvalue, groupAccountDefaultPaymentsResult[i].customer);
                                report_sheet.set(5, rowvalue, groupAccountDefaultPaymentsResult[i].field_officer);
                                report_sheet.set(6, rowvalue, groupAccountDefaultPaymentsResult[i].loan_product);
                                report_sheet.set(7, rowvalue, groupAccountDefaultPaymentsResult[i].category_name);
                                report_sheet.set(8, rowvalue, groupAccountDefaultPaymentsResult[i].total_installments, 'number');
                                report_sheet.set(9, rowvalue, groupAccountDefaultPaymentsResult[i].no_of_installments_done, 'number');
                                report_sheet.set(10, rowvalue, groupAccountDefaultPaymentsResult[i].no_of_regular_payments, 'number');
                                report_sheet.set(11, rowvalue, groupAccountDefaultPaymentsResult[i].no_of_delayed_payments, 'number');
                                report_index++;
                                self.excelUtility.setBorderAndAlignForCell(report_sheet, 2, 11, rowvalue, new Array(), new Array(2, 5, 6, 7, 8), function (sheet) {
                                    report_sheet = sheet;
                                });
                            } else {
                                summary_result_set[summary_result_set_index] = groupAccountDefaultPaymentsResult[i];
                                summary_result_set_index++;
                            }
                        }
                    });

                    rowvalue = parseInt(4);
                    report_index = 0;
                    self.excelUtility.setAlignmentForHeader(summary_sheet, 2, 7, 4, new Array(10, 20, 30, 15, 20, 20), summary_sheet_array, "Summary Report as on " + endDate, function (sheet_result) {
                        for (var i in summary_result_set) {
                            summary_sheet = sheet_result;
                            if (summary_result_set[i].account_id == null && summary_result_set[i].office != null && summary_result_set[i].personnel_id != null) {
                                rowvalue = rowvalue + 1;
                                summary_sheet.set(2, rowvalue, parseInt(report_index) + 1);
                                summary_sheet.set(3, rowvalue, summary_result_set[i].office);
                                summary_sheet.set(4, rowvalue, summary_result_set[i].field_officer);
                                summary_sheet.set(5, rowvalue, summary_result_set[i].total_customers, 'number');
                                summary_sheet.set(6, rowvalue, summary_result_set[i].total_no_of_regular_payments, 'number');
                                summary_sheet.set(7, rowvalue, summary_result_set[i].total_no_of_delayed_payments, 'number');
                                report_index++;
                            } else if (summary_result_set[i].account_id == null && summary_result_set[i].office == null) {
                                rowvalue = rowvalue + 1;
                                summary_sheet.set(4, rowvalue, "Total :");
                                summary_sheet.set(5, rowvalue, summary_result_set[i].total_customers, 'number');
                                summary_sheet.set(6, rowvalue, summary_result_set[i].total_no_of_regular_payments, 'number');
                                summary_sheet.set(7, rowvalue, summary_result_set[i].total_no_of_delayed_payments, 'number');
                                // set bold font for the columns
                                for (var col = 4; col <= 7; col++) {
                                    summary_sheet.font(col, rowvalue, {bold: 'true'});
                                }
                            }
                            self.excelUtility.setBorderAndAlignForCell(summary_sheet, 2, 7, rowvalue, new Array(), new Array(2, 5, 6, 7), function (sheet) {
                                summary_sheet = sheet;
                            });
                        }
                    });

                    fileLocation = rootPath+'/documents/report_documents/' + dynamic_file_name;
                    workbook.save(function (err) {
                        if (err) {
                            workbook.cancel();
                            callback(groupAccountDefaultPaymentsResult, fileLocation);
                        } else {
                            customlog.info('AccountDefaultPaymentsReport created');
                            callback(groupAccountDefaultPaymentsResult, fileLocation);
                        }
                    });
                }
            });
        });
    },

    // Method for ClosedAccountReport
    closedAccountsReportDatamodel: function (tenantId, officeId, startDate, endDate, selected_product_id, selected_category_id, selected_field_off_id, userId, callback) {
        var currentDate = new Date();
        var date_value = currentDate.getDate() + "_" + currentDate.getMonth() + "_" + currentDate.getFullYear() + "_" + currentDate.getHours() + "_" + currentDate.getSeconds();
        var excel = require('msexcel-builder');
        var self = this, fileLocation = '';
        var fileLocation = '';
        var summary_result_set = new Array();

        var dynamic_file_name = "closed_acc_report_" + date_value + ".xlsx";
        var workbook = excel.createWorkbook(rootPath+'/documents/report_documents/', dynamic_file_name);
        var group_query = "CALL `sp_closed_accounts`(' " + startDate + "','" + endDate + "'," + officeId + "," + selected_field_off_id + "," + selected_product_id + "," + selected_category_id + "," + userId + ")";
        connectionDataSource.getConnection(function (clientConnect) {
            clientConnect.query(group_query, function selectCb(err, resultSet, fields) {
                connectionDataSource.releaseConnectionPool(clientConnect);
                if (err) {
                    customlog.error(err);
                    callback(resultSet, fileLocation);
                } else {
                    var closedAccountsResult = resultSet[0];
                    var row_size = closedAccountsResult.length + 5;
                    var report_index = 0, rowvalue = parseInt(4), summary_result_set_index = 0;

                    var report_sheet = workbook.createSheet('closed_acc_report', 15, parseInt(row_size));
                    var report_sheet_array = new Array('S.No', 'Office', 'Customer', 'Global Account No', 'Loan Product', 'Category Name', 'Field Officer', 'Loan Amount', 'Disbursement Date', 'No.of Clients');
                    var summary_sheet = workbook.createSheet('summary', 15, parseInt(300));
                    var summary_sheet_array = new Array('S.No', 'Office', 'Field Officer', 'Total Customers', 'Total Loan Amt');
                    var heading = "Closed Accounts Report from " + startDate + " to " + endDate;

                    self.excelUtility.setAlignmentForHeader(report_sheet, 2, 11, 4, new Array(10, 20, 40, 20, 25, 20, 30, 15, 20, 15), report_sheet_array, heading, function (sheet_result) {
                        for (var i in closedAccountsResult) {
                            if (closedAccountsResult[i].account_id != null) {
                                rowvalue = rowvalue + 1;
                                report_sheet = sheet_result;
                                report_sheet.set(2, rowvalue, parseInt(report_index) + 1);
                                report_sheet.set(3, rowvalue, closedAccountsResult[i].office);
                                report_sheet.set(4, rowvalue, closedAccountsResult[i].customer_name);
                                report_sheet.set(5, rowvalue, closedAccountsResult[i].global_account_num);
                                report_sheet.set(6, rowvalue, closedAccountsResult[i].loan_product);
                                report_sheet.set(7, rowvalue, closedAccountsResult[i].category_name);
                                report_sheet.set(8, rowvalue, closedAccountsResult[i].field_officer);
                                report_sheet.set(9, rowvalue, closedAccountsResult[i].loan_amt, 'number');
                                report_sheet.set(10, rowvalue, closedAccountsResult[i].disbursement_date);
                                report_sheet.set(11, rowvalue, closedAccountsResult[i].no_of_clients, 'number');
                                report_index++;
                                self.excelUtility.setBorderAndAlignForCell(report_sheet, 2, 11, rowvalue, new Array(0, 9), new Array(2, 7, 10), function (sheet) {
                                    report_sheet = sheet;
                                });
                            } else {
                                summary_result_set[summary_result_set_index] = closedAccountsResult[i];
                                summary_result_set_index++;
                            }
                        }
                    });

                    rowvalue = parseInt(4);
                    report_index = 0;
                    self.excelUtility.setAlignmentForHeader(summary_sheet, 2, 6, 4, new Array(10, 20, 30, 15, 20), summary_sheet_array, "Summary Report from " + startDate + " to " + endDate, function (sheet_result) {
                        for (var i in summary_result_set) {
                            summary_sheet = sheet_result;
                            if (summary_result_set[i].account_id == null && summary_result_set[i].office != null && summary_result_set[i].personnel_id != null) {
                                rowvalue = rowvalue + 1;
                                summary_sheet.set(2, rowvalue, parseInt(report_index) + 1);
                                summary_sheet.set(3, rowvalue, summary_result_set[i].office);
                                summary_sheet.set(4, rowvalue, summary_result_set[i].field_officer);
                                summary_sheet.set(5, rowvalue, summary_result_set[i].total_customers, 'number');
                                summary_sheet.set(6, rowvalue, summary_result_set[i].total_loan_amt, 'number');
                                report_index++;
                            } else if (summary_result_set[i].account_id == null && summary_result_set[i].office == null) {
                                rowvalue = rowvalue + 1;
                                summary_sheet.set(4, rowvalue, "Total :");
                                summary_sheet.align(4, rowvalue, 'right');
                                summary_sheet.set(5, rowvalue, summary_result_set[i].total_customers, 'number');
                                summary_sheet.set(6, rowvalue, summary_result_set[i].total_loan_amt, 'number');
                                // set bold font for the columns
                                for (var col = 4; col <= 6; col++) {
                                    summary_sheet.font(col, rowvalue, {bold: 'true'});
                                }
                            }
                            self.excelUtility.setBorderAndAlignForCell(summary_sheet, 2, 6, rowvalue, new Array(0, 6), new Array(2, 5), function (sheet) {
                                summary_sheet = sheet;
                            });
                        }
                    });

                    fileLocation = rootPath+'/documents/report_documents/' + dynamic_file_name;
                    workbook.save(function (err) {
                        if (err) {
                            workbook.cancel();
                            callback(closedAccountsResult, fileLocation);
                        } else {
                            customlog.info('closed_accounts_report created');
                            callback(closedAccountsResult, fileLocation);
                        }
                    });
                }
            });
        });
    },

    // Method for  createdGMSummaryReport
    delayedPaymentReportDatamodel: function (tenantId, officeId, startDate, endDate, customer, accountNo, selected_product_id, selected_category_id, selected_field_off_id, userId, callback) {
        var excel = require('msexcel-builder');
        var self = this;
        var currentDate = new Date();
        var date_value = currentDate.getDate() + "_" + currentDate.getMonth() + "_" + currentDate.getFullYear() + "_" + currentDate.getHours() + "_" + currentDate.getSeconds();
        var fileLocation = '', summary_result_set = new Array();

        var dynamic_file_name = "createdGCReport_" + date_value + ".xlsx";
        var workbook = excel.createWorkbook(rootPath+'/documents/report_documents/', dynamic_file_name);
        var group_query = "CALL `sp_delayed_payment`(' " + startDate + "','" + endDate + "'," + officeId + ",'" + customer + "','" + accountNo + "'," + selected_field_off_id + "," + selected_product_id + "," + selected_category_id + "," + userId + ")";
        connectionDataSource.getConnection(function (clientConnect) {
            clientConnect.query(group_query, function selectCb(err, resultSet, fields) {
                connectionDataSource.releaseConnectionPool(clientConnect);
                if (err) {
                    customlog.error(err);
                    callback(resultSet, fileLocation);
                } else {
                    var delayedPaymentResult = resultSet[0];
                    var row_size = delayedPaymentResult.length + 5;
                    var report_index = 0, rowvalue = parseInt(4), summary_result_set_index = 0;
                    var report_sheet = workbook.createSheet('CreatedClientsGroups', 15, parseInt(row_size));
                    var report_sheet_array = new Array('S.No', 'Office', 'Field Officer', 'Group Id', 'Group Name', 'Member Id', 'Member Name', 'Created Date', 'Created Month', 'Created Year');
                    var summary_sheet = workbook.createSheet('summary_report', 15, parseInt(300));
                    var summary_sheet_array = new Array('S.No', 'Office', 'Field Officer', 'Total Created Groups', 'Total Created Members');
                    var heading = "Created Groups and Members Report from " + startDate + " to " + endDate;

                    self.excelUtility.setAlignmentForHeader(report_sheet, 2, 11, 4, new Array(10, 20, 30, 20, 40, 25, 35, 15, 15, 15), report_sheet_array, heading, function (sheet_result) {
                        for (var i in delayedPaymentResult) {
                            report_sheet = sheet_result;
                            if (delayedPaymentResult[i].account_id != null && delayedPaymentResult[i].group_name != null && delayedPaymentResult[i].member_name != null) {
                                rowvalue = rowvalue + 1;
                                report_sheet.set(2, rowvalue, parseInt(report_index) + 1);
                                report_sheet.set(3, rowvalue, delayedPaymentResult[i].office);
                                report_sheet.set(4, rowvalue, delayedPaymentResult[i].field_officer);
                                report_sheet.set(5, rowvalue, delayedPaymentResult[i].group_id);
                                report_sheet.set(6, rowvalue, delayedPaymentResult[i].group_name);
                                report_sheet.set(7, rowvalue, delayedPaymentResult[i].member_id);
                                report_sheet.set(8, rowvalue, delayedPaymentResult[i].member_name);
                                report_sheet.set(9, rowvalue, delayedPaymentResult[i].created_date);
                                report_sheet.set(10, rowvalue, delayedPaymentResult[i].created_month);
                                report_sheet.set(11, rowvalue, delayedPaymentResult[i].created_year);
                                report_index++
                                self.excelUtility.setBorderAndAlignForCell(report_sheet, 2, 11, rowvalue, new Array(), new Array(2, 9, 10, 11), function (sheet) {
                                    report_sheet = sheet;
                                });
                            } else {
                                summary_result_set[summary_result_set_index] = delayedPaymentResult[i];
                                summary_result_set_index++;
                            }
                        }
                    });

                    rowvalue = parseInt(4);
                    report_index = 0;
                    self.excelUtility.setAlignmentForHeader(summary_sheet, 2, 6, 4, new Array(10, 20, 15, 20, 20), summary_sheet_array, "Summary Report from " + startDate + " to " + endDate, function (sheet_result) {
                        for (var i in summary_result_set) {
                            summary_sheet = sheet_result;
                            if (summary_result_set[i].account_id == null && summary_result_set[i].office_id != null && summary_result_set[i].personnel_id != null) {
                                rowvalue = rowvalue + 1;
                                summary_sheet.set(2, rowvalue, parseInt(report_index) + 1);
                                summary_sheet.set(3, rowvalue, summary_result_set[i].office);
                                summary_sheet.set(4, rowvalue, summary_result_set[i].field_officer);
                                summary_sheet.set(5, rowvalue, summary_result_set[i].total_groups, 'number');
                                summary_sheet.set(6, rowvalue, summary_result_set[i].total_clients, 'number');
                                report_index++;
                                self.excelUtility.setBorderAndAlignForCell(summary_sheet, 2, 6, rowvalue, new Array(), new Array(5, 6), function (sheet) {
                                    summary_sheet = sheet;
                                });
                            } else if (summary_result_set[i].account_id == null && summary_result_set[i].office_id == null && summary_result_set[i].personnel_id == null) {
                                rowvalue = rowvalue + 1;
                                summary_sheet.set(4, rowvalue, "Total :");
                                summary_sheet.set(5, rowvalue, summary_result_set[i].total_groups, 'number');
                                summary_sheet.set(6, rowvalue, summary_result_set[i].total_clients, 'number');
                                self.excelUtility.setBorderAndAlignForCell(summary_sheet, 2, 6, rowvalue, new Array(0, 4), new Array(5, 6), function (sheet) {
                                    summary_sheet = sheet;
                                });
                            }
                        }
                    });
                    fileLocation = rootPath+'/documents/report_documents/' + dynamic_file_name;
                    workbook.save(function (err) {
                        if (err) {
                            workbook.cancel();
                            callback(delayedPaymentResult, fileLocation);
                        } else {
                            callback(delayedPaymentResult, fileLocation);
                        }
                    });
                }
            });
        });
    },
    // Added by Paramasivan  for Report Management
    // Method for retrieve trail balance report
    getTrailBalanceReportDatamodel: function (financialYearId, startDate, endDate, officeId, reportId, accOperation, mfiOperation, callBack) {
        var self = this;
        var date = new Date();
        var date_value = date.getDate() + "_" + date.getMonth() + "_" + date.getFullYear() + "_" + date.getHours() + "_" + date.getSeconds();
        var report_name = "Trial Balance Report_" + date_value + ".xlsx";
        var excel = require('msexcel-builder');
        var fileLocation = '';
        var constantObj = this.constants;
        var workbook = excel.createWorkbook(rootPath+'/documents/report_documents/', report_name);
        var trailBalanceQuery = "CALL `sp_trial_balance`(" + financialYearId + ",'" + startDate + "','" + endDate + "'," + officeId + ",'" + accOperation + "','" + mfiOperation + "')";
        connectionDataSource.getConnection(function(clientConnect){
            clientConnect.query(trailBalanceQuery, function (error, trailBalanceResult) {
                connectionDataSource.releaseConnectionPool(clientConnect);
                if (error) {
                    customlog.error(error);
                    callBack(trailBalanceResult, fileLocation);
                } else {
                    var trailBalanceResult = trailBalanceResult[0];
                    var row_size = trailBalanceResult.length + 10;
                    var count = 1;
                    var report_sheet = workbook.createSheet('trail_balance_report', 15, parseInt(row_size));
                    var trail_balance_array = new Array('S.No', 'GL Code', 'COA Name', 'Net Debit', 'Net Credit');
                    var detailed_trail_balance_array = new Array('S.No', 'GL Code', 'COA Name', 'Opening Bal', 'Debit', 'Credit', 'Closing Bal');
                    var trail_heading = "Trail Balance Report from " + startDate + " to " + endDate;

                    if (reportId == constantObj.getTrailBalanceReport()) {
                        self.excelUtility.setAlignmentForHeader(report_sheet, 2, 6, 4, new Array(10, 15, 20, 20, 20), trail_balance_array, trail_heading, function (sheet_result) {
                            var rowValue = parseInt(4);
                            for (var i in trailBalanceResult) {
                                rowValue = rowValue + 1;
                                report_sheet = sheet_result;
                                report_sheet.set(2, rowValue, parseInt(count));
                                report_sheet.set(3, rowValue, trailBalanceResult[i].glcode_value);
                                report_sheet.set(4, rowValue, trailBalanceResult[i].coa_name);
                                report_sheet.set(5, rowValue, trailBalanceResult[i].net_debit, 'number');
                                report_sheet.set(6, rowValue, trailBalanceResult[i].net_credit, 'number');
                                count++;
                                self.excelUtility.setBorderAndAlignForCell(report_sheet, 2, 6, rowValue, new Array(5, 6), new Array(0, 2), function (sheet) {
                                    report_sheet = sheet;
                                });
                            }
                        });
                    } else {
                        var totalCreditAmount = 0, totalDebitAmount = 0;
                        self.excelUtility.setAlignmentForHeader(report_sheet, 2, 8, 6, new Array(10, 15, 30, 20, 20, 20, 20), detailed_trail_balance_array, "Detailed " + trail_heading, function (sheet_result) {
                            var rowValue = parseInt(6);
                            for (var i in trailBalanceResult) {
                                rowValue = rowValue + 1;
                                report_sheet = sheet_result;
                                report_sheet.set(2, rowValue, parseInt(count));
                                report_sheet.set(3, rowValue, trailBalanceResult[i].glcode_value);
                                report_sheet.set(4, rowValue, trailBalanceResult[i].coa_name);
                                report_sheet.set(5, rowValue, trailBalanceResult[i].opening_bal, 'number');
                                report_sheet.set(6, rowValue, trailBalanceResult[i].debit, 'number');
                                report_sheet.set(7, rowValue, trailBalanceResult[i].credit, 'number');
                                report_sheet.set(8, rowValue, trailBalanceResult[i].closing_bal, 'number');
                                totalCreditAmount += parseInt(trailBalanceResult[i].credit, 'number');
                                totalDebitAmount += parseInt(trailBalanceResult[i].debit, 'number');
                                count++;
                                self.excelUtility.setBorderAndAlignForCell(report_sheet, 2, 8, rowValue, new Array(5, 6, 7, 8), new Array(0, 2), function (sheet) {
                                    report_sheet = sheet;
                                });
                            }
                        });

                        // for writing total credit and total debit values
                        report_sheet.set(3, 4, "Total Credit");
                        report_sheet.align(3, 4, "right");
                        report_sheet.border(3, 4, {left: 'double', top: 'double', right: 'thin', bottom: 'double'});
                        report_sheet.font(3, 4, {bold: 'true'});
                        report_sheet.set(6, 4, "Total Debit");
                        report_sheet.align(6, 4, "right");
                        report_sheet.border(6, 4, {left: 'double', top: 'double', right: 'thin', bottom: 'double'});
                        report_sheet.font(6, 4, {bold: 'true'});
                        report_sheet.set(4, 4, totalCreditAmount + '.00', 'number');
                        report_sheet.align(4, 4, "right");
                        report_sheet.border(4, 4, {left: 'thin', top: 'double', right: 'double', bottom: 'double'});
                        report_sheet.font(4, 4, {bold: 'true'});
                        report_sheet.set(7, 4, totalDebitAmount + '.00', 'number');
                        report_sheet.align(7, 4, "right");
                        report_sheet.border(7, 4, {left: 'thin', top: 'double', right: 'double', bottom: 'double'});
                        report_sheet.font(7, 4, {bold: 'true'});
                    }
                    fileLocation = rootPath+'/documents/report_documents/' + report_name;
                    workbook.save(function (err) {
                        if (err) {
                            workbook.cancel();
                            customlog.error(err);
                            callBack(trailBalanceResult, fileLocation);
                        }
                        else {
                            callBack(trailBalanceResult, fileLocation);
                        }
                    });
                }
            });
        });
    },

    // Method to show overdue report
    getOverdueSummaryDataModel: function (toDate, officeId, category, loan_product, personnelId, loanStatus, customer, loanAccount, npaIndicator, daysInArrearsAbove, totalOverdueAbove, userId, callBack) {
        var date = new Date();
        var dateTime = date.getFullYear() + '_' + (date.getMonth() + 1) + '_' + date.getDate() + '_' + date.getHours() + '_' + date.getMinutes() + '_' + date.getSeconds();
        var self = this;
        var report_name = "Overdue Report-" + dateTime + ".xlsx";
        var excel = require('msexcel-builder');
        var workbook = excel.createWorkbook(rootPath+'/documents/report_documents/', report_name);
        var fileLocation = '';

        var overdueQuery = "CALL  `sp_overdue_summary`('" + toDate + "'," + officeId + ",'" + customer + "','" + loanAccount + "','" + npaIndicator + "'," + category + "," + loan_product + ",'" + loanStatus + "'," + daysInArrearsAbove + "," + totalOverdueAbove + "," + personnelId + "," + userId + ")";
        customlog.info('Overdue Report Query :' + overdueQuery);
        connectionDataSource.getConnection(function(clientConnect) {
            clientConnect.query(overdueQuery, function (error, overdueResult) {
                connectionDataSource.releaseConnectionPool(clientConnect);
                if (error) {
                    customlog.error(error);
                    callBack(overdueResult, fileLocation);
                }
                else {
                    var overdueResult = overdueResult[0];
                    var rowLength = overdueResult.length + 10;
                    // Sheet1 for overdue summary
                    var sheet1 = workbook.createSheet("summary", 20, parseInt(rowLength));
                    var headerForSummary = new Array('S.No', 'Office', 'No. Of Customers', 'Total Loan Amount',
                        'Total Principal Paid', 'Total Principal Outstanding', 'Total Overdue', 'Total Principal Overdue');

                    // Sheet2 for overdue detailed summary
                    var sheet2 = workbook.createSheet("detailed_summary", 20, parseInt(rowLength));
                    var headerArrayForDetailed = new Array('S.No', 'Office', 'Personnel', 'Product Category', 'Customer'
                        , 'Global Ac. No.', 'No. Of Members', 'No. Of NPA Members', 'No. Of Inst. Not Paid', 'Loan Status'
                        , 'Days in Arrears', 'Address', 'Phone Num', 'Principal Paid', 'Principal Outstanding', 'Total Overdue', 'Principal Overdue');

                    var heading = "Overdue Summary as on " + toDate;
                    var count1 = 1, count2 = 1;
                    self.excelUtility.setAlignmentForHeader(sheet2, 2, 18, 4, new Array(10, 15, 30, 20, 50, 20, 20, 20, 20, 20, 20, 50, 20, 20, 20, 20, 20), headerArrayForDetailed, heading, function (result) {
                        sheet2 = result;
                        for (var i in overdueResult) {
                            if (overdueResult[i].personnel_id && overdueResult[i].account_id) {
                                var rowValue = parseInt(4);
                                rowValue = rowValue + parseInt(count2);
                                sheet2.set(2, rowValue, parseInt(count2));
                                sheet2.set(3, rowValue, overdueResult[i].office);
                                sheet2.set(4, rowValue, overdueResult[i].personnel);
                                sheet2.set(5, rowValue, overdueResult[i].prd_category);
                                sheet2.set(6, rowValue, overdueResult[i].customer);
                                sheet2.set(7, rowValue, overdueResult[i].global_account_num);
                                sheet2.set(8, rowValue, overdueResult[i].no_of_members, 'number');
                                sheet2.set(9, rowValue, overdueResult[i].no_of_npa_members, 'number');
                                sheet2.set(10, rowValue, overdueResult[i].no_of_installments_not_paid, 'number');
                                sheet2.set(11, rowValue, overdueResult[i].loan_status);
                                sheet2.set(12, rowValue, overdueResult[i].days_in_arrears, 'number');
                                sheet2.set(13, rowValue, overdueResult[i].address);
                                sheet2.set(14, rowValue, overdueResult[i].phone_number);
                                sheet2.set(15, rowValue, overdueResult[i].principal_paid, 'number');
                                sheet2.set(16, rowValue, overdueResult[i].principal_outstanding, 'number');
                                sheet2.set(17, rowValue, overdueResult[i].total_overdue, 'number');
                                sheet2.set(18, rowValue, overdueResult[i].principal_overdue, 'number');
                                count2++;
                                self.excelUtility.setBorderAndAlignForCell(sheet2, 2, 18, rowValue, new Array(8, 9, 12, 15, 16, 17, 18), new Array(2, 7, 14), function (sheet) {
                                    sheet2 = sheet;
                                });
                            }
                        }
                        self.excelUtility.setAlignmentForHeader(sheet1, 2, 9, 4, new Array(10, 25, 30, 30, 30, 30, 30, 30), headerForSummary, heading, function (result) {
                            sheet1 = result;
                            var count3 = 1;
                            for(var j=0;j<overdueResult.length;j++) {
                                if (!overdueResult[j].personnel_id && !overdueResult[j].account_id && overdueResult[j].office_id) {
                                    var rowValue = parseInt(4);
                                    rowValue = rowValue + parseInt(count3);
                                    createSummarySheetForOD(self, sheet1, count3, overdueResult[j], "office", rowValue);
                                    count3++;
                                }
                            }
                            for(var j=0;j<overdueResult.length;j++) {
                                var rowValue = parseInt(4);
                                rowValue = rowValue + parseInt(count3);
                                if (!overdueResult[j].office_id) {
                                    createSummarySheetForOD(self, sheet1, count3, overdueResult[j], "total",rowValue);
                                }
                            }
                        })
                    });

                    fileLocation = rootPath+'/documents/report_documents/' + report_name;
                    workbook.save(function (err) {
                        if (err) {
                            workbook.cancel();
                            customlog.error(err.message);
                            callBack(overdueResult, fileLocation);
                        }
                        else {
                            callBack(overdueResult, fileLocation);
                        }
                    });
                }
            });
        });
    },

    // Method to show demand collection summary
    getDemandCollectionSummary: function (fromDate, toDate, officeId, loanOfficerId, productCategoryId, loanProductId, customer, account, reportCategory, reportId, individual_tracked, userId, callBack) {
        var date = new Date();
        var dateTime = date.getFullYear() + '_' + (date.getMonth() + 1) + '_' + date.getDate() + '_' + date.getHours() + '_' + date.getMinutes() + '_' + date.getSeconds();
        var self = this;
        var constantObj = this.constants;
        if (reportId == constantObj.getDemandClientWiseReport() || reportId == constantObj.getDemandGroupWiseReport()) {
            if(reportId == constantObj.getDemandGroupWiseReport()){
                var demandCollectionQuery = "CALL  `sp_demand_report_groupwise`('" + fromDate + "','" + toDate + "'," + officeId + "," + loanOfficerId + "," + productCategoryId + "," + loanProductId + ",'" + customer + "','" + account + "'," + userId + ")";
            }
            else{
                var demandCollectionQuery = "CALL  `sp_demand_report_clientwise`('" + fromDate + "','" + toDate + "'," + officeId + "," + loanOfficerId + "," + productCategoryId + "," + loanProductId + ",'" + customer + "','" + account + "',"+individual_tracked+"," + userId + ")";
            }
            var report_name = "Demand Report Group Wise-" + dateTime + ".xlsx";
        }
        else {
            if (reportCategory == 'monthly') {
                var demandCollectionQuery = "CALL  `sp_demand_collection_daily_detail_month_wise`('" + fromDate + "','" + toDate + "'," + officeId + "," + loanOfficerId + "," + productCategoryId + "," + loanProductId + ",'" + customer + "','" + account + "'," + userId + ")";
            }
            else {
                var demandCollectionQuery = "CALL  `sp_demand_collection_daily_detail_date_wise`('" + fromDate + "','" + toDate + "'," + officeId + "," + loanOfficerId + "," + productCategoryId + "," + loanProductId + ",'" + customer + "','" + account + "'," + userId + ")";
            }
            var report_name = "Demand Collection Detailed-" + dateTime + ".xlsx";
        }
        var excel = require('msexcel-builder');
        var workbook = excel.createWorkbook(rootPath+'/documents/report_documents/', report_name);
        var fileLocation = '';

        customlog.info('Demand Collection Query :' + demandCollectionQuery);
        connectionDataSource.getConnection(function(clientConnect) {
            console.log(demandCollectionQuery+' execution started - Start time: '+ new Date().getHours() + "_" + new Date().getMinutes() + "_" + new Date().getSeconds() + "_" + new Date().getMilliseconds());
            clientConnect.query(demandCollectionQuery, function (error, demandCollectionResult) {
                console.log(demandCollectionQuery+' execution ended - End time: '+ new Date().getHours() + "_" + new Date().getMinutes() + "_" + new Date().getSeconds() + "_" + new Date().getMilliseconds());
                connectionDataSource.releaseConnectionPool(clientConnect);
                if (error) {
                    customlog.error(error);
                    callBack(demandCollectionResult, fileLocation);
                }
                else {
                    var demandCollectionResult = demandCollectionResult[0];
                    var rowLength = demandCollectionResult.length + 10;

                    // Sheet1 for demand collection summary
                    if (reportId == constantObj.getDemandGroupWiseReport() || reportCategory === 'monthly' || reportCategory === 'daily')
                        var sheet1 = workbook.createSheet('Summary', 20, parseInt(rowLength));

                    if (reportCategory === 'monthly') {
                        var headerArrayForSummarySheet = new Array('S.No', 'Office', 'Loan Officer', 'Year', 'Month', 'Total Principal Demand', 'Total Interest Demand',
                            'Total Demand', 'Total Principal Paid', 'Total Interest Paid', 'Total Paid');
                        var widthArrayForSummary = new Array(10, 25, 45, 20, 20, 20, 20, 20, 20, 20, 20);
                        var endIndexForSummary = 12;
                    }
                    else {
                        var headerArrayForSummarySheet = new Array('S.No', 'Office', 'Loan Officer', 'Date', 'Total Principal Demand', 'Total Interest Demand',
                            'Total Demand', 'Total Principal Paid', 'Total Interest Paid', 'Total Paid');
                        var widthArrayForSummary = new Array(10, 25, 45, 20, 20, 20, 20, 20, 20, 20);
                        var endIndexForSummary = 11;
                    }
                    var endIndex = 14;

                    // Sheet2 for demand collection detailed summary
                    var sheet2 = workbook.createSheet('detailed_summary', 20, parseInt(rowLength));
                    var heading = 'Demand Collection Report From ' + fromDate + " to " + toDate;

                    if (reportId == constantObj.getDemandGroupWiseReport() || reportId == constantObj.getDemandClientWiseReport()) {
                        headerArrayForSummarySheet = new Array('S.No', 'Office', 'Total Principal Demand', 'Total Interest Demand',
                            'Total Demand');
                        var headerArray = new Array('S.No', 'Month', 'Loan Product', 'Branch', 'Loan Officer', 'Due Date', 'Group Code', 'Group Name', 'Client Name', 'Principal Demanded',
                            'Interest Demanded', 'Total Demanded');
                        var widthArray = new Array(10, 20, 30, 20, 30, 20, 20, 50, 20, 20, 20, 20);
                        endIndexForSummary = 6;
                        widthArrayForSummary = new Array(10, 25, 30, 30, 30);
                        endIndex = 13;
                        heading = 'Demand Report From ' + fromDate + " to " + toDate;
                    }
                    else {
                        if (reportCategory == 'monthly') {
                            var headerArray = new Array('S.No', 'Office', 'Loan Officer', 'Year', 'Month', 'Customer', 'Account No.', 'Principal Demand',
                                'Interest Demand', 'Total Demand', 'Principal Paid', 'Interest Paid', 'Total Paid');
                            var widthArray = new Array(10, 20, 30, 20, 20, 50, 20, 20, 20, 20, 20, 20, 20);
                        }
                        else {
                            var headerArray = new Array('S.No', 'Office', 'Loan Officer', 'Due Date', 'Customer', 'Account No.', 'Principal Demand',
                                'Interest Demand', 'Total Demand', 'Principal Paid', 'Interest Paid', 'Total Paid');
                            var widthArray = new Array(10, 20, 30, 20, 50, 20, 20, 20, 20, 20, 20, 20);
                            endIndex = 13;
                        }
                    }
                    var count1 = 1, count2 = 1, summaryArray = new Array();
                    console.log('Excel generation started - Start time: '+ new Date().getHours() + "_" + new Date().getMinutes() + "_" + new Date().getSeconds() + "_" + new Date().getMilliseconds());
                    self.excelUtility.setAlignmentForHeader(sheet2, 2, endIndex, 4, widthArray, headerArray, heading, function (result) {
                        sheet2 = result;
                        if (reportId == constantObj.getDemandGroupWiseReport() || reportId == constantObj.getDemandClientWiseReport()) {
                            if(reportId == constantObj.getDemandGroupWiseReport()) {
                                console.log('Excel data writing started for demand group wise report - Start time: '+ new Date().getHours() + "_" + new Date().getMinutes() + "_" + new Date().getSeconds() + "_" + new Date().getMilliseconds());
                                for (var i in demandCollectionResult) {
                                    if (demandCollectionResult[i].demd_account_id && demandCollectionResult[i].demd_date && demandCollectionResult[i].demd_office_id && demandCollectionResult[i].demd_personnel_id) {
                                        var rowValue = parseInt(4);
                                        rowValue = rowValue + parseInt(count2);
                                        sheet2.set(2, rowValue, parseInt(count2));
                                        sheet2.set(3, rowValue, demandCollectionResult[i].MONTH);
                                        sheet2.set(4, rowValue, demandCollectionResult[i].loan_product);
                                        sheet2.set(5, rowValue, demandCollectionResult[i].demd_office);
                                        sheet2.set(6, rowValue, demandCollectionResult[i].field_officer);
                                        sheet2.set(7, rowValue, demandCollectionResult[i].demd_date);
                                        sheet2.set(8, rowValue, demandCollectionResult[i].group_code);
                                        sheet2.set(9, rowValue, demandCollectionResult[i].demd_customer);
                                        sheet2.set(10, rowValue, demandCollectionResult[i].demd_client_name);
                                        sheet2.set(11, rowValue, demandCollectionResult[i].principal_demd, 'number');
                                        sheet2.set(12, rowValue, demandCollectionResult[i].interest_demd, 'number');
                                        sheet2.set(13, rowValue, demandCollectionResult[i].total_demd, 'number');
                                        count2++;
                                        self.excelUtility.setBorderAndAlignForCell(sheet2, 2, endIndex, rowValue, new Array(12, 13, 14), new Array(2, 7, 8), function (sheet) {
                                            sheet2 = sheet;
                                        });
                                    }
                                    summaryArray[i] = demandCollectionResult[i];
                                }
                                console.log('Excel data writing ended for demand group wise report- End time: '+ new Date().getHours() + "_" + new Date().getMinutes() + "_" + new Date().getSeconds() + "_" + new Date().getMilliseconds());
                            }else{
                                console.log('Excel data writing started for demand client wise report- Start time: '+ new Date().getHours() + "_" + new Date().getMinutes() + "_" + new Date().getSeconds() + "_" + new Date().getMilliseconds());
                                for (var i in demandCollectionResult) {
                                    var rowValue = parseInt(4);
                                    rowValue = rowValue + parseInt(count2);
                                    sheet2.set(2, rowValue, parseInt(count2));
                                    sheet2.set(3, rowValue, demandCollectionResult[i].MONTH);
                                    sheet2.set(4, rowValue, demandCollectionResult[i].loan_product);
                                    sheet2.set(5, rowValue, demandCollectionResult[i].demd_office);
                                    sheet2.set(6, rowValue, demandCollectionResult[i].field_officer);
                                    sheet2.set(7, rowValue, demandCollectionResult[i].demd_date);
                                    sheet2.set(8, rowValue, demandCollectionResult[i].group_code);
                                    sheet2.set(9, rowValue, demandCollectionResult[i].demd_group_name);
                                    sheet2.set(10, rowValue, demandCollectionResult[i].demd_customer);
                                    sheet2.set(11, rowValue, demandCollectionResult[i].principal_demd, 'number');
                                    sheet2.set(12, rowValue, demandCollectionResult[i].interest_demd, 'number');
                                    sheet2.set(13, rowValue, demandCollectionResult[i].total_demd, 'number');
                                    count2++;
                                    self.excelUtility.setBorderAndAlignForCell(sheet2, 2, endIndex, rowValue, new Array(12, 13, 14), new Array(2, 7, 8), function (sheet) {
                                        sheet2 = sheet;
                                    });
                                }
                                console.log('Excel data writing ended for demand client wise report - End time: '+ new Date().getHours() + "_" + new Date().getMinutes() + "_" + new Date().getSeconds() + "_" + new Date().getMilliseconds());
                            }
                        }
                        else {
                            if (reportCategory == 'monthly') {
                                console.log('Excel data writing started for demand collection monthly report - Start time: '+ new Date().getHours() + "_" + new Date().getMinutes() + "_" + new Date().getSeconds() + "_" + new Date().getMilliseconds());
                                for (var i in demandCollectionResult) {
                                    if (demandCollectionResult[i].account_id && demandCollectionResult[i].MONTH && demandCollectionResult[i].office_id && demandCollectionResult[i].personnel_id) {
                                        var rowValue = parseInt(4);
                                        rowValue = rowValue + parseInt(count2);
                                        sheet2.set(2, rowValue, parseInt(count2));
                                        sheet2.set(3, rowValue, demandCollectionResult[i].office);
                                        sheet2.set(4, rowValue, demandCollectionResult[i].loan_officer);
                                        sheet2.set(5, rowValue, demandCollectionResult[i].YEAR);
                                        sheet2.set(6, rowValue, demandCollectionResult[i].MONTH);
                                        sheet2.set(7, rowValue, demandCollectionResult[i].customer);
                                        sheet2.set(8, rowValue, demandCollectionResult[i].global_account_num);
                                        sheet2.set(9, rowValue, demandCollectionResult[i].principal_demd, 'number');
                                        sheet2.set(10, rowValue, demandCollectionResult[i].interest_demd, 'number');
                                        sheet2.set(11, rowValue, demandCollectionResult[i].total_demd, 'number');
                                        sheet2.set(12, rowValue, demandCollectionResult[i].principal_paid, 'number');
                                        sheet2.set(13, rowValue, demandCollectionResult[i].interest_paid, 'number');
                                        sheet2.set(14, rowValue, demandCollectionResult[i].total_paid, 'number');
                                        count2++;
                                        self.excelUtility.setBorderAndAlignForCell(sheet2, 2, endIndex, rowValue, new Array(9, 10, 11, 12, 13, 14), new Array(2, 5, 8), function (sheet) {
                                            sheet2 = sheet;
                                        });
                                    }
                                    summaryArray[i] = demandCollectionResult[i];
                                }
                                console.log('Excel data writing ended for demand collection monthly report - End time: '+ new Date().getHours() + "_" + new Date().getMinutes() + "_" + new Date().getSeconds() + "_" + new Date().getMilliseconds());
                            }
                            else {
                                console.log('Excel data writing started for demand collection daily report - Start time: '+ new Date().getHours() + "_" + new Date().getMinutes() + "_" + new Date().getSeconds() + "_" + new Date().getMilliseconds());
                                for (var i in demandCollectionResult) {
                                    if (demandCollectionResult[i].account_id && demandCollectionResult[i].DATE && demandCollectionResult[i].office_id && demandCollectionResult[i].personnel_id) {
                                        var rowValue = parseInt(4);
                                        rowValue = rowValue + parseInt(count2);
                                        sheet2.set(2, rowValue, parseInt(count2));
                                        sheet2.set(3, rowValue, demandCollectionResult[i].office);
                                        sheet2.set(4, rowValue, demandCollectionResult[i].loan_officer);
                                        sheet2.set(5, rowValue, demandCollectionResult[i].demd_date);
                                        sheet2.set(6, rowValue, demandCollectionResult[i].customer);
                                        sheet2.set(7, rowValue, demandCollectionResult[i].global_account_num);
                                        sheet2.set(8, rowValue, demandCollectionResult[i].principal_demd, 'number');
                                        sheet2.set(9, rowValue, demandCollectionResult[i].interest_demd, 'number');
                                        sheet2.set(10, rowValue, demandCollectionResult[i].total_demd, 'number');
                                        sheet2.set(11, rowValue, demandCollectionResult[i].principal_paid, 'number');
                                        sheet2.set(12, rowValue, demandCollectionResult[i].interest_paid, 'number');
                                        sheet2.set(13, rowValue, demandCollectionResult[i].total_paid, 'number');
                                        count2++;
                                        self.excelUtility.setBorderAndAlignForCell(sheet2, 2, endIndex, rowValue, new Array(8, 9, 10, 11, 12, 13), new Array(2, 5, 7), function (sheet) {
                                            sheet2 = sheet;
                                        });
                                    }
                                    summaryArray[i] = demandCollectionResult[i];
                                }
                                console.log('Excel data writing ended for demand collection daily - End time: '+ new Date().getHours() + "_" + new Date().getMinutes() + "_" + new Date().getSeconds() + "_" + new Date().getMilliseconds());
                            }
                        }
                    });
                    if (reportId == constantObj.getDemandGroupWiseReport() || reportCategory === 'monthly' || reportCategory === 'daily') {
                        self.excelUtility.setAlignmentForHeader(sheet1, 2, endIndexForSummary, 4, widthArrayForSummary, headerArrayForSummarySheet, heading, function (result) {
                            sheet1 = result;
                            if (reportId == constantObj.getDemandGroupWiseReport()) {
                                console.log('Excel data writing started for demand report group wise summary sheet - Start time: '+ new Date().getHours() + "_" + new Date().getMinutes() + "_" + new Date().getSeconds() + "_" + new Date().getMilliseconds());
                                for (var i = 0; i < summaryArray.length; i++) {
                                    if (!summaryArray[i].demd_account_id && summaryArray[i].demd_office_id && !summaryArray[i].demd_date) {
                                        createSummarySheetForDC(self, sheet1, count1, summaryArray[i], "office", reportId, reportCategory, constantObj);
                                        count1++;
                                    }
                                }
                                for (var i = 0; i < summaryArray.length; i++) {
                                    if (!summaryArray[i].demd_office_id) {
                                        createSummarySheetForDC(self, sheet1, count1, summaryArray[i], "total", reportId, reportCategory, constantObj);
                                    }
                                }
                                console.log('Excel data writing ended for demand report group wise summary sheet - End time: '+ new Date().getHours() + "_" + new Date().getMinutes() + "_" + new Date().getSeconds() + "_" + new Date().getMilliseconds());
                            }
                            else {
                                if (reportCategory === 'monthly') {
                                    console.log('Excel data writing started for demand collection monthly summary sheet - Start time: '+ new Date().getHours() + "_" + new Date().getMinutes() + "_" + new Date().getSeconds() + "_" + new Date().getMilliseconds());
                                    for (var i = 0; i < summaryArray.length; i++) {

                                        if (!summaryArray[i].account_id && summaryArray[i].personnel_id && summaryArray[i].office_id && summaryArray[i].MONTH) {
                                            createSummarySheetForDC(self, sheet1, count1, summaryArray[i], "office", reportId, reportCategory, constantObj);
                                            count1++;
                                        }
                                    }
                                    for (var i = 0; i < summaryArray.length; i++) {
                                        if (!summaryArray[i].MONTH) {
                                            createSummarySheetForDC(self, sheet1, count1, summaryArray[i], "total", reportId, reportCategory, constantObj);
                                        }
                                    }
                                    console.log('Excel data writing ended for demand collection monthly summary sheet - End time: '+ new Date().getHours() + "_" + new Date().getMinutes() + "_" + new Date().getSeconds() + "_" + new Date().getMilliseconds());
                                }
                                else {
                                    console.log('Excel data writing started for demand collection daily summary sheet - Start time: '+ new Date().getHours() + "_" + new Date().getMinutes() + "_" + new Date().getSeconds() + "_" + new Date().getMilliseconds());
                                    for (var i = 0; i < summaryArray.length; i++) {
                                        if (!summaryArray[i].account_id && summaryArray[i].personnel_id && summaryArray[i].office_id && summaryArray[i].DATE) {
                                            createSummarySheetForDC(self, sheet1, count1, summaryArray[i], "office", reportId, reportCategory, constantObj);
                                            count1++;
                                        }
                                    }
                                    for (var i = 0; i < summaryArray.length; i++) {
                                        if (!summaryArray[i].DATE) {
                                            createSummarySheetForDC(self, sheet1, count1, summaryArray[i], "total", reportId, reportCategory, constantObj);
                                        }
                                    }
                                    console.log('Excel data writing ended for demand collection daily summary sheet - End time: '+ new Date().getHours() + "_" + new Date().getMinutes() + "_" + new Date().getSeconds() + "_" + new Date().getMilliseconds());
                                }
                            }
                        });
                    }

                    console.log('Excel generation ended End time: '+ new Date().getHours() + "_" + new Date().getMinutes() + "_" + new Date().getSeconds() + "_" + new Date().getMilliseconds());
                    fileLocation = rootPath+'/documents/report_documents/' + report_name;
                    workbook.save(function (err) {
                        if (err) {
                            workbook.cancel();
                            customlog.error(err.message);
                            callBack(demandCollectionResult, fileLocation);
                        }
                        else {
                            callBack(demandCollectionResult, fileLocation);
                        }
                    });
                    console.log('Demand/Collection method ended');
                }
            });
        });
    },

    // Method to retrive general ledger summary
    getGeneralLedgerSummaryDataModel: function (fromDate, toDate, officeId, selected_ledger_name, ledger_id, accOperation, mfiOperation, userId, callBack) {
        var date = new Date();
        var dateTime = date.getFullYear() + '_' + (date.getMonth() + 1) + '_' + date.getDate() + '_' + date.getHours() + '_' + date.getMinutes() + '_' + date.getSeconds();
        var self = this;
        var report_name = "General Ledger Report-" + dateTime + ".xlsx";
        var excel = require('msexcel-builder');
        var workbook = excel.createWorkbook(rootPath+'/documents/report_documents/', report_name);
        var fileLocation = '';
        var generalLedgerQuery = "CALL  `sp_general_ledger`('" + fromDate + "','" + toDate + "'," + officeId + "," + ledger_id + ",'" + accOperation + "','" + mfiOperation + "'," + userId + ")";

        customlog.info('General Ledger Query :' + generalLedgerQuery);
        var transactionType = "";
        if(accOperation == 'accounting' && mfiOperation == 'mfi'){
            transactionType = '%';
        }else if(accOperation == 'accounting'){
            transactionType = 'accounting';
        }else {
            transactionType = 'mfi';
        }
        var OpeningBalanceQuery = "CALL sp_opening_balance_by_ledger_code('" + fromDate + "'," + ledger_id + ",'" + transactionType + "')"
        connectionDataSource.getConnection(function(clientConnect) {
            clientConnect.query(generalLedgerQuery, function (error, generalLedgerResult) {
                var generalLedgerResult = generalLedgerResult[0];
                if (error) {
                    customlog.error(error);
                    callBack(generalLedgerResult, fileLocation);
                }
                else {
                    clientConnect.query(OpeningBalanceQuery, function (error, OpeningBalanceResult) {
                        connectionDataSource.releaseConnectionPool(clientConnect);
                        if (error) {
                            customlog.error(error);
                            callBack(generalLedgerResult, fileLocation);
                        }
                        else{
                            var totalDebit = 0;
                            var totalCredit = 0;
                            var openingBalanceValue = OpeningBalanceResult[0];
                            openingBalance = openingBalanceValue[0].openingBalance
                            console.log("openingBalance = "+ openingBalanceValue[0].openingBalance);
                            var rowLength = generalLedgerResult.length + 10;
                            // sheet1 for summary
                            var sheet1 = workbook.createSheet("Summary", 20, parseInt(rowLength));
                            var headerForSummarySheet = new Array('S.No', 'Office', 'Ledger', 'No. Of Transactions', 'Total Debit', 'Total Credit');

                            // sheet2 for detailed report
                            var sheet2 = workbook.createSheet("Detailed_Summary", 20, parseInt(rowLength));
                            var headerForDetailedSheet = new Array('S.No', 'Office', 'Payment Date', 'Transaction Type', 'Cheque/Receipt No.',
                                'Narration', 'Ledger', 'Debit', 'Credit', 'Voucher No.');

                            var heading = "General Ledger Report from " + fromDate + " to " + toDate + "      Ledger Name : " + selected_ledger_name + " ";
                            var count1 = 1, count2 = 1, summaryArray = new Array();
                            self.excelUtility.setAlignmentForHeader(sheet2, 2, 11, 4, new Array(10, 20, 20, 20, 20, 30, 20, 20, 20, 20), headerForDetailedSheet, heading, function (result) {
                                sheet2 = result;
                                for (var i in generalLedgerResult) {
                                    if (generalLedgerResult[i].office_id && generalLedgerResult[i].id) {
                                        var rowValue = parseInt(4);
                                        rowValue = rowValue + parseInt(count2);
                                        sheet2.set(2, rowValue, parseInt(count2));
                                        sheet2.set(3, rowValue, generalLedgerResult[i].office);
                                        sheet2.set(4, rowValue, generalLedgerResult[i].payment_date);
                                        sheet2.set(5, rowValue, generalLedgerResult[i].transaction_type);
                                        sheet2.set(6, rowValue, generalLedgerResult[i].cheque_or_receipt_num);
                                        sheet2.set(7, rowValue, generalLedgerResult[i].narration);
                                        sheet2.set(8, rowValue, generalLedgerResult[i].ledger);
                                        sheet2.set(9, rowValue, generalLedgerResult[i].debit, 'number');
                                        sheet2.set(10, rowValue, generalLedgerResult[i].credit, 'number');
                                        sheet2.set(11, rowValue, generalLedgerResult[i].id);
                                        count2++;
                                        self.excelUtility.setBorderAndAlignForCell(sheet2, 2, 11, rowValue, new Array(9, 10), new Array(2, 4, 5, 6, 11), function (sheet) {
                                            sheet2 = sheet;
                                        });
                                    }
                                }
                            });

                            self.excelUtility.setAlignmentForHeader(sheet1, 2, 7, 4, new Array(10, 35, 35, 25, 25, 25), headerForSummarySheet, heading, function (result) {
                                sheet1 = result;
                                for (var i = 0; i < generalLedgerResult.length; i++) {
                                    var rowValue = parseInt(4);
                                    rowValue = rowValue + parseInt(count1);
                                    if (generalLedgerResult[i].ledger && !generalLedgerResult[i].id && generalLedgerResult[i].office_id) {
                                        sheet1.set(2, rowValue, parseInt(count1));
                                        sheet1.set(3, rowValue, generalLedgerResult[i].office);
                                        sheet1.set(4, rowValue, generalLedgerResult[i].ledger);
                                        sheet1.set(5, rowValue, generalLedgerResult[i].noOfTransactions, 'number');
                                        sheet1.set(6, rowValue, generalLedgerResult[i].totalDebit, 'number');
                                        sheet1.set(7, rowValue, generalLedgerResult[i].totalCredit, 'number');
                                        count1++;
                                    }
                                    if (!generalLedgerResult[i].office_id) {
                                        sheet1.set(4, rowValue, "Total");
                                        sheet1.set(5, rowValue, generalLedgerResult[i].noOfTransactions, 'number');
                                        sheet1.set(6, rowValue, generalLedgerResult[i].totalDebit, 'number');
                                        sheet1.set(7, rowValue, generalLedgerResult[i].totalCredit, 'number');
                                        totalDebit =  parseInt(generalLedgerResult[i].totalDebit);
                                        totalCredit = parseInt(generalLedgerResult[i].totalCredit);

                                        sheet1.set(5, rowValue+2, "Opening Balance");
                                        sheet1.set(6, rowValue+2, openingBalance, 'number');
                                        sheet1.border()
                                        self.excelUtility.setBorderAndAlignForCell(sheet1, 5, 7, rowValue+2, new Array(7), new Array(6), function (sheet) {
                                            sheet1 = sheet;
                                        });

                                        sheet1.set(5, rowValue+3, "During the Period");
                                        sheet1.set(6, rowValue+3, (totalDebit), 'number');
                                        sheet1.set(7, rowValue+3, (totalCredit), 'number');
                                        sheet1.border()
                                        self.excelUtility.setBorderAndAlignForCell(sheet1, 5, 7, rowValue+3, new Array(7), new Array(6), function (sheet) {
                                            sheet1 = sheet;
                                        });

                                        sheet1.set(5, rowValue+4, "Closing Balance");
                                        sheet1.set(7, rowValue+4, openingBalance+(totalDebit-totalCredit), 'number');
                                        sheet1.border()
                                        self.excelUtility.setBorderAndAlignForCell(sheet1, 5, 7, rowValue+4, new Array(7), new Array(6), function (sheet) {
                                            sheet1 = sheet;
                                        });

                                    }
                                    sheet1.border()
                                    self.excelUtility.setBorderAndAlignForCell(sheet1, 2, 7, rowValue, new Array(5, 6, 7), new Array(0, 2), function (sheet) {
                                        sheet1 = sheet;
                                    });
                                }
                            });
                            fileLocation = rootPath+'/documents/report_documents/' + report_name;
                            workbook.save(function (err) {
                                if (err) {
                                    workbook.cancel();
                                    customlog.error(err.message);
                                    callBack(generalLedgerResult, fileLocation);
                                }
                                else {
                                    callBack(generalLedgerResult, fileLocation);
                                }
                            });
                        }
                    });
                }
            })
        });
    },

    // method to get cash payment voucher/receipt result
    getVoucherOrReceipt: function (fromDate, toDate, officeId, accOperation, mfiOperation, reportId, userId, callBack) {
        var date = new Date();
        var dateTime = date.getFullYear() + '_' + (date.getMonth() + 1) + '_' + date.getDate() + '_' + date.getHours() + '_' + date.getMinutes() + '_' + date.getSeconds();
        var self = this;
        var constantObj = this.constants;
        if (reportId == constantObj.getCashPaymentVoucherSummary()) {
            var voucherOrReceiptQuery = "CALL  `sp_voc_account_group_cash_payment`('" + fromDate + "','" + toDate + "'," + officeId + ",'" + accOperation + "','" + mfiOperation + "'," + userId + ")";
            var report_name = "Cash_Payment_Voucher-" + dateTime + ".xlsx";
            var heading = "Cash Payment Voucher from " + fromDate + " to " + toDate;
        }
        else if (reportId == constantObj.getCashReceiptVoucherSummary()) {
            var voucherOrReceiptQuery = "CALL  `sp_voc_account_group_cash_receipt`('" + fromDate + "','" + toDate + "'," + officeId + ",'" + accOperation + "','" + mfiOperation + "'," + userId + ")";
            var report_name = "Cash_Payment_Receipt-" + dateTime + ".xlsx";
            var heading = "Cash Receipt Voucher from " + fromDate + " to " + toDate;
        }
        else if (reportId == constantObj.getJournalVoucherReport()) {
            var voucherOrReceiptQuery = "CALL  `sp_voc_journal`('" + fromDate + "','" + toDate + "'," + officeId + ",'" + accOperation + "','" + mfiOperation + "'," + userId + ")";
            var report_name = "Journal_Voucher_Report-" + dateTime + ".xlsx";
            var heading = "Journal Voucher from " + fromDate + " to " + toDate;
        }
        else if (reportId == constantObj.getContraVoucherReport()) {
            var voucherOrReceiptQuery = "CALL  `sp_voc_contra`('" + fromDate + "','" + toDate + "'," + officeId + ",'" + accOperation + "','" + mfiOperation + "'," + userId + ")";
            var report_name = "Contra_Voucher_Report-" + dateTime + ".xlsx";
            var heading = "Contra Voucher from " + fromDate + " to " + toDate;
        }
        else if (reportId == constantObj.getBankPaymentVoucherSummary()) {
            var voucherOrReceiptQuery = "CALL  `sp_voc_account_group_bank_payment`('" + fromDate + "','" + toDate + "'," + officeId + ",'" + accOperation + "','" + mfiOperation + "'," + userId + ")";
            var report_name = "Bank_Payment_Voucher_Report-" + dateTime + ".xlsx";
            var heading = "Bank Payment Voucher from " + fromDate + " to " + toDate;
        }
        else {
            var voucherOrReceiptQuery = "CALL  `sp_voc_account_group_bank_receipt`('" + fromDate + "','" + toDate + "'," + officeId + ",'" + accOperation + "','" + mfiOperation + "'," + userId + ")";
            var report_name = "Bank_Payment_Receipt_Report-" + dateTime + ".xlsx";
            var heading = "Bank Receipt Voucher from " + fromDate + " to " + toDate;
        }
        var excel = require('msexcel-builder');
        var workbook = excel.createWorkbook(rootPath+'/documents/report_documents/', report_name);
        var fileLocation = '';
        customlog.info('PaymentQuery: ' + voucherOrReceiptQuery);
        connectionDataSource.getConnection(function(clientConnect) {
            clientConnect.query(voucherOrReceiptQuery, function (error, voucherOrReceiptResult) {
                connectionDataSource.releaseConnectionPool(clientConnect);
                if (error) {
                    customlog.error(error);
                    callBack(voucherOrReceiptResult, fileLocation);
                }
                else {
                    var voucherOrReceiptResult = voucherOrReceiptResult[0];
                    var rowLength = voucherOrReceiptResult.length + 10;

                    // sheet1 for summary
                    var sheet1 = workbook.createSheet("Summary", 20, parseInt(rowLength));
                    var headerForSummarySheet = new Array('S.No', 'Office', 'No. Of Transactions', 'Total Amount');

                    // sheet2 for detailed report
                    var sheet2 = workbook.createSheet("Detailed_Summary", 20, parseInt(rowLength));
                    if (mfiOperation == 'mfi') {
                        var headerForDetailedSheet = new Array('S.No', 'Office', 'Loan Officer', 'Customer', 'Ac. No', 'Transaction Date', 'Cheque Date', 'Cheque No.', 'Debit',
                            'Debit Ac. Name', 'Credit', 'Credit Ac. Name', 'Amount', 'Narration', 'Voucher No. ');
                        var endIndex = 16;
                        var widthArray = new Array(10, 25, 50, 50, 20, 20, 20, 20, 20, 30, 20, 30, 20, 100, 35);
                    }
                    else {
                        var headerForDetailedSheet = new Array('S.No', 'Office', 'Transaction Date', 'Cheque Date', 'Cheque No.', 'Debit',
                            'Debit Ac. Name', 'Credit', 'Credit Ac. Name', 'Amount', 'Narration', 'Voucher No. ');
                        var endIndex = 13;
                        var widthArray = new Array(10, 25, 20, 20, 20, 20, 30, 20, 30, 20, 100, 35);
                    }

                    self.excelUtility.setAlignmentForHeader(sheet2, 2, endIndex, 4, widthArray, headerForDetailedSheet, heading, function (result) {
                        sheet2 = result;
                        var count2 = 1;
                        var summaryArray = new Array();
                        for (var i in voucherOrReceiptResult) {
                            if (voucherOrReceiptResult[i].officeId && voucherOrReceiptResult[i].transactionMasterId) {
                                var rowValue = parseInt(4);
                                rowValue = rowValue + parseInt(count2);
                                if (mfiOperation == 'mfi') {
                                    sheet2.set(2, rowValue, parseInt(count2));
                                    sheet2.set(3, rowValue, voucherOrReceiptResult[i].officeName);
                                    sheet2.set(4, rowValue, voucherOrReceiptResult[i].field_officer);
                                    sheet2.set(5, rowValue, voucherOrReceiptResult[i].customerName);
                                    sheet2.set(6, rowValue, voucherOrReceiptResult[i].accountNum);
                                    sheet2.set(7, rowValue, voucherOrReceiptResult[i].transactionDate);
                                    sheet2.set(8, rowValue, voucherOrReceiptResult[i].chequeDate);
                                    sheet2.set(9, rowValue, voucherOrReceiptResult[i].chequeNumber);
                                    sheet2.set(10, rowValue, voucherOrReceiptResult[i].debitAcc);
                                    sheet2.set(11, rowValue, voucherOrReceiptResult[i].debitAccName);
                                    sheet2.set(12, rowValue, voucherOrReceiptResult[i].creditAcc);
                                    sheet2.set(13, rowValue, voucherOrReceiptResult[i].creditAccName);
                                    sheet2.set(14, rowValue, voucherOrReceiptResult[i].amount, 'number');
                                    sheet2.set(15, rowValue, voucherOrReceiptResult[i].narration);
                                    sheet2.set(16, rowValue, voucherOrReceiptResult[i].voucherNum);
                                    self.excelUtility.setBorderAndAlignForCell(sheet2, 2, endIndex, rowValue, new Array(0, 14), new Array(2, 6, 7, 8, 9, 10, 12, 16), function (sheet) {
                                        sheet2 = sheet;
                                    });
                                }
                                else {
                                    sheet2.set(2, rowValue, parseInt(count2));
                                    sheet2.set(3, rowValue, voucherOrReceiptResult[i].officeName);
                                    sheet2.set(4, rowValue, voucherOrReceiptResult[i].transactionDate);
                                    sheet2.set(5, rowValue, voucherOrReceiptResult[i].chequeDate);
                                    sheet2.set(6, rowValue, voucherOrReceiptResult[i].chequeNumber);
                                    sheet2.set(7, rowValue, voucherOrReceiptResult[i].debitAcc);
                                    sheet2.set(8, rowValue, voucherOrReceiptResult[i].debitAccName);
                                    sheet2.set(9, rowValue, voucherOrReceiptResult[i].creditAcc);
                                    sheet2.set(10, rowValue, voucherOrReceiptResult[i].creditAccName);
                                    sheet2.set(11, rowValue, voucherOrReceiptResult[i].amount, 'number');
                                    sheet2.set(12, rowValue, voucherOrReceiptResult[i].narration);
                                    sheet2.set(13, rowValue, voucherOrReceiptResult[i].voucherNum);
                                    self.excelUtility.setBorderAndAlignForCell(sheet2, 2, endIndex, rowValue, new Array(0, 11), new Array(2, 4, 5, 6, 7, 8, 9, 13), function (sheet) {
                                        sheet2 = sheet;
                                    });
                                }
                                count2++;
                            }
                            else {
                                summaryArray[i] = voucherOrReceiptResult[i];
                            }
                        }
                        self.excelUtility.setAlignmentForHeader(sheet1, 2, 5, 4, new Array(10, 30, 30, 30), headerForSummarySheet, heading, function (result) {
                            sheet1 = result;
                            var count1 = 1;
                            for (var i in summaryArray) {
                                if (!summaryArray[i].transactionMasterId && summaryArray[i].officeId) {
                                    createSummarySheetForVR(self, sheet1, count1, summaryArray[i], "office");
                                    count1++;
                                }
                            }
                            for (var i in summaryArray) {
                                if (!summaryArray[i].officeId) {
                                    createSummarySheetForVR(self, sheet1, count1, summaryArray[i], "total");
                                }
                            }
                        });
                    });

                    fileLocation = rootPath+'/documents/report_documents/' + report_name;
                    workbook.save(function (err) {
                        if (err) {
                            workbook.cancel();
                            customlog.error(err.message);
                            callBack(voucherOrReceiptResult, fileLocation);
                        }
                        else {
                            callBack(voucherOrReceiptResult, fileLocation);
                        }
                    });
                }
            })
        });
    },

    // method to get loan disbursement and repayment summary
    getLoanDisbursementAndRepaymentSummaryDataModel: function (fromDate, toDate, officeId, loanOfficerId, category, loanProduct, userId, callBack) {
        var date = new Date();
        var dateTime = date.getFullYear() + '_' + (date.getMonth() + 1) + '_' + date.getDate() + '_' + date.getHours() + '_' + date.getMinutes() + '_' + date.getSeconds();
        var self = this;

        var loanDisbAndRepayQuery = "CALL  `sp_loan_disbursement_repayment_summary`('" + fromDate + "','" + toDate + "'," + officeId + "," + loanOfficerId + "," + category + "," + loanProduct + "," + userId + ")";
        var report_name = "Loan Disbursement and Repayment Report-" + dateTime + ".xlsx";
        var excel = require('msexcel-builder');
        var workbook = excel.createWorkbook(rootPath+'/documents/report_documents/', report_name);
        var fileLocation = '';
        customlog.info('Loan D & R query: ' + loanDisbAndRepayQuery);
        connectionDataSource.getConnection(function(clientConnect) {
            clientConnect.query(loanDisbAndRepayQuery, function (error, loanDisbursementRepaymentResult) {
                connectionDataSource.releaseConnectionPool(clientConnect);
                if (error) {
                    customlog.error(error);
                    callBack(loanDisbursementRepaymentResult, fileLocation);
                }
                else {
                    var loanDisbursementRepaymentResult = loanDisbursementRepaymentResult[0];
                    var rowLength = loanDisbursementRepaymentResult.length + 10;

                    var sheet1 = workbook.createSheet("Summary", 20, parseInt(rowLength));
                    var headerArrayForSummarySheet = new Array('S.No', 'Office', 'Loan Officer', 'No. Of Loans Disbursed',
                        'Total Disbursal', 'Total Collection', 'Total Collection Prin. ', 'Total Collection Int. ');

                    var sheet2 = workbook.createSheet("Detailed_Summary", 20, parseInt(rowLength));
                    var headerArrayForDetailedSheet = new Array('S.No', 'Office', 'Customer', 'Product Category', 'Loan Product', 'Loan Officer', 'Year', 'Month', 'No. Of Loans Disbursed',
                        'Disbursal Amt', 'Collection Amt', 'Collection Principal', 'Collection Interest');

                    var heading = "Loan Disbursement and Repayment Summary from " + fromDate + " to " + toDate;
                    var count1 = 1, count2 = 1, summaryArray = new Array();
                    self.excelUtility.setAlignmentForHeader(sheet2, 2, 14, 4, new Array(10, 25, 50, 20, 20, 25, 20, 20, 20, 20, 20, 20, 20), headerArrayForDetailedSheet, heading, function (result) {
                        sheet2 = result;
                        for (var i in loanDisbursementRepaymentResult) {
                            if (loanDisbursementRepaymentResult[i].office_id && loanDisbursementRepaymentResult[i].personnel_id && loanDisbursementRepaymentResult[i].account_id && loanDisbursementRepaymentResult[i].payment_id) {
                                var rowValue = parseInt(4);
                                rowValue = rowValue + parseInt(count2);
                                sheet2.set(2, rowValue, parseInt(count2));
                                sheet2.set(3, rowValue, loanDisbursementRepaymentResult[i].office);
                                sheet2.set(4, rowValue, loanDisbursementRepaymentResult[i].customer);
                                sheet2.set(5, rowValue, loanDisbursementRepaymentResult[i].product_category);
                                sheet2.set(6, rowValue, loanDisbursementRepaymentResult[i].loan_product);
                                sheet2.set(7, rowValue, loanDisbursementRepaymentResult[i].loan_officer);
                                sheet2.set(8, rowValue, loanDisbursementRepaymentResult[i].YEAR);
                                sheet2.set(9, rowValue, loanDisbursementRepaymentResult[i].MONTH);
                                sheet2.set(10, rowValue, loanDisbursementRepaymentResult[i].no_of_loans, 'number');
                                sheet2.set(11, rowValue, loanDisbursementRepaymentResult[i].disbursal_amount, 'number');
                                sheet2.set(12, rowValue, loanDisbursementRepaymentResult[i].collection_amount, 'number');
                                sheet2.set(13, rowValue, loanDisbursementRepaymentResult[i].principal, 'number');
                                sheet2.set(14, rowValue, loanDisbursementRepaymentResult[i].interest, 'number');
                                count2++;
                                self.excelUtility.setBorderAndAlignForCell(sheet2, 2, 14, rowValue, new Array(10, 11, 12, 13, 14), new Array(2, 8), function (sheet) {
                                    sheet2 = sheet;
                                });
                            }
                            else {
                                summaryArray[i] = loanDisbursementRepaymentResult[i];
                            }
                        }
                    });
                    self.excelUtility.setAlignmentForHeader(sheet1, 2, 9, 4, new Array(10, 25, 30, 30, 30, 30, 30, 30), headerArrayForSummarySheet, heading, function (result) {
                        sheet1 = result;
                        for (var i in summaryArray) {
                            var rowValue = parseInt(4);
                            rowValue = rowValue + parseInt(count1);
                            if (summaryArray[i].personnel_id && !summaryArray[i].account_id && summaryArray[i].office_id) {
                                sheet1.set(2, rowValue, parseInt(count1));
                                sheet1.set(3, rowValue, summaryArray[i].office);
                                sheet1.set(4, rowValue, summaryArray[i].loan_officer);
                                sheet1.set(5, rowValue, summaryArray[i].noOfLoansDisb, 'number');
                                sheet1.set(6, rowValue, summaryArray[i].totalDisbAmt, 'number');
                                sheet1.set(7, rowValue, summaryArray[i].totalCollection, 'number');
                                sheet1.set(8, rowValue, summaryArray[i].totalCollectionPrin, 'number');
                                sheet1.set(9, rowValue, summaryArray[i].totalCollectionInt, 'number');
                                count1++;
                            }
                            if (!summaryArray[i].office_id) {
                                sheet1.merge({col: 2, row: rowValue}, {col: 4, row: rowValue});
                                sheet1.set(2, rowValue, 'Total');
                                sheet1.set(5, rowValue, summaryArray[i].noOfLoansDisb, 'number');
                                sheet1.set(6, rowValue, summaryArray[i].totalDisbAmt, 'number');
                                sheet1.set(7, rowValue, summaryArray[i].totalCollection, 'number');
                                sheet1.set(8, rowValue, summaryArray[i].totalCollectionPrin, 'number');
                                sheet1.set(9, rowValue, summaryArray[i].totalCollectionInt, 'number');
                            }
                            self.excelUtility.setBorderAndAlignForCell(sheet1, 2, 9, rowValue, new Array(5, 6, 7, 8, 9), new Array(0, 2), function (sheet) {
                                sheet1 = sheet;
                            });
                        }
                    });

                    fileLocation = rootPath+'/documents/report_documents/' + report_name;
                    workbook.save(function (err) {
                        if (err) {
                            workbook.cancel();
                            customlog.error(err.message);
                            callBack(loanDisbursementRepaymentResult, fileLocation);
                        }
                        else {
                            callBack(loanDisbursementRepaymentResult, fileLocation);
                        }
                    });
                }
            })
        });
    },

    // Method to show interest rate wise/amount wise principal outstanding report
    getPrincipalOutstandingDataModel: function (toDate, officeId, productCategoryId, loanProductId, loanOfficerId, customer, account, reportId, includePrevOperation,userId, callBack) {
        var date = new Date();
        var dateTime = date.getFullYear() + '_' + (date.getMonth() + 1) + '_' + date.getDate() + '_' + date.getHours() + '_' + date.getMinutes() + '_' + date.getSeconds();
        var self = this;
        var prevOperation = (includePrevOperation == "on") ? 'Yes' : 'No';
        var constantObj = this.constants;
        if (reportId == constantObj.getInterestRateWisePrincipalOutstanding()) {
            var principalOutstandingQuery = "CALL  `sp_portfolio_interestratewise`('" + toDate + "'," + officeId + "," + loanOfficerId + "," + productCategoryId + "," + loanProductId + ",'" + customer + "','" + account + "','" + prevOperation + "'," + userId + ")";
            var report_name = "Interest Rate Wise Principal Outstanding_" + dateTime + ".xlsx";
        }
        else if (reportId == constantObj.getLoanAmountWisePrincipalOutstanding()) {
            var principalOutstandingQuery = "CALL  `sp_portfolio_loanamountwise`('" + toDate + "'," + officeId + "," + loanOfficerId + "," + productCategoryId + "," + loanProductId + ",'" + customer + "','" + account + "','" + prevOperation + "'," + userId + ")";
            var report_name = "Loan Amount Wise Principal Outstanding_" + dateTime + ".xlsx";
        }
        else if (reportId == constantObj.getLoanProductWisePrincipalOutstanding()) {
            var principalOutstandingQuery = "CALL  `sp_portfolio_loanproductwise`('" + toDate + "'," + officeId + "," + loanOfficerId + "," + productCategoryId + "," + loanProductId + ",'" + customer + "','" + account + "','" + prevOperation + "'," + userId + ")";
            var report_name = "Loan Product Wise Principal Outstanding_" + dateTime + ".xlsx";
        }
        else if (reportId == constantObj.getLoanPurposeWisePrincipalOutstanding()) {
            var principalOutstandingQuery = "CALL  `sp_portfolio_purposewise`('" + toDate + "'," + officeId + "," + loanOfficerId + "," + productCategoryId + "," + loanProductId + ",'" + customer + "','" + account + "','" + prevOperation + "'," + userId + ")";
            var report_name = "Loan Purpose Wise Principal Outstanding_" + dateTime + ".xlsx";
        }
        else if (reportId == constantObj.getLoanCycleWisePrincipalOutstanding()) {
            var principalOutstandingQuery = "CALL  `sp_portfolio_loancyclewise`('" + toDate + "'," + officeId + "," + loanOfficerId + "," + productCategoryId + "," + loanProductId + ",'" + customer + "','" + account + "','" + prevOperation + "'," + userId + ")";
            var report_name = "Loan Cycle Wise Principal Outstanding_" + dateTime + ".xlsx";
        }
        else if (reportId == constantObj.getLoanSizeWisePrincipalOutstanding()) {
            var principalOutstandingQuery = "CALL  `sp_portfolio_loansizewise`('" + toDate + "'," + officeId + "," + loanOfficerId + "," + productCategoryId + "," + loanProductId + ",'" + customer + "','" + account + "','" + prevOperation + "'," + userId + ")";
            var report_name = "Loan Size Wise Principal Outstanding_" + dateTime + ".xlsx";
        }
        else if (reportId == constantObj.getStateWisePrincipalOutstanding()) {
            var principalOutstandingQuery = "CALL  `sp_portfolio_statewise`('" + toDate + "'," + officeId + "," + loanOfficerId + "," + productCategoryId + "," + loanProductId + ",'" + customer + "','" + account + "','" + prevOperation + "'," + userId + ")";
            var report_name = "State Wise Principal Outstanding_" + dateTime + ".xlsx";
        }
        else {
            var principalOutstandingQuery = "CALL  `sp_portfolio_branchwise`('" + toDate + "'," + officeId + "," + loanOfficerId + "," + productCategoryId + "," + loanProductId + ",'" + customer + "','" + account + "','" + prevOperation + "'," + userId + ")";
            var report_name = "Office Wise Principal Outstanding_" + dateTime + ".xlsx";
        }
        var excel = require('msexcel-builder');
        var workbook = excel.createWorkbook(rootPath+'/documents/report_documents/', report_name);
        var fileLocation = '';

        customlog.info('Query :' + principalOutstandingQuery);
        connectionDataSource.getConnection(function(clientConnect) {
            clientConnect.query(principalOutstandingQuery, function (error, principalOutstandingResult) {
                connectionDataSource.releaseConnectionPool(clientConnect);
                if (error) {
                    customlog.error(error);
                    callBack(principalOutstandingResult, fileLocation);
                }
                else {
                    var principalOutstandingResult = principalOutstandingResult[0];
                    var rowLength = principalOutstandingResult.length + 10;

                    // sheet1 for summary
                    var sheet1 = workbook.createSheet("Summary", 15, parseInt(rowLength));
                    var headerArrayForSummary = new Array('S. No');

                    // sheet2 for detailed report
                    var sheet2 = workbook.createSheet("Principal_Outstanding_Report", 15, parseInt(rowLength));
                    var headerArrayForDetailedSheet = new Array('S.No', 'Office', 'Field Officer',
                        'Product Category', 'Loan Product', 'Customer', 'Global Account Number');
                    var endIndex = 14;
                    var widthArray = new Array(10, 30, 40, 20, 30, 50, 30, 25, 20, 20, 20, 20, 25);

                    if (reportId == constantObj.getInterestRateWisePrincipalOutstanding()) {
                        headerArrayForDetailedSheet.push('Interest Rate');
                        headerArrayForSummary.push('Interest Rate');
                        var heading = "Interest Rate Wise Principal Outstanding Summary as on " + toDate;
                    }
                    else if (reportId == constantObj.getLoanAmountWisePrincipalOutstanding()) {
                        headerArrayForDetailedSheet.push('Loan Amount');
                        headerArrayForSummary.push('Loan Amount');
                        var heading = "Loan Amount Wise Principal Outstanding Summary as on " + toDate;
                    }
                    else if (reportId == constantObj.getLoanProductWisePrincipalOutstanding()) {
                        headerArrayForDetailedSheet.push('Product');
                        headerArrayForSummary.push('Loan Product');
                        var heading = "Loan Product Wise Principal Outstanding Summary as on " + toDate;
                    }
                    else if (reportId == constantObj.getLoanPurposeWisePrincipalOutstanding()) {
                        headerArrayForDetailedSheet.push('Loan Purpose');
                        headerArrayForSummary.push('Loan Purpose');
                        var heading = "Loan Purpose Wise Principal Outstanding Summary as on " + toDate;
                    }
                    else if (reportId == constantObj.getLoanCycleWisePrincipalOutstanding()) {
                        headerArrayForDetailedSheet.push('Loan Cycle');
                        headerArrayForSummary.push('Loan Cycle');
                        var heading = "Loan Cycle Wise Principal Outstanding Summary as on " + toDate;
                    }
                    else if (reportId == constantObj.getLoanSizeWisePrincipalOutstanding()) {
                        headerArrayForDetailedSheet.push('Loan Size');
                        headerArrayForSummary.push('Loan Size');
                        var heading = "Loan Size Wise Principal Outstanding Summary as on " + toDate;
                    }
                    else if (reportId == constantObj.getStateWisePrincipalOutstanding()) {
                        headerArrayForDetailedSheet.push('State');
                        headerArrayForSummary.push('State');
                        var heading = "State Wise Principal Outstanding Summary as on " + toDate;
                    }
                    else {
                        var heading = "Office Wise Principal Outstanding Summary as on " + toDate;
                        headerArrayForSummary.push('Office');
                        endIndex = 13;
                        widthArray = new Array(10, 30, 40, 20, 30, 50, 30, 20, 20, 20, 20, 25);
                    }
                    headerArrayForDetailedSheet.push('Principal', 'Interest', 'Principal Paid', 'Interest Paid', 'Principal Outstanding');
                    headerArrayForSummary.push('Principal', 'Interest', 'Principal Paid', 'Interest Paid', 'Principal Outstanding');

                    var count1 = 1, count2 = 1, summaryArray = new Array();
                    self.excelUtility.setAlignmentForHeader(sheet2, 2, endIndex, 4, widthArray, headerArrayForDetailedSheet, heading, function (result) {
                        sheet2 = result;
                        for (var i in principalOutstandingResult) {
                            if (principalOutstandingResult[i].account_id && principalOutstandingResult[i].office_id) {
                                var rowValue = parseInt(4);
                                rowValue = rowValue + parseInt(count2);
                                sheet2.set(2, rowValue, parseInt(count2), 'number');
                                sheet2.set(3, rowValue, principalOutstandingResult[i].office);
                                sheet2.set(4, rowValue, principalOutstandingResult[i].loan_officer);
                                sheet2.set(5, rowValue, principalOutstandingResult[i].product_category);
                                sheet2.set(6, rowValue, principalOutstandingResult[i].loan_product);
                                sheet2.set(7, rowValue, principalOutstandingResult[i].group_name);
                                sheet2.set(8, rowValue, principalOutstandingResult[i].account_num);
                                if (reportId == constantObj.getInterestRateWisePrincipalOutstanding()) {
                                    sheet2.set(9, rowValue, principalOutstandingResult[i].interest_rate);
                                }
                                else if (reportId == constantObj.getLoanAmountWisePrincipalOutstanding()) {
                                    sheet2.set(9, rowValue, principalOutstandingResult[i].loan_amount);
                                }
                                else if (reportId == constantObj.getLoanProductWisePrincipalOutstanding()) {
                                    sheet2.set(9, rowValue, principalOutstandingResult[i].product);
                                }
                                else if (reportId == constantObj.getLoanPurposeWisePrincipalOutstanding()) {
                                    sheet2.set(9, rowValue, principalOutstandingResult[i].loan_purpose);
                                }
                                else if (reportId == constantObj.getLoanCycleWisePrincipalOutstanding()) {
                                    sheet2.set(9, rowValue, principalOutstandingResult[i].loan_cycle);
                                }
                                else if (reportId == constantObj.getLoanSizeWisePrincipalOutstanding()) {
                                    sheet2.set(9, rowValue, principalOutstandingResult[i].loan_size);
                                }
                                else if (reportId == constantObj.getStateWisePrincipalOutstanding()) {
                                    sheet2.set(9, rowValue, principalOutstandingResult[i].state);
                                }
                                sheet2.set(10, rowValue, principalOutstandingResult[i].principal, 'number');
                                sheet2.set(11, rowValue, principalOutstandingResult[i].interest, 'number');
                                sheet2.set(12, rowValue, principalOutstandingResult[i].principal_paid, 'number');
                                sheet2.set(13, rowValue, principalOutstandingResult[i].interest_paid, 'number');
                                sheet2.set(14, rowValue, principalOutstandingResult[i].prin_outstanding, 'number');
                                self.excelUtility.setBorderAndAlignForCell(sheet2, 2, endIndex, rowValue, new Array(10, 11, 12, 13, 14), new Array(2, 8, 9), function (sheet) {
                                    sheet2 = sheet;
                                });
                                count2++;
                            }
                            else {
                                summaryArray[i] = principalOutstandingResult[i];
                            }
                        }
                    })
                    self.excelUtility.setAlignmentForHeader(sheet1, 2, 8, 4, new Array(10, 25, 30, 30, 30, 30, 30), headerArrayForSummary, heading, function (result) {
                        sheet1 = result;
                        for (var i in summaryArray) {
                            if (reportId != constantObj.getOfficeWisePrincipalOutstanding()) {
                                if (!summaryArray[i].account_id && !summaryArray[i].personnel_id && !summaryArray[i].office_id &&
                                    (summaryArray[i].state || summaryArray[i].interest_rate || summaryArray[i].interest_rate == 0.00 || summaryArray[i].loan_amount ||
                                        summaryArray[i].loan_cycle || summaryArray[i].product || summaryArray[i].loan_purpose || summaryArray[i].loan_size)) {
                                    createSummarySheet(self, sheet1, count1, summaryArray[i], "office");
                                    count1++
                                }
                            }
                            else {
                                if (!summaryArray[i].account_id && !summaryArray[i].personnel_id && summaryArray[i].office_id) {
                                    createSummarySheet(self, sheet1, count1, summaryArray[i], "office");
                                    count1++
                                }
                            }
                        }
                        for (var i in summaryArray) {
                            if ((!summaryArray[i].account_id && !summaryArray[i].personnel_id && !summaryArray[i].office_id && !summaryArray[i].loan_amount) && reportId != constantObj.getLoanAmountWisePrincipalOutstanding()) {
                                createSummarySheet(self, sheet1, count1, summaryArray[i], "total");
                            }
                            else if ((!summaryArray[i].account_id && !summaryArray[i].personnel_id && !summaryArray[i].office_id && !summaryArray[i].loan_size) && reportId != constantObj.getLoanSizeWisePrincipalOutstanding()) {
                                createSummarySheet(self, sheet1, count1, summaryArray[i], "total");
                            }
                            else if (reportId == constantObj.getLoanAmountWisePrincipalOutstanding() && reportId == constantObj.getLoanSizeWisePrincipalOutstanding()) {
                                createSummarySheet(self, sheet1, count1, summaryArray[i], "total");
                            }
                        }
                    })
                    fileLocation = rootPath+'/documents/report_documents/' + report_name;
                    workbook.save(function (err) {
                        if (err) {
                            workbook.cancel();
                            customlog.error(err.message);
                            callBack(principalOutstandingResult, fileLocation);
                        }
                        else {
                            callBack(principalOutstandingResult, fileLocation);
                        }
                    });
                }
            })
        });
    },

    getDEOActivityTrackingDataModel: function (fromDate, toDate, officeId, customer, roleId, userId, callBack) {
        var date = new Date();
        var dateTime = date.getFullYear() + '_' + (date.getMonth() + 1) + '_' + date.getDate() + '_' + date.getHours() + '_' + date.getMinutes() + '_' + date.getSeconds();
        var self = this;
        var constantsObj =  this.constants;
        var DEOActivityTrackingQuery = "SELECT o.office_name,pg.group_name,pg.center_name,pc.client_name," +
            "IF(pcdeo.data_entry_by,us.user_name,'') AS data_entry_by," +
            "IF(pcdeo.data_entry_updated_by,us1.user_name,'') AS data_entry_updated_by," +
            "IF(pcdeo.credit_check_by,us2.user_name,'') AS credit_check_by," +
            "IF(pcdeo.data_verified_by,us3.user_name,'') AS data_verified_by," +
            "DATE_FORMAT(pcdeo.created_date,'%d-%b-%Y') AS data_entry_date," +
            "DATE_FORMAT(pcdeo.data_entry_updated_date,'%d-%b-%Y') AS data_updated_date," +
            "DATE_FORMAT(pcdeo.data_verified_date,'%d-%b-%Y') AS data_verified_date," +
            "DATE_FORMAT(pcdeo.credit_updated_date,'%d-%b-%Y') AS credit_updated_date " +
            "FROM " + dbTableName.iklantProspectClientDataEntryTracking + " pcdeo  " +
            "INNER JOIN " + dbTableName.iklantProspectClient + " pc ON pc.client_id = pcdeo.client_id " +
            "INNER JOIN " + dbTableName.iklantProspectGroup + " pg ON pg.group_id = pc.group_id " +
            "INNER JOIN " + dbTableName.iklantOffice + " o ON o.office_id = pg.office_id " +
            "LEFT JOIN " + dbTableName.iklantUsers + " us ON us.user_id = pcdeo.data_entry_by " +
            "LEFT JOIN " + dbTableName.iklantUsers + " us1 ON us1.user_id = pcdeo.data_entry_updated_by " +
            "LEFT JOIN " + dbTableName.iklantUsers + " us2 ON us2.user_id = pcdeo.credit_check_by " +
            "LEFT JOIN " + dbTableName.iklantUsers + " us3 ON us3.user_id = pcdeo.data_verified_by " +
            "LEFT JOIN rm_regional_office_list rmro ON rmro.office_id = o.office_id " +
            "WHERE (pcdeo.created_date BETWEEN '" + fromDate + "' AND '" + toDate + "') AND " +
            "(pcdeo.data_entry_updated_date BETWEEN '" + fromDate + "' AND '" + toDate + "') AND " +
            "(pcdeo.data_verified_date BETWEEN '" + fromDate + "' AND '" + toDate + "') AND " +
            "(pcdeo.credit_updated_date BETWEEN '" + fromDate + "' AND '" + toDate + "') " +
            "AND (rmro.user_id = " + userId + " OR " + userId + " = -1) " +
            "AND (o.office_id = " + officeId + " OR " + officeId + " = -1) " +
            "AND (pg.group_global_number LIKE CONCAT('%','" + customer + "','%') OR pc.client_global_number LIKE CONCAT('%','" + customer + "','%') " +
            "OR pg.center_name LIKE CONCAT('%','" + customer + "','%') OR pc.client_name LIKE CONCAT('%','" + customer + "','%'))";
        var report_name = "DEO Activity Tracking Report-" + dateTime + ".xlsx";
        customlog.info('DEOActivityTrackingQuery '+DEOActivityTrackingQuery);
        var excel = require('msexcel-builder');
        var workbook = excel.createWorkbook(rootPath+'/documents/report_documents/', report_name);
        var fileLocation = '';
        connectionDataSource.getConnection(function(clientConnect) {
            clientConnect.query(DEOActivityTrackingQuery, function (error, DEOActivityTrackingResult) {
                connectionDataSource.releaseConnectionPool(clientConnect);
                if (error) {
                    customlog.error(error);
                    callBack(DEOActivityTrackingResult, fileLocation);
                }
                else {
                    if (DEOActivityTrackingResult.length > 0) {
                        var rowLength = DEOActivityTrackingResult.length + 10;
                        var sheet = workbook.createSheet("DEOActivityTrackingReport", 20, parseInt(rowLength));
                        var headerArrayForDetailedSheet = new Array('S.No', 'Office', 'Group Name', 'Client Name', 'Data Entry By', 'Date', 'Data Updated By', 'Date', 'Data Verified By', 'Date', 'CC By', 'Date');
                        var count = 1;
                        self.excelUtility.setAlignmentForHeader(sheet, 2, 13, 4, new Array(10, 25, 50, 35, 20, 20, 20, 20, 20, 20, 20, 20), headerArrayForDetailedSheet, "DEO Activity Tracking from " + fromDate + " to " + toDate, function (result) {
                            sheet = result;
                            for (var i in DEOActivityTrackingResult) {
                                var rowValue = parseInt(4);
                                rowValue = rowValue + count;
                                sheet.set(2, rowValue, count);
                                sheet.set(3, rowValue, DEOActivityTrackingResult[i].office_name);
                                sheet.set(4, rowValue, DEOActivityTrackingResult[i].group_name + ' ' + DEOActivityTrackingResult[i].center_name);
                                sheet.set(5, rowValue, DEOActivityTrackingResult[i].client_name);
                                sheet.set(6, rowValue, DEOActivityTrackingResult[i].data_entry_by);
                                sheet.set(7, rowValue, DEOActivityTrackingResult[i].data_entry_date);
                                sheet.set(8, rowValue, DEOActivityTrackingResult[i].data_entry_updated_by);
                                sheet.set(9, rowValue, DEOActivityTrackingResult[i].data_updated_date);
                                sheet.set(10, rowValue, DEOActivityTrackingResult[i].data_verified_by);
                                sheet.set(11, rowValue, DEOActivityTrackingResult[i].data_verified_date);
                                sheet.set(12, rowValue, DEOActivityTrackingResult[i].credit_check_by);
                                sheet.set(13, rowValue, DEOActivityTrackingResult[i].credit_updated_date);
                                self.excelUtility.setBorderAndAlignForCell(sheet, 2, 13, rowValue, new Array(), new Array(0, 2), function (sheet) {
                                    sheet = sheet;
                                });
                                count++;
                            }
                        });

                        fileLocation = rootPath+'/documents/report_documents/' + report_name;
                        workbook.save(function (err) {
                            if (err) {
                                workbook.cancel();
                                customlog.error(err.message);
                                callBack(DEOActivityTrackingResult, fileLocation);
                            }
                            else {
                                callBack(DEOActivityTrackingResult, fileLocation);
                            }
                        });
                    }
                    else {
                        callBack(DEOActivityTrackingResult, fileLocation);
                    }
                }
            })
        });
    },

    getPARReportDataModel: function (toDate, officeId, daysInArrears, reportId, userId, callBack) {
        var date = new Date();
        var dateTime = date.getFullYear() + '_' + (date.getMonth() + 1) + '_' + date.getDate() + '_' + date.getHours() + '_' + date.getMinutes() + '_' + date.getSeconds();
        var constantsObj = this.constants;
        var self = this;
        if (reportId == constantsObj.getPARClientWiseReport()) {
            var PARReportQuery = "CALL sp_par_client_wise_report('" + toDate + "'," + officeId + "," + daysInArrears + "," + userId + ")";
        }
        else {
            var PARReportQuery = "CALL sp_par_group_wise_report('" + toDate + "'," + officeId + "," + daysInArrears + "," + userId + ")";
        }
        var report_name = "PAR_" + daysInArrears + "_Report_"+dateTime+".xlsx";
        var excel = require('msexcel-builder');
        var workbook = excel.createWorkbook(rootPath+'/documents/report_documents/', report_name);
        var fileLocation = '';
        customlog.info('Query: ' + PARReportQuery);
        connectionDataSource.getConnection(function(clientConnect) {
            clientConnect.query(PARReportQuery, function (error, PARResult) {
                connectionDataSource.releaseConnectionPool(clientConnect);
                if (error) {
                    customlog.error(error);
                    callBack(PARResult, fileLocation);
                }
                else {
                    var PARResult = PARResult[0];
                    if (PARResult.length > 0) {
                        var rowLength = PARResult.length + 10, count = 1, previous = -1;
                        var sheet = workbook.createSheet(PARResult[0].office, 20, parseInt(rowLength));
                        var headerArrayForDetailedSheet = new Array('Month', 'Office', 'Field Officer', 'Group Code', 'Group Name', 'Client Name', 'Due Date', 'Due Amount', 'Paid Amount', 'Overdue Amount', 'Total Principal', 'Total Principal Paid', 'Principal Outstanding', 'Days in Arrears');
                        for (var i in PARResult) {
                            if (PARResult[i].due_date && PARResult[i].office_id && PARResult[i].group_name) {
                                var rowValue = parseInt(4);
                                if (previous >= 0) {
                                    if (PARResult[i].office_id != PARResult[previous].office_id) {
                                        count = 1;
                                        sheet = workbook.createSheet(PARResult[i].office, 20, parseInt(rowLength));
                                        self.excelUtility.setAlignmentForHeader(sheet, 3, 16, 4, new Array(20, 20, 35, 20, 50, 35, 20, 20, 20, 20, 25, 25, 25, 25), headerArrayForDetailedSheet, "PAR-" + daysInArrears + " as on " + toDate, function (result) {
                                            sheet = result;
                                            rowValue = rowValue + count;
                                            sheet.set(3, rowValue, PARResult[i].months);
                                            sheet.set(4, rowValue, PARResult[i].office);
                                            sheet.set(5, rowValue, PARResult[i].field_officer);
                                            sheet.set(6, rowValue, PARResult[i].grp_code);
                                            sheet.set(7, rowValue, PARResult[i].group_name);
                                            sheet.set(8, rowValue, PARResult[i].customer);
                                            sheet.set(9, rowValue, PARResult[i].due_date);
                                            sheet.set(10, rowValue, PARResult[i].due_amount, 'number');
                                            sheet.set(11, rowValue, PARResult[i].paid_amount, 'number');
                                            sheet.set(12, rowValue, PARResult[i].over_due_amt, 'number');
                                            sheet.set(13, rowValue, PARResult[i].total_principal, 'number');
                                            sheet.set(14, rowValue, PARResult[i].total_principal_paid, 'number');
                                            sheet.set(15, rowValue, PARResult[i].principal_outstanding, 'number');
                                            sheet.set(16, rowValue, PARResult[i].days_in_arrears, 'number');
                                            self.excelUtility.setBorderAndAlignForCell(sheet, 3, 16, rowValue, new Array(10, 11, 12, 13,14,15,16), new Array(6, 9), function (sheet) {
                                                sheet = sheet;
                                            });
                                            count++;
                                        });
                                    }
                                    else {
                                        rowValue = rowValue + count;
                                        sheet.set(3, rowValue, PARResult[i].months);
                                        sheet.set(4, rowValue, PARResult[i].office);
                                        sheet.set(5, rowValue, PARResult[i].field_officer);
                                        sheet.set(6, rowValue, PARResult[i].grp_code);
                                        sheet.set(7, rowValue, PARResult[i].group_name);
                                        sheet.set(8, rowValue, PARResult[i].customer);
                                        sheet.set(9, rowValue, PARResult[i].due_date);
                                        sheet.set(10, rowValue, PARResult[i].due_amount, 'number');
                                        sheet.set(11, rowValue, PARResult[i].paid_amount, 'number');
                                        sheet.set(12, rowValue, PARResult[i].over_due_amt, 'number');
                                        sheet.set(13, rowValue, PARResult[i].total_principal, 'number');
                                        sheet.set(14, rowValue, PARResult[i].total_principal_paid, 'number');
                                        sheet.set(15, rowValue, PARResult[i].principal_outstanding, 'number');
                                        sheet.set(16, rowValue, PARResult[i].days_in_arrears, 'number');
                                        self.excelUtility.setBorderAndAlignForCell(sheet, 3, 16, rowValue, new Array(10, 11, 12, 13,14,15,16), new Array(6, 9), function (sheet) {
                                            sheet = sheet;
                                        });
                                        count++;
                                    }
                                }
                                else {
                                    self.excelUtility.setAlignmentForHeader(sheet, 3, 16, 4, new Array(20, 20, 35, 20, 50, 35, 20, 20, 20, 20, 25, 25, 25, 25), headerArrayForDetailedSheet, "PAR-" + daysInArrears + " as on " + toDate, function (result) {
                                        sheet = result;
                                        rowValue = rowValue + count;
                                        sheet.set(3, rowValue, PARResult[i].months);
                                        sheet.set(4, rowValue, PARResult[i].office);
                                        sheet.set(5, rowValue, PARResult[i].field_officer);
                                        sheet.set(6, rowValue, PARResult[i].grp_code);
                                        sheet.set(7, rowValue, PARResult[i].group_name);
                                        sheet.set(8, rowValue, PARResult[i].customer);
                                        sheet.set(9, rowValue, PARResult[i].due_date);
                                        sheet.set(10, rowValue, PARResult[i].due_amount, 'number');
                                        sheet.set(11, rowValue, PARResult[i].paid_amount, 'number');
                                        sheet.set(12, rowValue, PARResult[i].over_due_amt, 'number');
                                        sheet.set(13, rowValue, PARResult[i].total_principal, 'number');
                                        sheet.set(14, rowValue, PARResult[i].total_principal_paid, 'number');
                                        sheet.set(15, rowValue, PARResult[i].principal_outstanding, 'number');
                                        sheet.set(16, rowValue, PARResult[i].days_in_arrears, 'number');
                                        self.excelUtility.setBorderAndAlignForCell(sheet, 3, 16, rowValue, new Array(10, 11, 12, 13,14,15,16), new Array(6, 9), function (sheet) {
                                            sheet = sheet;
                                        });
                                    });
                                    count++;
                                }
                                previous++;
                            }
                        }
                        fileLocation = rootPath+'/documents/report_documents/' + report_name;
                        workbook.save(function (err) {
                            if (err) {
                                workbook.cancel();
                                customlog.error(err.message);
                                callBack(PARResult, fileLocation);
                            }
                            else {
                                callBack(PARResult, fileLocation);
                            }
                        });
                    }
                    else {
                        callBack(PARResult, fileLocation);
                    }
                }
            })
        });
    },
    getLUCTrackingReportDataModel: function (fromDate,toDate,officeId,roleId,download_report,userId,callBack) {
        var date = new Date();
        var dateTime = date.getFullYear() + '_' + (date.getMonth() + 1) + '_' + date.getDate() + '_' + date.getHours() + '_' + date.getMinutes() + '_' + date.getSeconds();
        var self = this;
        var constantsObj =  this.constants;
        var moment = require('moment');
        var LUCTrackingQuery = "SELECT o.office_name,ipg.group_name,ipg.center_name,c.display_name," +
            "IF(cnd.name_type = 1,cnd.first_name,'') AS guarantor_name,IFNULL(lv1.lookup_name,'') AS relationship," +
            "CONCAT(cad.line_1, IF(cad.line_2 IS NULL OR cad.line_2='', '', CONCAT(', ',cad.line_2))," +
            "IF(cad.line_3 IS NULL OR cad.line_3='', '', CONCAT(', ',cad.line_3))," +
            "IF(cad.city IS NULL OR cad.city='', '', CONCAT(', ',cad.city))) AS clientAddress," +
            "ROUND(la.loan_amount,2) AS loan_amount,IFNULL(SUBSTRING(SUBSTRING_INDEX(lv.lookup_name,'.',2),14),'Others') AS loan_purpose," +
            "ROUND(la.interest_rate,2) AS interest_rate,MAX(ls.installment_id) AS tenure," +
            "DATE_FORMAT(luc.luc_date,'%d-%m-%Y') AS luc_date," +
            "IF(luc.is_loan_used_for_intended_purpose = 1,'Yes','No') AS is_loan_used_for_intended_purpose," +
            "luc.reason_for_not_using_loan_indened_purpose,IF(luc.physical_verfication = 1,'Yes','No') AS physical_verfication, " +
            "luc.reason_for_not_physically_verifiying,IF(luc.is_luc_result_satisfied = 1,'Yes','No') AS is_luc_result_satisfied," +
            "luc.reason_for_luc,IF(luc.is_there_any_grievance_with_fo_or_branch = 1,'Yes','No') AS is_there_any_grievance_with_fo_or_branch," +
            "luc.remarks,u.user_name as done_by,la.disbursement_date,luc.luc_count " +
            "FROM " + dbTableName.iklantLoanUtilizationCheck + " luc " +
            "INNER JOIN " + dbTableName.iklantMifosMapping + " imm ON imm.mifos_customer_id = luc.group_id " +
            "INNER JOIN " + dbTableName.iklantProspectGroup + " ipg ON ipg.group_id = imm.group_id " +
            "INNER JOIN customer c ON c.parent_customer_id = luc.group_id " +
            "INNER JOIN loan_account la ON la.account_id = luc.account_id " +
            "INNER JOIN loan_schedule ls ON ls.account_id = luc.account_id " +
            "INNER JOIN " + dbTableName.iklantOffice + " o ON o.office_id = ipg.office_id " +
            "INNER JOIN " + dbTableName.iklantUsers + " u ON u.user_id = luc.luc_done_by " +
            "INNER JOIN customer_name_detail cnd ON cnd.customer_id = c.customer_id " +
            "INNER JOIN spouse_father_lookup spl ON spl.spouse_father_id = cnd.name_type " +
            "INNER JOIN customer_address_detail cad ON cad.customer_id = c.customer_id " +
            "INNER JOIN rm_regional_office_list rmro ON rmro.office_id = o.office_id " +
            "LEFT JOIN lookup_value lv1 ON spl.lookup_id = lv1.lookup_id " +
            "LEFT JOIN lookup_value lv ON la.business_activities_id = lv.lookup_id " +
            "WHERE (o.office_id = " + officeId + " OR " + officeId + " = -1) " +
            "AND (rmro.user_id = " + userId + " OR " + userId + " = -1) " +
            "AND luc.luc_date BETWEEN '" + fromDate + " 00:00:00' AND '" + toDate + " 23:59:59' " +
            "AND luc.luc_count = (SELECT MAX(iluc.luc_count) FROM iklant_loan_utilization_check iluc WHERE iluc.client_id = c.customer_id) GROUP BY c.customer_id";
        var report_name = "LUC Tracking Report-" + dateTime + ".xlsx";
        var excel = require('msexcel-builder');
        var workbook = excel.createWorkbook(rootPath+'/documents/report_documents', report_name);
        var fileLocation = '';
        connectionDataSource.getConnection(function(clientConnect) {
            clientConnect.query(LUCTrackingQuery, function (error, LUCTrackingResult) {
                connectionDataSource.releaseConnectionPool(clientConnect);
                if (error) {
                    console.log(error);
                    callBack(LUCTrackingResult, fileLocation);
                }
                else {
                    if (LUCTrackingResult.length > 0 && download_report == 'Download') {
                        var rowLength = LUCTrackingResult.length + 10;
                        var sheet = workbook.createSheet("LUCTrackingReport", 30, parseInt(rowLength));
                        var headerArrayForDetailedSheet = new Array('S.No', 'Office', 'Group Code', 'Group Name',  'Customer Name', 'Guarantor Name', 'Relationship', 'Address',
                            'Loan Amount', 'Loan Purpose', 'Interest Rate', 'Total Tenure', 'Last LUC Done', 'Next LUC Due', 'Done by', 'Whether loan amount used for intended purpose?',
                            'Reason', 'Physically Verified?', 'Reason', 'Is LUC result satisfied?', 'Reason', 'Is there any grievance with FO or Branch?','Remarks');
                        var count = 1;
                        self.excelUtility.setAlignmentForHeader(sheet, 2, 24, 4, new Array(10, 25, 20, 30, 30, 30, 30, 80, 20, 20, 20, 20, 20, 20, 30, 30, 40, 30, 40, 30, 40, 30, 40), headerArrayForDetailedSheet, "LUC Tracking report from " + fromDate + " to " + toDate, function (result) {
                            sheet = result;
                            for (var i in LUCTrackingResult) {
                                var rowValue = parseInt(4);
                                rowValue = rowValue + count;
                                sheet.set(2, rowValue, count);
                                sheet.set(3, rowValue, LUCTrackingResult[i].office_name);
                                sheet.set(4, rowValue, LUCTrackingResult[i].group_name);
                                sheet.set(5, rowValue, LUCTrackingResult[i].center_name);
                                sheet.set(6, rowValue, LUCTrackingResult[i].display_name);
                                sheet.set(7, rowValue, LUCTrackingResult[i].guarantor_name);
                                sheet.set(8, rowValue, LUCTrackingResult[i].relationship);
                                sheet.set(9, rowValue, LUCTrackingResult[i].clientAddress);
                                sheet.set(10, rowValue, LUCTrackingResult[i].loan_amount,'number');
                                sheet.set(11, rowValue, LUCTrackingResult[i].loan_purpose);
                                sheet.set(12, rowValue, LUCTrackingResult[i].interest_rate);
                                sheet.set(13, rowValue, LUCTrackingResult[i].tenure);
                                sheet.set(14, rowValue, LUCTrackingResult[i].luc_date);
                                var newDate = moment(LUCTrackingResult[i].disbursement_date);
                                if(LUCTrackingResult[i].tenure == 12) {
                                    if(LUCTrackingResult[i].luc_count == 0)
                                        sheet.set(15, rowValue, moment(newDate).add(6,'months').format("DD-MM-YYYY"));
                                    else if(LUCTrackingResult[i].luc_count == 1)
                                        sheet.set(15, rowValue, moment(newDate).add(12,'months').format("DD-MM-YYYY"));
                                    else
                                        sheet.set(15, rowValue, "Completed");
                                }
                                else if(LUCTrackingResult[i].tenure == 24){
                                    if(LUCTrackingResult[i].luc_count == 0)
                                        sheet.set(15, rowValue, moment(newDate).add(6,'months').format("DD-MM-YYYY"));
                                    else if(LUCTrackingResult[i].luc_count == 1)
                                        sheet.set(15, rowValue, moment(newDate).add(12,'months').format("DD-MM-YYYY"));
                                    else if(LUCTrackingResult[i].luc_count == 2)
                                        sheet.set(15, rowValue, moment(newDate).add(18,'months').format("DD-MM-YYYY"));
                                    else if(LUCTrackingResult[i].luc_count == 3)
                                        sheet.set(15, rowValue, moment(newDate).add(24,'months').format("DD-MM-YYYY"));
                                    else
                                        sheet.set(15, rowValue, "Completed");
                                }
                                sheet.set(16, rowValue, LUCTrackingResult[i].done_by);
                                sheet.set(17, rowValue, LUCTrackingResult[i].is_loan_used_for_intended_purpose);
                                sheet.set(18, rowValue, LUCTrackingResult[i].reason_for_not_using_loan_indened_purpose);
                                sheet.set(19, rowValue, LUCTrackingResult[i].physical_verfication);
                                sheet.set(20, rowValue, LUCTrackingResult[i].reason_for_not_physically_verifiying);
                                sheet.set(21, rowValue, LUCTrackingResult[i].is_luc_result_satisfied);
                                sheet.set(22, rowValue, LUCTrackingResult[i].reason_for_luc);
                                sheet.set(23, rowValue, LUCTrackingResult[i].is_there_any_grievance_with_fo_or_branch);
                                sheet.set(24, rowValue, LUCTrackingResult[i].remarks);

                                self.excelUtility.setBorderAndAlignForCell(sheet, 2, 24, rowValue, new Array(0,10), new Array(2,4,12,13,14,15,17,19,21,23), function (sheet) {
                                    sheet = sheet;
                                });
                                count++;
                            }
                        });

                        fileLocation = rootPath+'/documents/report_documents/' + report_name;
                        workbook.save(function (err) {
                            if (err) {
                                workbook.cancel();
                                callBack(LUCTrackingResult, fileLocation);
                            }
                            else {
                                callBack(LUCTrackingResult, fileLocation);
                            }
                        });
                    }
                    else {
                        callBack(LUCTrackingResult, fileLocation);
                    }
                }
            })
        });
    },
*/
    /* getActiveOrRejectedClientsDataModel: function (group_id, callBack) {
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
     customlog.info("activeOrRejectedDetailsQuery: "+activeOrRejectedDetailsQuery);
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
     },*/

    /*reportsMenuDataModel: function (reportCategoryId, roleId, callBack) {
        var self = this;
        var reportQuery = "SELECT report_id,LOCATE('voucher',report_name) AS is_voucher,report_name,description,report_category_id,under_maintenance,active,role_id,created_date FROM  reports_custom WHERE report_category_id = " + reportCategoryId + " AND under_maintenance = 0 AND active = 1 AND FIND_IN_SET("+roleId+",role_id)ORDER BY report_name";
        connectionDataSource.getConnection(function (clientConnect) {
            clientConnect.query(reportQuery, function (error, reportResult) {
                connectionDataSource.releaseConnectionPool(clientConnect);
                if (error) {
                    callBack(reportResult);
                }
                else {
                    callBack(reportResult);
                }
            });
        });
    },

    getReportStatusDataModel: function (reportId, callBack) {
        var self = this;
        connectionDataSource.getConnection(function (clientConnect) {
            clientConnect.query("SELECT * FROM  reports_custom WHERE report_id = " + reportId, function (error, result) {
                connectionDataSource.releaseConnectionPool(clientConnect);
                if (error) {
                    callBack("Error");
                    customlog.error(error);
                }
                else {
                    var statusMessage = (result[0].active == 1 && result[0].under_maintenance == 0) ? "Success" : "Error";
                    callBack(statusMessage);
                }
            })
        });
    },
*/
/*    getIklantGroupIdFromCustomerIdDataModel: function (mifosCustomerId, callback) {
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

    getGroupsForBackGroundVerificationDataModel: function (officeId, callback) {
        var self = this;
        var backGroundVerificationQuery = "SELECT loan_amount,DATE_FORMAT(disbursement_date,'%d/%m/%y') AS disbursement_date,c.display_name AS group_name,la.account_id,c.global_cust_num AS globalCustNo," +
            "(SELECT COUNT(account_id) FROM loan_account la1 WHERE la1.parent_account_id = la.account_id) AS noOfClients FROM loan_account la INNER JOIN account a ON a.account_id = la.account_id " +
            "INNER JOIN customer c ON c.customer_id = a.customer_id INNER JOIN office o ON o.office_id = a.office_id LEFT JOIN loan_custom_detail lcd ON la.account_id = lcd.account_id " +
            "WHERE parent_account_id IS NULL AND is_loan_disbursal_verified = 0 AND a.office_id = " + officeId;
        customlog.info("Query" + backGroundVerificationQuery);
        connectionDataSource.getConnection(function (clientConnect) {
            clientConnect.query(backGroundVerificationQuery, function (error, backGroundVerificationResult) {
                connectionDataSource.releaseConnectionPool(clientConnect);
                if (error) {
                    customlog.error(error);
                    callback(backGroundVerificationResult);
                }
                else {
                    callback(backGroundVerificationResult);
                }
            });
        });
    },

    retrieveClientDetailsForVerificationPageDataModel: function (parent_customer_id, callback) {
        var self = this;
        var retrieveClientDetailsQuery = "select la.account_id,loan_amount,c.display_name AS client_name,ccd.phone_number " +
            " FROM loan_account la INNER JOIN account a ON a.account_id = la.account_id " +
            " INNER JOIN customer c ON c.customer_id = a.customer_id INNER JOIN office o ON o.office_id = a.office_id " +
            " INNER JOIN loan_custom_detail lcd ON lcd.account_id = la.account_id LEFT JOIN customer_address_detail ccd ON c.customer_id = ccd.customer_id " +
            " WHERE parent_account_id IS not NULL AND is_loan_disbursal_verified = 0 AND parent_account_id = " + parent_customer_id;
        connectionDataSource.getConnection(function (clientConnect) {
            clientConnect.query(retrieveClientDetailsQuery, function selectCb(err, results, fields) {
                connectionDataSource.releaseConnectionPool(clientConnect);
                if (err) {
                }
                callback(results);
            });
        });
    },
    //Ended by chitra*/

    // added by Ezra Johnson
    /*getKYCUploadStatusDataModel: function(groupId, callback){
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
     customlog.error(err);
     }
     callback(results);
     });
     });
     },*/

    /*moveForDataEntryDataModel: function(groupId, callback){
     var self = this;
     var moveForDEQuery = " UPDATE `"+dbTableName.iklantProspectGroup+"` SET `status_id`=3 WHERE `group_id`="+groupId;
     connectionDataSource.getConnection(function (clientConnect) {
     clientConnect.query(moveForDEQuery, function (err, results, fields) {
     connectionDataSource.releaseConnectionPool(clientConnect);
     if (err) {
     callback("failure");
     customlog.error(err);
     }
     else{
     callback("success");
     }
     });
     });
     },*/
    /*getGroupRecognitionTestDetailsDataModel: function(groupId,callback) {
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
     customlog.info(retrieveQuery);
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
     customlog.info(retrieveQuery);
     connectionDataSource.releaseConnectionPool(clientConnect);
     callback("failure");
     } else {
     for (var i = 0; i < result.length; i++) {
     questionCategoryId[i] = result[i].category;
     question[i] = result[i].check_point_ques;
     questionId[i] = result[i].pt_id;
     }
     retrieveQuery = "SELECT COUNT(*) AS no_of_clients FROM " + dbTableName.iklantProspectClient + " WHERE group_id = "+groupId+" AND `status_id`="+constantsObj.getAppraisedStatus();
     customlog.info(retrieveQuery);
     clientConnect.query(retrieveQuery, function (err, result) {
     connectionDataSource.releaseConnectionPool(clientConnect);
     if (err) {
     customlog.error("error in "+retrieveQuery);
     callback("failure");
     } else {
     var noOfClients = "";
     if(result.length > 0)
     noOfClients = result[0].no_of_clients;
     customlog.info("noOfClients in appraisal state: "+noOfClients);
     callback('success',categoryId,categoryDesc,questionCategoryId,question,questionId,noOfClients);
     }
     });
     }
     });
     }
     });
     });
     },*/
    /*saveRatingForGRTDataModel: function(groupId,questionIdDetails,createdBy,checkedOrNotDetails,totalRating,remarks, callback) {
     var self = this;
     var saveRatingQuery;
     var constantsObj = this.constants;
     var groupStatus;
     if(remarks == undefined){
     remarks=''
     }
     customlog.info(totalRating);
     connectionDataSource.getConnection(function (clientConnect) {

     *//**
     *  As per client requirement, storing each question's answer is not required.
     *  But it might be used in the future.
     *//*

     *//*for(var i=0; i<questionIdDetails.length; i++){
     saveRatingQuery = "INSERT INTO `" + dbTableName.iklant_grt_group_ratings + "` (`group_id`,`pt_id`,`created_by`,`response`,`created_date`) " +
     "VALUES ("+groupId+", "+questionIdDetails[i]+","+createdBy+","+checkedOrNotDetails[i]+",NOW() + INTERVAL 5 HOUR + INTERVAL 30 MINUTE)";
     customlog.info(saveRatingQuery);
     clientConnect.query(saveRatingQuery, function (err, result) {
     if (err) {
     callback("failure");
     }
     });
     }*//*

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
     },*/
    /* insertRemarksForGRT: function(connectionDataSource,clientConnect,groupId,remarks,totalRating,isMoved,callback) {
     var remarksQuery = "INSERT INTO `" + dbTableName.iklantGrtGroupRemarks + "` (`group_id`,`created_date`,`remarks`,`total_rate`) VALUES ("+groupId+",NOW() + INTERVAL 5 HOUR + INTERVAL 30 MINUTE,'"+remarks+"',"+totalRating+");"
     customlog.info(remarksQuery);
     clientConnect.query(remarksQuery, function (err, result) {
     connectionDataSource.releaseConnectionPool(clientConnect);
     if (err) {
     callback("failure");
     } else {
     callback("success", isMoved);
     }
     });
     },*/
    /*getCurrentPositionDataModel : function(userId,callback){
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

    },
*/
    // Added by chitra 003 [Accounting Bank Reconciliation]
    getLastDateOfMonthDataModel : function(monthIndex,minFinYear,maxFinYear,callback){
        var getLastDateQuery;
        if(monthIndex == '01' || monthIndex == '02' || monthIndex == '03'){
            getLastDateQuery  = "SELECT DATE_FORMAT(LAST_DAY('"+maxFinYear+"-"+monthIndex+"-13'),'%Y-%m-%d') AS date_value; "
        }else{
            getLastDateQuery  = "SELECT DATE_FORMAT(LAST_DAY('"+minFinYear+"-"+monthIndex+"-13'),'%Y-%m-%d') AS date_value; "
        }
        console.log(getLastDateQuery);
        connectionDataSource.getConnection(function (clientConnect) {clientConnect.query(getLastDateQuery, function (err, result) {
            connectionDataSource.releaseConnectionPool(clientConnect);
            if (err) {
            }else {
                callback(result[0].date_value);
            }
            });
        });
    },

    getActiveFinYear : function(callback){
        var finYearQuery = "SELECT *,DATE_FORMAT(`financialyear_startdate`,'%d-%m-%Y') AS minDate,DATE_FORMAT(`financialyear_enddate`,'%d-%m-%Y') AS maxDate FROM `acc_financialyear` where status = 'A' ORDER BY `status`";
        connectionDataSource.getConnection(function (clientConnect) {
            clientConnect.query(finYearQuery, function (err, result) {
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

    /*retrieveUserDetails: function (userName, emailId, callback) {
        var userDetailsQuery = "SELECT * FROM " + dbTableName.iklantUsers + " WHERE user_name = '" + userName + "' AND email_id = '" + emailId + "' AND active_indicator = 1";
        connectionDataSource.getConnection(function (clientConnect) {
            clientConnect.query(userDetailsQuery,function (err, clientDetails) {
                connectionDataSource.releaseConnectionPool(clientConnect);
                if(err){
                    callback("failure");
                }
                else{
                    callback("success",clientDetails);
                }
            });
        });
    },*/

    /*encryptUserDetails: function (userName,callback) {
        var userDetailsQuery = "SELECT * FROM " + dbTableName.iklantUsers +" WHERE user_name = '"+userName+"'";
        connectionDataSource.getConnection(function (clientConnect) {
            clientConnect.query(userDetailsQuery,function (err, clientDetails) {
                connectionDataSource.releaseConnectionPool(clientConnect);
                if(err){
                    callback("failure",clientDetails);
                }
                else{
                    callback("success",clientDetails);
                }
            });
        });
    },

    updateUserDetails: function (user_id, userName, oldPassword, newPassword, callback) {
        var userQuery = "UPDATE " + dbTableName.iklantUsers + " SET password = '" + newPassword + "', password_changed = 0 WHERE user_name = '" + userName + "' AND user_id = " + user_id;
        connectionDataSource.getConnection(function (clientConnect) {
            clientConnect.query(userQuery,function (err) {
                connectionDataSource.releaseConnectionPool(clientConnect);
                if(err){
                    callback("failure");
                }
                else{
                    callback("success");
                }
            });
        });
    },

    updateCustomUserDetails: function (user_id, userName, newPassword, callback) {
        var userQuery = "UPDATE " + dbTableName.iklantUsers + " SET password = '" + newPassword + "', user_name = '"+userName+"' WHERE user_id = " + user_id;
        connectionDataSource.getConnection(function (clientConnect) {
            clientConnect.query(userQuery,function (err) {
                connectionDataSource.releaseConnectionPool(clientConnect);
                if(err){
                    callback("failure");
                }
                else{
                    callback("success");
                }
            });
        });
    },

    validateOldPassword : function(userId,encrptedOldPassword,callback){
        var validateOldPasswordQuery = "SELECT password from "+ dbTableName.iklantUsers + " WHERE user_id = "+userId+" AND password = '"+encrptedOldPassword+"'";
        customlog.info(validateOldPasswordQuery);
        connectionDataSource.getConnection(function (clientConnect) {
            clientConnect.query(validateOldPasswordQuery,function (err,result) {
                connectionDataSource.releaseConnectionPool(clientConnect);
                if (err) {
                    customlog.error(err);
                    callback("error");
                }
                else{
                    if(result.length == 0){
                        callback("old password failure");
                    }else if(result.length == 1){
                        callback("old password success");
                    }
                }
            });
        });
    },

    //Added by sathishKumar 008 for Change Password
    changePasswordDataModelCall : function(userId,userName,encyptedOldPassword,encyptedNewPassword,callback){
        var constantsObj = this.constants;
        var updateQuery = "UPDATE " + dbTableName.iklantUsers + " SET password = '" + encyptedNewPassword + "', password_changed = 1 WHERE user_id = " + userId ;
        customlog.info(updateQuery);
        connectionDataSource.getConnection(function (clientConnect) {
            clientConnect.query(updateQuery,function (err,result) {
                connectionDataSource.releaseConnectionPool(clientConnect);
                if (err) {
                    customlog.error(err);
                    callback("failure");
                }
                else{
                    callback("success");
                }
            });
        });
    },*/
    /*loadRescheduledGroupsDataModel : function (officeId,userId,callback){
        var self = this;
        var retrieveRescheduledGroups = "SELECT M_BRANCH_IDENTIFIER, GROUP_ACC_NUMBER,M_GROUP_ID,AC_LOAN_OFFICER_ORIG_LOAN FROM rescheduled_loans_detail GROUP BY GROUP_ACC_NUMBER,M_GROUP_ID";
        connectionDataSource.getConnection(function (clientConnect) {
            clientConnect.query(retrieveRescheduledGroups, function selectCb(err, results, fields) {
                connectionDataSource.releaseConnectionPool(clientConnect);
                if (err) {
                    customlog.error(err);
                    callback("");
                }
                else {
                    callback(results);
                }
            });
        });
    },

    retrieveRescheduledGroupsDataModel : function(officeId,userId,groupAccNum,callback){
        var self = this;
        var retrieveRescheduledGroupsByAccNum = "SELECT * from rescheduled_loans_detail WHERE GROUP_ACC_NUMBER = '"+groupAccNum+"'";
        connectionDataSource.getConnection(function (clientConnect) {
            clientConnect.query(retrieveRescheduledGroupsByAccNum, function selectCb(err, results, fields) {
                connectionDataSource.releaseConnectionPool(clientConnect);
                if (err) {
                    customlog.error(err);
                    callback("");
                }
                else {
                    callback(results);
                }
            });
        });
    },
*/
    /* rejectIdleClientsDataModel : function(clientId, callback){
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
     },*/

    /*rejectIdleGroupDataModel : function(groupId, callback){
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
     },*/

    approveOrRejectClientForNextLoanDataModel: function (iklantGroupId,userId,callback){
        var self = this;
        var constantsObj = this.constants;
        var clientsIdArray = new Array();
        var retriveClientDetails = "SELECT ipc.client_id,ipc.status_id FROM iklant_prospect_group ipg "+
        " LEFT JOIN iklant_prospect_client ipc ON ipg.group_id = ipc.group_id "+
        " WHERE ipg.group_id = "+ iklantGroupId +" AND ipc.status_id NOT IN (21,2);"
        customlog.info("retriveClientDetails :"+retriveClientDetails);
        connectionDataSource.getConnection(function (clientConnect) {
            clientConnect.query(retriveClientDetails, function selectCb(err, results) {
                if (err) {
                    connectionDataSource.releaseConnectionPool(clientConnect);
                    customlog.error("error occured in approveOrRejectClientForNextLoanDataModel(): ", err);
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
                                customlog.error("error occured in approveOrRejectClientForNextLoanDataModel(): ", err);
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

    /*getClientPaymentsDetailDataModel: function(paymentCollectionId,callback){
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
    }*/
};

function formatDate(tempDate) {
    var ddd = tempDate.split("/");
    var now = new Date(ddd[2], ddd[1] - 1, ddd[0]);
    var curr_date = ("0" + now.getDate()).slice(-2);
    var curr_month = ("0" + (now.getMonth() + 1)).slice(-2);
    var curr_year = now.getFullYear();
    var tempDate = curr_year + "-" + curr_month + "-" + curr_date;
    if (isNaN(curr_date)) {
        tempDate = '0000-00-00';
    }
    return tempDate;
}

function formatDateForUI(tempDate) {
    var now = new Date(tempDate);
    var curr_date = ("0" + now.getDate()).slice(-2);
    var curr_month = ("0" + (now.getMonth() + 1)).slice(-2);
    var curr_year = now.getFullYear();
    var tempDate = curr_date + "/" + curr_month + "/" + curr_year;
    if (isNaN(curr_date)) {
        tempDate = "";
    }
    return tempDate;
}

/*function trimSpaces(str) {
    return str.replace(/^\s\s*//*, '').replace(/\s\s*$/, '');
}*/

/*function getAge(dateString) {
    var today = new Date();
    var birthDate = new Date(dateString);
    var age = today.getFullYear() - birthDate.getFullYear();
    var m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
        age--;
    }
    if (isNaN(age)) {
        return "";
    }
    else {
        return age;
    }
}*/

/*
function validator(prosGroup, preVerification, constantsObj) {
    //var constantsObj = this.constants;
    var verification = new Array();
    var currentDate = new Date();
    var alertMessage = "";
    var statusID;
    var isEligible;

    //var prosGroup=this.prospectGroup;
    //var prosClient=this.prospectClient;
    //var preVerification=this.preliminaryVerification;
    //customlog.info("Dateeeeeee=="+prosGroup.getGroup_created_date());
    var groupCreatedDate = prosGroup.getGroup_created_date();
    var accountCreatedDate = preVerification.getaccount_created_date();
    var lastActiveFrom = preVerification.getloan_active_from();
    var isSavingsDiscussed = 0;
    var isCompleteAttendance = 0;
    var creditTransaction = pad2(preVerification.getno_of_credit_transaction());
    var debitTransaction = pad2(preVerification.getno_of_debit_transaction());
    var isBankAccount = 0;

    if (preVerification.getis_savings_discussed() == "true") {
        isSavingsDiscussed = 1;
    }
    if (preVerification.getis_complete_attendance() == "true") {
        isCompleteAttendance = 1;
    }
    if (preVerification.getis_bank_account() == "true") {
        isBankAccount = 1;
    }

    groupCreatedDateObject = new Date(groupCreatedDate);
    accountCreatedDateObject = new Date(accountCreatedDate);
    lastActiveFromObject = new Date(lastActiveFrom);

    var groupCreatedDateDifference = monthsDifference(groupCreatedDateObject, currentDate);
    var accountCreatedDateDifference = monthsDifference(accountCreatedDateObject, currentDate);
    var lastActiveFromDifference = monthsDifference(lastActiveFromObject, currentDate);

    var successMsg = "PRELIMINARY VERIFICATION SUCCESSFULLY COMPLETED";
    var failureMsg = "The Group Created is rejected for the following reasons";

    if (groupCreatedDateDifference > 5) {
    }
    else {
        failureMsg += "-Group should be created before six months";
    }
    if (lastActiveFromDifference > 5) {
    }
    else {
        failureMsg += "-minutes of meeting should be active for recent six months";
    }
    if (isSavingsDiscussed == 1) {
    }
    else {
        failureMsg += "-Savings should be discussed in the meeting";
    }
    if (isCompleteAttendance == 1) {
    }
    else {
        failureMsg += "-All the members should attend the meeting";
    }
    if (isBankAccount == 1) {
        if (accountCreatedDateDifference > 5) {
        }
        else {
            failureMsg += "-Bank account should be created before Six months";
        }
        */
/*if(creditTransaction > debitTransaction) {
         }
         else {
         failureMsg += "-Debit is more than credit transaction";
         }*//*
    }
    else {
        failureMsg += "-Group Should have Bank Account";
    }


    if (failureMsg == "The Group Created is rejected for the following reasons") {
        var statusID = constantsObj.getPreliminaryVerified();
        var isEligible = 1;
        alertMessage = successMsg;
    }
    else {
        var statusID = constantsObj.getRejectedPriliminaryVerification();
        var isEligible = 0;
        alertMessage = failureMsg;
    }

    verification.push(isSavingsDiscussed);
    verification.push(isCompleteAttendance);
    verification.push(isBankAccount);
    verification.push(statusID);
    verification.push(isEligible);
    verification.push(alertMessage);
    customlog.info(alertMessage);
    customlog.info(verification);
    return verification;
}
*/

function pad2(number) {
    return (number < 10 ? '0' : '') + number
}

/*function monthsDifference(d1, d2) {
    var months;
    months = (d2.getFullYear() - d1.getFullYear()) * 12;
    months -= d1.getMonth() + 1;
    months += d2.getMonth();
    diffMonths = months + 2;
    return diffMonths;
}*/
function calculateCCAForClient(choice_marks, weightage) {
    customlog.info("inside Datamodel method" + choice_marks);
    customlog.info("inside Datamodel method" + weightage);
    var appraisalCalculation = new Array();
    var totalWeightage = 0;
    var maxWeightage = 0;
    for (var i = 0; i < weightage.length; i++) {
        maxWeightage += weightage[i] * 3;
        totalWeightage += weightage[i] * choice_marks[i];
        customlog.info(totalWeightage);
    }
    var CCARating = (totalWeightage / maxWeightage) * 100;
    return CCARating;
}

function calculateTotalCCAForClient(choice_marks, weightage, clientAppraisalRating) {
    customlog.info("inside Datamodel method choice_marks : " + choice_marks);
    customlog.info("inside Datamodel method weightage : " + weightage);
    customlog.info("inside Datamodel method clientAppraisalRating : " + weightage);
    var appraisalCalculation = new Array();
    var returnArrayCCATotal = new Array();
    var currentWeightage = 0;
    var maxWeightage = 0;
    var previousWeightage = clientAppraisalRating * 2.25;
    for (var i = 0; i < weightage.length; i++) {
        maxWeightage += weightage[i] * 3;
        currentWeightage += weightage[i] * choice_marks[i];
        customlog.info(currentWeightage);
    }
    totalWeightage = currentWeightage + previousWeightage;
    totalMaxWeightage = 225 + maxWeightage;
    var CCARating = (totalWeightage / totalMaxWeightage) * 100;
    customlog.info(totalWeightage + " TotWeightage " + totalMaxWeightage);
    returnArrayCCATotal.push(CCARating);
    returnArrayCCATotal.push(totalWeightage);
    returnArrayCCATotal.push(totalMaxWeightage);
    return returnArrayCCATotal;
    //return CCARating;
}

function calculateAppraisalPercentage(questionsObj, choicesSelectedAnswerObj, i) {
    var returnArray = new Array();
    var vehicleType = new Array()
    var vehicles = new Array();
    var constantsRequire = require(path.join(applicationHome,"/app_modules/dto/common/Constants"));
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
    //return CCARating;
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
/*// Added by Paramasivan
// function to create excel summary sheet for all payment voucher and receipt
function createSummarySheetForVR(self, sheet1, count1, voucherOrReceiptResult, type) {
    var rowValue = parseInt(4);
    rowValue = rowValue + parseInt(count1);
    if (type === 'office') {
        sheet1.set(2, rowValue, parseInt(count1));
        sheet1.set(3, rowValue, voucherOrReceiptResult.officeName);
        sheet1.set(4, rowValue, voucherOrReceiptResult.noOfTransactions, 'number');
        sheet1.set(5, rowValue, voucherOrReceiptResult.totalAmount, 'number');
    }
    else {
        sheet1.set(3, rowValue, "Total");
        sheet1.set(4, rowValue, voucherOrReceiptResult.noOfTransactions, 'number');
        sheet1.set(5, rowValue, voucherOrReceiptResult.totalAmount, 'number');
    }
    self.excelUtility.setBorderAndAlignForCell(sheet1, 2, 5, rowValue, new Array(4, 5), new Array(0, 2), function (sheet) {
        sheet1 = sheet;
    });
}

// function to create excel summary sheet for overdue report
function createSummarySheetForOD(self, sheet1, count, overdueResult, type, rowValue) {
    if (type === 'office') {
        sheet1.set(2, rowValue, parseInt(count));
        sheet1.set(3, rowValue, overdueResult.office);
        sheet1.set(4, rowValue, overdueResult.noOfCustomers, 'number');
        sheet1.set(5, rowValue, overdueResult.totalLoanAmount, 'number');
        sheet1.set(6, rowValue, overdueResult.totalPrincipalPaid, 'number');
        sheet1.set(7, rowValue, overdueResult.totalPrincipalOutstanding, 'number');
        sheet1.set(8, rowValue, overdueResult.totalOverdue, 'number');
        sheet1.set(9, rowValue, overdueResult.totalPrincipalOverdue, 'number');
    }
    else {
        sheet1.set(2, rowValue, "Total");
        sheet1.set(4, rowValue, overdueResult.noOfCustomers, 'number');
        sheet1.set(5, rowValue, overdueResult.totalLoanAmount, 'number');
        sheet1.set(6, rowValue, overdueResult.totalPrincipalPaid, 'number');
        sheet1.set(7, rowValue, overdueResult.totalPrincipalOutstanding, 'number');
        sheet1.set(8, rowValue, overdueResult.totalOverdue, 'number');
        sheet1.set(9, rowValue, overdueResult.totalPrincipalOverdue, 'number');
    }
    self.excelUtility.setBorderAndAlignForCell(sheet1, 2, 9, rowValue, new Array(4, 5, 6, 7, 8, 9), new Array(0, 2), function (sheet) {
        sheet1 = sheet;
    });
}

function createSummarySheet(self, sheet1, count1, result, type) {
    var rowValue = parseInt(4);
    var value = (result.office_id) ? result.office : (result.state) ? result.state : (result.interest_rate) ? result.interest_rate : (result.loan_amount) ? result.loan_amount : (result.loan_cycle) ? result.loan_cycle : (result.product) ? result.product : (result.loan_purpose) ? result.loan_purpose : result.loan_size;
    rowValue = rowValue + parseInt(count1);
    if (type === 'office') {
        sheet1.set(2, rowValue, parseInt(count1));
        sheet1.set(3, rowValue, value);
        sheet1.set(4, rowValue, result.totalPrincipal, 'number')
        sheet1.set(5, rowValue, result.totalInterest, 'number');
        sheet1.set(6, rowValue, result.totalPrincipalPaid, 'number');
        sheet1.set(7, rowValue, result.totalInterestPaid, 'number');
        sheet1.set(8, rowValue, result.prinOutstanding, 'number');
    }
    else {
        sheet1.set(3, rowValue, "Total");
        sheet1.set(4, rowValue, result.totalPrincipal, 'number');
        sheet1.set(5, rowValue, result.totalInterest, 'number');
        sheet1.set(6, rowValue, result.totalPrincipalPaid, 'number');
        sheet1.set(7, rowValue, result.totalInterestPaid, 'number');
        sheet1.set(8, rowValue, result.prinOutstanding, 'number');
    }
    self.excelUtility.setBorderAndAlignForCell(sheet1, 2, 8, rowValue, new Array(4, 5, 6, 7, 8), new Array(2, 3), function (sheet) {
        sheet1 = sheet;
    });
}

// function to create excel summary sheet
function createSummarySheetForDC(self, sheet1, count1, result, type, reportId, reportCategory,constantObj) {
    var rowValue = parseInt(4);
    rowValue = rowValue + parseInt(count1);
    if (reportId == constantObj.getDemandGroupWiseReport()) {
        if (type === 'office') {
            sheet1.set(2, rowValue, parseInt(count1));
            sheet1.set(3, rowValue, result.demd_office);
            sheet1.set(4, rowValue, result.totalPrincipal, 'number');
            sheet1.set(5, rowValue, result.totalInterest, 'number');
            sheet1.set(6, rowValue, result.totalDemand, 'number');
        }
        else {
            sheet1.set(2, rowValue, "Total");
            sheet1.set(4, rowValue, result.totalPrincipal, 'number');
            sheet1.set(5, rowValue, result.totalInterest, 'number');
            sheet1.set(6, rowValue, result.totalDemand, 'number');
        }
        self.excelUtility.setBorderAndAlignForCell(sheet1, 2, 6, rowValue, new Array(4, 5, 6), new Array(0, 2), function (sheet) {
            sheet1 = sheet;
        });
    }
    else {
        if (reportCategory === 'monthly') {
            if (type === 'office') {
                sheet1.set(2, rowValue, parseInt(count1));
                sheet1.set(3, rowValue, result.office);
                sheet1.set(4, rowValue, result.loan_officer);
                sheet1.set(5, rowValue, result.YEAR);
                sheet1.set(6, rowValue, result.MONTH);
                sheet1.set(7, rowValue, result.totalPrincipal, 'number');
                sheet1.set(8, rowValue, result.totalInterest, 'number');
                sheet1.set(9, rowValue, result.totalDemand, 'number');
                sheet1.set(10, rowValue, result.totalPrincipalPaid, 'number');
                sheet1.set(11, rowValue, result.totalInterestPaid, 'number');
                sheet1.set(12, rowValue, result.totalPaid, 'number');
            }
            else {
                sheet1.set(2, rowValue, "Total");
                sheet1.font(2, rowValue, {bold: 'true', sz: '14'});
                sheet1.set(7, rowValue, result.totalPrincipal, 'number');
                sheet1.font(7, rowValue, {bold: 'true', sz: '14'});
                sheet1.set(8, rowValue, result.totalInterest, 'number');
                sheet1.font(8, rowValue, {bold: 'true', sz: '14'});
                sheet1.set(9, rowValue, result.totalDemand, 'number');
                sheet1.font(9, rowValue, {bold: 'true', sz: '14'});
                sheet1.set(10, rowValue, result.totalPrincipalPaid, 'number');
                sheet1.font(10, rowValue, {bold: 'true', sz: '14'});
                sheet1.set(11, rowValue, result.totalInterestPaid, 'number');
                sheet1.font(11, rowValue, {bold: 'true', sz: '14'});
                sheet1.set(12, rowValue, result.totalPaid, 'number');
                sheet1.font(12, rowValue, {bold: 'true', sz: '14'});
            }
            self.excelUtility.setBorderAndAlignForCell(sheet1, 2, 12, rowValue, new Array(7, 8, 9, 10, 11, 12), new Array(2, 5), function (sheet) {
                sheet1 = sheet;
            });
        }
        else {
            if (type === 'office') {
                sheet1.set(2, rowValue, parseInt(count1));
                sheet1.set(3, rowValue, result.office);
                sheet1.set(4, rowValue, result.loan_officer);
                sheet1.set(5, rowValue, result.DATE);
                sheet1.set(6, rowValue, result.totalPrincipal, 'number');
                sheet1.set(7, rowValue, result.totalInterest, 'number');
                sheet1.set(8, rowValue, result.totalDemand, 'number');
                sheet1.set(9, rowValue, result.totalPrincipalPaid, 'number');
                sheet1.set(10, rowValue, result.totalInterestPaid, 'number');
                sheet1.set(11, rowValue, result.totalPaid, 'number');
            }
            else {
                sheet1.set(2, rowValue, "Total");
                sheet1.font(2, rowValue, {bold: 'true', sz: '14'});
                sheet1.set(6, rowValue, result.totalPrincipal, 'number');
                sheet1.font(6, rowValue, {bold: 'true', sz: '14'});
                sheet1.set(7, rowValue, result.totalInterest, 'number');
                sheet1.font(7, rowValue, {bold: 'true', sz: '14'});
                sheet1.set(8, rowValue, result.totalDemand, 'number');
                sheet1.font(8, rowValue, {bold: 'true', sz: '14'});
                sheet1.set(9, rowValue, result.totalPrincipalPaid, 'number');
                sheet1.font(9, rowValue, {bold: 'true', sz: '14'});
                sheet1.set(10, rowValue, result.totalInterestPaid, 'number');
                sheet1.font(10, rowValue, {bold: 'true', sz: '14'});
                sheet1.set(11, rowValue, result.totalPaid, 'number');
                sheet1.font(11, rowValue, {bold: 'true', sz: '14'});
            }
            self.excelUtility.setBorderAndAlignForCell(sheet1, 2, 11, rowValue, new Array(6, 7, 8, 9, 10, 11), new Array(2, 5), function (sheet) {
                sheet1 = sheet;
            });
        }
    }
}*/
exports.datamodel = datamodel;
