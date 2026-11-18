import React, { useState } from 'react';
import {
  Bell,
  Sparkles,
  Volume2,
  VolumeX,
  ExternalLink,
  Bot,
  Menu,
  Download,
  Settings,
  Check,
  Share2
} from 'lucide-react';

export default function Header({
  currentTitle,
  activeProvider,
  onChangeProvider,
  notifications = [],
  ttsEnabled,
  setTtsEnabled,
  onOpenVirtualTour,
  onOpenSettings,
  onToggleMobile,
  onExportChat
}) {
  const [showNotifDropdown, setShowNotifDropdown] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  return (
    <header style={{
      height: '60px',
      borderBottom: '1px solid var(--border-subtle)',
      background: 'var(--bg-header)',
      backdropFilter: 'blur(12px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0 18px',
      position: 'relative',
      zIndex: 40
    }}>
      {/* Left: Mobile Toggle & Title */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', minWidth: 0 }}>
        {/* Mobile Hamburger Menu */}
        <button
          onClick={onToggleMobile}
          className="mobile-hamburger-btn"
          style={{
            background: 'transparent',
            border: 'none',
            color: 'var(--text-primary)',
            cursor: 'pointer',
            padding: '6px',
            borderRadius: '6px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          <Menu size={20} />
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: 0 }}>
          <span style={{
            width: '8px',
            height: '8px',
            borderRadius: '50%',
            background: '#10b981',
            boxShadow: '0 0 8px #10b981',
            flexShrink: 0
          }}></span>
          <span style={{
            fontSize: '13.5px',
            fontWeight: '700',
            color: 'var(--text-primary)',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis'
          }}>
            {currentTitle || 'Middlesex University Mauritius Assistant'}
          </span>
        </div>
      </div>

      {/* Right: Controls & Actions */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        {/* Engine Switcher */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          background: 'var(--bg-card)',
          padding: '4px 8px',
          borderRadius: '8px',
          border: '1px solid var(--border-subtle)'
        }}>
          <Bot size={13} color="var(--accent)" />
          <select
            value={activeProvider}
            onChange={(e) => onChangeProvider(e.target.value)}
            style={{
              background: 'transparent',
              border: 'none',
              color: 'var(--text-primary)',
              fontSize: '11.5px',
              fontWeight: '600',
              outline: 'none',
              cursor: 'pointer'
            }}
          >
            <option value="hybrid">Hybrid (Campus AI)</option>
            <option value="openai">OpenAI GPT-4o-mini</option>
            <option value="ollama">Ollama LLaMA2</option>
          </select>
        </div>

        {/* TTS Toggle */}
        <button
          onClick={() => setTtsEnabled(!ttsEnabled)}
          title={ttsEnabled ? 'Mute AI voice output' : 'Enable auto-voice output'}
          style={{
            background: ttsEnabled ? 'rgba(99, 102, 241, 0.15)' : 'var(--bg-card)',
            border: `1px solid ${ttsEnabled ? 'var(--accent)' : 'var(--border-subtle)'}`,
            padding: '6px 10px',
            borderRadius: '8px',
            color: ttsEnabled ? 'var(--accent)' : 'var(--text-muted)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '5px',
            fontSize: '11.5px',
            fontWeight: '600'
          }}
        >
          {ttsEnabled ? <Volume2 size={15} /> : <VolumeX size={15} />}
          <span className="hidden-mobile">{ttsEnabled ? 'Voice On' : 'Voice Off'}</span>
        </button>

        {/* 360 Virtual Tour */}
        <button
          onClick={onOpenVirtualTour}
          title="Open 360 Virtual Campus Tour"
          style={{
            background: 'linear-gradient(135deg, rgba(236, 72, 153, 0.15), rgba(168, 85, 247, 0.15))',
            border: '1px solid rgba(236, 72, 153, 0.3)',
            padding: '6px 10px',
            borderRadius: '8px',
            color: '#ec4899',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '5px',
            fontSize: '11.5px',
            fontWeight: '600'
          }}
        >
          <Sparkles size={13} />
          <span className="hidden-mobile">360° Tour</span>
        </button>

        {/* Export / Share */}
        <button
          onClick={onExportChat}
          title="Export conversation history"
          style={{
            background: 'var(--bg-card)',
            border: '1px solid var(--border-subtle)',
            padding: '6px 8px',
            borderRadius: '8px',
            color: 'var(--text-secondary)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            fontSize: '11.5px'
          }}
        >
          <Download size={14} />
        </button>

        {/* Notifications Popover Bell */}
        <div style={{ position: 'relative' }}>
          <button
            onClick={() => setShowNotifDropdown(!showNotifDropdown)}
            title="Real-time notifications"
            style={{
              position: 'relative',
              background: 'var(--bg-card)',
              border: '1px solid var(--border-subtle)',
              padding: '6px 8px',
              borderRadius: '8px',
              color: 'var(--text-secondary)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <Bell size={15} />
            {notifications.length > 0 && (
              <span style={{
                position: 'absolute',
                top: '-3px',
                right: '-3px',
                background: '#ef4444',
                color: 'white',
                fontSize: '9px',
                fontWeight: '700',
                width: '15px',
                height: '15px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                {notifications.length}
              </span>
            )}
          </button>

          {showNotifDropdown && (
            <div style={{
              position: 'absolute',
              right: 0,
              top: '42px',
              width: '300px',
              background: 'var(--bg-card)',
              border: '1px solid var(--border-subtle)',
              borderRadius: '12px',
              boxShadow: 'var(--shadow-subtle)',
              padding: '12px',
              zIndex: 60
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '6px' }}>
                <span style={{ fontSize: '12px', fontWeight: '700', color: 'var(--text-primary)' }}>Live Notifications</span>
                <span style={{ fontSize: '10px', color: 'var(--accent)', background: 'rgba(99, 102, 241, 0.15)', padding: '2px 6px', borderRadius: '4px', fontWeight: '600' }}>Active</span>
              </div>

              <div style={{ maxHeight: '220px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {notifications.length === 0 ? (
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)', textAlign: 'center', padding: '12px' }}>
                    No notifications yet.
                  </div>
                ) : (
                  notifications.map((notif, idx) => (
                    <div
                      key={notif._id || idx}
                      style={{
                        padding: '8px',
                        background: 'var(--bg-input)',
                        borderRadius: '6px',
                        borderLeft: `3px solid ${notif.type === 'success' ? '#10b981' : notif.type === 'announcement' ? '#818cf8' : '#38bdf8'}`
                      }}
                    >
                      <div style={{ fontSize: '12px', fontWeight: '600', color: 'var(--text-primary)' }}>{notif.title}</div>
                      <div style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '2px' }}>{notif.message}</div>
                      <div style={{ fontSize: '9px', color: 'var(--text-muted)', marginTop: '4px' }}>
                        {notif.timestamp ? new Date(notif.timestamp).toLocaleTimeString() : 'Just now'} • {notif.agent || 'Pipeline'}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* Settings Button */}
        <button
          onClick={onOpenSettings}
          title="Assistant Settings"
          style={{
            background: 'var(--bg-card)',
            border: '1px solid var(--border-subtle)',
            padding: '6px 8px',
            borderRadius: '8px',
            color: 'var(--text-secondary)',
            cursor: 'pointer'
          }}
        >
          <Settings size={15} />
        </button>
      </div>
    </header>
  );
}
