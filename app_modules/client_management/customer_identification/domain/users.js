module.exports = users;

var tenantId = "";
var userId="";
var officeId="";
var userName = "";
var emailId = "";
var contactNumber;

function users() {
    //this.clearAll();
}

users.prototype = {

	getTenantId: function(){
		return this.tenantId;
	},
	
	setTenantId: function (tenant_id){
        this.tenantId = tenant_id;
	},

	getUserId: function(){
		return this.userId;
	},
	
	setUserId: function (user_id){
        this.userId = user_id;
	},
	
	getOfficeId: function(){
		return this.officeId;
	},
	setOfficeId: function (office_id){
        this.officeId = office_id;
	},
	
	getUserName: function(){
		return this.userName;
	},
	setUserName: function (user_name){
        this.userName = user_name;
	},
	
	getEmailId: function(){
		return this.emailId;
	},
	setEmailId: function (email_id){
        this.emailId = email_id;
	},
	getContactNumber: function(){
		return this.contactNumber;
	},
	setContactNumber: function (contact_number){
        this.contactNumber = contact_number;
	},
	clearAll : function(){
		this.setTenantId("");
		this.setUserId("");
		this.setOfficeId("");
		this.setUserName("");
		this.setEmailId("");
		this.setContactNumber("");
	}
};