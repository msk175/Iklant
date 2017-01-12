module.exports = PersonnelDto;

function PersonnelDto() {	
    //this.clearAll();
}

var personnelId;
var displayName;

PersonnelDto.prototype = {

	getPersonnelId: function(){
		return this.personnelId;
	},
	
	setPersonnelId: function (t_personnelId){
		this.personnelId = t_personnelId;
	},

	getDisplayName: function(){
		return this.displayName;
	},
	
	setDisplayName: function (t_displayName){
		this.displayName = t_displayName;
	},

    clearAll: function(){
        this.setPersonnelId("");
        this.setDisplayName("");
    }
}
