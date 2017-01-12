$(document).ready(function() {
	$("#fictionId0").hide();
	$("#yesId").click(function(){
        $( "#paymentVerifiedId" ).popup("close");
		doPaymentVerification();
		//document.getElementById("paymentVerificationFormId").method='POST';
		//document.getElementById("paymentVerificationFormId").action=localStorage.contextPath+"/client/ci/loanrecovery/doPaymentVerification";
		//document.getElementById("paymentVerificationFormId").submit();	
	});
	$("#noId").click(function(){
		//var rowIndex = $("#rowIndexId").val();
 		$( "#paymentVerifiedId" ).popup("close");

		//alert(rowIndex);
		//document.getElementById('actionId'+(rowIndex-1)).href= "JavaScript:doPaymentVerificationFormSubmission("+rowIndex+","+$("#isApplyPaymentId").val()+")";
	});
	$("#savemismatch").click(function(){
		if($("#rcptnumber").is(':checked') | $("#amountmismatchId").is(':checked')){
			$("#errorId").text("");
			$("a#savemismatch").attr('href','#menu');
		}
		else {
			$("#errorId").text("Please Select Mismatch Reason");
			$("a#savemismatch").attr('href','');
		}
	});

});

var clientListcurrentrow = 0;
var clientListmaxrows = 0;
var clientListPageNo = 1;

function showClientList(j,paymentId,groupName) {
    //alert("j==" + j);
    //alert("paymentId==" + paymentId);
    var data = {};
    data.paymentId = paymentId;
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
        url: 'http://'+ajaxcallip+localStorage.contextPath+'/client/ci/retrieveClientAmountDetails',
        success: function(data) {
            //alert("success" +data );
            $('table').remove('#clientListTableId');
            var newContent = '<table id="clientListTableId">';
            $("#clientListDivId").append(newContent).trigger('create');
            var newContent ='<tr>';
            newContent+='<th>';
            newContent+= "S.NO";
            newContent+='</th>';
            newContent+='<th>';
            newContent+= "Client Name";
            newContent+='</th>';
            newContent+='<th>';
            newContent+= "Amount Received";
            newContent+='</th>';
            newContent+='</tr>';
            $("#clientListTableId").append(newContent).trigger('create');
            for(var i=0;i<data.clientList.length;i++) {
                var newContent ='<tr class = "showhide">';
                newContent+='<td>';
                newContent+= i+1;
                newContent+='</td>';
                newContent+='<td>';
                newContent+= data.clientList[i].clientName;
                newContent+='</td>';
                newContent+='<td>';
                newContent+= data.clientList[i].amount;
                newContent+='</td>';
                newContent+='</tr>';
                $("#clientListTableId").append(newContent).trigger('create');

            }

            clientListcurrentrow = 0;
            clientListmaxrows = $("#clientListTableId tr").length-1;

            $("#clientListPrevId").hide();
            if(clientListmaxrows > 5) {
                $("#clientListNextId").show();
            }else{
                $("#clientListNextId").hide();
            }
            $('#clientListTableId tr.showhide').hide();
            for(var i =0 ; i<5; i++) {
                if (clientListcurrentrow < clientListmaxrows) {
                    $('#clientListTableId tr.showhide:eq(' + clientListcurrentrow  + ')').show();
                    clientListcurrentrow++;
                }
            }
            clientListPageNo = 1;
            var $btn_text  = $('#clientListPageNoId').find('.ui-btn-text')
            $btn_text.text("Records "+clientListPageNo+" - "+clientListcurrentrow+" of "+clientListmaxrows);
            $("#groupid").text(groupName);
            //alert("before j==" + j);
            document.getElementById("custommainTab"+j).href= "#recentActivityPopup";
            $("#custommainTab"+j).trigger('click');
            //$("#custommainTab"+i).trigger('click');
            document.getElementById("custommainTab"+j).href= "JavaScript:showClientList("+j+",'"+paymentId+"','"+groupName+"')";

        },error : function(jqXHR, textStatus, error) {
            alert("textStatus" + textStatus);
        }
    });

}

