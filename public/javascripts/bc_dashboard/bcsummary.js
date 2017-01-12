/**
 * Created by baskar on 23/9/15.
 */
google.load('visualization', '1.0', {'packages':['corechart']});
google.load('visualization', '1.1', {packages: ['line']});
google.setOnLoadCallback(drawVisualization);


function drawVisualization() {
    $("#dvsc").hide();
    var data = new google.visualization.DataTable();
    data.addColumn('string', 'Amount Collected');
    data.addColumn('number', 'Principal Outstanding');
    data.addRows([
        ['Principal Collected ', parseInt($("#collectedAmountId").val())],
        ['Principal Outstanding', parseInt($("#osAmountId").val())]
    ]);
    var options = {'title':'Amount collected vs Amount Outstanding',
        'width':400,
        'height':300,
        pieHole: 0.4,
        backgroundColor : '#D8D8D8',
        chartArea:{width:'90%',height:'75%'}
    };

    // Instantiate and draw our chart, passing in some options.
    var chart = new google.visualization.PieChart(document.getElementById('chart_div'));
    chart.draw(data, options);
    debugger;
    retrieveBranchSummary();
}

function retrieveBranchSummary() {
    var data = {};
    ajaxVariable = $.ajax({
        beforeSend: function () {
            //$.mobile.showPageLoadingMsg();
        },
        complete: function () {
            //$.mobile.hidePageLoadingMsg()
        },
        type: 'POST',
        data: JSON.stringify(data),
        contentType: 'application/json',
        url: "http://" + ajaxcallip + localStorage.contextPath + "/bc/stats/summary/branchwise",
        success: function (data) {
            debugger;
            if (data.status == "failure") {
                //document.getElementById("errorLabelId").innerText = data.errorMessage;
                //$(window).scrollTop(0);
            } else {

                if (data.bcSummaryJsonArray.length > 0) {
                    console.log(data.bcSummaryJsonArray);
                    var chartdata = new google.visualization.DataTable();
                    chartdata.addColumn('string', 'Office Name');
                    chartdata.addColumn('number', 'Total Disbursed');
                    //chartdata.addColumn('number', 'Total Principal Demanded');
                    chartdata.addColumn('number', 'Total Principal Collected');
                    chartdata.addColumn('number', 'Total Principal Outstanding');
                    for(var j=0;j<data.bcSummaryJsonArray.length;j++) {
                        console.log(j);
                        chartdata.addRows([
                            [data.bcSummaryJsonArray[j].officeName,data.bcSummaryJsonArray[j].totalDisbursed,
                                data.bcSummaryJsonArray[j].totalCollected,
                                data.bcSummaryJsonArray[j].totalPrincipalOutstanding],
                        ]);
                    }
                    debugger;
                    var options = {
                        title : 'Branch Wise Summary',
                        vAxis: {title: 'Amount'},
                        hAxis: {title: 'Branch Office'},
                        seriesType: 'bars',
                        series: {4: {type: 'line'}},
                        backgroundColor : '#D8D8D8',
                        width: 1100,
                        height: 500,
                        /*bar : {
                            groupWidth : 50
                        },*/
                        animation :{
                            duration: 1000,
                            easing: 'out',
                        },
                        candlestick :{
                            hollowIsRising : true
                        },
                        annotations: {
                            textStyle: {
                                fontName: 'Times-Roman',
                                fontSize: 18,
                                bold: true,
                                italic: true,
                                // The color of the text.
                                color: '#871b47',
                                // The color of the text outline.
                                auraColor: '#d799ae',
                                // The transparency of the text.
                                opacity: 0.8
                            }
                        }
                    };

                    var chart = new google.visualization.ComboChart(document.getElementById('branch_summary_chart_div'));
                    chart.draw(chartdata, options);
                    $("#branchWiseSummary").show();
                    var branchWisePortfolioData = new google.visualization.DataTable();
                    branchWisePortfolioData.addColumn('string', 'Branch Name');
                    branchWisePortfolioData.addColumn('number', 'Principal Outstanding');
                    var portfolioOutstanding = 0;
                    for(var j=0;j<data.bcSummaryJsonArray.length;j++) {
                        console.log(j);
                        portfolioOutstanding = portfolioOutstanding + data.bcSummaryJsonArray[j].totalPrincipalOutstanding;
                        branchWisePortfolioData.addRows([
                            [data.bcSummaryJsonArray[j].officeName,
                                data.bcSummaryJsonArray[j].totalPrincipalOutstanding]
                        ]);
                    }

                    var branchWisePortfolioChartOptions = {'title':'BranchWise Portfolio',
                        'width':400,
                        'height':300,
                        pieHole: 0.4,
                        backgroundColor : '#D8D8D8',
                        chartArea:{width:'90%',height:'75%'}
                    };

                    // Instantiate and draw our chart, passing in some options.
                    $("#portfoioOsLabel").text(portfolioOutstanding);
                    var branchWisePortfolioChart = new google.visualization.PieChart(document.getElementById('portfolio_wise_div'));
                    branchWisePortfolioChart.draw(branchWisePortfolioData, branchWisePortfolioChartOptions);
                    retrieveDemandvsCollectionForSelectedDates(1);

                }else {
                    document.getElementById("errorLabelId").innerText = "No records found for BC Over all Summary";
                }
            }
        }, error: function (jqXHR, textStatus, error) {
            document.getElementById("errorLabelId").innerText = "Error in sending Ajax call For BC Dashboard";
            $(window).scrollTop(0);
        }
    });
}

