function populateGroup(officeId,userId,statusId) {
	$('div').remove('#divId');
	var newContent = '<div data-role="content" data-theme="a" class="content-primary" id="divId">';
	$("#count").append(newContent).trigger('create');

	var officeId = officeId;
	var userId = userId;
	var statusId = statusId;
	
		var data = {};
		data.officeId = officeId;
		data.userId = userId;
		data.statusId = statusId;
		
		ajaxVariable = $.ajax({
			type: 'POST',
			data: JSON.stringify(data),
			contentType: 'application/json',
			url: "http://"+ajaxcallip+localStorage.contextPath+"/client/ci/populateGroups",
			success: function(data) {
				var grpNameArray = data.groupNameArray;
				var centerNameArray = data.centerNameArray;
				
				for(var i=0;i<grpNameArray.length;i++) {
					
					var inc =0;
					var newContent ='<ul data-role="listview", data-split-theme="a", data-overlay-theme="a",class="ui-bar-a ui-corner-all">';
					newContent += '<li>';
					newContent += '<a href=""><img src="/images/edit.png">';
					newContent += "<h3 for='name'"+inc+" id='name"+inc+"'>"+grpNameArray[i]+"</h3>";
					newContent += "<label for='name'"+inc+" id='name"+inc+"'>"+centerNameArray[i]+"</label>";
					newContent += '<a href="">';
					newContent += '</a>';
					newContent += '</a>';
					newContent += '</li>';
					newContent += '</ul>';
					$("#divId").append(newContent).trigger('create');
					//document.getElementById("labelGroupsId").innerHTML = "Hello";
				
			}
			$("#divId").listview("refresh");
			},
		});
}
function populateRejectedGroup(officeId,userId,statusId) {
	$('div').remove('#divId');
	var newContent = '<div data-role="content" data-theme="a" class="content-primary" id="divId">';
	$("#count").append(newContent).trigger('create'); 

	var officeId = officeId;
	var userId = userId;
	var statusId = statusId;
	
		var data = {};
		data.officeId = officeId;
		data.userId = userId;
		data.statusId = statusId;
		
		ajaxVariable = $.ajax({
            type: 'POST',
			data: JSON.stringify(data),
			contentType: 'application/json',
			url: "http://"+ajaxcallip+localStorage.contextPath+"/client/ci/populateRejectedGroups",
			success: function(data) {
				var grpNameArray = data.groupNameArray;
				var centerNameArray = data.centerNameArray;
				var statusDescArray = data.statusDescArray;
				
				for(var i=0;i<grpNameArray.length;i++) {
					
					var inc =0;
					var newContent ='<ul data-role="listview", data-split-theme="a", data-overlay-theme="a",class="ui-bar-a ui-corner-all">';
					newContent += '<li>';
					newContent += '<a href=""><img src="/images/edit.png">';
					newContent += "<h3 for='name'"+inc+" id='name"+inc+"'>"+grpNameArray[i]+" | "+statusDescArray[i]+" </h3>";
					newContent += "<label for='name'"+inc+" id='name"+inc+"'>"+centerNameArray[i]+"</label>";
					newContent += '<a href="">';
					newContent += '</a>';
					newContent += '</a>';
					newContent += '</li>';
					newContent += '</ul>';
					$("#divId").append(newContent).trigger('create');
					//document.getElementById("labelGroupsId").innerHTML = "Hello";
				
			}
			$("#divId").listview("refresh");
			}
		});
}