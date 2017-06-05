var request = require('superagent');

/**
 * Functions for making calls to app services
 */
var model = module.exports = {
    init: function(){
       console.log('Model Init');
    },

    postData: {},

    voteResponse: {},

    /**
     * get get single post by id
     */
    getPostData: function(postId) {
        return new Promise(function(resolve, reject){
            request
            .get('/api/getSinglePost/' + postId)
            .end(function(err, response){
                if(err) { console.log("error>>", err); } // remove
                model.postData = response;
                resolve(model.postData);
            });
        });
    },

    /**
     * up/down vote post request to server
     * 
     * @param {String} postId mongo object id of post
     * @param {String} type up or down vote
     */
    votePost: function(postId, type) {
        return new Promise(function(resolve, reject){
            request
            .get('/api/vote')
            .query('postId='+ postId + '&type=' + type)
            .end(function(err, response){
                model.voteResponse = response;
                resolve(model.voteResponse);
            });
        });
    },

    /**
     * up/down vote comment request to server
     * 
     * @param {String} postId mongo object id of post
     * @param {String} comment_id mongo id of comment
     * @param {String} type up or down vote
     */
    voteComment: function(postId, comment_id, type) {
        return new Promise(function(resolve, reject){
            request
            .get('/api/commentVote')
            .query('postId='+ postId + '&comment_id=' + comment_id + '&type=' + type)
            .end(function(err, response){
                model.voteResponse = response;
                resolve(model.voteResponse);
            });
        });
    },

    deletePost: function(postId) {
        request
        .post('/api/deletePost')
        .query('postId='+ postId)
        .end(function(err, response){
            window.location.href = window.location.origin + '/';
        });
    },

    deleteComment: function(commentJson) {
        request
        .post('/api/deleteComment')
        .send(commentJson)
        .end(function(err, response){
            window.location.reload();
        });
    }
};