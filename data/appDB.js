var mongoose = require('mongoose');
mongoose.Promise = global.Promise;

var url = process.env.MONGODB_URL;
var connectMongoose = mongoose.connect(url);

var User = require('../models/userModel.js');
var Post = require('../models/postModel.js').Post;
var Comment = require('../models/postModel.js').Comment;

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