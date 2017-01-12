//$(document).ready(function() {
var loanOutstandingDetailcurrentrow = 0;
var loanOutstandingDetailmaxrows = 0;
var loanOutstandingDetailPageNo = 1;
$(document).ready(function() {
	$("#selectedCategoryLabelDivId").hide();
	$("#selectedCategoryTextDivId").hide();
	$("#categoryId").val($('#selectedCategoryId').val()).selectmenu("refresh");
	showSubcategory();
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
				$('#categoryDivId').show();
				$('#subCategoryDivId').show();
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
				$('#categoryDivId').show();
				$('#subCategoryDivId').show();
				// The "this" keyword refers to the input (in this case: #someinput)
				//this.focus();
			}
        });
	});
	$("#startDateId").click(function(){
		$('#officeDivId').hide();
		$('#loanOfficerDivId').hide();
		$('#productCategoryDivId').hide();
		$('#categoryDivId').hide();
		$('#subCategoryDivId').hide();
	});
	$("#endDateId").click(function(){
		$('#officeDivId').hide();
		$('#loanOfficerDivId').hide();
		$('#productCategoryDivId').hide();
		$('#categoryDivId').hide();
		$('#subCategoryDivId').hide();
	});
	$("#categoryId").change(function(){
		showSubcategory();
	});
	$("#officeId").change(function(){
        $.mobile.showPageLoadingMsg();
		document.getElementById("loanOutstandingReportForm").method='POST';
		document.getElementById("loanOutstandingReportForm").action=localStorage.contextPath+"/client/ci/reports/loanOutstandingReportLoadLoanOfficers";
		document.getElementById("loanOutstandingReportForm").submit();
	});
	$("#submitId").click(function(){
		$("#errorStartDateId").text("");
		$("#errorEndDateId").text("");
		$("#errorCompareDateId").text("");
		$("#errorCategoryId").text("");
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
		if($("#categoryId").val() == 0) {
			$("#errorCategoryId").text("Please Select Category.");
			mandatoryFlag = 0;
			$(window).scrollTop(0);
		}
		if(mandatoryFlag == 1) {
            $.mobile.showPageLoadingMsg();
			document.getElementById("loanOutstandingReportForm").method='POST';
			document.getElementById("loanOutstandingReportForm").action=localStorage.contextPath+"/client/ci/reports/loanOutstandingReportLoadDetail";
			document.getElementById("loanOutstandingReportForm").submit();
		}
	});
	
	$("#detailId").click(function(){
		//$("#LoanOutstandingSummaryId").hide();
		$("#LoanOutstandingDetailId").show();
		loanOutstandingDetailcurrentrow = 0;
		loanOutstandingDetailmaxrows = $("#LoanOutstandingDetailTableId > tbody > tr").length;
		//alert(loanOutstandingDetailmaxrows);
		$("#LoanOutstandingDetailPrevId").hide();
		$("#LoanOutstandingDetailNextId").show();
		$('#LoanOutstandingDetailTableId tr.showhide').hide();
		for(var i =0 ; i<10; i++) {
			if (loanOutstandingDetailcurrentrow < loanOutstandingDetailmaxrows) {
			   $('#LoanOutstandingDetailTableId tr.showhide:eq(' + loanOutstandingDetailcurrentrow  + ')').show();
			   loanOutstandingDetailcurrentrow++;
			}
		}
		loanOutstandingDetailPageNo = 1;
		var $btn_text  = $('#LoanOutstandingDetailPageNoId').find('.ui-btn-text')
		$btn_text.text("Records "+loanOutstandingDetailPageNo+" - "+loanOutstandingDetailcurrentrow+" of "+loanOutstandingDetailmaxrows);
		
	});
	
	//Group Future Installment pagination//
	$("#LoanOutstandingDetailNextId").click(function() {
		if(loanOutstandingDetailcurrentrow == 10){
			$("#LoanOutstandingDetailPrevId").show();
		}
		//alert("next"+groupFutureInstallmentcurrentrow);
		var hidepreviousrow = loanOutstandingDetailcurrentrow;
		for(var i =0 ; i<10; i++) {
			hidepreviousrow--;
			$('#LoanOutstandingDetailTableId tr.showhide:eq(' + hidepreviousrow  + ')').hide();
			if (loanOutstandingDetailcurrentrow < loanOutstandingDetailmaxrows) {
				$('#LoanOutstandingDetailTableId tr.showhide:eq(' + loanOutstandingDetailcurrentrow  + ')').show();
				loanOutstandingDetailcurrentrow ++;
			}
		}
		if(loanOutstandingDetailcurrentrow == loanOutstandingDetailmaxrows){
			$("#LoanOutstandingDetailNextId").hide();
		}
		loanOutstandingDetailPageNo = loanOutstandingDetailPageNo+10;
		var $btn_text  = $('#LoanOutstandingDetailPageNoId').find('.ui-btn-text')
		$btn_text.text("Records "+loanOutstandingDetailPageNo+" - "+loanOutstandingDetailcurrentrow+" of "+loanOutstandingDetailmaxrows);    
	});
	
	$("#LoanOutstandingDetailPrevId").click(function() {
		//alert("Previous");
		if(loanOutstandingDetailcurrentrow == loanOutstandingDetailmaxrows){
			$("#LoanOutstandingDetailNextId").show();
		}
		
		var hidenextrow = loanOutstandingDetailcurrentrow;
		if(loanOutstandingDetailmaxrows == loanOutstandingDetailcurrentrow){
			var x = loanOutstandingDetailmaxrows % 10;
			if(x>0){
				hidenextrow = hidenextrow + (10 - x);
				loanOutstandingDetailcurrentrow = loanOutstandingDetailcurrentrow + (10 - x);   
			}
		}
		for(var i =0 ; i<10; i++) {
			hidenextrow--;
			$('#LoanOutstandingDetailTableId tr.showhide:eq(' + hidenextrow  + ')').hide();
			if (loanOutstandingDetailcurrentrow > 0) {
				loanOutstandingDetailcurrentrow --;
				$('#LoanOutstandingDetailTableId tr.showhide:eq(' + (loanOutstandingDetailcurrentrow-10)  +')').show();
				
			}   
		}
		if(loanOutstandingDetailcurrentrow == 10){
			$("#LoanOutstandingDetailPrevId").hide();
		}
		loanOutstandingDetailPageNo = loanOutstandingDetailPageNo - 10;
		var $btn_text  = $('#LoanOutstandingDetailPageNoId').find('.ui-btn-text')
		$btn_text.text("Records "+loanOutstandingDetailPageNo+" - "+loanOutstandingDetailcurrentrow+" of "+loanOutstandingDetailmaxrows);  
		
	});
	
});

