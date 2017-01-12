$(document).ready(function() {
    window.history.forward();
    $("#reportNameId").keypress(function(event){
        var regex = new RegExp("^[a-zA-Z0-9 _]+$");
        var key = String.fromCharCode(!event.charCode ? event.which : event.charCode);
        if (!regex.test(key)) {
            event.preventDefault();
            return false;
        }
    });

    $("#storedProcedureNameId").keypress(function(event){
        var regex = new RegExp("^[a-zA-Z0-9 _]+$");
        var key = String.fromCharCode(!event.charCode ? event.which : event.charCode);
        if (!regex.test(key)) {
            event.preventDefault();
            return false;
        }
    });



    $("#reportNameId").focusout(function(event){
        var currentVal = $(this).val();
        var regex = new RegExp("^[a-zA-Z0-9 _]+$");
        if (!regex.test(currentVal)) {
            $(this).val("");

        }
    });

    $("#storedProcedureNameId").focusout(function(event){
        var currentVal = $(this).val();
        var regex = new RegExp("^[a-zA-Z0-9 _]+$");
        if (!regex.test(currentVal)) {
            $(this).val("");

        }
    });
    $("#createId").click(function(){
        var reportParameterValues = $('input[name=reportParameter]:checked').map(function()
        {
            return $(this).val();
        }).get();
        var reportRoleValues = $('input[name=reportRole]:checked').map(function()
        {
            return $(this).val();
        }).get();
        var reportCategory = $("#reportCategoryId").val();
        var reportName = $("#reportNameId").val().trim();
        var storedProcedureName = $("#storedProcedureNameId").val().trim();
        if(reportParameterValues != '' && reportRoleValues != '' && reportCategory != 0 && reportName != '' && storedProcedureName != ''){
            $("#errorMessageIdManageReport").text("");
            document.getElementById("ReportFormId").method='POST';
            document.getElementById("ReportFormId").action=localStorage.contextPath+"/admin/ci/createDynamicReport";
            document.getElementById("ReportFormId").submit();

        }else{
            $("#errorMessageIdManageReport").text("Please select or fill all the fields");
            $(window).scrollTop(0);
        }
    })
})
function showAddReportView(){
    $.mobile.showPageLoadingMsg();
    document.getElementById("ReportFormId").method='POST';
    document.getElementById("ReportFormId").action=localStorage.contextPath+"/admin/ci/addreportview";
    document.getElementById("ReportFormId").submit();
}
function operationBack() {
    $.mobile.showPageLoadingMsg();
    document.getElementById("ReportFormId").method='GET';
    document.getElementById("ReportFormId").action=localStorage.contextPath+"/admin/ci/listreports";
    document.getElementById("ReportFormId").submit();
}


