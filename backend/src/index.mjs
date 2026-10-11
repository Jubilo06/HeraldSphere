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
import { v2 as cloudinary } from "cloudinary";
import { CloudinaryStorage } from "multer-storage-cloudinary";
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
  .connect(process.env.MONGO_URL, {
    maxPoolSize: 50, // Maintain up to 50 socket connections
    serverSelectionTimeoutMS: 5000, // Timeout after 5 seconds instead of 30
    socketTimeoutMS: 45000,
  })
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

app.use(express.json({ limit: "25mb" }));
app.use(express.urlencoded({ limit: "25mb", extended: true }));
app.use(cookieParser());

configurePassport(passport);

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});
const uploadDir = path.join(__dirname, "uploads");

const profilePicUploadDir = path.join(uploadDir, "profile_pics");
const postImageUploadDir = path.join(uploadDir, "post_images");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}
if (!fs.existsSync(profilePicUploadDir)) fs.mkdirSync(profilePicUploadDir);
if (!fs.existsSync(postImageUploadDir)) fs.mkdirSync(postImageUploadDir);

// 2. Setup Storage for Post Images
const postImageStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'post_images',
    format: async (req, file) => 'webp', // Force WebP conversion
    public_id: (req, file) => `post-${Date.now()}`,
    transformation: [{ quality: 'auto', fetch_format: 'auto' }] // Auto optimize quality
  },
});


// 1. Setup Storage for Profile Pictures
const profilePicStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'profile_pics',
    format: async (req, file) => 'webp', // Force WebP conversion
    public_id: (req, file) => `profile-${Date.now()}`,
    transformation: [{ width: 400, height: 400, crop: 'fill', gravity: 'face' }] // Auto-crop to face for profile pics
  },
});



// Initialize Multer instances
export const uploadProfilePic = multer({
  storage: profilePicStorage,
  limits: { fileSize: 20 * 1024 * 1024 },
});
const uploadPostImage = multer({ storage: postImageStorage, limits: { fileSize: 20 * 1024 * 1024 }});

app.use("/uploads", express.static(uploadDir));


app.post(
  "/api/upload-image",
  authenticateJWT,
  uploadPostImage.single("image"),
  (req, res) => {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded." });
    }

    // Cloudinary provides the optimized WebP URL here:
    res.status(200).json({
      message: "Image uploaded successfully!",
      imageUrl: req.file.path, // This is now a https://res.cloudinary.com/... URL
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

app.use((err, req, res, next) => {
  console.error("--- BACKEND ERROR LOG ---");
  
  // Handle Multer specifically
  if (err instanceof multer.MulterError) {
    console.error(`Multer Error: ${err.message}`);
    return res.status(400).json({ 
      message: err.code === 'LIMIT_FILE_SIZE' 
        ? "The image file is too large. Please upload an image under 20MB." 
        : `Upload Error: ${err.message}` 
    });
  }

  if (err) {
    console.error('Message:', err.message);
    return res.status(500).json({ message: "Server Error", error: err.message });
  }

  next();
});

const PORT = process.env.PORT || 5014;

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

export default app;
