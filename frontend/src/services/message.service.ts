export interface AdminMessage {
  id: number;
  employeeName: string;
  department: string;
  text: string;
  date: string;
  status: 'unread' | 'read';
  reply: string | null;
  replyTimestamp: string | null;
}

export const messageService = {
  getMessages: (): AdminMessage[] => {
    const msgs = localStorage.getItem('adminMessages');
    return msgs ? JSON.parse(msgs) : [];
  },
  
  sendMessage: (employeeName: string, department: string, text: string): void => {
    const msgs = messageService.getMessages();
    msgs.push({
      id: Date.now(),
      employeeName,
      department,
      text,
      date: new Date().toISOString(),
      status: 'unread',
      reply: null,
      replyTimestamp: null
    });
    localStorage.setItem('adminMessages', JSON.stringify(msgs));
  },
  
  markAsRead: (id: number): void => {
    const msgs = messageService.getMessages();
    const index = msgs.findIndex(m => m.id === id);
    if (index !== -1) {
      msgs[index].status = 'read';
      localStorage.setItem('adminMessages', JSON.stringify(msgs));
    }
  },
  
  replyToMessage: (id: number, replyText: string): void => {
    const msgs = messageService.getMessages();
    const index = msgs.findIndex(m => m.id === id);
    if (index !== -1) {
      msgs[index].reply = replyText;
      msgs[index].replyTimestamp = new Date().toISOString();
      msgs[index].status = 'read';
      localStorage.setItem('adminMessages', JSON.stringify(msgs));
    }
  },

  getEmployeeReplies: (employeeName: string): AdminMessage[] => {
    const msgs = messageService.getMessages();
    return msgs.filter(m => m.employeeName === employeeName && m.reply !== null);
  },
  
  deleteMessage: (id: number): void => {
    let msgs = messageService.getMessages();
    msgs = msgs.filter(m => m.id !== id);
    localStorage.setItem('adminMessages', JSON.stringify(msgs));
  }
};
