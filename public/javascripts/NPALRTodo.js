$(document).ready(function() {
	var date = $('#date').val();
	if(date == 'current') {
		$('#currentTaskNavBarId').addClass("ui-btn-active");
	}
	else if(date == 'future') {
		$('#futureTaskNavBarId').addClass("ui-btn-active");
	}
	else if(date == 'overdue') {
		$('#overdueTaskNavBarId').addClass("ui-btn-active");
	}
	if($('#taskLength').val() == 0) {
		$("#errorField").text("No Task Found");
	}
});

function submitTask(i) {
	if($('#todoRemarksId'+i).val() != '') {
		var data = {};
		data.remarks = $('#todoRemarksId'+i).val();
		data.taskId = $('#taskId'+i).val();
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
				url: 'http://'+ajaxcallip+localStorage.contextPath+'/client/ci/NPALRGroups/todo/submittask',
				success: function(data) {
					$("#errorField").text("");
					if(data.result == 'success') {
						$("#taskSubmit"+i).hide();
						$("#labelSubmitID"+i).text('submitted');					
					}
				},error : function(jqXHR, textStatus, error) {
					alert("textStatus" + textStatus);
				}		
			});
	}
	else {
		$("#errorField").text("Fill Remarks");
	}
}