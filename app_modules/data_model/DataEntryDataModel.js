module.exports = dataEntryDataModel;

var path = require('path');
var rootPath = path.dirname(process.mainModule.filename);
var lookupEntityObj;

var dbTableName = require(path.join(rootPath,"properties.json"));
var fs = require('fs');

var connectionDataSource = require(path.join(rootPath,"app_modules/data_model/DataSource"));
var customlog = require(path.join(rootPath,"logger/loggerConfig.js"))('DataEntryDataModel.js');
var commonDTO = path.join(rootPath,"app_modules/dto/common");
var dataEntryDTO = path.join(rootPath,"app_modules/dto/data_entry");
var dateUtils = require(path.join(rootPath,"app_modules/utils/DateUtils"));

//Business Layer
function dataEntryDataModel(constants) {
    customlog.debug("Inside Data Entry Datamodel Data Access Layer");
    this.constants = constants;
}

dataEntryDataModel.prototype = {
    KYC_Download: function (group_id, memberId, docType,access_type_id,localMachineIp, callback) {
        var self=this;
        var status = 'success';
        var constantsObj = this.constants;
        var memberIdArray = new Array();
        var memberNameArray = new Array();
        var docTypeIdArray = new Array();
        var docTypeNameArray = new Array();
        var allDocTypeIdArray = new Array();
        var allDocTypeNameArray = new Array();
        var base64ImageArray = new Array();
        var fs = require("fs");
        base64ImageArray[0] = 'Empty';
        customlog.info("access_type_id"+ access_type_id);
        connectionDataSource.getConnection(function (clientConnect) {
            if (typeof memberId != 'undefined' & typeof docType != 'undefined') {
                if (docType == constantsObj.getMOMDocId() || docType == constantsObj.getBankPassBookDocId()) {
                    var imageQuery = "SELECT image_location FROM "+dbTableName.iklantGroupDoc+" WHERE " +
                        "group_id=" + group_id + " AND doc_type_id=" + docType + "";
                    clientConnect.query(imageQuery, function selectCb(err, results, fields) {
                        if (err) {
                            connectionDataSource.releaseConnectionPool(clientConnect);
                            customlog.error(err);
                        } else {
                            for (var i in results) {
                                var fieldName = results[i];
                                if(access_type_id == constantsObj.getAccessTypeId()){
                                    //http://myserver.com/happyweb/images/User.pdf
                                    //base64ImageArray[i] = ("file:///C:/"+fieldName.Captured_image).replace(" ","");
                                    base64ImageArray[i] = ("http://"+localMachineIp+"/"+fieldName.Captured_image).replace(" ","%20");
                                    customlog.info(base64ImageArray[i]);
                                }else{
                                    var imageLocation = fieldName.image_location;
                                    var bitmap = fs.readFileSync(imageLocation);
                                    base64ImageArray[i] = "data:image\/png;base64," + new Buffer(bitmap).toString('base64');
                                }
                                customlog.info("Group Document Image i=" + i);
                            }
                        }
                    });

                }
                else {
                    //var imageQuery = "SELECT cd.Captured_image,dt.doc_name,IF(dt.doc_id=3,1,IF(dt.doc_id=6,2,IF(dt.doc_id=8,3,IF(dt.doc_id=7,4,IF(dt.doc_id=9,5,IF(dt.doc_id=12,6,7)))))) AS doc_id FROM "+dbTableName.iklantClientDoc+" cd " +
                     //   "LEFT JOIN iklant_doc_type dt ON dt.doc_id = cd.doc_type_id WHERE " +
                     //   "client_id=" + memberId + " AND (doc_type_id = " + docType + " OR " + docType + " = -1 ) AND cd.loan_count = (SELECT loan_count FROM `iklant_prospect_client` WHERE client_id = " + memberId + ") ORDER BY doc_id";

                    var imageQuery = "SELECT cd.Captured_image, " +
                        "CASE WHEN sdt.`sub_doc_name` IS NULL THEN  dt.doc_name ELSE CONCAT(dt.doc_name ,' - ',sdt.`sub_doc_name`) END AS doc_name, "+
                        "cd.client_doc_id,dt.doc_id AS kyc_id, "+
                        "IF(dt.doc_id=3,1,IF(dt.doc_id=6,2,IF(dt.doc_id=8,3,IF(dt.doc_id=7,4,IF(dt.doc_id=9,5,IF(dt.doc_id=12,6,7)))))) AS doc_id , "+
                        "pc.client_name ,pc.`client_id`,pg.`group_id`,pg.`center_name`,pc.`needed_image_clarity_docs` "+
                        "FROM iklant_client_doc cd "+
                        "LEFT JOIN iklant_doc_type dt ON dt.doc_id = cd.doc_type_id "+
                        "LEFT JOIN `iklant_subdoc_type` sdt ON sdt.`sub_doc_id` = cd.`sub_doc_id` "+
                        "INNER JOIN iklant_prospect_client pc ON pc.`client_id` = cd.`client_id` "+
                        "INNER JOIN iklant_prospect_group pg ON pg.group_id = pc.group_id "+
                        "WHERE cd.client_id="+memberId+" AND (cd.doc_type_id = "+docType+" OR "+docType+" = -1 ) AND "+
                        "cd.loan_count =  pc.`loan_count` "+
                        "ORDER BY doc_id ";


                    clientConnect.query(imageQuery, function selectCb(err, results, fields) {
                        if (err) {
                            connectionDataSource.releaseConnectionPool(clientConnect);
                            customlog.error(err);
                        } else if(results != null && results.length > 0){
                            for (var i in results) {
                                var fieldName = results[i];

                                if(access_type_id == constantsObj.getAccessTypeId()){
                                    docTypeNameArray[i] = fieldName.doc_name;
                                    docTypeIdArray[i] = fieldName.doc_id;
                                    //base64ImageArray[i] = ("file:///C:/"+fieldName.Captured_image).replace(" ","");
                                    base64ImageArray[i] = ("http://"+localMachineIp+"/"+fieldName.Captured_image).replace(" ","%20");
                                }else{
                                    var imageLocation = fieldName.Captured_image;
                                    console.log("Location :"+imageLocation);
                                    try {
                                        customlog.info(imageLocation);
                                        var bitmap = fs.readFileSync(imageLocation);
                                        docTypeNameArray[i] = fieldName.doc_name;
                                        docTypeIdArray[i] = fieldName.doc_id;
                                        base64ImageArray[i] = "data:image\/png;base64," + new Buffer(bitmap).toString('base64');
                                    }catch(exc){
                                        customlog.error("Exception in Doc retrival "+exc);
                                        if(exc){
                                            status = 'failure';
                                        }
                                    }
                                }
                            }
                        }else{
                            status = 'failure';
                        }
                    });
                }
            }


            var memberDetail = "SELECT client_id,client_name FROM "+dbTableName.iklantProspectClient+" WHERE group_id=" + group_id + " AND is_overdue = 0 AND status_id IN(" + constantsObj.getKYCUploaded() + "," + constantsObj.getKYCCompleted() + "," + constantsObj.getNeedInformation() + ")";
            clientConnect.query(memberDetail,
                function selectCb(err, results, fields) {
                    if (err) {
                        connectionDataSource.releaseConnectionPool(clientConnect);
                        customlog.error(err);
                    } else {
                        for (var i in results) {
                            var fieldName = results[i];
                            memberIdArray[i] = fieldName.client_id;
                            memberNameArray[i] = fieldName.client_name;
                            customlog.info("Group Name=" + memberNameArray[i]);
                        }
                    }
                });

            var docTypequery = "SELECT doc_id,doc_name FROM "+dbTableName.iklantDocType+"  where doc_entity_id=" + constantsObj.getClientDocsEntity() + "";
            clientConnect.query(docTypequery,
                function selectCb(err, results, fields) {
                    connectionDataSource.releaseConnectionPool(clientConnect);
                    if (err) {
                        customlog.error(err);
                    } else {
                        for (var i in results) {
                            var fieldName = results[i];
                            allDocTypeIdArray[i] = fieldName.doc_id;
                            allDocTypeNameArray[i] = fieldName.doc_name;
                        }
                    }
                    callback(status,base64ImageArray, group_id, memberId, docType, memberIdArray, memberNameArray, docTypeIdArray, docTypeNameArray,allDocTypeIdArray,allDocTypeNameArray);
                });
        });
    },

    KycDocumentsDataModel : function(clientId,callback){
        var self = this;
        var constantsObj = this.constants;
        var clientDetailsForRMApproval = {};
        var clientId,clientName,groupName,centerName,remarksByDEO,groupId;
        var docTypeIdArray = new Array();
        var docTypeNameArray = new Array();
        var base64ImageArray = new Array();

        var detailsForRMAUthorizationQuery = "SELECT cd.Captured_image, " +
            "CASE WHEN sdt.`sub_doc_name` IS NULL THEN  dt.doc_name ELSE CONCAT(dt.doc_name ,' - ',sdt.`sub_doc_name`) END AS doc_name, "+
            "cd.client_doc_id,dt.doc_id AS kyc_id, "+
            "IF(dt.doc_id=3,1,IF(dt.doc_id=6,2,IF(dt.doc_id=8,3,IF(dt.doc_id=7,4,IF(dt.doc_id=9,5,IF(dt.doc_id=12,6,7)))))) AS doc_id , "+
            "pc.client_name ,pc.`client_id`,pg.`group_id`,pg.`center_name`,pc.`needed_image_clarity_docs`,pc.remarks_for_rm_approval "+
            "FROM iklant_client_doc cd "+
            "LEFT JOIN iklant_doc_type dt ON dt.doc_id = cd.doc_type_id "+
            "LEFT JOIN `iklant_subdoc_type` sdt ON sdt.`sub_doc_id` = cd.`sub_doc_id` "+
            "INNER JOIN iklant_prospect_client pc ON pc.`client_id` = cd.`client_id` "+
            "INNER JOIN iklant_prospect_group pg ON pg.group_id = pc.group_id "+
            "WHERE cd.client_id="+clientId+" AND (cd.doc_type_id = -1 OR -1 = -1  ) AND "+
            "cd.loan_count =  pc.`loan_count` "+
            "ORDER BY doc_id ";

        customlog.info("fetch query for RM Approval : "+ detailsForRMAUthorizationQuery);
        connectionDataSource.getConnection(function (clientConnect) {
            clientConnect.query(detailsForRMAUthorizationQuery, function selectCb(err, results, fields) {
                if (err) {
                    connectionDataSource.releaseConnectionPool(clientConnect);
                    customlog.error(err);
                } else if (results != null && results.length > 0) {
                    connectionDataSource.releaseConnectionPool(clientConnect);
                    for (var i in results) {
                        var fieldName = results[i];
                        var imageLocation = fieldName.Captured_image;
                        console.log("Location :" + imageLocation);
                        try {
                            customlog.info(imageLocation);
                            var bitmap = fs.readFileSync(imageLocation);
                            docTypeNameArray[i] = fieldName.doc_name;
                            docTypeIdArray[i] = fieldName.doc_id;
                            base64ImageArray[i] = "data:image\/png;base64," + new Buffer(bitmap).toString('base64');
                            clientId = fieldName.client_id;
                            clientName = fieldName.client_name;
                            groupName = fieldName.group_name;
                            centerName = fieldName.center_name;
                            remarksByDEO = fieldName.remarks_for_rm_approval;
                            groupId = fieldName.group_id;
                        } catch (exc) {
                            customlog.error("Exception in Doc retrival " + exc);
                            if (exc) {
                                status = 'failure';
                            }
                        }
                    }
                    clientDetailsForRMApproval.docNameList = docTypeNameArray;
                    clientDetailsForRMApproval.docIdList = docTypeIdArray;
                    clientDetailsForRMApproval.docImageList = base64ImageArray;
                    clientDetailsForRMApproval.clientId = clientId;
                    clientDetailsForRMApproval.groupId = groupId;
                    clientDetailsForRMApproval.clientName = clientName;
                    clientDetailsForRMApproval.groupName = groupName;
                    clientDetailsForRMApproval.centerName = centerName;
                    clientDetailsForRMApproval.remarksByDEO = remarksByDEO;
                    callback(clientDetailsForRMApproval);
                }
            });
        });

    },


    updateRMApprovalStatusDataModel : function(clientId,statusId,commentsByRM,groupId,callback) {
        var self = this;
        var constantsObj = this.constants;
        var updateRMApprovalStatusForClient = "UPDATE  iklant_prospect_client SET status_id = "+statusId+" ,need_rm_approval= 0,comments_by_rm = '"+commentsByRM+"' WHERE client_id = "+clientId+ " ";
        customlog.info("updateRMApprovalStatusForClient : "+ updateRMApprovalStatusForClient);
        connectionDataSource.getConnection(function (clientConnect) {
            clientConnect.query(updateRMApprovalStatusForClient, function selectCb(err, results, fields) {
                if (!err) {

                    var updateTimeTakenToResolveHold = "UPDATE " + dbTableName.iklantFoHoldImageTrack +" SET  `hold_resolved_date` = NOW() + INTERVAL 5 HOUR + INTERVAL 30 MINUTE  WHERE `client_id`  =  " + clientId + " AND `hold_type` = 2  AND `hold_resolved_date` IS NULL  ";
                    clientConnect.query(updateTimeTakenToResolveHold, function selectCb(err, results, fields) {
                        if (!err) {
                            var retrieveClientCountQuery = " SELECT pc.group_id FROM iklant_prospect_client pc WHERE  pc.status_id IN ("+constantsObj.getNewGroup()+","+constantsObj.getKYCUploaded()+","+constantsObj.getKYCVerificationStatusId()+"," + constantsObj.getNeedRMApprovalStatusId() +") AND pc.group_id = "+groupId+" GROUP BY pc.group_id ";
                            console.log("retrieveClientCountQuery to update group status in RM Approval : " + retrieveClientCountQuery);
                            //connectionDataSource.releaseConnectionPool(clientConnect);
                            clientConnect.query(retrieveClientCountQuery, function selectCb(err, results, fields) {
                                if (err) {
                                    connectionDataSource.releaseConnectionPool(clientConnect);
                                    customlog.error(err);
                                    callback();
                                } else if (results != null && results.length > 0) {
                                    self.updateBODashboardTable(groupId);
                                    connectionDataSource.releaseConnectionPool(clientConnect);
                                    callback();
                                } else {
                                        var updateGroupStatusId = " update iklant_prospect_group set status_id = " + constantsObj.getKYCCompleted() + " where group_id = " + groupId + " ";
                                        clientConnect.query(updateGroupStatusId, function postCreate(err) {
                                            if (!err) {
                                                self.updateBODashboardTable(groupId);
                                                connectionDataSource.releaseConnectionPool(clientConnect);
                                                callback();
                                            }
                                            else {
                                                clientConnect.rollback(function (err) {
                                                    customlog.error(err);
                                                    connectionDataSource.releaseConnectionPool(clientConnect);
                                                    clientConnect = null;
                                                    callback();
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

    KYC_Updating: function (groupId, pageName, callback) {
        var self = this;
        var reqProspectGroup = require(commonDTO +"/prospectGroup");
        var reqProsClient = require(commonDTO +"/prospectClient");
        var lookupEntity = require(commonDTO +"/lookupEntity");
        var clientPersonal = require(commonDTO +"/prospectClientPersonal");
        var clientGuarantor = require(commonDTO +"/prospectClientGuarantor");
        var clientHouseDetail = require(commonDTO +"/prospectClientHouseDetail");
        var clientBankDetail = require(commonDTO +"/prospectClientBankDetail");
        var clientOtherMfiDetail = require(commonDTO +"/prospectClientOtherMfiDetail");
        var clientOtherDetail = require(commonDTO +"/prospectClientOtherDetail");
        var clientFamilyFetch = require(commonDTO +"/prospectClientFamilyFetch");

        globalGroupIdKYC = groupId;
        var lookupEntityObj = new lookupEntity();
        var constantsObj = this.constants;
        var prospectGroup = new reqProspectGroup();
        var clientNames = new Array();
        var clientId = new Array();
        var clientId_personal = new Array();
        var flag = 0;
        var clientNameID = 0;
        var prospectClientPersonalObject = new clientPersonal();
        var prospectClientGuarantorObject = new clientGuarantor();
        var prospectClientHouseDetailObject = new clientHouseDetail();
        var prospectClientBankDetailObject = new clientBankDetail();
        var prospectClientOtherMfiDetailObject = new clientOtherMfiDetail();
        var prospectClientOtherDetailObject = new clientOtherDetail();
        var prospectClientFamilyFetchObject = new clientFamilyFetch();
        var prospectClient = new reqProsClient();

        if (pageName == "KYC_Update" || pageName == "KYC_Update_New") {
            var status =constantsObj.getKYCUploaded();
                status+=",";
                status+=constantsObj.getKYCCompleted();
                /*status+=",";
                status+=constantsObj.getLeaderSubLeaderUpdatedStatus(); //FOR supporting old client details*/
        }else{
            var status = constantsObj.getKYCCompleted();
        }

        var fetchQuery = "SELECT pg.group_name,pc.client_id,IF(pc.client_last_name LIKE 'mln%',pc.client_name,CONCAT(pc.client_name,' ',pc.client_last_name)) as client_name,pg.center_name,pcd.is_data_verified " +
            "FROM "+dbTableName.iklantProspectClient+" pc " +
            "INNER JOIN "+dbTableName.iklantProspectGroup+" pg ON pg.group_id = pc.group_id " +
            "LEFT JOIN "+dbTableName.iklantProspectClientDataEntryTracking+" pcd ON pcd.client_id = pc.client_id " +
            "WHERE pc.group_id =" + globalGroupIdKYC + " and pc.is_overdue = 0 " +
            "AND pc.status_id IN(" +status+") " ;
            //"AND pc.loan_count = pg.loan_count";
        customlog.info("fetch query in KYC updating : "+fetchQuery);
        connectionDataSource.getConnection(function (clientConnect) {
                clientConnect.query(fetchQuery,
                    function selectCb(err, results, fields) {
                        if (err) {
                            connectionDataSource.releaseConnectionPool(clientConnect);
                            customlog.error(err);
                        }
                        else {
                            if (results != "" | typeof(results != undefined)) {
                                for (var i in results) {
                                    clientNames[i] = results[i].client_name;
                                    clientId[i] = results[i].client_id;
                                }
                                //prospectGroup.clearAll();
                                //prospectGroup.setGroup_id(globalGroupIdKYC);
                                prospectGroup.setGroup_name(results[0].group_name);
                                prospectGroup.setCenter_name(results[0].center_name);
                            }
                        }
                    }
                );
                /////recently added
                var entityId = new Array();
                var lookupId = new Array();
                var lookupValue = new Array();
                //id//
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
                clientConnect.query(lookupValueFetchQuery,
                    function selectCb(err, results, fields) {
                        connectionDataSource.releaseConnectionPool(clientConnect);
                        if (err) {
                            customlog.error(err);
                            callback();
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
                                /*if(entityId==constantsObj.getRepaymentTrackRecordLookupEntity()){
                                 repaymentTrackRecord.push(lookupId);
                                 repaymentTrackRecordName.push(lookupValue);
                                 }*/
                                var businessCategoryEntityIdArray = dbTableName.businessCategoryEntityId.split(',');
                                for(var i=0;i<businessCategoryEntityIdArray.length;i++){
                                    if(businessCategoryEntityIdArray[i] == entityId) {
                                        businessCategory.push(lookupId);
                                        businessCategoryName.push(lookupValue);
                                        break;
                                    }
                                }
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
                            //lookupEntityObj.setRepaymentTrackRecord(repaymentTrackRecord);
                            //lookupEntityObj.setRepaymentTrackRecordName(repaymentTrackRecordName);
                            callback(groupId, prospectClientFamilyFetchObject, prospectClient, prospectGroup, clientId, clientNames, lookupEntityObj, clientNameID, prospectClientPersonalObject, prospectClientGuarantorObject, prospectClientHouseDetailObject, prospectClientBankDetailObject, prospectClientOtherMfiDetailObject, prospectClientOtherDetailObject, flag);
                        }
                    }
                );
            }
        );
    },

    KYC_UpdatingMember: function (clientNameID, callback) {
        //select query for retrieving all the kyc updated datas
        var self = this;
        var DB_DOB;
        var flag = 0;
        var constantsObj = this.constants;
        var reqProspectGroup = require(commonDTO +"/prospectGroup");
        var clientPersonal = require(commonDTO +"/prospectClientPersonal");
        var clientGuarantor = require(commonDTO +"/prospectClientGuarantor");
        var clientHouseDetail = require(commonDTO +"/prospectClientHouseDetail");
        var clientBankDetail = require(commonDTO +"/prospectClientBankDetail");
        var clientOtherMfiDetail = require(commonDTO +"/prospectClientOtherMfiDetail");
        var clientOtherDetail = require(commonDTO +"/prospectClientOtherDetail");
        var clientFamilyFetch = require(commonDTO +"/prospectClientFamilyFetch");
        var reqProsClient = require(commonDTO +"/prospectClient");
        var LookupEntity = require(commonDTO +"/lookupEntity");

        var prospectGroup = new reqProspectGroup();
        var prospectClientPersonalObject = new clientPersonal();
        var prospectClientGuarantorObject = new clientGuarantor();
        var prospectClientHouseDetailObject = new clientHouseDetail();
        var prospectClientBankDetailObject = new clientBankDetail();
        var prospectClientOtherMfiDetailObject = new clientOtherMfiDetail();
        var prospectClientOtherDetailObject = new clientOtherDetail();
        var prospectClientFamilyFetchObject = new clientFamilyFetch();
        var prospectClient = new reqProsClient();

        var F_memberName = new Array();
        var F_memberGender = new Array();
        var F_memberDOB = new Array();
        var F_memberRelationship = new Array();
        var F_memberEducation = new Array();
        var F_memberOccupation = new Array();
        var F_memberIncome = new Array();
        var F_memberOtherRelationshipName = new Array();

        var F_otherMfiName = new Array();
        var F_otherMfiAmount = new Array();
        var F_otherMfiOutstanding = new Array();

        var clientNameID = clientNameID;

        var groupId;

        var KYC_fetchQuery = "SELECT pcp.client_id as Mandatory,pcp.*,pcg.*,pcbd.*, " +
            "pc.client_name,pc.client_last_name,pc.family_monthly_income,pc.comments_by_rm,pc.remarks_for_need_more_information, pc.family_monthly_expense,pchd.*,pcomd.*,pcod.*,pg.* ," +
            "hold.`deo_remarks`,hold.`hold_documents_type` FROM "+dbTableName.iklantProspectClient+" pc " +
            "LEFT JOIN "+dbTableName.iklantProspectClientPersonal+" pcp ON pcp.client_id = pc.client_id " +
            "LEFT JOIN "+dbTableName.iklantProspectClientGuarantor+" pcg ON pcg.client_id = pcp.client_id " +
            "LEFT JOIN "+dbTableName.iklantprospectClientBankDetail+" pcbd ON pcbd.client_id = pcp.client_id " +
            "LEFT JOIN "+dbTableName.iklantProspectClientHouseDetail+" pchd ON pchd.client_id = pcp.client_id " +
            "LEFT JOIN "+dbTableName.iklantProspectClientOtherMfiDetail+" pcomd ON pcomd.client_id = pcp.client_id " +
            "LEFT JOIN "+dbTableName.iklantProspectClientOtherDetail+" pcod ON pcod.client_id = pcp.client_id " +
            "LEFT JOIN "+dbTableName.iklantProspectGroup+" pg ON pg.group_id = pc.group_id " +
            "LEFT JOIN (SELECT hi.id,hi.`client_id`,hi.`deo_remarks`,hi.`hold_documents_type` FROM "+dbTableName.iklantFoHoldImageTrack+" hi,"+
            ""+dbTableName.iklantProspectClient+" ikc WHERE ikc.`client_id` = hi.`client_id` AND hi.`hold_type`=3 AND hi.`operation_id`=19 AND hi.client_id = "+clientNameID+" ORDER BY hi.id DESC LIMIT 1 ) hold ON hold.`client_id`=pc.`client_id`"+
            "WHERE pc.client_id =" + clientNameID;

        console.log("KYC_fetchQuery : " + KYC_fetchQuery);
        connectionDataSource.getConnection(function (clientConnect) {
                clientConnect.query(KYC_fetchQuery,
                    function selectCb(err, results, fields) {
                        if (err) {
                            connectionDataSource.releaseConnectionPool(clientConnect);
                            customlog.error(err);
                        }
                        else {
                            //validation
                            groupId = results[0].group_id;
                            var mandatorylocal = results[0].Mandatory;
                            if (mandatorylocal == clientNameID) {
                                flag = 1; //for update

                                //groupName,center Name
                                prospectGroup.clearAll();
                                //personal details
                                prospectGroup.setGroup_name(results[0].group_name);
                                prospectGroup.setCenter_name(results[0].center_name);
                                prospectClientPersonalObject.clearAll();
                                prospectClientPersonalObject.setCommentsByRM(results[0].comments_by_rm);
                                prospectClientPersonalObject.setRemarks(results[0].remarks_for_need_more_information);
                                prospectClientPersonalObject.setRemarksByDV(results[0].deo_remarks);
                                prospectClientPersonalObject.setMembFirstName(results[0].client_name);
                                prospectClientPersonalObject.setMembLastName(results[0].client_last_name);
                                prospectClientPersonalObject.setDate_of_birth(dateUtils.formatDateForUI(results[0].date_of_birth));
                                prospectClientPersonalObject.setMobile_number(results[0].mobile_number);
                                prospectClientPersonalObject.setLandLine_number((results[0].landline_number)?results[0].landline_number:'');
                                prospectClientPersonalObject.setAddress(results[0].address);
                                prospectClientPersonalObject.setPincode(results[0].pincode);
                                prospectClientPersonalObject.setRation_card_number(results[0].ration_card_number);
                                prospectClientPersonalObject.setVoter_id(results[0].voter_id);
                                prospectClientPersonalObject.setGas_number(results[0].gas_number);
                                prospectClientPersonalObject.setAadhaar_number(results[0].aadhaar_number);
                                prospectClientPersonalObject.setIs_other_id(results[0].is_other_id);
                                prospectClientPersonalObject.setOther_id_name(results[0].other_id_name1);
                                prospectClientPersonalObject.setOther_id(results[0].other_id1);
                                prospectClientPersonalObject.setOther_id_name2((results[0].other_id_name2)?results[0].other_id_name2:'');
                                prospectClientPersonalObject.setOther_id2((results[0].other_id2)?results[0].other_id2:'');
                                prospectClientPersonalObject.setMarital_status(results[0].marital_status);
                                prospectClientPersonalObject.setReligion(results[0].religion);
                                prospectClientPersonalObject.setCaste(results[0].caste);
                                prospectClientPersonalObject.setEducational_details(results[0].educational_details);
                                prospectClientPersonalObject.setLoan_purpose(results[0].loan_purpose);
                                prospectClientPersonalObject.setBusinessCategoryId(results[0].business_category);
                                prospectClientPersonalObject.setGuardian_relationship(results[0].guardian_relationship);
                                prospectClientPersonalObject.setGuardian_name(results[0].guardian_name);
                                prospectClientPersonalObject.setGuardian_lastname(results[0].guardian_lastname);
                                prospectClientPersonalObject.setGuardian_dob(dateUtils.formatDateForUI(results[0].guardian_dob));
                                prospectClientPersonalObject.setGender(results[0].gender);
                                prospectClientPersonalObject.setNationality(results[0].nationality);
                                //guarantor details
                                prospectClientGuarantorObject.clearAll();
                                prospectClientGuarantorObject.setGuarantorName(results[0].guarantor_name);
                                prospectClientGuarantorObject.setGuarantorDob(dateUtils.formatDateForUI(results[0].guarantor_dob));
                                prospectClientGuarantorObject.setGuarantorRelationship(results[0].guarantor_relationship);
                                prospectClientGuarantorObject.setGuarantorAddress(results[0].guarantor_address);
                                prospectClientGuarantorObject.setGuarantorId(results[0].guarantor_id);
                                prospectClientGuarantorObject.setOtherGuarantorRelationshipName(results[0].other_guarantor_relationship_name);
                                if(results[0].other_guarantor_relationship_name == null){
                                    prospectClientGuarantorObject.setOtherGuarantorRelationshipName("");
                                }
                                //house details
                                prospectClientHouseDetailObject.clearAll();
                                prospectClientHouseDetailObject.setHouse_type(results[0].house_type);
                                prospectClientHouseDetailObject.setTime_period(results[0].time_period);
                                prospectClientHouseDetailObject.setHouse_sqft(results[0].house_sqft);
                                //prospectClientHouseDetailObject.setHousehold_details(results[0].household_details);
                                prospectClientHouseDetailObject.setVehicle_details(results[0].vehicle_details);
                                prospectClientHouseDetailObject.setHouse_ceiling_type(results[0].house_ceiling_type);
                                prospectClientHouseDetailObject.setHouse_wall_type(results[0].house_wall_type);
                                prospectClientHouseDetailObject.setHouse_flooring_detail(results[0].house_flooring_detail);
                                prospectClientHouseDetailObject.setHouse_room_detail(results[0].house_room_detail);
                                prospectClientHouseDetailObject.setHouse_toilet(results[0].house_toilet);
                                //bank details
                                prospectClientBankDetailObject.clearAll();
                                prospectClientBankDetailObject.setIs_bank_account(results[0].is_bank_account);
                                prospectClientBankDetailObject.setIs_Savings(results[0].is_savings);
                                //prospectClientBankDetailObject.setIs_Insurance_Lifetime(results[0].is_insurance_lifetime);
                                //prospectClientBankDetailObject.setIs_Insurance_Accidental(results[0].is_insurance_accidental);
                                //prospectClientBankDetailObject.setIs_Insurance_Medical(results[0].is_insurance_medical);
                                //other mfi loan details
                                prospectClientOtherMfiDetailObject.clearAll();
                                //prospectClientOtherMfiDetailObject.setIsLoanSecured(results[0].is_loan_secured);
                                prospectClientOtherMfiDetailObject.setOtherMfiName(results[0].other_mfi_name);
                                prospectClientOtherMfiDetailObject.setOtherMfiAmountSecured(results[0].other_mfi_amount_secured);
                                prospectClientOtherMfiDetailObject.setOtherMfiLoanOutstanding(results[0].other_mfi_loan_outstanding);
                                //other details
                                prospectClientOtherDetailObject.clearAll();
                                prospectClientOtherDetailObject.setIsDeclarationAcksign(results[0].is_declaration_acksign);
                                prospectClientOtherDetailObject.setIsPledgeAcksign(results[0].is_pledge_acksign);
                                prospectClientOtherDetailObject.setIsGuarantorAcksign(results[0].is_guarantor_acksign);
                                prospectClientOtherDetailObject.setIsMemberPhotocopyAttached(results[0].is_member_photocopy_attached);
                                prospectClientOtherDetailObject.setIsGuarantorPhotocopyAttached(results[0].is_guarantor_photocopy_attached);


                                //query to fetch added family members of client

                                var KYC_familyMemberDetailsFetch = "SELECT * from "+dbTableName.iklantProspectClientFamilyDetail+" where client_id =" + clientNameID
                                clientConnect.query(KYC_familyMemberDetailsFetch,
                                    function selectCb(err, results, fields) {
                                        if (err) {
                                            connectionDataSource.releaseConnectionPool(clientConnect);
                                            customlog.error(err);
                                        }
                                        else {
                                            for (var i in results) {
                                                F_memberName.push(results[i].member_name);
                                                F_memberGender.push(results[i].member_gender);
                                                F_memberRelationship.push(results[i].member_relationship);
                                                F_memberDOB.push(results[i].member_dob);
                                                F_memberEducation.push(results[i].member_education);
                                                F_memberOccupation.push(results[i].member_occupation);
                                                F_memberIncome.push(results[i].member_income);
                                                F_memberOtherRelationshipName.push(results[i].other_family_relationship_name);

                                            }
                                            prospectClientFamilyFetchObject.clearAll();
                                            prospectClientFamilyFetchObject.setMember_name(F_memberName);
                                            prospectClientFamilyFetchObject.setMember_gender(F_memberGender);
                                            prospectClientFamilyFetchObject.setMember_relationship(F_memberRelationship);
                                            prospectClientFamilyFetchObject.setMember_dob(F_memberDOB);
                                            prospectClientFamilyFetchObject.setMember_education(F_memberEducation);
                                            prospectClientFamilyFetchObject.setMember_occupation(F_memberOccupation);
                                            prospectClientFamilyFetchObject.setMember_income(F_memberIncome);
                                            for(var j in F_memberOtherRelationshipName){
                                                if(F_memberOtherRelationshipName[j] == null){
                                                    prospectClientFamilyFetchObject.setMemberRelationshipName("");
                                                }
                                                else{
                                                    prospectClientFamilyFetchObject.setMemberRelationshipName(F_memberOtherRelationshipName);
                                                }
                                            }


                                        }
                                    }
                                );

                                //query to fetch other mfi loan details for all clients

                                var KYC_otherMfiLoanDetailFetch = "SELECT * from "+dbTableName.iklantProspectClientOtherMfiDetail+" where client_id =" + clientNameID
                                clientConnect.query(KYC_otherMfiLoanDetailFetch,
                                    function selectCb(err, results, fields) {
                                        if (err) {
                                            connectionDataSource.releaseConnectionPool(clientConnect);
                                            customlog.error(err);
                                        }
                                        else {
                                            for (var i in results) {
                                                F_otherMfiName.push(results[i].other_mfi_name);
                                                F_otherMfiAmount.push(results[i].other_mfi_amount_secured);
                                                F_otherMfiOutstanding.push(results[i].other_mfi_loan_outstanding);


                                            }
                                            prospectClientOtherMfiDetailObject.clearAll();
                                            prospectClientOtherMfiDetailObject.setOtherMfiNameArrayDto(F_otherMfiName);
                                            prospectClientOtherMfiDetailObject.setOtherMfiAmountArrayDto(F_otherMfiAmount);
                                            prospectClientOtherMfiDetailObject.setOtherMfiOutstandingArrayDto(F_otherMfiOutstanding);

                                        }
                                        customlog.debug("getOtherMfiNameArrayDto : " + prospectClientOtherMfiDetailObject.getOtherMfiNameArrayDto());
                                    }
                                );


                                //query to fetch familymonthlyincome and familytotalexpenses
                                var KYC_IncomeExpenseFetch = "SELECT family_monthly_income,family_monthly_expense,is_loan_secured,IFNULL((SELECT user_name FROM "+dbTableName.iklantUsers+" WHERE user_id = `data_entry_updated_by`),(SELECT user_name FROM "+dbTableName.iklantUsers+" WHERE user_id = `data_entry_by`)) AS kyc_done_by," +
                                    " (SELECT user_name FROM "+dbTableName.iklantUsers+" WHERE user_id = `credit_check_by`) as credit_by,(SELECT user_name FROM "+dbTableName.iklantUsers+" WHERE user_id = `data_verified_by`) as data_verified_by FROM "+dbTableName.iklantProspectClient+
                                    " pc LEFT JOIN "+dbTableName.iklantProspectClientDataEntryTracking+" pcd ON pcd.client_id = pc.client_id " +
                                    " where pc.client_id=" + clientNameID
                                customlog.error("KYC_IncomeExpenseFetch"+KYC_IncomeExpenseFetch);
                                clientConnect.query(KYC_IncomeExpenseFetch,
                                    function selectCb(err, results, fields) {
                                        if (err) {
                                            connectionDataSource.releaseConnectionPool(clientConnect);
                                            customlog.error(err);
                                        }
                                        else {
                                            prospectClient.clearAll();
                                            prospectClient.setKYC_Updated_By(results[0].kyc_done_by);
                                            prospectClient.setCredited_By(results[0].credit_by);
                                            prospectClient.setDataVerified_By(results[0].data_verified_by);
                                            prospectClient.setIs_loan_secured(results[0].is_loan_secured);
                                            //prospectClient.setRepaymentTrackRecord(results[0].loan_repayment_track_record);
                                            prospectClient.setFamily_monthly_income(results[0].family_monthly_income);
                                            prospectClient.setFamily_monthly_expense(results[0].family_monthly_expense);
                                        }
                                    }
                                );
                            }
                            else {
                                flag = 0; //for insert
                                prospectClient.clearAll();
                                prospectClientFamilyFetchObject.clearAll();
                                prospectClientPersonalObject.clearAll();
                                if(results[0].comments_by_rm != null) {
                                    prospectClientPersonalObject.setCommentsByRM(results[0].comments_by_rm);
                                }
                                if(results[0].remarks_for_need_more_information != null) {
                                    prospectClientPersonalObject.setRemarks(results[0].remarks_for_need_more_information);
                                }
                                prospectClientGuarantorObject.clearAll();
                                prospectClientHouseDetailObject.clearAll();
                                prospectClientBankDetailObject.clearAll();
                                prospectClientOtherMfiDetailObject.clearAll();
                                prospectClientOtherDetailObject.clearAll();
                            }

                            var clientNames = new Array();
                            var clientId = new Array();
                            //added AND in where condition to retrieve clients having statusID 3
                            var fetchQuery1 = "SELECT pc.client_id,IF(pc.client_last_name LIKE 'mln%',pc.client_name,CONCAT(pc.client_name,' ',pc.client_last_name)) as client_name,pg.group_name,pg.center_name FROM "+dbTableName.iklantProspectClient+" pc INNER JOIN " +
                                ""+dbTableName.iklantProspectGroup+" pg ON pg.group_id = pc.group_id WHERE pc.group_id = " + groupId + " and " +
                                "pc.is_overdue = 0 AND pc.status_id IN(" + constantsObj.getKYCUploaded() + "," + constantsObj.getKYCCompleted() + ")";
                            //"pc.is_overdue = 0 AND pc.status_id IN(" + constantsObj.getKYCUploaded() + "," + constantsObj.getKYCCompleted() + "," + constantsObj.getLeaderSubLeaderUpdatedStatus()+")";
                            clientConnect.query(fetchQuery1,
                                function selectCb(err, results, fields) {
                                    connectionDataSource.releaseConnectionPool(clientConnect);
                                    if (err) {
                                        customlog.error(err);
                                        callback();
                                    }
                                    else if(results.length>0){
                                        for (var i in results) {
                                            clientNames[i] = results[i].client_name;
                                            clientId[i] = results[i].client_id;
                                        }
                                        prospectGroup.clearAll();
                                        prospectGroup.setGroup_name(results[0].group_name);
                                        prospectGroup.setCenter_name(results[0].center_name);
                                    }


                                    var lookupEntityObj = new LookupEntity();
                                    callback(groupId, prospectClientFamilyFetchObject, prospectClient, prospectGroup, clientId, clientNames, lookupEntityObj, clientNameID, prospectClientPersonalObject, prospectClientGuarantorObject, prospectClientHouseDetailObject, prospectClientBankDetailObject, prospectClientOtherMfiDetailObject, prospectClientOtherDetailObject, flag);
                                }
                            );
                        }
                    }
                );
            }
        );
    },
    saveKYC_Updating: function (tenantId, deletedMembers, deletedMemberRelation, deletedMemberIncome, flagValue, prospectClientPersonal, prospectClientGuarantor, prospectClientFamilyDetail, prospectClient, prospectClientHouseDetail, prospectClientBankDetail, prospectClientOtherMfiDetail, prospectClientOtherDetail, userId, pageName, isSkip, group_id,isRejected, callback) {
        //GLOBAL VARIABLES
        var self = this;
        var constantsObj = this.constants;
        var clientId = prospectClientPersonal.getClient_id();
        var reqProspectGroup = require(commonDTO +"/prospectGroup");
        var LookupEntity = require(commonDTO +"/lookupEntity");
        var lookupEntityObj = new LookupEntity();
        var successMessage;
        var clientIdArray = new Array();
        /*// UPDATE QUERY FOR DATA ENTRY TRACKING [Paramasivan]
         if (isSkip == 1 && pageName == 'KYC_Data_Verification') {
         var client = this.client;
         var prospectClientSelectQuery = "SELECT client_id FROM "+dbTableName.iklantProspectClientDataEntryTracking+" WHERE client_id IN (SELECT client_id FROM "+dbTableName.iklantProspectClient+" WHERE group_id = " + group_id + ")";
         clientConnect.query(prospectClientSelectQuery,
         function (error, results) {
         if (!error) {
         for (var i = 0; i < results.length; i++) {
         var prospectClientsQuery = "UPDATE "+dbTableName.iklantProspectClientDataEntryTracking+" " +
         "SET  data_verified_by = '" + userId + "', is_data_verified = 1,data_verified_date = NOW() + INTERVAL 5 HOUR + INTERVAL 30 MINUTE WHERE " +
         "client_id = " + results[i].client_id;
         customlog.info('update prospectClientsQuery' + prospectClientsQuery);
         clientConnect.query(prospectClientsQuery,
         function (err) {
         if (!err) {
         } else {
         customlog.error(err);
         }
         }
         );
         }
         } else {
         customlog.error(error);
         }
         }
         );

         var clientFamilyFetch = require(commonDTO +"/prospectClientFamilyFetch");
         var prospectClientFamilyFetchObject = new clientFamilyFetch();
         var prospectGroup = new reqProspectGroup();
         var clientNameID = 0;


         //query for fetching clientnames and clientid
         var successMessage = "KYC Data Verification Success";

         var clientNames = new Array();
         var clientId = new Array();
         var fetchQuery2 = "SELECT pc.client_id,pc.client_name FROM "+dbTableName.iklantProspectClient+" pc " +
         "INNER JOIN "+dbTableName.iklantProspectGroup+" pg ON pg.group_id = pc.group_id WHERE " +
         "pc.group_id = " + group_id + " and pc.is_overdue = 0 and " +
         "pc.status_id= " + constantsObj.getKYCUploaded() + "";

         clientConnect.query(fetchQuery2,
         function selectCb(err, results, fields) {
         if (err) {
         customlog.error(err);
         }
         else {
         for (var i in results) {
         clientNames[i] = results[i].client_name;
         clientId[i] = results[i].client_id;
         }
         callback(successMessage, group_id, prospectClientFamilyFetchObject, prospectClient, prospectGroup, clientId, clientNames, lookupEntityObj, clientNameID, prospectClientPersonal, prospectClientGuarantor, prospectClientFamilyDetail, prospectClient, prospectClientHouseDetail, prospectClientBankDetail, prospectClientOtherMfiDetail, prospectClientOtherDetail, flagValue);
         }
         }
         );
         }
         else {*/
        connectionDataSource.getConnection(function (clientConnect) {
            clientConnect.beginTransaction(function (err){
                if (err){
                    customlog.error(err);
                }
                if (flagValue == 0) {
                    //INSERT QUERY FOR MEMBER PERSONAL DETAILS
                    //var client = this.client;
                    var KYCMemberQuery = "SELECT * FROM "+dbTableName.iklantProspectClientPersonal+" WHERE client_id = '"+clientId+"'";
                    if(clientConnect != null ){
                        clientConnect.query(KYCMemberQuery,
                            function postCreate(err,results) {
                                if (err) {
                                    clientConnect.rollback(function(){
                                        connectionDataSource.releaseConnectionPool(clientConnect);
                                        clientConnect = null;
                                        customlog.error(err);
                                        callback();
                                    });
                                }
                                else{
                                    if(results.length>0){
                                        var KYC_memberPersonalDetailsUpdate = "UPDATE "+dbTableName.iklantProspectClientPersonal+" " +
                                            "SET date_of_birth = '" + prospectClientPersonal.getDate_of_birth() + "', " +
                                            "mobile_number = '" + prospectClientPersonal.getMobile_number() + "',landline_number = '" + prospectClientPersonal.getLandline_number() + "',address = '" + prospectClientPersonal.getAddress() + "', " +
                                            "pincode = '" + prospectClientPersonal.getPincode() + "',ration_card_number = '" + prospectClientPersonal.getRation_card_number() + "', " +
                                            "voter_id = '" + prospectClientPersonal.getVoter_id() + "',gas_number = '" + prospectClientPersonal.getGas_number() + "', " +
                                            "aadhaar_number = '" + prospectClientPersonal.getAadhaar_number() + "',is_other_id = '" + prospectClientPersonal.getIs_other_id() + "', " +
                                            "other_id_name1 = '" + prospectClientPersonal.getOther_id_name() + "',other_id1 = '" + prospectClientPersonal.getOther_id() + "', " +
                                            "other_id_name2 = '" + prospectClientPersonal.getOther_id_name2() + "',other_id2 = '" + prospectClientPersonal.getOther_id2() + "', " +
                                            "marital_status = '" + prospectClientPersonal.getMarital_status() + "',religion = '" + prospectClientPersonal.getReligion() + "', " +
                                            "caste = '" + prospectClientPersonal.getCaste() + "',educational_details = '" + prospectClientPersonal.getEducational_details() + "', " +
                                            "loan_purpose = '" + prospectClientPersonal.getLoan_purpose() + "',guardian_relationship = '" + prospectClientPersonal.getGuardian_relationship() + "', " +
                                            "business_category = '" + prospectClientPersonal.getBusinessCategoryId() + "',"+
                                            "guardian_name = , '" + prospectClientPersonal.getGuardian_name() + "', guardian_lastname = '" + prospectClientPersonal.getGuardian_lastname() + "', " +
                                            "guardian_dob = '" + prospectClientPersonal.getGuardian_dob() + "',gender = '" + prospectClientPersonal.getGender() + "',nationality = '" + prospectClientPersonal.getNationality() + "' " +
                                            "WHERE client_id = '"+clientId+"'";
                                        if(clientConnect != null ){
                                            clientConnect.query(KYC_memberPersonalDetailsUpdate,
                                                function postCreate(err) {
                                                    if (err) {
                                                        clientConnect.rollback(function(){
                                                            connectionDataSource.releaseConnectionPool(clientConnect);
                                                            clientConnect = null;
                                                            customlog.error(err);
                                                            callback();
                                                        });
                                                    }
                                                }
                                            );
                                        }
                                    }
                                    else{
                                        var KYC_memberPersonalDetails = "INSERT INTO "+dbTableName.iklantProspectClientPersonal+"(client_id,date_of_birth, " +
                                            "mobile_number,landline_number,address,pincode,ration_card_number,voter_id,gas_number, " +
                                            "aadhaar_number,is_other_id,other_id_name1,other_id1,other_id_name2,other_id2,marital_status,religion, " +
                                            "caste,educational_details,loan_purpose,guardian_relationship,business_category,guardian_name, " +
                                            "guardian_lastname,guardian_dob,gender,nationality) VALUES " +
                                            "('" + clientId + "', '" + prospectClientPersonal.getDate_of_birth() + "', " +
                                            "'" + prospectClientPersonal.getMobile_number() + "','" + prospectClientPersonal.getLandline_number() + "', " +
                                            "'" + prospectClientPersonal.getAddress() + "','" + prospectClientPersonal.getPincode() + "', " +
                                            "'" + prospectClientPersonal.getRation_card_number() + "', " +
                                            "'" + prospectClientPersonal.getVoter_id() + "','" + prospectClientPersonal.getGas_number() + "', " +
                                            "'" + prospectClientPersonal.getAadhaar_number() + "','" + prospectClientPersonal.getIs_other_id() + "', " +
                                            "'" + prospectClientPersonal.getOther_id_name() + "','" + prospectClientPersonal.getOther_id() + "', " +
                                            "'" + prospectClientPersonal.getOther_id_name2() + "','" + prospectClientPersonal.getOther_id2() + "', " +
                                            "'" + prospectClientPersonal.getMarital_status() + "','" + prospectClientPersonal.getReligion() + "', " +
                                            "'" + prospectClientPersonal.getCaste() + "','" + prospectClientPersonal.getEducational_details() + "', " +
                                            "'" + prospectClientPersonal.getLoan_purpose() + "','" + prospectClientPersonal.getGuardian_relationship() + "', " +
                                            "'" + prospectClientPersonal.getBusinessCategoryId() + "', " +
                                            "'" + prospectClientPersonal.getGuardian_name() + "','" + prospectClientPersonal.getGuardian_lastname() + "', " +
                                            "'" + prospectClientPersonal.getGuardian_dob() + "','" + prospectClientPersonal.getGender() + "', " +
                                            "'" + prospectClientPersonal.getNationality() + "')";
                                        if(clientConnect!=null){
                                            clientConnect.query(KYC_memberPersonalDetails,
                                                function postCreate(err) {
                                                    if (err) {
                                                        clientConnect.rollback(function(){
                                                            connectionDataSource.releaseConnectionPool(clientConnect);
                                                            clientConnect = null;
                                                            customlog.error(err);
                                                            callback();
                                                        });
                                                    }
                                                }
                                            );
                                        }
                                    }
                                }
                            });
                    }

                    //INSERT QUERY FOR GUARANTOR DETAILS
                    var guarantorDetailsQuery = "SELECT * FROM "+dbTableName.iklantProspectClientGuarantor+" WHERE client_id = '" + clientId + "'";
                    if(clientConnect !=null){
                        clientConnect.query(guarantorDetailsQuery,
                            function postCreate(err,results) {
                                if (err) {
                                    clientConnect.rollback(function(){
                                        connectionDataSource.releaseConnectionPool(clientConnect);
                                        clientConnect = null;
                                        customlog.error(err);
                                        callback();
                                    });
                                }
                                else{
                                    if(results.length>0){
                                        var KYC_guarantorDetailsUpdate = "UPDATE "+dbTableName.iklantProspectClientGuarantor+ " " +
                                            "SET guarantor_name = '" + prospectClientGuarantor.getGuarantorName() + "', " +
                                            "guarantor_dob = '" + prospectClientGuarantor.getGuarantorDob() + "',guarantor_relationship = '" + prospectClientGuarantor.getGuarantorRelationship() + "', " +
                                            "guarantor_address = '" + prospectClientGuarantor.getGuarantorAddress() + "',guarantor_id = '" + prospectClientGuarantor.getGuarantorId() + "', " +
                                            "other_guarantor_relationship_name = '" + prospectClientGuarantor.getOtherGuarantorRelationshipName() + "' WHERE client_id = '"+clientId+"'";
                                        if(clientConnect !=null){
                                            clientConnect.query(KYC_guarantorDetailsUpdate,
                                                function postCreate(err) {
                                                    if (err) {
                                                        clientConnect.rollback(function(){
                                                            connectionDataSource.releaseConnectionPool(clientConnect);
                                                            clientConnect = null;
                                                            customlog.error(err);
                                                            callback();
                                                        });
                                                    }
                                                }
                                            );
                                        }
                                    }
                                    else{
                                        var KYC_guarantorDetails = "INSERT INTO "+dbTableName.iklantProspectClientGuarantor+"(client_id,guarantor_name, " +
                                            "guarantor_dob,guarantor_relationship,guarantor_address,guarantor_id,other_guarantor_relationship_name) VALUES " +
                                            "('" + clientId + "', '" + prospectClientGuarantor.getGuarantorName() + "', " +
                                            "'" + prospectClientGuarantor.getGuarantorDob() + "', " +
                                            "'" + prospectClientGuarantor.getGuarantorRelationship() + "', " +
                                            "'" + prospectClientGuarantor.getGuarantorAddress() + "', " +
                                            "'" + prospectClientGuarantor.getGuarantorId() + "', '" + prospectClientGuarantor.getOtherGuarantorRelationshipName() + "')";
                                        if(clientConnect != null){
                                            clientConnect.query(KYC_guarantorDetails,
                                                function postCreate(err) {
                                                    if (err) {
                                                        clientConnect.rollback(function(){
                                                            connectionDataSource.releaseConnectionPool(clientConnect);
                                                            clientConnect = null;
                                                            customlog.error(err);
                                                            callback();
                                                        });
                                                    }
                                                }
                                            );
                                        }
                                    }
                                }
                            }
                        );
                    }

                    //INSERT QUERY FOR FAMILY DETAILS(POPUP)
                    var family_member_name_array = (prospectClientFamilyDetail.getMember_name()).split(',');
                    var member_gender_array = (prospectClientFamilyDetail.getMember_gender()).split(',');
                    var member_relationship_array = (prospectClientFamilyDetail.getMember_relationship()).split(',');
                    var member_age_array = (prospectClientFamilyDetail.getMember_dob()).split(',');
                    var member_education_array = (prospectClientFamilyDetail.getMember_education()).split(',');
                    var member_occupation_array = (prospectClientFamilyDetail.getMember_occupation()).split(',');
                    var member_income_array = (prospectClientFamilyDetail.getMember_income()).split(',');
                    var member_relationship_name_array = (prospectClientFamilyDetail.getMemberRelationshipName()).split(',');

                    for (var k = 0; k < member_age_array.length; k++) {
                        if (member_age_array[k] == '' || member_age_array[k] == '0000-00-00') {
                            member_age_array[k] = '0000-00-00';
                            customlog.info(member_age_array[k] + "---------if");
                        }
                        else {
                            customlog.info(member_age_array[k] + "---------else");
                            member_age_array[k] = dateUtils.formatDate(member_age_array[k]);
                        }
                    }

                    var familyMemberQuery = "SELECT * FROM "+dbTableName.iklantProspectClientFamilyDetail+" WHERE client_id = '" + clientId + "'";
                    if(clientConnect !=null ){
                        clientConnect.query(familyMemberQuery,
                            function postCreate(err,results) {
                                if (err) {
                                    clientConnect.rollback(function(){
                                        connectionDataSource.releaseConnectionPool(clientConnect);
                                        clientConnect = null;
                                        customlog.error(err);
                                        callback();
                                    });
                                }
                                else{
                                    if(results.length>0){
                                        var KYC_familyDetailsPopupDelete = "DELETE FROM "+dbTableName.iklantProspectClientFamilyDetail+" WHERE client_id = '"+clientId+"'";
                                        if(clientConnect != null){
                                            clientConnect.query(KYC_familyDetailsPopupDelete,
                                                function postCreate(err) {
                                                    if (err) {
                                                        clientConnect.rollback(function(){
                                                            connectionDataSource.releaseConnectionPool(clientConnect);
                                                            clientConnect = null;
                                                            customlog.error(err);
                                                            callback();
                                                        });
                                                    }
                                                    else{
                                                        if (family_member_name_array[0] != "") {
                                                            for (var i = 0; i < family_member_name_array.length; i++) {
                                                                var KYC_familyDetailsPopup = "INSERT INTO "+dbTableName.iklantProspectClientFamilyDetail+"(client_id, " +
                                                                    "member_name,member_gender,member_relationship,member_dob,member_education, " +
                                                                    "member_occupation,member_income,other_family_relationship_name) VALUES " +
                                                                    "('" + clientId + "', '" + family_member_name_array[i] + "', " +
                                                                    "'" + member_gender_array[i] + "', '" + member_relationship_array[i] + "', " +
                                                                    "'" + member_age_array[i] + "','" + member_education_array[i] + "', " +
                                                                    "'" + member_occupation_array[i] + "','" + member_income_array[i] + "','" + member_relationship_name_array[i] + "')";
                                                                if(clientConnect != null){
                                                                    clientConnect.query(KYC_familyDetailsPopup,
                                                                        function postCreate(err) {
                                                                            if (err) {
                                                                                clientConnect.rollback(function(){
                                                                                    connectionDataSource.releaseConnectionPool(clientConnect);
                                                                                    clientConnect = null;
                                                                                    customlog.error(err);
                                                                                    callback();
                                                                                });
                                                                            }
                                                                        }
                                                                    );
                                                                }
                                                            }
                                                        }
                                                    }
                                                }
                                            );
                                        }
                                    }
                                    else{
                                        if (family_member_name_array[0] != "") {
                                            for (var i = 0; i < family_member_name_array.length; i++) {
                                                var KYC_familyDetailsPopup = "INSERT INTO "+dbTableName.iklantProspectClientFamilyDetail+"(client_id, " +
                                                    "member_name,member_gender,member_relationship,member_dob,member_education, " +
                                                    "member_occupation,member_income,other_family_relationship_name) VALUES " +
                                                    "('" + clientId + "', '" + family_member_name_array[i] + "', " +
                                                    "'" + member_gender_array[i] + "', '" + member_relationship_array[i] + "', " +
                                                    "'" + member_age_array[i] + "','" + member_education_array[i] + "', " +
                                                    "'" + member_occupation_array[i] + "','" + member_income_array[i] + "','"+ member_relationship_name_array[i] +"')";
                                                if(clientConnect !=null){
                                                    clientConnect.query(KYC_familyDetailsPopup,
                                                        function postCreate(err) {
                                                            if (err) {
                                                                clientConnect.rollback(function(){
                                                                    connectionDataSource.releaseConnectionPool(clientConnect);
                                                                    clientConnect = null;
                                                                    customlog.error(err);
                                                                    callback();
                                                                });
                                                            }
                                                        }
                                                    );
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        );
                    }
                    //UPDATE QUERY FOR FAMILY DETAILS
                    var KYC_familyDetails = "UPDATE "+dbTableName.iklantProspectClient+" SET client_name='" + prospectClientPersonal.getMembFirstName() + "', client_last_name='" + prospectClientPersonal.getMembLastName() + "', family_monthly_income = '" + prospectClient.getFamily_monthly_income() + "',family_monthly_expense = '" + prospectClient.getFamily_monthly_expense() + "' , is_loan_secured = '" + prospectClient.getIs_loan_secured() + "',updated_date=NOW() + INTERVAL 5 HOUR + INTERVAL 30 MINUTE WHERE client_id='" + clientId + "'";
                    if(clientConnect !=null){
                        clientConnect.query(KYC_familyDetails,
                            function postCreate(err) {
                                if (err) {
                                    clientConnect.rollback(function(){
                                        connectionDataSource.releaseConnectionPool(clientConnect);
                                        clientConnect = null;
                                        customlog.error(err);
                                        callback();
                                    });
                                }
                            }
                        );
                    }

                    //INSERT QUERY FOR HOUSE DETAILS
                    var KYCHouseQuery = "SELECT * FROM "+dbTableName.iklantProspectClientHouseDetail+" WHERE client_id = '" + clientId + "'";
                    if(clientConnect !=null){
                        clientConnect.query(KYCHouseQuery,
                            function postCreate(err,results) {
                                if (err) {
                                    clientConnect.rollback(function(){
                                        connectionDataSource.releaseConnectionPool(clientConnect);
                                        clientConnect = null;
                                        customlog.error(err);
                                        callback();
                                    });
                                }
                                else{
                                    if(results.length>0){
                                        var KYC_houseDetailsUpdate = "UPDATE "+dbTableName.iklantProspectClientHouseDetail+" " +
                                            "SET house_type = '" + prospectClientHouseDetail.getHouse_type() + "',time_period = '" + prospectClientHouseDetail.getTime_period() + "', " +
                                            "house_sqft = '" + prospectClientHouseDetail.getHouse_sqft() + "',vehicle_details = '" + prospectClientHouseDetail.getVehicle_details() + "', " +
                                            "house_ceiling_type = '" + prospectClientHouseDetail.getHouse_ceiling_type() + "',house_wall_type = '" + prospectClientHouseDetail.getHouse_wall_type() + "', " +
                                            "house_flooring_detail = '" + prospectClientHouseDetail.getHouse_flooring_detail() + "',house_room_detail = '" + prospectClientHouseDetail.getHouse_room_detail() + "', " +
                                            "house_toilet = '" + prospectClientHouseDetail.getHouse_toilet() + "' WHERE client_id = '"+clientId+"'";
                                        if(clientConnect !=null){
                                            clientConnect.query(KYC_houseDetailsUpdate,
                                                function postCreate(err) {
                                                    if (err) {
                                                        clientConnect.rollback(function(){
                                                            connectionDataSource.releaseConnectionPool(clientConnect);
                                                            clientConnect = null;
                                                            customlog.error(err);
                                                            callback();
                                                        });
                                                    }
                                                }
                                            );
                                        }
                                    }else{
                                        var KYC_houseDetails = "INSERT INTO "+dbTableName.iklantProspectClientHouseDetail+"(client_id,house_type,time_period,house_sqft,vehicle_details,house_ceiling_type,house_wall_type,house_flooring_detail,house_room_detail,house_toilet) VALUES " +
                                            "('" + clientId + "', '" + prospectClientHouseDetail.getHouse_type() + "', '" + prospectClientHouseDetail.getTime_period() + "', '" + prospectClientHouseDetail.getHouse_sqft() + "','" + prospectClientHouseDetail.getVehicle_details() + "','" + prospectClientHouseDetail.getHouse_ceiling_type() + "','" + prospectClientHouseDetail.getHouse_wall_type() + "','" + prospectClientHouseDetail.getHouse_flooring_detail() + "','" + prospectClientHouseDetail.getHouse_room_detail() + "','" + prospectClientHouseDetail.getHouse_toilet() + "')";
                                        if(clientConnect !=null){
                                            clientConnect.query(KYC_houseDetails,
                                                function postCreate(err) {
                                                    if (err) {
                                                        clientConnect.rollback(function(){
                                                            connectionDataSource.releaseConnectionPool(clientConnect);
                                                            clientConnect = null;
                                                            customlog.error(err);
                                                            callback();
                                                        });
                                                    }
                                                }
                                            );
                                        }
                                    }
                                }
                            }
                        );
                    }

                    //INSERT QUERY FOR BANK DETAILS
                    var KYC_bankDetailsQuery = "SELECT * FROM "+dbTableName.iklantprospectClientBankDetail+" WHERE client_id = '" + clientId + "'";
                    if(clientConnect !=null){
                        clientConnect.query(KYC_bankDetailsQuery,
                            function postCreate(err,results) {
                                if (err) {
                                    clientConnect.rollback(function(){
                                        connectionDataSource.releaseConnectionPool(clientConnect);
                                        clientConnect = null;
                                        customlog.error(err);
                                        callback();
                                    });
                                }
                                else{
                                    if(results.length>0){
                                        var KYC_bankDetailsUpdate = "UPDATE "+dbTableName.iklantprospectClientBankDetail+" " +
                                            "SET is_bank_account = '" + prospectClientBankDetail.getIs_bank_account() + "', " +
                                            "is_savings =  '" + prospectClientBankDetail.getIs_Savings() + "' WHERE client_id = '"+clientId+"'";
                                        if(clientConnect != null){
                                            clientConnect.query(KYC_bankDetailsUpdate,
                                                function postCreate(err) {
                                                    if (err) {
                                                        clientConnect.rollback(function(){
                                                            connectionDataSource.releaseConnectionPool(clientConnect);
                                                            clientConnect = null;
                                                            customlog.error(err);
                                                            callback();
                                                        });
                                                    }
                                                }
                                            );
                                        }
                                    }else{
                                        var KYC_bankDetails = "INSERT INTO "+dbTableName.iklantprospectClientBankDetail+"(client_id,is_bank_account,is_savings) VALUES " +
                                            "('" + clientId + "', '" + prospectClientBankDetail.getIs_bank_account() + "', '" + prospectClientBankDetail.getIs_Savings() + "')";
                                        if(clientConnect !=null){
                                            clientConnect.query(KYC_bankDetails,
                                                function postCreate(err) {
                                                    if (err) {
                                                        clientConnect.rollback(function(){
                                                            connectionDataSource.releaseConnectionPool(clientConnect);
                                                            clientConnect = null;
                                                            customlog.error(err);
                                                            callback();
                                                        });
                                                    }
                                                }
                                            );
                                        }
                                    }
                                }
                            }
                        );
                    }

                    //INSERT QUERY FOR OTHER MFI LOAN DETAILS
                    var OtherMfiNameArray = new Array();
                    var OtherMfiAmountHiddenArray = new Array();
                    var OtherMfiOutstandingArray = new Array();

                    OtherMfiNameArray = (prospectClientOtherMfiDetail.getOtherMfiName()).split(',');
                    OtherMfiAmountHiddenArray = (prospectClientOtherMfiDetail.getOtherMfiAmountSecured()).split(',');
                    OtherMfiOutstandingArray = (prospectClientOtherMfiDetail.getOtherMfiLoanOutstanding()).split(',');

                    //insert query for loansecured Checkbox
                    if (OtherMfiNameArray[0] != "") {
                        for (var i = 0; i < OtherMfiNameArray.length; i++) {

                            var KYC_otherMfiLoanDetails = "INSERT INTO "+dbTableName.iklantProspectClientOtherMfiDetail+"(client_id,other_mfi_name,other_mfi_amount_secured,other_mfi_loan_outstanding) VALUES " +
                                "('" + clientId + "', '" + OtherMfiNameArray[i] + "', '" + OtherMfiAmountHiddenArray[i] + "','" + OtherMfiOutstandingArray[i] + "')";
                            var client = this.client;
                            if(clientConnect !=null){
                                clientConnect.query(KYC_otherMfiLoanDetails,
                                    function postCreate(err) {
                                        if (err) {
                                            clientConnect.rollback(function(){
                                                connectionDataSource.releaseConnectionPool(clientConnect);
                                                clientConnect = null;
                                                customlog.error(err);
                                                callback();
                                            });
                                        }
                                    }
                                );
                            }
                        }
                    }

                    //INSERT QUERY FOR OTHER DETAILS
                    var KYC_otherDetailsQuery = "SELECT * FROM "+dbTableName.iklantProspectClientOtherDetail+" WHERE client_id = '" + clientId + "'";
                    if(clientConnect !=null){
                        clientConnect.query(KYC_otherDetailsQuery,
                            function postCreate(err,results) {
                                if (err) {
                                    clientConnect.rollback(function(){
                                        connectionDataSource.releaseConnectionPool(clientConnect);
                                        clientConnect = null;
                                        customlog.error(err);
                                        callback();
                                    });
                                }
                                else{
                                    if(results.length>0){
                                        var KYC_otherDetailsUpdate = "UPDATE "+dbTableName.iklantProspectClientOtherDetail+" " +
                                            "SET is_declaration_acksign = '" + prospectClientOtherDetail.getIsDeclarationAcksign() + "', " +
                                            "is_pledge_acksign '" + prospectClientOtherDetail.getIsPledgeAcksign() + "',is_guarantor_acksign = '" + prospectClientOtherDetail.getIsGuarantorAcksign() + "', " +
                                            "is_member_photocopy_attached = '" + prospectClientOtherDetail.getIsMemberPhotocopyAttached() + "', " +
                                            "is_guarantor_photocopy_attached = '" + prospectClientOtherDetail.getIsGuarantorPhotocopyAttached() + "' WHERE client_id = '"+clientId+"'";
                                        if(clientConnect !=null){
                                            clientConnect.query(KYC_otherDetailsUpdate,
                                                function postCreate(err) {
                                                    if (err) {
                                                        clientConnect.rollback(function(){
                                                            connectionDataSource.releaseConnectionPool(clientConnect);
                                                            clientConnect = null;
                                                            customlog.error(err);
                                                            callback();
                                                        });
                                                    }
                                                }
                                            );
                                        }
                                    }else{
                                        var KYC_otherDetails = "INSERT INTO "+dbTableName.iklantProspectClientOtherDetail+"(client_id,is_declaration_acksign,is_pledge_acksign,is_guarantor_acksign,is_member_photocopy_attached,is_guarantor_photocopy_attached) VALUES " +
                                            "('" + clientId + "', '" + prospectClientOtherDetail.getIsDeclarationAcksign() + "', '" + prospectClientOtherDetail.getIsPledgeAcksign() + "', '" + prospectClientOtherDetail.getIsGuarantorAcksign() + "','" + prospectClientOtherDetail.getIsMemberPhotocopyAttached() + "','" + prospectClientOtherDetail.getIsGuarantorPhotocopyAttached() + "')";
                                        if(clientConnect !=null){
                                            clientConnect.query(KYC_otherDetails,
                                                function postCreate(err) {
                                                    if (err) {
                                                        clientConnect.rollback(function(){
                                                            connectionDataSource.releaseConnectionPool(clientConnect);
                                                            clientConnect = null;
                                                            customlog.error(err);
                                                            callback();
                                                        });
                                                    }
                                                }
                                            );
                                        }
                                    }
                                }
                            }
                        );
                    }

                    // Modified for kyc updating [Chitra]
                    var prospectClientDataEntryQuery = 'SELECT * FROM '+dbTableName.iklantProspectClientDataEntryTracking+' WHERE client_id = ' + clientId;
                    if(clientConnect != null){
                        clientConnect.query(prospectClientDataEntryQuery, function (err, result) {
                            if (err) {
                                clientConnect.rollback(function(){
                                    connectionDataSource.releaseConnectionPool(clientConnect);
                                    clientConnect = null;
                                    customlog.error(err);
                                    callback();
                                });
                            } else if (result.length > 0) {
                                var prospectClientsQuery = "UPDATE "+dbTableName.iklantProspectClientDataEntryTracking+" " +
                                    "SET  data_entry_updated_by = '" + userId + "', created_date = NOW() + INTERVAL 5 HOUR + INTERVAL 30 MINUTE WHERE " +
                                    "client_id = " + clientId;
                                if(clientConnect !=null){
                                    clientConnect.query(prospectClientsQuery, function (err) {
                                        if (err) {
                                            clientConnect.rollback(function(){
                                                connectionDataSource.releaseConnectionPool(clientConnect);
                                                clientConnect = null;
                                                customlog.error(err);
                                                callback();
                                            });
                                        }
                                    });
                                }
                            }
                            else {
                                // INSERT QUERY FOR DATA ENTRY TRACKING [Paramasivan]
                                var prospectClientsQuery = "INSERT INTO "+dbTableName.iklantProspectClientDataEntryTracking+" " +
                                    "(client_id,data_entry_by,data_entry_updated_by,data_verified_by,credit_check_by," +
                                    "is_data_verified,created_date,data_entry_updated_date,data_verified_date,credit_updated_date) " +
                                    "VALUES(" + clientId + ",'" + userId + "',NULL,NULL,NULL,0,NOW() + INTERVAL 5 HOUR + INTERVAL 30 MINUTE,NOW() + INTERVAL 5 HOUR + INTERVAL 30 MINUTE,NOW() + INTERVAL 5 HOUR + INTERVAL 30 MINUTE,NOW() + INTERVAL 5 HOUR + INTERVAL 30 MINUTE)";
                                if(clientConnect !=null){
                                    clientConnect.query(prospectClientsQuery, function (err) {
                                        if (err) {
                                            clientConnect.rollback(function(){
                                                connectionDataSource.releaseConnectionPool(clientConnect);
                                                clientConnect = null;
                                                customlog.error(err);
                                                callback();
                                            });
                                        }
                                    });
                                }
                            }
                        });
                    }
                }
                else if (flagValue == 1) {
                    //update query starts here
                    //update query for MEMBER PERSONAL DETAILS
                    var client = this.client;
                    var memberPersonalUpdate = "update "+dbTableName.iklantProspectClientPersonal+" set date_of_birth = '" + prospectClientPersonal.getDate_of_birth() + "', " +
                        "mobile_number = '" + prospectClientPersonal.getMobile_number() + "' ,landline_number = '" + prospectClientPersonal.getLandline_number() + "' , address = '" + prospectClientPersonal.getAddress() + "' , " +
                        "pincode = '" + prospectClientPersonal.getPincode() + "' , ration_card_number =  '" + prospectClientPersonal.getRation_card_number() + "' , " +
                        "voter_id = '" + prospectClientPersonal.getVoter_id() + "' , gas_number =  '" + prospectClientPersonal.getGas_number() + "' , " +
                        "aadhaar_number = '" + prospectClientPersonal.getAadhaar_number() + "' ,is_other_id = '" + prospectClientPersonal.getIs_other_id() + "' , " +
                        "other_id_name1 = '" + prospectClientPersonal.getOther_id_name() + "', other_id1=  '" + prospectClientPersonal.getOther_id() + "' , " +
                        "other_id_name2 = '" + prospectClientPersonal.getOther_id_name2() + "', other_id2=  '" + prospectClientPersonal.getOther_id2() + "' , " +
                        "marital_status = '" + prospectClientPersonal.getMarital_status() + "' , religion = '" + prospectClientPersonal.getReligion() + "' , " +
                        "caste = '" + prospectClientPersonal.getCaste() + "' ,educational_details =  '" + prospectClientPersonal.getEducational_details() + "' , " +
                        "loan_purpose = '" + prospectClientPersonal.getLoan_purpose() + "' , guardian_relationship = '" + prospectClientPersonal.getGuardian_relationship() + "' , " +
                        "business_category = '" + prospectClientPersonal.getBusinessCategoryId() + "',"+
                        "guardian_name = '" + prospectClientPersonal.getGuardian_name() + "' ,guardian_lastname = '" + prospectClientPersonal.getGuardian_lastname() + "', " +
                        "guardian_dob = '" + prospectClientPersonal.getGuardian_dob() + "' , gender = '" + prospectClientPersonal.getGender() + "' , " +
                        "nationality = '" + prospectClientPersonal.getNationality() + "' " +
                        "where client_id =" + clientId;
                    if (clientConnect != null){
                        clientConnect.query(memberPersonalUpdate,
                            function updateDetail(err) {
                                if (err) {
                                    clientConnect.rollback(function(){
                                        connectionDataSource.releaseConnectionPool(clientConnect);
                                        clientConnect  = null;
                                        customlog.error(err);
                                        callback();
                                    });
                                }
                            }
                        );
                    }

                    //update query for MEMBER GUARANTOR DETAILS
                    var guarantorUpdate = "update "+dbTableName.iklantProspectClientGuarantor+" set guarantor_name = '" + prospectClientGuarantor.getGuarantorName() + "' , " +
                        "guarantor_dob = '" + prospectClientGuarantor.getGuarantorDob() + "' , guarantor_relationship = '" + prospectClientGuarantor.getGuarantorRelationship() + "' , " +
                        "guarantor_address = '" + prospectClientGuarantor.getGuarantorAddress() + "',guarantor_id = '" + prospectClientGuarantor.getGuarantorId() + "', " +
                        "other_guarantor_relationship_name = '" + prospectClientGuarantor.getOtherGuarantorRelationshipName() + "' where client_id =" + clientId;
                    if (clientConnect != null){
                        clientConnect.query(guarantorUpdate,
                            function updateDetail(err) {
                                if (err) {
                                    clientConnect.rollback(function(){
                                        connectionDataSource.releaseConnectionPool(clientConnect);
                                        clientConnect  = null;
                                        customlog.error(err);
                                        callback();
                                    });
                                }
                            }
                        );
                    }

                    //DELETE QUERY FOR FAMILY DETAILS MEMBER DELETED
                    var deletedMembersAray = deletedMembers.split(',');
                    var deletedMemberRelationArray = deletedMemberRelation.split(',');
                    var deletedMemberIncomeArray = deletedMemberIncome.split(',');
                    for (var i = 0; i < deletedMembersAray.length; i++) {
                        var familyDetailsDelete = "delete from "+dbTableName.iklantProspectClientFamilyDetail +
                            " where member_name ='" + deletedMembersAray[i] + "' AND client_id ='" + clientId + "' AND member_relationship='" + deletedMemberRelationArray[i] + "' AND member_income='" + deletedMemberIncomeArray[i] + "'";
                        if (clientConnect != null){
                            clientConnect.query(familyDetailsDelete,
                                function deleteDetail(err) {
                                    if (err) {
                                        clientConnect.rollback(function(){
                                            connectionDataSource.releaseConnectionPool(clientConnect);
                                            clientConnect = null;
                                            customlog.error(err);
                                            callback();
                                        });
                                    }
                                }
                            );
                        }
                    }
                    //update for family details popup
                    var family_member_name_array = (prospectClientFamilyDetail.getMember_name()).split(',');
                    var member_gender_array = (prospectClientFamilyDetail.getMember_gender()).split(',');
                    var member_relationship_array = (prospectClientFamilyDetail.getMember_relationship()).split(',');
                    var member_age_array = (prospectClientFamilyDetail.getMember_dob()).split(',');
                    var member_education_array = (prospectClientFamilyDetail.getMember_education()).split(',');
                    var member_occupation_array = (prospectClientFamilyDetail.getMember_occupation()).split(',');
                    var member_income_array = (prospectClientFamilyDetail.getMember_income()).split(',');
                    var member_relationship_name_array = (prospectClientFamilyDetail.getMemberRelationshipName()).split(',');

                    for (var k = 0; k < member_age_array.length; k++) {
                        if (member_age_array[k] == '' || member_age_array[k] == '0000-00-00') {
                            member_age_array[k] = '0000-00-00';
                            customlog.info(member_age_array[k] + "---------if");
                        }
                        else {
                            customlog.info(member_age_array[k] + "---------else");
                            member_age_array[k] = dateUtils.formatDate(member_age_array[k]);
                        }
                    }
                    customlog.info("Family Datamodel===== " + family_member_name_array);
                    customlog.info("member_gender Datamodel===== " + member_gender_array);
                    customlog.info("member received== " + prospectClientFamilyDetail.getMember_name());
                    if (family_member_name_array[0] != "") {
                        customlog.info("Inside if " + family_member_name_array[0]);
                        for (var i = 0; i < family_member_name_array.length; i++) {
                            customlog.info("inside for== " + family_member_name_array[0]);
                            var familyDetailsPopupUpdate = "INSERT INTO "+dbTableName.iklantProspectClientFamilyDetail+" (client_id,member_name,member_gender,member_relationship,member_dob,member_education,member_occupation,member_income,other_family_relationship_name) VALUES " +
                                "('" + clientId + "', '" + family_member_name_array[i] + "', '" + member_gender_array[i] + "', '" + member_relationship_array[i] + "','" + member_age_array[i] + "','" + member_education_array[i] + "','" + member_occupation_array[i] + "','" + member_income_array[i] + "','" + member_relationship_name_array[i] + "')";
                            if (clientConnect != null){
                                clientConnect.query(familyDetailsPopupUpdate,
                                    function updateDetail(err) {
                                        if (!err) {

                                        } else {
                                            clientConnect.rollback(function(){
                                                connectionDataSource.releaseConnectionPool(clientConnect);
                                                clientConnect = null;
                                                customlog.error(err);
                                                callback();
                                            });
                                        }
                                    }
                                );
                            }
                        }
                    }

                    //UPDATE QUERY FOR FAMILY DETAILS
                    var familyDetailsUpdate = "UPDATE "+dbTableName.iklantProspectClient+" SET client_name='" + prospectClientPersonal.getMembFirstName() + "', client_last_name='" + prospectClientPersonal.getMembLastName() + "', family_monthly_income = '" + prospectClient.getFamily_monthly_income() + "',family_monthly_expense = '" + prospectClient.getFamily_monthly_expense() + "', is_loan_secured = '" + prospectClient.getIs_loan_secured() + "',updated_date=NOW() + INTERVAL 5 HOUR + INTERVAL 30 MINUTE  WHERE client_id=" + clientId;
                    if (clientConnect != null){
                        clientConnect.query(familyDetailsUpdate,
                            function updateDetail(err) {
                                if (err) {
                                    clientConnect.rollback(function(){
                                        connectionDataSource.releaseConnectionPool(clientConnect);
                                        clientConnect = null;
                                        customlog.error(err);
                                        callback();
                                    });
                                }
                            }
                        );
                    }


                    //UPDATE QUERY FOR HOUSE DETAILS
                    var houseDetailsUpdate = "update "+dbTableName.iklantProspectClientHouseDetail+" set house_type = '" + prospectClientHouseDetail.getHouse_type() + "', " +
                        "time_period = '" + prospectClientHouseDetail.getTime_period() + "' ,house_sqft = '" + prospectClientHouseDetail.getHouse_sqft() + "' , " +
                        "vehicle_details = '" + prospectClientHouseDetail.getVehicle_details() + "' , house_ceiling_type = '" + prospectClientHouseDetail.getHouse_ceiling_type() + "' , " +
                        "house_wall_type = '" + prospectClientHouseDetail.getHouse_wall_type() + "' ,house_flooring_detail = '" + prospectClientHouseDetail.getHouse_flooring_detail() + "' , " +
                        "house_room_detail = '" + prospectClientHouseDetail.getHouse_room_detail() + "' ,house_toilet = '" + prospectClientHouseDetail.getHouse_toilet() + "' " +
                        "where client_id =" + clientId;
                    if (clientConnect != null){
                        clientConnect.query(houseDetailsUpdate,
                            function updateDetail(err) {
                                if (err) {
                                    clientConnect.rollback(function(){
                                        connectionDataSource.releaseConnectionPool(clientConnect);
                                        clientConnect = null;
                                        customlog.error(err);
                                        callback();
                                    });
                                }
                            }
                        );
                    }

                    //UPDATE QUERY FOR BANK DETAILS
                    var bankDetailsUpdate = "update "+dbTableName.iklantprospectClientBankDetail+" set	is_bank_account = '" + prospectClientBankDetail.getIs_bank_account() + "' , " +
                        "is_savings = '" + prospectClientBankDetail.getIs_Savings() + "' " +
                        "where client_id =" + clientId;
                    if (clientConnect != null){
                        clientConnect.query(bankDetailsUpdate,
                            function updateDetail(err) {
                                if (err) {
                                    clientConnect.rollback(function(){
                                        connectionDataSource.releaseConnectionPool(clientConnect);
                                        clientConnect = null;
                                        customlog.error(err);
                                        callback();
                                    });
                                }
                            }
                        );
                    }

                    //UPDATE QUERY FOR OTHER MFI LOAN DETAILS
                    var OtherMfiNameArray = new Array();
                    var OtherMfiAmountHiddenArray = new Array();
                    var OtherMfiOutstandingArray = new Array();

                    OtherMfiNameArray = (prospectClientOtherMfiDetail.getOtherMfiName()).split(',');
                    OtherMfiAmountHiddenArray = (prospectClientOtherMfiDetail.getOtherMfiAmountSecured()).split(',');
                    OtherMfiOutstandingArray = (prospectClientOtherMfiDetail.getOtherMfiLoanOutstanding()).split(',');

                    if (OtherMfiNameArray[0] != "") {
                        for (var i = 0; i < OtherMfiNameArray.length; i++) {

                            var otherMfiDetailsUpdate = "INSERT INTO "+dbTableName.iklantProspectClientOtherMfiDetail+" (client_id,other_mfi_name,other_mfi_amount_secured,other_mfi_loan_outstanding) VALUES " +
                                "('" + clientId + "', '" + OtherMfiNameArray[i] + "', '" + OtherMfiAmountHiddenArray[i] + "','" + OtherMfiOutstandingArray[i] + "')";
                            if (clientConnect != null){
                                clientConnect.query(otherMfiDetailsUpdate,
                                    function updateDetail(err) {
                                        if (err) {
                                            clientConnect.rollback(function(){
                                                connectionDataSource.releaseConnectionPool(clientConnect);
                                                clientConnect = null;
                                                customlog.error(err);
                                                callback();
                                            });
                                        }
                                    }
                                );
                            }
                        }
                    }

                    //DELETE QUERY FOR OTHER MFI LOAN NAME DELETED
                    var deletedOtherMfiLoanNamesArray = prospectClientOtherMfiDetail.getDeletedOtherMfiLoanClientNames().split(',');
                    var deletedOtherMfiLoanAmtSecuredArray = prospectClientOtherMfiDetail.getDeletedOtherMfiLoanClientAmtSecured().split(',');
                    var deletedOtherMfiLoanOutstandingArray = prospectClientOtherMfiDetail.getDeletedOtherMfiLoanClientOutstanding().split(',');
                    customlog.info("Deleted clients of other mfi : " + deletedOtherMfiLoanNamesArray);
                    for (var i = 0; i < deletedOtherMfiLoanNamesArray.length; i++) {
                        var otherMfiLoanNameDelete = "delete from "+dbTableName.iklantProspectClientOtherMfiDetail+" " +
                            "where other_mfi_name ='" + deletedOtherMfiLoanNamesArray[i] + "'AND other_mfi_amount_secured='" + deletedOtherMfiLoanAmtSecuredArray[i] + "' AND other_mfi_loan_outstanding='" + deletedOtherMfiLoanOutstandingArray[i] + "' AND client_id =" + clientId;
                        if (clientConnect != null){
                            clientConnect.query(otherMfiLoanNameDelete,
                                function deleteDetail(err) {
                                    if (err) {
                                        clientConnect.rollback(function(){
                                            connectionDataSource.releaseConnectionPool(clientConnect);
                                            clientConnect = null;
                                            customlog.error(err);
                                            callback();
                                        });
                                    }
                                }
                            );
                        }
                    }

                    //UPDATE QUERY FOR OTHER DETAILS
                    var otherDetailsUpdate = "update "+dbTableName.iklantProspectClientOtherDetail+" set " +
                        "is_declaration_acksign = '" + prospectClientOtherDetail.getIsDeclarationAcksign() + "' , " +
                        "is_pledge_acksign =  '" + prospectClientOtherDetail.getIsPledgeAcksign() + "' , " +
                        "is_guarantor_acksign = '" + prospectClientOtherDetail.getIsGuarantorAcksign() + "' , " +
                        "is_member_photocopy_attached = '" + prospectClientOtherDetail.getIsMemberPhotocopyAttached() + "' , " +
                        "is_guarantor_photocopy_attached = '" + prospectClientOtherDetail.getIsGuarantorPhotocopyAttached() + "' " +
                        "where client_id =" + clientId;
                    if (clientConnect != null){
                        clientConnect.query(otherDetailsUpdate,
                            function updateDetail(err) {
                                if (err) {
                                    clientConnect.rollback(function(){
                                        connectionDataSource.releaseConnectionPool(clientConnect);
                                        clientConnect = null;
                                        customlog.error(err);
                                        callback();
                                    });
                                }
                            }
                        );
                    }

                    // UPDATE QUERY FOR DATA ENTRY TRACKING [Paramasivan]
                    if (pageName == 'KYC_Update' || pageName == 'KYC_Update_New') {
                        if (clientConnect != null){
                            clientConnect.query("SELECT * FROM "+dbTableName.iklantProspectClientDataEntryTracking+" WHERE client_id = " + clientId, function (err, result) {
                                if (err) {
                                    clientConnect.rollback(function(){
                                        connectionDataSource.releaseConnectionPool(clientConnect);
                                        clientConnect = null;
                                        customlog.error(err);
                                        callback();
                                    });
                                } else if (result.length > 0) {
                                    var prospectClientsQuery = "UPDATE "+dbTableName.iklantProspectClientDataEntryTracking+" " +
                                        "SET  data_entry_updated_by = '" + userId + "', data_entry_updated_date = NOW() + INTERVAL 5 HOUR + INTERVAL 30 MINUTE WHERE " +
                                        "client_id = " + clientId;
                                    if (clientConnect != null){
                                        clientConnect.query(prospectClientsQuery,
                                            function (err) {
                                                if (err) {
                                                    clientConnect.rollback(function(){
                                                        connectionDataSource.releaseConnectionPool(clientConnect);
                                                        clientConnect = null;
                                                        customlog.error(err);
                                                        callback();
                                                    });
                                                }
                                            }
                                        );
                                    }
                                }
                                else {
                                    var prospectClientsQuery = "INSERT INTO "+dbTableName.iklantProspectClientDataEntryTracking+" " +
                                        "(client_id,data_entry_by,data_entry_updated_by,credit_check_by,data_verified_by,is_data_verified,created_date,data_entry_updated_date,data_verified_date,credit_updated_date) " +
                                        "VALUES(" + clientId + ",NULL,'" + userId + "',NULL,NULL,0,NOW() + INTERVAL 5 HOUR + INTERVAL 30 MINUTE,NOW() + INTERVAL 5 HOUR + INTERVAL 30 MINUTE,NOW() + INTERVAL 5 HOUR + INTERVAL 30 MINUTE,NOW() + INTERVAL 5 HOUR + INTERVAL 30 MINUTE)";
                                    if (clientConnect != null){
                                        clientConnect.query(prospectClientsQuery,
                                            function (err) {
                                                if (err) {
                                                    clientConnect.rollback(function(){
                                                        connectionDataSource.releaseConnectionPool(clientConnect);
                                                        clientConnect = null;
                                                        customlog.error(err);
                                                        callback();
                                                    });
                                                }
                                            }
                                        );
                                    }
                                }
                            });
                        }
                    }
                    else {
                        if (clientConnect != null){
                            clientConnect.query('SELECT * FROM '+dbTableName.iklantProspectClientDataEntryTracking+' WHERE client_id = ' + clientId, function (err, result) {
                                if (err) {
                                    clientConnect.rollback(function(){
                                        connectionDataSource.releaseConnectionPool(clientConnect);
                                        clientConnect = null;
                                        customlog.error(err);
                                        callback();
                                    });
                                } else if (result.length > 0) {
                                    var prospectClientsQuery = "UPDATE "+dbTableName.iklantProspectClientDataEntryTracking+" " +
                                        "SET  data_verified_by = '" + userId + "', is_data_verified = 1,data_verified_date = NOW() + INTERVAL 5 HOUR + INTERVAL 30 MINUTE WHERE " +
                                        "client_id = " + clientId;
                                    if (clientConnect != null){
                                        clientConnect.query(prospectClientsQuery,
                                            function (err) {
                                                if (err) {
                                                    clientConnect.rollback(function(){
                                                        connectionDataSource.releaseConnectionPool(clientConnect);
                                                        clientConnect = null;
                                                        customlog.error(err);
                                                        callback();
                                                    });
                                                }
                                            }
                                        );
                                    }
                                }
                                else {
                                    var prospectClientsQuery = "INSERT INTO "+dbTableName.iklantProspectClientDataEntryTracking+" " +
                                        "(client_id,data_entry_by,data_entry_updated_by,credit_check_by,data_verified_by,is_data_verified,created_date,data_entry_updated_date,data_verified_date,credit_updated_date) " +
                                        "VALUES(" + clientId + ",NULL,NULL,NULL,'" + userId + "',1,NOW() + INTERVAL 5 HOUR + INTERVAL 30 MINUTE,NOW() + INTERVAL 5 HOUR + INTERVAL 30 MINUTE,NOW() + INTERVAL 5 HOUR + INTERVAL 30 MINUTE,NOW() + INTERVAL 5 HOUR + INTERVAL 30 MINUTE)";
                                    if (clientConnect != null){
                                        clientConnect.query(prospectClientsQuery,
                                            function (err) {
                                                if (err) {
                                                    clientConnect.rollback(function(){
                                                        connectionDataSource.releaseConnectionPool(clientConnect);
                                                        clientConnect = null;
                                                        customlog.error(err);
                                                        callback();
                                                    });
                                                }
                                            }
                                        );
                                    }
                                }
                            });
                        }
                    }
                }

                //select query
                var client = this.client;
                var selectQuery = "select pc.client_id, pc.group_id,pg.group_name from "+dbTableName.iklantProspectClient+" pc " +
                    "inner join "+dbTableName.iklantProspectGroup+" pg on pg.group_id = pc.group_id  " +
                    "where client_id =" + clientId

                if (clientConnect != null){
                    clientConnect.query(selectQuery,
                        function selectCb(err, results, fields) {
                            if (err) {
                                clientConnect.rollback(function(){
                                    connectionDataSource.releaseConnectionPool(clientConnect);
                                    clientConnect = null;
                                    customlog.error(err);
                                    callback();
                                });
                            }
                            else {
                                for (var i in results) {
                                    groupIdForKyc = results[i].group_id;
                                    memberNameId = results[i].client_id;
                                    groupNameForKyc = results[i].group_name;
                                }
                            }
                            var groupStatus,newStatus;
                            if(pageName == 'KYC_Update' || pageName == 'KYC_Update_New'){
                                //newStatus = constantsObj.getLeaderSubLeaderUpdatedStatus();
                                newStatus = constantsObj.getKYCCompleted();
                                console.log("newStatus" +  newStatus);
                                groupStatus = new Array(constantsObj.getKYCUploaded(),constantsObj.getNewGroup(),constantsObj.getNeedRMApprovalStatusId(),constantsObj.getKYCVerificationStatusId());
                                var updateQuery = "UPDATE "+dbTableName.iklantProspectClient+" SET status_id = if(is_overdue=0, " +
                                    "" + constantsObj.getKYCCompleted() + ",status_id),updated_date =NOW() + INTERVAL 5 HOUR + INTERVAL 30 MINUTE " +
                                    "where client_id= " + clientId;
                                customlog.info("updateQuery :"+updateQuery);
                                if (clientConnect != null){
                                    clientConnect.query(updateQuery,
                                        function postCreate(err) {
                                            if (err) {
                                                clientConnect.rollback(function(){
                                                    connectionDataSource.releaseConnectionPool(clientConnect);
                                                    clientConnect = null;
                                                    customlog.error(err);
                                                    callback();
                                                    successMessage = "KYC Updating failed";
                                                });
                                            }else{
                                                successMessage = "KYC Updating Success";
                                            }
                                        }
                                    );
                                }
                            }
                            else {
                                //newStatus = constantsObj.getLeaderSubLeaderVerifiedStatus();
                                newStatus =   constantsObj.getLeaderSubLeaderUpdatedStatus();
                                groupStatus = new Array(constantsObj.getKYCCompleted(),constantsObj.getNewGroup(),constantsObj.getNeedRMApprovalStatusId(),constantsObj.getKYCVerificationStatusId());
                                if(isRejected == 1){
                                    var updateQuery = "UPDATE "+dbTableName.iklantProspectClient+" SET status_id = " + constantsObj.getRejectedKYCDataVerificationStatusId() + ",remarks_kyc_rejection = '"+prospectClientPersonal.getRemarksKycRejection()+"',updated_date =NOW() + INTERVAL 5 HOUR + INTERVAL 30 MINUTE " +
                                        "where client_id= " + clientId;
                                }else{
                                    var updateQuery = "UPDATE "+dbTableName.iklantProspectClient+" SET status_id = if(is_overdue=0, " +
                                        "" + constantsObj.getLeaderSubLeaderUpdatedStatus() + ",status_id),updated_date =NOW() + INTERVAL 5 HOUR + INTERVAL 30 MINUTE " +
                                        "where client_id= " + clientId;
                                }

                                customlog.info("updateQuery :"+updateQuery);
                                if (clientConnect != null){
                                    clientConnect.query(updateQuery,
                                        function postCreate(err) {
                                            if (err) {
                                                clientConnect.rollback(function (){
                                                    connectionDataSource.releaseConnectionPool(clientConnect);
                                                    clientConnect = null;
                                                    customlog.error(err);
                                                    callback();
                                                    successMessage = "KYC Data Verification failed";
                                                });
                                            }
                                            else{
                                                if(isRejected == 1){
                                                    successMessage = "Member Rejected Successfully";
                                                }else{
                                                    successMessage = "KYC Data Verification Success";
                                                }

                                            }
                                        }
                                    );
                                }
                            }

                            var clientFamilyFetch = require(commonDTO +"/prospectClientFamilyFetch");
                            var prospectClientFamilyFetchObject = new clientFamilyFetch();
                            var prospectGroup = new reqProspectGroup();
                            var clientNameID = 0;
                            var nmiStatusCheck;
                            //query for fetching clientnames and clientid
                            var clientNamesArray = new Array();

                            var fetchQuery2 = "SELECT pc.client_id,pc.client_name FROM "+dbTableName.iklantProspectClient+" pc " +
                                "INNER JOIN "+dbTableName.iklantProspectGroup+"  pg ON pg.group_id = pc.group_id WHERE " +
                                "pc.group_id = " + group_id + " and pc.is_overdue = 0 and " +
                                "pc.status_id IN (" + groupStatus + ")";
                            if (clientConnect != null){
                                clientConnect.query(fetchQuery2,
                                    function selectCb(err, results, fields) {
                                        if (err) {
                                            clientConnect.rollback(function(err){
                                                connectionDataSource.releaseConnectionPool(clientConnect);
                                                clientConnect = null;
                                                customlog.error(err);
                                                callback();
                                            });
                                        }
                                        else {
                                            for (var i in results) {
                                                clientNamesArray[i] = results[i].client_name;
                                                clientIdArray[i] = results[i].client_id;
                                            }
                                            if(pageName == 'KYC_Update' || pageName == 'KYC_Update_New'){
                                                nmiStatusCheck = constantsObj.getKYCUploaded();
                                            }else{
                                                nmiStatusCheck = constantsObj.getKYCCompleted();
                                            }

                                            if (clientIdArray.length == 0) {
                                                if(pageName == 'KYC_Update' || pageName == 'KYC_Update_New'){
                                                    var updateStatusIDForGroupQuery = "UPDATE "+dbTableName.iklantProspectGroup+"  SET " +
                                                        "status_id = " + newStatus + ",updated_date =NOW() + INTERVAL 5 HOUR + INTERVAL 30 MINUTE,needed_information = 0 " +
                                                        "WHERE group_id =" + group_id + " ";
                                                    customlog.info('update status query: '+updateStatusIDForGroupQuery)
                                                    if (clientConnect != null){
                                                        clientConnect.query(updateStatusIDForGroupQuery,
                                                            function postCreate(err) {
                                                                if (!err) {
                                                                    self.insertGroupStatusEntryDateDataModel(clientConnect,group_id,newStatus,function(status){
                                                                        self.KYC_UpdatingGCMDataModel(clientConnect,group_id,constantsObj,nmiStatusCheck,function(status){
                                                                            clientConnect.commit(function(err){
                                                                                if(err){
                                                                                    clientConnect.rollback(function(){
                                                                                        customlog.error(err);
                                                                                    });
                                                                                }
                                                                                self.updateBODashboardTable(group_id);
                                                                                customlog.info("Transaction has been Completed In KYC Data Updating Last Client");
                                                                                connectionDataSource.releaseConnectionPool(clientConnect);
                                                                                callback(successMessage, group_id, prospectClientFamilyFetchObject, prospectClient, prospectGroup, clientIdArray, clientNamesArray, lookupEntityObj, clientNameID, prospectClientPersonal, prospectClientGuarantor, prospectClientFamilyDetail, prospectClient, prospectClientHouseDetail, prospectClientBankDetail, prospectClientOtherMfiDetail, prospectClientOtherDetail, flagValue);
                                                                            });
                                                                        });
                                                                    });
                                                                } else {
                                                                    clientConnect.rollback(function(err){
                                                                        customlog.error(err);
                                                                        connectionDataSource.releaseConnectionPool(clientConnect);
                                                                        clientConnect = null;
                                                                        callback();
                                                                    });
                                                                }
                                                            }
                                                        );
                                                    }
                                                }
                                                else{
                                                    groupStatus = new Array(constantsObj.getLeaderSubLeaderUpdatedStatus(),constantsObj.getNewGroup());
                                                    var fetchQuery2 = "SELECT pc.client_id,pc.client_name,pc.status_id FROM "+dbTableName.iklantProspectClient+" pc " +
                                                        "INNER JOIN "+dbTableName.iklantProspectGroup+"  pg ON pg.group_id = pc.group_id WHERE " +
                                                        "pc.group_id = " + group_id + " and pc.is_overdue = 0 and " +
                                                        "pc.status_id IN (" + groupStatus + ")";
                                                    if (clientConnect != null) {
                                                        clientConnect.query(fetchQuery2, function selectCb(err, resultsArray, fields) {
                                                            if (err) {
                                                                clientConnect.rollback(function (err) {
                                                                    connectionDataSource.releaseConnectionPool(clientConnect);
                                                                    clientConnect = null;
                                                                    customlog.error(err);
                                                                    callback();
                                                                });
                                                            }
                                                            else {
                                                                if (resultsArray != null && resultsArray.length == 0) {
                                                                    var updateStatusIDForGroupQuery = "UPDATE "+dbTableName.iklantProspectGroup+"  SET " +
                                                                        "status_id = " + constantsObj.getRejectedKYCDataVerificationStatusId() + ",needed_information = 0,updated_date =NOW() + INTERVAL 5 HOUR + INTERVAL 30 MINUTE " +
                                                                        "WHERE group_id =" + group_id + " ";
                                                                }
                                                                else {
                                                                    groupStatus = constantsObj.getKYCUploaded();
                                                                    var fetchQuery3 = "SELECT pc.client_id,pc.client_name,pc.status_id FROM " + dbTableName.iklantProspectClient + " pc " +
                                                                        "INNER JOIN " + dbTableName.iklantProspectGroup + "  pg ON pg.group_id = pc.group_id WHERE " +
                                                                        "pc.group_id = " + group_id + " and " +
                                                                        "pc.status_id IN (" + groupStatus + ")";
                                                                    clientConnect.query(fetchQuery3, function selectCb(err, resultsDEArray, fields) {
                                                                        if (err) {
                                                                            clientConnect.rollback(function (err) {
                                                                                connectionDataSource.releaseConnectionPool(clientConnect);
                                                                                clientConnect = null;
                                                                                customlog.error(err);
                                                                                callback();
                                                                            });
                                                                        }
                                                                        else {
                                                                            if (resultsDEArray != null && resultsDEArray.length == 0) {
                                                                                var updateStatusIDForGroupQuery = "UPDATE "+dbTableName.iklantProspectGroup+"  SET " +
                                                                                    "status_id = " + newStatus + ",needed_information = 0 ,updated_date =NOW() + INTERVAL 5 HOUR + INTERVAL 30 MINUTE " +
                                                                                    "WHERE group_id =" + group_id + " ";
                                                                            } else {
                                                                                var updateStatusIDForGroupQuery = "UPDATE " + dbTableName.iklantProspectGroup + "  SET " +
                                                                                    "status_id = " + constantsObj.getKYCUploaded() + ",needed_information = 0 ,updated_date =NOW() + INTERVAL 5 HOUR + INTERVAL 30 MINUTE " +
                                                                                    "WHERE group_id =" + group_id + " ";
                                                                            }
                                                                        }
                                                                        customlog.info('update status query: '+updateStatusIDForGroupQuery);
                                                                        if (clientConnect != null){
                                                                            clientConnect.query(updateStatusIDForGroupQuery,function postCreate(err) {
                                                                                if (!err) {
                                                                                    self.insertGroupStatusEntryDateDataModel(clientConnect,group_id,newStatus,function(status){
                                                                                        self.KYC_UpdatingGCMDataModel(clientConnect,group_id,constantsObj,nmiStatusCheck,function(status){
                                                                                            clientConnect.commit(function(err){
                                                                                                if(err){
                                                                                                    clientConnect.rollback(function(err){
                                                                                                        customlog.error(err);
                                                                                                    });
                                                                                                }
                                                                                                self.updateBODashboardTable(group_id);
                                                                                                customlog.info("Transaction has been Completed In KYC Data Verification Last Client");
                                                                                                connectionDataSource.releaseConnectionPool(clientConnect);
                                                                                                callback(successMessage, group_id, prospectClientFamilyFetchObject, prospectClient, prospectGroup, clientIdArray, clientNamesArray, lookupEntityObj, clientNameID, prospectClientPersonal, prospectClientGuarantor, prospectClientFamilyDetail, prospectClient, prospectClientHouseDetail, prospectClientBankDetail, prospectClientOtherMfiDetail, prospectClientOtherDetail, flagValue);
                                                                                            });
                                                                                        });
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
                                                                        }
                                                                    });
                                                                }
                                                            }
                                                        });
                                                    }
                                                }
                                            }
                                            else {
                                                if (clientConnect != null){
                                                    self.KYC_UpdatingGCMDataModel(clientConnect,group_id,constantsObj,nmiStatusCheck,function(status){
                                                        clientConnect.commit(function(err){
                                                            if(err){
                                                                clientConnect.rollback(function(){
                                                                    customlog.error(err);
                                                                });
                                                            }
                                                            self.updateBODashboardTable(group_id);
                                                            customlog.info("transaction has been Completed In group ");
                                                            connectionDataSource.releaseConnectionPool(clientConnect);
                                                            callback(successMessage, group_id, prospectClientFamilyFetchObject, prospectClient, prospectGroup, clientIdArray, clientNamesArray, lookupEntityObj, clientNameID, prospectClientPersonal, prospectClientGuarantor, prospectClientFamilyDetail, prospectClient, prospectClientHouseDetail, prospectClientBankDetail, prospectClientOtherMfiDetail, prospectClientOtherDetail, flagValue);
                                                        });
                                                    });
                                                }
                                            }
                                        }
                                    }
                                );
                            }
                        });
                }
                //}
            });
        });

    },
    KYC_UpdatingGCMDataModel: function(clientConnect,group_id,constantsObj,nmiStatus,callback){
        var self = this;
        var fetchQueryNMI1 = "SELECT pc.client_id,pc.client_name FROM iklant_prospect_client pc "+
            "INNER JOIN iklant_prospect_group  pg ON pg.group_id = pc.group_id WHERE "+
            "pc.group_id = "+ group_id +" AND pc.status_id IN ("+ nmiStatus +")";
        console.log(fetchQueryNMI1);
        if (clientConnect != null){
            clientConnect.query(fetchQueryNMI1,function selectCb(err, results, fields) {
                if (err) {
                    clientConnect.rollback(function(err){
                        connectionDataSource.releaseConnectionPool(clientConnect);
                        clientConnect = null;
                        customlog.error(err);
                        callback('failure');
                    });
                }
                else {
                    var clientNamesNIArray = new Array();
                    var clientIdNIArray = new Array();
                    for (var i in results) {
                        clientNamesNIArray[i] = results[i].client_name;
                        clientIdNIArray[i] = results[i].client_id;
                    }
                    if (clientIdNIArray.length == 0) {
                        var fetchNMI2 = "SELECT pc.client_id,pc.client_name FROM iklant_prospect_client pc " +
                            "INNER JOIN iklant_prospect_group  pg ON pg.group_id = pc.group_id WHERE " +
                            "pc.group_id = " + group_id + " AND pc.status_id IN (" + constantsObj.getKYCVerificationStatusId() + ")";
                        if (clientConnect != null){
                            clientConnect.query(fetchNMI2,function postCreate(err,result, fields) {
                                    if (err) {
                                        clientConnect.rollback(function(err){
                                            connectionDataSource.releaseConnectionPool(clientConnect);
                                            clientConnect = null;
                                            customlog.error(err);
                                            callback('failure');
                                        });
                                    }
                                    else {
                                        var clientIdNMIArray = new Array();
                                        var clientNamesNMIArray = new Array();
                                        for (var i in result) {
                                            clientNamesNMIArray[i] = result[i].client_name;
                                            clientIdNMIArray[i] = result[i].client_id;
                                        }
                                        if (clientIdNMIArray.length >0) {
                                            var KYC_UpdatingNICGroupUpdateQuery = "UPDATE "+dbTableName.iklantProspectGroup+" SET needed_image_clarity= " + constantsObj.getNeededImageClarity() +
                                                " WHERE group_id = " + group_id + " ";
                                            customlog.info("KYC_UpdatingNICGroupUpdateQuery: " + KYC_UpdatingNICGroupUpdateQuery);
                                            if(clientConnect !=null){
                                                clientConnect.query(KYC_UpdatingNICGroupUpdateQuery, function postCreate(err) {
                                                    if (!err) {
                                                        var GCM_GroupnameQuery = "select group_name,center_name,created_by from "+dbTableName.iklantProspectGroup+" where group_id = '" + group_id + "'";
                                                        customlog.info("GCM_GroupnameQuery: " + GCM_GroupnameQuery);
                                                        if (clientConnect != null){
                                                            clientConnect.query(GCM_GroupnameQuery, function selectCb(err, results, fields) {
                                                                if (!err) {
                                                                    var groupName = results[0].group_name;
                                                                    var centerName = results[0].center_name;
                                                                    var userId = results[0].created_by;
                                                                    customlog.info("Gcm userId: " + userId);
                                                                    var Gcm_RegIdFetchQuery = "select gcm_reg_id from iklant_user_gcmdetails where user_id='" + userId + "'";
                                                                    customlog.info("Gcm_RegIdFetchQuery: " + Gcm_RegIdFetchQuery);
                                                                    if (clientConnect != null){
                                                                        clientConnect.query(Gcm_RegIdFetchQuery, function selectCb(err, results, fields) {
                                                                            if (!err && results != null && results.length > 0) {
                                                                                customlog.info(" enetr push ... ");
                                                                                var gcm = require('node-gcm');
                                                                                var message = new gcm.Message();
                                                                                var sender = new gcm.Sender(constantsObj.getGcmApiKey());
                                                                                var registrationIds = [];
                                                                                message.addData('message', groupName + " " + centerName);
                                                                                message.addData('title', 'Iklant');
                                                                                message.addData('msgcnt', '2');
                                                                                message.addData('soundname', 'beep.wav');
                                                                                message.collapseKey = 'demo';
                                                                                message.delayWhileIdle = true;
                                                                                message.timeToLive = 3000;
                                                                                registrationIds.push(results[0].gcm_reg_id);
                                                                                customlog.info(" b4 send  push ... ");
                                                                                sender.send(message, registrationIds, 4, function (err, result) {
                                                                                    customlog.info(result);
                                                                                    console.log("After send calllback got");
                                                                                    console.log(message);
                                                                                    callback('success');
                                                                                });
                                                                            }
                                                                        });
                                                                    }
                                                                } else {
                                                                    clientConnect.rollback(function(err){
                                                                        connectionDataSource.releaseConnectionPool(clientConnect);
                                                                        clientConnect = null;
                                                                        customlog.error(err);
                                                                        callback('failure');
                                                                    });
                                                                }
                                                            });
                                                        }
                                                    }else {
                                                        callback('failure');
                                                    }
                                                });
                                            }else{
                                                callback('failure');
                                            }

                                        }else{
                                            callback('success');
                                        }
                                    }
                                }
                            );
                        }
                    }else{
                        callback('success');
                    }
                }
            });
        }
    },

    KYC_UpdatingNeedImageClarityDataModel: function (tenantId, groupId, memberNameId, selectedDocTypes, remarks,reasonForHold, callback) {
        customlog.info("tenantId: " + tenantId + " groupId: " + groupId + " memberNameId: " + memberNameId + " selectedDocTypes: " + selectedDocTypes + " reasonForHold " + reasonForHold);
        var self = this;
        var constantsObj = this.constants;
        var successMessage;
        var KYC_UpdatingNICClientUpdateQuery;
        //"+dbTableName.iklantProspectClient+" status and neededImageClarityDocs update query
        if(reasonForHold == 1) {
            KYC_UpdatingNICClientUpdateQuery = "UPDATE " + dbTableName.iklantProspectClient + " SET needed_image_clarity_docs='" + selectedDocTypes + "',remarks_for_need_more_information='" + remarks + "' ,status_id= " + constantsObj.getKYCVerificationStatusId() + " " +
                "WHERE group_id=" + groupId + " AND client_id=" + memberNameId + "";
        }else{
            KYC_UpdatingNICClientUpdateQuery = "UPDATE " + dbTableName.iklantProspectClient + " SET need_rm_approval =1,remarks_for_rm_approval='" + selectedDocTypes + "' ,status_id= " + constantsObj.getNeedRMApprovalStatusId() + " " +
                "WHERE group_id=" + groupId + " AND client_id=" + memberNameId + "";
        }
            customlog.info("KYC_UpdatingNICClientUpdateQuery: " + KYC_UpdatingNICClientUpdateQuery);

        connectionDataSource.getConnection(function (clientConnect) {
            clientConnect.beginTransaction(function(err){
                clientConnect.query(KYC_UpdatingNICClientUpdateQuery, function selectCb(err,results,fields){
                    if (err) {
                        clientConnect.rollback(function(){
                            connectionDataSource.releaseConnectionPool(clientConnect);
                            clientConnect = null;
                            customlog.error(err);
                            successMessage = 'Reason for Hold Status Update failed';
                            callback(successMessage);
                        });
                    } else {
                        //var nmiStatusCheck = new Array(constantsObj.getKYCUploaded(),constantsObj.getKYCCompleted());
                        //var nmiStatusCheck = new Array(constantsObj.getKYCUploaded());
                        var nmiStatusCheck = constantsObj.getKYCUploaded();
                        self.KYC_UpdatingGCMDataModel(clientConnect,groupId,constantsObj,nmiStatusCheck,function(status){
                            if(status == 'success'){
                                clientConnect.commit(function(err){
                                    if(err){
                                        clientConnect.rollback(function(){
                                            customlog.error(err);
                                        });
                                    }
                                    self.updateBODashboardTable(groupId);
                                    successMessage = 'Reason for Hold Status Updated Successfully';
                                    connectionDataSource.releaseConnectionPool(clientConnect);
                                    callback(successMessage);
                                })
                            }else{
                                clientConnect.rollback(function(){
                                    successMessage = 'Reason for Hold Status Update failed';
                                    connectionDataSource.releaseConnectionPool(clientConnect);
                                    callback(successMessage);
                                });
                            }
                        });
                    }
                });
            });
        });
    },
    saveFOPerformanceTrackByClientCallDataModel: function (tenantId,userId,groupId,clientId,pageName,selectedDocTypes,remarks,reasonForHold,callback) {
        var constantsObj = this.constants;
        var getFOForGroupId = "SELECT created_by,`office_id` FROM `iklant_prospect_group` WHERE group_id = "+groupId;
        connectionDataSource.getConnection(function (clientConnect) {
            clientConnect.beginTransaction(function (err) {
                if (err) {
                    customlog.error(err);
                }
                if (clientConnect != null) {
                    clientConnect.query(getFOForGroupId, function selectCb(err, results, fields) {
                        if (err) {
                            clientConnect.rollback(function () {
                                customlog.error(err);
                                connectionDataSource.releaseConnectionPool(clientConnect);
                                clientConnect = null;
                                callback("Failure");
                            });

                        } else {
                            if (results.length > 0) {
                                var operationId;
                                var totalHoldDocuments = 0;
                                var docTypeArray = selectedDocTypes.split(',');
                                if (docTypeArray.length > 0) {
                                    totalHoldDocuments = docTypeArray.length;
                                }
                                if(reasonForHold == 2){ //If hold type is RM approval remarks are excluded from hold reasons
                                    totalHoldDocuments = docTypeArray.length-1;
                                }
                                if (pageName == "KYC_Update" || pageName == "KYC_Update_New") {
                                    operationId = constantsObj.getKYCUpdatingOperationId();
                                }
                                else {
                                    operationId = constantsObj.getDataVerificationOperationId();
                                }
                                var insertFOPerformanceTrack = "INSERT INTO " + dbTableName.iklantFoHoldImageTrack + " (`client_id`,`operation_id`,`office_id`,`field_officer_id`,`data_entry_by`,deo_remarks,`total_hold_documents`,`hold_documents_type`,hold_type,`created_date`) " +
                                    " VALUES (" + clientId + "," + operationId + "," + results[0].office_id + "," + results[0].created_by + "," + userId + ",'" + remarks + "'," + totalHoldDocuments + ",'" + selectedDocTypes + "', " + reasonForHold + ",NOW() + INTERVAL 5 HOUR + INTERVAL 30 MINUTE );";
                                if (clientConnect != null) {
                                    clientConnect.query(insertFOPerformanceTrack, function selectCb(error, insertResults, fields) {
                                        connectionDataSource.releaseConnectionPool(clientConnect);
                                        if (error) {
                                            clientConnect.rollback(function () {
                                                customlog.error("Failure in insert FO Track : " + error);
                                                callback("Failure");
                                            });
                                        } else {
                                            clientConnect.commit(function (err) {
                                                if (err) {
                                                    clientConnect.rollback(function () {
                                                        customlog.error(err);
                                                    });
                                                }
                                                callback("Success");
                                            });
                                        }
                                    });
                                } else {
                                    callback("Failure");
                                }
                            } else {
                                connectionDataSource.releaseConnectionPool(clientConnect);
                                callback("Failure because of GroupId results not available : " + groupId);
                            }
                        }
                    });
                }
            });
        });
    },

    listCreditReportClientsDataModel: function (groupId, callback) {
        var clientFamilyFetch = require(commonDTO +"/prospectClientFamilyFetch");
        var clientPersonal = require(commonDTO +"/prospectClientPersonal");
        var clientGuarantor = require(commonDTO +"/prospectClientGuarantor");
        var prosClient = require(commonDTO +"/prospectClient");
        var clientOtherMfiDetail = require(commonDTO +"/prospectClientOtherMfiDetail");
        var lookupEntity = require(commonDTO +"/lookupEntity");
        var self=this;
        var constantsObj = this.constants;
        var groupName;
        var groupCentreName;
        var clientNamesArray = new Array();
        var clientIdsArray = new Array();
        var prospectClientPersonalObj = new clientPersonal();
        var prospectClientObj = new prosClient();
        var prospectClientOtherMfiDetailObj = new clientOtherMfiDetail();
        var lookupEntityObj = new lookupEntity();
        var prospectGuarantorObj = new clientGuarantor();
        //Edited by chitra
        var getClientsForCreditReport = "SELECT pc.*,IF(pc.client_last_name LIKE 'mln%',pc.client_name,CONCAT(pc.client_name,' ',pc.client_last_name)) as client_names,pg.group_name,pg.center_name FROM "+dbTableName.iklantProspectClient+" pc " +
            "INNER JOIN "+dbTableName.iklantProspectGroup+" pg ON pg.group_id = " + groupId + " " +
            "LEFT JOIN "+dbTableName.iklantProspectClientDataEntryTracking+"  pcd ON pcd.`client_id` = pc.`client_id` " +
            "WHERE pc.group_id=" + groupId + " AND " +
            "pc.status_id=" + constantsObj.getDataVerificationOperationId() + " AND (pcd.`is_data_verified` = 1 OR pcd.`is_data_verified` IS NULL)";
        customlog.info("getClientsForCreditReport : " + getClientsForCreditReport);
        connectionDataSource.getConnection(function (clientConnect) {
            clientConnect.query(getClientsForCreditReport,
                function selectCb(err, results, fields) {
                    connectionDataSource.releaseConnectionPool(clientConnect);
                    if (err) {
                        customlog.error(err);
                    } else {
                        for (var i in results) {
                            groupName = results[i].group_name;
                            groupCentreName = results[i].center_name;
                            clientIdsArray[i] = results[i].client_id;
                            clientNamesArray[i] = results[i].client_names;
                        }
                    }
                    callback(groupName, groupCentreName, clientIdsArray, clientNamesArray, prospectClientObj, prospectClientPersonalObj, prospectClientOtherMfiDetailObj, lookupEntityObj,prospectGuarantorObj);
                });
        });
    },
    //Modified by Sathish Kumar M 008
    retrieveHoldClientsDataModel: function (customerId, customerLevel, clientId, callback) {
        var constantsObj = this.constants;
        var base64ImageArray = new Array();
        var docTypeNameArray = new Array();
        var docTypeIdArray = new Array();
        var docTypeNameNMCArray = new Array();
        var docTypeIdNMCArray = new Array();
        var clientIds = new Array();
        var clientNames = new Array();
        var status = "";
        var updatedBy = "";
        var remarks = "";
        var holdBy = "";
        var entryBy = "";
        var verifiedBy = "";
        var docTypeRe = -1;
        var query = "SELECT pc.client_id,pc.client_name FROM " + dbTableName.iklantProspectClient + " pc WHERE pc.group_id = " + customerId + " AND pc.status_id in(" + constantsObj.getKYCVerificationStatusId()+","+constantsObj.getNewGroup()+")";""
        connectionDataSource.getConnection(function (clientConnect) {
            clientConnect.query(query,function (err, allClient) {
                if (err) {
                    connectionDataSource.releaseConnectionPool(clientConnect);
                    callback("failure");
                    customlog.error(err);
                }
                else {
                    for(var i = 0;i<allClient.length;i++){
                        clientIds[i] = allClient[i].client_id;
                        clientNames[i] = allClient[i].client_name;
                    }
                    if(customerLevel == constantsObj.getClientLevel() && clientId != ""){
                        var clientQuery = "SELECT ipc.needed_image_clarity_docs,iu.user_name,ipc.remarks_for_need_more_information," +
                            " IFNULL((SELECT user_name FROM iklant_users WHERE user_id = ipdt.data_entry_updated_by),'') AS updated_by,"+
                            " IFNULL((SELECT user_name FROM iklant_users WHERE user_id = ipdt.data_entry_by),'') AS user_name,"+
                            " IFNULL((SELECT user_name FROM iklant_users WHERE user_id = ipdt.data_verified_by),'') AS data_verified_by,"+
                            " IFNULL((SELECT user_name FROM iklant_users LEFT JOIN iklant_fo_hold_image_track ifh ON ifh.data_entry_by = user_id WHERE user_id = ifh.data_entry_by AND ifh.created_date = (SELECT MAX(created_date) FROM iklant_fo_hold_image_track WHERE client_id = "+ clientId +") AND ifh.client_id = "+ clientId +" GROUP BY ifh.client_id),'') AS holdBy "+
                            " FROM " + dbTableName.iklantProspectClient + " ipc " +
                            " LEFT JOIN " + dbTableName.iklantProspectClientDataEntryTracking + " ipdt ON ipdt.client_id = ipc.client_id " +
                            " LEFT JOIN " + dbTableName.iklantUsers + " iu ON iu.user_id = ipdt.data_entry_by " +
                            " LEFT JOIN iklant_fo_hold_image_track ifh ON ifh.data_entry_by = iu.user_id " +
                            " WHERE ipc.client_id = " + clientId + " AND ipc.group_id = " + customerId+ "" ;
                        customlog.error("clientQuery :"+clientQuery);
                        clientConnect.query(clientQuery, function selectCb(err, clientResult) {
                            if (err) {
                                connectionDataSource.releaseConnectionPool(clientConnect);
                                customlog.error(err);
                                callback("failure");
                            }
                            else {
                                var docType = clientResult[0].needed_image_clarity_docs.split(",")
                                updatedBy = clientResult[0].updated_by;
                                entryBy = clientResult[0].user_name;
                                holdBy = clientResult[0].holdBy;
                                verifiedBy = clientResult[0].data_verified_by;
                                remarks = clientResult[0].remarks_for_need_more_information;
                                var retriveDocNameQuery = "SELECT doc_id,doc_name FROM iklant_doc_type WHERE doc_id IN (" + docType + ");"
                                clientConnect.query(retriveDocNameQuery,function selectCb(err,result,fields){
                                    if(!err){
                                        for (i in result){
                                            docTypeIdNMCArray.push(result[i].doc_id);
                                            docTypeNameNMCArray.push(result[i].doc_name);
                                        }
                                        var imageQuery = "SELECT cd.Captured_image,dt.doc_name,ipc.remarks_for_need_more_information,IF(dt.doc_id=3,1,IF(dt.doc_id=6,2,IF(dt.doc_id=8,3,IF(dt.doc_id=7,4,IF(dt.doc_id=9,5,IF(dt.doc_id=12,6,7)))))) AS doc_id FROM " + dbTableName.iklantClientDoc + " cd " +
                                            "LEFT JOIN " + dbTableName.iklantDocType + " dt ON dt.doc_id = cd.doc_type_id " +
                                            "LEFT JOIN " + dbTableName.iklantProspectClient + " ipc ON ipc.client_id = cd.client_id WHERE " +
                                            "ipc.client_id=" + clientId + " AND (doc_type_id = " + docTypeRe + " OR " + docTypeRe + " = -1 ) AND cd.loan_count = (SELECT loan_count FROM `iklant_prospect_client` WHERE client_id = " + clientId + ") ORDER BY doc_id";
                                        customlog.info("imageQuery "+imageQuery);
                                        clientConnect.query(imageQuery, function selectCb(err, results) {
                                            connectionDataSource.releaseConnectionPool(clientConnect);
                                            if (err) {
                                                customlog.error(err);
                                                callback("failure");
                                            } else {
                                                for (var i in results) {
                                                    var fieldName = results[i];
                                                    var imageLocation = fieldName.Captured_image;
                                                    docTypeNameArray[i] = fieldName.doc_name;

                                                    docTypeIdArray[i] = fieldName.doc_id;
                                                    try {
                                                        customlog.info(imageLocation);
                                                        var bitmap = fs.readFileSync(imageLocation);
                                                        base64ImageArray[i] = "data:image\/png;base64," + new Buffer(bitmap).toString('base64');
                                                    } catch (exc) {
                                                        if (exc) {
                                                            customlog.error("Exception while reading file in retrieveHoldClientsDataModel"+exc);
                                                            status = 'failure';
                                                        }
                                                    }
                                                }
                                                callback("success",clientIds,clientNames,docTypeIdArray,docTypeNameArray,base64ImageArray,updatedBy,remarks,status,holdBy,entryBy,verifiedBy,docTypeIdNMCArray,docTypeNameNMCArray);
                                            }
                                        });
                                    }else{
                                        connectionDataSource.releaseConnectionPool(clientConnect);
                                        callback("success",clientIds,clientNames,docTypeIdArray,docTypeNameArray,base64ImageArray,updatedBy,remarks,status,holdBy,entryBy,verifiedBy,docTypeIdNMCArray,docTypeNameNMCArray);
                                    }
                                });
                            }
                        });
                    }
                    else{
                        connectionDataSource.releaseConnectionPool(clientConnect);
                        callback("success",clientIds,clientNames,docTypeIdArray,docTypeNameArray,base64ImageArray,updatedBy,remarks,status,holdBy,entryBy,verifiedBy,docTypeIdNMCArray,docTypeNameNMCArray);
                    }
                }
            });
        });
    },
    KYC_UpdatingForNMIClients: function (groupId, callback) {
        var self = this;
        globalGroupIdKYC = groupId;
        var reqProspectGroup = require(commonDTO +"/prospectGroup");
        var reqProsClient = require(commonDTO +"/prospectClient");
        var lookupEntity = require(commonDTO +"/lookupEntity");
        var clientPersonal = require(commonDTO +"/prospectClientPersonal");
        var clientGuarantor = require(commonDTO +"/prospectClientGuarantor");
        var clientHouseDetail = require(commonDTO +"/prospectClientHouseDetail");
        var clientBankDetail = require(commonDTO +"/prospectClientBankDetail");
        var clientOtherMfiDetail = require(commonDTO +"/prospectClientOtherMfiDetail");
        var clientOtherDetail = require(commonDTO +"/prospectClientOtherDetail");
        var clientFamilyFetch = require(commonDTO +"/prospectClientFamilyFetch");
        var lookupEntityObj = new lookupEntity();
        var constantsObj = this.constants;
        var prospectGroup = new reqProspectGroup();
        var clientNames = new Array();
        var clientId = new Array();
        var clientId_personal = new Array();
        var flag = 0;
        var clientNameID = 0;
        var prospectClientPersonalObject = new clientPersonal();
        var prospectClientGuarantorObject = new clientGuarantor();
        var prospectClientHouseDetailObject = new clientHouseDetail();
        var prospectClientBankDetailObject = new clientBankDetail();
        var prospectClientOtherMfiDetailObject = new clientOtherMfiDetail();
        var prospectClientOtherDetailObject = new clientOtherDetail();
        var prospectClientFamilyFetchObject = new clientFamilyFetch();
        var prospectClient = new reqProsClient();
        var fetchQuery = "SELECT pg.group_name,pc.client_id,IF(pc.client_last_name LIKE 'mln%',pc.client_name,CONCAT(pc.client_name,' ',pc.client_last_name)) AS client_name,pg.center_name " +
            "FROM "+dbTableName.iklantProspectClient+" pc " +
            "INNER JOIN "+dbTableName.iklantProspectGroup+"  pg ON pg.group_id = pc.group_id " +
            "WHERE pc.group_id =" + globalGroupIdKYC + " and " +
            "pc.status_id =" + constantsObj.getNeedInformation() + "";
        connectionDataSource.getConnection(function (clientConnect) {
                clientConnect.query(fetchQuery,
                    function selectCb(err, results, fields) {
                        if (err) {
                            connectionDataSource.releaseConnectionPool(clientConnect);
                            customlog.error(err);
                        }
                        else {
                            if (results.length > 0) {
                                for (var i in results) {
                                    clientNames[i] = results[i].client_name;
                                    clientId[i] = results[i].client_id;
                                }
                                prospectGroup.clearAll();
                                prospectGroup.setGroup_name(results[0].group_name);
                                prospectGroup.setCenter_name(results[0].center_name);
                            }
                        }
                    }
                );
                //recently added
                var entityId = new Array();
                var lookupId = new Array();
                var lookupValue = new Array();
                //id
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
                //Names
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

                var lookupValueFetchQuery = "select le.entity_id,lv.lookup_id,lookup_value from "+dbTableName.iklantLookupEntity+" le " +
                    "inner join "+dbTableName.iklantLookupValue+" lv on lv.entity_id = le.entity_id ";
                clientConnect.query(lookupValueFetchQuery,
                    function selectCb(err, results, fields) {
                        if (err) {
                            connectionDataSource.releaseConnectionPool(clientConnect);
                            customlog.error(err);
                            callback();
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
                            //lookupEntityObj.setRepaymentTrackRecord(repaymentTrackRecord);
                            //lookupEntityObj.setRepaymentTrackRecordName(repaymentTrackRecordName);
                            connectionDataSource.releaseConnectionPool(clientConnect);
                            callback(groupId, prospectClientFamilyFetchObject, prospectClient, prospectGroup, clientId, clientNames, lookupEntityObj, clientNameID, prospectClientPersonalObject, prospectClientGuarantorObject, prospectClientHouseDetailObject, prospectClientBankDetailObject, prospectClientOtherMfiDetailObject, prospectClientOtherDetailObject, flag);
                        }
                    }
                );
            }
        );
    },
    KYC_UpdatingMemberForNMIClients: function (clientNameID, callback) {
        //select query for retrieving all the kyc updated datas
        var self = this;
        var constantsObj = this.constants;
        var DB_DOB;
        var flag = 0;
        var reqProspectGroup = require(commonDTO +"/prospectGroup");
        var reqProsClient = require(commonDTO +"/prospectClient");
        var clientPersonal = require(commonDTO +"/prospectClientPersonal");
        var clientGuarantor = require(commonDTO +"/prospectClientGuarantor");
        var clientHouseDetail = require(commonDTO +"/prospectClientHouseDetail");
        var clientBankDetail = require(commonDTO +"/prospectClientBankDetail");
        var clientOtherMfiDetail = require(commonDTO +"/prospectClientOtherMfiDetail");
        var clientOtherDetail = require(commonDTO +"/prospectClientOtherDetail");
        var clientFamilyFetch = require(commonDTO +"/prospectClientFamilyFetch");
        var lookupEntity = require(commonDTO +"/lookupEntity");

        var lookupEntityObj = new lookupEntity();
        var prospectGroup = new reqProspectGroup();
        var prospectClientPersonalObject = new clientPersonal();
        var prospectClientGuarantorObject = new clientGuarantor();
        var prospectClientHouseDetailObject = new clientHouseDetail();
        var prospectClientBankDetailObject = new clientBankDetail();
        var prospectClientOtherMfiDetailObject = new clientOtherMfiDetail();
        var prospectClientOtherDetailObject = new clientOtherDetail();
        var prospectClientFamilyFetchObject = new clientFamilyFetch();
        var prospectClient = new reqProsClient();

        var F_memberName = new Array();
        var F_memberGender = new Array();
        var F_memberDOB = new Array();
        var F_memberRelationship = new Array();
        var F_memberEducation = new Array();
        var F_memberOccupation = new Array();
        var F_memberIncome = new Array();

        var F_otherMfiName = new Array();
        var F_otherMfiAmount = new Array();
        var F_otherMfiOutstanding = new Array();

        var clientNameID = clientNameID;

        var groupId;

        var KYC_fetchQuery = "SELECT pcp.client_id as Mandatory,pcp.*,pcg.*,pcbd.*,pc.client_name,pc.client_last_name,pc.family_monthly_income, pc.family_monthly_expense,pc.remarks_for_need_more_information,pchd.*,pcomd.*,pcod.*,pg.* " +
            "FROM "+dbTableName.iklantProspectClient+" pc " +
            "LEFT JOIN "+dbTableName.iklantProspectClientPersonal+" pcp ON pcp.client_id = pc.client_id " +
            "LEFT JOIN "+dbTableName.iklantProspectClientGuarantor+" pcg ON pcg.client_id = pcp.client_id " +
            "LEFT JOIN "+dbTableName.iklantprospectClientBankDetail+" pcbd ON pcbd.client_id = pcp.client_id " +
            "LEFT JOIN "+dbTableName.iklantProspectClientHouseDetail+" pchd ON pchd.client_id = pcp.client_id " +
            "LEFT JOIN "+dbTableName.iklantProspectClientOtherMfiDetail+" pcomd ON pcomd.client_id = pcp.client_id " +
            "LEFT JOIN "+dbTableName.iklantProspectClientOtherDetail+" pcod ON pcod.client_id = pcp.client_id " +

            "LEFT JOIN "+dbTableName.iklantProspectGroup+" pg ON pg.group_id = pc.group_id " +
            "WHERE pc.client_id =" + clientNameID
        connectionDataSource.getConnection(function (clientConnect) {
            clientConnect.query(KYC_fetchQuery,
                function selectCb(err, results, fields) {
                    if (err) {
                        connectionDataSource.releaseConnectionPool(clientConnect);
                        customlog.error(err);
                    }
                    else {
                        //validation
                        groupId = results[0].group_id;
                        var mandatorylocal = results[0].Mandatory;
                        if (mandatorylocal == clientNameID) {
                            flag = 1; //for update

                            //groupName,center Name
                            prospectGroup.clearAll();
                            prospectGroup.setGroup_name(results[0].group_name);
                            prospectGroup.setCenter_name(results[0].center_name);
                            //personal details
                            prospectClientPersonalObject.clearAll();
                            prospectClientPersonalObject.setMembFirstName(results[0].client_name);
                            prospectClientPersonalObject.setMembLastName(results[0].client_last_name);
                            prospectClientPersonalObject.setDate_of_birth(dateUtils.formatDateForUI(results[0].date_of_birth));
                            prospectClientPersonalObject.setMobile_number(results[0].mobile_number);
                            prospectClientPersonalObject.setLandLine_number((results[0].landline_number)?results[0].landline_number:'');
                            prospectClientPersonalObject.setAddress(results[0].address);
                            prospectClientPersonalObject.setPincode(results[0].pincode);
                            prospectClientPersonalObject.setRation_card_number(results[0].ration_card_number);
                            prospectClientPersonalObject.setVoter_id(results[0].voter_id);
                            prospectClientPersonalObject.setGas_number(results[0].gas_number);
                            prospectClientPersonalObject.setAadhaar_number(results[0].aadhaar_number);
                            prospectClientPersonalObject.setIs_other_id(results[0].is_other_id);
                            prospectClientPersonalObject.setOther_id_name(results[0].other_id_name1);
                            prospectClientPersonalObject.setOther_id(results[0].other_id1);
                            prospectClientPersonalObject.setOther_id_name2((results[0].other_id_name2)?results[0].other_id_name2:'');
                            prospectClientPersonalObject.setOther_id2((results[0].other_id2)?results[0].other_id2:'');
                            prospectClientPersonalObject.setMarital_status(results[0].marital_status);
                            prospectClientPersonalObject.setReligion(results[0].religion);
                            prospectClientPersonalObject.setCaste(results[0].caste);
                            prospectClientPersonalObject.setEducational_details(results[0].educational_details);
                            prospectClientPersonalObject.setLoan_purpose(results[0].loan_purpose);
                            prospectClientPersonalObject.setBusinessCategoryId(results[0].business_category);
                            prospectClientPersonalObject.setGuardian_relationship(results[0].guardian_relationship);
                            prospectClientPersonalObject.setGuardian_name(results[0].guardian_name);
                            prospectClientPersonalObject.setGuardian_lastname(results[0].guardian_lastname);
                            prospectClientPersonalObject.setGuardian_dob(dateUtils.formatDateForUI(results[0].guardian_dob));
                            prospectClientPersonalObject.setGender(results[0].gender);
                            prospectClientPersonalObject.setNationality(results[0].nationality);
                            //REmarks For Feld Verification

                            prospectClientPersonalObject.setRemarks(results[0].remarks_for_need_more_information);

                            //guarantor details
                            prospectClientGuarantorObject.clearAll();
                            prospectClientGuarantorObject.setGuarantorName(results[0].guarantor_name);
                            prospectClientGuarantorObject.setGuarantorDob(dateUtils.formatDateForUI(results[0].guarantor_dob));
                            prospectClientGuarantorObject.setGuarantorRelationship(results[0].guarantor_relationship);
                            prospectClientGuarantorObject.setGuarantorAddress(results[0].guarantor_address);
                            prospectClientGuarantorObject.setGuarantorId(results[0].guarantor_id);
                            prospectClientGuarantorObject.setOtherGuarantorRelationshipName(results[0].other_guarantor_relationship_name);
                            if(results[0].other_guarantor_relationship_name == null){
                                prospectClientGuarantorObject.setOtherGuarantorRelationshipName("");
                            }
                            //house details
                            prospectClientHouseDetailObject.clearAll();
                            prospectClientHouseDetailObject.setHouse_type(results[0].house_type);
                            prospectClientHouseDetailObject.setTime_period(results[0].time_period);
                            prospectClientHouseDetailObject.setHouse_sqft(results[0].house_sqft);
                            //prospectClientHouseDetailObject.setHousehold_details(results[0].household_details);
                            prospectClientHouseDetailObject.setVehicle_details(results[0].vehicle_details);
                            prospectClientHouseDetailObject.setHouse_ceiling_type(results[0].house_ceiling_type);
                            prospectClientHouseDetailObject.setHouse_wall_type(results[0].house_wall_type);
                            prospectClientHouseDetailObject.setHouse_flooring_detail(results[0].house_flooring_detail);
                            prospectClientHouseDetailObject.setHouse_room_detail(results[0].house_room_detail);
                            prospectClientHouseDetailObject.setHouse_toilet(results[0].house_toilet);
                            //bank details
                            prospectClientBankDetailObject.clearAll();
                            prospectClientBankDetailObject.setIs_bank_account(results[0].is_bank_account);
                            prospectClientBankDetailObject.setIs_Savings(results[0].is_savings);
                            //prospectClientBankDetailObject.setIs_Insurance_Lifetime(results[0].is_insurance_lifetime);
                            //prospectClientBankDetailObject.setIs_Insurance_Accidental(results[0].is_insurance_accidental);
                            //prospectClientBankDetailObject.setIs_Insurance_Medical(results[0].is_insurance_medical);
                            //other mfi loan details
                            prospectClientOtherMfiDetailObject.clearAll();
                            //prospectClientOtherMfiDetailObject.setIsLoanSecured(results[0].is_loan_secured);
                            prospectClientOtherMfiDetailObject.setOtherMfiName(results[0].other_mfi_name);
                            prospectClientOtherMfiDetailObject.setOtherMfiAmountSecured(results[0].other_mfi_amount_secured);
                            prospectClientOtherMfiDetailObject.setOtherMfiLoanOutstanding(results[0].other_mfi_loan_outstanding);
                            //other details
                            prospectClientOtherDetailObject.clearAll();
                            prospectClientOtherDetailObject.setIsDeclarationAcksign(results[0].is_declaration_acksign);
                            prospectClientOtherDetailObject.setIsPledgeAcksign(results[0].is_pledge_acksign);
                            prospectClientOtherDetailObject.setIsGuarantorAcksign(results[0].is_guarantor_acksign);
                            prospectClientOtherDetailObject.setIsMemberPhotocopyAttached(results[0].is_member_photocopy_attached);
                            prospectClientOtherDetailObject.setIsGuarantorPhotocopyAttached(results[0].is_guarantor_photocopy_attached);

                            //query to fetch added family members of client

                            var KYC_familyMemberDetailsFetch = "SELECT * from "+dbTableName.iklantProspectClientFamilyDetail+" " +
                                "where client_id =" + clientNameID + "";
                            clientConnect.query(KYC_familyMemberDetailsFetch,
                                function selectCb(err, results, fields) {
                                    if (err) {
                                        connectionDataSource.releaseConnectionPool(clientConnect);
                                        customlog.error(err);
                                    }
                                    else {
                                        for (var i in results) {
                                            F_memberName.push(results[i].member_name);
                                            F_memberGender.push(results[i].member_gender);
                                            F_memberRelationship.push(results[i].member_relationship);
                                            F_memberDOB.push(results[i].member_dob);
                                            F_memberEducation.push(results[i].member_education);
                                            F_memberOccupation.push(results[i].member_occupation);
                                            F_memberIncome.push(results[i].member_income);

                                        }
                                        prospectClientFamilyFetchObject.clearAll();
                                        prospectClientFamilyFetchObject.setMember_name(F_memberName);
                                        prospectClientFamilyFetchObject.setMember_gender(F_memberGender);
                                        prospectClientFamilyFetchObject.setMember_relationship(F_memberRelationship);
                                        prospectClientFamilyFetchObject.setMember_dob(F_memberDOB);
                                        prospectClientFamilyFetchObject.setMember_education(F_memberEducation);
                                        prospectClientFamilyFetchObject.setMember_occupation(F_memberOccupation);
                                        prospectClientFamilyFetchObject.setMember_income(F_memberIncome);
                                    }
                                }
                            );

                            //query to fetch other mfi loan details for all clients

                            var KYC_otherMfiLoanDetailFetch = "SELECT * from "+dbTableName.iklantProspectClientOtherMfiDetail+" " +
                                "where client_id =" + clientNameID + "";
                            clientConnect.query(KYC_otherMfiLoanDetailFetch,
                                function selectCb(err, results, fields) {
                                    if (err) {
                                        connectionDataSource.releaseConnectionPool(clientConnect);
                                        customlog.error(err);
                                    }
                                    else {
                                        for (var i in results) {
                                            F_otherMfiName.push(results[i].other_mfi_name);
                                            F_otherMfiAmount.push(results[i].other_mfi_amount_secured);
                                            F_otherMfiOutstanding.push(results[i].other_mfi_loan_outstanding);


                                        }
                                        prospectClientOtherMfiDetailObject.clearAll();
                                        prospectClientOtherMfiDetailObject.setOtherMfiNameArrayDto(F_otherMfiName);
                                        prospectClientOtherMfiDetailObject.setOtherMfiAmountArrayDto(F_otherMfiAmount);
                                        prospectClientOtherMfiDetailObject.setOtherMfiOutstandingArrayDto(F_otherMfiOutstanding);

                                    }
                                    customlog.info("getOtherMfiNameArrayDto : " + prospectClientOtherMfiDetailObject.getOtherMfiNameArrayDto());
                                }
                            );

                            //query to fetch familymonthlyincome and familytotalexpenses
                            var KYC_IncomeExpenseFetch = "SELECT family_monthly_income,family_monthly_expense,IFNULL((SELECT user_name FROM "+dbTableName.iklantUsers+" WHERE user_id = `data_entry_updated_by`),(SELECT user_name FROM "+dbTableName.iklantUsers+" WHERE user_id = `data_entry_by`)) AS kyc_done_by," +
                                " (SELECT user_name FROM "+dbTableName.iklantUsers+" WHERE user_id = `credit_check_by`) as credit_by,(SELECT user_name FROM "+dbTableName.iklantUsers+" WHERE user_id = `data_verified_by`) as data_verified_by,is_loan_secured FROM "+dbTableName.iklantProspectClient+
                                " pc LEFT JOIN "+dbTableName.iklantProspectClientDataEntryTracking+" pcd ON pcd.client_id = pc.client_id " +
                                "  where pc.client_id=" + clientNameID + "";
                            clientConnect.query(KYC_IncomeExpenseFetch,
                                function selectCb(err, results, fields) {
                                    if (err) {
                                        connectionDataSource.releaseConnectionPool(clientConnect);
                                        customlog.error(err);
                                    }
                                    else {
                                        prospectClient.clearAll();
                                        prospectClient.setKYC_Updated_By(results[0].kyc_done_by);
                                        prospectClient.setCredited_By(results[0].credit_by);
                                        prospectClient.setDataVerified_By(results[0].data_verified_by);
                                        prospectClient.setIs_loan_secured(results[0].is_loan_secured);
                                        //prospectClient.setRepaymentTrackRecord(results[0].loan_repayment_track_record);
                                        prospectClient.setFamily_monthly_income(results[0].family_monthly_income);
                                        prospectClient.setFamily_monthly_expense(results[0].family_monthly_expense);
                                    }
                                }
                            );
                        }
                        else {
                            flag = 0; //for insert
                            prospectClient.clearAll();
                            prospectClientFamilyFetchObject.clearAll();
                            prospectClientPersonalObject.clearAll();
                            prospectClientGuarantorObject.clearAll();
                            prospectClientHouseDetailObject.clearAll();
                            prospectClientBankDetailObject.clearAll();
                            prospectClientOtherMfiDetailObject.clearAll();
                            prospectClientOtherDetailObject.clearAll();
                        }

                        var clientNames = new Array();
                        var clientId = new Array();
                        var fetchQuery1 = "SELECT pc.client_id,IF(pc.client_last_name LIKE 'mln%',pc.client_name,CONCAT(pc.client_name,' ',pc.client_last_name)) AS client_name FROM "+dbTableName.iklantProspectClient+" pc " +
                            "INNER JOIN "+dbTableName.iklantProspectGroup+" pg ON pg.group_id = pc.group_id " +
                            "WHERE pc.group_id = " + groupId + " and " +
                            "pc.status_id = " + constantsObj.getNeedInformation() + "";
                        customlog.info("fetchQuery1 : " + fetchQuery1);
                        clientConnect.query(fetchQuery1,
                            function selectCb(err, results, fields) {
                                connectionDataSource.releaseConnectionPool(clientConnect);
                                if (err) {
                                    customlog.error(err);
                                    callback();
                                }
                                else {
                                    for (var i in results) {
                                        clientNames[i] = results[i].client_name;
                                        clientId[i] = results[i].client_id;
                                    }
                                    callback(groupId, prospectClientFamilyFetchObject, prospectClient, prospectGroup, clientId, clientNames, lookupEntityObj, clientNameID, prospectClientPersonalObject, prospectClientGuarantorObject, prospectClientHouseDetailObject, prospectClientBankDetailObject, prospectClientOtherMfiDetailObject, prospectClientOtherDetailObject, flag);
                                }
                            }
                        );
                    }
                }
            );
        });
    },
    saveKYC_UpdatingForNMIClients: function (deletedMembers, deletedMemberRelation, deletedMemberIncome, flagValue, prospectClientPersonal, prospectClientGuarantor, prospectClientFamilyDetail, prospectClient, prospectClientHouseDetail, prospectClientBankDetail, prospectClientOtherMfiDetail, prospectClientOtherDetail, callback) {
        //GLOBAL VARIABLES
        var self = this;
        var constantsObj = this.constants;
        var reqProspectGroup = require(commonDTO +"/prospectGroup");
        var clientId = prospectClientPersonal.getClient_id();

        connectionDataSource.getConnection(function (clientConnect) {
            clientConnect.beginTransaction(function(err){
                if(err){
                    customlog.error(err);
                }
                if (flagValue == 0) {
                    //INSERT QUERY FOR MEMBER PERSONAL DETAILS
                    var KYC_memberPersonalDetails = "INSERT INTO "+dbTableName.iklantProspectClientPersonal+" (client_id,date_of_birth, " +
                        "mobile_number,landline_number,address,pincode,ration_card_number,voter_id,gas_number, " +
                        "aadhaar_number,is_other_id,other_id_name1,other_id1,other_id_name2,other_id2,marital_status,religion, " +
                        "caste,educational_details,loan_purpose,business_category,guardian_relationship,guardian_name, " +
                        "guardian_lastname,guardian_dob,gender,nationality) VALUES " +
                        "('" + clientId + "', '" + prospectClientPersonal.getDate_of_birth() + "', " +
                        "'" + prospectClientPersonal.getMobile_number() + "','" + prospectClientPersonal.getLandline_number() + "', " +
                        "'" + prospectClientPersonal.getAddress() + "','" + prospectClientPersonal.getPincode() + "', " +
                        "'" + prospectClientPersonal.getRation_card_number() + "', " +
                        "'" + prospectClientPersonal.getVoter_id() + "','" + prospectClientPersonal.getGas_number() + "', " +
                        "'" + prospectClientPersonal.getAadhaar_number() + "', " +
                        "'" + prospectClientPersonal.getIs_other_id() + "', " +
                        "'" + prospectClientPersonal.getOther_id_name() + "', " +
                        "'" + prospectClientPersonal.getOther_id() + "', " +
                        "'" + prospectClientPersonal.getOther_id_name2() + "', " +
                        "'" + prospectClientPersonal.getOther_id2() + "', " +
                        "'" + prospectClientPersonal.getMarital_status() + "', " +
                        "'" + prospectClientPersonal.getReligion() + "','" + prospectClientPersonal.getCaste() + "', " +
                        "'" + prospectClientPersonal.getEducational_details() + "', " +
                        "'" + prospectClientPersonal.getLoan_purpose() + "', " +
                        "'" + prospectClientPersonal.getBusinessCategoryId() + "', " +
                        "'" + prospectClientPersonal.getGuardian_relationship() + "', " +
                        "'" + prospectClientPersonal.getGuardian_name() + "', " +
                        "'" + prospectClientPersonal.getGuardian_lastname() + "', " +
                        "'" + prospectClientPersonal.getGuardian_dob() + "','" + prospectClientPersonal.getGender() + "', " +
                        "'" + prospectClientPersonal.getNationality() + "')";
                    if(clientConnect !=null){
                        clientConnect.query(KYC_memberPersonalDetails,
                            function postCreate(err) {
                                if (err){
                                    clientConnect.rollback(function(){
                                        connectionDataSource.releaseConnectionPool(clientConnect);
                                        customlog.error(err);
                                        clientConnect = null;
                                    });
                                }
                            }
                        );
                    }


                    //INSERT QUERY FOR GUARANTOR DETAILS
                    var KYC_guarantorDetails = "INSERT INTO "+dbTableName.iklantProspectClientGuarantor+" (client_id,guarantor_name, " +
                        "guarantor_dob,guarantor_relationship,guarantor_address,guarantor_id,other_guarantor_relationship_name) VALUES " +
                        "('" + clientId + "', '" + prospectClientGuarantor.getGuarantorName() + "', " +
                        "'" + prospectClientGuarantor.getGuarantorDob() + "', " +
                        "'" + prospectClientGuarantor.getGuarantorRelationship() + "', " +
                        "'" + prospectClientGuarantor.getGuarantorAddress() + "', " +
                        "'" + prospectClientGuarantor.getGuarantorId() + "', '" + prospectClientGuarantor.getOtherGuarantorRelationshipName() + "')";
                    if(clientConnect !=null){
                        clientConnect.query(KYC_guarantorDetails,
                            function postCreate(err) {
                                if (err){
                                    clientConnect.rollback(function(){
                                        connectionDataSource.releaseConnectionPool(clientConnect);
                                        customlog.error(err);
                                        clientConnect = null;
                                    });
                                }
                            }
                        );
                    }

                    //INSERT QUERY FOR FAMILY DETAILS(POPUP)
                    var family_member_name_array = (prospectClientFamilyDetail.getMember_name()).split(',');
                    var member_gender_array = (prospectClientFamilyDetail.getMember_gender()).split(',');
                    var member_relationship_array = (prospectClientFamilyDetail.getMember_relationship()).split(',');
                    var member_age_array = (prospectClientFamilyDetail.getMember_dob()).split(',');
                    var member_education_array = (prospectClientFamilyDetail.getMember_education()).split(',');
                    var member_occupation_array = (prospectClientFamilyDetail.getMember_occupation()).split(',');
                    var member_income_array = (prospectClientFamilyDetail.getMember_income()).split(',');
                    var member_relationship_name_array = (prospectClientFamilyDetail.getMemberRelationshipName()).split(',');

                    for (var k = 0; k < member_age_array.length; k++) {
                        if (member_age_array[k] == '' || member_age_array[k] == '0000-00-00') {
                            member_age_array[k] = '0000-00-00';
                            customlog.info(member_age_array[k] + "---------if");
                        }
                        else {
                            customlog.info(member_age_array[k] + "---------else");
                            member_age_array[k] = dateUtils.formatDate(member_age_array[k]);
                        }
                    }

                    if (family_member_name_array[0] != "") {
                        for (var i = 0; i < family_member_name_array.length; i++) {
                            var KYC_familyDetailsPopup = "INSERT INTO "+dbTableName.iklantProspectClientFamilyDetail+" (client_id,member_name, " +
                                "member_gender,member_relationship,member_dob,member_education, " +
                                "member_occupation,member_income,other_family_relationship_name) VALUES " +
                                "('" + clientId + "', '" + family_member_name_array[i] + "', " +
                                "'" + member_gender_array[i] + "','" + member_relationship_array[i] + "', " +
                                "'" + member_age_array[i] + "','" + member_education_array[i] + "', " +
                                "'" + member_occupation_array[i] + "','" + member_income_array[i] + "','" + member_relationship_name_array[i] + "')";
                            if(clientConnect != null){
                                clientConnect.query(KYC_familyDetailsPopup,
                                    function postCreate(err) {
                                        if (err) {
                                            clientConnect.rollback(function(){
                                                customlog.error(err);
                                                connectionDataSource.releaseConnectionPool(clientConnect);
                                                clientConnect = null;
                                            });

                                        }
                                    }
                                );
                            }
                        }
                    }

                    //UPDATE QUERY FOR FAMILY DETAILS
                    var KYC_familyDetails = "UPDATE "+dbTableName.iklantProspectClient+" SET " +
                        "family_monthly_income = '" + prospectClient.getFamily_monthly_income() + "', " +
                        "family_monthly_expense = '" + prospectClient.getFamily_monthly_expense() + "', " +
                        "is_loan_secured = '" + prospectClient.getIs_loan_secured() + "',updated_date=NOW() + INTERVAL 5 HOUR + INTERVAL 30 MINUTE " +
                        "WHERE client_id='" + clientId + "'";
                    if(clientConnect !=null){
                        clientConnect.query(KYC_familyDetails,
                            function postCreate(err) {
                                if (err){
                                    clientConnect.rollback(function(){
                                        customlog.error(err);
                                        connectionDataSource.releaseConnectionPool(clientConnect);
                                        clientConnect = null;
                                    });
                                }
                            }
                        );
                    }

                    //INSERT QUERY FOR HOUSE DETAILS
                    var KYC_houseDetails = "INSERT INTO "+dbTableName.iklantProspectClientHouseDetail+" (client_id,house_type, " +
                        "time_period,house_sqft,vehicle_details,house_ceiling_type,house_wall_type, " +
                        "house_flooring_detail,house_room_detail,house_toilet) VALUES " +
                        "('" + clientId + "', '" + prospectClientHouseDetail.getHouse_type() + "', " +
                        "'" + prospectClientHouseDetail.getTime_period() + "', " +
                        "'" + prospectClientHouseDetail.getHouse_sqft() + "', " +
                        "'" + prospectClientHouseDetail.getVehicle_details() + "', " +
                        "'" + prospectClientHouseDetail.getHouse_ceiling_type() + "', " +
                        "'" + prospectClientHouseDetail.getHouse_wall_type() + "', " +
                        "'" + prospectClientHouseDetail.getHouse_flooring_detail() + "', " +
                        "'" + prospectClientHouseDetail.getHouse_room_detail() + "', " +
                        "'" + prospectClientHouseDetail.getHouse_toilet() + "')";
                    if(clientConnect !=null){
                        clientConnect.query(KYC_houseDetails,
                            function postCreate(err) {
                                if (err){
                                    clientConnect.rollback(function(){
                                        customlog.error(err);
                                        connectionDataSource.releaseConnectionPool(clientConnect);
                                        clientConnect = null;
                                    });
                                }
                            }
                        );
                    }

                    //INSERT QUERY FOR BANK DETAILS
                    var KYC_bankDetails = "INSERT INTO "+dbTableName.iklantprospectClientBankDetail+" (client_id,is_bank_account, " +
                        "is_savings) VALUES " +
                        "('" + clientId + "', '" + prospectClientBankDetail.getIs_bank_account() + "', " +
                        "'" + prospectClientBankDetail.getIs_Savings() + "')";
                    if(clientConnect !=null){
                        clientConnect.query(KYC_bankDetails,
                            function postCreate(err) {
                                if (err) {
                                    clientConnect.rollback(function(){
                                        customlog.error(err);
                                        connectionDataSource.releaseConnectionPool(clientConnect);
                                        clientConnect = null;
                                    });
                                }
                            }
                        );
                    }

                    //INSERT QUERY FOR OTHER MFI LOAN DETAILS
                    var OtherMfiNameArray = new Array();
                    var OtherMfiAmountHiddenArray = new Array();
                    var OtherMfiOutstandingArray = new Array();

                    OtherMfiNameArray = (prospectClientOtherMfiDetail.getOtherMfiName()).split(',');
                    OtherMfiAmountHiddenArray = (prospectClientOtherMfiDetail.getOtherMfiAmountSecured()).split(',');
                    OtherMfiOutstandingArray = (prospectClientOtherMfiDetail.getOtherMfiLoanOutstanding()).split(',');

                    //insert query for loansecured Checkbox
                    if (OtherMfiNameArray[0] != "") {
                        for (var i = 0; i < OtherMfiNameArray.length; i++) {

                            var KYC_otherMfiLoanDetails = "INSERT INTO "+dbTableName.iklantProspectClientOtherMfiDetail+" (client_id,other_mfi_name,other_mfi_amount_secured,other_mfi_loan_outstanding) VALUES " +
                                "('" + clientId + "', '" + OtherMfiNameArray[i] + "', '" + OtherMfiAmountHiddenArray[i] + "','" + OtherMfiOutstandingArray[i] + "')";
                            if(clientConnect !=null){
                                clientConnect.query(KYC_otherMfiLoanDetails,
                                    function postCreate(err) {
                                        if (err) {
                                            clientConnect.rollback(function(){
                                                customlog.error(err);
                                                connectionDataSource.releaseConnectionPool(clientConnect);
                                                clientConnect = null;
                                            });
                                        }
                                    }
                                );
                            }
                        }
                    }

                    //INSERT QUERY FOR OTHER DETAILS
                    var KYC_otherDetails = "INSERT INTO "+dbTableName.iklantProspectClientOtherDetail+" (client_id,is_declaration_acksign,is_pledge_acksign,is_guarantor_acksign,is_member_photocopy_attached,is_guarantor_photocopy_attached) VALUES " +
                        "('" + clientId + "', '" + prospectClientOtherDetail.getIsDeclarationAcksign() + "', '" + prospectClientOtherDetail.getIsPledgeAcksign() + "', '" + prospectClientOtherDetail.getIsGuarantorAcksign() + "','" + prospectClientOtherDetail.getIsMemberPhotocopyAttached() + "','" + prospectClientOtherDetail.getIsGuarantorPhotocopyAttached() + "')";
                    if(clientConnect !=null){
                        clientConnect.query(KYC_otherDetails,
                            function postCreate(err) {
                                if (err) {
                                    clientConnect.rollback(function(){
                                        customlog.error(err);
                                        connectionDataSource.releaseConnectionPool(clientConnect);
                                        clientConnect = null;
                                    });
                                }
                            }
                        );
                    }
                }
                else if (flagValue == 1) {
                    //update query starts here
                    //update query for MEMBER PERSONAL DETAILS
                    var memberPersonalUpdate = "update "+dbTableName.iklantProspectClientPersonal+"  set date_of_birth = '" + prospectClientPersonal.getDate_of_birth() + "', " +
                        "mobile_number = '" + prospectClientPersonal.getMobile_number() + "' ,landline_number = '" + prospectClientPersonal.getLandline_number() + "' , address = '" + prospectClientPersonal.getAddress() + "' , " +
                        "pincode = '" + prospectClientPersonal.getPincode() + "' , ration_card_number =  '" + prospectClientPersonal.getRation_card_number() + "' , " +
                        "voter_id = '" + prospectClientPersonal.getVoter_id() + "' , gas_number =  '" + prospectClientPersonal.getGas_number() + "' , " +
                        "aadhaar_number = '" + prospectClientPersonal.getAadhaar_number() + "' ,is_other_id = '" + prospectClientPersonal.getIs_other_id() + "' , " +
                        "other_id_name1 = '" + prospectClientPersonal.getOther_id_name() + "', other_id1=  '" + prospectClientPersonal.getOther_id() + "' , " +
                        "other_id_name2 = '" + prospectClientPersonal.getOther_id_name2() + "', other_id2=  '" + prospectClientPersonal.getOther_id2() + "' , " +
                        "marital_status = '" + prospectClientPersonal.getMarital_status() + "' , religion = '" + prospectClientPersonal.getReligion() + "' , " +
                        "caste = '" + prospectClientPersonal.getCaste() + "' ,educational_details =  '" + prospectClientPersonal.getEducational_details() + "' , " +
                        "loan_purpose = '" + prospectClientPersonal.getLoan_purpose() + "' , guardian_relationship = '" + prospectClientPersonal.getGuardian_relationship() + "' , " +
                        "business_category = '" + prospectClientPersonal.getBusinessCategoryId() + "' ,"+
                        "guardian_name = '" + prospectClientPersonal.getGuardian_name() + "' ,guardian_lastname = '" + prospectClientPersonal.getGuardian_lastname() + "', " +
                        "guardian_dob = '" + prospectClientPersonal.getGuardian_dob() + "' , gender = '" + prospectClientPersonal.getGender() + "' , " +
                        "nationality = '" + prospectClientPersonal.getNationality() + "' " +
                        "where client_id =" + clientId;
                    if(clientConnect !=null){
                        clientConnect.query(memberPersonalUpdate,
                            function updateDetail(err) {
                                if (err) {
                                    clientConnect.rollback(function(){
                                        customlog.error(err);
                                        connectionDataSource.releaseConnectionPool(clientConnect);
                                        clientConnect = null;
                                    });

                                }
                            }
                        );

                    }

                    //update query for MEMBER GUARANTOR DETAILS
                    var guarantorUpdate = "update "+dbTableName.iklantProspectClientGuarantor+" set guarantor_name = '" + prospectClientGuarantor.getGuarantorName() + "' , " +
                        "guarantor_dob = '" + prospectClientGuarantor.getGuarantorDob() + "' , guarantor_relationship = '" + prospectClientGuarantor.getGuarantorRelationship() + "' , " +
                        "guarantor_address = '" + prospectClientGuarantor.getGuarantorAddress() + "',guarantor_id = '" + prospectClientGuarantor.getGuarantorId() + "' , other_guarantor_relationship_name = '" + prospectClientGuarantor.getOtherGuarantorRelationshipName()+ "' " +
                        "where client_id =" + clientId;
                    if(clientConnect !=null){
                        clientConnect.query(guarantorUpdate,
                            function updateDetail(err) {
                                if (err) {
                                    clientConnect.rollback(function(){
                                        customlog.error(err);
                                        connectionDataSource.releaseConnectionPool(clientConnect);
                                        clientConnect = null;
                                    });
                                }
                            }
                        );
                    }

                    //update for family details popup
                    var family_member_name_array = (prospectClientFamilyDetail.getMember_name()).split(',');
                    var member_gender_array = (prospectClientFamilyDetail.getMember_gender()).split(',');
                    var member_relationship_array = (prospectClientFamilyDetail.getMember_relationship()).split(',');
                    var member_age_array = (prospectClientFamilyDetail.getMember_dob()).split(',');
                    var member_education_array = (prospectClientFamilyDetail.getMember_education()).split(',');
                    var member_occupation_array = (prospectClientFamilyDetail.getMember_occupation()).split(',');
                    var member_income_array = (prospectClientFamilyDetail.getMember_income()).split(',');
                    var member_relationship_name_array = (prospectClientFamilyDetail.getMemberRelationshipName()).split(',');

                    for (var k = 0; k < member_age_array.length; k++) {
                        if (member_age_array[k] == '' || member_age_array[k] == '0000-00-00') {
                            member_age_array[k] = '0000-00-00';
                            customlog.info(member_age_array[k] + "---------if");
                        }
                        else {
                            customlog.info(member_age_array[k] + "---------else");
                            member_age_array[k] = dateUtils.formatDate(member_age_array[k]);
                        }
                    }

                    if (family_member_name_array[0] != "") {
                        for (var i = 0; i < family_member_name_array.length; i++) {
                            var familyDetailsPopupUpdate = "INSERT INTO "+dbTableName.iklantProspectClientFamilyDetail+" (client_id,member_name,member_gender,member_relationship,member_dob,member_education,member_occupation,member_income,other_family_relationship_name) VALUES " +
                                "('" + clientId + "', '" + family_member_name_array[i] + "', '" + member_gender_array[i] + "', '" + member_relationship_array[i] + "','" + member_age_array[i] + "','" + member_education_array[i] + "','" + member_occupation_array[i] + "','" + member_income_array[i] + "','" + member_relationship_name_array[i] + "')";
                            if(clientConnect !=null){
                                clientConnect.query(familyDetailsPopupUpdate,
                                    function updateDetail(err) {
                                        if (err) {
                                            clientConnect.rollback(function(){
                                                customlog.error(err);
                                                connectionDataSource.releaseConnectionPool(clientConnect);
                                                clientConnect = null;
                                            });
                                        }
                                    }
                                );
                            }
                        }
                    }
                    //UPDATE QUERY FOR FAMILY DETAILS
                    var familyDetailsUpdate = "UPDATE "+dbTableName.iklantProspectClient+" SET family_monthly_income = '" + prospectClient.getFamily_monthly_income() + "',family_monthly_expense = '" + prospectClient.getFamily_monthly_expense() + "', is_loan_secured = '" + prospectClient.getIs_loan_secured() + "',updated_date=NOW() + INTERVAL 5 HOUR + INTERVAL 30 MINUTE WHERE client_id=" + clientId;
                    if(clientConnect !=null){
                        clientConnect.query(familyDetailsUpdate,
                            function updateDetail(err) {
                                if (err) {
                                    clientConnect.rollback(function(){
                                        customlog.error(err);
                                        connectionDataSource.releaseConnectionPool(clientConnect);
                                        clientConnect =null;
                                    });
                                }
                            }
                        );
                    }

                    //DELETE QUERY FOR FAMILY DETAILS MEMBER DELETED
                    var deletedMembersAray = deletedMembers.split(',');
                    var deletedMemberRelationArray = deletedMemberRelation.split(',');
                    var deletedMemberIncomeArray = deletedMemberIncome.split(',');
                    for (var i = 0; i < deletedMembersAray.length; i++) {
                        var familyDetailsDelete = "delete from "+dbTableName.iklantProspectClientFamilyDetail+"  " +
                            "where member_name ='" + deletedMembersAray[i] + "' AND client_id ='" + clientId + "' AND member_relationship='" + deletedMemberRelationArray[i] + "' AND member_income='" + deletedMemberIncomeArray[i] + "'";
                        if(clientConnect !=null){
                            clientConnect.query(familyDetailsDelete,
                                function deleteDetail(err) {
                                    if (err) {
                                        clientConnect.rollback(function(){
                                            customlog.error(err);
                                            connectionDataSource.releaseConnectionPool(clientConnect);
                                            clientConnect =null;
                                        });
                                    }
                                }
                            );
                        }
                    }

                    //UPDATE QUERY FOR HOUSE DETAILS
                    var houseDetailsUpdate = "update "+dbTableName.iklantProspectClientHouseDetail+"  set house_type = '" + prospectClientHouseDetail.getHouse_type() + "', " +
                        "time_period = '" + prospectClientHouseDetail.getTime_period() + "' ,house_sqft = '" + prospectClientHouseDetail.getHouse_sqft() + "' , " +
                        "vehicle_details = '" + prospectClientHouseDetail.getVehicle_details() + "' , house_ceiling_type = '" + prospectClientHouseDetail.getHouse_ceiling_type() + "' , " +
                        "house_wall_type = '" + prospectClientHouseDetail.getHouse_wall_type() + "' ,house_flooring_detail = '" + prospectClientHouseDetail.getHouse_flooring_detail() + "' , " +
                        "house_room_detail = '" + prospectClientHouseDetail.getHouse_room_detail() + "' ,house_toilet = '" + prospectClientHouseDetail.getHouse_toilet() + "' " +
                        "where client_id =" + clientId;

                    if(clientConnect !=null){
                        clientConnect.query(houseDetailsUpdate,
                            function updateDetail(err) {
                                if (err) {
                                    clientConnect.rollback(function(){
                                        customlog.error(err);
                                        connectionDataSource.releaseConnectionPool(clientConnect);
                                        clientConnect = null;
                                    });
                                }
                            }
                        );
                    }

                    //UPDATE QUERY FOR BANK DETAILS
                    var bankDetailsUpdate = "update "+dbTableName.iklantprospectClientBankDetail+"  set	is_bank_account = '" + prospectClientBankDetail.getIs_bank_account() + "' , " +
                        "is_savings = '" + prospectClientBankDetail.getIs_Savings() + "' " +
                        "where client_id =" + clientId;

                    if(clientConnect !=null){
                        clientConnect.query(bankDetailsUpdate,
                            function updateDetail(err) {
                                if (err){
                                    clientConnect.rollback(function(){
                                        customlog.error(err);
                                        connectionDataSource.releaseConnectionPool(clientConnect);
                                        clientConnect =null;
                                    });
                                }
                            }
                        );
                    }

                    //UPDATE QUERY FOR OTHER MFI LOAN DETAILS
                    var OtherMfiNameArray = new Array();
                    var OtherMfiAmountHiddenArray = new Array();
                    var OtherMfiOutstandingArray = new Array();

                    OtherMfiNameArray = (prospectClientOtherMfiDetail.getOtherMfiName()).split(',');
                    OtherMfiAmountHiddenArray = (prospectClientOtherMfiDetail.getOtherMfiAmountSecured()).split(',');
                    OtherMfiOutstandingArray = (prospectClientOtherMfiDetail.getOtherMfiLoanOutstanding()).split(',');

                    if (OtherMfiNameArray[0] != "") {
                        for (var i = 0; i < OtherMfiNameArray.length; i++) {

                            var otherMfiDetailsUpdate = "INSERT INTO "+dbTableName.iklantProspectClientOtherMfiDetail+" (client_id,other_mfi_name,other_mfi_amount_secured,other_mfi_loan_outstanding) VALUES " +
                                "('" + clientId + "', '" + OtherMfiNameArray[i] + "', '" + OtherMfiAmountHiddenArray[i] + "','" + OtherMfiOutstandingArray[i] + "')";
                            if(clientConnect !=null){
                                clientConnect.query(otherMfiDetailsUpdate,
                                    function updateDetail(err) {
                                        if (err) {
                                            clientConnect.rollback(function(){
                                                customlog.error(err);
                                                connectionDataSource.releaseConnectionPool(clientConnect);
                                                clientConnect =null;
                                            });
                                        }
                                    }
                                );
                            }
                        }
                    }
                    //DELETE QUERY FOR OTHER MFI LOAN NAME DELETED
                    var deletedOtherMfiLoanNamesArray = prospectClientOtherMfiDetail.getDeletedOtherMfiLoanClientNames().split(',');
                    var deletedOtherMfiLoanAmtSecuredArray = prospectClientOtherMfiDetail.getDeletedOtherMfiLoanClientAmtSecured().split(',');
                    var deletedOtherMfiLoanOutstandingArray = prospectClientOtherMfiDetail.getDeletedOtherMfiLoanClientOutstanding().split(',');
                    customlog.info("Deleted clients of other mfi : " + deletedOtherMfiLoanNamesArray);
                    for (var i = 0; i < deletedOtherMfiLoanNamesArray.length; i++) {
                        var otherMfiLoanNameDelete = "delete from "+dbTableName.iklantProspectClientOtherMfiDetail+"  " +
                            "where other_mfi_name ='" + deletedOtherMfiLoanNamesArray[i] + "'AND other_mfi_amount_secured='" + deletedOtherMfiLoanAmtSecuredArray[i] + "' AND other_mfi_loan_outstanding='" + deletedOtherMfiLoanOutstandingArray[i] + "' AND client_id =" + clientId;
                        if(clientConnect !=null){
                            clientConnect.query(otherMfiLoanNameDelete,
                                function deleteDetail(err) {
                                    if (err) {
                                        clientConnect.rollback(function(){
                                            customlog.error(err);
                                            connectionDataSource.releaseConnectionPool(clientConnect);
                                            clientConnect = null;
                                        });
                                    }
                                }
                            );
                        }
                    }

                    //UPDATE QUERY FOR OTHER DETAILS
                    var otherDetailsUpdate = "update "+dbTableName.iklantProspectClientOtherDetail+"  set " +
                        "is_declaration_acksign = '" + prospectClientOtherDetail.getIsDeclarationAcksign() + "' , " +
                        "is_pledge_acksign =  '" + prospectClientOtherDetail.getIsPledgeAcksign() + "' , " +
                        "is_guarantor_acksign = '" + prospectClientOtherDetail.getIsGuarantorAcksign() + "' , " +
                        "is_member_photocopy_attached = '" + prospectClientOtherDetail.getIsMemberPhotocopyAttached() + "' , " +
                        "is_guarantor_photocopy_attached = '" + prospectClientOtherDetail.getIsGuarantorPhotocopyAttached() + "' " +
                        "where client_id =" + clientId;

                    if(clientConnect !=null){
                        clientConnect.query(otherDetailsUpdate,
                            function updateDetail(err) {
                                if (err) {
                                    clientConnect.rollback(function(){
                                        customlog.error(err);
                                        connectionDataSource.releaseConnectionPool(clientConnect);
                                        clientConnect = null;
                                    });
                                }
                            }
                        );
                    }
                }

                //select query
                var selectQuery = "select pc.client_id, pc.group_id,pg.group_name from "+dbTableName.iklantProspectClient+" pc " +
                    "inner join "+dbTableName.iklantProspectGroup+"  pg on pg.group_id = pc.group_id  " +
                    "where client_id =" + clientId
                if(clientConnect !=null){
                    clientConnect.query(selectQuery,
                        function selectCb(err, results, fields) {
                            if (err) {
                                clientConnect.rollback(function(){
                                    connectionDataSource.releaseConnectionPool(clientConnect);
                                    customlog.error(err);
                                    clientConnect = null;
                                });
                            }
                            else {
                                for (var i in results) {
                                    groupIdForKyc = results[i].group_id;
                                    memberNameId = results[i].client_id;
                                    groupNameForKyc = results[i].group_name;
                                }
                            }
                            var updateQuery = "UPDATE "+dbTableName.iklantProspectClient+"  SET status_id = if(is_overdue=0, " +
                                "" + constantsObj.getAssignedFO() + ",status_id),updated_date =NOW() + INTERVAL 5 HOUR + INTERVAL 30 MINUTE " +
                                "where client_id= " + clientId;
                            if(clientConnect !=null){
                                clientConnect.query(updateQuery,
                                    function postCreate(err) {
                                        if (err) {
                                            clientConnect.rollback(function(){
                                                customlog.error(err);
                                                connectionDataSource.releaseConnectionPool(clientConnect);
                                                clientConnect = null;
                                            });
                                        }
                                    });
                            }

                            var groupstatus_id;
                            var retrieveClientList = "select client_id,status_id from "+dbTableName.iklantProspectClient+"  " +
                                "where group_id = " + groupIdForKyc + "";
                            if(clientConnect !=null){
                                clientConnect.query(retrieveClientList, function selectCb(err, results, fields) {
                                    if (err) {
                                        clientConnect.rollback(function(){
                                            connectionDataSource.releaseConnectionPool(clientConnect);
                                            customlog.error(err);
                                            clientConnect = null;
                                        });

                                    } else {
                                        for (var i in results) {
                                            var fieldName = results[i];
                                            if (fieldName.status_id == constantsObj.getAssignedFO()) {
                                                groupstatus_id = constantsObj.getAssignedFO();
                                            }
                                            else if (fieldName.status_id == constantsObj.getNeedInformation()) {
                                                groupstatus_id = constantsObj.getKYCUploaded();
                                                break;
                                            }
                                        }
                                    }
                                    if (groupstatus_id == constantsObj.getAssignedFO()) {
                                        var updateStatusIDForGroupQuery = "UPDATE "+dbTableName.iklantProspectGroup+"  SET status_id = " + groupstatus_id + ",needed_information = 0,updated_date=NOW() + INTERVAL 5 HOUR + INTERVAL 30 MINUTE WHERE group_id =" + groupIdForKyc + " ";
                                        if(clientConnect !=null){
                                            clientConnect.query(updateStatusIDForGroupQuery,
                                                function postCreate(err) {
                                                    if (err) {
                                                        clientConnect.rollback(function(){
                                                            customlog.error(err);
                                                            connectionDataSource.releaseConnectionPool(clientConnect);
                                                            clientConnect =null;
                                                        });
                                                    }
                                                });
                                        }
                                    }

                                    var clientFamilyFetch = require(commonDTO +"/prospectClientFamilyFetch");
                                    var prospectClientFamilyFetchObject = new clientFamilyFetch();
                                    var prospectGroup = new reqProspectGroup();
                                    var clientNameID = 0;

                                    //query for fetching clientnames and clientid
                                    var successMessage = "KYC Updating Success";
                                    var clientNames = new Array();
                                    var clientId = new Array();
                                    var fetchQuery2 = "SELECT pc.client_id,pc.client_name FROM "+dbTableName.iklantProspectClient+"  pc " +
                                        "INNER JOIN "+dbTableName.iklantProspectGroup+"  pg ON pg.group_id = pc.group_id " +
                                        "WHERE pc.group_id = " + groupIdForKyc + " and " +
                                        "pc.status_id = " + constantsObj.getNeedInformation() + "";
                                    if(clientConnect !=null){
                                        clientConnect.query(fetchQuery2,
                                            function selectCb(err, results, fields) {
                                                if (err) {
                                                    clientConnect.rollback(function(){
                                                        customlog.error(err);
                                                        connectionDataSource.releaseConnectionPool(clientConnect);
                                                        clientConnect = null;
                                                        callback();
                                                    });
                                                }
                                                else {
                                                    clientConnect.commit(function(err){
                                                        if(err){
                                                            customlog.error(err);
                                                            clientConnect.rollback(function(){

                                                            });
                                                        }
                                                        for (var i in results) {
                                                            clientNames[i] = results[i].client_name;
                                                            clientId[i] = results[i].client_id;
                                                        }
                                                        connectionDataSource.releaseConnectionPool(clientConnect);
                                                        callback(successMessage, groupIdForKyc, prospectClientFamilyFetchObject, prospectClient, prospectGroup, clientId, clientNames, lookupEntityObj, clientNameID, prospectClientPersonal, prospectClientGuarantor, prospectClientFamilyDetail, prospectClient, prospectClientHouseDetail, prospectClientBankDetail, prospectClientOtherMfiDetail, prospectClientOtherDetail, flagValue);
                                                    });
                                                }
                                            }
                                        );
                                    }
                                });
                            }
                        });
                }
                });
        });
    },
    listcreditBureauForClientsDataModel: function (clientId, callback) {
        var clientPersonal = require(commonDTO +"/prospectClientPersonal");
        var clientGuarantor = require(commonDTO +"/prospectClientGuarantor");
        var prosClient = require(commonDTO +"/prospectClient");
        var clientOtherMfiDetail = require(commonDTO +"/prospectClientOtherMfiDetail");
        var lookupEntity = require(commonDTO +"/lookupEntity");
        var self=this;
        var constantsObj = this.constants;
        var groupName;
        var groupCentreName;
        var mfiNameArray = new Array();
        var mfiAmountArray = new Array();
        var mfiOutstandingArray = new Array();
        var lookupIdArray = new Array();
        var lookupValueArray = new Array();
        var prospectClientPersonalObj = new clientPersonal();
        var prospectClientObj = new prosClient();
        var prospectClientOtherMfiDetailObj = new clientOtherMfiDetail();
        var lookupEntityObj = new lookupEntity();
        var prospectClientGuarantorObj = new clientGuarantor();
        var clientNamesArray = new Array();
        var clientIdsArray = new Array();
        var groupPreviousStatus = constantsObj.getDataVerificationOperationId();
        var getDetailsForCreditBureau = "SELECT over.client_id,over.client_global_number, " +
            "over.client_name,over.client_last_name,over.date_of_birth , " +
            "over.group_id,over.group_name, hd.gender,hd.guardian_relationship,over.guardian_name, " +
            "over.guardian_lastname, over.ration_card_number,over.voter_id,over.gas_number, " +
            "over.aadhaar_number,over.other_id_name1,over.other_id1,over.other_id_name2,over.other_id2, " +
            "over.address,over.pincode, hd.loan_purpose,over.mobile_number,over.landline_number,over.kyc_done_by,over.credit_by,over.data_verified_by,over.guarantor_id,over.guarantor_dob FROM " +
            "(SELECT pcp.client_id,pc.client_name,pc.client_global_number, " +
            "pc.group_id,pc.client_last_name,pcp.date_of_birth,pcp.loan_purpose, pcp.guardian_name, " +
            "pcp.guardian_lastname,pcp.ration_card_number,pcp.voter_id,pcp.gas_number, " +
            "pcp.aadhaar_number,pcp.other_id_name1,pcp.other_id1,pcp.other_id_name2,pcp.other_id2,pcp.address,pcp.pincode, " +
            "pcp.mobile_number,pcp.landline_number, pg.group_name,IFNULL((SELECT user_name FROM "+dbTableName.iklantUsers+" WHERE user_id = `data_entry_updated_by`),(SELECT user_name FROM "+dbTableName.iklantUsers+" " +
            "WHERE user_id = `data_entry_by`)) AS kyc_done_by, (SELECT user_name FROM "+dbTableName.iklantUsers+" WHERE user_id = `credit_check_by`)AS credit_by," +
            "(SELECT user_name FROM "+dbTableName.iklantUsers+" WHERE user_id = `data_verified_by`) AS data_verified_by,(SELECT `guarantor_id` FROM `iklant_prospect_client_guarantor` WHERE client_id = " + clientId + " ORDER BY `prospect_client_guarantor_id` DESC LIMIT 1) AS guarantor_id,(SELECT `guarantor_dob` FROM `iklant_prospect_client_guarantor` WHERE client_id =" + clientId + " ORDER BY `prospect_client_guarantor_id` DESC LIMIT 1 ) AS guarantor_dob   FROM "+dbTableName.iklantProspectClient+" pc " +
            "LEFT JOIN "+dbTableName.iklantProspectClientPersonal+" pcp ON pcp.client_id = pc.client_id LEFT JOIN " +
            ""+dbTableName.iklantProspectClientOtherMfiDetail+" pcm ON pcm.client_id = pc.client_id LEFT JOIN iklant_prospect_client_data_entry_tracking  pcd ON pcd.`client_id` = pc.`client_id` INNER JOIN " +
            ""+dbTableName.iklantProspectGroup+" pg ON pg.group_id = pc.group_id WHERE pc.client_id = " + clientId + " GROUP BY " +
            "pc.client_id)over " +
            "LEFT JOIN " +
            "(SELECT pcp.client_id AS clt,lv4.lookup_value " +
            "AS loan_purpose, lv1.lookup_value AS gender,IF(lv2.lookup_value='Others',(SELECT `other_guarantor_relationship_name` FROM `iklant_prospect_client_guarantor` WHERE client_id = " + clientId + "),lv2.lookup_value) AS guardian_relationship " +
            "FROM "+dbTableName.iklantProspectClientPersonal+" pcp LEFT JOIN "+dbTableName.iklantLookupValue+" lv1 ON  lv1.lookup_id = pcp.gender " +
            "LEFT JOIN "+dbTableName.iklantLookupValue+" lv2 ON  lv2.lookup_id = pcp.guardian_relationship " +
            "LEFT JOIN "+dbTableName.iklantLookupValue+" lv4 ON  lv4.lookup_id = pcp.loan_purpose LEFT JOIN " +
            dbTableName.iklantProspectClient+" pc ON pc.client_id = pcp.client_id LEFT JOIN "+dbTableName.iklantProspectGroup+" pg " +
            "ON pg.group_id = pc.group_id WHERE pc.client_id = " + clientId + " GROUP BY pcp.client_id)hd ON " +
            "hd.clt = over.client_id GROUP BY over.client_id";
        customlog.info("getDetailsForCreditBureau : " + getDetailsForCreditBureau);
        connectionDataSource.getConnection(function (clientConnect) {
            clientConnect.query(getDetailsForCreditBureau,
                function selectCb(err, results, fields) {
                    if (err) {
                        connectionDataSource.releaseConnectionPool(clientConnect);
                        customlog.error(err);
                    } else {
                        for (var i in results) {
                            prospectClientObj.setClient_id(results[i].client_id);
                            prospectClientObj.setGroup_id(results[i].group_id);
                            prospectClientObj.setClient_global_number(results[i].client_global_number);
                            prospectClientObj.setClient_name(results[i].client_name);
                            prospectClientObj.setClient_last_name(results[i].client_last_name);
                            prospectClientObj.setKYC_Updated_By(results[0].kyc_done_by);
                            prospectClientObj.setCredited_By(results[0].credit_by);
                            prospectClientObj.setDataVerified_By(results[0].data_verified_by);
                            prospectClientPersonalObj.setDate_of_birth(dateUtils.formatDateForUI(results[i].date_of_birth));
                            prospectClientPersonalObj.setMobile_number(results[i].mobile_number);
                            prospectClientPersonalObj.setLandLine_number((results[0].landline_number)?results[0].landline_number:'');
                            prospectClientPersonalObj.setAddress(results[i].address);
                            prospectClientPersonalObj.setPincode(results[i].pincode);
                            prospectClientPersonalObj.setRation_card_number(results[i].ration_card_number);
                            prospectClientPersonalObj.setVoter_id(results[i].voter_id);
                            prospectClientPersonalObj.setGas_number(results[i].gas_number);
                            prospectClientPersonalObj.setAadhaar_number(results[i].aadhaar_number);
                            prospectClientPersonalObj.setOther_id_name(results[i].other_id_name1);
                            prospectClientPersonalObj.setOther_id(results[i].other_id1);
                            prospectClientPersonalObj.setOther_id_name2(results[i].other_id_name2);
                            prospectClientPersonalObj.setOther_id2(results[i].other_id2);
                            prospectClientPersonalObj.setLoan_purpose(results[i].loan_purpose);
                            prospectClientPersonalObj.setBusinessCategoryId(results[0].business_category);
                            prospectClientPersonalObj.setGuardian_relationship(results[i].guardian_relationship);
                            prospectClientPersonalObj.setGuardian_name(results[i].guardian_name);
                            prospectClientPersonalObj.setGuardian_lastname(results[i].guardian_lastname);
                            prospectClientPersonalObj.setGender(results[i].gender);
                            prospectClientGuarantorObj.setGuarantorId(results[i].guarantor_id);
                            prospectClientGuarantorObj.setGuarantorDob(dateUtils.formatDateForUI(results[i].guarantor_dob));
                        }
                    }
                });

            var otherMfiLoanDetailsQuery = "SELECT * FROM "+dbTableName.iklantProspectClientOtherMfiDetail+" WHERE client_id = " + clientId + "";
            customlog.info("otherMfiLoanDetailsQuery : " + otherMfiLoanDetailsQuery);
            clientConnect.query(otherMfiLoanDetailsQuery,
                function selectCb(err, results, fields) {
                    if (err) {
                        connectionDataSource.releaseConnectionPool(clientConnect);
                        customlog.error(err);
                    } else {
                        for (var i in results) {
                            mfiNameArray[i] = results[i].other_mfi_name;
                            mfiAmountArray[i] = results[i].other_mfi_amount_secured;
                            mfiOutstandingArray[i] = results[i].other_mfi_loan_outstanding;
                        }
                        prospectClientOtherMfiDetailObj.setOtherMfiNameArrayDto(mfiNameArray);
                        prospectClientOtherMfiDetailObj.setOtherMfiAmountArrayDto(mfiAmountArray);
                        prospectClientOtherMfiDetailObj.setOtherMfiOutstandingArrayDto(mfiOutstandingArray);
                    }
                });

            var repaymentTrackRecordQuery = "SELECT * FROM "+dbTableName.iklantLookupValue+" WHERE " +
                "entity_id = " + constantsObj.getRepaymentTrackRecordLookupEntity() + "";
            customlog.info("repaymentTrackRecordQuery : " + repaymentTrackRecordQuery);
            clientConnect.query(repaymentTrackRecordQuery,
                function selectCb(err, results, fields) {
                    if (err) {
                        connectionDataSource.releaseConnectionPool(clientConnect);
                        customlog.error(err);
                    } else {
                        for (var i in results) {
                            lookupIdArray[i] = results[i].lookup_id;
                            lookupValueArray[i] = results[i].lookup_value;
                        }
                        lookupEntityObj.setRepaymentTrackRecord(lookupIdArray);
                        lookupEntityObj.setRepaymentTrackRecordName(lookupValueArray);
                    }
                });

            var getClientsForCreditReport = "SELECT pc.client_id,IF(pc.client_last_name LIKE 'mln%',pc.client_name,CONCAT(pc.client_name,' ',pc.client_last_name)) as client_name,pg.group_name,pg.center_name,pg.remarks FROM "+dbTableName.iklantProspectClient+" pc " +
                "INNER JOIN "+dbTableName.iklantProspectGroup+" pg ON pg.group_id = pc.group_id " +
                "WHERE pc.group_id = (SELECT group_id FROM "+dbTableName.iklantProspectClient+" WHERE client_id = " + clientId + ") " +
                "AND pc.status_id=" + constantsObj.getDataVerificationOperationId() + "";
            customlog.info("getClientsForCreditReport : " + getClientsForCreditReport);
            clientConnect.query(getClientsForCreditReport,
                function selectCb(err, results, fields) {
                    connectionDataSource.releaseConnectionPool(clientConnect);
                    if (err) {
                        customlog.error(err);
                    } else {
                        for (var i in results) {
                            groupName = results[i].group_name;
                            groupCentreName = results[i].center_name;
                            clientIdsArray[i] = results[i].client_id;
                            clientNamesArray[i] = results[i].client_name;
                            if(results[i].remarks == '5' || results[i].remarks == '6' || results[i].remarks == '7' || results[i].remarks == '8' || results[i].remarks == '9' || results[i].remarks == '10' || results[i].remarks == '20')
                                groupPreviousStatus = results[i].remarks;
                        }
                        callback(groupName, groupCentreName, clientIdsArray, clientNamesArray, prospectClientObj, prospectClientPersonalObj, prospectClientOtherMfiDetailObj, lookupEntityObj,prospectClientGuarantorObj, groupPreviousStatus);
                    }
                });
        });
    },
    saveCreditBureauForClientsDataModel: function (clientId, repaymentTrackId, fileName, otherMFINames, otherMFIBalanceAmounts, otherMFIWrittenOffAmounts, userId, remarksForRejection,groupPreviousStatus,callback) {
        var self = this;
        var clientPersonal = require(commonDTO +"/prospectClientPersonal");
        var clientGuarantor = require(commonDTO +"/prospectClientGuarantor");
        var prosClient = require(commonDTO +"/prospectClient");
        var clientOtherMfiDetail = require(commonDTO +"/prospectClientOtherMfiDetail");
        var lookupEntity = require(commonDTO +"/lookupEntity");
        var self=this;
        var client = this.client;
        var constantsObj = this.constants;
        var groupName;
        var groupId;
        var groupCentreName;
        var noOfClients;
        var approvednoOfClients;
        var clientNamesArray = new Array();
        var clientIdsArray = new Array();
        var prospectClientPersonalObj = new clientPersonal();
        var prospectClientObj = new prosClient();
        var prospectGuarantorObj = new clientGuarantor();
        var prospectClientOtherMfiDetailObj = new clientOtherMfiDetail();
        var lookupEntityObj = new lookupEntity();
        //file upload[Adarsh]
        var docTypeId = constantsObj.getEquifaxReportDocId();
        connectionDataSource.getConnection(function (clientConnect) {
            clientConnect.beginTransaction(function(err){
               if(err){
                   customlog.error(err);
               }
                for (var i = 0; i < fileName.length; i++) {
                    customlog.info("fileName= " + fileName[i]);
                    var fileLocation = "documents/credit_reports/" + fileName[i];
                    var query = "INSERT INTO " + dbTableName.iklantClientDoc + " (Captured_image,client_id,doc_type_id,doc_name) " +
                        "VALUES('" + fileLocation + "'," + clientId + "," + docTypeId + ",'" + fileName[i] + "')";
                    if(clientConnect !=null){
                        clientConnect.query(query,
                            function selectCb(err, results, fields) {
                                if (err) {
                                    clientConnect.rollback(function(){
                                        connectionDataSource.releaseConnectionPool(clientConnect);
                                        clientConnect=null;
                                        customlog.error(err);
                                        callback();
                                    });
                                } else {
                                    customlog.info("File Inserted..!");
                                }
                            });
                    }
                }
                //End By Adarsh
                var saveRepaymentTrackRecordQuery = "UPDATE " + dbTableName.iklantProspectClient + " SET " +
                    "loan_repayment_track_record = " + repaymentTrackId + ", " +
                    "status_id = IF(" + repaymentTrackId + " = 80, " +
                    "" + constantsObj.getRejectedCreditBureauAnalysisStatusId() + ", " +
                    "IF(" + groupPreviousStatus +" = " + constantsObj.getCreditBureauAnalysedStatus() + "" +
                    " OR " + groupPreviousStatus + " = " + constantsObj.getAssignedFO() + "" +
                    " OR " + groupPreviousStatus + " = " + constantsObj.getDataVerificationOperationId() + ", " +
                    "" + constantsObj.getCreditBureauAnalysedStatus() + ", " + constantsObj.getFieldVerified() + ")),remarks_for_rejection = '" + remarksForRejection + "',updated_date = NOW() + INTERVAL 5 HOUR + INTERVAL 30 MINUTE " +
                    "WHERE client_id = " + clientId + "";
                customlog.info("saveRepaymentTrackRecordQuery : " + saveRepaymentTrackRecordQuery);
                if(clientConnect !=null){
                    clientConnect.query(saveRepaymentTrackRecordQuery, function selectCb(err, results, fields) {
                        if (err) {
                            clientConnect.rollback(function (){
                                connectionDataSource.releaseConnectionPool(clientConnect);
                                clientConnect=null;
                                customlog.error(err);
                                callback();
                            });
                        }
                        else{
                            // to update cca rating for idle group if already field verified
                            if(groupPreviousStatus != constantsObj.getDataVerificationOperationId() && groupPreviousStatus != constantsObj.getCreditBureauAnalysedStatus() && groupPreviousStatus != constantsObj.getAssignedFO()){
                                clientConnect.query("SELECT loan_count FROM " + dbTableName.iklantProspectClient + " WHERE client_id = "+clientId, function selectCb(err, result) {
                                    if (result.length > 0 && !err){
                                        self.updateCCAForClientsAfterCBADataModel(clientConnect,clientId, result[0].loan_count,function(){

                                        });
                                    }
                                });
                            }
                        }
                    });
                }
                // Baskar
                customlog.info("otherMFINames" + otherMFINames);
                customlog.info("otherMFIBalanceAmounts" + otherMFIBalanceAmounts);
                customlog.info("otherMFIWrittenOffAmounts" + otherMFIWrittenOffAmounts);
                var updateClientOtherMFIAmountQuery = "UPDATE " + dbTableName.iklantProspectClient + " SET " +
                    "other_mfi_balance_amount =" + otherMFIBalanceAmounts + ", " +
                    "other_mfi_written_off_amount = " + otherMFIWrittenOffAmounts + " " +
                    "WHERE client_id = " + clientId + " ";
                if(clientConnect !=null){
                    clientConnect.query(updateClientOtherMFIAmountQuery, function postCreate(err) {
                        if (err) {
                            clientConnect.rollback(function(){
                                connectionDataSource.releaseConnectionPool(clientConnect);
                                clientConnect=null;
                                customlog.error(err);
                                callback();
                            });
                        }
                    });
                }
                customlog.info("otherMFINames.length" + otherMFINames.length);
                if(clientConnect !=null){
                    clientConnect.query("DELETE FROM " + dbTableName.iklantProspectClientOtherMfiDetail + " WHERE client_id = " + clientId, function (error) {
                        if (!error) {
                            if (otherMFINames[0] != "") {
                                for (var i = 0; i < otherMFINames.length; i++) {
                                    var insertOtherMFINamesQuery = "INSERT INTO " + dbTableName.iklantProspectClientOtherMfiDetail +
                                        " (client_id,other_mfi_name) VALUES ( " + clientId + ",'" + otherMFINames[i] + "');";
                                    clientConnect.query(insertOtherMFINamesQuery, function postCreate(err) {
                                        if (err) {
                                            clientConnect.rollback(function(){
                                                connectionDataSource.releaseConnectionPool(clientConnect);
                                                clientConnect = null;
                                                customlog.error(err);
                                                callback();
                                            });
                                        }
                                    });
                                }
                            }
                        }
                    });
                }

                // UPDATE QUERY FOR DATA ENTRY TRACKING [Paramasivan]
                var prospectClientDataEntryQuery = 'SELECT * FROM ' + dbTableName.iklantProspectClientDataEntryTracking + ' WHERE client_id = ' + clientId;
                if(clientConnect !=null){
                    clientConnect.query(prospectClientDataEntryQuery, function (err, result) {
                        if (err) {
                            clientConnect.rollback(function(){
                                connectionDataSource.releaseConnectionPool(clientConnect);
                                clientConnect = null;
                                customlog.error(err);
                                callback();
                            });
                        } else if (result.length > 0) {
                            var prospectClientsQuery = "UPDATE " + dbTableName.iklantProspectClientDataEntryTracking +
                                " SET  credit_check_by = '" + userId + "', credit_updated_date = NOW() + INTERVAL 5 HOUR + INTERVAL 30 MINUTE WHERE " +
                                "client_id = " + clientId;
                            clientConnect.query(prospectClientsQuery,
                                function (err) {
                                    if (err) {
                                        clientConnect.rollback(function(){
                                            connectionDataSource.releaseConnectionPool(clientConnect);
                                            clientConnect = null;
                                            customlog.error(err);
                                            callback();
                                        });
                                    }
                                }
                            );
                        }
                        else {
                            var prospectClientsQuery = "INSERT INTO " + dbTableName.iklantProspectClientDataEntryTracking +
                                " (client_id,data_entry_by,data_entry_updated_by,credit_check_by,data_verified_by,is_data_verified,created_date,data_entry_updated_date,data_verified_date,credit_updated_date) " +
                                "VALUES(" + clientId + ",NULL,NULL,'" + userId + "',NULL,1,NOW() + INTERVAL 5 HOUR + INTERVAL 30 MINUTE,NOW() + INTERVAL 5 HOUR + INTERVAL 30 MINUTE,NOW() + INTERVAL 5 HOUR + INTERVAL 30 MINUTE,NOW() + INTERVAL 5 HOUR + INTERVAL 30 MINUTE)";
                            clientConnect.query(prospectClientsQuery,
                                function (err) {
                                    if (err) {
                                        clientConnect.rollback(function(){
                                            connectionDataSource.releaseConnectionPool(clientConnect);
                                            clientConnect = null;
                                            customlog.error(err);
                                            callback();
                                        });
                                    }
                                }
                            );
                        }
                    });
                }
                var successMessage = "Credit Bureau Analysed Successfully";
                var noOfClientsQuery = "SELECT approved.approved_no_of_clients,balance.balance_no_of_clients " +
                    "FROM " +
                    "(SELECT COUNT(pc.client_id) AS approved_no_of_clients, " +
                    "" + clientId + " AS client_id FROM " + dbTableName.iklantProspectClient + " pc  " +
                    "WHERE pc.group_id = (SELECT group_id FROM " + dbTableName.iklantProspectClient + " WHERE client_id=" + clientId + ")  " +
                    "AND pc.status_id IN (" + constantsObj.getCreditBureauAnalysedStatus() + "," + constantsObj.getFieldVerified() + "))approved  " +
                    "LEFT JOIN  " +
                    "(SELECT COUNT(pc.client_id) AS balance_no_of_clients, " + clientId + " AS client_id FROM " + dbTableName.iklantProspectClient + " pc  " +
                    "WHERE pc.group_id = (SELECT group_id FROM " + dbTableName.iklantProspectClient + " WHERE client_id=" + clientId + ")  " +
                    "AND pc.status_id=" + constantsObj.getDataVerificationOperationId() + ")balance ON " +
                    "approved.client_id = balance.client_id; ";
                customlog.info("noOfClientsQuery : " + noOfClientsQuery);
                clientConnect.query(noOfClientsQuery, function selectCb(err, results, fields) {
                    if (err) {
                        connectionDataSource.releaseConnectionPool(clientConnect);
                        customlog.error(err);
                        callback();
                    } else {
                        for (var i in results) {
                            noOfClients = results[i].balance_no_of_clients;
                            approvednoOfClients = results[i].approved_no_of_clients;
                        }
                    }
                    var getClientsForCreditReport = "SELECT pc.client_id,pg.group_id,IF(pc.client_last_name LIKE 'mln%',pc.client_name,CONCAT(pc.client_name,' ',pc.client_last_name)) as client_name,pg.group_name,pg.center_name FROM " +
                        dbTableName.iklantProspectClient + " pc " +
                        "INNER JOIN " + dbTableName.iklantProspectGroup + " pg ON pg.group_id = pc.group_id " +
                        "WHERE pc.group_id = (SELECT group_id FROM " + dbTableName.iklantProspectClient +
                        " WHERE client_id = " + clientId + ") " +
                        "AND pc.status_id=" + constantsObj.getDataVerificationOperationId() + "";
                    customlog.info("getClientsForCreditReport : " + getClientsForCreditReport);
                    clientConnect.query(getClientsForCreditReport,
                        function selectCb(err, results, fields) {
                            if (err) {
                                connectionDataSource.releaseConnectionPool(clientConnect);
                                customlog.error(err);
                                callback();
                            } else {
                                for (var i in results) {
                                    groupName = results[i].group_name;
                                    groupId = results[i].group_id;
                                    groupCentreName = results[i].center_name;
                                    clientIdsArray[i] = results[i].client_id;
                                    clientNamesArray[i] = results[i].client_name;
                                }

                                if (noOfClients == 0) {
                                    var updateStatusIdForGroup = "UPDATE " + dbTableName.iklantProspectGroup + " pg SET " +
                                        "pg.status_id =IF(" + approvednoOfClients + " < 5 ," +
                                        "" + constantsObj.getRejectedCreditBureauAnalysisStatusId() + ", " +
                                        " IF(" + groupPreviousStatus +" = " + constantsObj.getCreditBureauAnalysedStatus() + "" +
                                        " OR " + groupPreviousStatus + " = " + constantsObj.getAssignedFO() + "" +
                                        " OR " + groupPreviousStatus + " = " + constantsObj.getDataVerificationOperationId() + ", " +
                                        "" + constantsObj.getCreditBureauAnalysedStatus() + ", " + constantsObj.getFieldVerified() + "))," +
                                        "pg.updated_date = NOW() + INTERVAL 5 HOUR + INTERVAL 30 MINUTE, remarks = IF(" + approvednoOfClients + " >= 5,NULL,"+groupPreviousStatus+"), " +
                                        "pg.last_credit_check_date = NOW() + INTERVAL 5 HOUR + INTERVAL 30 MINUTE " +
                                        "WHERE group_id=(SELECT group_id FROM " + dbTableName.iklantProspectClient + " WHERE client_id=" + clientId + ")";
                                    customlog.info("updateStatusIdForGroup : " + updateStatusIdForGroup);
                                    clientConnect.query(updateStatusIdForGroup, function selectCb(err, results, fields) {
                                        if (err) {
                                            clientConnect.rollback(function(){
                                                customlog.error(err);
                                                connectionDataSource.releaseConnectionPool(clientConnect);
                                                clientConnect = null;
                                                callback();
                                            });
                                        }else{
                                            self.insertGroupStatusEntryDateDataModel(clientConnect,clientId,0,function(status){

                                            });
                                        }
                                    });
                                    clientConnect.commit(function(err){
                                        if(err){
                                            customlog.error(err);
                                        }
                                        var groupIdQuery = "select pc.group_id from iklant_prospect_client pc where pc.client_id = " + clientId ;
                                        clientConnect.query(groupIdQuery,
                                            function selectCb(err, results, fields) {
                                                if (err) {
                                                    connectionDataSource.releaseConnectionPool(clientConnect);
                                                    customlog.error(err);
                                                    callback();
                                                } else {
                                                    self.updateBODashboardTable(results[0].group_id);
                                                    connectionDataSource.releaseConnectionPool(clientConnect);
                                                    customlog.info("Transaction has been completed in CBA");
                                                    callback(groupName, groupCentreName, clientIdsArray, clientNamesArray, prospectClientObj, prospectClientPersonalObj, prospectClientOtherMfiDetailObj, lookupEntityObj, prospectGuarantorObj, successMessage);
                                                }
                                            });
                                    });
                                }
                                else {
                                    clientConnect.commit(function(err){
                                        if(err){
                                            customlog.error(err);
                                        }
                                        connectionDataSource.releaseConnectionPool(clientConnect);
                                        customlog.info("Transaction has been completed in CBA");
                                        callback(groupName, groupCentreName, clientIdsArray, clientNamesArray, prospectClientObj, prospectClientPersonalObj, prospectClientOtherMfiDetailObj, lookupEntityObj,prospectGuarantorObj, successMessage);
                                    });
                                }
                            }
                        });
                });
            });
        });
    },

    updateCCAForClientsAfterCBADataModel: function (clientConnect,clientId,loanCounter,callback) {
        var self=this;
        var choicesSelectedAnswerRequireObj = require(commonDTO+"/choicesSelectedAnswer");
        var questionsRequire = require(commonDTO+"/questions");
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
        var clientAppraisalArray = new Array();
        var clientTotalWeightageArray = new Array();
        var answerIdArray = new Array();
        var returnedArray = new Array();

        if (loanCounter > 1) {
            questionsQuery = "SELECT * FROM " + dbTableName.iklantQuestions + " WHERE (is_default = 0 OR (loan_count = " + loanCounter + " AND is_default = 1))";
        } else {
            questionsQuery = "SELECT * FROM " + dbTableName.iklantQuestions + " WHERE (is_default = 0)";
        }

        //connectionDataSource.getConnection(function (clientConnect) {
            if(clientConnect !=null){
                clientConnect.query(questionsQuery,
                    function selectCb(err, results, fields) {
                        if (err) {
                            connectionDataSource.releaseConnectionPool(clientConnect);
                            customlog.error(err);
                            callback();
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
            }
            var choicesAnswerQuery = "SELECT over.client_id,over.date_of_birth , hd.educational_details , hd.marital_status , " +
                "cou.number_of_earnings, over.family_monthly_income ,over.family_monthly_expense , gr.house_type , " +
                "over.vehicle_details,hd.loan_purpose, over.is_bank_account,over.is_insurance_lifetime, " +
                "over.is_insurance_accidental,over.is_insurance_medical, over.is_loan_secured,coumfi.number_of_loan,hd.loan_repayment_track_record," +
                "over.no_of_regular_attendance,over.no_of_irregular_attendance,over.no_of_regular_payments,over.no_of_irregular_payments FROM " +
                "(SELECT pcp.client_id,pcp.date_of_birth,pcp.educational_details,pcp.marital_status,pcp.loan_purpose, " +
                "pc.family_monthly_income,pc.family_monthly_expense,pch.house_type,pch.vehicle_details, " +
                "pcb.is_bank_account,pcb.is_insurance_lifetime,pcb.is_insurance_accidental,pcb.is_insurance_medical, " +
                "pc.is_loan_secured,other.no_of_regular_attendance,other.no_of_irregular_attendance,other.no_of_regular_payments,other.no_of_irregular_payments " +
                "FROM " + dbTableName.iklantProspectClient + " pc " +
                "LEFT JOIN " + dbTableName.iklantProspectClientPersonal + " pcp ON pcp.client_id = pc.client_id " +
                "LEFT JOIN " + dbTableName.iklantProspectClientFamilyDetail + " pcf ON pcf.client_id = pc.client_id " +
                "LEFT JOIN " + dbTableName.iklantProspectClientHouseDetail + " pch ON pch.client_id = pc.client_id " +
                "LEFT JOIN " + dbTableName.iklantprospectClientBankDetail + " pcb ON pcb.client_id = pc.client_id " +
                "LEFT JOIN " + dbTableName.iklantProspectClientOtherMfiDetail + " pcm ON pcm.client_id = pc.client_id " +
                "LEFT JOIN " + dbTableName.iklantProspectClientOtherDetail + " other ON other.client_id = pc.client_id " +
                "WHERE pc.client_id = " + clientId + "  and pc.status_id IN " +
                "(" + fieldVerified + "," + rejectedFieldVerification + "," +constantsObj.getRejectedCreditBureauAnalysisStatusId()+ ") " +
                "GROUP BY pc.client_id)over " +
                "LEFT JOIN " +
                "(SELECT pcp.client_id AS clt,lv1.lookup_value AS educational_details, " +
                "lv2.lookup_value  AS marital_status, " +
                "lv4.lookup_value AS loan_purpose, " +
                "lv5.lookup_value AS loan_repayment_track_record " +
                "FROM " + dbTableName.iklantProspectClientPersonal + " pcp " +
                "LEFT JOIN " + dbTableName.iklantLookupValue + " lv1 ON  lv1.lookup_id = pcp.educational_details " +
                "LEFT JOIN " + dbTableName.iklantLookupValue + " lv2 ON  lv2.lookup_id = pcp.marital_status " +
                "LEFT JOIN " + dbTableName.iklantLookupValue + " lv4 ON  lv4.lookup_id = pcp.loan_purpose " +
                "LEFT JOIN " + dbTableName.iklantProspectClient + " pc ON pc.client_id = pcp.client_id " +
                "LEFT JOIN " + dbTableName.iklantLookupValue + " lv5 ON  lv5.lookup_id = pc.loan_repayment_track_record " +
                "WHERE pc.client_id = " + clientId + " and pc.status_id IN " +
                "(" + fieldVerified + "," + rejectedFieldVerification + "," +constantsObj.getRejectedCreditBureauAnalysisStatusId()+ ")  " +
                "GROUP BY pcp.client_id)hd ON " +
                "hd.clt = over.client_id " +
                "LEFT JOIN " +
                "(SELECT lv3.lookup_value AS house_type,hdlp.client_id " +
                "FROM " + dbTableName.iklantProspectClientHouseDetail + " hdlp " +
                "INNER JOIN " + dbTableName.iklantLookupValue + " lv3 ON  lv3.lookup_id = hdlp.house_type " +
                "INNER JOIN " + dbTableName.iklantProspectClient + " pc ON pc.client_id = hdlp.client_id " +
                "WHERE pc.client_id = " + clientId + " and pc.status_id IN " +
                "(" + fieldVerified + "," + rejectedFieldVerification + "," +constantsObj.getRejectedCreditBureauAnalysisStatusId()+ ")  " +
                "GROUP BY pc.client_id) gr ON " +
                "hd.clt = gr.client_id " +
                "LEFT JOIN " +
                "(SELECT COUNT(pcfd.client_id) AS number_of_earnings,pc.client_id FROM " + dbTableName.iklantProspectClientFamilyDetail + " pcfd " +
                "INNER JOIN " + dbTableName.iklantProspectClient + " pc ON pc.client_id = pcfd.client_id " +
                "WHERE pc.client_id = " + clientId + " and pc.status_id IN " +
                "(" + fieldVerified + "," + rejectedFieldVerification + "," +constantsObj.getRejectedCreditBureauAnalysisStatusId()+ ") " +
                "GROUP BY pc.client_id) cou " +
                "ON hd.clt = cou.client_id " +

                "LEFT JOIN " +
                "(SELECT COUNT(pcmd.client_id) AS number_of_loan,pc.client_id FROM " + dbTableName.iklantProspectClientOtherMfiDetail + " pcmd " +
                "INNER JOIN " + dbTableName.iklantProspectClient + " pc ON pc.client_id = pcmd.client_id " +
                "WHERE pc.client_id = " + clientId + " and pc.status_id IN " +
                "(" + fieldVerified + "," + rejectedFieldVerification + "," +constantsObj.getRejectedCreditBureauAnalysisStatusId()+ ") GROUP BY pc.client_id) coumfi " +
                "ON hd.clt = coumfi.client_id " +
                "GROUP BY over.client_id";
            customlog.info("choicesAnswerQuery: "+choicesAnswerQuery);
            if(clientConnect !=null){
                clientConnect.query(choicesAnswerQuery, function selectCb(err, results, fields) {
                    if (err) {
                        connectionDataSource.releaseConnectionPool(clientConnect);
                        customlog.error(err);
                        callback();
                    } else {
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
                            noOfRegularAttendanceArray[i] = results[i].no_of_regular_attendance;
                            noOfIrregularAttendanceArray[i] = results[i].no_of_irregular_attendance;
                            noOfRegularPaymentsArray[i] = results[i].no_of_regular_payments;
                            noOfIrregularPaymentsArray[i] = results[i].no_of_irregular_payments;
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

                        returnedArray[i] = calculateAppraisalPercentage(questionsObj, choicesSelectedAnswerObj, 0);
                        clientAppraisalArray.push(returnedArray[0][0][0]);
                        answerIdArray.push(returnedArray[0][1]);
                        clientTotalWeightageArray.push(returnedArray[0][0][1]);

                        self.updateAppraisalAfterCBADatamodel(clientId, questionsObj, clientAppraisalArray, clientTotalWeightageArray, answerIdArray, clientConnect, function () {
                            //connectionDataSource.releaseConnectionPool(clientConnect);
                            callback();
                        });
                    }
                });
            }
        //});
    },

    updateAppraisalAfterCBADatamodel: function (clientId, questionsObj, clientAppraisalArray, clientTotalWeightageArray, answerIdArray, clientConnect, callback) {
        var initialTotalWeightageRequired = 225;
        var updateAppraisalQuery = "UPDATE "+dbTableName.iklantClientRating+" SET appraisal_rating = " + clientAppraisalArray[0] + ",total_weightage_obtained = " + clientTotalWeightageArray[0] + "," +
            "total_weightage_required = " + initialTotalWeightageRequired + " WHERE client_id = " + clientId;
        if(clientConnect != null){
            clientConnect.query(updateAppraisalQuery,function selectCb(err, results, fields) {
                if(!err) {
                    for (var i = 0; i < questionsObj.getQuestionIdArray().length; i++) {
                        var updateAnswerQuery = "UPDATE " + dbTableName.iklantClientAssessment + " SET answer_id = " + answerIdArray[0][i] + ",updated_date =  NOW() + INTERVAL 5 HOUR + INTERVAL 30 MINUTE " +
                            "WHERE client_id = " + clientId + " AND question_id = " + questionsObj.getQuestionIdArray()[i];
                        clientConnect.query(updateAnswerQuery,function selectCb(err, results, fields) {
                            if (err) {
                                customlog.error(err);
                                callback();
                            }
                        });
                        if(questionsObj.getQuestionIdArray().length == i){
                            callback();
                        }
                    }
                }
                else{
                    customlog.error(err);
                    callback();
                }
            });
        }
    },

    updateCCAForClientsDataModel: function (clientId,loanCounter,callback) {
        var self=this;
        var choicesSelectedAnswerRequireObj = require(commonDTO+"/choicesSelectedAnswer");
        var questionsRequire = require(commonDTO+"/questions");
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
        var clientAppraisalArray = new Array();
        var clientTotalWeightageArray = new Array();
        var answerIdArray = new Array();
        var returnedArray = new Array();

        if (loanCounter > 1) {
            questionsQuery = "SELECT * FROM " + dbTableName.iklantQuestions + " WHERE (is_default = 0 OR (loan_count = " + loanCounter + " AND is_default = 1))";
        } else {
            questionsQuery = "SELECT * FROM " + dbTableName.iklantQuestions + " WHERE (is_default = 0)";
        }

        connectionDataSource.getConnection(function (clientConnect) {
            if(clientConnect !=null){
                clientConnect.query(questionsQuery,
                    function selectCb(err, results, fields) {
                        if (err) {
                            connectionDataSource.releaseConnectionPool(clientConnect);
                            customlog.error(err);
                            callback();
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
            }
            var choicesAnswerQuery = "SELECT over.client_id,over.date_of_birth , hd.educational_details , hd.marital_status , " +
                "cou.number_of_earnings, over.family_monthly_income ,over.family_monthly_expense , gr.house_type , " +
                "over.vehicle_details,hd.loan_purpose, over.is_bank_account,over.is_insurance_lifetime, " +
                "over.is_insurance_accidental,over.is_insurance_medical, over.is_loan_secured,coumfi.number_of_loan,hd.loan_repayment_track_record," +
                "over.no_of_regular_attendance,over.no_of_irregular_attendance,over.no_of_regular_payments,over.no_of_irregular_payments FROM " +
                "(SELECT pcp.client_id,pcp.date_of_birth,pcp.educational_details,pcp.marital_status,pcp.loan_purpose, " +
                "pc.family_monthly_income,pc.family_monthly_expense,pch.house_type,pch.vehicle_details, " +
                "pcb.is_bank_account,pcb.is_insurance_lifetime,pcb.is_insurance_accidental,pcb.is_insurance_medical, " +
                "pc.is_loan_secured,other.no_of_regular_attendance,other.no_of_irregular_attendance,other.no_of_regular_payments,other.no_of_irregular_payments " +
                "FROM " + dbTableName.iklantProspectClient + " pc " +
                "LEFT JOIN " + dbTableName.iklantProspectClientPersonal + " pcp ON pcp.client_id = pc.client_id " +
                "LEFT JOIN " + dbTableName.iklantProspectClientFamilyDetail + " pcf ON pcf.client_id = pc.client_id " +
                "LEFT JOIN " + dbTableName.iklantProspectClientHouseDetail + " pch ON pch.client_id = pc.client_id " +
                "LEFT JOIN " + dbTableName.iklantprospectClientBankDetail + " pcb ON pcb.client_id = pc.client_id " +
                "LEFT JOIN " + dbTableName.iklantProspectClientOtherMfiDetail + " pcm ON pcm.client_id = pc.client_id " +
                "LEFT JOIN " + dbTableName.iklantProspectClientOtherDetail + " other ON other.client_id = pc.client_id " +
                "WHERE pc.client_id = " + clientId + "  and pc.status_id IN " +
                "(" + fieldVerified + "," + rejectedFieldVerification + "," +constantsObj.getRejectedCreditBureauAnalysisStatusId()+ ") " +
                "GROUP BY pc.client_id)over " +
                "LEFT JOIN " +
                "(SELECT pcp.client_id AS clt,lv1.lookup_value AS educational_details, " +
                "lv2.lookup_value  AS marital_status, " +
                "lv4.lookup_value AS loan_purpose, " +
                "lv5.lookup_value AS loan_repayment_track_record " +
                "FROM " + dbTableName.iklantProspectClientPersonal + " pcp " +
                "LEFT JOIN " + dbTableName.iklantLookupValue + " lv1 ON  lv1.lookup_id = pcp.educational_details " +
                "LEFT JOIN " + dbTableName.iklantLookupValue + " lv2 ON  lv2.lookup_id = pcp.marital_status " +
                "LEFT JOIN " + dbTableName.iklantLookupValue + " lv4 ON  lv4.lookup_id = pcp.loan_purpose " +
                "LEFT JOIN " + dbTableName.iklantProspectClient + " pc ON pc.client_id = pcp.client_id " +
                "LEFT JOIN " + dbTableName.iklantLookupValue + " lv5 ON  lv5.lookup_id = pc.loan_repayment_track_record " +
                "WHERE pc.client_id = " + clientId + " and pc.status_id IN " +
                "(" + fieldVerified + "," + rejectedFieldVerification + "," +constantsObj.getRejectedCreditBureauAnalysisStatusId()+ ")  " +
                "GROUP BY pcp.client_id)hd ON " +
                "hd.clt = over.client_id " +
                "LEFT JOIN " +
                "(SELECT lv3.lookup_value AS house_type,hdlp.client_id " +
                "FROM " + dbTableName.iklantProspectClientHouseDetail + " hdlp " +
                "INNER JOIN " + dbTableName.iklantLookupValue + " lv3 ON  lv3.lookup_id = hdlp.house_type " +
                "INNER JOIN " + dbTableName.iklantProspectClient + " pc ON pc.client_id = hdlp.client_id " +
                "WHERE pc.client_id = " + clientId + " and pc.status_id IN " +
                "(" + fieldVerified + "," + rejectedFieldVerification + "," +constantsObj.getRejectedCreditBureauAnalysisStatusId()+ ")  " +
                "GROUP BY pc.client_id) gr ON " +
                "hd.clt = gr.client_id " +
                "LEFT JOIN " +
                "(SELECT COUNT(pcfd.client_id) AS number_of_earnings,pc.client_id FROM " + dbTableName.iklantProspectClientFamilyDetail + " pcfd " +
                "INNER JOIN " + dbTableName.iklantProspectClient + " pc ON pc.client_id = pcfd.client_id " +
                "WHERE pc.client_id = " + clientId + " and pc.status_id IN " +
                "(" + fieldVerified + "," + rejectedFieldVerification + "," +constantsObj.getRejectedCreditBureauAnalysisStatusId()+ ") " +
                "GROUP BY pc.client_id) cou " +
                "ON hd.clt = cou.client_id " +

                "LEFT JOIN " +
                "(SELECT COUNT(pcmd.client_id) AS number_of_loan,pc.client_id FROM " + dbTableName.iklantProspectClientOtherMfiDetail + " pcmd " +
                "INNER JOIN " + dbTableName.iklantProspectClient + " pc ON pc.client_id = pcmd.client_id " +
                "WHERE pc.client_id = " + clientId + " and pc.status_id IN " +
                "(" + fieldVerified + "," + rejectedFieldVerification + "," +constantsObj.getRejectedCreditBureauAnalysisStatusId()+ ") GROUP BY pc.client_id) coumfi " +
                "ON hd.clt = coumfi.client_id " +
                "GROUP BY over.client_id";
            customlog.info("choicesAnswerQuery: "+choicesAnswerQuery);
            if(clientConnect !=null){
                clientConnect.query(choicesAnswerQuery, function selectCb(err, results, fields) {
                    if (err) {
                        connectionDataSource.releaseConnectionPool(clientConnect);
                        customlog.error(err);
                        callback();
                    } else {
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
                            noOfRegularAttendanceArray[i] = results[i].no_of_regular_attendance;
                            noOfIrregularAttendanceArray[i] = results[i].no_of_irregular_attendance;
                            noOfRegularPaymentsArray[i] = results[i].no_of_regular_payments;
                            noOfIrregularPaymentsArray[i] = results[i].no_of_irregular_payments;
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

                        returnedArray[i] = calculateAppraisalPercentage(questionsObj, choicesSelectedAnswerObj, 0);
                        clientAppraisalArray.push(returnedArray[0][0][0]);
                        answerIdArray.push(returnedArray[0][1]);
                        clientTotalWeightageArray.push(returnedArray[0][0][1]);

                        self.updateAppraisalDatamodel(clientId, questionsObj, clientAppraisalArray, clientTotalWeightageArray, answerIdArray, clientConnect, function () {
                            connectionDataSource.releaseConnectionPool(clientConnect);
                            callback();
                        });
                    }
                });
            }
        });
    },

    updateAppraisalDatamodel: function (clientId, questionsObj, clientAppraisalArray, clientTotalWeightageArray, answerIdArray, clientConnect, callback) {
        var initialTotalWeightageRequired = 225;
        var updateAppraisalQuery = "UPDATE "+dbTableName.iklantClientRating+" SET appraisal_rating = " + clientAppraisalArray[0] + ",total_weightage_obtained = " + clientTotalWeightageArray[0] + "," +
            "total_weightage_required = " + initialTotalWeightageRequired + " WHERE client_id = " + clientId;
        if(clientConnect != null){
            clientConnect.query(updateAppraisalQuery,function selectCb(err, results, fields) {
                if(!err) {
                    for (var i = 0; i < questionsObj.getQuestionIdArray().length; i++) {
                        var updateAnswerQuery = "UPDATE " + dbTableName.iklantClientAssessment + " SET answer_id = " + answerIdArray[0][i] + ",updated_date =  NOW() + INTERVAL 5 HOUR + INTERVAL 30 MINUTE " +
                            "WHERE client_id = " + clientId + " AND question_id = " + questionsObj.getQuestionIdArray()[i];
                        clientConnect.query(updateAnswerQuery,function selectCb(err, results, fields) {
                            if (err) {
                                customlog.error(err);
                                callback();
                            }
                        });
                        if(questionsObj.getQuestionIdArray().length == i){
                            callback();
                        }
                    }
                }
                else{
                    customlog.error(err);
                    callback();
                }
            });
        }
    },

    callToLDCallTrackDataModel: function (tenantId,groupId,groupName,centerName,clientId,clientName,numberToCall,officeId,loanAccountId,callCenterExeId, callTrackingId,callback) {
        customlog.info("tenantId: " + tenantId + " groupId: " + groupId + " clientId: " + clientId + " numberToCall: "+numberToCall+" callCenterExeId:"+callCenterExeId+" callTrackingId: "+callTrackingId);
        try{
            var self = this;
            var constantsObj = this.constants;
            var successMessage;
            var Gcm_RegIdFetchQuery = "select gcm_reg_id from iklant_user_gcmdetails where user_id="+callCenterExeId;
            customlog.info("Gcm_RegIdFetchQuery: " + Gcm_RegIdFetchQuery);

            self.callToLDCallTrackInsert(tenantId,groupId,groupName,centerName,clientId,clientName,numberToCall,officeId,loanAccountId,callCenterExeId,callTrackingId,function (status,callTrackId,version_no) {
                if(status == 'failure') {
                    callback(status, callTrackId);
                }else {
                    connectionDataSource.getConnection(function (clientConnect) {
                        clientConnect.query(Gcm_RegIdFetchQuery, function selectCb(err, results, fields) {
                            connectionDataSource.releaseConnectionPool(clientConnect);
                            if (!err && results != null && results.length > 0) {
                                customlog.info(" enetr push ... ");
                                var gcm = require('node-gcm');
                                var message = new gcm.Message();
                                var sender = new gcm.Sender(constantsObj.getGcmApiKey());
                                var registrationIds = [];
                                var pushMessage = JSON.stringify({
                                    COMMAND: "OUT_GOING_CALL",
                                    ACK_URL: "",
                                    numberToCall: numberToCall,
                                    groupId: groupId,
                                    groupName: groupName,
                                    centerName: centerName,
                                    clientName: clientName,
                                    clientId: clientId,
                                    officeId: officeId,
                                    loanAccountId: loanAccountId,
                                    callCenterExeId: callCenterExeId,
                                    tenantId: tenantId,
                                    callTrackingId: callTrackId,
                                    versionNo: version_no
                                });
                                message.addData('message', pushMessage);
                                message.addData('title', 'Iklant');
                                message.addData('msgcnt', '2');
                                message.addData('soundname', 'beep.wav');
                                message.collapseKey = 'demo';
                                message.delayWhileIdle = true;
                                message.timeToLive = 3000;
                                registrationIds.push(results[0].gcm_reg_id);
                                customlog.info(" b4 send  push ... ");
                                sender.send(message, registrationIds, 4, function (err, result) {
                                    customlog.info(result);
                                    console.log("After send calllback got");
                                    console.log(message);
                                    if (!err) {
                                        //self.getLDClientDetailsDataModel(groupId,loanAccountId,function(result){
                                            successMessage = 'success';
                                            callback(successMessage, callTrackId, result);
                                        //})
                                    } else {
                                        customlog.error(err);
                                        successMessage = 'failure';
                                        callback(successMessage, callTrackId);
                                    }
                                });
                            }
                            else {
                                successMessage = 'failure';
                                callback(successMessage, callTrackId);
                            }
                        });
                    });
                }
            });
        }
        catch(e){
            console.log(e);
        }
    },

    callToLDCallTrackInsert : function(tenantId,groupId,groupName,centerName,clientId,clientName,numberToCall,officeId,loanAccountId,callCenterExeId, callTrackingId,callback){
        var successMessage = '';
        var isClientAlreadyExists = 0;
        var isClientAlreadyExistsQuery = "SELECT COUNT(call_tracking_id) AS client_exists FROM " + dbTableName.iklantLDCallTracking + " WHERE client_id = " + clientId + " AND account_id = " + loanAccountId;
        connectionDataSource.getConnection(function (clientConnect) {
            clientConnect.query(isClientAlreadyExistsQuery, function (error, results) {
                 if (!error) {
                    if(callTrackingId == 0 && results[0].client_exists == 0) {
                        var query = "INSERT INTO " + dbTableName.iklantLDCallTracking + "(account_id,group_id,client_id) VALUES('" + loanAccountId + "','" + groupId + "','" + clientId + "')";
                        //connectionDataSource.getConnection(function (clientConnect) {
                            clientConnect.query(query, function (err,results) {
                                if (!err) {
                                   /* var getCallTrackIdQuery = "SELECT MAX(call_tracking_id) AS call_tracking_id FROM " + dbTableName.iklantLDCallTracking + " WHERE client_id = " + clientId + " AND account_id = " + loanAccountId;
                                    clientConnect.query(getCallTrackIdQuery, function (error, results) {
                                        if (results.length > 0 && !error) {*/
                                            var docQuery = "INSERT INTO ld_call_tracking_doc(call_tracking_id,start_time,version_no,created_by) VALUES('" + results.insertId + "',NOW() + INTERVAL 5 HOUR + INTERVAL 30 MINUTE,1,'" + callCenterExeId + "')";
                                            clientConnect.query(docQuery, function (error) {
                                                connectionDataSource.releaseConnectionPool(clientConnect);
                                                if (!error) {
                                                    successMessage = 'success';
                                                    callback(successMessage, results.insertId,1);
                                                } else {
                                                    successMessage = 'failure';
                                                    callback(successMessage,0);
                                                }
                                            });
                                        /*} else {
                                            connectionDataSource.releaseConnectionPool(clientConnect);
                                            successMessage = 'failure';
                                            callback(successMessage, 0);
                                        }
                                    });*/
                                } else {
                                    connectionDataSource.releaseConnectionPool(clientConnect);
                                    successMessage = 'failure';
                                    callback(successMessage, 0);
                                }
                            });
                        //});
                    }
                    else{
                        //connectionDataSource.getConnection(function (clientConnect) {
                            var getCallTrackDocIdQuery = "SELECT IFNULL(MAX(version_no),0) AS version_no FROM ld_call_tracking_doc WHERE call_tracking_id = "+callTrackingId;
                            clientConnect.query(getCallTrackDocIdQuery, function (err,docResult) {
                                if (!err  && docResult.length>0) {
                                    var docQuery = "INSERT INTO ld_call_tracking_doc(call_tracking_id,start_time,version_no,created_by) VALUES('" + callTrackingId + "',NOW() + INTERVAL 5 HOUR + INTERVAL 30 MINUTE,"+(parseInt(docResult[0].version_no)+1)+",'" + callCenterExeId + "')";
                                    clientConnect.query(docQuery, function (error) {
                                        connectionDataSource.releaseConnectionPool(clientConnect);
                                        if(!error) {
                                            successMessage = 'success';
                                            callback(successMessage, callTrackingId,parseInt(docResult[0].version_no)+1);
                                        }
                                        else{
                                            successMessage = 'failure';
                                            callback(successMessage, callTrackingId);
                                        }
                                    });
                                } else {
                                    connectionDataSource.releaseConnectionPool(clientConnect);
                                    successMessage = 'failure';
                                    callback(successMessage, callTrackingId);
                                }
                            });
                        //});
                    }
                 }else{
                     connectionDataSource.releaseConnectionPool(clientConnect);
                     successMessage = 'failure';
                     callback(successMessage, callTrackingId);
                 }
            });
        });
    },

    callToLDCallTrackCallInitialAckDataModel: function (groupId,clientId,clientName,numberToCall,callCenterExeId,callStatus,fileLocation,callTrackingId,versionNo,callback) {
        customlog.info("groupId: " + groupId + " clientId: " + clientId + " numberToCall: "+numberToCall+" callCenterExeId:"+callCenterExeId);
        try{
            var self = this;
            var successMessage;
            connectionDataSource.getConnection(function (clientConnect) {
                var query = "UPDATE ld_call_tracking_doc SET call_status = '"+callStatus+"',end_time=NOW() + INTERVAL 5 HOUR + INTERVAL 30 MINUTE,audio_file_location='"+fileLocation+"'  WHERE call_tracking_id = " + callTrackingId + " AND version_no = "+versionNo;
                clientConnect.query(query, function (err) {
                    connectionDataSource.releaseConnectionPool(clientConnect);
                    if (!err) {
                        successMessage = 'success';
                        callback(successMessage);
                    } else {
                        customlog.error("Query : "+query);
                        customlog.error(err);
                        successMessage = 'failure';
                        callback(successMessage);
                    }
                });
            });
        }
        catch(e){
            customlog.error(e);
        }
    },

   leaderSubLeaderFormDownloadDataModel: function (group_id,loanCount,docType,access_type_id, localMachineIp,callback) {
        var self=this;
        var status = 'success';
        var constantsObj = this.constants;
        var memberIdArray = new Array();
        var memberNameArray = new Array();
        var docTypeIdArray = new Array();
        var docTypeNameArray = new Array();
        var allDocTypeIdArray = new Array();
        var allDocTypeNameArray = new Array();
        var base64ImageArray = new Array();
        var fs = require("fs");
        base64ImageArray[0] = 'Empty';
        customlog.info("access_type_id"+ access_type_id);
        connectionDataSource.getConnection(function (clientConnect) {

            var imageQuery = "SELECT cd.client_doc_id,cd.Captured_image,dt.doc_name,IF(dt.doc_id=14,8,0) AS doc_id FROM "+dbTableName.iklantClientDoc+" cd " +
                "LEFT JOIN "+dbTableName.iklantDocType+" dt ON dt.doc_id = cd.doc_type_id WHERE " +
                "client_id IN  (SELECT client_id FROM `iklant_prospect_client` WHERE group_id = "+group_id+" AND loan_count = "+loanCount+") AND doc_type_id in ( "+constantsObj.getLeaderSubLeaderDocId()+" )" ;
            clientConnect.query(imageQuery, function selectCb(err, results, fields) {
                if (err) {
                    connectionDataSource.releaseConnectionPool(clientConnect);
                    customlog.error(err);
                } else if(results != null && results.length > 0){
                    for (var i in results) {
                        var fieldName = results[i];

                        if(access_type_id == constantsObj.getAccessTypeId()){
                            base64ImageArray[i] = ("http://"+localMachineIp+"/"+fieldName.Captured_image).replace(" ","%20");
                        }else{
                            var imageLocation = fieldName.Captured_image;
                            console.log("Location :"+imageLocation);
                            try {
                                var bitmap = fs.readFileSync(imageLocation);
                                docTypeNameArray[i] = fieldName.doc_name;
                                docTypeIdArray[i] = fieldName.doc_id;
                                base64ImageArray[i] = "data:image\/png;base64," + new Buffer(bitmap).toString('base64');
                            }catch(exc){
                                if(exc){
                                    status = 'failure';
                                }
                            }
                        }
                    }
                }else{
                    status = 'failure';
                }
            });

            var memberDetail = "SELECT client_id,client_name FROM "+dbTableName.iklantProspectClient+" WHERE group_id=" + group_id + " AND is_overdue = 0 AND status_id IN(" + constantsObj.getLeaderSubLeaderUpdatingOperationId() + ")";
            clientConnect.query(memberDetail,
                function selectCb(err, results, fields) {
                    if (err) {
                        connectionDataSource.releaseConnectionPool(clientConnect);
                        customlog.error(err);
                    } else {
                        for (var i in results) {
                            var fieldName = results[i];
                            memberIdArray[i] = fieldName.client_id;
                            memberNameArray[i] = fieldName.client_name;
                            customlog.info("Group Name=" + memberNameArray[i]);
                        }
                    }
                });

            var docTypequery = "SELECT doc_id,doc_name FROM "+dbTableName.iklantDocType+"  where doc_entity_id=" + constantsObj.getClientDocsEntity() + "";
            clientConnect.query(docTypequery,
                function selectCb(err, results, fields) {
                    if (err) {
                        customlog.error(err);
                    } else {
                        for (var i in results) {
                            var fieldName = results[i];
                            allDocTypeIdArray[i] = fieldName.doc_id;
                            allDocTypeNameArray[i] = fieldName.doc_name;
                        }
                    }
                    connectionDataSource.releaseConnectionPool(clientConnect);
                    callback(status,base64ImageArray, group_id, docType, memberIdArray, memberNameArray, docTypeIdArray, docTypeNameArray,allDocTypeIdArray,allDocTypeNameArray);
                });
        });
    },

   getClientDetailsForLeaderSubLeaderDataModel: function (groupId,callback) {
        var constantsObj = this.constants;
        var leaderSubLeaderDetailsDto = require(dataEntryDTO +"/leaderSubLeaderDetails");
        var leaderSubLeaderDetailsDtoObj = new leaderSubLeaderDetailsDto();
        var lookupIdArray = new Array();
        var lookupNameArray = new Array();
        var clientIdArray = new Array();
        var clientNameArray = new Array();
        var clientLastNameArray = new Array();
        connectionDataSource.getConnection(function (clientConnect) {
            var clientTypeDetailsQuery = "SELECT lookup_id,lookup_value FROM " + dbTableName.iklantLookupValue + " WHERE entity_id = " + constantsObj.getClientTypeEntity();
            clientConnect.query(clientTypeDetailsQuery, function (err, results) {
                for (var i in results) {
                    lookupIdArray [i]  = results[i].lookup_id;
                    lookupNameArray [i]  = results[i].lookup_value;
                }
                leaderSubLeaderDetailsDtoObj.setLookupIdArray(lookupIdArray);
                leaderSubLeaderDetailsDtoObj.setLookupNameArray(lookupNameArray);
                var clientDetailsArray = "SELECT pc.client_id,pc.client_name,client_last_name,pg.group_name,center_name,IFNULL((SELECT user_name FROM "+dbTableName.iklantUsers+" WHERE user_id = `data_entry_updated_by`),(SELECT user_name FROM "+dbTableName.iklantUsers+
                    " WHERE user_id = `data_entry_by`)) AS kyc_done_by  FROM " + dbTableName.iklantProspectClient + " pc inner join "+dbTableName.iklantProspectGroup+" pg ON pg.group_id = pc.group_id left join " +dbTableName.iklantProspectClientDataEntryTracking+
                    " pcd ON pcd.client_id = pc.client_id WHERE pg.group_id = pc.group_id AND pg.group_id = " + groupId+" AND pc.status_id in ("+constantsObj.getLeaderSubLeaderUpdatedStatus()+")" +
                    " AND pc.status_id = pg.status_id group by pc.client_id";
                clientConnect.query(clientDetailsArray, function (err, result) {
                    if (err) {
                        connectionDataSource.releaseConnectionPool(clientConnect);
                        customlog.error(err);
                        callback();
                    }else{
                        if(result.length > 0){
                            for (var i in result) {
                                clientIdArray [i]  = result[i].client_id;
                                clientNameArray [i]  = result[i].client_name;
                                clientLastNameArray [i]  = result[i].client_last_name;
                            }
                            leaderSubLeaderDetailsDtoObj.setClientIdArray(clientIdArray);
                            leaderSubLeaderDetailsDtoObj.setClientNameArray(clientNameArray);
                            leaderSubLeaderDetailsDtoObj.setClientLastNameArray(clientLastNameArray);
                            connectionDataSource.releaseConnectionPool(clientConnect);
                            callback(leaderSubLeaderDetailsDtoObj,result[i].group_name,result[i].center_name);
                        }else{
                            connectionDataSource.releaseConnectionPool(clientConnect);
                            callback(leaderSubLeaderDetailsDtoObj,"","");
                        }
                    }
                });
            });
        });
   },

   updateExistingSubGroupDetailsCallDataModel: function (req, res,groupId,loanCount,callback) {
        var clientIdListArray = new Array();
        clientIdListArray = (req.body.clientIdArray).split(",");
        connectionDataSource.getConnection(function (clientConnect) {
            clientConnect.beginTransaction(function(err){
                if(err){
                    customlog.error(err);
                }
                var updateClientExistingData = "UPDATE iklant_prospect_client SET sub_leader_global_number = null,total_sub_group_client = null WHERE client_id IN ("+clientIdListArray+")";
                customlog.info("updateClientExistingDataQuery: "+updateClientExistingData);
                clientConnect.query(updateClientExistingData, function (err) {
                    if(!err){
                        clientConnect.commit(function(err){
                           if(err){
                               clientConnect.rollback(function(){
                                   customlog.error(err);
                               });
                           }
                            connectionDataSource.releaseConnectionPool(clientConnect);
                            customlog.info("Transaction has been completed in Update Exsting Group Details");
                            callback("success");
                        });


                    }else{
                        clientConnect.rollback(function(){
                            customlog.error(err);
                            connectionDataSource.releaseConnectionPool(clientConnect);
                            callback("failure");
                        });
                    }
                });
            });
        });
    },

   /*saveSubGroupDetailsCallDataModel: function (req, res,groupId,loanCount,callback) {
        var constantsObj = this.constants;
        var self = this;
        var lookupIdArray = new Array();
        var subGroupClientCodeArray = new Array();
        var subGroupClientIdArray = new Array();
        var lookupNameArray = new Array();
        var clientIdListArray = new Array();
        var clientNameArray = new Array();
        var clientLastNameArray = new Array();
        clientIdListArray = (req.body.clientIdArray).split(",");
        var isDataVerified = req.body.isDataVerified;
        var statusId;
        if(isDataVerified == 1){
            statusId = constantsObj.getDataVerificationOperationId();
        }else{
            statusId = constantsObj.getKYCCompleted();
        }
        connectionDataSource.getConnection(function (clientConnect) {
            var updateClientExistingData = "UPDATE iklant_prospect_client SET sub_leader_global_number = '',total_sub_group_client=0 WHERE client_id IN ("+clientIdListArray+")";
            customlog.info("updateClientExistingDataQuery: "+updateClientExistingData);
            clientConnect.query(updateClientExistingData, function (err) {
                if(!err){
                    for(var i=0;i< clientIdListArray.length;i++){
                        var subGroupCode = req.body['subGroupCode_'+clientIdListArray[i]];
                        var totalSubGroupMembers = req.body['totalSubGroupMembers_'+clientIdListArray[i]];
                        if(subGroupCode != ""){
                            subGroupClientCodeArray = (req.body['subGroupClientCode_'+clientIdListArray[i]]).split(",");
                            subGroupClientIdArray = (req.body['subGroupClientId_'+clientIdListArray[i]]).split(",");
                            var updateSubLeaderProspectClientQuery = "UPDATE iklant_prospect_client SET sub_leader_global_number = '"+subGroupCode+"',total_sub_group_client = "+totalSubGroupMembers+",status_id = "+constantsObj.getKYCCompleted()+",updated_date=NOW() + INTERVAL 5 HOUR + INTERVAL 30 MINUTE  WHERE client_id = "+clientIdListArray[i];
                            clientConnect.query(updateSubLeaderProspectClientQuery, function (err, results) {
                                if (err) {
                                    connectionDataSource.releaseConnectionPool(clientConnect);
                                    customlog.error(err);
                                    callback("failure");
                                }
                                else{
                                    for(var j=0;j< subGroupClientIdArray.length;j++){
                                        var updateSubMembersProspectClientQuery = "UPDATE iklant_prospect_client SET client_global_number = '"+subGroupClientCodeArray[j]+"',status_id = "+constantsObj.getKYCCompleted()+",updated_date=NOW() + INTERVAL 5 HOUR + INTERVAL 30 MINUTE  WHERE client_id = "+subGroupClientIdArray[j];
                                        clientConnect.query(updateSubMembersProspectClientQuery, function (err, results) {
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
                        if(clientIdListArray.length == (i+1)){
                            connectionDataSource.releaseConnectionPool(clientConnect);
                            callback("success");
                        }
                    }
                }
                else{
                    connectionDataSource.releaseConnectionPool(clientConnect);
                    callback("failure");
                }
            });
        });
    } ,*/

   saveSubGroupDetailsCallDataModel: function (req, res,groupId,loanCount,callback) {
        var constantsObj = this.constants;
        var self = this;
        var lookupIdArray = new Array();
        var subGroupClientCodeArray = new Array();
        var subGroupClientIdArray = new Array();
        var lookupNameArray = new Array();
        var clientIdListArray = new Array();
        var clientNameArray = new Array();
        var clientLastNameArray = new Array();
        clientIdListArray = (req.body.clientIdArray).split(",");
        var isDataVerified = req.body.isDataVerified;
        var statusId;
        if(isDataVerified == 1){
           statusId = constantsObj.getDataVerificationOperationId();
        }else{
           //statusId = constantsObj.getKYCCompleted();
           statusId = constantsObj.getLeaderSubLeaderVerifiedStatus();
        }
        self.updateExistingSubGroupDetailsCallDataModel(req, res,groupId,loanCount,function(resultStatus){
            if(resultStatus != "success"){
                callback("failure");
            }else{
                connectionDataSource.getConnection(function (clientConnect) {
                    clientConnect.beginTransaction(function(err){
                       if(err){
                           customlog.error(err);
                       }
                        var index = 0;
                        for(var i=0;i< clientIdListArray.length;i++){
                            var subGroupCode = req.body['subGroupCode_'+clientIdListArray[i]];
                            var totalSubGroupMembers = req.body['totalSubGroupMembers_'+clientIdListArray[i]];
                            if(subGroupCode != ""){
                                subGroupClientCodeArray = (req.body['subGroupClientCode_'+clientIdListArray[i]]).split(",");
                                subGroupClientIdArray = (req.body['subGroupClientId_'+clientIdListArray[i]]).split(",");
                                var updateSubLeaderProspectClientQuery = "UPDATE iklant_prospect_client SET sub_leader_global_number = '"+subGroupCode+"',total_sub_group_client = "+totalSubGroupMembers+",status_id = "+statusId+",updated_date=NOW() + INTERVAL 5 HOUR + INTERVAL 30 MINUTE  WHERE status_id != "+constantsObj.getRejectedKYCDataVerificationStatusId()+" and client_id = "+clientIdListArray[i];
                                clientConnect.query(updateSubLeaderProspectClientQuery, function (err, results) {
                                    if (err) {
                                        clientConnect.rollback(function(){
                                            connectionDataSource.releaseConnectionPool(clientConnect);
                                            customlog.error(err);
                                            callback("failure");
                                        });
                                    }
                                });
                            }
                            if(subGroupCode != ""){
                                for(var j=0;j< subGroupClientIdArray.length;j++){
                                    var updateSubMembersProspectClientQuery = "UPDATE iklant_prospect_client SET client_global_number = '"+subGroupClientCodeArray[j]+"',status_id = "+statusId+",updated_date=NOW() + INTERVAL 5 HOUR + INTERVAL 30 MINUTE  WHERE status_id != "+constantsObj.getRejectedKYCDataVerificationStatusId()+" and client_id = "+subGroupClientIdArray[j];
                                    clientConnect.query(updateSubMembersProspectClientQuery, function (err, results) {
                                        if (err) {
                                            clientConnect.rollback(function(){
                                                connectionDataSource.releaseConnectionPool(clientConnect);
                                                customlog.error(err);
                                                callback("failure");
                                            });
                                        }
                                    });
                                }
                            }
                        }
                    });
                    clientConnect.commit(function(err){
                        if(err){
                            customlog.error(err);
                        }
                        connectionDataSource.releaseConnectionPool(clientConnect);
                        callback("success");
                    });
                });
            }
        });
   } ,
    saveReUpdateDEClientDetailsCallDataModel: function(groupId,memberId,tenantId,userId,pageName,selectedDocTypes,remarks,reasonForHold,callback){
        var constantsObj = this.constants;
        var self = this;
        var statusId = constantsObj.getKYCUploaded();
        var kycReUpdateQuery = "UPDATE " + dbTableName.iklantProspectClient + " SET `status_id`=" + statusId + " WHERE `client_id`=" + memberId + " AND `group_id`="+groupId+";";
        customlog.info(kycReUpdateQuery);
        connectionDataSource.getConnection(function (clientConnect) {
            clientConnect.query(kycReUpdateQuery, function (err) {
                if(err){
                    customlog.info(err);
                    connectionDataSource.releaseConnectionPool(clientConnect);
                    callback("failure");
                }
                else{
                    self.saveFOPerformanceTrackByClientCallDataModel(tenantId,userId,groupId,memberId,pageName,selectedDocTypes,remarks,reasonForHold,function(status){
                        var fetchQueryDV = "SELECT COUNT(pc.client_id) AS client_count FROM iklant_prospect_client pc "+
                            "INNER JOIN iklant_prospect_group  pg ON pg.group_id = pc.group_id WHERE "+
                            "pc.group_id = "+ groupId +" AND pc.status_id IN ("+constantsObj.getKYCCompleted()+")";

                        clientConnect.query(fetchQueryDV,function(err, results) {
                            if (err) {
                                connectionDataSource.releaseConnectionPool(clientConnect);
                                customlog.error(err);
                                callback('failure');
                            }
                            else {
                                if (results[0].client_count == 0) {
                                    var kycReUpdateGroupQuery = "UPDATE " + dbTableName.iklantProspectGroup + " SET `status_id`=" + statusId + " WHERE `group_id`="+groupId;
                                    clientConnect.query(kycReUpdateGroupQuery,function(err) {
                                        if (err) {
                                            customlog.error(err);
                                            connectionDataSource.releaseConnectionPool(clientConnect);
                                        }else{
                                            self.updateBODashboardTable(groupId);
                                            callback("kycresuccess");
                                            connectionDataSource.releaseConnectionPool(clientConnect);
                                            /*var newstatusId='01';
                                             self.insertGroupStatusEntryDateDataModel(clientConnect,groupId,newstatusId,function(status){
                                             connectionDataSource.releaseConnectionPool(clientConnect);
                                             callback("kycresuccess");
                                             });*/
                                        }
                                    });
                                }else{
                                    callback("kycresuccess");
                                }
                            }
                        });
                    });
                }
            });
        });
    },
   getClientDetailsForLeaderSubLeaderVerificationDataModel: function (groupId,roleId,callback) {
        var constantsObj = this.constants;
        var leaderSubLeaderDetailsDto = require(dataEntryDTO +"/leaderSubLeaderDetails");
        var leaderSubLeaderDetailsDtoObj = new leaderSubLeaderDetailsDto();
        var lookupIdArray = new Array();
        var lookupNameArray = new Array();
        var clientIdArray = new Array();
        var clientNameArray = new Array();
        var clientLastNameArray = new Array();
        var subGroupClientGlobalNumberArray = new Array();
        var subGroupGlobalNumberArray = new Array();
        var totalSubGroupClient = new Array();
        var clientLastNameArray = new Array();
        var leaderGlobalNumberArray = new Array();
        connectionDataSource.getConnection(function (clientConnect) {
            var clientTypeDetailsQuery = "SELECT lookup_id,lookup_value FROM " + dbTableName.iklantLookupValue + " WHERE entity_id = " + constantsObj.getClientTypeEntity();
            clientConnect.query(clientTypeDetailsQuery, function (err, results) {
                for (var i in results) {
                    lookupIdArray [i]  = results[i].lookup_id;
                    lookupNameArray [i]  = results[i].lookup_value;
                }
                leaderSubLeaderDetailsDtoObj.setLookupIdArray(lookupIdArray);
                leaderSubLeaderDetailsDtoObj.setLookupNameArray(lookupNameArray);
                var clientDetailsArray = "SELECT pc.client_id,pc.client_name,client_last_name,pg.group_name,center_name,IFNULL((SELECT user_name FROM "+dbTableName.iklantUsers+" WHERE user_id = `data_entry_updated_by`),(SELECT user_name FROM "+dbTableName.iklantUsers+
                    " WHERE user_id = `data_entry_by`)) AS kyc_done_by,`sub_leader_global_number`,`client_global_number`,`total_sub_group_client`,pg.leader_global_number  FROM " + dbTableName.iklantProspectClient + " pc inner join "+dbTableName.iklantProspectGroup+" pg ON pg.group_id = pc.group_id left join " +dbTableName.iklantProspectClientDataEntryTracking+
                    " pcd ON pcd.client_id = pc.client_id WHERE pg.group_id = pc.group_id AND pg.group_id = " + groupId;
                if(roleId == constantsObj.getDEOroleId()){
                    clientDetailsArray += " AND pc.status_id in ("+constantsObj.getLeaderSubLeaderVerifiedStatus()+","+constantsObj.getRejectedKYCDataVerificationStatusId()+") ";
                }else{
                    clientDetailsArray += " AND pc.status_id not in ("+constantsObj.getRejectedPriliminaryVerification()+","+constantsObj.getRejectedCreditBureauAnalysisStatusId()+","+constantsObj.getRejectedFieldVerification()+","+constantsObj.getRejectedAppraisal()+"" +
                        ","+constantsObj.getRejectedLoanSanction()+","+constantsObj.getRejectedInNextLoanPreCheck()+","+constantsObj.getRejectedWhileIdleGroupsStatusId()+","+constantsObj.getArchived()+","+constantsObj.getRejectedKYCDataVerificationStatusId()+") ";
                }
                customlog.info("clientDetailsArray : "+clientDetailsArray);
                clientConnect.query(clientDetailsArray, function (err, result) {
                    if (err) {
                        connectionDataSource.releaseConnectionPool(clientConnect);
                        customlog.error(err);
                        callback();
                    }else{
                        if(result.length > 0){
                            for (var i in result) {
                                clientIdArray [i]  = result[i].client_id;
                                clientNameArray [i]  = result[i].client_name;
                                clientLastNameArray [i]  = result[i].client_last_name;
                                subGroupClientGlobalNumberArray[i]  = result[i].client_global_number;
                                subGroupGlobalNumberArray[i]  = result[i].sub_leader_global_number;
                                totalSubGroupClient[i]  = result[i].total_sub_group_client;
                                leaderGlobalNumberArray[i]  = result[i].leader_global_number;
                            }
                            leaderSubLeaderDetailsDtoObj.setClientIdArray(clientIdArray);
                            leaderSubLeaderDetailsDtoObj.setClientNameArray(clientNameArray);
                            leaderSubLeaderDetailsDtoObj.setClientLastNameArray(clientLastNameArray);
                            leaderSubLeaderDetailsDtoObj.setSubGroupClientGlobalNumberArray(subGroupClientGlobalNumberArray);
                            leaderSubLeaderDetailsDtoObj.setSubGroupGlobalNumberArray(subGroupGlobalNumberArray);
                            leaderSubLeaderDetailsDtoObj.setTotalSubGroupClient(totalSubGroupClient);
                            leaderSubLeaderDetailsDtoObj.setLeaderGlobalNumberArray(leaderGlobalNumberArray);

                            var subClientIdsArray = new Array();
                            var subClientNamesArray = new Array();
                            var subClientGlobalNumbersArray = new Array();
                            var subLeaderGlobalNumbersArray = new Array();
                            var subLeaderClientIdArray = new Array();
                            var index = 0;
                            for (var j in subGroupGlobalNumberArray) {
                                if(subGroupGlobalNumberArray[j] != "" && subGroupGlobalNumberArray[j] != null) {
                                     var subClientIdList = new Array();
                                     var subClientNameList = new Array();
                                     var subClientGlobalNumberList = new Array();
                                     var subLeaderGlobalNumber = "";
                                     var subLeaderClientId = "";
                                     var subListIndex = 0;
                                     for(var subIndex in subGroupClientGlobalNumberArray){
                                         if(subGroupClientGlobalNumberArray[subIndex].match(subGroupGlobalNumberArray[j])){
                                              subClientGlobalNumberList[subListIndex] = subGroupClientGlobalNumberArray[subIndex];
                                              subClientNameList[subListIndex] = clientNameArray[subIndex];
                                              subClientIdList[subListIndex] = clientIdArray[subIndex];
                                              subLeaderGlobalNumber = subGroupGlobalNumberArray[j];
                                              subLeaderClientId  = clientIdArray[j];
                                              subListIndex++;
                                         }
                                     }
                                    subClientIdsArray[index] = subClientIdList;
                                    subClientNamesArray[index] = subClientNameList;
                                    subClientGlobalNumbersArray[index] = subClientGlobalNumberList;
                                    subLeaderGlobalNumbersArray[index] = subLeaderGlobalNumber;
                                    subLeaderClientIdArray[index] = subLeaderClientId;
                                    index++;
                                    subListIndex = 0;
                                }
                            }
                            leaderSubLeaderDetailsDtoObj.setSubClientIdArray(subClientIdsArray);
                            leaderSubLeaderDetailsDtoObj.setSubClientNameArray(subClientNamesArray);
                            leaderSubLeaderDetailsDtoObj.setSubClientGlobalNumberArray(subClientGlobalNumbersArray);
                            leaderSubLeaderDetailsDtoObj.setSubLeaderGlobalNumberArray(subLeaderGlobalNumbersArray);
                            leaderSubLeaderDetailsDtoObj.setSubLeaderClientIdArray(subLeaderClientIdArray);
                            connectionDataSource.releaseConnectionPool(clientConnect);
                            callback(leaderSubLeaderDetailsDtoObj,result[i].group_name,result[i].center_name);
                        }else{
                            connectionDataSource.releaseConnectionPool(clientConnect);
                            callback(leaderSubLeaderDetailsDtoObj,"","");
                        }
                    }
                });
            });
        });
    },

    getLDClientDetailByClientIdDataModel : function (groupId,accountId,clientId,callback){
        var retrieveLDClientQuery = " SELECT "+
            "     ipg.`group_id`,"+
            "     ipg.`group_name`,"+
            "     ipg.`center_name`,"+
            "     ipg.office_id, "+
            "     imm.`client_id`,"+
            "     c.`customer_id`,"+
            "     c.`display_name`,"+
            "     a.`global_account_num`,"+
            "     la.account_id,"+
            "     la.`parent_account_id`,"+
            "     la.`loan_amount`,"+
            "     la.`disbursement_date`,"+
            "     la.`interest_rate`,"+
            "     (SELECT  COUNT(*) FROM  loan_schedule ls  WHERE ls.account_id = la.`account_id`) AS tenure,"+
            "     (SELECT SUM(ls.principal + ls.interest)  FROM loan_schedule ls WHERE `installment_id` = 2  AND ls.account_id = la.`account_id`) AS emi_amount,"+
            "     cad.`phone_number`,"+
            "     IFNULL(ld.call_tracking_id, 0) AS call_tracking_id, "+
            "     IFNULL(ld.alternate_contact_no, '') AS alternate_contact_no "+
            " FROM account a"+
            " 	INNER JOIN loan_account la   ON la.`account_id` = a.`account_id` "+
            " 	INNER JOIN customer c  ON c.`customer_id` = a.`customer_id`"+
            " 	INNER JOIN `iklant_mifos_mapping` imm   ON imm.`mifos_client_customer_id` = c.`customer_id` "+
            " 	INNER JOIN iklant_prospect_group ipg ON ipg.`group_id` = imm.`group_id`"+
            " 	LEFT JOIN `customer_address_detail` cad  ON cad.`customer_id` = c.`customer_id` "+
            " 	LEFT JOIN ld_call_tracking ld  ON ld.client_id = imm.client_id AND la.account_id = ld.account_id"+
            " WHERE la.`parent_account_id` = "+accountId +" AND imm.`client_id` = "+clientId;
        customlog.info(retrieveLDClientQuery);
        connectionDataSource.getConnection(function (clientConnect) {
            clientConnect.query(retrieveLDClientQuery, function (err, result) {
                connectionDataSource.releaseConnectionPool(clientConnect);
                if(err){
                    customlog.info(err);
                    callback(result);
                }
                else{
                    callback(result);
                }
            });
        });
    },
   getLDClientDetailsDataModel : function (groupId,accountId,callback){
        var retrieveLDClientQuery = " SELECT  "+
            " 	ld_details.*, "+
            " 	IFNULL(rm_remarks.rm_remarks,'') AS rm_remarks, "+
            " 	IFNULL(bm_remarks.bm_remarks,'') AS bm_remarks, "+
            " 	IF(ipc.`is_ld_tracked` = 1 , 'Call Tracking Completed','Call Tracking Not Completed') AS ld_status, "+
            "   bm_status.bm_queue,"+
            "   rm_status.rm_queue,"+
            "   IFNULL(not_reachable_status.lookup_value,'Call Not Initiated') as lookup_value"+
            "  FROM  "+
            "( SELECT "+
            "     ipg.`group_id`,"+
            "     ipg.`group_name`,"+
            "     ipg.`center_name`,"+
            "     ipg.office_id, "+
            "     imm.`client_id`,"+
            "     c.`customer_id`,"+
            "     c.`display_name`,"+
            "     a.`global_account_num`,"+
            "     la.account_id,"+
            "     la.`parent_account_id`,"+
            "     la.`loan_amount`,"+
            "     la.`disbursement_date`,"+
            "     la.`interest_rate`,"+
            "     (SELECT  COUNT(*) FROM  loan_schedule ls  WHERE ls.account_id = la.`account_id`) AS tenure,"+
            "     (SELECT SUM(ls.principal + ls.interest)  FROM loan_schedule ls WHERE `installment_id` = 2  AND ls.account_id = la.`account_id`) AS emi_amount,"+
            "     cad.`phone_number`,"+
            "     IFNULL(ld.call_tracking_id, 0) AS call_tracking_id, "+
            "     IFNULL(ld.alternate_contact_no, '') AS alternate_contact_no "+
            " FROM account a"+
            " 	INNER JOIN loan_account la   ON la.`account_id` = a.`account_id` "+
            " 	INNER JOIN customer c  ON c.`customer_id` = a.`customer_id`"+
            " 	INNER JOIN `iklant_mifos_mapping` imm   ON imm.`mifos_client_customer_id` = c.`customer_id` "+
            " 	INNER JOIN iklant_prospect_group ipg ON ipg.`group_id` = imm.`group_id`"+
            " 	LEFT JOIN `customer_address_detail` cad  ON cad.`customer_id` = c.`customer_id` "+
            " 	LEFT JOIN ld_call_tracking ld  ON ld.client_id = imm.client_id AND la.account_id = ld.account_id"+
            " WHERE la.`parent_account_id` = "+accountId+")ld_details "+
            " LEFT JOIN "+
            " ( "+
            " SELECT  "+
            " 	client_det.group_id, "+
            " 	client_det.client_id, "+
            "    client_det.account_id,"+
            " 	rm_remarks.rm_remarks	 "+
            " FROM  "+
            " (SELECT  "+
            "  client_id, "+
            "  group_id, "+
            "  account_id  "+
            "  FROM "+
            "  `ld_call_tracking`  "+
            "  WHERE group_id = "+groupId +
            "  )client_det "+
            "  LEFT JOIN  "+
            "  (SELECT  "+
            " 	 `call_tracking_detail_id` AS client_mistmatch_call_track_id, "+
            " 	 `cce_remarks` AS client_mismatch, "+
            " 	 rm_verified, "+
            " 	 rm_remarks, "+
            " 	 version_no, "+
            " 	 (SELECT client_id FROM `ld_call_tracking` lct WHERE lct.`call_tracking_id` = lctd1.`parent_call_tracking_id`) AS client_id, "+
            " (SELECT group_id FROM `ld_call_tracking` lct WHERE lct.`call_tracking_id` = lctd1.`parent_call_tracking_id`) AS group_id,"+
            " (SELECT account_id FROM `ld_call_tracking` lct WHERE lct.`call_tracking_id` = lctd1.`parent_call_tracking_id`) AS account_id "+
            " 	 FROM ld_call_tracking_detail lctd1  "+
            " WHERE  "+
            " (SELECT group_id FROM `ld_call_tracking` lct WHERE lct.`call_tracking_id` = lctd1.`parent_call_tracking_id`) = "+groupId +
            " AND `version_no` = (SELECT MAX(version_no) FROM ld_call_tracking_detail lctd WHERE lctd.`parent_call_tracking_id` = lctd1.`parent_call_tracking_id`)  "+
            " AND (lctd1.`question_id` = 48  OR lctd1.`question_id`= 40)  "+
            " AND (lctd1.`answer_id` = 167 OR lctd1.`answer_id` = 132)  "+
            " 		   "+
            "  AND rm_verified=1  "+
            "  GROUP BY lctd1.`parent_call_tracking_id` "+
            " )rm_remarks ON rm_remarks.client_id = client_det.client_id AND rm_remarks.account_id = client_det.account_id"+
            "  WHERE rm_verified IS NOT NULL)rm_remarks "+
            "  ON rm_remarks.client_id = ld_details.client_id AND rm_remarks.account_id = ld_details.account_id"+
            "  LEFT JOIN "+
            "  ( "+
            "  SELECT  "+
            " 	client_det.group_id, "+
            " 	client_det.client_id, "+
            "    client_det.account_id,"+
            " 	bm_remarks.bm_remarks "+
            " FROM "+
            "  (SELECT  "+
            " 	 client_id, "+
            " 	 group_id, "+
            " 	 account_id  "+
            " 	 FROM "+
            " 	 `ld_call_tracking`  "+
            " 	 WHERE group_id = "+groupId +
            " 	 )client_det "+
            " 	 LEFT JOIN  "+
            " 	 (SELECT  "+
            " 	 `call_tracking_detail_id` AS emi_call_track_id, "+
            " 	 `cce_remarks` AS emi_mismatch, "+
            " 	 bm_verified, "+
            " 	 bm_remarks, "+
            " 	 version_no, "+
            " 	 (SELECT client_id FROM `ld_call_tracking` lct WHERE lct.`call_tracking_id` = lctd1.`parent_call_tracking_id`) AS client_id, "+
            " (SELECT group_id FROM `ld_call_tracking` lct WHERE lct.`call_tracking_id` = lctd1.`parent_call_tracking_id`) AS group_id,"+
            " (SELECT account_id FROM `ld_call_tracking` lct WHERE lct.`call_tracking_id` = lctd1.`parent_call_tracking_id`) AS account_id "+
            "  FROM ld_call_tracking_detail lctd1  "+
            " WHERE  "+
            " (SELECT group_id FROM `ld_call_tracking` lct WHERE lct.`call_tracking_id` = lctd1.`parent_call_tracking_id`) = "+groupId +
            " AND `version_no` = (SELECT MAX(version_no) FROM ld_call_tracking_detail lctd WHERE lctd.`parent_call_tracking_id` = lctd1.`parent_call_tracking_id`)  "+
            " AND lctd1.`question_id` IN (41,42,43,48)  "+
            " AND lctd1.`answer_id` IN (134,136,138,148,149,150,151,152,153,154,155,156,157,158,162)  "+
            " AND bm_verified =1   "+
            "  GROUP BY lctd1.`parent_call_tracking_id` "+
            " )bm_remarks ON bm_remarks.client_id = client_det.client_id AND bm_remarks.account_id = client_det.account_id"+
            "  WHERE bm_verified IS NOT NULL)bm_remarks "+
            "  ON bm_remarks.client_id = ld_details.client_id AND bm_remarks.account_id = ld_details.account_id"+
            "  LEFT JOIN `iklant_prospect_client` ipc ON ipc.`client_id` = ld_details.client_id "+
            "LEFT JOIN ( SELECT   "+
            " `call_tracking_detail_id`,  "+
            " `cce_remarks`, "+
            " question_id, "+
            " answer_id, "+
            " lookup_value, "+
            " version_no,  "+
            " (SELECT client_id FROM `ld_call_tracking` lct WHERE lct.`call_tracking_id` = lctd1.`parent_call_tracking_id`) AS client_id,  "+
            " (SELECT group_id FROM `ld_call_tracking` lct WHERE lct.`call_tracking_id` = lctd1.`parent_call_tracking_id`) AS group_id,  "+
            " (SELECT account_id FROM `ld_call_tracking` lct WHERE lct.`call_tracking_id` = lctd1.`parent_call_tracking_id`) AS account_id  "+
            " FROM ld_call_tracking_detail lctd1   "+
            " LEFT JOIN `iklant_lookup_value` ilv ON ilv.lookup_id = lctd1.`answer_id` "+
            " WHERE  "+
            " (SELECT group_id FROM `ld_call_tracking` lct WHERE lct.`call_tracking_id` = lctd1.`parent_call_tracking_id`) = "+groupId +
            " AND `version_no` = (SELECT MAX(version_no) FROM ld_call_tracking_detail lctd WHERE lctd.`parent_call_tracking_id` = lctd1.`parent_call_tracking_id`)   "+
            " AND lctd1.`question_id` IN (48)   "+
            " AND lctd1.`answer_id` IN (147,148,149,150,151,152,153,154,155,156,157,158,162,167)   "+
            " 		   "+
            " GROUP BY lctd1.`parent_call_tracking_id` )not_reachable_status"+
            " ON not_reachable_status.client_id = ld_details.client_id AND not_reachable_status.account_id = ld_details.account_id"+

            " LEFT JOIN "+
            " (SELECT "+
            " client_det.*"+
            " ,ipc.`client_name`"+
            " ,ipg.`center_name`"+
            " ,ipg.`group_name`  "+
            " ,ipg.office_id "+
            " ,'Client In BM Queue' AS bm_queue"+
            " FROM"+
            " (SELECT "+
            " client_id,"+
            " group_id,"+
            " account_id "+
            " FROM"+
            " `ld_call_tracking` "+
            " WHERE group_id = "+groupId+
            " )client_det"+
            " LEFT JOIN "+
            " (SELECT "+
            " `call_tracking_detail_id` AS emi_call_track_id,"+
            " `cce_remarks` AS emi_mismatch,"+
            " bm_verified,"+
            " version_no,"+
            " (SELECT client_id FROM `ld_call_tracking` lct WHERE lct.`call_tracking_id` = lctd1.`parent_call_tracking_id`) AS client_id,"+
            " (SELECT group_id FROM `ld_call_tracking` lct WHERE lct.`call_tracking_id` = lctd1.`parent_call_tracking_id`) AS group_id,"+
            " (SELECT account_id FROM `ld_call_tracking` lct WHERE lct.`call_tracking_id` = lctd1.`parent_call_tracking_id`) AS account_id"+
            "  	"+
            " FROM ld_call_tracking_detail lctd1 "+
            " WHERE  "+
            " (SELECT group_id FROM `ld_call_tracking` lct WHERE lct.`call_tracking_id` = lctd1.`parent_call_tracking_id`) = "+groupId +
            " AND `version_no` = (SELECT MAX(version_no) FROM ld_call_tracking_detail lctd WHERE lctd.`parent_call_tracking_id` = lctd1.`parent_call_tracking_id`) "+
            " AND lctd1.`question_id`=41   "+
            " AND lctd1.`answer_id` = 134  "+
            " AND bm_verified =0 "+
            " GROUP BY lctd1.`parent_call_tracking_id`"+
            " )emi ON emi.client_id = client_det.client_id AND emi.account_id = client_det.account_id"+
            " LEFT JOIN "+
            " (SELECT "+
            " `call_tracking_detail_id` AS interest_call_track_id,"+
            " `cce_remarks` AS interest_mismatch,"+
            " bm_verified,"+
            " version_no, "+
            " (SELECT client_id FROM `ld_call_tracking` lct WHERE lct.`call_tracking_id` = lctd1.`parent_call_tracking_id`) AS client_id,"+
            " (SELECT group_id FROM `ld_call_tracking` lct WHERE lct.`call_tracking_id` = lctd1.`parent_call_tracking_id`) AS group_id,"+
            " (SELECT account_id FROM `ld_call_tracking` lct WHERE lct.`call_tracking_id` = lctd1.`parent_call_tracking_id`) AS account_id"+
            " FROM ld_call_tracking_detail lctd1 "+
            " WHERE  "+
            " (SELECT group_id FROM `ld_call_tracking` lct WHERE lct.`call_tracking_id` = lctd1.`parent_call_tracking_id`) = "+groupId +
            " AND `version_no` = (SELECT MAX(version_no) FROM ld_call_tracking_detail lctd WHERE lctd.`parent_call_tracking_id` = lctd1.`parent_call_tracking_id`) "+
            " AND lctd1.`question_id`=42   "+
            " AND lctd1.`answer_id` = 136  "+
            " AND bm_verified = 0"+
            " GROUP BY lctd1.`parent_call_tracking_id`"+
            " )interest ON interest.client_id = client_det.client_id AND interest.account_id = client_det.account_id"+
            " LEFT JOIN "+
            " (SELECT "+
            " `call_tracking_detail_id` AS tenure_call_track_id,"+
            " `cce_remarks` AS tenure_mismatch,"+
            " bm_verified,"+
            " version_no, "+
            " (SELECT client_id FROM `ld_call_tracking` lct WHERE lct.`call_tracking_id` = lctd1.`parent_call_tracking_id`) AS client_id,"+
            " (SELECT group_id FROM `ld_call_tracking` lct WHERE lct.`call_tracking_id` = lctd1.`parent_call_tracking_id`) AS group_id,"+
            " (SELECT account_id FROM `ld_call_tracking` lct WHERE lct.`call_tracking_id` = lctd1.`parent_call_tracking_id`) AS account_id"+
            " FROM ld_call_tracking_detail lctd1 "+
            " WHERE  "+
            " (SELECT group_id FROM `ld_call_tracking` lct WHERE lct.`call_tracking_id` = lctd1.`parent_call_tracking_id`) = "+groupId +
            " AND `version_no` = (SELECT MAX(version_no) FROM ld_call_tracking_detail lctd WHERE lctd.`parent_call_tracking_id` = lctd1.`parent_call_tracking_id`) "+
            " AND lctd1.`question_id`=43   "+
            " AND lctd1.`answer_id` = 138  "+
            " AND bm_verified=0"+
            " GROUP BY lctd1.`parent_call_tracking_id`"+
            " )tenure ON tenure.client_id = client_det.client_id AND tenure.account_id = client_det.account_id"+
            " LEFT JOIN "+
            " (SELECT "+
            " `call_tracking_detail_id` AS call_status_track_id,"+
            " lctd1.`question_id`,lctd1.`answer_id`,ilv.`lookup_value`,"+
            " bm_verified,"+
            " version_no, "+
            " (SELECT client_id FROM `ld_call_tracking` lct WHERE lct.`call_tracking_id` = lctd1.`parent_call_tracking_id`) AS client_id,"+
            " (SELECT group_id FROM `ld_call_tracking` lct WHERE lct.`call_tracking_id` = lctd1.`parent_call_tracking_id`) AS group_id,"+
            " (SELECT account_id FROM `ld_call_tracking` lct WHERE lct.`call_tracking_id` = lctd1.`parent_call_tracking_id`) AS account_id"+
            " FROM ld_call_tracking_detail lctd1 "+
            " INNER JOIN `iklant_lookup_value` ilv ON ilv.`lookup_id` = lctd1.`answer_id`"+
            " WHERE  "+
            " (SELECT group_id FROM `ld_call_tracking` lct WHERE lct.`call_tracking_id` = lctd1.`parent_call_tracking_id`) = "+groupId +
            " AND `version_no` = (SELECT MAX(version_no) FROM ld_call_tracking_detail lctd WHERE lctd.`parent_call_tracking_id` = lctd1.`parent_call_tracking_id`) "+
            " AND lctd1.`question_id`=48   "+
            " AND (       "+
            " ( lctd1.`answer_id` = 148 AND (SELECT COUNT(*) FROM ld_call_tracking_detail lctd WHERE lctd.`parent_call_tracking_id` = lctd1.`parent_call_tracking_id` AND lctd.`answer_id` = 148) >= "+dbTableName.Lookup148Count+" )   "+
            " OR ( lctd1.`answer_id` = 149 AND (SELECT COUNT(*) FROM ld_call_tracking_detail lctd WHERE lctd.`parent_call_tracking_id` = lctd1.`parent_call_tracking_id` AND lctd.`answer_id` = 149) >= "+dbTableName.Lookup149Count+" )   "+
            " OR ( lctd1.`answer_id` = 150 AND (SELECT COUNT(*) FROM ld_call_tracking_detail lctd WHERE lctd.`parent_call_tracking_id` = lctd1.`parent_call_tracking_id` AND lctd.`answer_id` = 150) >= "+dbTableName.Lookup150Count+" )   "+
            " OR ( lctd1.`answer_id` = 151 AND (SELECT COUNT(*) FROM ld_call_tracking_detail lctd WHERE lctd.`parent_call_tracking_id` = lctd1.`parent_call_tracking_id` AND lctd.`answer_id` = 151) >= "+dbTableName.Lookup151Count+" )   "+
            " OR ( lctd1.`answer_id` = 152 AND (SELECT COUNT(*) FROM ld_call_tracking_detail lctd WHERE lctd.`parent_call_tracking_id` = lctd1.`parent_call_tracking_id` AND lctd.`answer_id` = 152) >= "+dbTableName.Lookup152Count+" )   "+
            " OR ( lctd1.`answer_id` = 153 AND (SELECT COUNT(*) FROM ld_call_tracking_detail lctd WHERE lctd.`parent_call_tracking_id` = lctd1.`parent_call_tracking_id` AND lctd.`answer_id` = 153) >= "+dbTableName.Lookup153Count+" )   "+
            " OR ( lctd1.`answer_id` = 154 AND (SELECT COUNT(*) FROM ld_call_tracking_detail lctd WHERE lctd.`parent_call_tracking_id` = lctd1.`parent_call_tracking_id` AND lctd.`answer_id` = 154) >= "+dbTableName.Lookup154Count+" )   "+
            " OR ( lctd1.`answer_id` = 155 AND (SELECT COUNT(*) FROM ld_call_tracking_detail lctd WHERE lctd.`parent_call_tracking_id` = lctd1.`parent_call_tracking_id` AND lctd.`answer_id` = 155) >= "+dbTableName.Lookup155Count+" )   "+
            " OR ( lctd1.`answer_id` = 156 AND (SELECT COUNT(*) FROM ld_call_tracking_detail lctd WHERE lctd.`parent_call_tracking_id` = lctd1.`parent_call_tracking_id` AND lctd.`answer_id` = 156) >= "+dbTableName.Lookup156Count+" )   "+
            " OR ( lctd1.`answer_id` = 157 AND (SELECT COUNT(*) FROM ld_call_tracking_detail lctd WHERE lctd.`parent_call_tracking_id` = lctd1.`parent_call_tracking_id` AND lctd.`answer_id` = 157) >= "+dbTableName.Lookup157Count+" )   "+
            " OR ( lctd1.`answer_id` = 158 AND (SELECT COUNT(*) FROM ld_call_tracking_detail lctd WHERE lctd.`parent_call_tracking_id` = lctd1.`parent_call_tracking_id` AND lctd.`answer_id` = 158) >= "+dbTableName.Lookup158Count+" )   "+
            " OR ( lctd1.`answer_id` = 162 AND (SELECT COUNT(*) FROM ld_call_tracking_detail lctd WHERE lctd.`parent_call_tracking_id` = lctd1.`parent_call_tracking_id` AND lctd.`answer_id` = 162) >= "+dbTableName.Lookup162Count+" )   "+
            " ) "+
            " AND bm_verified=0"+
            " GROUP BY lctd1.`parent_call_tracking_id`"+
            " )call_status ON call_status.client_id = client_det.client_id AND call_status.account_id = client_det.account_id"+
            " INNER JOIN `iklant_prospect_client` ipc ON ipc.`client_id` = client_det.`client_id`"+
            " INNER JOIN `iklant_prospect_group` ipg ON ipg.`group_id` = client_det.`group_id`"+
            " WHERE tenure_call_track_id IS NOT NULL OR interest_call_track_id IS NOT NULL OR emi_call_track_id IS NOT NULL OR call_status_track_id IS NOT NULL " +
            ")bm_status ON bm_status.client_id = ld_details.client_id AND bm_status.account_id = ld_details.account_id"+

            " LEFT JOIN ("+
            " SELECT "+
            " client_det.*"+
            " ,la.`loan_amount`"+
            " ,ipc.`client_name`"+
            " ,ipg.`center_name`"+
            " ,ipg.`group_name` "+
            " ,ipg.office_id "+
            " ,'Client In RM Queue' AS rm_queue"+
            " FROM"+
            " (SELECT "+
            " client_id,"+
            " group_id,"+
            " account_id "+
            " FROM"+
            " `ld_call_tracking` "+
            " WHERE group_id = "+groupId+
            " )client_det"+
            " LEFT JOIN "+
            " (SELECT "+
            " `call_tracking_detail_id` AS client_mistmatch_call_track_id,"+
            " `cce_remarks` AS client_mismatch,"+
            " rm_verified,"+
            " version_no,"+
            " (SELECT client_id FROM `ld_call_tracking` lct WHERE lct.`call_tracking_id` = lctd1.`parent_call_tracking_id`) AS client_id,"+
            " (SELECT group_id FROM `ld_call_tracking` lct WHERE lct.`call_tracking_id` = lctd1.`parent_call_tracking_id`) AS group_id,"+
            " (SELECT account_id FROM `ld_call_tracking` lct WHERE lct.`call_tracking_id` = lctd1.`parent_call_tracking_id`) AS account_id"+
            " FROM ld_call_tracking_detail lctd1 "+
            " WHERE (SELECT group_id FROM `ld_call_tracking` lct WHERE lct.`call_tracking_id` = lctd1.`parent_call_tracking_id`) = "+groupId +
            " AND `version_no` = (SELECT MAX(version_no) FROM ld_call_tracking_detail lctd WHERE lctd.`parent_call_tracking_id` = lctd1.`parent_call_tracking_id`) "+
            " AND lctd1.`question_id`=48   "+
            " AND lctd1.`answer_id` = 167  "+
            " 	   "+
            " AND rm_verified=0"+
            " GROUP BY lctd1.`parent_call_tracking_id`"+
            " )client_mismatch ON client_mismatch.client_id = client_det.client_id AND client_mismatch.account_id = client_det.account_id"+
            " LEFT JOIN "+
            " (SELECT "+
            " `call_tracking_detail_id` AS amount_mismatch_call_track_id,"+
            " `cce_remarks` AS amount_mismatch,"+
            " rm_verified,"+
            " version_no, "+
            " (SELECT client_id FROM `ld_call_tracking` lct WHERE lct.`call_tracking_id` = lctd1.`parent_call_tracking_id`) AS client_id,"+
            " (SELECT group_id FROM `ld_call_tracking` lct WHERE lct.`call_tracking_id` = lctd1.`parent_call_tracking_id`) AS group_id,"+
            " (SELECT account_id FROM `ld_call_tracking` lct WHERE lct.`call_tracking_id` = lctd1.`parent_call_tracking_id`) AS account_id"+
            " FROM ld_call_tracking_detail lctd1 "+
            " WHERE  "+
            " (SELECT group_id FROM `ld_call_tracking` lct WHERE lct.`call_tracking_id` = lctd1.`parent_call_tracking_id`) = "+groupId +
            " AND `version_no` = (SELECT MAX(version_no) FROM ld_call_tracking_detail lctd WHERE lctd.`parent_call_tracking_id` = lctd1.`parent_call_tracking_id`) "+
            " AND lctd1.`question_id`=40   "+
            " AND lctd1.`answer_id` = 132  "+
            " AND rm_verified=0 "+
            " GROUP BY lctd1.`parent_call_tracking_id`"+
            " )amount_mismatch ON amount_mismatch.client_id = client_det.client_id AND amount_mismatch.account_id = client_det.account_id"+
            " INNER JOIN loan_account la ON la.`account_id` = client_det.`account_id`"+
            " INNER JOIN `iklant_prospect_client` ipc ON ipc.`client_id` = client_det.`client_id`"+
            " INNER JOIN `iklant_prospect_group` ipg ON ipg.`group_id` = client_det.`group_id`"+
            " WHERE amount_mismatch_call_track_id IS NOT NULL OR  client_mistmatch_call_track_id IS NOT NULL)"+
            " rm_status ON rm_status.client_id = ld_details.client_id AND rm_status.account_id = ld_details.account_id"+
            " ORDER BY ld_details.account_id";
        customlog.info(retrieveLDClientQuery);
        connectionDataSource.getConnection(function (clientConnect) {
            clientConnect.query(retrieveLDClientQuery, function (err, result) {
                connectionDataSource.releaseConnectionPool(clientConnect);
                if(err){
                    customlog.info(err);
                    callback(result);
                }
                else{
                    callback(result);
                }
            });
        });
    },

   getLDGroupCaseDetailDataModel : function (groupId,roleId,callback){
         var retrieveLDClientQuery = "";
        if(roleId == this.constants.getSMHroleId()){
             retrieveLDClientQuery = " SELECT "+
                 " client_det.*"+
                 " ,client_mismatch.rm_verified AS client_mismatch_rm_verified"+
                 " ,amount_mismatch.rm_verified AS amount_mismatch_rm_verified"+
                 " ,client_mismatch.client_mistmatch_call_track_id"+
                 " ,client_mismatch.client_mismatch"+
                 " ,amount_mismatch.amount_mismatch_call_track_id"+
                 " ,amount_mismatch.amount_mismatch"+
                 " ,la.`loan_amount`"+
                 " ,ipc.`client_name`"+
                 " ,ipg.`center_name`"+
                 " ,ipg.`group_name` "+
                 " ,ipg.office_id "+
                 " FROM"+
                 " (SELECT "+
                 " client_id,"+
                 " group_id,"+
                 " account_id "+
                 " FROM"+
                 " `ld_call_tracking` "+
                 " WHERE group_id = "+groupId+
                 " GROUP BY client_id"+
                 " )client_det"+
                 " LEFT JOIN "+
                 " (SELECT "+
                 " `call_tracking_detail_id` AS client_mistmatch_call_track_id,"+
                 " `cce_remarks` AS client_mismatch,"+
                 " rm_verified,"+
                 " version_no,"+
                 " (SELECT client_id FROM `ld_call_tracking` lct WHERE lct.`call_tracking_id` = lctd1.`parent_call_tracking_id`) AS client_id,"+
                 " (SELECT group_id FROM `ld_call_tracking` lct WHERE lct.`call_tracking_id` = lctd1.`parent_call_tracking_id`) AS group_id"+
                 " FROM ld_call_tracking_detail lctd1 "+
                 " WHERE " +
                " (SELECT group_id FROM `ld_call_tracking` lct WHERE lct.`call_tracking_id` = lctd1.`parent_call_tracking_id`) = "+groupId+
                " AND `version_no` = (SELECT MAX(version_no) FROM ld_call_tracking_detail lctd WHERE lctd.`parent_call_tracking_id` = lctd1.`parent_call_tracking_id`)"+
                " AND lctd1.`question_id`=48  "+
                 " AND lctd1.`answer_id` = 167 "+

                 " AND rm_verified=0"+
                 " GROUP BY lctd1.`parent_call_tracking_id`"+
                 " )client_mismatch ON client_mismatch.client_id = client_det.client_id"+
                 " LEFT JOIN "+
                 " (SELECT "+
                 " `call_tracking_detail_id` AS amount_mismatch_call_track_id,"+
                 " `cce_remarks` AS amount_mismatch,"+
                 " rm_verified,"+
                 " version_no, "+
                 " (SELECT client_id FROM `ld_call_tracking` lct WHERE lct.`call_tracking_id` = lctd1.`parent_call_tracking_id`) AS client_id,"+
                 " (SELECT group_id FROM `ld_call_tracking` lct WHERE lct.`call_tracking_id` = lctd1.`parent_call_tracking_id`) AS group_id"+
                 " FROM ld_call_tracking_detail lctd1 "+
                 " WHERE " +
                 " (SELECT group_id FROM `ld_call_tracking` lct WHERE lct.`call_tracking_id` = lctd1.`parent_call_tracking_id`) = "+groupId+
                 " AND `version_no` = (SELECT MAX(version_no) FROM ld_call_tracking_detail lctd WHERE lctd.`parent_call_tracking_id` = lctd1.`parent_call_tracking_id`)"+
                 " AND lctd1.`question_id`=40  "+
                 " AND lctd1.`answer_id` = 132 "+
                 " AND rm_verified=0"+
                 " GROUP BY lctd1.`parent_call_tracking_id`"+
                 " )amount_mismatch ON amount_mismatch.client_id = client_det.client_id"+
                 " INNER JOIN loan_account la ON la.`account_id` = client_det.`account_id`"+
                 " INNER JOIN `iklant_prospect_client` ipc ON ipc.`client_id` = client_det.`client_id`"+
                 " INNER JOIN `iklant_prospect_group` ipg ON ipg.`group_id` = client_det.`group_id`"+
                 " WHERE amount_mismatch_call_track_id IS NOT NULL OR  client_mistmatch_call_track_id IS NOT NULL";
        }
            else{
                retrieveLDClientQuery =   " SELECT "+
                    " client_det.*"+
                    " ,emi.bm_verified AS emi_bm_verified"+
                    " ,interest.bm_verified AS interest_bm_verified"+
                    " ,tenure.bm_verified AS tenure_bm_verified"+
                    " ,emi.emi_call_track_id"+
                    " ,interest.interest_call_track_id"+
                    " ,tenure.tenure_call_track_id"+
                    " ,IFNULL(emi.emi_mismatch,'') AS emi_mismatch"+
                    " ,ROUND((SELECT (ls.principal+ls.interest) FROM `loan_schedule` ls WHERE ls.account_id = la.`account_id` AND ls.installment_id = 2),0) AS emi_amount"+
                    " ,IFNULL(interest.interest_mismatch,'') AS interest_mismatch"+
                    " ,ROUND(la.`interest_rate`,2) AS interest_rate"+
                    " ,IFNULL(tenure.tenure_mismatch,'') AS tenure_mismatch"+
                    " ,(SELECT COUNT(*) FROM `loan_schedule` ls WHERE ls.account_id = la.`account_id`) AS tenure_period"+
                    " ,call_status_track_id "+
                    "  ,IFNULL(call_status.lookup_value,'Call Success') AS call_status"+
                    " ,la.`loan_amount`"+
                    " ,ipc.`client_name`"+
                    " ,ipg.`center_name`"+
                    " ,ipg.`group_name`  "+
                    " ,ipg.office_id "+
                    " FROM"+
                    " (SELECT "+
                    " client_id,"+
                    " group_id,"+
                    " account_id "+
                    " FROM"+
                    " `ld_call_tracking` "+
                    " WHERE group_id = "+groupId+
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
                    " (SELECT group_id FROM `ld_call_tracking` lct WHERE lct.`call_tracking_id` = lctd1.`parent_call_tracking_id`) = "+groupId+
                    " AND `version_no` = (SELECT MAX(version_no) FROM ld_call_tracking_detail lctd WHERE lctd.`parent_call_tracking_id` = lctd1.`parent_call_tracking_id`)"+
                    " AND lctd1.`question_id`=41  "+
                    " AND lctd1.`answer_id` = 134 "+
                    " AND bm_verified =0 "+
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
                    " (SELECT group_id FROM `ld_call_tracking` lct WHERE lct.`call_tracking_id` = lctd1.`parent_call_tracking_id`) = "+groupId+
                    " AND `version_no` = (SELECT MAX(version_no) FROM ld_call_tracking_detail lctd WHERE lctd.`parent_call_tracking_id` = lctd1.`parent_call_tracking_id`)"+
                    " AND lctd1.`question_id`=42  "+
                    " AND lctd1.`answer_id` = 136 "+
                    " AND bm_verified = 0"+
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
                    " (SELECT group_id FROM `ld_call_tracking` lct WHERE lct.`call_tracking_id` = lctd1.`parent_call_tracking_id`) = "+groupId+
                    " AND `version_no` = (SELECT MAX(version_no) FROM ld_call_tracking_detail lctd WHERE lctd.`parent_call_tracking_id` = lctd1.`parent_call_tracking_id`)"+
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
                    " (SELECT group_id FROM `ld_call_tracking` lct WHERE lct.`call_tracking_id` = lctd1.`parent_call_tracking_id`) = "+groupId+
                    " AND `version_no` = (SELECT MAX(version_no) FROM ld_call_tracking_detail lctd WHERE lctd.`parent_call_tracking_id` = lctd1.`parent_call_tracking_id`)"+
                    " AND lctd1.`question_id`=48  "+
                    " AND (      "+
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
                    " )"+

                    " AND bm_verified=0"+
                    " GROUP BY lctd1.`parent_call_tracking_id`"+
                    " )call_status ON call_status.client_id = client_det.client_id"+
                    " INNER JOIN loan_account la ON la.`account_id` = client_det.`account_id`"+
                    " INNER JOIN `iklant_prospect_client` ipc ON ipc.`client_id` = client_det.`client_id`"+
                    " INNER JOIN `iklant_prospect_group` ipg ON ipg.`group_id` = client_det.`group_id`"+
                    " WHERE tenure_call_track_id IS NOT NULL OR interest_call_track_id IS NOT NULL OR emi_call_track_id IS NOT NULL OR call_status_track_id IS NOT NULL ";

        }
       customlog.info(retrieveLDClientQuery);
        connectionDataSource.getConnection(function (clientConnect) {
            clientConnect.query(retrieveLDClientQuery, function (err, result) {
                connectionDataSource.releaseConnectionPool(clientConnect);
                if(err){
                    customlog.info(err);
                    callback(result);
                }
                else{
                    callback(result);
                }
            });
        });
   },

   saveLeaderDetailsCallDataModel: function (req, res,groupId,loanCount,callback) {
        var constantsObj = this.constants;
        var self = this;
        var clientIdListArray = new Array();
        clientIdListArray = (req.body.clientIdArray).split(",");
        var isDataVerified = req.body.isDataVerified;
        var statusId;
        if(isDataVerified == 1){
            statusId = constantsObj.getDataVerificationOperationId();
        }else{
            //statusId = constantsObj.getKYCCompleted();
            statusId = constantsObj.getLeaderSubLeaderVerifiedStatus();
        }
        connectionDataSource.getConnection(function (clientConnect) {
            for(var i=0;i< clientIdListArray.length;i++){
                var isLeader = req.body['isLeader_'+i];
                var subGroupCode = req.body['subGroupCode_'+clientIdListArray[i]];
                if(isLeader){
                    var updateSubLeaderProspectGroupQuery = "UPDATE iklant_prospect_group SET leader_global_number = '"+subGroupCode+"',status_id = "+statusId+",updated_date=NOW() + INTERVAL 5 HOUR + INTERVAL 30 MINUTE  WHERE group_id = "+groupId;
                    clientConnect.query(updateSubLeaderProspectGroupQuery, function (err, results) {
                        connectionDataSource.releaseConnectionPool(clientConnect);
                        if (err) {
                            customlog.error(err);
                            callback("failure");
                        }else {
                            self.updateBODashboardTable(groupId);
                            self.insertGroupStatusEntryDateDataModel(clientConnect,groupId,statusId,function(status){
                                callback("success");
                            });
                        }
                    });
                }
            }
        });
   },

    updateKYCRequestDataModel : function(userId,clientId, oldMobileNumber, oldLandLineNumber, newMobileNumber, newLandLineNumber, remarks, roleId, operationId, callback){
        var updateQuery = "",updateClientQuery = "";
        var constantsObj = this.constants;
        var self = this;
        var kycDetailsQuery = "SELECT * FROM " + dbTableName.iklantProspectClientPreviousContact + " WHERE client_id = "+clientId;
        connectionDataSource.getConnection(function (clientConnect) {
            clientConnect.query(kycDetailsQuery, function (error, result) {
                if (error) {
                    connectionDataSource.releaseConnectionPool(clientConnect);
                    customlog.error(error);
                    callback('failure');
                }
                else if(result.length > 0){
                    if(roleId == constantsObj.getBMroleId() && (operationId == constantsObj.getAppraisalOperationId() || operationId == constantsObj.getLUCOperationId() || operationId == constantsObj.getLoanSanctionOperationId())){
                        updateQuery = "UPDATE " + dbTableName.iklantProspectClientPreviousContact + " SET mobile_number = '" + oldMobileNumber + "', landline_number = '" + oldLandLineNumber + "', new_mobile_number = '" + newMobileNumber + "', " +
                        "new_landline_number = '" + newLandLineNumber + "', bm_remarks = '" + remarks + "', verification_status = 1,last_requested_date = NOW() + INTERVAL 5 HOUR + INTERVAL 30 MINUTE,last_requested_userId = "+userId+" WHERE client_id = " + clientId
                    }
                    else if(roleId == constantsObj.getDEOroleId()){

                    }
                    else if(roleId == constantsObj.getSMHroleId()){

                    }
                    else{

                    }
                    clientConnect.query(updateQuery, function (err) {
                        if(err){
                            connectionDataSource.releaseConnectionPool(clientConnect);
                            customlog.error(err);
                            callback('failure');
                        }
                        else{
                            self.updateClientStatus(clientId,clientConnect, callback);
                        }
                    });
                }
                else{
                    if((roleId == constantsObj.getBMroleId() || roleId == constantsObj.getAccountsExecutiveRoleId()) && (operationId == constantsObj.getAppraisalOperationId() || operationId == constantsObj.getLUCOperationId() || operationId == constantsObj.getLoanSanctionOperationId())){
                        updateQuery = "INSERT INTO " + dbTableName.iklantProspectClientPreviousContact + " (client_id,mobile_number,landline_number,new_mobile_number,new_landline_number,bm_remarks,verification_status,created_date,requested_userId)" +
                        "VALUES(" + clientId + ",'" + oldMobileNumber + "','" + oldLandLineNumber + "','" + newMobileNumber + "','" + newLandLineNumber + "','" + remarks + "',1,NOW() + INTERVAL 5 HOUR + INTERVAL 30 MINUTE,"+userId+")";
                    }
                    else {
                        updateQuery = "INSERT INTO " + dbTableName.iklantProspectClientPreviousContact + " (client_id,mobile_number,landline_number,new_mobile_number,new_landline_number,verification_status,created_date,requested_userId)" +
                        "VALUES(" + clientId + ",'" + oldMobileNumber + "','" + oldLandLineNumber + "','" + newMobileNumber + "','" + newLandLineNumber + "',0,NOW() + INTERVAL 5 HOUR + INTERVAL 30 MINUTE,"+userId+")";
                    }
                    clientConnect.query(updateQuery, function (err) {
                        if(err){
                            connectionDataSource.releaseConnectionPool(clientConnect);
                            customlog.error(err);
                            callback('failure');
                        }
                        else{
                            self.updateClientStatus(clientId,clientConnect, callback);
                        }
                    });
                }
            });
        });
    },
    updateKYCChangeClientDocAndroidDataModel: function (captured_image, clientID, doc_type_id, doc_name,loanCount, callback) {
        customlog.info("Datamodel : insertKycDocumentDetailsAndroidDataModel entry........ :");
        var constantsObj = this.constants;
        var self = this;
        var insertClientDocQuery = "INSERT INTO "+dbTableName.iklantClientDoc+" (Captured_image,client_id,doc_type_id,doc_name,loan_count,version) " +
            "VALUES('" + captured_image + "',"+clientID+", " +"" + doc_type_id + ",'" + doc_name + "',"+loanCount+",1.00)";
        customlog.info("Datamodel :insertClientDocQuery :" + insertClientDocQuery);
        connectionDataSource.getConnection(function (clientConnect) {
            clientConnect.query(insertClientDocQuery, function selectCb(err, results, fields) {
                if (err) {
                    connectionDataSource.releaseConnectionPool(clientConnect);
                    callback('failure');
                } else {
                    customlog.info("Datamodel :checkClientAvailablityQuery :" + " insert document : only.... ");
                    connectionDataSource.releaseConnectionPool(clientConnect);
                    callback(status);
                }
            });
        });
    },

    updateClientStatus : function(clientId,clientConnect, callback){
        var updateClientQuery = "UPDATE " + dbTableName.iklantProspectClient + " SET kyc_update_request = 1 WHERE client_id = "+clientId;
        clientConnect.query(updateClientQuery, function (err) {
            connectionDataSource.releaseConnectionPool(clientConnect);
            if(err){
                callback('failure');
            }else{
                callback('success');
            }
        })
    },

    retrieveKYCReUpdateDataModel : function(groupId, roleId, callback){
        var clientIds = new Array();
        var clientNames = new Array();
        var constantsObj = this.constants;
        var updateClientQuery = "SELECT pc.client_id,CONCAT(pc.client_name,' ',pc.client_last_name) AS client_name," +
            "pg.group_name,pg.center_name FROM " + dbTableName.iklantProspectClient + " pc " +
            "INNER JOIN " + dbTableName.iklantProspectGroup + " pg ON pg.group_id = pc.group_id " +
            "LEFT JOIN " + dbTableName.iklantProspectClientPreviousContact + " ippc ON ippc.client_id = pc.client_id " +
            "WHERE pc.group_id = " + groupId + " AND pc.kyc_update_request = 1";
        if(roleId == constantsObj.getBMroleId()){
            updateClientQuery += " AND ippc.verification_status = 0";
        }
        else if(roleId == constantsObj.getDEOroleId()){
            updateClientQuery += " AND ippc.verification_status IN (1,3)";
        }
        else if(roleId == constantsObj.getSMHroleId()){
            updateClientQuery += " AND ippc.verification_status IN (2)";
        }
        connectionDataSource.getConnection(function (clientConnect) {
            clientConnect.query(updateClientQuery, function (err,result) {
                connectionDataSource.releaseConnectionPool(clientConnect);
                if(err){
                    callback('failure');
                }else{
                    var centerName = "", groupName = "";
                    for(var i=0; i<result.length; i++){
                        clientIds[i] = result[i].client_id;
                        clientNames[i] = result[i].client_name;
                        centerName = result[0].center_name;
                        groupName = result[0].group_name;
                    }
                    callback('success',groupName, centerName, clientIds,clientNames);
                }
            })
        });
    },

    retrieveKYCClientDetailsDataModel : function(groupId, clientId, callback){
        var status = 'success';
        var constantsObj = this.constants;
        var reqProsClient = require(commonDTO +"/prospectClient");
        var prospectClient = new reqProsClient();
        var allDocTypeIdArray = new Array();
        var allDocTypeNameArray = new Array();
        var base64ImageArray = new Array();
        var fs = require("fs");
        customlog.info("In retrieveKYCClientDetailsDataModel");
        connectionDataSource.getConnection(function (clientConnect) {
            var imageQuery = "SELECT cd.Captured_image,dt.doc_name,IF(dt.doc_id=3,1,IF(dt.doc_id=6,2,IF(dt.doc_id=8,3,IF(dt.doc_id=7,4,IF(dt.doc_id=9,5,IF(dt.doc_id=12,6,7)))))) AS doc_id FROM "+dbTableName.iklantClientDoc+" cd " +
                "LEFT JOIN iklant_doc_type dt ON dt.doc_id = cd.doc_type_id WHERE " +
                "client_id=" + clientId + " AND cd.doc_type_id = 7 AND cd.version = 1.00 AND cd.loan_count = (SELECT loan_count FROM `iklant_prospect_client` WHERE client_id = " + clientId + ") ORDER BY doc_id";
            clientConnect.query(imageQuery, function selectCb(err, results) {
                if (err) {
                    connectionDataSource.releaseConnectionPool(clientConnect);
                    customlog.error(err);
                    status = 'failure';
                    callback(status,base64ImageArray, allDocTypeIdArray,allDocTypeNameArray);
                } else {
                    for (var i = 0; i < results.length; i++) {
                        var fieldName = results[i];
                        var imageLocation = fieldName.Captured_image;
                        try {
                            customlog.info(imageLocation);
                            var bitmap = fs.readFileSync(imageLocation);
                            allDocTypeNameArray[i] = fieldName.doc_name;
                            allDocTypeIdArray[i] = fieldName.doc_id;
                            base64ImageArray[i] = "data:image\/png;base64," + new Buffer(bitmap).toString('base64');
                        } catch (exc) {
                            customlog.error("Unable to read the file "+ exc)
                            if (exc) {
                                status = 'No Documents found for this member';
                            }
                        }
                    }
                    var clientDetailsQuery = "SELECT ippc.client_id,ipc.client_name,ipc.client_last_name,ippc.mobile_number,ippc.landline_number,ippc.`mobile_number_matched`,ippc.`landline_number_matched`,ippc.`address_matched`," +
                        "ippc.new_mobile_number,ippc.new_landline_number,CONCAT(ipp.address,',',ipp.pincode) AS address,CONCAT(ippc.address,',',ippc.pin_code) AS newAddress,ippc.bm_remarks,ippc.rm_remarks," +
                        "ippc.deo_remarks,ippc.verification_status,ippc.mobile_number_matched,ippc.landline_number_matched,ippc.address_matched " +
                        "FROM iklant_prospect_client_previous_contact ippc  " +
                        "INNER JOIN iklant_prospect_client ipc ON ipc.client_id = ippc.client_id " +
                        "INNER JOIN iklant_prospect_client_personal ipp ON ipp.client_id = ippc.client_id " +
                        "WHERE ippc.client_id = "+clientId;
                    clientConnect.query(clientDetailsQuery, function selectCb(err, clientResult) {
                        connectionDataSource.releaseConnectionPool(clientConnect);
                        callback(status, base64ImageArray, allDocTypeIdArray, allDocTypeNameArray,clientResult);
                    });
                }
            });
        });
    },

    saveKYCUpdateDetailsDataModel : function(userId,clientId, mobileNumberMatched, landLineNumberMatched, addressMatched, newAddress, pinCode, remarks, updateKYCVerificationStatus, roleId, callback){
        var constantsObj = this.constants;
        var updatePreviousContactQuery = "";
        var updateCustomerContactQuery = "";
        if(updateKYCVerificationStatus == constantsObj.getVerificationSuccess() || (updateKYCVerificationStatus == constantsObj.getDEORejected() && ( mobileNumberMatched == 1 ||landLineNumberMatched == 1 || addressMatched == 1 ))){
            var kycUpdateRequest = 0
            if(mobileNumberMatched == 0 || landLineNumberMatched == 0 || addressMatched == 0){
                kycUpdateRequest = 1;
            }
            updatePreviousContactQuery = "UPDATE " + dbTableName.iklantProspectClientPreviousContact + " ippc," + dbTableName.iklantProspectClient + " ipc," + dbTableName.iklantProspectClientPersonal + " ipp " +
            "SET ippc.address = ipp.address,ippc.pin_code = ipp.pincode," +
            "ippc.mobile_number_matched = " + mobileNumberMatched +
            ",ippc.landline_number_matched = " + landLineNumberMatched +
            ",ippc.address_matched = " + addressMatched +
            ",ippc.verification_status = " + updateKYCVerificationStatus + ",ipc.kyc_update_request = "+kycUpdateRequest;
            if(mobileNumberMatched == 1){
                updatePreviousContactQuery += ",ipp.mobile_number = ippc.new_mobile_number";
            }
            if(landLineNumberMatched == 1){
                updatePreviousContactQuery += ",ipp.landline_number = ippc.new_landline_number";
            }
            //"ipp.address = '" + newAddress + "',ipp.pincode =  '" + pinCode + "'," +
            updatePreviousContactQuery += ",deo_remarks = '" + remarks + "',deo_verified_by = "+userId+",deo_verified_date = NOW() + INTERVAL 5 HOUR + INTERVAL 30 MINUTE " +
            "WHERE ippc.client_id = " + clientId + " AND ipc.client_id = " + clientId + "  AND ipp.client_id = " + clientId;
        }else{
            if(updateKYCVerificationStatus == constantsObj.getBMVerified()){
                updatePreviousContactQuery = "UPDATE " + dbTableName.iklantProspectClientPreviousContact + " SET verification_status = " + updateKYCVerificationStatus + ", bm_remarks = '" + remarks + "',bm_verified_date = NOW() + INTERVAL 5 HOUR + INTERVAL 30 MINUTE,";
            }
            else if(updateKYCVerificationStatus == constantsObj.getRMVerified()){
                updatePreviousContactQuery = "UPDATE " + dbTableName.iklantProspectClientPreviousContact + " SET verification_status = " + updateKYCVerificationStatus + ", rm_remarks = '" + remarks + "',rm_verified_date = NOW() + INTERVAL 5 HOUR + INTERVAL 30 MINUTE,";
            }
            else if(updateKYCVerificationStatus == constantsObj.getDEORejected()){
                updatePreviousContactQuery = "UPDATE " + dbTableName.iklantProspectClientPreviousContact + " SET verification_status = " + updateKYCVerificationStatus + ", deo_remarks = '" + remarks + "',deo_verified_by = "+userId+",deo_verified_date = NOW() + INTERVAL 5 HOUR + INTERVAL 30 MINUTE,";
            }
            else if(updateKYCVerificationStatus == constantsObj.getVerificationFailed() && roleId == constantsObj.getBMroleId()){
                updatePreviousContactQuery = "UPDATE " + dbTableName.iklantProspectClientPreviousContact + " SET verification_status = " + updateKYCVerificationStatus + ", bm_remarks = '" + remarks + "',bm_verified_date = NOW() + INTERVAL 5 HOUR + INTERVAL 30 MINUTE,";
            }
            else if(updateKYCVerificationStatus == constantsObj.getVerificationFailed()){
                updatePreviousContactQuery = "UPDATE " + dbTableName.iklantProspectClientPreviousContact + " ipcc,"+ dbTableName.iklantProspectClient +" ipc SET verification_status = " + updateKYCVerificationStatus + ", rm_remarks = '" + remarks + "',rm_verified_date = NOW() + INTERVAL 5 HOUR + INTERVAL 30 MINUTE,";
                updatePreviousContactQuery += " mobile_number_matched = "+ mobileNumberMatched + ",landline_number_matched = "+ landLineNumberMatched +",address_matched = "+ addressMatched +",ipc.kyc_update_request = 0 WHERE ipcc.client_id = ipc.client_id and ipc.client_id = " + clientId;
            }else{
                updatePreviousContactQuery = "UPDATE " + dbTableName.iklantProspectClientPreviousContact + " SET verification_status = " + updateKYCVerificationStatus + ", rm_remarks = '" + remarks + "',rm_verified_date = NOW() + INTERVAL 5 HOUR + INTERVAL 30 MINUTE,";
            }
            if(updateKYCVerificationStatus != constantsObj.getVerificationFailed()){
                updatePreviousContactQuery += " mobile_number_matched = "+ mobileNumberMatched + ",landline_number_matched = "+ landLineNumberMatched +",address_matched = "+ addressMatched +" WHERE client_id = " + clientId;
            }

        }

        customlog.info("updatePreviousContactQuery: "+updatePreviousContactQuery);
        connectionDataSource.getConnection(function (clientConnect) {
            clientConnect.query(updatePreviousContactQuery, function(err) {
                if (err) {
                    connectionDataSource.releaseConnectionPool(clientConnect);
                    customlog.error("updatePreviousContactQuery: "+updatePreviousContactQuery+"\n"+err);
                    callback('failure');
                } else {
                    if(updateKYCVerificationStatus == constantsObj.getVerificationSuccess()){
                        var retrieveClientContactQuery = "SELECT IFNULL(imm.mifos_client_customer_id,0) AS customer_id, " +
                            "IFNULL(SUBSTRING_INDEX(pcp.address,',',2),'') AS line1,  " +
                            "IFNULL(SUBSTRING_INDEX(SUBSTRING_INDEX(pcp.address,',',3),',',-1),'') AS line2, " +
                            "IFNULL(SUBSTRING_INDEX(SUBSTRING_INDEX(pcp.address,',',4),',',-1),'') AS line3, " +
                            "IFNULL(SUBSTRING_INDEX(SUBSTRING_INDEX(pcp.address,',',5),',',-1),'') AS city, " +
                            "pcp.pincode AS zip, " +
                            "IFNULL(pcp.mobile_number,pcp.landline_number) AS phoneNumber " +
                            "FROM iklant_prospect_client pc " +
                            "INNER JOIN iklant_prospect_group pg ON pg.group_id = pc.group_id " +
                            "INNER JOIN iklant_mifos_mapping imm ON imm.client_id = pc.client_id " +
                            "INNER JOIN iklant_prospect_client_personal pcp ON pcp.client_id = pc.client_id  " +
                            "WHERE pc.client_id = " + clientId + " AND pc.status_id = " + constantsObj.getAuthorizedStatus();
                        customlog.info("retrieveClientContactQuery: "+retrieveClientContactQuery);
                        clientConnect.query(retrieveClientContactQuery, function(err, results) {
                            if(!err && results.length > 0){
                                var updateMifosContactQuery = "UPDATE customer_address_detail SET " +
                                    //"line_1 = '" + results[0].line1 + "',line_2 = '" + results[0].line2 + "'," +
                                    //"line_3 = '" + results[0].line3 + "',city = '" + results[0].city + "',zip = '" + results[0].zip + "'," +
                                    "phone_number = '" + results[0].phoneNumber + "' " +
                                    "WHERE customer_id = " + results[0].customer_id;
                                clientConnect.query(updateMifosContactQuery, function(error) {
                                    connectionDataSource.releaseConnectionPool(clientConnect);
                                    if(error){
                                        customlog.error("updateMifosContactQuery: "+updateMifosContactQuery+"\n"+error);
                                        callback('failure');
                                    }
                                    else{
                                        callback('success');
                                    }
                                });
                            }
                            else{
                                connectionDataSource.releaseConnectionPool(clientConnect);
                                callback('success');
                            }
                        });
                    }
                    else{
                        connectionDataSource.releaseConnectionPool(clientConnect);
                        callback('success');
                    }
                }
            });
        });
    },

    checkDuplicateClientNameWithDOBAndGuarantorDataModel : function(clientName,dateOfBirth,gurantorName,clientId,callback){
        var clientName = clientName.trim();
        var gurantorName = gurantorName.trim();
        var dateInArray = dateOfBirth.split("/");
        var dateOfBirthValue = dateInArray[2]+dateInArray[1]+dateInArray[0];
        var mifosClientCustomerIdQuery = "SELECT mifos_client_customer_id,(SELECT group_name FROM iklant_prospect_group pg WHERE group_id = pg.group_id = group_id) AS group_code  FROM iklant_mifos_mapping WHERE client_id = "+clientId;
        connectionDataSource.getConnection(function (clientConnect) {
            clientConnect.query(mifosClientCustomerIdQuery, function (err,result) {
                var duplicateClientArray = new Array();
                if(err){
                    customlog.error("Error in mifosClientCustomerIdQuery "+err);
                    connectionDataSource.releaseConnectionPool(clientConnect);
                    callback(duplicateClientArray);
                }else{
                    var checkDuplicateClientQuery;
                    if(result.length != 0){
                        checkDuplicateClientQuery = "SELECT * FROM (SELECT client_det.customer_id,DATE_FORMAT(date_of_birth,'%Y/%m%/%d') AS dob,cnd.display_name as gurantor,IFNULL((SELECT group_name FROM `iklant_mifos_mapping` imm,iklant_prospect_group pg WHERE pg.group_id = imm.group_id AND mifos_client_customer_id = client_det.customer_id),'Created in Mifos') AS group_code, " +
                            " a.account_state_id,client_det.parent_customer_id,(SELECT `office_name` FROM `iklant_office` WHERE office_id = client_det.branch_id) AS office_name,(SELECT ast.`status_description` FROM loan_account la,account ac,`account_state` ast WHERE ac.account_id = la.account_id AND la.parent_account_id = a.account_id AND " +
                            " ast.`account_state_id` = ac.`account_state_id` AND customer_id = client_det.customer_id) AS client_loan_status," +
                            " accst.`status_description` AS group_loan_status,(SELECT display_name FROM customer c1 WHERE c1.customer_id = client_det.parent_customer_id) AS group_name," +
                            " client_det.display_name AS clientName FROM customer client_det,customer_name_detail cnd,account a,account_state accst WHERE a.customer_id = client_det.parent_customer_id AND a.`account_state_id` = accst.`account_state_id` AND client_det.customer_id = cnd.customer_id AND client_det.display_name = '"+clientName+"' AND client_det.customer_level_id = 1 " +
                            " AND client_det.date_of_birth = DATE("+dateOfBirthValue+") and a.`account_state_id` in (5,6,9) AND client_det.status_id!=6 AND cnd.name_type IN  (SELECT `spouse_father_id` FROM `spouse_father_lookup`) AND cnd.first_name = '"+gurantorName+"' AND ((("+result[0].mifos_client_customer_id+") = 0) " +
                            " OR (("+result[0].mifos_client_customer_id+") != 0 AND client_det.customer_id != ("+result[0].mifos_client_customer_id+"))) )detail WHERE client_loan_status IS NOT NULL ORDER BY client_loan_status ";
                        customlog.info("checkDuplicateClientQuery "+clientId+" : "+checkDuplicateClientQuery);
                    }else{
                        checkDuplicateClientQuery = "SELECT * FROM (SELECT client_det.customer_id,DATE_FORMAT(date_of_birth,'%Y/%m%/%d') AS dob,cnd.display_name as gurantor,IFNULL((SELECT group_name FROM `iklant_mifos_mapping` imm,iklant_prospect_group pg WHERE pg.group_id = imm.group_id AND mifos_client_customer_id = client_det.customer_id),'Created in Mifos') AS group_code, " +
                            " a.account_state_id,client_det.parent_customer_id,(SELECT `office_name` FROM `iklant_office` WHERE office_id = client_det.branch_id) AS office_name,(SELECT ast.`status_description` FROM loan_account la,account ac,`account_state` ast WHERE ac.account_id = la.account_id AND la.parent_account_id = a.account_id AND " +
                            " ast.`account_state_id` = ac.`account_state_id` AND customer_id = client_det.customer_id) AS client_loan_status," +
                            " accst.`status_description` AS group_loan_status,(SELECT display_name FROM customer c1 WHERE c1.customer_id = client_det.parent_customer_id) AS group_name," +
                            " client_det.display_name AS clientName FROM customer client_det,customer_name_detail cnd,account a,account_state accst WHERE a.customer_id = client_det.parent_customer_id AND a.`account_state_id` = accst.`account_state_id` AND client_det.customer_id = cnd.customer_id AND client_det.display_name = '"+clientName+"' AND client_det.customer_level_id = 1 " +
                            " AND client_det.date_of_birth = DATE("+dateOfBirthValue+") and a.`account_state_id` in (5,6,9) AND client_det.status_id!=6 AND cnd.name_type IN  (SELECT `spouse_father_id` FROM `spouse_father_lookup`) AND cnd.first_name = '"+gurantorName+"' )detail WHERE client_loan_status IS NOT NULL ORDER BY client_loan_status";
                        customlog.info("checkDuplicateClientQuery "+clientId+" : "+checkDuplicateClientQuery);
                    }
                    clientConnect.query(checkDuplicateClientQuery, function (err,results) {
                        connectionDataSource.releaseConnectionPool(clientConnect);
                        if(err){
                            customlog.error("Error in Duplicate Name "+err);
                            callback(duplicateClientArray);
                        }else{
                            if(results.length != 0){
                                for (var i = 0; i < results.length; i++) {
                                    var duplicateNameString = "Already Exists Member: "+results[i].clientName+", DOB: "+results[i].dob+", Guarantor: "+results[i].gurantor+", Group Code and Name:"+results[i].group_name+" "+results[i].group_code+", Group Loan Status:"
                                        +results[i].group_loan_status+", Member Loan Status: "+results[i].client_loan_status+", Branch :"+results[i].office_name;
                                    customlog.info("duplicateNameString "+duplicateNameString+"CustomerId "+results[i].customer_id);
                                    duplicateClientArray[i] = duplicateNameString;
                                    break;
                                }
                            }
                            callback(duplicateClientArray);
                        }
                    });
                }
            });
        });
    },

    insertGroupStatusEntryDateDataModel : function(clientConnect,groupId,statusId,callback){
        var constantsObj = this.constants;
        var statusQuery;
        if(statusId == 0){    // statusId == 0 , it will send clientId
            //statusQuery = "(SELECT status_id FROM `iklant_prospect_group` WHERE group_id = (select group_id from iklant_prospect_client where client_id = "+groupId+"))";
            statusQuery = constantsObj.getCreditBureauAnalysedStatus();
        }else{
            statusQuery  = statusId;
        }
        var previousStatusId;
        if(statusQuery == constantsObj.getKYCCompleted()){
            previousStatusId = constantsObj.getKYCUploaded();
        }else if(statusQuery == constantsObj.getLeaderSubLeaderUpdatedStatus()){
            previousStatusId = constantsObj.getKYCCompleted();
        }else if(statusQuery == constantsObj.getLeaderSubLeaderVerifiedStatus()){
            previousStatusId = constantsObj.getLeaderSubLeaderUpdatedStatus();
        }else if(statusQuery == 19){
            previousStatusId = constantsObj.getLeaderSubLeaderVerifiedStatus();
        }else if(statusQuery == constantsObj.getCreditBureauAnalysedStatus()){
            previousStatusId = 19;
        }else if(statusQuery == constantsObj.getFieldVerified()){
            previousStatusId = constantsObj.getCreditBureauAnalysedStatus();
        }else if(statusQuery == '01'){
            previousStatusId = constantsObj.getKYCCompleted();
        }


        var insertGroupStatusQuery;
        var groupIdQuery;
        if(statusId == 0){
             groupIdQuery = "(select group_id from iklant_prospect_client where client_id = "+groupId+")";
            insertGroupStatusQuery = "INSERT INTO `iklant_group_status_date_info`(`group_id`,`status_id`,`loan_count`,`status_date`,`created_date`)" +
                "VALUES ("+groupIdQuery+","+statusQuery+",(SELECT loan_count FROM `iklant_prospect_group` WHERE group_id = "+groupIdQuery+"),NOW() + INTERVAL 5 HOUR + INTERVAL 30 MINUTE,NOW() + INTERVAL 5 HOUR + INTERVAL 30 MINUTE);";
        }else{
            groupIdQuery = groupId;
            insertGroupStatusQuery = "INSERT INTO `iklant_group_status_date_info`(`group_id`,`status_id`,`loan_count`,`status_date`,`created_date`)" +
                "VALUES ("+groupId+","+statusQuery+",(SELECT loan_count FROM `iklant_prospect_group` WHERE group_id = "+groupId+"),NOW() + INTERVAL 5 HOUR + INTERVAL 30 MINUTE,NOW() + INTERVAL 5 HOUR + INTERVAL 30 MINUTE);";
        }
        //connectionDataSource.getConnection(function (clientConnect) {
           if(clientConnect !=null){
               clientConnect.query(insertGroupStatusQuery, function selectCb(err, results, fields) {
                   if (err) {
                       callback("Failure");
                       customlog.error("Insert Group Status Query"+err);
                       //connectionDataSource.releaseConnectionPool(clientConnect);
                   }else {
                       if(statusQuery != constantsObj.getKYCUploaded() ){
                           var updatedStatusCompletedTime = "update iklant_group_status_date_info set completed_date = NOW() + INTERVAL 5 HOUR + INTERVAL 30 MINUTE  " +
                                                            " where group_id = "+groupIdQuery+" and status_id = " + previousStatusId +" AND loan_count= (SELECT loan_count FROM `iklant_prospect_group` WHERE group_id = "+groupIdQuery+") ";
                           console.log(" updatedStatusCompletedTime  : " + updatedStatusCompletedTime);
                           clientConnect.query(updatedStatusCompletedTime, function selectCb(err, results, fields) {
                               if (err) {
                                   callback("Failure");
                                   customlog.error("Insert Group Status Query" + err);
                                   //connectionDataSource.releaseConnectionPool(clientConnect);
                               } else {
                                   //clientConnect.commit(function(err){
                                   //if(err){
                                   //customlog.error(err);
                                   //}
                                   callback("Success");
                                   //connectionDataSource.releaseConnectionPool(clientConnect);
                                   //});
                               }
                           });
                       }


                   }
               });
           }
       //});
    },
    checkingHoldHistoryDataModel: function(clientId,callback){
        var docType= new Array();
        var date = new Array();
        var holdBy = new Array();
        var remarks = new Array();
        var docNameArray = new Array();
        var retriveHoldDetails = "SELECT CASE WHEN (ifh.hold_type=1)"+
        "THEN (SELECT GROUP_CONCAT(doc_name) FROM iklant_doc_type WHERE doc_id IN (ifh.hold_documents_type)) "+
        "WHEN (ifh.hold_type=2)"+
        "THEN 'RM Approval' "+
        "WHEN (ifh.hold_type=3)"+
        "THEN 'DV Query'"+
        "END AS Doc_name,ifh.hold_documents_type,ifh.`created_date`,IFNULL((SELECT user_name FROM iklant_users WHERE user_id = ifh.data_entry_by),'') AS hold_given_by, ifh.`deo_remarks` "+
        " FROM iklant_fo_hold_image_track ifh WHERE ifh.client_id = "+ clientId +";"
        customlog.error("retriveHoldDetails:"+retriveHoldDetails);
        connectionDataSource.getConnection(function(clientConnect){
            clientConnect.query(retriveHoldDetails,function(err,results,fields){
                if(err){
                    customlog.error(err);
                    connectionDataSource.releaseConnectionPool(clientConnect);
                    callback("failure");
                }else{
                    if(results.length > 0){
                        for (var i = 0; i < results.length; i++) {
                            docType[i]=results[i].hold_documents_type;
                            date[i]=results[i].created_date;
                            holdBy[i]=results[i].hold_given_by;
                            remarks[i]=results[i].deo_remarks;
                            docNameArray.push(results[i].Doc_name);
                        }
                        connectionDataSource.releaseConnectionPool(clientConnect);
                        callback(date,holdBy,remarks,docNameArray);
                    }else{
                        connectionDataSource.releaseConnectionPool(clientConnect);
                        callback(date,holdBy,remarks,docNameArray);
                    }
                }
            });
        });
    },

    retrieveClientCurrentStatusDataModel : function(groupId,callback) {
        var constantsObj = this.constants;
        var clientStatusObject = {};
        var clientNameArray = new Array();
        var clientStatusArray = new Array();
        var clientIdArray = new Array();
        var retrieveClientCurrentStatusQuery =  "SELECT pc.client_id,pc.client_name,pc.status_id, "+
                                                "IF(pc.status_id=1,'In FO Queue',IF(pc.status_id=27,'Waiting For BM Approval',IF(pc.status_id=28,'Waiting For RM Approval',IF(pc.status_id=3,'Client is available for KYC Updating',IF(pc.status_id=4,'KYC Completed',IF(pc.status_id=29,'Rejected BY RM',IF(pc.status_id=23,'LSL Updating',IF(pc.status_id=24,'LSL Verification',IF(pc.status_id=19,'In CBA Queue',IF(pc.status_id=15,'Rejected In CBA',IF(pc.status_id=25,'Rejected in Data-Verification','CBA Completed'))))))))))) AS status_desc  ,  "+
                                                "IF(pc.status_id=1,1,IF(pc.status_id=27,2,IF(pc.status_id=28,3,IF(pc.status_id=3,4,5)))) AS status_id_order  "+
                                                "FROM iklant_prospect_client  pc "+
                                                "INNER JOIN `iklant_prospect_status` ps ON ps.status_id = pc.status_id "+
                                                "WHERE pc.group_id = "+groupId+" AND pc.status_id IN("+ constantsObj.getNewGroup()+","+constantsObj.getKYCUploaded()+","+constantsObj.getKYCCompleted()+","+constantsObj.getKYCVerificationStatusId()+","+constantsObj.getNeedRMApprovalStatusId()+","+constantsObj.getRejectedKYCByRM()+","+constantsObj.getLeaderSubLeaderUpdatedStatus()+","+constantsObj.getLeaderSubLeaderVerifiedStatus()+","+constantsObj.getLeaderSubleaderVerificationCompletedStatusId()+","+constantsObj.getRejectedKYCDataVerificationStatusId()+","+constantsObj.getRejectedCreditBureauAnalysisStatusId()+","+constantsObj.getCreditBureauAnalysedStatus()+") ORDER BY status_id_order ";

        console.log("retrieveClientCurrentStatusQuery " + retrieveClientCurrentStatusQuery);
        connectionDataSource.getConnection(function(clientConnect){
            clientConnect.query(retrieveClientCurrentStatusQuery,function(err,results,fields){
                if(err){
                    customlog.error(err);
                    connectionDataSource.releaseConnectionPool(clientConnect);
                    callback("failure");
                }else{
                    if(results.length > 0){
                        for (var i = 0; i < results.length; i++) {
                            clientNameArray[i]=results[i].client_name;
                            clientStatusArray[i]=results[i].status_desc;
                            clientIdArray[i]=results[i].client_id;
                        }
                        connectionDataSource.releaseConnectionPool(clientConnect);
                        clientStatusObject.clientNameList = clientNameArray;
                        clientStatusObject.clientStatusList = clientStatusArray;
                        clientStatusObject.clientIdList = clientIdArray;
                        callback(clientStatusObject);
                    }else{
                        connectionDataSource.releaseConnectionPool(clientConnect);
                        clientStatusObject.clientNameList = clientNameArray;
                        clientStatusObject.clientStatusList = clientStatusArray;
                        clientStatusObject.clientIdList = clientIdArray;
                        callback(clientStatusObject);
                    }
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
        console.log("retrieveGroupCurrentStatusQuery : " + retrieveGroupCurrentStatusQuery)
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
                                ",bo.`total_client_count`=" + results[0].total_clients + " ,bo.`hold_client_count`=" + results[0].holded_clients + ",bo.`rejected_client_count`=" + results[0].rejected_clients + " ,bo.`report_status_id`= " + results[0].report_status_id + ",bo.`updated_date` = NOW() " +
                                "WHERE bo.`date` = CURDATE() AND bo.`group_id` = " + groupId + " ";
                        }else {
                            statusUpdateQuery = "INSERT INTO `iklant_bo_group_details`(`date`,`group_id`,`group_status_id`, `hold_status`,`total_client_count`,`hold_client_count`, `rejected_client_count`, `report_status_id`, `created_date`) "+
                                "VALUES (CURDATE(),"+groupId+","+results[0].status_id +","+results[0].hold_status +","+results[0].total_clients +","+results[0].holded_clients +","+results[0].rejected_clients +","+results[0].report_status_id +",NOW()) ; ";
                        }
                        console.log(" statusUpdateQuery  : " + statusUpdateQuery);
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
    },


    cronJobBOGroupStatusDataModel : function(callback) {
        if (dbTableName.iklantPort == 1000) {
            console.log("DataModel : cronJobBOGroupStatusDataModel");
            var resultArray = new Array();
            var insertQueryArray = new Array();
            var dateFormat = require('dateformat');
            connectionDataSource.getConnection(function (clientConnect) {
                //var query = "SELECT * FROM "+iklantBOGroupdetails+" WHERE date IN (SELECT max(date) FROM "+iklantBOGroupdetails+") and report_status_id != 4";
                // var query = "SELECT * FROM iklant_bo_group_details WHERE  report_status_id != (4) AND DATE(`date`) IN (SELECT MAX(DATE(`date`)) FROM iklant_bo_group_details)";
                var query = "SELECT * FROM iklant_bo_group_details a WHERE a.date=(SELECT MAX(DATE(`date`)) FROM iklant_bo_group_details b WHERE b.group_id=a.group_id AND a.date !=CURDATE()) AND NOT EXISTS (SELECT 1 FROM iklant_bo_group_details c WHERE c.group_id=a.group_id AND c.date=a.date AND c.report_status_id=4)";
                console.log("DataModel : cronJobBOGroupStatusDataModel : " + query);
                clientConnect.query(query, function selectCb(err, results) {
                    if (err) {
                        connectionDataSource.releaseConnectionPool(clientConnect);
                        customlog.error(err);
                        callback("cronJobSelectQueryExecutionFailure.....");
                    } else {
                        console.log("DataModel : cronJobBOGroupStatusDataModel : results length : " + results.length);
                        if (results.length > 0) {
                            for (var i in results) {
                                var date = results[i].date;
                                var group_id = results[i].group_id;
                                var group_status_id = results[i].group_status_id;
                                var hold_status = results[i].hold_status;
                                var total_client_count = results[i].total_client_count;
                                var hold_client_count = results[i].hold_client_count;
                                var rejected_client_count = results[i].rejected_client_count;
                                var report_status_id = results[i].report_status_id;
                                var remarks;
                                if (results[i].remarks == null) {
                                    remarks = "(NULL)";
                                } else {
                                    remarks = results[i].remarks;
                                }
                                var created_date = results[i].created_date;
                                var updated_date = results[i].updated_date;
                                created_date = dateFormat(created_date, "yyyy-mm-dd h:MM:ss");
                                updated_date = dateFormat(updated_date, "yyyy-mm-dd h:MM:ss");
                                var insertQuery = "INSERT INTO iklant_bo_group_details (date,group_id,group_status_id,hold_status,total_client_count,hold_client_count,rejected_client_count,report_status_id,remarks,created_date,updated_date) VALUES" +
                                    "(NOW() + INTERVAL 5 HOUR + INTERVAL 30 MINUTE," + group_id + "," + group_status_id + "," + hold_status + "," + total_client_count + "," + hold_client_count + "," + rejected_client_count + "," + report_status_id + "," +
                                    "'" + remarks + "','" + created_date + "','" + updated_date + "')";
                                console.log("DataModel : cronJobBOGroupStatusDataModel : inser query  : " + insertQuery);
                                if (clientConnect != null) {
                                    clientConnect.query(insertQuery, function selectCb(err, results1) {
                                        if (err) {
                                            clientConnect.rollback(function () {
                                                connectionDataSource.releaseConnectionPool(clientConnect);
                                                clientConnect = null;
                                                customlog.error(err);
                                                callback("cronJobInsert Failure..... : ");
                                            });
                                        }
                                        else {
                                            insertQueryArray.push(insertQuery);
                                            if (insertQueryArray.length == resultArray.length) {
                                                connectionDataSource.releaseConnectionPool(clientConnect);
                                                callback("cronJobInsert. Success.... : ");
                                            }
                                        }
                                    });
                                }
                                resultArray.push(i);
                            }
                        } else {
                            connectionDataSource.releaseConnectionPool(clientConnect);
                            callback("cronJobSelectQueryExecution No Record to insert....");
                        }
                    }
                });
            });
        }
        else {
            callback("cronJobSelectQueryExecution Other then 1000 port....");
        }
    }
};

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
