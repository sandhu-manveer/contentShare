var model = require('./modules/model.js');
var view = require('./modules/view.js');

var app = {
    init: function() {
        model.init();
        setTimeout(function(){
            view.init();
        }, 3000);
    }
}

app.init();