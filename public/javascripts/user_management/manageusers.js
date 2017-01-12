$(document).ready(function() {
	$(function() {
		$( "#dobId" ).datepicker({
			maxDate: new Date,
			dateFormat: 'dd-mm-yy',
			yearRange: "-90:+0",
  			changeMonth: true,
            changeYear: true,
			onClose: function()
			{
				//$('#officeHierarchyDivId').show();
				//$('#debitAccountHeadDivId').show();
				// The "this" keyword refers to the input (in this case: #someinput)
				//this.focus();
			}
        });
	});
	$(function() {
		$( "#dobIdEdit" ).datepicker({
			maxDate: new Date,
			dateFormat: 'dd-mm-yy',
			yearRange: "-90:+0",
  			changeMonth: true,
            changeYear: true,
			onClose: function()
			{
				//$('#officeHierarchyDivId').show();
				//$('#debitAccountHeadDivId').show();
				// The "this" keyword refers to the input (in this case: #someinput)
				//this.focus();
			}
        });
	});
	//Number length Validation
	$("#addUDiv").hide();
	$("#editUDiv").hide();

	$("#addUId").click(function(){
        $("#editUDiv").hide();
		$("#tableviewdiv").hide();
		$("#addUDiv").show();
		$("#addUId").hide();
        $("p").text("");
	});
	$("#backUId").click(function(){
        $("#editUDiv").hide();
		$("#tableviewdiv").show();
		$("#addUDiv").hide();
		$("#addUId").show();
		$("p").text("");
	});
	$("#backUEId").click(function(){
		$("#editUDiv").hide();
		$("#tableviewdiv").show();
		$("#addUDiv").hide();
		$("#addUId").show();
		$("p").text("");
	});
	
	$("#editUId").click(function(){
        $("#addUDiv").hide();
		$("#tableviewdiv").hide();
		$("#editUDiv").show();
        $("p").text("");
	});
	$("#userNameId").focusout(function(){
		var userNameArray = $("#userNameArrayId").val().split(",");
		var enteredUserName = $("#userNameId").val().toLowerCase();
		var trimmedString = $.trim(enteredUserName);
		for(var i = 0; i < userNameArray.length; i++) {
			userNameArray[i] = userNameArray[i].toLowerCase();
		}
		if(($.inArray(trimmedString, userNameArray)) != -1) {
			$("#errorMessageId").text("User Name already Exists");
			$("#userNameId").focus();
			$(window).scrollTop(0);
		}else{
			$("p").text("");
			$(window).scrollTop(0);
		}
		if(/\s/g.test(enteredUserName)){
			$("#errorMessageId").text("Please do not include spaces in the user name.");
			$("#userNameId").focus();
			$(window).scrollTop(0);
		}
	});
    /*$("#imeiNumberIdID").focusout(function(){
        var idIMEI = "#"+this.id;
        var imeiNumberArray = $("#imeiNumberArrayId").val().split(",");
        var enteredIMEInumber = $(idIMEI).val();
        console.log(enteredIMEInumber);
        var trimmedString = $.trim(enteredIMEInumber);
        if(enteredIMEInumber == '' || enteredIMEInumber == null){
            $("#errorMessageId").text("Please enter the IMEI number.");
            $(idIMEI).focus();
            $(window).scrollTop(0);
        } else if(($.inArray(trimmedString, imeiNumberArray)) != -1) {
            $("#errorMessageId").text("IMEI number already Exists");
            $(idIMEI).focus();
            $(window).scrollTop(0);
        }else{
            $("p").text("");
            $(window).scrollTop(0);
        }
    });
*/
    $('#userNameId').keyup(function(){
        this.value = this.value.toLowerCase();
    });

    /*$("#imeiNumberIdIDEdit").focusout(function(){
        var idIMEI = "#"+this.id;
        var imeiNumbers = $("#imeiNumberArrayId").val().split(",");
        var enteredIMEInumber = $(idIMEI).val();
        var trimmedString = $.trim(enteredIMEInumber);
        var imeiNumberArray = jQuery.grep(imeiNumbers, function(value) {
            return value != $('#imeiNumberIdIDEditHidden').val();
        });
        if(enteredIMEInumber == '' || enteredIMEInumber == null){
            $("#errorMessageId").text("Please enter the IMEI number.");
            $(idIMEI).focus();
            $(window).scrollTop(0);
        } else if(($.inArray(trimmedString, imeiNumberArray)) != -1) {
            $("#errorMessageId").text("IMEI number already Exists");
            $(idIMEI).focus();
            $(window).scrollTop(0);
        }else{
            $("p").text("");
            $(window).scrollTop(0);
        }
    });*/
	$("#userNameId").keydown(function(event){
		return ((!event.shiftKey && (event.keyCode == 190)) || (event.keyCode >= 65 && event.keyCode  <= 90) || (event.keyCode == 8 || event.keyCode  == 9 || event.keyCode  == 32 || event.keyCode  == 37 || event.keyCode  == 39 || event.keyCode  == 46 ) );
	});
	
	$("#lastNameId").keydown(function(event){
		return ((!event.shiftKey && (event.keyCode == 190)) || (event.keyCode >= 65 && event.keyCode  <= 90) || (event.keyCode == 8 || event.keyCode  == 9 || event.keyCode  == 32 || event.keyCode  == 37 || event.keyCode  == 39 || event.keyCode  == 46 ) );
	});
	
	$("#userNameIdEdit").keydown(function(event){
		return ( (!event.shiftKey && (event.keyCode == 190)) || (event.keyCode >= 65 && event.keyCode  <= 90) || (event.keyCode == 8 || event.keyCode  == 9 || event.keyCode  == 32 || event.keyCode  == 37 || event.keyCode  == 39 || event.keyCode  == 46) );
	});
	$("#emailIdID").keydown(function(event){
		return ( (!event.shiftKey && (event.keyCode == 190)) ||(event.keyCode == 50 && event.shiftKey) ||(event.keyCode >= 65 && event.keyCode  <= 90) || (event.keyCode >= 48 && event.keyCode  <= 57) || (event.keyCode >= 96 && event.keyCode  <= 105)|| (event.shiftKey && (event.keyCode == 189)) || (event.keyCode == 8 || event.keyCode  == 46  || event.keyCode  == 9 || event.keyCode  == 37 || event.keyCode  == 39 || event.keyCode  == 32) );
	 
	});
	$("#emailIdIDEdit").keydown(function(event){
		return ( (!event.shiftKey && (event.keyCode == 190)) ||(event.keyCode == 50 && event.shiftKey) ||(event.keyCode >= 65 && event.keyCode  <= 90) || (event.keyCode >= 48 && event.keyCode  <= 57) || (event.keyCode >= 96 && event.keyCode  <= 105)|| (event.shiftKey && (event.keyCode == 189)) || (event.keyCode == 8 || event.keyCode  == 46 || event.keyCode  == 9 || event.keyCode  == 37 || event.keyCode  == 39 || event.keyCode  == 32) );
	 
	});
	/*$("#imeiNumberIdID").keydown(function(event){
		return ( (!event.shiftKey && (event.keyCode == 190)) ||(event.keyCode == 50 && event.shiftKey) ||(event.keyCode >= 65 && event.keyCode  <= 90) || (event.keyCode >= 48 && event.keyCode  <= 57) || (event.keyCode >= 96 && event.keyCode  <= 105)|| (event.shiftKey && (event.keyCode == 189)) || (event.keyCode == 8 || event.keyCode  == 46 || event.keyCode  == 9 || event.keyCode  == 37 || event.keyCode  == 39 || event.keyCode  == 32) );

	});*/

	$('#contactNumberId').keyup( function() {
	var $this = $(this);
	if($this.val().length > 10)
		$this.val($this.val().substr(0, 10));			
	});
	
	//Alphabets restriction code
	$("#contactNumberId").keydown(function(event) {
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
		
	$('#contactNumberIdEdit').keyup( function() {
	var $this = $(this);
	if($this.val().length > 10)
		$this.val($this.val().substr(0, 10));			
	});
	
	$("#contactNumberIdEdit").keydown(function(event) {
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
    // dhinakaran
    function forNumbers(currentVal){
        var regex = /[^0-9]+/g;
        if(regex.test(currentVal.value)) {
            currentVal.value = (currentVal.value.replace(regex, '')).trim();
        }
    }
    /*$('#imeiNumberIdID').keyup(function() {
        //alert($("#branchName option:selected").text());
        alert("keydown : ");
    });*/

    //dhinakaran
    /*$('#roleId').change(function() {
        //alert($("#branchName option:selected").text());
        var role=$("#roleId option:selected").val();
      //  alert("role : "+role);
        if((role == bdeRoleId || role == foRoleId)){
            $("#imeiDivId").show();
        }
        else {
            $("#imeiDivId").hide();
        }
    });*/

    /*$('#roleIdEdit').change(function() {
        //alert($("#branchName option:selected").text());
        var role=$("#roleIdEdit option:selected").val();
        //  alert("role : "+role);
        if((role == bdeRoleId || role == foRoleId)){
            $("#imeiEditDivId").show();
        }
        else {
            $("#imeiEditDivId").hide();
        }
    });*/

    $("#yesUserDeleteId").click(function(){
        $(window).scrollTop(0);
        document.getElementById("BMFormId").method='POST';
        document.getElementById("BMFormId").action=localStorage.contextPath+"/client/ci/"+$('#deleteUserId').val()+"/deleteUser";
        document.getElementById("BMFormId").submit();
    });
});

function manageUsersSubmitForm(){
	var roleId = $("#roleIdArray").val().split(',');
    var CheckedValuesArray = new Array();
    for(var i=0;i<roleId.length;i++){
        if($("#roleId"+roleId[i]).is(':checked') == true) {
            CheckedValuesArray.push(roleId[i]);
            $("#roleId").val(CheckedValuesArray);
        }
    }
    var officeId = document.getElementById("officeId").value;
	//var roleId =  document.getElementById("roleId").value;
	var userNameId = document.getElementById("userNameId").value;
	var firstName = document.getElementById("firstNameId").value;
	var lastName = document.getElementById("lastNameId").value;
	//var passwordId = document.getElementById("passwordId").value;
	//var confirmPasswordId = document.getElementById("confirmPasswordId").value;
	var contactNumberId = document.getElementById("contactNumberId").value;
	var emailIdID = document.getElementById("emailIdID").value;
	var dob = document.getElementById("dobId").value;
	var gender = document.getElementById("genderId").value;
	var address = document.getElementById("addressId").value;
	var userHierarchy = document.getElementById("userHierarchyId").value;

    //Dhinakaran

    var imeiNumberId = document.getElementById("imeiNumberIdID").value;

	if(officeId!='0' & userNameId!="" & firstName!= "" & lastName!="" & contactNumberId!="" & emailIdID!="" & roleId!='0' & dob != "" & gender != '0' & address != "" & userHierarchy != '0'){
		//password validation
		/*if(document.getElementById("passwordId").value != document.getElementById("confirmPasswordId").value){
			var errorMessage = "Password doesn't match";
			document.getElementById("errorMessageId").innerText = errorMessage;
			$(window).scrollTop(0);
		}
		else if((passwordId.length < 6)){
			var errorLabelMandatory = "Please provide atleast 6 characters For Password"
			document.getElementById("errorMessageId").innerText = errorLabelMandatory;
			$(window).scrollTop(0);
		}
		else */if((contactNumberId.length < 10)){
			var errorLabelMandatory = "Please provide atleast 10 digit Contact Number"
			document.getElementById("errorMessageId").innerText = errorLabelMandatory;
			$(window).scrollTop(0);
		}
        else if($("#roleId").val().length ==0){
            var errorLabelMandatory = "Please select atleast one role for the user"
            document.getElementById("errorMessageId").innerText = errorLabelMandatory;
            $(window).scrollTop(0);
        }
		else{
			//emailId validation
			var email_ID = document.getElementById("emailIdID").value;
			var reg = /^\w+([-+.']\w+)*@\w+([-.]\w+)*\.\w+([-.]\w+)*$/
			if (reg.test(email_ID)){
                $.mobile.showPageLoadingMsg();
                var userNameArray = $("#userNameArrayId").val().split(",");
                var enteredUserName = $("#userNameId").val().toLowerCase();
                var trimmedString = $.trim(enteredUserName);
                for(var i = 0; i < userNameArray.length; i++) {
                    userNameArray[i] = userNameArray[i].toLowerCase();
                }
                if(($.inArray(trimmedString, userNameArray)) != -1) {
                    $("#errorMessageId").text("User Name already Exists");
                }else{
                    document.getElementById("errorMessageId").innerText = "";
                    document.getElementById("BMFormId").method='POST';
                    document.getElementById("BMFormId").action=localStorage.contextPath+"/client/ci/saveuser";
                    document.getElementById("BMFormId").submit();
                    //alert("User Created Successfully");
                }
			}
			else{
				var errorMessage = "Invalid Email Id";
				document.getElementById("errorMessageId").innerText = errorMessage;
				$(window).scrollTop(0);
			}
		}
	}
	else{
		var errorMessage = "Please Fill all the fields";
		document.getElementById("errorMessageId").innerText = errorMessage;	
		$(window).scrollTop(0);
	}
		
}

function populateUserDetails(uid) {
    $("p").text('');
	$("#tableviewdiv").hide();
    $("#errorMessageId").text("");
    $("#editUDiv").show();
	var userId =uid;
	if(userId != 0) {
		var data = {};
		data.userId = userId;
		
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
			url: 'http://'+ajaxcallip+localStorage.contextPath+'/client/ci/populateuserdetails',
			success: function(data) {
				document.getElementById("userIdEdit").value = data.userId;
				$("#officeIdEdit").val(data.officeId).selectmenu("refresh");
				$("#officeEditHidden").val(data.officeId);
				//$("#roleIdEdit").val(data.roleId).selectmenu("refresh");
				document.getElementById("userNameIdEdit").value = data.userNameId;
				//document.getElementById("passwordIdEdit").value = data.passwordId;
				//document.getElementById("confirmPasswordIdEdit").value = data.passwordId;
				document.getElementById("contactNumberIdEdit").value = data.contactNumberId;
				document.getElementById("emailIdIDEdit").value = data.emailIdID;
				document.getElementById("firstNameIdEdit").value = data.firstName;
				document.getElementById("lastNameIdEdit").value = data.lastName;
				document.getElementById("dobIdEdit").value = data.dob;
				//document.getElementById("genderIdEdit").value = data.gender;
				$("#genderIdEdit").val(data.gender).selectmenu("refresh");
				document.getElementById("addressIdEdit").value = data.address;
				//document.getElementById("userHierarchyIdEdit").value = data.userHierarchy;
				$("#userHierarchyIdEdit").val(data.userHierarchy).selectmenu("refresh");
                document.getElementById("imeiNumberIdIDEdit").value  = data.imeiNumberId;
                document.getElementById("imeiNumberIdIDEditHidden").value  = data.imeiNumberId;

				var role=data.roleId;
                var lengthOfRole = $("#roleIdArray").val().length/2;
                for(var i=0;i<lengthOfRole;i++){
                    for(var j=0;j<role.length;j++){
                        if(role[j] == i){
                            $("#roleIdEdit"+[i]).attr("checked", "true").checkboxradio('refresh');
                        }
                    }
                }

                /*if((role == bdeRoleId || role == foRoleId)){
                    
                    $("#imeiEditDivId").show();
                }
                else {
                    $("#imeiEditDivId").hide();
                }*/
			}
		});
	} else if(userId == 0) {

	}
}

function manageUpdateUsers() {
	var officeId 			= document.getElementById("officeIdEdit").value;
    var roleId = $("#roleIdArray").val().split(',');
    var CheckedValuesArray = new Array();
    for(var i=0;i<roleId.length;i++){
        if($("#roleIdEdit"+roleId[i]).is(':checked') == true) {
            CheckedValuesArray.push(roleId[i]);
            $("#roleId").val(CheckedValuesArray);
        }
    }
    //var roleId 				=  document.getElementById("roleIdEdit").value;
	var userNameId 			= document.getElementById("userNameIdEdit").value;
	var firstName 			= document.getElementById("firstNameIdEdit").value;
	var lastName			= document.getElementById("lastNameIdEdit").value;
	var passwordId 			= document.getElementById("passwordIdEdit").value;
	var confirmPasswordId 	= document.getElementById("confirmPasswordIdEdit").value;
	var contactNumberId 	= document.getElementById("contactNumberIdEdit").value;
	var emailIdID 			= document.getElementById("emailIdIDEdit").value;
	var dob 				= document.getElementById("dobIdEdit").value;
	var gender			    = document.getElementById("genderIdEdit").value;
	var address 			= document.getElementById("addressIdEdit").value;
	var userHierarchy 		= document.getElementById("userHierarchyIdEdit").value;

    // Dhinakaran

    var imeiNumberId 		= document.getElementById("imeiNumberIdIDEdit").value;
	
	if(officeId!='0' & userNameId!="" & firstName!= "" & lastName!="" & passwordId!="" & confirmPasswordId!="" & contactNumberId!="" & emailIdID!="" & roleId!='0' & dob != "" & gender != '0' & address != "" & userHierarchy != '0'){
		//password validation
		if(document.getElementById("passwordIdEdit").value != document.getElementById("confirmPasswordIdEdit").value){
			var errorMessage = "Password doesn't match";
			document.getElementById("errorMessageId").innerText = errorMessage;
			$(window).scrollTop(0);
		}
		else if((passwordId.length < 6)){
			var errorLabelMandatory = "Please provide atleast 6 characters For Password"
			document.getElementById("errorMessageId").innerText = errorLabelMandatory;
			$(window).scrollTop(0);
		}
		else if((contactNumberId.length < 10)){
			var errorLabelMandatory = "Please provide atleast 10 digit Contact Number"
			document.getElementById("errorMessageId").innerText = errorLabelMandatory;
			$(window).scrollTop(0);
		}
        else if($("#roleId").val().length == 0){
            var errorLabelMandatory = "Please select atleast one role for the user"
            document.getElementById("errorMessageId").innerText = errorLabelMandatory;
            $(window).scrollTop(0);
        }
        else{
			//emailId validation
			var email_ID = document.getElementById("emailIdIDEdit").value;
			var reg = /^\w+([-+.']\w+)*@\w+([-.]\w+)*\.\w+([-.]\w+)*$/
			if (reg.test(email_ID)){
                $.mobile.showPageLoadingMsg();
				document.getElementById("errorMessageId").innerText = "";
				document.getElementById("BMFormId").method='POST';
				document.getElementById("BMFormId").action=localStorage.contextPath+"/client/ci/updateuser";
				document.getElementById("BMFormId").submit();
				//alert("User Updated Successfully!");
			}
			else{
				var errorMessage = "Invalid Email Id";
				document.getElementById("errorMessageId").innerText = errorMessage;
				$(window).scrollTop(0);
			}
		}
	}
	else{
		var errorMessage = "Please Fill all the fields";
		document.getElementById("errorMessageId").innerText = errorMessage;	
		$(window).scrollTop(0);
	}
}

function resetFields() {
	$("#officeId").val('0').selectmenu("refresh");
	$("#roleId").val('0').selectmenu("refresh");
	$("#genderId").val('0').selectmenu("refresh");
	$("#userHierarchyId").val('0').selectmenu("refresh");
	$("#userNameId").val("");
	$("#firstNameId").val("");	
	$("#lastNameId").val("");
	$("#passwordId").val("");
	$("#confirmPasswordId").val("");
	$("#contactNumberId").val("");
	$("#emailIdID").val("");
	$("p").text("");
	$("#dobId").val("");
	$("#addressId").val("");
}

function deleteUsers(userid,deleteUserId) {
    $("p").text('');
    $(window).scrollTop(0);
    $('#deleteUserId').val(userid);
    document.getElementById(deleteUserId).href= "#deleteConfirmationId";
    $("#"+deleteUserId).trigger('click');
}
function validateUser() {
    var data ={};
    var username = document.getElementById("userNameId").value;
    if(username != ""){
        $.ajax({
            type  : 'POST',
            data  : JSON.stringify(data),
            async :false,
            contentType: 'application/json',
            url: 'http://'+ajaxcallip+localStorage.contextPath+'/client/ci/validateUser/'+username,
            success: function(data) {
                document.getElementById("errorId").innerText  = data.message;
                if(data.message != "Existing User"){
                    $("#userNameId").val("");
                }
            },error : function(jqXHR, textStatus, error) {

            }
        });
    } else{
        document.getElementById("errorId").innerText  = "Please specify User Name";
    }

}
