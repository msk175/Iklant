$(document).ready(function() {
    var selectedFromOffice =  $("#fromOfficeValue").val();
    var selectedToOffice =  $("#toOfficeValue").val();
    var selectedFromAccount =  $("#fromAccountValue").val();
    var selectedToAccount =  $("#toAccountValue").val();
    if(selectedFromOffice != "" && selectedToOffice != "" && selectedFromAccount != "" && selectedToAccount != ""){
        fromHierarchyOfficeChange('show_msg');
        $("#fromOfficeId").val(selectedFromOffice).selectmenu("refresh");
        toHierarchyOfficeChange('show_msg');
        $("#toOfficeId").val(selectedToOffice).selectmenu("refresh");
        fromOfficeChange('show_msg');
        $("#fromAccountId").val(selectedFromAccount).selectmenu("refresh");
        toOfficeChange('show_msg');
        $("#toAccountId").val(selectedToAccount).selectmenu("refresh");
    }
});

$("#pageID").live('pageshow',function() {
	//alert($("#roleId").val());
    $("#transactionamountId").focus();

	/*$(function() {    // Paramasivan
		$("#transactionDateId" ).datepicker({ 
			minDate: $("#financialYearStartDateId").val(),
			maxDate: $("#transactionMaxDateId").val(),
			dateFormat: 'dd/mm/yy',
			yearRange: "-90:+0",
  			changeMonth: true,
            changeYear: true,
			onClose: function ()
			{	
				$('#fromOfficeHierarchyDivId').show();				
				$('#toOfficeHierarchyDivId').show();				
			}
        });
	});*/
	$(function() {
		$( "#chequeDateId" ).datepicker({
			minDate: $("#financialYearStartDateId").val(),
			maxDate: new Date,
			dateFormat: 'dd/mm/yy',
			yearRange: "-2:+0",
  			changeMonth: true,
            changeYear: true,
			onClose: function ()    // Paramasivan
			{	
				$('#fromOfficeHierarchyDivId').show();				
				$('#toOfficeHierarchyDivId').show();				
			}
        });
	});

    // Paramasivan
	$("#transactionDateId").click(function(){
		$('#fromOfficeHierarchyDivId').hide();				
		$('#toOfficeHierarchyDivId').hide();
	});
	$("#chequeDateId").click(function(){
		$('#fromOfficeHierarchyDivId').hide();				
		$('#toOfficeHierarchyDivId').hide();
	});
	$("#transactionamountId").keyup(function(){
		 var val = $(this).val();
		if(isNaN(val)){
			 val = val.replace(/[^0-9\.]/g,'');
			 if(val.split('.').length>2) 
				 val =val.replace(/\.+$/,"");
		}
		val = noSpace(val);
		$("#transactionamountId").val(val);
	});
	$("#transactionNotesId").keydown(function(event) {
        // Allow: backspace, delete, tab, escape, and enter
        return event.keyCode == 46 || event.keyCode  == 32 || event.keyCode == 8 || event.keyCode == 9 || event.keyCode == 27 || event.keyCode == 13 || event.keyCode  == 37 || event.keyCode  == 39 ||
             // Allow: Ctrl+A
           (event.keyCode == 65 && event.ctrlKey === true) || event.keyCode == 111 || (!event.shiftKey && event.keyCode == 191) || 
             // Allow: home, end, left, right
           (event.keyCode >= 35 && event.keyCode <= 39) || (event.keyCode >= 48 && event.keyCode <= 57 && !event.shiftKey)
			|| (event.keyCode >= 65 && event.keyCode <= 90) || (event.keyCode >= 96 && event.keyCode <= 105)
    });
	if(aeRoleId == $("#roleId").val()){
		$("#fromOfficeHierarchyId").val(5).selectmenu("refresh");
		$("#toOfficeHierarchyId").val(5).selectmenu("refresh");
		$('#fromOfficeHierarchyId').attr("disabled", true); 
		$('#toOfficeHierarchyId').attr("disabled", true);
        $('#fromOfficeId').attr("disabled", true);
	}
	/*else if(smhRoleId == $("#roleId").val()){
		$("#fromOfficeHierarchyId").val(1).selectmenu("refresh");
		$("#toOfficeHierarchyId").val(1).selectmenu("refresh");
	}*/
	$('#fromOfficeHierarchyId').on('change', function() {
        fromHierarchyOfficeChange('');
	});
	$('#toOfficeHierarchyId').on('change', function() {
         toHierarchyOfficeChange('');
	});
	$('#fromAccountId').on('change', function() {
		$("#successMsg").text("");		
	});
	$('#toOfficeId').on('change', function() {
         toOfficeChange('');
	});
	$('#fromOfficeId').on('change', function() {
         fromOfficeChange('');
	});
});
function contraCashTransfer(){
	var allowedDecimals = parseInt($("#allowedDecimalsId").val(),10);
	var afterDecimalsDigits = 0;
	if($("#transactionamountId").val().indexOf(".") != -1){
		afterDecimalsDigits = $("#transactionamountId").val().split('.')[1].length;
	}
	$("#successMsg").text("");
	$("#errorMsg").text("");
	if($("#fromOfficeHierarchyId").val() == ""){
		$("#errorMsg").text("Please select the Office Hierarchy.");
		$(window).scrollTop(0);
	} 
	else if($("#fromOfficeId").val() == ""){
		$("#errorMsg").text("Please select from Office.");
		$(window).scrollTop(0);
	}else if($("#fromAccountId").val() == ""){
		$("#errorMsg").text("Please select from Account.");
		$(window).scrollTop(0);
	}else if($("#toOfficeHierarchyId").val() == ""){
		$("#errorMsg").text("Please select To Office Hierarchy.");
		$(window).scrollTop(0);
	}else if($("#toOfficeId").val() == ""){
		$("#errorMsg").text("Please select ToOffice.");
		$(window).scrollTop(0);
	}else if($("#toAccountId").val() == ""){
		$("#errorMsg").text("Please select ToAccount.");
		$(window).scrollTop(0);
	}else if($("#fromAccountId").val() == $("#toAccountId").val()){
		$("#errorMsg").text("Please select Different Account.");
		$(window).scrollTop(0);
	}else if($("#transactionDateId").val() == ""){
		$("#errorMsg").text("Please select Transaction Date.");
		$(window).scrollTop(0);
	}else if($("#transactionamountId").val() == ""){
		$("#errorMsg").text("Please Enter Transaction Amount.");
		$(window).scrollTop(0);
	}else if(($("#transactionamountId").val()).indexOf(".") != -1){
        $("#errorMsg").text("Please Enter Transaction Amount without decimal");
        $(window).scrollTop(0);
    }else if($("#transactionamountId").val() == ""){
		$("#errorMsg").text("Please Enter Transaction Amount Greater than zero.");
		$(window).scrollTop(0);
	}else if(afterDecimalsDigits > allowedDecimals){
		$('#errorMsg').text("The Amount is invalid because Only "+allowedDecimals+" digit(s) after decimal separator is allowed ");
	}else if($("#transactionamountId").val().split('.')[0].length > 14){
		$('#errorMsg').text("The Amount is invalid because the number of digits before the decimal separator exceeds the allowed number 14");
		$(window).scrollTop(0);
	}else if(($("#transactionNotesId").val()).trim() == ""){
		$("#errorMsg").text("Please Enter Transaction Notes.");
		$(window).scrollTop(0);
	}else{
        $.mobile.showPageLoadingMsg();
		$("#errorMsg").text("");
		$("#successMsg").text("");
        // Modified by chitra
        $('#fromofficeHierarchy').val($("#fromOfficeHierarchyId").val());
        $('#toofficeHierarchy').val($("#toOfficeHierarchyId").val());
        $('#toOfficeValue').val($("#toOfficeId").val());
        $('#fromOfficeValue').val($("#fromOfficeId").val());
        document.getElementById("accountsMenuFormID").method='POST';
        document.getElementById("accountsMenuFormID").action=localStorage.contextPath+"/accounts/submitCashTransfer";
        document.getElementById("accountsMenuFormID").submit().refresh;
		/*var data ={};
		data.transactionDate 	 =  $("#transactionDateId").val();
		data.transactionType 	 =  $("#transactionTypeId").val();
		data.fromofficeHierarchy =  $("#fromOfficeHierarchyId").val();
		data.fromOffice 		 =  $("#fromOfficeId").val();
		data.fromAccount 		 =  $("#fromAccountId").val();
		data.toofficeHierarchy 	 =  $("#toOfficeHierarchyId").val();
		data.toOffice 			 =  $("#toOfficeId").val();
		data.toAccount 			 =  $("#toAccountId").val();
		data.transactionAmount 	 =  $("#transactionamountId").val();
		data.transactionNotes 	 =  $("#transactionNotesId").val();
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
		url: 'http://'+ajaxcallip+'/mfi/api/1.0/accounts/submitCashTransfer',
		success: function(data) {
			if(data.cashTransfer == "success"){
				showCashTransferForm();
			}else if(data.cashTransfer == "failure"){
				$("#errorMsg").text(data.error);
			}else{
				showPageExpired();
			}
		},
		error : function(jqXHR, textStatus, error) {
			showPageExpired();
		}		
	});*/
		
	}
}

