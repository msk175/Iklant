/**
 * Created by Paramasivan(siva0005) on 03-12-2014.
 */
var count = 0;
function getClientListForSecondLoanProcess(iklantGroupId, accountNo, mifosCustomerId, loanCount, clientCount) {
    $.mobile.showPageLoadingMsg();
    $('#groupId').val(iklantGroupId);
    $('#customerId').val(mifosCustomerId);
    $('#accountNo').val(accountNo);
    $('#currentLoanCount').val(loanCount);
    $('#clientCount').val(clientCount);
    $('#BMFormId').attr('method', 'POST');
    $('#BMFormId').attr('action', localStorage.contextPath + '/client/ci/nextLoanGroups/nextLoanPreCheckDetails');
    $('#BMFormId').submit();
    $('#groupContent').remove();
}

function changeTab(activeTabId,inactiveTabId){
    $('#errorMessage').text('')
    $('#successMessage').text('')
    var clientDetails = $.parseJSON($('#clientDetails').val());
    var clientRepaymentTrack = $.parseJSON($('#clientRepaymentTrack').val());
    $('#'+inactiveTabId+'DetailsDiv').hide();
    $('#'+inactiveTabId+'Tab').removeClass("current");
    $('#'+activeTabId+'Tab').addClass("current");
    $('#'+activeTabId+'DetailsDiv').show();
    if((activeTabId == 'client') && ($('#nextTabToClick').val() == 'client')){
        $('#nextTabToClick').val('group');
        showClientDetails(0);
    }
    else if(activeTabId == 'group'){
        $('#nextTabToClick').val('client');
    }
}

function cancelNextLoanPreCheck(){
    $.mobile.showPageLoadingMsg();
    document.getElementById("BMFormId").method='POST';
    document.getElementById("BMFormId").action=localStorage.contextPath+"/client/ci/groups/operation/"+nextLoanPreCheck;
    document.getElementById("BMFormId").submit();
}

