var express = require('express');
var mongoose = require('mongoose');
var appDB = require('../models/appDB');
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
    else next();
}

router.route('/post/:postId')
  .all(function(req, res, next){
    if (!req.params.postId || !mongoose.Types.ObjectId.isValid(req.params.postId)) res.sendStatus(404);
    checkAuth(req, res, next);
  })
  .get(function (req, res, next) {
    Post.findOne({ '_id': req.params.postId }).lean().exec()
        .then((post) => {
            if (!post) res.sendStatus(404);
            else res.render('postPage', {postId: post._id.toString()}); //HBS worked when json sent, dont stringify
        })
        .catch(err => next(err));
  }); 