/**
 * Created by Siva on 24-11-2014.
 */
var path = require('path');
var rootPath = path.dirname(process.mainModule.filename);
function reportQueries() {
    var constantsRequire = require(path.join(rootPath,"app_modules/dto/common/Constants"));
    var constants = new constantsRequire();
    this.constants = constants;

}

reportQueries.prototype = {
    getReportQuery : function(reportName,spname,inputData,reportFilter,reportParamTypeData,callback){
        var inputData = JSON.parse(inputData);
        var reportParamTypeData = JSON.parse(reportParamTypeData);
        var queryForReport = "CALL "+spname+"("+getParameter(inputData,reportFilter,reportParamTypeData)+")";
        //var queryForReport = eval("get"+reportName+"Query(spname,filters)");
        callback(queryForReport);
    }

}

function getParameter(inputData,reportFilter,reportParamTypeData){
    var reportFilterArray =  reportFilter.split(",");
    var spParameterString = "";
    for(var i=0;i<reportFilterArray.length; i++){
        if(reportFilterArray.length-1 == i){
            if(reportParamTypeData["lookup"+reportFilterArray[i]]== '0'){
                spParameterString = spParameterString+"'" +inputData[reportFilterArray[i]]+ "',";
            }
            else{
                spParameterString = spParameterString+inputData[reportFilterArray[i]]+ ",";
            }
        }
        else{
            if(reportParamTypeData["lookup"+reportFilterArray[i]]== '0'){
                spParameterString = spParameterString+"'" +inputData[reportFilterArray[i]]+ "',";
            }
            else{
                spParameterString = spParameterString+inputData[reportFilterArray[i]]+ ",";
            }
        }

    }
    //console.log(spParameterString);
    return spParameterString.substring(0, spParameterString.length - 1);
}

