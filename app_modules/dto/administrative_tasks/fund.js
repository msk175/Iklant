module.exports = fund ;

var fundName;
var fundId;


function fund() {
     this.clearAll();
}

fund.prototype = {

    getFundName: function(){
        return this.fundName;
    },

    setFundName: function (t_fundName){
        this.fundName = t_fundName;
    },

    getFundId: function(){
        return this.fundId;
    },

    setFundId: function (t_fundId){
        this.fundId = t_fundId;
    },

    clearAll: function(){
        this.setFundName("");
    }

}