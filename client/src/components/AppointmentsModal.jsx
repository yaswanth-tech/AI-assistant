import React, { useState, useEffect } from 'react';
import { Calendar, Clock, User, Mail, Building2, CheckCircle2, X, Plus } from 'lucide-react';

export default function AppointmentsModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  const [formData, setFormData] = useState({
    studentName: '',
    email: '',
    department: 'Admissions Office',
    purpose: '',
    dateTime: '',
    notes: ''
  });

  const fetchAppointments = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/appointments');
      const data = await res.json();
      if (data.success) {
        setAppointments(data.appointments || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, [isOpen]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.dateTime || !formData.department) return;

    setSubmitting(true);
    try {
      const res = await fetch('/api/appointments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      const data = await res.json();
      if (data.success) {
        setSuccessMsg('Appointment confirmed successfully! Notification broadcasted to real-time pipeline.');
        setFormData({
          studentName: '',
          email: '',
          department: 'Admissions Office',
          purpose: '',
          dateTime: '',
          notes: ''
        });
        fetchAppointments();
        setTimeout(() => setSuccessMsg(''), 4000);
      }
    } catch (err) {
      alert('Error booking appointment: ' + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      background: 'rgba(0, 0, 0, 0.75)',
      backdropFilter: 'blur(8px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 100,
      padding: '20px'
    }}>
      <div style={{
        width: '100%',
        maxWidth: '850px',
        maxHeight: '85vh',
        background: '#0f172a',
        borderRadius: '16px',
        border: '1px solid rgba(255, 255, 255, 0.12)',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.7)',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden'
      }}>
        {/* Header */}
        <div style={{
          padding: '16px 20px',
          borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: 'rgba(15, 23, 42, 0.9)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: '32px',
              height: '32px',
              borderRadius: '8px',
              background: 'rgba(16, 185, 129, 0.2)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Calendar size={18} color="#10b981" />
            </div>
            <div>
              <h2 style={{ fontSize: '15px', fontWeight: '700', color: '#f8fafc' }}>
                Academic Advisory & Staff Appointment Scheduling
              </h2>
              <p style={{ fontSize: '11px', color: '#94a3b8' }}>
                Directly synced with MongoDB and WebSocket Pipeline
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            style={{
              background: 'rgba(255, 255, 255, 0.05)',
              border: 'none',
              borderRadius: '8px',
              padding: '6px',
              color: '#94a3b8',
              cursor: 'pointer'
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Success Alert */}
        {successMsg && (
          <div style={{
            background: 'rgba(16, 185, 129, 0.15)',
            borderBottom: '1px solid rgba(16, 185, 129, 0.3)',
            padding: '10px 20px',
            color: '#34d399',
            fontSize: '12px',
            fontWeight: '600',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <CheckCircle2 size={16} /> {successMsg}
          </div>
        )}

        {/* Content Split */}
        <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
          {/* Booking Form */}
          <div style={{ flex: 1, padding: '20px', overflowY: 'auto', borderRight: '1px solid rgba(255, 255, 255, 0.08)' }}>
            <h3 style={{ fontSize: '13px', fontWeight: '700', color: '#e2e8f0', marginBottom: '14px' }}>
              Schedule New Advisory Session
            </h3>

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div>
                <label style={{ fontSize: '11px', fontWeight: '600', color: '#94a3b8', display: 'block', marginBottom: '4px' }}>
                  Student Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Alex Morgan"
                  value={formData.studentName}
                  onChange={e => setFormData({ ...formData, studentName: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    borderRadius: '8px',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    background: 'rgba(30, 41, 59, 0.6)',
                    color: '#f8fafc',
                    fontSize: '13px',
                    outline: 'none'
                  }}
                />
              </div>

              <div>
                <label style={{ fontSize: '11px', fontWeight: '600', color: '#94a3b8', display: 'block', marginBottom: '4px' }}>
                  Student Email
                </label>
                <input
                  type="email"
                  required
                  placeholder="e.g. alex@live.mdx.ac.mu"
                  value={formData.email}
                  onChange={e => setFormData({ ...formData, email: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    borderRadius: '8px',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    background: 'rgba(30, 41, 59, 0.6)',
                    color: '#f8fafc',
                    fontSize: '13px',
                    outline: 'none'
                  }}
                />
              </div>

              <div style={{ display: 'flex', gap: '12px' }}>
                <div style={{ flex: 1 }}>
                  <label style={{ fontSize: '11px', fontWeight: '600', color: '#94a3b8', display: 'block', marginBottom: '4px' }}>
                    Department
                  </label>
                  <select
                    value={formData.department}
                    onChange={e => setFormData({ ...formData, department: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      borderRadius: '8px',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      background: 'rgba(30, 41, 59, 0.6)',
                      color: '#f8fafc',
                      fontSize: '13px',
                      outline: 'none'
                    }}
                  >
                    <option value="Admissions Office" style={{ background: '#0f172a' }}>Admissions Office</option>
                    <option value="Computer Science Faculty" style={{ background: '#0f172a' }}>Computer Science Faculty</option>
                    <option value="Business & Law Faculty" style={{ background: '#0f172a' }}>Business & Law Faculty</option>
                    <option value="Student Finance & Visa" style={{ background: '#0f172a' }}>Student Finance & Visa</option>
                    <option value="IT Support Desk" style={{ background: '#0f172a' }}>IT Support Desk</option>
                    <option value="Career & Wellness Counselling" style={{ background: '#0f172a' }}>Career & Wellness Counselling</option>
                  </select>
                </div>

                <div style={{ flex: 1 }}>
                  <label style={{ fontSize: '11px', fontWeight: '600', color: '#94a3b8', display: 'block', marginBottom: '4px' }}>
                    Date & Time
                  </label>
                  <input
                    type="datetime-local"
                    required
                    value={formData.dateTime}
                    onChange={e => setFormData({ ...formData, dateTime: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      borderRadius: '8px',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      background: 'rgba(30, 41, 59, 0.6)',
                      color: '#f8fafc',
                      fontSize: '13px',
                      outline: 'none'
                    }}
                  />
                </div>
              </div>

              <div>
                <label style={{ fontSize: '11px', fontWeight: '600', color: '#94a3b8', display: 'block', marginBottom: '4px' }}>
                  Purpose / Topic
                </label>
                <input
                  type="text"
                  placeholder="e.g. Course entry prerequisites, fee plan questions"
                  value={formData.purpose}
                  onChange={e => setFormData({ ...formData, purpose: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    borderRadius: '8px',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    background: 'rgba(30, 41, 59, 0.6)',
                    color: '#f8fafc',
                    fontSize: '13px',
                    outline: 'none'
                  }}
                />
              </div>

              <button
                type="submit"
                disabled={submitting}
                style={{
                  marginTop: '8px',
                  padding: '10px 16px',
                  borderRadius: '8px',
                  border: 'none',
                  background: 'linear-gradient(135deg, #10b981, #059669)',
                  color: 'white',
                  fontWeight: '600',
                  fontSize: '13px',
                  cursor: submitting ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px'
                }}
              >
                <Plus size={16} /> {submitting ? 'Confirming...' : 'Book Advisory Session'}
              </button>
            </form>
          </div>

          {/* Booked Appointments List */}
          <div style={{ width: '320px', background: 'rgba(15, 23, 42, 0.5)', padding: '20px', overflowY: 'auto' }}>
            <h3 style={{ fontSize: '13px', fontWeight: '700', color: '#e2e8f0', marginBottom: '14px' }}>
              Active Schedules ({appointments.length})
            </h3>

            {loading ? (
              <div style={{ fontSize: '12px', color: '#64748b' }}>Loading schedules...</div>
            ) : appointments.length === 0 ? (
              <div style={{ fontSize: '12px', color: '#64748b' }}>No appointments booked yet.</div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {appointments.map((apt, index) => (
                  <div
                    key={apt._id || index}
                    style={{
                      background: 'rgba(30, 41, 59, 0.6)',
                      borderRadius: '8px',
                      padding: '12px',
                      border: '1px solid rgba(255, 255, 255, 0.06)'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '13px', fontWeight: '700', color: '#f1f5f9' }}>
                        {apt.studentName}
                      </span>
                      <span style={{ fontSize: '10px', background: 'rgba(16, 185, 129, 0.2)', color: '#34d399', padding: '2px 6px', borderRadius: '4px', fontWeight: '600' }}>
                        {apt.status || 'Confirmed'}
                      </span>
                    </div>

                    <div style={{ fontSize: '11px', color: '#818cf8', fontWeight: '600', marginTop: '4px' }}>
                      {apt.department}
                    </div>

                    <div style={{ fontSize: '11px', color: '#94a3b8', marginTop: '3px' }}>
                      {apt.purpose}
                    </div>

                    <div style={{ fontSize: '10px', color: '#64748b', marginTop: '6px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Clock size={12} />
                      {new Date(apt.dateTime).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
