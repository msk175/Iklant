var inc=0;
var noOfClients=0;
var hiddenclientname = new Array();
var hiddenoverdue = new Array();
$(document).ready(function() {
	$("#remarks").keydown(function(event){
		return ( (event.keyCode == 57 && event.shiftKey) || (event.keyCode == 48 && event.shiftKey) ||(event.keyCode >= 65 && event.keyCode  <= 90) || (event.keyCode == 8 || event.keyCode  == 9 || event.keyCode  == 32 || event.keyCode  == 46 || event.keyCode  == 37 || event.keyCode  == 39 || event.keyCode  == 189) );
	});
	$("#remarksforreject").keydown(function(event){
		return ( (event.keyCode == 57 && event.shiftKey) || (event.keyCode == 48 && event.shiftKey) ||(event.keyCode >= 65 && event.keyCode  <= 90) || (event.keyCode == 8 || event.keyCode  == 9 || event.keyCode  == 32 || event.keyCode  == 46 || event.keyCode  == 37 || event.keyCode  == 39 || event.keyCode  == 189) );
	});
	
	$("#internalLoanAdd").click(function(){
		$("#clientName").val('0').selectmenu("refresh");
		$("#remarksforreject").val('');
		$("#errorLabel").text("");
	});
	$("#saveClient").click(function(){
		
		var status =$("#remarksforreject").val();
		var clientName=$("#clientName option:selected").text();
		if($("#clientName").val()!= 0 && $("#remarksforreject").val() !='' ){
			
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
				hiddenoverdue.push($("#remarksforreject").val());
				$('#clientNamesId').val(hiddenclientname);
				$('#overduesId').val(hiddenoverdue);
				$("a#saveClient").attr('href','#internalloan');
				//alert(hiddenclientname);
				//$('#overdueCheck').attr("checked", "false");
			
			}
			
		}	
		else {
				$("#errorLabel").text("Please Fill Mandatory Fields");
				$("a#saveClient").attr('href','');
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
function reInitiateGroup(groupId,activeClients) {
	//alert($("#clientIdList").val());
	hiddenclientname = $.grep(hiddenclientname,function(n){return(n);});
	hiddenoverdue = $.grep(hiddenoverdue,function(n){return(n);});
	$('#clientNamesId').val(hiddenclientname);
	$('#overduesId').val(hiddenoverdue);
	var clientListArray = $("#clientIdList").val().split(',');
	var stage = $("#stage").val();
	var clientListArrayLength = clientListArray.length;
	var hiddenclientnameLength = hiddenclientname.length;
	if((clientListArrayLength-hiddenclientnameLength) >= 5 || activeClients == null) {
		if(stage == "Rejected-Field Verification") {
			$("#errorField").text("Group Rejected in Field Verification cannot be Reinitiated");
			$(window).scrollTop(0);
		}
		else if($('#remarks').val() != ""){
            $.mobile.showPageLoadingMsg();
			document.getElementById("BMFormId").method='POST';
			document.getElementById("BMFormId").action=localStorage.contextPath+"/client/ci/groups/reinitiate/"+groupId;
			document.getElementById("BMFormId").submit();
		}
		else{
			$("#errorField").text("Remarks To Reintiate Is Mandatory");
			$(window).scrollTop(0);
		}
	}
	else {
		$("#errorField").text("Group cannot be Reinitiated Due to less Than 5 Clients");
		$(window).scrollTop(0);
	}
}
