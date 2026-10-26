import React from 'react';
import { 
  MessageSquare, 
  MapPin, 
  Calendar, 
  Database, 
  Compass, 
  Cpu, 
  Radio, 
  Layers, 
  Plus,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';

export default function Sidebar({
  activeTab,
  setActiveTab,
  onNewChat,
  systemStatus,
  wsConnected,
  onQuickPrompt
}) {
  const quickPrompts = [
    { label: 'Available Courses', query: 'What undergraduate and postgraduate courses are offered?' },
    { label: 'Computer Science Fees', query: 'How much are the tuition fees and installments for BSc Computer Science?' },
    { label: 'Campus Navigation', query: 'Where is the Library and Robotics Lab located?' },
    { label: 'Book Appointment', query: 'I want to book an appointment with admissions' },
    { label: 'Virtual Tour', query: 'Can I take a 360 virtual tour of the campus?' }
  ];

  return (
    <aside style={{
      width: '280px',
      background: 'rgba(15, 23, 42, 0.95)',
      borderRight: '1px solid rgba(255, 255, 255, 0.08)',
      display: 'flex',
      flexDirection: 'column',
      height: '100vh',
      flexShrink: 0
    }}>
      {/* Brand Header */}
      <div style={{ padding: '20px', borderBottom: '1px solid rgba(255, 255, 255, 0.08)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            width: '40px',
            height: '40px',
            borderRadius: '12px',
            background: 'linear-gradient(135deg, #6366f1, #a855f7)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 4px 12px rgba(99, 102, 241, 0.4)'
          }}>
            <Cpu size={22} color="#ffffff" />
          </div>
          <div>
            <h1 style={{ fontSize: '16px', fontWeight: '700', letterSpacing: '-0.3px', color: '#ffffff' }}>
              Campus Assistant
            </h1>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '2px' }}>
              <span style={{ fontSize: '11px', color: '#94a3b8' }}>MERN Multi-Agent</span>
              <span style={{ fontSize: '9px', background: 'rgba(99, 102, 241, 0.2)', color: '#818cf8', padding: '1px 5px', borderRadius: '4px', fontWeight: '600' }}>v2.0</span>
            </div>
          </div>
        </div>

        {/* New Chat Button */}
        <button
          onClick={onNewChat}
          style={{
            width: '100%',
            marginTop: '16px',
            padding: '10px 14px',
            background: 'linear-gradient(135deg, #4f46e5, #7c3aed)',
            border: 'none',
            borderRadius: '10px',
            color: '#ffffff',
            fontWeight: '600',
            fontSize: '13px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            cursor: 'pointer',
            boxShadow: '0 4px 14px rgba(79, 70, 229, 0.35)',
            transition: 'all 0.2s ease'
          }}
          onMouseEnter={e => e.currentTarget.style.filter = 'brightness(1.1)'}
          onMouseLeave={e => e.currentTarget.style.filter = 'brightness(1)'}
        >
          <Plus size={16} /> New Conversation
        </button>
      </div>

      {/* Navigation Links */}
      <div style={{ padding: '16px 12px', flex: 1, overflowY: 'auto' }}>
        <div style={{ fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', color: '#64748b', padding: '0 8px', marginBottom: '8px', letterSpacing: '0.5px' }}>
          Workspace
        </div>

        <nav style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          {[
            { id: 'chat', label: 'Conversational Chat', icon: MessageSquare },
            { id: 'map', label: 'Campus Map & GPS', icon: MapPin },
            { id: 'appointments', label: 'Book Advisory', icon: Calendar },
            { id: 'rag', label: 'RAG Knowledge Base', icon: Database },
            { id: 'tour', label: '360° Virtual Tour', icon: Compass }
          ].map(item => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '10px 12px',
                  borderRadius: '8px',
                  border: 'none',
                  background: isActive ? 'rgba(99, 102, 241, 0.15)' : 'transparent',
                  color: isActive ? '#a5b4fc' : '#94a3b8',
                  fontWeight: isActive ? '600' : '500',
                  fontSize: '13px',
                  cursor: 'pointer',
                  textAlign: 'left',
                  transition: 'background 0.15s ease, color 0.15s ease'
                }}
                onMouseEnter={e => {
                  if (!isActive) e.currentTarget.style.background = 'rgba(255, 255, 255, 0.04)';
                }}
                onMouseLeave={e => {
                  if (!isActive) e.currentTarget.style.background = 'transparent';
                }}
              >
                <Icon size={18} color={isActive ? '#818cf8' : '#64748b'} />
                {item.label}
              </button>
            );
          })}
        </nav>

        {/* Quick Prompts */}
        <div style={{ marginTop: '24px' }}>
          <div style={{ fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', color: '#64748b', padding: '0 8px', marginBottom: '8px', letterSpacing: '0.5px' }}>
            Quick Inquiries
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {quickPrompts.map((qp, idx) => (
              <button
                key={idx}
                onClick={() => onQuickPrompt(qp.query)}
                style={{
                  padding: '8px 10px',
                  background: 'rgba(30, 41, 59, 0.4)',
                  border: '1px solid rgba(255, 255, 255, 0.05)',
                  borderRadius: '6px',
                  color: '#cbd5e1',
                  fontSize: '12px',
                  textAlign: 'left',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease'
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.background = 'rgba(99, 102, 241, 0.12)';
                  e.currentTarget.style.borderColor = 'rgba(99, 102, 241, 0.3)';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.background = 'rgba(30, 41, 59, 0.4)';
                  e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.05)';
                }}
              >
                {qp.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* System Status Footer */}
      <div style={{
        padding: '16px',
        borderTop: '1px solid rgba(255, 255, 255, 0.08)',
        background: 'rgba(10, 15, 30, 0.6)'
      }}>
        <div style={{ fontSize: '11px', fontWeight: '700', color: '#64748b', marginBottom: '8px' }}>
          SYSTEM PIPELINE
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '11px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: '#94a3b8' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Radio size={12} color={wsConnected ? '#10b981' : '#ef4444'} />
              WebSocket
            </span>
            <span style={{ color: wsConnected ? '#34d399' : '#f87171', fontWeight: '600' }}>
              {wsConnected ? 'Connected' : 'Offline'}
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: '#94a3b8' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Database size={12} color={systemStatus?.mongoConnected ? '#10b981' : '#f59e0b'} />
              MongoDB
            </span>
            <span style={{ color: systemStatus?.mongoConnected ? '#34d399' : '#fbbf24', fontWeight: '600' }}>
              {systemStatus?.mongoConnected ? 'Connected' : 'In-Memory Store'}
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: '#94a3b8' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Layers size={12} color="#818cf8" />
              Multi-Agent
            </span>
            <span style={{ color: '#a5b4fc', fontWeight: '600' }}>
              5 Agents Active
            </span>
          </div>
        </div>
      </div>
    </aside>
  );
}
