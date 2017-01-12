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

    var data = new google.visualization.DataTable();
    data.addColumn('string', 'Regional Office');
    data.addColumn('number', 'Fresh Groups Count');
    data.addColumn('number', 'In Progress Groups Count');
    data.addColumn('number', 'Hold Groups Count');
    data.addColumn('number', 'Completed Groups Count');
    for(var j=1;j<values.length;j++) {
        console.log(j);
        data.addRows([
            values[j],
        ]);
    }
    debugger;
    var options = {
        title : 'Groups Count in Various Stages',
        vAxis: {title: 'Group Count'},
        hAxis: {title: 'Regional Office'},
        seriesType: 'bars',
        series: {4: {type: 'line'}},
        width: 900,
        height: 400,
        animation:{
            duration: 1000,
            easing: 'out',
        }
    };

    var chart = new google.visualization.ComboChart(document.getElementById('chart_div'));
    chart.draw(data, options);
}

function branchWiseGroupCountDashBoard(regionalOfficeId,regionalOfficeName){

    document.getElementById("BMFormId").method = 'POST';
    document.getElementById("BMFormId").action = localStorage.contextPath + "/client/ci/getGroupCount/branchWise/" +regionalOfficeId + "/" + regionalOfficeName;
    document.getElementById("BMFormId").submit();

}