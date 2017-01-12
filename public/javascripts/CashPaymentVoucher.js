$(document).ready(function() {
	$(function() {
		$("#dateofTransactionId").datepicker({
			//minDate: $("#lastPaymentId").val(),
			//maxDate: new Date,
			maxDate: $("#dateofTransactionToDateId").val(),
			dateFormat: 'dd/mm/yy',
			yearRange: "-90:+0",
  			changeMonth: true,
            changeYear: true
        });
		$("#dateofTransactionToDateId").datepicker({
			//minDate: $("#dateofTransactionId").val(),
			maxDate: new Date,
			dateFormat: 'dd/mm/yy',
			yearRange: "-90:+0",
  			changeMonth: true,
            changeYear: true
        });
	});
	
	if($('#roleId').val() != smhRoleId && $('#roleId').val() != amhRoleId) {
		$('#officeId').selectmenu('disable');
	}

    var typeOfTransaction = $('#typeOfTransactionIdHidden').val();
	$('#dateofTransactionId').change(function () {
        $.mobile.showPageLoadingMsg();
		typeOfTransaction = $('#typeOfTransactionIdHidden').val();
		document.getElementById("cashPaymentVoucherFormID").method='POST';
		document.getElementById("cashPaymentVoucherFormID").action=localStorage.contextPath+"/client/ci/accounts/cashPaymentVoucherLoad/"+typeOfTransaction+"/0";
		document.getElementById("cashPaymentVoucherFormID").submit();
	});
	$('#officeId').change(function () {
        $.mobile.showPageLoadingMsg();
		typeOfTransaction = $('#typeOfTransactionIdHidden').val();
		document.getElementById("cashPaymentVoucherFormID").method='POST';
		document.getElementById("cashPaymentVoucherFormID").action=localStorage.contextPath+"/client/ci/accounts/cashPaymentVoucherLoad/"+typeOfTransaction+"/0";
		document.getElementById("cashPaymentVoucherFormID").submit();
	});
	$('#dateofTransactionToDateId').change(function () {
        $.mobile.showPageLoadingMsg();
		typeOfTransaction = $('#typeOfTransactionIdHidden').val();	
		document.getElementById("cashPaymentVoucherFormID").method='POST';
		document.getElementById("cashPaymentVoucherFormID").action=localStorage.contextPath+"/client/ci/accounts/cashPaymentVoucherLoad/"+typeOfTransaction+"/0";
		document.getElementById("cashPaymentVoucherFormID").submit();
	});
	
	$("#search").on("keyup", function() {
		var value = $(this).val();
		var commonValue = value.toUpperCase();
		$("table tr").each(function(index) {
			if (index !== 0) {
				$row = $(this);
				var id1 = $row.find("td:eq(1)").text();
				var id2 = $row.find("td:eq(2)").text();
				var id3 = $row.find("td:eq(3)").text();
				
				var commonId1 = id1.toUpperCase();
				var commonId2 = id2.toUpperCase();
				var commonId3 = id3.toUpperCase();
				if (commonId1.indexOf(commonValue) !== -1 || commonId2.indexOf(commonValue) !== -1 || commonId3.indexOf(commonValue) !== -1) {
				   $row.show();
				}
				else {
				   $row.hide();
				}
			}
		});
	});

	$("#custom-li-"+typeOfTransaction).addClass("ui-btn-active");
		


});

function generateCashPaymentVoucherPDF(index,debitAcc,debitOrCredit,creditAcc,trxnAmt,narration,amountInWords,masterId,voucherNo,paymentDate){
	
	var data ={};
	data.debitAcc = debitAcc;
    data.debitOrCredit = debitOrCredit;
	data.creditAcc = creditAcc;
	data.trxnAmt = trxnAmt;
	data.narration = narration;
	data.amountInWords = amountInWords;
	data.masterId = masterId;
	data.voucherNo = voucherNo;
	data.paymentDate = paymentDate; // Praveen [PDF Issue]
	data.typeOfTransaction = $("#typeOfTransactionIdHidden").val();
	$.ajax({
		beforeSend : function() { 
			$.mobile.showPageLoadingMsg(); 
		},
		complete: function() { 
			$.mobile.hidePageLoadingMsg() 
		},
		type  : 'POST',
		data  : JSON.stringify(data),
		async :false,
		contentType: 'application/json',
		url: 'http://'+ajaxcallip+localStorage.contextPath+'/client/ci/accounts/generateCashPaymentVoucherPDF',
		success: function(result) {
			if(result.status == "success"){
				$("#filePathId"+index).val(result.path);
				//$("#generatePDF"+index).hide();
				//$("#downloadId"+index).removeClass('ui-disabled');
				//$("#successMsg"+index).text("Voucher Generated");
				downloadCashPaymentVoucherPDF(index);
			}else{
				showPageExpired();
			}
			
		},
		error : function(jqXHR, textStatus, error) {

			
		}	
	});
}
function downloadCashPaymentVoucherPDF(index){
    $.mobile.showPageLoadingMsg();
	$("#selectedDocNameId").val($("#filePathId"+index).val());
	document.getElementById("cashPaymentVoucherFormID").method='POST';
	document.getElementById("cashPaymentVoucherFormID").action=localStorage.contextPath+"/client/ci/downloadDocs";
	document.getElementById("cashPaymentVoucherFormID").submit();

}
function showPageExpired(){
    $.mobile.showPageLoadingMsg();
	document.getElementById("cashPaymentVoucherFormID").method='POST';
	document.getElementById("cashPaymentVoucherFormID").action=localStorage.contextPath+"/client/ci/showErrorPage";
	document.getElementById("cashPaymentVoucherFormID").submit();
}

function cashPaymentVoucherFormSubmission(typeOfTransaction){
    $.mobile.showPageLoadingMsg();
	document.getElementById("cashPaymentVoucherFormID").method='POST';
	document.getElementById("cashPaymentVoucherFormID").action=localStorage.contextPath+"/client/ci/accounts/cashPaymentVoucherLoad/"+typeOfTransaction+"/1";
	document.getElementById("cashPaymentVoucherFormID").submit();
}

function editPaymentVoucherFormSubmission(typeOfTransaction,transactionMasterId){
    $('#transactionMasterId').val(transactionMasterId);
    $.mobile.showPageLoadingMsg();
    document.getElementById("cashPaymentVoucherFormID").method='POST';
    document.getElementById("cashPaymentVoucherFormID").action=localStorage.contextPath+"/accounts/editAccountingTransaction";
    document.getElementById("cashPaymentVoucherFormID").submit();
}
