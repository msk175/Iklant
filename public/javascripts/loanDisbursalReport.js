var loanDisbursalDetailcurrentrow = 0;
var loanDisbursalDetailmaxrows = 0;
var loanDisbursalDetailPageNo = 1;

$(document).ready(function() {
    $(function() {
		$("#startDateId").datepicker({
			maxDate: new Date,
			dateFormat: 'dd-mm-yy',
			yearRange: "-90:+0",
  			changeMonth: true,
            changeYear: true,
			onClose: function ()
			{	
				$('#officeDivId').show();
				$('#loanOfficerDivId').show();
				$('#productCategoryDivId').show();
				// The "this" keyword refers to the input (in this case: #someinput)
				//this.focus();
			}
        });
		$("#endDateId").datepicker({
			maxDate: new Date,
			dateFormat: 'dd-mm-yy',
			yearRange: "-90:+0",
  			changeMonth: true,
            changeYear: true,
			onClose: function ()
			{	
				$('#officeDivId').show();
				$('#loanOfficerDivId').show();
				$('#productCategoryDivId').show();
				// The "this" keyword refers to the input (in this case: #someinput)
				//this.focus();
			}
        });
	});
	
	$("#startDateId").click(function(){
		$('#officeDivId').hide();
		$('#loanOfficerDivId').hide();
		$('#productCategoryDivId').hide();
	});
	$("#endDateId").click(function(){
		$('#officeDivId').hide();
		$('#loanOfficerDivId').hide();
		$('#productCategoryDivId').hide();
	});
	
	$("#detailId").click(function(){
		//$("#LoanDisbursalSummaryId").hide();
		$("#LoanDisbursalDetailId").show();
		loanDisbursalDetailcurrentrow = 0;
		loanDisbursalDetailmaxrows = $("#LoanDisbursalDetailTableId > tbody > tr").length;
		
		$("#LoanDisbursalDetailPrevId").hide();
		$("#LoanDisbursalDetailNextId").show();
		$('#LoanDisbursalDetailTableId tr.showhide').hide();
		for(var i =0 ; i<10; i++) {
			if (loanDisbursalDetailcurrentrow < loanDisbursalDetailmaxrows) {
			   $('#LoanDisbursalDetailTableId tr.showhide:eq(' + loanDisbursalDetailcurrentrow  + ')').show();
			   loanDisbursalDetailcurrentrow++;
			}
		}
		loanDisbursalDetailPageNo = 1;
		var $btn_text  = $('#LoanDisbursalDetailPageNoId').find('.ui-btn-text')
		$btn_text.text("Records "+loanDisbursalDetailPageNo+" - "+loanDisbursalDetailcurrentrow+" of "+loanDisbursalDetailmaxrows);
		
	});
	
	//Group Future Installment pagination//
	$("#LoanDisbursalDetailNextId").click(function() {
		if(loanDisbursalDetailcurrentrow == 10){
			$("#LoanDisbursalDetailPrevId").show();
		}
		//alert("next"+groupFutureInstallmentcurrentrow);
		var hidepreviousrow = loanDisbursalDetailcurrentrow;
		for(var i =0 ; i<10; i++) {
			hidepreviousrow--;
			$('#LoanDisbursalDetailTableId tr.showhide:eq(' + hidepreviousrow  + ')').hide();
			if (loanDisbursalDetailcurrentrow < loanDisbursalDetailmaxrows) {
				$('#LoanDisbursalDetailTableId tr.showhide:eq(' + loanDisbursalDetailcurrentrow  + ')').show();
				loanDisbursalDetailcurrentrow ++;
			}
		}
		if(loanDisbursalDetailcurrentrow == loanDisbursalDetailmaxrows){
			$("#LoanDisbursalDetailNextId").hide();
		}
		loanDisbursalDetailPageNo = loanDisbursalDetailPageNo+10;
		var $btn_text  = $('#LoanDisbursalDetailPageNoId').find('.ui-btn-text')
		$btn_text.text("Records "+loanDisbursalDetailPageNo+" - "+loanDisbursalDetailcurrentrow+" of "+loanDisbursalDetailmaxrows);    
	});
	
	$("#LoanDisbursalDetailPrevId").click(function() {
		//alert("Previous");
		if(loanDisbursalDetailcurrentrow == loanDisbursalDetailmaxrows){
			$("#LoanDisbursalDetailNextId").show();
		}
		
		var hidenextrow = loanDisbursalDetailcurrentrow;
		if(loanDisbursalDetailmaxrows == loanDisbursalDetailcurrentrow){
			var x = loanDisbursalDetailmaxrows % 10;
			if(x>0){
				hidenextrow = hidenextrow + (10 - x);
				loanDisbursalDetailcurrentrow = loanDisbursalDetailcurrentrow + (10 - x);   
			}
		}
		for(var i =0 ; i<10; i++) {
			hidenextrow--;
			$('#LoanDisbursalDetailTableId tr.showhide:eq(' + hidenextrow  + ')').hide();
			if (loanDisbursalDetailcurrentrow > 0) {
				loanDisbursalDetailcurrentrow --;
				$('#LoanDisbursalDetailTableId tr.showhide:eq(' + (loanDisbursalDetailcurrentrow-10)  +')').show();
				
			}   
		}
		if(loanDisbursalDetailcurrentrow == 10){
			$("#LoanDisbursalDetailPrevId").hide();
		}
		loanDisbursalDetailPageNo = loanDisbursalDetailPageNo - 10;
		var $btn_text  = $('#LoanDisbursalDetailPageNoId').find('.ui-btn-text')
		$btn_text.text("Records "+loanDisbursalDetailPageNo+" - "+loanDisbursalDetailcurrentrow+" of "+loanDisbursalDetailmaxrows);  
		
	});
	$("#officeId").change(function(){
        $.mobile.showPageLoadingMsg();
		document.getElementById("loanDisbursalReportFormId").method='POST';
		document.getElementById("loanDisbursalReportFormId").action=localStorage.contextPath+"/client/ci/reports/loanDisbursalReportLoadLoanOfficers";
		document.getElementById("loanDisbursalReportFormId").submit();
	});
	
	$("#submit").click(function(){
		$("#errorStartDateId").text("");
		$("#errorEndDateId").text("");
		$("#errorCompareDateId").text("");
		var startDateArray = $("#startDateId").val().split("-");
		var startDate = new Date(startDateArray[2], startDateArray[1] - 1, startDateArray[0]).getTime();
		var endDateArray = $("#endDateId").val().split("-");
		var endDate = new Date(endDateArray[2], endDateArray[1] - 1, endDateArray[0]).getTime();
		var mandatoryFlag = 1;
		if($("#startDateId").val() == ""){
			$("#errorStartDateId").text("Start Date cannot be empty.");
			mandatoryFlag = 0;
			$(window).scrollTop(0);
		}
		if($("#endDateId").val() == ""){
			$("#errorEndDateId").text("End Date cannot be empty.");
			mandatoryFlag = 0;
			$(window).scrollTop(0);
		}
		if(startDate > endDate) {
			$("#errorCompareDateId").text("Start Date cannot be greater than End Date.");
			mandatoryFlag = 0;
			$(window).scrollTop(0);
		}
		if(mandatoryFlag == 1) {
            $.mobile.showPageLoadingMsg();
			document.getElementById("loanDisbursalReportFormId").method='POST';
			document.getElementById("loanDisbursalReportFormId").action=localStorage.contextPath+"/client/ci/reports/loandisbursalReportLoadDetail";
			document.getElementById("loanDisbursalReportFormId").submit();
		}
	});
	
});