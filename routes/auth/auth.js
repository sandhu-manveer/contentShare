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
        if(req.app.get('env') === 'development') {
            var userId = {_id:'5912994c0b2fd617a42811df'};

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
                    .catch(next);
            } else {
                req.logIn(userId, function(err){
                    if(err) { return console.log(err); }
                    return res.redirect('/');
                });
                return; 
            }
        } 
    })
    .get(function(req, res, next){
            res.render('auth');
        })
    .post(passport.authenticate('local', {
            successRedirect: '/',
            failureRedirect: '/login'
        }));

        // .post(function(req, res){
        //     console.log(req);
        // });

router.get('/logout', function(req, res){
    req.logout();
    res.redirect('/login'); 
});
