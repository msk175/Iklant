window.history.forward();
//global declaration of minMax Amount
var minAmountAllowed = 0;
var maxAmountAllowed = 0;
var rejectedClientAmount = 0;

$("#pageID").live('pagecreate',function() {
	 $(function() {
		$( "#disbursalDateId" ).datepicker({
			minDate: new Date('2015-04-01'),
            maxDate: new Date,
			dateFormat: 'dd-mm-yy',
			yearRange: "-1:+0",
  			changeMonth: true,
            changeYear: true
        });
	});
	
	 $(function() {
		$( "#approvalDateId" ).datepicker({
            minDate: new Date('2015-04-01'),
            maxDate: new Date,
			dateFormat: 'dd-mm-yy',
			yearRange: "-1:+0",
  			changeMonth: true,
            changeYear: true
        });
	});
	
	 $(function() {
		$( "#chequedate" ).datepicker({
			maxDate: new Date,
			dateFormat: 'yy-mm-dd',
			yearRange: "-90:+0",
  			changeMonth: true,
            changeYear: true
        });
	});
	
	$("#fees").hide();
	$("#loanAcount").hide();
	$("#formTypeLabelId").hide();
	$("#formTypeValueId").hide();
	$("#kycformid").hide();
	$("#loanformid").hide();
	$("#legalFormId").hide();
	$("#promissoryNoteId").hide();
    $("#instScheduleId").hide();
    $("#receiptFormId").hide();
	$("#dashboard").hide();
	
	$("#chequeDetailsDivId").hide();
	$("#insurancePercentageDivId").hide();
	$("#processingFeePercentageDivId").hide();
	$("#serviceTaxPercentageDivId").hide();
	$("#insurancePercentageLabelDivId").hide();
	$("#processingFeePercentageLabelDivId").hide();
	$("#serviceTaxPercentageLabelDivId").hide();
	$("#loansummary").hide();
	$("#loanamount").hide();
	

	$("#custom-li-tab").click(function(){
		$("#loanAcount").hide();
		$("#fees").hide();
		$("#individualDetails").show();
	});
	$("#custom-li-tab2").click(function(){
		$("#individualDetails").hide();
		$("#fees").hide();
		$("#loanAcount").show();
		});
	$("#custom-li-tab3").click(function(){
		$("#loanAcount").hide();
		$("#individualDetails").hide();
		$("#fees").show();
		var processingFees = ($("#amount").val()* ($("#processingFeePercentageHiddenId").val() /100));
		var applicableServiceTax = ($("#amount").val()*($("#serviceTaxPercentageHiddenId").val() /100));
		//var insurance = $("#clientIdArrayLengthId").val() * $("#insurancePercentageHiddenId").val();
		var count=0;
		for(var i=0;i<$("#clientIdArrayLengthId").val();i++){
			if($("#rejectCheckboxId"+i).is(':checked')){
				count = count+1;
			}
		}
		var insuranceTotal =  count * $("#insurancePercentageHiddenId").val();
		$("#insurancePercentageId").val(insuranceTotal);
		$("#processingFeePercentageId").val(Math.round(processingFees));
		$("#serviceTaxPercentageId").val(Math.round(applicableServiceTax));
		//$("#insurancePercentageId").val(Math.round(insurance));
	});
	$("#monthsdiv").hide();
	$("#weekDiv").hide();
	$("#week").click(function(){
		$("#monthsdiv").hide();
		$("#weekDiv").show();
		$("#day").val('');
		$("#locationmonth").val('');
	});
	
	$("#month").click(function(){
		$("#recurevery").val('');
		$("#dayListId").val('0');
		$("#location").val('');
		$("#weekDiv").hide();
		$("#monthsdiv").show();
	});
    $('#day').keyup( function() {

        var $this = $(this);
        if(($this.val() > 31) || ($this.val() < 1) || isNaN($this.val()) || $this.val().indexOf('.')!= -1) {
            $this.val('');
        }

    });
	$('#recurevery').keyup( function() {
		var $this = $(this);
		if(($this.val() > 3) || ($this.val() < 1) )
			$this.val('');			
	});
	//$("#showPdfId").hide();
	$('#formtypeId').on('change', function() {
		if($("#formtypeId").val() != 0){
			$("#showPdfId").show();
		}else if($("#formtypeId").val() == 0){
			$("#showPdfId").hide();
		}
	});
	$("#yesId").click(function(){
		$(window).scrollTop(0);
        submitLoanApplicationForm();
	});

	$("#noId").click(function(){
		document.getElementById('loanProcessCompletedId').href= "JavaScript:clientSideValidation()";
	});
	//Additional Fees
	//insurance
	$("#insuranceId").click(function(){
		if($("#insuranceId").is(':checked')){
			$("#insurancePercentageDivId").show();
			$("#insurancePercentageLabelDivId").show();
		}else {
			$("#insurancePercentageDivId").hide();
			$("#insurancePercentageLabelDivId").hide();
		}
	});
	//processing Fee
	$("#processingFeeId").click(function(){
		if($("#processingFeeId").is(':checked')){
			$("#processingFeePercentageDivId").show();
			$("#processingFeePercentageLabelDivId").show();
		}else {
			$("#processingFeePercentageDivId").hide();
			$("#processingFeePercentageLabelDivId").hide();
		}
	});
	//service tax
	$("#serviceTaxId").click(function(){
		if($("#serviceTaxId").is(':checked')){
			$("#serviceTaxPercentageDivId").show();
			$("#serviceTaxPercentageLabelDivId").show();
		}else {
			$("#serviceTaxPercentageDivId").hide();
			$("#serviceTaxPercentageLabelDivId").hide();
		}
	});

	var mobCheckBox = $("input[id=mobileNumber]");
	var landCheckBox = $("input[id=landlineNumber]");

	mobCheckBox.on("change", function (e) {
		if (e.target.checked) {
			$('#mobileNumberDiv').show();
			$('#newMobileNumber').focus();
		}
		else {
			$('#mobileNumberDiv').hide();
		}
	});

	landCheckBox.on("change", function (e) {
		if (e.target.checked) {
			$('#landLineNumberDiv').show();
			$('#newLandlineNumber').focus();
		}
		else {
			$('#landLineNumberDiv').hide();
		}
	});
	/*To Make individual tracking checkbox checked from service
		if($("#indTrackedCheckbox").val() == 1){
		//alert($("#indTrackedCheckbox").is(':checked'));
		//alert("inside checkbox validation");
		$('#individualtrackId').attr("checked", "true");
		//alert($("#individualtrackId").is(':checked'));
	}
	else{
		$("#indTrackedCheckbox").removeAttr("checked");
	}*/
    $(function() {
        $('#meetingTime').timepicker();
    });

});

