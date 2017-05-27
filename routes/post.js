var express = require('express');
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

router.route('/post/:postId')
  .all(function(req, res, next){
    if (!req.params.postId || !mongoose.Types.ObjectId.isValid(req.params.postId)) res.sendStatus(404);
    else next();
  })
  .get(function (req, res, next) {
    Post.findOne({ '_id': req.params.postId }).lean().exec()
            .then((post) => {
                if (!post) res.sendStatus(404);
                else res.render('postPage', {post: post}); //HBS worked when json sent, dont stringify
            })
            .catch(err => next(err));
  }); 