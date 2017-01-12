module.exports = manageUsers;

var tenant_id;
var office_id;
var user_name;
var password;
var contact_number;
var email_id;


function manageUsers() {	
    //this.clearAll();
}
manageUsers.prototype = {

	getTenant_id: function(){
		
		return this.tenant_id;
	},
	
	setTenant_id: function (t_tenant_id){
        this.tenant_id = t_tenant_id;
	},
	
	getOffice_id: function(){
		
		return this.office_id;
	},
	
	setOffice_id: function (t_office_id){
        this.office_id = t_office_id;
	},
	
	getUser_name: function(){
		
		return this.user_name;
	},
	
	setUser_name: function (t_user_name){
        this.user_name = t_user_name;
	},
	
	getPassword: function(){
		
		return this.password;
	},
	
	setPassword: function (t_password){
        this.password = t_password;
	},
	
	getContact_number: function(){
		
		return this.contact_number;
	},
	
	setContact_number: function (t_contact_number){
        this.contact_number = t_contact_number;
	},
	
	getEmail_id: function(){
		
		return this.email_id;
	},
	
	setEmail_id: function (t_email_id){
        this.email_id = t_email_id;
	},
	
	
	clearAll: function() {
		this.setTenant_id("");
		this.setOffice_id("");
		this.setUser_name("");
		this.setPassword("");
		this.setContact_number("");
		this.setEmail_id("");
	}
};

	
	
