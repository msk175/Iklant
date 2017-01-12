$( document ).on( "pageinit", function() {
    $( '#subGroupMembersDiv' ).on({
        popupafterclose: function() {
            if($("#isNeedPopupId").val() == '1'){
                setTimeout( function(){ $( '#subGroupMembersDiv' ).popup( 'open' ) }, 100 );
            }
        }
    });
});
$(document).ready(function() {
    $('#listoffice').on('change',function(){
        $.mobile.showPageLoadingMsg();
        document.getElementById("BMFormId").method='POST';
        document.getElementById("BMFormId").action=localStorage.contextPath+"/client/ci/groupsWhileOfficeChange/"+$('#listoffice').val()+"/"+$('#operationId').val();
        document.getElementById("BMFormId").submit();
    });

    /* on load disable the add button */
    var clientIdArrayList = new Array();
    if($("#clientIdArray").val() != null){
        clientIdArrayList = $("#clientIdArray").val().split(",");
    }
    for(var i = 0;i< clientIdArrayList.length;i++){
        var clientType = $('#clientType_'+clientIdArrayList[i]).val();
        if(clientType == subLeaderTypeLookUp){
            $('#addSubGroupMembersId_'+clientIdArrayList[i]).addClass("");
        }else if(clientType == 0){
            $('#clientType_'+clientIdArrayList[i]).prop('disabled', '');
            $('#addSubGroupMembersId_'+clientIdArrayList[i]).addClass("ui-disabled");
            $('#isLeader_'+clientIdArrayList[i]).prop('checked', false).checkboxradio('refresh');
        }else{
            $('#addSubGroupMembersId_'+clientIdArrayList[i]).addClass("ui-disabled");
            $('#isLeader_'+clientIdArrayList[i]).prop('checked', false).checkboxradio('refresh');
            $('#clientType_'+clientIdArrayList[i]).prop('disabled', 'disabled');
            $('#isLeaderSelected').val("");
        }
    }

    /* on load populate the sub group details */
    var subGroupLength =  $('#subgroupLength').val();
    if(subGroupLength != 0){
        for(var i = 0;i< subGroupLength;i++){
            var subLeaderGlobalNumber =  $('#subLeaderGlobalNumber_'+i).val();
            var subLeaderClientId =  $('#subLeaderClientId_'+i).val();
            var subClientIdList =  $('#subClientIdList_'+i).val().split(",");
            var subClientGlobalNumber =  $('#subClientGlobalNumberList_'+i).val().split(",");
            $('#subGroupClientCode_'+subLeaderClientId).val(subClientGlobalNumber);
            $('#subGroupClientId_'+subLeaderClientId).val(subClientIdList);
            $('#totalSubGroupMembers_'+subLeaderClientId).val(subClientIdList.length);
            $('#subGroupCode_'+subLeaderClientId).val(subLeaderGlobalNumber);
            $('#memberSubGroupCode_'+subLeaderClientId).val(subLeaderGlobalNumber);
        }
    }

    //subGroupDetailsSave button click
    $("#subGroupDetailsSaveId").click(function(){
        var clientIdArrayList = new Array();
        var memberSubGroupCodeArrayList = new Array();
        var subGroupClientCode = new Array();
        var subGroupClientId = new Array();
        var selectedSubClientId = $('#selectedSubClient').val();
        if($("#clientIdArray").val() != null){
            clientIdArrayList = $("#clientIdArray").val().split(",");
        }
        $('#memberSubGroupCode_'+selectedSubClientId).val("");
        var codeIndex = 0;
        var memberSubGroupIndex = 0;
        for(var i = 0;i< clientIdArrayList.length;i++){
            if($('#subGroupMemberChkBox_'+clientIdArrayList[i]).is(':checked') == true){
                subGroupClientCode[codeIndex] =  $("#subMemberCode_"+clientIdArrayList[i]).val();
                subGroupClientId[codeIndex] = clientIdArrayList[i];
                codeIndex++;
            }
            if($('#memberSubGroupCode_'+clientIdArrayList[i]).val() != ""){
                memberSubGroupCodeArrayList[memberSubGroupIndex] = $('#memberSubGroupCode_'+clientIdArrayList[i]).val();
                memberSubGroupIndex++;
            }
        }
        var subGroupCode = $('#subGroupCode').val();
        var result = true;
        for(var i = 0;i< memberSubGroupCodeArrayList.length;i++){
            if(subGroupCode.match(memberSubGroupCodeArrayList[i])){
                $('#errorLabelPopupId').text("Sub Group Code "+subGroupCode+" already exists");
                result = false;
                $("#isNeedPopupId").val(1);
                break;
            }
        }
        if(result){
            result = validateSubGroupDetails(subGroupClientId,subGroupClientCode);
            if(result) {
                if($('#subGroupClientCode_'+selectedSubClientId).val() != "" && $('#subGroupClientCode_'+selectedSubClientId).length > 0){
                    var selectedSubClientIdArray = $('#subGroupClientCode_'+selectedSubClientId).val();
                    $('#subGroupClientCode_'+selectedSubClientId).val("");
                    $('#subGroupClientId_'+selectedSubClientId).val("");
                    $('#totalSubGroupMembers_'+selectedSubClientId).val("");
                    $('#subGroupCode_'+selectedSubClientId).val("");
                }

                $("#isNeedPopupId").val(0);
                $('#subGroupClientCode_'+selectedSubClientId).val(subGroupClientCode);
                $('#subGroupClientId_'+selectedSubClientId).val(subGroupClientId);
                $('#totalSubGroupMembers_'+selectedSubClientId).val($('#totalSubGroupMembers').val());
                $('#subGroupCode_'+selectedSubClientId).val($('#subGroupCode').val());

                for(var i = 0;i< subGroupClientId.length;i++){
                    if(selectedSubClientId != subGroupClientId[i]){
                        $('#clientType_'+subGroupClientId[i]).val(memberTypeLookUp).selectmenu("refresh");
                        $('#clientType_'+subGroupClientId[i]).prop('disabled', 'disabled');
                    }
                }
                $('#memberSubGroupCode_'+selectedSubClientId).val($('#subGroupCode').val());
                $("#subGroupMembersDiv").popup('close');
            }else{
                $("#subGroupMembersDiv").popup('close');
            }
        }else{
            $("#subGroupMembersDiv").popup('close');
        }
    });

    $("#subGroupDetailsCancelId").click(function(){
        var selectedSubClientId = $('#selectedSubClient').val();
        var clientIdArrayList = new Array();
        $("#isNeedPopupId").val(1);
        $('#errorLabelPopupId').text('');

        if($("#clientIdArray").val() != null){
            clientIdArrayList = $("#clientIdArray").val().split(",");
        }
        /* clean all the preselected member values */
        $('#subGroupClientCode_'+selectedSubClientId).val("");
        $('#subGroupClientId_'+selectedSubClientId).val("");
        $('#totalSubGroupMembers_'+selectedSubClientId).val("");
        $('#subGroupCode_'+selectedSubClientId).val("");

        $('#totalSubGroupMembers').val("");
        $('#subGroupCode').val($('#groupNameHidden').val()+"-");
        $('#memberSubGroupCode'+selectedSubClientId).val("");
        for(var i = 0;i< clientIdArrayList.length;i++){     /* De select the selected check box */
            $('#subGroupMemberChkBox_'+clientIdArrayList[i]).prop('checked', false).checkboxradio('refresh');
            $("#subMemberCode_"+clientIdArrayList[i]).val("");
        }
    });

    $("#subGroupDetailsBackId").click(function(){
        $("#isNeedPopupId").val(0);
        $('#errorLabelPopupId').text('');
    });
});

