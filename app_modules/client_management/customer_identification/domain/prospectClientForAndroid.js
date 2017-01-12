module.exports = prospectClientForAndroid;

var mobile_group_name_client = new Array();
var group_id = new Array();
var client_id = new Array();
var client_first_name = new Array();
var client_last_name = new Array();
var status_id = new Array();
var updated_time = new Array();
var needed_image_clarity_docs = new Array();
var remarks_for_need_more_information = new Array();

var loan_count = new Array();
	

function prospectClientForAndroid() {	

}

prospectClientForAndroid.prototype = {

	getMobile_group_name_client: function(){
		return this.mobile_group_name_client;
	},
	
	setMobile_group_name_client: function (t_mobile_group_name_client){
        this.mobile_group_name_client = t_mobile_group_name_client;
	},
	getGroup_id: function(){
		return this.group_id;
	},
	
	setGroup_id: function (t_group_id){
        this.group_id = t_group_id;
	},
	

	getClient_id: function(){
		return this.client_id;
	},
	
	setClient_id: function (t_client_id){
        this.client_id = t_client_id;
	},
	
	getClient_first_name: function(){
		return this.client_first_name;
	},
	
	setClient_first_name: function (t_client_first_name){
        this.client_first_name = t_client_first_name;
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
	
	getUpdated_time: function(){
		return this.updated_time;
	},
	
	setUpdated_time: function (t_updated_time){
        this.updated_time = t_updated_time;
	},
	
	getNeeded_image_clarity_docs: function(){
		return this.needed_image_clarity_docs;
	},
	
	setNeeded_image_clarity_docs: function (t_needed_image_clarity_docs){
        this.needed_image_clarity_docs = t_needed_image_clarity_docs;
	},

    getRemarks_for_need_more_information: function(){
        return remarks_for_need_more_information;
    },

    setRemarks_for_need_more_information:function(t_remarks_for_need_more_information){
        remarks_for_need_more_information = t_remarks_for_need_more_information;
    },

    getLoan_count: function(){
        return loan_count;
    },

    setLoan_count:function(t_loan_count){
        loan_count = t_loan_count;
    },


	clearAll: function() {
        this.setMobile_group_name_client("");
		this.setGroup_id("");
		this.setClient_id("");
		this.setClient_first_name("");
		this.setClient_last_name("");
		this.setStatus_id("");
		this.setUpdated_time("");
        this.setNeeded_image_clarity_docs("");
        this.loan_count("");
	}
	
};