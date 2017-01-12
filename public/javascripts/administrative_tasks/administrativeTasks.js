$(document).ready(function() {
   if($("#menuPage").val() == "Edit Fund"){
       $('#fundCodeValue').prop('disabled', 'disabled');
   }else{
       $('#fundCodeValue').prop('disabled', '');
   }
});
function showFundCreationPage(menuName){
    $.mobile.showPageLoadingMsg();
    document.getElementById("administrativeTasksMenuID").method='GET';
    document.getElementById("administrativeTasksMenuID").action=localStorage.contextPath+"/client/ci/getAdministrativeTasksMenu/"+menuName;
    document.getElementById("administrativeTasksMenuID").submit();
}

function defineNewFund(viewType,id){
    $.mobile.showPageLoadingMsg();
    document.getElementById("administrativeFundFormID").method='POST';
    document.getElementById("administrativeFundFormID").action=localStorage.contextPath+"/client/ci/fund/defineNewFund/"+viewType+"/"+id;
    document.getElementById("administrativeFundFormID").submit();
}

function viewFunds(){
    $.mobile.showPageLoadingMsg();
    document.getElementById("administrativeFundFormID").method='POST';
    document.getElementById("administrativeFundFormID").action=localStorage.contextPath+"/client/ci/fund/viewFund";
    document.getElementById("administrativeFundFormID").submit();
}

function fundValidation(){
    var fundCodeValue = $('#fundCodeValue').val();
    var newFundName = ($('#newFundName').val()).trim();
    if(fundCodeValue == ""){
        $('#errorMsg').text('Please select Fund Code');
        return false;
    }else if(newFundName == ""){
        $('#errorMsg').text('Please Give Fund Name');
        return false;
    }
    return true;
}

function saveOrUpdateFund(saveType){
    var result = fundValidation();
    if(result){
        var fundValue = $("#fundCodeValue option:selected").text();
        $("#selectedFundValue").val(fundValue);
        $.mobile.showPageLoadingMsg();
        document.getElementById("administrativeFundFormID").method='POST';
        document.getElementById("administrativeFundFormID").action=localStorage.contextPath+"/client/ci/fund/saveOrUpdateFund/"+saveType;
        document.getElementById("administrativeFundFormID").submit();
    }
}

function defineGL(viewType){
    $.mobile.showPageLoadingMsg();
    document.getElementById("administrativeFundFormID").method='POST';
    document.getElementById("administrativeFundFormID").action=localStorage.contextPath+"/client/ci/gl/defineNewGL/"+viewType;
    document.getElementById("administrativeFundFormID").submit();
}

function viewGL(){
    $.mobile.showPageLoadingMsg();
    document.getElementById("administrativeFundFormID").method='POST';
    document.getElementById("administrativeFundFormID").action=localStorage.contextPath+"/client/ci/gl/viewGL";
    document.getElementById("administrativeFundFormID").submit();
}

function retriveFirstchildGLParent(viewType){
    var generalLedgerParentIdValue = $('#generalLedgerParentIdValue').val();
    if (generalLedgerParentIdValue =="" || generalLedgerParentIdValue ==0){
        $('#errorMsg').text('Please select GeneralLedger Parent');
        return false;
    }else{
        $.mobile.showPageLoadingMsg();
        document.getElementById("administrativeFundFormID").method='POST';
        document.getElementById("administrativeFundFormID").action=localStorage.contextPath+"/client/ci/gl/retriveFirstchildGLParent/"+viewType;
        document.getElementById("administrativeFundFormID").submit();
    }
}

