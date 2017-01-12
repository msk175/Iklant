google.load('visualization', '1.0', {'packages':['corechart']});
google.setOnLoadCallback(drawVisualization);

function drawVisualization() {
    // Some raw data (not necessarily accurate)
    var values = [];
    $('table tr').each(function(i, v){
        values[i] = [];
        // select either th or td, doesn't matter
        $(this).children('th,td').each(function(ii, vv){
            if(i == 0){
                if(ii != 0 & ii != 1) {
                    values[i][ii-2] = $(this).html();
                }
            }
            else {
                if(ii == 2) {
                    values[i][ii-2] = $(this).html();
                }
                else if(ii != 0 & ii != 1){
                    values[i][ii-2] = parseInt($(this).html());
                }
            }
        });

    });

    console.log(values);
    //if(values.length > 0) {
        var data = new google.visualization.DataTable();
        data.addColumn('string', 'Regional Office');
        data.addColumn('number', 'No of Total Clients entered into BO Queue');
        data.addColumn('number', 'No of Holded Clients in BO Queue');
        data.addColumn('number', 'No of Rejected Clients in BO Queue');

        for(var j=1;j<values.length;j++) {
            console.log(j);
            data.addRows([
                values[j],
            ]);
        }
        debugger;
        var options = {
            title : 'BO Summary',
            vAxis: {title: 'Group Count'},
            hAxis: {title: 'Regional Office'},
            seriesType: 'bars',
            series: {3: {type: 'line'}},
            width: 900,
            height: 400,
            animation:{
                duration: 1000,
                easing: 'out',
            }
        };

        var chart = new google.visualization.ComboChart(document.getElementById('chart_div'));
        chart.draw(data, options);
    //}
}

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
            onClose: function ()
            {
                $('#fromOfficeHierarchyDivId').show();
                $('#toOfficeHierarchyDivId').show();
            }
        });
    });
    $(function() {
        $("#toDateId" ).datepicker({
            minDate: '2015-07-01',
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
});

function retrieveSummaryReport(){
    var startdate =new Date(($("#fromDateId").val()));
    var enddate =new Date(($("#toDateId").val()));
    if(startdate <= enddate && startdate != 'Invalid Date' && enddate != 'Invalid Date') {
        document.getElementById("BMFormId").method = 'POST';
        document.getElementById("BMFormId").action = localStorage.contextPath + "/client/ci/getGroupCount/regionWise/summary";
        document.getElementById("BMFormId").submit();
    }else {
        alert("End Date Should Be Greater Than Or Equal To From Date");
    }
}

function retrieveDateWiseSummaryReport(){
    var startdate =new Date(($("#fromDateId").val()));
    var enddate =new Date(($("#toDateId").val()));
    if(startdate <= enddate && startdate != 'Invalid Date' && enddate != 'Invalid Date') {
        document.getElementById("BMFormId").method = 'POST';
        document.getElementById("BMFormId").action = localStorage.contextPath + "/client/ci/getGroupCount/dateWise/summary";
        document.getElementById("BMFormId").submit();
    }else {
        alert("End Date Should Be Greater Than Or Equal To From Date");
    }
}

function retrieveRegionalWisereportForSelectedDate(requestedDate){
    document.getElementById("BMFormId").method = 'POST';
    document.getElementById("BMFormId").action = localStorage.contextPath + "/client/ci/getGroupCount/regionWise/date/"+ requestedDate;
    document.getElementById("BMFormId").submit();
}