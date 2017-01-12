module.exports = NPAProcessHolder;

var redo;
var threshold;

function NPAProcessHolder() {	
   //this.clearAll();
}  

NPAProcessHolder.prototype = {
	getRedo : function() {
		return this.redo;
	},
	setRedo : function(t_redo) {
		this.redo = t_redo;
	},
	getThreshold : function() {
		return this.threshold;
	},
	setThreshold : function(t_threshold) {
		this.threshold = t_threshold;
	},
    clearAll: function(){
        this.setRedo("");
        this.setThreshold("");
    }
};