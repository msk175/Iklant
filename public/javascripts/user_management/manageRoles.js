$(document).ready(function() {
	//$("#addRDiv").hide();
	$("#editRDiv").hide();

	$("#addRId").click(function(){
		$("#editRDiv").hide();
		$("#addRId").hide();
		//$("#addRDiv").show();
		$("#tableviewdivRole").hide();
	});
	$("#backRId").click(function(){
		$("#editRDiv").hide();
		$("#addRId").show();
		//$("#addRDiv").hide();
		$("#tableviewdivRole").show();
		$("#errorMessageIdManageRoles").text("");
	});
	/*$("#backREId").click(function(){
		$("#editRDiv").hide();
		$("#addRId").show();
		$("#addRDiv").hide();
		$("#tableviewdivRole").show();
		$("#errorMessageIdManageRoles").text("");
	});*/
	$("#editRId").click(function(){
		//$("#addRDiv").hide();
		$("#editRDiv").show();
	});
	$("#roleNameId").keydown(function(event){
		return ( (event.keyCode >= 65 && event.keyCode  <= 90) || (event.keyCode == 8 || event.keyCode  == 9 || event.keyCode  == 32 || event.keyCode  == 37 || event.keyCode  == 39 || event.keyCode  == 46) );
	});
	
	$("#roleNameIdEdit").keydown(function(event){
		return ( (event.keyCode >= 65 && event.keyCode  <= 90) || (event.keyCode == 8 || event.keyCode  == 9 || event.keyCode  == 32 || event.keyCode  == 37 || event.keyCode  == 39 || event.keyCode  == 46) );
	});
	
	$("#roleDescId").keydown(function(event) {
		if((!event.shiftKey && event.keyCode == 222) || event.keyCode == 220) {
			return false; 
		}
	});
	
	$("#roleDescIdEdit").keydown(function(event) {
		if((!event.shiftKey && event.keyCode == 222) || event.keyCode == 220) {
			return false; 
		}
	});
	
});

function clickOperation(thisId) {
	alert($(thisId).val());

}

function manageRolesSave(){
	var CheckedValuesArray = new Array();
	for(i=0;i< $("#operationIdLengthHidden").val();i++){
		if($("#roleId"+i).is(':checked') == true){
			CheckedValuesArray.push($("#roleId"+i).val());
			$("#checkedValuesHiddenId").val(CheckedValuesArray);
		}
	}
	
	if($('#roleNameId').val()!="" & $('#roleDescId').val()!=""){
		if($("#checkedValuesHiddenId").val()!=""){
            $.mobile.showPageLoadingMsg();
			$("#errorMessageIdManageRoles").text("");
			document.getElementById("BMFormId").method='POST';
			document.getElementById("BMFormId").action=localStorage.contextPath+"/client/ci/groups/saveManageRoles";
			document.getElementById("BMFormId").submit();
		}
		else{
			$("#errorMessageIdManageRoles").text("Atleast one Operation Must be Assigned for a Role");
			$(window).scrollTop(0);
		}
	}
	else if($('#roleNameId').val() !="" & $('#roleDescId').val() == ""){
		$("#errorMessageIdManageRoles").text("Role Description Cannot be Empty");
		$(window).scrollTop(0);
	}
	else if($('#roleNameId').val() == "" & $('#roleDescId').val() != ""){
		$("#errorMessageIdManageRoles").text("Role Name Cannot be Empty");
		$(window).scrollTop(0);
	}
	else{
		$("#errorMessageIdManageRoles").text("Please Provide All the Details");
		$(window).scrollTop(0);
	}
}

