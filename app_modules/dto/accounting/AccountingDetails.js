module.exports = AccountingDetails;
var transactionvar;	
var transactionDate;	
var transactionType;

var financialYearStartvar;
var financialYearEndvar;

var headOfficeNameVar = new Array();
var headOfficeId = new Array();

var regionalOfficeNameVar = new Array();
var regionalOfficeId = new Array();

var divisionalOfficeNameVar = new Array();
var divisionalOfficeId = new Array();

var areaOfficeNameVar = new Array();
var areaOfficeId = new Array();

var branchOfficeNameVar = new Array();
var branchOfficeId = new Array();

var mainAccountOfficeHierarchyvar = new Array(); //fromBranchOfficeName
var mainAccountOfficeHierarchyId = new Array();  //fromBranchOfficeGlobalAccountNum

var subAccountOfficeHierarchyvar = new Array();  //toBranchOfficeName
var subAccountOfficeHierarchyId = new Array();   //toBranchOfficeGlobalAccountNum


//OfficeHierarchyByLevelDto officeHierarchyByLevelDto;

var mainAccountOfficevar = new Array();
var mainAccountOfficeId = new Array();
//OfficeDto mainAccountOffice;

var subAccountOfficevar = new Array();
var subAccountOfficeId = new Array();
//OfficeDto subAccountOffice;

var mainAccountvar = new Array();
var mainAccountGlcodeId = new Array();
var mainAccountGlcodeOfficeId = new Array();

var subAccountvar = new Array();
var subAccountGlcodeId = new Array();
var subAccountGlcodeOfficeId = new Array();

//TO Submit data
var mainAccountOfficeHierarchy;
var subAccountOfficeHierarchy;
var mainAccountOffice;
var subAccountOffice;
var mainAccount;
var subAccount;
var amount;
var notes;
var chequeNo;
var chequeDate;
var contra;

var transactionMasterId ;
var bankName = null;
var bankBranch = null; // Unused
var brsState;
var allowedDecimals;