function validateSubGroupDetails(subGroupClientId,subGroupClientCode){
    $('#errorLabelPopupId').text("");
    var result = true;
    var subGroupCode = $('#subGroupCode').val();
    if($('#totalSubGroupMembers').val() != subGroupClientId.length){
        result = false;
        $("#isNeedPopupId").val(1);
        $('#errorLabelPopupId').text("Selected clients and Total members mismatched ");
    }else{
        for(var i = 0;i< subGroupClientId.length;i++){
            var checkCharacter = subGroupClientCode[i].substring(subGroupClientCode[i].lastIndexOf("-")+1);
            var clientCodeCheck = subGroupClientCode[i].indexOf(subGroupCode);
            if(checkCharacter == "" || (checkCharacter.match(/0/g) || []).length != 1 || checkCharacter.length != 2){
                $('#errorLabelPopupId').text('Invalid Client Code '+subGroupClientCode[i]);
                result = false;
                $("#isNeedPopupId").val(1);
                break;
            }else if(clientCodeCheck == -1){
                $('#errorLabelPopupId').text('Client Code '+subGroupClientCode[i]+' Not Suitable for Sub Group ');
                result = false;
                $("#isNeedPopupId").val(1);
                break;
            }
        }
    }
    return result;
}

function getClientDetailsWhileOnchange(groupId,loanCount,isDataverified) {
    $.mobile.showPageLoadingMsg();
    document.getElementById("BMFormId").method='POST';
    if(isDataverified == 1){
        document.getElementById("BMFormId").action=localStorage.contextPath+"/client/ci/groups/getClientDetailsForLeaderSubLeaderVerification/"+groupId+"/"+loanCount;
    }else{
        document.getElementById("BMFormId").action=localStorage.contextPath+"/client/ci/groups/getClientDetailsForLeaderSubLeader/"+groupId+"/"+loanCount;
    }

    document.getElementById("BMFormId").submit();
}

