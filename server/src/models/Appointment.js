const mongoose = require('mongoose');
const { isConnected, getStore } = require('./db');

function formatGoogleCalendarDate(dateObj) {
  return dateObj.toISOString().replace(/-|:|\.\d\d\d/g, '');
}

function generateGoogleCalendarUrl({ title, start, end, details, location }) {
  const startStr = formatGoogleCalendarDate(start);
  const endStr = formatGoogleCalendarDate(end);
  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: title,
    dates: `${startStr}/${endStr}`,
    details: details || '',
    location: location || 'Middlesex University Mauritius'
  });
  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

function generateICS({ title, start, end, details, location }) {
  const startStr = formatGoogleCalendarDate(start);
  const endStr = formatGoogleCalendarDate(end);
  const nowStr = formatGoogleCalendarDate(new Date());

  return [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Middlesex University Mauritius//Campus Assistant//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'BEGIN:VEVENT',
    `UID:mdx-apt-${Date.now()}@mdx.ac.mu`,
    `DTSTAMP:${nowStr}`,
    `DTSTART:${startStr}`,
    `DTEND:${endStr}`,
    `SUMMARY:${title}`,
    `DESCRIPTION:${(details || '').replace(/\n/g, '\\n')}`,
    `LOCATION:${location || 'Middlesex University Mauritius, Coastal Road, Cascavelle'}`,
    'STATUS:CONFIRMED',
    'END:VEVENT',
    'END:VCALENDAR'
  ].join('\r\n');
}

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

function enrichAppointment(apt) {
  const startDate = new Date(apt.dateTime);
  const endDate = new Date(startDate.getTime() + 45 * 60 * 1000); // 45 minutes duration

  const eventTitle = `MDX Appointment: ${apt.department}`;
  const eventDetails = `Academic Advisory Session\nStudent: ${apt.studentName} (${apt.email})\nDepartment: ${apt.department}\nTopic: ${apt.purpose}\nNotes: ${apt.notes || 'None'}`;
  const location = 'Middlesex University Mauritius, Cascavelle Campus';

  const googleCalendarUrl = generateGoogleCalendarUrl({
    title: eventTitle,
    start: startDate,
    end: endDate,
    details: eventDetails,
    location
  });

  const icsData = generateICS({
    title: eventTitle,
    start: startDate,
    end: endDate,
    details: eventDetails,
    location
  });

  return {
    ...apt,
    googleCalendarUrl,
    icsData
  };
}

const AppointmentModel = {
  async create(data) {
    const startDate = data.dateTime ? new Date(data.dateTime) : new Date();
    
    let rawApt;
    if (isConnected() && MongooseAppointment) {
      const created = await MongooseAppointment.create({
        studentName: data.studentName || 'Campus Visitor',
        email: data.email || 'student@mdx.ac.mu',
        department: data.department || 'Academic Advisory',
        purpose: data.purpose || 'General Academic Inquiry',
        dateTime: startDate,
        notes: data.notes || '',
        status: 'Confirmed'
      });
      rawApt = created.toObject();
    } else {
      const store = getStore();
      rawApt = {
        _id: 'apt-' + Date.now(),
        studentName: data.studentName || 'Campus Visitor',
        email: data.email || 'student@mdx.ac.mu',
        department: data.department || 'Academic Advisory',
        purpose: data.purpose || 'General Academic Inquiry',
        dateTime: startDate.toISOString(),
        status: 'Confirmed',
        notes: data.notes || '',
        createdAt: new Date().toISOString()
      };
      store.appointments.unshift(rawApt);
    }

    return enrichAppointment(rawApt);
  },

  async find(query = {}) {
    let list = [];
    if (isConnected() && MongooseAppointment) {
      list = await MongooseAppointment.find(query).sort({ dateTime: 1 }).lean();
    } else {
      list = getStore().appointments;
    }
    return list.map(enrichAppointment);
  },

  enrichAppointment,
  generateGoogleCalendarUrl,
  generateICS
};

module.exports = AppointmentModel;
