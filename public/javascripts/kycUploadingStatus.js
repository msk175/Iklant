/**
 * Created by Ezra Johnson on 8/8/14.
 */


function openKYCUploadStatus(group_id, group_name, center_name, field_officer) {
    $.mobile.showPageLoadingMsg();
    document.getElementById("groupName").value = group_name;
    document.getElementById("centerName").value = center_name;
    document.getElementById("fieldOfficer").value = field_officer;
    document.getElementById("groupId").value = group_id;

    document.getElementById("BMFormId").method='POST';
    document.getElementById("BMFormId").action=localStorage.contextPath+"/client/ci/groups/member/kycUploadStatus";
    document.getElementById("BMFormId").submit();
}

function moveToDataEntry(group_id) {
    $.mobile.showPageLoadingMsg();
    document.getElementById("BMFormId").method='POST';
    document.getElementById("BMFormId").action=localStorage.contextPath+"/client/ci/groups/member/moveForDataEntry/"+group_id;
    document.getElementById("BMFormId").submit();
}

function backInKYCdetailsPage() {
    $.mobile.showPageLoadingMsg();
    document.getElementById("BMFormId").method='POST';
    document.getElementById("BMFormId").action=localStorage.contextPath+"/client/ci/groups/operation/"+kycUpdatingStatusOperationId;
    document.getElementById("BMFormId").submit();
}

