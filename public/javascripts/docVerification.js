//function to retrieve client documents list
function downloadClientDocuments(docId,clientId){
	//alert("docId "+docId+" clientId "+clientId);
    //$.mobile.showPageLoadingMsg();
	document.getElementById("BMFormId").method='POST';
	document.getElementById("BMFormId").action=localStorage.contextPath+'/client/ci/generateClientDocuments/'+clientId+'/'+docId+'/downloadUploadedImages';
	document.getElementById("BMFormId").submit();
}
//function to download docs
function downloadDocs(selectedDocLocation){
    //$.mobile.showPageLoadingMsg();
	document.getElementById("selectedDocId").value=selectedDocLocation;
	document.getElementById("BMFormId").method='POST';
	document.getElementById("BMFormId").action=localStorage.contextPath+'/client/ci/downloadDocs';
	document.getElementById("BMFormId").submit();
}
//generic method for back button
function back(){
	//alert("sdfsd");
	var docVerificationFlag  = 	document.getElementById("docVerificationFlagId").value;
	var iklantGroupId		 =  document.getElementById("iklantGroupIdHiddenDocVerId").value;	
	var isSynchronized		 =  document.getElementById("isSynchronizedHiddenDocVerId").value;
	var mifosCustomerId 	 =  document.getElementById("mifosCustomerIdHiddenDocVerId").value;
	//for docVerification groupList report management
	if(docVerificationFlag==1){
        $.mobile.showPageLoadingMsg();
		document.getElementById("BMFormId").method='POST';
		document.getElementById("BMFormId").action=localStorage.contextPath+'/client/ci/reportManagement/docVerificationGroupList';
		document.getElementById("BMFormId").submit();
	}else{
		//for loanSanction docVerification
		getClientListForLoanSanction(iklantGroupId,isSynchronized,mifosCustomerId);
	}
	
}