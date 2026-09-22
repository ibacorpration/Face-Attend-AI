import api from './api';

export interface Employee {
  id: number;
  employee_code: string;
  full_name: string;
  email: string | null;
  phone: string | null;
  department: string | null;
  role: string | null;
  status: string;
  consent_given_at: string | null;
  created_at: string;
  updated_at: string;
}

export const employeeService = {
  getEmployees: async (): Promise<Employee[]> => {
    const response = await api.get<Employee[]>('/employees/');
    return response.data;
  },

  createEmployee: async (data: Partial<Employee>): Promise<Employee> => {
    const response = await api.post<Employee>('/employees/', data);
    return response.data;
  },

  updateEmployee: async (id: number, data: Partial<Employee>): Promise<Employee> => {
    const response = await api.put<Employee>(`/employees/${id}`, data);
    return response.data;
  },

  deleteEmployee: async (id: number): Promise<void> => {
    await api.delete(`/employees/${id}`);
  },

  enrollFace: async (id: number, file: Blob): Promise<void> => {
    const formData = new FormData();
    formData.append('file', file, 'face.jpg');
    await api.post(`/employees/${id}/face`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  }
};
