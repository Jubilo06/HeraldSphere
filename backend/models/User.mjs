import mongoose from "mongoose";
import bcrypt from "bcrypt";

const userSchema = new mongoose.Schema(
  {
    // You mentioned username, so we'll add it. Email is still best for uniqueness.
    username: { type: String, required: true, unique: true }, // For login
    email: { type: String, required: true, unique: true }, // Added email
    firstName: { type: String, required: true }, // New
    lastName: { type: String, required: true }, // New
    password: { type: String, required: true },
    profilePic: { type: String, default: "" }, // New: Store URL or path to the image
    role: { type: String, enum: ["writer", "admin"], default: "writer" },
    resetPasswordToken: String,
    resetPasswordExpires: Date,
  },
  { timestamps: true },
);

// This part automatically scrambles the password before saving a new user
userSchema.pre("save", async function () {
  if (!this.isModified("password")) return ;
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  ;
});

userSchema.methods.comparePassword = async function (candidatePassword) {
  try {
    console.log("--- Inside comparePassword Method ---");
    console.log("Plaintext password from form:", candidatePassword);
    console.log("Hashed password from database:", this.password);

    const isMatch = await bcrypt.compare(candidatePassword, this.password);

    console.log("Bcrypt comparison result:", isMatch); // This is the crucial log!

    return isMatch;
  } catch (error) {
    console.error("Error during bcrypt comparison:", error);
    return false;
  }
};

export default mongoose.model("User", userSchema);
