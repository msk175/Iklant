$(document).ready(function() {
    $("#mrsRemarksId").keypress(function(event){
        var regex = new RegExp("^[a-zA-Z0-9 _]+$");
        var key = String.fromCharCode(!event.charCode ? event.which : event.charCode);
        if (!regex.test(key)) {
            event.preventDefault();
            return false;
        }
    });

    $("#groupNameRemarksId").keypress(function(event){
        var regex = new RegExp("^[a-zA-Z0-9 _]+$");
        var key = String.fromCharCode(!event.charCode ? event.which : event.charCode);
        if (!regex.test(key)) {
            event.preventDefault();
            return false;
        }
    });

    $("#apexAbishekRemarksId").keypress(function(event){
        var regex = new RegExp("^[a-zA-Z0-9 _]+$");
        var key = String.fromCharCode(!event.charCode ? event.which : event.charCode);
        if (!regex.test(key)) {
            event.preventDefault();
            return false;
        }
    });

    $("#fvRemarksId").keypress(function(event){
        var regex = new RegExp("^[a-zA-Z0-9 _]+$");
        var key = String.fromCharCode(!event.charCode ? event.which : event.charCode);
        if (!regex.test(key)) {
            event.preventDefault();
            return false;
        }
    });

    $("#disbursedAmountRemarksId").keypress(function(event){
        var regex = new RegExp("^[a-zA-Z0-9 _]+$");
        var key = String.fromCharCode(!event.charCode ? event.which : event.charCode);
        if (!regex.test(key)) {
            event.preventDefault();
            return false;
        }
    });

    $("#EMIAMountRemarksId").keypress(function(event){
        var regex = new RegExp("^[a-zA-Z0-9 _]+$");
        var key = String.fromCharCode(!event.charCode ? event.which : event.charCode);
        if (!regex.test(key)) {
            event.preventDefault();
            return false;
        }
    });

    $("#interestRateRemarksId").keypress(function(event){
        var regex = new RegExp("^[a-zA-Z0-9 _]+$");
        var key = String.fromCharCode(!event.charCode ? event.which : event.charCode);
        if (!regex.test(key)) {
            event.preventDefault();
            return false;
        }
    });

    $("#tenurePeriodRemarksId").keypress(function(event){
        var regex = new RegExp("^[a-zA-Z0-9 _]+$");
        var key = String.fromCharCode(!event.charCode ? event.which : event.charCode);
        if (!regex.test(key)) {
            event.preventDefault();
            return false;
        }
    });


    $("#finLiteracyRemarksId").keypress(function(event){
        var regex = new RegExp("^[a-zA-Z0-9 _]+$");
        var key = String.fromCharCode(!event.charCode ? event.which : event.charCode);
        if (!regex.test(key)) {
            event.preventDefault();
            return false;
        }
    });

    $("#legalPaperRemarksId").keypress(function(event){
        var regex = new RegExp("^[a-zA-Z0-9 _]+$");
        var key = String.fromCharCode(!event.charCode ? event.which : event.charCode);
        if (!regex.test(key)) {
            event.preventDefault();
            return false;
        }
    });


    $("#processingFeeRemarksId").keypress(function(event){
        var regex = new RegExp("^[a-zA-Z0-9 _]+$");
        var key = String.fromCharCode(!event.charCode ? event.which : event.charCode);
        if (!regex.test(key)) {
            event.preventDefault();
            return false;
        }
    });

    $("#awarenessRemarksId").keypress(function(event){
        var regex = new RegExp("^[a-zA-Z0-9 _]+$");
        var key = String.fromCharCode(!event.charCode ? event.which : event.charCode);
        if (!regex.test(key)) {
            event.preventDefault();
            return false;
        }
    });


    $("#callStatusRemarksId").keypress(function(event){
        var regex = new RegExp("^[a-zA-Z0-9 _]+$");
        var key = String.fromCharCode(!event.charCode ? event.which : event.charCode);
        if (!regex.test(key)) {
            event.preventDefault();
            return false;
        }
    });

    $("#alternateNoId").keypress(function(event){
        var regex = new RegExp("^[0-9]+$");
        var key = String.fromCharCode(!event.charCode ? event.which : event.charCode);
        if (!regex.test(key)) {
            event.preventDefault();
            return false;
        }
    });

    $("#alternateNoId").focusout(function(event){
        var currentVal = $(this).val();
        var regex = new RegExp("^[0-9]+$");
        if (!regex.test(currentVal)) {
            $(this).val("");

        }
    });


    $("#callStatusRemarksId").focusout(function(event){
        var currentVal = $(this).val();
        var regex = new RegExp("^[a-zA-Z0-9 _]+$");
        if (!regex.test(currentVal)) {
            $(this).val("");

        }
    });

    $("#mrsRemarksId").focusout(function(event){
        var currentVal = $(this).val();
        var regex = new RegExp("^[a-zA-Z0-9 _]+$");
        if (!regex.test(currentVal)) {
            $(this).val("");

        }
    });

    $("#groupNameRemarksId").focusout(function(event){
        var currentVal = $(this).val();
        var regex = new RegExp("^[a-zA-Z0-9 _]+$");
        if (!regex.test(currentVal)) {
            $(this).val("");

        }
    });

    $("#apexAbishekRemarksId").focusout(function(event){
        var currentVal = $(this).val();
        var regex = new RegExp("^[a-zA-Z0-9 _]+$");
        if (!regex.test(currentVal)) {
            $(this).val("");

        }
    });

    $("#fvRemarksId").focusout(function(event){
        var currentVal = $(this).val();
        var regex = new RegExp("^[a-zA-Z0-9 _]+$");
        if (!regex.test(currentVal)) {
            $(this).val("");

        }
    });

    $("#disbursedAmountRemarksId").focusout(function(event){
        var currentVal = $(this).val();
        var regex = new RegExp("^[a-zA-Z0-9 _]+$");
        if (!regex.test(currentVal)) {
            $(this).val("");

        }
    });

    $("#EMIAMountRemarksId").focusout(function(event){
        var currentVal = $(this).val();
        var regex = new RegExp("^[a-zA-Z0-9 _]+$");
        if (!regex.test(currentVal)) {
            $(this).val("");

        }
    });

    $("#interestRateRemarksId").focusout(function(event){
        var currentVal = $(this).val();
        var regex = new RegExp("^[a-zA-Z0-9 _]+$");
        if (!regex.test(currentVal)) {
            $(this).val("");

        }
    });

    $("#tenurePeriodRemarksId").focusout(function(event){
        var currentVal = $(this).val();
        var regex = new RegExp("^[a-zA-Z0-9 _]+$");
        if (!regex.test(currentVal)) {
            $(this).val("");

        }
    });
    $("#finLiteracyRemarksId").focusout(function(event){
        var currentVal = $(this).val();
        var regex = new RegExp("^[a-zA-Z0-9 _]+$");
        if (!regex.test(currentVal)) {
            $(this).val("");

        }
    });
    $("#legalPaperRemarksId").focusout(function(event){
        var currentVal = $(this).val();
        var regex = new RegExp("^[a-zA-Z0-9 _]+$");
        if (!regex.test(currentVal)) {
            $(this).val("");

        }
    });
    $("#processingFeeRemarksId").focusout(function(event){
        var currentVal = $(this).val();
        var regex = new RegExp("^[a-zA-Z0-9 _]+$");
        if (!regex.test(currentVal)) {
            $(this).val("");

        }
    });

    $("#awarenessRemarksId").focusout(function(event){
        var currentVal = $(this).val();
        var regex = new RegExp("^[a-zA-Z0-9 _]+$");
        if (!regex.test(currentVal)) {
            $(this).val("");

        }
    });
    $('#callStatusId').on('change', function() {
        if(this.value == 147 ){ // or $(this).val()
            $("#scrollId").height(600);
            $("#callSuccessFieldsId").show();
            $("#callStatusRemarksId").hide();

        }
        else if(this.value == 167){
            $("#callStatusRemarksId").show();
            $("#scrollId").height(200);
            $("#callSuccessFieldsId").hide();
        }
        else{
            $("#scrollId").height(200);
            $("#callSuccessFieldsId").hide();
            $("#callStatusRemarksId").hide();
        }
    });
});




