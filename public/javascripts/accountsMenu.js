$(document).ready(function() { // For select transaction date @ Paramasivan
    var endDate = new Date();
    /*var dd = endDate.getDate();
    var mm = endDate.getMonth()+1;
    var yy = endDate.getFullYear();

    var dateStr = dd+'/'+mm+'/'+yy;
    if($("#transactionMaxDateId").val() > dateStr){
        var endDate = new Date;
    }
    else{
        var endDate = $("#transactionMaxDateId").val();
    }*/
    $(function() {
        $("#transactionDateId" ).datepicker({
            minDate: $("#financialYearStartDateId").val(),
            maxDate: endDate,
            dateFormat: 'dd/mm/yy',
            yearRange: "-90:+0",
            changeMonth: true,
            changeYear: true,
            onClose: function ()
            {
                $('#fromOfficeHierarchyDivId').show();
                $('#toOfficeHierarchyDivId').show();
            }
        });
    });
});

function expensesTrackingFormSubmission(){
    $.mobile.showPageLoadingMsg();
	document.getElementById("accountsMenuFormID").method='POST';
	document.getElementById("accountsMenuFormID").action=localStorage.contextPath+"/client/ci/accounts/expensetrackingload";
	document.getElementById("accountsMenuFormID").submit();

}

function accountAdjustmentFormSubmission(){
    $.mobile.showPageLoadingMsg();
	document.getElementById("accountsMenuFormID").method='POST';
	document.getElementById("accountsMenuFormID").action=localStorage.contextPath+"/client/ci/accounts/accountadjustmentload";
	document.getElementById("accountsMenuFormID").submit();

}
function cashPaymentVoucherFormSubmission(){
    $.mobile.showPageLoadingMsg();
	document.getElementById("accountsMenuFormID").method='POST';
	document.getElementById("accountsMenuFormID").action=localStorage.contextPath+"/client/ci/accounts/cashPaymentVoucherLoad/1/1";
	document.getElementById("accountsMenuFormID").submit();
}

function showBankPaymentForm(){
    $.mobile.showPageLoadingMsg();
	document.getElementById("accountsMenuFormID").method='POST';
	document.getElementById("accountsMenuFormID").action=localStorage.contextPath+"/accounts/contraBankPaymentForm";
	document.getElementById("accountsMenuFormID").submit();
} 
function showCashDepositForm(){
    $.mobile.showPageLoadingMsg();
	document.getElementById("accountsMenuFormID").method='POST';
	document.getElementById("accountsMenuFormID").action=localStorage.contextPath+"/accounts/cashDepositForm";
	document.getElementById("accountsMenuFormID").submit();
}
function showFundTransferForm(){
    $.mobile.showPageLoadingMsg();
	document.getElementById("accountsMenuFormID").method='POST';
	document.getElementById("accountsMenuFormID").action=localStorage.contextPath+"/accounts/fundTransferForm";
	document.getElementById("accountsMenuFormID").submit();
}
function showCashTransferForm(){
    $.mobile.showPageLoadingMsg();
	document.getElementById("accountsMenuFormID").method='POST';
	document.getElementById("accountsMenuFormID").action=localStorage.contextPath+"/accounts/cashTransferForm";
	document.getElementById("accountsMenuFormID").submit();
}
function showCashPaymentForm(){
    $.mobile.showPageLoadingMsg();
	document.getElementById("accountsMenuFormID").method='POST';
	document.getElementById("accountsMenuFormID").action=localStorage.contextPath+"/accounts/cashPaymentForm";
	document.getElementById("accountsMenuFormID").submit();
}
function showCashReceiptForm(){
    $.mobile.showPageLoadingMsg();
	document.getElementById("accountsMenuFormID").method='POST';
	document.getElementById("accountsMenuFormID").action=localStorage.contextPath+"/accounts/cashReceiptForm";
	document.getElementById("accountsMenuFormID").submit();
}
function showBankPaymentExpensesForm(){
    $.mobile.showPageLoadingMsg();
	document.getElementById("accountsMenuFormID").method='POST';
	document.getElementById("accountsMenuFormID").action=localStorage.contextPath+"/accounts/bankPaymentForm";
	document.getElementById("accountsMenuFormID").submit();
}
function showBankReceiptExpensesForm(){
    $.mobile.showPageLoadingMsg();
	document.getElementById("accountsMenuFormID").method='POST';
	document.getElementById("accountsMenuFormID").action=localStorage.contextPath+"/accounts/bankReceiptForm";
	document.getElementById("accountsMenuFormID").submit();
}
function showPageExpired(){
    $.mobile.showPageLoadingMsg();
	document.getElementById("accountsMenuFormID").method='POST';
	document.getElementById("accountsMenuFormID").action=localStorage.contextPath+"/client/ci/showErrorPage";
	document.getElementById("accountsMenuFormID").submit();
}
function journalTransactionFormSubmission(){
    $.mobile.showPageLoadingMsg();
	document.getElementById("accountsMenuFormID").method='POST';
	document.getElementById("accountsMenuFormID").action=localStorage.contextPath+"/accounts/journalTransaction";
	document.getElementById("accountsMenuFormID").submit();

}
// Added by SathishKumar M
function showtransactionHistoryForm(){
    $.mobile.showPageLoadingMsg();
    document.getElementById("accountsMenuFormID").method='GET';
    document.getElementById("accountsMenuFormID").action=localStorage.contextPath+"/accounts/transactionHistory";
    document.getElementById("accountsMenuFormID").submit();

}
//Ended by SathishKumar M

// Added by Chitra S
function showBankReconciliation(){
    $.mobile.showPageLoadingMsg();
    document.getElementById("accountsMenuFormID").method='POST';
    document.getElementById("accountsMenuFormID").action=localStorage.contextPath+"/accounts/bankReconciliation";
    document.getElementById("accountsMenuFormID").submit();
}
//Ended by Chitra S

