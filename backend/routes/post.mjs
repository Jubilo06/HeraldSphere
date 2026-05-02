import express from 'express'
import postController from '../controllers/postController.mjs'
import {checkPostOwnershipOrAdmin} from "../controllers/postController.mjs";
import {authenticateJWT} from "../controllers/authController.mjs";
import authorizeRole from "../middlewares/authorizeRole.mjs";
const router = express.Router();


router.get("/my-posts", authenticateJWT, postController.getPostByUser);
// GET all posts
router.get('/', postController.getAllPosts);


router.post("/contact", postController.handleContactForm);

// GET a single post by ID
router.get('/:id', postController.getPostById);

// CREATE a new post
router.post("/", authenticateJWT, postController.createPost);

// UPDATE a post by ID
router.put(
  "/:id",
  authenticateJWT,
  checkPostOwnershipOrAdmin,
  postController.updatePost,
);


router.get(
  "/admin/all",
  authenticateJWT,
  authorizeRole("admin"),
  postController.getAdminPost
);

router.get(
  "/admin/subscribers/count",
  authenticateJWT,
  authorizeRole("admin"),
  postController.getSubscriberCount,
);
// DELETE a post by ID
router.delete('/:id', authenticateJWT,
  checkPostOwnershipOrAdmin, postController.deletePost);



export default router;

