import Post from "../models/Post.mjs";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import Subscriber from "../models/Subscriber.mjs";
import SibApiV3Sdk from "sib-api-v3-sdk";
import Comment from "../models/Comment.mjs";
import slugify from "slugify";



const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Helper to delete local files
const deleteLocalFile = (imageUrl) => {
  if (!imageUrl || imageUrl.startsWith("http")) return; // Don't delete external URLs

  // Extract local path: /uploads/post_images/filename.jpg -> backend/uploads/post_images/filename.jpg
  const relativePath = imageUrl.split("http://localhost:5014")[1] || imageUrl;
  const filePath = path.join(__dirname, "..", relativePath);

  if (fs.existsSync(filePath)) {
    fs.unlink(filePath, (err) => {
      if (err) console.error("Failed to delete local image:", err);
      else console.log("Deleted local image:", filePath);
    });
  }
};

// Trigger this after post is saved
const notifySubscribers = async (post) => {
  const subscribers = await Subscriber.find();
  if (subscribers.length === 0) return;

  const defaultClient = SibApiV3Sdk.ApiClient.instance;
  const apiKey = defaultClient.authentications['api-key'];
  apiKey.apiKey = process.env.BREVO_API_KEY;

  const apiInstance = new SibApiV3Sdk.TransactionalEmailsApi();
  
  const sendEmail = {
    sender: { name: "Herald Sphere", email: process.env.SENDER_EMAIL },
    to: subscribers.map(sub => ({ email: sub.email })),
    subject: `Fresh Story: ${post.title}`,
    htmlContent: `
      <div style="font-family: 'Helvetica', sans-serif; max-width: 600px; margin: auto; border: 1px solid #e2e8f0; border-radius: 16px; overflow: hidden;">
        <div style="background-color: #4f46e5; padding: 20px; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 24px;">Herald Sphere</h1>
        </div>
        <div style="padding: 30px;">
          <p style="color: #64748b; font-size: 12px; text-transform: uppercase; letter-spacing: 2px; font-weight: bold;">New Article Published</p>
          <h2 style="color: #0f172a; font-size: 22px;">${post.title}</h2>
          <img src="${post.mainImageUrl}" style="width: 100%; border-radius: 12px; margin: 20px 0;" />
          <p style="color: #475569; line-height: 1.6;">A new dispatch has arrived in the Sphere. Be the first to read our latest insights.</p>
          <a href="http://localhost:5173/posts/${post._id}" 
             style="display: inline-block; background-color: #4f46e5; color: white; padding: 12px 25px; text-decoration: none; border-radius: 8px; font-weight: bold; margin-top: 20px;">
             Read Full Article
          </a>
        </div>
        <div style="background-color: #f8fafc; padding: 20px; text-align: center; border-top: 1px solid #e2e8f0;">
          <p style="color: #94a3b8; font-size: 11px;">You are receiving this because you subscribed to Herald Sphere. <br/> <a href="#">Unsubscribe</a></p>
        </div>
      </div>
    `
  };

  try {
    await apiInstance.sendTransacEmail(sendEmail);
    console.log("Newsletter sent to subscribers");
  } catch (err) {
    console.error("Brevo Error:", err);
  }
};


export const getAllPosts=async (req, res) => {
  const page = parseInt(req.query.page) || 1; // Default to page 1
  const limit = parseInt(req.query.limit) || 5; // Default to 5 posts per page (matches frontend)

  const skip = (page - 1) * limit;
  const { category } = req.query;
  const { search } = req.query;
  try {
    let filter = {};
    if (category && category !== "null" && category !== "undefined") {
      filter.category = category;
    }

    console.log("Backend Filter applied:", filter);
     if (search) {
       filter.$or = [
         { title: { $regex: search, $options: "i" } },
         { category: { $regex: search, $options: "i" } },
       ];
     }
     const totalPosts = await Post.countDocuments(filter); // Get total count for pagination info
     const posts = await Post.find(filter)
       .populate("author", "username firstName lastName profilePic")
       .sort({ createdAt: -1 })
       .skip(skip)
       .limit(limit);

    console.log(
      "Fetched posts with authors:",
      posts.map((p) => ({
        _id: p._id,
        title: p.title,
        authorId: p.author?._id, // Log author ID if available
        authorName: p.author
          ? `${p.author.firstName} ${p.author.lastName}`
          : "NULL AUTHOR",
      })),
    );

     res.json({
       posts,
       currentPage: page,
       totalPages: Math.ceil(totalPosts / limit),
       totalPosts,
     });
  } catch (error) {
    console.error("Error fetching paginated posts:", error); // More specific error log
    res.status(500).json({ message: error.message });
  }
};


