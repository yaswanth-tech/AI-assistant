import React, { useState } from 'react';
import {
  MessageSquare,
  Plus,
  Search,
  Trash2,
  Edit2,
  MapPin,
  Calendar,
  Mail,
  BookOpen,
  Database,
  Compass,
  Settings,
  Sun,
  Moon,
  Radio,
  X,
  Check,
  ChevronRight
} from 'lucide-react';

export default function Sidebar({
  conversations = [],
  currentConversationId,
  onSelectConversation,
  onNewChat,
  onDeleteConversation,
  onRenameConversation,
  onClearAllConversations,
  activeTab,
  setActiveTab,
  systemStatus,
  wsConnected,
  theme,
  setTheme,
  onOpenSettings,
  isMobileOpen,
  onCloseMobile
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [editTitle, setEditTitle] = useState('');

  const filteredConversations = conversations.filter(c =>
    (c.title || 'New Conversation').toLowerCase().includes(searchQuery.toLowerCase())
  );

  const startRename = (c, e) => {
    e.stopPropagation();
    setEditingId(c.conversationId || c._id);
    setEditTitle(c.title || '');
  };

  const submitRename = (c, e) => {
    e.stopPropagation();
    if (editTitle.trim()) {
      onRenameConversation(c.conversationId || c._id, editTitle.trim());
    }
    setEditingId(null);
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isMobileOpen && (
        <div className="mobile-overlay" onClick={onCloseMobile} />
      )}

      <aside
        className={`sidebar-container ${isMobileOpen ? 'open' : ''}`}
        style={{
          width: '280px',
          background: 'var(--bg-sidebar)',
          borderRight: '1px solid var(--border-subtle)',
          display: 'flex',
          flexDirection: 'column',
          height: '100vh',
          flexShrink: 0
        }}
      >
        {/* Top Header: New Chat & Mobile Close */}
        <div style={{ padding: '16px 14px', borderBottom: '1px solid var(--border-subtle)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <img
                src="/resources/logo_without.png"
                alt="MDX Logo"
                style={{ width: '28px', height: '28px', objectFit: 'contain' }}
                onError={(e) => { e.currentTarget.style.display = 'none'; }}
              />
              <span style={{ fontSize: '14px', fontWeight: '800', color: 'var(--text-primary)', letterSpacing: '-0.3px' }}>
                Woxsen AI Assistant
              </span>
            </div>

            {isMobileOpen && (
              <button
                onClick={onCloseMobile}
                style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
              >
                <X size={18} />
              </button>
            )}
          </div>

          {/* New Chat Button */}
          <button
            onClick={() => {
              onNewChat();
              if (onCloseMobile) onCloseMobile();
            }}
            style={{
              width: '100%',
              padding: '10px 14px',
              borderRadius: '10px',
              border: 'none',
              background: 'var(--accent-gradient)',
              color: 'white',
              fontSize: '13px',
              fontWeight: '600',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              cursor: 'pointer',
              boxShadow: '0 4px 12px rgba(99, 102, 241, 0.3)'
            }}
          >
            <Plus size={16} /> New Chat
          </button>

          {/* Search Chats */}
          {conversations.length > 3 && (
            <div style={{ position: 'relative', marginTop: '10px' }}>
              <Search size={14} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input
                type="text"
                placeholder="Search conversations..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                  width: '100%',
                  padding: '6px 10px 6px 30px',
                  borderRadius: '7px',
                  border: '1px solid var(--border-subtle)',
                  background: 'var(--bg-input)',
                  color: 'var(--text-primary)',
                  fontSize: '11.5px',
                  outline: 'none'
                }}
              />
            </div>
          )}
        </div>

        {/* Scrollable Middle: Chat History & Campus Tools */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '12px 8px' }}>
          {/* Recent Conversations */}
          <div style={{ marginBottom: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0 8px 6px 8px' }}>
              <span style={{ fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', color: 'var(--text-muted)', letterSpacing: '0.4px' }}>
                Recent Chats
              </span>
              {conversations.length > 0 && (
                <button
                  onClick={onClearAllConversations}
                  title="Clear all conversations"
                  style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '10px' }}
                >
                  Clear all
                </button>
              )}
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
              {filteredConversations.length === 0 ? (
                <div style={{ fontSize: '12px', color: 'var(--text-muted)', padding: '12px 8px', textAlign: 'center' }}>
                  No saved conversations.
                </div>
              ) : (
                filteredConversations.map((c) => {
                  const id = c.conversationId || c._id;
                  const isActive = currentConversationId === id;
                  const isEditing = editingId === id;

                  return (
                    <div
                      key={id}
                      onClick={() => {
                        onSelectConversation(id);
                        if (onCloseMobile) onCloseMobile();
                      }}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '8px 10px',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        background: isActive ? 'rgba(99, 102, 241, 0.15)' : 'transparent',
                        color: isActive ? 'var(--text-primary)' : 'var(--text-secondary)',
                        fontSize: '12.5px',
                        fontWeight: isActive ? '600' : '500',
                        position: 'relative'
                      }}
                      onMouseEnter={(e) => {
                        if (!isActive) e.currentTarget.style.background = 'var(--bg-card-hover)';
                      }}
                      onMouseLeave={(e) => {
                        if (!isActive) e.currentTarget.style.background = 'transparent';
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', overflow: 'hidden', flex: 1 }}>
                        <MessageSquare size={14} color={isActive ? 'var(--accent)' : 'var(--text-muted)'} style={{ flexShrink: 0 }} />
                        {isEditing ? (
                          <input
                            type="text"
                            value={editTitle}
                            onChange={(e) => setEditTitle(e.target.value)}
                            onClick={(e) => e.stopPropagation()}
                            onKeyDown={(e) => { if (e.key === 'Enter') submitRename(c, e); }}
                            autoFocus
                            style={{
                              width: '100%',
                              padding: '2px 4px',
                              borderRadius: '4px',
                              border: '1px solid var(--accent)',
                              background: 'var(--bg-input)',
                              color: 'var(--text-primary)',
                              fontSize: '12px',
                              outline: 'none'
                            }}
                          />
                        ) : (
                          <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {c.title || 'New Conversation'}
                          </span>
                        )}
                      </div>

                      {/* Action Icons */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginLeft: '6px' }} onClick={(e) => e.stopPropagation()}>
                        {isEditing ? (
                          <button
                            onClick={(e) => submitRename(c, e)}
                            style={{ background: 'transparent', border: 'none', color: '#10b981', cursor: 'pointer', padding: '2px' }}
                          >
                            <Check size={13} />
                          </button>
                        ) : (
                          <>
                            <button
                              onClick={(e) => startRename(c, e)}
                              title="Rename chat"
                              style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '2px' }}
                            >
                              <Edit2 size={12} />
                            </button>
                            <button
                              onClick={(e) => { e.stopPropagation(); onDeleteConversation(id); }}
                              title="Delete chat"
                              style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '2px' }}
                            >
                              <Trash2 size={12} />
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Campus Tools & Shortcuts */}
          <div style={{ marginTop: '12px' }}>
            <span style={{ fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', color: 'var(--text-muted)', letterSpacing: '0.4px', padding: '0 8px', display: 'block', marginBottom: '6px' }}>
              Campus Tools
            </span>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
              {[
                { id: 'map', label: 'Campus Map & GPS', icon: MapPin },
                { id: 'appointments', label: 'Book Advisory Session', icon: Calendar },
                { id: 'email', label: 'Email Drafter', icon: Mail },
                { id: 'study_plan', label: 'Study Planner', icon: BookOpen },
                { id: 'rag', label: 'RAG Knowledge Explorer', icon: Database },
                { id: 'tour', label: '360° Virtual Tour', icon: Compass }
              ].map((tool) => {
                const Icon = tool.icon;
                return (
                  <button
                    key={tool.id}
                    onClick={() => {
                      setActiveTab(tool.id);
                      if (onCloseMobile) onCloseMobile();
                    }}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px',
                      padding: '8px 10px',
                      borderRadius: '8px',
                      border: 'none',
                      background: 'transparent',
                      color: 'var(--text-secondary)',
                      fontSize: '12.5px',
                      fontWeight: '500',
                      cursor: 'pointer',
                      textAlign: 'left'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.background = 'var(--bg-card-hover)'}
                    onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                  >
                    <Icon size={15} color="var(--accent)" style={{ flexShrink: 0 }} />
                    <span style={{ flex: 1 }}>{tool.label}</span>
                    <ChevronRight size={12} color="var(--text-muted)" />
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Bottom Panel: Settings, Theme & Health Telemetry */}
        <div style={{
          padding: '12px 14px',
          borderTop: '1px solid var(--border-subtle)',
          background: 'rgba(0, 0, 0, 0.05)',
          display: 'flex',
          flexDirection: 'column',
          gap: '8px'
        }}>
          {/* Quick Controls: Theme & Settings */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <button
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                background: 'transparent',
                border: 'none',
                color: 'var(--text-secondary)',
                fontSize: '12px',
                fontWeight: '600',
                cursor: 'pointer'
              }}
            >
              {theme === 'dark' ? <Sun size={15} /> : <Moon size={15} />}
              <span>{theme === 'dark' ? 'Light Mode' : 'Dark Mode'}</span>
            </button>

            <button
              onClick={onOpenSettings}
              title="Assistant Settings"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '5px',
                background: 'transparent',
                border: 'none',
                color: 'var(--text-secondary)',
                fontSize: '12px',
                fontWeight: '600',
                cursor: 'pointer'
              }}
            >
              <Settings size={15} />
              <span>Settings</span>
            </button>
          </div>

          {/* Telemetry Pills */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '10.5px', color: 'var(--text-muted)', paddingTop: '4px' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
              <Radio size={10} color={wsConnected ? '#10b981' : '#ef4444'} />
              {wsConnected ? 'WebSocket Live' : 'REST Active'}
            </span>
            <span style={{ color: systemStatus?.mongoConnected ? '#10b981' : 'var(--text-muted)' }}>
              {systemStatus?.mongoConnected ? 'MongoDB' : 'Memory Store'}
            </span>
          </div>
        </div>
      </aside>
    </>
  );
}
