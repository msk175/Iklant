module.exports = OfficeDto;

function OfficeDto() {	
   //this.clearAll();
}

var id;
var name;


OfficeDto.prototype = {

	getId: function(){
		return this.id;
	},
	
	setId: function (t_id){
		this.id = t_id;
	},

	getName: function(){
		return this.name;
	},
	
	setName: function (t_name){
		this.name = t_name;
	},
    clearAll: function(){
        this.setId("");
        this.setName("");
    }

}