var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');
// mongoose.connect("mongodb://localhost/facebook");
var storySchema = mongoose.Schema({
  caption :String,
  imageurl:String,
  time:Number,
  suser: {type : mongoose.Schema.Types.ObjectId, ref : 'user'}
});

module.exports = mongoose.model('story', storySchema);