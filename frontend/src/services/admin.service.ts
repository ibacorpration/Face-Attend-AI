import api from './api';

export interface AdminUser {
  id: number;
  username: string;
  created_at: string;
  has_face: boolean;
}

export const adminService = {
  getAdmins: async (): Promise<AdminUser[]> => {
    const res = await api.get('/admin/users');
    return res.data;
  },
  
  createAdmin: async (data: any): Promise<AdminUser> => {
    const res = await api.post('/admin/users', data);
    return res.data;
  },
  
  updatePassword: async (id: number, data: any): Promise<any> => {
    const res = await api.put(`/admin/users/${id}/password`, data);
    return res.data;
  },
  
  uploadFace: async (id: number, file: File): Promise<any> => {
    const formData = new FormData();
    formData.append('file', file);
    const res = await api.post(`/admin/users/${id}/face`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return res.data;
  }
};
