import React, { useState, useEffect, useRef } from 'react';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import ChatArea from './components/ChatArea';
import CampusMapModal from './components/CampusMapModal';
import AppointmentsModal from './components/AppointmentsModal';
import RAGExplorerModal from './components/RAGExplorerModal';
import SettingsModal from './components/SettingsModal';
import EmailDrafterModal from './components/EmailDrafterModal';
import StudyPlanModal from './components/StudyPlanModal';

const DEFAULT_WELCOME_MSG = {
  id: 'welcome-msg',
  sender: 'bot',
  agent: 'Campus AI Supervisor',
  model: 'Intelligent Campus Assistant',
  text: `👋 **Welcome to Middlesex University Mauritius AI Campus Assistant!**\n\nI am your intelligent personal AI assistant, designed to help you navigate academic life, campus services, and study success.\n\n### 🚀 What I Can Do For You:\n- **Academic & Course Guidance:** Ask about BSc/BA undergraduate and MSc/MBA postgraduate degree structures, accreditations, and entry prerequisites.\n- **Tuition & Installment Plans:** Inquire about exact fees, deposit deadlines, and flexible payment schedules.\n- **Campus Navigation & GPS:** Get exact coordinates, walking paths, and Google Maps directions to the Library, Robotics Lab, Admin Building, and more.\n- **Appointment Scheduling:** Book advising sessions with faculties, with instant **Google Calendar** sync and downloadable **.ics** files.\n- **Document & PDF Analysis:** Attach course syllabi or assignments via the paperclip button for instant summarization.\n- **Email Drafting & Study Planning:** Draft formal emails to professors or generate personalized revision timetables.\n- **Voice Assistant:** Click the microphone to speak, or enable **Voice On** in the top bar for spoken replies!\n\n*How can I assist you today?*`,
  steps: [
    { agent: 'Supervisor Agent', action: 'Initialization', details: 'All specialized campus agents & tools active.' }
  ]
};

