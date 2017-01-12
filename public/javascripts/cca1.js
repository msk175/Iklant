var hiddenclientid = new Array();
var hiddengroupid;
var rejectedClients = new Array();
$(document).ready(function() {
    $('#errorLabelId').text("")
	$('#errorLabelIdSecondRow').text("")
	if($("#secondaryChoices0").val() != 0) {
		$("#SaveButtonId").hide();
	}

    $("#yesApproveId").click(function(){
        if($('#ccaRedirectHiddenId').val() == 3){
            rejectIdleGroup($('#approvedGroupId').val(),"");
        }
        else{
            rejectGroup($('#approvedGroupId').val());
        }
    })

    $("#yesRejectId").click(function(){
        $.mobile.showPageLoadingMsg();
        if($('#ccaRedirectHiddenId').val() == 3) {
            $.mobile.showPageLoadingMsg();
            document.getElementById("BMFormId").method = "POST";
            document.getElementById("BMFormId").action = localStorage.contextPath+"/client/ci/idleGroups/rejectClients";
            document.getElementById("BMFormId").submit();
        }
        else {
            document.getElementById("BMFormId").action = localStorage.contextPath + "/client/ci/groups/cca1/rejectClients";
            document.getElementById("BMFormId").method = "POST";
            document.getElementById("BMFormId").submit().refresh();
        }
    })
    $('#multipleDocDivId').hide();
    $("#isMultipleDocCheckID").click(function() {
        if($("#isMultipleDocCheckID").is(':checked')==true){
            $("#isMultipleDocumentId").val($(this).is(':checked'));
            $('#multipleDocDivId').show();
            $('#singleDocDivId').hide();
            $('#singleUploadDocumentId').val("");
        }
        else if($("#isMultipleDocCheckID").is(':checked')==false){
            $("#isMultipleDocumentId").val($(this).is(':checked'));
            $('#multipleDocDivId').hide();
            $('#singleDocDivId').show();
            $('#multipleUploadDocumentId').val("");
        }
    });

    $( "#uploadNOC" ).on( "popupafterclose", function( event, ui ) {
        $('#successmessage').hide();
        $('#errorLabel').hide();
        $("#errorMessage").text("");
        $('#normalMessage').show();
        $('#isMultipleDocCheckID').prop("checked",false).checkboxradio('refresh');
        $("#isMultipleDocumentId").val(false);
        $("#multipleUploadDocumentId").val("");
        $("#singleUploadDocumentId").val("");
        $('#selectedClientForNOCUpload').val("");
        $('#selectedClientNameForNOCUpload').val("");
    });
});

function rejectClient(clientsId,rejectClientId,clientName){
	hiddenclientid.push(clientsId);
    document.getElementById("rejectedClientID").value = hiddenclientid;
    $("#rejectedClient").val(clientName);
    if(hiddenclientid.length>0){
        if($('#membersCount').val() > minimumClients) {
            $.mobile.showPageLoadingMsg();
            document.getElementById("BMFormId").action = localStorage.contextPath+"/client/ci/groups/cca1/rejectClients";
            document.getElementById("BMFormId").method = "POST";
            document.getElementById("BMFormId").submit().refresh();
        }else{
            $(window).scrollTop(0);
            document.getElementById(rejectClientId).href= "#rejectConfirmationId";
            $("#"+rejectClientId).trigger('click');
        }
	}else{
		alert("No rejected Clients");
	}	
}
function downloadClientDocuments(docId,clientIdreq){
	//docId = $(docId).val();
	//var ccaRedirectVal = document.getElementById('ccaRedirectHiddenId').value;
	//alert(docId+" "+clientIdreq+" "+ccaRedirectVal);
	var clientId = clientIdreq;
	//if(ccaRedirectVal==1){
        $.mobile.showPageLoadingMsg();
		document.getElementById("BMFormId").method='POST';
		document.getElementById("BMFormId").action=localStorage.contextPath+'/client/ci/generateClientDocuments/'+clientId+'/'+docId+'/downloadUploadedImages';
		document.getElementById("BMFormId").submit();
	/*}
	else if(ccaRedirectVal==2){
		if(docId==1){
			docId = 6;
		}else if(docId==10 || docId==11){
			docId= 10;
		}else if(docId>1 && docId<10){
			docId = 3;
			//$(window).scrollTop(0);
			//document.getElementById("errorField").innerHTML = "Selected Document is not found"
			//return false;
		}else{
			$(window).scrollTop(0);
			document.getElementById("errorField").innerHTML = "Selected Document is not found"
			return false;
		}
		document.getElementById("errorField").innerHTML = "";
		document.getElementById("BMFormId").method='POST';
		document.getElementById("BMFormId").action=localStorage.contextPath+'/client/ci/generateClientDocuments/'+clientId+'/'+docId+'/downloadUploadedImages';
		document.getElementById("BMFormId").submit();
	}*/
}
//function to download docs
function downloadDocs(selectedDocLocation){
	document.getElementById("selectedDocId").value=selectedDocLocation;
	document.getElementById("BMFormId").method='POST';
	document.getElementById("BMFormId").action=localStorage.contextPath+'/client/ci/downloadDocs';
	document.getElementById("BMFormId").submit();
}