function showSubcategory() {
	if($("#categoryId").val()!='0'){
		$("#selectedCategoryLabelId").text($("#categoryId option:selected").text());
		if($("#categoryId").val() == 1) {
			var interestRateId = $("#interestRateIdsId").val().split(",");
			var interestRate = $("#interestRatesId").val().split(",");
			for(var i =0 ; i<interestRateId.length; i++) {
				if(i==0)
					$('#subCategoryId').empty().append('<option value='+interestRateId[i]+'>'+interestRate[i]+'</option>').selectmenu('refresh');
				else
					$('#subCategoryId').append('<option value='+interestRateId[i]+'>'+interestRate[i]+'</option>').selectmenu('refresh');
			}
		}
		
		if($("#categoryId").val() == 2) {
			var loanAmountId = $("#loanAmountIdsId").val().split(",");
			var loanAmountName = $("#loanAmountNamesId").val().split(",");
			for(var i =0 ; i<loanAmountId.length; i++) {
				if(i==0)
					$('#subCategoryId').empty().append('<option value='+loanAmountId[i]+'>'+loanAmountName[i]+'</option>').selectmenu('refresh');
				else
					$('#subCategoryId').append('<option value='+loanAmountId[i]+'>'+loanAmountName[i]+'</option>').selectmenu('refresh');
			}
		}
		if($("#categoryId").val() == 3) {
			var loanCycleId = $("#loanCycleIdsId").val().split(",");
			var loanCycleName = $("#loanCycleNamesId").val().split(",");
			for(var i =0 ; i<loanCycleId.length; i++) {
				if(i==0)
					$('#subCategoryId').empty().append('<option value='+loanCycleId[i]+'>'+loanCycleName[i]+'</option>').selectmenu('refresh');
				else
					$('#subCategoryId').append('<option value='+loanCycleId[i]+'>'+loanCycleName[i]+'</option>').selectmenu('refresh');
			}
		}
		if($("#categoryId").val() == 4) {
			var loanProductId = $("#loanProductIdsId").val().split(",");
			var loanProductName = $("#loanProductNamesId").val().split(",");
			for(var i =0 ; i<loanProductId.length; i++) {
				if(i==0)
					$('#subCategoryId').empty().append('<option value='+loanProductId[i]+'>'+loanProductName[i]+'</option>').selectmenu('refresh');
				else
					$('#subCategoryId').append('<option value='+loanProductId[i]+'>'+loanProductName[i]+'</option>').selectmenu('refresh');
			}
		}
		if($("#categoryId").val() == 5) {
			var loanPurposeId = $("#loanPurposeIdsId").val().split(",");
			var loanPurposeName = $("#loanPurposeNamesId").val().split(",");
			for(var i =0 ; i<loanPurposeId.length; i++) {
				if(i==0)
					$('#subCategoryId').empty().append('<option value='+loanPurposeId[i]+'>'+loanPurposeName[i]+'</option>').selectmenu('refresh');
				else
					$('#subCategoryId').append('<option value='+loanPurposeId[i]+'>'+loanPurposeName[i]+'</option>').selectmenu('refresh');
			}
		}
		if($("#categoryId").val() == 6) {
			var loanSizeId = $("#loanSizeIdsId").val().split(",");
			var loanSizeName = $("#loanSizeNamesId").val().split(",");
			for(var i =0 ; i<loanSizeId.length; i++) {
				if(i==0)
					$('#subCategoryId').empty().append('<option value='+loanSizeId[i]+'>'+loanSizeName[i]+'</option>').selectmenu('refresh');
				else
					$('#subCategoryId').append('<option value='+loanSizeId[i]+'>'+loanSizeName[i]+'</option>').selectmenu('refresh');
			}
		}
		if($("#categoryId").val() == 7) {
			var stateId = $("#stateIdsId").val().split(",");
			var stateName = $("#stateNamesId").val().split(",");
			for(var i =0 ; i<stateId.length; i++) {
				if(i==0)
					$('#subCategoryId').empty().append('<option value='+stateId[i]+'>'+stateName[i]+'</option>').selectmenu('refresh');
				else
					$('#subCategoryId').append('<option value='+stateId[i]+'>'+stateName	[i]+'</option>').selectmenu('refresh');
			}
		}
		
		
		$("#selectedCategoryLabelDivId").show();
		$("#selectedCategoryTextDivId").show();
		//$('#subCategoryId').empty().append('<option value=1>My option</option>').selectmenu('refresh');
		$("#subCategoryId").val($('#selectedSubCategoryId').val()).selectmenu("refresh");
	}
	else{
		$("#selectedCategoryLabelDivId").hide();
		$("#selectedCategoryTextDivId").hide();
	}
}
