module.exports = prospectClientGuarantor;

var prospectClientGuarantorId;
var clientId;
var guarantorName;
var guarantorDob;
var guarantorRelationship;
var guarantorAddress;
var guarantorId;
var otherGuarantorRelationshipName = "";

function prospectClientGuarantor() {
    this.clearAll();
}

prospectClientGuarantor.prototype = {

	getProspectClientGuarantorId: function(){
		return this.prospectClientGuarantorId;
	},
	setProspectClientGuarantorId: function (prospect_client_guarantor_id){
        this.prospectClientGuarantorId = prospect_client_guarantor_id;
	},
	
	getClientId: function(){
		return this.clientId;
	},
	setClientId: function (client_id){
        this.clientId = client_id;
	},
	
	getGuarantorName: function(){
		return this.guarantorName;
	},
	setGuarantorName: function (guarantor_name){
        this.guarantorName = guarantor_name;
	},
	
	getGuarantorDob: function(){
		return this.guarantorDob;
	},
	setGuarantorDob: function (guarantor_dob){
        this.guarantorDob = guarantor_dob;
	},
	
	getGuarantorRelationship: function(){
		return this.guarantorRelationship;
	},
	setGuarantorRelationship: function (guarantor_relationship){
        this.guarantorRelationship = guarantor_relationship;
	},
	
	getGuarantorAddress: function(){
		return this.guarantorAddress;
	},
	setGuarantorAddress: function (guarantor_address){
        this.guarantorAddress = guarantor_address;
	},
	getGuarantorId: function(){
		return this.guarantorId;
	},
	setGuarantorId: function (guarantor_Id){
        this. guarantorId = guarantor_Id;
	},
    getOtherGuarantorRelationshipName: function(){
        return this.otherGuarantorRelationshipName;
    },
    setOtherGuarantorRelationshipName: function (other_GuarantorRelationshipName){
        this.otherGuarantorRelationshipName = other_GuarantorRelationshipName;
    },

    clearAll: function(){
        this.setProspectClientGuarantorId("");
        this.setClientId("");
        this.setGuarantorName("");
        this.setGuarantorDob("")
        this.setGuarantorAddress("");
        this.setGuarantorId("");
        this.setGuarantorRelationship("");
        this.setOtherGuarantorRelationshipName("");
    }

};