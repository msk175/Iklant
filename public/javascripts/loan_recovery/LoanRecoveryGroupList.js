function loanRecoveryLoanGroupListFormSubmission(globalCustomerNum,groupId){
    $.mobile.showPageLoadingMsg();
	document.getElementById("customerId").value = groupId;
	document.getElementById("GroupListFormID").method='POST';
	document.getElementById("GroupListFormID").action=localStorage.contextPath+"/client/ci/loanrecovery/groups/"+globalCustomerNum+"/loanaccounts";
	document.getElementById("GroupListFormID").submit();
}

function loanRecoveryLoanGroupListBackFormSubmission(){
	var viaLoanOfficer = document.getElementById("viaLoanOfficerId").value;
	if(parseInt(viaLoanOfficer,10) == 1){
        $.mobile.showPageLoadingMsg();
		document.getElementById("GroupListFormID").method='POST';
		document.getElementById("GroupListFormID").action=localStorage.contextPath+"/client/ci/loanrecoveryloanofficer";
		document.getElementById("GroupListFormID").submit();
	}
	else if(parseInt(viaLoanOfficer,10) == 0) {
		window.location.assign(localStorage.contextPath+"/client/ci/menu");
	}
}