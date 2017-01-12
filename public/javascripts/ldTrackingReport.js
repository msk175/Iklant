/**
 * Created by Siva on 13-01-2015.
 */

google.load('visualization', '1.0', {'packages':['corechart']});

function chartMR() {
    var dataLabel =$("#memberReachability").val().split(",").length;
    var dataValues =$("#memberReachability").val().split(",");

    var yesCount = 0,noCount = 0;
    for(var i=0;i<dataLabel;i++) {
        if(dataValues[i] == 'Yes')
            yesCount++;
        else
            noCount++;
    }

    // For Column chart
    var columnChartData = google.visualization.arrayToDataTable([['','Yes', 'No',],['',yesCount, noCount]]);
    var columnChartOptions = {'title':'Member Reachability','width':600,'height':650, is3D: true,vAxis: {title: "#No Of Members"}};
    var columnChart = new google.visualization.ColumnChart(document.getElementById('columnChart'));
    columnChart.draw(columnChartData, columnChartOptions);

    // For Pie chart
    var pieChartData = google.visualization.arrayToDataTable([['Members','Member Count'],['Yes',yesCount],['No',noCount]]);
    var pieChartOptions = {title: 'Member Reachability','width':600,'height':650, is3D: true,vAxis: {title: "#No Of Members"}};
    var pieChart = new google.visualization.PieChart(document.getElementById('pieChart'));
    pieChart.draw(pieChartData, pieChartOptions);
}

function chartMUR() {
    var dataLabel =$("#unReachability").val().split(",").length;
    var dataValues =$("#unReachability").val().split(",");

    var callStatus = 0,responseCount = 0,awareCount = 0,wrongCount = 0,offCount = 0,
        busyCount = 0,noResponseCount = 0,reachableCount = 0,numberCount = 0,
        barredCount = 0,noMobileCount = 0,notAvailableCount = 0;

    for(var i=0;i<dataLabel;i++) {
        if(dataValues[i] == callStatusSuccess)
            callStatus++;
        else if(dataValues[i] == callStatusNoResponse)
            responseCount++;
        else if(dataValues[i] == callStatusNotAware)
            awareCount++;
        else if(dataValues[i] == callStatusWrongNumber)
            wrongCount++;
        else if(dataValues[i] == callStatusOff)
            offCount++;
        else if(dataValues[i] == callStatusBusy)
            busyCount++;
        else if(dataValues[i] == callStatusRing)
            noResponseCount++;
        else if(dataValues[i] == callStatusNotReach)
            reachableCount++;
        else if(dataValues[i] == callStatusIncorrect)
            numberCount++;
        else if(dataValues[i] == callStatusBarred)
            barredCount++;
        else if(dataValues[i] == callStatusNoNum)
            noMobileCount++;
        else
            notAvailableCount++;
    }

    // For Column chart
    var columnChartData = google.visualization.arrayToDataTable([['',callStatusSuccess,callStatusNoResponse,callStatusNotAware,callStatusWrongNumber,callStatusOff,
        callStatusBusy,callStatusRing,callStatusNotReach,callStatusIncorrect,callStatusBarred,callStatusNoNum,callStatusAvailability],['',callStatus,responseCount,
        awareCount,wrongCount,offCount,busyCount,noResponseCount,reachableCount,numberCount,barredCount,noMobileCount,notAvailableCount]]);
    var columnChartOptions = {'title':'Reasons for unreachability','width':600,'height':650, is3D: true,vAxis: {title: "#No Of Members"}};
    var columnChart = new google.visualization.ColumnChart(document.getElementById('columnChart'));
    columnChart.draw(columnChartData, columnChartOptions);

    // For Pie chart
    var pieChartData = google.visualization.arrayToDataTable([['Members','Member Count'],[callStatusSuccess,callStatus],[callStatusNoResponse, responseCount],
        [callStatusNotAware,awareCount],[callStatusWrongNumber,wrongCount],[callStatusOff,offCount],[callStatusBusy,busyCount],[callStatusRing,noResponseCount],
        [callStatusNotReach,reachableCount],[callStatusIncorrect,numberCount],[callStatusBarred,barredCount],[callStatusNoNum,noMobileCount],[callStatusAvailability,notAvailableCount]]);
    var pieChartOptions = {title: 'Reasons for unreachability','width':600,'height':650, is3D: true,vAxis: {title: "#No Of Members"}};
    var pieChart = new google.visualization.PieChart(document.getElementById('pieChart'));
    pieChart.draw(pieChartData, pieChartOptions);
}

