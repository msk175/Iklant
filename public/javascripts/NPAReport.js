google.load('visualization', '1.0', {'packages':['corechart']});
//google.setOnLoadCallback(chartNPAPOS);
//google.setOnLoadCallback(chartNPALoans);
//google.setOnLoadCallback(chartNPAPerc);
//google.setOnLoadCallback(chartOverdue);
function chartNPAPOS() {
	var dataLabel =$("#arraylengthid").val();
	var dataArray = new Array();
	var data = new google.visualization.DataTable();
		data.addColumn('string', 'Date');
		data.addColumn('number', 'Total NP Principal OS for Open Loans');
		data.addColumn('number', 'Total NP Principal OS for Closed Loans');
		data.addColumn('number', 'Total NP Principal OS for All Loans');
		data.addColumn('number', 'Total NP Principal OS (As per RBI)');
		for(var i=dataLabel;i>0;i--) {
			var dataArray1 = new Array();
			dataArray2 = $("#arrayid"+(i-1)).val().split(',');
			dataArray1[0] = dataArray2[0];
			dataArray1[1] = parseFloat(dataArray2[1]*100)/100;
			dataArray1[2] = parseFloat(dataArray2[2]*100)/100;
			dataArray1[3] = parseFloat(dataArray2[3]*100)/100;
			dataArray1[4] = parseFloat(dataArray2[4]*100)/100;
			data.addRows([
				dataArray1,
			]);
		}
	var options = {'title':'NPA Report','width':1050,'height':700,vAxis: {title: "#Amount"},hAxis: {title: "Date"},};
	var chart = new google.visualization.LineChart(document.getElementById('chart_div'));
	chart.draw(data, options);
}
function chartNPAPerc(){
var dataLabel =$("#arraylengthid").val();
	var dataArray = new Array();
	var data = new google.visualization.DataTable();
		data.addColumn('string', 'Date');
		data.addColumn('number', '% of NP Principal OS for Open Loans');
		data.addColumn('number', '% of NP Principal OS for Closed Loans');
		data.addColumn('number', '% of NP Principal OS for All Loans');
		//data.addColumn('number', 'Par Open Loans Ratio');
		//data.addColumn('number', 'Par Closed Loans Ratio');
		//data.addColumn('number', 'Par All Loans Ratio');
		data.addColumn('number', '% of NPA (As per RBI)');
		for(var i=dataLabel;i>0;i--) {
			var dataArray1 = new Array();
			dataArray2 = $("#npaposperc"+(i-1)).val().split(',');
			dataArray1[0] = dataArray2[0];
			dataArray1[1] = parseFloat(dataArray2[1]);
			dataArray1[2] = parseFloat(dataArray2[2]);
			dataArray1[3] = parseFloat(dataArray2[3]);
			//dataArray1[4] = parseFloat(dataArray2[4]);
			//dataArray1[5] = parseFloat(dataArray2[5]);
			//dataArray1[6] = parseFloat(dataArray2[6]);
			dataArray1[4] = parseFloat(dataArray2[7]);
			data.addRows([
				dataArray1,
			]);
		}
	var options = {'title':'NPA Report','width':1050,'height':700, is3D: true,vAxis: {title: "#Percentage"},hAxis: {title: "Date"},};
	var chart = new google.visualization.LineChart(document.getElementById('chart_div1'));
	chart.draw(data, options);


}
function chartPARPerc(){
	var dataLabel =$("#arraylengthid").val();
	var dataArray = new Array();
	//dataArray3 = $("#npaposperc0").val().split(',');
	var data = new google.visualization.DataTable();
		data.addColumn('string', 'Date');
		data.addColumn('number', '% of PAR Open Loans');
		data.addColumn('number', '% of PAR Closed Loans');
		data.addColumn('number', '% of PAR All Loans');
		for(var i=dataLabel;i>0;i--) {
			var dataArray1 = new Array();
			dataArray2 = $("#npaposperc"+(i-1)).val().split(',');
			dataArray1[0] = dataArray2[0];
			//dataArray1[1] = parseFloat(dataArray2[4]);
			//dataArray1[2] = parseFloat(dataArray2[5]);
			//dataArray1[3] = parseFloat(dataArray2[6]);
			dataArray1[1] =	parseFloat(dataArray2[4]);
			dataArray1[2] = parseFloat(dataArray2[5]);
			dataArray1[3] = parseFloat(dataArray2[6]);
			data.addRows([
				dataArray1,
			]);
		}
		var options = {'title':'NPA Overdue (PAR %)','width':1050,'height':700, is3D: true,vAxis: {title: "#Percentage"},hAxis: {title: "Date"},};
	var chart = new google.visualization.LineChart(document.getElementById('chart_div4'));
	chart.draw(data, options);
}

