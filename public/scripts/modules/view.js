var helper = require('./helper.js');
var _ = require('lodash');

var view = module.exports = {
    init: function(){
        view.setInfScroll();
        view.fetchAndRender();
    },

    postTemplate: $.templates('<article class="maincontent-post" post-id="{{:postId}}">{{:header}} {{:media}} {{:details}}</article>'),

    postMediaTemplate: $.templates('<figure class="maincontent-post-media"></figure>'),

    postHeaderTemplate: $.templates('<header class="maincontent-post-header"><h3>{{:title}}</h3><p>{{:author}}<p></header>'),
    
    postDetailsTemplate: $.templates('<div class="maincontent-post-details">{{:upvote}} {{:downvote}} {{:votecount}} </div>'),

    postUpvoteTemplate: $.templates('<div class="post-upvote"><span class="post-upvote-do{{:upVoted}}"></span></div>'),

    postDownvoteTemplate: $.templates('<div class="post-downvote"><span class="post-downvote-do{{:downVoted}}"></span></div>'),

    postcountTemplate: $.templates('<div class="vote-count"><span>{{:upvote_count}}</span></div>'),

    isActive: false,

    isUpVoted: false,

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
                    // initialize click listeners after fetch
                    view.initToggle();    
            })
            .catch(function(err){console.log(err);});
    },

    renderPosts: function() {
        var posts = helper.getCurrentPostData();
        
        // too slow?
        // iteration over all the votes, correct
        if(posts.body.user) {
            for (var i=0; i < posts.body.documents.length; i++) {
                var vote = _.find(posts.body.documents[i].votes, {user_id: posts.body.user}); // works. why?
                posts.body.documents[i].upVoted = '';
                posts.body.documents[i].downVoted = '';
                if (vote && vote.vote !== 0) {
                    if ( vote.vote > 0) posts.body.documents[i].upVoted = 'on';
                    else if ( vote.vote < 0 ) posts.body.documents[i].downVoted = 'on';
                } 
            }
        }
        console.log(posts);
        posts.body.documents.forEach(function(element, index, array){
            $('.maincontent-container').append(view.postTemplate.render({

                postId: element._id,

                header: view.postHeaderTemplate.render({
                    title: element.title,
                    author: element.postedBy.alias
                }),

                media: view.postMediaTemplate.render({}),
                details: view.postDetailsTemplate.render({
                    upvote:view.postUpvoteTemplate.render({
                        upVoted: ' ' + element.upVoted
                    }),
                    downvote:view.postDownvoteTemplate.render({
                        downVoted: ' ' + element.downVoted
                    }),
                    votecount:view.postcountTemplate.render({
                        upvote_count:20
                    })
                })
            }));
        });
        view.isActive = false;
     },

    initToggle: function() {
        $('[class^=post-upvote-do]').click(function() {
            var postId = $(this).parents('article').attr('post-id');
            helper.upvotePost(postId)
                .then(function(res){
                    var response = helper.getVoteResponse();
                    console.log(response);
                    if(!response.body.isLoggedIn) {
                        window.location.href = window.location.origin + '/login';
                    }
                    $(this).toggleClass('on');
                })
                .catch(function(err){console.log(err);})
        });

        $('[class^=post-upvote-do]').click(function() {
            $(this).toggleClass('on');
        });
    }
};