function ShowPopup(index,conteactNo){
    /*$('#scrollId' ).scrollTop(0);
    $("#scrollId").height(200);
    $("#callSuccessFieldsId").hide();
    $("#popupErrorLabel").text("")
    $("#isNeedPopupId").val(0);
    $("errorLabel").text("");

    $("#mrsLabelId").text(json[index].display_name);
    $("#groupNameLabelId").text(json[index].center_name);
    $("#apexAbishekLabelId").text("");
    $("#fvAnswerLabelId").text("");
    $("#foLabelId").text("");
    $("#disbursedAmountLabelId").text(json[index].loan_amount);
    $("#EMIAMountLabelId").text(json[index].emi_amount);
    $("#interestRateLabelId").text(json[index].interest_rate+"%");
    $("#tenurePeriodLabelId").text(json[index].tenure);
    $("#clientIdId").val(json[index].client_id);
    $("#groupIdId").val(json[index].group_id);
    $("#accountIdId").val(json[index].parent_account_id);
    $("#callTrackingIdId").val("1");
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
    $('input[type=text]').hide();

    *//*$('input[name="groupName"]').attr('checked', false);
     $('input[name="apexAbishek"]').attr('checked', false);
     $('input[name="fv"]').attr('checked', false);
     $('input[name="disbursedAmount"]').attr('checked', false);
     $('input[name="EMIAMount"]').attr('checked', false);
     $('input[name="interestRate"]').attr('checked', false);
     $('input[name="tenurePeriod"]').attr('checked', false);*//*

    $("#popupErrorLabel").focus();
    $("#checklistPopupId").popup("open");*/
    var json = JSON.parse($("#resultId").val());
    $("#clientIdId").val(json[index].client_id);
    $("#groupIdId").val(json[index].group_id);
    $("#accountIdId").val(json[index].parent_account_id);
    var callTrackingId = json[index].call_tracking_id;
    //alert(callTrackingId);
    var data ={
        groupId         : json[index].group_id,
        groupName       : json[index].group_name,
        centerName      : json[index].center_name,
        clientId        : json[index].client_id,
        clientName      : json[index].display_name,
        numberToCall    : conteactNo,
        loanAccountId   : json[index].account_id,
        officeId        : "0",
        callTrackingId  : callTrackingId
    };
    $.ajax({
        beforeSend: function () {
            $.mobile.showPageLoadingMsg();
        },
        complete: function () {
            $.mobile.hidePageLoadingMsg()
        },
        type: 'POST',
        data: JSON.stringify(data),
        async: false,
        contentType: 'application/json',
        url: 'http://' + ajaxcallip + localStorage.contextPath + '/client/ci/callToLDCallTrack',
        success: function (data) {
            //alert(data.callTrackingId);
            if (data.status == "success") {
                if(data.callTrackingId != '0' && data.callTrackingId != 0 && typeof(data.callTrackingId) != 'undefined') {
                    alert("Call Initiated...");
                    $("#callTrackingIdId").val(data.callTrackingId);
                    $("#clientIdId").val(json[index].client_id);
                    $.mobile.showPageLoadingMsg();
                    document.getElementById("BMFormId").method = 'POST';
                    document.getElementById("BMFormId").action = localStorage.contextPath + "/client/ci/LDCallTracking/showLDCheckList";
                    document.getElementById("BMFormId").submit();
                } else{
                    alert("Call track id is not generated. Please click on the mobile no again.")
                }
            }
            else {
                if(data.callTrackingId != '0' && data.callTrackingId != 0 && typeof(data.callTrackingId) != 'undefined') {
                    $("#callTrackingIdId").val(data.callTrackingId);
                    $("#clientIdId").val(json[index].client_id);
                    alert("Device not registered. Can't initiate call..");
                    $.mobile.showPageLoadingMsg();
                    document.getElementById("BMFormId").method = 'POST';
                    document.getElementById("BMFormId").action = localStorage.contextPath + "/client/ci/LDCallTracking/showLDCheckList";
                    document.getElementById("BMFormId").submit();
                }else{
                    alert("Call track id not generated. Please click on mobile no again.")
                }
            }
        }, error: function (jqXHR, textStatus, error) {
            alert("Call Not Initiated...");
        }
    });
}