function retrieveMonthwisePortfolio(){

    var data = {};

    ajaxVariable = $.ajax({
        beforeSend: function () {
            //$.mobile.showPageLoadingMsg();
        },
        complete: function () {
            //$.mobile.hidePageLoadingMsg()
        },
        type: 'POST',
        data: JSON.stringify(data),
        contentType: 'application/json',
        url: "http://" + ajaxcallip + localStorage.contextPath + "/bc/stats/monthwise/portfolio",
        success: function (data) {
            console.log(data.bcMontheisePortfolioJson);

           /* var data1 = google.visualization.arrayToDataTable([
                ['Year', 'Sales', 'Expenses'],
                ['2004',  1000,      400],
                ['2005',  1170,      460],
                ['2006',  660,       1120],
                ['2007',  1030,      540]
            ]);

            var options = {
                title: 'Company Performance',
                curveType: 'function',
                legend: { position: 'bottom' }
            };

            var chart = new google.visualization.LineChart(document.getElementById('monthwise_portfolio_div'));

            chart.draw(data1, options);*/

            var chartdata = new google.visualization.DataTable();
            chartdata.addColumn('string', 'Month');
            chartdata.addColumn('number', 'Portfolio Outstanding for the Month');
            chartdata.addColumn({type: 'string', role: 'tooltip'});
            for(var j=data.bcMontheisePortfolioJson.length-1;j>=0;j--) {

                var dataArray1 = new Array();

                dataArray1[0] = data.bcMontheisePortfolioJson[j].monthName;
                dataArray1[1] = parseFloat(data.bcMontheisePortfolioJson[j].portfolioOutstanding);
                dataArray1[2] = data.bcMontheisePortfolioJson[j].monthName + " Portfolio OS was "+  parseFloat(data.bcMontheisePortfolioJson[j].portfolioOutstanding*100)/100;
                chartdata.addRows([
                    dataArray1
                ]);
            }
            var options = {
                'title':'Monthwise Portfolio',
                width: 1100,
                height: 500,
                vAxis: {format:'decimal', title: "#Amount"},
                hAxis: { title: "Month" },
                 backgroundColor : '#D8D8D8',
                tooltip: {isHtml: true},};
            var chart = new google.charts.Line(document.getElementById('monthwise_portfolio_div'));
            chart.draw(chartdata, google.charts.Line.convertOptions(options));
            //retrieveStateWisePortfolio();

        }, error: function (jqXHR, textStatus, error) {
            document.getElementById("errorLabelId").innerText = "Error in Retrieving documents";
            $(window).scrollTop(0);
        }
    });
}

