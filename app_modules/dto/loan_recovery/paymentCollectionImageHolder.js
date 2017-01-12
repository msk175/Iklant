module.exports = paymentCollectionImageHolder;

var officeId;
var personnelId;
var roleId;
var searchString;

function paymentCollectionImageHolder() {	
  //this.clearAll();
}

paymentCollectionImageHolder.prototype = {

	getOfficeId: function(){
		return this.officeId;
	},
	setOfficeId: function (office_id){
		this.officeId = office_id;
	},
	getPersonnelId : function(){
		return this.personnelId;
	},
	setPersonnelId: function (t_personnelId){
		this.personnelId = t_personnelId;
	},
	getRoleId : function(){
		return this.roleId;
	},
	setRoleId: function (t_roleId){
		this.roleId = t_roleId;
	},
	getSearchString : function(){
		return this.searchString;
	},
	setSearchString: function (t_searchString){
		this.searchString = t_searchString;
	},

    clearAll: function(){
       this.setOfficeId("");
       this.setPersonnelId("");
       this.setRoleId("");
       this.setSearchString("");
    }
};