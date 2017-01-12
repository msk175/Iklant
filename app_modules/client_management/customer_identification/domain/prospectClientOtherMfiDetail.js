module.exports = prospectClientOtherMfiDetail;

var otherMfiDetailId;
var clientId;
var otherMfiName;
var otherMfiAmountSecured;
var otherMfiLoanOutstanding;
var deletedOtherMfiLoanClientNames;
var deletedOtherMfiLoanClientAmtSecured;
var deletedOtherMfiLoanClientOutstanding;

//Array variables
var OtherMfiNameArrayDto = new Array();
var OtherMfiAmountArrayDto = new Array();
var OtherMfiOutstandingArrayDto= new Array();


function prospectClientOtherMfiDetail() {
    this.clearAll();
}

prospectClientOtherMfiDetail.prototype = {

	getOtherMfiDetailId: function(){
		return this.otherMfiDetailId;
	},
	
	setOtherMfiDetailId: function (other_mfi_detail_id){
        this.otherMfiDetailId = other_mfi_detail_id;
	},
	
	getClientId: function(){
		return this.clientId;
	},
	
	setClientId: function (client_id){
        this.clientId = client_id;
	},
	
	getOtherMfiName: function(){
		return this.otherMfiName;
	},
	
	setOtherMfiName: function (other_mfi_name){
        this.otherMfiName = other_mfi_name;
	},
	
	getOtherMfiAmountSecured: function(){
		return this.otherMfiAmountSecured;
	},
	
	setOtherMfiAmountSecured: function (other_mfi_amount_secured){
        this.otherMfiAmountSecured = other_mfi_amount_secured;
	},
	
	getOtherMfiLoanOutstanding: function(){
		return this.otherMfiLoanOutstanding;
	},
	
	setOtherMfiLoanOutstanding: function (other_mfi_loan_outstanding){
        this.otherMfiLoanOutstanding = other_mfi_loan_outstanding;
	},
	
	//Array setter & Getter
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
	
	
	//deletedOtherMfiLoanClientNames getter & setter
	getDeletedOtherMfiLoanClientNames: function(){
		return this.deletedOtherMfiLoanClientNames;
	},
	
	setDeletedOtherMfiLoanClientNames: function (deleted_OtherMfiLoanClientNames){
        this.deletedOtherMfiLoanClientNames = deleted_OtherMfiLoanClientNames;
	},
	
	//deletedOtherMfiLoanClientAmtSecured getter & setter
	getDeletedOtherMfiLoanClientAmtSecured: function(){
		return this.deletedOtherMfiLoanClientAmtSecured;
	},
	
	setDeletedOtherMfiLoanClientAmtSecured: function (deleted_OtherMfiLoanClientAmtSecured){
        this.deletedOtherMfiLoanClientAmtSecured = deleted_OtherMfiLoanClientAmtSecured;
	},
	
	//deletedOtherMfiLoanClientNames getter & setter
	getDeletedOtherMfiLoanClientOutstanding: function(){
		return this.deletedOtherMfiLoanClientOutstanding;
	},
	
	setDeletedOtherMfiLoanClientOutstanding: function (deleted_OtherMfiLoanClientOutstanding){
        this.deletedOtherMfiLoanClientOutstanding = deleted_OtherMfiLoanClientOutstanding;
	},

	clearAll: function() {
        this.setOtherMfiDetailId("");
		this.setClientId("");
		this.setOtherMfiName("");
		this.setOtherMfiAmountSecured("");
		this.setOtherMfiLoanOutstanding("");
        this.setDeletedOtherMfiLoanClientAmtSecured("");
        this.setDeletedOtherMfiLoanClientNames("");
        this.setDeletedOtherMfiLoanClientOutstanding("");
		this.setOtherMfiNameArrayDto("");
		this.setOtherMfiAmountArrayDto("");
		this.setOtherMfiOutstandingArrayDto("");
	}
};