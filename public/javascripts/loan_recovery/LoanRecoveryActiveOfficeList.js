function loanRecoveryActiveOfficeListFormSubmission(officeId){
    $.mobile.showPageLoadingMsg();
	document.getElementById("officeIdId").value= officeId;
	document.getElementById("LoanRecoveryActiveOfficeFormId").method='POST';
	document.getElementById("LoanRecoveryActiveOfficeFormId").action=localStorage.contextPath+"/client/ci/loanrecoveryloanofficer";
	document.getElementById("LoanRecoveryActiveOfficeFormId").submit();
}