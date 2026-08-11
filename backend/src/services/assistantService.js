const { GoogleGenAI } = require("@google/genai");
const Knowledge = require("../models/Knowledge");

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    apiVersion: "v1",
  },
});

// =====================================================
// STOP WORDS
// =====================================================

const stopWords = new Set([
  "what",
  "where",
  "when",
  "who",
  "why",
  "how",
  "is",
  "are",
  "the",
  "a",
  "an",
  "does",
  "do",
  "did",
  "can",
  "could",
  "would",
  "will",
  "there",
  "have",
  "has",
  "for",
  "of",
  "to",
  "in",
  "on",
  "at",
  "and",
  "or",
  "my",
  "me",
  "i",
  "we",
  "you",
  "please",
  "tell",
  "about",
]);

// =====================================================
// TEXT NORMALIZATION
// =====================================================

const normalizeText = (text) => {
  return String(text || "")
    .toLowerCase()
    .replace(/[^\w\s-]/g, " ")
    .split(/\s+/)
    .map((word) => word.trim())
    .filter(Boolean);
};

// =====================================================
// EXTRACT SEARCH TERMS
// =====================================================

const getSearchTerms = (text) => {
  return [
    ...new Set(
      normalizeText(text).filter(
        (word) =>
          word.length >= 3 &&
          !stopWords.has(word)
      )
    ),
  ];
};

// =====================================================
// CALCULATE KNOWLEDGE RELEVANCE
// =====================================================

const calculateRelevance = (
  item,
  searchTerms
) => {
  const titleWords = new Set(
    normalizeText(item.title)
  );

  const questionWords = new Set(
    normalizeText(item.question)
  );

  const answerWords = new Set(
    normalizeText(item.answer)
  );

  const keywordWords = new Set(
    (item.keywords || []).flatMap(
      (keyword) => normalizeText(keyword)
    )
  );

  const categoryWords = new Set(
    normalizeText(item.category)
  );

  let score = 0;

  for (const term of searchTerms) {
    if (titleWords.has(term)) {
      score += 10;
    }

    if (questionWords.has(term)) {
      score += 8;
    }

    if (keywordWords.has(term)) {
      score += 7;
    }

    if (categoryWords.has(term)) {
      score += 5;
    }

    if (answerWords.has(term)) {
      score += 2;
    }
  }

  const searchPhrase =
    searchTerms.join(" ");

  const titleText = String(
    item.title || ""
  ).toLowerCase();

  const questionText = String(
    item.question || ""
  ).toLowerCase();

  if (
    searchPhrase &&
    titleText.includes(searchPhrase)
  ) {
    score += 15;
  }

  if (
    searchPhrase &&
    questionText.includes(searchPhrase)
  ) {
    score += 12;
  }

  return score;
};

// =====================================================
// BUILD SOURCES
// =====================================================

const buildSources = (knowledge) => {
  return knowledge.map((item) => ({
    id: item._id,
    title: item.title,
    category: item.category,
    sourceTitle: item.sourceTitle,
    sourceUrl: item.sourceUrl,
    lastVerified: item.lastVerified,
  }));
};

// =====================================================
// FALLBACK RESPONSE
// =====================================================

const buildFallbackResponse = (
  knowledge,
  searchText
) => {
  /*
   * Gemini is optional here.
   *
   * If Gemini is unavailable because of:
   * - quota
   * - rate limit
   * - temporary API error
   *
   * we still return the verified answer
   * from MongoDB.
   */

  const bestKnowledge =
    knowledge[0];

  if (!bestKnowledge) {
    return {
      message:
        "I couldn't find that information in the verified Vijayawada campus knowledge base.",
      sources: [],
    };
  }

  const answer =
    String(bestKnowledge.answer || "").trim();

  if (!answer) {
    return {
      message:
        "I found a relevant campus record, but it does not contain an answer for this question yet.",
      sources: buildSources(
        knowledge
      ),
    };
  }

  return {
    message:
      `${answer}\n\n` +
      "This answer is provided directly from the verified campus knowledge base.",
    sources: buildSources(
      knowledge
    ),
  };
};

// =====================================================
// CHAT WITH ASSISTANT
// =====================================================

