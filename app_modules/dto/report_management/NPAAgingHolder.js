module.exports = NPAAgingHolder;

//var officeList 		= new Array(); 
//var prdCategoryList = new Array();
//var personnelList 	= new Array();

var officeFilterId;
var officeId;
var prdCategoryFilterId;
var personnelFilterId;

var accountTypeId;
var date;
var originalDate;

var limit;
var recurrenceType;
var loanStatus;

var cloumn;
var npaThreshold;

var npaPrincipalOutstanding;
var npaPrincipalOutstandingApex;
var npaPrincipalOutstandingRbi;
var npaLoans;

var	defaultZeroToSevenDays      ;//= new Array();
var	defaultEightToThirtydays    ;//= new Array();
var	defaulThirtyOneToSixtydays  ;//= new Array();
var	defaultSixtyOneTONinetyDays ;//= new Array();
var	defaultNinetyOneTo120days   ;//= new Array();
var	default121TO150Days         ;//= new Array();
var	default151TO180Days         ;//= new Array();
var	default181TO210Days         ;//= new Array();
var	default211TO240Days         ;//= new Array();
var	default241TO270Days         ;//= new Array();
var	default271TO300Days         ;//= new Array();
var	default301TO330Days         ;//= new Array();
var	default331TO360Days         ;//= new Array();
var	defaultBeyond360Days        ;//= new Array();

var defaultZeroToSevenDaysApex;
var	defaultEightToThirtydaysApex;
var	defaulThirtyOneToSixtydaysApex;
var	defaultSixtyOneTONinetyDaysApex;
var	defaultNinetyOneTo120daysApex;
var	default121TO150DaysApex;
var	default151TO180DaysApex;
var	default181TO210DaysApex;
var	default211TO240DaysApex;
var	default241TO270DaysApex;
var	default271TO300DaysApex;
var	default301TO330DaysApex;
var	default331TO360DaysApex;
var	defaultBeyond360DaysApex;

var defaultZeroToSevenDaysRBI;
var	defaultEightToThirtydaysRBI;
var	defaulThirtyOneToSixtydaysRBI;
var	defaultSixtyOneTONinetyDaysRBI;
var	defaultNinetyOneTo120daysRBI;
var	default121TO150DaysRBI;
var	default151TO180DaysRBI;
var	default181TO210DaysRBI;
var	default211TO240DaysRBI;
var	default241TO270DaysRBI;
var	default271TO300DaysRBI;
var	default301TO330DaysRBI;
var	default331TO360DaysRBI;
var	defaultBeyond360DaysRBI;


var	defaultZeroToSevenDaysLoans;      
var	defaultEightToThirtydaysLoans;     
var	defaulThirtyOneToSixtydaysLoans;   
var	defaultSixtyOneTONinetyDaysLoans;  
var	defaultNinetyOneTo120daysLoans;    
var	default121TO150DaysLoans;          
var	default151TO180DaysLoans;          
var	default181TO210DaysLoans;         
var	default211TO240DaysLoans;          
var	default241TO270DaysLoans;          
var	default271TO300DaysLoans;          
var	default301TO330DaysLoans;          
var	default331TO360DaysLoans;          
var	defaultBeyond360DaysLoans;

function NPAAgingHolder() {	
    //this.clearAll();
}   					

