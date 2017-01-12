module.exports = FinancialYearLoadHolder;

var financialYearIdArray = new Array();
var financialYearStartDateArray = new Array();
var financialYearEndDateArray = new Array();

function FinancialYearLoadHolder() {
   //this.clearAll();
}

FinancialYearLoadHolder.prototype = {
    getFinancialYearIdArray : function() {
        return this.financialYearIdArray;
    },
    setFinancialYearIdArray : function(t_financialYearIdArray) {
        this.financialYearIdArray = t_financialYearIdArray;
    },

    getFinancialYearStartDateArray : function() {
        return this.financialYearStartDateArray;
    },
    setFinancialYearStartDateArray : function(t_financialYearStartDateArray) {
        this.financialYearStartDateArray = t_financialYearStartDateArray;
    },

    getFinancialYearEndDateArray : function() {
        return this.financialYearEndDateArray;
    },
    setFinancialYearEndDateArray : function(t_financialYearEndDateArray) {
        this.financialYearEndDateArray = t_financialYearEndDateArray;
    },

    clearAll:function(){
        this.setFinancialYearIdArray(new Array());
        this.setFinancialYearEndDateArray(new Array());
        this.setFinancialYearStartDateArray(new Array());
    }
};