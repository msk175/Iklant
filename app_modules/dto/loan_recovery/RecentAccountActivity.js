RecentAccountActivity
module.exports = RecentAccountActivity;

function RecentAccountActivity() {	
   //this.clearAll();
}

var id = new Array();
var actionDate = new Array();
var activity = new Array();
var principal = new Array();
var interest = new Array();
var fees = new Array();
var penalty = new Array();
var total = new Array();
var runningBalancePrinciple = new Array();
var runningBalanceInterest = new Array();
var runningBalanceFees = new Array();
var runningBalancePenalty = new Array();
var locale = new Array();
var timeStamp = new Array();
var runningBalancePrincipleWithInterestAndFees = new Array();
var totalValue = new Array();
var userPrefferedDate = new Array();

RecentAccountActivity.prototype = {

	getId: function(){
		return this.id;
	},
	
	setId: function (t_id){
		this.id = t_id;
	},

	getActionDate: function(){
		return this.actionDate;
	},
	
	setActionDate: function (t_actionDate){
		this.actionDate = t_actionDate;
	},

	getActivity: function(){
		return this.activity;
	},
	
	setActivity: function (t_activity){
		this.activity = t_activity;
	},

	getPrincipal: function(){
		return this.principal;
	},
	
	setPrincipal: function (t_principal){
		this.principal = t_principal;
	},

	getInterest: function(){
		return this.interest;
	},
	
	setInterest: function (t_interest){
		this.interest = t_interest;
	},

	getFees: function(){
		return this.fees;
	},
	
	setFees: function (t_fees){
		this.fees = t_fees;
	},

	getPenalty: function(){
		return this.penalty;
	},
	
	setPenalty: function (t_penalty){
		this.penalty = t_penalty;
	},

	getTotal: function(){
		return this.total;
	},
	
	setTotal: function (t_total){
		this.total = t_total;
	},

	getRunningBalancePrinciple: function(){
		return this.runningBalancePrinciple;
	},
	
	setRunningBalancePrinciple: function (t_runningBalancePrinciple){
		this.runningBalancePrinciple = t_runningBalancePrinciple;
	},

	getRunningBalanceInterest: function(){
		return this.runningBalanceInterest;
	},
	
	setRunningBalanceInterest: function (t_runningBalanceInterest){
		this.runningBalanceInterest = t_runningBalanceInterest;
	},

	getRunningBalanceFees: function(){
		return this.runningBalanceFees;
	},
	
	setRunningBalanceFees: function (t_runningBalanceFees){
		this.runningBalanceFees = t_runningBalanceFees;
	},

	getRunningBalancePenalty: function(){
		return this.runningBalancePenalty;
	},
	
	setRunningBalancePenalty: function (t_runningBalancePenalty){
		this.runningBalancePenalty = t_runningBalancePenalty;
	},

	getLocale: function(){
		return this.locale;
	},
	
	setLocale: function (t_locale){
		this.locale = t_locale;
	},

	getTimeStamp: function(){
		return this.timeStamp;
	},
	
	setTimeStamp: function (t_timeStamp){
		this.timeStamp = t_timeStamp;
	},

	getRunningBalancePrincipleWithInterestAndFees: function(){
		return this.runningBalancePrincipleWithInterestAndFees;
	},
	
	setRunningBalancePrincipleWithInterestAndFees: function (t_runningBalancePrincipleWithInterestAndFees){
		this.runningBalancePrincipleWithInterestAndFees = t_runningBalancePrincipleWithInterestAndFees;
	},

	getTotalValue: function(){
		return this.totalValue;
	},
	
	setTotalValue: function (t_totalValue){
		this.totalValue = t_totalValue;
	},

	getUserPrefferedDate: function(){
		return this.userPrefferedDate;
	},
	
	setUserPrefferedDate: function (t_userPrefferedDate){
		this.userPrefferedDate = t_userPrefferedDate;
	},
	clearAll: function() {
		this.setId(new Array());
		this.setActionDate(new Array());
		this.setActivity(new Array());
		this.setPrincipal(new Array());
		this.setInterest(new Array());
		this.setFees(new Array());
		this.setPenalty(new Array());
		this.setTotal(new Array());
		this.setRunningBalancePrinciple(new Array());
		this.setRunningBalanceInterest(new Array());
		this.setRunningBalanceFees(new Array());
		this.setRunningBalancePenalty(new Array());
		this.setLocale(new Array());
		this.setTimeStamp(new Array());
		this.setRunningBalancePrincipleWithInterestAndFees(new Array());
		this.setTotalValue(new Array());
		this.setUserPrefferedDate(new Array());
	}
}