function retrieveDemandvsCollectionForSelectedDates(flag){

    var data = {};
    data.fromDate = $("#fromDateId").val();
    data.toDate = $("#toDateId").val();
    data.groupByColumn = "bcp.bc_id";
    ajaxVariable = $.ajax({
        beforeSend: function () {
            if(flag == 0) {
                $.mobile.showPageLoadingMsg();
            }
        },
        complete: function () {
            $.mobile.hidePageLoadingMsg()
        },
        type: 'POST',
        data: JSON.stringify(data),
        contentType: 'application/json',
        url: "http://" + ajaxcallip + localStorage.contextPath + "/bc/stats/summary/demandvscollection",
        success: function (data) {
            debugger;
            if (data.status == "failure") {
                //document.getElementById("errorLabelId").innerText = data.errorMessage;
                //$(window).scrollTop(0);
            } else {
                if(data.bcDemandVsCollectionSummaryJsonArray.length > 0) {
                    $("#demandeAmount").text($("#rupeesybmol").text() +" " + data.bcDemandVsCollectionSummaryJsonArray[0].totalDemanded);
                    $("#paidAmount").text($("#rupeesybmol").text() +" " + data.bcDemandVsCollectionSummaryJsonArray[0].totalCollected);
                    $("#notyetpaid").text($("#rupeesybmol").text() +" " + data.bcDemandVsCollectionSummaryJsonArray[0].totalOverdue);
                }
                var chartdata = new google.visualization.DataTable();
                chartdata.addColumn('string', 'Office Name');
                chartdata.addColumn('number', 'Demanded Amount');
                chartdata.addColumn('number', 'Collected Amount');
                //chartdata.addColumn('number', 'Deficit / (Excess)');
                for(var j=0;j<data.bcDemandVsCollectionSummaryJsonArray.length;j++) {
                    chartdata.addRows([
                        [data.bcDemandVsCollectionSummaryJsonArray[j].bcName,data.bcDemandVsCollectionSummaryJsonArray[j].totalDemanded,
                            data.bcDemandVsCollectionSummaryJsonArray[j].totalCollected]
                        //data.bcDemandVsCollectionSummaryJsonArray[j].totalOverdue],
                    ]);
                }
                debugger;
                var options = {
                    title : 'Overall Demand Vs Collection Summary',
                    vAxis: {title: 'Amount'},
                    hAxis: {title: 'Overall'},
                    seriesType: 'bars',
                    series: {2: {type: 'line'}},
                    backgroundColor : '#D8D8D8',
                    width: 1100,
                    height: 500,
                    /*bar : {
                     groupWidth : 50
                     },*/
                    //isStacked: true,
                    animation :{
                        duration: 1000,
                        easing: 'out',
                    },
                    candlestick :{
                        hollowIsRising : true
                    },
                    annotations: {
                        textStyle: {
                            fontName: 'Times-Roman',
                            fontSize: 18,
                            bold: true,
                            italic: true,
                            // The color of the text.
                            color: '#871b47',
                            // The color of the text outline.
                            auraColor: '#d799ae',
                            // The transparency of the text.
                            opacity: 0.8
                        }
                    }
                };

                // Instantiate and draw our chart, passing in some options.
                var chart = new google.visualization.ComboChart(document.getElementById('dvsc_chart_div'));
                chart.draw(chartdata, options);
                $("#dvsc").show();
                retrieveBranchWiseDemandvsCollectionForSelectedDates(flag);
            }
        }, error: function (jqXHR, textStatus, error) {
            document.getElementById("errorLabelId").innerText = "Error in Retrieving documents";
            $(window).scrollTop(0);
        }
    });
}

