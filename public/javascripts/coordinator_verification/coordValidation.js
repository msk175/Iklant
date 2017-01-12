var angle = 90;
var imagesArray     = new Array();
var imageNameArray  = new Array();
var imageIdArray  = new Array();
var clientDocIdArray  = new Array();
var countValue = 1;
var countValueLeftPanel = 1;
var currentImage;
var incArrayImage = 0;
var incArrayCount = 0;
var inc =0;
var doctypeId = 1;
var imageDownload = 0;
var imageDocumentArray = new Array(3,5,6,8,7,9,12,14,0);
var globalClientId;
var actionIndexArray = new Array();
var rejectedDocuments = new Array();
var rejectedDocumentsRemarks = new Array();

$(document).ready(function() {

    $('#listofficeId').on('change',function(){
        if($('#listofficeId').val() != 0) {
            $.mobile.showPageLoadingMsg();
            document.getElementById("BMFormId").method='POST';
            document.getElementById("BMFormId").action=localStorage.contextPath+"/client/ci/verification/groupsWhileOfficeChange/"+$('#listofficeId').val();
            document.getElementById("BMFormId").submit();
        }
    });

    $(function () {
        $('#mainSplitter').jqxSplitter({ width: '100%', height: '800', panels: [
            { size: '50%' },
            { size: '50%' }
        ] });
    });
    $('#next').click(function(){
        if(imagesArray.length > countValueLeftPanel) {
            countValueLeftPanel++;
            if (imageNameArray[countValueLeftPanel - 1] == 'Application Form') {
                $('#imageName').text(imageNameArray[countValueLeftPanel - 1]);
                $("#panelImage").iviewer('loadImage', (imagesArray[countValueLeftPanel - 1].image), imagesArray[countValueLeftPanel - 1].deg);
            }else{
                countValueLeftPanel--;
            }
        }
    });

    $('#previous').click(function(){
        if(countValueLeftPanel > 1){
            countValueLeftPanel--;
            if (imageNameArray[countValueLeftPanel - 1] == 'Application Form') {
                $('#imageName').text(imageNameArray[countValueLeftPanel - 1]);
                $("#panelImage").iviewer('loadImage', (imagesArray[countValueLeftPanel - 1].image), imagesArray[countValueLeftPanel - 1].deg);
            }else{
                countValueLeftPanel++;
            }
        }
    });

    $('#nextRightPanel').click(function(){
        if(imagesArray.length > countValue) {
            countValue++;
            if($.inArray(clientDocIdArray[countValue-1], actionIndexArray) == -1){
                $('#imageNameRightPanel').text(imageNameArray[countValue - 1] );
                $('#footerRightPanel').text(imageNameArray[countValue - 1]);
            }
            else{
                $('#imageNameRightPanel').text(imageNameArray[countValue - 1] + " - Verified");
                $('#footerRightPanel').text(imageNameArray[countValue - 1] + " - Verified");
            }

            $("#panelImageRightPanel").iviewer('loadImage', (imagesArray[countValue - 1].image), imagesArray[countValue - 1].deg);
        }
    });
    $('#previousRightPanel').click(function(){
        if(countValue > 1){
            countValue--;
            if($.inArray(clientDocIdArray[countValue-1], actionIndexArray) == -1){
                $('#imageNameRightPanel').text(imageNameArray[countValue - 1] );
                $('#footerRightPanel').text(imageNameArray[countValue - 1]);
            }
            else{
                $('#imageNameRightPanel').text(imageNameArray[countValue - 1] + " - Verified");
                $('#footerRightPanel').text(imageNameArray[countValue - 1] + " - Verified");
            }
            $("#panelImageRightPanel").iviewer('loadImage', (imagesArray[countValue - 1].image), imagesArray[countValue - 1].deg);
        }
    });

    $("#rotateRight").click(function(){
        $("#panelImage").iviewer('angle', angle);
        rotateImage(angle,countValue-1)
    });
    $("#rotateLeft").click(function(){
        $("#panelImage").iviewer('angle', -angle);
        rotateImage(-angle,countValue-1)
    });
    $("#rotateRightPanel").click(function(){
        $("#panelImageRightPanel").iviewer('angle', angle);
        rotateImage(angle,countValue-1)
    });
    $("#rotateLeftRightPanel").click(function(){
        $("#panelImageRightPanel").iviewer('angle', -angle);
        rotateImage(-angle,countValue-1)
    });

});
function rotateImage(angle, arrayCount) {
    if (arrayCount in imagesArray) {
        imagesArray[arrayCount].deg += angle;
    }
}
function showClientDetailsForKYCVerification(groupId,groupName,screenFlag){

    $.mobile.showPageLoadingMsg();
    document.getElementById("BMFormId").method='POST';
    document.getElementById("BMFormId").action=localStorage.contextPath+"/client/ci/verification/group/clientList/"+groupId+"/"+screenFlag;
    document.getElementById("BMFormId").submit();


}

