
$(document).live('pagecreate',function(event) {
    window.isSubmitted = 0;
});
$(document).ready(function() {
	$('#userName').focus();
	//$("#userName").keydown(function(event){
		//return ( (!event.shiftKey && (event.keyCode == 190)) || (event.keyCode == 50 && event.shiftKey) ||(event.keyCode >= 65 && event.keyCode  <= 90) || (event.keyCode == 8 || event.keyCode  == 9 || event.keyCode  == 32 || event.keyCode  == 37 || event.keyCode  == 39 || event.keyCode  == 46) );
	   
	//});
});
function loginAccess() {
    console.log("window.isSubmitted: "+window.isSubmitted);
    $.mobile.showPageLoadingMsg();
    /**
     *  disable the submit button on the 1st click
     */
    if(window.isSubmitted == 0) {
        window.isSubmitted = 1;
        /**
         * identify the context prefix and
         * store it in the local storage of browser
         */
        var browserPath = window.location.pathname;
        var chunks = browserPath.split('/');
        if(typeof(Storage) !== "undefined") {
            localStorage.contextPath = "/"+chunks[1]+"/"+chunks[2]+"/"+chunks[3];
            document.getElementById("submitId").disabled = true;
            document.getElementById("loginFormID").action = localStorage.contextPath+"/client/ci/auth";
            document.getElementById("loginFormID").method = 'POST';
            document.getElementById("loginFormID").submit();
        } else {
            alert("Please use the latest browser."); // Sorry! No Web Storage support..
        }
        //return true;
    } else {
        //return false;
    }
			//}
		//}
		//else {
			//document.getElementById("alertMessage").innerText = "Invalid Email-Id ";
		//}

}

function showRegister(){
    $.mobile.showPageLoadingMsg();
	document.getElementById("loginFormID").action=localStorage.contextPath+"/client/ci/registerNewUser";
	document.getElementById("loginFormID").method='POST';
	document.getElementById("loginFormID").submit();

}
function resetFields() {
	document.getElementById("userName").value = "";
	document.getElementById("password").value = "";
	document.getElementById("alertMessage").innerText = "";
    $('input').val("");
}

function getPassword() {
    var reg = /^[_a-z0-9-]+(\.[_a-z0-9-]+)*@[a-z0-9-]+(\.[a-z0-9-]+)*(\.[a-z]{2,4})$/;
    if($('#forgotUserName').val() == "" || $('#forgotUserName').val().length == 0){
        $('p').text("");
        $('#forgotUserName').focus();
        $('#errorMessage').text("Please fill the user name");
    }
    else if($('#email').val() == "" || $('#email').val().length == 0){
        $('p').text("");
        $('#email').focus();
        $('#errorMessage').text("Please fill the email address");
    }
    else if(!reg.test($('#email').val())){
        $('p').text("");
        $('#email').focus();
        $('#errorMessage').text("Please fill the valid email address");
    }
    else{
        $('p').text("");
        $.mobile.showPageLoadingMsg();
        document.getElementById("forgotPasswordForm").method='POST';
        document.getElementById("forgotPasswordForm").action= localStorage.contextPath + "/client/ci/getNewPassword";
        document.getElementById("forgotPasswordForm").submit();
    }
}
