$(document).ready(function() {
    $('#backId').click(function(){
        $("p").text('');
        $('#clientDetailsDiv').show();
        $('#individuatlClientDiv').hide();
        $('.individualClients').remove();
        $('#clientId').val("");
        $('#accountId').val("");
        $('#flag').val(0);
    });

    $("#is_loan_amount_used_for_intended_purpose_no").click(function () {
        $("#is_loan_amount_used_for_intended_purpose_no").val('no');
        $("#reason_for_loan_amount_not_used").show();
        $('#physicalVerification,#lucSatisfied,#grievance').hide();
    })

    $("#is_loan_amount_used_for_intended_purpose_yes").click(function () {
        $("#is_loan_amount_used_for_intended_purpose_yes").val('yes');
        $('#physicalVerification').show();
        if($('#physical_verification_yes').is(':checked'))
            $('#lucSatisfied').show();
        if($('#is_luc_result_satisfied_yes').is(':checked'))
            $('#grievance').show();
        $("#reason_for_loan_amount_not_used").hide();
    })

    $("#physical_verification_no").click(function () {
        $("#physical_verification_no").val('no');
        $('#lucSatisfied,#grievance').hide();
        $("#reason_for_physical_verification").show();
    })

    $("#physical_verification_yes").click(function () {
        $("#physical_verification_yes").val('yes');
        $('#lucSatisfied').show();
        if($('#is_luc_result_satisfied_yes').is(':checked'))
            $('#grievance').show();
        $("#reason_for_physical_verification").hide();
    })

    $("#is_luc_result_satisfied_no").click(function () {
        $("#is_luc_result_satisfied_no").val('no');
        $('#grievance').hide();
        $("#reason_for_luc_result").show();
    })

    $("#is_luc_result_satisfied_yes").click(function () {
        $("#is_luc_result_satisfied_yes").val('yes');
        $('#grievance').show();
        $("#reason_for_luc_result").hide();
    })

    $("#is_there_any_grievance_with_fo_or_branch_yes").click(function () {
        $("#is_there_any_grievance_with_fo_or_branch_no").val('yes');
        $("#remarks_for_grievance").show();
    })

    $("#is_there_any_grievance_with_fo_or_branch_no").click(function () {
        $("#is_there_any_grievance_with_fo_or_branch_yes").val('no');
        $("#remarks_for_grievance").hide();
    })
    $(".reason").keydown(function(event){
        return ((event.keyCode > 64 && event.keyCode < 91) || (event.keyCode > 96 && event.keyCode < 123) || event.keyCode == 8 || event.keyCode == 9  || event.keyCode == 32 || event.keyCode == 46 || event.keyCode == 190 || event.keyCode == 191 || event.keyCode == 188 || (event.keyCode >= 37 && event.keyCode <= 45) || (event.keyCode >= 48 && event.keyCode <= 57));
    });
    var radio = $("input[type=radio]");
    radio.on("click", function (e) {
        if (e.target.value == 'yes' || e.target.value == 'no') {
            $("p").text('');
        }
    })
});

function getLUCGroups(){
    $.mobile.showPageLoadingMsg();
    document.getElementById('loanUtilizationCheck').method = 'POST';
    document.getElementById('loanUtilizationCheck').action = localStorage.contextPath+'/client/ci/getLUCGroups';
    document.getElementById('loanUtilizationCheck').submit();
}

function cancelLUCClients(){
    if($('#flag').val() == 0) {
        document.getElementById('loanUtilizationCheck').method = 'POST';
        document.getElementById('loanUtilizationCheck').action = localStorage.contextPath+'/client/ci/getLUCGroups';
        document.getElementById('loanUtilizationCheck').submit();
    }
    else{
        $("p").text('');
        $('#flag').val(0);
        $('#clientDetailsDiv').show();
        $('#individuatlClientDiv').hide();
        $('.individualClients').remove();
        $('#clientId').val("");
        $('#accountId').val("");
    }
}

function getLUCCustomerDetails(groupId,groupName){
    $.mobile.showPageLoadingMsg();
    $('#groupId').val(groupId);
    $('#groupName').val(groupName);
    document.getElementById('loanUtilizationCheck').method = 'POST';
    document.getElementById('loanUtilizationCheck').action = localStorage.contextPath+'/client/ci/getLUCAccounts';
    document.getElementById('loanUtilizationCheck').submit();
}

