import React, { useState, useEffect, useRef } from 'react';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import ChatArea from './components/ChatArea';
import CampusMapModal from './components/CampusMapModal';
import AppointmentsModal from './components/AppointmentsModal';
import RAGExplorerModal from './components/RAGExplorerModal';

export default function App() {
  const [activeTab, setActiveTab] = useState('chat');
  const [messages, setMessages] = useState([
    {
      id: 'welcome-msg',
      sender: 'bot',
      agent: 'Supervisor Agent',
      model: 'MERN Multi-Agent System',
      text: "Hello and welcome to the Middlesex University Mauritius AI Campus Assistant!\n\nI am backed by a multi-agent network, RAG knowledge pipeline, and real-time WebSocket communication. How can I assist you today?\n\n• Inquire about Undergraduate & Postgraduate programs\n• Check official tuition fees & installment plans\n• Campus building navigation & GPS coordinates\n• Book an academic or admissions advisory appointment\n• Launch the 360° virtual campus tour",
      steps: [
        { agent: 'Supervisor Agent', action: 'Initialization', details: 'Multi-Agent pipeline established and listening.' }
      ]
    }
  ]);

  const [activeAgentSteps, setActiveAgentSteps] = useState([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [wsConnected, setWsConnected] = useState(false);
  const [systemStatus, setSystemStatus] = useState(null);
  const [activeProvider, setActiveProvider] = useState('hybrid');
  const [notifications, setNotifications] = useState([]);
  const [ttsEnabled, setTtsEnabled] = useState(false);

  // Modals state
  const [isMapOpen, setIsMapOpen] = useState(false);
  const [selectedMapLocation, setSelectedMapLocation] = useState(null);
  const [isAppointmentsOpen, setIsAppointmentsOpen] = useState(false);
  const [isRAGOpen, setIsRAGOpen] = useState(false);
  const [allLocations, setAllLocations] = useState([]);

  const wsRef = useRef(null);

  // Fetch initial telemetry and locations
  useEffect(() => {
    fetch('/api/config')
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setSystemStatus(data);
          if (data.llm?.activeProvider) setActiveProvider(data.llm.activeProvider);
        }
      })
      .catch(console.error);

    fetch('/api/locations')
      .then(res => res.json())
      .then(data => {
        if (data.success) setAllLocations(data.locations || []);
      })
      .catch(console.error);

    fetch('/api/notifications')
      .then(res => res.json())
      .then(data => {
        if (data.success) setNotifications(data.notifications || []);
      })
      .catch(console.error);
  }, []);

  // WebSocket Connection
  useEffect(() => {
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${protocol}//${window.location.host}/ws`;

    const connectWebSocket = () => {
      try {
        const ws = new WebSocket(wsUrl);
        wsRef.current = ws;

        ws.onopen = () => {
          console.log('[WebSocket Client] Connected to backend pipeline');
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
                agent: res.agent,
                model: res.model,
                feeData: res.feeData,
                action: res.action,
                location: res.location,
                virtualTourUrl: res.virtualTourUrl,
                steps: res.steps || []
              };
              setMessages(prev => [...prev, botMsg]);
              setIsProcessing(false);
              setActiveAgentSteps([]);

              // If action requires opening map
              if (res.action === 'SHOW_CAMPUS_MAP' && res.location) {
                setSelectedMapLocation(res.location);
              }
            } else if (data.event === 'notification:new') {
              setNotifications(prev => [data.payload, ...prev]);
            }
          } catch (e) {
            console.error('Error parsing WebSocket message:', e);
          }
        };

        ws.onclose = () => {
          console.log('[WebSocket Client] Disconnected. Reconnecting in 3s...');
          setWsConnected(false);
          setTimeout(connectWebSocket, 3000);
        };

        ws.onerror = (err) => {
          console.warn('[WebSocket Client] Socket error:', err);
          ws.close();
        };
      } catch (err) {
        console.warn('WebSocket init error:', err);
      }
    };

    connectWebSocket();

    return () => {
      if (wsRef.current) wsRef.current.close();
    };
  }, []);

  // Send message through WebSocket (with HTTP fallback)
  const handleSendMessage = async (text) => {
    const userMsg = {
      id: 'user-' + Date.now(),
      sender: 'user',
      text
    };
    setMessages(prev => [...prev, userMsg]);
    setIsProcessing(true);
    setActiveAgentSteps([]);

    const historyPayload = messages.slice(-6).map(m => ({
      sender: m.sender,
      text: m.text
    }));

    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({
        type: 'chat',
        message: text,
        conversationHistory: historyPayload,
        provider: activeProvider
      }));
    } else {
      // HTTP REST Fallback
      try {
        const res = await fetch('/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            message: text,
            conversationHistory: historyPayload,
            provider: activeProvider
          })
        });
        const data = await res.json();
        if (data.success) {
          const botMsg = {
            id: 'bot-' + Date.now(),
            sender: 'bot',
            text: data.reply,
            agent: data.agent,
            model: data.model,
            feeData: data.feeData,
            action: data.action,
            location: data.location,
            virtualTourUrl: data.virtualTourUrl,
            steps: data.steps || []
          };
          setMessages(prev => [...prev, botMsg]);
        }
      } catch (err) {
        setMessages(prev => [
          ...prev,
          {
            id: 'err-' + Date.now(),
            sender: 'bot',
            agent: 'Supervisor Agent',
            text: 'Connection error while processing query: ' + err.message
          }
        ]);
      } finally {
        setIsProcessing(false);
      }
    }
  };

  const handleProviderChange = async (provider) => {
    setActiveProvider(provider);
    try {
      await fetch('/api/config/provider', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ provider })
      });
    } catch (e) {
      console.warn('Could not update backend provider:', e);
    }
  };

  const handleNewChat = () => {
    setMessages([
      {
        id: 'new-welcome',
        sender: 'bot',
        agent: 'Supervisor Agent',
        model: 'MERN Multi-Agent System',
        text: "New conversation session initialized. What would you like to inquire about?",
        steps: []
      }
    ]);
  };

  const handleOpenVirtualTour = () => {
    window.open('https://app.lapentor.com/sphere/mdx-mru-virtual-tour', '_blank');
  };

  return (
    <div style={{ display: 'flex', height: '100vh', width: '100vw', overflow: 'hidden' }}>
      {/* Sidebar */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={(tab) => {
          if (tab === 'map') setIsMapOpen(true);
          else if (tab === 'appointments') setIsAppointmentsOpen(true);
          else if (tab === 'rag') setIsRAGOpen(true);
          else if (tab === 'tour') handleOpenVirtualTour();
          else setActiveTab('chat');
        }}
        onNewChat={handleNewChat}
        systemStatus={systemStatus}
        wsConnected={wsConnected}
        onQuickPrompt={handleSendMessage}
      />

      {/* Main Container */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden' }}>
        <Header
          activeProvider={activeProvider}
          onChangeProvider={handleProviderChange}
          notifications={notifications}
          ttsEnabled={ttsEnabled}
          setTtsEnabled={setTtsEnabled}
          onOpenVirtualTour={handleOpenVirtualTour}
        />

        <ChatArea
          messages={messages}
          onSendMessage={handleSendMessage}
          activeAgentSteps={activeAgentSteps}
          isProcessing={isProcessing}
          ttsEnabled={ttsEnabled}
          onOpenMap={(loc) => {
            setSelectedMapLocation(loc);
            setIsMapOpen(true);
          }}
          onOpenAppointments={() => setIsAppointmentsOpen(true)}
          onOpenVirtualTour={handleOpenVirtualTour}
        />
      </div>

      {/* Interactive Modals */}
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
    </div>
  );
}
