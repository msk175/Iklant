function loanRecoveryLoanAccountFormSubmission(globalAcountNum,accountId,roleId){
    $.mobile.showPageLoadingMsg();
	$('#accountId').val(accountId);
	$('#globalAccountNum').val(globalAcountNum);
		document.getElementById("LoanAccountFormID").method='POST';
		document.getElementById("LoanAccountFormID").action=localStorage.contextPath+"/client/ci/applyPaymentForFO";
		document.getElementById("LoanAccountFormID").submit();
}
function showPaidEntries(globalAcountNum,accountId){
    $.mobile.showPageLoadingMsg();
	$('#globalAccountNum').val(globalAcountNum);
	$('#accountId').val(accountId);
	$('#flagId').val(1);
	document.getElementById("LoanAccountFormID").method='POST';
	document.getElementById("LoanAccountFormID").action=localStorage.contextPath+"/client/ci/loanrecovery/listapplyadjustment";
	document.getElementById("LoanAccountFormID").submit();
}
function backToSearch(roleId){
    $.mobile.showPageLoadingMsg();
	if(roleId == foRoleId){
		document.getElementById("LoanAccountFormID").method='GET';
		document.getElementById("LoanAccountFormID").action=localStorage.contextPath+"/client/ci/loanrecoveryLoans";
		document.getElementById("LoanAccountFormID").submit();
	}else{
		document.getElementById("LoanAccountFormID").method='GET';
		document.getElementById("LoanAccountFormID").action=localStorage.contextPath+"/client/ci/searchpage";
		document.getElementById("LoanAccountFormID").submit();
	}
}
function getClientListForLoanSanction(mifosCustomerId){
    $.mobile.showPageLoadingMsg();
	$('#LoanAccountFormID').attr('method', 'POST'); 
	$('#LoanAccountFormID').attr('action', localStorage.contextPath+'/client/ci/groups/member/loansanction/'+mifosCustomerId+'/createLoan');
	$('#LoanAccountFormID').submit();
} 
$(document).ready(function() {
$("#inactiveClosedObligId").hide();
$("#inactiveReshWriteOffId").hide();
$("#subInactiveId").hide();


$("#custom-li-mainTab1").click(function(){
	$("#activeId").show();
	$("#subInactiveId").hide();
	$("#inactiveClosedObligId").hide();
	$("#inactiveReshWriteOffId").hide();
});

$("#custom-li-mainTab4").click(function(){
	$("#activeId").hide();
	$("#subInactiveId").show();
	$("#inactiveClosedObligId").show();
	$("#inactiveReshWriteOffId").hide();
});

$("#custom-li-subInactiveTab1").click(function(){
	$("#activeId").hide();
	$("#inactiveId").show();
	$("#inactiveClosedObligId").show();
	$("#inactiveReshWriteOffId").hide();
});
$("#custom-li-subInactiveTab2").click(function(){
	$("#activeId").hide();
	$("#inactiveId").show();
	$("#inactiveReshWriteOffId").show();
	$("#inactiveClosedObligId").hide();
});
	
});