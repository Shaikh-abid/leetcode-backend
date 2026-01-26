import express from "express";
import {
  createPlaylist,
  getUserPlaylists,
  addProblemToPlaylist,
  removeProblemFromPlaylist,
  deletePlaylist,
} from "../controller/playlistController.js";
import protect from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/create-playlist", protect, createPlaylist);
router.get("/get-playlists", protect, getUserPlaylists); // Get all my playlists
router.post("/add-problem", protect, addProblemToPlaylist);
router.post("/remove-problem", protect, removeProblemFromPlaylist);
router.delete("/delete-playlist", protect, deletePlaylist);

export default router;
