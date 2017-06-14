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
        var lastScore = null;

        if (!req.query.lastScore) {
            lastScore = 1 // is this maxima?
        } else {
            lastScore = req.query.lastScore;
        }
        var searchFilter = {
            score: {
                $lt: lastScore
            }
        };
        if (req.query.userPost != null)
            searchFilter.postedBy = req.query.userPost;

        // check correct way to name collection and model
        // ensure password is not returned
        Post.find(searchFilter).sort({ score: -1 }).populate('postedBy', ['alias']).limit(10)
            .then((documents) => {
                var responseJSON = {};
                // get usernames
                // check correct approach
                // async not required as ref is used
                documents.sort((a, b) => b.score - a.score);
                responseJSON.documents = documents;
                // can user be accessed from frontend
                if (res.locals.user) {
                    responseJSON.user = res.locals.user._id;
                }
                res.json(responseJSON);
            })
            .catch((error) => next(error));
    });
