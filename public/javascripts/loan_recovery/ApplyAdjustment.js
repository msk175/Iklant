$(document).ready(function() {
	var cashOrCheque = $("#cashOrBankId").val().split(",");
	var selectedIndex = $("select[name='sourceofPayment'] option:selected").index();
	//alert($("select[name='sourceofPayment'] option:selected").index());
	//alert(cashOrCheque[selectedIndex-1]);
	if(cashOrCheque[selectedIndex-1] == 'Bank') {
		$("#ChequeDetailId").show();
	}
	else {
        $('#revertReasonId option:contains("Cheque Dishonor")').remove();
		$("#chequeNoId").val("");
		$("#chequeDateId").val("");
		$("#ChequeDetailId").hide();
	}
	$(function() {
		$( "#dateofTransactionId" ).datepicker({
			maxDate: new Date,
			dateFormat: 'dd-mm-yy',
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
			dateFormat: 'dd-mm-yy',
			yearRange: "-90:+0",
  			changeMonth: true,
            changeYear: true
        });
	});
	$('#dateofTransactionId').click(function () {
		//alert('clicked');
		$('#sourceofPaymentDivId').hide();
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
                $('#revertReasonId option:contains("Cheque Dishonor")').remove();
                $("#revertReasonId").children("option").eq(0).after($("<option></option>").val("773").text("Cheque Dishonor"));
            }
			else {
                $('#revertReasonId option:contains("Cheque Dishonor")').remove();
                //$("#chequeNoId").val("");
				//$("#chequeDateId").val("");
				$("#ChequeDetailId").hide();
			}
		});
	});

	$('#revertPaymentID').click(function() {
		//alert($(this).is(':checked'));
        if($(this).is(':checked')){
			//alert('checked');
			/*$('#dateofTransactionId').textinput('disable');
			$('#sourceofPaymentId').selectmenu('disable');
			$('#amountId').textinput('disable');*/
			$('#revertDetailId').hide();
		}
        else{
           /* //alert('unchecked');
			$('#dateofTransactionId').textinput('enable');
			//$('#dateofTransactionId').refresh();
			$('#sourceofPaymentId').selectmenu('enable');
			$('#sourceofPaymentId').selectmenu('refresh');
			$('#amountId').textinput('enable');*/
			$('#revertDetailId').show();
		}
    });
	$('#indAmount').hide();
	$('#indTableminus').hide();
	//$('#save').hide();
	$('#indTable').click(function () {
			$('#indTable').hide();
		$('#indAmount').show();
		$('#indTableminus').show();
	});
	$('#indTableminus').click(function () {
		$('#indTableminus').hide();
		$('#indAmount').hide();
		$('#indTable').show();
	});
	$('#dateofTransactionId').change(function () {
		$('#errorMsgForLastPaymentDateId').text(" ");
		var initialTrxnDate = $("#initialDateOfTransactionDateId").val();
		var trxnDateArray = $("#dateofTransactionId").val().split("-");
		var trxnDate = new Date(trxnDateArray[2], trxnDateArray[1] - 1, trxnDateArray[0]).getTime();
		var lastPaymentDateArray = $("#lastPaymentDateId").val().split("-");
		var lastPaymentDate = new Date(lastPaymentDateArray[2], lastPaymentDateArray[1] - 1, lastPaymentDateArray[0]).getTime();
		var nextPaymentDateArray = $("#nextPaymentDateId").val().split("-");
		var nextPaymentDate = new Date(nextPaymentDateArray[2], nextPaymentDateArray[1] - 1, nextPaymentDateArray[0]).getTime();
		var fincialYearDateArray = $("#financialYearEndDateId").val().split("-");
		var fincialYearDate = new Date(fincialYearDateArray[2], fincialYearDateArray[1] - 1, fincialYearDateArray[0]).getTime();
		
		if(trxnDate > fincialYearDate ) {
			$('#dateofTransactionId').val(initialTrxnDate);
			$('#errorMsgForLastPaymentDateId').text("Year end process not yet done for this financial year.");
			$(window).scrollTop(0);
		}
		else if(trxnDate < lastPaymentDate) {
			document.getElementById("dateofTransactionId").value = initialTrxnDate;
			$('#errorMsgForLastPaymentDateId').text("Date of transaction cannot be less than the last payment date");
			$(window).scrollTop(0);
		}
		else if(nextPaymentDate != null) {
			if(trxnDate > nextPaymentDate) {
				document.getElementById("dateofTransactionId").value = initialTrxnDate;
				$('#errorMsgForLastPaymentDateId').text("Date of transaction cannot be more than the next payment date");
				$(window).scrollTop(0);
			}
		}
	});
	$("#amountId").keyup(function(){
		$("#amountId").val($("#amountId").val().replace( /[^0-9]+/g, ''));
	});
	
	for(var i = 0; i< $('#noOfClientsId').val(); i++) {
		$("#amountId"+i).keyup(function(){
			$('#'+this.id).val($('#'+this.id).val().replace( /[^0-9]+/g, ''));
		});
	}
	
});

function calculateGroupAmount() {
    var groupAmount = 0;
    for(var i = 0; i< $('#noOfClientsId').val(); i++) {
        if($('#amountId'+i).val()) {
            groupAmount = groupAmount + parseInt($('#amountId' + i).val(), 10);
        }
    }
    $('#amountId').val(groupAmount);
}