function sourceOfPayment(){
	//alert("inside sourceOfPayment");
	if(document.getElementById("sourceOfPaymentId").value == 3){
		$("#chequeDetailsDivId").show();
	} else {
		$("#chequeDetailsDivId").hide();
	}
	var cashOrCheque = $("#cashOrBankId").val().split(",");
	var selectedIndex = $("select[name='sourceOfPaymentId'] option:selected").index();
	//alert($("select[name='sourceofPayment'] option:selected").index());
	//alert(cashOrCheque[selectedIndex-1]);
	if(cashOrCheque[selectedIndex-1] == 'Bank') {
		//$("#ChequeDetailId").show();
		$("#voucherNumberDiv").show();
		$("#voucherNumberValueId").text($("#voucherNumberIfBankId").val());
		$("#voucherNumberId").val($("#voucherNumberIfBankId").val());
	}
	else if(cashOrCheque[selectedIndex-1] == 'Cash'){
		$("#voucherNumberDiv").show();
		//$("#ChequeDetailId").hide();
		$("#voucherNumberValueId").text($("#voucherNumberIfCashId").val());
		$("#voucherNumberId").val($("#voucherNumberIfCashId").val());
	}
	else {
		//$("#chequeNoId").val("");
		//$("#chequeDateId").val("");
		$("#voucherNumberId").val("");
		$("#voucherNumberDiv").hide();
		//$("#ChequeDetailId").hide();
	}
}

