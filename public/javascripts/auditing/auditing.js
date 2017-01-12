$(document).ready(function () {
    $(function() {
        $( ".fromDate" ).datepicker({
            maxDate: new Date,
            dateFormat: 'yy-mm-dd',
            changeMonth: true,
            changeYear: true
        });
    });
    $(function() {
        $( ".toDate" ).datepicker({
            maxDate: new Date,
            dateFormat: 'yy-mm-dd',
            changeMonth: true,
            changeYear: true
        });
    });
    $(".fromdate").keypress(function(e){ e.preventDefault(); });
    $(".todate").keypress(function(e){ e.preventDefault(); });

    $(function () {
        $(".fromDateDC").datepicker({
            dateFormat: 'yy-mm-dd',
            changeMonth: true,
            changeYear: true
        });
    });
    $(function () {
        $(".toDateDC").datepicker({
            dateFormat: 'yy-mm-dd',
            changeMonth: true,
            changeYear: true
        });
    });
    $(".fromdateDC").keypress(function (e) {
        e.preventDefault();
    });
    $(".todateDC").keypress(function (e) {
        e.preventDefault();
    });


    $("#backUId").click(function(){
        $.mobile.showPageLoadingMsg();
        $('#operationId').val(operationId);
        document.getElementById('auditManagementForm').method = "GET";
        document.getElementById('auditManagementForm').action = localStorage.contextPath+"/client/ci/menu";
        document.getElementById('auditManagementForm').submit().refresh();
    });
    $("#addQId").click(function(){
        $("#addQuestionarieid").show();
        $("#saveQuestionarieid").show();
    });
    $("#removeId").click(function(){
        $("#addQuestionarieid").hide();
        $("#questionName").val("");
        $("#questionShortName").val("");
        $("#weightAge").val("");
        if($("#questionLength").val()==0){
            $("#saveQuestionarieid").hide();
        }
        calculateWeightage();

        /*if($("#weightAge").val()){
            var weightAge = parseInt($("#weightAge").val())
        }else{
            var weightAge =0;
        }
        var total=0;
        var questionWeightAgeId = parseInt($("#questionWeightAgeId").val());
        var total = questionWeightAgeId- weightAge;
        $("#totalWeightage").text(total);
        $("#questionWeightAgeId").val(total);
        $("#weightAge").val("");*/

    });
    $("#categoryName").focusout(function(){
        var existingAreaName = $("#categoryAllNameHidden").val().split(",");
        var enteredAreaName = $("#categoryName").val();
        var trimmedString = $.trim(enteredAreaName);
        if(existingAreaName != "") {
            for (var i = 0; i < existingAreaName.length; i++) {
                if (trimmedString == existingAreaName[i]) {
                    $("#errorMessageId").show();
                    $("#errorMessageId").text("Category Name already Exists");
                    $("#categoryName").focus();
                    $("#addCategoryId").hide();
                    return false;
                    $(window).scrollTop(0);
                }
                else {
                    $("#errorMessageId").text("");
                    $("#addCategoryId").show();
                }
            }
        }
    });

    $('#noQuestionDeleteId').click(function() {
        $("#reverseConfirmationId" ).popup( "close" );
    });
    $('#yesQuestionDeleteId').click(function() {
        var data = {};
        data.questionDeleteId = $("#questionDeleteId").val();
        data.categoryType = $("#categoryType").val();
        data.auditType = $("#auditType").val();
        ajaxVariable = $.ajax({
            beforeSend: function () {
                $.mobile.showPageLoadingMsg();
            },
            complete: function () {
                $.mobile.hidePageLoadingMsg()
            },
            type: 'POST',
            data: JSON.stringify(data),
            contentType: 'application/json',
            url: 'http://' + ajaxcallip + localStorage.contextPath+'/client/ci/audit/deleteQuestion',
            success: function (dataValue) {
                $("#errorMessageId").hide();
                if(dataValue.status == "success"){
                    $("#successMessage").show();
                    $("#successMessage").text("Question Has been deleted Successfully");
                    $("#errorMessageId").hide();
                    $("#addQDiv").show();
                    $("#displayQuestionarieid").show();
                    $("#saveQuestionarieid").show();
                    var data = dataValue.auditDetails;
                    var result=0;
                    var oldQuestionId = new Array();
                    if(data.length) {
                        $('#questionsTable').remove();
                        $('#questionsDivTable').append('<table id="questionsTable"><tr><th>S.No</th><th>Question Name</th><th>Question Short Name</th><th>Weightage %</th><th>Action</th></tr>').trigger('create');
                        for (var i = 0; i < data.length; i++) {
                            $('#questionsTable').append('<tr><td>' + (i+1) + '</td><td>' +data[i].question_Name  + '</td><td>' + data[i].display_name + '</td><td><input type="text" id="weightage_'+ i +'" name="weightage_'+ i +'" align="right" maxlength="3" onkeyup="forNumbers(this)" onfocusout="calculateWeightage('+i+')" value="' + data[i].weightage + '"></td><td><a href="JavaScript:removeOldQuestions('+data[i].question_Id+');" id="deleteOldId" data-theme="b" data-icon="delete" data-role="button" data-mini="true" title="Delete"  data-inline="true" data-rel="popup" data-position-to="window">Delete</a></td>').trigger('create');
                            result = result+data[i].weightage;
                            oldQuestionId.push(data[i].question_Id);
                        }
                        $("#totalWeightage").text(result);
                        $("#questionWeightAgeId").val(result);
                        $("#questionLength").val(data.length);
                        $('#questionsTable').append('<input type="hidden" id ="oldQuestionId" name="oldQuestionId" value = "'+oldQuestionId+'" >').trigger('create');
                    }
                    else{
                        $("#saveQuestionarieid").hide();
                        $("#totalWeightage").text(result);
                        $('#questionsTable').remove();
                        $("#displayQuestionarieid").hide();
                    }
                }else{
                    $("#successMessage").show();
                    $("#successMessage").text("Please Try Again Later");
                    $("#errorMessageId").hide();
                    $("#addQDiv").show();
                    $("#displayQuestionarieid").show();
                    $("#saveQuestionarieid").show();
                    var data = dataValue.auditDetails;
                    var result=0;
                    var oldQuestionId = new Array();
                    if(data.length) {
                        $('#questionsTable').remove();
                        $('#questionsDivTable').append('<table id="questionsTable"><tr><th>S.No</th><th>Question Name</th><th>Question Short Name</th><th>Weightage %</th><th>Action</th></tr>').trigger('create');
                        for (var i = 0; i < data.length; i++) {
                            $('#questionsTable').append('<tr><td>' + (i+1) + '</td><td>' +data[i].question_Name  + '</td><td>' + data[i].display_name + '</td><td><input type="text" id="weightage_'+ i +'" name="weightage_'+ i +'" align="right" maxlength="3" onkeyup="forNumbers(this)" onfocusout="calculateWeightage('+i+')" value="' + data[i].weightage + '"></td><td><a href="JavaScript:removeOldQuestions('+data[i].question_Id+');" id="deleteOldId" data-theme="b" data-icon="delete" data-role="button" data-mini="true" title="Delete"  data-inline="true" data-rel="popup" data-position-to="window">Delete</a></td>').trigger('create');
                            result = result+data[i].weightage;
                            oldQuestionId.push(data[i].question_Id);
                        }
                        $("#totalWeightage").text(result);
                        $("#questionWeightAgeId").val(result);
                        $("#questionLength").val(data.length);
                        $('#questionsTable').append('<input type="hidden" id ="oldQuestionId" name="oldQuestionId" value = "'+oldQuestionId+'" >').trigger('create');
                    }
                    else{
                        $("#saveQuestionarieid").hide();
                        $("#totalWeightage").text(result);
                        $('#questionsTable').remove();
                        $("#displayQuestionarieid").hide();
                    }
                }
            }
        });
    });

    $("#addCategoryId").click(function(){
        $("#successMessage").hide();
        if($("#categoryName").val().trim() == ""){
            $("#errorMessageId").show();
            var errorLabelMember = "Please Fill Category Name";
            document.getElementById("errorMessageId").innerText = errorLabelMember;
            $(window).scrollTop(0);
        }
        else if($("#auditType").val() == 0){
            var errorLabelMember = "Please Select Audit Type";
            document.getElementById("errorMessageId").innerText = errorLabelMember;
            $(window).scrollTop(0);
        }
        else{
            $("#errorMessageId").hide();
            $.mobile.showPageLoadingMsg();
            document.getElementById('auditManagementForm').method = "POST";
            document.getElementById('auditManagementForm').action = localStorage.contextPath+"/client/ci/saveCategory";
            document.getElementById('auditManagementForm').submit().refresh();
        }
    });
    $("#addQDiv").hide();
    $("#displayQuestionarieid").hide();
    $("#addQuestionarieid").hide();
    $("#saveQuestionarieid").hide();
 });