function showClientDetails(count){
    $(window).scrollTop(0);
    $('#errorMessage').text('')
    $('.loanOfficerDiv').remove();
    var clientDetails = $.parseJSON($('#clientDetails').val());
    var clientLucDetails = $.parseJSON($('#clientLucDetails').val());
    var clientRepaymentTrack = $.parseJSON($('#clientRepaymentTrack').val());
    $('#repaymentTrackTable,#lucTable').remove();
    $('.nextPreDiv,.approveOrRejectDiv,.header').remove();
    $('#customerName').text(":  "+clientDetails[count].customerName);
    $('#loanPurpose').text(":  "+clientDetails[count].loanPurpose);
    $('#loanAmount').text(":  "+clientDetails[count].loanAmount);
    $('#mifosCustomerId').val(clientDetails[count].customerId);
    $('#iklantClientId').val(clientDetails[count].clientId);
    $('#clientFirstName').val(clientDetails[count].firstName);
    $('#clientLastName').val(clientDetails[count].lastName);
    $('#clientCurrentLoanCount').val(clientDetails[count].loanCount);
    $('#mifosClientAccountNo').val(clientDetails[count].accountNo);
    if((clientDetails.length) <= 1) {
        var dropDownContent = "<div class='ui-block-c loanOfficerDiv' style='width:10%'>" +
            "<div data-role='fieldcontain'><h6>Select FO</h6></div></div>" +
            "<div class='ui-block-d loanOfficerDiv' style='width:20%'>" +
            "<div data-role='fieldcontain'>" +
            "<select name='loanOfficer'  id='loanOfficer'  data-theme='b'  data-icon='grid'  data-inline='true'  data-mini='true'>" +
            "<option value='-1'> Select FO</option></div></div>";
        $('#loanAmountDiv').append(dropDownContent).trigger('create');
        var personnelIds = $('#personnelId').val().split(',');
        var personnelNames = $('#personnelName').val().split(',');
        for(var i=0;i<personnelIds.length;i++){
            var dropDown = document.getElementById("loanOfficer");
            if(!personnelIds[i] == '' || !personnelIds[i] == null){
                option = document.createElement("option");
                option.text = personnelNames[i];
                option.value =personnelIds[i];
                try {
                    dropDown.add(option, null);
                }catch(error) {
                    dropDown.add(option);
                }
            }
        }
    }
    var nextPreviousContent = "";
    if (count > 0)
        nextPreviousContent += "<div class='ui-block-a nextPreDiv' align='center' style='width:30%'> <a href='JavaScript:showClientDetails(" + (count - 1) + ")'  data-role='button' id='clientDetailsPrevId'  data-inline='true' data-mini='true' data-icon='arrow-l' data-iconpos='left'> Prev</a></div>";
    else
        nextPreviousContent += "<div class='ui-block-a nextPreDiv' align='center' style='width:30%;'> </div>";
    nextPreviousContent += "<div class='ui-block-b nextPreDiv' align='right' style='width:30%;padding-right: 3em'>" +
        "<h4 id='clientDetailsPageNoId'>Clients "+(count+1)+" of "+clientDetails.length+"</h4></div>" +
        "<div class='ui-block-c nextPreDiv' align='right' style='width:30%'>";
    if(count < (clientDetails.length - 1))
        nextPreviousContent += "<a href='JavaScript:showClientDetails("+(count+1)+")' data-role='button' id='clientDetailsNextId'  data-inline='true'  data-mini='true' data-icon='arrow-r' data-iconpos='right'> Next</a></div>";
    $('#nextPreviousDiv').append(nextPreviousContent).trigger('create');
    var headers = "<h4 class='header' style='padding-top: 1em;color: rgba(53, 127, 183, 0.97)'>Repayment Track Record</h3><table id='repaymentTrackTable'>" +
        "<thead><tr>" +
        "<th>Month</th>" +
        "<th>Demand Date</th>" +
        "<th>Demand Amount</th>" +
        "<th>Paid Date</th>" +
        "<th>Paid Amount</th>" +
        "<th>Is Regular</th>" +
        "<th>Attendance</th>" +
        "</tr></thead>";
    $('#clientContentDiv').append(headers).trigger('create');
    for(var j=0;j<clientRepaymentTrack[clientDetails[count].customerId].length;j++) {
        if (clientRepaymentTrack[clientDetails[count].customerId][j].customerId == clientDetails[count].customerId) {
            var clientContent = "<tbody><tr>" +
                "<td align='center'>" + clientRepaymentTrack[clientDetails[count].customerId][j].demandMonth + "</td>" +
                "<td align='center'>" + clientRepaymentTrack[clientDetails[count].customerId][j].demandDate + "</td>" +
                "<td align='center'>" + clientRepaymentTrack[clientDetails[count].customerId][j].totalDemand + "</td>";
            if(clientRepaymentTrack[clientDetails[count].customerId][j].paidDate)
                clientContent += "<td align='center'>" + clientRepaymentTrack[clientDetails[count].customerId][j].paidDate + "</td>";
            else
                clientContent += "<td align='center'>"+$('#paidDate_'+j).val()+"</td>";
            if(clientRepaymentTrack[clientDetails[count].customerId][j].totalPaid != 0.00)
                clientContent += "<td align='center'>" + clientRepaymentTrack[clientDetails[count].customerId][j].totalPaid + "</td>";
            else
                clientContent += "<td align='center'>"+Math.round($('#totalPaid_'+j).val()/$('#clientCount').val())+".00</td>";
            if(clientRepaymentTrack[clientDetails[count].customerId][j].isRegular) {
                clientContent += "<td align='center'>Yes</td>";
            }else if(new Date(clientRepaymentTrack[clientDetails[count].customerId][j].demandDate) >= new Date($('#paidDate_'+j).val()) && !clientRepaymentTrack[clientDetails[count].customerId][j].paidDate){
                clientContent += "<td align='center'>Yes</td>";
            }
            else{
                clientContent += "<td align='center'>No</td>";
            }
            if(clientRepaymentTrack[clientDetails[count].customerId][j].isAttendanceChecked) {
                clientContent += "<td align='center'>Yes</td>";
            }else {
                clientContent += "<td align='center'>NA</td>";
            }
            clientContent += "</tr></tbody>";
            $('#repaymentTrackTable').append(clientContent).trigger('create');
        }
    }
    if(clientLucDetails[clientDetails[count].customerId].length>0) {
        var headersForLuc = "<h4 class='header' style='padding-top: 1em;color: rgba(53, 127, 183, 0.97)'>Loan Utilization Check</h3><table id='lucTable'>" +
            "<thead><tr>" +
            "<th>LUC Count</th>" +
            "<th>Luc Date</th>" +
            "<th>Is Loan Used For Intended Purpose</th>" +
            "<th>Reason if no</th>" +
            "<th>Is physically verified</th>" +
            "<th>Reason if no</th>" +
            "<th>Is LUC result satisfied</th>" +
            "<th>Reason if no</th>" +
            "<th>Is there any grievance with FO or Branch</th>" +
            "<th>Reason if yes</th>" +
            "</tr></thead>";
        $('#clientContentDiv').append(headersForLuc).trigger('create');
        for (var j = 0; j < clientLucDetails[clientDetails[count].customerId].length; j++) {
            if (clientLucDetails[clientDetails[count].customerId][j].customerId == clientDetails[count].customerId) {
                var clientLucContent = "<tbody><tr>" +
                    "<td align='center'>" + clientLucDetails[clientDetails[count].customerId][j].lucCount + "</td>" +
                    "<td align='center'>" + clientLucDetails[clientDetails[count].customerId][j].lucDate + "</td>";
                if(clientLucDetails[clientDetails[count].customerId][j].isLoanUsedForIntendedPurpose) {
                    clientLucContent += "<td align='center'>Yes</td><td align='center'>NA</td>";
                    if(clientLucDetails[clientDetails[count].customerId][j].physicalVerification) {
                        clientLucContent += "<td align='center'>Yes</td><td align='center'>NA</td>";
                        if(clientLucDetails[clientDetails[count].customerId][j].isLucResultSatisfied) {
                            clientLucContent += "<td align='center'>Yes</td><td align='center'>NA</td>";
                            if(clientLucDetails[clientDetails[count].customerId][j].isThereAnyGrievanceWithFoOrBranch)
                                clientLucContent += "<td align='center'>Yes</td><td align='center'>"+clientLucDetails[clientDetails[count].customerId][j].remarks+"</td>";
                            else
                                clientLucContent += "<td align='center'>No</td><td align='center'>NA</td>";
                        }else {
                            clientLucContent += "<td align='center'>No</td><td align='center'>" + clientLucDetails[clientDetails[count].customerId][j].reasonForLuc + "</td>" +
                            "<td align='center'>NA</td><td align='center'>NA</td>";
                        }
                    }else {
                        clientLucContent += "<td align='center'>No</td><td align='center'>" + clientLucDetails[clientDetails[count].customerId][j].reasonForNotPhysicallyVerifying + "</td>" +
                        "<td align='center'>NA</td><td align='center'>NA</td><td align='center'>NA</td><td align='center'>NA</td>";
                    }
                }else {
                    clientLucContent += "<td align='center'>No</td><td align='center'>" + clientLucDetails[clientDetails[count].customerId][j].reasonForNotUsingLoanIndenedPurpose + "</td>" +
                    "<td align='center'>NA</td><td align='center'>NA</td><td align='center'>NA</td><td align='center'>NA</td><td align='center'>NA</td><td align='center'>NA</td>";
                }
                clientLucContent += "</tr></tbody>";
                $('#lucTable').append(clientLucContent).trigger('create');
            }
        }
    }
    var approveOrRejectDiv = "<div class='ui-block-a approveOrRejectDiv' style='width:30%'>" +
        "<a href='JavaScript:approveOrRejectClient(1)'  data-theme='b' id='approveClient'  data-role='button'  title=' Approve'  data-inline='true'  data-mini='true' data-rel='popup' data-position-to='window'> Approve Client</a></div>" +
        "<div class='ui-block-c approveOrRejectDiv' style='width:30%'>" +
        "<a href='JavaScript:approveOrRejectClient(0)'  data-theme='b' id='rejectClient'  data-role='button'  title=' Reject'  data-inline='true'  data-mini='true' data-rel='popup' data-position-to='window'> Reject Client</a></div>";
    $('#approveOrRejectDiv').append(approveOrRejectDiv).trigger('create');
}

