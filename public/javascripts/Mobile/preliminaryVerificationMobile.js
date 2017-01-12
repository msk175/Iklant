var inc=0;
var noOfClients=0;
var hiddenclientname = new Array();
var hiddenoverdue = new Array();
var currentValue=1;
$(document).ready(function() {
	
    $(function() {
		$( "#lastActiveDate" ).datepicker({
			minDate: $("#createdDatePicker").val(),
			maxDate: new Date,
			dateFormat: 'dd/mm/yy',
			yearRange: "-90:+0",
  			changeMonth: true,
            changeYear: true
        });
		$('#previous').hide();
		$('#field2').hide();
		$('#field3').hide();
		$('#field4').hide();
		$('#field5').hide();
		$('#field6').hide();
		$('#field7').hide();
		$('#field8').hide();
		$('#field9').hide();
		$('#field10').hide();
		$('#field11').hide();
		$('#field12').hide();
		$('#field13').hide();
		$("#header").text("Group Details");
});
    $(function() {
		$( "#accountCreatedDate" ).datepicker({
			minDate: $("#createdDatePicker").val(),
			maxDate: new Date,
			dateFormat: 'dd/mm/yy',
			yearRange: "-90:+0",
  			changeMonth: true,
            changeYear: true
        });
});
		$("#isMultipleImageID").click(function(){
			
			if($("#isMultipleImageID").is(':checked')==true){
				$("#isMultipleDocumentId").val($(this).is(':checked'));
				$('#multipleUploadDocumentId').toggle();
				$('#singleUploadDocumentId').hide();
				$('#singleUploadDocumentId').val("");
			}
			else if($("#isMultipleImageID").is(':checked')==false){
				$("#isMultipleDocumentId").val($(this).is(':checked'));
				$('#multipleUploadDocumentId').hide();
				$('#singleUploadDocumentId').toggle();
				$('#multipleUploadDocumentId').val("");
			}
			
		});

$('#captureImageId').click(function() {	
	$('#BMFormId').attr('method', 'POST'); 
	$('#BMFormId').attr('action', localStorage.contextPath+'/client/ci/groups/preVerificationUpload/'+$("#groupIdID").val()+'/preVerificationUpload') ;
	$('#BMFormId').submit().refresh();
});
	
	$('#bankDetails').hide();
	$('#bankAccountCheck').click(function(){
		
		$('#bankDetails').toggle();
	})
	$('#internalLoanDetails').hide();
	$('#anyInternalLoansCheck').click(function(){
	
		$('#internalLoanDetails').toggle();
	})
	

	//To set check box values
	$("#savingsdiscussedCheck").click(function(){
		
		$("#savingsDiscussed").val($(this).is(':checked'));
		
	});
	$("#completeAttendanceCheck").click(function(){
	   $("#completeAttendance").val($(this).is(':checked'));
	});
	$("#bankAccountCheck").click(function(){
		$("#bankAccountHidden").val($(this).is(':checked'));
	
	});
	$("#anyInternalLoansCheck").click(function(){
		$("#anyInternalLoansHidden").val($(this).is(':checked'));
	});
	
	
	$("#accountNumber").keydown(function(event) {
	// Allow: backspace, delete, tab, escape, and enter
		if ( event.keyCode == 46 || event.keyCode == 8 || event.keyCode == 9 || event.keyCode == 27 || event.keyCode == 13 || 
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
	
	$('#creditTransaction').keyup( function() {
		var $this = $(this);
		if($this.val().length > 3)
		$this.val($this.val().substr(0, 3));
	});
	
	$("#creditTransaction").keydown(function(event) {
		return (event.keyCode >= 48 && event.keyCode <= 57 && !event.shiftKey) 
		|| (event.keyCode >= 96 && event.keyCode <= 105) || event.keyCode == 46 || event.keyCode == 8 || 
		event.keyCode == 9 || event.keyCode == 27 || event.keyCode == 13 || (event.keyCode >= 35 && event.keyCode <= 39);
	});
	
	$('#debitTransaction').keyup( function() {
		var $this = $(this);
		if($this.val().length > 3)
		$this.val($this.val().substr(0, 3));
	});
	
	$("#debitTransaction").keydown(function(event) {
		return (event.keyCode >= 48 && event.keyCode <= 57 && !event.shiftKey) 
		|| (event.keyCode >= 96 && event.keyCode <= 105) || event.keyCode == 46 || event.keyCode == 8 || 
		event.keyCode == 9 || event.keyCode == 27 || event.keyCode == 13 || (event.keyCode >= 35 && event.keyCode <= 39);
	});
	
	//Default Value for Check Box
	$("#over").val($("#overdueCheck").is(':checked'));
	
	$("#overdueCheck").click(function(){
		$("#over").val($(this).is(':checked'));
	});
	
	$("#saveClient").click(function(){
		var status ="No overdue";
		var clientName=$("#clientName option:selected").text();
		if($("#clientName").val()!=''){
			if($("#over").val() == "true"){
				status = "Overdue";
			}
			else if($("#over").val()=="false"){
				status = "No overdue";
			}
			if(clientName != "Select") {
				var newContent = '<div data-role="content" data-theme="a" class="content-primary">';
				newContent += '<ul data-role="listview" data-split-theme="a" data-inset="true" id="ulId">';
				newContent += '<li>';
				newContent += '<a href="">';
				newContent += "<label for='NewClientName'"+inc+" id='clientNameID"+inc+"'>"+clientName+"</label>";
				newContent += '<h5>'+status+'</h5>';
				newContent += '<a href="", onclick="removeClient(this,'+inc+')" , data-icon="delete">';
				newContent += '</a>';
				newContent += '</a>';
				newContent += '</li>';
				newContent += '</ul>';
				newContent += '</div>';
				$("#addClientDivId").append(newContent).trigger('create'); 
				inc++;
				noOfClients++;
				hiddenclientname.push($('#clientName').val());
				hiddenoverdue.push($('#over').val());
				$('#clientNamesId').val(hiddenclientname);
				$('#overduesId').val(hiddenoverdue);
				//alert(hiddenclientname);
				//$('#overdueCheck').attr("checked", "false");
				var alerts = clientName + " has " + status+ ".Hence Client Will be Rejected" ;
				if($("#over").val() == "true"){
					//$('#errorFieldInternalLoan').text(alerts);
					alert(alerts);
				}
				else{
					$('#errorFieldInternalLoan').text('');
				}	
			}
			else {
				//$("#overdueCheck").removeAttr("checked").checkboxradio('refresh');
			}
		}	
	});
	
	$("#internalLoanAdd").click(function(){
		/*$("#overdueCheck").removeAttr("checked").checkboxradio('refresh');*/
		$("#clientName").val('0').selectmenu("refresh");

	});
	$("#bankNameSelect").keydown(function(event){
		return ( (event.keyCode == 57 && event.shiftKey) || (event.keyCode == 48 && event.shiftKey) ||(event.keyCode >= 65 && event.keyCode  <= 90) || (event.keyCode == 8 || event.keyCode  == 9 || event.keyCode  == 32 || event.keyCode  == 37 || event.keyCode  == 39 || event.keyCode  == 46 || event.keyCode  == 189) );
	   
	});
$("#saveGroupId").click(function(){

		if($("#lastActiveDate").val()==""){
			if($("#bankAccountHidden").val()=="true"){
				if($("#accountNumber").val()==""|$("#accountCreatedDate").val()==""|$("#bankNameSelect").val()==""){
					$("#errorField").text("Please fill Minutes and Bank Account verification Fields");
					$(window).scrollTop(0);
				}
				else{
					if($("#anyInternalLoansHidden").val()=="true"){
						if(noOfClients==0){
							$("#errorField").text("No client Selected for Internal Loan");
							$(window).scrollTop(0);
						}
						else{
							preliminaryVerificationFormSubmission();
						}	
					}else{
						preliminaryVerificationFormSubmission();
					}
										
				}
			}
			else{
				
				$("#errorField").text("Please fill Minutes verification Fields");
				$(window).scrollTop(0);
			}
		}
		else{
			if($("#bankAccountHidden").val()=="true"){
				if($("#accountNumber").val()==""|$("#accountCreatedDate").val()==""|$("#bankNameSelect").val()==""){
					$("#errorField").text("Please fill Bank Account verification Fields");
					$(window).scrollTop(0);
				}
				else{
					if($("#anyInternalLoansHidden").val()=="true"){
						if(noOfClients==0){
							$("#errorField").text("No client Selected for Internal Loan");
							$(window).scrollTop(0);
						}
						else{
							preliminaryVerificationFormSubmission();
						}
					}else{
						preliminaryVerificationFormSubmission();
					}					
				}
			}
			else{
				if($("#anyInternalLoansHidden").val()=="true"){
					if(noOfClients==0){
						$("#errorField").text("No client Selected for Internal Loan");
						$(window).scrollTop(0);
					}
					else{
						preliminaryVerificationFormSubmission();
					}
				}
				else{
					preliminaryVerificationFormSubmission();
				}
			}
		}

	});
$("#lastActiveDate").keypress(function(e){ e.preventDefault(); });
$("#accountCreatedDate").keypress(function(e){ e.preventDefault(); });
$("#uploadImageId").click(function(){
	var docTypeId=$('#documentTypeId option:selected').val();
	var multipleFileUpload=$("#multipleUploadDocumentId").val();
	var singleFileUpload=$("#singleUploadDocumentId").val();
	if(docTypeId!=0){
		if(multipleFileUpload.length!=0 | singleFileUpload.length!=0){
			if($('#multipleUploadDocumentId').get(0).files.length==1){
				$("#errorField").text("Uncheck Multiple images to upload single image");
				$(window).scrollTop(0);
			}else{
				$('#BMFormId').attr('method', 'POST'); 
				$('#BMFormId').attr('action', localStorage.contextPath+'/client/ci/groups/'+ $("#groupIdID").val()+'/preVerificationDocumentUpload') ;
				$('#BMFormId').submit();
			}
		}else{
			$("#errorField").text("Please browse a file to upload");
			$(window).scrollTop(0);
		}
	}else{
		$("#errorField").text("Select Document Type");
		$(window).scrollTop(0);
	}
});
	$('#next').click(function(){
		$('#field'+currentValue).hide();
		if(currentValue==4){
			$("#header").text("Bank Account Verification");
		}
		if(currentValue==10){
			$("#header").text("Internal Loan Verification");
		}
		if(currentValue==12){
			$("#header").text("Preliminary Verification Submit");
		}
		if(currentValue==5){
			
			if($("#bankAccountHidden").val()=="false"){
				$("#header").text("Preliminary Verification Submit");
				currentValue = 12; 
			}
		}
		if(currentValue==10){
			
				$("#header").text("Preliminary Verification Submit");
				currentValue = 12; 
		}
		if(currentValue==11){
		
			if($("#anyInternalLoansHidden").val()=="false"){
				$("#header").text("Preliminary Verification Submit");
				currentValue = 12; 
			}
		}
		if(currentValue==2){
			if($("#lastActiveDate").val()==""){
				$('#field'+currentValue).show();
				$("#errorField").text("Please Fill Last Active From Date");
				
			}
			else {
				$("#errorField").text("");
				currentValue++;
				$('#field'+currentValue).show();
			}
		}
		else if(currentValue==6){
			if($("#bankNameSelect").val()==""){
					$('#field'+currentValue).show();
					$("#errorField").text("Please Fill Bank Name");
					
			}
			else {
				$("#errorField").text("");
				currentValue++;
				$('#field'+currentValue).show();
			}
		}
		else if(currentValue==7){
			if($("#accountNumber").val()==""){
					$('#field'+currentValue).show();
					$("#errorField").text("Please fill Bank Account Number");
					
			}
			else {
				$("#errorField").text("");
				currentValue++;
				$('#field'+currentValue).show();
			}
		}
		else if(currentValue==8){
			if($("#accountCreatedDate").val()==""){
					$('#field'+currentValue).show();
					$("#errorField").text("Please fill Bank Account Created Date");
					
			}
			else {
				$("#errorField").text("");
				currentValue++;
				$('#field'+currentValue).show();
			}
		}
		else if(currentValue==12){
			if($("#anyInternalLoansHidden").val()=="true"){
				if(noOfClients==0){
					$('#field'+currentValue).show();
					$("#errorField").text("No client Selected for Internal Loan");
					
				}
			else {
				$("#errorField").text("");
				currentValue++;
				$('#field'+currentValue).show();
			}
				
			}else{
				$("#errorField").text("");
				currentValue++;
				$('#field'+currentValue).show();
			
			}
		
		}
		else {
			$("#errorField").text("");
			currentValue++;
			$('#field'+currentValue).show();
		
		}
		if(currentValue==1){
			$('#previous').hide(); 
		}
		else {
			//$('#header').text = "Minutes Verification Detail";
			$('#previous').show();
		}
		
		if(currentValue==13){
			$('#next').hide(); 
		}
		else {
			$('#next').show();
		}
	
		
	});
	$('#previous').click(function(){
		
		$('#field'+currentValue).hide();
		if(currentValue==13){
			$("#header").text("Bank Account Verification");
			$("#errorField").text("");
			if($("#bankAccountHidden").val()=="false"){
				currentValue = 5; 
				$('#field'+currentValue).show();
			}	else{
				$("#errorField").text("");
				currentValue = 10; 
				currentValue--;
				$('#field'+currentValue).show();
				}
		}
		/*else if(currentValue==13){
			$("#header").text("Internal Loan Verification");
			$("#errorField").text("");
			if($("#anyInternalLoansHidden").val()=="false"){
				currentValue = 12; 
			}	else{
				$("#errorField").text("");
				currentValue--;
				$('#field'+currentValue).show();
			}
		}*/
		else{
		$("#errorField").text("");
		currentValue--;
		$('#field'+currentValue).show();
		}
		if(currentValue<13){
			$('#next').show(); 
		}
		else {
			$('#next').hide();
		}
		if(currentValue==1){
			$('#previous').hide(); 
		}
		else {
			$('#previous').show();
		}

	});
});
function removeClient(remove,i){
	r=remove.parentNode.parentNode;
	r.parentNode.removeChild(r);
	hiddenclientname[i]="";
	hiddenoverdue[i]="";
	noOfClients--;
	$('#clientNamesId').val(hiddenclientname);
	$('#overduesId').val(hiddenoverdue);
}

function preliminaryVerificationFormSubmission(){

	hiddenclientname = $.grep(hiddenclientname,function(n){return(n);});
	hiddenoverdue = $.grep(hiddenoverdue,function(n){return(n);});
	$('#clientNamesId').val(hiddenclientname);
	$('#overduesId').val(hiddenoverdue);

	$('#BMFormId').attr('method', 'POST'); 
	$('#BMFormId').attr('action', localStorage.contextPath+'/client/ci/groups/'+$("#groupIdID").val()+'/verifyGroup') ;
	$('#BMFormId').submit();
}