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
    
    postDetailsTemplate: $.templates('<div class="maincontent-post-details">{{:buttons}} {{:votecount}}</div>'),

    postButtonsTemplate: $.templates('<div class="post-vote">{{:upvote}}{{:downvote}}</div>'),

    postUpvoteTemplate: $.templates('<span id="upVote" class="post-vote-do-up{{:upVoted}}"></span>'), // is it right to add id?

    postDownvoteTemplate: $.templates('<span id="downVote" class="post-vote-do-down{{:downVoted}}"></span>'),

    postcountTemplate: $.templates('<div class="vote-count"><span class="post-votes">{{:upvote_count}}</span></div>'),

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
                    // initialize click listeners after fetch
                    view.initToggle();    
            })
            .catch(function(err){console.log(err);});
    },

    renderPosts: function() {
        var posts = helper.getCurrentPostData();
        var loggedIn = false;

        if(posts.body.user) {
            // does using a boolean provide any advantage?
            loggedIn = true;
        }
        
        // too slow?
        // iteration over all the votes, correct
        for (var i=0; i < posts.body.documents.length; i++) {
            posts.body.documents[i].upVoted = '';
            posts.body.documents[i].downVoted = '';
            if(loggedIn) {
                var vote = _.find(posts.body.documents[i].votes, {user_id: posts.body.user}); // works. why?
                if (vote && vote.vote !== 0) {
                    if ( vote.vote > 0) posts.body.documents[i].upVoted = ' on';
                    else if ( vote.vote < 0 ) posts.body.documents[i].downVoted = ' on';
                }
            } 
        }
        
        posts.body.documents.forEach(function(element, index, array){
            $('.maincontent-container').append(view.postTemplate.render({

                postId: element._id,

                header: view.postHeaderTemplate.render({
                    title: element.title,
                    author: element.postedBy.alias
                }),

                media: view.postMediaTemplate.render({}),
                details: view.postDetailsTemplate.render({
                    buttons: view.postButtonsTemplate.render({
                        upvote: view.postUpvoteTemplate.render({
                            upVoted: element.upVoted
                        }),
                        downvote: view.postDownvoteTemplate.render({
                            downVoted: element.downVoted
                        })
                    }),
                    votecount:view.postcountTemplate.render({
                        upvote_count: element.votes.reduce(function(a, b) {
                            return a + b.vote;  
                        }, 0)
                    })
                })
            }));
        });
        view.isActive = false;
     },

    initToggle: function() {
        $('[class^=post-vote-do-]').click(function() {
            var element = this;
            var type = $(this).attr('id');
            var postId = $(this).parents('article').attr('post-id');
            helper.votePost(postId, type)
                .then(function(res){
                    var response = helper.getVoteResponse();
                    if(!response.body.isLoggedIn) {
                        window.location.href = window.location.origin + '/login';
                    }
                    view.setScore(element, response.body.vote);
                    $(element).siblings().removeClass('on');
                    $(element).toggleClass('on');
                })
                .catch(function(err){console.log(err);});
        });
    },

    setScore: function(element, vote) {
        $(element).parent().siblings('[class=vote-count]').children('[class=post-votes]').html(function(){             
            var retVal = parseInt($(this).html())
            var clickedClass = $(element).attr('class');
            var otherClass = $(element).siblings().attr('class');
            if (clickedClass === 'post-vote-do-up' && otherClass === 'post-vote-do-down') retVal = retVal + vote;
            if (clickedClass === 'post-vote-do-down' && otherClass === 'post-vote-do-up') retVal = retVal + vote;
            if (clickedClass === 'post-vote-do-up on' && otherClass === 'post-vote-do-down') retVal = retVal - 1;
            if (clickedClass === 'post-vote-do-down on' && otherClass === 'post-vote-do-up') retVal = retVal + 1;  
            if (clickedClass === 'post-vote-do-up' && otherClass === 'post-vote-do-down on') retVal = retVal + 2;
            if (clickedClass === 'post-vote-do-down' && otherClass === 'post-vote-do-up on') retVal = retVal - 2;         
            return retVal.toString();
        });
    }
};