function chartFOBehaviour() {
    var dataLabel =$("#foBehaviour").val().split(",").length;
    var dataValues =$("#foBehaviour").val().split(",");

    var poorCount = 0,averageCount = 0,goodCount = 0,vGoodCount = 0,excellentCount = 0;
    for(var i=0;i<dataLabel;i++) {
        if(dataValues[i] == poorStatus)
            poorCount++;
        else if(dataValues[i] == averageStatus)
            averageCount++;
        else if(dataValues[i] == goodStatus)
            goodCount++;
        else if(dataValues[i] == vGoodStatus)
            vGoodCount++;
        else
            excellentCount++;
    }

    // For Column chart
    var columnChartData = google.visualization.arrayToDataTable([['',poorStatus, averageStatus,goodStatus,vGoodStatus,excellentStatus],
        ['',poorCount, averageCount, goodCount,vGoodCount,excellentCount]]);
    var columnChartOptions = {'title':'FO Behaviour','width':600,'height':650, is3D: true,vAxis: {title: "#No Of Members"}};
    var columnChart = new google.visualization.ColumnChart(document.getElementById('columnChart'));
    columnChart.draw(columnChartData, columnChartOptions);

    // For Pie chart
    var pieChartData = google.visualization.arrayToDataTable([['Members','Member Count'],[poorStatus, poorCount],[averageStatus,averageCount],
        [goodStatus,goodCount],[vGoodStatus,vGoodCount],[excellentStatus,excellentCount]]);
    var pieChartOptions = {title: 'FO Behaviour','width':600,'height':650, is3D: true,vAxis: {title: "#No Of Members"}};
    var pieChart = new google.visualization.PieChart(document.getElementById('pieChart'));
    pieChart.draw(pieChartData, pieChartOptions);
}

function chartLoanDiscrepancy() {
    var dataLabel =$("#loanDiscrepancy").val().split(",").length;
    var dataValues =$("#loanDiscrepancy").val().split(",");

    var yesCount = 0,noCount = 0;
    for(var i=0;i<dataLabel;i++) {
        if(dataValues[i] == 'Yes')
            yesCount++;
        else
            noCount++;
    }

    // For Column chart
    var columnChartData = google.visualization.arrayToDataTable([['','Yes', 'No',],['',yesCount, noCount]]);
    var columnChartOptions = {'title':'Discrepancy in Loan','width':600,'height':650, is3D: true,vAxis: {title: "#No Of Members"}};
    var columnChart = new google.visualization.ColumnChart(document.getElementById('columnChart'));
    columnChart.draw(columnChartData, columnChartOptions);

    // For Pie chart
    var pieChartData = google.visualization.arrayToDataTable([['Members','Member Count'],['Yes',yesCount],['No',noCount]]);
    var pieChartOptions = {title: 'Discrepancy in Loan','width':600,'height':650, is3D: true,vAxis: {title: "#No Of Members"}};
    var pieChart = new google.visualization.PieChart(document.getElementById('pieChart'));
    pieChart.draw(pieChartData, pieChartOptions);
}

function chartFeeDiscrepancy() {
    var dataLabel =$("#feeDiscrepancy").val().split(",").length;
    var dataValues =$("#feeDiscrepancy").val().split(",");

    var yesCount = 0,noCount = 0;
    for(var i=0;i<dataLabel;i++) {
        if(dataValues[i] == 'Yes')
            yesCount++;
        else
            noCount++;
    }

    // For Column chart
    var columnChartData = google.visualization.arrayToDataTable([['','Yes', 'No',],['',yesCount, noCount]]);
    var columnChartOptions = {'title':'Discrepancy in processing fee','width':600,'height':650, is3D: true,vAxis: {title: "#No Of Members"}};
    var columnChart = new google.visualization.ColumnChart(document.getElementById('columnChart'));
    columnChart.draw(columnChartData, columnChartOptions);

    // For Pie chart
    var pieChartData = google.visualization.arrayToDataTable([['Members','Member Count'],['Yes',yesCount],['No',noCount]]);
    var pieChartOptions = {title: 'Discrepancy in processing fee','width':600,'height':650, is3D: true,vAxis: {title: "#No Of Members"}};
    var pieChart = new google.visualization.PieChart(document.getElementById('pieChart'));
    pieChart.draw(pieChartData, pieChartOptions);
}

