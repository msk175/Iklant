// Added by chitra
$(window).load(function(){
    // for export the reports, " report page name" and "form name" must be same.
    if($("#report_download_flag").val() == "Download" && $("#selectedDocName").val() != undefined && $("#selectedDocName").val() != ""){
        //$.mobile.showPageLoadingMsg();
        document.getElementById($("#reportPageName").val()).method='POST';
        document.getElementById($("#reportPageName").val()).action=localStorage.contextPath+'/client/ci/downloadDocs';
        document.getElementById($("#reportPageName").val()).submit();
    }
    /*else if($("#report_download_flag").val() == "No Records"){
        $("#errorField").text("No Records Found for this Filter");
    }*/
});

$(document).ready(function() {
$("#grps").hide();
$("#dashboarddiv").hide();

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

 //Added by ashok for fixed header tables
    $(document).ready(function() {

        $('#fixedHeader_summary').dataTable( {
            "scrollY": 400,
            "scrollX": true,
            "bPaginate": false,
            "bSort": false,
            "bFilter": false,
            "bInfo": false
        } );
        $('#fixedHeader_detailedsummary').dataTable( {
            "scrollY": 400,
            "scrollX": true,
            "bPaginate": false,
            "bSort": false,
            "bFilter": false,
            "bInfo": false
        } );
    } );

});
// Edited By SathishKumar M
// To Generate all cash and bank transactions
function transactionHistoryReport(formId,download_msg) {
    $("#report_download_flag").val("");
    $("#reportType").val(download_msg);
    var startdate = new Date($("#todate").val());
    var enddate = new Date($("#todate").val());

        if (enddate != 'Invalid Date') {
            $.mobile.showPageLoadingMsg();
            if(download_msg == 'Download'){
                $("#report_download_flag").val("Download");
            }
            document.getElementById(formId).method = 'POST';
            document.getElementById(formId).action = localStorage.contextPath+'/client/ci/transactionHistoryGenerate';
            document.getElementById(formId).submit();
        }
        else {
            $("#errorField").text("Please select the date to view report");
        }
}