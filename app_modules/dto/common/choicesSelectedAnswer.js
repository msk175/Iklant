module.exports = choicesSelectedAnswer;

var age = new Array();
var educationalDetails = new Array();
var maritalStatus = new Array();
var numberOfEarnings = new Array();
var familySavings = new Array();
var currentHouseType = new Array();
var vehicleType = new Array();
var purposeOfLoan = new Array();
var bankDetails = new Array();
var lifeInsuranceDetails = new Array();
var accidentalInsuranceDetails = new Array();
var medicalInsuranceDetails = new Array();
var otherMicrofinance = new Array();
var borrowersLoanRepayment = new Array();
var noOfRegularAttendance = new Array();
var noOfIrregularAttendance = new Array();
var noOfRegularPayments = new Array();
var noOfIrregularPayments = new Array();

function choicesSelectedAnswer() {
    //this.clearAll();
}

choicesSelectedAnswer.prototype = {

	getAge: function(){
		return this.age;
	},
	
	setAge: function (c_age){
        this.age = c_age;
	},
	
	getEducationalDetails: function(){
		return this.educationalDetails;
	},
	
	setEducationalDetails: function (educational_details){
        this.educationalDetails = educational_details;
	},
	
	getMaritalStatus: function(){
		return this.maritalStatus;
	},
	
	setMaritalStatus: function (marital_status){
        this.maritalStatus = marital_status;
	},
	
	getNumberOfEarnings: function(){
		return this.numberOfEarnings;
	},
	
	setNumberOfEarnings: function (number_of_earnings){
        this.numberOfEarnings = number_of_earnings;
	},
	
	
	getFamilySavings: function(){
		return this.familySavings;
	},
	
	setFamilySavings: function (family_savings){
        this.familySavings = family_savings;
	},
	
	getCurrentHouseType: function(){
		return this.currentHouseType;
	},
	
	setCurrentHouseType: function (current_house_type){
        this.currentHouseType = current_house_type;
	},
	
	getVehicleType: function(){
		return this.vehicleType;
	},
	
	setVehicleType: function (vehicle_type){
        this.vehicleType = vehicle_type;
	},
	
	getPurposeOfLoan: function(){
		return this.purposeOfLoan;
	},
	
	setPurposeOfLoan: function (purpose_of_loan){
        this.purposeOfLoan = purpose_of_loan;
	},
	
	getBankDetails: function(){
		return this.bankDetails;
	},
	
	setBankDetails: function (bank_details){
        this.bankDetails = bank_details;
	},
	
	getLifeInsuranceDetails: function(){
		return this.lifeInsuranceDetails;
	},
	
	setLifeInsuranceDetails: function (life_insurance_details){
        this.lifeInsuranceDetails = life_insurance_details;
	},
	
	getAccidentalInsuranceDetails: function(){
		return this.accidentalInsuranceDetails;
	},
	
	setAccidentalInsuranceDetails: function (accidental_insurance_details){
        this.accidentalInsuranceDetails = accidental_insurance_details;
	},
	
	getMedicalInsuranceDetails: function(){
		return this.medicalInsuranceDetails;
	},
	
	setMedicalInsuranceDetails: function (medical_insurance_details){
        this.medicalInsuranceDetails = medical_insurance_details;
	},
	
	getOtherMicrofinance: function(){
		return this.otherMicrofinance;
	},
	
	setOtherMicrofinance: function (other_microfinance){
        this.otherMicrofinance = other_microfinance;
	},
	
	getBorrowersLoanRepayment: function(){
		return this.borrowersLoanRepayment;
	},
	
	setBorrowersLoanRepayment: function (borrowers_loan_repayment){
        this.borrowersLoanRepayment = borrowers_loan_repayment;
	},

    getNoOfRegularAttendance: function(){
        return this.noOfRegularAttendance;
    },

    setNoOfRegularAttendance: function (noOf_RegularAttendance){
        this.noOfRegularAttendance = noOf_RegularAttendance;
    },

    getNoOfIrregularAttendance: function(){
        return this.noOfIrregularAttendance;
    },

    setNoOfIrregularAttendance: function (noOf_IrregularAttendance){
        this.noOfIrregularAttendance = noOf_IrregularAttendance;
    },

    getNoOfRegularPayments: function(){
        return this.noOfRegularPayments;
    },

    setNoOfRegularPayments: function (noOf_RegularPayments){
        this.noOfRegularPayments = noOf_RegularPayments;
    },

    getNoOfIrregularPayments: function(){
        return this.noOfIrregularPayments;
    },

    setNoOfIrregularPayments: function (noOf_IrregularPayments){
        this.noOfIrregularPayments = noOf_IrregularPayments;
    },

    clearAll: function (){
		this.setAge(new Array());
		this.setEducationalDetails(new Array());
		this.setMaritalStatus(new Array());
		this.setNumberOfEarnings(new Array());
		this.setFamilySavings(new Array());
		this.setCurrentHouseType(new Array());
		this.setVehicleType(new Array());
		this.setPurposeOfLoan(new Array());
		this.setBankDetails(new Array());
		this.setLifeInsuranceDetails(new Array());
		this.setAccidentalInsuranceDetails(new Array());
		this.setMedicalInsuranceDetails(new Array());
		this.setOtherMicrofinance(new Array());
		this.setBorrowersLoanRepayment(new Array());
        this.setNoOfRegularAttendance(new Array());
        this.setNoOfIrregularAttendance(new Array());
        this.setNoOfRegularPayments(new Array());
        this.setNoOfIrregularPayments(new Array());
	}
};