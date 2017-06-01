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
 * Route to delete post from mongo
 * 
 */
router.route('/deletePost/:postId')
    .all(function (req, res, next) {
        checkAuth(req, res, next);
    })
    .get(function (req, res, next) {
        if (!req.params.postId || !mongoose.Types.ObjectId.isValid(req.params.postId)) {
            res.sendStatus(500);
            return;
        }

        User.findOne({ '_id': res.locals.user._id }).exec()
            .then((user) => {
                var post = _.find(user.posts, mongoose.Types.ObjectId(req.params.postId));
                if (!post) res.sendStatus(404);
                Post.remove({ '_id': post })
                    .then(() => {
                        user.posts = user.posts.filter(pId => pId.toString() !== req.params.postId);
                        user.update({ $set: { posts: user.posts } })
                            .then(() => {
                                res.status(200);
                                res.redirect('/');
                            })
                            .catch(next);
                    })
                    .catch(err => next(err));
            })
            .catch(err => next(err));
    });
