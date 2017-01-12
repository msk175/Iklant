window.history.forward();
$(document).ready(function() {
	/*$("#userName").keydown(function(event){
		return ( (!event.shiftKey && (event.keyCode == 190)) || (event.keyCode == 50 && event.shiftKey) ||(event.keyCode >= 65 && event.keyCode  <= 90) || (event.keyCode == 8 || event.keyCode  == 9 || event.keyCode  == 32 || event.keyCode  == 37 || event.keyCode  == 39 || event.keyCode  == 46) );
	   
	});
	//alert(getWidth());
	//alert(getHeight());*/
	document.getElementById('loginDetailsDiv').setAttribute("style","width:"+getWidth()+"px");
	document.getElementById('loginDetailsDiv').setAttribute("style","height:"+getHeight()+"px");
});
function getWidth() {
	xWidth = null;
	if(window.screen != null)
	  xWidth = window.screen.availWidth;

	if(window.innerWidth != null)
	  xWidth = window.innerWidth;

	if(document.body != null)
	  xWidth = document.body.clientWidth;

	return xWidth;
}
function getHeight() {
	xHeight = null;
	if(window.screen != null)
	xHeight = window.screen.availHeight;

	if(window.innerHeight != null)
	xHeight =   window.innerHeight;

	if(document.body != null)
	xHeight = document.body.clientHeight;

	return xHeight-30;
}

function loginAccess() {
	var email_ID = document.getElementById("userName").value;
	var reg = /^\w+([-+.']\w+)*@\w+([-.]\w+)*\.\w+([-.]\w+)*$/
	if(document.getElementById("userName").value != "" && document.getElementById("password").value != "") {	
			if(document.getElementById("password").value != "") {
				document.getElementById("loginFormID").action=localStorage.contextPath+"/client/ci/auth";
				document.getElementById("loginFormID").method='POST';
				document.getElementById("loginFormID").submit();
			}
	}
	else {
		document.getElementById("alertMessage").innerText = "Fields Should Not Be Empty ";
	}
}

function showRegister(){
	document.getElementById("loginFormID").action=localStorage.contextPath+"/client/ci/registerNewUser";
	document.getElementById("loginFormID").method='POST';
	document.getElementById("loginFormID").submit();
}

function resetFields() {
	document.getElementById("userName").value = "";
	document.getElementById("password").value = "";
	document.getElementById("alertMessage").innerText = "";
}