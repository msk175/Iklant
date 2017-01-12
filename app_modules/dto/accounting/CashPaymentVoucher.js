module.exports = CashPaymentVoucher ;

function CashPaymentVoucher () {	
  //this.clearAll();
}

var transactionMasterId;
var officeId;
var officeName;
var paymentId;
var accountId;
var customerId;
var customerName;
var accountNum;
var transactionDate;
var paymentDate;
var chequeNumber;
var debitAcc;
var debitAccName;
var creditAcc;
var creditAccName;
var trxnAmount;
var amount;
var narration;
var amountInWords;
var transactionDateStr;
var voucherNum;
var chequeDate;
var transactionType;
var openingBal;
var closingBal;
var updatedBy;
var createdBy;

CashPaymentVoucher.prototype = {
	getTransactionDateStr: function(){
		return this.transactionDateStr;
	},
	setTransactionDateStr: function (t_transactionDateStr){
		this.transactionDateStr = t_transactionDateStr;
	},
	getTransactionMasterId: function(){
		return this.transactionMasterId;
	},
	
	setTransactionMasterId: function (t_transactionMasterId){
		this.transactionMasterId = t_transactionMasterId;
	},

	getOfficeId: function(){
		return this.officeId;
	},
	
	setOfficeId: function (t_officeId){
		this.officeId = t_officeId;
	},

	getOfficeName: function(){
		return this.officeName;
	},
	
	setOfficeName: function (t_officeName){
		this.officeName = t_officeName;
	},

	getPaymentId: function(){
		return this.paymentId;
	},
	
	setPaymentId: function (t_paymentId){
		this.paymentId = t_paymentId;
	},

	getAccountId: function(){
		return this.accountId;
	},
	
	setAccountId: function (t_accountId){
		this.accountId = t_accountId;
	},

	getCustomerId: function(){
		return this.customerId;
	},
	
	setCustomerId: function (t_customerId){
		this.customerId = t_customerId;
	},

	getCustomerName: function(){
		return this.customerName;
	},
	
	setCustomerName: function (t_customerName){
		this.customerName = t_customerName;
	},

	getAccountNum: function(){
		return this.accountNum;
	},
	
	setAccountNum: function (t_accountNum){
		this.accountNum = t_accountNum;
	},

	getTransactionDate: function(){
		return this.transactionDate;
	},
	
	setTransactionDate: function (t_transactionDate){
		this.transactionDate = t_transactionDate;
	},

	getPaymentDate: function(){
		return this.paymentDate;
	},
	
	setPaymentDate: function (t_paymentDate){
		this.paymentDate = t_paymentDate;
	},

	getChequeNumber: function(){
		return this.chequeNumber;
	},
	
	setChequeNumber: function (t_chequeNumber){
		this.chequeNumber = t_chequeNumber;
	},

	getDebitAcc: function(){
		return this.debitAcc;
	},
	
	setDebitAcc: function (t_debitAcc){
		this.debitAcc = t_debitAcc;
	},

	getDebitAccName: function(){
		return this.debitAccName;
	},
	
	setDebitAccName: function (t_debitAccName){
		this.debitAccName = t_debitAccName;
	},

	getCreditAcc: function(){
		return this.creditAcc;
	},
	
	setCreditAcc: function (t_creditAcc){
		this.creditAcc = t_creditAcc;
	},

	getCreditAccName: function(){
		return this.creditAccName;
	},
	
	setCreditAccName: function (t_creditAccName){
		this.creditAccName = t_creditAccName;
	},

	getTrxnAmount: function(){
		return this.trxnAmount;
	},
	
	setTrxnAmount: function (t_trxnAmount){
		this.trxnAmount = t_trxnAmount;
	},

	getAmount: function(){
		return this.amount;
	},
	
	setAmount: function (t_amount){
		this.amount = t_amount;
	},

	getNarration: function(){
		return this.narration;
	},
	
	setNarration: function (t_narration){
		this.narration = t_narration;
	},

	getAmountInWords: function(){
		return this.amountInWords;
	},
	
	setAmountInWords: function (t_amountInWords){
		this.amountInWords = t_amountInWords;
	},

	getVoucherNum: function(){
		return this.voucherNum;
	},
	
	setVoucherNum: function (t_voucherNum){
		this.voucherNum = t_voucherNum;
	},

    getChequeDate: function(){
        return this.chequeDate;
    },

    setChequeDate: function (t_chequeDate){
        this.chequeDate = t_chequeDate;
    },

    getOpeningBal: function(){
        return this.openingBal;
    },

    setOpeningBal: function (t_openingBal){
        this.openingBal = t_openingBal;
    },

    getClosingBal: function(){
        return this.closingBal;
    },

    setClosingBal: function (t_closingBal){
        this.closingBal = t_closingBal;
    },

    getTransactionType: function(){
        return this.transactionType;
    },

    setTransactionType: function (t_transactionType){
        this.transactionType = t_transactionType;
    },

	getUpdatedBy: function(){
		return this.updatedBy;
	},
	setUpdatedBy: function (t_updatedBy){
		this.updatedBy = t_updatedBy;
	},
	getCreatedBy: function(){
		return this.createdBy;
	},
	setCreatedBy: function (t_createdBy){
		this.createdBy = t_createdBy;
	},
    clearAll:function(){
        this.setTransactionDateStr("");
        this.setTransactionMasterId("");
        this.setOfficeId("");
        this.setOfficeName("");
        this.setPaymentId("");
        this.setAccountId("");
        this.setCustomerId("");
        this.setCustomerName("");
        this.setAccountNum("");
        this.setTransactionDate("");
        this.setPaymentDate("");
        this.setChequeNumber("");
        this.setDebitAcc("");
        this.setDebitAccName("");
        this.setCreditAcc("");
        this.setCreditAccName("");
        this.setTrxnAmount("");
        this.setAmount("");
        this.setNarration("");
        this.setAmountInWords("");
        this.setVoucherNum("");
		this.setUpdatedBy("");
		this.setCreatedBy("") ;
    }
}