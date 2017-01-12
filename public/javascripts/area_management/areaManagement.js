$(document).ready(function () {
    var checkboxes = $("input[type=checkbox]");

    checkboxes.on("change", function (e) {
        if (!e.target.id) {
            return;
        }
        if (e.target.checked) {
            $("." + e.target.id).append('<input type="text" id="' + e.target.id + '_text" name="' + e.target.id + '_text" style="text-align:right" onkeyup="forNumbers(this)" maxlength="6">').trigger('create');
            $("#" + e.target.id + "_text").focus();
        }
        else {
            $("#" + e.target.id + "_text").remove();
        }
    });
    var radio = $("input[type=radio]");

    radio.on("click", function (e) {
        if (e.target.value == 'Yes') {
            $("." + e.target.id).append('<input type="text" id="' + e.target.id + '_text" name="' + e.target.id + '_text" align="right" onkeyup="forNamesValidation(this)" maxlength="190">').trigger('create');
            $("#" + e.target.id + "_text").focus();
            document.getElementById(e.target.id).disabled = true;
        }
        else if (e.target.value == 'No') {
            $("#PoliticalInfluence").text("");
            $(".political_influence_Yes>div").removeClass("ui-input-text ui-shadow-inset ui-corner-all ui-btn-shadow ui-body-b");
            $("#political_influence_Yes_text").remove();
            document.getElementById("political_influence_Yes").disabled = false;
        }
    });

    $("#editAreaDiv").hide();
    $("#viewAreaDiv").hide();

    $("#area_name").focusout(function(){
        var existingAreaName = $("#existingAreaCodes").val().split(",");
        var enteredAreaName = $("#area_name").val();
        var trimmedString = $.trim(enteredAreaName);
        if(existingAreaName != "") {
            for (var i = 0; i < existingAreaName.length; i++) {
                if (trimmedString == existingAreaName[i]) {
                    $("#AreaName").text("Area Name already Exists");
                    $("#area_name").focus();
                    $(window).scrollTop(0);
                    return false;
                }
                else {
                    $("#AreaName").text("");
                }
            }
        }
    });

    $("#area_name").keydown(function(event){
        return ((!event.shiftKey && (event.keyCode == 190)) || (event.keyCode >= 65 && event.keyCode  <= 90) || (event.keyCode == 8 || event.keyCode  == 9 || event.keyCode  == 32 || event.keyCode  == 37 || event.keyCode  == 39 || event.keyCode  == 46 ) );
    });

    $("#area_name_edit").focusout(function(){
        var existingAreaName = $("#existingAreaCodes").val().split(",");
        var enteredAreaName = $("#area_name_edit").val();
        var trimmedString = $.trim(enteredAreaName);
        for(var i = 0; i < existingAreaName.length; i++) {
            if(trimmedString == existingAreaName[i].toLowerCase() || trimmedString == existingAreaName[i]){
                $("#errorMessageId").text("Area Name already Exists");
                $("#area_name_edit").focus();
                $(window).scrollTop(0);
                return false;
            }
            else{
                $("#errorMessageId").text("");
            }
        }
    });

    $("#area_name_edit").keydown(function(event){
        return ((!event.shiftKey && (event.keyCode == 190)) || (event.keyCode >= 65 && event.keyCode  <= 90) || (event.keyCode == 8 || event.keyCode  == 9 || event.keyCode  == 32 || event.keyCode  == 37 || event.keyCode  == 39 || event.keyCode  == 46 ) );
    });
})

function operationSubmitForAreaMgmt(operationId) {
    $.mobile.showPageLoadingMsg();
    $('#operationId').val(operationId);
    document.getElementById('areaManagementForm').method = "POST";
    document.getElementById('areaManagementForm').action = localStorage.contextPath+"/client/ci/area/submitAreaManagement";
    document.getElementById('areaManagementForm').submit().refresh();
}

