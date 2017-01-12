//$(document).ready(function() {
$("#pageID").live('pageinit',function() {
	if($('input[name="response"]:checked').val() == 3){
		$("#voucherNumberValueId").text($("#voucherNumberIfBankId").val());
		$("#receiptId").val($("#voucherNumberIfBankId").val());
		$("#voucherNumberId").val($("#voucherNumberIfBankId").val());
	}
	$('#indAmount').hide();
	$('#indTableminus').hide();
	$('#save').hide();
	$('#received').hide();
	$('#indTable').click(function () {
			$('#indTable').hide();
		$('#indAmount').show();
		$('#indTableminus').show();
	if($("#receivedPaymentName").val() != "true"){	
		$('#save').show();
	}
	$('#save1').hide();
	});
	$('#indTableminus').click(function () {
		$('#indTableminus').hide();
		$('#indAmount').hide();
		$('#indTable').show();
		if($("#receivedPaymentName").val() != "true"){	
			$('#save1').show();
		}
		$('#save').hide();
	});
	//for menu slide panel
	$( "#popupPanel" ).on({
		popupbeforeposition: function() {
			var h = $( window ).height();

			$( "#popupPanel" ).css( "height", h );
		}
	});
	//End
	
	$("#yesId").click(function(){
		$.mobile.loading('show');
		applyPaymentSubmisson();
		
		//document.getElementById("applyPaymentFormId").method='POST';
		//document.getElementById("applyPaymentFormId").action=localStorage.contextPath+"/client/ci/loanrecovery/doapplypaymentForFO";
		//document.getElementById("applyPaymentFormId").submit();
	});
	$("#noId").click(function(){
		$('#save1').show();
		document.getElementById("save1").href= "JavaScript:doApplyPaymentFormSubmissionForFO()";
	});
	$("input[name='response']").change(function(){
		//alert($('input[name="response"]:checked').val());
		if($('input[name="response"]:checked').val() == 3){
			$("#voucherNumberValueId").text($("#voucherNumberIfBankId").val());
			$("#receiptId").val($("#voucherNumberIfBankId").val());
			$("#voucherNumberId").val($("#voucherNumberIfBankId").val());
		}
		else{
			$("#voucherNumberValueId").text($("#voucherNumberIfCashId").val());
			$("#receiptId").val($("#voucherNumberIfCashId").val());
			$("#voucherNumberId").val($("#voucherNumberIfCashId").val());
		}
	});

});
function applyPaymentSubmisson(){
var data ={};
	data.accountId 		  = $("#accountIdHiddenId").val();
	data.accountTypeId 	  =	$("#accountTypeIdHiddenId").val();
	data.globalAccountNum = $("#globalAccountNumId").val();
	data.receiptId 		  = $("#receiptId").val();
	data.amount 		  = $("#amountId").val();
	data.noOfClients 	  = $("#noOfClientsId").val();
	data.clientsId 	  	  = $("#clientsIdId").val();
	data.clientsName 	  = $("#clientsNameId").val();
	data.clientAmounts 	  = $("#clientAmountsId").val();
	data.installmentNumber= $("#installmentNumber").val();
	data.response		  = $('input[name="response"]:checked').val();	
	data.voucherNumber 	  = $("#voucherNumberId").val();
	$.ajax({
			type  : 'POST',
			data  : JSON.stringify(data),
			async :false,
			contentType: 'application/json',
			url: 'http://'+ajaxcallip+localStorage.contextPath+'/client/ci/loanrecovery/doapplypaymentForFO',
			success: function(result) {
				if(result.status == "success"){
					$('#errorMsg').text(result.error);
					$('#received').show();
					$('#save1').hide();
					$('#save').hide();
					$("#receivedPaymentName").val(true);
					$.mobile.loading('hide');
				}else if(result.status == "failure"){
					$('#errorMsg').text(result.error);
					$.mobile.loading('hide');
				}else{
					showPageExpired();
				}
				
			},
			error : function(jqXHR, textStatus, error) {

				
            }	
		});
}
function calculateGroupAmount() {
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
	var trxnDateArray = document.getElementById("dateofTransactionId").value.split("-");
	var trxnDate = new Date(trxnDateArray[2], trxnDateArray[1] - 1, trxnDateArray[0]).getTime();
	var disbursementDateArray = (document.getElementById("disbursementDateId").value).split("-");
	var disbursementDate = new Date(disbursementDateArray[2], disbursementDateArray[1] - 1, disbursementDateArray[0]).getTime();
	var lastPaymentDateArray = (document.getElementById("lastPaymentId").value).split("-");
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
            $.mobile.showPageLoadingMsg();
			document.getElementById("applyPaymentFormId").method='POST';
			document.getElementById("applyPaymentFormId").action=localStorage.contextPath+"/client/ci/loanrecovery/applypayment";
			document.getElementById("applyPaymentFormId").submit();
	}

}
function showPageExpired(){
    $.mobile.showPageLoadingMsg();
	document.getElementById("applyPaymentFormId").method='POST';
	document.getElementById("applyPaymentFormId").action=localStorage.contextPath+"/client/ci/showErrorPage";
	document.getElementById("applyPaymentFormId").submit();
}
function doApplyPaymentFormSubmissionForFO() {
	$('#save').hide();
	$('#save1').hide();
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
		$('#save').hide();
		$('#save1').show();
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
			$('#save').hide();
			$('#save1').show();
			mandatoryFlag = 0 ;
			$('#errorMsgForClientAmountId').text(clientAmountErrorMsg.replace(/(\s+)?.$/, ''));
			$(window).scrollTop(0);
		}
	}

	if(parseInt(totalAmount,10) == 0 && parseInt(totalClientAmount,10) == 0){
		$('#save').hide();
		$('#save1').show();
		mandatoryFlag = 0 ;
		$('#errorMsgForAmountId').text("Amount must be greater than 0");
		$(window).scrollTop(0);
	}


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
		$('#save').hide();
		$('#save1').show();
		mandatoryFlag = 0 ;
		clientOutstandingErrorMsg = clientOutstandingErrorMsg.replace(/(\s+)?.$/, '')
		clientOutstandingErrorMsg = clientOutstandingErrorMsg + " should be less than the amount required for complete payment.";
		$('#errorMsgForClientOutstandingId').text(clientOutstandingErrorMsg);
		$(window).scrollTop(0);
	}
	
	

	/*matches = $("#groupOutstandingId").text().match(/\(([^()]+)\)/);
	if(parseInt($("#amountId").val(),10) > parseInt(matches[1],10)) {
		mandatoryFlag = 0 ;
		$('#errorMsgForGroupOutstandingId').text("The group amount specified should be less than the amount required for complete payment.")
		$(window).scrollTop(0);
	}*/
	$("#amountId").val(parseInt($("#amountId").val(),10));

	if(mandatoryFlag == 1) {
	
		if(($("#relaxValidationId").is(':checked'))) {
			if($('#receiptId').val() == ""){
				$('#save').hide();
				$('#save1').show();
				$('#errorMsgForAmountMistmatchId').text("Please Enter Receipt Number");
				$(window).scrollTop(0);
			}
			else{
				matches = $("#groupOutstandingId").text().match(/\(([^()]+)\)/);
				if(parseInt(totalAmount,10) == parseInt(matches[1],10)){
					$("#loanStatusIdId").val(2);
				}
				if($('#noOfClientsId').val()>0){
					$('#clientsNameId').val(clientName);
					$('#clientsIdId').val(clientId);
					$('#clientAmountsId').val(clientPaymentAmount);
				}
				document.getElementById('save1').href= "#paymentVerifiedId";
				$("#save1").trigger('click');
			}
		}
		else {
			if($('#receiptId').val() == ""){
				$('#save').hide();
				$('#save1').show();
				$('#errorMsgForAmountMistmatchId').text("Please Enter Receipt Number");
				$(window).scrollTop(0);
			}
			
			else if($('#noOfClientsId').val()>0){
				$('#clientsNameId').val(clientName);
				$('#clientsIdId').val(clientId);
				$('#clientAmountsId').val(clientPaymentAmount);
				if(parseInt(totalAmount,10) == parseInt(totalClientAmount,10)) {
					/*matches = $("#groupOutstandingId").text().match(/\(([^()]+)\)/);
					if(parseInt(totalAmount,10) == parseInt(matches[1],10)){
						$("#loanStatusIdId").val(2);
					}*/
					document.getElementById("save1").href= "#paymentVerifiedId";
					$("#save1").trigger('click');
				}
				else{
					$('#save').hide();
					$('#save1').show();
					$('#amountId').val(parseInt(totalAmount,10));
					$('#errorMsgForAmountMistmatchId').text("The group amount "+parseInt(totalAmount,10)+" doesn't match with the individual sum amount "+parseInt(totalClientAmount,10)+". Please verify");
					$(window).scrollTop(0);
				}
			}
			else {
				/*matches = $("#groupOutstandingId").text().match(/\(([^()]+)\)/);
				if(parseInt(totalAmount,10) == parseInt(matches[1],10)){
					$("#loanStatusIdId").val(2);
				}*/
				document.getElementById("save1").href= "#paymentVerifiedId";
				$("#save1").trigger('click');
			}
		}
	}
}



function numeric(currentVal){
	//currentVal.value = currentVal.value.replace( /[^0-9]+/g, '');
	var regex = /[^0-9]+/g;
    if(regex.test(currentVal.value)) {
        currentVal.value = currentVal.value.replace(regex, '')  
    }
}

function backFormSubmission() {
    $.mobile.showPageLoadingMsg();
	var redirectFlag = $("#redirectionPageId").val();
	if(redirectFlag == 2){
		document.getElementById("applyPaymentFormId").method='GET';
		document.getElementById("applyPaymentFormId").action=localStorage.contextPath+"/client/ci/futureDueLoans";
		document.getElementById("applyPaymentFormId").submit();
	}else if(redirectFlag == 0){
		document.getElementById("applyPaymentFormId").method='GET';
		document.getElementById("applyPaymentFormId").action=localStorage.contextPath+"/client/ci/pastDueLoans";
		document.getElementById("applyPaymentFormId").submit();
	}else{
		document.getElementById("applyPaymentFormId").method='GET';
		document.getElementById("applyPaymentFormId").action=localStorage.contextPath+"/client/ci/loanrecoveryLoans";
		document.getElementById("applyPaymentFormId").submit();
	}
}

	

