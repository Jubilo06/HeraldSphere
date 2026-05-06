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
import { forgotPassword } from "../controllers/authController.mjs";
import { resetPassword } from "../controllers/authController.mjs";

const createAuthRouter = (uploadProfilePic) => {
  const router = express.Router();

      // router.post("/register", register);
    router.post("/register", uploadProfilePic.single("profilePic"), register);
    router.post("/login", login);

    router.post("/forgot-password", forgotPassword);
    router.post("/reset-password", resetPassword);


    // --- Admin User Management Routes ---
    router.get('/admin/users', authenticateJWT, authorizeRole('admin'), userController.getAllUsers);
    router.get('/admin/users/:id', authenticateJWT, authorizeRole('admin'), userController.getUserById);
    router.put(
      "/admin/users/:id",
      authenticateJWT,
      authorizeRole("admin"),
      uploadProfilePic.single("profilePic"),
      userController.updateUser,
    );
    router.delete('/admin/users/:id', authenticateJWT, authorizeRole('admin'), userController.deleteUser);

    // Get current user's profile
    router.get("/profile", authenticateJWT, (req, res) => {
      // Using authenticateJWT middleware
      // req.user is set by authenticateJWT
      res.json({
        _id: req.user._id,
        username: req.user.username,
        email: req.user.email, // Added email
        firstName: req.user.firstName, // Added firstName
        lastName: req.user.lastName, // Added lastName
        profilePic: req.user.profilePic, // Added profilePic
        role: req.user.role,
        createdAt: req.user.createdAt,
        updatedAt: req.user.updatedAt,
      });
    });

    // Update current user's profile
    router.put(
      "/profile",
      authenticateJWT,
      uploadProfilePic.single("profilePic"),
      async (req, res) => {
        try {
          const userId = req.user._id; // Get user ID from authenticated request
          const { username, password, email, firstName, lastName } = req.body; // Allow updating username, password
          console.log("--- Profile Pic Upload Debug ---");
          console.log("req.file:", req.file); // Is Multer receiving the file?
          if (req.file) {
            console.log("req.file.filename:", req.file.filename);
            console.log("req.file.path:", req.file.path);
          }
          const profilePicPath = req.file
            ? `/uploads/profile_pics/${req.file.filename}`
            : undefined; // New profile pic, if uploaded
          console.log("Calculated profilePicPath:", profilePicPath);


          const user = await User.findById(userId);
          if (!user) {
            return res.status(404).json({ message: "User not found." });
          }

          if (username) user.username = username;
          if (email) user.email = email;
          if (firstName) user.firstName = firstName;
          if (lastName) user.lastName = lastName;
          if (password) {
            // Password hashing happens automatically via pre-save hook
            user.password = password;
          }
          if (profilePicPath !== undefined) {
            // Only update if a new file was uploaded or explicitly cleared
            if (user.profilePic && user.profilePic !== profilePicPath) {
              // Check if new pic is different
              const oldFilePath = path.join(__dirname, "..", user.profilePic);
              if (fs.existsSync(oldFilePath)) {
                fs.unlinkSync(oldFilePath);
                console.log(`Deleted old profile pic: ${oldFilePath}`);
              }
            }
            user.profilePic = profilePicPath;
          }
          console.log("User object before save, profilePic:", user.profilePic);
          await user.save();
          res.json({
            message: "Profile updated successfully!",
            user: {
              _id: user._id,
              username: user.username,
              email: user.email,
              firstName: user.firstName,
              lastName: user.lastName,
              profilePic: user.profilePic,
              role: user.role,
              createdAt: user.createdAt,
              updatedAt: user.updatedAt,
            },
          });
        } catch (error) {
          console.error("Error updating user profile:", error);
          res.status(500).json({ message: "Server error while updating profile." });
        }
      },
    );

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
  

return router;
};

export default createAuthRouter;