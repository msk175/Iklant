module.exports = choicesanswer;

var selectedChoice = new Array();
var selectedChoiceId = new Array();
var selectedChoiceMarks = new Array();
var selectedChoiceMarksTotal;

function choicesanswer() {
    //this.clearAll();
}

choicesanswer.prototype = {

	getSelectedChoice: function(){
		return this.selectedChoice;
	},
	
	setSelectedChoice: function (selected_choice){
        this.selectedChoice = selected_choice;
	},
	
	getSelectedChoiceId: function(){
		return this.selectedChoiceId;
	},
	
	setSelectedChoiceId: function (selected_choice_id){
        this.selectedChoiceId = selected_choice_id;
	},
		
	getSelectedChoiceMarks: function(){
		return this.selectedChoiceMarks;
	},
	
	setSelectedChoiceMarks: function (selected_choice_marks){
        this.selectedChoiceMarks = selected_choice_marks;
	},
	
	getSelectedChoiceMarksTotal: function(){
		return this.selectedChoiceMarksTotal;
	},
	
	setSelectedChoiceMarksTotal: function (selected_choice_marks_total){
        this.selectedChoiceMarksTotal = selected_choice_marks_total;
	},
	
	clearAll: function () {
		this.setSelectedChoice(new Array());
		this.setSelectedChoiceId(new Array());
		this.setSelectedChoiceMarks(new Array());
		this.setSelectedChoiceMarksTotal("");
	}
};