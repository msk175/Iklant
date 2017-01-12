var groupOutstandingBalancecurrentrow = 0;
var groupOutstandingBalancemaxrows = 0;
var groupOutstandingBalancePageNo = 1;

var groupInstallmentpaidcurrentrow = 0;
var groupInstallmentpaidmaxrows = 0;
var groupInstallmentpaidPageNo = 1;

var groupInstallmentDuecurrentrow = 0;
var groupInstallmentDuemaxrows = 0;
var groupInstallmentDuePageNo = 1;

var groupFutureInstallmentcurrentrow = 0;
var groupFutureInstallmentDuemaxrows = 0;
var groupFutureInstallmentPageNo = 1;


var clientDetailcurrentrow = 0;
var clientDetailmaxrows = 0;
var clientDetailPageNo = 1;

var clientInstallmentpaidcurrentrow = 0;
var clientInstallmentpaidmaxrows = 0;
var clientInstallmentpaidPageNo = 1;

var clientInstallmentsDuecurrentrow = 0;
var clientInstallmentsDuemaxrows = 0;
var clientInstallmentsDuePageNo = 1;

var clientFutureInstallmentcurrentrow = 0;
var clientFutureInstallmentmaxrows = 0;
var clientFutureInstallmentPageNo = 1;

var recentOutstandingBalanceDetailcurrentrow = 0;
var recentOutstandingBalanceDetailDuemaxrows = 0;
var recentOutstandingBalanceDetailPageNo = 1;

var viewAllAccountActivityDetailcurrentrow = 0;
var viewAllAccountActivityDetailDuemaxrows = 0;
var viewAllAccountActivityDetailPageNo = 1;

