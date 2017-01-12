var NPAGroupLoansCurrentRow = 0;
var NPAGroupLoansMaxRows = 0;
var NPAGroupLoansPageNo = 1;

$(document).ready(function() {
	NPAGroupLoansCurrentRow = 0;
	NPAGroupLoansMaxRows = $("#npaLoansTableId tr").length-1;
	
	$("#NPAGroupLoansPrevId").hide();
	$("#NPAGroupLoansNextId").show();
	$('#npaLoansTableId tr.showhide').hide();
	for(var i =0 ; i<10; i++) {
		if (NPAGroupLoansCurrentRow < NPAGroupLoansMaxRows) {
		   $('#npaLoansTableId tr.showhide:eq(' + NPAGroupLoansCurrentRow  + ')').show();
		   NPAGroupLoansCurrentRow++;
		}
	}
	NPAGroupLoansPageNo = 1;
	var $btn_text  = $('#NPAGroupLoansPageNoId').find('.ui-btn-text')
	$btn_text.text("NPA Loans "+NPAGroupLoansPageNo+" - "+NPAGroupLoansCurrentRow+" of "+NPAGroupLoansMaxRows);

	$("#NPAGroupLoansNextId").click(function() {
		if(NPAGroupLoansCurrentRow == 10){
			$("#NPAGroupLoansPrevId").show();
		}
		//alert("next"+NPAGroupLoansCurrentRow);
		var hidepreviousrow = NPAGroupLoansCurrentRow;
		for(var i =0 ; i<10; i++) {
			hidepreviousrow--;
			$('#npaLoansTableId tr.showhide:eq(' + hidepreviousrow  + ')').hide();
			if (NPAGroupLoansCurrentRow < NPAGroupLoansMaxRows) {
				$('#npaLoansTableId tr.showhide:eq(' + NPAGroupLoansCurrentRow  + ')').show();
				NPAGroupLoansCurrentRow ++;
			}
		}
		if(NPAGroupLoansCurrentRow == NPAGroupLoansMaxRows){
			$("#NPAGroupLoansNextId").hide();
		}
		NPAGroupLoansPageNo = NPAGroupLoansPageNo+10;
		var $btn_text  = $('#NPAGroupLoansPageNoId').find('.ui-btn-text')
		$btn_text.text("NPA Loans "+NPAGroupLoansPageNo+" - "+NPAGroupLoansCurrentRow+" of "+NPAGroupLoansMaxRows);    
	});
	
	$("#NPAGroupLoansPrevId").click(function() {
		//alert("Previous");
		if(NPAGroupLoansCurrentRow == NPAGroupLoansMaxRows){
			$("#NPAGroupLoansNextId").show();
		}
		
		var hidenextrow = NPAGroupLoansCurrentRow;
		if(NPAGroupLoansMaxRows == NPAGroupLoansCurrentRow){
			var x = NPAGroupLoansMaxRows % 10;
			if(x>0){
				hidenextrow = hidenextrow + (10 - x);
				NPAGroupLoansCurrentRow = NPAGroupLoansCurrentRow + (10 - x);   
			}
		}
		for(var i =0 ; i<10; i++) {
			hidenextrow--;
			$('#npaLoansTableId tr.showhide:eq(' + hidenextrow  + ')').hide();
			if (NPAGroupLoansCurrentRow > 0) {
				NPAGroupLoansCurrentRow --;
				$('#npaLoansTableId tr.showhide:eq(' + (NPAGroupLoansCurrentRow-10)  +')').show();
				
			}   
		}
		if(NPAGroupLoansCurrentRow == 10){
			$("#NPAGroupLoansPrevId").hide();
		}
		NPAGroupLoansPageNo = NPAGroupLoansPageNo - 10;
		var $btn_text  = $('#NPAGroupLoansPageNoId').find('.ui-btn-text')
		$btn_text.text("NPA Loans "+NPAGroupLoansPageNo+" - "+NPAGroupLoansCurrentRow+" of "+NPAGroupLoansMaxRows);  
		
	});	
	$('#loanOfficerId').on('change', function() {
        $.mobile.showPageLoadingMsg();
		document.getElementById("NPADetailForm").method='POST';
		document.getElementById("NPADetailForm").action=localStorage.contextPath+"/client/ci/viewNpaGroupSummaryReport";
		document.getElementById("NPADetailForm").submit();
	});
	$('#productCategoryId').on('change', function() {
        $.mobile.showPageLoadingMsg();
		document.getElementById("NPADetailForm").method='POST';
		document.getElementById("NPADetailForm").action=localStorage.contextPath+"/client/ci/viewNpaGroupSummaryReport";
		document.getElementById("NPADetailForm").submit();
	});
	
	$('#officeId').on('change', function() {
        $.mobile.showPageLoadingMsg();
		document.getElementById("NPADetailForm").method='POST';
		document.getElementById("NPADetailForm").action=localStorage.contextPath+"/client/ci/viewNpaGroupSummaryReport";
		document.getElementById("NPADetailForm").submit();
	});	
	});	