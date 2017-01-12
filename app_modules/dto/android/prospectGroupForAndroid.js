module.exports = prospectGroupForAndroid;
var nextGroupName = "";
var group_id = new Array();
var group_global_number = new Array();
var group_name = new Array();
var center_name = new Array();
var status_id = new Array();
var group_created_date = new Array();
var loan_type_id = new Array();
var needed_information = new Array();
var assigned_to = new Array();
var created_by = new Array();
var created_date = new Array();
var mobile_group_name = new Array();
var needed_image_clarity = new Array();
var area_codes = new Array();
var area_names = new Array();
var loan_count = new Array();


function prospectGroupForAndroid() {	
    this.clearAll();
}

prospectGroupForAndroid.prototype = {

	getNextGroupName: function(){
		return this.nextGroupName;
	},
	
	setNextGroupName: function (t_nextGroupName){
        this.nextGroupName = t_nextGroupName;
	},
	
	getGroup_id: function(){
		return this.group_id;
	},
	
	setGroup_id: function (t_group_id){
        this.group_id = t_group_id;
	},
	

	getGroup_global_number: function(){
		return this.group_global_number;
	},
	
	setGroup_global_number: function (t_group_global_number){
        this.group_global_number = t_group_global_number;
	},
	
	getGroup_name: function(){
		return this.group_name;
	},
	
	setGroup_name: function (t_group_name){
        this.group_name = t_group_name;
	},

	getCenter_name: function(){
		return this.center_name;
	},
	
	setCenter_name: function (t_center_name){
        this.center_name = t_center_name;
	},

	getStatus_id: function(){
		return this.status_id;
	},
	
	setStatus_id: function (t_status_id){
        this.status_id = t_status_id;
	},
	
	getGroup_created_date: function(){
		return this.group_created_date;
	},
	
	setGroup_created_date: function (t_group_created_date){
        this.group_created_date = t_group_created_date;
	},
	
	getLoan_type_id: function(){
		return this.loan_type_id;
	},
	
	setLoan_type_id: function (t_loan_type_id){
        this.loan_type_id = t_loan_type_id;
	},
		
	getNeeded_information: function(){
		return this.needed_information;
	},
	
	setNeeded_information: function (t_needed_information){
        this.needed_information = t_needed_information;
	},
	
	getAssigned_to: function(){
		return this.assigned_to;
	},
	
	setAssigned_to: function (t_assigned_to){
        this.assigned_to = t_assigned_to;
	},
	
	getCreated_by: function(){
		return this.created_by;
	},
	
	setCreated_by: function (t_created_by){
        this.created_by = t_created_by;
	},
	
	getCreated_date: function(){
		return this.created_date;
	},
	
	setCreated_date: function (t_created_date){
        this.created_date = t_created_date;
	},
	
	getMobile_group_name: function(){
		return this.mobile_group_name;
	},
	
	setMobile_group_name: function (t_mobile_group_name){
        this.mobile_group_name = t_mobile_group_name;
	},
	
	getNeeded_image_clarity: function(){
		return this.needed_image_clarity;
	},
	
	setNeeded_image_clarity: function (t_needed_image_clarity){
        this.needed_image_clarity = t_needed_image_clarity;
	},

	getAreaNames: function(){
		return this.area_names;
	},

	setAreaNames: function (t_area_names){
        this.area_names = t_area_names;
	},

	getAreaCodes: function(){
		return this.area_codes;
	},

	setAreaCodes: function (t_area_codes){
        this.area_codes = t_area_codes;
	},

    getLoanCount: function(){
        return this.loan_count;
    },

    setLoanCount: function (t_loan_count){
        this.loan_count = t_loan_count;
    },

	clearAll: function() {
        this.setGroup_id("");
		this.setGroup_name("");
        this.setGroup_global_number("");
		this.setCenter_name("");
        this.setStatus_id("");
        this.setGroup_created_date("");
        this.setLoan_type_id("");
        this.setNeeded_information("");
		this.setCreated_by("");
		this.setAssigned_to("");
        this.setCreated_date("");
		this.setMobile_group_name("");
        this.setNeeded_image_clarity("");
		this.setAreaCodes(new Array());
        this.setAreaNames(new Array());
        this.setLoanCount(new Array());
	}
	
};