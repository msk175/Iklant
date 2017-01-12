$(document).ready(function() {
$("#ChequeNo").hide();
$("#ChequeDate").hide();
	//Temporary fix to prevent transaction for financial year close #Start Bask030
		var financialYearClosingDate = Date.parse(changeDateFormat('31/03/2015'));
		var lastTransactionDate = Date.parse(changeDateFormat($("#lastPaymentDateId").val()));
		var mindateForTransaction = $("#lastPaymentDateId").val();
		if(financialYearClosingDate >  lastTransactionDate)  {
			mindateForTransaction = "01/04/2015";
		}
	//Temporary fix to prevent transaction for financial year close #End Bask030
	$(function() {
		$( "#dOTransactionId" ).datepicker({
			minDate: mindateForTransaction,
			maxDate: new Date,
			dateFormat: 'dd/mm/yy',
			yearRange: "-90:+0",
  			changeMonth: true,
            changeYear: true,
			onClose: function ()
			{	
				//$('#sourceOfPayId').attr("disabled", false); 
				$('#sopiddd').show();
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
            changeYear: true,
			onClose: function ()
			{	
				$('#sopiddd').show();				
			}
		});
	  });
	 $("#chequeNoId").keyup(function(){
		var val = $(this).val();
		if(isNaN(val)){
			 val = val.replace(/[^0-9\.]/g,'');
			 if(val.split('.').length>2) 
				 val =val.replace(/\.+$/,"");
		}
		val = noSpace(val);
		$("#chequeNoId").val(val);
	});
	function noSpace(val) { 
		val = val.replace(/(^\s*)|(\s*$)/gi,"");
		val = val.replace(/[ ]{2,}/gi," "); 
		val = val.replace(/\n /,"\n"); 
		return val;
	}
	$("#dOTransactionId").click(function(){
		//$('#sourceOfPayId').attr("disabled", true); 
		$('#sopiddd').hide();
	});

	$("#chequeDateId").click(function(){
		//$('#sourceOfPayId').attr("disabled", true); 
		$('#sopiddd').hide();
	});


	
	$('#dOTransactionId').change(function () {
        $.mobile.showPageLoadingMsg();
		document.getElementById("preclosureForm").method='POST';
		document.getElementById("preclosureForm").action=localStorage.contextPath+"/client/ci/loanrecovery/preclosure/retrievePreclosureInformation";
		document.getElementById("preclosureForm").submit();	
	});
	
	if($("#waiverInterest").val() == 'false'){
		$("#waivercheck").hide();
	}else {
		if($("#checkId").val() == 'true'){
			$('#waiveInterestCheckboxId').attr("checked", "true").checkboxradio('refresh');
		}
		else{
			$("#waiveInterestCheckboxId").removeAttr("checked");
		}
	}
});
function sourceOfPayment(selectedValue){
	value = $(selectedValue).val();
	var cashOrBankArray = $("#cashOrBank").val().split(',');
	var glCodeArray = $("#sopid").val().split(',');
	for(var i=0;i<glCodeArray.length;i++){
		if(glCodeArray[i] == value) {
			if(cashOrBankArray[i] == 'Cash'){
				$("#ChequeNo").hide();
				$("#ChequeDate").hide();
				$("#paymentTypeId").val(1);
				$("#voucherNumberDiv").show();
				$("#voucherNumberValueId").text($("#voucherNumberIfCashId").val());
				$("#voucherNumberId").val($("#voucherNumberIfCashId").val());
			}
			else{
				$("#ChequeNo").show();
				$("#ChequeDate").show();
				$("#paymentTypeId").val(3);
				$("#voucherNumberDiv").show();
				$("#voucherNumberValueId").text($("#voucherNumberIfBankId").val());
				$("#voucherNumberId").val($("#voucherNumberIfBankId").val());
			}
		}
	}
	if(value == 0){
		$("#voucherNumberDiv").hide();
		$("#ChequeNo").hide();
		$("#ChequeDate").hide();
		$("#voucherNumberId").val("");
	}
}
function submitPreclosure(){
	/*var selectedDate 	= new Date(convertDateFormat($("#dOTransactionId").val()));
	var lastClosedDate 	= new Date($("#lastDateClosedId").val());
	if(lastClosedDate  >= selectedDate){
		var errorLabelMember = "DayBook is already closed for selected Date.";
		document.getElementById("errorLabel").innerText = errorLabelMember;
		$(window).scrollTop(0);
	}
	else */
    $("#submit").hide();
	if($("#paymentTypeId").val() == 3 && ( $("#chequeNoId").val().length < 6 | $("#chequeNoId").val().length > 8))  {
		var errorLabelMember = "Cheque Number should be 6 or 7 digits";
		document.getElementById("errorLabel").innerText = errorLabelMember;
		$(window).scrollTop(0);
        $("#submit").show();
	}else if($("#sourceOfPayId").val() == 0){
        var errorLabelMember = "Please select Source Of Payment";
        document.getElementById("errorLabel").innerText = errorLabelMember;
        $(window).scrollTop(0);
        $("#submit").show();
    }
	else if($("#paymentTypeId").val() == 3 && $("#chequeDateId").val() == ''){
		var errorLabelMember = "Please Select Cheque Date";
		document.getElementById("errorLabel").innerText = errorLabelMember;
		$(window).scrollTop(0);
        $("#submit").show();
	}

	else if($("#amountId").val() == 0){
		var errorLabelMember = "Amount Cannot Be Zero";
		document.getElementById("errorLabel").innerText = errorLabelMember;
		$(window).scrollTop(0);
        $("#submit").show();
	}
	else{
        $(window).scrollTop(0);
        document.getElementById("errorLabel").innerText = "";
        $("#preclosureConfirmationId").popup("open");
        $("#submit").show();
    }
    $('#noClosureId').click(function() {
        $("#submit").show();
        $("#preclosureConfirmationId" ).popup( "close" );
    });
    $('#yesClosureId').click(function() {
        var data ={};
        data.globalAccNumber = $("#globalAccNumber").val();
        data.accountId			 = $("#accountId").val();
        data.amount    = $("#amountId").val();
        data.dOTransaction = $("#dOTransactionId").val();
        data.paymentType = $("#paymentTypeId").val();
        data.chequeNumber = $("#chequeNoId").val();
        data.chequeDateName = $("#chequeDateId").val();
        data.sourceOfPay = $("#sourceOfPayId").val();
        data.waivedrepaymentamount = $("#waivedrepaymentamountid").val();
        data.earlyRepaymentMoney = $("#earlyRepaymentMoneyid").val();
        data.waiveInterestCheckboxId = $("#waiveInterestCheckboxId").is(':checked');
        data.voucherNumber = $("#voucherNumberId").val();
        ajaxVariable = $.ajax({
            beforeSend : function() {
                $.mobile.showPageLoadingMsg();
            },
            complete: function() {
                $.mobile.hidePageLoadingMsg()
            },
            type: 'POST',
            data: JSON.stringify(data),
            contentType: 'application/json',
            url: 'http://'+ajaxcallip+localStorage.contextPath+'/client/ci/loanrecovery/preclosure/submitPreclosureInformation',
            success: function(data) {
                //$("#revertId").hide();
                //$("#labelRevertID").text("Reverted");
                if(data.status == "success"){
                    var errorLabelMember = "Loan Preclosed Success";
                    //document.getElementById("errorLabel").innerText = errorLabelMember;
                    document.getElementById("errorLabel").innerText = "Loan Preclosed Success";
                    $(window).scrollTop(0);
                    showLoanAccounts();
                }
                else if(data.status == "failure"){
                    //var errorLabelMember = "Day book already closed for selected date,so not able to make payment";
                    var errorLabelMember = "Loan Preclosed Failure"; //data.error
                    //document.getElementById("errorLabel").innerText = errorLabelMember;
                    document.getElementById("errorLabel").innerText = "Loan Preclosed Failure";
                    $(window).scrollTop(0);
                    $("#submit").show();
                }
                else{
                    showPageExpired();
                }
            },
            error : function(jqXHR, textStatus, error) {
            }
        });
        /*document.getElementById("errorLabel").innerText = "";
         document.getElementById("preclosureForm").method='POST';
         document.getElementById("preclosureForm").action=localStorage.contextPath+"/client/ci/loanrecovery/preclosure/submitPreclosureInformation";
         document.getElementById("preclosureForm").submit();	*/
    });
}
function backFormSubmission(globalAccountNum) {
    $.mobile.showPageLoadingMsg();
	document.getElementById("preclosureForm").method='POST';
	document.getElementById("preclosureForm").action=localStorage.contextPath+"/client/ci/applyPaymentForFO";
	document.getElementById("preclosureForm").submit();
}
function showLoanAccounts(){
    $.mobile.showPageLoadingMsg();
	var globalCustomerNum;
	document.getElementById("errorLabel").innerText = "";
	document.getElementById("preclosureForm").method='POST';
	document.getElementById("preclosureForm").action=localStorage.contextPath+"/client/ci/loanrecovery/groups/"+globalCustomerNum+"/loanaccounts";
	document.getElementById("preclosureForm").submit();
}
function showPageExpired(){
    $.mobile.showPageLoadingMsg();
	document.getElementById("preclosureForm").method='POST';
	document.getElementById("preclosureForm").action=localStorage.contextPath+"/client/ci/showErrorPage";
	document.getElementById("preclosureForm").submit();
}
function convertDateFormat(date) {
	var dateInArray = date.split("/");
	return dateInArray[2]+"-"+dateInArray[1]+"-"+dateInArray[0];
}
function changeDateFormat(date) {
    var dateInArray = date.split("/");
    return dateInArray[2]+"-"+dateInArray[1]+"-"+dateInArray[0];
}