function chartLoanAwareness() {
    var dataLabel =$("#loanFeatureAwareness").val().split(",").length;
    var dataValues =$("#loanFeatureAwareness").val().split(",");

    var yesCount = 0,noCount = 0;
    for(var i=0;i<dataLabel;i++) {
        if(dataValues[i] == 'Yes')
            yesCount++;
        else
            noCount++;
    }

    // For Column chart
    var columnChartData = google.visualization.arrayToDataTable([['','Yes', 'No',],['',yesCount, noCount]]);
    var columnChartOptions = {'title':'Awareness of loan features','width':600,'height':650, is3D: true,vAxis: {title: "#No Of Members"}};
    var columnChart = new google.visualization.ColumnChart(document.getElementById('columnChart'));
    columnChart.draw(columnChartData, columnChartOptions);

    // For Pie chart
    var pieChartData = google.visualization.arrayToDataTable([['Members','Member Count'],['Yes',yesCount],['No',noCount]]);
    var pieChartOptions = {title: 'Awareness of loan features','width':600,'height':650, is3D: true,vAxis: {title: "#No Of Members"}};
    var pieChart = new google.visualization.PieChart(document.getElementById('pieChart'));
    pieChart.draw(pieChartData, pieChartOptions);
}

function chartTrained() {
    var dataLabel =$("#trained").val().split(",").length;
    var dataValues =$("#trained").val().split(",");

    var yesCount = 0,noCount = 0;
    for(var i=0;i<dataLabel;i++) {
        if(dataValues[i] == 'Yes')
            yesCount++;
        else
            noCount++;
    }

    // For Column chart
    var columnChartData = google.visualization.arrayToDataTable([['','Yes', 'No',],['',yesCount, noCount]]);
    var columnChartOptions = {'title':'Trained on Financial literature','width':600,'height':650, is3D: true,vAxis: {title: "#No Of Members"}};
    var columnChart = new google.visualization.ColumnChart(document.getElementById('columnChart'));
    columnChart.draw(columnChartData, columnChartOptions);

    // For Pie chart
    var pieChartData = google.visualization.arrayToDataTable([['Members','Member Count'],['Yes',yesCount],['No',noCount]]);
    var pieChartOptions = {title: 'Trained on Financial literature','width':600,'height':650, is3D: true,vAxis: {title: "#No Of Members"}};
    var pieChart = new google.visualization.PieChart(document.getElementById('pieChart'));
    pieChart.draw(pieChartData, pieChartOptions);
}

function chartLegalPaperSigned() {
    var dataLabel =$("#legalPapers").val().split(",").length;
    var dataValues =$("#legalPapers").val().split(",");

    var yesCount = 0,noCount = 0;
    for(var i=0;i<dataLabel;i++) {
        if(dataValues[i] == 'Yes')
            yesCount++;
        else
            noCount++;
    }

    // For Column chart
    var columnChartData = google.visualization.arrayToDataTable([['','Yes', 'No',],['',yesCount, noCount]]);
    var columnChartOptions = {'title':'Legal paper signed','width':600,'height':650, is3D: true,vAxis: {title: "#No Of Members"}};
    var columnChart = new google.visualization.ColumnChart(document.getElementById('columnChart'));
    columnChart.draw(columnChartData, columnChartOptions);

    // For Pie chart
    var pieChartData = google.visualization.arrayToDataTable([['Members','Member Count'],['Yes',yesCount],['No',noCount]]);
    var pieChartOptions = {title: 'Legal paper signed','width':600,'height':650, is3D: true,vAxis: {title: "#No Of Members"}};
    var pieChart = new google.visualization.PieChart(document.getElementById('pieChart'));
    pieChart.draw(pieChartData, pieChartOptions);
}

function chartLoanNotDisbursed() {
    var dataLabel =$("#loanNotDisbursed").val().split(",").length;
    var dataValues =$("#loanNotDisbursed").val().split(",");

    var yesCount = 0,noCount = 0;
    for(var i=0;i<dataLabel;i++) {
        if(dataValues[i] == 'Yes')
            yesCount++;
        else
            noCount++;
    }

    // For Column chart
    var columnChartData = google.visualization.arrayToDataTable([['','Yes', 'No',],['',yesCount, noCount]]);
    var columnChartOptions = {'title':'Loan not Disbursed','width':600,'height':650, is3D: true,vAxis: {title: "#No Of Members"}};
    var columnChart = new google.visualization.ColumnChart(document.getElementById('columnChart'));
    columnChart.draw(columnChartData, columnChartOptions);

    // For Pie chart
    var pieChartData = google.visualization.arrayToDataTable([['Members','Member Count'],['Yes',yesCount],['No',noCount]]);
    var pieChartOptions = {title: 'Loan not Disbursed','width':600,'height':650, is3D: true,vAxis: {title: "#No Of Members"}};
    var pieChart = new google.visualization.PieChart(document.getElementById('pieChart'));
    pieChart.draw(pieChartData, pieChartOptions);
}