function cancelKYCVerification(){
    $.mobile.showPageLoadingMsg();
    document.getElementById("BMFormId").method='POST';
    document.getElementById("BMFormId").action=localStorage.contextPath+"/client/ci/verification/groupsWhileOfficeChange/" + $("#officeValueId").val();
    document.getElementById("BMFormId").submit();
}

function approveDocument(actionId){
    if(actionId == 1) {
        console.log(clientDocIdArray[countValue-1]);
        console.log($.inArray(clientDocIdArray[countValue-1], actionIndexArray));
        if($.inArray(clientDocIdArray[countValue-1], actionIndexArray) == -1){
            actionIndexArray.push(clientDocIdArray[countValue-1]);
        }else if($.inArray(clientDocIdArray[countValue-1], actionIndexArray) != -1) {
            var i = rejectedDocuments.indexOf(imageIdArray[countValue-1]);
            rejectedDocuments.splice(i,1);
            rejectedDocumentsRemarks.splice(i,1);
        }
        console.log();
        console.log("actionIndexArray : " + actionIndexArray);
        console.log("clientDocIdArray : " + clientDocIdArray[countValue-1]);
        console.log("rejectedDocuments : " + rejectedDocuments);
        $( "#nextRightPanel" ).trigger( "click" );
        $(window).scrollTop(0);
    }else{
        //document.getElementById("errorLabelId1").innerText = " ";
        /*var selectedReasonArray = new Array();
        for(var i=0;i<2;i++){
            if($('#reasonTypeId'+i).is(':checked') == true){
                //alert("checked: "+$('#documentTypeId'+i).val());
                selectedReasonArray.push($('#reasonTypeId'+i).val());
                //$('#reasonTypeId'+i).attr('checked', false);
                $('#reasonTypeId'+i).prop('checked', false).checkboxradio('refresh');
            }
        }*/
        //console.log("selectedReasonArray.length  : " + selectedReasonArray.length);
        //if(selectedReasonArray.length > 0) {
            if($.inArray(clientDocIdArray[countValue-1], actionIndexArray) == -1){
                actionIndexArray.push(clientDocIdArray[countValue-1]);
            }
            rejectedDocuments.push(imageIdArray[countValue-1]);
            //rejectedDocumentsRemarks.push(selectedReasonArray);
            console.log();
            console.log("actionId : "  + actionId);
            console.log("actionIndexArray : " + actionIndexArray);
            console.log("clientDocIdArray : " + clientDocIdArray[countValue-1]);
            console.log("rejectedDocuments : " + rejectedDocuments);
            //console.log("rejectedDocumentsRemarks : " + rejectedDocumentsRemarks);
            $( "#nextRightPanel" ).trigger( "click" );
            //document.getElementById('needImageClaritySaveId').href= "#mainSplitter";
            //$("#needImageClarityId").trigger('click');
            $(window).scrollTop(0);
        //}else{
        //    document.getElementById("errorLabelId1").innerText = "Select Reason for rejection";
        //}

    }
    if(actionIndexArray.length == imageIdArray.length) {
        if($("#roleId").val() !=  bmRoleId){
            updateClientStatus();
        }else{
            if(rejectedDocuments.length == 0) {
                document.getElementById("errMessage").innerText = "Kindly type remarks to send back Client to Data Entry ";
                document.getElementById('reject').href= "#reasonForReject";
                $("#reject").trigger('click');
            }else{
                //$("#alertMessage").text("Kindly type remarks to send back Client to FO");
                document.getElementById("errMessage").innerText = "Kindly type remarks to send back Client to FO";
                document.getElementById('reject').href= "#reasonForReject";
                $("#reject").trigger('click');
            }
        }
    }
}

function checkValidation(){

    if($("#bmRemarks").val().trim() == ""){
        document.getElementById("errorMessage").innerText = "Kindly fill remarks";
    }else{
        document.getElementById("errorMessage").innerText = "";
        updateClientStatus();
        $( "#reasonForReject" ).popup( "close" )
        //document.getElementById('needImageClaritySaveId').href= "#rightPanel";
        //$("#needImageClaritySaveId").trigger('click');
    }

}


