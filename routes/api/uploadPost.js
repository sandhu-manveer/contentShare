var express = require("express");
var mongoose = require('mongoose');

var appDB = require('../../models/appDB');
var Post = appDB.Post;
var User = appDB.User;
var Comment = appDB.Comment;

var helpers = require('./helpers');

var checkAuth = helpers.checkAuth;
var createPostFromRequestObj = helpers.createPostFromRequestObj;

var router = express.Router();
module.exports = router;

/**
 * Route to upload post to mongoDB
 * 
 */
router.route('/uploadPost')
    .all(function (req, res, next) {
        checkAuth(req, res, next);
    })
    .post(function (req, res, next) {
        if (!req.body.title) {
            res.sendStatus(500);
            return;
        }

        if (req.body.title.length < 5) {
            req.flash('error', 'Title must have 5 or more characters.');
            res.redirect('/upload');
            return;
        }

        var post = new Post();
        createPostFromRequestObj(post, req);

        post.save()
            .then((result) => {
                // save post id in user document
                User.update({ '_id': res.locals.user._id },
                    { $push: { 'posts': result._id } }).exec()
                    .then(() => {
                        res.status(200);
                        res.redirect('/');
                    })
                    .catch(next);
            })
            .catch((error) => {
                console.log(error);
                next(error);
            });
    });
