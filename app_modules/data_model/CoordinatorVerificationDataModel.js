module.exports = commonDataModel;

var path = require('path');
var rootPath = path.dirname(process.mainModule.filename);
var dbTableName = require(path.join(rootPath,"properties.json"));
var fs = require('fs');

var connectionDataSource = require(path.join(rootPath,"app_modules/data_model/DataSource"));
var customlog = require(path.join(rootPath,"logger/loggerConfig.js"))('CoordinatorVerificationDataModel.js');
var dateUtils = require(path.join(rootPath,'app_modules/utils/DateUtils'));
var commonUtils = require(path.join(rootPath,'app_modules/utils/commonUtils'));
var commonDTO = path.join(rootPath,"app_modules/dto/common");
var PDFDocument = require('pdfkit');
var ciDB = dbTableName.database;
var mysql = require('mysql');


function commonDataModel(constants) {
    customlog.debug("Inside Common Data Access Layer");
    this.constants = constants;

    /*this.client = mysql.createConnection({
        host:dbTableName.host,
        user: dbTableName.username,
        password: dbTableName.password,
        insecureAuth: true
    });
    this.client.query("USE " + ciDB);*/
}

commonDataModel.prototype = {

    getGroupsForKYCVerificationDataModel : function(tenantId,userId,roleId,officeId,requestedTab,callback) {
        console.log("Inside getGroupsForKYCVerificationDataModel");
        var self = this;
        var constantsObj = this.constants;
        var getGroupsForKYCVerificationQuery;
        var groupIdArray = new Array();
        var groupNameArray = new Array();
        var centerNameArray = new Array();
        var holdClientsArray = new Array();
        var groupsForKYCVerification = {};
        console.log("requestedTab datamodel : " + requestedTab);
        if(requestedTab == 1) {
            getGroupsForKYCVerificationQuery = "SELECT pg.group_id,pg.group_name,pg.center_name " +
                "FROM "+dbTableName.iklantProspectGroup+" pg " +
                "WHERE  pg.status_id = " + constantsObj.getKYCVerificationStatusId() + " AND pg.needed_image_clarity = 0  AND pg.`office_id` =" + officeId + " ";
        }else if(requestedTab == 2) {
            //getGroupsForKYCVerificationQuery = "SELECT pg.group_id,pg.group_name,pg.center_name " +
              //  "FROM "+dbTableName.iklantProspectGroup+" pg " +
                //"WHERE  pg.status_id IN( " + constantsObj.getKYCVerificationStatusId() + "," +constantsObj.getKYCUploaded()+") AND pg.needed_image_clarity = 0  AND pg.`office_id` =" + officeId + " ";
            var retrieveStatusId = roleId != constantsObj.getBMroleId() ? constantsObj.getKYCVerificationStatusId() : constantsObj.getKYCUploaded() ;

            getGroupsForKYCVerificationQuery = "SELECT grp.group_id,grp.group_name,grp.center_name, IFNULL(cli.hold_clients,0) AS holdClients "+
                "FROM "+
                "(SELECT pg.group_id,pg.group_name,pg.center_name "+
                "FROM "+dbTableName.iklantProspectGroup+" pg "+
                "WHERE  pg.status_id IN (" + retrieveStatusId + ")  AND pg.needed_image_clarity = -1  AND pg.`office_id` = " + officeId + " ) grp "+
                "LEFT JOIN "+
                "(SELECT COUNT(*)  AS hold_clients,pc.group_id  FROM "+dbTableName.iklantProspectClient+" pc "+
                "WHERE pc.`status_id` IN (" + constantsObj.getKYCVerificationStatusId() + ") "+
                "GROUP BY pc.group_id ) cli ON cli.group_id =  grp.group_id " +
                "where cli.hold_clients > 0 ";

        }else if(requestedTab == 4) {

            getGroupsForKYCVerificationQuery = "SELECT grp.group_id,grp.group_name,grp.center_name, IFNULL(cli.hold_clients,0) AS holdClients "+
                "FROM "+
                "(SELECT pg.group_id,pg.group_name,pg.center_name "+
                "FROM "+dbTableName.iklantProspectGroup+" pg "+
                "WHERE  pg.status_id = " + constantsObj.getKYCUploaded() + "  AND pg.needed_image_clarity = 1  AND pg.`office_id` = " + officeId + " ) grp "+
                "LEFT JOIN "+
                "(SELECT COUNT(*)  AS hold_clients,pc.group_id  FROM "+dbTableName.iklantProspectClient+" pc "+
                "WHERE pc.`status_id` IN (" + constantsObj.getKYCVerificationStatusId() + ") "+
                "GROUP BY pc.group_id ) cli ON cli.group_id =  grp.group_id " +
                "where cli.hold_clients > 0 ";
        }
        else{
            //getGroupsForKYCVerificationQuery = "SELECT pg.group_id,pg.group_name,pg.center_name " +
                //"FROM "+dbTableName.iklantProspectGroup+" pg " +
                //"WHERE  pg.status_id = " + constantsObj.getKYCVerificationStatusId() + " AND pg.needed_image_clarity = 1  AND pg.`office_id` =" + officeId + " ";
            var retrieveStatusId = roleId != constantsObj.getBMroleId() ? constantsObj.getKYCVerificationStatusId() : constantsObj.getKYCUploaded() ;

            getGroupsForKYCVerificationQuery = "SELECT grp.group_id,grp.group_name,grp.center_name, IFNULL(cli.hold_clients,0) AS holdClients "+
                "FROM "+
                "(SELECT pg.group_id,pg.group_name,pg.center_name "+
                "FROM "+dbTableName.iklantProspectGroup+" pg "+
                "WHERE  pg.status_id IN (" + retrieveStatusId + ")  AND pg.needed_image_clarity = 1  AND pg.`office_id` = " + officeId + " ) grp "+
                "LEFT JOIN "+
                "(SELECT COUNT(*)  AS hold_clients,pc.group_id  FROM "+dbTableName.iklantProspectClient+" pc "+
                "WHERE pc.`status_id` IN (" + constantsObj.getNewGroup() + ") "+
                "GROUP BY pc.group_id ) cli ON cli.group_id =  grp.group_id "+
                "where cli.hold_clients > 0 ";
        }


        customlog.info("fetch query for KYC Verification : "+ getGroupsForKYCVerificationQuery);
        connectionDataSource.getConnection(function (clientConnect) {
            clientConnect.query(getGroupsForKYCVerificationQuery, function selectCb(err, results, fields) {
                console.log(results.length);
                if (err) {
                    connectionDataSource.releaseConnectionPool(clientConnect);
                    customlog.error(err);
                }
                else if (results != null && results.length > 0) {
                    connectionDataSource.releaseConnectionPool(clientConnect);
                    for (var i in results) {
                        var fieldName   = results[i];
                        groupIdArray[i]    = fieldName.group_id;
                        groupNameArray[i]  = fieldName.group_name;
                        centerNameArray[i] = fieldName.center_name;
                        if(requestedTab == 3){
                            holdClientsArray[i] = fieldName.holdClients;
                        }
                    }
                    groupsForKYCVerification.groupIdList = groupIdArray;
                    groupsForKYCVerification.groupNameList = groupNameArray;
                    groupsForKYCVerification.centerNameList = centerNameArray;
                    if(requestedTab == 3) {
                        groupsForKYCVerification.holdClientsList = holdClientsArray;
                    }
                    callback(groupsForKYCVerification);
                }else{
                    connectionDataSource.releaseConnectionPool(clientConnect);
                    groupsForKYCVerification.groupIdList = groupIdArray;
                    groupsForKYCVerification.groupNameList = groupNameArray;
                    groupsForKYCVerification.centerNameList = centerNameArray;
                    if(requestedTab == 3) {
                        groupsForKYCVerification.holdClientsList = holdClientsArray;
                    }
                    callback(groupsForKYCVerification);
                }
            });
        });
    },
    getClientListForKYCVerifcationDataModel : function(groupId,callback){

        var self = this;
        var constantsObj = this.constants;
        var groupId,groupName,centerName;
        var clientIdArray = new Array();
        var clientNameArray = new Array();
        var clientsForKYCVerification = {};
        var getClientListForKYCVerificationQuery = "SELECT pg.group_id,pg.group_name,pg.center_name ,pc.`client_id`,pc.`client_name` "+
                                                    "FROM iklant_prospect_group pg "+
                                                    "INNER JOIN  iklant_prospect_client pc ON pc.`group_id` = pg.`group_id` "+
                                                    "WHERE  pg.group_id = "+groupId+" AND pc.status_id = " + constantsObj.getKYCVerificationStatusId() + " ";

        customlog.info("fetch clients query for KYC Verification : "+ getClientListForKYCVerificationQuery);
        connectionDataSource.getConnection(function (clientConnect) {
            clientConnect.query(getClientListForKYCVerificationQuery, function selectCb(err, results, fields) {
                console.log(results.length);
                if (err) {
                    connectionDataSource.releaseConnectionPool(clientConnect);
                    customlog.error(err);
                }
                else if (results != null && results.length > 0) {
                    connectionDataSource.releaseConnectionPool(clientConnect);
                    for (var i in results) {
                        var fieldName   = results[i];
                        groupId    = fieldName.group_id;
                        groupName  = fieldName.group_name;
                        centerName = fieldName.center_name;
                        clientIdArray[i] = fieldName.client_id;
                        clientNameArray[i] = fieldName.client_name;

                    }
                    clientsForKYCVerification.groupId = groupId;
                    clientsForKYCVerification.groupName = groupName;
                    clientsForKYCVerification.centerName = centerName;
                    clientsForKYCVerification.clientIdList = clientIdArray;
                    clientsForKYCVerification.clientNameList = clientNameArray;
                    callback(clientsForKYCVerification);
                }else{
                    connectionDataSource.releaseConnectionPool(clientConnect);
                    clientsForKYCVerification.groupId = groupId;
                    clientsForKYCVerification.groupName = groupName;
                    clientsForKYCVerification.centerName = centerName;
                    clientsForKYCVerification.clientIdList = clientIdArray;
                    clientsForKYCVerification.clientNameList = clientNameArray;
                    callback(clientsForKYCVerification);
                }
            });
        });
    },
    getKYCDocumentsClientDataModel : function(clientId,documentId,callback) {
        console.log("Inside getKYCDocumentsForClientDataModel");

        var self = this;
        var constantsObj = this.constants;
        var clientKYCDocumentsForVerification = {};
        var clientId,clientName,groupId;
        var docTypeIdArray = new Array();
        var docTypeNameArray = new Array();
        var base64ImageArray = new Array();
        var clientDocIdArray = new Array();


        console.log("clientId : " + clientId +" documentId " + documentId) ;

        var kycDocumentsForVerificationQuery = "SELECT cd.Captured_image, " +
            "CASE WHEN sdt.`sub_doc_name` IS NULL THEN  dt.doc_name ELSE CONCAT(dt.doc_name ,' - ',sdt.`sub_doc_name`) END AS doc_name, "+
            "cd.client_doc_id,dt.doc_id AS kyc_id, "+
            "IF(dt.doc_id=3,1,IF(dt.doc_id=6,2,IF(dt.doc_id=8,3,IF(dt.doc_id=7,4,IF(dt.doc_id=9,5,IF(dt.doc_id=12,6,7)))))) AS doc_id , "+
            "pc.client_name ,pc.`client_id`,pg.`group_id`,pg.`center_name`,pc.`needed_image_clarity_docs` "+
            "FROM iklant_client_doc cd "+
            "LEFT JOIN iklant_doc_type dt ON dt.doc_id = cd.doc_type_id "+
            "LEFT JOIN `iklant_subdoc_type` sdt ON sdt.`sub_doc_id` = cd.`sub_doc_id` "+
            "INNER JOIN iklant_prospect_client pc ON pc.`client_id` = cd.`client_id` "+
            "INNER JOIN iklant_prospect_group pg ON pg.group_id = pc.group_id "+
            "WHERE cd.client_id="+clientId+" AND (cd.doc_type_id = "+documentId+" OR "+documentId+" = -1 ) AND "+
            "cd.loan_count =  pc.`loan_count` "+
            "ORDER BY doc_id ";

        console.log("fetch clients query for KYC Verification : "+ kycDocumentsForVerificationQuery);
        customlog.info("fetch clients query for KYC Verification : "+ kycDocumentsForVerificationQuery);
        connectionDataSource.getConnection(function (clientConnect) {
            clientConnect.query(kycDocumentsForVerificationQuery, function selectCb(err, results, fields) {
                console.log(results.length);
                if (err) {
                    connectionDataSource.releaseConnectionPool(clientConnect);
                    customlog.error(err);
                }
                else if (results != null && results.length > 0) {
                    connectionDataSource.releaseConnectionPool(clientConnect);
                    for (var i in results) {
                        var fieldName = results[i];
                        var imageLocation = fieldName.Captured_image;
                        try {
                            var bitmap = fs.readFileSync(imageLocation);
                            docTypeNameArray[i] = fieldName.doc_name;
                            docTypeIdArray[i] = fieldName.kyc_id;
                            clientDocIdArray[i] = fieldName.client_doc_id;
                            base64ImageArray[i] = "data:image\/png;base64," + new Buffer(bitmap).toString('base64');
                            clientId = fieldName.client_id;
                            clientName = fieldName.client_name;
                            groupId = fieldName.group_id;
                        } catch (exc) {
                            customlog.error("Exception in Doc retrival " + exc);
                            if (exc) {
                                status = 'failure';
                            }
                        }
                    }
                    clientKYCDocumentsForVerification.docNameList = docTypeNameArray;
                    clientKYCDocumentsForVerification.docIdList = docTypeIdArray;
                    clientKYCDocumentsForVerification.docImageList = base64ImageArray;
                    clientKYCDocumentsForVerification.clientDocIdList = clientDocIdArray;
                    clientKYCDocumentsForVerification.clientId = clientId;
                    clientKYCDocumentsForVerification.clientName = clientName;
                    clientKYCDocumentsForVerification.groupId = groupId;
                    callback(clientKYCDocumentsForVerification);
                }else{
                    connectionDataSource.releaseConnectionPool(clientConnect);
                    console.log("asdfasdfasdfsdsdaf");
                    clientKYCDocumentsForVerification.docNameList = docTypeNameArray;
                    clientKYCDocumentsForVerification.docIdList = docTypeIdArray;
                    clientKYCDocumentsForVerification.docImageList = base64ImageArray;
                    clientKYCDocumentsForVerification.clientId = clientId;
                    clientKYCDocumentsForVerification.clientName = clientName;
                    callback(clientKYCDocumentsForVerification);
                }
            });
        });
    },
    updateVerificationClientStatusDataModel : function(userId,clientId,rejectedDocs,rejectedDocsRemarks,groupId,callback){

        var self = this;
        var newGroupFlag = false;
        var kycVerificationGroupFlag = false;
        var constantsObj = this.constants;
        var updateVerificationClientStatusQuery;
        if(rejectedDocs.length == 0) {
            updateVerificationClientStatusQuery = "update " + dbTableName.iklantProspectClient + " set status_id = "+ constantsObj.getKYCUploaded()+",needed_image_clarity_docs='0',remarks_for_need_more_information = '"+rejectedDocsRemarks+"',updated_date=NOW() + INTERVAL 5 HOUR + INTERVAL 30 MINUTE,updated_by = "+userId+" where client_id = "+clientId+" ";
        }
        else{
            updateVerificationClientStatusQuery = "update " + dbTableName.iklantProspectClient + " set status_id = "+ constantsObj.getNewGroup()+",needed_image_clarity_docs='"+rejectedDocs+"',remarks_for_need_more_information = '"+rejectedDocsRemarks+"',updated_date=NOW() + INTERVAL 5 HOUR + INTERVAL 30 MINUTE,updated_by = "+userId+" where client_id = "+clientId+" ";
        }

        customlog.info("updateVerificationClientStatusQuery : " + updateVerificationClientStatusQuery);
        connectionDataSource.getConnection(function (clientConnect) {
            clientConnect.query(updateVerificationClientStatusQuery,function postCreate(err) {
                if (!err) {
                    if(rejectedDocs.length != 0) {
                        var getFOForGroupId = "SELECT created_by,`office_id` FROM `iklant_prospect_group` WHERE group_id = " + groupId;
                        connectionDataSource.getConnection(function (clientConnect1) {
                            clientConnect1.beginTransaction(function (err) {
                                if (err) {
                                    customlog.error(err);
                                }
                                if (clientConnect1 != null) {
                                    clientConnect1.query(getFOForGroupId, function selectCb(err, results, fields) {
                                        if (err) {
                                            clientConnect1.rollback(function () {
                                                customlog.error("Error in Apex Coordinator"+err);
                                                connectionDataSource.releaseConnectionPool(clientConnect1);
                                                clientConnect1 = null;
                                                //callback("Failure");
                                            });

                                        } else {
                                            if (results.length > 0) {
                                                var operationId = 36;
                                                //var totalHoldDocuments = 0;
                                                var insertFOPerformanceTrack = "INSERT INTO " + dbTableName.iklantFoHoldImageTrack + " (`client_id`,`operation_id`,`office_id`,`field_officer_id`,`data_entry_by`,deo_remarks,`total_hold_documents`,`hold_documents_type`,hold_type,`created_date`) " +
                                                    " VALUES (" + clientId + "," + operationId + "," + results[0].office_id + "," + results[0].created_by + "," + userId + ",'" + rejectedDocsRemarks + "'," + rejectedDocs.length + ",'" + rejectedDocs + "',1,NOW() + INTERVAL 5 HOUR + INTERVAL 30 MINUTE );";

                                                console.log("insertFOPerformanceTrack : " + insertFOPerformanceTrack);
                                                if (clientConnect1 != null) {
                                                    clientConnect1.query(insertFOPerformanceTrack, function selectCb(error, insertResults, fields) {
                                                        connectionDataSource.releaseConnectionPool(clientConnect1);
                                                        if (error) {
                                                            clientConnect1.rollback(function () {
                                                                customlog.error("Failure in insert FO Track : " + error);
                                                                //callback("Failure");
                                                            });
                                                        } else {
                                                            clientConnect1.commit(function (err) {
                                                                if (err) {
                                                                    clientConnect1.rollback(function () {
                                                                        customlog.error(err);
                                                                    });
                                                                }
                                                                //callback("Success");
                                                            });
                                                        }
                                                    });
                                                } else {
                                                    //callback("Failure");
                                                }
                                            } else {
                                                connectionDataSource.releaseConnectionPool(clientConnect1);
                                                callback("Failure because of GroupId results not available : " + groupId);
                                            }
                                        }
                                    });
                                }
                            });
                        });
                    }
                    var clientsPendingToVerificationQUery = "SELECT pc.client_id,pc.status_id  "+
                                                            "FROM iklant_prospect_client pc "+
                                                            "WHERE pc.`group_id` = "+groupId+" AND pc.`status_id` IN (" + constantsObj.getNewGroup() + ", " + constantsObj.getKYCVerificationStatusId() + ") " ;
                    console.log(" clientsPendingToVerificationQUery : " + clientsPendingToVerificationQUery);
                    clientConnect.query(clientsPendingToVerificationQUery, function selectCb(err, results, fields) {
                        customlog.info(results.length);
                        if (err) {
                            connectionDataSource.releaseConnectionPool(clientConnect);
                            customlog.error(err);
                            callback("error");
                        }
                        else if (results != null && results.length > 0) {

                            for (var i in results) {
                                var fieldName = results[i];
                                console.log(fieldName.status_id);
                                console.log(fieldName.status_id == constantsObj.getNewGroup());
                                if(fieldName.status_id == constantsObj.getNewGroup()){
                                    newGroupFlag = true;
                                }else{
                                    kycVerificationGroupFlag = true;
                                }
                            }

                            customlog.info(" newGroupFlag : " + newGroupFlag);
                            customlog.info(" kycVerificationGroupFlag : " + kycVerificationGroupFlag);

                            if((newGroupFlag & kycVerificationGroupFlag) | kycVerificationGroupFlag){
                                connectionDataSource.releaseConnectionPool(clientConnect);
                                callback("ClientUpdatedSuccesfully");
                            }
                            else if(newGroupFlag){

                                var updateGroupStatusFlagForNeedImageClarity = "update iklant_prospect_group set needed_image_clarity = 1 where group_id = "+groupId+" ";
                                customlog.info("updateGroupStatusFlagForNeedImageClarity  : " + updateGroupStatusFlagForNeedImageClarity );
                                clientConnect.query(updateGroupStatusFlagForNeedImageClarity,function postCreate(err) {
                                    if (!err) {
                                        connectionDataSource.releaseConnectionPool(clientConnect);
                                        callback("groupUpdatedSuccesfullyforneedImageClarity");
                                    } else {
                                        clientConnect.rollback(function (err) {
                                            customlog.error(err);
                                            connectionDataSource.releaseConnectionPool(clientConnect);
                                            clientConnect = null;
                                            callback("error");
                                        });
                                    }
                                });
                            }
                        }else{
                            var updateGroupStatusFlag = "update iklant_prospect_group set status_id = "+ constantsObj.getKYCUploaded() +",needed_image_clarity = 0,updated_date = NOW() + INTERVAL 5 HOUR + INTERVAL 30 MINUTE  where group_id = "+groupId+" ";
                            customlog.info("updateGroupStatusFlag : " + updateGroupStatusFlag);
                            clientConnect.query(updateGroupStatusFlag,function postCreate(err) {
                                if (!err) {
                                    self.updateBODashboardTable(groupId);
                                    connectionDataSource.releaseConnectionPool(clientConnect);
                                    callback("groupUpdatedSuccessfully");
                                } else {
                                    clientConnect.rollback(function (err) {
                                        customlog.error(err);
                                        connectionDataSource.releaseConnectionPool(clientConnect);
                                        clientConnect = null;
                                        callback("error");
                                    });
                                }
                            });
                        }
                    });
                } else {
                    clientConnect.rollback(function(err){
                        customlog.error(err);
                        connectionDataSource.releaseConnectionPool(clientConnect);
                        clientConnect = null;
                        callback();
                    });
                }
            });
        });

    },

    getResolvedKYCDocumentsDataModel : function(clientId,callback){

        console.log("getResolvedKYCDocumentsDataModel");

        var self = this;
        var constantsObj = this.constants;
        var clientKYCDocumentsForVerification = {};
        var clientId,clientName,groupId,deoRemarks;
        var docTypeIdArray = new Array();
        var docTypeNameArray = new Array();
        var base64ImageArray = new Array();
        var clientDocIdArray = new Array();
        var neededImageClarityDocs = new Array();
        var clientDocIdArray = new Array();

        //var clientDocIdsQUery = " select needed_image_clarity_docs from iklant_prospect_client where client_id= " + clientId + "";
        var clientDocIdsQUery = " SELECT ho.hold_documents_type AS needed_image_clarity_docs,IFNULL(pc.remarks_for_need_more_information,'Need image clarity') AS deo_remarks FROM `iklant_fo_hold_image_track` ho "+
                                "INNER JOIN  `iklant_prospect_client` pc ON pc.`client_id` =  ho.`client_id` "+
                                "WHERE ho.client_id = " + clientId + " AND ho.hold_type = 1 "+
                                "ORDER BY ho.`id` DESC LIMIT 1 ";

        console.log("clientDocIdsQUery : "+ clientDocIdsQUery);
        connectionDataSource.getConnection(function (clientConnect) {
            clientConnect.query(clientDocIdsQUery, function selectCb(err, results, fields) {
                console.log(results.length);
                if (err) {
                    connectionDataSource.releaseConnectionPool(clientConnect);
                    customlog.error(err);
                }
                else if (results != null && results.length > 0) {
                    var fieldName = results[0];
                    clientDocIdArray = fieldName.needed_image_clarity_docs.split(",");
                    //dont change this index zero
                    neededImageClarityDocs[0] = fieldName.needed_image_clarity_docs;
                    clientDocIdArray.push(3);
                    deoRemarks = fieldName.deo_remarks;
                    var kycDocumentsForVerificationQuery = "SELECT cd.Captured_image, " +
                        "CASE WHEN sdt.`sub_doc_name` IS NULL THEN  dt.doc_name ELSE CONCAT(dt.doc_name ,' - ',sdt.`sub_doc_name`) END AS doc_name, "+
                        "cd.client_doc_id,dt.doc_id AS kyc_id, "+
                        "IF(dt.doc_id=3,1,IF(dt.doc_id=6,2,IF(dt.doc_id=8,3,IF(dt.doc_id=7,4,IF(dt.doc_id=9,5,IF(dt.doc_id=12,6,7)))))) AS doc_id , "+
                        "pc.client_name ,pc.`client_id`,pg.`group_id`,pg.`center_name`,pc.`needed_image_clarity_docs` "+
                        "FROM iklant_client_doc cd "+
                        "LEFT JOIN iklant_doc_type dt ON dt.doc_id = cd.doc_type_id "+
                        "LEFT JOIN `iklant_subdoc_type` sdt ON sdt.`sub_doc_id` = cd.`sub_doc_id` "+
                        "INNER JOIN iklant_prospect_client pc ON pc.`client_id` = cd.`client_id` "+
                        "INNER JOIN iklant_prospect_group pg ON pg.group_id = pc.group_id "+
                        "WHERE cd.client_id="+clientId+" AND (cd.doc_type_id IN("+clientDocIdArray+") ) AND "+
                        "cd.loan_count =  pc.`loan_count` "+
                        "ORDER BY doc_id ";
                    console.log("fetch clients query for KYC Re-Verification : "+ kycDocumentsForVerificationQuery);
                    clientConnect.query(kycDocumentsForVerificationQuery, function selectCb(err, results, fields) {
                        console.log(results.length);
                        if (err) {
                            connectionDataSource.releaseConnectionPool(clientConnect);
                            customlog.error(err);
                        }
                        else if (results != null && results.length > 0) {
                            connectionDataSource.releaseConnectionPool(clientConnect);
                            for (var i in results) {
                                var fieldName = results[i];
                                var imageLocation = fieldName.Captured_image;
                                try {
                                    var bitmap = fs.readFileSync(imageLocation);
                                    docTypeNameArray[i] = fieldName.doc_name;
                                    docTypeIdArray[i] = fieldName.kyc_id;
                                    clientDocIdArray[i] = fieldName.client_doc_id;
                                    base64ImageArray[i] = "data:image\/png;base64," + new Buffer(bitmap).toString('base64');
                                    clientId = fieldName.client_id;
                                    clientName = fieldName.client_name;
                                    groupId = fieldName.group_id;

                                } catch (exc) {
                                    customlog.error("Exception in Doc retrival " + exc);
                                    if (exc) {
                                        status = 'failure';
                                    }
                                }
                            }
                            clientKYCDocumentsForVerification.docNameList = docTypeNameArray;
                            clientKYCDocumentsForVerification.docIdList = docTypeIdArray;
                            clientKYCDocumentsForVerification.docImageList = base64ImageArray;
                            clientKYCDocumentsForVerification.clientDocIdList = clientDocIdArray;
                            clientKYCDocumentsForVerification.clientId = clientId;
                            clientKYCDocumentsForVerification.clientName = clientName;
                            clientKYCDocumentsForVerification.groupId = groupId;
                            clientKYCDocumentsForVerification.neededImageClarityDocs = neededImageClarityDocs;
                            clientKYCDocumentsForVerification.deoRemarks = deoRemarks;
                            callback(clientKYCDocumentsForVerification);
                        }else{
                            connectionDataSource.releaseConnectionPool(clientConnect);
                            clientKYCDocumentsForVerification.docNameList = docTypeNameArray;
                            clientKYCDocumentsForVerification.docIdList = docTypeIdArray;
                            clientKYCDocumentsForVerification.docImageList = base64ImageArray;
                            clientKYCDocumentsForVerification.clientId = clientId;
                            clientKYCDocumentsForVerification.clientName = clientName;
                            clientKYCDocumentsForVerification.groupId = groupId;
                            clientKYCDocumentsForVerification.neededImageClarityDocs = neededImageClarityDocs;
                            clientKYCDocumentsForVerification.deoRemarks = deoRemarks;
                            callback(clientKYCDocumentsForVerification);
                        }
                     });
                }else{
                    connectionDataSource.releaseConnectionPool(clientConnect);
                    clientKYCDocumentsForVerification.docNameList = docTypeNameArray;
                    clientKYCDocumentsForVerification.docIdList = docTypeIdArray;
                    clientKYCDocumentsForVerification.docImageList = base64ImageArray;
                    clientKYCDocumentsForVerification.clientId = clientId;
                    clientKYCDocumentsForVerification.clientName = clientName;
                    clientKYCDocumentsForVerification.groupId = groupId;
                    clientKYCDocumentsForVerification.neededImageClarityDocs = neededImageClarityDocs;
                    clientKYCDocumentsForVerification.deoRemarks = deoRemarks;
                    callback(clientKYCDocumentsForVerification);
                }
            });
        });

    },


    groupCountDashBoardDataModel : function(officeId,roleId,callback) {

        var self = this;
        var constantsObj = this.constants;
        var groupCountDashBoardForVerification = {};

        var retrieveStatusId = roleId != constantsObj.getBMroleId() ? constantsObj.getKYCVerificationStatusId() : constantsObj.getKYCUploaded() ;
        var retrieveOfficeId = roleId != constantsObj.getBMroleId() ? -1 : officeId ;

        var officeIdArray = new Array();
        var officeNameArray = new Array();
        var freshGroupCountArray = new Array();
        var recapturedGroupsCountArray = new Array();
        var rejectedByDEOCountArray = new Array();
        var inFOQueueGroupCountArray = new Array();

        var groupCountDashBoardForVerificationQuery = "SELECT pg.`office_id`,io.office_name, "+
            " IFNULL(fg.fresh_groups_count,0)  AS fresh_groups, "+
            "IFNULL(re_grp.recaptured_group,0) AS recaptured_groups, "+
            "IFNULL(rej_by_deo.rejected_by_deo_groups_count,0) AS rejected_by_deo, "+
            "IFNULL(fo_queue.in_fo_queue_count,0) AS in_fo_queue_to_recapture "+

            "FROM `iklant_prospect_group` pg "+
            "INNER JOIN `iklant_office` io ON io.`office_id` = pg.`office_id` "+
            "LEFT JOIN "+

             "(SELECT pg.`office_id`,COUNT(*)  AS fresh_groups_count "+
             "FROM `iklant_prospect_group` pg "+
             "WHERE pg.status_id = "+constantsObj.getKYCVerificationStatusId()+" AND  pg.`needed_image_clarity` = 0 "+
             "GROUP BY pg.`office_id`) fg ON fg.office_id = io.`office_id` "+

            "LEFT JOIN "+
            "(SELECT pg.`office_id`,COUNT(*)  AS recaptured_group "+
            "FROM `iklant_prospect_group` pg "+
            "WHERE pg.status_id IN( "+retrieveStatusId+") AND  pg.`needed_image_clarity` =  -1 "+
            "GROUP BY pg.`office_id`) re_grp ON re_grp.office_id = io.`office_id` "+

            "LEFT JOIN "+

            "(SELECT pg.`office_id`,COUNT(*) AS rejected_by_deo_groups_count "+
            "FROM `iklant_prospect_group` pg "+
            "LEFT JOIN  ( "+
            "SELECT COUNT(*) AS client_count,pc.group_id "+
             "FROM iklant_prospect_client  pc "+
             "WHERE pc.`status_id` = "+constantsObj.getKYCVerificationStatusId()+" "+
            "GROUP BY pc.`group_id`) co ON co.group_id = pg.`group_id` "+
            "WHERE pg.status_id IN ("+ constantsObj.getKYCUploaded()+") AND  pg.`needed_image_clarity` =  1 AND co.client_count > 0 "+
            "GROUP BY pg.`office_id`) rej_by_deo ON rej_by_deo.office_id = io.`office_id` "+

            "LEFT JOIN "+

            "(SELECT pg.`office_id`,COUNT(*) AS in_fo_queue_count "+
            "FROM `iklant_prospect_group` pg "+
            "LEFT JOIN  ( "+
            "SELECT COUNT(*) AS client_count,pc.group_id "+
            "FROM iklant_prospect_client  pc "+
            "WHERE pc.`status_id` = "+constantsObj.getNewGroup()+" "+
            "GROUP BY pc.`group_id`) co ON co.group_id = pg.`group_id` "+
            "WHERE pg.status_id IN ("+ retrieveStatusId +") AND  pg.`needed_image_clarity` =  1 AND co.client_count > 0 "+
            "GROUP BY pg.`office_id`) fo_queue ON fo_queue.office_id = io.`office_id` "+
            "WHERE io.office_id = "+retrieveOfficeId+" OR "+retrieveOfficeId+" = -1 "+
            "GROUP BY io.`office_id` ";

        console.log("groupCountDashBoardForVerificationQuery : "  + groupCountDashBoardForVerificationQuery);

        connectionDataSource.getConnection(function (clientConnect) {
            clientConnect.query(groupCountDashBoardForVerificationQuery, function selectCb(err, results, fields) {
                console.log(results.length);
                if (err) {
                    connectionDataSource.releaseConnectionPool(clientConnect);
                    customlog.error(err);
                }
                else if (results != null && results.length > 0) {
                    connectionDataSource.releaseConnectionPool(clientConnect);
                    for (var i in results) {
                        var fieldName   = results[i];
                        officeIdArray[i]    = fieldName.office_id;
                        officeNameArray[i]  = fieldName.office_name;
                        freshGroupCountArray[i] = fieldName.fresh_groups;
                        recapturedGroupsCountArray[i] = fieldName.recaptured_groups;
                        rejectedByDEOCountArray[i] = fieldName.rejected_by_deo;
                        inFOQueueGroupCountArray[i] = fieldName.in_fo_queue_to_recapture;

                    }
                    groupCountDashBoardForVerification.officeIdList = officeIdArray;
                    groupCountDashBoardForVerification.officeNameList = officeNameArray;
                    groupCountDashBoardForVerification.freshGroupCountList = freshGroupCountArray;
                    groupCountDashBoardForVerification.recapturedGroupsCountList = recapturedGroupsCountArray;
                    groupCountDashBoardForVerification.rejectedByDEOCountList = rejectedByDEOCountArray;
                    groupCountDashBoardForVerification.inFOQueueGroupCountList = inFOQueueGroupCountArray;
                    callback(groupCountDashBoardForVerification);
                }else{
                    connectionDataSource.releaseConnectionPool(clientConnect);
                    groupCountDashBoardForVerification.officeIdList = officeIdArray;
                    groupCountDashBoardForVerification.officeNameList = officeNameArray;
                    groupCountDashBoardForVerification.freshGroupCountList = freshGroupCountArray;
                    groupCountDashBoardForVerification.recapturedGroupsCountList = recapturedGroupsCountArray;
                    groupCountDashBoardForVerification.rejectedByDEOCountList = rejectedByDEOCountArray;
                    groupCountDashBoardForVerification.inFOQueueGroupCountList = inFOQueueGroupCountArray;
                    callback(groupCountDashBoardForVerification);
                }
            });
        });

    },
    updateBODashboardTable : function(groupId) {

        var constantsObj = this.constants;
        var retrieveGroupCurrentStatusQuery = "SELECT  CURDATE() AS date_label,pg.`group_id`,pg.`status_id`, "+
            "IFNULL(tot.total_client,0) AS total_clients, "+
            "IFNULL( hoc.holded_clients,0) AS holded_clients, "+
            "IFNULL(rej.rejected_clients,0) AS rejected_clients, "+
            "CASE  "+
            "	WHEN pg.status_id = 3 AND pg.`needed_image_clarity` = 0  AND IFNULL(fresh_grp.client_count,0) = 0  THEN 1 "+
            "	WHEN pg.status_id = 3 AND pg.`needed_image_clarity` = 0 THEN 2 "+
            "	WHEN pg.status_id = 4   THEN 2 "+
            "	WHEN pg.status_id = 23 THEN 2 "+
            "	WHEN pg.status_id = 24 THEN 2 "+
            "	WHEN pg.status_id = 19 THEN 2 "+
            "	WHEN pg.status_id = 3 AND pg.`needed_image_clarity` = 1 THEN 3 "+
            "	WHEN pg.status_id = 5 THEN 4 "+
            "	ELSE 4 "+
            "END AS report_status_id, "+
            "CASE  "+
            "	WHEN pg.status_id = 3 AND pg.`needed_image_clarity` = 1 THEN 1 "+
            "	ELSE 0 "+
            "END AS hold_status	 "+
            "FROM iklant_prospect_group pg "+
            "LEFT JOIN "+
            "(SELECT pc.`group_id`,COUNT(*) AS total_client FROM `iklant_prospect_client` pc "+
            "INNER JOIN  iklant_prospect_group pg ON pg.`group_id` = pc.`group_id` "+
            "WHERE   pc.group_id = "+groupId+"  AND pc.`status_id` NOT IN (22,26) "+
            "GROUP BY pc.`group_id`) tot ON tot.group_id = pg.`group_id` "+
            "LEFT JOIN "+
            "(SELECT pc.group_id,COUNT(*) AS rejected_clients  "+
            "FROM iklant_prospect_client pc "+
            "WHERE pc.group_id = "+groupId+" AND pc.`status_id` IN (15,25,29) "+
            "GROUP BY pc.`group_id`)rej ON rej.group_id = pg.`group_id` "+
            "LEFT JOIN "+
            "(SELECT pc.group_id,COUNT(*) AS holded_clients "+
            "FROM iklant_prospect_client pc "+
            "WHERE pc.group_id = "+groupId+" AND pc.`status_id` IN (1,27,28) "+
            "GROUP BY pc.`group_id`) hoc ON hoc.group_id = pg.`group_id` "+
            "LEFT JOIN "+
            "( SELECT  pc.group_id, IFNULL(COUNT(*),0) AS client_count FROM `iklant_prospect_client` pc  "+
            "WHERE pc.group_id = "+groupId+"  AND pc.`status_id` IN (4,23,24,19,1,27,5,28,29) GROUP BY pc.group_id) fresh_grp  ON fresh_grp.group_id = "+ "pg.`group_id` "+
            "WHERE pg.group_id = "+groupId+" "+
            "GROUP BY  pg.group_id ";
        customlog.info("retrieveGroupCurrentStatusQuery : " + retrieveGroupCurrentStatusQuery)
        connectionDataSource.getConnection(function (clientConnect) {
            clientConnect.query(retrieveGroupCurrentStatusQuery, function (err, results, fields) {
                if (err) {
                    customlog.error(err);
                    connectionDataSource.releaseConnectionPool(clientConnect);
                    //callback("failure");
                } else {
                    if (results.length > 0) {
                        var statusUpdateQuery;
                        if(results[0].report_status_id != 1) {
                            statusUpdateQuery = "UPDATE `iklant_bo_group_details` bo SET  bo.`group_status_id` = " + results[0].status_id + "   , bo.`hold_status` = " + results[0].hold_status + " " +
                                ",bo.`total_client_count`=" + results[0].total_clients + " ,bo.`hold_client_count`=" + results[0].holded_clients + ",bo.`rejected_client_count`=" + results[0].rejected_clients + " ,bo.`report_status_id`= " + results[0].report_status_id + ",bo.`updated_date` = NOW() + INTERVAL 5 HOUR + INTERVAL 30 MINUTE " +
                                "WHERE bo.`date` = CURDATE() AND bo.`group_id` = " + groupId + " ";
                        }else {
                            statusUpdateQuery = "INSERT INTO `iklant_bo_group_details`(`date`,`group_id`,`group_status_id`, `hold_status`,`total_client_count`,`hold_client_count`, `rejected_client_count`, `report_status_id`, `created_date`) "+
                                "VALUES (CURDATE(),"+groupId+","+results[0].status_id +","+results[0].hold_status +","+results[0].total_clients +","+results[0].holded_clients +","+results[0].rejected_clients +","+results[0].report_status_id +",NOW() + INTERVAL 5 HOUR + INTERVAL 30 MINUTE) ; ";
                        }
                        customlog.info(" statusUpdateQuery  : " + statusUpdateQuery);
                        clientConnect.query(statusUpdateQuery, function selectCb(err, results, fields) {
                            if (err) {
                                customlog.error("Insert statusUpdateQuery for BO dashboard" + err);
                                connectionDataSource.releaseConnectionPool(clientConnect);
                            } else {
                                customlog.info("Insert statusUpdateQuery for BO dashboard success");
                                connectionDataSource.releaseConnectionPool(clientConnect);
                            }
                        });
                    }
                }
            });
        });
    }

};
