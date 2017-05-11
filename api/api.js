var express = require("express");
var mongoose = require('mongoose');

var appDB = require('../data/appDB');
var Post = appDB.Post;

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
    .all(function(req, res, next){
        checkAuth(req, res, next);
    })
    .post(function(req, res, next){
        if (!req.body.title) {
            res.sendStatus(500);
            return;
        }

        var post = new Post();
        createPostFromRequestObj(post, req);
        
        post.save()
            .then(() => {
                res.status(200);
                res.redirect('/');
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
function createPostFromRequestObj(post, request){
    post.title = request.body.title;
    post.postedBy = mongoose.Types.ObjectId(request.session.passport.user);
}

/**
 * Route to get posts
 */
router.route('/getPosts')
    .get(function(req, res, next){
        var timeStamp = null;

        if(!req.query.lastTime){
            timeStamp = new Date();
        } else {
            timeStamp = req.query.lastTime;
        }

        var searchFilter = {
            postedTime: {
                $lt : timeStamp
            }
        };

        Post.find(searchFilter).sort({postedTime:-1}).limit(10)
            .then((documents) => {
                // console.log(documents[documents.length - 1]);
                res.json(documents);
            })
            .catch((error) => next(error));

    });