function getClientListForCreditReport(groupId) {
    $.mobile.showPageLoadingMsg();
    var url=localStorage.contextPath+"/client/ci/groups/member/creditreport/"+groupId;
    var form="BMFormId";
    document.getElementById(form).method='POST';
    document.getElementById(form).action=url;
    document.getElementById(form).submit();
}
var inc =0;
var otherMfiNameArray = new Array();
var incArrayCount = 0;
$(document).ready(function() {
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
    clientId = $('#clientName').val();
    if(clientId == 0) {
        $('#personalInformationDiv').hide();
        $('#reportInformationDiv').hide();
        $('#creditBureauAnalysis').hide();
        $('#otherMFILoanDetails').hide();
        $('#repaymentTrackRecordDetails').hide();
    }

    $("#addOtherMfiLoanSaveId").click(function(){

        var otherMfiErrorLabelPopup = "Please Fill Other MFI Name";
        if($("#mfiName").val()=="" ){
            $("#otherMfiErrorLabelPopupId").text(otherMfiErrorLabelPopup);
            $("a#addOtherMfiLoanSaveId").attr('href','');
        }
        else{
            var newContent = '<div data-role="content" data-theme="a" class="content-primary">';
            newContent += '<ul data-role="listview" data-split-theme="a" data-inset="true" id="ulId">';
            newContent += '<li>';
            newContent += '<a href="">';
            newContent += "<label for='name'"+inc+" id='name"+inc+"'>"+$("#mfiName").val()+"</label>";
            newContent += '<a href="", onclick="removeOtherMfiClient(this,'+inc+')", data-icon="delete">';
            newContent += '</a>';
            newContent += '</a>';
            newContent += '</li>';
            newContent += '</ul>';
            newContent += '</div>';
            $("#otherMfiLoanDivId").append(newContent).trigger('create');

            otherMfiNameArray.push($("#mfiName").val());
            $("#OtherMfiNameHiddenId").val(otherMfiNameArray);

            $("a#addOtherMfiLoanSaveId").attr('href','#addOtherMfiLoans');
            //clearing all value
            $("#mfiName").val('');
            $("#otherMfiErrorLabelPopupId").text("");

            inc++;
            incArrayCount++;
        }
    });

    //validation for clearing all datas on cancel button click
    $("#addOtherMfiLoanCancelId").click(function(){
        $("#mfiName").val('');
        $("#otherMfiErrorLabelPopupId").text("");
    });
    $("#mfiName").keydown(function(event){
        if (!( (event.keyCode >= 65 && event.keyCode  <= 90) || (event.keyCode == 8 || event.keyCode  == 9 || event.keyCode  == 32 || event.keyCode  == 46 || event.keyCode  == 37 || event.keyCode  == 39 ) )) {
            event.preventDefault();
        }
    });
    $('#listoffice').on('change',function(){
        $.mobile.showPageLoadingMsg();
        document.getElementById("BMFormId").method='POST';
        document.getElementById("BMFormId").action=localStorage.contextPath+"/client/ci/groupsWhileOfficeChange/"+$('#listoffice').val()+"/"+$('#operationId').val();
        document.getElementById("BMFormId").submit();
    });

    $('#expand').click(function(){
        $(".collapsible_content").trigger('expand');
    })
    $('#collapse').click(function(){
        $(".collapsible_content").trigger('collapse');
    })

    if ($("#clientName").val() == 0) {
        $("#collapseButtonDiv,.updatedDetails").hide();
    }

    $('#repaymentTrackRecord').on('change',function(){
        if($('#repaymentTrackRecord').val() == 80) {
            $("#rejectConfirmationId").popup("open");
            $('#saveGroupId').hide();
        }
    });

    $('#yesRejectId').click(function(){
        if($('#reasonForRejection').val().trim() != ''){
            $("#rejectConfirmationId" ).popup( "close" );
            $('#saveGroupId').show();
        }
        else{
            $('#popupError').text('Please fill the reason');
        }
    });

    $('#noRejectId').click(function() {
        $('#saveGroupId').show();
        $("#rejectConfirmationId" ).popup( "close" );
        $("#repaymentTrackRecord").val('0').selectmenu("refresh");
    });

    $("#reasonForRejection").keydown(function(event){
        return ((event.keyCode > 64 && event.keyCode < 91) || (event.keyCode > 96 && event.keyCode < 123) || event.keyCode == 8 || event.keyCode == 9  || event.keyCode == 32 || event.keyCode == 46 || event.keyCode == 190 || event.keyCode == 191 || event.keyCode == 188 || (event.keyCode >= 37 && event.keyCode <= 45) || (event.keyCode >= 48 && event.keyCode <= 57));
    });

    $( "#rejectConfirmationId" ).on( "popupafterclose", function( event, ui ) {
        if($('#reasonForRejection').val().trim() == '')
            $("#repaymentTrackRecord").val('0').selectmenu("refresh");
        $('#reasonForRejection').val("");
    })

});
function memberNameOnchangeInCreditBureau(){
    clientId = document.getElementById("clientName").value;
    if(clientId != 0) {
        $.mobile.showPageLoadingMsg();
        document.getElementById("BMFormId").method='POST';
        document.getElementById("BMFormId").action=localStorage.contextPath+"/client/ci/groups/creditBureau/"+clientId+"/analysis";
        document.getElementById("BMFormId").submit().refresh;
    }
}
function saveCreditBureauAnalysis() {
    var validFileSize = 100;
    $("#submitDivId").hide();
    clientId = document.getElementById("clientName").value;
    if(clientId !=0) {
        var multipleFileUpload=$("#multipleUploadDocumentId").val();
        var singleFileUpload=$("#singleUploadDocumentId").val();
        var isValidFile = false;

        for(var i=0; i<$('#multipleUploadDocumentId').get(0).files.length; i++){
            fileName = $("#multipleUploadDocumentId")[0].files[i].name;
            if(fileName.substring(fileName.lastIndexOf('.') + 1).toLowerCase() == "pdf" || fileName.substring(fileName.lastIndexOf('.') + 1).toLowerCase() == "docx" || fileName.substring(fileName.lastIndexOf('.') + 1).toLowerCase() == "doc" || fileName.substring(fileName.lastIndexOf('.') + 1).toLowerCase() == "xlsx" || fileName.substring(fileName.lastIndexOf('.') + 1).toLowerCase() == "xls"){
                isValidFile = true;
                break;
            }
            else{
                isValidFile = false;
            }
        }

        if(singleFileUpload.substring(singleFileUpload.lastIndexOf('.') + 1).toLowerCase() == "pdf" || singleFileUpload.substring(singleFileUpload.lastIndexOf('.') + 1).toLowerCase() == "docx" || singleFileUpload.substring(singleFileUpload.lastIndexOf('.') + 1).toLowerCase() == "doc" || singleFileUpload.substring(singleFileUpload.lastIndexOf('.') + 1).toLowerCase() == "xlsx" || singleFileUpload.substring(singleFileUpload.lastIndexOf('.') + 1).toLowerCase() == "xls"){
            isValidFile = true;
        }

        if (!isValidFile) {
            $("#multipleUploadDocumentId").val("");
            $("#singleUploadDocumentId").val("");
            $("#errorField").text("Please select valid files");
            $("#submitDivId").show();
            $(window).scrollTop(0);
        }
        else if(multipleFileUpload.length!=0 || singleFileUpload.length!=0){
            var fileSize = ($("#multipleUploadDocumentId").val() == "")?Math.round(($("#singleUploadDocumentId")[0].files[0].size/1024)/ 1024):Math.round(($("#multipleUploadDocumentId")[0].files[0].size/1024)/ 1024);
            if(fileSize > validFileSize){
                $("#multipleUploadDocumentId").val("");
                $("#singleUploadDocumentId").val("");
                $("#errorField").text("File size should not exceeds 100 MB");
                $("#submitDivId").show();
                $(window).scrollTop(0);
            }
            else if($('#multipleUploadDocumentId').get(0).files.length==1){
                $("#submitDivId").show();
                $("#errorField").text("Uncheck Multiple Files to upload Single File");
                $(window).scrollTop(0);
            }
            else if($('#repaymentTrackRecord').val() !=0) {
                otherMfiNameArray  = $.grep(otherMfiNameArray ,function(n){return(n);});
                $("#OtherMfiNameHiddenId").val(otherMfiNameArray);
                //var url=localStorage.contextPath+"/client/ci/groups/creditBureau/saveRepaymentTrack/"+clientId;
               // var form="BMFormId";
                $.mobile.showPageLoadingMsg();
                document.getElementById("BMFormId").method='POST';
                document.getElementById("BMFormId").action=localStorage.contextPath+"/client/ci/groups/creditBureau/saveRepaymentTrack/"+clientId+"";
                document.getElementById("BMFormId").submit();
            } else {
                $("#submitDivId").show();
                $("#errorField").text("Please fill Repayment Track Record");
                $( "#repaymentTrackRecordDetails").trigger( "expand" );
                $(window).scrollTop(0);
            }
        }else {
            $("#submitDivId").show();
            $("#errorField").text("Please browse a file to upload");
            $( "#repaymentTrackRecordDetails").trigger( "expand" );
            $(window).scrollTop(0);
        }/*if(singleFileUpload.length!=0){
         if($('#repaymentTrackRecord').val() !=0) {
         otherMfiNameArray  = $.grep(otherMfiNameArray ,function(n){return(n);});
         $("#OtherMfiNameHiddenId").val(otherMfiNameArray);
         var url=localStorage.contextPath+"/client/ci/groups/creditBureau/saveRepaymentTrack/"+clientId;
         var form="BMFormId";
         document.getElementById(form).method='POST';
         document.getElementById(form).action=url;
         document.getElementById(form).submit();
         } else {
         $("#submitDivId").show();
         $("#errorField").text("Please fill Repayment Track Record");
         $( "#repaymentTrackRecordDetails").trigger( "expand" );
         $(window).scrollTop(0);
         }
         } else {
         $("#submitDivId").show();
         $("#errorField").text("Please browse a file to upload");
         $( "#repaymentTrackRecordDetails").trigger( "expand" );
         $(window).scrollTop(0);
         }*/

    } else {
        $("#successMessage").hide();
        $("#submitDivId").show();
        $("#errorField").text("Please Select a Member Name");
        $(window).scrollTop(0);
    }
}

function removeOtherMfiClient(remove,i){
    r=remove.parentNode.parentNode;
    r.parentNode.removeChild(r);
    otherMfiNameArray[i]="";
    $('#OtherMfiNameHiddenId').val(otherMfiNameArray);
    incArrayCount--;
    //alert("CountDynamicRemove = "+incArrayCount);

}
function numeric(currentVal){
    var regex = /[^0-9]+/g;
    if(regex.test(currentVal.value)) {
        currentVal.value = currentVal.value.replace(regex, '')
    }
}

// Added Paramasivan for back previous operation
function cancelCreditCheck() {
    $.mobile.showPageLoadingMsg();
    document.getElementById("BMFormId").method='POST';
    document.getElementById("BMFormId").action=localStorage.contextPath+"/client/ci/groups/operation/"+creditBureauAnalysedOperationId+"";
    document.getElementById("BMFormId").submit();
}
