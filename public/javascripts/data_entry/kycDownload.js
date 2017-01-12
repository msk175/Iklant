window.history.forward();
//$(document).live('pageshow',function() {
//showImage();
$(document).ready(function() {
	if($("#documentType").val() == MOMBookId || $("#documentType").val() == bankPassBookId) {
		$('#memberName').selectmenu('disable');
	}
	else {
		$('#memberName').selectmenu('enable');
	}
	
	$("#documentType").change(function() {
		if($("#documentType").val() == MOMBookId || $("#documentType").val() == bankPassBookId) {
			$('#memberName').selectmenu('disable');
		}
		else {
			$('#memberName').selectmenu('enable');
		}
	});
    $('#listoffice').on('change',function(){
        $.mobile.showPageLoadingMsg();
        document.getElementById("BMFormId").method='POST';
        document.getElementById("BMFormId").action=localStorage.contextPath+"/client/ci/groupsWhileOfficeChange/"+$('#listoffice').val()+"/"+$('#operationId').val();
        document.getElementById("BMFormId").submit();
    });
});


function showImage() {
	var downloadedImage=$("#downloadedImageId").val();
	var imgValue=$("#imageLabel").val();
	myWindow=window.open('','','width=1200,height=900');
	//myWindow.document.write("<p>This is 'myWindow'</p>");
    var script = "<html>" +
        " <head> " +
        "<link rel='stylesheet' href='/stylesheets/jquery.custom.css'>"+
        "<script type='text/javascript' src='/javascripts/jquery-1.8.3.min.js'> </script> " +
        "<script type='text/javascript' src='/javascripts/jquery-ui.js'> </script> " +

        "<script type='text/javascript' src='/javascripts/rotateImage.js'> </script>"+
        "<script type='text/javascript' > " +
        "var angle = 0;"+
        "function rotateImage(){"+
            "angle += 90;"+
            "$('#imageId').rotate(angle);"+
        "}"+
        "</script> "+
        "</head> " +
        "<body> " +
        "<input id='rotateButton' type='button' value='Rotate' onclick='javascript:rotateImage()'> "+
        "<img src="+$("#downloadedImageId"+imgValue).val()+" id='imageId' height='700' width='1200'>"+
        "<br>"+
        "</body> </html>";
    //myWindow.document.write("<input id='rotateButton' type='button' value='Rotate'>");
    myWindow.document.write(script);
    //myWindow.document.write("<img src="+$("#downloadedImageId"+imgValue).val()+" id='imageId' height='700' width='1100'>");
	myWindow.focus();


}

/*function changeMember(){
		var memberId=$("#memberName").val();
		$("#memberID").val("");
		$("#memberID").val(memberId);
		var documentTypeId=$("#documentType").val();
		$("#documentTypeID").val("");
		$("#documentTypeID").val(documentTypeId);
		alert($("#documentTypeID").val());
		var groupId=$("#groupID").val();
		$('#BMFormId').attr('method', 'POST'); 
		$('#BMFormId').attr('action', '/mfi/api/1.0/client/ci/kycdownload/groupId/'+groupId+'/kycdownload') ;
		$('#BMFormId').submit().refresh();
}*/


function downloadImage() {
	var groupId=$("#groupID").val();
	var memberId=$("#memberName").val();
	var documentTypeId=$("#documentType").val();
	if(documentTypeId == MOMBookId || documentTypeId == bankPassBookId) {
        $.mobile.showPageLoadingMsg();
		$("#documentTypeID").val("");
		$("#documentTypeID").val(documentTypeId);		
		document.getElementById("BMFormId").method='POST';
		document.getElementById("BMFormId").action=localStorage.contextPath+"/client/ci/kycdownload/groupId/"+groupId+"/kycdownload";
		document.getElementById("BMFormId").submit();
	}
	else if(memberId!=0 & documentTypeId!=0) {
        $.mobile.showPageLoadingMsg();
		$("#memberID").val("");
		$("#memberID").val(memberId);
		$("#documentTypeID").val("");
		$("#documentTypeID").val(documentTypeId);
		
		document.getElementById("BMFormId").method='POST';
		document.getElementById("BMFormId").action=localStorage.contextPath+"/client/ci/kycdownload/groupId/"+groupId+"/kycdownload";
		document.getElementById("BMFormId").submit();
	} else {
		alert("Select Both client Name and Document Type");
	}
}

function groupKYCDownload(groupId,groupName) {
    $.mobile.showPageLoadingMsg();
	GroupIdKYC =groupId;
	GroupNameKYC =groupName;
	var url=localStorage.contextPath+"/client/ci/kycdownload/groupId/"+groupId+"/kycdownload";
	document.getElementById("BMFormId").method='POST';
	document.getElementById("BMFormId").action=url;
	document.getElementById("BMFormId").submit();	
}

function cancelKYCDownload() {
    $.mobile.showPageLoadingMsg();
	document.getElementById("BMFormId").method='POST';
	document.getElementById("BMFormId").action=localStorage.contextPath+"/client/ci/groups/operation/"+kycDownloadingOperationId+"";
	document.getElementById("BMFormId").submit();
}