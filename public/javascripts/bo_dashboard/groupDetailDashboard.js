$(document).ready(function() {


    $(function () {
        $('#mainSplitter').jqxSplitter({
            width: '100%', height: '800', panels: [
                {size: '60%'},
                {size: '40%'}
            ]
        });
    });

});

function regionalWiseGroupCountDashBoard(){

    document.getElementById("BMFormId").method = 'GET';
    document.getElementById("BMFormId").action = localStorage.contextPath + "/client/ci/getGroupCount/regionWise";
    document.getElementById("BMFormId").submit();

}

function branchWiseGroupCountDashBoard(regionalOfficeId,regionalOfficeName){

    document.getElementById("BMFormId").method = 'POST';
    document.getElementById("BMFormId").action = localStorage.contextPath + "/client/ci/getGroupCount/branchWise/" +regionalOfficeId + "/" + regionalOfficeName;
    document.getElementById("BMFormId").submit();

}

function statusWiseGroupCountDashBoard(branchOfficeId,branchOfficeName,regionalOfficeName){

    document.getElementById("BMFormId").method = 'POST';
    document.getElementById("BMFormId").action = localStorage.contextPath + "/client/ci/getGroupStatusCount/branch/" +branchOfficeId + "/" + branchOfficeName + "/" + regionalOfficeName;
    document.getElementById("BMFormId").submit();

}

function getClientListForSelectedGroup(groupId,groupName) {

    var data = {};
    data.groupId = groupId;
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
        url: 'http://'+ajaxcallip+localStorage.contextPath+'/client/ci/retrieveClientCurrentStatus',
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
            newContent+= "Client Status";
            newContent+='</th>';
            newContent+='<th>';
            newContent+= "Hold History";
            newContent+='</th>';
            newContent+='</tr>';
            $("#clientListTableId").append(newContent).trigger('create');
            if(data.clientStatusObject.clientNameList.length>0){
                for(var i=0;i<data.clientStatusObject.clientNameList.length;i++) {
                    var newContent ='<tr class = "showhide">';
                    newContent+='<td>';
                    newContent+= i+1;
                    newContent+='</td>';
                    newContent+='<td>';
                    newContent+= "<a href='JavaScript:dataEntryOperatorList(" + data.clientStatusObject.clientIdList[i] + "," + i + ","+JSON.stringify(data.clientStatusObject.clientNameList[i])+")' ,id='holdHistory" + i + "' , data-rel='popup', title='DEO Done By List', data-position-to='window', data-transition='pop'> "+data.clientStatusObject.clientNameList[i]+" </a>" ;
                    newContent+='</td>';
                    newContent += '<td>';
                    newContent += data.clientStatusObject.clientStatusList[i];
                    newContent+='</td>';
                    newContent += '<td>';
                    newContent+= "<a href='JavaScript:checkHoldHistoryMember(" + data.clientStatusObject.clientIdList[i] + "," + i + ","+JSON.stringify(data.clientStatusObject.clientNameList[i])+")' ,id='holdHistory" + i + "' , data-rel='popup', data-position-to='window', data-transition='pop'> Hold History </a>" ;
                    newContent+='</td>';
                    newContent+='</tr>';
                    $("#clientListTableId").append(newContent).trigger('create');
                }
            }else{
                var newContent ='<tr class = "showhide">';
                newContent+='<td>';
                newContent+= "";
                newContent+='</td>';
                newContent+='<td>';
                newContent+= "No Records To Display!";
                newContent+='</td>';
                newContent+='</tr>';
                $("#clientListTableId").append(newContent).trigger('create');
            }
            //document.getElementById("clientCurrentStatus").href= "#recentActivityPopup";
            //$("#clientCurrentStatus").trigger('click');
            //document.getElementById("clientCurrentStatus").href= "JavaScript:clientCurrentStatus();";
            $('#imageNameRightPanel').text(groupName + " Client List");
            $(".buttonWrapperRightPannel").show();

        },error : function(jqXHR, textStatus, error) {
            alert("textStatus"+textStatus);
            alert("error"+error);

        }
    });
}

