module.exports = prospectClient;

var client_id;
var group_id;
var client_global_number;
var client_name;
var client_last_name;
var status_id;
var family_monthly_income;
var family_monthly_expense;
var is_internal_loan;
var is_overdue;
var is_loan_secured;
var repaymentTrackRecord;
var created_by;
var updated_by;
var created_date;
var updated_date;
var clientIds=new Array();
var memberNames=new Array();
var overdues=new Array();
var remarks;
var kyc_updated_by;
var credited_by;
var data_verified_by;

function prospectClient() {	
    this.clearAll();
}
prospectClient.prototype = {

	getClient_id: function(){
		
		return this.client_id;
	},
	
	setClient_id: function (t_client_id){
        this.client_id = t_client_id;
	},
	getRemarks: function(){
		
		return this.remarks;
	},
	
	setRemarks: function (t_remarks){
        this.remarks = t_remarks;
	},
	
	getGroup_id: function(){
		
		return this.group_id;
	},
	
	setGroup_id: function (t_group_id){
        this.group_id = t_group_id;
	},
	
	getClient_global_number: function(){
		
		return this.client_global_number;
	},
	
	setClient_global_number: function (t_client_global_number){
        this.client_global_number = t_client_global_number;
	},
	
	getClient_name: function(){
		
		return this.client_name;
	},
	
	setClient_name: function (t_client_name){
        this.client_name = t_client_name;
	},
	
	getClient_last_name: function(){
		return this.client_last_name;
	},
	
	setClient_last_name: function (t_client_last_name){
        this.client_last_name = t_client_last_name;
	},
	
	getStatus_id: function(){
		
		return this.status_id;
	},
	
	setStatus_id: function (t_status_id){
        this.status_id = t_status_id;
	},
	
	getFamily_monthly_income: function(){
		
		return this.family_monthly_income;
	},
	
	setFamily_monthly_income: function (t_family_monthly_income){
        this.family_monthly_income = t_family_monthly_income;
	},
	
	getFamily_monthly_expense: function(){
		
		return this.family_monthly_expense;
	},
	
	setFamily_monthly_expense: function (t_family_monthly_expense){
        this.family_monthly_expense = t_family_monthly_expense;
	},
	
	getIs_internal_loan: function(){
		
		return this.is_internal_loan;
	},
	
	setIs_internal_loan: function (t_is_internal_loan){
		is_internal_loan = t_is_internal_loan;
	},
	
	getIs_overdue: function(){
		
		return this.is_overdue;
	},
	
	setIs_overdue: function (t_is_overdue){
        this.is_overdue = t_is_overdue;
	},
	
	
	getIs_loan_secured: function(){
		
		return this.is_loan_secured;
	},
	
	setIs_loan_secured: function (t_is_loan_secured){
        this.is_loan_secured = t_is_loan_secured;
	},
	
	//repaymentTrackRecord getter & setter
	getRepaymentTrackRecord: function(){
		return this.repaymentTrackRecord;
	},
	
	setRepaymentTrackRecord: function (repayment_TrackRecord){
        this.repaymentTrackRecord = repayment_TrackRecord;
	},
	
	getCreated_by: function(){
		return this.created_by;
	},
	
	setCreated_by: function (t_created_by){
        this.created_by = t_created_by;
	},
	
	getUpdated_by: function(){
		return this.updated_by;
	},
	
	setUpdated_by: function (t_updated_by){
        this.updated_by = t_updated_by;
	},
	
	
	getCreated_date: function(){
		return this.created_date;
	},
	
	setCreated_date: function (t_created_date){
        this.created_date = t_created_date;
	},
	
	getUpdated_date: function(){
		return this.updated_date;
	},
	
	setUpdated_date: function (t_updated_date){
        this.updated_date = t_updated_date;
	},
	getClientIds: function(){
		return this.clientIds;
	},
	
	setClientIds: function (t_clientIds){
        this.clientIds = t_clientIds;
	},
	
	getMemberNames: function(){
		return this.memberNames;
	},
	
	setMemberNames: function (t_memberNames){
        this.memberNames = t_memberNames;
	},
	
	
	getOverdues: function(){
		return this.overdues;
	},
	
	setOverdues: function (t_overdues){
        this.overdues = t_overdues;
	},
    getKYC_Updated_By: function(){
        return this.kyc_updated_by;
    },

    setKYC_Updated_By: function (t_kyc_updated_by){
        if(t_kyc_updated_by == null){
            this.kyc_updated_by = "";
        }else{
            this.kyc_updated_by = t_kyc_updated_by;
        }
    },

    getDataVerified_By: function(){
        return this.data_verified_by;
    },

    setDataVerified_By: function (t_data_verified_by){
        if(t_data_verified_by == null){
            this.data_verified_by = "";
        }else{
            this.data_verified_by = t_data_verified_by;
        }
    },

    getCredited_By: function(){
        return this.credited_by;
    },

    setCredited_By: function (t_credited_by){
        if(t_credited_by == null){
            this.credited_by = "";
        }else{
            this.credited_by = t_credited_by;
        }
    },


    clearAll: function() {
        this.setClient_id("");
        this.setGroup_id("");
		this.setClient_global_number("");
        this.setClient_name("");
        this.setClient_last_name("");
        this.setStatus_id("");
        this.setFamily_monthly_income("");
        this.setFamily_monthly_expense("");
        this.setIs_internal_loan("");
        this.setIs_overdue("");
		this.setIs_loan_secured("");
		this.setRepaymentTrackRecord("");
        this.setCreated_by("");
        this.setUpdated_by("");
        this.setCreated_date("");
        this.setUpdated_date("");
        this.setKYC_Updated_By("");
        this.setDataVerified_By("");
        this.setCredited_By("");
	}
};

	
	
