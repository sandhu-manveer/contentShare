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
    
    postDetailsTemplate: $.templates('<div class="maincontent-post-details">{{:buttons}} {{:votecount}} {{:deleteButton}}</div>'),

    postButtonsTemplate: $.templates('<div class="post-vote">{{:upvote}}{{:downvote}}</div>'),

    postUpvoteTemplate: $.templates('<span id="upVote" class="post-vote-do-up{{:upVoted}}"></span>'), // is it right to add id?

    postDownvoteTemplate: $.templates('<span id="downVote" class="post-vote-do-down{{:downVoted}}"></span>'),

    postCountTemplate: $.templates('<div class="vote-count"><span class="post-votes">{{:postScore}}</span></div>'),

    postDeleteButtonTemplate: $.templates('<div class="delete-button-container"><button type="button" class="deleteButton btn btn-default btn-xs">Delete</button></div>'),

    // html template for comments
    commentTemplate: $.templates('<div class="comment-body" comment-id="{{:commentId}}">{{:commentHeader}}{{:commentText}}{{:commentDetails}}<div class="child"></div></div>'),

    commentHeaderTemplate: $.templates('<header class="comment-body-header"><span class="comment-body-author">{{:commentAuthor}}</span><span class="comment-body-time">{{:commentTime}}</span></header>'),

    commentTextTemplate: $.templates('<div class="comment-body-text">{{:commentText}}</div>'),

    commentDetailsTemplate: $.templates('<div class="comment-details-pane">{{:commentVoteButtons}}{{:commentVoteCount}}{{:commentReplyButton}}{{:commentDeleteButton}}</div>'),

    commentButtonsTemplate: $.templates('<div class="comment-vote">{{:commentUpVote}}{{:commentDownVote}}</div>'),

    commentUpvoteTemplate: $.templates('<span id="upVote" class="comment-vote-do-up{{:commentUpVoted}}"></span>'),

    commentDownvoteTemplate: $.templates('<span id="downVote" class="comment-vote-do-down{{:commentDownVoted}}"></span>'),

    commentVoteCountTemplate: $.templates('<div class="comment-vote-count"><span class="comment-votes">{{:commentScore}}</span></div>'),

    commentReplyTemplate: $.templates('<div class="comment-reply"><button type="button" class="replyButton btn btn-default btn-xs">Reply</button></div>'),

    commentDeleteButtonTemplate: $.templates('<div class="comment-delete-button-container"><button type="button" class="commentDeleteButton btn btn-default btn-xs">Delete</button></div>'),

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
                    view.initDeleteButton();
                    view.initReplyButtons();
                    view.initCommentDeleteButton();
                    view.initCommentVoteToggle();
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
        var deleteTemplate = null;
        if(loggedIn) {
            var vote = _.find(post.votes, {user_id: view.postData.body.user}); // works. why?
            if (vote && vote.vote !== 0) {
                if ( vote.vote > 0) post.upVoted = ' on';
                else if ( vote.vote < 0 ) post.downVoted = ' on';
            }
            if (post.postedBy._id === view.postData.body.user) deleteTemplate = view.postDeleteButtonTemplate({});
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
                }),
                deleteButton: deleteTemplate
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

    /**
     * init delete button
     * 
     */
    initDeleteButton: function() {
        $('.deleteButton').on('click', function() {
            var postId = $(this).parents('article').attr('post-id');
            helper.deletePost(postId);
        });
    },

    renderComments: function() {
        var comments = view.postData.body.post.comments;
        var user_id = null;
        var loggedIn = false;

        if(view.postData.body.user) {
            // does using a boolean provide any advantage?
            loggedIn = true;
            user_id = view.postData.body.user;
        }

        var result = $('.maincomment-container');
        iterateAndRenderComments(result, comments, null);

        function iterateAndRenderComments(result, comments, parent_id) {
            for (var i = 0; i < comments.length; i++) {
                child = comments[i];
                
                child.upVoted = '';
                child.downVoted = '';
                var deleteTemplate = null;
                if(loggedIn) {
                    var vote = _.find(child.votes, {user_id: user_id}); // works. why?
                    if (vote && vote.vote !== 0) {
                        if ( vote.vote > 0) child.upVoted = ' on';
                        else if ( vote.vote < 0 ) child.downVoted = ' on';
                    }
                    if(child.user_id) {
                        if (child.user_id === view.postData.body.user) deleteTemplate = view.commentDeleteButtonTemplate({});
                    }
                } 
                if(!parent_id) result.append(view.renderCommentTemplates(child, deleteTemplate));
                else result.find('[comment-id='+ parent_id +']').children('.child').append(view.renderCommentTemplates(child, deleteTemplate));
                if(child.comments && child.comments.length > 0) {
                    iterateAndRenderComments(result, child.comments, child._id);
                }
            }
        }
    },

    renderCommentTemplates: function(comment, deleteTemplate) {
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
                        commentUpVoted: comment.upVoted
                    }),
                    commentDownVote: view.commentDownvoteTemplate.render({
                        commentDownVoted:  comment.downVoted
                    })
                }),
                commentVoteCount: view.commentVoteCountTemplate.render({
                    commentScore: comment.votes.reduce(function(a, b) {
                        return a + b.vote;  
                    }, 0)
                }),
                commentReplyButton: view.commentReplyTemplate.render({}),
                commentDeleteButton: deleteTemplate
            })
        })).contents();
    },

    initReplyButtons: function() {
        $('.replyButton').on('click', function(){
            var replyButton = $(this);
            var parent_id = replyButton.parents('.comment-body').first().attr('comment-id');
            var postId = $('meta[name=postId]').attr("content");

            var replyHTML = '<div class="reply-container">';
            replyHTML += '<form class="form-horizontal" action="/api/postComment" method="POST">';
            replyHTML += '<input class="comment-input"type="text" placeholder="Reply" name="text">';
            replyHTML += '<input type="hidden" name="postId" value='+ postId +' />';
            replyHTML += '<input type="hidden" name="parent_id" value='+ parent_id +' />';
            replyHTML += '<input type="submit" value="Reply">';
            replyHTML += '</form>';
            replyHTML += '</div>';

            replyButton.parents('.comment-details-pane').first().after(replyHTML);
            replyButton.hide();
        });
    },

    /**
     * Function to attach click listeners on up/down vote sprites on comments
     */
    initCommentVoteToggle: function() {
        $('[class^=comment-vote-do-]').click(function() {
            var element = this;
            var type = $(this).attr('id');
            var postId = $('meta[name=postId]').attr("content");
            var comment_id = $(this).parents('.comment-body').first().attr('comment-id');
            helper.voteComment(postId, comment_id, type)
                .then(function(res){
                    var response = helper.getVoteResponse();
                    if(!response.body.isLoggedIn) {
                        window.location.href = window.location.origin + '/login';
                    } else {
                        view.setVoteScore(element, response.body.vote);
                        $(element).siblings().removeClass('on');
                        $(element).toggleClass('on');
                    }
                })
                .catch(function(err){console.log(err);});
        });
    },

    /**
     * Display change in comment score based on up/down vote
     * 
     * @param {document} element the html dom contianing post meta
     * @param {String} vote up/down vote, obtained from comment id
     */
    setVoteScore: function(element, vote) {
        $(element).parent().siblings('[class=comment-vote-count]').children('[class=comment-votes]').html(function(){             
            var retVal = parseInt($(this).html());
            var clickedClass = $(element).attr('class');
            var otherClass = $(element).siblings().attr('class');
            if (clickedClass === 'comment-vote-do-up' && otherClass === 'comment-vote-do-down') retVal = retVal + vote;
            if (clickedClass === 'comment-vote-do-down' && otherClass === 'comment-vote-do-up') retVal = retVal + vote;
            if (clickedClass === 'comment-vote-do-up on' && otherClass === 'comment-vote-do-down') retVal = retVal - 1;
            if (clickedClass === 'comment-vote-do-down on' && otherClass === 'comment-vote-do-up') retVal = retVal + 1;  
            if (clickedClass === 'comment-vote-do-up' && otherClass === 'comment-vote-do-down on') retVal = retVal + 2;
            if (clickedClass === 'comment-vote-do-down' && otherClass === 'comment-vote-do-up on') retVal = retVal - 2;         
            return retVal.toString();
        });
    },

     initCommentDeleteButton: function() {
        $('.commentDeleteButton').on('click', function() {
            var commentJson = {};
            var post_id = $('meta[name=postId]').attr("content");
            var comment_id = $(this).parents('.comment-body').first().attr('comment-id');
            commentJson.post_id = post_id;
            commentJson.comment_id = comment_id;
            helper.deleteComment(commentJson);
        });
    }
};