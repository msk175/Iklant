function doApplyAdjustmentObligationMetFormSubmission(){
    $.mobile.showPageLoadingMsg();
	document.getElementById("applyAdjustmentFormObligationMetId").method='POST';
	document.getElementById("applyAdjustmentFormObligationMetId").action=localStorage.contextPath+"/client/ci/loanrecovery/doapplyadjustmentwhenobligationmet";
	document.getElementById("applyAdjustmentFormObligationMetId").submit();

}

function backFormSubmission() {
    $.mobile.showPageLoadingMsg();
	document.getElementById("applyAdjustmentFormObligationMetId").method='POST';
	document.getElementById("applyAdjustmentFormObligationMetId").action=localStorage.contextPath+"/client/ci/loanrecovery/listapplyadjustment";
	document.getElementById("applyAdjustmentFormObligationMetId").submit();
}