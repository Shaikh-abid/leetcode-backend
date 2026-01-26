import mongoose from "mongoose";

const playlistSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    title: {
      type: String,
      required: [true, "Please add a playlist title"],
      trim: true,
    },
    description: {
      type: String,
      default: "",
    },
    // We store an array of Problem IDs
    problems: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Problem",
      },
    ],
  },
  {
    timestamps: true, // Automatically manages createdAt and updatedAt
  }
);

const Playlist = mongoose.model("Playlist", playlistSchema);

export default Playlist;
