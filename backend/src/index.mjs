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
import multer from 'multer';
import fs from 'fs'; // Node.js built-in file system module
import path from "path";
import { fileURLToPath } from "url";
import { authenticateJWT } from "../controllers/authController.mjs";

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
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, "uploads"); // Ensure this matches your static serve path
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir);
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

const upload = multer({ storage: storage });


app.post(
  "/api/upload-image",
  authenticateJWT,
  upload.single("image"),
  (req, res) => {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded." });
    }

    // Construct the URL to access the uploaded image
    // This assumes your server is serving static files from the 'uploads' directory
    const imageUrl = `http://localhost:5014/uploads/${req.file.filename}`;

    res.status(200).json({
      message: "Image uploaded successfully!",
      imageUrl: imageUrl,
    });
  },
);

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

app.get("/api/protected", authenticateJWT, (req, res) => {
  res.json({
    message: `This is protected data for ${req.user.username} with role ${req.user.role}`,
    user: req.user,
  });
});

// --- Error Handling Middleware (Optional but recommended) ---
app.use((err, req, res, next) => {
  console.error('Unhandled Server Error:', err.stack);
  res.status(500).json({ message: 'Something broke!', error: err.message });
});

const PORT = process.env.PORT || 5014;

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

export default app;