function submitAreaCreation() {
    if ($('#area_name').val().trim() == "") {
        $("p").text('');
        $('#area_name').focus();
        $(window).scrollTop(0);
        $('#AreaName').text("Area name should not empty");
    }
    else if($('#area_name').val().trim().length<3){
        $("p").text('');
        $('#area_name').focus();
        $(window).scrollTop(0);
        $('#AreaName').text("Area name must have minimum 3 characters");
    }
    else if ($('#population_Male').val() == "" || $('#population_Male').val() == 0) {
        $("p").text('');
        $('#population_Male').focus()
        $(window).scrollTop(0);
        $('#Population').text("Male population should not empty/zero");
    }
    else if ($('#population_Female').val() == "" || $('#population_Female').val() == 0) {
        $("p").text('');
        $('#population_Female').focus();
        $(window).scrollTop(0);
        $('#Population').text("Female population should not empty/zero");
    }
    else if ($('#poverty_level_Below_Poverty_Level').val() == "" && $('#poverty_level_Above_Poverty_Level').val() == "" && $('#poverty_level_Middle_Class_Level').val() == "" && $('#poverty_level_Above_Middle_Class_Level').val() == "") {
        $("p").text('');
        $(window).scrollTop(0);
        $('#poverty_level_Below_Poverty_Level').focus();
        $('#PovertyLevel').text("Please fill poverty count");
    }
    else if ((parseInt($('#population_Male').val())+parseInt($('#population_Female').val())) != (parseInt($('#poverty_level_Below_Poverty_Level').val())+parseInt($('#poverty_level_Above_Poverty_Level').val())+parseInt($('#poverty_level_Middle_Class_Level').val())+parseInt($('#poverty_level_Above_Middle_Class_Level').val()))) {
        $("p").text('');
        $(window).scrollTop(0);
        $('#population_Male').focus();
        $('#errorMessageId').text("Total population count must be equal to total poverty level count");
    }
    else if($("#political_influence_Yes").is(":checked") && $('#political_influence_Yes_text').val().trim() == ""){
        $("p").text('');
        $(window).scrollTop(0);
        $('#political_influence_Yes_text').focus();
        $('#PoliticalInfluence').text("Please fill the political influence details");
    }
    else if ($('#other_mfi_count').val() == "") {
        $("p").text('');
        $(window).scrollTop(0);
        $('#TotalOtherMFICount').text("Please fill other MFI count");
        $('#other_mfi_count').focus();
    }
    else if ($('#religion_Hindu').val() == "" && $('#religion_Muslim').val() == "" && $('#religion_Christian').val() == "" && $('#religion_Others').val() == "") {
        $("p").text('');
        $(window).scrollTop(0);
        $('#religion_Hindu').focus();
        $('#Religion').text("Please fill religion percentage");
    }
    else if ($('#local_money_lenders').val() == "") {
        $("p").text('');
        $(window).scrollTop(0);
        $('#LocalMoneyLenders').text("Please fill local money lenders count");
        $('#local_money_lenders').focus();
    }
    else if ($('#potential_customer_list').val() == "") {
        $("p").text('');
        $(window).scrollTop(0);
        $('#PotentialCustomerList').text("Please fill potential customer count");
        $('#potential_customer_list').focus();
    }
    else if ($('#business_projection').val() == "") {
        $("p").text('');
        $(window).scrollTop(0);
        $('#BusinessProjectionFor6Months').text("Please fill business projection for 6 months");
        $('#business_projection').focus();
    }
    else if ($('#distance').val() == "") {
        $("p").text('');
        $(window).scrollTop(0);
        $('#distance').focus();
        $('#DistanceFromBranch').text("Please fill distance from Branch");
    }
    else if(!$("#educational_institution_School").is(":checked") && !$("#educational_institution_College").is(":checked")){
        $("p").text('');
        $(window).scrollTop(0);
        $('#educational_institution_School').focus();
        $('#EducationalInstitutions').text("Please enter educational institutions details");
    }
    else if($("#educational_institution_School").is(":checked") && $('#educational_institution_School_text').val().trim() == ""){
        $("p").text('');
        $(window).scrollTop(0);
        $('#educational_institution_School_text').focus();
        $('#EducationalInstitutions').text("Please fill the school count");
    }
    else if($("#educational_institution_College").is(":checked") && $('#educational_institution_College_text').val().trim() == ""){
        $("p").text('');
        $(window).scrollTop(0);
        $('#educational_institution_College_text').focus();
        $('#EducationalInstitutions').text("Please fill the college count");
    }
    else if ($('#landmark').val().trim() == "") {
        $("p").text('');
        $(window).scrollTop(0);
        $('#Landmark').text("Please fill landmark");
        $('#landmark').focus()
    }
    else if ($('#primary_occupation').val().trim() == "") {
        $("p").text('');
        $(window).scrollTop(0);
        $('#PrimaryOccupation').text("Please fill primary occupation");
        $('#primary_occupation').focus();
    }
    else if(!$("#frequency_of_income_Daily").is(":checked") && !$("#frequency_of_income_Weekly").is(":checked") && !$("#frequency_of_income_Fortnightly").is(":checked") && !$("#frequency_of_income_Monthly").is(":checked")){
        $("p").text('');
        $(window).scrollTop(0);
        $('#frequency_of_income_Daily').focus();
        $('#FrequencyofIncome').text("Please enter the frequency of income");
    }
    else if($("#frequency_of_income_Daily").is(":checked") && $('#frequency_of_income_Daily_text').val().trim() == ""){
        $("p").text('');
        $(window).scrollTop(0);
        $('#frequency_of_income_Daily_text').focus();
        $('#FrequencyofIncome').text("Please fill the daily income member's count");
    }
    else if($("#frequency_of_income_Weekly").is(":checked") && $('#frequency_of_income_Weekly_text').val().trim() == ""){
        $("p").text('');
        $(window).scrollTop(0);
        $('#frequency_of_income_Weekly_text').focus();
        $('#FrequencyofIncome').text("Please fill the weekly income member's count");
    }
    else if($("#frequency_of_income_Fortnightly").is(":checked") && $('#frequency_of_income_Fortnightly_text').val().trim() == ""){
        $("p").text('');
        $(window).scrollTop(0);
        $('#frequency_of_income_Forthnightly_text').focus();
        $('#FrequencyofIncome').text("Please fill the fortnightly income member's count");
    }
    else if($("#frequency_of_income_Monthly").is(":checked") && $('#frequency_of_income_Monthly_text').val().trim() == ""){
        $("p").text('');
        $(window).scrollTop(0);
        $('#frequency_of_income_Monthly_text').focus();
        $('#FrequencyofIncome').text("Please fill the monthly income member's count");
    }
    else {
        $("p").text('');
        $.mobile.showPageLoadingMsg();
        document.getElementById('areaManagementForm').method = "POST";
        document.getElementById('areaManagementForm').action = localStorage.contextPath+"/client/ci/area/saveArea";
        document.getElementById('areaManagementForm').submit().refresh();
    }
}

