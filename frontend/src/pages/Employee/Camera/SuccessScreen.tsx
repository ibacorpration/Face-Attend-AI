import React, { useState } from 'react';
import { CheckCircle2, User, MessageSquare, Send } from 'lucide-react';
import { motion } from 'framer-motion';
import { RecognitionResult } from '../../../services/recognition.service';
import { useNavigate } from 'react-router-dom';
import { Button } from '../../../components/ui/Button';
import { toast } from 'sonner';

interface SuccessScreenProps {
  result: RecognitionResult;
  onContinue: () => void;
}

const SuccessScreen: React.FC<SuccessScreenProps> = ({ result, onContinue }) => {
  const navigate = useNavigate();
  const [message, setMessage] = useState('');
  const [isSending, setIsSending] = useState(false);

  const handleContinue = () => {
    onContinue();
    navigate('/');
  };

  const handleSendMessage = () => {
    if (!message.trim()) return;
    setIsSending(true);
    
    // Simulate API call and save to local storage for demo purposes
    setTimeout(() => {
      const existingMessages = JSON.parse(localStorage.getItem('adminMessages') || '[]');
      existingMessages.push({
        id: Date.now(),
        employeeName: result.full_name,
        department: result.department,
        text: message,
        date: new Date().toISOString()
      });
      localStorage.setItem('adminMessages', JSON.stringify(existingMessages));
      
      toast.success('Message sent to Admin');
      setMessage('');
      setIsSending(false);
    }, 600);
  };

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="min-h-screen bg-[#0d0d0f] flex flex-col items-center justify-center p-4 relative font-sans overflow-hidden"
    >
      <div className="absolute top-[-20%] right-[-10%] w-[50%] h-[50%] rounded-full bg-primary/20 blur-[120px]" />
      <div className="absolute bottom-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-sidebar/20 blur-[100px]" />
      
      <div className="bg-sidebar rounded-[32px] p-10 shadow-2xl border border-white/10 w-full max-w-md text-center relative z-10 flex flex-col items-center">
        
        {/* Animated Checkmark */}
        <motion.div 
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 200, damping: 15 }}
          className="w-24 h-24 bg-primary/20 rounded-full flex items-center justify-center mb-6 shadow-[0_0_30px_rgba(198,241,53,0.3)]"
        >
          <CheckCircle2 className="text-primary" size={48} />
        </motion.div>

        <h2 className="text-primary font-bold text-lg mb-1 tracking-wide uppercase">Identity Confirmed</h2>
        <h1 className="text-3xl font-extrabold text-white mb-1 truncate w-full px-4">{result.full_name?.split(' ')[0] || 'Employee'}</h1>
        <p className="text-slate-400 text-sm font-medium mb-8">{result.department || 'Staff Member'}</p>

        {/* Message to Admin */}
        <div className="w-full bg-white/5 rounded-2xl p-5 mb-8 border border-white/10 text-left">
          <label className="flex items-center gap-2 text-sm font-bold text-white mb-3">
            <MessageSquare size={16} className="text-primary" />
            Send Note to Admin
          </label>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Running late, forgot ID badge, etc..."
            className="w-full h-24 bg-black/50 border border-white/10 rounded-xl p-3 text-white text-sm placeholder:text-slate-500 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary resize-none transition-all"
          />
          <div className="mt-3 flex justify-end">
            <Button 
              size="sm" 
              onClick={handleSendMessage} 
              disabled={!message.trim() || isSending}
              className="bg-white/10 text-white hover:bg-white/20 border-0"
            >
              {isSending ? 'Sending...' : (
                <span className="flex items-center gap-2">
                  <Send size={14} /> Send
                </span>
              )}
            </Button>
          </div>
        </div>

        <Button 
          onClick={handleContinue}
          className="w-full h-14 bg-primary text-sidebar hover:bg-primary-light text-lg font-bold"
        >
          Done
        </Button>
      </div>
    </motion.div>
  );
};

export default SuccessScreen;
