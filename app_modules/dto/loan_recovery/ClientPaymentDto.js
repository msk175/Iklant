module.exports = ClientPaymentDto;

function ClientPaymentDto() {	
   //this.clearAll();
}

var clientId;
var clientName;
var clientPaymentAmount;
var clientPaymentId;
var loanAccountId;
var accountStateId;
var totalOverdueAmount;
var totalOutstandingAmount;
var totalAmountDemanded;
var totalAmountPaid;
var totalInstallmentAmount;
var phoneNumber;


ClientPaymentDto.prototype = {

	getClientId: function(){
		return this.clientId;
	},
	
	setClientId: function (t_clientId){
		this.clientId = t_clientId;
	},
    getAccountStateId: function(){
        return this.accountStateId;
    },

    setAccountStateId: function (t_accountStateId){
        this.accountStateId = t_accountStateId;
    },

	getClientName: function(){
		return this.clientName;
	},
	
	setClientName: function (t_clientName){
		this.clientName = t_clientName;
	},

	getClientPaymentAmount: function(){
		return this.clientPaymentAmount;
	},
	
	setClientPaymentAmount: function (t_clientPaymentAmount){
		this.clientPaymentAmount = t_clientPaymentAmount;
	},

	getClientPaymentId: function(){
		return this.clientPaymentId;
	},
	
	setClientPaymentId: function (t_clientPaymentId){
		this.clientPaymentId = t_clientPaymentId;
	},

	getLoanAccountId: function(){
		return this.loanAccountId;
	},
	
	setLoanAccountId: function (t_loanAccountId){
		this.loanAccountId = t_loanAccountId;
	},

	getTotalOverdueAmount: function(){
		return this.totalOverdueAmount;
	},
	
	setTotalOverdueAmount: function (t_totalOverdueAmount){
		this.totalOverdueAmount = t_totalOverdueAmount;
	},

	getTotalOutstandingAmount: function(){
		return this.totalOutstandingAmount;
	},
	
	setTotalOutstandingAmount: function (t_totalOutstandingAmount){
		this.totalOutstandingAmount = t_totalOutstandingAmount;
	},

	getTotalAmountDemanded: function(){
		return this.totalAmountDemanded;
	},
	
	setTotalAmountDemanded: function (t_totalAmountDemanded){
		this.totalAmountDemanded = t_totalAmountDemanded;
	},

	getTotalAmountPaid: function(){
		return this.totalAmountPaid;
	},
	
	setTotalAmountPaid: function (t_totalAmountPaid){
		this.totalAmountPaid = t_totalAmountPaid;
	},

	getTotalInstallmentAmount: function(){
		return this.totalInstallmentAmount;
	},
	
	setTotalInstallmentAmount: function (t_totalInstallmentAmount){
		this.totalInstallmentAmount = t_totalInstallmentAmount;
	},
	
	getPhoneNumber: function(){
		return this.phoneNumber;
	},
	
	setPhoneNumber: function (t_phoneNumber){
		this.phoneNumber = t_phoneNumber;
	},
	clearAll: function() {
		this.setClientId("");
		this.setClientName("");
		this.setClientPaymentAmount("");
		this.setClientPaymentId("");
		this.setLoanAccountId("");
		this.setTotalOverdueAmount("");
		this.setTotalOutstandingAmount("");
		this.setTotalAmountDemanded("");
		this.setTotalAmountPaid("");
		this.setTotalInstallmentAmount("");
		this.setPhoneNumber("");
	}

}

