module.exports = ReportHolder;

function ReportHolder() {	
  //this.clearAll();
}

var startDate;
var startDateStr;
var endDate;
var endDateStr;
var officeId;
var categoryId;
var loanOfficerId;
var offices = new Array();
var prdCategories = new Array();
var loanOfficers = new Array();

ReportHolder.prototype = {

	getStartDate: function(){
		return this.startDate;
	},
	
	setStartDate: function (t_startDate){
		this.startDate = t_startDate;
	},
	
	getStartDateStr: function(){
		return this.startDateStr;
	},
	
	setStartDateStr: function (t_startDateStr){
		this.startDateStr = t_startDateStr;
	},
	getEndDate: function(){
		return this.endDate;
	},
	
	setEndDate: function (t_endDate){
		this.endDate = t_endDate;
	},
	getEndDateStr: function(){
		return this.endDateStr;
	},
	setEndDateStr: function (t_endDateStr){
		this.endDateStr = t_endDateStr;
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

    clearAll: function(){
        this.setStartDate("");
        this.setStartDateStr("");
        this.setEndDate("");
        this.setEndDateStr("");
        this.setOfficeId("");
        this.setCategoryId("");
        this.setLoanOfficerId("");
        this.setOffices(new Array());
        this.setPrdCategories(new Array());
        this.setLoanOfficers(new Array());
    }

}
	