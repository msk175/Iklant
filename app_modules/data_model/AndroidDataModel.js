
module.exports = androidDataModel;

var path = require('path');
var rootPath = path.dirname(process.mainModule.filename);
var lookupEntityObj;

var dbTableName = require(path.join(rootPath,"properties.json"));
var fs = require('fs');

var connectionDataSource = require(path.join(rootPath,"app_modules/data_model/DataSource"));
var customlog = require(path.join(rootPath,"logger/loggerConfig.js"))('AndroidDataModel.js');
var androidDTO = path.join(rootPath,"app_modules/dto/android");
var dateUtils = require(path.join(rootPath,"app_modules/utils/DateUtils"));
var commonDTO = path.join(rootPath,"app_modules/dto/common");

//Business Layer
function androidDataModel(constants,commonRouter) {
    customlog.debug("Inside Android Data Access Layer");
    this.constants = constants;
    this.commonDataModel = commonRouter.model.dataModel;
}

androidDataModel.prototype = {

    retriveOfficeNameDataModel: function (tenantId, officeId, callback) {
        var officeName = "";
        var retrieveOfficeNameQuery = "SELECT * from "+dbTableName.iklantOffice+"  where tenant_id=" + tenantId + " AND office_id=" + officeId + "";
        customlog.info("retrieveOfficeNameQuery" + retrieveOfficeNameQuery);
        connectionDataSource.getConnection(function (clientConnect) {
            clientConnect.query(retrieveOfficeNameQuery,function selectCb(err, results, fields) {
                connectionDataSource.releaseConnectionPool(clientConnect);
                if(err) {
                    customlog.error(err);
                    callback(officeName);
                }else{
                    officeName = results[0].office_name;
                    callback(officeName);
                }
            });
        });
    },

    //function to retrieve operationId for roleId
    retrieveOperationIdForRoleID: function (roleId, tenantId, callback) {
        var operationIdForRoleIdArray = new Array();
        var retrieveOperationIdForRoleIDQuery = "SELECT ro.role_id,ro.operation_id FROM "+dbTableName.iklantRoleOperation+" ro " +
            "INNER JOIN "+dbTableName.iklantRole+" r ON r.role_id = ro.role_id WHERE ro.role_id = " + roleId + " " +
            "AND r.tenant_id=" + tenantId + "";
        connectionDataSource.getConnection(function (clientConnect) {
            clientConnect.query(retrieveOperationIdForRoleIDQuery,function selectCb(err, results, fields) {
                connectionDataSource.releaseConnectionPool(clientConnect);
                if(err){
                    customlog.error(err);
                }else{
                    for (var i in results) {
                        var fieldName = results[i];
                        operationIdForRoleIdArray[i] = fieldName.operation_id;
                    }
                }
                callback(operationIdForRoleIdArray);
            });
        });
    },

    iklanToAndroidGroupDetailsDatamodel: function (tenant_id, office_id, user_id, operationIdForRoleIdArray, callback) {
        var constantsObj = this.constants;
        var prospectGroupForAndroidRequire = require(androidDTO +"/prospectGroupForAndroid");
        var groupIdArray = new Array();
        var groupGlobalNumberArray = new Array();
        var groupNameArray = new Array();
        var centreNameArray = new Array();
        var statusIdArray = new Array();
        var groupCreatedDateArray = new Array();
        var LoanTypeIdArray = new Array();
        var neededInformationArray = new Array();
        var assignedToArray = new Array();
        var createdByArray = new Array();
        var createdDateArray = new Array();
        var mobileGroupNameArray = new Array();
        var neededImageClarityArray = new Array();
        var prospectGroupForAndroidObj = new prospectGroupForAndroidRequire();
        var statusId = new Array();
        var groupDetailsAndroidQuery = "";
        var loanCountArray = new Array();
        if (operationIdForRoleIdArray != "") {
            customlog.info("operationIdForRoleIdArray " + operationIdForRoleIdArray);
            var groupDetailsQuery = "SELECT group_id,group_global_number,group_name,center_name,loan_type_id, " +
                "status_id,group_created_date,needed_information,assigned_to,created_by,created_date, " +
                "mobile_group_name,needed_image_clarity,loan_count FROM "+dbTableName.iklantProspectGroup+" "

            var KYCUploadQuery = "UNION SELECT group_id,group_global_number, " +
                "group_name,center_name,loan_type_id,status_id,group_created_date,needed_information,assigned_to, " +
                "created_by,created_date,mobile_group_name,needed_image_clarity,loan_count FROM " + dbTableName.iklantProspectGroup + " WHERE status_id IN " +
                "(" + constantsObj.getKYCVerificationStatusId() + "," + constantsObj.getKYCUploaded() + ") AND needed_image_clarity = " + constantsObj.getNeededImageClarity() + " " +
                "AND created_by = " + user_id + " AND office_id = " + office_id + "	AND tenant_id = " + tenant_id + " "

            var FieldVerificationQuery = "SELECT group_id,group_global_number,group_name,center_name,loan_type_id, " +
                "status_id,group_created_date,needed_information,assigned_to,created_by,created_date,mobile_group_name, " +
                "needed_image_clarity,loan_count FROM "+dbTableName.iklantProspectGroup+" WHERE status_id =" + constantsObj.getAssignedFO() + " " +
                "AND assigned_to = " + user_id + " AND office_id = " + office_id + " AND tenant_id = " + tenant_id + " " +
                "ORDER BY group_id"

            if (operationIdForRoleIdArray.indexOf(constantsObj.getPreliminaryVerificationOperationId()) > -1) {
                statusId.push(constantsObj.getNewGroup());
                groupDetailsAndroidQuery = groupDetailsQuery + "WHERE status_id IN (" + statusId + ") " +
                    "AND created_by =" + user_id + " AND office_id = " + office_id + " AND tenant_id = " + tenant_id + " "
            }
            if (operationIdForRoleIdArray.indexOf(constantsObj.getKYCUploadingOperationId()) > -1) {
                statusId.push(constantsObj.getPreliminaryVerified());
                groupDetailsAndroidQuery = groupDetailsQuery + "WHERE status_id IN (" + statusId + ") " +
                    "AND created_by =" + user_id + " AND office_id = " + office_id + " AND tenant_id = " + tenant_id + " " + KYCUploadQuery;
            }
            if (operationIdForRoleIdArray.indexOf(constantsObj.getFieldVerificationOperationId()) > -1) {
                if (groupDetailsAndroidQuery != "") {
                    groupDetailsAndroidQuery = groupDetailsAndroidQuery + " UNION " + FieldVerificationQuery;
                }
                else
                    groupDetailsAndroidQuery = groupDetailsAndroidQuery + FieldVerificationQuery;
            }
            customlog.info("statusId: " + statusId);
            customlog.info("Group Details AndroidQuery : " + groupDetailsAndroidQuery);
            connectionDataSource.getConnection(function (clientConnect) {
                if (groupDetailsAndroidQuery != "") {
                    clientConnect.query(groupDetailsAndroidQuery, function selectCb(err, results, fields) {
                        connectionDataSource.releaseConnectionPool(clientConnect);
                        if(err){
                            customlog.error(err);
                            callback("");
                        }else{
                            for (var i in results) {
                                groupIdArray[i] = results[i].group_id;
                                groupGlobalNumberArray[i] = results[i].group_global_number;
                                groupNameArray[i] = results[i].group_name;
                                centreNameArray[i] = results[i].center_name;
                                if(results[i].status_id == constantsObj.getKYCVerificationStatusId())
                                    statusIdArray[i] = constantsObj.getKYCUploaded();
                                else
                                    statusIdArray[i] = results[i].status_id;
                                groupCreatedDateArray[i] = dateUtils.formatDateForUI(results[i].group_created_date);
                                LoanTypeIdArray[i] = results[i].loan_type_id;
                                neededInformationArray[i] = results[i].needed_information;
                                assignedToArray[i] = results[i].assigned_to;
                                createdByArray[i] = results[i].created_by;
                                createdDateArray[i] = dateUtils.formatDateForUI(results[i].created_date);
                                mobileGroupNameArray[i] = results[i].mobile_group_name;
                                neededImageClarityArray[i] = results[i].needed_image_clarity;
                                loanCountArray[i] =  results[i].loan_count;
                            }
                            prospectGroupForAndroidObj.setGroup_id(groupIdArray);
                            prospectGroupForAndroidObj.setGroup_global_number(groupGlobalNumberArray);
                            prospectGroupForAndroidObj.setGroup_name(groupNameArray);
                            prospectGroupForAndroidObj.setCenter_name(centreNameArray);
                            prospectGroupForAndroidObj.setStatus_id(statusIdArray);
                            prospectGroupForAndroidObj.setGroup_created_date(groupCreatedDateArray);
                            prospectGroupForAndroidObj.setLoan_type_id(LoanTypeIdArray);
                            prospectGroupForAndroidObj.setNeeded_information(neededInformationArray);
                            prospectGroupForAndroidObj.setAssigned_to(assignedToArray);
                            prospectGroupForAndroidObj.setCreated_by(createdByArray);
                            prospectGroupForAndroidObj.setCreated_date(createdDateArray);
                            prospectGroupForAndroidObj.setMobile_group_name(mobileGroupNameArray);
                            prospectGroupForAndroidObj.setNeeded_image_clarity(neededImageClarityArray);
                            prospectGroupForAndroidObj.setLoanCount(loanCountArray);
                            callback(prospectGroupForAndroidObj);
                        }
                    });
                }
            });
        }
    },




    retrieveAllDocTypeListSyncDataModel: function (tenant_id, callback) {
        var allDocTypeIdArray = new Array();
        var allDocTypeEntityIdArray = new Array();
        var allDocTypeNameArray = new Array();
        var allDocTypeForAndroidRequire = require(androidDTO +"/docTypeForAndroid");
        var allDocTypeForAndroidObj = new allDocTypeForAndroidRequire();
        var allDocTypequery = "SELECT doc_id,doc_entity_id,doc_name FROM "+dbTableName.iklantDocType+" where " + "tenant_id=" + tenant_id + "";
        connectionDataSource.getConnection(function (clientConnect) {
            clientConnect.query(allDocTypequery,function selectCb(err, results, fields) {
                connectionDataSource.releaseConnectionPool(clientConnect);
                if(err){
                    customlog.error(err);
                }else{
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

    retrieveAllSubDocTypeListSyncDataModel: function (tenant_id, callback) {
        var allDocTypeIdArray = new Array();
        var allSubDocIdArray = new Array();
        var allSubDocNameArray = new Array();
        var allDocTypeForAndroidRequire = require(androidDTO + "/subDocTypeForAndroid");
        var allSubDocTypeForAndroidObj = new allDocTypeForAndroidRequire();
        var allDocTypequery = "SELECT doc_type_id,sub_doc_id,sub_doc_name FROM " + dbTableName.iklantSubDocType + " where " + "tenant_id=" + tenant_id + "";
        connectionDataSource.getConnection(function (clientConnect) {
            clientConnect.query(allDocTypequery, function selectCb(err, results, fields) {
                connectionDataSource.releaseConnectionPool(clientConnect);
                if (err) {
                    customlog.error(err);
                } else {
                    for (var i in results) {
                        var fieldName = results[i];
                        allDocTypeIdArray[i] = fieldName.doc_type_id;
                        allSubDocIdArray[i] = fieldName.sub_doc_id;
                        allSubDocNameArray[i] = fieldName.sub_doc_name;
                    }
                    allSubDocTypeForAndroidObj.setDocTypeId(allDocTypeIdArray);
                    allSubDocTypeForAndroidObj.setSubDocId(allSubDocIdArray);
                    allSubDocTypeForAndroidObj.setSubDocName(allSubDocNameArray);
                }
                callback(allSubDocTypeForAndroidObj);
            });
        });
    },
    iklanToAndroidClientDetailsDatamodel: function (prospectGroupForAndroidObj, callback) {
        var constantsObj = this.constants;
        var prospectClientForAndroidRequire = require(androidDTO +"/prospectClientForAndroid");
        var prospectClientForAndroidObj =  new prospectClientForAndroidRequire();
        var mobileGroupNameClientArray = new Array();
        var groupIdArray = new Array();
        var clientIdArray = new Array();
        var clientFirstNameArray = new Array();
        var clientLastNameArray = new Array();
        var statusIdArray = new Array();
        var updatedTimeArray = new Array();
        var neededImageClarityDocsArray = new Array();
        var deoRemarksArray = new Array();

        // Dhinakaran
        var remarksForNeedImageClarityArray = new Array();
        var clientLoanCountArray = new Array();
        /*var clientDetailsAndroidQuery = "SELECT pg.mobile_group_name,pc.needed_image_clarity_docs,pc.remarks_for_need_more_information,pc.group_id, " +
            "pc.client_id,pc.client_name,pc.client_last_name,pc.status_id,pc.updated_date,pc.loan_count,t.deo_remarks FROM " + dbTableName.iklantProspectClient + " " +
            "pc INNER JOIN " + dbTableName.iklantProspectGroup + " pg ON pg.group_id=pc.group_id " +
            "LEFT JOIN "+dbTableName.iklantFoHoldImageTrack+" t ON t.client_id=pc.client_id "+
            "WHERE pc.group_id IN " +
            "(" + prospectGroupForAndroidObj.getGroup_id() + ")AND pc.status_id IN (" + constantsObj.getNewGroup() + ", " +
            "" + constantsObj.getPreliminaryVerified() + "," + constantsObj.getAssignedFO() + ") ORDER BY pc.client_id ";
         */
        var clientDetailsAndroidQuery = "SELECT pg.mobile_group_name,pc.needed_image_clarity_docs,IFNULL(pc.remarks_for_need_more_information,'Need good image clarity') AS remarks_for_need_more_information,pc.group_id, " +
            "pc.client_id,pc.client_name,pc.client_last_name,pc.status_id,pc.updated_date,pc.loan_count FROM " + dbTableName.iklantProspectClient + " " +
            "pc INNER JOIN " + dbTableName.iklantProspectGroup + " pg ON pg.group_id=pc.group_id " +
            "WHERE pc.group_id IN " +
            "(" + prospectGroupForAndroidObj.getGroup_id() + ")AND pc.status_id IN (" + constantsObj.getNewGroup() + ", " +
            "" + constantsObj.getPreliminaryVerified() + "," + constantsObj.getAssignedFO() + ") GROUP BY pc.client_id ORDER BY pc.client_id ";


        customlog.info("Client Details AndroidQuery : " + clientDetailsAndroidQuery);
        connectionDataSource.getConnection(function (clientConnect) {
            clientConnect.query(clientDetailsAndroidQuery, function selectCb(err, results, fields) {
                connectionDataSource.releaseConnectionPool(clientConnect);
                if(err){
                    customlog.error(err);
                    callback("");
                }else{
                    for (var i in results) {
                        mobileGroupNameClientArray[i] = results[i].mobile_group_name;
                        groupIdArray[i] = results[i].group_id;
                        clientIdArray[i] = results[i].client_id;
                        clientFirstNameArray[i] = results[i].client_name;
                        clientLastNameArray[i] = results[i].client_last_name;
                        statusIdArray[i] = results[i].status_id;
                        updatedTimeArray[i] = results[i].updated_date;
                        neededImageClarityDocsArray[i] = results[i].needed_image_clarity_docs;
                        remarksForNeedImageClarityArray[i] = results[i].remarks_for_need_more_information ;//results[i].deo_remarks;//results[i].remarks_for_need_more_information  ;
                        clientLoanCountArray[i] = results[i].loan_count;
                    }
                    prospectClientForAndroidObj.setMobile_group_name_client(mobileGroupNameClientArray);
                    prospectClientForAndroidObj.setGroup_id(groupIdArray);
                    prospectClientForAndroidObj.setClient_id(clientIdArray);
                    prospectClientForAndroidObj.setClient_first_name(clientFirstNameArray);
                    prospectClientForAndroidObj.setClient_last_name(clientLastNameArray);
                    prospectClientForAndroidObj.setStatus_id(statusIdArray);
                    prospectClientForAndroidObj.setUpdated_time(updatedTimeArray);
                    prospectClientForAndroidObj.setNeeded_image_clarity_docs(neededImageClarityDocsArray);
                    prospectClientForAndroidObj.setRemarks_for_need_more_information(remarksForNeedImageClarityArray);
                    prospectClientForAndroidObj.setLoan_count(clientLoanCountArray);
                    callback(prospectClientForAndroidObj);
                }
            });
        });
    },

    iklanToAndroidFieldVerificationDetailsDatamodel: function (prospectClientForAndroidObj, callback) {
        var prospectFieldVerificationForAndroidRequire = require(commonDTO+"/prospectFieldVerificationForAndroid");
        var prospectFieldVerificationForAndroidObj = new prospectFieldVerificationForAndroidRequire();
        var client_id = new Array();
        var client_address = new Array();
        var ration_card_number = new Array();
        var mobile_number = new Array();
        var landline_number = new Array();
        var voter_id = new Array();
        var gas_number = new Array();
        var aadhaar_number = new Array();
        var other_id_name1 = new Array();
        var other_id_name2 = new Array();
        var other_id1 = new Array();
        var other_id2 = new Array();
        var guarantor_name = new Array();
        var guarantor_address = new Array();
        var guarantor_id = new Array();
        var guarantor_relationship = new Array();
        var is_bank_account = new Array();
        var is_insurance_lifetime = new Array();
        var household_details = new Array();
        var time_period = new Array();
        var house_sqft = new Array();
        var vehicle_details = new Array();
        var house_room_detail = new Array();
        var house_type = new Array();
        var house_ceiling_type = new Array();
        var house_wall_type = new Array();
        var house_toilet = new Array();
        var house_flooring_detail = new Array();
        var is_reinitiated_client = new Array();
        var loan_count = new Array();

        var fieldVerificationDetailsAndroidQuery = "SELECT pc.client_id AS client_id,pc.client_name,pc.loan_count,pcp.address, " +
            "pcp.ration_card_number,pcp.mobile_number,pcp.landline_number,pcp.voter_id,pcp.gas_number,pcp.aadhaar_number, " +
            "pcp.other_id_name1,pcp.other_id_name2,pcp.other_id1,pcp.other_id2,pcg.guarantor_name,pcg.guarantor_address,pcg.guarantor_id, " +
            "pcg.guarantor_relationship,pcbd.is_bank_account, " +
            "IF(pcbd.is_insurance_lifetime !=NULL,pcbd.is_insurance_lifetime,0) AS is_insurance_lifetime,pc.group_id, " +
            "pchd.household_details,pchd.time_period,pchd.house_sqft,pchd.vehicle_details, " +
            "pchd.house_room_detail,pchd.house_type,pchd.house_ceiling_type,pchd.house_wall_type, " +
            "IF(pcrc.rejected_status_id = 15,1,0) AS is_reinitiated_client," +
            "pchd.house_toilet,pchd.house_flooring_detail FROM "+dbTableName.iklantProspectClient+" pc " +
            "LEFT JOIN "+dbTableName.iklantProspectClientPersonal+" pcp ON pcp.client_id = pc.client_id " +
            "LEFT JOIN "+dbTableName.iklantProspectClientGuarantor+" pcg ON pcg.client_id = pcp.client_id " +
            "LEFT JOIN "+dbTableName.iklantProspectClientHouseDetail+" pchd ON pchd.client_id = pcp.client_id " +
            "LEFT JOIN "+dbTableName.iklantprospectClientBankDetail+" pcbd ON pcbd.client_id = pcp.client_id " +
            "LEFT JOIN "+dbTableName.iklantRejectedClientStatus+" pcrc ON pcrc.client_id = pcp.client_id AND pcrc.rejected_status_id = 15 " +
            "WHERE pc.client_id IN (" + prospectClientForAndroidObj.getClient_id() + ")  GROUP BY client_id";

        customlog.info("Field Verification Details AndroidQuery : " + fieldVerificationDetailsAndroidQuery);
        connectionDataSource.getConnection(function (clientConnect) {
            clientConnect.query(fieldVerificationDetailsAndroidQuery, function selectCb(err, results, fields) {
                connectionDataSource.releaseConnectionPool(clientConnect);
                if(err){
                    customlog.error(err);
                    callback("");
                }else{
                    for (var i in results) {
                        client_id[i] = results[i].client_id;
                        loan_count[i] =  results[i].loan_count
                        client_address[i] = results[i].address;
                        ration_card_number[i] = results[i].ration_card_number;
                        mobile_number[i] = results[i].mobile_number;
                        landline_number[i] = results[i].landline_number;
                        voter_id[i] = results[i].voter_id;
                        gas_number[i] = results[i].gas_number;
                        aadhaar_number[i] = results[i].aadhaar_number;
                        other_id1[i] = results[i].other_id1;
                        other_id2[i] = (results[i].other_id2)?results[i].other_id2:'';
                        other_id_name1[i] = results[i].other_id_name1;
                        other_id_name2[i] = (results[i].other_id_name2)?results[i].other_id_name2:'';
                        guarantor_name[i] = results[i].guarantor_name;
                        guarantor_address[i] = results[i].guarantor_address;
                        guarantor_id[i] = results[i].guarantor_id;
                        guarantor_relationship[i] = results[i].guarantor_relationship;
                        is_bank_account[i] = results[i].is_bank_account;
                        is_insurance_lifetime[i] = results[i].is_insurance_lifetime;
                        household_details[i] = results[i].household_details;
                        time_period[i] = results[i].time_period;
                        house_sqft[i] = results[i].house_sqft;
                        vehicle_details[i] = results[i].vehicle_details;
                        house_room_detail[i] = results[i].house_room_detail;
                        house_type[i] = results[i].house_type;
                        house_ceiling_type[i] = results[i].house_ceiling_type;
                        house_wall_type[i] = results[i].house_wall_type;
                        house_toilet[i] = results[i].house_toilet;
                        house_flooring_detail[i] = results[i].house_flooring_detail;
                        is_reinitiated_client[i]  =   results[i].is_reinitiated_client;
                    }
                    prospectFieldVerificationForAndroidObj.setClient_id(client_id);
                    prospectFieldVerificationForAndroidObj.setClient_address(client_address);
                    prospectFieldVerificationForAndroidObj.setRation_card_number(ration_card_number);
                    prospectFieldVerificationForAndroidObj.setMobile_number(mobile_number);
                    prospectFieldVerificationForAndroidObj.setLandLine_number((landline_number)?landline_number:'');
                    prospectFieldVerificationForAndroidObj.setVoter_id(voter_id);
                    prospectFieldVerificationForAndroidObj.setGas_number(gas_number);
                    prospectFieldVerificationForAndroidObj.setAadhaar_number(aadhaar_number);
                    prospectFieldVerificationForAndroidObj.setOther_id(other_id1);
                    prospectFieldVerificationForAndroidObj.setOther_id2(other_id2);
                    prospectFieldVerificationForAndroidObj.setOther_id_name(other_id_name1);
                    prospectFieldVerificationForAndroidObj.setOther_id_name2(other_id_name2);
                    prospectFieldVerificationForAndroidObj.setGuarantor_name(guarantor_name);
                    prospectFieldVerificationForAndroidObj.setGuarantor_address(guarantor_address);
                    prospectFieldVerificationForAndroidObj.setGuarantor_id(guarantor_id);
                    prospectFieldVerificationForAndroidObj.setGuarantor_relationship(guarantor_relationship);
                    prospectFieldVerificationForAndroidObj.setIs_bank_account(is_bank_account);
                    prospectFieldVerificationForAndroidObj.setIs_insurance_lifetime(is_insurance_lifetime);
                    prospectFieldVerificationForAndroidObj.setHousehold_details(household_details);
                    prospectFieldVerificationForAndroidObj.setTime_period(time_period);
                    prospectFieldVerificationForAndroidObj.setHouse_sqft(house_sqft);
                    prospectFieldVerificationForAndroidObj.setVehicle_details(vehicle_details);
                    prospectFieldVerificationForAndroidObj.setHouse_room_detail(house_room_detail);
                    prospectFieldVerificationForAndroidObj.setHouse_type(house_type);
                    prospectFieldVerificationForAndroidObj.setHouse_ceiling_type(house_ceiling_type);
                    prospectFieldVerificationForAndroidObj.setHouse_wall_type(house_wall_type);
                    prospectFieldVerificationForAndroidObj.setHouse_toilet(house_toilet);
                    prospectFieldVerificationForAndroidObj.setHouse_flooring_detail(house_flooring_detail);
                    prospectFieldVerificationForAndroidObj.setReinitiated_client(is_reinitiated_client);
                    prospectFieldVerificationForAndroidObj.setLoan_count(loan_count);
                    callback(prospectFieldVerificationForAndroidObj);
                }
            });
        });
    },
    iklanToAndroidLookUpEntityDetailsDatamodel: function (callback) {
        var constantsObj = this.constants;
        var self= this;
        var lookUpEntityForAndroidRequire = require(androidDTO+"/lookUpEntityForAndroid");
        var lookUpEntityForAndroidObj = new lookUpEntityForAndroidRequire();
        var entityIdArray = new Array();
        var entityNameArray = new Array();
        var lookUpEntityDetailsAndroidQuery = "SELECT * FROM "+dbTableName.iklantLookupEntity+" WHERE entity_id IN (11,12,13,14,15,16)";
        customlog.info("Lookup Entity Details AndroidQuery : " + lookUpEntityDetailsAndroidQuery);
        connectionDataSource.getConnection(function (clientConnect) {
            clientConnect.query(lookUpEntityDetailsAndroidQuery, function selectCb(err, results, fields) {
                connectionDataSource.releaseConnectionPool(clientConnect);
                if (err) {
                    customlog.error(err);
                } else {
                    for (var i in results) {
                        entityIdArray[i] = results[i].entity_id;
                        entityNameArray[i] = results[i].entity_name;
                    }
                    lookUpEntityForAndroidObj.setEntity_id(entityIdArray);
                    lookUpEntityForAndroidObj.setEntity_name(entityNameArray);
                }
                callback(lookUpEntityForAndroidObj);
            });
        });
    },

    iklanToAndroidLookUpDetailsDatamodel: function (callback) {
        var constantsObj = this.constants;
        this.iklanToAndroidLookUpEntityDetailsDatamodel(function (lookUpEntityForAndroidObj) {
            var lookUpValueForAndroidRequire = require(androidDTO+"/lookUpValueForAndroid");
            var lookUpValueForAndroidObj = new lookUpValueForAndroidRequire();
            var entityIdArray = new Array();
            var lookupIdArray = new Array();
            var lookupValueArray = new Array();

            var lookUpDetailsAndroidQuery = "SELECT * FROM "+dbTableName.iklantLookupValue+" WHERE " +
                "entity_id IN (" + lookUpEntityForAndroidObj.getEntity_id() + ")";
            customlog.info("LookUp Details AndroidQuery : " + lookUpDetailsAndroidQuery);
            connectionDataSource.getConnection(function (clientConnect) {
                clientConnect.query(lookUpDetailsAndroidQuery, function selectCb(err, results, fields) {
                    connectionDataSource.releaseConnectionPool(clientConnect);
                    if(err){
                        customlog.error(err);
                    }else{
                        for (var i in results) {
                            entityIdArray[i] = results[i].entity_id;
                            lookupIdArray[i] = results[i].lookup_id;
                            lookupValueArray[i] = results[i].lookup_value;
                        }
                        lookUpValueForAndroidObj.setEntity_id(entityIdArray);
                        lookUpValueForAndroidObj.setLookup_id(lookupIdArray);
                        lookUpValueForAndroidObj.setLookup_value(lookupValueArray);
                    }
                    callback(lookUpEntityForAndroidObj, lookUpValueForAndroidObj);
                });
            });

        });

    },

    // Dhinakaran
    //function to retrieve iklant to android service details for BDE and FO
    iklanToAndroidDetailsSyncDatamodel: function (tenant_id, office_id, user_id, role_id, callback) {
        var self = this;
        var constantsObj = this.constants;
        self.retrieveOperationIdForRoleID(role_id, tenant_id, function (operationIdForRoleIdArray) {
            self.iklanToAndroidGroupDetailsDatamodel(tenant_id, office_id, user_id, operationIdForRoleIdArray, function (prospectGroupForAndroidObj) {
                if(prospectGroupForAndroidObj != ""){
                    self.commonDataModel.createGroup(tenant_id, office_id, user_id, function (groupNames, nextGroupName, areaCodes, areaNames) {
                        prospectGroupForAndroidObj.setNextGroupName(nextGroupName);
                        prospectGroupForAndroidObj.setAreaCodes(areaCodes);
                        prospectGroupForAndroidObj.setAreaNames(areaNames);
                        self.commonDataModel.retrieveLoanTypelistDataModel(tenant_id, function (loanTypeIdArray, loanTypeArray) {
                            self.retrieveAllDocTypeListSyncDataModel(tenant_id, function (allDocTypeForAndroidObj) { //retrieves all docType
                                self.retrieveAllSubDocTypeListSyncDataModel(tenant_id, function (allSubDocTypeForAndroidObj) {
                                if(prospectGroupForAndroidObj.getGroup_id().length != 0) {
                                    self.iklanToAndroidClientDetailsDatamodel(prospectGroupForAndroidObj, function (prospectClientForAndroidObj) {
                                        if(prospectClientForAndroidObj != "" && prospectClientForAndroidObj.getStatus_id().indexOf(constantsObj.getAssignedFO()) > -1) {
                                            //for FO
                                            self.iklanToAndroidFieldVerificationDetailsDatamodel(prospectClientForAndroidObj,function (prospectFieldVerificationForAndroidObj) {
                                                if(prospectFieldVerificationForAndroidObj != ""){
                                                    self.iklanToAndroidLookUpDetailsDatamodel(function (lookUpEntityForAndroidObj, lookUpValueForAndroidObj) {
                                                        callback(operationIdForRoleIdArray, prospectGroupForAndroidObj,loanTypeIdArray, loanTypeArray, prospectClientForAndroidObj,
                                                                allDocTypeForAndroidObj, allSubDocTypeForAndroidObj, prospectFieldVerificationForAndroidObj, lookUpEntityForAndroidObj, lookUpValueForAndroidObj);
                                                    });
                                                }else{
                                                    self.iklanToAndroidLookUpDetailsDatamodel(function (lookUpEntityForAndroidObj, lookUpValueForAndroidObj) {
                                                        callback(operationIdForRoleIdArray, prospectGroupForAndroidObj,loanTypeIdArray, loanTypeArray, prospectClientForAndroidObj,
                                                                allDocTypeForAndroidObj, allSubDocTypeForAndroidObj, "", lookUpEntityForAndroidObj, lookUpValueForAndroidObj);
                                                    });
                                                }
                                            });
                                        }else {
                                            callback(operationIdForRoleIdArray, prospectGroupForAndroidObj, loanTypeIdArray, loanTypeArray,
                                                    prospectClientForAndroidObj, allDocTypeForAndroidObj, allSubDocTypeForAndroidObj);
                                        }
                                    });
                                }else{
                                        callback(operationIdForRoleIdArray, prospectGroupForAndroidObj, loanTypeIdArray, loanTypeArray, "", allDocTypeForAndroidObj, allSubDocTypeForAndroidObj);
                                    }
                                });

                            });
                        });
                    });
                }else{
                    self.commonDataModel.retrieveLoanTypelistDataModel(tenant_id, function (loanTypeIdArray, loanTypeArray) {
                        self.retrieveAllDocTypeListSyncDataModel(tenant_id, function (allDocTypeForAndroidObj) {
                            callback(operationIdForRoleIdArray, "", loanTypeIdArray, loanTypeArray,"",allDocTypeForAndroidObj);
                        });
                    });
                }
            });
        });
    },

    readOfficeCoordinatesDataModel: function(officeId, callback) {
        var fetchQuery = "SELECT latitude_position,longitude_position FROM iklant_office WHERE office_id="+officeId;
        customlog.info(fetchQuery);
        connectionDataSource.getConnection(function (clientConnect) {
            clientConnect.query(fetchQuery,function (err,result) {
                connectionDataSource.releaseConnectionPool(clientConnect);
                if(err){
                    customlog.error(err);
                    callback("failure");
                }
                else{
                    var Coordinates = require(androidDTO+"/Coordinates");
                    var officeCoordinates = new Coordinates();
                    if(result.length>0){
                        officeCoordinates.setLatitude(result[0].latitude_position);
                        officeCoordinates.setLongitude(result[0].longitude_position);
                    }
                    callback("success",officeCoordinates);
                }
            });
        });
    },

    //Generic Function to retrieve role table details
    retrieveRoleDetails: function (tenantId, callback) {
        var assignRoles = require(path.join(commonDTO,"/assignRoles"));
        var assignRolesObj = new assignRoles();
        var fetchRolesQuery = "SELECT * FROM "+dbTableName.iklantRole+"  WHERE tenant_id =" + tenantId;
        var role_id = new Array();
        var role_name = new Array();
        connectionDataSource.getConnection(function (clientConnect) {
            clientConnect.query(fetchRolesQuery,function selectCb(err, results, fields) {
                connectionDataSource.releaseConnectionPool(clientConnect);
                if (err) {
                    customlog.error(err);
                }
                else {
                    for (var i in results) {
                        role_id[i] = results[i].role_id;
                        role_name[i] = results[i].role_name;
                    }
                    assignRolesObj.setRole_id(role_id);
                    assignRolesObj.setRole_name(role_name);
                }
                callback(assignRolesObj);
            });
        });
    },

    //Generic Function to retrieve roleOperation table details
    retrieveRoleOperationDetails: function (callback) {
        var roleOperation = require(androidDTO +"/roleOperation");
        var roleOperationObj = new roleOperation();
        var fetchRolesQuery = "SELECT * FROM "+dbTableName.iklantRoleOperation+" ";
        var role_id = new Array();
        var operation_id = new Array();
        connectionDataSource.getConnection(function (clientConnect) {
            clientConnect.query(fetchRolesQuery,function selectCb(err, results, fields) {
                connectionDataSource.releaseConnectionPool(clientConnect);
                if (err) {
                    customlog.error(err);
                }
                else {
                    for (var i in results) {
                        role_id[i] = results[i].role_id;
                        operation_id[i] = results[i].operation_id;
                    }
                    roleOperationObj.setRoleId(role_id);
                    roleOperationObj.setOperationId(operation_id);
                }
                callback(roleOperationObj);
            });
        });
    },

    //Kumaran
    authentication: function (userName, password, callback) {
        var result = "false";
        var tenant_id;
        var office_id;
        var role_id;
        var user_id;
        var contact_number;
        var self = this;
        var query = "SELECT COUNT(us.user_id) AS result,us.*,r.role_id,r.role_name,r.role_description FROM "+dbTableName.iklantUsers+" us " +
            "INNER JOIN "+dbTableName.mfiPersonnelRole+" ur ON ur.personnel_id = us.user_id " +
            "INNER JOIN "+dbTableName.iklantRole+" r ON r.role_id = ur.role_id " +
            "WHERE us.user_name = '" + userName + "' AND us.PASSWORD = '" + password + "' and " +
            "us.active_indicator = " + this.constants.getActiveIndicatorTrue() + " GROUP BY us.email_id";
        connectionDataSource.getConnection(function (clientConnect) {
            clientConnect.query(query,function selectCb(err, results, fields) {
                connectionDataSource.releaseConnectionPool(clientConnect);
                if(err){
                    customlog.error(err);
                }else{
                    if (results != "") {
                        for (var i in results) {
                            var fieldName = results[i];
                            var res = fieldName.result;
                            if (res == 1) {
                                result = "true";
                                tenant_id = fieldName.tenant_id;
                                office_id = fieldName.office_id;
                                role_id = fieldName.role_id;
                                user_id = fieldName.user_id;
                                contact_number = fieldName.contact_number;
                                self.retrieveRoleDetails(tenant_id, function (assignRolesObj) { 		//fetches role table details
                                    self.retrieveRoleOperationDetails(function (roleOperationObj) { 	//fetches roleOperation table details
                                        self.commonDataModel.manageRoles(function (manageRolesObj) { 					//fetches operation table details
                                            customlog.info(result);
                                            callback(result, tenant_id, office_id, role_id, user_id, contact_number,assignRolesObj, roleOperationObj, manageRolesObj);
                                            customlog.info("tenant_id " + tenant_id + "office_id" + office_id);
                                            customlog.info("assignRolesObj " + assignRolesObj + "roleOperationObj " + roleOperationObj);
                                            customlog.info("contact_number " + contact_number + "manageRolesObj " + manageRolesObj);
                                        });
                                    });
                                });
                            }
                        }
                    } else {
                        customlog.info("invalid username password");
                        callback(result);
                    }
                }
            });
        });
    },

    authenticationDataModelLDCallTrack:function(userName,password,gcmRegId, callback) {
        var result = "false";
        var tenant_id;
        var office_id;
        var role_id;
        var user_id;
        var contact_number;
        var self = this;
        var query = "SELECT COUNT(us.user_id) AS result,us.*,r.role_id,r.role_name,r.role_description FROM "+dbTableName.iklantUsers+" us " +
            "INNER JOIN "+dbTableName.mfiPersonnelRole+" ur ON ur.personnel_id = us.user_id " +
            "INNER JOIN "+dbTableName.iklantRole+" r ON r.role_id = ur.role_id " +
            "WHERE us.user_name = '" + userName + "' AND us.PASSWORD = '" + password + "' and " +
            "us.active_indicator = " + this.constants.getActiveIndicatorTrue() + " GROUP BY us.email_id";
        connectionDataSource.getConnection(function (clientConnect) {
            clientConnect.query(query,
                function selectCb(err, results, fields) {
                    //connectionDataSource.releaseConnectionPool(clientConnect);
                    if (err) {
                        connectionDataSource.releaseConnectionPool(clientConnect);
                        customlog.error(err);
                    } else {
                        if (results != "") {
                            for (var i in results) {
                                var fieldName = results[i];
                                var res = fieldName.result;
                                if (res == 1) {
                                    //customlog.info("valid username password");
                                    result = "true";
                                    tenant_id = fieldName.tenant_id;
                                    office_id = fieldName.office_id;
                                    role_id = fieldName.role_id;
                                    user_id = fieldName.user_id;
                                    contact_number = fieldName.contact_number;
                                    self.retrieveRoleDetails(tenant_id, function (assignRolesObj) { 		//fetches role table details
                                        self.retrieveRoleOperationDetails(function (roleOperationObj) { 	//fetches roleOperation table details
                                            self.commonDataModel.manageRoles(function (manageRolesObj) { 					//fetches operation table details
                                                customlog.info(result);
                                                self.registrationLDCallTrackDataModel(user_id, gcmRegId,function (status) {
                                                    if(status == "success") {
                                                        connectionDataSource.releaseConnectionPool(clientConnect);
                                                        callback(result, tenant_id, office_id, role_id, user_id, contact_number,assignRolesObj, roleOperationObj, manageRolesObj);
                                                        customlog.info("tenant_id " + tenant_id + "office_id" + office_id);
                                                        customlog.info("assignRolesObj " + assignRolesObj + "roleOperationObj " + roleOperationObj);
                                                        customlog.info("contact_number " + contact_number + "manageRolesObj " + manageRolesObj);
                                                    }
                                                    else {
                                                        result = "false";
                                                        customlog.info("authenticationDataModelLDCallTrack: gcm registration update failure");
                                                        connectionDataSource.releaseConnectionPool(clientConnect);
                                                        callback(result, tenant_id, office_id, role_id, user_id, contact_number,assignRolesObj, roleOperationObj, manageRolesObj);
                                                    }

                                                });

                                            });
                                        });
                                    });
                                }
                            }
                        } else {
                            customlog.info("invalid username password");
                            connectionDataSource.releaseConnectionPool(clientConnect);
                            callback(result);
                        }
                    }
                });
        });
    },

    registrationLDCallTrackDataModel: function (userId, gcmRegId, callback) {
        customlog.info("registrationLDCallTrackDataModel entry : userId : " + userId + " , gcmRegId: " + gcmRegId);
        connectionDataSource.getConnection(function (clientConnect) {
            clientConnect.query("Select * from "+dbTableName.iklantGCMUsers+" where gcm_reg_id = '" + gcmRegId + "'", function (err, result) {
                if (err) {
                    customlog.error('GCM Check user query Error ' + err);
                    connectionDataSource.releaseConnectionPool(clientConnect);
                    callback("failure");
                } else if (result.length > 0) {
                    customlog.info("registrationLDCallTrackDataModel gcm id already available");
                    if (userId != result[0].user_id) {
                        var userGcmDetailsQuery = "UPDATE "+dbTableName.iklantGCMUsers+" SET  gcm_reg_id = '' WHERE " + "gcm_reg_id = '" + gcmRegId + "'";
                        console.log("gcm update query : "+userGcmDetailsQuery);
                        clientConnect.query(userGcmDetailsQuery,
                            function (err) {
                                if (!err) {
                                    connectionDataSource.releaseConnectionPool(clientConnect);
                                    var query = "INSERT INTO "+dbTableName.iklantGCMUsers+"(user_id, gcm_reg_id) VALUES('" + userId + "','" + gcmRegId + "')";
                                    clientConnect.query(query, function (err) {
                                        if (!err) {
                                            connectionDataSource.releaseConnectionPool(clientConnect);
                                            callback("success");
                                        } else {
                                            customlog.error(err);
                                            connectionDataSource.releaseConnectionPool(clientConnect);
                                            callback("failure");
                                        }
                                    });
                                } else {
                                    customlog.error(err);
                                    connectionDataSource.releaseConnectionPool(clientConnect);
                                    callback("failure");
                                }
                            }
                        );
                    }
                    else{
                        customlog.info("registrationLDCallTrackDataModel same userid and regid available");
                        connectionDataSource.releaseConnectionPool(clientConnect);
                        callback("success");
                    }
                } else {
                    var query = "INSERT INTO "+dbTableName.iklantGCMUsers+"(user_id, gcm_reg_id) VALUES('" + userId + "','" + gcmRegId + "')";
                    clientConnect.query(query, function (err) {
                            if (!err) {
                                connectionDataSource.releaseConnectionPool(clientConnect);
                                callback("success");
                            } else {
                                customlog.error(err);
                                connectionDataSource.releaseConnectionPool(clientConnect);
                                callback("failure");
                            }
                        }
                    );
                }
            });
        });
    },

    // Dhinakaran
    saveWeekMeetingDeatils:function (prospectGroup,groupCreatedDate,userId, callback) {
        var self = this;
        var prosGroup = prospectGroup;
        var constantsObj = this.constants;
        var insertMeetingQueryWeek = "INSERT INTO "+dbTableName.iklantMeeting+" (meeting_type_id, meeting_place, start_date, meeting_time) " +
            "VALUES(" + constantsObj.getCustomerMeetingTypeId() + ", '" + prosGroup.getWeeklocation() + "','" + groupCreatedDate + "', '" + prosGroup.getMeetingTime() + "') ";
        customlog.info("insertMeetingQueryWeek " + insertMeetingQueryWeek);
        connectionDataSource.getConnection(function (clientConnect) {
            clientConnect.query(insertMeetingQueryWeek, function selectCb(err, results, fields) {
                if (err) {
                    connectionDataSource.releaseConnectionPool(clientConnect);
                    callback('failure');
                }
                else{
                    var insertRecurrenceDetailQueryWeek = "INSERT INTO "+dbTableName.iklantRecurrenceDetail+" ( meeting_id, recurrence_id, recur_after) " +
                        "VALUES((SELECT MAX(meeting_id) AS meeting_id FROM "+dbTableName.iklantMeeting+" )," + prosGroup.getWeekradio() + "," + prosGroup.getRecurweek() + " );	";
                    customlog.info("insertRecurrenceDetailQueryWeek " + insertRecurrenceDetailQueryWeek);
                    clientConnect.query(insertRecurrenceDetailQueryWeek, function selectCb(err, results, fields) {
                        if (err) {
                            connectionDataSource.releaseConnectionPool(clientConnect);
                            callback('failure');
                        }
                        else{
                            var insertRecurOnDayQueryWeek = "INSERT INTO "+dbTableName.iklantRecurOnDay+" (details_id, days) " +
                                "VALUES((SELECT MAX(details_id) AS details_id FROM "+dbTableName.iklantRecurrenceDetail+"), " +
                                "" + prosGroup.getDayorder() + "); ";
                            customlog.info("insertRecurOnDayQueryWeek " + insertRecurOnDayQueryWeek);
                            clientConnect.query(insertRecurOnDayQueryWeek, function selectCb(err, results, fields) {
                                if (err) {
                                    connectionDataSource.releaseConnectionPool(clientConnect);
                                    callback('failure');
                                }
                                else{
                                    var insertProspectGroupMeetingQuery = "INSERT INTO "+dbTableName.iklantProspectGroupMeeting+" (group_id,meeting_id) " +
                                        "VALUES((SELECT MAX(group_id) AS group_id FROM "+dbTableName.iklantProspectGroup+" where created_by=" + userId + "), " +
                                        "(SELECT MAX(meeting_id) AS meeting_id FROM "+dbTableName.iklantMeeting+"))";
                                    customlog.info("insertProspectGroupMeetingQuery " + insertProspectGroupMeetingQuery);
                                    clientConnect.query(insertProspectGroupMeetingQuery, function selectCb(err, results, fields) {
                                        if(err){
                                            connectionDataSource.releaseConnectionPool(clientConnect);
                                            callback('failure');
                                        }
                                        else{
                                            connectionDataSource.releaseConnectionPool(clientConnect);
                                            callback('success');
                                        }
                                    });
                                }
                            });
                        }
                    });
                }
            });
        });
    },

    // Dhinakaran
    saveGroupAndroidDatamodel: function (userId,officeId, jsonObjectGCDetails,jsonObjectUserDetails, callback) {
        var prospectGroup = require(commonDTO +"/prospectGroup");
        var prosClient = require(commonDTO +"/prospectClient");
        if (jsonObjectGCDetails.mobGroupStatusFlag == 1 || jsonObjectGCDetails.mobGroupStatusFlag == 12 ||
            jsonObjectGCDetails.mobGroupStatusFlag == 123 || jsonObjectGCDetails.mobGroupStatusFlag == 13) {
            var self = this;
            var constantsObj = this.constants;
            var prosGroup = new prospectGroup();
            var prosClient = new prosClient();
            var new_group_global_number;
            var group_id_for_client = 0;

            var fetchGlobNoQuery = "select grp.*,grp_id.* " +
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
            customlog.info("fetchGlobNoQuery : " + fetchGlobNoQuery);
            connectionDataSource.getConnection(function (clientConnect) {
                clientConnect.query(fetchGlobNoQuery,function selectCb(err, results, fields) {
                    var group_id = 0;
                    var group_global_number = 0;
                    var temp_count;
                    var office_id;
                    var officeIdName;
                    if(err){
                        connectionDataSource.releaseConnectionPool(clientConnect);
                        callback();
                    }
                    else{
                        for (var i in results) {
                            var fieldName = results[i];
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
                    office_id = jsonObjectUserDetails.officeId;
                    var group_id_for_client_local;
                    if (group_id_for_client == 0) {
                        group_id_for_client_local = 1;
                    }
                    if (group_global_number == 0) {
                        new_group_global_number = "00" + office_id + "-00001";
                    }
                    else if (temp_count >= 1 && temp_count < 9) {
                        new_group_global_number = "00" + office_id + "-0000" + (temp_count + 1);
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
                    var groupCreatedDate = jsonObjectGCDetails.groupCreatedDate;
                    self.commonDataModel.createGroup(jsonObjectUserDetails.tenantId, jsonObjectUserDetails.officeId, userId, function (groupNames, nextGroupName, areaCodes, areaNames) {
                        var groupStatusId = "";
                        if (jsonObjectGCDetails.loanTypeId == constantsObj.getLoanTypeIdJLG()) {
                            groupStatusId = constantsObj.getPreliminaryVerified();
                        }
                        else if (jsonObjectGCDetails.loanTypeId == constantsObj.getLoanTypeIdSHG()) {
                            groupStatusId = constantsObj.getNewGroup();
                        }
                        var fetchMobileGroupNameQuery = "SELECT mobile_group_name FROM "+dbTableName.iklantProspectGroup+" " +
                            "WHERE mobile_group_name= '" + jsonObjectGCDetails.groupNameGC + "' AND tenant_id='" + jsonObjectUserDetails.tenantId + "'" +
                            "AND office_id=" + jsonObjectUserDetails.officeId + " AND created_by=" + userId + "";
                        customlog.info("fetchMobileGroupNameQuery : " + fetchMobileGroupNameQuery);
                        clientConnect.query(fetchMobileGroupNameQuery,function selectCb(err, results, fields) {
                            if (err ) {
                                connectionDataSource.releaseConnectionPool(clientConnect);
                                callback();
                            }
                            else{
                                if (results == "") {
                                    var areaCode = (typeof jsonObjectGCDetails.areaCodeId == 'undefined')?'NULL':jsonObjectGCDetails.areaCodeId;
                                    var insertProspectGroupQuery = "INSERT INTO " + dbTableName.iklantProspectGroup + " (tenant_id,group_global_number,group_name, " +
                                        "center_name,office_id,area_code_id,loan_type_id,status_id,group_created_date,created_by,created_date,updated_date,mobile_group_name) " +
                                        "VALUES ('" + jsonObjectUserDetails.tenantId + "','" + new_group_global_number + "', " +
                                        "'" + nextGroupName + "','" + jsonObjectGCDetails.centerName + "', " +
                                        "" + jsonObjectUserDetails.officeId + "," + areaCode + "," + jsonObjectGCDetails.loanTypeId + "," + groupStatusId + ", " +
                                        "'" + groupCreatedDate + "'," + userId + ",NOW() + INTERVAL 5 HOUR + INTERVAL 30 MINUTE,NOW() + INTERVAL 5 HOUR + INTERVAL 30 MINUTE,'" + jsonObjectGCDetails.groupNameGC + "')";
                                    customlog.info("insertProspectGroupQuery : " + insertProspectGroupQuery);
                                    clientConnect.query(insertProspectGroupQuery, function selectCb(err, results, fields) {
                                        if(err){
                                            connectionDataSource.releaseConnectionPool(clientConnect);
                                            callback();
                                        }
                                        else{
                                            var meetingTime = (typeof jsonObjectGCDetails.meetingTime == 'undefined')?'NULL':jsonObjectGCDetails.meetingTime;
                                            prosGroup.setMeetingTime(meetingTime);
                                            prosGroup.setWeekradio(jsonObjectGCDetails.meetingSchedule);
                                            if (jsonObjectGCDetails.meetingSchedule == constantsObj.getMeetingScheduleWeek()) {
                                                //week selected
                                                prosGroup.setWeeklocation(jsonObjectGCDetails.meetingPlace);
                                                prosGroup.setRecurweek(jsonObjectGCDetails.recurEvery);
                                                prosGroup.setDayorder(jsonObjectGCDetails.days);
                                            } else if (jsonObjectGCDetails.meetingSchedule == constantsObj.getMeetingScheduleMonth()) {
                                                //month selected
                                                prosGroup.setMonthlocation(jsonObjectGCDetails.meetingPlace);
                                                prosGroup.setMonthday(jsonObjectGCDetails.dayNumber);
                                                prosGroup.setEverymonth(jsonObjectGCDetails.recurEvery);
                                            }
                                            if (prosGroup.getWeekradio() == 1) {
                                                self.saveWeekMeetingDeatils(prosGroup,groupCreatedDate,userId,function (status) {
                                                    connectionDataSource.releaseConnectionPool(clientConnect);
                                                    if(status == 'success'){
                                                        customlog.info("callback success");
                                                        callback(nextGroupName);
                                                    }
                                                    else{
                                                        customlog.error("callback failure");
                                                        callback();
                                                    }
                                                });
                                            }
                                            else if (prosGroup.getWeekradio() == 2) {
                                                self.saveMonthMeetingDetails(prosGroup,groupCreatedDate,userId,function (status) {
                                                    connectionDataSource.releaseConnectionPool(clientConnect);
                                                    if(status == 'success'){
                                                        callback(nextGroupName);
                                                    }
                                                    else{
                                                        callback();
                                                    }
                                                });
                                            }
                                        }
                                    });
                                }else{
                                    connectionDataSource.releaseConnectionPool(clientConnect);
                                    callback();
                                }
                            }
                        });
                    });
                });
            });
        }
    },

    saveMonthMeetingDetails:function (prospectGroup,groupCreatedDate,userId,callback) {
        var prosGroup = prospectGroup;
        var constantsObj = this.constants;
        var insertMeetingQueryMonth = "INSERT INTO "+dbTableName.iklantMeeting+" (meeting_type_id, meeting_place, start_date, meeting_time) " +
            "VALUES(" + constantsObj.getCustomerMeetingTypeId() + ", '" + prosGroup.getMonthlocation() + "','" + groupCreatedDate + "', '" + prosGroup.getMeetingTime() + "') ";
        customlog.info("insertMeetingQueryMonth " + insertMeetingQueryMonth);
        connectionDataSource.getConnection(function (clientConnect) {
            clientConnect.query(insertMeetingQueryMonth, function selectCb(err, results, fields) {
                if (err) {
                    connectionDataSource.releaseConnectionPool(clientConnect);
                    callback('failure');
                }
                else{
                    var insertRecurrenceDetailQueryMonth = "INSERT INTO "+dbTableName.iklantRecurrenceDetail+" ( meeting_id, recurrence_id, recur_after) " +
                        "VALUES((SELECT MAX(meeting_id) AS meeting_id FROM "+dbTableName.iklantMeeting+")," + prosGroup.getWeekradio() + "," + prosGroup.getEverymonth() + " );	";
                    customlog.info("insertRecurrenceDetailQueryMonth " + insertRecurrenceDetailQueryMonth);
                    clientConnect.query(insertRecurrenceDetailQueryMonth, function selectCb(err, results, fields) {
                        if (err) {
                            connectionDataSource.releaseConnectionPool(clientConnect);
                            callback('failure');
                        }
                        else{
                            var insertRecurOnDayQueryMonth = "INSERT INTO "+dbTableName.iklantRecurOnDay+" (details_id, day_number) " +
                                "VALUES((SELECT MAX(details_id) AS details_id FROM "+dbTableName.iklantRecurrenceDetail+"), " +
                                "" + prosGroup.getMonthday() + "); ";
                            customlog.info("insertRecurOnDayQueryMonth " + insertRecurOnDayQueryMonth);
                            clientConnect.query(insertRecurOnDayQueryMonth, function selectCb(err, results, fields) {
                                if (err) {
                                    connectionDataSource.releaseConnectionPool(clientConnect);
                                    callback('failure');
                                }
                                else{
                                    var insertProspectGroupMeetingQuery = "INSERT INTO "+dbTableName.iklantProspectGroupMeeting+" (group_id,meeting_id) " +
                                        "VALUES((SELECT MAX(group_id) AS group_id FROM "+dbTableName.iklantProspectGroup+" where created_by=" + userId + "), " +
                                        "(SELECT MAX(meeting_id) AS meeting_id FROM "+dbTableName.iklantMeeting+"))";
                                    customlog.info("insertProspectGroupMeetingQuery " + insertProspectGroupMeetingQuery);
                                    clientConnect.query(insertProspectGroupMeetingQuery, function selectCb(err, results, fields) {
                                        if(err){
                                            connectionDataSource.releaseConnectionPool(clientConnect);
                                            callback('failure');
                                        }
                                        else{
                                            connectionDataSource.releaseConnectionPool(clientConnect);
                                            callback('success');
                                        }
                                    });
                                }
                            });
                        }
                    });
                }
            });
        });
    },

    verifyGroup: function (userId,prosGroup,preVerification,callback) {
        var verification = new Array();
        var prospectGroup = require(commonDTO +"/prospectGroup");
        var preliminaryVerification = require(commonDTO +"/preliminaryVerification");
        var constantsObj = this.constants;
        var prosGroup = prosGroup;
        var preVerification = preVerification;
        var preliminaryVerificationQuery;
        var lessClientsStatus;
        verification = validator(prosGroup, preVerification, constantsObj);
        var remarks = verification[5];
        var fetchPVGroupIdQuery = "SELECT group_id FROM "+dbTableName.iklantPreliminaryVerification+" WHERE group_id=" + preVerification.getgroup_id() + "";
        customlog.info("fetchPVGroupIdQuery : " + fetchPVGroupIdQuery);
        connectionDataSource.getConnection(function (clientConnect) {
            clientConnect.query(fetchPVGroupIdQuery, function selectCb(err, results, fields) {
                if (results == "" || results == "undefined") {
                    if (preVerification.getis_bank_account() == "true") {
                        preliminaryVerificationQuery = "INSERT INTO "+dbTableName.iklantPreliminaryVerification+" " +
                            "(group_id,loan_active_from,is_savings_discussed,is_complete_attendance, " +
                            "is_bank_account,bank_name,account_number,account_created_date, " +
                            "no_of_credit_transaction,no_of_debit_transaction,remarks,created_by,created_date) " +
                            "VALUES(" + preVerification.getgroup_id() + ",'" + preVerification.getloan_active_from() + "', " +
                            "" + verification[0] + "," + verification[1] + "," + verification[2] + ", " +
                            "'" + preVerification.getbank_name() + "','" + preVerification.getaccount_number() + "', " +
                            "'" + preVerification.getaccount_created_date() + "', " +
                            "" + preVerification.getno_of_credit_transaction() + ", " +
                            "" + preVerification.getno_of_debit_transaction() + ",'" + verification[5] + "'," + userId + ",NOW() + INTERVAL 5 HOUR + INTERVAL 30 MINUTE)";
                    }
                    else if (preVerification.getis_bank_account() == "false") {
                        preliminaryVerificationQuery = "INSERT INTO "+dbTableName.iklantPreliminaryVerification+" " +
                            "(group_id,loan_active_from,is_savings_discussed,is_complete_attendance, " +
                            "is_bank_account,remarks,created_by,created_date) VALUES " +
                            "(" + preVerification.getgroup_id() + ",'" + preVerification.getloan_active_from() + "', " +
                            "" + verification[0] + "," + verification[1] + "," + verification[2] + ",'" + verification[5] + "', " +
                            "" + userId + ",NOW() + INTERVAL 5 HOUR + INTERVAL 30 MINUTE)";
                    }

                    customlog.info("preliminaryVerificationQuery : " + preliminaryVerificationQuery);
                    clientConnect.query(preliminaryVerificationQuery);

                    var groupDetailsQuery = "UPDATE "+dbTableName.iklantProspectGroup+" SET status_id =" + verification[3] + ", " +
                        "updated_date=NOW() + INTERVAL 5 HOUR + INTERVAL 30 MINUTE WHERE group_id =" + preVerification.getgroup_id();
                    customlog.info("groupDetailsQuery : " + groupDetailsQuery);
                    clientConnect.query(groupDetailsQuery,function selectCb(err, results, fields) {
                        if (err) {
                            connectionDataSource.releaseConnectionPool(clientConnect);
                            customlog.error(err);
                        }
                    });

                    var checkStatusQuery = "select * from "+dbTableName.iklantProspectGroup+" where group_id = " + preVerification.getgroup_id() + " ";
                    customlog.info("checkStatusQuery : " + checkStatusQuery);
                    clientConnect.query(checkStatusQuery,
                        function selectCb(err, results, fields) {
                            if (err) {
                                connectionDataSource.releaseConnectionPool(clientConnect);
                                customlog.error(err);
                            } else {
                                for (var i in results) {
                                    lessClientsStatus = results[i].rejected_less_no_of_clients;
                                }
                                if (lessClientsStatus == 1 && remarks == "Group created is eligible for Loan") {
                                    remarks = "Group is rejected due to less number of clients"
                                }
                                connectionDataSource.releaseConnectionPool(clientConnect);
                                callback(remarks);
                            }
                        });
                }else {
                    connectionDataSource.releaseConnectionPool(clientConnect);
                    callback();
                }
            });
        });
    },

    retrieveKycAndroidGroupDetailDataModel: function (userId, tenantId, groupName,loanCount, callback) {
        var self = this;
        var groupIdDB = "";
        var groupNameDB = "",loanCounter = "";
        var retrieveGroupDetailsQuery = "";
        if(loanCount > 1)
            retrieveGroupDetailsQuery = "SELECT * from "+dbTableName.iklantProspectGroup+"  where created_by = " + userId + " AND tenant_id=" + tenantId + " AND group_name='" + groupName + "'";
        else
            retrieveGroupDetailsQuery = "SELECT * from "+dbTableName.iklantProspectGroup+"  where created_by = " + userId + " AND tenant_id=" + tenantId + " AND mobile_group_name='" + groupName + "'";
        customlog.info("retrieveGroupDetailsQuery" + retrieveGroupDetailsQuery);
        connectionDataSource.getConnection(function (clientConnect) {
            clientConnect.query(retrieveGroupDetailsQuery,function selectCb(err, results, fields) {
                connectionDataSource.releaseConnectionPool(clientConnect);
                if (err) {
                    customlog.error(err);
                }
                else {
                    if(results != null && results.length > 0){
                        groupIdDB = results[0].group_id;
                        groupNameDB = results[0].group_name;
                        loanCounter = results[0].loan_count;
                    }
                }
                customlog.info("groupIdDB : " + groupIdDB + "groupNameDB : " + groupNameDB);
                callback(groupIdDB, groupNameDB,loanCounter);
            });
        });
    },

    retrieveGroupDetailDataModel: function (userId, tenantId, groupName, callback) {
        var self = this;
        var groupIdDB = "";
        var groupNameDB = "",loanCounter = "";
        var retrieveGroupDetailsQuery = "SELECT * from "+dbTableName.iklantProspectGroup+"  where created_by = " + userId + " AND tenant_id=" + tenantId + " AND mobile_group_name='" + groupName + "'";
        customlog.info("retrieveGroupDetailsQuery" + retrieveGroupDetailsQuery);
        connectionDataSource.getConnection(function (clientConnect) {
            clientConnect.query(retrieveGroupDetailsQuery,function selectCb(err, results, fields) {
                connectionDataSource.releaseConnectionPool(clientConnect);
                if (err) {
                    customlog.error(err);
                }
                else {
                    if(results != null && results.length > 0){
                        groupIdDB = results[0].group_id;
                        groupNameDB = results[0].group_name;
                        loanCounter = results[0].loan_count;
                    }
                }
                customlog.info("groupIdDB : " + groupIdDB + "groupNameDB : " + groupNameDB);
                callback(groupIdDB, groupNameDB,loanCounter);
            });
        });
    },

    checkClientDocAvailabilityDataModel: function (groupId,androidDocName, callback) {
       var self = this;
        var checkClientDocAvailabilityQuery = "SELECT * FROM " +dbTableName.iklantClientDoc+" WHERE  android_docname = '" + androidDocName + "' AND client_id IN (SELECT client_id FROM "+dbTableName.iklantProspectClient+" WHERE group_id ="+groupId+")";
        customlog.info("checkClientDocAvailabilityQuery " + checkClientDocAvailabilityQuery);
        connectionDataSource.getConnection(function (clientConnect) {
            clientConnect.query(checkClientDocAvailabilityQuery,function selectCb(err, results, fields) {
                connectionDataSource.releaseConnectionPool(clientConnect);
                if (err) {
                    customlog.error(err);
                    callback('false');
                }
                else {
                    if(results != null && results.length > 0){
                        callback('true');
                    }  else{
                        callback('false');
                    }
                }

            });
        });
    },

    loanSanctionAndroidGroupDetailsDatamodel: function (userId,tenantId,officeId,roleId,callback){
        var loansanctionquery = "SELECT * FROM "+dbTableName.iklantProspectGroup+" ipg"
            +" LEFT JOIN "+dbTableName.iklantProspectClient+" ipc ON ipc.group_id = ipg.group_id"
            +" WHERE ipg.office_id="+officeId+" AND ipg.created_by="+userId+" AND ipg.tenant_id="+tenantId+" AND ipg.status_id=10 AND (ipc.is_loan_photo_captured = 0 OR ipc.is_loan_photo_captured IS NULL) AND ipc.status_id =10 GROUP BY ipg.group_id";
        var prospectGroupForAndroidRequire = require(androidDTO +"/prospectGroupForAndroid");
        var groupIdArray = new Array();
        var groupGlobalNumberArray = new Array();
        var groupNameArray = new Array();
        var centreNameArray = new Array();
        var statusIdArray = new Array();
        var groupCreatedDateArray = new Array();
        var LoanTypeIdArray = new Array();
        var neededInformationArray = new Array();
        var assignedToArray = new Array();
        var createdByArray = new Array();
        var createdDateArray = new Array();
        var mobileGroupNameArray = new Array();
        var neededImageClarityArray = new Array();
        var prospectGroupForAndroidObj = new prospectGroupForAndroidRequire();
        var statusId = new Array();
        var groupDetailsAndroidQuery = "";

        customlog.info("loanSanctionAndroidGroupDetailsDatamodel AndroidQuery : " + loansanctionquery);
        connectionDataSource.getConnection(function (clientConnect) {

            clientConnect.query(loansanctionquery, function selectCb(err, results, fields) {
                connectionDataSource.releaseConnectionPool(clientConnect);
                if (err) {
                    customlog.error(err);
                } else {
                    customlog.info("loanSanctionAndroidGroupDetailsDatamodel AndroidQuery : not error ");
                    for (var i in results) {
                        groupIdArray[i] = results[i].group_id;
                        groupGlobalNumberArray[i] = results[i].group_global_number;
                        groupNameArray[i] = results[i].group_name;
                        centreNameArray[i] = results[i].center_name;
                        statusIdArray[i] = results[i].status_id;
                        groupCreatedDateArray[i] = dateUtils.formatDateForUI(results[i].group_created_date);
                        LoanTypeIdArray[i] = results[i].loan_type_id;
                        neededInformationArray[i] = results[i].needed_information;
                        assignedToArray[i] = results[i].assigned_to;
                        createdByArray[i] = results[i].created_by;
                        createdDateArray[i] = dateUtils.formatDateForUI(results[i].created_date);
                        mobileGroupNameArray[i] = results[i].mobile_group_name;
                        neededImageClarityArray[i] = results[i].needed_image_clarity;
                    }

                    customlog.info("loanSanctionAndroidGroupDetailsDatamodel AndroidQuery : not error "+groupIdArray);
                    prospectGroupForAndroidObj.setGroup_id(groupIdArray);
                    prospectGroupForAndroidObj.setGroup_global_number(groupGlobalNumberArray);
                    prospectGroupForAndroidObj.setGroup_name(groupNameArray);
                    prospectGroupForAndroidObj.setCenter_name(centreNameArray);
                    prospectGroupForAndroidObj.setStatus_id(statusIdArray);

                    prospectGroupForAndroidObj.setGroup_created_date(groupCreatedDateArray);
                    prospectGroupForAndroidObj.setLoan_type_id(LoanTypeIdArray);
                    prospectGroupForAndroidObj.setNeeded_information(neededInformationArray);
                    prospectGroupForAndroidObj.setAssigned_to(assignedToArray);
                    prospectGroupForAndroidObj.setCreated_by(createdByArray);
                    prospectGroupForAndroidObj.setCreated_date(createdDateArray);
                    prospectGroupForAndroidObj.setMobile_group_name(mobileGroupNameArray);
                    prospectGroupForAndroidObj.setNeeded_image_clarity(neededImageClarityArray);
                }
                callback(prospectGroupForAndroidObj);
            });

        });
    },

    loanSanctionAndroidClientDetailsDatamodel: function (prospectGroupForAndroidObj, callback) {
        var constantsObj = this.constants;
        var prospectClientForAndroidRequire = require(androidDTO +"/prospectClientForAndroid");
        var prospectClientForAndroidObj =  new prospectClientForAndroidRequire();
        var mobileGroupNameClientArray = new Array();
        var groupIdArray = new Array();
        var clientIdArray = new Array();
        var clientFirstNameArray = new Array();
        var clientLastNameArray = new Array();
        var statusIdArray = new Array();
        var updatedTimeArray = new Array();
        var neededImageClarityDocsArray = new Array();
        var clientDetailsAndroidQuery = "SELECT pg.mobile_group_name,pc.needed_image_clarity_docs,pc.group_id, " +
            "pc.client_id,pc.client_name,pc.client_last_name,pc.status_id,pc.updated_date FROM "+dbTableName.iklantProspectClient+" " +
            "pc INNER JOIN "+dbTableName.iklantProspectGroup+" pg ON pg.group_id=pc.group_id WHERE pc.group_id IN " +
            "(" + prospectGroupForAndroidObj.getGroup_id() + ")AND pc.status_id = " + constantsObj.getAuthorizedStatus() + "" +
            " AND (pc.is_loan_photo_captured = 0 OR pc.is_loan_photo_captured IS NULL) ORDER BY client_id ";
        customlog.info("Client Details AndroidQuery : " + clientDetailsAndroidQuery);
        connectionDataSource.getConnection(function (clientConnect) {
            clientConnect.query(clientDetailsAndroidQuery, function selectCb(err, results, fields) {
                connectionDataSource.releaseConnectionPool(clientConnect);
                if (err) {
                    customlog.error(err);
                } else {
                    for (var i in results) {
                        mobileGroupNameClientArray[i] = results[i].mobile_group_name;
                        groupIdArray[i] = results[i].group_id;
                        clientIdArray[i] = results[i].client_id;
                        clientFirstNameArray[i] = results[i].client_name;
                        clientLastNameArray[i] = results[i].client_last_name;
                        statusIdArray[i] = results[i].status_id;
                        updatedTimeArray[i] = results[i].updated_date;
                        neededImageClarityDocsArray[i] = results[i].needed_image_clarity_docs;
                    }
                    prospectClientForAndroidObj.setMobile_group_name_client(mobileGroupNameClientArray);
                    prospectClientForAndroidObj.setGroup_id(groupIdArray);
                    prospectClientForAndroidObj.setClient_id(clientIdArray);
                    prospectClientForAndroidObj.setClient_first_name(clientFirstNameArray);
                    prospectClientForAndroidObj.setClient_last_name(clientLastNameArray);
                    prospectClientForAndroidObj.setStatus_id(statusIdArray);
                    prospectClientForAndroidObj.setUpdated_time(updatedTimeArray);
                    prospectClientForAndroidObj.setNeeded_image_clarity_docs(neededImageClarityDocsArray);
                }
                callback(prospectClientForAndroidObj);
            });
        });
    },

    loanSanctionAndroidDataModel : function (tenant_id, office_id, user_id, role_id, callback) {
        var self = this;
        var constantsObj = this.constants;
        self.loanSanctionAndroidGroupDetailsDatamodel(tenant_id, office_id, user_id,role_id, function (prospectGroupForAndroidObj) {
            if (prospectGroupForAndroidObj.getGroup_id().length != 0) {
                customlog.info("Group Id : legnth ! 0");
                self.loanSanctionAndroidClientDetailsDatamodel(prospectGroupForAndroidObj, function (prospectClientForAndroidObj) {
                    callback(prospectGroupForAndroidObj,prospectClientForAndroidObj);
                });
            }
            else{
                customlog.info("Group Id : legnth 0");
                callback(prospectGroupForAndroidObj);
            }
        });
    },

    doGcmRegistrationDataModel: function (userId, gcmRegId, callback) {
        customlog.info("doGcmRegistrationDataModel entry : userId : " + userId + " , gcmRegId: " + gcmRegId);
        connectionDataSource.getConnection(function (clientConnect) {
            clientConnect.query("Select * from "+dbTableName.iklantGCMUsers+" where user_id = " + userId + "", function (err, result) {
                if (err) {
                    customlog.error('GCM Check user query Error ' + err);
                    connectionDataSource.releaseConnectionPool(clientConnect);
                    callback("failure");
                } else if (result.length > 0) {
                    var userGcmDetailsQuery = "UPDATE "+dbTableName.iklantGCMUsers+" SET  gcm_reg_id = '" + gcmRegId + "' WHERE " + "user_id = " + userId;
                    clientConnect.query(userGcmDetailsQuery,
                        function (err) {
                            if (!err) {
                                connectionDataSource.releaseConnectionPool(clientConnect);
                                callback("success");
                            } else {
                                customlog.error(err);
                                connectionDataSource.releaseConnectionPool(clientConnect);
                                callback("failure");
                            }
                        }
                    );
                } else {
                    var query = "INSERT INTO "+dbTableName.iklantGCMUsers+"(user_id, gcm_reg_id) VALUES('" + userId + "','" + gcmRegId + "')";
                    clientConnect.query(query, function (err) {
                            if (!err) {
                                connectionDataSource.releaseConnectionPool(clientConnect);
                                callback("success");
                            } else {
                                customlog.error(err);
                                connectionDataSource.releaseConnectionPool(clientConnect);
                                callback("failure");
                            }
                        }
                    );
                }
            });
        });
    },

    getDisplayNameDataModel: function(userId,callback) {
        var constantsObj = this.constants;
        var NameQuery = "SELECT `display_name` FROM `personnel` WHERE `personnel_id` = "+userId;
        connectionDataSource.getConnection(function(clientConnect){
            clientConnect.query(NameQuery, function (error, result) {
                connectionDataSource.releaseConnectionPool(clientConnect);
                if (error) {
                    customlog.error("failure in getDisplayNameDataModel of data model",error);
                    callback("failure");
                } else {
                    customlog.info("datamodel: getDisplayNameDataModel() - ",result);
                    if(result.length > 0){
                        callback('success',result[0].display_name);
                    }else {
                        callback('failure');
                    }
                }
            });
        });
    },

    getEmailIdOfBMdataModel: function(officeId, callback) {
        var constantsObj = this.constants;
        var mailQuery = "SELECT email_id FROM "+dbTableName.iklantUsers+" usr INNER JOIN `"+dbTableName.mfiPersonnelRole+"` pr ON usr.`user_id` = " +
            "pr.`personnel_id` WHERE usr.`active_indicator`=1 AND pr.`role_id`="+constantsObj.getBMroleId()+" AND usr.`office_id` ="+officeId;
        connectionDataSource.getConnection(function(clientConnect){
            clientConnect.query(mailQuery, function (error, result) {
                connectionDataSource.releaseConnectionPool(clientConnect);
                if (error) {
                    customlog.error("failure",error);
                    callback();
                } else {
                    customlog.info("datamodel: getEmailIdOfBMdataModel() - ",result);
                    var emails = new Array();
                    for(var i=0;i<result.length;i++){
                        emails.push(result[i].email_id);
                    }
                    callback('success',emails);
                }
            });
        });
    },

    /* Ezra Johnson  Android_LR_Gps_notification */
    LRGPSNotificationAndroidDatamodel: function (userId,officeId, collectedDetails, finalCallback) {
        var self = this;
        var ExecutionProgress = require(commonDTO+"/ExecutionProgress");
        var execn = new ExecutionProgress();
        self.checkLatitudeLongitude(collectedDetails, execn, userId, officeId, finalCallback);
    },

    /* added by Ezra Johnson */
    isLocationVisited: function(execn, userId,officeId, collectedDetails, finalCallback){
        var self = this;
        var constantsObj = this.constants;
        var statusQuery ="SELECT location_log_id,(6371 * ACOS ("+
            "COS ( RADIANS("+collectedDetails[execn.getCurrentStatus()].latitude+") )"+
            "* COS( RADIANS( latitude_position ) )"+
            "* COS( RADIANS( longitude_position ) - RADIANS("+collectedDetails[execn.getCurrentStatus()].longitude+") )"+
            "+ SIN ( RADIANS("+collectedDetails[execn.getCurrentStatus()].latitude+") )"+
            "* SIN( RADIANS(latitude_position)))) AS distance"+
            " FROM gps_location_log WHERE user_id = "+userId+" AND DATE(created_time) = CURDATE() " +
            "HAVING distance < 2 ORDER BY distance";
        customlog.info(statusQuery);
        connectionDataSource.getConnection(function (clientConnect) {
            clientConnect.query(statusQuery,function selectCb(err, results, fields) {
                connectionDataSource.releaseConnectionPool(clientConnect);
                if(err){
                    customlog.error(err);
                    finalCallback("failure");
                }else{
                    if(results.length > 0){
                        collectedDetails[execn.getCurrentStatus()].visitedStatus = constantsObj.getVisitedStatus();
                    } else {
                        collectedDetails[execn.getCurrentStatus()].visitedStatus = constantsObj.getNotVisitedStatus();
                    }
                    execn.incrementProgress();
                    self.checkLatitudeLongitude(collectedDetails, execn, userId, officeId, finalCallback);
                }
            });
        });
    },

    /* added by Ezra Johnson */
    checkLatitudeLongitude: function(collectedDetails, execn, userId, officeId, finalCallback) {
        var self = this;
        var constantsObj = this.constants;
        if(execn.getCurrentStatus() < collectedDetails.length){
            if(collectedDetails[execn.getCurrentStatus()].latitude != ""  && collectedDetails[execn.getCurrentStatus()].longitude != ""){
                self.isLocationVisited(execn, userId,officeId, collectedDetails, finalCallback);
            } else {
                collectedDetails[execn.getCurrentStatus()].visitedStatus = constantsObj.getNoAddressCoordinatesStatus();
                execn.incrementProgress();
                self.checkLatitudeLongitude(collectedDetails, execn, userId, officeId, finalCallback);
            }
        } else {
            finalCallback("success",collectedDetails);
        }
    },

    insertNOCDocumentsDataModel: function (clientId, fileName, callback) {
        var self = this;
        var constantsObj = this.constants;
        connectionDataSource.getConnection(function (clientConnect) {
            for(var i=0;i<fileName.length;i++) {
                var docQuery = "INSERT INTO iklant_client_doc(Captured_image,client_id,doc_type_id,version,doc_name) VALUES('documents/client_documents/" + fileName[i] + "'," + clientId + "," + constantsObj.getNOCId() + ",NULL,'" + fileName[i] + "')";
                clientConnect.query(docQuery, function (err, result) {
                    if (err) {
                        connectionDataSource.releaseConnectionPool(clientConnect);
                        callback("failure");
                    }
                });

                if(i == fileName.length-1){
                    connectionDataSource.releaseConnectionPool(clientConnect);
                    callback('success');
                }
            }

        });
    },

    changeKycGroupStatus:function (group_id, totalClients,newClient, callback) {
        var self=this;
        var constantsObj = this.constants;
        var totalClientsArray = totalClients.split(":");
        var totalDocs = 0;
        if (totalClientsArray.length >= 2) {
            totalClients = totalClientsArray[0];
            totalDocs = totalClientsArray[1];
        }
        customlog.info("Datamodel :changeKycGroupStatus :" + " entry .... ");
        customlog.info("Datamodel :changeKycGroupStatus : Input from Moile" + " Total Clients : "+totalClients + " Total Docs : "+totalDocs);
        connectionDataSource.getConnection(function (clientConnect) {

            var docReceivedStatusQuery = "";

            if (newClient != 0 ){   // existingClient flag denotes clients newly inserted or need img clarity client
                docReceviedStausQuery = "SELECT * FROM(SELECT COUNT(DISTINCT cd.client_id)AS client_doc_count " +
                    "FROM "+dbTableName.iklantClientDoc+" cd INNER JOIN "+dbTableName.iklantProspectClient+" pc ON  pc.client_id=cd.client_id " +
                    "WHERE EXISTS(SELECT cd.doc_type_id FROM "+dbTableName.iklantClientDoc+" cd WHERE pc.client_id=cd.client_id AND cd.doc_type_id =" + constantsObj.getApplicationFormDocId() + ") " +
                    "AND EXISTS(SELECT cd.doc_type_id FROM "+dbTableName.iklantClientDoc+" cd WHERE pc.client_id=cd.client_id AND cd.doc_type_id =" + constantsObj.getOwnHouseReceiptDocId() + ") " +
                    "AND EXISTS(SELECT cd.doc_type_id FROM "+dbTableName.iklantClientDoc+" cd WHERE pc.client_id=cd.client_id AND cd.doc_type_id =" + constantsObj.getPhotoDocId() + ") " +
                    "AND EXISTS(SELECT cd.doc_type_id FROM "+dbTableName.iklantClientDoc+" cd WHERE pc.client_id=cd.client_id AND cd.doc_type_id =" + constantsObj.getMemberIdProofDocId() + ") " +
                    "AND EXISTS(SELECT cd.doc_type_id FROM "+dbTableName.iklantClientDoc+" cd WHERE pc.client_id=cd.client_id AND cd.doc_type_id =" + constantsObj.getMemberAddressProofDocId() + ") " +
                    "AND EXISTS(SELECT cd.doc_type_id FROM "+dbTableName.iklantClientDoc+" cd WHERE pc.client_id=cd.client_id AND cd.doc_type_id =" + constantsObj.getGuarantorIdProofDocId() + ") " +
                    "AND EXISTS(SELECT cd.doc_type_id FROM "+dbTableName.iklantClientDoc+" cd WHERE pc.client_id=cd.client_id AND cd.doc_type_id =" + constantsObj.getGuarantorAddressProofDocId() + ") " +
                    "AND EXISTS(SELECT cd.doc_type_id FROM " + dbTableName.iklantClientDoc + " cd WHERE pc.client_id=cd.client_id AND cd.doc_type_id =" + constantsObj.getAadarIdProofDocId() + ") " +
                    "AND EXISTS(SELECT cd.doc_type_id FROM " + dbTableName.iklantClientDoc + " cd WHERE pc.client_id=cd.client_id AND cd.doc_type_id =" + constantsObj.getOtherIdProofDocId() + ") " +
                    "AND pc.group_id=" + group_id + " AND pc.status_id = " + constantsObj.getKYCVerificationStatusId() + ")aa JOIN(SELECT COUNT(client_id) AS no_of_clients " +
                    "FROM " + dbTableName.iklantProspectClient + " WHERE group_id=" + group_id + " AND status_id = " + constantsObj.getKYCVerificationStatusId() + ")bb " +
                    "JOIN(SELECT COUNT(needed_image_clarity_docs) AS NIC_count FROM "+dbTableName.iklantProspectClient+" " +
                    "WHERE group_id=" + group_id + " AND needed_image_clarity_docs != 0) cc ";
            }else{
                docReceviedStausQuery = "SELECT * FROM(SELECT COUNT(DISTINCT cd.client_id)AS client_doc_count " +
                    "FROM "+dbTableName.iklantClientDoc+" cd INNER JOIN "+dbTableName.iklantProspectClient+" pc ON  pc.client_id=cd.client_id " +
                    "WHERE cd.doc_type_id=" + constantsObj.getApplicationFormDocId() + " AND " +
                    "pc.group_id=" + group_id + ")aa JOIN(SELECT COUNT(client_id) AS no_of_clients " +
                    "FROM " + dbTableName.iklantProspectClient + " WHERE group_id=" + group_id + " AND status_id = " + constantsObj.getKYCVerificationStatusId() + ")bb " +
                    "JOIN(SELECT COUNT(needed_image_clarity_docs) AS NIC_count FROM "+dbTableName.iklantProspectClient+" " +
                    "WHERE group_id=" + group_id + " AND needed_image_clarity_docs != 0) cc ";
            }
            customlog.info("Datamodel :docReceviedStausQuery :" + docReceviedStausQuery);
            clientConnect.query(docReceviedStausQuery,function selectCb(err, results, fields) {
                if (err) {
                    connectionDataSource.releaseConnectionPool(clientConnect);
                } else if(results.length >=1){
                    var resultSet = results[0];
                    var clientDocCount = resultSet.client_doc_count;
                    var noOfClients = resultSet.no_of_clients;
                    var NIC_count = resultSet.NIC_count;
                    customlog.info("Datamodel :changeKycGroupStatus :" +" Total clients :"+totalClients+" received clients : "+noOfClients+" Client count from client doc received : "+clientDocCount);

                    if(newClient != 0) {
                        customlog.info("Datamodel :existing client 0 :");
                        if(totalDocs == 0) {
                        if (totalClients == noOfClients) {
                            if ((clientDocCount == noOfClients) && (noOfClients != 0)) {
                                 var updateKycStatusQuery = "UPDATE " + dbTableName.iklantProspectGroup + " SET status_id=" + constantsObj.getKYCVerificationStatusId() + ", " +
                                        "updated_date=NOW() + INTERVAL 5 HOUR + INTERVAL 30 MINUTE WHERE group_id = " + group_id + " ";
                                    customlog.info("Datamodel :updateKycStatusQuery :" + updateKycStatusQuery);
                                customlog.info("Datamodel :updateKycStatusQuery :" + updateKycStatusQuery);
                                clientConnect.query(updateKycStatusQuery, function selectCb(err, results, fields) {

                                    if (err) {
                                        customlog.error("Datamodel :changeKycGroupStatus :" + " kyc status change failure...");
                                        connectionDataSource.releaseConnectionPool(clientConnect);
                                        callback('failure');
                                    } else {
                                        customlog.info("Datamodel :changeKycGroupStatus :" + " kyc status changed successfully ....");
                                        self.insertGroupStatusEntryDateDataModel(group_id,constantsObj.getKYCUploaded(),function(status){
                                            connectionDataSource.releaseConnectionPool(clientConnect);
                                            callback('success');
                                            });
                                        }
                                    });
                                }
                                else {
                                    customlog.info("Datamodel :changeKycGroupStatus :" + " Total clients Received...but Total Client from client doc mismatched : ");
                                    connectionDataSource.releaseConnectionPool(clientConnect);
                                    callback('success');
                                }
                            }
                            else {
                                customlog.info("Datamodel :changeKycGroupStatus :" + " Total clients Received...but Total Client from client doc mismatched : ");
                                connectionDataSource.releaseConnectionPool(clientConnect);
                                callback('success');
                            }
                        }
                        else {
                            customlog.info("Datamodel :changeKycGroupStatus :" + " totalDocs not 0 :  new APK");
                            //var totalClientDocsCount = "SELECT COUNT(cd.client_doc_id) AS client_doc_count FROM iklant_client_doc cd, iklant_prospect_client c WHERE cd.loan_count=c.loan_count AND c.client_id=cd.client_id AND c.group_id="+group_id+" AND c.status_id="+constantsObj.getKYCVerificationStatusId();
                            
							var totalClientDocsCount = "SELECT COUNT(d.client_doc_id) AS client_doc_count FROM "+dbTableName.iklantClientDoc+" d,"+dbTableName.iklantProspectClient+" ipc  WHERE  ipc.group_id ="+group_id+" AND ipc.client_id = d.client_id AND ipc.status_id = "+constantsObj.getKYCVerificationStatusId()+" AND ipc.loan_count = d.loan_count";
							customlog.info("Datamodel :changeKycGroupStatus query totalClientDocsCount :" +totalClientDocsCount);
                            clientConnect.query(totalClientDocsCount, function selectCb(err, results, fields) {
                                if (err) {
                                    connectionDataSource.releaseConnectionPool(clientConnect);
                                } else if (results.length >= 1) {
                                    var result = results[0];
                                    var totaldocCount = result.client_doc_count;
                                    if(totaldocCount == totalDocs){
                                        var updateKycStatusQuery = "UPDATE " + dbTableName.iklantProspectGroup + " SET status_id=" + constantsObj.getKYCVerificationStatusId() + ", " +
                                            "updated_date=NOW() + INTERVAL 5 HOUR + INTERVAL 30 MINUTE WHERE group_id = " + group_id + " ";
                                        customlog.info("Datamodel :updateKycStatusQuery :" + updateKycStatusQuery);
                                        clientConnect.query(updateKycStatusQuery, function selectCb(err, results, fields) {
                                            if (err) {
                                                customlog.error("Datamodel :changeKycGroupStatus :" + " kyc status change failure...");
                                                connectionDataSource.releaseConnectionPool(clientConnect);
                                                callback('failure');
                                            } else {
                                                customlog.info("Datamodel :changeKycGroupStatus :" + " kyc status changed successfully ....");
                                                self.insertGroupStatusEntryDateDataModel(group_id, constantsObj.getKYCVerificationStatusId(), function (status) {
                                                    connectionDataSource.releaseConnectionPool(clientConnect);
                                                    callback('success');
                                                });
                                            }
                                        });
                                    }
                                    else {
                                        customlog.info("Datamodel :changeKycGroupStatus :" + " totalDocs not received :  "+totalDocs);
                                        connectionDataSource.releaseConnectionPool(clientConnect);
                                        callback('success');
                                    }
                                }
                                else {
                                    customlog.info("Datamodel :changeKycGroupStatus :" + " totalDocs no record found in totaldoc fetch query");
                                    connectionDataSource.releaseConnectionPool(clientConnect);
                                    callback('success');
                                }


                            });
                        }
                    }
                    else {
                        if (NIC_count == 0) {
                            customlog.info(" going to update need imageclarity flag as 0, all nic documents received ");
                            var updateProspectGroupNeedImgClarityQuery = "UPDATE " + dbTableName.iklantProspectGroup + " SET needed_image_clarity= -1, " +
                                "updated_date=NOW() + INTERVAL 5 HOUR + INTERVAL 30 MINUTE WHERE group_id= " + group_id + " ";
                            customlog.info("DataModel : updateProspectGroupNeedImgClarityQuery: " + updateProspectGroupNeedImgClarityQuery);
                            clientConnect.query(updateProspectGroupNeedImgClarityQuery, function selectCb(err, results, fields) {
                                connectionDataSource.releaseConnectionPool(clientConnect);
                                if (err) {
                                    customlog.info("Datamodel :changeKycGroupStatus :" + " kyc status change failure...");
                                    callback('failure');
                                } else {
                                    customlog.info("Datamodel :changeKycGroupStatus :" + " kyc status changed successfully ....");
                                    callback('success');
                                }
                            });

                        }
                        else {
                            customlog.info("Datamodel :changeKycGroupStatus :" + " Total clients not yet received......");
                            connectionDataSource.releaseConnectionPool(clientConnect);
                            callback('success');
                        }
                    }

                }
            });
        });
    },

    // Dhinakaran
    insertKycDocumentDetailsAndroidDataModel: function (userId, docEntityId, captured_image, clientID, doc_type_id, doc_name, group_id, groupName, clientName, clientLastName, newClientGlobalNumber, newClient, totalClients,loanCount,androidDocName, callback) {
        customlog.info("Datamodel : insertKycDocumentDetailsAndroidDataModel entry........ :");
        var constantsObj = this.constants;
        var self = this;
        if (docEntityId == constantsObj.getGroupDocsEntity()) {
            connectionDataSource.getConnection(function (clientConnect) {
                var insertGroupDocQuery = "INSERT INTO "+dbTableName.iklantGroupDoc+" (image_location,group_id,doc_type_id,doc_name,loan_count) " +
                    "VALUES('" + captured_image + "'," + group_id + "," + doc_type_id + ",'" + doc_name + "'," + loanCount + ")";
                customlog.info("Datamodel : insertGroupDocQuery query ........ :");
                clientConnect.query(insertGroupDocQuery, function selectCb(err, results, fields) {
                    connectionDataSource.releaseConnectionPool(clientConnect);
                    if (err) {
                        callback('failure');
                    } else {
                        callback('success');
                    }
                });
            });
        }else if(docEntityId == constantsObj.getClientDocsEntity()){
            connectionDataSource.getConnection(function (clientConnect) {

                var sub_doc_id_array = doc_type_id.split(":");
                var sub_doc_id = 0;
                if (sub_doc_id_array.length >= 2) {
                    sub_doc_id = sub_doc_id_array[1];
                    doc_type_id = sub_doc_id_array[0];
                }

                var checkClientAvailablityQuery = "SELECT group_id from "+dbTableName.iklantProspectClient+" where group_id=" + group_id + " AND client_name='" + clientName + "'";
                customlog.info("Datamodel :checkClientAvailablityQuery for uploading group :" + checkClientAvailablityQuery);
                clientConnect.query(checkClientAvailablityQuery, function selectCb(err, results, fields) {
                    if (err) {
                        connectionDataSource.releaseConnectionPool(clientConnect);
                        callback('failure');
                    } else if (results.length == 0 || (typeof(results) == 'undefined')) { // if result empty
                        var insertNewClientQuery = "INSERT INTO "+dbTableName.iklantProspectClient+" (group_id,client_global_number,client_name, " +
                            "client_last_name,status_id,family_monthly_income,family_monthly_expense, " +
                            "is_internal_loan,is_overdue,created_by,created_date,updated_date) " +
                            "VALUES (" + group_id + ",'" + newClientGlobalNumber + "','" + clientName + "','" + clientLastName + "', " +
                            "" + constantsObj.getKYCVerificationStatusId() + ",0,0,0,0," + userId + ",NOW() + INTERVAL 5 HOUR + INTERVAL 30 MINUTE,'0000-00-00 00:00:00')";
                        customlog.info("Datamodel :insertNewClientQuery :" + insertNewClientQuery);
                        clientConnect.query(insertNewClientQuery, function selectCb(err, results, fields) {

                            if (err) {
                                connectionDataSource.releaseConnectionPool(clientConnect);
                                callback('failure');
                            }
                            else {
                                customlog.info("Datamodel :checkClientAvailablityQuery :" + " insert client  : " + clientName);
                                var insertClientDocQuery = "INSERT INTO " + dbTableName.iklantClientDoc + " (Captured_image,client_id,doc_type_id,doc_name,loan_count,android_docname,sub_doc_id) " +
                                    "VALUES('" + captured_image + "',(SELECT MAX(client_id) FROM " + dbTableName.iklantProspectClient + " WHERE group_id =" + group_id + "), " +
                                    "" + doc_type_id + ",'" + doc_name + "',1,'" + androidDocName + "'," + sub_doc_id + ")";
                                customlog.info("Datamodel :insertClientDocQuery :" + insertClientDocQuery);
                                clientConnect.query(insertClientDocQuery, function selectCb(err, results, fields) {
                                    if (err) {
                                        connectionDataSource.releaseConnectionPool(clientConnect);
                                        callback('failure');
                                    } else {
                                        // call prospect status change
                                        customlog.info("Datamodel :checkClientAvailablityQuery :" + " insert document : " + clientName);
                                        self.changeKycGroupStatus(group_id, totalClients,newClient,function (status) {
                                            connectionDataSource.releaseConnectionPool(clientConnect);
                                            callback(status);
                                        });
                                    }
                                });
                            }
                        });
                    }
                    else if (results.length >= 1) { // Client already created
                        var insertClientDocQuery = "INSERT INTO " + dbTableName.iklantClientDoc + " (Captured_image,client_id,doc_type_id,doc_name,loan_count,android_docname,sub_doc_id) " +
                            "VALUES('" + captured_image + "',(SELECT MAX(client_id) FROM " + dbTableName.iklantProspectClient + " WHERE group_id =" + group_id + "), " +
                            "" + doc_type_id + ",'" + doc_name + "',(SELECT loan_count FROM iklant_prospect_client WHERE client_id=(SELECT MAX(client_id) FROM " + dbTableName.iklantProspectClient + " WHERE group_id = " + group_id + "))" +
                            ",'" + androidDocName + "'," + sub_doc_id + ")";
                        customlog.info("Datamodel :insertClientDocQuery :" + insertClientDocQuery);
                        clientConnect.query(insertClientDocQuery, function selectCb(err, results, fields) {
                            if (err) {
                                connectionDataSource.releaseConnectionPool(clientConnect);
                                callback('failure');
                            } else {
                                // call prospect status change
                                customlog.info("Datamodel :checkClientAvailablityQuery :" + " insert document : only.... ");
                                self.changeKycGroupStatus(group_id, totalClients,newClient,function (status) {
                                    connectionDataSource.releaseConnectionPool(clientConnect);
                                    callback(status);
                                });
                            }
                        });
                    }
                });
            });
        }
    },

    checkGroupClientAvailabilityCallAndroidDataModel:function(userId,docEntityId,captured_image,client_id,doc_type_id,doc_name,groupId,groupName,clientName,clientLastName,newClientGlobalNumber,tempCount,totalClients,loanCount,androidDocName,callback){
        customlog.info("Datamodel :checkGroupClientAvailabilityCallAndroidDataModel entry");
        var checkClientAvailablityQuery =   "";
        if(client_id != 0)
            checkClientAvailablityQuery =  "SELECT client_id from "+dbTableName.iklantProspectClient+" where group_id=" + groupId + " AND client_name='" + clientName + "'  AND client_id='" + client_id + "'";
        else
            checkClientAvailablityQuery =  "SELECT client_id from "+dbTableName.iklantProspectClient+" where group_id=" + groupId + " AND client_name='" + clientName + "'";
        customlog.info("Datamodel :checkGroupClientAvailabilityCallAndroidDataModel for uploading group :" + checkClientAvailablityQuery);
        connectionDataSource.getConnection(function (clientConnect) {
            clientConnect.query(checkClientAvailablityQuery, function selectCb(err, results, fields) {
                if (err) {
                    connectionDataSource.releaseConnectionPool(clientConnect);
                   // customlog.info("Datamodel :checkGroupClientAvailabilityCallAndroidDataModel execution error");
                    callback('failure',-1);
                } else if (results.length == 0) {
                        var clientIdQuery = "SELECT MAX(client_id) As client_id FROM "+dbTableName.iklantProspectClient+" WHERE group_id =" + groupId+"";
                    //customlog.info("Datamodel :checkGroupClientAvailabilityCallAndroidDataModel max client id query : " + clientIdQuery);
                            clientConnect.query(clientIdQuery, function selectCb(err, result, fields) {
                            connectionDataSource.releaseConnectionPool(clientConnect);
                        if (err) {
                           // customlog.info("Datamodel :checkGroupClientAvailabilityCallAndroidDataModel max client id query error execution : ");
                            callback('failure',-1);
                        } else {
                           // customlog.info("Datamodel :checkGroupClientAvailabilityCallAndroidDataModel last client id " + result[0].client_id + " in this group " + groupId);
                            callback('success',result[0].client_id);
                            }
                    });
                } else {
                    customlog.info("Datamodel :checkGroupClientAvailabilityCallAndroidDataModel client Id "+results[0].client_id+" available in this group : "+groupId);
                    connectionDataSource.releaseConnectionPool(clientConnect);
                    callback('success',-1);//,results[0].client_id);
                }
            });
        });
    },

    // Dhinakaran
    insertKycNeedImgClarityDocumentDetailsAndroidDataModel: function (userId, docEntityId, captured_image, client_id, doc_type_id, doc_name, group_id, groupName, clientName, clientLastName, newClientGlobalNumber, newClient, totalClients, loanCount, androidDocName, callback) {
        var constantsObj = this.constants;
        var self = this;
        customlog.info("AndroidDataModel : need Image clarity ......" );

        connectionDataSource.getConnection(function (clientConnect) {
            var sub_doc_id_array = doc_type_id.split(":");
            var sub_doc_id = 0;
            if (sub_doc_id_array.length >= 2) {
                sub_doc_id = sub_doc_id_array[1];
                doc_type_id = sub_doc_id_array[0];
            }
			var selectNeedImgClientDocQuery = "SELECT cd.client_doc_id,cd.Captured_image FROM "+ dbTableName.iklantClientDoc + " cd,"+dbTableName.iklantProspectClient +" c,"+dbTableName.iklantProspectGroup+" g WHERE cd.client_id=c.client_id AND c.group_id=g.group_id AND  cd.client_id = " + client_id + " AND cd.doc_type_id = " + doc_type_id + " AND cd.loan_count = " + loanCount+" AND g.needed_image_clarity=1";
            customlog.info("AndroidDataModel : selectNeedImgClientDocQuery ......" +selectNeedImgClientDocQuery);

            clientConnect.query(selectNeedImgClientDocQuery, function selectCb(err, results, fields) {
                if (err) {
                    connectionDataSource.releaseConnectionPool(clientConnect);
                    callback('failure');
                } else {
                    /*var fs=require('fs');
                    for (var i in results) {
                       // var docTypeId = results[0].client_doc_id;
                        var imagePath = results[i].Captured_image;
                        customlog.info('need delete Doc Name : '+i+" : "+imagePath);

                        fs.unlink(imagePath, function(err){
                            if(err){ customlog.info('Error while unlinking '+err); }
                            else { customlog.info('Successfully unlinked');};
                        });

                    }*/

                   /* var deleteExistingDocs = "DELETE cd FROM "+ dbTableName.iklantClientDoc + " cd,"+dbTableName.iklantProspectClient +" c,"+dbTableName.iklantProspectGroup+" g WHERE cd.client_id=c.client_id AND c.group_id=g.group_id AND  cd.client_id = " + client_id + " AND cd.doc_type_id = " + doc_type_id + " AND cd.loan_count = " + loanCount+ " AND g.needed_image_clarity=1";
					clientConnect.query(deleteExistingDocs, function selectCb(err, results, fields) {
                        if (err) {
                            connectionDataSource.releaseConnectionPool(clientConnect);
                            callback('failure');
                        }
                        else
                        {*/
                            var insertNeedImgClientDocQuery = "INSERT INTO " + dbTableName.iklantClientDoc + " (Captured_image,client_id,doc_type_id,doc_name,loan_count,android_docname,sub_doc_id) " +
                                "VALUES('" + captured_image + "'," + client_id + "," + doc_type_id + ",'" + doc_name + "'," + loanCount + ",'" + androidDocName + "'," + sub_doc_id + ")";
                        customlog.info("Datamodel : insertNeedImgClientDocQuery query ........ :" + insertNeedImgClientDocQuery);

                        clientConnect.query(insertNeedImgClientDocQuery, function selectCb(err, results, fields) {
                            if (err) {
                                connectionDataSource.releaseConnectionPool(clientConnect);
                                callback('failure');
                            } else {
                                var checkNeedImgClarityforClient = "SELECT needed_image_clarity_docs FROM " + dbTableName.iklantProspectClient + " WHERE " +
                                    "client_id = " + client_id + "";
                                customlog.info("Datamodel : checkNeedImgClarityforClient query ........ :" + checkNeedImgClarityforClient);
                                clientConnect.query(checkNeedImgClarityforClient, function selectCb(err, results, fields) {
                                    if (err) {
                                        connectionDataSource.releaseConnectionPool(clientConnect);
                                        callback('failure');
                                    } else {
                                        var neededImageClarityDocsTemp = results[0].needed_image_clarity_docs;
                                        if (neededImageClarityDocsTemp != 0) {
                                            var neededImageClarityDocsTempSplitted = neededImageClarityDocsTemp.split(",");
                                            for (var i in neededImageClarityDocsTempSplitted) {
                                                if (doc_type_id == neededImageClarityDocsTempSplitted[i]) {
                                                    neededImageClarityDocsTempSplitted.splice(i, 1);
                                                    i--;
                                                }
                                            }
                                            neededImageClarityDocsTempSplitted.join(',');
                                            if (neededImageClarityDocsTempSplitted == "") {
                                                neededImageClarityDocsTempSplitted = 0;
                                            }
                                            var updateNeedImgClarityforClient = "UPDATE " + dbTableName.iklantProspectClient + " SET needed_image_clarity_docs = '" + neededImageClarityDocsTempSplitted + "' " +
                                                "WHERE client_id=" + client_id + "";
                                            customlog.info("Datamodel : updateNeedImgClarityforClient query ........ :" + updateNeedImgClarityforClient);
                                            clientConnect.query(updateNeedImgClarityforClient, function selectCb(err, results, fields) {
                                                if (err) {
                                                    connectionDataSource.releaseConnectionPool(clientConnect);
                                                    callback('failure');
                                                } else {
                                                    if (neededImageClarityDocsTempSplitted == 0) {
                                                        //var updateProspectClientQuery = "UPDATE " + dbTableName.iklantProspectClient + " SET status_id=IF(is_overdue=" + constantsObj.getActiveIndicatorFalse() + ", " +
                                                         //   "(select status_id from " + dbTableName.iklantProspectGroup + " where group_id=" + group_id + "),status_id),remarks_for_need_more_information='',updated_date=NOW() + INTERVAL 5 HOUR + INTERVAL 30 MINUTE WHERE client_id=" + client_id + "";
                                                       // var updateProspectClientQuery = "UPDATE " + dbTableName.iklantProspectClient + " SET status_id="+constantsObj.getKYCVerificationStatusId()+",remarks_for_need_more_information='',updated_date=NOW() + INTERVAL 5 HOUR + INTERVAL 30 MINUTE WHERE client_id=" + client_id + " and group_id =" + group_id + "";
														
                                                        var updateProspectClientQuery = "UPDATE " + dbTableName.iklantProspectClient + " SET status_id="+constantsObj.getKYCVerificationStatusId()+",updated_date=NOW() + INTERVAL 5 HOUR + INTERVAL 30 MINUTE WHERE client_id=" + client_id + " and group_id =" + group_id + "";
                                                        customlog.info("Datamodel : updateProspectClientQuery query ........ :" + updateProspectClientQuery);
                                                        clientConnect.query(updateProspectClientQuery, function selectCb(err, results, fields) {
                                                            if (err) {
                                                                connectionDataSource.releaseConnectionPool(clientConnect);
                                                                callback('failure');
                                                            }
                                                            else {
                                                                /*self.changeKycGroupStatus(group_id, totalClients, newClient, function (status) {
                                                                    connectionDataSource.releaseConnectionPool(clientConnect);
                                                                    callback(status);
                                                                });	*/
                                                               // var updateFoHoldTracksQuery = "UPDATE iklant_fo_hold_image_track SET hold_resolved_date = NOW() + INTERVAL 5 HOUR + INTERVAL 30 MINUTE WHERE client_id = (SELECT c.client_id FROM  iklant_prospect_client c ,iklant_prospect_group g  WHERE c.client_id= " + client_id + " AND g.group_id = c.group_id AND g.needed_image_clarity=1) ORDER BY c.client_id DESC LIMIT 1";
                                                                var updateFoHoldTracksQuery = "UPDATE iklant_fo_hold_image_track SET hold_resolved_date = NOW() + INTERVAL 5 HOUR + INTERVAL 30 MINUTE WHERE hold_resolved_date IS NULL AND operation_id = 36 AND hold_type = 1 AND client_id = " + client_id + "";
                                                                customlog.info("Datamodel : updateFoHoldTracksQuery query ........ :" + updateFoHoldTracksQuery);
                                                                clientConnect.query(updateFoHoldTracksQuery, function selectCb(err, results, fields) {
                                                                    if (err) {
                                                                        connectionDataSource.releaseConnectionPool(clientConnect);
                                                                        callback('failure');
                                                                    }
                                                                    else{
                                                                        self.changeKycGroupStatus(group_id, totalClients, newClient, function (status) {
                                                                            connectionDataSource.releaseConnectionPool(clientConnect);
                                                                            callback(status);
                                                                        });
                                                                    }
                                                                });
                                                            }
                                                        });
                                                    }
                                                    else {
                                                        connectionDataSource.releaseConnectionPool(clientConnect);
                                                        callback('success');
                                                    }
                                                }
                                            });
                                        }
                                        else {
                                            // Fix for second Loan changes
                                            // This block only for second loan without adding new clients.
                                            var checkGroupStatusQuery = "SELECT status_id from " + dbTableName.iklantProspectGroup + " where group_id =" + group_id + "";
                                            customlog.info("Datamodel : checkGroupStatusQuery " + checkGroupStatusQuery);
                                            clientConnect.query(checkGroupStatusQuery, function selectCb(err, results, fields) {
                                                if (err) {
                                                    connectionDataSource.releaseConnectionPool(clientConnect);
                                                    callback('failure');
                                                } else {
                                                    var status_id = results[0].status_id;
                                                    customlog.info("Datamodel : checkGroupStatusQuery group status : " + status_id);
                                                    if (status_id < constantsObj.getKYCUploaded() || status_id == constantsObj.getKYCVerificationStatusId()) {
                                                        var updateProspectClientStatusQuery = "UPDATE " + dbTableName.iklantProspectClient + " SET status_id = " + constantsObj.getKYCVerificationStatusId() + "," +
                                                            "remarks_for_need_more_information='',updated_date=NOW() + INTERVAL 5 HOUR + INTERVAL 30 MINUTE WHERE client_id=" + client_id + "";
                                                        
                                                        customlog.info("Datamodel : updateProspectClientStatusQuery query ........ :" + updateProspectClientStatusQuery);
                                                        clientConnect.query(updateProspectClientStatusQuery, function selectCb(err, results, fields) {
                                                            if (err) {
                                                                connectionDataSource.releaseConnectionPool(clientConnect);
                                                                callback('failure');
                                                            }
                                                            else {
                                                                //connectionDataSource.releaseConnectionPool(clientConnect);
                                                                // callback('success');
                                                                // This fix for second loan disbursement without adding new clients
                                                                customlog.info("Datamodel : checkGroupStatusQuery group status : less than kyc uploaded : client status changed into 3 and going to update group status");
                                                                newClient = 1;
                                                                self.changeKycGroupStatus(group_id, totalClients, newClient, function (status) {
                                                                    connectionDataSource.releaseConnectionPool(clientConnect);
                                                                    callback(status);
                                                                });
                                                            }
                                                        });
                                                    } else {
                                                        customlog.info("Datamodel : checkGroupStatusQuery group status 3 or above");
                                                        connectionDataSource.releaseConnectionPool(clientConnect);
                                                        callback('success');
                                                    }

                                                }
                                            });
                                        }
                                    }
                                });
                            }
                        });



                  //  }
               // });
                }

            });

        });
    },

    insertLoanSanctionDetailsCallAndroidDataModel:function(capturedImage,clientId,docTypeId,docName,groupId,groupName,callback){
        var constantsObj = this.constants;
        var self = this;
        connectionDataSource.getConnection(function (clientConnect) {
            customlog.info("Datamodel :insertLoanSanctionDetailsCallAndroidDataModel :" );
            var retrieveClientQuery = "SELECT * from "+dbTableName.iklantProspectClient+" where group_id="+groupId+" and client_id="+clientId+"";
            customlog.info("Datamodel :retrieveClientQuery :" );
            clientConnect.query(retrieveClientQuery, function selectCb(err, results, fields) {
                if (err) {
                    connectionDataSource.releaseConnectionPool(clientConnect);
                    callback('failure');
                }
                else {
                    if (results.length != 0) {
                        var insertClientDocQuery = "INSERT INTO "+dbTableName.iklantClientDoc+" (Captured_image,client_id,doc_type_id,doc_name) " +
                            "VALUES('" + capturedImage + "'," + clientId + ", " + "" + docTypeId + ",'" + docName + "')";
                        customlog.info("Datamodel :insertClientDocQuery :" + insertClientDocQuery);
                        clientConnect.query(insertClientDocQuery, function selectCb(err, results, fields) {
                            if (err) {
                                connectionDataSource.releaseConnectionPool(clientConnect);
                                callback('failure');
                            } else {
                                customlog.info("Datamodel :update LoanSanctionDoc  :" + " insert document : success ");
                                if(docTypeId==constantsObj.getPhotoDocId()) {
                                    var updateLoanSanctionDocQuery  = "UPDATE "+dbTableName.iklantProspectClient+" SET is_loan_photo_captured = 1 where client_id = "+clientId+" and group_id="+groupId ;
                                    customlog.info("Datamodel :update LoanSanctionDoc  :" + " insert document : success ");
                                    clientConnect.query(updateLoanSanctionDocQuery, function selectCb(err, results, fields) {
                                        if(err){
                                            connectionDataSource.releaseConnectionPool(clientConnect);
                                            callback('failure');
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
                    }
                    else{
                        connectionDataSource.releaseConnectionPool(clientConnect);
                        callback('failures');
                    }
                }
            });
        });
    },

    insertdocumentDetailsModelPmtCollLR: function (captured_image, client_id, doc_type_id, doc_name, group_id, callback) {
        var self = this;
        var constantsObj = this.constants;
        connectionDataSource.getConnection(function (clientConnect) {
            if (doc_type_id == constantsObj.getReceiptDocId() || doc_type_id == constantsObj.getMOMDocId() || doc_type_id == constantsObj.getPhotoDocId()) {
                var searchPaymentCollectionId = "SELECT payment_collection_id FROM payment_collection_image WHERE payment_collection_id= " + client_id +" and doc_id = "+doc_type_id;
                clientConnect.query(searchPaymentCollectionId,function selectCb(err, results, fields) {
                    if(err) {
                        connectionDataSource.releaseConnectionPool(clientConnect);
                    }else {
                        var insertOrUpdateClientDocQuery = "";
                        if (results.length >= 1) {
                            var insertOrUpdateClientDocQuery = "UPDATE payment_collection_image SET Captured_image ='" + captured_image + "',doc_name = '" + doc_name + "' WHERE payment_collection_id= " + client_id+" and doc_id = "+doc_type_id;
                        }
                        else {
                            var insertOrUpdateClientDocQuery = "INSERT INTO payment_collection_image(payment_collection_id,Captured_image,doc_id,doc_name) " +
                                "VALUES(" + client_id + ",'" + captured_image + "'," + doc_type_id + ",'" + doc_name + "')";
                        }
                        clientConnect.query(insertOrUpdateClientDocQuery,function postCreate(err) {
                            connectionDataSource.releaseConnectionPool(clientConnect);
                            if(!err) {
                                callback("Success");
                            }else{
                                callback("Failure");
                            }
                        });
                    }
                });
            }
        });
    },

    checkForNpaAssignedorNot: function (accountId, callback) {
        var self=this;
        var constantsObj = this.constants;
        var npaAssignedCheckQuery = "SELECT * FROM npa_util_loan_detail WHERE account_id = " + accountId + "";
        connectionDataSource.getConnection(function (clientConnect) {
            clientConnect.query(npaAssignedCheckQuery, function selectCb(err, results, fields) {
                connectionDataSource.releaseConnectionPool(clientConnect);
                if (err) {
                    customlog.error(err);
                } else {
                    for (var i in results) {

                    }
                    callback(results.length);
                }
            });
        });
    },

    getGroupDetailsForDataModel: function (userId, accountId, callback) {
        customlog.info("Inside getGroupsForRecoveryDataModel");
        var self = this;
        var recoveryReasonsArray = new Array();
        var LoanRepaymentForFO1 = require(path.join(rootPath,"app_modules/client_management/customer_identification/domain/recoveryHolder"));
        var LoanRepaymentForFO = new LoanRepaymentForFO1();
        self.checkForNpaAssignedorNot(accountId, function (resultLength) {
            customlog.info("Inside checkForNpaAssignedorNot result length: " + resultLength);
            if (resultLength == 0) {
                self.assignSingleGroupToFODataModel(accountId, userId, function () {
                });
            }
            else {
            }
        });
        var getReasonsForNPAQuery = "SELECT recovery_reason_type_id FROM npa_util_recovery_reason WHERE account_id =  " + accountId + ";  ";
        connectionDataSource.getConnection(function (clientConnect) {
            clientConnect.query(getReasonsForNPAQuery,
                function selectCb(err, results, fields) {
                    if (err) {
                        connectionDataSource.releaseConnectionPool(clientConnect);
                        customlog.error(err);
                    }
                    else {
                        for (var i in results) {
                            recoveryReasonsArray[i] = results[i].recovery_reason_type_id;
                        }
                        customlog.info("recoveryReasonsArray" + recoveryReasonsArray);
                        LoanRepaymentForFO.setReasonsIdArray(recoveryReasonsArray);
                    }
                });


            var getAccountDetailsForGroup = "SELECT   " +
                "	npa_det.account_id,  " +
                "	CASE " +
                "		WHEN nld.status_id IS NULL THEN 0 " +
                "		ELSE 1 " +
                "	END AS loan_status, " +
                "	nld.status_id, " +
                "	nld.remarks, " +
                "	nld.other_reasons, " +
                "	nr.question_id, " +
                "	nr.response_txt, " +
                "	npa_det.customer_id,  " +
                "	npa_det.global_account_num,  " +
                "	npa_det.customer,  " +
                "	npa_det.personnel,  " +
                "	npa_det.amount_demanded,  " +
                "	npa_det.amount_paid,  " +
                "	npa_det.overdue,  " +
                "	group_lead_add.address  " +
                "FROM  " +
                "(  " +
                "	SELECT   " +
                "		npa.account_id,  " +
                "		npa.customer_id,  " +
                "		npa.global_account_num,  " +
                "		npa.customer,  " +
                "		npa.personnel,  " +
                "		ROUND(actual_principal_demd+actual_interest_demd) AS amount_demanded,  " +
                "		ROUND(actual_principal_paid+actual_interest_paid) AS amount_paid,  " +
                "		ROUND(actual_principal_overdue+actual_interest_overdue) AS overdue  " +
                "	FROM   " +
                "		npa_util_loan npa  " +
                ")npa_det  " +
                "LEFT JOIN  " +
                "(  " +
                "	SELECT   " +
                "		MIN(c.customer_id) AS customer_id,  " +
                "		c.parent_customer_id,  " +
                "		cad.line_1 AS address   " +
                "	FROM customer c   " +
                "		INNER JOIN customer_address_detail cad ON c.customer_id = cad.customer_id  " +
                "	WHERE c.customer_level_id =1   " +
                "		GROUP BY c.parent_customer_id  " +
                "		ORDER BY c.parent_customer_id,c.customer_id  " +
                ")group_lead_add  " +
                "ON npa_det.customer_id = group_lead_add.parent_customer_id  " +
                "LEFT JOIN npa_util_loan_detail nld ON nld.account_id = npa_det.account_id " +
                "LEFT JOIN npa_util_response nr ON nr.account_id = npa_det.account_id " +
                "WHERE npa_det.account_id = " + accountId + ";  ";
            var answerIdArray = new Array();
            clientConnect.query(getAccountDetailsForGroup,
                function selectCb(err, results, fields) {
                    connectionDataSource.releaseConnectionPool(clientConnect);
                    if (err) {
                        customlog.error(err);
                    }
                    else {
                        for (var i in results) {
                            customlog.info("question_id==" + results[i].question_id);
                            customlog.info("response==" + results[i].response_txt);
                            LoanRepaymentForFO.setAccountId(results[i].account_id);
                            LoanRepaymentForFO.setGroupName(results[i].customer);
                            LoanRepaymentForFO.setAddress(results[i].address);
                            LoanRepaymentForFO.setAmountDemanded(results[i].amount_demanded);
                            LoanRepaymentForFO.setAmountPaid(results[i].amount_paid);
                            LoanRepaymentForFO.setAmountOverdue(results[i].overdue);
                            LoanRepaymentForFO.setLoanOfficer(results[i].personnel);
                            LoanRepaymentForFO.setCustomerId(results[i].customer_id);
                            LoanRepaymentForFO.setRemarks(results[i].remarks);
                            LoanRepaymentForFO.setOtherReasons(results[i].other_reasons);
                            LoanRepaymentForFO.setStatusFlag(results[i].loan_status);
                            if (results[i].response_txt != null) {
                                if (i == 6) {
                                    answerIdArray[i] = dateUtils.formatDateForUI(results[i].response_txt);
                                }
                                else {
                                    answerIdArray[i] = results[i].response_txt;
                                }
                            }
                        }
                        customlog.info("answerIdArray" + answerIdArray);
                        LoanRepaymentForFO.setAnswerIdArray(answerIdArray);
                    }
                    callback(LoanRepaymentForFO);
                });
        });
    },

    assignSingleGroupToFODataModel: function (accountId, roId, callback) {
        var self=this;
        var insertNPALoansDetail = "INSERT INTO npa_util_loan_detail " +
            "(account_id, recovery_officer_id, allocated_date, last_updated_date) " +
            " VALUES(" + accountId + "," + roId + ",NOW() + INTERVAL 5 HOUR + INTERVAL 30 MINUTE,NOW() + INTERVAL 5 HOUR + INTERVAL 30 MINUTE)";
        connectionDataSource.getConnection(function (clientConnect) {
            clientConnect.query(insertNPALoansDetail, function postCreate(err) {
                connectionDataSource.releaseConnectionPool(clientConnect);
                if (!err) {
                    callback();
                } else {
                    customlog.error(err);
                }
            });
        });
    },

    getRecoveryReasonsDataModel: function (callback) {
        var self=this;
        var reasonId = new Array();
        var reasonDescription = new Array();
        var getReasonsQuery = "SELECT * FROM npa_util_recovery_reason_type;";
        connectionDataSource.getConnection(function (clientConnect) {
            clientConnect.query(getReasonsQuery,function selectCb(err, results, fields) {
                connectionDataSource.releaseConnectionPool(clientConnect);
                if (err) {
                    customlog.error(err);
                }
                else {
                    for (var i in results) {
                        reasonId[i] = results[i].recovery_reason_type_id;
                        reasonDescription[i] = results[i].recovery_reason_type;
                    }
                }
                callback(reasonId, reasonDescription);
            });
        });
    },

    insertGroupStatusEntryDateDataModel : function(groupId,statusId,callback){
        var statusQuery
        if(statusId == 0){
            statusQuery = "(SELECT status_id FROM `iklant_prospect_group` WHERE group_id = "+groupId+")";
        }else{
            statusQuery  = statusId
        }
        var insertGroupStatusQuery = "INSERT INTO `iklant_group_status_date_info`(`group_id`,`status_id`,`loan_count`,`status_date`,`created_date`)" +
            "VALUES ("+groupId+","+statusQuery+",(SELECT loan_count FROM `iklant_prospect_group` WHERE group_id = "+groupId+"),NOW() + INTERVAL 5 HOUR + INTERVAL 30 MINUTE,NOW() + INTERVAL 5 HOUR + INTERVAL 30 MINUTE);";
        connectionDataSource.getConnection(function (clientConnect) {
            clientConnect.query(insertGroupStatusQuery, function selectCb(err, results, fields) {
                connectionDataSource.releaseConnectionPool(clientConnect);
                if (err) {
                    callback("Failure");
                    customlog.error("Insert Group Status Query"+err);
                } else {
                    callback("Success");
                }
            });
        });
    }
}


function validator(prosGroup, preVerification, constantsObj) {
    var verification = new Array();
    var currentDate = new Date();
    var alertMessage = "";
    var statusID;
    var isEligible;

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


function monthsDifference(d1, d2) {
    var months;
    months = (d2.getFullYear() - d1.getFullYear()) * 12;
    months -= d1.getMonth() + 1;
    months += d2.getMonth();
    diffMonths = months + 2;
    return diffMonths;
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

function pad2(number) {
    return (number < 10 ? '0' : '') + number
}
