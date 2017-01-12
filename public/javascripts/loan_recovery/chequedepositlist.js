function showDepositScreen(paymentCollectionId,groupName,globalAccountNum,amount){
    $.mobile.showPageLoadingMsg();
	$("#paymentCollectionId").val(paymentCollectionId);
	$("#groupNameId").val(groupName);
	$("#globalAccountNumId").val(globalAccountNum);
	$("#amountId").val(amount);
	document.getElementById("chequeDepositFormId").method='POST';
	document.getElementById("chequeDepositFormId").action=localStorage.contextPath+"/client/ci/chequeDeposit";
	document.getElementById("chequeDepositFormId").submit();
}