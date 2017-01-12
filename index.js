
var path = require('path');

// Wire modules
var app = require(path.join(path.dirname(process.mainModule.filename),"/server/server"));

// Start Server
var customlog = require(path.join(path.dirname(process.mainModule.filename),"/logger/loggerConfig"))('index.js');
app.set('port', process.env.PORT || 2000);
var server = app.listen(app.get('port'), function() {
    customlog.info('Express server listening on port ' + server.address().port);
});
server.timeout = 0;
