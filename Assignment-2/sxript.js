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
// TOOLS
// ============================================

const tools = {
  createFolder: ({ name }) => {
    try {
      fs.mkdirSync(name, { recursive: true });
      return { success: true, message: `Created folder: ${name}` };
    } catch (error) {
      return { success: false, message: `Failed to create folder: ${error.message}` };
    }
  },

  writeFile: ({ filePath, content }) => {
    try {
      const dir = path.dirname(filePath);
      fs.mkdirSync(dir, { recursive: true });
      fs.writeFileSync(filePath, content, "utf-8");
      return { success: true, message: `Written: ${filePath} (${content.length} bytes)` };
    } catch (error) {
      return { success: false, message: `Failed to write file: ${error.message}` };
    }
  },

  listFiles: ({ folder }) => {
    try {
      if (fs.existsSync(folder)) {
        const files = fs.readdirSync(folder);
        return { success: true, files, message: `${folder}: ${files.join(", ")}` };
      }
      return { success: false, message: `Folder not found: ${folder}` };
    } catch (error) {
      return { success: false, message: `Failed to list files: ${error.message}` };
    }
  },

  deleteFolder: ({ name }) => {
    try {
      if (fs.existsSync(name)) {
        fs.rmSync(name, { recursive: true, force: true });
        return { success: true, message: `Deleted folder: ${name}` };
      }
      return { success: false, message: `Folder not found: ${name}` };
    } catch (error) {
      return { success: false, message: `Failed to delete folder: ${error.message}` };
    }
  },
};

// ============================================
// HELPER FUNCTIONS
// ============================================

function sanitizeFolderName(name) {
  // Convert to lowercase, replace spaces with underscores, remove special chars
  return name
    .toLowerCase()
    .replace(/\s+/g, '_')
    .replace(/[^a-z0-9_-]/g, '')
    .substring(0, 50); // Limit length
}

function extractWebsiteName(input) {
  // Try to extract website name from various patterns
  const patterns = [
    /clone\s+(?:the\s+)?([a-zA-Z0-9\s]+?)(?:\s+website|\s+site|$)/i,
    /create\s+(?:a\s+)?([a-zA-Z0-9\s]+?)(?:\s+website|\s+clone|\s+site|$)/i,
    /build\s+(?:a\s+)?([a-zA-Z0-9\s]+?)(?:\s+website|\s+clone|\s+site|$)/i,
    /make\s+(?:a\s+)?([a-zA-Z0-9\s]+?)(?:\s+website|\s+clone|\s+site|$)/i,
    /generate\s+(?:a\s+)?([a-zA-Z0-9\s]+?)(?:\s+website|\s+clone|\s+site|$)/i,
  ];

  for (const pattern of patterns) {
    const match = input.match(pattern);
    if (match && match[1].trim()) {
      return match[1].trim();
    }
  }

  // Default fallback
  return "Generic Website";
}

// ============================================
// LLM GENERATION
// ============================================

function extractCode(response, language) {
  const pattern = new RegExp(`\`\`\`(?:${language})?\\s*([\\s\\S]*?)\`\`\``, "i");
  const match = response.match(pattern);
  return match ? match[1].trim() : response.trim();
}

async function llm(system, user, maxTokens = 2000) {
  const response = await client.chat.completions.create({
    model: "llama-3.1-8b-instant",
    messages: [
      { role: "system", content: system },
      { role: "user", content: user },
    ],
    max_tokens: maxTokens,
    temperature: 0.5,
  });
  return response.choices[0].message.content.trim();
}

