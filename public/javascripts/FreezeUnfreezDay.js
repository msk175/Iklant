var clientListcurrentrow = 0;
var clientListmaxrows = 0;
var clientListPageNo = 1;

var outListcurrentrow = 0;
var outListmaxrows = 0;
var outListPageNo = 1;

function unfreezDay(){
	$("#errorMsg").text("");
	var data ={};
	data.dateofTransaction 	 =  $("#dateofTransactionId").val();
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
		url: 'http://'+ajaxcallip+localStorage.contextPath+'/client/ci/daybook/doUnfreezeDay',
		success: function(data) {
			if(data.status == "success"){
				//showBankPaymentForm();
                if (data.freezedStatusMsg.indexOf('not') > -1 || data.freezedStatusMsg.indexOf('already') > -1) {
                    $("#successMsg").text("");
                    $("#errorMsg").text(data.freezedStatusMsg.replace('.','') + " for " + $("#dateofTransactionId").val());
                } else {
                    $("#errorMsg").text("");
                    $("#successMsg").text(data.freezedStatusMsg.replace('.','') + " for " + $("#dateofTransactionId").val());
                }
			}else {
				showPageExpired();
			}
		},
		error : function(jqXHR, textStatus, error) {
			showPageExpired();
		}		
	});	
}
function closeDayForAE(i,closingDate){
	var data ={};
	data.dateofTransaction = closingDate;
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
		url: 'http://'+ajaxcallip+localStorage.contextPath+'/client/ci/daybook/closeUnfreezedDayForAE',
		success: function(data) {
			if(data.status == "success"){
				$("#closeday"+i).hide();
				$("#labelClosedayID"+i).text('Day Closed');
			}else{
				showPageExpired();
			}
		},
		error : function(jqXHR, textStatus, error) {
			showPageExpired();
		}		
	});	
}
function freezDay(i,closingDate){
	var data ={};
	data.dateofTransaction = closingDate;
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
		url: 'http://'+ajaxcallip+localStorage.contextPath+'/client/ci/daybook/doFreezeDay',
		success: function(data) {
			if(data.status == "success"){  
				//$("#successMsg").text(data.freezedStatusMsg);
				$("#actionId"+i).hide();
				$("#labelRevertID"+i).text('Day Freezed');
			}else{
				showPageExpired();
			}
		},
		error : function(jqXHR, textStatus, error) {
			showPageExpired();
		}		
	});	
}
function showOutflow(){
	$("#prevNextDiv").hide();
	$("#prevNextDivForOutflow").show();

var outflowDescription 	= new Array();
var outflowTrxnType 	= new Array();
var outflowTrxnAmt 		= new Array();
outflowDescription 	= $("#description").val().split(',');
outflowDescription = $.grep(outflowDescription,function(n){return(n);});
outflowTrxnType 	= $("#txtnType").val().split(',');
outflowTrxnAmt 		= $("#amount").val().split(',');
	$('table').remove('#outFlowTableId');
	var newContent = '<table id="outFlowTableId">';
	$("#outFlowDivId").append(newContent).trigger('create'); 
	$("#successMsgForOutflow").show();
	$("#successMsgForTable").hide();
	if(outflowDescription.length == 0){
		$("#prevNextDiv").hide();
		$("#prevNextDivForOutflow").hide();
		$("#successMsgForOutflow").text("No Outflows found");
	}else{
		var newContent ='<tr>';
		newContent+='<th>';
		newContent+= "S.NO";
		newContent+='</th>';
		newContent+='<th>';
		newContent+= "Description";
		newContent+='</th>';
		newContent+='<th>';
		newContent+= "Type";
		newContent+='</th>';
		newContent+='<th>';
		newContent+= "Amount";
		newContent+='</th>';
		newContent+='</tr>';
		$("#outFlowTableId").append(newContent).trigger('create');
		for(var i=0;i<outflowDescription.length;i++) {
			var newContent ='<tr class = "showhide">';
			newContent+='<td>';
			newContent+= i+1;
			newContent+='</td>';
			newContent+='<td>';
			newContent+= outflowDescription[i];
			newContent+='</td>';
			newContent+='<td>';
			newContent+= outflowTrxnType[i];
			newContent+='</td>';
			newContent+='<td>';
			newContent+= outflowTrxnAmt[i];
			newContent+='</td>';
			newContent+='</tr>';
			$("#outFlowTableId").append(newContent).trigger('create');
		}
		outListcurrentrow = 0;
		outListmaxrows = $("#outFlowTableId tr").length-1;
		
		$("#outListPrevId").hide();
		if(outListmaxrows > 5) {
			$("#outListNextId").show();
		}else{
			$("#outListNextId").hide();
		}
		$('#outFlowTableId tr.showhide').hide();
		for(var i =0 ; i<5; i++) {
			if (outListcurrentrow < outListmaxrows) {
			   $('#outFlowTableId tr.showhide:eq(' + outListcurrentrow  + ')').show();
			   outListcurrentrow++;
			}
		}
		outListPageNo = 1;
		var $btn_text  = $('#outListPageNoId').find('.ui-btn-text')
		$btn_text.text("Records of "+outListPageNo+" - "+outListcurrentrow+" of "+outListmaxrows);
    }
	$("#clientListDivId").hide();
	$("#outFlowDivId").show();
}
function showInflow(){
	$("#prevNextDivForOutflow").hide();

	$("#clientListDivId").show();
	$("#outFlowDivId").hide();
	$("#successMsgForOutflow").hide();
	$("#successMsgForTable").show();
	
	clientListcurrentrow = 0;
		clientListmaxrows = $("#clientListTableId tr").length-1;
		if(clientListmaxrows > 0){
			$("#prevNextDiv").show();
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
			$btn_text.text("Records "+clientListPageNo+" - "+clientListcurrentrow+" of "+clientListmaxrows);
		}
	
}
function verifyDay(j,closingDate){
	$("#successMsgForTable").text("" );
	$("#successMsgForOutflow").text("" );
	//$('table').remove('#clientListTableId');
	//$('table').remove('#outFlowTableId');
	$('div').remove('#clientListDivId');
	var newContent = '<div data-role="content"  id="clientListDivId" style = "overflow: auto;">';
	$("#abc").append(newContent).trigger('create'); 
	
	$('div').remove('#outFlowDivId');
	var newContent = '<div data-role="content"  id="outFlowDivId" style = "overflow: auto;">';
	$("#def").append(newContent).trigger('create'); 
	
	$("#prevNextDivForOutflow").hide();
	$("#prevNextDiv").hide();

	var data ={};
	data.dateofTransaction = closingDate;
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
		url: 'http://'+ajaxcallip+localStorage.contextPath+'/client/ci/daybook/retrieveInflowOutflow',
		success: function(data) {
			if(data.status == "success"){ 
				var outflowDescription 	= new Array();
				var outflowTrxnType 	= new Array();
				var outflowTrxnAmt 		= new Array();
				for(var i=0;i<data.outflowDetails.length;i++){
					outflowDescription[i] =	data.outflowDetails[i].description;
				    outflowTrxnType[i] 	=data.outflowDetails[i].transactionType;
				    outflowTrxnAmt[i] 	=	data.outflowDetails[i].transactionAmount;
				}
				$("#description").val(outflowDescription);
				$("#txtnType").val(outflowTrxnType);
				$("#amount").val(outflowTrxnAmt);
				//$('table').remove('#clientListTableId');
				var newContent = '<table id="clientListTableId">';
				$("#clientListDivId").append(newContent).trigger('create'); 
				if(data.inflowDetails.length == 0){
					$("#prevNextDiv").hide();
					$("#successMsgForTable").text("No Inflows found" );
				}else{
					$("#prevNextDiv").show();
					var newContent ='<tr>';
					newContent+='<th>';
					newContent+= "S.NO";
					newContent+='</th>';
					newContent+='<th>';
					newContent+= "Description";
					newContent+='</th>';
					newContent+='<th>';
					newContent+= "Type";
					newContent+='</th>';
					newContent+='<th>';
					newContent+= "Amount";
					newContent+='</th>';
					newContent+='</tr>';
					$("#clientListTableId").append(newContent).trigger('create');
					for(var i=0;i<data.inflowDetails.length;i++) {
						var newContent ='<tr class = "showhide">';
						newContent+='<td>';
						newContent+= i+1;
						newContent+='</td>';
						newContent+='<td>';
						newContent+= data.inflowDetails[i].description;
						newContent+='</td>';
						newContent+='<td>';
						newContent+= data.inflowDetails[i].transactionType;
						newContent+='</td>';
						newContent+='<td>';
						newContent+= data.inflowDetails[i].transactionAmount;
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
				$btn_text.text("Records "+clientListPageNo+" - "+clientListcurrentrow+" of "+clientListmaxrows);
			}
				$("#groupid").text(data.ClosingBalance + "  on " + closingDate);
				

				document.getElementById("imageId"+j).href= "#recentActivityPopup";
				$("#imageId"+j).trigger('click');
				//$("#custommainTab"+i).trigger('click');
				document.getElementById("imageId"+j).href= "JavaScript:verifyDay("+j+",'"+closingDate+"')";
			}else{
				showPageExpired();
			}
		},
		error : function(jqXHR, textStatus, error) {
			showPageExpired();
		}		
	});	
}
$(document).ready(function() {
	$("#prevNextDivForOutflow").hide();
	var d = new Date;
	if(d.getMonth() <= 2) {
		var startDate = "01-04-"+(d.getFullYear()-1);
	}
	else {
		var startDate = "01-04-"+d.getFullYear();
	}
	var date=new Date();
    day=date.getDate();
    month=date.getMonth();
    month=month+1;
    if((String(day)).length==1)
		day='0'+day;
    if((String(month)).length==1)
		month='0'+month;

    dateT=day+ '-' + month + '-' + date.getFullYear();
	$( "#dateofTransactionId" ).val(dateT);
	$(function() {
		$( "#dateofTransactionId" ).datepicker({
			maxDate: new Date,
			minDate: '01-04-2015',
			//minDate: startDate,
			dateFormat: 'dd-mm-yy',
			yearRange: "-90:+0",
  			changeMonth: true,
            changeYear: true
        });
	});
	
	var alertMsg = $("#freezedDayMsgId").val().trim() ;
	if(alertMsg == 'undefined' || alertMsg == ""){
	}
	else{
		$('#freezedDayAlertMsgId').popup('open');
	}
	/*$("#freezId").click(function(){
		document.getElementById("freezUnfreezDayFormId").method='POST';
		document.getElementById("freezUnfreezDayFormId").action=localStorage.contextPath+"/client/ci/daybook/doFreezeDay";
		document.getElementById("freezUnfreezDayFormId").submit();
	});
	$("#unfreezId").click(function(){
		document.getElementById("freezUnfreezDayFormId").method='POST';
		document.getElementById("freezUnfreezDayFormId").action=localStorage.contextPath+"/client/ci/daybook/doUnfreezeDay";
		document.getElementById("freezUnfreezDayFormId").submit();
	});*/
});
function doNext(){
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
}
function doPrev(){
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
}
function doNextForOutflow(){
		if(outListcurrentrow == 5){
			$("#outListPrevId").show();
		}
		//alert("next"+outListcurrentrow);
		var hidepreviousrow = outListcurrentrow;
		for(var i =0 ; i<5; i++) {
			hidepreviousrow--;
			$('#outFlowTableId tr.showhide:eq(' + hidepreviousrow  + ')').hide();
			if (outListcurrentrow < outListmaxrows) {
				$('#outFlowTableId tr.showhide:eq(' + outListcurrentrow  + ')').show();
				outListcurrentrow ++;
			}
		}
		if(outListcurrentrow == outListmaxrows){
			$("#outListNextId").hide();
		}
		outListPageNo = outListPageNo+5;
		var $btn_text  = $('#outListPageNoId').find('.ui-btn-text')
		$btn_text.text("Records "+outListPageNo+" - "+outListcurrentrow+" of "+outListmaxrows);  
}
function doPrevForOutflow(){
		if(outListcurrentrow == outListmaxrows){
			$("#outListNextId").show();
		}
		
		var hidenextrow = outListcurrentrow;
		if(outListmaxrows == outListcurrentrow){
			var x = outListmaxrows % 5;
			if(x>0){
				hidenextrow = hidenextrow + (5 - x);
				outListcurrentrow = outListcurrentrow + (5 - x);   
			}
		}
		for(var i =0 ; i<5; i++) {
			hidenextrow--;
			$('#outFlowTableId tr.showhide:eq(' + hidenextrow  + ')').hide();
			if (outListcurrentrow > 0) {
				outListcurrentrow --;
				$('#outFlowTableId tr.showhide:eq(' + (outListcurrentrow-5)  +')').show();
				
			}   
		}
		if(outListcurrentrow == 5){
			$("#outListPrevId").hide();
		}
		outListPageNo = outListPageNo - 5;
		var $btn_text  = $('#outListPageNoId').find('.ui-btn-text')
		$btn_text.text("Records "+outListPageNo+" - "+outListcurrentrow+" of "+outListmaxrows);  
}
