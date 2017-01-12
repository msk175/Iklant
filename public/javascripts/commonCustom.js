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

function forAlphaNumeric(currentVal) {
    var regex = /[^a-zA-Z0-9/]/g;
    if (regex.test(currentVal.value)) {
        currentVal.value = (currentVal.value.replace(regex, '')).trim();
    }
}

function forAlphaNumericWithSpace(currentVal) {
    var regex = /[^a-zA-Z0-9\s]/g;
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
    var regex = /[^a-zA-Z0-9.,(){}\]\/#[#:&#@\s]/g;
    if (regex.test(currentVal.value)) {
        currentVal.value = (currentVal.value.replace(regex, '')).trim();
    }
}

function forRemoveSpecialCharctersHold(currentVal) {
    var regex = /[^a-zA-Z0-9.,(){}\]\/#[#:&#@\s]/g;
    if (regex.test(currentVal.value)) {
        currentVal.value = (currentVal.value.replace(regex, '')).trim();
    }
}

function forAddress(currentVal) {
    var regex = /[^a-zA-Z0-9/.,\-()#[#:&#@\s]/g;
    if (regex.test(currentVal.value)) {
        currentVal.value = currentVal.value.replace(regex, '').trim();
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