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
// TOOLS - Actions the agent can perform
// ============================================

const tools = {
  createFolder: ({ name }) => {
    try {
      fs.mkdirSync(name, { recursive: true });
      return { success: true, message: `Folder '${name}' created successfully` };
    } catch (error) {
      return { success: false, message: `Failed to create folder: ${error.message}` };
    }
  },

  writeFile: ({ filePath, content }) => {
    try {
      const dir = path.dirname(filePath);
      fs.mkdirSync(dir, { recursive: true });
      fs.writeFileSync(filePath, content);
      return { success: true, message: `File '${filePath}' written successfully` };
    } catch (error) {
      return { success: false, message: `Failed to write file: ${error.message}` };
    }
  },

  deleteFolder: ({ name }) => {
    try {
      if (fs.existsSync(name)) {
        fs.rmSync(name, { recursive: true, force: true });
        return { success: true, message: `Folder '${name}' deleted successfully` };
      }
      return { success: false, message: `Folder '${name}' does not exist` };
    } catch (error) {
      return { success: false, message: `Failed to delete folder: ${error.message}` };
    }
  },

  listFiles: ({ folder }) => {
    try {
      if (fs.existsSync(folder)) {
        const files = fs.readdirSync(folder);
        return { success: true, message: `Files in '${folder}': ${files.join(", ")}` };
      }
      return { success: false, message: `Folder '${folder}' does not exist` };
    } catch (error) {
      return { success: false, message: `Failed to list files: ${error.message}` };
    }
  },
};

// ============================================
// WEBSITE GENERATION
// ============================================

async function generateWebsiteHTML(siteName) {
  console.log("  🤖 Generating HTML structure...");
  
  const response = await client.chat.completions.create({
    model: "llama-3.1-8b-instant",
    messages: [
      {
        role: "system",
        content: `You are an expert frontend developer specializing in cloning modern websites.

Generate a COMPLETE HTML document that clones the Scaler Academy website (scaler.com).

REQUIREMENTS:
1. Full HTML5 structure with proper DOCTYPE
2. Modern, clean design with purple/blue theme (#6C63FF primary color)
3. Include these sections:
   - Navigation Header (logo, menu items: Courses, Programs, Resources, About)
   - Hero Section (catchy headline about tech careers, CTA button, hero image/illustration)
   - Footer (company info, links, social media icons)

4. Use semantic HTML tags
5. Link to external style.css and script.js
6. Responsive meta tags
7. Professional typography (use Google Fonts - Inter or Poppins)

Return ONLY the HTML code wrapped in \`\`\`html blocks.`,
      },
      { role: "user", content: `Create the HTML for ${siteName}` },
    ],
    temperature: 0.7,
  });

  return response.choices[0].message.content;
}

async function generateWebsiteCSS() {
  console.log("  🎨 Generating CSS styling...");
  
  const response = await client.chat.completions.create({
    model: "llama-3.1-8b-instant",
    messages: [
      {
        role: "system",
        content: `You are an expert CSS developer.

Generate modern CSS for a Scaler Academy website clone.

REQUIREMENTS:
1. Modern color scheme:
   - Primary: #6C63FF (purple)
   - Secondary: #4CAF50 (green)
   - Background: #F5F7FA
   - Text: #2C3E50

2. Styling for:
   - Navigation bar (sticky, shadow, hover effects)
   - Hero section (full viewport height, centered content, gradient background)
   - Footer (dark background, multiple columns)
   - Buttons with hover animations
   - Responsive design (mobile-first)

3. Use Flexbox/Grid for layouts
4. Smooth transitions and hover effects
5. Professional spacing and typography
6. Box shadows for depth

Return ONLY the CSS code wrapped in \`\`\`css blocks.`,
      },
      { role: "user", content: "Create the CSS styling" },
    ],
    temperature: 0.7,
  });

  return response.choices[0].message.content;
}

async function generateWebsiteJS() {
  console.log("  ⚡ Generating JavaScript interactivity...");
  
  const response = await client.chat.completions.create({
    model: "llama-3.1-8b-instant",
    messages: [
      {
        role: "system",
        content: `You are an expert JavaScript developer.

Generate JavaScript for interactive features:

FEATURES TO IMPLEMENT:
1. Smooth scroll for navigation links
2. Mobile menu toggle
3. Scroll-based navbar background change
4. Intersection Observer for fade-in animations
5. CTA button click handlers

Use vanilla JavaScript (no jQuery).
Include proper event listeners and error handling.

Return ONLY the JavaScript code wrapped in \`\`\`javascript blocks.`,
      },
      { role: "user", content: "Create the JavaScript code" },
    ],
    temperature: 0.7,
  });

  return response.choices[0].message.content;
}

// ============================================
// FILE EXTRACTION
// ============================================

function extractCodeFromResponse(response, language) {
  // Try code block format first
  const blockPattern = new RegExp(`\`\`\`${language}([\\s\\S]*?)\`\`\``, "i");
  const match = response.match(blockPattern);
  
  if (match) {
    return match[1].trim();
  }
  
  // Fallback for HTML - try to find complete HTML document
  if (language === "html") {
    const htmlMatch = response.match(/<(!DOCTYPE html|html)[\s\S]*<\/html>/i);
    if (htmlMatch) {
      return htmlMatch[0].trim();
    }
  }
  
  // Return the full response if no pattern matched
  return response.trim();
}

// ============================================
// AGENT - Multi-step reasoning system
// ============================================

class WebsiteAgent {
  constructor() {
    this.state = {
      step: 0,
      folder: null,
      filesCreated: [],
    };
  }

  log(emoji, label, message) {
    console.log(`\n${emoji} [${label}] ${message}`);
  }

