var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');
// mongoose.connect("mongodb://localhost/facebook");
var commentSchema = mongoose.Schema({
  author:String,
  comment:String,
  clikes:[{type : mongoose.Schema.Types.ObjectId, ref : 'user'}],
});

module.exports = mongoose.model('comment', commentSchema);
