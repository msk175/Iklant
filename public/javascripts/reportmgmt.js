// Added by chitra
$(window).load(function(){
    // for export the reports, " report page name" and "form name" must be same.
    if($("#report_download_flag").val() == "Download" && $("#selectedDocName").val() != undefined && $("#selectedDocName").val() != ""){
        //$.mobile.showPageLoadingMsg();
        document.getElementById($("#reportPageName").val()).method='POST';
        document.getElementById($("#reportPageName").val()).action=localStorage.contextPath+'/client/ci/downloadDocs';
        document.getElementById($("#reportPageName").val()).submit();
    }
    // Added by Chitra 003 For New Version Report Management


    /*else if($("#report_download_flag").val() == "No Records"){
        $("#errorField").text("No Records Found for this Filter");
    }*/
});

$(document).ready(function() {
$("#grps").hide();
$("#dashboarddiv").hide();
$("#ledgerNameCB").val($("#listledgerCB option:selected").text());
$("#ledgerNameBB").val($("#listledgerBB option:selected").text());
$("#ledgerNameGL").val($("#ledger_id option:selected").text());

if($("#selectedDocName").val() == ""){
        $("#downloadDiv").hide();
    }else{
        $("#generateButtonDiv").hide();
    }

// Added by Paramasivan
$(function() {
    $( ".fromDate" ).datepicker({
        maxDate: new Date,
        dateFormat: 'yy-mm-dd',
        changeMonth: true,
        changeYear: true
    });
});
$(function() {
        $( ".toDate" ).datepicker({
            maxDate: new Date,
            dateFormat: 'yy-mm-dd',
            changeMonth: true,
            changeYear: true
        });
});
$(".fromdate").keypress(function(e){ e.preventDefault(); });
$(".todate").keypress(function(e){ e.preventDefault(); });

// added temp for fin reports
    $(function() {
        $( ".finFromDate" ).datepicker({
            maxDate: new Date,
            dateFormat: 'yy-mm-dd',
            changeMonth: true,
            changeYear: true
        });
    });
    $(function() {
        $( ".finToDate" ).datepicker({
            maxDate: new Date,
            dateFormat: 'yy-mm-dd',
            changeMonth: true,
            changeYear: true
        });
    });
    $(".finFromDate").keypress(function(e){ e.preventDefault(); });
    $(".finToDate").keypress(function(e){ e.preventDefault(); });

// For trail balance date restriction within financial year
if($('#reportName').val() === 'financialReports'){
    $(function() {
        /*var selectedFinId = $("#finYearId").val();
        var finIdArray = $("#finYearIdArray").val().split(',');
        var startDateArray = $("#startDateArray").val().split(',');
        var endDateArray = $("#endDateArray").val().split(',');
        $("#finStartDate").val('');
        $("#finEndDate").val('');
        for(var i=0;i<finIdArray.length;i++){
            if((finIdArray[i] == selectedFinId) || (selectedFinId == -1)) {
                $(".finFromDate").datepicker({minDate: new Date(startDateArray[i]),maxDate: new Date(endDateArray[i]),
                    dateFormat: 'yy-mm-dd',changeMonth: true,changeYear: true});
                $(".finToDate").datepicker({minDate: new Date(startDateArray[i]),maxDate: new Date(endDateArray[i]),
                    dateFormat: 'yy-mm-dd',changeMonth: true,changeYear: true});
            }
        } */
        $(".finFromDate").datepicker("destroy");
        $(".finToDate").datepicker("destroy");
       // $(".finFromDate").val("");
        //$(".finToDate").val("");
        var selectedFinId = $("#finYearId").val();
        var finIdArray = $("#finYearIdArray").val().split(',');
        var startDateArray = $("#startDateArray").val().split(',');
        var endDateArray = $("#endDateArray").val().split(',');
        for(var i=0;i<finIdArray.length;i++){
            if((finIdArray[i] == selectedFinId) || (selectedFinId == -1)) {
                $(".finFromDate").datepicker({minDate: new Date(startDateArray[i]),maxDate: new Date(),
                    dateFormat: 'yy-mm-dd',changeMonth: true,changeYear: true});
                $(".finToDate").datepicker({minDate: new Date(startDateArray[i]),maxDate: new Date(),
                    dateFormat: 'yy-mm-dd',changeMonth: true,changeYear: true});
            }
        }
    });

// For trail balance date restriction within financial year while changing financial year
    $('#finYearId').on('change',function() {
        $(".finFromDate").datepicker("destroy");
        $(".finToDate").datepicker("destroy");
        $(".finFromDate").val("");
        $(".finToDate").val("");
        var selectedFinId = $("#finYearId").val();
        var finIdArray = $("#finYearIdArray").val().split(',');
        var startDateArray = $("#startDateArray").val().split(',');
        var endDateArray = $("#endDateArray").val().split(',');
        for(var i=0;i<finIdArray.length;i++){
            if((finIdArray[i] == selectedFinId) || (selectedFinId == -1)) {
                $(".finFromDate").datepicker({minDate: new Date(startDateArray[i]),maxDate: new Date(),
                    dateFormat: 'yy-mm-dd',changeMonth: true,changeYear: true});
                $(".finToDate").datepicker({minDate: new Date(startDateArray[i]),maxDate: new Date(),
                    dateFormat: 'yy-mm-dd',changeMonth: true,changeYear: true});
            }
        }
    });
}

// Added by Paramasivan
// for demand collection reports which also allows future dates
    $(function () {
        $(".fromDateDC").datepicker({
            dateFormat: 'yy-mm-dd',
            changeMonth: true,
            changeYear: true
        });
    });
    $(function () {
        $(".toDateDC").datepicker({
            dateFormat: 'yy-mm-dd',
            changeMonth: true,
            changeYear: true
        });
    });
    $(".fromdateDC").keypress(function (e) {
        e.preventDefault();
    });
    $(".todateDC").keypress(function (e) {
        e.preventDefault();
    });

  // Groups in various stages
  $("#report").click(function(){
    $("#grps").show();
    $("#reportMenu").hide();
	$("#statusdesc").val('0').selectmenu("refresh");
	
  });

   $("#back").click(function(){
    $("#grps").hide();
	$("#trailBalanceDiv").hide();
    $("#groupOutstandingDiv").hide();
    $("#reportMenu").show();
  }); 
  $("#backIDTB").click(function(){
    $("#grps").hide();
	$("#trailBalanceDiv").hide();
    $("#groupOutstandingDiv").hide();
    $("#reportMenu").show();
});

   // For the Dashboard
$("#dashboard").click(function(){
    $("#dashboarddiv").show();
});

  // For the Equifax Reports
 $("#equifaxReportsId").click(function(){
     $.mobile.showPageLoadingMsg();
	document.getElementById("reportformid").method='POST';
	document.getElementById("reportformid").action=localStorage.contextPath+"/client/ci/generateEquifaxReport";
	document.getElementById("reportformid").submit();
});

//function to load documentVerificationGroupList page
$("#docVerificationAnchorId").click(function(){
    $.mobile.showPageLoadingMsg();
    document.getElementById("reportformid").method='POST';
    document.getElementById("reportformid").action=localStorage.contextPath+"/client/ci/reportManagement/docVerificationGroupList";
    document.getElementById("reportformid").submit();
});

 /* //loanDisbursalReport submission
$("#loanDisbursalReportId").click(function(){
	$('#reportformid').attr('method', 'GET'); 
	$('#reportformid').attr('action', localStorage.contextPath+'/client/ci/loanDisbursalReport');
	$('#reportformid').submit();
	
});
//loanOutstandingReport submission
$("#loanOutstandingReportId").click(function(){
	$('#reportformid').attr('method', 'GET'); 
	$('#reportformid').attr('action', localStorage.contextPath+'/client/ci/loanOutstandingReport');
	$('#reportformid').submit();
	
});   */
    //Added by ashok for fixed header tables 
    $(document).ready(function() {

        $('#fixedHeader_summary').dataTable( {
            "scrollY": 300,
            "scrollX": true,
            "bPaginate": false,
            "bSort": false,
            "bFilter": false,
            "bInfo": false
        } );
        $('#fixedHeader_summary_full').dataTable( {
            "scrollY": 390,
            "scrollX": true,
            "bPaginate": false,
            "bSort": false,
            "bFilter": false,
            "bInfo": false
        } );
        $('#fixedHeader_detailedsummary').dataTable( {
            "scrollY": 350,
            "scrollX": true,
            "bPaginate": false,
            "bSort": false,
            "bFilter": false,
            "bInfo": false
        } );
        $('#fixedHeader_detailedsummary_full').dataTable( {
            "scrollY": 450,
            "scrollX": true,
            "bPaginate": false,
            "bSort": false,
            "bFilter": false,
            "bInfo": false
        } );
    } );

});

