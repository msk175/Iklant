module.exports = authenticationDataModel;

var path = require('path');
var rootPath = path.dirname(process.mainModule.filename);
var dbTableName = require(path.join(rootPath,"properties.json"));

var connectionDataSource = require(path.join(rootPath,"app_modules/data_model/DataSource"));


var customlog = require(path.join(rootPath,"logger/loggerConfig.js"))('authenticationDataModel.js');

function authenticationDataModel(constants) {
    this.constants = constants;
    customlog.debug("Inside Authentication Data Access Layer");




}

authenticationDataModel.prototype = {
    authLoginAccess: function (userName, password, callback) {
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
        connectionDataSource.getConnection(function (clientConnect, err) {
            if (!err){
                customlog.info('Inside Connection');
                clientConnect.query(userDetailsQuery, function selectCb(err, results, fields) {
                    customlog.info('Inside Query execution');
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
                            "WHERE mr.role_id IN ("+roleIdArray+") AND ml.parent_menu_id IS NULL  AND ml.depth_level=0 AND currently_in_use = 1 GROUP BY mr.menu_id";
                        customlog.info(menuDetailsQuery);
                        //connectionDataSource.getConnection(function (clientConnect, err) {
                          //  if (!err) {
                                clientConnect.query(menuDetailsQuery, function selectCb(err, resultsMenu, fields) {
                                    connectionDataSource.releaseConnectionPool(clientConnect);
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

                            //} else {
                              //  customlog.error(err);
                            //}

                       // });
                }
                    else{
                        connectionDataSource.releaseConnectionPool(clientConnect);
                        callback(results);
                    }
                });
            }else {
                connectionDataSource.releaseConnectionPool(clientConnect);
                customlog.error("Login query " + err);
            }

        });
    }
}