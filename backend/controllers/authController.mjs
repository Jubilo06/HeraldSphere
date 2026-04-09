import jwt from "jsonwebtoken";
import passport from "passport"; // Import passport
import bcrypt from 'bcrypt'
import User from "../models/User.mjs";

// This function should be in a utility file or defined here if only used once
const generateToken = (id,username, role) => {
  return jwt.sign({ id, username, role }, process.env.JWT_SECRET, {
    expiresIn: "1h", // Token valid for 1 hour
  });
};

// --- REGISTER USER ---
export const register = async (req, res) => {
  try {
    const { username, password, role } = req.body;

    // Basic validation
    if (!username || !password) {
      return res.status(400).json({ message: "Username and password are required." });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.status(409).json({ message: "Username already exists." }); // 409 Conflict for duplicates
    }

    // Create new user (password hashing happens in pre-save hook)
    const newUser = new User({ username, password, role: role || 'user' });
    await newUser.save();

    // Optionally log in the user immediately after registration
    const token = generateToken(newUser._id, newUser.username, newUser.role);

    res.status(201).json({
      message: "User registered successfully!",
      user: {
        _id: newUser._id,
        username: newUser.username,
        role: newUser.role,
      },
      token: token, // Send token back for immediate login
    });

  } catch (error) {
    console.error('Registration error:', error);
    // More specific error handling for Mongoose validation or duplicate key errors
    if (error.name === 'ValidationError') {
      return res.status(400).json({ message: error.message, errors: error.errors });
    }
    if (error.code === 11000) { // MongoDB duplicate key error code
        const field = Object.keys(error.keyValue)[0];
        return res.status(409).json({ message: `${field} already exists.` });
    }
    res.status(500).json({ message: "Server error during registration." });
  }
};

export const login = (req, res, next) => {
  // Use Passport's local strategy for authentication
  passport.authenticate("local", { session: false }, (err, user, info) => {
    if (err) {
      return res
        .status(500)
        .json({ message: "Authentication error", error: err.message });
    }
    if (!user) {
      // If authentication failed (e.g., incorrect username/password)
      return res
        .status(401)
        .json({ message: info.message || "Invalid credentials" });
    }

    // If authentication is successful, generate a JWT
    const token = generateToken(user._id, user.username, user.role);

    return res.json({
      _id: user._id,
      username: user.username,
      role: user.role,
      token: token,
      message: "Logged in successfully!",
    });
  })(req, res, next); // Ensure req, res, next are passed to the middleware
};

// Example of a protected route using JWT strategy
export const protectedRoute = (req, res, next) => {
  passport.authenticate("jwt", { session: false }, (err, user, info) => {
    if (err) {
      return next(err);
    }
    if (!user) {
      return res.status(401).json({ message: "Unauthorized", info: info });
    }
    // If authenticated, user is available in req.user
    res.json({
      message: `Welcome ${req.user.username}! You have access to protected data.`,
    });
  })(req, res, next);
};

// More robust protected route middleware (recommended for multiple routes)
export const authenticateJWT = (req, res, next) => {
  console.log("Backend: authenticateJWT middleware hit.");
  console.log("Backend: Authorization header:", req.headers.authorization);
  
  passport.authenticate("jwt", { session: false }, (err, user, info) => {
    if (err) {
      console.error("Backend: Passport authentication error:", err);
      return next(err);
    }
    if (!user) {
      console.log(
        "Backend: Passport authentication failed. No user found. Sending 401.",
      );
      return res
        .status(401)
        .json({ message: info ? info.message : "Unauthorized" });
    }
    req.user = user; // Attach the authenticated user to the request
    console.log(
      "Backend: Passport authentication successful. req.user set to:",
      req.user,
    );
    next();
  })(req, res, next);
};