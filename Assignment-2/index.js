#!/usr/bin/env node
/**
 * Scaler-Clone Agent CLI
 * ----------------------
 * A conversational terminal agent (Cursor/Windsurf style) that uses
 * Google Gemini with tool-calling to iteratively generate a Scaler
 * Academy look-alike webpage (HTML + CSS + JS).
 *
 * Usage:
 *   1. npm i @google/generative-ai dotenv
 *   2. echo "GEMINI_API_KEY=your_key_here" > .env
 *   3. node cli/agent.mjs
 *
 * Then just chat. Try:
 *   > clone the scaler academy website into ./output
 */

import "dotenv/config";
import readline from "node:readline";
import fs from "node:fs/promises";
import path from "node:path";
import { GoogleGenerativeAI } from "@google/generative-ai";

const API_KEY = process.env.GEMINI_API_KEY;
if (!API_KEY) {
  console.error("❌ Missing GEMINI_API_KEY. Add it to a .env file at the repo root.");
  process.exit(1);
}

const MODEL = "gemini-3-flash-preview";
const ROOT = process.cwd();

// ---------- Tool implementations ----------
const safeResolve = (p) => {
  const abs = path.resolve(ROOT, p);
  if (!abs.startsWith(ROOT)) throw new Error("Path escapes project root");
  return abs;
};

const tools = {
  write_file: async ({ path: p, content }) => {
    const abs = safeResolve(p);
    await fs.mkdir(path.dirname(abs), { recursive: true });
    await fs.writeFile(abs, content, "utf8");
    return { ok: true, bytes: content.length, path: p };
  },
  read_file: async ({ path: p }) => {
    const abs = safeResolve(p);
    const content = await fs.readFile(abs, "utf8");
    return { ok: true, content };
  },
  list_dir: async ({ path: p = "." }) => {
    const abs = safeResolve(p);
    const items = await fs.readdir(abs, { withFileTypes: true });
    return { ok: true, items: items.map((d) => ({ name: d.name, dir: d.isDirectory() })) };
  },
  finish: async ({ summary }) => {
    return { ok: true, summary };
  },
};

// ---------- Tool schema for Gemini ----------
const toolDeclarations = [
  {
    name: "write_file",
    description: "Create or overwrite a UTF-8 text file at a project-relative path. Creates parent directories as needed.",
    parameters: {
      type: "object",
      properties: {
        path: { type: "string", description: "Project-relative file path, e.g. 'output/index.html'." },
        content: { type: "string", description: "Full file contents." },
      },
      required: ["path", "content"],
    },
  },
  {
    name: "read_file",
    description: "Read a UTF-8 text file from the project.",
    parameters: {
      type: "object",
      properties: { path: { type: "string" } },
      required: ["path"],
    },
  },
  {
    name: "list_dir",
    description: "List entries inside a project directory.",
    parameters: {
      type: "object",
      properties: { path: { type: "string" } },
    },
  },
  {
    name: "finish",
    description: "Call when the user's task is fully complete. Provide a short summary of what was built and where.",
    parameters: {
      type: "object",
      properties: { summary: { type: "string" } },
      required: ["summary"],
    },
  },
];

const SYSTEM = `You are "ScalerCloneAgent", a terminal coding agent (like Cursor/Windsurf).

Operating rules:
- You work in iterative steps. NEVER try to do everything in one giant response.
- When the user asks to clone the Scaler Academy website (https://www.scaler.com), produce a self-contained static site in an "output/" directory:
    output/index.html, output/styles.css, output/script.js
- The page MUST contain at minimum: a Header (logo "Scaler", nav links: Academy, Neovarsity, Topics, Books, Login, Book a Free Trial CTA), a Hero Section (bold headline about transforming tech careers, sub-headline, primary CTA, secondary CTA, supporting visual placeholder), and a Footer (columns for Company / Programs / Resources / Social, copyright).
- Visual style should evoke Scaler: dark navy/near-black background (#0b1c2c-ish), white text, vibrant accent (electric blue/yellow), modern sans-serif (Inter/Poppins via Google Fonts), generous spacing, rounded buttons.
- Add light JS interactivity (mobile nav toggle, smooth scroll, simple FAQ accordion or testimonial slider — your choice).
- Do NOT copy any copyrighted text/logos verbatim. Use original copy that captures the same intent.
- After writing files, briefly tell the user how to open output/index.html and call the finish tool.

Always use the provided tools to actually create files. Do not just print code in chat — write it to disk.`;

// ---------- Agent loop ----------
const genAI = new GoogleGenerativeAI(API_KEY);
const model = genAI.getGenerativeModel({
  model: MODEL,
  systemInstruction: SYSTEM,
  tools: [{ functionDeclarations: toolDeclarations }],
});

const chat = model.startChat({ history: [] });

async function sendAndDrive(userText) {
  let result = await chat.sendMessage(userText);
  let safety = 0;
  while (safety++ < 25) {
    const calls = result.response.functionCalls?.() ?? [];
    if (!calls.length) {
      const text = result.response.text();
      if (text) console.log(`\n🤖 ${text}\n`);
      return;
    }
    const responses = [];
    for (const call of calls) {
      const fn = tools[call.name];
      console.log(`🔧 ${call.name}(${Object.keys(call.args || {}).join(", ")})`);
      let response;
      try {
        response = fn ? await fn(call.args || {}) : { ok: false, error: "unknown tool" };
      } catch (e) {
        response = { ok: false, error: String(e?.message || e) };
      }
      responses.push({ functionResponse: { name: call.name, response } });
    }
    result = await chat.sendMessage(responses);
  }
  console.log("⚠️  Stopped: tool-loop safety limit reached.");
}

// ---------- REPL ----------
const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
const ask = (q) => new Promise((res) => rl.question(q, res));

console.log("🟢 Scaler-Clone Agent ready. Type your instruction (or 'exit').");
console.log("   Tip: try  →  clone the scaler academy website into ./output\n");

while (true) {
  const input = (await ask("you › ")).trim();
  if (!input) continue;
  if (["exit", "quit", ":q"].includes(input.toLowerCase())) break;
  try {
    await sendAndDrive(input);
  } catch (e) {
    console.error("❌", e?.message || e);
  }
}
rl.close();
