module.exports = NPALoadHolder;

var productCategoryIdArray = new Array();
var productNameArray = new Array();

var officeIdArray = new Array();
var officeNameArray = new Array();

var officePersonnelIdArray = new Array();
var personnelIdArray = new Array();
var personnelNameArray = new Array();

var lastReportGeneratedDate;

function NPALoadHolder() {	
  // this.clearAll();
}  

NPALoadHolder.prototype = {
	getProductCategoryIdArray : function() {
		return this.productCategoryIdArray;
	},
	setProductCategoryIdArray : function(t_productCategoryIdArray) {
		this.productCategoryIdArray = t_productCategoryIdArray;
	},
	
	getProductNameArray : function() {
		return this.productNameArray;
	},
	setProductNameArray : function(t_productNameArray) {
		this.productNameArray = t_productNameArray;
	},
	
	getOfficeIdArray : function() {
		return this.officeIdArray;
	},
	setOfficeIdArray : function(t_officeIdArray) {
		this.officeIdArray = t_officeIdArray;
	},
	
	getOfficeNameArray : function() {
		return this.officeNameArray;
	},
	setOfficeNameArray : function(t_officeNameArray) {
		this.officeNameArray = t_officeNameArray;
	},
	
	getPersonnelIdArray : function() {
		return this.personnelIdArray;
	},
	setPersonnelIdArray : function(t_personnelIdArray) {
		this.personnelIdArray = t_personnelIdArray;
	},
	
	getPersonnelNameArray : function() {
		return this.personnelNameArray;
	},
	setPersonnelNameArray : function(t_personnelNameArray) {
		this.personnelNameArray = t_personnelNameArray;
	}, 

	getOfficePersonnelIdArray : function() {
		return this.officePersonnelIdArray;
	},
	setOfficePersonnelIdArray : function(t_officePersonnelIdArray) {
		this.officePersonnelIdArray = t_officePersonnelIdArray;
	},	
	
	getLastReportGeneratedDate : function() {
		return this.lastReportGeneratedDate;
	},
	setLastReportGeneratedDate : function(t_lastReportGeneratedDate) {
		this.lastReportGeneratedDate = t_lastReportGeneratedDate;
	},

    clearAll: function(){
        this.setProductCategoryIdArray(new Array());
        this.setProductNameArray(new Array());
        this.setOfficeIdArray(new Array());
        this.setOfficeNameArray(new Array());
        this.setPersonnelIdArray(new Array());
        this.setPersonnelNameArray(new Array());
        this.setProductNameArray(new Array());
        this.setLastReportGeneratedDate("");
    }
};