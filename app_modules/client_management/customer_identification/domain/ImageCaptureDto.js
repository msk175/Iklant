module.exports = ImageCaptureDto;

var paymentCollectionId;
var globalAccountNum;
var groupId;
var groupName;
var amount;

function ImageCaptureDto() {	
  // this.clearAll();
}

ImageCaptureDto.prototype = {
	getPaymentCollectionId : function(){
		return paymentCollectionId;
	},
	setPaymentCollectionId : function (t_paymentCollectionId){
		this.paymentCollectionId = t_paymentCollectionId;
	},
	getGlobalAccountNum : function(){
		return globalAccountNum;
	},
	setGlobalAccountNum : function (t_globalAccountNum){
		this.globalAccountNum = t_globalAccountNum;
	},
	getGroupId : function(){
		return groupId;
	},
	setGroupId : function (t_groupId){
		this.groupId = t_groupId;
	},
	getGroupName : function(){
		return groupName;
	},
	setGroupName : function (t_groupName){
		this.groupName = t_groupName;
	},
	getAmount : function(){
		return amount;
	},
	setAmount : function (t_amount){
		this.amount = t_amount;
	},

    clearAll : function(){
        this.setPaymentCollectionId("");
        this.setGlobalAccountNum("");
        this.setGroupId("");
        this.setGroupName("");
        this.setAmount("");
    }

};