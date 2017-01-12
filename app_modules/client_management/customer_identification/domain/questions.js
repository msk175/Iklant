module.exports = questions;

var questionIdArray = new Array();
var questionNameArray = new Array();
var questionWeightage = new Array();
var noOfPrimaryQuestions;

var secondaryQuestionIdArray = new Array();
var secondaryQuestionNameArray = new Array();
var secondaryQuestionWeightage = new Array();

var question;
var displaytext;
var weightage;
var choice_id = new Array();
var choice_name = new Array();
var marks = new Array();

var questionIDEdit;
var questionEdit;
var displayEdit;
var weightageEdit;
var choiceId;
var answersEdit;
var marksEdit;

function questions() {
    //this.clearAll();
}

questions.prototype = {

	getQuestionIdArray: function(){
		return this.questionIdArray;
	},
	
	setQuestionIdArray: function (question_id_array){
        this.questionIdArray = question_id_array;
	},
	
	getQuestionNameArray: function(){
		return this.questionNameArray;
	},
	
	setQuestionNameArray: function (question_name_array){
        this.questionNameArray = question_name_array;
	},
	
	getQuestionWeightage: function(){
		return this.questionWeightage;
	},
	
	setQuestionWeightage: function (question_weightage){
        this.questionWeightage = question_weightage;
	},
	
	getNoOfPrimaryQuestions: function(){
		return this.noOfPrimaryQuestions;
	},
	
	setNoOfPrimaryQuestions: function (no_of_primaryQuestions){
        this.noOfPrimaryQuestions = no_of_primaryQuestions;
	},

	getSecondaryQuestionIdArray: function(){
		return this.secondaryQuestionIdArray;
	},
	
	setSecondaryQuestionIdArray: function (secondary_questionId_Array){
        this.secondaryQuestionIdArray = secondary_questionId_Array;
	},
	getSecondaryQuestionNameArray: function(){
		return this.secondaryQuestionNameArray;
	},
	
	setSecondaryQuestionNameArray: function (secondary_questionName_Array){
        this.secondaryQuestionNameArray = secondary_questionName_Array;
	},
	getSecondaryQuestionWeightage: function(){
		return this.secondaryQuestionWeightage;
	},
	
	setSecondaryQuestionWeightage: function (secondary_question_weightage){
        this.secondaryQuestionWeightage = secondary_question_weightage;
	},	
	getQuestion: function(){
		return this.question;
	},
	
	setQuestion: function (t_question){
        this.question = t_question;
	},

	getDisplaytext: function(){
		return this.displaytext;
	},
	
	setDisplaytext: function (t_displaytext){
        this.displaytext = t_displaytext;
	},
	
	getWeightage: function(){
		return this.weightage;
	},
	
	setWeightage: function (t_weightage){
        this.weightage = t_weightage;
	},
	
	getChoiceId: function(){
		return this.choice_id;
	},
	
	setChoiceId: function (t_choice_id){
        this.choice_id = t_choice_id;
	},
	
	getChoiceName: function(){
		return this.choice_name;
	},
	
	setChoiceName: function (choiceName){
        this.choice_name = choiceName;
	},
	
	getMarks: function(){
		return this.marks;
	},
	
	setMarks: function (t_marks){
        this.marks = t_marks;
	},
	
	getQuestionIDEdit: function(){
		return this.questionIDEdit;
	},
	
	setQuestionIDEdit: function (t_questionIDEdit){
        this.questionIDEdit = t_questionIDEdit;
	},
	
	getQuestionEdit: function(){
		return this.questionEdit;
	},
	
	setQuestionEdit : function (t_questionEdit){
        this.questionEdit = t_questionEdit;
	},
	
	getDisplayEdit: function(){
		return this.displayEdit;
	},
	
	setDisplayEdit : function (t_displayEdit){
        this.displayEdit = t_displayEdit;
	},
	
	getWeightageEdit: function(){
		return this.weightageEdit;
	},
	
	setWeightageEdit : function (t_weightageEdit){
        this.weightageEdit = t_weightageEdit;
	},
	
	
	getChoice_ID: function(){
		return this.choiceId;
	},
	
	setChoice_ID : function (t_choiceId){
        this.choiceId = t_choiceId;
	},
	
	getAnswersEdit: function(){
		return this.answersEdit;
	},
	
	setAnswersEdit : function (t_answersEdit){
        this.answersEdit = t_answersEdit;
	},
	
	getMarksEdit: function(){
		return this.marksEdit;
	},
	
	setMarksEdit : function (t_marksEdit){
        this.marksEdit = t_marksEdit;
	},

	clearAll: function () {
		this.setQuestionIdArray(new Array());
		this.setQuestionNameArray(new Array());
		this.setQuestionWeightage(new Array());
		this.setNoOfPrimaryQuestions(new Array());
		this.setSecondaryQuestionIdArray(new Array());
		this.setSecondaryQuestionNameArray(new Array());
		this.setSecondaryQuestionWeightage(new Array());
		this.setQuestion("");
		this.setDisplaytext("");
		this.setWeightage("");
		this.setChoiceId(new Array());
		this.setChoiceName(new Array());
		this.setMarks(new Array());
		this.setQuestionIDEdit("");
		this.setQuestionEdit("");
		this.setDisplayEdit("");
		this.setWeightageEdit("");
		this.setAnswersEdit("");
		this.setMarksEdit("");
	}
};