  async think(input) {
    this.log("🧠", "THINK", "Analyzing user request...");
    console.log(`   Input: "${input}"`);
    
    const lower = input.toLowerCase();
    
    if (lower.includes("delete") || lower.includes("remove")) {
      return { action: "delete", target: this.extractFolderName(input) || "scaler_clone" };
    }
    
    if (lower.includes("create") || lower.includes("build") || lower.includes("clone") || lower.includes("website")) {
      return { action: "create", siteName: this.extractSiteName(input) || "Scaler Academy Clone" };
    }
    
    return { action: "unknown" };
  }

  extractFolderName(input) {
    const match = input.match(/delete\s+(\w+)/i);
    return match ? match[1] : null;
  }

  extractSiteName(input) {
    const match = input.match(/(?:named?|called)\s+(.+?)(?:\s|$)/i);
    return match ? match[1].trim() : null;
  }

  async executeDelete(folderName) {
    this.log("📋", "PLAN", `Will delete folder: ${folderName}`);
    
    this.log("⚡", "ACT", `Executing delete operation...`);
    const result = tools.deleteFolder({ name: folderName });
    
    this.log("👀", "OBSERVE", result.message);
    this.log("✅", "COMPLETE", "Delete operation finished");
  }

  async executeCreate(siteName) {
    this.log("📋", "PLAN", "Breaking down website creation into steps:");
    console.log("   Step 1: Create project folder");
    console.log("   Step 2: Generate HTML structure");
    console.log("   Step 3: Generate CSS styling");
    console.log("   Step 4: Generate JavaScript code");
    console.log("   Step 5: Write all files to disk");
    console.log("   Step 6: Verify creation");

    // Step 1: Create folder
    await this.delay(800);
    this.log("⚡", "ACT [1/6]", "Creating project folder...");
    this.state.folder = `scaler_clone_${Date.now()}`;
    const folderResult = tools.createFolder({ name: this.state.folder });
    this.log("👀", "OBSERVE", folderResult.message);

    // Step 2: Generate HTML
    await this.delay(800);
    this.log("⚡", "ACT [2/6]", "Generating HTML structure...");
    const htmlResponse = await generateWebsiteHTML(siteName);
    const htmlContent = extractCodeFromResponse(htmlResponse, "html");
    this.log("👀", "OBSERVE", `Generated ${htmlContent.length} characters of HTML`);

    // Step 3: Generate CSS
    await this.delay(800);
    this.log("⚡", "ACT [3/6]", "Generating CSS styling...");
    const cssResponse = await generateWebsiteCSS();
    const cssContent = extractCodeFromResponse(cssResponse, "css");
    this.log("👀", "OBSERVE", `Generated ${cssContent.length} characters of CSS`);

    // Step 4: Generate JavaScript
    await this.delay(800);
    this.log("⚡", "ACT [4/6]", "Generating JavaScript code...");
    const jsResponse = await generateWebsiteJS();
    const jsContent = extractCodeFromResponse(jsResponse, "javascript");
    this.log("👀", "OBSERVE", `Generated ${jsContent.length} characters of JavaScript`);

    // Step 5: Write files
    await this.delay(800);
    this.log("⚡", "ACT [5/6]", "Writing files to disk...");
    
    const htmlResult = tools.writeFile({
      filePath: `${this.state.folder}/index.html`,
      content: htmlContent,
    });
    console.log(`   ✓ ${htmlResult.message}`);
    
    const cssResult = tools.writeFile({
      filePath: `${this.state.folder}/style.css`,
      content: cssContent,
    });
    console.log(`   ✓ ${cssResult.message}`);
    
    const jsResult = tools.writeFile({
      filePath: `${this.state.folder}/script.js`,
      content: jsContent,
    });
    console.log(`   ✓ ${jsResult.message}`);

    // Step 6: Verify
    await this.delay(800);
    this.log("⚡", "ACT [6/6]", "Verifying file creation...");
    const listResult = tools.listFiles({ folder: this.state.folder });
    this.log("👀", "OBSERVE", listResult.message);

    this.log("✅", "COMPLETE", `Website successfully created in '${this.state.folder}'`);
    console.log(`\n   📂 Open ${this.state.folder}/index.html in your browser to view!`);
  }

  async delay(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  async run(input) {
    console.log("\n" + "=".repeat(60));
    this.log("🚀", "START", "Agent initialized");
    
    // THINK
    const decision = await this.think(input);
    
    if (decision.action === "delete") {
      await this.executeDelete(decision.target);
    } else if (decision.action === "create") {
      await this.executeCreate(decision.siteName);
    } else {
      this.log("❌", "ERROR", "Could not understand the request");
      console.log("   Try: 'create a website' or 'delete scaler_clone'");
    }
    
    console.log("=".repeat(60) + "\n");
  }
}

// ============================================
// CLI INTERFACE
// ============================================

function startCLI() {
  console.log("\n╔════════════════════════════════════════════════════════╗");
  console.log("║        🤖 AI Website Cloning Agent                    ║");
  console.log("║        Type 'exit' to quit                            ║");
  console.log("╚════════════════════════════════════════════════════════╝");

  function prompt() {
    rl.question("\n💬 You: ", async (input) => {
      const trimmed = input.trim();
      
      if (trimmed.toLowerCase() === "exit") {
        console.log("\n👋 Goodbye!\n");
        rl.close();
        return;
      }
      
      if (!trimmed) {
        prompt();
        return;
      }

      try {
        const agent = new WebsiteAgent();
        await agent.run(trimmed);
      } catch (error) {
        console.log(`\n❌ Error: ${error.message}\n`);
      }
      
      prompt();
    });
  }

  prompt();
}

// ============================================
// ENTRY POINT
// ============================================

startCLI();
