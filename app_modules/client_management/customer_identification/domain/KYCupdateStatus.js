/**
 * Created by Ezra Johnson on 11/8/14.
 */

module.exports = KYCupdateStatus;

var applicationForm;
var photo;
var memId;
var memAddress;
var guarantorId;
var guarantorAddress;
var ownHouseReceipt;

function KYCupdateStatus() {

}

KYCupdateStatus.prototype = {

    getApplicationForm: function(){
        return this.applicationForm;
    },

    setApplicationForm: function (applicationForm){
        this.applicationForm = applicationForm;
    },

    getPhoto: function(){
        return this.photo;
    },

    setPhoto: function (photo){
        this.photo = photo;
    },

    getMemID: function(){
        this.memId;
    },

    setMemID: function (memId){
        this.memId = memId;
    },

    getMemAddress: function(){
        return this.memAddress;
    },

    setMemAddress: function (memAddress){
        this.memAddress = memAddress;
    },

    getGuarantorID: function(){
        return this.guarantorId;
    },

    setGuarantorID: function (guarantorId){
        this.guarantorId = guarantorId;
    },

    getGuarantorAddress: function(){
        return this.guarantorAddress;
    },

    setGuarantorAddress: function (guarantorAddress){
        this.guarantorAddress = guarantorAddress;
    },

    getOwnHouseReceipt: function(){
        return this.ownHouseReceipt;
    },

    setOwnHouseReceipt: function (ownHouseReceipt){
        this.ownHouseReceipt = ownHouseReceipt;
    },


    clearAll: function() {
        applicationForm = 0;
        photo = 0;
        memId = 0;
        memAddress = 0;
        guarantorId = 0;
        guarantorAddress = 0;
        ownHouseReceipt = 0;
    }

};