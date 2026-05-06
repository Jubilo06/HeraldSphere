import mongoose from "mongoose"
import { Schema, model } from 'mongoose';

const postSchema = new Schema({
  title: {
    type: String,
    required: true,
    trim: true,
  },
  content: {
    type: String,
    required: true,
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
    // default: "Admin", // Or link to a User model
  },
  category: {
    type: String,
    trim: true,
    required: true,
  },
  mainImageUrl: {
    type: String, // Store the URL of the uploaded image
    default: null, // It's optional, so can be null if no main image is provided
  },
  likes: {
    type: Number,
    default: 0,
  },
  createdAt: {
    type: Date,
    default: Date.now(),
  },
  updatedAt: {
    type: Date,
    default: Date.now(),
  },
});

export default model("Post", postSchema);