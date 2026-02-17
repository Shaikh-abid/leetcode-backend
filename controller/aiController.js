import dotenv from "dotenv";

dotenv.config();
import { HfInference } from "@huggingface/inference";

// Initialize Hugging Face Client
const hf = new HfInference(process.env.HF_ACCESS_TOKEN);

// We use the Qwen Coder model (Best free model for coding)
const MODEL_NAME = "Qwen/Qwen2.5-Coder-32B-Instruct";

export const generateCodeReview = async (req, res) => {
  try {
    const { code, language, prompt } = req.body;

    // 1. Validation
    if (!code) {
      return res.status(400).json({ error: "Code is required" });
    }

    console.log(`\n🤖 Analyzing ${language} code...`);
    console.log(`📝 User Prompt: "${prompt}"`);

    // 2. Construct the "System Prompt" (The Instructions for AI)
    // This tells the AI exactly how to behave.
    const systemPrompt = `
            You are an expert Senior Software Engineer and Code Reviewer.
            Your task is to analyze the provided ${language} code snippet.
            
            User's specific request: "${prompt || "Review this code for bugs, performance, and readability."}"

            Please provide a response in valid Markdown format with the following structure:
            1. 🧐 **Code Analysis**: Brief summary of what the code does.
            2. 🐛 **Issues Found**: Bullet points of bugs or bad practices (if any).
            3. 💡 **Improvements**: Suggestions for performance, security, or readability.
            4. 💻 **Corrected Code**: The fixed version of the code (use code blocks).

            Keep the tone professional, encouraging, and concise.
        `;

    // 3. Call Hugging Face API
    const response = await hf.chatCompletion({
      model: MODEL_NAME,
      messages: [
        { role: "system", content: systemPrompt },
        {
          role: "user",
          content: `Here is the code:\n\n\`\`\`${language}\n${code}\n\`\`\``,
        },
      ],
      max_tokens: 1000, // Allow enough space for the full review
      temperature: 0.7, // Balanced creativity
    });

    const review = response.choices[0].message.content;

    console.log("✅ Review generated successfully!");

    // 4. Send Response
    res.json({
      result: review,
      success: true,
      message: "Code review generated successfully!",
    });
  } catch (error) {
    console.error("❌ AI Error:", error);

    // Handle "Model Loading" specifically (Common in free tier)
    if (error.message && error.message.includes("loading")) {
      return res.status(503).json({
        success: false,
        error:
          "The AI model is currently waking up. Please try again in 30 seconds.",
      });
    }

    res.status(500).json({
      success: false,
      error: "Failed to generate review",
      details: error.message,
    });
  }
};