function populateAreaDetails(areaCodeId, officeId, role,status) {
    $("#areaListDiv").hide();
    $("#successMessage").text("");
    $('#areaStatus').val(status);
    if (role == "SMH") {
        $("#viewAreaDiv").show();
        $('#approveOrRejectAreaCode').val(areaCodeId);
        $('#selectedOfficeId').val(officeId);
    }
    else {
        $("#editAreaDiv").show();
        $('#modifyAreaCode').val(areaCodeId);
    }
    if (areaCodeId != 0) {
        var data = {};
        data.areaCodeId = areaCodeId;

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
            url: 'http://' + ajaxcallip + localStorage.contextPath+'/client/ci/populateAreaDetails',
            success: function (dataValue) {
                var data = dataValue.areaDetails;
                if (role == "SMH") {
                    for (var i = 0; i < data.length; i++) {
                        if (data[i].subQuestions != null) {
                            if(data[i].input_type == 'text'){
                                $('#' + data[i].description + "_" + data[i].subQuestions).val(data[i].response);
                            }
                            else {
                                if(data[i].response != "" || data[i].subQuestions == 'No') {
                                    textField = (data[i].input_type == 'checkbox')?'<input type="text" readonly="readonly" id="' + data[i].description + "_" + data[i].subQuestions + '_view_text" name="' + data[i].description + "_" + data[i].subQuestions + '_text"  style="text-align:right" value='+data[i].response+'>':'<input type="text" readonly="readonly" id="' + data[i].description + "_" + data[i].subQuestions + '_text" name="' + data[i].description + "_" + data[i].subQuestions + '_view_text" value='+data[i].response+'>'
                                    $("." + data[i].description + "_" + data[i].subQuestions+"_view").append(textField).trigger('create');
                                    $('#' + data[i].description + "_" + data[i].subQuestions + "_view").attr("checked", "true").checkboxradio('refresh');
                                }
                                else{
                                    $('#' + data[i].description + "_" + data[i].subQuestions + "_view").val(data[i].response);
                                }
                            }
                        }
                        else {
                            $('#' + data[i].description).val(data[i].response);
                            $('#' + data[i].description + "Hidden").val(data[i].question_id);
                        }
                    }
                } else {
                    $('#existingAreaCodes').val(dataValue.existingAreaCodes);
                    for (var i = 0; i < data.length; i++) {
                        if (data[i].subQuestions != null) {
                            if(data[i].input_type == 'text'){
                                $('#' + data[i].description + "_" + data[i].subQuestions + "_edit").val(data[i].response);
                            }
                            else {
                                if(data[i].response != "" || data[i].subQuestions == 'No') {
                                    textField = (data[i].input_type == 'checkbox')?'<input type="text" id="' + data[i].description + "_" + data[i].subQuestions + '_text" name="' + data[i].description + "_" + data[i].subQuestions + '_text" style="text-align:right" onkeyup="forNumbers(this)" maxlength="6" value='+data[i].response+'>':(data[i].subQuestions != 'No')?'<input type="text" id="' + data[i].description + "_" + data[i].subQuestions + '_text"  onkeyup="forNamesValidation(this)" maxlength="190" name="' + data[i].description + "_" + data[i].subQuestions + '_text"value='+data[i].response+'>':'';
                                    $("." + data[i].description + "_" + data[i].subQuestions).append(textField).trigger('create');
                                    $('#' + data[i].description + "_" + data[i].subQuestions).attr("checked", "true").checkboxradio('refresh');
                                }
                                else{
                                    $('#' + data[i].description + "_" + data[i].subQuestions).val(data[i].response);
                                }
                            }
                        }
                        else {
                            if(data[i].question_id == 16) {
                                if(dataValue.status == 1){
                                    $('#' + data[i].description + "_edit").val(data[i].response);
                                }else
                                {
                                    $('#remarksDiv').remove();
                                }
                            }
                            else
                                $('#' + data[i].description + "_edit").val(data[i].response);
                        }
                    }
                }
            }
        });
    }
}

