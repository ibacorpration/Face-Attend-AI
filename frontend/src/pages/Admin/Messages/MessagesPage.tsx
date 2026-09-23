import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, Reply, Trash2, CheckCircle2 } from 'lucide-react';
import { messageService, AdminMessage } from '../../../services/message.service';
import { Card } from '../../../components/ui/Card';
import { Badge } from '../../../components/ui/Badge';
import { Button } from '../../../components/ui/Button';
import { toast } from 'sonner';

const MessagesPage = () => {
  const [messages, setMessages] = useState<AdminMessage[]>([]);
  const [replyingTo, setReplyingTo] = useState<number | null>(null);
  const [replyText, setReplyText] = useState('');

  const loadMessages = () => {
    // Sort so newest are first
    const msgs = messageService.getMessages().sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    setMessages(msgs);
  };

  useEffect(() => {
    loadMessages();
  }, []);

  const handleMarkAsRead = (id: number) => {
    messageService.markAsRead(id);
    loadMessages();
  };

  const handleDelete = (id: number) => {
    messageService.deleteMessage(id);
    loadMessages();
    toast.success('Message deleted');
  };

  const handleSendReply = (id: number) => {
    if (!replyText.trim()) return;
    messageService.replyToMessage(id, replyText);
    toast.success('Reply sent successfully');
    setReplyingTo(null);
    setReplyText('');
    loadMessages();
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-4xl mx-auto pb-12"
    >
      <div className="flex items-center gap-3 mb-8">
        <div className="w-12 h-12 bg-white rounded-[14px] flex items-center justify-center shadow-sm">
          <MessageSquare className="text-primary-dark" size={24} />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-text-main">Employee Messages</h1>
          <p className="text-text-secondary">Read and reply to notes left during check-in/out.</p>
        </div>
      </div>

      {messages.length === 0 ? (
        <Card className="text-center p-16 flex flex-col items-center justify-center">
          <MessageSquare className="text-slate-300 mb-4" size={48} />
          <h3 className="text-xl font-bold text-text-main mb-2">No messages yet</h3>
          <p className="text-slate-500">When employees send messages, they will appear here.</p>
        </Card>
      ) : (
        <div className="space-y-4">
          <AnimatePresence>
            {messages.map((msg) => (
              <motion.div 
                key={msg.id}
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden"
              >
                <Card className={`transition-colors ${msg.status === 'unread' ? 'border-primary/50 shadow-soft-lg ring-1 ring-primary/20' : 'opacity-80'}`}>
                  <div className="flex flex-col md:flex-row gap-6">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-bold text-lg text-text-main">{msg.employeeName}</h3>
                        <Badge variant="default" className="text-xs bg-slate-100 text-slate-600">{msg.department}</Badge>
                        {msg.status === 'unread' && <Badge variant="success" className="text-xs bg-primary text-sidebar border-none">New</Badge>}
                        {msg.reply && <Badge className="text-xs bg-green-100 text-green-700">Replied</Badge>}
                        <span className="text-xs text-slate-400 ml-auto">
                          {new Date(msg.date).toLocaleString()}
                        </span>
                      </div>
                      
                      <div className="bg-slate-50 rounded-xl p-4 text-text-secondary text-sm border border-slate-100 mb-4">
                        {msg.text}
                      </div>

                      {msg.reply && (
                        <div className="bg-primary/5 rounded-xl p-4 text-sm border border-primary/20 mb-4 flex gap-3">
                           <Reply className="text-primary mt-0.5 shrink-0" size={16} />
                           <div>
                             <p className="font-bold text-primary-dark mb-1">Your Reply <span className="text-xs font-normal text-slate-400 ml-2">{msg.replyTimestamp ? new Date(msg.replyTimestamp).toLocaleString() : ''}</span></p>
                             <p className="text-slate-600">{msg.reply}</p>
                           </div>
                        </div>
                      )}

                      {replyingTo === msg.id && !msg.reply && (
                        <motion.div 
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="mb-4"
                        >
                          <textarea
                            value={replyText}
                            onChange={(e) => setReplyText(e.target.value)}
                            placeholder={`Reply to ${msg.employeeName}...`}
                            className="w-full h-24 bg-white border border-slate-200 rounded-xl p-3 text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary resize-none transition-all"
                          />
                          <div className="flex justify-end gap-2 mt-2">
                            <Button size="sm" variant="ghost" onClick={() => { setReplyingTo(null); setReplyText(''); }}>Cancel</Button>
                            <Button size="sm" variant="primary" onClick={() => handleSendReply(msg.id)}>Send Reply</Button>
                          </div>
                        </motion.div>
                      )}

                    </div>
                    
                    <div className="flex flex-row md:flex-col justify-end gap-2 shrink-0 border-t md:border-t-0 md:border-l border-slate-100 pt-4 md:pt-0 md:pl-4">
                      {msg.status === 'unread' && (
                        <Button variant="ghost" size="sm" onClick={() => handleMarkAsRead(msg.id)} className="w-full justify-start text-slate-500 hover:text-primary">
                          <CheckCircle2 size={16} className="mr-2" /> Mark Read
                        </Button>
                      )}
                      {!msg.reply && replyingTo !== msg.id && (
                        <Button variant="ghost" size="sm" onClick={() => setReplyingTo(msg.id)} className="w-full justify-start text-slate-500 hover:text-primary">
                          <Reply size={16} className="mr-2" /> Reply
                        </Button>
                      )}
                      <Button variant="ghost" size="sm" onClick={() => handleDelete(msg.id)} className="w-full justify-start text-error hover:bg-error/10">
                        <Trash2 size={16} className="mr-2" /> Delete
                      </Button>
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </motion.div>
  );
};

export default MessagesPage;