async function generateHTML(siteName) {
  const system = `You are a senior frontend developer. Your task is to write the complete HTML structure for a clone of the ${siteName} website.

The HTML must:
- Be a complete, valid HTML5 document with DOCTYPE, head, and body
- Link to an external stylesheet: <link rel="stylesheet" href="style.css">
- Load an external script at the end of body: <script src="script.js"></script>
- Import a professional Google Font in the <head>
- Contain the following sections using semantic HTML and descriptive class names:
  1. A sticky navigation header with the site logo, navigation links, and call-to-action buttons
  2. A hero section with a headline, subheadline, primary and secondary CTA buttons, and a visual card showing a learner success story
  3. A stats/metrics section showing key platform numbers
  4. A programs/courses section with at least 3 course cards
  5. A testimonials section with student success stories
  6. A footer with links, contact info, and a copyright line
- Use only class names and IDs as styling hooks — no inline styles at all
- All class names should be meaningful and consistent (e.g. .nav, .nav__logo, .hero, .hero__title, .card)

Return ONLY the raw HTML. No explanation, no markdown fences.`;

  const raw = await llm(system, `Generate the full HTML for the ${siteName} clone.`, 2500);
  return extractCode(raw, "html");
}

async function generateCSS(siteName) {
  const system = `You are a senior CSS developer. Your task is to write a complete, modern stylesheet for a clone of the ${siteName} website.

CRITICAL REQUIREMENTS FOR PROPER RENDERING:
- Ensure ALL text has high contrast and is clearly visible (use light text on dark backgrounds or dark text on light backgrounds)
- Set proper font sizes for all text elements (minimum 14px for body text)
- Ensure sections have proper padding and don't overflow
- Set max-width on hero content so text doesn't stretch too wide
- Use proper z-index for overlapping elements
- Ensure images/cards have proper dimensions and don't break layout

The CSS must include:
1. CSS custom properties (variables) at :root for:
   - Primary, secondary, accent colors (ensure good contrast)
   - Text colors (light and dark variants)
   - Font families and sizes
   - Spacing scale (8px, 16px, 24px, 32px, 48px, 64px)

2. Base styles:
   - Reset margins/padding
   - Box-sizing: border-box
   - Body: proper font-family, line-height (1.6), color, background

3. Navigation styling:
   - Sticky positioning (top: 0, z-index: 1000)
   - Flexbox layout with space-between
   - Proper padding (1rem 2rem)
   - Background color with slight transparency
   - Link hover effects with smooth transitions

4. Hero section:
   - Flexbox or grid layout (two columns on desktop)
   - Large headline (2.5rem - 3rem)
   - Proper vertical spacing between elements
   - CTA buttons with contrasting colors
   - Success card with border/shadow

5. Stats section:
   - Horizontal flexbox layout
   - Large numbers (3rem font-size, bold)
   - Labels below numbers
   - Proper spacing between items

6. Programs/courses grid:
   - CSS Grid with 3 columns on desktop, 1 on mobile
   - Card styling with padding, border-radius, shadow
   - Hover effects (transform: translateY(-5px))
   - Proper image sizing within cards

7. Testimonials:
   - Grid layout for quotes
   - Card styling with proper padding
   - Avatar circles (border-radius: 50%)

8. Footer:
   - Dark background, light text
   - Multi-column layout
   - Proper link styling

9. Responsive design:
   - Mobile breakpoint (@media (max-width: 768px))
   - Stack columns vertically
   - Adjust font sizes and spacing

10. Animations:
   - .fade-in class with opacity: 0, transform: translateY(20px)
   - .fade-in.visible with opacity: 1, transform: translateY(0), transition: 0.6s
   - Smooth transitions on interactive elements

IMPORTANT: Make sure all text is readable and sections don't have excessive height. Use realistic content proportions.

Return ONLY the raw CSS. No explanation, no markdown fences.`;

  const raw = await llm(system, `Generate the complete CSS for the ${siteName} clone.`, 3000);
  return extractCode(raw, "css");
}

async function generateJS(siteName) {
  const system = `You are a senior JavaScript developer. Write vanilla JavaScript for a ${siteName} website clone.

The script must implement:
1. Sticky navbar: change navbar appearance (add shadow/background) when the user scrolls past 60px
2. Mobile menu: toggle a CSS class on the nav links container when the hamburger icon is clicked
3. Smooth scroll: intercept clicks on anchor links (href starting with #) and scroll smoothly to the target
4. Scroll animations: use IntersectionObserver to add the class "visible" to elements with class "fade-in" when they enter the viewport
5. CTA interaction: clicking primary CTA buttons shows a simple browser alert about the program

Use vanilla JS only. Add DOMContentLoaded wrapper. Handle cases where elements might not exist.

Return ONLY the raw JavaScript. No explanation, no markdown fences.`;

  const raw = await llm(system, `Generate the JavaScript for the ${siteName} clone.`, 1000);
  return extractCode(raw, "javascript");
}

