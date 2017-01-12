module.exports = loanDisbursementDataModel;

var path = require('path');
var rootPath = path.dirname(process.mainModule.filename);
var lookupEntityObj;

var dbTableName = require(path.join(rootPath,"properties.json"));
var fs = require('fs');
var PDFDocument = require('pdfkit');

var connectionDataSource = require(path.join(rootPath,"app_modules/data_model/DataSource"));
var customlog = require(path.join(rootPath,"logger/loggerConfig.js"))('LoanDisbursementDataModel.js');
var commonDTO = path.join(rootPath,"app_modules/dto/common");
var loanDisbursementDTOpath = path.join(rootPath,"app_modules/dto/loan_disbursement");
var dateUtils = require(path.join(rootPath,"app_modules/utils/DateUtils"));

//Business Layer
function loanDisbursementDataModel(constants) {
    customlog.debug("Inside Loan Disbursement Data Access Layer");
    this.constants = constants;
}

loanDisbursementDataModel.prototype = {

    getActiveClientDetailsByIklantGroupIdDataModel: function (group_id, callBack) {
        var self = this;
        var constantsObj = this.constants;
        var active_clients = new Array();
        var rejected_clients = new Array();
        var creditRejectedStatus = constantsObj.getRejectedCreditBureauAnalysisStatusId();
        var activeclientsQuery = "SELECT pc.client_id,CONCAT(pc.client_name,' ',pc.client_last_name,' ',ipcg.`guardian_name`,' ',ipcg.`guardian_lastname`) AS client_name FROM "+dbTableName.iklantProspectClient+" pc " +
            "INNER JOIN iklant_prospect_client_personal ipcg ON ipcg.client_id = pc.client_id WHERE pc.group_id = " + group_id + " AND pc.status_id NOT IN (13,14,15,16,17,18,21,22,25,26) GROUP BY ipcg.client_id ORDER BY pc.created_date ";
        connectionDataSource.getConnection(function (clientConnect) {
            clientConnect.query(activeclientsQuery, function (error, activeClientsResult) {
                if (error) {
                    customlog.error(error);
                    connectionDataSource.releaseConnectionPool(clientConnect);
                    callBack(activeClientsResult);
                }
                else {
                    var clientDetailsQuery = "SELECT client_det.client_id,client_det.client_name,client_det.mobile_number,client_det.landline_number,client_det.mifos_client_customer_id, " +
                        " IFNULL(answer_id,680) AS answer_id FROM (SELECT ipc.client_id,CONCAT(ipc.client_name,' ',ipc.client_last_name) AS client_name,IFNULL(ipp.mobile_number,'') AS mobile_number,IFNULL(ipp.landline_number,'') AS landline_number,imm.mifos_client_customer_id, " +
                        " (SELECT IF(ica.answer_id=1,680,IF(ica.answer_id=2,684,683)) FROM iklant_client_assessment ica WHERE question_id = 8 AND ica.client_id = ipc.client_id GROUP BY ica.client_id) AS answer_id " +
                        " FROM iklant_prospect_client ipc INNER JOIN iklant_prospect_client_personal ipp ON ipp.client_id = ipc.client_id INNER JOIN iklant_mifos_mapping imm ON imm.client_id = ipc.client_id " +
                        " WHERE ipc.group_id = "+group_id+" AND ipc.status_id =10 GROUP BY ipc.client_id ORDER BY ipc.client_id)client_det ORDER BY client_det.client_id ";
                    customlog.info("clientDetailsQuery: "+clientDetailsQuery);
                    clientConnect.query(clientDetailsQuery, function (error, resultSet) {
                        connectionDataSource.releaseConnectionPool(clientConnect);
                        if (error) {
                            callBack(resultSet);
                        }
                        else {
                            var iklantClientName = new Array();
                            var iklantClientChoice = new Array();
                            var clientMobileNumbers = new Array();
                            var clientLandLineNumbers = new Array();
                            var mifosCustomerId = new Array();
                            var clientIds = new Array();
                            for(var i =0;i<resultSet.length;i++){
                                clientIds[i] = resultSet[i].client_id;
                                iklantClientName[i] = resultSet[i].client_name;
                                iklantClientChoice[i]= resultSet[i].answer_id;
                                clientMobileNumbers[i] = resultSet[i].mobile_number;
                                clientLandLineNumbers[i] = resultSet[i].landline_number;
                                mifosCustomerId[i] = resultSet[i].mifos_client_customer_id;
                            }
                            callBack(activeClientsResult,iklantClientName,iklantClientChoice,clientMobileNumbers,clientLandLineNumbers,mifosCustomerId,clientIds);
                        }
                    });
                }
            });
        });
    },
    changeStatusIdDataModel: function (groupId, rejected_id_array, callback) {
        customlog.info("Inside changeStatusIdDataModel");
        var self=this;
        var constantsObj = this.constants;
        var synchronizedGroupsStatus = constantsObj.getSynchronizedGroupsStatus();
        var changeStatusIdAfterLoanSanctionInIklantDB = "update "+dbTableName.iklantProspectGroup+" set status_id = " + synchronizedGroupsStatus + ", is_ld_tracked = 0, updated_date=NOW() + INTERVAL 5 HOUR + INTERVAL 30 MINUTE where group_id = " + groupId + " ";
        var clientLdStatusChange = "update "+dbTableName.iklantProspectClient+" set is_ld_tracked = 0, updated_date=NOW() + INTERVAL 5 HOUR + INTERVAL 30 MINUTE where group_id = " + groupId + " ";
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
                                    clientConnect.query(clientLdStatusChange,
                                        function postCreate(err) {
                                            connectionDataSource.releaseConnectionPool(clientConnect);
                                            if (err) {
                                                customlog.error("LD StatusId Not Updated for client Succesfully");
                                            }
                                            callback();
                                        });
                                    if (err) {
                                        customlog.error("StatusId Not Updated for client Succesfully");
                                        callback();
                                    }

                                });
                        } else {
                        clientConnect.query(clientLdStatusChange,
                            function postCreate(err) {
                                connectionDataSource.releaseConnectionPool(clientConnect);
                                if (err) {
                                    customlog.error("LD StatusId Not Updated for client Succesfully");
                                }
                                callback();
                            });
                        }
                    } else {
                        connectionDataSource.releaseConnectionPool(clientConnect);
                        customlog.error(err);
                        callback();
                    }
                });
        });
    },
    fileUploadForLoanSanction: function (clientid, groupCode, mifosGlobalAccNo, docLanguage, bcOfficeId, callback) {
        var self=this;
        var prd_offering_loan_product = require(path.join(loanDisbursementDTOpath,"/prd_offering_loan_product"));
        var constantsObj = this.constants;
        var prd_offering_loan_productObj = new prd_offering_loan_product();
        var groupId;
        var groupName = groupCode;
        var isSynchronized;
        var parent_account_id;
        var clt_glob_no = new Array();
        var clt_name = new Array();
        var clt_Age = new Array();
        var cntr_name = new Array();
        var off_name = new Array();
        var lukup_value = new Array();
        var loan_amount = new Array();
        var loan_amount_second = new Array();
        var no_of_installment = new Array();
        var first_installment_amount = new Array();
        var installment_amount = new Array();
        var last_installment_amount = new Array();
        var recurrence_type = new Array();
        var interest_rate = new Array();
        var premiumAmount = new Array();
        var guarantorName = new Array();
        var guarantorAge = new Array();
        var guarantorAgeFinal = new Array();
        var clt_Age_second = new Array();
        var guarantorAgeSecondFinal = new Array();
        var retrieveLoanPurposeForClients = "select lv.lookup_value from  "+dbTableName.iklantProspectClient+" pc   " +
            "left join "+dbTableName.iklantProspectClientPersonal+" pcp on pcp.client_id = pc.client_id  " +
            "inner join "+dbTableName.iklantLookupValue+" lv on lv.lookup_id = pcp.loan_purpose  " +
            "where pc.client_id IN (" + clientid + ") AND  " +
            "pc.status_id = " + constantsObj.getAuthorizedStatus() + " ORDER BY pc.client_id; ";
        customlog.info("retrieveLoanPurposeForClients : " + retrieveLoanPurposeForClients);
        connectionDataSource.getConnection(function (clientConnect) {
            clientConnect.query(retrieveLoanPurposeForClients, function selectCb(err, results, fields) {
                if (err) {
                    connectionDataSource.releaseConnectionPool(clientConnect);
                    customlog.error(err);
                }
                else if (results.length > 0) {
                    for (var i in results) {
                        lukup_value[i] = results[i].lookup_value;
                    }
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
                }
            });


            var retrieveParentAccountId = "select account_id from account where global_account_num ='" + mifosGlobalAccNo + "' ";
            customlog.info("retrieveParentAccountId" + retrieveParentAccountId);
            //client.query("USE " + mifosDB);
            clientConnect.query(retrieveParentAccountId, function selectCb(err, results, fields) {
                if (err) {
                    connectionDataSource.releaseConnectionPool(clientConnect);
                    customlog.error(err);
                }
                else if (results.length > 0) {
                    customlog.info("Connection Oppened");
                    var reader = results[0];

                    parent_account_id = reader['account_id'];
                    customlog.info("parent_account_id" + parent_account_id);
                    var retrieveClientDetailsQuery = "select group_details.*,client_details.*, " +
                        "installments.first_installment_amount,installments.actual_installment_amount,installments.last_installment_amount,disbursement_date from  " +
                        "(select la.parent_account_id,la.disbursement_date,la.account_id,ccd.customer_custom_num,c.display_name,c.date_of_birth,la.business_activities_id,'0' as lookup_value,la.loan_amount,la.interest_rate, " +
                        "la.no_of_installments,(ls.principal+ls.interest) as installment_amount,la.meeting_id,rt.recurrence_name " +
                        "from loan_account la " +
                        "inner join loan_schedule ls on ls.account_id = la.account_id  " +
                        "inner join account a on a.account_id = la.account_id " +
                        "inner join customer c on c.customer_id = a.customer_id " +
                        "inner join customer_custom_detail ccd on ccd.customer_id = c.customer_id " +
                        "INNER JOIN recurrence_detail rd on rd.meeting_id = la.meeting_id  " +
                        "inner join recurrence_type rt on rt.recurrence_id = rd.recurrence_id " +
                        //"inner join lookup_value_locale lvl on lvl.lookup_id = la.business_activities_id "+
                        "where la.parent_account_id = " + parent_account_id + " and ls.installment_id = 1 ORDER BY c.`customer_id`) client_details " +
                        "left join " +
                        "(select a.account_id,c.display_name as group_name,o.display_name as office_name from account a " +
                        "inner join customer c on c.customer_id = a.customer_id " +
                        "inner join office o on o.office_id = c.branch_id " +
                        "where a.account_id = " + parent_account_id + ") group_details on  " +
                        "group_details.account_id = client_details.parent_account_id " +
                        "left join " +
                        "(SELECT 1st_inst.first_installment_amount,orig_inst.installment_amount as actual_installment_amount," +
                        "last_inst.last_installment_amount,1st_inst.account_id FROM " +
                        "((	SELECT (ls.`principal`+ls.`interest`) AS first_installment_amount,ls.`account_id` " +
                        "FROM `loan_schedule` ls INNER JOIN `loan_account` la ON la.account_id = ls.account_id " +
                        "WHERE ls.`installment_id` = (SELECT MIN(ls1.`installment_id`) FROM `loan_schedule` ls1 WHERE ls1.account_id = ls.account_id) " +
                        "AND la.`parent_account_id` = " + parent_account_id + ") 1st_inst " +
                        "LEFT JOIN " +
                        "(SELECT (ls.`principal`+ls.`interest`) AS installment_amount,ls.`account_id` " +
                        "FROM `loan_schedule` ls INNER JOIN `loan_account` la ON la.account_id = ls.account_id " +
                        "WHERE ls.`installment_id` > (SELECT MIN(ls3.`installment_id`) FROM `loan_schedule` ls3 WHERE ls3.account_id = ls.account_id) " +
                        "AND ls.`installment_id` < (SELECT MAX(ls4.`installment_id`) FROM `loan_schedule` ls4 WHERE ls4.account_id = ls.account_id) " +
                        "AND la.`parent_account_id` = " + parent_account_id + " GROUP BY la.`account_id`)" +
                        "orig_inst ON orig_inst.account_id = 1st_inst.account_id " +
                        "LEFT JOIN " +
                        "(SELECT (ls.`principal`+ls.`interest`) AS last_installment_amount,ls.`account_id` "+
                        "FROM `loan_schedule` ls INNER JOIN `loan_account` la ON la.account_id = ls.account_id "+
                        "WHERE ls.`installment_id` = (SELECT MAX(ls2.`installment_id`) FROM `loan_schedule` ls2 WHERE ls2.account_id = ls.account_id) " +
                        "AND la.`parent_account_id` = " + parent_account_id + ")" +
                        "last_inst ON last_inst.account_id = 1st_inst.account_id )) installments ON installments.account_id = client_details.account_id";

                    customlog.info("retrieveClientDetailsQuery : " + retrieveClientDetailsQuery);
                    clientConnect.query(retrieveClientDetailsQuery, function selectCb(err, results, fields) {
                        //connectionDataSource.releaseConnectionPool(clientConnect);
                        if (err) {
                            customlog.error(err);
                        }
                        else if (results.length > 0) {
                            customlog.info("Connection Opened");
                            for (var i in results) {
                                //groupName = results[0].group_name;
                                clt_glob_no[i] = results[i].customer_custom_num;
                                clt_name[i] = (results[i].display_name);
                                clt_Age[i] = dateUtils.getAge(results[i].date_of_birth);
                                clt_Age_second[i] = parseInt(dateUtils.getAge(results[i].date_of_birth)+1);
                                cntr_name[i] = results[i].group_name;
                                off_name[i] = results[i].office_name;
                                no_of_installment[i] = results[i].no_of_installments;
                                first_installment_amount[i] = results[i].first_installment_amount;
                                installment_amount[i] = results[i].actual_installment_amount;
                                last_installment_amount[i] = results[i].last_installment_amount;
                                recurrence_type[i] = results[i].recurrence_name;
                                interest_rate[i] = results[i].interest_rate;
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
                            var disbDate = results[0].disbursement_date;
                            for(j in guarantorAge){
                               if(guarantorAge[j]=="" || guarantorAge[j] == 0){
                                   guarantorAgeFinal[j]=clt_Age[j];
                                   guarantorAgeSecondFinal[j]=parseInt(clt_Age[j]+1);
                               }else{
                                   guarantorAgeFinal[j]= guarantorAge[j];
                                   guarantorAgeSecondFinal[j]=parseInt(guarantorAge[j]+1);
                               }
                            }
                            //Modified by Sathish Kumar M 008 for Premium calculate
                            self.premiumAmountCalculate(clientConnect,results,clt_Age,loan_amount,results[0].disbursement_date,function (clientConnect,premiumAmount,premiumClientAmount){
                                self.premiumAmountCalculate(clientConnect,results,guarantorAgeFinal,loan_amount,results[0].disbursement_date,function (clientConnect,premiumAmountGuarantor,premiumClientAmountGuarantor){
                                    self.premiumAmountCalculate(clientConnect,results,clt_Age_second,loan_amount_second,results[0].disbursement_date,function (clientConnect,premiumAmountSecond,premiumClientAmountSecond){
                                        self.premiumAmountCalculate(clientConnect,results,guarantorAgeSecondFinal,loan_amount_second,results[0].disbursement_date,function (clientConnect,premiumAmountGuarantorSecond,premiumClientAmountGuarantorSecond){
                                            customlog.info("clt_glob_no" + clt_glob_no);
                                            customlog.info("\n");
                                            customlog.info("clt_name" + clt_name);
                                            customlog.info("\n");
                                            customlog.info("clt_Age" + clt_Age);
                                            customlog.info("\n");
                                            customlog.info("no_of_installment" + no_of_installment);
                                            customlog.info("\n");
                                            customlog.info("recurrence_type" + recurrence_type);
                                            customlog.info("\n");
                                            customlog.info("loan_amount" + loan_amount);
                                            customlog.info("\n");
                                            customlog.info("lukup_value" + lukup_value);
                                            customlog.info("\n");
                                            customlog.info("premiumAmount" + premiumAmount);
                                            customlog.info("\n");
                                            customlog.info("premiumClientAmount" + premiumClientAmount);
                                            connectionDataSource.releaseConnectionPool(clientConnect);
                                            eval("generateLoanSanctionFormIn"+docLanguage+"(groupName, clt_glob_no, clt_name, clt_Age, cntr_name, off_name, lukup_value, no_of_installment, installment_amount, recurrence_type, loan_amount,interest_rate,first_installment_amount,last_installment_amount,premiumClientAmount,premiumAmount,disbDate,premiumAmountGuarantor,premiumClientAmountGuarantor,premiumAmountSecond,premiumClientAmountSecond,premiumAmountGuarantorSecond,premiumClientAmountGuarantorSecond,bcOfficeId)");
                                        });
                                    });
                                });
                            });

                        }
                        callback();
                    });
                }
            });



            /*var retrieveProductDetailsQuery = "select * from prd_offering_loan_product where prd_offering_id="+prdid+" ";
             client.query("USE " + mifosDB);
             client.query(retrieveProductDetailsQuery,function selectCb(err, results, fields) {
             if (err) {
             customlog.error(err);
             }
             if (results.length > 0) {
             customlog.info("Connection Oppened");
             var reader = results[0];

             var no_of_inst=reader['prd_no_of_installments'];
             var inst_type=reader['prd_installment_type'];
             var int_rate1=reader['prd_interest_rate'];
             var loan_amt1=reader['prd_loan_amount'];
             var inst_amt1=reader['prd_installment_amount'];
             customlog.info(no_of_inst);
             customlog.info(inst_type);
             customlog.info(int_rate1);
             customlog.info(loan_amt1);
             customlog.info(inst_amt1);
             }
             prd_offering_loan_productObj.setPrd_loan_amount(loan_amt1);
             prd_offering_loan_productObj.setPrd_no_of_installments(no_of_inst);
             prd_offering_loan_productObj.setPrd_installment_amount(inst_amt1);
             prd_offering_loan_productObj.setPrd_installment_type(inst_type);
             prd_offering_loan_productObj.setPrd_interest_rate(int_rate1);
             });
             client.query("USE " + ciDB);
             var retrieveClientDetailsQuery ="select pg.center_name,pc.group_id,pg.group_name, "+
             "pg.is_synchronized,o.office_name,o.office_id,pc.client_id,pc.client_global_number, "+
             "pc.client_name,pc.client_last_name,lv.lookup_value,pcp.date_of_birth from "+dbTableName.iklantProspectGroup+" pg "+
             "inner join "+dbTableName.iklantProspectClient+" pc on pc.group_id = pg.group_id "+
             "left join "+dbTableName.iklantProspectClient+"_personal pcp on pcp.client_id = pc.client_id "+
             "inner join lookup_value lv on lv.lookup_id = pcp.loan_purpose "+
             "inner join office o on o.office_id = pg.office_id where pc.client_id IN ("+clientid+") AND "+
             "pc.status_id = "+constantsObj.getAuthorizedStatus()+" ORDER BY client_id";
             customlog.info("retrieveClientDetailsQuery : "+retrieveClientDetailsQuery);
             client.query(retrieveClientDetailsQuery,function selectCb(err, results, fields) {
             if (err) {
             customlog.error(err);
             }
             if (results.length > 0) {
             customlog.info("Connection Opened");
             for (var i in results) {
             groupId = results[0].group_id;
             groupName = results[0].group_name;
             isSynchronized = results[0].is_synchronized;
             clt_glob_no[i] = results[i].client_global_number;
             clt_name[i] = (results[i].client_name+" "+results[i].client_last_name);
             clt_Age[i] = getAge(results[i].date_of_birth);
             cntr_name[i] = results[i].center_name;
             off_name[i] = results[i].office_name;
             lukup_value[i] = results[i].lookup_value;
             }
             customlog.info("clt_Age "+clt_Age);
             generateLoanSanctionForm(groupName,prd_offering_loan_productObj,clt_glob_no,clt_name,clt_Age,cntr_name,off_name,lukup_value);
             }
             customlog.info(clt_name+","+groupId);

             callback(clt_name,groupId,groupName,isSynchronized);
             });    */
        });
    },

    //Added by Sathish Kumar M 008 For LIC Premium calculate
    premiumAmountCalculate : function (clientConnect,results,clt_Age,loan_amount,disbDate,callback){
        var premiumAmount = new Array();
        var premiumClientAmount = new Array();
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
            serviceTaxAmount=1.14;
        }else if (date<mydate){
            serviceTaxAmount=1.1236;
        }else{
            serviceTaxAmount=1.14;
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
                                var num = ((parseFloat(premiumAmount[i])*parseInt(loan_amount[i]/1000))*serviceTaxAmount).toFixed();
                                //var service = (num*12.36/100).toFixed();
                                //premiumClientAmount.push((parseInt(num)+parseInt(service)).toFixed());
                                premiumClientAmount.push(num);
                                if(premiumAmount.length == premiumClientAmount.length){
                                    callback(clientConnect,premiumAmount,premiumClientAmount);
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

    getClientMobileNumberDataModel: function(clientGlobalArray,callback){
        var mobileNumbersArray = [];
        var clientGlobalArrayWithQuotes = "'" + clientGlobalArray.join("','") + "'";
        var retrieveMobileNumberQuery = "SELECT cad.`phone_number` FROM customer_address_detail cad " +
            "INNER JOIN customer cus ON (cad.customer_id = cus.customer_id) " +
            "WHERE cus.`global_cust_num` IN ("+clientGlobalArrayWithQuotes+")";
        connectionDataSource.getConnection(function (clientConnect) {
            clientConnect.query(retrieveMobileNumberQuery, function selectCb(err, results) {
                connectionDataSource.releaseConnectionPool(clientConnect);
                if (err) {
                    customlog.error("retrieveMobileNumberQuery: ",retrieveMobileNumberQuery);
                    customlog.error("error occured in getClientMobileNumberDataModel(): ",err);
                    callback("failure");
                }
                else {
                    if (results.length > 0) {
                        for (var i in results) {
                            customlog.debug("Mobile Number: "+results[i].phone_number);
                            mobileNumbersArray.push(results[i].phone_number);
                        }
                        customlog.debug("mobileNumbersArray: ",mobileNumbersArray);
                        callback("success",mobileNumbersArray);
                    }else{
                        callback("failure");
                    }
                }
            });
        });
    },
    //Added by Sathish Kumar M 008 for changing group address in mifos
    changeMifosGroupAddressDataModel: function(iklantGroupId,callback){
        var constantsObj = this.constants;
        var group_id = iklantGroupId;
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
            "	pcp.`landline_number` AS landlineNumber "+
            "	 "+
            "FROM 	"+dbTableName.iklantProspectGroup+" pg "+
            "	INNER JOIN "+dbTableName.iklantProspectClient+" pc ON pc.`group_id` = pg.`group_id` "+
            "	INNER JOIN "+dbTableName.iklantProspectClientPersonal+" pcp ON pcp.`client_id` = pc.`client_id` "+
            "	INNER JOIN "+dbTableName.iklantOffice+" o ON o.office_id = pg.office_id "+
            "	INNER JOIN iklant_state_list st ON st.state_id = o.state_id "+
            "   LEFT JOIN "+dbTableName.iklantMifosMapping+" imm ON imm.group_id = pg.group_id "+
            "WHERE CASE WHEN (SELECT client_id FROM iklant_prospect_client WHERE sub_leader_global_number  = (SELECT leader_global_number FROM "+dbTableName.iklantProspectGroup+" WHERE group_id =  " + group_id + ") AND status_id = " + constantsObj.getAuthorizedStatus() + " ) IS NOT NULL THEN"+
            " pg.group_id = " + group_id + " AND pc.client_id = (SELECT client_id FROM " +dbTableName.iklantProspectClient+ " WHERE sub_leader_global_number  = (SELECT leader_global_number FROM "+dbTableName.iklantProspectGroup+" WHERE group_id =  "+ group_id +") AND status_id = " + constantsObj.getAuthorizedStatus() + " )"+
            " ELSE  pc.client_id = (SELECT client_id FROM "+dbTableName.iklantProspectClient+" WHERE group_id = "+ group_id +" AND status_id = " + constantsObj.getAuthorizedStatus() + " LIMIT 1 ) END "+
            " LIMIT 1";
        customlog.info("ciUpdateQuery "+ciQuery);
        connectionDataSource.getConnection(function (clientConnect) {
            clientConnect.query(ciQuery,function(err,results){
                if(err){
                    connectionDataSource.releaseConnectionPool(clientConnect);
                    customlog.error(err);
                    callback("failure");
                }else{
                    var updateQuery ="UPDATE customer_address_detail SET line_1 = '" + results[0].line1+ "', line_2 = '" + results[0].line2 + "', line_3= '" + results[0].line3 + "', city = '" + results[0].city + "', state='" + results[0].state + "',country='" + results[0].country + "',zip='" + results[0].zip + "',phone_number = '" + results[0].phoneNumber + "',phone_number_stripped=" + results[0].phoneNumber + " where customer_id=" + results[0].mifos_customer_id + ";"
                    clientConnect.query(updateQuery,function(err){
                        if(err){
                            connectionDataSource.releaseConnectionPool(clientConnect);
                            customlog.error(err);
                            callback("failure");
                        }else{
                            connectionDataSource.releaseConnectionPool(clientConnect);
                            callback("success");
                        }
                    });
                }
            });
        });
    }
    //Ended by Sathish Kumar M 008 for changing group address in mifos
};
function generateLoanSanctionFormInTamil(groupName, clt_glob_no, clt_name, clt_Age, cntr_name, off_name, lukup_value, no_of_installment, installment_amount, recurrence_type, loan_amount, interest_rate,first_installment_amount,last_installment_amount,premiumClientAmount,premiumAmount,disbDate,premiumAmountGuarantor,premiumClientAmountGuarantor,premiumAmountSecond,premiumClientAmountSecond,premiumAmountGuarantorSecond,premiumClientAmountGuarantorSecond,bcOfficeId) {
    //customlog.info("In generateLoanSanctionForm"+prd_offering_loan_productObj.getPrd_loan_amount());
    var doc = new PDFDocument;
    var loanPurpose;
    var serviceTaxAmount;
    var q = new Date(disbDate);
    var m = q.getMonth();
    var d = q.getDate();
    var y = q.getFullYear();

    var date = new Date(y,m,d);

    var mydate=new Date('2015-06-01');
    var myLoanDate=new Date('2015-09-01');
    if(date>mydate){
        serviceTaxAmount=14.00;
    }else if (date<mydate){
        serviceTaxAmount=12.36;
    }else{
        serviceTaxAmount=14.00;
    }
    if(date>myLoanDate){
        serviceTaxAmount=14.00;
    }else if (date<myLoanDate){
        serviceTaxAmount=12.36;
    }else{
        serviceTaxAmount=14.00;
    }
    for (i = 0; i < clt_name.length; i++) {
        if (lukup_value.length == 0) {
            loanPurpose = "";
        } else {
            loanPurpose = lukup_value[i];
        }
        var documentCharges = (loan_amount[i]) / 100 //1 % of loanAmount
        if (i == 0) {
            doc.font('Times-Roman').fontSize(12).text(clt_glob_no[i], 220, 160);
        }
        else {
            doc.addPage().font('Times-Roman').fontSize(12).text(clt_glob_no[i], 220, 160);
        }
        doc.font('Times-Roman').fontSize(12).text(clt_name[i], 220, 180);
        doc.font('Times-Roman').fontSize(12).text(cntr_name[i], 220, 200);
        doc.font('Times-Roman').fontSize(12).text(off_name[i], 325, 110);
        doc.font('Times-Roman').fontSize(12).text(loanPurpose, 220, 220);
        if(bcOfficeId==1){
               head = dbTableName.tenantCompanyName;
                doc.font('fonts/PalatinoBold.ttf').fontSize(13).text(head, 200, 30);
                doc.font('fonts/times.ttf').fontSize(10).text(dbTableName.tenantCompanyFKAName, 180, 42);
                title1 = '(Micro Finance Division)';
                doc.moveDown().font('fonts/times.ttf').fontSize(12).text(title1, 240, 52);
                apextam = 'vk@v!@vk@ ikf@nuhigdhd@!@ ypkpbll;';
                doc.font('fonts/Amudham.ttf').fontSize(14).text(apextam, 210, 65);
                addr1 = 'gjpt[ mYtyfk;- gp-27/ Ql;nfh fhydp/';
                doc.font('fonts/Amudham.ttf').fontSize(12).text(addr1, 165, 80);
                doc.font('fonts/times.ttf').fontSize(11).text('PSG', 355, 80);
                addr3 = ' kUj;Jtkid mUfpy;/';
                doc.font('fonts/Amudham.ttf').fontSize(12).text(addr3, 376, 80);
                addr2 = 'gPsnkL/ nfhaKj;J}h;-641004. nghd;-0422 4518475.';
                doc.font('fonts/Amudham.ttf').fontSize(12).text(addr2, 205, 93);
       }else if(bcOfficeId==2){
            head = dbTableName.tenantBcCompanyName;
            doc.font('fonts/PalatinoBold.ttf').fontSize(14).text(head, 120, 30);
            //doc.font('fonts/times.ttf').fontSize(11).text('101,Sakar 1 Building, Nr.Gandhigram station, Ashram Road,', 160, 42);
            //title1 = 'Ahmedabad-380 009,Gujarat,India.';
            //doc.moveDown().font('fonts/times.ttf').fontSize(11).text(title1, 220, 52);
            apextam = 'mdd@ah igdhd@!@ `ghh@ ,d@FYh!pt@ f@nuhj@ g@iuntl@ ypkpbll;';
            doc.font('fonts/Amudham.ttf').fontSize(18).text(apextam, 110, 65);
            addr1 = "gjpt[ mYtyfk;- 101/rhQu@ 1 gpy@lp'@/";
            doc.font('fonts/Amudham.ttf').fontSize(16).text(addr1, 130, 80);
            addr3 = 'vd@Mu@.fhe@jpfpuhk@  !@nlrd@/';
            doc.font('fonts/Amudham.ttf').fontSize(16).text(addr3, 371, 80);
            addr2 = 'M#@uk@ nuhl@/ mQbkjhghj@-380609/ F$uhj@/ ,e@jpah.';
            doc.font('fonts/Amudham.ttf').fontSize(16).text(addr2, 150, 93);
        }
        bran = 'fpis mYtyfk; -';
        doc.font('fonts/Amudham.ttf').fontSize(12).text(bran, 230, 110);
        apexLines = "_______________________________________________________________________________________________";
        doc.font('fonts/times.ttf').fontSize(12).text(apexLines, 20, 115);
        normalLines = "__________________________________________________________________";
        loan = 'fld; mDkjp gotk;';
        doc.font('fonts/Agni.ttf').fontSize(16).text(loan, 220, 140);
        doc.font('fonts/times.ttf').fontSize(12).text("________________________________", 220, 140);
        clientId = 'cWg;gpdh; vd;     ';
        doc.font('fonts/Agni.ttf').fontSize(12).text(clientId, 30, 160);
        doc.font('fonts/times.ttf').fontSize(12).text(normalLines, 190, 160);
        clientname = 'cWg;gpdh; bgah;       ';
        doc.font('fonts/Agni.ttf').fontSize(12).text(clientname, 30, 180);
        doc.font('fonts/times.ttf').fontSize(12).text(normalLines, 190, 180);
        centername = 'ikaj;jpd; bgah;       ';
        doc.font('fonts/Agni.ttf').fontSize(12).text(centername, 30, 200);
        doc.font('fonts/times.ttf').fontSize(12).text(normalLines, 190, 200);
        //loanneed = 'fld; njit          ';
        //doc.font('fonts/Agni.ttf').fontSize(12).text(loanneed, 30, 340);
        //doc.font('fonts/times.ttf').fontSize(12).text(normalLines, 190, 340);
        loanpurpose = 'fld; thq;Fk; nehf;fk;  ';
        doc.font('fonts/Agni.ttf').fontSize(12).text(loanpurpose, 30, 220);
        doc.font('fonts/times.ttf').fontSize(12).text(normalLines, 190, 220);
        doc.font('fonts/times.ttf').fontSize(12).text("", 30, 220);
        agree = 'cWjp bkhHp';
        doc.font('fonts/Agni.ttf').fontSize(14).text(agree, {width: 550, align: 'center', paragraphGap: 12}, 240, 230);
        doc.font('fonts/times.ttf').fontSize(12).text("_________________", 252, 240);
        doc.font('fonts/times.ttf').fontSize(12).text("", 30, 240);
        var r1 = '1.vq;fs; FLk;g m{z;L tUkhdk; U. 1>20>000/- / U. 60>000/-f;Fk; FiwthdJ.';
        doc.font('fonts/Agni.ttf').fontSize(12).text(r1, {width: 550, align: 'justify', paragraphGap: 12}, 260, 200);
        var r2 = '2.vdf;F ,e;j fld; jtpu ntW xd;Wf;Fk; nkw;gl;l epjp epWtdq;fspy; fld; ,y;iy.';
        doc.font('fonts/Agni.ttf').fontSize(12).text(r2, {width: 545, align: 'justify', paragraphGap: 12}, 280, 200);
        var r3 = '3.ehsJ njjpapy; vd;Dila bkhj;jf;fld; bjhif(,g;bghGJ thq;Fk; bjhifiaa[k; nrh;j;J) Ugha;. 50>000/- f;Fk; Fiwthfnt cs;sJ.';
        doc.font('fonts/Agni.ttf').fontSize(12).text(r3, {width: 545, align: 'justify', paragraphGap: 12}, 300, 200);
        var r4 = '4.fld; tpz;zg;gj;jpy; Twpago fld; bjhifia Kiwahf gad;gLj;Jntd;.';
        doc.font('fonts/Agni.ttf').fontSize(12).text(r4, {width: 545, align: 'justify', paragraphGap: 12}, 330, 200);
        var r5 = '5.ikaf; Tl;lj;jpy; kl;Lnk fld; bjhifiaf; brYj;Jntd;.';
        doc.font('fonts/Agni.ttf').fontSize(12).text(r5, {width: 545, align: 'justify', paragraphGap: 12}, 350, 200);
        var r6 = '6.gapw;rpapy; gq;Fbfhz;L ,j;jpl;lj;jpd; KG tpguq;;fis mwpe;J bfhz;nld;.';
        doc.font('fonts/Agni.ttf').fontSize(12).text(r6, {width: 545, align: 'justify', paragraphGap: 12}, 370, 200);
        var r7 = '7.jtiz bjhifia brYj;Jk; nghJ> jtiz urpij rhpghh;jJ jtwhky; bgw;Wf; bfhs;s ntz;Lk;.';
        doc.font('fonts/Agni.ttf').fontSize(12).text(r7, {width: 545, align: 'justify', paragraphGap: 12}, 390, 200);
        smallLines = "________________________________________________";
        tableLines = "________________________________________________________________________________________";
        var r8 = '8.fld; bjhif    ';
        doc.font('fonts/Agni.ttf').fontSize(12).text(r8, 30, 420);
        doc.font('fonts/times.ttf').fontSize(12).text(smallLines, 290, 420);
        doc.font('fonts/Agni.ttf').fontSize(12).text("9.tl;otpfpjk;", 30, 440);
        doc.font('fonts/times.ttf').fontSize(12).text(smallLines, 290, 440);
        var form_amt = '10.nrayhf;f fl;lzk;';
        doc.font('fonts/Agni.ttf').fontSize(12).text(form_amt, 30, 460);
        doc.font('fonts/times.ttf').fontSize(12).text(smallLines, 290, 460);
        var dept_amt = '12.fhg;gPl;Lj; bjhif       ';
        doc.font('fonts/Agni.ttf').fontSize(12).text(dept_amt, 30, 500);
        doc.font('fonts/times.ttf').fontSize(12).text(smallLines, 290, 500);
        var othr_amt = '11.nrit thp';
        doc.font('fonts/Agni.ttf').fontSize(12).text(othr_amt, 30, 480);
        doc.font('fonts/times.ttf').fontSize(12).text(smallLines, 290, 480);
        var int_amt = '13.jpUk;gr; brYj;Jk; fhyk; ';
        doc.font('fonts/Agni.ttf').fontSize(12).text(int_amt, 30, 520);
        doc.font('fonts/times.ttf').fontSize(12).text(smallLines, 290, 520);
        var rtun_date = '14.fld; jtiz         ';
        doc.font('fonts/Agni.ttf').fontSize(12).text(rtun_date, 30, 540);
        doc.font('fonts/times.ttf').fontSize(12).text(smallLines, 290, 540);
        var amt_pay = '15.jtiz bjhif        ';
        doc.font('fonts/Agni.ttf').fontSize(12).text(amt_pay, 30, 560);
        doc.font('fonts/Agni.ttf').fontSize(12).text("1. Kjy; jtiz", 80, 580);
        doc.font('fonts/times.ttf').fontSize(12).text(smallLines, 290, 575);
        doc.font('fonts/Agni.ttf').fontSize(12).text("2. gpujp khj jtiz", 80, 600);
        doc.font('fonts/times.ttf').fontSize(12).text(smallLines, 290, 595);
        doc.font('fonts/Agni.ttf').fontSize(12).text("3. filrp jtiz", 80, 620);
        doc.font('fonts/times.ttf').fontSize(12).text(smallLines, 290, 615);
        /*//Horizontal Lines
         doc.font('fonts/times.ttf').fontSize(12).text(tableLines, 49, 570);
         doc.font('fonts/times.ttf').fontSize(12).text(tableLines, 49, 590);
         doc.font('fonts/times.ttf').fontSize(12).text(tableLines, 49, 610);
         doc.font('fonts/times.ttf').fontSize(12).text(tableLines, 49, 630);
         //Vertical Lines
         for (var x = 580; x <= 635; x = x + 10) {
         doc.font('fonts/times.ttf').fontSize(12).text("|", 49, x);
         doc.font('fonts/times.ttf').fontSize(12).text("|", 275, x);
         doc.font('fonts/times.ttf').fontSize(12).text("|", 480, x);
         doc.font('fonts/times.ttf').fontSize(12).text("|", 577, x);
         }*/
        //var msg = '16.mbgf;]; mgpnrf; igdhd;]; ypkpbll; epWtdj;jpd; rl;ljpl;lq;fs;> tl;otpfpjk;> ';
        if(bcOfficeId==1){
            var msg = 'vk@v!@vk@ ikf@nuhigdhd@!@ ypkpbll;';
            doc.font('fonts/Agni.ttf').fontSize(12).text('16.', 30, 640);
            doc.font('fonts/Amudham.ttf').fontSize(12).text(msg, 54, 640);
            var msg1= 'epWtdj;jpd; rl;ljpl;lq;fs;> tl;otpfpjk;> ';
            doc.font('fonts/Agni.ttf').fontSize(12).text(msg1, 250, 640);
        }
        else if(bcOfficeId==2) {
            var msg = 'mdd@ah igdhd@!@ `ghh@ ,d@FYh!pt@ f@nuhj@ g@iuntl@ ypkpbll;';
            doc.font('fonts/Agni.ttf').fontSize(12).text('16.', 30, 640);
            doc.font('fonts/Amudham.ttf').fontSize(12).text(msg, 45, 640);
            var msg1= 'epWtdj;jpd; rl;ljpl;lq;fs;> tl;otpfpjk;> ';
            doc.font('fonts/Agni.ttf').fontSize(12).text(msg1, 350, 640);
        }
        var msg1 = 'fld; bfhLf;Fk; tpjpKiwfs; kw;Wk; ,e;j fld; bgWtjw;Fhpa gj;jpu bryt[fs;> ';
        doc.font('fonts/Agni.ttf').fontSize(12).text(msg1, 30, 650);
        var msg2 = 'fhg;gPl;Lj; bjhif> nrit thp kw;Wk; ,ju bryt[fs; midj;Jk; mwpe;j gpwFjhd; ';
        doc.font('fonts/Agni.ttf').fontSize(12).text(msg2, 30, 660);
        var msg3 = 'KG kdJld; ehd; fld; bgw xg;g[f; bfhs;fpnwd;.';
        doc.font('fonts/Agni.ttf').fontSize(12).text(msg3, 30, 670);
        var sign = 'cWg;gpdh; ifbaGj;J';
        doc.font('fonts/Agni.ttf').text(sign, 420, 690);
        var evd = ' rhl;rpfs; ';
        doc.font('fonts/Agni.ttf').text(evd, 50, 690);
        doc.font('fonts/times.ttf').text("1.", 60, 710);
        doc.font('fonts/times.ttf').text("2.", 60, 730);
        doc.font('fonts/times.ttf').fontSize(12).text('Rs.' + loan_amount[i] + '/-', 310, 420);
        doc.font('fonts/times.ttf').fontSize(12).text(interest_rate[i]+" %", 310, 440);
        doc.font('fonts/times.ttf').fontSize(12).text('Rs.' + documentCharges + '/-', 310, 460);
        if(premiumClientAmountSecond[i] != 0 && premiumClientAmountGuarantorSecond[i] != 0){
            doc.font('fonts/times.ttf').fontSize(12).text('1)Self Rs.'+ premiumClientAmount[i] +'/-  '+'Gur Rs.'+ premiumClientAmountGuarantor[i] +'/-  '+'2)Self Rs.'+ premiumClientAmountSecond[i] +'/- '+'Gur Rs.'+ premiumClientAmountGuarantorSecond[i] +'/-', 300, 500);
        }else{
            doc.font('fonts/times.ttf').fontSize(12).text('1)Self Rs.'+ premiumClientAmount[i] +'/-  '+'Gur Rs.'+ premiumClientAmountGuarantor[i] +'/-  ', 310, 500);
        }
        doc.font('fonts/times.ttf').fontSize(12).text('Rs.' + Number((Math.ceil(documentCharges*(serviceTaxAmount/100)))).toFixed(0) + '/-', 310, 480);
        doc.font('fonts/times.ttf').fontSize(12).text(no_of_installment[i], 310, 520);
        doc.font('fonts/times.ttf').fontSize(12).text(recurrence_type[i], 310, 540);
        doc.font('fonts/times.ttf').fontSize(12).text('Rs.' + first_installment_amount[i] + '/-', 310, 575);
        doc.font('fonts/times.ttf').fontSize(12).text('Rs.' + installment_amount[i] + '/-', 310, 595);
        doc.font('fonts/times.ttf').fontSize(12).text('Rs.' + last_installment_amount[i] + '/-', 310, 615);
    }
    doc.write(rootPath+"/public/GeneratedPDF/" + groupName + "_loanform.pdf");
}
// Loan forms in hindi & gujarati @ Paramasivan
function generateLoanSanctionFormInHindi(groupName, clt_glob_no, clt_name, clt_Age, cntr_name, off_name, lukup_value, no_of_installment, installment_amount, recurrence_type, loan_amount, interest_rate,first_installment_amount,last_installment_amount,premiumClientAmount,premiumAmount,disbDate,premiumAmountGuarantor,premiumClientAmountGuarantor,premiumAmountSecond,premiumClientAmountSecond,premiumAmountGuarantorSecond,premiumClientAmountGuarantorSecond,bcOfficeId) {
    var doc = new PDFDocument;
    var loanPurpose;
    var serviceTaxAmount;
    var q = new Date(disbDate);
    var m = q.getMonth();
    var d = q.getDate();
    var y = q.getFullYear();

    var date = new Date(y,m,d);

    var mydate=new Date('2015-06-01');
    if(date>mydate)
    {
        serviceTaxAmount=14.00;
    }
    else if (date<mydate)
    {
        serviceTaxAmount=12.36;
    }
    else
    {
        serviceTaxAmount=14.00;
    }
    normalLines = "__________________________________________________";
    for (i = 0; i < clt_name.length; i++) {
        if (lukup_value.length == 0) {
            loanPurpose = "";
        } else {
            loanPurpose = lukup_value[i];
        }
        var documentCharges = (loan_amount[i]) / 100 //1 % of loanAmount
        if (i == 0) {
            doc.font('Times-Roman').fontSize(11).text(clt_glob_no[i], 240, 150);
        }
        else {
            doc.addPage().font('Times-Roman').fontSize(11).text(clt_glob_no[i], 240, 150);
        }
        doc.moveDown().font('fonts/times.ttf').fontSize(11).text(normalLines, 230, 150);
        doc.font('Times-Roman').fontSize(11).text(clt_name[i], 240, 170);
        doc.moveDown().font('fonts/times.ttf').fontSize(11).text(normalLines, 230, 170);
        doc.font('Times-Roman').fontSize(11).text(cntr_name[i], 240, 190);
        doc.moveDown().font('fonts/times.ttf').fontSize(11).text(normalLines, 230, 190);
        doc.font('Times-Roman').fontSize(11).text(" - "+off_name[i], 302, 102);
        //doc.moveDown().font('fonts/times.ttf').fontSize(12).text(normalLines, 230, 210);
        doc.font('Times-Roman').fontSize(11).text(loanPurpose, 240, 210);
        doc.moveDown().font('fonts/times.ttf').fontSize(11).text(normalLines, 230, 210);
        doc.font('fonts/times.ttf').fontSize(12).text(dbTableName.tenantCompanyName, 220, 20);
        doc.font('fonts/times.ttf').fontSize(10).text(dbTableName.tenantCompanyFKAName, 180, 32);
        //doc.font('fonts/times.ttf').fontSize(12).text("APEX ABISHEK FINANCE LIMITED", 200, 20);
        doc.font('fonts/times.ttf').fontSize(10).text("(Micro Finance Division)", 250, 40);
        //header ="viSDl vch'ksd Qkbusal fyfeVsM";
        header=",e,l,e ekbØksQkbusal fyfeVsM";
        doc.font('fonts/KrutiDev010.ttf').fontSize(13).text(header, 235, 55);
        regOffice = "iath�r dk;kZy;";
        doc.font('fonts/KrutiDev010.ttf').fontSize(12).text(regOffice, 170, 70);
        doc.font('fonts/times.ttf').fontSize(11).text("- B - 27, ", 240, 70);
        doc.font('fonts/KrutiDev010.ttf').fontSize(11).text("    gqMdks d�yksuh]      g�fLiVy ds ikl ]", 262, 70);
        doc.font('fonts/times.ttf').fontSize(11).text("PSG ", 333, 70);
        doc.font('fonts/KrutiDev010.ttf').fontSize(11).text(" ihyesMq] dksbEcVksj ", 190, 85);
        doc.font('fonts/times.ttf').fontSize(11).text("- 641004, Ph - 0422 - 4518475 ", 270, 85);
        branchOffice = "'kk[kk dk;kZy;";
        doc.font('fonts/KrutiDev010.ttf').fontSize(12).text(branchOffice, 240, 100);
        doc.font('fonts/times.ttf').fontSize(12).text("___________________________________________________________________________________________________", 10, 105);
        form = "_.k ds fy, vkosnu i=";
        doc.font('fonts/KrutiDev010.ttf').fontSize(12).text(form, 245, 120);
        doc.moveDown().font('fonts/times.ttf').fontSize(11).text("__________________", 245, 120);
        memberNo = "lnL;rk la";
        doc.font('fonts/KrutiDev010.ttf').fontSize(11).text(memberNo, 70, 150);
        memberName = "lnL; dk uke";
        doc.font('fonts/KrutiDev010.ttf').fontSize(11).text(memberName, 70, 170);
        centerName = "dsa� dk uke";
        doc.font('fonts/KrutiDev010.ttf').fontSize(11).text(centerName, 70, 190);
        loanReq = "_.k dh vko';drk";
        //doc.font('fonts/KrutiDev010.ttf').fontSize(12).text(loanReq, 70, 210);
        purpose = "_.k dk m�s'; ";
        doc.font('fonts/KrutiDev010.ttf').fontSize(11).text(purpose, 70, 210);
        doc.font('fonts/times.ttf').fontSize(11).text("", 70, 230);
        agree = '?kks"k.kk';
        doc.font('fonts/KrutiDev010.ttf').fontSize(12).text(agree, 252, 230);
        doc.font('fonts/times.ttf').fontSize(11).text("_____", 252, 230);
        doc.font('fonts/times.ttf').fontSize(11).text("", 70, 230);
        var r1 = '1- ifjokj dh okf"kZd vk; #- 1]20]000 @ 60]000 @ & uhps gS';
        doc.font('fonts/KrutiDev010.ttf').fontSize(11).text(r1, {width: 550, align: 'justify', paragraphGap: 12}, 250, 200);
        var r2 = "2- eSaus bl _.k ds vykok vkSj fdlh Hkh fo�kh; laLFkkvksa ls _.k ugha fy;k gS A";
        doc.font('fonts/KrutiDev010.ttf').fontSize(11).text(r2, {width: 545, align: 'justify', paragraphGap: 12}, 270, 200);
        var r3 = "3- esjh dqy _.k jkf'k] vkt dh rkjh[k esa] #- 60]000@& ls dke gS �bl _.k lfgr� A";
        doc.font('fonts/KrutiDev010.ttf').fontSize(11).text(r3, {width: 545, align: 'justify', paragraphGap: 12}, 290, 200);
        var r4 = '4- vkosnu ds vuqlkj] eSa _.k dk lgh mi;ksx d#�xh A';
        doc.font('fonts/KrutiDev010.ttf').fontSize(11).text(r4, {width: 545, align: 'justify', paragraphGap: 12}, 310, 200);
        var r5 = '5- eSa dsoy dsU� dh cSBdesa gh _.k dh fdLr pqdkšxh';
        doc.font('fonts/KrutiDev010.ttf').fontSize(11).text(r5, {width: 545, align: 'justify', paragraphGap: 12}, 330, 200);
        var r6 = "6- eSaus fu;e ds vuqlkj �f'k{k.k esa Hkkx fy;k] ,ca lHkh tkudkjh le> yh gS";
        doc.font('fonts/KrutiDev010.ttf').fontSize(11).text(r6, {width: 545, align: 'justify', paragraphGap: 12}, 350, 200);
        var r7 = "7- f?Lr Hkqxrku ds le;] jlhn dks lgh ls tk�p vkSj �kIr djuk lqfuf'pr djsa";
        doc.font('fonts/KrutiDev010.ttf').fontSize(11).text(r7, {width: 545, align: 'justify', paragraphGap: 12}, 370, 200);
        var r8 = "8- _.k jkf'k";
        doc.font('fonts/KrutiDev010.ttf').fontSize(11).text(r8, {width: 545, align: 'justify', paragraphGap: 12}, 390, 200);
        var int_rate = '9- C;kt nj';
        doc.font('fonts/KrutiDev010.ttf').fontSize(11).text(int_rate, {width: 545, align: 'justify', paragraphGap: 12}, 410, 200);
        var form_amt = "10- �ys[ku 'kqYd";
        doc.font('fonts/KrutiDev010.ttf').fontSize(11).text(form_amt, {width: 545, align: 'justify', paragraphGap: 12}, 430, 200);
        var dept_amt = "11- chek �hfe;e";
        doc.font('fonts/KrutiDev010.ttf').fontSize(11).text(dept_amt, {width: 545, align: 'justify', paragraphGap: 12}, 450, 200);
        var ser_tax = '12- lsok dj ';
        doc.font('fonts/KrutiDev010.ttf').fontSize(11).text(ser_tax, {width: 545, align: 'justify', paragraphGap: 12}, 470, 200);
        var rtun_date = '13- pqdkSrh �hfe;e';
        doc.font('fonts/KrutiDev010.ttf').fontSize(11).text(rtun_date, {width: 545, align: 'justify', paragraphGap: 12}, 490, 200);
        var amt_pay = "14- _.k fd'r";
        doc.font('fonts/KrutiDev010.ttf').fontSize(11).text(amt_pay, {width: 545, align: 'justify', paragraphGap: 12}, 510,200);
        var int_amt = '15- ekfld fdLr';
        doc.font('fonts/KrutiDev010.ttf').fontSize(11).text(int_amt, {width: 545, align: 'justify', paragraphGap: 12}, 530, 200);
        doc.font('fonts/KrutiDev010.ttf').fontSize(11).text("1- igyh fdLr", 100, 550);
        doc.font('fonts/KrutiDev010.ttf').fontSize(11).text("2- ekfld fdLr", 100, 570);
        doc.font('fonts/KrutiDev010.ttf').fontSize(11).text("3- vafre fdLr", 100, 590);
        doc.font('fonts/times.ttf').fontSize(11).text("", 70, 590);
        var msg1 = "16- eSaus iwjh rjg ls] viSDl vch'ksd Qkbusal fyfeVsM ds fu;eksa vkSj fofu;eksa dks tkuus ds ckn _.k dk ykHk mBkus ds";
        doc.font('fonts/KrutiDev010.ttf').fontSize(11).text(msg1, {width: 545, align: 'justify', paragraphGap: 12}, 610, 200);
        var msg2 = " fy, viuh iwjh lgefr ns nh gS] tSls& C;kt nj] _.k ds forj.k laca/kh fu;eksa] chek �hfe;e] lsok dj] vkSj vU; [kpksaZ-";
        doc.font('fonts/KrutiDev010.ttf').fontSize(11).text(msg2, {width: 545, align: 'justify', paragraphGap: 12}, 630,200);
        var sign = 'lnL; ds gLrk�kj';
        doc.font('fonts/KrutiDev010.ttf').text(sign, 420, 660);
        var evd = 'xokgksa ds gLrk{kj';
        doc.font('fonts/KrutiDev010.ttf').text(evd, 90, 660);
        doc.font('fonts/times.ttf').text("1.", 95, 680);
        doc.font('fonts/times.ttf').text("2.", 95, 700);
        doc.font('fonts/times.ttf').fontSize(11).text('Rs.' + loan_amount[i] + '/-', 260, 390);
        doc.moveDown().font('fonts/times.ttf').fontSize(11).text(normalLines, 250, 390);
        doc.font('fonts/times.ttf').fontSize(11).text(interest_rate[i] + ' %', 260, 410);
        doc.moveDown().font('fonts/times.ttf').fontSize(11).text(normalLines, 250, 410);
        doc.font('fonts/times.ttf').fontSize(11).text('Rs.' + documentCharges + '/-', 260, 430);
        doc.moveDown().font('fonts/times.ttf').fontSize(11).text(normalLines, 250, 430);
        if(premiumClientAmountSecond[i] != 0 && premiumClientAmountGuarantorSecond[i] != 0){
            doc.font('fonts/times.ttf').fontSize(11).text('1)Self Rs.'+ premiumClientAmount[i] +'/-  '+'Gur Rs.'+ premiumClientAmountGuarantor[i] +'/-  '+'2)Mem Rs.'+ premiumClientAmountSecond[i] +'/- '+'Gur Rs.'+ premiumClientAmountGuarantorSecond[i] +'/-', 250, 450);
        }else{
            doc.font('fonts/times.ttf').fontSize(11).text('1)Self Rs.'+ premiumClientAmount[i] +'/-  '+'Gur Rs.'+ premiumClientAmountGuarantor[i] +'/-  ', 250, 450);
        }
        doc.moveDown().font('fonts/times.ttf').fontSize(11).text(normalLines, 250, 450);
        doc.font('fonts/times.ttf').fontSize(11).text(Number((Math.ceil(documentCharges*(serviceTaxAmount/100)))).toFixed(0)+"/-", 260, 470);
        doc.moveDown().font('fonts/times.ttf').fontSize(11).text(normalLines, 250, 470);
        doc.font('fonts/times.ttf').fontSize(11).text(no_of_installment[i], 260, 490);
        doc.moveDown().font('fonts/times.ttf').fontSize(11).text(normalLines, 250, 490);
        doc.font('fonts/times.ttf').fontSize(11).text(recurrence_type[i], 260, 510);
        doc.moveDown().font('fonts/times.ttf').fontSize(11).text(normalLines, 250, 510);
        doc.font('fonts/times.ttf').fontSize(11).text('Rs.' + first_installment_amount[i] + '/-', 260, 550);
        doc.moveDown().font('fonts/times.ttf').fontSize(11).text(normalLines, 250, 550);
        doc.font('fonts/times.ttf').fontSize(11).text('Rs.' + installment_amount[i] + '/-', 260, 570);
        doc.moveDown().font('fonts/times.ttf').fontSize(11).text(normalLines, 250, 570);
        doc.font('fonts/times.ttf').fontSize(11).text('Rs.' + last_installment_amount[i] + '/-', 260, 590);
        doc.moveDown().font('fonts/times.ttf').fontSize(11).text(normalLines, 250, 590);
    }
    doc.write(rootPath+"/public/GeneratedPDF/" + groupName + "_loanform.pdf");
}
function generateLoanSanctionFormInGujarati(groupName, clt_glob_no, clt_name, clt_Age, cntr_name, off_name, lukup_value, no_of_installment, installment_amount, recurrence_type, loan_amount, interest_rate,first_installment_amount,last_installment_amount,premiumClientAmount,premiumAmount,disbDate,premiumAmountGuarantor,premiumClientAmountGuarantor,premiumAmountSecond,premiumClientAmountSecond,premiumAmountGuarantorSecond,premiumClientAmountGuarantorSecond,bcOfficeId) {
    var doc = new PDFDocument;
    var loanPurpose;
    var serviceTaxAmount;
    var q = new Date(disbDate);
    var m = q.getMonth();
    var d = q.getDate();
    var y = q.getFullYear();

    var date = new Date(y,m,d);

    var mydate=new Date('2015-06-01');
    if(date>mydate)
    {
        serviceTaxAmount=14.00;
    }
    else if (date<mydate)
    {
        serviceTaxAmount=12.36;
    }
    else
    {
        serviceTaxAmount=14.00;
    }
    normalLines = "_______________________________________________________";
    for (i = 0; i < clt_name.length; i++) {
        if (lukup_value.length == 0) {
            loanPurpose = "";
        } else {
            loanPurpose = lukup_value[i];
        }
        var documentCharges = (loan_amount[i]) / 100 //1 % of loanAmount
        if (i == 0) {
            doc.image(rootPath+"/public/images/loan_form_Gujarati_new.png",0,0, {scale:0.25});
        }
        else {
            doc.addPage().image(rootPath+"/public/images/loan_form_Gujarati.png",0,0, {scale:0.25});
        }
        doc.font('Times-Roman').fontSize(12).text(clt_glob_no[i], 240, 170);
        doc.moveDown().font('fonts/times.ttf').fontSize(12).text(normalLines, 230, 170);
        doc.font('Times-Roman').fontSize(12).text(clt_name[i], 240, 190);
        doc.moveDown().font('fonts/times.ttf').fontSize(12).text(normalLines, 230, 190);
        doc.font('Times-Roman').fontSize(12).text(cntr_name[i], 240, 210);
        doc.moveDown().font('fonts/times.ttf').fontSize(12).text(normalLines, 230, 210);
        //doc.moveDown().font('fonts/times.ttf').fontSize(12).text(normalLines, 230, 250);
        doc.font('Times-Roman').fontSize(11).text(" - "+off_name[i], 310, 115);
        doc.font('Times-Roman').fontSize(12).text("________________________________________________________________________________________________", 20, 125);
        doc.font('Times-Roman').fontSize(12).text(loanPurpose, 240, 230);
        doc.moveDown().font('fonts/times.ttf').fontSize(12).text(normalLines, 230, 230);
        doc.font('fonts/times.ttf').fontSize(12).text('Rs.' + loan_amount[i] + '/-', 240, 430);
        doc.moveDown().font('fonts/times.ttf').fontSize(12).text(normalLines, 230, 430);
        doc.font('fonts/times.ttf').fontSize(12).text(interest_rate[i] + ' %', 240, 450);
        doc.moveDown().font('fonts/times.ttf').fontSize(12).text(normalLines, 230, 450);
        doc.font('fonts/times.ttf').fontSize(12).text('Rs.' + documentCharges + '/-', 240, 475);
        doc.moveDown().font('fonts/times.ttf').fontSize(12).text(normalLines, 230, 475);
        if(premiumClientAmountSecond[i] != 0 && premiumClientAmountGuarantorSecond[i] != 0){
            doc.font('fonts/times.ttf').fontSize(12).text('1)Self Rs.'+ premiumClientAmount[i] +'/-  '+'Gur Rs.'+ premiumClientAmountGuarantor[i] +'/-  '+'2)Mem Rs.'+ premiumClientAmountSecond[i] +'/- '+'Gur Rs.'+ premiumClientAmountGuarantorSecond[i] +'/-', 230, 500);
        }else{
            doc.font('fonts/times.ttf').fontSize(12).text('1)Self Rs.'+ premiumClientAmount[i] +'/-  '+'Gur Rs.'+ premiumClientAmountGuarantor[i] +'/-  ', 230, 500);
        }
        doc.moveDown().font('fonts/times.ttf').fontSize(12).text(normalLines, 230, 500);
        doc.font('fonts/times.ttf').fontSize(12).text(Number(Math.ceil(documentCharges*(serviceTaxAmount/100))).toFixed(0) + '/-', 240, 520);
        doc.moveDown().font('fonts/times.ttf').fontSize(12).text(normalLines, 230, 520);
        doc.font('fonts/times.ttf').fontSize(12).text(no_of_installment[i], 240, 540);
        doc.moveDown().font('fonts/times.ttf').fontSize(12).text(normalLines, 230, 540);
        doc.font('fonts/times.ttf').fontSize(12).text(recurrence_type[i], 240, 565);
        doc.moveDown().font('fonts/times.ttf').fontSize(12).text(normalLines, 230, 565);
        doc.font('fonts/times.ttf').fontSize(12).text('Rs.' + first_installment_amount[i] + '/-', 240, 608);
        doc.moveDown().font('fonts/times.ttf').fontSize(12).text(normalLines, 230, 608);
        doc.font('fonts/times.ttf').fontSize(12).text('Rs.' + installment_amount[i] + '/-', 240, 630);
        doc.moveDown().font('fonts/times.ttf').fontSize(12).text(normalLines, 230, 630);
        doc.font('fonts/times.ttf').fontSize(12).text('Rs.' + last_installment_amount[i] + '/-', 240, 650);
        doc.moveDown().font('fonts/times.ttf').fontSize(12).text(normalLines, 230, 650);
    }
    doc.write(rootPath+"/public/GeneratedPDF/" + groupName + "_loanform.pdf");
}
