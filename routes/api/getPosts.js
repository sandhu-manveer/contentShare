var express = require("express");
var mongoose = require('mongoose');

var appDB = require('../../models/appDB');
var Post = appDB.Post;
var User = appDB.User;
var Comment = appDB.Comment;

var helpers = require('./helpers');

var checkAuth = helpers.checkAuth;

var router = express.Router();
module.exports = router;

// TODO: do not fetch comments when getting posts for front page
/**
 * Route to get posts
 */
router.route('/getPosts')
    .all(function (req, res, next) {
        // how to reuse under
        if (req.isAuthenticated()) {
            res.locals.user = req.user;
            next();
            return;
        }
        next();
    })
    .get(function (req, res, next) {
        var timeStamp = null;

        if (!req.query.lastTime) {
            timeStamp = new Date();
        } else {
            timeStamp = req.query.lastTime;
        }
        var searchFilter = {
            postedTime: {
                $lt: timeStamp
            }
        };
        if (req.query.userPost != null)
            searchFilter.postedBy = req.query.userPost;

        // check correct way to name collection and model
        // ensure password is not returned
        Post.find(searchFilter).populate('postedBy', ['alias']).sort({ postedTime: -1 }).limit(10)
            .then((documents) => {
                var responseJSON = {};
                // get usernames
                // check correct approach
                // async not required as ref is used
                documents.sort((a, b) => b.postedTime - a.postedTime);
                responseJSON.documents = documents;
                // can user be accessed from frontend
                if (res.locals.user) {
                    responseJSON.user = res.locals.user._id;
                }
                res.json(responseJSON);
            })
            .catch((error) => next(error));
    });