function showFundManagementScreen(){
    $.mobile.showPageLoadingMsg();
    document.getElementById("accountsMenuFormID").method='POST';
    document.getElementById("accountsMenuFormID").action=localStorage.contextPath+"/accounting/fund/load";
    document.getElementById("accountsMenuFormID").submit();
}

// Added by Chitra S
function backButtonFunction(){
    $.mobile.showPageLoadingMsg();
    if($('#transactionMasterId').val() != ""){
        document.getElementById("accountsMenuFormID").method='POST';
        document.getElementById("accountsMenuFormID").action=localStorage.contextPath+"/accounts/showVoucherPaymentForBackOption";
        document.getElementById("accountsMenuFormID").submit();
    } else{
        document.getElementById("accountsMenuFormID").method='GET';
        document.getElementById("accountsMenuFormID").action=localStorage.contextPath+"/client/ci/accounts/accountsMenu";
        document.getElementById("accountsMenuFormID").submit();
    }
}
//Ended by Chitra S


function showTrailBalanceWithLedger(){
    $.mobile.showPageLoadingMsg();
    document.getElementById("accountsMenuFormID").method='POST';
    document.getElementById("accountsMenuFormID").action=localStorage.contextPath+"/client/ci/accounts/ledgerViewLoad";
    document.getElementById("accountsMenuFormID").submit();
}

function updateAccountingTransactions(){
    var allowedDecimals = parseInt($("#allowedDecimalsId").val(),10);
    var afterDecimalsDigits = 0;
    if($("#transactionamountId").val().indexOf(".") != -1){
        afterDecimalsDigits = $("#transactionamountId").val().split('.')[1].length;
    }
    $("#successMsg").text("");
    $("#errorMsg").text("");
    if($("#fromOfficeHierarchyId").val() == ""){
        $("#errorMsg").text("Please select the Office Hierarchy.");
        $(window).scrollTop(0);
    }else if($("#fromOfficeId").val() == ""){
        $("#errorMsg").text("Please select from Office.");
        $(window).scrollTop(0);
    }else if($("#fromAccountId").val() == ""){
        $("#errorMsg").text("Please select Main Account.");
        $(window).scrollTop(0);
    }else if($("#toOfficeHierarchyId").val() == ""){
        $("#errorMsg").text("Please select To Office Hierarchy.");
        $(window).scrollTop(0);
    }else if($("#toOfficeId").val() == ""){
        $("#errorMsg").text("Please select ToOffice.");
        $(window).scrollTop(0);
    }else if($("#toAccountId").val() == ""){
        $("#errorMsg").text("Please select Account Head.");
        $(window).scrollTop(0);
    }else if($("#transactionDateId").val() == ""){
        $("#errorMsg").text("Please select Transaction Date.");
        $(window).scrollTop(0);
    }else if($("#transactionamountId").val() == ""){
        $("#errorMsg").text("Please Enter Transaction Amount.");
        $(window).scrollTop(0);
    }else if(($("#transactionamountId").val()).indexOf(".") != -1){
        $("#errorMsg").text("Please Enter Transaction Amount without decimal");
        $(window).scrollTop(0);
    }/*else if($("#transactionamountId").val() == ""){
        $("#errorMsg").text("Please Enter Transaction Amount Greater than zero.");
        $(window).scrollTop(0);
    }*/else if(afterDecimalsDigits > allowedDecimals){//Modified By Sathish Kumar M 008
        $('#errorMsg').text("The Amount is invalid because Only "+allowedDecimals+" digit(s) after decimal separator is allowed ");
    }else if($("#transactionamountId").val().split('.')[0].length > 14){
        $('#errorMsg').text("The Amount is invalid because the number of digits before the decimal separator exceeds the allowed number 14");
        $(window).scrollTop(0);
    }else if(($("#chequeNoId").val() != undefined) && ($("#chequeNoId").val() != "") && ($("#chequeNoId").val().length < 6 | $("#chequeNoId").val().length > 8)){
        var errorLabelMember = "Cheque Number should be 6 or 7 digits";
        $("#errorMsg").text(errorLabelMember);
        $(window).scrollTop(0);
    }else if(($("#transactionNotesId").val()).trim() == ""){
        $("#errorMsg").text("Please Enter Transaction Notes.");
        $(window).scrollTop(0);
    }else{
        $.mobile.showPageLoadingMsg();
        $("#errorMsg").text("");
        $("#successMsg").text("");
        // Modified by chitra
        $('#fromofficeHierarchy').val($("#fromOfficeHierarchyId").val());
        $('#toofficeHierarchy').val($("#toOfficeHierarchyId").val());
        $('#toOfficeValue').val($("#toOfficeId").val());
        $('#fromOfficeValue').val($("#fromOfficeId").val());
        document.getElementById("accountsMenuFormID").method='POST';
        document.getElementById("accountsMenuFormID").action=localStorage.contextPath+"/accounts/updateAccountingTransactions";
        document.getElementById("accountsMenuFormID").submit().refresh;
    }
}

function numeric(currentVal){
	//currentVal.value = currentVal.value.replace( /[^0-9]+/g, '');
	var regex = /[^0-9]+/g;
    if(regex.test(currentVal.value)) {
        currentVal.value = currentVal.value.replace(regex, '')  
    }
}
function trimNumber(s) {
  while (s.substr(0,1) == '0' && s.length>1) { s = s.substr(1,9999); }
  return s;
}
function noSpace(val) { 
	val = val.replace(/(^\s*)|(\s*$)/gi,"");
	val = val.replace(/[ ]{2,}/gi," "); 
	val = val.replace(/\n /,"\n"); 
	return val;
}
