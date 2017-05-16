var helper = require('./helper.js');

var view = module.exports = {
    init: function(){
        view.setInfScroll();

        helper.getPostData()
            .then(function(res){
                view.postsData = helper.getCurrentPostData();
                helper.setPostsTimestamp();
                view.renderPosts();
            })
            .catch(function(err){console.log(err);});;
    },

    postsData: [],

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
                var height = $(document).height() - windowHeight;
                var scrollPercentage = (scrollTop / height);

                // if the scroll is more than 80% from the top, load more content.
                if(scrollPercentage > 0.8) {
                    helper.getPostData()
                        .then(function(res){
                            helper.setPostsTimestamp();
                            view.postsData = helper.getCurrentPostData();
                            view.renderPosts();
                        })
                        .catch(function(err){console.log(err);});;
                }
            });
            
        }

        this.initialize();
    },

    renderPosts: function() {
        var posts = view.postsData;
        posts.body.forEach(function(element, index, array){
            $('.maincontent-container').append('<article class="maincontent-post"><h1>' + element.title + '</h1></article>');
        });
    }
};