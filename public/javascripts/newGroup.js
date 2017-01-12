var inc=0;
var sno=1;
var noOfClients=0;
var hiddenclientname = new Array();
var hiddenclientlastname = new Array();
var hiddenoverdue = new Array();


$(document).ready(function() {

	//option to avoid member details entry
	/*$("#skipId").click(function() {
		$("#errorField").text("");
		$("#totalClientsDivId").show();
		$("#memberDetailsDivId").hide();
		
	});
	//option to enter member details
	$("#enterId").click(function() {
		$("#errorField").text("");
		$("#totalClientsDivId").hide();
		$("#memberDetailsDivId").show();
		$("#totalClientsId").val(0);		
	});*/
	
	$(function() {
		$( "#createdDatePicker" ).datepicker({
			maxDate: new Date,
			dateFormat: 'dd/mm/yy',
			yearRange: "-90:+0",
  			changeMonth: true,
            changeYear: true
        });
});

    $(function() {
        $('#meetingTime').timepicker();
    });

    $(function() {
        $('#meetingTimeMonth').timepicker();
    });

		/*$("#groupName").focusout(function() {
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
		});*/
	//$("#totalClientsDivId").hide();
	
	$("#monthsdiv").hide();
	$("#weekdiv").hide();
$("#week").click(function(){

	$("#monthsdiv").hide();
	$("#weekdiv").show();
	$("#day").val('');
	$("#locationmonth").val('');
});

$("#month").click(function(){
$("#recurevery").val('');
$("#daylist").val('0');
$("#location").val('');

$("#weekdiv").hide();
$("#monthsdiv").show();

});
	$("#groupName").keydown(function(event){
	  /*  if (!( (event.keyCode >= 48 && event.keyCode  <= 57) || (event.keyCode >= 96 && event.keyCode  <= 105) || (event.keyCode == 8 || event.keyCode  == 9) 
		|| ( event.keyCode == 219 || event.keyCode  == 221 || event.keyCode  == 189 || event.keyCode  == 35 || event.keyCode  == 36 || event.keyCode  == 46 || event.keyCode  == 109) )) {
			event.preventDefault();
        }*/
			return ((!event.shiftKey && (event.keyCode >= 48 && event.keyCode  <= 57)) || (event.keyCode >= 96 && event.keyCode  <= 105) || (!event.shiftKey && event.keyCode  == 189) || (event.keyCode == 8 || event.keyCode  == 9 || event.keyCode  == 109 || event.keyCode  == 37 || event.keyCode  == 39 || event.keyCode  == 46) );
	});
	
	$("#clientName").keydown(function(event){
	    if (!( (event.keyCode >= 65 && event.keyCode  <= 90) || (event.keyCode == 8 || event.keyCode  == 9 || event.keyCode  == 32 || event.keyCode  == 37 || event.keyCode  == 39 || event.keyCode  == 46) )) {
			event.preventDefault(); 
        }   
	});
	$("#clientLastNameId").keydown(function(event){
	    if (!((event.keyCode >= 65 && event.keyCode  <= 90) || (event.keyCode == 8 || event.keyCode  == 9 || event.keyCode  == 32 || event.keyCode  == 37 || event.keyCode  == 39 || event.keyCode  == 46) )) {
			event.preventDefault(); 
        }   
	});
	
	$("#centerName").keydown(function(event){
		return ( (event.keyCode == 57 && event.shiftKey) || (event.keyCode == 48 && event.shiftKey) ||(event.keyCode >= 65 && event.keyCode  <= 90) || (event.keyCode == 8 || event.keyCode  == 9 || event.keyCode  == 32 || event.keyCode  == 189 || event.keyCode  == 37 || event.keyCode  == 39 || event.keyCode  == 46) );
	   
	});
	$('#day').keyup( function() {
		var $this = $(this);
		if(($this.val() > 31) || ($this.val() < 1) )
			$this.val('');			
	});
	$('#recurevery').keyup( function() {
		var $this = $(this);
		if(($this.val() > 3) || ($this.val() < 1) )
			$this.val('');			
	});
	$("#location").keydown(function(event){
		return ( event.keyCode >= 65 && event.keyCode  <= 90) || (event.keyCode == 8 || event.keyCode  == 9 || event.keyCode  == 32 || event.keyCode  == 37 || event.keyCode  == 39 || event.keyCode  == 46  );
	});
	$("#locationmonth").keydown(function(event){
		return ( event.keyCode >= 65 && event.keyCode  <= 90) || (event.keyCode == 8 || event.keyCode  == 9 || event.keyCode  == 32 || event.keyCode  == 37 || event.keyCode  == 39 || event.keyCode  == 46 );
	 
	});
	$("#AddGroup").click(function(){
		$("#AddGroup").hide();
		if( $("#groupName").val()==""|$("#areaName").val()==0|$("#centerName").val()==""|$("#createdDatePicker").val()==""|$("#branchName").val()==0 | $("#loanType").val()==0){
			$("#errorField").text("Please Fill Mandatory Fields");
			$(window).scrollTop(0);
			$("#AddGroup").show();
		}
		/*else if($("#totalClientsId").val() == ""){
			$("#errorField").text("Please Enter Total No Of Clients");
			$(window).scrollTop(0);
			$("#AddGroup").show();
		}
		else if($("#totalClientsId").val() < 5) {
			$("#errorField").text("Group Should have minimum 5 clients");
			$(window).scrollTop(0);
			$("#AddGroup").show();
		}*/
		else if((($("#recurevery").val() == "" | $("#location").val() == "" | $("#daylist").val()==0) | $("#meetingTime").val() == "") &
			(($("#day").val() == "" | $("#onemonth").val() == "" | $("#locationmonth").val()==0 ) || $("#meetingTimeMonth").val() == "")){
				$("#errorField").text("Please Fill Meeting Schedule Details");
				$(window).scrollTop(0);
				$("#AddGroup").show();
		}
		else {
			hiddenclientname = $.grep(hiddenclientname,function(n){return(n);});
			hiddenclientlastname = $.grep(hiddenclientlastname,function(n){return(n);});
			hiddenoverdue = $.grep(hiddenoverdue,function(n){return(n);});
            $.mobile.showPageLoadingMsg();
			var weekorder = $("#daylist").val();
			$("#dayorder").val(weekorder);
			$('#clientNamesId').val(hiddenclientname);
			$('#clientLastNamesId').val(hiddenclientlastname);
			$('#overduesId').val(hiddenoverdue);
			document.getElementById("BMFormId").method='POST';
			document.getElementById("BMFormId").action=localStorage.contextPath+"/client/ci/groups/saveGroup";
			document.getElementById("BMFormId").submit();
		}
	});
	
	$('#branchName').change(function() {
		//alert($("#branchName option:selected").text());
		var branchname=$("#branchName option:selected").text();
		$("#branchNameHiddenId").val(branchname);
		//alert("val="+$("#branchNameHiddenId").val());
	});
	
	
// Overdue Check box 
	$("#addClient").click(function(){
			$("#clientName").val("");
			$("#clientLastNameId").val("");
			$("#errorLabel").text("");
			
	});
	
	$("#clearId").click(function(){
		$("#errorField").text("");
		$("#centerName").val("");
		$("#createdDatePicker").val("");
		//$("#totalClientsId").val("");
		//$('#branchName').val('0').selectmenu("refresh");
		
		
		$("#recurevery").val("");
		$("#dayorder").val("");
		$("#day").val("");
		$("#onemonth").val("");
		$("#locationmonth").val("");
		$("#location").val("");
		$('#daylist').val('0').selectmenu("refresh");
		$("#week").removeAttr("checked").checkboxradio('refresh');
		$("#month").removeAttr("checked").checkboxradio('refresh');
		$("#monthsdiv").hide();
		$("#weekdiv").hide();
		
		//$("select[name=branchName] option[value='0']").attr('selected', 'selected');'
		hiddenclientname = [];
		hiddenclientlastname=[];
		hiddenoverdue = [];
		$('#clientNamesId').val(hiddenclientname);
		$('#clientLastNameId').val(hiddenclientlastname);
		$('#overduesId').val(hiddenoverdue);
		$('div').remove('#addClientDivId');
		var newContent = '<div data-role="content" data-theme="a" class="content-primary" id="addClientDivId">';
		$("#abc").append(newContent).trigger('create'); 
		inc=0;
	});
	
	
//Dynamic add client 	
	$("#saveClient").click(function(){
		var status ="";
		var clientName = $('#clientName').val();
		var clientLastName = $('#clientLastNameId').val();
		if($("#clientName").val()!='' & $('#clientLastNameId').val()!=''){
			if($("#over").val() == "true"){
				status = "Overdue";
			}
			else if($("#over").val()=="false"){
				status = "No overdue";
			}
			var newContent = '<div data-role="content" data-theme="a" class="content-primary">';
			newContent += '<ul data-role="listview" data-split-theme="a" data-inset="true" id="ulId">';
			newContent += '<li>';
			newContent += '<a href="">';
			newContent += "<label for='NewClientName'"+inc+" id='clientNameID"+inc+"'>"+sno+" "+clientName+" "+clientLastName+"</label>";
			newContent += '<a href="", onclick="removeClient(this,'+inc+')" , data-icon="delete">';
			newContent += '</a>';
			newContent += '</a>';
			newContent += '</li>';
			newContent += '</ul>';
			newContent += '</div>';
			$("#addClientDivId").append(newContent).trigger('create'); 
			inc++;
			sno++;
			noOfClients++;
			hiddenclientname.push($('#clientName').val());
			hiddenclientlastname.push($('#clientLastNameId').val());
			hiddenoverdue.push($('#over').val());
			$('#clientNamesId').val(hiddenclientname);
			$('#clientLastNamesId').val(hiddenclientlastname);
			$('#overduesId').val(hiddenoverdue);
			//alert(hiddenclientname);
			$('#clientName').val('');
			$('#clientLastNameId').val('');
			//$('#overdueCheck').attr("checked", "false");
			$("#overdueCheck").removeAttr("checked").checkboxradio('refresh');
			$("a#saveClient").attr('href','#internalloan');
		}	
		else {
			$("#errorLabel").text("Please Fill Mandatory Fields");
			$("a#saveClient").attr('href','');
		}
	});
	$("#createdDatePicker").keypress(function(e){ e.preventDefault(); });

//number validation
	$("#recurevery").keydown(function(event) {
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

	$("#day").keydown(function(event) {
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
	
	$("#onemonth").keydown(function(event) {
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
});

// Dynamic remove client 
function removeClient(remove,i){
	var value=$("#clientNameID"+i).text();
    r=remove.parentNode.parentNode;
	r.parentNode.removeChild(r);
	//hiddenclientname.splice(i,1);
	//hiddenoverdue.splice(i,1);
	hiddenclientname[i]="";
	hiddenclientlastname[i]="";
	hiddenoverdue[i]="";
	noOfClients--;
	$('#clientNamesId').val(hiddenclientname);
	$('#clientLastNamesId').val(hiddenclientlastname);
	$('#overduesId').val(hiddenoverdue);
	sno--;
}
//to restrict alphabets
function numeric(currentVal){
	var regex = /[^0-9]+/g;
    if(regex.test(currentVal.value)) {
        currentVal.value = currentVal.value.replace(regex, '')  
    }
}