//var lastClientViewIndex = 0;
$(document).ready(function() {

	if($('#roleIdHidden').val() == bmRoleId || $('#roleIdHidden').val() == smhRoleId || $('#roleIdHidden').val() == naiveRoleId) {
		$('#sourceOfPaymentDiv').hide();
		$('#relaxValidationDiv').hide();
		$('#save').hide();
		$('#save1').hide();
	}
	
	var noOfClients = $("#noOfClientHiddenId").val();
	
	//Main Tab Navigation
	$("#groupRepaymentSchedule").hide();
	$("#clientRepaymentSchedule").hide();
	$("#recentActivity").hide();
	
	
	$("#custom-li-mainTab1").click(function(){
		$("#loanSummary").show();
		$("#groupRepaymentSchedule").hide();
		$("#clientRepaymentSchedule").hide();
		$("#recentActivity").hide();
	});
	$("#custom-li-mainTab2").click(function(){
		$("#custom-li-subGroupTab1").addClass("ui-btn-active");
		$("#custom-li-subGroupTab2").removeClass("ui-btn-active");
		$("#custom-li-subGroupTab3").removeClass("ui-btn-active");
		$("#custom-li-subGroupTab4").removeClass("ui-btn-active");
		$("#groupRepaymentSchedule").show();
		//$("#outstandingBalanceGroupId").show();
		$("#paginationDivGroupId").hide();
		$("#installmentsDueGroupId").hide();
		$("#installmentsPaidGroupId").show();
		$("#futureInstallmentsGroupId").hide();
		$("#loanSummary").hide();
		$("#clientRepaymentSchedule").hide();
		$("#recentActivity").hide();
		
		groupOutstandingBalancecurrentrow = 0;
		groupOutstandingBalancemaxrows = $("#groupOutstandingBalanceTableId tr").length-1;
		
		$("#groupOutstandingBalancePrevId").hide();
		$("#groupOutstandingBalanceNextId").show();
		$('#groupOutstandingBalanceTableId tr.showhide').hide();
		for(var i =0 ; i<5; i++) {
			if (groupOutstandingBalancecurrentrow < groupOutstandingBalancemaxrows) {
			   $('#groupOutstandingBalanceTableId tr.showhide:eq(' + groupOutstandingBalancecurrentrow  + ')').show();
			   groupOutstandingBalancecurrentrow++;
			}
		}
		groupOutstandingBalancePageNo = 1;
		var $btn_text  = $('#groupOutstandingBalancePageNoId').find('.ui-btn-text')
		$btn_text.text("Records "+groupOutstandingBalancePageNo+" - "+groupOutstandingBalancecurrentrow+" of "+groupOutstandingBalancemaxrows);
		
	});
	$("#custom-li-mainTab3").click(function(){
		$("#custom-li-subClientTab1").addClass("ui-btn-active");
		$("#custom-li-subClientTab2").removeClass("ui-btn-active");
		$("#custom-li-subClientTab3").removeClass("ui-btn-active");
		
		$("#clientRepaymentSchedule").show();
		$("#paginationDivClientId").show();
		$("#clientAccountDetailsId").show();
		$("#loanSummary").hide();
		$("#groupRepaymentSchedule").hide();
		$("#recentActivity").hide();
		$("#PaidInstallmentClientId").hide();
		$("#installmentsDueClientId").hide();
		$("#futureInstallmentsClientId").hide();
		$("#subClientNavbarId").hide();
		//$("#dueInstallmentTableId"+lastClientViewIndex).hide();
		//alert(lastClientViewIndex);
		
		
		clientDetailcurrentrow = 0;
		clientDetailmaxrows = $("#clientDetailTableId tr").length-1;
		$("#clientDetailPrevId").hide();
		$("#clientDetailNextId").show();
		$('#clientDetailTableId tr.showhide').hide();
		for(var i =0 ; i<5; i++) {
			if (clientDetailcurrentrow < clientDetailmaxrows) {
			   $('#clientDetailTableId tr.showhide:eq(' + clientDetailcurrentrow  + ')').show();
			   clientDetailcurrentrow++;
			}
		}
		clientDetailPageNo = 1;
		var $btn_text  = $('#clientDetailPageNoId').find('.ui-btn-text')
		$btn_text.text("Records "+clientDetailPageNo+" - "+clientDetailcurrentrow+" of "+noOfClients);
		
	});
	$("#custom-li-mainTab4").click(function(){
		$("#custom-li-subRecentTab1").addClass("ui-btn-active");
		$("#custom-li-subRecentTab2").removeClass("ui-btn-active");
	
		$("#recentActivity").show();
		$("#paginationDivRecentId").hide();
		$("#loanSummary").hide();
		$("#groupRepaymentSchedule").hide();
		$("#clientRepaymentSchedule").hide();
		$("#outstandingBalanceRecentId").hide();
		$("#allAccountActivityId").hide();
		$("#subRecentNavbarId").hide();
		$("#recentActivityDetailsId").show();
		
		
	});
	
	//GroupRepaymentSchedule Tab Navigation
	$("#custom-li-subGroupTab1").click(function(){
		$("#outstandingBalanceGroupId").show();
		$("#paginationDivGroupId").hide();
		$("#installmentsDueGroupId").hide();
		$("#installmentsPaidGroupId").hide();
		$("#futureInstallmentsGroupId").hide();
		$("#loanSummary").hide();
		$("#clientRepaymentSchedule").hide();
		$("#recentActivity").hide();
		
		groupOutstandingBalancecurrentrow = 0;
		groupOutstandingBalancemaxrows = $("#groupOutstandingBalanceTableId tr").length-1;
		
		$("#groupOutstandingBalancePrevId").hide();
		$("#groupOutstandingBalanceNextId").show();
		$('#groupOutstandingBalanceTableId tr.showhide').hide();
		for(var i =0 ; i<5; i++) {
			if (groupOutstandingBalancecurrentrow < groupOutstandingBalancemaxrows) {
			   $('#groupOutstandingBalanceTableId tr.showhide:eq(' + groupOutstandingBalancecurrentrow  + ')').show();
			   groupOutstandingBalancecurrentrow++;
			}
		}
		groupOutstandingBalancePageNo = 1;
		var $btn_text  = $('#groupOutstandingBalancePageNoId').find('.ui-btn-text')
		$btn_text.text("Records "+groupOutstandingBalancePageNo+" - "+groupOutstandingBalancecurrentrow+" of "+groupOutstandingBalancemaxrows);
		
		
		
	});
	$("#custom-li-subGroupTab2").click(function(){
		$("#installmentsPaidGroupId").show();
		$("#paginationDivGroupId").show();
		$("#outstandingBalanceGroupId").hide();
		$("#installmentsDueGroupId").hide();
		$("#futureInstallmentsGroupId").hide();
		$("#loanSummary").hide();
		$("#clientRepaymentSchedule").hide();
		$("#recentActivity").hide();
		
		groupInstallmentpaidcurrentrow = 0;
		groupInstallmentpaidmaxrows = $("#groupInstallmentpaidTableId tr").length-1;
		
		$("#groupInstallmentpaidPrevId").hide();
		$("#groupInstallmentpaidNextId").show();
		$('#groupInstallmentpaidTableId tr.showhide').hide();
		for(var i =0 ; i<5; i++) {
			if (groupInstallmentpaidcurrentrow < groupInstallmentpaidmaxrows) {
			   $('#groupInstallmentpaidTableId tr.showhide:eq(' + groupInstallmentpaidcurrentrow  + ')').show();
			   groupInstallmentpaidcurrentrow++;
			}
		}
		groupInstallmentpaidPageNo = 1;
		var $btn_text  = $('#groupInstallmentpaidPageNoId').find('.ui-btn-text')
		$btn_text.text("Records "+groupInstallmentpaidPageNo+" - "+groupInstallmentpaidcurrentrow+" of "+groupInstallmentpaidmaxrows);
		
	});
	$("#custom-li-subGroupTab3").click(function(){
		$("#installmentsDueGroupId").show();
		$("#paginationDivGroupId").hide();
		$("#installmentsPaidGroupId").hide();
		$("#outstandingBalanceGroupId").hide();
		$("#futureInstallmentsGroupId").hide();
		$("#loanSummary").hide();
		$("#clientRepaymentSchedule").hide();
		$("#recentActivity").hide();
		
		groupInstallmentDuecurrentrow = 0;
		groupInstallmentDuemaxrows = $("#groupInstallmentDueTableId tr").length-1;
		
		$("#groupInstallmentDuePrevId").hide();
		$("#groupInstallmentDueNextId").show();
		$('#groupInstallmentDueTableId tr.showhide').hide();
		for(var i =0 ; i<5; i++) {
			if (groupInstallmentDuecurrentrow < groupInstallmentDuemaxrows) {
			   $('#groupInstallmentDueTableId tr.showhide:eq(' + groupInstallmentDuecurrentrow  + ')').show();
			   groupInstallmentDuecurrentrow++;
			}
		}
		groupInstallmentDuePageNo = 1;
		var $btn_text  = $('#groupInstallmentDuePageNoId').find('.ui-btn-text')
		$btn_text.text("Records "+groupInstallmentDuePageNo+" - "+groupInstallmentDuecurrentrow+" of "+groupInstallmentDuemaxrows);
		
	});
	$("#custom-li-subGroupTab4").click(function(){
		
		//$('#data-table').dataTable();
		$("#futureInstallmentsGroupId").show();
		$("#paginationDivGroupId").show();
		$("#installmentsPaidGroupId").hide();
		$("#installmentsDueGroupId").hide();
		$("#outstandingBalanceGroupId").hide();
		$("#loanSummary").hide();
		$("#clientRepaymentSchedule").hide();
		$("#recentActivity").hide();
		
		groupFutureInstallmentcurrentrow = 0;
		groupFutureInstallmentmaxrows = $("#groupFutureInstallmentTableId tr").length-1;
		
		$("#groupFutureInstallmentPrevId").hide();
		$("#groupFutureInstallmentNextId").show();
		$('#groupFutureInstallmentTableId tr.showhide').hide();
		for(var i =0 ; i<5; i++) {
			if (groupFutureInstallmentcurrentrow < groupFutureInstallmentmaxrows) {
			   $('#groupFutureInstallmentTableId tr.showhide:eq(' + groupFutureInstallmentcurrentrow  + ')').show();
			   groupFutureInstallmentcurrentrow++;
			}
		}
		groupFutureInstallmentPageNo = 1;
		var $btn_text  = $('#groupFutureInstallmentPageNoId').find('.ui-btn-text')
		$btn_text.text("Records "+groupFutureInstallmentPageNo+" - "+groupFutureInstallmentcurrentrow+" of "+groupFutureInstallmentmaxrows);
		
	});
	
	//ClientRepaymentSchedule Tab Navigation
	/*$("#showClientSchedId").click(function(){
		$("#paginationDivClientId").show();
		$("#PaidInstallmentClientId").show();
		$("#installmentsDueClientId").hide();
		$("#clientAccountDetailsId").hide();
		$("#futureInstallmentsClientId").hide();
		$("#subClientNavbarId").show();
		
	});*/
	$("#custom-li-subClientTab1").click(function(){
		$("#PaidInstallmentClientId").show();
		$("#installmentsDueClientId").hide();
		$("#paginationDivClientId").show();
		$("#futureInstallmentsClientId").hide();
		$("#loanSummary").hide();
		$("#groupRepaymentSchedule").hide();
		$("#recentActivity").hide();
		
		
	});
	$("#custom-li-subClientTab2").click(function(){
        $("#clientInstallmentDueTableId").remove();
        var newContent = '<table id="clientInstallmentDueTableId">';
		$("#InstallmentsDueTableId").append(newContent).trigger('create'); 
		var newContent ='<tr>';
            newContent+='<th>';
            newContent+= "&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;S. No&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;";
            newContent+='</th>';
            newContent+='<th>';
            newContent+= "&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Due Date&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;";
            newContent+='</th>';
            newContent+='<th>';
            newContent+= "&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Date Paid&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;";
            newContent+='</th>';
            newContent+='<th>';
            newContent+='&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Principal&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;';
            newContent+='</th>';
            newContent+='<th>';
            newContent+='&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Interest&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;';
            newContent+='</th>';
            newContent+='<th>';
            newContent+='&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Fees&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;';
            newContent+='</th>';
            newContent+='<th>';
            newContent+='&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Penalty&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;';
            newContent+='</th>';
            newContent+='<th>';
            newContent+='&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Total&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;';
            newContent+='</th>';
            newContent+='</tr>';
        $("#clientInstallmentDueTableId").append(newContent).trigger('create');
		var position = $("#clientIndexHiddenId").val();
		//alert(position);
		var clientInstallmentsDueIdArray = $('#clientInstallmentsDueIdsId').val().split("*");
		var clientInstallmentsDueDueDateIdArray = $('#clientInstallmentsDueDueDateId').val().split("*");
		var clientInstallmentsDueDatePaidIdArray = $('#clientInstallmentsDueDatePaidId').val().split("*");
		var clientInstallmentsDuePrincipalArray = $('#clientInstallmentsDuePrincipalId').val().split("*");
		var clientInstallmentsDueInterestArray = $('#clientInstallmentsDueInterestId').val().split("*");
		var clientInstallmentsDueFeesArray = $('#clientInstallmentsDueFeesId').val().split("*");
		var clientInstallmentsDuePenaltyArray = $('#clientInstallmentsDuePenaltyId').val().split("*");
		var clientInstallmentsDueTotalArray = $('#clientInstallmentsDueTotalId').val().split("*");
		//alert(clientInstallmentsDueTotalArray.length);
		$(".paidMemberNameLabel").text($('#clientIdId').val().split(",")[position]+" - "+$('#clientNameId').val().split(",")[position]);
		if((clientInstallmentsDueTotalArray.length-2) >= position) {
			var clientInstallmentsDueIdArray = clientInstallmentsDueIdArray[position].replace(/^[\s,]+|[\s,]+$/g, '').split(",");
			var clientInstallmentsDueDueDateIdArray = clientInstallmentsDueDueDateIdArray[position].replace(/^[\s,]+|[\s,]+$/g, '').split(",");
			//var clientInstallmentsDueDatePaidIdArray = clientInstallmentsDueDatePaidIdArray[position].replace(/^[\s,]+|[\s,]+$/g, '').split(",");
			var clientInstallmentsDuePrincipalArray = clientInstallmentsDuePrincipalArray[position].replace(/^[\s,]+|[\s,]+$/g, '').split(",");
			var clientInstallmentsDueInterestArray = clientInstallmentsDueInterestArray[position].replace(/^[\s,]+|[\s,]+$/g, '').split(",");
			var clientInstallmentsDueFeesArray = clientInstallmentsDueFeesArray[position].replace(/^[\s,]+|[\s,]+$/g, '').split(",");
			var clientInstallmentsDuePenaltyArray = clientInstallmentsDuePenaltyArray[position].replace(/^[\s,]+|[\s,]+$/g, '').split(",");
			var clientInstallmentsDueTotalArray = clientInstallmentsDueTotalArray[position].replace(/^[\s,]+|[\s,]+$/g, '').split(",");
			//alert(clientInstallmentsDueIdArray.length);
			//alert(clientInstallmentsDueDueDateIdArray[0]);
			//alert(clientInstallmentsDueDatePaidIdArray);
			//alert(clientInstallmentsDuePrincipalArray);
			//alert(clientInstallmentsDueInterestArray);
			//alert(clientInstallmentsDueFeesArray);
			//alert(clientInstallmentsDuePenaltyArray);
			//alert(clientInstallmentsDueTotalArray);
			
			
			for(var i=0;i<clientInstallmentsDueIdArray.length;i++){
				var newContent ='<tr class="showhide">';
				newContent+='<td>';
				newContent+= clientInstallmentsDueIdArray[i];
				newContent+='</td>';
				newContent+='<td>';
				newContent+= clientInstallmentsDueDueDateIdArray[i];
				newContent+='</td>';
				newContent+='<td>';
				newContent+= "";
				newContent+='</td>';
				newContent+='<td>';
				newContent+= clientInstallmentsDuePrincipalArray[i];
				newContent+='</td>';
				newContent+='<td>';
				newContent+= clientInstallmentsDueInterestArray[i];
				newContent+='</td>';
				newContent+='<td>';
				newContent+= clientInstallmentsDueFeesArray[i];
				newContent+='</td>';
				newContent+='<td>';
				newContent+= clientInstallmentsDuePenaltyArray[i];
				newContent+='</td>';
				newContent+='<td>';
				newContent+= clientInstallmentsDueTotalArray[i];
				newContent+='</td>';
				newContent+='</tr>';
				$("#clientInstallmentDueTableId").append(newContent).trigger('create');
			}
		}
		
		clientInstallmentsDuecurrentrow = 0;
		clientInstallmentsDuemaxrows = $("#clientInstallmentDueTableId tr").length-1;
		if(clientInstallmentsDuemaxrows > 5){
			//alert("Table Lenth="+clientInstallmentsDuemaxrows)
			$("#clientInstallmentsDuePrevId").hide();
			$("#clientInstallmentsDueNextId").show();
			$('#clientInstallmentDueTableId tr.showhide').hide();
			for(var i =0 ; i<5; i++) {
				if (clientInstallmentsDuecurrentrow < clientInstallmentsDuemaxrows) {
				   $('#clientInstallmentDueTableId tr.showhide:eq(' + clientInstallmentsDuecurrentrow  + ')').show();
				   clientInstallmentsDuecurrentrow++;
				}
			}
			clientInstallmentsDuePageNo = 1;
			var $btn_text  = $('#clientInstallmentsDuePageNoId').find('.ui-btn-text')
			$btn_text.text("Records "+clientInstallmentsDuePageNo+" - "+clientInstallmentsDuecurrentrow+" of "+clientInstallmentsDuemaxrows);
			
		}
		else {
			$("#clientInstallmentsDuePrevId").hide();
			$("#clientInstallmentsDuePageNoId").hide();
			$("#clientInstallmentsDueNextId").hide();
		}
	

		$("#installmentsDueClientId").show();
		$("#futureInstallmentsClientId").hide();
		$("#PaidInstallmentClientId").hide();
		$("#paginationDivClientId").hide();
		$("#loanSummary").hide();
		$("#groupRepaymentSchedule").hide();
		$("#recentActivity").hide();
	});
	
	
	
	$("#clientInstallmentsDueNextId").click(function() {
		if(clientInstallmentsDuecurrentrow == 5){
			$("#clientInstallmentsDuePrevId").show();
		}
		//alert("next"+clientInstallmentsDuecurrentrow);
		var hidepreviousrow = clientInstallmentsDuecurrentrow;
		for(var i =0 ; i<5; i++) {
			hidepreviousrow--;
			$('#clientInstallmentDueTableId tr.showhide:eq(' + hidepreviousrow  + ')').hide();
			if (clientInstallmentsDuecurrentrow < clientInstallmentsDuemaxrows) {
				$('#clientInstallmentDueTableId tr.showhide:eq(' + clientInstallmentsDuecurrentrow  + ')').show();
				clientInstallmentsDuecurrentrow ++;
			}
		}
		if(clientInstallmentsDuecurrentrow == clientInstallmentsDuemaxrows){
			$("#clientInstallmentsDueNextId").hide();
		}
		clientInstallmentsDuePageNo = clientInstallmentsDuePageNo+5;
		var $btn_text  = $('#clientInstallmentsDuePageNoId').find('.ui-btn-text')
		$btn_text.text("Records "+clientInstallmentsDuePageNo+" - "+clientInstallmentsDuecurrentrow+" of "+clientInstallmentsDuemaxrows);    
	});
	
	$("#clientInstallmentsDuePrevId").click(function() {
		//alert("Previous");
		if(clientInstallmentsDuecurrentrow == clientInstallmentsDuemaxrows){
			$("#clientInstallmentsDueNextId").show();
		}
		
		var hidenextrow = clientInstallmentsDuecurrentrow;
		if(clientInstallmentsDuemaxrows == clientInstallmentsDuecurrentrow){
			var x = clientInstallmentsDuemaxrows % 5;
			if(x>0){
				hidenextrow = hidenextrow + (5 - x);
				clientInstallmentsDuecurrentrow = clientInstallmentsDuecurrentrow + (5 - x);   
			}
		}
		for(var i =0 ; i<5; i++) {
			hidenextrow--;
			$('#clientInstallmentDueTableId tr.showhide:eq(' + hidenextrow  + ')').hide();
			if (clientInstallmentsDuecurrentrow > 0) {
				clientInstallmentsDuecurrentrow --;
				$('#clientInstallmentDueTableId tr.showhide:eq(' + (clientInstallmentsDuecurrentrow-5)  +')').show();
				
			}   
		}
		if(clientInstallmentsDuecurrentrow == 5){
			$("#clientInstallmentsDuePrevId").hide();
		}
		clientInstallmentsDuePageNo = clientInstallmentsDuePageNo - 5;
		var $btn_text  = $('#clientInstallmentsDuePageNoId').find('.ui-btn-text')
		$btn_text.text("Records "+clientInstallmentsDuePageNo+" - "+clientInstallmentsDuecurrentrow+" of "+clientInstallmentsDuemaxrows);  
		
	});
	
	
	
	$("#custom-li-subClientTab3").click(function(){
	
		$("#clientFutureInstallmentTableId").remove();
		var newContent = '<table id="clientFutureInstallmentTableId">';
		$("#futureInstallmentTableId").append(newContent).trigger('create'); 
		var newContent ='<tr>';
            newContent+='<th>';
            newContent+= "&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;S. No&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;";
            newContent+='</th>';
            newContent+='<th>';
            newContent+= "&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Due Date&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;";
            newContent+='</th>';
            newContent+='<th>';
            newContent+= "&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Date Paid&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;";
            newContent+='</th>';
            newContent+='<th>';
            newContent+='&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Principal&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;';
            newContent+='</th>';
            newContent+='<th>';
            newContent+='&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Interest&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;';
            newContent+='</th>';
            newContent+='<th>';
            newContent+='&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Fees&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;';
            newContent+='</th>';
            newContent+='<th>';
            newContent+='&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Penalty&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;';
            newContent+='</th>';
            newContent+='<th>';
            newContent+='&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Total&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;';
            newContent+='</th>';
            newContent+='</tr>';
		$("#clientFutureInstallmentTableId").append(newContent).trigger('create');
		var position = $("#clientIndexHiddenId").val();
		//alert(position);
		var clientFutureInstallmentIdArray = $('#clientFutureInstallmentIdsId').val().split("*");
		var clientFutureInstallmentDueDateIdArray = $('#clientFutureInstallmentDueDateId').val().split("*");
		var clientFutureInstallmentDatePaidIdArray = $('#clientFutureInstallmentDatePaidId').val().split("*");
		var clientFutureInstallmentPrincipalArray = $('#clientFutureInstallmentPrincipalId').val().split("*");
		var clientFutureInstallmentInterestArray = $('#clientFutureInstallmentInterestId').val().split("*");
		var clientFutureInstallmentFeesArray = $('#clientFutureInstallmentFeesId').val().split("*");
		var clientFutureInstallmentPenaltyArray = $('#clientFutureInstallmentPenaltyId').val().split("*");
		var clientFutureInstallmentTotalArray = $('#clientFutureInstallmentTotalId').val().split("*");
		//alert(clientFutureInstallmentTotalArray.length);
		$(".futureMemberNameLabel").text($('#clientIdId').val().split(",")[position]+" - "+$('#clientNameId').val().split(",")[position]);
		if((clientFutureInstallmentTotalArray.length-2) >= position) {
			var clientFutureInstallmentIdArray = clientFutureInstallmentIdArray[position].replace(/^[\s,]+|[\s,]+$/g, '').split(",");
			var clientFutureInstallmentDueDateIdArray = clientFutureInstallmentDueDateIdArray[position].replace(/^[\s,]+|[\s,]+$/g, '').split(",");
			//var clientFutureInstallmentDatePaidIdArray = clientFutureInstallmentDatePaidIdArray[position].replace(/^[\s,]+|[\s,]+$/g, '').split(",");
			var clientFutureInstallmentPrincipalArray = clientFutureInstallmentPrincipalArray[position].replace(/^[\s,]+|[\s,]+$/g, '').split(",");
			var clientFutureInstallmentInterestArray = clientFutureInstallmentInterestArray[position].replace(/^[\s,]+|[\s,]+$/g, '').split(",");
			var clientFutureInstallmentFeesArray = clientFutureInstallmentFeesArray[position].replace(/^[\s,]+|[\s,]+$/g, '').split(",");
			var clientFutureInstallmentPenaltyArray = clientFutureInstallmentPenaltyArray[position].replace(/^[\s,]+|[\s,]+$/g, '').split(",");
			var clientFutureInstallmentTotalArray = clientFutureInstallmentTotalArray[position].replace(/^[\s,]+|[\s,]+$/g, '').split(",");
			//alert(clientFutureInstallmentIdArray.length);
			//alert(clientFutureInstallmentDueDateIdArray[0]);
			//alert(clientFutureInstallmentDatePaidIdArray);
			//alert(clientFutureInstallmentPrincipalArray);
			//alert(clientFutureInstallmentInterestArray);
			//alert(clientFutureInstallmentFeesArray);
			//alert(clientFutureInstallmentPenaltyArray);
			//alert(clientFutureInstallmentTotalArray);
			
			
			for(var i=0;i<clientFutureInstallmentIdArray.length;i++){
				var newContent ='<tr class="showhide">';
				newContent+='<td>';
				newContent+= clientFutureInstallmentIdArray[i];
				newContent+='</td>';
				newContent+='<td>';
				newContent+= clientFutureInstallmentDueDateIdArray[i];
				newContent+='</td>';
				newContent+='<td>';
				newContent+= "";
				newContent+='</td>';
				newContent+='<td>';
				newContent+= clientFutureInstallmentPrincipalArray[i];
				newContent+='</td>';
				newContent+='<td>';
				newContent+= clientFutureInstallmentInterestArray[i];
				newContent+='</td>';
				newContent+='<td>';
				newContent+= clientFutureInstallmentFeesArray[i];
				newContent+='</td>';
				newContent+='<td>';
				newContent+= clientFutureInstallmentPenaltyArray[i];
				newContent+='</td>';
				newContent+='<td>';
				newContent+= clientFutureInstallmentTotalArray[i];
				newContent+='</td>';
				newContent+='</tr>';
				$("#clientFutureInstallmentTableId").append(newContent).trigger('create');
			}
		}
		
		clientFutureInstallmentcurrentrow = 0;
		clientFutureInstallmentmaxrows = $("#clientFutureInstallmentTableId tr").length-1;
		if(clientFutureInstallmentmaxrows > 5){
			//alert("Table Lenth="+clientFutureInstallmentmaxrows)
			$("#clientFutureInstallmentPrevId").hide();
			$("#clientFutureInstallmentNextId").show();
			$('#clientFutureInstallmentTableId tr.showhide').hide();
			for(var i =0 ; i<5; i++) {
				if (clientFutureInstallmentcurrentrow < clientFutureInstallmentmaxrows) {
				   $('#clientFutureInstallmentTableId tr.showhide:eq(' + clientFutureInstallmentcurrentrow  + ')').show();
				   clientFutureInstallmentcurrentrow++;
				}
			}
			clientFutureInstallmentPageNo = 1;
			var $btn_text  = $('#clientFutureInstallmentPageNoId').find('.ui-btn-text')
			$btn_text.text("Records "+clientFutureInstallmentPageNo+" - "+clientFutureInstallmentcurrentrow+" of "+clientFutureInstallmentmaxrows);
			
		}
		else {
			$("#clientFutureInstallmentPrevId").hide();
			$("#clientFutureInstallmentPageNoId").hide();
			$("#clientFutureInstallmentNextId").hide();
		}
	
	
		$("#futureInstallmentsClientId").show();
		$("#PaidInstallmentClientId").hide();
		$("#installmentsDueClientId").hide();
		$("#paginationDivClientId").show();
		$("#loanSummary").hide();
		$("#groupRepaymentSchedule").hide();
		$("#recentActivity").hide();
	});
	
	$("#clientFutureInstallmentNextId").click(function() {
		if(clientFutureInstallmentcurrentrow == 5){
			$("#clientFutureInstallmentPrevId").show();
		}
		//alert("next"+clientFutureInstallmentcurrentrow);
		var hidepreviousrow = clientFutureInstallmentcurrentrow;
		for(var i =0 ; i<5; i++) {
			hidepreviousrow--;
			$('#clientFutureInstallmentTableId tr.showhide:eq(' + hidepreviousrow  + ')').hide();
			if (clientFutureInstallmentcurrentrow < clientFutureInstallmentmaxrows) {
				$('#clientFutureInstallmentTableId tr.showhide:eq(' + clientFutureInstallmentcurrentrow  + ')').show();
				clientFutureInstallmentcurrentrow ++;
			}
		}
		if(clientFutureInstallmentcurrentrow == clientFutureInstallmentmaxrows){
			$("#clientFutureInstallmentNextId").hide();
		}
		clientFutureInstallmentPageNo = clientFutureInstallmentPageNo+5;
		var $btn_text  = $('#clientFutureInstallmentPageNoId').find('.ui-btn-text')
		$btn_text.text("Records "+clientFutureInstallmentPageNo+" - "+clientFutureInstallmentcurrentrow+" of "+clientFutureInstallmentmaxrows);    
	});
	
	$("#clientFutureInstallmentPrevId").click(function() {
		//alert("Previous");
		if(clientFutureInstallmentcurrentrow == clientFutureInstallmentmaxrows){
			$("#clientFutureInstallmentNextId").show();
		}
		
		var hidenextrow = clientFutureInstallmentcurrentrow;
		if(clientFutureInstallmentmaxrows == clientFutureInstallmentcurrentrow){
			var x = clientFutureInstallmentmaxrows % 5;
			if(x>0){
				hidenextrow = hidenextrow + (5 - x);
				clientFutureInstallmentcurrentrow = clientFutureInstallmentcurrentrow + (5 - x);   
			}
		}
		for(var i =0 ; i<5; i++) {
			hidenextrow--;
			$('#clientFutureInstallmentTableId tr.showhide:eq(' + hidenextrow  + ')').hide();
			if (clientFutureInstallmentcurrentrow > 0) {
				clientFutureInstallmentcurrentrow --;
				$('#clientFutureInstallmentTableId tr.showhide:eq(' + (clientFutureInstallmentcurrentrow-5)  +')').show();
				
			}   
		}
		if(clientFutureInstallmentcurrentrow == 5){
			$("#clientFutureInstallmentPrevId").hide();
		}
		clientFutureInstallmentPageNo = clientFutureInstallmentPageNo - 5;
		var $btn_text  = $('#clientFutureInstallmentPageNoId').find('.ui-btn-text')
		$btn_text.text("Records "+clientFutureInstallmentPageNo+" - "+clientFutureInstallmentcurrentrow+" of "+clientFutureInstallmentmaxrows);  
		
	});

	//Recent Activity tab navigation
	$("#viewAccActivityId").click(function(){
		$("#outstandingBalanceRecentId").show();
		$("#allAccountActivityId").hide();
		$("#recentActivityDetailsId").hide();
		$("#subRecentNavbarId").show();
		
		recentOutstandingBalanceDetailcurrentrow = 0;
		recentOutstandingBalanceDetailmaxrows = $("#recentOutstandingBalanceDetailTableId tr").length-1;
		$("#recentOutstandingBalanceDetailPrevId").hide();
		$("#recentOutstandingBalanceDetailNextId").show();
		$('#recentOutstandingBalanceDetailTableId tr.showhide').hide();
		for(var i =0 ; i<5; i++) {
			if (recentOutstandingBalanceDetailcurrentrow < recentOutstandingBalanceDetailmaxrows) {
			   $('#recentOutstandingBalanceDetailTableId tr.showhide:eq(' + recentOutstandingBalanceDetailcurrentrow  + ')').show();
			   recentOutstandingBalanceDetailcurrentrow++;
			}
		}
		recentOutstandingBalanceDetailPageNo = 1;
		var $btn_text  = $('#recentOutstandingBalanceDetailPageNoId').find('.ui-btn-text')
		$btn_text.text("Records "+recentOutstandingBalanceDetailPageNo+" - "+recentOutstandingBalanceDetailcurrentrow+" of "+recentOutstandingBalanceDetailmaxrows);

		
	});
	$("#custom-li-subRecentTab1").click(function(){
		$("#outstandingBalanceRecentId").show();
		$("#allAccountActivityId").hide();
		$("#paginationDivRecentId").hide();
		$("#loanSummary").hide();
		$("#groupRepaymentSchedule").hide();
		$("#clientRepaymentSchedule").hide();
		
		
		recentOutstandingBalanceDetailcurrentrow = 0;
		recentOutstandingBalanceDetailmaxrows = $("#recentOutstandingBalanceDetailTableId tr").length-1;
		$("#recentOutstandingBalanceDetailPrevId").hide();
		$("#recentOutstandingBalanceDetailNextId").show();
		$('#recentOutstandingBalanceDetailTableId tr.showhide').hide();
		for(var i =0 ; i<5; i++) {
			if (recentOutstandingBalanceDetailcurrentrow < recentOutstandingBalanceDetailmaxrows) {
			   $('#recentOutstandingBalanceDetailTableId tr.showhide:eq(' + recentOutstandingBalanceDetailcurrentrow  + ')').show();
			   recentOutstandingBalanceDetailcurrentrow++;
			}
		}
		recentOutstandingBalanceDetailPageNo = 1;
		var $btn_text  = $('#recentOutstandingBalanceDetailPageNoId').find('.ui-btn-text')
		$btn_text.text("Records "+recentOutstandingBalanceDetailPageNo+" - "+recentOutstandingBalanceDetailcurrentrow+" of "+recentOutstandingBalanceDetailmaxrows);

		

	});
	$("#custom-li-subRecentTab2").click(function(){
		$("#outstandingBalanceRecentId").hide();
		$("#allAccountActivityId").show();
		$("#paginationDivRecentId").show();
		$("#loanSummary").hide();
		$("#groupRepaymentSchedule").hide();
		$("#clientRepaymentSchedule").hide();
		
		viewAllAccountActivityDetailcurrentrow = 0;
		viewAllAccountActivityDetailmaxrows = $("#viewAllAccountActivityDetailTableId tr").length-1;
		$("#viewAllAccountActivityDetailPrevId").hide();
		$("#viewAllAccountActivityDetailNextId").show();
		$('#viewAllAccountActivityDetailTableId tr.showhide').hide();
		for(var i =0 ; i<5; i++) {
			if (viewAllAccountActivityDetailcurrentrow < viewAllAccountActivityDetailmaxrows) {
			   $('#viewAllAccountActivityDetailTableId tr.showhide:eq(' + viewAllAccountActivityDetailcurrentrow  + ')').show();
			   viewAllAccountActivityDetailcurrentrow++;
			}
		}
		viewAllAccountActivityDetailPageNo = 1;
		var $btn_text  = $('#viewAllAccountActivityDetailPageNoId').find('.ui-btn-text')
		$btn_text.text("Records "+viewAllAccountActivityDetailPageNo+" - "+viewAllAccountActivityDetailcurrentrow+" of "+viewAllAccountActivityDetailmaxrows);

	});
	
	
	for(var i=0 ; i<noOfClients; i++) {
		$('#showClientSchedId'+i).click(function(){
			//alert(this.id);
			$("#clientPaidInstallmentTableId").remove();
			var newContent = '<table id="clientPaidInstallmentTableId">';
			$("#paidInstallmentTableId").append(newContent).trigger('create'); 
			var newContent ='<tr>';
				newContent+='<th>';
				newContent+= "&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;S. No&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;";
				newContent+='</th>';
				newContent+='<th>';
				newContent+= "&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Due Date&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;";
				newContent+='</th>';
				newContent+='<th>';
				newContent+= "&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Date Paid&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;";
				newContent+='</th>';
				newContent+='<th>';	
				newContent+='&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Principal&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;';
				newContent+='</th>';
				newContent+='<th>';	
				newContent+='&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Interest&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;';
				newContent+='</th>';
				newContent+='<th>';	
				newContent+='&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Fees&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;';
				newContent+='</th>';
				newContent+='<th>';	
				newContent+='&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Penalty&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;';
				newContent+='</th>';
				newContent+='<th>';	
				newContent+='&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Total&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;';
				newContent+='</th>';
				newContent+='</tr>';
			$("#clientPaidInstallmentTableId").append(newContent).trigger('create');
			var position = parseInt(this.id.replace( /^\D+/g, ''),10);
			//alert(position);
			var clientPaidInstallmentIdArray = $('#clientPaidInstallmentIdsId').val().split("*");
			var clientPaidInstallmentDueDateIdArray = $('#clientPaidInstallmentDueDateId').val().split("*");
			var clientPaidInstallmentDatePaidIdArray = $('#clientPaidInstallmentDatePaidId').val().split("*");
			var clientPaidInstallmentPrincipalArray = $('#clientPaidInstallmentPrincipalId').val().split("*");
			var clientPaidInstallmentInterestArray = $('#clientPaidInstallmentInterestId').val().split("*");
			var clientPaidInstallmentFeesArray = $('#clientPaidInstallmentFeesId').val().split("*");
			var clientPaidInstallmentPenaltyArray = $('#clientPaidInstallmentPenaltyId').val().split("*");
			var clientPaidInstallmentTotalArray = $('#clientPaidInstallmentTotalId').val().split("*");
			//alert(clientPaidInstallmentTotalArray.length);
			$(".MemberNameLabel").text($('#clientIdId').val().split(",")[position]+" - "+$('#clientNameId').val().split(",")[position]);
			if((clientPaidInstallmentTotalArray.length-2) >= position) {
				var clientPaidInstallmentIdArray = clientPaidInstallmentIdArray[position].replace(/^[\s,]+|[\s,]+$/g, '').split(",");
				var clientPaidInstallmentDueDateIdArray = clientPaidInstallmentDueDateIdArray[position].replace(/^[\s,]+|[\s,]+$/g, '').split(",");
				var clientPaidInstallmentDatePaidIdArray = clientPaidInstallmentDatePaidIdArray[position].replace(/^[\s,]+|[\s,]+$/g, '').split(",");
				var clientPaidInstallmentPrincipalArray = clientPaidInstallmentPrincipalArray[position].replace(/^[\s,]+|[\s,]+$/g, '').split(",");
				var clientPaidInstallmentInterestArray = clientPaidInstallmentInterestArray[position].replace(/^[\s,]+|[\s,]+$/g, '').split(",");
				var clientPaidInstallmentFeesArray = clientPaidInstallmentFeesArray[position].replace(/^[\s,]+|[\s,]+$/g, '').split(",");
				var clientPaidInstallmentPenaltyArray = clientPaidInstallmentPenaltyArray[position].replace(/^[\s,]+|[\s,]+$/g, '').split(",");
				var clientPaidInstallmentTotalArray = clientPaidInstallmentTotalArray[position].replace(/^[\s,]+|[\s,]+$/g, '').split(",");
				//alert(clientPaidInstallmentIdArray);
				//alert(clientPaidInstallmentDueDateIdArray[0]);
				//alert(clientPaidInstallmentDatePaidIdArray);
				//alert(clientPaidInstallmentPrincipalArray);
				//alert(clientPaidInstallmentInterestArray);
				//alert(clientPaidInstallmentFeesArray);
				//alert(clientPaidInstallmentPenaltyArray);
				//alert(clientPaidInstallmentTotalArray);
				
				
				for(var i=0;i<clientPaidInstallmentIdArray.length;i++){
					var newContent ='<tr class="showhide">';
					newContent+='<td>';
					newContent+= clientPaidInstallmentIdArray[i];
					newContent+='</td>';
					newContent+='<td>';
					newContent+= clientPaidInstallmentDueDateIdArray[i];
					newContent+='</td>';
					newContent+='<td>';
					newContent+= clientPaidInstallmentDatePaidIdArray[i];
					newContent+='</td>';
					newContent+='<td>';
					newContent+= clientPaidInstallmentPrincipalArray[i];
					newContent+='</td>';
					newContent+='<td>';
					newContent+= clientPaidInstallmentInterestArray[i];
					newContent+='</td>';
					newContent+='<td>';
					newContent+= clientPaidInstallmentFeesArray[i];
					newContent+='</td>';
					newContent+='<td>';
					newContent+= clientPaidInstallmentPenaltyArray[i];
					newContent+='</td>';
					newContent+='<td>';
					newContent+= clientPaidInstallmentTotalArray[i];
					newContent+='</td>';
					newContent+='</tr>';
					$("#clientPaidInstallmentTableId").append(newContent).trigger('create');
				}
			}
			
			clientInstallmentpaidcurrentrow = 0;
			clientInstallmentpaidmaxrows = $("#clientPaidInstallmentTableId tr").length-1;
			if(clientInstallmentpaidmaxrows > 5){
				//alert("Table Lenth="+clientInstallmentpaidmaxrows)
				$("#clientInstallmentpaidPrevId").hide();
				$("#clientInstallmentpaidNextId").show();
				$('#clientPaidInstallmentTableId tr.showhide').hide();
				for(var i =0 ; i<5; i++) {
					if (clientInstallmentpaidcurrentrow < clientInstallmentpaidmaxrows) {
					   $('#clientPaidInstallmentTableId tr.showhide:eq(' + clientInstallmentpaidcurrentrow  + ')').show();
					   clientInstallmentpaidcurrentrow++;
					}
				}
				clientInstallmentpaidPageNo = 1;
				var $btn_text  = $('#clientInstallmentpaidPageNoId').find('.ui-btn-text')
				$btn_text.text("Records "+clientInstallmentpaidPageNo+" - "+clientInstallmentpaidcurrentrow+" of "+clientInstallmentpaidmaxrows);
				
			}
			else {
				$("#clientInstallmentpaidPrevId").hide();
				$("#clientInstallmentpaidPageNoId").hide();
				$("#clientInstallmentpaidNextId").hide();
			}
			
			
			$("#paidInstallmentTableId").show();
			$("#clientIndexHiddenId").val(position);
			$("#paginationDivClientId").show();
			$("#PaidInstallmentClientId").show();
			$("#installmentsDueClientId").hide();
			$("#futureInstallmentsClientId").hide();
			$("#clientAccountDetailsId").hide();
			$("#subClientNavbarId").show();
		});
	}
	
	
	$("#clientInstallmentpaidNextId").click(function() {
		if(clientInstallmentpaidcurrentrow == 5){
			$("#clientInstallmentpaidPrevId").show();
		}
		//alert("next"+clientInstallmentpaidcurrentrow);
		var hidepreviousrow = clientInstallmentpaidcurrentrow;
		for(var i =0 ; i<5; i++) {
			hidepreviousrow--;
			$('#clientPaidInstallmentTableId tr.showhide:eq(' + hidepreviousrow  + ')').hide();
			if (clientInstallmentpaidcurrentrow < clientInstallmentpaidmaxrows) {
				$('#clientPaidInstallmentTableId tr.showhide:eq(' + clientInstallmentpaidcurrentrow  + ')').show();
				clientInstallmentpaidcurrentrow ++;
			}
		}
		if(clientInstallmentpaidcurrentrow == clientInstallmentpaidmaxrows){
			$("#clientInstallmentpaidNextId").hide();
		}
		clientInstallmentpaidPageNo = clientInstallmentpaidPageNo+5;
		var $btn_text  = $('#clientInstallmentpaidPageNoId').find('.ui-btn-text')
		$btn_text.text("Records "+clientInstallmentpaidPageNo+" - "+clientInstallmentpaidcurrentrow+" of "+clientInstallmentpaidmaxrows);    
	});
	
	$("#clientInstallmentpaidPrevId").click(function() {
		//alert("Previous");
		if(clientInstallmentpaidcurrentrow == clientInstallmentpaidmaxrows){
			$("#clientInstallmentpaidNextId").show();
		}
		
		var hidenextrow = clientInstallmentpaidcurrentrow;
		if(clientInstallmentpaidmaxrows == clientInstallmentpaidcurrentrow){
			var x = clientInstallmentpaidmaxrows % 5;
			if(x>0){
				hidenextrow = hidenextrow + (5 - x);
				clientInstallmentpaidcurrentrow = clientInstallmentpaidcurrentrow + (5 - x);   
			}
		}
		for(var i =0 ; i<5; i++) {
			hidenextrow--;
			$('#clientPaidInstallmentTableId tr.showhide:eq(' + hidenextrow  + ')').hide();
			if (clientInstallmentpaidcurrentrow > 0) {
				clientInstallmentpaidcurrentrow --;
				$('#clientPaidInstallmentTableId tr.showhide:eq(' + (clientInstallmentpaidcurrentrow-5)  +')').show();
				
			}   
		}
		if(clientInstallmentpaidcurrentrow == 5){
			$("#clientInstallmentpaidPrevId").hide();
		}
		clientInstallmentpaidPageNo = clientInstallmentpaidPageNo - 5;
		var $btn_text  = $('#clientInstallmentpaidPageNoId').find('.ui-btn-text')
		$btn_text.text("Records "+clientInstallmentpaidPageNo+" - "+clientInstallmentpaidcurrentrow+" of "+clientInstallmentpaidmaxrows);  
		
	});
	
	/*for(var i=0 ; i<noOfClients; i++) {
		$('#showClientSchedId'+i).click(function(){
			//alert(this.id);
			var position = parseInt(this.id.replace( /^\D+/g, ''),10);
			//alert(position);
			for(var j=0 ; j<noOfClients; j++) {
				$("#paidInstallmentTableId"+j).hide();
			}
			for(var j=0 ; j<noOfClients; j++) {
				$("#dueInstallmentTableId"+j).hide();
			}
			for(var j=0 ; j<noOfClients; j++) {
				$("#futureInstallmentTableId"+j).hide();
			}
			
			$("#paidInstallmentTableId"+position).show();
			$("#dueInstallmentTableId"+position).show();
			$("#futureInstallmentTableId"+position).show();
			$("#clientIndexHiddenId").val(position);
			$("#paginationDivClientId").show();
			$("#PaidInstallmentClientId").show();
			$("#installmentsDueClientId").hide();
			$("#futureInstallmentsClientId").hide();
			$("#clientAccountDetailsId").hide();
			$("#subClientNavbarId").show();
			//lastClientViewIndex = position;
		});
	}*/
	
	//Pagination
	//Group Outstanding Balance Pagination//
	$("#groupOutstandingBalanceNextId").click(function() {
		if(groupOutstandingBalancecurrentrow == 5){
			$("#groupOutstandingBalancePrevId").show();
		}
		//alert("next"+groupOutstandingBalancecurrentrow);
		var hidepreviousrow = groupOutstandingBalancecurrentrow;
		for(var i =0 ; i<5; i++) {
			hidepreviousrow--;
			$('#groupOutstandingBalanceTableId tr.showhide:eq(' + hidepreviousrow  + ')').hide();
			if (groupOutstandingBalancecurrentrow < groupOutstandingBalancemaxrows) {
				$('#groupOutstandingBalanceTableId tr.showhide:eq(' + groupOutstandingBalancecurrentrow  + ')').show();
				groupOutstandingBalancecurrentrow ++;
			}
		}
		if(groupOutstandingBalancecurrentrow == groupOutstandingBalancemaxrows){
			$("#groupOutstandingBalanceNextId").hide();
		}
		groupOutstandingBalancePageNo = groupOutstandingBalancePageNo+5;
		var $btn_text  = $('#groupOutstandingBalancePageNoId').find('.ui-btn-text')
		$btn_text.text("Records "+groupOutstandingBalancePageNo+" - "+groupOutstandingBalancecurrentrow+" of "+groupOutstandingBalancemaxrows);    
	});
	
	$("#groupOutstandingBalancePrevId").click(function() {
		//alert("Previous");
		if(groupOutstandingBalancecurrentrow == groupOutstandingBalancemaxrows){
			$("#groupOutstandingBalanceNextId").show();
		}
		
		var hidenextrow = groupOutstandingBalancecurrentrow;
		if(groupOutstandingBalancemaxrows == groupOutstandingBalancecurrentrow){
			var x = groupOutstandingBalancemaxrows % 5;
			if(x>0){
				hidenextrow = hidenextrow + (5 - x);
				groupOutstandingBalancecurrentrow = groupOutstandingBalancecurrentrow + (5 - x);   
			}
		}
		for(var i =0 ; i<5; i++) {
			hidenextrow--;
			$('#groupOutstandingBalanceTableId tr.showhide:eq(' + hidenextrow  + ')').hide();
			if (groupOutstandingBalancecurrentrow > 0) {
				groupOutstandingBalancecurrentrow --;
				$('#groupOutstandingBalanceTableId tr.showhide:eq(' + (groupOutstandingBalancecurrentrow-5)  +')').show();
				
			}   
		}
		if(groupOutstandingBalancecurrentrow == 5){
			$("#groupOutstandingBalancePrevId").hide();
		}
		groupOutstandingBalancePageNo = groupOutstandingBalancePageNo - 5;
		var $btn_text  = $('#groupOutstandingBalancePageNoId').find('.ui-btn-text')
		$btn_text.text("Records "+groupOutstandingBalancePageNo+" - "+groupOutstandingBalancecurrentrow+" of "+groupOutstandingBalancemaxrows);  
		
	});
	
	
	
	
	//Group Installment Paid Pagination//
	$("#groupInstallmentpaidNextId").click(function() {
		if(groupInstallmentpaidcurrentrow == 5){
			$("#groupInstallmentpaidPrevId").show();
		}
		//alert("next"+groupInstallmentpaidcurrentrow);
		var hidepreviousrow = groupInstallmentpaidcurrentrow;
		for(var i =0 ; i<5; i++) {
			hidepreviousrow--;
			$('#groupInstallmentpaidTableId tr.showhide:eq(' + hidepreviousrow  + ')').hide();
			if (groupInstallmentpaidcurrentrow < groupInstallmentpaidmaxrows) {
				$('#groupInstallmentpaidTableId tr.showhide:eq(' + groupInstallmentpaidcurrentrow  + ')').show();
				groupInstallmentpaidcurrentrow ++;
			}
		}
		if(groupInstallmentpaidcurrentrow == groupInstallmentpaidmaxrows){
			$("#groupInstallmentpaidNextId").hide();
		}
		groupInstallmentpaidPageNo = groupInstallmentpaidPageNo+5;
		var $btn_text  = $('#groupInstallmentpaidPageNoId').find('.ui-btn-text')
		$btn_text.text("Records "+groupInstallmentpaidPageNo+" - "+groupInstallmentpaidcurrentrow+" of "+groupInstallmentpaidmaxrows);    
	});
	
	$("#groupInstallmentpaidPrevId").click(function() {
		//alert("Previous");
		if(groupInstallmentpaidcurrentrow == groupInstallmentpaidmaxrows){
			$("#groupInstallmentpaidNextId").show();
		}
		
		var hidenextrow = groupInstallmentpaidcurrentrow;
		if(groupInstallmentpaidmaxrows == groupInstallmentpaidcurrentrow){
			var x = groupInstallmentpaidmaxrows % 5;
			if(x>0){
				hidenextrow = hidenextrow + (5 - x);
				groupInstallmentpaidcurrentrow = groupInstallmentpaidcurrentrow + (5 - x);   
			}
		}
		for(var i =0 ; i<5; i++) {
			hidenextrow--;
			$('#groupInstallmentpaidTableId tr.showhide:eq(' + hidenextrow  + ')').hide();
			if (groupInstallmentpaidcurrentrow > 0) {
				groupInstallmentpaidcurrentrow --;
				$('#groupInstallmentpaidTableId tr.showhide:eq(' + (groupInstallmentpaidcurrentrow-5)  +')').show();
				
			}   
		}
		if(groupInstallmentpaidcurrentrow == 5){
			$("#groupInstallmentpaidPrevId").hide();
		}
		groupInstallmentpaidPageNo = groupInstallmentpaidPageNo - 5;
		var $btn_text  = $('#groupInstallmentpaidPageNoId').find('.ui-btn-text')
		$btn_text.text("Records "+groupInstallmentpaidPageNo+" - "+groupInstallmentpaidcurrentrow+" of "+groupInstallmentpaidmaxrows);  
		
	});
	
	
	//Group Installment Due pagination//
	$("#groupInstallmentDueNextId").click(function() {
		if(groupInstallmentDuecurrentrow == 5){
			$("#groupInstallmentDuePrevId").show();
		}
		//alert("next"+groupInstallmentDuecurrentrow);
		var hidepreviousrow = groupInstallmentDuecurrentrow;
		for(var i =0 ; i<5; i++) {
			hidepreviousrow--;
			$('#groupInstallmentDueTableId tr.showhide:eq(' + hidepreviousrow  + ')').hide();
			if (groupInstallmentDuecurrentrow < groupInstallmentDuemaxrows) {
				$('#groupInstallmentDueTableId tr.showhide:eq(' + groupInstallmentDuecurrentrow  + ')').show();
				groupInstallmentDuecurrentrow ++;
			}
		}
		if(groupInstallmentDuecurrentrow == groupInstallmentDuemaxrows){
			$("#groupInstallmentDueNextId").hide();
		}
		groupInstallmentDuePageNo = groupInstallmentDuePageNo+5;
		var $btn_text  = $('#groupInstallmentDuePageNoId').find('.ui-btn-text')
		$btn_text.text("Records "+groupInstallmentDuePageNo+" - "+groupInstallmentDuecurrentrow+" of "+groupInstallmentDuemaxrows);    
	});
	
	$("#groupInstallmentDuePrevId").click(function() {
		//alert("Previous");
		if(groupInstallmentDuecurrentrow == groupInstallmentDuemaxrows){
			$("#groupInstallmentDueNextId").show();
		}
		
		var hidenextrow = groupInstallmentDuecurrentrow;
		if(groupInstallmentDuemaxrows == groupInstallmentDuecurrentrow){
			var x = groupInstallmentDuemaxrows % 5;
			if(x>0){
				hidenextrow = hidenextrow + (5 - x);
				groupInstallmentDuecurrentrow = groupInstallmentDuecurrentrow + (5 - x);   
			}
		}
		for(var i =0 ; i<5; i++) {
			hidenextrow--;
			$('#groupInstallmentDueTableId tr.showhide:eq(' + hidenextrow  + ')').hide();
			if (groupInstallmentDuecurrentrow > 0) {
				groupInstallmentDuecurrentrow --;
				$('#groupInstallmentDueTableId tr.showhide:eq(' + (groupInstallmentDuecurrentrow-5)  +')').show();
				
			}   
		}
		if(groupInstallmentDuecurrentrow == 5){
			$("#groupInstallmentDuePrevId").hide();
		}
		groupInstallmentDuePageNo = groupInstallmentDuePageNo - 5;
		var $btn_text  = $('#groupInstallmentDuePageNoId').find('.ui-btn-text')
		$btn_text.text("Records "+groupInstallmentDuePageNo+" - "+groupInstallmentDuecurrentrow+" of "+groupInstallmentDuemaxrows);  
		
	});
	
	
	
	//Group Future Installment pagination//
	$("#groupFutureInstallmentNextId").click(function() {
		if(groupFutureInstallmentcurrentrow == 5){
			$("#groupFutureInstallmentPrevId").show();
		}
		//alert("next"+groupFutureInstallmentcurrentrow);
		var hidepreviousrow = groupFutureInstallmentcurrentrow;
		for(var i =0 ; i<5; i++) {
			hidepreviousrow--;
			$('#groupFutureInstallmentTableId tr.showhide:eq(' + hidepreviousrow  + ')').hide();
			if (groupFutureInstallmentcurrentrow < groupFutureInstallmentmaxrows) {
				$('#groupFutureInstallmentTableId tr.showhide:eq(' + groupFutureInstallmentcurrentrow  + ')').show();
				groupFutureInstallmentcurrentrow ++;
			}
		}
		if(groupFutureInstallmentcurrentrow == groupFutureInstallmentmaxrows){
			$("#groupFutureInstallmentNextId").hide();
		}
		groupFutureInstallmentPageNo = groupFutureInstallmentPageNo+5;
		var $btn_text  = $('#groupFutureInstallmentPageNoId').find('.ui-btn-text')
		$btn_text.text("Records "+groupFutureInstallmentPageNo+" - "+groupFutureInstallmentcurrentrow+" of "+groupFutureInstallmentmaxrows);    
	});
	
	$("#groupFutureInstallmentPrevId").click(function() {
		//alert("Previous");
		if(groupFutureInstallmentcurrentrow == groupFutureInstallmentmaxrows){
			$("#groupFutureInstallmentNextId").show();
		}
		
		var hidenextrow = groupFutureInstallmentcurrentrow;
		if(groupFutureInstallmentmaxrows == groupFutureInstallmentcurrentrow){
			var x = groupFutureInstallmentmaxrows % 5;
			if(x>0){
				hidenextrow = hidenextrow + (5 - x);
				groupFutureInstallmentcurrentrow = groupFutureInstallmentcurrentrow + (5 - x);   
			}
		}
		for(var i =0 ; i<5; i++) {
			hidenextrow--;
			$('#groupFutureInstallmentTableId tr.showhide:eq(' + hidenextrow  + ')').hide();
			if (groupFutureInstallmentcurrentrow > 0) {
				groupFutureInstallmentcurrentrow --;
				$('#groupFutureInstallmentTableId tr.showhide:eq(' + (groupFutureInstallmentcurrentrow-5)  +')').show();
				
			}   
		}
		if(groupFutureInstallmentcurrentrow == 5){
			$("#groupFutureInstallmentPrevId").hide();
		}
		groupFutureInstallmentPageNo = groupFutureInstallmentPageNo - 5;
		var $btn_text  = $('#groupFutureInstallmentPageNoId').find('.ui-btn-text')
		$btn_text.text("Records "+groupFutureInstallmentPageNo+" - "+groupFutureInstallmentcurrentrow+" of "+groupFutureInstallmentmaxrows);  
		
	});
	
	
	
	//Client Detail pagination//
	$("#clientDetailNextId").click(function() {
		if(clientDetailcurrentrow == 5){
			$("#clientDetailPrevId").show();
		}
		//alert("next"+clientDetailcurrentrow);
		var hidepreviousrow = clientDetailcurrentrow;
		for(var i =0 ; i<5; i++) {
			hidepreviousrow--;
			$('#clientDetailTableId tr.showhide:eq(' + hidepreviousrow  + ')').hide();
			if (clientDetailcurrentrow < clientDetailmaxrows) {
				$('#clientDetailTableId tr.showhide:eq(' + clientDetailcurrentrow  + ')').show();
				clientDetailcurrentrow ++;
			}
		}
		if(clientDetailcurrentrow == clientDetailmaxrows){
			$("#clientDetailNextId").hide();
		}
		clientDetailPageNo = clientDetailPageNo+5;
		var $btn_text  = $('#clientDetailPageNoId').find('.ui-btn-text')
		$btn_text.text("Records "+clientDetailPageNo+" - "+clientDetailcurrentrow+" of "+noOfClients);    
	});
	
	$("#clientDetailPrevId").click(function() {
		if(clientDetailcurrentrow == clientDetailmaxrows){
			$("#clientDetailNextId").show();
		}
		
		var hidenextrow = clientDetailcurrentrow;
		if(clientDetailmaxrows == clientDetailcurrentrow){
			var x = clientDetailmaxrows % 5;
			if(x>0){
				hidenextrow = hidenextrow + (5 - x);
				clientDetailcurrentrow = clientDetailcurrentrow + (5 - x);   
			}
		}
		for(var i =0 ; i<5; i++) {
			hidenextrow--;
			$('#clientDetailTableId tr.showhide:eq(' + hidenextrow  + ')').hide();
			if (clientDetailcurrentrow > 0) {
				clientDetailcurrentrow --;
				$('#clientDetailTableId tr.showhide:eq(' + (clientDetailcurrentrow-5)  +')').show();
				
			}   
		}
		if(clientDetailcurrentrow == 5){
			$("#clientDetailPrevId").hide();
		}
		clientDetailPageNo = clientDetailPageNo - 5;
		var $btn_text  = $('#clientDetailPageNoId').find('.ui-btn-text')
		$btn_text.text("Records "+clientDetailPageNo+" - "+clientDetailcurrentrow+" of "+noOfClients);  
		
	});
	
	
	
	//recentOutstandingBalanceDetail Detail pagination//
	$("#recentOutstandingBalanceDetailNextId").click(function() {
		if(recentOutstandingBalanceDetailcurrentrow == 5){
			$("#recentOutstandingBalanceDetailPrevId").show();
		}
		//alert("next"+recentOutstandingBalanceDetailcurrentrow);
		var hidepreviousrow = recentOutstandingBalanceDetailcurrentrow;
		for(var i =0 ; i<5; i++) {
			hidepreviousrow--;
			$('#recentOutstandingBalanceDetailTableId tr.showhide:eq(' + hidepreviousrow  + ')').hide();
			if (recentOutstandingBalanceDetailcurrentrow < recentOutstandingBalanceDetailmaxrows) {
				$('#recentOutstandingBalanceDetailTableId tr.showhide:eq(' + recentOutstandingBalanceDetailcurrentrow  + ')').show();
				recentOutstandingBalanceDetailcurrentrow ++;
			}
		}
		if(recentOutstandingBalanceDetailcurrentrow == recentOutstandingBalanceDetailmaxrows){
			$("#recentOutstandingBalanceDetailNextId").hide();
		}
		recentOutstandingBalanceDetailPageNo = recentOutstandingBalanceDetailPageNo+5;
		var $btn_text  = $('#recentOutstandingBalanceDetailPageNoId').find('.ui-btn-text')
		$btn_text.text("Records "+recentOutstandingBalanceDetailPageNo+" - "+recentOutstandingBalanceDetailcurrentrow+" of "+recentOutstandingBalanceDetailmaxrows);    
	});
	
	$("#recentOutstandingBalanceDetailPrevId").click(function() {
		if(recentOutstandingBalanceDetailcurrentrow == recentOutstandingBalanceDetailmaxrows){
			$("#recentOutstandingBalanceDetailNextId").show();
		}
		
		var hidenextrow = recentOutstandingBalanceDetailcurrentrow;
		if(recentOutstandingBalanceDetailmaxrows == recentOutstandingBalanceDetailcurrentrow){
			var x = recentOutstandingBalanceDetailmaxrows % 5;
			if(x>0){
				hidenextrow = hidenextrow + (5 - x);
				recentOutstandingBalanceDetailcurrentrow = recentOutstandingBalanceDetailcurrentrow + (5 - x);   
			}
		}
		for(var i =0 ; i<5; i++) {
			hidenextrow--;
			$('#recentOutstandingBalanceDetailTableId tr.showhide:eq(' + hidenextrow  + ')').hide();
			if (recentOutstandingBalanceDetailcurrentrow > 0) {
				recentOutstandingBalanceDetailcurrentrow --;
				$('#recentOutstandingBalanceDetailTableId tr.showhide:eq(' + (recentOutstandingBalanceDetailcurrentrow-5)  +')').show();
				
			}   
		}
		if(recentOutstandingBalanceDetailcurrentrow == 5){
			$("#recentOutstandingBalanceDetailPrevId").hide();
		}
		recentOutstandingBalanceDetailPageNo = recentOutstandingBalanceDetailPageNo - 5;
		var $btn_text  = $('#recentOutstandingBalanceDetailPageNoId').find('.ui-btn-text')
		$btn_text.text("Records "+recentOutstandingBalanceDetailPageNo+" - "+recentOutstandingBalanceDetailcurrentrow+" of "+recentOutstandingBalanceDetailmaxrows);  
		
	});
	
	
	
	
	//viewAllAccountActivityDetail Detail pagination//
	$("#viewAllAccountActivityDetailNextId").click(function() {
		if(viewAllAccountActivityDetailcurrentrow == 5){
			$("#viewAllAccountActivityDetailPrevId").show();
		}
		//alert("next"+viewAllAccountActivityDetailcurrentrow);
		var hidepreviousrow = viewAllAccountActivityDetailcurrentrow;
		for(var i =0 ; i<5; i++) {
			hidepreviousrow--;
			$('#viewAllAccountActivityDetailTableId tr.showhide:eq(' + hidepreviousrow  + ')').hide();
			if (viewAllAccountActivityDetailcurrentrow < viewAllAccountActivityDetailmaxrows) {
				$('#viewAllAccountActivityDetailTableId tr.showhide:eq(' + viewAllAccountActivityDetailcurrentrow  + ')').show();
				viewAllAccountActivityDetailcurrentrow ++;
			}
		}
		if(viewAllAccountActivityDetailcurrentrow == viewAllAccountActivityDetailmaxrows){
			$("#viewAllAccountActivityDetailNextId").hide();
		}
		viewAllAccountActivityDetailPageNo = viewAllAccountActivityDetailPageNo+5;
		var $btn_text  = $('#viewAllAccountActivityDetailPageNoId').find('.ui-btn-text')
		$btn_text.text("Records "+viewAllAccountActivityDetailPageNo+" - "+viewAllAccountActivityDetailcurrentrow+" of "+viewAllAccountActivityDetailmaxrows);    
	});
	
	$("#viewAllAccountActivityDetailPrevId").click(function() {
		if(viewAllAccountActivityDetailcurrentrow == viewAllAccountActivityDetailmaxrows){
			$("#viewAllAccountActivityDetailNextId").show();
		}
		
		var hidenextrow = viewAllAccountActivityDetailcurrentrow;
		if(viewAllAccountActivityDetailmaxrows == viewAllAccountActivityDetailcurrentrow){
			var x = viewAllAccountActivityDetailmaxrows % 5;
			if(x>0){
				hidenextrow = hidenextrow + (5 - x);
				viewAllAccountActivityDetailcurrentrow = viewAllAccountActivityDetailcurrentrow + (5 - x);   
			}
		}
		for(var i =0 ; i<5; i++) {
			hidenextrow--;
			$('#viewAllAccountActivityDetailTableId tr.showhide:eq(' + hidenextrow  + ')').hide();
			if (viewAllAccountActivityDetailcurrentrow > 0) {
				viewAllAccountActivityDetailcurrentrow --;
				$('#viewAllAccountActivityDetailTableId tr.showhide:eq(' + (viewAllAccountActivityDetailcurrentrow-5)  +')').show();
				
			}   
		}
		if(viewAllAccountActivityDetailcurrentrow == 5){
			$("#viewAllAccountActivityDetailPrevId").hide();
		}
		viewAllAccountActivityDetailPageNo = viewAllAccountActivityDetailPageNo - 5;
		var $btn_text  = $('#viewAllAccountActivityDetailPageNoId').find('.ui-btn-text')
		$btn_text.text("Records "+viewAllAccountActivityDetailPageNo+" - "+viewAllAccountActivityDetailcurrentrow+" of "+viewAllAccountActivityDetailmaxrows);  
		
	});
	
	
});
function back(globalCustomerNum) {
	document.getElementById("applyPaymentFormId").method='POST';
	document.getElementById("applyPaymentFormId").action=localStorage.contextPath+"/client/ci/loanrecovery/groups/"+globalCustomerNum+"/loanaccounts";
	document.getElementById("applyPaymentFormId").submit();
}

