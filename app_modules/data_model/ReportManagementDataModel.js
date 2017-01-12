module.exports = reportManagementDataModel;

var path = require('path');
var rootPath = path.dirname(process.mainModule.filename);
var dbTableName = require(path.join(rootPath,"properties.json"));
var fs = require('fs');
var connectionDataSource = require(path.join(rootPath,"app_modules/data_model/DataSource"));
var customlog = require(path.join(rootPath,"logger/loggerConfig.js"))('ReportManagementDataModel.js');
var commonDTO = path.join(rootPath,"app_modules/dto/common");
var groupManagementDTO = path.join(rootPath,"app_modules/dto/report_management");
var dateUtils = require(path.join(rootPath,"app_modules/utils/DateUtils"));
var ciDB = dbTableName.database;

//Business Layer
function reportManagementDataModel(constants) {
    customlog.debug("Inside Report Management Data Access Layer");
    this.constants = constants;

    var mysql = require('mysql');
    this.client = mysql.createConnection({
        host:dbTableName.host,
        user: dbTableName.username,
        password: dbTableName.password,
        insecureAuth: true
    });
    this.client.query("USE " + ciDB);

    var excelUtility = require(path.join(rootPath,"app_modules/client_management/customer_identification/model/excelReportUtility.js"));
    this.excelUtility = excelUtility;

    var commonObj = require(path.join(rootPath,"app_modules/client_management/customer_identification/domain/commonDomain"));
    this.commonObj = commonObj;
}

