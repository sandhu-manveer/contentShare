var express = require("express");
var mongoose = require('mongoose');

var appDB = require('../../models/appDB');
var Post = appDB.Post;
var User = appDB.User;
var Comment = appDB.Comment;

var helpers = require('./helpers');

var checkAuth = helpers.checkAuth;
var createCommentFromRequestObj = helpers.createCommentFromRequestObj;
var addCommentToPost = helpers.addCommentToPost;

var router = express.Router();
module.exports = router;

/**
 * Route to post comment
 * 
 * returns created comment id
 */
router.route('/postComment')
    .all(function (req, res, next) {
        //checkAuth(req, res, next); // removed for testing
        next();
    })
    .post(function (req, res, next) {
        // var user_id = res.locals.user._id;
        var user_id = req.body.user_id; // change after testing (checkAuth)
        var post_id = req.body.post_id;
        if (req.body.parent_id === "") {
            var parent_id = null;
        } else if (!mongoose.Types.ObjectId.isValid(req.body.parent_id)) {
            res.sendStatus(404);
            return;
        } else {
            var parent_id = mongoose.Types.ObjectId(req.body.parent_id);
        }

        var commentModel = new Comment();

        createCommentFromRequestObj(commentModel, req);

        Post.findOne({ '_id': post_id }).exec()
            .then((post) => {
                // Too slow? review approach
                var newComments = post.comments;
                addCommentToPost(newComments, commentModel, parent_id);
                post.comments = newComments;
                post.save()
                    .then((post) => {
                        // save comment in user document
                        User.update({ _id: mongoose.Types.ObjectId(user_id) },
                            { $addToSet: { comments: { post_id: mongoose.Types.ObjectId(post_id), comment_id: commentModel._id } } }).exec()
                            .then(() => {
                                res.status(200);
                                res.redirect(req.originalUrl);
                            })
                            .catch(next);
                    })
                    .catch(err => next(err));
            })
            .catch(err => next(err));
    });

