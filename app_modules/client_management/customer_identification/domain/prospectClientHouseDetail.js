module.exports = prospect_client_house_detail;

var house_detail_id;
var client_id;
var house_type;
var contact_number;
var time_period;
var house_sqft;
var household_details;
var vehicle_details;
var house_ceiling_type;
var house_wall_type;
var house_flooring_detail;
var house_room_detail;
var house_toilet;



function prospect_client_house_detail() {
    this.clearAll();
}

prospect_client_house_detail.prototype = {
	
	
	//house_detail_id getter & setter
	getHouse_detail_id: function(){
		
		return this.house_detail_id;
	},
	
	setHouse_detail_id: function (houseDetailId){
        this.house_detail_id = houseDetailId;
	},
	
	
	//client_id getter & setter
	getClient_id: function(){
		
		return this.client_id;
	},
	
	setClient_id: function (ClientId){
        this.client_id = ClientId;
	},
	
	
	//house_type getter & setter
	getHouse_type: function(){
		
		return this.house_type;
	},
	
	setHouse_type: function (houseType){
        this.house_type = houseType;
	},
	
	
	//contact_number getter & setter
	getContact_number: function(){
		
		return this.contact_number;
	},
	
	setContact_number: function (ContactNumber){
        this.contact_number = ContactNumber;
	},
	
	
	//time_period getter & setter
	getTime_period: function(){
		
		return this.time_period;
	},
	
	setTime_period: function (t_timePeriod){
        this.time_period = t_timePeriod;
	},
	
	
	//house_sqft getter & setter
	getHouse_sqft: function(){
		
		return this.house_sqft;
	},
	
	setHouse_sqft: function (houseSqft){
        this.house_sqft = houseSqft;
	},
	
	
	//household_details getter & setter
	getHousehold_details: function(){
		
		return this.household_details;
	},
	
	setHousehold_details: function (householdDetails){
        this.household_details = householdDetails;
	},
	
	
	//vehicle_details getter & setter
	getVehicle_details: function(){
		
		return this.vehicle_details;
	},
	
	setVehicle_details: function (vehicleDetails){
        this.vehicle_details = vehicleDetails;
	},
	
	
	//house_ceiling_type getter & setter
	getHouse_ceiling_type: function(){
	
		return this.house_ceiling_type;
	},
	
	setHouse_ceiling_type: function (houseCeilingType){
        this.house_ceiling_type = houseCeilingType;
	},
	
	
	//house_wall_type getter & setter
	getHouse_wall_type: function(){
	
		return this.house_wall_type;
	},
	
	setHouse_wall_type: function (houseWallType){
        this.house_wall_type = houseWallType;
	},
	
	
	//house_flooring_detail getter & setter
	getHouse_flooring_detail: function(){
		
		return this.house_flooring_detail;
	},
	
	setHouse_flooring_detail: function (houseFlooringDetail){
        this.house_flooring_detail = houseFlooringDetail;
	},
	
	
	//house_room_detail getter & setter
	getHouse_room_detail: function(){
	
		return this.house_room_detail;
	},
	
	setHouse_room_detail: function (houseRoomDetail){
        this.house_room_detail = houseRoomDetail;
	},
	
	
	//house_toilet getter & setter
	getHouse_toilet: function(){
	
		return this.house_toilet;
	},
	
	setHouse_toilet: function (houseToilet){
        this.house_toilet = houseToilet;
	},
	clearAll : function(){
        this.setHouse_detail_id("");
		this.setClient_id("");
        this.setHouse_type('');
        this.setTime_period('');
        this.setHouse_sqft('');
        this.setHousehold_details('');
        this.setVehicle_details('');
        this.setHouse_ceiling_type('');
        this.setHouse_wall_type('');
        this.setHouse_flooring_detail('');
        this.setHouse_room_detail('');
        this.setHouse_toilet("");
    }
		
};