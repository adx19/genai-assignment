import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { GoogleGenerativeAI } from "@google/generative-ai";
import prompts from "./prompt.js";

dotenv.config();

const app = express();
const PORT = 4712;

app.use(cors());
app.use(express.json());

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const model = genAI.getGenerativeModel({
  model: "gemini-1.5-flash",
});

app.post("/api/chat", async (req, res) => {
  try {
    const { persona, messages } = req.body;

    if (!persona || !messages) {
      return res.status(400).json({ error: "Missing persona or message" });
    }

    const systemPrompt = prompts[persona];
    if (!systemPrompt) {
      return res.status(400).json({ error: "Invalid persona" });
    }

    const chat = model.startChat({
      history: messages.map((m) => ({
        role: m.role === "assistant" ? "model" : "user",
        parts: [{ text: m.content }],
      })),
    });

    const lastUserMessage = messages[messages.length - 1]?.content || "";

    const result = await chat.sendMessage(
      `${systemPrompt}\n\nUser: ${lastUserMessage}`,
    );

    const reply = result.response.text();

    res.json({ reply });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Something went wrong" });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