function updateClientStatus(){

    document.getElementById('reject').href= "JavaScript:approveDocument(0)";
    if($("#roleId").val() ==  bmRoleId) {
        $("#bmRemarks").val("[BM]" + $("#bmRemarks").val().trim() +  $("#alertMessage").text());
    }else if(rejectedDocuments.length > 0) {
        $("#bmRemarks").val("[ACO]" + "Need Image Clarity");
    }else{
        $("#bmRemarks").val("(NULL)");
    }

    var uniqueRejectedDocumentId = new Array();
    var uniqueRejectedDocumentRemarks = new Array();

    console.log("Rejected Documents Before Removing Duplicates: " + rejectedDocuments);
    console.log("rejectedDocuments " + rejectedDocuments);
    $.each(rejectedDocuments, function(i, el){
        if($.inArray(el, uniqueRejectedDocumentId) === -1)
            uniqueRejectedDocumentId.push(el);
    });

    /*$.each(rejectedDocumentsRemarks, function(k, fl){
     console.log(fl);
     console.log($.inArray(fl, uniqueRejectedDocumentRemarks) === -1);
     if($.inArray(fl, uniqueRejectedDocumentRemarks) === -1)
     uniqueRejectedDocumentRemarks.push(fl);
     });*/

    console.log("Rejected Documents After Removing Duplicates : " + uniqueRejectedDocumentId);
    console.log("uniqueRejectedDocumentRemarks : " + uniqueRejectedDocumentRemarks);
    var memId = $("#memberName").val();
    var data = {};
    data.clientId = $("#memberName").val();
    data.groupId = $("#groupId").val();
    data.rejectedDocs = uniqueRejectedDocumentId;
    data.rejectedDocsRemarks = $("#bmRemarks").val();
    ajaxVariable = $.ajax({
        beforeSend : function() {
            //$.mobile.showPageLoadingMsg();
        },
        complete: function() {
            //$.mobile.hidePageLoadingMsg();
        },
        type: 'POST',
        data: JSON.stringify(data),
        contentType: 'application/json',
        url: "http://"+ajaxcallip+localStorage.contextPath+ "/client/ci/verification/client/updateVerificationClientStatus" ,
        success: function(data) {
            if(data.status == "failure"){
                //document.getElementById("errorLabelId").innerText = data.errorMessage;
                //$(window).scrollTop(0);
            }else{
                imagesArray.length = 0;
                imageNameArray.length = 0;
                imageIdArray.length = 0;
                clientDocIdArray.length = 0;
                actionIndexArray.length = 0;
                rejectedDocuments.length =0;
                rejectedDocumentsRemarks.length =0;
                imageDownload = 0;
                countValue = 1;
                $('#panelImage').remove();
                $('#panelImageRightPanel').remove();



                if(data.successMessage == "groupUpdatedSuccesfully"){
                    alert("KYC Verification Completed.Group Moved to Data Entry");
                    cancelKYCVerification();
                }else if(data.successMessage == "groupUpdatedSuccesfullyforneedImageClarity"){
                    alert("Group Moved to FO to Recapture rejected KYC Documents");
                    cancelKYCVerification();
                }
                else if(data.successMessage == "ClientUpdatedSuccesfully"){
                    $('.buttonWrapper,.wrapper').hide();
                    $('.buttonWrapperRightPannel,.wrapperRightPanel').hide();
                    $("#actionDiv").hide();
                    $.mobile.hidePageLoadingMsg();
                    $("#memberName option[value='"+memId+"']").remove();
                    $("#memberName").val(0).selectmenu("refresh");
                    $("#deoRemarksDiv").hide();
                    alert("Client Status Updated Succesfully");
                }else{
                    $.mobile.hidePageLoadingMsg();
                }

                $.mobile.hidePageLoadingMsg();
            }
        },error : function(jqXHR, textStatus, error) {
            document.getElementById("errorLabelId").innerText = "Error in Updating Client status";
            $(window).scrollTop(0);
        }
    });
}


