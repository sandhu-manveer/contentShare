var express = require("express");
var mongoose = require('mongoose');

var appDB = require('../../models/appDB');
var Post = appDB.Post;
var User = appDB.User;
var Comment = appDB.Comment;

var helpers = require('./helpers');

var checkAuth = helpers.checkAuth;
var sortCommentsByVotes = helpers.sortCommentsByVotes;

var router = express.Router();
module.exports = router;

/**
 * Route to get Single post by id
 * 
 */
router.route('/getSinglePost/:postId')
    .all(function (req, res, next) {
        res.locals.postId = req.params.postId;
        // how to reuse under
        if (req.isAuthenticated()) {
            res.locals.user = req.user;
            next();
            return;
        }
        next();
    })
    .get(function (req, res, next) {
        if (!req.params.postId) {
            res.sendStatus(500);
            return;
        }

        Post.findOne({ '_id': req.params.postId }).populate('postedBy', ['alias']).exec()
            .then((post) => {
                if (!post) res.sendStatus(404);
                var responseJSON = {};
                sortCommentsByVotes(post.comments);
                responseJSON.post = post;
                // can user be accessed from frontend
                if (res.locals.user) {
                    responseJSON.user = res.locals.user._id;
                }
                res.json(responseJSON);
            })
            .catch(err => next(err));
    });

