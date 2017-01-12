module.exports = userManagementDataModel;

var path = require('path');
var rootPath = path.dirname(process.mainModule.filename);
var lookupEntityObj;

var dbTableName = require(path.join(rootPath,"properties.json"));

var connectionDataSource = require(path.join(rootPath,"app_modules/data_model/DataSource"));
var customlog = require(path.join(rootPath,"logger/loggerConfig.js"))('UserManagementDataModel.js');
var commonDTO = path.join(rootPath,"app_modules/dto/common");
var dateUtils = require('../utils/DateUtils');

//Business Layer
function userManagementDataModel(constants) {
    customlog.debug("Inside User Management Data Access Layer");
    this.constants = constants;
}

userManagementDataModel.prototype = {

    saveUserDatamodel: function (tenantId, officeId, userName, password, contactNumber, emailId, roleId, userId, imeiNumberId,callback) {
        var self = this;
        /* var manageUsersQuery = "INSERT INTO " + dbTableName.iklantUsers + " (tenant_id,office_id,user_name,password,contact_number,email_id,created_by,created_date,imei_number) VALUES " +
         "(" + tenantId + ", " + officeId + ",'" + userName + "', '" + password + "', '" + contactNumber + "', " +
         "'" + emailId + "', " + userId + ", NOW() + INTERVAL 5 HOUR + INTERVAL 30 MINUTE, '" + imeiNumberId + "') ";*/

        var constantsObj = this.constants;
        var manageUsersQuery = "";
        var roleIds = roleId.toString();
        if(roleIds.indexOf(constantsObj.getBDEroleId())>-1 || roleIds.indexOf(constantsObj.getFOroleId())>-1 ) {

            manageUsersQuery = "INSERT INTO " + dbTableName.iklantUsers + " (tenant_id,office_id,user_name,password,contact_number,email_id,created_by,created_date,imei_number) VALUES " +
                "(" + tenantId + ", " + officeId + ",'" + userName + "', '" + password + "', '" + contactNumber + "', " +
                "'" + emailId + "', " + userId + ", NOW() + INTERVAL 5 HOUR + INTERVAL 30 MINUTE, '" + imeiNumberId + "') ";
        }
        else{
            manageUsersQuery = "INSERT INTO " + dbTableName.iklantUsers + " (tenant_id,office_id,user_name,password,contact_number,email_id,created_by,created_date,password_changed) VALUES " +
                "(" + tenantId + ", " + officeId + ",'" + userName + "', '" + password + "', '" + contactNumber + "', " +
                "'" + emailId + "', " + userId + ", NOW() + INTERVAL 5 HOUR + INTERVAL 30 MINUTE ,0) ";
        }

        customlog.info("Save User Query : " + manageUsersQuery);
        connectionDataSource.getConnection(function (clientConnect) {
            clientConnect.query(manageUsersQuery, function postCreate(err) {
                if (!err) {
                    var getUserIdQuery = "SELECT MAX(user_id) AS user_id FROM "+dbTableName.iklantUsers+"  WHERE tenant_id=" + tenantId + "";
                    customlog.info("Get UserID Query : " + getUserIdQuery);
                    clientConnect.query(getUserIdQuery, function selectCb(err, results, fields) {
                        if (!err) {
                            for (var i in results) {
                                user_id = results[i].user_id;
                            }
                            //var assignRoleQuery = "INSERT INTO "+dbTableName.iklantUserRole+"  (tenant_id,user_id,role_id) " +
                            //"VALUES(" + tenantId + "," + user_id + "," + roleId + ")";
                            //customlog.info("Assign Role Query : " + assignRoleQuery);
                            //clientConnect.query(assignRoleQuery, function postCreate(err) {
                            //if (!err) {
                            if(roleIds.indexOf(constantsObj.getApexPromotors())>-1 || roleIds.indexOf(constantsObj.getCCEroleId())>-1 || roleIds.indexOf(constantsObj.getNaiveroleId())>-1 || roleIds.indexOf(constantsObj.getAMHroleId())>-1 ){
                                customlog.info("Reginal Role Query Execution Inside Promoter,DEO and Naive Under Any Office");
                                var officeRetriveQuery = "SELECT office_id FROM "+dbTableName.iklantOffice+"  WHERE tenant_id=" + tenantId + "";
                                clientConnect.query(officeRetriveQuery, function postCreate(err,officeIdArray) {
                                    if (!err) {
                                        for (var i=0;i<officeIdArray.length;i++){
                                            var reginalRoleQuery = "INSERT INTO rm_regional_office_list (user_id,office_id) " +
                                                "VALUES(" + user_id + "," + officeIdArray[i].office_id + ")";
                                            clientConnect.query(reginalRoleQuery, function postCreate(err) {
                                                if (err) {
                                                    connectionDataSource.releaseConnectionPool(clientConnect);
                                                    callback();
                                                }
                                            });
                                        }
                                        connectionDataSource.releaseConnectionPool(clientConnect);
                                        callback();
                                    }
                                    else
                                    {
                                        connectionDataSource.releaseConnectionPool(clientConnect);
                                        callback();
                                    }
                                });
                            }
                            else if((roleIds.indexOf(constantsObj.getBMroleId())>-1 && officeId == 1) || (roleIds.indexOf(constantsObj.getAccountsExecutiveRoleId())>-1 && officeId == 1)){
                                customlog.info("Reginal Role Query Execution Inside BM and AE Under Head Office");
                                var officeRetriveQuery = "SELECT office_id FROM "+dbTableName.iklantOffice+"  WHERE tenant_id=" + tenantId + "";
                                clientConnect.query(officeRetriveQuery, function postCreate(err,officeIdArray) {
                                    if (!err) {
                                        for (var i=0;i<officeIdArray.length;i++){
                                            var reginalRoleQuery = "INSERT INTO rm_regional_office_list (user_id,office_id) " +
                                                "VALUES(" + user_id + "," + officeIdArray[i].office_id + ")";
                                            clientConnect.query(reginalRoleQuery, function postCreate(err) {
                                                if (err) {
                                                    connectionDataSource.releaseConnectionPool(clientConnect);
                                                    callback();
                                                }
                                            });
                                        }
                                        connectionDataSource.releaseConnectionPool(clientConnect);
                                        callback();
                                    }
                                    else {
                                        connectionDataSource.releaseConnectionPool(clientConnect);
                                        callback();
                                    }
                                });
                            }
                            else {
                                var reginalRoleQuery = "INSERT INTO rm_regional_office_list (user_id,office_id) " +
                                    "VALUES(" + user_id + "," + officeId + ")";
                                customlog.info("Normal Reginal Role Query : " + reginalRoleQuery);
                                clientConnect.query(reginalRoleQuery, function postCreate(err) {
                                    if (err) {
                                        connectionDataSource.releaseConnectionPool(clientConnect);
                                        callback();
                                    }
                                    else {
                                        connectionDataSource.releaseConnectionPool(clientConnect);
                                        callback();
                                    }
                                });
                            }
                        }else {
                            connectionDataSource.releaseConnectionPool(clientConnect);
                            customlog.error(err);
                            callback();
                        }
                        /*});
                         } else {
                         connectionDataSource.releaseConnectionPool(clientConnect);
                         customlog.error(err);
                         callback();
                         }*/
                    });
                } else {
                    connectionDataSource.releaseConnectionPool(clientConnect);
                    customlog.error(err);
                    callback();
                }
            });
        });
    },

    updateUserDatamodel: function (tenantId, currentUserId, officeId, userName, password, contactNumber, emailId, roleId, userId, imeiNumberId,callback) {
        var self = this;
        var constantsObj = this.constants;
        connectionDataSource.getConnection(function (clientConnect) {
            var updateUserQuery = "";
            var retrieveUserQuery;
            //var updateRoleQuery = "UPDATE "+dbTableName.iklantUserRole+"  SET role_id = " + roleId + " WHERE " +
            //"user_id = " + currentUserId + " AND tenant_id = " + tenantId + "";

            if(roleId == constantsObj.getBDEroleId()  || roleId == constantsObj.getFOroleId()) {
                retrieveUserQuery = "SELECT * FROM " + dbTableName.iklantUsers + " WHERE imei_number = '" + imeiNumberId + "' AND user_name NOT IN ('" + userName + "')";
                updateUserQuery = "UPDATE " + dbTableName.iklantUsers + "  SET office_id = " + officeId + ",user_name = '" + userName + "', " +
                    "password = '" + password + "',contact_number = '" + contactNumber + "',email_id = '" + emailId + "', " +
                    "updated_by = " + userId + ",updated_date = NOW() + INTERVAL 5 HOUR + INTERVAL 30 MINUTE,imei_number = '" + imeiNumberId + "' WHERE user_id = " + currentUserId + " and tenant_id=" + tenantId + "";
            }
            else{
                updateUserQuery = "UPDATE " + dbTableName.iklantUsers + "  SET office_id = " + officeId + ",user_name = '" + userName + "', " +
                    "password = '" + password + "',contact_number = '" + contactNumber + "',email_id = '" + emailId + "', " +
                    "updated_by = " + userId + ",updated_date = NOW() + INTERVAL 5 HOUR + INTERVAL 30 MINUTE WHERE user_id = " + currentUserId + " and tenant_id=" + tenantId + "";
            }
            if(roleId == constantsObj.getBDEroleId()  || roleId == constantsObj.getFOroleId()) {
                clientConnect.query(retrieveUserQuery,function(err,result){
                    if(result.length>0){
                        connectionDataSource.releaseConnectionPool(clientConnect);
                        callback(false,"IMEI number already exists for "+result[0].user_name);
                    }else{
                        self.updateUserAndRoleDataModel(clientConnect,updateUserQuery,function(status,message){
                            callback(status,message);
                        });
                    }
                });
            }
            else{
                self.updateUserAndRoleDataModel(clientConnect,updateUserQuery,function(status,message){
                    callback(status,message);
                });
            }
        });
    },

    updateUserAndRoleDataModel : function(clientConnect,updateUserQuery,callback){
        clientConnect.query(updateUserQuery, function postCreate(err) {
            if (err) {
                customlog.info(err+" "+updateUserQuery);
                connectionDataSource.releaseConnectionPool(clientConnect);
                callback(false,"User not updated properly. Please try later");
            }
            else{
                connectionDataSource.releaseConnectionPool(clientConnect);
                callback(true,"");
                /*clientConnect.query(updateRoleQuery, function postCreate(err) {
                 if (err){
                 customlog.info(err+" "+updateRoleQuery);
                 callback(false,"User not updated properly. Please try later");
                 }
                 else {
                 callback(true,"");
                 }
                 });*/
            }
        });
    },

    populateUserDetailsDatamodel: function (tenantId, userId, callback) {
        /*var getUserDetailsQuery = "SELECT u.office_id,u.user_id,u.user_name,u.password,u.contact_number, " +
         "u.email_id,r.role_id FROM "+dbTableName.iklantUsers+"  u " +
         "INNER JOIN "+dbTableName.iklantUserRole+"  ur ON ur.user_id = u.user_id " +
         "INNER JOIN "+dbTableName.iklantRole+"  r ON r.role_id = ur.role_id " +
         "WHERE u.tenant_id=" + tenantId + " AND u.user_id = " + userId + "";*/

        var getUserDetailsQuery = "SELECT u.office_id,u.user_id,u.user_name,u.password,u.contact_number, " +
            "u.email_id,u.imei_number,pr.role_id FROM "+dbTableName.iklantUsers+"  u " +
            "INNER JOIN "+dbTableName.mfiPersonnelRole+"  pr ON pr.personnel_id = u.user_id " +
            "WHERE u.tenant_id=" + tenantId + " AND u.user_id = " + userId + "";
        var self = this;
        var officeId;
        var userId;
        var userName;
        var password;
        var contactNumber;
        var emailId;
        var roleId=new Array();
        var imeiNumber;
        var roleIdArray= new Array();
        customlog.info("Get UserDetails Query : " + getUserDetailsQuery);
        connectionDataSource.getConnection(function (clientConnect) {
            clientConnect.query(getUserDetailsQuery, function selectCb(err, results, fields) {
                connectionDataSource.releaseConnectionPool(clientConnect);
                if (!err) {
                    for (var i in results) {
                        officeId = results[i].office_id;
                        userId = results[i].user_id;
                        userName = results[i].user_name;
                        password = results[i].password;
                        contactNumber = results[i].contact_number;
                        emailId = results[i].email_id;
                        roleIdArray.push(results[i].role_id);
                        imeiNumber = results[i].imei_number;
                    }
                    roleId = roleIdArray;
                    callback(contactNumber,imeiNumber,roleId);
                } else {
                    customlog.error(err);
                    callback(contactNumber);
                }
            });
        });
    },

    deleteUserDataModel: function (userid, tenantId, callback) {
        var self = this;
        /*var deleteUserQuery = "UPDATE "+dbTableName.iklantUsers+"  SET active_indicator = " + this.constants.getActiveIndicatorFalse() + " " +
         "where user_id = " + userid + " ;";*/
        var deleteUserQuery = "UPDATE "+dbTableName.iklantUsers+"  SET active_indicator = " + this.constants.getActiveIndicatorFalse() + ",imei_number='' " +
            "where user_id = " + userid + " ;";
        customlog.info("deleteUserQuery:" + deleteUserQuery);
        connectionDataSource.getConnection(function (clientConnect) {
            clientConnect.query(deleteUserQuery, function postCreate(err) {
                connectionDataSource.releaseConnectionPool(clientConnect);
                if (!err) {
                    callback();
                } else {
                    customlog.error(err);
                    callback();
                }
            });
        });
    },

    //Manage Office
    saveOfficeDatamodel: function (tenantId, officeName, officeShortName, officeAddress, userId, stateId,callback) {
        var self = this;
        var selectOfficeQuery = "SELECT * FROM "+dbTableName.iklantOffice+" WHERE office_name = '" + officeName + "' OR office_short_name = '"+officeShortName+"'";
        var manageOfficeQuery = "INSERT INTO "+dbTableName.iklantOffice+" (tenant_id,office_name,office_short_name,office_address,state_id,created_by,created_date) " +
            "VALUES(" + tenantId + ",'" + officeName + "','" + officeShortName + "','" + officeAddress + "'," + stateId+  "," + userId + ",NOW() + INTERVAL 5 HOUR + INTERVAL 30 MINUTE)";

        customlog.info("Save Office Query : " + manageOfficeQuery);
        connectionDataSource.getConnection(function (clientConnect) {
            clientConnect.query(selectOfficeQuery,function(error,results){
                if(error){
                    callback(false);
                }
                else if(results.length>0){
                    callback(false);
                }else{
                    clientConnect.query(manageOfficeQuery, function postCreate(err) {
                        connectionDataSource.releaseConnectionPool(clientConnect);
                        if (!err) {
                            callback(true);
                        } else {
                            customlog.error(err);
                            callback(false);
                        }
                    });
                }
            });

        });
    },

    updateOfficeDatamodel: function (tenantId, officeId, officeName, officeShortName, officeAddress, userId, callback) {
        var self = this;
        var updateOfficeQuery = "UPDATE "+dbTableName.iklantOffice+"  SET office_name = '" + officeName + "',office_short_name = '" + officeShortName + "', " +
            "office_address = '" + officeAddress + "', " +
            "updated_by = " + userId + ",updated_date = NOW() + INTERVAL 5 HOUR + INTERVAL 30 MINUTE WHERE office_id = " + officeId + " and tenant_id=" + tenantId + "";

        customlog.info("Update Office Query : " + updateOfficeQuery);
        connectionDataSource.getConnection(function (clientConnect) {
            clientConnect.query(updateOfficeQuery, function postCreate(err) {
                connectionDataSource.releaseConnectionPool(clientConnect);
                if (!err) {
                    callback();
                } else {
                    customlog.error(err);
                    callback();
                }
            });
        });
    },

    populateOfficeDetailsDatamodel: function (tenantId, officeId, callback) {
        var self = this;
        var getOfficeDetailsQuery = "SELECT o.office_id,o.office_name,o.office_short_name,o.office_address,isl.state_name FROM "+dbTableName.iklantOffice+" o  " +
            "LEFT JOIN iklant_state_list isl ON isl.state_id = o.state_id " +
            "WHERE office_id = " + officeId + " AND tenant_id = " + tenantId + "";

        var officeId;
        var officeName;
        var officeShortName;
        var officeAddress;
        var stateName;
        customlog.info("Get OfficeDetails Query : " + getOfficeDetailsQuery);
        connectionDataSource.getConnection(function (clientConnect) {
            clientConnect.query(getOfficeDetailsQuery, function selectCb(err, results, fields) {
                connectionDataSource.releaseConnectionPool(clientConnect);
                if (!err) {
                    for (var i in results) {
                        officeId = results[i].office_id;
                        officeName = results[i].office_name;
                        officeShortName = results[i].office_short_name;
                        officeAddress = results[i].office_address;
                        stateName = results[i].state_name;
                    }
                    callback(officeId, officeName, officeAddress, officeShortName,stateName);
                } else {
                    customlog.error(err);
                    callback(officeId, officeName, officeAddress, officeShortName);
                }
            });
        });
    },

    deleteOfficeDataModel: function (officeid, tenantId, callback) {
        var self = this;
        var deleteOfficeQuery = "UPDATE "+dbTableName.iklantOffice+"  SET active_indicator=" + this.constants.getActiveIndicatorFalse() + " " +
            "WHERE office_id = " + officeid + " ;";
        customlog.info("deleteOfficeQuery:" + deleteOfficeQuery);
        connectionDataSource.getConnection(function (clientConnect) {
            clientConnect.query(deleteOfficeQuery, function postCreate(err) {
                connectionDataSource.releaseConnectionPool(clientConnect);
                if (!err) {
                    callback();
                } else {
                    customlog.error(err);
                    callback();
                }
            });
        });
    },
    populateRoleDetailsDatamodel: function (tenantId, roleId, callback) {
        var self = this;
        var selectedOperationIdArray = new Array();
        var selectedOperationNameArray = new Array();
        var roleName;
        var roleDescription;
        var roleOperationsQuery = "SELECT r.role_name,r.role_description,o.operation_id,o.operation_name " +
            "FROM "+dbTableName.iklantRole+"  r " +
            "LEFT JOIN "+dbTableName.iklantRoleOperation+"  ro ON ro.role_id = r.role_id " +
            "LEFT JOIN "+dbTableName.iklantOperation+"  o ON o.operation_id = ro.operation_id " +
            "WHERE r.role_id = " + roleId + " ORDER BY o.operation_id";
        customlog.info("Get Role Operation Details Query : " + roleOperationsQuery);
        connectionDataSource.getConnection(function (clientConnect) {
            clientConnect.query(roleOperationsQuery, function selectCb(err, results, fields) {
                connectionDataSource.releaseConnectionPool(clientConnect);
                if (!err) {
                    for (var i in results) {
                        selectedOperationIdArray[i] = results[i].operation_id;
                        selectedOperationNameArray[i] = results[i].operation_name;
                        roleName = results[i].role_name;
                        roleDescription = results[i].role_description;
                    }
                    self.getRolePrevilegeDetails(tenantId, roleId, function (selectedRolePrevilegeIdArray, selectedRolePrevilegeNameArray) {
                        callback(roleId, roleName, roleDescription, selectedOperationIdArray, selectedOperationNameArray,
                            selectedRolePrevilegeIdArray, selectedRolePrevilegeNameArray);
                    });
                } else {
                    customlog.error(err);
                    callback(roleId, roleName, roleDescription, selectedOperationIdArray, selectedOperationNameArray);
                }
            });
        });
    },
    getRolePrevilegeDetails: function (tenant_id, role_id, callback) {
        var self = this;
        var selectedRolePrevilegeIdArray = new Array();
        var selectedRolePrevilegeNameArray = new Array();
        var rolePrevilegeQuery = "SELECT o.operation_id,o.operation_name FROM "+dbTableName.iklantRolePrevilege+"  rp " +
            "INNER JOIN "+dbTableName.iklantOperation+"  o ON o.operation_id = rp.operation_id " +
            "WHERE rp.role_id = " + role_id + " AND rp.tenant_id = " + tenant_id + " " +
            "ORDER BY o.operation_id";
        customlog.info("Get Role Previlege Details Query : " + rolePrevilegeQuery);
        connectionDataSource.getConnection(function (clientConnect) {
            clientConnect.query(rolePrevilegeQuery, function selectCb(err, results, fields) {
                connectionDataSource.releaseConnectionPool(clientConnect);
                if (!err) {
                    for (var i in results) {
                        selectedRolePrevilegeIdArray[i] = results[i].operation_id;
                        selectedRolePrevilegeNameArray[i] = results[i].operation_name;
                    }
                    callback(selectedRolePrevilegeIdArray, selectedRolePrevilegeNameArray);
                } else {
                    customlog.error(err);
                    callback(selectedRolePrevilegeIdArray, selectedRolePrevilegeNameArray);
                }
            });
        });
    },
    updateRoleDatamodel: function (tenantId, userId, roleId, roleName, roleDescription, insertFlag, deleteFlag, previouslySelectedOperationlist, selectedOperation, callback) {
        var self = this;
        var updateRoleQuery = "UPDATE "+dbTableName.iklantRole+"  SET role_name = '" + roleName + "', " +
            "role_description = '" + roleDescription + "',updated_by=" + userId + ", " +
            "updated_date =NOW() + INTERVAL 5 HOUR + INTERVAL 30 MINUTE WHERE role_id = " + roleId + " AND tenant_id = " + tenantId + "";
        customlog.info("updateRoleQuery:::" + updateRoleQuery);
        connectionDataSource.getConnection(function (clientConnect) {
            clientConnect.query(updateRoleQuery, function postCreate(err) {
                if (err) {
                    customlog.error(err);
                    connectionDataSource.releaseConnectionPool(clientConnect);
                }
            });

            if (insertFlag.length != 0 | deleteFlag.length != 0) {
                for (var i = 0; i < insertFlag.length; i++) {
                    if (insertFlag[i] == 1) {
                        var insertNewTaskForRole = "INSERT INTO "+dbTableName.iklantRoleOperation+"  (role_id, operation_id) " +
                            "VALUES(" + roleId + "," + selectedOperation[i] + "); ";
                        customlog.info("insertNewTaskForRole:" + insertNewTaskForRole);
                        clientConnect.query(insertNewTaskForRole, function postCreate(err) {
                            if (err) {
                                customlog.error(err);
                                connectionDataSource.releaseConnectionPool(clientConnect);
                            }
                        });
                    }
                }
                for (var i = 0; i < deleteFlag.length; i++) {
                    if (deleteFlag[i] == 1) {
                        var deletetask = "DELETE FROM "+dbTableName.iklantRoleOperation+"  WHERE role_id = " + roleId + " AND " +
                            "operation_id = " + previouslySelectedOperationlist[i] + " ";
                        customlog.info("deletetask:" + deletetask);
                        clientConnect.query(deletetask, function postCreate(err) {
                            if (err) {
                                customlog.error(err);
                                connectionDataSource.releaseConnectionPool(clientConnect);
                            }
                        });
                    }
                }
                connectionDataSource.releaseConnectionPool(clientConnect);
                callback();
            }
            else {
                connectionDataSource.releaseConnectionPool(clientConnect);
                callback();
            }
        });
    },
    checkForRoleIsAssignedDatamodel: function (tenantId, roleId, callback) {
        var self = this;
        var constantsObj = this.constants;
        var noOfUsers;
        var checkForRoleIsAssignedQuery = "SELECT COUNT(u.user_id) as noofusers FROM "+dbTableName.mfiPersonnelRole+"  pr " +
            "INNER JOIN "+dbTableName.iklantRole+"  r ON r.role_id = pr.role_id " +
            "INNER JOIN "+dbTableName.iklantUsers+"  u ON u.user_id = pr.personnel_id " +
            "WHERE r.role_id = " + roleId + " AND u.tenant_id = " + tenantId + " " +
            "AND u.active_indicator = " + constantsObj.getActiveIndicatorTrue() + "";
        customlog.info("checkForRoleIsAssignedQuery:" + checkForRoleIsAssignedQuery);
        connectionDataSource.getConnection(function (clientConnect) {
            clientConnect.query(checkForRoleIsAssignedQuery, function selectCb(err, results, fields) {
                connectionDataSource.releaseConnectionPool(clientConnect);
                if (!err) {
                    for (var i in results) {
                        noOfUsers = results[i].noofusers;
                    }
                    callback(noOfUsers);
                } else {
                    customlog.error(err);
                    callback(noOfUsers);
                }
            });
        });
    },
    manageUsers: function (manageUsersObject, callback) {
        //INSERT QUERY FOR MANAGE USERS
        var self = this;
        var manageUsersQuery = "INSERT INTO "+dbTableName.iklantUsers+"  (tenant_id,office_id,user_name,password,contact_number,email_id,created_date) VALUES " +
            "('" + manageUsersObject.getTenant_id() + "', '" + manageUsersObject.getOffice_id() + "','" + manageUsersObject.getUser_name() + "', " +
            "'" + manageUsersObject.getPassword() + "', '" + manageUsersObject.getContact_number() + "'," +
            "'" + manageUsersObject.getEmail_id() + "',NOW() + INTERVAL 5 HOUR + INTERVAL 30 MINUTE) ";


        customlog.info("Query== " + manageUsersQuery);
        connectionDataSource.getConnection(function (clientConnect) {
            clientConnect.query(manageUsersQuery,
                function postCreate(err) {
                    connectionDataSource.releaseConnectionPool(clientConnect);
                    if (!err) {
                        callback();
                    } else {
                        callback();
                        customlog.error(err);
                    }
                }
            );
        });
    },

    assignRoles: function (tenantID, callback) {
        //select query to fetch user details from users table
        var self = this;
        var assignRoles = require(path.join(commonDTO,"/assignRoles"));
        var assignRolesObj = new assignRoles();
        assignRolesObj.clearAll();
        var fetchUsersQuery = "select user_id,user_name from "+dbTableName.iklantUsers+"  where user_id not in (select personnel_id from "+dbTableName.mfiPersonnelRole+" ) AND tenant_id =" + tenantID;
        var user_id = new Array();
        var userName = new Array();
        connectionDataSource.getConnection(function (clientConnect) {
            clientConnect.query(fetchUsersQuery,
                function selectCb(err, results, fields) {
                    if (err) {
                        connectionDataSource.releaseConnectionPool(clientConnect);
                        customlog.error(err);
                    }
                    else {
                        for (var i in results) {
                            user_id[i] = results[i].user_id;
                            userName[i] = results[i].user_name;
                        }
                        assignRolesObj.setUser_id(user_id);
                        assignRolesObj.setUser_name(userName);
                    }
                }
            );
            //select query to fetch roles from role table
            var fetchRolesQuery = "SELECT * FROM "+dbTableName.iklantRole+"  WHERE tenant_id =" + tenantID;
            var role_id = new Array();
            var role_name = new Array();
            clientConnect.query(fetchRolesQuery,
                function selectCb(err, results, fields) {
                    if (err) {
                        connectionDataSource.releaseConnectionPool(clientConnect);
                        customlog.error(err);
                        callback(assignRolesObj);
                    }
                    else {
                        for (var i in results) {
                            role_id[i] = results[i].role_id;
                            role_name[i] = results[i].role_name;
                        }
                        assignRolesObj.setRole_id(role_id);
                        assignRolesObj.setRole_name(role_name);
                        connectionDataSource.releaseConnectionPool(clientConnect);
                        callback(assignRolesObj);
                    }
                });
        });
    },

    saveAssignRoles: function (assignRolesObject, callback) {
        //insert query to insert users n roles into user_role table
        var self = this;
        var insertUserRoleQuery = "insert into "+dbTableName.mfiPersonnelRole+" (role_id,personnel_id) values('" + assignRolesObject.getSelected_role_id() + "','" + assignRolesObject.getSelected_user_id() + "')";
        connectionDataSource.getConnection(function (clientConnect) {
            clientConnect.query(insertUserRoleQuery,
                function postCreate(err) {
                    connectionDataSource.releaseConnectionPool(clientConnect);
                    if (!err) {
                        customlog.info("userID and RoleID inserted successfully");
                        callback();
                    } else {
                        customlog.error(err);
                        callback();
                    }
                }
            );
        });
    },

    /*manageRoles: function (callback) {
        //select query to fetch operations from operation table
        var self = this;
        var manageRoles = require(path.join(rootPath,"app_modules/dto/user_management/manageRoles"));
        var manageRolesObj = new manageRoles();
        var operation_id = new Array();
        var operation_name = new Array();
        var fetchOperationQuery = "SELECT * FROM "+dbTableName.iklantOperation;
        connectionDataSource.getConnection(function (clientConnect) {
            clientConnect.query(fetchOperationQuery, function selectCb(err, results, fields) {
                connectionDataSource.releaseConnectionPool(clientConnect);
                if (err) {
                    customlog.error(err);
                    callback(manageRolesObj);
                }
                else {
                    for (var i in results) {
                        operation_id[i] = results[i].operation_id;
                        operation_name[i] = results[i].operation_name;
                    }
                    manageRolesObj.setOperation_id(operation_id);
                    manageRolesObj.setOperation_name(operation_name);
                    callback(manageRolesObj);
                }
            });
        });
    },*/

    saveManageRoles: function (manageRolesObj, callback) {
        var self = this;
        var insertRolesQuery = "INSERT INTO "+dbTableName.iklantRole+" (tenant_id,role_name,role_description,created_date) VALUES('" + manageRolesObj.getTenantId() + "','" + manageRolesObj.getRoleName() + "','" + manageRolesObj.getRoleDescName() + "',NOW() + INTERVAL 5 HOUR + INTERVAL 30 MINUTE)";
        connectionDataSource.getConnection(function (clientConnect) {
            clientConnect.query(insertRolesQuery,
                function postCreate(err) {
                    if (err) {
                        connectionDataSource.releaseConnectionPool(clientConnect);
                        customlog.error(err);
                    }
                }
            );

            var selectMaxRoleIdQuery = "select max(role_id) as currentRoleId from "+dbTableName.iklantRole+"  where tenant_id=" + manageRolesObj.getTenantId();
            var MaxRoleId = 0;
            var operationsChecked = new Array();
            operationsChecked = manageRolesObj.getCheckedValues().split(",");
            clientConnect.query(selectMaxRoleIdQuery,
                function selectCb(err, results, fields) {
                    if (err) {
                        connectionDataSource.releaseConnectionPool(clientConnect);
                        customlog.error(err);
                    }
                    else {
                        MaxRoleId = results[0].currentRoleId;
                        customlog.info("MAx = " + results[0].currentRoleId);
                        for (i = 0; i < operationsChecked.length; i++) {
                            var insertRoleOperationQuery = "insert into "+dbTableName.iklantRoleOperation+" (role_id,operation_id) values('" + MaxRoleId + "','" + operationsChecked[i] + "') ";
                            clientConnect.query(insertRoleOperationQuery, function postCreate(err) {
                                if (err){
                                    connectionDataSource.releaseConnectionPool(clientConnect);
                                    customlog.error(err);
                                    callback();
                                }
                            });
                        }
                        connectionDataSource.releaseConnectionPool(clientConnect);
                        callback();
                    }
                }
            );
        });
    },

    retrieveUserDetailsDataModel: function (userName, emailId, callback) {
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
    },
    encryptUserDetailsDataModel: function (userName,callback) {
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

    updateUserDetailsDataModel: function (user_id, userName, oldPassword, newPassword, callback) {
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

    updateCustomUserDetailsDataModel: function (user_id, userName, newPassword, callback) {
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

    validateoldPasswordDatamodel : function(userId,encrptedOldPassword,callback){
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
            clientConnect.beginTransaction(function(err){
                if(err){
                    throw err;
                }
                clientConnect.query(updateQuery,function (err,result) {
                    //connectionDataSource.releaseConnectionPool(clientConnect);
                    if (err) {
                        clientConnect.rollback(function(){
                            throw err;
                            customlog.error(err);
                            callback("failure");
                        });
                    }
                    else{
                        clientConnect.commit(function (err){
                           if(err){
                               clientConnect.rollback(function(){
                                    throw err;
                               });
                           }
                            console.log("Transaction Has been completed");
                            clientConnect.end();
                            callback("success");
                        });
                    }
                });
            });
        });
    },
    listExistingReportsDataModel:function(callback){
        var self = this;
        var retrieveListReport  = " SELECT ir.`report_id`, ir.`report_name`,rcc.`report_category_name`,rcc.`report_category_id`"+
            " FROM iklant_reports ir"+
            " INNER JOIN `report_category_custom` rcc ON rcc.`report_category_id` = ir.`report_category` "+
            " WHERE report_state = 1"+
            " ORDER BY `report_category_id` ";
        connectionDataSource.getConnection(function (clientConnect) {
            clientConnect.query(retrieveListReport,
                function selectCb(err, results, fields) {
                    connectionDataSource.releaseConnectionPool(clientConnect);
                    if (err) {
                        customlog.error(err);
                        callback(results,"failure");
                    }
                    else {
                        callback(results,"success");
                    }
                }
            );
        });
    },
    showAddReportViewDataModel:function(callback){
        var self = this;
        var retrieveAddReportParamsQuery  = "SELECT `entity_id` ,`lookup_id`, lookup_value FROM `iklant_lookup_value` WHERE `entity_id` = 33 AND lookup_id != 108";
        var retrieveAddReportRolesQuery  = "SELECT role_id,role_name FROM `iklant_role`";
        var retrieveReportCategoryQuery  = "SELECT `report_category_id`,`report_category_name` FROM `report_category_custom`";
        var ReportParams;
        var ReportRoles;
        var reportCategory;
        connectionDataSource.getConnection(function (clientConnect) {
            clientConnect.query(retrieveAddReportParamsQuery,
                function selectCb(err, results, fields) {
                    ReportParams = results;
                    if (err) {
                        connectionDataSource.releaseConnectionPool(clientConnect);
                        customlog.error(err);
                        callback(ReportParams,ReportRoles,reportCategory,"failure");
                    }
                    else {
                        clientConnect.query(retrieveAddReportRolesQuery,
                            function selectCb(err, results, fields) {
                                ReportRoles = results;
                                if (err) {
                                    customlog.error(err);
                                    callback(ReportParams,ReportRoles,reportCategory,"failure");
                                }
                                else {
                                    clientConnect.query(retrieveReportCategoryQuery,
                                        function selectCb(err, results, fields) {
                                            reportCategory = results;
                                            connectionDataSource.releaseConnectionPool(clientConnect);
                                            if (err) {
                                                customlog.error(err);
                                                callback(ReportParams,ReportRoles,reportCategory,"failure");
                                            }
                                            else {
                                                callback(ReportParams,ReportRoles,reportCategory,"success");
                                            }
                                        }
                                    );
                                }
                            }
                        );
                    }
                }
            );
        });
    },

    createDynamicReportDataModel : function(reportData,callback){
        var self = this;
        var createReportQuery = "INSERT INTO iklant_reports(`report_name`,`procedure_name`,`report_category`,`report_filters`,`report_fields`,`role_id`,`report_state`,`is_background`) VALUES('"+reportData[0]+"','"+reportData[1]+"',"+reportData[2]+",'"+reportData[3]+"','"+reportData[3]+"','"+reportData[4]+"',1,0)";
        connectionDataSource.getConnection(function (clientConnect) {
            connectionDataSource.releaseConnectionPool(clientConnect);
            clientConnect.query(createReportQuery, function postCreate(err) {
                if (err) {
                    callback("failure");
                }else{
                    callback("success");
                }
            });

        });

    }

};