function chartOverdue(){
	var dataLabel =$("#arraylengthid").val();
	var dataArray = new Array();
	var data = new google.visualization.DataTable();
		data.addColumn('string', 'Date');
		data.addColumn('number', 'Total Principal Overdue for Open Loans');
		data.addColumn('number', 'Total Principal Overdue for Closed Loans');
		data.addColumn('number', 'Total Principal Overdue for All Loans');
		for(var i=dataLabel;i>0;i--) {
			var dataArray1 = new Array();
			dataArray2 = $("#overdueArray"+(i-1)).val().split(',');
			dataArray1[0] = dataArray2[0];
			dataArray1[1] = parseFloat(dataArray2[1]*100)/100;
			dataArray1[2] = parseFloat(dataArray2[2]*100)/100;
			dataArray1[3] = parseFloat(dataArray2[3]*100)/100;
			data.addRows([
				dataArray1,
			]);
		}
	var options = {'title':'NPA Report','width':1050,'height':700, is3D: true,vAxis: {title: "#Amount"},hAxis: {title: "Date"},};
	var chart = new google.visualization.LineChart(document.getElementById('chart_div2'));
	chart.draw(data, options);


}
function  chartNPALoans() {
	var dataLabel =$("#arraylengthid").val();
	var data = new google.visualization.DataTable();
		data.addColumn('string', 'Date');
		data.addColumn('number', 'Total No of NP Open Loans');
		data.addColumn('number', 'Total No of Open Loans');
		data.addColumn('number', 'Total No of NP Closed Loans');
		data.addColumn('number', 'Total No of Closed Loans');
		data.addColumn('number', 'Total No of NP All Loans');
		data.addColumn('number', 'Total No of All Loans');
		for(var i=dataLabel;i>0;i--) {
			var dataArray1 = new Array();
			dataArray2 = $("#loansarrayid"+(i-1)).val().split(',');
			dataArray1[0] = dataArray2[0];
			dataArray1[1] = parseFloat(dataArray2[1]*100)/100;
			dataArray1[2] = parseFloat(dataArray2[2]*100)/100;
			dataArray1[3] = parseFloat(dataArray2[3]*100)/100;
			dataArray1[4] = parseFloat(dataArray2[4]*100)/100;
			dataArray1[5] = parseFloat(dataArray2[5]*100)/100;
			dataArray1[6] = parseFloat(dataArray2[6]*100)/100;
			data.addRows([
				dataArray1,
			]);
		}
	var options = {'title':'NPA Report','width':1050,'height':700, is3D: true,vAxis: {title: "#NO OF LOANS"},hAxis: {title: "DATE"},};
	var chart = new google.visualization.LineChart(document.getElementById('chart_div3'));
	chart.draw(data, options);
}
function  chartNPALoansPercentage() {
	var dataLabel =$("#arraylengthid").val();
	var data = new google.visualization.DataTable();
		data.addColumn('string', 'Date');
		data.addColumn('number', 'NPA Open Loans Ratio');
		data.addColumn('number', 'NPA Closed Loans Ratio');
		data.addColumn('number', 'NPA All Loans Ratio');
		for(var i=dataLabel;i>0;i--) {
			var dataArray1 = new Array();
			dataArray2 = $("#loansarrayPercentage"+(i-1)).val().split(',');
			dataArray1[0] = dataArray2[0];
			dataArray1[1] =	parseFloat(dataArray2[1]);
			dataArray1[2] = parseFloat(dataArray2[2]);
			dataArray1[3] = parseFloat(dataArray2[3]);
			data.addRows([
				dataArray1,
			]);
		}
	var options = {'title':'NPA Loans (%)','width':1050,'height':700, is3D: true,vAxis: {title: "#Loans Ratio"},hAxis: {title: "DATE"},};
	var chart = new google.visualization.LineChart(document.getElementById('chart_div5'));
	chart.draw(data, options);
}

