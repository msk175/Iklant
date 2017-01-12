var clientListcurrentrow = 0;
var clientListmaxrows = 0;
var clientListPageNo = 1;

var todoActivityArray = new Array();
var todoExpectedDueDateArray = new Array();
var todoExpectedDueTimeArray = new Array();
var inc=0;
var noOfTodo=0;
$(document).ready(function() {

		//NUMBER VALIDATION
	$("#expectedTimeId").keydown(function(event) {
        // Allow: backspace, delete, tab, escape, and enter
		if ( event.keyCode == 46 || event.keyCode == 8 || event.keyCode == 9 || event.keyCode == 27 || event.keyCode == 13 || event.keyCode  == 37 || event.keyCode  == 39 ||
             // Allow: Ctrl+A
            (event.keyCode == 65 && event.ctrlKey === true) || 
             // Allow: home, end, left, right
            (event.keyCode >= 35 && event.keyCode <= 39)) {
                 // let it happen, don't do anything
                 return;
        }
        else {
            // Ensure that it is a number and stop the keypress
            if (event.shiftKey || (event.keyCode < 48 || event.keyCode > 57) && (event.keyCode < 96 || event.keyCode > 105 )) {
                event.preventDefault(); 
            }   
        }
    });
	
	$("#selectDocDivId").hide();

	$(function() {
		$( "#expectedDateId" ).datepicker({
			dateFormat: 'dd/mm/yy',
			yearRange: "-90:+0",
			changeMonth: true,
			changeYear: true,
			minDate: new Date
		});
	});

	$('#multipleDocDivId').hide();
	$("#isMultipleDocCheckID").click(function() {
		if($("#isMultipleDocCheckID").is(':checked')==true){
			$("#isMultipleDocumentId").val($(this).is(':checked'));
			$('#multipleDocDivId').show();
			$('#singleDocDivId').hide();
			$('#singleUploadDocumentId').val("");
		}
		else if($("#isMultipleDocCheckID").is(':checked')==false){
			$("#isMultipleDocumentId").val($(this).is(':checked'));
			$('#multipleDocDivId').hide();
			$('#singleDocDivId').show();
			$('#multipleUploadDocumentId').val("");
		}		
	});

	$("#addTodoId").click(function() {
		$("#errorLabel").text('');
		$("#activityId").val('');
		$("#expectedDateId").val('');
		$("#expectedTimeId").val('')
	});

	//Dynamic add todo 	
	$("#addTodo").click(function() {
		if($("#activityId").val() == '' || $("#expectedDateId").val() == '' || $("#expectedTimeId").val() == '') {
			$("#errorLabel").text("Please fill all the fields");
			$("a#addTodo").attr('href','');
		}
		else if($("#expectedTimeId").val() > 24) {
			$("#errorLabel").text("Time should be less than 24hrs");
			$("a#addTodo").attr('href','');
		}
		else {
			var newContent = '<div data-role="content" data-theme="b" class="content-primary">';
			newContent += '<ul data-role="listview" data-split-theme="b" data-inset="true" id="ulId">';
			newContent += '<li>';
			newContent += '<a href="">';
			newContent += "<label for='activityName'"+inc+" id='activityID'"+inc+">Activity : "+$("#activityId").val()+"   Date : "+$("#expectedDateId").val()+"</label>";
			newContent += '<a href="", onclick="removeTodo(this,'+inc+')" , data-icon="delete">';
			newContent += '</a>';
			newContent += '</li>';
			newContent += '</ul>';
			newContent += '</div>';
			$("#addTodoDivId").append(newContent).trigger('create'); 
			inc++;
			noOfTodo++;
			todoActivityArray.push($('#activityId').val());
			todoExpectedDueDateArray.push($('#expectedDateId').val());
			todoExpectedDueTimeArray.push($('#expectedTimeId').val());
			$('#todoActivity').val(todoActivityArray);
			$('#todoDueDate').val(todoExpectedDueDateArray);
			$('#todoDueTime').val(todoExpectedDueTimeArray);
			
			$("a#addTodo").attr('href','#addTodoPopupId');
		}
	});

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
	$(function() {
		$("#approvalDateId").datepicker({
			minDate: new Date,
			dateFormat: 'dd/mm/yy',
			yearRange: "0:+1",
  			changeMonth: true,
            changeYear: true,
			onClose: function () {
				var selectedDate = $("#approvalDateId").val().split("/");
				var oneDay = 24*60*60*1000; // hours*minutes*seconds*milliseconds
				var firstDate = new Date();
				var secondDate = new Date(selectedDate[2],selectedDate[1]-1,selectedDate[0]);
				var diffDays = Math.round(Math.abs((firstDate.getTime() - secondDate.getTime())/(oneDay)));
				calculateCapabilityPercentage(diffDays);
			}
        });
	});

	if($("#loanstatus").val() == 0){
		$("#saveButtonDiv").hide();
		$("#subLeaderTraceable").hide();
		$("#membersTraceable").hide();
		$("#amountnotupdated").hide();
		$("#reasonDiv").hide();
		$("#capableDiv").hide();
		$("#percentageDiv").hide();
		$("#expecteddateDiv").hide();
		$("#remarks").hide();
		$("#message").hide();
		
		$("#glYesId").click(function(){
			$("#amountnotupdated").show();
			$("#subLeaderTraceable").hide();
			$("#membersTraceable").hide();
			$("#reasonDiv").hide();
			$("#capableDiv").hide();
			$("#percentageDiv").hide();
			$("#expecteddateDiv").hide();
			$("#message").hide();
			$("#saveButtonDiv").hide();
		});
		$("#glNoId").click(function(){
			$("#subLeaderTraceable").show();
			$("#membersTraceable").hide();
			$("#amountnotupdated").hide();
			$("#reasonDiv").hide();
			$("#capableDiv").hide();
			$("#percentageDiv").hide();
			$("#expecteddateDiv").hide();
			$("#message").hide();
			$("#saveButtonDiv").hide();
		});	
		
		$("#slYesId").click(function(){
			$("#amountnotupdated").show();
			$("#reasonDiv").hide();
			$("#capableDiv").hide();
			$("#percentageDiv").hide();
			$("#expecteddateDiv").hide();
			$("#message").hide();
			$("#saveButtonDiv").hide();
		});
		$("#slNoId").click(function(){
			$("#membersTraceable").show();
			$("#amountnotupdated").hide();
			$("#reasonDiv").hide();
			$("#capableDiv").hide();
			$("#percentageDiv").hide();
			$("#expecteddateDiv").hide();
			$("#message").hide();
			$("#saveButtonDiv").hide();
		});	
		
		$("#gmYesId").click(function(){
			$("#amountnotupdated").show();
			$("#reasonDiv").hide();
			$("#capableDiv").hide();
			$("#percentageDiv").hide();
			$("#expecteddateDiv").hide();
			$("#message").hide();
			$("#saveButtonDiv").hide();
		});
		$("#gmNoId").click(function(){
			$("#info").text("Couldn't trace any client,Submit Verified Details");
			$("#message").show();
			$("#amountnotupdated").hide();
			$("#reasonDiv").hide();
			$("#capableDiv").hide();
			$("#percentageDiv").hide();
			$("#expecteddateDiv").hide();
			$("#saveButtonDiv").show();
		});	
		
		$("#amtYesId").click(function(){
			$("#info").text("Submit Verified Details,Head Office will take necessary action");
			$("#message").show();
			$("#reasonDiv").hide();
			$("#remarks").hide();
			$("#capableDiv").hide();
			$("#percentageDiv").hide();
			$("#expecteddateDiv").hide();
			$("#saveButtonDiv").show();
		});
		$("#amtNoId").click(function(){
			$("#reasonDiv").show();
			$("#capableDiv").show();
			$("#percentageDiv").hide();
			$("#expecteddateDiv").hide();
			$("#message").hide();
			$("#saveButtonDiv").hide();
		});	
		
		$("#capableYesId").click(function(){
			$("#percentageDiv").show();
			$("#expecteddateDiv").show();
			$("#reasonDiv").show();
			$("#remarks").hide();
			$("#message").hide();
			$("#saveButtonDiv").show();
		});
		$("#capableNoId").click(function(){
			$("#info").text("Enter remarks for not capable and submit verified details");
			$("#message").show();
			$("#remarks").show();
			$("#saveButtonDiv").show();
			$("#reasonDiv").show();
			$("#capableDiv").show();
			$("#percentageDiv").hide();
			$("#expecteddateDiv").hide();
		});	
	}else{
		//$('#reason').val(3);
		//$('#reason').val(4);
		//$('#reason').val(5);
		//$('input[name="gltraceable"]:checked').val(1);
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
										
function calculateCapabilityPercentage(diffDays) {
	if(diffDays <= 15) {
		$("#percentageId").val(95).selectmenu("refresh");
	}
	else if(diffDays >15 && diffDays <= 30) {
		$("#percentageId").val(80).selectmenu("refresh");
	}
	else if(diffDays >30 && diffDays <= 45) {
		$("#percentageId").val(60).selectmenu("refresh");
	}
	else if(diffDays >45 && diffDays <= 60) {
		$("#percentageId").val(40).selectmenu("refresh");
	}
	else if(diffDays >60 && diffDays <= 75) {
		$("#percentageId").val(20).selectmenu("refresh");
	}
	else if(diffDays >75 && diffDays <= 90) {
		$("#percentageId").val(10).selectmenu("refresh");
	}
	else if(diffDays >90) {
		$("#percentageId").val(5).selectmenu("refresh");
	}
}

function removeTodo(remove,i) {
    r=remove.parentNode.parentNode;
	r.parentNode.removeChild(r);
	todoActivityArray[i]="";
	todoExpectedDueDateArray[i]="";
	todoExpectedDueTimeArray[i]="";
	noOfTodo--;

	$('#todoActivity').val(todoActivityArray);
	$('#todoDueDate').val(todoExpectedDueDateArray);
	$('#todoDueTime').val(todoExpectedDueTimeArray);
}

function uploadFiles(accountId){
	//alert("sdf"+accountId);
	//alert($('input[name="radioGrClSelect"]:checked').val());
	
	if($('input[name="radioGrClSelect"]:checked').val() == 1){
		//Group Selected
		var selectedClientId = 0;
		var multipleFileUpload=$("#multipleUploadDocumentId").val();
		var singleFileUpload=$("#singleUploadDocumentId").val();
		
		if(multipleFileUpload.length!=0 | singleFileUpload.length!=0){
			if($('#multipleUploadDocumentId').get(0).files.length==1){
				$("#errorField").text("Uncheck Multiple Files to upload Single File");
				$(window).scrollTop(0);
			}else{
				//alert("sdf");
				document.getElementById("recoveryFormID").method='POST';
				document.getElementById("recoveryFormID").action=localStorage.contextPath+"/client/ci/npaloans/"+accountId+"/"+selectedClientId+"/uploadFile";
				document.getElementById("recoveryFormID").submit();
			}
		}else{
			$("#errorField").text("Please browse a file to upload");
			$(window).scrollTop(0);
		}
	}
	else if($('input[name="radioGrClSelect"]:checked').val() == 2){
		//Client Selected
		//alert($("#clientNamesId").val())
		if($("#clientNamesId").val() != 0){
			//alert("clientId "+$("#clientNamesId").val());
			var selectedClientId = $("#clientNamesId").val();
			var multipleFileUpload=$("#multipleUploadDocumentId").val();
			var singleFileUpload=$("#singleUploadDocumentId").val();
			
			if(multipleFileUpload.length!=0 | singleFileUpload.length!=0){
				if($('#multipleUploadDocumentId').get(0).files.length==1){
					$("#errorField").text("Uncheck Multiple Files to upload Single File");
					$(window).scrollTop(0);
				}else{
					//alert("sdf");
					document.getElementById("recoveryFormID").method='POST';
					document.getElementById("recoveryFormID").action=localStorage.contextPath+"/client/ci/npaloans/"+accountId+"/"+selectedClientId+"/uploadFile";
					document.getElementById("recoveryFormID").submit();
				}
			}else{
				$("#errorField").text("Please browse a file to upload");
				$(window).scrollTop(0);
			}
		}else{
			//alert("else");
			$("#errorField").text("Please Select a Client Name");
			$(window).scrollTop(0);
		}
	}
	
	
}

function saveVerifedDetails(accountId) {
	//Enabling capability percentage dropdown to get the value in router
	$('#percentageId').removeAttr('disabled');
	
	var glTraceable = $('input[name="gltraceable"]:checked').val();
	if(typeof(glTraceable) == 'undefined'){
		$("#questionNO1Id").val(-1);
	}
	else{
		$("#questionNO1Id").val(glTraceable);
	}
	var slTraceable = $('input[name="sltraceable"]:checked').val();
	if(typeof(slTraceable) == 'undefined'){
		$("#questionNO2Id").val(-1);
	}
	else{
		$("#questionNO2Id").val(slTraceable);
	}
	var memTraceable = $('input[name="gmtraceable"]:checked').val();
	if(typeof(memTraceable) == 'undefined'){
		$("#questionNO3Id").val(-1);
	}
	else{
		$("#questionNO3Id").val(memTraceable);
	}
	var amountStatus = $('input[name="amtnotupdated"]:checked').val();
	if(typeof(amountStatus) == 'undefined'){
		$("#questionNO4Id").val(-1);
	}
	else{
		$("#questionNO4Id").val(amountStatus);
	}
	var capable = $('input[name="capable"]:checked').val();
	if(typeof(capable) == 'undefined'){
		$("#questionNO5Id").val(-1);
	}
	else{
		$("#questionNO5Id").val(capable);
	}
	if(glTraceable == 0 & slTraceable == 0 & memTraceable == 0){
		$("#statusId").val(1);
			todoActivityArray = $.grep(todoActivityArray,function(n){return(n);});
			todoExpectedDueDateArray = $.grep(todoExpectedDueDateArray,function(n){return(n);});
			todoExpectedDueTimeArray = $.grep(todoExpectedDueTimeArray,function(n){return(n);});
			$('#todoActivity').val(todoActivityArray);
			$('#todoDueDate').val(todoExpectedDueDateArray);
			$('#todoDueTime').val(todoExpectedDueTimeArray);
			
		document.getElementById("recoveryFormID").method='POST';
		document.getElementById("recoveryFormID").action=localStorage.contextPath+"/client/ci/npaloans/"+accountId+"/updateVerifiedInformation";
		document.getElementById("recoveryFormID").submit();
	}
	else if(amountStatus == 1){
		$("#statusId").val(2);
			todoActivityArray = $.grep(todoActivityArray,function(n){return(n);});
			todoExpectedDueDateArray = $.grep(todoExpectedDueDateArray,function(n){return(n);});
			todoExpectedDueTimeArray = $.grep(todoExpectedDueTimeArray,function(n){return(n);});
			$('#todoActivity').val(todoActivityArray);
			$('#todoDueDate').val(todoExpectedDueDateArray);
			$('#todoDueTime').val(todoExpectedDueTimeArray);
			
		document.getElementById("recoveryFormID").method='POST';
		document.getElementById("recoveryFormID").action=localStorage.contextPath+"/client/ci/npaloans/"+accountId+"/updateVerifiedInformation";
		document.getElementById("recoveryFormID").submit();
	}
	else if(capable == 0){
		$("#statusId").val(3);
		if($("#reason").val() == null | $("#reason").val() == 0){
			$("#info").text("Please Select Reasons");
		}
		else if($("#reason").val() == 1 &  $("#otherReasonId").val() == ""){
			$("#info").text("Please Enter Other Reason");
		}
		else if($("#remarksId").val() == ""){
			$("#info").text("Please Enter Remarks For Not Capable");
		}else {
			todoActivityArray = $.grep(todoActivityArray,function(n){return(n);});
			todoExpectedDueDateArray = $.grep(todoExpectedDueDateArray,function(n){return(n);});
			todoExpectedDueTimeArray = $.grep(todoExpectedDueTimeArray,function(n){return(n);});
			$('#todoActivity').val(todoActivityArray);
			$('#todoDueDate').val(todoExpectedDueDateArray);
			$('#todoDueTime').val(todoExpectedDueTimeArray);
			
			document.getElementById("recoveryFormID").method='POST';
			document.getElementById("recoveryFormID").action=localStorage.contextPath+"/client/ci/npaloans/"+accountId+"/updateVerifiedInformation";
			document.getElementById("recoveryFormID").submit();
		}
	}
	else{
		$("#statusId").val(4);
		if($("#reason").val() == null | $("#reason").val() == 0){
			$("#info").text("Please Select Reasons");
		}
		else if($("#reason").val() == 1 &  $("#otherReasonId").val() == ""){
			$("#info").text("Please Enter Other Reason");
		}
		else if($("#percentageId").val() == 0){
			$("#info").text("Please Enter Possible Percentage of repayment");
		}else if($("#approvalDateId").val() == ""){
			$("#info").text("Please Enter Expected Next Repayment Date");
		}else {
			todoActivityArray = $.grep(todoActivityArray,function(n){return(n);});
			todoExpectedDueDateArray = $.grep(todoExpectedDueDateArray,function(n){return(n);});
			todoExpectedDueTimeArray = $.grep(todoExpectedDueTimeArray,function(n){return(n);});
			$('#todoActivity').val(todoActivityArray);
			$('#todoDueDate').val(todoExpectedDueDateArray);
			$('#todoDueTime').val(todoExpectedDueTimeArray);
	
			document.getElementById("recoveryFormID").method='POST';
			document.getElementById("recoveryFormID").action=localStorage.contextPath+"/client/ci/npaloans/"+accountId+"/updateVerifiedInformation";
			document.getElementById("recoveryFormID").submit();
		}
	}
}
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
	document.getElementById("selectedDocId").value=selectedDocLocation;
	document.getElementById("recoveryFormID").method='POST';
	document.getElementById("recoveryFormID").action=localStorage.contextPath+'/client/ci/downloadDocs';
	document.getElementById("recoveryFormID").submit();
}

				