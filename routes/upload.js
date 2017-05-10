var express = require("express");
var mongoose = require('mongoose');

var router = express.Router();
module.exports = router;

router.use(function (req, res, next) {
  if (req.isAuthenticated()) {
    res.locals.user = req.user;
    next();
    return;
  }
  res.redirect('/login');
});

router.get('/upload', function (req, res) {
  res.render("upload", {title: "Something Else"});
});