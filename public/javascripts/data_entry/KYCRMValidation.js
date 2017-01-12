var angle = 90;
var imagesArray = new Array();
var imageNameArray = new Array();
var countValue = 1;
var currentImage;
var incArrayImage = 0;
var incArrayCount = 0;
var inc =0;

$(document).ready(function() {

    $(function () {
            imageNameArray = $('#availDocTypeName').val().split(',');
            var base64Array = $('#base64Image').val().split(',');
            if (base64Array.length > 0 && $('#base64Image').val() != 'undefined' ) {
                $('#errorLabelId').text('');
                $('#panelImage').remove();
                $("body").css("overflow-x", "hidden");
                /*$('#mainSplitter').jqxSplitter({ width: '100%', height: '800', panels: [
                    { size: '50%' },
                    { size: '50%' }
                ] });*/
                $('.buttonWrapper,.wrapper').show();
                newContent = '<div id="panelImage" class="viewer">';
                $(".wrapper").append(newContent).trigger('create');





                $('#imageName').text(imageNameArray[0]);
                var indexValue = 0;

                    $("#panelImage").iviewer({src: (base64Array[0] + "," + base64Array[1])});
                    for (var i = 0; i < base64Array.length / 2;) {
                        if (i == 0) {
                            imagesArray.push({image: (base64Array[indexValue] + "," + base64Array[indexValue + 1]), deg: 0});
                            indexValue++;
                        }
                        else {
                            imagesArray.push({image: (base64Array[indexValue + 1] + "," + base64Array[indexValue + 2]), deg: 0});
                            indexValue += 2;
                        }
                        i++;
                    }

            }
            else if ($('#status').val() == 'failure') {
                $('#errorLabelId').text('No documents found for this member');
            }
    });
    $('#next').click(function(){
        if(imagesArray.length > countValue){
            countValue++;
            $('#imageName').text(imageNameArray[countValue-1]);
            $("#panelImage").iviewer('loadImage', (imagesArray[countValue-1].image,imagesArray[countValue-1].image),imagesArray[countValue-1].deg);
        }
    });

    $('#previous').click(function(){
        if(countValue > 1){
            countValue--;
            $('#imageName').text(imageNameArray[countValue-1]);
            $("#panelImage").iviewer('loadImage', (imagesArray[countValue-1].image,imagesArray[countValue-1].image),imagesArray[countValue-1].deg);
        }
    });

    $("#rotateRight").click(function(){
        $("#panelImage").iviewer('angle', angle);
        rotateImage(angle,countValue-1)
    });
    $("#rotateLeft").click(function(){
        rotateImage(-angle,countValue-1)
    });

});

/*
 // Status 1 - Approved
    Status 0 - Reject
 */
function showKYCFormsForRMReview(clientId,status) {

   if($("#commentsByRMId").val().trim() == "" && status == 1){
        var errorLabelMember ="Please fill comments to approve the client"
        document.getElementById("errorLabelId").innerText = errorLabelMember;
   }
   else if($("#commentsByRMId").val().trim() == "" && status == 0){
       var errorLabelMember ="Please fill comments to reject the client"
       document.getElementById("errorLabelId").innerText = errorLabelMember;
   }
   else{
        $("#availDocTypeId").val("");
        $("#availDocTypeName").val("");
        $("#base64Image").val("");
       var data = {};
       data.clientId = clientId;
       data.status = status;
       data.commentsByRM = $("#commentsByRMId").val();
       data.groupId = $("#groupId").val();
       ajaxVariable = $.ajax({
           beforeSend : function() {
               $.mobile.showPageLoadingMsg();
           },
           complete: function() {
               $.mobile.hidePageLoadingMsg()
           },
           type: 'POST',
           data: JSON.stringify(data),
           contentType: 'application/json',
           url: "http://"+ajaxcallip+localStorage.contextPath+ "/client/ci/kycDocuments/" + clientId +"/"+ status ,
           success: function(data) {
               if(data.status == "failure"){
                   //document.getElementById("errorLabelId").innerText = data.errorMessage;
                   //$(window).scrollTop(0);
               }else{
                   if(status == 1) {
                       alert("Client Approved and Moved to Data Entry");
                   }else{
                       alert("Client Rejected");
                   }
                   document.getElementById("BMFormId").method = 'POST';
                   document.getElementById("BMFormId").action = localStorage.contextPath + "/client/ci/groups/operation/35";
                   document.getElementById("BMFormId").submit();
               }
           },error : function(jqXHR, textStatus, error) {
               document.getElementById("errorLabelId").innerText = "Error in Checking DuplicateName";
               $(window).scrollTop(0);
           }
       });

   }

}

function cancelKYCRMApproval(){
    document.getElementById("BMFormId").method = 'POST';
    document.getElementById("BMFormId").action = localStorage.contextPath + "/client/ci/groups/operation/35";
    document.getElementById("BMFormId").submit();
}