function operationSubmitForAuditMgmt(operationId) {
    $.mobile.showPageLoadingMsg();
    $('#operationId').val(operationId);
    document.getElementById('auditManagementForm').method = "POST";
    document.getElementById('auditManagementForm').action = localStorage.contextPath+"/client/ci/audit/submitAuditManagement";
    document.getElementById('auditManagementForm').submit().refresh();
}




function retriveQuestions(){
    $("#successMessage").hide();
    $("#addQuestionarieid").hide();
    if(document.getElementById("auditType").value==0){
        var errorLabelMember = "Please Select a Audit Type";
        document.getElementById("errorMessageId").innerText = errorLabelMember;
        document.getElementById("categoryType").value=0;
        $(window).scrollTop(0);
    }
    else if(document.getElementById("categoryType").value==0){
        var errorLabelMember = "Please Select a Category Type";
        document.getElementById("errorMessageId").innerText = errorLabelMember;
        $(window).scrollTop(0);
        $("#addQDiv").hide();
        $("#displayQuestionarieid").hide();
        $("#addQuestionarieid").hide();
        $("#saveQuestionarieid").hide();
    }
    else{
        var data = {};
        data.categoryType = $("#categoryType").val();
        data.auditType = $("#auditType").val();
        ajaxVariable = $.ajax({
            beforeSend: function () {
                $.mobile.showPageLoadingMsg();
            },
            complete: function () {
                $.mobile.hidePageLoadingMsg()
            },
            type: 'POST',
            data: JSON.stringify(data),
            contentType: 'application/json',
            url: 'http://' + ajaxcallip + localStorage.contextPath+'/client/ci/populateAuditQuestionsDetails',
            success: function (dataValue,status) {
                $("#errorMessageId").hide();
                $("#addQDiv").show();
                $("#displayQuestionarieid").show();
                $("#saveQuestionarieid").show();
                $("#successMessage").hide();
                var data = dataValue.auditDetails;
                var result=0;
                var oldQuestionId = new Array();
                    if(data.length) {
                        $('#questionsTable').remove();
                        $('#questionsDivTable').append('<table id="questionsTable"><tr><th>S.No</th><th>Question Name</th><th>Question Short Name</th><th>Weightage %</th><th>Action</th></tr>').trigger('create');
                        for (var i = 0; i < data.length; i++) {
                            $('#questionsTable').append('<tr><td>' + (i+1) + '</td><td>' +data[i].question_Name  + '</td><td>' + data[i].display_name + '</td><td><input type="text" id="weightage_'+ i +'" name="weightage_'+ i +'" align="right" maxlength="3" onfocusout="calculateWeightage('+i+')" onkeyup="forNumbers(this)" value="' + data[i].weightage + '"></td><td><a href="JavaScript:removeOldQuestions('+data[i].question_Id+');" id="deleteOldId" data-theme="b" data-icon="delete" data-role="button" data-mini="true" title="Delete"  data-inline="true" data-rel="popup" data-position-to="window">Delete</a></td>').trigger('create');
                            result = result+data[i].weightage;
                            oldQuestionId.push(data[i].question_Id);
                        }
                        $("#totalWeightage").text(result);
                        $("#questionWeightAgeId").val(result);
                        $("#questionLength").val(data.length);
                        $('#questionsTable').append('<input type="hidden" id ="oldQuestionId" name="oldQuestionId" value = "'+oldQuestionId+'" >').trigger('create');
                    }
                    else{
                        $("#questionLength").val(result);
                        $("#saveQuestionarieid").hide();
                        $("#totalWeightage").text(result);
                        $('#questionsTable').remove();
                        $("#displayQuestionarieid").hide();
                    }
            }
        });
    }
}
function calculateWeightage(i){
    var total = 0;
    var questionLength = $("#questionLength").val();
    for(var j=0; j < questionLength; j++ ){
        total = total+ parseInt($("#weightage_"+j).val());
    }
    if($("#weightAge").val()){
        var weightAge = parseInt($("#weightAge").val())
    }else{
        var weightAge =0;
    }
    total +=weightAge;
    $("#totalWeightage").text(total);
    $("#questionWeightAgeId").val(total);
}
function addWeightage(){
    var total=0;
    if($("#weightAge").val() ){
       var weightAge = parseInt($("#weightAge").val())
   }else{
       var weightAge =0;
   }
    if($("#questionWeightAgeId").val()&& $("#questionLength").val()>1){
        var questionWeightAgeId = parseInt($("#questionWeightAgeId").val());
    }else{
        var questionWeightAgeId =0;
    }

    var total = questionWeightAgeId+ weightAge;
    $("#totalWeightage").text(total);
    $("#questionWeightAgeId").val(total);
}


