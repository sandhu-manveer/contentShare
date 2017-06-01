var express = require("express");
var mongoose = require('mongoose');

var appDB = require('../../models/appDB');
var Post = appDB.Post;
var User = appDB.User;
var Comment = appDB.Comment;

var helpers = require('./helpers');
var _ = require('lodash');

var checkAuth = helpers.checkAuth;

var router = express.Router();
module.exports = router;

/**
 * Route to upvote post
 */
router.route('/vote')
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
        }

        var type = req.query.type;

        var searchFilter = {
            _id: mongoose.Types.ObjectId(req.query.postId)
        };

        Post.findOne(searchFilter).exec()
            .then((document) => {
                var vote = _.find(document.votes, { user_id: mongoose.Types.ObjectId(req.session.passport.user) }); // works. why?

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
                    document.votes.push(vote);
                }
                document.save()
                    .then(() => {
                        // add post to user doc (postsVoted)
                        User.update({ _id: mongoose.Types.ObjectId(req.session.passport.user) },
                            { $addToSet: { postsVoted: document._id } }).exec()
                            .then(() => {
                                res.status(200);
                                res.json({ isLoggedIn: true, vote: vote.vote });
                            })
                            .catch(next);
                    })
                    .catch(next);
            })
            .catch((err) => next(err));
    });