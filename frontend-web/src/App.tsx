import { useState, useRef, useEffect } from 'react'
import axios from 'axios'
import './App.css'

// Voice input functionality
const VoiceInput = {
  recognition: null as any,
  isListening: false,

  initialize() {
    console.log('Initializing voice input...');
    
    if ('webkitSpeechRecognition' in window) {
      console.log('Using webkitSpeechRecognition');
      this.recognition = new (window as any).webkitSpeechRecognition();
    } else if ('SpeechRecognition' in window) {
      console.log('Using SpeechRecognition');
      this.recognition = new (window as any).SpeechRecognition();
    } else {
      console.log('Speech recognition not supported');
      return false;
    }
    
    if (this.recognition) {
      this.recognition.continuous = false;
      this.recognition.interimResults = true;
      this.recognition.lang = 'en-US';
      this.recognition.maxAlternatives = 1;
      
      console.log('Voice input initialized successfully');
      return true;
    }
    
    return false;
  },

  async startListening(onResult: (text: string) => void, onError?: (error: string) => void) {
    if (!this.recognition) {
      console.error('Recognition not initialized');
      if (onError) onError('Voice recognition not available');
      return false;
    }

    if (this.isListening) {
      console.log('Already listening');
      return false;
    }

    return new Promise<boolean>((resolve) => {
      console.log('Starting voice recognition...');
      
      this.recognition.onstart = () => {
        console.log('Voice recognition started');
        this.isListening = true;
      };

      this.recognition.onresult = (event: any) => {
        console.log('Voice recognition result:', event);
        
        let finalTranscript = '';
        let interimTranscript = '';
        
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalTranscript += transcript;
          } else {
            interimTranscript += transcript;
          }
        }
        
        if (finalTranscript) {
          console.log('Final transcript:', finalTranscript);
          onResult(finalTranscript.trim());
          this.isListening = false;
          resolve(true);
        } else if (interimTranscript) {
          console.log('Interim transcript:', interimTranscript);
        }
      };

      this.recognition.onerror = (event: any) => {
        console.error('Voice recognition error:', event.error);
        this.isListening = false;
        
        let errorMessage = 'Voice input failed';
        
        switch (event.error) {
          case 'no-speech':
            errorMessage = 'No speech detected. Please speak clearly and try again. Make sure your microphone is working.';
            break;
          case 'audio-capture':
            errorMessage = 'Microphone not available. Please check your microphone connection and try again.';
            break;
          case 'not-allowed':
            errorMessage = 'Microphone permission denied. Please click the microphone icon in your address bar and allow access.';
            break;
          case 'network':
            errorMessage = 'Network error. Check your internet connection and try again.';
            break;
          case 'service-not-allowed':
            errorMessage = 'Speech service blocked. Please enable speech services in your browser settings.';
            break;
          case 'aborted':
            errorMessage = 'Voice input was cancelled.';
            break;
          default:
            errorMessage = `Voice input error: ${event.error}. Please try again.`;
        }
        
        if (onError) onError(errorMessage);
        resolve(false);
      };

      this.recognition.onend = () => {
        console.log('Voice recognition ended');
        this.isListening = false;
      };

      try {
        this.recognition.start();
      } catch (error) {
        console.error('Failed to start voice recognition:', error);
        this.isListening = false;
        if (onError) onError('Failed to start voice recognition');
        resolve(false);
      }
    });
  },

  stopListening() {
    if (this.recognition && this.isListening) {
      console.log('Stopping voice recognition');
      this.recognition.stop();
      this.isListening = false;
    }
  },

  async testMicrophone() {
    console.log('Testing microphone access...');
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      console.log('Microphone access granted');
      stream.getTracks().forEach(track => track.stop());
      return true;
    } catch (error) {
      console.error('Microphone test failed:', error);
      return false;
    }
  }
};