function retrieveDetails(selectThis){
		$("#errorLabel").text('');
		$.mobile.loading('show');
		var clientNameForGroupLocal = new Array;
		loanProductId = $(selectThis).val();
		var mifosCustomerId = $("#mifosGroupId").val();
        var iklantGroupId =   $("#iklantGroupIdHiddenId").val();
		ajaxVariable = $.ajax({
            beforeSend : function() {
                $.mobile.showPageLoadingMsg();
            },
            complete: function() {
                $.mobile.hidePageLoadingMsg()
            },
            type: 'POST',
			url: 'http://'+ajaxcallip+localStorage.contextPath+'/client/ci/group/loansanction/'+mifosCustomerId+'/'+loanProductId+'/'+iklantGroupId+'/retrieveGroupInformation',
			success: function(data) {
                $("#bodyid").remove();
                var newContent = '<table id="bodyid">';
                $("#divId").append(newContent).trigger('create');
                $("#amount").val(0);
                minAmountAllowed = data.SanctionLoanHolderLocal.minAmount;
				maxAmountAllowed = data.SanctionLoanHolderLocal.maxAmount;
				$("#allowed").text(data.SanctionLoanHolderLocal.minMaxAmount);

                $("#activeClientName").val(data.activeClientName);
                $("#activeClientId").val(data.activeClientId);
                $("#meetingTime").val(data.meetingTime);
				$("#glimApplicableHiddenId").val(data.SanctionLoanHolderLocal.glimApplicable);
				$("#clientInsuredHiddenId").val(data.SanctionLoanHolderLocal.clientInsured);
				$("#clientLoanPurposeIdHiddenId").val(data.SanctionLoanHolderLocal.clientLoanPurposeId);
				$("#localeHiddenId").val(data.SanctionLoanHolderLocal.locale);
				$("#monthlyDayOfMonthOptionSelectedHiddenId").val(data.SanctionLoanHolderLocal.monthlyDayOfMonthOptionSelected);
				$("#repaymentScheduleIndependentOfCustomerMeetingHiddenId").val(data.SanctionLoanHolderLocal.repaymentScheduleIndependentOfCustomerMeeting);
				$("#digitsBeforeDecimalForInterestHiddenId").val(data.SanctionLoanHolderLocal.digitsBeforeDecimalForInterest);
				$("#digitsAfterDecimalForInterestHiddenId").val(data.SanctionLoanHolderLocal.digitsAfterDecimalForInterest);
				$("#digitsBeforeDecimalForMonetaryAmountsHiddenId").val(data.SanctionLoanHolderLocal.digitsBeforeDecimalForMonetaryAmounts);
				$("#digitsAfterDecimalForMonetaryAmountsHiddenId").val(data.SanctionLoanHolderLocal.digitsAfterDecimalForMonetaryAmounts);
				
				
				$("#minAmountAllowed").val(data.SanctionLoanHolderLocal.minAmount);
				$("#maxAmountAllowed").val(data.SanctionLoanHolderLocal.maxAmount);
				
				$("#installments").val(data.SanctionLoanHolderLocal.numberOfInstallments);
				$("#mininstallments").val(data.SanctionLoanHolderLocal.minNumberOfInstallments);
				$("#maxinstallments").val(data.SanctionLoanHolderLocal.maxNumberOfInstallments);
				$("#installmentslabel").text('Min Number Of Installments:'+ data.SanctionLoanHolderLocal.minNumberOfInstallments + ' Max Number Of Installments:' + data.SanctionLoanHolderLocal.maxNumberOfInstallments);
				
				$("#interestrate").val(data.SanctionLoanHolderLocal.interestRate);
				$("#mininterestrate").val(data.SanctionLoanHolderLocal.minAllowedInterestRate);
				$("#maxinterestrate").val(data.SanctionLoanHolderLocal.maxAllowedInterestRate);
				$("#interestratelabel").text('Min Interest Rate: '+data.SanctionLoanHolderLocal.minAllowedInterestRate + ' Max Interest Rate:' + data.SanctionLoanHolderLocal.maxAllowedInterestRate);
				
				$("#sourceOfPaymentId").val('0').selectmenu("refresh");
				document.getElementById('sourceOfPaymentId').options.length = 0;
				var combo1 = document.getElementById("sourceOfPaymentId");
				option = document.createElement("option");
				option.text = "Source Of Payment";
				option.value ="0";
				try {
					combo1.add(option, null); //Standard 
				}catch(error) {
					combo1.add(option); // IE only
				}
				for(var i=0;i<data.glcodes.glcodeId.length;i++){
					var combo = document.getElementById("sourceOfPaymentId");
					option = document.createElement("option");
					option.value = data.glcodes.glcodeId[i];
					option.text =data.glcodes.glcode[i];
					try {
						combo.add(option, null); //Standard 
					}catch(error) {
						combo.add(option); // IE only
					}
				}
				$("#voucherNumberIfBankId").val(data.SanctionLoanHolderLocal.voucherNumberIfBank);
				$("#voucherNumberIfCashId").val(data.SanctionLoanHolderLocal.voucherNumberIfCash);
				$("#cashOrBankId").val(data.glcodes.cashOrBank);
				//alert("data.feesId"+ data.SanctionLoanHolderLocal.feesId);
				//alert("data.feesName"+ data.SanctionLoanHolderLocal.feesName);
				//alert("data.isAMountOrRatio"+ data.SanctionLoanHolderLocal.isAMountOrRatio);
				//alert("data.amountOrRatio"+ data.SanctionLoanHolderLocal.amountOrRatio);
				for(var i=0;i<data.SanctionLoanHolderLocal.feesId.length;i++){
					if((data.SanctionLoanHolderLocal.isAMountOrRatio[i]) && data.SanctionLoanHolderLocal.feesId[i] == 3 ){
						$("#pflabelid").text("(" + data.SanctionLoanHolderLocal.amountOrRatio[i] + "% of Group Loan Amount)");
						$("#processingFeePercentageHiddenId").val(data.SanctionLoanHolderLocal.amountOrRatio[i]);
					}
					else if((data.SanctionLoanHolderLocal.isAMountOrRatio[i]) && data.SanctionLoanHolderLocal.feesId[i] == 1 ){
						$("#stlabelid").text("(" + data.SanctionLoanHolderLocal.amountOrRatio[i] + "% of Group Loan Amount)");
						$("#serviceTaxPercentageHiddenId").val(data.SanctionLoanHolderLocal.amountOrRatio[i]);
					}else{
						$("#insurancelabelid").text("(" + data.SanctionLoanHolderLocal.amountOrRatio[i] + "*No Of Clients)");
						$("#insurancePercentageHiddenId").val(data.SanctionLoanHolderLocal.amountOrRatio[i]);
					}
				}
				
				if(data.SanctionLoanHolderLocal.weekly){
					var $radios = $('input:radio[name=meetingschedule]');
					$radios.filter('[value=1]').prop('checked', true).checkboxradio('refresh');
					$("#recurEveryId").val(data.SanctionLoanHolderLocal.repaymentRecursEvery);
					$("#dayListId").val(data.SanctionLoanHolderLocal.repaymentDayOfWeek).selectmenu("refresh");
					$("#monthsdiv").hide();
					$("#monthOption").hide();
					$("#weekDiv").show();
					$("#day").val('');
					$("#locationmonth").val('');
				}else{
					var $radios = $('input:radio[name=meetingschedule]');
					$radios.filter('[value=2]').prop('checked', true).checkboxradio('refresh');
					$("#day").val(data.SanctionLoanHolderLocal.repaymentDayOfMonth);
					$("#recurEveryId").val('');
					$("#dayListId").val('0');
					$("#weekDiv").hide();
					$("#weekOption").hide();
					$("#monthsdiv").show();
				}
				$("#clientIdArrayLengthId").val(data.SanctionLoanHolderLocal.clientSelectForGroup.length);
				$("#membersCount").val(data.SanctionLoanHolderLocal.clientSelectForGroup.length);
				$("#clientIdArrayId").val(data.SanctionLoanHolderLocal.clientSelectForGroup);
				for (var i = 0; i < data.SanctionLoanHolderLocal.clientSelectForGroup.length; i++) {
                    clientNameForGroupLocal[i] = data.SanctionLoanHolderLocal.clientNameForGroup[i];
                    if (i == 0) {
                        var newContent = '<tr>';
                        newContent += '<th>';
                        newContent += "S. No";
                        newContent += '</th>';
                        newContent += '<th>';
                        newContent += "Rejection";
                        newContent += '</th>';
                        newContent += '<th>';
                        newContent += "Account Owner";
                        newContent += '</th>';
                        newContent += '<th>';
                        newContent += 'Amount';
                        newContent += '</th>';
                        newContent += '<th>';
                        newContent += 'KYC Update';
                        newContent += '</th>';
                        newContent += '</tr>';
                        $("#bodyid").append(newContent).trigger('create');
                    }
                    var newContent = '<tr>';
                    newContent += "<td class='center-text'>";
                    newContent += i + 1;
                    newContent += '</td>';
                    newContent += "<td class='center-text'>";
                    newContent += "<input type='checkbox' name='rejectCheckbox' id='rejectCheckboxId" + i + "' checked='checked' onclick='rejCheckbox(this," + i + ")'>";
                    newContent += "<label for='rejectCheckboxId" + i + "'>Approved</label>";
                    newContent += '</td>';
                    newContent += "<td id='accountOwnerId" + i + "' class='center-text'>";
                    newContent += data.SanctionLoanHolderLocal.clientSelectForGroup[i] + "-" + data.SanctionLoanHolderLocal.clientNameForGroup[i];
                    newContent += '</td>';
                    newContent += "<td class='center-text'>";
                    newContent += "<input type=text onkeyup='numeric(this)'  onfocusout='editedClientAmount(" + i + ")' id='tabletext" + i + "' value='0' autocomplete='off'>";
                    newContent += '</td>';
                    newContent += "<td class='center-text'>";
                    newContent += "<a href='JavaScript:updateContactDetails("+data.clientIds[i]+","+i+","+JSON.stringify(data.iklantClientNames[i])+","+JSON.stringify(data.clientMobileNumbers[i])+","+JSON.stringify(data.clientLandLineNumbers[i])+")' id='updateContact_"+[i]+"'  data-theme='b' data-inline='true' data-role='button' title='Update KYC'  data-mini='true' data-rel='popup' data-position-to='window'> Update KYC Request</a>"+
					              "<label id='labelId_"+[i]+"' class='success-message global-font-details'></label>";
                    newContent += '</td>';
                    newContent += '</tr>';
                    $("#bodyid").append(newContent).trigger('create');
                }
                $("#clientNameForGroup").val(clientNameForGroupLocal);
				document.getElementById('disbursalDateId').value = data.SanctionLoanHolderLocal.todaysDate;
				document.getElementById('approvalDateId').value = data.SanctionLoanHolderLocal.todaysDate;
				document.getElementById('grace').value = data.SanctionLoanHolderLocal.graceDuration;
				$("#loansummary").show();
				$("#loanamount").show();
				$.mobile.loading('hide');

			},
			 error : function(jqXHR, textStatus, error) {
                //alert('Error: ' + jqXHR.status );
                //alert('Error3: ' + textStatus );
                //alert('Error2: ' + error );
            }	
		});
}
function numericForInt(currentVal){
    var regex = /^[0-9]{1,2}(\.[0-9]{0,2})?$/g;
    if(regex.test(currentVal.value)) {
        currentVal.value = currentVal.value;
    }else{
        currentVal.value = "";
    }
}
function numeric(currentVal){
    var regex = /[^0-9]+/g;
    if(regex.test(currentVal.value)) {
        currentVal.value = currentVal.value.replace(regex, '')
    }
}

