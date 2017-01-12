module.exports = LoanOutstandingHolder;

function LoanOutstandingHolder() {	
   //this.clearAll();
}

var startDate;
var endDate;
var officeId;
var categoryId;
var loanOfficerId;
var offices = new Array();
var prdCategories = new Array();
var loanOfficers = new Array();
var interestRateId;
var loanAmountId;
var loanCategoryId;
var loanCycleId;
var loanProductId;
var loanPurposeId;
var loanSizeId;
var stateId;
var interestRates = new Array();
var loanAmounts = new Array();
var loanCategories = new Array();
var loanCycles = new Array();
var loanProducts = new Array();
var loanPurposes = new Array();
var loanSizes = new Array();
var states = new Array();

LoanOutstandingHolder.prototype = {

	getStartDate: function(){
		return this.startDate;
	},
	
	setStartDate: function (t_startDate){
		this.startDate = t_startDate;
	},

	getEndDate: function(){
		return this.endDate;
	},
	
	setEndDate: function (t_endDate){
		this.endDate = t_endDate;
	},

	getOfficeId: function(){
		return this.officeId;
	},
	
	setOfficeId: function (t_officeId){
		this.officeId = t_officeId;
	},

	getCategoryId: function(){
		return this.categoryId;
	},
	
	setCategoryId: function (t_categoryId){
		this.categoryId = t_categoryId;
	},

	getLoanOfficerId: function(){
		return this.loanOfficerId;
	},
	
	setLoanOfficerId: function (t_loanOfficerId){
		this.loanOfficerId = t_loanOfficerId;
	},

	getOffices: function(){
		return this.offices;
	},
	
	setOffices: function (t_offices){
		this.offices = t_offices;
	},

	getPrdCategories: function(){
		return this.prdCategories;
	},
	
	setPrdCategories: function (t_prdCategories){
		this.prdCategories = t_prdCategories;
	},

	getLoanOfficers: function(){
		return this.loanOfficers;
	},
	
	setLoanOfficers: function (t_loanOfficers){
		this.loanOfficers = t_loanOfficers;
	},

	getInterestRateId: function(){
		return this.interestRateId;
	},
	
	setInterestRateId: function (t_interestRateId){
		this.interestRateId = t_interestRateId;
	},

	getLoanAmountId: function(){
		return this.loanAmountId;
	},
	
	setLoanAmountId: function (t_loanAmountId){
		this.loanAmountId = t_loanAmountId;
	},

	getLoanCategoryId: function(){
		return this.loanCategoryId;
	},
	
	setLoanCategoryId: function (t_loanCategoryId){
		this.loanCategoryId = t_loanCategoryId;
	},

	getLoanCycleId: function(){
		return this.loanCycleId;
	},
	
	setLoanCycleId: function (t_loanCycleId){
		this.loanCycleId = t_loanCycleId;
	},

	getLoanProductId: function(){
		return this.loanProductId;
	},
	
	setLoanProductId: function (t_loanProductId){
		this.loanProductId = t_loanProductId;
	},

	getLoanPurposeId: function(){
		return this.loanPurposeId;
	},
	
	setLoanPurposeId: function (t_loanPurposeId){
		this.loanPurposeId = t_loanPurposeId;
	},

	getLoanSizeId: function(){
		return this.loanSizeId;
	},
	
	setLoanSizeId: function (t_loanSizeId){
		this.loanSizeId = t_loanSizeId;
	},

	getStateId: function(){
		return this.stateId;
	},
	
	setStateId: function (t_stateId){
		this.stateId = t_stateId;
	},

	getInterestRates: function(){
		return this.interestRates;
	},
	
	setInterestRates: function (t_interestRates){
		this.interestRates = t_interestRates;
	},

	getLoanAmounts: function(){
		return this.loanAmounts;
	},
	
	setLoanAmounts: function (t_loanAmounts){
		this.loanAmounts = t_loanAmounts;
	},

	getLoanCategories: function(){
		return this.loanCategories;
	},
	
	setLoanCategories: function (t_loanCategories){
		this.loanCategories = t_loanCategories;
	},

	getLoanCycles: function(){
		return this.loanCycles;
	},
	
	setLoanCycles: function (t_loanCycles){
		this.loanCycles = t_loanCycles;
	},

	getLoanProducts: function(){
		return this.loanProducts;
	},
	
	setLoanProducts: function (t_loanProducts){
		this.loanProducts = t_loanProducts;
	},

	getLoanPurposes: function(){
		return this.loanPurposes;
	},
	
	setLoanPurposes: function (t_loanPurposes){
		this.loanPurposes = t_loanPurposes;
	},

	getLoanSizes: function(){
		return this.loanSizes;
	},
	
	setLoanSizes: function (t_loanSizes){
		this.loanSizes = t_loanSizes;
	},

	getStates: function(){
		return this.states;
	},
	
	setStates: function (t_states){
		this.states = t_states;
	},

    clearAll: function(){
        this.setStartDate("");
        this.setEndDate("");
        this.setOfficeId("");
        this.setCategoryId("");
        this.setLoanOfficerId("");
        this.setOffices(new Array());
        this.setPrdCategories(new Array());
        this.setLoanOfficers(new Array());
        this.setInterestRateId("");
        this.setLoanAmountId("");
        this.setLoanCategoryId("");
        this.setLoanCycleId("");
        this.setLoanProductId("");
        this.setLoanPurposeId("");
        this.setStateId("");
        this.setInterestRates(new Array());
        this.setLoanAmounts(new Array());
        this.setLoanCategories(new Array());
        this.setLoanCycles(new Array());
        this.setLoanProducts(new Array());
        this.setLoanPurposes(new Array());
        this.setLoanSizes(new Array());
        this.setStates(new Array());
    }
}