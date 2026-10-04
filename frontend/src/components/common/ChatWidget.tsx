import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Send } from 'lucide-react';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import ibaMascotFull from '../../assets/iba-mascot-full.png';
import ibaMascotIcon from '../../assets/iba-mascot-icon.png';
import ReactMarkdown from 'react-markdown';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'bot';
  timestamp: Date;
}



export const ChatWidget: React.FC = () => {
  const [isOpen, setIsOpen] = useState(() => {
    return localStorage.getItem('chat_is_open') === 'true';
  });
  const [messages, setMessages] = useState<Message[]>(() => {
    const saved = localStorage.getItem('chat_messages');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          return parsed.map((m: any) => ({
            ...m,
            timestamp: m.timestamp ? new Date(m.timestamp) : new Date()
          }));
        }
      } catch (e) {
        console.error('Failed to parse chat messages from localStorage:', e);
      }
    }
    return [];
  });
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    localStorage.setItem('chat_messages', JSON.stringify(messages));
  }, [messages]);

  useEffect(() => {
    localStorage.setItem('chat_is_open', String(isOpen));
  }, [isOpen]);

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
    // await new Promise(resolve => setTimeout(resolve, 1000));


    try {
      const botId = (Date.now() + 1).toString();

      const baseURL = import.meta.env.VITE_API_BASE_URL || '/api/v1';
      const token = localStorage.getItem('auth_token');

      const res = await fetch(`${baseURL}/chat/stream`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: JSON.stringify({ message: userMessage.text })
      });

      if (!res.ok) throw new Error('Network response was not ok');
      const reader = res.body?.getReader();
      const decoder = new TextDecoder();

      if (reader) {
        let isFirstChunk = true;
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          if (isFirstChunk) {
            setIsTyping(false);
            isFirstChunk = false;
            setMessages((prev) => [
              ...prev,
              { id: botId, text: '', sender: 'bot', timestamp: new Date() },
            ]);
          }

          const chunkStr = decoder.decode(value, { stream: true });
          const lines = chunkStr.split('\n');

          for (const line of lines) {
            if (line.startsWith('data: ')) {
              const dataStr = line.slice(6);
              if (dataStr === '[DONE]') {
                break;
              }
              try {
                const data = JSON.parse(dataStr);
                if (data.content) {
                  await new Promise(r => setTimeout(r, 25));
                  setMessages(prev => prev.map(msg =>
                    msg.id === botId ? { ...msg, text: msg.text + data.content } : msg
                  ));
                }
              } catch (e) {
              }
            }
          }
        }
      }
    } catch (error) {
      console.error('Failed to get bot response', error);
      setMessages((prev) => [
        ...prev,
        { id: Date.now().toString(), text: 'Sorry, I could not process your request right now.', sender: 'bot', timestamp: new Date() }
      ]);
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
            className="w-[calc(100vw-32px)] sm:w-[360px] h-[80vh] sm:h-[500px] bg-[#20152F] rounded-[20px] shadow-2xl mb-4 flex flex-col overflow-hidden border border-white/5"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 bg-[#150a1f] relative">
              <div className="flex items-center gap-2">
                <img src={ibaMascotIcon} alt="IBA Mascot" className="w-8 h-8 rounded-full object-cover" />
              </div>

              <div className="absolute left-1/2 -translate-x-1/2">
                <span className="font-bold text-white">IBA Chat</span>
              </div>

              <button
                onClick={() => setIsOpen(false)}
                className="text-white/70 hover:text-[#B378D3] transition-colors relative z-10"
              >
                <X size={20} />
              </button>
            </div>

            {/* Messages Area */}
            <div
              data-lenis-prevent="true"
              className="flex-1 overflow-y-auto p-4 flex flex-col gap-4 relative bg-[#20152F] hide-scrollbar"
            >
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
                      <div className="absolute inset-0 bg-[#B378D3] opacity-20 blur-xl rounded-full" />
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
                      ? 'bg-[#5B2A72] text-white rounded-br-sm'
                      : 'bg-[#2d1b40] text-white rounded-bl-sm'
                      }`}
                  >
                    {msg.sender === 'bot' ? (
                      <div className="text-sm leading-relaxed">
                        <ReactMarkdown
                          components={{
                            ul: ({ node, ...props }) => <ul className="list-disc pl-4 my-1" {...props} />,
                            ol: ({ node, ...props }) => <ol className="list-decimal pl-4 my-1" {...props} />,
                            li: ({ node, ...props }) => <li className="mb-0.5" {...props} />,
                            p: ({ node, ...props }) => <p className="mb-2 last:mb-0" {...props} />,
                            strong: ({ node, ...props }) => <strong className="font-semibold text-[#D4FF3F]" {...props} />,
                          }}
                        >
                          {msg.text}
                        </ReactMarkdown>
                      </div>
                    ) : (
                      <p className="text-sm leading-relaxed">{msg.text}</p>
                    )}
                  </div>
                </motion.div>
              ))}

              {isTyping && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="self-start bg-[#2d1b40] px-4 py-3 rounded-2xl rounded-bl-sm flex items-center gap-1.5 z-20 relative shadow-sm"
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
            <div className="bg-[#150a1f] p-3 border-t border-white/10 flex items-center gap-2 shrink-0 z-30">
              <div className="flex-1 min-w-0">
                <Input
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyDown={handleKeyPress}
                  placeholder="Type your message..."
                  className="!bg-white/5 !border-none !text-white placeholder:!text-white/40 focus-visible:!ring-1 focus-visible:!ring-[#B378D3] h-11 !pl-4 w-full"
                />
              </div>
              <Button
                onClick={handleSend}
                disabled={!inputValue.trim()}
                className="w-11 h-11 !p-0 rounded-full bg-[#5B2A72] hover:bg-[#5B2A72]/90 shrink-0 text-white flex items-center justify-center border-none"
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
                'drop-shadow(0 8px 20px rgba(0,0,0,0.35)) drop-shadow(0 0 12px rgba(179,120,211,0.6))',
            }
        }
        style={{ filter: 'drop-shadow(0 8px 20px rgba(0,0,0,0.35))' }}
        className="relative flex items-center justify-center bg-transparent border-none p-0 z-50"
        aria-label={isOpen ? 'Close chat' : 'Open chat'}
      >
        {isOpen ? (
          <div className="w-12 h-12 rounded-2xl bg-[#150a1f] flex items-center justify-center">
            <X className="text-[#B378D3]" size={22} />
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