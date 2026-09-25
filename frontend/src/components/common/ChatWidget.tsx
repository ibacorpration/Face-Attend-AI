import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, X, Send } from 'lucide-react';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import ibaMascotFull from '../../assets/iba-mascot-full.png';

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
            <div className="flex items-center justify-between px-4 py-3 bg-[#111112] relative">
              <div className="flex items-center gap-2">
                <img src={ibaMascotIcon} alt="IBA Mascot" className="w-6 h-6 rounded-full object-cover" />
              </div>

              <div className="absolute left-1/2 -translate-x-1/2">
                <span className="font-bold text-white">IBA Chat</span>
              </div>

              <button
                onClick={() => setIsOpen(false)}
                className="text-white/70 hover:text-white transition-colors relative z-10"
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
                    <div className="relative w-40 h-40 mb-4">
                      {/* Glow behind */}
                      <div className="absolute inset-0 bg-[#C6F135] opacity-20 blur-xl rounded-full" />
                      <img src={ibaMascotFull} alt="IBA Assistant" className="w-full h-full object-contain relative z-10" />
                    </div>
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
                  className={`flex flex-col max-w-[85%] z-20 relative ${msg.sender === 'user' ? 'self-end items-end' : 'self-start items-start'
                    }`}
                >
                  <div
                    className={`px-4 py-2.5 rounded-2xl shadow-sm ${msg.sender === 'user'
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

      {/* Trigger: full-body mascot, no circular badge, silhouette itself is the clickable shape */}
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        whileTap={{ scale: 0.95 }}
        whileHover={
          isOpen
            ? { scale: 1.05 }
            : {
              scale: 1.05,
              filter:
                'drop-shadow(0 8px 20px rgba(0,0,0,0.35)) drop-shadow(0 0 12px rgba(198,241,53,0.6))',
            }
        }
        style={{ filter: 'drop-shadow(0 8px 20px rgba(0,0,0,0.35))' }}
        className="relative flex items-center justify-center bg-transparent border-none p-0 z-50"
        aria-label={isOpen ? 'Close chat' : 'Open chat'}
      >
        {isOpen ? (
          <div className="w-12 h-12 rounded-2xl bg-[#111112] flex items-center justify-center">
            <X className="text-[#C6F135]" size={22} />
          </div>
        ) : (
          <img
            src={ibaMascotFull}
            alt="IBA Chat"
            className="h-20 w-auto object-contain select-none"
            draggable={false}
          />
        )}
      </motion.button>
    </div>
  );
};