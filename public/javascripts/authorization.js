$(document).ready(function() {
	$('#dialog-confirm').hide();

    $("#yesApproveId").click(function(){
        rejectGroup($('#approvedGroupId').val());
    })

    $("#yesRejectId").click(function(){
        $.mobile.showPageLoadingMsg();
        document.getElementById("BMFormId").action = localStorage.contextPath+"/client/ci/groups/cca1/rejectClients";
        document.getElementById("BMFormId").method = "POST";
        document.getElementById("BMFormId").submit().refresh();
    })

});

var hiddenclientid = new Array();
var hiddengroupid;
var rejectedClients = new Array();
function branchGroupsDisplay(selectThis) {
	var officeId = selectThis.value;
	if(officeId!=0) {
    $.mobile.showPageLoadingMsg();
	document.getElementById("BMFormId").method='POST';
	document.getElementById("BMFormId").action=localStorage.contextPath+"/client/ci/groups/authorization/"+authorizeGroupOperationId+"/"+officeId;
	document.getElementById("BMFormId").submit().refresh();
	}
}

function getGroupDetailsForAuthorization(groupId,branchIdAuthorization) {
    $.mobile.showPageLoadingMsg();
	document.getElementById("BMFormId").method='POST';
	document.getElementById("BMFormId").action=localStorage.contextPath+"/client/ci/groups/authorization/group/"+groupId+"/"+branchIdAuthorization;
	document.getElementById("BMFormId").submit().refresh();
}

function rejectClient(clientsId,rejectClientId,clientName) {
	hiddenclientid.push(clientsId);
    document.getElementById("rejectedClientID").value = hiddenclientid;
    $("#rejectedClient").val(clientName);
    if(hiddenclientid.length>0){
        if($('#membersCount').val() > minimumClients) {
            $.mobile.showPageLoadingMsg();
            document.getElementById("BMFormId").action = localStorage.contextPath+"/client/ci/groups/cca1/rejectClients";
            document.getElementById("BMFormId").method = "POST";
            document.getElementById("BMFormId").submit().refresh();
        }
        else{
            $(window).scrollTop(0);
            document.getElementById(rejectClientId).href= "#rejectConfirmationId";
            $("#"+rejectClientId).trigger('click');
        }
	}else{
		alert("No rejected Clients");
	}
}

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
        if(hiddengroupid>0){
            if($('#membersCount').val() >= minimumClients){
                $("#submitDivId").hide();
                $.mobile.showPageLoadingMsg();
                document.getElementById("approvedGroupId").value=$('#groupidfordownload').val();
				document.getElementById("BMFormId").action=localStorage.contextPath+"/client/ci/groups/cca1/approvedGroup";
                document.getElementById("BMFormId").method="POST";
                document.getElementById("BMFormId").submit().refresh();
            }else{
                $(window).scrollTop(0);
                $('#approvedGroupId').val(hiddengroupid);
                document.getElementById('SaveButtonId').href= "#approveConfirmationId";
                $("#SaveButtonId").trigger('click');
            }
        }else{
            alert("No groups to Approve");
        }
    }
    else{
        $(window).scrollTop(0);

        if(rejectedClients.length>1) {
            $('#errorLabelId').text(rejectedClients + " are re-initiated & waiting for approval");
        }else {
            $('#errorLabelId').text(rejectedClients + " is re-initiated & waiting for approval")
        }
        $('#errorLabelIdSecondRow').text("Please approve to authorize this group");
    }
}

function rejectGroup(groupId){
	hiddengroupid = groupId;
		if(hiddengroupid>0){
            $.mobile.showPageLoadingMsg();
			document.getElementById("approvedGroupId").value=hiddengroupid;
			document.getElementById("BMFormId").action=localStorage.contextPath+"/client/ci/groups/cca1/rejectedGroup";
			document.getElementById("BMFormId").method="POST";
			document.getElementById("BMFormId").submit().refresh();
		}else{
			alert("No groups to Reject");
		}
}
function downloadClientDocumentsAuth(docId,clientId){
	//docId = $(docId).val();
	if(docId !=0){
        $.mobile.showPageLoadingMsg();
		document.getElementById("selectedDocTypeId").value = docId;
		document.getElementById("BMFormId").method='POST';
		document.getElementById("BMFormId").action=localStorage.contextPath+'/client/ci/generateClientDocuments/'+clientId+'/'+docId+'/downloadUploadedImages';
		document.getElementById("BMFormId").submit();
	}
}
//function to download docs
function downloadDocs(selectedDocLocation){
	//alert("inside doc down"+selectedDocLocation);
    //$.mobile.showPageLoadingMsg();
	document.getElementById("selectedDocId").value=selectedDocLocation;
	document.getElementById("BMFormId").method='POST';
	document.getElementById("BMFormId").action=localStorage.contextPath+'/client/ci/downloadDocs';
	document.getElementById("BMFormId").submit();
}
//Adarsh-Modified
//client Appraisal Answers
function clientAppraisalAnswersSmh(groupId,clientId,loanCount,clientRatingPerc,clientTotalWeightage,clientTotalWeightageRequired) {
	var redirectValue = 1;
    $.mobile.showPageLoadingMsg();
	document.getElementById("clientRatingPercHiddenId").value=clientRatingPerc;
	document.getElementById("clientTotalWeightageHiddenId").value=clientTotalWeightage;
	document.getElementById("clientTotalWeightageRequiredHiddenCCA1Id").value=clientTotalWeightageRequired;

	document.getElementById("BMFormId").method='POST';
	document.getElementById("BMFormId").action=localStorage.contextPath+"/client/ci/groups/appraisal/"+clientId+"/"+groupId+"/"+loanCount+"/"+$('#statusId').val()+"/"+redirectValue;
	document.getElementById("BMFormId").submit().refresh();
}
function cancelGroupAuthorization(branchId){
    document.getElementById("BMFormId").method='POST';
    document.getElementById("BMFormId").action=localStorage.contextPath+"/client/ci/groups/authorization/"+authorizeGroupOperationId+"/"+branchId;
    document.getElementById("BMFormId").submit();
}
