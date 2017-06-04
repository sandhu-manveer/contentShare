var express = require("express");
var mongoose = require('mongoose');

var appDB = require('../../models/appDB');
var Post = appDB.Post;
var User = appDB.User;
var Comment = appDB.Comment;

var helpers = require('./helpers');
var _ = require('lodash');

var checkAuth = helpers.checkAuth;
var findCommentById = helpers.findCommentById;

var router = express.Router();
module.exports = router;

/**
 * Route to vote on comment
 */
router.route('/commentVote')
    .all(function (req, res, next) {
        if (req.isAuthenticated()) {
            res.locals.user = req.user;
            next();
            return;
        }
        res.json({ isLoggedIn: false });
    })
    .get(function (req, res, next) {

        if (!req.query.postId || !req.query.type || !mongoose.Types.ObjectId.isValid(req.query.postId)) {
            next();
        } else if (!req.query.comment_id || !mongoose.Types.ObjectId.isValid(req.query.comment_id)) {
            next();
        }

        var comment_id = req.query.comment_id;
        var type = req.query.type;

        var searchFilter = {
            _id: mongoose.Types.ObjectId(req.query.postId)
        };

        Post.findOne(searchFilter).exec()
            .then((document) => {
                var comment = findCommentById(document.comments, comment_id);
                var vote = _.find(comment.votes, { user_id: mongoose.Types.ObjectId(req.session.passport.user) }); // works. why?

                if (vote) {
                    //compare as string?
                    if (type === 'upVote') {
                        if (vote.vote > 0) {
                            vote.vote = 0;
                        } else {
                            vote.vote = 1;
                        }
                    } else if (type === 'downVote') {
                        if (vote.vote < 0) {
                            vote.vote = 0;
                        } else {
                            vote.vote = -1;
                        }
                    }
                } else {
                    var vote = {};
                    vote.user_id = mongoose.Types.ObjectId(req.session.passport.user);
                    if (type === 'upVote') {
                        vote.vote = 1;
                    } else if (type === 'downVote') {
                        vote.vote = -1;
                    }
                    comment.votes.push(vote);
                }
                document.save()
                    .then(() => {
                        res.status(200);
                        res.json({ isLoggedIn: true, vote: vote.vote });
                    })
                    .catch(next);
            })
            .catch((err) => next(err));
    });