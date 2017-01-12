module.exports = administrativeTasksDataModel;

var path = require('path');
var rootPath = path.dirname(process.mainModule.filename);
var dbTableName = require(path.join(rootPath,"properties.json"));
var fs = require('fs');
var connectionDataSource = require(path.join(rootPath,"app_modules/data_model/DataSource"));
var customLog = require(path.join(rootPath,"logger/loggerConfig.js"))('AdministrativeTasksDataModel.js');
var commonDTO = path.join(rootPath,"app_modules/dto/common");
var dateUtils = require(path.join(rootPath,"app_modules/utils/DateUtils"));

//Business Layer
function administrativeTasksDataModel(constants) {
    customLog.debug("Inside Administrative Tasks Data Access Layer");
    this.constants = constants;
}

administrativeTasksDataModel.prototype = {
    getFundCodeDataModel: function(callback){
        var self = this;
        var fundCodeQuery = " select * from fund_code ";
        connectionDataSource.getConnection(function (clientConnect) {
            clientConnect.query(fundCodeQuery, function (err, results, fields) {
                connectionDataSource.releaseConnectionPool(clientConnect);
                if (err) {
                    callback("failure");
                    customLog.error(err);
                }
                else{
                    callback(results);
                }
            });
        });
    },

    getFundDetailsDataModel: function(callback){
        var self = this;
        var fundCodeQuery = "SELECT `fund_name`,fund_id,(SELECT `fundcode_value` FROM `fund_code` fc WHERE fc.`fundcode_id` = f.`fundcode_id`) AS fundCode FROM fund f";
        connectionDataSource.getConnection(function (clientConnect) {
            clientConnect.query(fundCodeQuery, function (err, results, fields) {
                connectionDataSource.releaseConnectionPool(clientConnect);
                if (err) {
                    callback("failure");
                    customLog.error(err);
                }
                else{
                    callback(results);
                }
            });
        });
    },

    getSelectedFundDetailsDataModel: function(selectedFundId,callback){
        var self = this;
        var fundCodeQuery = "SELECT `fund_name`,`fundcode_id`,`fund_id` FROM `fund` WHERE fund.fund_id = "+selectedFundId;
        connectionDataSource.getConnection(function (clientConnect) {
            clientConnect.query(fundCodeQuery, function (err, results, fields) {
                connectionDataSource.releaseConnectionPool(clientConnect);
                if (err) {
                    callback("failure");
                    customLog.error(err);
                }
                else{
                    callback(results);
                }
            });
        });
    },

    saveFundCodeDataModel: function(fundCode,callback){
        var self = this;
        var fundCodeQuery = " INSERT INTO fund_code(fundcode_value) VALUES('"+fundCode+"') ";
        connectionDataSource.getConnection(function (clientConnect) {
            clientConnect.query(fundCodeQuery, function (err, results, fields) {
                connectionDataSource.releaseConnectionPool(clientConnect);
                if (err) {
                    callback("failure");
                    customLog.error(err);
                }
                else{
                    callback("success");
                }
            });
        });
    },

    //Adedd By Sathish Kumar M 008 For GL Ledger Creations
    retriveGeneralLedgerParentDataModel: function (callback){
        var self = this;
        var coaId = new Array();
        var coaName = new Array();
        var glCode = new Array();
        var categoryType = new Array();
        var parentCoaId = new Array();
        var entityId = new Array();
        var entityName = new Array();
        var retriveGLQuery = "SELECT c.coa_id,c.coa_name,c.glcode_id,c.category_type,ch.parent_coaid FROM coa c "+
         " INNER JOIN coahierarchy ch ON ch.coa_id = c.coa_id WHERE ch.parent_coaid IS NULL";
        customLog.info("Parant "+retriveGLQuery);
        connectionDataSource.getConnection(function (clientConnect) {
            clientConnect.query(retriveGLQuery, function (err, results, fields) {
                if (err) {
                    callback("failure");
                    connectionDataSource.releaseConnectionPool(clientConnect);
                    customLog.error(err);
                }
                else{
                    for (i in results){
                        coaId[i]=results[i].coa_id;
                        coaName[i]=results[i].coa_name;
                        glCode[i]=results[i].glcode_id;
                        categoryType[i]=results[i].category_type;
                        parentCoaId[i]=results[i].parent_coaid;
                    }
                    var lookupQuery = "SELECT entity_id,entity_name,description FROM lookup_entity WHERE `entity_id` IN(102,103)";
                    clientConnect.query(lookupQuery, function(err,results,fields){
                        connectionDataSource.releaseConnectionPool(clientConnect);
                        if (err) {
                            callback("failure");
                            customLog.error(err);
                        }
                        else{
                            for(i in results){
                                entityId[i] = results[i].entity_id;
                                entityName[i] = results[i].entity_name;
                            }
                            callback(coaId,coaName,glCode,categoryType,parentCoaId,entityId,entityName);
                        }
                    });
                }
            });
        });
    },
    retriveFirstchildGLParentDataModel: function (selectedGLParentCode,callback){
        var self = this;
        var maxGlCode;
        var generalLedgerFirstChildIdArray = new Array();
        var generalLedgerFirstChildNameArray = new Array();
        var generalLedgerFirstChildglCodeArray = new Array();
        var generalLedgerFirstChildcategoryTypeArray = new Array();
        var generalLedgerFirstChildparentCoaIdArray = new Array();
        var retriveGLQuery = "SELECT c.coa_id,c.coa_name,c.glcode_id,c.category_type,ch.parent_coaid,(SELECT (MAX(glcode_value)+1) AS gl_code FROM gl_code WHERE glcode_id = (SELECT MAX(coa_id) FROM coahierarchy WHERE parent_coaid = "+ selectedGLParentCode +")) as gl_code FROM coa c "+
            " INNER JOIN coahierarchy ch ON ch.coa_id = c.coa_id WHERE ch.parent_coaid = "+ selectedGLParentCode
        customLog.info("First Child "+retriveGLQuery);
        connectionDataSource.getConnection(function (clientConnect) {
            clientConnect.query(retriveGLQuery, function (err, results, fields) {
                connectionDataSource.releaseConnectionPool(clientConnect);
                if (err) {
                    callback("failure");
                    customLog.error(err);
                }
                else{
                    maxGlCode = results[0].gl_code;
                    for (i in results){
                        generalLedgerFirstChildIdArray[i]=results[i].coa_id;
                        generalLedgerFirstChildNameArray[i]=results[i].coa_name;
                        generalLedgerFirstChildglCodeArray[i]=results[i].glcode_id;
                        generalLedgerFirstChildcategoryTypeArray[i]=results[i].category_type;
                        generalLedgerFirstChildparentCoaIdArray[i]=results[i].parent_coaid;
                    }

                    callback(maxGlCode,generalLedgerFirstChildIdArray,generalLedgerFirstChildNameArray,generalLedgerFirstChildglCodeArray,generalLedgerFirstChildcategoryTypeArray,generalLedgerFirstChildparentCoaIdArray);
                }
            });
        });
    },
    retriveSecondchildGLParentDataModel: function (selectedGLFirtChildCode,callback){
        var self = this;
        var maxGlCode;
        var generalLedgerSecondChildIdArray = new Array();
        var generalLedgerSecondChildNameArray = new Array();
        var generalLedgerSecondChildglCodeArray = new Array();
        var generalLedgerSecondChildcategoryTypeArray = new Array();
        var generalLedgerSecondChildparentCoaIdArray = new Array();
        var retriveGLQuery = "SELECT c.coa_id,c.coa_name,c.glcode_id,c.category_type,ch.parent_coaid,(SELECT (MAX(glcode_value)+1) AS gl_code FROM gl_code WHERE glcode_id = (SELECT MAX(coa_id) FROM coahierarchy WHERE parent_coaid = "+ selectedGLFirtChildCode +")) as gl_code FROM coa c "+
            " INNER JOIN coahierarchy ch ON ch.coa_id = c.coa_id "+
            " INNER JOIN gl_code gl ON gl.glcode_id = c.glcode_id "+
            " WHERE ch.parent_coaid = "+ selectedGLFirtChildCode
        customLog.info("Second Child "+retriveGLQuery);
        connectionDataSource.getConnection(function (clientConnect) {
            clientConnect.query(retriveGLQuery, function (err, results, fields) {
                connectionDataSource.releaseConnectionPool(clientConnect);
                if (err) {
                    callback("failure");
                    customLog.error(err);
                }
                else{
                    for (i in results){
                        maxGlCode = results[0].gl_code;
                        generalLedgerSecondChildIdArray[i]=results[i].coa_id;
                        generalLedgerSecondChildNameArray[i]=results[i].coa_name;
                        generalLedgerSecondChildglCodeArray[i]=results[i].glcode_id;
                        generalLedgerSecondChildcategoryTypeArray[i]=results[i].category_type;
                        generalLedgerSecondChildparentCoaIdArray[i]=results[i].parent_coaid;
                    }

                    callback(maxGlCode,generalLedgerSecondChildIdArray,generalLedgerSecondChildNameArray,generalLedgerSecondChildglCodeArray,generalLedgerSecondChildcategoryTypeArray,generalLedgerSecondChildparentCoaIdArray);
                }
            });
        });
    },
    getGLDetailsDataModel : function(callback){
        var self = this;
        var coaOfficeNameArray = new Array();
        var coaIdArray = new Array();
        var coaNameArray = new Array();
        var glCodeValueArray = new Array();
        var parentNameArray = new Array();
        var coaBankOrCashArray = new Array();
        var retriveGLQuery = " SELECT IFNULL(le.entity_name,'None') AS entity_name,o.display_name,gl.office_id,c.`coa_id`,c.`coa_name`,c.`glcode_id`,c.`category_type`,ch.`parent_coaid`,(SELECT `glcode_value` FROM `gl_code` WHERE `glcode_id` = c.`glcode_id`) AS gl_value,(SELECT coa_name FROM coa WHERE coa_id = ch.`parent_coaid`) AS parent_name FROM `coa` c " +
        " INNER JOIN coahierarchy ch ON ch.coa_id = c.coa_id "+
        " INNER JOIN gl_code_custom gl ON gl.glcode_id = c.glcode_id "+
        " INNER JOIN office o ON o.office_id = gl.office_id "+
        " INNER JOIN gl_code g ON g.glcode_id = gl.glcode_id "+
        " LEFT JOIN lookup_value lv ON lv.lookup_name = g.glcode_value "+
        " LEFT JOIN `lookup_entity` le ON le.`entity_id` = lv.entity_id ORDER BY c.coa_id "
        customLog.info("Second Child "+retriveGLQuery);
        connectionDataSource.getConnection(function (clientConnect) {
            clientConnect.query(retriveGLQuery, function (err, results, fields) {
                connectionDataSource.releaseConnectionPool(clientConnect);
                if (err) {
                    callback("failure");
                    customLog.error(err);
                }
                else{
                    for (i in results){
                        coaIdArray[i]=results[i].coa_id;
                        coaNameArray[i]=results[i].coa_name;
                        glCodeValueArray[i]=results[i].gl_value;
                        parentNameArray[i]=results[i].parent_name;
                        coaBankOrCashArray[i] = results[i].entity_name;
                        coaOfficeNameArray[i] = results[i].display_name;
                    }

                    callback(coaIdArray,coaNameArray,glCodeValueArray,parentNameArray,coaBankOrCashArray,coaOfficeNameArray,results);
                }
            });
        });
    },
    updateGLDataModel : function(coaCodeId,coaCodeName,callback){
        var self = this;
        var glUpdateQuery = "UPDATE coa SET coa_name = '" + coaCodeName + "' WHERE coa_id= "+coaCodeId;
        connectionDataSource.getConnection(function (clientConnect) {
            clientConnect.query(glUpdateQuery, function (err) {
                connectionDataSource.releaseConnectionPool(clientConnect);
                if (err) {
                    callback("failure");
                    customLog.error(err);
                }
                else{
                    callback("success");
                }
            });
        });
    }
    //Ended By Sathish Kumar M 008 For Gl Creations
};