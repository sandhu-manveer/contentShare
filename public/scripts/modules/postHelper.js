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

    votePost: function(postId, type) {
        return model.votePost(postId, type);
    }

};
