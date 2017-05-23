var mongoose = require('mongoose');
var bcrypt = require('bcrypt');
var SALT_WORK_FACTOR = 10; // bcrypt 

var schemaOptions = { 
    collection: 'users'
};

var schema = new mongoose.Schema({
    alias: {type: String, required: true, minlength: 2},
    password: {type: String, required: true},
    posts: [ { type: mongoose.Schema.Types.ObjectId, ref: 'post' } ]
}, schemaOptions);

// middleware to ensure passwords are hashed
schema.pre('save', function(next) {
    var user = this;

    // only hash the password if it has been modified (or is new)
    if (!user.isModified('password')) return next();

    // generate a salt
    bcrypt.genSalt(SALT_WORK_FACTOR, function(err, salt) {
        if (err) return next(err);

        // hash the password using our new salt
        bcrypt.hash(user.password, salt, function(err, hash) {
            if (err) return next(err);

            // override the cleartext password with the hashed one
            user.password = hash;
            next();
        });
    });
});

// function to verify password
schema.methods.comparePassword = function(candidatePassword, cb) {
    bcrypt.compare(candidatePassword, this.password, function(err, isMatch) {
        if (err) return cb(err);
        cb(null, isMatch);
    });
};


module.exports = mongoose.model('user', schema);