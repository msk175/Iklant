module.exports = docTypeForAndroid;

var docId = new Array();
var docEntityId = new Array();
var docName = new Array();

function docTypeForAndroid() {
   //this.clearAll();
}
docTypeForAndroid.prototype = {
	//docId
	getDocId: function(){
		return this.docId;
	},
	
	setDocId: function (t_docId){
        this.docId = t_docId;
	},
	
	//docEntityId
	getDocEntityId: function(){
		return this.docEntityId;
	},
	
	setDocEntityId: function (t_docEntityId){
        this.docEntityId = t_docEntityId;
	},
	
	//docName	
	getDocName: function(){
		return this.docName;
	},
	
	setDocName: function (t_docName){
        this.docName = t_docName;
	},
	
	
	clearAll: function() {
		this.setDocId("");
		this.setDocEntityId("");
		this.setDocName("");
	}

};