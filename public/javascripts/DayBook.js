$(document).ready(function() {
    var transactionDate = Date.parse(changeDateFormat($('#transactionDateId').val()));
    var lastClosingDate = Date.parse(changeDateFormat($('#lastClosingDateStrId').val()));
    if(transactionDate < lastClosingDate){
        $('#submitId').hide();
        $('#rejectId').hide();
    }
	alertMsg = $("#VerifiedDayMsgId").val().trim() ;
	if(alertMsg == 'undefined' || alertMsg == ""){
	}
	else{
		$('#verifiedDayAlertMsgId').popup('open');
	}
	var errors = new Array();
	errors = $("#errorsId").val().split(",");
	for(var i=0;i<errors.length;i++){
		var newContent = '<p align="center" style="color:red">'+errors[i]+'</p>'
		$("#errorDiv").append(newContent).trigger('create');
	}
	$("#outflow").hide();
	$("#inoutFlowDetailId").hide();
	$("#custom-li-InflowTab").click(function(){
		$("#inflow").show();
		$("#outflow").hide();
	});
	$("#custom-li-OutflowTab").click(function(){
		$("#inflow").hide();
		$("#outflow").show();
	});
	$(function() {
		$( "#dateofTransactionId" ).datepicker({
            minDate: '01-04-2014',
			maxDate: new Date,
			//minDate: $("#lastClosingDateStrId").val(),
			//minDate: '01-04-2013',
			beforeShowDay: function(date){
				show = true;
				var display = [show,'',(show)?'':'No Weekends or Holidays'];//With Fancy hover tooltip!
                return display;
			},
			dateFormat: 'dd-mm-yy',
			yearRange: "-90:+0",
  			changeMonth: true,
            changeYear: true
        });
	});
	/*$("#closeId").click(function(){
		$( "#verifiedDayAlertMsgId" ).popup("close");
	});*/
	$('#dateofTransactionId').change(function () {
        $.mobile.showPageLoadingMsg();
		document.getElementById("dayBookFormId").method='POST';
		document.getElementById("dayBookFormId").action=localStorage.contextPath+"/client/ci/daybook/dayBookLoad";
		document.getElementById("dayBookFormId").submit();
	});
	$("#verifyId").click(function(){
		$("#inoutFlowDetailId").show();
	});
	$("#submitId").click(function(){
        $("#message").remove();
        var transactionDate = Date.parse(changeDateFormat($('#transactionDateId').val()));
        var lastClosingDate = Date.parse(changeDateFormat($('#lastClosingDateStrId').val()));
        if(transactionDate < lastClosingDate){
            var newContent = '<p align="center" id="message" style="color:red">Day book already closed for '+$('#transactionDateId').val()+'. Please select another date to close</p>'
            $("#errorDiv").append(newContent).trigger('create');
        }
        else {
            $.mobile.showPageLoadingMsg();
            document.getElementById("dayBookFormId").method = 'POST';
            document.getElementById("dayBookFormId").action = localStorage.contextPath+"/client/ci/daybook/verifyDayBook";
            document.getElementById("dayBookFormId").submit();
        }
	});
	$("#rejectId").click(function(){
        $("#message").remove();
        $.mobile.showPageLoadingMsg();
		document.getElementById("dayBookFormId").method='POST';
		document.getElementById("dayBookFormId").action=localStorage.contextPath+"/client/ci/daybook/rejectDayBook";
		document.getElementById("dayBookFormId").submit();
	});
	$('#officeId').change(function () {
        $("#message").remove();
        $.mobile.showPageLoadingMsg();
		document.getElementById("dayBookFormId").method='POST';
		document.getElementById("dayBookFormId").action=localStorage.contextPath+"/client/ci/daybook/dayBookLoad";
		document.getElementById("dayBookFormId").submit();
	});
	
});
function changeDateFormat(date) {
    var dateInArray = date.split("-");
    return dateInArray[2]+"-"+dateInArray[1]+"-"+dateInArray[0];
}




