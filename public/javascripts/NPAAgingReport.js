var clientListcurrentrow = 0;
var clientListmaxrows = 0;
var clientListPageNo = 1;

$(document).ready(function() {
$("#agingApexDivId").hide();
$("#agingRBIDivId").hide();
$("#agingLoansDivId").hide();
$("#agingKumaranDivId").show();
$("#aging-li-1").click(function(){
		$("#agingKumaranDivId").show();
		$("#agingApexDivId").hide();
		$("#agingRBIDivId").hide();
        $("#par30DivId").hide();
		$("#agingLoansDivId").hide();
	});
	$("#aging-li-2").click(function(){
		$("#agingKumaranDivId").hide();
		$("#agingApexDivId").show();
		$("#agingRBIDivId").hide();
        $("#par30DivId").hide();
		$("#agingLoansDivId").hide();
	});
	$("#aging-li-3").click(function(){
		$("#agingKumaranDivId").hide();
		$("#agingApexDivId").hide();
        $("#par30DivId").hide();
		$("#agingRBIDivId").show();
		$("#agingLoansDivId").hide();
	});
	$("#aging-li-4").click(function(){
		$("#agingKumaranDivId").hide();
		$("#agingApexDivId").hide();
		$("#agingRBIDivId").hide();
        $("#par30DivId").hide();
		$("#agingLoansDivId").show();
	});
    $("#aging-li-5").click(function(){
        $("#agingKumaranDivId").hide();
        $("#agingApexDivId").hide();
        $("#agingRBIDivId").hide();
        $("#agingLoansDivId").hide();
        $("#par30DivId").show();
    });

		$('#loanOfficerId').on('change', function() {
        //$("#processNotificationId").show();
            $.mobile.showPageLoadingMsg();
		document.getElementById("NPAReportForm").method='POST';
		document.getElementById("NPAReportForm").action=localStorage.contextPath+"/client/ci/viewNpaAgingReport";
		document.getElementById("NPAReportForm").submit();
	});
	$('#productCategoryId').on('change', function() {
        //$("#processNotificationId").show();
        $.mobile.showPageLoadingMsg();
		document.getElementById("NPAReportForm").method='POST';
		document.getElementById("NPAReportForm").action=localStorage.contextPath+"/client/ci/viewNpaAgingReport";
		document.getElementById("NPAReportForm").submit();
	});
	
	$('#officeId').on('change', function() {
        //$("#processNotificationId").show();
        $.mobile.showPageLoadingMsg();
		document.getElementById("NPAReportForm").method='POST';
		document.getElementById("NPAReportForm").action=localStorage.contextPath+"/client/ci/viewNpaAgingReport";
		document.getElementById("NPAReportForm").submit();
	});
	$("#clientListPrevId").click(function() {
		if(clientListcurrentrow == clientListmaxrows){
			$("#clientListNextId").show();
		}
		
		var hidenextrow = clientListcurrentrow;
		if(clientListmaxrows == clientListcurrentrow){
			var x = clientListmaxrows % 5;
			if(x>0){
				hidenextrow = hidenextrow + (5 - x);
				clientListcurrentrow = clientListcurrentrow + (5 - x);   
			}
		}
		for(var i =0 ; i<5; i++) {
			hidenextrow--;
			$('#clientListTableId tr.showhide:eq(' + hidenextrow  + ')').hide();
			if (clientListcurrentrow > 0) {
				clientListcurrentrow --;
				$('#clientListTableId tr.showhide:eq(' + (clientListcurrentrow-5)  +')').show();
				
			}   
		}
		if(clientListcurrentrow == 5){
			$("#clientListPrevId").hide();
		}
		clientListPageNo = clientListPageNo - 5;
		var $btn_text  = $('#clientListPageNoId').find('.ui-btn-text')
		$btn_text.text("Records "+clientListPageNo+" - "+clientListcurrentrow+" of "+clientListmaxrows);  
		
	});



	//Group Installment Due pagination//
	$("#clientListNextId").click(function() {
		if(clientListcurrentrow == 5){
			$("#clientListPrevId").show();
		}
		//alert("next"+clientListcurrentrow);
		var hidepreviousrow = clientListcurrentrow;
		for(var i =0 ; i<5; i++) {
			hidepreviousrow--;
			$('#clientListTableId tr.showhide:eq(' + hidepreviousrow  + ')').hide();
			if (clientListcurrentrow < clientListmaxrows) {
				$('#clientListTableId tr.showhide:eq(' + clientListcurrentrow  + ')').show();
				clientListcurrentrow ++;
			}
		}
		if(clientListcurrentrow == clientListmaxrows){
			$("#clientListNextId").hide();
		}
		clientListPageNo = clientListPageNo+5;
		var $btn_text  = $('#clientListPageNoId').find('.ui-btn-text')
		$btn_text.text("Records "+clientListPageNo+" - "+clientListcurrentrow+" of "+clientListmaxrows);    
	});
});
function showDefaultLoanDetails(index,fromDaysInArrears,toDaysInArrears,date,displayDate,label,hrefId){
	/*alert("OfficeID "+  $("#officeId").val());
	alert("Loan Officer " + $("#loanOfficerId").val());
	alert("Prd Category  " + $("#productCategoryId").val());
	alert("fromDaysInArrears " + fromDaysInArrears);
	alert("toDaysInArrears " + toDaysInArrears);
	alert("date "+date);*/
	var data = {};
	data.office = $("#officeId").val();
	data.loanOfficer = $("#loanOfficerId").val();
	data.productCategory = $("#productCategoryId").val();
	data.daysArrearsId = fromDaysInArrears;
	data.daysInArrearsMaxRange = toDaysInArrears;
	data.rptdate = date;
	ajaxVariable = $.ajax({
		beforeSend : function() { 
			$.mobile.showPageLoadingMsg(); 
		},
		complete: function() { 
			$.mobile.hidePageLoadingMsg() 
		},
		type: 'POST',
		data: JSON.stringify(data),
		contentType: 'application/json',
		url: 'http://'+ajaxcallip+localStorage.contextPath+'/client/ci/viewNpaDetailForDefaultDays',
		success: function(data) {
			$("#labelTextLi").text(label + " on " + displayDate);
			$('table').remove('#clientListTableId');
				var newContent = '<table id="clientListTableId">';
				$("#clientListDivId").append(newContent).trigger('create'); 
				var newContent ='<tr>';
				newContent+='<th>';
				newContent+= "S.NO";
				newContent+='</th>';
				newContent+='<th>';
				newContent+= "Branch";
				newContent+='</th>';
				newContent+='<th>';
				newContent+= "Loan Officer";
				newContent+='</th>';
				newContent+='<th>';
				newContent+= "Group Name";
				newContent+='</th>';
				newContent+='<th>';
				newContent+= "Account Number";
				newContent+='</th>';
				newContent+='<th>';
				newContent+= "Loan Amount";
				newContent+='</th>';
				newContent+='<th>';
				newContent+= "Demanded Amount";
				newContent+='</th>';
				newContent+='<th>';
				newContent+= "Paid Amount";
				newContent+='</th>';
				newContent+='<th>';
				newContent+= "Overdue Amount";
				newContent+='</th>';
				newContent+='<th>';
				newContent+= "Outstanding Amount";
				newContent+='</th>';
				newContent+='<th>';
				newContent+= "Days in arrears";
				newContent+='</th>';
				newContent+='</tr>';
				$("#clientListTableId").append(newContent).trigger('create');
				for(var i=0;i<data.npaDetailArray.length;i++) {
					var newContent ='<tr class = "showhide">';
					newContent+='<td>';
					newContent+= i+1;
					newContent+='</td>';
					newContent+='<td>';
					newContent+= data.npaDetailArray[i].office;
					newContent+='</td>';
					newContent+='<td>';
					newContent+= data.npaDetailArray[i].personnel;
					newContent+='</td>';
					newContent+='<td>';
					newContent+= data.npaDetailArray[i].customer;
					newContent+='</td>';
					newContent+='<td>';
					newContent+= data.npaDetailArray[i].globalAccountNum;
					newContent+='</td>';
					newContent+='<td>';
					newContent+= data.npaDetailArray[i].originalPrincipal;
					newContent+='</td>';
					newContent+='<td>';
					newContent+= data.npaDetailArray[i].actualPrincipalDemanded;
					newContent+='</td>';
					newContent+='<td>';
					newContent+= data.npaDetailArray[i].actualPrincipalPaid;
					newContent+='</td>';
					newContent+='<td>';
					newContent+= data.npaDetailArray[i].actualPrincipalOverdue;
					newContent+='</td>';
					newContent+='<td>';
					newContent+= data.npaDetailArray[i].actualPrincipalOutstanding;
					newContent+='</td>';
					newContent+='<td>';
					newContent+= data.npaDetailArray[i].daysInArrears;
					newContent+='</td>';
					newContent+='</tr>';
					$("#clientListTableId").append(newContent).trigger('create');
					
				}
			clientListcurrentrow = 0;
				clientListmaxrows = $("#clientListTableId tr").length-1;
				
				$("#clientListPrevId").hide();
				if(clientListmaxrows > 5) {
					$("#clientListNextId").show();
				}else{
					$("#clientListNextId").hide();
				}
				$('#clientListTableId tr.showhide').hide();
				for(var i =0 ; i<5; i++) {
					if (clientListcurrentrow < clientListmaxrows) {
					   $('#clientListTableId tr.showhide:eq(' + clientListcurrentrow  + ')').show();
					   clientListcurrentrow++;
					}
				}
				clientListPageNo = 1;
				var $btn_text  = $('#clientListPageNoId').find('.ui-btn-text')
				$btn_text.text("NPA Loans "+clientListPageNo+" - "+clientListcurrentrow+" of "+clientListmaxrows);
				
				
			document.getElementById(hrefId+index).href= "#recentActivityPopup";
			$("#"+hrefId+index).trigger('click');
			document.getElementById(hrefId+index).href= "JavaScript:showDefaultLoanDetails('"+index+"','"+fromDaysInArrears+"','"+toDaysInArrears+"','"+date+"','"+displayDate+"','"+label+"','"+hrefId+"')";
		},error : function(jqXHR, textStatus, error) {
			//alert("textStatus" + textStatus);
		}		
	});	
}