function generateGroupsVariousStagesReport(form_id,download_msg) {
    $("#report_download_flag").val("");
	var startdate =new Date(($("#fromdateValue").val()));
	var enddate =new Date(($("#fromdateValue").val()));
    if(startdate <= enddate && startdate != 'Invalid Date' && enddate != 'Invalid Date'){
        $.mobile.showPageLoadingMsg();
        if(download_msg == 'Download'){
            $("#report_download_flag").val("Download");
        }
        document.getElementById(form_id).method='POST';
        document.getElementById(form_id).action=localStorage.contextPath+'/client/ci/generateReport';
        document.getElementById(form_id).submit();
    }else{
        $("#errorField").text("End Date Should Be Greater Than Or Equal To From Date");
    }
}

// Added by chitra
function generateInsuranceCoverReport(form_id,download_msg){
    $("#report_download_flag").val("");
    var startdateICR = $("#fromdateICR").val();
    var enddateICR = $("#todateINS").val();
    if( enddateICR  >= startdateICR && (startdateICR != '' && enddateICR != '')){
        $.mobile.showPageLoadingMsg();
        if(download_msg == 'Download'){
            $("#report_download_flag").val("Download");
        }
        document.getElementById(form_id).method='POST';
        document.getElementById(form_id).action=localStorage.contextPath+'/client/ci/reports/insuranceCoverReport';
        document.getElementById(form_id).submit();
    }
    else{
        $("#errorField").text("End Date Should Be Greater Than Or Equal To From Date");
    }
}