function retriveSecondchildGLParent(viewType){
    var generalLedgerParentIdValue = $('#generalLedgerParentIdValue').val();
    var generalLedgerFirstChildIdValue = $('#generalLedgerFirstChildIdValue').val();
    if (generalLedgerParentIdValue =="" || generalLedgerParentIdValue ==0){
        $('#errorMsg').text('Please select GeneralLedger Parent');
        return false;
    }else if(generalLedgerFirstChildIdValue == "" || generalLedgerFirstChildIdValue ==0){
        $('#errorMsg').text('Please select GeneralLedger Parent');
        return false;
    }else{
        $.mobile.showPageLoadingMsg();
        document.getElementById("administrativeFundFormID").method='POST';
        document.getElementById("administrativeFundFormID").action=localStorage.contextPath+"/client/ci/gl/retriveSecondchildGLParent/"+viewType;
        document.getElementById("administrativeFundFormID").submit();
    }
}

function glValidation(saveType){
    if(saveType == 'create'){
        var generalLedgerParentIdValue = $('#generalLedgerParentIdValue').val();
        var generalLedgerFirstChildIdValue = $('#generalLedgerFirstChildIdValue').val();
        var generalLedgerSecondChildIdValue = $('#generalLedgerSecondChildIdValue').val();
        var generalLedgerCodeValue = ($('#generalLedgerCodeValue').val()).trim();
        var generalLedgerCodeName = ($('#generalLedgerCodeName').val()).trim();
        var officeId = $('#officeId').val();
        if(generalLedgerParentIdValue == "" || generalLedgerParentIdValue ==0){
            $('#errorMsg').text('Please select GeneralLedger Parent');
            return false;
        }else if(generalLedgerFirstChildIdValue == "" || generalLedgerFirstChildIdValue ==0){
            $('#errorMsg').text('Please select GeneralLedger Parent');
            return false;
        }else if(generalLedgerCodeValue ==""){
            $('#errorMsg').text('Please fill GeneralLedger Code');
            return false;
        }
        else if (generalLedgerCodeName ==""){
            $('#errorMsg').text('Please fill GeneralLedger Name');
            return false;
        }else if (officeId ==0 || officeId ==""){
            $('#errorMsg').text('Please select office name');
            return false;
        }
        else{
            return true;
        }
    }else if(saveType == 'update'){
        var generalLedgerCodeName = ($('#generalLedgerCodeName').val()).trim();
        if(generalLedgerCodeName == ""){
            $('#errorMsgEdit').text('Please fill GL account name');
            return false;
        }else{
            return true;
        }
    }
    else if (saveType = 'cancel'){
        $("#displayGL").show();
        $("#displayEditGL").hide();
        return false;
    }else{
        return false;
    }

}

function saveOrUpdateGL(saveType){
    var result = glValidation(saveType);
    if(result){
        var fundValue = $("#fundCodeValue option:selected").text();
        $("#selectedFundValue").val(fundValue);
        $.mobile.showPageLoadingMsg();
        document.getElementById("administrativeFundFormID").method='POST';
        document.getElementById("administrativeFundFormID").action=localStorage.contextPath+"/client/ci/gl/saveOrUpdateGL/"+saveType;
        document.getElementById("administrativeFundFormID").submit();
    }
}

function EditGL(value,selectedCoaId){
    $("#displayGL").hide();
    for (var j = 0; j < value.length; ++j) {
        if (value[j].coa_id == selectedCoaId) {
            $("#generalLedgerCode").val(value[j].gl_value);
            $("#generalLedgerCodeName").val(value[j].coa_name);
            $("#officeId").val(value[j].display_name);
            $("#bankOrCashId").val(value[j].entity_name);
            $("#coaId").val(value[j].coa_id);
        }
    }
    $("#displayEditGL").show();

}


function generateFundCode(){
    if($("#newFundCode").val() == "" || $("#newFundCode").val() == null){
        $('#errorMsg').text('Please give the Fund Code');
    }else{
        $.mobile.showPageLoadingMsg();
        document.getElementById("administrativeFundFormID").method='POST';
        document.getElementById("administrativeFundFormID").action=localStorage.contextPath+"/client/ci/fund/generateFundCode";
        document.getElementById("administrativeFundFormID").submit();
    }
}
