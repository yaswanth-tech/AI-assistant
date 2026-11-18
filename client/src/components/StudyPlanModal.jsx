import React, { useState } from 'react';
import { BookOpen, X, Sparkles, Send, Copy, Check, Clock } from 'lucide-react';

export default function StudyPlanModal({ isOpen, onClose, onSendToChat }) {
  if (!isOpen) return null;

  const [courses, setCourses] = useState('BSc Computer Science - Algorithms & Web Applications');
  const [hoursPerDay, setHoursPerDay] = useState(3);
  const [daysUntilExam, setDaysUntilExam] = useState(14);
  const [goal, setGoal] = useState('First Class / Distinction Mastery');
  const [planGenerated, setPlanGenerated] = useState(null);
  const [copied, setCopied] = useState(false);

  const handleGenerate = (e) => {
    e.preventDefault();

    const planText = `### 📚 Study & Exam Revision Plan\n` +
      `**Target Modules:** ${courses}\n` +
      `**Commitment:** ${hoursPerDay} hours/day over ${daysUntilExam} days\n` +
      `**Goal:** ${goal}\n\n` +
      `#### 🗓️ Weekly Schedule Structure\n` +
      `| Phase | Days | Daily Routine | Milestone Target |\n` +
      `|---|---|---|---|\n` +
      `| **Phase 1: Concept Mastery** | Days 1 - ${Math.round(daysUntilExam * 0.4)} | ${hoursPerDay}h (Pomodoro 50/10) | Deep-dive lecture notes, slides & definitions |\n` +
      `| **Phase 2: Active Recall & Labs** | Days ${Math.round(daysUntilExam * 0.4) + 1} - ${Math.round(daysUntilExam * 0.75)} | ${hoursPerDay}h Practice Sets | Code implementation & past paper question review |\n` +
      `| **Phase 3: Timed Mock Exams** | Days ${Math.round(daysUntilExam * 0.75) + 1} - ${daysUntilExam - 1} | 2h Timed + 1h Review | Full past exam paper under exam hall conditions |\n` +
      `| **Phase 4: Final Consolidation** | Day ${daysUntilExam} (Eve) | 1.5h Light Flashcards | Formula sheet review, sleep 8+ hours |\n\n` +
      `#### 💡 Recommended Campus Resources\n` +
      `- **Campus Library Pods:** Book a quiet pod on the first floor for your 50-minute Pomodoro sessions.\n` +
      `- **Computing & Robotics Labs:** Available on weekdays for practical software testing.\n` +
      `- **Academic Writing & Peer Clinics:** Held weekly for review and citation checks.`;

    setPlanGenerated(planText);
  };

  const handleCopy = () => {
    if (!planText) return;
    navigator.clipboard.writeText(planGenerated);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSendToChat = () => {
    if (!planGenerated) return;
    onSendToChat(`Here is my study goal:\n\n${planGenerated}\n\nCan you give me detailed flashcards and practice test questions for this plan?`);
    onClose();
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
        maxWidth: '680px',
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
          justifyContent: 'space-between'
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
              <BookOpen size={18} />
            </div>
            <div>
              <h2 style={{ fontSize: '15px', fontWeight: '700' }}>Academic Study Planner</h2>
              <p style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Structured exam revision and module pacing</p>
            </div>
          </div>

          <button onClick={onClose} style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
            <X size={18} />
          </button>
        </div>

        {/* Content Body */}
        <div style={{ padding: '20px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {!planGenerated ? (
            <form onSubmit={handleGenerate} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ fontSize: '11px', fontWeight: '700', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>
                  Target Modules / Subject Areas
                </label>
                <input
                  type="text"
                  required
                  value={courses}
                  onChange={(e) => setCourses(e.target.value)}
                  placeholder="e.g. Computer Science, Financial Accounting, Law"
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
                    Daily Study Hours ({hoursPerDay} hrs/day)
                  </label>
                  <input
                    type="range"
                    min="1"
                    max="8"
                    value={hoursPerDay}
                    onChange={(e) => setHoursPerDay(parseInt(e.target.value, 10))}
                    style={{ width: '100%', accentColor: 'var(--accent)' }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: '11px', fontWeight: '700', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>
                    Days Until Exam / Deadline ({daysUntilExam} days)
                  </label>
                  <input
                    type="range"
                    min="3"
                    max="60"
                    value={daysUntilExam}
                    onChange={(e) => setDaysUntilExam(parseInt(e.target.value, 10))}
                    style={{ width: '100%', accentColor: 'var(--accent)' }}
                  />
                </div>
              </div>

              <div>
                <label style={{ fontSize: '11px', fontWeight: '700', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>
                  Academic Target Goal
                </label>
                <select
                  value={goal}
                  onChange={(e) => setGoal(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '8px 10px',
                    borderRadius: '8px',
                    border: '1px solid var(--border-subtle)',
                    background: 'var(--bg-input)',
                    color: 'var(--text-primary)',
                    fontSize: '13px',
                    outline: 'none'
                  }}
                >
                  <option value="First Class / Distinction Mastery">First Class / Distinction (70%+)</option>
                  <option value="Solid Upper Second (2:1)">Solid Upper Second (2:1)</option>
                  <option value="Confidence & Core Concepts (Pass+)">Confidence & Core Concepts (Pass+)</option>
                </select>
              </div>

              <button
                type="submit"
                style={{
                  padding: '10px 16px',
                  borderRadius: '8px',
                  border: 'none',
                  background: 'var(--accent-gradient)',
                  color: 'white',
                  fontWeight: '600',
                  fontSize: '13px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px'
                }}
              >
                <Sparkles size={16} /> Generate Timetable & Revision Routine
              </button>
            </form>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div style={{
                background: 'var(--bg-input)',
                padding: '16px',
                borderRadius: '10px',
                border: '1px solid var(--border-subtle)',
                fontSize: '13px',
                lineHeight: '1.6',
                whiteSpace: 'pre-line',
                color: 'var(--text-primary)'
              }}>
                {planGenerated}
              </div>

              <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                <button
                  onClick={handleCopy}
                  style={{
                    padding: '8px 14px',
                    borderRadius: '8px',
                    border: '1px solid var(--border-subtle)',
                    background: 'transparent',
                    color: 'var(--text-primary)',
                    fontSize: '12px',
                    fontWeight: '600',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}
                >
                  {copied ? <Check size={14} color="#10b981" /> : <Copy size={14} />}
                  {copied ? 'Copied Plan' : 'Copy Plan'}
                </button>

                <button
                  onClick={handleSendToChat}
                  style={{
                    padding: '8px 14px',
                    borderRadius: '8px',
                    background: 'var(--accent)',
                    color: 'white',
                    fontSize: '12px',
                    fontWeight: '600',
                    cursor: 'pointer',
                    border: 'none',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}
                >
                  <Send size={14} /> Send to Assistant for Study Q&A
                </button>

                <button
                  onClick={() => setPlanGenerated(null)}
                  style={{
                    marginLeft: 'auto',
                    padding: '8px 12px',
                    borderRadius: '8px',
                    border: 'none',
                    background: 'transparent',
                    color: 'var(--text-muted)',
                    fontSize: '12px',
                    cursor: 'pointer'
                  }}
                >
                  Configure Another
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
