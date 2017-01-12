module.exports = loanSummary;

function loanSummary() {	
    //this.clearAll();
}
var originalPrincipal;
var principalPaid;
var principalDue;
var originalInterest;
var interestPaid;
var interestDue;
var originalFees;
var feesPaid;
var feesDue;
var originalPenalty;
var penaltyPaid;
var penaltyDue;

loanSummary.prototype = {

	getOriginalPrincipal: function(){
		return this.originalPrincipal;
	},
	
	setOriginalPrincipal: function (t_originalPrincipal){
        this.originalPrincipal = t_originalPrincipal;
	},

	getPincipalPaid: function(){
		return this.principalPaid;
	},
	
	setPrincipalPaid: function (t_principalPaid){
        this.principalPaid = t_principalPaid;
	},
	

	getPrincipalDue: function(){
		return this.principalDue;
	},
	
	setPrincipalDue: function (t_principalDue){
        this.principalDue = t_principalDue;
	},

	getOriginalInterest: function(){
		return this.originalInterest;
	},
	
	setOriginalInterest: function (t_originalInterest){
        this.originalInterest = t_originalInterest;
	},

	getInterestPaid: function(){
		return this.interestPaid;
	},
	
	setInterestPaid: function (t_interestPaid){
        this.interestPaid = t_interestPaid;
	},

	getInterestDue: function(){
		return this.interestDue;
	},
	
	setInterestDue: function (t_interestDue){
        this.interestDue = t_interestDue;
	},
	
	getOriginalFees: function(){
		return this.originalFees;
	},
	
	setOriginalFees: function (t_originalFees){
        this.originalFees = t_originalFees;
	},

	getFeesPaid: function(){
		return this.feesPaid;
	},
	
	setFeesPaid: function (t_feesPaid){
        this.feesPaid = t_feesPaid;
	},

	getFeesDue: function(){
		return this.feesDue;
	},
	
	setFeesDue: function (t_feesDue){
        this.feesDue = t_feesDue;
	},

	getOriginalPenalty: function(){
		return this.originalPenalty;
	},
	
	setOriginalPenalty: function (t_originalPenalty){
        this.originalPenalty = t_originalPenalty;
	},
	
	getPenaltyPaid: function(){
		return this.penaltyPaid;
	},
	
	setPenaltyPaid: function (t_penaltyPaid){
        this.penaltyPaid = t_penaltyPaid;
	},
	
	getPenaltyDue: function(){
		return this.penaltyDue;
	},
	
	setPenaltyDue: function (t_penaltyDue){
        this.penaltyDue = t_penaltyDue;
	},
	clearAll: function() {
		this.setOriginalPrincipal("");
		this.setPrincipalPaid("");
		this.setPrincipalDue("");
		this.setOriginalInterest("");
		this.setInterestPaid("");
		this.setInterestDue("");
		this.setOriginalFees("");
		this.setFeesPaid("");
		this.setFeesDue("");
		this.setOriginalPenalty("");
		this.setPenaltyPaid("");
		this.setPenaltyDue("");
	}
}
