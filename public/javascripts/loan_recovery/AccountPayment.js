$("#pageID").live('pageinit',function() {
	var cashOrCheque = $("#cashOrBankId").val().split(",");
	var selectedIndex = $("select[name='sourceofPayment'] option:selected").index();
	//alert($("select[name='sourceofPayment'] option:selected").index());
	//alert(cashOrCheque[selectedIndex-1]);
	$('#indAmount').hide();
	$('#indTableminus').hide();
	$('#save').hide();
	$('#indTable').click(function () {
		$('#indTable').hide();
		$('#indAmount').show();
		$('#indTableminus').show();
		if($('#roleIdHidden').val() == bmRoleId || $('#roleIdHidden').val() == smhRoleId) {
			$('#save').hide();
		}
		else {
			$('#save').show();
		}
		$('#save1').hide();
	});
	$('#indTableminus').click(function () {
		$('#indTableminus').hide();
		$('#indAmount').hide();
		$('#indTable').show();
		if($('#roleIdHidden').val() == bmRoleId || $('#roleIdHidden').val() == smhRoleId) {
			$('#save1').hide();
		}
		else {
			$('#save1').show();
		}
		$('#save').hide();
	});
	$( "#popupPanel" ).on({
		popupbeforeposition: function() {
			var h = $( window ).height();

			$( "#popupPanel" ).css( "height", h );
		}
	});
	
	if(cashOrCheque[selectedIndex-1] == 'Bank') {
		$("#ChequeDetailId").show();
	}
	else {
		$("#chequeNoId").val("");
		$("#chequeDateId").val("");
		$("#ChequeDetailId").hide();
	}
	//Temporary fix to prevent transaction for financial year close #Start Bask030
	var financialYearClosingDate = Date.parse(changeDateFormat('31/03/2015'));
    var lastTransactionDate = Date.parse(changeDateFormat($("#lastPaymentId").val()));
    var mindateForTransaction = $("#lastPaymentId").val();
    if(financialYearClosingDate >  lastTransactionDate)  {
        mindateForTransaction = "01/04/2015";
    }
	//Temporary fix to prevent transaction for financial year close #End Bask030
	
	$(function() {
		$( "#dateofTransactionId" ).datepicker({
			minDate: mindateForTransaction,
			maxDate: new Date,
			dateFormat: 'dd/mm/yy',
			yearRange: "-90:+0",
  			changeMonth: true,
            changeYear: true,
			
			onClose: function ()
			{	
				$('#sourceofPaymentDivId').show();
				// The "this" keyword refers to the input (in this case: #someinput)
				//this.focus();
			}
        });
	});
	$(function() {
		$( "#chequeDateId" ).datepicker({
			maxDate: new Date,
			dateFormat: 'dd/mm/yy',
			yearRange: "-90:+0",
  			changeMonth: true,
            changeYear: true
        });
	});
	$(function() {
		$("#sourceofPaymentId").change(function(){
			//alert($("#sourceofPaymentId").val());	
			var cashOrCheque = $("#cashOrBankId").val().split(",");
			var selectedIndex = $("select[name='sourceofPayment'] option:selected").index();
			//alert($("select[name='sourceofPayment'] option:selected").index());
			//alert(cashOrCheque[selectedIndex-1]);
			if(cashOrCheque[selectedIndex-1] == 'Bank') {
				$("#ChequeDetailId").show();
				$("#voucherNumberDiv").show();
				$("#voucherNumberValueId").text($("#voucherNumberIfBankId").val());
				$("#voucherNumberId").val($("#voucherNumberIfBankId").val());
			}
			else if(cashOrCheque[selectedIndex-1] == 'Cash'){
				$("#voucherNumberDiv").show();
				$("#ChequeDetailId").hide();
				$("#voucherNumberValueId").text($("#voucherNumberIfCashId").val());
				$("#voucherNumberId").val($("#voucherNumberIfCashId").val());
			}
			else {
				//$("#chequeNoId").val("");
				//$("#chequeDateId").val("");
				$("#voucherNumberId").val("");
				$("#voucherNumberDiv").hide();
				$("#ChequeDetailId").hide();
			}
		});
	});
	$("input:radio[name=retrieveType]").click(function() {
		var value = $(this).val();
		//alert(value);
		applyPaymentFormSubmission();
	});
	
	$('#dateofTransactionId').click(function () {
		//alert('clicked');
		$('#sourceofPaymentDivId').hide();
	});
	
	
	$('#dateofTransactionId').change(function () {
		//alert('changed');
		applyPaymentFormSubmission($('#initialDateOfTransactionDateId').val());
		//$('#sourceofPaymentId').selectmenu('enable');
	});
	
	$("#amountId").keyup(function(){
		//alert("alerrrr");
		$("#amountId").val($("#amountId").val().replace( /[^0-9]+/g, ''));
	});
	
	for(var i = 0; i< $('#noOfClientsId').val(); i++) {
		$("#amountId"+i).keyup(function(){
			//alert(this.id);
			$('#'+this.id).val($('#'+this.id).val().replace( /[^0-9]+/g, ''));
		});
	}
	
	
	/*for(var i = 0; i< $('#noOfClientsId').val(); i++) {
		$("#amountId"+i).focusout(function() {
			//$('#errorMsgForClientOutstandingId').text("");
			var idName = this.id;
			var position = parseInt(idName.replace( /^\D+/g, ''),10);
			//alert(position);
			matches = $('#clientOutstandingId'+position).text().match(/\(([^()]+)\)/);
			//alert(matches[1]);
			if(parseInt($('#'+this.id).val(),10) >= parseInt(matches[1],10)) {
				//alert("Inside......");
				$(window).scrollTop(0);
				//$('#errorMsgForClientOutstandingId').text("The amount specified should be less than the amount required for complete payment.")
			}
		});
	}
	
	$("#amountId").focusout(function() {
		matches = $("#groupOutstandingId").text().match(/\(([^()]+)\)/);
		alert(matches[1]);
		if(parseInt($("#amountId").val(),10) >= parseInt(matches[1],10)) {
			$('#errorMsgForGroupOutstandingId').text("The amount specified should be less than the amount required for complete payment.")
			$(window).scrollTop(0);
			
		}
	});*/

});

