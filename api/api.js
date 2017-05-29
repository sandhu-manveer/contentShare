var express = require("express");
var mongoose = require('mongoose');
var _ = require('lodash');

var appDB = require('../data/appDB');
var Post = appDB.Post;
var User = appDB.User;
var Comment = appDB.Comment;

var router = express.Router();
module.exports = router;

/**
 * middleware function to check authentication
 * 
 * @param {*} req 
 * @param {*} res 
 * @param {*} next 
 */
function checkAuth(req, res, next) {
    if (req.isAuthenticated()) {
        res.locals.user = req.user;
        next();
        return;
    }
    res.redirect('/login');
}

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

/**
 * Helper function to create mongoose post document
 * 
 * @param {*} post 
 * @param {*} request 
 */
function createPostFromRequestObj(post, request) {
    post.title = request.body.title;
    post.postedBy = mongoose.Types.ObjectId(request.session.passport.user);
}

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
                        User.update({ _id: mongoose.Types.ObjectId(req.session.passport.user)},
                        {$addToSet: { postsVoted : document._id }}).exec()
                            .then(() => {
                                res.status(200);
                                res.json({ isLoggedIn: true, vote: vote.vote })
                            })
                            .catch(next);
                    })
                    .catch(next);
            })
            .catch((err) => next(err));
    });

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

/**
 * Route to get Single post by id
 * 
 */
router.route('/getSinglePost/:postId')
    .all(function (req, res, next) {
        res.locals.postId = req.params.postId;
        next();
    })
    .get(function (req, res, next) {
        if (!req.params.postId) {
            res.sendStatus(500);
            return;
        }

        Post.findOne({ '_id': req.params.postId }).lean().exec()
            .then((post) => {
                if (!post) res.sendStatus(404);
                res.send(post);
            })
            .catch(err => next(err));
    });

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
        if(req.body.parent_id === ""){
            var parent_id = null;
        } else if(!mongoose.Types.ObjectId.isValid(req.body.parent_id)) {
            res.sendStatus(404);
            return;
        } else {
            var parent_id = mongoose.Types.ObjectId(req.body.parent_id);
        }
        
        var commentModel = new Comment();

        createCommentFromRequestObj(commentModel, req);

        Post.findOne({ '_id': post_id}).exec()
            .then((post) => {
                // Too slow? review approach
                var newComments = post.comments;
                addCommentToPost(newComments, commentModel, parent_id);
                post.comments = newComments;
                post.save()
                    .then(() => {
                        res.redirect(req.originalUrl);
                    })
                    .catch(err => next(err));
            })
            .catch(err => next(err));
    });

/**
 * Helper function to create mongoose comment document
 * 
 * @param {Comment} comment 
 * @param {Req} request 
 */
function createCommentFromRequestObj(commentModel, request) {
    commentModel.text = request.body.text;
    commentModel.user_id = mongoose.Types.ObjectId(request.body.user_id); // change to res.locals.user
}

/**
 * Helper function to find parent comment
 */
function addCommentToPost(comments, comment, parent_id) {

    // initial comment
    if(!parent_id) {
        comments.push(comment);
        return;
    }

    for (var i = 0; i <  comments.length; i++) {
        child = comments[i];
        if (child._id.toString() === parent_id.toString()) {
            child.comments.push(comment);
            return;
        }
        if (child.comments) {
             addCommentToPost(child.comments, comment, parent_id);
        }
    }
}