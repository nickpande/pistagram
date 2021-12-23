var express = require("express");
var router = express.Router();
var mongoose = require("mongoose");
require('dotenv').config();

const string = String(process.env.CONNECTION_URL);

mongoose.connect(string);

var passportLocalMongoose = require("passport-local-mongoose");
var userSchema = mongoose.Schema({
  username: String,
  email: String,
  imageurl: [{
      type: String,
    }],
  password: String,
  posts: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "post",
    },
  ],
  story: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "story",
    },
  ],
  time: {
    type: Number,
    default: 0,
  },
  secret: String,
  expiry: {
    type: Number,
    default: Date.now() + 60 * 1000,
  },
  friends: [{ type: String }],

  shares: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "post",
    },
  ],
  saves: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "post",
    },
  ],
});

userSchema.plugin(passportLocalMongoose);
module.exports = mongoose.model("user", userSchema);
