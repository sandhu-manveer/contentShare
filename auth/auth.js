var express = require('express');
var passport = require('passport');
var _ = require('lodash');
var appDB = require('../data/appDB');
var User = appDB.User;

var router = express.Router();
module.exports = router;

router.route('/login')
    .get(function(req, res, next){
            // console.log(req);
            // dev autologin
            /*if(req.app.get('env') === 'development') {
               
                // TODO: fixed user for testing
                var user = users[0];


                if (req.query.user) {
                    // user = _.find(users, u  => u.name === req.query.user);
                    User.find({alias: req.query.user}).exec()
                        .then(user => {
                            req.logIn(user, function(err, next){
                                if(err) { return next(err); }
                                return res.redirect('/');
                            });
                            return; 
                        })
                        .catch(next);
                }
            }*/
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
