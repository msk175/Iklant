module.exports = NPAGroupSummaryHolder;

var npaThreshold;
var column;
var officeFilterId;
var prdCategoryFilterId;
var personnelFilterId;
var accountTypeId;
var date;
var limit;
var recurrenceType;
var loanStatus;

var globalAccountNum;
var customer;
var office;
var personnel;
var originalPrincipal;
var actualPrincipalDemanded;
var actualPrincipalPaid;
var actualPrincipalOverdue;
var daysInArrears;
var daysInArrearsMaxRange;

var actualPrincipalOutstanding;

function NPAGroupSummaryHolder() {	
   //this.clearAll();
}   					

NPAGroupSummaryHolder.prototype = {
	getNpaThreshold : function() {
		return this.npaThreshold;
	},
	setNpaThreshold : function(t_npaThreshold) {
		this.npaThreshold = t_npaThreshold;
	},
	getColumn : function() {
		return this.column;
	},
	setColumn : function(t_column) {
		this.column = t_column;
	},
	getofficeFilterId : function() {
		return this.officeFilterId;
	},
	setofficeFilterId : function(t_officeFilterId) {
		this.officeFilterId = t_officeFilterId;
	},
	getPrdCategoryFilterId : function() {
		return this.prdCategoryFilterId;
	},
	setPrdCategoryFilterId : function(t_prdCategoryFilterId) {
		this.prdCategoryFilterId = t_prdCategoryFilterId;
	},
	getPersonnelFilterId : function() {
		return this.personnelFilterId;
	},
	setPersonnelFilterId : function(t_personnelFilterId) {
		this.personnelFilterId = t_personnelFilterId;
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
	
	getGlobalAccountNum : function() {
		return this.globalAccountNum;
	},
	setGlobalAccountNum : function(t_globalAccountNum) {
		this.globalAccountNum = t_globalAccountNum;
	},
	getCustomer : function() {
		return this.customer;
	},
	setCustomer : function(t_customer) {
		this.customer = t_customer;
	},
	getOffice : function() {
		return this.office;
	},
	setOffice : function(t_office) {
		this.office = t_office;
	},
	getPersonnel : function() {
		return this.personnel;
	},
	setPersonnel : function(t_personnel) {
		this.personnel = t_personnel;
	},
	getOriginalPrincipal : function() {
		return this.originalPrincipal;
	},
	setOriginalPrincipal : function(t_originalPrincipal) {
		this.originalPrincipal = t_originalPrincipal;
	},
	getActualPrincipalDemanded : function() {
		return this.actualPrincipalDemanded;
	},
	setActualPrincipalDemanded : function(t_actualPrincipalDemanded) {
		this.actualPrincipalDemanded = t_actualPrincipalDemanded;
	},
	getActualPrincipalPaid : function() {
		return this.actualPrincipalPaid;
	},
	setActualPrincipalPaid : function(t_actualPrincipalPaid) {
		this.actualPrincipalPaid = t_actualPrincipalPaid;
	},
	getActualPrincipalOverdue : function() {
		return this.actualPrincipalOverdue;
	},
	setActualPrincipalOverdue : function(t_actualPrincipalOverdue) {
		this.actualPrincipalOverdue = t_actualPrincipalOverdue;
	}, 
	getdaysInArrears : function() {
		return this.daysInArrears;
	},
	setdaysInArrears : function(t_daysInArrears) {
		this.daysInArrears = t_daysInArrears;
	},
	getDaysInArrearsMaxRange : function() {
		return this.daysInArrearsMaxRange;
	},
	setDaysInArrearsMaxRange : function(t_daysInArrearsMaxRange) {
		this.daysInArrearsMaxRange = t_daysInArrearsMaxRange;
	},
	getActualPrincipalOutstanding : function() {
		return this.actualPrincipalOutstanding;
	},
	setActualPrincipalOutstanding : function(t_actualPrincipalOutstanding) {
		this.actualPrincipalOutstanding = t_actualPrincipalOutstanding;
	},
    clearAll: function(){
        this.setNpaThreshold("");
        this.setColumn("");
        this.setofficeFilterId("");
        this.setPrdCategoryFilterId("");
        this.setPersonnelFilterId("");
        this.setAccountTypeId("");
        this.setRecurrenceType("");
        this.setLimit("");
        this.setLoanStatus("");
        this.setDate("");
        this.setGlobalAccountNum("");
        this.setCustomer("");
        this.setOffice("");
        this.setPersonnel("");
        this.setOriginalPrincipal("");
        this.setActualPrincipalDemanded("");
        this.setActualPrincipalPaid("");
        this.setActualPrincipalOverdue("");
        this.setdaysInArrears("");
        this.setDaysInArrearsMaxRange("");
        this.setActualPrincipalOutstanding("");
    }
};