var tempArray = new Array();

function approveGroup(groupId) {
    var flag = true;
    var clients = $('#reinitiatedClients').val().split(",");
    var reinitiatedClientsFlag = $('#reinitiatedClientsFlag').val().split(",");
    for(var i=0;i<clients.length;i++){
        if(reinitiatedClientsFlag[i] == 'false') {
            rejectedClients.push(clients[i]);
            flag = false;
        }
    }
    if(flag == true) {
        hiddengroupid = groupId;
        if (document.getElementById("unAppraisedClientsHidden").value == 0) {
            if (hiddengroupid > 0) {
                if ($('#membersCount').val() >= minimumClients) {
                    $("#submitDivId").hide();
                    $.mobile.showPageLoadingMsg();
                    document.getElementById("approvedGroupId").value = hiddengroupid;
					document.getElementById("BMFormId").action=localStorage.contextPath+"/client/ci/groups/cca1/approvedGroup";
                    document.getElementById("BMFormId").method = "POST";
                    document.getElementById("BMFormId").submit();
                } else {
                    $(window).scrollTop(0);
                    $('#approvedGroupId').val(hiddengroupid);
                    document.getElementById('approveGroup').href = "#approveConfirmationId";
                    $("#approveGroup").trigger('click');
                }
            } else {
                alert("No groups to Approve");
            }
        }
        else {
            alert("Some of the clients are UnAppraised");
        }
    }
    else{
        $(window).scrollTop(0);
        $('#errorLabelId').text("You cannot appraise this group");
        if(rejectedClients.length>1) {
            $('#errorLabelIdSecondRow').text("Because " + rejectedClients + " are re-initiated & waiting for Regional Manager's approval");
        }else {
            $('#errorLabelIdSecondRow').text("Because " + rejectedClients + " is re-initiated & waiting for Regional Manager's approval")
        }
    }
}

