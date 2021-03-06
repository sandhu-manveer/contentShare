require('dotenv').config(); // Split into prod, dev envs
var express = require('express');
var bodyParser = require('body-parser');
var hbs = require('express-hbs');
var passport = require('passport');
var flash = require('connect-flash');
var cookieParser = require('cookie-parser');
require('./routes/auth/passport-init');

var app = express();

// static files
app.use(express.static(__dirname + '/dist'));
app.use(express.static(__dirname + '/node_modules/jquery/dist'));
app.use(express.static(__dirname + '/node_modules/bootstrap/dist'));
app.use(express.static(__dirname + '/node_modules/jsrender'));
app.use(express.static(__dirname + '/node_modules/jquery-form-validator/form-validator'));

// handlebars setup
app.engine('hbs', hbs.express3({
  partialsDir: __dirname + '/views/partials'
}));
app.set('view engine', 'hbs');
app.set('views', __dirname + '/views');

// body-parser setup
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());

//cookie parser setup
app.use(cookieParser('secret'));
// express-session for session based auth
app.use(require('express-session')({
  secret: 'some random secret',
  resave: false,
  saveUninitialized: false,
  cookie: {maxAge: 60000 * 60 * 24}
}));
// flash setup (requires session, cookieparser)
app.use(flash());
// passport setup
app.use(passport.initialize());
app.use(passport.session());

// auth route
var authRouter = require("./routes/auth/auth");
app.use(authRouter);

// does not need auth
var postPageRouter = require("./routes/post");
app.use(postPageRouter);

var userPageRouter = require("./routes/user");
app.use(userPageRouter);

var apiRouter = require("./routes/api/api");
app.use("/api", apiRouter);

function checkAuth(req, res, next) {
    if (req.isAuthenticated()) {
        res.locals.user = req.user;
        next();
        return;
    }
    next();
}

app.get('/', checkAuth, function (req, res) {
  res.render("index", {user: res.locals.user});
});

// define routes
app.get('/page1', function (req, res) {
  res.render("index", {title: "Something Else"});
});

app.get('/page2', function (req, res) {
  res.render("index", {title: "Something Else"});
});

app.get('/page3', function (req, res) {
  res.render("index", {title: "Something Else"});
});

var uploadRouter = require("./routes/upload");
app.use(uploadRouter);

var server = app.listen(process.env.APP_PORT, function () {
  console.log('App listening on port ' + process.env.APP_PORT);
});

var gracefulShutdown = function() {
  console.log("Received kill signal, shutting down gracefully.");

  var appDB = require('./models/appDB');
  appDB.close(() => {
    console.log('Mongo connection closed')
    server.close(() => {
      console.log("Closed out remaining connections.");
      process.exit();
    });
  });
   // if after
   setTimeout(function() {
       console.error("Could not close connections in time, forcefully shutting down");
       process.exit();
  }, 10*1000);
}

process.on('SIGINT', gracefulShutdown);
process.on('SIGTERM', gracefulShutdown);