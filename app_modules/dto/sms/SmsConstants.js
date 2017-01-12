module.exports = smsConstants;

smsEnabled = 843;
smsDisabled = 844;
smsQueued = 845;
smsSent = 846;
smsDelivered = 847;

loanDisbursementId = 1;
paymentCollectionId = 2;

function smsConstants() {
}

smsConstants.prototype = {
    getEnabledStatus: function() {
        return smsEnabled;
    },
    getDisabledStatus: function() {
        return smsDisabled;
    },
    getLoanDisbursementId: function() {
        return loanDisbursementId;
    },
    getPaymentCollectionId: function() {
        return paymentCollectionId;
    },
    getQueuedStatus: function() {
        return smsQueued;
    },
    getSentStatus: function() {
        return smsSent;
    },
    getDeliveredStatus: function() {
        return smsDelivered;
    }
}