function backButtonForLeaderSubLeader() {
    $.mobile.showPageLoadingMsg();
    document.getElementById("BMFormId").method='POST';
    document.getElementById("BMFormId").action=localStorage.contextPath+"/client/ci/groups/operation/"+leaderSubLeaderUpdatingOperationId+"";
    document.getElementById("BMFormId").submit();
}

function backButtonForLeaderSubLeaderVerification() {
    $.mobile.showPageLoadingMsg();
    document.getElementById("BMFormId").method='POST';
    document.getElementById("BMFormId").action=localStorage.contextPath+"/client/ci/groups/operation/"+leaderSubLeaderVerificationOperationId+"";
    document.getElementById("BMFormId").submit();
}

/* Is Leader Checbox onchange */
function leaderOnChange(clientId){
    if($('#isLeader_'+clientId).is(':checked') == true){
        if($('#isLeaderSelected').val() == "selected"){
            $('#isLeader_'+clientId).prop('checked', false).checkboxradio('refresh');;
            $('#errorLabelId').text('Leader Already Selected for this Group');
        }else{
            $('#clientType_'+clientId).val(subLeaderTypeLookUp).selectmenu("refresh");
            $('#addSubGroupMembersId_'+clientId).removeClass("ui-disabled");  // Enable Add button
            // Remove the Sub Group Details
            $('#subGroupClientCode_'+clientId).val("");
            $('#subGroupClientId_'+clientId).val("");
            $('#totalSubGroupMembers_'+clientId).val("");
            $('#subGroupCode_'+clientId).val("");

            $('#errorLabelId').text('');
            $('#isLeaderSelected').val("selected");  // check isLeader already selected or not
        }
    }else{
        $('#clientType_'+clientId).val('0').selectmenu("refresh");
        $('#addSubGroupMembersId_'+clientId).addClass("ui-disabled");    // Disable Add button
        $('#errorLabelId').text('');
        $('#isLeaderSelected').val("");
        var subGroupClientIdList;
        if($('#subGroupClientId_'+clientId).val() != ""){
            subGroupClientIdList =  $('#subGroupClientId_'+clientId).val().split(",");
            for(var i = 0;i< subGroupClientIdList.length;i++){
                $('#clientType_'+subGroupClientIdList[i]).val(0).selectmenu("refresh");
                $('#clientType_'+subGroupClientIdList[i]).prop('disabled', '');
            }
            $('#subGroupClientCode_'+clientId).val("");
            $('#subGroupClientId_'+clientId).val("");
            $('#totalSubGroupMembers_'+clientId).val("");
            $('#subGroupCode_'+clientId).val("");
        }

    }
}
 /* Sub Group Code - on change*/
