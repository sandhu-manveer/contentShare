var helper = require('./helper.js');

var view = module.exports = {
    init: function(){
        view.showCountdown();
        view.registerClick();
        view.registerNavClick();
    },

    registerClick: function() {
        var id;
        var listItem = document.querySelectorAll('#menu li');

        for(var i = 0; i < listItem.length; i++) {
            listItem[i].addEventListener('click', function(){
                id = this.getAttribute('data-id');
                helper.setCurrent(+id);
                helper.increment();
                view.updateCount();
            });
        }
    },

    updateCount: function() {
        var item = helper.getCurrent();
        var li = $('[data-id="'+ item.id +'"]');
        var count = li.find('.menu-count');
        count.html(item.count);
    },

    showCountdown: function(){
        var diff = helper.dateDiff();

        $('#years').append(diff.years);
        $('#months').append(diff.months);
        $('#days').append(diff.days);
    },

    registerNavClick: function() {
        $(document).ready(function() {
            // get current URL path and assign 'active' class
            var pathname = window.location.pathname;
            $('.nav > li > a[href="'+pathname+'"]').parent().addClass('active');
        });
    }
};