$(document).ready(function() {

    $("#ldChart").click(function(){
        $("#reportView").hide();
        $("#chartView").show();
        $("#chart_div").show();
        $("#memberChartTable").show();
        chartMR();
        $("#chart_div1").hide();
        $("#chart_div2").hide();
        $("#chart_div3").hide();
        $("#chart_div4").hide();
        $("#chart_div5").hide();
        $("#chart_div6").hide();
        $("#chart_div7").hide();
        $("#chart_div8").hide();
    });
    $("#ldReport").click(function(){
        $("#memberChartTable").hide();
        $("#reportView").show();
        $("#chartView").hide();
        $("#chart_div").hide();
        $("#chart_div1").hide();
        $("#chart_div2").hide();
        $("#chart_div3").hide();
        $("#chart_div4").hide();
        $("#chart_div5").hide();
        $("#chart_div6").hide();
        $("#chart_div7").hide();
        $("#chart_div8").hide();
    });

    $("#custom-li-chart").click(function(){
        $("#reportView").hide();
        $("#chartView").show();
        $("#chart_div").show();
        chartMR();
        $("#chart_div1").hide();
        $("#chart_div2").hide();
        $("#chart_div3").hide();
        $("#chart_div4").hide();
        $("#chart_div5").hide();
        $("#chart_div6").hide();
        $("#chart_div7").hide();
        $("#chart_div8").hide();
    });
    $("#custom-li-chart1").click(function(){
        $("#reportView").hide();
        $("#chartView").show();
        $("#chart_div").hide();
        $("#chart_div2").hide();
        $("#chart_div3").hide();
        $("#chart_div4").hide();
        $("#chart_div5").hide();
        $("#chart_div6").hide();
        $("#chart_div7").hide();
        $("#chart_div8").hide();
        $("#chart_div1").show();
        chartMUR();
    });
    $("#custom-li-chart2").click(function(){
        $("#reportView").hide();
        $("#chartView").show();
        $("#chart_div").hide();
        $("#chart_div1").hide();
        $("#chart_div3").hide();
        $("#chart_div4").hide();
        $("#chart_div5").hide();
        $("#chart_div6").hide();
        $("#chart_div7").hide();
        $("#chart_div8").hide();
        $("#chart_div2").show();
        chartFOBehaviour();
    });
    $("#custom-li-chart3").click(function(){
        $("#reportView").hide();
        $("#chartView").show();
        $("#chart_div").hide();
        $("#chart_div1").hide();
        $("#chart_div2").hide();
        $("#chart_div4").hide();
        $("#chart_div5").hide();
        $("#chart_div6").hide();
        $("#chart_div7").hide();
        $("#chart_div8").hide();
        $("#chart_div3").show();
        chartLoanDiscrepancy();
    });
    $("#custom-li-chart4").click(function(){
        $("#reportView").hide();
        $("#chartView").show();
        $("#chart_div").hide();
        $("#chart_div1").hide();
        $("#chart_div2").hide();
        $("#chart_div3").hide();
        $("#chart_div5").hide();
        $("#chart_div6").hide();
        $("#chart_div7").hide();
        $("#chart_div8").hide();
        $("#chart_div4").show();
        chartFeeDiscrepancy();
    });
    $("#custom-li-chart5").click(function(){
        $("#reportView").hide();
        $("#chartView").show();
        $("#chart_div").hide();
        $("#chart_div1").hide();
        $("#chart_div2").hide();
        $("#chart_div3").hide();
        $("#chart_div4").hide();
        $("#chart_div6").hide();
        $("#chart_div7").hide();
        $("#chart_div8").hide();
        $("#chart_div5").hide();
        chartLoanAwareness();
    });

    $("#custom-li-chart6").click(function(){
        $("#reportView").hide();
        $("#chartView").show();
        $("#chart_div").hide();
        $("#chart_div1").hide();
        $("#chart_div2").hide();
        $("#chart_div3").hide();
        $("#chart_div4").hide();
        $("#chart_div5").hide();
        $("#chart_div7").hide();
        $("#chart_div8").hide();
        $("#chart_div6").show();
        chartTrained();
    });

    $("#custom-li-chart7").click(function(){
        $("#reportView").hide();
        $("#chartView").show();
        $("#chart_div").hide();
        $("#chart_div1").hide();
        $("#chart_div2").hide();
        $("#chart_div3").hide();
        $("#chart_div4").hide();
        $("#chart_div5").hide();
        $("#chart_div6").hide();
        $("#chart_div8").hide();
        $("#chart_div7").show();
        chartLegalPaperSigned();
    });

    $("#custom-li-chart8").click(function(){
        $("#reportView").hide();
        $("#chartView").show();
        $("#chart_div").hide();
        $("#chart_div1").hide();
        $("#chart_div2").hide();
        $("#chart_div3").hide();
        $("#chart_div4").hide();
        $("#chart_div5").hide();
        $("#chart_div6").hide();
        $("#chart_div7").hide();
        $("#chart_div8").show();
        chartLoanNotDisbursed();
    });

});
