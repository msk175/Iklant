module.exports = boDashBoardRouter;
var path = require('path');
var rootPath = path.dirname(process.mainModule.filename);
var props = require(path.join(rootPath,"properties.json"));
mifosServiceIP = props.mifosServiceIp;
mifosPort = props.mifosPort;
GPSPort = props.GPSPort;
iklantPort = props.iklantPort;
var fs = require('fs');

var commonDTO = path.join(rootPath,"app_modules/dto/common");

var customlog = new require(path.join(rootPath,"logger/loggerConfig.js"))('BODashBoardRouter.js');
var BODashBoardModel = require(path.join(rootPath,"app_modules/model/BODashBoardModel"));
var dateUtils = require(path.join(rootPath,'app_modules/utils/DateUtils'));

function boDashBoardRouter(constants) {
    customlog.debug("Inside Router");
    this.model = new BODashBoardModel(constants);
    this.constants = constants;
}

boDashBoardRouter.prototype = {


    getGroupCount : function(req,res) {

        var self = this;
        var constantsObj = this.constants;
        var tenantId = req.session.tenantId;
        var userId = req.session.userId;
        var moment = require('moment');
        var toDate = req.params.requestedDate;
        var constantsObj = this.constants;
        var roleId =  req.session.roleId;
        console.log(req.session.roleIds.length);
        if(typeof tenantId == 'undefined' || typeof userId == 'undefined') {
            res.redirect(props.contextPath+'/client/ci/login');
        }
        else {

            if(typeof toDate == 'undefined' || typeof toDate == '') {
                toDate = moment().format("YYYY-MM-DD");
            }

            self.model.getGroupCountModel(toDate,function(groupCountDashboardJsonObj){
                req.session.requestDashboardDate = toDate;
                res.render('bo_dashboard/groupCountDashBoardRegionalWise', {
                    contextPath: props.contextPath,
                    constantsObj: constantsObj,
                    groupCountDashboardJsonObj : groupCountDashboardJsonObj,
                    toDate : moment(toDate).format("Do MMM YYYY"),
                    roleId : roleId,
                    roleIdLength : req.session.roleIds.length,
                    constantsObj : constantsObj
                });
            });

        }

    },

    getGroupCountBranchWise : function(req,res) {

        var self = this;
        var constantsObj = this.constants;
        var moment = require('moment');
        var tenantId = req.session.tenantId;
        var userId = req.session.userId;
        var regionalOfficeId = req.params.regionId;
        var regionalOfficeName = req.params.regionOfficeName;



        if (regionalOfficeId == 'undefined' || regionalOfficeId == '') {
            regionalOfficeId = req.session.regionalOfficeIdDB;
            regionalOfficeName = req.session.regionalOfficeNameDB;
        } else {
            req.session.regionalOfficeIdDB = regionalOfficeId;
            req.session.regionalOfficeNameDB = regionalOfficeName;
        }
        var toDate = req.session.requestDashboardDate;


        if(typeof tenantId == 'undefined' || typeof userId == 'undefined') {
            res.redirect(props.contextPath+'/client/ci/login');
        }
        else {

            self.model.getGroupCountBranchWiseModel(regionalOfficeId,toDate,function(groupCountDashboardJsonObj){
                console.log(groupCountDashboardJsonObj);
                res.render('bo_dashboard/groupCountDashBoardBranchWise', {
                    contextPath: props.contextPath,
                    constantsObj: constantsObj,
                    groupCountDashboardJsonObj : groupCountDashboardJsonObj,
                    regionalOfficeName : regionalOfficeName,
                    toDate : moment(toDate).format("Do MMM YYYY"),

                });
            });

        }
    },

    getGroupStatusCountForSelectedBranch : function(req,res) {

        var self = this;
        var constantsObj = this.constants;
        var moment = require('moment');
        var tenantId = req.session.tenantId;
        var userId = req.session.userId;
        var branchOfficeId = req.params.branchId;
        var branchOfficeName = req.params.branchOfficeName;
        var regionalOfficeName = req.params.regionalOfficeName;
        var toDate = req.session.requestDashboardDate;

        if (branchOfficeId == 'undefined' || branchOfficeId == '') {
            branchOfficeId = req.session.branchOfficeIdDB;
            branchOfficeName = req.session.branchOfficeNameDB;
            regionalOfficeName = req.session.regionalOfficeNameDB;

        } else {
            req.session.branchOfficeIdDB = branchOfficeId;
            req.session.branchOfficeNameDB = branchOfficeName;
            req.session.regionalOfficeNameDB = regionalOfficeName;
        }

        if(typeof tenantId == 'undefined' || typeof userId == 'undefined') {
            res.redirect(props.contextPath+'/client/ci/login');
        }
        else {

            self.model.getGroupStatusCountForSelectedBranchModel(branchOfficeId,toDate,function(groupStatusCountJsonArray){
                console.log(groupStatusCountJsonArray);
                res.render('bo_dashboard/groupStatusCountDashboardStatusWise', {
                    contextPath: props.contextPath,
                    constantsObj: constantsObj,
                    groupStatusCountJsonArray : groupStatusCountJsonArray,
                    branchOfficeName : branchOfficeName,
                    branchOfficeId : branchOfficeId,
                    regionalOfficeName : regionalOfficeName,
                    toDate : moment(toDate).format("Do MMM YYYY")
                });
            });
        }
    },

    getGroupListForSelectedStatus : function(req,res) {

        var self = this;
        var constantsObj = this.constants;
        var moment = require('moment');
        var tenantId = req.session.tenantId;
        var userId = req.session.userId;

        var branchOfficeId = req.params.branchId;
        var reportStatus = req.params.reportStatus;
        var groupStatus = req.params.groupStatus;

        var toDate = req.session.requestDashboardDate;

        if(typeof tenantId == 'undefined' || typeof userId == 'undefined') {
            res.redirect(props.contextPath+'/client/ci/login');
        }
        else {

            self.model.getGroupListForSelectedStatusModel(branchOfficeId,reportStatus,groupStatus,toDate,function(groupListForSelectedStatusJsonArray,statusDescription){
                console.log(groupListForSelectedStatusJsonArray);
                res.render('bo_dashboard/groupDetailDashboard', {
                    contextPath: props.contextPath,
                    constantsObj: constantsObj,
                    groupListForSelectedStatusJsonArray : groupListForSelectedStatusJsonArray,
                    branchOfficeName : req.session.branchOfficeNameDB,
                    branchOfficeId : branchOfficeId,
                    regionalOfficeName : req.session.regionalOfficeNameDB,
                    statusDescription : statusDescription,
                    toDate : moment(toDate).format("Do MMM YYYY")
                });
            });
        }
    },
    deoListForClient  : function(req,res) {

        var self = this;
        var constantsObj = this.constants;
        var tenantId = req.session.tenantId;
        var userId = req.session.userId;
        var clientId = req.params.clientId;

        if(typeof tenantId == 'undefined' || typeof userId == 'undefined') {
            res.redirect(props.contextPath+'/client/ci/login');
        }
        else {
            self.model.deoListForClientModel(clientId,function(deoListJson){
                req.body.status = "success";
                req.body.deoListJson = deoListJson;
                res.send(req.body);
            });
        }
    },

    getRegionalWiseGroupCountSummary : function(req,res) {

        var self = this;
        var constantsObj = this.constants;
        var tenantId = req.session.tenantId;
        var userId = req.session.userId;
        var moment = require('moment');
        var fromDate = req.body.fromDateId;
        var toDate = req.body.toDateId;

        var roleId =  req.session.roleId;


        if(typeof tenantId == 'undefined' || typeof userId == 'undefined') {
            res.redirect(props.contextPath+'/client/ci/login');
        }
        else {
            if(typeof fromDate == 'undefined' || typeof toDate == 'undefined') {
                toDate = moment().format("YYYY-MM-DD");
                fromDate = moment().subtract(7, 'days').format("YYYY-MM-DD");
            }
            self.model.getRegionalWiseGroupCountSummaryModel(fromDate,toDate,function(regionalWiseSummaryArray,totalSummaryJson){
                res.render('bo_dashboard/boSummaryDashBoard', {
                    contextPath: props.contextPath,
                    constantsObj: constantsObj,
                    regionalWiseSummaryArray : regionalWiseSummaryArray,
                    totalSummaryJson : totalSummaryJson,
                    fromDate : fromDate,
                    toDate : toDate,
                    roleId : roleId,
                    roleIdLength : req.session.roleIds.length
                });
            });

        }

    },

    getDateWiseGroupCountSummary : function(req,res){

        var self = this;
        var constantsObj = this.constants;
        var tenantId = req.session.tenantId;
        var userId = req.session.userId;
        var moment = require('moment');
        var fromDate = req.body.fromDateId;
        var toDate = req.body.toDateId;
        var roleId =  req.session.roleId;



        if(typeof tenantId == 'undefined' || typeof userId == 'undefined') {
            res.redirect(props.contextPath+'/client/ci/login');
        }
        else {
            if (typeof fromDate == 'undefined' || typeof toDate == 'undefined') {
                toDate = moment().format("YYYY-MM-DD");
                fromDate = moment().subtract(7, 'days').format("YYYY-MM-DD");
            }
            self.model.getDateWiseGroupCountModel(fromDate,toDate,function(dateWiseSummaryArray){
                console.log(dateWiseSummaryArray);
                res.render('bo_dashboard/dateWiseDashBoard', {
                    contextPath: props.contextPath,
                    constantsObj: constantsObj,
                    dateWiseSummaryArray : dateWiseSummaryArray,
                    fromDate : fromDate,
                    toDate : toDate,
                    roleId : roleId,
                    roleIdLength : req.session.roleIds.length
                });
            });
        }

    },

    deoWiseList : function(req,res) {

        var self = this;
        var constantsObj = this.constants;
        var tenantId = req.session.tenantId;
        var userId = req.session.userId;
        var moment = require('moment');
        var fromDate = req.body.fromDateId;
        var toDate = req.body.toDateId;
        var roleId =  req.session.roleId;

        if (typeof tenantId == 'undefined' || typeof userId == 'undefined') {
            res.redirect(props.contextPath + '/client/ci/login');
        }
        else {
            if (typeof fromDate == 'undefined' || typeof toDate == 'undefined') {
                toDate = moment().subtract(1, 'days').format("YYYY-MM-DD");
                fromDate = moment().subtract(1, 'days').format("YYYY-MM-DD");
            }
            self.model.deoWiseListModel (fromDate,toDate,function(deoWiseSummaryArray){
                console.log(deoWiseSummaryArray);
                res.render('bo_dashboard/deoWiseSummaryDashboard', {
                    contextPath: props.contextPath,
                    constantsObj: constantsObj,
                    deoWiseSummaryArray : deoWiseSummaryArray,
                    fromDate : fromDate,
                    toDate : toDate,
                    roleId : roleId,
                    roleIdLength : req.session.roleIds.length
                });
            });
        }

        }
};