function submitAuditQuestionCreation() {
    $("#successMessage").hide();
    if($("#addQuestionarieid").is(":visible") == true && $("#questionLength").val() == 0)
    {
        $("#errorMessageId").show();
        if ($("#questionName").val() == "") {
            var errorLabelMember = "Please Fill a Question Name";
            $("#errorMessageId").text(errorLabelMember);
            $(window).scrollTop(0);
        }
        else if ($("#questionShortName").val() == "") {
            var errorLabelMember = "Please Fill a Question Short Name";
            $("#errorMessageId").text(errorLabelMember);
            $(window).scrollTop(0);
        }
        else if ($("#weightAge").val() == "") {
            var errorLabelMember = "Please Fill a Question Weightage";
            $("#errorMessageId").text(errorLabelMember);
            $(window).scrollTop(0);
        }
        else if ($("#weightAge").val() == 0){
            $("#errorMessageId").show();
            var errorLabelMember = "Weightage cannot be Zero";
            $("#errorMessageId").text(errorLabelMember);
            $(window).scrollTop(0);
        }
        else if ($("#questionWeightAgeId").val() < 100 || $("#questionWeightAgeId").val() > 100) {
            var errorLabelMember = "Please Fill a Question Weightage equal to 100";
            $("#errorMessageId").text(errorLabelMember);
            $(window).scrollTop(0);
        }
        else {
            if(questionLength){
                var weightageArray = new Array();
                var questionLength = $("#questionLength").val();
                for(var j=0; j < questionLength; j++ ){
                    weightageArray.push($("#weightage_"+j).val());
                }
                $("#oldQuestionWeightId").val(weightageArray);
            }
            $("#errorMessageId").hide();
            $.mobile.showPageLoadingMsg();
            document.getElementById('auditManagementForm').method = "POST";
            document.getElementById('auditManagementForm').action = localStorage.contextPath + "/client/ci/audit/saveQuestions";
            document.getElementById('auditManagementForm').submit().refresh();
        }
    }
    else if ($("#addQuestionarieid").is(":visible") == true && $("#questionLength").val()>0){
        $("#errorMessageId").show();
        if ($("#questionName").val() == "") {
            var errorLabelMember = "Please Fill a Question Name";
            $("#errorMessageId").text(errorLabelMember);
            $(window).scrollTop(0);
        }
        else if ($("#questionShortName").val() == "") {
            var errorLabelMember = "Please Fill a Question Short Name";
            $("#errorMessageId").text(errorLabelMember);
            $(window).scrollTop(0);
        }
        else if ($("#weightAge").val() == "") {
            var errorLabelMember = "Please Fill a Question Weightage";
            $("#errorMessageId").text(errorLabelMember);
            $(window).scrollTop(0);
        }
        else if ($("#weightAge").val() == 0){
            $("#errorMessageId").show();
            var errorLabelMember = "Weightage cannot be Zero";
            $("#errorMessageId").text(errorLabelMember);
            $(window).scrollTop(0);
        }
        else if($("#questionWeightAgeId").val() >100 || $("#questionWeightAgeId").val()<100){
             $("#errorMessageId").show();
             var errorLabelMember = "Please Fill a Question Weightage equal to 100";
             $("#errorMessageId").text(errorLabelMember);
             $(window).scrollTop(0);
        }
        else
         {
             var weightageArray = new Array();
             var questionLength = $("#questionLength").val();
             for(var j=0; j < questionLength; j++ ){
                 weightageArray.push($("#weightage_"+j).val());
             }
             $("#oldQuestionWeightId").val(weightageArray);
             $("#errorMessageId").hide();
             $.mobile.showPageLoadingMsg();
             document.getElementById('auditManagementForm').method = "POST";
             document.getElementById('auditManagementForm').action = localStorage.contextPath + "/client/ci/audit/saveQuestions";
             document.getElementById('auditManagementForm').submit().refresh();
         }
    }else{
        if($("#questionWeightAgeId").val() >100 || $("#questionWeightAgeId").val()<100){
            $("#errorMessageId").show();
            var errorLabelMember = "Please Fill a Question Weightage equal to 100";
            $("#errorMessageId").text(errorLabelMember);
            $(window).scrollTop(0);
        }
        else
        {
            var weightageArray = new Array();
            var questionLength = $("#questionLength").val();
            for(var j=0; j < questionLength; j++ ){
                weightageArray.push($("#weightage_"+j).val());
            }
            $("#oldQuestionWeightId").val(weightageArray);
            $("#errorMessageId").hide();
            $.mobile.showPageLoadingMsg();
            document.getElementById('auditManagementForm').method = "POST";
            document.getElementById('auditManagementForm').action = localStorage.contextPath + "/client/ci/audit/saveQuestions";
            document.getElementById('auditManagementForm').submit().refresh();
        }
    }

}

