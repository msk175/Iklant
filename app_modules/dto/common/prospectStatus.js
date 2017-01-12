module.exports = prospectStatus;

var statusId;
var statusName;
var statusIdArray = new Array();
var statusNameArray = new Array();

function prospectStatus() {
    this.clearAll();
}

prospectStatus.prototype = {

	getStatusId: function(){
		return this.statusId;
	},
	
	setStatusId: function (status_id){
        this.statusId = status_id;
	},
	
	getStatusName: function(){
		return this.statusName;
	},
	
	setStatusName: function (status_name){
        this.statusName = status_name;
	},
	
	getStatusIdArray: function(){
		return this.statusIdArray;
	},
	
	setStatusIdArray: function (status_id_array){
        this.statusIdArray = status_id_array;
	},
	
	getStatusNameArray: function(){
		return this.statusNameArray;
	},
	
	setStatusNameArray: function (status_name_array){
        this.statusNameArray = status_name_array;
	},
	
	clearAll: function (){
		this.setStatusId("");
		this.setStatusName("");
		this.setStatusIdArray("");
		this.setStatusNameArray("");
	}
};