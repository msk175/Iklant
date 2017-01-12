$("#pageID").live('pageinit',function() {
	$(function() {
		$( "#chequeDateId" ).datepicker({
			maxDate: new Date,
			dateFormat: 'dd/mm/yy',
			yearRange: "-1:+0",
  			changeMonth: true,
            changeYear: true,
			onClose: function ()
			{

				//$('#sourceOfPayId').show();
				// The "this" keyword refers to the input (in this case: #someinput)
				//this.focus();
			}
		});
	});
	$("#chequeNoId").keyup(function(){
		var val = $(this).val();
		if(isNaN(val)){
			 val = val.replace(/[^0-9\.]/g,'');
			 if(val.split('.').length>2) 
				 val =val.replace(/\.+$/,"");
		}
		val = noSpace(val);
		$("#chequeNoId").val(val);
	});
	function noSpace(val) { 
		val = val.replace(/(^\s*)|(\s*$)/gi,"");
		val = val.replace(/[ ]{2,}/gi," "); 
		val = val.replace(/\n /,"\n"); 
		return val;
	}
	$("#received").hide();
	$("#chequeDateId").click(function(){
		//$('#sourceOfPayId').attr("disabled", true); 
		//$('#sourceOfPayId').hide();
	});
	$("#yesId").click(function(){
        $.mobile.showPageLoadingMsg();
        chequeDepositSubmisson();
	});
	$("#noId").click(function(){
        $("#Deposit").show();
        $("#paymentVerifiedId").popup( "close" );
		//document.getElementById("Deposit").href= "JavaScript:revertPayment("+rowIndex+","+$("#paymentId").val()+")";
	});
});
function chequeDepositSubmisson(){

	var data ={};
		data.paymentCollection = $("#paymentCollectionId").val();
		data.sourceOfPay	   = $("#sourceOfPayId").val();	
		data.chequeNumber	   = $("#chequeNoId").val();	
		data.chequeDateName	   = $("#chequeDateId").val();	
	$.ajax({
		type  : 'POST',
		data  : JSON.stringify(data),
		async : false,
		contentType: 'application/json',
		url: 'http://'+ajaxcallip+localStorage.contextPath+'/client/ci/doChequeDeposit',
		success: function(success) {
            $.mobile.hidePageLoadingMsg()
            if(success.status == "success"){
				$("#Deposit").hide();
				$("#received").show();
				document.getElementById("errorLabel").innerText = "";
			}
			else if(success.status == "failure"){
				//var errorLabelMember = "Day book already closed for selected date,so not able to make payment";
				var errorLabelMember = success.error;
				document.getElementById("errorLabel").innerText = errorLabelMember;
				$(window).scrollTop(0);
				$( "#Deposit" ).show();
			}
			else{
				showPageExpired();
			}
		},
		error : function(jqXHR, textStatus, error) {
            $.mobile.hidePageLoadingMsg()
        }
	});
}
function chequeDeposit(){

	if($( "#sourceOfPayId" ).val() == 0){
		var errorLabelMember = "Please Select Source Of Payment";
		document.getElementById("errorLabel").innerText = errorLabelMember;
		$(window).scrollTop(0);
	}else if($("#chequeNoId").val().length < 6 | $("#chequeNoId").val().length > 7 ){
		var errorLabelMember = "Cheque number should be 6 or 7 digits";
		document.getElementById("errorLabel").innerText = errorLabelMember;
		$(window).scrollTop(0);
	}else if($("#chequeDateId").val() == "" ){
		var errorLabelMember = "Please Select Cheque Date";
		document.getElementById("errorLabel").innerText = errorLabelMember;
		$(window).scrollTop(0);
	}else{
        $( "#Deposit" ).hide();
		document.getElementById("errorLabel").innerText = "";
		//document.getElementById('Deposit').href= "#paymentVerifiedId";
        $( "#paymentVerifiedId" ).popup( "open" );
		//$("#Deposit").trigger('click');
		
		//document.getElementById("chequeDepositFormId").method='POST';
		//document.getElementById("chequeDepositFormId").action=localStorage.contextPath+"/client/ci/doChequeDeposit";
		//document.getElementById("chequeDepositFormId").submit();
	}
}
function showPageExpired(){
    $.mobile.showPageLoadingMsg();
	document.getElementById("chequeDepositFormId").method='POST';
	document.getElementById("chequeDepositFormId").action=localStorage.contextPath+"/client/ci/showErrorPage";
	document.getElementById("chequeDepositFormId").submit();
}