import express from "express";
import cookieParser from "cookie-parser";
import mongoose from "mongoose";
import passport from "passport";
import configurePassport from "../strategy/passport.mjs";
import dotenv from "dotenv";
import cors from "cors";
import bcrypt from "bcrypt";
import authRoutes from "../routes/auth.mjs";
import postRoutes from "../routes/post.mjs";
import contactRoutes from "../routes/contact.mjs";
import multer from 'multer';
import fs from 'fs'; // Node.js built-in file system module
import path from "path";
import { fileURLToPath } from "url";
import { authenticateJWT } from "../controllers/authController.mjs";
import createAuthRouter from '../routes/auth.mjs'


const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);


dotenv.config();
const app = express();
// initializePassport(passport); 
app.use(passport.initialize());
mongoose
  .connect(process.env.MONGO_URL)
  .then(() => console.log("connected to Mongo atlas"))
  .catch((err) => console.log(`Error:${err}`));

app.use(
  cors({
    origin: true,
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "HEAD"],
    allowedHeaders: [
      "Content-Type",
      "Authorization",
      "Cookie",
      "X-Requested-With",
    ],
    exposedHeaders: ["Set-Cookie"],
  }),
);

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ limit: "10mb", extended: true }));
app.use(cookieParser());

configurePassport(passport);


const uploadDir = path.join(__dirname, "uploads");

const profilePicUploadDir = path.join(uploadDir, "profile_pics");
const postImageUploadDir = path.join(uploadDir, "post_images");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}
if (!fs.existsSync(profilePicUploadDir)) fs.mkdirSync(profilePicUploadDir);
if (!fs.existsSync(postImageUploadDir)) fs.mkdirSync(postImageUploadDir);
const postImageStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, postImageUploadDir); // Store post images here
  },
  filename: (req, file, cb) => {
    cb(null, `post-${Date.now()}-${file.originalname}`);
  },
});

const uploadPostImage = multer({
  storage: postImageStorage,
  limits: { fileSize: 1024 * 1024 * 10 }, // e.g., 10MB limit for post images
  fileFilter: (req, file, cb) => {
    const filetypes = /jpeg|jpg|png|gif/;
    const extname = filetypes.test(
      path.extname(file.originalname).toLowerCase(),
    );
    const mimetype = filetypes.test(file.mimetype);
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error("Only image files are allowed!"), false);
    }
  },
});

const profilePicStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, profilePicUploadDir); // Store profile pictures here
  },
  filename: (req, file, cb) => {
    cb(null, `profile-${Date.now()}-${file.originalname}`);
  },
});

export const uploadProfilePic = multer({
  storage: profilePicStorage,
  limits: { fileSize: 1024 * 1024 * 5 }, // e.g., 5MB limit for profile pics
  fileFilter: (req, file, cb) => {
    const filetypes = /jpeg|jpg|png|gif/;
    const extname = filetypes.test(
      path.extname(file.originalname).toLowerCase(),
    );
    const mimetype = filetypes.test(file.mimetype);
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error("Only image files are allowed!"), false);
    }
  },
});

// app.use("/uploads", express.static(uploadDir));
app.use("/uploads", express.static(uploadDir));
app.post(
  "/api/upload-image", // This is for post images, consider renaming to /api/upload-post-image
  authenticateJWT,
  uploadPostImage.single("image"), // Use the post image specific uploader
  (req, res) => {
     console.log("Upload route reached. User:", req.user);
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded." });
    }
    const imageUrl = `http://localhost:5014/uploads/post_images/${req.file.filename}`; // Path reflects new subfolder
    res.status(200).json({
      message: "Image uploaded successfully!",
      imageUrl: imageUrl,
    });
  },
);

app.use("/api/auth", createAuthRouter(uploadProfilePic));

// Serve static files from the 'uploads' directory


app.get("/", (req, res) => {
  console.log("Root path hit!");
  res.send("Welcome to the API!");
});
// Mount your consolidated auth routes under /api/auth
app.use('/api/auth', authRoutes);
// Mount your post routes under /api/posts
app.use('/api/posts', postRoutes);
// If you have a separate userRoute.mjs for admin functions, mount it here
// app.use('/api/users', userRoutes);
app.use('/api/contact', contactRoutes)

app.get("/api/protected", authenticateJWT, (req, res) => {
  res.json({
    message: `This is protected data for ${req.user.username} with role ${req.user.role}`,
    user: req.user,
  });
});

// --- Error Handling Middleware (Optional but recommended) ---
app.use((err, req, res, next) => {
  console.error('Unhandled Server Error:', err.stack);
  if (err instanceof multer.MulterError) {
    return res
      .status(400)
      .json({ message: `Multer Upload Error: ${err.message}` });
  }
  res.status(500).json({ message: 'Something broke!', error: err.message });
});

const PORT = process.env.PORT || 5014;

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

export default app;
