var clientListcurrentrow = 0;
var clientListmaxrows = 0;
var clientListPageNo = 1;

var inc=0;
var sno=1;
var noOfClients=0;

$(document).ready(function() {

$("#selectDocDivId").hide();
$("#otherReasonDivId").hide();

$("#reason").multiselect({
	noneSelectedText: "Select Reasons",
	selectedText: "# of # reasons selected",
        close: function(event, ui){
			// event handler here
			if($("#reason").val() != null){
				var selectedValues = $("#reason").val();
				for(var i=0;i<selectedValues.length;i++){
					if(selectedValues[i] == 1){
						$("#otherReasonDivId").show();
						break;
					}else
						$("#otherReasonDivId").hide();
				}
			}else{
				$("#otherReasonDivId").hide();
			}
		}
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
	
	if($("#loanstatus").val() == 1){
		if($("#answerNO1Id").val() == 1){
		$('input:radio[name=gltraceable]:nth(0)').attr('checked',true).checkboxradio("refresh");
		}else if($("#answerNO1Id").val() == 0){
			$('input:radio[name=gltraceable]:nth(1)').attr('checked',true).checkboxradio("refresh");
		}
		if($("#answerNO2Id").val() == 1){
			$('input:radio[name=sltraceable]:nth(0)').attr('checked',true).checkboxradio("refresh");
		}else if($("#answerNO2Id").val() == 0){
			$('input:radio[name=sltraceable]:nth(1)').attr('checked',true).checkboxradio("refresh");
		}
		if($("#answerNO3Id").val() == 1){
			$('input:radio[name=gmtraceable]:nth(0)').attr('checked',true).checkboxradio("refresh");
		}else if($("#answerNO3Id").val() == 0){
			$('input:radio[name=gmtraceable]:nth(1)').attr('checked',true).checkboxradio("refresh");
		}
		if($("#answerNO4Id").val() == 1){
			$('input:radio[name=amtnotupdated]:nth(0)').attr('checked',true).checkboxradio("refresh");
		}else if($("#answerNO4Id").val() == 0){
			$('input:radio[name=amtnotupdated]:nth(1)').attr('checked',true).checkboxradio("refresh");
		}
		if($("#answerNO5Id").val() == 1){
			$('input:radio[name=capable]:nth(0)').attr('checked',true).checkboxradio("refresh");
		}else if($("#answerNO5Id").val() == 0){
			$('input:radio[name=capable]:nth(1)').attr('checked',true).checkboxradio("refresh");
		}
		
		var dataarray=$('#reasonsMultiselect').val().split(",");
		$("#reason").val(dataarray).multiselect("refresh");
		
		$("#percentageId").val($("#capabilityPercentage").val()).selectmenu("refresh");
		$("#approvalDateId").val($("#expectedNextPayment").val());
		if($("#generalRemarks").val() != 'null'){
			$("#remarksId").val($("#generalRemarks").val());
		}else{
			$("#remarksId").val('');
		}
		$("#otherReasonId").val($("#reasonForNotCapable").val());
		$("#otherReasonDivId").show();
	}
	
	//upload Documents for group/client
	$("#clientNameDivId").hide();
	$("#groupDocRadioId").click(function(){
		$("#clientNameDivId").hide();
		$("#selectDocDivId").hide();
	});	
	
	$("#clientDocRadioId").click(function(){
		$("#clientNameDivId").show();
		$("#selectDocDivId").hide();
		
		//retrieveClientDetails
		var data = {};
		data.accountId = $("#accountIdID").val();
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
				url: 'http://'+ajaxcallip+localStorage.contextPath+'/client/ci/retrieveClientDetails',
				success: function(data) {								
					$("#clientNamesId").val('0').selectmenu("refresh");
					document.getElementById('clientNamesId').options.length = 0;
					var combo1 = document.getElementById("clientNamesId");
					
					option = document.createElement("option");
					option.text = "Select";
					option.value ="0";
					 try {
						combo1.add(option, null); //Standard 
					}catch(error) {
						combo1.add(option); // IE only
					}
					for(var i=0;i<data.customerIdArray.length;i++){
						var combo = document.getElementById("clientNamesId");
						
						option = document.createElement("option");
						option.text = data.customerNameArray[i];
						option.value =data.customerIdArray[i];
						 try {
							combo.add(option, null); //Standard 
						}catch(error) {
							combo.add(option); // IE only
						}
					}					
				},error : function(jqXHR, textStatus, error) {
					alert("textStatus" + textStatus);
				}		
			});	
	});	
});

