function getGroupDetailsForLoanRecovery(accountId){
    $.mobile.showPageLoadingMsg();
	document.getElementById("recoveryFormID").method='POST';
	document.getElementById("recoveryFormID").action=localStorage.contextPath+"/client/ci/"+accountId+"/retrieveGroupDetails/0";
	document.getElementById("recoveryFormID").submit();
}