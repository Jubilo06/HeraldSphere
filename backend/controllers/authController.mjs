import jwt from "jsonwebtoken";
import passport from "passport"; // Import passport
import bcrypt from "bcrypt";
import User from "../models/User.mjs";
import crypto from "crypto";
import SibApiV3Sdk from "sib-api-v3-sdk";

// This function should be in a utility file or defined here if only used once
const generateToken = (id, username, role) => {
  return jwt.sign({ id, username, role }, process.env.JWT_SECRET, {
    expiresIn: "7d", // Token valid for 7 days
  });
};

// --- REGISTER USER ---
export const register = async (req, res) => {
  try {
    const {
      username,
      email,
      firstName,
      lastName,
      password,
      role = "writer",
    } = req.body;
    console.log("Multer req.file object in authController:", req.file);
    const profilePicPath = req.file
      ? `/uploads/profile_pics/${req.file.filename}`
      : "";
    console.log("--- Register User Debug ---");
    console.log("req.body.role:", req.body.role);
    console.log("Type of req.body.role:", typeof req.body.role);
    console.log("Is req.body.role an Array:", Array.isArray(req.body.role));
    console.log("Value being used for user.role:", role || "writer");
    console.log("--- End Debug ---");
    // Basic validation
    if (!username || !password) {
      return res
        .status(400)
        .json({ message: "Username and password are required." });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ $or: [{ username }, { email }] });
    if (existingUser) {
      return res.status(409).json({ message: "Username already exists." }); // 409 Conflict for duplicates
    }

    // Create new user (password hashing happens in pre-save hook)
    const newUser = new User({
      username,
      email,
      firstName,
      lastName,
      password,
      profilePic: profilePicPath,
      role: role,
    });
    console.log(newUser.profilePic);
    console.log("Calculated profilePicPath:", profilePicPath);
    console.log("newUser.profilePic AFTER save:", newUser.profilePic);
    await newUser.save();

    // Optionally log in the user immediately after registration
    const token = generateToken(newUser._id, newUser.username, newUser.role);

    // --- ATTACH COOKIE HERE ---
    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production", // Only HTTPS in production
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    res.status(201).json({
      message: "User registered successfully!",
      user: {
        _id: newUser._id,
        username: newUser.username,
        email: newUser.email,
        firstName: newUser.firstName,
        lastName: newUser.lastName,
        profilePic: newUser.profilePic,
        role: newUser.role,
      },
      token: token, // Send token back for immediate login
    });
  } catch (error) {
    console.error("Registration error:", error);
    // More specific error handling for Mongoose validation or duplicate key errors
    if (error.name === "ValidationError") {
      return res
        .status(400)
        .json({ message: error.message, errors: error.errors });
    }
    if (error.code === 11000) {
      // MongoDB duplicate key error code
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
      email: user.email, // <--- MUST BE INCLUDED
      firstName: user.firstName, // <--- MUST BE INCLUDED
      lastName: user.lastName, // <--- MUST BE INCLUDED
      profilePic: user.profilePic, // <--- MUST BE INCLUDED
      role: user.role,
      token: token,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
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

export const forgotPassword = async (req, res) => {
  const { email } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user)
      return res.status(404).json({ message: "No account with that email." });

    // 1. Create a random token
    const resetToken = crypto.randomBytes(32).toString("hex");

    // 2. Hash it and save to user (add these fields to your User Schema first!)
    user.resetPasswordToken = crypto
      .createHash("sha256")
      .update(resetToken)
      .digest("hex");
    user.resetPasswordExpires = Date.now() + 3600000; // 1 hour
    await user.save();

    // 3. Configure Brevo
    const defaultClient = SibApiV3Sdk.ApiClient.instance;
    const apiKey = defaultClient.authentications["api-key"];
    apiKey.apiKey = process.env.BREVO_API_KEY;

    const apiInstance = new SibApiV3Sdk.TransactionalEmailsApi();

    // 3. Send Email via Brevo
    const resetUrl = `http://localhost:5173/reset-password/${resetToken}`;
    // 4. Create the branded Email
    const sendEmail = {
      sender: {
        name: "Herald Sphere Security",
        email: process.env.SENDER_EMAIL,
      },
      to: [{ email: user.email }],
      subject: "Action Required: Reset Your Herald Sphere Password",
      htmlContent: `
        <div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; max-width: 600px; margin: auto; border: 1px solid #eee; border-radius: 20px; overflow: hidden;">
          <div style="background-color: #0f172a; padding: 30px; text-align: center;">
            <h1 style="color: white; margin: 0; letter-spacing: 2px; font-size: 24px;">HERALD SPHERE</h1>
          </div>
          <div style="padding: 40px; background-color: #ffffff;">
            <h2 style="color: #1e293b; margin-top: 0;">Password Reset Request</h2>
            <p style="color: #64748b; line-height: 1.6;">You (or someone pretending to be you) requested a password reset for your contributor account. If this wasn't you, please ignore this email.</p>
            <div style="text-align: center; margin: 40px 0;">
              <a href="${resetUrl}" style="background-color: #4f46e5; color: white; padding: 15px 30px; text-decoration: none; border-radius: 10px; font-weight: bold; font-size: 14px; letter-spacing: 1px;">RESET MY PASSWORD</a>
            </div>
            <p style="color: #94a3b8; font-size: 12px; border-top: 1px solid #f1f5f9; pt: 20px;">This link will expire in 60 minutes for your security. <br/> If the button doesn't work, copy and paste this URL: <br/> ${resetUrl}</p>
          </div>
          <div style="background-color: #f8fafc; padding: 20px; text-align: center;">
            <p style="color: #cbd5e1; font-size: 10px; text-transform: uppercase; letter-spacing: 2px;">Global Dispatch • Internal Security</p>
          </div>
        </div>
      `,
    };

    await apiInstance.sendTransacEmail(sendEmail);
     res
       .status(200)
       .json({
         message: "A secure reset link has been dispatched to your email.",
       });
  } catch (error) {
    res.status(500).json({ message: "Error sending email." });
  }
};
export const resetPassword = async (req, res) => {
  const { token } = req.params;
  const { password } = req.body;

  try {
    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");
    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpires: { $gt: Date.now() }, // Must be in the future
    });

    if (!user) {
      return res.status(400).json({
        message:
          "The security token is invalid or has expired. Please request a new link.",
      });
    }


    user.password = password; // Pre-save hook will hash this!
    user.resetPasswordToken = undefined; // Clear the token
    user.resetPasswordExpires = undefined;
    await user.save();

     res.status(200).json({
       message:
         "Credentials updated successfully. You may now sign in with your new password.",
     });
  } catch (error) {
    res.status(500).json({ message: "Server error." });
  }
};