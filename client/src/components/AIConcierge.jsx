import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, X, Send, Bot, Mic, Volume2, Copy, User, Loader2, Check } from 'lucide-react';
import axios from 'axios';
import ReactMarkdown from 'react-markdown';

export default function AIConcierge() {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [copiedId, setCopiedId] = useState(null);
  const [messages, setMessages] = useState([
    { 
      id: 0,
      role: 'assistant', 
      content: 'Welcome to **LuxeAI**! I can help you find rooms, check prices, or answer questions about your stay. How can I assist you today?' 
    }
  ]);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Handle Speech-to-Text (User talking)
  const startListening = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Your browser does not support voice input.");
      return;
    }
    const recognition = new SpeechRecognition();
    recognition.onstart = () => setIsListening(true);
    recognition.onresult = (e) => setInput(e.results[0][0].transcript);
    recognition.onend = () => setIsListening(false);
    recognition.start();
  };

  // Handle Text-to-Speech (AI talking)
  const speakText = (text) => {
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text.replace(/[*_`#]/g, '')); // Remove markdown chars
    utterance.rate = 1.0;
    window.speechSynthesis.speak(utterance);
  };

  // Copy to clipboard
  const copyToClipboard = (text, id) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return;
    
    const userMessage = { id: Date.now(), role: 'user', content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const { data } = await axios.post('https://nextgen-hms-backend.onrender.com/api/ai/chat', { 
        message: input 
      });
      setMessages(prev => [...prev, { 
        id: Date.now(),
        role: 'assistant', 
        content: data.reply 
      }]);
    } catch (error) {
      setMessages(prev => [...prev, { 
        id: Date.now(),
        role: 'assistant', 
        content: '⚠️ *Sorry, I encountered an error connecting to the concierge core. Please try again.*' 
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const quickQuestions = [
    "What rooms are available?",
    "How do I book a room?",
    "What are your services?"
  ];

  return (
    <div className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-50">
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="mb-4 w-[calc(100vw-2rem)] sm:w-96 h-[60vh] sm:h-[520px] max-w-sm sm:max-w-none bg-slate-900 border border-slate-700 rounded-2xl flex flex-col overflow-hidden shadow-2xl"
          >
            {/* Header */}
            <div className="p-4 bg-slate-950 border-b border-slate-700 flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-600/20 rounded-xl flex items-center justify-center">
                  <Bot className="w-5 h-5 text-blue-400" />
                </div>
                <div>
                  <span className="font-bold text-white">LuxeAI Assistant</span>
                  <p className="text-xs text-emerald-400 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                    Online
                  </p>
                </div>
              </div>
              <button 
                onClick={() => setIsOpen(false)} 
                className="p-2 hover:bg-slate-800 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>
            
            {/* Messages */}
            <div className="flex-1 p-4 overflow-y-auto space-y-4 bg-slate-900/50">
              {messages.map((msg) => (
                <div 
                  key={msg.id}
                  className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
                >
                  {/* Avatar */}
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                    msg.role === 'user' ? 'bg-blue-600' : 'bg-slate-700'
                  }`}>
                    {msg.role === 'user' 
                      ? <User size={16} className="text-white" /> 
                      : <Bot size={16} className="text-blue-400" />}
                  </div>

                  {/* Message Bubble */}
                  <div className={`max-w-[80%] ${msg.role === 'user' ? 'text-right' : 'text-left'}`}>
                    <div className={`inline-block p-3 rounded-2xl ${
                      msg.role === 'user' 
                        ? 'bg-blue-600 text-white rounded-tr-sm' 
                        : 'bg-slate-800 border border-slate-700 text-gray-200 rounded-tl-sm'
                    }`}>
                      {/* Markdown Renderer */}
                      <div className={`prose prose-invert prose-sm max-w-none ${
                        msg.role === 'user' ? 'prose-p:text-white prose-strong:text-white' : ''
                      }`}>
                        <ReactMarkdown>{msg.content}</ReactMarkdown>
                      </div>
                    </div>

                    {/* Action Buttons (Only for AI) */}
                    {msg.role === 'assistant' && (
                      <div className="flex gap-2 mt-2 ml-2">
                        <button 
                          onClick={() => speakText(msg.content)} 
                          className="p-1.5 text-gray-500 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-md transition" 
                          title="Listen"
                        >
                          <Volume2 size={14} />
                        </button>
                        <button 
                          onClick={() => copyToClipboard(msg.content, msg.id)} 
                          className="p-1.5 text-gray-500 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-md transition" 
                          title="Copy"
                        >
                          {copiedId === msg.id ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
              
              {/* Loading State */}
              {isLoading && (
                <div className="flex gap-3">
                  <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center shrink-0">
                    <Bot size={16} className="text-blue-400" />
                  </div>
                  <div className="bg-slate-800 border border-slate-700 p-3 rounded-2xl rounded-tl-sm flex items-center gap-2">
                    <Loader2 size={16} className="text-blue-500 animate-spin" />
                    <span className="text-gray-400 text-sm">Thinking...</span>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Quick Questions */}
            {messages.length === 1 && (
              <div className="px-4 pb-2">
                <p className="text-xs text-gray-500 mb-2">Quick questions:</p>
                <div className="flex flex-wrap gap-2">
                  {quickQuestions.map((q, i) => (
                    <button
                      key={i}
                      onClick={() => setInput(q)}
                      className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg text-xs text-gray-300 transition-colors"
                    >
                      {q}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Input */}
            <div className="p-4 bg-slate-950 border-t border-slate-700">
              <div className="relative flex items-center">
                <button 
                  type="button"
                  onClick={startListening}
                  className={`absolute left-3 p-1.5 rounded-full transition ${
                    isListening 
                      ? 'bg-red-500/20 text-red-500 animate-pulse' 
                      : 'text-gray-400 hover:text-white'
                  }`}
                  title="Voice input"
                >
                  <Mic size={18} />
                </button>
                
                <input 
                  className="w-full bg-slate-800 border border-slate-700 text-white rounded-xl py-2.5 pl-11 pr-11 text-sm placeholder-gray-500 focus:outline-none focus:border-blue-500 transition"
                  placeholder="Ask about rooms, prices..."
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
                  disabled={isLoading}
                />
                
                <button 
                  onClick={sendMessage}
                  disabled={isLoading || !input.trim()}
                  className="absolute right-3 p-1.5 text-blue-500 hover:text-blue-400 disabled:text-slate-600 transition"
                  title="Send"
                >
                  <Send size={18} />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Toggle Button */}
      <motion.button 
        onClick={() => setIsOpen(!isOpen)}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="w-14 h-14 bg-blue-600 hover:bg-blue-700 rounded-full shadow-lg flex items-center justify-center transition-colors"
      >
        <AnimatePresence mode="wait">
          {isOpen ? (
            <motion.div
              key="close"
              initial={{ rotate: -90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: 90, opacity: 0 }}
            >
              <X className="w-6 h-6 text-white" />
            </motion.div>
          ) : (
            <motion.div
              key="open"
              initial={{ rotate: 90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: -90, opacity: 0 }}
            >
              <MessageSquare className="w-6 h-6 text-white" />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.button>
    </div>
  );
}
