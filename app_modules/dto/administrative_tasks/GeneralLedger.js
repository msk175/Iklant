module.exports = generalLedger ;

var generalLedgerParentId;
var generalLedgerFirstChildId;
var generalLedgerSecondChildId;
var generalLedgerCodeId;
var generalLedgerNameId;
var generalOfficeId;
var generalBankOrCashId;


function generalLedger() {
     this.clearAll();
}

generalLedger.prototype = {

    getgeneralLedgerParentId: function(){
        return this.generalLedgerParentId;
    },

    setgeneralLedgerParentId: function (t_generalLedgerParentId){
        this.generalLedgerParentId = t_generalLedgerParentId;
    },

    getgeneralLedgerFirstChildId: function(){
        return this.generalLedgerFirstChildId;
    },

    setgeneralLedgerFirstChildId: function (t_generalLedgerFirstChildId){
        this.generalLedgerFirstChildId = t_generalLedgerFirstChildId;
    },
    getgeneralLedgerSecondChildId: function(){
        return this.generalLedgerSecondChildId;
    },

    setgeneralLedgerSecondChildId: function (t_generalLedgerSecondChildId){
        this.generalLedgerSecondChildId = t_generalLedgerSecondChildId;
    },
    getgeneralLedgerCodeId: function(){
        return this.generalLedgerCodeId;
    },

    setgeneralLedgerCodeId: function (t_generalLedgerCodeId){
        this.generalLedgerCodeId = t_generalLedgerCodeId;
    },
    getgeneralLedgerNameId: function(){
        return this.generalLedgerNameId;
    },

    setgeneralLedgerNameId: function (t_generalLedgerNameId){
        this.generalLedgerNameId = t_generalLedgerNameId;
    },
    getgeneralOfficeId: function(){
        return this.generalOfficeId;
    },

    setgeneralOfficeId: function (t_generalOfficeId){
        this.generalOfficeId = t_generalOfficeId;
    },
    getgeneralBankOrCashId: function(){
        return this.generalBankOrCashId;
    },

    setgeneralBankOrCashId: function (t_generalBankOrCashId){
        this.generalBankOrCashId = t_generalBankOrCashId;
    },

    clearAll: function(){
        this.setgeneralLedgerParentId("");
        this.setgeneralLedgerFirstChildId("");
        this.setgeneralLedgerSecondChildId("");
        this.setgeneralLedgerCodeId("");
        this.setgeneralLedgerNameId("");
        this.setgeneralBankOrCashId("");
        this.setgeneralOfficeId("");
    }

}