import React, { useState, useEffect } from 'react';
import { MessageSquare, Send, Reply } from 'lucide-react';
import { motion } from 'framer-motion';
import { RecognitionResult } from '../../../services/recognition.service';
import { useNavigate } from 'react-router-dom';
import { Button } from '../../../components/ui/Button';
import { toast } from 'sonner';
import { messageService, AdminMessage } from '../../../services/message.service';

interface SuccessScreenProps {
  result: RecognitionResult;
  onContinue: () => void;
}

const SuccessScreen: React.FC<SuccessScreenProps> = ({ result, onContinue }) => {
  const navigate = useNavigate();
  const [message, setMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [replies, setReplies] = useState<AdminMessage[]>([]);

  useEffect(() => {
    const fetchReplies = async () => {
      if (result.full_name) {
        try {
          const fetchedReplies = await messageService.getEmployeeReplies(result.full_name);
          setReplies(fetchedReplies);
        } catch (err) {
          console.error(err);
        }
      }
    };
    fetchReplies();
  }, [result.full_name]);

  const handleContinue = () => {
    onContinue();
    navigate('/');
  };

  const handleSendMessage = async () => {
    if (!message.trim()) return;
    setIsSending(true);

    try {
      await messageService.sendMessage(result.full_name || 'Employee', result.department || 'Staff', message);
      toast.success('Message sent to Admin');
      setMessage('');
    } catch (err) {
      console.error(err);
      toast.error('Failed to send message');
    } finally {
      setIsSending(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="min-h-screen bg-background flex flex-col items-center justify-center p-4 relative font-sans overflow-hidden"
    >
      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-primary/20 blur-[100px]" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] rounded-full bg-[#5B2A72]/10 blur-[100px]" />

      <div className="bg-[#20152F] rounded-[32px] p-10 shadow-[0_30px_60px_rgba(32,21,47,0.15)] border border-[#5B2A72]/50 w-full max-w-md text-center relative z-10 flex flex-col items-center">

        {/* Employee Image */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 200, damping: 15 }}
          className="w-24 h-24 rounded-full flex items-center justify-center mb-6 shadow-[0_0_30px_rgba(198,241,53,0.3)] overflow-hidden border-4 border-primary bg-primary/20"
        >
          {result.employee_id ? (
            <img 
              src={`/api/v1/employees/${result.employee_id}/face/image`} 
              alt={result.full_name || 'Employee'}
              className="w-full h-full object-cover"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
              }}
            />
          ) : (
            <span className="text-primary font-bold text-3xl">{result.full_name?.charAt(0) || 'E'}</span>
          )}
        </motion.div>

        <h2 className="text-primary font-bold text-lg mb-1 tracking-wide uppercase">Identity Confirmed</h2>
        <h1 className="text-3xl font-extrabold text-white mb-1 truncate w-full px-4">{result.full_name?.split(' ')[0] || 'Employee'}</h1>
        <p className="text-slate-400 text-sm font-medium mb-4">{result.department || 'Staff Member'}</p>
        
        {/* Attendance Times */}
        <div className="w-full grid grid-cols-2 gap-3 mb-6">
          <div className="bg-white/5 border border-white/10 rounded-2xl p-4 flex flex-col items-center justify-center shadow-inner">
            <span className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-1">Check In</span>
            <span className={`font-bold ${result.check_in_time ? 'text-white text-xl' : 'text-slate-500 text-sm'}`}>
              {result.check_in_time || 'Not yet'}
            </span>
          </div>
          <div className="bg-white/5 border border-white/10 rounded-2xl p-4 flex flex-col items-center justify-center shadow-inner">
            <span className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-1">Check Out</span>
            <span className={`font-bold ${result.check_out_time ? 'text-white text-xl' : (result.check_in_time ? 'text-primary text-sm' : 'text-slate-500 text-sm')}`}>
              {result.check_out_time ? result.check_out_time : (result.check_in_time ? 'Still ongoing' : 'Not yet')}
            </span>
          </div>
        </div>


        {/* Admin Replies */}
        {replies.length > 0 && (
          <div className="w-full space-y-3 mb-6">
            {replies.map((reply) => (
              <div key={reply.id} className="w-full bg-primary/10 rounded-2xl p-4 border border-primary/20 text-left">
                <div className="flex items-center gap-2 text-sm font-bold text-primary mb-2">
                  <Reply size={16} />
                  Reply from Admin
                </div>
                <p className="text-white text-sm mb-3 pl-6 border-l-2 border-white/10 ml-2">{reply.text}</p>
                <p className="text-primary-light font-medium text-sm bg-primary/10 p-3 rounded-xl">
                  {reply.reply}
                </p>
                <div className="flex justify-end mt-2">
                  <Button size="sm" variant="ghost" className="text-slate-400 hover:text-white text-xs h-7" onClick={async () => {
                    await messageService.deleteMessage(reply.id);
                    const updatedReplies = await messageService.getEmployeeReplies(result.full_name || '');
                    setReplies(updatedReplies);
                  }}>Dismiss</Button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Message to Admin */}
        <div className="w-full bg-white/5 rounded-2xl p-5 mb-8 border border-white/10 text-left">
          <label className="flex items-center gap-2 text-sm font-bold text-white mb-3">
            <MessageSquare size={16} className="text-primary" />
            Send Note to Admin
          </label>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Note..."
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
