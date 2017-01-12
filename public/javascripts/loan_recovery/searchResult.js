function showLoansList(globalCustomerNum,groupName,customerId){
    $.mobile.showPageLoadingMsg();
	$('#clientName').val(groupName);
	$('#customerId').val(customerId);
	document.getElementById("loanListFormID").method='POST';
	document.getElementById("loanListFormID").action=localStorage.contextPath+"/client/ci/loanrecovery/groups/"+globalCustomerNum+"/loanaccounts";
	document.getElementById("loanListFormID").submit();
}