function calculateGroupAmount() {
	//alert("fdf");
	var groupAmount = 0;
	for(var i = 0; i< $('#noOfClientsId').val(); i++) {
        if($('#amountId'+i).val()) {
            groupAmount = groupAmount + parseInt($('#amountId' + i).val(), 10);
        }
	}
	$('#amountId').val(groupAmount);
}

function applyPaymentFormSubmission(initialTrxnDate) {
	//alert(document.getElementById("dateofTransactionId").value);
	//var initialTrxnDate = document.getElementById("dateofTransactionId").value;
	var trxnDateArray = document.getElementById("dateofTransactionId").value.split("/");
	var trxnDate = new Date(trxnDateArray[2], trxnDateArray[1] - 1, trxnDateArray[0]).getTime();
	var disbursementDateArray = (document.getElementById("disbursementDateId").value).split("-");
	var disbursementDate = new Date(disbursementDateArray[2], disbursementDateArray[1] - 1, disbursementDateArray[0]).getTime();
	var lastPaymentDateArray = (document.getElementById("lastPaymentId").value).split("/");
	var lastPaymentDate = new Date(lastPaymentDateArray[2], lastPaymentDateArray[1] - 1, lastPaymentDateArray[0]).getTime();
	$('#errorMsgForDisbursementDateId').text(" ");
	$('#errorMsgForLastPaymentDateId').text(" ");

	var fincialYearDateArray = document.getElementById('financialYearEndDateId').value.split("-");
	var fincialYearDate = new Date(fincialYearDateArray[2], fincialYearDateArray[1] - 1, fincialYearDateArray[0]).getTime();
	if(trxnDate > fincialYearDate ) {
		$('#dateofTransactionId').val(initialTrxnDate);
		$('#errorMsgForLastPaymentDateId').text("Year end process not yet done for this financial year.");
		$(window).scrollTop(0);
	}
	else{
		document.getElementById("applyPaymentFormId").method='POST';
		document.getElementById("applyPaymentFormId").action=localStorage.contextPath+"/client/ci/applyPaymentForFO";
		document.getElementById("applyPaymentFormId").submit();
	}

}

