$(document).ready(function() {
    if($('#editRoleName').val() == "") {
        $("#editRPDiv").hide();
        $("#tableviewdivRole").show();
    }else{
        $("#editRPDiv").show();
        $("#tableviewdivRole").hide();
    }
    $("#roleNameIdEdit").keydown(function(event){
        return ( (event.keyCode >= 65 && event.keyCode  <= 90) || (event.keyCode == 8 || event.keyCode  == 9 || event.keyCode  == 32 || event.keyCode  == 37 || event.keyCode  == 39 || event.keyCode  == 46) );
    });
    $("#roleDescIdEdit").keydown(function(event) {
        if((!event.shiftKey && event.keyCode == 222) || event.keyCode == 220) {
            return false;
        }
    });
    $("#editRPDiv").click(function(){
        $("#editRPDiv").show();
    });
    $("[id*=TreeView1] input[type=checkbox]").bind("click", function () {
        event.preventDefault();
    });
});

function populateRolePermissionDetails(roleEditId) {
    var roleId = roleEditId;
    $("#editRPDiv").show();
    $("#tableviewdivRole").hide();
    document.getElementById("BMFormId").method='POST';
    document.getElementById("BMFormId").action=localStorage.contextPath+"/client/ci/populateRolesAndPermissionsDetails/"+roleId;
    document.getElementById("BMFormId").submit();
}

function checkAll()
{
    var checkboxes = document.getElementsByTagName('input'), val = null;
    for (var i = 0; i < checkboxes.length; i++)
    {
        if (checkboxes[i].type == 'checkbox')
        {
            if (val === null) val = checkboxes[i].checked;
            checkboxes[i].checked = val;
        }
    }
}

function checkAllBox() {
    $("[id*=TreeView1] input[type=checkbox]").bind("click", function () {
        /*var table = $(this).closest("table");
        if (table.next().length > 0 && table.next()[0].tagName == "DIV") {
            //Is Parent CheckBox
            var childDiv = table.next();
            var isChecked = $(this).is(":checked");
            $("input[type=checkbox]", childDiv).each(function () {
                if (isChecked) {
                    $(this).attr("checked", "checked");
                } else {
                    $(this).removeAttr("checked");
                }
            });
        } else {
            //Is Child CheckBox
            var parentDIV = $(this).closest("DIV");
            if ($("input[type=checkbox]", parentDIV).length == $("input[type=checkbox]:checked", parentDIV).length) {
                $("input[type=checkbox]", parentDIV.prev()).attr("checked", "checked");
            } else {
                $("input[type=checkbox]", parentDIV.prev()).removeAttr("checked");
            }
        } */
        event.preventDefault();
        //$("[id*=TreeView1] input[type=checkbox]").unbind("click");
    });
}

function backEditRole(operationId){
    $("#editRPDiv").hide();
    document.getElementById("BMFormId").method='POST';
    document.getElementById("BMFormId").action=localStorage.contextPath+"/client/ci/groups/operation/"+operationId;
    document.getElementById("BMFormId").submit();
}

function populateRolePermissionByParentDetails(activityId) {
    $("#editRPDiv").show();
    $("#tableviewdivRole").hide();
    var roleId = $('#editRoleId').val();
    document.getElementById("rolesAndPermissionsFormId").method='POST';
    document.getElementById("rolesAndPermissionsFormId").action=localStorage.contextPath+"/client/ci/populateRolesAndPermissionsByParentDetails/"+activityId+"/"+roleId;
    document.getElementById("rolesAndPermissionsFormId").submit();
}
