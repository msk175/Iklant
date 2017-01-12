function getClientListForRejectedGroups(groupid){
    $.mobile.showPageLoadingMsg();
	document.getElementById("BMFormId").method='POST';
	document.getElementById("BMFormId").action=localStorage.contextPath+'/client/ci/groups/rejectedGroups/'+groupid+'/clientlist';
	document.getElementById("BMFormId").submit();
} 


