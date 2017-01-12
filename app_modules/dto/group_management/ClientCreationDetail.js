module.exports = ClientCreationDetail ;

function ClientCreationDetail() {

}
var clientId;
var mifosClientCustomerId;
var firstName;
var lastName;
var dateOfBirth;
var line1;
var line2;
var city;
var state;
var zip;
var phoneNumber;
var formedBy;
var salutation;
var maritialStatus;
var religion;
var educationalQualification;
var nationality;
var clientNameType;
var gender;
var povertyStatus;
var spouseFatherFirstName;
var spouseFatherLastName;
var spouseFatherNameType;
var loanOfficerId;
var officeId;
var questionId = new Array();
var value  = new Array();
var loanCounter;
var customerCustomNumber;

ClientCreationDetail.prototype = {

	getCustomerCustomNumber : function(){
        return this.customerCustomNumber;
    },
    setCustomerCustomNumber : function (t_customerCustomNumber){
        this.customerCustomNumber = t_customerCustomNumber;
    },
    getClientId: function(){
        return this.clientId;
    },
    setClientId: function (t_clientId){
        this.clientId = t_clientId;
    },
    getFirstName: function(){
        return this.firstName;
    },
    setFirstName: function (t_firstName){
        this.firstName = t_firstName;
    },

    getLastName: function(){
        return this.lastName;
    },
    setLastName: function (t_lastName){
        this.lastName = t_lastName;
    },
    getDateOfBirth: function(){
        return this.dateOfBirth;
    },
    setDateOfBirth: function (t_dateOfBirth){
        this.dateOfBirth = t_dateOfBirth;
    },
    getLine1: function(){
        return this.line1;
    },
    setLine1: function (t_line2){
        this.line1 = t_line2;
    },
    getLine2: function(){
        return this.line2;
    },
    setLine2: function (t_line2){
        this.line2 = t_line2;
    },
    getCity: function(){
        return this.city;
    },
    setCity: function (t_city){
        this.city = t_city;
    },
    getState: function(){
        return this.state;
    },
    setState: function (t_state){
        this.state = t_state;
    },
    getZip : function(){
        return this.zip;
    },
    setZip: function (t_zip){
        this.zip = t_zip;
    },
    getPhoneNumber: function(){
        return this.phoneNumber;
    },
    setPhoneNumber : function (t_phoneNumber){
        this.phoneNumber = t_phoneNumber;
    },
    getFormedBy: function(){
        return this.formedBy;
    },
    setFormedBy: function (t_formedBy){
        this.formedBy = t_formedBy;
    },
    getSalutation: function(){
        return this.salutation;
    },
    setSalutation: function (t_salutation){
        this.salutation = t_salutation;
    },
    getClientNameType: function(){
        return this.clientNameType;
    },
    setClientNameType: function (t_clientNameType){
        this.clientNameType = t_clientNameType;
    },
    getGender: function(){
        return this.gender;
    },
    setGender: function (t_gender){
        this.gender = t_gender;
    },
    getmMaritialStatus : function(){
        return this.maritialStatus;
    },
    setMaritialStatus: function (t_maritialStatus){
        this.maritialStatus = t_maritialStatus;
    },
    getReligion : function(){
        return this.religion;
    },
    setReligion: function (t_religion){
        this.religion = t_religion;
    },
    getEducationalQualification : function(){
        return this.educationalQualification;
    },
    setEducationalQualification: function (t_educationalQualification){
        this.educationalQualification = t_educationalQualification;
    },
    getNationality : function(){
        return this.nationality;
    },
    setNationality : function (t_nationality){
        this.nationality = t_nationality;
    },
    getPovertyStatus: function(){
        return this.povertyStatus;
    },
    setPovertyStatus: function (t_povertyStatus){
        this.povertyStatus = t_povertyStatus;
    },
    getSpouseFatherFirstName: function(){
        return this.spouseFatherFirstName;
    },
    setSpouseFatherFirstName: function (t_spouseFatherFirstName){
        this.spouseFatherFirstName = t_spouseFatherFirstName;
    },
    getSpouseFatherLastName: function(){
        return this.spouseFatherLastName;
    },
    setSpouseFatherLastName: function (t_spouseFatherLastName){
        this.spouseFatherLastName = t_spouseFatherLastName;
    },
    getSpouseFatherNameType: function(){
        return this.spouseFatherNameType;
    },
    setSpouseFatherNameType: function (t_spouseFatherNameType){
        this.spouseFatherNameType = t_spouseFatherNameType;
    },
    getLoanOfficerId: function(){
        return this.loanOfficerId;
    },
    setLoanOfficerId: function (t_loanOfficerId){
        this.loanOfficerId = t_loanOfficerId;
    },
    getOfficeId: function(){
        return this.officeId;
    },
    setOfficeId: function (t_officeId){
        this.officeId = t_officeId;
    },
    getQuestionId: function(){
        return this.questionId;
    },
    setQuestionId: function (t_questionId){
        this.questionId = t_questionId;
    },
    getvalue: function(){
        return this.value;
    },
    setvalue: function (t_value){
        this.value = t_value;
    },
    setMifosClientCustomerId : function(t_mifosClientCustomerId){
        this.mifosClientCustomerId = t_mifosClientCustomerId;
    },
    getMifosClientCustomerId : function(){
        return this.mifosClientCustomerId;
    },
    setLoanCounter : function(t_loanCounter){
        this.loanCounter = t_loanCounter;
    },
    getLoanCounter : function(){
        return this.loanCounter;
    }
};

