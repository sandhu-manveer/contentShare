var express = require('express');
var mongoose = require('mongoose');
var appDB = require('../models/appDB');
var User = appDB.User;

var router = express.Router();
module.exports = router;

/**
 * middleware function to check authentication
 * 
 * @param {*} req 
 * @param {*} res 
 * @param {*} next 
 */
function checkAuth(req, res, next) {
    if (req.isAuthenticated()) {
        res.locals.user = req.user;
        next();
        return;
    }
    res.redirect('/login');
}

router.route('/user/:userId')
  .all(function(req, res, next){
    if (!req.params.userId || !mongoose.Types.ObjectId.isValid(req.params.userId)) res.sendStatus(404);
    else next();
  })
  .get(function (req, res, next) {
    User.findOne({ '_id': req.params.userId }).lean().exec()
        .then((user) => {
            if (!user) res.sendStatus(404);
            else res.render('userPage', {userId: user._id.toString()}); //HBS worked when json sent, dont stringify
        })
        .catch(err => next(err));
  }); 