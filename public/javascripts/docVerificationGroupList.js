function showDocVerificationClients(groupId){
	//alert("groupId "+groupId);
	document.getElementById("iklantGroupIdHiddenId").value=groupId;
	document.getElementById("docVerGroupListFormId").method='POST';
	document.getElementById("docVerGroupListFormId").action=localStorage.contextPath+"/client/ci/groups/member/docVerification";
	document.getElementById("docVerGroupListFormId").submit();
}

$(document).ready(function() {
	$("#groupListSelectId").hide();
	if(document.getElementById("roleIdHiddenId").value == smhRoleId){
		$("#groupListSelectId").show();
	}
});

//populating group list on selecting branches 
function populateGroupList(selectedBranch){
    $.mobile.showPageLoadingMsg();
	document.getElementById("docVerGroupListFormId").method='POST';
	document.getElementById("docVerGroupListFormId").action=localStorage.contextPath+"/client/ci/reportManagement/docVerificationGroupList";
	document.getElementById("docVerGroupListFormId").submit();
}