function rejCheckbox(value,i){
    var count = parseInt($("#membersCount").val());
    if($("#rejectCheckboxId"+i).is(':checked')){
        if($("#clientIdArrayLengthId").val() > count){
            count = +count+1;
        }
		$('#accountOwnerId'+i).css('text-decoration', 'none');
		$("#tabletext"+i).removeAttr("disabled");
		$("#tabletext"+i).val(rejectedClientAmount);
		var GroupAmount =($("#amount").val());
		$("#amount").val(parseInt(GroupAmount) + (parseInt(rejectedClientAmount)));
		//alert(parseInt(GroupAmount));
		//alert("After "+(parseInt(GroupAmount) + (parseInt(rejectedClientAmount))));
		$("label[for='rejectCheckboxId"+i+"'] span.ui-btn-text").text("Approved");
	} else {
        count = count-1;
		$("#accountOwnerId"+i).css('text-decoration', 'line-through');
		rejectedClientAmount = $("#tabletext"+i).val();
		//alert(" Amount "+rejectedClientAmount);
		var GroupAmount =($("#amount").val());
		//alert("B4 "+GroupAmount);
		var currentGroupAmount = GroupAmount - (rejectedClientAmount)
		$("#amount").val(currentGroupAmount);
		//alert("After "+(currentGroupAmount));
		$("#tabletext"+i).val('0');
		$("#tabletext"+i).attr("disabled", "disabled");
		$("label[for='rejectCheckboxId"+i+"'] span.ui-btn-text").text("Rejected");
	}
    $("#membersCount").val(count);
}
function editedClientAmount(i){
	var totalGroupAmount = 0;
    var firstClientAmt = parseInt($("#tabletext"+i).val());

    if(firstClientAmt != 0 && !!firstClientAmt){
        for(var i=0;i<$("#clientIdArrayLengthId").val();i++){
            if($("#rejectCheckboxId"+i).is(':checked')){
                $("#rejectCheckboxId"+i).attr("checked", "true").checkboxradio('refresh');
                $('#accountOwnerId'+i).css('text-decoration', 'none');
                $("#tabletext"+i).removeAttr("disabled");
                $("label[for='rejectCheckboxId"+i+"'] span.ui-btn-text").text("Approved");
                //$("#tabletext"+i).val(firstClientAmt);
                totalGroupAmount = totalGroupAmount + parseInt($("#tabletext"+i).val()) ;
                $("#amount").val(totalGroupAmount);
            }
        }
        if(totalGroupAmount < minAmountAllowed) {
            $(window).scrollTop(0);
            $("#errorLabel").text('Please enter the amount above minimum allowed range');
            for(var j=0;j<$("#clientIdArrayLengthId").val();j++){
                $("#tabletext"+j).val(0);
            }
        }else if(totalGroupAmount > maxAmountAllowed){
            $(window).scrollTop(0);
            $("#errorLabel").text('Please enter the amount below maximum allowed range');
            for(var j=0;j<$("#clientIdArrayLengthId").val();j++){
                $("#tabletext"+j).val(0);
            }
        }
        else{
            $("#errorLabel").text('');
        }
    }
    else{
        $(window).scrollTop(0);
        $("#errorLabel").text('Loan Amount must be greater than 0');
        for(var j=0;j<$("#clientIdArrayLengthId").val();j++){
            $("#tabletext"+j).val(0);
        }
        $("#amount").val(0);
    }
}

