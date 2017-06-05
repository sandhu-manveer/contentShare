var model = require('./postModel.js');

/**
 * Accessor methods for postModel.js
 */
var helper = module.exports = {

    getCurrentPostData: function() {
        return model.postData;
    },

    getPostData: function(postId) {
        return model.getPostData(postId);
    },

    getVoteResponse: function() {
        return model.voteResponse;
    },

    getCommentVoteResponse: function() {
        return model.getCommentVoteResponse;
    },

    votePost: function(postId, type) {
        return model.votePost(postId, type);
    },

    deletePost: function(postId) {
        return model.deletePost(postId);
    },

    voteComment: function(postId, comment_id, type) {
        return model.voteComment(postId, comment_id, type);
    },

    deleteComment: function(commentJson) {
        return model.deleteComment(commentJson);
    }

};
