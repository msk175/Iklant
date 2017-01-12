module.exports = choices;

var choiceArrayOne = new Array();
var choiceArrayTwo = new Array();
var choiceArrayThree = new Array();

var secondaryChoiceArrayOne = new Array();
var secondaryChoiceArrayTwo = new Array();
var secondaryChoiceArrayThree = new Array();

var choice = new Array();
var marks = new Array();

function choices() {
    this.clearAll();
}

choices.prototype = {

	getChoiceArrayOne: function(){
		return this.choiceArrayOne;
	},
	
	setChoiceArrayOne: function (choice_array_one){
        this.choiceArrayOne = choice_array_one;
	},
	
	getChoiceArrayTwo: function(){
		return this.choiceArrayTwo;
	},
	
	setChoiceArrayTwo: function (choice_array_two){
        this.choiceArrayTwo = choice_array_two;
	},
		
	getChoiceArrayThree: function(){
		return this.choiceArrayThree;
	},
	
	setChoiceArrayThree: function (choice_array_three){
        this.choiceArrayThree = choice_array_three;
	},
	getSecondaryChoiceArrayOne: function(){
		return this.secondaryChoiceArrayOne;
	},
	
	setSecondaryChoiceArrayOne: function (secondary_choice_ArrayOne){
        this.secondaryChoiceArrayOne = secondary_choice_ArrayOne;
	},
	getSecondaryChoiceArrayTwo: function(){
		return this.secondaryChoiceArrayTwo;
	},
	
	setSecondaryChoiceArrayTwo: function (secondary_choice_ArrayTwo){
        this.secondaryChoiceArrayTwo = secondary_choice_ArrayTwo;
	},
	getSecondaryChoiceArrayThree: function(){
		return this.secondaryChoiceArrayThree;
	},
	
	setSecondaryChoiceArrayThree: function (secondary_choice_ArrayThree){
        this.secondaryChoiceArrayThree = secondary_choice_ArrayThree;
	},
	getChoice: function(){
		return this.choice;
	},
	
	setChoice: function (t_choice){
        this.choice = t_choice;
	},
	getMarks: function(){
		return this.marks;
	},
	
	setMarks: function (t_marks){
        this.marks = t_marks;
	},
	clearAll: function () {
		this.setChoiceArrayOne(new Array());
		this.setChoiceArrayTwo(new Array());
		this.setChoiceArrayThree(new Array());
		this.setSecondaryChoiceArrayOne(new Array());
		this.setSecondaryChoiceArrayTwo(new Array());
		this.setSecondaryChoiceArrayThree(new Array());
		this.setChoice(new Array());
		this.setMarks(new Array());
	}
};