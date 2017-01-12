var rejectedClientAmount = 0;
var clientListcurrentrow = 0;
var clientListmaxrows = 0;
var clientListPageNo = 1;
$(document).ready(function() {
    //$("#fundDetails").hide();
    $("#allocateAmount").hide();
    $("#allocateFundSubmitId").hide();
    $("#exportReportId").hide();
    $("#paginationDiv").hide();

    $(function() {
        $("#dateId").datepicker({
            maxDate: new Date,
            dateFormat: 'yy-mm-dd',
            yearRange: "-1:+0",
            changeMonth: true,
            changeYear: true,
            onClose: function ()
            {

            }
        });
    });
    $('#dateId').change(function () {

        if($("#officeId").val() == 0){
            var errorLabelMember = "Please select office then choose Date ";
            document.getElementById("errorLabel").innerText = errorLabelMember;
            $("#dateId").val('');
        }
        else {
            var data ={};
            data.officeId = $("#officeId").val();
            data.disbursementDate = $("#dateId").val();
            ajaxVariable = $.ajax({
                beforeSend : function() {
                    $.mobile.showPageLoadingMsg();
                },
                complete: function() {
                    $.mobile.hidePageLoadingMsg() ;
                },
                type: 'POST',
                data: JSON.stringify(data),
                contentType: 'application/json',
                url: 'http://'+ajaxcallip+localStorage.contextPath+'/accounting/fund/unallocatedGroupsLoanAmount/load',
                success: function(data) {
                    if(data.status == "success"){
                        $("#paginationDiv").show();
                        $("#divId").show();
                        $('table').remove('#bodyid');
                        var newContent = '<table id="bodyid">';
                        $("#divId").append(newContent).trigger('create');


                        $("#unallocatedAmtId").val(data.unallocatedAmount)
                        document.getElementById("unallocatedAmountId").innerText = data.unallocatedAmount;
                        var accountId = new Array();
                        var loanCustomDetailId = new Array();
                        for (var i = 0; i < data.unallocatedGroupsList.length; i++) {
                            //clientNameForGroupLocal[i] = data.unallocatedGroupDetail[i];
                            if (i == 0) {
                                var newContent = '<tr>';
                                newContent += '<th>';
                                newContent += "S. No";
                                newContent += '</th>';
                                newContent += '<th>';
                                newContent += "Approve";
                                newContent += '</th>';
                                newContent += '<th>';
                                newContent += "Group Name";
                                newContent += '</th>';
                                newContent += '<th>';
                                newContent += 'Amount';
                                newContent += '</th>';
                                newContent += '</tr>';
                                $("#bodyid").append(newContent).trigger('create');
                            }
                            accountId[i] = data.unallocatedGroupsList[i].accountId;
                            loanCustomDetailId[i] = data.unallocatedGroupsList[i].loanCustomDetailId;
                            var newContent = '<tr class = "showhide">';
                            newContent += "<td class='center-text'>";
                            newContent += i + 1;
                            newContent += '</td>';
                            newContent += "<td class='center-text'>";
                            newContent += "<input type='checkbox' name='rejectCheckbox' id='rejectCheckboxId" + i + "'  onclick='rejCheckboxFunction(this," + i + ")'>";
                            newContent += "<label for='rejectCheckboxId" + i + "'>Approved</label>";
                            newContent += '</td>';
                            newContent += "<td id='accountOwnerId" + i + "' class='center-text'>";
                            newContent += data.unallocatedGroupsList[i].groupName;
                            newContent += '</td>';
                            newContent += "<td class='center-text'>";
                            newContent += "<input type=text readonly=readonly onkeyup='numeric(this)'  onfocusout='editedClientAmount(" + i + ")' id='tabletext" + i + "' value="+data.unallocatedGroupsList[i].loanAmount+" autocomplete='off'>";;
                            newContent += '</td>';
                            newContent += '</tr>';
                            $("#bodyid").append(newContent).trigger('create');
                        }
                        $("#accountId").val(accountId);
                        $("#loanCustomDetailId").val(loanCustomDetailId);
                        clientListcurrentrow = 0;
                        clientListmaxrows = $("#bodyid tr").length-1;
                        console.log("clientListmaxrows : " + clientListmaxrows);
                        $("#clientListPrevId").hide();
                        if(clientListmaxrows > 5) {
                            $("#clientListNextId").show();
                        }else{
                            $("#clientListNextId").hide();
                        }
                        $('#bodyid tr.showhide').hide();
                        for(var i =0 ; i<5; i++) {
                            if (clientListcurrentrow < clientListmaxrows) {
                                console.log("clientListcurrentrow : "+clientListcurrentrow);
                                console.log("clientListmaxrows : " + clientListmaxrows);
                                $('#bodyid tr.showhide:eq(' + clientListcurrentrow  + ')').show();
                                clientListcurrentrow++;
                            }
                        }
                        clientListPageNo = 1;
                        var $btn_text  = $('#clientListPageNoId').find('.ui-btn-text')
                        $btn_text.text("Records "+clientListPageNo+" - "+clientListcurrentrow+" of "+clientListmaxrows);
                        $("#allocateAmount").show();
                        $("#allocateFundSubmitId").show();
                    }
                    else if(data.status == "failure"){

                    }
                    else{
                        showPageExpired();
                    }
                },
                error : function(jqXHR, textStatus, error) {
                }
            });



        }

    });
    $('#noClosureId').click(function() {
        $("#allocateFundSubmitId").show();
        $("#preclosureConfirmationId" ).popup( "close" );
    });
    $('#yesClosureId').click(function() {
        $.mobile.showPageLoadingMsg();
        document.getElementById("accountsMenuFormID").method='POST';
        document.getElementById("accountsMenuFormID").action=localStorage.contextPath+"/accounting/fund/allocateFundsToGroups";
        document.getElementById("accountsMenuFormID").submit();
    });
    $("#clientListPrevId").click(function() {
        if(clientListcurrentrow == clientListmaxrows){
            $("#clientListNextId").show();
        }

        var hidenextrow = clientListcurrentrow;
        if(clientListmaxrows == clientListcurrentrow){
            var x = clientListmaxrows % 5;
            if(x>0){
                hidenextrow = hidenextrow + (5 - x);
                clientListcurrentrow = clientListcurrentrow + (5 - x);
            }
        }
        for(var i =0 ; i<5; i++) {
            hidenextrow--;
            $('#bodyid tr.showhide:eq(' + hidenextrow  + ')').hide();
            if (clientListcurrentrow > 0) {
                clientListcurrentrow --;
                $('#bodyid tr.showhide:eq(' + (clientListcurrentrow-5)  +')').show();

            }
        }
        if(clientListcurrentrow == 5){
            $("#clientListPrevId").hide();
        }
        clientListPageNo = clientListPageNo - 5;
        var $btn_text  = $('#clientListPageNoId').find('.ui-btn-text')
        $btn_text.text("Records "+clientListPageNo+" - "+clientListcurrentrow+" of "+clientListmaxrows);

    });



    //Group Installment Due pagination//
    $("#clientListNextId").click(function() {
        if(clientListcurrentrow == 5){
            $("#clientListPrevId").show();
        }
        //alert("next"+clientListcurrentrow);
        var hidepreviousrow = clientListcurrentrow;
        for(var i =0 ; i<5; i++) {
            hidepreviousrow--;
            $('#bodyid tr.showhide:eq(' + hidepreviousrow  + ')').hide();
            if (clientListcurrentrow < clientListmaxrows) {
                $('#bodyid tr.showhide:eq(' + clientListcurrentrow  + ')').show();
                clientListcurrentrow ++;
            }
        }
        if(clientListcurrentrow == clientListmaxrows){
            $("#clientListNextId").hide();
        }
        clientListPageNo = clientListPageNo+5;
        var $btn_text  = $('#clientListPageNoId').find('.ui-btn-text')
        $btn_text.text("Records "+clientListPageNo+" - "+clientListcurrentrow+" of "+clientListmaxrows);
    });


});
function retrieveFundDetails(selectedValue){
    var fundId = $(selectedValue).val();
    //$("#fundDetails").show();
    //$("#exportReportId").show();
    $.mobile.showPageLoadingMsg();
    document.getElementById("accountsMenuFormID").method='POST';
    document.getElementById("accountsMenuFormID").action=localStorage.contextPath+"/accounting/fund/load/"+fundId+"";
    document.getElementById("accountsMenuFormID").submit();
}
function hideAllocateAmountDetails(){
    document.getElementById("errorLabel").innerText = "";
    $("#allocateAmount").hide();
    $("#allocateFundSubmitId").hide();
    $("#dateId").val('');
    $("#divId").hide();
}

