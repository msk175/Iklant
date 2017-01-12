module.exports = GLCodeDto;

function GLCodeDto() {	
   //this.clearAll();
}

var glcodeId;
var glcode;
var glname;
var officeId;
var cashOrBank;

GLCodeDto.prototype = {
	
	getGlcodeId: function(){
		return this.glcodeId;
	},
	
	setGlcodeId: function (t_glcodeId){
		this.glcodeId = t_glcodeId;
	},

	getGlcode: function(){
		return this.glcode;
	},
	
	setGlcode: function (t_glcode){
		this.glcode = t_glcode;
	},

	getGlname: function(){
		return this.glname;
	},
	
	setGlname: function (t_glname){
		this.glname = t_glname;
	},

	getOfficeId: function(){
		return this.officeId;
	},
	
	setOfficeId: function (t_officeId){
		this.officeId = t_officeId;
	},

	getCashOrBank: function(){
		return this.cashOrBank;
	},
	
	setCashOrBank: function (t_cashOrBank){
		this.cashOrBank = t_cashOrBank;
	},
	clearAll: function() {
		this.setGlcodeId("");
		this.setGlcode("");
		this.setGlname("");
		this.setOfficeId("");
		this.setCashOrBank("");
	}
}