var NPAGroupLoansCurrentRow = 0;
var NPAGroupLoansMaxRows = 0;
var NPAGroupLoansPageNo = 1;

$(document).ready(function() {
	
	//NUMBER VALIDATION
	$("#overdueDurationFrom").keydown(function(event) {
        // Allow: backspace, delete, tab, escape, and enter
		if ( event.keyCode == 46 || event.keyCode == 8 || event.keyCode == 9 || event.keyCode == 27 || event.keyCode == 13 || event.keyCode  == 37 || event.keyCode  == 39 ||
             // Allow: Ctrl+A
            (event.keyCode == 65 && event.ctrlKey === true) || 
             // Allow: home, end, left, right
            (event.keyCode >= 35 && event.keyCode <= 39)) {
                 // let it happen, don't do anything
                 return;
        }
        else {
            // Ensure that it is a number and stop the keypress
            if (event.shiftKey || (event.keyCode < 48 || event.keyCode > 57) && (event.keyCode < 96 || event.keyCode > 105 )) {
                event.preventDefault(); 
            }   
        }
    });
	
		//NUMBER VALIDATION
	$("#overdueDurationTo").keydown(function(event) {
        // Allow: backspace, delete, tab, escape, and enter
		if ( event.keyCode == 46 || event.keyCode == 8 || event.keyCode == 9 || event.keyCode == 27 || event.keyCode == 13 || event.keyCode  == 37 || event.keyCode  == 39 ||
             // Allow: Ctrl+A
            (event.keyCode == 65 && event.ctrlKey === true) || 
             // Allow: home, end, left, right
            (event.keyCode >= 35 && event.keyCode <= 39)) {
                 // let it happen, don't do anything
                 return;
        }
        else {
            // Ensure that it is a number and stop the keypress
            if (event.shiftKey || (event.keyCode < 48 || event.keyCode > 57) && (event.keyCode < 96 || event.keyCode > 105 )) {
                event.preventDefault(); 
            }   
        }
    });
	
		//NUMBER VALIDATION
	$("#amountFrom").keydown(function(event) {
        // Allow: backspace, delete, tab, escape, and enter
		if ( event.keyCode == 46 || event.keyCode == 8 || event.keyCode == 9 || event.keyCode == 27 || event.keyCode == 13 || event.keyCode  == 37 || event.keyCode  == 39 ||
             // Allow: Ctrl+A
            (event.keyCode == 65 && event.ctrlKey === true) || 
             // Allow: home, end, left, right
            (event.keyCode >= 35 && event.keyCode <= 39)) {
                 // let it happen, don't do anything
                 return;
        }
        else {
            // Ensure that it is a number and stop the keypress
            if (event.shiftKey || (event.keyCode < 48 || event.keyCode > 57) && (event.keyCode < 96 || event.keyCode > 105 )) {
                event.preventDefault(); 
            }   
        }
    });
	
		//NUMBER VALIDATION
	$("#amountTo").keydown(function(event) {
        // Allow: backspace, delete, tab, escape, and enter
		if ( event.keyCode == 46 || event.keyCode == 8 || event.keyCode == 9 || event.keyCode == 27 || event.keyCode == 13 || event.keyCode  == 37 || event.keyCode  == 39 ||
             // Allow: Ctrl+A
            (event.keyCode == 65 && event.ctrlKey === true) || 
             // Allow: home, end, left, right
            (event.keyCode >= 35 && event.keyCode <= 39)) {
                 // let it happen, don't do anything
                 return;
        }
        else {
            // Ensure that it is a number and stop the keypress
            if (event.shiftKey || (event.keyCode < 48 || event.keyCode > 57) && (event.keyCode < 96 || event.keyCode > 105 )) {
                event.preventDefault(); 
            }   
        }
    });
		$("#NPAGroupLoansPrevId").hide();
		$("#NPAGroupLoansNextId").show();
		
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
	
		//Pagination
	//Group Outstanding Balance Pagination//
	$("#NPAGroupLoansNextId").click(function() {
		if(NPAGroupLoansCurrentRow == 10) {
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
	
	$("#reasonForNPA").multiselect({
		noneSelectedText: "Select Reasons",
		selectedText: "# of # reasons selected",
	});
});

function onchangeSearchCriteriaBranch() {
	if($('#branches').val() == -1) {
		var branch = $('#allBranches').val();
	}
	else {
		var branch = $('#branches').val();
	}
		$('#capabilityPercentage').val('0').selectmenu("refresh");
		$('#isLeaderTraceableID').val('0').selectmenu("refresh");
		$('#reasonForNPA').removeAttr("selected");
		
		$('#overdueDurationFrom').val('');
		$('#overdueDurationTo').val('');
		$('#amountFrom').val('');
		$('#amountTo').val('');
	onchangeSearchCriteria(0,0,0,0,0,0,0,0,branch);
	getFieldOfficers(branch);
}

function onchangeSearchCriteriaFO() {
	if($('#recoveryOfficers').val() == -1) {
		var recoveryOfficer = $('#allRecoveryOfficers').val();
	}
	else {
		var recoveryOfficer = $('#recoveryOfficers').val();
	}
		$('#capabilityPercentage').val('0').selectmenu("refresh");
		$('#isLeaderTraceableID').val('0').selectmenu("refresh");
		$('#reasonForNPA').removeAttr("selected");
		
		$('#overdueDurationFrom').val('');
		$('#overdueDurationTo').val('');
		$('#amountFrom').val('');
		$('#amountTo').val('');
	onchangeSearchCriteria(recoveryOfficer,0,0,0,0,0,0,0,0);
}

function onchangeSearchCriteriaCP() {
	if($('#capabilityPercentage').val() == -1) {
		var capabilityPercentage = $('#allCapabilityPercentage').val();
	}
	else {
		var capabilityPercentage = $('#capabilityPercentage').val();
	}
		$('#recoveryOfficers').val('0').selectmenu("refresh");
		$('#isLeaderTraceableID').val('0').selectmenu("refresh");
		$('#reasonForNPA').val('0');
		$('#overdueDurationFrom').val('');
		$('#overdueDurationTo').val('');
		$('#amountFrom').val('');
		$('#amountTo').val('');
	onchangeSearchCriteria(0,capabilityPercentage,0,0,0,0,0,0,0);
}

function onchangeSearchCriteriaLeaderTraceable() {
	if($('#isLeaderTraceableID').val() == -1) {
		var isLeaderTraceableID = $('#allIsLeaderTraceable').val();
	}
	else {
		var isLeaderTraceableID = $('#isLeaderTraceableID').val();
	}
		$('#recoveryOfficers').val('0').selectmenu("refresh");
		$('#capabilityPercentage').val('0').selectmenu("refresh");
		$('#reasonForNPA').val('0');
		$('#overdueDurationFrom').val('');
		$('#overdueDurationTo').val('');
		$('#amountFrom').val('');
		$('#amountTo').val('');
	onchangeSearchCriteria(0,0,isLeaderTraceableID,0,0,0,0,0,0);
}
function onchangeSearchCriteriaReason() {
	var reasonForNPA = $('#reasonForNPA').val();
		$('#recoveryOfficers').val('0').selectmenu("refresh");
		$('#capabilityPercentage').val('0').selectmenu("refresh");
		$('#isLeaderTraceableID').val('0').selectmenu("refresh");
		$('#overdueDurationFrom').val('');
		$('#overdueDurationTo').val('');
		$('#amountFrom').val('');
		$('#amountTo').val('');
	onchangeSearchCriteria(0,0,0,reasonForNPA,0,0,0,0,0);
}

function onFocusoutSearchCriteriaOverDueDuration() {
	var overdueDurationFrom = $('#overdueDurationFrom').val();
	var overdueDurationTo = $('#overdueDurationTo').val();
	if(overdueDurationFrom != '' && overdueDurationTo != '') {
		$('#recoveryOfficers').val('0').selectmenu("refresh");
		$('#capabilityPercentage').val('0').selectmenu("refresh");
		$('#isLeaderTraceableID').val('0').selectmenu("refresh");
		$('#reasonForNPA').val('0');
		$('#amountFrom').val('');
		$('#amountTo').val('');
		if(overdueDurationFrom == 0) {
			overdueDurationFrom = 1;
		}
		if(overdueDurationTo == 0) {
			overdueDurationTo = 1;
		}
		if(parseInt(overdueDurationTo) < parseInt(overdueDurationFrom)) {
			$("#errorField").text("To Duration should be greater than from");
		}
		else {
			onchangeSearchCriteria(0,0,0,0,overdueDurationFrom,overdueDurationTo,0,0,0);
		}
	}
}

function onFocusoutSearchCriteriaAmount() {
	var amountFrom = $('#amountFrom').val();
	var amountTo = $('#amountTo').val();
	if(amountFrom != '' && amountTo != '') {
		$('#recoveryOfficers').val('0').selectmenu("refresh");
		$('#capabilityPercentage').val('0').selectmenu("refresh");
		$('#isLeaderTraceableID').val('0').selectmenu("refresh");
		$('#reasonForNPA').val('0');
		$('#overdueDurationFrom').val('');
		$('#overdueDurationTo').val('');
		if(amountFrom == 0) {
			amountFrom = 1;
		}
		if(amountTo == 0) {
			amountTo = 1;
		}
		if(parseInt(amountTo) < parseInt(amountFrom)) {
			$("#errorField").text("To Amount should be greater than from");
		}
		else {
			onchangeSearchCriteria(0,0,0,0,0,0,amountFrom,amountTo,0);
		}
	}
}

function onchangeSearchCriteria(recoveryOfficer,capabilityPercentage,isLeaderTraceableID,reasonForNPA,
												overdueDurationFrom,overdueDurationTo,amountFrom,amountTo,branch) {
												
	//if(capabilityPercentage != 0 || amountRange != 0 || reasonForNPA != 0) {
		var data = {};
		data.recoveryOfficer = recoveryOfficer;
		data.capabilityPercentage = capabilityPercentage;
		data.isLeaderTraceableID = isLeaderTraceableID;
		data.reasonForNPA = reasonForNPA;
		data.overdueDurationFrom = overdueDurationFrom;
		data.overdueDurationTo = overdueDurationTo;
		data.amountFrom = amountFrom;
		data.amountTo = amountTo;
		data.branch = branch;
				
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
			url: 'http://'+ajaxcallip+localStorage.contextPath+'/client/ci/listsearchednpa',						
			success: function(data) {
				$("#errorField").text("");
				$("#npaLoansTableId tr").remove();
				var tableHeader = '<tr><th style ="text-align:center">S.NO</th>' +
										'<th style ="text-align:center">Group Name</th>' +
										'<th style ="text-align:center">Overdue</th>' +
										'<th style ="text-align:center">Days in arrears</th>' +
										'<th style ="text-align:center">Expected Completion Date</th>' +
										'<th style ="text-align:center">Download</th>' +
										'<th style ="text-align:center">Docs</th>' +
										'<th style ="text-align:center">Recovery Officer</th>' +										
									'</tr>';
				$('#npaLoansTableId').append(tableHeader);
				if(data.accountId.length == 0) {
					$("#errorField").text("No Accounts found");
				}				
				for(var i=0;i<data.accountId.length;i++) {
					var tableRow = '<tr class = "showhide"><td style="text-align:center">'+(i+1)+'</td>' +
										'<td style="text-align:center">' +
										'<a href="JavaScript:showGroupDetails('+data.accountId[i]+')">' +
										''+data.customerNameArray[i]+'</a></td>' +
										'<td style="text-align:center">'+data.overDueAmountArray[i]+'</td>' +
										'<td style="text-align:center">'+data.daysInArrearsArray[i]+'</td>' +
										'<td style="text-align:center">'+data.expectedCompletionDateArray[i]+'</td>' +
										'<td style="text-align:center"><a href="JavaScript:downloadFiles('+i+','+data.accountId[i]+')" '+
										'data-role="button" data-mini="true">' +
										'Download</a></td>' +
										'<td style="text-align:center">' +
										'<select id = "downloadedDocs'+i+'" onchange = "JavaScript:downloadDocs(this.value)" '+
										'data-theme="b" data-icon="arrow-d" data-native-menu="true" data-inline="true" '+
										'data-mini="true">' +
										'<option value="0">Select</option>' +
										'</select></td>' +
										'<td style="text-align:center">'+data.recoveryOfficerNameArray[i]+'</td>' +
									'</tr>';
					$('#npaLoansTableId').append(tableRow).trigger( "create" );					
				}
				NPAGroupLoansCurrentRow = 0;
				NPAGroupLoansMaxRows = $("#npaLoansTableId tr").length-1;
				
				$("#NPAGroupLoansPrevId").hide();
				
				if(data.accountId.length > 10) {
					$("#NPAGroupLoansNextId").show();
				}else{
					$("#NPAGroupLoansNextId").hide();
				}
				$('#npaLoansTableId tr.showhide').hide();
				for(var i =0 ; i<10; i++) {
					if (NPAGroupLoansCurrentRow < NPAGroupLoansMaxRows) {
					   $('#npaLoansTableId tr.showhide:eq(' + NPAGroupLoansCurrentRow  + ')').show();
					   NPAGroupLoansCurrentRow++;
					}
				}
				NPAGroupLoansPageNo = 1;
				var $btn_text  = $('#NPAGroupLoansPageNoId').find('.ui-btn-text');
				$btn_text.text("Records "+NPAGroupLoansPageNo+" - "+NPAGroupLoansCurrentRow+" of "+NPAGroupLoansMaxRows);
			},
		});
	/*} else {
		$("#listnpa li").remove();
	}*/
}

function getFieldOfficers(branch) {
		var data = {};
		data.branch = branch;
		
		ajaxVariable = $.ajax({
			type: 'POST',
			data: JSON.stringify(data),
			contentType: 'application/json',
			url: 'http://'+ajaxcallip+localStorage.contextPath+'/client/ci/getofficelistajaxcall',						
			success: function(data) {
				$("#recoveryOfficers").val('0').selectmenu("refresh");
				document.getElementById('recoveryOfficers').options.length = 0;
					var combo2 = document.getElementById("recoveryOfficers");
				
				option = document.createElement("option");
				option.text = "Select FO";
				option.value ="0";
				 try {
					combo2.add(option, null); //Standard 
				}catch(error) {
					combo2.add(option); // IE only
				}
				var combo1 = document.getElementById("recoveryOfficers");
				
				option = document.createElement("option");
				option.text = "All";
				option.value ="-1";
				 try {
					combo1.add(option, null); //Standard 
				}catch(error) {
					combo1.add(option); // IE only
				}
				for(var i=0;i<data.FOIds.length;i++){
					var combo = document.getElementById("recoveryOfficers");
					
					option = document.createElement("option");
					option.text = data.FONames[i];
					option.value =data.FOIds[i];
					 try {
						combo.add(option, null); //Standard 
					}catch(error) {
						combo.add(option); // IE only
					}
				}
					document.getElementById("allRecoveryOfficers").value = data.FOIds;
				},
		});
}

function showGroupDetails(accountId) {
    $.mobile.showPageLoadingMsg();
	document.getElementById("assignROFormId").method='POST';
	document.getElementById("assignROFormId").action=localStorage.contextPath+"/client/ci/"+accountId+"/retrieveGroupDetails/2";
	document.getElementById("assignROFormId").submit();
}

function downloadFiles(i,accountId) {
		var data = {};
		data.accountId = accountId;
		data.clientId = 0;
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
				url: 'http://'+ajaxcallip+localStorage.contextPath+'/client/ci/retrieveUploadedDocs',
				success: function(data) {					
					$("#downloadedDocs"+i).val('0').selectmenu("refresh");
					document.getElementById('downloadedDocs'+i).options.length = 0;
					var combo1 = document.getElementById("downloadedDocs"+i);
					
					option = document.createElement("option");
					option.text = "Select";
					option.value ="0";
					try {
						combo1.add(option, null); //Standard 
					}catch(error) {
						combo1.add(option); // IE only
					}
					if(data.docsListArray.length!=0){
						$("#errorField").text("");
						for(var j=0;j<data.docsListArray.length;j++){
							var combo = document.getElementById("downloadedDocs"+i);
							option = document.createElement("option");
							option.text =  "Doc"+(j+1);
							option.value = data.docsListArray[j];
							try {
								combo.add(option, null); //Standard 
							}catch(error) {
								combo.add(option); // IE only
							}
						}
					}else {
						$("#errorField").text("No Documents Available");
						$(window).scrollTop(0);
					}					
				},error : function(jqXHR, textStatus, error) {
					alert("textStatus" + textStatus);
				}		
			});
}

function downloadDocs(selectedDocLocation) {
    $.mobile.showPageLoadingMsg();
	document.getElementById("selectedDocId").value=selectedDocLocation;
	document.getElementById("assignROFormId").method='POST';
	document.getElementById("assignROFormId").action=localStorage.contextPath+'/client/ci/downloadDocs';
	document.getElementById("assignROFormId").submit();
}