function retrieveResolvedDocuments(){

    imagesArray.length = 0;
    imageNameArray.length = 0;
    imageIdArray.length = 0;
    clientDocIdArray.length = 0;
    actionIndexArray.length = 0;
    rejectedDocuments.length = 0;
    rejectedDocumentsRemarks.length = 0;
    imageDownload = 0;
    countValue = 1;
    $('#panelImage').remove();
    $('#panelImageRightPanel').remove();
    $('.buttonWrapper,.wrapper').hide();
    $('.buttonWrapperRightPannel,.wrapperRightPanel').hide();
    $("#actionDiv").hide();
    $('#deoRemarksDiv').hide();
    document.getElementById("errorLabelId").innerText = "";
    $("#bmRemarks").val("");

    globalClientId = $("#memberName").val();
    if(globalClientId != 0) {
        var data = {};
        data.clientId = $("#memberName").val();
        ajaxVariable = $.ajax({
            beforeSend: function () {
                $.mobile.showPageLoadingMsg();
            },
            complete: function () {
                $.mobile.hidePageLoadingMsg()
            },
            type: 'POST',
            data: JSON.stringify(data),
            contentType: 'application/json',
            url: "http://" + ajaxcallip + localStorage.contextPath + "/client/ci/verification/client/getResolvedKYCDocuments",
            success: function (data) {
                if (data.status == "failure") {
                    //document.getElementById("errorLabelId").innerText = data.errorMessage;
                    //$(window).scrollTop(0);
                } else {

                    if (data.clientKYCDocumentsForVerification.docImageList.length > 0) {
                        if (data.clientKYCDocumentsForVerification.clientId == globalClientId) {
                            $("#groupId").val(data.clientKYCDocumentsForVerification.groupId);

                            for (var i = 0; i < data.clientKYCDocumentsForVerification.docImageList.length; i++) {

                                $('#deoRemarksDiv').show();
                                document.getElementById("deoRemarks").innerText = data.clientKYCDocumentsForVerification.deoRemarks;
                                $('#alertMessage').text(data.clientKYCDocumentsForVerification.deoRemarks);

                                imagesArray.push({
                                    image: data.clientKYCDocumentsForVerification.docImageList[i],
                                    deg: 0
                                });
                                imageNameArray.push(data.clientKYCDocumentsForVerification.docNameList[i]);
                                imageIdArray.push(data.clientKYCDocumentsForVerification.docIdList[i]);
                                clientDocIdArray.push(data.clientKYCDocumentsForVerification.clientDocIdList[i]);
                            }
                            $('.buttonWrapper,.wrapper').show();
                            $('.buttonWrapperRightPannel,.wrapperRightPanel').show();
                            var newContent = '<div id="panelImage" class="viewer">';

                            $(".wrapper").append(newContent).trigger('create');
                            $("#panelImage").iviewer({src: (imagesArray[0].image)});
                            $('#imageName').text(imageNameArray[0]);
                            var newContentRightPanel = '<div id="panelImageRightPanel" class="viewer">';
                            $(".wrapperRightPanel").append(newContentRightPanel).trigger('create');
                            console.log(data.neededImageClarityDocs);
                            console.log(clientDocIdArray);
                            console.log(imageIdArray);
                            if (data.neededImageClarityDocs[0] == 3) {

                                $("#panelImageRightPanel").iviewer({src: (imagesArray[0].image)});
                                $('#imageNameRightPanel').text(imageNameArray[0]);
                                $('#footerRightPanel').text(imageNameArray[0]);
                            } else {
                                var index = imageIdArray.lastIndexOf(3);
                                for (var i = 0; i <= index; i++) {
                                    actionIndexArray.push(clientDocIdArray[i]);
                                }
                                countValue = index + 2;
                                $("#panelImageRightPanel").iviewer({src: (imagesArray[countValue-1].image)});
                                $('#imageNameRightPanel').text(imageNameArray[countValue-1]);
                                $('#footerRightPanel').text(imageNameArray[countValue-1]);
                            }
                            $("#actionDiv").show();
                        }
                    }else {
                        document.getElementById("errorLabelId").innerText = "No documents found for selected Client";
                    }
                }
            }, error: function (jqXHR, textStatus, error) {
                document.getElementById("errorLabelId").innerText = "Error in Retrieving documents";
                $(window).scrollTop(0);
            }
        });
    }else{
        $("#actionDiv").hide();
        imagesArray.length = 0;
        imageNameArray.length = 0;
        imageIdArray.length = 0;
        clientDocIdArray.length = 0;
        actionIndexArray.length = 0;
        rejectedDocuments.length =0;
        rejectedDocumentsRemarks.length =0;
        imageDownload = 0;
        countValue = 1;
        $('#panelImage').remove();
        $('#panelImageRightPanel').remove();
        $('.buttonWrapper,.wrapper').hide();
        $('.buttonWrapperRightPannel,.wrapperRightPanel').hide();
    }
}