function approveOrRejectArea(areaCode, officeId, flag) {
    if(areaCode == ''){
        $("#areaListDiv").hide();
        $("#viewAreaDiv").show();
     }
    var areaCodeId = $('#approveOrRejectAreaCode').val();
    var hiddenOfficeId = $('#selectedOfficeId').val();
    var data = {};
    data.areaCodeId = (areaCodeId == '')?areaCode:areaCodeId;
    data.officeId = (hiddenOfficeId == '')?officeId:hiddenOfficeId;
    data.flag = flag;
    data.question_id = $('#remarks_for_SMHHidden').val();
    data.remarks_for_SMH = $('#remarks_for_SMH').val();
    var message = (flag == 1)?"Area approved successfully":"Area rejected successfully";
    if(flag == 1 || (flag == 0 && $('#remarks_for_SMH').val().trim() != "")){
        $.post('http://' + ajaxcallip + localStorage.contextPath+'/client/ci/approveOrRejectArea',
            data,
            function (status) {
                if (status == "success") {
                    $('#listoffice').val(data.officeId);
                    $('#statusMessage').val(message);
                    document.getElementById('areaManagementForm').method = "POST";
                    document.getElementById('areaManagementForm').action = localStorage.contextPath+"/client/ci/area/submitAreaManagement";
                    document.getElementById('areaManagementForm').submit().refresh();
                } else {
                    $('#errorMessageIdSMH').text("Your request not processed. Please try again");
                }
            }
        );
    }
    else{
        $('#remarks_for_SMH').focus();
        $('#errorMessageIdSMH').text("Please fill remarks to reject");
    }
}

