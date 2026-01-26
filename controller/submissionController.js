import axios from "axios";
import Problem from "../modals/ProblemModal.js";
import User from "../modals/UserModal.js";
import Submission from "../modals/SubmissionModal.js";

const PISTON_API = "https://emkc.org/api/v2/piston/execute";

const LANGUAGE_MAP = {
  javascript: { language: "javascript", version: "18.15.0" },
  python: { language: "python", version: "3.10.0" },
  cpp: { language: "cpp", version: "10.2.0" },
  java: { language: "java", version: "15.0.2" },
};

// --- HELPER 1: Parse Java Imports ---
const parseJava = (source) => {
  const lines = source.split("\n");
  const imports = lines.filter((line) => line.trim().startsWith("import"));
  const body = lines
    .filter((line) => !line.trim().startsWith("import"))
    .join("\n");
  return { imports, body };
};

// --- HELPER 2: Formatting Utils for C++/Java ---
const formatCppInput = (arg) => {
  if (Array.isArray(arg)) {
    const elements = arg.map(formatCppInput).join(", ");
    return `{${elements}}`;
  }
  if (typeof arg === "string") {
    return `"${arg}"`;
  }
  return arg;
};

const formatJavaInput = (arg) => {
  if (Array.isArray(arg)) {
    const elements = arg.map(formatJavaInput).join(", ");
    return `{${elements}}`;
  }
  if (typeof arg === "string") {
    return `"${arg}"`;
  }
  return arg;
};

