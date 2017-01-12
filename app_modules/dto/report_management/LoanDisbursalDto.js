module.exports = LoanDisbursalDto;

function LoanDisbursalDto() {	
    //this.clearAll();
}

var loanAccount;
var loanNumber;
var groupName;
var disbursalDate;
var loanAmount;
var noOfLoans;
var totalLoanAmount;
	
LoanDisbursalDto.prototype = {

	getLoanAccount: function(){
		return this.loanAccount;
	},
	
	setLoanAccount: function (t_loanAccount){
		this.loanAccount = t_loanAccount;
	},

	getLoanNumber: function(){
		return this.loanNumber;
	},
	
	setLoanNumber: function (t_loanNumber){
		this.loanNumber = t_loanNumber;
	},

	getGroupName: function(){
		return this.groupName;
	},
	
	setGroupName: function (t_groupName){
		this.groupName = t_groupName;
	},

	getDisbursalDate: function(){
		return this.disbursalDate;
	},
	
	setDisbursalDate: function (t_disbursalDate){
		this.disbursalDate = t_disbursalDate;
	},
	
	getLoanAmount: function(){
		return this.loanAmount;
	},
	
	setLoanAmount: function (t_loanAmount){
		this.loanAmount = t_loanAmount;
	},

	getNoOfLoans: function(){
		return this.noOfLoans;
	},
	
	setNoOfLoans: function (t_noOfLoans){
		this.noOfLoans = t_noOfLoans;
	},

	getTotalLoanAmount: function(){
		return this.totalLoanAmount;
	},
	
	setTotalLoanAmount: function (t_totalLoanAmount){
		this.totalLoanAmount = t_totalLoanAmount;
	},

    clearAll : function(){
        this.setLoanAccount("");
        this.setLoanAmount("");
        this.setGroupName("");
        this.setDisbursalDate("");
        this.setLoanNumber("");
        this.setNoOfLoans("");
        this.setTotalLoanAmount("");
    }

}