function populateSubGroupCode(){
    var subGroupCode = $('#subGroupCode').val();
    var clientIdArrayList = new Array();
    if($("#clientIdArray").val() != null){
        clientIdArrayList = $("#clientIdArray").val().split(",");
    }
    for(var i = 0;i< clientIdArrayList.length;i++){
        $("#subMemberCode_"+clientIdArrayList[i]).val(subGroupCode+"-");
    }
}

/* Populate the Sub Group Code and Total Sub Group Members */
function populateSubGroupCodeWhileClientIsChecked(clientId){
    $('#errorLabelPopupId').text('');
    var subGroupCode = $('#subGroupCode').val();
    if(subGroupCode == "" || subGroupCode.length < 8){
        $('#errorLabelPopupId').text("Please don't remove Sub Group Code");
        $('#subGroupMemberChkBox_'+clientId).prop('checked', false).checkboxradio('refresh');;
    }else if($('#totalSubGroupMembers').val() == "" || $('#totalSubGroupMembers').val() == 0){
        $('#errorLabelPopupId').text("Please enter valid Total Sub Group Members");
        $('#subGroupMemberChkBox_'+clientId).prop('checked', false).checkboxradio('refresh');;
    }else{
        var checkCharacter = subGroupCode.substring(subGroupCode.lastIndexOf("-")+1);
        if(checkCharacter == "" || (checkCharacter.match(/0/g) || []).length != 1 || checkCharacter.length != 2){
            $('#errorLabelPopupId').text('Please give valid Sub Group Code');
            $('#subGroupMemberChkBox_'+clientId).prop('checked', false).checkboxradio('refresh');;
        }else{
            if($('#subGroupMemberChkBox_'+clientId).is(':checked') == true){
                $("#subMemberCode_"+clientId).val(subGroupCode+"-");
            }else{
                $("#subMemberCode_"+clientId).val("");
                $('#clientType_'+clientId).prop('disabled', '');
                $('#clientType_'+clientId).val(0).selectmenu("refresh");
            }
        }
    }
}

/* Display the client details for add Button */
function showSubGroupMembers(clientId,groupName){
    $('#errorLabelPopupId').text('');
    var clientIdArrayList = new Array();
    if($("#clientIdArray").val() != null){
        clientIdArrayList = $("#clientIdArray").val().split(",");
    }

    for(var i = 0;i< clientIdArrayList.length;i++){
        $('#subMemberCode_'+clientIdArrayList[i]).val("");
        $('#subGroupMemberChkBox_'+clientIdArrayList[i]).prop('checked', false).checkboxradio('refresh');
        $('#totalSubGroupMembers').val("");
        if($('#subGroupClientId_'+clientIdArrayList[i]).val() != ""){
        }
    }

    if($('#subGroupClientId_'+clientId).val() != "" && $('#subGroupClientId_'+clientId).val() != null){
        $('#subGroupCode').val($('#subGroupCode_'+clientId).val());
        $('#totalSubGroupMembers').val($('#totalSubGroupMembers_'+clientId).val());
        var subGroupClientIdArray =  $('#subGroupClientId_'+clientId).val().split(",");
        var subGroupClientCodeArray =  $('#subGroupClientCode_'+clientId).val().split(",");
        for(var i = 0;i< clientIdArrayList.length;i++){
            for(var j = 0;j< subGroupClientIdArray.length;j++){
                if(subGroupClientIdArray[j] == clientIdArrayList[i]){
                    $('#subMemberCode_'+clientIdArrayList[i]).val(subGroupClientCodeArray[j]);
                    $('#subGroupMemberChkBox_'+clientIdArrayList[i]).prop('checked', true).checkboxradio('refresh');
                }
            }
        }
    }else{
        $('#subGroupCode').val(groupName+"-");
    }
    $("#subGroupMembersDiv").popup('open');
    $('#selectedSubClient').val(clientId);
}

