module.exports = GroupCreationDetail ;

function GroupCreationDetail() {	

}
var displayName;
var externalId;
var loanOfficerId;
var customerStatus;
var trained;
var trainedOn;
var mfiJoiningDate;
var activationDate;
var parentSystemId;
var officeId;
var line1;
var line2;
var line3;
var city;
var state;
var country;
var zip;
var phoneNumber;
var dayNumber;
var recurAfter;
var meetingPlace;
var recurrenceType;
var customClientCreationDetail;
var groupId;
var meetingTime;
var loanCounter;
var mifosCustomerId;
var rejectedClientsId = new Array();
var customerCustomNumber;

GroupCreationDetail.prototype = {
	
	getCustomerCustomNumber: function(){
        return this.customerCustomNumber;
    },
    setCustomerCustomNumber: function (t_customerCustomNumber){
        this.customerCustomNumber = t_customerCustomNumber;
    },
	
    getCustomClientCreationDetail: function(){
        return this.customClientCreationDetail;
    },
    setCustomClientCreationDetail: function (t_customClientCreationDetail){
        this.customClientCreationDetail = t_customClientCreationDetail;
    },
	getDisplayName: function(){
		return this.displayName;
	},
	
	setDisplayName: function (t_displayName){
		this.displayName = t_displayName;
	},
	
	getExternalId: function(){
		return this.externalId;
	},
	
	setExternalId: function (t_externalId){
		this.externalId = t_externalId;
	},
	
	getLoanOfficerId: function(){
		return this.loanOfficerId;
	},
	
	setLoanOfficerId: function (t_loanOfficerId){
		this.loanOfficerId = t_loanOfficerId;
	},
	
	getCustomerStatus: function(){
		return this.customerStatus;
	},
	
	setCustomerStatus: function (t_customerStatus){
		this.customerStatus = t_customerStatus;
	},
	
	getTrained: function(){
		return this.trained;
	},
	
	setTrained: function (t_trained){
		this.trained = t_trained;
	},
	
	getTrainedOn: function(){
		return this.trainedOn;
	},
	
	setTrainedOn: function (t_trainedOn){
		this.trainedOn = t_trainedOn;
	},
	
	getMfiJoiningDate: function(){
		return this.mfiJoiningDate;
	},
	
	setMfiJoiningDate: function (t_mfiJoiningDate){
		this.mfiJoiningDate = t_mfiJoiningDate;
	},
	
	getActivationDate: function(){
		return this.activationDate;
	},
	
	setActivationDate: function (t_activationDate){
		this.activationDate = t_activationDate;
	},
	
	getParentSystemId: function(){
		return this.parentSystemId;
	},
	
	setParentSystemId: function (t_parentSystemId){
		this.parentSystemId = t_parentSystemId;
	},
	
	getOfficeId: function(){
		return this.officeId;
	},
	
	setOfficeId: function (t_officeId){
		this.officeId = t_officeId;
	},

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
	
	getRecurrenceType: function(){
		return this.recurrenceType;
	},
	
	setRecurrenceType: function (t_recurrenceType){
		this.recurrenceType = t_recurrenceType;
	},
	
	getDayNumber: function(){
		return this.dayNumber;
	},
	
	setDayNumber: function (t_dayNumber){
		this.dayNumber = t_dayNumber;
	},
	
	getRecurAfter : function(){
		return this.recurAfter;
	},
	
	setRecurAfter: function (t_recurAfter){
		this.recurAfter = t_recurAfter;
	},
	
	getMeetingPlace: function(){
		return this.meetingPlace;
	},
	
	setMeetingPlace: function (t_meetingPlace){
		this.meetingPlace = t_meetingPlace;
	},
	getGroupId: function(){
        return this.groupId;
    },
    setGroupId: function (t_groupId){
        this.groupId = t_groupId;
    },
    getMeetingTime: function(){
        return this.meetingTime;
    },
    setMeetingTime: function (t_meetingTime){
        this.meetingTime = t_meetingTime;
    },
    setLoanCounter : function(t_loanCounter){
        this.loanCounter = t_loanCounter;
    },
    getLoanCounter : function(){
        return this.loanCounter;
    },
    setMifosCustomerId : function(t_mifosCustomerId){
        this.mifosCustomerId = t_mifosCustomerId;
    },
    getMifosCustomerId : function(){
        return this.mifosCustomerId;
    },
    setRejectedClientsId : function(t_clients_id){
        this.rejectedClientsId = t_clients_id;
    },
    getRejectedClientsId : function(){
        return this.rejectedClientsId;
    }
}

