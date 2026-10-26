const express = require('express');
const router = express.Router();
const { runAgentPipeline } = require('../agents/agentOrchestrator');
const { retrieveRelevantContexts, campusLocations, internationalFees } = require('../rag/knowledgeBase');
const AppointmentModel = require('../models/Appointment');
const { sendNotification, getRecentNotifications, broadcast } = require('../services/notificationService');
const { getProviderStatus, setProvider } = require('../services/llmService');
const { isConnected } = require('../models/db');

// Main Chat Endpoint (HTTP)
router.post('/chat', async (req, res) => {
  try {
    const { message, conversationHistory = [], provider } = req.body;
    if (!message || typeof message !== 'string') {
      return res.status(400).json({ error: 'Message is required.' });
    }

    const result = await runAgentPipeline({
      query: message,
      conversationHistory,
      provider: provider || 'hybrid'
    });

    res.json({
      success: true,
      ...result
    });
  } catch (err) {
    console.error('Chat error:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// Diagnostic RAG Retrieval Query
router.get('/rag/query', (req, res) => {
  const query = req.query.q || '';
  const topK = parseInt(req.query.k, 10) || 4;
  const contexts = retrieveRelevantContexts(query, topK);
  res.json({
    query,
    count: contexts.length,
    contexts
  });
});

// Appointments
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
      studentName: studentName || 'Campus Visitor',
      email: email || 'student@mdx.ac.mu',
      department,
      purpose: purpose || 'Advisory Meeting',
      dateTime,
      notes: notes || ''
    });

    // Dispatch real-time WebSocket notification pipeline
    await sendNotification({
      title: 'Appointment Booked',
      message: `Confirmed meeting with ${department} on ${new Date(dateTime).toLocaleString()}`,
      type: 'success',
      agent: 'Academic Appointments Agent'
    });

    res.json({ success: true, appointment });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Real-Time Notifications
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

// Campus Locations & Fees
router.get('/locations', (req, res) => {
  res.json({ success: true, locations: campusLocations });
});

router.get('/fees', (req, res) => {
  res.json({ success: true, fees: internationalFees });
});

// System Status & LLM Provider Settings
router.get('/config', (req, res) => {
  res.json({
    success: true,
    mongoConnected: isConnected(),
    llm: getProviderStatus(),
    endpoints: {
      ws: 'ws://localhost:5000/ws',
      rest: 'http://localhost:5000/api'
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
