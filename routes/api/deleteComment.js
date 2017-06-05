var express = require("express");
var mongoose = require('mongoose');

var appDB = require('../../models/appDB');
var Post = appDB.Post;
var User = appDB.User;
var Comment = appDB.Comment;

var helpers = require('./helpers');

var checkAuth = helpers.checkAuth;
var deleteCommentFromPost = helpers.deleteCommentFromPost;
var addCommentToPost = helpers.addCommentToPost;

var router = express.Router();
module.exports = router;

/**
 * Route to delete comment
 * 
 */
router.route('/deleteComment')
    .all(function (req, res, next) {
        checkAuth(req, res, next); 
    })
    .post(function (req, res, next) {
        var user_id = res.locals.user._id;
        var post_id = req.body.post_id;
        var comment_id = req.body.comment_id;

        Post.findOne({ '_id': post_id }).exec()
            .then((post) => {

                deleteCommentFromPost(post.comments, comment_id, user_id);

                post.save()
                .then((comment) => {
                    // save comment in user document
                    User.update({ _id: mongoose.Types.ObjectId(user_id) },
                        { $pull: { comments: { comment_id: mongoose.Types.ObjectId(comment_id) } } }).exec()
                        .then(() => {
                            res.status(200);
                            res.redirect(req.originalUrl);
                        })
                        .catch(err => next(err));
                })
                .catch(err => next(err));
            })
            .catch(err => {
                console.log(err);
                res.send('error');
            });
    });

