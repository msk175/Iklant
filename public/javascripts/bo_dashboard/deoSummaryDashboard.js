
$(document).ready(function() { // For select transaction date @ Paramasivan
    var endDate = new Date();
    /*var dd = endDate.getDate();
     var mm = endDate.getMonth()+1;
     var yy = endDate.getFullYear();

     var dateStr = dd+'/'+mm+'/'+yy;
     if($("#transactionMaxDateId").val() > dateStr){
     var endDate = new Date;
     }
     else{
     var endDate = $("#transactionMaxDateId").val();
     }*/
    $(function() {
        $("#fromDateId" ).datepicker({
            minDate: '2015-07-01',
            maxDate: endDate,
            dateFormat: 'yy-mm-dd',
            yearRange: "-90:+0",
            changeMonth: true,
            changeYear: true,

        });
    });
    $(function() {
        $("#toDateId" ).datepicker({
            minDate: $("#fromDateId" ).val(),
            maxDate: endDate,
            dateFormat: 'yy-mm-dd',
            yearRange: "-90:+0",
            changeMonth: true,
            changeYear: true,
            onClose: function ()
            {
                $('#fromOfficeHierarchyDivId').show();
                $('#toOfficeHierarchyDivId').show();
            }
        });
    });
    $('#dOTransactionId').change(function () {


    });
});

function retrieveDEOWiseSummaryReport(){

    var startdate =new Date(($("#fromDateId").val()));
    var enddate =new Date(($("#toDateId").val()));
    if(startdate <= enddate && startdate != 'Invalid Date' && enddate != 'Invalid Date') {
        document.getElementById("BMFormId").method = 'POST';
        document.getElementById("BMFormId").action = localStorage.contextPath + "/client/ci/getClientCount/deoWiseList";
        document.getElementById("BMFormId").submit();
    }else {
        alert("End Date Should Be Greater Than Or Equal To From Date");
    }
}