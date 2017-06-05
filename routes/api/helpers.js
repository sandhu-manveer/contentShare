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
    commentModel.user_id = request.user._id;
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
        if (child._id.toString() === comment_id && child.user_id.toString() === user_id.toString()) {
            comments.splice(i, 1);
            return;
        } else if (child._id.toString() === comment_id && child.user_id.toString() !== user_id.toString()){
            return;
        } else if (child.comments) {
            deleteCommentFromPost(child.comments, comment_id, user_id);
        }
    }
}

/**
 * Helper function to find comment
 */
var findCommentById = function (comments, comment_id) {
    for (var i = 0; i < comments.length; i++) {
        child = comments[i];
        if (child._id.toString() === comment_id) {
            return child;
        }
        if (child.comments) {
            var found = findCommentById(child.comments, comment_id);
            if (found) return found;
        }
    }
}

/**
 * Helper function to sort comments
 * Should be done in db? how?
 */
var sortCommentsByVotes = function (comments) {
    for (var i = 0; i < comments.length; i++) {
        child = comments[i];
        comments[i].score = child.votes.reduce(function(a, b) {
                            return a + b.vote;  
                        }, 0);
        if (comments[i].comments) {
            sortCommentsByVotes(comments[i].comments);
        }
    }
    comments.sort((a, b) => b.score - a.score);
}

module.exports = {
    checkAuth,
    createPostFromRequestObj,
    createCommentFromRequestObj,
    deleteCommentFromPost,
    addCommentToPost,
    findCommentById,
    sortCommentsByVotes
}