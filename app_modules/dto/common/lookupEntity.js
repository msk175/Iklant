module.exports = lookupEntity;

var gender = new Array();
var genderName = new Array();
var maritalStatus = new Array();
var maritalStatusName = new Array();
var nationality = new Array();
var nationalityName = new Array();
var religion = new Array();
var religionName = new Array();
var caste = new Array();
var casteName = new Array();
var educationalDetails = new Array();
var educationalDetailsName = new Array();
var loanPurpose = new Array();
var loanPurposeName = new Array();
var relationship = new Array();
var relationshipName = new Array();
var familyRelationship = new Array();
var familyRelationshipName = new Array();
var guarantorRelationship = new Array();
var guarantorRelationshipName = new Array();
var occupation = new Array();
var occupationName = new Array();
var house = new Array();
var houseName = new Array();
var houseCeiling = new Array();
var houseCeilingName = new Array();
var houseWall = new Array();
var houseWallName = new Array();
var houseFloor = new Array();
var houseFloorName = new Array();
var houseToilet = new Array();
var houseToiletName = new Array();
var repaymentTrackRecord = new Array();
var businessCategory = new Array();
var businessCategoryName = new Array();


function lookupEntity() {	
      this.clearAll();
}
lookupEntity.prototype = {

	//id
	getGender: function(){
		return this.gender;
	},
	
	setGender: function (t_gender){
        this.gender = t_gender;
	},
	
	//name
	getGenderName: function(){
		return this.genderName;
	},
	
	setGenderName: function (t_genderName){
        this.genderName = t_genderName;
	},
	
	//id	
	getMaritalStatus: function(){
		return this.maritalStatus;
	},
	
	setMaritalStatus: function (t_maritalStatus){
        this.maritalStatus = t_maritalStatus;
	},
	
	//name
	getMaritalStatusName: function(){
		return this.maritalStatusName;
	},
	
	setMaritalStatusName: function (t_maritalStatusName){
        this.maritalStatusName = t_maritalStatusName;
	},
	
	//id
	getNationality: function(){
		return this.nationality;
	},
	
	setNationality: function (t_nationality){
        this.nationality = t_nationality;
	},
	
	//Name
	getNationalityName: function(){
		return this.nationalityName;
	},
	
	setNationalityName: function (t_nationalityName){
        this.nationalityName = t_nationalityName;
	},
	
	
	//id
	getReligion: function(){
		return this.religion;
	},
	
	setReligion: function (t_religion){
        this.religion = t_religion;
	},
	
	//Name
	getReligionName: function(){
		return this.religionName;
	},
	
	setReligionName: function (t_religionName){
        this.religionName = t_religionName;
	},
	
	//id
	getCaste: function(){
		return this.caste;
	},
	
	setCaste: function (t_caste){
        this.caste = t_caste;
	},
	
	//Name
	getCasteName: function(){
		return this.casteName;
	},
	
	setCasteName: function (t_casteName){
        this.casteName = t_casteName;
	},
	
	
	//id
	getEducationalDetails: function(){
		return this.educationalDetails;
	},
	
	setEducationalDetails: function (t_educationalDetails){
        this.educationalDetails = t_educationalDetails;
	},
	
	//Name
	getEducationalDetailsName: function(){
		return this.educationalDetailsName;
	},
	
	setEducationalDetailsName: function (t_educationalDetailsName){
        this.educationalDetailsName = t_educationalDetailsName;
	},
	
	//id
	getLoanPurpose: function(){
		return this.loanPurpose;
	},
	
	setLoanPurpose: function (t_loanPurpose){
        this.loanPurpose = t_loanPurpose;
	},
	
	//Name
	getLoanPurposeName: function(){
		return this.loanPurposeName;
	},
	
	setLoanPurposeName: function (t_loanPurposeName){
        this.loanPurposeName = t_loanPurposeName;
	},
	
	//id
	getRelationship: function(){
		return this.relationship;
	},
	
	setRelationship: function (t_relationship){
        this.relationship = t_relationship;
	},
	
	//Name
	getRelationshipName: function(){
		return this.relationshipName;
	},
	
	setRelationshipName: function (t_relationshipName){
        this.relationshipName = t_relationshipName;
	},
	
	//id
	getFamilyRelationship: function(){
		return this.familyRelationship;
	},
	
	setFamilyRelationship: function (t_familyRelationship){
        this.familyRelationship = t_familyRelationship;
	},
	
	//Name
	getFamilyRelationshipName: function(){
		return this.familyRelationshipName;
	},
	
	setFamilyRelationshipName: function (t_familyRelationshipName){
        this.familyRelationshipName = t_familyRelationshipName;
	},
	
	//id
	getGuarantorRelationship: function(){
		return this.guarantorRelationship;
	},
	
	setGuarantorRelationship: function (t_guarantorRelationship){
        this.guarantorRelationship = t_guarantorRelationship;
	},
	
	//Name
	getGuarantorRelationshipName: function(){
		return this.guarantorRelationshipName;
	},
	
	setGuarantorRelationshipName: function (t_guarantorRelationshipName){
        this.guarantorRelationshipName = t_guarantorRelationshipName;
	},
	

	//id
	getOccupation: function(){
		return this.occupation;
	},
	
	setOccupation: function (t_occupation){
        this.occupation = t_occupation;
	},
	
	//Name
	getOccupationName: function(){
		return this.occupationName;
	},
	
	setOccupationName: function (t_occupationName){
        this.occupationName = t_occupationName;
	},
	
	
	//id
	getHouse: function(){
		return this.house;
	},
	
	setHouse: function (t_house){
        this.house = t_house;
	},
	
	//Name
	getHouseName: function(){
		return this.houseName;
	},
	
	setHouseName: function (t_houseName){
        this.houseName = t_houseName;
	},
	
	//id
	getHouseCeiling: function(){
		return this.houseCeiling;
	},
	
	setHouseCeiling: function (t_houseCeiling){
        this.houseCeiling = t_houseCeiling;
	},
	
	//Name
	getHouseCeilingName: function(){
		return this.houseCeilingName;
	},
	
	setHouseCeilingName: function (t_houseCeilingName){
        this.houseCeilingName = t_houseCeilingName;
	},
	
	
	//id
	getHouseWall: function(){
		return this.houseWall;
	},
	
	setHouseWall: function (t_houseWall){
        this.houseWall = t_houseWall;
	},
	
	//Name
	getHouseWallName: function(){
		return this.houseWallName;
	},
	
	setHouseWallName: function (t_houseWallName){
        this.houseWallName = t_houseWallName;
	},
	
	
	//id
	getHouseFloor: function(){
		return this.houseFloor;
	},
	
	setHouseFloor: function (t_houseFloor){
        this.houseFloor = t_houseFloor;
	},
		
	//Name
	getHouseFloorName: function(){
		return this.houseFloorName;
	},
	
	setHouseFloorName: function (t_houseFloorName){
        this.houseFloorName = t_houseFloorName;
	},
	
	//id
	getHouseToilet: function(){
		return this.houseToilet;
	},
	
	setHouseToilet: function (t_houseToilet){
        this.houseToilet = t_houseToilet;
	},
	
	//Name
	getHouseToiletName: function(){
		return this.houseToiletName;
	},
	
	setHouseToiletName: function (t_houseToiletName){
        this.houseToiletName = t_houseToiletName;
	},
	
	//id
	getRepaymentTrackRecord: function(){
		return this.repaymentTrackRecord;
	},
	
	setRepaymentTrackRecord: function (t_repaymentTrackRecord){
        this.repaymentTrackRecord = t_repaymentTrackRecord;
	},
	//Name
	getRepaymentTrackRecordName: function(){
		return this.repaymentTrackRecordName;
	},
	
	setRepaymentTrackRecordName: function (t_repaymentTrackRecordName){
        this.repaymentTrackRecordName = t_repaymentTrackRecordName;
	},

    getBusinessCategory: function(){
        return this.businessCategory;
    },

    setBusinessCategory: function (t_businessCategory){
        this.businessCategory = t_businessCategory;
    },

    getBusinessCategoryName: function(){
        return this.businessCategoryName;
    },

    setBusinessCategoryName: function (t_businessCategoryName){
        this.businessCategoryName = t_businessCategoryName;
    },

	clearAll: function() {
		this.setGender(new Array());
		this.setGenderName(new Array());
		this.setMaritalStatus(new Array());
		this.setMaritalStatusName(new Array());
		this.setNationality(new Array());
		this.setNationalityName(new Array());
		this.setReligion(new Array());
		this.setReligionName(new Array());
		this.setCaste(new Array());
		this.setCasteName(new Array());
		this.setEducationalDetails(new Array());
		this.setEducationalDetailsName(new Array());
		this.setLoanPurpose(new Array());
		this.setLoanPurposeName(new Array());
		this.setRelationship(new Array());
		this.setRelationshipName(new Array());
		this.setFamilyRelationship(new Array());
		this.setFamilyRelationshipName(new Array());
		this.setGuarantorRelationship(new Array());
		this.setGuarantorRelationshipName(new Array());
		this.setOccupation(new Array());
		this.setOccupationName(new Array());
		this.setHouse(new Array());
		this.setHouseName(new Array());
		this.setHouseCeiling(new Array());
		this.setHouseCeilingName(new Array());
		this.setHouseWall(new Array());
		this.setHouseWallName(new Array());
		this.setHouseFloor(new Array());
		this.setHouseFloorName(new Array());
		this.setHouseToilet(new Array());
		this.setHouseToiletName(new Array());
		this.setRepaymentTrackRecord(new Array());
		this.setRepaymentTrackRecordName(new Array());
        this.setBusinessCategory(new Array());
        this.setBusinessCategoryName(new Array());
	}

};