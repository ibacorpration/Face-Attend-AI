import api from './api';

export interface AttendanceRecord {
  id: number;
  employee_id: number;
  date: string;
  check_in: string | null;
  check_out: string | null;
  status: string;
  similarity_score: number | null;
  needs_review: boolean;
  created_at: string;
  updated_at: string;
}

export const attendanceService = {
  getDailyAttendance: async (date?: string): Promise<AttendanceRecord[]> => {
    const params = date ? { target_date: date } : {};
    const response = await api.get<AttendanceRecord[]>('/attendance/daily', { params });
    return response.data;
  },

  exportAttendance: (date?: string) => {
    const baseUrl = import.meta.env.VITE_API_BASE_URL || '/api/v1';
    let url = `${baseUrl}/attendance/export`;
    if (date) url += `?target_date=${date}`;
    
    // Using window.open for direct download if token is somehow passed in cookies, 
    // but we use Bearer token. Need to fetch as blob and trigger download.
    return api.get(url, { responseType: 'blob' }).then((response) => {
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `attendance_${date || 'export'}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    });
  }
};
