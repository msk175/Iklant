module.exports = prospectGroup;


var preliminary_verification_id;
var group_id;
var loan_active_from;
var is_savings_discussed;
var is_complete_attendance;
var is_bank_account;
var bank_name;
var account_number;
var account_created_date;
var no_of_credit_transaction;
var no_of_debit_transaction;
var remarks;
var created_by;
var updated_by;
var created_date;
var updated_date;

function prospectGroup() {
   //this.clearAll();
}

prospectGroup.prototype = {

	getpreliminary_verification_id: function(){
		return this.preliminary_verification_id;
	},
	
	setpreliminary_verification_id: function (t_preliminary_verification_id){
        this.preliminary_verification_id = t_preliminary_verification_id;
	},
	
	getgroup_id: function(){
		return this.group_id;
	},
	
	setgroup_id: function (t_group_id){
        this.group_id = t_group_id;
	},
	
	
	getloan_active_from: function(){
		return this.loan_active_from;
	},
	
	setloan_active_from: function (t_loan_active_from){
        this.loan_active_from = t_loan_active_from;
	},
	
	getis_savings_discussed: function(){
		return this.is_savings_discussed;
	},
	
	setis_savings_discussed: function (t_is_savings_discussed){
        this.is_savings_discussed = t_is_savings_discussed;
	},
	
	getis_complete_attendance: function(){
		return this.is_complete_attendance;
	},
	
	setis_complete_attendance: function (t_is_complete_attendance){
        this.is_complete_attendance = t_is_complete_attendance;
	},
	
	getis_bank_account: function(){
		return this.is_bank_account;
	},
	
	setis_bank_account: function (t_is_bank_account){
        this.is_bank_account = t_is_bank_account;
	},
	
	getbank_name: function(){
		return this.bank_name;
	},
	
	setbank_name: function (t_bank_name){
        this.bank_name = t_bank_name;
	},
		
	getaccount_number: function(){
		return this.account_number;
	},
	
	setaccount_number: function (t_account_number){
        this.account_number = t_account_number;
	},
			
	getaccount_created_date: function(){
		return this.account_created_date;
	},
	
	setaccount_created_date: function (t_account_created_date){
        this.account_created_date = t_account_created_date;
	},
	
	getno_of_credit_transaction: function(){
		return this.no_of_credit_transaction;
	},
	
	setno_of_credit_transaction: function (t_no_of_credit_transaction){
        this.no_of_credit_transaction = t_no_of_credit_transaction;
	},
		
	getno_of_debit_transaction: function(){
		return this.no_of_debit_transaction;
	},
	
	setno_of_debit_transaction: function (t_no_of_debit_transaction){
        this.no_of_debit_transaction = t_no_of_debit_transaction;
	},
	
	getremarks: function(){
		return this.remarks;
	},
	
	setremarks: function (t_remarks){
        this.remarks = t_remarks;
	},
	
	clearAll: function() {
        this.setpreliminary_verification_id("");
        this.setgroup_id("");
        this.setloan_active_from("");
        this.setis_savings_discussed("");
        this.setis_complete_attendance("");
        this.setis_bank_account("");
        this.setbank_name("");
		this.setaccount_number("");
        this.setaccount_created_date("");
        this.setno_of_debit_transaction("");
        this.setno_of_credit_transaction("");
        this.setremarks("");
	}
		
};