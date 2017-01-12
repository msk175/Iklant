$(document).ready(function() {
	$("#remarks").keydown(function(event){
		return ( (event.keyCode == 57 && event.shiftKey) || (event.keyCode == 48 && event.shiftKey) ||(event.keyCode >= 65 && event.keyCode  <= 90) || (event.keyCode == 8 || event.keyCode  == 9 || event.keyCode  == 32 || event.keyCode  == 46|| event.keyCode  == 37 || event.keyCode  == 39 || event.keyCode  == 189) );
	});
    $("#remarksToReject").keydown(function(event){
        return ( (event.keyCode == 57 && event.shiftKey) || (event.keyCode == 48 && event.shiftKey) ||(event.keyCode >= 65 && event.keyCode  <= 90) || (event.keyCode == 8 || event.keyCode  == 9 || event.keyCode  == 32 || event.keyCode  == 46|| event.keyCode  == 37 || event.keyCode  == 39 || event.keyCode  == 189) );
    });
    $('#multipleDocDivId').hide();
    $("#isMultipleDocCheckID").click(function() {
        if($("#isMultipleDocCheckID").is(':checked')==true){
            $("#isMultipleDocumentId").val($(this).is(':checked'));
            $('#multipleDocDivId').show();
            $('#singleDocDivId').hide();
            $('#singleUploadDocumentId').val("");
        }
        else if($("#isMultipleDocCheckID").is(':checked')==false){
            $("#isMultipleDocumentId").val($(this).is(':checked'));
            $('#multipleDocDivId').hide();
            $('#singleDocDivId').show();
            $('#multipleUploadDocumentId').val("");
        }
    });
    $( "#uploadNOC" ).on( "popupafterclose", function( event, ui ) {
        $('#successmessage').hide();
        $('#errorLabel').hide();
        $("#errorMessage").text("");
        $('#normalMessage').show();
        $('#isMultipleDocCheckID').prop("checked",false).checkboxradio('refresh');
        $("#isMultipleDocumentId").val(false);
        $("#multipleUploadDocumentId").val("");
        $("#singleUploadDocumentId").val("");
    });
});	
/*function reintiateClient(){
var clientStatusId = $('#clientstatus').val();
var groupStatusId = $('#groupstatus').val();

	if( (clientStatusId == RejectedPriliminaryVerification && groupStatusId == preliminaryVerified)
			||(clientStatusId == RejectedFieldVerification && groupStatusId == FieldVerified)
				|| (clientStatusId == RejectedAppraisal && groupStatusId == FieldVerified)
					|| (clientStatusId == RejectedAppraisal && groupStatusId == appraisedStatus) 
						|| (clientStatusId == RejectedCreditBureauAnalysisStatusId && groupStatusId == creditBureauAnalysedStatus)
                            || (clientStatusId == RejectedCreditBureauAnalysisStatusId && groupStatusId == assignedFO)) {
		if($('#remarks').val() != ""){
			//alert("Reintiated");
            $.mobile.showPageLoadingMsg();
			document.getElementById("BMFormId").method='POST';
			document.getElementById("BMFormId").action=localStorage.contextPath+"/client/ci/groups/reintiateClient";
			document.getElementById("BMFormId").submit();
		}
		else{
			$("#errorField").text("Remarks To Reintiate Is Mandatory");
			$(window).scrollTop(0);
		}
	}
	else{
		if( (clientStatusId == RejectedPriliminaryVerification && groupStatusId > preliminaryVerified)){
			$("#errorField").text("Client cannot be Reinitiated Since the Group is KYCForm Uploaded");
			$(window).scrollTop(0);
		}
		else if( (clientStatusId == RejectedFieldVerification && groupStatusId > FieldVerified) ){
			$("#errorField").text("Client cannot be Reinitiated Since the Group is Appraised");
			$(window).scrollTop(0);
		}
		else if( (clientStatusId == RejectedAppraisal && groupStatusId > appraisedStatus) ) {
			$("#errorField").text("Client cannot be Reinitiated Since the Group is Authorized");
			$(window).scrollTop(0);
		}
		else if( (clientStatusId == RejectedCreditBureauAnalysisStatusId && groupStatusId > assignedFO) ){
			$("#errorField").text("Client cannot be Reinitiated Since the Group is Assigned FO");
			$(window).scrollTop(0);
		}
	}
}*/
function reintiateClient(){

var clientStatusId = $('#clientstatus').val();
var groupStatusId = $('#groupstatus').val();
    if($('#remarks').val() != ""){
        if( (clientStatusId == RejectedPriliminaryVerification && groupStatusId == preliminaryVerified)
                ||(clientStatusId == RejectedFieldVerification && groupStatusId == FieldVerified)
                    || (clientStatusId == RejectedAppraisal && groupStatusId == FieldVerified)
                        || (clientStatusId == RejectedAppraisal && groupStatusId == appraisedStatus)
                            || ((clientStatusId == RejectedCreditBureauAnalysisStatusId && groupStatusId == creditBureauAnalysedStatus)
                                || (clientStatusId == RejectedCreditBureauAnalysisStatusId && groupStatusId == FieldVerified))
                                    || (clientStatusId == RejectedFieldVerification && groupStatusId == assignedFO)
                                        ||(clientStatusId == rejectedInNextLoanPreCheck && groupStatusId == preliminaryVerified)
                                            || (clientStatusId == rejectedWhileIdleGroupsStatusId && groupStatusId == dataVerified)) {
            //if($('#remarks').val() != ""){
                //alert("Reintiated");
                $.mobile.showPageLoadingMsg();
                document.getElementById("BMFormId").method='POST';
                document.getElementById("BMFormId").action=localStorage.contextPath+"/client/ci/groups/reintiateClient";
                document.getElementById("BMFormId").submit();
            //}
        }
        else{
            var status_name = (groupStatusId == preliminaryVerified)? "KYCForm Uploading":
                                (groupStatusId == creditBureauAnalysedStatus)? "Assigning FO":
                                    (groupStatusId == FieldVerified)? "Appraisal":
                                        (groupStatusId == appraisedStatus)? "Authorization":
                                            (groupStatusId == assignedFO)? "Appraisal":
                                                (groupStatusId == "" || groupStatusId == null)?"Waiting for next loan pre check":"Already Appraised";
            $("#errorField").text("Client cannot be Reinitiated Since the Group is "+status_name);
            $(window).scrollTop(0);
        }
    }
    else{
        $("#errorField").text("Remarks To Re-initiate Is Mandatory");
        $(window).scrollTop(0);
    }
}
function downloadClientDocuments(docId,clientId){
	var data = {};
	data.docId = docId;
	data.clientId = clientId;
	$.ajax({
			type  : 'POST',
			data  : JSON.stringify(data),
			async : false,
			contentType: 'application/json',
			url: 'http://'+ajaxcallip+localStorage.contextPath+'/client/ci/rejectedClient/retrieveDocumentList',
			beforeSend : function() { 
				$.mobile.showPageLoadingMsg(); 
			},
			complete: function() { 
				$.mobile.hidePageLoadingMsg() 
			},
			success: function(success) {
				 var fileLocation = success.fileLocation;
				 $("#documents").val('0').selectmenu("refresh");
				document.getElementById('documents').options.length = 0;
				var combo1 = document.getElementById("documents");

				option = document.createElement("option");
				option.text = "Select Doc";
				option.value ="0";
				 try {
					combo1.add(option, null); //Standard 
				}catch(error) {
					combo1.add(option); // IE only
				}
				for(var i=0;i<fileLocation.length;i++){
					var combo = document.getElementById("documents");
					option = document.createElement("option");
					option.text = "Document" + (i+1);
					option.value =fileLocation[i];
					try {
						combo.add(option, null); //Standard 
					}catch(error) {
						combo.add(option); // IE only
					}
				}
			},
			error : function(jqXHR, textStatus, error) {
				//alert("asdf");
            }	
		});
}
function downloadDocuments(documentPath){
	document.getElementById("documentPath").value=documentPath;
	document.getElementById("BMFormId").method='POST';
	document.getElementById("BMFormId").action=localStorage.contextPath+'/client/ci/downloadDocs';
	document.getElementById("BMFormId").submit();
}
function retrieveRejectedClientList(){
	document.getElementById("BMFormId").method='POST';
	document.getElementById("BMFormId").action=localStorage.contextPath+'/client/ci/groups/operation/'+rejectedClientOperationId;
	document.getElementById("BMFormId").submit().refresh();
}
function openNOCPopup(clientsId,clientName,buttonId){
    $(window).scrollTop(0);
    $('#successmessage').hide();
    $('#errorLabel').hide();
    $("#errorMessage").text("");
    $('#normalMessage').show();
    $('#selectedClientForNOCUpload').val(clientsId);
    $('#selectedClientNameForNOCUpload').val(clientName);
    document.getElementById(buttonId).href= "#uploadNOC";
    $("#"+buttonId).trigger('click');
}
function uploadNOC(groupId){
    var multipleFileUpload=$("#multipleUploadDocumentId").val();
    var singleFileUpload=$("#singleUploadDocumentId").val();
    if(multipleFileUpload.length!=0 || singleFileUpload.length!=0) {
        $('#normalMessage').hide();
        $('#errorMessage').hide();
        var fileSize = ($("#multipleUploadDocumentId").val() == "") ? Math.round(($("#singleUploadDocumentId")[0].files[0].size / 1024) / 1024) : Math.round(($("#multipleUploadDocumentId")[0].files[0].size / 1024) / 1024);
        if (fileSize > 100) {
            $("#multipleUploadDocumentId").val("");
            $("#singleUploadDocumentId").val("");
            $('#normalMessage').hide();
            $('#errorMessage').show();
            $("#errorMessage").text("File size should not exceeds 100 MB");
            $(window).scrollTop(0);
        }
        else if ($('#multipleUploadDocumentId').get(0).files.length == 1) {
            $("#multipleUploadDocumentId").val("");
            $('#normalMessage').hide();
            $('#errorMessage').show();
            $("#errorMessage").text("Uncheck Multiple Files to upload Single File");
            $(window).scrollTop(0);
        }
        else{
            document.getElementById("BMFormId").method='POST';
            document.getElementById("BMFormId").action=localStorage.contextPath+"/client/ci/groups/cca1/uploadNOC";
            document.getElementById("BMFormId").submit();
        }
    }
    else{
        $('#normalMessage').hide();
        $('#errorMessage').show();
        $('#errorMessage').text("Please select file/files to upload");
    }
}
function rejectClient(clientsId){
    document.getElementById("rejectedClientID").value = clientsId;
    $.mobile.showPageLoadingMsg();
    document.getElementById("BMFormId").action = localStorage.contextPath+"/client/ci/groups/cca1/rejectClients";
    document.getElementById("BMFormId").method = "POST";
    document.getElementById("BMFormId").submit().refresh();
}
