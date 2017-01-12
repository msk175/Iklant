module.exports = LoanRepaymentForFO;

function LoanRepaymentForFO() {	
   //this.clearAll();
}

var clientId;
var clientName;
var loanAccountId;
var globalAccountNum;
var displayloan;
var installmentId;
var groupCode;
var actionDate;
var address;
var startLatitude;
var startLongitude;
var phoneNumber;
var displayLoan;
var officeAddress;

LoanRepaymentForFO.prototype = {
    getOfficeAddress : function(){
        return this.officeAddress;
    },
    setOfficeAddress : function (t_officeAddress){
        this.officeAddress = t_officeAddress;
    },
    getDisplayLoan : function(){
        return this.displayLoan;
    },
    setDisplayLoan : function (t_displayLoan){
        this.displayLoan = t_displayLoan;
    },
	getActionDate : function(){
		return this.actionDate;
	},
	setActionDate : function (t_actionDate){
		this.actionDate = t_actionDate;
	},
	getGroupCode : function(){
		return this.groupCode;
	},
	setGroupCode : function (t_groupCode){
		this.groupCode = t_groupCode;
	},
	getClientId: function(){
		return this.clientId;
	},
	setClientId: function (t_clientId){
		this.clientId = t_clientId;
	},
	getClientName: function(){
		return this.clientName;
	},
	setClientName: function (t_clientName){
		this.clientName = t_clientName;
	},
	getLoanAccountId: function(){
		return this.loanAccountId;
	},
	setLoanAccountId: function (t_loanAccountId){
		this.loanAccountId = t_loanAccountId;
	},

	getGlobalAccountNum: function(){
		return this.globalAccountNum;
	},
	setGlobalAccountNum: function (t_globalAccountNum){
		this.globalAccountNum = t_globalAccountNum;
	},
	getDisplayloan : function(){
		return this.displayloan;
	},
	setDisplayloan: function (t_displayloan){
		this.displayloan = t_displayloan;
	},
	getInstallmentId : function(){
		return this.installmentId;
	},
	setInstallmentId: function (t_installmentId){
		this.installmentId = t_installmentId;
	},
    getAddress : function(){
        return this.address;
    },
    setAddress: function (t_address){
        this.address = t_address;
    },
    getStartLatitude : function(){
        return this.startLatitude;
    },
    setStartLatitude: function (t_startLatitude){
        this.startLatitude = t_startLatitude;
    },
    getStartLongitude : function(){
        return this.startLongitude;
    },
    setStartLongitude: function (t_startLongitude){
        this.startLongitude = t_startLongitude;
    },
    getPhoneNumber : function(){
        return this.phoneNumber;
    },
    setPhoneNumber: function (t_phoneNumber){
        this.phoneNumber = t_phoneNumber;
    },
    clearAll: function(){
       this.setClientId("");
       this.setClientName("");
       this.setLoanAccountId("");
       this.setGlobalAccountNum("");
       this.setDisplayloan("");
       this.setInstallmentId("");
       this.setGroupCode("");
       this.setActionDate("");
    }
}
