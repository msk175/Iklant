$(document).ready(function() {
    $(function() {
        $("#fromDateLedger").datepicker({
            minDate: $("#minFinYear").val(),
            maxDate: new Date,
            dateFormat: 'yy-mm-dd',
            yearRange: "-90:+0",
            changeMonth: true,
            changeYear: true
        });
        $("#toDateLedger").datepicker({
            minDate: $("#minFinYear").val(),
            maxDate: new Date,
            dateFormat: 'yy-mm-dd',
            yearRange: "-90:+0",
            changeMonth: true,
            changeYear: true
        });
        $('#fixedHeader_detailedsummary').dataTable( {
            "scrollY": 350,
            "scrollX": true,
            "bPaginate": false,
            "bSort": false,
            "bFilter": false,
            "bInfo": false
        } );
        $('#fixedLedger_detailedsummary').dataTable( {
            "scrollY": 450,
            "scrollX": true,
            "bPaginate": false,
            "bSort": false,
            "bFilter": false,
            "bInfo": false
        } );
        $('#debitCreditTotal').text("Total Debit : "+$('#totalDebit').val()+" and Total Credit : "+$('#totalCredit').val());
    });

    if($('#roleId').val() != smhRoleId && $('#roleId').val() != amhRoleId) {
        $('#officeId').selectmenu('disable');
    }
});


function fundValidation(){
    var fundCodeValue = $('#fundCodeValue').val();
    var newFundName = ($('#newFundName').val()).trim();
    if(fundCodeValue == ""){
        $('#errorMsg').text('Please select Fund Code');
        return false;
    }else if(newFundName == ""){
        $('#errorMsg').text('Please Give Fund Name');
        return false;
    }
    return true;
}

function showTrailBalanceWithLedger(){
    $.mobile.showPageLoadingMsg();
    document.getElementById("ledgerViewFormID").method='POST';
    document.getElementById("ledgerViewFormID").action=localStorage.contextPath+"/client/ci/accounts/ledgerViewLoad";
    document.getElementById("ledgerViewFormID").submit();
}

function generateTrailBalanceWithLedger(){
    $("#errorMsg").text("");
    var startDate =new Date(($("#fromDateLedger").val()));
    var endDate =new Date(($("#toDateLedger").val()));
    if(startDate == "" || startDate == 'Invalid Date' || endDate == "" || endDate == 'Invalid Date'){
        $("#errorMsg").text("Please Select Valid Date");
    }else if(document.getElementById('mfiOperation').checked == false && document.getElementById('accOperation').checked == false){
        $("#errorMsg").text("Please check any one Accounting Trxns or MFI Trxns");
    }else if(startDate <= endDate){
        $.mobile.showPageLoadingMsg();
        $("#mfiOperation").val("");
        $("#accOperation").val("");
        if(document.getElementById('mfiOperation').checked == true){
            $("#mfiOperation").val("on");
        }
        if(document.getElementById('accOperation').checked == true){
            $("#accOperation").val("on");
        }
        document.getElementById("ledgerViewFormID").method='POST';
        document.getElementById("ledgerViewFormID").action=localStorage.contextPath+"/client/ci/accounts/viewTrailBalanceLedger";
        document.getElementById("ledgerViewFormID").submit();
    }else{
        $("#errorMsg").text("End Date Should Be Greater Than Or Equal To From Date");
    }
}

function generateTransactionsByLedger(glcode,ledgerName){
    $.mobile.showPageLoadingMsg();
    $("#ledgerName").val(ledgerName);
    document.getElementById("ledgerViewFormID").method='POST';
    document.getElementById("ledgerViewFormID").action=localStorage.contextPath+"/client/ci/accounts/generateLedgerTransactionsByGLCode/"+glcode;
    document.getElementById("ledgerViewFormID").submit();
}

function backButtonGenerateTransactionsByLedger(){
    $.mobile.showPageLoadingMsg();
    document.getElementById("ledgerViewFormID").method='POST';
    document.getElementById("ledgerViewFormID").action=localStorage.contextPath+"/client/ci/accounts/viewTrailBalanceLedger";
    document.getElementById("ledgerViewFormID").submit();
}