function fromHierarchyOfficeChange(selectedValue){
    if(selectedValue != "show_msg"){
        $("#successMsg").text("");
        $("#errorMsg").text("");
    }
    $("#fromAccountId").val('').selectmenu("refresh");
    document.getElementById('fromAccountId').options.length = 1;
    var selectedOfficeHierarchy = $("#fromOfficeHierarchyId").val();
    var officeIdArray = new Array();
    var officeNameArray= new Array() ;
    if(selectedOfficeHierarchy == 1){
        officeIdArray 	= $("#hoId").val().split(',');
        officeNameArray = $("#hoName").val().split(',');
    }else if(selectedOfficeHierarchy == 2){
        officeIdArray 	= $("#roId").val().split(',');
        officeNameArray = $("#roName").val().split(',');
    }else if(selectedOfficeHierarchy == 3){
        officeIdArray 	= $("#doId").val().split(',');
        officeNameArray = $("#doName").val().split(',');
    }else if(selectedOfficeHierarchy == 4){
        officeIdArray 	= $("#aoId").val().split(',');
        officeNameArray = $("#aoName").val().split(',');
    }else if(selectedOfficeHierarchy == 5){
        officeIdArray 	= $("#boId").val().split(',');
        officeNameArray = $("#boName").val().split(',');
    }
    var lengthCheck = $.grep(officeIdArray,function(n){return(n);});
    $("#fromOfficeId").val('0').selectmenu("refresh");
    document.getElementById('fromOfficeId').options.length = 0;
    var combo1 = document.getElementById("fromOfficeId");
    option = document.createElement("option");
    option.text = "Select";
    option.value ="";
    try {
        combo1.add(option, null); //Standard
    }catch(error) {
        combo1.add(option); // IE only
    }
    if(lengthCheck.length > 0){
        for(var i=0;i<officeIdArray.length;i++){
            //if((officeIdArray[i] == selectedOfficeId) || (officeIdArray[i] == 1)) {
            var combo = document.getElementById("fromOfficeId");
            option = document.createElement("option");
            option.text  =  officeNameArray[i];
            option.value = officeIdArray[i];
            try {
                combo.add(option, null); //Standard
            }catch(error) {
                combo.add(option); // IE only
            }
            //}
        }
    }else{
        $("#errorMsg").text("Selected From office hierarchy does not have office");
    }
}

