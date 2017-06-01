var model = require('./userModel.js');

/**
 * Accessor methods for model.js
 */
var helper = module.exports = {

    getCurrentPostData: function() {
        return model.postData;
    },

    getPostData: function(userId) {
        return model.getPostData(userId);
    },

    setPostsTimestamp: function() {        
        model.lastTime = model.postData.body[model.postData.body.length - 1].postedTime;
    },

    getPostsTimestamp: function() {        
        return model.lastTime;
    },

    getVoteResponse: function() {
        return model.voteResponse;
    },

    votePost: function(postId, type) {
        return model.votePost(postId, type);
    }

};
