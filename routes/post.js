var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');
// mongoose.connect("mongodb://localhost/facebook");
var postSchema = mongoose.Schema({
  caption :String,
  desc:String,
  imageurl:String,
  likes:[{type : mongoose.Schema.Types.ObjectId, ref : 'user'}],
  author:{type : mongoose.Schema.Types.ObjectId, ref : 'user'},  
  comments:[{
    type : mongoose.Schema.Types.ObjectId, ref : 'comment'
  }]
});

module.exports = mongoose.model('post', postSchema);