function clientSideValidation(){
    var membersCount = parseInt($("#membersCount").val());
    var specifiedInterestRate = parseInt($("#interestrate").val(),10);
    var specifiedInstallment = parseInt($("#installments").val(),10);
    var hiddenClientArrayLength = $("#clientIdArrayLengthId").val();
    var accountOwner = $("#clientNameForGroup").val().split(',');
    var clientNames = new Array();
    var startDt=convertToMifosDateFormat(document.getElementById("approvalDateId").value);
    var endDt=convertToMifosDateFormat(document.getElementById("disbursalDateId").value);
    var flag=0;
    var count=0;
    var j=0;
    for(var i=0;i<hiddenClientArrayLength;i++){
		if($("#rejectCheckboxId"+i).is(':checked')){
				if($("#tabletext"+i).val() == 0){
					flag =1;
					clientNames[j] = accountOwner[i];
					j++;
				}
			count = count+1;
		}
	}
	var insuranceTotal =  count * $("#insurancePercentageHiddenId").val();
	$("#insurancePercentageId").val(insuranceTotal);
    if(membersCount < minimumClients){
        document.getElementById("errorLabel").innerText = "Please select minimum 5 clients to proceed";
        $(window).scrollTop(0);
    }
    else if(flag==1){
		var errorLabelMember = "Please enter Loan Amount for  Clients: " +clientNames+ "";
		document.getElementById("errorLabel").innerText = errorLabelMember;
		$(window).scrollTop(0);
	}
	else if($("#amount").val() == 0){
		var errorLabelMember = "Please Enter Loan Amount";
		document.getElementById("errorLabel").innerText = errorLabelMember;
		$(window).scrollTop(0);
	}
	else if((specifiedInterestRate < $("#mininterestrate").val()) | (specifiedInterestRate > $("#maxinterestrate").val()) | (isNaN(specifiedInterestRate))) {
		var errorLabelMember = "Interest Rate should be with in specified limit";
		document.getElementById("errorLabel").innerText = errorLabelMember;
		$(window).scrollTop(0);
	}
	else if((specifiedInstallment < $("#mininstallments").val()) | (specifiedInstallment > $("#maxinstallments").val()) | (isNaN(specifiedInstallment)) ) {
		var errorLabelMember = "Number Of Installments should be with in specified limit";
		document.getElementById("errorLabel").innerText = errorLabelMember;
		$(window).scrollTop(0);
	}
	else if(endDt < startDt){
		var errorLabelMember = "Disbursal date can't fall before approval date";
		document.getElementById("errorLabel").innerText = errorLabelMember;
		$(window).scrollTop(0);
	}
	else if($("#sourceOfPaymentId").val() == 0) {
		var errorLabelMember = "Please Select Source Of Payment";
		document.getElementById("errorLabel").innerText = errorLabelMember;
		$(window).scrollTop(0);
	}
	else if($("#meetingTime").val() == "" ){
        var errorLabelMember = "Please specify the meeting time";
        document.getElementById("errorLabel").innerText = errorLabelMember;
        $(window).scrollTop(0);
    }
    else {
		$(window).scrollTop(0);
		document.getElementById('loanProcessCompletedId').href= "#loanProcessCompleted";
		$("#loanProcessCompletedId").trigger('click');
		document.getElementById("errorLabel").innerText = "";
		}
}
function submitLoanApplicationForm(){
$(window).scrollTop(0);
var hiddenClientArrayLength = $("#clientIdArrayLengthId").val();
    // for fetching activer clients
var activeClientIdValue = $("#activeClientId").val();
var activeClientIdListArray = activeClientIdValue.split(",");
var activeClientNameValue = $("#activeClientName").val();
var activeClientNameListArray = activeClientNameValue.split(",");
var clientNameForGroupValue = $("#clientNameForGroup").val();
var accountOwner = clientNameForGroupValue.split(',');
var rejected_member = new Array();

var selectedClients = new Array();
var selectedMember = new Array();
var clientAmount = new Array();
var clientStatus = new Array();
var totalClientListArray = new Array();
var clientsListHidden = $("#clientIdArrayId").val();
totalClientListArray = clientsListHidden.split(",");
var index = 0;
var rejected_index = 0;
//alert("totalClientListArray" + totalClientListArray);
for(var i=0;i<hiddenClientArrayLength;i++){
	//if($("#rejectCheckboxId"+i).is(':checked')){
		var sa = $("#rejectCheckboxId"+i).is(':checked');
		selectedClients[i] = totalClientListArray[i];
        if(sa == true){
            selectedMember[index] = activeClientIdListArray[i];
            index++;
        }else if(sa == false){
            rejected_member[rejected_index] =activeClientIdListArray[i];
            rejected_index++;
        }

		clientAmount[i] = $("#tabletext"+i).val();
		clientStatus[i] = sa;
		//alert("clientStatus[i]" + clientStatus[i]);
	//}
}
	$("#clientSelectedId").val(selectedClients);
    $("#selectedMemberIdArray").val(selectedMember);
	$("#amountSanctionedId").val(clientAmount);
	$("#clientStatusId").val(clientStatus);


	var data ={};
	data.mifosGroupId = $("#mifosGroupId").val();
    data.iklantGroupId = $("#iklantGroupId").val();
	data.prdname 	  =	$("#prdname").val();
	data.amount		  = $("#amount").val();
	data.minAmountAllowed = $("#minAmountAllowed").val();
	data.maxAmountAllowed = $("#maxAmountAllowed").val();
	//data.individualtrack  = $("#individualtrackId").is(':checked');
    data.individualtrack  = true;
	data.glimApplicableHiddenName =  $("#glimApplicableHiddenId").val();
	data.clientInsuredHiddenName =  $("#clientInsuredHiddenId").val();
	data.clientLoanPurposeIdHiddenName =  $("#clientLoanPurposeIdHiddenId").val();
	data.localeHiddenName =   $("#localeHiddenId").val();
	data.monthlyDayOfMonthOptionSelectedHiddenName =  $("#monthlyDayOfMonthOptionSelectedHiddenId").val();
	data.repaymentScheduleIndependentOfCustomerMeetingHiddenName =  $("#repaymentScheduleIndependentOfCustomerMeetingHiddenId").val();
	data.digitsBeforeDecimalForInterestHiddenName =  $("#digitsBeforeDecimalForInterestHiddenId").val();
	data.digitsAfterDecimalForInterestHiddenName =  $("#digitsAfterDecimalForInterestHiddenId").val();
	data.digitsBeforeDecimalForMonetaryAmountsHiddenName =   $("#digitsBeforeDecimalForMonetaryAmountsHiddenId").val();
	data.digitsAfterDecimalForMonetaryAmountsHiddenName  =  $("#digitsAfterDecimalForMonetaryAmountsHiddenId").val();
	data.clientSelected	  =	$("#clientSelectedId").val();
	data.amountSanctioned =	$("#amountSanctionedId").val();
	data.clientStatus	  =	$("#clientStatusId").val();
	data.approvalDate	  =	$("#approvalDateId").val();
	data.disbursalDate	  =	$("#disbursalDateId").val();
	data.sourceOfPaymentId=	$("#sourceOfPaymentId").val();
	data.interestrate	  =	$("#interestrate").val();
	data.mininterestrate  =	$("#mininterestrate").val();
	data.maxinterestrate  = $("#maxinterestrate").val();
	data.installments 	  =	$("#installments").val();
	data.mininstallments  =	$("#mininstallments").val();
	data.maxinstallments  =	$("#maxinstallments").val();
	data.meetingschedule  =	$('.meeting:checked').val();
	data.recurEvery		  =	$("#recurEveryId").val();
	data.dayListId		  =	$("#dayListId").val();
	data.day			  =	$("#day").val();
	data.graceperiod	  =	$("#graceperiod").is(':checked');
	data.grace			  =	$("#grace").val();
	data.processingFee	 =	$("#processingFeeId").is(':checked');
	data.processingFeePercentage = $("#processingFeePercentageHiddenId").val();
	data.serviceTax		=  $("#serviceTaxId").is(':checked');
	data.serviceTaxPercentage = $("#serviceTaxPercentageHiddenId").val();
	data.insurance = $("#insuranceId").is(':checked');
	data.insurancePercentage = $("#insurancePercentageId").val();
	data.voucherNumber = $("#voucherNumberId").val();
	data.rejected_member  = rejected_member;
    data.meetingTime = $("#meetingTime").val();
    data.groupName = $("#centerNameIdHidden").val();
    data.clientNames = $("#clientNameForGroup").val();

	$.ajax({
		beforeSend : function() { 
			$.mobile.showPageLoadingMsg(); 
		},
		complete: function() { 
			$.mobile.hidePageLoadingMsg() 
		},
			type  : 'POST',
			data  : JSON.stringify(data),
			async :false,
			contentType: 'application/json',
			url: 'http://'+ajaxcallip+localStorage.contextPath+'/client/ci/loanOffering/',
			success: function(success) {
				//$("#errorLabel").text(data.error);
				if(success.status == "success"){
					$("#successmessage").text("Loan Disbursed Succesfully");
					$("#globalAccountNumberHiddenId").val(success.globalAccountNum);
                    $( "#loadingPopup" ).popup( "close" );
					$("#loansummary").hide();
					$("#loanamount").hide();
					$("#verifyDocId").hide();
					$("#formTypeLabelId").show();
					$("#formTypeValueId").show();
					$('#prdname').attr("disabled", true); 
					document.getElementById("errorLabel").innerText = "";
					$("#dashboard").show();
				}else if(success.status == "failure"){
					 //$("#errorfields").text(success.error);	
					 $("#loanProcessCompletedId").show();
					$("#errorLabel").text(success.error);
				}
				else if(success.status == "runtime"){
					showPageExpired();
				}
			},error : function(jqXHR, textStatus, error) {
				
            }	
		});

}

