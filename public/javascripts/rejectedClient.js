function getClientListForRejectedGroups(groupid){
    $.mobile.showPageLoadingMsg();
	document.getElementById("BMFormId").method='POST';
	document.getElementById("BMFormId").action=localStorage.contextPath+'/client/ci/groups/rejectedClients/'+groupid+'/clientDetails';
	document.getElementById("BMFormId").submit();
} 