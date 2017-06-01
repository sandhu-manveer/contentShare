var model = require('./modules/userModel.js');
var view = require('./modules/userView.js');

/**
 * Initialize Post Page js
 */
var userPage = {
    init: function() {
        model.init();
        view.init();
    }
}

userPage.init();