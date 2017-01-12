module.exports = kycform;

var clientId = new Array();
var branchName = new Array();
var centerName = new Array();
var clientName = new Array();
var dateOfBirth = new Array();
var guardianRelationship = new Array();
var guardianName = new Array();
var guardianAge = new Array();
var guarantorName = new Array();
var guarantorAge = new Array();
var guarantorRelationship = new Array();
var rationCardNo = new Array();
var voterId = new Array();
var gasNo = new Array();
var aadharNo = new Array();
var guarantorId = new Array();
var phoneNo = new Array();
var religion = new Array();
var caste = new Array();
var maritalStatus = new Array();
var education = new Array();
var loanPurpose = new Array();
var address = new Array();
var pinCode = new Array();
var familyMonthlyIncome = new Array();
var familyMonthlyExpense = new Array();
var house = new Array();
var houseSize = new Array();
var houseRoof = new Array();
var houseFloor = new Array();
var toilet = new Array();
var vehicle = new Array();
var bankAccount = new Array();
var savings = new Array();
var loan_amount;
var emi_amount;
var fo_name;
var grt_date;
	

function kycform() {	
  // this.clearAll();
}

kycform.prototype = {
	
	getClientId: function(){
		return this.clientId;
	},
	
	setClientId: function (client_id){
        this.clientId = client_id;
	},
	
	getBranchName: function(){
		return this.branchName;
	},
	
	setBranchName: function (branch_name){
        this.branchName = branch_name;
	},
	
	getCenterName: function(){
		return this.centerName;
	},
	
	setCenterName: function (center_name){
        this.centerName = center_name;
	},

	getClientName: function(){
		return this.clientName;
	},
	
	setClientName: function (client_name){
        this.clientName = client_name;
	},

	getDateOfBirth: function(){
		return this.dateOfBirth;
	},
	
	setDateOfBirth: function (date_of_birth){
        this.dateOfBirth = date_of_birth;
	},

	getGuardianRelationship: function(){
		return this.guardianRelationship;
	},
	
	setGuardianRelationship: function (guardian_relationship){
        this.guardianRelationship = guardian_relationship;
	},
	
	getGuardianName: function(){
		return this.guardianName;
	},
	
	setGuardianName: function (guardian_name){
        this.guardianName = guardian_name;
	},
	
	getGuardianAge: function(){
		return this.guardianAge;
	},
	
	setGuardianAge: function (guardian_age){
        this.guardianAge = guardian_age;
	},
	
	getGuarantorName: function(){
		return this.guarantorName;
	},
	
	setGuarantorName: function (guarantor_name){
        this.guarantorName = guarantor_name;
	},
	
	getGuarantorAge: function(){
		return this.guarantorAge;
	},
	
	setGuarantorAge: function (guarantor_age){
        this.guarantorAge = guarantor_age;
	},
	
	getGuarantorRelationship: function(){
		return this.guarantorRelationship;
	},
	
	setGuarantorRelationship: function (guarantor_relationship){
        this.guarantorRelationship = guarantor_relationship;
	},

	getRationCardNo: function(){
		return this.rationCardNo;
	},
	
	setRationCardNo: function (ration_card_no){
        this.rationCardNo = ration_card_no;
	},

	getVoterId: function(){
		return this.voterId;
	},
	
	setVoterId: function (voter_id){
        this.voterId = voter_id;
	},
	
	getGasNo: function(){
		return this.gasNo;
	},
	
	setGasNo: function(gas_no){
        this.gasNo = gas_no;
	},
	
	getAadharNo: function(){
		return this.aadharNo;
	},
	
	setAadharNo: function (aadhar_no){
        this.aadharNo = aadhar_no;
	},
	
	getGuarantorId: function(){
		return this.guarantorId;
	},
	
	setGuarantorId: function (guarantor_id){
        this.guarantorId = guarantor_id;
	},
	
	getPhoneNo: function(){
		return this.phoneNo;
	},
	
	setPhoneNo: function (phone_no){
        this.phoneNo = phone_no;
	},

	getReligion: function(){
		return this.religion;
	},
	
	setReligion: function (t_religion){
        this.religion = t_religion;
	},
	
	getCaste: function(){
		return this.caste;
	},
	
	setCaste: function (t_caste){
        this.caste = t_caste;
	},
	
	getMaritalStatus: function(){
		return this.maritalStatus;
	},
	
	setMaritalStatus: function (marital_status){
        this.maritalStatus = marital_status;
	},
	
	getEducation: function(){
		return this.education;
	},
	
	setEducation: function (t_education){
        this.education = t_education;
	},
	
	getLoanPurpose: function(){
		return this.loanPurpose;
	},
	
	setLoanPurpose: function (loan_purpose){
        this.loanPurpose = loan_purpose;
	},
	
	getAddress: function(){
		return this.address;
	},
	
	setAddress: function (t_address){
        this.address = t_address;
	},
	
	getPinCode: function(){
		return this.pinCode;
	},
	
	setPinCode: function (pin_code){
        this.pinCode = pin_code;
	},
	
	getFamilyMonthlyIncome: function(){
		return this.familyMonthlyIncome;
	},
	
	setFamilyMonthlyIncome: function (family_monthly_income){
        this.familyMonthlyIncome = family_monthly_income;
	},
	
	getFamilyMonthlyExpense: function(){
		return this.familyMonthlyExpense;
	},
	
	setFamilyMonthlyExpense: function (family_monthly_expense){
        this.familyMonthlyExpense = family_monthly_expense;
	},
	
	getHouse: function(){
		return this.house;
	},
	
	setHouse: function (t_house){
        this.house = t_house;
	},
	
	getHouseSize: function(){
		return this.houseSize;
	},
	
	setHouseSize: function (house_size){
        this.houseSize = house_size;
	},
	
	getHouseRoof: function(){
		return this.houseRoof;
	},
	
	setHouseRoof: function (house_roof){
        this.houseRoof = house_roof;
	},
	
	getHouseFloor: function(){
		return this.houseFloor;
	},
	
	setHouseFloor: function (house_floor){
        this.houseFloor = house_floor;
	},
	
	getToilet: function(){
		return this.toilet;
	},
	
	setToilet: function (t_toilet){
        this.toilet = t_toilet;
	},
	
	getVehicle: function(){
		return this.vehicle;
	},
	
	setVehicle: function (t_vehicle){
        this.vehicle = t_vehicle;
	},
	
	getBankAccount: function(){
		return this.bankAccount;
	},
	
	setBankAccount: function (bank_account){
        this.bankAccount = bank_account;
	},
	
	getSavings: function(){
		return this.savings;
	},
	
	setSavings: function (t_savings){
        this.savings = t_savings;
	},

    getLoanAmount: function(){
        return this.loan_amount;
    },

    setLoanAmount: function (t_loan_amount){
        this.loan_amount = t_loan_amount;
    },

    getEMIAmount: function(){
        return this.emi_amount;
    },

    setEMIAmount: function (t_emi_amount){
        this.emi_amount = t_emi_amount;
    },

    getFoName: function(){
        return this.fo_name;
    },

    setFoName: function (t_fo_name){
        this.fo_name = t_fo_name;
    },

	getGrtDate: function(){
		return this.grt_date;
	},

	setGrtDate: function (t_grt_date){
		this.grt_date = t_grt_date;
	},

	
	clearAll: function() {
		this.setClientId(new Array());
		this.setBranchName(new Array());
		this.setCenterName(new Array());
		this.setClientName(new Array());
		this.setDateOfBirth(new Array());
		this.setGuardianRelationship(new Array());
		this.setGuardianName(new Array());
		this.setGuardianAge(new Array());
		this.setGuarantorName(new Array());
		this.setGuarantorAge(new Array());
		this.setGuarantorRelationship(new Array());
		this.setRationCardNo(new Array());
		this.setVoterId(new Array());
		this.setGasNo(new Array());
		this.setAadharNo(new Array());
		this.setGuarantorId(new Array());
		this.setPhoneNo(new Array());
		this.setReligion(new Array());
		this.setCaste(new Array());
		this.setMaritalStatus(new Array());
		this.setEducation(new Array());
		this.setLoanPurpose(new Array());
		this.setAddress(new Array());
		this.setPinCode(new Array());
		this.setFamilyMonthlyIncome(new Array());
		this.setFamilyMonthlyExpense(new Array());
		this.setHouse(new Array());
		this.setHouseSize(new Array());
		this.setHouseRoof(new Array());
		this.setHouseFloor(new Array());
		this.setToilet(new Array());
		this.setVehicle(new Array());
		this.setBankAccount(new Array());
		this.setSavings(new Array());
        this.setFoName(new Array());
		this.setGrtDate(new Array());
	}
	
};