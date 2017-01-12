module.exports = PortfolioDto;

function PortfolioDto() {	
    //this.clearAll();
}

var interestRateId;
var interestRateName;
var loanAmountId;
var loanAmountName;
var loanCategoryId;
var loanCategoryName;
var loanCycleId;
var loanCycleName;
var loanProductId;
var loanProductName;
var loanPurposeId;
var loanPurposeName;
var loanSizeId;
var loanSizeName;
var officeId;
var officeName;
var stateId;
var stateName;

PortfolioDto.prototype = {

	getInterestRateId: function(){
		return this.interestRateId;
	},
	
	setInterestRateId: function (t_interestRateId){
		this.interestRateId = t_interestRateId;
	},

	getInterestRateName: function(){
		return this.interestRateName;
	},
	
	setInterestRateName: function (t_interestRateName){
		this.interestRateName = t_interestRateName;
	},

	getLoanAmountId: function(){
		return this.loanAmountId;
	},
	
	setLoanAmountId: function (t_loanAmountId){
		this.loanAmountId = t_loanAmountId;
	},

	getLoanAmountName: function(){
		return this.loanAmountName;
	},
	
	setLoanAmountName: function (t_loanAmountName){
		this.loanAmountName = t_loanAmountName;
	},

	getLoanCategoryId: function(){
		return this.loanCategoryId;
	},
	
	setLoanCategoryId: function (t_loanCategoryId){
		this.loanCategoryId = t_loanCategoryId;
	},

	getLoanCategoryName: function(){
		return this.loanCategoryName;
	},
	
	setLoanCategoryName: function (t_loanCategoryName){
		this.loanCategoryName = t_loanCategoryName;
	},

	getLoanCycleId: function(){
		return this.loanCycleId;
	},
	
	setLoanCycleId: function (t_loanCycleId){
		this.loanCycleId = t_loanCycleId;
	},

	getLoanCycleName: function(){
		return this.loanCycleName;
	},
	
	setLoanCycleName: function (t_loanCycleName){
		this.loanCycleName = t_loanCycleName;
	},

	getLoanProductId: function(){
		return this.loanProductId;
	},
	
	setLoanProductId: function (t_loanProductId){
		this.loanProductId = t_loanProductId;
	},

	getLoanProductName: function(){
		return this.loanProductName;
	},
	
	setLoanProductName: function (t_loanProductName){
		this.loanProductName = t_loanProductName;
	},

	getLoanPurposeId: function(){
		return this.loanPurposeId;
	},
	
	setLoanPurposeId: function (t_loanPurposeId){
		this.loanPurposeId = t_loanPurposeId;
	},

	getLoanPurposeName: function(){
		return this.loanPurposeName;
	},
	
	setLoanPurposeName: function (t_loanPurposeName){
		this.loanPurposeName = t_loanPurposeName;
	},

	getLoanSizeId: function(){
		return this.loanSizeId;
	},
	
	setLoanSizeId: function (t_loanSizeId){
		this.loanSizeId = t_loanSizeId;
	},

	getLoanSizeName: function(){
		return this.loanSizeName;
	},
	
	setLoanSizeName: function (t_loanSizeName){
		this.loanSizeName = t_loanSizeName;
	},

	getOfficeId: function(){
		return this.officeId;
	},
	
	setOfficeId: function (t_officeId){
		this.officeId = t_officeId;
	},

	getOfficeName: function(){
		return this.officeName;
	},
	
	setOfficeName: function (t_officeName){
		this.officeName = t_officeName;
	},

	getStateId: function(){
		return this.stateId;
	},
	
	setStateId: function (t_stateId){
		this.stateId = t_stateId;
	},

	getStateName: function(){
		return this.stateName;
	},
	
	setStateName: function (t_stateName){
		this.stateName = t_stateName;
	},

    clearAll: function(){
        this.setInterestRateId("");
        this.setInterestRateName("");
        this.setLoanAmountId("");
        this.setLoanAmountName("");
        this.setLoanCategoryId("");
        this.setLoanCategoryName("");
        this.setLoanCycleId("");
        this.setLoanCycleName("");
        this.setLoanProductId("");
        this.setLoanProductName("");
        this.setLoanPurposeId("");
        this.setLoanPurposeName("");
        this.setLoanSizeId("");
        this.setLoanSizeName("");
        this.setOfficeId("");
        this.setOfficeName("");
        this.setStateId("");
        this.setStateName("");
    }

}