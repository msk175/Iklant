$(document).ready(function() {
if($("#groupIdHidden").val().length ==0) {
$("#assignFOSaveButton").hide();
}
});


var hiddengroupname = new Array();


function assign(val,groupIds,isChecked){
if(isChecked){
	hiddengroupname.push(groupIds);
}else{
	hiddengroupname.pop(groupIds);
}
}


function assignToFO(){
    if(document.getElementById("foNames").value != 0) {
		if(hiddengroupname.length>0){
            $.mobile.showPageLoadingMsg();
			document.getElementById("assignID").value=hiddengroupname;
			document.getElementById("BMFormId").action=localStorage.contextPath+"/client/ci/groups/assignFO/savegroupsassignFO";
			document.getElementById("BMFormId").method="POST";
			document.getElementById("BMFormId").submit().refresh();
		}else{
			alert("Select atleast one Group to assign");
		}
	}
	else {
		alert("Select Field Officer");
	}
}

function openPopup(group_name,center_name,val,group_id,isChecked){
    $('#errorMessageIdFirstRow').text("");
    $('#errorMessageIdSecondRow').text("");
    if(isChecked){
        $.post("http://"+ajaxcallip+localStorage.contextPath+"/client/ci/groups/loadClients",
            { group_id: group_id},
            function(data){
                if(data.status){
                    showActiveRejectedClients(group_name,center_name,data);
                    val.checked = 'checked';
                    hiddengroupname.push(group_id);
                }
                else{
                    $('#'+group_id).prop("checked",false).checkboxradio('refresh');
                    $('#errorMessageIdFirstRow').text("You cannot assign this group to FO.");
                    if(data.reintiatedClients.length>1) {
                        $('#errorMessageIdSecondRow').text("Because " + data.reintiatedClients + " are re-initiated & waiting for Regional Manager's approval");
                    }else {
                        $('#errorMessageIdSecondRow').text("Because " + data.reintiatedClients + " is re-initiated & waiting for Regional Manager's approval")
                    }
                }
            }
        );
    }else{
        hiddengroupname.pop(group_id);
    }
}

function showActiveRejectedClients(group_name,center_name,activeOrRejectedClients) {
    $(".content,.headingContent").remove();
    $("#activeOrRejectedClients" ).popup( "open" );
    var newDiv = '<div data-role="content" data-theme="a" class="content-primary" class="clientsPopup">';
    $("#activeOrRejectedClients").append(newDiv).trigger('create');

    var heading = '<div data-role="horizontal"  data-theme="a"  data-overlay-theme="a" class="ui-grid-a headingContent" style="width:300px;padding: 5px 5px 5px 10px">' +
        '<div class="ui-block-a" style="width:15%;">' +
        '<div data-role="fieldcontain">' +
        '<img for="name" src="/images/edit.png" height="40" width="40"/></div></div>' +
        '<div class="ui-block-b" style="width:85%;padding-top:2px ">' +
        '<div data-role="fieldcontain">' +
        '<h4 id="name">'+group_name+' | '+center_name+'</h4></div></div></div>';

    $(".clientsPopup").append(heading);
    for(var i=0;i<activeOrRejectedClients.clientDetails.length;i++) {
        if(activeOrRejectedClients.rejectedDetails[i] == 0 && activeOrRejectedClients.reinitiatedDetails[i] == 0){
            var newContent ='<div  data-split-theme="b"  data-overlay-theme="b" class="ui-bar-b content" style="height: 25px;padding: 5px 5px 5px 10px">';
            newContent += '<span>'+activeOrRejectedClients.clientDetails[i]+'</span></div>';
        }else if(activeOrRejectedClients.rejectedDetails[i] == 0 && activeOrRejectedClients.reinitiatedDetails[i] == 1){
            var newContent ='<div data-split-theme="b"  data-overlay-theme="b" class="ui-bar-b content"  style="height: 25px;padding: 5px 5px 5px 10px">';
            newContent += "<span style='color:#E6E39D'>"+activeOrRejectedClients.clientDetails[i]+"</span></div>";
        }
        else{
            var newContent ='<div data-split-theme="b"  data-overlay-theme="b" class="ui-bar-b content"  style="height: 25px;padding: 5px 5px 5px 10px">';
            newContent += "<span style='color:#ff070c'>"+activeOrRejectedClients.clientDetails[i]+"</span>";
            if (activeOrRejectedClients.lastCreditCheckDate[i].indexOf('Rejected') > -1){
                newContent += "<span style='color:#fffff7'> &nbsp;&nbsp;"+activeOrRejectedClients.lastCreditCheckDate[i]+"</span></div>";
            }
            else{
                newContent += "<span style='color:#fffff7'> &nbsp;&nbsp;Last Credit Check Date: </span><span style='color:#fdff5a'>"+activeOrRejectedClients.lastCreditCheckDate[i]+"</span></div>";
            }
        }
    $(".clientsPopup").append(newContent).trigger('create');
    }
}