function doApplyAdjustmentFormSubmission() {
	$('#errorMsgForSourceOfPaymentId').text(" ");
	$('#errorMsgForAmountId').text(" ");
	$('#errorMsgForClientAmountId').text(" ");
	$('#errorMsgForAmountMistmatchId').text(" ");
	$('#errorMsgForChequeDetailId').text(" ");
	$('#errorMsgForRevertReasonId').text(" ");
	$('#errorMsgForVoucherDetailId').text(" ");
    $('#errorMsgForClientOutstandingId').text(" ");
    $('#errorMsgForGroupOutstandingId').text(" ");

	var clientName = new Array();
	var clientId = new Array();
	var clientPaymentAmount = new Array();
	var totalClientAmount = 0;
	var clientAmountErrorMsg = "";
	var mandatoryFlag = 1;
	
	var totalAmount = $('#amountId').val();
	var noOfClients = parseInt($('#noOfClientsId').val(),10);

    var clientOutstandingErrorMsg = "";
	if(($("#revertPaymentID").is(':checked')) != true) {
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
	if(($("#revertPaymentID").is(':checked')) != true) {
		//Validate Total Amount
		if(totalAmount == "") {
			mandatoryFlag = 0;
			$('#errorMsgForAmountId').text("Please Specify Valid Amount");
			$(window).scrollTop(0);
		}
		
		//Validate Client Amount
		if(noOfClients>0) {
			var j = 0;
			for(var i =0 ; i< noOfClients ; i++) {
				clientName[i] = $('#clientNameId'+i).text();
				clientId[i] = $('#clientIdId'+i).val();
				clientPaymentAmount[i] = $('#amountId'+i).val();
				if($('#amountId'+i).val() == "") {
					if(j == 0){
						clientAmountErrorMsg = "Please Specify Valid Amount For the Client ";
					}
					j++;
					clientAmountErrorMsg = clientAmountErrorMsg + clientName[i]+",";
				}
				totalClientAmount = parseInt(totalClientAmount,10) + (parseInt(clientPaymentAmount[i],10) || 0 );
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
			$('#errorMsgForSourceOfPaymentId').text("Please specify Source Of Payment");
			$(window).scrollTop(0);
		}
		/*var cashOrCheque = $("#cashOrBankId").val().split(",");
		var selectedIndex = $("select[name='sourceofPayment'] option:selected").index();
		if(cashOrCheque[selectedIndex-1] == 'Bank') {
			if($("#chequeNoId").val() == "" || $("#chequeDateId").val() == "" ) {
				$('#errorMsgForChequeDetailId').text("Please specify Cheque Datails");
				$(window).scrollTop(0);
				mandatoryFlag = 0 ;
			}
		}
		else {
			//$("#chequeNoId").val("");
			//$("#chequeDateId").val("");
			$("#ChequeDetailId").hide();
		}	*/
	}

	if($("#revertReasonId").val() == 0){
		mandatoryFlag = 0 ;
		$('#errorMsgForRevertReasonId').text("Please specify Revert Reason");
		$(window).scrollTop(0);
	}
	
	if($("#voucherNotesId").val() == ""){
		mandatoryFlag = 0 ;
		$('#errorMsgForVoucherDetailId').text("Please specify Voucher Notes ");
		$(window).scrollTop(0);
	}

	if(mandatoryFlag == 1) {
		if(($("#revertPaymentID").is(':checked')) != true) {
			$('#clientsNameId').val(clientName);
			$('#clientsIdId').val(clientId);
			$('#clientAmountsId').val(clientPaymentAmount);
			if(noOfClients>0){
				//$('#clientsNameId').val(clientName);
				//$('#clientsIdId').val(clientId);
				//$('#clientAmountsId').val(clientPaymentAmount);
				if(parseInt(totalAmount,10) == parseInt(totalClientAmount,10)) {
                    $.mobile.showPageLoadingMsg();
					document.getElementById("applyAdjustmentFormId").method='POST';
					document.getElementById("applyAdjustmentFormId").action=localStorage.contextPath+"/client/ci/loanrecovery/doapplyadjustment";
					document.getElementById("applyAdjustmentFormId").submit();
				}
				else{
					$('#amountId').val(parseInt(totalAmount,10));
					$('#errorMsgForAmountMistmatchId').text("The group amount "+parseInt(totalAmount,10)+" doesn't match with the individual sum amount "+parseInt(totalClientAmount,10)+". Please verify");
					$(window).scrollTop(0);
				}
			}
			else {
                $.mobile.showPageLoadingMsg();
				document.getElementById("applyAdjustmentFormId").method='POST';
				document.getElementById("applyAdjustmentFormId").action=localStorage.contextPath+"/client/ci/loanrecovery/doapplyadjustment";
				document.getElementById("applyAdjustmentFormId").submit();
			}
		}
		else {
                $.mobile.showPageLoadingMsg();
				document.getElementById("applyAdjustmentFormId").method='POST';
				document.getElementById("applyAdjustmentFormId").action=localStorage.contextPath+"/client/ci/loanrecovery/doapplyadjustment";
				document.getElementById("applyAdjustmentFormId").submit();
			}
	}	
		
}
function backFormSubmission() {
    $.mobile.showPageLoadingMsg();
	document.getElementById("applyAdjustmentFormId").method='POST';
	document.getElementById("applyAdjustmentFormId").action=localStorage.contextPath+"/client/ci/loanrecovery/listapplyadjustment";
	document.getElementById("applyAdjustmentFormId").submit();
}