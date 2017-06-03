var mongoose = require('mongoose');
var uuid = require('node-uuid');

var schemaOptions = { 
    collection: 'verify'
};

var schema = new mongoose.Schema({
    user_id: {type: mongoose.Schema.Types.ObjectId, required: true, ref: 'user'},
    token: {type: String, required: true},
    createdAt: {type: Date, required: true, default: Date.now, expires: '10h'}
}, schemaOptions);

schema.methods.createVerificationToken = function(done) {
    var verificationToken = this;
    var token = uuid.v4();
    verificationToken.set('token', token);
    verificationToken.save( function (err) {
        if (err) return done(err);
        return done(null, token);
    });
}

module.exports = mongoose.model('verify', schema);