function generatePDF() {
	var prdcategoryid = $('#prdname').val();
	var formType = $('#formtypeId').val();
	var mifosCustomerId = $('#mifosGroupId').val();
	var mifosGlobalAccNo = document.getElementById("globalAccountNumberHiddenId").value;
    var disbDate = $('#disbursalDateId').val();
    var disbAmount = $('#amount').val();
    var interestRateValue = $('#interestrate').val();
    var recurrenceType;
    var selectedMemberId = $('#selectedMemberIdArray').val();
    if($('.meeting:checked').val() == 1){
        recurrenceType = "Week(s)";
    }else{
        recurrenceType = "Month(s)";
    }
	if(formType == 1){
		document.getElementById("errorLabel").innerText = "";
		$("#kycformid").show();
		$("#loanformid").hide();
		$("#legalFormId").hide();
		$("#promissoryNoteId").hide();
        $("#instScheduleId").hide();
        $("#receiptFormId").hide();
	}else if(formType == 2){
		document.getElementById("errorLabel").innerText = "";
		$("#loanformid").show();
		$("#kycformid").hide();
		$("#legalFormId").hide();
		$("#promissoryNoteId").hide();
        $("#instScheduleId").hide();
        $("#receiptFormId").hide();
	}else if(formType == 3){
		$("#loanformid").hide();
		$("#kycformid").hide();
		$("#legalFormId").show();
		$("#promissoryNoteId").hide();
        $("#instScheduleId").hide();
        $("#receiptFormId").hide();
	}else if(formType == 4){
		$("#loanformid").hide();
		$("#kycformid").hide();
		$("#legalFormId").hide();
		$("#promissoryNoteId").show();
        $("#instScheduleId").hide();
        $("#receiptFormId").hide();
	}else if(formType == 5){
        $("#loanformid").hide();
        $("#kycformid").hide();
        $("#legalFormId").hide();
        $("#promissoryNoteId").hide();
        $("#instScheduleId").show();
        $("#receiptFormId").hide();
	}else if(formType == 6){
        $("#loanformid").hide();
        $("#kycformid").hide();
        $("#legalFormId").hide();
        $("#promissoryNoteId").hide();
        $("#instScheduleId").hide();
        $("#receiptFormId").show();
    }
	if(formType != 0){
		var data ={};
		data.prdcategoryid = prdcategoryid;
		data.formType = formType;
		data.mifosCustomerId = mifosCustomerId;
		data.mifosGlobalAccNo = mifosGlobalAccNo;
        data.disbDate = disbDate;
        data.disbAmount = disbAmount;
        data.interestRateValue = interestRateValue;
        data.recurrenceType = recurrenceType;
        data.selectedMemberId = selectedMemberId;
		$.ajax({
				type  : 'POST',
				data  : JSON.stringify(data),
				async :false,
				contentType: 'application/json',
				url: 'http://'+ajaxcallip+localStorage.contextPath+'/client/ci/groups/member/loansanction/downloadPDF',
				success: function(success) {
					//alert("success" + success.path);
				},error : function(jqXHR, textStatus, error) {
					
				}	
			});
	}else{
		var errorLabelMember = "Please Select Form Type";
		document.getElementById("errorLabel").innerText = errorLabelMember;
		$(window).scrollTop(0);
	}
		
}