// Get a single post by ID
export const getPostBySlug =async (req, res) => {
  try {
    const { slug } = req.params;

    if (!slug || slug === "undefined") {
      return res.status(400).json({ message: "No slug provided" });
    }
    const post = await Post.findOne({slug: slug}).populate('author', 'username firstName lastName profilePic');
    if (!post) {
      return res.status(404).json({ message: 'Post not found.' });
    }
    res.json(post);
  } catch (error) {
    console.error('Error fetching single post:', error);
    if (error.kind === 'ObjectId') {
      return res.status(400).json({ message: 'Invalid Post Slug format.' });
    }
    res.status(500).json({ message: 'Server error fetching post.' });
  }
};



//Create a new post

export const createPost=async (req, res) => {
  try {
    const { title, content, category, mainImageUrl } = req.body;

    // Basic validation
    if (!title || !content || !category) {
      return res
        .status(400)
        .json({ message: "Title, content, and category are required." });
    }

    const newPost = new Post({
      title,
      content,
      category,
      author: req.user._id,
      mainImageUrl,
    });

    await newPost.save();

    // RUN THIS AFTER SUCCESS
    notifySubscribers(newPost);

    res.status(201).json(newPost);
  } catch (error) {
    console.error('Error creating post:', error);
    res.status(500).json({ message: 'Server error creating post.' });
  }
};



// Get posts by the authenticated user (for writers to see their own posts)

export const getPostByUser=async (req, res) => {
    try {
        const myPosts = await Post.find({ author: req.user._id })
          .populate("author", "username firstName lastName profilePic")
          .sort({ createdAt: -1 });
        res.json(myPosts);
    } catch (error) {
        console.error('Error fetching user-specific posts:', error);
        res.status(500).json({ message: 'Server error fetching your posts.' });
    }
};

// Update an existing post by ID
// Requires authentication and either ownership or admin role
export const updatePost=async (req, res) => {
  try {
    const { post } = req; // Post object is already fetched and attached by checkPostOwnershipOrAdmin

    const { title, content, category, mainImageUrl } = req.body;
    if (
      mainImageUrl &&
      post.mainImageUrl &&
      mainImageUrl !== post.mainImageUrl
    ) {
      deleteLocalFile(post.mainImageUrl);
    }
    // Update fields if provided
    post.title = title || post.title;
    post.content = content || post.content;
    post.category = category || post.category;
    post.mainImageUrl = mainImageUrl !== undefined ? mainImageUrl : post.mainImageUrl;
    await post.save();
    res.json(post);
  } catch (error) {
    console.error('Error updating post:', error);
    res.status(500).json({ message: 'Server error updating post.' });
  }
};


// Delete a post by ID
// Requires authentication and either ownership or admin role
export const deletePost=async (req, res) => {
  try {
    const { post } = req; // Post object is already fetched and attached by checkPostOwnershipOrAdmin
    if (post.mainImageUrl) {
      deleteLocalFile(post.mainImageUrl);
    }
    await Post.findByIdAndDelete(req.params.id); // Or post.remove() if you've already found it
    res.status(200).json({ message: 'Post deleted successfully.' });
  } catch (error) {
    console.error('Error deleting post:', error);
    res.status(500).json({ message: 'Server error deleting post.' });
  }
};

// --- ADMIN-SPECIFIC ROUTES (Requires 'admin' role) ---

export const getAdminPost=async (req, res) => {
  try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        const totalPosts = await Post.countDocuments();
        const posts = await Post.find()
          .populate("author", "username")
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(limit);;
        // res.json(posts);
        res.json({
          posts,
          totalPages: Math.ceil(totalPosts / limit),
          totalPosts,
        });
    } catch (error) {
        console.error('Error fetching all posts for admin:', error);
        res.status(500).json({ message: 'Server error fetching posts for admin.' });
    }
};



export const checkPostOwnershipOrAdmin = async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ message: "Post not found." });
    }
    // If user is admin OR (user is not admin AND is the author of the post)
    if (
      req.user.role === "admin" ||
      post.author.toString() === req.user._id.toString()
    ) {
      req.post = post; // Attach post to request for further use
      next();
    } else {
      res
        .status(403)
        .json({
          message: "Forbidden: You are not authorized to perform this action.",
        });
    }
  } catch (error) {
    console.error("Error checking post ownership:", error);
    if (error.kind === "ObjectId") {
      return res.status(400).json({ message: "Invalid Post ID format." });
    }
    res.status(500).json({ message: "Server error checking ownership." });
  }
};

export const handleContactForm = async (req, res) => {
  const { name, email, subject, message } = req.body;

  if (!name || !email || !subject || !message) {
    return res.status(400).json({ message: "All fields are required." });
  }

  // Initialize Brevo
  const defaultClient = SibApiV3Sdk.ApiClient.instance;
  const apiKey = defaultClient.authentications["api-key"];
  apiKey.apiKey = process.env.BREVO_API_KEY;

  const apiInstance = new SibApiV3Sdk.TransactionalEmailsApi();

  const sendEmail = {
    sender: {
      name: "Herald Sphere Contact System",
      email: process.env.SENDER_EMAIL,
    },
    to: [{ email: process.env.SENDER_EMAIL }], // Send TO yourself
    replyTo: { email: email, name: name }, // So you can click "Reply" in your email
    subject: `[CONTACT FORM] ${subject}`,
    htmlContent: `
      <div style="font-family: sans-serif; padding: 20px; border: 1px solid #eee;">
        <h2 style="color: #4f46e5;">New Message from Herald Sphere</h2>
        <p><strong>From:</strong> ${name} (${email})</p>
        <p><strong>Subject:</strong> ${subject}</p>
        <hr/>
        <p style="white-space: pre-wrap;">${message}</p>
      </div>
    `,
  };

  try {
    await apiInstance.sendTransacEmail(sendEmail);
    res.status(200).json({ message: "Transmission received successfully." });
  } catch (error) {
    console.error("Brevo Contact Error:", error);
    res
      .status(500)
      .json({ message: "Failed to send message. Please try again later." });
  }
};

