module.exports = BankReconciliationDto;

function BankReconciliationDto() {

}

var transactionMasterId;
var reconciledDate;
var reconciledBy;


BankReconciliationDto.prototype = {

    setTransactionMasterId : function(t_transactionMasterId){
        this.transactionMasterId = t_transactionMasterId;
    },
    getTransactionMasterId : function(){
        return this.transactionMasterId;
    },

    setReconciledDate : function(t_reconciledDate){
        this.reconciledDate = t_reconciledDate;
    },
    getReconciledDate : function(){
        return this.reconciledDate;
    },

    setReconciledBy : function(t_reconciledBy){
        this.reconciledBy = t_reconciledBy;
    },
    getReconciledBy : function(){
        return this.reconciledBy;
    },

    clearAll: function(){
        this.transactionMasterId("");
        this.reconciledDate("");
        this.reconciledBy("");
    }
}