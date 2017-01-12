module.exports = loanOffering;

var productCategoryIdList = new Array();
var productCategoryNameList = new Array();
var centerName = "";
var customerId = "";
var globalAccountNum = "";

function loanOffering() {	
   //this.clearAll();
}

loanOffering.prototype = {

	getProductCategoryIdList: function(){
		return this.productCategoryIdList;
	},
	
	setProductCategoryIdList : function (t_productCategoryIdList){
		this.productCategoryIdList = t_productCategoryIdList;
	},
	
	getProductCategoryNameList: function(){
		return this.productCategoryNameList;
	},
	
	setProductCategoryNameList : function (t_productCategoryNameList){
		this.productCategoryNameList = t_productCategoryNameList;
	},
	
	getCenterName : function(){
		return this.centerName;
	},
	
	setCenterName : function (t_centerName){
		this.centerName = t_centerName;
	},
	
	getCustomerId : function(){
		return this.customerId;
	},
	
	setCustomerId : function (t_customerId){
		this.customerId = t_customerId;
	},
	getGlobalAccountNum : function(){
		return this.globalAccountNum;
	},
	
	setGlobalAccountNum : function (t_globalAccountNum){
		this.globalAccountNum = t_globalAccountNum;
	},
	clearAll : function(){
		this.setProductCategoryIdList(new Array());
		this.setProductCategoryNameList(new Array());
		this.setCenterName("");
		this.setCustomerId("");
		this.setGlobalAccountNum("");
	}
};