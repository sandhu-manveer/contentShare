var request = require('superagent');

/**
 * Functions for making calls to app services
 */
var model = module.exports = {
    init: function(){
       console.log('Model Init');
       model.lastTime = new Date();
    },

    postData: {},

    lastTime: null, 

    voteResponse: {},

    /**
     * get get posts from server
     */
    getPostData: function() {
        return new Promise(function(resolve, reject){
            request
            .get('/api/getPosts')
            .query('lastTime='+ model.lastTime.toISOString() + '')
            .end(function(err, response){
                if(err) { console.log("error>>", err); } // remove
                model.postData = response;
                model.lastTime = new Date(response.body.documents[response.body.documents.length - 1].postedTime);
                console.log(model.lastTime);
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
    }
};