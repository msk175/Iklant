/**
 * Created by Paramasivan on 08/11/2014.
 */

module.exports = {
    writeLogFile : function (path,buffer){
        var fs = require('fs');
        if(typeof path == 'undefined'){
            console.log('Path is undefined/session changed');
        }
        else{
            var currentDate = new Date();
            var dd = currentDate.getDate();
            var mm = currentDate.getMonth()+1;
            var yyyy = currentDate.getFullYear();
            if(dd<10){dd='0'+dd} if(mm<10){mm='0'+mm}
            var dateTime = yyyy+":"+mm+":"+dd;

            var hr = currentDate.getHours();
            var min = currentDate.getMinutes();
            var sec = currentDate.getSeconds();
            var ms = currentDate.getMilliseconds();

            var cHr = hr<10 ? "0"+hr : hr;
            var cMin = min<10 ? "0"+min : min;
            var cSec = sec<10 ? "0"+sec : sec;
            var cMs = ms<10 ? "00"+ms : ms<100 ? "0"+ms : ms;

            dateTime += " & "+cHr+":"+cMin+":"+cSec+":"+cMs;

            var logData = new Buffer("\n----------------------------------------------------\nDate & Time : "+dateTime +buffer);

            fs.appendFile(path, logData, function(err) {
                if (err) throw 'error writing file: ' + err;
            });
        }
    }
}
