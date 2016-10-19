var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

// packages needed for user system
var bcrypt = require('bcryptjs');
var session = require('express-session');
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;

// packages needed for uploading images
// var multer = require('multer');
// var upload = multer({dest: './uploads'});

// packages almost needed everywhere
var engine = require('ejs-mate');
// var flash = require('connect-flash');
var flash = require('express-flash');
var expressValidator = require('express-validator');

// packages needed fo MongoDB
var mongo = require('mongodb');
var mongoose = require('mongoose');
var db = mongoose.connection;

// Routes
var routes = require('./routes/index');
var users = require('./routes/users');
var admin = require('./routes/admin');
var api = require('./api/api');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.engine('ejs',engine);
app.set('view engine', 'ejs');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// Handle Sessions
app.use(session({
  secret:'secret',
  saveUninitialized: true,
  resave: true
}));

// Passport
app.use(passport.initialize());
app.use(passport.session());

// Validator
app.use(expressValidator({
  errorFormatter: function(param, msg, value) {
      var namespace = param.split('.')
      , root    = namespace.shift()
      , formParam = root;

    while(namespace.length) {
      formParam += '[' + namespace.shift() + ']';
    }
    return {
      param : formParam,
      msg   : msg,
      value : value
    };
  }
}));

// Flash Messages MiddleWare
app.use(flash());

// Global vars
app.use(function(req,res,next){
  res.locals.success_msg = req.flash('success_msg');
  res.locals.error_msg = req.flash('error_msg');
  res.locals.error = req.flash('error');
  res.locals.user = req.user || null;
  next();
});

// self-defined middlwares
var requiresAdmin = function(){
  return[
    function(req,res,next){
    	if(req.user && req.user.isAdmin === true){
    		next();
    	} else {
    		res.send(401,'Unauthorized');
    	}
    }
  ]
};
app.all('/admin/*', requiresAdmin());

// Routes MiddleWares
app.use('/', routes);
app.use('/users', users);
app.use('/admin', admin);
app.use('/api', api);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});


module.exports = app;
