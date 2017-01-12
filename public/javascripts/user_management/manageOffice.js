$(document).ready(function() {
	$("#addODiv").hide();
	$("#editODiv").hide();
	$("#addOId").click(function(){
		$("#editODiv").hide();
		$("#addOId").hide();
		$("#addODiv").show();
		$("#tableviewdiv").hide();
        $("#errorMessageId").text("");
	});
	$("#backOId").click(function(){
		$("#editODiv").hide();
		$("#addOId").show();
		$("#addODiv").hide();
		$("#tableviewdiv").show();
		$("#errorMessageIdManageOffice").text("");
        $("#errorMessageId").text("");
	});
	$("#backOEId").click(function(){
		$("#editODiv").hide();
		$("#addOId").show();
		$("#addODiv").hide();
		$("#tableviewdiv").show();
		$("#errorMessageIdManageOffice").text("");
        $("#errorMessageId").text("");
	});
	$("#editOId").click(function(){
		$("#addODiv").hide();
		$("#editODiv").show();
        $("#errorMessageId").text("");
	});
    $("#officeNameId").focusout(function(){
        var officeNameArray = $("#officeNameArray").val().split(",");
        var enteredOfficeName = $("#officeNameId").val().toLowerCase();
        var trimmedString = $.trim(enteredOfficeName);
        for(var i = 0; i < officeNameArray.length; i++) {
            officeNameArray[i] = officeNameArray[i].toLowerCase();
        }
        if(($.inArray(trimmedString, officeNameArray)) != -1) {
            $("#errorMessageIdManageOffice").text("Office already Exists");
            $("#officeNameId").focus();
            $(window).scrollTop(0);
        }else{
            $("#errorMessageIdManageOffice").text("");
            $(window).scrollTop(0);
        }
    });
	$("#officeNameId").keydown(function(event){
		return ( (event.keyCode >= 65 && event.keyCode  <= 90) || (event.keyCode == 8 || event.keyCode  == 9 || event.keyCode  == 32 || event.keyCode  == 37 || event.keyCode  == 39 || event.keyCode  == 46) );
	});
	
	$("#officeNameIdEdit").keydown(function(event){
		return ( (event.keyCode >= 65 && event.keyCode  <= 90) || (event.keyCode == 8 || event.keyCode  == 9 || event.keyCode  == 32 || event.keyCode  == 37 || event.keyCode  == 39 || event.keyCode  == 46) );
	});

	$("#officeShortNameId").keydown(function(event){
		return ( (event.keyCode >= 65 && event.keyCode  <= 90) || (event.keyCode == 8 || event.keyCode  == 9 || event.keyCode  == 32 || event.keyCode  == 37 || event.keyCode  == 39 || event.keyCode  == 46) );
	});

	$("#officeShortNameEditId").keydown(function(event){
		return ( (event.keyCode >= 65 && event.keyCode  <= 90) || (event.keyCode == 8 || event.keyCode  == 9 || event.keyCode  == 32 || event.keyCode  == 37 || event.keyCode  == 39 || event.keyCode  == 46) );
	});
	
	$("#officeAddressId").keydown(function(event) {
		if((!event.shiftKey && event.keyCode == 222) || event.keyCode == 220) {
			return false; 
		}
	});
	
	$("#officeAddressIdEdit").keydown(function(event) {
		if((!event.shiftKey && event.keyCode == 222) || event.keyCode == 220) {
			return false; 
		}
	});
});
function manageOfficeSubmitForm() {
	if($('#officeNameId').val() != "" & $('#officeAddressId').val() != "" & $('#officeShortNameId').val() != "") {
        if($('#officeShortNameId').val().length <= 4 && $('#stateId').val() != 0){
            $.mobile.showPageLoadingMsg();
            document.getElementById("BMFormId").method='POST';
            document.getElementById("BMFormId").action=localStorage.contextPath+"/client/ci/saveoffice";
            document.getElementById("BMFormId").submit();
		    //alert("Office Created Successfully!");
        }
        else if($('#stateId').val() == 0){
            $("#errorMessageIdManageOffice").text("Please select State");
        }
        else{
            $("#errorMessageIdManageOffice").text("Office short name should not exceeds more than 4 characters");
        }
	}
	else {
		$("#errorMessageIdManageOffice").text("Fields Should not be empty");
	}
}

function populateOfficeDetails(officeEditId) {
	var officeId = officeEditId;
	$("#editODiv").show();
	$("#tableviewdiv").hide();
	if(officeId != 0) {
		var data = {};
		data.officeId = officeId;
		
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
			url: 'http://'+ajaxcallip+localStorage.contextPath+'/client/ci/populateofficedetails',						
			success: function(data) {
				document.getElementById("officeIdEdit").value = data.officeId;
				document.getElementById("officeNameIdEdit").value = data.officeName;
				document.getElementById("officeShortNameEditId").value = data.officeShortName;
				document.getElementById("officeAddressIdEdit").value = data.officeAddress;
                $("#stateNameIdEdit").val(data.stateName);
			},
		});
	} else if(officeId == 0) {

	}
}

function manageUpdateOffice() {
	if($('#officeNameIdEdit').val() != "" & $('#officeAddressIdEdit').val() != "" & $('#officeIdEdit').val() != 0 & $('#officeShortNameEditId').val() != "") {
        $.mobile.showPageLoadingMsg();
		document.getElementById("BMFormId").method='POST';
		document.getElementById("BMFormId").action=localStorage.contextPath+"/client/ci/updateoffice";
		document.getElementById("BMFormId").submit();
		//alert("Office Updated Successfully!");
	}
	else {	
		$("#errorMessageIdManageOffice").text("Fields Should not be empty");
	}
}
function resetFields() {
	$("#officeNameId").val("");
	$("#officeAddressId").val("");
	$("#officeShortNameId").val("");
	$("#errorMessageIdManageOffice").text("");
    $("#stateId").val('0').selectmenu("refresh");
}

function deleteOffice(officeid) {
        $.mobile.showPageLoadingMsg();
		document.getElementById("BMFormId").method='POST';
		document.getElementById("BMFormId").action=localStorage.contextPath+"/client/ci/"+officeid+"/deleteoffice";
		document.getElementById("BMFormId").submit();
		alert("Office Deleted Successfully!");
}

/*function deleteOffice(officeid) {
	if(officeid != 0) {
		var data = {};
		data.officeid = officeid;		
		ajaxVariable = $.ajax({
			type: 'POST',
			data: JSON.stringify(data),
			contentType: 'application/json',
			url: 'http://'+ajaxcallip+localStorage.contextPath+'/client/ci/checkForRoleIsAssigned',						
			success: function(data) {
				if(data.noOfUsers == 0) {
					document.getElementById("BMFormId").method='POST';
					document.getElementById("BMFormId").action=localStorage.contextPath+"/client/ci/"+officeid+"/deleteoffice";
					document.getElementById("BMFormId").submit();
					alert("Role Deleted Successfully!");
				} else {
					alert("Role cannot be deleted as it is assigned to "+data.noOfUsers+" users");
				}
			},
		});
	}
}*/
function stateChange(){
    var element = document.getElementById("stateId");
    $('#stateNameId').val(element.options[element.selectedIndex].text);
}
