$(document).ready(function() {
    var minDateValue = $("#fromDateValue").val();
    $( ".fromDate" ).datepicker({
        minDate: minDateValue,
        maxDate: new Date(),
        dateFormat: 'yy-mm-dd',
        changeMonth: true,
        changeYear: true
    });
    var startdate = new Date(minDateValue);
    var enddate = new Date();
    if(!(startdate <= enddate && startdate != 'Invalid Date' && enddate != 'Invalid Date')){
        $('.fromDate').datepicker().datepicker('disable');
    }
    $('#fixedHeader_detailedsummary').dataTable( {
        "scrollY": 400,
        "scrollX": true,
        "bPaginate": false,
        "bSort": false,
        "bFilter": false,
        "bInfo": false
    });
    $("#ledgerNameBR").val($("#listledger option:selected").text());

    if($("#currentDateLabel").text() == ""){
        $("#bankReconciliationFooter").hide();
    }else{
        $("#bankReconciliationFooter").show();
    }

    if($("#selectedDocName").val() == ""){
        $("#downloadDiv").hide();
    }else{
        $("#generateButtonDiv").hide();
    }

    var date=new Date();
    var day=date.getDate();
    month=date.getMonth();
    month=month+1;
    if((String(day)).length==1)
        day='0'+day;
    if((String(month)).length==1)
        month='0'+month;
    dateValue=day+ '-' + month + '-' + date.getFullYear();
    $('#currentDateLabel').text("Reconciliation Date: "+dateValue);

});

function generateBankReconciliation(form_id) {
    document.getElementById(form_id).method='POST';
    document.getElementById(form_id).action=localStorage.contextPath+'/accounts/bankReconciliation';
    document.getElementById(form_id).submit();
}

function generateBankReconciliationReport(form_id) {
    document.getElementById(form_id).method='POST';
    document.getElementById(form_id).action=localStorage.contextPath+'/accounts/bankReconciliationReport';
    document.getElementById(form_id).submit();
}
function saveLedgerName(transactionDate,chequeDate,debitAmt,creditAmt,reconciliationDate,index){
    var debitTotal = $("#totalDebit").val();
    var creditTotal = $("#totalCredit").val();
    var closingBal = $("#closingBalValue").val();    // as per company books have to take closing bal for the current page
    var reconciliationDateAltered =  $("#reconciliationDateAltered-"+index).val();
    $("#ledgerNameBR").val($("#listledger option:selected").text());
    if(reconciliationDateAltered == "" || reconciliationDate.value == ""){
        if(reconciliationDate.value != ""){
            $("#reconciliationDateAltered-"+index).val(true);
            if(debitAmt == 0){
                creditTotal = parseInt(creditTotal) - parseInt(creditAmt) ;
                $("#totalCredit").val(creditTotal);
            }else{
                debitTotal = parseInt(debitTotal) - parseInt(debitAmt) ;
                $("#totalDebit").val(debitTotal);
            }
        }else{
            $("#reconciliationDateAltered-"+index).val("");
            if(debitAmt != 0){
                debitTotal = parseInt(debitTotal) + parseInt(debitAmt) ;
                $("#totalDebit").val(debitTotal);
            }else{
                creditTotal = parseInt(creditTotal) + parseInt(creditAmt) ;
                $("#totalCredit").val(creditTotal);
            }
        }
        closingBal = parseInt(closingBal) + parseInt(debitTotal) - parseInt(creditTotal);
        $('#debitLabel').text(debitTotal);
        $('#creditLabel').text(creditTotal);
        $('#closingBalLabel').text(closingBal);
    }
}

function checkDateValidation(transactionDate,chequeDate,reconciliationDate){
    var maxValue;
    if(chequeDate != "" && chequeDate != null){
        maxValue = addDays(90,chequeDate);
    }else{
        maxValue = addDays(90,transactionDate);
    }
    if(reconciliationDate.value != null && reconciliationDate.value != "" && (new Date(reconciliationDate.value) > maxValue) ){
        $("#dateValidationFlag").val("true");
        $("#errorField").text("Reconciliation Date exceed 90 days");
        return "Failure";
    }else{
        $("#dateValidationFlag").val("false");
        $("#errorField").text("");
        return "Success";
    }
}

function addDays(days,date_value) {
    var thisDate = new Date(date_value);
    thisDate.setDate(thisDate.getDate() + days);
    return thisDate;
}

function saveBankReconciliation(form_id){
    var bankReconciliationStmtLength = $("#brsLength").val();
    var result = false;
    for(var i=0;i<bankReconciliationStmtLength;i++){
       if($("#reconciliationDateAltered-"+i).val() != ""){
           result = true;
           break;
       }
    }
    if(result){
        for(var i=0;i<bankReconciliationStmtLength;i++){
            $("#reconciliationDateAltered-"+i).remove();
        }
        document.getElementById(form_id).method='POST';
        document.getElementById(form_id).action=localStorage.contextPath+'/accounts/saveBankReconciliation';
        document.getElementById(form_id).submit();
    }else{
        $("#errorMsg").text("Please select atleast one bank date for Submit");
    }
}

function downloadReport(form_id){
    document.getElementById(form_id).method='POST';
    document.getElementById(form_id).action=localStorage.contextPath+'/client/ci/downloadDocs';
    document.getElementById(form_id).submit();
    $("#downloadDiv").hide();
    $("#generateButtonDiv").show();
}