const chatWithAssistant = async (
  message,
  user
) => {
  const searchText =
    String(message || "").trim();

  // ===================================================
  // SEARCH TERMS
  // ===================================================

  const searchTerms =
    getSearchTerms(searchText);

  // ===================================================
  // BASE FILTER
  // ===================================================

  const baseFilter = {
    campus: "VIJAYAWADA",
  };

  // Students can only access published
  // knowledge.
  //
  // Admins can also access unpublished
  // knowledge.
  if (user.role !== "ADMIN") {
    baseFilter.isPublished = true;
  }

  // ===================================================
  // DATABASE SEARCH
  // ===================================================

  if (searchTerms.length > 0) {
    baseFilter.$or =
      searchTerms.flatMap((term) => [
        {
          title: {
            $regex: term,
            $options: "i",
          },
        },
        {
          question: {
            $regex: term,
            $options: "i",
          },
        },
        {
          answer: {
            $regex: term,
            $options: "i",
          },
        },
        {
          keywords: {
            $regex: term,
            $options: "i",
          },
        },
        {
          category: {
            $regex: term,
            $options: "i",
          },
        },
      ]);
  }

  let knowledge =
    await Knowledge.find(baseFilter)
      .sort({
        lastVerified: -1,
        updatedAt: -1,
      })
      .limit(20);

  // ===================================================
  // RELEVANCE SCORING
  // ===================================================

  knowledge = knowledge
    .map((item) => ({
      item,
      score: calculateRelevance(
        item,
        searchTerms
      ),
    }))
    .filter(
      (entry) => entry.score > 0
    )
    .sort((a, b) => {
      if (b.score !== a.score) {
        return b.score - a.score;
      }

      return (
        new Date(
          b.item.lastVerified
        ) -
        new Date(
          a.item.lastVerified
        )
      );
    })
    .slice(0, 5)
    .map((entry) => entry.item);

  // ===================================================
  // NO RELEVANT KNOWLEDGE
  // ===================================================

  if (!knowledge.length) {
    return {
      message:
        "I couldn't find that information in the verified Vijayawada campus knowledge base.",
      sources: [],
    };
  }

  // ===================================================
  // VERIFIED CONTEXT
  // ===================================================

  const context = knowledge
    .map(
      (item, index) =>
        `Knowledge ${index + 1}
Title: ${item.title}
Question: ${item.question}
Answer: ${item.answer}
Category: ${item.category}
Department: ${item.department}
Campus: ${item.campus}
Source: ${item.sourceTitle}
Source URL: ${item.sourceUrl}
Last verified: ${item.lastVerified}`
    )
    .join("\n\n");

  // ===================================================
  // AI INSTRUCTIONS
  // ===================================================

  const systemInstruction =
    "You are the AI Campus Assistant for KL University Vijayawada campus. " +
    "Answer ONLY using the provided verified campus knowledge. " +
    "Use the most relevant knowledge item when answering. " +
    "Never invent campus information, fees, timings, rules, contacts, routes, " +
    "or other university details. " +
    "If the provided knowledge does not contain the answer, clearly say that " +
    "the information is not available in the campus knowledge base. " +
    "Do not use general world knowledge to answer unrelated questions. " +
    "Keep answers clear, concise and helpful.";

  const input = `
Verified Vijayawada campus knowledge:

${context}

Student question:

${searchText}
`;

  // ===================================================
  // GEMINI
  // ===================================================

  try {
    const interaction =
      await ai.interactions.create({
        model: "gemini-3.6-flash",
        system_instruction:
          systemInstruction,
        input,
        store: false,
      });

    const aiMessage =
      String(
        interaction.output_text || ""
      ).trim();

    if (aiMessage) {
      return {
        message: aiMessage,
        sources:
          buildSources(knowledge),
      };
    }

    // Gemini returned no text.
    // Use verified DB answer.
    console.warn(
      "Gemini returned an empty response. Using knowledge fallback."
    );

    return buildFallbackResponse(
      knowledge,
      searchText
    );
  } catch (error) {
    // =================================================
    // GEMINI ERROR
    // =================================================

    console.error(
      "Gemini request failed. Using verified knowledge fallback.",
      {
        status:
          error?.status ||
          error?.statusCode,
        code: error?.code,
        message: error?.message,
      }
    );

    /*
     * IMPORTANT:
     *
     * We intentionally DO NOT throw the error here.
     *
     * The verified MongoDB answer remains available
     * even if Gemini is unavailable.
     */

    return buildFallbackResponse(
      knowledge,
      searchText
    );
  }
};

module.exports = {
  chatWithAssistant,
};