// Text-to-Speech functionality
const TextToSpeech = {
  isSupported(): boolean {
    return 'speechSynthesis' in window;
  },

  speak(text: string, options: { rate?: number; pitch?: number; voice?: SpeechSynthesisVoice } = {}) {
    if (!this.isSupported()) {
      console.error('Speech Synthesis not supported');
      return false;
    }

    if (!text || text.trim() === '') {
      console.error('No text provided for speech');
      return false;
    }

    try {
      window.speechSynthesis.cancel();
      
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = options.rate || 0.9;
      utterance.pitch = options.pitch || 1.0;
      utterance.volume = 1.0;
      
      if (options.voice) utterance.voice = options.voice;
      
      window.speechSynthesis.speak(utterance);
      return true;
    } catch (error) {
      console.error('Error in speech synthesis:', error);
      return false;
    }
  },

  stop() {
    if (this.isSupported()) {
      window.speechSynthesis.cancel();
    }
  },

  getVoices(): SpeechSynthesisVoice[] {
    if (this.isSupported()) {
      return window.speechSynthesis.getVoices();
    }
    return [];
  }
};

interface Message {
  id: string
  type: 'user' | 'bot'
  text: string
  timestamp: Date
  sentiment?: 'positive' | 'negative' | 'neutral'
  emotion?: string
  emotion_confidence?: number
  provider?: string
}

interface AnalyzeResponse {
  provider: string
  sentiment: 'pos' | 'neg' | 'neu'
  emotion: string
  emotion_confidence: number
  reply: string
  debug: {
    score: number
    pos_hits: string[]
    neg_hits: string[]
    emotion_scores: Record<string, number>
  }
}

