var log4js = require('log4js');
var path = require('path');
var applicationHome = path.dirname(process.mainModule.filename);
var props = require(path.join(applicationHome,"properties.json"));

var log =  props.logPath+"/Iklant/iKlant_"+ props.iklantPort + ".log";
log4js.configure({

    appenders: [

        {
            type: 'dateFile',
            filename: log ,
            "maxLogSize": 10485760,
            "numBackups": 10 }
    ]
});


function logger(param) {
    var log = log4js.getLogger(param);
    log.setLevel('INFO');
    return log;
}

module.exports = logger;


