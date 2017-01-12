module.exports = ExecutionProgress

var currentStatus;

function ExecutionProgress() {
	this.currentStatus = 0;
}

ExecutionProgress.prototype = {
	getCurrentStatus: function() {
		return this.currentStatus;
	},
	setCurrentStatus: function(status) {
		this.currentStatus = status;
	},
	incrementProgress: function() {
		this.currentStatus = this.currentStatus + 1;
	}
};