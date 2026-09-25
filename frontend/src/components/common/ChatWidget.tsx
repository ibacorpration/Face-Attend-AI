import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, X, Send } from 'lucide-react';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'bot';
  timestamp: Date;
}

// Mock RAG backend call
const getBotResponse = async (message: string): Promise<string> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(`Echo: ${message}`);
    }, 1500);
  });
};

export const ChatWidget: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  const handleSend = async () => {
    if (!inputValue.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputValue.trim(),
      sender: 'user',
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue('');
    setIsTyping(true);

    try {
      const response = await getBotResponse(userMessage.text);
      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: response,
        sender: 'bot',
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, botMessage]);
    } catch (error) {
      console.error('Failed to get bot response', error);
    } finally {
      setIsTyping(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSend();
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="w-[calc(100vw-32px)] sm:w-[360px] h-[80vh] sm:h-[500px] bg-[#1c1c1f] rounded-[20px] shadow-2xl mb-4 flex flex-col overflow-hidden border border-white/5"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 bg-[#111112]">
              <div className="flex items-center gap-2">
                <Shield size={20} className="text-[#C6F135]" />
                <span className="font-bold text-white">IBA Chat</span>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="text-white/70 hover:text-white transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4 relative bg-[#1c1c1f]">
              <AnimatePresence>
                {messages.length === 0 && (
                  <motion.div
                    key="welcome"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, y: -20, transition: { duration: 0.2 } }}
                    className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center z-10"
                  >
                    <motion.div 
                      animate={{ y: [0, -10, 0] }}
                      transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
                      className="relative w-32 h-32 mb-4"
                    >
                      {/* Glow behind */}
                      <div className="absolute inset-0 bg-[#C6F135] opacity-20 blur-xl rounded-full" />
                      {/* SVG Mascot */}
                      <svg viewBox="0 0 100 100" className="w-full h-full relative z-10">
                        {/* Hood/Cowl Base */}
                        <path d="M 20 50 C 20 20, 80 20, 80 50 C 85 70, 75 85, 50 85 C 25 85, 15 70, 20 50 Z" fill="#1c1c1f" />
                        {/* Inner Face/Head */}
                        <path d="M 25 50 C 25 30, 75 30, 75 50 C 75 75, 25 75, 25 50 Z" fill="#111112" />
                        {/* Eyes */}
                        <motion.g
                          animate={{ opacity: [0.8, 1, 0.8] }}
                          transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
                        >
                          <ellipse cx="38" cy="48" rx="5" ry="9" fill="#C6F135" transform="rotate(-15 38 48)" filter="drop-shadow(0 0 4px #C6F135)" />
                          <ellipse cx="62" cy="48" rx="5" ry="9" fill="#C6F135" transform="rotate(15 62 48)" filter="drop-shadow(0 0 4px #C6F135)" />
                        </motion.g>
                        {/* Chest Icon */}
                        <path d="M 45 75 L 55 75 L 55 82 L 50 86 L 45 82 Z" fill="#C6F135" opacity="0.8" />
                        <circle cx="50" cy="78" r="1.5" fill="#111112" />
                      </svg>
                    </motion.div>
                    <h3 className="text-white font-bold text-lg">IBA Assistant</h3>
                    <p className="text-white/60 text-sm mt-1">Hi! How can I help you today?</p>
                  </motion.div>
                )}
              </AnimatePresence>

              {messages.map((msg) => (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex flex-col max-w-[85%] z-20 relative ${
                    msg.sender === 'user' ? 'self-end items-end' : 'self-start items-start'
                  }`}
                >
                  <div
                    className={`px-4 py-2.5 rounded-2xl shadow-sm ${
                      msg.sender === 'user'
                        ? 'bg-[#C6F135] text-[#111112] rounded-br-sm'
                        : 'bg-[#2a2a2e] text-white rounded-bl-sm'
                    }`}
                  >
                    <p className="text-sm leading-relaxed">{msg.text}</p>
                  </div>
                </motion.div>
              ))}

              {isTyping && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="self-start bg-[#2a2a2e] px-4 py-3 rounded-2xl rounded-bl-sm flex items-center gap-1.5 z-20 relative shadow-sm"
                >
                  <motion.div
                    animate={{ y: [0, -4, 0] }}
                    transition={{ repeat: Infinity, duration: 0.6, delay: 0 }}
                    className="w-1.5 h-1.5 bg-white/60 rounded-full"
                  />
                  <motion.div
                    animate={{ y: [0, -4, 0] }}
                    transition={{ repeat: Infinity, duration: 0.6, delay: 0.2 }}
                    className="w-1.5 h-1.5 bg-white/60 rounded-full"
                  />
                  <motion.div
                    animate={{ y: [0, -4, 0] }}
                    transition={{ repeat: Infinity, duration: 0.6, delay: 0.4 }}
                    className="w-1.5 h-1.5 bg-white/60 rounded-full"
                  />
                </motion.div>
              )}
              <div ref={messagesEndRef} className="h-1 z-20" />
            </div>

            {/* Input Area */}
            <div className="bg-[#111112] p-3 border-t border-white/10 flex items-center gap-2 shrink-0 z-30">
              <Input
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleKeyPress}
                placeholder="Type your message..."
                className="!bg-white/5 !border-none !text-white placeholder:!text-white/40 focus-visible:!ring-1 focus-visible:!ring-[#C6F135] h-11 !pl-4"
              />
              <Button
                onClick={handleSend}
                disabled={!inputValue.trim()}
                className="w-11 h-11 !p-0 rounded-full bg-[#C6F135] hover:bg-[#C6F135]/90 shrink-0 text-[#111112] flex items-center justify-center border-none"
              >
                <Send size={18} />
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="w-14 h-14 rounded-full bg-[#111112] shadow-soft-lg flex items-center justify-center relative group z-50"
      >
        {/* Hover Glow Effect */}
        <div className="absolute inset-0 rounded-full bg-[#C6F135] opacity-0 group-hover:opacity-20 blur-md transition-opacity duration-300" />
        
        {isOpen ? (
          <X className="text-[#C6F135] z-10" size={24} />
        ) : (
          <svg
            className="text-[#C6F135] z-10 w-9 h-9"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            {/* Circular head */}
            <circle cx="12" cy="12" r="8" />
            {/* Left ear */}
            <path d="M 6.5 6 L 5.5 1.5 L 10 4.5" />
            {/* Right ear */}
            <path d="M 17.5 6 L 18.5 1.5 L 14 4.5" />
            {/* Eyes */}
            <circle cx="8.5" cy="12" r="1.5" />
            <circle cx="15.5" cy="12" r="1.5" />
            {/* Connector */}
            <line x1="10" y1="12" x2="14" y2="12" />
          </svg>
        )}
      </motion.button>
    </div>
  );
};
