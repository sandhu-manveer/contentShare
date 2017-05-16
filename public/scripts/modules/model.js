var request = require('superagent');

var model = module.exports = {
    init: function(){
       console.log('Model Init');
       model.lastTime = new Date();
       model.getPostData(model.lastTime);
    },

    postData: {},

    fetchComplete: false,

    lastTime: null, 

    /**
     * @param Date() lastTime
     */
    getPostData: function(lastTime) {
        return new Promise(function(resolve, reject){
            request
            .get('/api/getPosts')
            .query('lastTime='+ lastTime.toISOString() + '')
            .end(function(err, response){
                if(err) { console.log("error>>", err); } // remove
                model.postData = response;
                resolve(model.postData);
            });
        });
    }
};