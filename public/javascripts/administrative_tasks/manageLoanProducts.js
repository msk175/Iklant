/**
 * Created by kumaran on 3/12/2015.
 */
function SubmitForm(productId){
    $.mobile.showPageLoadingMsg();
    document.getElementById("administrativeLoanProductFormID").method='POST';
    document.getElementById("administrativeLoanProductFormID").action=localStorage.contextPath+"/client/ci/loanproduct/listloanproduct/"+productId;
    document.getElementById("administrativeLoanProductFormID").submit();
}
