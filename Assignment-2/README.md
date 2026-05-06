# AI Website Cloning Agent 🤖

A conversational CLI-based AI agent that clones websites using Gemini AI.

This project recreates websites like https://www.scaler.com by scraping real website data and generating complete HTML, CSS, and JavaScript files.

---

# 🚀 Features

- Conversational CLI interface
- Gemini AI powered generation
- Real website scraping using Axios + Cheerio
- Generates:
  - `index.html`
  - `style.css`
  - `script.js`
- Responsive website output
- Multi-step agent workflow
- Browser-ready generated files
- Pure HTML/CSS/Vanilla JS
- No frameworks used

---

# 🛠️ Tech Stack

- Node.js
- Gemini 2.5 Flash Lite
- Axios
- Cheerio
- Dotenv

---

# 📦 Installation

## 1. Clone the repository

```bash
git clone <your_repo_url>
cd <your_repo_name>
```

## 2. Install dependencies

```bash
npm install
```

Or manually:

```bash
npm install @google/generative-ai dotenv axios cheerio
```

---

# 🔑 Setup API Key

Create a `.env` file:

```env
GEMINI_API_KEY=your_api_key_here
```

Get your API key from:

https://aistudio.google.com/app/apikey

---

# ▶️ Run the Project

```bash
node index.js
```

---

# 💬 Example Usage

```bash
You: Clone https://www.scaler.com
```

The agent will:

1. Read the website
2. Scrape content and assets
3. Analyze structure and styling
4. Generate:
   - HTML
   - CSS
   - JavaScript
5. Save files into the `output/` folder

---

# 📂 Output Structure

```bash
output/
├── index.html
├── style.css
└── script.js
```

Open `index.html` in your browser to view the generated website.

---

# 🧠 How the Agent Works

The CLI agent follows a multi-step workflow:

## 1. Website Scraping

Using Axios + Cheerio:
- headings
- paragraphs
- image URLs
- stylesheet references

are extracted from the target website.

---

## 2. AI Reasoning

Gemini analyzes:
- layout
- colors
- typography
- spacing
- structure
- branding

before generating the files.

---

## 3. File Generation

The AI generates:
- semantic HTML
- responsive CSS
- minimal JavaScript

which are written directly to disk.

---

# 🎯 Assignment Requirements Covered

✅ Conversational CLI Tool  
✅ Multi-step Agent Workflow  
✅ Real Website Cloning  
✅ HTML/CSS/JS Generation  
✅ Browser-ready Output  
✅ Header + Hero + Footer  
✅ Real File Creation  
✅ Iterative Agent Reasoning  

---

# 📸 Demo Suggestions

For your demo video:

1. Run:
```bash
node index.js
```

2. Enter:
```bash
Clone https://www.scaler.com
```

3. Show:
- terminal reasoning
- generated files
- browser output

4. Open:
```bash
output/index.html
```

in browser.

---

# ⚠️ Notes

- The generated website is AI-generated and may not be pixel-perfect.
- Animations were intentionally minimized.
- The agent focuses on visual similarity and structure.

---

# 📄 License

MIT License

---

# 👨‍💻 Author

Built for the GenAI Assignment.
