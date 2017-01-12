module.exports = prospect_client_bank_detail;

var bank_account_id;
var client_id;
var is_bank_account;
var is_savings;
var is_insurance_lifetime;
var is_insurance_accidental;
var is_insurance_medical;
var group_id;


function prospect_client_bank_detail() {
    this.clearAll();
}

prospect_client_bank_detail.prototype = {
	
	
	//bank_account_id getter & setter
	getBank_account_id: function(){
		
		return this.bank_account_id;
	},
	
	setBank_account_id: function (bankAccountId){
        this.bank_account_id = bankAccountId;
	},
	
	
	//client_id getter & setter
	getClient_id: function(){
		
		return this.client_id;
	},
	
	setClient_id: function (ClientId){
        this.client_id = ClientId;
	},
	
	
	//is_bank_account getter & setter
	getIs_bank_account: function(){
		
		return this.is_bank_account;
	},
	
	setIs_bank_account: function (t_is_bank_account){
        this.is_bank_account = t_is_bank_account;
	},
	
	
	//is_savings getter & setter
	getIs_Savings: function(){
		
		return this.is_savings;
	},
	
	setIs_Savings: function (t_is_savings){
        this.is_savings = t_is_savings;
	},
	
	
	//is_insurance_lifetime getter & setter
	getIs_Insurance_Lifetime: function(){
		
		return this.is_insurance_lifetime;
	},
	
	setIs_Insurance_Lifetime: function (t_is_insurance_lifetime){
        this.is_insurance_lifetime = t_is_insurance_lifetime;
	},
	
	
	//is_insurance_accidental getter & setter
	getIs_Insurance_Accidental: function(){
		
		return this.is_insurance_accidental;
	},
	
	setIs_Insurance_Accidental: function (t_is_insurance_accidental){
        this.is_insurance_accidental = t_is_insurance_accidental;
	},
	
	
	//is_insurance_medical getter & setter
	getIs_Insurance_Medical: function(){
		
		return this.is_insurance_medical;
	},
	
	setIs_Insurance_Medical: function (t_is_insurance_medical){
        this.is_insurance_medical = t_is_insurance_medical;
	},
	
	getGroup_id: function(){
		
		return this.group_id;
	},
	
	setGroup_id: function (t_group_id){

        this.group_id = t_group_id;
	},

	clearAll : function(){
        this.setClient_id("");
        this.setGroup_id("");
        this.setBank_account_id("");
	    this.setIs_bank_account('');
	    this.setIs_Savings('');
	    this.setIs_Insurance_Lifetime('');
	    this.setIs_Insurance_Accidental('');
	    this.setIs_Insurance_Medical('');
	}

	
	
		
};