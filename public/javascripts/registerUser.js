window.history.forward();
$(document).ready(function() {
	$("#saveTenantId").click(function(){
		if( $('#tenantNameId').val()!="" & $('#tenantAddressId').val()!="" ) {
            $.mobile.showPageLoadingMsg();
			$('#registerFormID').attr('method', 'POST'); 
			$('#registerFormID').attr('action', localStorage.contextPath+'/client/ci/saveRegisterUser') ;
			$('#registerFormID').submit();
			
		}
		else{
			$('#errorField').text("Please Fill Mandatory Fields");
		}
	});
});