module.exports = PersonnelHolder;

function PersonnelHolder() {	
   //this.clearAll();
}
var personnelId;
var firstName;
var lastName;
var userName;
var password;
var dob;
var gender;
var address1;
var userHierarchy;
var roleId;
var officeId;
var emailId;
var roleIds = new Array();

PersonnelHolder.prototype = {

	getPersonnelId: function(){
		return this.personnelId;
	},
	
	setPersonnelId: function (t_personnelId){
		this.personnelId = t_personnelId;
	},

	
	getFirstName: function(){
		return this.firstName;
	},
	
	setFirstName: function (t_firstName){
		this.firstName = t_firstName;
	},

	getLastName: function(){
		return this.lastName;
	},
	
	setLastName: function (t_lastName){
		this.lastName = t_lastName;
	},

	getUserName: function(){
		return this.userName;
	},
	
	setUserName: function (t_userName){
		this.userName = t_userName;
	},

	getPassword: function(){
		return this.password;
	},
	
	setPassword: function (t_password){
		this.password = t_password;
	},

	getDob: function(){
		return this.dob;
	},
	
	setDob: function (t_dob){
		this.dob = t_dob;
	},

	getGender: function(){
		return this.gender;
	},
	
	setGender: function (t_gender){
		this.gender = t_gender;
	},

	getAddress1: function(){
		return this.address1;
	},
	
	setAddress1: function (t_address1){
		this.address1 = t_address1;
	},

	getUserHierarchy: function(){
		return this.userHierarchy;
	},
	
	setUserHierarchy: function (t_userHierarchy){
		this.userHierarchy = t_userHierarchy;
	},

	getRoleId: function(){
		return this.roleId;
	},
	
	setRoleId: function (t_roleId){
		this.roleId = t_roleId;
	},

	getOfficeId: function(){
		return this.officeId;
	},
	
	setOfficeId: function (t_officeId){
		this.officeId = t_officeId;
	},

	getEmailId: function(){
		return this.emailId;
	},
	
	setEmailId: function (t_emailId){
		this.emailId = t_emailId;
	},
    getRoleIds: function(){
        return this.roleIds;
    },

    setRoleIds: function (t_roleIds){
        this.roleIds = t_roleIds;
    },

    clearAll: function(){
        this.setPersonnelId("");
        this.setFirstName("");
        this.setLastName("");
        this.setUserName("");
        this.setPassword("");
        this.setDob("");
        this.setGender("");
        this.setAddress1("");
        this.setUserHierarchy("");
        this.setRoleId("");
        this.setOfficeId("");
        this.setEmailId("");
        this.setRoleIds("");
    }

}