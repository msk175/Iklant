var path = require('path');
var dbConfiguration = require(path.dirname(process.mainModule.filename)+"/"+"properties.json");
var mysql = require('mysql');

var ciPool  = mysql.createPool({
    connectionLimit : dbConfiguration.connectionLimit,
    host            : dbConfiguration.host,
    user            : dbConfiguration.username,
    password        : dbConfiguration.password,
    database        : dbConfiguration.database,
	insecureAuth    : true
});

exports.getConnection = function(callBack) {
    ciPool.getConnection(function(err, connection) {
        if(!err){
            callBack(connection);
        }else
            console.log("Error :"+err);
    });
};

exports.releaseConnectionPool = function(connection){
    if(connection.state == 'authenticated'){
        connection.release();
        console.log("Connection released successfully");
    }
    else{
        console.log("Connection already released");
    }
}