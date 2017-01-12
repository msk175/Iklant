window.history.forward();
//Jagan
function operationSubmit(operationId) {
    $.mobile.showPageLoadingMsg();
	document.getElementById("BMFormId").method='POST';
	document.getElementById("BMFormId").action=localStorage.contextPath+"/client/ci/groups/operation/"+operationId;
	document.getElementById("BMFormId").submit();
}
function operationSubmitFromBM(operationId) {
    $.mobile.showPageLoadingMsg();
	document.getElementById("BMFormId").method='POST';
	document.getElementById("BMFormId").action=localStorage.contextPath+"/client/ci/groups/operation/"+operationId;
	document.getElementById("BMFormId").submit();
}

function showPreliminaryVerificationForm(grp){
    $.mobile.showPageLoadingMsg();
	var url=localStorage.contextPath+"/client/ci/groups/"+grp+"/preVerification";
	document.getElementById("BMFormId").method='POST';
	document.getElementById("BMFormId").action=url;
	document.getElementById("BMFormId").submit();
}

function editGroupFormSubmission(groupIdLabelValue) {
    $.mobile.showPageLoadingMsg();
	document.getElementById("groupId").value=groupIdLabelValue;
	var url=localStorage.contextPath+"/client/ci/groups/"+groupIdLabelValue;
	var form="BMFormId";
	document.getElementById(form).method='POST';
	document.getElementById(form).action=url;
	document.getElementById(form).submit();
}

function getClientListForLoanSanctionForms(groupid,isSynchronized,mifosCustomerId) {
    $.mobile.showPageLoadingMsg();
	document.getElementById("BMFormId").method='POST';
	document.getElementById("BMFormId").action=localStorage.contextPath+'/client/ci/groups/member/synchronizedpage/'+groupid+'/'+isSynchronized+'/'+mifosCustomerId+'/upload';
	document.getElementById("BMFormId").submit();
}

function branchGroupsDisplaySynchronized(selectThis) {
	var officeId = selectThis.value;
    $('#docLanguage').val(($('#branchName option:selected').attr('rel')));
	if(officeId!=0) {
        $.mobile.showPageLoadingMsg();
		document.getElementById("BMFormId").method='POST';
		document.getElementById("BMFormId").action=localStorage.contextPath+"/client/ci/groups/synchronizedpageonchange/"+synchronizedOperationId+"/"+officeId;
		document.getElementById("BMFormId").submit().refresh();
	}
}

/*function getMemberDetails(val,i){
	document.getElementById("memberId").value=document.getElementById("labelMemberId"+i).innerHTML;
	document.getElementById("memberNameId").value=document.getElementById("memberName"+i).innerHTML;
}*/


/*function memberAddFormSubmission(){
	var groupId=document.getElementById("groupId").value;
	var memberNameId=document.getElementById("addMemberNameId").value;
	document.getElementById("memberNameId1").value=memberNameId;
	var url=localStorage.contextPath+"/client/ci/groups/"+groupId+"/memberscreate";
	var form="memberFormID";
	document.getElementById(form).method='POST';
	document.getElementById(form).action=url;
	document.getElementById(form).submit();
}*/

/*function memberUpdateFormSubmission() {
	var groupId=document.getElementById("groupId").value;
	var memberNameId=document.getElementById("memberNameId").value;
	var memberId=document.getElementById("memberId").value;
	document.getElementById("memberNameId1").value=memberNameId;
	var url=localStorage.contextPath+"/client/ci/groups/"+groupId+"/membersupdate/"+memberId;
	var form="memberFormID";
	document.getElementById(form).method='POST';
	document.getElementById(form).action=url;
	document.getElementById(form).submit();
}*/

/*function memberDeleteFormSubmission() {
	var groupId=document.getElementById("groupId").value;
	var memberNameId=document.getElementById("memberNameId").value;
	var memberId=document.getElementById("memberId").value;
	var url=localStorage.contextPath+"/client/ci/groups/"+groupId+"/membersdelete/"+memberId;
	var form="memberFormID";		
	document.getElementById("memberNameId1").value=memberNameId;
	document.getElementById("memberFormID").method='POST';
	document.getElementById(form).action=url;
	document.getElementById(form).submit();
}*/

