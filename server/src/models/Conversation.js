const mongoose = require('mongoose');
const { isConnected, getStore } = require('./db');

const messageSubSchema = new mongoose.Schema({
  id: { type: String, required: true },
  sender: { type: String, enum: ['user', 'bot'], required: true },
  text: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
  agent: { type: String, default: null },
  model: { type: String, default: null },
  richCard: { type: mongoose.Schema.Types.Mixed, default: null },
  attachment: { type: mongoose.Schema.Types.Mixed, default: null },
  steps: { type: Array, default: [] }
}, { _id: false });

const conversationSchema = new mongoose.Schema({
  conversationId: { type: String, required: true, unique: true, index: true },
  title: { type: String, default: 'New Conversation' },
  messages: [messageSubSchema],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

let MongooseConversation = null;
try {
  MongooseConversation = mongoose.model('Conversation', conversationSchema);
} catch (e) {
  MongooseConversation = mongoose.models.Conversation;
}

const ConversationModel = {
  async create({ conversationId, title = 'New Conversation', messages = [] }) {
    const id = conversationId || 'conv-' + Date.now() + '-' + Math.random().toString(36).substr(2, 5);
    const now = new Date();

    if (isConnected() && MongooseConversation) {
      return await MongooseConversation.create({
        conversationId: id,
        title,
        messages,
        createdAt: now,
        updatedAt: now
      });
    }

    const store = getStore();
    const newConv = {
      _id: id,
      conversationId: id,
      title,
      messages,
      createdAt: now.toISOString(),
      updatedAt: now.toISOString()
    };
    store.conversations.unshift(newConv);
    return newConv;
  },

  async findAll() {
    if (isConnected() && MongooseConversation) {
      return await MongooseConversation.find({}, { messages: { $slice: -1 } })
        .sort({ updatedAt: -1 })
        .lean();
    }
    const store = getStore();
    return store.conversations.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
  },

  async findById(conversationId) {
    if (isConnected() && MongooseConversation) {
      return await MongooseConversation.findOne({ conversationId }).lean();
    }
    const store = getStore();
    return store.conversations.find(c => c.conversationId === conversationId || c._id === conversationId) || null;
  },

  async updateMessages(conversationId, messages, title = null) {
    const now = new Date();
    if (isConnected() && MongooseConversation) {
      const updateData = { messages, updatedAt: now };
      if (title) updateData.title = title;
      return await MongooseConversation.findOneAndUpdate(
        { conversationId },
        { $set: updateData },
        { new: true, upsert: true }
      ).lean();
    }

    const store = getStore();
    let conv = store.conversations.find(c => c.conversationId === conversationId || c._id === conversationId);
    if (conv) {
      conv.messages = messages;
      conv.updatedAt = now.toISOString();
      if (title) conv.title = title;
    } else {
      conv = {
        _id: conversationId,
        conversationId,
        title: title || 'New Conversation',
        messages,
        createdAt: now.toISOString(),
        updatedAt: now.toISOString()
      };
      store.conversations.unshift(conv);
    }
    return conv;
  },

  async updateTitle(conversationId, title) {
    if (isConnected() && MongooseConversation) {
      return await MongooseConversation.findOneAndUpdate(
        { conversationId },
        { $set: { title, updatedAt: new Date() } },
        { new: true }
      ).lean();
    }

    const store = getStore();
    const conv = store.conversations.find(c => c.conversationId === conversationId || c._id === conversationId);
    if (conv) {
      conv.title = title;
      conv.updatedAt = new Date().toISOString();
    }
    return conv;
  },

  async delete(conversationId) {
    if (isConnected() && MongooseConversation) {
      return await MongooseConversation.deleteOne({ conversationId });
    }
    const store = getStore();
    const index = store.conversations.findIndex(c => c.conversationId === conversationId || c._id === conversationId);
    if (index !== -1) {
      store.conversations.splice(index, 1);
      return true;
    }
    return false;
  },

  async clearAll() {
    if (isConnected() && MongooseConversation) {
      return await MongooseConversation.deleteMany({});
    }
    const store = getStore();
    store.conversations = [];
    return true;
  }
};

module.exports = ConversationModel;
