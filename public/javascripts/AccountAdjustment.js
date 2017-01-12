$(document).ready(function() {
	var allowedDecimals = parseInt($("#allowedDecimalsId").val(),10);
	$(function() {
		$( "#voucherDateId" ).datepicker({
			maxDate: new Date,
			dateFormat: 'dd/mm/yy',
			yearRange: "-90:+0",
  			changeMonth: true,
            changeYear: true,
			onClose: function ()
			{	
				$('#officeHierarchyDivId').show();
				$('#debitAccountHeadDivId').show();
				// The "this" keyword refers to the input (in this case: #someinput)
				//this.focus();
			}
        });
	});
	$(function() {
		$("#officeHierarchyId").val($('#selectedOfficeHierarchyId').val()).selectmenu("refresh");
	});
	
	$('#voucherDateId').click(function () {
		$('#officeHierarchyDivId').hide();
		$('#debitAccountHeadDivId').hide();
	});
	
	$("#amountId").keyup(function(){
		var val = $(this).val();
		if(isNaN(val)){
			 val = val.replace(/[^0-9\.]/g,'');
			 if(val.split('.').length>2) 
				 val =val.replace(/\.+$/,"");
		}
		val = noSpace(val);
		$("#amountId").val(val);
	});
	function noSpace(val) { 
		val = val.replace(/(^\s*)|(\s*$)/gi,"");
		val = val.replace(/[ ]{2,}/gi," "); 
		val = val.replace(/\n /,"\n"); 
		return val;
	}
	$("#officeHierarchyId").change(function(){
		//alert($("#officeHierarchyId").val());
		if($("#officeHierarchyId").val() != ""){
            $.mobile.showPageLoadingMsg();
			$("#currentSelectValueId").val("loadOffices");
			document.getElementById("accountAdjustmentFormId").method='POST';
			document.getElementById("accountAdjustmentFormId").action=localStorage.contextPath+"/client/ci/accounts/accountadjustment";
			document.getElementById("accountAdjustmentFormId").submit();
		}
	});
	
	$("#debitAccountHeadId").change(function(){
		//alert("fdfd")
		if($("#debitAccountHeadId").val() != ""){
            $.mobile.showPageLoadingMsg();
			$("#currentSelectValueId").val("loadCreditAcc");
			document.getElementById("accountAdjustmentFormId").method='POST';
			document.getElementById("accountAdjustmentFormId").action=localStorage.contextPath+"/client/ci/accounts/accountadjustment";
			document.getElementById("accountAdjustmentFormId").submit();
		}
	});
	$("#save").click(function(){
		var trxnDateArray = $("#voucherDateId").val().split("-");
		var trxnDate = new Date(trxnDateArray[2], trxnDateArray[1] - 1, trxnDateArray[0]).getTime();
		var fincialYearStartDateArray = $("#financialYearStartDateId").val().split("-");
		var fincialYearStartDate = new Date(fincialYearStartDateArray[0], fincialYearStartDateArray[1] - 1, fincialYearStartDateArray[2]).getTime();
		var fincialYearEndDateArray = $("#financialYearEndDateId").val().split("-");
		var fincialYearEndDate = new Date(fincialYearEndDateArray[0], fincialYearEndDateArray[1] - 1, fincialYearEndDateArray[2]).getTime();
		var validateEndDate = $("#validateEndDateId").val();
		$("#errorMsgForDecimalId").text("");
		$("#errorMsgForVoucherDateId").text("");
		$("#errorMsgForOfficeHierarchyId").text("");
		$("#errorMsgForOfficeId").text("");
		$("#errorMsgForDebitAccId").text("");
		$("#errorMsgForCreditAccId").text("");
		$("#errorMsgForAmountId").text("");
		$("#errorMsgForVouchernNotesId").text("");
		var mandatoryFlag = 1;
		/*if($("#voucherDateId").val() == ""){
			$("#errorMsgForVoucherDateId").text("");
			mandatoryFlag = 0;
		}*/
		if($("#officeHierarchyId").val() == ""){
			$("#errorMsgForOfficeHierarchyId").text("Please select the Office Hierarchy.");
			mandatoryFlag = 0;
		}
		if($("#officeId").val() == ""){
			$("#errorMsgForOfficeId").text("Please select the Office.");
			mandatoryFlag = 0;
		}
		if($("#debitAccountHeadId").val() == ""){
			$("#errorMsgForDebitAccId").text("Please select the Debit AccountHead.");
			mandatoryFlag = 0;
		}
		if($("#creditAccountHeadId").val() == ""){
			$("#errorMsgForCreditAccId").text("Please select the Credit AccountHead.");
			mandatoryFlag = 0;
		}
		if($("#amountId").val() == ""){
			$("#errorMsgForAmountId").text("Please select the Amount.");
			mandatoryFlag = 0;
		}
		if($("#voucherNotesId").val() == ""){
			$("#errorMsgForVouchernNotesId").text("Please select the Voucher Notes.");
			mandatoryFlag = 0;
		}
		if(mandatoryFlag == 1) {
			var isValidated = 1;
			var afterDecimalsDigits = 0;
			if($("#amountId").val().indexOf(".") != -1){
				afterDecimalsDigits = $("#amountId").val().split('.')[1].length;
			}
			
			if(afterDecimalsDigits > allowedDecimals){
				$('#errorMsgForDecimalId').text("The Amount is invalid because Only "+allowedDecimals+" digit(s) after decimal separator is allowed ");
				isValidated = 0;
			}
			
			if($("#amountId").val().split('.')[0].length > 14){
				$('#errorMsgForDecimalId').text("The Amount is invalid because the number of digits before the decimal separator exceeds the allowed number 14");
				isValidated = 0;
			}
			
			if(validateEndDate == 'true' ){
				if(trxnDate < fincialYearStartDate | trxnDate > fincialYearEndDate ) {
					$('#errorMsgForVoucherDateId').text("Transaction Date must be in the current financial year.");
					$(window).scrollTop(0);
					isValidated = 0;
				}
			}
			else{
				if(trxnDate < fincialYearStartDate) {
					$('#errorMsgForVoucherDateId').text("Transaction Date must be in the current financial year.");
					$(window).scrollTop(0);
					isValidated = 0;
				}
			}
			
			if(isValidated == 1){
                $.mobile.showPageLoadingMsg();
				document.getElementById("accountAdjustmentFormId").method='POST';
				document.getElementById("accountAdjustmentFormId").action=localStorage.contextPath+"/client/ci/accounts/doaccountadjustment";
				document.getElementById("accountAdjustmentFormId").submit();
			}
		}
	});
	
	
});