function removeOldQuestions(deleteQuestionId){
    var questionDeleteId = (deleteQuestionId);
    $('#questionDeleteId').val(questionDeleteId);
    $(window).scrollTop(0);
    $("#deleteConfirmationId").popup("open");
}

function auditAssignSubmitForm(){
    $("#successMessage").hide();
    $("#errorMessageId").show();
    var fromDate = new Date($("#fromdate").val());
    var toDate = new Date($("#todate").val());
    var maxEndDate = addDays(30,fromDate);
    var auditEmailIdHiddenArray = $("#auditEmailIdHiddenArray").val();
    var auditorIdHidden = $("#auditorIdHidden").val();
    if($("#auditees").val()==0){
        var errorLabelMember = "Please Select Auditor Name";
        $("#errorMessageId").text(errorLabelMember);
        $(window).scrollTop(0);
    }
    else if ($("#officeId").val()==0){
        var errorLabelMember = "Please Select Branch Name";
        $("#errorMessageId").text(errorLabelMember);
        $(window).scrollTop(0);
    }
    else if ($("#fromdate").val() == ""){
        var errorLabelMember = "Please Select From Date";
        $("#errorMessageId").text(errorLabelMember);
        $(window).scrollTop(0);
    }
    else if ($("#todate").val() == ""){
        var errorLabelMember = "Please Select To Date";
        $("#errorMessageId").text(errorLabelMember);
        $(window).scrollTop(0);
    }
    else if ($("#auditType").val()==0){
        var errorLabelMember = "Please Select Audit Type";
        $("#errorMessageId").text(errorLabelMember);
        $(window).scrollTop(0);
    }
    else if ($("#categoryType").val() == 0){
        var errorLabelMember = "Please Select Category Type";
        $("#errorMessageId").text(errorLabelMember);
        $(window).scrollTop(0);
    }
    else {
        if(fromDate < toDate && fromDate != 'Invalid Date' && toDate != 'Invalid Date') {
            if(toDate  <= maxEndDate){
                 $.mobile.showPageLoadingMsg();
                 document.getElementById('auditManagementForm').method = "POST";
                 document.getElementById('auditManagementForm').action = localStorage.contextPath+"/client/ci/audit/assignAuditor";
                 document.getElementById('auditManagementForm').submit().refresh();
            }else{
                $("#errorMessageId").text("Date selection exceed 30 days. Please select between one month");
                $("#errorMessageId").text(errorLabelMember);
                $(window).scrollTop(0);
            }
        }
        else{
            $("#errorMessageId").text("To Date must be greater than From Date");
            $("#errorMessageId").text(errorLabelMember);
            $(window).scrollTop(0);
        }
    }
}