function generateBankBookReport(form_id,download_msg){
    $("#report_download_flag").val("");
    var startdateBB = ($("#fromdateBB").val());
    var enddateBB =($("#todateBB").val());
    if(document.getElementById('accOperation').checked == true||document.getElementById('mfiOperation').checked == true){
        if( enddateBB  >= startdateBB && (startdateBB != '' && enddateBB != '')){
            var maxEndDate = addDays(92,startdateBB);
            if(new Date(enddateBB)  <= maxEndDate){
                $.mobile.showPageLoadingMsg();
                if(download_msg == 'Download'){
                    $("#report_download_flag").val("Download");
                }
                $("#reportType").val(download_msg);
                document.getElementById(form_id).method='POST';
                document.getElementById(form_id).action=localStorage.contextPath+'/client/ci/reports/BankBookReport';
                document.getElementById(form_id).submit();
            }else{
                $("#errorField").text("Please Select between three month");
            }

        }
        else{
            $("#errorField").text("End Date Should Be Greater Than Or Equal To From Date");
        }
    }
    else{
        $("#errorField").text("Please select any operation to generate report");
    }
}

function generateCashBookReport(form_id,download_msg){
    $("#report_download_flag").val("");
    var startdateCB = ($("#fromdateCB").val());
    var enddateCB =($("#todateCB").val());
    if(document.getElementById('accOperation').checked == true||document.getElementById('mfiOperation').checked == true){
        if( enddateCB  >= startdateCB && (startdateCB != '' && enddateCB != '')){
            var maxEndDate = addDays(92,startdateCB);
            if(new Date(enddateCB)  <= maxEndDate){
                $.mobile.showPageLoadingMsg();
                if(download_msg == 'Download'){
                    $("#report_download_flag").val("Download");
                }
                $("#reportType").val(download_msg);
                document.getElementById(form_id).method='POST';
                document.getElementById(form_id).action=localStorage.contextPath+'/client/ci/reports/CashBookReport';
                document.getElementById(form_id).submit();
            }else{
                $("#errorField").text("Please Select between three month");
            }
        }
        else{
            $("#errorField").text("End Date Should Be Greater Than Or Equal To From Date");
        }
    }
    else{
        $("#errorField").text("Please select any operation to generate report");
    }
}

