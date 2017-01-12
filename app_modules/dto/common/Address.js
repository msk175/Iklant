module.exports = Address ;

var line1;
var line2;
var line3;
var city;
var state;
var country;
var zip;
var phoneNumber;
var phoneNumberStripped;


function Address() {
   //this.clearAll();
}

Address.prototype = {

	getLine1: function(){
		return this.line1;
	},
	
	setLine1: function (t_line1){
		this.line1 = t_line1;
	},

	getLine2: function(){
		return this.line2;
	},
	
	setLine2: function (t_line2){
		this.line2 = t_line2;
	},

	getLine3: function(){
		return this.line3;
	},
	
	setLine3: function (t_line3){
		this.line3 = t_line3;
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

	getCountry: function(){
		return this.country;
	},
	
	setCountry: function (t_country){
		this.country = t_country;
	},

	getZip: function(){
		return this.zip;
	},
	
	setZip: function (t_zip){
		this.zip = t_zip;
	},

	getPhoneNumber: function(){
		return this.phoneNumber;
	},
	
	setPhoneNumber: function (t_phoneNumber){
		this.phoneNumber = t_phoneNumber;
	},

	getPhoneNumberStripped: function(){
		return this.phoneNumberStripped;
	},
	
	setPhoneNumberStripped: function (t_phoneNumberStripped){
		this.phoneNumberStripped = t_phoneNumberStripped;
	},

    clearAll: function(){
       this.setLine1("");
       this.setLine2("");
       this.setLine3("");
       this.setCity("");
       this.setState("");
       this.setCountry("");
       this.setZip("");
       this.setPhoneNumber("");
       this.setPhoneNumberStripped("");
    }

}