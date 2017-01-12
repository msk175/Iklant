module.exports = lookUpEntityForAndroid;

var entity_id = new Array();
var entity_name = new Array();
	

function lookUpEntityForAndroid() {	
    //this.clearAll();
}

lookUpEntityForAndroid.prototype = {

	getEntity_id: function(){
		return this.entity_id;
	},
	
	setEntity_id: function (t_entity_id){
        this.entity_id = t_entity_id;
	},
	
	getEntity_name: function(){
		return this.entity_name;
	},
	
	setEntity_name: function (t_entity_name){
        this.entity_name = t_entity_name;
	},
	
	clearAll: function() {
		this.setEntity_id(new Array());
		this.setEntity_name(new Array());
	}
	
};