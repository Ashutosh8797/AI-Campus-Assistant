const { GoogleGenAI } = require("@google/genai");
const Knowledge = require("../models/Knowledge");

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    apiVersion: "v1",
  },
});

const chatWithAssistant = async (message, user) => {
  const filter = {
    isPublished: true,
  };

  if (user.role === "ADMIN") {
    delete filter.isPublished;
  }

  const knowledge = await Knowledge.find(filter).limit(10);

  if (!knowledge.length) {
    return {
      message:
        "I couldn't find that information in the campus knowledge base.",
      sources: [],
    };
  }

  const context = knowledge
    .map(
      (item) =>
        `Title: ${item.title}\nQuestion: ${item.question}\nAnswer: ${item.answer}\nCategory: ${item.category}\nDepartment: ${item.department}`
    )
    .join("\n\n");

  const systemInstruction =
    "You are an AI Campus Assistant. Answer ONLY using the campus knowledge provided. Never invent campus information. If the answer is not contained in the knowledge, say you do not have that information. Keep answers clear and concise.";

  const input = `
Campus knowledge:

${context}

Student question:

${message}
`;

  const interaction = await ai.interactions.create({
    model: "gemini-3.6-flash",
    system_instruction: systemInstruction,
    input: input,
    store: false,
  });

  return {
    message: interaction.output_text,
    sources: knowledge.map((item) => ({
      id: item._id,
      title: item.title,
      category: item.category,
    })),
  };
};

module.exports = {
  chatWithAssistant,
};