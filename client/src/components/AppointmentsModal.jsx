import React, { useState, useEffect } from 'react';
import { Calendar, Clock, CheckCircle2, X, Plus, ExternalLink, Download } from 'lucide-react';

export default function AppointmentsModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [latestConfirmed, setLatestConfirmed] = useState(null);

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
        setLatestConfirmed(data.appointment);
        setFormData({
          studentName: '',
          email: '',
          department: 'Admissions Office',
          purpose: '',
          dateTime: '',
          notes: ''
        });
        fetchAppointments();
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
      zIndex: 110,
      padding: '20px'
    }}>
      <div style={{
        width: '100%',
        maxWidth: '860px',
        maxHeight: '90vh',
        background: 'var(--bg-card)',
        color: 'var(--text-primary)',
        borderRadius: '16px',
        border: '1px solid var(--border-subtle)',
        boxShadow: 'var(--shadow-subtle)',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden'
      }}>
        {/* Header */}
        <div style={{
          padding: '16px 20px',
          borderBottom: '1px solid var(--border-subtle)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: 'var(--bg-header)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: '32px',
              height: '32px',
              borderRadius: '8px',
              background: 'rgba(16, 185, 129, 0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#10b981'
            }}>
              <Calendar size={18} />
            </div>
            <div>
              <h2 style={{ fontSize: '15px', fontWeight: '700' }}>
                Academic Advisory & Staff Appointment Scheduling
              </h2>
              <p style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                Integrated with Google Calendar & Real-Time Sync
              </p>
            </div>
          </div>

          <button onClick={onClose} style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
            <X size={18} />
          </button>
        </div>

        {/* Latest Confirmed Notification Pill */}
        {latestConfirmed && (
          <div style={{
            background: 'rgba(16, 185, 129, 0.12)',
            borderBottom: '1px solid rgba(16, 185, 129, 0.3)',
            padding: '12px 20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '10px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#10b981', fontSize: '12.5px', fontWeight: '600' }}>
              <CheckCircle2 size={16} />
              Confirmed: Meeting with {latestConfirmed.department} on {new Date(latestConfirmed.dateTime).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}
            </div>

            <div style={{ display: 'flex', gap: '8px' }}>
              {latestConfirmed.googleCalendarUrl && (
                <a
                  href={latestConfirmed.googleCalendarUrl}
                  target="_blank"
                  rel="noreferrer"
                  style={{
                    padding: '6px 12px',
                    borderRadius: '6px',
                    background: '#10b981',
                    color: 'white',
                    fontSize: '11.5px',
                    fontWeight: '600',
                    textDecoration: 'none',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}
                >
                  <ExternalLink size={12} /> Add to Google Calendar
                </a>
              )}
              <a
                href={`/api/appointments/${latestConfirmed._id || latestConfirmed.id}/ics`}
                download="appointment.ics"
                style={{
                  padding: '6px 12px',
                  borderRadius: '6px',
                  background: 'var(--bg-input)',
                  border: '1px solid var(--border-subtle)',
                  color: 'var(--text-primary)',
                  fontSize: '11.5px',
                  fontWeight: '600',
                  textDecoration: 'none',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px'
                }}
              >
                <Download size={12} /> Download .ics
              </a>
            </div>
          </div>
        )}

        {/* Content Split: Booking Form & Active Schedules */}
        <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
          {/* Booking Form */}
          <div style={{ flex: 1, padding: '20px', overflowY: 'auto', borderRight: '1px solid var(--border-subtle)' }}>
            <h3 style={{ fontSize: '13px', fontWeight: '700', marginBottom: '14px', color: 'var(--text-primary)' }}>
              Book New Advising Session
            </h3>

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div>
                <label style={{ fontSize: '11px', fontWeight: '700', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>
                  Student Full Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Alex Morgan"
                  value={formData.studentName}
                  onChange={(e) => setFormData({ ...formData, studentName: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    borderRadius: '8px',
                    border: '1px solid var(--border-subtle)',
                    background: 'var(--bg-input)',
                    color: 'var(--text-primary)',
                    fontSize: '13px',
                    outline: 'none'
                  }}
                />
              </div>

              <div>
                <label style={{ fontSize: '11px', fontWeight: '700', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>
                  Student Email
                </label>
                <input
                  type="email"
                  required
                  placeholder="e.g. alex@live.mdx.ac.mu"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    borderRadius: '8px',
                    border: '1px solid var(--border-subtle)',
                    background: 'var(--bg-input)',
                    color: 'var(--text-primary)',
                    fontSize: '13px',
                    outline: 'none'
                  }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ fontSize: '11px', fontWeight: '700', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>
                    Department
                  </label>
                  <select
                    value={formData.department}
                    onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '8px 10px',
                      borderRadius: '8px',
                      border: '1px solid var(--border-subtle)',
                      background: 'var(--bg-input)',
                      color: 'var(--text-primary)',
                      fontSize: '12.5px',
                      outline: 'none'
                    }}
                  >
                    <option value="Admissions Office">Admissions Office</option>
                    <option value="Computer Science Faculty">Computer Science Faculty</option>
                    <option value="Business & Law Faculty">Business & Law Faculty</option>
                    <option value="Student Finance & Visa">Student Finance & Visa</option>
                    <option value="IT Support Desk">IT Support Desk</option>
                    <option value="Career & Wellness Counselling">Career & Wellness Counselling</option>
                  </select>
                </div>

                <div>
                  <label style={{ fontSize: '11px', fontWeight: '700', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>
                    Date & Time
                  </label>
                  <input
                    type="datetime-local"
                    required
                    value={formData.dateTime}
                    onChange={(e) => setFormData({ ...formData, dateTime: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '8px 10px',
                      borderRadius: '8px',
                      border: '1px solid var(--border-subtle)',
                      background: 'var(--bg-input)',
                      color: 'var(--text-primary)',
                      fontSize: '12.5px',
                      outline: 'none'
                    }}
                  />
                </div>
              </div>

              <div>
                <label style={{ fontSize: '11px', fontWeight: '700', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>
                  Discussion Purpose / Module
                </label>
                <input
                  type="text"
                  placeholder="e.g. Course entry requirements, dissertation progress"
                  value={formData.purpose}
                  onChange={(e) => setFormData({ ...formData, purpose: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    borderRadius: '8px',
                    border: '1px solid var(--border-subtle)',
                    background: 'var(--bg-input)',
                    color: 'var(--text-primary)',
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
                  background: 'var(--accent-gradient)',
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
                <Plus size={16} /> {submitting ? 'Confirming...' : 'Confirm Advisory Session'}
              </button>
            </form>
          </div>

          {/* Booked Appointments List */}
          <div style={{ width: '320px', background: 'var(--bg-sidebar)', padding: '20px', overflowY: 'auto' }}>
            <h3 style={{ fontSize: '13px', fontWeight: '700', marginBottom: '14px', color: 'var(--text-primary)' }}>
              Scheduled Sessions ({appointments.length})
            </h3>

            {loading ? (
              <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Loading sessions...</div>
            ) : appointments.length === 0 ? (
              <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>No appointments scheduled yet.</div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {appointments.map((apt, index) => (
                  <div
                    key={apt._id || index}
                    style={{
                      background: 'var(--bg-card)',
                      borderRadius: '8px',
                      padding: '12px',
                      border: '1px solid var(--border-subtle)'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '13px', fontWeight: '700', color: 'var(--text-primary)' }}>
                        {apt.studentName}
                      </span>
                      <span style={{ fontSize: '10px', background: 'rgba(16, 185, 129, 0.15)', color: '#10b981', padding: '2px 6px', borderRadius: '4px', fontWeight: '700' }}>
                        {apt.status || 'Confirmed'}
                      </span>
                    </div>

                    <div style={{ fontSize: '11px', color: 'var(--accent)', fontWeight: '600', marginTop: '4px' }}>
                      {apt.department}
                    </div>

                    <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>
                      {apt.purpose}
                    </div>

                    <div style={{ fontSize: '10px', color: 'var(--text-muted)', marginTop: '6px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Clock size={11} />
                      {new Date(apt.dateTime).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </div>

                    {apt.googleCalendarUrl && (
                      <div style={{ marginTop: '8px', paddingTop: '6px', borderTop: '1px solid var(--border-subtle)', display: 'flex', gap: '6px' }}>
                        <a
                          href={apt.googleCalendarUrl}
                          target="_blank"
                          rel="noreferrer"
                          style={{
                            fontSize: '10.5px',
                            color: '#10b981',
                            fontWeight: '600',
                            textDecoration: 'none',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '3px'
                          }}
                        >
                          <Calendar size={11} /> Google Calendar
                        </a>
                      </div>
                    )}
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
