import api from './api';

export interface LoginResponse {
  access_token: string;
  token_type: string;
}

export const authService = {
  login: async (username: string, password: string):Promise<LoginResponse> => {
    const formData = new URLSearchParams();
    formData.append('username', username);
    formData.append('password', password);

    const response = await api.post<LoginResponse>('/auth/login', formData, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    });

    return response.data;
  },
  faceLogin: async (file: Blob): Promise<LoginResponse> => {
    const formData = new FormData();
    formData.append('file', file, 'face.jpg');
    
    const response = await api.post<LoginResponse>('/auth/face-login', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    
    return response.data;
  }
};
