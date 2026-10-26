const mongoose = require('mongoose');
const { isConnected, getStore } = require('./db');

const appointmentSchema = new mongoose.Schema({
  studentName: { type: String, default: 'Campus Visitor' },
  email: { type: String, default: 'student@mdx.ac.mu' },
  department: { type: String, required: true },
  purpose: { type: String, default: 'General Academic Inquiry' },
  dateTime: { type: Date, required: true },
  status: { type: String, enum: ['Pending', 'Confirmed', 'Cancelled'], default: 'Confirmed' },
  notes: { type: String, default: '' },
  createdAt: { type: Date, default: Date.now }
});

let MongooseAppointment = null;
try {
  MongooseAppointment = mongoose.model('Appointment', appointmentSchema);
} catch (e) {
  MongooseAppointment = mongoose.models.Appointment;
}

const AppointmentModel = {
  async create(data) {
    if (isConnected() && MongooseAppointment) {
      return await MongooseAppointment.create(data);
    }
    const store = getStore();
    const newApt = {
      _id: 'apt-' + Date.now(),
      studentName: data.studentName || 'Campus Visitor',
      email: data.email || 'student@mdx.ac.mu',
      department: data.department || 'Academic Advisory',
      purpose: data.purpose || 'General Academic Inquiry',
      dateTime: data.dateTime ? new Date(data.dateTime).toISOString() : new Date().toISOString(),
      status: 'Confirmed',
      notes: data.notes || '',
      createdAt: new Date().toISOString()
    };
    store.appointments.unshift(newApt);
    return newApt;
  },

  async find(query = {}) {
    if (isConnected() && MongooseAppointment) {
      return await MongooseAppointment.find(query).sort({ createdAt: -1 }).lean();
    }
    return getStore().appointments;
  }
};

module.exports = AppointmentModel;
