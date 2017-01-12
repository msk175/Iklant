$(document).ready(function () {
   /*$(document).bind("contextmenu", function (e) {
        return false;
   });*/
    var mobCheckBox = $("input[id=mobileNumber]");
    var landCheckBox = $("input[id=landlineNumber]");

    mobCheckBox.on("change", function (e) {
        if (e.target.checked) {
            $('#mobileNumberDiv').show();
            $('#message').text('');
            $('#newMobileNumber').focus();
        }
        else {
            $('#mobileNumberDiv').hide();
            $('#errorKYCMessage').text('');
        }
    });

    landCheckBox.on("change", function (e) {
        if (e.target.checked) {
            $('#landLineNumberDiv').show();
            $('#message').text('');
            $('#newLandlineNumber').focus();
        }
        else {
            $('#landLineNumberDiv').hide();
            $('#errorKYCMessage').text('');
        }
    });
});

function forNumbers(currentVal) {
    var regex = /[^0-9]+/g;
    if (regex.test(currentVal.value)) {
        currentVal.value = (currentVal.value.replace(regex, '')).trim();
    }
}

function forPhoneNumbers(currentVal) {
    var regex = /[^0-9-]+/g;
    if (regex.test(currentVal.value)) {
        currentVal.value = (currentVal.value.replace(regex, '')).trim();
    }
}
function forNumbersWithDot(currentVal) {
    var regex = /[^0-9.]+/g;
    if (regex.test(currentVal.value)) {
        currentVal.value = (currentVal.value.replace(regex, '')).trim();
    }
}

function forNamesValidation(currentVal) {
    var regex = /[^a-zA-Z\s]/g;
    if (regex.test(currentVal.value)) {
        currentVal.value = (currentVal.value.replace(regex, '')).trim();
    }
}
function forNamesValidationWithNumbers(currentVal) {
    var regex = /[^a-zA-Z0-9\s]/g;
    if (regex.test(currentVal.value)) {
        currentVal.value = (currentVal.value.replace(regex, '')).trim();
    }
}
function forAlphaNumeric(currentVal) {
    var regex = /[^a-zA-Z0-9/]/g;
    if (regex.test(currentVal.value)) {
        currentVal.value = (currentVal.value.replace(regex, '')).trim();
    }
}

function forAlphaNumericWoutSlash(currentVal) {
    var regex = /[^a-zA-Z0-9]/g;
    if (regex.test(currentVal.value)) {
        currentVal.value = (currentVal.value.replace(regex, '')).trim();
    }
}

function forAlphabetsWithSlash(currentVal) {
    var regex = /[^a-zA-Z/]/g;
    if (regex.test(currentVal.value)) {
        currentVal.value = (currentVal.value.replace(regex, '')).trim();
    }
}

