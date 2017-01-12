module.exports = FutureLoansRequestHolder;

var officeId;
var userId;
var requestedDate;

function FutureLoansRequestHolder() {
  //this.clearAll();
}

FutureLoansRequestHolder.prototype = {

	getOfficeId: function(){
		return this.officeId;
	},
	
	setOfficeId: function (office_id){
		this.officeId = office_id;
	},

	getUserId: function(){
		return this.userId;
	},
	
	setUserId: function (user_id){
		this.userId = user_id;
	},
	
	getRequestedDate: function(){
		return this.requestedDate;
	},
	
	setRequestedDate: function (requested_date){
		this.requestedDate = requested_date;
	},

    clearAll: function(){
        this.setOfficeId("");
        this.setUserId("");
        this.setRequestedDate("");
    }
};