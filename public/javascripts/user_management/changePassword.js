window.history.forward();
//SathishKumar M 008
function changePassword(){
    if($("#password").val().trim()==""){
        var errorMessage = "Please fill old password";
        document.getElementById("errorMessageId").innerText = errorMessage;
        $(window).scrollTop(0);
    }
    else if($("#newPassword").val().trim()==""){
        var errorMessage = "Please fill new password";
        document.getElementById("errorMessageId").innerText = errorMessage;
        $(window).scrollTop(0);
    }
    else if($("#confirmPassword").val().trim()==""){
        var errorMessage = "Please fill new confirm password";
        document.getElementById("errorMessageId").innerText = errorMessage;
        $(window).scrollTop(0);
    }
    else if($("#newPassword").val().length < 6){
        var errorLabelMandatory = "Please provide atleast 6 characters For Password"
        document.getElementById("errorMessageId").innerText = errorLabelMandatory;
        $(window).scrollTop(0);
    }
    else if($("#newPassword").val().trim() != $("#confirmPassword").val().trim()){
        var errorMessage = "New Password and Confirm Password doesn't match";
        document.getElementById("errorMessageId").innerText = errorMessage;
        $(window).scrollTop(0);
    }
    else if($("#newPassword").val().trim() == $("#password").val().trim()){
        var errorMessage = "Old password and New password should not be same";
        document.getElementById("errorMessageId").innerText = errorMessage;
        $(window).scrollTop(0);
    }
    else
    {
        document.getElementById("errorMessageId").innerText = "";
        $.mobile.showPageLoadingMsg();
        document.getElementById("changePasswordFormID").method='POST';
        document.getElementById("changePasswordFormID").action=localStorage.contextPath+"/client/ci/submitChangePassword";
        document.getElementById("changePasswordFormID").submit();
    }

}

// Added by chitra 003
$(document).ready(function() {
    $("#password").focusout(function(){
        //password_validation($("#password").val(),"#password");
    });

    $("#newPassword").focusout(function(){
        password_validation($("#newPassword").val(),"#newPassword");
    });

    $("#confirmPassword").focusout(function(){
        password_validation($("#confirmPassword").val(),"#confirmPassword");
    });
    /*$("#backUId").click(function(){
        $.mobile.showPageLoadingMsg();
        document.getElementById("changePasswordFormID").method='GET';
        document.getElementById("changePasswordFormID").action=localStorage.contextPath+"/client/ci/menu";
        document.getElementById("changePasswordFormID").submit();
    })*/
});

function password_validation(password,id){
    var regExp = (/^(?=.*[A-Z])((?=.*\d)|(?=.*?[#?!@$%^&*-])).{6,}$/);
    if(password.length < 6){
        $("#errorMessageId").text("Please provide atleast 6 characters For Password");
        $(id).focus();
        $(window).scrollTop(0);
    }
    else if(!(regExp.test(password))){
        $("#errorMessageId").text("Password should contain atleast one uppercase and one digit or one special Character.");
        $(id).focus();
        $(window).scrollTop(0);
    }else{
        $("#errorMessageId").text("");
    }
}
