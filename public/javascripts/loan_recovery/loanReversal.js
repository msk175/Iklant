function submitReversal(){
	if($('#notesId').val() != ''){
        $(window).scrollTop(0);
        $("#reverseConfirmationId").popup("open");
        document.getElementById("errorLabel").innerText = "";
	}else{
		var errorLabelMandatory = "Please provide Notes For Reversal"
		document.getElementById("errorLabel").innerText = errorLabelMandatory;
		$(window).scrollTop(0);
	}
    $('#noReverseId').click(function() {
        $("#reverseConfirmationId" ).popup( "close" );
    });
    $('#yesReverseId').click(function() {
        $.mobile.showPageLoadingMsg();
        document.getElementById("reverseForm").method='POST';
        document.getElementById("reverseForm").action=localStorage.contextPath+"/client/ci/loanrecovery/reverse/submitreverseInformation";
        document.getElementById("reverseForm").submit();
    });
}

function backFormSubmission(globalAccountNum) {
    $.mobile.showPageLoadingMsg();
	document.getElementById("reverseForm").method='POST';
	document.getElementById("reverseForm").action=localStorage.contextPath+"/client/ci/applyPaymentForFO";
	document.getElementById("reverseForm").submit();
}