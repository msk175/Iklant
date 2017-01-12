$(document).ready(function() {

$('#todayHeader1').text(formatNextDateForUI(new Date(),1));
$('#todayHeader2').text(formatNextDateForUI(new Date(),2));
$('#todayHeader3').text(formatNextDateForUI(new Date(),3));
$('#todayHeader4').text(formatNextDateForUI(new Date(),4));
$('#todayHeader5').text(formatNextDateForUI(new Date(),5));


function formatNextDateForUI(tempDate, addDays) {
	//var now = new Date(tempDate);
	var now = tempDate;
	now.setDate(now.getDate() + parseInt(addDays));
	var curr_date = ("0" + now.getDate()).slice(-2);
	var curr_month = ("0" + (now.getMonth() + 1)).slice(-2);
	var curr_year = now.getFullYear();
	var tempDate = curr_date+"/"+curr_month+"/"+curr_year;
	if(isNaN(curr_date)) {
		tempDate = "";
	}
	return tempDate;
}

});

function formatNextDateForService(tempDate, addDays) {
	//var now = new Date(tempDate);
	var now = tempDate;
	now.setDate(now.getDate() + parseInt(addDays));
	var curr_date = ("0" + now.getDate()).slice(-2);
	var curr_month = ("0" + (now.getMonth() + 1)).slice(-2);
	var curr_year = now.getFullYear();
	var tempDate = curr_year+"-"+curr_month+"-"+curr_date;
	if(isNaN(curr_date)) {
		tempDate = "";
	}
	return tempDate;
}

function populateGroup(dueIndicator,officeId,personnelId) {
	$('div').remove('#groupListPopup');
	/*var newContent = '<div data-role="content" data-theme="a" class="content-primary" id="groupListPopup">';
	$("#count").append(newContent).trigger('create');*/
	if(dueIndicator == 11) {
		var data = {};
		data.officeId = officeId;
		data.personnelId = personnelId;
				
		ajaxVariable = $.ajax({
			beforeSend : function() {
				$.mobile.showPageLoadingMsg();
			},
			complete: function() {
				$.mobile.hidePageLoadingMsg();
			},
			type: 'POST',
			data: JSON.stringify(data),
			contentType: 'application/json',
			url: 'http://'+ajaxcallip+localStorage.contextPath+'/client/ci/pastDueLoansAjaxCall',
			success: function(data) {
                $.mobile.hidePageLoadingMsg();
				//$("#errorLabel").text("");
				//$("#futureLoansUl li").remove();
				//alert(data.loanDetails[0].loanAccountId);
				//alert(data.loanDetails.length);
				showPopUpGroups(data.loanDetails,0);
		
			}
		});
	
	} else if(dueIndicator == 22) {
		var data = {};
		data.officeId = officeId;
		data.personnelId = personnelId;
				
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
			url: 'http://'+ajaxcallip+localStorage.contextPath+'/client/ci/loanrecoveryLoansAjaxCall',
			success: function(data) {
                $.mobile.hidePageLoadingMsg();
				//$("#errorLabel").text("");
				//$("#futureLoansUl li").remove();
				//alert(data.loanDetails[0].loanAccountId);
				//alert(data.loanDetails.length);
				showPopUpGroups(data.loanDetails,1);
		
			}
		});		
	
	} else if(dueIndicator == 1 || dueIndicator == 2 || dueIndicator == 3 || dueIndicator == 4 || dueIndicator == 5) {
		requestedDate = formatNextDateForService(new Date(),dueIndicator);		
		var data = {};		
		data.requestedDate = requestedDate;
		data.officeId = officeId;
		data.personnelId = personnelId;
				
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
                $.mobile.hidePageLoadingMsg();
				//$("#errorLabel").text("");
				//$("#futureLoansUl li").remove();
				//alert(data.loanDetails[0].loanAccountId);
				//alert(data.loanDetails.length);
				showPopUpGroups(data.loanDetails,2);
		
			}
		});	
	}
}

function showPopUpGroups(loanDetails,redirectionValue) {
	var newContent = '<div data-role="content" data-theme="a" class="content-primary" id="groupListPopup">';
	$("#count").append(newContent).trigger('create');
	if(loanDetails.length == 0) {
		$("#errorLabel").text("No Accounts found");
	}
	else {
		for(var i=0;i<loanDetails.length;i++) {
			var inc =0;
			var newContent ='<ul data-role="listview", data-split-theme="a", data-overlay-theme="a",class="ui-bar-a ui-corner-all">';
			newContent += '<li>';
			newContent += '<a href="Javascript:showApplyPaymentScreenFromAdmin('+loanDetails[i].loanAccountId+',\''+loanDetails[i].globalAccountNum+'\',\''+loanDetails[i].clientName+'\','+redirectionValue+')"><img src="/images/edit.png">';
			newContent += "<h3 for='name' id='name'>"+loanDetails[i].clientName+"</h3>";
			newContent += "<label for='name' id='name'>Due Date : "+loanDetails[i].actionDate+" | Group Code : "+loanDetails[i].groupCode+"</label>";
			newContent += '<a href="">';
			newContent += '</a>';
			newContent += '</a>';
			newContent += '</li>';
			newContent += '</ul>';
			$("#groupListPopup").append(newContent).trigger('create');
			//document.getElementById("labelGroupsId").innerHTML = "Hello";
		}
		$("#groupListPopup").listview("refresh");
	}
}

function populateDueGroup() {
	$('div').remove('#groupListPopup');
	var newContent = '<div data-role="content" data-theme="a" class="content-primary" id="groupListPopup">';
	$("#count").append(newContent).trigger('create'); 

	for(var i=0;i<2;i++) {
		var inc =0;
		var newContent ='<ul data-role="listview", data-split-theme="a", data-overlay-theme="a",class="ui-bar-a ui-corner-all">';
		newContent += '<li>';
		newContent += '<a href="Javascript:showApplyPaymentScreenFromAdmin(27127,\'000100000027127\',\'Malargal(NML)Magalir Group\')"><img src="/images/edit.png">';
		newContent += "<h3 for='name' id='name'>Nilla Mahalir group(SHG)</h3>";
		newContent += "<label for='name' id='name'>Due Date : 13-09-2013</label>";
		newContent += '<a href="">';
		newContent += '</a>';
		newContent += '</a>';
		newContent += '</li>';
		newContent += '</ul>';
		$("#groupListPopup").append(newContent).trigger('create');
		//document.getElementById("labelGroupsId").innerHTML = "Hello";
	}
	$("#groupListPopup").listview("refresh");
}

function showApplyPaymentScreenFromAdmin(accountId,globalAcountNum,clientName,redirectionId) {
    $.mobile.showPageLoadingMsg();
	$('#redirectionPageId').val(redirectionId);
	$('#accountId').val(accountId);
	$('#globalAccountNum').val(globalAcountNum);
	$('#clientName').val(clientName);
	document.getElementById("loanListFormID2").method='POST';
	document.getElementById("loanListFormID2").action=localStorage.contextPath+"/client/ci/applyPaymentForFO";
	document.getElementById("loanListFormID2").submit();
}

function getFutureDueLoansForManagers(officeId){
    $.mobile.showPageLoadingMsg();
	document.getElementById("loanListFormID2").method='POST';
	document.getElementById("loanListFormID2").action=localStorage.contextPath+"/client/ci/dueloansformanager/WhileOfficeChange";
	document.getElementById("loanListFormID2").submit();
}