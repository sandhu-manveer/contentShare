var express = require('express');
var passport = require('passport');
var appDB = require('../../data/appDB');
var request = require('request');
var User = appDB.User;

var router = express.Router();
module.exports = router;

router.route('/login')
    .all(function(req, res, next){
        // dev autologin
        // remove and check everything is working
        /*if(req.app.get('env') === 'development') {
            var userId = {_id:'5923da6233d7621f4c703f67'};

            if(req.query.user) {
                User.findOne({alias: req.query.user}).exec()
                    .then((response) => {
                        userId = response;
                        req.logIn(userId, function(err){
                            if(err) { return console.log(err); }
                                return res.redirect('/');
                            });
                            return;
                    })
                    .catch(() => {
                        return res.redirect('/');
                    });
            } else {
                req.logIn(userId, function(err){
                    if(err) { return console.log(err); }
                    return res.redirect('/');
                });
                return; 
            }
        }*/
        next();
    })
    .get(function(req, res, next){
            res.render('auth', {message: req.flash()});
        })
    .post(passport.authenticate('local-login', {
            successRedirect: '/',
            failureRedirect: '/login',
            failureFlash : true
        }));

router.route('/signup')
    .get(function(req, res, next){
            res.render('signup', {message: req.flash()});
        })
    .post(passport.authenticate('local-signup', {
            successRedirect: '/login',
            failureRedirect: '/signup',
            failureFlash : true
        }));

router.get('/logout', function(req, res){
    req.logout();
    res.redirect('/login'); 
});
