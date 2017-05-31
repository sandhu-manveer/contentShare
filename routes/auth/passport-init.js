var passport = require('passport');
var localStrategy = require('passport-local').Strategy;
var GoogleStrategy = require('passport-google-oauth2').Strategy;
var config = require('./oauth.js'); // use process env instead
var _ = require('lodash');
var mongoose = require('mongoose');
var appDB = require('../../models/appDB');
var User = appDB.User;

passport.use('local-login', new localStrategy(function(email, password, done){
    // var user = _.find(users, u => u.alias === alias);

    User.findOne({ email: email}).exec()
        .then(user => {
            if(!user) {   
                done(null, user, {message: 'Incorrect Email or Password'});
                return;
            }

            user.comparePassword(password, function (err, isMatch) {
                if (err) throw err;
                if (!isMatch) {
                    done(null, false, { message: 'Incorrect Username or Password' });
                    return;
                } else {
                    done(null, user);
                    return;
                }
            });


            // done(null, user); removing this prevented cant set headers err. why? ref:http://stackoverflow.com/questions/25550249/node-js-passport-error-cant-set-headers-after-they-are-sent-at-serverrespon
            // because async exec, this done is called before the function above finishes exec
        })
        .catch(error => console.log(error));
}));

passport.use('local-signup', new localStrategy({
    passReqToCallback: true
},
function(req, email, password, done){

    var alias = req.body.alias;

    if(!validateEmail(email)){
        done(null, false, {message: 'Enter Valid Email'});
    }

    email = email.toLowerCase(); 

    User.findOne({ email: email}).exec()
        .then(user => {
            if(user) {   
                done(null, false, {message: 'Email already registered'});
                return;
            } else {
                var newUser = new User();

                createUserDocument(newUser, {
                    alias: alias,
                    email: email,
                    password: password
                });

                newUser.save()
                    .then(() => {
                        done(null, newUser);
                    })
                    .catch(err => {
                        throw err;
                    });
            }
        })
        .catch(error => console.log(error));
}));

passport.use('google', new GoogleStrategy({
    clientID: config.google.clientID,
    clientSecret: config.google.clientSecret,
    callbackURL: config.google.callbackURL
},
    function (request, accessToken, refreshToken, profile, done) {
        profile.email=profile.email.toLowerCase();
        User.findOne({ email: profile.email }, function (err, user) {
            if (err) {
                console.log(err);  // handle errors!
            }
            if (!err && user !== null) {
                done(null, user);
            } else {
                user = new User({
                    password: profile.id,
                    alias: profile.displayName,
                    email:profile.email
                });
                user.save()
                    .then(() => {
                        console.log("saving user ...");
                        done(null, user);
                    })
                    .catch(error => console.log(error));
            }
        });
    }
));

passport.serializeUser(function (user, done) {
    done(null, user._id);
});

passport.deserializeUser(function (id, done) {
    //done(null, user);
    User.findById(id).exec()
        .then(user => done(null, user))
        .catch(error => console.log(error));
});

function validateEmail(email) {
   var emailRegex = /^(([^<>()\[\]\.,;:\s@\"]+(\.[^<>()\[\]\.,;:\s@\"]+)*)|(\".+\"))@(([^<>()[\]\.,;:\s@\"]+\.)+[^<>()[\]\.,;:\s@\"]{2,})$/i;
   return emailRegex.test(email);
}

// required?
function createUserDocument(user, jsonUser) {
  user.alias = jsonUser.alias;
  user.password = jsonUser.password;
  user.email = jsonUser.email;
}