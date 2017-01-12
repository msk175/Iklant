window.history.forward();
function KYCuploadMenu(groupId) {
    $.mobile.showPageLoadingMsg();
	document.getElementById("BMFormId").method='POST';
	document.getElementById("BMFormId").action=localStorage.contextPath+"/client/ci/groups/"+groupId+"/kycuploadingMenu";
	document.getElementById("BMFormId").submit();
}

function cancelKYCUploadForm() {
    $.mobile.showPageLoadingMsg();
	document.getElementById("BMFormId").method='POST';
	document.getElementById("BMFormId").action=localStorage.contextPath+"/client/ci/groups/operation/"+KYCUploadingOperationId+"";
	document.getElementById("BMFormId").submit();
}

function kycSave(group_id){
    $.mobile.showPageLoadingMsg();
	document.getElementById("BMFormId").action=localStorage.contextPath+"/client/ci/groups/kycUpload/"+group_id+"/savegroupkycUpload";
	document.getElementById("BMFormId").method="POST";
	document.getElementById("BMFormId").submit();
}