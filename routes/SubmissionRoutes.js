import express from "express";
import {
  runCode,
  submitCode,
  getUserSubmissions,
} from "../controller/submissionController.js";
import protect from "../middleware/authMiddleware.js";

const router = express.Router();

// POST /api/submissions/run
router.post("/run", runCode);
router.post("/submit", protect, submitCode); // Submit (Save)
router.get("/user-submissions", protect, getUserSubmissions);

export default router;
