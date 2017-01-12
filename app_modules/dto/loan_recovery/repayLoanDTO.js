module.exports = repayLoanDto;

var earlyRepaymentMoney;
var waivedRepaymentMoney;

function repayLoanDto() {	
     //this.clearAll();
}
repayLoanDto.prototype = {

	getEarlyRepaymentMoney : function() {
		return this.earlyRepaymentMoney;
	},
	setEarlyRepaymentMoney : function(t_earlyRepaymentMoney) {
		this.earlyRepaymentMoney = t_earlyRepaymentMoney;
	},
	getWaivedRepaymentMoney : function() {
		return this.waivedRepaymentMoney;
	},
	setWaivedRepaymentMoney : function(t_waivedRepaymentMoney) {
		this.waivedRepaymentMoney = t_waivedRepaymentMoney;
	},
	clearAll : function(){
        this.setEarlyRepaymentMoney("");
        this.setWaivedRepaymentMoney("");
	}


};