function rejectGroup(groupId){
	$("#submitDivId").hide();
	if(document.getElementById("unAppraisedClientsHidden").value == 0) {
		hiddengroupid = groupId;
		if(hiddengroupid>0){
            $.mobile.showPageLoadingMsg();
			document.getElementById("approvedGroupId").value=hiddengroupid;
			document.getElementById("BMFormId").action=localStorage.contextPath+"/client/ci/groups/cca1/rejectedGroup";
			document.getElementById("BMFormId").method="POST";
			document.getElementById("BMFormId").submit();
		}else{
			alert("No groups to Reject");
		}
	}
	else {
		alert("Some of the clients are UnAppraised");
	}	
}
function appraisalGroupClickSubmission(groupId) {
    $.mobile.showPageLoadingMsg();
	document.getElementById("BMFormId").method='POST';
	document.getElementById("BMFormId").action=localStorage.contextPath+"/client/ci/groups/cca1/"+groupId+"/listClients";
	document.getElementById("BMFormId").submit();
}
function appraisalCancelButton() {
    $.mobile.showPageLoadingMsg();
	document.getElementById("BMFormId").method='POST';
	document.getElementById("BMFormId").action=localStorage.contextPath+"/client/ci/groups/operation/"+appraisalOperationId+"";
	document.getElementById("BMFormId").submit();
}
function clientAppraisalAnswersBm(groupId,clientId,loanCount,clientRatingPerc,clientTotalWeightage,clientTotalWeightageRequired) {
	var redirectValue = 0;
    $.mobile.showPageLoadingMsg();
	document.getElementById("clientRatingPercHiddenId").value=clientRatingPerc; 
	document.getElementById("clientTotalWeightageHiddenId").value=clientTotalWeightage; 
	document.getElementById("clientTotalWeightageRequiredHiddenCCA1Id").value=clientTotalWeightageRequired; 
	document.getElementById("BMFormId").method='POST';
	document.getElementById("BMFormId").action=localStorage.contextPath+"/client/ci/groups/appraisal/"+clientId+"/"+groupId+"/"+loanCount+"/"+$('#statusId').val()+"/"+redirectValue;
	document.getElementById("BMFormId").submit();
}
function cancelClientQuestionChoices(groupId) {
	//Adarsh-Modified
	var branchId = document.getElementById("branchIDId").value; 
	if(document.getElementById("redirectValueId").value==0){
        $.mobile.showPageLoadingMsg();
		document.getElementById("BMFormId").method='POST';
		document.getElementById("BMFormId").action=localStorage.contextPath+"/client/ci/groups/cca1/"+groupId+"/listClients";
		document.getElementById("BMFormId").submit();
	}
	else if(document.getElementById("redirectValueId").value==1){
        $.mobile.showPageLoadingMsg();
		document.getElementById("BMFormId").method='POST';
		document.getElementById("BMFormId").action=localStorage.contextPath+"/client/ci/groups/authorization/group/"+groupId+"/"+branchId;
		document.getElementById("BMFormId").submit();
	}
    else if(document.getElementById("redirectValueId").value==3){
        $.mobile.showPageLoadingMsg();
        document.getElementById("BMFormId").method='POST';
        document.getElementById("BMFormId").action=localStorage.contextPath+"/client/ci/idleGroups/"+groupId+"/listClients";
        document.getElementById("BMFormId").submit();
    }
}
function submitSecondaryCCAQuestions(clientId,noOfQuestions) {
	var selectedAnswerArray = new Array();
	for(var i=0;i<noOfQuestions;i++) {
		selectedAnswerArray[i] = $("#secondaryChoices"+i).val();
	}
	if(($.inArray('0', selectedAnswerArray)) != -1) {
		alert("Please answer all the Questions");
	}
	else {
        $.mobile.showPageLoadingMsg();
		document.getElementById("BMFormId").method='POST';
		document.getElementById("BMFormId").action=localStorage.contextPath+'/client/ci/groups/secondaryappraisal/'+clientId+'/'+noOfQuestions;
		document.getElementById("BMFormId").submit();
	}
}
function reintiateRejectedClients(){
    $.mobile.showPageLoadingMsg();
	document.getElementById("BMFormId").action=localStorage.contextPath+"/client/ci/groups/operation/"+rejectedClientOperationId+"";
	document.getElementById("BMFormId").method="POST";
	document.getElementById("BMFormId").submit();
}

function openNOCPopup(clientsId,clientName,buttonId){
    $(window).scrollTop(0);
    $('#successmessage').hide();
    $('#errorLabel').hide();
    $("#errorMessage").text("");
    $('#normalMessage').show();
    $('#selectedClientForNOCUpload').val(clientsId);
    $('#selectedClientNameForNOCUpload').val(clientName);
    document.getElementById(buttonId).href= "#uploadNOC";
    $("#"+buttonId).trigger('click');
}

function uploadNOC(groupId){
    var multipleFileUpload=$("#multipleUploadDocumentId").val();
    var singleFileUpload=$("#singleUploadDocumentId").val();
    if(multipleFileUpload.length!=0 || singleFileUpload.length!=0) {
        $('#normalMessage').hide();
        $('#errorMessage').hide();
        var fileSize = ($("#multipleUploadDocumentId").val() == "") ? Math.round(($("#singleUploadDocumentId")[0].files[0].size / 1024) / 1024) : Math.round(($("#multipleUploadDocumentId")[0].files[0].size / 1024) / 1024);
        if (fileSize > 100) {
            $("#multipleUploadDocumentId").val("");
            $("#singleUploadDocumentId").val("");
            $('#normalMessage').hide();
            $('#errorMessage').show();
            $("#errorMessage").text("File size should not exceeds 100 MB");
            $(window).scrollTop(0);
        }
        else if ($('#multipleUploadDocumentId').get(0).files.length == 1) {
            $("#multipleUploadDocumentId").val("");
            $('#normalMessage').hide();
            $('#errorMessage').show();
            $("#errorMessage").text("Uncheck Multiple Files to upload Single File");
            $(window).scrollTop(0);
        }
        else{
            document.getElementById("BMFormId").method='POST';
            document.getElementById("BMFormId").action=localStorage.contextPath+"/client/ci/groups/cca1/uploadNOC";
            document.getElementById("BMFormId").submit();
        }
    }
    else{
        $('#normalMessage').hide();
        $('#errorMessage').show();
        $('#errorMessage').text("Please select file/files to upload");
    }
}

