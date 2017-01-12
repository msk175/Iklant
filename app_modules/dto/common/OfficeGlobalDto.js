module.exports = OfficeGlobalDto;

function OfficeGlobalDto() {	
   //this.clearAll();
}

var globalOfficeNum;
var displayName;

OfficeGlobalDto.prototype = { 

	getGlobalOfficeNum: function(){
		return this.globalOfficeNum;
	},
	
	setGlobalOfficeNum: function (t_globalOfficeNum){
		this.globalOfficeNum = t_globalOfficeNum;
	},

	getDisplayName: function(){
		return this.displayName;
	},
	
	setDisplayName: function (t_displayName){
		this.displayName = t_displayName;
	},
	clearAll: function() {
		this.setGlobalOfficeNum("");
		this.setDisplayName("");
	}

}