function App() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      type: 'bot',
      text: "Hello! I'm here to listen and support you. How are you feeling today? 💚",
      sentiment: 'neutral',
      provider: 'system',
      timestamp: new Date()
    }
  ])
  const [inputText, setInputText] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const saved = localStorage.getItem('darkMode')
    return saved ? JSON.parse(saved) : window.matchMedia('(prefers-color-scheme: dark)').matches
  })
  const [isOnline, setIsOnline] = useState(navigator.onLine)
  const [notification, setNotification] = useState<string | null>(null)
  const [showWelcome, setShowWelcome] = useState(true)
  const [isListening, setIsListening] = useState(false)
  const [voiceSupported, setVoiceSupported] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  // Theme management
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', isDarkMode ? 'dark' : 'light')
    localStorage.setItem('darkMode', JSON.stringify(isDarkMode))
  }, [isDarkMode])

  useEffect(() => {
    const handleOnline = () => setIsOnline(true)
    const handleOffline = () => setIsOnline(false)
    
    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)
    
    // Initialize voice functionality
    setVoiceSupported(VoiceInput.initialize())
    
    // Initialize speech synthesis
    if ('speechSynthesis' in window) {
      console.log('Speech synthesis supported');
      
      const loadVoices = () => {
        const voices = window.speechSynthesis.getVoices();
        console.log('Voices loaded:', voices.length);
      };
      
      window.speechSynthesis.addEventListener('voiceschanged', loadVoices);
      loadVoices();
    } else {
      console.log('Speech synthesis not supported');
    }
    
    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  // Hide welcome animation after 3 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowWelcome(false)
    }, 3000)
    return () => clearTimeout(timer)
  }, [])

  const toggleTheme = () => {
    setIsDarkMode((prev: boolean) => !prev)
  }

  const addEmoji = (emoji: string) => {
    setInputText(prev => prev + emoji)
    inputRef.current?.focus()
  }

  const getProviderIcon = (provider: string) => {
    switch (provider) {
      case 'gemini': return '🧠'
      case 'perplexity': return '🔍'
      case 'mock': return '🎭'
      case 'system': return '⚡'
      case 'error': return '⚠️'
      default: return '🤖'
    }
  }

  const getUserAvatar = () => '👤'
  const getBotAvatar = () => '🤖'

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!inputText.trim() || isLoading) return

    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      text: inputText.trim(),
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage])
    setInputText('')
    setIsLoading(true)
    setError(null)

    try {
      const response = await axios.post<AnalyzeResponse>(
        'http://127.0.0.1:8000/analyze',
        { text: userMessage.text },
        {
          headers: {
            'Content-Type': 'application/json'
          },
          timeout: 10000
        }
      )

      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'bot',
        text: response.data.reply,
        sentiment: response.data.sentiment === 'pos' ? 'positive' : 
                   response.data.sentiment === 'neg' ? 'negative' : 'neutral',
        emotion: response.data.emotion,
        emotion_confidence: response.data.emotion_confidence,
        provider: response.data.provider,
        timestamp: new Date()
      }

      setMessages(prev => [...prev, botMessage])
    } catch (err) {
      console.error('Error calling API:', err)
      
      let errorMessage = 'Bot is unavailable, please try again'
      if (axios.isAxiosError(err)) {
        if (err.code === 'ECONNABORTED') {
          errorMessage = 'Request timed out, please try again'
        } else if (err.response?.status === 400) {
          errorMessage = 'Please provide a valid message'
        } else if (err.response && err.response.status >= 500) {
          errorMessage = 'Server error, please try again later'
        }
      }

      const errorBotMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'bot',
        text: errorMessage,
        sentiment: 'neutral',
        provider: 'error',
        timestamp: new Date()
      }

      setMessages(prev => [...prev, errorBotMessage])
      setError(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  const getSentimentEmoji = (sentiment?: string) => {
    switch (sentiment) {
      case 'pos': return '😊'
      case 'neg': return '😔'
      case 'neu': return '😐'
      default: return '🤖'
    }
  }

  const getSentimentColor = (sentiment?: string) => {
    switch (sentiment) {
      case 'pos': return '#4ade80'
      case 'neg': return '#f87171'
      case 'neu': return '#94a3b8'
      default: return '#6b7280'
    }
  }

  const getEmotionColor = (emotion?: string, confidence?: number): string => {
    if (!emotion || !confidence) return '#6b7280'
    
    const colors: Record<string, string> = {
      happy: '#4ade80',
      sad: '#60a5fa', 
      anxious: '#fb923c',
      frustrated: '#f87171',
      excited: '#e879f9',
      worried: '#a78bfa'
    }
    
    return colors[emotion] || '#6b7280'
  }

  const getEmotionIcon = (emotion?: string): string => {
    const icons: Record<string, string> = {
      happy: '😊',
      sad: '😢',
      anxious: '😰',
      frustrated: '😤',
      excited: '🤩',
      worried: '😟',
      neutral: '😐'
    }
    
    return icons[emotion || 'neutral']
  }

  const getEmotionAnimation = (emotion?: string): string => {
    const animations: Record<string, string> = {
      happy: 'pulse-happy',
      sad: 'fade-sad',
      anxious: 'shake-anxious',
      frustrated: 'vibrate-frustrated',
      excited: 'bounce-excited',
      worried: 'sway-worried',
      neutral: ''
    }
    
    return animations[emotion || 'neutral']
  }

  // Auto-resize textarea
  useEffect(() => {
    const textarea = inputRef.current
    if (textarea) {
      textarea.style.height = 'auto'
      textarea.style.height = Math.min(textarea.scrollHeight, 120) + 'px'
    }
  }, [inputText])

  // Show notification
  const showNotification = (message: string) => {
    setNotification(message)
    setTimeout(() => setNotification(null), 3000)
  }

  // Copy message to clipboard
  const copyMessage = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
      showNotification('Message copied to clipboard! 📋')
    } catch (err) {
      console.error('Failed to copy text: ', err)
      showNotification('Failed to copy message 😞')
    }
  }

  // Clear chat function
  const clearChat = () => {
    setMessages([
      {
        id: 'system-' + Date.now(),
        type: 'bot',
        text: 'Chat cleared! How can I help you today? 💚',
        sentiment: 'neutral',
        provider: 'system',
        timestamp: new Date()
      }
    ])
    showNotification('Chat history cleared! 🗑️')
  }

  const handleVoiceInput = async () => {
    console.log('Voice input button clicked');
    
    if (!voiceSupported) {
      showNotification('Voice input not supported in this browser! 😞');
      return;
    }
    
    if (isListening) {
      console.log('Already listening, stopping...');
      VoiceInput.stopListening();
      setIsListening(false);
      showNotification('Voice input stopped 🛑');
      return;
    }
    
    // Test microphone access first
    console.log('Testing microphone access...');
    showNotification('🔍 Testing microphone access...');
    
    const micTest = await VoiceInput.testMicrophone();
    if (!micTest) {
      showNotification('❌ Microphone access denied! Click the 🎙️ icon in your address bar and allow permissions.');
      setError('Microphone access required for voice input. Please check browser permissions.');
      return;
    }
    
    console.log('✅ Microphone access granted');
    showNotification('✅ Microphone ready! Starting voice recognition...');
    
    setError(null);
    setIsListening(true);
    showNotification('🎤 Listening... Speak clearly into your microphone!');
    
    try {
      const success = await VoiceInput.startListening(
        (transcript) => {
          console.log('Voice input received:', transcript);
          setInputText(transcript);
          setIsListening(false);
          showNotification(`✅ Captured: "${transcript.substring(0, 30)}${transcript.length > 30 ? '...' : ''}"`);
        },
        (error) => {
          console.error('Voice input error:', error);
          setError(error);
          setIsListening(false);
          showNotification(error);
        }
      );
      
      if (!success) {
        setIsListening(false);
        showNotification('Voice input failed to start 😞');
      }
    } catch (error) {
      console.error('Voice input error:', error);
      const errorMsg = 'Voice input failed. Please try again.';
      setError(errorMsg);
      setIsListening(false);
      showNotification(errorMsg);
    }
  };

  const handleTextToSpeech = async (text: string) => {
    console.log('Attempting to speak:', text);
    
    if (!text || text.trim() === '') {
      console.error('No text to speak');
      showNotification('No text to read! 🔇');
      return;
    }

    if (!('speechSynthesis' in window)) {
      console.error('Speech synthesis not supported');
      showNotification('Speech synthesis not supported in this browser! 😞');
      return;
    }

    try {
      window.speechSynthesis.cancel();
      await new Promise(resolve => setTimeout(resolve, 50));
      
      if (window.speechSynthesis.speaking) {
        console.log('Speech synthesis busy, waiting...');
        window.speechSynthesis.cancel();
        await new Promise(resolve => setTimeout(resolve, 100));
      }
      
      let voices = window.speechSynthesis.getVoices();
      
      if (voices.length === 0) {
        console.log('Waiting for voices to load...');
        showNotification('Loading voices... 🔄');
        
        await new Promise<void>((resolve) => {
          const checkVoices = () => {
            voices = window.speechSynthesis.getVoices();
            if (voices.length > 0) {
              resolve();
            } else {
              setTimeout(checkVoices, 100);
            }
          };
          
          window.speechSynthesis.addEventListener('voiceschanged', () => {
            voices = window.speechSynthesis.getVoices();
            if (voices.length > 0) resolve();
          });
          
          setTimeout(() => resolve(), 2000);
          checkVoices();
        });
      }
      
      console.log('Available voices:', voices.length);
      
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.8;
      utterance.pitch = 1.0;
      utterance.volume = 1.0;
      
      const englishVoice = voices.find(voice => 
        voice.lang.startsWith('en') && 
        (voice.name.includes('Google') || voice.name.includes('Microsoft') || voice.default)
      ) || voices[0];
      
      if (englishVoice) {
        utterance.voice = englishVoice;
        console.log('Using voice:', englishVoice.name);
      }
      
      utterance.onstart = () => {
        console.log('Speech started successfully');
        showNotification('🔊 Speaking...');
      };
      
      utterance.onend = () => {
        console.log('Speech ended normally');
        showNotification('✅ Audio completed');
      };
      
      utterance.onerror = (event) => {
        console.error('Speech error:', event);
        showNotification(`Audio error: ${event.error} 😞`);
      };
      
      console.log('Starting speech synthesis...');
      window.speechSynthesis.speak(utterance);
      
      setTimeout(() => {
        if (!window.speechSynthesis.speaking && !window.speechSynthesis.pending) {
          console.error('Speech failed to start');
          showNotification('Audio failed to start. Try clicking again! 🔄');
        }
      }, 500);
      
    } catch (error) {
      console.error('Text-to-speech error:', error);
      showNotification('Failed to play audio! Try again 😞');
    }
  };

  const stopTextToSpeech = () => {
    TextToSpeech.stop();
  };

  return (
    <div className="app">
      <header className="app-header">
        <div className="header-content">
          <div className="header-controls">
            <div className="status-indicator">
              <div className="status-dot"></div>
              {isOnline ? 'Online' : 'Offline'}
            </div>
            <button 
              className="clear-chat-button" 
              onClick={clearChat}
              title="Clear chat history"
            >
              🗑️
            </button>
            <button 
              className="clear-chat-button" 
              onClick={() => handleTextToSpeech('Audio test. Can you hear this?')}
              title="Test audio functionality"
            >
              🎵
            </button>
            {voiceSupported && (
              <button 
                className={`clear-chat-button ${isListening ? 'listening' : ''}`}
                onClick={handleVoiceInput}
                title="Test voice input"
              >
                {isListening ? '🔴' : '🎙️'}
              </button>
            )}
          </div>
          
          <div className="header-title">
            <h1>MH Companion 💚</h1>
            <p>Your Mental Health Support Chat</p>
          </div>
          
          <button 
            className="theme-toggle"
            onClick={toggleTheme}
            aria-label={`Switch to ${isDarkMode ? 'light' : 'dark'} mode`}
          >
            <div className="theme-toggle-slider">
              {isDarkMode ? '🌙' : '☀️'}
            </div>
          </button>
        </div>
      </header>

      <main className="chat-container">
        <div className="chat-background"></div>
        <div className="messages-container">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`message ${message.type === 'user' ? 'user-message' : 'bot-message'}`}
            >
              <div className="message-avatar">
                {message.type === 'user' ? getUserAvatar() : getBotAvatar()}
              </div>
              
              <div 
                className="message-bubble"
                style={{
                  background: message.type === 'bot' ? undefined : undefined,
                  borderLeftColor: message.type === 'bot' ? getEmotionColor(message.emotion, message.emotion_confidence) : undefined,
                }}
              >
                {message.type === 'bot' && (
                  <div className="message-header">
                    <span 
                      className={`emotion-indicator ${getEmotionAnimation(message.emotion)}`}
                      style={{ color: getEmotionColor(message.emotion, message.emotion_confidence) }}
                      title={`Emotion: ${message.emotion} (${Math.round((message.emotion_confidence || 0) * 100)}% confidence)`}
                    >
                      {getEmotionIcon(message.emotion)}
                    </span>
                    <span 
                      className="sentiment-indicator"
                      style={{ color: getSentimentColor(message.sentiment) }}
                      title={`Sentiment: ${message.sentiment}`}
                    >
                      {getSentimentEmoji(message.sentiment)}
                    </span>
                    <span className="provider-label">
                      <span className="provider-icon">{getProviderIcon(message.provider || '')}</span>
                      {message.provider}
                    </span>
                  </div>
                )}
                <div className="message-text">{message.text}</div>
                <div className="message-time">
                  {message.timestamp.toLocaleTimeString([], { 
                    hour: '2-digit', 
                    minute: '2-digit' 
                  })}
                </div>
                
                {message.type === 'bot' && (
                  <div className="message-actions">
                    <button 
                      className="action-button" 
                      title="Listen to message"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        handleTextToSpeech(message.text);
                      }}
                    >
                      🔊
                    </button>
                    <button 
                      className="action-button" 
                      title="Stop audio"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        stopTextToSpeech();
                      }}
                    >
                      🔇
                    </button>
                    <button 
                      className="action-button" 
                      title="Copy message"
                      onClick={() => copyMessage(message.text)}
                    >
                      📋
                    </button>
                    <button 
                      className="action-button" 
                      title="Like"
                      onClick={() => showNotification('Thanks for your feedback! 👍')}
                    >
                      👍
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
          
          {isLoading && (
            <div className="message bot-message">
              <div className="message-avatar">
                {getBotAvatar()}
              </div>
              <div className="message-bubble loading">
                <div className="typing-indicator">
                  <span></span>
                  <span></span>
                  <span></span>
                  <div className="typing-text">AI is thinking...</div>
                </div>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>

        <form onSubmit={handleSubmit} className="input-container">
          <div className="input-wrapper">
            <div className="input-field-container">
              <textarea
                ref={inputRef}
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="How are you feeling? Share your thoughts... 💭"
                disabled={isLoading || !isOnline}
                className="message-input"
                maxLength={500}
                rows={1}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault()
                    handleSubmit(e)
                  }
                }}
              />
              <div className="input-actions">
                <span className={`char-counter ${inputText.length > 450 ? 'warning' : ''} ${inputText.length >= 500 ? 'error' : ''}`}>
                  {inputText.length}/500
                </span>
                <button
                  type="button"
                  className="emoji-button"
                  onClick={() => addEmoji('😊')}
                  title="Add happy emoji"
                >
                  😊
                </button>
                <button
                  type="button"
                  className="emoji-button"
                  onClick={() => addEmoji('😢')}
                  title="Add sad emoji"
                >
                  😢
                </button>
                <button
                  type="button"
                  className="emoji-button"
                  onClick={() => addEmoji('😰')}
                  title="Add anxious emoji"
                >
                  😰
                </button>
                <button
                  type="button"
                  className="emoji-button"
                  onClick={() => addEmoji('❤️')}
                  title="Add heart emoji"
                >
                  ❤️
                </button>
              </div>
            </div>
            
            {voiceSupported && (
              <button
                type="button"
                onClick={handleVoiceInput}
                disabled={isLoading || !isOnline}
                className={`voice-button ${isListening ? 'listening' : ''}`}
                title={isListening ? 'Listening...' : 'Voice input'}
              >
                {isListening ? '🎤' : '🎙️'}
              </button>
            )}
            
            <button
              type="submit"
              disabled={!inputText.trim() || isLoading || !isOnline}
              className="send-button"
            >
              {isLoading ? (
                <div className="typing-indicator">
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
              ) : (
                <>
                  <span>Send</span>
                  <span className="send-icon">📤</span>
                </>
              )}
            </button>
          </div>
          
          {error && (
            <div className="error-message">
              <span className="error-icon">⚠️</span>
              {error}
            </div>
          )}
          
          {!isOnline && (
            <div className="error-message">
              <span className="error-icon">📡</span>
              You're currently offline. Check your internet connection.
            </div>
          )}
        </form>

        {notification && (
          <div className="notification">
            {notification}
          </div>
        )}

        {showWelcome && (
          <div className="welcome-animation">
            <div className="welcome-icon">💚</div>
            <div className="welcome-text gradient-text">Welcome!</div>
            <div className="welcome-subtext">Your mental health companion is ready to listen</div>
          </div>
        )}

        {showWelcome && (
          <div className="welcome-message">
            <div className="welcome-text">
              <span>👋 Welcome to MH Companion!</span>
              <span>I'm here to support your mental health journey.</span>
              <span>Feel free to ask me anything or share your feelings.</span>
            </div>
            <div className="welcome-actions">
              <button 
                className="action-button"
                onClick={() => setShowWelcome(false)}
              >
                Got it! 👍
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}

export default App
