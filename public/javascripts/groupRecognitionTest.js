$(document).ready(function() {
    $('#maximize').click(function(){
        $(".collapsible_content").trigger('expand');
    })
    $('#minimize').click(function(){
        $(".collapsible_content").trigger('collapse');
    })
    updateTotalRating();
});

var checkedOrNot = new Array();
var questionIdArray = new Array();
function recognizeTheGroup(groupId, centerName, groupName) {
    $.mobile.showPageLoadingMsg();
    $('#groupId').val(groupId);
    $('#centerName').val(centerName);
    $('#groupName').val(groupName);

    document.getElementById("BMFormId").action=localStorage.contextPath+"/client/ci/groups/getGroupRecognitionTestDetails";
    document.getElementById("BMFormId").method="POST";
    document.getElementById("BMFormId").submit().refresh();
}

function grtCancelButton() {
    $.mobile.showPageLoadingMsg();
    document.getElementById("BMFormId").method='POST';
    document.getElementById("BMFormId").action=localStorage.contextPath+"/client/ci/groups/operation/"+groupRecognitionTestOperationId+"";
    document.getElementById("BMFormId").submit();
}

/**
 * calculate the credit score for that single row
 * @param quesCategoryDetails
 */
function updateCreditScore(quesCategoryDetails) {
    var totalQuestions = quesCategoryDetails.length;
    var checkedQuestions = 0;
    for(var i=0; i<totalQuestions; i++) {
        var questionId =  $('#'+quesCategoryDetails[i].id)[0].id;
        var idOfThisQuestion = questionId.match(/\d+/);
        if($('#'+quesCategoryDetails[i].id).prop('checked') == true){
            if(questionIdArray.indexOf(idOfThisQuestion[0]) == -1) {
                questionIdArray.push(idOfThisQuestion[0]);
                checkedOrNot.push(1);
            } else {
                checkedOrNot[questionIdArray.indexOf(idOfThisQuestion[0])] = 1;
            }
            /*console.log(questionId+" is checked");
            console.log(questionIdArray);
            console.log(checkedOrNot);*/
            checkedQuestions++;
        } else {
            if(questionIdArray.indexOf(idOfThisQuestion[0]) == -1) {
                /*questionIdArray.push(idOfThisQuestion[0]);
                checkedOrNot.push(0);*/
            } else {
                //checkedOrNot[questionIdArray.indexOf(idOfThisQuestion[0])] = 0;
                var rqdIndex = questionIdArray.indexOf(idOfThisQuestion[0]);
                questionIdArray.splice(rqdIndex,1);
                checkedOrNot.splice(rqdIndex,1);
            }
            /*console.log(questionId+" is not checked");
            console.log(questionIdArray);
            console.log(checkedOrNot);*/
        }
    }
    var percentage = (checkedQuestions/totalQuestions*100);
    var rating;
    if(percentage == 100) {
        rating = 3;
    } else if(percentage >= 90) {
        rating = 2;
    } else {
        rating = 1;
    }
    /*if(totalQuestions > 0)
        document.getElementById(quesCategoryDetails[0].name).innerHTML = rating;*/
    //updateTotalRating();
    console.log(questionIdArray);
    console.log(checkedOrNot)
}

/**
 * sum up and update the total rating
 */
function updateTotalRating() {
    var noOfCategories = $('#categoryId').val().split(',').length;
    var totalRating = 0;
    for(var i=0; i<noOfCategories; i++) {
        console.log(parseInt($("input[name=category_"+i+"]:checked").val()));
        totalRating += parseInt($("input[name=category_"+i+"]:checked").val());
    }

    $('#totalRating').text(totalRating);
}

/**
 * submit the credit score to the server
 */
function submitRating() {
    $('#totalRatingHidden').val($('#totalRating').text());
    $('#questionIdDetails').val(questionIdArray);
    $('#checkedOrNotDetails').val(checkedOrNot);

    $.mobile.showPageLoadingMsg();
    document.getElementById("BMFormId").action=localStorage.contextPath+"/client/ci/groups/submitRatingForGRT";
    document.getElementById("BMFormId").method="POST";
    document.getElementById("BMFormId").submit();
}

