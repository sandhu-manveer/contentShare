var request = require('superagent');

var model = module.exports = {
    init: function(){
       console.log('Model Init');
    },

    currentDate: new Date(),
    eventDate: new Date(2056, 10, 05),

    menuItem: {
        title: null,
        count: null,
        id: null
    }, 
    
    menu: {}
};