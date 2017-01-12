module.exports = ValueListElement;

function ValueListElement() {	
  //this.clearAll();
}

var id;
var name;

ValueListElement.prototype = {

	getId: function(){
		return this.Id;
	},
	
	setId: function (t_Id){
		this.Id = t_Id;
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



