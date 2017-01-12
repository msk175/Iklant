module.exports = prospectFieldVerificationForAndroid;

var client_id = new Array();
var client_address = new Array();
var ration_card_number = new Array();
var mobile_number = new Array();
var landline_number = new Array();
var voter_id = new Array();
var gas_number = new Array();
var aadhaar_number = new Array();
var other_id_name= new Array();
var other_id= new Array();
var other_id_name2= new Array();
var other_id2= new Array();
var other_id = new Array();
var guarantor_name = new Array();
var guarantor_address = new Array();
var guarantor_id = new Array();
var guarantor_relationship = new Array();
var is_bank_account = new Array();
var is_insurance_lifetime = new Array();
var household_details = new Array();
var time_period = new Array();
var house_sqft = new Array();
var vehicle_details = new Array();
var house_room_detail = new Array();
var house_type = new Array();
var house_ceiling_type = new Array();
var house_wall_type = new Array();
var house_toilet = new Array();
var house_flooring_detail = new Array();
var reinitiated_client = new Array();
var loan_count = new Array();

function prospectFieldVerificationForAndroid() {
   this.clearAll();
}

prospectFieldVerificationForAndroid.prototype = {

	getClient_id: function(){
		return this.client_id;
	},
	
	setClient_id: function (t_client_id){
        this.client_id = t_client_id;
	},

	getClient_address: function(){
		return this.client_address;
	},
	
	setClient_address: function (t_client_address){
        this.client_address = t_client_address;
	},
	
	getRation_card_number: function(){
		return this.ration_card_number;
	},
	
	setRation_card_number: function (t_ration_card_number){
        this.ration_card_number = t_ration_card_number;
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

    getVoter_id: function(){
		return this.voter_id;
	},
	
	setVoter_id: function (t_voter_id){
        this.voter_id = t_voter_id;
	},
	
	getGas_number: function(){
		return this.gas_number;
	},
	
	setGas_number: function (t_gas_number){
        this.gas_number = t_gas_number;
	},

	getAadhaar_number: function(){
		return this.aadhaar_number;
	},
	
	setAadhaar_number: function (t_aadhaar_number){
        this.aadhaar_number = t_aadhaar_number;
	},

    //otherIdName getter & setter
    getOther_id_name: function(){

        return this.other_id_name;
    },

    setOther_id_name: function (t_other_id_name){
        this.other_id_name = t_other_id_name;
    },

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

    getGuarantor_name: function(){
		return this.guarantor_name;
	},
	
	setGuarantor_name: function (t_guarantor_name){
        this.guarantor_name = t_guarantor_name;
	},

	getGuarantor_address: function(){
		return this.guarantor_address;
	},
	
	setGuarantor_address: function (t_guarantor_address){
        this.guarantor_address = t_guarantor_address;
	},

	getGuarantor_id: function(){
		return this.guarantor_id;
	},
	
	setGuarantor_id: function (t_guarantor_id){
        this.guarantor_id = t_guarantor_id;
	},
	
	getGuarantor_relationship: function(){
		return this.guarantor_relationship;
	},
	
	setGuarantor_relationship: function (t_guarantor_relationship){
        this.guarantor_relationship = t_guarantor_relationship;
	},

	getIs_bank_account: function(){
		return this.is_bank_account;
	},
	
	setIs_bank_account: function (t_is_bank_account){
        this.is_bank_account = t_is_bank_account;
	},
	
	getIs_insurance_lifetime: function(){
		return this.is_insurance_lifetime;
	},
	
	setIs_insurance_lifetime: function (t_is_insurance_lifetime){
        this.is_insurance_lifetime = t_is_insurance_lifetime;
	},
		
	getHousehold_details: function(){
		return this.household_details;
	},
	
	setHousehold_details: function (t_household_details){
        this.household_details = t_household_details;
	},
	
	getTime_period: function(){
		return this.time_period;
	},
	
	setTime_period: function (t_time_period){
        this.time_period = t_time_period;
	},
	
	getHouse_sqft: function(){
		return this.house_sqft;
	},
	
	setHouse_sqft: function (t_house_sqft){
        this.house_sqft = t_house_sqft;
	},
	
	getVehicle_details: function(){
		return this.vehicle_details;
	},
	
	setVehicle_details: function (t_vehicle_details){
        this.vehicle_details = t_vehicle_details;
	},

	getHouse_room_detail: function(){
		return this.house_room_detail;
	},
	
	setHouse_room_detail: function (t_house_room_detail){
        this.house_room_detail = t_house_room_detail;
	},
	
	getHouse_type: function(){
		return this.house_type;
	},
	
	setHouse_type: function (t_house_type){
        this.house_type = t_house_type;
	},
	
	getHouse_ceiling_type: function(){
		return this.house_ceiling_type;
	},
	
	setHouse_ceiling_type: function (t_house_ceiling_type){
        this.house_ceiling_type = t_house_ceiling_type;
	},
	
	getHouse_wall_type: function(){
		return this.house_wall_type;
	},
	
	setHouse_wall_type: function (t_house_wall_type){
        this.house_wall_type = t_house_wall_type;
	},

	getHouse_toilet: function(){
		return this.house_toilet;
	},
	
	setHouse_toilet: function (t_house_toilet){
        this.house_toilet = t_house_toilet;
	},
	
	getHouse_flooring_detail: function(){
		return this.house_flooring_detail;
	},
	
	setHouse_flooring_detail: function (t_house_flooring_detail){
        this.house_flooring_detail = t_house_flooring_detail;
	},

    getReinitiated_client: function(){
        return this.reinitiated_client;
    },

    setReinitiated_client: function (t_reinitiated_client){
        this.reinitiated_client = t_reinitiated_client;
    },

    getLoan_count: function(){
        return this.loan_count;
    },

    setLoan_count: function (t_loan_count){
        this.loan_count = t_loan_count;
    },


    clearAll: function() {
		this.setClient_id("");
		this.setClient_address("");
		this.setRation_card_number("");
        this.setMobile_number("");
        this.setLandLine_number("");
        this.setVoter_id("");
		this.setGas_number("");
		this.setAadhaar_number("");
        this.setOther_id_name("");
        this.setOther_id("");
        this.setOther_id_name2("");
        this.setOther_id2("");
        this.setGuarantor_name("");
		this.setGuarantor_address("");
		this.setGuarantor_id("");
		this.setGuarantor_relationship("");
		this.setIs_bank_account("");
		this.setIs_insurance_lifetime("");
		this.setHousehold_details("");
		this.setTime_period("");
		this.setHouse_sqft("");
		this.setVehicle_details("");
		this.setHouse_room_detail("");
		this.setHouse_type("");
		this.setHouse_ceiling_type("");
		this.setHouse_wall_type("");
		this.setHouse_toilet("");
		this.setHouse_flooring_detail("");
        this.setReinitiated_client(new Array());
        this.setLoan_count(new Array());
    }
};