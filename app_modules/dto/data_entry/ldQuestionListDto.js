module.exports = ldQuestionListDto;

var questionId;
var answerId;
var remarks;

function ldQuestionListDto() {
    //this.clearAll();
}

ldQuestionListDto.prototype = {
    setQuestionId : function(t_questionId){
        this.questionId = t_questionId;
    },
    getQuestionId : function(){
        return this.questionId;
    },

    setAnswerId : function(t_answerId){
        this.answerId = t_answerId;
    },
    getAnswerId : function(){
        return this.answerId;
    },

    setRemarks : function(t_remarks){
        this.remarks = t_remarks;
    },
    getRemarks : function(){
        return this.remarks;
    }
}