function doApplyPaymentFormSubmission() {

	var clientName = new Array();
	var clientId = new Array();
	var clientPaymentAmount = new Array();
	var mandatoryFlag = 1;
	
	$('#errorMsgForSourceOfPayment').text(" ");
	$('#errorMsgForAmountId').text(" ");
	$('#errorMsgForClientAmountId').text(" ");
	$('#errorMsgForAmountMistmatchId').text(" ");
	$('#errorMsgForChequeDetailId').text(" ");
	$('#errorMsgForGroupOutstandingId').text(" ");
	$('#errorMsgForClientOutstandingId').text(" ");

	var totalAmount = $('#amountId').val();
	var noOfClients = parseInt($('#noOfClientsId').val(),10);
	//Validate Total Amount
	if(totalAmount == "") {
		mandatoryFlag = 0;
		$('#errorMsgForAmountId').text("Please Specify Valid Amount");
		$(window).scrollTop(0);
	}
	
	var totalClientAmount = 0;
	var clientAmountErrorMsg = "";
	if(noOfClients>0) {
		//Validate Client Amount
		var j = 0;
		for(var i =0 ; i< $('#noOfClientsId').val() ; i++) {
			clientName[i] = $('#clientNameId'+i).text();
			clientId[i] = $('#clientIdId'+i).val();
			clientPaymentAmount[i] = $('#amountId'+i).val();
			if($('#amountId'+i).val() == "") {
				if(j == 0){
					clientAmountErrorMsg = "Please Specify Valid Amount For the Clients ";
				}
				clientAmountErrorMsg = clientAmountErrorMsg + clientName[i]+",";
				j++;
			}
			totalClientAmount = parseInt(totalClientAmount,10) + (parseInt(clientPaymentAmount[i],10) || 0 );
			//alert(totalClientAmount);
		}
		if(clientAmountErrorMsg != "") {
			mandatoryFlag = 0 ;
			$('#errorMsgForClientAmountId').text(clientAmountErrorMsg.replace(/(\s+)?.$/, ''));
			$(window).scrollTop(0);
		}
	}
	
	if(parseInt(totalAmount,10) == 0 && parseInt(totalClientAmount,10) == 0){
		mandatoryFlag = 0 ;
		$('#errorMsgForAmountId').text("Amount must be greater than 0");
		$(window).scrollTop(0);
	}
	if($("#sourceofPaymentId").val() == 0){
		mandatoryFlag = 0 ;
		$('#errorMsgForSourceOfPayment').text("Please specify Source Of Payment");
		$(window).scrollTop(0);
	}
	
	var cashOrCheque = $("#cashOrBankId").val().split(",");
	var selectedIndex = $("select[name='sourceofPayment'] option:selected").index();
	if(cashOrCheque[selectedIndex-1] == 'Bank') {
		if($("#chequeNoId").val().length < 5 | $("#chequeNoId").val().length > 7) {
			$('#errorMsgForChequeDetailId').text("Cheque Number should be 6 or 7 digits");
			$(window).scrollTop(0);
			mandatoryFlag = 0 ;
		}
		else if($("#chequeDateId").val() == "" ){
			$('#errorMsgForChequeDetailId').text("Please specify cheque date");
			$(window).scrollTop(0);
			mandatoryFlag = 0 ;
		}
	}
	/*else {
		//$("#chequeNoId").val("");
		//$("#chequeDateId").val("");
		$("#ChequeDetailId").hide();
	}*/

	var clientOutstandingErrorMsg = "";
	var k = 0;
	for(var i = 0; i< $('#noOfClientsId').val(); i++) {
		matches = $('#clientOutstandingId'+i).text().match(/\(([^()]+)\)/);
		if(parseInt($("#amountId"+i).val(),10) > parseInt(matches[1],10)+1) {
			if(k == 0){
				clientOutstandingErrorMsg = "The amount specified for ";
			}
			clientOutstandingErrorMsg = clientOutstandingErrorMsg + $('#clientNameId'+i).text()+",";
			k++;
		}
		//$("#amountId"+i).val(parseInt($("#amountId"+i).val(),10));
	}
	if(clientOutstandingErrorMsg != "") {
		mandatoryFlag = 0 ;
		clientOutstandingErrorMsg = clientOutstandingErrorMsg.replace(/(\s+)?.$/, '')
		clientOutstandingErrorMsg = clientOutstandingErrorMsg + " should be less than the amount required for complete payment.";
		$('#errorMsgForClientOutstandingId').text(clientOutstandingErrorMsg);
		$(window).scrollTop(0);
	}
	
	
	
	matches = $("#groupOutstandingId").text().match(/\(([^()]+)\)/);
	if(parseInt($("#amountId").val(),10) > parseInt(matches[1],10)) {
		mandatoryFlag = 0 ;
		$('#errorMsgForGroupOutstandingId').text("The group amount specified should be less than the amount required for complete payment.")
		$(window).scrollTop(0);
	}
	$("#amountId").val(parseInt($("#amountId").val(),10));
	
	
	if(mandatoryFlag == 1) {
		if(($("#relaxValidationId").is(':checked'))) {
			if($('#noOfClientsId').val()>0){
				$('#clientsNameId').val(clientName);
				$('#clientsIdId').val(clientId);
				$('#clientAmountsId').val(clientPaymentAmount);
			}
			matches = $("#groupOutstandingId").text().match(/\(([^()]+)\)/);
			if(parseInt(totalAmount,10) == parseInt(matches[1],10)){
				$("#loanStatusIdId").val(2);
			}
            $.mobile.showPageLoadingMsg();
			document.getElementById("applyPaymentFormId").method='POST';
			document.getElementById("applyPaymentFormId").action=localStorage.contextPath+"/client/ci/loanrecovery/doapplypayment";
			document.getElementById("applyPaymentFormId").submit();
		}
		else {
			if($('#noOfClientsId').val()>0){
				$('#clientsNameId').val(clientName);
				$('#clientsIdId').val(clientId);
				$('#clientAmountsId').val(clientPaymentAmount);
				if(parseInt(totalAmount,10) == parseInt(totalClientAmount,10)) {
					matches = $("#groupOutstandingId").text().match(/\(([^()]+)\)/);
					if(parseInt(totalAmount,10) == parseInt(matches[1],10)){
						$("#loanStatusIdId").val(2);
					}
                    $.mobile.showPageLoadingMsg();
					document.getElementById("applyPaymentFormId").method='POST';
					document.getElementById("applyPaymentFormId").action=localStorage.contextPath+"/client/ci/loanrecovery/doapplypayment";
					document.getElementById("applyPaymentFormId").submit();
				}
				else{
					$('#amountId').val(parseInt(totalAmount,10));
					$('#errorMsgForAmountMistmatchId').text("The group amount "+parseInt(totalAmount,10)+" doesn't match with the individual sum amount "+parseInt(totalClientAmount,10)+". Please verify");
					$(window).scrollTop(0);
				}
			}
			else {
				matches = $("#groupOutstandingId").text().match(/\(([^()]+)\)/);
				if(parseInt(totalAmount,10) == parseInt(matches[1],10)){
					$("#loanStatusIdId").val(2);
				}
                $.mobile.showPageLoadingMsg();
				document.getElementById("applyPaymentFormId").method='POST';
				document.getElementById("applyPaymentFormId").action=localStorage.contextPath+"/client/ci/loanrecovery/doapplypayment";
				document.getElementById("applyPaymentFormId").submit();
			}
		}	
		
	}

}

function backFormSubmission(globalAccountNum) {
	if($('#roleIdHidden').val() == bmRoleId || $('#roleIdHidden').val() == smhRoleId || $('#roleIdHidden').val() == cceRoleId) {
        $.mobile.showPageLoadingMsg();
		document.getElementById("applyPaymentFormId").method='GET';
		document.getElementById("applyPaymentFormId").action=localStorage.contextPath+"/client/ci/dueloansformanager";
		document.getElementById("applyPaymentFormId").submit();	
	}
	else {
        $.mobile.showPageLoadingMsg();
		var globalCustomerNum;
		document.getElementById("applyPaymentFormId").method='POST';
		document.getElementById("applyPaymentFormId").action=localStorage.contextPath+"/client/ci/loanrecovery/groups/"+globalCustomerNum+"/loanaccounts";
		document.getElementById("applyPaymentFormId").submit();
	}
}
function changeDateFormat(date) {
    var dateInArray = date.split("/");
    return dateInArray[2]+"-"+dateInArray[1]+"-"+dateInArray[0];
}
