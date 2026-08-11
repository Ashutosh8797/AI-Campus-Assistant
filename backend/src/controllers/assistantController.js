const { chatWithAssistant } = require("../services/assistantService");

const chatAssistant = async (req, res) => {
  try {
    const { message } = req.body;

    // Validate message
    if (!message || !message.trim()) {
      return res.status(400).json({
        success: false,
        message: "Message is required",
      });
    }

    // Ask AI Assistant
    const result = await chatWithAssistant(
      message,
      req.user
    );

    return res.status(200).json({
      success: true,
      message: result.message,
      sources: result.sources || [],
    });

  } catch (error) {
    console.error("Assistant error:", error);

    // ==========================================
    // GEMINI QUOTA / RATE LIMIT ERROR
    // ==========================================
    if (
      error?.status === 429 ||
      error?.statusCode === 429 ||
      error?.code === "too_many_requests"
    ) {
      return res.status(429).json({
        success: false,
        message:
          "The AI Assistant is temporarily unavailable because the AI service quota has been reached. Please try again later.",
        sources: [],
      });
    }

    // ==========================================
    // OTHER AI ERRORS
    // ==========================================
    return res.status(500).json({
      success: false,
      message:
        "Server error while processing your question",
      sources: [],
    });
  }
};

module.exports = {
  chatAssistant,
};