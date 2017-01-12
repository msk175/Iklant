module.exports = smsBusinessObject;

var stateId;
var subject;
var text;
var mobileNumber;
var createdDate;
var deliveredDate;

function smsBusinessObject() {
}

smsBusinessObject.prototype = {
    getStateId: function() {
        return stateId;
    },
    setStateId: function(stateId) {
        this.stateId = stateId;
    },
    getSubject: function() {
        return subject;
    },
    setSubject: function(subject) {
        this.subject = subject;
    },
    getText: function() {
        return text;
    },
    setText: function(text) {
        this.text = text;
    },
    getMobileNumber: function() {
        return mobileNumber;
    },
    setMobileNumber: function(mobileNumber) {
        this.mobileNumber = mobileNumber;
    },
    getCreatedDate: function() {
        return createdDate;
    },
    setCreatedDate: function(createdDate) {
        this.createdDate = createdDate;
    },
    getDeliveredDate: function() {
        return deliveredDate;
    },
    setDeliveredDate: function(deliveredDate) {
        this.deliveredDate = deliveredDate;
    }
}