function approveOrRejectGroup(flag){
    $('#successMessage').text("");
    $('#flag').val(flag);
    $('#customerLevel').val(groupLevel);
    if($('#loanOfficerId').val() != -1 && flag) {
        $('.approveOrRejectGroupDiv').hide();
        $('#errorMessage').text("");
        $.mobile.showPageLoadingMsg();
        $('#BMFormId').attr('method', 'POST');
        $('#BMFormId').attr('action', localStorage.contextPath + '/client/ci/nextLoanGroups/approveOrRejectCustomerForNextLoan');
        $('#BMFormId').submit();
    }
    else if(!flag){
        $('#alertMessage').text("This group will be rejected. Do you want to continue?");
        document.getElementById('rejectGroup').href = "#rejectConfirmationId";
        $("#rejectGroup").trigger('click');
    }
    else{
        $(window).scrollTop(0);
        $('#errorMessage').text("Please select FO to proceed");
    }
}

function approveOrRejectClient(flag) {
    $('#successMessage').text("");
    var clientDetails = $.parseJSON($('#clientDetails').val());
    if(!flag && (($('#clientCount').val()-$('#rejectedClients').val()) > minimumClients)){
        $('#customerLevel').val(clientLevel);
        $('#alertMessage').text("This client will be rejected. Do you want to continue?");
        document.getElementById('rejectClient').href = "#rejectConfirmationId";
        $("#rejectClient").trigger('click');
    }
    else if (!flag && (($('#clientCount').val()-$('#rejectedClients').val()) <= minimumClients)) {
        $('#customerLevel').val(clientLevel);
        $('#alertMessage').text("This group will be rejected due to active clients less than "+minimumClients+". Do you want to continue?");
        document.getElementById('rejectClient').href = "#rejectConfirmationId";
        $("#rejectClient").trigger('click');
    }
    else if((clientDetails.length <= 1) && $('#loanOfficer').val() == -1){
        $(window).scrollTop(0);
        $('#errorMessage').text("Please select FO to proceed");
    }
    else{
        $('#errorMessage').text("");
        updateStatus(flag);
    }
}

