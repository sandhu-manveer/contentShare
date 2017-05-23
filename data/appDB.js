var mongoose = require('mongoose');
mongoose.Promise = global.Promise;

var url = 'mongodb://localhost:27017/appDB';
var connectMongoose = mongoose.connect(url);

var User = require('../models/userModel.js');
var Post = require('../models/postModel.js');

module.exports = {
    connectMongoose,
    User,
    Post,
    close: function(callback) {
        connectMongoose.disconnect();
    }
};