var countdown = require('countdown');
var model = require('./model.js');

var helper = module.exports = {

    getCurrentPostData: function() {
        return model.postData;
    },

    getPostData: function() {
        model.getPostData(new Date(model.lastTime));
    },

    setPostsTimestamp: function() {        
        model.lastTime = model.postData.body[model.postData.body.length - 1].postedTime;
    }

};
