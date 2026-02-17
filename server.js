import dotenv from "dotenv";
dotenv.config();
import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import passport from "./config/passport.js";
import "passport-google-oauth20";
import connectDB from "./config/db.js";
import ProblemRoutes from "./routes/ProblemRoute.js";
import AuthRoutes from "./routes/AuthRoutes.js";
import SubmissionRoutes from "./routes/SubmissionRoutes.js";
import PlaylistRoutes from "./routes/PlaylistRoutes.js";
import AiRoutes from "./routes/AiRoutes.js";

connectDB();

const PORT = process.env.PORT || 5000;
const app = express();
// 👇 ADD THIS LINE
app.set("trust proxy", 1);
app.use(
  cors({
    origin: process.env.CLIENT_URL, // e.g., 'http://localhost:8080'
    credentials: true, // Allow sending cookies from frontend
  }),
);
app.use(passport.initialize());
app.use(express.json());
app.use(cookieParser());

app.use("/api/auth", AuthRoutes);
app.use("/api/problems", ProblemRoutes);
app.use("/api/submissions", SubmissionRoutes);
app.use("/api/playlists", PlaylistRoutes);
app.use("/api/ai", AiRoutes);

app.get("/", (_, res) => {
  res.send("Hello World!");
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
