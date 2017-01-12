module.exports = paymentCollection;

var dueAmount;
var foName;
var receivedDate;
var mobileNumber;
var clientName;

function paymentCollection() {
}

paymentCollection.prototype = {
    getDueAmount: function(){
        return this.dueAmount;
    },

    setDueAmount: function (dueAmount){
        this.dueAmount = dueAmount;
    },
    getFoName: function(){
        return this.foName;
    },

    setFoName: function (foName){
        this.foName = foName;
    },
    getReceivedDate: function(){
        return this.receivedDate;
    },

    setReceivedDate: function (receivedDate){
        this.receivedDate = receivedDate;
    },
    getMobileNumber: function(){
        return this.mobileNumber;
    },

    setMobileNumber: function (mobileNumber){
        this.mobileNumber = mobileNumber;
    },
    getClientName: function(){
        return this.clientName;
    },

    setClientName: function (clientName){
        this.clientName = clientName;
    }
}