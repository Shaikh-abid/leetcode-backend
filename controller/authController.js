import User from "../modals/UserModal.js";

import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

// --- Helper: Generate Tokens ---
const generateTokens = (userId) => {
  const accessToken = jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: "15m",
  });
  const refreshToken = jwt.sign(
    { id: userId },
    process.env.JWT_REFRESH_SECRET,
    { expiresIn: "7d" }
  );
  return { accessToken, refreshToken };
};

// --- Register ---
const register = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    // Check if user exists
    if (await User.findOne({ email }))
      return res.status(400).json({ message: "Email already exists" });

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create user
    const user = await User.create({
      username,
      email,
      password: hashedPassword,
    });

    return res
      .status(201)
      .json({ success: true, message: "User registered successfully", user });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// --- Login ---
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // 1. Find user
    const user = await User.findOne({ email });
    if (!user)
      return res
        .status(400)
        .json({ success: false, message: "Invalid credentials" });

    // 2. Check password (only if user has one)
    if (!user.password)
      return res
        .status(400)
        .json({ success: false, message: "Please login with Google" });
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return res
        .status(400)
        .json({ success: false, message: "Invalid credentials" });

    // 3. Generate tokens
    const { accessToken, refreshToken } = generateTokens(user._id);

    // 4. Set Refresh Token in HTTP-Only Cookie (Secure!)
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production", // Only send over HTTPS in production
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    return res.json({
      success: true,
      message: "Login successful",
      accessToken,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        avatar: user.avatar,
        isAdmin: user.isAdmin,
        solvedProblems: user.solvedProblems,
        createdAt: user.createdAt,
        bio: user.bio,
        city: user.city,
        country: user.country,
        skills: user.skills,
      },
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// --- Google Callback Handler ---
const googleAuthCallback = (req, res) => {
  // Passport puts the user in req.user
  const { accessToken, refreshToken } = generateTokens(req.user._id);

  // Set cookie
  res.cookie("refreshToken", refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });

  // 👇 UPDATE THIS PART
  // We pass user info in the URL so the frontend can save it immediately
  const userData = JSON.stringify({
    id: req.user._id,
    username: req.user.username,
    email: req.user.email,
    avatar: req.user.avatar,
    isAdmin: req.user.isAdmin,
    solvedProblems: req.user.solvedProblems,
    createdAt: req.user.createdAt,
    bio: req.user.bio,
    city: req.user.city,
    country: req.user.country,
    skills: req.user.skills,
  });

  // Redirect to frontend with Access Token (or just redirect and let frontend fetch profile)
  // NOTE: Sending token in URL is slightly risky, better to redirect to a "loading" page that fetches /me
  return res.redirect(
    `${
      process.env.CLIENT_URL
    }/auth-success?token=${accessToken}&user=${encodeURIComponent(userData)}`
  );
};

// --- Logout ---
const logout = (req, res) => {
  res.clearCookie("refreshToken");
  return res.json({ success: true, message: "Logged out successfully" });
};

// user profile section controller
const updateProfile = async (req, res) => {
  try {
    const { city, country, bio, skills } = req.body;
    const user = req.user; // from protect middleware

    // Only update fields that are provided (partial update)
    const updates = {};

    if (city !== undefined) updates.city = city;
    if (country !== undefined) updates.country = country;
    if (bio !== undefined) updates.bio = bio;

    // Skills should be an array of strings
    if (Array.isArray(skills)) {
      updates.skills = skills.filter(
        (skill) => typeof skill === "string" && skill.trim()
      );
    }

    // If no updates were provided, just return success (or you can return 400 if you want)
    if (Object.keys(updates).length === 0) {
      return res.status(400).json({
        success: false,
        message: "No valid fields provided to update",
      });
    }

    // Update user document
    const updatedUser = await User.findByIdAndUpdate(
      user._id,
      { $set: updates },
      { new: true, runValidators: true } // return updated doc + validate
    ).select("-password -__v"); // don't send sensitive fields

    if (!updatedUser) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      user: {
        name: updatedUser.name,
        username: updatedUser.username,
        city: updatedUser.city,
        country: updatedUser.country,
        bio: updatedUser.bio,
        skills: updatedUser.skills,
        solvedProblems: updatedUser.solvedProblems,
        createdAt: req.user.createdAt,
        isAdmin: updatedUser.isAdmin,
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Server error while updating profile",
      error: error.message,
    });
  }
};

export { register, login, googleAuthCallback, logout, updateProfile };
