import mongoose from "mongoose";

const problemSchema = new mongoose.Schema(
  {
    // --- Basic Details ---
    title: {
      type: String,
      required: true,
      unique: true, // Titles should be unique
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      index: true, // For fast URL lookups (e.g., /problems/two-sum)
    },
    description: {
      type: String,
      required: true,
    },
    difficulty: {
      type: String,
      enum: ["easy", "medium", "hard"],
      required: true,
    },
    constraints: {
      type: String,
    },

    // --- Metadata & Categorization ---
    tags: [{ type: String }], // e.g. ["Array", "Two Pointers"]
    companies: [{ type: String }], // e.g. ["Google", "Amazon"]

    // --- Hints ---
    hints: [{ type: String }], // Store just the text array

    // --- Code Execution ---
    // The frontend sends an object: { javascript: "...", python: "..." }
    // We will store it as a Map to easily add new languages later without changing schema
    starterCode: {
      type: Map,
      of: String, // Key: "javascript", Value: "function..."
    },

    // NOTE: This is NOT in your UI, but required for the execution engine.
    driverCode: {
      type: Map,
      of: String,
    },

    testCases: [
      {
        input: { type: String, required: true },
        output: { type: String, required: true },
        explanation: { type: String }, // Optional validation explanation
      },
    ],

    // --- Optimal Solution ---
    solution: {
      code: { type: String }, // The code provided in the solution tab
      explanation: { type: String }, // The text walkthrough
      timeComplexity: { type: String }, // "O(n)"
      spaceComplexity: { type: String }, // "O(1)"
    },

    // --- Settings ---
    settings: {
      timeLimit: { type: Number, default: 1000 }, // ms
      memoryLimit: { type: Number, default: 256 }, // MB
      source: { type: String }, // "LeetCode", "Original"
    },

    // --- Meta ---
    likes: { type: Number, default: 0 },
    dislikes: { type: Number, default: 0 },
  },
  { timestamps: true }
);

// Middleware to auto-create 'slug' from 'title' before saving
// Example: "Two Sum" -> "two-sum"
// problemSchema.pre("save", function (next) {
//   if (this.isModified("title")) {
//     this.slug = this.title.toLowerCase().split(" ").join("-");
//   }
//   next();
// });

const Problem = mongoose.model("Problem", problemSchema);

export default Problem;
