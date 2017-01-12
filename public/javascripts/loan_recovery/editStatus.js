$(document).ready(function() {
	
   $(function() {
		$( "#dateofTransactionId" ).datepicker({
			minDate: $("#lastPaymentId").val(),
			maxDate: new Date,
			dateFormat: 'dd/mm/yy',
			yearRange: "-90:+0",
  			changeMonth: true,
            changeYear: true
        });
	  });

});

function editAccountStatusFormSubmission(){

	$('#errorMsgForCurrentStatusId').text("");
	$('#errorMsgForNotesId').text("");
	//alert($('input:radio[name=currentStatus]:checked').val());
	var mandatory = 1 ;
	var initialTrxnDate = $('#initialDateOfTransactionDateId').val();
	var trxnDateArray = $('#dateofTransactionId').val().split("-");
	var trxnDate = new Date(trxnDateArray[2], trxnDateArray[1] - 1, trxnDateArray[0]).getTime();
	var fincialYearDateArray =  $('#financialYearEndDateId').val().split("-");
	var fincialYearDate = new Date(fincialYearDateArray[2], fincialYearDateArray[1] - 1, fincialYearDateArray[0]).getTime();
	if(trxnDate > fincialYearDate ) {
		$('#dateofTransactionId').val(initialTrxnDate);
		$('#errorMsgForFinancialYearId').text("Year end process not yet done for this financial year.");
		$(window).scrollTop(0);
		mandatory = 0 ;
		
	}
	if($('input:radio[name=currentStatus]').is(':checked') != true){
		//alert("it's checked"); 
		$('#errorMsgForCurrentStatusId').text("Please select current status.");
		mandatory = 0 ;
	}
	if($('#notesId').val()== "") {
		$('#errorMsgForNotesId').text("Please specify Notes.");
		mandatory = 0 ;
	}
	if(mandatory == 1){
        $(window).scrollTop(0);
        $("#editStatusConfirmationId").popup("open");

        $('#noEditStatusId').click(function(){
            $("#editStatusConfirmationId").popup("close");
        });
        $('#yesEditStatusId').click(function(){
            $.mobile.showPageLoadingMsg();
            document.getElementById("editStatusFormId").method='POST';
            document.getElementById("editStatusFormId").action=localStorage.contextPath+"/client/ci/loanrecovery/doeditaccountstatus";
            document.getElementById("editStatusFormId").submit();
        });
    }
}


function backFormSubmission(globalAccountNum) {
    $.mobile.showPageLoadingMsg();
	document.getElementById("editStatusFormId").method='POST';
	document.getElementById("editStatusFormId").action=localStorage.contextPath+"/client/ci/applyPaymentForFO";
	document.getElementById("editStatusFormId").submit();
}