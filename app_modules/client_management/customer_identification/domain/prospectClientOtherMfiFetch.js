module.exports = prospectClientOtherMfiFetch;

var OtherMfiClientIdArray = new Array();
var OtherMfiNameArrayDto = new Array();
var OtherMfiAmountArrayDto = new Array();
var OtherMfiOutstandingArrayDto= new Array();


function prospectClientOtherMfiFetch() {
    this.clearAll();
}

prospectClientOtherMfiFetch.prototype = {
	
	getOtherMfiClientIdArray: function(){
		return this.OtherMfiClientIdArray;
	},
	
	setOtherMfiClientIdArray: function (Other_mfi_clientIdArray){
        this.OtherMfiClientIdArray = Other_mfi_clientIdArray;
	},
	
	//OtherMfiNameArrayDto getter & setter
	getOtherMfiNameArrayDto: function(){
		return this.OtherMfiNameArrayDto;
	},
	
	setOtherMfiNameArrayDto: function (Other_MfiNameArrayDto){
        this.OtherMfiNameArrayDto = Other_MfiNameArrayDto;
	},
	
	
	//OtherMfiAmountArrayDto getter & setter
	getOtherMfiAmountArrayDto: function(){
		return this.OtherMfiAmountArrayDto;
	},
	
	setOtherMfiAmountArrayDto: function (Other_MfiAmountArrayDto){
        this.OtherMfiAmountArrayDto = Other_MfiAmountArrayDto;
	},
	
	
	//OtherMfiOutstandingArrayDto getter & setter
	getOtherMfiOutstandingArrayDto: function(){
		return this.OtherMfiOutstandingArrayDto;
	},
	
	setOtherMfiOutstandingArrayDto: function (Other_MfiOutstandingArrayDto){
        this.OtherMfiOutstandingArrayDto = Other_MfiOutstandingArrayDto;
	},

	clearAll: function() {
		this.setOtherMfiClientIdArray("");
		this.setOtherMfiNameArrayDto("");
		this.setOtherMfiAmountArrayDto("");
		this.setOtherMfiOutstandingArrayDto("");
	}
		
};