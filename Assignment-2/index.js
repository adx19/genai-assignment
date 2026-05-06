import dotenv from "dotenv";
dotenv.config();

import readline from "readline";
import fs from "fs";
import path from "path";
import axios from "axios";
import * as cheerio from "cheerio";
import { GoogleGenerativeAI } from "@google/generative-ai";

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

const apiKey = process.env.GEMINI_API_KEY;

if (!apiKey) {
  console.log("❌ GEMINI_API_KEY not found.");
  process.exit(1);
}

const genAI = new GoogleGenerativeAI(apiKey);

const model = genAI.getGenerativeModel({
  model: "gemini-2.5-flash-lite",
});

const OUTPUT_DIR = path.join(process.cwd(), "output");

if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR);
}

const systemPrompt = `
You are an elite frontend website cloning agent.

Your ONLY task is to recreate websites as accurately as possible.

You are NOT designing a new website.
You are cloning the provided website.

========================
YOUR JOB
========================

You will receive:
- user instruction
- scraped website content
- real headings
- real images
- real HTML snippets
- stylesheet references

You MUST use those details to recreate the website visually.

========================
STRICT RULES
========================

1. Generate ONLY:
- index.html
- style.css
- script.js

2. Use ONLY:
- HTML
- CSS
- Vanilla JavaScript

3. Do NOT use:
- React
- Tailwind
- Bootstrap
- Vue
- frameworks

4. VISUAL ACCURACY IS MOST IMPORTANT

Match:
- colors
- layout
- spacing
- typography
- section structure
- navbar
- hero section
- cards
- footer
- buttons

5. Use REAL image URLs from scraped data whenever possible.

6. Do NOT invent random layouts.

7. Do NOT add unnecessary animations.

8. CSS must:
- be clean
- responsive
- non-breaking
- organized

9. JavaScript should remain minimal.

10. ALWAYS return COMPLETE files.

11. NEVER return placeholders like:
- "continue here"
- "remaining code"
- "same as above"

12. RESPONSE FORMAT IS MANDATORY.

You MUST respond EXACTLY like this:

<THOUGHT>
Reasoning here
</THOUGHT>

<HTML>
ENTIRE HTML FILE HERE
</HTML>

<CSS>
ENTIRE CSS FILE HERE
</CSS>

<JS>
ENTIRE JS FILE HERE
</JS>

IMPORTANT:
- Do NOT wrap anything in markdown
- Do NOT use triple backticks
- Do NOT return JSON
- Do NOT explain anything outside the tags
- All 4 tags are mandatory
- HTML must be inside <HTML>
- CSS must be inside <CSS>
- JS must be inside <JS>

<THOUGHT>
your reasoning
</THOUGHT>

<HTML>
full html
</HTML>

<CSS>
full css
</CSS>

<JS>
full javascript
</JS>

13. Do NOT use markdown code blocks.
14. Do NOT return JSON.
`;

let conversationHistory = [
  {
    role: "user",
    parts: [{ text: systemPrompt }],
  },
];

console.log("🤖 Website Cloner Agent (Gemini)");
console.log('💡 Try: "Clone https://www.scaler.com"');
console.log('💡 Type "exit" to quit\n');

