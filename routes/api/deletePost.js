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
router.route('/deletePost')
    .all(function (req, res, next) {
        checkAuth(req, res, next);
    })
    .post(function (req, res, next) {
        if (!req.query.postId || !mongoose.Types.ObjectId.isValid(req.query.postId)) {
            res.sendStatus(500);
            return;
        }

        User.findOne({ '_id': res.locals.user._id }).exec()
            .then((user) => {
                var post = _.find(user.posts, mongoose.Types.ObjectId(req.query.postId));
                
                Post.remove({ '_id': post })
                    .then(() => {
                        user.posts = user.posts.filter(pId => pId.toString() !== req.query.postId);
                        user.save()
                            .then(() => {
                                res.sendStatus(200);
                            })
                            .catch(next);
                    })
                    .catch(err => next(err));
            })
            .catch(err => next(err));
    });
