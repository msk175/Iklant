module.exports = office;

var officeId;
var officeName;
var officeAddress;

function office() {
    //this.clearAll();
}

office.prototype = {

	getOfficeId: function(){
		return this.officeId;
	},
	
	setOfficeId: function (office_id){
        this.officeId = office_id;
	},
	
	getOfficeName: function(){
		return this.officeName;
	},
	
	setOfficeName: function (office_name){
        this.officeName = office_name;
	},
	
	getOfficeAddress: function(){
		return this.officeAddress;
	},
	
	setOfficeAddress: function (office_address){
        this.officeAddress = office_address;
	},
	
	clearAll: function (){
		this.setOfficeId("");
		this.setOfficeName("");
		this.setOfficeAddress("");
	}
};