async function scrapeWebsite(url) {
  try {
    console.log("🌐 Scraping website...");

    const response = await axios.get(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
      },
    });

    const html = response.data;

    const $ = cheerio.load(html);

    const title = $("title").text();

    const headings = [];

    $("h1, h2, h3").each((i, el) => {
      const text = $(el).text().trim();

      if (text) {
        headings.push(text);
      }
    });

    const paragraphs = [];

    $("p").each((i, el) => {
      const text = $(el).text().trim();

      if (text.length > 40) {
        paragraphs.push(text);
      }
    });

    const images = [];

    $("img").each((i, el) => {
      const src = $(el).attr("src");

      if (src) {
        if (src.startsWith("http")) {
          images.push(src);
        } else if (src.startsWith("/")) {
          images.push(url + src);
        }
      }
    });

    const stylesheets = [];

    $('link[rel="stylesheet"]').each((i, el) => {
      const href = $(el).attr("href");

      if (href) {
        if (href.startsWith("http")) {
          stylesheets.push(href);
        } else if (href.startsWith("/")) {
          stylesheets.push(url + href);
        }
      }
    });

    const inlineStyles = [];

    $("style").each((i, el) => {
      inlineStyles.push($(el).html());
    });

    return {
      title,
      headings: headings.slice(0, 30),
      paragraphs: paragraphs.slice(0, 20),
      images: images.slice(0, 30),
      stylesheets,
    };
  } catch (error) {
    console.log("❌ Scraping failed:", error.message);
    return null;
  }
}

function extractTag(content, tag) {
  const startTag = `<${tag}>`;
  const endTag = `</${tag}>`;

  const startIndex = content.indexOf(startTag);
  const endIndex = content.indexOf(endTag);

  if (startIndex === -1 || endIndex === -1) {
    return "";
  }

  return content
    .substring(startIndex + startTag.length, endIndex)
    .trim();
}
function askUser() {
  rl.question("You: ", async (input) => {
    if (input.toLowerCase() === "exit") {
      console.log("\n👋 Exiting...");
      rl.close();
      return;
    }

    try {
      console.log("\n🚀 START: Starting the cloning process...");
      console.log("🌐 Reading website...");
      console.log("🎨 Extracting design...");
      console.log("🧠 Understanding layout...");
      console.log("🛠️ Generating files...\n");

      let scrapedData = null;

      if (input.includes("http")) {
        const urlMatch = input.match(/https?:\/\/[^\s]+/);

        if (urlMatch) {
          scrapedData = await scrapeWebsite(urlMatch[0]);
        }
      }

      conversationHistory.push({
        role: "user",
        parts: [
          {
            text: `
USER REQUEST:
${input}

SCRAPED WEBSITE DATA:
${JSON.stringify(scrapedData, null, 2)}

IMPORTANT:
Use the scraped data to recreate the website visually.

Do NOT overthink.
Do NOT explain excessively.

Directly generate:
- HTML
- CSS
- JS

Keep reasoning short.
`,
          },
        ],
      });

      const result = await model.generateContent({
        contents: conversationHistory,
        generationConfig: {
          temperature: 0.2,
          topP: 0.8,
          topK: 20,
          maxOutputTokens: 16384,
        },
      });

      const response = result.response.text();

      const thought = extractTag(response, "THOUGHT");
      const html = extractTag(response, "HTML");
      const css = extractTag(response, "CSS");
      const js = extractTag(response, "JS");

      if (!html || !css) {
         console.log("\n⚠️ RAW MODEL RESPONSE:\n");
         console.log(response);

         throw new Error("Failed to extract generated files.");
      }
      const htmlPath = path.join(OUTPUT_DIR, "index.html");
      const cssPath = path.join(OUTPUT_DIR, "style.css");
      const jsPath = path.join(OUTPUT_DIR, "script.js");

      fs.writeFileSync(htmlPath, html);
      fs.writeFileSync(cssPath, css);
      fs.writeFileSync(jsPath, js);

      console.log("✅ Clone generated successfully!\n");

      console.log("📂 Output Folder:");
      console.log(OUTPUT_DIR);

      console.log("\n🧠 Agent Thought:");
      console.log(thought);

      console.log("\n📄 Files Generated:");
      console.log("- index.html");
      console.log("- style.css");
      console.log("- script.js");

      console.log("\n🌐 Open output/index.html in browser\n");

      conversationHistory.push({
        role: "model",
        parts: [{ text: response }],
      });
    } catch (error) {
      console.log("\n❌ Error:");
      console.log(error.message);
    }

    console.log("");
    askUser();
  });
}

askUser();
