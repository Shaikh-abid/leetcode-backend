import express from "express";
import {
  register,
  login,
  googleAuthCallback,
  logout,
  updateProfile,
} from "../controller/authController.js";
import passport from "passport";
import protect from "../middleware/authMiddleware.js";

const router = express.Router();

// Local Auth
router.post("/register", register);
router.post("/login", login);
router.post("/logout", logout);

router.put("/update-profile", protect, updateProfile);
// router.post("/create-playlist", protect, createPlaylist);

// Google Auth Routes
// 1. Redirect user to Google
router.get(
  "/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

// 2. Google Auth Callback
router.get(
  "/google/callback",
  passport.authenticate("google", {
    session: false,
    failureRedirect: "/login",
  }),
  googleAuthCallback
);

export default router;
