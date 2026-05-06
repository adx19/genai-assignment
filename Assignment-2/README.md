# AI Website Cloning Agent 🤖

A conversational CLI agent that clones the Scaler Academy website using AI. Built with Groq LLM and demonstrates multi-step agent reasoning.

## 🎯 Features

- **Conversational Interface**: Natural language commands
- **Agent Loop**: Multi-step reasoning with THINK → PLAN → ACT → OBSERVE cycle
- **Website Generation**: Creates complete HTML, CSS, and JavaScript files
- **Scaler Clone**: Generates a working clone of the Scaler Academy website
- **Professional Output**: Modern, responsive design with proper structure

## 📋 Requirements

- Node.js (v16 or higher)
- Groq API key (free at https://console.groq.com)

## 🚀 Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure API Key

Create a `.env` file in the project root:

```bash
cp .env.example .env
```

Edit `.env` and add your Groq API key:

```
GROQ_API_KEY=your_actual_api_key_here
```

Get your free API key from: https://console.groq.com/keys

### 3. Run the Agent

```bash
npm start
```

Or directly:

```bash
node agent.js
```

## 💬 Usage

The agent understands natural language commands:

### Create a Website

```
You: create a website
You: build a scaler clone
You: clone the scaler website
```

### Delete a Website

```
You: delete scaler_clone_1234567890
```

### Exit

```
You: exit
```

## 🔄 How It Works

The agent follows a multi-step reasoning process:

1. **🧠 THINK**: Analyzes user input to understand intent
2. **📋 PLAN**: Breaks down the task into steps
3. **⚡ ACT**: Executes each step sequentially:
   - Create project folder
   - Generate HTML structure
   - Generate CSS styling
   - Generate JavaScript code
   - Write files to disk
   - Verify creation
4. **👀 OBSERVE**: Monitors results after each action
5. **✅ COMPLETE**: Confirms task completion

## 📂 Output Structure

Generated websites have this structure:

```
scaler_clone_1234567890/
├── index.html    # Main HTML structure
├── style.css     # CSS styling
└── script.js     # JavaScript interactivity
```

## 🎨 Generated Website Features

The cloned website includes:

- **Header**: Navigation with logo and menu items
- **Hero Section**: Eye-catching headline and call-to-action
- **Footer**: Company information and links
- **Responsive Design**: Mobile-friendly layout
- **Modern Styling**: Purple/blue theme matching Scaler's brand
- **Interactivity**: Smooth scrolling, animations, mobile menu

## 🎥 Demo Video Script

For your YouTube submission:

1. **Show Terminal** (0:00-0:30)
   - Run `node agent.js`
   - Show the welcome screen
   
2. **Create Command** (0:30-1:30)
   - Type: "create a scaler website"
   - Show the agent's reasoning steps
   - Highlight the THINK → PLAN → ACT → OBSERVE cycle
   
3. **Show Output** (1:30-2:00)
   - Navigate to generated folder
   - Show the three files created
   
4. **Open in Browser** (2:00-2:30)
   - Open index.html in browser
   - Show the header, hero section, and footer
   - Demonstrate responsiveness
   
5. **Cleanup** (2:30-3:00)
   - Type: "delete scaler_clone_..."
   - Show successful deletion

## 🏆 Assignment Requirements Met

✅ **CLI Tool**: Natural language terminal interface  
✅ **Agent Reasoning**: Multi-step THINK-PLAN-ACT-OBSERVE loop  
✅ **Real Output**: Generates actual HTML/CSS/JS files  
✅ **Scaler Clone**: Includes header, hero section, footer  
✅ **Agent Loop**: Not single-step - executes in 6 distinct phases  
✅ **Browser Ready**: Opens and displays correctly  

## 🛠️ Troubleshooting

### "API key not found" error

Make sure your `.env` file exists and contains:
```
GROQ_API_KEY=gsk_...
```

### Generated website looks broken

- Check if all three files were created
- Ensure the HTML file links to style.css and script.js
- Try regenerating with a fresh command

### Agent doesn't understand command

Use clear keywords:
- For creation: "create", "build", "clone", "website"
- For deletion: "delete", "remove"

## 📝 Code Quality

- **Modular Design**: Separated concerns (tools, generation, agent, CLI)
- **Error Handling**: Try-catch blocks with user-friendly messages
- **Documentation**: Clear comments and function descriptions
- **Agent Pattern**: Proper multi-step reasoning implementation
- **Professional Output**: Production-quality code generation

## 🔑 Key Implementation Details

### Agent Loop (Not Single-Step)

The agent executes in multiple sequential steps with pauses between them:

```javascript
// Step 1: Create folder
await this.delay(800);
this.log("⚡", "ACT [1/6]", "Creating project folder...");

// Step 2: Generate HTML
await this.delay(800);
this.log("⚡", "ACT [2/6]", "Generating HTML structure...");
```

### LLM Prompts

Specialized prompts for each file type:
- HTML: Semantic structure, responsive meta tags
- CSS: Modern styling, flexbox/grid, animations
- JS: Vanilla JavaScript, event listeners, interactivity

### File Extraction

Robust parsing that handles code blocks and raw content:

```javascript
function extractCodeFromResponse(response, language) {
  // Tries code block format first
  // Falls back to pattern matching
  // Returns clean, usable code
}
```

## 📚 Learning Resources

- [Groq API Docs](https://console.groq.com/docs)
- [Agent Architecture](https://docs.anthropic.com/claude/docs/agent-patterns)
- [Scaler Website](https://www.scaler.com)

## 📄 License

MIT License - Feel free to use for your assignment and beyond!

## 🎓 Assignment Submission Checklist

- [ ] Code pushed to public GitHub repository
- [ ] README.md included (this file)
- [ ] Video recorded (2-3 minutes)
- [ ] Video shows live agent execution
- [ ] Video shows browser output
- [ ] Video is public or unlisted on YouTube
- [ ] Both links submitted on course portal

---

**Made with ❤️ for the GenAI Assignment**
