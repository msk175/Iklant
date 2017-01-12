window.history.forward();
function getClientListForFV(groupid){
    $.mobile.showPageLoadingMsg();
	document.getElementById("BMFormId").method='POST';
	document.getElementById("BMFormId").action=localStorage.contextPath+"/client/ci/groups/fieldverification/"+groupid+"/clientlist";
	document.getElementById("BMFormId").submit();
} 

function operationSubmitForFO(operationId) {
    $.mobile.showPageLoadingMsg();
	document.getElementById("BMFormId").method='POST';
	document.getElementById("BMFormId").action=localStorage.contextPath+"/client/ci/groups/operation/"+operationId;
	document.getElementById("BMFormId").submit();
}

function downloadClientDocuments(docId){
	docId = $(docId).val();
	var clientId = document.getElementById("members").value;
	if(clientId!=0){
		if(docId !=0){
            $.mobile.showPageLoadingMsg();
			document.getElementById("BMFormId").method='POST';
			document.getElementById("BMFormId").action=localStorage.contextPath+'/client/ci/generateClientDocuments/'+clientId+'/'+docId+'/downloadUploadedImages';
			document.getElementById("BMFormId").submit();
		}
	}
	else {
		//alert("in else");
		document.getElementById("formType").value = "";
		document.getElementById("errorField").innerHTML = "Please Select a member name";
	}
}
//function to download docs
function downloadDocs(selectedDocLocation){
    $.mobile.showPageLoadingMsg();
	//alert("inside doc down"+selectedDocLocation);
	document.getElementById("selectedDocId").value=selectedDocLocation;
	document.getElementById("fvformid").method='POST';
	document.getElementById("fvformid").action=localStorage.contextPath+'/client/ci/downloadDocs';
	document.getElementById("fvformid").submit();
}

$(document).ready(function() {
	var docTypeId = document.getElementById("docTypeId").value;
	if(docTypeId!=""){
		$('#proofverify').trigger('expand')
	}
});
