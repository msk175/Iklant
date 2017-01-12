module.exports = operation;

var operationId;
var operationName;
var operationIdArray = new Array();
var operationNameArray = new Array();

function operation() {
    //this.clearAll();
}

operation.prototype = {

	getOperationId: function(){
		return this.operationId;
	},
	
	setOperationId: function (operation_id){
        this.operationId = operation_id;
	},
	
	getOperationName: function(){
		return this.operationName;
	},
	
	setOperationName: function (operation_name){
        this.operationName = operation_name;
	},
	
	getOperationIdArray: function(){
		return this.operationIdArray;
	},
	
	setOperationIdArray: function (operation_id_array){
        this.operationIdArray = operation_id_array;
	},
	
	getOperationNameArray: function(){
		return this.operationNameArray;
	},
	
	setOperationNameArray: function (operation_name_array){
        this.operationNameArray = operation_name_array;
	},
	
	clearAll: function () {
		this.setOperationId("");
		this.setOperationName("");
		this.setOperationIdArray(new Array());
		this.setOperationNameArray(new Array());
	}
};