function showClientList(accountId) {
	//alert("j==" + j);
	//alert("paymentId==" + paymentId);
	var data = {};
	data.accountId = accountId;
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
			url: 'http://'+ajaxcallip+localStorage.contextPath+'/client/ci/retrieveClientDetails',
			success: function(data) {
				$('table').remove('#clientListTableId');
				var newContent = '<table id="clientListTableId">';
				$("#clientListDivId").append(newContent).trigger('create'); 
				var newContent ='<tr>';
				newContent+='<th>';
				newContent+= "S.NO";
				newContent+='</th>';
				newContent+='<th>';
				newContent+= "Client Name";
				newContent+='</th>';
				newContent+='<th>';
				newContent+= "Address";
				newContent+='</th>';
				newContent+='</tr>';
				$("#clientListTableId").append(newContent).trigger('create');
				for(var i=0;i<data.customerNameArray.length;i++) {
					var newContent ='<tr class = "showhide">';
					newContent+='<td>';
					newContent+= i+1;
					newContent+='</td>';
					newContent+='<td>';
					newContent+= data.customerNameArray[i];
					newContent+='</td>';
					newContent+='<td>';
					newContent+= data.customerAddressArray[i];
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
				
				document.getElementById("custommainTab").href= "#recentActivityPopup";
				$("#custommainTab").trigger('click');
			},error : function(jqXHR, textStatus, error) {
				alert("textStatus" + textStatus);
            }		
		});	
}		
//download Documents
function downloadFiles(accountId){
	//alert(accountId);
	var selectedClientId = 0;
	var flag = 0;
	if($('input[name="radioGrClSelect"]:checked').val() == 1){
		//group selected
		selectedClientId = 0;
		flag=1;
	}else if($('input[name="radioGrClSelect"]:checked').val() == 2){
		//client selected
		selectedClientId = $("#clientNamesId").val();
		if(selectedClientId!=0){
			flag=1;
		}
		else{
			$("#errorField").text("Please Select a Client Name");
			$(window).scrollTop(0);
		}
		
	}		
	
	if(flag==1){
		var data = {};
		data.accountId = accountId;
		data.clientId = selectedClientId;
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
				url: 'http://'+ajaxcallip+localStorage.contextPath+'/client/ci/retrieveUploadedDocs',
				success: function(data) {
											
				$("#downloadDocsId").val('0').selectmenu("refresh");
				document.getElementById('downloadDocsId').options.length = 0;
				var combo1 = document.getElementById("downloadDocsId");
				
				option = document.createElement("option");
				option.text = "Select";
				option.value ="0";
				 try {
					combo1.add(option, null); //Standard 
				}catch(error) {
					combo1.add(option); // IE only
				}
				if(data.docsListArray.length!=0){
					$("#selectDocDivId").show();
					for(var i=0;i<data.docsListArray.length;i++){
						var combo = document.getElementById("downloadDocsId");
						
						option = document.createElement("option");
						option.text =  "Doc"+(i+1);
						option.value = data.docsListArray[i];
						 try {
							combo.add(option, null); //Standard 
						}catch(error) {
							combo.add(option); // IE only
						}
					}
				}else{
					$("#errorField").text("No Documents Available.");
					$(window).scrollTop(0);
				}
					
				},error : function(jqXHR, textStatus, error) {
					alert("textStatus" + textStatus);
				}		
			});	
	}
}

//function to download docs
function downloadDocs(selectedDocLocation){
    $.mobile.showPageLoadingMsg();
	document.getElementById("selectedDocId").value=selectedDocLocation;
	document.getElementById("recoveryFormID").method='POST';
	document.getElementById("recoveryFormID").action=localStorage.contextPath+'/client/ci/downloadDocs';
	document.getElementById("recoveryFormID").submit();
}