/*function redirectHomeFromLayout(){
	document.getElementById("memberFormID").action=localStorage.contextPath+"/client/ci/groups";
	document.getElementById("memberFormID").method='GET';
	document.getElementById("memberFormID").submit();
}

function redirectHomeFromDialog(){
	document.getElementById("dialogFormID").action=localStorage.contextPath+"/client/ci/groups";
	document.getElementById("dialogFormID").method='GET';
	document.getElementById("dialogFormID").submit();
}*/

//create groups(Add Button)

/*var clientame = new Array();
var overue = new Array();

function createGroupSave() {
		
	var button=document.getElementById("buttonID").value;
	if(button=="Add"){
		if(document.getElementById("bankAccountCheck").checked){
		if(document.getElementById("groupName").value.trim().length == 0 | 
			document.getElementById("createdDatePicker").value.trim().length == 0 |
			document.getElementById("lastActiveDate").value.trim().length == 0 |
			document.getElementById("accountNumber").value.trim().length == 0 |
			document.getElementById("accountCreatedDate").value.trim().length == 0){
			document.getElementById('errorField').innerText = 'Please Fill Mandatory Fields';
		}
		else{
		//document.getElementById("cnameid").value = clientame;
		//document.getElementById("overdueid").value = overue;
		document.getElementById("dialogFormID").action=localStorage.contextPath+"/client/ci/groupscreate";
		document.getElementById("dialogFormID").method='POST';
		document.getElementById("dialogFormID").submit();
		}
		}
		else if( (document.getElementById("groupName").value.trim().length == 0 | 
			document.getElementById("createdDatePicker").value.length == 0 |
			document.getElementById("lastActiveDate").value.length == 0)){
			document.getElementById('errorField').innerText = 'Please Fill Mandatory Fields';
		}
		else{
		//document.getElementById("cnameid").value = clientame;
		//document.getElementById("overdueid").value = overue;
		document.getElementById("dialogFormID").action=localStorage.contextPath+"/client/ci/groupscreate";
		document.getElementById("dialogFormID").method='POST';
		document.getElementById("dialogFormID").submit();
		}
	}
	else if(button=="edit"){
		var groupId=document.getElementById("groupId").value;
		
		//document.getElementById("cnameid").value = clientame;
		//document.getElementById("overdueid").value = overue;
		document.getElementById("dialogFormID").action=localStorage.contextPath+"/client/ci/groups/"+groupId+"/updategroup";
		document.getElementById("dialogFormID").method='POST';
		document.getElementById("dialogFormID").submit();
	}
	//document.getElementById("formID").submit();
}
function createGroupAdd() {		
	clientame.push(document.getElementById("clientName").value);
	overue.push(document.getElementById("over").value);
}

function deleteGroup(){
	var groupId=document.getElementById("groupId").value;
	document.getElementById("dialogFormID").action=localStorage.contextPath+"/client/ci/groups/"+groupId+"/deletegroup";
	document.getElementById("dialogFormID").method='POST';
	document.getElementById("dialogFormID").submit();
}

function hideButton(){
}*/
function getClientListForLoanSanctionForms(groupid,isSynchronized,mifosCustomerId) {
    $.mobile.showPageLoadingMsg();
	document.getElementById("BMFormId").method='POST';
	document.getElementById("BMFormId").action=localStorage.contextPath+'/client/ci/groups/member/synchronizedpage/'+groupid+'/'+isSynchronized+'/'+mifosCustomerId+'/upload';
	document.getElementById("BMFormId").submit();
}
/*function branchGroupsDisplaySynchronized(selectThis) {
	var officeId = selectThis.value;
	if(officeId!=0) {
        $.mobile.showPageLoadingMsg();
		document.getElementById("BMFormId").method='POST';
		document.getElementById("BMFormId").action=localStorage.contextPath+"/client/ci/groups/synchronizedpageonchange/"+synchronizedOperationId+"/"+officeId;
		document.getElementById("BMFormId").submit().refresh();
	}
} */

function getIdleGroupInformation (groupId,statusId) {
	$.mobile.showPageLoadingMsg();
	$('#statusId').val(statusId);
	document.getElementById("BMFormId").method='POST';
	document.getElementById("BMFormId").action=localStorage.contextPath+"/client/ci/idleGroups/"+groupId+"/listClients";
	document.getElementById("BMFormId").submit();
}

function showKYCFormsForRMReview(clientId){
	document.getElementById("BMFormId").method = 'POST';
	document.getElementById("BMFormId").action = localStorage.contextPath + "/client/ci/kycDocuments/" + clientId;
	document.getElementById("BMFormId").submit();
}