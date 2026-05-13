import mongoose from "mongoose"
import { Schema, model } from 'mongoose';
import slugify from "slugify";

const postSchema = new Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    content: {
      type: String,
      required: true,
    },
    slug: { type: String, unique: true }, // SEO URL
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
    // createdAt: {
    //   type: Date,
    //   default: Date.now(),
    // },
    // updatedAt: {
    //   type: Date,
    //   default: Date.now(),
    // },
    status: {
      type: String,
      enum: ["draft", "pending", "published", "rejected"],
      default: "published",
    },
    rejectionReason: { type: String, default: "" },
    readingTime: { type: Number, default: 0 },
  },
  { timestamps: true },
);

// AUTO-GENERATE SLUG BEFORE SAVING
postSchema.pre("save", async function () {
  // 1. Only generate slug if title is new/changed OR slug is empty
  if (this.isModified("title") || !this.slug) {
    // 2. Create the slug
    let baseSlug = slugify(this.title, { lower: true, strict: true });

    // 3. To ensure uniqueness (preventing the 11000 error)
    // If the slug isn't already set (like in our migration script), add a suffix
    if (!this.slug) {
      this.slug = `${baseSlug}-${Math.random().toString(36).substring(7)}`;
    } else {
      this.slug = baseSlug;
    }
  }

  
  // 2. CALCULATE READING TIME
  if (this.isModified("content")) {
    const wordsPerMinute = 200; // Standard reading speed
    // Strip HTML tags to get pure text count
    const plainText = this.content.replace(/<[^>]*>?/gm, '');
    const wordCount = plainText.split(/\s+/).filter(word => word.length > 0).length;
    
    // Set the readingTime (minimum 1 minute)
    this.readingTime = Math.ceil(wordCount / wordsPerMinute) || 1;
  }

  // IMPORTANT: No next() call here when using async/await
});

export default model("Post", postSchema);