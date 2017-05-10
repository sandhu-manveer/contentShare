var express = require("express");
var mongoose = require('mongoose');

var appDB = require('../data/appDB');
var Post = appDB.Post;

var router = express.Router();
module.exports = router;

router.use(function (req, res, next) {
  if (req.isAuthenticated()) {
    res.locals.user = req.user;
    next();
    return;
  }
  res.redirect('/login');
});

router.route('/uploadPost')
    .post(function(req, res, next){
        if (!req.body.title) {
            res.sendStatus(500);
            return;
        }

        var post = new Post();
        createPostFromRequestObj(post, req);

        post.save()
            .then(() => {
                console.log("saved") // remove
                res.redirect('/');
            })  
            .catch((error) => {
                console.log(error);
                next(error);
            });
    });

function createPostFromRequestObj(post, request){
    post.title = request.body.title;
    post.postedBy = mongoose.Types.ObjectId(request.session.passport.user);
}
