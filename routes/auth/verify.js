var express = require('express');
var passport = require('passport');
var appDB = require('../../models/appDB');
var Verify = appDB.Verify;
var User = appDB.User;

var router = express.Router();
module.exports = router;

/**
 * helper function to verify user
 */
function verifyUser(token, done) {
    Verify.findOne({token: token}, function (err, verification){
        if (err) return done(err);
        User.findOne({_id: verification.user_id}, function (err, user) {
            if (err) return done(err);
            user.verified = true;
            user.save()
                .then((user) => {
                    done(user);
                })
                .catch(err => done(err));
        });
    });
}

router.get("/verify/:token", function (req, res, next) {
    var token = req.params.token;
    // err returned? check behaviour
    verifyUser(token, function(err) {
        if (err) {
            return res.redirect('/login');
        }
        res.redirect('/login');
    });
});