function retrieveBranchWiseDemandvsCollectionForSelectedDates(flag){

    var data = {};
    data.fromDate = $("#fromDateId").val();
    data.toDate = $("#toDateId").val();
    data.groupByColumn = "o.office_id";
    ajaxVariable = $.ajax({
        beforeSend: function () {
            //$.mobile.showPageLoadingMsg();
        },
        complete: function () {
            //$.mobile.hidePageLoadingMsg()
        },
        type: 'POST',
        data: JSON.stringify(data),
        contentType: 'application/json',
        url: "http://" + ajaxcallip + localStorage.contextPath + "/bc/stats/summary/demandvscollection",
        success: function (data) {
            debugger;
            if (data.status == "failure") {
                //document.getElementById("errorLabelId").innerText = data.errorMessage;
                //$(window).scrollTop(0);
            } else {
                var chartdata = new google.visualization.DataTable();
                chartdata.addColumn('string', 'Office Name');
                chartdata.addColumn('number', 'Demanded Amount');
                chartdata.addColumn('number', 'Collected Amount');
                //chartdata.addColumn('number', 'Deficit / (Excess)');
                for(var j=0;j<data.bcDemandVsCollectionSummaryJsonArray.length;j++) {
                    chartdata.addRows([
                        [data.bcDemandVsCollectionSummaryJsonArray[j].officeName,data.bcDemandVsCollectionSummaryJsonArray[j].totalDemanded,
                            data.bcDemandVsCollectionSummaryJsonArray[j].totalCollected]
                            //data.bcDemandVsCollectionSummaryJsonArray[j].totalOverdue],
                    ]);
                }
                debugger;
                var options = {
                    title : 'Branch Wise Demand Vs Collection Summary',
                    vAxis: {title: 'Amount'},
                    hAxis: {title: 'Branch Office'},
                    seriesType: 'bars',
                    series: {2: {type: 'line'}},
                    backgroundColor : '#D8D8D8',
                    width: 1100,
                    height: 500,
                    /*bar : {
                     groupWidth : 50
                     },*/
                    //isStacked: true,
                    animation :{
                        duration: 1000,
                        easing: 'out',
                    },
                    candlestick :{
                        hollowIsRising : true
                    },
                    annotations: {
                        textStyle: {
                            fontName: 'Times-Roman',
                            fontSize: 18,
                            bold: true,
                            italic: true,
                            // The color of the text.
                            color: '#871b47',
                            // The color of the text outline.
                            auraColor: '#d799ae',
                            // The transparency of the text.
                            opacity: 0.8
                        }
                    }
                };

                var chart = new google.visualization.ColumnChart(document.getElementById('branch_demand_collection_chart_div'));
                chart.draw(chartdata, options);
                if(flag == 1){
                    retrieveSalesPipelineBranchSummary();
                }
            }
        }, error: function (jqXHR, textStatus, error) {
            document.getElementById("errorLabelId").innerText = "Error in Retrieving documents";
            $(window).scrollTop(0);
        }
    });
}

