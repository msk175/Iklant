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
				//alert("textStatus" + textStatus);
            }		
		});	
			
}
function revertPayment(i,paymentId){
$("#rowIndex").val(i);
$("#paymentId").val(paymentId);
document.getElementById('revertId'+i).href= "#paymentVerifiedId";
$("#revertId"+i).trigger('click');
	/*ajaxVariable = $.ajax({
			type: 'POST',
			contentType: 'application/json',
			url: 'http://175.41.160.249:1000/mfi/api/1.0/client/ci/'+paymentId+'/revertPayment',
			success: function(data) {
				$("#revertId"+i).hide();
				$("#labelRevertID"+i).text('Reverted Succesfully');
			},error : function(jqXHR, textStatus, error) {
				//alert("textStatus" + textStatus);
            }		
		});	*/
	
	//alert("revertpaymentid" + paymentId);
	//document.getElementById("loanListFormID").method='POST';
	//document.getElementById("loanListFormID").action=localStorage.contextPath+"/client/ci/"+paymentId+"/revertPayment";
	//document.getElementById("loanListFormID").submit();


}
function revertPaymentSubmisson(i,paymentId){
	ajaxVariable = $.ajax({
        beforeSend : function() {
            $.mobile.showPageLoadingMsg();
        },
        complete: function() {
            $.mobile.hidePageLoadingMsg()
        },
        type: 'POST',
        url: 'http://'+ajaxcallip+localStorage.contextPath+'/client/ci/'+paymentId+'/revertPayment',
        success: function(data) {
            $("#revertId"+i).hide();
            $("#labelRevertID"+i).text('Reverted');
        },error : function(jqXHR, textStatus, error) {
            //alert("textStatus" + textStatus);
        }
    });
}
$(document).ready(function() {
	
	$("#yesId").click(function(){
		revertPaymentSubmisson($("#rowIndex").val(),$("#paymentId").val());
	});
	$("#noId").click(function(){
		var rowIndex = $("#rowIndex").val();
		//alert(rowIndex);
		document.getElementById('revertId'+ rowIndex).href= "JavaScript:revertPayment("+rowIndex+","+$("#paymentId").val()+")";
	});
	
	
	
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