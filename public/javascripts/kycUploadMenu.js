window.history.forward();
$(document).ready(function() {
	$("#isMultipleImageID").click(function(){
		if($("#isMultipleImageID").is(':checked')==true){
			$("#isMultipleDocumentId").val($(this).is(':checked'));
			$('#multipleUploadDocumentId').toggle();
			$('#singleUploadDocumentId').hide();
			$('#singleUploadDocumentId').val("");
		}
		else if($("#isMultipleImageID").is(':checked')==false){
			$("#isMultipleDocumentId").val($(this).is(':checked'));
			$('#multipleUploadDocumentId').hide();
			$('#singleUploadDocumentId').toggle();
			$('#multipleUploadDocumentId').val("");
		}
	});

	$("#uploadImageId").click(function(){
		var clientId=$('#clientNameId option:selected').val();
		var docTypeId=$('#docTypeId option:selected').val();
		var multipleFileUpload=$("#multipleUploadDocumentId").val();
		var singleFileUpload=$("#singleUploadDocumentId").val();
		
		if(clientId!=0 & docTypeId!=0){
			if(multipleFileUpload.length!=0 | singleFileUpload.length!=0){
				if($('#multipleUploadDocumentId').get(0).files.length==1){
					$("p").text("Uncheck Multiple images to upload single image");
					$(window).scrollTop(0);
				}else{
                    $.mobile.showPageLoadingMsg();
					$('#BMFormId').attr('method', 'POST'); 
					$('#BMFormId').attr('action', localStorage.contextPath+'/client/ci/groups/'+ $("#groupIdID").val()+'/kycuploadingImage') ;
					$('#BMFormId').submit();
				}
			}else{
				$("p").text("Please browse a file to upload");
				$(window).scrollTop(0);
			}
		}else{
			$("p").text("Select Both Client and Document Type");
			$(window).scrollTop(0);
		}			
	});
	
	$("#captureImageId").click(function(){
        $.mobile.showPageLoadingMsg();
		$('#BMFormId').attr('method', 'POST'); 
		$('#BMFormId').attr('action', localStorage.contextPath+'/client/ci/groups/'+ $("#groupIdID").val()+'/kycuploading') ;
		$('#BMFormId').submit();	
	});
		
	$("#cancelId").click(function(){
        $.mobile.showPageLoadingMsg();
		$('#BMFormId').attr('method', 'POST'); 
		$('#BMFormId').attr('action', localStorage.contextPath+'/client/ci/groups/operation/'+KYCUploadingOperationId+'') ;
		$('#BMFormId').submit();	
	});		
});

function kycSaveForUploadImage(group_id){
    $.mobile.showPageLoadingMsg();
	document.getElementById("BMFormId").action=localStorage.contextPath+"/client/ci/groups/kycUpload/"+group_id+"/savegroupkycUploadForUploadImage";
	document.getElementById("BMFormId").method="POST";
	document.getElementById("BMFormId").submit();
}

function skipKycUpload(group_id) {
    $.mobile.showPageLoadingMsg();
	document.getElementById("BMFormId").action=localStorage.contextPath+"/client/ci/groups/kycUpload/skipKyc/"+group_id+"";
	document.getElementById("BMFormId").method="POST";
	document.getElementById("BMFormId").submit();
}