module.exports = OpeningClosingBalanceDto ;

function OpeningClosingBalanceDto() {	
   // this.clearAll();
}


var officeId;
var glCodeId;
var glCodeValue;
var glCodeName;
var openingBalance;
var debit;
var credit;
var closingBalance;

OpeningClosingBalanceDto.prototype = {

	getOfficeId: function(){
		return this.officeId;
	},
	
	setOfficeId: function (t_officeId){
		this.officeId = t_officeId;
	},

	getGlCodeId: function(){
		return this.glCodeId;
	},
	
	setGlCodeId: function (t_glCodeId){
		this.glCodeId = t_glCodeId;
	},

	getGlCodeValue: function(){
		return this.glCodeValue;
	},
	
	setGlCodeValue: function (t_glCodeValue){
		this.glCodeValue = t_glCodeValue;
	},

	getGlCodeName: function(){
		return this.glCodeName;
	},
	
	setGlCodeName: function (t_glCodeName){
		this.glCodeName = t_glCodeName;
	},

	getOpeningBalance: function(){
		return this.openingBalance;
	},
	
	setOpeningBalance: function (t_openingBalance){
		this.openingBalance = t_openingBalance;
	},

	getDebit: function(){
		return this.debit;
	},
	
	setDebit: function (t_debit){
		this.debit = t_debit;
	},

	getCredit: function(){
		return this.credit;
	},
	
	setCredit: function (t_credit){
		this.credit = t_credit;
	},

	getClosingBalance: function(){
		return this.closingBalance;
	},
	
	setClosingBalance: function (t_closingBalance){
		this.closingBalance = t_closingBalance;
	},

    clearAll: function(){
       this.setOfficeId("");
       this.setGlCodeId("");
       this.setGlCodeValue("");
       this.setGlCodeName("");
       this.setOpeningBalance("");
       this.setDebit("");
       this.setCredit("");
       this.setClosingBalance("");
    }

}