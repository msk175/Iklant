//$(document).ready(function() {
$("#pageID").live('pageshow',function() {
    $(function() {
		$("#npaReportDateId").datepicker({
			maxDate: new Date,
			dateFormat: 'dd/mm/yy',
			yearRange: "-90:+0",
  			changeMonth: true,
            changeYear: true
        });
	});
	$('#limitId').keyup( function() {
		var $this = $(this);
		if(($this.val() < 2) || ($this.val() > 6) )
			$this.val('');			
	});
	/*$("#custom-li-tab5").click(function(){
		$("#chart_div").hide();
		$("#chart_div1").hide();
		$("#chart_div2").hide();
		$("#chart_div3").show();
		chartNPALoans();
	});*/
	$('#officeId').on('change', function() {
		var selectedOfficeId = $("#officeId").val();
		
		var officeIdArray = $("#officePersonnelIdArrayHidden").val().split(',');
		var personnelIdArray = $("#personnelIdArrayHidden").val().split(',');
		var personnelNameArray = $("#personnelNameArrayHidden").val().split(',');
		$("#loanOfficerId").val('0').selectmenu("refresh");
		document.getElementById('loanOfficerId').options.length = 0;
		var combo1 = document.getElementById("loanOfficerId");

		option = document.createElement("option");
		option.text = "All";
		option.value ="-1";
		 try {
			combo1.add(option, null); //Standard 
		}catch(error) {
			combo1.add(option); // IE only
		}
		for(var i=0;i<personnelIdArray.length;i++){
			if((officeIdArray[i] == selectedOfficeId) || (selectedOfficeId == -1)) {
				var combo = document.getElementById("loanOfficerId");
				option = document.createElement("option");
				option.text = personnelNameArray[i];
				option.value =personnelIdArray[i];
				 try {
					combo.add(option, null); //Standard 
				}catch(error) {
					combo.add(option); // IE only
				}
			}
		}
	});
});
function showNPAReport(){
	var limit = parseInt($("#limitId").val(),10);
	if(isNaN(limit) || limit < 2 || limit > 20){
		var errorLabelMember = "Range should be lies between 2 to 6";
		document.getElementById("errorLabel").innerText = errorLabelMember;
		$(window).scrollTop(0);
	}
	else{
        //$("#processNotificationId").show();
        $.mobile.showPageLoadingMsg();
		document.getElementById("errorLabel").innerText = "";
		document.getElementById("NPAReportMenu").method='POST';
		document.getElementById("NPAReportMenu").action=localStorage.contextPath+"/client/ci/viewnpaReport";
		document.getElementById("NPAReportMenu").submit();
	}
}
function numeric(currentVal){
	//currentVal.value = currentVal.value.replace( /[^0-9]+/g, '');
	var regex = /[^0-9]+/g;
    if(regex.test(currentVal.value)) {
        currentVal.value = currentVal.value.replace(regex, '')  
    }
}


