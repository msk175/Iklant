module.exports = appraisedClients;

var client_id;
var group_id;
var client_name;
var group_name;
var appraisal_rating;
var appraisal_group_name;
var listClientIdArray =new Array();
var listClientNameArray =new Array();
var listClientRatingArray=new Array();
var listClientTotalWeightageArray=new Array();
var listClientTotalWeightageRequiredArray=new Array();
var clientMobileNumbers = new Array();
var clientLandLineNumbers = new Array();
var hiddengroupid;
var countOfOtherMFILoans  = new Array();
var otherMFIBalanceAmount = new Array();
var otherMFIWrittenOffAmount  = new Array();
var documentIdArray  = new Array();
var documentNameArray  = new Array();
var isReiniated  = new Array();
var reinitiatedStatus  = new Array();
var listLoanCountArray =new Array();
var statusId = new Array();


function appraisedClients() {	
   //this.clearAll();
}

appraisedClients.prototype = {
	getClient_id: function(){
		return this.client_id;
	},
	
	setClient_id: function (t_client_id){
        this.client_id = t_client_id;
	},

	getGroup_id: function(){
		return this.group_id;
	},
	
	setGroup_id: function (t_group_id){
        this.group_id = t_group_id;
	},
	
	getClient_name: function(){
		return this.client_name;
	},
	
	setClient_name: function (t_client_name){
        this.client_name = t_client_name;
	},
	
	
	getgroup_name: function(){
		return this.group_name;
	},
	
	setGroup_name: function (t_group_name){
        this.group_name = t_group_name;
	},

	getAppraisal_Rating: function(){
		return this.appraisal_rating;
	},
	
	setAppraisal_Rating: function (t_appraisal_rating){
        this.appraisal_rating = t_appraisal_rating;
	},
	
	getListClientIdArray: function(){
		return this.listClientIdArray;
	},
	
	setListClientIdArray: function (list_client_id_array){
        this.listClientIdArray = list_client_id_array;
	},
	
	getListClientNameArray: function(){
		return this.listClientNameArray;
	},
	
	setListClientNameArray: function (list_client_name_array){
        this.listClientNameArray = list_client_name_array;
	},

    getListLoanCountArray: function(){
        return this.listLoanCountArray;
    },

    setListLoanCountArray: function (list_loan_count_array){
        this.listLoanCountArray = list_loan_count_array;
    },

	getListClientRatingArray: function(){
		return this.listClientRatingArray;
	},
	
	setListClientRatingArray: function (list_client_rating_array){
        this.listClientRatingArray = list_client_rating_array;
	},
	
	getListClientTotalWeightageArray: function(){
		return this.listClientTotalWeightageArray;
	},
	
	setListClientTotalWeightageArray: function (list_client_totalWeightage_array){
        this.listClientTotalWeightageArray = list_client_totalWeightage_array;
	},
	
	getListClientTotalWeightageRequiredArray: function(){
		return this.listClientTotalWeightageRequiredArray;
	},
	
	setListClientTotalWeightageRequiredArray: function (list_client_totalWeightage_required_array){
        this.listClientTotalWeightageRequiredArray = list_client_totalWeightage_required_array;
	},
	
	gethiddengroupid: function(){
		return this.client_id;
	},
	
	sethiddengroupid: function (t_hidden_group_id){
        this.hiddengroupid = t_hidden_group_id;
	},
	
	getcountOfOtherMFILoans : function(){
		return this.countOfOtherMFILoans;
	},
	
	setcountOfOtherMFILoans : function (t_countOfOtherMFILoans){
        this.countOfOtherMFILoans = t_countOfOtherMFILoans;
	},
	
	getotherMFIBalanceAmount : function(){
		return this.otherMFIBalanceAmount;
	},
	
	setotherMFIBalanceAmount : function (t_otherMFIBalanceAmount){
        this.otherMFIBalanceAmount = t_otherMFIBalanceAmount;
	},
	
	getotherMFIWrittenOffAmount : function(){
		return this.otherMFIWrittenOffAmount;
	},
	
	setotherMFIWrittenOffAmount : function (t_otherMFIWrittenOffAmount){
        this.otherMFIWrittenOffAmount = t_otherMFIWrittenOffAmount;
	},
	
	getDocumentIdArray : function(){
		return this.documentIdArray;
	},
	
	setDocumentIdArray : function (t_documentIdArray){
        this.documentIdArray = t_documentIdArray;
	},
	
	getDocumentNameArray : function(){
		return this.documentNameArray;
	},
	
	setDocumentNameArray : function (t_documentNameArray){
        this.documentNameArray = t_documentNameArray;
	},
	
	getAppraisal_group_name : function(){
		return this.appraisal_group_name;
	},
	
	setAppraisal_group_name : function (t_appraisal_group_name){
        this.appraisal_group_name = t_appraisal_group_name;
	},
    getIsReinitiated: function (){
        return this.isReiniated;
    },

    setIsReinitiated: function (t_isReinitiated){
        this.isReiniated = t_isReinitiated;
	},
	getReinitiatedStatus: function (){
        return this.reinitiatedStatus;
    },
    setReinitiatedStatus: function (t_reinitiatedStatus){
        this.reinitiatedStatus = t_reinitiatedStatus;
	},
	getClientMobileNumbers: function (){
        return this.clientMobileNumbers;
    },
    setClientMobileNumbers: function (clientMobileNumbers){
        this.clientMobileNumbers = clientMobileNumbers;
	},
	getClientLandLineNumbers: function (){
        return this.clientLandLineNumbers;
    },
    setClientLandLineNumbers: function (clientLandLineNumbers){
        this.clientLandLineNumbers = clientLandLineNumbers;
	},
    getStatusId: function (){
        return this.statusId;
    },
    setStatusId: function (statusId){
        this.statusId = statusId;
    },
	clearAll: function (){
		this.setClient_id("");
		this.setGroup_id("");
        this.setClient_name("");
        this.setGroup_name("");
        this.setAppraisal_Rating("");
        this.setAppraisal_group_name("");
		this.setListClientIdArray(new Array());
        this.setListClientNameArray(new Array())
        this.setListClientRatingArray(new Array());
		this.setListClientTotalWeightageArray(new Array());
		this.setListClientTotalWeightageRequiredArray(new Array());
		this.setClientMobileNumbers(new Array());
		this.setClientLandLineNumbers(new Array());
		this.sethiddengroupid("");
		this.setotherMFIWrittenOffAmount(new Array());
		this.setotherMFIBalanceAmount(new Array());
		this.setcountOfOtherMFILoans(new Array());
		this.setDocumentIdArray(new Array());
		this.setDocumentNameArray(new Array());
        this.setIsReinitiated(new Array());
        this.setReinitiatedStatus(new Array());
	}
	
	
};