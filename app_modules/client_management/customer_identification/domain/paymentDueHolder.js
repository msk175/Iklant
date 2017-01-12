module.exports = paymentDueHolder;

var noOfLoans;
var officeOrLoanOfficerName;
var officeId;
var actionDate;
var personnelId;

function paymentDueHolder() {	
    //this.clearAll();
}

paymentDueHolder.prototype = {

	getNoOfLoans : function(){
		return this.noOfLoans;
	},
	setNoOfLoans: function (t_noOfLoans){
		this.noOfLoans = t_noOfLoans;
	},
	getOfficeOrLoanOfficerName : function(){
		return this.officeOrLoanOfficerName;
	},
	setOfficeOrLoanOfficerName: function (t_officeOrLoanOfficerName){
		this.officeOrLoanOfficerName = t_officeOrLoanOfficerName;
	},
	getOfficeId: function(){
		return this.officeId;
	},
	setOfficeId: function (office_id){
		this.officeId = office_id;
	},
	getActionDate : function(){
		return this.actionDate;
	},
	setActionDate: function (t_actionDate){
		this.actionDate = t_actionDate;
	},
	getPersonnelId : function(){
		return this.personnelId;
	},
	setPersonnelId: function (t_personnelId){
		this.personnelId = t_personnelId;
	},
    clearAll: function(){
        this.setNoOfLoans("");
        this.setOfficeOrLoanOfficerName("");
        this.setOfficeId("");
        this.setActionDate("");
        this.setPersonnelId("");
    }
};