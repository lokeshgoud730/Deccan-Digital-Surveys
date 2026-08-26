import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../api';
import { MessageSquare, X, Send, Loader, Sparkles, Compass } from 'lucide-react';

export default function AIChatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      sender: 'ai',
      text: "Hello! I am the Deccan Digital Surveys AI Assistant. How can I help you today? You can ask me about our survey services, pricing guidelines, or contact details!"
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, loading]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    const userMessage = { sender: 'user', text: inputText };
    setMessages(prev => [...prev, userMessage]);
    const query = inputText;
    setInputText('');
    setLoading(true);

    // Format chat history for context
    const history = messages.map(m => ({
      role: m.sender === 'user' ? 'user' : 'model',
      parts: [{ text: m.text }]
    }));

    try {
      const res = await api.post('/ai-chat/', { message: query, history });
      setMessages(prev => [...prev, { sender: 'ai', text: res.data.response }]);
    } catch (err) {
      console.error(err);
      setMessages(prev => [...prev, { 
        sender: 'ai', 
        text: "I'm experiencing connectivity issues right now. Feel free to call us at +91 90000 00000 for immediate help!" 
      }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed bottom-4 left-4 sm:bottom-6 sm:left-6 z-40 text-left font-sans">
      
      {/* 1. Toggle Float Button */}
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="w-10 h-10 sm:w-12 sm:h-12 bg-primary hover:bg-primary-dark text-white rounded-full flex items-center justify-center shadow-lg border border-white/20 hover:shadow-xl transition-shadow shadow-primary/20"
        title="Chat with AI Assistant"
      >
        {isOpen ? <X size={18} className="sm:w-5 sm:h-5" /> : <MessageSquare size={18} className="sm:w-5 sm:h-5" />}
      </motion.button>

      {/* 2. Chat Window Container */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 50 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 50 }}
            className="absolute bottom-12 sm:bottom-16 left-0 w-[calc(100vw-32px)] sm:w-96 h-[390px] sm:h-[450px] bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl shadow-2xl flex flex-col overflow-hidden glass z-50"
          >
            {/* Header */}
            <div className="bg-primary text-white p-4 flex items-center justify-between shrink-0">
              <div className="flex items-center space-x-2">
                <div className="p-1.5 bg-white/10 rounded-lg text-survey-gold animate-pulse">
                  <Sparkles size={16} />
                </div>
                <div>
                  <h4 className="font-extrabold text-sm tracking-wide">Deccan AI Assistant</h4>
                  <div className="flex items-center space-x-1 mt-0.5">
                    <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full" />
                    <span className="text-[10px] text-blue-200">Online & Ready</span>
                  </div>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="text-white/70 hover:text-white"
              >
                <X size={16} />
              </button>
            </div>

            {/* Message Log */}
            <div className="flex-grow p-4 overflow-y-auto space-y-3.5 bg-slate-50/50 dark:bg-zinc-900/30">
              {messages.map((m, idx) => (
                <div 
                  key={idx} 
                  className={`flex ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`max-w-[85%] p-3 rounded-2xl text-xs leading-relaxed shadow-sm ${
                    m.sender === 'user' 
                      ? 'bg-primary text-white rounded-br-none' 
                      : 'bg-white dark:bg-zinc-805 border border-slate-200/50 dark:border-zinc-800/30 text-slate-800 dark:text-zinc-200 rounded-bl-none'
                  }`}>
                    {m.text}
                  </div>
                </div>
              ))}
              
              {loading && (
                <div className="flex justify-start">
                  <div className="bg-white dark:bg-zinc-805 border border-slate-200/50 dark:border-zinc-800/30 p-3 rounded-2xl rounded-bl-none flex items-center space-x-1.5">
                    <Loader size={12} className="animate-spin text-primary" />
                    <span className="text-[10px] text-slate-400 font-medium">AI is typing...</span>
                  </div>
                </div>
              )}
              
              <div ref={messagesEndRef} />
            </div>

            {/* Input Form */}
            <form onSubmit={handleSendMessage} className="p-3 border-t border-slate-100 dark:border-zinc-800 bg-white dark:bg-zinc-900 flex items-center space-x-2 shrink-0">
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="Ask me a question..."
                className="flex-grow px-3.5 py-2 text-xs border border-slate-200 dark:border-zinc-700 rounded-xl bg-slate-50 dark:bg-zinc-800 focus:outline-none focus:ring-2 focus:ring-primary"
              />
              <button
                type="submit"
                disabled={loading || !inputText.trim()}
                className="p-2.5 bg-primary hover:bg-primary-dark text-white rounded-xl transition disabled:opacity-50"
              >
                <Send size={14} />
              </button>
            </form>

          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