function showLDCallTrackingGroupDetail(groupId,accountId,roleId){
    $("#groupIdId").val(groupId);
    $("#accountIdId").val(accountId);
    if(roleId == 1 || roleId == 3){
        $.mobile.showPageLoadingMsg();
        document.getElementById("BMFormId").action = localStorage.contextPath+"/client/ci/LDCallTracking/showGroupCaseDetail";
        document.getElementById("BMFormId").method = "POST";
        document.getElementById("BMFormId").submit().refresh();
    }
    else if(roleId == 7){
        $.mobile.showPageLoadingMsg();
        document.getElementById("BMFormId").action = localStorage.contextPath+"/client/ci/LDCallTracking/showLDCallTrackingGroupDetail";
        document.getElementById("BMFormId").method = "POST";
        document.getElementById("BMFormId").submit().refresh();
    }
}



function operationSubmitFromBM(operationId) {
    $.mobile.showPageLoadingMsg();
    document.getElementById("BMFormId").method='POST';
    document.getElementById("BMFormId").action=localStorage.contextPath+"/client/ci/groups/operation/"+operationId;
    document.getElementById("BMFormId").submit();
}

function submitRMForm(index){

    if($("#rmRemarksId"+index).val() != ""){
        var json = JSON.parse($("#resultId").val());
        $("#submitId"+index).hide();
        $("#processNotificationId"+index).text("Processing. Please Wait..");
        var data ={};
        data.groupId = json[index].group_id;
        data.clientId = json[index].client_id;
        data.clientMismatchCallTrackingDetailId = json[index].client_mistmatch_call_track_id;
        data.amountMismatchCallTrackingDetailId = json[index].amount_mismatch_call_track_id;
        data.rmRemarks = $("#rmRemarksId"+index).val();
        $.ajax({
            beforeSend : function() {
                $.mobile.showPageLoadingMsg();
            },
            complete: function() {
                $.mobile.hidePageLoadingMsg();
            },
            type  : 'POST',
            data  : JSON.stringify(data),
            async :false,
            contentType: 'application/json',
            url: 'http://'+ajaxcallip+localStorage.contextPath+'/client/ci/LDCallTracking/updateRMLDClientCaseTrack',
            success: function(status) {
                console.log(status);
                if(status == "success"){
                    $.mobile.hidePageLoadingMsg();
                    $("#processNotificationId"+index).text("Completed");
                }
                else if(status == "Session Expired"){
                    $("#errorLabel").text("Session Expired. Login again.");
                    var delay=2000;//1 seconds
                    setTimeout(function(){
                        $.mobile.showPageLoadingMsg();
                        document.getElementById("BMFormId").action = localStorage.contextPath+"/client/ci/logout";
                        document.getElementById("BMFormId").method = "GET";
                        document.getElementById("BMFormId").submit().refresh();
                        //your code to be executed after 1 seconds
                    },delay);
                }
                else{
                    $.mobile.hidePageLoadingMsg();
                    $("#processNotificationId"+index).text("Operation Failed.");
                }
            },error : function(jqXHR, textStatus, error) {
                $.mobile.hidePageLoadingMsg();
                $("#processNotificationId"+index).text("Operation Failed.");
            }
        });
    }else{
        $("#errorLabel").text("Please Fill RM Remarks.");
    }

}


