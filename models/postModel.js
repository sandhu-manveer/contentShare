var mongoose = require('mongoose');
var dotenv = require('dotenv');

var schemaOptions = { 
    collection: 'post'
};

var voteSchema = new mongoose.Schema({ 
    user_id: {type: mongoose.Schema.Types.ObjectId, required: true},
    vote: Number 
}, {_id: false});

mongoose.model('vote', voteSchema);

var commentSchema = new mongoose.Schema({
    user_id: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'user' },
    votes: [voteSchema],
    text: { type: String},
    postedTime: { type : Date, default: Date.now },
}, {_id: true});

commentSchema.add({
    comments: [commentSchema]
});

var Comment = mongoose.model('comment', commentSchema);

var postSchema = new mongoose.Schema({
    title: {type: String, required: true, minlength: 5},
    votes: [voteSchema],
    postedBy: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'user' },
    postedTime: { type : Date, default: Date.now },
    comments: [commentSchema],
    score: { type: Number, required: true }
}, schemaOptions);

// middleware to compute post score
// Sacalability. shift to parallel process?
// ref:https://medium.com/hacking-and-gonzo/how-reddit-ranking-algorithms-work-ef111e33d0d9
postSchema.pre('save', function(next) {
    var post = this;

    // if (!post.isModified('score')) return next(); // keep condition for parallel service

    var seconds_diff = Math.floor((post.postedTime).getTime()/1000) - parseInt(process.env.APP_FIXED_TIME);

    var votes = post.votes.reduce(function(a, b) {return a + b.vote;}, 0);

    var order = Math.log10(Math.abs(Math.max(votes, 1)));

    var sign = (votes > 0) ? 1 : -1;
    if(votes === 0) sign = 0;

    post.score = Math.round((sign * order + seconds_diff / 45000) * Math.pow(10, 7)) / Math.pow(10, 7);
    next();
});

var Post = mongoose.model('post', postSchema);

module.exports = {
    Post,
    Comment
};