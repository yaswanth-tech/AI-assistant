import React, { useState, useEffect, useRef } from 'react';
import { 
  Send, 
  Mic, 
  MicOff, 
  Bot, 
  User, 
  MapPin, 
  Calendar, 
  Compass, 
  ChevronDown, 
  ChevronUp, 
  ExternalLink,
  Layers,
  Sparkles,
  DollarSign
} from 'lucide-react';

export default function ChatArea({
  messages = [],
  onSendMessage,
  activeAgentSteps = [],
  isProcessing,
  ttsEnabled,
  onOpenMap,
  onOpenAppointments,
  onOpenVirtualTour
}) {
  const [inputText, setInputText] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [expandedSteps, setExpandedSteps] = useState({});
  const messagesEndRef = useRef(null);
  const recognitionRef = useRef(null);
  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);
  const canvasRef = useRef(null);
  const animFrameRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, activeAgentSteps, isProcessing]);

  // Speech Recognition Setup
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

  // Audio Waveform Visualizer
  const startAudioWave = () => {
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      const ctx = new AudioCtx();
      audioContextRef.current = ctx;

      navigator.mediaDevices.getUserMedia({ audio: true }).then(stream => {
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
            canvasCtx.fillStyle = `rgb(${barHeight + 100}, 99, 241)`;
            canvasCtx.fillRect(x, canvas.height - barHeight, barWidth, barHeight);
            x += barWidth + 1;
          }
        };
        draw();
      }).catch(err => {
        console.warn('Microphone stream access error:', err);
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
      alert('Speech Recognition is not supported on this browser. Try Google Chrome or Microsoft Edge.');
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

  // Text-to-speech for bot answers
  const speak = (text) => {
    if (!ttsEnabled || !window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const cleanText = text.replace(/[*#_`]/g, '').slice(0, 300);
    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.rate = 1.0;
    utterance.pitch = 1.0;
    window.speechSynthesis.speak(utterance);
  };

  // Trigger speak when new bot message arrives
  useEffect(() => {
    const lastMsg = messages[messages.length - 1];
    if (lastMsg && lastMsg.sender === 'bot') {
      speak(lastMsg.text);
    }
  }, [messages]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!inputText.trim() || isProcessing) return;
    onSendMessage(inputText.trim());
    setInputText('');
  };

  const toggleSteps = (msgId) => {
    setExpandedSteps(prev => ({
      ...prev,
      [msgId]: !prev[msgId]
    }));
  };

  return (
    <div style={{
      flex: 1,
      display: 'flex',
      flexDirection: 'column',
      height: 'calc(100vh - 64px)',
      background: 'radial-gradient(circle at 50% 10%, rgba(99, 102, 241, 0.08), transparent 70%), #0b0f19',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Messages Scroll Area */}
      <div style={{
        flex: 1,
        overflowY: 'auto',
        padding: '24px',
        display: 'flex',
        flexDirection: 'column',
        gap: '20px'
      }}>
        {messages.map((msg, index) => {
          const isUser = msg.sender === 'user';
          const msgId = msg.id || index;
          const hasSteps = msg.steps && msg.steps.length > 0;
          const isStepsOpen = !!expandedSteps[msgId];

          return (
            <div
              key={msgId}
              style={{
                display: 'flex',
                gap: '14px',
                alignSelf: isUser ? 'flex-end' : 'flex-start',
                maxWidth: '75%',
                flexDirection: isUser ? 'row-reverse' : 'row'
              }}
            >
              {/* Avatar */}
              <div style={{
                width: '36px',
                height: '36px',
                borderRadius: '50%',
                background: isUser ? 'linear-gradient(135deg, #0e36dd, #9738fd)' : 'linear-gradient(135deg, #4f46e5, #7c3aed)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
                boxShadow: isUser ? '0 4px 10px rgba(14, 54, 221, 0.3)' : '0 4px 10px rgba(79, 70, 229, 0.3)'
              }}>
                {isUser ? <User size={18} color="#ffffff" /> : <Bot size={18} color="#ffffff" />}
              </div>

              {/* Message Content Bubble */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                {/* Agent Tag */}
                {!isUser && msg.agent && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span className="badge-agent">
                      <Layers size={10} /> {msg.agent}
                    </span>
                    {msg.model && (
                      <span style={{ fontSize: '10px', color: '#64748b' }}>
                        via {msg.model}
                      </span>
                    )}
                  </div>
                )}

                <div style={{
                  padding: '14px 18px',
                  borderRadius: isUser ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
                  background: isUser ? 'linear-gradient(135deg, #3b82f6, #6366f1)' : 'rgba(30, 41, 59, 0.75)',
                  border: isUser ? 'none' : '1px solid rgba(255, 255, 255, 0.08)',
                  backdropFilter: 'blur(12px)',
                  color: '#f8fafc',
                  fontSize: '13.5px',
                  lineHeight: '1.6',
                  whiteSpace: 'pre-line',
                  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.2)'
                }}>
                  {msg.text}

                  {/* Fee Breakdown Card */}
                  {msg.feeData && (
                    <div style={{
                      marginTop: '12px',
                      background: 'rgba(15, 23, 42, 0.7)',
                      border: '1px solid rgba(99, 102, 241, 0.3)',
                      borderRadius: '10px',
                      padding: '12px'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#818cf8', fontWeight: '700', fontSize: '13px', marginBottom: '8px' }}>
                        <DollarSign size={16} /> Official Fee Breakdown
                      </div>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '8px', fontSize: '12px' }}>
                        <div><span style={{ color: '#94a3b8' }}>Tuition:</span> <strong style={{ color: '#f1f5f9' }}>{msg.feeData.TuitionFees}</strong></div>
                        <div><span style={{ color: '#94a3b8' }}>Admin Fee:</span> <strong style={{ color: '#f1f5f9' }}>{msg.feeData.AdminFees}</strong></div>
                        <div><span style={{ color: '#94a3b8' }}>Full Payment:</span> <strong style={{ color: '#34d399' }}>{msg.feeData.FullPayment}</strong></div>
                        <div><span style={{ color: '#94a3b8' }}>Deposit:</span> <strong style={{ color: '#fbbf24' }}>{msg.feeData.InstallmentNonRefundableDeposit}</strong></div>
                      </div>
                    </div>
                  )}

                  {/* Action Badges / CTA */}
                  {msg.action === 'SHOW_CAMPUS_MAP' && (
                    <div style={{ marginTop: '12px' }}>
                      <button
                        onClick={() => onOpenMap(msg.location)}
                        style={{
                          background: 'linear-gradient(135deg, #4f46e5, #7c3aed)',
                          border: 'none',
                          borderRadius: '8px',
                          padding: '8px 14px',
                          color: '#ffffff',
                          fontWeight: '600',
                          fontSize: '12px',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '6px',
                          cursor: 'pointer'
                        }}
                      >
                        <MapPin size={14} /> Open Interactive Map & GPS
                      </button>
                    </div>
                  )}

                  {msg.action === 'OPEN_VIRTUAL_TOUR' && (
                    <div style={{ marginTop: '12px' }}>
                      <button
                        onClick={onOpenVirtualTour}
                        style={{
                          background: 'linear-gradient(135deg, #ec4899, #8b5cf6)',
                          border: 'none',
                          borderRadius: '8px',
                          padding: '8px 14px',
                          color: '#ffffff',
                          fontWeight: '600',
                          fontSize: '12px',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '6px',
                          cursor: 'pointer'
                        }}
                      >
                        <Compass size={14} /> Launch 360° Virtual Tour
                      </button>
                    </div>
                  )}

                  {msg.action === 'PROMPT_APPOINTMENT_FORM' && (
                    <div style={{ marginTop: '12px' }}>
                      <button
                        onClick={onOpenAppointments}
                        style={{
                          background: 'linear-gradient(135deg, #10b981, #059669)',
                          border: 'none',
                          borderRadius: '8px',
                          padding: '8px 14px',
                          color: '#ffffff',
                          fontWeight: '600',
                          fontSize: '12px',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '6px',
                          cursor: 'pointer'
                        }}
                      >
                        <Calendar size={14} /> Schedule Advisory Meeting
                      </button>
                    </div>
                  )}
                </div>

                {/* Collapsible Multi-Agent Deliberation Timeline */}
                {hasSteps && (
                  <div style={{ marginTop: '2px' }}>
                    <button
                      onClick={() => toggleSteps(msgId)}
                      style={{
                        background: 'transparent',
                        border: 'none',
                        color: '#818cf8',
                        fontSize: '11px',
                        fontWeight: '600',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                        padding: '2px 0'
                      }}
                    >
                      <Layers size={12} />
                      {isStepsOpen ? 'Hide Multi-Agent Steps' : `View ${msg.steps.length} Agent Reasoning Steps`}
                      {isStepsOpen ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
                    </button>

                    {isStepsOpen && (
                      <div style={{
                        marginTop: '6px',
                        padding: '10px 12px',
                        background: 'rgba(15, 23, 42, 0.8)',
                        border: '1px solid rgba(255, 255, 255, 0.06)',
                        borderRadius: '8px',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '6px'
                      }}>
                        {msg.steps.map((st, sIdx) => (
                          <div key={sIdx} style={{ fontSize: '11px', display: 'flex', gap: '8px', alignItems: 'flex-start' }}>
                            <span style={{
                              background: 'rgba(99, 102, 241, 0.2)',
                              color: '#a5b4fc',
                              padding: '1px 5px',
                              borderRadius: '3px',
                              fontWeight: '600',
                              whiteSpace: 'nowrap'
                            }}>
                              {st.agent}
                            </span>
                            <span style={{ color: '#cbd5e1' }}>
                              <strong style={{ color: '#f1f5f9' }}>{st.action}:</strong> {st.details}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {/* Live Multi-Agent Execution Indicator */}
        {isProcessing && (
          <div style={{ display: 'flex', gap: '14px', alignItems: 'flex-start' }}>
            <div style={{
              width: '36px',
              height: '36px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #4f46e5, #7c3aed)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 0 16px rgba(99, 102, 241, 0.5)'
            }}>
              <Bot size={18} color="#ffffff" className="animate-spin" />
            </div>

            <div style={{
              padding: '14px 18px',
              borderRadius: '18px 18px 18px 4px',
              background: 'rgba(30, 41, 59, 0.75)',
              border: '1px solid rgba(99, 102, 241, 0.3)',
              color: '#e2e8f0',
              fontSize: '13px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                <Sparkles size={14} color="#818cf8" className="animate-pulse" />
                <span style={{ fontWeight: '600', color: '#c7d2fe' }}>
                  Multi-Agent Pipeline Collaborating...
                </span>
              </div>

              {activeAgentSteps.length > 0 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  {activeAgentSteps.slice(-3).map((step, idx) => (
                    <div key={idx} style={{ fontSize: '11px', color: '#94a3b8' }}>
                      <span style={{ color: '#818cf8', fontWeight: '600' }}>[{step.agent}]</span> {step.action}: {step.details}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Audio Wave Visualizer (When Voice Recording is active) */}
      {isRecording && (
        <div style={{
          position: 'absolute',
          bottom: '84px',
          left: '50%',
          transform: 'translateX(-50%)',
          background: 'rgba(15, 23, 42, 0.95)',
          border: '1px solid rgba(239, 68, 68, 0.5)',
          borderRadius: '24px',
          padding: '8px 20px',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          boxShadow: '0 10px 25px rgba(239, 68, 68, 0.3)',
          zIndex: 30
        }}>
          <span style={{ fontSize: '12px', fontWeight: '600', color: '#f87171' }}>
            Listening... Speak now
          </span>
          <canvas ref={canvasRef} width="160" height="24" style={{ display: 'block' }}></canvas>
        </div>
      )}

      {/* Input Form Bar */}
      <div style={{
        padding: '16px 24px',
        borderTop: '1px solid rgba(255, 255, 255, 0.08)',
        background: 'rgba(15, 23, 42, 0.85)',
        backdropFilter: 'blur(16px)'
      }}>
        <form onSubmit={handleSubmit} style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          {/* Voice Mic Button */}
          <button
            type="button"
            onClick={toggleRecording}
            className={isRecording ? 'mic-recording' : ''}
            title={isRecording ? 'Stop Recording' : 'Voice Input (Click to speak)'}
            style={{
              width: '44px',
              height: '44px',
              borderRadius: '12px',
              border: 'none',
              background: isRecording ? '#ef4444' : 'rgba(30, 41, 59, 0.8)',
              color: isRecording ? '#ffffff' : '#94a3b8',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.2s ease',
              flexShrink: 0
            }}
          >
            {isRecording ? <MicOff size={20} /> : <Mic size={20} />}
          </button>

          {/* Text Input */}
          <input
            type="text"
            placeholder={isRecording ? "Listening to your voice..." : "Ask about courses, fees, campus navigation, or book appointments..."}
            value={inputText}
            onChange={e => setInputText(e.target.value)}
            disabled={isProcessing}
            style={{
              flex: 1,
              height: '44px',
              padding: '0 16px',
              borderRadius: '12px',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              background: 'rgba(30, 41, 59, 0.5)',
              color: '#f8fafc',
              fontSize: '13.5px',
              outline: 'none',
              transition: 'border-color 0.2s ease'
            }}
            onFocus={e => e.target.style.borderColor = 'rgba(99, 102, 241, 0.6)'}
            onBlur={e => e.target.style.borderColor = 'rgba(255, 255, 255, 0.1)'}
          />

          {/* Send Button */}
          <button
            type="submit"
            disabled={isProcessing || !inputText.trim()}
            style={{
              width: '44px',
              height: '44px',
              borderRadius: '12px',
              border: 'none',
              background: !inputText.trim() || isProcessing ? 'rgba(30, 41, 59, 0.6)' : 'linear-gradient(135deg, #4f46e5, #7c3aed)',
              color: '#ffffff',
              cursor: !inputText.trim() || isProcessing ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.2s ease',
              flexShrink: 0
            }}
          >
            <Send size={18} />
          </button>
        </form>
      </div>
    </div>
  );
}
