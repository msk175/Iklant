module.exports = CashPaymentVoucherHolder ;

function CashPaymentVoucherHolder() {	
    //this.clearAll();
}
 
var officeId;
var fromDate;
var toDate;
var transactionMasterId;

CashPaymentVoucherHolder.prototype = {
	getFromDate: function(){
		return this.fromDate;
	},

	setFromDate: function (t_fromDate){
		this.fromDate = t_fromDate;
	},

	getOfficeId: function(){
		return this.officeId;
	},
	
	setOfficeId: function (t_officeId){
		this.officeId = t_officeId;
	},

    getToDate: function(){
        return this.toDate;
    },

    setToDate: function (t_toDate){
        this.toDate = t_toDate;
    },

    getTransactionMasterId: function(){
        return this.transactionMasterId;
    },

    setTransactionMasterId: function (t_transactionMasterId){
        this.transactionMasterId = t_transactionMasterId;
    },

    clearAll: function(){
        this.setFromDate("");
        this.setOfficeId("");
        this.setToDate("");
        this.setTransactionMasterId("");
    }
}