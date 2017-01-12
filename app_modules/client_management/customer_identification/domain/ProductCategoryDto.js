module.exports = ProductCategoryDto;

function ProductCategoryDto() {	
  //this.clearAll();
}
var productCategoryName;
var productCategoryStatusId;
var globalProductCategoryNumber;

 
ProductCategoryDto.prototype = {

	getProductCategoryName: function(){
		return this.productCategoryName;
	},
	
	setProductCategoryName: function (t_productCategoryName){
		this.productCategoryName = t_productCategoryName;
	},

	getProductCategoryStatusId: function(){
		return this.productCategoryStatusId;
	},
	
	setProductCategoryStatusId: function (t_productCategoryStatusId){
		this.productCategoryStatusId = t_productCategoryStatusId;
	},
	
	getGlobalProductCategoryNumber: function(){
		return this.globalProductCategoryNumber;
	},
	
	setGlobalProductCategoryNumber: function (t_globalProductCategoryNumber){
		this.globalProductCategoryNumber = t_globalProductCategoryNumber;
	},

    clearAll: function(){
       this.setProductCategoryName("");
       this.setProductCategoryStatusId("");
       this.setGlobalProductCategoryNumber("");
    }

}