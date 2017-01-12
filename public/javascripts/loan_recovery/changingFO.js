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
});

function assignFOSubmission(noOfGroups){
	$("#successMessage").hide();
    var accountId = new Array();
    var iklantGroupId = new Array();
	var checkedFlag = 0 ;
	var table = document.getElementById("npaLoansTableId");
	for(var i =0; i<noOfGroups; i++){
		//alert($("#checkGroupId"+i).is(':checked'));
		if($("#checkGroupId"+i).is(':checked') == true){
			checkedFlag = 1;
			var row = table.rows[i+1];
			var cell = row.cells[5];
			accountId[i] = cell.innerHTML.replace(/^\s+|\s+$/g, '');
            var row1 = table.rows[i+1];
            var cell1 = row1.cells[6];
            iklantGroupId[i] = cell1.innerHTML.replace(/^\s+|\s+$/g, '');
		}
	}
	$("#accountIdÏd").val($.grep(accountId,function(n){return(n);}));
    $("#iklantGroupIdÏd").val($.grep(iklantGroupId,function(n){return(n);}));
	if($("#office").val()==0){
        $("#errorField").text("Please select Branch Name");
    }
    else if ($("#currentFO").val() == 0){
        $("#errorField").text("Please select Current Field Officer Name");
    }
    else if($("#selectROId").val() == 0) {
        $("#errorField").text("Please select Target FO Name");
    }
    else if ($("#selectROId").val() == $("#currentFOId").val()){
        $("#errorField").text("Please select different Target FO Name");
    }
	else if(checkedFlag == 0){
		$("#errorField").text(" Please select atleast one group to assign");
	}
	else {
        $.mobile.showPageLoadingMsg();
		document.getElementById("assignROFormId").method='POST';
		document.getElementById("assignROFormId").action=localStorage.contextPath+"/client/ci/LRGroups/assignFO";
		document.getElementById("assignROFormId").submit();
	}
}

function branchNameChange(){
    if($("#office").val()==0){
        $("#errorField").text("Please select Branch Name");
    }else{
        $.mobile.showPageLoadingMsg();
        document.getElementById("assignROFormId").method='POST';
        document.getElementById("assignROFormId").action=localStorage.contextPath+"/client/ci/LRGroups/groupsFOLoad";
        document.getElementById("assignROFormId").submit();
    }
}

function foNameChange(){
    if($("#office").val()==0){
        $("#errorField").text("Please select Branch Name");
    }
    else if ($("#currentFOId").val() == 0){
        $("#errorField").text("Please select Current Field Officer Name");
    }else{
        $.mobile.showPageLoadingMsg();
        document.getElementById("assignROFormId").method='POST';
        document.getElementById("assignROFormId").action=localStorage.contextPath+"/client/ci/LRGroups/groupsForFOLoad";
        document.getElementById("assignROFormId").submit();
    }
}