function retrieveDocument(documentId) {
    if (documentId == 3) {
        imagesArray.length = 0;
        imageNameArray.length = 0;
        imageIdArray.length = 0;
        clientDocIdArray.length = 0;
        actionIndexArray.length = 0;
        rejectedDocuments.length = 0;
        rejectedDocumentsRemarks.length = 0;
        imageDownload = 0;
        countValue = 1;
        $('#panelImage').remove();
        $('#panelImageRightPanel').remove();
        $('.buttonWrapper,.wrapper').hide();
        $('.buttonWrapperRightPannel,.wrapperRightPanel').hide();
        $("#actionDiv").hide();
    }
    globalClientId = $("#memberName").val();
    if(globalClientId != 0) {
    if(documentId != 0) {
        var data = {};
        data.clientId = $("#memberName").val();
        data.documentId = documentId;
        ajaxVariable = $.ajax({
            beforeSend: function () {
                //$.mobile.showPageLoadingMsg();
            },
            complete: function () {
                //$.mobile.hidePageLoadingMsg()
            },
            type: 'POST',
            data: JSON.stringify(data),
            contentType: 'application/json',
            url: "http://" + ajaxcallip + localStorage.contextPath + "/client/ci/verification/client/getKYCDocuments",
            success: function (data) {
                if (data.status == "failure") {
                    //document.getElementById("errorLabelId").innerText = data.errorMessage;
                    //$(window).scrollTop(0);
                } else {
                    if (data.clientKYCDocumentsForVerification.docImageList.length > 0) {
                        if (data.clientKYCDocumentsForVerification.clientId == globalClientId) {
                            $("#groupId").val(data.clientKYCDocumentsForVerification.groupId);
                            for (var i = 0; i < data.clientKYCDocumentsForVerification.docImageList.length; i++) {
                                imagesArray.push({
                                    image: data.clientKYCDocumentsForVerification.docImageList[i],
                                    deg: 0
                                });
                                imageNameArray.push(data.clientKYCDocumentsForVerification.docNameList[i]);
                                imageIdArray.push(data.clientKYCDocumentsForVerification.docIdList[i]);
                                clientDocIdArray.push(data.clientKYCDocumentsForVerification.clientDocIdList[i]);
                            }


                            if (documentId == 3) {
                                $('.buttonWrapper,.wrapper').show();
                                $('.buttonWrapperRightPannel,.wrapperRightPanel').show();
                                var newContent = '<div id="panelImage" class="viewer">';

                                $(".wrapper").append(newContent).trigger('create');
                                $("#panelImage").iviewer({src: (imagesArray[0].image)});
                                $('#imageName').text(imageNameArray[0]);

                                var newContentRightPanel = '<div id="panelImageRightPanel" class="viewer">';
                                $(".wrapperRightPanel").append(newContentRightPanel).trigger('create');
                                $("#panelImageRightPanel").iviewer({src: (imagesArray[0].image)});
                                $('#imageNameRightPanel').text(imageNameArray[0]);
                                $('#footerRightPanel').text(imageNameArray[0]);

                                imageDownload = imageDownload + 1;
                                retrieveDocument(imageDocumentArray[imageDownload]);
                                $("#actionDiv").show();
                            } else {
                                imageDownload = imageDownload + 1;
                                retrieveDocument(imageDocumentArray[imageDownload]);
                            }
                        }
                     }else {
                        if (documentId == 3) {
                            document.getElementById("errorLabelId").innerText = "No documents found for Client " + $("#memberName option:selected").text();
                        }
                     }
                    }
               // } }
            }, error: function (jqXHR, textStatus, error) {
                document.getElementById("errorLabelId").innerText = "Error in retrieving documents";
                $(window).scrollTop(0);
            }
        });
    }else {
        console.log(imageIdArray);
        console.log(clientDocIdArray);

    }
    }else{
        $("#actionDiv").hide();
        imagesArray.length = 0;
        imageNameArray.length = 0;
        imageIdArray.length = 0;
        clientDocIdArray.length = 0;
        actionIndexArray.length = 0;
        rejectedDocuments.length =0;
        rejectedDocumentsRemarks.length =0;
        imageDownload = 0;
        countValue = 1;
        $('#panelImage').remove();
        $('#panelImageRightPanel').remove();
        $('.buttonWrapper,.wrapper').hide();
        $('.buttonWrapperRightPannel,.wrapperRightPanel').hide();

    }
}