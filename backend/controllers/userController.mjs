import User from "../models/User.mjs";
import bcrypt from "bcrypt";

export const getAllUsers = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const totalUsers = await User.countDocuments();
    const users = await User.find().select("-password").skip(skip).limit(limit); // Exclude passwords
    // res.json(users);
    res.json({
      users,
      totalPages: Math.ceil(totalUsers / limit),
      totalUsers,
    });
  } catch (error) {
    console.error("Error fetching all users:", error);
    res.status(500).json({ message: "Server error fetching users." });
  }
};

export const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("-password");
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }
    res.json(user);
  } catch (error) {
    console.error("Error fetching single user:", error);
    if (error.kind === "ObjectId") {
      return res.status(400).json({ message: "Invalid User ID format." });
    }
    res.status(500).json({ message: "Server error fetching user." });
  }
};

export const updateUser = async (req, res) => {
  try {
    const { username, email, firstName, lastName, bio, role, password } =
      req.body;
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }
    user.username = username ?? user.username;
    user.email = email ?? user.email;
    user.firstName = firstName ?? user.firstName;
    user.lastName = lastName ?? user.lastName;
    user.role = role ?? user.role;
    // user.username = username || user.username;
    // user.email = email || user.email; // Assuming you have an email field
    // user.role = role || user.role;
    if (bio !== undefined) {
      user.bio = bio;
    }
    if (req.file) {
      // user.profilePic = `/uploads/profile_pics/${req.file.path}`;
      user.profilePic = req.file.path; // Cloudinary URL
    }
    // if (password) {
    //   // Hash new password if provided
    //   const salt = await bcrypt.genSalt(10);
    //   user.password = await bcrypt.hash(password, salt);
    // }
    if (password && password.trim() !== "") {
      // NOTE: do NOT hash here — your userSchema.pre("save") hook already hashes.
      user.password = password;
    }

    await user.save();
    // Return updated user without password
    const updatedUser = user.toObject();
    delete updatedUser.password;
    res.json(updatedUser);
  } catch (error) {
    console.error("Error updating user:", error);
    if (error.code === 11000) {
      // Duplicate key error
      return res
        .status(409)
        .json({ message: "Credential already exists" });
    }
    if (error.name === "ValidationError") {
      return res
        .status(400)
        .json({ message: error.message, errors: error.errors });
    }
    res.status(500).json({ message: "Server error updating user." });
  }
};

export const deleteUser = async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }
    res.status(200).json({ message: "User deleted successfully." });
  } catch (error) {
    console.error("Error deleting user:", error);
    res.status(500).json({ message: "Server error deleting user." });
  }
};

export const toggleBookmark = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    const index = user.bookmarks.indexOf(req.params.postId);

    if (index > -1)
      user.bookmarks.splice(index, 1); // Remove
    else user.bookmarks.push(req.params.postId); // Add

    await user.save();
    res.json({ bookmarks: user.bookmarks });
  } catch (err) {
    res.status(500).json(err);
  }
};


const userController = {
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
  toggleBookmark,
};

export default userController;