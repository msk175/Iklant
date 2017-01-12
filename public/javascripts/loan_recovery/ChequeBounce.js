$(document).ready(function() {

	$("#searchChequeNoId").keyup(function(){
		var val = $(this).val();
		if(isNaN(val)){
			 val = val.replace(/[^0-9\.]/g,'');
			 if(val.split('.').length>2) 
				 val =val.replace(/\.+$/,"");
		}
		val = noSpace(val);
		$("#searchChequeNoId").val(val);
	});
	function noSpace(val) { 
		val = val.replace(/(^\s*)|(\s*$)/gi,"");
		val = val.replace(/[ ]{2,}/gi," "); 
		val = val.replace(/\n /,"\n"); 
		return val;
	}
	$("#searchId").click(function(){
	
		if($("#searchChequeNoId").val() != "") {
            $.mobile.showPageLoadingMsg();
			document.getElementById("chequeBounceFormId").method='POST';
			document.getElementById("chequeBounceFormId").action=localStorage.contextPath+"/client/ci/loanrecovery/searchChequeBounceLoad";
			document.getElementById("chequeBounceFormId").submit();
		}
		else {
			$("#searchErrorMsg").text("");
			$("#errorMsg").text("Please Enter Cheque Number");
		}
	
	});
	
	$("#yesId").click(function(){
			revertChequeDeposit();
		//document.getElementById("chequeBounceFormId").method='POST';
		//document.getElementById("chequeBounceFormId").action=localStorage.contextPath+"/client/ci/loanrecovery/revertChequePayment";
		//document.getElementById("chequeBounceFormId").submit();
	
	});
	

});

function revertChequeDeposit(){
    $('#revertId').hide();
	var data ={};
	data.paymentId			 = $("#paymentIdId").val();
	data.globalAccountNum    = $("#globalAccountNumId").val();
	data.paymentCollectionId = $("#paymentCollectionId").val();
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
		url: 'http://'+ajaxcallip+localStorage.contextPath+'/client/ci/loanrecovery/revertChequePayment',
		success: function(data) {
            $('#revertId').show();
            if(data == 'success') {
                $("#revertId").hide();
                $("#labelRevertID").text("Reverted");
            }else{
                $('#errorMsg').text("Transaction not completed. Please try later")
            }
		},
		error : function(jqXHR, textStatus, error) {
		}		
	});	
}