export const getSubscriberCount = async (req, res) => {
  try {
    const count = await Subscriber.countDocuments();
    res.json({ totalSubscribers: count });
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch subscriber count" });
  }
};

// 1. Handle Likes (Increment/Decrement)
export const handleLike = async (req, res) => {
  const { id } = req.params;
  const { action } = req.body; // 'like' or 'unlike'

  try {
    const amount = action === 'like' ? 1 : -1;
    const updatedPost = await Post.findByIdAndUpdate(
      id,
      { $inc: { likes: amount } }, // MongoDB atomic increment
      { new: true }
    );
    res.json({ likes: updatedPost.likes });
  } catch (error) {
    res.status(500).json({ message: "Error updating likes" });
  }
};

// 2. Get All Comments for a Post
export const getComments = async (req, res) => {
  try {
    const { id } = req.params;

    // If frontend sends "undefined" as a string, return empty instead of crashing
    if (!id || id === "undefined" || id.length < 24) {
      return res.json([]);
    }
    const comments = await Comment.find({ postId: req.params.id }).sort({ createdAt: -1 });
    res.json(comments);
  } catch (error) {
    res.status(500).json({ message: "Error fetching comments" });
  }
};

// 3. Create a New Comment
export const createComment = async (req, res) => {
  const { name, email, website, comment, parentId } = req.body;
  const { id } = req.params;

  if (!name || !email || !comment) {
    return res.status(400).json({ message: "Required fields missing." });
  }

  try {
    const newComment = new Comment({
      postId: id,
      parentId: parentId || null,
      name,
      email,
      website,
      comment,
    });
    await newComment.save();
    res.status(201).json(newComment);
  } catch (error) {
    res.status(500).json({ message: "Error posting comment" });
  }
};

export const getSitemap = async (req, res) => {
  try {
    const posts = await Post.find({}).select("slug updatedAt");
    const baseUrl = "https://heraldsphere.com"; // Change to your live domain later

    // Start the XML string
    let xml = `<?xml version="1.0" encoding="UTF-8"?>`;
    xml += `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`;

    // Add Static Pages
    const staticPages = ["/", "/posts", "/about", "/contact"];
    staticPages.forEach((page) => {
      xml += `<url><loc>${baseUrl}${page}</loc><changefreq>daily</changefreq></url>`;
    });

    // Add Dynamic Blog Posts
    posts.forEach((post) => {
      xml += `
        <url>
          <loc>${baseUrl}/posts/${post.slug}</loc>
          <lastmod>${post.updatedAt.toISOString()}</lastmod>
          <changefreq>weekly</changefreq>
        </url>`;
    });

    xml += `</urlset>`;

    // Set header to XML so the browser/Google reads it correctly
    res.header("Content-Type", "application/xml");
    res.send(xml);
  } catch (error) {
    res.status(500).end();
  }
};

export const migrateSlugs = async (req, res) => {
  console.log("Migration started...");
  try {
    // 1. Find all posts missing a slug
    const posts = await Post.find({
      $or: [{ slug: { $exists: false } }, { slug: "" }, { slug: null }],
    });

    console.log(`Found ${posts.length} posts to update.`);

    let updatedCount = 0;
    let errorCount = 0;

    for (let post of posts) {
      try {
        // Create a base slug
        let newSlug = slugify(post.title || "untitled", {
          lower: true,
          strict: true,
        });

        // Add a small random string to ensure uniqueness (prevents 500 crash on duplicate titles)
        const randomID = Math.random().toString(36).substring(7);
        post.slug = `${newSlug}-${randomID}`;

        await post.save();
        updatedCount++;
      } catch (err) {
        console.error(`Failed to update post ${post._id}:`, err.message);
        errorCount++;
      }
    }

    res.json({
      message: "Migration completed",
      successCount: updatedCount,
      failCount: errorCount,
    });
  } catch (error) {
    console.error("Critical Migration Error:", error);
    res.status(500).json({ error: error.message });
  }
};

const postController = {
  getAllPosts,
  getPostBySlug,
  createPost,
  updatePost,
  getPostByUser,
  deletePost,
  getAdminPost,
  handleContactForm,
  getSubscriberCount,
  handleLike,
  getComments,
  createComment,
  getSitemap,
  migrateSlugs

};

export default postController;