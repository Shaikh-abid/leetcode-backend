import jwt from "jsonwebtoken";
import User from "../modals/UserModal.js";

const protect = async (req, res, next) => {
  let token;

  // 1. Prioritize Cookie (Secure HTTP-Only)
  if (req.cookies.refreshToken) {
    token = req.cookies.refreshToken;
  } 
  // 2. Backup: Check Header (for testing tools like Postman)
  else if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  }

  // If no token found
  if (!token) {
    return res.status(401).json({ message: "Not authorized, no token" });
  }

  try {
    // 3. Verify Token
    const decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET);

    // 4. Find User (Handle both 'id' AND 'userId' to fix the mismatch bug)
    req.user = await User.findById(decoded.userId || decoded.id).select("-password");

    // 5. SAFETY CHECK: Did we actually find a user?
    if (!req.user) {
        // Token was valid signature, but User ID inside it is wrong/deleted.
        res.clearCookie("refreshToken");
        return res.status(401).json({ message: "Not authorized, user not found" });
    }

    next();
  } catch (error) {
    console.error("Auth Middleware Error:", error.message);
    res.status(401).json({ message: "Not authorized, token failed" });
  }
};

export default protect;