function forRemoveSpecialCharcters(currentVal) {
    var regex = /[^a-zA-Z0-9.[],()#[#:&#@\s]/g;
    if (regex.test(currentVal.value)) {
        currentVal.value = (currentVal.value.replace(regex, '')).trim();
    }
}

function forAddress(currentVal) {
    var regex = /[^a-zA-Z0-9/.,\-()#[#:&#@]/g;
    if (regex.test(currentVal.value)) {
        currentVal.value = currentVal.value//.replace(regex, '')).trim();
    }
}

function forEmailId(currentVal) {
    var regex = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    var regex1 = /[,'"/\s]/g;
    if (regex.test(currentVal)) {
        currentVal.value = (currentVal.value.replace(regex, '')).trim();
    } else if (regex1.test(currentVal.value)) {
        currentVal.value = (currentVal.value.replace(regex1, '')).trim();
    } else {
        currentVal.value = (currentVal.value).trim();
    }
}

function forUserName(currentVal) {
    var regex = /[^a-zA-Z0-9@]/g;
    if (regex.test(currentVal.value)) {
        currentVal.value = (currentVal.value.replace(regex, '')).trim();
    }
}
function forNumbersWithSlash(currentVal) {
    var regex = /[^0-9]/g;
    if (regex.test(currentVal.value)) {
        currentVal.value = (currentVal.value.replace(regex, '')).trim();
    }
}

function updateContactDetails(clientsId,buttonId,clientName,mobileNumber,landLineNumber){
    $(window).scrollTop(0);
    $('#errorKYCMessage').text('');
    $('#message').text('');
    $('#kycUpdateClientMobileNumber').val(mobileNumber);
    $('#kycUpdateClientLandLineNumber').val(landLineNumber);
    if(mobileNumber != "")
        $('#mobNumber').text(mobileNumber);
    else
        $('#mobNumber').text("Not Available");

    if(landLineNumber != "")
        $('#landNumber').text(landLineNumber);
    else
        $('#landNumber').text("Not Available");

    $('#kycUpdateClientId').val(clientsId);
    $('#buttonId').val(buttonId);
    $("#updateContactDetails").popup('open');
}

function closePopup(){
    $('#message').text('');
    $('#message').css('color','black');
    $('#mobileNumberDiv').hide();
    $('#landLineNumberDiv').hide();
    $('#mobileNumber').removeAttr("checked").checkboxradio('refresh');
    $('#landlineNumber').removeAttr("checked").checkboxradio('refresh');
    $('#kycUpdateClientId').val('');
    $('#kycUpdateClientMobileNumber').val('');
    $('#newMobileNumber').val('');
    $('#kycUpdateClientLandLineNumber').val('');
    $('#newLandlineNumber').val('');
    $('#errorKYCMessage').text('');
    $('#remarks_popup').val('');
    $('#mobNumber').text('');
    $('#landNumber').text('');
    $("#updateContactDetails").popup('close');
}

function submitUpdateKYC(){
    var count = $('#buttonId').val();
    if($("#mobileNumber").is(":checked") && $('#newMobileNumber').val().trim() == ""){
        $('#message').css('color','black');
        $('#errorKYCMessage').text('Please enter the mobile number');
        $('#newMobileNumber').focus();
    }
    else if($("#landlineNumber").is(":checked") && $('#newLandlineNumber').val().trim() == ""){
        $('#message').css('color','black');
        $('#errorKYCMessage').text('Please enter the landline number');
        $('#newLandlineNumber').focus();
    }else if(!$("#mobileNumber").is(":checked") && !$("#landlineNumber").is(":checked")){
        $('#message').css('color','red');
        $('#message').text('Please select the field/fields which you want change');
    }
    else if($('#mobileNumber').is(':checked') && $("#newMobileNumber").val().length < 10){
        $('#errorKYCMessage').text('Please provide a 10 digit mobile number');
    }
    else{
        $('#message').css('color','black');
        $('#errorMessage').text('');

        var data = {
            clientId : $('#kycUpdateClientId').val(),
            oldMobileNumber : $('#kycUpdateClientMobileNumber').val(),
            oldLandLineNumber : $('#kycUpdateClientLandLineNumber').val(),
            newMobileNumber : $('#newMobileNumber').val(),
            newLandLineNumber : $('#newLandlineNumber').val(),
            remarks : $('#remarks_popup').val(),
            operationId : $('#operationId').val()
        };

        $.post('http://' + ajaxcallip + localStorage.contextPath+'/client/ci/updateKYCContactDetails',
            data, function (response) {
                if(response.status == 'success') {
                    $('#message').css('color','black');
                    $('#mobileNumberDiv').hide();
                    $('#landLineNumberDiv').hide();
                    $('#mobileNumber').removeAttr("checked").checkboxradio('refresh');
                    $('#landlineNumber').removeAttr("checked").checkboxradio('refresh');
                    $('#kycUpdateClientId').val('');
                    $('#kycUpdateClientMobileNumber').val('');
                    $('#newMobileNumber').val('');
                    $('#kycUpdateClientLandLineNumber').val('');
                    $('#newLandlineNumber').val('');
                    $('#errorKYCMessage').text('');
                    $('#remarks_popup').val('');
                    $('#mobNumber').text('');
                    $('#landNumber').text('');
                    $('#updateContact_' + count).remove();
                    $('#labelId_' + count).text('Update request sent');
                    $("#updateContactDetails").popup('close');
                }
                else{
                    $("#updateContactDetails").popup('close');
                    $('#errorLabelId').text('Your request could not processed. Please try later...')
                }
            }
        );
    }
}