function manageIdleGroupsCancelButton(){
    $.mobile.showPageLoadingMsg();
    document.getElementById("BMFormId").method='POST';
    document.getElementById("BMFormId").action=localStorage.contextPath+"/client/ci/groups/operation/"+idleGroupsOperationId+"";
    document.getElementById("BMFormId").submit();
}

function clientAppraisalAnswersForBM(groupId,clientId,loanCount,clientRatingPerc,clientTotalWeightage,clientTotalWeightageRequired) {
    var redirectValue = 3;
    $.mobile.showPageLoadingMsg();
    document.getElementById("clientRatingPercHiddenId").value=clientRatingPerc;
    document.getElementById("clientTotalWeightageHiddenId").value=clientTotalWeightage;
    document.getElementById("clientTotalWeightageRequiredHiddenCCA1Id").value=clientTotalWeightageRequired;
    document.getElementById("BMFormId").method='POST';
    document.getElementById("BMFormId").action=localStorage.contextPath+"/client/ci/groups/appraisal/"+clientId+"/"+groupId+"/"+loanCount+"/"+$('#statusId').val()+"/"+redirectValue;
    document.getElementById("BMFormId").submit();
}

function rejectIdleClient(clientsId,rejectClientId,clientName){
    $("#rejectedClientID").val(clientName);
    $("#rejectedClient").val(clientsId);
    if(clientsId != ""){
        if($('#membersCount').val() > minimumClients) {
            $.mobile.showPageLoadingMsg();
            document.getElementById("BMFormId").method = "POST";
            document.getElementById("BMFormId").action = localStorage.contextPath+"/client/ci/idleGroups/rejectClients";
            document.getElementById("BMFormId").submit();
        }else{
            $(window).scrollTop(0);
            document.getElementById(rejectClientId).href= "#rejectConfirmationId";
            $("#"+rejectClientId).trigger('click');
        }
    }else{
        alert("No rejected Clients");
    }
}

function rejectIdleGroup(groupId, groupName){
    $("#submitDivId").hide();
    $.mobile.showPageLoadingMsg();
    $("#approvedGroupId").val(groupId);
    $.post("http://"+ajaxcallip+localStorage.contextPath+"/client/ci/idleGroups/rejectIdleGroup",
        { groupId: groupId, groupName: groupName},
        function (data) {
            if(data.status == 'success'){
                manageIdleGroupsCancelButton();
            }
            else{
                $.mobile.hidePageLoadingMsg();
                $("#submitDivId").show();
                $('#successmessage').hide();
                $('#errorLabelId').text("Group not rejected");
            }
        }
    );
}

function approveIdleGroup(groupId, groupName) {
    $("#submitDivId").hide();
    $("#approvedGroupId").val(groupId);
    if ($('#membersCount').val() >= minimumClients) {
        $.mobile.showPageLoadingMsg();
        $.post("http://" + ajaxcallip + localStorage.contextPath + "/client/ci/idleGroups/approveIdleGroup",
            {groupId: groupId, statusId: $('#statusId').val()},
            function (data) {
                if (data.status == 'success') {
                    manageIdleGroupsCancelButton();
                }
                else {
                    $.mobile.hidePageLoadingMsg();
                    $("#submitDivId").show();
                    $('#successmessage').hide();
                    $('#errorLabelId').text("Group not approved");
                }
            }
        );
    }
    else{
        $(window).scrollTop(0);
        $('#approvedGroupId').val(groupId);
        document.getElementById('approveGroup').href = "#approveConfirmationId";
        $("#approveGroup").trigger('click');
    }
}