/* Display the client details for Edit Button */
function showSubGroupMembersOnEdit(clientId,groupName,subGroupLength){
    $('#errorLabelPopupId').text('');
    var clientIdArrayList = new Array();
    if($("#clientIdArray").val() != null){
        clientIdArrayList = $("#clientIdArray").val().split(",");
    }

    for(var i = 0;i< clientIdArrayList.length;i++){
        $('#subMemberCode_'+clientIdArrayList[i]).val("");
        $('#subGroupMemberChkBox_'+clientIdArrayList[i]).prop('checked', false).checkboxradio('refresh');
    }

    var subClientIdList =  $('#subGroupClientId_'+clientId).val().split(",");
    var subClientGlobalNumber =  $('#subGroupClientCode_'+clientId).val().split(",");
    var subGroupGlobalNumber =  $('#selectedSubGroupNumber_'+clientId).val();
    for(var j = 0;j< subClientIdList.length;j++) {
        $('#subMemberCode_'+subClientIdList[j]).val(subClientGlobalNumber[j]);
        $('#subGroupMemberChkBox_'+subClientIdList[j]).prop('checked', true).checkboxradio('refresh');
    }
    if(subGroupGlobalNumber == 'null'){
        $('#subGroupCode').val(groupName+"-");
        $('#totalSubGroupMembers').val("");
    }else{
        $('#subGroupCode').val(subGroupGlobalNumber);
        $('#totalSubGroupMembers').val(subClientIdList.length);
    }
    /*if(subGroupLength != 0){
        for(var i = 0;i< subGroupLength;i++){
            if($('#subGroupClientCode_'+clientId).val() != ""){
                var subLeaderGlobalNumber =  $('#subLeaderGlobalNumber_'+i).val();
                var subGroupGlobalNumber =  $('#selectedSubGroupNumber_'+clientId).val();
                if(subLeaderGlobalNumber == subGroupGlobalNumber){
                    var subClientIdList =  $('#subClientIdList_'+i).val().split(",");
                    var subClientGlobalNumber =  $('#subClientGlobalNumberList_'+i).val().split(",");
                    for(var j = 0;j< subClientIdList.length;j++) {
                        $('#subMemberCode_'+subClientIdList[j]).val(subClientGlobalNumber[j]);
                        $('#subGroupMemberChkBox_'+subClientIdList[j]).prop('checked', true).checkboxradio('refresh');
                    }
                    $('#subGroupCode').val(subLeaderGlobalNumber);
                    $('#totalSubGroupMembers').val(subClientIdList.length);

                    /*$('#subGroupClientCode_'+clientId).val(subClientGlobalNumber);
                    $('#subGroupClientId_'+clientId).val(subClientIdList);
                    $('#totalSubGroupMembers_'+clientId).val(subClientIdList.length);
                    $('#subGroupCode_'+clientId).val(subLeaderGlobalNumber);
                }
            }else{
                $('#subGroupCode').val(groupName+"-");
                $('#totalSubGroupMembers').val("");
            }
        }
    } */
    $("#subGroupMembersDiv").popup('open');
    $('#selectedSubClient').val(clientId);
}

