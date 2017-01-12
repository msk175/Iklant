function loanSanction(){
    $.mobile.showPageLoadingMsg();
    document.getElementById("BMFormId").method='POST';
    document.getElementById("BMFormId").action=localStorage.contextPath+"/client/ci/loanOffering";
    document.getElementById("BMFormId").submit();
}