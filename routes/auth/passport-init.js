var passport = require('passport');
var localStrategy = require('passport-local').Strategy;
var _ = require('lodash');
var mongoose = require('mongoose');
var appDB = require('../../data/appDB');
var User = appDB.User;

passport.use(new localStrategy(function(alias, password, done){
    // var user = _.find(users, u => u.alias === alias);

    User.findOne({ alias: alias}).exec()
        .then(user => {
            if(!user) {   
                done(null, user, {message: 'Incorrect Username or Password'});
                return;
            }

            user.comparePassword(password, function(err, isMatch) {
                if (err) throw err;
                if (!isMatch){
                    done(null, false, {message: 'Incorrect Username or Password'});
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

passport.serializeUser(function(user, done){
    done(null, user._id);
});

passport.deserializeUser(function(id, done){
    //done(null, user);
    User.findById(id).exec()
        .then(user => done(null, user))
        .catch(error => console.log(error));
});