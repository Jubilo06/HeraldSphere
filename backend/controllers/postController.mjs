import Post from "../models/Post.mjs";



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
    // const posts = await Post.find().populate('author', 'username').sort({ createdAt: -1 });
    // res.json(posts);
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
    // console.error('Error fetching all posts:', error);
    // res.status(500).json({ message: 'Server error fetching posts.' });
    console.error("Error fetching paginated posts:", error); // More specific error log
    res.status(500).json({ message: error.message });
  }
};


// Get a single post by ID
export const getPostById =async (req, res) => {
  try {
    const post = await Post.findById(req.params.id).populate('author', 'username firstName lastName profilePic');
    if (!post) {
      return res.status(404).json({ message: 'Post not found.' });
    }
    res.json(post);
  } catch (error) {
    console.error('Error fetching single post:', error);
    if (error.kind === 'ObjectId') {
      return res.status(400).json({ message: 'Invalid Post ID format.' });
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
      return res.status(400).json({ message: 'Title, content, and category are required.' });
    }

    const newPost = new Post({
      title,
      content,
      category,
      author: req.user._id,
      mainImageUrl,
      // IMPORTANT: Set author from the authenticated user's ID
      // If you had a 'mainImage' field, it would be handled here based on `req.file` from multer
      // e.g., imageUrl: req.file ? `/uploads/${req.file.filename}` : undefined
    });

    await newPost.save();
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

    // Update fields if provided
    post.title = title || post.title;
    post.content = content || post.content;
    post.category = category || post.category;
    if (mainImageUrl !== undefined) {
      // Check if it's explicitly sent in the body
      post.mainImageUrl = mainImageUrl;
    }
    // IMPORTANT: Do NOT allow changing `post.author` via this PUT endpoint
    // It should only be updatable by an admin through a dedicated admin function if ever.

    // Handle updating a potential 'mainImage' if you had one via multer
    // if (req.file) { /* ... delete old file, set new file ... */ }
    // if (req.body.removeMainImage) { post.imageUrl = null; } // If frontend sends flag to remove main image

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

    // Optional: Delete associated image files from server storage
    // if (post.imageUrl) {
    //   const imagePath = path.join(__dirname, '..', '..', 'uploads', path.basename(post.imageUrl));
    //   if (fs.existsSync(imagePath)) {
    //     fs.unlinkSync(imagePath);
    //   }
    // }
    // If you need to parse content and find all embedded Quill images to delete them,
    // that's a more complex task involving HTML parsing.

    await Post.findByIdAndDelete(req.params.id); // Or post.remove() if you've already found it
    res.status(200).json({ message: 'Post deleted successfully.' });
  } catch (error) {
    console.error('Error deleting post:', error);
    res.status(500).json({ message: 'Server error deleting post.' });
  }
};

// --- ADMIN-SPECIFIC ROUTES (Requires 'admin' role) ---

// Get all posts for admin view (might include drafts, unapproved, etc., if your model supports it)
// This is redundant with router.get('/') currently, but could be extended later
// For now, if /admin/posts should show *all* posts, keep router.get('/') public
// or make this specific for admin-only features.
export const getAdminPost=async (req, res) => {
    try {
        const posts = await Post.find().populate('author', 'username').sort({ createdAt: -1 });
        res.json(posts);
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

const postController = {
  getAllPosts,
  getPostById,
  createPost,
  updatePost,
  getPostByUser,
  deletePost,
  getAdminPost
};

export default postController;