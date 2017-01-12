var inc =0;
var hiddenclientname = new Array();
var hiddenoverdue = new Array();

$(document).ready(function() {
	$("#groupName").focusout(function() {
		var groupNames = new Array();
		var groupNameArray = $("#groupNameArrayHidden").val();
		var enteredGroupName = $("#groupName").val();
		var trimmedString = $.trim(enteredGroupName);
		groupNames = groupNameArray.split(",");
		if(($.inArray(trimmedString, groupNames)) != -1) {
			$("#errorField").text("Group Name already Exists");
			$("#groupName").focus();
		}
		else {
		$("#errorField").text("");
		}
	})

//--------------------------------------------------------------------------------------------------//
	

		
//--------------------------------------------------------------------------------------------------//	
	
	
	
	
	//function for adding/deleting clients dynamically
	
	$("#internalLoanAddId").click(function(){
		var status ="No overdue";
		var clientName = $('#clientName').val();
		if($("#clientName").val()!=''){
			if($("#over").val() == "true"){
			status = "Overdue";
		}
		else if($("#over").val()=="false"){
			status = "No overdue";
		}
		var newContent = '<div data-role="content" data-theme="a" class="content-primary">';
		newContent += '<ul data-role="listview" data-split-theme="a" data-inset="false" id="ulId">';
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
		
		
		hiddenclientname.push($('#clientName').val());
			hiddenoverdue.push($('#over').val());
			$('#cnameid').val(hiddenclientname);
			$('#overdueid').val(hiddenoverdue);
			//alert(hiddenclientname);
	        $('#clientName').val('');

	}
			
	});
	
	
	
//--------------------------------------------------------------------------------------------------//	

		/*$("#internalLoanAddId").click(function(){
			clientname.push($('#clientName').val());
			overdue.push($('#over').val());
			$('#cnameid').val(clientname);
			$('#overdueid').val(overdue);
	        $('#clientName').val('');
	});*/
	
	
	
	
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
	
	$(document).ready(function(){	
		$('#accountNumber').keyup( function() {
		var $this = $(this);
		if($this.val().length > 16)
			$this.val($this.val().substr(0, 16));			
		});
     });
		
		
	//Default Value for Check Box
		
	   
		
		$("#over").val($("#overdueCheck").is(':checked'));
		
          
	//For Dialog.jade bankdetail div slide
		$('#bankDetails').hide();
		$('#bankAccountCheck').click(function(){
			$('#bankDetails').toggle();
		})
		$('#internalLoanDetails').hide();
		$('#anyInternalLoansCheck').click(function(){
			$('#internalLoanDetails').toggle();
		})
		
		$('input:checked').each(function() {
			// To pass this value to its nearby hidden input
			$(this).parent('td').next('input').val($(this).val());
		});
		
		//To Set Check Box Value
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
		$("#overdueCheck").click(function(){
			$("#over").val($(this).is(':checked'));
          
		});
		
	//From Jagan

	if($('#savingsDiscussed').val() == '1') {
		$('#savingsdiscussedCheck').attr("checked", "true").checkboxradio('refresh');
	}
	else {
		$("#savingsdiscussedCheck").removeAttr("checked");
	}

	if($('#completeAttendance').val() == '1') {
		$('#completeAttendanceCheck').attr("checked", "true").checkboxradio('refresh');
	}
	else {
		$("#completeAttendanceCheck").removeAttr("checked");
	}
	
	if($('#bankAccountHidden').val() == '' |  $('#bankAccountHidden').val() == 'null') {
		$("#bankAccountCheck").removeAttr("checked");
		$('#accountNumber').val('');
	}
	else {
		$('#bankDetails').show();
		$('#bankAccountCheck').attr("checked", "true").checkboxradio('refresh');
		$('#bankNameSelect').val($('#bankNameHidden').val()).selectmenu("refresh");
	}
	
	if($('#anyInternalLoansHidden').val() == '1') {
		$('#internalLoanDetails').show();
		$('#anyInternalLoansCheck').attr("checked", "true").checkboxradio('refresh');
	}
	else {
		$("#anyInternalLoansCheck").removeAttr("checked");
	}
//--Added By Kumaran-------------------------------//
// To clean Null values from both hiddenclientname & hiddenoverdue
	$("#SaveButtonId").click(function() {
		//alert("B4");
		hiddenclientname = $.grep(hiddenclientname,function(n){return(n);});
		hiddenoverdue = $.grep(hiddenoverdue,function(n){return(n);});
		$('#cnameid').val(hiddenclientname);
		$('#overdueid').val(hiddenoverdue);
		//alert("Hidden Array="+$('#cnameid').val());
		//alert("Hidden over Array="+$('#overdueid').val());
	});
//----------------------------------------------------------//
	
	if($('#centerName').val() == '' | $('#centerName').val() == 'NULL'  | $('#centerName').val() == 'null' ) {
		$('#centerName').val('');
	}
	
	$('#branchName').val($('#branchNameHidden').val()).selectmenu("refresh");
	

});

//dynamic div
function removeClient(remove,i){
	var value=$("#clientNameID"+i).text();
    //alert("I==="+i);
	//alert("Value= "+value); 
    r=remove.parentNode.parentNode;
	r.parentNode.removeChild(r);
	//hiddenclientname.splice(i,1);
	//hiddenoverdue.splice(i,1);
	hiddenclientname[i]="";
	hiddenoverdue[i]="";
	$('#cnameid').val(hiddenclientname);
	$('#overdueid').val(hiddenoverdue);
	//alert("Result= "+r.innerText);   
	//alert("Array="+clientname);
	//inc--;
	//alert("I==="+inc);
	//alert(r.innerHTML);
}
//static div
var deleteclientname = new Array();
//var deleteoverdue = new Array();
function clientRemove(val,i,clientID){
deleteclientname.push(clientID);
//deleteoverdue.push(overdue);
$('#deletecnameid').val(deleteclientname);
//$('#deleteoverdueid').val(deleteoverdue);
	//alert("clientID= "+clientID)
	$("#clientLiId"+i).remove();
}
function addClient() {
			
			
}