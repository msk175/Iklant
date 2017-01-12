module.exports = prd_offering_loan_product;

var prd_loan_amount;
var prd_no_of_installments;
var prd_installment_amount;
var prd_installment_type;
var prd_interest_rate;

function prd_offering_loan_product() {
    //this.clearAll();
}

prd_offering_loan_product.prototype = {

	getPrd_loan_amount: function(){
		return this.prd_loan_amount;
	},
	
	setPrd_loan_amount: function (prdLoanAmount){
        this.prd_loan_amount = prdLoanAmount;
	},
	
	getPrd_no_of_installments: function(){
		return this.prd_no_of_installments;
	},
	
	setPrd_no_of_installments: function (prdNoOfInstallments){
        this.prd_no_of_installments = prdNoOfInstallments;
	},
	
	getPrd_installment_amount: function(){
		return this.prd_installment_amount;
	},
	
	setPrd_installment_amount: function (prdInstallmentAmount){
        this.prd_installment_amount = prdInstallmentAmount;
	},
	
	getPrd_installment_type: function(){
		return this.prd_installment_type;
	},
	
	setPrd_installment_type: function (prdInstallmentType){
        this.prd_installment_type = prdInstallmentType;
	},

	getPrd_interest_rate: function(){
		return this.prd_interest_rate;
	},
	
	setPrd_interest_rate: function (prdInterestRate){
        this.prd_interest_rate = prdInterestRate;
	},
	
	clearAll: function () {
		this.setPrd_loan_amount("");
		this.setPrd_no_of_installments("");
		this.setPrd_installment_amount("");
		this.setPrd_installment_type("");
		this.setPrd_interest_rate("");
	}
};