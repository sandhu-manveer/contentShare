var model = require('./modules/postModel.js');
var view = require('./modules/postView.js');

/**
 * Initialize Post Page js
 */
var postPage = {
    init: function() {
        model.init();
        view.init();
    }
}

postPage.init();