export default function App() {
  // Theme state
  const [theme, setTheme] = useState(() => localStorage.getItem('mdx_theme') || 'dark');

  // AI & Voice configuration
  const [activeProvider, setActiveProvider] = useState(() => localStorage.getItem('mdx_provider') || 'hybrid');
  const [userApiKey, setUserApiKey] = useState(() => localStorage.getItem('mdx_api_key') || '');
  const [voiceSettings, setVoiceSettings] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('mdx_voice_settings')) || { autoSpeak: false, voiceURI: '', rate: 1.0 };
    } catch (e) {
      return { autoSpeak: false, voiceURI: '', rate: 1.0 };
    }
  });
  const [availableVoices, setAvailableVoices] = useState([]);
  const [ttsEnabled, setTtsEnabled] = useState(false);

  // Conversations & Chat State
  const [conversations, setConversations] = useState([]);
  const [currentConversationId, setCurrentConversationId] = useState(() => 'conv-' + Date.now());
  const [messages, setMessages] = useState([DEFAULT_WELCOME_MSG]);
  const [activeAgentSteps, setActiveAgentSteps] = useState([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [wsConnected, setWsConnected] = useState(false);
  const [systemStatus, setSystemStatus] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [allLocations, setAllLocations] = useState([]);

  // Modals state
  const [isMapOpen, setIsMapOpen] = useState(false);
  const [selectedMapLocation, setSelectedMapLocation] = useState(null);
  const [isAppointmentsOpen, setIsAppointmentsOpen] = useState(false);
  const [isRAGOpen, setIsRAGOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isEmailDrafterOpen, setIsEmailDrafterOpen] = useState(false);
  const [isStudyPlannerOpen, setIsStudyPlannerOpen] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const wsRef = useRef(null);
  const abortControllerRef = useRef(null);

  // Apply theme to document element
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('mdx_theme', theme);
  }, [theme]);

  // Save settings
  useEffect(() => {
    localStorage.setItem('mdx_provider', activeProvider);
  }, [activeProvider]);

  useEffect(() => {
    localStorage.setItem('mdx_api_key', userApiKey);
  }, [userApiKey]);

  useEffect(() => {
    localStorage.setItem('mdx_voice_settings', JSON.stringify(voiceSettings));
    setTtsEnabled(voiceSettings.autoSpeak || false);
  }, [voiceSettings]);

  // Load available speech synthesis voices
  useEffect(() => {
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      const updateVoices = () => {
        setAvailableVoices(window.speechSynthesis.getVoices() || []);
      };
      updateVoices();
      window.speechSynthesis.onvoiceschanged = updateVoices;
    }
  }, []);

  // Fetch initial telemetry, past conversations & campus data
  useEffect(() => {
    fetch('/api/config')
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setSystemStatus(data);
          if (data.llm?.activeProvider && !localStorage.getItem('mdx_provider')) {
            setActiveProvider(data.llm.activeProvider);
          }
        }
      })
      .catch(console.warn);

    fetch('/api/locations')
      .then(res => res.json())
      .then(data => {
        if (data.success) setAllLocations(data.locations || []);
      })
      .catch(console.warn);

    fetch('/api/notifications')
      .then(res => res.json())
      .then(data => {
        if (data.success) setNotifications(data.notifications || []);
      })
      .catch(console.warn);

    fetchConversations();
  }, []);

  const fetchConversations = async () => {
    try {
      const res = await fetch('/api/conversations');
      const data = await res.json();
      if (data.success && data.conversations) {
        setConversations(data.conversations);
      }
    } catch (e) {
      console.warn('Could not fetch conversations:', e.message);
    }
  };

  // WebSocket Connection for Real-Time Pipeline
  useEffect(() => {
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${protocol}//${window.location.host}/ws`;

    const connectWebSocket = () => {
      try {
        const ws = new WebSocket(wsUrl);
        wsRef.current = ws;

        ws.onopen = () => {
          setWsConnected(true);
        };

        ws.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);

            if (data.event === 'agent:step') {
              setActiveAgentSteps(prev => [...prev, data.payload]);
            } else if (data.event === 'chat:response') {
              const res = data.payload;
              const botMsg = {
                id: 'bot-' + Date.now(),
                sender: 'bot',
                text: res.reply,
                agent: res.agent || 'Campus Assistant',
                model: res.model || 'Campus AI',
                richCard: res.richCard || null,
                steps: res.steps || []
              };
              setMessages(prev => [...prev, botMsg]);
              setIsProcessing(false);
              setActiveAgentSteps([]);

              // If action requires opening map
              if (res.richCard?.type === 'map' && res.richCard.location) {
                setSelectedMapLocation(res.richCard.location);
              }

              fetchConversations();
            } else if (data.event === 'notification:new') {
              setNotifications(prev => [data.payload, ...prev]);
            }
          } catch (e) {
            console.error('WS message parse error:', e);
          }
        };

        ws.onclose = () => {
          setWsConnected(false);
          setTimeout(connectWebSocket, 3500);
        };

        ws.onerror = (err) => {
          ws.close();
        };
      } catch (err) {
        console.warn('WebSocket init exception:', err);
      }
    };

    connectWebSocket();

    return () => {
      if (wsRef.current) wsRef.current.close();
    };
  }, []);

  // Send message through WebSocket with HTTP POST fallback
  const handleSendMessage = async (text, attachment = null) => {
    if (!text && !attachment) return;

    const userMsg = {
      id: 'user-' + Date.now(),
      sender: 'user',
      text: text || `[Uploaded document: ${attachment.filename}]`,
      attachment: attachment || null
    };

    setMessages(prev => [...prev, userMsg]);
    setIsProcessing(true);
    setActiveAgentSteps([]);

    const historyPayload = messages.slice(-8).map(m => ({
      sender: m.sender,
      text: m.text
    }));

    // If WebSocket is open
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({
        type: 'chat',
        message: text,
        conversationId: currentConversationId,
        conversationHistory: historyPayload,
        provider: activeProvider,
        apiKey: userApiKey || null,
        attachment: attachment || null
      }));
    } else {
      // HTTP Fallback
      abortControllerRef.current = new AbortController();
      try {
        const res = await fetch('/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          signal: abortControllerRef.current.signal,
          body: JSON.stringify({
            message: text,
            conversationId: currentConversationId,
            conversationHistory: historyPayload,
            provider: activeProvider,
            apiKey: userApiKey || null,
            attachment: attachment || null
          })
        });
        const data = await res.json();
        if (data.success) {
          const botMsg = {
            id: 'bot-' + Date.now(),
            sender: 'bot',
            text: data.reply,
            agent: data.agent || 'Campus Assistant',
            model: data.model || 'Campus AI',
            richCard: data.richCard || null,
            steps: data.steps || []
          };
          setMessages(prev => [...prev, botMsg]);

          if (data.richCard?.type === 'map' && data.richCard.location) {
            setSelectedMapLocation(data.richCard.location);
          }

          fetchConversations();
        } else {
          setMessages(prev => [
            ...prev,
            {
              id: 'err-' + Date.now(),
              sender: 'bot',
              agent: 'System',
              text: '⚠️ Response error: ' + (data.error || 'Unable to process inquiry.')
            }
          ]);
        }
      } catch (err) {
        if (err.name !== 'AbortError') {
          setMessages(prev => [
            ...prev,
            {
              id: 'err-' + Date.now(),
              sender: 'bot',
              agent: 'System',
              text: '⚠️ Communication error: ' + err.message
            }
          ]);
        }
      } finally {
        setIsProcessing(false);
      }
    }
  };

  const handleStopGenerating = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    setIsProcessing(false);
    setActiveAgentSteps([]);
  };

  // Create a brand new conversation
  const handleNewChat = () => {
    const newId = 'conv-' + Date.now();
    setCurrentConversationId(newId);
    setMessages([DEFAULT_WELCOME_MSG]);
    setActiveAgentSteps([]);
    setIsProcessing(false);
  };

  // Switch to an existing past conversation
  const handleSelectConversation = async (convId) => {
    setCurrentConversationId(convId);
    setIsProcessing(false);
    setActiveAgentSteps([]);

    try {
      const res = await fetch(`/api/conversations/${convId}`);
      const data = await res.json();
      if (data.success && data.conversation && data.conversation.messages) {
        setMessages(data.conversation.messages.length > 0 ? data.conversation.messages : [DEFAULT_WELCOME_MSG]);
      }
    } catch (e) {
      console.warn('Could not load conversation:', e.message);
    }
  };

  // Delete a conversation
  const handleDeleteConversation = async (convId) => {
    try {
      await fetch(`/api/conversations/${convId}`, { method: 'DELETE' });
      setConversations(prev => prev.filter(c => (c.conversationId || c._id) !== convId));
      if (currentConversationId === convId) {
        handleNewChat();
      }
    } catch (e) {
      console.warn('Could not delete conversation:', e.message);
    }
  };

  // Rename a conversation
  const handleRenameConversation = async (convId, newTitle) => {
    try {
      await fetch(`/api/conversations/${convId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: newTitle })
      });
      setConversations(prev => prev.map(c => {
        if ((c.conversationId || c._id) === convId) {
          return { ...c, title: newTitle };
        }
        return c;
      }));
    } catch (e) {
      console.warn('Could not rename conversation:', e.message);
    }
  };

  // Clear all conversations
  const handleClearAllConversations = async () => {
    if (!window.confirm('Are you sure you want to delete all conversation history?')) return;
    try {
      await fetch('/api/conversations', { method: 'DELETE' });
      setConversations([]);
      handleNewChat();
    } catch (e) {
      console.warn('Could not clear conversations:', e.message);
    }
  };

  // Regenerate last bot response
  const handleRegenerate = () => {
    const userMsgs = messages.filter(m => m.sender === 'user');
    if (userMsgs.length === 0) return;
    const lastUserMsg = userMsgs[userMsgs.length - 1];
    setMessages(prev => prev.filter((_, i) => i !== prev.length - 1));
    handleSendMessage(lastUserMsg.text, lastUserMsg.attachment);
  };

  // Export current conversation
  const handleExportChat = () => {
    const exportText = messages.map(m => {
      const author = m.sender === 'user' ? 'USER' : `ASSISTANT (${m.agent || 'Campus AI'})`;
      return `[${author}]:\n${m.text}\n`;
    }).join('\n----------------------------------------\n\n');

    const blob = new Blob([exportText], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `mdx-chat-export-${new Date().toISOString().slice(0, 10)}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleOpenVirtualTour = () => {
    window.open('https://app.lapentor.com/sphere/mdx-mru-virtual-tour', '_blank');
  };

  // Current active conversation title
  const activeConv = conversations.find(c => (c.conversationId || c._id) === currentConversationId);
  const currentTitle = activeConv?.title || 'New Conversation';

  return (
    <div style={{ display: 'flex', height: '100vh', width: '100vw', overflow: 'hidden' }}>
      {/* Sidebar Drawer */}
      <Sidebar
        conversations={conversations}
        currentConversationId={currentConversationId}
        onSelectConversation={handleSelectConversation}
        onNewChat={handleNewChat}
        onDeleteConversation={handleDeleteConversation}
        onRenameConversation={handleRenameConversation}
        onClearAllConversations={handleClearAllConversations}
        activeTab="chat"
        setActiveTab={(tab) => {
          if (tab === 'map') setIsMapOpen(true);
          else if (tab === 'appointments') setIsAppointmentsOpen(true);
          else if (tab === 'email') setIsEmailDrafterOpen(true);
          else if (tab === 'study_plan') setIsStudyPlannerOpen(true);
          else if (tab === 'rag') setIsRAGOpen(true);
          else if (tab === 'tour') handleOpenVirtualTour();
        }}
        systemStatus={systemStatus}
        wsConnected={wsConnected}
        theme={theme}
        setTheme={setTheme}
        onOpenSettings={() => setIsSettingsOpen(true)}
        isMobileOpen={isMobileOpen}
        onCloseMobile={() => setIsMobileOpen(false)}
      />

      {/* Main Chat Workspace */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden' }}>
        <Header
          currentTitle={currentTitle}
          activeProvider={activeProvider}
          onChangeProvider={setActiveProvider}
          notifications={notifications}
          ttsEnabled={ttsEnabled}
          setTtsEnabled={(val) => setVoiceSettings(prev => ({ ...prev, autoSpeak: val }))}
          onOpenVirtualTour={handleOpenVirtualTour}
          onOpenSettings={() => setIsSettingsOpen(true)}
          onToggleMobile={() => setIsMobileOpen(!isMobileOpen)}
          onExportChat={handleExportChat}
        />

        <ChatArea
          messages={messages}
          onSendMessage={handleSendMessage}
          activeAgentSteps={activeAgentSteps}
          isProcessing={isProcessing}
          onStopGenerating={handleStopGenerating}
          ttsEnabled={ttsEnabled}
          voiceSettings={voiceSettings}
          onOpenMap={(loc) => {
            setSelectedMapLocation(loc);
            setIsMapOpen(true);
          }}
          onOpenAppointments={() => setIsAppointmentsOpen(true)}
          onOpenVirtualTour={handleOpenVirtualTour}
          onOpenEmailDrafter={() => setIsEmailDrafterOpen(true)}
          onOpenStudyPlanner={() => setIsStudyPlannerOpen(true)}
          onRegenerate={handleRegenerate}
        />
      </div>

      {/* Interactive Feature Modals */}
      <CampusMapModal
        isOpen={isMapOpen}
        onClose={() => setIsMapOpen(false)}
        selectedLocation={selectedMapLocation}
        allLocations={allLocations}
      />

      <AppointmentsModal
        isOpen={isAppointmentsOpen}
        onClose={() => setIsAppointmentsOpen(false)}
      />

      <RAGExplorerModal
        isOpen={isRAGOpen}
        onClose={() => setIsRAGOpen(false)}
      />

      <EmailDrafterModal
        isOpen={isEmailDrafterOpen}
        onClose={() => setIsEmailDrafterOpen(false)}
        onSendToChat={handleSendMessage}
      />

      <StudyPlanModal
        isOpen={isStudyPlannerOpen}
        onClose={() => setIsStudyPlannerOpen(false)}
        onSendToChat={handleSendMessage}
      />

      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        theme={theme}
        setTheme={setTheme}
        activeProvider={activeProvider}
        setActiveProvider={setActiveProvider}
        userApiKey={userApiKey}
        setUserApiKey={setUserApiKey}
        voiceSettings={voiceSettings}
        setVoiceSettings={setVoiceSettings}
        availableVoices={availableVoices}
      />
    </div>
  );
}