function AccountingDetails() {	
    				
} 
AccountingDetails.prototype = {  
	getAllowedDecimals : function() {
		return this.allowedDecimals;
	},
	setAllowedDecimals : function(t_allowedDecimals) {
		this.allowedDecimals = t_allowedDecimals;
	},
	//TO submit data
	getContra : function() {
		return this.contra;
	},
	setContra : function(t_contra) {
		this.contra = t_contra;
	},
	getMainAccountOfficeHierarchy : function() {
		return this.mainAccountOfficeHierarchy;
	},
	setMainAccountOfficeHierarchy : function(t_mainAccountOfficeHierarchy) {
		this.mainAccountOfficeHierarchy = t_mainAccountOfficeHierarchy;
	},
	getSubAccountOfficeHierarchy : function() {
		return this.subAccountOfficeHierarchy;
	},
	setSubAccountOfficeHierarchy : function(t_subAccountOfficeHierarchy) {
		this.subAccountOfficeHierarchy = t_subAccountOfficeHierarchy;
	}, 
	getMainAccountOffice : function() {
		return this.mainAccountOffice;
	},
	setMainAccountOffice : function(t_mainAccountOffice) {
		this.mainAccountOffice = t_mainAccountOffice;
	},
	getSubAccountOffice : function() {
		return this.subAccountOffice;
	},
	setSubAccountOffice : function(t_subAccountOffice) {
		this.subAccountOffice = t_subAccountOffice;
	},
	getMainAccount : function() {
		return this.mainAccount;
	},
	setMainAccount : function(t_mainAccount) {
		this.mainAccount = t_mainAccount;
	},
	getSubAccount : function() {
		return this.subAccount;
	},
	setSubAccount : function(t_subAccount) {
		this.subAccount = t_subAccount;
	},
	getAmount : function() {
		return this.amount;
	},
	setAmount : function(t_amount) {
		this.amount = t_amount;
	},
	getNotes : function() {
		return this.notes;
	},
	setNotes : function(t_notes) {
		this.notes = t_notes;
	},
	getChequeNo : function() {
		return this.chequeNo;
	},
	setChequeNo : function(t_chequeNo) {
		this.chequeNo = t_chequeNo;
	},
	getChequeDate : function() {
		return this.chequeDate;
	},
	setChequeDate : function(t_chequeDate) {
		this.chequeDate = t_chequeDate;
	},
	//To retrieve data
	getTransactionvar : function() {
		return this.transactionvar;
	},
	setTransactionvar : function(t_transactionvar) {
		this.transactionvar = t_transactionvar;
	},
	getTransactionDate : function() {
		return this.transactionDate;
	},
	setTransactionDate : function(t_transactionDate) {
		this.transactionDate = t_transactionDate;
	},
	getTransactionType : function() {
		return this.transactionType;
	},
	setTransactionType : function(t_transactionType) {
		this.transactionType = t_transactionType;
	},
	getFinancialYearStartvar : function() {
		return this.financialYearStartvar;
	},
	setFinancialYearStartvar : function(t_financialYearStartvar) {
		this.financialYearStartvar = t_financialYearStartvar;
	},
	getFinancialYearEndvar : function() {
		return this.financialYearEndvar;
	},
	setFinancialYearEndvar : function(t_financialYearEndvar) {
		this.financialYearEndvar = t_financialYearEndvar;
	},
	getMainAccountOfficeHierarchyvar : function() {
		return this.mainAccountOfficeHierarchyvar;
	},
	setMainAccountOfficeHierarchyvar : function(t_mainAccountOfficeHierarchyvar) {
		this.mainAccountOfficeHierarchyvar = t_mainAccountOfficeHierarchyvar;
	},
	getMainAccountOfficeHierarchyId : function() {
		return this.mainAccountOfficeHierarchyId;
	},
	setMainAccountOfficeHierarchyId : function(t_mainAccountOfficeHierarchyId) {
		this.mainAccountOfficeHierarchyId = t_mainAccountOfficeHierarchyId;
	},
	
	getSubAccountOfficeHierarchyvar : function() {
		return this.subAccountOfficeHierarchyvar;
	},
	setSubAccountOfficeHierarchyvar : function(t_subAccountOfficeHierarchyvar) {
		this.subAccountOfficeHierarchyvar = t_subAccountOfficeHierarchyvar;
	},
	getSubAccountOfficeHierarchyId : function() {
		return this.subAccountOfficeHierarchyId;
	},
	setSubAccountOfficeHierarchyId : function(t_subAccountOfficeHierarchyId) {
		this.subAccountOfficeHierarchyId = t_subAccountOfficeHierarchyId;
	},

	getMainAccountOfficevar : function() {
		return this.mainAccountOfficevar;
	},
	setMainAccountOfficevar : function(t_mainAccountOfficevar) {
		this.mainAccountOfficevar = t_mainAccountOfficevar;
	}, 
	
	getSubAccountOfficevar : function() {
		return this.subAccountOfficevar;
	},
	setSubAccountOfficevar : function(t_subAccountOfficevar) {
		this.subAccountOfficevar = t_subAccountOfficevar;
	},
	
	getMainAccountvar : function() {
		return this.mainAccountvar;
	},
	setMainAccountvar : function(t_mainAccountvar) {
		this.mainAccountvar = t_mainAccountvar;
	},
	getMainAccountGlcodeId : function() {
		return this.mainAccountGlcodeId;
	},
	setMainAccountGlcodeId : function(t_mainAccountGlcodeId) {
		this.mainAccountGlcodeId = t_mainAccountGlcodeId;
	},
	
	getMainAccountGlcodeOfficeId : function() {
		return this.mainAccountGlcodeOfficeId;
	},
	setMainAccountGlcodeOfficeId : function(t_mainAccountGlcodeOfficeId) {
		this.mainAccountGlcodeOfficeId = t_mainAccountGlcodeOfficeId;
	},
	getSubAccountvar : function() {
		return this.subAccountvar;
	},
	setSubAccountvar : function(t_subAccountvar) {
		this.subAccountvar = t_subAccountvar;
	},
	getSubAccountGlcodeId : function() {
		return this.subAccountGlcodeId;
	},
	setSubAccountGlcodeId : function(t_subAccountGlcodeId) {
		this.subAccountGlcodeId = t_subAccountGlcodeId;
	},
	
	getSubAccountGlcodeOfficeId : function() {
		return this.subAccountGlcodeOfficeId;
	},
	setSubAccountGlcodeOfficeId : function(t_subAccountGlcodeOfficeId) {
		this.subAccountGlcodeOfficeId = t_subAccountGlcodeOfficeId;
	},
	getTransactionMasterId : function() {
		return this.transactionMasterId;
	},
	setTransactionMasterId : function(t_transactionMasterId) {
		this.transactionMasterId = t_transactionMasterId;
	},
	getBankBranch : function() {
		return this.bankBranch;
	},
	setBankBranch : function(t_bankBranch) {
		this.bankBranch = t_bankBranch;
	},
	//OfficeLevelDTO
	getHeadOfficeNameVar : function() {
	return this.headOfficeNameVar;
	},
	setHeadOfficeNameVar : function(t_headOfficeNameVar) {
		this.headOfficeNameVar = t_headOfficeNameVar;
	},
	getHeadOfficeId : function() {
		return this.headOfficeId;
	},
	setHeadOfficeId : function(t_headOfficeId) {
		this.headOfficeId = t_headOfficeId;
	},

	getRegionalOfficeNameVar : function() {
		return this.regionalOfficeNameVar;
	},
	setRegionalOfficeNameVar : function(t_regionalOfficeNameVar) {
		this.regionalOfficeNameVar = t_regionalOfficeNameVar;
	},
	getRegionalOfficeId : function() {
		return this.regionalOfficeId;
	},
	setRegionalOfficeId : function(t_regionalOfficeId) {
		this.regionalOfficeId = t_regionalOfficeId;
	},

	getDivisionalOfficeNameVar : function() {
		return this.divisionalOfficeNameVar;
	},
	setDivisionalOfficeNameVar : function(t_divisionalOfficeNameVar) {
		this.divisionalOfficeNameVar = t_divisionalOfficeNameVar;
	},
	getDivisionalOfficeId : function() {
		return this.divisionalOfficeId;
	},
	setDivisionalOfficeId : function(t_divisionalOfficeId) {
		this.divisionalOfficeId = t_divisionalOfficeId;
	},

	getAreaOfficeNameVar : function() {
		return this.areaOfficeNameVar;
	},
	setAreaOfficeNameVar : function(t_areaOfficeNameVar) {
		this.areaOfficeNameVar = t_areaOfficeNameVar;
	},
	getAreaOfficeId : function() {
		return this.areaOfficeId;
	},
	setAreaOfficeId : function(t_areaOfficeId) {
		this.areaOfficeId = t_areaOfficeId;
	},

	getBranchOfficeNameVar : function() {
		return this.branchOfficeNameVar;
	},
	setBranchOfficeNameVar : function(t_branchOfficeNameVar) {
		this.branchOfficeNameVar = t_branchOfficeNameVar;
	},
	getBranchOfficeId : function() {
		return this.branchOfficeId;
	},
	setBranchOfficeId : function(t_branchOfficeId) {
		this.branchOfficeId = t_branchOfficeId;
	},
    getBankName : function() {
        return this.bankName;
    },
    setBankName : function(t_bankName) {
        this.bankName = t_bankName;
    },
    getBRSState : function() {
        return this.brsState;
    },
    setBRSState : function(t_brsState) {
        this.brsState = t_brsState;
    }
};