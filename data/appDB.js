var mongodb = require('mongodb');
var MongoClient = mongodb.MongoClient;
var ObjectID = mongodb.ObjectID;
var mongoose = require('mongoose');
mongoose.Promise = global.Promise;

var Logger = mongodb.Logger;

var url = 'mongodb://localhost:27017/appDB';
var connect = MongoClient.connect(url);
var connectMongoose = mongoose.connect(url);

// Logger.setLevel('error');
// mongoose.set('debug', true);

var User = require('../models/userModel.js');
var Post = require('../models/postModel.js');

module.exports = {
    connect,
    connectMongoose,
    User,
    Post,
    close: function(callback) {
        connect
        .then(db => {
            db.close();
            callback();
        });
        connectMongoose.disconnect();
    }
};