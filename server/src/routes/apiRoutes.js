const express = require('express');
const router = express.Router();
const multer = require('multer');
const pdfParse = require('pdf-parse');
const { runAgentPipeline } = require('../agents/agentOrchestrator');
const { retrieveRelevantContexts, campusLocations, internationalFees } = require('../rag/knowledgeBase');
const AppointmentModel = require('../models/Appointment');
const ConversationModel = require('../models/Conversation');
const { sendNotification, getRecentNotifications, broadcast } = require('../services/notificationService');
const { getProviderStatus, setProvider } = require('../services/llmService');
const { isConnected } = require('../models/db');
const { getWeather } = require('../services/weatherService');
const { searchWeb } = require('../services/webSearchService');

// Multer memory storage for file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
});

// ==========================================
// 1. CHAT ENDPOINT (Natural Conversations + Tool Calling)
// ==========================================
router.post('/chat', async (req, res) => {
  try {
    const {
      message,
      conversationId,
      conversationHistory = [],
      provider,
      apiKey,
      attachment
    } = req.body;

    if (!message || typeof message !== 'string') {
      return res.status(400).json({ error: 'Message text is required.' });
    }

    const result = await runAgentPipeline({
      query: message,
      conversationHistory,
      provider: provider || 'hybrid',
      apiKey,
      attachment
    });

    // Auto-save message turn to conversation history if conversationId is provided
    if (conversationId) {
      try {
        const userMsg = {
          id: 'user-' + Date.now(),
          sender: 'user',
          text: message,
          timestamp: new Date(),
          attachment: attachment || null
        };
        const botMsg = {
          id: 'bot-' + (Date.now() + 1),
          sender: 'bot',
          text: result.reply,
          timestamp: new Date(),
          agent: result.agent || 'Campus Assistant',
          model: result.model || 'Campus AI',
          richCard: result.richCard || null,
          steps: result.steps || []
        };

        const existing = await ConversationModel.findById(conversationId);
        const updatedMsgs = existing && existing.messages ? [...existing.messages, userMsg, botMsg] : [userMsg, botMsg];
        const title = existing && existing.title && existing.title !== 'New Conversation'
          ? existing.title
          : message.slice(0, 38).trim() + (message.length > 38 ? '...' : '');

        await ConversationModel.updateMessages(conversationId, updatedMsgs, title);
      } catch (saveErr) {
        console.warn('Could not auto-save conversation turn:', saveErr.message);
      }
    }

    res.json({
      success: true,
      ...result
    });
  } catch (err) {
    console.error('Chat error:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// ==========================================
// 2. CONVERSATION SESSIONS (Memory & Past Chats)
// ==========================================
router.get('/conversations', async (req, res) => {
  try {
    const conversations = await ConversationModel.findAll();
    res.json({ success: true, conversations });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.get('/conversations/:id', async (req, res) => {
  try {
    const conversation = await ConversationModel.findById(req.params.id);
    if (!conversation) {
      return res.status(404).json({ success: false, error: 'Conversation not found.' });
    }
    res.json({ success: true, conversation });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.post('/conversations', async (req, res) => {
  try {
    const { title, conversationId, messages } = req.body;
    const conv = await ConversationModel.create({
      conversationId,
      title: title || 'New Conversation',
      messages: messages || []
    });
    res.json({ success: true, conversation: conv });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.put('/conversations/:id', async (req, res) => {
  try {
    const { messages, title } = req.body;
    let updated;
    if (messages) {
      updated = await ConversationModel.updateMessages(req.params.id, messages, title);
    } else if (title) {
      updated = await ConversationModel.updateTitle(req.params.id, title);
    }
    res.json({ success: true, conversation: updated });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.delete('/conversations/:id', async (req, res) => {
  try {
    await ConversationModel.delete(req.params.id);
    res.json({ success: true, message: 'Conversation deleted.' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.delete('/conversations', async (req, res) => {
  try {
    await ConversationModel.clearAll();
    res.json({ success: true, message: 'All conversations cleared.' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ==========================================
// 3. FILE & PDF UPLOADS (Document Summarization)
// ==========================================
router.post('/upload', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, error: 'No file uploaded.' });
    }

    const { originalname, mimetype, buffer, size } = req.file;
    let extractedText = '';
    let pageCount = null;

    if (mimetype === 'application/pdf' || originalname.toLowerCase().endsWith('.pdf')) {
      const data = await pdfParse(buffer);
      extractedText = data.text || '';
      pageCount = data.numpages || 1;
    } else {
      // Plain text, markdown, json, csv
      extractedText = buffer.toString('utf-8');
    }

    const wordCount = extractedText.split(/\s+/).filter(w => w.length > 0).length;

    res.json({
      success: true,
      filename: originalname,
      mimetype,
      size,
      pageCount,
      wordCount,
      text: extractedText,
      preview: extractedText.slice(0, 500)
    });
  } catch (err) {
    console.error('File parsing error:', err);
    res.status(500).json({ success: false, error: 'Could not parse document: ' + err.message });
  }
});

// ==========================================
// 4. APPOINTMENT BOOKING & CALENDAR
// ==========================================
router.get('/appointments', async (req, res) => {
  try {
    const appointments = await AppointmentModel.find();
    res.json({ success: true, appointments });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.post('/appointments', async (req, res) => {
  try {
    const { studentName, email, department, purpose, dateTime, notes } = req.body;
    if (!department || !dateTime) {
      return res.status(400).json({ error: 'Department and date/time are required.' });
    }

    const appointment = await AppointmentModel.create({
      studentName: studentName || 'Campus Student',
      email: email || 'student@mdx.ac.mu',
      department,
      purpose: purpose || 'Academic Advisory',
      dateTime,
      notes: notes || ''
    });

    // Broadcast real-time notification
    await sendNotification({
      title: 'Appointment Confirmed',
      message: `Meeting with ${department} confirmed for ${new Date(dateTime).toLocaleString()}`,
      type: 'success',
      agent: 'Academic Appointments Agent'
    });

    res.json({ success: true, appointment });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Download .ics calendar file for an appointment
router.get('/appointments/:id/ics', async (req, res) => {
  try {
    const list = await AppointmentModel.find();
    const apt = list.find(a => (a._id && a._id.toString() === req.params.id) || a.id === req.params.id || a._id == req.params.id);
    if (!apt) {
      return res.status(404).send('Appointment not found');
    }
    const icsData = apt.icsData || AppointmentModel.generateICS({
      title: `MDX Advisory: ${apt.department}`,
      start: new Date(apt.dateTime),
      end: new Date(new Date(apt.dateTime).getTime() + 45 * 60 * 1000),
      details: apt.purpose,
      location: 'Middlesex University Mauritius'
    });

    res.setHeader('Content-Type', 'text/calendar; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="appointment-${apt._id}.ics"`);
    res.send(icsData);
  } catch (err) {
    res.status(500).send('Error generating calendar file');
  }
});

// ==========================================
// 5. CAMPUS DATA & NOTIFICATIONS
// ==========================================
router.get('/locations', (req, res) => {
  res.json({ success: true, locations: campusLocations });
});

router.get('/fees', (req, res) => {
  res.json({ success: true, fees: internationalFees });
});

router.get('/rag/query', (req, res) => {
  const query = req.query.q || '';
  const topK = parseInt(req.query.k, 10) || 4;
  const contexts = retrieveRelevantContexts(query, topK);
  res.json({ query, count: contexts.length, contexts });
});

router.get('/notifications', async (req, res) => {
  try {
    const notifications = await getRecentNotifications();
    res.json({ success: true, notifications });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.post('/notifications', async (req, res) => {
  try {
    const { title, message, type, agent } = req.body;
    if (!title || !message) {
      return res.status(400).json({ error: 'Title and message are required.' });
    }
    const notif = await sendNotification({ title, message, type, agent });
    res.json({ success: true, notification: notif });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Weather API Endpoint
router.get('/weather', async (req, res) => {
  try {
    const loc = req.query.location || req.query.q || 'Hyderabad';
    const weather = await getWeather(loc);
    res.json(weather);
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Live Web Search Endpoint
router.get('/search', async (req, res) => {
  try {
    const query = req.query.q || req.query.query || 'Woxsen University';
    const results = await searchWeb(query);
    res.json(results);
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// System telemetry & provider setting
router.get('/config', (req, res) => {
  res.json({
    success: true,
    mongoConnected: isConnected(),
    llm: getProviderStatus(),
    endpoints: {
      ws: '/ws',
      rest: '/api'
    }
  });
});

router.post('/config/provider', (req, res) => {
  const { provider } = req.body;
  setProvider(provider);
  broadcast('system:provider_changed', { provider });
  res.json({ success: true, llm: getProviderStatus() });
});

module.exports = router;
