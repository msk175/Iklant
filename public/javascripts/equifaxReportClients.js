function downloadEquifaxReport(clientId){
	document.getElementById("reportformid").method='POST';
	document.getElementById("reportformid").action=localStorage.contextPath+'/client/ci/generateEquifaxReport/'+clientId+'/downloadClientEquifaxReport';
	document.getElementById("reportformid").submit();

}
function backToReportViewFormSubmit(){
    $.mobile.showPageLoadingMsg();
	document.getElementById("reportformid").method='POST';
	document.getElementById("reportformid").action=localStorage.contextPath+'/client/ci/generateEquifaxReport';
	document.getElementById("reportformid").submit();
}
