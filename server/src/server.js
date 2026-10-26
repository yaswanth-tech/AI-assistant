require('dotenv').config();
const http = require('http');
const path = require('path');
const express = require('express');
const cors = require('cors');
const { WebSocketServer } = require('ws');
const { connectDB } = require('./models/db');
const apiRoutes = require('./routes/apiRoutes');
const { registerClient, removeClient } = require('./services/notificationService');
const { runAgentPipeline } = require('./agents/agentOrchestrator');

const app = express();
const PORT = process.env.PORT || 5000;

// Middlewares
app.use(cors());
app.use(express.json());

// Static resources
app.use('/resources', express.static(path.join(__dirname, '../../client/public/resources')));

// API Routes
app.use('/api', apiRoutes);

// Serve built frontend if exists
const clientDistPath = path.join(__dirname, '../../client/dist');
app.use(express.static(clientDistPath));

app.get('*', (req, res, next) => {
  if (req.path.startsWith('/api') || req.path.startsWith('/ws')) {
    return next();
  }
  const indexPath = path.join(clientDistPath, 'index.html');
  res.sendFile(indexPath, err => {
    if (err) {
      res.json({
        name: 'AI Campus Assistant Backend',
        status: 'Online',
        version: '2.0.0',
        documentation: 'Endpoints available at /api/chat, /api/rag/query, /api/notifications, /api/appointments',
        frontend: 'Start the React client with: cd client && npm run dev'
      });
    }
  });
});

// Create HTTP server
const server = http.createServer(app);

// WebSocket Server for Real-Time Multi-Agent Communication & Notification Pipeline
const wss = new WebSocketServer({ server, path: '/ws' });

wss.on('connection', (ws, req) => {
  console.log('[WebSocket] Client connected from', req.socket.remoteAddress);
  registerClient(ws);

  // Send initial welcome & system status
  ws.send(JSON.stringify({
    event: 'system:ready',
    payload: {
      message: 'Connected to AI Campus Assistant WebSocket Pipeline',
      activeAgents: [
        'Supervisor Agent',
        'Campus Knowledge (RAG) Agent',
        'Admissions & Finance Agent',
        'Campus Navigation Agent',
        'Academic Appointments Agent'
      ],
      timestamp: new Date().toISOString()
    }
  }));

  ws.on('message', async (data) => {
    try {
      const parsed = JSON.parse(data.toString());

      if (parsed.type === 'ping') {
        ws.send(JSON.stringify({ type: 'pong', timestamp: Date.now() }));
        return;
      }

      if (parsed.type === 'chat') {
        const { message, conversationHistory = [], provider = 'hybrid' } = parsed;

        // Stream real-time agent execution steps via WebSocket
        const result = await runAgentPipeline({
          query: message,
          conversationHistory,
          provider,
          onAgentStep: (step) => {
            ws.send(JSON.stringify({
              event: 'agent:step',
              payload: step
            }));
          }
        });

        // Send final response
        ws.send(JSON.stringify({
          event: 'chat:response',
          payload: {
            ...result,
            userMessage: message
          }
        }));
      }
    } catch (err) {
      console.error('[WebSocket] Message handling error:', err);
      ws.send(JSON.stringify({
        event: 'error',
        payload: { message: err.message }
      }));
    }
  });

  ws.on('close', () => {
    console.log('[WebSocket] Client disconnected');
    removeClient(ws);
  });

  ws.on('error', (err) => {
    console.error('[WebSocket] Socket error:', err.message);
    removeClient(ws);
  });
});

// Start Server
async function start() {
  await connectDB();
  server.listen(PORT, () => {
    console.log(`=======================================================`);
    console.log(`🚀 AI Campus Assistant Backend running on port ${PORT}`);
    console.log(`📡 WebSocket Pipeline active at ws://localhost:${PORT}/ws`);
    console.log(`🌐 REST API active at http://localhost:${PORT}/api`);
    console.log(`=======================================================`);
  });
}

if (require.main === module) {
  start();
}

module.exports = { app, server, start };
