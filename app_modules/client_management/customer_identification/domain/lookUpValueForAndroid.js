module.exports = lookUpValueForAndroid;

var entity_id = new Array();
var lookup_id = new Array();
var lookup_value = new Array();
	

function lookUpValueForAndroid() {	
     //this.clearAll();
}

lookUpValueForAndroid.prototype = {

	getEntity_id: function(){
		return this.entity_id;
	},
	
	setEntity_id: function (t_entity_id){
        this.entity_id = t_entity_id;
	},
	
	getLookup_id: function(){
		return this.lookup_id;
	},
	
	setLookup_id: function (t_lookup_id){
        this.lookup_id = t_lookup_id;
	},
	
	getLookup_value: function(){
		return this.lookup_value;
	},
	
	setLookup_value: function (t_lookup_value){
        this.lookup_value = t_lookup_value;
	},
	clearAll: function() {
		this.setEntity_id(new Array());
		this.setLookup_id(new Array());
		this.setLookup_value(new Array());
	}
	
};