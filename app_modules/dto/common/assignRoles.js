module.exports = assignRoles;

var user_id = new Array();
var user_name = new Array();
var role_id = new Array();
var role_name = new Array();
var selected_user_id;
var selected_role_id;


function assignRoles() {	
    //this.clearAll();
}
assignRoles.prototype = {

	getUser_id: function(){
		
		return this.user_id;
	},
	
	setUser_id: function (t_user_id){
        this.user_id = t_user_id;
	},
	
	getUser_name: function(){
		
		return this.user_name;
	},
	
	setUser_name: function (t_user_name){
        this.user_name = t_user_name;
	},
	
	getRole_id: function(){
		
		return this.role_id;
	},
	
	setRole_id: function (t_role_id){
        this.role_id = t_role_id;
	},
	
	getRole_name: function(){
		
		return this.role_name;
	},
	
	setRole_name: function (t_role_name){
        this.role_name = t_role_name;
	},
	
	getSelected_user_id: function(){
		
		return this.selected_user_id;
	},
	
	setSelected_user_id: function (t_selected_user_id){
        this.selected_user_id = t_selected_user_id;
	},
	
	getSelected_role_id: function(){
		
		return this.selected_role_id;
	},
	
	setSelected_role_id: function (t_selected_role_id){
        this.selected_role_id = t_selected_role_id;
	},
	
	
	clearAll: function() {
		this.setUser_id(new Array());
		this.setUser_name(new Array());
		this.setRole_id(new Array());
		this.setRole_name(new Array());
		this.setSelected_user_id("");
		this.setSelected_role_id("");
	}
};

	
	
