module.exports = manageRoles;

var tenantId;
var operation_id = new Array();
var operation_name = new Array();
var roleName;
var roleDescName;
var checkedValues;

function manageRoles() {	
   //this.clearAll();
}
manageRoles.prototype = {

	getTenantId: function(){		
		return this.tenantId;
	},
	
	setTenantId: function (t_tenantId){
        this.tenantId = t_tenantId;
	},
	
	getOperation_id: function(){		
		return this.operation_id;
	},
	
	setOperation_id: function (t_operation_id){
        this.operation_id = t_operation_id;
	},
	
	getOperation_name: function(){		
		return this.operation_name;
	},
	
	setOperation_name: function (t_operation_name){
        this.operation_name = t_operation_name;
	},
	
	getRoleName: function(){		
		return this.roleName;
	},
	
	setRoleName: function (t_roleName){
        this.roleName = t_roleName;
	},
	
	getRoleDescName: function(){		
		return this.roleDescName;
	},
	
	setRoleDescName: function (t_roleDescName){
        this.roleDescName = t_roleDescName;
	},
	
	getCheckedValues: function(){		
		return this.checkedValues;
	},
	
	setCheckedValues: function (t_checkedValues){
        this.checkedValues = t_checkedValues;
	},
	
	clearAll: function() {
		this.setTenantId("");
		this.setOperation_id(new Array());
		this.setOperation_name(new Array());
		this.setRoleName("");
		this.setRoleDescName("");
		this.setCheckedValues("");
	}
};

	
	
