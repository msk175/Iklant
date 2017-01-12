window.history.forward();

function getClientListForLoanSanction(groupid,isSynchronized,mifosCustomerId){
    $.mobile.showPageLoadingMsg();
	$('#BMFormId').attr('method', 'POST'); 
	$('#BMFormId').attr('action', localStorage.contextPath+'/client/ci/groups/member/loansanction/'+groupid+'/'+isSynchronized+'/'+mifosCustomerId+'/upload');
	$('#BMFormId').submit();
} 

function loanSanctionCancelButton() {
    $.mobile.showPageLoadingMsg();
	document.getElementById("BMFormId").method='POST';
	document.getElementById("BMFormId").action=localStorage.contextPath+"/client/ci/groups/operation/"+loanSanctionOperationId+"";
	document.getElementById("BMFormId").submit();
}

function synchronizedPageCancelButton() {
    $.mobile.showPageLoadingMsg();
	document.getElementById("BMFormId").method='POST';
	document.getElementById("BMFormId").action=localStorage.contextPath+"/client/ci/groups/operation/"+synchronizedOperationId+"";
	document.getElementById("BMFormId").submit();
}

function Synchronize(groupId) {
    $.mobile.showPageLoadingMsg();
	document.getElementById("BMFormId").method='POST';
	document.getElementById("BMFormId").action=localStorage.contextPath+"/client/ci/groups/synchronize/"+groupId;
	document.getElementById("BMFormId").submit();
}