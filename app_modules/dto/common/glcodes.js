module.exports = glcodes;
var glcodeId = new Array();
var glcode = new Array();
var checked;
var globalAccNumber;
var cashOrBank = new Array();

var glcodeValue;
var glcodeLabel;
function glcodes() {	
  //this.clearAll();
}

glcodes.prototype = {

    getGlcodeValue : function() {
        return this.glcodeValue;
    },
    setGlcodeValue : function(t_glcodeValue) {
        this.glcodeValue = t_glcodeValue;
    },
    getGlcodeLabel : function() {
        return this.glcodeLabel;
    },
    setGlcodeLabel : function(t_glcodeLabel) {
        this.glcodeLabel = t_glcodeLabel;
    },
	getGlcodeId : function() {
		return this.glcodeId;
	},
	setGlcodeId : function(t_glcodeId) {
		this.glcodeId = t_glcodeId;
	},
	getGlcode : function() {
		return this.glcode;
	},
	setGlcode : function(t_glcode) {
		this.glcode = t_glcode;
	},
	getChecked : function() {
		return this.checked;
	},
	setChecked : function(t_checked) {
		this.checked = t_checked;
	}, 
	getGlobalAccNumber : function() {
		return this.globalAccNumber;
	},
	setGlobalAccNumber : function(t_globalAccNumber) {
		this.globalAccNumber = t_globalAccNumber;
	},
	getCashOrBank : function() {
		return this.cashOrBank;
	},
	setCashOrBank : function(t_cashOrBank) {
		this.cashOrBank = t_cashOrBank;
	},
	clearAll : function(){
		this.setGlcodeId(new Array());
		this.setGlcode(new Array());
        this.setChecked("");
        this.setGlobalAccNumber("");
        this.setCashOrBank(new Array());
	}
};