//Added by SathishKumar M #008 For Sales Pipeline Dashboard
function retrieveSalesPipelineBranchSummary(){
    var salesData = {};
    ajaxSalesVariable = $.ajax({
        beforeSend: function () {
            $.mobile.showPageLoadingMsg();
        },
        complete: function () {
            $.mobile.hidePageLoadingMsg()
        },
        type: 'POST',
        data: JSON.stringify(salesData),
        contentType: 'application/json',
        url: "http://" + ajaxcallip + localStorage.contextPath + "/bc/stats/salespipeline/branchwise",
        success: function (salesData) {
            debugger;
            if (salesData.status == "failure") {
                //document.getElementById("errorLabelId").innerText = data.errorMessage;
                //$(window).scrollTop(0);
            } else {
                if (salesData.bcSalesJsonArray.length > 0) {
                    console.log(salesData.bcSalesJsonArray);
                    /*$("#kycProcess").text(salesData.bcSalesJsonTotalArray[0]);
                     $("#fieldVerification").text(salesData.bcSalesJsonTotalArray[1]);
                     $("#bmApproval").text(salesData.bcSalesJsonTotalArray[2]);
                     $("#rmApproval").text(salesData.bcSalesJsonTotalArray[3]);
                     $("#readytoDisburse").text(salesData.bcSalesJsonTotalArray[4]);*/
                    if(salesData.bcSalesJsonTotalArray[5])
                        $("#totalClients").text(salesData.bcSalesJsonTotalArray[5]);
                    var data = new google.visualization.DataTable();
                    data.addColumn('string', 'KYC Processing');
                    data.addColumn('number', 'Field Verification');
                    data.addRows([
                        ['KYC Processing', salesData.bcSalesJsonTotalArray[0]],
                        ['Field Verification', salesData.bcSalesJsonTotalArray[1]],
                        ['BM Approval', salesData.bcSalesJsonTotalArray[2]],
                        ['RM Approval', salesData.bcSalesJsonTotalArray[3]],
                        ['Ready To Disburse', salesData.bcSalesJsonTotalArray[4]]
                    ]);
                    var options = {'title':'Overall Sales Pipeline Summary',
                        'width':400,
                        'height':300,
                        pieHole: 0.4,
                        backgroundColor : '#D8D8D8',
                        chartArea:{width:'90%',height:'75%'}
                    };
                    // Instantiate and draw our chart, passing in some options.
                    var chart = new google.visualization.PieChart(document.getElementById('sales_chart_div'));
                    chart.draw(data, options);
                    debugger;
                    $("summarySalesPipeline").show();
                    var chartSalesData = new google.visualization.DataTable();
                    chartSalesData.addColumn('string', 'Office Name');
                    chartSalesData.addColumn('number', 'Total KYC Processing');
                    chartSalesData.addColumn('number', 'Total Field Verification');
                    chartSalesData.addColumn('number', 'Total BM Approval');
                    chartSalesData.addColumn('number', 'Total RM Approval');
                    chartSalesData.addColumn('number', 'Total Ready To Disburse');
                    for(var j=0;j<salesData.bcSalesJsonArray.length;j++) {
                        console.log(j);
                        chartSalesData.addRows([
                            [salesData.bcSalesJsonArray[j].officeName,salesData.bcSalesJsonArray[j].kycProcess,
                                salesData.bcSalesJsonArray[j].fieldVerification,salesData.bcSalesJsonArray[j].bmApproval,
                                salesData.bcSalesJsonArray[j].rmApproval,salesData.bcSalesJsonArray[j].readyToDisburse],
                        ]);
                    }
                    debugger;
                    var options = {
                        title : 'Branch Wise Sales Summary',
                        vAxis: {title: 'Client Count'},
                        hAxis: {title: 'Branch Office'},
                        seriesType: 'bars',
                        series: {5: {type: 'line'}},
                        backgroundColor : '#D8D8D8',
                        width: 1100,
                        height: 500,
                        /*bar : {
                         groupWidth : 50
                         },*/
                        animation :{
                            duration: 1000,
                            easing: 'out',
                        },
                        candlestick :{
                            hollowIsRising : true
                        },
                        annotations: {
                            textStyle: {
                                fontName: 'Times-Roman',
                                fontSize: 18,
                                bold: true,
                                italic: true,
                                // The color of the text.
                                color: '#871b47',
                                // The color of the text outline.
                                auraColor: '#d799ae',
                                // The transparency of the text.
                                opacity: 0.8
                            }
                        }
                    };

                    var chart = new google.visualization.ComboChart(document.getElementById('branch_sales_chart_div'));
                    chart.draw(chartSalesData, options);
                    $("#branchWiseSalesPipeline").show();
                    retrieveStateWisePortfolio();
                    //retrieveMonthwisePortfolio();
                }else {
                    document.getElementById("errorLabelId").innerText = "There is No process in Branch";
                }
            }
        }, error: function (jqXHR, textStatus, error) {
            document.getElementById("errorLabelId").innerText = "Error in sending Ajax call For BC Sales Dashboard";
            $(window).scrollTop(0);
        }
    });
}
function retrieveStateWisePortfolio(){
    console.log("Inside retrieveStateWisePortfolio");
    var data = {};

    ajaxVariable = $.ajax({
        beforeSend: function () {
            //$.mobile.showPageLoadingMsg();
        },
        complete: function () {
            //$.mobile.hidePageLoadingMsg()
        },
        type: 'POST',
        data: JSON.stringify(data),
        contentType: 'application/json',
        url: "http://" + ajaxcallip + localStorage.contextPath + "/bc/stats/stateWise/portfolio",
        success: function (data1) {
            console.log(data1.bcStateWisePortfolioJson);
            var data = new google.visualization.DataTable();
            data.addColumn('string', 'State');
            data.addColumn('number', 'Principal Outstanding');
            for(var j=0;j<data1.bcStateWisePortfolioJson.length;j++) {
                console.log(j);
                data.addRows([
                    [data1.bcStateWisePortfolioJson[j].stateName,
                        data1.bcStateWisePortfolioJson[j].principalOutstanding]
                ]);
            }
            var options = {'title':'State-Wise Portfolio',
                'width':400,
                'height':300,
                pieHole: 0.4,
                backgroundColor : '#D8D8D8',
                chartArea:{width:'90%',height:'75%'}
            };

            // Instantiate and draw our chart, passing in some options.
            var chart = new google.visualization.PieChart(document.getElementById('state_wise_div'));
            chart.draw(data, options);
            retrievePurposeWisePortfolio();
        }, error: function (jqXHR, textStatus, error) {
            document.getElementById("errorLabelId").innerText = "Error in sending Ajax call For BC Sales Dashboard";
            $(window).scrollTop(0);
        }
    });


}