// Generate the Report with filter from_date,to_date,office for the reports[Loan Disb,Loan Repayment,loan transanction]
function generateReportPageWithOfficeDate(form_id,download_msg){
    $("#report_download_flag").val("");
    var startdate = ($("#fromdateValue").val());
    var enddate =($("#todateValue").val());
    if( enddate  >= startdate && (startdate != '' && enddate != '')){
        var maxEndDate = addDays(92,startdate);
        if(form_id == 'profitLossReport'){
            $.mobile.showPageLoadingMsg();
            if(download_msg == 'Download'){
                $("#report_download_flag").val('Download');
            }
            $("#reportType").val(download_msg);
            document.getElementById(form_id).method='POST';
            document.getElementById(form_id).action=localStorage.contextPath+'/client/ci/reports/generateReportWithOfficeDate';
            document.getElementById(form_id).submit();
        }
        else if(new Date(enddate)  <= maxEndDate){
            $.mobile.showPageLoadingMsg();
            if(download_msg == 'Download'){
                $("#report_download_flag").val('Download');
            }
            $("#reportType").val(download_msg);
            document.getElementById(form_id).method='POST';
            document.getElementById(form_id).action=localStorage.contextPath+'/client/ci/reports/generateReportWithOfficeDate';
            document.getElementById(form_id).submit();
        }else{
            $("#errorField").text("Please Select between three month");
        }
    }
    else{
        $("#errorField").text("End Date Should Be Greater Than Or Equal To From Date");
    }
}

// Generate the Report with filter from_date,to_date,office,customer,account_no for the reports[Loan Disb,Loan Repayment,loan transanction]
function generateReportPageWithOfficeDateCustomerAccount(form_id,download_msg){
    $("#report_download_flag").val("");
    var startdate = ($("#fromdateValue").val());
    var enddate =($("#todateValue").val());
    if( enddate  >= startdate && (startdate != '' && enddate != '') ){
        var maxEndDate = addDays(92,startdate);
        if(form_id == 'groupLedgerReport'){
            $.mobile.showPageLoadingMsg();
            if(download_msg == 'Download'){
                $("#report_download_flag").val("Download");
            }
            $("#reportType").val(download_msg);
            document.getElementById(form_id).method='POST';
            document.getElementById(form_id).action=localStorage.contextPath+'/client/ci/reports/generateReportWithOfficeDateCustomerAccount';
            document.getElementById(form_id).submit();
        }
       else if(new Date(enddate)  <= maxEndDate){
            $.mobile.showPageLoadingMsg();
            if(download_msg == 'Download'){
                $("#report_download_flag").val("Download");
            }
            $("#reportType").val(download_msg);
            document.getElementById(form_id).method='POST';
            document.getElementById(form_id).action=localStorage.contextPath+'/client/ci/reports/generateReportWithOfficeDateCustomerAccount';
            document.getElementById(form_id).submit();
        }else{
            $("#errorField").text("Please Select between three month");
        }
    }
    else{
        $("#errorField").text("End Date Should Be Greater Than Or Equal To From Date");
    }
}

