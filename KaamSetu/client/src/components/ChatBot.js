// KaamSetu - AI Chatbot Widget
// Provides text, voice, and microphone chat to signed-in users.

import React, { useEffect, useRef, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { chatbotAPI } from '../services/api';

const QUICK_REPLIES = ['Find jobs', 'My applications', 'How to verify'];
const VOICE_LANGUAGES = [
  { code: 'en-IN', label: 'English' },
  { code: 'hi-IN', label: 'Hindi' },
  { code: 'ta-IN', label: 'Tamil' }
];

const ChatBot = () => {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const [language, setLanguage] = useState('en-IN');
  const [isListening, setIsListening] = useState(false);
  const [micMessage, setMicMessage] = useState('');
  const [voiceEnabled, setVoiceEnabled] = useState(false);
  const [assistantState, setAssistantState] = useState({});
  const [options, setOptions] = useState([]);
  const [retryMessage, setRetryMessage] = useState('');
  const [messages, setMessages] = useState([
    {
      role: 'bot',
      text: 'Namaste! I’m KaamSetu’s helper. Ask me about jobs, applications, verification, or other features.'
    }
  ]);
  const messagesEndRef = useRef(null);
  const recognitionRef = useRef(null);
  const languageRef = useRef(language);
  const voiceEnabledRef = useRef(voiceEnabled);
  const assistantStateRef = useRef({});
  const requestControllerRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, sending]);

  useEffect(() => {
    languageRef.current = language;
    voiceEnabledRef.current = voiceEnabled;
    if (recognitionRef.current) recognitionRef.current.lang = language;
  }, [language, voiceEnabled]);

  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setMicMessage('Voice works in Chrome or Edge. You can type instead.');
    }
  }, []);

  useEffect(() => () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
  }, []);

  const speakReply = (text) => {
    if (!voiceEnabledRef.current || !window.speechSynthesis || !window.SpeechSynthesisUtterance) {
      return;
    }

    window.speechSynthesis.cancel();
    const utterance = new window.SpeechSynthesisUtterance(text);
    utterance.lang = languageRef.current;
    window.speechSynthesis.speak(utterance);
  };

  const sendMessage = async (text) => {
    const message = (text === undefined ? input : text).trim();
    if (!message || sending) {
      return;
    }

    const history = messages.slice(-6).map((item) => ({
      role: item.role === 'bot' ? 'assistant' : 'user',
      content: item.text
    }));

    setMessages((currentMessages) => [
      ...currentMessages,
      { role: 'user', text: message }
    ]);
    setInput('');
    setSending(true);
    setRetryMessage('');
    requestControllerRef.current?.abort();
    const controller = new AbortController();
    requestControllerRef.current = controller;
    const timeout = window.setTimeout(() => controller.abort(), 15000);

    try {
      const response = user.role === 'worker'
        ? await chatbotAPI.command(message, assistantStateRef.current, controller.signal)
        : await chatbotAPI.send(message, history, controller.signal);
      if (!response.success || typeof response.reply !== 'string') {
        throw new Error('The chatbot could not provide a reply.');
      }

      setMessages((currentMessages) => [
        ...currentMessages,
        { role: 'bot', text: response.reply }
      ]);
      speakReply(response.reply);
      const nextState = response.state || {};
      assistantStateRef.current = nextState;
      setAssistantState(nextState);
      setOptions(Array.isArray(response.options) ? response.options : []);
      setRetryMessage('');
    } catch (error) {
      console.error('Chatbot request failed:', error.message);
      const timedOut = error.name === 'AbortError';
      const loginRequired = error.status === 401 || /login|token|unauthorized/i.test(error.message || '');
      const errorMessage = timedOut
        ? 'Sorry, something went wrong. Please try again.'
        : (loginRequired ? 'Please log in again' : 'Sorry, something went wrong. Please try again.');
      setMessages((currentMessages) => [
        ...currentMessages,
        { role: 'bot', text: errorMessage }
      ]);
      speakReply(errorMessage);
      setRetryMessage(message);
    } finally {
      window.clearTimeout(timeout);
      setSending(false);
    }
  };

  const startListening = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setMicMessage('Voice input is not supported in this browser. You can still type your message.');
      return;
    }

    if (isListening && recognitionRef.current) {
      recognitionRef.current.stop();
      return;
    }

    const recognition = recognitionRef.current || new SpeechRecognition();
    recognition.lang = language;
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.maxAlternatives = 1;
    recognition.onstart = () => {
      setMicMessage('');
      setIsListening(true);
    };
    recognition.onend = () => setIsListening(false);
    recognition.onerror = (event) => {
      setIsListening(false);
      if (event.error === 'not-allowed' || event.error === 'service-not-allowed') {
        setMicMessage('Microphone access is blocked. Allow microphone access for this site in your browser settings, then try again.');
      } else if (event.error === 'audio-capture') {
        setMicMessage('No microphone was found. Connect or enable a microphone, then try again.');
      } else if (event.error === 'no-speech') {
        setMicMessage('I did not hear anything. Please try speaking again.');
      } else if (event.error === 'aborted') {
        setMicMessage('Voice input was cancelled.');
      } else if (event.error === 'network') {
        setMicMessage('Voice recognition needs a network connection. Check your connection and try again.');
      } else {
        setMicMessage('Voice input could not start. Check your microphone permission and try again.');
      }
    };
    recognition.onresult = (event) => {
      let interim = '';
      let finalText = '';
      for (let index = event.resultIndex; index < event.results.length; index += 1) {
        const transcript = event.results[index][0].transcript.trim();
        if (event.results[index].isFinal) finalText += `${transcript} `;
        else interim += transcript;
      }
      if (interim) setMicMessage(interim);
      if (finalText) {
        setMicMessage('');
        const spokenText = finalText.trim();
        window.setTimeout(() => sendMessage(spokenText), 0);
      } else if (!interim) {
        setMicMessage('I did not catch that. Please try speaking again.');
      }
    };
    recognition.onnomatch = () => {
      setMicMessage('I did not catch that. Please try speaking again.');
    };
    recognitionRef.current = recognition;

    try {
      recognition.start();
    } catch (error) {
      console.error('Could not start voice input:', error.message);
      setIsListening(false);
      setMicMessage('Could not start the microphone. Check your browser permission and try again.');
    }
  };

  const toggleVoice = () => {
    if (voiceEnabled) {
      setVoiceEnabled(false);
      if (window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
      return;
    }

    if (!window.speechSynthesis || !window.SpeechSynthesisUtterance) {
      window.alert('Spoken replies are not supported in this browser.');
      return;
    }

    setVoiceEnabled(true);
  };

  if (!user) {
    return null;
  }

  return (
    <div className="chatbot">
      {isOpen && (
        <section className="chatbot-box" aria-label="KaamSetu chatbot">
          <div className="chatbot-header">
            <strong>KaamSetu Assistant</strong>
            <button
              type="button"
              onClick={() => {
                requestControllerRef.current?.abort();
                assistantStateRef.current = {};
                setAssistantState({});
                setOptions([]);
                setIsOpen(false);
              }}
              aria-label="Close chatbot"
            >
              ×
            </button>
          </div>

          <div className="chatbot-controls">
            <label>
              Reply language
              <select
                value={language}
                onChange={(event) => setLanguage(event.target.value)}
                aria-label="Speech language"
              >
                {VOICE_LANGUAGES.map((option) => (
                  <option value={option.code} key={option.code}>{option.label}</option>
                ))}
              </select>
            </label>
            <button
              className={`chatbot-speaker ${voiceEnabled ? 'active' : ''}`}
              type="button"
              onClick={toggleVoice}
              aria-pressed={voiceEnabled}
              aria-label={voiceEnabled ? 'Turn spoken replies off' : 'Turn spoken replies on'}
              title={voiceEnabled ? 'Turn spoken replies off' : 'Turn spoken replies on'}
            >
              🔊
            </button>
          </div>

          <div className="chatbot-messages" aria-live="polite">
            {messages.map((message, index) => (
              <div
                className={`chat-msg ${message.role}`}
                key={`${message.role}-${index}`}
              >
                {message.text}
              </div>
            ))}
            {sending && <div className="chat-msg bot">Typing...</div>}
            <div ref={messagesEndRef} />
          </div>

          <div className="chatbot-quick">
            {options.map((option) => (
              <button
                type="button"
                key={option}
                onClick={() => sendMessage(option)}
                disabled={sending}
              >
                {option}
              </button>
            ))}
            {QUICK_REPLIES.map((reply) => (
              <button
                type="button"
                key={reply}
                onClick={() => sendMessage(reply)}
                disabled={sending}
              >
                {reply}
              </button>
            ))}
          </div>
          {retryMessage && (
            <button
              type="button"
              className="chatbot-retry"
              onClick={() => sendMessage(retryMessage)}
              disabled={sending}
            >
              Retry
            </button>
          )}
          {micMessage && (
            <div className="chatbot-mic-status" role="status">
              {micMessage}
            </div>
          )}

          <form
            className="chatbot-input"
            onSubmit={(event) => {
              event.preventDefault();
              sendMessage(input);
            }}
          >
            <input
              type="text"
              value={input}
              onChange={(event) => setInput(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === 'Enter') {
                  event.preventDefault();
                  sendMessage();
                }
              }}
              placeholder="Type a message..."
              aria-label="Chat message"
              maxLength={300}
              disabled={sending}
            />
            <button type="submit" disabled={sending || !input.trim()}>
              Send
            </button>
            {window.SpeechRecognition || window.webkitSpeechRecognition ? <button
              className={`chatbot-mic ${isListening ? 'listening' : ''}`}
              type="button"
              onClick={startListening}
              disabled={sending}
              aria-label={isListening ? 'Stop listening' : 'Start voice input'}
              aria-pressed={isListening}
              title={isListening ? 'Stop listening' : 'Start voice input'}
            >
              🎤
            </button> : null}
          </form>
        </section>
      )}

      <button
        className="chatbot-toggle"
        type="button"
        onClick={() => setIsOpen((open) => !open)}
        aria-label={isOpen ? 'Close chatbot' : 'Open chatbot'}
        aria-expanded={isOpen}
      >
        💬
      </button>
    </div>
  );
};

export default ChatBot;
