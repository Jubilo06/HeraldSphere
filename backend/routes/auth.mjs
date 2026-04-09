import express from "express";
import {
  login,
  register,
  protectedRoute,
  authenticateJWT,
} from "../controllers/authController.mjs"; // Adjust path
import userController from "../controllers/userController.mjs";
import authorizeRole from "../middlewares/authorizeRole.mjs";
import User from '../models/User.mjs'
import Post from "../models/Post.mjs";


const router = express.Router();


router.post("/register", register);
router.post("/login", login);

// --- Admin User Management Routes ---
router.get('/admin/users', authenticateJWT, authorizeRole('admin'), userController.getAllUsers);
router.get('/admin/users/:id', authenticateJWT, authorizeRole('admin'), userController.getUserById);
router.put('/admin/users/:id', authenticateJWT, authorizeRole('admin'), userController.updateUser);
router.delete('/admin/users/:id', authenticateJWT, authorizeRole('admin'), userController.deleteUser);

// Get current user's profile
router.get("/profile", authenticateJWT, (req, res) => {
  // Using authenticateJWT middleware
  // req.user is set by authenticateJWT
  res.json({
    _id: req.user._id,
    username: req.user.username,
    role: req.user.role,
    createdAt: req.user.createdAt,
    updatedAt: req.user.updatedAt,
  });
});

// Update current user's profile
router.put("/profile", authenticateJWT, async (req, res) => {
  try {
    const userId = req.user._id; // Get user ID from authenticated request
    const { username, password } = req.body; // Allow updating username, password

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    if (username) user.username = username;
    if (password) {
      // Password hashing happens automatically via pre-save hook
      user.password = password;
    }

    await user.save();
    res.json({ message: "Profile updated successfully!", user });
  } catch (error) {
    console.error("Error updating user profile:", error);
    res.status(500).json({ message: "Server error while updating profile." });
  }
});

// Delete current user's account
router.delete("/profile", authenticateJWT, async (req, res) => {
  try {
    const userId = req.user._id;

    // Delete associated posts first (if any)
    await Post.deleteMany({ author: userId }); // Assuming 'author' field in Post model refers to User ID

    // Then delete the user
    await User.findByIdAndDelete(userId);

    res.status(200).json({ message: "Account and associated data deleted successfully." });
  } catch (error) {
    console.error("Error deleting user account:", error);
    res.status(500).json({ message: "Server error while deleting account." });
  }
});
// Or directly use the method from controller
router.get("/secure-data", protectedRoute);
router.get("/protected-data", authenticateJWT, (req, res) => {
  res.json({
    message: `This is protected data for ${req.user.username} with role ${req.user.role}`,
    user: req.user,
  });
});

export default router;
