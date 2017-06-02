var mongoose = require('mongoose');
/**
 * middleware function to check authentication
 * 
 * @param {*} req 
 * @param {*} res 
 * @param {*} next 
 */
var checkAuth = function (req, res, next) {
    if (req.isAuthenticated()) {
        res.locals.user = req.user;
        next();
        return;
    }
    res.redirect('/login');
}

/**
 * Helper function to create mongoose post document
 * 
 * @param {*} post 
 * @param {*} request 
 */
var createPostFromRequestObj = function (post, request) {
    post.title = request.body.title;
    post.postedBy = mongoose.Types.ObjectId(request.session.passport.user);
}

/**
 * Helper function to create mongoose comment document
 * 
 * @param {Comment} comment 
 * @param {Req} request 
 */
var createCommentFromRequestObj = function (commentModel, request) {
    commentModel.text = request.body.text;
    commentModel.user_id = mongoose.Types.ObjectId(request.body.user_id); // change to res.locals.user
}

/**
 * Helper function to find parent comment
 */
var addCommentToPost = function (comments, comment, parent_id) {

    // initial comment
    if (!parent_id) {
        comments.push(comment);
        return;
    }

    for (var i = 0; i < comments.length; i++) {
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

/**
 * Helper function to delete comment from post
 */
var deleteCommentFromPost = function (comments, comment_id, user_id) {
    for (var i = 0; i < comments.length; i++) {
        child = comments[i];
        if (child._id.toString() === comment_id && child.user_id.toString() === user_id) {
            comments.splice(i, 1);
            return;
        } else if (child._id.toString() === comment_id && child.user_id.toString() !== user_id){
            return;
        } else if (child.comments) {
            deleteCommentFromPost(child.comments, comment_id, user_id);
        }
    }
}

module.exports = {
    checkAuth,
    createPostFromRequestObj,
    createCommentFromRequestObj,
    deleteCommentFromPost,
    addCommentToPost
}