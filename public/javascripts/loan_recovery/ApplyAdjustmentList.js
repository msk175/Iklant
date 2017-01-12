$(document).ready(function() {
	$(function() {
		$( "#voucherDateId" ).datepicker({
			maxDate: new Date,
			dateFormat: 'dd/mm/yy',
			yearRange: "-90:+0",
  			changeMonth: true,
            changeYear: true
        });
	});
});
function applyAdjustmentListFormSubmission(paymentId,loanStatusId) {
	var url;
	if(loanStatusId == 6){
		url = localStorage.contextPath+"/client/ci/loanrecovery/applyadjustmentwhenobligationmet";
	}
	else {
		url = localStorage.contextPath+"/client/ci/loanrecovery/applyadjustment";
	}
	//alert(url);
	document.getElementById("paymentIdId").value = paymentId;
	document.getElementById("applyAdjustmentListFormId").method='POST';
	document.getElementById("applyAdjustmentListFormId").action= url;
	document.getElementById("applyAdjustmentListFormId").submit();
}

function backFormSubmission(globalAccountNum,loanStatusId) {
	var globalCustomerNum;
	if(loanStatusId == 6){
		document.getElementById("applyAdjustmentListFormId").method='POST';
		document.getElementById("applyAdjustmentListFormId").action=localStorage.contextPath+"/client/ci/loanrecovery/groups/"+globalCustomerNum+"/loanaccounts";
		document.getElementById("applyAdjustmentListFormId").submit();
	}else{
		document.getElementById("applyAdjustmentListFormId").method='POST';
		document.getElementById("applyAdjustmentListFormId").action=localStorage.contextPath+"/client/ci/applyPaymentForFO";
		document.getElementById("applyAdjustmentListFormId").submit();
	}
}
