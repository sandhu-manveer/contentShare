var helper = require('./helper.js');

var view = module.exports = {
    init: function(){
        view.setInfScroll();
        view.fetchAndRender();
    },

    postTemplate: $.templates('<article class="maincontent-post">{{:header}} {{:media}}</article>'),

    postMediaTemplate: $.templates('<figure class="maincontent-post-media"></figure>'),

    postHeaderTemplate: $.templates('<header class="maincontent-post-header"><h3>{{:title}}</h3><p>{{:author}}<p></header>'),
    
    postDetailsTemplate: $.templates('<div class="maincontent-post-details"></div>'),

    isActive: false,

    setInfScroll: function() {

        this.initialize = function() {
            this.setupEvents();
        };

        this.setupEvents = function() {
            $(window).on(
                'scroll',
                this.handleScroll.bind(this)
            );
        };


        this.handleScroll = function() {
            $(document).ready(function() {
                var scrollTop = $(document).scrollTop();
                var windowHeight = $(window).height();

                // end of page reached
                if (!view.isActive && $(document).height() - windowHeight == scrollTop) {
                    view.isActive = true;
                    $('#loading').show();
                    view.fetchAndRender();
                }
            });
        }

        this.initialize();
    },

    fetchAndRender: function() {
        helper.getPostData()
            .then(function(res){
                    view.renderPosts();
                    $('#loading').hide();        
            })
            .catch(function(err){console.log(err);});
    },

    renderPosts: function() {
        var posts = helper.getCurrentPostData();
        posts.body.forEach(function(element, index, array){
            $('.maincontent-container').append(view.postTemplate.render({
                header: view.postHeaderTemplate.render({
                    title: element.title,
                    author: 'HC author'
                }),

                media: view.postMediaTemplate.render({})
            }));
        });
        view.isActive = false;
    }
};