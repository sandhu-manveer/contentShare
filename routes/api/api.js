var express = require("express");
var mongoose = require('mongoose');

var router = express.Router();

var uploadPost = require("./uploadPost");
router.use(uploadPost);

var getPosts = require("./getPosts");
router.use(getPosts);

var vote = require("./vote");
router.use(vote);

var commentVote = require("./commentVote");
router.use(commentVote);

var deletePost = require('./deletePost');
router.use(deletePost);

var getSinglePost = require('./getSinglePost');
router.use(getSinglePost);

var postComment = require('./postComment');
router.use(postComment);

var deleteComment = require('./deleteComment');
router.use(deleteComment);

module.exports = router;