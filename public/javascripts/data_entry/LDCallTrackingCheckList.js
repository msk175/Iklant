$(document).ready(function() {
    var json = JSON.parse($("#resultId").val());
    var index = parseInt($("#selectedIndexId").val(),10);
    $("#callSuccessFieldsId").hide();
    $("#popupErrorLabel").text("")
    $("#isNeedPopupId").val(0);
    $("errorLabel").text("");
    $("#callTrackingIdId").val(json[0].call_tracking_id);
    $("#mrsLabelId").text(json[0].display_name);
    $("#groupNameLabelId").text(json[0].center_name);
    $("#apexAbishekLabelId").text("");
    $("#fvAnswerLabelId").text("");
    $("#foLabelId").text("");
    $("#disbursedAmountLabelId").text(json[0].loan_amount);
    $("#EMIAMountLabelId").text(json[0].emi_amount);
    $("#interestRateLabelId").text(json[0].interest_rate+"%");
    $("#tenurePeriodLabelId").text(json[0].tenure);
    $("#clientIdId").val(json[0].client_id);
    $("#groupIdId").val(json[0].group_id);
    $("#accountIdId").val(json[0].parent_account_id);
    $("#clientAccountIdId").val(json[0].account_id);
    $('#foId').prop('selectedIndex',0).selectmenu('refresh');
    $('#callStatusId').prop('selectedIndex',0).selectmenu('refresh');
    //$('select#productCatSelectMenu').attr('selectedIndex', -1);
    //$("#foId option[value='Select']").attr("selected", "selected").selectmenu('refresh');
    $('input[type=radio]').attr("checked",false).checkboxradio("refresh");
    //$('input[type=text]').val("");
    $("#mrsRemarksId").val("");
    $("#groupNameRemarksId").val("");
    $("#apexAbishekRemarksId").val("");
    $("#fvRemarksId").val("");
    $("#disbursedAmountRemarksId").val("");
    $("#EMIAMountRemarksId").val("");
    $("#interestRateRemarksId").val("");
    $("#tenurePeriodRemarksId").val("");
    $("#finLiteracyRemarksId").val("");
    $("#legalPaperRemarksId").val("");
    $("#processingFeeRemarksId").val("");
    $("#awarenessRemarksId").val("");

    $("#selectedIndexId").val(index);
    //$('input[type=text]').hide();

    /*$('input[name="groupName"]').attr('checked', false);
     $('input[name="apexAbishek"]').attr('checked', false);
     $('input[name="fv"]').attr('checked', false);
     $('input[name="disbursedAmount"]').attr('checked', false);
     $('input[name="EMIAMount"]').attr('checked', false);
     $('input[name="interestRate"]').attr('checked', false);
     $('input[name="tenurePeriod"]').attr('checked', false);*/
    $("#submitId").click(function(){
        $("errorLabel").text("");
        if(isCallInitiated() == true){
            if(validateFields()==true ){
                if($("#alternateNoId").val()== "" || ($("#alternateNoId").val()!="" && $("#alternateNoId").val().length == 10)) {
                    var data = {};
                    //alert($('input[name="mrs"]:checked').map(function() {return this.value;}).get().toString())
                    data.mrs = $('input[name="mrs"]:checked').map(function () {
                        return this.value;
                    }).get().toString();
                    data.groupName = $('input[name="groupName"]:checked').map(function () {
                        return this.value;
                    }).get().toString();
                    data.apexAbishek = $('input[name="apexAbishek"]:checked').map(function () {
                        return this.value;
                    }).get().toString();
                    data.fv = $('input[name="fv"]:checked').map(function () {
                        return this.value;
                    }).get().toString();
                    data.fo = $('#foId').val();
                    data.disbursedAmount = $('input[name="disbursedAmount"]:checked').map(function () {
                        return this.value;
                    }).get().toString();
                    data.EMIAMount = $('input[name="EMIAMount"]:checked').map(function () {
                        return this.value;
                    }).get().toString();
                    data.interestRate = $('input[name="interestRate"]:checked').map(function () {
                        return this.value;
                    }).get().toString();
                    data.tenurePeriod = $('input[name="tenurePeriod"]:checked').map(function () {
                        return this.value;
                    }).get().toString();
                    data.finLiteracy = $('input[name="finLiteracy"]:checked').map(function () {
                        return this.value;
                    }).get().toString();
                    data.legalPaper = $('input[name="legalPaper"]:checked').map(function () {
                        return this.value;
                    }).get().toString();
                    data.processingFee = $('input[name="processingFee"]:checked').map(function () {
                        return this.value;
                    }).get().toString();
                    data.awareness = $('input[name="awareness"]:checked').map(function () {
                        return this.value;
                    }).get().toString();
                    data.callTrackingCompleted = $('input[name="callTrackingCompleted"]:checked').map(function () {
                        return this.value;
                    }).get().toString();

                    data.tenurePeriodRemarks = $("#tenurePeriodRemarksId").val();
                    data.interestRateRemarks = $("#interestRateRemarksId").val();
                    data.EMIAMountRemarks = $("#EMIAMountRemarksId").val();
                    data.disbursedAmountRemarks = $("#disbursedAmountRemarksId").val();
                    data.fvRemarks = $("#fvRemarksId").val();
                    data.apexAbishekRemarks = $("#apexAbishekRemarksId").val();
                    data.groupNameRemarks = $("#groupNameRemarksId").val();
                    data.mrsRemarks = $("#mrsRemarksId").val();
                    data.clientId = $("#clientIdId").val();
                    data.groupId = $("#groupIdId").val();
                    data.accountId = $("#accountIdId").val();
                    data.clientAccountId = $("#clientAccountIdId").val();
                    data.callTrackingId = $("#callTrackingIdId").val();
                    data.finLiteracyRemarks = $("#finLiteracyRemarksId").val();
                    data.legalPaperRemarks = $("#legalPaperRemarksId").val();
                    data.processingFeeRemarks = $("#processingFeeRemarksId").val();
                    data.awarenessRemarks = $("#awarenessRemarksId").val();
                    data.callStatusRemarks = $("#callStatusRemarksId").val();
                    data.alternateNo = $("#alternateNoId").val();
                    data.callStatus = $("#callStatusId").val();
                    $.ajax({
                        beforeSend: function () {
                            $.mobile.showPageLoadingMsg();
                        },
                        complete: function () {
                            $.mobile.hidePageLoadingMsg();
                        },
                        type: 'POST',
                        data: JSON.stringify(data),
                        async: false,
                        contentType: 'application/json',
                        url: 'http://' + ajaxcallip + localStorage.contextPath + '/client/ci/LDCallTracking/updateClientLDTrack',
                        success: function (success) {
                            if (success.status == "success") {
                                $.mobile.hidePageLoadingMsg();
                                $("#errorLabel").text("Saved Successfully.");
                                var index = $("#selectedIndexId").val();
                                $.mobile.showPageLoadingMsg();
                                document.getElementById("BMFormId").action = localStorage.contextPath + "/client/ci/LDCallTracking/showLDCallTrackingGroupDetail";
                                document.getElementById("BMFormId").method = "POST";
                                document.getElementById("BMFormId").submit().refresh();
                            }
                            else if (success.status == "Session Expired") {
                                $("#errorLabel").text("Session Expired. Login again.");
                                var delay = 2000;//1 seconds
                                setTimeout(function () {
                                    $.mobile.showPageLoadingMsg();
                                    document.getElementById("BMFormId").action = localStorage.contextPath + "/client/ci/logout";
                                    document.getElementById("BMFormId").method = "GET";
                                    document.getElementById("BMFormId").submit().refresh();
                                    //your code to be executed after 1 seconds
                                }, delay);
                            }
                            else {
                                $(window).scrollTop(0);
                                $.mobile.hidePageLoadingMsg();
                                $("#errorLabel").text("Call Tracking Not Completed. Please try again later.");
                            }
                        }, error: function (jqXHR, textStatus, error) {
                            $(window).scrollTop(0);
                            console.log(error);
                            $.mobile.hidePageLoadingMsg();
                            $("#errorLabel").text("Call Tracking Not completed. Please try again later.");
                        }
                    });
                    /*$.mobile.showPageLoadingMsg();
                     document.getElementById("showLDClientFormID").action = localStorage.contextPath+"/client/ci/LDCallTracking/updateClientLDTrack";
                     document.getElementById("showLDClientFormID").method = "POST";
                     document.getElementById("showLDClientFormID").submit().refresh();*/
                }
                else{
                        $(window).scrollTop(0);
                        $("#popupErrorLabel").text("Alternate No Should be 10 digits.");
                }
            }
            else{
                $(window).scrollTop(0);
                $("#popupErrorLabel").text("Fill all mandatory fields.");
                //alert("Fill all mandatory fields.");
            }
        }else{
            $(window).scrollTop(0);
            $("#popupErrorLabel").text("Cannot submit details. Since Call is not initiated.")
        }
    })
});


