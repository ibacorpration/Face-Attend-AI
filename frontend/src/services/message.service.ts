import api from './api';

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
  getMessages: async (): Promise<AdminMessage[]> => {
    const res = await api.get('/messages/');
    return res.data.map((m: any) => ({
      ...m,
      status: m.isRead ? 'read' : 'unread',
      replyTimestamp: m.reply ? m.date : null
    }));
  },
  
  sendMessage: async (employeeName: string, department: string, text: string): Promise<void> => {
    await api.post('/messages/', { employeeName, department, text });
  },
  
  markAsRead: async (id: number): Promise<void> => {
    await api.put(`/messages/${id}/read`);
  },
  
  replyToMessage: async (id: number, replyText: string): Promise<void> => {
    await api.put(`/messages/${id}/reply`, { replyText });
  },

  getEmployeeReplies: async (employeeName: string): Promise<AdminMessage[]> => {
    const res = await api.get(`/messages/employee/${employeeName}`);
    return res.data.map((m: any) => ({
      ...m,
      status: m.isRead ? 'read' : 'unread',
      replyTimestamp: m.reply ? m.date : null
    }));
  },
  
  deleteMessage: async (id: number): Promise<void> => {
    await api.delete(`/messages/${id}`);
  },

  getUnreadCount: async (): Promise<number> => {
    const res = await api.get('/messages/unread-count');
    return res.data.count;
  }
};
