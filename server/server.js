var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');

var multer = require('multer');
//var session = require('express-session');
var connect = require('connect');
var applicationHome = path.dirname(process.mainModule.filename);
var props = require(path.join(applicationHome,"properties.json"));


var app = express();

// view engine setup
app.set('views', path.join(applicationHome, 'views'));
app.set('view engine', 'jade');

// uncomment after placing your favicon in /public
//app.use(favicon(applicationHome + '/public/favicon.ico'));
app.use(logger('dev'));
/*app.use(session({secret: '$@#sdd8763@#',saveUninitialized: false,
    resave: false}));*/
app.use(bodyParser.json({limit:'100mb', extended: false}));
app.use(bodyParser.urlencoded({limit:'100mb', extended: false}));
app.use(multer({limit:'100mb'}));
app.use(cookieParser('$dfs453&*$@'));
app.use(connect.session());



app.use(express.static(path.join(applicationHome, 'public')));

var ModuledHandler = require(path.join(applicationHome,"/app_modules/mapping/Handler"));
var OldHandler = require(path.join(applicationHome,"/handler/handler"));
//temporarily used until completion of modularization
newModulesReferences = new ModuledHandler(app);
app = new OldHandler(newModulesReferences);



// catch 404 and forward to error handler
app.use(function(req, res, next) {
    res.redirect(props.contextPath+'/client/ci/login');
    /*var err = new Error('Not Found');
    err.status = 404;
    next(err);*/
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
    app.use(function(err, req, res, next) {
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: err,
            contextPath:props.contextPath
        });
    });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: {},
        contextPath:props.contextPath
    });
});


module.exports = app;