function submitBMForm(index){
    if($("#bmRemarksId"+index).val() != ""){
        var json = JSON.parse($("#resultId").val());
        $("#submitId"+index).hide();
        $("#processNotificationId"+index).text("Processing. Please Wait..");
        var data ={};
        data.groupId = json[index].group_id;
        data.clientId = json[index].client_id;
        data.emiMismatchCallTrackingDetailId = json[index].emi_call_track_id;
        data.interestRateMismatchCallTrackingDetailId = json[index].interest_call_track_id;
        data.tenureMismatchCallTrackingDetailId = json[index].tenure_call_track_id;
        data.callStatusTrackId = json[index].call_status_track_id;
        data.bmRemarks = $("#bmRemarksId"+index).val();
        $.ajax({
            beforeSend : function() {
                $.mobile.showPageLoadingMsg();
            },
            complete: function() {
                $.mobile.hidePageLoadingMsg();
            },
            type  : 'POST',
            data  : JSON.stringify(data),
            async :false,
            contentType: 'application/json',
            url: 'http://'+ajaxcallip+localStorage.contextPath+'/client/ci/LDCallTracking/updateBMLDClientCaseTrack',
            success: function(status) {
                console.log(status);
                if(status == "success"){
                    $.mobile.hidePageLoadingMsg();
                    $("#processNotificationId"+index).text("Completed");
                }
                else if(status == "Session Expired"){
                    $("#errorLabel").text("Session Expired. Login again.");
                    var delay=2000;//1 seconds
                    setTimeout(function(){
                        $.mobile.showPageLoadingMsg();
                        document.getElementById("BMFormId").action = localStorage.contextPath+"/client/ci/logout";
                        document.getElementById("BMFormId").method = "GET";
                        document.getElementById("BMFormId").submit().refresh();
                        //your code to be executed after 1 seconds
                    },delay);
                }
                else{
                    $.mobile.hidePageLoadingMsg();
                    $("#processNotificationId"+index).text("Operation Failed.");
                }
            },error : function(jqXHR, textStatus, error) {
                $.mobile.hidePageLoadingMsg();
                $("#processNotificationId"+index).text("Operation Failed.");
            }
        });
    }
    else{
        $("#errorLabel").text("Please Fill BM Remarks.");
    }

}
function operationBack() {
    $.mobile.showPageLoadingMsg();
    document.getElementById("BMFormId").method='POST';
    document.getElementById("BMFormId").action=localStorage.contextPath+"/client/ci/groupsWhileOfficeChange/"+$("#officeIdId").val()+"/30";
    document.getElementById("BMFormId").submit();
}
