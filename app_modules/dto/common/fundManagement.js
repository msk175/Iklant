module.exports = fundManagement;

var fundId;
var fundName;
var officeId;
var officeName;

function fundManagement() {

}

fundManagement.prototype = {
    //id
    getFundId: function(){
        return this.fundId;
    },
    setFundId : function (t_fundId){
        this.fundId = t_fundId;
    },
    //fundname
    getFundName : function(){
        return this.fundName;
    },
    setFundName: function (t_fundName){
        this.fundName = t_fundName;
    } ,

    //id
    getOfficeId: function(){
        return this.officeId;
    },
    setOfficeId : function (t_officeId){
        this.officeId = t_officeId;
    },
    //fundname
    getOfficeName : function(){
        return this.officeName;
    },
    setOfficeName : function (t_officeName){
        this.officeName = t_officeName;
    }
};
