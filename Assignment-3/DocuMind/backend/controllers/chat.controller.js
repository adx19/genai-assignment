const groq = require("../utils/groq");

const { generateEmbedding } = require("../utils/embedding");
const { cosineSimilarity } = require("../utils/similarity");
const { vectorStore } = require("../store/vectorStore");

const chatWithDocument = async (req, res) => {
  try {
    const { question } = req.body;

    if (!question) {
      return res.status(400).json({
        error: "Question required",
      });
    }

    // 1. Embed question
    const questionEmbedding = await generateEmbedding(question);

    // 2. Score chunks
    const scoredChunks = vectorStore.map((item) => ({
      text: item.text,
      score: cosineSimilarity(
        questionEmbedding,
        item.embedding
      ),
    }));

    // 3. Sort + pick top chunks
const topChunks = scoredChunks
  .filter((chunk) => chunk.score > 0.3)
  .sort((a, b) => b.score - a.score)
  .slice(0, 6);
    // 4. Build context
    const context = topChunks
      .map((chunk) => chunk.text)
      .join("\n\n");

    // 5. Strong RAG prompt
const prompt = `
You are DocuMind AI, an intelligent conversational assistant that helps users understand their uploaded documents.

GUIDELINES:
- Answer conversationally and naturally.
- Use the provided context as your primary knowledge source.
- Combine information from multiple context chunks when needed.
- Explain answers clearly and in detail when appropriate.
- If the user greets you (hi, hello, hey, etc.), respond warmly and briefly.
- If the answer can reasonably be inferred from the document, do so.
- For resumes/CVs, understand the document represents a person's profile.
- Avoid saying "Not found in document" unless the information is completely unrelated or missing.
- Keep responses helpful, human-like, and easy to understand.
- If context is weak, still try to provide the best grounded answer possible.

CONTEXT:
${context}

USER QUESTION:
${question}

ASSISTANT RESPONSE:
`;
    // 6. GROQ CALL (replaces Gemini)
    const response = await groq.chat.completions.create({
      model: "llama-3.1-8b-instant",
      messages: [
        {
          role: "system",
	  content:
  "You are DocuMind AI, a conversational AI assistant specialized in helping users understand and explore uploaded documents intelligently.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      temperature: 0.5,
    });

    const answer =
      response.choices[0]?.message?.content ||
      "No response generated";

    // 7. Return response
    return res.status(200).json({
      answer,
      contextChunks: topChunks.length,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      error: "Server error",
    });
  }
};

module.exports = {
  chatWithDocument,
};