NPAAgingHolder.prototype = {  
	
	getNpaThreshold : function() {
		return this.npaThreshold;
	},
	setNpaThreshold : function(t_npaThreshold) {
		this.npaThreshold = t_npaThreshold;
	},
	getColumn : function() {
		return this.column;
	},
	setColumn : function(t_column) {
		this.column = t_column;
	},
	
	
	getofficeFilterId : function() {
		return this.officeFilterId;
	},
	setofficeFilterId : function(t_officeFilterId) {
		this.officeFilterId = t_officeFilterId;
	},
    getofficeId : function() {
        return this.officeId;
    },
    setofficeId : function(t_officeId) {
        this.officeId = t_officeId;
    },
    getPrdCategoryFilterId : function() {
		return this.prdCategoryFilterId;
	},
	setPrdCategoryFilterId : function(t_prdCategoryFilterId) {
		this.prdCategoryFilterId = t_prdCategoryFilterId;
	},
	getPersonnelFilterId : function() {
		return this.personnelFilterId;
	},
	setPersonnelFilterId : function(t_personnelFilterId) {
		this.personnelFilterId = t_personnelFilterId;
	},
	getAccountTypeId : function() {
		return this.accountTypeId;
	},
	setAccountTypeId : function(t_accountTypeId) {
		this.accountTypeId = t_accountTypeId;
	},
	getRecurrenceType : function() {
		return this.recurrenceType;
	},
	setRecurrenceType : function(t_recurrenceType) {
		this.recurrenceType = t_recurrenceType;
	},
	getLimit : function() {
		return this.limit;
	},
	setLimit : function(t_limit) {
		this.limit = t_limit;
	},
	getLoanStatus : function() {
		return this.loanStatus;
	},
	setLoanStatus : function(t_loanStatus) {
		this.loanStatus = t_loanStatus;
	},
	getDate : function() {
		return this.date;
	},
	setDate : function(t_date) {
		this.date = t_date;
	},
	getOriginalDate : function() {
		return this.originalDate;
	},
	setOriginalDate : function(t_originalDate) {
		this.originalDate = t_originalDate;
	},
	getNpaPrincipalOutstanding : function() {
		return this.npaPrincipalOutstanding;
	},
	setNpaPrincipalOutstanding : function(t_npaPrincipalOutstanding) {
		this.npaPrincipalOutstanding = t_npaPrincipalOutstanding;
	},
	getNpaPrincipalOutstandingApex : function() {
		return this.npaPrincipalOutstandingApex;
	},
	setNpaPrincipalOutstandingApex : function(t_npaPrincipalOutstandingApex) {
		this.npaPrincipalOutstandingApex = t_npaPrincipalOutstandingApex;
	},
	getNpaPrincipalOutstandingRbi : function() {
		return this.npaPrincipalOutstandingRbi;
	},
	setNpaPrincipalOutstandingRbi : function(t_npaPrincipalOutstandingRbi) {
		this.npaPrincipalOutstandingRbi = t_npaPrincipalOutstandingRbi;
	},
	getNpaLoans : function() {
		return this.npaLoans;
	},
	setNpaLoans : function(t_npaLoans) {
		this.npaLoans = t_npaLoans;
	},
	getDefaultZeroToSevenDays : function() {
		return this.defaultZeroToSevenDays;
	},
	setDefaultZeroToSevenDays : function(t_defaultZeroToSevenDays) {
		this.defaultZeroToSevenDays = t_defaultZeroToSevenDays;
	},
	getDefaultEightToThirtydays : function() {
		return this.defaultEightToThirtydays;
	},
	setDefaultEightToThirtydays : function(t_defaultEightToThirtydays) {
		this.defaultEightToThirtydays = t_defaultEightToThirtydays;
	},
	getDefaulThirtyOneToSixtydays : function() {
		return this.defaulThirtyOneToSixtydays;
	},
	setDefaulThirtyOneToSixtydays : function(t_defaulThirtyOneToSixtydays) {
		this.defaulThirtyOneToSixtydays = t_defaulThirtyOneToSixtydays;
	},
	getDefaultSixtyOneTONinetyDays : function() {
		return this.defaultSixtyOneTONinetyDays;
	},
	setDefaultSixtyOneTONinetyDays : function(t_defaultSixtyOneTONinetyDays) {
		this.defaultSixtyOneTONinetyDays = t_defaultSixtyOneTONinetyDays;
	},
	getDefaultNinetyOneTo120days : function() {
		return this.defaultNinetyOneTo120days;
	},
	setDefaultNinetyOneTo120days : function(t_defaultNinetyOneTo120days) {
		this.defaultNinetyOneTo120days = t_defaultNinetyOneTo120days;
	},
	getDefault121TO150Days : function() {
		return this.default121TO150Days;
	},
	setDefault121TO150Days : function(t_default121TO150Days) {
		this.default121TO150Days = t_default121TO150Days;
	},
	getDefault151TO180Days : function() {
		return this.default151TO180Days;
	},
	setDefault151TO180Days : function(t_default151TO180Days) {
		this.default151TO180Days = t_default151TO180Days;
	},
	getDefault181TO210Days : function() {
		return this.default181TO210Days;
	},
	setDefault181TO210Days : function(t_default181TO210Days) {
		this.default181TO210Days = t_default181TO210Days;
	},
	getDefault211TO240Days : function() {
		return this.default211TO240Days;
	},
	setDefault211TO240Days : function(t_default211TO240Days) {
		this.default211TO240Days = t_default211TO240Days;
	},
	getDefault241TO270Days : function() {
		return this.default241TO270Days;
	},
	setDefault241TO270Days : function(t_default241TO270Days) {
		this.default241TO270Days = t_default241TO270Days;
	},
	getDefault271TO300Days : function() {
		return this.default271TO300Days;
	},
	setDefault271TO300Days : function(t_default271TO300Days) {
		this.default271TO300Days = t_default271TO300Days;
	},
	getDefault301TO330Days : function() {
		return this.default301TO330Days;
	},
	setDefault301TO330Days : function(t_default301TO330Days) {
		this.default301TO330Days = t_default301TO330Days;
	},
	getDefault331TO360Days : function() {
		return this.default331TO360Days;
	},
	setDefault331TO360Days : function(t_default331TO360Days) {
		this.default331TO360Days = t_default331TO360Days;
	},
	getDefaultBeyond360Days : function() {
		return this.defaultBeyond360Days;
	},
	setDefaultBeyond360Days : function(t_defaultBeyond360Days) {
		this.defaultBeyond360Days = t_defaultBeyond360Days;
	},
	getDefaultZeroToSevenDaysApex : function() {
		return this.defaultZeroToSevenDaysApex;
	},
	setDefaultZeroToSevenDaysApex : function(t_defaultZeroToSevenDaysApex) {
		this.defaultZeroToSevenDaysApex = t_defaultZeroToSevenDaysApex;
	},
	getDefaultEightToThirtydaysApex : function() {
		return this.defaultEightToThirtydaysApex;
	},
	setDefaultEightToThirtydaysApex : function(t_defaultEightToThirtydaysApex) {
		this.defaultEightToThirtydaysApex = t_defaultEightToThirtydaysApex;
	},
	getDefaulThirtyOneToSixtydaysApex : function() {
		return this.defaulThirtyOneToSixtydaysApex;
	},
	setDefaulThirtyOneToSixtydaysApex : function(t_defaulThirtyOneToSixtydaysApex) {
		this.defaulThirtyOneToSixtydaysApex = t_defaulThirtyOneToSixtydaysApex;
	},
	getDefaultSixtyOneTONinetyDaysApex : function() {
		return this.defaultSixtyOneTONinetyDaysApex;
	},
	setDefaultSixtyOneTONinetyDaysApex : function(t_defaultSixtyOneTONinetyDaysApex) {
		this.defaultSixtyOneTONinetyDaysApex = t_defaultSixtyOneTONinetyDaysApex;
	},
	getDefaultNinetyOneTo120daysApex : function() {
		return this.defaultNinetyOneTo120daysApex;
	},
	setDefaultNinetyOneTo120daysApex : function(t_defaultNinetyOneTo120daysApex) {
		this.defaultNinetyOneTo120daysApex = t_defaultNinetyOneTo120daysApex;
	},
	getDefault121TO150DaysApex: function() {
		return this.default121TO150DaysApex;
	},
	setDefault121TO150DaysApex : function(t_default121TO150DaysApex) {
		this.default121TO150DaysApex = t_default121TO150DaysApex;
	},
	getDefault151TO180DaysApex : function() {
		return this.default151TO180DaysApex;
	},
	setDefault151TO180DaysApex : function(t_default151TO180DaysApex) {
		this.default151TO180DaysApex = t_default151TO180DaysApex;
	},
	getDefault181TO210DaysApex : function() {
		return this.default181TO210DaysApex;
	},
	setDefault181TO210DaysApex : function(t_default181TO210DaysApex) {
		this.default181TO210DaysApex = t_default181TO210DaysApex;
	},
	getDefault211TO240DaysApex : function() {
		return this.default211TO240DaysApex;
	},
	setDefault211TO240DaysApex : function(t_default211TO240DaysApex) {
		this.default211TO240DaysApex = t_default211TO240DaysApex;
	},
	getDefault241TO270DaysApex : function() {
		return this.default241TO270DaysApex;
	},
	setDefault241TO270DaysApex : function(t_default241TO270DaysApex) {
		this.default241TO270DaysApex = t_default241TO270DaysApex;
	},
	getDefault271TO300DaysApex : function() {
		return this.default271TO300DaysApex;
	},
	setDefault271TO300DaysApex : function(t_default271TO300DaysApex) {
		this.default271TO300DaysApex = t_default271TO300DaysApex;
	},
	getDefault301TO330DaysApex : function() {
		return this.default301TO330DaysApex;
	},
	setDefault301TO330DaysApex : function(t_default301TO330DaysApex) {
		this.default301TO330DaysApex = t_default301TO330DaysApex;
	},
	getDefault331TO360DaysApex : function() {
		return this.default331TO360DaysApex;
	},
	setDefault331TO360DaysApex : function(t_default331TO360DaysApex) {
		this.default331TO360DaysApex = t_default331TO360DaysApex;
	},
	getDefaultBeyond360DaysApex : function() {
		return this.defaultBeyond360DaysApex;
	},
	setDefaultBeyond360DaysApex : function(t_defaultBeyond360DaysApex) {
		this.defaultBeyond360DaysApex = t_defaultBeyond360DaysApex;
	},
	getDefaultZeroToSevenDaysRBI : function() {
		return this.defaultZeroToSevenDaysRBI;
	},
	setDefaultZeroToSevenDaysRBI : function(t_defaultZeroToSevenDaysRBI) {
		this.defaultZeroToSevenDaysRBI = t_defaultZeroToSevenDaysRBI;
	},
	getDefaultEightToThirtydaysRBI : function() {
		return this.defaultEightToThirtydaysRBI;
	},
	setDefaultEightToThirtydaysRBI : function(t_defaultEightToThirtydaysRBI) {
		this.defaultEightToThirtydaysRBI = t_defaultEightToThirtydaysRBI;
	},
	getDefaulThirtyOneToSixtydaysRBI : function() {
		return this.defaulThirtyOneToSixtydaysRBI;
	},
	setDefaulThirtyOneToSixtydaysRBI : function(t_defaulThirtyOneToSixtydaysRBI) {
		this.defaulThirtyOneToSixtydaysRBI = t_defaulThirtyOneToSixtydaysRBI;
	},
	getDefaultSixtyOneTONinetyDaysRBI : function() {
		return this.defaultSixtyOneTONinetyDaysRBI;
	},
	setDefaultSixtyOneTONinetyDaysRBI : function(t_defaultSixtyOneTONinetyDaysRBI) {
		this.defaultSixtyOneTONinetyDaysRBI = t_defaultSixtyOneTONinetyDaysRBI;
	},
	getDefaultNinetyOneTo120daysRBI : function() {
		return this.defaultNinetyOneTo120daysRBI;
	},
	setDefaultNinetyOneTo120daysRBI : function(t_defaultNinetyOneTo120daysRBI) {
		this.defaultNinetyOneTo120daysRBI = t_defaultNinetyOneTo120daysRBI;
	},
	getDefault121TO150DaysRBI: function() {
		return this.default121TO150DaysRBI;
	},
	setDefault121TO150DaysRBI : function(t_default121TO150DaysRBI) {
		this.default121TO150DaysRBI = t_default121TO150DaysRBI;
	},
	getDefault151TO180DaysRBI : function() {
		return this.default151TO180DaysRBI;
	},
	setDefault151TO180DaysRBI : function(t_default151TO180DaysRBI) {
		this.default151TO180DaysRBI = t_default151TO180DaysRBI;
	},
	getDefault181TO210DaysRBI : function() {
		return this.default181TO210DaysRBI;
	},
	setDefault181TO210DaysRBI : function(t_default181TO210DaysRBI) {
		this.default181TO210DaysRBI = t_default181TO210DaysRBI;
	},
	getDefault211TO240DaysRBI : function() {
		return this.default211TO240DaysRBI;
	},
	setDefault211TO240DaysRBI : function(t_default211TO240DaysRBI) {
		this.default211TO240DaysRBI = t_default211TO240DaysRBI;
	},
	getDefault241TO270DaysRBI : function() {
		return this.default241TO270DaysRBI;
	},
	setDefault241TO270DaysRBI : function(t_default241TO270DaysRBI) {
		this.default241TO270DaysRBI = t_default241TO270DaysRBI;
	},
	getDefault271TO300DaysRBI : function() {
		return this.default271TO300DaysRBI;
	},
	setDefault271TO300DaysRBI : function(t_default271TO300DaysRBI) {
		this.default271TO300DaysRBI = t_default271TO300DaysRBI;
	},
	getDefault301TO330DaysRBI : function() {
		return this.default301TO330DaysRBI;
	},
	setDefault301TO330DaysRBI : function(t_default301TO330DaysRBI) {
		this.default301TO330DaysRBI = t_default301TO330DaysRBI;
	},
	getDefault331TO360DaysRBI : function() {
		return this.default331TO360DaysRBI;
	},
	setDefault331TO360DaysRBI : function(t_default331TO360DaysRBI) {
		this.default331TO360DaysRBI = t_default331TO360DaysRBI;
	},
	getDefaultBeyond360DaysRBI : function() {
		return this.defaultBeyond360DaysRBI;
	},
	setDefaultBeyond360DaysRBI : function(t_defaultBeyond360DaysRBI) {
		this.defaultBeyond360DaysRBI = t_defaultBeyond360DaysRBI;
	},
	getDefaultZeroToSevenDaysLoans : function() {
		return this.defaultZeroToSevenDaysLoans;
	},
	setDefaultZeroToSevenDaysLoans : function(t_defaultZeroToSevenDaysLoans) {
		this.defaultZeroToSevenDaysLoans = t_defaultZeroToSevenDaysLoans;
	},
	getDefaultEightToThirtydaysLoans : function() {
		return this.defaultEightToThirtydaysLoans;
	},
	setDefaultEightToThirtydaysLoans : function(t_defaultEightToThirtydaysLoans) {
		this.defaultEightToThirtydaysLoans = t_defaultEightToThirtydaysLoans;
	},
	getDefaulThirtyOneToSixtydaysLoans : function() {
		return this.defaulThirtyOneToSixtydaysLoans;
	},
	setDefaulThirtyOneToSixtydaysLoans : function(t_defaulThirtyOneToSixtydaysLoans) {
		this.defaulThirtyOneToSixtydaysLoans = t_defaulThirtyOneToSixtydaysLoans;
	},
	getDefaultSixtyOneTONinetyDaysLoans : function() {
		return this.defaultSixtyOneTONinetyDaysLoans;
	},
	setDefaultSixtyOneTONinetyDaysLoans : function(t_defaultSixtyOneTONinetyDaysLoans) {
		this.defaultSixtyOneTONinetyDaysLoans = t_defaultSixtyOneTONinetyDaysLoans;
	},
	getDefaultNinetyOneTo120daysLoans : function() {
		return this.defaultNinetyOneTo120daysLoans;
	},
	setDefaultNinetyOneTo120daysLoans : function(t_defaultNinetyOneTo120daysLoans) {
		this.defaultNinetyOneTo120daysLoans = t_defaultNinetyOneTo120daysLoans;
	},
	getDefault121TO150DaysLoans : function() {
		return this.default121TO150DaysLoans;
	},
	setDefault121TO150DaysLoans : function(t_default121TO150DaysLoans) {
		this.default121TO150DaysLoans = t_default121TO150DaysLoans;
	},
	getDefault151TO180DaysLoans : function() {
		return this.default151TO180DaysLoans;
	},
	setDefault151TO180DaysLoans : function(t_default151TO180DaysLoans) {
		this.default151TO180DaysLoans = t_default151TO180DaysLoans;
	},
	getDefault181TO210DaysLoans : function() {
		return this.default181TO210DaysLoans;
	},
	setDefault181TO210DaysLoans : function(t_default181TO210DaysLoans) {
		this.default181TO210DaysLoans = t_default181TO210DaysLoans;
	},
	getDefault211TO240DaysLoans : function() {
		return this.default211TO240DaysLoans;
	},
	setDefault211TO240DaysLoans : function(t_default211TO240DaysLoans) {
		this.default211TO240DaysLoans = t_default211TO240DaysLoans;
	},
	getDefault241TO270DaysLoans : function() {
		return this.default241TO270DaysLoans;
	},
	setDefault241TO270DaysLoans : function(t_default241TO270DaysLoans) {
		this.default241TO270DaysLoans = t_default241TO270DaysLoans;
	},
	getDefault271TO300DaysLoans : function() {
		return this.default271TO300DaysLoans;
	},
	setDefault271TO300DaysLoans : function(t_default271TO300DaysLoans) {
		this.default271TO300DaysLoans = t_default271TO300DaysLoans;
	},
	getDefault301TO330DaysLoans : function() {
		return this.default301TO330DaysLoans;
	},
	setDefault301TO330DaysLoans : function(t_default301TO330DaysLoans) {
		this.default301TO330DaysLoans = t_default301TO330DaysLoans;
	},
	getDefault331TO360DaysLoans : function() {
		return this.default331TO360DaysLoans;
	},
	setDefault331TO360DaysLoans : function(t_default331TO360DaysLoans) {
		this.default331TO360DaysLoans = t_default331TO360DaysLoans;
	},
	getDefaultBeyond360DaysLoans : function() {
		return this.defaultBeyond360DaysLoans;
	},
	setDefaultBeyond360DaysLoans : function(t_defaultBeyond360DaysLoans) {
		this.defaultBeyond360DaysLoans = t_defaultBeyond360DaysLoans;
	},

    clearAll: function(){
        this.setNpaThreshold("");
        this.setColumn("");
        this.setofficeFilterId("");
        this.setofficeId("");
        this.setPrdCategoryFilterId("");
        this.setPersonnelFilterId("");
        this.setAccountTypeId("");
        this.setRecurrenceType("");
        this.setLimit("");
        this.setLoanStatus("");
        this.setDate("");
        this.setOriginalDate("");
        this.setNpaPrincipalOutstanding("");
        this.setNpaPrincipalOutstandingApex("");
        this.setNpaPrincipalOutstandingRbi("");
        this.setNpaLoans("");
        this.setDefaultZeroToSevenDays("");
        this.setDefaultEightToThirtydays("");
        this.setDefaulThirtyOneToSixtydays("");
        this.setDefaultSixtyOneTONinetyDays("");
        this.setDefaultNinetyOneTo120days("");
        this.setDefault121TO150Days("");
        this.setDefault151TO180Days("");
        this.setDefault181TO210Days("");
        this.setDefault211TO240Days("");
        this.setDefault241TO270Days("");
        this.setDefault271TO300Days("");
        this.setDefault301TO330Days("");
        this.setDefault331TO360Days("");
        this.setDefaultBeyond360Days("");
        this.setDefaultZeroToSevenDaysApex("");
        this.setDefaultEightToThirtydaysApex("");
        this.setDefaulThirtyOneToSixtydaysApex("");
        this.setDefaultSixtyOneTONinetyDaysApex("");
        this.setDefaultNinetyOneTo120daysApex("");
        this.setDefault121TO150DaysApex("");
        this.setDefault151TO180DaysApex("");
        this.setDefault181TO210DaysApex("");
        this.setDefault211TO240DaysApex("");
        this.setDefault241TO270DaysApex("");
        this.setDefault271TO300DaysApex("");
        this.setDefault301TO330DaysApex("");
        this.setDefault331TO360DaysApex("");
        this.setDefaultBeyond360DaysApex("");
        this.setDefaultZeroToSevenDaysRBI("");
        this.setDefaultEightToThirtydaysRBI("");
        this.setDefaulThirtyOneToSixtydaysRBI("");
        this.setDefaultSixtyOneTONinetyDaysRBI("");
        this.setDefaultNinetyOneTo120daysRBI("");
        this.setDefault121TO150DaysRBI("");
        this.setDefault151TO180DaysRBI("");
        this.setDefault181TO210DaysRBI("");
        this.setDefault211TO240DaysRBI("");
        this.setDefault241TO270DaysRBI("");
        this.setDefault271TO300DaysRBI("");
        this.setDefault301TO330DaysRBI("");
        this.setDefault331TO360DaysRBI("");
        this.setDefaultBeyond360DaysRBI("");
        this.setDefaultZeroToSevenDaysLoans("");
        this.setDefaultEightToThirtydaysLoans("");
        this.setDefaulThirtyOneToSixtydaysLoans("");
        this.setDefaultSixtyOneTONinetyDaysLoans("");
        this.setDefaultNinetyOneTo120daysLoans("");
        this.setDefault121TO150DaysLoans("");
        this.setDefault151TO180DaysLoans("");
        this.setDefault181TO210DaysLoans("");
        this.setDefault211TO240DaysLoans("");
        this.setDefault241TO270DaysLoans("");
        this.setDefault271TO300DaysLoans("");
        this.setDefault301TO330DaysLoans("");
        this.setDefault331TO360DaysLoans("");
        this.setDefaultBeyond360DaysLoans("");
    }
};