// --- HELPER 3: Core Execution Logic ---
const executeHelper = async (language, code, problem) => {
  const driverCodeTemplate = problem.driverCode.get
    ? problem.driverCode.get(language)
    : problem.driverCode[language];

  if (!driverCodeTemplate) {
    throw new Error(`Language ${language} not supported`);
  }

  let injectedCode = "";

  // 1. GENERIC INPUT PARSING (Same as before)
  const inputsForInjection = problem.testCases.map((tc, index) => {
    const cleanInput = tc.input.trim();
    // Wrap single lines that look like arrays in brackets if needed, or just parse
    // For consistency with the linked list examples: "[1,2,3]" -> parses to [1,2,3]
    // But our controller expects an array of arguments.
    // If input is "[1,2,3]", we want [[1,2,3]] as the args list.
    const jsonString = `[${cleanInput}]`;
    try {
      return JSON.parse(jsonString);
    } catch (err) {
      throw new Error(`Invalid Input Format in DB for Case ${index + 1}`);
    }
  });

  // 2. CODE INJECTION
  if (language === "javascript") {
    injectedCode = `
      ${code}
      const inputs = ${JSON.stringify(inputsForInjection)};
      ${driverCodeTemplate}
    `;
  } else if (language === "python") {
    // UPDATED PYTHON LOGIC
    const pythonInputs = JSON.stringify(inputsForInjection);

    // Check if driver has placeholder. If yes, inject user code into it.
    if (driverCodeTemplate.includes("##USER_CODE##")) {
      injectedCode = `
import json
${
  driverCodeTemplate
    .replace("##USER_CODE##", code)
    .replace("##INPUTS##", `'${pythonInputs}'`) // Pass as string, parse inside driver
}
      `;
    } else {
      // Fallback
      injectedCode = `
import json
${code}
inputs = json.loads('${pythonInputs}')
${driverCodeTemplate}
      `;
    }
  } else if (language === "cpp") {
    // ... (Keep existing C++ Logic) ...
    const formattedCases = inputsForInjection
      .map((args) => {
        const formattedArgs = args.map(formatCppInput).join(", ");
        return `{${formattedArgs}}`;
      })
      .join(", ");

    if (driverCodeTemplate.includes("##USER_CODE##")) {
      injectedCode = driverCodeTemplate
        .replace("##USER_CODE##", code)
        .replace("##INPUTS##", `{${formattedCases}}`);
    } else {
      injectedCode = `${code}\n${driverCodeTemplate.replace("##INPUTS##", `{${formattedCases}}`)}`;
    }
  } else if (language === "java") {
    // 1. Parse Imports
    const driverParts = parseJava(driverCodeTemplate);
    const userParts = parseJava(code);
    const allImports = [
      ...new Set([...driverParts.imports, ...userParts.imports]),
    ].join("\n");

    // 2. Format Inputs
    const formattedCases = inputsForInjection
      .map((args) => {
        const formattedArgs = args.map(formatJavaInput).join(", ");
        return `{${formattedArgs}}`;
      })
      .join(", ");

    // 3. Construct Code
    // If the driver has ##USER_CODE##, we inject there.
    // Otherwise we append user code at the end.
    if (driverParts.body.includes("##USER_CODE##")) {
      injectedCode = `
${allImports}
${driverParts.body
  .replace("##USER_CODE##", userParts.body)
  .replace("##INPUTS##", `{${formattedCases}}`)}
       `;
    } else {
      // Fallback
      injectedCode = `
${allImports}
${driverParts.body.replace("##INPUTS##", `{${formattedCases}}`)}
${userParts.body}
       `;
    }
  }

  // ... (Keep the rest of your Piston execution logic exactly the same)
  // 3. EXECUTE WITH PISTON...
  const pistonConfig = LANGUAGE_MAP[language];
  const filesPayload =
    language === "java"
      ? [{ name: "Main.java", content: injectedCode }] // <--- IMPORTANT: Must be Main.java
      : [{ content: injectedCode }];

  try {
    const response = await axios.post(PISTON_API, {
      language: pistonConfig.language,
      version: pistonConfig.version,
      files: filesPayload,
    });
    // ... rest of the function ...
    const { run } = response.data;
    if (run.stderr) {
      return { success: false, error: run.stderr };
    }

    const userOutputs = run.stdout.trim().split("\n");
    const results = problem.testCases.map((tc, index) => {
      const userOut = userOutputs[index]
        ? userOutputs[index].trim()
        : "No Output";
      const cleanUserOut = userOut.replace(/\s/g, "");
      // Handle undefined output safely
      const cleanExpected = tc.output ? tc.output.replace(/\s/g, "") : "";
      return {
        caseId: index + 1,
        input: tc.input,
        expected: tc.output,
        actual: userOut,
        passed: cleanUserOut === cleanExpected,
      };
    });
    const allPassed = results.every((r) => r.passed);
    return { success: true, allPassed, results };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// --- CONTROLLER FUNCTIONS ---

// @desc    Run Code (Test only, no DB save)
// @route   POST /api/submissions/run
const runCode = async (req, res) => {
  try {
    const { language, code, slug } = req.body;
    console.log(`🚀 Executing ${slug} in ${language}`);

    const problem = await Problem.findOne({ slug });
    if (!problem)
      return res
        .status(404)
        .json({ success: false, message: "Problem not found" });

    // Use Helper
    const result = await executeHelper(language, code, problem);

    // FIX: result can't be undefined now because executeHelper always returns an object
    if (!result.success) {
      return res.status(200).json({
        success: false,
        message: "Runtime Error",
        error: result.error,
      });
    }

    res.status(200).json({
      success: true,
      status: result.allPassed ? "Accepted" : "Wrong Answer",
      results: result.results,
    });
  } catch (error) {
    console.error("Execution Error:", error.message);
    res.status(500).json({
      success: false,
      message: "Execution failed",
      error: error.message,
    });
  }
};

// @desc    Submit Code (Run + Save to DB)
// @route   POST /api/submissions/submit
const submitCode = async (req, res) => {
  try {
    const { language, code, slug } = req.body;
    const userId = req.user._id;

    const problem = await Problem.findOne({ slug });
    if (!problem)
      return res
        .status(404)
        .json({ success: false, message: "Problem not found" });

    // 1. Re-run execution logic using Helper
    const result = await executeHelper(language, code, problem);

    let status = "Runtime Error";
    let finalResults = [];
    let finalError = null;

    if (result.success) {
      status = result.allPassed ? "Accepted" : "Wrong Answer";
      finalResults = result.results;
    } else {
      finalError = result.error;
    }

    // 2. Create Submission Record
    const newSubmission = await Submission.create({
      problemId: problem._id,
      userId,
      code,
      language,
      status,
    });

    // 3. If Accepted, update User Profile
    if (status === "Accepted") {
      await User.findByIdAndUpdate(userId, {
        $addToSet: { solvedProblems: problem._id },
      });
    }

    res.status(200).json({
      success: true,
      status,
      submissionId: newSubmission._id,
      results: finalResults,
      error: finalError,
    });
  } catch (error) {
    console.error("Submission Error:", error.message);
    res.status(500).json({
      success: false,
      message: "Submission failed",
      error: error.message,
    });
  }
};

// @desc    Get user submissions
// @route   GET /api/submissions/:slug
const getUserSubmissions = async (req, res) => {
  try {
    const { slug } = req.query;
    const userId = req.user._id;

    const problem = await Problem.findOne({ slug });
    if (!problem) {
      return res
        .status(404)
        .json({ success: false, message: "Problem not found" });
    }

    const submissions = await Submission.find({
      problemId: problem._id,
      userId: userId,
    })
      .sort({ createdAt: -1 })
      .select("status language code createdAt");

    res.status(200).json({
      success: true,
      data: submissions,
    });
  } catch (error) {
    console.error("Get Submissions Error:", error.message);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

export { runCode, submitCode, getUserSubmissions };
