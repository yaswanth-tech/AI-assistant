# AI Campus Assistant

[![Stack: MERN](https://img.shields.io/badge/Stack-MERN-green.svg)](https://react.dev)
[![AI: RAG Pipeline](https://img.shields.io/badge/AI-RAG_Pipeline-blue.svg)](https://github.com/yaswanth-tech)
[![Engine: OpenAI & LLaMA2](https://img.shields.io/badge/Engine-OpenAI_%2F_LLaMA2-purple.svg)](https://ollama.ai)
[![Real-Time: WebSocket](https://img.shields.io/badge/RealTime-WebSocket-orange.svg)](https://developer.mozilla.org/en-US/docs/Web/API/WebSocket)
[![Database: MongoDB](https://img.shields.io/badge/Database-MongoDB-brightgreen.svg)](https://www.mongodb.com)
[![Vercel Deployment](https://img.shields.io/badge/Deployment-Vercel_Live-black?logo=vercel)](https://ai-campus-assistant-ten.vercel.app)

**Live Demo**: [https://ai-campus-assistant-ten.vercel.app](https://ai-campus-assistant-ten.vercel.app)  
**GitHub**: [github.com/yaswanth-tech/AI-assistant](https://github.com/yaswanth-tech/AI-assistant)

> **Resume Specification**:
> - **Technologies**: MERN Stack, OpenAI API, LLaMA2, Ollama, WebSocket
> - **Bullet 1**: Built a conversational AI assistant using a RAG pipeline and prompt engineering to provide context-aware support for campus-related queries.
> - **Bullet 2**: Implemented real-time notification pipelines and WebSocket-based multi-agent communication for efficient, real-time information delivery.

---

## 🌟 Key Features

### 1. Conversational AI Assistant & Context-Aware RAG Pipeline
- **TF-IDF & Vector Semantic Search Engine**: Chunks campus corpus documents (admissions, degrees, fee tables, library services, examination schedules, accommodation, campus facilities) and retrieves top-k relevant context chunks by cosine similarity.
- **Dynamic Prompt Engineering**: Implements role-based context injection templates ground truth data into system prompts to eliminate hallucinations.
- **Dual LLM Provider & Hybrid Fallback**:
  - **OpenAI API** (`gpt-3.5-turbo`, `gpt-4o-mini`)
  - **Ollama / LLaMA2** (`http://localhost:11434` with model `llama2`)
  - **Context-Grounded Local Synthesizer** for zero-failure offline execution.

### 2. Multi-Agent WebSocket Architecture
- **Supervisor / Router Agent**: Classifies intent (Admissions, Fees, Navigation, Scheduling, General Academic) and orchestrates task delegation.
- **Admissions & Finance Agent**: Structured query parser for courses, international tuition fees, deposit amounts, and installment plans.
- **Campus Navigation Agent**: Maps campus GPS coordinates, computes directions, and renders the interactive campus map.
- **Academic Appointments Agent**: Handles appointment scheduling with campus faculties, writing directly to MongoDB.
- **Campus Knowledge (RAG) Agent**: Performs semantic retrieval over knowledge base.
- **Step-by-step Deliberation Timeline**: Shows live multi-agent collaborative reasoning steps on the frontend via WebSockets.

### 3. Real-Time Notification Pipeline
- Full-duplex WebSocket broadcaster delivering:
  - Real-time appointment confirmations.
  - Multi-agent activity events.
  - Urgent campus announcements and fee payment deadlines.
- Syncs seamlessly with MongoDB and active connected browser clients.

### 4. Modern React Dashboard (Vite + Tailwind/Custom Glassmorphism)
- **Live Soundwave Visualizer Canvas** for voice recognition (`SpeechRecognition` / Web Speech API).
- **Text-to-Speech (TTS)** voice synthesiser with mute/unmute control.
- **Interactive Campus Map Modal**: Displays campus layout, GPS coordinate pins, and route calculation.
- **Advisory Appointment Scheduler**: Book meetings with Admissions, Computer Science Faculty, Business Faculty, or IT Support Desk.
- **RAG Knowledge Base Explorer**: Diagnostic inspector to test semantic queries and inspect chunk relevance scores.
- **360° Virtual Campus Tour**: Direct link to the official Middlesex University Mauritius 360° virtual tour.

---

## 🏗️ Architecture

```
                                      ┌─────────────────────────────────────┐
                                      │    React 18 Frontend (Vite)         │
                                      │  - Conversational Voice & Text Chat │
                                      │  - Real-time Multi-Agent Drawer     │
                                      │  - Interactive Map & GPS Modal      │
                                      │  - Appointment Booking Interface    │
                                      └──────────────────┬──────────────────┘
                                                         │
                                        WebSocket & REST │ (ws:// & http://)
                                                         ▼
                                      ┌─────────────────────────────────────┐
                                      │       Node.js / Express Server      │
                                      │  - WebSocket Pipeline Broadcast     │
                                      │  - Multi-Agent Orchestrator         │
                                      └───────┬──────────────────────┬──────┘
                                              │                      │
                      ┌───────────────────────┴────────┐             └──────────────────────────┐
                      ▼                                ▼                                        ▼
      ┌─────────────────────────────┐   ┌─────────────────────────────┐          ┌─────────────────────────────┐
      │   Multi-Agent Network       │   │        RAG Pipeline         │          │     Persistent Storage      │
      │ - Supervisor Agent          │   │ - Vector Similarity Engine  │          │ - MongoDB Database          │
      │ - Admissions & Fees Agent   │   │ - TF-IDF Chunk Indexer      │          │ - Mongoose Models:          │
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

## 🚀 Quick Start Guide

### Prerequisites
- **Node.js**: `v20+`
- **MongoDB**: (Optional — local MongoDB on `localhost:27017` is automatically detected; falls back to in-memory store if offline)
- **Ollama / LLaMA2**: (Optional — for local open-source inference)

### 1. Install Dependencies
```bash
# Backend dependencies
cd server
npm install

# Frontend dependencies
cd ../client
npm install
```

### 2. Configure Environment Variables (Optional)
Create `server/.env`:
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/campus_assistant
OPENAI_API_KEY=your-openai-api-key-here
OLLAMA_HOST=http://localhost:11434
OLLAMA_MODEL=llama2
DEFAULT_LLM_PROVIDER=hybrid
```

### 3. Run the Application
From the root directory:
```bash
# Start backend server (serves API, WebSocket, and Production React app on port 5000)
npm start
```
Or run the Vite development server simultaneously:
```bash
# Terminal 1: Backend
npm run server

# Terminal 2: React Frontend (with Hot Reload)
npm run client
```

- **Frontend Application**: [http://localhost:3000](http://localhost:3000) (Vite Dev) or [http://localhost:5000](http://localhost:5000) (Production Build)
- **REST API Endpoints**: [http://localhost:5000/api](http://localhost:5000/api)
- **WebSocket Pipeline**: `ws://localhost:5000/ws`

---

## 📡 REST API Documentation

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/chat` | Send a message through the Multi-Agent RAG pipeline |
| `GET` | `/api/rag/query?q=<query>&k=4` | Diagnostic semantic context retrieval with relevance scores |
| `GET` | `/api/appointments` | Retrieve scheduled advisory appointments |
| `POST` | `/api/appointments` | Book an appointment & broadcast real-time notification |
| `GET` | `/api/notifications` | Fetch recent real-time campus notifications |
| `POST` | `/api/notifications` | Broadcast a new notification to all connected clients |
| `GET` | `/api/locations` | Get campus landmarks, building names & GPS coordinates |
| `GET` | `/api/fees` | Get full international program tuition and installment fee tables |
| `GET` | `/api/config` | System status, MongoDB health, and active LLM configuration |
| `POST` | `/api/config/provider` | Switch active engine (`hybrid`, `openai`, `ollama`) |

---

## 👥 Multi-Agent Roles

1. **Supervisor Agent**: Parses incoming requests, executes intent classification, and performs zero-latency task routing.
2. **Campus Knowledge (RAG) Agent**: Synthesizes responses based on campus guidelines, admissions criteria, and curriculum details.
3. **Admissions & Finance Agent**: Resolves program pricing, deposit prerequisites, and installment timelines.
4. **Campus Navigation Agent**: Pinpoints geospatial coordinates and renders interactive campus radar maps.
5. **Academic Appointments Agent**: Validates student bookings and writes confirmed sessions directly to MongoDB with instant notification dispatch.

---

Developed by **[yaswanth-tech](https://github.com/yaswanth-tech)**.
