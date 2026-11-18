# AI Assistant | Woxsen University & General Intelligence 🎓🤖

[![Stack: MERN](https://img.shields.io/badge/Stack-MERN-green.svg)](https://react.dev)
[![AI: RAG Pipeline](https://img.shields.io/badge/AI-RAG_Pipeline-blue.svg)](https://github.com/yaswanth-tech/AI-assistant)
[![Engine: OpenAI & LLaMA2](https://img.shields.io/badge/Engine-OpenAI_%2F_LLaMA2-purple.svg)](https://ollama.ai)
[![Real-Time: WebSocket](https://img.shields.io/badge/RealTime-WebSocket-orange.svg)](https://developer.mozilla.org/en-US/docs/Web/API/WebSocket)
[![Live Weather: Open--Meteo](https://img.shields.io/badge/Weather-Open--Meteo_Live-yellow.svg)](https://open-meteo.com)
[![Web Search: Live Index](https://img.shields.io/badge/WebSearch-DuckDuckGo_%2F_Wikipedia-red.svg)](https://duckduckgo.com)
[![Database: MongoDB](https://img.shields.io/badge/Database-MongoDB-brightgreen.svg)](https://www.mongodb.com)
[![Vercel Deployment](https://img.shields.io/badge/Deployment-Vercel_Live-black?logo=vercel)](https://ai-campus-assistant-ten.vercel.app)

**Live Demo**: [https://ai-campus-assistant-ten.vercel.app](https://ai-campus-assistant-ten.vercel.app)  
**GitHub Repository**: [https://github.com/yaswanth-tech/AI-assistant](https://github.com/yaswanth-tech/AI-assistant)

---

## 📌 Project Overview (Resume Specification)

> **AI Campus Assistant**  
> **Technologies**: MERN Stack, OpenAI API, LLaMA2, Ollama, WebSocket  
> **GitHub**: [github.com/yaswanth-tech](https://github.com/yaswanth-tech)
> - **Bullet 1**: Built a conversational AI assistant using a RAG pipeline and prompt engineering to provide context-aware support for campus-related queries.
> - **Bullet 2**: Implemented real-time notification pipelines and WebSocket-based multi-agent communication for efficient, real-time information delivery.

**AI Assistant** is a comprehensive, full-stack conversational intelligence platform built on the **MERN** stack (MongoDB, Express, React, Node.js). It seamlessly combines the general-purpose reasoning of **ChatGPT** with deep, specialized capabilities for **Woxsen University** (Hyderabad, India).

Users can ask **ANY** question naturally—ranging from programming, mathematics, science, live weather, and web search, to specialized Woxsen admissions, tuition fee tables, Bloomberg Finance Lab navigation, and faculty advising sessions—without learning rigid keywords or predefined commands.

---

## ✨ Key Features & Capabilities

### 1. 🧠 General-Purpose Intelligence (ChatGPT-Style)
- **Ask Anything Naturally**: Handles queries across software engineering, programming (Python, JavaScript, React, C++, SQL), mathematics, physics, biology, philosophy, creative writing, and daily life.
- **Deep Explanations & Analogies**: Solves complex concepts (e.g., Quantum Computing, Neural Network Backpropagation, Dynamic Programming) with intuitive real-world analogies and LaTeX math.
- **Natural Chit-Chat & Humor**: Greets users warmly, answers casual conversation, tells jokes, and assists with creative brainstorming.

### 2. ☁️ Real-Time Live Weather Integration
- **Live Open-Meteo Satellite API**: Integrates real-time meteorological satellite feeds for **Hyderabad** (or any requested city worldwide).
- **Comprehensive Weather Metrics**: Current temperature in °C and °F, apparent "feels-like" temperature, weather conditions with icons, relative humidity percentage, wind speed, and 3-day daily forecasts.
- **Interactive Weather Card**: Renders high-contrast live weather cards with metric gauges and forecast tiles.

### 3. 🌐 Real-Time Web Search & Verified Citations
- **Live Knowledge Retrieval**: Integrates DuckDuckGo Instant Answers and Wikipedia Knowledge APIs to fetch verified, current facts, breaking technology updates, and news.
- **Citation Chips & Source Links**: Embeds direct URLs and verified source previews into responses to prevent hallucinations on real-time queries.

### 4. 🏫 Specialized Woxsen University Knowledge (RAG Pipeline)
- **Campus Knowledge Corpus**: Grounded knowledge over Woxsen University's 200-acre residential eco-friendly campus in Kamkole, Sadasivpet, Sangareddy District, Hyderabad, Telangana.
- **7 Constituent Schools**:
  - School of Technology (B.Tech in CSE: AI & ML, Data Science, Cyber Security, IoT, Blockchain, Robotics)
  - School of Business (MBA, BBA Hons, Business Analytics, Financial Services)
  - School of Arts & Design (B.Des in Fashion, Interior, Industrial, Communication Design)
  - School of Architecture & Planning (B.Arch, M.Arch)
  - School of Law (BA LLB, BBA LLB, LLM)
  - School of Liberal Arts & Humanities (BA Hons)
  - School of Sciences (B.Sc Hons, Data Science)
- **Fee Structures & Scholarships**: Complete annual tuition, admission fees, and installment schedules in INR, plus Woxsen Merit Scholarships (up to 50% tuition waiver).
- **World-Class Facilities**: Vithal Gandhi Central Library (70,000 sq.ft), Bloomberg Finance Lab (20 terminals), AI & Robotics Lab, Trade Tower Startup Incubator (₹1 Cr seed fund), and "The League" Sports Arena (ICC-standard cricket ground, FIFA football turf, Olympic pool, synthetic tennis courts).

### 5. 🛠️ AI Tool Calling & Interactive UI Cards
The assistant dynamically executes tools to generate rich interactive widgets:
- ☁️ **Live Weather Cards**: Temperature, feels like, humidity, wind, and 3-day forecast.
- 🌐 **Web Search Cards**: Direct answers, source snippets, and external citation links.
- 🗺️ **Campus Map & Google Maps Navigation**: GPS coordinates and direct turn-by-turn walking/driving routes.
- 📅 **Google Calendar Booking & `.ics`**: One-click Google Calendar sync and RFC-5545 `.ics` file downloads.
- ✉️ **Academic Email Drafter**: Professional emails with instant `mailto:` launch and copy actions.
- 📚 **Study Planner**: Structured revision timetables with Pomodoro pacing.
- 📄 **Document Summarizer**: PDF parsing with word counts and bulleted takeaways.
- 💳 **Tuition Fee Cards**: Official fee schedules with deposit terms and installment breakdowns.

### 6. 🗂️ Conversation Memory & Multi-Session History
- **ChatGPT-Style Sidebar**: Start new chats, search past conversations, rename topics, delete individual sessions, or clear all chats.
- **Multi-Turn Context**: Remembers previous questions and maintains context across follow-ups.
- **Dual Persistence**: Stored in **MongoDB** with automatic fallback to an in-memory database.

### 7. 🎙️ Voice Assistant (STT & TTS)
- **Microphone STT**: Instant speech recognition via the Web Speech API with an active soundwave visualizer canvas.
- **AI Voice Responses (TTS)**: Plays AI responses aloud with play/stop controls, speech rate slider, voice selection, and an auto-speak toggle.

### 8. 🎨 Modern Dark/Light Interface
- **Theme Switcher**: Dark and light modes with glassmorphism styling.
- **Markdown & Code Highlighting**: Syntax-highlighted code blocks with one-click copy buttons and GFM tables.
- **Mobile Responsive Drawer**: Fully optimized for mobile screens, tablets, and desktop displays.

---

## 🏗️ System Architecture

```
                                  ┌─────────────────────────────────────┐
                                  │      React 18 Frontend (Vite)       │
                                  │  - ChatGPT-Style Chat & Sidebar     │
                                  │  - Speech STT / TTS & Visualizer    │
                                  │  - Live Weather & Search Cards      │
                                  │  - Google Calendar & Map Modals     │
                                  └──────────────────┬──────────────────┘
                                                     │
                                    WebSocket & REST │ (ws:// & http://)
                                                     ▼
                                  ┌─────────────────────────────────────┐
                                  │       Node.js / Express Server      │
                                  │  - WebSocket Pipeline Broadcaster   │
                                  │  - Multi-Agent Orchestrator         │
                                  │  - Weather & Web Search Services    │
                                  │  - Multer + pdf-parse Document Extr │
                                  └───────┬──────────────────────┬──────┘
                                          │                      │
                  ┌───────────────────────┴────────┐             └──────────────────────────┐
                  ▼                                ▼                                        ▼
  ┌─────────────────────────────┐   ┌─────────────────────────────┐          ┌─────────────────────────────┐
  │   Multi-Agent & Tool Layer  │   │     Woxsen RAG Pipeline     │          │     Persistent Storage      │
  │ - Live Weather Service      │   │ - Vector Cosine Similarity  │          │ - MongoDB Database          │
  │ - Web Search (DuckDuckGo)   │   │ - TF-IDF Chunk Indexer      │          │ - Dual Persistence Models:  │
  │ - Campus Navigation GPS     │   │ - Dynamic Context Injection │          │   Conversations,            │
  │ - Appointments & Calendar   │   │ - 200-Acre Campus Corpus    │          │   Appointments,             │
  │ - Email & Study Planners    │   └──────────────┬──────────────┘          │   Notifications             │
  └──────────────┬──────────────┘                  │                         └─────────────────────────────┘
                 │                                 │
                 └─────────────────┬───────────────┘
                                   ▼
                   ┌───────────────────────────────┐
                   │       LLM Engine Layer        │
                   │ - OpenAI API (GPT-4o-mini)    │
                   │ - Ollama (LLaMA2)             │
                   │ - General AI & Campus Engine  │
                   └───────────────────────────────┘
```

---

## 🚀 Getting Started

### Prerequisites
- **Node.js**: `v20+`
- **npm**: `v9+`
- **MongoDB**: *(Optional)* Automatically connects to `localhost:27017` or falls back seamlessly to an in-memory store.
- **Ollama**: *(Optional)* For running local LLaMA2 inference.

### 1. Clone the Repository
```bash
git clone https://github.com/yaswanth-tech/AI-assistant.git
cd AI-assistant
```

### 2. Install Dependencies
```bash
# Install root dependencies
npm install

# Install client dependencies
npm --prefix client install
```

### 3. Environment Variables (Optional)
Create a `.env` file in `server/.env`:
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/campus_assistant
OPENAI_API_KEY=your-openai-api-key-here
OLLAMA_HOST=http://localhost:11434
OLLAMA_MODEL=llama2
DEFAULT_LLM_PROVIDER=hybrid
```
> **Zero Configuration Required**: Even without an OpenAI API key or Ollama installed, the assistant runs out of the box with full general intelligence, live weather, real web search, and Woxsen University capabilities!

### 4. Run the Project
#### Single Command (Production Server):
```bash
npm start
```
This builds the client and serves the full MERN application, REST API, and WebSocket server on `http://localhost:5000`.

#### Dual Command (Development with Hot Reload):
```bash
# Terminal 1: Backend API & WebSocket
npm run server

# Terminal 2: React Vite Client
npm run client
```

- **Frontend Application**: [http://localhost:3000](http://localhost:3000) (Vite Dev) or [http://localhost:5000](http://localhost:5000)
- **API Endpoints**: [http://localhost:5000/api](http://localhost:5000/api)
- **WebSocket Pipeline**: `ws://localhost:5000/ws`

---

## 📡 REST API Reference

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/chat` | Send a chat message with conversation memory, attachments, and tool calling |
| `GET` | `/api/weather?location=<city>` | Real-time weather, temperature, conditions & 3-day forecast |
| `GET` | `/api/search?q=<query>` | Real-time web search with verified citations and snippets |
| `GET` | `/api/conversations` | Retrieve all saved conversation sessions |
| `GET` | `/api/conversations/:id` | Fetch message history for a specific conversation |
| `POST` | `/api/conversations` | Create a new conversation session |
| `PUT` | `/api/conversations/:id` | Rename a conversation session |
| `DELETE` | `/api/conversations/:id` | Delete a specific conversation session |
| `DELETE` | `/api/conversations` | Clear all conversation sessions |
| `POST` | `/api/upload` | Upload and parse PDF / text document (`multipart/form-data`) |
| `GET` | `/api/appointments` | Retrieve scheduled campus appointments |
| `POST` | `/api/appointments` | Book appointment with Google Calendar link generation |
| `GET` | `/api/appointments/:id/ics` | Download RFC-5545 `.ics` iCalendar file |
| `GET` | `/api/rag/query?q=<query>&k=4` | Semantic RAG retrieval diagnostic with similarity scores |
| `GET` | `/api/locations` | Woxsen campus buildings, coordinates & Google Maps URLs |
| `GET` | `/api/fees` | Program tuition fee and installment schedule tables |
| `GET` | `/api/notifications` | Real-time campus notifications feed |
| `POST` | `/api/notifications` | Broadcast announcement via WebSocket |
| `GET` | `/api/config` | LLM provider status, active models & database health |
| `POST` | `/api/config/provider` | Switch active engine (`hybrid`, `openai`, `ollama`) |

---

## 🌐 Deployment to Vercel

The application is deployed on Vercel with serverless API functions and Vite static builds.

1. **Install Vercel CLI**:
   ```bash
   npm i -g vercel
   ```
2. **Deploy to Production**:
   ```bash
   vercel --prod
   ```

**Live Production URL**: [https://ai-campus-assistant-ten.vercel.app](https://ai-campus-assistant-ten.vercel.app)

---

## 👨‍💻 Author

Developed by **[yaswanth-tech](https://github.com/yaswanth-tech)**  
GitHub Repository: [https://github.com/yaswanth-tech/AI-assistant](https://github.com/yaswanth-tech/AI-assistant)
