exports.formatDateForUI = function(tempDate) {
    var now = new Date(tempDate);
    var curr_date = ("0" + now.getDate()).slice(-2);
    var curr_month = ("0" + (now.getMonth() + 1)).slice(-2);
    var curr_year = now.getFullYear();
    var tempDate = curr_date + "/" + curr_month + "/" + curr_year;
    if (isNaN(curr_date)) {
        tempDate = "";
    }
    return tempDate;
}


exports.formatDate = function(tempDate) {
    if(typeof(tempDate) != 'undefined'){
        var ddd = tempDate.split("/");
        var now = new Date(ddd[2],ddd[1]-1,ddd[0]);
        var curr_date = ("0" + now.getDate()).slice(-2);
        var curr_month = ("0" + (now.getMonth() + 1)).slice(-2);
        var curr_year = now.getFullYear();
        var tempDate = curr_year+"-"+curr_month+"-"+curr_date;
        return tempDate;
    }
}

exports.convertMillisecToMifosDateFormatStr = function(timeInMilliSec) {
    var d = new Date(timeInMilliSec);
    var date = d.getDate();
    var month = d.getMonth() + 1; //Months are zero based
    var year = d.getFullYear();
    var date = (date <= 9 ? '0' + date : date) + '/' + (month<=9 ? '0' + month : month) + '/' + year;
    return date;
}
exports.convertToDateWithSlash = function(date) {
    var dateInArray = date.split("-");
    return dateInArray[2]+"/"+dateInArray[1]+"/"+dateInArray[0];
}
exports.convertToYMDFormat = function(date) {
    var dateInArray = date.split("/");
    return dateInArray[2]+"-"+dateInArray[1]+"-"+dateInArray[0];
}
exports.convertToDateFormat = function(date){
    if(date.search("-")){
        var dateInArray = date.split("-");
        return dateInArray[2]+"/"+dateInArray[1]+"/"+dateInArray[0];
    }else{
        var dateInArray = date.split("/");
        return dateInArray[2]+"-"+dateInArray[1]+"-"+dateInArray[0];
    }
}

exports.checkDate_Time = function(time) {
    return (time < 10) ? ("0" + time) : time;
}

exports.convertDate = function(timeInMilliSec) {
    var d = new Date(timeInMilliSec);
    var date = d.getDate();
    var month = d.getMonth() + 1; //Months are zero based
    var year = d.getFullYear();
    var date = (date <= 9 ? '0' + date : date) + '/' + (month<=9 ? '0' + month : month) + '/' + year ;

    return date;
}
exports.getCurrentDate = function(date){
    var currentDate = date.getFullYear()+"-"+("0" + (date.getMonth() + 1)).slice(-2)+"-"+("0" + date.getDate()).slice(-2);
    return currentDate;
}
exports.convertToMifosDateFormat = function(date) {
    var dateInArray = date.split("-");
    return dateInArray[2]+"-"+dateInArray[1]+"-"+dateInArray[0];
}

exports.getAge = function(dateString) {
    var today = new Date();
    var birthDate = new Date(dateString);
    var age = today.getFullYear() - birthDate.getFullYear();
    var m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
        age--;
    }
    if (isNaN(age)) {
        return "";
    }
    else {
        return age;
    }
}

exports.checkDate_Time = function(time) {
    return (time < 10) ? ("0" + time) : time;
}

exports.getCurrentTimeStamp = function() {
    var self = this;
    var currentdate = new Date();
    var datetime = self.checkDate_Time(currentdate.getFullYear()) + self.checkDate_Time((currentdate.getMonth()+1))
        + self.checkDate_Time(currentdate.getDate()) + self.checkDate_Time(currentdate.getHours())
        + self.checkDate_Time(currentdate.getMinutes()) + self.checkDate_Time(currentdate.getSeconds());
    return datetime;
}