reportManagementDataModel.prototype = {
    // Added by chitra for Report Management
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
                                    self.getPersonnelDetailsDataModel(officeId,userId,function (personnelIdArray, personnelNameArray) {
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
        var retrieveLedgerQuery = "";
        if (typeof ledger_name != "undefined") {
            if(ledger_name == "ALL"){
                retrieveLedgerQuery = "SELECT co.coa_name AS glname,glc.glcode_value FROM coa co " +
                "LEFT JOIN gl_code glc ON glc.glcode_id = co.glcode_id " +
                "LEFT JOIN gl_code_custom c ON c.glcode_id = co.glcode_id " +
                "LEFT JOIN rm_regional_office_list rmro ON rmro.office_id = c.office_id " +
                "WHERE (rmro.user_id = " + userId +" OR " + userId +" = -1) OR c.office_id = 1 GROUP BY co.glcode_id";

            }
            else {
                retrieveLedgerQuery = "SELECT a.coa_name AS glname,b.glcode_value FROM coa a " +
                "LEFT JOIN gl_code b ON b.glcode_id = a.glcode_id " +
                "LEFT JOIN gl_code_custom c ON c.glcode_id = a.glcode_id " +
                "LEFT JOIN rm_regional_office_list rmro ON rmro.office_id = c.office_id " +
                "WHERE a.glcode_id=b.glcode_id AND a.glcode_id=c.glcode_id " +
                "AND glcode_value IN (SELECT lookup_name FROM lookup_value WHERE entity_id IN " +
                "(SELECT entity_id FROM lookup_entity WHERE entity_name = '" + ledger_name + "')) " +
                "AND (c.office_id = " + officeId + " OR " + officeId + " = -1) " +
                "AND (rmro.user_id = " + userId + " OR " + userId + " = -1) GROUP BY b.glcode_value";

            }

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
        var accountStateQuery = "SELECT ast.account_state_id,ast.status_description FROM account_state ast WHERE ast.account_state_id IN (5,6,7,8,9)";

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

    retrieveFundDetailDataModel : function(reportId,callback){
        var self = this;
        var constObj = this.constants;
        var fundId = new Array();
        var fundName = new Array();
        var fundQuery = "SELECT ca.coa_id,ca.coa_name  FROM  coa ca "+
            "INNER JOIN `coahierarchy` ch ON ch.coa_id = ca.coa_id "+
            "WHERE ch.parent_coaid = 53; ";

        connectionDataSource.getConnection(function (clientConnect) {
            clientConnect.query(fundQuery, function (error, result) {
                connectionDataSource.releaseConnectionPool(clientConnect);
                if (error) {
                    callback(fundId, fundName);
                }
                else {
                    for (var i in result) {
                        fundId[i] = result[i].coa_id;
                        fundName[i] = result[i].coa_name;
                    }
                    callback(fundId, fundName);
                }
            });
        });
    },

    /* For delete the excel files in the report documents directory*/
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
        /*if(includePrevOperation == "on") {
         includePrevOperation_flag   = "Yes";
         } */
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
        customlog.info("trailBalanceQuery:"+trailBalanceQuery);
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
                            var closingBalance = 0;
                            var openingBalanceValue = OpeningBalanceResult[0];
                            var openingBalance = openingBalanceValue[0].openingBalance
                            console.log("openingBalance = "+ openingBalanceValue[0].openingBalance);
                            /*var rowLength = generalLedgerResult.length + 10;
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
                            });*/

                            /*self.excelUtility.setAlignmentForHeader(sheet1, 2, 7, 4, new Array(10, 35, 35, 25, 25, 25), headerForSummarySheet, heading, function (result) {
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
                            }); */
                            for (var i = 0; i < generalLedgerResult.length; i++) {
                                if (!generalLedgerResult[i].office_id) {
                                    totalDebit =  parseInt(generalLedgerResult[i].totalDebit);
                                    totalCredit = parseInt(generalLedgerResult[i].totalCredit);
                                    closingBalance = openingBalance+(totalDebit-totalCredit);
                                    generalLedgerResult[0].totalDebit = totalDebit;
                                    generalLedgerResult[0].totalCredit = totalCredit;
                                    generalLedgerResult[0].closingBalance = closingBalance;
                                    generalLedgerResult[0].openingBalance = openingBalance;
                                    callBack(generalLedgerResult, fileLocation);
                                    break;
                                }
                            }
                            /*fileLocation = rootPath+'/documents/report_documents/' + report_name;
                            workbook.save(function (err) {
                                if (err) {
                                    workbook.cancel();
                                    customlog.error(err.message);
                                    callBack(generalLedgerResult, fileLocation);
                                }
                                else {
                                    callBack(generalLedgerResult, fileLocation);
                                }
                            });*/
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
    reportsMenuDataModel: function (reportCategoryId, roleId, callBack) {
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
    getPOSForAgingDataModel: function (officeId,productCategoryId,loanOfficer,callback) {
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
    //Ended by chitra
    generateReportDataModel: function (startdate, enddate, statusId, officeId,userId, callback) {
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
        /* var rejectionStatusIdList = [constantsObj.getRejectedPriliminaryVerification(), constantsObj.getRejectedCreditBureauAnalysisStatusId(),
         constantsObj.getRejectedFieldVerification(), constantsObj.getRejectedAppraisal()];
         var allStatusIdList = [constantsObj.getNewGroup(), constantsObj.getPreliminaryVerified(), constantsObj.getKYCUploaded(),
         constantsObj.getKYCCompleted(), constantsObj.getCreditBureauAnalysedStatus(), constantsObj.getAssignedFO(),
         constantsObj.getFieldVerified(), constantsObj.getNeedInformation(), constantsObj.getAppraisedStatus(),
         constantsObj.getAuthorizedStatus(), constantsObj.getLoanSanctionedStatus(), constantsObj.getSynchronizedGroupsStatus(),
         constantsObj.getArchived(), constantsObj.getRejectedPriliminaryVerification(), constantsObj.getRejectedCreditBureauAnalysisStatusId(),
         constantsObj.getRejectedFieldVerification(), constantsObj.getRejectedAppraisal()];

         customlog.info("allStatusIdList: " + allStatusIdList);
         */
        /*
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
         */
        /*
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
         "ON b.group_id = a.group_id ";*/
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
    loadRescheduledGroupsDataModel : function (officeId,userId,callback){
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
    /* Added by chitra for existing user */
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
    // Ended by Chitra
    assignGroupToRODataModel: function (accountId, roId, callback) {
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
    },
    //Document Verification for Loan Sanction
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
                "" + constantsObj.getRejectedCreditBureauAnalysisStatusId() + "," + constantsObj.getRejectedKYCDataVerificationStatusId() + ")";
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
    listNPASearchGroupDatamodel: function (tenantId, recoveryOfficer, capabilityPercentage, isLeaderTraceableID, reasonForNPA, overdueDurationFrom, overdueDurationTo, amountFrom, amountTo, branch, callback) {
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
    getNPAReasonsDatamodel: function (tenantId, userId, callback) {
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
    getNPADefaultSearchDatamodel: function (userId,callback) {
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
    // TODO: Data Access Layer
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
                            var LoanRepaymentForFO1 = require(path.join(rootPath,"app_modules/client_management/customer_identification/domain/recoveryHolder"));
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
    updateVerifiedInformationDataModel: function (accountId, statusId, reason, remarks, capabilitypercentage, expecteddate, otherReason, answerOne, answerTwo, answerThree, answerFour, answerFive, answerSix, answerSeven, flag, userId, todoActivity, todoDueDate, todoDueTime, callback) {
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
    //upload File
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
    },
    retrieveClientDetailsDataModel: function (accountId, callback) {
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
    getGroupDetailDataModel: function (userId1, callback) {
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
                    var NPALoanRecoveryGroups = require(path.join(rootPath,"app_modules/client_management/customer_identification/domain/NPALoanRecoveryGroups"));
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
                                    var NPALoanRecoveryGroupsStatus = require(path.join(rootPath,"app_modules/client_management/customer_identification/domain/NPALoanRecoveryGroupsStatus"));
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
    checkForAlreadyExistingmemberDatamodel: function (tenantId, rationCardNumber, contactNumber, voterId, aadhaarNumber, callback) {
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
    } ,
    getcallOfficeAndPersonnelForBC: function(bcOfficeId , callback){
        var self = this;
        var constantsObj = this.constants;
        var officeIdArray = new Array();
        var officeNameArray = new Array();
        var personnelIdArray = new Array();
        var personnelNameArray = new Array();
        var personnelOfficeIdArray = new Array();
        var retriveOfficeQuery = "SELECT io.office_id,io.display_name FROM office io " +
            " WHERE io.`status_id`=1 AND io.`bc_id`="+ bcOfficeId+" GROUP BY io.office_id";
        customlog.info("retriveOfficeQuery: " + retriveOfficeQuery);
        connectionDataSource.getConnection(function (clientConnect) {
            clientConnect.query(retriveOfficeQuery, function selectCb(err, results, fields) {
                if (err) {
                    customlog.error(err);
                    connectionDataSource.releaseConnectionPool(clientConnect);
                    callback(officeIdArray, officeNameArray);
                }
                else {
                    for (var i in results) {
                        officeIdArray[i] = results[i].office_id;
                        officeNameArray[i] = results[i].display_name;
                    }
                    var retrivePersonnelQuery ="SELECT `personnel_id`,`display_name`,office_id  FROM `personnel` WHERE bc_office_id = "+ bcOfficeId +" AND `personnel_status` =1" ;
                    clientConnect.query(retrivePersonnelQuery,function selectCb(err,result,fields){
                        connectionDataSource.releaseConnectionPool(clientConnect);
                        if(err){
                            customlog.error(err);
                            callback(officeIdArray, officeNameArray);
                        }else{
                            for (var i in result) {
                                personnelIdArray[i] = result[i].personnel_id;
                                personnelNameArray[i] = result[i].display_name;
                                personnelOfficeIdArray[i]= result[i].office_id;
                            }
                            callback(officeIdArray, officeNameArray, personnelIdArray, personnelNameArray,personnelOfficeIdArray);
                        }
                    });
                }
            });
        });
    }
};

// Added by Paramasivan
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
}

function pad2(number) {
    return (number < 10 ? '0' : '') + number
}

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