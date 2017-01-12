module.exports = ActivityPermission;

function ActivityPermission() {
    //this.clearAll();
}

var activityEntityId;
var activityName;
var activityDescription;
var activityParentId;

ActivityPermission.prototype = {

    getActivityEntityId: function(){
        return this.activityEntityId;
    },

    setActivityEntityId: function (t_activityEntityId){
        this.activityEntityId = t_activityEntityId;
    },

    getActivityName: function(){
        return this.activityName;
    },

    setActivityName: function (t_activityName){
        this.activityName = t_activityName;
    },

    getActivityDescription: function(){
        return this.activityDescription;
    },

    setActivityDescription: function (t_activityDescription){
        this.activityDescription = t_activityDescription;
    },

    getActivityParentId: function(){
        return this.activityParentId;
    },

    setActivityParentId: function (t_activityParentId){
        this.activityParentId = t_activityParentId;
    },

    clearAll : function(){
        this.setActivityEntityId("");
        this.setActivityName("");
        this.setActivityDescription("");
        this.setActivityParentId("");
    }

}