function radioClickEvent(e){
    //alert(e.id)
    // alert(e.id.indexOf("No") > -1);
    if(e.id.indexOf("No") > -1){
        //alert(e.id.slice(0, - 4)+"Remarks"+"Id");
        var id = e.id.slice(0, - 4)+"Remarks"+"Id";
        $("#"+id).show();
    }else{
        // alert(e.id.slice(0, - 5)+"Remarks"+"Id");
        var id = e.id.slice(0, - 5)+"Remarks"+"Id";
        var textId = "#"+id;
        $(textId).val("");
        $("#"+id).hide();
    }
}

function radioClickEventForYes(e){
    //alert(e.id)
    // alert(e.id.indexOf("No") > -1);
    if(e.id.indexOf("Yes") > -1){
        //alert(e.id.slice(0, - 5)+"Remarks"+"Id");
        var id = e.id.slice(0, - 5)+"Remarks"+"Id";
        $("#"+id).show();
    }else{
        // alert(e.id.slice(0, - 4)+"Remarks"+"Id");
        var id = e.id.slice(0, - 4)+"Remarks"+"Id";
        var textId = "#"+id;
        $(textId).val("");
        $("#"+id).hide();
    }
}

function validateFields(){

    var mrsMandatory = 0;
    var groupNameMandatory = 0;
    var apexabishekMandatory = 0;
    var fvMandatory = 0;
    var foMandatatory = 0;
    var disAmtMandatory = 0;
    var emiAmtmandatory = 0;
    var intRateMandatory = 0;
    var tenureMandatory = 0;
    var finLiteracyMandatory = 0;
    var legalPaperMandatory = 0;
    var processingFeeMandatory = 0;
    var awarenessMandatory = 0;
    var callStatusMandatory = 0;
    var callTrackingCompletedMandatory = 0;
    var loanNotDisbursedMandatory = 0;

    if($("#callStatusId").val() == 147){
        if($('#mrsYesId').is(':checked') || $('#mrsNoId').is(':checked')){
            if($('#mrsNoId').is(':checked') == true){
                if($("#mrsRemarksId").val().trim() != ""){
                    mrsMandatory  = 1;
                }
                else {
                    mrsMandatory  = 0;
                }
            }
            else{
                mrsMandatory  = 1;
            }
        }else{
            mrsMandatory  = 0;
        }

        if($('#groupNameYesId').is(':checked') || $('#groupNameNoId').is(':checked')){
            if($('#groupNameNoId').is(':checked') == true){
                if($("#groupNameRemarksId").val().trim() != ""){
                    groupNameMandatory  = 1;
                }
                else {
                    groupNameMandatory  = 0;
                }
            }
            else{
                groupNameMandatory  = 1;
            }
        }else{
            groupNameMandatory  = 0;
        }


        if($('#apexAbishekYesId').is(':checked') || $('#apexAbishekNoId').is(':checked')){
            if($('#apexAbishekNoId').is(':checked') == true){
                if($("#apexAbishekRemarksId").val().trim() != ""){
                    apexabishekMandatory  = 1;
                }
                else {
                    apexabishekMandatory  = 0;
                }
            }
            else{
                apexabishekMandatory  = 1;
            }
        }else{
            apexabishekMandatory  = 0;
        }

        if($('#fvYesId').is(':checked') || $('#fvNoId').is(':checked')){
            if($('#fvNoId').is(':checked') == true){
                if($("#fvRemarksId").val().trim() != ""){
                    fvMandatory  = 1;
                }
                else {
                    fvMandatory  = 0;
                }
            }
            else{
                fvMandatory  = 1;
            }
        }
        else{
            fvMandatory  = 0;
        }

        if($("#foId").val() != '0'){
            foMandatatory = 1;
        }
        else{
            foMandatatory = 0;
        }
        if($('#disbursedAmountYesId').is(':checked') || $('#disbursedAmountNoId').is(':checked')){
            if($('#disbursedAmountNoId').is(':checked') == true){
                if($("#disbursedAmountRemarksId").val().trim() != ""){
                    disAmtMandatory  = 1;
                }
                else {
                    disAmtMandatory  = 0;
                }
            }
            else{
                disAmtMandatory  = 1;
            }
        }
        else{
            disAmtMandatory  = 0;
        }


        if($('#EMIAMountYesId').is(':checked') || $('#EMIAMountNoId').is(':checked')){
            if($('#EMIAMountNoId').is(':checked') == true){
                if($("#EMIAMountRemarksId").val().trim() != ""){
                    emiAmtmandatory  = 1;
                }
                else {
                    emiAmtmandatory  = 0;
                }
            }
            else{
                emiAmtmandatory  = 1;
            }
        }
        else{
            emiAmtmandatory  = 0;
        }



        if($('#interestRateYesId').is(':checked') || $('#interestRateNoId').is(':checked')){
            if($('#interestRateNoId').is(':checked') == true){
                if($("#interestRateRemarksId").val().trim() != ""){
                    intRateMandatory  = 1;
                }
                else {
                    intRateMandatory  = 0;
                }
            }
            else{
                intRateMandatory  = 1;
            }
        }
        else{
            intRateMandatory  = 0;
        }


        if($('#tenurePeriodYesId').is(':checked') || $('#tenurePeriodNoId').is(':checked')){
            if($('#tenurePeriodNoId').is(':checked') == true){
                if($("#tenurePeriodRemarksId").val().trim() != ""){
                    tenureMandatory  = 1;
                }
                else {
                    tenureMandatory  = 0;
                }
            }
            else{
                tenureMandatory  = 1;
            }
        }
        else{
            tenureMandatory  = 0;
        }

        if($('#finLiteracyYesId').is(':checked') || $('#finLiteracyNoId').is(':checked')){
            if($('#finLiteracyNoId').is(':checked') == true){
                if($("#finLiteracyRemarksId").val().trim() != ""){
                    finLiteracyMandatory  = 1;
                }
                else {
                    finLiteracyMandatory  = 0;
                }
            }
            else{
                finLiteracyMandatory  = 1;
            }
        }
        else{
            finLiteracyMandatory  = 0;
        }
        if($('#legalPaperYesId').is(':checked') || $('#legalPaperNoId').is(':checked')){
            if($('#legalPaperNoId').is(':checked') == true){
                if($("#legalPaperRemarksId").val().trim() != ""){
                    legalPaperMandatory  = 1;
                }
                else {
                    legalPaperMandatory  = 0;
                }
            }
            else{
                legalPaperMandatory  = 1;
            }
        }
        else{
            legalPaperMandatory  = 0;
        }

        if($('#processingFeeYesId').is(':checked') || $('#processingFeeNoId').is(':checked')){
            if($('#processingFeeYesId').is(':checked') == true){
                if($("#processingFeeRemarksId").val().trim() != ""){
                    processingFeeMandatory  = 1;
                }
                else {
                    processingFeeMandatory  = 0;
                }
            }
            else{
                processingFeeMandatory  = 1;
            }
        }
        else{
            processingFeeMandatory  = 0;
        }

        if($('#awarenessYesId').is(':checked') || $('#awarenessNoId').is(':checked')){
            if($('#awarenessNoId').is(':checked') == true){
                if($("#awarenessRemarksId").val().trim() != ""){
                    awarenessMandatory  = 1;
                }
                else {
                    awarenessMandatory  = 0;
                }
            }
            else{
                awarenessMandatory  = 1;
            }
        }
        else{
            awarenessMandatory  = 0;
        }

        if($('#callTrackingCompletedYesId').is(':checked') || $('#callTrackingCompletedNoId').is(':checked')){
            callTrackingCompletedMandatory  = 1;
        }
        else{
            callTrackingCompletedMandatory  = 0;
        }

        if($("#callStatusId").val() != '0'){
            callStatusMandatory = 1;
        }
        else{
            callStatusMandatory = 0;
        }
        /*  alert("mrsMandatory "+mrsMandatory);
         alert("groupNameMandatory "+groupNameMandatory);
         alert("apexabishekMandatory "+apexabishekMandatory);
         alert("fvMandatory "+fvMandatory);
         alert("foMandatatory "+foMandatatory);
         alert("disAmtMandatory "+disAmtMandatory);
         alert("emiAmtmandatory "+emiAmtmandatory);
         alert("intRateMandatory "+intRateMandatory);
         alert("tenureMandatory "+tenureMandatory);*/

        if(mrsMandatory  == 1 && groupNameMandatory  == 1 && apexabishekMandatory  == 1 && fvMandatory  == 1 && foMandatatory  == 1 && disAmtMandatory  == 1 && emiAmtmandatory  == 1 && intRateMandatory  == 1 && tenureMandatory == 1 && finLiteracyMandatory == 1 && legalPaperMandatory == 1 && processingFeeMandatory == 1 && awarenessMandatory == 1&&callStatusMandatory==1 && callTrackingCompletedMandatory == 1){
            return true;
        }
        else{
            $("#isNeedPopupId").val(1);
            return false;
        }

        /*$("#mrsRemarksId").val("");
         $("#groupNameRemarksId").val("");
         $("#apexAbishekRemarksId").val("");
         $("#fvRemarksId").val("1");
         $("#disbursedAmountRemarksId").val("");
         $("#EMIAMountRemarksId").val("");
         $("#interestRateRemarksId").val("");
         $("#tenurePeriodRemarksId").val("");*/
    }else if($("#callStatusId").val() == 167){
        if($('#callTrackingCompletedYesId').is(':checked') || $('#callTrackingCompletedNoId').is(':checked')){
            callTrackingCompletedMandatory  = 1;
        }
        else{
            callTrackingCompletedMandatory  = 0;
        }

        if($("#callStatusId").val() != '0'){
            callStatusMandatory = 1;
        }
        else{
            callStatusMandatory = 0;
        }

        if($("#callStatusRemarksId").val() != ''){
            loanNotDisbursedMandatory = 1;
        }
        else{
            loanNotDisbursedMandatory = 0;
        }

        if(callTrackingCompletedMandatory == 1 && callStatusMandatory ==1 && loanNotDisbursedMandatory==1){
            return true;
        }
        else{
            $("#isNeedPopupId").val(1);
            return false;
        }
    }
    else{
        if($('#callTrackingCompletedYesId').is(':checked') || $('#callTrackingCompletedNoId').is(':checked')){
            callTrackingCompletedMandatory  = 1;
        }
        else{
            callTrackingCompletedMandatory  = 0;
        }

        if($("#callStatusId").val() != '0'){
            callStatusMandatory = 1;
        }
        else{
            callStatusMandatory = 0;
        }
        if(callTrackingCompletedMandatory == 1 && callStatusMandatory ==1){
            return true;
        }
        else{
            $("#isNeedPopupId").val(1);
            return false;
        }

    }

}

function isCallInitiated(){
    //alert($("#callTrackingIdId").val());
    if($("#callTrackingIdId").val() != '0'){
        return true;
    }
    else{
        return false;
    }
}

function operationLDBack(){
    $.mobile.showPageLoadingMsg();
    document.getElementById("BMFormId").action = localStorage.contextPath+"/client/ci/LDCallTracking/showLDCallTrackingGroupDetail";
    document.getElementById("BMFormId").method = "POST";
    document.getElementById("BMFormId").submit().refresh();
}