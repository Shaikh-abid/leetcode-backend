import dotenv from "dotenv";
dotenv.config();
import jwt from "jsonwebtoken";

import User from "../modals/UserModal.js";

const protect = async (req, res, next) => {
  let token;

  // 1. Check Cookies (Priority since you aren't using LocalStorage)
  if (req.cookies.refreshToken) {
    token = req.cookies.refreshToken;
  }
  // 2. Check Authorization Header (Backup)
  if (!token) {
    return res.status(401).json({ message: "Not authorized, no token" });
  }


  try {
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET);

    // Get user from the token
    req.user = await User.findById(decoded.id).select("-password");

    next();
  } catch (error) {
    console.error("Auth Middleware Error:", error.message);
    res.status(401).json({ message: "Not authorized, token failed" });
  }
};

export default protect;
