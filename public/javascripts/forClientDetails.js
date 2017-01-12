$(document).ready(function() {
	$("#remarks").keydown(function(event){
		return ( (event.keyCode == 57 && event.shiftKey) || (event.keyCode == 48 && event.shiftKey) ||(event.keyCode >= 65 && event.keyCode  <= 90) || (event.keyCode == 8 || event.keyCode  == 9 || event.keyCode  == 46 || event.keyCode  == 32 || event.keyCode  == 37 || event.keyCode  == 39 || event.keyCode  == 189) );
	});	
});

function getclientdetails(selectThis){
	value = $(selectThis).val();
	if(value != 0) {
        $.mobile.showPageLoadingMsg();
		document.getElementById("BMFormId").method='POST';
		document.getElementById("BMFormId").action=localStorage.contextPath+"/client/ci/groups/member/fieldverification/"+value+"/memberid";
		document.getElementById("BMFormId").submit();
	}
}

function submitform(){
	var value = $('#members').val();
	var addmatched = $("#addressmatchedCheck").is(':checked');
	var rcnumbermatched = $("#rcnumbermatched").is(':checked');
	var phonenumbercheck =  $("#phonenumbercheck").is(':checked') ;
	var identityproof = $("#idproofcheck").is(':checked') ;
	var guarantoraddressmatchedCheck = $("#guarantoraddressmatchedCheck").is(':checked') ;
	var guarantoridproofcheck = $("#guarantoridproofcheck").is(':checked') ;
	var guarantorrelationship = $("#guarantorrelationshipCheck").is(':checked') ;
	
	var House =  document.getElementById("house").value;
	var HiddenVehicle =  document.getElementById("hiddenVehicle").value;
	
	var houseroomDetails = new Array();
	
	if($("#hall").is(':checked') == true){      
		houseroomDetails.push($("#hallID").text());
	}
	if($("#kitchen").is(':checked')==true){
		houseroomDetails.push($("#kitchenID").text());
	}
	if($("#1room").is(':checked')==true){
		houseroomDetails.push($("#1roomID").text());
	}
	if($("#2rooms").is(':checked')==true){
		houseroomDetails.push($("#2roomsID").text());
	}
	if($("#3rooms").is(':checked')==true){
		houseroomDetails.push($("#3roomsID").text());
	}
	$("#hiddenHouseroom").val(houseroomDetails);
	
	var vehicleDetails = new Array();
	
	if($("#bicycle").is(':checked') == true){      
		vehicleDetails.push($("#bicycleID").text());
	}
	if($("#scooter").is(':checked')==true){
		vehicleDetails.push($("#scooterID").text());
	}
	if($("#moped").is(':checked')==true){
		vehicleDetails.push($("#mopedID").text());
	}
	if($("#bike").is(':checked')==true){
		vehicleDetails.push($("#bikeID").text());
	}
	if($("#car").is(':checked')==true){
		vehicleDetails.push($("#carID").text());
	}
	if($("#others").is(':checked')==true){
		vehicleDetails.push($("#othersID").text());
	}
	$("#hiddenVehicle").val(vehicleDetails);
	
	if(value == 0){
			$("#errorField").text("Please Select Member Name To Submit Verified Details");
			$(window).scrollTop(0);
	}
	else if (House == '0'  & HiddenVehicle == ""){
		$("#errorField").text("Please Fill House and Vehicle Details");
		$(window).scrollTop(0);
	}
	else if(($("#proof").val()==0 & addmatched) | ($("#idproof").val()==0 & identityproof) |
			 ($("#guarantoraddprooff").val()==0 & guarantoraddressmatchedCheck) | ($("#idguarantorproof").val()==0 & guarantoridproofcheck) ) {
			$("#errorField").text("Please select Proof from dropdown");
			$(window).scrollTop(0);
	}
	
	else{
		var status = "FieldVerification Failed and Client Rejected for";
		if(addmatched & rcnumbermatched & phonenumbercheck & identityproof & guarantoraddressmatchedCheck & guarantoridproofcheck & guarantorrelationship  ) {
			status = "FieldVerification Completed For this client";
		}
		if(!addmatched) {
			status += "\n   -Address not matched";
		}
		if(!rcnumbermatched) {
			status += "\n   -RationCard Number not matched";
		}
		if(!phonenumbercheck) {
			status += "\n   -Phone Number not matched";
		}
		if(!identityproof) {
			status += "\n   -ID Proof not matched";
		}
		if(!guarantoraddressmatchedCheck) {
			status += "\n   -Guarantor Address not matched";
		}
		if(!guarantoridproofcheck) {
			status += "\n   -Guarantor ID Proof not matched";
		}
		if(!guarantorrelationship) {
			status += "\n   -Guarantor Relationship not matched";
		}
	
		var r = confirm(status);
		if (r == true) {
            $.mobile.showPageLoadingMsg();
			document.getElementById("BMFormId").method='POST';
			document.getElementById("BMFormId").action=localStorage.contextPath+"/client/ci/groups/member/fieldverification/insert";
			document.getElementById("BMFormId").submit();
		}
		else{
		
		}
	}
} 
function clarificationform(){
	
	var value = $('#members').val();
	if(value == 0){
		alert("Please Select Member Name To Submit Verified Details");
	}
	else if($("#remarks").val()==""){
			$("#errorField").text("Remarks are Mandatory If Client Need More Information");
			$(window).scrollTop(0);
	}
	else {
	alert("Due To Need More Information Client Moved To Preliminary Verified Status");
        $.mobile.showPageLoadingMsg();
		document.getElementById("BMFormId").method='POST';
		document.getElementById("BMFormId").action=localStorage.contextPath+"/client/ci/groups/member/fieldverification/"+value+"/clarification";
		document.getElementById("BMFormId").submit();
	}
}
function houseTypeOnchange(){
	if($("#house").val() == ownHouse){
		$("#timePeriod").val("");
		$("#timePeriodLabelId").hide();
		$("#timePeriod").hide();
	}
	else if($("#house").val() == rentalHouse | $("#house").val() == leaseHouse){
		$("#timePeriod").val("");
		$("#timePeriodLabelId").show();
		$("#timePeriod").show();
	}
}

function cancelFV() {
    $.mobile.showPageLoadingMsg();
    document.getElementById("BMFormId").method='POST';
    document.getElementById("BMFormId").action=localStorage.contextPath+"/client/ci/groups/operation/"+fieldVerificationOperationId+"";
    document.getElementById("BMFormId").submit();
}