function getLUCCustomers(){
    $.mobile.showPageLoadingMsg();
    document.getElementById('loanUtilizationCheck').method = 'POST';
    document.getElementById('loanUtilizationCheck').action = localStorage.contextPath+'/client/ci/getLUCCustomerDetails';
    document.getElementById('loanUtilizationCheck').submit();
}

function getClientsForLUC(clientId,parentAccountId){
    $('#flag').val(1);
    var data = {};
    data.clientId = clientId;
    data.parentAccountId = parentAccountId;
    ajaxVariable = $.ajax({
        beforeSend: function () {
            $.mobile.showPageLoadingMsg();
        },
        complete: function () {
            $.mobile.hidePageLoadingMsg()
        },
        type: 'POST',
        data: JSON.stringify(data),
        contentType: 'application/json',
        url: 'http://' + ajaxcallip + localStorage.contextPath+'/client/ci/populateClientDetails',
        success: function (result) {
            $('#clientDetailsDiv').hide();
            $('#individuatlClientDiv').show();
            $('#clientId').val(clientId);
            $('#accountId').val(result.clientDetails[0].account_id);
            var newContent = '<div data-role="horizontal" class="ui-bar ui-grid-a individualClients" style="padding-left: 5em;width: 100%"><div class="ui-block-a" style="width: 25%"><div data-role="fieldcontain" class="ui-field-contain ui-body ui-br"><label for="clientName">Group Name</label></div></div>' +
                '<div align="left" class="ui-block-b"><div data-role="fieldcontain" class="ui-field-contain ui-body ui-br"><label style="font-weight: bold">'+$('#groupName').val()+'</label></div></div></div>' +
                '<div data-role="horizontal" class="ui-bar ui-grid-a individualClients" style="padding-left: 5em;width: 100%"><div class="ui-block-a" style="width: 25%"><div data-role="fieldcontain" class="ui-field-contain ui-body ui-br"><label for="clientName">Client Name</label></div></div>' +
                '<div align="left" class="ui-block-b"><div data-role="fieldcontain" class="ui-field-contain ui-body ui-br"><label style="font-weight: bold">'+result.clientDetails[0].display_name+'</label></div></div></div>';
            if(result.clientDetails[0].guarantor_name != null && result.clientDetails[0].guarantor_name != "") {
                newContent += '<div data-role="horizontal" class="ui-bar ui-grid-a individualClients" style="padding-left: 5em;width: 100%"><div class="ui-block-a" style="width: 25%"><div data-role="fieldcontain" class="ui-field-contain ui-body ui-br"><label for="clientName">Guarantor Name</label></div></div>' +
                '<div align="left" class="ui-block-b"><div data-role="fieldcontain" class="ui-field-contain ui-body ui-br"><label style="font-weight: bold">' + result.clientDetails[0].guarantor_name + '</label></div></div></div>';
            }
            else{
                newContent += '<div data-role="horizontal" class="ui-bar ui-grid-a individualClients" style="padding-left: 5em;width: 100%"><div class="ui-block-a" style="width: 25%"><div data-role="fieldcontain" class="ui-field-contain ui-body ui-br"><label for="clientName">Guarantor Name</label></div></div>' +
                '<div align="left" class="ui-block-b"><div data-role="fieldcontain" class="ui-field-contain ui-body ui-br"><label style="font-weight: bold">Nil</label></div></div></div>';
            }
            if(result.clientDetails[0].relationship != null && result.clientDetails[0].relationship != "Self") {
                newContent += '<div data-role="horizontal" class="ui-bar ui-grid-a individualClients" style="padding-left: 5em;width: 100%"><div class="ui-block-a" style="width: 25%"><div data-role="fieldcontain" class="ui-field-contain ui-body ui-br"><label for="clientName">Relationship</label></div></div>' +
                    '<div align="left" class="ui-block-b"><div data-role="fieldcontain" class="ui-field-contain ui-body ui-br"><label style="font-weight: bold">' + result.clientDetails[0].relationship + '</label></div></div></div>';
            }else {
                newContent += '<div data-role="horizontal" class="ui-bar ui-grid-a individualClients" style="padding-left: 5em;width: 100%"><div class="ui-block-a" style="width: 25%"><div data-role="fieldcontain" class="ui-field-contain ui-body ui-br"><label for="clientName">Relationship</label></div></div>' +
                    '<div align="left" class="ui-block-b"><div data-role="fieldcontain" class="ui-field-contain ui-body ui-br"><label style="font-weight: bold">Nil</label></div></div></div>';
            }
            newContent += '<div data-role="horizontal" class="ui-bar ui-grid-a individualClients" style="padding-left: 5em;width: 100%"><div class="ui-block-a" style="width: 25%"><div data-role="fieldcontain" class="ui-field-contain ui-body ui-br"><label for="clientName">Loan Amount</label></div></div>' +
                '<div align="left" class="ui-block-b"><div data-role="fieldcontain" class="ui-field-contain ui-body ui-br"><label style="font-weight: bold">Rs. '+result.clientDetails[0].loan_amount+'.00/-</label></div></div></div>' +
                '<div data-role="horizontal" class="ui-bar ui-grid-a individualClients" style="padding-left: 5em;width: 100%"><div class="ui-block-a" style="width: 25%"><div data-role="fieldcontain" class="ui-field-contain ui-body ui-br"><label for="clientName">Interest Rate</label></div></div>' +
                '<div align="left" class="ui-block-b"><div data-role="fieldcontain" class="ui-field-contain ui-body ui-br"><label style="font-weight: bold">'+result.clientDetails[0].interest_rate+'%</label></div></div></div>' +
                /*'<div data-role="horizontal" class="ui-bar ui-grid-a individualClients" style="padding-left: 5em;width: 100%"><div class="ui-block-a" style="width: 25%"><div data-role="fieldcontain" class="ui-field-contain ui-body ui-br"><label for="clientName">Processing Fees</label></div></div>' +
                '<div align="left" class="ui-block-b"><div data-role="fieldcontain" class="ui-field-contain ui-body ui-br"><label style="font-weight: bold">Rs. '+(result.clientDetails[0].loan_amount)/100+'.00/-</label></div></div></div>' +
                '<div data-role="horizontal" class="ui-bar ui-grid-a individualClients" style="padding-left: 5em;width: 100%"><div class="ui-block-a" style="width: 25%"><div data-role="fieldcontain" class="ui-field-contain ui-body ui-br"><label for="clientName">Service Charge</label></div></div>' +
                '<div align="left" class="ui-block-b"><div data-role="fieldcontain" class="ui-field-contain ui-body ui-br"><label style="font-weight: bold">Rs. '+Number((Math.ceil((result.clientDetails[0].loan_amount/100)*(12.36/100)))).toFixed(2)+'/-</label></div></div></div>' +
                '<div data-role="horizontal" class="ui-bar ui-grid-a individualClients" style="padding-left: 5em;width: 100%"><div class="ui-block-a" style="width: 25%"><div data-role="fieldcontain" class="ui-field-contain ui-body ui-br"><label for="clientName">Insurance</label></div></div>' +
                '<div align="left" class="ui-block-b"><div data-role="fieldcontain" class="ui-field-contain ui-body ui-br"><label style="font-weight: bold">Rs. '+getInterestRate(result.clientDetails[0].date_of_birth)+'.00/-</label></div></div></div>' +*/
                '<div data-role="horizontal" class="ui-bar ui-grid-a individualClients" style="padding-left: 5em;width: 100%"><div class="ui-block-a" style="width: 25%"><div data-role="fieldcontain" class="ui-field-contain ui-body ui-br"><label for="clientName">Purpose of Loan</label></div></div>' +
                '<div align="left" class="ui-block-b"><div data-role="fieldcontain" class="ui-field-contain ui-body ui-br"><label style="font-weight: bold">'+result.clientDetails[0].loan_purpose+'</label></div></div></div>' +
                '<div data-role="horizontal" class="ui-bar ui-grid-a individualClients" style="padding-left: 5em;width: 100%"><div class="ui-block-a" style="width: 25%"><div data-role="fieldcontain" class="ui-field-contain ui-body ui-br"><label for="clientName">Disb. Date</label></div></div>' +
                '<div align="left" class="ui-block-b"><div data-role="fieldcontain" class="ui-field-contain ui-body ui-br"><label style="font-weight: bold">'+result.clientDetails[0].disbursement_date+'</label></div></div></div>' +
                '<div data-role="horizontal" class="ui-bar ui-grid-a individualClients" style="padding-left: 5em;width: 100%"><div class="ui-block-a" style="width: 25%"><div data-role="fieldcontain" class="ui-field-contain ui-body ui-br"><label for="clientName">Contact Number</label></div></div>';
            if(result.clientDetails[0].phone_number != null && result.clientDetails[0].phone_number != "") {
                newContent += '<div align="left" class="ui-block-b"><div data-role="fieldcontain" class="ui-field-contain ui-body ui-br"><label style="font-weight: bold">' + result.clientDetails[0].phone_number + '</label></div></div></div>';
            }else {
                newContent += '<div align="left" class="ui-block-b"><div data-role="fieldcontain" class="ui-field-contain ui-body ui-br"><label style="font-weight: bold">Nil</label></div></div></div>';
            }
            newContent += '<div data-role="horizontal" class="ui-bar ui-grid-a individualClients" style="padding-left: 5em;width: 100%"><div class="ui-block-a" style="width: 25%"><div data-role="fieldcontain" class="ui-field-contain ui-body ui-br"><label for="clientName">Address</label></div></div>'+
                '<div align="left" class="ui-block-b"><div data-role="fieldcontain" class="ui-field-contain ui-body ui-br"><label style="font-weight: bold">'+result.clientDetails[0].clientAddress+'</label></div></div></div>';
            $('#clientDetails').append(newContent).trigger('create');
        }
    });
}