function updateArea() {
    if ($('#area_name_edit').val().trim() == "") {
        $("p").text('');
        $('#area_name_edit').focus();
        $(window).scrollTop(0);
        $('#errorMessageId').text("Area name should not empty");
    }
    else if($('#area_name_edit').val().trim().length<3){
        $("p").text('');
        $('#area_name_edit').focus();
        $(window).scrollTop(0);
        $('#errorMessageId').text("Area name must have minimum 3 characters");
    }
    else if ($('#population_Male_edit').val() == "" || $('#population_Male_edit').val() == 0) {
        $("p").text('');
        $('#population_Male_edit').focus()
        $(window).scrollTop(0);
        $('#Population').text("Male population count should not empty/zero");
    }
    else if ($('#population_Female_edit').val() == "" || $('#population_Female_edit').val() == 0) {
        $("p").text('');
        $('#population_Female_edit').focus();
        $(window).scrollTop(0);
        $('#Population').text("Female population count should not empty/zero");
    }
    else if ($('#poverty_level_Below_Poverty_Level_edit').val() == "" && $('#poverty_level_Above_Poverty_Level_edit').val() == "" && $('#poverty_level_Middle_Class_Level_edit').val() == "" && $('#poverty_level_Above_Middle_Class_Level_edit').val() == "") {
        $("p").text('');
        $(window).scrollTop(0);
        $('#poverty_level_Below_Poverty_Level_edit').focus()
        $('#PovertyLevel').text("Please fill poverty count");
    }
    else if ((parseInt($('#population_Male_edit').val())+parseInt($('#population_Female_edit').val())) != (parseInt($('#poverty_level_Below_Poverty_Level_edit').val())+parseInt($('#poverty_level_Above_Poverty_Level_edit').val())+parseInt($('#poverty_level_Middle_Class_Level_edit').val())+parseInt($('#poverty_level_Above_Middle_Class_Level_edit').val()))) {
        $("p").text('');
        $(window).scrollTop(0);
        $('#population_Male_edit').focus()
        $('#errorMessageId').text("Total population count must be equal to total poverty level count");
    }
    else if ($('#other_mfi_count_edit').val() == "") {
        $("p").text('');
        $(window).scrollTop(0);
        $('#errorMessageId').text("Please fill other MFI count");
        $('#other_mfi_count_edit').focus();
    }
    else if ($('#religion_Hindu_edit').val() == "" && $('#religion_Muslim_edit').val() == "" && $('#religion_Chirstian_edit').val() == "" && $('#religion_Others_edit').val() == "") {
        $("p").text('');
        $(window).scrollTop(0);
        $('#Religion').text("Please fill religion count");
    }
    else if ($('#local_money_lenders_edit').val() == "") {
        $("p").text('');
        $(window).scrollTop(0);
        $('#errorMessageId').text("Please fill local money lenders count");
        $('#local_money_lenders_edit').focus();
    }
    else if($("#political_influence_Yes").is(":checked") && $('#political_influence_Yes_text').val().trim() == ""){
        $("p").text('');
        $(window).scrollTop(0);
        $('#political_influence_Yes_text').focus();
        $('#PoliticalInfluence').text("Please fill the political influence details");
    }
    else if ($('#potential_customer_list_edit').val() == "") {
        $("p").text('');
        $(window).scrollTop(0);
        $('#errorMessageId').text("Please fill potential customer count");
        $('#potential_customer_list_edit').focus();
    }
    else if ($('#business_projection_edit').val() == "") {
        $("p").text('');
        $(window).scrollTop(0);
        $('#errorMessageId').text("Please fill business projection for 6 months");
        $('#business_projection_edit').focus();
    }
    else if ($('#distance_edit').val() == "") {
        $("p").text('');
        $(window).scrollTop(0);
        $('#distance_edit').focus();
        $('#errorMessageId').text("Please fill distance from Branch");
    }
    else if(!$("#educational_institution_School").is(":checked") && !$("#educational_institution_College").is(":checked")){
        $("p").text('');
        $('#educational_institution_School').focus();
        $('#EducationalInstitutions').text("Please enter educational institutions details");
    }
    else if($("#educational_institution_School").is(":checked") && $('#educational_institution_School_text').val().trim() == ""){
        $("p").text('');
        $(window).scrollTop(0);
        $('#educational_institution_School_text').focus();
        $('#EducationalInstitutions').text("Please fill the school count");
    }
    else if($("#educational_institution_College").is(":checked") && $('#educational_institution_College_text').val().trim() == ""){
        $("p").text('');
        $(window).scrollTop(0);
        $('#educational_institution_College_text').focus();
        $('#EducationalInstitutions').text("Please fill the college count");
    }
    else if ($('#landmark_edit').val().trim() == "") {
        $("p").text('');
        $(window).scrollTop(0);
        $('#errorMessageId').text("Please fill landmark");
        $('#landmark_edit').focus()
    }
    else if ($('#primary_occupation_edit').val().trim() == "") {
        $("p").text('');
        $(window).scrollTop(0);
        $('#errorMessageId').text("Please fill primary occupation");
        $('#primary_occupation_edit').focus();
    }
    else if(!$("#frequency_of_income_Daily").is(":checked") && !$("#frequency_of_income_Weekly").is(":checked") && !$("#frequency_of_income_Fortnightly").is(":checked") && !$("#frequency_of_income_Monthly").is(":checked")){
        $("p").text('');
        $('#frequency_of_income_Daily').focus();
        $('#FrequencyofIncome').text("Please enter the frequency of income");
    }
    else if($("#frequency_of_income_Daily").is(":checked") && $('#frequency_of_income_Daily_text').val().trim() == ""){
        $("p").text('');
        $(window).scrollTop(0);
        $('#frequency_of_income_Daily_text').focus();
        $('#FrequencyofIncome').text("Please fill the daily income member's count");
    }
    else if($("#frequency_of_income_Weekly").is(":checked") && $('#frequency_of_income_Weekly_text').val().trim() == ""){
        $("p").text('');
        $(window).scrollTop(0);
        $('#frequency_of_income_Weekly_text').focus();
        $('#FrequencyofIncome').text("Please fill the weekly income member's count");
    }
    else if($("#frequency_of_income_Fortnightly").is(":checked") && $('#frequency_of_income_Fortnightly_text').val().trim() == ""){
        $("p").text('');
        $(window).scrollTop(0);
        $('#frequency_of_income_Forthnightly_text').focus();
        $('#FrequencyofIncome').text("Please fill the fortnightly income member's count");
    }
    else if($("#frequency_of_income_Monthly").is(":checked") && $('#frequency_of_income_Monthly_text').val().trim() == ""){
        $("p").text('');
        $(window).scrollTop(0);
        $('#frequency_of_income_Monthly_text').focus();
        $('#FrequencyofIncome').text("Please fill the monthly income member's count");
    }
    else {
        $("p").text('');
        $.mobile.showPageLoadingMsg();
        document.getElementById('areaManagementForm').method = "POST";
        document.getElementById('areaManagementForm').action = localStorage.contextPath+"/client/ci/area/updateArea";
        document.getElementById('areaManagementForm').submit().refresh();
    }
}

