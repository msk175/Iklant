module.exports = prospectClientFamilyFetch;

var client_id = new Array();
var member_name = new Array();
var member_gender= new Array();
var member_relationship= new Array();
var member_dob= new Array();
var member_education= new Array();
var member_occupation= new Array();
var member_income= new Array();
var member_otherRelationshipName=new Array();


function prospectClientFamilyFetch() {
    this.clearAll();
}

prospectClientFamilyFetch.prototype = {
	
	
	//client_id getter & setter
	getClient_id: function(){
		return this.client_id;
	},
	
	setClient_id: function (ClientId){
        this.client_id = ClientId;
	},
	
	
	//member_name getter & setter
	getMember_name: function(){
		return this.member_name;
	},
	
	setMember_name: function (memberName){
        this.member_name = memberName;
	},
	
	
	//member_gender getter & setter
	getMember_gender: function(){
		return this.member_gender;
	},
	
	setMember_gender: function (memberGender){
        this.member_gender = memberGender;
	},
	
	
	//member_relationship getter & setter
	getMember_relationship: function(){
		return this.member_relationship;
	},
	
	setMember_relationship: function (memberRelationship){
        this.member_relationship = memberRelationship;
	},
	
	
	//member_dob getter & setter
	getMember_dob: function(){
		return this.member_dob;
	},
	
	setMember_dob: function (memberDOB){
        this.member_dob = memberDOB;
	},
	
	
	//member_education getter & setter
	getMember_education: function(){
		return this.member_education;
	},
	
	setMember_education: function (memberEducation){
        this.member_education = memberEducation;
	},
	
	
	//member_occupation getter & setter
	getMember_occupation: function(){
		return this.member_occupation;
	},
	
	setMember_occupation: function (memberOccupation){
        this.member_occupation = memberOccupation;
	},
	
	
	//member_income getter & setter
	getMember_income: function(){
		return this.member_income;
	},
	
	setMember_income: function (memberIncome){
        this.member_income = memberIncome;
	},
    //other Relation ship name
    getMemberRelationshipName: function(){
        return this.member_otherRelationshipName;
    },

    setMemberRelationshipName: function (memberRelaionshipName){
        this.member_otherRelationshipName = memberRelaionshipName;
    },
	
		
	
	clearAll: function() {
		this.setClient_id("");
		this.setMember_name("");
		this.setMember_gender("");
		this.setMember_relationship("");
		this.setMember_dob("");
		this.setMember_education("");
		this.setMember_occupation("");
		this.setMember_income("");
        this.setMemberRelationshipName("");
	}
		
};