$("#pageID").live('pagecreate',function() {

	if($('#formTypeId').val() != 2) {
		$('#loanTypeDiv').hide();
	}
	
	if($("#pathHidden").val() == 0) {
		$("#generatePDFId").hide();
	}
});

function generatePDF(groupId) {
	var prdcategoryid = $('#loantypeid').val();
	var formType = $('#formTypeId').val();
    if(prdcategoryid != 0 && formType != 0 || (formType == 1 && prdcategoryid == 0)) {
        $.mobile.showPageLoadingMsg();
		$('#prdidhidden').val(prdcategoryid);
		document.getElementById("BMFormId").method='POST';
		document.getElementById("BMFormId").action=localStorage.contextPath+"/client/ci/groups/member/loansanction/"+groupId+"/downloadPDF";
		document.getElementById("BMFormId").submit();
	}
	else if(formType == 0){
		$("#errorField").text("Select Form Type");
		$(window).scrollTop(0);
	}
	else {
		$("#errorField").text("Select Loan Product");
		$(window).scrollTop(0);
	}
}

function populateLoanType() {
var formType = $('#formTypeId').val();

	if(formType != 0) {
		if(formType == 1) {
			$('#loanTypeDiv').hide();
		}
        else if(formType == 2) {
            $('#loanTypeDiv').show();
        }
        else if(formType == 3) {
            $('#loanTypeDiv').hide();
        }
		else if(formType == 4) {
			$('#loanTypeDiv').hide();
		}
        else if(formType == 5) {
            $('#loanTypeDiv').hide();
        }
	}
}

function viewPDF(path) {
    $("#generatePDFId").href = path;
}
