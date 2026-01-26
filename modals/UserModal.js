import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    username: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    password: { type: String }, // Optional because Google Auth users won't have one
    googleId: { type: String }, // For Google OAuth
    avatar: {
      type: String,
      default: "https://cdn-icons-png.flaticon.com/512/149/149071.png",
    },

    // Gamification & Stats
    solvedProblems: [{ type: mongoose.Schema.Types.ObjectId, ref: "Problem" }], // Array of unique Problem IDs solved
    isAdmin: { type: Boolean, default: false }, // To add problems later
    city: { type: String, default: "" },
    country: { type: String, default: "" },
    bio: { type: String, default: "", maxlength: 500 },
    skills: [{ type: String, trim: true }], // array of strings
  },
  { timestamps: true }
);

const User = mongoose.model("User", userSchema);

export default User;
