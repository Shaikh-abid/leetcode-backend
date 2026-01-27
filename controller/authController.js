import User from "../modals/UserModal.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

// --- Helper: Generate Tokens ---
const generateTokens = (userId) => {
  // We use "userId" as the standard key now
  const accessToken = jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: "15m",
  });
  const refreshToken = jwt.sign({ userId }, process.env.JWT_REFRESH_SECRET, {
    expiresIn: "7d",
  });
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
    if (!user) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid credentials" });
    }

    // 2. Check password
    // If user has no password (e.g., Google Auth only), block password login
    if (!user.password) {
      return res.status(400).json({
        success: false,
        message:
          "This account uses Google Login. Please use Google to sign in.",
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid credentials" });
    }

    // 3. Generate tokens
    const { accessToken, refreshToken } = generateTokens(user._id);

    // 4. Set Refresh Token in HTTP-Only Cookie
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      // 👇 CRITICAL for Render deployment
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    // 5. Send Response
    return res.json({
      success: true,
      message: "Login successful",
      accessToken,
      user: {
        _id: user._id, // Send _id to match frontend expectations
        username: user.username,
        email: user.email,
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
    console.error("Login Error:", err);
    return res.status(500).json({ success: false, message: err.message });
  }
};


// --- Logout ---
const logout = (req, res) => {
  res.clearCookie("refreshToken", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
  });
  return res.json({ success: true, message: "Logged out successfully" });
};

// --- Update Profile ---
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
        (skill) => typeof skill === "string" && skill.trim(),
      );
    }

    // If no updates were provided
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
      { new: true, runValidators: true }, // return updated doc + validate
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
      user: updatedUser, // Return the full updated user object
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Server error while updating profile",
      error: error.message,
    });
  }
};



// --- 1. Modify the Google Callback (Don't set cookie here) ---
const googleAuthCallback = (req, res) => {
  try {
    if (!req.user) {
      return res.redirect(`${process.env.CLIENT_URL}/login?error=GoogleAuthFailed`);
    }

    // Generate a temporary "Exchange Token" (Short life: 5 mins)
    // We only put the userId in here.
    const tempToken = jwt.sign(
      { userId: req.user._id }, 
      process.env.JWT_SECRET, 
      { expiresIn: "5m" }
    );

    // Redirect to frontend with the TEMP token (NOT the refresh token)
    // We don't send user data in URL anymore (it's cleaner)
    return res.redirect(
      `${process.env.CLIENT_URL}/auth-success?code=${tempToken}`
    );
  } catch (error) {
    console.error("Google Callback Error:", error);
    return res.redirect(`${process.env.CLIENT_URL}/login?error=ServerCallbackError`);
  }
};

// --- 2. Add New Function: Complete Google Login ---
const completeGoogleLogin = async (req, res) => {
  try {
    const { code } = req.body;

    if (!code) {
      return res.status(400).json({ success: false, message: "No authorization code provided" });
    }

    // Verify the temporary token
    const decoded = jwt.verify(code, process.env.JWT_SECRET);
    
    // Find the user
    const user = await User.findById(decoded.userId);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    // NOW generate the real tokens
    const { accessToken, refreshToken } = generateTokens(user._id);

    // Set the Real Cookie (This works because it's a direct Fetch request!)
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    // Return success
    return res.json({
      success: true,
      message: "Google Login Successful",
      accessToken,
      user: {
        _id: user._id,
        username: user.username,
        email: user.email,
        isAdmin: user.isAdmin,
        solvedProblems: user.solvedProblems,
        createdAt: user.createdAt,
        bio: user.bio,
        city: user.city,
        country: user.country,
        skills: user.skills,
      },
    });

  } catch (error) {
    console.error("Complete Google Login Error:", error.message);
    return res.status(401).json({ success: false, message: "Invalid or expired login code" });
  }
};

export { register, login, googleAuthCallback, logout, updateProfile, completeGoogleLogin };