// Generate the report for Loan,Group Account Default Payments
function generateReportPageAccountDefaultPayments(form_id,download_msg){
    $("#report_download_flag").val("");
    var enddate =($("#todateValue").val());
    if(enddate != ''){
        $.mobile.showPageLoadingMsg();
        if(download_msg == 'Download'){
            $("#report_download_flag").val("Download");
        }
        $("#reportType").val(download_msg);
        document.getElementById(form_id).method='POST';
        document.getElementById(form_id).action=localStorage.contextPath+'/client/ci/reports/accountDefaultPaymentsReport';
        document.getElementById(form_id).submit();
    }else{
        $("#errorField").text("End Date Should Be Greater Than Or Equal To From Date");
    }
}

// Ended by chitra

function showEquifaxReport(groupId){
	//alert("Hello");
    $.mobile.showPageLoadingMsg();
	document.getElementById("reportformid").method='POST';
	document.getElementById("reportformid").action=localStorage.contextPath+'/client/ci/generateEquifaxReport/'+groupId+'/viewClient';
	document.getElementById("reportformid").submit();
	/*$('#reportformid').attr('method', 'POST'); 
	$('#reportformid').attr('action', localStorage.contextPath+'/client/ci/generateEquifaxReport/'+groupId+'/viewClient');
	$('#reportformid').submit();*/
}

function generateDashboardReport(selectThis) {
	value = $(selectThis).val();
	if(value != 0) {
        $.mobile.showPageLoadingMsg();
		document.getElementById("BMFormId").method='POST';
		document.getElementById("BMFormId").action=localStorage.contextPath+"/client/ci/generate/"+value+"/dashboard";
		document.getElementById("BMFormId").submit();
	}
}
// Added by Paramasivan
// To submit trail balance form
function generateTBReport(formId,download_msg) {
    $("#report_download_flag").val("");
    var startdate = new Date($("#fromdate").val());
    var enddate = new Date($("#todate").val());
    if(document.getElementById('accOperation').checked == true||document.getElementById('mfiOperation').checked == true){
        if (startdate <= enddate && startdate != 'Invalid Date' && enddate != 'Invalid Date') {
            $.mobile.showPageLoadingMsg();
            if(download_msg == 'Download'){
                $("#report_download_flag").val("Download");
            }
            document.getElementById(formId).method = 'POST';
            document.getElementById(formId).action = localStorage.contextPath+'/client/ci/trailBalance';
            document.getElementById(formId).submit();
        }
        else {
            $("#errorField").text("End Date Should Be Greater Than Or Equal To From Date");
        }
    }
    else{
        $("#errorField").text("Please select any operation to generate report");
    }
}

// To submit overdue form
function generateODReport(download_msg) {
    $("#report_download_flag").val("");
    $("#reportType").val(download_msg);
    var toDate = new Date($('#todate').val());
    if (toDate != 'Invalid Date') {
        $.mobile.showPageLoadingMsg();
        if(download_msg == 'Download'){
            $("#report_download_flag").val("Download");
        }
        document.getElementById("overdueSummary").method = 'POST';
        document.getElementById("overdueSummary").action = localStorage.contextPath+'/client/ci/overdueSummary';
        document.getElementById("overdueSummary").submit();
    }
    else {
        $("#errorField").text("Please select the to date to view report");
    }
}