function applyPayment() {
	document.getElementById("applyPaymentFormId").method='POST';
	document.getElementById("applyPaymentFormId").action=localStorage.contextPath+"/client/ci/loanrecovery/applypayment";
	document.getElementById("applyPaymentFormId").submit();
}

function applyAdjustment() {
	document.getElementById("applyPaymentFormId").method='POST';
	document.getElementById("applyPaymentFormId").action=localStorage.contextPath+"/client/ci/loanrecovery/listapplyadjustment";
	document.getElementById("applyPaymentFormId").submit();
}

function viewPreclosure(){
	document.getElementById("applyPaymentFormId").method='POST';
	document.getElementById("applyPaymentFormId").action=localStorage.contextPath+"/client/ci/preclosure";
	document.getElementById("applyPaymentFormId").submit();
}

function viewIndividualPreclosure(){
    document.getElementById("applyPaymentFormId").method='POST';
    document.getElementById("applyPaymentFormId").action=localStorage.contextPath+"/client/ci/individualPreclosure";
    document.getElementById("applyPaymentFormId").submit();
}
function loanReverse(){
	document.getElementById("applyPaymentFormId").method='POST';
	document.getElementById("applyPaymentFormId").action=localStorage.contextPath+"/client/ci/reverse";
	document.getElementById("applyPaymentFormId").submit();
}

function editAccountStatus(){
	document.getElementById("applyPaymentFormId").method='POST';
	document.getElementById("applyPaymentFormId").action=localStorage.contextPath+"/client/ci/loanrecovery/editaccountstatus";
	document.getElementById("applyPaymentFormId").submit();
}