/* On change the client Type */
function clientTypeOnchange(clientId){
    var clientType = $('#clientType_'+clientId).val();
    if(clientType == subLeaderTypeLookUp){
        $('#addSubGroupMembersId_'+clientId).removeClass("ui-disabled");
    }else{
        $('#addSubGroupMembersId_'+clientId).addClass("ui-disabled");
        $('#isLeader_'+clientId).prop('checked', false).checkboxradio('refresh');
        $('#isLeaderSelected').val("");
        var selectedSubClientIdArray = new Array();     // Enabled the populate member client type while remove the members
        selectedSubClientIdArray = ($('#subGroupClientId_'+clientId).val()).split(",");
        for(var i = 0;i< selectedSubClientIdArray.length;i++){
            if(clientId != selectedSubClientIdArray[i]){
                $('#clientType_'+selectedSubClientIdArray[i]).val(0).selectmenu("refresh");
                $('#clientType_'+selectedSubClientIdArray[i]).prop('disabled', '');
            }
        }
        // Remove the Sub Group Details
        $('#subGroupClientCode_'+clientId).val("");
        $('#subGroupClientId_'+clientId).val("");
        $('#totalSubGroupMembers_'+clientId).val("");
        $('#subGroupCode_'+clientId).val("");
        $('#clientType_'+clientId).val(0).selectmenu("refresh");
    }
}

function validateSubGroupCode(clientCode,currentClientId){
    var clientIdArrayList = new Array();
    $('#errorLabelPopupId').text("");
    if($("#clientIdArray").val() != null){
        clientIdArrayList = $("#clientIdArray").val().split(",");
    }

    for(var i = 0;i< clientIdArrayList.length;i++){
        if(currentClientId != clientIdArrayList[i] && (($("#subMemberCode_"+clientIdArrayList[i]).val()).match(clientCode.value))){
            var checkCharacter = clientCode.value.substring(clientCode.value.lastIndexOf("-")+1);
            if(checkCharacter == "" || (checkCharacter.match(/0/g) || []).length != 1 || checkCharacter.length != 2){
                $('#errorLabelPopupId').text('Invalid Client Code '+clientCode.value);
                $("#isNeedPopupId").val(1);
                break;
            }else{
                $('#errorLabelPopupId').text('Client Code already exists');
                break;
            }
        }
    }
}

function validateClientType(){
    var clientIdArrayList = new Array();
    var clientNameArrayList = new Array();
    $('#errorLabelId').text("");
    if($("#clientIdArray").val() != null){
        clientIdArrayList = $("#clientIdArray").val().split(",");
        clientNameArrayList = $("#clientNameArray").val().split(",");
    }
    var resultMsg = true;
    var subLeaderIndex = 0;
    var leaderIndex = 0;

    for(var i = 0;i< clientIdArrayList.length;i++){
        var clientType = $('#clientType_'+clientIdArrayList[i]).val();
        if(clientType == subLeaderTypeLookUp && $('#isLeader_'+clientIdArrayList[i]).is(':checked') == true){
            subLeaderIndex++;
            leaderIndex++;
        }else if(clientType == subLeaderTypeLookUp){
            subLeaderIndex++;
        }else if($('#isLeader_'+clientIdArrayList[i]).is(':checked') == true){
            leaderIndex++;
        }

        if(clientType == 0){
            $('#errorLabelId').text('Please mapping all the members');
             return false;
        }else if(clientType == subLeaderTypeLookUp && ($('#subGroupClientCode_'+clientIdArrayList[i]).val() == "")){
            $('#errorLabelId').text('Please add Sub Group Members for the '+clientNameArrayList[i]);
            return false;
        }
    }
    if(leaderIndex == 0){
        $('#errorLabelId').text('Please Select leader for the group');
        return false;
    }
    if(subLeaderIndex == 0){
        $('#errorLabelId').text('Please Select Atleast one Sub leader for the group');
        return false;
    }
    return resultMsg;
}
function submitClientDetailsForLeaderMapping(groupId,loanCount){
    var result = validateClientType ();
    //for Removing images when submit Added by Sathish Kumar M 008
    $("#base64Image").val("");
    if(result){
         $("#leftPanel").remove();
         $.mobile.showPageLoadingMsg();
         document.getElementById("BMFormId").method='POST';
         document.getElementById("BMFormId").action=localStorage.contextPath+"/client/ci/groups/saveSubGroupDetails/"+groupId+"/"+loanCount;
         document.getElementById("BMFormId").submit();
    }
}