function checkHoldHistoryMember(clientId,holdIndex,memberName){
    if(clientId !=0){
        $("#poupHeaderId").text("Hold History Details for " + memberName);
        var data = {};
        data.clientId = clientId;
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
            url: 'http://'+ajaxcallip+localStorage.contextPath+'/client/ci/client/memberHoldHistory',
            success: function(data) {
                $('table').remove('#holdHistoryTableId');
                var newContent = '<table id="holdHistoryTableId">';
                $("#holdHistoryDivId").append(newContent).trigger('create');
                var newContent ='<tr>';
                newContent+='<th>';
                newContent+= "S.NO";
                newContent+='</th>';
                newContent+='<th>';
                newContent+= "Document Name";
                newContent+='</th>';
                newContent+='<th>';
                newContent+= "Remarks";
                newContent+='</th>';
                newContent+='<th>';
                newContent+= "Hold Given BY";
                newContent+='</th>';
                newContent+='<th>';
                newContent+= "Date & Time";
                newContent+='</th>';
                newContent+='</tr>';
                $("#holdHistoryTableId").append(newContent).trigger('create');
                if(data.holdBy.length>0){
                    for(var i=0;i<data.holdBy.length;i++) {
                        var newContent ='<tr class = "showhide">';
                        newContent+='<td>';
                        newContent+= i+1;
                        newContent+='</td>';
                        newContent+='<td>';
                        newContent += data.docNameArray[i];
                        newContent+='</td>';
                        newContent+='<td>';
                        newContent+= data.remarks[i];
                        newContent+='</td>';
                        newContent+='<td>';
                        newContent+= data.holdBy[i];
                        newContent+='</td>';
                        newContent+='<td>';
                        newContent+= data.date[i];
                        newContent+='</td>';
                        newContent+='</tr>';
                        $("#holdHistoryTableId").append(newContent).trigger('create');

                    }
                }else{
                    var newContent ='<tr class = "showhide">';
                    newContent+='<td>';
                    newContent+= "";
                    newContent+='</td>';
                    newContent+='<td>';
                    newContent+= "No Records To Display!";
                    newContent+='</td>';
                    newContent+='</tr>';
                    $("#holdHistoryTableId").append(newContent).trigger('create');
                }
                $("#recentActivityPopup").popup('open');
                //document.getElementById("custommainTab").href= "#recentActivityPopup";
                //$("custommainTab").trigger('click');
                //document.getElementById("custommainTab").href= "JavaScript:checkHoldHistoryMember("+clientId+","+holdIndex+");";
            },error : function(jqXHR, textStatus, error) {
                alert("textStatus"+textStatus);
                alert("error"+error);

            }
        });
    }else{
        $("#errorLabelId").text("Please Select a Member Name");
    }
}

function dataEntryOperatorList(clientId,holdIndex,memberName) {

    if(clientId !=0){
        $("#poupHeaderId").text("BO Operations Done By List For " + memberName);
        var data = {};
        data.clientId = clientId;
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
            url: 'http://'+ajaxcallip+localStorage.contextPath+'/client/ci/deoListForClient/'+clientId,
            success: function(data) {
                $('table').remove('#holdHistoryTableId');
                var newContent = '<table id="holdHistoryTableId">';
                $("#holdHistoryDivId").append(newContent).trigger('create');
                var newContent ='<tr>';
                newContent+='<th>';
                newContent+= "S.NO";
                newContent+='</th>';
                newContent+='<th>';
                newContent+= "BO Operation";
                newContent+='</th>';
                newContent+='<th>';
                newContent+= "Done By";
                newContent+='</th>';
                newContent+='</tr>';
                $("#holdHistoryTableId").append(newContent).trigger('create');
                var newContent ='<tr class = "showhide">';
                newContent+='<td>';
                newContent+= 1;
                newContent+='</td>';
                newContent+='<td>';
                newContent += 'Data Entry';
                newContent+='</td>';
                newContent+='<td>';
                newContent+= data.deoListJson.dataEntryBy;
                newContent+='</td>';
                newContent+='</tr>';
                $("#holdHistoryTableId").append(newContent).trigger('create');
                var newContent ='<tr class = "showhide">';
                newContent+='<td>';
                newContent+= 2;
                newContent+='</td>';
                newContent+='<td>';
                newContent += 'Data Verification';
                newContent+='</td>';
                newContent+='<td>';
                newContent+= data.deoListJson.dataVerifiedBy;
                newContent+='</td>';
                newContent+='</tr>';
                $("#holdHistoryTableId").append(newContent).trigger('create');
                var newContent ='<tr class = "showhide">';
                newContent+='<td>';
                newContent+= 3;
                newContent+='</td>';
                newContent+='<td>';
                newContent += 'Data Entry Updation';
                newContent+='</td>';
                newContent+='<td>';
                newContent+= data.deoListJson.dataEntryUpdatedBy;
                newContent+='</td>';
                newContent+='</tr>';
                $("#holdHistoryTableId").append(newContent).trigger('create');
                var newContent ='<tr class = "showhide">';
                newContent+='<td>';
                newContent+= 4;
                newContent+='</td>';
                newContent+='<td>';
                newContent += 'CBA';
                newContent+='</td>';
                newContent+='<td>';
                newContent+= data.deoListJson.creditCheckBy;
                newContent+='</td>';
                newContent+='</tr>';
                $("#holdHistoryTableId").append(newContent).trigger('create');
                $("#recentActivityPopup").popup('open');
            },error : function(jqXHR, textStatus, error) {
                alert("textStatus"+textStatus);
                alert("error"+error);

            }
        });
    }

}