function retrievePurposeWisePortfolio(){
    console.log("Inside retrieveStateWisePortfolio");
    var data = {};

    ajaxVariable = $.ajax({
        beforeSend: function () {
            //$.mobile.showPageLoadingMsg();
        },
        complete: function () {
            //$.mobile.hidePageLoadingMsg()
        },
        type: 'POST',
        data: JSON.stringify(data),
        contentType: 'application/json',
        url: "http://" + ajaxcallip + localStorage.contextPath + "/bc/stats/loanPurposeWise/portfolio",
        success: function (data1) {
            console.log(data1.bcLoanPurposeWisePortfolioJson);
            var data = new google.visualization.DataTable();
            data.addColumn('string', 'Purpose');
            data.addColumn('number', 'Principal Outstanding');
            for(var j=0;j<data1.bcLoanPurposeWisePortfolioJson.length;j++) {
                console.log(j);
                data.addRows([
                    [data1.bcLoanPurposeWisePortfolioJson[j].loanPurpose,
                        data1.bcLoanPurposeWisePortfolioJson[j].principalOutstanding]
                ]);
            }
            var options = {'title':'Loan Purpose-Wise Portfolio',
                'width':400,
                'height':300,
                pieHole: 0.4,
                backgroundColor : '#D8D8D8',
                chartArea:{width:'90%',height:'75%'}
            };

            // Instantiate and draw our chart, passing in some options.
            var chart = new google.visualization.PieChart(document.getElementById('purpose_wise_div'));
            chart.draw(data, options);
            retrieveSizeWisePortfolio();

        }, error: function (jqXHR, textStatus, error) {
            document.getElementById("errorLabelId").innerText = "Error in sending Ajax call For BC Sales Dashboard";
            $(window).scrollTop(0);
        }
    });
}

