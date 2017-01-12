module.exports = RepaymentSchedule;

function RepaymentSchedule() {	
    this.clearAll();
}
var installmentId = new Array();
var actionDate = new Array();
var paymentDate = new Array();
var principal = new Array();
var interest = new Array();
var fees = new Array();
var penalty = new Array();
var total = new Array();
var runBalPrincipal = new Array();
var runBalInterest = new Array();
var runBalFees = new Array();
var runBalPenalty = new Array();
var totalRunBal = new Array();

RepaymentSchedule.prototype = {
	getInstallmentId: function(){
		return this.installmentId;
	},
	
	setInstallmentId: function (t_installmentId){
		this.installmentId = t_installmentId;
	},

	getActionDate: function(){
		return this.actionDate;
	},
	
	setActionDate: function (t_actionDate){
		this.actionDate = t_actionDate;
	},

	getPaymentDate: function(){
		return this.paymentDate;
	},
	
	setPaymentDate: function (t_paymentDate){
		this.paymentDate = t_paymentDate;
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

	getRunBalPrincipal: function(){
		return this.runBalPrincipal;
	},
	
	setRunBalPrincipal: function (t_runBalPrincipal){
		this.runBalPrincipal = t_runBalPrincipal;
	},

	getRunBalInterest: function(){
		return this.runBalInterest;
	},
	
	setRunBalInterest: function (t_runBalInterest){
		this.runBalInterest = t_runBalInterest;
	},

	getRunBalFees: function(){
		return this.runBalFees;
	},
	
	setRunBalFees: function (t_runBalFees){
		this.runBalFees = t_runBalFees;
	},

	getRunBalPenalty: function(){
		return this.runBalPenalty;
	},
	
	setRunBalPenalty: function (t_runBalPenalty){
		this.runBalPenalty = t_runBalPenalty;
	},
	
	getTotalRunBal: function(){
		return this.totalRunBal;
	},
	
	setTotalRunBal: function (t_totalRunBal){
		this.totalRunBal = t_totalRunBal;
	},
	clearAll: function() {
		this.setInstallmentId(new Array());
		this.setActionDate(new Array());
		this.setPaymentDate(new Array());
		this.setPrincipal(new Array());
		this.setInterest(new Array());
		this.setFees(new Array());
		this.setPenalty(new Array());
		this.setTotal(new Array());
		this.setRunBalPrincipal(new Array());
		this.setRunBalInterest(new Array());
		this.setRunBalFees(new Array());
		this.setRunBalPenalty(new Array());
		this.setTotalRunBal(new Array());
	}
}