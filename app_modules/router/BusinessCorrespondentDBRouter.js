module.exports = businessCorrespondentDBRouter;
var path = require('path');
var rootPath = path.dirname(process.mainModule.filename);
var props = require(path.join(rootPath,"properties.json"));
mifosServiceIP = props.mifosServiceIp;
mifosPort = props.mifosPort;
GPSPort = props.GPSPort;
iklantPort = props.iklantPort;
var fs = require('fs');

var commonDTO = path.join(rootPath,"app_modules/dto/common");

var customlog = new require(path.join(rootPath,"logger/loggerConfig.js"))('BusinessCorrespondentDBRouter.js');
var BODashBoardDataModel = require(path.join(rootPath,"app_modules/data_model/BusinessCorrespondentDBDataModel"));
var dateUtils = require(path.join(rootPath,'app_modules/utils/DateUtils'));

function businessCorrespondentDBRouter(constants) {
    customlog.debug("Inside BusinessCorrespondentDBRouter");
    this.dataModel = new BODashBoardDataModel(constants);
    this.constants = constants;
}

businessCorrespondentDBRouter.prototype = {

    getBCSummary : function(req,res) {

        var self = this;
        var constantsObj = this.constants;
        var tenantId = req.session.tenantId;
        var userId = req.session.userId;
        var roleId =  req.session.roleId;
        var groupByColumn = "bc.bc_id";
        var moment = require('moment');
        var toDate = moment().format("YYYY-MM-DD");
        var fromDate = moment().format("YYYY-MM-DD");
        var previousDate = moment().subtract(1, 'days').format("YYYY-MM-DD");
        self.dataModel.getBCSummaryDataModel(userId,roleId,groupByColumn,previousDate,function(bcSummaryJsonArray){
            console.log(bcSummaryJsonArray);
            res.render('bc_dashboard/bcSummary', {
                contextPath: props.contextPath,
                constantsObj: constantsObj,
                bcSummaryJsonArray : bcSummaryJsonArray,
                roleId : roleId,
                constantsObj : constantsObj,
                fromDate : fromDate,
                toDate : toDate,
            });
        });

    },

    getBCSummaryBranchWise : function(req,res){
        var self = this;
        var constantsObj = this.constants;
        var tenantId = req.session.tenantId;
        var userId = req.session.userId;
        var roleId =  req.session.roleId;
        var groupByColumn = "o.office_id";
        var moment = require('moment');
        var previousDate = moment().subtract(1, 'days').format("YYYY-MM-DD");
        self.dataModel.getBCOfficeWiseSummaryDataModel(userId,roleId,groupByColumn,previousDate,function(bcSummaryJsonArray){
            console.log(bcSummaryJsonArray);
            req.body.bcSummaryJsonArray = bcSummaryJsonArray;
            res.send(req.body);

            /*res.render('bc_dashboard/bcSummary', {
                contextPath: props.contextPath,
                constantsObj: constantsObj,
                bcSummaryJson : bcSummaryJson,
                roleId : roleId,
                constantsObj : constantsObj
            });*/
        });
    },
    getdemandvscollectionSummary : function(req,res) {
        var self = this;
        var constantsObj = this.constants;
        var tenantId = req.session.tenantId;
        var userId = req.session.userId;
        var roleId =  req.session.roleId;

        var toDate = req.body.toDate;
        var fromDate = req.body.fromDate;

        var groupByColumn = req.body.groupByColumn;

        self.dataModel.getBCDemandVsCollectionSummaryDataModel(userId,roleId,groupByColumn,fromDate,toDate,function(bcDemandVsCollectionSummaryJsonArray){
            console.log(bcDemandVsCollectionSummaryJsonArray);
            req.body.bcDemandVsCollectionSummaryJsonArray = bcDemandVsCollectionSummaryJsonArray;
            res.send(req.body);
        });

        /*if(groupByColumn == "bc.bc_id") {
            self.dataModel.getBCDemandVsCollectionSummaryDataModel(userId,roleId,groupByColumn,fromDate,toDate,function(bcDemandVsCollectionSummaryJsonArray){
                console.log(bcDemandVsCollectionSummaryJsonArray);
                req.body.bcDemandVsCollectionSummaryJsonArray = bcDemandVsCollectionSummaryJsonArray;
                res.send(req.body);
            });
        }else{
            self.dataModel.getBCDemandVsCollectionOfficeWiseyDataModel(userId,roleId,groupByColumn,fromDate,toDate,function(bcDemandVsCollectionSummaryJsonArray){
                console.log("office wise  " + bcDemandVsCollectionSummaryJsonArray);
                req.body.bcDemandVsCollectionSummaryJsonArray = bcDemandVsCollectionSummaryJsonArray;
                res.send(req.body);
            });
        }*/

    },
    //Added By Sathish Kumar M #008 for Sales Pile Line Dashboard
    getBCSalesPipeLineBranchWise : function(req,res){
        var self = this;
        var constantsObj = this.constants;
        var tenantId = req.session.tenantId;
        var userId = req.session.userId;
        var roleId =  req.session.roleId;
        var groupByColumn = "io.office_id";

        self.dataModel.getBCSalesPipeLineBranchWiseDataModel(userId,roleId,groupByColumn,function(bcSalesJsonArray,bcSalesJsonTotalArray){
            console.log(bcSalesJsonArray);
            req.body.bcSalesJsonArray = bcSalesJsonArray;
            req.body.bcSalesJsonTotalArray = bcSalesJsonTotalArray;
            res.send(req.body);
        });
    },
    getMonthwisePortfolio : function(req,res){

        var self = this;
        var constantsObj = this.constants;
        var tenantId = req.session.tenantId;
        var userId = req.session.userId;
        var roleId =  req.session.roleId;
        self.dataModel.getMonthwisePortfolioDataModel(userId,roleId,function(bcMontheisePortfolioJson){
            console.log("bcMontheisePortfolioJson  " + bcMontheisePortfolioJson);
            req.body.bcMontheisePortfolioJson = bcMontheisePortfolioJson;
            res.send(req.body);
        });
    },
    getStateWisePortfolio : function(req,res) {
        var self = this;
        var constantsObj = this.constants;
        var tenantId = req.session.tenantId;
        var userId = req.session.userId;
        var roleId =  req.session.roleId;
        var moment = require('moment');
        var previousDate = moment().subtract(1, 'days').format("YYYY-MM-DD");
        self.dataModel.getStateWisePortfolioDataModel(userId,roleId,previousDate,function(bcStateWisePortfolioJson){
            console.log( bcStateWisePortfolioJson);
            req.body.bcStateWisePortfolioJson = bcStateWisePortfolioJson;
            res.send(req.body);
        });

    },
    getLoanSizeWisePortfolio : function(req,res){
        var self = this;
        var constantsObj = this.constants;
        var tenantId = req.session.tenantId;
        var userId = req.session.userId;
        var roleId =  req.session.roleId;
        self.dataModel.getLoanSizeWisePortfolioDataModel(userId,roleId,function(bcLoanSizeWisePortfolioJson){
            console.log( bcLoanSizeWisePortfolioJson);
            req.body.bcLoanSizeWisePortfolioJson = bcLoanSizeWisePortfolioJson;
            res.send(req.body);
        });
    },
    getLoanPurposeWisePortfolio : function(req,res){
        var self = this;
        var constantsObj = this.constants;
        var tenantId = req.session.tenantId;
        var userId = req.session.userId;
        var roleId =  req.session.roleId;
        self.dataModel.getLoanPurposeWisePortfolioDataModel(userId,roleId,function(bcLoanPurposeWisePortfolioJson){
            console.log( bcLoanPurposeWisePortfolioJson);
            req.body.bcLoanPurposeWisePortfolioJson = bcLoanPurposeWisePortfolioJson;
            res.send(req.body);
        });
    },

    getLoanCycleWisePortfolio : function(req,res) {
        var self = this;
        var constantsObj = this.constants;
        var tenantId = req.session.tenantId;
        var userId = req.session.userId;
        var roleId = req.session.roleId;
        self.dataModel.getLoanCycleWisePortfolioDataModel(userId, roleId, function (bcLoanCycleWisePortfolioJson) {
            console.log(bcLoanCycleWisePortfolioJson);
            req.body.bcLoanCycleWisePortfolioJson = bcLoanCycleWisePortfolioJson;
            res.send(req.body);
        });
    },
    //Added By Sathish Kumar M #008 For Generate the Excel BC Demand report
    getDemandReportExport: function(req,res){
        var self = this;
        var constantsObj = this.constants;
        var tenantId = req.session.tenantId;
        var userId = req.session.userId;
        var roleId =  req.session.roleId;
        var fromDate = req.body.fromDate;
        var toDate = req.body.toDate;
        var reportName = req.body.reportName;
        var exportType = req.body.exportType;
        self.dataModel.callGenerateReportForBc(fromDate,toDate,userId,reportName,exportType,function(generalLedgerResult, fileLocation){
            if(fileLocation){
                req.body.downloadFlag='Download';
                req.body.fileLocation=fileLocation;
                res.send(req.body);
            }
            else{
                req.body.downloadFlag='No Records';
                req.body.fileLocation=fileLocation;
                res.send(req.body);
            }

        });
    },
    getDepositStatement : function(req,res) {
        var self = this;
        var constantsObj = this.constants;
        var tenantId = req.session.tenantId;
        var userId = req.session.userId;
        var roleId =  req.session.roleId;
        var moment = require('moment');
        var fromDate = moment().subtract(7, 'days').format("YYYY-MM-DD");
        var toDate = moment().format("YYYY-MM-DD");

        res.render('bc_dashboard/depositStatement', {
            contextPath: props.contextPath,
            constantsObj: constantsObj,
            fromDate : fromDate,
            toDate : toDate
        });

    }

};