/*function getClientOutstandingQuery(spname,filters){
    return "CALL "+spname+"('"+filters.fromDate+"','"+filters.toDate+"',"+filters.officeId+",'"+filters.customerName+"','"+filters.accountNo+"',"+filters.fieldOfficeId+","+filters.productTypeId+","+filters.productCategoryId+","+filters.userId+")";
}

function getBranchWiseOutstandingQuery(spname,filters){
    return "CALL "+spname+"('"+filters.fromDate+"','"+filters.toDate+"',"+filters.officeId+",'"+filters.customerName+"','"+filters.accountNo+"',"+filters.fieldOfficeId+","+filters.productTypeId+","+filters.productCategoryId+","+filters.userId+")";
}

function getInterestRateWiseOutstandingQuery(spname,filters){
    return "CALL "+spname+"('"+filters.fromDate+"','"+filters.toDate+"',"+filters.officeId+",'"+filters.customerName+"','"+filters.accountNo+"',"+filters.fieldOfficeId+","+filters.productTypeId+","+filters.productCategoryId+","+filters.userId+")";
}

function getLoanAmountWiseOutstandingQuery(spname,filters){
    return "CALL "+spname+"('"+filters.fromDate+"','"+filters.toDate+"',"+filters.officeId+",'"+filters.customerName+"','"+filters.accountNo+"',"+filters.fieldOfficeId+","+filters.productTypeId+","+filters.productCategoryId+","+filters.userId+")";
}

function getLoanCycleWiseOutstandingQuery(spname,filters){
    return "CALL "+spname+"('"+filters.fromDate+"','"+filters.toDate+"',"+filters.officeId+",'"+filters.customerName+"','"+filters.accountNo+"',"+filters.fieldOfficeId+","+filters.productTypeId+","+filters.productCategoryId+","+filters.userId+")";
}


function getLoanPurposeWiseOutstandingQuery(spname,filters){
    return "CALL "+spname+"('"+filters.fromDate+"','"+filters.toDate+"',"+filters.officeId+",'"+filters.customerName+"','"+filters.accountNo+"',"+filters.fieldOfficeId+","+filters.productTypeId+","+filters.productCategoryId+","+filters.userId+")";
}

function getLoanSizeWiseOutstandingQuery(spname,filters){
    return "CALL "+spname+"('"+filters.fromDate+"','"+filters.toDate+"',"+filters.officeId+",'"+filters.customerName+"','"+filters.accountNo+"',"+filters.fieldOfficeId+","+filters.productTypeId+","+filters.productCategoryId+","+filters.userId+")";
}


function getStateWiseOutstandingQuery(spname,filters){
    return "CALL "+spname+"('"+filters.fromDate+"','"+filters.toDate+"',"+filters.officeId+",'"+filters.customerName+"','"+filters.accountNo+"',"+filters.fieldOfficeId+","+filters.productTypeId+","+filters.productCategoryId+","+filters.userId+")";
}


function getLoanProductWiseOutstandingQuery(spname,filters){
    return "CALL "+spname+"('"+filters.fromDate+"','"+filters.toDate+"',"+filters.officeId+",'"+filters.customerName+"','"+filters.accountNo+"',"+filters.fieldOfficeId+","+filters.productTypeId+","+filters.productCategoryId+","+filters.userId+")";
}

function getDetailPortfolioQuery(spname,filters){
    return "CALL "+spname+"('"+filters.fromDate+"','"+filters.toDate+"',"+filters.officeId+",'"+filters.customerName+"','"+filters.accountNo+"',"+filters.fieldOfficeId+","+filters.productTypeId+","+filters.productCategoryId+","+filters.userId+")";
}

function getClientDemandQuery(spname,filters){
    return "CALL "+spname+"('"+filters.fromDate+"','"+filters.toDate+"',"+filters.officeId+","+filters.fieldOfficeId+","+filters.productCategoryId+","+filters.productTypeId+",'"+filters.customerName+"','"+filters.accountNo+"',-1,"+filters.userId+")";
}

function getBankReconciliationQuery(spname,filters){
    return "CALL "+spname+"('"+filters.fromDate+"','"+filters.toDate+"',"+filters.glcodeValue+")";
}

function getBranchWisePrincipalOutstandingQuery(spname,filters){
    return "CALL "+spname+"('"+filters.toDate+"',"+filters.officeId+","+filters.fieldOfficeId+","+filters.productCategoryId+","+filters.productTypeId+",'"+filters.customerName+"','"+filters.accountNo+"',"+filters.userId+")";
}

function getGroupPrincipalOutstandingQuery(spname,filters){
    return "CALL "+spname+"('"+filters.toDate+"',"+filters.officeId+","+filters.fieldOfficeId+","+filters.productCategoryId+","+filters.productTypeId+",'"+filters.customerName+"','"+filters.accountNo+"',"+filters.userId+")";
}

*//*function getOverDueBranchWiseSummaryQuery(spname,filters){
    return "CALL "+spname+"('"+filters.toDate+"',"+filters.officeId+","+filters.fieldOfficeId+","+filters.productCategoryId+","+filters.productTypeId+",'"+filters.customerName+"','"+filters.accountNo+"',"+filters.npaIndicator+","+filters.daysInArrears+","+filters.totalODAbove+","+filters.userId+")";
}

function getOverDueDetailedQuery(spname,filters){
    return "CALL "+spname+"('"+filters.toDate+"',"+filters.officeId+","+filters.fieldOfficeId+","+filters.productCategoryId+","+filters.productTypeId+",'"+filters.customerName+"','"+filters.accountNo+"',"+filters.npaIndicator+","+filters.daysInArrears+","+filters.totalODAbove+","+filters.userId+")";
}*//*

function getDisbursementandOutstandingQuery(spname,filters){
    return "CALL "+spname+"('"+filters.fromDate+"','"+filters.toDate+"',"+filters.officeId+","+filters.userId+")";
}

function getGroupMembersPersonalDetailsQuery(spname,filters){
    return "CALL "+spname+"("+filters.officeId+","+filters.loanStatus+")";
}

function getPrincipalOutstandingQuery(spname,filters){
    return "CALL "+spname+"('"+filters.toDate+"',"+filters.officeId+","+filters.userId+")";
}

function getNPAandGPLDifferenceQuery(spname,filters){
    return "CALL "+spname+"('"+filters.toDate+"',"+filters.officeId+","+filters.userId+")";
}

function getFundBookDebtQuery(spname,filters){
    return "CALL "+spname+"('"+filters.toDate+"',"+filters.loanStatus+")";
}

function getLDCallTrackingQuery(spname,filters){
    return "CALL "+spname+"('"+filters.fromDate+" 00:00:00','"+filters.toDate+" 23:59:59',"+filters.officeId+")";
}

function getCreditQuery(spname,filters){
    return "CALL "+spname+"('"+filters.toDate+"')";
}

function getKYCVerificationFailedRequestQuery(spname,filters){
    return "CALL "+spname+"('"+filters.fromDate+"','"+filters.toDate+"',"+filters.officeId+")";
}

function getFOPerformanceTrackForHoldImageQuery(spname,filters){
    return "CALL "+spname+"('"+filters.fromDate+"','"+filters.toDate+"',"+filters.officeId+","+filters.fieldOfficeId+")";
}

function getGroupLoanCollectionQuery(spname,filters){
    return "CALL "+spname+"('"+filters.fromDate+"','"+filters.toDate+"',"+filters.officeId+","+filters.fieldOfficeId+","+filters.productTypeId+","+filters.productCategoryId+","+filters.userId+")";
}

function getGroupLoanDisbursalQuery(spname,filters){
    return "CALL "+spname+"('"+filters.fromDate+"','"+filters.toDate+"',"+filters.officeId+","+filters.fieldOfficeId+","+filters.productTypeId+","+filters.productCategoryId+","+filters.userId+")";
}

function getGroupLoanOverdueQuery(spname,filters){
    return "CALL "+spname+"('"+filters.toDate+"',"+filters.officeId+",'"+filters.customerName+"','"+filters.accountNo+"',"+filters.npaIndicator+","+filters.productCategoryId+","+filters.productTypeId+",'All',"+filters.daysInArrears+","+filters.totalODAbove+","+filters.fieldOfficeId+","+filters.userId+")";
}

function getGroupDemandQuery(spname,filters){
    return "CALL "+spname+"('"+filters.fromDate+"','"+filters.toDate+"',"+filters.officeId+","+filters.fieldOfficeId+","+filters.productCategoryId+","+filters.productTypeId+",'"+filters.customerName+"','"+filters.accountNo+"',"+filters.userId+")";
}


function getPARGroupQuery(spname,filters){
    return "CALL "+spname+"('"+filters.toDate+"',"+filters.officeId+","+filters.daysInArrears+","+filters.userId+")";
}

function getPARClientQuery(spname,filters){
    return "CALL "+spname+"('"+filters.toDate+"',"+filters.officeId+","+filters.daysInArrears+","+filters.userId+")";
}

function getInsuranceCoverQuery(spname,filters){
    return "CALL "+spname+"('"+filters.fromDate+"','"+filters.toDate+"',"+filters.officeId+","+filters.userId+")";
}

function getDEOActivityQuery(spname,filters){
    return "CALL "+spname+"('"+filters.fromDate+"','"+filters.toDate+"',"+filters.officeId+",'"+filters.customerName+"',"+filters.userId+")";
}

function getGroupsinVariousStagesQuery(spname,filters){
    return "CALL "+spname+"('"+filters.fromDate+"','"+filters.toDate+"',"+filters.officeId+",-1,"+filters.userId+")";
}

function getActiveGroupsandMembersQuery(spname,filters){
    return "CALL "+spname+"('"+filters.fromDate+"','"+filters.toDate+"',"+filters.officeId+","+filters.userId+")";
}


function getGroupsInVariousStagesDataEntryQuery(spname,filters){
    return "CALL "+spname+"("+filters.officeId+")";
}*/
module.exports = reportQueries;