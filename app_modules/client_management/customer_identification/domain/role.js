module.exports = role;

var roleId;
var roleName;
var roleDescription;

function role() {
    //this.clearAll();
}

role.prototype = {

	getRoleId: function(){
		return this.roleId;
	},
	
	setRoleId: function (role_id){
        this.roleId = role_id;
	},
	
	getRoleName: function(){
		return this.roleName;
	},
	
	setRoleName: function (role_name){
        this.roleName = role_name;
	},
	
	getRoleDescription: function(){
		return this.roleDescription;
	},
	
	setRoleDescription: function (role_description){
        this.roleDescription = role_description;
	},
	
	clearAll: function (){
		this.setRoleId("");
		this.setRoleName("");
		this.setRoleDescription("");
	}
};