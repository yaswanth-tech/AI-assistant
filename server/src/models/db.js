const mongoose = require('mongoose');

let isMongoConnected = false;
const inMemoryStore = {
  conversations: [],
  appointments: [
    {
      _id: 'apt-sample-1',
      studentName: 'Alex Johnson',
      email: 'alex@live.mdx.ac.mu',
      department: 'Admissions Office',
      purpose: 'Course Entry Verification',
      dateTime: new Date(Date.now() + 86400000).toISOString(),
      status: 'Confirmed',
      createdAt: new Date().toISOString()
    }
  ],
  notifications: [
    {
      _id: 'notif-1',
      title: 'Welcome to Campus Assistant',
      message: 'AI Multi-Agent Campus Assistant is online. Ask about courses, fees, or directions!',
      type: 'info',
      timestamp: new Date().toISOString()
    },
    {
      _id: 'notif-2',
      title: 'Semester Registration Open',
      message: 'International student enrollment and course registration is now open.',
      type: 'announcement',
      timestamp: new Date(Date.now() - 3600000).toISOString()
    }
  ]
};

async function connectDB() {
  const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/campus_assistant';
  try {
    mongoose.set('strictQuery', false);
    await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 2000
    });
    isMongoConnected = true;
    console.log(`[Database] Connected to MongoDB at ${mongoUri}`);
  } catch (err) {
    isMongoConnected = false;
    console.warn(`[Database] MongoDB offline or unreachable (${err.message}). Using resilient in-memory datastore.`);
  }
}

function getStore() {
  return inMemoryStore;
}

function isConnected() {
  return isMongoConnected;
}

module.exports = { connectDB, isConnected, getStore, inMemoryStore };
