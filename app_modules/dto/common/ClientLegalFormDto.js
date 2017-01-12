module.exports = clientLegalForm;

var clientName;
var relationship;
var clientAge;
var clientAddress;
var officeName;

function clientLegalForm() {

}

clientLegalForm.prototype = {
    setClientName: function(clientName){
        this.clientName = clientName;
    },
    setRelationshipName: function(relationship){
        this.relationship = relationship;
    },
    setClientAge: function(clientAge){
        this.clientAge = clientAge;
    },
    setClientAddress: function(clientAddress){
        this.clientAddress = clientAddress;
    },
    setOfficeName: function(officeName){
        this.officeName = officeName;
    },
    getOfficeName: function(){
        return officeName;
    },
    getClientAddress: function(){
        return clientAddress;
    },
    getClientAge: function(){
        return clientAge;
    },
    getRelationshipName: function(){
        return relationship;
    },
    getClientName: function(){
        return clientName;
    }
}