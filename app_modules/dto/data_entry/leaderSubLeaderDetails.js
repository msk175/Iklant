module.exports = leaderSubLeaderDetails;

var groupId;
var groupName;
var centerName;
var lookupIdArray = new Array();
var lookupNameArray = new Array();
var clientIdArray = new Array();
var clientNameArray = new Array();
var clientGlobalNumberArray = new Array();
var clientLastNameArray = new Array();
var subGroupClientGlobalNumberArray = new Array();
var subGroupGlobalNumberArray = new Array();
var totalSubGroupClient = new Array();
var leaderGlobalNumberArray = new Array();

var subClientIdArray = new Array();
var subClientNameArray = new Array();
var subClientGlobalNumberArray = new Array();
var subLeaderGlobalNumberArray = new Array();
var subLeaderClientIdArray = new Array();

function leaderSubLeaderDetails() {
    this.clearAll();
}

leaderSubLeaderDetails.prototype = {

    getLookupIdArray: function(){
        return this.lookupIdArray;
    },

    setLookupIdArray: function (lookupIdArray){
        this.lookupIdArray = lookupIdArray;
    },

    getLookupNameArray: function(){
        return this.lookupNameArray;
    },

    setLookupNameArray: function (lookupNameArray){
        this.lookupNameArray = lookupNameArray;
    },

    getClientIdArray: function(){
        return this.clientIdArray;
    },

    setClientIdArray: function (clientIdArray){
        this.clientIdArray = clientIdArray;
    },

    getClientNameArray: function(){
        return this.clientNameArray;
    },

    setClientNameArray: function (clientNameArray){
        this.clientNameArray = clientNameArray;
    },

    getClientLastNameArray: function(){
        return this.clientLastNameArray;
    },

    setClientLastNameArray: function (clientLastNameArray){
        this.clientLastNameArray = clientLastNameArray;
    },

    getSubGroupClientGlobalNumberArray: function(){
        return this.subGroupClientGlobalNumberArray;
    },

    setSubGroupClientGlobalNumberArray: function (subGroupClientGlobalNumberArray){
        this.subGroupClientGlobalNumberArray = subGroupClientGlobalNumberArray;
    },

    getSubGroupGlobalNumberArray: function(){
        return this.subGroupGlobalNumberArray;
    },

    setSubGroupGlobalNumberArray: function (subGroupGlobalNumberArray){
        this.subGroupGlobalNumberArray = subGroupGlobalNumberArray;
    },

    getTotalSubGroupClient: function(){
        return this.totalSubGroupClient;
    },

    setTotalSubGroupClient: function (totalSubGroupClient){
        this.totalSubGroupClient = totalSubGroupClient;
    },

    getSubGroupDetailsArray: function(){
        return this.subGroupDetailsArray;
    },

    setSubGroupDetailsArray: function (subGroupDetailsArray){
        this.subGroupDetailsArray = subGroupDetailsArray;
    },

    getClientGlobalNumberArray: function(){
        return this.clientGlobalNumberArray;
    },

    setClientGlobalNumberArray: function (clientGlobalNumberArray){
        this.clientGlobalNumberArray = clientGlobalNumberArray;
    },

    getGroupId: function(){
        return this.groupId;
    },

    setGroupId: function (groupId){
        this.groupId = groupId;
    },

    getGroupName: function(){
        return this.groupName;
    },

    setGroupName: function (groupName){
        this.groupName = groupName;
    },

    getCenterName: function(){
        return this.centerName;
    },

    setCenterName: function (centerName){
        this.centerName = centerName;
    },

    getSubClientIdArray: function(){
        return this.subClientIdArray;
    },

    setSubClientIdArray: function (subClientIdArray){
        this.subClientIdArray = subClientIdArray;
    },

    getSubClientNameArray: function(){
        return this.subClientNameArray;
    },

    setSubClientNameArray: function (subClientNameArray){
        this.subClientNameArray = subClientNameArray;
    },

    getSubClientGlobalNumberArray: function(){
        return this.subClientGlobalNumberArray;
    },

    setSubClientGlobalNumberArray: function (subClientGlobalNumberArray){
        this.subClientGlobalNumberArray = subClientGlobalNumberArray;
    },

    getSubLeaderGlobalNumberArray: function(){
        return this.subLeaderGlobalNumberArray;
    },

    setSubLeaderGlobalNumberArray: function (subLeaderGlobalNumberArray){
        this.subLeaderGlobalNumberArray = subLeaderGlobalNumberArray;
    },

    getLeaderGlobalNumberArray: function(){
        return this.leaderGlobalNumberArray;
    },

    setLeaderGlobalNumberArray: function (leaderGlobalNumberArray){
        this.leaderGlobalNumberArray = leaderGlobalNumberArray;
    },

    getSubLeaderClientIdArray: function(){
        return this.subLeaderClientIdArray;
    },

    setSubLeaderClientIdArray: function (subLeaderClientIdArray){
        this.subLeaderClientIdArray = subLeaderClientIdArray;
    },

    clearAll: function (){
        this.setLookupIdArray("");
        this.setLookupNameArray("");
        this.setClientIdArray("");
        this.setClientNameArray("");
        this.setClientLastNameArray("");
        this.setGroupId("");
        this.setGroupName("");
        this.setCenterName("");
        this.setClientGlobalNumberArray("");
        this.setSubGroupClientGlobalNumberArray("");
        this.setSubGroupGlobalNumberArray("");
        this.setTotalSubGroupClient("");
        this.setSubGroupDetailsArray("");
        this.setSubClientIdArray("");
        this.setSubClientNameArray("");
        this.setSubClientGlobalNumberArray("");
        this.setSubLeaderGlobalNumberArray("");
        this.setLeaderGlobalNumberArray("");
        this.setSubLeaderClientIdArray("");
    }
};