function goToRepaymentSchedule(){
	//var globalAccountNum = $("#globalAccountNumberHiddenId").val();
    $.mobile.showPageLoadingMsg();
	var globalCustomerNum = $("#mifosGlobalId").val();
	document.getElementById("BMFormId").method='POST';
	document.getElementById("BMFormId").action=localStorage.contextPath+"/client/ci/loanrecovery/groups/"+globalCustomerNum+"/loanaccounts";
	document.getElementById("BMFormId").submit();
}
function showPageExpired(){
    $.mobile.showPageLoadingMsg();
	document.getElementById("BMFormId").method='POST';
	document.getElementById("BMFormId").action=localStorage.contextPath+"/client/ci/showErrorPage";
	document.getElementById("BMFormId").submit();
}

function convertToMifosDateFormat(date) {
	var dateInArray = date.split("-");
	return dateInArray[2]+"-"+dateInArray[1]+"-"+dateInArray[0];
}
function docVerification(){
    $.mobile.showPageLoadingMsg();
	//alert("sdfsf"+document.getElementById("iklantGroupIdHiddenId").value);
	document.getElementById("BMFormId").method='POST';
	document.getElementById("BMFormId").action=localStorage.contextPath+"/client/ci/groups/member/docVerification";
	document.getElementById("BMFormId").submit();
}
/**
 *  preview the EMI date for the given preference day and start date.
 */
