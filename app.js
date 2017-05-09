var express = require('express');
var bodyParser = require('body-parser');
var hbs = require('express-hbs');

var app = express();

// static files
app.use(express.static(__dirname + "/dist"));
app.use(express.static(__dirname + "/node_modules/jquery/dist"));
app.use(express.static(__dirname + "/node_modules/bootstrap/dist"));

// handlebars setup
app.engine('hbs', hbs.express3({
  partialsDir: __dirname + '/views/partials'
}));
app.set('view engine', 'hbs');
app.set('views', __dirname + '/views');

// body-parser setup
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());

app.get('/', function (req, res) {
  res.render("index", {title: "Something Else"});
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

app.listen(3000, function () {
  console.log('App listening on port 3000');
});