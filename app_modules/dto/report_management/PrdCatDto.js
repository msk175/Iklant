module.exports = PrdCatDto;

function PrdCatDto() {	
   //this.clearAll();
}

var prdCatId;
var prdCatName;
var prdCatGlobalNum;
	
PrdCatDto.prototype = {

	getPrdCatId: function(){
		return this.prdCatId;
	},
	
	setPrdCatId: function (t_prdCatId){
		this.prdCatId = t_prdCatId;
	},

	getPrdCatName: function(){
		return this.prdCatName;
	},
	
	setPrdCatName: function (t_prdCatName){
		this.prdCatName = t_prdCatName;
	},

	getPrdCatGlobalNum: function(){
		return this.prdCatGlobalNum;
	},
	
	setPrdCatGlobalNum: function (t_prdCatGlobalNum){
		this.prdCatGlobalNum = t_prdCatGlobalNum;
	},

    clearAll: function(){
       this.setPrdCatId("");
       this.setPrdCatName("");
       this.setPrdCatGlobalNum("");
    }

}