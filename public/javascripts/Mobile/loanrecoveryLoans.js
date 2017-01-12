$(document).ready(function() {
	if($("#OfficeIdhidden").val() == 1){
		$("#folistlabeldiv").hide();
		$("#folistdropdowndiv").hide();
	}
	if($("#roleIdHidden").val() == bmRoleId){
		$("#officelistlabeldiv").hide();
		$("#officelabeldiv").hide();
	}

});
		$('#futureLoansTableId').on('click', '.edit', function () {
			var th = $('#futureLoansTableId th').eq(0);
			alert(th.text()); // returns text of respective header
		});
		
function formatNextDateForUI(tempDate, addDays) {
	//var now = new Date(tempDate);
	var now = tempDate;
	now.setDate(now.getDate() + parseInt(addDays));
	var curr_date = ("0" + now.getDate()).slice(-2);
	var curr_month = ("0" + (now.getMonth() + 1)).slice(-2);
	var curr_year = now.getFullYear();
	//var tempDate = curr_date+"/"+curr_month+"/"+curr_year;
	var tempDate = curr_year+"-"+curr_month+"-"+curr_date;
	if(isNaN(curr_date)) {
		tempDate = "";
	}
	return tempDate;
}
	
function populateFutureDueGroup(thisID) {
	for(var i=1;i<=7;i++) {
		$('#todayHeader'+i).css('color', 'white');
		$('#todayHeaderTH'+i).css('background-color', '');
	}
	
	$(thisID).css('color', 'blue');
	$('#todayHeaderTH'+$(thisID).text()).css('background-color', 'white');

	//alert(formatNextDateForUI(new Date(),$(thisID).text()));
		requestedDate = formatNextDateForUI(new Date(),$(thisID).text());
		var data = {};
		data.requestedDate = requestedDate;
				
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
			url: 'http://'+ajaxcallip+localStorage.contextPath+'/client/ci/futureDueLoansajax/dateajaxcall',						
			success: function(data) {
				$("#errorLabel").text("");
				$("#futureLoansUl li").remove();
				//alert(data.loanDetails[0].loanAccountId);
				if(data.loanDetails.length == 0) {
					$("#errorLabel").text("No Accounts found");
				}
				else {
					for(var i=0;i<data.loanDetails.length;i++) {
						var inc =0;
						var newContent = '<li>';
						newContent += '<a href="JavaScript:showApplyPaymentScreen('+data.loanDetails[i].loanAccountId+',\''+data.loanDetails[i].globalAccountNum+'\',\''+data.loanDetails[i].clientName+'\');"><img src="/images/edit.png">';
						//newContent += "<h3 for='name'"+inc+" id='name"+inc+"'>"+data.loanDetails[i].clientName+" | Group Code :"+data.loanDetails[i].customerCustomNumber+"</h3>";
						newContent += "<h3 for='name'"+inc+" id='name"+inc+"'>"+data.loanDetails[i].clientName+" | Group Code :</h3>";
						newContent += "<label for='name'"+inc+" id='name"+inc+"'>Loan Number : "+data.loanDetails[i].globalAccountNum+" | Due Date : "+data.loanDetails[i].actionDate+"</label>";
						/*newContent += '<a href="">';
						newContent += '</a>';*/
						newContent += '</a>';
						newContent += '</li>';
						$("#futureLoansUl").append(newContent).trigger('create');
						inc++;					
					}
					$("#futureLoansUl").listview("refresh");
				}
			
			},
		});
	/*} else {
		$("#listnpa li").remove();
	}*/
}

function populatePopupMenu(accountId,globalAcountNum,clientName) {
	$('#accountIdForPopup').val(accountId);
	$('#globalAccountNumberForPopup').val(globalAcountNum);
	$('#clientNameForPopup').val(clientName);
	document.getElementById('menuSelectPopupButton').href= "#menuSelectPopup";
	$("#menuSelectPopupButton").trigger('click');
}

function showApplyPaymentScreenFromPopup() {
	//alert();
	$('#accountId').val($('#accountIdForPopup').val());
	$('#globalAccountNum').val($('#globalAccountNumberForPopup').val());
	$('#clientName').val($('#clientNameForPopup').val());
	document.getElementById("loanListFormID").method='POST';
	document.getElementById("loanListFormID").action=localStorage.contextPath+"/client/ci/applyPaymentForFO";
	document.getElementById("loanListFormID").submit();
}

function getGroupDetailsForLoanRecoveryFromPopup() {
	var accountId = $('#accountIdForPopup').val();
	document.getElementById("loanListFormID").method='POST';
	document.getElementById("loanListFormID").action=localStorage.contextPath+"/client/ci/"+accountId+"/retrieveGroupDetails/1";
	document.getElementById("loanListFormID").submit();
}

function showApplyPaymentScreen(accountId,globalAcountNum,clientName) {
	$('#accountId').val(accountId);
	$('#globalAccountNum').val(globalAcountNum);
	$('#clientName').val(clientName);
	document.getElementById("loanListFormID").method='POST';
	document.getElementById("loanListFormID").action=localStorage.contextPath+"/client/ci/applyPaymentForFO";
	document.getElementById("loanListFormID").submit();
}

function search(){
	if($("#serachgroupId").val() == ""){
		var errorLabelMember = "Please Enter group Name to Search";
		document.getElementById("errorLabel").innerText = errorLabelMember;
		$(window).scrollTop(0);
	}else{
		document.getElementById("errorLabel").innerText = "";
		document.getElementById("loanListFormID1").method='POST';
		document.getElementById("loanListFormID1").action=localStorage.contextPath+"/client/ci/search";
		document.getElementById("loanListFormID1").submit();
	}
}
function showLoansList(globalCustomerNum,groupName,customerId){
	$('#clientName').val(groupName);
	$('#customerId').val(customerId);
	document.getElementById("loanListFormID").method='POST';
	document.getElementById("loanListFormID").action=localStorage.contextPath+"/client/ci/loanrecovery/groups/"+globalCustomerNum+"/loanaccounts";
	document.getElementById("loanListFormID").submit();
}
function getFutureDueLoansForBranch(officeId){
	document.getElementById("loanListFormID2").method='GET';
	document.getElementById("loanListFormID2").action=localStorage.contextPath+"/client/ci/futureDueLoans";
	document.getElementById("loanListFormID2").submit();
}function getDueLoansForBranch(officeId){
	document.getElementById("loanListFormID2").method='GET';
	document.getElementById("loanListFormID2").action=localStorage.contextPath+"/client/ci/loanrecoveryLoans";
	document.getElementById("loanListFormID2").submit();
}function getPastDueLoansForBranch(officeId){
	document.getElementById("loanListFormID2").method='GET';
	document.getElementById("loanListFormID2").action=localStorage.contextPath+"/client/ci/pastDueLoans";
	document.getElementById("loanListFormID2").submit();
}