// To submit demand collection form
function generateDCReport(formId,download_msg) {
    $("#report_download_flag").val("");
    $("#reportType").val(download_msg);
    $("#reportCategory").val($('input[name="radio"]:checked').val());
    var startdate = new Date($("#fromdate").val());
    var enddate = new Date($("#todate").val());
    if (startdate <= enddate && startdate != 'Invalid Date' && enddate != 'Invalid Date') {
        $.mobile.showPageLoadingMsg();
        if(download_msg == 'Download'){
            $("#report_download_flag").val("Download");
        }
        document.getElementById(formId).method = 'POST';
        document.getElementById(formId).action = localStorage.contextPath+'/client/ci/demandCollectionSummary';
        document.getElementById(formId).submit();
    }
    else {
        $("#errorField").text("End Date Should Be Greater Than Or Equal To From Date");
    }
}

// To submit general ledger form
function generateGLReport(download_msg) {
    $("#report_download_flag").val("");
    $("#reportType").val(download_msg);
    var startdate = new Date($("#fromdate").val());
    var enddate = new Date($("#todate").val());
    if(document.getElementById('accOperation').checked == true||document.getElementById('mfiOperation').checked == true){
        $.mobile.showPageLoadingMsg();
        if(download_msg == 'Download'){
            $("#report_download_flag").val("Download");
        }
        document.getElementById("generalLedgerSummary").method = 'POST';
        document.getElementById("generalLedgerSummary").action = localStorage.contextPath+'/client/ci/generalLedger';
        document.getElementById("generalLedgerSummary").submit();
    }
    else{
        $("#errorField").text("Please select any operation to generate report");
    }
}

// To submit cash, bank, journa and contra, loan disbursement repayment forms
function generateVoucherAndReceiptReport(formId,download_msg) {
    $("#report_download_flag").val("");
    $("#reportType").val(download_msg);
    var startdate = new Date($("#fromdate").val());
    var enddate = new Date($("#todate").val());
    if($('#reportPageName').val() != 'loanDisbursementAndRepaymentSummary'){
        if(document.getElementById('accOperation').checked == true||document.getElementById('mfiOperation').checked == true){
            if (startdate <= enddate && startdate != 'Invalid Date' && enddate != 'Invalid Date') {
                var maxEndDate = addDays(92,startdate);
                if(new Date(enddate)  <= maxEndDate){
                    $.mobile.showPageLoadingMsg();
                    if(download_msg == 'Download'){
                        $("#report_download_flag").val("Download");
                    }
                    document.getElementById(formId).method = 'POST';
                    document.getElementById(formId).action = localStorage.contextPath+'/client/ci/voucherOrReceiptOrLoanDisbursementRepayment';
                    document.getElementById(formId).submit();
                }else{
                    $("#errorField").text("Please Select between three month");
                }
            }
            else {
                $("#errorField").text("End Date Should Be Greater Than Or Equal To From Date");
            }
        }
        else{
            $("#errorField").text("Please select any operation to generate report");
        }
    }
    else{
        if (startdate <= enddate && startdate != 'Invalid Date' && enddate != 'Invalid Date') {
            var maxEndDate = addDays(92,startdate);
            if(new Date(enddate)  <= maxEndDate){
                $.mobile.showPageLoadingMsg();
                if(download_msg == 'Download'){
                    $("#report_download_flag").val("Download");
                }
                document.getElementById(formId).method = 'POST';
                document.getElementById(formId).action = localStorage.contextPath+'/client/ci/voucherOrReceiptOrLoanDisbursementRepayment';
                document.getElementById(formId).submit();
            }else{
                $("#errorField").text("Please Select between three month");
            }
        }
        else {
            $("#errorField").text("End Date Should Be Greater Than Or Equal To From Date");
        }
    }
}

// To submit all principal outstanding forms
function generatePrincipalOutstandingReport(formId,download_msg) {
    $("#report_download_flag").val("");
    $("#reportType").val(download_msg);
    var enddate = new Date($("#todate").val());
    if (enddate != 'Invalid Date') {
        $.mobile.showPageLoadingMsg();
        if(download_msg == 'Download'){
            $("#report_download_flag").val("Download");
        }
        document.getElementById(formId).method = 'POST';
        document.getElementById(formId).action = localStorage.contextPath+'/client/ci/principalOutstandingSummary';
        document.getElementById(formId).submit();
    }
    else {
        $("#errorField").text("Please select the date to view report");
    }
}