$(document).ready(function() {
	$('#tableview').bind('click', function(e) {
		e.preventDefault();
	$('#tableview table').fixedHeaderTable({ fixedColumns: 1});
	});
	$("#tableview").show();
		$("#tableParview").hide();
		$("#tableLoansview").hide();
	
	$("#custom-li-2").click(function(){
		$("#tableview").hide();
			$("#table-li-1").hide();
	$("#table-li-2").hide();
	$("#table-li-3").hide();
			$("#tableview").hide();
		$("#tableParview").hide();
		$("#tableLoansview").hide();
		$("#chartid").show();
		$("#chart_div").show();
		chartNPAPOS();
		$("#chart_div1").hide();
		$("#chart_div2").hide();
		$("#chart_div3").hide();
		$("#chart_div4").hide();
		$("#chart_div5").hide();
	});
	$("#custom-li-1").click(function(){
		$("#tableview").show();
		$("#table-li-1").show();
		$("#table-li-2").show();
		$("#table-li-3").show();
		
		$("#chartid").hide();
		$("#chart_div").hide();
		$("#chart_div1").hide();
		$("#chart_div2").hide();
		$("#chart_div3").hide();
		$("#chart_div4").hide();
		$("#chart_div5").hide();
	});
	$("#table-li-1").click(function(){
		$("#tableview").show();
		$("#tableParview").hide();
		$("#tableLoansview").hide();

	});
	$("#table-li-2").click(function(){
		$("#tableview").hide();
		$("#tableParview").show();
		$("#tableLoansview").hide();

	});
	$("#table-li-3").click(function(){
		$("#tableview").hide();
		$("#tableParview").hide();
		$("#tableLoansview").show();

	
	});
	$("#custom-li-chart").click(function(){
		
		$("#chart_div").show();
		chartNPAPOS();
		$("#chart_div1").hide();
		$("#chart_div2").hide();
		$("#chart_div3").hide();
		$("#chart_div4").hide();
		$("#chart_div5").hide();
	});
	$("#custom-li-chart1").click(function(){
		$("#chart_div").hide();
		$("#chart_div1").show();
		chartNPAPerc();
		$("#chart_div2").hide();
		$("#chart_div3").hide();
		$("#chart_div4").hide();
		$("#chart_div5").hide();
	});
	$("#custom-li-chart2").click(function(){
		$("#chart_div").hide();
		$("#chart_div1").hide();
		$("#chart_div2").show();
		chartOverdue();
		$("#chart_div3").hide();
		$("#chart_div4").hide();
		$("#chart_div5").hide();
	});
	$("#custom-li-chart3").click(function(){
		$("#chart_div").hide();
		$("#chart_div1").hide();
		$("#chart_div2").hide();
		$("#chart_div3").show();
		chartNPALoans();
		$("#chart_div4").hide();
		$("#chart_div5").hide();
	});
	$("#custom-li-chart4").click(function(){
		$("#chart_div").hide();
		$("#chart_div1").hide();
		$("#chart_div2").hide();
		$("#chart_div3").hide();
		$("#chart_div4").show();
		chartPARPerc();
		$("#chart_div5").hide();
	});
	$("#custom-li-chart5").click(function(){
		$("#chart_div").hide();
		$("#chart_div1").hide();
		$("#chart_div2").hide();
		$("#chart_div3").hide();
		$("#chart_div4").hide();
		$("#chart_div5").show();
		chartNPALoansPercentage();
	});

	$("#chartMenu").hide();

	
	$("#chartid").hide();
	$("#chart_div").hide();
	$("#chart_div1").hide();
	$("#chart_div2").hide();
	$("#chart_div3").hide();
	$("#chart_div4").hide();
	$("#chart_div5").hide();
	//alert($("#arrayid0").val());
	//alert($("#arrayid1").val());
	$('#loanOfficerId').on('change', function() {
        //$("#processNotificationId").show();
        $.mobile.showPageLoadingMsg();
		document.getElementById("NPAReportForm").method='POST';
		document.getElementById("NPAReportForm").action=localStorage.contextPath+"/client/ci/viewnpaReport";
		document.getElementById("NPAReportForm").submit();
	});
	$('#productCategoryId').on('change', function() {
        //$("#processNotificationId").show();
        $.mobile.showPageLoadingMsg();
		document.getElementById("NPAReportForm").method='POST';
		document.getElementById("NPAReportForm").action=localStorage.contextPath+"/client/ci/viewnpaReport";
		document.getElementById("NPAReportForm").submit();
	});
	
	$('#officeId').on('change', function() {
        //$("#processNotificationId").show();
        $.mobile.showPageLoadingMsg();
		document.getElementById("NPAReportForm").method='POST';
		document.getElementById("NPAReportForm").action=localStorage.contextPath+"/client/ci/viewnpaReport";
		document.getElementById("NPAReportForm").submit();
		/*var selectedOfficeId = $("#officeId").val();
		
		var officeIdArray = $("#officePersonnelIdArrayHidden").val().split(',');
		var personnelIdArray = $("#personnelIdArrayHidden").val().split(',');
		var personnelNameArray = $("#personnelNameArrayHidden").val().split(',');
		$("#loanOfficerId").val('0').selectmenu("refresh");
		document.getElementById('loanOfficerId').options.length = 0;
		var combo1 = document.getElementById("loanOfficerId");

		option = document.createElement("option");
		option.text = "All";
		option.value ="-1";
		 try {
			combo1.add(option, null); //Standard 
		}catch(error) {
			combo1.add(option); // IE only
		}
		for(var i=0;i<personnelIdArray.length;i++){
			if((officeIdArray[i] == selectedOfficeId) || (selectedOfficeId == -1)) {
				var combo = document.getElementById("loanOfficerId");
				option = document.createElement("option");
				option.text = personnelNameArray[i];
				option.value =personnelIdArray[i];
				 try {
					combo.add(option, null); //Standard 
				}catch(error) {
					combo.add(option); // IE only
				}
			}
		}*/
	});
});