function toHierarchyOfficeChange(selectedValue){
    if(selectedValue != "show_msg"){
        $("#successMsg").text("");
        $("#errorMsg").text("");
    }
    $("#toAccountId").val('').selectmenu("refresh");
    document.getElementById('toAccountId').options.length = 1;
    var selectedOfficeHierarchy = $("#toOfficeHierarchyId").val();
    var officeIdArray = new Array();
    var officeNameArray= new Array() ;
    if(selectedOfficeHierarchy == 1){
        officeIdArray 	= $("#hoId").val().split(',');
        officeNameArray = $("#hoName").val().split(',');
    }else if(selectedOfficeHierarchy == 2){
        officeIdArray 	= $("#roId").val().split(',');
        officeNameArray = $("#roName").val().split(',');
    }else if(selectedOfficeHierarchy == 3){
        officeIdArray 	= $("#doId").val().split(',');
        officeNameArray = $("#doName").val().split(',');
    }else if(selectedOfficeHierarchy == 4){
        officeIdArray 	= $("#aoId").val().split(',');
        officeNameArray = $("#aoName").val().split(',');
    }else if(selectedOfficeHierarchy == 5){
        officeIdArray 	= $("#boId").val().split(',');
        officeNameArray = $("#boName").val().split(',');
    }
    var lengthCheck = $.grep(officeIdArray,function(n){return(n);});
    $("#toOfficeId").val('0').selectmenu("refresh");
    document.getElementById('toOfficeId').options.length = 0;
    var combo1 = document.getElementById("toOfficeId");
    option = document.createElement("option");
    option.text = "Select";
    option.value ="";
    try {
        combo1.add(option, null); //Standard
    }catch(error) {
        combo1.add(option); // IE only
    }
    if(lengthCheck.length > 0){
        for(var i=0;i<officeIdArray.length;i++){
            //if((officeIdArray[i] == selectedOfficeId) || (officeIdArray[i] == 1)) {
            var combo = document.getElementById("toOfficeId");
            option = document.createElement("option");
            option.text  =  officeNameArray[i];
            option.value = officeIdArray[i];
            try {
                combo.add(option, null); //Standard
            }catch(error) {
                combo.add(option); // IE only
            }
            //}
        }
    }else{
        $("#errorMsg").text("Selected To office hierarchy does not have office");
    }
}

