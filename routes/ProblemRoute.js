import express from "express";
import {
  createProblem,
  getProblemBySlug,
  getProblems,
} from "../controller/problemController.js";

const router = express.Router();

// Define Routes
router.post("/", createProblem); // POST /api/problems
router.get("/", getProblems); // GET /api/problems
router.get("/getProblemBySlug", getProblemBySlug); // GET /api/problems/two-sum

export default router;
