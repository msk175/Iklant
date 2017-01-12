$("#pageID").live('pagecreate',function() {
    var length = $('#clientLengthId').val();
    $(function(){
        for(var i=0; i<length; i++){
            $("#lastPaymentId"+i).datepicker({
                minDate: new Date('2015-04-01'),
                maxDate: new Date,
                dateFormat: 'dd/mm/yy',
                yearRange: "-1:+0",
                changeMonth: true,
                changeYear: true
            });
        }
    });
});


function showLoansList(globalAccountNum){
    $.mobile.showPageLoadingMsg();
	$('#groupAccNum').val(globalAccountNum);
	document.getElementById("loanListFormID").method='POST';
	document.getElementById("loanListFormID").action="/mfi/api/1.0/client/ci/groups/"+globalAccountNum+"/retrieveRescheduledLoanAccounts";
	document.getElementById("loanListFormID").submit();
}

function editedClientAmount(i){
    var firstClientAmt = parseInt($("#paidAmountId"+0).val());
    var otherClientAmt = parseInt($("#paidAmountId"+i).val());
    //alert(otherClientAmt);
  /*  if(firstClientAmt > 0 && i == 0){
        for(var i=0;i<$("#clientLengthId").val();i++){
            $("#paidAmountId"+i).val(firstClientAmt);
        }
        $("#errorLabel").text('');
    }
    else if(firstClientAmt > 0 && otherClientAmt > 0){
        $("#errorLabel").text('');
    }*/
   if(otherClientAmt<= 0){
        $(window).scrollTop(0);
        $("#errorLabel").text('Loan Amount must be greater than 0');
    }else{
        $(window).scrollTop(0);
        $("#errorLabel").text('Loan Amount must be greater than 0');
    }
}

/*function editedClientPaymentDate(i){
    var firstClientPaymentDate = $("#lastPaymentId"+0).val();
    //var otherClientAmt = $("#lastPaymentId"+i).val();
    if(firstClientPaymentDate != ''){
        for(var i=0;i<$("#clientLengthId").val();i++){
            $("#lastPaymentId"+i).val(firstClientPaymentDate);
        }
        $("#errorLabel").text('');
    }
}*/


function numeric(currentVal){
    var regex = /[^0-9]+/g;
    if(regex.test(currentVal.value)) {
        currentVal.value = currentVal.value.replace(regex, '')
    }
}

function submitForm(){
    var submitFlag = 1;
    for(var i=0;i<$("#clientLengthId").val();i++){
        if($("#paidAmountId"+i).val() == ""){
            submitFlag = 0;
            $("#errorLabel").text("Amount cannot be empty")
        }
    }
    if(submitFlag == 1){
        var clientGlobalNumArray = new Array();
        var lastPaymentArray = new Array();
        var paidAmountArray = new Array();
        var currentBalanceArray = new Array();
        var overdueAmountArray = new Array();
        var daysInArrearsArray = new Array();
        var loanStatusArray = new Array();




        for(var i=0;i<$("#clientLengthId").val();i++){
            clientGlobalNumArray.push($("#clientGlobalNumId"+i).val());
            lastPaymentArray.push($("#lastPaymentId"+i).val());
            paidAmountArray.push($("#paidAmountId"+i).val());
            currentBalanceArray.push($("#currentBalanceId"+i).val());
            overdueAmountArray.push($("#overdueAmountId"+i).val());
            daysInArrearsArray.push($("#daysInArrearsId"+i).val());
            loanStatusArray.push($("#loanStatusId"+i).val());

        }
        $("#clientGlobalNumIdArray").val(clientGlobalNumArray);
        $("#lastPaymentArrayId").val(lastPaymentArray);
        $("#paidAmountArrayId").val(paidAmountArray);
        $("#currentBalanceArrayId").val(currentBalanceArray);
        $("#amountOverdueArrayId").val(overdueAmountArray);
        $("#daysInArrearsArrayId").val(daysInArrearsArray);
        $("#loanStatusArrayId").val(loanStatusArray);




        $.mobile.showPageLoadingMsg();
        document.getElementById("reschduledLoanFormID").action = localStorage.contextPath+"/client/ci/groups/updateRescheduledLoanAccount";
        document.getElementById("reschduledLoanFormID").method = "POST";
        document.getElementById("reschduledLoanFormID").submit().refresh();
    }
}
