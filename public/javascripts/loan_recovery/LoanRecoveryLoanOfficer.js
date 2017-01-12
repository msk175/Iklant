function loanRecoveryLoanOfficerFormSubmission(loanOfficerId){
    $.mobile.showPageLoadingMsg();
	document.getElementById("LoanOfficerFormID").method='POST';
	document.getElementById("LoanOfficerFormID").action=localStorage.contextPath+"/client/ci/loanrecovery/loanofficers/"+loanOfficerId+"/grouplist";
	document.getElementById("LoanOfficerFormID").submit();
}

function loanRecoveryLoanOfficerbackFormSubmission() {
	var viasmh = document.getElementById("viasmhId").value;
	
	if(viasmh == 1) {
		window.location.assign(localStorage.contextPath+"/client/ci/loanrecoveryactiveoffices");
	}else {
		window.location.assign(localStorage.contextPath+"/client/ci/menu");
	}
}