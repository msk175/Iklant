$(document).ready(function() {
	var allowedDecimals = parseInt($("#allowedDecimalsId").val(),10);
	$(function() {
		$( "#transactionDateId" ).datepicker({
			
			maxDate: new Date,
			dateFormat: 'dd/mm/yy',
			yearRange: "-90:+0",
  			changeMonth: true,
            changeYear: true,
			onClose: function ()
			{	
				$('#officeHierarchyDivId').show();
				$('#transactionTypeDivId').show();
				$('#accountHeadDivId').show();
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
            changeYear: true,
			onClose: function ()
			{	
				$('#officeDivId').show();
				$('#mainAccountDivId').show();
				// The "this" keyword refers to the input (in this case: #someinput)
				//this.focus();
			}
        });
	});
	$(function() {
		$("#officeHierarchyId").val($('#selectedOfficeHierarchyId').val()).selectmenu("refresh");
		$("#transactionTypeId").val($('#selectedTransactionTypeId').val()).selectmenu("refresh");
		if($('#selectedTransactionTypeId').val() == "BR" | $('#selectedTransactionTypeId').val() == "BP"){
			$("#chequeDetailId").show();
		}
		else{
			$("#chequeDetailId").hide();
		}
		
		//$("#officeHierarchyId option[value="+$('#selectedOfficeHierarchyId').val()+"]").attr('selected', true);
	});
	
	$('#transactionDateId').click(function () {
		//alert('clicked');
		$('#officeHierarchyDivId').hide();
		$('#transactionTypeDivId').hide();
		$('#accountHeadDivId').hide();
	});
	$('#chequeDateId').click(function () {
		//alert('clicked');
		$('#officeDivId').hide();
		$('#mainAccountDivId').hide();
	});
	
	$("#officeHierarchyId").change(function(){
		//alert("fdfd")
        $.mobile.showPageLoadingMsg();
		$("#currentSelectValueId").val("loadOffices");
		document.getElementById("expensesTrackingFormId").method='POST';
		document.getElementById("expensesTrackingFormId").action=localStorage.contextPath+"/client/ci/accounts/expensetracking";
		document.getElementById("expensesTrackingFormId").submit();
	});
	
	$("#transactionTypeId").change(function(){
		//alert("fdfd")
        $.mobile.showPageLoadingMsg();
		$("#currentSelectValueId").val("loadMainAcc");
		document.getElementById("expensesTrackingFormId").method='POST';
		document.getElementById("expensesTrackingFormId").action=localStorage.contextPath+"/client/ci/accounts/expensetracking";
		document.getElementById("expensesTrackingFormId").submit();
	});
	
	$("#mainAccountId").change(function(){
		//alert("fdfd")
        $.mobile.showPageLoadingMsg();
		$("#currentSelectValueId").val("loadAccHead");
		document.getElementById("expensesTrackingFormId").method='POST';
		document.getElementById("expensesTrackingFormId").action=localStorage.contextPath+"/client/ci/accounts/expensetracking";
		document.getElementById("expensesTrackingFormId").submit();
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
	
	$("#save").click(function(){

		var trxnDateArray = $("#transactionDateId").val().split("-");
		var trxnDate = new Date(trxnDateArray[2], trxnDateArray[1] - 1, trxnDateArray[0]).getTime();
		var fincialYearStartDateArray = $("#financialYearStartDateId").val().split("-");
		var fincialYearStartDate = new Date(fincialYearStartDateArray[0], fincialYearStartDateArray[1] - 1, fincialYearStartDateArray[2]).getTime();
		var fincialYearEndDateArray = $("#financialYearEndDateId").val().split("-");
		var fincialYearEndDate = new Date(fincialYearEndDateArray[0], fincialYearEndDateArray[1] - 1, fincialYearEndDateArray[2]).getTime();
		
		var validateEndDate = $("#validateEndDateId").val();
		$('#errorMsgForDecimalId').text("");
		$("#errorMsgForTransactionDateId").text("");
		$("#errorMsgForOfficeHierarchyId").text("");
		$("#errorMsgForOfficeId").text("");
		$("#errorMsgForTransactionTypeId").text("");
		$("#errorMsgForMainAccountId").text("");
		$("#errorMsgForAccountHeadId").text("");
		$("#errorMsgForAmountId").text("");
		$("#errorMsgForChequeNoId").text("");
		$("#errorMsgForChequeDateId").text("");
		$("#errorMsgForBranchNameId").text("");
		$("#errorMsgForBankBranchId").text("");
		$("#errorMsgForTransactionNotesId").text("");
		var mandatoryFlag = 1;
		/*if($("#transactionDateId").val() == ""){
			$("#errorMsgForTransactionDateId").text("");
			mandatoryFlag = 0;
			$(window).scrollTop(0);
		}*/
		if($("#officeHierarchyId").val() == ""){
			$("#errorMsgForOfficeHierarchyId").text("Please select the Office Hierarchy.");
			mandatoryFlag = 0;
			$(window).scrollTop(0);
		}
		if($("#officeId").val() == ""){
			$("#errorMsgForOfficeId").text("Please select the Office.");
			mandatoryFlag = 0;
			$(window).scrollTop(0);
		}
		if($("#transactionTypeId").val() == ""){
			$("#errorMsgForTransactionTypeId").text("Please select the Transaction Type.");
			mandatoryFlag = 0;
			$(window).scrollTop(0);
		}
		if($("#mainAccountId").val() == ""){
			$("#errorMsgForMainAccountId").text("Please select the MainAccount.");
			mandatoryFlag = 0;
			$(window).scrollTop(0);
		}
		if($("#accountHeadId").val() == ""){
			$("#errorMsgForAccountHeadId").text("Please select the AccountHead.");
			mandatoryFlag = 0;
			$(window).scrollTop(0);
		}
		if($("#amountId").val() == ""){
			$("#errorMsgForAmountId").text("Please enter the Amount.");
			mandatoryFlag = 0;
			$(window).scrollTop(0);
		}
		if($("#transactionNotesId").val() == ""){
			$("#errorMsgForTransactionNotesId").text("Please select the Transaction Notes.");
			mandatoryFlag = 0;
			$(window).scrollTop(0);
		}
		if(mandatoryFlag == 1) {
			var isValidated = 1;
			var afterDecimalsDigits = 0;
			if($("#amountId").val().indexOf(".") != -1){
				afterDecimalsDigits = $("#amountId").val().split('.')[1].length;
				//alert($("#amountId").val().split('.')[0].length);
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
					$('#errorMsgForTransactionDateId').text("Transaction Date must be in the current financial year.");
					$(window).scrollTop(0);
					isValidated = 0;
				}
			}
			else{
				if(trxnDate < fincialYearStartDate) {
					$('#errorMsgForTransactionDateId').text("Transaction Date must be in the current financial year.");
					$(window).scrollTop(0);
					isValidated = 0;
				}
			}
			
			if(isValidated == 1){
                $.mobile.showPageLoadingMsg();
				document.getElementById("expensesTrackingFormId").method='POST';
				document.getElementById("expensesTrackingFormId").action=localStorage.contextPath+"/client/ci/accounts/doexpensetracking";
				document.getElementById("expensesTrackingFormId").submit();
			}
		}
		
	});
	
});