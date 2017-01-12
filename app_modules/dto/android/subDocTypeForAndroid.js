/**
 * Created by Desktop on 8/12/2015.
 */
module.exports = subDocTypeForAndroid;

var docTypeId = new Array();
var subDocId = new Array();
var subDocTypeName = new Array();

function subDocTypeForAndroid() {
    //this.clearAll();
}
subDocTypeForAndroid.prototype = {

    getDocTypeId: function(){
        return this.docTypeId;
    },

    setDocTypeId: function (t_docTypeId){
        this.docTypeId = t_docTypeId;
    },


    getSubDocId: function(){
        return this.subDocId;
    },

    setSubDocId: function (t_subDocId){
        this.subDocId = t_subDocId;
    },


    getSubDocName: function(){
        return this.subDocName;
    },

    setSubDocName: function (t_subDocName){
        this.subDocName = t_subDocName;
    },


    clearAll: function() {
        this.setDocTypeId("");
        this.setSubDocId("");
        this.setSubDocName("");
    }

};