function saveLUCDetails(){
    $('#errorMessage').show();
    if(!$("#is_loan_amount_used_for_intended_purpose_no").is(":checked") && !$("#is_loan_amount_used_for_intended_purpose_yes").is(":checked")){
        $("#is_loan_amount_used_for_intended_purpose_yes").focus();
        $('#errorMessage').text("Please specify whether loan amount used for intended purpose or not");
    }
    else if($("#is_loan_amount_used_for_intended_purpose_no").is(":checked") && $('#reason_for_loan_amount_not_used_for_intended_purpose').val().trim() == "") {
        $('#reason_for_loan_amount_not_used_for_intended_purpose').focus();
        $('#errorMessage').text("Please enter the reason for not using the loan for intended purpose");
    }
    else if($("#is_loan_amount_used_for_intended_purpose_yes").is(":checked") && !$("#physical_verification_no").is(":checked") && !$("#physical_verification_yes").is(":checked")){
        $("#physical_verification_yes").focus();
        $('#errorMessage').text("Please specify physically verified or not");
    }
    else if($("#physical_verification_no").is(":checked") && $('#reason_for_physical_verification_not_done').val().trim() == "") {
        $('#reason_for_physical_verification_not_done').focus();
        $('#errorMessage').text("Please enter the reason for not physically verifying");
    }
    else if($("#physical_verification_yes").is(":checked") && !$("#is_luc_result_satisfied_no").is(":checked") && !$("#is_luc_result_satisfied_yes").is(":checked")){
        $("#is_luc_result_satisfied_yes").focus();
        $('#errorMessage').text("Please specify LUC result satisfied or not");
    }
    else if($("#is_luc_result_satisfied_no").is(":checked") && $('#reason_for_luc_result_not_satisfied').val().trim() == "") {
        $('#reason_for_luc_result_not_satisfied').focus();
        $('#errorMessage').text("Please fill the reason");
    }
    else if($("#is_luc_result_satisfied_yes").is(":checked") && !$("#is_there_any_grievance_with_fo_or_branch_no").is(":checked") && !$("#is_there_any_grievance_with_fo_or_branch_yes").is(":checked")){
        $("#is_there_any_grievance_with_fo_or_branch_yes").focus();
        $('#errorMessage').text("Please specify there any grievance with FO or Branch");
    }
    else if($("#is_there_any_grievance_with_fo_or_branch_yes").is(":checked") && $('#remarks').val().trim() == "") {
        $('#remarks').focus();
        $('#errorMessage').text("Please fill the remarks");
    }
    else {
        $('#errorMessage').hide();
        $("p").text('');
        document.getElementById('loanUtilizationCheck').method = 'POST';
        document.getElementById('loanUtilizationCheck').action = localStorage.contextPath+'/client/ci/saveLUCDetails';
        document.getElementById('loanUtilizationCheck').submit();
    }
}

function getInterestRate(dateString) {
    var today = new Date();
    var birthDate = new Date(dateString);
    var age = today.getFullYear() - birthDate.getFullYear();
    var m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
        age--;
    }
    if (isNaN(age)) {
        age =  "";
    }
    if(age > 50){
        return 150;
    }
    else{
        return 100;
    }
}