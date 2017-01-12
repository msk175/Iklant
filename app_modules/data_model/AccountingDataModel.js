module.exports = accountingDataModel;

var path = require('path');
var rootPath = path.dirname(process.mainModule.filename);
var dbTableName = require(path.join(rootPath,"properties.json"));

var connectionDataSource = require(path.join(rootPath,"app_modules/data_model/DataSource"));


var customlog = require(path.join(rootPath,"logger/loggerConfig.js"))('AccountingDataModel.js');
var excelUtility = require(path.join(rootPath,"app_modules/utils/ExcelReportUtility"));


function accountingDataModel(constants) {
    this.constants = constants;
    this.excelUtility = excelUtility;
    customlog.debug("Inside Data Access Layer of accountingDataModel");
}

accountingDataModel.prototype = {
    // Added by SathishKumar M
    getTransactionHistoryCall: function (fromDate,toDate, officeId, reportId, userId, callBack) {
        var date = new Date();
        var dateTime = date.getFullYear() + '_' + (date.getMonth() + 1) + '_' + date.getDate() + '_' + date.getHours() + '_' + date.getMinutes() + '_' + date.getSeconds();
        var constantsObj = this.constants;
        var self = this;
        var THRReportQuery = "CALL sp_daybook_full_transaction('" + fromDate + "','" + toDate + "'," + officeId + "," + userId + ")";
        var report_name = "TransactionHistoryReport_" + dateTime + ".xlsx";
        var excel = require('msexcel-builder');
        var workbook = excel.createWorkbook(rootPath+'/documents/report_documents/', report_name);
        var fileLocation = '';
        customlog.info('Query: ' + THRReportQuery);
        connectionDataSource.getConnection(function(clientConnect) {
            clientConnect.query(THRReportQuery, function (error, THRResult) {
                connectionDataSource.releaseConnectionPool(clientConnect);
                if (error) {
                    customlog.error(error);
                }
                else {
                    var THRResult = THRResult[0];
                    if (THRResult.length > 0) {
                        var rowLength = THRResult.length + 10, count = 1, previous = -1;
                        var sheet = workbook.createSheet("Transaction_History_Report", 20, parseInt(rowLength));
                        var headerArrayForDetailedSheet = new Array('Office', 'VoucherNo', 'ChequeNo', 'Customer', 'Narration', 'AccountNo', 'Debit', 'Credit', 'TrxnAmount', 'TransactionDate', 'PaymentDate','ReportType');
                        var rowValue = parseInt(4);
                        count = 1;
                        self.excelUtility.setAlignmentForHeader(sheet, 3, 14, 4, new Array(20, 35, 13, 40, 70, 20, 25, 25, 15, 20, 20, 15), headerArrayForDetailedSheet, "Transaction History Report-As on " + toDate, function (result) {
                            sheet = result;
                            for (var i in THRResult) {
                                rowValue = rowValue + count;
                                sheet.set(3, rowValue, THRResult[i].office);
                                sheet.set(4, rowValue, THRResult[i].voucher_number);
                                sheet.set(5, rowValue, THRResult[i].cheque_number);
                                sheet.set(6, rowValue, THRResult[i].customer);
                                sheet.set(7, rowValue, THRResult[i].narration);
                                sheet.set(8, rowValue, THRResult[i].account_num);
                                sheet.set(9, rowValue, THRResult[i].debit_acc_name);
                                sheet.set(10, rowValue, THRResult[i].credit_acc_name);
                                sheet.set(11, rowValue, THRResult[i].trxn_amount, 'numer');
                                sheet.set(12, rowValue, THRResult[i].transaction_date);
                                sheet.set(13, rowValue, THRResult[i].payment_date);
                                sheet.set(14, rowValue, THRResult[i].report_type);
                                self.excelUtility.setBorderAndAlignForCell(sheet, 3, 14, rowValue, new Array(), new Array(0, 2), function (sheet) {
                                    sheet = sheet;
                                });
                            }
                            count++;
                        });
                        fileLocation = rootPath+'/documents/report_documents/' + report_name;
                        workbook.save(function (err) {
                            if (err) {
                                workbook.cancel();
                                customlog.error(err.message);
                                callBack(THRResult, fileLocation);
                            }
                            else {
                                callBack(THRResult, fileLocation);
                            }
                        });
                    }
                    else {
                        callBack(THRResult, fileLocation);
                    }
                }
            })
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

    getTrailBalanceResultDataModel: function (finYear,fromDate,toDate,mfiOperation,accOperation,callBack) {
        var date = new Date();
        var constantsObj = this.constants;
        var self = this;
        var accFlag = (accOperation == "on") ? 'accounting' : '';
        var mfiFlag = (mfiOperation == "on") ? 'mfi' : '';
        var trailBalanceQuery = "CALL `sp_trial_balance`(" + finYear + ",'" + fromDate + "','" + toDate + "'," + -1 + ",'" + accFlag + "','" + mfiFlag + "')";
        customlog.info('Query: ' + trailBalanceQuery);
        connectionDataSource.getConnection(function(clientConnect) {
            clientConnect.query(trailBalanceQuery, function (error, trailBalanceResult) {
                connectionDataSource.releaseConnectionPool(clientConnect);
                if (error) {
                    customlog.error(error);
                }
                else {
                    callBack(trailBalanceResult);
                }
            })
        });
    },

    getLedgerTransactionResultDataModel: function (finYear,fromDate,toDate,mfiOperation,accOperation,glcode,userId,callBack) {
        var date = new Date();
        var constantsObj = this.constants;
        var self = this;
        var accFlag = (accOperation == "on") ? 'accounting' : '';
        var mfiFlag = (mfiOperation == "on") ? 'mfi' : '';
        var generalLedgerQuery = "CALL  `sp_general_ledger`('" + fromDate + "','" + toDate + "'," + -1 + "," + glcode + ",'" + accFlag + "','" + mfiFlag + "'," + userId + ")";
        customlog.info('Query: ' + generalLedgerQuery);
        connectionDataSource.getConnection(function(clientConnect) {
            clientConnect.query(generalLedgerQuery, function (error, generalLedgerResult) {
                connectionDataSource.releaseConnectionPool(clientConnect);
                if (error) {
                    customlog.error(error);
                }
                else {
                    callBack(generalLedgerResult);
                }
            })
        });
    }
}