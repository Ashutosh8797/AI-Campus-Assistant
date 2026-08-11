const { chatWithAssistant } = require("../services/assistantService");

const chatAssistant = async (req, res) => {
  try {
    const { message } = req.body;

    if (!message || !message.trim()) {
      return res.status(400).json({
        success: false,
        message: "Message is required",
      });
    }

    const result = await chatWithAssistant(message, req.user);

    res.status(200).json({
      success: true,
      message: result.message,
      sources: result.sources,
    });
  } catch (error) {
    console.error("Assistant error:", error);

    res.status(500).json({
      success: false,
      message: "Server error while processing your question",
    });
  }
};

module.exports = {
  chatAssistant,
};