module.exports = PrdOfferingHolder;
var prdOfferingId;
var prdOfferingName;
var prdOfferingStatus;

function PrdOfferingHolder() {
}

PrdOfferingHolder.prototype = {

    setPrdOfferingId : function(t_prdOfferingId){
        this.prdOfferingId = t_prdOfferingId;
    },
    getPrdOfferingId : function(){
        return this.prdOfferingId;
    },

    setPrdOfferingName : function(t_prdOfferingName){
        this.prdOfferingName = t_prdOfferingName;
    },
    getPrdOfferingName : function(){
        return this.prdOfferingName;
    },

    setPrdOfferingStatus : function(t_prdOfferingStatus){
        this.prdOfferingStatus = t_prdOfferingStatus;
    },
    getPrdOfferingStatus : function(){
        return this.prdOfferingStatus;
    }

};