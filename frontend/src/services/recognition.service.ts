import api from './api';

export interface RecognitionResult {
  success: boolean;
  employee_id?: number;
  employee_code?: string;
  full_name?: string;
  department?: string;
  employee_status?: string;
  similarity_score?: number;
  status?: string; // "match", "borderline", "unknown"
  error?: string;
  liveness_passed: boolean;
  quality_passed: boolean;
  action?: string;
  message?: string;
  error_code?: string;
}

export const recognitionService = {
  verifyFace: async (imageBlob: Blob, action: 'check_in' | 'check_out' | 'auto' = 'auto'): Promise<RecognitionResult> => {
    const formData = new FormData();
    formData.append('file', imageBlob, 'frame.jpg');
    formData.append('action', action);

    const response = await api.post<RecognitionResult>('/recognition/verify', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    return response.data;
  },
};