function previewEMIdate(updateFor) {
    var fId = document.getElementById("firstInstallmentDateId")
    fId.innerHTML = "";
    fId.style.color ="";
    var recurrenceDay = document.getElementById("day").value;
    var disbursalDate = document.getElementById("disbursalDateId").value;       // 22-01-2014
    var mifosCustomerId = $("#mifosGroupId").val();

    if(typeof recurrenceDay == 'undefined' || recurrenceDay == ''){
        document.getElementById("errorLabel").innerHTML = "Please enter the frequency of meeting day";
		$(window).scrollTop(0);
    } else {
        $.mobile.showPageLoadingMsg();
        document.getElementById("errorLabel").innerHTML = "";
        var data ={};
        data.recurrenceDay = recurrenceDay;
        data.disbursalDate = disbursalDate;
        data.mifosCustomerId = mifosCustomerId;
        ajaxVariable = $.ajax({
            type: 'POST',
            data: JSON.stringify(data),
            url: 'http://'+ajaxcallip+localStorage.contextPath+'/client/ci/group/loansanction/previewDateEMI',
            async :false,
            contentType: 'application/json',
            success: function(successData) {
                $.mobile.hidePageLoadingMsg()
                if(successData.status == 'success' && updateFor == undefined) {
                    document.getElementById("firstInstallmentDateId").innerHTML = "   First installment date:  "+successData.firstInstallmentDate;
					document.getElementById("firstInstallmentDateId").style.color = "black";
					document.getElementById("firstInstallmentDateId").style.fontWeight = "bold";
                } else if(successData.status == 'success' && updateFor == 'finYear') {
                    $("#voucherNumberIfBankId").val(successData.loanSanctionDetails.voucherNumberIfBank);
                    $("#voucherNumberIfCashId").val(successData.loanSanctionDetails.voucherNumberIfCash);
                    sourceOfPayment();
                } else {
                    var fId = document.getElementById("firstInstallmentDateId");
                    fId.innerHTML = successData.message.fontcolor("red");
                }


                /*$("#bodyid").remove();
                var newContent = '<table id="bodyid">';
                $("#divId").append(newContent).trigger('create');
                $("#amount").val(0);
                minAmountAllowed = data.SanctionLoanHolderLocal.minAmount;
                maxAmountAllowed = data.SanctionLoanHolderLocal.maxAmount;
                $("#allowed").text(data.SanctionLoanHolderLocal.minMaxAmount);

                $("#activeClientName").val(data.activeClientName);*/

            },
            error : function(jqXHR, textStatus, error) {
                $.mobile.hidePageLoadingMsg()
                var fId = document.getElementById("firstInstallmentDateId");
                fId.innerHTML = "Connection problem".fontcolor("red");

                //alert('Error: ' + jqXHR.status );
                //alert('Error3: ' + textStatus );
                //alert('Error2: ' + error );
            }
        });
    }
}
function checkFinYear(disbursalDate) {
    var disbDate = $(disbursalDate).val();
    var disbFinYear = getFinancialYear(disbDate);
    var voucherNumber = $("#voucherNumberIfCashId").val();   
    var currentFinYear = voucherNumber.substr(2,8);
    if(currentFinYear != disbFinYear) {
        console.log("AJAX request");
        previewEMIdate("finYear");

    }
}


function getFinancialYear(dateParam) {
    //var dateParam = "22-01-2014";
    var dateChunks = dateParam.split("-");
    var txnMonth= Number(dateChunks [1]);
    var txnYear = Number(dateChunks [2]);
    var finYear ="";

    if(txnMonth>3){
        finYear = finYear.concat(txnYear,(txnYear+1));
    } else if(txnMonth<=3) {
        finYear = finYear.concat((txnYear-1),(txnYear));
    }
    return finYear;
}
