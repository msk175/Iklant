module.exports = prospectGroup;

var tenant_id
var group_id;
var group_global_number;
var group_name;
var center_name;
var office_id;
var status_id;
var group_created_date;
var loan_type_id;
var loan_type;
var assigned_to;
var is_eligible;
var created_by;
var updated_by;
var created_date;
var updated_date;
var remarks;
var weekradio;
var recurweek;
var dayorder;
var weeklocation;
var monthday;
var everymonth;
var monthlocation;
var meetingTime;

function prospectGroup() {	
     this.clearAll();
}

prospectGroup.prototype = {
	
	getTenant_id: function(){
		return this.tenant_id;
	},
	
	setTenant_id: function (t_tenant_id){
        this.tenant_id = t_tenant_id;
	},
	getWeekradio: function(){
		
		return this.weekradio;
	},
	
	setWeekradio: function (t_weekradio){
        this.weekradio = t_weekradio;
	},
	getRecurweek: function(){
		return this.recurweek;
	},
	
	setRecurweek: function (t_recurweek){
        this.recurweek = t_recurweek;
	},
	getDayorder: function(){
		return this.dayorder;
	},
	
	setDayorder: function (t_dayorder){
		this.dayorder = t_dayorder;
	},
    getWeeklocation: function(){
		return this.weeklocation;
	},
	
	setWeeklocation: function (t_weeklocation){
		this.weeklocation = t_weeklocation;
	},
    getMonthday: function(){
		return this.monthday;
	},
	
	setMonthday: function (t_monthday){
        this.monthday = t_monthday;
	},
	getEverymonth: function(){
		return this.everymonth;
	},
	
	setEverymonth: function (t_everymonth){
        this.everymonth = t_everymonth;
	},
	getMonthlocation: function(){
		return this.monthlocation;
	},
	
	setMonthlocation: function (t_monthlocation){
        this.monthlocation = t_monthlocation;
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
	
	getLoan_type: function(){
		return this.loan_type;
	},
	
	setLoan_type: function (t_loan_type){
        this.loan_type = t_loan_type;
	},
	
	getAssigned_to: function(){
		return this.assigned_to;
	},
	
	setAssigned_to: function (t_assigned_to){
        this.assigned_to = t_assigned_to;
	},
	
	
	getIs_eligible: function(){
		return this.is_eligible;
	},
	
	setIs_eligible: function (t_is_eligible){
        this.is_eligible = t_is_eligible;
	},
	
	getCreated_by: function(){
		return this.created_by;
	},
	
	setCreated_by: function (t_created_by){
        this.created_by = t_created_by;
	},

    getUpdated_by: function(){
        return this.created_by;
    },

    setUpdated_by: function (t_created_by){
        this.created_by = t_created_by;
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
	
	getRemarks: function(){
		return this.remarks;
	},
	
	setRemarks: function (t_remarks){
        this.remarks = t_remarks;
	},
	
	getOffice_id: function(){
		return this.office_id;
	},
	
	setOffice_id: function (t_office_id){
        this.office_id = t_office_id;
	},
	
	getMeetingTime: function(){
		return this.meetingTime;
	},
	setMeetingTime: function (t_meetingTime){
        this.meetingTime = t_meetingTime;
	},
	clearAll: function() {
        this.setTenant_id("");
        this.setGroup_id("");
        this.setGroup_global_number("");
		this.setGroup_name("");
		this.setCenter_name("");
		this.setOffice_id("");
        this.setStatus_id("");
        this.setGroup_created_date("");
        this.setLoan_type_id("");
        this.setLoan_type("");
        this.setAssigned_to("");
        this.setIs_eligible("");
        this.setCreated_by("");
        this.setUpdated_by("");
        this.setCreated_date("");
        this.setUpdated_date("");
		this.setRemarks("");
		this.setWeekradio("");
        this.setRecurweek("");
        this.setDayorder("");
        this.setWeeklocation("");
        this.setMonthday("");
        this.setMonthlocation("");
        this.setEverymonth("");
        this.setMeetingTime("");
	}
	
};