// To select/deselect accounting/mfi operation
function checkUnCheck(id)
{
    if(document.getElementById(id).checked == true)
    {
        $('#'+id).val('on');
        if(id == 'mfiOperation'){
            $('.fo').show();
        }
    }
    else{
        $('#'+id).val('off');
        if(id == 'mfiOperation'){
            $("#loanOfficerId").val('-1').selectmenu("refresh");
            $('.fo').hide();
        }
    }
}

function loadFO(){
    document.getElementById('loanOfficerId').options.length = 0;
    var dropDown = document.getElementById("loanOfficerId");
    var option = document.createElement("option");
    option.text = "All";
    option.value ="-1";
    try {
        dropDown.add(option, null);
    }catch(error) {
        dropDown.add(option);
    }
    $("#loanOfficerId").val('-1').selectmenu("refresh");
    $.post("http://"+ajaxcallip+localStorage.contextPath+"/client/ci/loanOfficers",
        { listoffice: $("#listoffice").val()},
        function (dataValue) {
            var data = dataValue.personnelIdArray;
            var dataName = dataValue.personnelNameArray;
            for(var i=0;i<data.length;i++){
                var dropDown = document.getElementById("loanOfficerId");
                if(!dataName[i] == '' || !dataName[i] == null){
                    option = document.createElement("option");
                    option.text = dataName[i];
                    option.value =data[i];
                    try {
                        dropDown.add(option, null);
                    }catch(error) {
                        dropDown.add(option);
                    }
                }
            }
        }
    );
}
function gen(ledger_name_array,glcode_array){
    var ledger_name = ledger_name_array.split(',');
    var glcode_name = glcode_array.split(',');
    var selected_ledger = $("#listledgerBB").val();
    for(var i=0;i<ledger_name.length;i++){
       if(selected_ledger == glcode_name[i]){
          var ledger = ledger_name[i];
       }
    }
    $("#selected_ledger_name").val(ledger);
}
function generateDEOActivityReport(download_msg){
    $("#report_download_flag").val("");
    $("#reportType").val(download_msg);
    var startdate = new Date($("#fromdate").val());
    var enddate = new Date($("#todate").val());
    if (startdate <= enddate && startdate != 'Invalid Date' && enddate != 'Invalid Date') {
        $.mobile.showPageLoadingMsg();
        if(download_msg == 'Download'){
            $("#report_download_flag").val("Download");
        }
        document.getElementById('DEOActivityTrackingReport').method = 'POST';
        document.getElementById('DEOActivityTrackingReport').action = localStorage.contextPath+'/client/ci/DEOActivityTracking';
        document.getElementById('DEOActivityTrackingReport').submit();
    }
    else {
        $("#errorField").text("Please select correct date to view report");
    }
}
//Edited By Ashok
/*
* For Character Restriction in Text Box
**/
$(document).ready(function() {
    $("#days_in_arrears").keydown(function(e) {
        if (e.shiftKey || e.ctrlKey || e.altKey) {
            e.preventDefault();
        } else {
            var key = e.keyCode;
            if (!((key == 8) || (key == 46) || (key >= 35 && key <= 40) || (key >= 48 && key <= 57) || (key >= 96 && key <= 105))) {
                e.preventDefault();
            }
        }
    });
});

