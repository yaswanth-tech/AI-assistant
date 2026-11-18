import React, { useState, useEffect, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import {
  Send,
  Mic,
  MicOff,
  Bot,
  User,
  Paperclip,
  X,
  Copy,
  Check,
  Volume2,
  VolumeX,
  RotateCcw,
  MapPin,
  Calendar,
  ExternalLink,
  Download,
  Mail,
  BookOpen,
  FileText,
  Sparkles,
  Layers,
  ChevronDown,
  ChevronUp,
  Square
} from 'lucide-react';

export default function ChatArea({
  messages = [],
  onSendMessage,
  activeAgentSteps = [],
  isProcessing,
  onStopGenerating,
  ttsEnabled,
  voiceSettings,
  onOpenMap,
  onOpenAppointments,
  onOpenVirtualTour,
  onOpenEmailDrafter,
  onOpenStudyPlanner,
  onRegenerate
}) {
  const [inputText, setInputText] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [attachedFile, setAttachedFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [copiedId, setCopiedId] = useState(null);
  const [playingMsgId, setPlayingMsgId] = useState(null);
  const [expandedSteps, setExpandedSteps] = useState({});

  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);
  const recognitionRef = useRef(null);
  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);
  const canvasRef = useRef(null);
  const animFrameRef = useRef(null);
  const textareaRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, activeAgentSteps, isProcessing]);

  // Adjust textarea height automatically
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 140)}px`;
    }
  }, [inputText]);

  // Setup Web Speech API for voice input
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      recognition.onresult = (event) => {
        let transcript = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          transcript += event.results[i][0].transcript;
        }
        setInputText(transcript);
      };

      recognition.onend = () => {
        setIsRecording(false);
        stopAudioWave();
      };

      recognition.onerror = (e) => {
        console.warn('Speech recognition error:', e.error);
        setIsRecording(false);
        stopAudioWave();
      };

      recognitionRef.current = recognition;
    }
  }, []);

  // Audio Waveform visualizer
  const startAudioWave = () => {
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      const ctx = new AudioCtx();
      audioContextRef.current = ctx;

      navigator.mediaDevices.getUserMedia({ audio: true }).then((stream) => {
        const analyser = ctx.createAnalyser();
        analyser.fftSize = 256;
        analyserRef.current = analyser;

        const source = ctx.createMediaStreamSource(stream);
        source.connect(analyser);

        const canvas = canvasRef.current;
        if (!canvas) return;
        const canvasCtx = canvas.getContext('2d');
        const bufferLength = analyser.frequencyBinCount;
        const dataArray = new Uint8Array(bufferLength);

        const draw = () => {
          animFrameRef.current = requestAnimationFrame(draw);
          analyser.getByteFrequencyData(dataArray);

          canvasCtx.clearRect(0, 0, canvas.width, canvas.height);
          const barWidth = (canvas.width / bufferLength) * 2.5;
          let x = 0;

          for (let i = 0; i < bufferLength; i++) {
            const barHeight = (dataArray[i] / 255) * canvas.height;
            canvasCtx.fillStyle = `rgb(${barHeight + 90}, 102, 241)`;
            canvasCtx.fillRect(x, canvas.height - barHeight, barWidth, barHeight);
            x += barWidth + 1;
          }
        };
        draw();
      }).catch((err) => {
        console.warn('Microphone stream error:', err);
      });
    } catch (err) {
      console.warn('AudioContext not supported');
    }
  };

  const stopAudioWave = () => {
    if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
      audioContextRef.current.close().catch(() => {});
    }
  };

  const toggleRecording = () => {
    if (!recognitionRef.current) {
      alert('Speech Recognition is not supported by your browser. Please use Chrome, Edge, or Safari.');
      return;
    }

    if (isRecording) {
      recognitionRef.current.stop();
      setIsRecording(false);
      stopAudioWave();
    } else {
      setIsRecording(true);
      startAudioWave();
      recognitionRef.current.start();
    }
  };

  // Text-To-Speech (TTS) Voice playback
  const speakMessage = (text, msgId) => {
    if (!window.speechSynthesis) return;

    if (playingMsgId === msgId) {
      window.speechSynthesis.cancel();
      setPlayingMsgId(null);
      return;
    }

    window.speechSynthesis.cancel();
    setPlayingMsgId(msgId);

    // Clean markdown characters for clearer speech
    const cleanText = text.replace(/[*#_`~[\]]/g, '').slice(0, 600);
    const utterance = new SpeechSynthesisUtterance(cleanText);

    if (voiceSettings?.voiceURI) {
      const voices = window.speechSynthesis.getVoices();
      const chosen = voices.find(v => v.voiceURI === voiceSettings.voiceURI);
      if (chosen) utterance.voice = chosen;
    }
    if (voiceSettings?.rate) utterance.rate = voiceSettings.rate;

    utterance.onend = () => setPlayingMsgId(null);
    utterance.onerror = () => setPlayingMsgId(null);

    window.speechSynthesis.speak(utterance);
  };

  // Auto-speak new bot messages if enabled
  useEffect(() => {
    if (ttsEnabled && messages.length > 0) {
      const last = messages[messages.length - 1];
      if (last.sender === 'bot') {
        speakMessage(last.text, last.id);
      }
    }
  }, [messages, ttsEnabled]);

  // Handle file uploads (PDF / Docs)
  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData
      });
      const data = await res.json();
      if (data.success) {
        setAttachedFile({
          filename: data.filename,
          text: data.text,
          pageCount: data.pageCount,
          wordCount: data.wordCount,
          size: data.size
        });
      } else {
        alert(data.error || 'Failed to upload document.');
      }
    } catch (err) {
      alert('Upload error: ' + err.message);
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleCopyText = (text, id) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleSubmit = (e) => {
    if (e) e.preventDefault();
    if ((!inputText.trim() && !attachedFile) || isProcessing) return;

    onSendMessage(inputText.trim(), attachedFile);
    setInputText('');
    setAttachedFile(null);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const toggleSteps = (msgId) => {
    setExpandedSteps(prev => ({ ...prev, [msgId]: !prev[msgId] }));
  };

  const quickPills = [
    { label: '🎓 Available Degrees', query: 'What undergraduate and postgraduate degrees are offered at Middlesex University Mauritius?' },
    { label: '💰 Tuition Fee Schedules', query: 'What are the tuition fees, deposit, and installment plans for BSc Computer Science?' },
    { label: '📍 Find Library & GPS', query: 'Where is the Campus Library located and how do I get there?' },
    { label: '📅 Book Advising Session', query: 'I would like to book an appointment with academic advisory.' },
    { label: '✉️ Draft Email to Professor', query: 'Can you draft a professional email to my professor requesting an assignment extension?' },
    { label: '📚 Create Study Timetable', query: 'Generate an exam study plan for my semester modules.' }
  ];

  return (
    <div style={{
      flex: 1,
      display: 'flex',
      flexDirection: 'column',
      height: 'calc(100vh - 60px)',
      background: 'var(--bg-chat)',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Messages Scroll Feed */}
      <div style={{
        flex: 1,
        overflowY: 'auto',
        padding: '24px 20px',
        display: 'flex',
        flexDirection: 'column',
        gap: '24px',
        maxWidth: '860px',
        width: '100%',
        margin: '0 auto'
      }}>
        {messages.map((msg, index) => {
          const isUser = msg.sender === 'user';
          const msgId = msg.id || `msg-${index}`;
          const isStepsOpen = !!expandedSteps[msgId];
          const isSpeaking = playingMsgId === msgId;

          return (
            <div
              key={msgId}
              style={{
                display: 'flex',
                gap: '12px',
                flexDirection: isUser ? 'row-reverse' : 'row',
                alignSelf: isUser ? 'flex-end' : 'flex-start',
                width: isUser ? 'auto' : '100%',
                maxWidth: isUser ? '80%' : '100%'
              }}
            >
              {/* Avatar */}
              <div style={{
                width: '32px',
                height: '32px',
                borderRadius: '8px',
                background: isUser ? 'var(--accent-gradient)' : 'rgba(99, 102, 241, 0.15)',
                color: isUser ? '#ffffff' : 'var(--accent)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
                marginTop: '2px',
                border: isUser ? 'none' : '1px solid var(--border-subtle)'
              }}>
                {isUser ? <User size={16} /> : <Bot size={17} />}
              </div>

              {/* Message Block */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', maxWidth: '100%', flex: 1 }}>
                {/* Bot Agent Header */}
                {!isUser && msg.agent && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{
                      fontSize: '11px',
                      fontWeight: '700',
                      color: 'var(--accent)',
                      background: 'rgba(99, 102, 241, 0.1)',
                      padding: '2px 8px',
                      borderRadius: '4px',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}>
                      <Layers size={10} /> {msg.agent}
                    </span>
                    {msg.model && (
                      <span style={{ fontSize: '10.5px', color: 'var(--text-muted)' }}>
                        {msg.model}
                      </span>
                    )}
                  </div>
                )}

                {/* Attachment Pill if user attached document */}
                {msg.attachment && (
                  <div style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '4px 10px',
                    borderRadius: '6px',
                    background: 'var(--bg-card)',
                    border: '1px solid var(--border-subtle)',
                    fontSize: '11.5px',
                    color: 'var(--text-primary)',
                    marginBottom: '4px'
                  }}>
                    <FileText size={13} color="var(--accent)" />
                    <strong>{msg.attachment.filename}</strong>
                    {msg.attachment.wordCount && (
                      <span style={{ color: 'var(--text-muted)' }}>({msg.attachment.wordCount} words)</span>
                    )}
                  </div>
                )}

                {/* Bubble / Content */}
                <div style={{
                  padding: isUser ? '12px 16px' : '14px 18px',
                  borderRadius: isUser ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
                  background: isUser ? 'var(--bg-user-bubble)' : 'var(--bg-bot-bubble)',
                  color: isUser ? '#ffffff' : 'var(--text-primary)',
                  border: isUser ? 'none' : '1px solid var(--border-subtle)',
                  boxShadow: 'var(--shadow-subtle)',
                  fontSize: '14px',
                  lineHeight: '1.6'
                }}>
                  {isUser ? (
                    <div style={{ whiteSpace: 'pre-wrap' }}>{msg.text}</div>
                  ) : (
                    <div className="markdown-body">
                      <ReactMarkdown remarkPlugins={[remarkGfm]}>
                        {msg.text}
                      </ReactMarkdown>
                    </div>
                  )}

                  {/* =========================================
                      RICH CARD WIDGETS
                     ========================================= */}

                  {/* Map / GPS Card */}
                  {msg.richCard?.type === 'map' && (
                    <div style={{
                      marginTop: '14px',
                      padding: '14px',
                      background: 'var(--bg-card)',
                      borderRadius: '10px',
                      border: '1px solid var(--border-subtle)',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '10px'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <MapPin size={18} color="var(--accent)" />
                          <span style={{ fontSize: '13px', fontWeight: '700' }}>
                            {msg.richCard.location?.LocationName || 'Campus Landmark'}
                          </span>
                        </div>
                        <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontFamily: 'monospace' }}>
                          {msg.richCard.location?.Coordinates?.lat}, {msg.richCard.location?.Coordinates?.lng}
                        </span>
                      </div>

                      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                        <a
                          href={msg.richCard.googleMapsUrl || `https://www.google.com/maps/dir/?api=1&destination=${msg.richCard.location?.Coordinates?.lat},${msg.richCard.location?.Coordinates?.lng}`}
                          target="_blank"
                          rel="noreferrer"
                          style={{
                            padding: '7px 12px',
                            borderRadius: '6px',
                            background: 'var(--accent-gradient)',
                            color: 'white',
                            fontSize: '12px',
                            fontWeight: '600',
                            textDecoration: 'none',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '5px'
                          }}
                        >
                          <ExternalLink size={13} /> Open Directions in Google Maps
                        </a>

                        <button
                          onClick={() => onOpenMap(msg.richCard.location)}
                          style={{
                            padding: '7px 12px',
                            borderRadius: '6px',
                            background: 'transparent',
                            border: '1px solid var(--border-subtle)',
                            color: 'var(--text-primary)',
                            fontSize: '12px',
                            fontWeight: '600',
                            cursor: 'pointer'
                          }}
                        >
                          View Interactive Campus Radar
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Calendar / Appointment Card */}
                  {msg.richCard?.type === 'calendar' && (
                    <div style={{
                      marginTop: '14px',
                      padding: '14px',
                      background: 'var(--bg-card)',
                      borderRadius: '10px',
                      border: '1px solid var(--border-subtle)',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '10px'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <Calendar size={18} color="#10b981" />
                          <span style={{ fontSize: '13px', fontWeight: '700' }}>
                            Confirmed Session: {msg.richCard.appointment?.department}
                          </span>
                        </div>
                        <span style={{ fontSize: '10px', background: 'rgba(16, 185, 129, 0.15)', color: '#10b981', padding: '2px 6px', borderRadius: '4px', fontWeight: '700' }}>
                          SYNCED
                        </span>
                      </div>

                      <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                        Scheduled for: <strong>{new Date(msg.richCard.appointment?.dateTime).toLocaleString([], { dateStyle: 'full', timeStyle: 'short' })}</strong>
                      </div>

                      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                        {msg.richCard.googleCalendarUrl && (
                          <a
                            href={msg.richCard.googleCalendarUrl}
                            target="_blank"
                            rel="noreferrer"
                            style={{
                              padding: '7px 12px',
                              borderRadius: '6px',
                              background: '#10b981',
                              color: 'white',
                              fontSize: '12px',
                              fontWeight: '600',
                              textDecoration: 'none',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '5px'
                            }}
                          >
                            <Calendar size={13} /> Add to Google Calendar
                          </a>
                        )}

                        <a
                          href={`/api/appointments/${msg.richCard.appointment?._id || msg.richCard.appointment?.id}/ics`}
                          download="appointment.ics"
                          style={{
                            padding: '7px 12px',
                            borderRadius: '6px',
                            background: 'transparent',
                            border: '1px solid var(--border-subtle)',
                            color: 'var(--text-primary)',
                            fontSize: '12px',
                            fontWeight: '600',
                            textDecoration: 'none',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '5px'
                          }}
                        >
                          <Download size={13} /> Download .ics File
                        </a>
                      </div>
                    </div>
                  )}

                  {/* Email Draft Card */}
                  {msg.richCard?.type === 'email' && (
                    <div style={{
                      marginTop: '14px',
                      padding: '12px 14px',
                      background: 'var(--bg-card)',
                      borderRadius: '8px',
                      border: '1px solid var(--border-subtle)',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '8px'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', fontWeight: '700', color: 'var(--text-primary)' }}>
                        <Mail size={15} color="var(--accent)" />
                        <span>Email Actions: {msg.richCard.email?.subject}</span>
                      </div>
                      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                        <button
                          onClick={() => handleCopyText(`To: ${msg.richCard.email?.recipient}\nSubject: ${msg.richCard.email?.subject}\n\n${msg.richCard.email?.body}`, 'email-card')}
                          style={{
                            padding: '6px 12px',
                            borderRadius: '6px',
                            border: '1px solid var(--border-subtle)',
                            background: 'transparent',
                            color: 'var(--text-primary)',
                            fontSize: '11.5px',
                            fontWeight: '600',
                            cursor: 'pointer',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '5px'
                          }}
                        >
                          {copiedId === 'email-card' ? <Check size={13} color="#10b981" /> : <Copy size={13} />}
                          {copiedId === 'email-card' ? 'Copied' : 'Copy Email'}
                        </button>

                        {msg.richCard.email?.mailtoUrl && (
                          <a
                            href={msg.richCard.email.mailtoUrl}
                            style={{
                              padding: '6px 12px',
                              borderRadius: '6px',
                              background: 'var(--accent)',
                              color: 'white',
                              fontSize: '11.5px',
                              fontWeight: '600',
                              textDecoration: 'none',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '5px'
                            }}
                          >
                            <ExternalLink size={13} /> Open in Email App
                          </a>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Virtual Tour Card */}
                  {msg.richCard?.type === 'virtual_tour' && (
                    <div style={{ marginTop: '12px' }}>
                      <button
                        onClick={onOpenVirtualTour}
                        style={{
                          padding: '8px 14px',
                          borderRadius: '8px',
                          background: 'linear-gradient(135deg, #ec4899, #8b5cf6)',
                          color: 'white',
                          fontSize: '12px',
                          fontWeight: '600',
                          border: 'none',
                          cursor: 'pointer',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '6px'
                        }}
                      >
                        <Sparkles size={14} /> Launch 360° Interactive Campus Tour
                      </button>
                    </div>
                  )}
                </div>

                {/* Message Actions Bar (Copy, Speak, Regenerate, Agent Steps) */}
                {!isUser && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '2px', paddingLeft: '4px' }}>
                    {/* Copy text */}
                    <button
                      onClick={() => handleCopyText(msg.text, msgId)}
                      title="Copy message"
                      style={{
                        background: 'transparent',
                        border: 'none',
                        color: 'var(--text-muted)',
                        cursor: 'pointer',
                        padding: '3px',
                        borderRadius: '4px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '3px',
                        fontSize: '11px'
                      }}
                    >
                      {copiedId === msgId ? <Check size={13} color="#10b981" /> : <Copy size={13} />}
                      <span>{copiedId === msgId ? 'Copied' : 'Copy'}</span>
                    </button>

                    {/* Speak TTS */}
                    <button
                      onClick={() => speakMessage(msg.text, msgId)}
                      title={isSpeaking ? 'Stop speaking' : 'Read message aloud'}
                      style={{
                        background: 'transparent',
                        border: 'none',
                        color: isSpeaking ? 'var(--accent)' : 'var(--text-muted)',
                        cursor: 'pointer',
                        padding: '3px',
                        borderRadius: '4px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '3px',
                        fontSize: '11px'
                      }}
                    >
                      {isSpeaking ? <VolumeX size={13} /> : <Volume2 size={13} />}
                      <span>{isSpeaking ? 'Stop Voice' : 'Speak'}</span>
                    </button>

                    {/* Regenerate if last bot message */}
                    {index === messages.length - 1 && onRegenerate && (
                      <button
                        onClick={onRegenerate}
                        title="Regenerate response"
                        style={{
                          background: 'transparent',
                          border: 'none',
                          color: 'var(--text-muted)',
                          cursor: 'pointer',
                          padding: '3px',
                          borderRadius: '4px',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '3px',
                          fontSize: '11px'
                        }}
                      >
                        <RotateCcw size={13} />
                        <span>Regenerate</span>
                      </button>
                    )}

                    {/* Agent Steps Timeline toggle */}
                    {msg.steps && msg.steps.length > 0 && (
                      <button
                        onClick={() => toggleSteps(msgId)}
                        style={{
                          background: 'transparent',
                          border: 'none',
                          color: 'var(--accent)',
                          cursor: 'pointer',
                          padding: '3px 6px',
                          borderRadius: '4px',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '3px',
                          fontSize: '11px',
                          marginLeft: 'auto'
                        }}
                      >
                        <Layers size={11} />
                        <span>{isStepsOpen ? 'Hide Steps' : `${msg.steps.length} Steps`}</span>
                        {isStepsOpen ? <ChevronUp size={11} /> : <ChevronDown size={11} />}
                      </button>
                    )}
                  </div>
                )}

                {/* Collapsible Reasoning Steps */}
                {!isUser && isStepsOpen && msg.steps && (
                  <div style={{
                    marginTop: '4px',
                    padding: '8px 12px',
                    background: 'var(--bg-card)',
                    borderRadius: '8px',
                    border: '1px solid var(--border-subtle)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '5px'
                  }}>
                    {msg.steps.map((st, sIdx) => (
                      <div key={sIdx} style={{ fontSize: '11px', display: 'flex', gap: '8px', alignItems: 'flex-start' }}>
                        <span style={{
                          background: 'rgba(99, 102, 241, 0.15)',
                          color: 'var(--accent)',
                          padding: '1px 5px',
                          borderRadius: '3px',
                          fontWeight: '700',
                          whiteSpace: 'nowrap'
                        }}>
                          {st.agent}
                        </span>
                        <span style={{ color: 'var(--text-secondary)' }}>
                          <strong>{st.action}:</strong> {st.details}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {/* Live Processing / Streaming Indicator */}
        {isProcessing && (
          <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start', maxWidth: '80%' }}>
            <div style={{
              width: '32px',
              height: '32px',
              borderRadius: '8px',
              background: 'rgba(99, 102, 241, 0.15)',
              color: 'var(--accent)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: '1px solid var(--border-subtle)'
            }}>
              <Bot size={17} />
            </div>

            <div style={{
              padding: '14px 18px',
              borderRadius: '16px 16px 16px 4px',
              background: 'var(--bg-bot-bubble)',
              border: '1px solid var(--border-subtle)',
              boxShadow: 'var(--shadow-subtle)',
              display: 'flex',
              flexDirection: 'column',
              gap: '8px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span className="typing-dot"></span>
                <span className="typing-dot"></span>
                <span className="typing-dot"></span>
                <span style={{ fontSize: '12px', color: 'var(--text-muted)', marginLeft: '6px' }}>
                  AI Assistant thinking...
                </span>
              </div>

              {activeAgentSteps.length > 0 && (
                <div style={{ fontSize: '11px', color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', gap: '3px' }}>
                  {activeAgentSteps.slice(-2).map((st, i) => (
                    <div key={i}>
                      <span style={{ color: 'var(--accent)', fontWeight: '600' }}>[{st.agent}]</span> {st.action}: {st.details}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Audio Wave Visualizer Overlay during Voice Recording */}
      {isRecording && (
        <div style={{
          position: 'absolute',
          bottom: '120px',
          left: '50%',
          transform: 'translateX(-50%)',
          background: 'var(--bg-card)',
          border: '1px solid #ef4444',
          borderRadius: '24px',
          padding: '8px 20px',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          boxShadow: '0 8px 24px rgba(239, 68, 68, 0.25)',
          zIndex: 30
        }}>
          <span style={{ fontSize: '12px', fontWeight: '700', color: '#ef4444' }}>
            Listening... Speak now
          </span>
          <canvas ref={canvasRef} width="140" height="20" style={{ display: 'block' }}></canvas>
        </div>
      )}

      {/* Bottom Input Area */}
      <div style={{
        padding: '12px 20px 18px 20px',
        borderTop: '1px solid var(--border-subtle)',
        background: 'var(--bg-header)',
        backdropFilter: 'blur(16px)'
      }}>
        <div style={{ maxWidth: '860px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {/* Quick Prompt Chips */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            overflowX: 'auto',
            paddingBottom: '4px',
            scrollbarWidth: 'none'
          }}>
            {quickPills.map((pill, idx) => (
              <button
                key={idx}
                onClick={() => onSendMessage(pill.query)}
                disabled={isProcessing}
                style={{
                  padding: '5px 10px',
                  borderRadius: '16px',
                  border: '1px solid var(--border-subtle)',
                  background: 'var(--bg-card)',
                  color: 'var(--text-secondary)',
                  fontSize: '11px',
                  fontWeight: '600',
                  whiteSpace: 'nowrap',
                  cursor: isProcessing ? 'not-allowed' : 'pointer'
                }}
                onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'var(--accent)'; e.currentTarget.style.color = 'var(--accent)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--border-subtle)'; e.currentTarget.style.color = 'var(--text-secondary)'; }}
              >
                {pill.label}
              </button>
            ))}
          </div>

          {/* Attached Document Pill Preview */}
          {attachedFile && (
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              background: 'rgba(99, 102, 241, 0.12)',
              border: '1px solid var(--accent)',
              borderRadius: '8px',
              padding: '6px 12px',
              fontSize: '12px',
              color: 'var(--text-primary)',
              alignSelf: 'flex-start'
            }}>
              <FileText size={15} color="var(--accent)" />
              <span><strong>{attachedFile.filename}</strong> ({attachedFile.wordCount || 0} words)</span>
              <button
                onClick={() => setAttachedFile(null)}
                style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
              >
                <X size={14} />
              </button>
            </div>
          )}

          {/* Prompt Form */}
          <form
            onSubmit={handleSubmit}
            style={{
              display: 'flex',
              alignItems: 'flex-end',
              gap: '8px',
              background: 'var(--bg-input)',
              border: '1px solid var(--border-subtle)',
              borderRadius: '14px',
              padding: '8px 10px',
              boxShadow: 'var(--shadow-subtle)',
              position: 'relative'
            }}
          >
            {/* Hidden File Input */}
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileUpload}
              accept=".pdf,.txt,.md,.doc,.docx,.json"
              style={{ display: 'none' }}
            />

            {/* Paperclip Document Attach */}
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading || isProcessing}
              title="Attach PDF or document to summarize or analyze"
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '8px',
                border: 'none',
                background: 'transparent',
                color: attachedFile ? 'var(--accent)' : 'var(--text-muted)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
              }}
            >
              <Paperclip size={18} />
            </button>

            {/* Voice Mic Button */}
            <button
              type="button"
              onClick={toggleRecording}
              className={isRecording ? 'mic-recording' : ''}
              title={isRecording ? 'Stop Recording' : 'Microphone (Voice to Text)'}
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '8px',
                border: 'none',
                background: isRecording ? '#ef4444' : 'transparent',
                color: isRecording ? '#ffffff' : 'var(--text-muted)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
              }}
            >
              {isRecording ? <MicOff size={18} /> : <Mic size={18} />}
            </button>

            {/* Textarea */}
            <textarea
              ref={textareaRef}
              rows={1}
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={isRecording ? "Listening to your voice..." : "Ask anything about campus life, courses, fees, or study guidance..."}
              disabled={isProcessing}
              style={{
                flex: 1,
                border: 'none',
                outline: 'none',
                background: 'transparent',
                color: 'var(--text-primary)',
                fontSize: '13.5px',
                lineHeight: '1.5',
                resize: 'none',
                padding: '6px 4px',
                fontFamily: 'inherit'
              }}
            />

            {/* Send or Stop Generating Button */}
            {isProcessing ? (
              <button
                type="button"
                onClick={onStopGenerating}
                title="Stop Generating"
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '8px',
                  border: 'none',
                  background: '#ef4444',
                  color: 'white',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0
                }}
              >
                <Square size={14} fill="currentColor" />
              </button>
            ) : (
              <button
                type="submit"
                disabled={!inputText.trim() && !attachedFile}
                title="Send Message (Enter)"
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '8px',
                  border: 'none',
                  background: (!inputText.trim() && !attachedFile) ? 'transparent' : 'var(--accent-gradient)',
                  color: (!inputText.trim() && !attachedFile) ? 'var(--text-muted)' : '#ffffff',
                  cursor: (!inputText.trim() && !attachedFile) ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0
                }}
              >
                <Send size={16} />
              </button>
            )}
          </form>
        </div>
      </div>
    </div>
  );
}
