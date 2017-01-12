module.exports = NPAHolder;

var officeId; 
var prdCategoryId;
var personnelId;
var accountTypeId;

var limit;
var recurrenceType;

var loanStatus;
var date;
var bcOfficeId;

var principalOverdueOpenLoans; 			
var npaPrincipalOutstandingOpenLoans; 	
var totalPrincipalOutstandingOpenLoans; 	
var avgNpaPrincipalOutstandingOpenLoans; 	
var npaPrincipalOutstandingOpenLoansRatio;
var parOpenLoansRatio;

var principalOverdueClosedLoans; 				 					
var	npaPrincipalOutstandingClosedLoans; 						
var	totalPrincipalOutstandingClosedLoans; 					
var	avgNpaPrincipalOutstandingClosedLoans; 					
var	npaPrincipalOutstandingClosedLoansRatio; 					
var	parClosedLoansRatio;

var principalOverdueAllLoans; 													
var npaPrincipalOutstandingAllLoans; 												
var totalPrincipalOutstandingAllLoans; 											
var avgNpaPrincipalOutstandingAllLoans; 											
var npaPrincipalOutstandingAllLoansRatio; 										
var parAllLoansRatio; 	

var npaPrincipalOutstandingAllLoansRbi;
var npaPrincipalOutstandingAllLoansRatioRbi;				
    
var noOfNpaOpenLoans; 															
var totalNoOfOpenLoans; 															
var  npaOpenLoansRatio; 					
    
var noOfNpaClosedLoans; 															
var totalNoOfClosedLoans;														
var npaClosedLoansRatio;														
    
var noOfNpaAllLoans; 	
var totalNoOfAllLoans; 	
var npaAllLoansRatio; 


	
/* For Chart Purpose*/
var chartNPAPOS = new Array();
var chartNoOfLoans = new Array();
var chartNPAPOSPerc = new Array();
var chartOverdue = new Array();
var chartNoOfLoansPercentage = new Array();

	
function NPAHolder() {	
   //this.clearAll();
}   					

