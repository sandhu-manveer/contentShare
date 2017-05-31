var mongoose = require('mongoose');
mongoose.Promise = global.Promise;

var url = process.env.MONGODB_URL;
var connectMongoose = mongoose.connect(url);

var User = require('./userModel.js');
var Post = require('./postModel.js').Post;
var Comment = require('./postModel.js').Comment;

module.exports = {
    connectMongoose,
    User,
    Post,
    Comment,
    close: function(callback) {
        connectMongoose.disconnect();
        callback();
    }
};