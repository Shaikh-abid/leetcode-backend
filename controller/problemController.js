import Problem from "../modals/ProblemModal.js";

// @desc    Create a new problem
// @access  Private (Admin only ideally, but User for now)

const createProblem = async (req, res) => {
  try {
    const {
      title,
      description,
      difficulty,
      tags,
      companies,
      hints,
      starterCode,
      driverCode,
      testCases,
      constraints,
      solution,
      settings,
    } = req.body;

    // 1. Manually Generate Slug
    // We do this here to satisfy the 'required' validator
    const slug = title
      .toLowerCase()
      .split(" ")
      .join("-")
      .replace(/[^\w-]/g, "");

    // 2. Check if problem exists
    const problemExists = await Problem.findOne({ slug });
    if (problemExists) {
      return res.status(400).json({
        success: false,
        message: "Problem with this title already exists",
      });
    }

    // 3. Fix Test Cases (Rename 'expectedOutput' -> 'output')
    // The frontend sends "expectedOutput", but Schema wants "output"
    const formattedTestCases = testCases.map((tc) => ({
      input: tc.input,
      output: tc.expectedOutput, // <--- FIX IS HERE
      explanation: tc.explanation,
    }));

    // 4. Create the Problem
    const problem = await Problem.create({
      title,
      slug, // <--- Pass the generated slug here
      description,
      difficulty,
      constraints,
      tags,
      companies,
      hints,
      starterCode,
      driverCode,
      testCases: formattedTestCases, // <--- Pass the fixed test cases
      solution,
      settings,
    });

    return res.status(201).json({
      success: true,
      data: problem,
    });
  } catch (error) {
    console.error("Error creating problem:", error);
    // Better error message handling
    return res.status(500).json({
      success: false,
      message: "Server Error",
      error: error.message,
    });
  }
};

// @desc    Get all problems (For your list page later)
const getProblems = async (req, res) => {
  try {
    const problems = await Problem.find().select("title difficulty tags slug"); // Select only needed fields for list
    return res.status(200).json(problems);
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Server Error",
      error: error.message,
    });
  }
};

// @desc    Get single problem by Slug (For the Solve page)
const getProblemBySlug = async (req, res) => {
  try {
    const problem = await Problem.findOne({ slug: req.query.slug });
    if (!problem)
      return res.status(404).json({
        success: false,
        message: "Problem not found",
      });

    // SECURITY NOTE: In a real app, you might want to hide 'driverCode' and 'testCases'
    // from the response so users can't cheat by inspecting network tab!
    // But for now, we send it all.
    return res.status(200).json({
      success: true,
      data: problem,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Server Error",
      error: error.message,
    });
  }
};

export { createProblem, getProblems, getProblemBySlug };
