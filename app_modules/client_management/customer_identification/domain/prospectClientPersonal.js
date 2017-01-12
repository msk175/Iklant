module.exports = prospect_client_personal;

var prospect_client_personal_id;
var client_id;
var membFirstName;
var membLastName;
var date_of_birth;
var mobile_number;
var landline_number;
var address;
var pincode;
var ration_card_number;
var voter_id;
var gas_number;
var aadhaar_number;
var is_other_id;
var other_id_name;
var other_id;
var other_id_name2;
var other_id2;
var marital_status;
var religion;
var caste;
var educational_details;
var loan_purpose;
var guardian_relationship;
var guardian_name;
var guardian_lastname;
var guardian_dob;
var gender;
var nationality;
var remarks;
var commentsByRM;
var remarksByDV;
function prospect_client_personal() {
    this.clearAll();
}

prospect_client_personal.prototype = {

	getCommentsByRM: function(){
		return this.commentsByRM;
	},

	setCommentsByRM: function (t_commentsByRM){
		this.commentsByRM = t_commentsByRM;
	},
	getRemarksByDV: function(){
		return this.remarksByDV;
	},
	setRemarksByDV: function (t_remarksByDV){
		this.remarksByDV = t_remarksByDV;
	},
	//prospect_client_personal_id getter & setter
	getProspect_client_personal_id: function(){
		
		return this.prospect_client_personal_id;
	},
	
	setProspect_client_personal_id: function (ProspectClientPersonalId){
        this.prospect_client_personal_id = ProspectClientPersonalId;
	},
	
	
	//client_id getter & setter
	getClient_id: function(){
		
		return this.client_id;
	},
	
	setClient_id: function (ClientId){
        this.client_id = ClientId;
	},
	
	//MemberFirstName getter & setter
	getMembFirstName: function(){
		return this.membFirstName;
	},
	
	setMembFirstName: function (MemberFirstName){
        this.membFirstName = MemberFirstName;
	},
	
	//MemberLastName getter & setter
	getMembLastName: function(){
		return this.membLastName;
	},
	
	setMembLastName: function (MemberLastName){
        this.membLastName = MemberLastName;
	},
	
	
	//date_of_birth getter & setter
	getDate_of_birth: function(){
		
		return this.date_of_birth;
	},
	
	setDate_of_birth: function (DateOfBirth){
        this.date_of_birth = DateOfBirth;
	},
	getRemarks: function(){
		return this.remarks;
	},
	
	setRemarks: function (t_remarks){
        this.remarks = t_remarks;
	},
	//contact_number getter & setter
	getMobile_number: function(){
		
		return this.mobile_number;
	},
	
	setMobile_number: function (ContactNumber){
        this.mobile_number = ContactNumber;
	},
	
	getLandline_number: function(){

		return this.landline_number;
	},

	setLandLine_number: function (ContactNumber){
        this.landline_number = ContactNumber;
	},
	//address getter & setter
	getAddress: function(){
		
		return this.address;
	},
	
	setAddress: function (tAddress){
        this.address = tAddress;
	},
	
	
	//pincode getter & setter
	getPincode: function(){
	
		return this.pincode;
	},
	
	setPincode: function (tPincode){
        this.pincode = tPincode;
	},
	
	
	//ration_card_number getter & setter
	getRation_card_number: function(){
		
		return this.ration_card_number;
	},
	
	setRation_card_number: function (RationCardNumber){
        this.ration_card_number = RationCardNumber;
	},
	
	//voter_id getter & setter
	getVoter_id: function(){
		
		return this.voter_id;
	},
	
	setVoter_id: function (t_voter_id){
        this.voter_id = t_voter_id;
	},
	
	//gas_number getter & setter
	getGas_number: function(){
		
		return this.gas_number;
	},
	
	setGas_number: function (t_gas_number){
        this.gas_number = t_gas_number;
	},
	
	//aadhaar_number getter & setter
	getAadhaar_number: function(){
		
		return this.aadhaar_number;
	},
	
	setAadhaar_number: function (t_aadhaar_number){
        this.aadhaar_number = t_aadhaar_number;
	},
	
	//is_other_id getter & setter
	getIs_other_id: function(){
		
		return this.is_other_id;
	},
	
	setIs_other_id: function (t_is_other_id){
        this.is_other_id = t_is_other_id;
	},
	
	
	//otherIdName getter & setter
	getOther_id_name: function(){
		
		return this.other_id_name;
	},
	
	setOther_id_name: function (t_other_id_name){
        this.other_id_name = t_other_id_name;
	},
	
	//otherId getter & setter
	getOther_id: function(){
		
		return this.other_id;
	},
	
	setOther_id: function (t_other_id){
        this.other_id = t_other_id;
	},
	
	//otherIdName getter & setter
	getOther_id_name2: function(){

		return this.other_id_name2;
	},

	setOther_id_name2: function (t_other_id_name2){
        this.other_id_name2 = t_other_id_name2;
	},

	//otherId getter & setter
	getOther_id2: function(){

		return this.other_id2;
	},

	setOther_id2: function (t_other_id2){
        this.other_id2 = t_other_id2;
	},
	//marital_status getter & setter
	getMarital_status: function(){
		
		return this.marital_status;
	},
	
	setMarital_status: function (MaritalStatus){
        this.marital_status = MaritalStatus;
	},
	
	
	//religion getter & setter
	getReligion: function(){
		
		return this.religion;
	},
	
	setReligion: function (tReligion){
        this.religion = tReligion;
	},
	
	
	//caste getter & setter
	getCaste: function(){
		
		return this.caste;
	},
	
	setCaste: function (tCaste){
        this.caste = tCaste;
	},
	
	
	//educational_details getter & setter
	getEducational_details: function(){
		
		return this.educational_details;
	},
	
	setEducational_details: function (EducationalDetails){
        this.educational_details = EducationalDetails;
	},
	
	
	//loan_purpose getter & setter
	getLoan_purpose: function(){
		
		return this.loan_purpose;
	},
	
	setLoan_purpose: function (LoanPurpose){
        this.loan_purpose = LoanPurpose;
	},
	
	
	//guardian_relationship getter & setter
	getGuardian_relationship: function(){
		
		return this.guardian_relationship;
	},
	
	setGuardian_relationship: function (GuardianRelationship){
        this.guardian_relationship = GuardianRelationship;
	},
	
	
	//guardianName getter & setter
	getGuardian_name: function(){
		
		return this.guardian_name;
	},
	
	setGuardian_name: function (guardianName){
        this.guardian_name = guardianName;
	},
	
	getGuardian_lastname: function(){
		
		return this.guardian_lastname;
	},
	
	setGuardian_lastname: function (guardianLastName){
        this.guardian_lastname = guardianLastName;
	},
	
	//guardian_dob getter & setter
	getGuardian_dob: function(){
		
		return this.guardian_dob;
	},
	
	setGuardian_dob: function (guardianDOB){
        this.guardian_dob = guardianDOB;
	},
	
	
	//gender getter & setter
	getGender: function(){
		
		return this.gender;
	},
	
	setGender: function (tGender){
        this.gender = tGender;
	},
	
	
	//nationality getter & setter
	getNationality: function(){
		
		return this.nationality;
	},
	
	setNationality: function (tNationality){
        this.nationality = tNationality;
	},
		
	clearAll: function() {
        this.setProspect_client_personal_id("");
		this.setClient_id("");
		this.setMembFirstName("");
		this.setMembLastName("");
		this.setDate_of_birth("");
		this.setMobile_number("");
		this.setLandLine_number("");
		this.setAddress("");
		this.setPincode("");
		this.setRation_card_number("");
		this.setVoter_id("");
		this.setGas_number("");
		this.setAadhaar_number("");
		this.setIs_other_id("");
		this.setOther_id_name("");
		this.setOther_id("");
		this.setOther_id_name2("");
		this.setOther_id2("");
		this.setMarital_status("");
		this.setReligion("");
		this.setCaste("");
		this.setEducational_details("");
		this.setLoan_purpose("");
		this.setGuardian_relationship("");
		this.setGuardian_name("");
		this.setGuardian_lastname("");
		this.setGuardian_dob("");
		this.setGender("");
		this.setNationality("");
		this.setRemarks("");
		this.setCommentsByRM("");
	}
};