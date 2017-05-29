var mongoose = require('mongoose');

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
    postedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'user' },
    postedTime: { type : Date, default: Date.now },
    comments: [commentSchema]
}, schemaOptions);

var Post = mongoose.model('post', postSchema);

module.exports = {
    Post,
    Comment
};