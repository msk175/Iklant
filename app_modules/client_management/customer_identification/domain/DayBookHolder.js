module.exports = DayBookHolder ;

function DayBookHolder() {	
   //this.clearAll();
}


var transactionDateStr;
var officeId;
var roleId;
var currentDateStr;
var displayDate;
var lastClosingDateStr;

DayBookHolder.prototype = {

	getTransactionDateStr: function(){
		return this.transactionDateStr;
	},
	
	setTransactionDateStr: function (t_transactionDateStr){
		this.transactionDateStr = t_transactionDateStr;
	},

	getOfficeId: function(){
		return this.officeId;
	},
	
	setOfficeId: function (t_officeId){
		this.officeId = t_officeId;
	},

	getRoleId: function(){
		return this.roleId;
	},
	
	setRoleId: function (t_roleId){
		this.roleId = t_roleId;
	},

	getCurrentDateStr: function(){
		return this.currentDateStr;
	},
	
	setCurrentDateStr: function (t_currentDateStr){
		this.currentDateStr = t_currentDateStr;
	},

	getDisplayDate: function(){
		return this.displayDate;
	},
	
	setDisplayDate: function (t_displayDate){
		this.displayDate = t_displayDate;
	},
	
	getLastClosingDateStr: function(){
		return this.lastClosingDateStr;
	},
	
	setLastClosingDateStr: function (t_lastClosingDateStr){
		this.lastClosingDateStr = t_lastClosingDateStr;
	},

    clearAll: function(){
        this.setTransactionDateStr("");
        this.setOfficeId("");
        this.setRoleId("");
        this.setCurrentDateStr("");
        this.setDisplayDate("");
        this.setLastClosingDateStr("");
    }

}