function submitFundAllocation(){
    var hiddenAccountIdLength = $("#accountId").val().split(',');
    var selectedAccounts = new Array();
    var index = 0;
    console.log(hiddenAccountIdLength);
    for(var i=0;i<hiddenAccountIdLength.length;i++){
        var sa = $("#rejectCheckboxId"+i).is(':checked');
        if(sa == true){
            selectedAccounts[index] = hiddenAccountIdLength[i];
            index++;
        }
        $("#selectedAccountsIdArray").val(selectedAccounts);
    }
    document.getElementById("errorLabel").innerText = "";
    if($("#amount").val().trim() == "" || parseFloat($("#amount").val()) == 0){
        var errorLabelMember = "Kindly enter amount to allocate";
        document.getElementById("errorLabel").innerText = errorLabelMember;
    }
    else if(parseFloat($("#unallocatedAmtId").val()) < parseFloat($("#amount").val())) {
        var errorLabelMember = "Allocated amount should be less than or equal to Unallocated Amount";
        document.getElementById("errorLabel").innerText = errorLabelMember;
    }
    else{
        $("#allocateFundSubmitId").hide();
        var popuptext = "Kindly verify below details before clicking yes <br><br><b> Fund </b>: "  + $("#fundId option:selected").text() + ' <br><br><b>Allocated Amount : </b> ' +  $("#amount").val() ;
        $("#popupId").html(popuptext);
        $("#preclosureConfirmationId").popup("open");
    }
}
function forNumbers(currentVal) {
    var regex = /[^0-9]+/g;
    if (regex.test(currentVal.value)) {
        currentVal.value = (currentVal.value.replace(regex, '')).trim();
    }
}
function rejCheckboxFunction(value,i){

    if($("#rejectCheckboxId"+i).is(':checked')){
        $('#accountOwnerId'+i).css('text-decoration', 'none');
        $("#tabletext"+i).removeAttr("disabled");
        var GroupAmount =($("#amount").val());
        var checkedAmount =$("#tabletext"+i).val();
        var totalAmount = parseFloat(GroupAmount) + (parseFloat(checkedAmount));
        if(totalAmount < parseFloat($("#amount").val())) {
            var errorLabelMember = "Allocated amount should be less than or equal to Unallocated Amount";
            document.getElementById("errorLabel").innerText = errorLabelMember;
        }
        else{
            $("#amount").val(totalAmount);
            $("label[for='rejectCheckboxId"+i+"'] span.ui-btn-text").text("Approved");
        }
    } else {
        $("#accountOwnerId"+i).css('text-decoration', 'line-through');
        var checkedAmount = $("#tabletext"+i).val();
        var GroupAmount =($("#amount").val());
        var currentGroupAmount = GroupAmount - (checkedAmount)
        $("#amount").val(currentGroupAmount);
        $("#tabletext"+i).attr("disabled", "disabled");
        $("label[for='rejectCheckboxId"+i+"'] span.ui-btn-text").text("Rejected");
    }
}
