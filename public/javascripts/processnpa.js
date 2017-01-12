$(document).ready(function() {
	$('#dialog-confirm').hide();
   $(function() {
		$( "#reportDate" ).datepicker({
			maxDate: new Date,
			dateFormat: 'dd/mm/yy',
			yearRange: "-90:+0",
  			changeMonth: true,
            changeYear: true
        });
	  });
 });

function generateNPAReport(){
	$("#reportDate").attr("disabled", "disabled");
	//$('#generateDivId').hide();
	document.getElementById("errorField").innerText = "";
	var data= {};
	data.reportDate = $("#reportDate").val(); 
	data.redo		= $("#redoHiddenId").val();
	data.thereshold = $("#theresholdId").val();	
	if($( "#reportDate" ).val() != "") {
		ajaxVariable = $.ajax({
			beforeSend : function() { 
				$.mobile.showPageLoadingMsg(); 
			},
			complete: function() { 
				$.mobile.hidePageLoadingMsg() 
			},
			type  : 'POST',
			data  : JSON.stringify(data),
			async :false,
			contentType: 'application/json',
			url: 'http://'+ajaxcallip+localStorage.contextPath+'/client/ci/process/npa',
			success: function(success) {
				if(success.status == "success"){
					document.getElementById("successfield").innerText = success.message;
					redirectToNPAReport();
				}
				else if(success.alreadyProcessed == true){
					 $( "#dialog-confirm" ).dialog({
					  resizable: false,
					  height:230,
					  modal: true,
					  buttons: {
						"Yes": function() {
						  $("#redoHiddenId").val(true);
						  generateNPAReport();
						  $( this ).dialog( "close" );
						},
						"No": function() {
							//$('#generateDivId').show();
						  $( this ).dialog( "close" );
						}
					  }
					});
				}
			else{
				showPageExpired();
			}
			},error : function(jqXHR, textStatus, error) {
				$('#generateDivId').show();
			}
		});

	}
	else{
		var errorLabelMember = "Please fill date to generate report";
		document.getElementById("errorField").innerText = errorLabelMember;
		$(window).scrollTop(0);
	}
	$("#reportDate").attr("disabled", false);
}

function showPageExpired(){
    $.mobile.showPageLoadingMsg();
	document.getElementById("processnpa").method='POST';
	document.getElementById("processnpa").action=localStorage.contextPath+"/client/ci/showErrorPage";
	document.getElementById("processnpa").submit();
}

function redirectToNPAReport(){
    $.mobile.showPageLoadingMsg();
	document.getElementById("processnpa").method='GET';
	document.getElementById("processnpa").action=localStorage.contextPath+"/client/ci/showNPAMenuPage";
	document.getElementById("processnpa").submit();
}