$(document).ready(function() {

    $("#clientListPrevId").click(function() {
        if(clientListcurrentrow == clientListmaxrows){
            $("#clientListNextId").show();
        }

        var hidenextrow = clientListcurrentrow;
        if(clientListmaxrows == clientListcurrentrow){
            var x = clientListmaxrows % 5;
            if(x>0){
                hidenextrow = hidenextrow + (5 - x);
                clientListcurrentrow = clientListcurrentrow + (5 - x);
            }
        }
        for(var i =0 ; i<5; i++) {
            hidenextrow--;
            $('#clientListTableId tr.showhide:eq(' + hidenextrow  + ')').hide();
            if (clientListcurrentrow > 0) {
                clientListcurrentrow --;
                $('#clientListTableId tr.showhide:eq(' + (clientListcurrentrow-5)  +')').show();

            }
        }
        if(clientListcurrentrow == 5){
            $("#clientListPrevId").hide();
        }
        clientListPageNo = clientListPageNo - 5;
        var $btn_text  = $('#clientListPageNoId').find('.ui-btn-text')
        $btn_text.text("Records "+clientListPageNo+" - "+clientListcurrentrow+" of "+clientListmaxrows);

    });



    //Group Installment Due pagination//
    $("#clientListNextId").click(function() {
        if(clientListcurrentrow == 5){
            $("#clientListPrevId").show();
        }
        //alert("next"+clientListcurrentrow);
        var hidepreviousrow = clientListcurrentrow;
        for(var i =0 ; i<5; i++) {
            hidepreviousrow--;
            $('#clientListTableId tr.showhide:eq(' + hidepreviousrow  + ')').hide();
            if (clientListcurrentrow < clientListmaxrows) {
                $('#clientListTableId tr.showhide:eq(' + clientListcurrentrow  + ')').show();
                clientListcurrentrow ++;
            }
        }
        if(clientListcurrentrow == clientListmaxrows){
            $("#clientListNextId").hide();
        }
        clientListPageNo = clientListPageNo+5;
        var $btn_text  = $('#clientListPageNoId').find('.ui-btn-text')
        $btn_text.text("Records "+clientListPageNo+" - "+clientListcurrentrow+" of "+clientListmaxrows);
    });
});
function doPaymentVerification(){
		var i = $("#rowIndexId").val();
		var status = $("#isMatchId").val();
		var data = {};
		data.paymentCollectionId = $("#paymentCollectionIdId").val();
		data.amount = $("#amountId").val();
		data.groupName = $("#groupNameId").val();
		data.globalAccNum = $("#globalAccNumId").val();
		data.modeOfPayment = $("#modeOfPaymentId").val();
		data.isMatch = $("#isMatchId").val();
		data.officeId = $("#officeIdId").val();
		$.ajax({
			type  : 'POST',
			data  : JSON.stringify(data),
			async : false,
			contentType: 'application/json',
			url: 'http://'+ajaxcallip+localStorage.contextPath+'/client/ci/loanrecovery/doPaymentVerification',
			beforeSend : function() { 
				$.mobile.showPageLoadingMsg(); 
			},
			complete: function() { 
				$.mobile.hidePageLoadingMsg() 
			},
			success: function(statusMessage) {
				$("#actionId"+(i-1)).hide();
				$("#statusId"+(i-1)).attr("disabled", true);
				if(status == 1 && statusMessage == 'success'){
					$("#labelRevertID"+(i-1)).text('Received');
				}else if(statusMessage == 'failure'){
					$("#actionId"+(i-1)).show();
					$("#errorMsg").text("Day book already closed for this date of transaction");
				}
				else{
					$("#labelRevertID"+(i-1)).text('Reverted');
				}
			},
			error : function(jqXHR, textStatus, error) {
				$("#errorMsg").text("Transaction failed. Please try later");
				
            }	
		});
}
function doPaymentVerificationImageDownloadFormSubmission(fileLocation){
	//alert(fileLocation);
	$("#errorMsg").text("");
	if(fileLocation != 'null'){
        
		$("#fileLocationId").val(fileLocation);
		document.getElementById("paymentVerificationFormId").method='POST';
		document.getElementById("paymentVerificationFormId").action=localStorage.contextPath+"/client/ci/loanrecovery/downloadPaymentVerificationImage";
		document.getElementById("paymentVerificationFormId").submit();
	}else {
		$("#errorMsg").text("No image captured for this payment");
		$(window).scrollTop(0);
	}
	

}
function doPaymentVerificationFormSubmission(rowIndex,isApplyPayment){
	//alert(document.getElementById("paymentVerificationTableId").rows[rowIndex].cells[1].innerHTML);
	$("#errorMsg").text("");
	if($("#statusId"+(rowIndex-1)).val() != "") {
		if(($("#statusId"+(rowIndex-1)).val() == 0) && (!($("#rcptnumber").is(':checked') | $("#amountmismatchId").is(':checked')))){
			//$("#errorMsg").text("Select Mismatch reason");
			$("#errorId").text("");
			document.getElementById('fictionId0').href= "#mismatchpopup";
			$("#fictionId0").trigger('click');
		}
		
		else if(isApplyPayment == true || isApplyPayment == false){
			$(window).scrollTop(0);
			//document.getElementById('actionId'+(rowIndex-1)).href= "#paymentVerifiedId";
            		$( "#paymentVerifiedId" ).popup("open");
			//$("#actionId"+(rowIndex-1)).trigger('click');
			$("#paymentCollectionIdId").val(document.getElementById("paymentVerificationTableId").rows[rowIndex].cells[1].innerHTML);
			$("#groupNameId").val(document.getElementById("paymentVerificationTableId").rows[rowIndex].cells[2].innerHTML);
			$("#globalAccNumId").val(document.getElementById("paymentVerificationTableId").rows[rowIndex].cells[3].innerHTML);
			$("#amountId").val(document.getElementById("paymentVerificationTableId").rows[rowIndex].cells[4].innerHTML);
			$("#modeOfPaymentId").val(document.getElementById("paymentVerificationTableId").rows[rowIndex].cells[5].innerHTML);
			$("#isMatchId").val($("#statusId"+(rowIndex-1)).val());
			$("#rowIndexId").val(rowIndex);
			$("#isApplyPaymentId").val(isApplyPayment);
		}
		else {
			$("#errorMsg").text("Year end process not yet done for the previous financial year !");
		}
	}
	else {
		$("#errorMsg").text("Please select the status");
	}

}
function retrievePayments(personnnelId){
	//value = $(personnnelId).val();
    $.mobile.showPageLoadingMsg();
	document.getElementById("personnelId").value = personnnelId;
//alert("personnnelId" );
	document.getElementById("paymentVerificationFormId").method='POST';
	document.getElementById("paymentVerificationFormId").action=localStorage.contextPath+"/client/ci/loanrecovery/paymentVerificationLoad";
	document.getElementById("paymentVerificationFormId").submit();

}
function showOptions(value){
	if(value == 0){
		$("#errorId").text("");
		document.getElementById('fictionId0').href= "#mismatchpopup";
		$("#fictionId0").trigger('click');
	}
}