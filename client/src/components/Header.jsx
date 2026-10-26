import React, { useState } from 'react';
import { 
  Bell, 
  Sparkles, 
  Volume2, 
  VolumeX, 
  ExternalLink, 
  Check, 
  Info, 
  AlertTriangle,
  Bot
} from 'lucide-react';

export default function Header({
  activeProvider,
  onChangeProvider,
  notifications = [],
  ttsEnabled,
  setTtsEnabled,
  onOpenVirtualTour
}) {
  const [showNotifDropdown, setShowNotifDropdown] = useState(false);

  return (
    <header style={{
      height: '64px',
      borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
      background: 'rgba(15, 23, 42, 0.8)',
      backdropFilter: 'blur(12px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0 24px',
      position: 'relative',
      zIndex: 40
    }}>
      {/* Left: Campus Badge & Role */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{
            width: '8px',
            height: '8px',
            borderRadius: '50%',
            background: '#10b981',
            boxShadow: '0 0 8px #10b981'
          }}></span>
          <span style={{ fontSize: '13px', fontWeight: '600', color: '#f8fafc' }}>
            Middlesex University Mauritius
          </span>
        </div>
        <span style={{ color: '#475569' }}>|</span>
        <span style={{ fontSize: '12px', color: '#94a3b8' }}>
          Context-Aware RAG Pipeline & Multi-Agent Network
        </span>
      </div>

      {/* Right Controls */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
        {/* Model Provider Switcher */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'rgba(30, 41, 59, 0.6)', padding: '4px 10px', borderRadius: '8px', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
          <Bot size={14} color="#818cf8" />
          <span style={{ fontSize: '11px', color: '#94a3b8', fontWeight: '500' }}>Engine:</span>
          <select
            value={activeProvider}
            onChange={(e) => onChangeProvider(e.target.value)}
            style={{
              background: 'transparent',
              border: 'none',
              color: '#c7d2fe',
              fontSize: '12px',
              fontWeight: '600',
              outline: 'none',
              cursor: 'pointer'
            }}
          >
            <option value="hybrid" style={{ background: '#0f172a', color: '#f1f5f9' }}>Hybrid (Multi-Agent RAG)</option>
            <option value="openai" style={{ background: '#0f172a', color: '#f1f5f9' }}>OpenAI (GPT-3.5/4o)</option>
            <option value="ollama" style={{ background: '#0f172a', color: '#f1f5f9' }}>Ollama (LLaMA2)</option>
          </select>
        </div>

        {/* TTS Toggle */}
        <button
          onClick={() => setTtsEnabled(!ttsEnabled)}
          title={ttsEnabled ? 'Mute AI voice responses' : 'Enable AI voice responses'}
          style={{
            background: ttsEnabled ? 'rgba(99, 102, 241, 0.2)' : 'rgba(30, 41, 59, 0.6)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            padding: '7px 10px',
            borderRadius: '8px',
            color: ttsEnabled ? '#a5b4fc' : '#94a3b8',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            fontSize: '12px'
          }}
        >
          {ttsEnabled ? <Volume2 size={16} color="#818cf8" /> : <VolumeX size={16} color="#64748b" />}
          <span style={{ fontWeight: '500' }}>{ttsEnabled ? 'Voice On' : 'Voice Off'}</span>
        </button>

        {/* 360 Virtual Tour Button */}
        <button
          onClick={onOpenVirtualTour}
          style={{
            background: 'linear-gradient(135deg, rgba(236, 72, 153, 0.2), rgba(168, 85, 247, 0.2))',
            border: '1px solid rgba(236, 72, 153, 0.3)',
            padding: '7px 12px',
            borderRadius: '8px',
            color: '#f472b6',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            fontSize: '12px',
            fontWeight: '600'
          }}
        >
          <Sparkles size={14} />
          <span>Virtual Tour</span>
          <ExternalLink size={12} />
        </button>

        {/* Notification Bell with Dropdown */}
        <div style={{ position: 'relative' }}>
          <button
            onClick={() => setShowNotifDropdown(!showNotifDropdown)}
            style={{
              position: 'relative',
              background: 'rgba(30, 41, 59, 0.6)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              padding: '8px',
              borderRadius: '8px',
              color: '#cbd5e1',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <Bell size={18} />
            {notifications.length > 0 && (
              <span style={{
                position: 'absolute',
                top: '-4px',
                right: '-4px',
                background: '#ef4444',
                color: 'white',
                fontSize: '10px',
                fontWeight: '700',
                width: '18px',
                height: '18px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: '2px solid #0f172a'
              }}>
                {notifications.length}
              </span>
            )}
          </button>

          {/* Notifications Popover */}
          {showNotifDropdown && (
            <div style={{
              position: 'absolute',
              right: 0,
              top: '46px',
              width: '320px',
              background: '#0f172a',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '12px',
              boxShadow: '0 12px 32px rgba(0, 0, 0, 0.6)',
              padding: '12px',
              zIndex: 50
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px', borderBottom: '1px solid rgba(255, 255, 255, 0.08)', paddingBottom: '6px' }}>
                <span style={{ fontSize: '12px', fontWeight: '700', color: '#f8fafc' }}>Real-Time Pipeline Notifications</span>
                <span style={{ fontSize: '10px', color: '#818cf8', background: 'rgba(99, 102, 241, 0.2)', padding: '2px 6px', borderRadius: '4px' }}>Live</span>
              </div>

              <div style={{ maxHeight: '240px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {notifications.length === 0 ? (
                  <div style={{ fontSize: '12px', color: '#64748b', textAlign: 'center', padding: '16px' }}>
                    No notifications yet.
                  </div>
                ) : (
                  notifications.map((notif, index) => (
                    <div
                      key={notif._id || index}
                      style={{
                        padding: '8px 10px',
                        background: 'rgba(30, 41, 59, 0.5)',
                        borderRadius: '6px',
                        borderLeft: `3px solid ${notif.type === 'success' ? '#10b981' : notif.type === 'announcement' ? '#818cf8' : '#38bdf8'}`
                      }}
                    >
                      <div style={{ fontSize: '12px', fontWeight: '600', color: '#f1f5f9' }}>{notif.title}</div>
                      <div style={{ fontSize: '11px', color: '#94a3b8', marginTop: '2px', lineHeight: '1.4' }}>{notif.message}</div>
                      <div style={{ fontSize: '9px', color: '#64748b', marginTop: '4px' }}>
                        {notif.timestamp ? new Date(notif.timestamp).toLocaleTimeString() : 'Just now'} • {notif.agent || 'Pipeline'}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
