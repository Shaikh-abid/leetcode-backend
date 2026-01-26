import User from "../modals/UserModal.js";
import Playlist from "../modals/PlaylistModal.js";

// @desc Create a new playlist
// @route POST /api/playlists
// @access Private
const createPlaylist = async (req, res) => {
  try {
    const { title, description } = req.body;

    // 1. Validation
    if (!title) {
      return res.status(400).json({
        success: false,
        message: "Playlist title is required",
      });
    }

    // 2. Create the playlist
    const newPlaylist = await Playlist.create({
      userId: req.user._id, // Gets ID from auth middleware
      title,
      description,
      problems: [], // Start empty
    });

    return res.status(201).json({
      success: true,
      data: newPlaylist,
    });
  } catch (error) {
    console.error("Create Playlist Error:", error.message);
    return res.status(500).json({
      success: false,
      message: "Server error while creating playlist",
      error: error.message,
    });
  }
};

// @desc Get user's playlists
// @route GET /api/playlists
// @access Private
const getUserPlaylists = async (req, res) => {
  try {
    // Find playlists where userId matches the logged-in user
    // .populate("problems") will replace IDs with actual problem details (title, difficulty, etc.)
    const playlists = await Playlist.find({ userId: req.user._id })
      .populate("problems", "title difficulty slug") // Only fetch specific fields
      .sort({ createdAt: -1 }); // Newest first

    return res.status(200).json({
      success: true,
      data: playlists,
    });
  } catch (error) {
    console.error("Get Playlists Error:", error.message);
    return res.status(500).json({
      success: false,
      message: "Server error while fetching playlists",
      error: error.message,
    });
  }
};

// @desc    Add a problem to a playlist
// @route   POST /api/playlists/:id/add-problem
// @access  Private
const addProblemToPlaylist = async (req, res) => {
  try {
    const { playlistId, problemId } = req.body;

    const playlist = await Playlist.findOne({
      _id: playlistId,
      userId: req.user._id, // Ensure user owns this playlist
    });

    if (!playlist) {
      return res
        .status(404)
        .json({ success: false, message: "Playlist not found" });
    }

    // Check if problem already exists in array to prevent duplicates
    if (playlist.problems.includes(problemId)) {
      return res
        .status(400)
        .json({ success: false, message: "Problem already in playlist" });
    }

    // Add problem ID to array
    playlist.problems.push(problemId);
    await playlist.save();

    return res.status(200).json({
      success: true,
      message: "Problem added to playlist",
      data: playlist,
    });
  } catch (error) {
    console.error("Add Problem Error:", error.message);
    return res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

// @desc    Remove a problem from a playlist
// @route   POST /api/playlists/:id/remove-problem
// @access  Private
const removeProblemFromPlaylist = async (req, res) => {
  try {
    const { playlistId, problemId } = req.body;

    const playlist = await Playlist.findOne({
      _id: playlistId,
      userId: req.user._id,
    });

    if (!playlist) {
      return res.status(404).json({
        success: false,
        message: "Playlist not found",
      });
    }

    // Filter out the problem ID
    playlist.problems = playlist.problems.filter(
      (id) => id.toString() !== problemId
    );
    await playlist.save();

    return res.status(200).json({
      success: true,
      message: "Problem removed from playlist",
      data: playlist,
    });
  } catch (error) {
    console.error("Remove Problem Error:", error.message);
    return res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

// @desc    Delete a playlist
// @route   DELETE /api/playlists/:id
// @access  Private
const deletePlaylist = async (req, res) => {
  try {
    const playlist = await Playlist.findOneAndDelete({
      _id: req.query.id,
      userId: req.user._id,
    });

    if (!playlist) {
      return res.status(404).json({
        success: false,
        message: "Playlist not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Playlist deleted",
      id: req.query.id,
    });
  } catch (error) {
    console.error("Delete Playlist Error:", error.message);
    return res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

export {
  createPlaylist,
  getUserPlaylists,
  addProblemToPlaylist,
  removeProblemFromPlaylist,
  deletePlaylist,
};
