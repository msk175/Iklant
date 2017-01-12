module.exports = fieldVerification;

var field_verification_id;
var client_id;
var client_address_matched = 0;
var rc_number_matched = 0;
var phone_number_matched = 0;
var id_proof = 0;
var guarantor_address_matched = 0;
var guarantor_relationship_matched = 0;
var is_GuarantorIdProof_Matched = 0;
var house_details_matched = 0;
var bank_details_matched = 0;
var insurance_details_matched = 0;
var remarks;
var Is_GuarantorAddressProofId = 0;
var GuarantorAddressProofId;
var Is_GuarantorProofId_provided = 0;
var GuarantorProofId;
var Is_ClientAddressProofId = 0;
var ClientAddressProofId;
var Is_ClientProofId_provided = 0;
var ClientProofId;
var groupName = '';

// Dhinakaran
var Is_OtherId1_provided = 0;
var Is_OtherId2_provided = 0;

// Chitra
var loanCounter;
function fieldVerification() {
    //this.clearAll();
}

fieldVerification.prototype = {
	
	getField_verification_id : function(){
		return this.field_verification_id;
	},
	
	setField_verification_id : function (field_verification_id){
		this.field_verification_id = field_verification_id;
	},
	
	getClient_id : function(){
		return this.client_id;
	},
	setClient_id : function (t_client_id){
		this.client_id = t_client_id;
	},
	
	getClient_address_matched : function(){
		return this.client_address_matched;
	},
	
	setClient_address_matched : function (t_client_address_matched){
		this.client_address_matched = t_client_address_matched;
	},
	
	getRc_number_matched : function(){
		return this.rc_number_matched;
	},
	
	setRc_number_matched : function (t_rc_number_matched){
		
		this.rc_number_matched = t_rc_number_matched;
	},
	
	getPhone_number_matched : function(){
		return this.phone_number_matched;
	},
	
	setPhone_number_matched : function (t_phone_number_matched){
		
		this.phone_number_matched = t_phone_number_matched;
	},
	
	getGuarantor_address_matched : function(){
		return this.guarantor_address_matched;
	},
	setGuarantor_address_matched : function (t_guarantor_address_matched){
		this.guarantor_address_matched = t_guarantor_address_matched;
	},
	setId_proof_matched : function (t_id_proof){
		this.id_proof = t_id_proof;
	},
	getId_proof_matched : function(){
		return this.id_proof;
	},
	getGuarantor_relationship_matched : function(){
		return this.guarantor_relationship_matched;
	},
	setGuarantor_relationship_matched : function (t_guarantor_relationship_matched){
		this.guarantor_relationship_matched = t_guarantor_relationship_matched;
	},
	setIs_GuarantorIdProof_Matched : function (t_is_GuarantorIdProof_Matched){
		this.is_GuarantorIdProof_Matched = t_is_GuarantorIdProof_Matched;
	},
	getIs_GuarantorIdProof_Matched : function(){
		return this.is_GuarantorIdProof_Matched;
	},
	
	
	getHouse_details_matched : function(){
		return this.house_details_matched;
	},
	setHouse_details_matched : function (t_house_details_matched){
		this.house_details_matched = t_house_details_matched;
	},
	
	getBank_details_matched : function(){
		
		return this.bank_details_matched;
	},
	
	setBank_details_matched : function (t_bank_details_matched){
		
		this.bank_details_matched = t_bank_details_matched;
	},
	
	getInsurance_details_matched : function(){
		return this.insurance_details_matched;
	},
	
	setInsurance_details_matched : function (t_insurance_details_matched){
	
		this.insurance_details_matched = t_insurance_details_matched;
	},
	
	getRemarks : function(){
		return this.remarks;
	},
	
	setRemarks : function (t_remarks){
		this.remarks = t_remarks;
	},
	
	setGuarantorProofId : function (t_GuarantorProofId){
		this.GuarantorProofId = t_GuarantorProofId;
	},
	
	getGuarantorProofId : function(){
		return this.GuarantorProofId;
	},
	
	setIs_GuarantorProofId_provided : function (t_Is_GuarantorProofId_provided){
		this.Is_GuarantorProofId_provided = t_Is_GuarantorProofId_provided;
	},
	
	getIs_GuarantorProofId_provided : function(){
		return this.Is_GuarantorProofId_provided;
	},
	setGuarantorAddressProofId : function (t_GuarantorAddressProofId){
		this.GuarantorAddressProofId = t_GuarantorAddressProofId;
	},
	
	getGuarantorAddressProofId : function(){
		return this.GuarantorAddressProofId;
	},
	
	setIs_GuarantorAddressProofId_provided : function (t_IsGuarantorAddressProofId){
		this.Is_GuarantorAddressProofId = t_IsGuarantorAddressProofId;
	},
	
	getIs_GuarantorAddressProofId_provided : function(){
		return this.Is_GuarantorAddressProofId;
	},
	setClientProofId : function (t_ClientProofId){
		this.ClientProofId = t_ClientProofId;
	},
	
	getClientProofId : function(){
		return this.ClientProofId;
	},
	
	setIs_ClientProofId_provided : function (t_Is_ClientProofId_provided){
		this.Is_ClientProofId_provided = t_Is_ClientProofId_provided;
	},
	
	getIs_ClientProofId_provided : function(){
		return this.Is_ClientProofId_provided;
	},
	setClientAddressProofId : function (t_ClientAddressProofId){
		this.ClientAddressProofId = t_ClientAddressProofId;
	},
	
	getClientAddressProofId : function(){
		return this.ClientAddressProofId;
	},
	
	setIs_ClientAddressProofId_provided : function (t_IsClientAddressProofId){
		this.Is_ClientAddressProofId = t_IsClientAddressProofId;
	},
	
	getIs_ClientAddressProofId_provided : function(){
		return this.Is_ClientAddressProofId;
	},
	
	
	setGroupName : function (t_groupName){
		this.groupName = t_groupName;
	},
	
	getGroupName : function(){
		return this.groupName;
	},

    setIs_OtherId1_provided : function (t_Is_OtherId1_provided){
        this.Is_OtherId1_provided = t_Is_OtherId1_provided;
    },

    getIs_OtherId1_provided : function(){
        return this.Is_OtherId1_provided;
    },

    setIs_OtherId2_provided : function (t_Is_OtherId2_provided){
        this.Is_OtherId2_provided = t_Is_OtherId2_provided;
    },

    getIs_OtherId2_provided : function(){
        return this.Is_OtherId2_provided;
    },

    setLoanCounter : function (t_loanCounter){
        this.loanCounter = t_loanCounter;
    },

    getLoanCounter : function(){
        return this.loanCounter;
    },

	clearAll : function() {
        this.setField_verification_id("");
        this.setClient_id('');
        this.setClient_address_matched(0);
        this.setRc_number_matched(0);
        this.setPhone_number_matched(0);
        this.setId_proof_matched(0);
        this.setGuarantor_address_matched(0);
        this.setGuarantor_relationship_matched(0);
        this.setIs_GuarantorIdProof_Matched(0);
        this.setHouse_details_matched(0);
        this.setBank_details_matched(0);
        this.setInsurance_details_matched(0);
        this.setRemarks('');
        this.setIs_GuarantorAddressProofId_provided(0);
        this.setGuarantorAddressProofId('');
        this.setGuarantorProofId('');
        this.setIs_GuarantorProofId_provided(0);
        this.setIs_ClientAddressProofId_provided(0);
        this.setIs_ClientProofId_provided(0);
		this.setClientAddressProofId('');
		this.setClientProofId('');
        this.setGroupName("");
        this.setIs_OtherId1_provided(0);
        this.setIs_OtherId2_provided(0);
	}
};