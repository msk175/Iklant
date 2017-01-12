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
	$btn_text.text("Records "+NPAGroupLoansPageNo+" - "+NPAGroupLoansCurrentRow+" of "+NPAGroupLoansMaxRows);

	$("#assignRODivId").show();
	$("#closedGroupsDivId").hide();
	$("#malpracticeGroupsDivId").hide();
	$("#assignRONavBarId").click(function(){
		//alert("assign");
		$("#assignRODivId").show();
		$("#closedGroupsDivId").hide();
		$("#malpracticeGroupsDivId").hide();
	});
	$("#closedGroupsNavBarId").click(function(){
		//alert("closed");
		$("#assignRODivId").hide();
		$("#closedGroupsDivId").show();
		$("#malpracticeGroupsDivId").hide();
	});
	$("#malGroupsNavBarId").click(function(){
		//alert("mal");
		$("#assignRODivId").hide();
		$("#closedGroupsDivId").hide();
		$("#malpracticeGroupsDivId").show();
	});
	
	//Pagination
	//Group Outstanding Balance Pagination//
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
		$btn_text.text("Records "+NPAGroupLoansPageNo+" - "+NPAGroupLoansCurrentRow+" of "+NPAGroupLoansMaxRows);    
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
		$btn_text.text("Records "+NPAGroupLoansPageNo+" - "+NPAGroupLoansCurrentRow+" of "+NPAGroupLoansMaxRows);  
		
	});
	for(var i=0; i<$("#noOfGroupId").val(); i++){
		$("#groupListId"+i).click(function(){
			var currentIndex = this.id.substr(this.id.length - 1);
			var statusId = $("#statusIdId").val().split(",");
			var reason = $("#reasonForNotPaidId").val().split(",");
			var remark = $("#remarksId").val().split(",");
			var capabilityPercentage = $("#capablilityPercentageId").val().split(",");
			var expectedPaymentDate = $("#expectedPaymentDateId").val().split(",");
			$('div').remove('#reasonPopupDivId');
			if(statusId[currentIndex] == 3){
				var newContent = '<div data-role="content" id="reasonPopupDivId">';
				$("#parentPopupDivId").append(newContent).trigger('create');
				var newContent = '<div data-role="horizontal" class="ui-bar ui-grid-a">';
				newContent += '<div class="ui-block-a">';
				newContent += "<label for='groupname'><b> Reason for not Paid </b></label>";
				newContent += '</div>';
				newContent += '<div class="ui-block-b">';
				newContent += "<label id='reasonForNotPaidlabelId'> : "+reason[currentIndex]+"</label>";
				newContent += '</div>';
				newContent += '</div>';
				newContent += '<div data-role="horizontal" class="ui-bar ui-grid-a">';
				newContent += '<div class="ui-block-a">';
				newContent += "<label for='groupname'><b> Remark </b></label>";
				newContent += '</div>';
				newContent += '<div class="ui-block-b">';
				newContent += '<label id="remarkLabelId"> : '+remark[currentIndex]+'</label>';
				newContent += '</div>';
				newContent += '</div>';
				$("#reasonPopupDivId").append(newContent).trigger('create');
				/*
				$("#reasonForNotPaidlabelId").text(reason[currentIndex]);
				$("#remarkLabelId").text(remark[currentIndex]);*/
			}
			else if(statusId[currentIndex] == 4){
				var newContent = '<div data-role="content" id="reasonPopupDivId">';
				$("#parentPopupDivId").append(newContent).trigger('create');
				var newContent = '<div data-role="horizontal" class="ui-bar ui-grid-a">';
				newContent += '<div class="ui-block-a">';
				newContent += "<label for='reason'> <b> Reason for not Paid </b></label>";
				newContent += '</div>';
				newContent += '<div class="ui-block-b">';
				newContent += "<label id='reasonForNotPaidlabelId'> : "+reason[currentIndex]+"</label>";
				newContent += '</div>';
				newContent += '</div>';
				newContent += '<div data-role="horizontal" class="ui-bar ui-grid-a">';
				newContent += '<div class="ui-block-a">';
				newContent += "<label for='capabilitypercentage '> <b> Capability Percentage </b></label>";
				newContent += '</div>';
				newContent += '<div class="ui-block-b">';
				newContent += '<label id="capabilitypercentageLabelId"> : '+capabilityPercentage[currentIndex]+'</label>';
				newContent += '</div>';
				newContent += '</div>';
				newContent += '<div data-role="horizontal" class="ui-bar ui-grid-a">';
				newContent += '<div class="ui-block-a">';
				newContent += "<label for='expectedDate'><b> Expected Payment Date </b></label>";
				newContent += '</div>';
				newContent += '<div class="ui-block-b">';
				newContent += '<label id="expectedDateLabelId"> : '+expectedPaymentDate[currentIndex]+' </label>';
				newContent += '</div>';
				newContent += '</div>';
				$("#reasonPopupDivId").append(newContent).trigger('create');
			}
		});
	}
	
});

function assignFOSubmission(noOfGroups){
	var accountId = new Array();
	var checkedFlag = 0 ;
	var table = document.getElementById("npaLoansTableId");
	for(var i =0; i<noOfGroups; i++){
		//alert($("#checkGroupId"+i).is(':checked'));
		if($("#checkGroupId"+i).is(':checked') == true){
			checkedFlag = 1;
			var row = table.rows[i+1];
			var cell = row.cells[4];
			accountId[i] = cell.innerHTML.replace(/^\s+|\s+$/g, '');
		}
	}
	$("#accountIdÏd").val($.grep(accountId,function(n){return(n);}));
	if($("#selectROId").val() == "") {
		$("#errorField").text("Please select RO");
	}
	else if(checkedFlag == 0){
		$("#errorField").text(" Please select atleast one group to assign");
	}
	else {
        $.mobile.showPageLoadingMsg();
		document.getElementById("assignROFormId").method='POST';
		document.getElementById("assignROFormId").action=localStorage.contextPath+"/client/ci/NPALRGroups/assignRO";
		document.getElementById("assignROFormId").submit();
	}
}