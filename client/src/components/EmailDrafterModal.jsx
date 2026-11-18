import React, { useState } from 'react';
import { Mail, X, Send, Copy, Check, ExternalLink } from 'lucide-react';

export default function EmailDrafterModal({ isOpen, onClose, onSendToChat }) {
  if (!isOpen) return null;

  const [department, setDepartment] = useState('Professor / Lecturer');
  const [purpose, setPurpose] = useState('Request for Assignment Deadline Extension');
  const [details, setDetails] = useState('');
  const [tone, setTone] = useState('Polite & Formal');
  const [generatedDraft, setGeneratedDraft] = useState(null);
  const [copied, setCopied] = useState(false);

  const handleGenerate = (e) => {
    e.preventDefault();

    let emailTo = 'lecturer@mdx.ac.mu';
    if (department.includes('Admissions')) emailTo = 'admissions@mdx.ac.mu';
    else if (department.includes('Finance')) emailTo = 'finance@mdx.ac.mu';
    else if (department.includes('Visa')) emailTo = 'international@mdx.ac.mu';
    else if (department.includes('IT')) emailTo = 'itsupport@mdx.ac.mu';

    const subject = `${purpose} - [Student Name / ID]`;
    const body = `Dear ${department},\n\nI hope this email finds you well.\n\nI am writing to respectfully request your assistance regarding ${purpose.toLowerCase()}.\n\n${details ? `Key Details: ${details}\n\n` : ''}Could you please advise me on the next steps or if any supplementary forms are required?\n\nThank you very much for your understanding and guidance.\n\nSincerely,\n[Your Full Name]\nStudent ID: [Your Student ID]\nMiddlesex University Mauritius`;

    const mailto = `mailto:${encodeURIComponent(emailTo)}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;

    setGeneratedDraft({
      to: emailTo,
      subject,
      body,
      mailto
    });
  };

  const handleCopy = () => {
    if (!generatedDraft) return;
    navigator.clipboard.writeText(`To: ${generatedDraft.to}\nSubject: ${generatedDraft.subject}\n\n${generatedDraft.body}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleInsertIntoChat = () => {
    if (!generatedDraft) return;
    onSendToChat(`Please review and polish this student email draft:\n\nTo: ${generatedDraft.to}\nSubject: ${generatedDraft.subject}\n\n${generatedDraft.body}`);
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
        maxWidth: '650px',
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
              background: 'rgba(59, 130, 246, 0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#3b82f6'
            }}>
              <Mail size={18} />
            </div>
            <div>
              <h2 style={{ fontSize: '15px', fontWeight: '700' }}>Academic Email Drafter</h2>
              <p style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Generate professional campus emails with 1-click mailto</p>
            </div>
          </div>

          <button onClick={onClose} style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
            <X size={18} />
          </button>
        </div>

        {/* Form Body */}
        <div style={{ padding: '20px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {!generatedDraft ? (
            <form onSubmit={handleGenerate} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ fontSize: '11px', fontWeight: '700', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>
                    Recipient Department
                  </label>
                  <select
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
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
                    <option value="Professor / Lecturer">Professor / Lecturer</option>
                    <option value="Admissions Office">Admissions Office</option>
                    <option value="Student Finance & Fees">Student Finance & Fees</option>
                    <option value="International Visa Officer">International Visa Officer</option>
                    <option value="IT Support Desk">IT Support Desk</option>
                  </select>
                </div>

                <div>
                  <label style={{ fontSize: '11px', fontWeight: '700', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>
                    Tone & Style
                  </label>
                  <select
                    value={tone}
                    onChange={(e) => setTone(e.target.value)}
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
                    <option value="Polite & Formal">Polite & Formal</option>
                    <option value="Urgent Inquiry">Urgent Inquiry</option>
                    <option value="Brief & Direct">Brief & Direct</option>
                  </select>
                </div>
              </div>

              <div>
                <label style={{ fontSize: '11px', fontWeight: '700', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>
                  Email Purpose / Topic
                </label>
                <input
                  type="text"
                  required
                  value={purpose}
                  onChange={(e) => setPurpose(e.target.value)}
                  placeholder="e.g. Request for Assignment Deadline Extension"
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
                  Specific Notes / Context (Optional)
                </label>
                <textarea
                  rows={3}
                  value={details}
                  onChange={(e) => setDetails(e.target.value)}
                  placeholder="Mention any reasons, dates, course codes, or questions..."
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    borderRadius: '8px',
                    border: '1px solid var(--border-subtle)',
                    background: 'var(--bg-input)',
                    color: 'var(--text-primary)',
                    fontSize: '13px',
                    outline: 'none',
                    resize: 'vertical'
                  }}
                />
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
                <Mail size={16} /> Generate Professional Draft
              </button>
            </form>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div style={{ background: 'var(--bg-input)', padding: '12px', borderRadius: '8px', border: '1px solid var(--border-subtle)' }}>
                <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '4px' }}>
                  <strong>To:</strong> <code>{generatedDraft.to}</code>
                </div>
                <div style={{ fontSize: '12px', fontWeight: '700', color: 'var(--text-primary)', marginBottom: '8px' }}>
                  <strong>Subject:</strong> {generatedDraft.subject}
                </div>
                <div style={{
                  fontSize: '13px',
                  lineHeight: '1.6',
                  whiteSpace: 'pre-wrap',
                  color: 'var(--text-primary)',
                  borderTop: '1px solid var(--border-subtle)',
                  paddingTop: '8px'
                }}>
                  {generatedDraft.body}
                </div>
              </div>

              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
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
                  {copied ? 'Copied to Clipboard' : 'Copy Email'}
                </button>

                <a
                  href={generatedDraft.mailto}
                  style={{
                    padding: '8px 14px',
                    borderRadius: '8px',
                    background: 'var(--accent)',
                    color: 'white',
                    fontSize: '12px',
                    fontWeight: '600',
                    textDecoration: 'none',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}
                >
                  <ExternalLink size={14} /> Open in Email App
                </a>

                <button
                  onClick={handleInsertIntoChat}
                  style={{
                    padding: '8px 14px',
                    borderRadius: '8px',
                    border: '1px solid var(--border-subtle)',
                    background: 'transparent',
                    color: 'var(--text-secondary)',
                    fontSize: '12px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}
                >
                  <Send size={14} /> Send to Assistant for Review
                </button>

                <button
                  onClick={() => setGeneratedDraft(null)}
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
                  Draft Another
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
