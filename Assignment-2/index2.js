import "dotenv/config";
import Groq from "groq-sdk";
import readline from "readline";
import fs from "fs";
import path from "path";

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

const client = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

// ============================================
// HELPERS
// ============================================

function generateProjectName(input) {
  const lower = input.toLowerCase();

  const match =
    input.match(/(?:named|called)\s+([\w-]+)/i);

  if (match) {
    return `${match[1]}_clone`;
  }

  if (lower.includes("scaler")) {
    return "scaler_clone";
  }

  if (lower.includes("portfolio")) {
    return "portfolio_clone";
  }

  if (lower.includes("landing")) {
    return "landing_page_clone";
  }

  return "website_clone";
}

function ensureUniqueFolder(name) {
  let finalName = name;
  let count = 1;

  while (fs.existsSync(finalName)) {
    finalName = `${name}_${count}`;
    count++;
  }

  return finalName;
}

// ============================================
// GENERATION
// ============================================

async function generateWebsite(prompt) {
  const response = await client.chat.completions.create({
    model: "llama-3.1-8b-instant",
    messages: [
      {
        role: "system",
        content: `
You are an expert frontend developer.

Generate a COMPLETE modern landing page inspired by scaler.com.

STRICT REQUIREMENTS:

1. Generate THREE separate files:
- index.html
- style.css
- script.js

2. HTML Requirements:
- Full HTML document
- Proper head/body tags
- Link CSS and JS properly
- Header/Navbar
- Hero Section
- Footer

3. CSS Requirements:
- NO broken layouts
- NO overlapping
- Use flexbox properly
- Proper spacing and alignment
- Responsive layout
- Modern dark blue + white theme
- Container with max-width
- Buttons with hover effects
- Hero section must look premium

4. JS Requirements:
- Simple navbar interaction
- Button interaction
- Smooth scrolling

IMPORTANT:
- Return ONLY code
- No explanations
- No markdown explanation text

Return EXACTLY in this format:

=== index.html ===
<html>...</html>

=== style.css ===
body { }

=== script.js ===
console.log("loaded")
`,
      },
      {
        role: "user",
        content: prompt,
      },
    ],
    temperature: 0.4,
    max_tokens: 4000,
  });

  return response.choices[0].message.content;
}

// ============================================
// EXTRACTION
// ============================================

function extractSections(output) {
  const html =
    output
      .split("=== index.html ===")[1]
      ?.split("=== style.css ===")[0]
      ?.trim() || "";

  const css =
    output
      .split("=== style.css ===")[1]
      ?.split("=== script.js ===")[0]
      ?.trim() || "";

  const js =
    output
      .split("=== script.js ===")[1]
      ?.trim() || "";

  return { html, css, js };
}

// ============================================
// FILE WRITING
// ============================================

function writeWebsiteFiles(folder, files) {
  fs.mkdirSync(folder, { recursive: true });

  fs.writeFileSync(
    path.join(folder, "index.html"),
    files.html
  );

  fs.writeFileSync(
    path.join(folder, "style.css"),
    files.css
  );

  fs.writeFileSync(
    path.join(folder, "script.js"),
    files.js
  );
}

// ============================================
// AGENT
// ============================================

async function runAgent(input) {
  console.log("\n[START] Agent started");

  console.log("[THINK] Understanding request");

  const lower = input.toLowerCase();

  const isWebsiteRequest =
    lower.includes("website") ||
    lower.includes("landing") ||
    lower.includes("clone") ||
    lower.includes("build") ||
    lower.includes("create");

  if (!isWebsiteRequest) {
    console.log(
      "[OUTPUT] Please provide a website creation request"
    );
    return;
  }

  const folderName = ensureUniqueFolder(
    generateProjectName(input)
  );

  console.log(
    `[PLAN] Creating project '${folderName}'`
  );

  console.log("[ACT] Generating website");

  const rawOutput = await generateWebsite(input);

  console.log("[OBSERVE] Website generated");

  const files = extractSections(rawOutput);

  if (!files.html || !files.css || !files.js) {
    console.log(
      "[ERROR] Failed to extract HTML/CSS/JS properly"
    );

    return;
  }

  console.log("[ACT] Writing files");

  writeWebsiteFiles(folderName, files);

  console.log("[OBSERVE] Files created");

  console.log(
    `[COMPLETE] Website ready in '${folderName}'`
  );

  console.log(
    `\nOpen website:\nexplorer.exe ${folderName}/index.html\n`
  );
}

// ============================================
// CLI
// ============================================

function startCLI() {
  console.log("\nAI Website Agent Started");
  console.log("Type 'exit' to quit");

  function ask() {
    rl.question("\nYou: ", async (input) => {
      const trimmed = input.trim();

      if (trimmed.toLowerCase() === "exit") {
        console.log("\nGoodbye!\n");

        rl.close();
        return;
      }

      if (!trimmed) {
        ask();
        return;
      }

      try {
        await runAgent(trimmed);
      } catch (error) {
        console.log(`\n[ERROR] ${error.message}\n`);
      }

      ask();
    });
  }

  ask();
}

startCLI();
