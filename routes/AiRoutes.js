import express from "express";
import { generateCodeReview } from "../controller/aiController.js";

const router = express.Router();

// Define the POST route
// The full URL will be: http://localhost:3000/api/ai/review
router.post("/review", generateCodeReview);

export default router;