function retrieveSizeWisePortfolio(){
    console.log("Inside retrieveStateWisePortfolio");
    var data = {};

    ajaxVariable = $.ajax({
        beforeSend: function () {
            //$.mobile.showPageLoadingMsg();
        },
        complete: function () {
            //$.mobile.hidePageLoadingMsg()
        },
        type: 'POST',
        data: JSON.stringify(data),
        contentType: 'application/json',
        url: "http://" + ajaxcallip + localStorage.contextPath + "/bc/stats/loanSizeWise/portfolio",
        success: function (data1) {
            console.log(data1.bcLoanSizeWisePortfolioJson);
            var data = new google.visualization.DataTable();
            data.addColumn('string', 'Purpose');
            data.addColumn('number', 'Principal Outstanding');
            for(var j=0;j<data1.bcLoanSizeWisePortfolioJson.length;j++) {
                console.log(j);
                data.addRows([
                    [data1.bcLoanSizeWisePortfolioJson[j].loanSize,
                        data1.bcLoanSizeWisePortfolioJson[j].principalOutstanding]
                ]);
            }
            var options = {'title':'Loan Size-Wise Portfolio',
                'width':400,
                'height':300,
                pieHole: 0.4,
                backgroundColor : '#D8D8D8',
                chartArea:{width:'90%',height:'75%'}
            };

            // Instantiate and draw our chart, passing in some options.
            var chart = new google.visualization.PieChart(document.getElementById('size_wise_div'));
            chart.draw(data, options);
            retrieveLoanCycleWisePortfolio();

        }, error: function (jqXHR, textStatus, error) {
            document.getElementById("errorLabelId").innerText = "Error in sending Ajax call For BC Sales Dashboard";
            $(window).scrollTop(0);
        }
    });
}
function retrieveLoanCycleWisePortfolio(){
    console.log("Inside retrieveStateWisePortfolio");
    var data = {};

    ajaxVariable = $.ajax({
        beforeSend: function () {
            //$.mobile.showPageLoadingMsg();
        },
        complete: function () {
            //$.mobile.hidePageLoadingMsg()
        },
        type: 'POST',
        data: JSON.stringify(data),
        contentType: 'application/json',
        url: "http://" + ajaxcallip + localStorage.contextPath + "/bc/stats/loanCycleWise/portfolio",
        success: function (data1) {
            console.log(data1.bcLoanCycleWisePortfolioJson);
            var data = new google.visualization.DataTable();
            data.addColumn('string', 'Loan Cycle');
            data.addColumn('number', 'Principal Outstanding');
            for(var j=0;j<data1.bcLoanCycleWisePortfolioJson.length;j++) {
                console.log(j);
                data.addRows([
                    [data1.bcLoanCycleWisePortfolioJson[j].loanCycle.toString(),
                        data1.bcLoanCycleWisePortfolioJson[j].principalOutstanding]
                ]);
            }
            var options = {'title':'Loan Cycle-Wise Portfolio',
                'width':400,
                'height':300,
                pieHole: 0.4,
                backgroundColor : '#D8D8D8',
                chartArea:{width:'90%',height:'75%'}
            };

            // Instantiate and draw our chart, passing in some options.
            var chart = new google.visualization.PieChart(document.getElementById('cycle_wise_div'));
            chart.draw(data, options);
            retrieveMonthwisePortfolio();

        }, error: function (jqXHR, textStatus, error) {
            document.getElementById("errorLabelId").innerText = "Error in sending Ajax call For BC Sales Dashboard";
            $(window).scrollTop(0);
        }
    });
}
function GenerateReportBCDashBoard(){

    var data={};
    data.fromDate=$("#fromDateId").val();
    data.toDate=$("#toDateId").val();
    data.reportName='demandReport';
    data.exportType = $("#exportType").val();
    ajaxVariable = $.ajax({
        beforeSend: function(){
            $("#exportDivId").hide();
            $("#downloadDiv").hide();
            $("#exportImageDivId").show();
        },
        complete: function(){
            $("#exportImageDivId").hide();
        },

        type: 'POST',
        data: JSON.stringify(data),
        contentType: 'application/json',
        url: "http://" + ajaxcallip + localStorage.contextPath + "/bc/stats/demand/demandGenerateReport",
        success: function(demandData){
            if(demandData.downloadFlag == "Download"){
                $("#selectedDocName").val(demandData.fileLocation);
                $("#downloadDiv").show();
            }else{
                $("#exportDivId").show();
                $("#noRecords").show();
            }
        },
        error: function(){
            document.getElementById("errorLabelId").innerText = "Error in sending Ajax call For Generate Demand Report";
            $(window).scrollTop(0);
        }
    });
}

function downloadReport(){
    document.getElementById("BMFormId").method='POST';
    document.getElementById("BMFormId").action=localStorage.contextPath+'/client/ci/downloadDocs';
    document.getElementById("BMFormId").submit();
    $("#exportDivId").show();
    $("#downloadDiv").hide();
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
            //maxDate: endDate,
            dateFormat: 'yy-mm-dd',
            yearRange: "-90:+1",
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
            minDate: $("#fromDateId").val(),
            //maxDate: endDate,
            dateFormat: 'yy-mm-dd',
            yearRange: "-90:+1",
            changeMonth: true,
            changeYear: true,
            onClose: function ()
            {
                $('#fromOfficeHierarchyDivId').show();
                $('#toOfficeHierarchyDivId').show();
            }
        });
    });
    $("#fromDateId").change(function(){
       // $(function(){
        console.log($("#fromDateId").val());
        var startdate =new Date(($("#fromDateId").val()));
        var enddate =new Date(($("#toDateId").val()));
        var modifiedTodate = enddate < startdate ? $("#fromDateId").val() : $("#toDateId").val();
        console.log("modifiedTodate : " + modifiedTodate);
        $("#toDateId").datepicker("destroy");
        console.log("Inside fromdate id onchange")
            $("#toDateId" ).datepicker({
                minDate: $("#fromDateId").val(),
                //maxDate: endDate,
                dateFormat: 'yy-mm-dd',
                yearRange: "-90:+1",
                changeMonth: true,
                changeYear: true,
                onClose: function ()
                {
                    $('#fromOfficeHierarchyDivId').show();
                    $('#toOfficeHierarchyDivId').show();
                }
            });
        $("#toDateId" ).val(modifiedTodate );
        });

});