module.exports = role_operation;

var roleId;
var operationId;

function role_operation() {
    //this.clearAll();
}

role_operation.prototype = {
	getRoleId: function(){
		return this.roleId;
	},
	setRoleId: function (role_id){
		this.roleId = role_id;
	},
	getOperationId: function(){
		return this.operationId;
	},
	setOperationId: function (operation_id){
		this.operationId = operation_id;
	},
	clearAll: function () {
		this.setRoleId("");
		this.setOperationId("");
	}
};