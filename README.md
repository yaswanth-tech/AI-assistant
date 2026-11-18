# AI Campus Assistant 🎓🤖

[![Stack: MERN](https://img.shields.io/badge/Stack-MERN-green.svg)](https://react.dev)
[![AI: RAG Pipeline](https://img.shields.io/badge/AI-RAG_Pipeline-blue.svg)](https://github.com/yaswanth-tech/AI-assistant)
[![Engine: OpenAI & LLaMA2](https://img.shields.io/badge/Engine-OpenAI_%2F_LLaMA2-purple.svg)](https://ollama.ai)
[![Real-Time: WebSocket](https://img.shields.io/badge/RealTime-WebSocket-orange.svg)](https://developer.mozilla.org/en-US/docs/Web/API/WebSocket)
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

**AI Campus Assistant** is an intelligent, full-stack conversational AI platform built on the **MERN** stack (MongoDB, Express, React, Node.js) designed to provide 24/7 academic, administrative, and campus life support. It combines a **Retrieval-Augmented Generation (RAG)** pipeline, **multi-agent WebSocket orchestration**, and a ChatGPT-style modern interface featuring conversation memory, voice recognition, Google Calendar/Maps integrations, document analysis, and academic productivity tools.

---

## ✨ Key Features & Capabilities

### 1. 🧠 Smart Conversational AI (No Rigid Keywords)
- **Natural Language Understanding**: Powered by OpenAI (`gpt-4o-mini`, `gpt-3.5-turbo`) and local open-source models (**LLaMA2** via **Ollama**), plus an intelligent grounded fallback engine.
- **Dynamic Prompt Engineering**: Injects campus truth and context dynamically into system prompts to eliminate hallucinations and deliver precise, context-aware answers.
- **Tool Calling & Interactive Cards**: The AI dynamically invokes tools to generate rich UI cards:
  - 🗺️ **Interactive Campus Maps & Google Maps Directions**
  - 📅 **Google Calendar Booking URLs & `.ics` Downloads**
  - ✉️ **Academic Email Drafting**
  - 📚 **Personalized Study Plans**
  - 📄 **Document Summarization Cards**
  - 💳 **Tuition Fee & Installment Breakdowns**

### 2. 🗂️ Conversation Memory & Session History
- **Multi-Session Management**: Start new chats, switch between past conversations, rename topics, or delete individual chats.
- **Context-Aware Follow-ups**: The AI maintains multi-turn conversation memory, allowing users to ask follow-up questions seamlessly (e.g., *"Can you draft an email to the admissions officer about the fees we just discussed?"*).
- **Dual Persistence**: Stored reliably in **MongoDB** with an automatic in-memory fallback for zero-configuration local runs.

### 3. 🎙️ Voice Assistant (Speech-to-Text & Text-to-Speech)
- **Microphone STT**: Instant speech recognition via the Web Speech API with a dynamic soundwave visualizer canvas.
- **Natural AI Speech (TTS)**: Plays AI responses aloud using browser speech synthesis, complete with play/pause controls, voice rate adjustments, accent selection, and an auto-speak toggle.

### 4. 🏫 Comprehensive Campus Knowledge (RAG Engine)
- **TF-IDF & Cosine Similarity Engine**: Chunks campus corpus documents (admissions, degrees, fee tables, library services, examination schedules, accommodation, campus facilities) and retrieves top-*k* relevant context chunks.
- Covers **Middlesex University Mauritius** undergraduate and postgraduate programs, tuition fees in MUR, scholarship criteria, faculty contacts, academic calendars, and campus facilities.
- **RAG Knowledge Base Explorer**: Built-in visual diagnostic inspector to search documents and inspect chunk similarity scores in real time.

### 5. 🌐 Google Integrations
- **Google Maps Navigation**: Instant links to live Google Maps turn-by-turn walking and driving directions for every campus landmark (Admissions, IT Labs, Library, Cafeteria, Sports Complex).
- **Google Calendar Scheduling**: One-click **Add to Google Calendar** event URLs + standard RFC-5545 **`.ics` calendar file downloads** for Apple Calendar, Outlook, and Google Calendar.

### 6. 📄 Document Upload & Summarization
- Upload PDF or text documents (syllabi, lecture notes, admission letters).
- Text parsed via `pdf-parse` on the backend, summarized into key takeaways, and indexed for immediate conversational inquiry.

### 7. 🛠️ Academic Productivity Suite
- **Email Drafter**: Quickly compose formal academic emails to professors, registrars, or finance departments with one-click `mailto:` launch or chat insertion.
- **Study Planner**: Generates structured, week-by-week study milestones, revision strategies, and daily checklists for any module.
- **360° Virtual Campus Tour**: Direct link to the official interactive campus tour.

### 8. 🎨 Modern ChatGPT-Style UI & Theming
- **Dark & Light Mode**: Seamless theme switching with high-contrast, modern glassmorphism styling.
- **Markdown & Code Rendering**: Full GitHub Flavored Markdown (GFM) support with syntax-highlighted code blocks, tables, and one-click copy buttons.
- **Responsive Drawer**: Fully optimized for mobile screens, tablets, and desktop displays.

---

## 🏗️ System Architecture

```
                                  ┌─────────────────────────────────────┐
                                  │      React 18 Frontend (Vite)       │
                                  │  - ChatGPT-Style Chat & Sidebar     │
                                  │  - Speech STT / TTS & Visualizer    │
                                  │  - PDF Upload & Document Analyzer   │
                                  │  - Google Calendar & Map Modals     │
                                  └──────────────────┬──────────────────┘
                                                     │
                                    WebSocket & REST │ (ws:// & http://)
                                                     ▼
                                  ┌─────────────────────────────────────┐
                                  │       Node.js / Express Server      │
                                  │  - WebSocket Pipeline Broadcaster   │
                                  │  - Multi-Agent Orchestrator         │
                                  │  - Multer + pdf-parse Document Extr │
                                  └───────┬──────────────────────┬──────┘
                                          │                      │
                  ┌───────────────────────┴────────┐             └──────────────────────────┐
                  ▼                                ▼                                        ▼
  ┌─────────────────────────────┐   ┌─────────────────────────────┐          ┌─────────────────────────────┐
  │   Multi-Agent Network       │   │        RAG Pipeline         │          │     Persistent Storage      │
  │ - Supervisor Agent          │   │ - Vector Similarity Engine  │          │ - MongoDB Database          │
  │ - Admissions & Fees Agent   │   │ - TF-IDF Chunk Indexer      │          │ - Dual Persistence Models:  │
  │ - Navigation GPS Agent      │   │ - Context Injection Engine  │          │   Conversations,            │
  │ - Appointments Agent        │   │ - Campus Knowledge Corpus   │          │   Appointments,             │
  │ - RAG Knowledge Agent       │   └──────────────┬──────────────┘          │   Notifications             │
  └──────────────┬──────────────┘                  │                         └─────────────────────────────┘
                 │                                 │
                 └─────────────────┬───────────────┘
                                   ▼
                   ┌───────────────────────────────┐
                   │       LLM Engine Layer        │
                   │ - OpenAI API (GPT-3.5/4o)     │
                   │ - Ollama (LLaMA2)             │
                   │ - Context Grounded Fallback   │
                   └───────────────────────────────┘
```

---

## 👥 Multi-Agent WebSocket Architecture

1. **Supervisor / Router Agent**: Analyzes user intent, checks context history, and delegates subtasks with zero latency.
2. **Campus Knowledge (RAG) Agent**: Performs semantic retrieval across campus guides, admissions guidelines, and student handbooks.
3. **Admissions & Finance Agent**: Resolves international/domestic fee tables, deposit requirements, and installment plans.
4. **Campus Navigation Agent**: Pinpoints geospatial coordinates and renders interactive campus radar maps with direct Google Maps routes.
5. **Academic Appointments Agent**: Validates advisor availability and writes bookings directly to MongoDB while generating Google Calendar links and `.ics` files.

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
Create a `.env` file in `server/.env` (or configure in your deployment dashboard):
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/campus_assistant
OPENAI_API_KEY=your-openai-api-key-here
OLLAMA_HOST=http://localhost:11434
OLLAMA_MODEL=llama2
DEFAULT_LLM_PROVIDER=hybrid
```
> **Note**: Even without an OpenAI API key or Ollama installed, the assistant runs out of the box using its built-in context-grounded AI engine!

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
| `POST` | `/api/chat` | Send a chat message with conversation memory and attachment support |
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
| `GET` | `/api/locations` | Campus buildings, coordinates & Google Maps URLs |
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
3. **Environment Variables on Vercel**:
   In your Vercel Project Settings > Environment Variables:
   - `OPENAI_API_KEY`: *(Optional)* Your OpenAI API Key.
   - `MONGODB_URI`: *(Optional)* Your MongoDB Atlas connection URI.

**Live Vercel URL**: [https://ai-campus-assistant-ten.vercel.app](https://ai-campus-assistant-ten.vercel.app)

---

## 👨‍💻 Author

Developed by **[yaswanth-tech](https://github.com/yaswanth-tech)**  
GitHub Repository: [https://github.com/yaswanth-tech/AI-assistant](https://github.com/yaswanth-tech/AI-assistant)
