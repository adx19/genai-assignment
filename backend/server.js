import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { GoogleGenAI } from "@google/genai";
import prompts from "./prompt.js"; 

dotenv.config();

const app = express();
const PORT = 4712;

app.use(cors());
app.use(express.json());

const genAI = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

app.post("/api/chat", async (req, res) => {
  try {
    const { persona, messages } = req.body;

    if (!persona || !messages) {
      return res.status(400).json({ error: "Missing persona or messages" });
    }

    const systemPrompt = prompts[persona];
    if (!systemPrompt) {
      return res.status(400).json({ error: "Invalid persona" });
    }

    const lastUserMessage = messages[messages.length - 1]?.content || "";

    const response = await genAI.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `${systemPrompt}\n\nUser: ${lastUserMessage}`,
    });

    const reply = response.text;

    res.json({ reply });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Something went wrong" });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});