function updateStatus(flag){
    $('#approveOrRejectDiv').hide();
    $.mobile.showPageLoadingMsg();
    $.post("http://" + ajaxcallip + localStorage.contextPath + "/client/ci/nextLoanGroups/approveOrRejectCustomerForNextLoan",
        {
            flag: flag,
            customerLevel: clientLevel,
            mifosCustomerId: $('#mifosCustomerId').val(),
            mifosParentCustomerId: $('#mifosParentCustomerId').val(),
            iklantGroupId: $('#iklantGroupId').val(),
            iklantClientId: $('#iklantClientId').val(),
            groupCurrentLoanCount: $('#groupCurrentLoanCount').val(),
            clientCurrentLoanCount: $('#clientCurrentLoanCount').val(),
            mifosAccountNo: $('#mifosAccountNo').val(),
            mifosClientAccountNo: $('#mifosClientAccountNo').val(),
            groupName: $('#groupName').val(),
            clientFirstName: $('#clientFirstName').val(),
            clientLastName: $('#clientLastName').val(),
            clientCount: $('#clientCount').val(),
            remarks: $('#remarks').val(),
            loanOfficer: (typeof $('#loanOfficer').val() == 'undefined')?-1:$('#loanOfficer').val()
        },
        function(data) {
            $('.loanOfficerDiv').remove();
            $('#approveOrRejectDiv').show();
            if (data.clientDetails.length > 0) {
                $.mobile.hidePageLoadingMsg();
                $('#loanOfficerId').val(data.loanOfficerId);
                $("#rejectedClients").val(data.rejectedClients);
                $("#clientDetails").val(JSON.stringify(data.clientDetails));
                $("#clientRepaymentTrack").val(JSON.stringify(data.clientRepaymentTrack));
                $("#clientLucDetails").val(JSON.stringify(data.clientLucDetails));
                $("#mifosParentCustomerId").val(data.groupDetails[0].customerId);
                $("#iklantGroupId").val(data.groupDetails[0].iklantGroupId);
                $("#mifosAccountNo").val(data.mifosAccountNo);
                $('#remarks').val('');
                if(flag)
                    $('#successMessage').text("Client approved successfully");
                else
                    $('#successMessage').text("Client rejected successfully");
                showClientDetails(count);
            }
            else{
                var statusMessage = (flag)?"Group approved successfully & moved for KYC uploading":"Group rejected successfully";
                $('#statusMessage').val(statusMessage);
                cancelNextLoanPreCheck();
            }
        }
    );
}

function confirmReject(flag){
    if($('#remarks').val().trim() != '') {
        $("#rejectConfirmationId").popup("close");
        if ($('#customerLevel').val() == clientLevel) {
            $('#approveOrRejectDiv').hide();
            updateStatus(flag)
        }
        else if($('#customerLevel').val() == groupLevel){
            $('.approveOrRejectGroupDiv').hide();
            $.mobile.showPageLoadingMsg();
            $.post("http://" + ajaxcallip + localStorage.contextPath + "/client/ci/nextLoanGroups/approveOrRejectCustomerForNextLoan",
                {
                    flag: flag,
                    customerLevel: groupLevel,
                    mifosCustomerId: $('#mifosCustomerId').val(),
                    mifosParentCustomerId: $('#mifosParentCustomerId').val(),
                    iklantGroupId: $('#iklantGroupId').val(),
                    iklantClientId: $('#iklantClientId').val(),
                    groupCurrentLoanCount: $('#groupCurrentLoanCount').val(),
                    clientCurrentLoanCount: $('#clientCurrentLoanCount').val(),
                    mifosAccountNo: $('#mifosAccountNo').val(),
                    mifosClientAccountNo: $('#mifosClientAccountNo').val(),
                    groupName: $('#groupName').val(),
                    clientFirstName: $('#clientFirstName').val(),
                    clientLastName: $('#clientLastName').val(),
                    clientCount: $('#clientCount').val(),
                    remarks: $('#remarks').val(),
                    loanOfficer: $('#loanOfficerId').val()
                },
                function(data) {
                    if(data.status == 'success') {
                        $('#statusMessage').val('Group rejected successfully');
                        cancelNextLoanPreCheck();
                    }
                    else{
                        $('#errorMessage').text("Transaction not completed. Please try later");
                    }
                }
            );
        }
    }
    else{
        $('#errMessage').text("Please fill remarks");
    }
}

function cancelReject(){
    $('#errMessage').text("");
    $('#remarks').val('');
}