function generatePARReport(download_msg){
    $("#report_download_flag").val("");
    $("#reportType").val(download_msg);
    var enddate = new Date($("#todate").val());
    if (enddate != 'Invalid Date') {
        if($('#days_in_arrears').val() != '' && $('#days_in_arrears').val() != undefined) {
            $.mobile.showPageLoadingMsg();
            if (download_msg == 'Download') {
                $("#report_download_flag").val("Download");
            }
            document.getElementById('PARReport').method = 'POST';
            document.getElementById('PARReport').action = localStorage.contextPath+'/client/ci/PARReport';
            document.getElementById('PARReport').submit();
        }
        else{
            $("#errorField").text("Please fill all fields");
        }
    }
    else{
        $("#errorField").text("Please select correct date to view report");
    }
}
//added Sathish Kumar M
//for Ledgername display
function generateLedgerBankBook(){
    //alert($("#listledgerBB option:selected").text());
    $("#ledgerNameBB").val($("#listledgerBB option:selected").text());

}
function generateLedgerCashBook(){
    //alert($("#listledgerBB option:selected").text());
    $("#ledgerNameCB").val($("#listledgerCB option:selected").text());

}
function generateGroupLedger(){
    //alert($("#listledgerBB option:selected").text());
    $("#ledgerNameGL").val($("#ledger_id option:selected").text());

}

function generateLUCTrackingReport(pageName,download_msg){
    $("#report_download_flag").val("");
    $("#reportType").val(download_msg);
    var startdate = new Date($("#fromdate").val());
    var enddate = new Date($("#todate").val());
    if (startdate <= enddate && startdate != 'Invalid Date' && enddate != 'Invalid Date') {
        $.mobile.showPageLoadingMsg();
        if(download_msg == 'Download'){
            $("#report_download_flag").val("Download");
        }
        document.getElementById('LUCTracking').method = 'POST';
        document.getElementById('LUCTracking').action = localStorage.contextPath+'/client/ci/LUCTrackingReport';
        document.getElementById('LUCTracking').submit();
    }
    else {
        $("#errorField").text("Please select correct date to view report");
    }
}

function generateReport(download_msg,dateFieldCount){
    $("#reportType").val(download_msg);
    var fromDate = $("#fromdate").val();
    var toDate = $("#todate").val();
    if(fromDate != "" && toDate != ""){
        var startdate = new Date(fromDate);
        var enddate = new Date(toDate);
        var flag = (dateFieldCount == 0)?true:false;
        if(flag){
            $.mobile.showPageLoadingMsg();
            document.getElementById('reportManagementForm').method = 'POST';
            document.getElementById('reportManagementForm').action = localStorage.contextPath+'/client/ci/generateSelectedReport';
            document.getElementById('reportManagementForm').submit();
            $("#errorField").text("");
        }else if (((startdate <= enddate) && (startdate != 'Invalid Date') && (enddate != 'Invalid Date'))) {
            var maxEndDate = addDays(92,startdate);
            if(enddate  <= maxEndDate){
                $.mobile.showPageLoadingMsg();
                document.getElementById('reportManagementForm').method = 'POST';
                document.getElementById('reportManagementForm').action = localStorage.contextPath+'/client/ci/generateSelectedReport';
                document.getElementById('reportManagementForm').submit();
                $("#errorField").text("");
            }else{
                if($("#reportName").val() == 'General Ledger'){
                    $.mobile.showPageLoadingMsg();
                    document.getElementById('reportManagementForm').method = 'POST';
                    document.getElementById('reportManagementForm').action = localStorage.contextPath+'/client/ci/generateSelectedReport';
                    document.getElementById('reportManagementForm').submit();
                    $("#errorField").text("");
                }
                else {
                    $("#errorField").text("Please select between three month");
                }
            }
        }else {
            $("#errorField").text("To Date must be greater than From Date");
        }
    }
    else {
        $("#errorField").text("Please select the date.");
    }
}

function downloadReport(){
    document.getElementById("reportManagementForm").method='POST';
    document.getElementById("reportManagementForm").action=localStorage.contextPath+'/client/ci/downloadDocs';
    document.getElementById("reportManagementForm").submit();
    $("#downloadDiv").hide();
    $("#generateButtonDiv").show();
}

function addDays(days,date_value) {
    var thisDate = new Date(date_value);
    thisDate.setDate(thisDate.getDate() + days);
    return thisDate;
}
