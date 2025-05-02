import axios from 'axios';
import { GenerateRequest, GenerateResponse } from '@/types/generate';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
});

export const generate = async (
  request: GenerateRequest
): Promise<GenerateResponse> => {
  try {
    const response = await api.post<GenerateResponse>('/api/', request);
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      return error.response.data as GenerateResponse;
    }
    return {
      success: false,
      status: 500,
      message: '시험지 생성 중 오류 발생',
      data: null,
      timestamp: new Date().toISOString(),
      path: '/api/',
    };
  }
};
