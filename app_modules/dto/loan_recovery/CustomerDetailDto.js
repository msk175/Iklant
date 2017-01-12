module.exports = customerDetailDto;

var customerId;
var displayName;
var searchId;
var globalCustNum;
var loanOfficerId;
var externalId;
var address;
var  loanOfficerName;
var  officeName;
var officeId;
var flag;
var groupCode;
function customerDetailDto() {	
   //this.clearAll();
}
customerDetailDto.prototype = {
	getGroupCode : function(){
		return this.groupCode;
	},
	setGroupCode : function (t_groupCode){
		this.groupCode = t_groupCode;
	},
	getCustomerId : function(){
		return this.customerId;
	},
	setCustomerId : function (t_customerId){
		this.customerId = t_customerId;
	},
	getDisplayName : function(){
		return this.displayName;
	},
	setDisplayName : function (t_displayName){
		this.displayName = t_displayName;
	},
	getSearchId : function(){
		return this.searchId;
	},
	setSearchId : function (t_searchId){
		this.searchId = t_searchId;
	},
	getGlobalCustNum : function(){
		return this.globalCustNum;
	},
	setGlobalCustNum : function (t_globalCustNum){
		this.globalCustNum = t_globalCustNum;
	},
	getLoanOfficerId : function(){
		return this.loanOfficerId;
	},
	setLoanOfficerId: function (t_loanOfficerId){
		this.loanOfficerId = t_loanOfficerId;
	},
	getAddress: function(){
		return this.address;
	},
	setAddress: function (t_address){
		this.address = t_address;
	},
	getExternalId: function(){
		return this.externalId;
	},
	setExternalId: function (t_externalId){
		this.externalId = t_externalId;
	},
	getAddress: function(){
		return this.address;
	},
	setAddress: function (t_address){
		this.address = t_address;
	},
	getOfficeId: function(){
		return this.officeId;
	},
	setOfficeId: function (office_id){
		this.officeId = office_id;
	},
	getLoanOfficerName : function(){
		return this.loanOfficerName;
	},
	setLoanOfficerName: function (t_loanOfficerName){
		this.loanOfficerName = t_loanOfficerName;
	},
	getOfficeName : function(){
		return this.officeName;
	},
	setOfficeName: function (t_officeName){
		this.officeName = t_officeName;
	},
	getFlag : function(){
		return this.flag;
	},
	setFlag: function (t_flag){
		this.flag = t_flag;
	},

    clearAll: function(){
        this.setGroupCode("");
        this.setAddress("");
        this.setCustomerId("");
        this.setDisplayName("");
        this.setSearchId("");
        this.setGlobalCustNum("");
        this.setLoanOfficerId("");
        this.setExternalId("");
        this.setLoanOfficerName("");
        this.setOfficeName("");
        this.setOfficeId("");
        this.setFlag("");
    }
};