// ============================================
// AGENT
// ============================================

class WebsiteAgent {
  constructor() {
    this.folder = null;
  }

  log(label, message) {
    console.log(`  [${label}] ${message}`);
  }

  async think(input) {
    const lower = input.toLowerCase();
    const isDelete = lower.includes("delete") || lower.includes("remove");
    const isCreate =
      lower.includes("create") || lower.includes("build") ||
      lower.includes("clone") || lower.includes("generate") ||
      lower.includes("make") || lower.includes("website");

    if (isDelete) {
      const match = input.match(/(?:delete|remove)\s+([\w_-]+)/i);
      return { action: "delete", target: match ? match[1] : null };
    }
    if (isCreate) {
      const siteName = extractWebsiteName(input);
      return { action: "create", siteName };
    }
    return { action: "unknown" };
  }

  async executeCreate(siteName) {
    console.log(`\nPlanning: generate ${siteName} clone as 3 files (HTML, CSS, JS)\n`);

    // Step 1 — create folder with sanitized name
    this.log("1/5", "Creating project folder");
    const sanitizedName = sanitizeFolderName(siteName);
    this.folder = `${sanitizedName}_clone`;
    const folderResult = tools.createFolder({ name: this.folder });
    this.log("done", folderResult.message);

    // Step 2 — generate HTML
    this.log("2/5", "Generating HTML structure");
    const htmlContent = await generateHTML(siteName);
    this.log("done", `${htmlContent.length} bytes of HTML`);

    // Step 3 — generate CSS
    this.log("3/5", "Generating CSS stylesheet");
    const cssContent = await generateCSS(siteName);
    this.log("done", `${cssContent.length} bytes of CSS`);

    // Step 4 — generate JS
    this.log("4/5", "Generating JavaScript");
    const jsContent = await generateJS(siteName);
    this.log("done", `${jsContent.length} bytes of JS`);

    // Step 5 — write files
    this.log("5/5", "Writing files to disk");
    const files = [
      { path: `${this.folder}/index.html`, content: htmlContent },
      { path: `${this.folder}/style.css`,  content: cssContent },
      { path: `${this.folder}/script.js`,  content: jsContent },
    ];
    for (const file of files) {
      const result = tools.writeFile({ filePath: file.path, content: file.content });
      this.log("write", result.message);
    }

    const listResult = tools.listFiles({ folder: this.folder });
    this.log("verify", listResult.message);

    console.log(`\nDone. Open in browser: open ${this.folder}/index.html\n`);
  }

  async executeDelete(target) {
    if (!target) {
      console.log("  Please specify a folder name to delete.\n");
      return;
    }
    this.log("delete", `Removing folder: ${target}`);
    const result = tools.deleteFolder({ name: target });
    this.log("done", result.message);
    console.log();
  }

  async run(input) {
    const decision = await this.think(input);

    if (decision.action === "create") {
      await this.executeCreate(decision.siteName);
    } else if (decision.action === "delete") {
      await this.executeDelete(decision.target);
    } else {
      console.log('\n  Not sure what you mean. Try: "clone the [website name] website" or "delete <folder>"\n');
    }
  }
}

// ============================================
// CLI
// ============================================

function startCLI() {
  console.log('\nUniversal Website Cloning Agent');
  console.log('Say "clone the [website name] website", "delete <folder>", or "exit"\n');

  function prompt() {
    rl.question("You: ", async (input) => {
      const trimmed = input.trim();

      if (!trimmed) { prompt(); return; }
      if (trimmed.toLowerCase() === "exit") {
        console.log("Goodbye.\n");
        rl.close();
        return;
      }

      try {
        const agent = new WebsiteAgent();
        await agent.run(trimmed);
      } catch (err) {
        console.log(`  Error: ${err.message}\n`);
      }

      prompt();
    });
  }

  prompt();
}

startCLI();
