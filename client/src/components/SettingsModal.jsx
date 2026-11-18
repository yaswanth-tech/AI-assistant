import React from 'react';
import { X, Moon, Sun, Key, Bot, Volume2, Shield, Sliders } from 'lucide-react';

export default function SettingsModal({
  isOpen,
  onClose,
  theme,
  setTheme,
  activeProvider,
  setActiveProvider,
  userApiKey,
  setUserApiKey,
  voiceSettings,
  setVoiceSettings,
  availableVoices = []
}) {
  if (!isOpen) return null;

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
        maxWidth: '560px',
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
              background: 'rgba(99, 102, 241, 0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--accent)'
            }}>
              <Sliders size={18} />
            </div>
            <div>
              <h2 style={{ fontSize: '15px', fontWeight: '700' }}>Assistant Settings</h2>
              <p style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Preferences, API keys & speech synthesis</p>
            </div>
          </div>

          <button
            onClick={onClose}
            style={{
              background: 'transparent',
              border: 'none',
              color: 'var(--text-muted)',
              cursor: 'pointer',
              padding: '6px',
              borderRadius: '6px'
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Form Body */}
        <div style={{ padding: '20px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Appearance Theme */}
          <div>
            <label style={{ fontSize: '12px', fontWeight: '700', textTransform: 'uppercase', color: 'var(--text-muted)', display: 'block', marginBottom: '8px' }}>
              Theme & Appearance
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              <button
                type="button"
                onClick={() => setTheme('dark')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  padding: '10px',
                  borderRadius: '10px',
                  border: `2px solid ${theme === 'dark' ? 'var(--accent)' : 'var(--border-subtle)'}`,
                  background: theme === 'dark' ? 'rgba(99, 102, 241, 0.12)' : 'transparent',
                  color: 'var(--text-primary)',
                  fontWeight: '600',
                  fontSize: '13px',
                  cursor: 'pointer'
                }}
              >
                <Moon size={16} /> Dark Mode
              </button>

              <button
                type="button"
                onClick={() => setTheme('light')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  padding: '10px',
                  borderRadius: '10px',
                  border: `2px solid ${theme === 'light' ? 'var(--accent)' : 'var(--border-subtle)'}`,
                  background: theme === 'light' ? 'rgba(99, 102, 241, 0.12)' : 'transparent',
                  color: 'var(--text-primary)',
                  fontWeight: '600',
                  fontSize: '13px',
                  cursor: 'pointer'
                }}
              >
                <Sun size={16} /> Light Mode
              </button>
            </div>
          </div>

          {/* AI Model & Engine */}
          <div>
            <label style={{ fontSize: '12px', fontWeight: '700', textTransform: 'uppercase', color: 'var(--text-muted)', display: 'block', marginBottom: '8px' }}>
              AI Model Engine
            </label>
            <select
              value={activeProvider}
              onChange={(e) => setActiveProvider(e.target.value)}
              style={{
                width: '100%',
                padding: '10px 12px',
                borderRadius: '8px',
                border: '1px solid var(--border-subtle)',
                background: 'var(--bg-input)',
                color: 'var(--text-primary)',
                fontSize: '13px',
                outline: 'none'
              }}
            >
              <option value="hybrid">Hybrid (Natural Campus AI + OpenAI Tool Calling)</option>
              <option value="openai">OpenAI (GPT-4o-mini / GPT-4o / GPT-3.5)</option>
              <option value="ollama">Ollama Local (LLaMA2 / LLaMA3 / Mistral)</option>
            </select>
          </div>

          {/* Custom API Key */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
              <label style={{ fontSize: '12px', fontWeight: '700', textTransform: 'uppercase', color: 'var(--text-muted)' }}>
                Personal API Key (Optional)
              </label>
              <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>Stored locally in your browser</span>
            </div>
            <div style={{ position: 'relative' }}>
              <Key size={15} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input
                type="password"
                placeholder="sk-... (OpenAI or Gemini API key)"
                value={userApiKey || ''}
                onChange={(e) => setUserApiKey(e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px 12px 10px 36px',
                  borderRadius: '8px',
                  border: '1px solid var(--border-subtle)',
                  background: 'var(--bg-input)',
                  color: 'var(--text-primary)',
                  fontSize: '13px',
                  outline: 'none'
                }}
              />
            </div>
            <p style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px' }}>
              If left blank, the application uses the server's environment variable key or zero-failure natural AI engine.
            </p>
          </div>

          {/* Voice Assistant Settings */}
          <div>
            <label style={{ fontSize: '12px', fontWeight: '700', textTransform: 'uppercase', color: 'var(--text-muted)', display: 'block', marginBottom: '8px' }}>
              Speech & Audio Settings
            </label>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '13px', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={voiceSettings?.autoSpeak || false}
                  onChange={(e) => setVoiceSettings(prev => ({ ...prev, autoSpeak: e.target.checked }))}
                  style={{ width: '16px', height: '16px', accentColor: 'var(--accent)' }}
                />
                <span>Automatically speak AI replies out loud</span>
              </label>

              {availableVoices.length > 0 && (
                <div>
                  <span style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>Preferred Voice</span>
                  <select
                    value={voiceSettings?.voiceURI || ''}
                    onChange={(e) => setVoiceSettings(prev => ({ ...prev, voiceURI: e.target.value }))}
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      borderRadius: '8px',
                      border: '1px solid var(--border-subtle)',
                      background: 'var(--bg-input)',
                      color: 'var(--text-primary)',
                      fontSize: '12px',
                      outline: 'none'
                    }}
                  >
                    <option value="">Default System Voice</option>
                    {availableVoices.slice(0, 25).map(v => (
                      <option key={v.voiceURI} value={v.voiceURI}>
                        {v.name} ({v.lang})
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: 'var(--text-muted)', marginBottom: '4px' }}>
                  <span>Speech Rate</span>
                  <span>{voiceSettings?.rate || 1.0}x</span>
                </div>
                <input
                  type="range"
                  min="0.75"
                  max="1.5"
                  step="0.05"
                  value={voiceSettings?.rate || 1.0}
                  onChange={(e) => setVoiceSettings(prev => ({ ...prev, rate: parseFloat(e.target.value) }))}
                  style={{ width: '100%', accentColor: 'var(--accent)' }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div style={{
          padding: '14px 20px',
          borderTop: '1px solid var(--border-subtle)',
          display: 'flex',
          justifyContent: 'flex-end',
          background: 'rgba(0, 0, 0, 0.05)'
        }}>
          <button
            onClick={onClose}
            style={{
              padding: '8px 18px',
              borderRadius: '8px',
              border: 'none',
              background: 'var(--accent-gradient)',
              color: 'white',
              fontWeight: '600',
              fontSize: '13px',
              cursor: 'pointer'
            }}
          >
            Save & Close
          </button>
        </div>
      </div>
    </div>
  );
}
