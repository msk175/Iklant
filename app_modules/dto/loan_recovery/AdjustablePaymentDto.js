module.exports = AdjustablePaymentDto;

var paymentId;
var amount;
var paymentType;
var paymentDate;
var receiptDate;
var receiptId;

function AdjustablePaymentDto() {
    //this.clearAll();
}

AdjustablePaymentDto.prototype = {
	
	getpaymentId: function(){
		return this.paymentId;
	},
	
	setpaymentId: function (t_paymentId){
		this.paymentId = t_paymentId;
	},

	getamount: function(){
		return this.amount;
	},
	
	setamount: function (t_amount){
		this.amount = t_amount;
	},

	getpaymentType: function(){
		return this.paymentType;
	},
	
	setpaymentType: function (t_paymentType){
		this.paymentType = t_paymentType;
	},

	getpaymentDate: function(){
		return this.paymentDate;
	},
	
	setpaymentDate: function (t_paymentDate){
		this.paymentDate = t_paymentDate;
	},

	getreceiptDate: function(){
		return this.receiptDate;
	},
	
	setreceiptDate: function (t_receiptDate){
		this.receiptDate = t_receiptDate;
	},

	getreceiptId: function(){
		return this.receiptId;
	},
	
	setreceiptId: function (t_receiptId){
		this.receiptId = t_receiptId;
	},

	clearAll: function() {
		this.setpaymentId("");
		this.setamount("");
		this.setpaymentType("");
		this.setpaymentDate("");
		this.setreceiptDate("");
		this.setreceiptId("");
	}

}