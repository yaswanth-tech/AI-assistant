const NotificationModel = require('../models/Notification');

const clients = new Set();

function registerClient(ws) {
  clients.add(ws);
}

function removeClient(ws) {
  clients.delete(ws);
}

function broadcast(event, payload) {
  const message = JSON.stringify({ event, payload, timestamp: new Date().toISOString() });
  clients.forEach(client => {
    if (client.readyState === 1) { // 1 = OPEN
      try {
        client.send(message);
      } catch (err) {
        console.error('Failed to send WebSocket message:', err);
      }
    }
  });
}

async function sendNotification({ title, message, type = 'info', agent = 'System' }) {
  const notif = await NotificationModel.create({ title, message, type, agent });
  broadcast('notification:new', notif);
  return notif;
}

async function getRecentNotifications() {
  return await NotificationModel.find({});
}

module.exports = {
  registerClient,
  removeClient,
  broadcast,
  sendNotification,
  getRecentNotifications
};
