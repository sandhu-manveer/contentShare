var request = require('superagent');

var model = module.exports = {
    init: function(){
       console.log('Model Init');
       model.lastTime = new Date();
    },

    postData: {},

    lastTime: null, 

    /**
     * @param Date() lastTime
     */
    getPostData: function() {
        return new Promise(function(resolve, reject){
            request
            .get('/api/getPosts')
            .query('lastTime='+ model.lastTime.toISOString() + '')
            .end(function(err, response){
                if(err) { console.log("error>>", err); } // remove
                model.postData = response;
                model.lastTime = new Date(response.body[response.body.length - 1].postedTime);
                console.log(model.lastTime);
                resolve(model.postData);
            });
        });
    }
};