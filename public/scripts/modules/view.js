var helper = require('./helper.js');

var view = module.exports = {
    init: function(){
        view.setInfScroll();
        view.fetchAndRender();
    },

    postTemplate: $.templates('<article class="maincontent-post">{{:header}} {{:media}} {{:details}}</article>'),

    postMediaTemplate: $.templates('<figure class="maincontent-post-media"></figure>'),

    postHeaderTemplate: $.templates('<header class="maincontent-post-header"><h3>{{:title}}</h3><p>{{:author}}<p></header>'),
    
    postDetailsTemplate: $.templates('<div class="maincontent-post-details">{{:upvote}} {{:downvote}} {{:votecount}} </div>'),

    postUpvoteTemplate: $.templates('<div class="post-upvote"><span class="post-upvote-do"></span></div>'),

    postDownvoteTemplate: $.templates('<div class="post-downvote"><span class="post-downvote-do"></span></div>'),

    postcountTemplate: $.templates('<div class="vote-count"><span>{{:upvote_count}}</span></div>'),

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
                    view.initToggle();    
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

                media: view.postMediaTemplate.render({}),
                details: view.postDetailsTemplate.render({
                    upvote:view.postUpvoteTemplate.render({}),
                    downvote:view.postDownvoteTemplate.render({}),
                    votecount:view.postcountTemplate.render({
                        upvote_count:20
                    })
                })
            }));
        });
        view.isActive = false;
     },

    initToggle: function() {
        $('.post-downvote-do').click(function() {
            $(this).toggleClass('on');
            });
        $('.post-upvote-do').click(function() {
            $(this).toggleClass('on');
            }
        );
    }
};