function manageRolesUpdate() {
		var CheckedValuesArray = new Array();
		$("#checkedValuesHiddenId").val(""); 
		for(i=0;i< $("#operationIdLengthHidden").val();i++) {
			if($("#roleIdCheckEdit"+i).is(':checked') == true) {
				//alert("Value= "+$("#roleIdCheckEdit"+i).val());
				CheckedValuesArray.push($("#roleIdCheckEdit"+i).val());
				$("#checkedValuesHiddenId").val(CheckedValuesArray);
			}
		}
		if($("#RoleIdEdit").val()!= 0){
		if($('#roleNameIdEdit').val()!="" & $('#roleDescIdEdit').val()!="") {
			if($("#checkedValuesHiddenId").val()!=""){
                $.mobile.showPageLoadingMsg();
				$("#errorMessageIdManageRoles").text("");
				document.getElementById("BMFormId").method='POST';
				document.getElementById("BMFormId").action=localStorage.contextPath+"/client/ci/updaterole";
				document.getElementById("BMFormId").submit();
				//alert("Role Updated Successfully!");
			}
			else {
				$("#errorMessageIdManageRoles").text("Atleast one Operation Must be Assigned for a Role");
				$(window).scrollTop(0);
			}
		}
		else if($('#roleNameIdEdit').val() !="" & $('#roleDescIdEdit').val() == "") {
			$("#errorMessageIdManageRoles").text("Role Description Cannot be Empty");
			$(window).scrollTop(0);
		}
		else if($('#roleNameIdEdit').val() == "" & $('#roleDescIdEdit').val() != "") {
			$("#errorMessageIdManageRoles").text("Role Name Cannot be Empty");
			$(window).scrollTop(0);
		}
	else {
		$("#errorMessageIdManageRoles").text("Please Provide All the Details");
		$(window).scrollTop(0);
	}
	}
	else{
			$("#errorMessageIdManageRoles").text("Please Select Role From Drop-Down");
			$(window).scrollTop(0);
		}
}

function populateRoleDetails(roleEditId) {
	var roleId = roleEditId;
	$("#editRDiv").show();
	$("#tableviewdivRole").hide();
	if(roleId != 0) {
		var data = {};
		data.roleId = roleId;		
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
			url: 'http://'+ajaxcallip+localStorage.contextPath+'/client/ci/populateroledetails',						
			success: function(data) {
				document.getElementById("roleIdEdit").value = data.roleId;
				document.getElementById("roleNameIdEdit").value = data.roleName;
				document.getElementById("roleDescIdEdit").value = data.roleDescription;
				document.getElementById("operationValuesHiddenId").value = data.selectedOperationIdArray;
				var branchOp="";
				for(var x=0;x<data.selectedRolePrevilegeIdArray.length;x++) {
					//$('#editRolePrevilegeCheckBoxDiv').append('<input type="checkbox" name="roleCheckboxNameEdit" id="roleIdCheckEdit"'+i' value='+data.selectedRolePrevilegeIdArray[x]+'/>');
					 branchOp += '<input type="checkbox" name="branch" id="roleIdCheckEdit'+x+'" value="'+data.selectedRolePrevilegeIdArray[x]+'" class="branch"><label for="roleIdCheckEdit'+x+'">'+data.selectedRolePrevilegeNameArray[x]+'</label>';
					 //$(item.branchCode).addClass("intro");
				}
				$('#editRolePrevilegeCheckBoxDiv').append(branchOp).trigger("create");
				
				for(var i=0;i<data.selectedRolePrevilegeIdArray.length;i++) {
					for(var j=0;j<data.selectedOperationIdArray.length;j++) {
						if(data.selectedRolePrevilegeIdArray[i] == data.selectedOperationIdArray[j]) {
							var id = "roleIdCheckEdit"+i;
							$('#'+id).attr("checked", "true").checkboxradio('refresh');
						}
					}
				}
			},
		});
	} else if(roleId == 0) {

	}
}

/*function deleteRole(roleid) {
	//alert(roleid);
	checkForRoleIsAssigned(roleid);
	document.getElementById("BMFormId").method='POST';
	document.getElementById("BMFormId").action=localStorage.contextPath+"/client/ci/"+roleid+"/deleterole";
	document.getElementById("BMFormId").submit();
	alert("Role Deleted Successfully!");
}*/

function deleteRole(roleid) {
	if(roleid != 0) {
		var data = {};
		data.roleId = roleid;		
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
			url: 'http://'+ajaxcallip+localStorage.contextPath+'/client/ci/checkForRoleIsAssigned',						
			success: function(data) {
				if(data.noOfUsers == 0) {
                    $.mobile.showPageLoadingMsg();
					document.getElementById("BMFormId").method='POST';
					document.getElementById("BMFormId").action=localStorage.contextPath+"/client/ci/"+roleid+"/deleterole";
					document.getElementById("BMFormId").submit();
					//alert("Role Deleted Successfully!");
				} else {
					alert("Role cannot be deleted as it is assigned to "+data.noOfUsers+" users");
				}
			}
		});
	}
}