function toOfficeChange(selectedValue){
    if(selectedValue != "show_msg"){
        $("#successMsg").text("");
        $("#errorMsg").text("");
    }
    var selectedOfficeId = $("#toOfficeId").val();
    selectedOfficeId = trimNumber(selectedOfficeId);
    var officeIdArray = $("#glCodeOffice").val().split(',');
    var glCodeIdArray = $("#glcodeId").val().split(',');
    var glCodeNameArray = $("#glCodeName").val().split(',');
    $("#toAccountId").val('0').selectmenu("refresh");
    document.getElementById('toAccountId').options.length = 0;
    var combo1 = document.getElementById("toAccountId");

    option = document.createElement("option");
    option.text = "Select";
    option.value ="";
    try {
        combo1.add(option, null); //Standard
    }catch(error) {
        combo1.add(option); // IE only
    }
    if(selectedOfficeId != ""){
        for(var i=0;i<officeIdArray.length;i++){
            if((officeIdArray[i] == selectedOfficeId) || (officeIdArray[i] == hoId) || selectedOfficeId == hoId) {
                var combo = document.getElementById("toAccountId");
                option = document.createElement("option");
                option.text  =  glCodeNameArray[i];
                option.value = glCodeIdArray[i];
                try {
                    combo.add(option, null); //Standard
                }catch(error) {
                    combo.add(option); // IE only
                }
            }
        }
    }
}


function fromOfficeChange(selectedValue){
    if(selectedValue != "show_msg"){
        $("#successMsg").text("");
        $("#errorMsg").text("");
    }
    var selectedOfficeId = $("#fromOfficeId").val();
    selectedOfficeId = trimNumber(selectedOfficeId);
    var officeIdArray = $("#fromGlCodeOffice").val().split(',');
    var glCodeIdArray = $("#fromGlcodeId").val().split(',');
    var glCodeNameArray = $("#fromGlCodeName").val().split(',');
    $("#fromAccountId").val('').selectmenu("refresh");
    document.getElementById('fromAccountId').options.length = 0;
    var combo1 = document.getElementById("fromAccountId");

    option = document.createElement("option");
    option.text = "Select";
    option.value ="";
    try {
        combo1.add(option, null); //Standard
    }catch(error) {
        combo1.add(option); // IE only
    }
    if(selectedOfficeId != ""){
        for(var i=0;i<officeIdArray.length;i++){
            if((officeIdArray[i] == selectedOfficeId) || selectedOfficeId == hoId) {
                var combo = document.getElementById("fromAccountId");
                option = document.createElement("option");
                option.text  =  glCodeNameArray[i];
                option.value = glCodeIdArray[i];
                try {
                    combo.add(option, null); //Standard
                }catch(error) {
                    combo.add(option); // IE only
                }
            }
        }
    }
}