NPAHolder.prototype = {

	getOfficeId : function() {
		return this.officeId;
	},
	setOfficeId : function(t_officeId) {
		this.officeId = t_officeId;
	},
	getPrdCategoryId : function() {
		return this.prdCategoryId;
	},
	setPrdCategoryId : function(t_prdCategoryId) {
		this.prdCategoryId = t_prdCategoryId;
	},
	getPersonnelId : function() {
		return this.personnelId;
	},
	setPersonnelId : function(t_personnelId) {
		this.personnelId = t_personnelId;
	},
	getAccountTypeId : function() {
		return this.accountTypeId;
	},
    setAccountTypeId : function(t_accountTypeId) {
        this.accountTypeId = t_accountTypeId;
    },
	getRecurrenceType : function() {
		return this.recurrenceType;
	},
	setRecurrenceType : function(t_recurrenceType) {
		this.recurrenceType = t_recurrenceType;
	},
	getLimit : function() {
		return this.limit;
	},
	setLimit : function(t_limit) {
		this.limit = t_limit;
	},
	getLoanStatus : function() {
		return this.loanStatus;
	},
	setLoanStatus : function(t_loanStatus) {
		this.loanStatus = t_loanStatus;
	},
	getDate : function() {
		return this.date;
	},
	setDate : function(t_date) {
		this.date = t_date;
	},
	getPrincipalOverdueOpenLoans : function() {
		return this.principalOverdueOpenLoans;
	},
	setPrincipalOverdueOpenLoans : function(t_principalOverdueOpenLoans) {
		this.principalOverdueOpenLoans = t_principalOverdueOpenLoans;
	},
	getNpaPrincipalOutstandingOpenLoans : function() {
		return this.npaPrincipalOutstandingOpenLoans;
	},
	setNpaPrincipalOutstandingOpenLoans : function(t_npaPrincipalOutstandingOpenLoans) {
		this.npaPrincipalOutstandingOpenLoans = t_npaPrincipalOutstandingOpenLoans;
	},
	getTotalPrincipalOutstandingOpenLoans : function() {
		return this.totalPrincipalOutstandingOpenLoans;
	},
	setTotalPrincipalOutstandingOpenLoans : function(t_totalPrincipalOutstandingOpenLoans) {
		this.totalPrincipalOutstandingOpenLoans = t_totalPrincipalOutstandingOpenLoans;
	},
	getAvgNpaPrincipalOutstandingOpenLoans : function() {
		return this.avgNpaPrincipalOutstandingOpenLoans;
	},
	setAvgNpaPrincipalOutstandingOpenLoans : function(t_avgNpaPrincipalOutstandingOpenLoans) {
		this.avgNpaPrincipalOutstandingOpenLoans = t_avgNpaPrincipalOutstandingOpenLoans;
	},
	getNpaPrincipalOutstandingOpenLoansRatio : function() {
		return this.npaPrincipalOutstandingOpenLoansRatio;
	},
	setNpaPrincipalOutstandingOpenLoansRatio : function(t_npaPrincipalOutstandingOpenLoansRatio) {
		this.npaPrincipalOutstandingOpenLoansRatio = t_npaPrincipalOutstandingOpenLoansRatio;
	},
	getParOpenLoansRatio : function() {
		return this.parOpenLoansRatio;
	},
	setParOpenLoansRatio : function(t_parOpenLoansRatio) {
		this.parOpenLoansRatio = t_parOpenLoansRatio;
	},
	getPrincipalOverdueClosedLoans : function() {
		return this.principalOverdueClosedLoans;
	},
	setPrincipalOverdueClosedLoans : function(t_principalOverdueClosedLoans) {
		this.principalOverdueClosedLoans = t_principalOverdueClosedLoans;
	},
	getNpaPrincipalOutstandingClosedLoans : function() {
		return this.npaPrincipalOutstandingClosedLoans;
	},
	setNpaPrincipalOutstandingClosedLoans : function(t_npaPrincipalOutstandingClosedLoans) {
		this.npaPrincipalOutstandingClosedLoans = t_npaPrincipalOutstandingClosedLoans;
	},
	getTotalPrincipalOutstandingClosedLoans : function() {
		return this.totalPrincipalOutstandingClosedLoans;
	},
	setTotalPrincipalOutstandingClosedLoans : function(t_totalPrincipalOutstandingClosedLoans) {
		this.totalPrincipalOutstandingClosedLoans = t_totalPrincipalOutstandingClosedLoans;
	},
	getAvgNpaPrincipalOutstandingClosedLoans : function() {
		return this.avgNpaPrincipalOutstandingClosedLoans;
	},
	setAvgNpaPrincipalOutstandingClosedLoans : function(t_avgNpaPrincipalOutstandingClosedLoans) {
		this.avgNpaPrincipalOutstandingClosedLoans = t_avgNpaPrincipalOutstandingClosedLoans;
	},
	getNpaPrincipalOutstandingClosedLoansRatio : function() {
		return this.npaPrincipalOutstandingClosedLoansRatio;
	},
	setNpaPrincipalOutstandingClosedLoansRatio : function(t_npaPrincipalOutstandingClosedLoansRatio) {
		this.npaPrincipalOutstandingClosedLoansRatio = t_npaPrincipalOutstandingClosedLoansRatio;
	},
	getParClosedLoansRatio : function() {
		return this.parClosedLoansRatio;
	},
	setParClosedLoansRatio : function(t_parClosedLoansRatio) {
		this.parClosedLoansRatio = t_parClosedLoansRatio;
	},
	getPrincipalOverdueAllLoans : function() {
		return this.principalOverdueAllLoans;
	},
	setPrincipalOverdueAllLoans : function(t_principalOverdueAllLoans) {
		this.principalOverdueAllLoans = t_principalOverdueAllLoans;
	},
	getNpaPrincipalOutstandingAllLoans : function() {
		return this.npaPrincipalOutstandingAllLoans;
	},
	setNpaPrincipalOutstandingAllLoans : function(t_npaPrincipalOutstandingAllLoans) {
		this.npaPrincipalOutstandingAllLoans = t_npaPrincipalOutstandingAllLoans;
	},
	getTotalPrincipalOutstandingAllLoans : function() {
		return this.totalPrincipalOutstandingAllLoans;
	},
	setTotalPrincipalOutstandingAllLoans : function(t_totalPrincipalOutstandingAllLoans) {
		this.totalPrincipalOutstandingAllLoans = t_totalPrincipalOutstandingAllLoans;
	},
	getAvgNpaPrincipalOutstandingAllLoans : function() {
		return this.avgNpaPrincipalOutstandingAllLoans;
	},
	setAvgNpaPrincipalOutstandingAllLoans : function(t_avgNpaPrincipalOutstandingAllLoans) {
		this.avgNpaPrincipalOutstandingAllLoans = t_avgNpaPrincipalOutstandingAllLoans;
	},
	getNpaPrincipalOutstandingAllLoansRatio : function() {
		return this.npaPrincipalOutstandingAllLoansRatio;
	},
	setNpaPrincipalOutstandingAllLoansRatio : function(t_npaPrincipalOutstandingAllLoansRatio) {
		this.npaPrincipalOutstandingAllLoansRatio = t_npaPrincipalOutstandingAllLoansRatio;
	},
	getParAllLoansRatio : function() {
		return this.parAllLoansRatio;
	},
	setParAllLoansRatio : function(t_parAllLoansRatio) {
		this.parAllLoansRatio = t_parAllLoansRatio;
	},
	getNpaPrincipalOutstandingAllLoansRbi : function() {
		return this.npaPrincipalOutstandingAllLoansRbi;
	},
	setNpaPrincipalOutstandingAllLoansRbi : function(t_npaPrincipalOutstandingAllLoansRbi) {
		this.npaPrincipalOutstandingAllLoansRbi = t_npaPrincipalOutstandingAllLoansRbi;
	},
	getNpaPrincipalOutstandingAllLoansRatioRbi : function() {
		return this.npaPrincipalOutstandingAllLoansRatioRbi;
	},
	setNpaPrincipalOutstandingAllLoansRatioRbi : function(t_npaPrincipalOutstandingAllLoansRatioRbi) {
		this.npaPrincipalOutstandingAllLoansRatioRbi = t_npaPrincipalOutstandingAllLoansRatioRbi;
	},
	getNoOfNpaOpenLoans : function() {
		return this.noOfNpaOpenLoans;
	},
	setNoOfNpaOpenLoans : function(t_noOfNpaOpenLoans) {
		this.noOfNpaOpenLoans = t_noOfNpaOpenLoans;
	},
	getTotalNoOfOpenLoans : function() {
		return this.totalNoOfOpenLoans;
	},
	setTotalNoOfOpenLoans : function(t_totalNoOfOpenLoans) {
		this.totalNoOfOpenLoans = t_totalNoOfOpenLoans;
	},
	getNpaOpenLoansRatio : function() {
		return this.npaOpenLoansRatio;
	},
	setNpaOpenLoansRatio : function(t_npaOpenLoansRatio) {
		this.npaOpenLoansRatio = t_npaOpenLoansRatio;
	},
	getNoOfNpaClosedLoans : function() {
		return this.noOfNpaClosedLoans;
	},
	setNoOfNpaClosedLoans : function(t_noOfNpaClosedLoans) {
		this.noOfNpaClosedLoans = t_noOfNpaClosedLoans;
	},
	getTotalNoOfClosedLoans : function() {
		return this.totalNoOfClosedLoans;
	},
	setTotalNoOfClosedLoans : function(t_totalNoOfClosedLoans) {
		this.totalNoOfClosedLoans = t_totalNoOfClosedLoans;
	},
	getNpaClosedLoansRatio : function() {
		return this.npaClosedLoansRatio;
	},
	setNpaClosedLoansRatio : function(t_npaClosedLoansRatio) {
		this.npaClosedLoansRatio = t_npaClosedLoansRatio;
	},
	getNoOfNpaAllLoans : function() {
		return this.noOfNpaAllLoans;
	},
	setNoOfNpaAllLoans : function(t_noOfNpaAllLoans) {
		this.noOfNpaAllLoans = t_noOfNpaAllLoans;
	},
	getTotalNoOfAllLoans : function() {
		return this.totalNoOfAllLoans;
	},
	setTotalNoOfAllLoans : function(t_totalNoOfAllLoans) {
		this.totalNoOfAllLoans = t_totalNoOfAllLoans;
	},  
	getNpaAllLoansRatio : function() {
		return this.npaAllLoansRatio;
	},
	setNpaAllLoansRatio : function(t_npaAllLoansRatio) {
		this.npaAllLoansRatio = t_npaAllLoansRatio;
	}, 
	getChartNPAPOS : function() {
		return this.chartNPAPOS;
	},
	setChartNPAPOS : function(t_chartNPAPOS) {
		this.chartNPAPOS = t_chartNPAPOS;
	},
	getChartNoOfLoans : function() {
		return this.chartNoOfLoans;
	},
	setChartNoOfLoans : function(t_chartNoOfLoans) {
		this.chartNoOfLoans = t_chartNoOfLoans;
	},
	getChartNPAPOSPerc : function() {
		return this.chartNPAPOSPerc;
	},
	setChartNPAPOSPerc : function(t_chartNPAPOSPerc) {
		this.chartNPAPOSPerc = t_chartNPAPOSPerc;
	},
	getChartOverdue : function() {
		return this.chartOverdue;
	},
	setChartOverdue : function(t_chartOverdue) {
		this.chartOverdue = t_chartOverdue;
	},
	getChartNoOfLoansPercentage : function() {
		return this.chartNoOfLoansPercentage;
	},
	setChartNoOfLoansPercentage : function(t_chartNoOfLoansPercentage) {
		this.chartNoOfLoansPercentage = t_chartNoOfLoansPercentage;
	},
	getBcOfficeId : function() {
		return this.bcOfficeId;
	},
	setBcOfficeId : function(t_bcOfficeId) {
		this.bcOfficeId = t_bcOfficeId;
	},
	clearAll : function(){
        this.setOfficeId("");
        this.setPrdCategoryId("");
        this.setPersonnelId("");
        this.setAccountTypeId("");
        this.setRecurrenceType("");
        this.setLimit("");
        this.setLoanStatus("");
        this.setDate("");
        this.setPrincipalOverdueOpenLoans("");
        this.setNpaPrincipalOutstandingOpenLoans("");
        this.setTotalPrincipalOutstandingOpenLoans("");
        this.setAvgNpaPrincipalOutstandingOpenLoans("");
        this.setNpaPrincipalOutstandingOpenLoansRatio("");
        this.setParOpenLoansRatio("");
        this.setPrincipalOverdueClosedLoans("");
        this.setNpaPrincipalOutstandingClosedLoans("");
        this.setTotalPrincipalOutstandingClosedLoans("");
        this.setAvgNpaPrincipalOutstandingClosedLoans("");
        this.setNpaPrincipalOutstandingClosedLoansRatio("");
        this.setParClosedLoansRatio("");
        this.setPrincipalOverdueAllLoans("");
        this.setNpaPrincipalOutstandingAllLoans("");
        this.setTotalPrincipalOutstandingAllLoans("");
        this.setAvgNpaPrincipalOutstandingAllLoans("");
        this.setNpaPrincipalOutstandingAllLoansRatio("");
        this.setParAllLoansRatio("");
        this.setNpaPrincipalOutstandingAllLoansRbi("");
        this.setNpaPrincipalOutstandingAllLoansRatioRbi("");
        this.setNoOfNpaOpenLoans("");
        this.setTotalNoOfOpenLoans("");
        this.setNpaOpenLoansRatio("");
        this.setNoOfNpaClosedLoans("");
        this.setTotalNoOfClosedLoans("");
        this.setNpaClosedLoansRatio("");
        this.setNoOfNpaAllLoans("");
        this.setTotalNoOfAllLoans("");
        this.setNpaAllLoansRatio("");
        this.setChartNPAPOS(new Array());
        this.setChartNoOfLoans(new Array());
        this.setChartNPAPOSPerc(new Array());
        this.setChartOverdue(new Array());
        this.setChartNoOfLoansPercentage(new Array());
		this.setBcOfficeId("");
    }
};

				
