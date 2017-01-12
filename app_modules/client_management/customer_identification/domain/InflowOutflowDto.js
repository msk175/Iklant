module.exports = InflowOutflowDto ;

function InflowOutflowDto() {	
   //this.clearAll();
}

var officeName;
var description;
var transactionType;
var chequeNumber;
var transactionAmount;

InflowOutflowDto.prototype = {

	getOfficeName: function(){
		return this.officeName;
	},
	
	setOfficeName: function (t_officeName){
		this.officeName = t_officeName;
	},

	getDescription: function(){
		return this.description;
	},
	
	setDescription: function (t_description){
		this.description = t_description;
	},

	getTransactionType: function(){
		return this.transactionType;
	},
	
	setTransactionType: function (t_transactionType){
		this.transactionType = t_transactionType;
	},

	getChequeNumber: function(){
		return this.chequeNumber;
	},
	
	setChequeNumber: function (t_chequeNumber){
		this.chequeNumber = t_chequeNumber;
	},

	getTransactionAmount: function(){
		return this.transactionAmount;
	},
	
	setTransactionAmount: function (t_transactionAmount){
		this.transactionAmount = t_transactionAmount;
	},

    clearAll : function(){
        this.setOfficeName("");
        this.setDescription("");
        this.setTransactionType("");
        this.setTransactionAmount("");
        this.setChequeNumber("");
    }

}