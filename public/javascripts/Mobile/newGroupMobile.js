var inc=0;
var sno=1;
var noOfClients=0;
var hiddenclientname = new Array();
var hiddenclientlastname = new Array();
var hiddenoverdue = new Array();
var currentValue = 1;
var startField = 1;
var endField = 14;
window.history.forward();

$(document).ready(function() {
    $(function() {
		$( "#createdDatePicker" ).datepicker({
			maxDate: new Date,
			dateFormat: 'dd/mm/yy',
			yearRange: "-90:+0",
  			changeMonth: true,
            changeYear: true
        });
		$('#previous').hide();
		$('#field13').hide();
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
	for(var i=2 ;i<=endField; i++) {
		$("#field"+i).hide();
	}
	
	
	//$("#meetingScheduleDetailsMobile").hide();
	//$("#memberDetailsMobile").hide();
	//$("#monthsdiv").hide();
	//$("#weekdiv").hide();

$("#week").click(function(){
	//$("#monthsdiv").hide();
	//$("#weekdiv").show();
	$("#day").val('');
	$("#locationmonth").val('');
	$("#meetingscheduleWeekHidden").val('1');
	$("#meetingscheduleMonthHidden").val('0');
	//currentValue = 4;
});

$("#month").click(function(){
	$("#recurevery").val('');
	$("#daylist").val('0');
	$("#location").val('');
	$("#meetingscheduleWeekHidden").val('0');
	$("#meetingscheduleMonthHidden").val('1');
	//currentValue = 7;
	
//$("#weekdiv").hide();
//$("#monthsdiv").show();

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

		if( $("#groupName").val()==""|$("#centerName").val()==""|$("#createdDatePicker").val()==""|$("#branchName").val()==0| $("#loanType").val()==0){
			$("#errorField").text("Please Fill Mandatory Fields");
			$(window).scrollTop(0);
			$("#AddGroup").show();
		}
		else if($('#skipId').is(':checked') && $("#totalClientsId").val() == ""){
			$("#errorField").text("Please Enter Total No Of Clients");
			$(window).scrollTop(0);
			$("#AddGroup").show();
		}/*else if(noOfClients<5){
			$("#errorField").text("Group Should have minimum 5 clients");
			$(window).scrollTop(0);
			$("#AddGroup").show();
		}*/
		else if($("#totalClientsId").val() < 5) {
			$("#errorField").text("Group Should have minimum 5 clients");
			$(window).scrollTop(0);
			$("#AddGroup").show();
		}
		else if((($("#recurevery").val() == "" | $("#location").val() == "" | $("#daylist").val()==0)) &
			(($("#day").val() == "" | $("#onemonth").val() == "" | $("#locationmonth").val()==0 ))){
				$("#errorField").text("Please Fill Meeting Schedule Details");
				$(window).scrollTop(0);
				$("#AddGroup").show();
		}
		else {
			hiddenclientname = $.grep(hiddenclientname,function(n){return(n);});
			hiddenclientlastname = $.grep(hiddenclientlastname,function(n){return(n);});
			hiddenoverdue = $.grep(hiddenoverdue,function(n){return(n);});
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
		$("#groupName").val("");
		$("#centerName").val("");
		$("#createdDatePicker").val("");
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
	$('#next').click(function(){
		//alert(currentValue);
		var errorFlag = 0;
		$("#errorField").text("");
		if(currentValue == 1) {
			if($("#groupName").val()=="") {
				$("#errorField").text("Please Fill Group Name");
				$(window).scrollTop(0);
				errorFlag = 1;
			}
			else {
				$("#errorField").text("");
			}
		}
		if(currentValue == 2) {
			if($("#centerName").val()=="") {
				$("#errorField").text("Please Fill Center name");
				$(window).scrollTop(0);
				errorFlag = 1;
			}
			else {
				$("#errorField").text("");
			}
		}
		if(currentValue == 3) {
			if($("#createdDatePicker").val()=="") {
				$("#errorField").text("Please Fill Created Date");
				$(window).scrollTop(0);
				errorFlag = 1;
			}else if($("#loanType").val()==0){
				$("#errorField").text("Please Select a Loan Type");
				$(window).scrollTop(0);
				errorFlag = 1;
			}
			else {
				$("#errorField").text("");
			}
		}
		if(currentValue == 4) {
			if($('#week').attr('checked')!='checked' && $('#month').attr('checked')!='checked' ) {
				$("#errorField").text("Please Select Meeting Schedule type");
				$(window).scrollTop(0);
				errorFlag = 1;
			}
			else {
				$("#errorField").text("");
			}
		}
		if($("#meetingscheduleWeekHidden").val() == 1 && currentValue == 5) {
			if($("#recurevery").val()=="") {
				$("#errorField").text("Please Fill Recur Week Detail");
				$(window).scrollTop(0);
				errorFlag = 1;
			}
			else {
				$("#errorField").text("");
			}
		}
		if($("#meetingscheduleWeekHidden").val() == 1 && currentValue == 6) {
			if($("#daylist").val()==0) {
				$("#errorField").text("Please Select a Day");
				$(window).scrollTop(0);
				errorFlag = 1;
			}
			else {
				$("#errorField").text("");
			}
		}
		if($("#meetingscheduleWeekHidden").val() == 1 && currentValue == 7) {
			if($("#location").val()=="") {
				$("#errorField").text("Please Fill Meeting Loaction");
				$(window).scrollTop(0);
				errorFlag = 1;
			}
			else {
				$("#errorField").text("");
			}
		}
		if($("#meetingscheduleMonthHidden").val() == 1 && currentValue == 8) {
			if($("#day").val()=="") {
				$("#errorField").text("Please Fill a Day");
				$(window).scrollTop(0);
				errorFlag = 1;
			}
			else {
				$("#errorField").text("");
			}
		}
		if($("#meetingscheduleMonthHidden").val() == 1 && currentValue == 9) {
			if($("#onemonth").val()=="") {
				$("#errorField").text("");
				$(window).scrollTop(0);
				errorFlag = 1;
			}
			else {
				$("#errorField").text("");
			}
		}
		if($("#meetingscheduleMonthHidden").val() == 1 && currentValue == 10) {
			if($("#locationmonth").val()=="") {
				$("#errorField").text("Please Fill Meeting Location");
				$(window).scrollTop(0);
				errorFlag = 1;
			}
			else {
				$("#errorField").text("");
			}
		}
		if(($("#totalClientsId").val() == "" | $("#totalClientsId").val() < 5) && currentValue == 14 ) {
			if($("#locationmonth").val() != "") {	
				$("#errorField").text("Group Should have minimum 5 clients");
				$(window).scrollTop(0);
				errorFlag = 1;
			}
			else {
				$("#errorField").text("");
			}
		}
		if(currentValue == 11) {
			if(noOfClients<5) {
				$("#errorField").text("Group Should have minimum 5 clients");
				$(window).scrollTop(0);
				errorFlag = 1;
			}
			else {
				$("#errorField").text("");
			}
		}
		
		//alert($('#week').attr('checked'));
		//alert($('#week').is('checked'));
		
		
		if(errorFlag == 0) {
			if($("#meetingscheduleMonthHidden").val() == 1 && currentValue == 4) {
				$('#field'+currentValue).hide();
				currentValue = 8;
				$('#field'+currentValue).show();
			}
			else if($("#meetingscheduleWeekHidden").val() == 1 && currentValue == 7) {
				$('#field'+currentValue).hide();
				currentValue = 14;
				$('#field'+currentValue).show();
			
			}
			else if(currentValue == 10 | currentValue == 7) {
				$('#field'+currentValue).hide();
				currentValue = 14;
				$('#field'+currentValue).show();
			}
			else if($("#meetingscheduleWeekHidden").val() == 1 && currentValue == 7) {
				$('#field'+currentValue).hide();
				currentValue = 14;
				$('#field'+currentValue).show();
			}	
			else if($("#skipHidden").val() == 1 && currentValue == 13) {
				$('#field'+currentValue).hide();
				currentValue = 14;
				$('#field'+currentValue).show();
			}
			else if($("#enterHidden").val() == 1 && currentValue == 13) {
				$('#field'+currentValue).hide();
				currentValue = 11;
				$('#field'+currentValue).show();
			}
			else if(currentValue == 14) {
				$('#field'+currentValue).hide();
				currentValue = 12;
				$('#field'+currentValue).show();
			}
			else {
				$('#field'+currentValue).hide();
				currentValue++;
				$('#field'+currentValue).show();
			}
			if(currentValue == startField){
				$('#previous').hide(); 
			}
			else {
				$('#previous').show();
			}
			if(currentValue == endField-2){
				$('#next').hide(); 
			}
			else {
				$('#next').show();
			}
		}
		
		
		
	});
	$('#previous').click(function(){
		//alert("currentValue" + currentValue);
		if(currentValue == 14){
			if($("#meetingscheduleMonthHidden").val() == 1 && currentValue == 14) {
				$('#field'+currentValue).hide();
				currentValue = 4;
				$('#field'+currentValue).show();
			}
			else if($("#meetingscheduleWeekHidden").val() == 1 && currentValue == 14) {
				$('#field'+currentValue).hide();
				currentValue = 7;
				$('#field'+currentValue).show();
			}
		}
		else if(currentValue == 12) {
				$('#field'+currentValue).hide();
				currentValue = 14;
				$('#field'+currentValue).show();
		}
		else if(currentValue == 8) {
				$('#field'+currentValue).hide();
				currentValue = 4;
				$('#field'+currentValue).show();
		}
		/*else if($("#enterHidden").val() == 1 && currentValue == 12) {
			$('#field'+currentValue).hide();
			currentValue = 11;
			$('#field'+currentValue).show();
		}*/
		else if(currentValue == 11) {
			$('#field'+currentValue).hide();
			currentValue = 13;
			$('#field'+currentValue).show();
		}
		else { 
			$('#field'+currentValue).hide();
			currentValue--;
			$('#field'+currentValue).show();
		}
		
		
		//alert(currentValue);
		if(currentValue<endField){
			$('#next').show(); 
		}
		else {
			$('#next').hide();
		}
		if(currentValue == startField){
			$('#previous').hide(); 
		}
		else {
			$('#previous').show();
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
function disableLink(e) {
    // cancels the event
    e.preventDefault();

    return false;
}