function retrieveAreaList() {
    $.mobile.showPageLoadingMsg();
    document.getElementById('areaManagementForm').method = "POST";
    document.getElementById('areaManagementForm').action = localStorage.contextPath+"/client/ci/area/submitAreaManagement";
    document.getElementById('areaManagementForm').submit().refresh();
}

function cancelAreaOperation(officeId) {
    $('#listoffice').val(officeId);
    document.getElementById('areaManagementForm').method = "POST";
    document.getElementById('areaManagementForm').action = localStorage.contextPath+"/client/ci/area/submitAreaManagement";
    document.getElementById('areaManagementForm').submit().refresh();
}


function assignFOSubmission(noOfAreas){
    var areaCodeId = new Array();
    var checkedFlag = 0 ;
    var count = 0;
    for(var i =0; i<noOfAreas; i++){
        if($("#areaCodeChkId"+i).is(':checked') == true){
            checkedFlag = 1;
            areaCodeId[count] = $("#areaCodeId"+i).val();
            count++;
        }
    }
    $("#areaCodesId").val(areaCodeId);
    if($("#selectFO").val() == "") {
        $("#errorField").text("Please select FO");
    }
    else if(checkedFlag == 0){
        $("#errorField").text(" Please select atleast one area to assign");
    }
    else {
        $.mobile.showPageLoadingMsg();
        document.getElementById("areaManagementForm").method='POST';
        document.getElementById("areaManagementForm").action=localStorage.contextPath+"/client/ci/assignArea";
        document.getElementById("areaManagementForm").submit();
    }
}

function releaseArea(areaCode, foId, releaseFlag){
    $.mobile.showPageLoadingMsg();
    $('#existingFieldOfficerId').val(foId);
    document.getElementById("areaManagementForm").method='POST';
    document.getElementById("areaManagementForm").action=localStorage.contextPath+"/client/ci/area/releaseArea/"+areaCode+"/"+releaseFlag;
    document.getElementById("areaManagementForm").submit();
}