var helper = require('./postHelper.js');
var _ = require('lodash');

var view = module.exports = {
    init: function(){
        view.fetchAndRender();
    },

    // html templates to build maincontent post

    postTemplate: $.templates('<article class="maincontent-post" post-id="{{:postId}}">{{:header}} {{:media}} {{:details}}</article>'),

    postMediaTemplate: $.templates('<figure class="maincontent-post-media"></figure>'),

    postHeaderTemplate: $.templates('<header class="maincontent-post-header"><h3 class="post-heading"><a href="/post/{{:postId}}">{{:title}}</a></h3><p class="post-heading"><a href="/user/{{:userId}}">{{:author}}</a></p></header>'),
    
    postDetailsTemplate: $.templates('<div class="maincontent-post-details">{{:buttons}} {{:votecount}}</div>'),

    postButtonsTemplate: $.templates('<div class="post-vote">{{:upvote}}{{:downvote}}</div>'),

    postUpvoteTemplate: $.templates('<span id="upVote" class="post-vote-do-up{{:upVoted}}"></span>'), // is it right to add id?

    postDownvoteTemplate: $.templates('<span id="downVote" class="post-vote-do-down{{:downVoted}}"></span>'),

    postCountTemplate: $.templates('<div class="vote-count"><span class="post-votes">{{:postScore}}</span></div>'),

    // html template for comments
    commentTemplate: $.templates('<div class="comment-body" comment-id="{{:commentId}}">{{:commentHeader}}{{:commentText}}{{:commentDetails}}<div class="child"></div></div>'),

    commentHeaderTemplate: $.templates('<header class="comment-body-header"><span class="comment-body-author">{{:commentAuthor}}</span><span class="comment-body-time">{{:commentTime}}</span></header>'),

    commentTextTemplate: $.templates('<div class="comment-body-text">{{:commentText}}</div>'),

    commentDetailsTemplate: $.templates('<div class="comment-details-pane">{{:commentVoteButtons}}{{:commentVoteCount}}</div>'),

    commentButtonsTemplate: $.templates('<div class="comment-vote">{{:commentUpVote}}{{:commentDownVote}}</div>'),

    commentUpvoteTemplate: $.templates('<span id="upVote" class="comment-vote-do-up{{:commentUpVoted}}"></span>'),

    commentDownvoteTemplate: $.templates('<span id="downVote" class="comment-vote-do-down{{:commentDownVoted}}"></span>'),

    commentVoteCountTemplate: $.templates('<div class="vote-count"><span class="post-votes">{{:commentScore}}</span></div>'),

    // temporarily save post data
    postData: {},

    /**
     * fetch post from server and render
     */
    fetchAndRender: function() {
        var postId = $('meta[name=postId]').attr("content");
        helper.getPostData(postId)
            .then(function(res){
                    view.renderPost();
                    view.renderComments();
                    $('#loading').hide();
                    // initialize click listeners after fetch
                    view.initToggle();
            })
            .catch(function(err){console.log(err);});
    },

    /**
     * function to render post
     * checks login status and accordingly displays up/down votes and score
     */
    renderPost: function() {
        view.postData = helper.getCurrentPostData();
        var post = view.postData.body.post;
        var loggedIn = false;

        if(view.postData.body.user) {
            // does using a boolean provide any advantage?
            loggedIn = true;
        }

        // too slow?
        // iteration over all the votes, correct?
        post.upVoted = '';
        post.downVoted = '';
        if(loggedIn) {
            var vote = _.find(post.votes, {user_id: view.postData.body.user}); // works. why?
            if (vote && vote.vote !== 0) {
                if ( vote.vote > 0) post.upVoted = ' on';
                else if ( vote.vote < 0 ) post.downVoted = ' on';
            }
        }
        
        $('.mainpost-container').append(view.postTemplate.render({

            postId: post._id,

            header: view.postHeaderTemplate.render({
                title:  post.title,
                author:  post.postedBy.alias, 
                postId:  post._id,
                userId: post.postedBy._id
            }),

            media: view.postMediaTemplate.render({}),
            details: view.postDetailsTemplate.render({
                buttons: view.postButtonsTemplate.render({
                    upvote: view.postUpvoteTemplate.render({
                        upVoted: post.upVoted
                    }),
                    downvote: view.postDownvoteTemplate.render({
                        downVoted: post.downVoted
                    })
                }),
                votecount:view.postCountTemplate.render({
                    postScore: post.votes.reduce(function(a, b) {
                        return a + b.vote;  
                    }, 0)
                })
            })
        }));
     }, 

    /**
     * Function to attach click listeners on up/down vote sprites
     */
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
                    } else {
                        view.setScore(element, response.body.vote);
                        $(element).siblings().removeClass('on');
                        $(element).toggleClass('on');
                    }
                })
                .catch(function(err){console.log(err);});
        });
    },

    /**
     * Display change in score based on up/down vote
     * 
     * @param {document} element the html dom contianing post meta
     * @param {String} vote up/down vote, obtained from post id
     */
    setScore: function(element, vote) {
        $(element).parent().siblings('[class=vote-count]').children('[class=post-votes]').html(function(){             
            var retVal = parseInt($(this).html());
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
    },

    renderComments: function() {
        var comments = view.postData.body.post.comments;

        // TODO: add login check
        var result = $('.maincomment-container');
        iterateAndRenderComments(result, comments, null);

        function iterateAndRenderComments(result, comments, parent_id) {
            for (var i = 0; i < comments.length; i++) {
                child = comments[i];
                if(!parent_id) result.append(view.renderCommentTemplates(child));
                else result.find('[comment-id='+ parent_id +']').children('.child').append(view.renderCommentTemplates(child));
                if(child.comments && child.comments.length > 0) {
                    iterateAndRenderComments(result, child.comments, child._id);
                }
            }
        }
    },

    renderCommentTemplates: function(comment) {
        return $('<div/>').html(view.commentTemplate.render({

            commentId: comment._id,

            commentHeader: view.commentHeaderTemplate.render({
                commentAuthor:  comment.user_id, 
                commentTime:  comment.postedTime
            }),

            commentText: view.commentTextTemplate.render({
                commentText: comment.text
            }),

            commentDetails: view.commentDetailsTemplate.render({
                commentVoteButtons: view.commentButtonsTemplate.render({
                    commentUpVote: view.commentUpvoteTemplate.render({
                        upVoted: comment.upVoted
                    }),
                    commentDownVote: view.commentDownvoteTemplate.render({
                        commentDownVoted:  comment.downVoted
                    })
                }),
                commentVoteCount: view.commentVoteCountTemplate.render({
                    commentScore: comment.votes.reduce(function(a, b) {
                        return a + b.vote;  
                    }, 0)
                })
            })
        })).contents();
    }
};