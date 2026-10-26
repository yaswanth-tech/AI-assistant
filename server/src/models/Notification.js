const mongoose = require('mongoose');
const { isConnected, getStore } = require('./db');

const notificationSchema = new mongoose.Schema({
  title: { type: String, required: true },
  message: { type: String, required: true },
  type: { type: String, enum: ['info', 'alert', 'success', 'announcement', 'agent'], default: 'info' },
  agent: { type: String, default: 'System' },
  timestamp: { type: Date, default: Date.now }
});

let MongooseNotification = null;
try {
  MongooseNotification = mongoose.model('Notification', notificationSchema);
} catch (e) {
  MongooseNotification = mongoose.models.Notification;
}

const NotificationModel = {
  async create(data) {
    if (isConnected() && MongooseNotification) {
      return await MongooseNotification.create(data);
    }
    const store = getStore();
    const newNotif = {
      _id: 'notif-' + Date.now() + '-' + Math.random().toString(36).substr(2, 4),
      title: data.title,
      message: data.message,
      type: data.type || 'info',
      agent: data.agent || 'System',
      timestamp: new Date().toISOString()
    };
    store.notifications.unshift(newNotif);
    if (store.notifications.length > 50) store.notifications.pop();
    return newNotif;
  },

  async find(query = {}) {
    if (isConnected() && MongooseNotification) {
      return await MongooseNotification.find(query).sort({ timestamp: -1 }).limit(20).lean();
    }
    return getStore().notifications;
  }
};

module.exports = NotificationModel;