function retriveAssignment(){
    $("#successMessage").hide();
    $("#errorMessageId").show();
    $("#auditeesDivTable").hide();
    var officeId = $("#officeIdHidden").val().split(',');
    var officeName = $("#officeNameHidden").val().split(',');
    var officeData = new Array();
    if(document.getElementById("auditees").value==0){
        var errorLabelMember = "Please Select a Auditor";
        document.getElementById("errorMessageId").innerText = errorLabelMember;
        $(window).scrollTop(0);
    }
    else{
        var data = {};
        data.auditees = $("#auditees").val();
        ajaxVariable = $.ajax({
            beforeSend: function () {
                $.mobile.showPageLoadingMsg();
            },
            complete: function () {
                $.mobile.hidePageLoadingMsg()
            },
            type: 'POST',
            data: JSON.stringify(data),
            contentType: 'application/json',
            url: 'http://' + ajaxcallip + localStorage.contextPath+'/client/ci/populateAuditorAssignmentDetails',
            success: function (dataValue,status) {
                $("#errorMessageId").hide();
                $("#successMessage").hide();
                var data = dataValue.auditDetails;
                if(data.length) {
                    $('#questionsTable').remove();
                    $('#assignmentDivTable').append('<table id="questionsTable"><tr><th>S.No</th><th>Branch Name</th><th>From Date</th><th>To date </th></tr>').trigger('create');
                    var result = new Array();
                    for (var i = 0; i < data.length; i++) {
                        result[i] = data[i].office_id;
                    }
                    for(var j=0;j<officeId.length;j++){
                        for(var h =0;h<result.length;h++){
                            if(result[h] == officeId[j]) {
                                officeData.push(officeName[j]);
                            }
                        }
                    }
                    for (var i = 0; i < data.length; i++) {
                        $('#questionsTable').append('<tr><td>' + (i+1) + '</td><td>'+officeData[i]+'</td><td>' + data[i].audit_due_from + '</td><td>' + data[i].audit_due_to + '</td>').trigger('create');
                    }
                }
                else{
                    $('#questionsTable').remove();
                    var records = "No Records Found!"
                    $('#assignmentDivTable').append('<table id="questionsTable"><tr><th>S.No</th><th>Branch Name</th><th>From Date</th><th>To date </th></tr>').trigger('create');
                        $('#questionsTable').append('<tr><td>' + "" + '</td><td>' + records  + '</td><td>' + "" + '</td><td>' + "" + '</td>').trigger('create');
                }
            }
        });
    }
}



function addDays(days,date_value) {
    var thisDate = new Date(date_value);
    thisDate.setDate(thisDate.getDate() + days);
    return thisDate;
}

function forRemoveSpecialCharcterCategory(currentVal) {
    var regex = /[^a-zA-Z0-9.,(){}\]\/#[#:&#@?\s]/g;
    if (regex.test(currentVal.value)) {
        currentVal.value = (currentVal.value.replace(regex, '')).trim();
    }
}

function forNumbers(currentVal) {
    var regex = /[^1-9]+/g;
    if (regex.test(currentVal.value)) {
        currentVal.value = (currentVal.value.replace(regex, '')).trim();
    }
}

