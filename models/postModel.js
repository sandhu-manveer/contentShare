var mongoose = require('mongoose');

var schemaOptions = { 
    collection: 'post'
};

var postSchema = new mongoose.Schema({
    title: {type: String, required: true, minlength: 5},
    votes: [{ user_id: mongoose.Schema.Types.ObjectId, vote: Number }],
    postedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'users' },
    postedTime: { type : Date, default: Date.now }
}, schemaOptions);

module.exports = mongoose.model('post', postSchema);